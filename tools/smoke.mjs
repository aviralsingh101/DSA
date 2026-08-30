// Dev-time DOM smoke test (not part of the site).
// Loads pages in jsdom, executes the real scripts, and asserts the shell built.
// Run: node tools/smoke.mjs [relative-page ...]
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { JSDOM, VirtualConsole } from "jsdom";

const ROOT = path.resolve(import.meta.dirname, "..");

// jsdom cannot rasterise SVG, so mermaid's own promises may reject in here.
// Record them instead of crashing the run.
const stray = [];
process.on("unhandledRejection", (r) => {
  stray.push(String((r && (r.stack || r.message)) || r).split("\n")[0]);
});

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === "tools" || name === "assets" || name === "node_modules") continue;
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

const argv = process.argv.slice(2);
const files = argv.length
  ? argv.map((a) => path.resolve(ROOT, a))
  : walk(ROOT).sort();

let failed = 0;

for (const file of files) {
  const r = path.relative(ROOT, file).replace(/\\/g, "/");
  const messages = [];
  const vc = new VirtualConsole();
  vc.on("jsdomError", (e) => {
    // mermaid needs real browser graphics APIs; its own failure is tolerated
    // because app.js wraps rendering in try/catch and falls back.
    const s = String(e && (e.stack || e.message));
    if (/mermaid/i.test(s)) return;
    messages.push("jsdomError: " + s.split("\n").slice(0, 4).join(" | "));
  });
  vc.on("error", (m) => messages.push("console.error: " + m));

  let dom;
  try {
    dom = await JSDOM.fromFile(file, {
      runScripts: "dangerously",
      resources: "usable",
      url: pathToFileURL(file).href,
      pretendToBeVisual: true,
      virtualConsole: vc,
      beforeParse(win) {
        // jsdom lacks a few APIs mermaid needs; every target browser has them.
        if (!win.structuredClone) {
          win.structuredClone = (v) => JSON.parse(JSON.stringify(v));
        }
        if (!win.matchMedia) {
          win.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {},
            addEventListener() {}, removeEventListener() {} });
        }
      },
    });
  } catch (e) {
    console.log(`FAIL ${r}\n     could not load: ${e.message}`);
    failed++;
    continue;
  }

  // scripts are loaded async by jsdom; wait for load + a tick
  await new Promise((res) => {
    if (dom.window.document.readyState === "complete") res();
    else dom.window.addEventListener("load", res);
    setTimeout(res, 8000);
  });
  await new Promise((res) => setTimeout(res, 250));

  const d = dom.window.document;
  const errs = [];

  const navlinks = d.querySelectorAll(".sidebar .navlink").length;
  if (navlinks < 50) errs.push(`sidebar built only ${navlinks} links`);

  if (!d.querySelector(".sidebar__search")) errs.push("no search box");
  if (!d.querySelector("#topbar .crumb")) errs.push("no breadcrumb");
  if (!d.querySelector("#theme-toggle")) errs.push("no theme toggle");

  const topicId = d.body.getAttribute("data-topic-id");
  const isLesson = r.startsWith("modules/");
  if (topicId) {
    if (!d.querySelector(".navlink.is-active")) errs.push("no active nav link");
    if (isLesson && !d.querySelector(".prevnext__card")) errs.push("prevnext not populated");
    const toc = d.querySelectorAll("#toc .toc__link").length;
    if (isLesson && toc < 8) errs.push(`TOC only has ${toc} entries`);

    // every viz player must have initialised
    for (const p of d.querySelectorAll(".viz-player")) {
      if (p.getAttribute("data-viz-ready") !== "1") {
        errs.push(`viz-player[${p.getAttribute("data-viz-target")}] did not initialise`);
        continue;
      }
      if (!p.querySelector(".viz-player__controls")) errs.push("player has no controls");
      const counter = p.querySelector(".viz-player__counter");
      if (!counter || !/^1 \/ \d+$/.test(counter.textContent)) {
        errs.push(`player counter unexpected: "${counter && counter.textContent}"`);
      }
      const note = p.querySelector(".viz-player__note");
      if (!note || note.textContent.trim().length < 5) errs.push("player note empty on frame 1");

      const target = d.querySelector(`[data-viz-id="${p.getAttribute("data-viz-target")}"]`);
      if (target.classList.contains("dp-grid")) {
        if (!target.querySelector(".dp-cell")) errs.push("dp-grid produced no cells");
      } else if (!target.querySelector(".cell")) {
        errs.push("array-viz produced no cells");
      }
    }

    // tabs: exactly one active panel per group
    for (const g of d.querySelectorAll(".tabs")) {
      const active = g.querySelectorAll(".tabs__panel.is-active").length;
      if (active !== 1) errs.push(`tab group has ${active} active panels`);
    }

    // highlighted code blocks must have produced line spans
    for (const c of d.querySelectorAll(".code[data-highlight]")) {
      if (!c.querySelector(".code__line--hi")) errs.push("data-highlight produced no highlight");
    }
  }

  // headings must all have ids after TOC build (anchorable)
  for (const h of d.querySelectorAll("main h2, main h3")) {
    if (!h.id) errs.push(`heading without id: "${h.textContent.slice(0, 40)}"`);
  }

  // mermaid must have captured its source so theme switching can re-render
  for (const m of d.querySelectorAll(".mermaid")) {
    if (!m.getAttribute("data-mermaid-src")) errs.push("mermaid source not captured");
  }

  const all = [...messages, ...errs];
  if (all.length) {
    failed++;
    console.log(`FAIL ${r}`);
    for (const m of all) console.log("     - " + m);
  } else {
    console.log(`ok   ${r}`);
  }
  dom.window.close();
}

console.log(failed ? `\n${failed} page(s) failed` : `\nall ${files.length} page(s) ok`);
process.exitCode = failed ? 1 : 0;

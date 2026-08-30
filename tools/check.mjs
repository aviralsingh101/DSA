// Dev-time QA script (not part of the site). Run: node tools/check.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

function readNav() {
  const src = fs.readFileSync(path.join(ROOT, "assets/js/nav-data.js"), "utf8");
  const window = {};
  new Function("window", src)(window);
  return window.NAV_DATA;
}

const NAV = readNav();
const flat = [];
for (const m of NAV) for (const t of m.topics) flat.push({ m, t });

const byTopicId = new Map(flat.map((e) => [e.t.id, e]));

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === "tools" || name === "assets" || name === "node_modules") continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

const problems = [];
const warnings = [];
const files = walk(ROOT).sort();

function rel(p) { return path.relative(ROOT, p).replace(/\\/g, "/"); }

// ---------------------------------------------------------------- per file
const seenTopicIds = new Set();

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  const r = rel(file);
  const depth = r.split("/").length - 1;
  const up = depth === 0 ? "" : "../".repeat(depth);
  const err = (msg) => problems.push(`${r}: ${msg}`);
  const warn = (msg) => warnings.push(`${r}: ${msg}`);

  // required asset references at the correct depth
  for (const asset of [
    "assets/css/theme.css",
    "assets/css/components.css",
    "assets/css/print.css",
    "assets/vendor/mermaid.min.js",
    "assets/js/nav-data.js",
    "assets/js/viz.js",
    "assets/js/app.js",
  ]) {
    if (!src.includes(`"${up}${asset}"`)) err(`missing or wrong-depth asset ref: ${up}${asset}`);
  }

  // forbidden things for file:// operation
  if (/\bfetch\s*\(/.test(src)) err("uses fetch()");
  if (/type=["']module["']/.test(src)) err("uses type=module");
  if (/(href|src)=["']\/[^/]/.test(src)) err("uses root-absolute path");
  if (/XMLHttpRequest/.test(src)) err("uses XMLHttpRequest");

  // shell elements
  for (const need of ['id="sidebar"', 'id="topbar"', 'id="toc"', "<main"]) {
    if (!src.includes(need)) err(`missing shell element: ${need}`);
  }

  // topic id wiring
  const idm = src.match(/<body class="page" data-topic-id="([^"]*)"/);
  if (!idm) err("missing body.page[data-topic-id]");
  else {
    const id = idm[1];
    if (id) {
      if (!byTopicId.has(id)) err(`data-topic-id "${id}" not present in nav-data.js`);
      else {
        const e = byTopicId.get(id);
        const expected = (e.m.dir ? e.m.dir + "/" : "") + e.t.file;
        if (expected !== r) err(`data-topic-id "${id}" maps to ${expected} but file is ${r}`);
        if (seenTopicIds.has(id)) err(`duplicate data-topic-id "${id}"`);
        seenTopicIds.add(id);
      }
    }
  }

  // JSON frames must parse
  const frameBlocks = [...src.matchAll(
    /<script type="application\/json" class="viz-frames">([\s\S]*?)<\/script>/g
  )];
  for (const [, body] of frameBlocks) {
    try {
      const data = JSON.parse(body);
      if (!Array.isArray(data.frames) || !data.frames.length) err("viz-frames has no frames");
    } catch (e) {
      err(`viz-frames JSON parse error: ${e.message}`);
    }
  }

  // viz-player <-> viz target pairing
  const targets = [...src.matchAll(/data-viz-target="([^"]+)"/g)].map((m) => m[1]);
  const ids = [...src.matchAll(/data-viz-id="([^"]+)"/g)].map((m) => m[1]);
  for (const t of targets) if (!ids.includes(t)) err(`viz-player target "${t}" has no data-viz-id`);
  for (const i of ids) if (!targets.includes(i)) warn(`data-viz-id "${i}" has no player`);

  // Lesson pages live under modules/. Hub pages (pattern index, toolkit,
  // drills, cheat-sheet index) have a data-topic-id but not the 14-section skeleton.
  const isTopic = !!(idm && idm[1]) && r.startsWith("modules/");
  if (isTopic) {
    if (!/<section class="hero">/.test(src)) err("missing .hero");
    if (!/<section class="recognise">/.test(src)) err("missing .recognise");
    if (!/class="stepper"/.test(src)) err("missing .stepper");
    if (!/class="trace-table"/.test(src)) err("missing .trace-table");
    if (!/class="tabs"/.test(src)) err("missing .tabs");
    if (!/class="complexity"/.test(src)) err("missing .complexity");
    if (!/class="pitfalls"/.test(src)) err("missing .pitfalls");
    if (!/class="variants"/.test(src)) err("missing .variants");
    if (!/class="followups"/.test(src)) err("missing .followups");
    if (!/class="problems"/.test(src)) err("missing .problems");
    if (!/class="recap"/.test(src)) err("missing .recap");
    if (!/class="prevnext"/.test(src)) err("missing .prevnext");
    if (!/class="spoiler"/.test(src)) err("missing .spoiler");
    if (!frameBlocks.length) err("no viz-player frames");
    if (!/class="mermaid"/.test(src)) err("no mermaid diagram");

    const pitfallItems = (src.match(/class="pitfalls__title"/g) || []).length;
    if (pitfallItems < 5) err(`only ${pitfallItems} pitfalls (need >= 5)`);

    const followups = (src.match(/<details class="followup"/g) || []).length;
    if (followups < 4) err(`only ${followups} follow-ups (need >= 4)`);

    const variantRows = (src.match(/<table class="variants">[\s\S]*?<\/table>/) || [""])[0];
    const vRows = (variantRows.match(/<tr>/g) || []).length - 1;
    if (vRows < 3) err(`only ${vRows} variant rows (need >= 3)`);

    const probTable = (src.match(/<table class="problems">[\s\S]*?<\/table>/) || [""])[0];
    const pRows = (probTable.match(/<tr><td>/g) || []).length;
    if (pRows < 8) err(`only ${pRows} practice problems (need 8-12)`);
  }

  // figures need captions
  const figs = [...src.matchAll(/<figure class="viz"[\s\S]*?<\/figure>/g)];
  for (const [f] of figs) if (!f.includes("<figcaption>")) err("a figure.viz has no figcaption");

  // mermaid rule checks
  for (const [, body] of src.matchAll(/<div class="mermaid"[^>]*>([\s\S]*?)<\/div>/g)) {
    if (/\b(style|classDef|linkStyle)\b/.test(body)) err("mermaid uses forbidden style/classDef");
    if (/:::/.test(body)) err("mermaid uses ::: class syntax");
    if (/&[a-z]+;/.test(body.replace(/&lt;|&gt;|&amp;|&quot;|&nbsp;|&minus;|&rarr;/g, ""))) {
      warn("mermaid label may contain an HTML entity");
    }
    for (const line of body.split("\n")) {
      const m = line.match(/^\s*(end|graph|subgraph|flowchart|class|state)\s*[\[({]/);
      if (m) err(`mermaid uses reserved word as node id: ${m[1]}`);
    }
  }

  // internal link targets exist
  for (const [, href] of src.matchAll(/href="((?!https?:|#|mailto:)[^"]+)"/g)) {
    if (href.startsWith("data:")) continue;
    if (/['+]/.test(href)) continue; // built at runtime by an inline script
    const clean = href.split("#")[0];
    if (!clean) continue;
    const target = path.resolve(path.dirname(file), clean);
    if (!fs.existsSync(target)) err(`broken internal link: ${href}`);
  }
}

// ------------------------------------------------------------- nav coverage
const missing = [];
for (const { m, t } of flat) {
  const p = path.join(ROOT, m.dir ? m.dir : "", t.file);
  if (!fs.existsSync(p)) missing.push((m.dir ? m.dir + "/" : "") + t.file);
}

// --------------------------------------------------------------------- out
console.log(`checked ${files.length} html files, ${flat.length} nav topics`);
if (missing.length) {
  console.log(`\nNOT YET BUILT (${missing.length}):`);
  for (const m of missing) console.log("  - " + m);
}
if (warnings.length) {
  console.log(`\nWARNINGS (${warnings.length}):`);
  for (const w of warnings) console.log("  ! " + w);
}
if (problems.length) {
  console.log(`\nERRORS (${problems.length}):`);
  for (const p of problems) console.log("  x " + p);
  process.exitCode = 1;
} else {
  console.log("\nno errors");
}

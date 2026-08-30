// Dev-time page generator (not part of the site).
// Emits plain static HTML that follows the 14-section skeleton exactly.
// Run: node tools/gen.mjs [moduleId ...]
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

/* ------------------------------------------------------------------ utils */

export function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function up(depth) { return "../".repeat(depth); }

const ICON = {
  idea: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>',
  key: '<path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/>',
  warn: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  pitfall: '<path d="M12 9v4M12 17h.01"/><circle cx="12" cy="12" r="10"/>',
  math: '<path d="M4 4h16M9 4l6 16M15 4L9 20"/>',
  tip: '<path d="M20 6L9 17l-5-5"/>',
};

const CALLOUT_TITLE = {
  idea: "The insight", key: "The invariant", warn: "Careful",
  pitfall: "Trap", math: "The maths", tip: "Useful to know",
};

function callout(kind, title, bodyHtml) {
  const t = title === null ? "" :
    `<span class="callout__title">${title || CALLOUT_TITLE[kind]}</span>\n    `;
  return `<aside class="callout callout--${kind}">
  <div class="callout__icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[kind]}</svg></div>
  <div class="callout__body">
    ${t}${bodyHtml}
  </div>
</aside>`;
}

function paras(list) {
  return (list || []).map((p) => (/^\s*<(p|ul|ol|div|table|figure|aside|pre)/.test(p) ? p : `<p>${p}</p>`)).join("\n");
}

/* --------------------------------------------------------------- sections */

function heroSection(t, mod, depth) {
  const prereq = (t.prereqs || []).length
    ? `\n    <span class="hero__prereq">Prerequisites:\n      ${(t.prereqs)
        .map(([label, href]) => `<a href="${href}">${label}</a>`).join(",\n      ")}\n    </span>`
    : "";
  const tags = (t.tags || []).map((x) => `<span class="chip">${esc(x)}</span>`).join("\n      ");
  const diff = (t.difficulty || "Medium").toLowerCase();
  return `<section class="hero">
  <span class="hero__chip">Module ${mod.num} &middot; ${mod.title}</span>
  <h1>${t.h1 || t.navTitle}</h1>
  <p class="hero__tagline">${t.tagline}</p>
  <div class="hero__meta">
    <span class="pill pill--${diff}">${t.difficulty || "Medium"}</span>
    <span class="hero__time">${t.readTime || "20 min"} read</span>${prereq}
    <span class="hero__tags">
      ${tags}
    </span>
  </div>
</section>`;
}

function whySection(t) {
  return `<h2>Why this exists</h2>
${paras(t.why.paras)}

${callout("idea", t.why.insightTitle || null, paras([t.why.insight]))}`;
}

function recogniseSection(t) {
  const r = t.recognise;
  const li = (xs) => xs.map((x) => `        <li>${x}</li>`).join("\n");
  const rows = r.table.map(([a, b, c]) =>
    `      <tr>\n        <td>${a}</td>\n        <td>${b}</td>\n        <td>${c}</td>\n      </tr>`).join("\n");
  return `<section class="recognise">
  <h2>Recognise this pattern</h2>
  <div class="recognise__cols">
    <div class="recognise__col recognise__col--yes">
      <h3>Say yes when you see</h3>
      <ul>
${li(r.yes)}
      </ul>
    </div>
    <div class="recognise__col recognise__col--no">
      <h3>Not this pattern when</h3>
      <ul>
${li(r.no)}
      </ul>
    </div>
  </div>

  <table class="recognise__table">
    <thead>
      <tr><th>Signal in the statement</th><th>What it means</th><th>Reach for</th></tr>
    </thead>
    <tbody>
${rows}
    </tbody>
  </table>

  <p class="recognise__constraints"><strong>Constraint tell:</strong> ${r.constraint}</p>
</section>`;
}

function coreSection(t) {
  const extras = (t.core.extra || [])
    .map((e) => callout(e.kind, e.title, paras([e.html]))).join("\n\n");
  return `<h2>${t.core.heading || "Core idea and the invariant"}</h2>
${paras(t.core.paras)}

${callout("key", t.core.invariantTitle || null, paras([t.core.invariant]))}${extras ? "\n\n" + extras : ""}`;
}

function vizFigure(v) {
  const cls = v.kind === "grid" ? "dp-grid" : "array-viz";
  const json = JSON.stringify(v.data, null, 2)
    .split("\n").map((l) => "    " + l).join("\n");
  return `<figure class="viz">
  <div class="${cls}" data-viz-id="${v.vizId}"></div>
  <div class="viz-player" data-viz-target="${v.vizId}">
    <script type="application/json" class="viz-frames">
${json}
    </script>
  </div>
  <figcaption>${v.caption}</figcaption>
</figure>`;
}

function mermaidFigure(v) {
  return `<figure class="viz${v.wide ? " bleed-wide" : ""}">
  <div class="mermaid">
${esc(v.src.trim())}
  </div>
  <figcaption>${v.caption}</figcaption>
</figure>`;
}

function visualsSection(t) {
  const out = [`<h2>Visual walkthrough</h2>`];
  for (const v of t.visuals) {
    if (v.h3) out.push(`<h3>${v.h3}</h3>`);
    if (v.intro) out.push(paras([v.intro]));
    out.push(v.kind === "mermaid" ? mermaidFigure(v) : vizFigure(v));
  }
  return out.join("\n\n");
}

function stepsSection(t) {
  return `<h2>Algorithm</h2>
<ol class="stepper">
${t.steps.map((s) => `  <li>${s}</li>`).join("\n")}
</ol>`;
}

function dryRunSection(t) {
  const d = t.dryRun;
  const head = d.cols.map((c) => `<th>${c}</th>`).join("");
  const rows = d.rows.map((r) => {
    const cls = r.change ? ' class="trace-table__row--change"' : "";
    const cells = r.cells.map((c) => `<td>${c}</td>`).join("");
    return `      <tr${cls}>${cells}<td>${r.action}</td></tr>`;
  }).join("\n");
  const after = d.after ? "\n\n" + d.after : "";
  return `<h2>Dry run</h2>
${paras([d.intro])}

<div class="table-scroll">
  <table class="trace-table">
    <thead>
      <tr>${head}<th>Action / why</th></tr>
    </thead>
    <tbody>
${rows}
    </tbody>
  </table>
</div>${after}`;
}

function codeBlock(c) {
  const hi = c.highlight ? ` data-highlight="${c.highlight}"` : "";
  return `<div class="code"${hi}>
  <div class="code__bar"><span class="code__lang">Java</span><span class="code__file">${c.file}</span><button class="code__copy" aria-label="Copy code">Copy</button></div>
<pre><code>${esc(c.code.trim())}</code></pre>
</div>`;
}

function codeSection(t) {
  const tabs = t.code.map((c, i) =>
    `    <button class="tabs__tab${i === 0 ? " is-active" : ""}" role="tab" aria-selected="${i === 0}" data-tab="t${i}">${c.tab}</button>`
  ).join("\n");
  const panels = t.code.map((c, i) => `  <div class="tabs__panel${i === 0 ? " is-active" : ""}" data-panel="${c.panel || c.tab}">
${c.intro ? paras([c.intro]).split("\n").map((l) => "    " + l).join("\n") + "\n" : ""}${codeBlock(c).split("\n").map((l) => "    " + l).join("\n")}
  </div>`).join("\n\n");
  return `<h2>Java implementation</h2>

<div class="tabs">
  <div class="tabs__list" role="tablist" aria-label="${t.navTitle} implementations">
${tabs}
  </div>

${panels}
</div>`;
}

function complexitySection(t) {
  const c = t.complexity;
  const extraBadges = (c.badges || [])
    .map((b) => `\n    <span class="badge">${b}</span>`).join("");
  const rows = c.compare.map(([a, b, d, e]) =>
    `      <tr><td>${a}</td><td>${b}</td><td>${d}</td><td>${e}</td></tr>`).join("\n");
  return `<h2>Complexity</h2>

<div class="complexity">
  <div class="complexity__badges">
    <span class="badge badge--time">Time ${c.time}</span>
    <span class="badge badge--space">Space ${c.space}</span>${extraBadges}
  </div>

  <div class="complexity__derivation">
${paras(c.derivation).split("\n").map((l) => "    " + l).join("\n")}
  </div>

  <table class="complexity__compare">
    <thead>
      <tr><th>Approach</th><th>Time</th><th>Space</th><th>When it is enough</th></tr>
    </thead>
    <tbody>
${rows}
    </tbody>
  </table>
</div>`;
}

function pitfallsSection(t) {
  const items = t.pitfalls.map((p) => `  <li>
    <span class="pitfalls__title">${p.title}</span>
    <div class="pitfalls__bug">${p.bug}</div>
    <div class="pitfalls__fix">${p.fix}</div>
  </li>`).join("\n");
  return `<h2>Edge cases and pitfalls</h2>

<ul class="pitfalls">
${items}
</ul>`;
}

function variantsSection(t) {
  const rows = t.variants.map(([n, w, d, e]) => `      <tr>
        <td>${n}</td>
        <td>${w}</td>
        <td><code>${esc(d)}</code></td>
        <td>${e}</td>
      </tr>`).join("\n");
  return `<h2>Variants</h2>

<div class="table-scroll">
  <table class="variants">
    <thead>
      <tr><th>Variant</th><th>What changes</th><th>Code delta</th><th>Example</th></tr>
    </thead>
    <tbody>
${rows}
    </tbody>
  </table>
</div>`;
}

function followupsSection(t) {
  const items = t.followups.map(([q, a]) => `  <details class="followup">
    <summary>${q}</summary>
    <div class="followup__body">
${paras([a]).split("\n").map((l) => "      " + l).join("\n")}
    </div>
  </details>`).join("\n\n");
  return `<h2>Interview follow-ups</h2>

<div class="followups">
${items}
</div>`;
}

const BADGE_CLASS = { lc: "badge--lc", cf: "badge--cf", gfg: "badge--gfg", atc: "badge--atc" };

function problemsSection(t) {
  const rows = t.problems.map((p, i) => `      <tr><td>${i + 1}</td>
        <td><a href="${p.url}" target="_blank" rel="noopener">${p.name}</a></td>
        <td><span class="badge ${BADGE_CLASS[p.badge] || "badge--lc"}">${p.tag}</span></td>
        <td><span class="pill pill--${p.level.toLowerCase()}">${p.level}</span></td>
        <td>${p.pattern}</td></tr>`).join("\n");
  const spoilers = (t.spoilers || []).map((s) => `<details class="spoiler">
  <summary>${s.summary}</summary>
  <div class="spoiler__body">
${paras([s.body]).split("\n").map((l) => "    " + l).join("\n")}
  </div>
</details>`).join("\n\n");
  return `<h2>Practice</h2>
${paras([t.problemsIntro || "Work down the list; it is ordered easy to hard on purpose."])}

<div class="table-scroll">
  <table class="problems">
    <thead>
      <tr><th>#</th><th>Problem</th><th>Platform</th><th>Level</th><th>Pattern used</th></tr>
    </thead>
    <tbody>
${rows}
    </tbody>
  </table>
</div>

${spoilers}`;
}

function recapSection(t) {
  return `<div class="recap">
  <h2>Recap</h2>
  <ul>
${t.recap.bullets.map((b) => `    <li>${b}</li>`).join("\n")}
  </ul>
  <div class="recap__oneliner">${esc(t.recap.oneliner)}</div>
</div>

<div class="prevnext"></div>`;
}

/* ------------------------------------------------------------------ page */

export function renderPage(t, mod, depth) {
  const u = up(depth);
  const body = [
    "<!-- ============================================================ 1. HERO -->",
    heroSection(t, mod, depth),
    "\n<!-- ================================================== 2. WHY THIS EXISTS -->",
    whySection(t),
    "\n<!-- ============================================ 3. RECOGNISE THIS PATTERN -->",
    recogniseSection(t),
    "\n<!-- ============================================ 4. CORE IDEA & INVARIANT -->",
    coreSection(t),
    "\n<!-- ============================================= 5. VISUAL WALKTHROUGH -->",
    visualsSection(t),
    "\n<!-- ======================================================= 6. ALGORITHM -->",
    stepsSection(t),
    "\n<!-- ========================================================= 7. DRY RUN -->",
    dryRunSection(t),
    "\n<!-- ============================================ 8. JAVA IMPLEMENTATION -->",
    codeSection(t),
    "\n<!-- ======================================================= 9. COMPLEXITY -->",
    complexitySection(t),
    "\n<!-- ============================================ 10. EDGE CASES & PITFALLS -->",
    pitfallsSection(t),
    "\n<!-- ======================================================= 11. VARIANTS -->",
    variantsSection(t),
    "\n<!-- =============================================== 12. INTERVIEW FOLLOW-UPS -->",
    followupsSection(t),
    "\n<!-- ======================================================= 13. PRACTICE -->",
    problemsSection(t),
    "\n<!-- ========================================================= 14. RECAP -->",
    recapSection(t),
  ].join("\n");

  return `<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${t.navTitle.replace(/&/g, "&amp;")} &mdash; DSA Course</title>
<meta name="description" content="${t.tagline.replace(/<[^>]+>/g, "").replace(/"/g, "&quot;").slice(0, 180)}">
<link rel="stylesheet" href="${u}assets/css/theme.css">
<link rel="stylesheet" href="${u}assets/css/components.css">
<link rel="stylesheet" href="${u}assets/css/print.css" media="print">
</head>
<body class="page" data-topic-id="${t.id}">
  <aside id="sidebar" class="sidebar"></aside>
  <div class="shell">
    <header id="topbar" class="topbar"></header>
    <main class="content">

${body}

    </main>
  </div>
  <nav id="toc" class="toc"></nav>

  <script src="${u}assets/vendor/mermaid.min.js"></script>
  <script src="${u}assets/js/nav-data.js"></script>
  <script src="${u}assets/js/viz.js"></script>
  <script src="${u}assets/js/app.js"></script>
</body>
</html>
`;
}

/* ------------------------------------------------------------------- main */

function readNav() {
  const src = fs.readFileSync(path.join(ROOT, "assets/js/nav-data.js"), "utf8");
  const w = {};
  new Function("window", src)(w);
  return w.NAV_DATA;
}

const NAV = readNav();
const modById = new Map(NAV.map((m) => [m.id, m]));
const topicMeta = new Map();
for (const m of NAV) for (const t of m.topics) topicMeta.set(t.id, { mod: m, topic: t });

const wanted = process.argv.slice(2);
const contentDir = path.join(import.meta.dirname, "content");
const contentFiles = fs.existsSync(contentDir)
  ? fs.readdirSync(contentDir).filter((f) => f.endsWith(".mjs")).sort()
  : [];

let written = 0;
for (const cf of contentFiles) {
  const stem = cf.replace(/\.mjs$/, "");
  const modId = (stem.match(/^m\d+/) || [])[0] || stem;
  if (wanted.length && !wanted.some((w) => w === stem || w === modId || stem.startsWith(w + "-"))) continue;
  const mod = modById.get(modId);
  if (!mod) { console.log(`skip ${cf}: no module ${modId} in nav-data`); continue; }

  const { topics } = await import("file://" + path.join(contentDir, cf));
  for (const t of topics) {
    const meta = topicMeta.get(t.id);
    if (!meta) { console.log(`  ! ${t.id} is not in nav-data.js`); continue; }
    t.navTitle = t.navTitle || meta.topic.title;
    t.difficulty = t.difficulty || "Medium";
    const relPath = (mod.dir ? mod.dir + "/" : "") + meta.topic.file;
    const depth = relPath.split("/").length - 1;
    const outPath = path.join(ROOT, relPath);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, renderPage(t, mod, depth), "utf8");
    written++;
    console.log("  + " + relPath);
  }
}
console.log(`\nwrote ${written} page(s)`);

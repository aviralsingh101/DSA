// Dev-time readability gate (not part of the site).
// The course is for someone meeting an algorithm for the FIRST time, so the
// teaching prose has minimum lengths. Terse reference-note style fails here.
// Run: node tools/prose.mjs [m06 m10 ...]        --list to see per-field detail
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const contentDir = path.join(import.meta.dirname, "content");

const args = process.argv.slice(2);
const detail = args.includes("--list");
const wanted = args.filter((a) => !a.startsWith("--"));

/** Visible words only: strip tags, decode the few entities we author with. */
function words(html) {
  if (html == null) return 0;
  const text = String(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, "x")
    .replace(/\s+/g, " ")
    .trim();
  return text ? text.split(" ").length : 0;
}

const MIN = {
  whyPara: 55,        // each "Why this exists" paragraph
  whyTotal: 220,      // the section as a whole
  insight: 30,        // the one-insight callout
  corePara: 55,       // each "Core idea" paragraph
  coreTotal: 220,
  invariant: 45,      // formal sentence + plain-English gloss
  step: 18,           // each numbered step says WHY, not just what
  pitfallBug: 20,
  pitfallFix: 15,
  followup: 45,       // an answer, not a fragment
  derivation: 80,     // spell the arithmetic out
  constraint: 30,
  dryIntro: 20,
  frameNote: 9,       // each visual frame narrates its step
};

const MIN_PARAS = { why: 3, core: 3 };

const files = fs
  .readdirSync(contentDir)
  .filter((f) => /^m\d+\.mjs$/.test(f))
  .sort()
  .filter((f) => !wanted.length || wanted.includes(f.replace(/\.mjs$/, "")));

let totalTopics = 0;
let failTopics = 0;
const summary = [];

for (const file of files) {
  const { topics } = await import("file://" + path.join(contentDir, file));
  for (const t of topics) {
    totalTopics++;
    const bad = [];
    const push = (label, got, min) => {
      if (got < min) bad.push(`${label} ${got}w < ${min}w`);
    };

    const why = t.why?.paras || [];
    if (why.length < MIN_PARAS.why) bad.push(`why has ${why.length} paras < ${MIN_PARAS.why}`);
    why.forEach((p, i) => push(`why[${i}]`, words(p), MIN.whyPara));
    push("why total", why.reduce((s, p) => s + words(p), 0), MIN.whyTotal);
    push("insight", words(t.why?.insight), MIN.insight);

    const core = t.core?.paras || [];
    if (core.length < MIN_PARAS.core) bad.push(`core has ${core.length} paras < ${MIN_PARAS.core}`);
    core.forEach((p, i) => push(`core[${i}]`, words(p), MIN.corePara));
    push("core total", core.reduce((s, p) => s + words(p), 0), MIN.coreTotal);
    push("invariant", words(t.core?.invariant), MIN.invariant);

    (t.steps || []).forEach((s, i) => push(`step[${i}]`, words(s), MIN.step));
    (t.pitfalls || []).forEach((p, i) => {
      push(`pitfall[${i}].bug`, words(p.bug), MIN.pitfallBug);
      push(`pitfall[${i}].fix`, words(p.fix), MIN.pitfallFix);
    });
    (t.followups || []).forEach(([, a], i) => push(`followup[${i}]`, words(a), MIN.followup));

    push("derivation", (t.complexity?.derivation || []).reduce((s, p) => s + words(p), 0), MIN.derivation);
    push("constraint", words(t.recognise?.constraint), MIN.constraint);
    push("dryRun.intro", words(t.dryRun?.intro), MIN.dryIntro);

    for (const v of t.visuals || []) {
      (v.data?.frames || []).forEach((f, i) => push(`${v.vizId}.frame[${i}]`, words(f.note), MIN.frameNote));
    }

    if (bad.length) {
      failTopics++;
      summary.push({ file, id: t.id, bad });
    }
  }
}

for (const s of summary) {
  console.log(`\n${s.file} :: ${s.id}  (${s.bad.length} thin field${s.bad.length === 1 ? "" : "s"})`);
  const shown = detail ? s.bad : s.bad.slice(0, 6);
  for (const b of shown) console.log("   - " + b);
  if (!detail && s.bad.length > shown.length) console.log(`   ... ${s.bad.length - shown.length} more (--list)`);
}

console.log(`\n${totalTopics - failTopics}/${totalTopics} topics read like a first-time explanation`);
if (failTopics) {
  console.log(`${failTopics} topic(s) still too compressed`);
  process.exitCode = 1;
}

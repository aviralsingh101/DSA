// Print the current teaching-prose fields of one topic (or a whole module)
// so a rewrite can be done without scrolling the source file.
// Usage: node tools/dump.mjs m00 complexity-analysis
//        node tools/dump.mjs m00            -- every topic, compact
import path from "node:path";

const [mod, topicId] = process.argv.slice(2);
if (!mod) {
  console.error("usage: node tools/dump.mjs m00 [topic-id]");
  process.exit(1);
}

const { topics } = await import(
  "file://" + path.join(import.meta.dirname, "content", mod + ".mjs")
);

function w(html) {
  const text = String(html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, "x")
    .replace(/\s+/g, " ")
    .trim();
  return text ? text.split(" ").length : 0;
}

const list = topicId ? topics.filter((t) => t.id === topicId) : topics;
if (!list.length) {
  console.error("no topic", topicId, "in", mod);
  process.exit(1);
}

for (const t of list) {
  console.log("\n========== " + t.id + " ==========");
  (t.why?.paras || []).forEach((p, i) => console.log(`\nWHY[${i}] (${w(p)}w)\n` + p));
  console.log(`\nINSIGHT (${w(t.why?.insight)}w)\n` + (t.why?.insight || ""));
  console.log(`\nCONSTRAINT (${w(t.recognise?.constraint)}w)\n` + (t.recognise?.constraint || ""));
  (t.core?.paras || []).forEach((p, i) => console.log(`\nCORE[${i}] (${w(p)}w)\n` + p));
  console.log(`\nINVARIANT (${w(t.core?.invariant)}w)\n` + (t.core?.invariant || ""));
  (t.steps || []).forEach((s, i) => console.log(`STEP[${i}] (${w(s)}w) ${s}`));
  (t.pitfalls || []).forEach((p, i) => {
    console.log(`PIT[${i}].bug (${w(p.bug)}w) ${p.bug}`);
    console.log(`PIT[${i}].fix (${w(p.fix)}w) ${p.fix}`);
  });
  (t.followups || []).forEach(([q, a], i) => {
    console.log(`FU[${i}].q ${q}`);
    console.log(`FU[${i}].a (${w(a)}w) ${a}`);
  });
  console.log(`\nDERIV (${(t.complexity?.derivation || []).reduce((s, p) => s + w(p), 0)}w)`);
  (t.complexity?.derivation || []).forEach((d, i) => console.log(`D[${i}] ${d}`));
  console.log(`\nDRYINTRO (${w(t.dryRun?.intro)}w) ${t.dryRun?.intro || ""}`);
  for (const v of t.visuals || []) {
    (v.data?.frames || []).forEach((f, i) =>
      console.log(`FRAME[${i}] (${w(f.note)}w) ${f.note}`)
    );
  }
}

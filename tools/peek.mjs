// Dev helper: print one rendered section of a page as plain text, so you can
// read a page the way a learner reads it.
// Usage: node tools/peek.mjs modules/06-range-queries/dsu.html "Why this exists"
import fs from "node:fs";

const [file, heading = "Why this exists"] = process.argv.slice(2);
const html = fs.readFileSync(file, "utf8");

const heads = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)];
const at = heads.findIndex((h) => h[1].replace(/<[^>]+>/g, "").trim().toLowerCase().startsWith(heading.toLowerCase()));
if (at < 0) {
  console.error(`no <h2> starting with "${heading}". Available:`);
  for (const h of heads) console.error("  - " + h[1].replace(/<[^>]+>/g, "").trim());
  process.exit(1);
}
const slice = html.slice(heads[at].index, at + 1 < heads.length ? heads[at + 1].index : html.length);

const text = slice
  .replace(/<(script|style)[\s\S]*?<\/\1>/g, " ")
  .replace(/<\/(p|li|h2|h3|div|tr)>/g, "\n")
  .replace(/<[^>]+>/g, "")
  .replace(/&mdash;/g, "--")
  .replace(/&le;/g, "<=")
  .replace(/&ge;/g, ">=")
  .replace(/&times;/g, "x")
  .replace(/&rarr;/g, "->")
  .replace(/&amp;/g, "&")
  .replace(/&[a-z]+;|&#\d+;/gi, "")
  .replace(/[ \t]+/g, " ")
  .replace(/\n /g, "\n")
  .replace(/\n{2,}/g, "\n\n");
console.log(text.trim());

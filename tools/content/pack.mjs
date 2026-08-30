/** Expand a compact topic spec into the full gen.mjs schema. */

export function pack(p) {
  const id = p.id;
  const yes = p.yes;
  const no = p.no;
  const table = p.table;
  const frames = p.frames;
  if (yes.length < 5) throw new Error(id + ": need 5 yes");
  if (no.length < 4) throw new Error(id + ": need 4 no");
  if (table.length < 6) throw new Error(id + ": need 6 table rows");
  if (p.pitfalls.length < 5) throw new Error(id + ": need 5 pitfalls");
  if (p.variants.length < 3) throw new Error(id + ": need 3 variants");
  if (p.followups.length < 4) throw new Error(id + ": need 4 followups");
  if (p.problems.length < 8) throw new Error(id + ": need 8 problems");
  if (p.steps.length < 6) throw new Error(id + ": need 6 steps");
  if (!p.mermaid) throw new Error(id + ": need mermaid");
  if (!frames || frames.length < 6) throw new Error(id + ": need 6 frames");

  const visuals = [
    {
      kind: p.grid ? "grid" : "array",
      vizId: id + "Viz",
      h3: p.vizTitle || "Worked walkthrough",
      intro: p.vizIntro || "Step through the sample. Amber is the live region; the note is the invariant at this step.",
      caption: p.vizCaption || "Concrete trace of the algorithm on the sample used in the dry-run table.",
      data: p.grid
        ? {
            corner: p.grid.corner || "",
            rowHeads: p.grid.rowHeads,
            colHeads: p.grid.colHeads,
            vars: p.vars,
            speed: 1000,
            frames,
          }
        : {
            label: p.arrayLabel || "a =",
            array: p.array,
            indexLabels: p.indexLabels,
            vars: p.vars,
            speed: 1000,
            frames,
          },
    },
    {
      kind: "mermaid",
      vizId: id + "Mer",
      h3: p.merTitle || "Structure",
      caption: p.merCaption || "How the pieces depend on each other.",
      src: p.mermaid,
    },
  ];

  const dryRows = p.dryRows || frames.map((f, i) => ({
    cells: p.vars.map((v) => String((f.values && f.values[v]) ?? "—")),
    action: f.note,
    change: !!(f.best && f.best.length) || i === 0,
  }));

  return {
    id,
    difficulty: p.difficulty || "Medium",
    readTime: p.readTime || "20 min",
    tagline: p.tagline,
    tags: p.tags || [],
    prereqs: p.prereqs || [],
    why: {
      paras: p.why,
      insight: p.insight,
    },
    recognise: {
      yes, no, table,
      constraint: p.constraint,
    },
    core: {
      heading: p.coreHeading || "Core idea and the invariant",
      paras: p.core,
      invariant: p.invariant,
      extra: p.extra || [],
    },
    visuals,
    steps: p.steps,
    dryRun: {
      intro: p.dryIntro || "Every step on the sample from the visual walkthrough.",
      cols: p.dryCols || p.vars,
      rows: dryRows,
      after: p.dryAfter,
    },
    code: p.code,
    complexity: p.complexity,
    pitfalls: p.pitfalls,
    variants: p.variants,
    followups: p.followups,
    problems: p.problems,
    spoilers: p.spoilers || [
      { summary: "Hint for the hardest practice problem", body: p.hardHint || "<p>Name the state / invariant first. The code is then mechanical.</p>" },
      { summary: "Hint for the second-hardest", body: p.hardHint2 || "<p>Look at the constraint: it usually names the intended complexity class.</p>" },
    ],
    recap: {
      bullets: p.recap,
      oneliner: p.oneliner,
    },
  };
}

export const lc = (n, name, level, pattern) => ({
  url: `https://leetcode.com/problems/${name}/`,
  name: name.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" "),
  badge: "lc", tag: "LC " + n, level, pattern,
});

export const cf = (id, name, level, pattern) => ({
  url: `https://codeforces.com/problemset/problem/${id.replace(/[A-Z]/g, "")}/${id.replace(/[0-9]/g, "")}`,
  name, badge: "cf", tag: "CF " + id, level, pattern,
});

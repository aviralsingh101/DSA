# Content file schema for tools/content/mXX.mjs

Export: `export const topics = [ { ...topic }, ... ];`

Each topic MUST include every field below. QA rejects pages missing any of them.

```
{
  id: string,                    // MUST match nav-data.js topic id
  difficulty: "Easy"|"Medium"|"Hard",
  readTime: "22 min",
  tagline: string,               // one sentence, HTML allowed
  tags: string[],
  prereqs: [[label, relativeHref], ...],  // empty ok

  why: {
    paras: string[],             // 3 paragraphs, HTML allowed
    insight: string,             // the one insight (HTML)
    insightTitle?: string
  },

  recognise: {
    yes: string[],               // 5+ items
    no: string[],                // 4+ items
    table: [[signal, meaning, reachFor], ...],  // 6+ rows, include a "Confused with" row
    constraint: string           // constraint tell
  },

  core: {
    heading?: string,
    paras: string[],             // 2-3 paras
    invariant: string,           // HTML, include the interview sentence
    invariantTitle?: string,
    extra?: [{ kind: "idea"|"key"|"warn"|"math"|"tip"|"pitfall", title, html }]
  },

  visuals: [
    // MUST have at least one array/grid WITH a viz-player (kind "array" or "grid")
    // MUST have at least one mermaid
    {
      kind: "array"|"grid"|"mermaid",
      vizId: uniqueString,
      h3?: string,
      intro?: string,
      caption: string,
      // for array:
      data: {
        label?: string,
        array: number[]|string[],
        indexLabels?: (string|number)[],
        vars: string[],
        speed?: number,
        frames: [{
          note: string,
          active?: number[], window?: [l,r], done?: number[],
          best?: number[], dim?: number[], x?: number[],
          pointers?: { i?: number, ... },
          values: { [varName]: number|string }
        }]  // 6+ frames
      },
      // for grid:
      data: {
        corner, rowHeads, colHeads, vars, frames: [{
          note, cells: [{r,c,val,cls?}], values
        }]
      },
      // for mermaid:
      src: string,   // RULES: no spaces in IDs, no reserved IDs (end,graph,subgraph,class,flowchart),
                     // quote labels with (),[],:,  NEVER style/classDef/:::
                     // no angle brackets in labels — write "less than" or use &lt; only if needed
      wide?: boolean
    }
  ],

  steps: string[],               // 6-8 numbered steps, HTML, use same var names as code

  dryRun: {
    intro: string,
    cols: string[],              // variable names matching code
    rows: [{ cells: string[], action: string, change?: boolean }],  // every iteration
    after?: string               // optional HTML
  },

  code: [                        // 3 tabs: Brute / Optimal / Template  (or Recursion/Memo/Tab/Space for DP)
    {
      tab: string,
      panel?: string,
      intro?: string,
      file: string,              // Xxx.java
      highlight?: "4,7-9",
      code: `Java 17, compilable, 4-space indent, class named after topic,
             main() runs the dry-run sample, trailing comment with Input/Output.
             Use long for sums. mid = lo + (hi-lo)/2. ArrayDeque not Stack.
             Escape not needed — gen.mjs escapes.`
    }
  ],

  complexity: {
    time: string,                // e.g. "O(n log n)"
    space: string,
    derivation: string[],        // HTML paras + <span class="eq">...</span>
    compare: [[approach, time, space, when], ...]  // 4+ rows
  },

  pitfalls: [{ title, bug, fix }],   // >= 5, each is a real classic bug
  variants: [[name, whatChanges, codeDelta, exampleHtml], ...],  // >= 3
  followups: [[question, answerHtml], ...],  // >= 4
  problems: [{
    url, name, badge: "lc"|"cf"|"gfg"|"atc",
    tag: "LC 53"|"CF 1155D"|"GfG",
    level: "Easy"|"Medium"|"Hard",
    pattern: string
  }],  // 8-12, easy→hard, P1/P2 pages need >= 2 CF
  spoilers: [{ summary, body }], // >= 2 for the hardest problems
  recap: { bullets: string[], oneliner: string }  // oneliner is plain Java, will be escaped
}
```

Java style:
- Java 17, no extra libs
- `int mid = lo + (hi - lo) / 2;`
- `ArrayDeque`, `int[]`, `List<List<Integer>>`
- comments only for invariants / overflow
- trailing: `// Input : ...` `// Output: ...`

Mermaid:
- graph TD / graph LR / flowchart TD / stateDiagram-v2
- IDs camelCase, never `end`
- Labels with special chars in double quotes
- No colors

Relative links from a topic page (depth 2):
- sibling: `foo.html`
- other module: `../00-foundations/complexity-analysis.html`

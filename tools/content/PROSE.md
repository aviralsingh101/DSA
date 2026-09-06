# Prose contract — write for a first-time reader

The reader is a working engineer who is **relearning**. Assume they know Java,
loops, arrays and recursion. Assume they know **nothing** about the technique on
the page: not the name, not the vocabulary, not why it exists. Every page must
be understandable start to finish without opening another tab.

`node tools/prose.mjs mXX` enforces the minimum lengths below. It measures
visible words with tags stripped, so padding with markup does not help.

## The five rules

1. **Motivate before you formalise.** The first paragraph of `why` states the
   concrete problem in plain words, with a tiny example, before any term of art
   appears. "You are given ... and you must ..." is a good opening.
2. **Define every term at first use, in the sentence that uses it.** Words like
   idempotent, amortised, invariant, monotonic, residual, nimber, lattice and
   relax are jargon. Write "*idempotent* — combining a value with itself gives
   the same value back, so `min(x, x) = x`" rather than assuming it.
3. **No telegraphic fragments.** Write complete sentences with verbs. Replace
   "Sort, sweep, done." with a sentence that says what is sorted, what the sweep
   maintains, and why that is enough.
4. **Spell out the symbols and the arithmetic.** Not `O(n log n)` alone but
   "each of the `n` items is pushed once and the heap costs `log n` per push,
   which is `n log n` operations in total — about `1.7 x 10^6` at `n = 10^5`".
5. **Say what the reader would get wrong.** The value of a pitfall is the
   sentence explaining *why* the wrong version looks correct.

## Minimum lengths (words, tags stripped)

| Field | Minimum | Aim for |
|---|---|---|
| each `why` paragraph | 55 | 70–110 |
| `why` total (>= 3 paragraphs) | 220 | 260–340 |
| `insight` | 30 | 40–60 |
| each `core` paragraph | 55 | 70–110 |
| `core` total (>= 3 paragraphs) | 220 | 260–340 |
| `invariant` | 45 | 55–90 |
| each `steps[i]` | 18 | 25–40 |
| each `pitfalls[i].bug` | 20 | 25–45 |
| each `pitfalls[i].fix` | 15 | 20–35 |
| each `followups[i]` answer | 45 | 55–90 |
| `complexity.derivation` total | 80 | 100–160 |
| `recognise.constraint` | 30 | 40–70 |
| `dryRun.intro` | 20 | 25–45 |
| each visual frame `note` | 9 | 14–30 |

## What each section owes the reader

- **why** — the problem, why the obvious approach is not good enough (with the
  numbers that kill it), and what this technique buys. Third paragraph should
  name the constraint that signals this technique in a real statement.
- **insight** — the single sentence you would say out loud in an interview, plus
  one sentence of unpacking. Not a slogan.
- **core** — the mechanism, step by step, in prose. Introduce each variable by
  name and say what it holds. A third paragraph should walk one concrete small
  input through the idea in words.
- **invariant** — the formal statement, then a plain-English gloss beginning
  "In plain words," so a first-timer can check it themselves.
- **steps** — each step explains the reason for the step, not only the action.
- **pitfalls** — `bug` describes the wrong code *and why it looks right*; `fix`
  gives the corrected rule and how to test it.
- **followups** — a real answer in full sentences, the way you would say it.
- **complexity.derivation** — count the operations, then put real numbers in.
- **frames** — each `note` narrates that step as a sentence a reader can follow
  without decoding the variable panel.

## Do not change

- topic `id`, `tags`, `prereqs`, `difficulty`, file/nav wiring
- any `code[].code` Java source, `problems[]` URLs, `mermaid` sources
- frame mechanics: `active`, `window`, `done`, `best`, `dim`, `values`, `cells`
  (only the `note` text is rewritten)
- the number of table rows in `recognise.table`, or the `pack()` field names

You **may** add paragraphs to `why` and `core`, add entries to `core.extra`
callouts (`{ kind: "idea"|"key"|"warn"|"math"|"tip"|"pitfall", title, html }`),
and lengthen `readTime` to match the new size.

## Mechanics

- Paragraph strings are wrapped in `<p>` by `gen.mjs` unless they already start
  with a block tag. Inline `<code>`, `<strong>`, `<em>`, `<a>` are fine.
- Never write an invalid unicode escape in a JS string. `"\uarr"` is a **syntax
  error**; write `&rarr;` or `\u2192`.
- Use `&le; &ge; &ne; &rarr; &sup2; &times;` rather than raw `<` `>` in prose.
- Verify, in this order:
  `node --check tools/content/mXX.mjs`,
  `node tools/gen.mjs mXX`,
  `node tools/prose.mjs mXX`,
  `node tools/check.mjs`.

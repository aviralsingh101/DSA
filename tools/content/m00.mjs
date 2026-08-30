/* Module 00 — Foundations */

export const topics = [

/* ============================================ 1. complexity-analysis ==== */
{
  id: "complexity-analysis",
  difficulty: "Easy",
  readTime: "22 min",
  tagline: "Learn to price an algorithm before you write it, so that the constraints in the " +
    "problem statement tell you which idea to reach for instead of which idea to abandon.",
  tags: ["big-o", "amortised", "counting", "meta"],
  prereqs: [],

  why: {
    paras: [
      "Complexity analysis is not academic bookkeeping in competitive programming, it is the " +
      "targeting system. The problem setter chose <code>n &le; 2 &times; 10&#8309;</code> " +
      "deliberately, and that number rules out entire families of solutions before you write a " +
      "line. If you can price a candidate approach in ten seconds you avoid the single most " +
      "expensive interview mistake: implementing something correct that is too slow, then having " +
      "no time left to fix it.",
      "The reason this skill decays is that day-to-day engineering rarely punishes a hidden " +
      "quadratic. A service handling 50 records per request never notices. A judge with " +
      "<code>n = 10&#8309;</code> notices immediately, and so does an interviewer who asks " +
      "\"what is the complexity?\" and watches whether you answer instantly or start counting " +
      "loops with a finger.",
      "The whole discipline reduces to three habits: count the number of times the innermost " +
      "statement runs, keep only the fastest-growing term, and compare that against about " +
      "<code>10&#8312;</code> simple operations per second.",
    ],
    insight: "Big-O is a statement about <em>growth</em>, not about time. It answers " +
      "\"if the input doubles, what happens to the work?\" That is exactly the question the " +
      "constraint line in a problem statement is asking you.",
  },

  recognise: {
    yes: [
      "You are choosing between two working approaches and need to know which one survives the constraints",
      "The problem gives an explicit bound such as <code>n &le; 10&#8309;</code>, " +
        "<code>sum of n over all test cases &le; 2 &times; 10&#8309;</code>, or a time limit of 1 second",
      "An interviewer asks \"can you do better?\" &mdash; they are telling you a lower complexity class exists",
      "Your solution passes small tests and times out on large ones",
      "A data structure operation is cheap <em>on average</em> but occasionally expensive " +
        "(<code>ArrayList.add</code>, <code>HashMap</code> resize, DSU <code>find</code>) &rarr; " +
        "you need amortised analysis, not worst-case-per-operation",
    ],
    no: [
      "The bottleneck is I/O rather than computation &rarr; fix the reader " +
        "(<a href=\"java-for-dsa.html\">fast IO</a>) before optimising the algorithm",
      "Two candidates share the same complexity class &rarr; the decision is about constants, " +
        "cache behaviour and code length, which Big-O deliberately hides",
      "<code>n</code> is tiny and fixed (say <code>n &le; 12</code>) &rarr; even " +
        "<code>O(n!)</code> is fine, so pick whatever is easiest to write correctly",
      "You need the exact operation count for a proof &rarr; that is a recurrence, see " +
        "<a href=\"recurrences-and-master-theorem.html\">Recurrences</a>",
    ],
    table: [
      ["A single loop over <code>n</code>", "Each element visited a constant number of times", "<code>O(n)</code>"],
      ["Nested loops where the inner bound depends on the outer",
        "Sum of an arithmetic series, <code>n(n+1)/2</code>", "<code>O(n&sup2;)</code>, not <code>O(n)</code>"],
      ["The search space halves each step", "A logarithmic number of steps", "<code>O(log n)</code>"],
      ["A loop over <code>n</code> containing a <code>TreeMap</code> or heap operation",
        "<code>n</code> times a logarithmic factor", "<code>O(n log n)</code>"],
      ["Sorting anywhere in the solution", "You have already paid <code>n log n</code>, so extra " +
        "<code>log</code> factors are free-ish", "<code>O(n log n)</code> baseline"],
      ["Enumerating all subsets", "One iteration per subset", "<code>O(2&#8319;)</code> or <code>O(2&#8319; &middot; n)</code>"],
      ["<code>String</code> concatenation inside a loop",
        "Each <code>+=</code> copies the whole string &mdash; a hidden inner loop",
        "<code>O(n&sup2;)</code>; use <code>StringBuilder</code>"],
      ["<strong>Confused with:</strong> <code>O(n)</code> space means <code>O(n)</code> time",
        "Independent axes; a hash join is <code>O(n)</code> time and <code>O(n)</code> space, " +
        "binary search is <code>O(log n)</code> time and <code>O(1)</code> space",
        "Always state both"],
    ],
    constraint: "roughly <code>10&#8312;</code> simple operations per second in Java. Divide the " +
      "budget by 2&ndash;5 if the inner loop chases pointers, boxes <code>Integer</code>s, or " +
      "touches a <code>HashMap</code>.",
  },

  core: {
    heading: "Core idea and the counting rules",
    paras: [
      "Pick the statement that executes most often &mdash; usually the innermost line of the " +
      "deepest loop &mdash; and count how many times it runs as a function of <code>n</code>. " +
      "That count, stripped of constants and lower-order terms, is the complexity. Everything " +
      "else is a shortcut for doing that count quickly.",
      "Four rules cover almost every case you will meet. <strong>Sequence:</strong> code run one " +
      "after the other costs the maximum, not the sum, because " +
      "<code>O(n) + O(n&sup2;) = O(n&sup2;)</code>. <strong>Nesting:</strong> independent nested " +
      "loops multiply. <strong>Dependent nesting:</strong> when the inner bound depends on the " +
      "outer index, sum the series instead of multiplying &mdash; but note that " +
      "<code>n(n+1)/2</code> is still <code>&Theta;(n&sup2;)</code>, so the shortcut of " +
      "multiplying gives the right class anyway. <strong>Amortisation:</strong> when a rare " +
      "operation is expensive, charge its cost to the cheap operations that made it necessary.",
      "Big-O is an upper bound, &Omega; a lower bound, and &Theta; both. In practice everyone says " +
      "\"O\" and means \"&Theta;\", and that is fine in an interview &mdash; but knowing the " +
      "difference matters when you claim optimality. Saying \"any correct algorithm must read " +
      "every element, so &Omega;(n) is a lower bound and my &Theta;(n) solution is optimal\" is a " +
      "much stronger answer than \"mine is O(n)\".",
    ],
    invariantTitle: "The one-sentence method",
    invariant: "<p><strong>How many times does the innermost statement run, as a function of " +
      "<code>n</code>?</strong> Answer that, drop constants and lower-order terms, and you have " +
      "the complexity. If the innermost statement is itself a library call, substitute that " +
      "call's cost first &mdash; <code>list.contains</code> is <code>O(n)</code>, " +
      "<code>set.contains</code> is <code>O(1)</code>, and that one substitution is the " +
      "difference between passing and timing out.</p>",
    extra: [
      { kind: "math", title: "Amortised analysis, concretely",
        html: "<p>Growing an <code>ArrayList</code> doubles its capacity, which copies every " +
          "element. Copying looks <code>O(n)</code>, so <code>n</code> appends look " +
          "<code>O(n&sup2;)</code>. But doubling from 1 to <code>n</code> copies " +
          "<code>1 + 2 + 4 + &hellip; + n &lt; 2n</code> elements in total, so " +
          "<code>n</code> appends cost <code>O(n)</code> together, i.e. <code>O(1)</code> " +
          "<em>amortised</em> each. The geometric series is the whole trick: doubling is " +
          "amortised <code>O(1)</code>, growing by a constant <code>+c</code> is amortised " +
          "<code>O(n)</code>.</p>" },
      { kind: "warn", title: "Constants are hidden, not absent",
        html: "<p><code>O(n log n)</code> with a <code>PriorityQueue&lt;int[]&gt;</code> can lose " +
          "to <code>O(n&sup2;)</code> on <code>n = 2000</code>, because every element is a heap " +
          "allocation and every comparison is a virtual call. Java's boxing and pointer chasing " +
          "cost roughly 5&ndash;20&times; a primitive array access. When two solutions are in the " +
          "same class, prefer flat <code>int[]</code> arrays.</p>" },
      { kind: "tip", title: "The log factor is nearly free",
        html: "<p><code>log&#8322;(10&#8310;) &asymp; 20</code>. Going from <code>O(n)</code> to " +
          "<code>O(n log n)</code> costs about 20&times;, while going from " +
          "<code>O(n log n)</code> to <code>O(n&sup2;)</code> at <code>n = 10&#8310;</code> " +
          "costs 50000&times;. So never contort a solution to shave a <code>log</code>; do " +
          "contort it to shave a factor of <code>n</code>.</p>" },
    ],
  },

  visuals: [
    {
      kind: "grid", vizId: "cxTable",
      h3: "What each complexity class can actually handle",
      intro: "Operation counts for each growth rate at five input sizes. Green means it fits in a " +
        "one-second budget of about <code>10&#8312;</code> operations; red means it does not. " +
        "Step through it once and the shape of the boundary is easy to remember: it runs " +
        "diagonally from top-right to bottom-left.",
      caption: "Growth rates against input size. The useful reading direction is backwards: given " +
        "a value of <code>n</code>, which rows are still green? Those are your candidate " +
        "complexities.",
      data: {
        corner: "ops",
        rowHeads: ["log n", "n", "n log n", "n\u00b2", "n\u00b3", "2\u207f", "n!"],
        colHeads: ["n=10", "n=100", "n=1e3", "n=1e5", "n=1e6"],
        vars: ["class", "verdict"],
        speed: 1200,
        frames: [
          { note: "O(log n): 20 steps at a million elements. Effectively free. This is binary search and balanced-tree lookups.",
            cells: [{ r: 0, c: 0, val: "3", cls: "answer" }, { r: 0, c: 1, val: "7", cls: "answer" },
                    { r: 0, c: 2, val: "10", cls: "answer" }, { r: 0, c: 3, val: "17", cls: "answer" },
                    { r: 0, c: 4, val: "20", cls: "answer" }],
            values: { class: "log n", verdict: "always fine" } },
          { note: "O(n): a single pass. Fine everywhere, and the floor for any problem that must read all input.",
            cells: [{ r: 1, c: 0, val: "10", cls: "answer" }, { r: 1, c: 1, val: "100", cls: "answer" },
                    { r: 1, c: 2, val: "1e3", cls: "answer" }, { r: 1, c: 3, val: "1e5", cls: "answer" },
                    { r: 1, c: 4, val: "1e6", cls: "answer" }],
            values: { class: "n", verdict: "always fine" } },
          { note: "O(n log n): sorting. 2e7 operations at n = 1e6, comfortably inside a second. This is the default target for array problems.",
            cells: [{ r: 2, c: 0, val: "33", cls: "answer" }, { r: 2, c: 1, val: "664", cls: "answer" },
                    { r: 2, c: 2, val: "1e4", cls: "answer" }, { r: 2, c: 3, val: "1.7e6", cls: "answer" },
                    { r: 2, c: 4, val: "2e7", cls: "answer" }],
            values: { class: "n log n", verdict: "always fine" } },
          { note: "O(n\u00b2): the wall appears at n = 1e5, where 1e10 operations is about 100 seconds. But it is perfectly fine up to a few thousand.",
            cells: [{ r: 3, c: 0, val: "100", cls: "answer" }, { r: 3, c: 1, val: "1e4", cls: "answer" },
                    { r: 3, c: 2, val: "1e6", cls: "answer" }, { r: 3, c: 3, val: "1e10", cls: "block" },
                    { r: 3, c: 4, val: "1e12", cls: "block" }],
            values: { class: "n\u00b2", verdict: "n \u2264 ~5000" } },
          { note: "O(n\u00b3): dies at n = 1e3 already (1e9). Floyd-Warshall is O(n\u00b3), which is exactly why its constraints are always n \u2264 500.",
            cells: [{ r: 4, c: 0, val: "1e3", cls: "answer" }, { r: 4, c: 1, val: "1e6", cls: "answer" },
                    { r: 4, c: 2, val: "1e9", cls: "block" }, { r: 4, c: 3, val: "1e15", cls: "block" },
                    { r: 4, c: 4, val: "1e18", cls: "block" }],
            values: { class: "n\u00b3", verdict: "n \u2264 ~500" } },
          { note: "O(2\u207f): only n \u2264 ~25 survives. Seeing n \u2264 20 in a statement is therefore almost a signature for bitmask enumeration or bitmask DP.",
            cells: [{ r: 5, c: 0, val: "1e3", cls: "answer" }, { r: 5, c: 1, val: "1e30", cls: "block" },
                    { r: 5, c: 2, val: "huge", cls: "block" }, { r: 5, c: 3, val: "huge", cls: "block" },
                    { r: 5, c: 4, val: "huge", cls: "block" }],
            values: { class: "2\u207f", verdict: "n \u2264 ~25" } },
          { note: "O(n!): only n \u2264 ~11. If a problem allows n \u2264 8, the setter is telling you brute-force permutations are acceptable.",
            cells: [{ r: 6, c: 0, val: "4e6", cls: "answer" }, { r: 6, c: 1, val: "huge", cls: "block" },
                    { r: 6, c: 2, val: "huge", cls: "block" }, { r: 6, c: 3, val: "huge", cls: "block" },
                    { r: 6, c: 4, val: "huge", cls: "block" }],
            values: { class: "n!", verdict: "n \u2264 ~11" } },
          { note: "Read a column, not a row. At n = 1e5 only the top three rows are green, so the intended solution is O(n) or O(n log n). That is the deduction you want to be automatic.",
            cells: [{ r: 0, c: 3, val: "17", cls: "target" }, { r: 1, c: 3, val: "1e5", cls: "target" },
                    { r: 2, c: 3, val: "1.7e6", cls: "target" }],
            values: { class: "n = 1e5", verdict: "O(n) or O(n log n)" } },
        ],
      },
    },
    {
      kind: "array", vizId: "amort",
      h3: "Amortised O(1): why doubling works",
      intro: "Each cell is one <code>add</code> call on an <code>ArrayList</code>, labelled with " +
        "the number of element copies it performs. Most cost 1. The red cells are reallocations " +
        "that copy the whole array. Watch the total: it stays below <code>2n</code>, which is " +
        "what \"amortised <code>O(1)</code>\" means.",
      caption: "Cost per <code>add</code> for the first nine appends with capacity doubling from 1. " +
        "Expensive steps get rarer at exactly the rate their cost grows, so the average stays " +
        "constant.",
      data: {
        label: "cost of add #k (element copies)",
        array: [1, 2, 3, 1, 5, 1, 1, 1, 9],
        indexLabels: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        vars: ["capacity", "total copies", "average"],
        speed: 950,
        frames: [
          { note: "add #1 into capacity 1. One write, no copy. Total 1.", active: [0], dim: [1,2,3,4,5,6,7,8],
            values: { capacity: 1, "total copies": 1, average: "1.00" } },
          { note: "add #2 overflows capacity 1, so reallocate to 2 and copy 1 old element. Cost 2.",
            active: [1], x: [1], done: [0], dim: [2,3,4,5,6,7,8],
            values: { capacity: 2, "total copies": 3, average: "1.50" } },
          { note: "add #3 overflows capacity 2, reallocate to 4 and copy 2 elements. Cost 3.",
            active: [2], x: [2], done: [0,1], dim: [3,4,5,6,7,8],
            values: { capacity: 4, "total copies": 6, average: "2.00" } },
          { note: "add #4 fits in capacity 4. Cost 1. The expensive steps are already thinning out.",
            active: [3], done: [0,1,2], dim: [4,5,6,7,8],
            values: { capacity: 4, "total copies": 7, average: "1.75" } },
          { note: "add #5 overflows capacity 4, reallocate to 8 and copy 4. Cost 5 \u2014 the worst single step so far.",
            active: [4], x: [4], done: [0,1,2,3], dim: [5,6,7,8],
            values: { capacity: 8, "total copies": 12, average: "2.40" } },
          { note: "adds #6, #7, #8 all fit. Cost 1 each, and the average falls back.",
            active: [5,6,7], done: [0,1,2,3,4], dim: [8],
            values: { capacity: 8, "total copies": 15, average: "1.88" } },
          { note: "add #9 overflows capacity 8, reallocate to 16 and copy 8. Cost 9.",
            active: [8], x: [8], done: [0,1,2,3,4,5,6,7],
            values: { capacity: 16, "total copies": 24, average: "2.67" } },
          { note: "Total copies 1+2+4+8 = 15 for reallocation plus 9 writes = 24 < 2 \u00d7 9 + 6. In general the copies form a geometric series bounded by 2n, so each add is O(1) amortised.",
            best: [1,2,4,8], done: [0,3,5,6,7],
            values: { capacity: 16, "total copies": "< 2n", average: "O(1)" } },
        ],
      },
    },
    {
      kind: "mermaid", vizId: "cxOrder",
      h3: "The growth-rate ladder",
      caption: "Memorise the order. When you produce a candidate complexity, locate it on this " +
        "ladder and check it against the constraint before you start typing.",
      src: `graph LR
  A["O(1)"] --> B["O(log n)"]
  B --> C["O(sqrt n)"]
  C --> D["O(n)"]
  D --> E["O(n log n)"]
  E --> F["O(n sqrt n)"]
  F --> G["O(n squared)"]
  G --> H["O(n cubed)"]
  H --> I["O(2 to the n)"]
  I --> J["O(n factorial)"]`,
    },
    {
      kind: "mermaid", vizId: "cxHow",
      h3: "How to price a loop nest",
      caption: "Apply this to the deepest statement in your code. The most commonly missed branch " +
        "is the last one: a library call inside a loop whose own cost you forgot to substitute.",
      src: `flowchart TD
  findInner["find the statement that runs most often"] --> isLib{"is it a library call?"}
  isLib -- yes --> subst["substitute that call's own cost first"]
  subst --> countIt
  isLib -- no --> countIt["count executions as a function of n"]
  countIt --> depends{"does an inner bound depend on an outer index?"}
  depends -- yes --> series["sum the series, not the product"]
  depends -- no --> product["multiply the loop bounds"]
  series --> drop["drop constants and lower-order terms"]
  product --> drop
  drop --> budget{"is the count under 1e8?"}
  budget -- yes --> writeIt["implement it"]
  budget -- no --> better["find a better idea, do not micro-optimise"]`,
    },
  ],

  steps: [
    "<strong>Identify the hot statement.</strong> The innermost line of the deepest loop, or the " +
      "body of the most frequent recursive call.",
    "<strong>Substitute library costs.</strong> Replace every call in that line with its own " +
      "complexity: <code>List.contains</code> &rarr; <code>O(n)</code>, " +
      "<code>Set.contains</code> &rarr; <code>O(1)</code>, <code>TreeMap.get</code> &rarr; " +
      "<code>O(log n)</code>, <code>String.substring</code> &rarr; <code>O(len)</code>.",
    "<strong>Count executions.</strong> Multiply independent loop bounds; sum the series when an " +
      "inner bound depends on an outer index.",
    "<strong>Add sequential blocks with max, not plus.</strong> " +
      "<code>O(n log n)</code> then <code>O(n)</code> is <code>O(n log n)</code>.",
    "<strong>Amortise the spiky operations.</strong> Charge a resize or a path compression to the " +
      "cheap operations that caused it, then quote the average.",
    "<strong>Drop constants and lower-order terms</strong> to get the class.",
    "<strong>Evaluate against the constraint</strong> using <code>10&#8312;</code> operations per " +
      "second, then divide by 2&ndash;5 for boxing and pointer chasing.",
    "<strong>State time and space separately</strong>, and say whether your bound is tight " +
      "(&Theta;) or only an upper bound (O).",
  ],

  dryRun: {
    intro: "Pricing seven snippets, in the order the rules apply. Highlighted rows are the ones " +
      "that most often get answered wrong.",
    cols: ["#", "Snippet", "Hot statement runs", "Class"],
    rows: [
      { cells: ["1", "<code>for i in 0..n: x++</code>", "n", "O(n)"],
        action: "One loop, constant body." },
      { cells: ["2", "<code>for i in 0..n: for j in 0..n: x++</code>", "n &times; n", "O(n&sup2;)"],
        action: "Independent nesting multiplies." },
      { cells: ["3", "<code>for i in 0..n: for j in i..n: x++</code>", "n(n+1)/2", "O(n&sup2;)"],
        action: "Dependent nesting sums a series &mdash; but the class is unchanged.", change: true },
      { cells: ["4", "<code>for (i = n; i &gt; 0; i /= 2) x++</code>", "log&#8322; n", "O(log n)"],
        action: "Multiplicative shrinking gives a logarithm." },
      { cells: ["5", "<code>for i in 0..n: for (j = n; j &gt; 0; j /= 2)</code>", "n log n", "O(n log n)"],
        action: "Linear outer, logarithmic inner." },
      { cells: ["6", "<code>for i in 0..n: if (list.contains(i))</code>", "n &times; n", "O(n&sup2;)"],
        action: "The trap. <code>contains</code> on a <code>List</code> is a hidden inner loop; swap in a <code>HashSet</code> for O(n).", change: true },
      { cells: ["7", "<code>for i in 0..n: s += c;</code> (<code>String s</code>)", "1+2+&hellip;+n", "O(n&sup2;)"],
        action: "The other trap. Immutable strings copy on every concatenation; use <code>StringBuilder</code>.", change: true },
      { cells: ["8", "<code>for (i = 0; i*i &lt;= n; i++)</code>", "&radic;n", "O(&radic;n)"],
        action: "Trial division and divisor enumeration both live here." },
    ],
  },

  code: [
    { tab: "The hidden quadratics", panel: "Hidden quadratics", file: "HiddenCost.java",
      intro: "Both methods look linear. Both are quadratic. These two shapes account for a large " +
        "share of unexplained timeouts in Java.",
      highlight: "8,19",
      code: `import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class HiddenCost {

    /** Looks O(n). Actually O(n^2): List.contains scans the whole list. */
    static int countDistinctSlow(int[] a) {
        List<Integer> seen = new ArrayList<>();
        for (int v : a) {
            if (!seen.contains(v)) {
                seen.add(v);
            }
        }
        return seen.size();
    }

    /** Looks O(n). Actually O(n^2): every += copies the whole string. */
    static String joinSlow(int[] a) {
        String s = "";
        for (int v : a) {
            s += v + ",";
        }
        return s;
    }

    /** O(n): hashing makes the membership test O(1) expected. */
    static int countDistinctFast(int[] a) {
        Set<Integer> seen = new HashSet<>();
        for (int v : a) {
            seen.add(v);
        }
        return seen.size();
    }

    /** O(n): StringBuilder appends into a doubling buffer, O(1) amortised each. */
    static String joinFast(int[] a) {
        StringBuilder sb = new StringBuilder();
        for (int v : a) {
            sb.append(v).append(',');
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        int[] a = {3, 1, 4, 1, 5, 9, 2, 6, 5, 3};
        System.out.println(countDistinctSlow(a) + " " + countDistinctFast(a));
        System.out.println(joinFast(a));
    }
    // Input : [3,1,4,1,5,9,2,6,5,3]
    // Output: 7 7
    //         3,1,4,1,5,9,2,6,5,3,
}`,
    },
    { tab: "Counting exactly", panel: "Counting exactly", file: "OperationCounter.java",
      intro: "When you distrust an analysis, count. This prints the exact number of inner-loop " +
        "executions so you can check it against your closed form.",
      code: `public class OperationCounter {

    /** Dependent nesting: the inner bound depends on i. */
    static long countTriangular(int n) {
        long ops = 0;
        for (int i = 0; i < n; i++) {
            for (int j = i; j < n; j++) {
                ops++;
            }
        }
        return ops;
    }

    /** Multiplicative shrinking: j is halved each step. */
    static long countLinearithmic(int n) {
        long ops = 0;
        for (int i = 0; i < n; i++) {
            for (int j = n; j > 0; j /= 2) {
                ops++;
            }
        }
        return ops;
    }

    public static void main(String[] args) {
        for (int n : new int[] {8, 16, 32}) {
            long tri = countTriangular(n);
            long lin = countLinearithmic(n);
            System.out.println(n + ": triangular=" + tri + " (n(n+1)/2=" + (1L * n * (n + 1) / 2)
                    + "), linearithmic=" + lin + " (n*(log2(n)+1)="
                    + (1L * n * (Integer.numberOfTrailingZeros(n) + 1)) + ")");
        }
    }
    // Output: 8: triangular=36 (n(n+1)/2=36), linearithmic=32 (n*(log2(n)+1)=32)
    //         16: triangular=136 (n(n+1)/2=136), linearithmic=80 (n*(log2(n)+1)=80)
    //         32: triangular=528 (n(n+1)/2=528), linearithmic=192 (n*(log2(n)+1)=192)
}`,
    },
    { tab: "Amortised O(1)", panel: "Amortised", file: "AmortisedGrowth.java",
      intro: "A minimal dynamic array that reports total copies, so the <code>&lt; 2n</code> bound " +
        "is something you have measured rather than something you were told.",
      code: `public class AmortisedGrowth {

    private int[] data = new int[1];
    private int size = 0;
    long copies = 0;

    void add(int v) {
        if (size == data.length) {
            int[] bigger = new int[data.length * 2];
            System.arraycopy(data, 0, bigger, 0, size);
            copies += size;                  // the only expensive part
            data = bigger;
        }
        data[size++] = v;
    }

    public static void main(String[] args) {
        for (int n : new int[] {1000, 100000, 1000000}) {
            AmortisedGrowth g = new AmortisedGrowth();
            for (int i = 0; i < n; i++) {
                g.add(i);
            }
            System.out.println("n=" + n + " copies=" + g.copies
                    + " copies/n=" + String.format("%.2f", (double) g.copies / n));
        }
    }
    // Output: n=1000 copies=1023 copies/n=1.02
    //         n=100000 copies=131071 copies/n=1.31
    //         n=1000000 copies=1048575 copies/n=1.05
}`,
    },
  ],

  complexity: {
    time: "meta-topic",
    space: "meta-topic",
    derivation: [
      "<p>The two series you need by heart. <strong>Arithmetic</strong>, from dependent nested " +
      "loops:</p>",
      "<span class=\"eq\">1 + 2 + &hellip; + n = n(n+1)/2 = &Theta;(n&sup2;)</span>",
      "<p><strong>Geometric</strong>, from doubling and from halving:</p>",
      "<span class=\"eq\">1 + 2 + 4 + &hellip; + 2<sup>k</sup> = 2<sup>k+1</sup> &minus; 1 &lt; 2 &middot; 2<sup>k</sup> = &Theta;(2<sup>k</sup>)</span>",
      "<p>The geometric bound is why capacity doubling is amortised <code>O(1)</code>: total " +
      "copies to reach size <code>n</code> are under <code>2n</code>, so the average per " +
      "operation is constant. It is also why halving a search space takes " +
      "<code>&Theta;(log n)</code> steps: solving <code>n / 2<sup>k</sup> = 1</code> gives " +
      "<code>k = log&#8322; n</code>.</p>",
      "<p>One more worth knowing, the harmonic series, which is where sieve-style loops come from:</p>",
      "<span class=\"eq\">n/1 + n/2 + n/3 + &hellip; + n/n = n &middot; H<sub>n</sub> &asymp; n ln n = &Theta;(n log n)</span>",
      "<p>That is exactly the cost of the Sieve of Eratosthenes' inner loops, and it explains why " +
      "the sieve is <code>O(n log log n)</code> rather than <code>O(n log n)</code> once you " +
      "restrict the outer loop to primes.</p>",
    ],
    compare: [
      ["<code>O(1)</code>", "constant", "&mdash;", "Array index, arithmetic, <code>HashMap</code> hit"],
      ["<code>O(log n)</code>", "~20 at n = 1e6", "&mdash;", "Binary search, heap push, <code>TreeMap</code>"],
      ["<code>O(&radic;n)</code>", "~1000 at n = 1e6", "&mdash;", "Trial division, Mo's algorithm blocks"],
      ["<code>O(n)</code>", "1e6", "&mdash;", "Single pass, counting sort, BFS on a sparse graph"],
      ["<code>O(n log n)</code>", "2e7", "&mdash;", "Sorting; the default target for array problems"],
      ["<code>O(n&sup2;)</code>", "1e10 at n = 1e5", "&mdash;", "Only when n &le; ~5000"],
      ["<code>O(2&#8319;)</code>", "1e6 at n = 20", "&mdash;", "Only when n &le; ~25; a bitmask signature"],
      ["<code>O(n!)</code>", "3.6e6 at n = 10", "&mdash;", "Only when n &le; ~11"],
    ],
  },

  pitfalls: [
    { title: "Treating a library call as free",
      bug: "<code>for (int v : a) if (list.contains(v)) &hellip;</code> &mdash; reported as " +
        "<code>O(n)</code> because there is one visible loop, but <code>contains</code> on a " +
        "<code>List</code> is itself <code>O(n)</code>, making it <code>O(n&sup2;)</code>.",
      fix: "Substitute every call's own cost before counting. Learn the table: " +
        "<code>ArrayList.contains</code> / <code>indexOf</code> / <code>remove(Object)</code> are " +
        "<code>O(n)</code>; <code>HashSet</code> and <code>HashMap</code> are <code>O(1)</code> " +
        "expected; <code>TreeMap</code> is <code>O(log n)</code>." },
    { title: "Adding sequential blocks instead of taking the maximum",
      bug: "\"I sort, then do a linear pass, so it is <code>O(n log n + n)</code>\" &mdash; " +
        "then treating that as meaningfully different from <code>O(n log n)</code> and " +
        "optimising the linear pass.",
      fix: "<code>O(n log n + n) = O(n log n)</code>. Optimise the dominant term only. The " +
        "corollary is powerful: once you have paid for a sort, extra <code>O(log n)</code> work " +
        "per element is free." },
    { title: "Ignoring the input-dependent factor",
      bug: "Quoting graph algorithms as <code>O(n&sup2;)</code> or <code>O(n log n)</code> when " +
        "the real parameter is the edge count. Dijkstra is <code>O((V + E) log V)</code>, and on " +
        "a dense graph <code>E = V&sup2;</code>, so it is <code>O(V&sup2; log V)</code>.",
      fix: "Name every parameter: <code>n</code> and <code>m</code>, or <code>V</code> and " +
        "<code>E</code>, or <code>n</code> and <code>maxValue</code>. A complexity with an " +
        "unnamed parameter is not an answer." },
    { title: "Confusing pseudo-polynomial with polynomial",
      bug: "Calling 0/1 knapsack \"polynomial\" because it is <code>O(nW)</code>. If " +
        "<code>W = 10&#8313;</code> that is <code>10&sup1;&#8308;</code> operations &mdash; " +
        "<code>W</code> is a <em>value</em>, not an input <em>length</em>.",
      fix: "Check whether a factor is a count of items or the magnitude of a number. " +
        "<code>O(nW)</code>, <code>O(n &middot; maxA)</code> and <code>O(&radic;x)</code> are " +
        "pseudo-polynomial: usable only when the value bound is small, and always worth stating." },
    { title: "Forgetting recursion's space cost",
      bug: "\"DFS is <code>O(V + E)</code> time and <code>O(1)</code> space\" &mdash; the call " +
        "stack holds up to <code>V</code> frames, and on a path graph with " +
        "<code>V = 10&#8309;</code> that is a <code>StackOverflowError</code>, not a slow program.",
      fix: "Recursion depth is space. Quote <code>O(depth)</code> auxiliary space, and switch to " +
        "an explicit <code>ArrayDeque</code> stack when depth can reach " +
        "<code>10&#8309;</code>." },
    { title: "Assuming <code>HashMap</code> is always <code>O(1)</code>",
      bug: "Relying on <code>O(1)</code> in a Codeforces solution keyed by <code>Integer</code>. " +
        "Java's <code>Integer.hashCode()</code> is the value itself, so an adversary can feed " +
        "keys that collide into one bucket and turn your pass into <code>O(n log n)</code> or " +
        "worse per operation.",
      fix: "In competitive settings either sort and use two pointers, or salt your keys: mix each " +
        "key with a random 64-bit constant, or wrap it with " +
        "<code>Long.hashCode(x * 0x9E3779B97F4A7C15L)</code> before inserting." },
    { title: "Optimising a constant instead of a class",
      bug: "Spending twenty minutes replacing a <code>%</code> with a bit mask inside an " +
        "<code>O(n&sup2;)</code> loop at <code>n = 10&#8309;</code>. A 2&times; win on " +
        "<code>10&sup1;&#8304;</code> operations is still a timeout.",
      fix: "First check whether the class fits the constraint. Only micro-optimise when the class " +
        "is correct and you are within about 5&times; of the limit." },
  ],

  variants: [
    ["Amortised vs worst case",
      "Report the average over a sequence of operations rather than the worst single one. Valid " +
      "only when the problem cares about total time, which is almost always.",
      "ArrayList.add: O(n) worst, O(1) amortised\nDSU find: O(log n) worst, O(alpha(n)) amortised",
      "<a href=\"../06-range-queries/dsu.html\">DSU</a>"],
    ["Expected vs worst case",
      "Average over the algorithm's own randomness, not over inputs. Quicksort is " +
      "<code>O(n&sup2;)</code> worst case but <code>O(n log n)</code> expected with a random pivot.",
      "randomised quickselect: O(n) expected, O(n^2) worst",
      "<a href=\"../04-recursion-and-dnc/divide-and-conquer.html\">Divide &amp; Conquer</a>"],
    ["Output-sensitive complexity",
      "Include the size of the answer as a parameter. Enumerating all <code>k</code> subsets that " +
      "sum to a target is <code>O(k &middot; n)</code>, which is fine when <code>k</code> is small " +
      "and catastrophic when it is exponential.",
      "O(n + k) where k = number of results reported",
      "<a href=\"../04-recursion-and-dnc/backtracking-with-pruning.html\">Backtracking</a>"],
    ["Complexity in terms of value, not length",
      "Pseudo-polynomial bounds such as <code>O(nW)</code> or <code>O(n &middot; maxA)</code>. " +
      "Always state the value bound alongside them.",
      "knapsack: O(n * W) time, O(W) space after rolling",
      "<a href=\"../10-dynamic-programming/knapsack-family.html\">Knapsack</a>"],
    ["Amortised over all queries (offline)",
      "Total work across <code>q</code> queries can be far below <code>q</code> times the " +
      "per-query cost if you reorder them. This is the whole idea behind Mo's algorithm.",
      "Mo: O((n + q) * sqrt(n)) total, not O(q * n)",
      "<a href=\"../13-greedy-and-offline/mos-algorithm.html\">Mo's Algorithm</a>"],
    ["Space-time trade-off",
      "Precomputing a table converts time into memory. Sparse tables buy " +
      "<code>O(1)</code> queries with <code>O(n log n)</code> memory.",
      "sparse table: O(n log n) space, O(1) query",
      "<a href=\"../06-range-queries/sparse-table-and-rmq.html\">Sparse Table</a>"],
  ],

  followups: [
    ["What is the difference between O, &Theta; and &Omega;, and why should I care?",
      "<p><code>O(f)</code> is an upper bound, <code>&Omega;(f)</code> a lower bound, " +
      "<code>&Theta;(f)</code> both. Every <code>O(n)</code> algorithm is also " +
      "<code>O(n&sup2;)</code>, which is why <code>O</code> alone is a weak claim. The reason to " +
      "care is that <code>&Omega;</code> lets you argue <em>optimality</em>: \"any algorithm must " +
      "read all <code>n</code> elements, because changing an unread one changes the answer, so " +
      "<code>&Omega;(n)</code> is a lower bound and my <code>&Theta;(n)</code> solution cannot be " +
      "improved.\" That sentence ends the \"can you do better?\" line of questioning.</p>"],
    ["Why is comparison sorting <code>&Omega;(n log n)</code>?",
      "<p>A comparison sort's execution is a path down a binary decision tree, one branch per " +
      "comparison. There are <code>n!</code> possible orderings, so the tree needs at least " +
      "<code>n!</code> leaves, so its height is at least " +
      "<code>log&#8322;(n!) = &Theta;(n log n)</code> by Stirling. Hence no comparison sort beats " +
      "<code>n log n</code>. The escape hatch is to stop comparing: counting and radix sort read " +
      "the values themselves and achieve <code>O(n + k)</code>.</p>"],
    ["Your solution is <code>O(n log n)</code> and still times out. What now?",
      "<p>Check, in this order. <strong>I/O:</strong> <code>Scanner</code> is roughly " +
      "10&times; slower than <code>BufferedReader</code>, and <code>System.out.println</code> in " +
      "a loop is worse &mdash; buffer output in a <code>StringBuilder</code>. " +
      "<strong>Boxing:</strong> <code>Integer[]</code>, <code>ArrayList&lt;Integer&gt;</code> and " +
      "<code>PriorityQueue&lt;int[]&gt;</code> allocate per element; switch to " +
      "<code>int[]</code>. <strong>Hash attacks:</strong> salt your keys. <strong>Hidden " +
      "factors:</strong> a <code>String.substring</code> or <code>Math.pow</code> inside the loop. " +
      "None of these change the class, and all of them can be a 10&times; wall-clock difference.</p>"],
    ["How do I derive the complexity of a recursive function?",
      "<p>Write the recurrence, then solve it. Merge sort splits into two halves and merges " +
      "linearly, so <code>T(n) = 2T(n/2) + &Theta;(n)</code>, which the master theorem resolves " +
      "to <code>&Theta;(n log n)</code>. Binary search recurses once on half, so " +
      "<code>T(n) = T(n/2) + &Theta;(1) = &Theta;(log n)</code>. The full toolkit is in " +
      "<a href=\"recurrences-and-master-theorem.html\">Recurrences &amp; Master Theorem</a>.</p>"],
    ["What does the inverse Ackermann function in DSU actually mean?",
      "<p><code>&alpha;(n)</code> is the inverse of the Ackermann function, and it is below 5 for " +
      "every <code>n</code> that fits in the universe. So amortised " +
      "<code>O(&alpha;(n))</code> is \"constant for all practical purposes\", and you may safely " +
      "quote DSU with path compression plus union by size as effectively " +
      "<code>O(1)</code> per operation &mdash; while noting it is not literally constant.</p>"],
    ["When is <code>O(n&sup2;)</code> the <em>right</em> answer?",
      "<p>Whenever the constraints allow it. If <code>n &le; 2000</code>, an " +
      "<code>O(n&sup2;)</code> solution you can write correctly in five minutes beats an " +
      "<code>O(n log n)</code> one you debug for twenty. Interviewers care that you " +
      "<em>knew</em> it was quadratic and <em>chose</em> it; the failure is not noticing.</p>"],
  ],

  problemsIntro: "These are calibration exercises rather than implementation practice. For each " +
    "one, state the intended complexity from the constraints <em>before</em> reading the editorial, " +
    "then check yourself.",

  problems: [
    { name: "Running Sum of 1d Array", url: "https://leetcode.com/problems/running-sum-of-1d-array/",
      badge: "lc", tag: "LC 1480", level: "Easy",
      pattern: "Recognise O(n) is forced; state the &Omega;(n) lower bound out loud" },
    { name: "Contains Duplicate", url: "https://leetcode.com/problems/contains-duplicate/",
      badge: "lc", tag: "LC 217", level: "Easy",
      pattern: "Compare O(n&sup2;) list scan, O(n log n) sort, O(n) hashing; name the space cost of each" },
    { name: "Two Sum", url: "https://leetcode.com/problems/two-sum/",
      badge: "lc", tag: "LC 1", level: "Easy",
      pattern: "The canonical time-for-space trade: O(n&sup2;) to O(n) by adding a HashMap" },
    { name: "Search Insert Position", url: "https://leetcode.com/problems/search-insert-position/",
      badge: "lc", tag: "LC 33", level: "Easy",
      pattern: "Why halving gives log n; count the iterations for n = 1e6" },
    { name: "Kth Largest Element in an Array", url: "https://leetcode.com/problems/kth-largest-element-in-an-array/",
      badge: "lc", tag: "LC 215", level: "Medium",
      pattern: "O(n log n) sort vs O(n log k) heap vs O(n) expected quickselect &mdash; worst vs expected" },
    { name: "Count of Smaller Numbers After Self", url: "https://leetcode.com/problems/count-of-smaller-numbers-after-self/",
      badge: "lc", tag: "LC 315", level: "Hard",
      pattern: "n = 1e5 rules out O(n&sup2;); deduce that a log factor structure is intended" },
    { name: "Watermelon", url: "https://codeforces.com/problemset/problem/4/A",
      badge: "cf", tag: "CF 4A", level: "Easy",
      pattern: "O(1). Practise noticing when no loop is needed at all" },
    { name: "Boredom", url: "https://codeforces.com/problemset/problem/455/A",
      badge: "cf", tag: "CF 455A", level: "Medium",
      pattern: "a_i &le; 1e5 not n &le; 1e5 &mdash; the complexity is in terms of the value range" },
    { name: "Ilya and Queries", url: "https://codeforces.com/problemset/problem/313/B",
      badge: "cf", tag: "CF 313B", level: "Easy",
      pattern: "m = 1e5 queries &times; O(n) each is 1e10; the constraint forces precomputation" },
    { name: "Theatre Square", url: "https://codeforces.com/problemset/problem/1/A",
      badge: "cf", tag: "CF 1A", level: "Easy",
      pattern: "O(1), but the answer overflows int &mdash; complexity is fine, the type is not" },
    { name: "Maximum Subarray", url: "https://leetcode.com/problems/maximum-subarray/",
      badge: "lc", tag: "LC 53", level: "Medium",
      pattern: "Price the O(n&sup3;), O(n&sup2;) and O(n) versions before coding any of them" },
    { name: "Longest Substring Without Repeating Characters", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
      badge: "lc", tag: "LC 3", level: "Medium",
      pattern: "Why a two-pointer scan is O(n) and not O(n&sup2;): amortised pointer movement" },
  ],

  spoilers: [
    { summary: "Hint for LC 315 &mdash; deducing the intended complexity from constraints alone",
      body: "<p><code>n &le; 10&#8309;</code> kills <code>O(n&sup2;)</code> " +
        "(<code>10&sup1;&#8304;</code>). The answer requires a count per index, so you cannot " +
        "beat <code>&Omega;(n)</code>. That leaves <code>O(n log n)</code>, and the phrase " +
        "\"count of smaller elements to the right\" is a counting-over-a-prefix problem &rarr; " +
        "merge sort with an inversion count, or a " +
        "<a href=\"../06-range-queries/fenwick-tree.html\">Fenwick tree</a> over compressed " +
        "values. The transferable move: <em>narrow the complexity from the constraints first, " +
        "then ask which structure delivers that complexity.</em></p>" },
    { summary: "Hint for CF 455A &mdash; when the complexity is not in terms of n",
      body: "<p>The sequence length is up to <code>10&#8309;</code> but the values are also up to " +
        "<code>10&#8309;</code>, and the operation deletes all copies of a value. So the state " +
        "is the <em>value</em>, not the index: build <code>cnt[v]</code> and run a " +
        "<a href=\"../10-dynamic-programming/dp-1d.html\">house-robber DP</a> over " +
        "<code>v = 1 &hellip; 10&#8309;</code>, giving <code>O(maxA)</code>. The lesson: " +
        "<em>when a problem's operations are keyed by value, your complexity parameter is the " +
        "value range, and <code>long</code> is required for the answer.</em></p>" },
  ],

  recap: {
    bullets: [
      "<strong>Count how many times the innermost statement runs</strong>, substituting the cost " +
        "of every library call first. That single habit fixes most mis-analyses.",
      "<strong>Sequential blocks take the max; independent nesting multiplies; dependent nesting " +
        "sums a series</strong> (and still lands in the same class).",
      "<strong>Budget <code>10&#8312;</code> operations per second</strong>, then divide by " +
        "2&ndash;5 for boxing and pointer chasing. Read the constraint <em>backwards</em> to get " +
        "the intended complexity.",
      "<strong>Amortised is not average-case.</strong> Doubling gives <code>O(1)</code> amortised " +
        "because the geometric series of copies is bounded by <code>2n</code>.",
      "<strong>State time and space separately, and name every parameter</strong> " +
        "(<code>n</code>, <code>m</code>, <code>W</code>, <code>maxA</code>). An unnamed " +
        "parameter means the analysis is incomplete.",
    ],
    oneliner: "budget ~1e8 ops/sec  |  n<=10:O(n!)  n<=25:O(2^n)  n<=500:O(n^3)  n<=5e3:O(n^2)  n<=1e6:O(n log n)",
  },
},

/* ================================= 2. recurrences-and-master-theorem ==== */
{
  id: "recurrences-and-master-theorem",
  difficulty: "Medium",
  readTime: "20 min",
  tagline: "Turn a recursive algorithm into a closed-form complexity by drawing its recursion " +
    "tree and adding up the levels &mdash; then shortcut the whole process with the master theorem.",
  tags: ["recursion", "recursion tree", "master theorem", "meta"],
  prereqs: [["Complexity Analysis", "complexity-analysis.html"]],

  why: {
    paras: [
      "Loop-counting stops working the moment the algorithm calls itself. There is no innermost " +
      "loop to count, because the work is spread across a tree of calls whose shape depends on " +
      "how the input is split. Merge sort, quicksort, binary search, divide-and-conquer on the " +
      "answer, and every tree algorithm you will meet in " +
      "<a href=\"../05-trees/tree-dp-and-rerooting.html\">module 05</a> need a different tool.",
      "The tool is the <strong>recursion tree</strong>: draw the calls, compute the total work at " +
      "each depth, and sum over depths. Almost every recurrence you meet in practice falls into " +
      "one of three shapes &mdash; the root dominates, the leaves dominate, or every level costs " +
      "the same &mdash; and knowing which shape you are in gives the answer immediately.",
      "The master theorem is a lookup table for exactly that classification. It is worth " +
      "memorising because interviewers ask \"why <code>n log n</code>?\" and the strong answer is " +
      "\"there are <code>log n</code> levels and each costs <code>&Theta;(n)</code>\", not " +
      "\"because merge sort is <code>n log n</code>\".",
    ],
    insight: "Do not try to unroll the recursion algebraically. Draw the tree, compute the cost of " +
      "one level, count the levels, and decide which end of the tree dominates. Three questions, " +
      "and you are done.",
  },

  recognise: {
    yes: [
      "The algorithm calls itself on strictly smaller inputs &mdash; sorting, searching, " +
        "divide and conquer, tree traversal",
      "You can describe the work as \"split into <code>a</code> pieces of size <code>n/b</code>, " +
        "plus <code>f(n)</code> to combine\" &rarr; the master theorem applies directly",
      "An interviewer asks \"why is that <code>n log n</code>?\" or \"what is the depth of the recursion?\"",
      "You need the <em>space</em> complexity of a recursive routine &rarr; that is the maximum " +
        "depth of the tree, not the number of nodes",
      "The recursion halves the input and does constant work &rarr; <code>&Theta;(log n)</code>, " +
        "the shape behind every binary search",
    ],
    no: [
      "The subproblem sizes are <em>unequal and data-dependent</em> (quicksort with a bad pivot) " +
        "&rarr; the master theorem does not apply; analyse expected cost instead",
      "The recursion has <strong>overlapping</strong> subproblems &rarr; you are looking at " +
        "<a href=\"../10-dynamic-programming/dp-foundations.html\">dynamic programming</a>, and " +
        "the complexity is <em>states &times; transition cost</em>, not a recurrence",
      "The subproblem shrinks by a constant <em>subtraction</em> rather than division " +
        "(<code>T(n) = T(n-1) + n</code>) &rarr; just sum the series; it is " +
        "<code>&Theta;(n&sup2;)</code>",
      "Branching is exponential with no size reduction (<code>T(n) = 2T(n-1) + 1</code>) &rarr; " +
        "<code>&Theta;(2&#8319;)</code>; that is subset enumeration, not divide and conquer",
    ],
    table: [
      ["\"divide the array in half and recurse on both\"", "<code>a = 2, b = 2</code>", "<code>T(n) = 2T(n/2) + f(n)</code>"],
      ["\"discard half and recurse on one side\"", "<code>a = 1, b = 2</code>", "<code>T(n) = T(n/2) + O(1) = &Theta;(log n)</code>"],
      ["\"merge the two sorted halves\"", "Linear combine work", "<code>2T(n/2) + &Theta;(n) = &Theta;(n log n)</code>"],
      ["\"combine in constant time\" with two calls", "Leaves dominate", "<code>2T(n/2) + &Theta;(1) = &Theta;(n)</code>"],
      ["\"combine in quadratic time\" with two calls", "Root dominates", "<code>2T(n/2) + &Theta;(n&sup2;) = &Theta;(n&sup2;)</code>"],
      ["\"peel off one element and recurse\"", "Depth <code>n</code>, not <code>log n</code>", "<code>T(n-1) + f(n)</code>; sum the series"],
      ["\"try both include and exclude for each item\"", "Binary tree of depth <code>n</code>", "<code>&Theta;(2&#8319;)</code>"],
      ["<strong>Confused with:</strong> \"recursive so it must be <code>log n</code>\"",
        "Depth is <code>log n</code> only when the size is <em>divided</em>", "Check divide vs subtract first"],
    ],
    constraint: "recursion depth is auxiliary space. <code>T(n) = T(n-1) + &hellip;</code> at " +
      "<code>n = 10&#8309;</code> means 10&#8309; stack frames and a " +
      "<code>StackOverflowError</code> in Java at roughly 10&#8308;&ndash;10&#8309; frames. " +
      "Divide-style recursion is safe because <code>log&#8322;(10&#8313;) &lt; 30</code>.",
  },

  core: {
    heading: "Core idea: add up the levels",
    paras: [
      "Write the recurrence as <code>T(n) = a &middot; T(n/b) + f(n)</code>. Here <code>a</code> " +
      "is the branching factor, <code>b</code> is how much smaller each subproblem is, and " +
      "<code>f(n)</code> is the non-recursive work done at this call &mdash; the split plus the " +
      "combine. Merge sort is <code>a = 2, b = 2, f(n) = n</code>.",
      "Now account for the tree. At depth <code>k</code> there are <code>a<sup>k</sup></code> " +
      "nodes, each of size <code>n / b<sup>k</sup></code>, so the total work at that depth is " +
      "<code>a<sup>k</sup> &middot; f(n / b<sup>k</sup>)</code>. The tree bottoms out when " +
      "<code>n / b<sup>k</sup> = 1</code>, that is at depth " +
      "<code>k = log<sub>b</sub> n</code>, where there are " +
      "<code>a<sup>log<sub>b</sub> n</sup> = n<sup>log<sub>b</sub> a</sup></code> leaves.",
      "That last expression, <code>n<sup>log<sub>b</sub> a</sup></code>, is the total cost of the " +
      "leaves, and the whole master theorem is just a comparison between it and <code>f(n)</code>. " +
      "If the leaves grow faster, the leaves pay for everything. If <code>f(n)</code> grows " +
      "faster, the single root call pays for everything. If they tie, every level costs the same " +
      "and you multiply by the number of levels.",
    ],
    invariantTitle: "The master theorem in one comparison",
    invariant: "<p>For <code>T(n) = a T(n/b) + f(n)</code> with <code>a &ge; 1</code>, " +
      "<code>b &gt; 1</code>, let <code>c = log<sub>b</sub> a</code>. Compare " +
      "<code>f(n)</code> against <code>n<sup>c</sup></code>:</p>" +
      "<ul>" +
      "<li><strong>Case 1 &mdash; leaves win.</strong> " +
      "<code>f(n) = O(n<sup>c-&epsilon;</sup>)</code> &rArr; " +
      "<code>T(n) = &Theta;(n<sup>c</sup>)</code>.</li>" +
      "<li><strong>Case 2 &mdash; tie.</strong> " +
      "<code>f(n) = &Theta;(n<sup>c</sup> log<sup>k</sup> n)</code> &rArr; " +
      "<code>T(n) = &Theta;(n<sup>c</sup> log<sup>k+1</sup> n)</code>.</li>" +
      "<li><strong>Case 3 &mdash; root wins.</strong> " +
      "<code>f(n) = &Omega;(n<sup>c+&epsilon;</sup>)</code> and " +
      "<code>a f(n/b) &le; d f(n)</code> for some <code>d &lt; 1</code> &rArr; " +
      "<code>T(n) = &Theta;(f(n))</code>.</li>" +
      "</ul>" +
      "<p>Merge sort: <code>c = log&#8322; 2 = 1</code>, <code>f(n) = n = n&sup1;</code>, so " +
      "case 2 with <code>k = 0</code> gives <code>&Theta;(n log n)</code>.</p>",
    extra: [
      { kind: "tip", title: "The three shapes, visually",
        html: "<p>You can skip the algebra by asking where the mass of the tree is. " +
          "<strong>Top-heavy</strong> (costs shrink geometrically going down): the root dominates, " +
          "answer <code>&Theta;(f(n))</code>. <strong>Bottom-heavy</strong> (costs grow going " +
          "down): the leaves dominate, answer <code>&Theta;(n<sup>c</sup>)</code>. " +
          "<strong>Flat</strong> (every level the same): answer is one level times the number of " +
          "levels. A geometric series is dominated by its largest term, which is why only the " +
          "extreme level matters in the first two cases.</p>" },
      { kind: "warn", title: "Divide is not the same as subtract",
        html: "<p><code>T(n) = T(n/2) + 1</code> has depth <code>log&#8322; n</code> and is " +
          "<code>&Theta;(log n)</code>. <code>T(n) = T(n-1) + 1</code> has depth <code>n</code> " +
          "and is <code>&Theta;(n)</code>. These look almost identical on the page and differ by " +
          "an exponential amount. The master theorem covers only the division form; for " +
          "subtraction, sum the series directly.</p>" },
      { kind: "math", title: "Recurrences the master theorem cannot solve",
        html: "<p><code>T(n) = 2T(n/2) + n/log n</code> falls in the gap between cases 1 and 2 " +
          "(no valid <code>&epsilon;</code> exists). <code>T(n) = T(n/2) + T(n/3) + n</code> has " +
          "unequal splits. <code>T(n) = 2T(&radic;n) + 1</code> is not of the form at all &mdash; " +
          "substitute <code>m = log n</code> to get <code>S(m) = 2S(m/2) + 1</code>, giving " +
          "<code>&Theta;(m) = &Theta;(log n)</code>. When the theorem fails, draw the tree; it " +
          "never fails.</p>" },
    ],
  },

  visuals: [
    {
      kind: "grid", vizId: "recTree",
      h3: "Accounting a recursion tree, level by level",
      intro: "Merge sort on <code>n = 8</code>: <code>T(n) = 2T(n/2) + n</code>. Each row is one " +
        "depth of the tree. The node count doubles, the size halves, so the product &mdash; the " +
        "cost of the level &mdash; stays at <code>n</code>. That is the \"flat\" shape, and the " +
        "total is <code>n</code> times the number of levels.",
      caption: "Level accounting for <code>T(n) = 2T(n/2) + n</code> at <code>n = 8</code>. Every " +
        "level costs 8; there are <code>log&#8322;8 + 1 = 4</code> levels; total 32 = " +
        "<code>n(log&#8322;n + 1)</code>.",
      data: {
        corner: "depth",
        rowHeads: ["k=0", "k=1", "k=2", "k=3", "total"],
        colHeads: ["size", "nodes", "cost/node", "level cost"],
        vars: ["depth", "running total"],
        speed: 1150,
        frames: [
          { note: "Depth 0: the single root call sorts all 8 elements, and its merge costs 8.",
            cells: [{ r: 0, c: 0, val: "8" }, { r: 0, c: 1, val: "1" },
                    { r: 0, c: 2, val: "8" }, { r: 0, c: 3, val: "8", cls: "target" }],
            values: { depth: 0, "running total": 8 } },
          { note: "Depth 1: two calls of size 4. Twice as many nodes, each half as expensive, so the level still costs 8.",
            cells: [{ r: 1, c: 0, val: "4" }, { r: 1, c: 1, val: "2" },
                    { r: 1, c: 2, val: "4" }, { r: 1, c: 3, val: "8", cls: "target" }],
            values: { depth: 1, "running total": 16 } },
          { note: "Depth 2: four calls of size 2. Still 8. This exact cancellation is what case 2 of the master theorem detects.",
            cells: [{ r: 2, c: 0, val: "2" }, { r: 2, c: 1, val: "4" },
                    { r: 2, c: 2, val: "2" }, { r: 2, c: 3, val: "8", cls: "target" }],
            values: { depth: 2, "running total": 24 } },
          { note: "Depth 3: eight leaves of size 1. Still 8. The tree stops here because n / 2^3 = 1.",
            cells: [{ r: 3, c: 0, val: "1" }, { r: 3, c: 1, val: "8" },
                    { r: 3, c: 2, val: "1" }, { r: 3, c: 3, val: "8", cls: "target" }],
            values: { depth: 3, "running total": 32 } },
          { note: "4 levels x 8 per level = 32 = n(log2 n + 1) = Theta(n log n). Change f(n) to a constant and the level costs become 1,2,4,8 \u2014 bottom-heavy, total Theta(n).",
            cells: [{ r: 4, c: 0, val: "\u2014" }, { r: 4, c: 1, val: "15" },
                    { r: 4, c: 2, val: "\u2014" }, { r: 4, c: 3, val: "32", cls: "answer" }],
            values: { depth: "log n", "running total": "n log n" } },
        ],
      },
    },
    {
      kind: "mermaid", vizId: "recShape",
      h3: "The tree for T(n) = 2T(n/2) + n",
      caption: "Each node is labelled with its own combine cost. Sum any horizontal slice and you " +
        "get 8. Sum all slices and you get <code>n log n</code>.",
      src: `graph TD
  R["n = 8, merge cost 8"] --> A1["n = 4, cost 4"]
  R --> A2["n = 4, cost 4"]
  A1 --> B1["n = 2, cost 2"]
  A1 --> B2["n = 2, cost 2"]
  A2 --> B3["n = 2, cost 2"]
  A2 --> B4["n = 2, cost 2"]
  B1 --> C1["1"]
  B1 --> C2["1"]
  B2 --> C3["1"]
  B2 --> C4["1"]
  B3 --> C5["1"]
  B3 --> C6["1"]
  B4 --> C7["1"]
  B4 --> C8["1"]`,
      wide: true,
    },
    {
      kind: "mermaid", vizId: "recDecide",
      h3: "Choosing the right tool for a recurrence",
      caption: "Work top to bottom. The two most common mistakes are skipping the divide-versus-" +
        "subtract check, and reaching for a recurrence when the subproblems actually overlap.",
      src: `flowchart TD
  start(["you have a recursive routine"]) --> overlap{"do subproblems repeat?"}
  overlap -- yes --> dp["it is DP: cost = states x transition"]
  overlap -- no --> shrink{"how does the size shrink?"}
  shrink -- "divided by b" --> mt{"equal-sized pieces?"}
  shrink -- "minus a constant" --> sumIt["sum the series directly"]
  mt -- yes --> apply["apply the master theorem: compare f(n) with n^log_b a"]
  mt -- no --> tree["draw the recursion tree and add the levels"]
  apply --> gap{"does a case actually match?"}
  gap -- yes --> answerOk["read off the answer"]
  gap -- no --> tree`,
    },
  ],

  steps: [
    "<strong>Write the recurrence.</strong> Identify <code>a</code> (number of recursive calls), " +
      "<code>b</code> (size divisor) and <code>f(n)</code> (work outside the calls).",
    "<strong>Check divide versus subtract.</strong> If the size shrinks by subtraction, skip the " +
      "master theorem and sum the series.",
    "<strong>Compute the leaf exponent</strong> <code>c = log<sub>b</sub> a</code>.",
    "<strong>Compare <code>f(n)</code> with <code>n<sup>c</sup></code></strong> to pick the case.",
    "<strong>Case 1 (<code>f</code> smaller):</strong> answer <code>&Theta;(n<sup>c</sup>)</code> " +
      "&mdash; the leaves pay.",
    "<strong>Case 2 (equal up to log factors):</strong> answer " +
      "<code>&Theta;(n<sup>c</sup> log<sup>k+1</sup> n)</code> &mdash; every level pays equally.",
    "<strong>Case 3 (<code>f</code> larger, and regular):</strong> answer " +
      "<code>&Theta;(f(n))</code> &mdash; the root pays.",
    "<strong>Report space separately</strong> as <code>&Theta;(max depth)</code>, plus any " +
      "auxiliary buffers the combine step allocates.",
  ],

  dryRun: {
    intro: "Nine recurrences worked through the same procedure. Highlighted rows are the ones " +
      "whose answers surprise people.",
    cols: ["Recurrence", "a, b", "n<sup>c</sup>", "f(n)", "Case", "T(n)"],
    rows: [
      { cells: ["<code>T(n) = T(n/2) + 1</code>", "1, 2", "n&#8304; = 1", "1", "2 (k=0)", "<code>&Theta;(log n)</code>"],
        action: "Binary search. Tie at constant, times <code>log n</code> levels." },
      { cells: ["<code>T(n) = 2T(n/2) + 1</code>", "2, 2", "n&sup1;", "1", "1", "<code>&Theta;(n)</code>"],
        action: "Leaves dominate: <code>n</code> leaves, constant each. Tree traversal.", change: true },
      { cells: ["<code>T(n) = 2T(n/2) + n</code>", "2, 2", "n&sup1;", "n", "2 (k=0)", "<code>&Theta;(n log n)</code>"],
        action: "Merge sort. Flat tree." },
      { cells: ["<code>T(n) = 2T(n/2) + n&sup2;</code>", "2, 2", "n&sup1;", "n&sup2;", "3", "<code>&Theta;(n&sup2;)</code>"],
        action: "Root dominates; the recursion is almost free by comparison.", change: true },
      { cells: ["<code>T(n) = 4T(n/2) + n</code>", "4, 2", "n&sup2;", "n", "1", "<code>&Theta;(n&sup2;)</code>"],
        action: "Naive matrix multiply blocking. Leaves dominate." },
      { cells: ["<code>T(n) = 7T(n/2) + n&sup2;</code>", "7, 2", "n<sup>2.807</sup>", "n&sup2;", "1", "<code>&Theta;(n<sup>2.807</sup>)</code>"],
        action: "Strassen. <code>log&#8322;7 &asymp; 2.807</code> beats 3.", change: true },
      { cells: ["<code>T(n) = 3T(n/2) + n</code>", "3, 2", "n<sup>1.585</sup>", "n", "1", "<code>&Theta;(n<sup>1.585</sup>)</code>"],
        action: "Karatsuba. <code>log&#8322;3 &asymp; 1.585</code>." },
      { cells: ["<code>T(n) = T(n-1) + n</code>", "&mdash;", "&mdash;", "n", "series", "<code>&Theta;(n&sup2;)</code>"],
        action: "Subtraction, not division. Selection sort, naive quicksort worst case.", change: true },
      { cells: ["<code>T(n) = 2T(n-1) + 1</code>", "&mdash;", "&mdash;", "1", "series", "<code>&Theta;(2&#8319;)</code>"],
        action: "Subset enumeration and Towers of Hanoi. Branching with no shrinkage." },
      { cells: ["<code>T(n) = 2T(&radic;n) + 1</code>", "&mdash;", "&mdash;", "1", "substitute", "<code>&Theta;(log n)</code>"],
        action: "Set <code>m = log n</code> to reach <code>S(m) = 2S(m/2) + 1 = &Theta;(m)</code>." },
    ],
  },

  code: [
    { tab: "Merge sort", panel: "Merge sort", file: "MergeSort.java",
      intro: "The canonical <code>2T(n/2) + &Theta;(n)</code>. Note the single shared buffer: " +
        "allocating a new array inside <code>merge</code> would still be " +
        "<code>&Theta;(n log n)</code> time but would churn <code>O(n log n)</code> allocations.",
      highlight: "12-14",
      code: `import java.util.Arrays;

public class MergeSort {

    /** T(n) = 2T(n/2) + Theta(n)  =>  Theta(n log n), Theta(n) auxiliary space. */
    static void sort(int[] a) {
        sort(a, new int[a.length], 0, a.length - 1);
    }

    private static void sort(int[] a, int[] buf, int lo, int hi) {
        if (lo >= hi) {
            return;
        }
        int mid = lo + (hi - lo) / 2;
        sort(a, buf, lo, mid);
        sort(a, buf, mid + 1, hi);
        merge(a, buf, lo, mid, hi);
    }

    private static void merge(int[] a, int[] buf, int lo, int mid, int hi) {
        int i = lo, j = mid + 1, k = lo;
        while (i <= mid && j <= hi) {
            buf[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];   // <= keeps the sort stable
        }
        while (i <= mid) {
            buf[k++] = a[i++];
        }
        while (j <= hi) {
            buf[k++] = a[j++];
        }
        System.arraycopy(buf, lo, a, lo, hi - lo + 1);
    }

    public static void main(String[] args) {
        int[] a = {5, 2, 9, 1, 5, 6, 3, 8};
        sort(a);
        System.out.println(Arrays.toString(a));
    }
    // Input : [5,2,9,1,5,6,3,8]
    // Output: [1, 2, 3, 5, 5, 6, 8, 9]
}`,
    },
    { tab: "Measuring the tree", panel: "Measuring the tree", file: "RecurrenceProbe.java",
      intro: "Instrument a recurrence and print the cost of each level. This is the fastest way to " +
        "settle an argument about which case you are in: look at whether the level costs are " +
        "flat, growing, or shrinking.",
      code: `import java.util.HashMap;
import java.util.Map;

public class RecurrenceProbe {

    /** Records, per depth, the total value of f(size) across all calls at that depth. */
    static void probe(int n, int a, int b, int fExponent, int depth, Map<Integer, Long> levels) {
        if (n <= 1) {
            levels.merge(depth, 1L, Long::sum);
            return;
        }
        long work = 1;
        for (int e = 0; e < fExponent; e++) {
            work *= n;                       // f(n) = n^fExponent
        }
        levels.merge(depth, work, Long::sum);
        for (int i = 0; i < a; i++) {
            probe(n / b, a, b, fExponent, depth + 1, levels);
        }
    }

    static void report(String label, int n, int a, int b, int fExponent) {
        Map<Integer, Long> levels = new HashMap<>();
        probe(n, a, b, fExponent, 0, levels);
        StringBuilder sb = new StringBuilder(label + " -> ");
        long total = 0;
        for (int d = 0; levels.containsKey(d); d++) {
            sb.append(levels.get(d)).append(d + 1 < levels.size() ? ", " : "");
            total += levels.get(d);
        }
        System.out.println(sb + "   total=" + total);
    }

    public static void main(String[] args) {
        report("2T(n/2)+n   n=64", 64, 2, 2, 1);   // flat  -> case 2
        report("2T(n/2)+1   n=64", 64, 2, 2, 0);   // grows -> case 1
        report("2T(n/2)+n^2 n=64", 64, 2, 2, 2);   // decays-> case 3
    }
    // Output: 2T(n/2)+n   n=64 -> 64, 64, 64, 64, 64, 64, 64   total=448
    //         2T(n/2)+1   n=64 -> 1, 2, 4, 8, 16, 32, 64   total=127
    //         2T(n/2)+n^2 n=64 -> 4096, 2048, 1024, 512, 256, 128, 64   total=8128
}`,
    },
    { tab: "Master theorem solver", panel: "Master theorem", file: "MasterTheorem.java",
      intro: "A reference implementation of the classification. Reading it is a good way to check " +
        "that you can state each case precisely, which is what an interviewer is probing.",
      code: `public class MasterTheorem {

    /**
     * Classifies T(n) = a T(n/b) + Theta(n^d * log^k n).
     * Returns a human-readable Theta bound.
     */
    static String solve(int a, int b, double d, int k) {
        double c = Math.log(a) / Math.log(b);          // c = log_b(a)
        double eps = 1e-9;
        if (d < c - eps) {
            return "Theta(n^" + trim(c) + ")            [case 1: leaves dominate]";
        }
        if (Math.abs(d - c) <= eps) {
            return "Theta(n^" + trim(c) + " * log^" + (k + 1) + " n)  [case 2: every level ties]";
        }
        return "Theta(n^" + trim(d) + (k > 0 ? " * log^" + k + " n" : "")
                + ")            [case 3: root dominates]";
    }

    private static String trim(double x) {
        return (Math.abs(x - Math.rint(x)) < 1e-9)
                ? String.valueOf((long) Math.rint(x))
                : String.format("%.3f", x);
    }

    public static void main(String[] args) {
        System.out.println("T=T(n/2)+1      " + solve(1, 2, 0, 0));
        System.out.println("T=2T(n/2)+1     " + solve(2, 2, 0, 0));
        System.out.println("T=2T(n/2)+n     " + solve(2, 2, 1, 0));
        System.out.println("T=2T(n/2)+n^2   " + solve(2, 2, 2, 0));
        System.out.println("T=7T(n/2)+n^2   " + solve(7, 2, 2, 0));
        System.out.println("T=3T(n/2)+n     " + solve(3, 2, 1, 0));
    }
    // Output: T=T(n/2)+1      Theta(n^0 * log^1 n)  [case 2: every level ties]
    //         T=2T(n/2)+1     Theta(n^1)            [case 1: leaves dominate]
    //         T=2T(n/2)+n     Theta(n^1 * log^1 n)  [case 2: every level ties]
    //         T=2T(n/2)+n^2   Theta(n^2)            [case 3: root dominates]
    //         T=7T(n/2)+n^2   Theta(n^2.807)            [case 1: leaves dominate]
    //         T=3T(n/2)+n     Theta(n^1.585)            [case 1: leaves dominate]
}`,
    },
  ],

  complexity: {
    time: "&Theta;(n log n) for merge sort",
    space: "&Theta;(n) buffer + &Theta;(log n) stack",
    derivation: [
      "<p>Summing the recursion tree for <code>T(n) = a T(n/b) + f(n)</code> gives</p>",
      "<span class=\"eq\">T(n) = &Sigma;<sub>k=0</sub><sup>log<sub>b</sub>n</sup> a<sup>k</sup> f(n / b<sup>k</sup>)</span>",
      "<p>With <code>f(n) = n</code>, each term is " +
      "<code>a<sup>k</sup> &middot; n / b<sup>k</sup> = n (a/b)<sup>k</sup></code>, a geometric " +
      "series with ratio <code>a/b</code>. Three regimes follow immediately:</p>",
      "<ul>" +
      "<li><code>a &lt; b</code>: ratio below 1, the series is dominated by its first term, total " +
      "<code>&Theta;(f(n))</code> &mdash; case 3.</li>" +
      "<li><code>a = b</code>: every term equals <code>n</code>, and there are " +
      "<code>log<sub>b</sub> n + 1</code> of them, total " +
      "<code>&Theta;(n log n)</code> &mdash; case 2.</li>" +
      "<li><code>a &gt; b</code>: ratio above 1, the series is dominated by its last term, " +
      "<code>n(a/b)<sup>log<sub>b</sub>n</sup> = n<sup>log<sub>b</sub>a</sup></code> &mdash; " +
      "case 1.</li>" +
      "</ul>",
      "<p>That is the entire master theorem: a geometric series is controlled by whichever end is " +
      "larger. For merge sort specifically, <code>a = b = 2</code> puts us in the flat case, and " +
      "<code>&Theta;(n log n)</code> is also a lower bound because comparison sorting is " +
      "<code>&Omega;(n log n)</code>.</p>",
    ],
    compare: [
      ["<code>T(n) = T(n/2) + O(1)</code>", "<code>&Theta;(log n)</code>", "<code>&Theta;(log n)</code>", "Binary search; make it iterative for O(1) space"],
      ["<code>T(n) = 2T(n/2) + O(1)</code>", "<code>&Theta;(n)</code>", "<code>&Theta;(log n)</code>", "Tree traversal, tree DP"],
      ["<code>T(n) = 2T(n/2) + O(n)</code>", "<code>&Theta;(n log n)</code>", "<code>&Theta;(n)</code>", "Merge sort, inversion counting, CDQ"],
      ["<code>T(n) = T(n/2) + O(n)</code>", "<code>&Theta;(n)</code>", "<code>&Theta;(1)</code>", "Quickselect (expected), binary search on a shrinking array"],
      ["<code>T(n) = T(n-1) + O(n)</code>", "<code>&Theta;(n&sup2;)</code>", "<code>&Theta;(n)</code>", "Only for small n; the stack is the real risk"],
      ["<code>T(n) = 2T(n-1) + O(1)</code>", "<code>&Theta;(2&#8319;)</code>", "<code>&Theta;(n)</code>", "Subset enumeration, n &le; 25"],
    ],
  },

  pitfalls: [
    { title: "Assuming recursion implies a logarithm",
      bug: "\"It is recursive, so the depth is <code>log n</code>.\" For " +
        "<code>T(n) = T(n-1) + 1</code> the depth is <code>n</code>, and at " +
        "<code>n = 10&#8309;</code> that is a <code>StackOverflowError</code>.",
      fix: "Ask whether the size is <em>divided</em> or <em>decremented</em>. Division gives " +
        "depth <code>log<sub>b</sub> n</code>; decrement gives depth <code>n</code>. Only the " +
        "first is safe at large <code>n</code>." },
    { title: "Applying the master theorem to overlapping subproblems",
      bug: "Analysing the naive Fibonacci recursion as <code>T(n) = 2T(n/2) + 1</code>. It is " +
        "actually <code>T(n) = T(n-1) + T(n-2) + 1</code>, which is " +
        "<code>&Theta;(&phi;&#8319;)</code>, exponential.",
      fix: "The master theorem needs subproblems of size <code>n/b</code>. If subproblems repeat, " +
        "the right framing is <a href=\"../10-dynamic-programming/dp-foundations.html\">DP</a>: " +
        "cost = number of distinct states &times; cost per transition." },
    { title: "Forgetting that case 3 has a regularity condition",
      bug: "Concluding <code>T(n) = &Theta;(f(n))</code> whenever <code>f</code> grows faster " +
        "than <code>n<sup>c</sup></code>, without checking " +
        "<code>a f(n/b) &le; d f(n)</code> for some <code>d &lt; 1</code>.",
      fix: "For every polynomial <code>f</code> the condition holds automatically, so in practice " +
        "you are safe &mdash; but say \"and <code>f</code> is polynomial so regularity holds\" so " +
        "the interviewer knows you did not forget it." },
    { title: "Counting the buffer allocation as free",
      bug: "A <code>merge</code> that does <code>int[] tmp = new int[hi-lo+1]</code> on every " +
        "call. The time class is unchanged, but you have made " +
        "<code>&Theta;(n)</code> allocations and the constant factor can be 3&ndash;5&times;.",
      fix: "Allocate one buffer of length <code>n</code> up front and pass it down, as in the " +
        "Merge sort tab. Also quote space as <code>&Theta;(n)</code> for the buffer plus " +
        "<code>&Theta;(log n)</code> for the stack." },
    { title: "Ignoring the gap between cases",
      bug: "Forcing <code>T(n) = 2T(n/2) + n/log n</code> into case 1 or case 2. Neither applies: " +
        "there is no <code>&epsilon; &gt; 0</code> with " +
        "<code>n/log n = O(n<sup>1-&epsilon;</sup>)</code>.",
      fix: "Sum the tree: each level costs about <code>n / log(n/2<sup>k</sup>)</code>, and the " +
        "total is <code>&Theta;(n log log n)</code>. When the theorem is silent, the tree still " +
        "answers." },
    { title: "Quoting quicksort as <code>&Theta;(n log n)</code> worst case",
      bug: "Quicksort's recurrence with an adversarial pivot is " +
        "<code>T(n) = T(n-1) + &Theta;(n) = &Theta;(n&sup2;)</code>. On sorted input with a " +
        "first-element pivot this is not hypothetical.",
      fix: "Say \"<code>&Theta;(n log n)</code> <em>expected</em> with a random pivot, " +
        "<code>&Theta;(n&sup2;)</code> worst case\". This is also why Java's " +
        "<code>Arrays.sort(int[])</code> can be attacked, and why " +
        "<code>Arrays.sort(Integer[])</code> (merge sort) cannot." },
  ],

  variants: [
    ["Unequal splits",
      "The master theorem needs one size <code>n/b</code>. With two different fractions, draw the " +
      "tree; if the fractions sum to 1 the tree is still <code>&Theta;(log n)</code> deep and the " +
      "answer is usually <code>&Theta;(n log n)</code>.",
      "T(n) = T(n/3) + T(2n/3) + n  =>  Theta(n log n)",
      "<a href=\"../04-recursion-and-dnc/divide-and-conquer.html\">Divide &amp; Conquer</a>"],
    ["Akra-Bazzi (many unequal terms)",
      "Generalises the master theorem to " +
      "<code>&Sigma; a<sub>i</sub> T(b<sub>i</sub> n) + f(n)</code>. You almost never need it, but " +
      "knowing the name is a good signal.",
      "find p with sum(a_i * b_i^p) = 1, then T = Theta(n^p (1 + integral))",
      "Reference only"],
    ["Substitution for non-standard shapes",
      "Change variables until the recurrence becomes standard. <code>m = log n</code> turns " +
      "<code>&radic;n</code> recursions into halving recursions.",
      "T(n) = 2T(sqrt n) + 1, m = log n  =>  S(m) = 2S(m/2) + 1 = Theta(m)",
      "<a href=\"../06-range-queries/sparse-table-and-rmq.html\">Sparse Table</a>"],
    ["Recurrence on the answer, not the input",
      "Divide and conquer over the value range instead of the array. Depth is " +
      "<code>log(maxValue)</code>, which is a constant like 30 or 60.",
      "T(range) = T(range/2) + O(n)  =>  O(n log maxValue)",
      "<a href=\"../01-arrays-and-windows/binary-search-on-answer.html\">Binary Search on Answer</a>"],
    ["Amortised recurrences",
      "When the split is guaranteed balanced only on average, state the expected bound and the " +
      "worst case separately.",
      "quickselect: E[T(n)] = T(n/2) + O(n) = O(n); worst O(n^2)",
      "<a href=\"../01-arrays-and-windows/kth-and-selection.html\">Selection</a>"],
  ],

  followups: [
    ["Derive merge sort's complexity from first principles.",
      "<p>Sorting <code>n</code> elements splits into two halves, each sorted recursively, then " +
      "merged in one linear pass, so <code>T(n) = 2T(n/2) + &Theta;(n)</code> with " +
      "<code>T(1) = &Theta;(1)</code>. At depth <code>k</code> there are <code>2<sup>k</sup></code> " +
      "calls on inputs of size <code>n/2<sup>k</sup></code>, so the level costs " +
      "<code>2<sup>k</sup> &middot; n/2<sup>k</sup> = n</code> &mdash; independent of " +
      "<code>k</code>. The recursion stops at depth <code>log&#8322; n</code>, giving " +
      "<code>n(log&#8322; n + 1) = &Theta;(n log n)</code>.</p>"],
    ["Why is the master theorem's answer <code>n<sup>log<sub>b</sub>a</sup></code> in case 1?",
      "<p>That expression <em>is</em> the number of leaves. The tree has depth " +
      "<code>log<sub>b</sub> n</code> and branching factor <code>a</code>, so it has " +
      "<code>a<sup>log<sub>b</sub>n</sup></code> leaves, and by the identity " +
      "<code>a<sup>log<sub>b</sub>n</sup> = n<sup>log<sub>b</sub>a</sup></code> that equals " +
      "<code>n<sup>c</sup></code>. Case 1 says the combine work is so small that the total is " +
      "just the cost of touching every leaf.</p>"],
    ["What is the space complexity of a recursive algorithm?",
      "<p><code>&Theta;(maximum depth)</code> for the call stack, plus whatever the combine step " +
      "allocates. Merge sort is <code>&Theta;(n)</code> total because of the buffer; quicksort is " +
      "<code>&Theta;(log n)</code> expected if you always recurse into the smaller side and loop " +
      "on the larger one. Note that the <em>number of nodes</em> in the recursion tree is " +
      "irrelevant to space &mdash; only the deepest path is live at any moment.</p>"],
    ["A recursion is 10&#8309; deep. How do you avoid a stack overflow in Java?",
      "<p>Three options, in order of preference. <strong>Rewrite iteratively</strong> with an " +
      "explicit <code>ArrayDeque</code> or <code>int[]</code> stack &mdash; always correct and " +
      "usually faster. <strong>Run on a thread with a bigger stack:</strong> " +
      "<code>new Thread(null, task, \"main\", 1 &lt;&lt; 26).start()</code>, which is a standard " +
      "competitive-programming trick. <strong>Reduce the depth</strong> by recursing into the " +
      "smaller subproblem first. The default JVM stack is around 512&nbsp;KB, roughly " +
      "10&#8308;&ndash;10&#8309; frames.</p>"],
    ["Why does Strassen's algorithm beat the naive matrix multiply?",
      "<p>Block multiplication gives <code>T(n) = 8T(n/2) + &Theta;(n&sup2;)</code>, and " +
      "<code>log&#8322;8 = 3</code>, so case 1 yields <code>&Theta;(n&sup3;)</code> &mdash; no " +
      "better than the triple loop. Strassen replaces 8 multiplications with 7 (at the cost of " +
      "more additions, which are still <code>&Theta;(n&sup2;)</code>), giving " +
      "<code>T(n) = 7T(n/2) + &Theta;(n&sup2;)</code> and " +
      "<code>&Theta;(n<sup>log&#8322;7</sup>) = &Theta;(n<sup>2.807</sup>)</code>. The general " +
      "lesson: in case 1, reducing <code>a</code> is the only thing that helps.</p>"],
    ["When should I not bother with a recurrence at all?",
      "<p>When subproblems overlap. Then the count of <em>distinct</em> subproblems is what " +
      "matters, and the cost is <code>states &times; transition</code>. Recursive Fibonacci is " +
      "<code>&Theta;(&phi;&#8319;)</code>; memoised, it is <code>&Theta;(n)</code>, and no " +
      "recurrence solving is involved &mdash; you simply count states. Recognising which of the " +
      "two situations you are in is more valuable than being fast at the master theorem.</p>"],
  ],

  problemsIntro: "For each of these, write the recurrence and solve it before you code, then " +
    "confirm your bound against the constraints.",

  problems: [
    { name: "Sort an Array", url: "https://leetcode.com/problems/sort-an-array/",
      badge: "lc", tag: "LC 912", level: "Medium",
      pattern: "Implement merge sort; state T(n) = 2T(n/2) + n and why Arrays.sort(int[]) is risky here" },
    { name: "Merge Sorted Array", url: "https://leetcode.com/problems/merge-sorted-array/",
      badge: "lc", tag: "LC 88", level: "Easy",
      pattern: "The merge step alone; the f(n) in the recurrence" },
    { name: "Maximum Subarray", url: "https://leetcode.com/problems/maximum-subarray/",
      badge: "lc", tag: "LC 53", level: "Medium",
      pattern: "Do the divide-and-conquer version: T(n) = 2T(n/2) + O(n)" },
    { name: "Search a 2D Matrix II", url: "https://leetcode.com/problems/search-a-2d-matrix-ii/",
      badge: "lc", tag: "LC 240", level: "Medium",
      pattern: "Quadrant recursion T(n) = 3T(n/2) + O(1); compare with the O(m+n) staircase walk" },
    { name: "Kth Largest Element in an Array", url: "https://leetcode.com/problems/kth-largest-element-in-an-array/",
      badge: "lc", tag: "LC 215", level: "Medium",
      pattern: "Quickselect: E[T(n)] = T(n/2) + O(n) = O(n) expected, O(n&sup2;) worst" },
    { name: "Count of Smaller Numbers After Self", url: "https://leetcode.com/problems/count-of-smaller-numbers-after-self/",
      badge: "lc", tag: "LC 315", level: "Hard",
      pattern: "Counting inversions inside merge sort; the recurrence is unchanged" },
    { name: "Reverse Pairs", url: "https://leetcode.com/problems/reverse-pairs/",
      badge: "lc", tag: "LC 493", level: "Hard",
      pattern: "Same recurrence, different merge predicate" },
    { name: "Beautiful Array", url: "https://leetcode.com/problems/beautiful-array/",
      badge: "lc", tag: "LC 932", level: "Medium",
      pattern: "Odd/even split recursion; depth log n and O(n log n) total" },
    { name: "Different Ways to Add Parentheses", url: "https://leetcode.com/problems/different-ways-to-add-parentheses/",
      badge: "lc", tag: "LC 241", level: "Medium",
      pattern: "Catalan-many results; the recurrence is not master-theorem shaped" },
    { name: "Ilya and Queries", url: "https://codeforces.com/problemset/problem/313/B",
      badge: "cf", tag: "CF 313B", level: "Easy",
      pattern: "Contrast: no recursion at all, just precomputation" },
    { name: "Karatsuba multiplication", url: "https://cses.fi/problemset/task/1755",
      badge: "cf", tag: "CSES", level: "Medium",
      pattern: "Recognise 3T(n/2) + O(n) = O(n^1.585) versus the schoolbook O(n&sup2;)" },
    { name: "Number of Ways to Reorder Array to Get Same BST", url: "https://leetcode.com/problems/number-of-ways-to-reorder-array-to-get-same-bst/",
      badge: "lc", tag: "LC 1569", level: "Hard",
      pattern: "Recursion over subtree sizes with a binomial combine; write the recurrence first" },
  ],

  spoilers: [
    { summary: "Hint for LC 240 &mdash; when a worse recurrence beats a better-looking one",
      body: "<p>The quadrant recursion discards one of four quadrants, giving " +
        "<code>T(n) = 3T(n/2) + O(1)</code>, i.e. " +
        "<code>&Theta;(n<sup>log&#8322;3</sup>) = &Theta;(n<sup>1.585</sup>)</code> where " +
        "<code>n</code> is the side length &mdash; about <code>&Theta;(m<sup>0.79</sup>)</code> in " +
        "terms of the <code>m = n&sup2;</code> cells. That is better than scanning everything, but " +
        "the staircase walk from the top-right corner is <code>O(m + n)</code> and four lines " +
        "long. The transferable lesson: <em>a clever recurrence is not automatically the best " +
        "answer; always compare it against the simplest monotonicity argument.</em></p>" },
    { summary: "Hint for LC 1569 &mdash; setting up the recurrence",
      body: "<p>The first element is forced to be the root, which partitions the rest into the " +
        "elements smaller than it (left subtree, size <code>L</code>) and larger (right subtree, " +
        "size <code>R</code>). Any interleaving of the two subsequences preserves the BST, so the " +
        "count is <code>C(L+R, L) &times; f(left) &times; f(right)</code>. That gives " +
        "<code>T(n) = T(L) + T(R) + O(n)</code>, which is <code>O(n&sup2;)</code> worst case and " +
        "<code>O(n log n)</code> when balanced. You will need " +
        "<a href=\"../11-math-and-number-theory/combinatorics.html\">nCr under a modulus</a>. " +
        "General lesson: <em>when a recursive structure is forced by the data, the recurrence " +
        "writes itself &mdash; find the forced choice first.</em></p>" },
  ],

  recap: {
    bullets: [
      "<strong>Draw the tree, not the algebra.</strong> Total work is " +
        "<code>&Sigma;<sub>k</sub> a<sup>k</sup> f(n/b<sup>k</sup>)</code>, a geometric series, " +
        "and a geometric series is owned by its larger end.",
      "<strong>Compare <code>f(n)</code> with <code>n<sup>log<sub>b</sub>a</sup></code></strong> " +
        "&mdash; the cost of the leaves. Smaller means leaves win, equal means multiply by " +
        "<code>log n</code>, larger means the root wins.",
      "<strong>Divide versus subtract is the first check.</strong> <code>T(n/2)</code> means depth " +
        "<code>log n</code>; <code>T(n-1)</code> means depth <code>n</code> and a real stack-overflow risk.",
      "<strong>Overlapping subproblems are not a recurrence problem.</strong> Switch to counting " +
        "states &times; transitions, which is dynamic programming.",
      "<strong>Space is the depth of the tree</strong>, plus any buffers &mdash; never the number of nodes.",
    ],
    oneliner: "T(n)=aT(n/b)+f(n), c=log_b(a):  f<n^c -> n^c  |  f=n^c*log^k -> n^c*log^(k+1)  |  f>n^c -> f(n)",
  },
},

/* =================================== 3. constraints-to-complexity ======= */
{
  id: "constraints-to-complexity",
  difficulty: "Easy",
  readTime: "25 min",
  tagline: "The single highest-leverage page in this course: read the constraint line, and the " +
    "problem tells you which algorithm it wants before you have understood the question.",
  tags: ["pattern recognition", "constraints", "triage", "meta"],
  prereqs: [["Complexity Analysis", "complexity-analysis.html"]],

  why: {
    paras: [
      "Every problem statement contains a hint that is impossible to hide: the bounds. A setter " +
      "who wants an <code>O(n log n)</code> solution must set <code>n</code> large enough to kill " +
      "<code>O(n&sup2;)</code> and small enough that <code>O(n log n)</code> passes. That pins the " +
      "bound into a narrow window. Read the window backwards and you recover the intended " +
      "complexity, which usually recovers the intended <em>technique</em>.",
      "This is the specific skill that decays when you stop competing. Experienced engineers still " +
      "know what a segment tree is; what they lose is the reflex that says " +
      "\"<code>n &le; 20</code>, therefore subsets, therefore bitmask\" in under two seconds. " +
      "Recovering that reflex is worth more than re-reading any single algorithm.",
      "It also protects you in interviews where no constraints are given. Ask for them. " +
      "\"How large is <code>n</code>?\" is not a stalling question &mdash; it is the question that " +
      "determines whether the expected answer is two pointers or a suffix automaton, and asking " +
      "it signals that you think about cost before you think about code.",
    ],
    insightTitle: "How to use this page",
    insight: "Cover the right-hand column of the main table below. Read a constraint, say the " +
      "complexity and the likely technique out loud, then reveal. Do this once a week. It takes " +
      "four minutes and it is the highest-return four minutes in your preparation.",
  },

  recognise: {
    yes: [
      "There is an explicit bound on <code>n</code>, <code>m</code>, <code>q</code>, " +
        "<code>a<sub>i</sub></code>, or the sum of <code>n</code> over test cases",
      "A bound looks oddly specific &mdash; <code>n &le; 22</code>, <code>n &le; 500</code>, " +
        "<code>n &le; 5000</code> &mdash; which is a deliberate signature, not a round number",
      "Two different parameters are bounded differently " +
        "(<code>n &le; 10&#8309;</code> but <code>a<sub>i</sub> &le; 100</code>) &rarr; the small " +
        "one is your state space",
      "The time limit is unusually generous (3&ndash;5 s) &rarr; a heavy log factor or " +
        "<code>&radic;n</code> approach is expected",
      "Memory limit is tight (32&nbsp;MB or 64&nbsp;MB) &rarr; the intended solution has " +
        "<code>O(n)</code> or <code>O(&radic;n)</code> space, ruling out some DP tables",
    ],
    no: [
      "No constraints are given at all &rarr; <strong>ask</strong>; do not assume",
      "The bound is on the output size rather than the input &rarr; the complexity is " +
        "output-sensitive, and enumeration may be unavoidable",
      "The problem is interactive with a query budget &rarr; the \"complexity\" you must respect " +
        "is the number of queries (often <code>log n</code> or <code>n log n</code>)",
      "It is a constructive problem (\"output any valid arrangement\") &rarr; the bound tells you " +
        "the output size, and the difficulty is the invariant, not the running time",
    ],
    table: [
      ["<code>n &le; 10</code>", "Factorial or exponential search is fine", "Permutations, brute force, full DFS"],
      ["<code>n &le; 20&ndash;25</code>", "<code>2&#8319;</code> is 10&#8310;&ndash;3&times;10&#8311;",
        "<a href=\"../02-sorting-hashing-bits/bit-manipulation.html\">Bitmask</a> enumeration, " +
        "<a href=\"../10-dynamic-programming/bitmask-dp.html\">bitmask DP</a>, meet in the middle"],
      ["<code>n &le; 40</code>", "<code>2&#8319;</code> is too big, <code>2<sup>n/2</sup></code> is not",
        "<a href=\"../04-recursion-and-dnc/meet-in-the-middle.html\">Meet in the middle</a>"],
      ["<code>n &le; 100</code>", "<code>n&#8308;</code> = 10&#8312; is borderline, <code>n&sup3;</code> is safe",
        "<a href=\"../10-dynamic-programming/interval-dp.html\">Interval DP</a>, " +
        "<a href=\"../08-graphs-advanced/max-flow-min-cut.html\">flows</a>, triple loops"],
      ["<code>n &le; 500</code>", "<code>n&sup3;</code> = 1.25&times;10&#8312;",
        "<a href=\"../08-graphs-advanced/floyd-warshall.html\">Floyd-Warshall</a>, " +
        "<a href=\"../10-dynamic-programming/interval-dp.html\">O(n&sup3;) interval DP</a>"],
      ["<code>n &le; 5000</code>", "<code>n&sup2;</code> = 2.5&times;10&#8311;",
        "<code>O(n&sup2;)</code> DP such as <a href=\"../10-dynamic-programming/lis.html\">LIS</a> " +
        "or <a href=\"../10-dynamic-programming/string-dp.html\">edit distance</a>"],
      ["<code>n &le; 10&#8309;</code> / <code>2&times;10&#8309;</code>", "The most common bound in existence",
        "<code>O(n log n)</code>: sort, " +
        "<a href=\"../01-arrays-and-windows/two-pointers.html\">two pointers</a>, " +
        "<a href=\"../01-arrays-and-windows/binary-search-on-answer.html\">binary search on answer</a>, " +
        "<a href=\"../06-range-queries/segment-tree.html\">segment tree</a>"],
      ["<code>n &le; 10&#8310;&ndash;10&#8311;</code>", "Even a <code>log</code> factor may be too slow",
        "<code>O(n)</code>: counting, prefix sums, sieve, linear DP, fast IO mandatory"],
      ["<code>n &le; 10&#8313;&ndash;10&sup1;&#8312;</code>", "You cannot even read the input",
        "<a href=\"../11-math-and-number-theory/matrix-exponentiation.html\">Matrix power</a>, " +
        "<a href=\"../10-dynamic-programming/digit-dp.html\">digit DP</a>, closed-form maths, " +
        "<code>O(&radic;n)</code> factorisation"],
      ["<code>a<sub>i</sub> &le; 10&#8309;</code> while <code>n &le; 10&#8309;</code>",
        "The value range is a legitimate state space",
        "Counting arrays, <a href=\"../11-math-and-number-theory/primes-and-sieves.html\">sieve</a>, DP over values"],
      ["<code>q</code> queries and <code>n</code> elements, both 10&#8309;",
        "<code>O(nq)</code> = 10&sup1;&#8304; is dead", "Precomputation, offline sorting, " +
        "<a href=\"../06-range-queries/fenwick-tree.html\">BIT</a>, " +
        "<a href=\"../13-greedy-and-offline/mos-algorithm.html\">Mo's</a>"],
      ["<strong>Confused with:</strong> \"sum of <code>n</code> over all tests &le; 2&times;10&#8309;\"",
        "The <em>total</em> is bounded, so per-test <code>O(n log n)</code> is fine even with 10&#8308; tests",
        "Never allocate <code>O(maxN)</code> per test case"],
    ],
    constraint: "Java's budget is roughly <code>10&#8312;</code> simple operations per second. " +
      "Halve it for <code>HashMap</code>-heavy code, quarter it for boxed collections, and add " +
      "0.5&ndash;1&nbsp;s of JVM startup on some judges.",
  },

  core: {
    heading: "Core idea: read the bound backwards",
    paras: [
      "A setter chooses bounds to separate solutions. If <code>O(n&sup2;)</code> should fail and " +
      "<code>O(n log n)</code> should pass, <code>n</code> has to land somewhere around " +
      "<code>10&#8309;</code>. There is no way to write the statement without leaking that. So the " +
      "procedure is: take the bound, compute which complexity classes fit inside " +
      "<code>10&#8312;</code> operations, and then ask which techniques deliver those classes.",
      "The second half of that procedure is the part people forget. Knowing " +
      "\"<code>n &le; 20</code> means <code>O(2&#8319;)</code>\" is only half an answer; the " +
      "useful reflex is \"<code>O(2&#8319;)</code> over <code>n &le; 20</code> means the state is " +
      "a <em>subset</em>, so I am enumerating masks or writing bitmask DP\". Complexity classes " +
      "map to a small number of state shapes, and that mapping is what you are drilling.",
      "Two refinements matter in practice. First, look for a <strong>second, smaller bound</strong>: " +
      "when <code>n</code> is huge but <code>a<sub>i</sub> &le; 100</code> or " +
      "<code>k &le; 10</code>, the small parameter is almost always the DP dimension. Second, " +
      "unusual bounds are signatures: <code>n &le; 40</code> means meet in the middle, " +
      "<code>n &le; 500</code> means <code>O(n&sup3;)</code>, and a bound of " +
      "<code>10&sup1;&#8312;</code> means you will never iterate over the input at all.",
    ],
    invariantTitle: "The reflex to rebuild",
    invariant: "<p>Given a bound, complete this sentence without pausing: " +
      "<em>\"<code>n &le; X</code>, so I have about <code>Y</code> operations to spend, so the " +
      "intended complexity is <code>Z</code>, so the state is probably <code>W</code>.\"</em></p>" +
      "<p>For example: <em>\"<code>n &le; 22</code>, so about 4&times;10&#8310; masks, so " +
      "<code>O(2&#8319; &middot; n)</code>, so the state is a subset of items plus a last " +
      "element &mdash; travelling-salesman-shaped bitmask DP.\"</em></p>",
    extra: [
      { kind: "tip", title: "Powers of two worth knowing cold",
        html: "<p><code>2&sup1;&#8304; = 1024</code>, <code>2&sup2;&#8304; &asymp; 10&#8310;</code>, " +
          "<code>2&sup3;&#8304; &asymp; 10&#8313;</code>, <code>2&#8310;&#8304; &asymp; 10&sup1;&#8312;</code>. " +
          "Also <code>10! &asymp; 3.6&times;10&#8310;</code>, <code>13! &asymp; 6&times;10&#8313;</code>, " +
          "and <code>log&#8322;(10&#8310;) &asymp; 20</code>. These five facts let you price almost " +
          "any bound in your head. And note the boundary of <code>int</code>: " +
          "<code>2&sup3;&sup1; &minus; 1 &asymp; 2.1&times;10&#8313;</code>, so a bound of " +
          "<code>10&#8313;</code> on values plus any summing means <code>long</code>.</p>" },
      { kind: "warn", title: "The sum-over-test-cases trap",
        html: "<p><code>t &le; 10&#8308;</code> with \"the sum of <code>n</code> over all test " +
          "cases does not exceed 2&times;10&#8309;\" is <em>not</em> permission to be slow, and it " +
          "is also not a reason to fear <code>O(n log n)</code>. It means your per-test work must " +
          "be proportional to <em>that test's</em> <code>n</code>. The classic failure is " +
          "clearing an <code>O(maxN)</code> array every test: 10&#8308; tests times " +
          "2&times;10&#8309; clears is 2&times;10&#8313; operations. Clear only the indices you " +
          "touched.</p>" },
      { kind: "math", title: "Reading the memory limit too",
        html: "<p>256&nbsp;MB holds about 6&times;10&#8311; <code>int</code>s or " +
          "3&times;10&#8311; <code>long</code>s. So a 2D <code>int</code> DP table of " +
          "<code>5000 &times; 5000</code> is 100&nbsp;MB &mdash; it fits, barely. " +
          "<code>10&#8309; &times; 100</code> is 40&nbsp;MB, fine. " +
          "<code>10&#8309; &times; 10&#8309;</code> is impossible, which is itself a hint that the " +
          "DP must be rolled down to one or two rows.</p>" },
    ],
  },

  visuals: [
    {
      kind: "grid", vizId: "constraintMap",
      h3: "The lookup table, one row at a time",
      intro: "Rows are input bounds; the columns are the deduction chain. Step through it and say " +
        "each row out loud before revealing the next. After a few passes the middle column " +
        "becomes automatic, which is the entire goal.",
      caption: "Bound &rarr; budget &rarr; complexity &rarr; state shape. The right-hand column is " +
        "the one that actually wins interviews, because it names the technique rather than the cost.",
      data: {
        corner: "bound",
        rowHeads: ["n\u226410", "n\u226425", "n\u226440", "n\u2264100", "n\u2264500",
                   "n\u22645e3", "n\u22641e5", "n\u22641e6", "n\u22641e9", "n\u22641e18"],
        colHeads: ["ops available", "target complexity", "typical state shape"],
        vars: ["bound", "say this out loud"],
        speed: 1500,
        frames: [
          { note: "n <= 10: permutations are only 3.6e6, so exhaustive search is intended. Write the clearest brute force you can.",
            cells: [{ r: 0, c: 0, val: "n!" }, { r: 0, c: 1, val: "O(n!)", cls: "target" },
                    { r: 0, c: 2, val: "orderings" }],
            values: { bound: "n\u226410", "say this out loud": "permute everything" } },
          { note: "n <= 25: 2^n masks. This bound is almost a signature for subsets. If there is also a 'last chosen' element, it is bitmask DP.",
            cells: [{ r: 1, c: 0, val: "3e7" }, { r: 1, c: 1, val: "O(2\u207f\u00b7n)", cls: "target" },
                    { r: 1, c: 2, val: "subset mask" }],
            values: { bound: "n\u226425", "say this out loud": "bitmask" } },
          { note: "n <= 40: 2^40 is 1e12, too big; 2^20 per half is 1e6. Split the input in two and combine.",
            cells: [{ r: 2, c: 0, val: "2\u00b72^(n/2)" }, { r: 2, c: 1, val: "O(2^(n/2)\u00b7n)", cls: "target" },
                    { r: 2, c: 2, val: "two halves" }],
            values: { bound: "n\u226440", "say this out loud": "meet in the middle" } },
          { note: "n <= 100: n^4 = 1e8 is borderline, n^3 = 1e6 is comfortable. Interval DP and flow modelling live here.",
            cells: [{ r: 3, c: 0, val: "1e8" }, { r: 3, c: 1, val: "O(n\u00b3)\u2013O(n\u2074)", cls: "target" },
                    { r: 3, c: 2, val: "(i,j) intervals" }],
            values: { bound: "n\u2264100", "say this out loud": "interval DP or flow" } },
          { note: "n <= 500: n^3 = 1.25e8. This exact bound is the Floyd-Warshall signature; if the problem is about all-pairs distances, stop looking.",
            cells: [{ r: 4, c: 0, val: "1.25e8" }, { r: 4, c: 1, val: "O(n\u00b3)", cls: "target" },
                    { r: 4, c: 2, val: "all pairs" }],
            values: { bound: "n\u2264500", "say this out loud": "Floyd-Warshall" } },
          { note: "n <= 5000: n^2 = 2.5e7. Two-dimensional DP over prefixes: LIS the slow way, edit distance, LCS.",
            cells: [{ r: 5, c: 0, val: "2.5e7" }, { r: 5, c: 1, val: "O(n\u00b2)", cls: "target" },
                    { r: 5, c: 2, val: "(i,j) prefixes" }],
            values: { bound: "n\u22645e3", "say this out loud": "quadratic DP" } },
          { note: "n <= 1e5: the most common bound there is. n^2 = 1e10 is dead, so you need sorting, two pointers, binary search, or a log-factor structure.",
            cells: [{ r: 6, c: 0, val: "1e8" }, { r: 6, c: 1, val: "O(n log n)", cls: "target" },
                    { r: 6, c: 2, val: "sorted order / tree" }],
            values: { bound: "n\u22641e5", "say this out loud": "sort, two pointers, or segment tree" } },
          { note: "n <= 1e6: even a log factor is uncomfortable. Aim for a single linear pass, and switch to BufferedReader.",
            cells: [{ r: 7, c: 0, val: "1e8" }, { r: 7, c: 1, val: "O(n)", cls: "target" },
                    { r: 7, c: 2, val: "one pass / counting" }],
            values: { bound: "n\u22641e6", "say this out loud": "linear, and fix your IO" } },
          { note: "n <= 1e9: you cannot iterate the input. Either the answer has a closed form, or the state is the digits, or you factorise in O(sqrt n).",
            cells: [{ r: 8, c: 0, val: "\u2014" }, { r: 8, c: 1, val: "O(log n) / O(\u221an)", cls: "target" },
                    { r: 8, c: 2, val: "digits / divisors" }],
            values: { bound: "n\u22641e9", "say this out loud": "maths, not iteration" } },
          { note: "n <= 1e18: definitely maths. Matrix exponentiation for linear recurrences, digit DP for counting, and long everywhere.",
            cells: [{ r: 9, c: 0, val: "\u2014" }, { r: 9, c: 1, val: "O(log n)", cls: "target" },
                    { r: 9, c: 2, val: "matrix power / digit DP" }],
            values: { bound: "n\u22641e18", "say this out loud": "closed form or log-time power" } },
          { note: "Now cover the middle and right columns and go back to the top. Recall, not recognition, is what you are training.",
            cells: [{ r: 1, c: 2, val: "subset mask", cls: "answer" }, { r: 4, c: 2, val: "all pairs", cls: "answer" },
                    { r: 6, c: 2, val: "sorted order / tree", cls: "answer" }],
            values: { bound: "drill it", "say this out loud": "weekly" } },
        ],
      },
    },
    {
      kind: "array", vizId: "budget",
      h3: "Where the one-second wall sits",
      intro: "Each cell is an input size; the value is how many operations an " +
        "<code>O(n&sup2;)</code> solution would perform. Watch exactly where it crosses " +
        "<code>10&#8312;</code> &mdash; that crossing point is what \"<code>n &le; 5000</code> " +
        "means quadratic\" really encodes.",
      caption: "Operation counts for <code>O(n&sup2;)</code>. The wall is between " +
        "<code>n = 10&#8308;</code> and <code>n = 3&times;10&#8308;</code>, which is why setters " +
        "who want to allow quadratic solutions choose bounds near 5000.",
      data: {
        label: "n\u00b2 operations for n =",
        array: ["1e2", "1e3", "3e3", "5e3", "1e4", "3e4", "1e5", "1e6"],
        indexLabels: ["100", "1e3", "3e3", "5e3", "1e4", "3e4", "1e5", "1e6"],
        vars: ["n", "n\u00b2 ops", "verdict"],
        speed: 950,
        frames: [
          { note: "n = 100 gives 1e4 operations. Instant. At this size even O(n^4) is fine.",
            active: [0], arr: ["1e4", "1e6", "9e6", "2.5e7", "1e8", "9e8", "1e10", "1e12"],
            done: [], dim: [1,2,3,4,5,6,7], values: { n: "100", "n\u00b2 ops": "1e4", verdict: "instant" } },
          { note: "n = 1000 gives 1e6. Still instant, and this is why n <= 1000 usually means the setter allows O(n^2) or even O(n^2 log n).",
            active: [1], done: [0], dim: [2,3,4,5,6,7], values: { n: "1e3", "n\u00b2 ops": "1e6", verdict: "instant" } },
          { note: "n = 3000 gives 9e6. Comfortable.",
            active: [2], done: [0,1], dim: [3,4,5,6,7], values: { n: "3e3", "n\u00b2 ops": "9e6", verdict: "fine" } },
          { note: "n = 5000 gives 2.5e7. Fine in Java with primitive arrays. This is the classic 'quadratic DP intended' bound.",
            active: [3], done: [0,1,2], dim: [4,5,6,7], values: { n: "5e3", "n\u00b2 ops": "2.5e7", verdict: "fine" } },
          { note: "n = 1e4 gives 1e8. Exactly at the wall: it passes with tight primitive loops and fails with boxed collections.",
            active: [4], window: [4, 4], done: [0,1,2,3], dim: [5,6,7],
            values: { n: "1e4", "n\u00b2 ops": "1e8", verdict: "borderline" } },
          { note: "n = 3e4 gives 9e8. About 10 seconds. Over the wall.",
            active: [5], x: [5], done: [0,1,2,3,4], dim: [6,7],
            values: { n: "3e4", "n\u00b2 ops": "9e8", verdict: "too slow" } },
          { note: "n = 1e5 gives 1e10, roughly two minutes. This is why n <= 1e5 is the universal signal that quadratic is out.",
            active: [6], x: [5,6], done: [0,1,2,3,4], dim: [7],
            values: { n: "1e5", "n\u00b2 ops": "1e10", verdict: "hopeless" } },
          { note: "n = 1e6 gives 1e12. Hours. Meanwhile O(n log n) at the same size is 2e7 \u2014 five hundred thousand times cheaper.",
            active: [7], x: [5,6,7], done: [0,1,2,3,4],
            values: { n: "1e6", "n\u00b2 ops": "1e12", verdict: "hopeless" } },
          { note: "The green band is where O(n^2) lives: n up to about 1e4. Memorise the boundary, not the table.",
            best: [0,1,2,3], x: [5,6,7], window: [4,4],
            values: { n: "\u2014", "n\u00b2 ops": "wall at 1e8", verdict: "n \u2264 ~1e4" } },
        ],
      },
    },
    {
      kind: "mermaid", vizId: "constraintFlow",
      h3: "Triage flow for a fresh problem",
      caption: "Run this before you start solving. It takes about fifteen seconds and eliminates " +
        "most wrong directions.",
      src: `flowchart TD
  read(["read the constraint line"]) --> two{"is there a second, smaller bound?"}
  two -- yes --> small["make the small parameter your DP dimension"]
  two -- no --> size{"how big is n?"}
  small --> size
  size -- "n <= 25" --> mask["subsets: bitmask or bitmask DP"]
  size -- "n <= 40" --> mitm["split in half: meet in the middle"]
  size -- "n <= 500" --> cubic["O(n^3): Floyd-Warshall, interval DP, flow"]
  size -- "n <= 5000" --> quad["O(n^2) DP over prefix pairs"]
  size -- "n <= 2e5" --> nlogn["O(n log n): sort, two pointers, binary search, segment tree"]
  size -- "n <= 1e7" --> linear["O(n): counting, prefix sums, sieve, fast IO"]
  size -- "n >= 1e9" --> maths["maths: matrix power, digit DP, closed form"]
  nlogn --> queries{"are there q queries too?"}
  queries -- yes --> offline["precompute, or go offline: BIT, Mo's, sweep"]
  queries -- no --> done(["start solving"])`,
      wide: true,
    },
  ],

  steps: [
    "<strong>Find every bound</strong> in the statement: <code>n</code>, <code>m</code>, " +
      "<code>q</code>, <code>k</code>, value ranges, and the sum-over-tests clause.",
    "<strong>Pick the largest one</strong> and compute the operation budget: about " +
      "<code>10&#8312;</code> divided by nothing if you use primitive arrays, by 2&ndash;5 if you " +
      "use collections.",
    "<strong>List the complexity classes that fit.</strong> Usually only two survive, which is the " +
      "whole point of the exercise.",
    "<strong>Look for a second, smaller bound.</strong> If <code>k &le; 10</code> or " +
      "<code>a<sub>i</sub> &le; 100</code>, that parameter is almost certainly a DP dimension or " +
      "a state.",
    "<strong>Translate the class into a state shape:</strong> subsets, prefix pairs, intervals, " +
      "sorted order, digits, or all pairs.",
    "<strong>Check the memory limit</strong> against your intended table. If it does not fit, the " +
      "DP is meant to be rolled to one or two rows.",
    "<strong>Sanity-check the output type.</strong> Bounds near <code>10&#8313;</code> with any " +
      "summation or multiplication mean <code>long</code>.",
    "<strong>Only now start solving</strong>, with the target complexity already fixed.",
  ],

  dryRun: {
    intro: "Ten real constraint lines and the deduction each one forces. This is the exercise to " +
      "repeat weekly &mdash; cover the last two columns first.",
    cols: ["#", "Constraint line", "Budget", "Target", "State shape"],
    rows: [
      { cells: ["1", "<code>1 &le; n &le; 22</code>", "4&times;10&#8310; masks", "<code>O(2&#8319;&middot;n)</code>", "subset + last element"],
        action: "Bitmask DP. The oddly specific 22 exists so <code>2&#8319;&middot;n</code> fits.", change: true },
      { cells: ["2", "<code>n &le; 16</code>, grid <code>n&times;n</code>", "2&#8310; masks", "<code>O(2&#8319;&middot;n&sup2;)</code>", "column mask per row"],
        action: "Broken-profile / tiling DP over rows." },
      { cells: ["3", "<code>n &le; 40</code>, subset sum", "2&times;2&sup2;&#8304;", "<code>O(2<sup>n/2</sup> log)</code>", "two halves, sorted"],
        action: "Meet in the middle. 40 is the signature.", change: true },
      { cells: ["4", "<code>n &le; 400</code>, remove stones", "6&times;10&#8311;", "<code>O(n&sup3;)</code>", "interval (l, r)"],
        action: "Interval DP; the cube of 400 is the budget." },
      { cells: ["5", "<code>n &le; 500</code>, all-pairs distance", "1.25&times;10&#8312;", "<code>O(n&sup3;)</code>", "dist[i][j]"],
        action: "Floyd-Warshall, essentially always.", change: true },
      { cells: ["6", "<code>n &le; 2000</code>, two strings", "4&times;10&#8310;", "<code>O(nm)</code>", "prefix pair (i, j)"],
        action: "Edit distance / LCS shaped DP." },
      { cells: ["7", "<code>n &le; 2&times;10&#8309;</code>, <code>a<sub>i</sub> &le; 10&#8313;</code>", "&asymp;3.5&times;10&#8310; steps", "<code>O(n log n)</code>", "sorted order"],
        action: "Sort then two pointers or binary search. <code>a<sub>i</sub></code> at 10&#8313; means <code>long</code> sums.", change: true },
      { cells: ["8", "<code>n, q &le; 2&times;10&#8309;</code>, range updates", "&asymp;7&times;10&#8310;", "<code>O((n+q) log n)</code>", "segment tree node"],
        action: "Lazy segment tree or BIT with a difference array." },
      { cells: ["9", "<code>n &le; 10&#8310;</code>, <code>a<sub>i</sub> &le; 10&#8310;</code>", "10&#8312;", "<code>O(n log log n)</code>", "value-indexed array"],
        action: "Sieve or counting over values, not over indices." },
      { cells: ["10", "<code>1 &le; n &le; 10&sup1;&#8312;</code>, count nice numbers", "&mdash;", "<code>O(18 &middot; states)</code>", "digit position + carry flags"],
        action: "Digit DP. A 10&sup1;&#8312; bound is never about iteration.", change: true },
    ],
    after: `<aside class="callout callout--tip">
  <div class="callout__icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg></div>
  <div class="callout__body">
    <span class="callout__title">Drill format</span>
    <p>Cover the last two columns. Read a constraint line, say the target complexity and the state
    shape aloud, then reveal. Eight out of ten in under two minutes means the reflex is back.</p>
  </div>
</aside>`,
  },

  code: [
    { tab: "Budget calculator", panel: "Budget calculator", file: "ConstraintTriage.java",
      intro: "Run this once and read the output as a table. Seeing your own machine confirm the " +
        "boundaries makes them stick better than reading them.",
      code: `public class ConstraintTriage {

    private static final double BUDGET = 1e8;   // rough ops/second for Java

    static double ops(String cls, double n) {
        switch (cls) {
            case "log n":     return Math.log(n) / Math.log(2);
            case "sqrt n":    return Math.sqrt(n);
            case "n":         return n;
            case "n log n":   return n * Math.log(n) / Math.log(2);
            case "n^2":       return n * n;
            case "n^3":       return n * n * n;
            case "2^n":       return Math.pow(2, n);
            case "n!":        return gamma(n);
            default:          throw new IllegalArgumentException(cls);
        }
    }

    private static double gamma(double n) {
        double f = 1;
        for (int i = 2; i <= n && f < 1e300; i++) {
            f *= i;
        }
        return f;
    }

    public static void main(String[] args) {
        String[] classes = {"log n", "sqrt n", "n", "n log n", "n^2", "n^3", "2^n", "n!"};
        double[] sizes = {10, 25, 100, 500, 5000, 100000, 1000000};
        System.out.printf("%-8s", "class");
        for (double n : sizes) {
            System.out.printf("%12s", "n=" + (long) n);
        }
        System.out.println();
        for (String c : classes) {
            System.out.printf("%-8s", c);
            for (double n : sizes) {
                double o = ops(c, n);
                System.out.printf("%12s", (o <= BUDGET ? "OK " : "-- ")
                        + String.format("%.0e", o));
            }
            System.out.println();
        }
    }
    // Output (abridged): the OK/-- boundary runs diagonally, exactly as in the table above.
}`,
    },
    { tab: "The sum-over-tests trap", panel: "Multi-test trap", file: "MultiTestPattern.java",
      intro: "The correct skeleton for <code>t</code> test cases with a bounded total. The whole " +
        "point is the clearing strategy: touch only what you used.",
      highlight: "22-25",
      code: `import java.io.DataInputStream;
import java.io.IOException;

public class MultiTestPattern {

    static final int MAX = 200_001;
    static int[] cnt = new int[MAX];        // allocated once, never per test

    /**
     * WRONG: java.util.Arrays.fill(cnt, 0) per test is O(MAX) each, so with
     * t = 1e4 tests that is 2e9 writes even though the total n is only 2e5.
     * RIGHT: undo exactly the indices this test touched.
     */
    static long solveOneTest(int[] a) {
        long distinctPairs = 0;
        for (int v : a) {
            distinctPairs += cnt[v];       // pairs with an earlier equal value
            cnt[v]++;
        }
        for (int v : a) {
            cnt[v] = 0;                    // O(n), not O(MAX)
        }
        return distinctPairs;
    }

    public static void main(String[] args) throws IOException {
        FastReader in = new FastReader();
        int t = in.nextInt();
        StringBuilder out = new StringBuilder();
        while (t-- > 0) {
            int n = in.nextInt();
            int[] a = new int[n];
            for (int i = 0; i < n; i++) {
                a[i] = in.nextInt();
            }
            out.append(solveOneTest(a)).append('\\n');
        }
        System.out.print(out);             // one write, not n writes
    }

    /** Minimal fast reader; see the Java for DSA page for the full version. */
    static class FastReader {
        private final DataInputStream in = new DataInputStream(System.in);
        int nextInt() throws IOException {
            int ret = 0, b = in.read();
            while (b < '0') {
                b = in.read();
            }
            while (b >= '0') {
                ret = ret * 10 + (b - '0');
                b = in.read();
            }
            return ret;
        }
    }
    // Input : 2 / 3 / 1 1 2 / 2 / 5 5
    // Output: 1
    //         1
}`,
    },
  ],

  complexity: {
    time: "meta-topic",
    space: "meta-topic",
    derivation: [
      "<p>The whole page rests on inverting one inequality. If the intended complexity is " +
      "<code>f(n)</code> and the budget is <code>B &asymp; 10&#8312;</code>, the setter must " +
      "choose <code>n</code> with <code>f(n) &le; B</code> for the intended solution and " +
      "<code>g(n) &gt; B</code> for the solution being excluded. Solving " +
      "<code>f(n) = B</code> gives the boundary:</p>",
      "<span class=\"eq\">n&sup2; = 10&#8312; &rArr; n = 10&#8308;&nbsp;&nbsp;&nbsp; n&sup3; = 10&#8312; &rArr; n &asymp; 464&nbsp;&nbsp;&nbsp; 2&#8319; = 10&#8312; &rArr; n &asymp; 26&nbsp;&nbsp;&nbsp; n! = 10&#8312; &rArr; n &asymp; 11</span>",
      "<p>Those four numbers explain almost every bound you will ever see: <code>n &le; 5000</code> " +
      "(quadratic, with headroom), <code>n &le; 500</code> (cubic), <code>n &le; 20&ndash;25</code> " +
      "(exponential), <code>n &le; 10</code> (factorial). And for the linearithmic case:</p>",
      "<span class=\"eq\">n log&#8322; n = 10&#8312; &rArr; n &asymp; 4&times;10&#8310;</span>",
      "<p>which is why <code>n &le; 10&#8309;</code> or <code>2&times;10&#8309;</code> is such a " +
      "comfortable, and therefore common, choice for an <code>O(n log n)</code> problem: it leaves " +
      "a 20&ndash;40&times; safety margin for slow languages.</p>",
    ],
    compare: [
      ["<code>n &le; 10</code>", "<code>O(n!)</code>", "<code>O(n)</code>", "Permutation brute force"],
      ["<code>n &le; 25</code>", "<code>O(2&#8319; n)</code>", "<code>O(2&#8319;)</code>", "Bitmask enumeration or DP"],
      ["<code>n &le; 40</code>", "<code>O(2<sup>n/2</sup> n)</code>", "<code>O(2<sup>n/2</sup>)</code>", "Meet in the middle"],
      ["<code>n &le; 500</code>", "<code>O(n&sup3;)</code>", "<code>O(n&sup2;)</code>", "Floyd-Warshall, interval DP"],
      ["<code>n &le; 5000</code>", "<code>O(n&sup2;)</code>", "<code>O(n)</code> rolled", "Prefix-pair DP"],
      ["<code>n &le; 2&times;10&#8309;</code>", "<code>O(n log n)</code>", "<code>O(n)</code>", "Sorting, trees, two pointers"],
      ["<code>n &le; 10&#8311;</code>", "<code>O(n)</code>", "<code>O(n)</code> or <code>O(1)</code>", "Counting, sieve, single pass"],
      ["<code>n &le; 10&sup1;&#8312;</code>", "<code>O(log n)</code>", "<code>O(1)</code>", "Matrix power, digit DP, maths"],
    ],
  },

  pitfalls: [
    { title: "Reading only the bound on <code>n</code>",
      bug: "Seeing <code>n &le; 10&#8309;</code> and concluding <code>O(n log n)</code>, while " +
        "missing <code>q &le; 10&#8309;</code> on the next line. <code>O(n log n)</code> per query " +
        "is <code>10&sup1;&#8304;</code>.",
      fix: "Read every bound and multiply the ones that compose. With <code>n</code> and " +
        "<code>q</code> both large you need <code>O((n + q) log n)</code> total, which means " +
        "precomputation, a persistent structure, or going offline." },
    { title: "Ignoring the value range as a state space",
      bug: "Treating <code>a<sub>i</sub> &le; 10&#8309;</code> as irrelevant metadata. Many " +
        "problems are <code>O(maxA)</code> or <code>O(maxA log log maxA)</code>, and no amount of " +
        "thinking about <code>n</code> will find that solution.",
      fix: "When operations are keyed by value (\"delete all copies of <code>v</code>\", " +
        "\"pairs with gcd <code>g</code>\"), index by value. Counting arrays and sieves over " +
        "<code>maxA</code> are the standard shape." },
    { title: "Clearing a global array per test case",
      bug: "<code>Arrays.fill(cnt, 0)</code> inside the test loop with " +
        "<code>MAX = 2&times;10&#8309;</code> and <code>t = 10&#8308;</code> tests: " +
        "2&times;10&#8313; writes, a guaranteed timeout even though your algorithm is linear.",
      fix: "Undo only the indices you touched, or stamp entries with the test number and treat a " +
        "stale stamp as zero. See the Multi-test trap tab." },
    { title: "Trusting the bound and ignoring the constant",
      bug: "An <code>O(n log n)</code> solution at <code>n = 2&times;10&#8309;</code> using " +
        "<code>PriorityQueue&lt;int[]&gt;</code> and <code>Scanner</code>. The class is right and " +
        "it still times out, because the constant is 20&ndash;50&times;.",
      fix: "Once the class fits, check the constant: primitive arrays over boxed collections, " +
        "<code>BufferedReader</code> or <code>DataInputStream</code> over <code>Scanner</code>, and " +
        "buffered output. See <a href=\"java-for-dsa.html\">Java for DSA</a>." },
    { title: "Missing the <code>long</code> requirement hidden in the bounds",
      bug: "<code>n &le; 10&#8309;</code> and <code>a<sub>i</sub> &le; 10&#8313;</code>, then " +
        "summing into an <code>int</code>. The true sum reaches " +
        "<code>10&sup1;&#8308;</code> and wraps silently to a plausible wrong answer.",
      fix: "Multiply the two largest bounds in your head. If the product exceeds " +
        "<code>2.1&times;10&#8313;</code>, use <code>long</code>. This check costs two seconds and " +
        "prevents a whole class of unexplained wrong answers." },
    { title: "Assuming an interview has no constraints",
      bug: "Jumping straight to a <code>HashMap</code> solution when the interviewer intended " +
        "<code>n &le; 100</code> and wanted to discuss a cleaner quadratic, or intended streaming " +
        "input that will not fit in memory at all.",
      fix: "Ask two questions before coding: \"how large is the input?\" and \"does it fit in " +
        "memory?\". These change the answer more than any other clarification, and asking them is " +
        "itself a positive signal." },
  ],

  variants: [
    ["Bounded sum over test cases",
      "<code>t</code> can be huge while the total <code>n</code> is small. Per-test work must be " +
      "proportional to that test's size, and nothing may be <code>O(maxN)</code>.",
      "for each test: work = O(n_i log n_i); total = O(sum n_i log max n)",
      "Codeforces default format"],
    ["Two parameters with different bounds",
      "The small parameter becomes a DP dimension. <code>n &le; 10&#8309;</code> with " +
      "<code>k &le; 10</code> almost always means <code>O(nk)</code> states.",
      "dp[i][j] with i over n and j over k  =>  O(n*k)",
      "<a href=\"../10-dynamic-programming/dp-1d.html\">1-D DP</a>"],
    ["Generous time limit (3&ndash;5 s)",
      "A signal that the intended solution has a heavy constant or an extra log: " +
      "<code>O(n log&sup2; n)</code>, <code>O(n&radic;n)</code>, or a segment tree with a " +
      "<code>TreeSet</code> per node.",
      "n sqrt(n) at n=1e5 is 3e7 -> fine with 3 seconds",
      "<a href=\"../13-greedy-and-offline/mos-algorithm.html\">Mo's Algorithm</a>"],
    ["Tight memory limit (32&ndash;64 MB)",
      "Rules out large DP tables. The intended solution rolls the DP, or is offline, or streams " +
      "the input.",
      "dp[2][W] instead of dp[n+1][W]",
      "<a href=\"../10-dynamic-programming/knapsack-family.html\">Knapsack</a>"],
    ["Interactive with a query budget",
      "The cost model is queries, not operations. A budget of about 20 for " +
      "<code>n = 10&#8310;</code> means binary search; <code>n + log n</code> means a linear scan " +
      "plus a refinement.",
      "queries <= 30 with n <= 1e9  =>  binary search on the answer",
      "<a href=\"../01-arrays-and-windows/binary-search-on-answer.html\">Binary Search on Answer</a>"],
  ],

  followups: [
    ["The interviewer gives no constraints. What do you ask?",
      "<p>Three questions, in this order. <strong>\"How large can the input be?\"</strong> &mdash; " +
      "decides the target complexity. <strong>\"Does it fit in memory, or is it a stream?\"</strong> " +
      "&mdash; decides whether you may sort or must keep <code>O(1)</code> state. " +
      "<strong>\"What are the value ranges, and can they be negative?\"</strong> &mdash; decides " +
      "<code>int</code> versus <code>long</code> and whether tricks like counting sort or " +
      "Dijkstra are available. Each answer eliminates whole families of solutions, which is " +
      "exactly what you want before you commit.</p>"],
    ["<code>n &le; 10&#8309;</code> but the answer needs pairs. Is the problem impossible?",
      "<p>No &mdash; it means you must count pairs without enumerating them. The standard moves " +
      "are: sort and use <a href=\"../01-arrays-and-windows/two-pointers.html\">two pointers</a> " +
      "so each pair is implied rather than visited; use a " +
      "<a href=\"../02-sorting-hashing-bits/hashing-patterns.html\">prefix-sum plus HashMap</a> so " +
      "that each new index counts all its partners at once; or use a " +
      "<a href=\"../06-range-queries/fenwick-tree.html\">BIT</a> over compressed values to count " +
      "how many earlier elements satisfy a predicate. \"Count pairs\" almost never means " +
      "\"visit pairs\".</p>"],
    ["Why is <code>n &le; 40</code> such a distinctive bound?",
      "<p>Because it sits precisely in the gap between exponential and polynomial. " +
      "<code>2&#8308;&#8304; &asymp; 10&sup1;&sup2;</code> is too slow, but " +
      "<code>2&sup2;&#8304; &asymp; 10&#8310;</code> is trivial, and no polynomial algorithm is " +
      "expected to exist (these are usually subset-sum variants, which are NP-hard). So the setter " +
      "is telling you to split the input in half, enumerate each half, sort one side and binary " +
      "search from the other: <a href=\"../04-recursion-and-dnc/meet-in-the-middle.html\">meet in " +
      "the middle</a>. Bounds of 30&ndash;45 should trigger that thought immediately.</p>"],
    ["How do I use the memory limit as a hint?",
      "<p>Convert it to a count: 256&nbsp;MB is about 6&times;10&#8311; <code>int</code>s. Then " +
      "check your intended table. If the natural DP is " +
      "<code>dp[n][W]</code> with <code>n = 10&#8309;</code> and <code>W = 10&#8309;</code>, that " +
      "is <code>10&sup1;&#8304;</code> cells &mdash; impossible &mdash; so the setter must intend a " +
      "rolled DP with <code>O(W)</code> memory, or a completely different formulation. A memory " +
      "limit that is tight relative to the obvious table is a strong hint that the obvious table " +
      "is not the solution.</p>"],
    ["Does this reasoning transfer to LeetCode, where limits are looser?",
      "<p>Yes, and LeetCode is arguably more explicit: the constraints block is always present and " +
      "always tight. <code>1 &le; nums.length &le; 10&#8309;</code> means <code>O(n log n)</code>; " +
      "<code>&le; 10&#8308;</code> often tolerates <code>O(n&sup2;)</code>; " +
      "<code>&le; 20</code> is bitmask; <code>&le; 12</code> is permutations. The one difference is " +
      "that the JavaScript/Python budget is lower, so LeetCode's authors leave more headroom &mdash; " +
      "an <code>O(n&sup2;)</code> at <code>n = 10&#8308;</code> usually passes in Java.</p>"],
    ["What if my complexity fits but the problem still feels impossible?",
      "<p>Then you have probably identified the wrong state. Go back to the second bound. A huge " +
      "<code>n</code> with a tiny <code>k</code>, or a tiny value range, or \"at most 10 distinct " +
      "letters\" is the setter handing you the state dimension. The most common form of this is " +
      "<code>n &le; 10&#8309;</code> with <code>a<sub>i</sub> &le; 100</code>: the answer is " +
      "<code>O(100n)</code> or <code>O(100&sup2;)</code>, and no amount of cleverness about " +
      "<code>n</code> alone will find it.</p>"],
  ],

  problemsIntro: "For each of these, look <strong>only</strong> at the constraints, write down " +
    "your predicted complexity and technique, and only then read the statement. Score yourself.",

  problems: [
    { name: "Partition Equal Subset Sum", url: "https://leetcode.com/problems/partition-equal-subset-sum/",
      badge: "lc", tag: "LC 416", level: "Medium",
      pattern: "n &le; 200, sum &le; 2e4 &rarr; O(n &times; sum) knapsack, not O(2&#8319;)" },
    { name: "Shortest Path Visiting All Nodes", url: "https://leetcode.com/problems/shortest-path-visiting-all-nodes/",
      badge: "lc", tag: "LC 847", level: "Hard",
      pattern: "n &le; 12 &rarr; bitmask over visited sets; BFS on (node, mask)" },
    { name: "Find the Shortest Superstring", url: "https://leetcode.com/problems/find-the-shortest-superstring/",
      badge: "lc", tag: "LC 943", level: "Hard",
      pattern: "n &le; 12 &rarr; TSP-shaped bitmask DP" },
    { name: "Course Schedule IV", url: "https://leetcode.com/problems/course-schedule-iv/",
      badge: "lc", tag: "LC 1462", level: "Medium",
      pattern: "n &le; 100 &rarr; O(n&sup3;) transitive closure is intended" },
    { name: "Number of Ways to Rearrange Sticks", url: "https://leetcode.com/problems/number-of-ways-to-rearrange-sticks-with-k-sticks-visible/",
      badge: "lc", tag: "LC 1866", level: "Hard",
      pattern: "n, k &le; 1000 &rarr; O(nk) DP; the two bounds are the two dimensions" },
    { name: "Count Numbers with Unique Digits", url: "https://leetcode.com/problems/count-numbers-with-unique-digits/",
      badge: "lc", tag: "LC 357", level: "Medium",
      pattern: "n &le; 8 but the range is 10&#8319; &rarr; combinatorics or digit DP, never enumeration" },
    { name: "Sum of Floored Pairs", url: "https://leetcode.com/problems/sum-of-floored-pairs/",
      badge: "lc", tag: "LC 1782", level: "Hard",
      pattern: "n &le; 1e5 but a_i &le; 1e5 &rarr; the value range is the state; harmonic-series loop" },
    { name: "Boredom", url: "https://codeforces.com/problemset/problem/455/A",
      badge: "cf", tag: "CF 455A", level: "Medium",
      pattern: "a_i &le; 1e5 &rarr; DP over values, O(maxA), and long for the answer" },
    { name: "Vanya and Fence", url: "https://codeforces.com/problemset/problem/677/A",
      badge: "cf", tag: "CF 677A", level: "Easy",
      pattern: "Trivially O(n); practise noticing when the constraint imposes nothing" },
    { name: "k-Tree", url: "https://codeforces.com/problemset/problem/431/C",
      badge: "cf", tag: "CF 431C", level: "Medium",
      pattern: "n &le; 100, k &le; 100 &rarr; O(n &times; k &times; 2) DP; the three bounds are the state" },
    { name: "Ilya and Queries", url: "https://codeforces.com/problemset/problem/313/B",
      badge: "cf", tag: "CF 313B", level: "Easy",
      pattern: "m and n both 1e5 &rarr; O(nm) is dead, so prefix sums are forced" },
    { name: "Fibonacci-ish", url: "https://codeforces.com/problemset/problem/633/D",
      badge: "cf", tag: "CF 633D", level: "Hard",
      pattern: "n &le; 1000 &rarr; O(n&sup2; log) pair enumeration is intended" },
  ],

  spoilers: [
    { summary: "Hint for LC 1782 &mdash; when the value range, not n, is the complexity parameter",
      body: "<p>Both <code>n</code> and <code>a<sub>i</sub></code> are bounded by " +
        "<code>10&#8309;</code>, and you need <code>&Sigma; &lfloor;a<sub>i</sub>/a<sub>j</sub>&rfloor;</code> " +
        "over all pairs &mdash; <code>10&sup1;&#8304;</code> pairs, so pairs are out. Build " +
        "<code>cnt[v]</code> and its prefix sums, then for each distinct divisor <code>d</code> " +
        "loop over multiples <code>d, 2d, 3d, &hellip;</code> and add " +
        "<code>k &times; (count of values in [kd, (k+1)d))</code>. The outer-plus-inner loop is the " +
        "harmonic series, <code>O(maxA log maxA)</code>. Transferable lesson: <em>when both " +
        "<code>n</code> and the value range are bounded by the same number, try indexing by " +
        "value &mdash; the harmonic series often rescues you.</em></p>" },
    { summary: "Hint for LC 847 &mdash; recognising a bitmask from the bound alone",
      body: "<p><code>n &le; 12</code> is far too small to be about <code>n</code>. " +
        "<code>2&sup1;&sup2; = 4096</code>, and <code>4096 &times; 12 = 49152</code> states &mdash; " +
        "trivial. So the state must be a <em>subset</em>. Here it is " +
        "<code>(currentNode, maskOfVisited)</code>, and because every edge has weight 1 you want " +
        "plain <a href=\"../07-graphs-core/bfs.html\">BFS</a> over those " +
        "<code>n &times; 2&#8319;</code> states rather than DP. The reusable move: <em>a bound of " +
        "10&ndash;22 on a set of items means the item set itself is part of the state.</em></p>" },
  ],

  recap: {
    bullets: [
      "<strong>The bound is the answer key.</strong> Compute the budget, list the classes that " +
        "fit, and translate the class into a state shape before you start solving.",
      "<strong>Four boundaries explain almost every constraint:</strong> " +
        "<code>n&sup2; = 10&#8312;</code> at <code>n = 10&#8308;</code>, " +
        "<code>n&sup3;</code> at 464, <code>2&#8319;</code> at 26, <code>n!</code> at 11.",
      "<strong>Always look for the second, smaller bound.</strong> A tiny <code>k</code> or a " +
        "small value range is the setter handing you the DP dimension.",
      "<strong>Oddly specific bounds are signatures:</strong> 40 means meet in the middle, 500 " +
        "means <code>O(n&sup3;)</code>, 22 means bitmask, <code>10&sup1;&#8312;</code> means maths.",
      "<strong>Multiply the two largest bounds to decide <code>int</code> versus <code>long</code></strong>, " +
        "and read the memory limit as a hint about whether the obvious DP table is intended.",
    ],
    oneliner: "n<=10:n!  n<=25:2^n  n<=40:2^(n/2)  n<=500:n^3  n<=5e3:n^2  n<=2e5:n log n  n<=1e7:n  n>=1e9:log n",
  },
},

/* ============================================== 4. java-for-dsa ========= */
{
  id: "java-for-dsa",
  difficulty: "Easy",
  readTime: "24 min",
  tagline: "The Java subset that actually matters under a time limit: fast IO, primitive " +
    "collections, the overflow rules, and the library calls whose hidden costs decide whether " +
    "your correct algorithm passes.",
  tags: ["java", "io", "collections", "overflow", "toolkit"],
  prereqs: [["Complexity Analysis", "complexity-analysis.html"]],

  why: {
    paras: [
      "Java is a perfectly good competitive language, but it punishes idioms that are normal in " +
      "production code. <code>Scanner</code>, <code>ArrayList&lt;Integer&gt;</code>, " +
      "<code>String</code> concatenation and <code>Arrays.sort</code> on primitives are all " +
      "reasonable choices at work and all liabilities at <code>n = 10&#8310;</code>. The gap " +
      "between a naive Java solution and a tuned one is routinely 10&ndash;30&times; wall clock, " +
      "with no change in complexity class.",
      "This page is the fix list. It is short on language philosophy and long on the specific " +
      "constructs you should reach for by reflex: a <code>DataInputStream</code>-based reader, a " +
      "single <code>StringBuilder</code> for output, <code>int[]</code> instead of " +
      "<code>List&lt;Integer&gt;</code>, and the handful of overflow and comparator rules that " +
      "produce silent wrong answers rather than honest crashes.",
      "In interviews the emphasis shifts &mdash; nobody cares about your reader &mdash; but the " +
      "same knowledge shows up as fluency: knowing that <code>ArrayDeque</code> is the right " +
      "stack, that <code>TreeMap.floorKey</code> exists, that " +
      "<code>Arrays.binarySearch</code> returns <code>-(insertionPoint) - 1</code>, and that " +
      "<code>(lo + hi) / 2</code> overflows. That fluency is what lets you spend your thinking on " +
      "the algorithm.",
    ],
    insight: "Two rules cover most of it. <strong>Never box in a hot loop</strong> &mdash; prefer " +
      "<code>int[]</code>, <code>long[]</code> and index-based structures over " +
      "<code>Integer</code>-parameterised generics. <strong>Never do IO one token at a time</strong> " +
      "&mdash; read through a buffer and write through a single <code>StringBuilder</code>.",
  },

  recognise: {
    yes: [
      "Your solution has the right complexity and still exceeds the time limit &rarr; suspect IO, " +
        "boxing, or a hidden library cost, in that order",
      "You are reading more than about 10&#8309; numbers &rarr; <code>Scanner</code> is no longer " +
        "acceptable",
      "You are printing more than about 10&#8308; lines &rarr; buffer into a " +
        "<code>StringBuilder</code> and write once",
      "Values or intermediate sums can exceed <code>2.1&times;10&#8313;</code> &rarr; " +
        "<code>long</code>, and check every multiplication",
      "You need ordered queries such as \"largest key below <code>x</code>\" &rarr; " +
        "<code>TreeMap</code> / <code>TreeSet</code> navigation methods",
    ],
    no: [
      "<code>n</code> is under a few thousand &rarr; write the clearest code; the constant factor " +
        "is irrelevant",
      "You are in an interview on a whiteboard or shared doc &rarr; use readable idioms; " +
        "mentioning the fast alternative is enough",
      "The bottleneck is genuinely algorithmic (<code>O(n&sup2;)</code> at " +
        "<code>n = 10&#8309;</code>) &rarr; no amount of tuning saves you; change the algorithm",
      "You need arbitrary precision &rarr; <code>BigInteger</code> is correct but roughly " +
        "50&ndash;100&times; slower; check whether modular arithmetic would do instead",
    ],
    table: [
      ["Reading 10&#8310;+ integers", "<code>Scanner</code> is ~10&times; slower than a buffered reader", "<code>DataInputStream</code> byte reader"],
      ["Printing many lines", "<code>System.out.println</code> flushes per call", "<code>StringBuilder</code> then one <code>print</code>"],
      ["Frequent membership tests on ints", "Boxing plus hashing per lookup", "<code>boolean[]</code> or <code>int[]</code> if the range is small"],
      ["Stack or queue needed", "<code>Stack</code> is synchronised and legacy; <code>LinkedList</code> allocates a node per element", "<code>ArrayDeque</code>, or a raw <code>int[]</code> with a top index"],
      ["Sorting <code>int[]</code> with adversarial input", "Dual-pivot quicksort can be forced to <code>O(n&sup2;)</code>", "Shuffle first, or box to <code>Integer[]</code> (Timsort)"],
      ["Sorting by a key with subtraction", "<code>a - b</code> overflows for large or negative values", "<code>Integer.compare(a, b)</code>"],
      ["Midpoint of two indices", "<code>(lo + hi)</code> can exceed <code>Integer.MAX_VALUE</code>", "<code>lo + (hi - lo) / 2</code>"],
      ["Modular arithmetic on products", "<code>int &times; int</code> silently wraps before the <code>%</code>", "Cast one side to <code>long</code> first"],
      ["<strong>Confused with:</strong> <code>char</code> arithmetic", "<code>c - 'a'</code> is an <code>int</code>, but <code>c + 1</code> is too", "Cast back with <code>(char)</code>"],
    ],
    constraint: "budget about <code>10&#8312;</code> primitive operations per second. Boxed " +
      "collections cost 5&ndash;20&times; more per element; <code>Scanner</code> reads roughly " +
      "10&#8310; tokens per second, a buffered byte reader roughly 10&#8311;&ndash;10&#8312;.",
  },

  core: {
    heading: "Core idea: avoid boxing and avoid per-token IO",
    paras: [
      "Every <code>Integer</code> in Java is a heap object with a header, so an " +
      "<code>ArrayList&lt;Integer&gt;</code> of a million values is a million pointers to a " +
      "million scattered objects. Traversing it thrashes the cache and creates garbage-collection " +
      "pressure. The same data as <code>int[]</code> is one contiguous 4&nbsp;MB block that the " +
      "hardware prefetcher loves. This one difference explains most \"my algorithm is right but " +
      "it is slow\" reports.",
      "IO is the other half. <code>Scanner</code> uses regular expressions internally and " +
      "synchronises; <code>System.out.println</code> can flush on every call. Replacing them with " +
      "a byte-level reader and a single buffered write is mechanical, costs thirty lines you paste " +
      "once, and often turns a timeout into a comfortable pass.",
      "Everything else on this page is a specific trap: <code>int</code> overflow in midpoints and " +
      "products, comparators written with subtraction, <code>remove(Object)</code> versus " +
      "<code>remove(int)</code> on a <code>List&lt;Integer&gt;</code>, and " +
      "<code>Arrays.sort</code> having two completely different implementations depending on " +
      "whether the array is primitive or boxed.",
    ],
    invariantTitle: "The competitive Java checklist",
    invariant: "<p>Before submitting, verify all five:</p><ol>" +
      "<li>Input is read through a buffered byte reader, not <code>Scanner</code>.</li>" +
      "<li>Output is accumulated in one <code>StringBuilder</code> and printed once.</li>" +
      "<li>Hot data lives in primitive arrays; no <code>Integer</code> in an inner loop.</li>" +
      "<li>Every sum or product that could exceed " +
      "<code>2.1&times;10&#8313;</code> uses <code>long</code>, with the cast applied " +
      "<em>before</em> the multiplication.</li>" +
      "<li>Every comparator uses <code>Integer.compare</code> / <code>Long.compare</code>, never " +
      "subtraction.</li></ol>",
    extra: [
      { kind: "warn", title: "The two <code>Arrays.sort</code> implementations",
        html: "<p><code>Arrays.sort(int[])</code> is a dual-pivot quicksort: fast, in place, and " +
          "<code>O(n&sup2;)</code> against a crafted input &mdash; anti-quicksort tests exist on " +
          "Codeforces specifically to break Java solutions. " +
          "<code>Arrays.sort(Integer[])</code> is Timsort: stable, " +
          "<code>O(n log n)</code> guaranteed, and slower by a constant. The safe pattern for " +
          "primitives is to shuffle the array with a random permutation first, then sort.</p>" },
      { kind: "tip", title: "<code>ArrayDeque</code> is the one collection to remember",
        html: "<p>It is the fastest stack (<code>push</code>/<code>pop</code>/<code>peek</code>), " +
          "the fastest queue (<code>offer</code>/<code>poll</code>), and the deque you need for " +
          "<a href=\"../03-linear-structures/queues-and-monotonic-deque.html\">monotonic " +
          "windows</a>. Prefer it over <code>Stack</code> (synchronised, legacy) and " +
          "<code>LinkedList</code> (a node allocation per element). It does not allow " +
          "<code>null</code>, which is a feature: it turns a silent bug into an exception.</p>" },
      { kind: "math", title: "Overflow arithmetic, precisely",
        html: "<p><code>int</code> holds up to <code>2&sup3;&sup1; &minus; 1 = 2147483647</code>, " +
          "<code>long</code> up to <code>2&#8310;&sup3; &minus; 1 &asymp; 9.2&times;10&sup1;&#8312;</code>. " +
          "So summing <code>10&#8309;</code> values each up to <code>10&#8313;</code> reaches " +
          "<code>10&sup1;&#8308;</code> &mdash; needs <code>long</code>. And the classic silent " +
          "failure: <code>int a = 100000, b = 100000; long c = a * b;</code> gives " +
          "1410065408, because the multiplication happens in <code>int</code> before the widening. " +
          "Write <code>long c = (long) a * b;</code>.</p>" },
    ],
  },

  visuals: [
    {
      kind: "grid", vizId: "javaCost",
      h3: "What each choice actually costs",
      intro: "Relative cost of the common decisions, measured at <code>n = 10&#8310;</code>. The " +
        "numbers move between machines, but the ratios are stable and the ranking never changes.",
      caption: "Approximate relative costs in Java. Nothing here changes the complexity class; all " +
        "of it changes whether you pass.",
      data: {
        corner: "choice",
        rowHeads: ["input read", "output write", "int storage", "stack", "sort", "map"],
        colHeads: ["slow way", "cost", "fast way", "cost"],
        vars: ["area", "speedup"],
        speed: 1250,
        frames: [
          { note: "Reading 1e6 ints: Scanner uses regex and synchronises. A DataInputStream byte reader is roughly ten times faster and is the single highest-value paste in competitive Java.",
            cells: [{ r: 0, c: 0, val: "Scanner" }, { r: 0, c: 1, val: "1000ms", cls: "block" },
                    { r: 0, c: 2, val: "byte reader" }, { r: 0, c: 3, val: "90ms", cls: "answer" }],
            values: { area: "input", speedup: "~10x" } },
          { note: "Printing 1e6 lines: println can flush each call. Accumulate in one StringBuilder and print once.",
            cells: [{ r: 1, c: 0, val: "println" }, { r: 1, c: 1, val: "2500ms", cls: "block" },
                    { r: 1, c: 2, val: "StringBuilder" }, { r: 1, c: 3, val: "70ms", cls: "answer" }],
            values: { area: "output", speedup: "~30x" } },
          { note: "Storing a million ints: ArrayList<Integer> is a million heap objects and about 20 MB; int[] is one contiguous 4 MB block.",
            cells: [{ r: 2, c: 0, val: "List<Integer>" }, { r: 2, c: 1, val: "20MB", cls: "block" },
                    { r: 2, c: 2, val: "int[]" }, { r: 2, c: 3, val: "4MB", cls: "answer" }],
            values: { area: "storage", speedup: "~5x" } },
          { note: "Stack operations: java.util.Stack is synchronised and extends Vector. ArrayDeque is the drop-in replacement; a raw int[] with a top index is faster still.",
            cells: [{ r: 3, c: 0, val: "Stack" }, { r: 3, c: 1, val: "120ms", cls: "block" },
                    { r: 3, c: 2, val: "int[] + top" }, { r: 3, c: 3, val: "8ms", cls: "answer" }],
            values: { area: "stack", speedup: "~15x" } },
          { note: "Sorting: Arrays.sort(int[]) is fast but quadratic against anti-quicksort tests. Shuffling first costs O(n) and removes the risk entirely.",
            cells: [{ r: 4, c: 0, val: "sort(int[])" }, { r: 4, c: 1, val: "O(n\u00b2) risk", cls: "block" },
                    { r: 4, c: 2, val: "shuffle+sort" }, { r: 4, c: 3, val: "safe", cls: "answer" }],
            values: { area: "sort", speedup: "safety" } },
          { note: "Counting occurrences of small ints: HashMap<Integer,Integer> boxes twice per operation. A plain int[] indexed by value is a single memory write.",
            cells: [{ r: 5, c: 0, val: "HashMap" }, { r: 5, c: 1, val: "350ms", cls: "block" },
                    { r: 5, c: 2, val: "int[] cnt" }, { r: 5, c: 3, val: "6ms", cls: "answer" }],
            values: { area: "counting", speedup: "~50x" } },
          { note: "Together these are commonly a 10-30x wall-clock difference on an unchanged algorithm. Fix IO first, then boxing.",
            cells: [{ r: 0, c: 3, val: "90ms", cls: "target" }, { r: 1, c: 3, val: "70ms", cls: "target" },
                    { r: 5, c: 3, val: "6ms", cls: "target" }],
            values: { area: "total", speedup: "10-30x" } },
        ],
      },
    },
    {
      kind: "array", vizId: "ovf",
      h3: "Where <code>int</code> overflow bites",
      intro: "Each cell is a computed value; the row walks through a binary search midpoint and a " +
        "modular product. Red marks the moment the true value leaves <code>int</code> range and " +
        "wraps to something plausible but wrong.",
      caption: "Overflow does not throw. It produces a wrong answer that looks reasonable, which is " +
        "why it costs so much debugging time.",
      data: {
        label: "computed value",
        array: ["2e9", "2.1e9", "-2.1e9", "1e9", "1e18", "1410065408"],
        indexLabels: ["lo", "hi", "lo+hi", "a", "a*a (long)", "a*a (int)"],
        vars: ["expression", "true value", "int result"],
        speed: 1100,
        frames: [
          { note: "lo = 2e9, comfortably inside int (max is 2147483647).", active: [0], dim: [1,2,3,4,5],
            values: { expression: "lo", "true value": "2000000000", "int result": "2000000000" } },
          { note: "hi = 2.1e9, still just inside int.", active: [1], done: [0], dim: [2,3,4,5],
            values: { expression: "hi", "true value": "2100000000", "int result": "2100000000" } },
          { note: "lo + hi = 4.1e9 overflows and wraps negative. (lo+hi)/2 is then a negative index \u2014 the classic binary search bug that sat in the JDK for nine years.",
            active: [2], x: [2], done: [0,1], dim: [3,4,5],
            values: { expression: "lo + hi", "true value": "4100000000", "int result": "-194967296" } },
          { note: "Fix: lo + (hi - lo) / 2. The difference always fits, so no intermediate leaves range.",
            best: [2], done: [0,1], dim: [3,4,5],
            values: { expression: "lo + (hi-lo)/2", "true value": "2050000000", "int result": "2050000000" } },
          { note: "Second case: a = 1e9, an int.", active: [3], done: [0,1,2], dim: [4,5],
            values: { expression: "a", "true value": "1000000000", "int result": "1000000000" } },
          { note: "(long) a * a = 1e18, correct, because the cast happens before the multiplication.",
            active: [4], best: [4], done: [0,1,2,3], dim: [5],
            values: { expression: "(long)a * a", "true value": "1e18", "int result": "1e18" } },
          { note: "a * a assigned to a long is still computed in int first: it wraps to 1410065408 and then widens. The cast must be on an operand, not on the result.",
            active: [5], x: [5], done: [0,1,2,3,4],
            values: { expression: "long x = a * a", "true value": "1e18", "int result": "-1486618624" } },
          { note: "Rule: multiply the two largest bounds in the statement. If the product exceeds 2.1e9, cast one operand to long before the operation.",
            best: [4], x: [2,5], done: [0,1,3],
            values: { expression: "rule", "true value": "cast the operand", "int result": "not the result" } },
        ],
      },
    },
    {
      kind: "mermaid", vizId: "javaPick",
      h3: "Picking the right container",
      caption: "Follow the branches. Almost every competitive data-structure decision in Java " +
        "lands on one of these seven leaves.",
      src: `flowchart TD
  start(["what do you need?"]) --> ordered{"do you need sorted order or neighbour queries?"}
  ordered -- yes --> dup{"duplicates allowed?"}
  dup -- yes --> tmap["TreeMap of value to count"]
  dup -- no --> tset["TreeSet with floor, ceiling, higher, lower"]
  ordered -- no --> minmax{"only need the extreme element?"}
  minmax -- yes --> pq["PriorityQueue, or a long[] heap for speed"]
  minmax -- no --> keyed{"is the key a small integer?"}
  keyed -- yes --> arr["plain int[] or boolean[] indexed by key"]
  keyed -- no --> assoc{"key-value or membership?"}
  assoc -- "key-value" --> hmap["HashMap, salted keys in contests"]
  assoc -- membership --> hset["HashSet"]
  minmax --> ends{"insert or remove at both ends?"}
  ends -- yes --> adq["ArrayDeque"]`,
      wide: true,
    },
  ],

  steps: [
    "<strong>Paste the reader.</strong> Start every contest file from a template containing the " +
      "<code>FastReader</code> and a <code>StringBuilder</code> for output.",
    "<strong>Choose primitive storage.</strong> Decide up front whether each array is " +
      "<code>int[]</code>, <code>long[]</code>, or genuinely needs objects.",
    "<strong>Pick containers from the flowchart:</strong> ordered &rarr; " +
      "<code>TreeMap</code>/<code>TreeSet</code>, extremes &rarr; heap, small integer keys &rarr; " +
      "plain array, both ends &rarr; <code>ArrayDeque</code>.",
    "<strong>Audit arithmetic.</strong> Every <code>+</code> and <code>*</code> whose operands can " +
      "be large gets a <code>long</code> cast on an operand.",
    "<strong>Write comparators with <code>Integer.compare</code></strong> and chain with " +
      "<code>Comparator.comparingInt(...).thenComparing(...)</code>.",
    "<strong>Shuffle before <code>Arrays.sort(int[])</code></strong> when the input is adversarial " +
      "(any Codeforces problem).",
    "<strong>Buffer all output</strong> and print exactly once at the end.",
    "<strong>Guard recursion depth.</strong> If it can exceed about <code>10&#8308;</code>, either " +
      "convert to an explicit stack or launch the solver on a thread with a larger stack.",
  ],

  dryRun: {
    intro: "The eight substitutions that matter most, in the order you should apply them when a " +
      "solution is too slow.",
    cols: ["#", "Instead of", "Use", "Why"],
    rows: [
      { cells: ["1", "<code>new Scanner(System.in)</code>", "<code>FastReader</code> over <code>DataInputStream</code>", "~10&times; on 10&#8310; tokens"],
        action: "Always the first thing to check on an unexplained TLE.", change: true },
      { cells: ["2", "<code>System.out.println(x)</code> in a loop", "<code>sb.append(x).append('\\n')</code>", "~30&times; on 10&#8310; lines"],
        action: "Print the builder once at the end.", change: true },
      { cells: ["3", "<code>List&lt;Integer&gt;</code>", "<code>int[]</code> with a size counter", "5&times; memory, better cache locality"],
        action: "Applies to any hot array." },
      { cells: ["4", "<code>HashMap&lt;Integer,Integer&gt;</code>", "<code>int[] cnt</code> when the key range is small", "~50&times;"],
        action: "Only when the range fits in memory; otherwise salt the hash." },
      { cells: ["5", "<code>new Stack&lt;&gt;()</code>", "<code>ArrayDeque</code> or <code>int[] st; int top</code>", "Unsynchronised, no boxing"],
        action: "<code>Stack</code> extends <code>Vector</code> and is synchronised." },
      { cells: ["6", "<code>(a, b) -&gt; a - b</code>", "<code>Integer::compare</code>", "Subtraction overflows"],
        action: "Silent wrong answer on large or negative keys.", change: true },
      { cells: ["7", "<code>(lo + hi) / 2</code>", "<code>lo + (hi - lo) / 2</code>", "Overflow near 2&sup3;&sup1;"],
        action: "Also applies to <code>l + r &gt;&gt; 1</code> on large values." },
      { cells: ["8", "<code>s += c</code> in a loop", "<code>StringBuilder.append</code>", "<code>O(n&sup2;)</code> to <code>O(n)</code>"],
        action: "This one changes the complexity class, not just the constant.", change: true },
      { cells: ["9", "<code>Arrays.sort(int[])</code> on hostile data", "shuffle, then sort", "Avoids <code>O(n&sup2;)</code> quicksort attacks"],
        action: "Or sort a boxed <code>Integer[]</code>, which uses Timsort." },
    ],
  },

  code: [
    { tab: "Contest template", panel: "Template", file: "Template.java",
      intro: "The file to start every contest from. The reader handles negatives and " +
        "<code>long</code>, output is buffered, and the solver runs on a thread with a 64&nbsp;MB " +
        "stack so deep recursion cannot overflow.",
      highlight: "10-13,52-58",
      code: `import java.io.DataInputStream;
import java.io.IOException;

public class Template {

    static FastReader in;
    static StringBuilder out = new StringBuilder();

    static void solve() throws IOException {
        int n = in.nextInt();
        long[] a = new long[n];
        long sum = 0;
        for (int i = 0; i < n; i++) {
            a[i] = in.nextLong();
            sum += a[i];                    // long: n * maxA can exceed int
        }
        out.append(sum).append('\\n');
    }

    /** Byte-level reader: no regex, no synchronisation, no autoboxing. */
    static class FastReader {
        private static final int BUF = 1 << 16;
        private final DataInputStream din = new DataInputStream(System.in);
        private final byte[] buffer = new byte[BUF];
        private int ptr = 0, len = 0;

        private int read() throws IOException {
            if (ptr == len) {
                len = din.read(buffer, 0, BUF);
                ptr = 0;
                if (len <= 0) {
                    return -1;
                }
            }
            return buffer[ptr++];
        }

        int nextInt() throws IOException {
            return (int) nextLong();
        }

        long nextLong() throws IOException {
            int b = read();
            while (b != '-' && (b < '0' || b > '9')) {
                b = read();
            }
            boolean neg = (b == '-');
            if (neg) {
                b = read();
            }
            long ret = 0;
            while (b >= '0' && b <= '9') {
                ret = ret * 10 + (b - '0');
                b = read();
            }
            return neg ? -ret : ret;
        }

        String next() throws IOException {
            int b = read();
            while (b <= ' ') {
                b = read();
            }
            StringBuilder sb = new StringBuilder();
            while (b > ' ') {
                sb.append((char) b);
                b = read();
            }
            return sb.toString();
        }
    }

    public static void main(String[] args) {
        // 64 MB stack: deep DFS on 1e6 nodes will not StackOverflowError.
        new Thread(null, () -> {
            try {
                in = new FastReader();
                int t = 1;                  // set to in.nextInt() for multi-test problems
                while (t-- > 0) {
                    solve();
                }
                System.out.print(out);      // exactly one write
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }, "main", 1 << 26).start();
    }
    // Input : 3 / 1000000000 1000000000 1000000000
    // Output: 3000000000
}`,
    },
    { tab: "Collections cheat sheet", panel: "Collections", file: "CollectionsTour.java",
      intro: "Every container operation you are likely to need, with its cost. Read this once and " +
        "come back to it whenever you are unsure which structure answers a query.",
      code: `import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.PriorityQueue;
import java.util.TreeMap;
import java.util.TreeSet;

public class CollectionsTour {

    public static void main(String[] args) {
        // ---- ArrayDeque: stack and queue and deque, all O(1) amortised ----
        ArrayDeque<Integer> dq = new ArrayDeque<>();
        dq.push(1); dq.push(2);            // stack: push / pop / peek
        dq.addLast(3);                     // queue: addLast / pollFirst
        System.out.println("deque " + dq + " pop=" + dq.pop() + " last=" + dq.pollLast());

        // ---- PriorityQueue: O(log n) offer/poll, O(1) peek. Min-heap by default ----
        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(x -> x[1]));
        pq.offer(new int[] {0, 5});
        pq.offer(new int[] {1, 3});
        System.out.println("min by second field = " + Arrays.toString(pq.peek()));

        // ---- TreeMap / TreeSet: O(log n) navigation. The reason to prefer them ----
        TreeMap<Integer, String> tm = new TreeMap<>();
        tm.put(10, "a"); tm.put(20, "b"); tm.put(30, "c");
        System.out.println("floor(25)=" + tm.floorKey(25)      // 20  <= 25
                + " ceiling(25)=" + tm.ceilingKey(25)          // 30  >= 25
                + " higher(20)=" + tm.higherKey(20)            // 30  >  20
                + " first=" + tm.firstKey() + " last=" + tm.lastKey());

        TreeSet<Integer> ts = new TreeSet<>(Arrays.asList(1, 4, 9, 16));
        System.out.println("subSet[4,16) = " + ts.subSet(4, 16)
                + " headSet(9) = " + ts.headSet(9));

        // ---- HashMap: O(1) expected. merge and getOrDefault avoid null checks ----
        HashMap<String, Integer> freq = new HashMap<>();
        for (String w : "a b a c a b".split(" ")) {
            freq.merge(w, 1, Integer::sum);
        }
        System.out.println("freq " + freq + " missing=" + freq.getOrDefault("z", 0));

        // ---- Arrays.binarySearch: returns -(insertionPoint) - 1 when absent ----
        int[] sorted = {2, 4, 6, 8};
        int found = Arrays.binarySearch(sorted, 6);
        int absent = Arrays.binarySearch(sorted, 5);
        System.out.println("found=" + found + " absent=" + absent
                + " insertionPoint=" + (-absent - 1));

        // ---- The List<Integer>.remove trap ----
        java.util.List<Integer> list = new java.util.ArrayList<>(Arrays.asList(10, 20, 30));
        list.remove(1);                                  // removes INDEX 1 -> [10, 30]
        list.remove(Integer.valueOf(30));                // removes VALUE 30 -> [10]
        System.out.println("after removes " + list);
    }
    // Output: deque [2, 1, 3] pop=2 last=3
    //         min by second field = [1, 3]
    //         floor(25)=20 ceiling(25)=30 higher(20)=30 first=10 last=30
    //         subSet[4,16) = [4, 9] headSet(9) = [1, 4]
    //         freq {a=3, b=2, c=1} missing=0
    //         found=2 absent=-3 insertionPoint=2
    //         after removes [10]
}`,
    },
    { tab: "Traps and fixes", panel: "Traps", file: "JavaTraps.java",
      intro: "Each pair shows a wrong line and its correction. Every one of these produces a " +
        "<em>wrong answer</em> rather than an exception, which is what makes them expensive.",
      highlight: "10,17,24,31,40",
      code: `import java.util.Arrays;
import java.util.Random;

public class JavaTraps {

    public static void main(String[] args) {
        // 1. Multiplication overflow: the cast must be on an operand.
        int a = 100000, b = 100000;
        long wrong = a * b;                       // computed in int, then widened
        long right = (long) a * b;
        System.out.println("1) wrong=" + wrong + " right=" + right);

        // 2. Midpoint overflow.
        int lo = 2_000_000_000, hi = 2_100_000_000;
        int badMid = (lo + hi) / 2;               // negative
        int goodMid = lo + (hi - lo) / 2;
        System.out.println("2) bad=" + badMid + " good=" + goodMid);

        // 3. Comparator by subtraction.
        Integer[] keys = {Integer.MIN_VALUE, 1, Integer.MAX_VALUE};
        Integer[] c1 = keys.clone();
        Arrays.sort(c1, (x, y) -> x - y);         // overflow -> wrong order
        Integer[] c2 = keys.clone();
        Arrays.sort(c2, Integer::compare);
        System.out.println("3) sub=" + Arrays.toString(c1) + " cmp=" + Arrays.toString(c2));

        // 4. Integer cache: == compares references above 127.
        Integer p = 1000, q = 1000;
        System.out.println("4) == gives " + (p == q) + ", equals gives " + p.equals(q));

        // 5. Negative modulo: Java's % keeps the sign of the dividend.
        int m = 7;
        int naive = (-3) % m;                     // -3, not 4
        int fixed = ((-3) % m + m) % m;
        System.out.println("5) naive=" + naive + " fixed=" + fixed);

        // 6. Integer division truncates toward zero, so ceilings need care.
        int n = 7, k = 2;
        int ceilWrong = n / k;                    // 3
        int ceilRight = (n + k - 1) / k;          // 4
        System.out.println("6) " + ceilWrong + " vs " + ceilRight);

        // 7. Anti-quicksort defence for primitive sort.
        int[] hostile = new int[10];
        for (int i = 0; i < hostile.length; i++) {
            hostile[i] = i;
        }
        shuffle(hostile);
        Arrays.sort(hostile);
        System.out.println("7) shuffled then sorted = " + Arrays.toString(hostile));
    }

    /** Fisher-Yates. O(n), and it removes the quadratic worst case entirely. */
    static void shuffle(int[] arr) {
        Random rnd = new Random();
        for (int i = arr.length - 1; i > 0; i--) {
            int j = rnd.nextInt(i + 1);
            int t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        }
    }
    // Output: 1) wrong=1410065408 right=10000000000
    //         2) bad=-97483648 good=2050000000
    //         3) sub=[1, 2147483647, -2147483648] cmp=[-2147483648, 1, 2147483647]
    //         4) == gives false, equals gives true
    //         5) naive=-3 fixed=4
    //         6) 3 vs 4
    //         7) shuffled then sorted = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
}`,
    },
  ],

  complexity: {
    time: "language overhead, not asymptotics",
    space: "int[] is 4n bytes; Integer[] is ~20n",
    derivation: [
      "<p>An <code>int[]</code> of length <code>n</code> occupies <code>4n</code> bytes plus a " +
      "16-byte header. An <code>Integer[]</code> of the same length occupies <code>4n</code> or " +
      "<code>8n</code> bytes of <em>references</em>, plus a separate 16-byte object per distinct " +
      "value:</p>",
      "<span class=\"eq\">int[10&#8310;] &asymp; 4&nbsp;MB&nbsp;&nbsp;&nbsp;&nbsp; Integer[10&#8310;] &asymp; 4&nbsp;MB + 10&#8310; &times; 16&nbsp;B &asymp; 20&nbsp;MB</span>",
      "<p>The five-fold memory difference matters less than the locality difference. Scanning an " +
      "<code>int[]</code> is a sequential read the prefetcher handles perfectly; scanning an " +
      "<code>Integer[]</code> dereferences a pointer per element into scattered heap addresses, " +
      "and a cache miss costs on the order of 100 cycles against 1 for a hit. That is the " +
      "mechanism behind the 5&ndash;20&times; slowdowns quoted throughout this page.</p>",
      "<p>For IO, <code>Scanner</code> compiles and applies a regular expression per token, so " +
      "reading <code>n</code> integers is <code>&Theta;(n)</code> with a constant near 1&nbsp;&micro;s. " +
      "A byte reader amortises one <code>read</code> syscall over a 64&nbsp;KB buffer, giving a " +
      "constant near 0.1&nbsp;&micro;s. Same class, ten times the throughput.</p>",
    ],
    compare: [
      ["<code>Scanner</code>", "~1e6 tokens/s", "low", "Fine below 1e5 tokens"],
      ["<code>BufferedReader</code> + <code>StringTokenizer</code>", "~5e6 tokens/s", "low", "Good default, easy to remember"],
      ["<code>DataInputStream</code> byte reader", "~2e7 tokens/s", "64 KB", "The contest choice"],
      ["<code>int[]</code>", "1 ns/access", "4n bytes", "Always prefer in hot paths"],
      ["<code>ArrayList&lt;Integer&gt;</code>", "5&ndash;20 ns/access", "~20n bytes", "Convenience only"],
      ["<code>HashMap&lt;Integer,Integer&gt;</code>", "~50 ns/op", "~50n bytes", "Salt keys in contests"],
      ["<code>TreeMap</code>", "~150 ns/op", "~50n bytes", "Only when you need ordering"],
      ["<code>ArrayDeque</code>", "~3 ns/op", "~4n&ndash;8n bytes", "Best stack and queue"],
    ],
  },

  pitfalls: [
    { title: "Casting after the multiplication",
      bug: "<code>long area = width * height;</code> where both are <code>int</code>. The product " +
        "is computed in <code>int</code>, wraps, and <em>then</em> widens to <code>long</code>. No " +
        "warning, no exception.",
      fix: "Put the cast on an operand: <code>long area = (long) width * height;</code>. Scan " +
        "every multiplication in your solution whose operands can exceed about " +
        "<code>4.6&times;10&#8308;</code>, since that squared is already " +
        "<code>2.1&times;10&#8313;</code>." },
    { title: "Comparators written as <code>a - b</code>",
      bug: "<code>Arrays.sort(arr, (x, y) -&gt; x[0] - y[0]);</code> with values near " +
        "<code>&plusmn;2&times;10&#8313;</code>. The subtraction overflows, the comparator becomes " +
        "inconsistent, and you get either a wrong order or " +
        "<code>IllegalArgumentException: Comparison method violates its general contract</code>.",
      fix: "<code>Comparator.comparingInt(x -&gt; x[0])</code> or " +
        "<code>(x, y) -&gt; Integer.compare(x[0], y[0])</code>. For multiple keys chain with " +
        "<code>.thenComparingInt(...)</code>." },
    { title: "<code>List&lt;Integer&gt;.remove</code> ambiguity",
      bug: "<code>list.remove(5)</code> on a <code>List&lt;Integer&gt;</code> removes the element " +
        "at <em>index</em> 5, not the value 5, because <code>remove(int)</code> is a better match " +
        "than <code>remove(Object)</code>.",
      fix: "<code>list.remove(Integer.valueOf(5))</code> to remove by value. Better: do not keep " +
        "hot integer data in a <code>List</code> at all." },
    { title: "Comparing boxed integers with <code>==</code>",
      bug: "<code>Integer a = 1000, b = 1000; a == b</code> is <code>false</code>, while the same " +
        "code with 100 is <code>true</code> because Java caches " +
        "<code>-128 &hellip; 127</code>. This is a bug that passes every small test.",
      fix: "Use <code>.equals</code> or <code>intValue()</code> for boxed types, and avoid boxing. " +
        "The same trap applies to <code>Long</code> and to map keys." },
    { title: "Java's <code>%</code> can return a negative value",
      bug: "<code>(-3) % 7</code> is <code>-3</code>, not <code>4</code>. Indexing " +
        "<code>arr[(i - k) % n]</code> then throws " +
        "<code>ArrayIndexOutOfBoundsException</code>, or worse, silently reads the wrong cell " +
        "after you \"fix\" it with <code>Math.abs</code>.",
      fix: "Normalise with <code>((x % m) + m) % m</code>, or use " +
        "<code>Math.floorMod(x, m)</code>, which does exactly that." },
    { title: "Trusting <code>Arrays.sort(int[])</code> on adversarial input",
      bug: "Dual-pivot quicksort has a known <code>O(n&sup2;)</code> worst case, and Codeforces " +
        "problems routinely include an anti-quicksort test that targets Java specifically. Your " +
        "<code>O(n log n)</code> solution times out on test 47 only.",
      fix: "Shuffle with Fisher-Yates before sorting (<code>O(n)</code>), or sort a boxed " +
        "<code>Integer[]</code>, which uses Timsort and is worst-case " +
        "<code>O(n log n)</code>." },
    { title: "Deep recursion on the main thread",
      bug: "A DFS over a path-shaped graph with <code>10&#8310;</code> nodes throws " +
        "<code>StackOverflowError</code> at roughly the 10&#8308;th frame, which on most judges is " +
        "reported as a runtime error with no useful message.",
      fix: "Run the solver inside " +
        "<code>new Thread(null, task, \"main\", 1 &lt;&lt; 26)</code> as in the template, or " +
        "convert the recursion to an explicit stack." },
  ],

  variants: [
    ["<code>BufferedReader</code> + <code>StringTokenizer</code>",
      "Slower than a byte reader but far easier to remember and to write from scratch. A good " +
      "default when you do not have your template.",
      "BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\nStringTokenizer st = new StringTokenizer(br.readLine());",
      "Standard fallback"],
    ["<code>PrintWriter</code> with <code>autoFlush = false</code>",
      "An alternative to accumulating a <code>StringBuilder</code>: buffered writes, and you must " +
      "remember to <code>flush()</code> or <code>close()</code>.",
      "PrintWriter pw = new PrintWriter(new BufferedWriter(new OutputStreamWriter(System.out)));\n// ... pw.println(x) ... then pw.flush();",
      "Standard fallback"],
    ["Primitive heap on a <code>long[]</code>",
      "Pack a key and a payload into one <code>long</code> " +
      "(<code>key &lt;&lt; 20 | id</code>) and heapify a <code>long[]</code>. Removes all boxing " +
      "from Dijkstra's inner loop.",
      "long packed = ((long) dist << 20) | node;   // dist in the high bits sorts correctly",
      "<a href=\"../07-graphs-core/dijkstra.html\">Dijkstra</a>"],
    ["Salted <code>HashMap</code> keys",
      "Defends against hash-collision attacks by mixing each key with a random constant before " +
      "insertion.",
      "static final long SALT = new Random().nextLong();\nlong key = Long.hashCode(x * 0x9E3779B97F4A7C15L ^ SALT);",
      "<a href=\"../02-sorting-hashing-bits/hashing-patterns.html\">Hashing Patterns</a>"],
    ["<code>BitSet</code> for dense boolean data",
      "64 values per <code>long</code>, with hardware-speed <code>and</code>, <code>or</code> and " +
      "<code>cardinality</code>. Turns some <code>O(n&sup2;)</code> DP into " +
      "<code>O(n&sup2;/64)</code>.",
      "BitSet bs = new BitSet(n); bs.set(i); bs.or(other); int c = bs.cardinality();",
      "<a href=\"../02-sorting-hashing-bits/bit-manipulation.html\">Bit Manipulation</a>"],
  ],

  followups: [
    ["Why is <code>ArrayList&lt;Integer&gt;</code> so much slower than <code>int[]</code>?",
      "<p>Three compounding reasons. <strong>Indirection:</strong> the list holds references, so " +
      "each access is a pointer dereference into scattered heap memory, and a cache miss costs " +
      "about 100 cycles against 1 for a hit. <strong>Allocation:</strong> every value outside " +
      "<code>-128 &hellip; 127</code> is a fresh 16-byte object, so a million inserts create a " +
      "million objects for the garbage collector. <strong>Unboxing:</strong> every arithmetic use " +
      "calls <code>intValue()</code>. Together these give the 5&ndash;20&times; factor. The " +
      "complexity class is identical, which is precisely why the problem is hard to spot.</p>"],
    ["When is <code>HashMap</code> the wrong choice even though the keys are unbounded?",
      "<p>When the operation is really \"count occurrences\" and the values can be compressed. " +
      "Sort the distinct values once, replace each value by its rank, and use an " +
      "<code>int[]</code> indexed by rank &mdash; <code>O(n log n)</code> once, then " +
      "<code>O(1)</code> per access with no boxing. That is " +
      "<a href=\"../13-greedy-and-offline/coordinate-compression.html\">coordinate " +
      "compression</a>, and it is usually 10&ndash;50&times; faster than a " +
      "<code>HashMap</code> while also being immune to hash attacks.</p>"],
    ["How do you get <code>O(log n)</code> \"largest element below x\" in Java?",
      "<p><code>TreeSet.floor(x)</code> for <code>&le; x</code>, <code>lower(x)</code> for " +
      "<code>&lt; x</code>, <code>ceiling(x)</code> for <code>&ge; x</code>, " +
      "<code>higher(x)</code> for <code>&gt; x</code>, plus <code>first</code>, " +
      "<code>last</code>, <code>pollFirst</code>, <code>pollLast</code>, <code>headSet</code>, " +
      "<code>tailSet</code> and <code>subSet</code>. Knowing these four navigation methods by name " +
      "removes the need to hand-roll a binary search in most interview problems. Note that " +
      "<code>TreeSet</code> deduplicates &mdash; when duplicates matter, use a " +
      "<code>TreeMap&lt;Integer,Integer&gt;</code> of value to count.</p>"],
    ["What is the fastest way to sort in Java, and when does it matter?",
      "<p><code>Arrays.sort(int[])</code> is fastest in the average case but has an " +
      "<code>O(n&sup2;)</code> worst case that contest setters actively target. " +
      "<code>Arrays.sort(Integer[])</code> is Timsort, worst-case " +
      "<code>O(n log n)</code> and stable, but boxes everything. The best of both is to shuffle " +
      "the <code>int[]</code> first: <code>O(n)</code> extra work makes the quadratic case " +
      "vanishingly unlikely. When you need to sort by a key, sorting an <code>int[]</code> of " +
      "packed <code>long</code> values (<code>key &lt;&lt; 32 | index</code>) beats sorting an " +
      "array of objects by a wide margin.</p>"],
    ["Is Java fast enough for competitive programming?",
      "<p>Yes, with the habits on this page. Java runs roughly 1.5&ndash;2&times; slower than C++ " +
      "on tight numeric loops, and most judges grant Java extra time. The problems that actually " +
      "sink Java solutions are almost never the language: they are <code>Scanner</code>, boxing, " +
      "and per-line printing. Fix those three and the remaining gap is small enough that any " +
      "problem solvable in C++ within the limit is solvable in Java.</p>"],
    ["What should I say about Java specifics in an interview?",
      "<p>Mention them once, briefly, and move on. \"I will use an <code>ArrayDeque</code> as the " +
      "stack since <code>java.util.Stack</code> is synchronised\" or \"I will use " +
      "<code>lo + (hi - lo) / 2</code> to avoid overflow\" takes three seconds and signals " +
      "genuine familiarity. Do not spend interview time writing a fast reader &mdash; that is a " +
      "contest concern, and doing it unprompted reads as missing the point.</p>"],
  ],

  problemsIntro: "These reward Java-specific care. Solve each one and then check whether your " +
    "solution has any of the traps from the third code tab.",

  problems: [
    { name: "Two Sum", url: "https://leetcode.com/problems/two-sum/",
      badge: "lc", tag: "LC 1", level: "Easy",
      pattern: "HashMap idioms: getOrDefault, merge, and why == fails on boxed Integers" },
    { name: "Valid Parentheses", url: "https://leetcode.com/problems/valid-parentheses/",
      badge: "lc", tag: "LC 20", level: "Easy",
      pattern: "ArrayDeque as a stack; never java.util.Stack" },
    { name: "Merge Intervals", url: "https://leetcode.com/problems/merge-intervals/",
      badge: "lc", tag: "LC 56", level: "Medium",
      pattern: "Comparator.comparingInt over subtraction; sorting int[][]" },
    { name: "Top K Frequent Elements", url: "https://leetcode.com/problems/top-k-frequent-elements/",
      badge: "lc", tag: "LC 347", level: "Medium",
      pattern: "PriorityQueue with a custom comparator, plus bucket sort as the O(n) alternative" },
    { name: "My Calendar I", url: "https://leetcode.com/problems/my-calendar-i/",
      badge: "lc", tag: "LC 729", level: "Medium",
      pattern: "TreeMap floorKey / ceilingKey; the canonical navigation-method problem" },
    { name: "Sliding Window Maximum", url: "https://leetcode.com/problems/sliding-window-maximum/",
      badge: "lc", tag: "LC 239", level: "Hard",
      pattern: "ArrayDeque of indices; boxing here is a measurable slowdown" },
    { name: "Reverse Integer", url: "https://leetcode.com/problems/reverse-integer/",
      badge: "lc", tag: "LC 7", level: "Medium",
      pattern: "Overflow detection without long; the problem is entirely about int limits" },
    { name: "Divide Two Integers", url: "https://leetcode.com/problems/divide-two-integers/",
      badge: "lc", tag: "LC 29", level: "Medium",
      pattern: "Integer.MIN_VALUE has no positive counterpart; negation overflows" },
    { name: "String to Integer (atoi)", url: "https://leetcode.com/problems/string-to-integer-atoi/",
      badge: "lc", tag: "LC 8", level: "Medium",
      pattern: "Clamping to int range while parsing; the same logic your FastReader needs" },
    { name: "Sort an Array", url: "https://leetcode.com/problems/sort-an-array/",
      badge: "lc", tag: "LC 912", level: "Medium",
      pattern: "Why Arrays.sort(int[]) is risky and shuffling first fixes it" },
    { name: "Theatre Square", url: "https://codeforces.com/problemset/problem/1/A",
      badge: "cf", tag: "CF 1A", level: "Easy",
      pattern: "long plus ceiling division: (n + a - 1) / a" },
    { name: "Petya and Strings", url: "https://codeforces.com/problemset/problem/112/A",
      badge: "cf", tag: "CF 112A", level: "Easy",
      pattern: "Fast IO habits on a trivial problem; get the template working end to end" },
  ],

  spoilers: [
    { summary: "Hint for LC 29 &mdash; the <code>Integer.MIN_VALUE</code> asymmetry",
      body: "<p>Two's complement is asymmetric: <code>Integer.MIN_VALUE</code> is " +
        "<code>-2147483648</code> but the maximum is <code>2147483647</code>, so " +
        "<code>-Integer.MIN_VALUE</code> overflows back to itself. The standard fix is to work " +
        "with <em>negative</em> numbers throughout, since every positive value has a negative " +
        "counterpart but not the reverse, and to special-case " +
        "<code>MIN_VALUE / -1</code> which is the only division that overflows. Transferable " +
        "lesson: <em>whenever a problem forbids 64-bit types, the difficulty is almost always " +
        "this asymmetry rather than the algorithm.</em></p>" },
    { summary: "Hint for LC 239 &mdash; why the deque must hold indices, not values",
      body: "<p>You need to evict elements that have left the window, and that test is " +
        "<code>index &le; i - k</code>. If the deque stores values you cannot tell whether the " +
        "front is still in range. Store indices, keep them in decreasing order of " +
        "<code>a[index]</code>, pop from the back while the incoming value is larger, and pop from " +
        "the front while the index is stale. Use " +
        "<code>ArrayDeque&lt;Integer&gt;</code> or, faster, an <code>int[]</code> ring with head " +
        "and tail pointers. General lesson: <em>monotonic structures should hold positions, " +
        "because positions carry both the value and the expiry information.</em></p>" },
  ],

  recap: {
    bullets: [
      "<strong>Fast IO first.</strong> A <code>DataInputStream</code> byte reader plus a single " +
        "<code>StringBuilder</code> for output is a 10&ndash;30&times; win and costs you nothing " +
        "once it is in your template.",
      "<strong>No boxing in hot loops.</strong> <code>int[]</code> over " +
        "<code>List&lt;Integer&gt;</code>, <code>int[] cnt</code> over " +
        "<code>HashMap&lt;Integer,Integer&gt;</code>, <code>ArrayDeque</code> over " +
        "<code>Stack</code>.",
      "<strong>Cast before you multiply</strong> and use <code>lo + (hi - lo) / 2</code>. Overflow " +
        "produces a plausible wrong answer, never an exception.",
      "<strong>Comparators use <code>Integer.compare</code></strong>, never subtraction, and " +
        "<code>Math.floorMod</code> handles negative moduli.",
      "<strong>Shuffle before <code>Arrays.sort(int[])</code></strong> on hostile input, and run " +
        "deep recursion on a thread with a 64&nbsp;MB stack.",
    ],
    oneliner: "FastReader + one StringBuilder | int[] not List<Integer> | (long)a*b | lo+(hi-lo)/2 | Integer.compare | floorMod",
  },
},

/* ======================================= 5. problem-solving-framework === */
{
  id: "problem-solving-framework",
  difficulty: "Easy",
  readTime: "20 min",
  tagline: "A repeatable forty-five minute procedure for turning an unfamiliar problem into " +
    "working code, so that under pressure you execute a process instead of hoping for inspiration.",
  tags: ["meta", "interview", "process", "debugging"],
  prereqs: [["Constraints to Complexity", "constraints-to-complexity.html"]],

  why: {
    paras: [
      "The difference between people who solve interview problems reliably and people who solve " +
      "them sometimes is rarely knowledge. It is process. Under pressure, an unstructured solver " +
      "reads the statement once, pattern-matches to the first vaguely similar thing they " +
      "remember, starts coding, discovers a flaw at minute twenty-five, and has no time to " +
      "recover. A structured solver spends ten minutes not writing code and finishes early.",
      "The procedure below is deliberately mechanical. Each phase has an exit condition, so you " +
      "always know whether you are allowed to move on. That matters most exactly when you are " +
      "anxious, because it replaces the question \"am I stuck?\" &mdash; which has no useful " +
      "answer &mdash; with \"have I met the exit condition for this phase?\", which does.",
      "It also gives you something to say out loud. Interviewers score communication, and " +
      "narrating \"let me restate the problem, then check the constraints, then try a small " +
      "example\" is both genuinely useful and exactly the signal they are looking for. Silence " +
      "while you think is the most common avoidable loss in an interview.",
    ],
    insightTitle: "The core discipline",
    insight: "Do not write code until you can state the algorithm in one or two sentences and " +
      "have verified it by hand on a small example. Every minute spent there saves three minutes " +
      "of debugging, and debugging is where interviews are lost.",
  },

  recognise: {
    yes: [
      "You are in a timed interview or contest and the problem is unfamiliar",
      "You have read the statement twice and still do not know where to start",
      "You started coding, and now the code does not match what you meant &rarr; go back to " +
        "phase 3 rather than patching",
      "Your solution fails on a test you cannot reproduce &rarr; the systematic debugging " +
        "section applies",
      "You have a working brute force and need to reach the intended complexity",
    ],
    no: [
      "You recognise the problem instantly and know the algorithm &rarr; still do phase 2 " +
        "(constraints) and phase 5 (edge cases), skip the rest",
      "It is a pure implementation problem with no algorithmic content &rarr; spend the time on " +
        "careful specification instead",
      "You are practising a specific technique &rarr; the framework matters less than repetition " +
        "of the pattern",
    ],
    table: [
      ["Cannot restate the problem in your own words", "You do not yet understand it", "Re-read; ask clarifying questions"],
      ["Understand it but see no approach", "Missing a pattern or a reformulation", "Brute force first, then look for the wasted work"],
      ["Have an idea but cannot prove it", "Usually a greedy that needs an exchange argument", "Test it against a brute force on random small inputs"],
      ["Coding and the code keeps changing shape", "The algorithm was never pinned down", "Stop; write the invariant in one sentence"],
      ["Passes samples, fails hidden tests", "Edge cases or overflow", "Run the edge-case checklist"],
      ["Correct but too slow", "Wrong complexity class, or a constant-factor problem", "Recheck the constraint budget first"],
      ["<strong>Confused with:</strong> being stuck vs being slow", "Different remedies entirely", "Stuck &rarr; change representation. Slow &rarr; remove repeated work"],
    ],
    constraint: "a 45-minute interview budgets roughly: 5 min understand, 5 min constraints and " +
      "examples, 10 min design, 15 min code, 5 min test, 5 min buffer. If you are still designing " +
      "at minute 20, present the brute force and improve it aloud.",
  },

  core: {
    heading: "The seven phases",
    paras: [
      "<strong>1. Restate (2&ndash;3 min).</strong> Say the problem back in your own words, " +
      "including the exact input, the exact output, and any guarantee you were given. If you " +
      "cannot do this without looking, you have not understood it. Ask about duplicates, negative " +
      "values, empty input, and whether the input is sorted.",
      "<strong>2. Read the constraints (1 min).</strong> This gives you the target complexity and " +
      "often the technique &mdash; see " +
      "<a href=\"constraints-to-complexity.html\">Constraints to Complexity</a>. Write the target " +
      "down. Everything after this point is measured against it.",
      "<strong>3. Work a small example by hand (3&ndash;5 min).</strong> Take the smallest " +
      "non-trivial input and compute the answer manually, watching <em>how</em> you do it. Your " +
      "own procedure is usually the brute force, and the step you find tedious is usually the step " +
      "the algorithm optimises. This is where most insights actually come from.",
      "<strong>4. Brute force, out loud (2 min).</strong> State the obvious solution and its " +
      "complexity even if it is far too slow. It establishes correctness, gives you a reference " +
      "implementation for stress testing, and guarantees you have <em>something</em> if you run " +
      "out of time.",
      "<strong>5. Find the wasted work (5&ndash;10 min).</strong> Optimisation is always the same " +
      "question: what is the brute force recomputing? The answers form a short list &mdash; " +
      "recomputing a range sum (prefix sums), rescanning a window (two pointers), re-searching a " +
      "sorted array (binary search), recomputing a subproblem (DP), re-finding a minimum (heap), " +
      "re-checking membership (hashing). Match your waste to one of these.",
      "<strong>6. Fix the invariant, then code (15 min).</strong> Write one sentence describing " +
      "what is true at every step (\"<code>best</code> holds the maximum subarray sum ending at " +
      "<code>i</code>\"). Only then type. The invariant is what makes the code write itself.",
      "<strong>7. Test deliberately (5 min).</strong> Empty, single element, all equal, all " +
      "negative, maximum size, and the boundary between your branches. Trace the code on one " +
      "small case line by line rather than re-reading it.",
    ],
    invariantTitle: "The stuck protocol",
    invariant: "<p>When you have no idea, run these six in order &mdash; they are ordered by how " +
      "often they work:</p><ol>" +
      "<li><strong>Solve a smaller version.</strong> <code>n = 1, 2, 3</code>. Look for the " +
      "recurrence.</li>" +
      "<li><strong>Sort it.</strong> A surprising fraction of problems become obvious in sorted " +
      "order.</li>" +
      "<li><strong>Change the representation.</strong> Array &rarr; graph, string &rarr; counts, " +
      "pairs &rarr; intervals, values &rarr; bits.</li>" +
      "<li><strong>Go backwards.</strong> Process right to left, or reason from the answer to the " +
      "input.</li>" +
      "<li><strong>Ask what you would precompute</strong> if you had unlimited preprocessing time.</li>" +
      "<li><strong>Relax a constraint</strong>, solve the easier problem, then reintroduce it.</li>" +
      "</ol>",
    extra: [
      { kind: "tip", title: "Stress testing: the fastest debugger you own",
        html: "<p>When a solution fails on a hidden test, do not stare at it. Write a brute force " +
          "that is obviously correct, write a generator that produces random tiny inputs " +
          "(<code>n &le; 8</code>, values in <code>0 &hellip; 5</code>), and loop until the two " +
          "disagree. You will usually have a minimal counterexample within seconds, and a minimal " +
          "counterexample almost always makes the bug self-evident. The code for this is in the " +
          "second tab below.</p>" },
      { kind: "warn", title: "The most expensive interview mistake",
        html: "<p>Coding before the approach is settled. It feels productive and it is not: you " +
          "end up debugging a design, which is much slower than debugging an implementation. The " +
          "tell is that you keep changing the shape of the code &mdash; adding a variable, " +
          "restructuring a loop &mdash; rather than fixing individual lines. When you notice that, " +
          "stop and go back to phase 6.</p>" },
      { kind: "math", title: "What to do at minute 30 with nothing working",
        html: "<p>Switch to damage control. Say: \"I have an <code>O(n&sup2;)</code> approach that " +
          "is definitely correct; let me implement that, and then discuss how to get to " +
          "<code>O(n log n)</code>.\" A working suboptimal solution plus an accurate description " +
          "of the better one scores far higher than an unfinished optimal attempt. Interviewers " +
          "are evaluating whether you would ship something.</p>" },
    ],
  },

  visuals: [
    {
      kind: "grid", vizId: "phases",
      h3: "The forty-five minute budget",
      intro: "Each row is a phase, with its time box, its exit condition, and the failure mode you " +
        "get by skipping it. Step through once before your next mock interview.",
      caption: "The exit condition column is the useful one: it tells you objectively whether you " +
        "are allowed to move to the next phase.",
      data: {
        corner: "phase",
        rowHeads: ["1 restate", "2 constraints", "3 example", "4 brute force",
                   "5 optimise", "6 code", "7 test"],
        colHeads: ["minutes", "exit condition", "cost of skipping"],
        vars: ["phase", "clock"],
        speed: 1400,
        frames: [
          { note: "Restate the problem in your own words, with exact input and output. Ask about duplicates, negatives, empties and sortedness.",
            cells: [{ r: 0, c: 0, val: "0-3" }, { r: 0, c: 1, val: "can restate blind", cls: "target" },
                    { r: 0, c: 2, val: "solve wrong problem" }],
            values: { phase: "restate", clock: "3 min" } },
          { note: "Read the constraints and write down the target complexity. One minute, and it eliminates most wrong directions.",
            cells: [{ r: 1, c: 0, val: "3-4" }, { r: 1, c: 1, val: "target written down", cls: "target" },
                    { r: 1, c: 2, val: "aim at the wrong class" }],
            values: { phase: "constraints", clock: "4 min" } },
          { note: "Work the smallest interesting example by hand and watch your own procedure. This is where most insights actually appear.",
            cells: [{ r: 2, c: 0, val: "4-9" }, { r: 2, c: 1, val: "answer computed by hand", cls: "target" },
                    { r: 2, c: 2, val: "no intuition to build on" }],
            values: { phase: "example", clock: "9 min" } },
          { note: "State the brute force and its complexity out loud, even if hopeless. It is your correctness reference and your fallback.",
            cells: [{ r: 3, c: 0, val: "9-11" }, { r: 3, c: 1, val: "stated with complexity", cls: "target" },
                    { r: 3, c: 2, val: "nothing to show at minute 40" }],
            values: { phase: "brute force", clock: "11 min" } },
          { note: "Ask what the brute force recomputes, and map that waste onto a known technique. This is the actual problem-solving step.",
            cells: [{ r: 4, c: 0, val: "11-20" }, { r: 4, c: 1, val: "approach in one sentence", cls: "target" },
                    { r: 4, c: 2, val: "code that keeps changing shape" }],
            values: { phase: "optimise", clock: "20 min" } },
          { note: "Write the invariant, then implement. If you cannot write the invariant, you are not ready to type.",
            cells: [{ r: 5, c: 0, val: "20-35" }, { r: 5, c: 1, val: "compiles and runs samples", cls: "target" },
                    { r: 5, c: 2, val: "debugging a design, not a bug" }],
            values: { phase: "code", clock: "35 min" } },
          { note: "Empty, single, all equal, all negative, maximum size, and the boundary between branches. Trace one case line by line.",
            cells: [{ r: 6, c: 0, val: "35-40" }, { r: 6, c: 1, val: "edge list cleared", cls: "target" },
                    { r: 6, c: 2, val: "fails on the hidden test" }],
            values: { phase: "test", clock: "40 min" } },
          { note: "Five minutes of buffer left. If you are behind at minute 20, jump straight to implementing the brute force and describe the optimisation aloud.",
            cells: [{ r: 4, c: 1, val: "approach in one sentence", cls: "answer" },
                    { r: 3, c: 1, val: "stated with complexity", cls: "answer" }],
            values: { phase: "buffer", clock: "45 min" } },
        ],
      },
    },
    {
      kind: "array", vizId: "waste",
      h3: "From brute force to optimal: find the wasted work",
      intro: "Six recurring forms of waste and the technique that removes each one. Almost every " +
        "optimisation you will ever make is one of these six, so learning to name the waste is " +
        "learning to find the algorithm.",
      caption: "The optimisation question is never \"what algorithm applies?\" but \"what is the " +
        "brute force repeating?\" &mdash; the second question has a short, learnable answer set.",
      data: {
        label: "wasted work \u2192 technique",
        array: ["range sums", "window rescans", "sorted lookups", "subproblems", "min/max", "membership"],
        indexLabels: ["1", "2", "3", "4", "5", "6"],
        vars: ["waste", "technique", "gain"],
        speed: 1300,
        frames: [
          { note: "Recomputing the sum of a range you already summed. Precompute prefix sums once and every range becomes a subtraction.",
            active: [0], dim: [1,2,3,4,5],
            values: { waste: "re-summing ranges", technique: "prefix sums", gain: "O(n\u00b2)\u2192O(n)" } },
          { note: "Rescanning a window after moving its edge by one. The window changes by one element, so update incrementally.",
            active: [1], done: [0], dim: [2,3,4,5],
            values: { waste: "rescanning windows", technique: "two pointers / sliding window", gain: "O(n\u00b2)\u2192O(n)" } },
          { note: "Linearly searching data that is already sorted, or could be sorted once.",
            active: [2], done: [0,1], dim: [3,4,5],
            values: { waste: "linear search on sorted data", technique: "binary search", gain: "O(n)\u2192O(log n)" } },
          { note: "Recomputing the same subproblem down different branches of a recursion. Memoise, or build the table bottom up.",
            active: [3], done: [0,1,2], dim: [4,5],
            values: { waste: "repeated subproblems", technique: "dynamic programming", gain: "exponential\u2192polynomial" } },
          { note: "Re-finding the minimum or maximum of a changing set on every step.",
            active: [4], done: [0,1,2,3], dim: [5],
            values: { waste: "re-finding extremes", technique: "heap / monotonic deque", gain: "O(n)\u2192O(log n) or O(1)" } },
          { note: "Re-checking whether you have seen a value. Hash it once.",
            active: [5], done: [0,1,2,3,4],
            values: { waste: "re-checking membership", technique: "hash set / map", gain: "O(n)\u2192O(1)" } },
          { note: "Run the list top to bottom against your brute force. In practice one of the six always matches, and the match is the algorithm.",
            best: [0,1,2,3,4,5],
            values: { waste: "all six", technique: "the optimisation checklist", gain: "use it every time" } },
        ],
      },
    },
    {
      kind: "mermaid", vizId: "flowSolve",
      h3: "The decision flow, end to end",
      caption: "The two loops matter as much as the path: the stuck loop on the left and the " +
        "debugging loop at the bottom are where most of the real time goes.",
      src: `flowchart TD
  A(["read the statement"]) --> B["restate it in your own words"]
  B --> C["read constraints, write the target complexity"]
  C --> D["work a tiny example by hand"]
  D --> E{"do you see an approach?"}
  E -- no --> S["stuck protocol: smaller, sort, re-represent, reverse, precompute, relax"]
  S --> D
  E -- yes --> F["state the brute force and its cost"]
  F --> G["what work does it repeat?"]
  G --> H["map the waste to a technique"]
  H --> I{"does it meet the target?"}
  I -- no --> G
  I -- yes --> J["write the invariant in one sentence"]
  J --> K["implement"]
  K --> L["run the edge case checklist"]
  L --> M{"all pass?"}
  M -- no --> N["stress test against the brute force"]
  N --> K
  M -- yes --> O(["done, state the complexity"])`,
      wide: true,
    },
  ],

  steps: [
    "<strong>Restate</strong> the problem, its input, its output and its guarantees without " +
      "looking at the statement.",
    "<strong>Extract the target complexity</strong> from the constraints and write it down.",
    "<strong>Hand-solve</strong> the smallest interesting example and watch your own method.",
    "<strong>State the brute force</strong> and its complexity out loud.",
    "<strong>Name the wasted work</strong> and match it against the six-item checklist.",
    "<strong>Write the invariant</strong> in one sentence before typing anything.",
    "<strong>Implement</strong>, keeping the invariant true at every line.",
    "<strong>Run the edge-case checklist</strong>: empty, one element, all equal, all negative, " +
      "maximum size, duplicates, and each branch boundary.",
    "<strong>State the final complexity</strong> unprompted, time and space, and mention one " +
      "possible improvement.",
  ],

  dryRun: {
    intro: "The framework applied to \"maximum subarray sum\" &mdash; the same problem covered in " +
      "<a href=\"../01-arrays-and-windows/kadane.html\">Kadane's Algorithm</a>. Notice that the " +
      "algorithm appears at step 6, after five steps of not writing code.",
    cols: ["Phase", "What you do", "Output of the phase"],
    rows: [
      { cells: ["1 restate", "\"Given an integer array, find the contiguous non-empty subarray with the largest sum, and return that sum.\"",
        "Confirmed: non-empty, may be all negative"],
        action: "The two clarifications you must ask for: can it be empty, can all values be negative." },
      { cells: ["2 constraints", "<code>n &le; 10&#8309;</code>, <code>|a<sub>i</sub>| &le; 10&#8308;</code>",
        "Target <code>O(n)</code> or <code>O(n log n)</code>; sum fits in <code>long</code>"],
        action: "<code>10&#8309; &times; 10&#8308; = 10&#8313;</code> exceeds <code>int</code>. Use <code>long</code>.", change: true },
      { cells: ["3 example", "<code>[-2, 1, -3, 4, -1, 2, 1, -5, 4]</code> by hand", "Answer 6, from <code>[4, -1, 2, 1]</code>"],
        action: "Notice what you did: you extended a run and abandoned it when it went too negative." },
      { cells: ["4 brute force", "All <code>O(n&sup2;)</code> subarrays, summing each in <code>O(n)</code>", "<code>O(n&sup3;)</code>, far too slow"],
        action: "Say it anyway. It is the correctness reference." },
      { cells: ["5 waste", "The inner sum recomputes a prefix already computed", "Matches waste #1 &rarr; running sums"],
        action: "Removes one factor of <code>n</code>, giving <code>O(n&sup2;)</code>. Still short of target.", change: true },
      { cells: ["5b waste again", "Every start index rescans the same suffixes", "Matches waste #4 &rarr; subproblem reuse"],
        action: "Define <code>best(i)</code> = best sum <em>ending at</em> <code>i</code>. That is the key reformulation." },
      { cells: ["6 invariant", "\"<code>cur</code> is the maximum sum of a subarray ending exactly at <code>i</code>\"",
        "<code>cur = max(a[i], cur + a[i])</code>"],
        action: "The recurrence follows from the invariant in one line.", change: true },
      { cells: ["7 code", "One loop, two variables, <code>long</code> accumulators", "<code>O(n)</code> time, <code>O(1)</code> space"],
        action: "Initialise <code>cur = best = a[0]</code>, never 0." },
      { cells: ["8 test", "<code>[-1]</code>, <code>[-5,-2,-3]</code>, <code>[1]</code>, all equal, <code>n = 10&#8309;</code>",
        "All-negative case catches the <code>0</code>-initialisation bug"],
        action: "This single edge case is the most common failure on this problem." },
    ],
  },

  code: [
    { tab: "Worked example", panel: "Worked example", file: "FrameworkWalkthrough.java",
      intro: "The three stages from the dry run, in code, so you can see the progression the " +
        "framework produces rather than jumping straight to the answer.",
      highlight: "34-40",
      code: `public class FrameworkWalkthrough {

    /** Phase 4: brute force. O(n^3). Correct, and the reference for stress testing. */
    static long cubic(int[] a) {
        long best = Long.MIN_VALUE;
        for (int i = 0; i < a.length; i++) {
            for (int j = i; j < a.length; j++) {
                long sum = 0;
                for (int k = i; k <= j; k++) {
                    sum += a[k];
                }
                best = Math.max(best, sum);
            }
        }
        return best;
    }

    /** Phase 5: remove waste #1, the recomputed range sum. O(n^2). */
    static long quadratic(int[] a) {
        long best = Long.MIN_VALUE;
        for (int i = 0; i < a.length; i++) {
            long sum = 0;
            for (int j = i; j < a.length; j++) {
                sum += a[j];                       // extend instead of re-summing
                best = Math.max(best, sum);
            }
        }
        return best;
    }

    /**
     * Phase 6: remove waste #4, the repeated subproblem.
     * Invariant: cur = maximum sum of a subarray ending exactly at index i.
     * O(n) time, O(1) space.
     */
    static long linear(int[] a) {
        long cur = a[0], best = a[0];              // never initialise to 0
        for (int i = 1; i < a.length; i++) {
            cur = Math.max(a[i], cur + a[i]);      // start fresh, or extend
            best = Math.max(best, cur);
        }
        return best;
    }

    public static void main(String[] args) {
        int[] a = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
        System.out.println(cubic(a) + " " + quadratic(a) + " " + linear(a));
        int[] allNeg = {-5, -2, -3};
        System.out.println(linear(allNeg));        // the edge case that catches bad init
    }
    // Input : [-2,1,-3,4,-1,2,1,-5,4] then [-5,-2,-3]
    // Output: 6 6 6
    //         -2
}`,
    },
    { tab: "Stress testing", panel: "Stress test", file: "StressTest.java",
      intro: "Paste this whenever a solution fails on a test you cannot see. A brute force plus a " +
        "random generator finds a minimal counterexample in seconds, and minimal counterexamples " +
        "are usually self-explanatory.",
      highlight: "30-44",
      code: `import java.util.Arrays;
import java.util.Random;

public class StressTest {

    /** Obviously correct, hopelessly slow. */
    static long brute(int[] a) {
        long best = Long.MIN_VALUE;
        for (int i = 0; i < a.length; i++) {
            long sum = 0;
            for (int j = i; j < a.length; j++) {
                sum += a[j];
                best = Math.max(best, sum);
            }
        }
        return best;
    }

    /** Deliberately buggy: initialising to 0 breaks on all-negative input. */
    static long fast(int[] a) {
        long cur = 0, best = 0;
        for (int v : a) {
            cur = Math.max(v, cur + v);
            best = Math.max(best, cur);
        }
        return best;
    }

    public static void main(String[] args) {
        Random rnd = new Random(12345);            // fixed seed: reproducible failures
        for (int iter = 1; iter <= 100000; iter++) {
            int n = 1 + rnd.nextInt(6);            // tiny inputs only
            int[] a = new int[n];
            for (int i = 0; i < n; i++) {
                a[i] = rnd.nextInt(11) - 5;        // small range forces collisions
            }
            long expected = brute(a);
            long actual = fast(a);
            if (expected != actual) {
                System.out.println("mismatch on iteration " + iter);
                System.out.println("  input    " + Arrays.toString(a));
                System.out.println("  expected " + expected);
                System.out.println("  actual   " + actual);
                return;                            // stop at the FIRST, smallest failure
            }
        }
        System.out.println("no mismatch in 100000 random tests");
    }
    // Output: mismatch on iteration 3
    //           input    [-4]
    //           expected -4
    //           actual   0
}`,
    },
    { tab: "Edge case checklist", panel: "Edge cases", file: "EdgeCases.java",
      intro: "A runnable checklist. Adapt the array of cases to your problem and run it before " +
        "you submit; it takes thirty seconds and catches the majority of hidden-test failures.",
      code: `import java.util.Arrays;
import java.util.function.Function;

public class EdgeCases {

    /** Replace this with the solution under test. */
    static Function<int[], Long> solution = a -> {
        if (a.length == 0) {
            return 0L;                             // decide and document this case
        }
        long cur = a[0], best = a[0];
        for (int i = 1; i < a.length; i++) {
            cur = Math.max(a[i], cur + a[i]);
            best = Math.max(best, cur);
        }
        return best;
    };

    public static void main(String[] args) {
        int[][] cases = {
            {},                                    // empty
            {7},                                   // single element
            {-7},                                  // single negative
            {3, 3, 3, 3},                          // all equal
            {-5, -2, -3},                          // all negative
            {1, 2, 3, 4},                          // already sorted / all positive
            {4, 3, 2, 1},                          // reverse sorted
            {0, 0, 0},                             // all zero
            {1000000000, 1000000000},              // overflow probe: needs long
            {-1000000000, 1000000000},             // sign boundary
        };
        for (int[] c : cases) {
            System.out.printf("%-28s -> %d%n", Arrays.toString(c), solution.apply(c));
        }
    }
    // Output: []                           -> 0
    //         [7]                          -> 7
    //         [-7]                         -> -7
    //         [3, 3, 3, 3]                 -> 12
    //         [-5, -2, -3]                 -> -2
    //         [1, 2, 3, 4]                 -> 10
    //         [4, 3, 2, 1]                 -> 10
    //         [0, 0, 0]                    -> 0
    //         [1000000000, 1000000000]     -> 2000000000
    //         [-1000000000, 1000000000]    -> 1000000000
}`,
    },
  ],

  complexity: {
    time: "process, not algorithm",
    space: "&mdash;",
    derivation: [
      "<p>There is no asymptotic analysis for a process, but the time budget is worth stating " +
      "explicitly because it is what you are actually optimising in an interview:</p>",
      "<span class=\"eq\">45 min = 3 (restate) + 1 (constraints) + 5 (example) + 2 (brute force) + 9 (optimise) + 15 (code) + 5 (test) + 5 (buffer)</span>",
      "<p>Two-thirds of that is spent not writing code, which is the point. Empirically the " +
      "failure mode is never \"spent too long thinking\"; it is \"started coding at minute four " +
      "and was still debugging at minute forty\".</p>",
      "<p>For stress testing, the cost is worth knowing: with inputs of size <code>n &le; 6</code> " +
      "over a value range of 11, there are only a few thousand distinct shapes, so a mismatch " +
      "appears within a few hundred iterations for essentially any real bug. Running " +
      "<code>10&#8309;</code> iterations takes a second and is far more thorough than any set of " +
      "hand-written tests.</p>",
    ],
    compare: [
      ["Restate the problem", "2&ndash;3 min", "&mdash;", "Prevents solving the wrong problem"],
      ["Check constraints", "1 min", "&mdash;", "Highest value per minute of anything here"],
      ["Hand-work an example", "3&ndash;5 min", "&mdash;", "Where insight usually comes from"],
      ["State the brute force", "2 min", "&mdash;", "Fallback plus correctness reference"],
      ["Find the waste", "5&ndash;10 min", "&mdash;", "The actual algorithmic step"],
      ["Write the invariant", "1 min", "&mdash;", "Makes the code write itself"],
      ["Stress test", "5 min setup", "&mdash;", "Faster than reading code when a hidden test fails"],
    ],
  },

  pitfalls: [
    { title: "Coding before the approach is settled",
      bug: "Starting to type at minute four with a vague plan. The code keeps changing shape, and " +
        "at minute thirty you are debugging a design rather than an implementation.",
      fix: "Enforce the exit condition: you may not type until you can state the algorithm in one " +
        "or two sentences and have verified it by hand. If the code's structure keeps changing, " +
        "that is the signal to stop and return to phase 6." },
    { title: "Solving in silence",
      bug: "Two minutes of quiet thinking reads to the interviewer as being stuck, and they cannot " +
        "give you the hint they were about to give.",
      fix: "Narrate. \"I am thinking about whether sorting helps here\" is enough. Interviewers " +
        "score communication explicitly, and thinking aloud is also how you get nudged back on " +
        "track when you drift." },
    { title: "Ignoring the constraints",
      bug: "Designing an elegant <code>O(n log n)</code> solution when <code>n &le; 20</code> and " +
        "the intended answer is a five-line bitmask, or the reverse.",
      fix: "Phase 2 exists precisely for this. One minute, always, before designing anything. See " +
        "<a href=\"constraints-to-complexity.html\">Constraints to Complexity</a>." },
    { title: "Skipping the brute force",
      bug: "Going straight for the optimal solution, failing, and having nothing to show at " +
        "minute forty. Also losing the reference implementation you would need to stress test.",
      fix: "Always state it, and implement it if you are behind schedule. A working " +
        "<code>O(n&sup2;)</code> plus a clear description of the <code>O(n log n)</code> scores " +
        "well above an unfinished optimal attempt." },
    { title: "Testing only the happy path",
      bug: "Running the provided sample, seeing it pass, and declaring victory. The hidden tests " +
        "are all-negative, empty, single element, and maximum size.",
      fix: "Run the checklist from the third code tab every time: empty, one, all equal, all " +
        "negative, all zero, duplicates, maximum values, and each branch boundary." },
    { title: "Debugging by staring",
      bug: "Re-reading the same twenty lines hoping the bug becomes visible. It rarely does, " +
        "because you read what you meant rather than what you wrote.",
      fix: "Stress test against a brute force, or print the state at every step for a tiny input " +
        "and compare against your hand trace. Both find the bug mechanically instead of by " +
        "inspiration." },
    { title: "Not stating the complexity unprompted",
      bug: "Finishing the code and waiting. The interviewer now has to ask, and you have missed a " +
        "free opportunity to demonstrate rigour.",
      fix: "Close with: \"This is <code>O(n)</code> time and <code>O(1)</code> space. The " +
        "<code>&Omega;(n)</code> lower bound is forced because we must read every element, so " +
        "this is optimal.\" Then offer one improvement or trade-off." },
  ],

  variants: [
    ["Contest mode (no interviewer)",
      "Skip the narration; add reading all problems first and sorting them by expected difficulty. " +
      "Solve the easiest confidently rather than the most interesting.",
      "read all -> sort by (solves desc) -> solve easy first -> stress test on WA",
      "Codeforces rounds"],
    ["Take-home or system design",
      "The framework stretches: restate becomes requirements gathering, constraints become scale " +
      "estimates, and the brute force becomes a naive architecture you then refine.",
      "requirements -> scale estimate -> naive design -> identify bottleneck -> refine",
      "System design interviews"],
    ["Pair programming interview",
      "Phases 1&ndash;5 become an explicit dialogue. Ask \"does that sound right to you?\" after " +
      "stating the approach, before coding.",
      "restate -> confirm -> approach -> confirm -> code aloud",
      "Common at product companies"],
    ["Debugging an existing failure",
      "Enter at phase 7. Reproduce with the smallest input, stress test against a reference, " +
      "then bisect the code by printing intermediate state.",
      "reproduce small -> stress test -> bisect with prints -> fix -> re-run checklist",
      "Contest wrong-answer recovery"],
  ],

  followups: [
    ["What do you do in the first two minutes of an interview problem?",
      "<p>Read it twice, then restate it aloud including exact input and output types, then ask " +
      "the four standard clarifying questions: how large is the input, can values be negative or " +
      "zero, are duplicates possible, and is the input sorted or otherwise structured. Those " +
      "questions take thirty seconds and frequently change the entire solution &mdash; \"the " +
      "array is sorted\" turns a hashing problem into a two-pointer problem.</p>"],
    ["You are twenty minutes in with no approach. What now?",
      "<p>Say so, and switch strategies explicitly: \"Let me implement the brute force first so we " +
      "have something correct, then optimise.\" That converts a possible zero into a solid partial " +
      "score, and implementing the brute force very often reveals the optimisation, because you " +
      "see the repeated work in front of you. Do not keep silently searching for elegance past " +
      "the halfway mark.</p>"],
    ["How do you find the bug when the code passes samples but fails hidden tests?",
      "<p>Stress test. Write an obviously correct brute force, generate random inputs with " +
      "<code>n &le; 8</code> and a tiny value range, and loop until the outputs differ. Small " +
      "value ranges matter because they force duplicates and ties, which is where most bugs live. " +
      "The first mismatch is usually two or three elements long and makes the bug obvious. This " +
      "is faster and more reliable than reading the code again.</p>"],
    ["What are the standard edge cases for array problems?",
      "<p>Empty, single element, two elements, all equal, all negative, all zero, already sorted, " +
      "reverse sorted, maximum size, and maximum values (the overflow probe). For strings add: " +
      "empty, length one, all identical characters, and a palindrome. For graphs add: no edges, " +
      "self-loops, multi-edges, disconnected components, and a single node. Keeping these lists " +
      "in your head is worth more than any individual algorithm.</p>"],
    ["How do you decide between two working approaches?",
      "<p>Complexity first &mdash; if one is a better class and the constraints care, it wins. If " +
      "they are the same class, prefer the one you can implement correctly faster, then the one " +
      "with less space, then the one that is easier to explain. State the trade-off out loud: " +
      "\"both are <code>O(n log n)</code>; the heap version uses <code>O(k)</code> space instead " +
      "of <code>O(n)</code>, so I will take that one.\" Interviewers are looking for the reasoning, " +
      "not a specific choice.</p>"],
    ["How should I practise so this becomes automatic?",
      "<p>Deliberately, with a timer. Set 25 minutes for a medium problem and force yourself " +
      "through the phases even when you already see the answer &mdash; the point is to build the " +
      "habit, not to solve the problem. Keep a log of every problem where you got stuck, recording " +
      "<em>which phase</em> failed and what the missing pattern was. After thirty problems the log " +
      "will show two or three recurring gaps, and those are worth more than another hundred " +
      "random problems.</p>"],
  ],

  problemsIntro: "Practise the <em>process</em> on these, not the answers. Use a timer, write down " +
    "the output of each phase, and only then code. The mock-drill page has unlabelled sets for " +
    "when you want to remove the pattern hint entirely.",

  problems: [
    { name: "Maximum Subarray", url: "https://leetcode.com/problems/maximum-subarray/",
      badge: "lc", tag: "LC 53", level: "Medium",
      pattern: "The worked example above. Do it again from phase 1 with a timer" },
    { name: "Product of Array Except Self", url: "https://leetcode.com/problems/product-of-array-except-self/",
      badge: "lc", tag: "LC 238", level: "Medium",
      pattern: "Phase 5 is the whole problem: what does the brute force recompute?" },
    { name: "Longest Consecutive Sequence", url: "https://leetcode.com/problems/longest-consecutive-sequence/",
      badge: "lc", tag: "LC 128", level: "Medium",
      pattern: "Stuck protocol step 2 (sort) gives O(n log n); step 3 (re-represent) gives O(n)" },
    { name: "3Sum", url: "https://leetcode.com/problems/3sum/",
      badge: "lc", tag: "LC 15", level: "Medium",
      pattern: "Brute force O(n&sup3;), sort, then two pointers. Edge cases are all about duplicates" },
    { name: "Container With Most Water", url: "https://leetcode.com/problems/container-with-most-water/",
      badge: "lc", tag: "LC 11", level: "Medium",
      pattern: "Hand-work a small example; the exchange argument appears from the trace" },
    { name: "Group Anagrams", url: "https://leetcode.com/problems/group-anagrams/",
      badge: "lc", tag: "LC 49", level: "Medium",
      pattern: "Stuck protocol step 3: change the representation to a canonical key" },
    { name: "Jump Game", url: "https://leetcode.com/problems/jump-game/",
      badge: "lc", tag: "LC 55", level: "Medium",
      pattern: "Write the invariant before coding; it is one sentence and the code follows" },
    { name: "Find All Anagrams in a String", url: "https://leetcode.com/problems/find-all-anagrams-in-a-string/",
      badge: "lc", tag: "LC 438", level: "Medium",
      pattern: "Waste #2: the brute force rescans the window on every shift" },
    { name: "Subarray Sum Equals K", url: "https://leetcode.com/problems/subarray-sum-equals-k/",
      badge: "lc", tag: "LC 560", level: "Medium",
      pattern: "Wastes #1 and #6 combined; a good stress-testing target because of negatives" },
    { name: "Task Scheduler", url: "https://leetcode.com/problems/task-scheduler/",
      badge: "lc", tag: "LC 621", level: "Medium",
      pattern: "Hand-work three examples before theorising; the formula emerges from the trace" },
    { name: "Watermelon", url: "https://codeforces.com/problemset/problem/4/A",
      badge: "cf", tag: "CF 4A", level: "Easy",
      pattern: "Practise phase 1 and phase 8 on a trivial problem: restate, then list edge cases" },
    { name: "Books", url: "https://codeforces.com/problemset/problem/279/B",
      badge: "cf", tag: "CF 279B", level: "Medium",
      pattern: "Two pointers found via waste #2; classic phase-5 exercise" },
  ],

  spoilers: [
    { summary: "Hint for LC 128 &mdash; the stuck protocol in action",
      body: "<p>Sorting (protocol step 2) gives <code>O(n log n)</code> immediately and is a " +
        "perfectly good answer. To reach <code>O(n)</code>, apply step 3, change the " +
        "representation: put everything in a <code>HashSet</code>, then start a count only at " +
        "values <code>v</code> where <code>v - 1</code> is absent &mdash; those are the sequence " +
        "starts. Each element is visited at most twice overall, so the nested-looking loop is " +
        "linear. Transferable lesson: <em>when the brute force is quadratic because of repeated " +
        "scanning, look for a cheap test that makes each element the responsibility of exactly one " +
        "iteration.</em></p>" },
    { summary: "Hint for LC 560 &mdash; why negatives break the obvious approach",
      body: "<p>Sliding window fails here because a negative number means growing the window can " +
        "<em>decrease</em> the sum, so the monotonicity that two pointers rely on is gone. Use " +
        "waste #1 plus waste #6 instead: prefix sums plus a <code>HashMap</code> from prefix value " +
        "to count. At index <code>i</code> with prefix <code>p</code>, the number of subarrays " +
        "ending at <code>i</code> with sum <code>k</code> is the number of earlier prefixes equal " +
        "to <code>p - k</code>. Remember to seed the map with <code>{0: 1}</code>. General " +
        "lesson: <em>check for negative values before reaching for a sliding window; the window " +
        "technique requires the quantity to be monotone in the window size.</em></p>" },
  ],

  recap: {
    bullets: [
      "<strong>Seven phases with exit conditions:</strong> restate, constraints, hand example, " +
        "brute force, find the waste, invariant, code, test. Do not advance until the exit " +
        "condition is met.",
      "<strong>Optimisation is one question:</strong> what does the brute force recompute? Match " +
        "the waste to prefix sums, two pointers, binary search, DP, a heap, or hashing.",
      "<strong>The stuck protocol:</strong> smaller version, sort it, change representation, go " +
        "backwards, ask what you would precompute, relax a constraint.",
      "<strong>Stress test rather than stare.</strong> A brute force plus random tiny inputs finds " +
        "a minimal counterexample in seconds.",
      "<strong>Narrate, and always state the complexity unprompted.</strong> A working " +
        "<code>O(n&sup2;)</code> with a clear path to <code>O(n log n)</code> beats an unfinished " +
        "optimal solution.",
    ],
    oneliner: "restate -> constraints -> hand example -> brute force -> name the waste -> invariant -> code -> edge cases",
  },
},

];

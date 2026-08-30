/* Module 01 — Arrays, Prefix Sums & Windows (kadane.html is hand-authored) */

export const topics = [

/* ================================================= 1. prefix-sums ======= */
{
  id: "prefix-sums",
  difficulty: "Easy",
  readTime: "24 min",
  tagline: "Trade one linear precomputation for constant-time range queries &mdash; the cheapest " +
    "and most widely applicable optimisation in the whole toolkit.",
  tags: ["prefix sums", "difference array", "2D", "hashing", "P0"],
  prereqs: [["Complexity Analysis", "../00-foundations/complexity-analysis.html"]],

  why: {
    paras: [
      "\"What is the sum of <code>a[l..r]</code>?\" answered naively costs <code>O(r - l)</code>, " +
      "so <code>q</code> queries cost <code>O(nq)</code>, which dies at " +
      "<code>n = q = 10&#8309;</code>. One preprocessing pass that stores every prefix total makes " +
      "each query a single subtraction. That is the entire idea, and it recurs everywhere: two " +
      "dimensions, XOR instead of addition, counts instead of values, and reversed as a " +
      "difference array for range <em>updates</em>.",
      "It matters more than its simplicity suggests because it is a component rather than a " +
      "solution. Prefix sums plus a hash map solves \"count subarrays with sum <code>k</code>\". " +
      "Prefix sums plus binary search solves \"shortest subarray with sum at least <code>k</code>\" " +
      "on positive arrays. Prefix XOR plus a trie solves maximum-XOR-subarray. Prefix parity " +
      "solves \"longest subarray with equal zeros and ones\". Each of those is a top-50 interview " +
      "question, and each is a two-line transform on top of this page.",
      "The reformulation to internalise is that a subarray is a <em>difference of two prefixes</em>. " +
      "Once you see <code>sum(l, r) = P[r+1] - P[l]</code>, every question about subarrays becomes " +
      "a question about <em>pairs of prefix values</em>, and questions about pairs are the natural " +
      "home of sorting, hashing and binary search.",
    ],
    insight: "A subarray is the difference of two prefixes. Rewrite every subarray condition as a " +
      "condition on two prefix values, then attack the pair problem with a hash map, a sort, or a " +
      "binary search.",
  },

  recognise: {
    yes: [
      "Many range-sum, range-count or range-XOR queries on a <strong>static</strong> array",
      "The phrase \"subarray sum equals <code>k</code>\", \"divisible by <code>k</code>\", or " +
        "\"equal number of X and Y\"",
      "Many <strong>range updates</strong> followed by one final read &rarr; difference array, " +
        "the mirror image of this technique",
      "A 2D grid with repeated rectangle-sum queries &rarr; 2D prefix sums with " +
        "inclusion-exclusion",
      "Sums appear inside a binary search predicate &rarr; precompute prefixes so the predicate " +
        "is <code>O(1)</code>",
    ],
    no: [
      "The array changes between queries &rarr; use a " +
        "<a href=\"../06-range-queries/fenwick-tree.html\">Fenwick tree</a> or " +
        "<a href=\"../06-range-queries/segment-tree.html\">segment tree</a>",
      "You need range minimum rather than range sum &rarr; min has no inverse, so use a " +
        "<a href=\"../06-range-queries/sparse-table-and-rmq.html\">sparse table</a>",
      "There is exactly one query &rarr; just loop; the precomputation is wasted",
      "The operation has no inverse (max, gcd, bitwise AND/OR) &rarr; prefix arrays cannot " +
        "subtract; use a sparse table or a segment tree instead",
    ],
    table: [
      ["\"sum of elements from index l to r\"", "Repeated range aggregate", "1D prefix sum"],
      ["\"sum of the submatrix (r1,c1)&hellip;(r2,c2)\"", "Two-dimensional aggregate", "2D prefix with inclusion-exclusion"],
      ["\"add v to every element in [l, r]\", many times", "Range update, point read at the end", "Difference array"],
      ["\"count subarrays with sum exactly k\"", "Pair of prefixes differing by k", "Prefix + HashMap"],
      ["\"count subarrays whose sum is divisible by k\"", "Pair of prefixes with equal remainder", "Prefix mod k + counts"],
      ["\"longest subarray with equal 0s and 1s\"", "Map 0 to -1, then equal prefixes", "Prefix + first-occurrence map"],
      ["\"maximum XOR of a subarray\"", "XOR is its own inverse", "Prefix XOR + <a href=\"../05-trees/xor-trie.html\">binary trie</a>"],
      ["\"shortest subarray with sum &ge; k\", all positive", "Prefix is increasing, so binary search works", "Prefix + binary search"],
      ["<strong>Confused with:</strong> \"shortest subarray with sum &ge; k\" <em>with negatives</em>",
        "Prefix is no longer monotonic, so binary search is invalid",
        "Prefix + <a href=\"../03-linear-structures/queues-and-monotonic-deque.html\">monotonic deque</a>"],
    ],
    constraint: "<code>n, q &le; 2&times;10&#8309;</code> with range-sum queries is the standard " +
      "signature. Sums of <code>10&#8309;</code> values up to <code>10&#8313;</code> reach " +
      "<code>10&sup1;&#8308;</code>, so the prefix array is <code>long[]</code>, always.",
  },

  core: {
    heading: "Core idea and the invariant",
    paras: [
      "Define <code>P[0] = 0</code> and <code>P[i] = a[0] + a[1] + &hellip; + a[i-1]</code>. The " +
      "leading zero is not decoration: it removes every special case, because with it " +
      "<code>sum(l, r) = P[r+1] - P[l]</code> holds for all valid <code>l &le; r</code> including " +
      "<code>l = 0</code>. Implementations that start at <code>P[0] = a[0]</code> need a branch " +
      "for <code>l = 0</code>, and that branch is where the bugs live.",
      "The difference array is the same identity read backwards. To add <code>v</code> to " +
      "<code>a[l..r]</code>, write <code>d[l] += v</code> and <code>d[r+1] -= v</code>; after all " +
      "updates, the prefix sum of <code>d</code> is the array of totals added to each position. " +
      "So prefix sums turn <em>point updates and range queries</em> into <em>range updates and " +
      "point queries</em>, at <code>O(1)</code> per update and one <code>O(n)</code> pass at the " +
      "end.",
      "In two dimensions the same identity needs inclusion-exclusion, because the rectangle above " +
      "and the rectangle to the left overlap in the corner. With " +
      "<code>P[i][j]</code> the sum of the submatrix from <code>(0,0)</code> to " +
      "<code>(i-1, j-1)</code>, the build step is " +
      "<code>P[i][j] = a[i-1][j-1] + P[i-1][j] + P[i][j-1] &minus; P[i-1][j-1]</code>, and the " +
      "query reverses the signs.",
    ],
    invariantTitle: "The invariant",
    invariant: "<p><code>P[i]</code> holds the sum of the first <code>i</code> elements, so that " +
      "for every <code>0 &le; l &le; r &lt; n</code>:</p>" +
      "<span class=\"eq\">sum(l, r) = P[r+1] &minus; P[l]</span>" +
      "<p>Every technique on this page is a restatement of that line. \"Subarray with property " +
      "X\" becomes \"pair <code>(l, r+1)</code> of prefix indices whose values satisfy X\", and " +
      "counting pairs is what hash maps, sorting and binary search are for.</p>",
    extra: [
      { kind: "math", title: "2D inclusion-exclusion, derived",
        html: "<p>Let <code>P[i][j]</code> be the sum of all cells strictly above row " +
          "<code>i</code> and strictly left of column <code>j</code>. The rectangle " +
          "<code>[r1..r2] &times; [c1..c2]</code> is the big rectangle minus the strip above minus " +
          "the strip to the left, but the top-left corner has now been subtracted twice, so add it " +
          "back:</p>" +
          "<span class=\"eq\">P[r2+1][c2+1] &minus; P[r1][c2+1] &minus; P[r2+1][c1] + P[r1][c1]</span>" +
          "<p>The same alternating-sign pattern generalises to <code>d</code> dimensions with " +
          "<code>2<sup>d</sup></code> terms, which is why 3D prefix sums have eight.</p>" },
      { kind: "tip", title: "Seed the map with <code>{0: 1}</code>",
        html: "<p>When counting subarrays with sum <code>k</code> using a hash map of prefix " +
          "values, you must insert <code>(0, 1)</code> before the loop. It represents the empty " +
          "prefix and is what allows a subarray starting at index 0 to be counted. Forgetting it " +
          "is the single most common bug in this pattern, and it only shows up when the answer " +
          "includes a prefix of the array &mdash; which many sample tests avoid.</p>" },
      { kind: "warn", title: "Only invertible operations work",
        html: "<p>Prefix arrays rely on being able to <em>undo</em> the left part. Addition has " +
          "subtraction and XOR is its own inverse, so both work. Minimum, maximum, gcd, bitwise " +
          "AND and bitwise OR have no inverse: knowing <code>min(a[0..r])</code> and " +
          "<code>min(a[0..l-1])</code> tells you nothing about <code>min(a[l..r])</code>. Those " +
          "need a <a href=\"../06-range-queries/sparse-table-and-rmq.html\">sparse table</a> or a " +
          "<a href=\"../06-range-queries/segment-tree.html\">segment tree</a>.</p>" },
    ],
  },

  visuals: [
    {
      kind: "array", vizId: "pfxBuild",
      h3: "Building the prefix array and answering a query",
      intro: "The array is <code>[3, 1, 4, 1, 5, 9]</code>. Watch the prefix array grow, then see " +
        "the query <code>sum(2, 4)</code> resolve to a single subtraction.",
      caption: "Building <code>P</code> costs one pass; every query afterwards is " +
        "<code>P[r+1] &minus; P[l]</code>, one subtraction regardless of the range length.",
      data: {
        label: "P (prefix sums, P[0] = 0)",
        array: [0, "", "", "", "", "", ""],
        indexLabels: ["P0", "P1", "P2", "P3", "P4", "P5", "P6"],
        vars: ["i", "a[i-1]", "P[i]"],
        speed: 900,
        frames: [
          { note: "P[0] = 0, the empty prefix. This sentinel is what removes the l = 0 special case later.",
            arr: [0, "", "", "", "", "", ""], active: [0], dim: [1,2,3,4,5,6],
            values: { i: 0, "a[i-1]": "\u2014", "P[i]": 0 } },
          { note: "P[1] = P[0] + a[0] = 0 + 3 = 3.",
            arr: [0, 3, "", "", "", "", ""], active: [1], done: [0], dim: [2,3,4,5,6],
            values: { i: 1, "a[i-1]": 3, "P[i]": 3 } },
          { note: "P[2] = 3 + 1 = 4.",
            arr: [0, 3, 4, "", "", "", ""], active: [2], done: [0,1], dim: [3,4,5,6],
            values: { i: 2, "a[i-1]": 1, "P[i]": 4 } },
          { note: "P[3] = 4 + 4 = 8.",
            arr: [0, 3, 4, 8, "", "", ""], active: [3], done: [0,1,2], dim: [4,5,6],
            values: { i: 3, "a[i-1]": 4, "P[i]": 8 } },
          { note: "P[4] = 8 + 1 = 9.",
            arr: [0, 3, 4, 8, 9, "", ""], active: [4], done: [0,1,2,3], dim: [5,6],
            values: { i: 4, "a[i-1]": 1, "P[i]": 9 } },
          { note: "P[5] = 9 + 5 = 14.",
            arr: [0, 3, 4, 8, 9, 14, ""], active: [5], done: [0,1,2,3,4], dim: [6],
            values: { i: 5, "a[i-1]": 5, "P[i]": 14 } },
          { note: "P[6] = 14 + 9 = 23. Build complete in one O(n) pass.",
            arr: [0, 3, 4, 8, 9, 14, 23], active: [6], done: [0,1,2,3,4,5],
            values: { i: 6, "a[i-1]": 9, "P[i]": 23 } },
          { note: "Query sum(2, 4), i.e. a[2] + a[3] + a[4] = 4 + 1 + 5 = 10. Read P[5] and P[2].",
            arr: [0, 3, 4, 8, 9, 14, 23], active: [2, 5], window: [2, 5],
            values: { i: "query", "a[i-1]": "l=2, r=4", "P[i]": "P[5] - P[2]" } },
          { note: "P[5] - P[2] = 14 - 4 = 10. Correct, and it took one subtraction instead of three additions \u2014 and it would still take one subtraction for a range of a million elements.",
            arr: [0, 3, 4, 8, 9, 14, 23], best: [2, 5], done: [0,1,3,4,6],
            values: { i: "answer", "a[i-1]": "\u2014", "P[i]": 10 } },
        ],
      },
    },
    {
      kind: "grid", vizId: "pfx2d",
      h3: "2D prefix sums and inclusion-exclusion",
      intro: "The grid holds <code>P[i][j]</code>, the sum of everything above and to the left. " +
        "The last frames show a rectangle query resolving into four lookups with alternating signs.",
      caption: "A rectangle sum costs four array reads in any grid size. The <code>+</code> corner " +
        "is the double-subtracted overlap being added back.",
      data: {
        corner: "P",
        rowHeads: ["0", "1", "2", "3"],
        colHeads: ["0", "1", "2", "3"],
        vars: ["step", "formula", "value"],
        speed: 1200,
        frames: [
          { note: "The source matrix is [[1,2,3],[4,5,6],[7,8,9]]. We build P with a zero border so no index check is ever needed.",
            cells: [{ r: 0, c: 0, val: "0" }, { r: 0, c: 1, val: "0" }, { r: 0, c: 2, val: "0" }, { r: 0, c: 3, val: "0" },
                    { r: 1, c: 0, val: "0" }, { r: 2, c: 0, val: "0" }, { r: 3, c: 0, val: "0" }],
            values: { step: "zero border", formula: "P[0][*] = P[*][0] = 0", value: "\u2014" } },
          { note: "Row 1: P[1][j] = a[0][j-1] + P[1][j-1]. With a zero row above, the general formula degenerates correctly.",
            cells: [{ r: 1, c: 1, val: "1" }, { r: 1, c: 2, val: "3" }, { r: 1, c: 3, val: "6" }],
            values: { step: "row 1", formula: "a + up + left - diag", value: "1, 3, 6" } },
          { note: "Row 2: P[2][1] = 4 + 1 + 0 - 0 = 5; P[2][2] = 5 + 3 + 5 - 1 = 12; P[2][3] = 6 + 6 + 12 - 3 = 21.",
            cells: [{ r: 2, c: 1, val: "5" }, { r: 2, c: 2, val: "12" }, { r: 2, c: 3, val: "21" }],
            values: { step: "row 2", formula: "a + up + left - diag", value: "5, 12, 21" } },
          { note: "Row 3 completes the table. P[3][3] = 45 is the sum of the whole matrix.",
            cells: [{ r: 3, c: 1, val: "12" }, { r: 3, c: 2, val: "27" }, { r: 3, c: 3, val: "45" }],
            values: { step: "row 3", formula: "a + up + left - diag", value: "12, 27, 45" } },
          { note: "Query: the sum of rows 1-2, columns 1-2 of the original matrix, i.e. 5 + 6 + 8 + 9 = 28. Start from the big rectangle P[3][3] = 45.",
            cells: [{ r: 3, c: 3, val: "45", cls: "target" }],
            values: { step: "big rect", formula: "P[r2+1][c2+1]", value: "45" } },
          { note: "Subtract the strip above: P[1][3] = 6.",
            cells: [{ r: 3, c: 3, val: "45", cls: "target" }, { r: 1, c: 3, val: "6", cls: "block" }],
            values: { step: "minus top", formula: "- P[r1][c2+1]", value: "45 - 6 = 39" } },
          { note: "Subtract the strip to the left: P[3][1] = 12.",
            cells: [{ r: 3, c: 3, val: "45", cls: "target" }, { r: 1, c: 3, val: "6", cls: "block" },
                    { r: 3, c: 1, val: "12", cls: "block" }],
            values: { step: "minus left", formula: "- P[r2+1][c1]", value: "39 - 12 = 27" } },
          { note: "The top-left corner P[1][1] = 1 was removed twice, so add it back: 27 + 1 = 28. Correct.",
            cells: [{ r: 3, c: 3, val: "45", cls: "target" }, { r: 1, c: 3, val: "6", cls: "block" },
                    { r: 3, c: 1, val: "12", cls: "block" }, { r: 1, c: 1, val: "1", cls: "answer" }],
            values: { step: "plus corner", formula: "+ P[r1][c1]", value: "28" } },
        ],
      },
    },
    {
      kind: "mermaid", vizId: "pfxPick",
      h3: "Which prefix variant do you need?",
      caption: "Start from what the query asks for. The left branch covers static aggregates; the " +
        "right branch is the difference-array mirror image.",
      src: `flowchart TD
  q(["what does the problem ask?"]) --> upd{"does the array change between queries?"}
  upd -- "yes, point updates" --> bit["Fenwick tree or segment tree"]
  upd -- "yes, range updates then one read" --> diff["difference array, prefix it once at the end"]
  upd -- no --> op{"which operation?"}
  op -- "sum or count" --> dims{"one dimension or two?"}
  dims -- one --> p1["1D prefix sums"]
  dims -- two --> p2["2D prefix with inclusion-exclusion"]
  op -- xor --> px["prefix XOR, since XOR is its own inverse"]
  op -- "min, max, gcd, and, or" --> nonInv["no inverse: sparse table or segment tree"]
  p1 --> shape{"is it a subarray-property question?"}
  shape -- "sum equals k" --> hash["HashMap of prefix value to count, seeded with 0:1"]
  shape -- "divisible by k" --> mod["HashMap of prefix mod k"]
  shape -- "sum at least k, all positive" --> bs["prefix is increasing: binary search"]
  shape -- "sum at least k, with negatives" --> deq["monotonic deque over prefixes"]`,
      wide: true,
    },
  ],

  steps: [
    "<strong>Allocate <code>long[] P</code> of length <code>n + 1</code></strong> and leave " +
      "<code>P[0] = 0</code>.",
    "<strong>Fill it in one pass:</strong> <code>P[i] = P[i-1] + a[i-1]</code> for " +
      "<code>i = 1 &hellip; n</code>.",
    "<strong>Answer each query</strong> as <code>P[r+1] - P[l]</code> using inclusive " +
      "<code>l</code> and <code>r</code>.",
    "<strong>For 2D,</strong> build with a zero border and " +
      "<code>P[i][j] = a[i-1][j-1] + P[i-1][j] + P[i][j-1] - P[i-1][j-1]</code>.",
    "<strong>For range updates,</strong> use a difference array: <code>d[l] += v</code>, " +
      "<code>d[r+1] -= v</code>, then prefix-sum <code>d</code> once at the end.",
    "<strong>For subarray-property counting,</strong> restate the condition as a relation between " +
      "two prefix values, then use a <code>HashMap</code> from prefix value to count, seeded with " +
      "<code>{0: 1}</code>.",
    "<strong>Choose the accumulator type deliberately.</strong> <code>long</code> whenever " +
      "<code>n &times; max|a<sub>i</sub>|</code> can exceed <code>2.1&times;10&#8313;</code>.",
  ],

  dryRun: {
    intro: "Counting subarrays with sum <code>k = 3</code> in <code>[1, 2, 1, 2, 1]</code> using " +
      "prefix sums and a hash map. <code>need = P - k</code> is the prefix value that would " +
      "complete a valid subarray ending here.",
    cols: ["i", "a[i]", "P", "need = P &minus; 3", "count of need seen", "total", "map after"],
    rows: [
      { cells: ["&mdash;", "&mdash;", "0", "&mdash;", "&mdash;", "0", "{0:1}"],
        action: "Seed the map with the empty prefix. Without this, subarrays starting at index 0 are missed.", change: true },
      { cells: ["0", "1", "1", "-2", "0", "0", "{0:1, 1:1}"],
        action: "No prefix equal to -2 has been seen." },
      { cells: ["1", "2", "3", "0", "1", "1", "{0:1, 1:1, 3:1}"],
        action: "One earlier prefix equals 0, giving the subarray <code>[1,2]</code>.", change: true },
      { cells: ["2", "1", "4", "1", "1", "2", "{0:1, 1:1, 3:1, 4:1}"],
        action: "Prefix 1 was seen once, giving <code>[2,1]</code>." },
      { cells: ["3", "2", "6", "3", "1", "3", "{&hellip;, 6:1}"],
        action: "Prefix 3 was seen once, giving <code>[1,2]</code> at indices 2&ndash;3.", change: true },
      { cells: ["4", "1", "7", "4", "1", "4", "{&hellip;, 7:1}"],
        action: "Prefix 4 was seen once, giving <code>[2,1]</code> at indices 3&ndash;4." },
    ],
    after: "<p>Answer: <strong>4</strong> subarrays sum to 3, namely " +
      "<code>[1,2]</code>, <code>[2,1]</code>, <code>[1,2]</code> and <code>[2,1]</code>. Note " +
      "that this works with negative numbers too, which is exactly why it is preferred over a " +
      "sliding window for this question.</p>",
  },

  code: [
    { tab: "1D + queries", panel: "1D", file: "PrefixSum1D.java",
      intro: "The base template. Note the <code>long[]</code> and the <code>n + 1</code> length " +
        "with a zero sentinel &mdash; both are deliberate and both prevent common failures.",
      highlight: "10-13,20",
      code: `import java.util.Arrays;

public class PrefixSum1D {

    private final long[] p;

    /** O(n) build. P[0] = 0 so that no query needs a special case. */
    PrefixSum1D(int[] a) {
        p = new long[a.length + 1];
        for (int i = 0; i < a.length; i++) {
            p[i + 1] = p[i] + a[i];        // long: n * maxA can exceed int
        }
    }

    /** O(1). Inclusive on both ends. */
    long rangeSum(int l, int r) {
        return p[r + 1] - p[l];
    }

    /** O(1). Average of a range, as a double. */
    double rangeAvg(int l, int r) {
        return (double) rangeSum(l, r) / (r - l + 1);
    }

    public static void main(String[] args) {
        int[] a = {3, 1, 4, 1, 5, 9};
        PrefixSum1D ps = new PrefixSum1D(a);
        System.out.println(Arrays.toString(a));
        System.out.println("sum(2,4) = " + ps.rangeSum(2, 4));
        System.out.println("sum(0,5) = " + ps.rangeSum(0, 5));
        System.out.println("sum(3,3) = " + ps.rangeSum(3, 3));
        System.out.println("avg(0,5) = " + ps.rangeAvg(0, 5));
    }
    // Input : [3, 1, 4, 1, 5, 9]
    // Output: [3, 1, 4, 1, 5, 9]
    //         sum(2,4) = 10
    //         sum(0,5) = 23
    //         sum(3,3) = 1
    //         avg(0,5) = 3.8333333333333335
}`,
    },
    { tab: "2D prefix", panel: "2D", file: "PrefixSum2D.java",
      intro: "Inclusion-exclusion in both the build and the query. The zero border removes every " +
        "boundary check, which is why the code has no <code>if</code> statements at all.",
      highlight: "13-16,24-27",
      code: `public class PrefixSum2D {

    private final long[][] p;

    /** O(rows * cols) build with a zero border row and column. */
    PrefixSum2D(int[][] a) {
        int n = a.length, m = a[0].length;
        p = new long[n + 1][m + 1];
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                p[i][j] = a[i - 1][j - 1]
                        + p[i - 1][j]          // everything above
                        + p[i][j - 1]          // everything to the left
                        - p[i - 1][j - 1];     // the overlap, counted twice
            }
        }
    }

    /** O(1). All bounds inclusive. */
    long rectSum(int r1, int c1, int r2, int c2) {
        return p[r2 + 1][c2 + 1]
             - p[r1][c2 + 1]
             - p[r2 + 1][c1]
             + p[r1][c1];
    }

    public static void main(String[] args) {
        int[][] a = {
            {1, 2, 3},
            {4, 5, 6},
            {7, 8, 9},
        };
        PrefixSum2D ps = new PrefixSum2D(a);
        System.out.println("whole matrix   = " + ps.rectSum(0, 0, 2, 2));
        System.out.println("bottom-right 2x2 = " + ps.rectSum(1, 1, 2, 2));
        System.out.println("middle row     = " + ps.rectSum(1, 0, 1, 2));
        System.out.println("single cell    = " + ps.rectSum(2, 2, 2, 2));
    }
    // Output: whole matrix   = 45
    //         bottom-right 2x2 = 28
    //         middle row     = 15
    //         single cell    = 9
}`,
    },
    { tab: "Difference array", panel: "Difference", file: "DifferenceArray.java",
      intro: "The mirror image: <code>O(1)</code> range updates and one <code>O(n)</code> pass to " +
        "materialise the result. This is the right tool whenever all updates come before all reads.",
      highlight: "12-15,21-24",
      code: `import java.util.Arrays;

public class DifferenceArray {

    private final long[] d;

    DifferenceArray(int n) {
        d = new long[n + 1];               // one extra slot so r+1 is always valid
    }

    /** O(1). Add v to every index in [l, r], inclusive. */
    void add(int l, int r, long v) {
        d[l] += v;
        d[r + 1] -= v;
    }

    /** O(n). Materialise the final array. */
    long[] build() {
        long[] res = new long[d.length - 1];
        long running = 0;
        for (int i = 0; i < res.length; i++) {
            running += d[i];
            res[i] = running;
        }
        return res;
    }

    public static void main(String[] args) {
        DifferenceArray da = new DifferenceArray(8);
        da.add(1, 3, 5);                   // +5 on indices 1..3
        da.add(2, 6, 2);                   // +2 on indices 2..6
        da.add(0, 7, 1);                   // +1 everywhere
        System.out.println(Arrays.toString(da.build()));
    }
    // Three range updates in O(1) each, then one O(n) pass.
    // Output: [1, 6, 8, 8, 3, 3, 3, 1]
}`,
    },
    { tab: "Prefix + HashMap", panel: "Hashing", file: "PrefixHashing.java",
      intro: "The three highest-value applications of \"a subarray is a difference of prefixes\". " +
        "All three handle negative numbers, which is what distinguishes them from sliding windows.",
      highlight: "13-17,33-36,52-55",
      code: `import java.util.HashMap;
import java.util.Map;

public class PrefixHashing {

    /** Count subarrays with sum exactly k. Works with negatives. O(n). */
    static int countSumEqualsK(int[] a, int k) {
        Map<Long, Integer> seen = new HashMap<>();
        seen.put(0L, 1);                            // the empty prefix: essential
        long prefix = 0;
        int count = 0;
        for (int v : a) {
            prefix += v;
            count += seen.getOrDefault(prefix - k, 0);
            seen.merge(prefix, 1, Integer::sum);
        }
        return count;
    }

    /**
     * Count subarrays whose sum is divisible by k.
     * Two prefixes with the same remainder bound a divisible subarray.
     * O(n) with an int[] of size k instead of a map.
     */
    static long countDivisibleByK(int[] a, int k) {
        int[] cnt = new int[k];
        cnt[0] = 1;
        int rem = 0;
        long total = 0;
        for (int v : a) {
            rem = ((rem + v) % k + k) % k;          // floorMod: Java's % can be negative
            total += cnt[rem];
            cnt[rem]++;
        }
        return total;
    }

    /**
     * Longest subarray with equal numbers of 0 and 1.
     * Map 0 to -1: now "equal counts" means "prefix sum returns to a value it had".
     * O(n).
     */
    static int longestEqualZerosOnes(int[] bits) {
        Map<Integer, Integer> firstIndex = new HashMap<>();
        firstIndex.put(0, -1);                      // prefix 0 occurs before index 0
        int prefix = 0, best = 0;
        for (int i = 0; i < bits.length; i++) {
            prefix += (bits[i] == 1) ? 1 : -1;
            Integer first = firstIndex.get(prefix);
            if (first == null) {
                firstIndex.put(prefix, i);          // keep only the EARLIEST occurrence
            } else {
                best = Math.max(best, i - first);
            }
        }
        return best;
    }

    public static void main(String[] args) {
        System.out.println(countSumEqualsK(new int[] {1, 2, 1, 2, 1}, 3));
        System.out.println(countSumEqualsK(new int[] {1, -1, 0}, 0));
        System.out.println(countDivisibleByK(new int[] {4, 5, 0, -2, -3, 1}, 5));
        System.out.println(longestEqualZerosOnes(new int[] {0, 1, 0, 0, 1, 1, 0}));
    }
    // Output: 4
    //         3
    //         7
    //         6
}`,
    },
  ],

  complexity: {
    time: "O(n) build, O(1) per query",
    space: "O(n) extra, or O(nm) in 2D",
    derivation: [
      "<p>The build is a single pass performing one addition per element, so it is exactly " +
      "<code>n</code> additions:</p>",
      "<span class=\"eq\">T<sub>build</sub>(n) = &Theta;(n),&nbsp;&nbsp; T<sub>query</sub> = &Theta;(1),&nbsp;&nbsp; T<sub>total</sub>(n, q) = &Theta;(n + q)</span>",
      "<p>Compare with the naive approach, which is <code>&Theta;(nq)</code>. At " +
      "<code>n = q = 10&#8309;</code> that is <code>10&sup1;&#8304;</code> against " +
      "<code>2&times;10&#8309;</code> &mdash; five thousand times fewer operations, and the " +
      "difference between a timeout and a 30&nbsp;ms run.</p>",
      "<p>The break-even point is worth knowing: precomputation pays off as soon as " +
      "<code>q &gt; 1</code> in the amortised sense, since building costs <code>n</code> and a " +
      "single naive query costs at most <code>n</code>. In 2D the build is " +
      "<code>&Theta;(nm)</code> and each rectangle query is four reads, so <code>q</code> queries " +
      "cost <code>&Theta;(nm + q)</code> against a naive <code>&Theta;(q &middot; nm)</code>.</p>",
      "<p>For the hash-map variants, each element does <code>O(1)</code> expected map work, giving " +
      "<code>&Theta;(n)</code> expected overall. Using an <code>int[]</code> indexed by remainder " +
      "(as in <code>countDivisibleByK</code>) makes it worst-case <code>&Theta;(n + k)</code> with " +
      "no hashing at all, which is both faster and immune to hash attacks.</p>",
    ],
    compare: [
      ["Naive per query", "<code>O(nq)</code>", "<code>O(1)</code>", "Only when q is 1 or 2"],
      ["Prefix sums", "<code>O(n + q)</code>", "<code>O(n)</code>", "Static array, invertible op"],
      ["Difference array", "<code>O(n + q)</code>", "<code>O(n)</code>", "Range updates, read once at the end"],
      ["<a href=\"../06-range-queries/fenwick-tree.html\">Fenwick tree</a>", "<code>O((n + q) log n)</code>", "<code>O(n)</code>", "Point updates interleaved with queries"],
      ["<a href=\"../06-range-queries/segment-tree.html\">Segment tree</a>", "<code>O((n + q) log n)</code>", "<code>O(n)</code>", "Range updates interleaved with range queries"],
      ["<a href=\"../06-range-queries/sparse-table-and-rmq.html\">Sparse table</a>", "<code>O(n log n + q)</code>", "<code>O(n log n)</code>", "Non-invertible idempotent ops: min, max, gcd"],
    ],
  },

  pitfalls: [
    { title: "Off-by-one in the query formula",
      bug: "Writing <code>P[r] - P[l]</code> instead of <code>P[r+1] - P[l]</code>, which silently " +
        "drops <code>a[r]</code> from every answer. With <code>P[0] = a[0]</code> instead of " +
        "<code>0</code>, you also need a branch for <code>l == 0</code>.",
      fix: "Always use the <code>n + 1</code> array with <code>P[0] = 0</code> and the formula " +
        "<code>P[r+1] - P[l]</code>. Verify once on a single-element range: " +
        "<code>sum(3,3)</code> must equal <code>a[3]</code>." },
    { title: "<code>int</code> overflow in the accumulator",
      bug: "<code>int[] p</code> with <code>n = 10&#8309;</code> and values up to " +
        "<code>10&#8313;</code>. The true prefix reaches <code>10&sup1;&#8308;</code>, wraps, and " +
        "the <em>differences</em> can still look plausible, which makes it hard to spot.",
      fix: "Use <code>long[]</code> for the prefix array unconditionally. The memory cost at " +
        "<code>n = 10&#8310;</code> is 8&nbsp;MB, which is almost always acceptable." },
    { title: "Forgetting to seed the map with <code>{0: 1}</code>",
      bug: "<code>countSumEqualsK([3], 3)</code> returns 0 instead of 1, because the subarray " +
        "starting at index 0 needs a prefix value of 0 to already be in the map.",
      fix: "Insert <code>(0, 1)</code> before the loop for counting problems, or " +
        "<code>(0, -1)</code> for longest-subarray problems where you store first indices." },
    { title: "Storing the latest index instead of the earliest",
      bug: "In \"longest subarray with sum <code>k</code>\", overwriting the map entry each time a " +
        "prefix recurs. That yields the <em>shortest</em> such subarray, not the longest.",
      fix: "Only insert when the key is absent: <code>if (!map.containsKey(p)) map.put(p, i);</code>. " +
        "For <em>counting</em> problems you do want to accumulate every occurrence &mdash; the two " +
        "problems need opposite handling, which is a frequent source of confusion." },
    { title: "Applying prefix sums to a non-invertible operation",
      bug: "Building a \"prefix minimum\" array and trying <code>min(l, r) = something(P[r+1], P[l])</code>. " +
        "There is no such function: minimum cannot be undone.",
      fix: "Use a <a href=\"../06-range-queries/sparse-table-and-rmq.html\">sparse table</a> for " +
        "idempotent operations (min, max, gcd, AND, OR) or a segment tree for the general case. " +
        "Only sum, XOR, and products in a field support the prefix trick." },
    { title: "Difference array without the extra slot",
      bug: "<code>d[r + 1] -= v</code> throws <code>ArrayIndexOutOfBoundsException</code> when " +
        "<code>r == n - 1</code>, so people add a guard &mdash; and then forget it in the second " +
        "call site.",
      fix: "Allocate <code>new long[n + 1]</code> and ignore the last slot when reading. The " +
        "branch disappears entirely." },
    { title: "Java's <code>%</code> returning a negative remainder",
      bug: "In <code>countDivisibleByK</code>, <code>prefix % k</code> can be negative for " +
        "negative sums, so <code>cnt[rem]</code> throws or indexes the wrong bucket.",
      fix: "<code>((x % k) + k) % k</code> or <code>Math.floorMod(x, k)</code>. This applies " +
        "anywhere you index an array by a remainder." },
  ],

  variants: [
    ["Prefix XOR",
      "XOR is its own inverse, so <code>xor(l, r) = X[r+1] ^ X[l]</code>. Combine with a binary " +
      "trie to maximise a subarray XOR in <code>O(n log maxA)</code>.",
      "X[i+1] = X[i] ^ a[i];   xor(l,r) = X[r+1] ^ X[l]",
      "<a href=\"../05-trees/xor-trie.html\">XOR Trie</a>"],
    ["Prefix count of a predicate",
      "Store how many elements so far satisfy some property; the count in a range is again a " +
      "difference. Handles \"how many vowels / primes / values &gt; x in [l, r]\".",
      "C[i+1] = C[i] + (pred(a[i]) ? 1 : 0)",
      "<a href=\"../13-greedy-and-offline/coordinate-compression.html\">Offline queries</a>"],
    ["Prefix sums modulo k",
      "Two prefixes with the same remainder bound a subarray divisible by <code>k</code>. Use an " +
      "<code>int[k]</code> of counts rather than a hash map.",
      "rem = floorMod(rem + a[i], k); total += cnt[rem]++;",
      "LC 974, LC 523"],
    ["2D difference array",
      "Range updates on a submatrix in <code>O(1)</code> using four corner deltas, then two prefix " +
      "passes to materialise.",
      "d[r1][c1] += v; d[r1][c2+1] -= v; d[r2+1][c1] -= v; d[r2+1][c2+1] += v;",
      "LC 2536"],
    ["Prefix sums over sorted values",
      "Sort first, then prefix. Answers \"sum of the k smallest\" and \"cost to make all elements " +
      "equal to <code>x</code>\" in <code>O(log n)</code> per query.",
      "sort(a); P[i+1] = P[i] + a[i];  cost(x) = x*i - P[i] + (P[n]-P[i]) - x*(n-i)",
      "<a href=\"binary-search-on-answer.html\">Binary Search on Answer</a>"],
    ["Prefix products with modular inverse",
      "Works only when every element is invertible modulo a prime, since you need division. " +
      "Handles \"product of a range mod p\".",
      "prod(l,r) = P[r+1] * modInverse(P[l], MOD) % MOD",
      "<a href=\"../11-math-and-number-theory/modular-arithmetic.html\">Modular Arithmetic</a>"],
  ],

  followups: [
    ["What changes if the array can be updated between queries?",
      "<p>Prefix sums break, because a single point update invalidates <code>O(n)</code> prefix " +
      "entries. Switch to a <a href=\"../06-range-queries/fenwick-tree.html\">Fenwick tree</a> for " +
      "point update plus prefix query at <code>O(log n)</code> each, or a " +
      "<a href=\"../06-range-queries/segment-tree.html\">segment tree</a> if you also need range " +
      "updates. The trade is precise: prefix sums are <code>O(1)</code> query and " +
      "<code>O(n)</code> update; a BIT is <code>O(log n)</code> for both. If updates are rare, " +
      "rebuilding the prefix array is sometimes still the right call.</p>"],
    ["Why does the sliding-window approach fail for \"subarray sum equals k\" with negatives?",
      "<p>A sliding window relies on monotonicity: extending the window must move the sum in a " +
      "predictable direction so that you know whether to grow or shrink. With negative values, " +
      "extending can decrease the sum, so \"sum too large, shrink from the left\" is no longer " +
      "valid reasoning. The prefix-plus-hash-map approach makes no monotonicity assumption at all " +
      "&mdash; it just counts pairs &mdash; which is why it is the general answer. Reserve sliding " +
      "windows for non-negative arrays.</p>"],
    ["How do you find the longest subarray with sum exactly <code>k</code>?",
      "<p>Same prefix map, but store the <em>first</em> index at which each prefix value occurred " +
      "and never overwrite it. At index <code>i</code> with prefix <code>p</code>, look up " +
      "<code>p - k</code>; if present at index <code>j</code>, the candidate length is " +
      "<code>i - j</code>. Because <code>j</code> is the earliest occurrence, that candidate is " +
      "the longest one ending at <code>i</code>. Counting problems, by contrast, need every " +
      "occurrence, so they accumulate counts instead. Getting these two backwards is a classic " +
      "interview slip.</p>"],
    ["Can you do range minimum with prefix arrays?",
      "<p>No &mdash; minimum has no inverse, so there is no way to remove the contribution of the " +
      "left part. Use a <a href=\"../06-range-queries/sparse-table-and-rmq.html\">sparse " +
      "table</a>, which exploits the fact that min is <em>idempotent</em>: overlapping ranges may " +
      "be combined freely, so two lookups of the largest power-of-two blocks suffice. That gives " +
      "<code>O(n log n)</code> build and <code>O(1)</code> query on a static array. The general " +
      "rule: invertible &rarr; prefix sums; idempotent &rarr; sparse table; neither &rarr; " +
      "segment tree.</p>"],
    ["How would you handle 10&#8309; range-add updates and 10&#8309; range-sum queries interleaved?",
      "<p>Neither prefix sums nor a plain difference array works, because the two operation types " +
      "are interleaved. Use a <a href=\"../06-range-queries/segment-tree-lazy.html\">lazy " +
      "segment tree</a>, or the two-BIT trick: maintain Fenwick trees <code>B1</code> and " +
      "<code>B2</code> so that the prefix sum up to <code>i</code> equals " +
      "<code>sum(B1, i) &times; i - sum(B2, i)</code>. Both are <code>O(log n)</code> per " +
      "operation; the two-BIT version has a much smaller constant and is about twenty lines.</p>"],
    ["What is the 3D version?",
      "<p>The same alternating-sign inclusion-exclusion with <code>2&sup3; = 8</code> terms: add " +
      "the corners with an even number of \"low\" coordinates and subtract those with an odd " +
      "number. Build is <code>O(nmk)</code> and each box query is 8 reads. In general " +
      "<code>d</code> dimensions need <code>2<sup>d</sup></code> terms, which is why nobody goes " +
      "beyond three &mdash; and it is a good illustration of why " +
      "<a href=\"../11-math-and-number-theory/inclusion-exclusion.html\">inclusion-exclusion</a> " +
      "is worth knowing as a general principle.</p>"],
  ],

  problemsIntro: "The first four are the pure pattern; the rest are the transforms that make this " +
    "technique worth its weight. Do LC 560 and LC 525 before anything else &mdash; they are the " +
    "two shapes everything else is built from.",

  problems: [
    { name: "Running Sum of 1d Array", url: "https://leetcode.com/problems/running-sum-of-1d-array/",
      badge: "lc", tag: "LC 1480", level: "Easy", pattern: "The build step, nothing more" },
    { name: "Range Sum Query - Immutable", url: "https://leetcode.com/problems/range-sum-query-immutable/",
      badge: "lc", tag: "LC 303", level: "Easy", pattern: "The canonical static range-sum structure" },
    { name: "Range Sum Query 2D - Immutable", url: "https://leetcode.com/problems/range-sum-query-2d-immutable/",
      badge: "lc", tag: "LC 304", level: "Medium", pattern: "2D build and query with inclusion-exclusion" },
    { name: "Find Pivot Index", url: "https://leetcode.com/problems/find-pivot-index/",
      badge: "lc", tag: "LC 724", level: "Easy", pattern: "Left sum vs total minus left minus current" },
    { name: "Subarray Sum Equals K", url: "https://leetcode.com/problems/subarray-sum-equals-k/",
      badge: "lc", tag: "LC 560", level: "Medium", pattern: "The prefix + HashMap template. Handles negatives" },
    { name: "Contiguous Array", url: "https://leetcode.com/problems/contiguous-array/",
      badge: "lc", tag: "LC 525", level: "Medium", pattern: "Map 0 to -1, then longest subarray with sum 0" },
    { name: "Subarray Sums Divisible by K", url: "https://leetcode.com/problems/subarray-sums-divisible-by-k/",
      badge: "lc", tag: "LC 974", level: "Medium", pattern: "Prefix mod k with floorMod; int[k] beats a HashMap" },
    { name: "Continuous Subarray Sum", url: "https://leetcode.com/problems/continuous-subarray-sum/",
      badge: "lc", tag: "LC 523", level: "Medium", pattern: "Same remainder, plus a minimum-length constraint" },
    { name: "Product of Array Except Self", url: "https://leetcode.com/problems/product-of-array-except-self/",
      badge: "lc", tag: "LC 238", level: "Medium", pattern: "Prefix and suffix products; no division allowed" },
    { name: "Corporate Flight Bookings", url: "https://leetcode.com/problems/corporate-flight-bookings/",
      badge: "lc", tag: "LC 1109", level: "Medium", pattern: "The difference array, in its purest form" },
    { name: "Car Pooling", url: "https://leetcode.com/problems/car-pooling/",
      badge: "lc", tag: "LC 1094", level: "Medium", pattern: "Difference array over a small coordinate range" },
    { name: "Range Addition II / Increment Submatrices", url: "https://leetcode.com/problems/increment-submatrices-by-one/",
      badge: "lc", tag: "LC 2536", level: "Medium", pattern: "2D difference array with four corner deltas" },
    { name: "Maximum Size Subarray Sum Equals k", url: "https://leetcode.com/problems/maximum-size-subarray-sum-equals-k/",
      badge: "lc", tag: "LC 325", level: "Medium", pattern: "First-occurrence map, not a count map" },
    { name: "Static Range Sum Queries", url: "https://cses.fi/problemset/task/1646",
      badge: "cf", tag: "CSES", level: "Easy", pattern: "Clean implementation practice with fast IO" },
    { name: "Forest Queries", url: "https://cses.fi/problemset/task/1652",
      badge: "cf", tag: "CSES", level: "Easy", pattern: "2D prefix sums on a character grid" },
    { name: "Ilya and Queries", url: "https://codeforces.com/problemset/problem/313/B",
      badge: "cf", tag: "CF 313B", level: "Easy", pattern: "Prefix count of a predicate over adjacent pairs" },
  ],

  spoilers: [
    { summary: "Hint for LC 525 &mdash; the reformulation that makes it a prefix problem",
      body: "<p>\"Equal numbers of 0 and 1\" is not obviously a sum condition. Replace every " +
        "<code>0</code> with <code>-1</code>: now a balanced subarray is exactly one whose sum is " +
        "<code>0</code>, which means the prefix sum at both ends is <em>the same value</em>. So " +
        "store the first index at which each prefix value appears and take the largest " +
        "<code>i - firstIndex[p]</code>. Seed with <code>{0: -1}</code> so a balanced prefix " +
        "starting at index 0 is measured correctly. Transferable lesson: <em>when a condition " +
        "compares two counts, subtract them into a single running quantity &mdash; \"equal counts\" " +
        "becomes \"difference is zero\", which prefix sums handle directly.</em></p>" },
    { summary: "Hint for LC 974 &mdash; why counting pairs works and how to avoid the HashMap",
      body: "<p><code>sum(l, r) &equiv; 0 (mod k)</code> is equivalent to " +
        "<code>P[r+1] &equiv; P[l] (mod k)</code>, so you need the number of <em>pairs</em> of " +
        "prefix indices sharing a remainder. If remainder <code>x</code> occurs " +
        "<code>c<sub>x</sub></code> times, it contributes <code>C(c<sub>x</sub>, 2)</code> pairs, " +
        "or equivalently you can accumulate <code>cnt[rem]++</code> as you go. Use " +
        "<code>int[k]</code> rather than a <code>HashMap</code>: remainders are bounded by " +
        "<code>k</code>, so array indexing is both faster and hash-attack-proof. Watch " +
        "<code>Math.floorMod</code> for negative values. General lesson: <em>whenever the key " +
        "space is a small bounded integer range, replace the hash map with a plain array.</em></p>" },
  ],

  recap: {
    bullets: [
      "<strong><code>P[0] = 0</code> and <code>sum(l, r) = P[r+1] - P[l]</code>.</strong> The " +
        "sentinel removes every boundary case; use <code>long[]</code> always.",
      "<strong>A subarray is a difference of two prefixes.</strong> Rewrite subarray conditions as " +
        "conditions on pairs of prefix values, then hash, sort, or binary search the pairs.",
      "<strong>Difference arrays are the mirror image:</strong> <code>O(1)</code> range updates, " +
        "one <code>O(n)</code> pass at the end. Allocate <code>n + 1</code> slots.",
      "<strong>2D needs inclusion-exclusion</strong> in both build and query, with a zero border to " +
        "remove all boundary checks.",
      "<strong>Only invertible operations qualify.</strong> Sum and XOR yes; min, max, gcd, AND and " +
        "OR need a sparse table or segment tree.",
    ],
    oneliner: "P[0]=0; P[i]=P[i-1]+a[i-1]; sum(l,r)=P[r+1]-P[l] | diff: d[l]+=v, d[r+1]-=v | count k: map{0:1}, need=P-k",
  },
},

/* ================================================ 2. two-pointers ======= */
{
  id: "two-pointers",
  difficulty: "Easy",
  readTime: "24 min",
  tagline: "Two indices moving under a monotonicity guarantee turn a quadratic double loop into a " +
    "single linear pass &mdash; provided you can prove that neither pointer ever needs to go back.",
  tags: ["two pointers", "sorted", "linear", "P0"],
  prereqs: [["Complexity Analysis", "../00-foundations/complexity-analysis.html"],
            ["Prefix Sums", "prefix-sums.html"]],

  why: {
    paras: [
      "An enormous number of array problems have an obvious <code>O(n&sup2;)</code> solution built " +
      "from two nested loops over indices <code>i &lt; j</code>. Two pointers is the observation " +
      "that, when the data has the right monotonic structure, you never need to revisit a " +
      "position: each pointer advances only forward, so the total work is " +
      "<code>O(n)</code> rather than <code>O(n&sup2;)</code>.",
      "The technique comes in three distinct shapes that people often conflate. " +
      "<strong>Opposite ends:</strong> <code>l</code> starts at 0, <code>r</code> at " +
      "<code>n-1</code>, and they converge &mdash; used for pair sums on sorted arrays, container " +
      "with most water, and palindromes. <strong>Same direction:</strong> both start at 0 and " +
      "<code>r</code> outruns <code>l</code> &mdash; that is the " +
      "<a href=\"sliding-window.html\">sliding window</a>, plus in-place partitioning and merging. " +
      "<strong>Fast and slow:</strong> one pointer moves twice as fast &mdash; cycle detection and " +
      "finding the middle of a list.",
      "What makes it an interview favourite is that the correctness argument is short but not " +
      "trivial. \"Why is it safe to move <code>l</code> here?\" has a real answer &mdash; usually " +
      "an exchange argument showing that every pair you skip is dominated by one you keep &mdash; " +
      "and being able to give that answer separates people who memorised the pattern from people " +
      "who understand it.",
    ],
    insight: "The pattern is valid only when moving a pointer <em>provably</em> discards no " +
      "candidate answer. Before writing the loop, state which pointer moves and why every " +
      "solution containing the discarded element is dominated by one that remains.",
  },

  recognise: {
    yes: [
      "The array is <strong>sorted</strong>, or sorting it does not destroy the question",
      "\"Find a pair / triplet with sum equal to (or closest to) a target\"",
      "\"Longest or shortest contiguous segment satisfying &hellip;\" with non-negative values " +
        "&rarr; the same-direction form",
      "In-place rearrangement: remove duplicates, move zeroes, partition by a predicate, reverse",
      "Merging two sorted sequences, or intersecting two sorted sets",
      "A linked list question about cycles, the middle node, or the <code>k</code>-th from the end",
    ],
    no: [
      "The array is unsorted <em>and</em> order matters &rarr; hashing or prefix sums instead",
      "You need arbitrary index pairs with no monotonic relationship &rarr; there is nothing to " +
        "exploit; consider sorting by a different key first",
      "Values can be negative in a \"longest subarray with sum &ge; k\" question &rarr; " +
        "monotonicity is lost, so use a " +
        "<a href=\"../03-linear-structures/queues-and-monotonic-deque.html\">monotonic deque</a> " +
        "over prefix sums",
      "You need to <em>count</em> subarrays with an exact sum including negatives &rarr; " +
        "<a href=\"prefix-sums.html\">prefix + HashMap</a>",
    ],
    table: [
      ["\"two numbers in a sorted array summing to target\"", "Sum is monotone in both pointers", "Opposite ends, converge"],
      ["\"three numbers summing to zero\"", "Fix one, two-pointer the rest", "Sort, then <code>O(n&sup2;)</code>"],
      ["\"container with most water\"", "Moving the taller wall can never help", "Opposite ends, move the shorter"],
      ["\"is this a palindrome\"", "Compare mirrored positions", "Opposite ends, step inward"],
      ["\"remove duplicates in place\"", "A write pointer trailing a read pointer", "Same direction"],
      ["\"merge two sorted arrays\"", "One pointer per input", "Same direction, two arrays"],
      ["\"longest substring without repeats\"", "Window validity is monotone", "<a href=\"sliding-window.html\">Sliding window</a>"],
      ["\"detect a cycle in a linked list\"", "Fast laps slow inside a cycle", "Floyd's fast/slow"],
      ["<strong>Confused with:</strong> \"subarray sum equals k\" with negatives",
        "Extending can decrease the sum, so shrinking logic is unsound", "Prefix + HashMap, not two pointers"],
    ],
    constraint: "<code>n &le; 10&#8309;</code> with a pair or triplet question is the signature: " +
      "<code>O(n&sup2;)</code> is dead, sorting is affordable, so the intended solution is sort " +
      "plus two pointers at <code>O(n log n)</code> (or <code>O(n&sup2;)</code> for triplets with " +
      "<code>n &le; 3000</code>).",
  },

  core: {
    heading: "Core idea and the exchange argument",
    paras: [
      "Take the canonical case: a sorted array and a target sum. Put <code>l</code> at 0 and " +
      "<code>r</code> at <code>n - 1</code>. If <code>a[l] + a[r] &lt; target</code>, then " +
      "<code>a[l]</code> paired with <em>anything</em> at or below <code>r</code> is also too " +
      "small &mdash; because <code>a[r]</code> is the largest remaining partner. So no valid pair " +
      "uses <code>a[l]</code> at all, and <code>l++</code> discards nothing. The symmetric " +
      "argument justifies <code>r--</code>. Each step removes one index permanently, so the loop " +
      "runs at most <code>n</code> times.",
      "That is the shape of every correctness proof in this family: <em>the pointer you move is " +
      "the one whose current element cannot participate in any better answer</em>. For container " +
      "with most water, the area is <code>min(h[l], h[r]) &times; (r - l)</code>; moving the taller " +
      "wall inward keeps the same limiting height while strictly reducing the width, so it can " +
      "never improve &mdash; therefore move the shorter wall. State that sentence out loud in an " +
      "interview and the problem is finished.",
      "The same-direction form has a different justification. There, <code>r</code> extends the " +
      "window and <code>l</code> repairs it. The invariant is \"the window " +
      "<code>[l, r]</code> is valid\", and because <code>l</code> only ever increases, the total " +
      "number of pointer movements across the whole run is at most <code>2n</code> even though " +
      "the inner <code>while</code> loop looks nested. That is an amortised argument, not a " +
      "per-iteration one, and being able to say so is the standard follow-up answer.",
    ],
    invariantTitle: "The invariant",
    invariant: "<p><strong>Opposite ends:</strong> every pair <code>(i, j)</code> with " +
      "<code>i &lt; l</code> or <code>j &gt; r</code> has already been considered or provably " +
      "cannot be optimal. The answer, if it exists, lies within <code>[l, r]</code>.</p>" +
      "<p><strong>Same direction:</strong> the segment <code>[l, r]</code> satisfies the " +
      "problem's validity predicate at the top of every iteration, and <code>l</code> is the " +
      "smallest left endpoint for which that is true given the current <code>r</code>.</p>",
    extra: [
      { kind: "tip", title: "The amortisation argument, stated properly",
        html: "<p>Same-direction two pointers have a <code>while</code> inside a " +
          "<code>for</code>, which looks quadratic. It is not: <code>l</code> only increases and " +
          "is bounded by <code>n</code>, so the inner loop executes at most <code>n</code> times " +
          "<em>in total across the whole run</em>. Combined with <code>n</code> outer iterations " +
          "that is at most <code>2n</code> pointer movements, hence <code>O(n)</code>. Say " +
          "\"amortised\" when asked; it is exactly the same accounting as " +
          "<a href=\"../00-foundations/complexity-analysis.html\">dynamic array growth</a>.</p>" },
      { kind: "warn", title: "Sorting destroys indices",
        html: "<p>If the problem asks for the <em>positions</em> of the two numbers (LeetCode " +
          "1 Two Sum) rather than the values, sorting loses them. Either pair each value with its " +
          "original index before sorting, or abandon two pointers and use a " +
          "<code>HashMap</code>, which is <code>O(n)</code> and needs no sort. Check what the " +
          "problem wants returned before you reach for the sort.</p>" },
      { kind: "math", title: "Three pointers and beyond",
        html: "<p><code>k</code>-sum generalises: sort once, fix <code>k - 2</code> indices with " +
          "nested loops, and two-pointer the innermost pair. That gives " +
          "<code>O(n<sup>k-1</sup>)</code> &mdash; <code>O(n&sup2;)</code> for 3-sum and " +
          "<code>O(n&sup3;)</code> for 4-sum. Beyond <code>k = 4</code>, " +
          "<a href=\"../04-recursion-and-dnc/meet-in-the-middle.html\">meet in the middle</a> " +
          "becomes better. The duplicate-skipping logic is the same at every level and is where " +
          "almost all the bugs are.</p>" },
    ],
  },

  visuals: [
    {
      kind: "array", vizId: "tpPair",
      h3: "Opposite ends: finding a pair with a target sum",
      intro: "Sorted array <code>[1, 3, 4, 6, 8, 11]</code>, target <code>14</code>. Each " +
        "comparison eliminates one whole index, which is why the scan is linear rather than " +
        "quadratic.",
      caption: "Every step discards an index permanently. Six elements, at most six iterations, " +
        "and the discarded pairs are provably non-solutions rather than merely unchecked.",
      data: {
        label: "sorted a, target = 14",
        array: [1, 3, 4, 6, 8, 11],
        vars: ["l", "r", "a[l]+a[r]", "vs target"],
        speed: 1000,
        frames: [
          { note: "l = 0, r = 5. Sum is 1 + 11 = 12, which is below 14.",
            active: [0, 5], window: [0, 5], values: { l: 0, r: 5, "a[l]+a[r]": 12, "vs target": "too small" } },
          { note: "Too small, so move l. Justification: 11 is the largest available partner, so if 1 + 11 < 14, then 1 pairs with nothing. Index 0 is eliminated for good.",
            x: [0], active: [5], window: [1, 5], values: { l: 1, r: 5, "a[l]+a[r]": "3+11=14", "vs target": "check" } },
          { note: "l = 1, r = 5. Sum is 3 + 11 = 14. Found it.",
            best: [1, 5], window: [1, 5], values: { l: 1, r: 5, "a[l]+a[r]": 14, "vs target": "match" } },
          { note: "Now try target = 9 on the same array to see the other branch. Restart: 1 + 11 = 12, too large this time.",
            arr: [1, 3, 4, 6, 8, 11], active: [0, 5], window: [0, 5],
            values: { l: 0, r: 5, "a[l]+a[r]": 12, "vs target": "too large (target 9)" } },
          { note: "Too large, so move r. Justification: 1 is the smallest available partner, so if 1 + 11 > 9, then 11 pairs with nothing. Index 5 is eliminated.",
            x: [5], active: [0], window: [0, 4], values: { l: 0, r: 4, "a[l]+a[r]": "1+8=9", "vs target": "check" } },
          { note: "1 + 8 = 9. Found. Two comparisons instead of fifteen pair checks \u2014 and the saving grows quadratically with n.",
            best: [0, 4], x: [5], window: [0, 4], values: { l: 0, r: 4, "a[l]+a[r]": 9, "vs target": "match" } },
          { note: "If the pointers cross without a match, no pair exists: every index was eliminated by a valid argument, so the search was exhaustive.",
            done: [0,1,2,3,4,5], values: { l: "l > r", r: "\u2014", "a[l]+a[r]": "\u2014", "vs target": "no pair" } },
        ],
      },
    },
    {
      kind: "array", vizId: "tpWater",
      h3: "Container with most water: the exchange argument",
      intro: "Heights <code>[1, 8, 6, 2, 5, 4, 8, 3, 7]</code>. The area is " +
        "<code>min(h[l], h[r]) &times; (r - l)</code>. The rule is always to move the shorter wall, " +
        "and the reason is the whole problem.",
      caption: "Moving the taller wall keeps the limiting height at best unchanged while strictly " +
        "reducing the width, so it can never improve the area. Moving the shorter wall is the only " +
        "move that can.",
      data: {
        label: "heights",
        array: [1, 8, 6, 2, 5, 4, 8, 3, 7],
        vars: ["l", "r", "area", "best"],
        speed: 1050,
        frames: [
          { note: "l = 0 (height 1), r = 8 (height 7). Area = min(1,7) * 8 = 8.",
            active: [0, 8], window: [0, 8], values: { l: 0, r: 8, area: 8, best: 8 } },
          { note: "The left wall is shorter, so move l. Any container using height 1 has area at most 1 * width, and the width only shrinks from here.",
            x: [0], active: [1, 8], window: [1, 8], values: { l: 1, r: 8, area: "min(8,7)*7=49", best: 49 } },
          { note: "l = 1 (height 8), r = 8 (height 7). Area = 7 * 7 = 49. New best, and in fact the answer.",
            best: [1, 8], window: [1, 8], values: { l: 1, r: 8, area: 49, best: 49 } },
          { note: "Now the right wall is shorter, so move r. Index 8 is eliminated.",
            x: [0, 8], active: [1, 7], window: [1, 7], values: { l: 1, r: 7, area: "min(8,3)*6=18", best: 49 } },
          { note: "Area 18, worse. Right is shorter again, so move r again.",
            x: [0, 7, 8], active: [1, 6], window: [1, 6], values: { l: 1, r: 6, area: "min(8,8)*5=40", best: 49 } },
          { note: "Area 40. Heights are equal, so either move is safe \u2014 both walls are simultaneously limiting.",
            x: [0, 7, 8], active: [1, 6], window: [1, 6], values: { l: 1, r: 6, area: 40, best: 49 } },
          { note: "The pointers continue inward, never beating 49. Total work is one pass, and the argument for each move is a one-line exchange argument.",
            best: [1, 8], x: [0, 7], done: [2,3,4,5,6], values: { l: "\u2014", r: "\u2014", area: "\u2014", best: 49 } },
        ],
      },
    },
    {
      kind: "mermaid", vizId: "tpPick",
      h3: "Which of the three forms do you need?",
      caption: "The three shapes solve different problems and have different correctness " +
        "arguments. Identifying the shape first prevents most of the bugs in this family.",
      src: `flowchart TD
  start(["array or list problem"]) --> kind{"what is being asked?"}
  kind -- "pair or triplet with a target" --> sorted{"is it sorted, or can you sort?"}
  sorted -- yes --> opp["opposite ends: converge from both sides"]
  sorted -- "no, need original indices" --> hashm["HashMap in one pass instead"]
  kind -- "longest or shortest segment" --> neg{"any negative values?"}
  neg -- no --> win["same direction: sliding window"]
  neg -- yes --> pfx["prefix sums plus a monotonic deque"]
  kind -- "rearrange in place" --> rw["same direction: read pointer and write pointer"]
  kind -- "merge or intersect sorted inputs" --> mrg["same direction, one pointer per input"]
  kind -- "linked list cycle, middle, or kth from end" --> fs["fast and slow pointers"]
  opp --> proof["state the exchange argument before coding"]
  win --> proof
  rw --> proof`,
      wide: true,
    },
  ],

  steps: [
    "<strong>Identify the shape</strong>: opposite ends, same direction, or fast/slow.",
    "<strong>Sort if needed</strong>, and first check whether the problem wants original indices " +
      "&mdash; if it does, sorting is wrong.",
    "<strong>Initialise</strong>: <code>l = 0, r = n - 1</code> for opposite ends; " +
      "<code>l = r = 0</code> for same direction.",
    "<strong>Write down the exchange argument</strong> for which pointer moves. If you cannot, the " +
      "technique may not apply.",
    "<strong>Loop while <code>l &lt; r</code></strong> (opposite ends) or while " +
      "<code>r &lt; n</code> (same direction).",
    "<strong>Update the answer</strong> before moving pointers, so no candidate is skipped.",
    "<strong>Handle duplicates explicitly</strong> in <code>k</code>-sum problems: after recording " +
      "a hit, advance past all equal values on both sides.",
    "<strong>Verify the termination condition:</strong> every iteration must move at least one " +
      "pointer, or the loop hangs.",
  ],

  dryRun: {
    intro: "3Sum on <code>[-4, -1, -1, 0, 1, 2]</code> (already sorted), looking for triplets " +
      "summing to zero. The outer loop fixes <code>i</code>; the inner pointers scan the suffix.",
    cols: ["i", "a[i]", "l", "r", "sum", "action"],
    rows: [
      { cells: ["0", "-4", "1", "5", "-4 + -1 + 2 = -3", "sum &lt; 0, so <code>l++</code>"],
        action: "Too small: need a larger left element." },
      { cells: ["0", "-4", "2", "5", "-4 + -1 + 2 = -3", "sum &lt; 0, so <code>l++</code>"],
        action: "Duplicate <code>-1</code>; still too small." },
      { cells: ["0", "-4", "3", "5", "-4 + 0 + 2 = -2", "sum &lt; 0, so <code>l++</code>"],
        action: "Still short." },
      { cells: ["0", "-4", "4", "5", "-4 + 1 + 2 = -1", "sum &lt; 0, so <code>l++</code>"],
        action: "Pointers meet; no triplet uses <code>-4</code>." },
      { cells: ["1", "-1", "2", "5", "-1 + -1 + 2 = 0", "<strong>record</strong> [-1,-1,2]"],
        action: "Hit. Now skip duplicates on both sides before continuing.", change: true },
      { cells: ["1", "-1", "3", "4", "-1 + 0 + 1 = 0", "<strong>record</strong> [-1,0,1]"],
        action: "Second hit from the same <code>i</code>.", change: true },
      { cells: ["1", "-1", "4", "3", "&mdash;", "<code>l &ge; r</code>, stop inner loop"],
        action: "Suffix exhausted." },
      { cells: ["2", "-1", "&mdash;", "&mdash;", "&mdash;", "skip: <code>a[2] == a[1]</code>"],
        action: "Outer duplicate skip. Without this you emit [-1,0,1] twice.", change: true },
      { cells: ["3", "0", "4", "5", "0 + 1 + 2 = 3", "sum &gt; 0, so <code>r--</code>"],
        action: "Too large; and then <code>l &ge; r</code>, so we are done." },
    ],
    after: "<p>Result: <code>[[-1,-1,2], [-1,0,1]]</code>. Note the three separate duplicate " +
      "guards &mdash; one on <code>i</code>, one after advancing <code>l</code>, one after " +
      "retreating <code>r</code>. Missing any of them produces duplicate triplets, which is the " +
      "most common failure on this problem.</p>",
  },

  code: [
    { tab: "Opposite ends", panel: "Opposite ends", file: "OppositeEnds.java",
      intro: "Three classics that share one skeleton. In each case the comment above the pointer " +
        "move is the exchange argument &mdash; that sentence is what an interviewer is listening for.",
      highlight: "12-18,34-40",
      code: `import java.util.Arrays;

public class OppositeEnds {

    /** Pair summing to target in a SORTED array. Returns indices, or null. O(n). */
    static int[] pairSum(int[] a, int target) {
        int l = 0, r = a.length - 1;
        while (l < r) {
            int sum = a[l] + a[r];
            if (sum == target) {
                return new int[] {l, r};
            }
            if (sum < target) {
                l++;      // a[r] is the largest partner left; if a[l]+a[r] is still
                          // too small, a[l] can pair with nothing. Discard it.
            } else {
                r--;      // symmetric: a[l] is the smallest partner left.
            }
        }
        return null;
    }

    /** Maximum water container. O(n). */
    static int maxArea(int[] h) {
        int l = 0, r = h.length - 1, best = 0;
        while (l < r) {
            best = Math.max(best, Math.min(h[l], h[r]) * (r - l));
            if (h[l] < h[r]) {
                l++;      // moving the TALLER wall keeps min() the same at best and
                          // strictly shrinks the width, so it can never improve.
            } else {
                r--;
            }
        }
        return best;
    }

    /** Palindrome check ignoring non-alphanumerics. O(n). */
    static boolean isPalindrome(String s) {
        int l = 0, r = s.length() - 1;
        while (l < r) {
            while (l < r && !Character.isLetterOrDigit(s.charAt(l))) {
                l++;
            }
            while (l < r && !Character.isLetterOrDigit(s.charAt(r))) {
                r--;
            }
            if (Character.toLowerCase(s.charAt(l)) != Character.toLowerCase(s.charAt(r))) {
                return false;
            }
            l++;
            r--;
        }
        return true;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(pairSum(new int[] {1, 3, 4, 6, 8, 11}, 14)));
        System.out.println(maxArea(new int[] {1, 8, 6, 2, 5, 4, 8, 3, 7}));
        System.out.println(isPalindrome("A man, a plan, a canal: Panama"));
        System.out.println(isPalindrome("race a car"));
    }
    // Output: [1, 5]
    //         49
    //         true
    //         false
}`,
    },
    { tab: "3Sum with dedup", panel: "3Sum", file: "ThreeSum.java",
      intro: "The duplicate handling is the entire difficulty. There are three separate guards and " +
        "each one is needed; removing any of them produces repeated triplets.",
      highlight: "14-16,25-30",
      code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class ThreeSum {

    /** All unique triplets summing to zero. O(n^2) after an O(n log n) sort. */
    static List<List<Integer>> threeSum(int[] a) {
        Arrays.sort(a);
        List<List<Integer>> out = new ArrayList<>();
        int n = a.length;
        for (int i = 0; i < n - 2; i++) {
            if (a[i] > 0) {
                break;                          // sorted: no way to reach 0 from here
            }
            if (i > 0 && a[i] == a[i - 1]) {
                continue;                       // guard 1: skip duplicate anchors
            }
            int l = i + 1, r = n - 1;
            while (l < r) {
                int sum = a[i] + a[l] + a[r];
                if (sum == 0) {
                    out.add(Arrays.asList(a[i], a[l], a[r]));
                    int vl = a[l], vr = a[r];
                    while (l < r && a[l] == vl) {
                        l++;                    // guard 2: skip duplicate left values
                    }
                    while (l < r && a[r] == vr) {
                        r--;                    // guard 3: skip duplicate right values
                    }
                } else if (sum < 0) {
                    l++;
                } else {
                    r--;
                }
            }
        }
        return out;
    }

    public static void main(String[] args) {
        System.out.println(threeSum(new int[] {-1, 0, 1, 2, -1, -4}));
        System.out.println(threeSum(new int[] {0, 0, 0, 0}));
        System.out.println(threeSum(new int[] {1, 2, 3}));
    }
    // Output: [[-1, -1, 2], [-1, 0, 1]]
    //         [[0, 0, 0]]
    //         []
}`,
    },
    { tab: "Same direction", panel: "Same direction", file: "SameDirection.java",
      intro: "A read pointer scans and a write pointer compacts. This shape is the answer to every " +
        "\"do it in place with <code>O(1)</code> extra space\" instruction.",
      highlight: "10-16,29-35",
      code: `import java.util.Arrays;

public class SameDirection {

    /** Remove duplicates from a sorted array in place. Returns the new length. O(n). */
    static int dedupeSorted(int[] a) {
        if (a.length == 0) {
            return 0;
        }
        int write = 1;                          // a[0..write-1] is the deduped prefix
        for (int read = 1; read < a.length; read++) {
            if (a[read] != a[write - 1]) {
                a[write++] = a[read];
            }
        }
        return write;
    }

    /** Move all zeroes to the end, preserving the order of non-zeroes. O(n). */
    static void moveZeroes(int[] a) {
        int write = 0;
        for (int read = 0; read < a.length; read++) {
            if (a[read] != 0) {
                int t = a[write];
                a[write++] = a[read];
                a[read] = t;
            }
        }
    }

    /** Merge two sorted arrays into a new one. O(n + m). */
    static int[] merge(int[] a, int[] b) {
        int[] out = new int[a.length + b.length];
        int i = 0, j = 0, k = 0;
        while (i < a.length && j < b.length) {
            out[k++] = (a[i] <= b[j]) ? a[i++] : b[j++];
        }
        while (i < a.length) {
            out[k++] = a[i++];
        }
        while (j < b.length) {
            out[k++] = b[j++];
        }
        return out;
    }

    /** Dutch national flag: partition into <p, ==p, >p in one pass. O(n). */
    static void threeWayPartition(int[] a, int pivot) {
        int lt = 0, i = 0, gt = a.length - 1;
        while (i <= gt) {
            if (a[i] < pivot) {
                swap(a, lt++, i++);
            } else if (a[i] > pivot) {
                swap(a, i, gt--);               // do NOT advance i: the swapped-in
                                                // value has not been examined yet
            } else {
                i++;
            }
        }
    }

    private static void swap(int[] a, int i, int j) {
        int t = a[i]; a[i] = a[j]; a[j] = t;
    }

    public static void main(String[] args) {
        int[] d = {1, 1, 2, 2, 2, 3, 4, 4};
        System.out.println(dedupeSorted(d) + " " + Arrays.toString(Arrays.copyOf(d, 4)));

        int[] z = {0, 1, 0, 3, 12};
        moveZeroes(z);
        System.out.println(Arrays.toString(z));

        System.out.println(Arrays.toString(merge(new int[] {1, 4, 7}, new int[] {2, 3, 9})));

        int[] p = {3, 1, 4, 1, 5, 9, 2, 6, 5};
        threeWayPartition(p, 4);
        System.out.println(Arrays.toString(p));
    }
    // Output: 4 [1, 2, 3, 4]
    //         [1, 3, 12, 0, 0]
    //         [1, 2, 3, 4, 7, 9]
    //         [3, 1, 1, 2, 4, 9, 5, 6, 5]
}`,
    },
    { tab: "Fast and slow", panel: "Fast slow", file: "FastSlow.java",
      intro: "Floyd's cycle detection plus the two list utilities it shares a skeleton with. The " +
        "second phase of Floyd's algorithm is the part worth being able to justify.",
      highlight: "23-33",
      code: `public class FastSlow {

    static class Node {
        int val;
        Node next;
        Node(int v) { val = v; }
    }

    /** Middle node (the second one when the length is even). O(n), O(1) space. */
    static Node middle(Node head) {
        Node slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        return slow;
    }

    /**
     * Floyd's cycle detection. Returns the node where the cycle starts, or null.
     * Phase 2 works because if the tail before the cycle has length m and the
     * meeting point is k steps into a cycle of length L, then m == (L - k) mod L,
     * so walking m steps from the head and m steps from the meeting point collide
     * exactly at the cycle entry.
     */
    static Node cycleStart(Node head) {
        Node slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) {                 // phase 1: they meet inside the cycle
                Node p = head;
                while (p != slow) {             // phase 2: walk both at the same speed
                    p = p.next;
                    slow = slow.next;
                }
                return p;
            }
        }
        return null;
    }

    /** k-th node from the end. One pass, O(1) space. */
    static Node kthFromEnd(Node head, int k) {
        Node lead = head;
        for (int i = 0; i < k; i++) {
            if (lead == null) {
                return null;
            }
            lead = lead.next;
        }
        Node trail = head;
        while (lead != null) {
            lead = lead.next;
            trail = trail.next;
        }
        return trail;
    }

    public static void main(String[] args) {
        Node a = new Node(1), b = new Node(2), c = new Node(3), d = new Node(4), e = new Node(5);
        a.next = b; b.next = c; c.next = d; d.next = e;
        System.out.println("middle = " + middle(a).val);
        System.out.println("2nd from end = " + kthFromEnd(a, 2).val);
        System.out.println("cycle = " + cycleStart(a));
        e.next = c;                              // create a cycle back to node 3
        System.out.println("cycle starts at " + cycleStart(a).val);
    }
    // Output: middle = 3
    //         2nd from end = 4
    //         cycle = null
    //         cycle starts at 3
}`,
    },
  ],

  complexity: {
    time: "O(n) after sorting; O(n log n) total",
    space: "O(1) auxiliary",
    derivation: [
      "<p>For opposite ends, each iteration strictly decreases <code>r - l</code> by at least one, " +
      "and the loop stops when <code>l &ge; r</code>, so there are at most <code>n</code> " +
      "iterations of <code>O(1)</code> work:</p>",
      "<span class=\"eq\">T(n) = &Theta;(n) after sorting, so &Theta;(n log n) overall when a sort is needed</span>",
      "<p>For same direction the argument is amortised. The outer pointer <code>r</code> advances " +
      "<code>n</code> times. The inner pointer <code>l</code> also advances at most <code>n</code> " +
      "times <em>in total</em>, because it never decreases and is bounded by <code>n</code>. Hence " +
      "the total number of pointer movements is at most <code>2n</code>, giving " +
      "<code>&Theta;(n)</code> despite the nested loops:</p>",
      "<span class=\"eq\">&Sigma;<sub>r</sub> (movements of l during step r) &le; n &nbsp;&rArr;&nbsp; T(n) = &Theta;(n)</span>",
      "<p>For <code>k</code>-sum, fixing <code>k - 2</code> indices with nested loops and " +
      "two-pointering the last pair gives <code>&Theta;(n<sup>k-1</sup>)</code>. Space is " +
      "<code>&Theta;(1)</code> auxiliary in every case, except that sorting an " +
      "<code>Integer[]</code> costs <code>&Theta;(n)</code> and recursion in a quicksort costs " +
      "<code>&Theta;(log n)</code> stack.</p>",
    ],
    compare: [
      ["Brute force pairs", "<code>O(n&sup2;)</code>", "<code>O(1)</code>", "Only when n &le; 5000"],
      ["Sort + two pointers", "<code>O(n log n)</code>", "<code>O(1)</code>", "Sorted input, or values-only output"],
      ["HashMap one pass", "<code>O(n)</code>", "<code>O(n)</code>", "When original indices are required"],
      ["3Sum brute force", "<code>O(n&sup3;)</code>", "<code>O(1)</code>", "Never, beyond n = 300"],
      ["3Sum sorted + two pointers", "<code>O(n&sup2;)</code>", "<code>O(1)</code>", "The standard answer, n &le; 3000"],
      ["Floyd's cycle detection", "<code>O(n)</code>", "<code>O(1)</code>", "Beats a HashSet, which is O(n) space"],
    ],
  },

  pitfalls: [
    { title: "Using two pointers on an unsorted array",
      bug: "Applying the converge-from-both-ends pair search without sorting. The monotonicity " +
        "argument is simply false, so the algorithm silently returns wrong answers on some inputs " +
        "and correct ones on others.",
      fix: "Sort first, or use a <code>HashMap</code>. Before writing the loop, say the exchange " +
        "argument out loud &mdash; if it does not hold, you have caught the bug before writing it." },
    { title: "Sorting when the problem wants original indices",
      bug: "LeetCode 1 asks for the indices of the two numbers. Sorting destroys them, so the " +
        "returned indices refer to the sorted array.",
      fix: "Either use a <code>HashMap&lt;value, index&gt;</code> in one pass (<code>O(n)</code>, " +
        "and simpler), or sort an array of <code>{value, originalIndex}</code> pairs." },
    { title: "Incomplete duplicate handling in <code>k</code>-sum",
      bug: "Skipping duplicates for the anchor <code>i</code> but not after a successful hit. " +
        "<code>[0,0,0,0]</code> then produces <code>[[0,0,0],[0,0,0]]</code>.",
      fix: "Three guards: skip <code>i</code> when <code>a[i] == a[i-1]</code>, and after " +
        "recording a triplet advance <code>l</code> past all equal values and retreat " +
        "<code>r</code> past all equal values." },
    { title: "Advancing the index after a swap in Dutch-flag partitioning",
      bug: "In three-way partitioning, doing <code>swap(a, i, gt--); i++;</code>. The value just " +
        "swapped in from the right has never been examined, so it can be misplaced.",
      fix: "Advance <code>i</code> only in the <code>&lt;</code> and <code>==</code> branches. " +
        "When swapping with <code>gt</code>, leave <code>i</code> where it is." },
    { title: "An iteration that moves neither pointer",
      bug: "A branch structure where some condition leads to <code>continue</code> without " +
        "changing <code>l</code> or <code>r</code>. The loop hangs, and on a judge that shows as a " +
        "timeout rather than an obvious infinite loop.",
      fix: "Audit every path through the loop body and confirm at least one pointer changes. " +
        "Making the pointer updates the last statements of each branch makes this easy to verify." },
    { title: "Reading past the end in fast/slow traversal",
      bug: "<code>while (fast.next != null && fast.next.next != null)</code> versus " +
        "<code>while (fast != null && fast.next != null)</code>. The wrong one throws " +
        "<code>NullPointerException</code> on an empty or single-node list, or returns the wrong " +
        "middle for even lengths.",
      fix: "Use <code>while (fast != null && fast.next != null)</code>, which is safe for all " +
        "lengths and returns the second middle for even lists. Test on lists of length 0, 1 and 2." },
    { title: "Applying a sliding window when values can be negative",
      bug: "\"Shortest subarray with sum at least <code>k</code>\" with negative values. Shrinking " +
        "from the left can <em>increase</em> the sum, so the window logic is unsound.",
      fix: "Use prefix sums plus a " +
        "<a href=\"../03-linear-structures/queues-and-monotonic-deque.html\">monotonic deque</a>, " +
        "which is <code>O(n)</code> and makes no monotonicity assumption about the values." },
  ],

  variants: [
    ["k-sum by recursion",
      "Sort once, then recursively fix an index and reduce <code>k</code> until <code>k = 2</code>, " +
      "where two pointers finish the job. One implementation covers 2Sum through 6Sum.",
      "kSum(a, target, k): if k == 2 -> twoPointer; else for each i: kSum(a[i+1..], target-a[i], k-1)",
      "LC 18 4Sum"],
    ["Two pointers on two different arrays",
      "One pointer per input, advancing whichever is behind. Handles merging, intersection, and " +
      "\"smallest difference between elements of two sorted arrays\".",
      "while (i < n && j < m) { if (a[i] < b[j]) i++; else if (a[i] > b[j]) j++; else { hit(); i++; j++; } }",
      "LC 349, LC 350"],
    ["Backward two pointers (merge in place)",
      "When merging into an array with spare capacity at the end, write from the back so nothing " +
      "is overwritten before it is read.",
      "int k = n + m - 1; while (j >= 0) a[k--] = (i >= 0 && a[i] > b[j]) ? a[i--] : b[j--];",
      "LC 88"],
    ["Fast/slow for numeric cycles",
      "Floyd's algorithm applies to any functional graph, not just linked lists &mdash; including " +
      "\"find the duplicate number\" where <code>i &rarr; a[i]</code> defines the edges.",
      "slow = a[slow]; fast = a[a[fast]];  // treat the array as a successor function",
      "LC 287"],
    ["Three pointers for partitioning",
      "The Dutch national flag: <code>lt</code>, <code>i</code> and <code>gt</code> maintain four " +
      "regions in one pass. Also the core of a robust quicksort with many equal keys.",
      "regions: [0,lt) < p, [lt,i) == p, [i,gt] unknown, (gt,n) > p",
      "<a href=\"kth-and-selection.html\">Quickselect</a>"],
  ],

  followups: [
    ["Prove that two pointers on a sorted array finds the pair if one exists.",
      "<p>Suppose a valid pair <code>(i*, j*)</code> with <code>i* &lt; j*</code> exists. The " +
      "pointers start outside it (<code>l &le; i*</code> and <code>r &ge; j*</code>) and each step " +
      "moves exactly one inward. Consider the first moment a pointer would move <em>past</em> one " +
      "of them &mdash; say <code>l = i*</code> and we are about to do <code>l++</code>. That only " +
      "happens when <code>a[i*] + a[r] &lt; target</code> with <code>r &ge; j*</code>, so " +
      "<code>a[r] &ge; a[j*]</code>, so <code>a[i*] + a[j*] &le; a[i*] + a[r] &lt; target</code> " +
      "&mdash; contradicting that <code>(i*, j*)</code> is valid. The symmetric argument covers " +
      "<code>r--</code>. Hence the pointers must meet at the pair.</p>"],
    ["Why is the same-direction form <code>O(n)</code> when it has nested loops?",
      "<p>Because the inner pointer never moves backwards. Across the entire execution, " +
      "<code>l</code> advances at most <code>n</code> times in total, no matter how the " +
      "advancement is distributed among outer iterations. So the total work is bounded by " +
      "<code>n</code> outer steps plus <code>n</code> inner steps, giving " +
      "<code>O(n)</code> amortised. This is the same accounting used for dynamic array growth: " +
      "the worst single iteration is <code>O(n)</code>, but the sum over all iterations is " +
      "<code>O(n)</code>.</p>"],
    ["When should you use a HashMap instead of two pointers?",
      "<p>Three situations. When the problem needs <strong>original indices</strong>, since " +
      "sorting destroys them. When the array is unsorted and <strong>sorting would be too " +
      "slow</strong> or would break a required ordering. And when the condition involves " +
      "<strong>exact equality on an unsorted quantity</strong>, such as counting subarrays with a " +
      "given sum in the presence of negatives &mdash; there is no monotonicity to exploit. " +
      "Roughly: two pointers buy <code>O(1)</code> space at the cost of needing order; hashing " +
      "buys order-independence at the cost of <code>O(n)</code> space.</p>"],
    ["How does Floyd's cycle detection find the <em>start</em> of the cycle?",
      "<p>Let the tail before the cycle have length <code>m</code> and the cycle have length " +
      "<code>L</code>. When slow has taken <code>m + k</code> steps, fast has taken " +
      "<code>2(m + k)</code>, and they meet, so the difference <code>m + k</code> is a multiple of " +
      "<code>L</code>. That means walking a further <code>m</code> steps from the meeting point " +
      "lands exactly on the cycle entry, because <code>m + k + m &equiv; m (mod L)</code> " +
      "positions into the cycle. So reset one pointer to the head, advance both one step at a " +
      "time, and they collide at the entry. Total <code>O(n)</code> time and " +
      "<code>O(1)</code> space, against <code>O(n)</code> space for the HashSet approach.</p>"],
    ["How would you extend this to 4Sum without <code>O(n&#8308;)</code>?",
      "<p>Sort, then two nested loops fix <code>i</code> and <code>j</code>, and two pointers " +
      "handle the remaining pair &mdash; <code>O(n&sup3;)</code>. An alternative is to enumerate " +
      "all <code>O(n&sup2;)</code> pairs, group them by sum in a hash map, and look for two " +
      "complementary pairs; that is <code>O(n&sup2;)</code> time and " +
      "<code>O(n&sup2;)</code> space, but deduplicating overlapping index sets is fiddly. For " +
      "large <code>k</code> with small <code>n</code>, " +
      "<a href=\"../04-recursion-and-dnc/meet-in-the-middle.html\">meet in the middle</a> is the " +
      "right generalisation.</p>"],
    ["What if the array is sorted but rotated?",
      "<p>Two pointers from the ends no longer works, because <code>a[l] + a[r]</code> is not " +
      "monotone across the rotation point. Either find the pivot with " +
      "<a href=\"binary-search-basics.html\">binary search</a> in <code>O(log n)</code> and then " +
      "run two pointers with modular index arithmetic, or fall back to a " +
      "<code>HashSet</code>. The general principle: two pointers need a <em>total order along the " +
      "traversal direction</em>, and a rotation breaks exactly that.</p>"],
  ],

  problemsIntro: "Grouped by shape. Do LC 167, LC 11 and LC 15 first &mdash; those three cover the " +
    "whole opposite-ends family, and everything else is a variation on them.",

  problems: [
    { name: "Two Sum II - Input Array Is Sorted", url: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/",
      badge: "lc", tag: "LC 167", level: "Medium", pattern: "The pure opposite-ends template" },
    { name: "Container With Most Water", url: "https://leetcode.com/problems/container-with-most-water/",
      badge: "lc", tag: "LC 11", level: "Medium", pattern: "The exchange argument is the whole problem" },
    { name: "3Sum", url: "https://leetcode.com/problems/3sum/",
      badge: "lc", tag: "LC 15", level: "Medium", pattern: "Sort, fix one, two-pointer the rest; three dedup guards" },
    { name: "3Sum Closest", url: "https://leetcode.com/problems/3sum-closest/",
      badge: "lc", tag: "LC 16", level: "Medium", pattern: "Same skeleton, track the minimum absolute difference" },
    { name: "4Sum", url: "https://leetcode.com/problems/4sum/",
      badge: "lc", tag: "LC 18", level: "Medium", pattern: "Two nested anchors; watch for long overflow in sums" },
    { name: "Valid Palindrome", url: "https://leetcode.com/problems/valid-palindrome/",
      badge: "lc", tag: "LC 125", level: "Easy", pattern: "Opposite ends with character filtering" },
    { name: "Trapping Rain Water", url: "https://leetcode.com/problems/trapping-rain-water/",
      badge: "lc", tag: "LC 42", level: "Hard", pattern: "Two pointers with running left/right maxima; O(1) space" },
    { name: "Remove Duplicates from Sorted Array", url: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/",
      badge: "lc", tag: "LC 26", level: "Easy", pattern: "Read pointer plus write pointer" },
    { name: "Move Zeroes", url: "https://leetcode.com/problems/move-zeroes/",
      badge: "lc", tag: "LC 283", level: "Easy", pattern: "Stable in-place partition" },
    { name: "Sort Colors", url: "https://leetcode.com/problems/sort-colors/",
      badge: "lc", tag: "LC 75", level: "Medium", pattern: "Dutch national flag; do not advance i on the gt swap" },
    { name: "Merge Sorted Array", url: "https://leetcode.com/problems/merge-sorted-array/",
      badge: "lc", tag: "LC 88", level: "Easy", pattern: "Merge backwards to avoid overwriting" },
    { name: "Linked List Cycle II", url: "https://leetcode.com/problems/linked-list-cycle-ii/",
      badge: "lc", tag: "LC 142", level: "Medium", pattern: "Floyd's two phases; be able to prove phase 2" },
    { name: "Find the Duplicate Number", url: "https://leetcode.com/problems/find-the-duplicate-number/",
      badge: "lc", tag: "LC 287", level: "Medium", pattern: "Floyd's on a functional graph defined by the array" },
    { name: "Squares of a Sorted Array", url: "https://leetcode.com/problems/squares-of-a-sorted-array/",
      badge: "lc", tag: "LC 977", level: "Easy", pattern: "Opposite ends writing backwards; O(n) beats sorting" },
    { name: "Boats to Save People", url: "https://leetcode.com/problems/boats-to-save-people/",
      badge: "lc", tag: "LC 881", level: "Medium", pattern: "Greedy pairing lightest with heaviest" },
    { name: "Books", url: "https://codeforces.com/problemset/problem/279/B",
      badge: "cf", tag: "CF 279B", level: "Medium", pattern: "Longest window with sum at most t; all positive" },
    { name: "Sum of Two Values", url: "https://cses.fi/problemset/task/1640",
      badge: "cf", tag: "CSES", level: "Easy", pattern: "Two sum with indices; pair values with positions before sorting" },
  ],

  spoilers: [
    { summary: "Hint for LC 42 &mdash; why two pointers beats the prefix-max arrays",
      body: "<p>Water above index <code>i</code> is " +
        "<code>min(maxLeft[i], maxRight[i]) - h[i]</code>, which suggests two " +
        "<code>O(n)</code> arrays. The <code>O(1)</code>-space version keeps only " +
        "<code>leftMax</code> and <code>rightMax</code> as scalars and always advances the side " +
        "with the <em>smaller</em> maximum. The reason that is safe: if " +
        "<code>leftMax &lt; rightMax</code>, then for the left pointer the true limiting height is " +
        "<code>leftMax</code> regardless of what lies between, because some wall of at least " +
        "<code>rightMax &gt; leftMax</code> is guaranteed to exist on the right. Transferable " +
        "lesson: <em>when a formula takes a min of two running extremes, you can often process " +
        "whichever side is currently smaller and never need the other side's exact value.</em></p>" },
    { summary: "Hint for LC 287 &mdash; turning an array into a linked list",
      body: "<p>With <code>n + 1</code> values all in <code>[1, n]</code>, define the successor " +
        "function <code>i &rarr; a[i]</code>. Starting from index 0, this walk must eventually " +
        "repeat a node, and since two different indices map to the same value, the repeated node " +
        "is the duplicate &mdash; it is the entry point of the cycle. So run Floyd's algorithm " +
        "with <code>slow = a[slow]</code> and <code>fast = a[a[fast]]</code>, then the phase-2 " +
        "walk from index 0. That gives <code>O(n)</code> time, <code>O(1)</code> space, and no " +
        "modification of the input, which is exactly what the constraints demand. General lesson: " +
        "<em>an array of indices is a functional graph, and every cycle technique applies to " +
        "it.</em></p>" },
  ],

  recap: {
    bullets: [
      "<strong>Three shapes:</strong> opposite ends (converge on sorted data), same direction " +
        "(window or read/write compaction), and fast/slow (cycles and midpoints).",
      "<strong>State the exchange argument before coding.</strong> \"Moving this pointer discards " +
        "only pairs that are dominated by ones we keep\" is the correctness proof and the " +
        "interview answer.",
      "<strong>Same-direction is <code>O(n)</code> amortised</strong>, not quadratic, because the " +
        "inner pointer never moves backwards.",
      "<strong>Duplicates need explicit guards</strong> in <code>k</code>-sum: one on the anchor " +
        "and one on each pointer after a hit.",
      "<strong>Two pointers need order.</strong> Unsorted with required indices, or subarray sums " +
        "with negatives, both call for hashing or prefix sums instead.",
    ],
    oneliner: "sorted+pair -> converge from ends | window/in-place -> same direction | cycle/middle -> fast&slow | prove the move first",
  },
},

/* =============================================== 3. sliding-window ====== */
{
  id: "sliding-window",
  difficulty: "Medium",
  readTime: "26 min",
  tagline: "Maintain a contiguous segment and a small amount of state about it, so that moving " +
    "either edge costs <code>O(1)</code> instead of rescanning &mdash; the answer to nearly every " +
    "\"longest / shortest / count of substrings such that&hellip;\" question.",
  tags: ["sliding window", "two pointers", "strings", "counting", "P0"],
  prereqs: [["Two Pointers", "two-pointers.html"], ["Prefix Sums", "prefix-sums.html"]],

  why: {
    paras: [
      "\"Longest substring without repeating characters\", \"minimum window substring\", " +
      "\"subarrays with at most K distinct\", \"count nice subarrays\" &mdash; these are among the " +
      "most frequently asked interview questions in existence, and they are all the same " +
      "algorithm. A right pointer extends the segment, a left pointer repairs it when it becomes " +
      "invalid, and a small amount of incrementally maintained state (a count array, a distinct " +
      "counter, a running sum) tells you which case you are in.",
      "The reason it works is monotonicity of validity: for a fixed right endpoint, there is a " +
      "threshold left endpoint such that every window starting at or after it is valid and every " +
      "window starting before it is invalid. That threshold never moves backwards as the right " +
      "endpoint advances, so the left pointer only ever goes forward and the whole scan is " +
      "<code>O(n)</code>.",
      "Two things separate people who solve these reliably. First, knowing the three templates " +
      "(fixed size, longest-valid, shortest-valid) and which one a question maps to. Second, " +
      "knowing the <strong>exactly-K trick</strong>: \"exactly K\" is not directly window-able, but " +
      "<code>atMost(K) - atMost(K-1)</code> is, and that single identity unlocks an entire family " +
      "of counting problems that otherwise look intractable.",
    ],
    insight: "Ask: for a fixed right end, is validity monotone in the left end? If yes, the left " +
      "pointer never retreats and the scan is linear. If no &mdash; typically because values can " +
      "be negative &mdash; you need prefix sums with a deque or a hash map instead.",
  },

  recognise: {
    yes: [
      "\"Longest / shortest / count of <strong>contiguous</strong> subarrays or substrings such " +
        "that &hellip;\"",
      "A constraint on the window such as \"at most K distinct\", \"no repeats\", " +
        "\"sum &le; target\", \"contains all characters of T\"",
      "All values are <strong>non-negative</strong>, so extending the window never decreases the " +
        "sum",
      "Fixed window size <code>k</code> is given explicitly (\"maximum sum of any k consecutive " +
        "elements\")",
      "\"Exactly K\" phrasing on a countable property &rarr; use " +
        "<code>atMost(K) - atMost(K-1)</code>",
    ],
    no: [
      "The array contains <strong>negative</strong> numbers and the condition is about sums &rarr; " +
        "validity is not monotone; use <a href=\"prefix-sums.html\">prefix sums</a> with a hash map " +
        "or a monotonic deque",
      "The subsequence need not be contiguous &rarr; that is a " +
        "<a href=\"../10-dynamic-programming/dp-foundations.html\">DP</a> problem, not a window",
      "You need the maximum or minimum <em>inside</em> the window &rarr; the window is right but " +
        "you need a <a href=\"../03-linear-structures/queues-and-monotonic-deque.html\">monotonic " +
        "deque</a> to maintain the extreme",
      "The window must satisfy a condition that can be repaired by moving <em>either</em> edge " +
        "&rarr; monotonicity fails; think again about the formulation",
    ],
    table: [
      ["\"maximum sum of k consecutive elements\"", "Fixed size", "Template 1: fixed window"],
      ["\"longest substring with no repeated characters\"", "Longest valid", "Template 2: grow, repair while invalid"],
      ["\"minimum window containing all of T\"", "Shortest valid", "Template 3: grow, shrink while valid"],
      ["\"longest subarray with at most K distinct\"", "Longest valid, counted state", "Template 2 with a count map"],
      ["\"number of subarrays with exactly K distinct\"", "Exactly K", "<code>atMost(K) &minus; atMost(K&minus;1)</code>"],
      ["\"number of subarrays with exactly K odd numbers\"", "Same trick, different predicate", "<code>atMost(K) &minus; atMost(K&minus;1)</code>"],
      ["\"maximum in every window of size k\"", "Extreme inside the window", "Window + <a href=\"../03-linear-structures/queues-and-monotonic-deque.html\">monotonic deque</a>"],
      ["\"shortest subarray with sum &ge; k\", non-negative", "Shortest valid", "Template 3"],
      ["<strong>Confused with:</strong> \"shortest subarray with sum &ge; k\" <em>with negatives</em>",
        "Shrinking can increase the sum, so the repair step is unsound",
        "Prefix sums + monotonic deque"],
    ],
    constraint: "<code>n &le; 10&#8309;</code> or <code>10&#8310;</code> with a substring question " +
      "is the signature. Character counts fit in <code>int[26]</code>, " +
      "<code>int[128]</code>, or a <code>HashMap</code> for general alphabets &mdash; prefer the " +
      "array whenever the alphabet is bounded.",
  },

  core: {
    heading: "Core idea and the three templates",
    paras: [
      "All three templates share a skeleton: <code>for (r = 0; r &lt; n; r++) { add a[r]; " +
      "&hellip; ; }</code>. What differs is what happens in the middle. <strong>Fixed size:</strong> " +
      "once <code>r - l + 1 &gt; k</code>, remove <code>a[l]</code> and increment <code>l</code> " +
      "exactly once &mdash; the window size is constant, so it is an <code>if</code>, not a " +
      "<code>while</code>. <strong>Longest valid:</strong> <code>while (invalid) { remove a[l]; " +
      "l++; }</code> then record <code>r - l + 1</code>. <strong>Shortest valid:</strong> " +
      "<code>while (valid) { record r - l + 1; remove a[l]; l++; }</code>.",
      "The order of operations matters and is the source of most bugs. In the longest-valid " +
      "template you record the answer <em>after</em> the repair loop, because only then is the " +
      "window guaranteed valid. In the shortest-valid template you record <em>inside</em> the " +
      "shrink loop, because you want the smallest window that still satisfies the condition, and " +
      "the last valid one before it breaks is the one you want.",
      "The state is whatever makes the validity check <code>O(1)</code>. For \"no repeats\" it is " +
      "a count array plus the knowledge that a repeat exists iff some count exceeds 1 &mdash; " +
      "cheaply tracked by checking only the incoming character. For \"at most K distinct\" it is " +
      "a count map plus a <code>distinct</code> counter, incremented when a count goes from 0 to 1 " +
      "and decremented when it returns to 0. For \"contains all of T\" it is a count map plus a " +
      "<code>satisfied</code> counter of how many required characters have met their quota. " +
      "Designing that <code>O(1)</code>-updatable state is the real work.",
    ],
    invariantTitle: "The invariant",
    invariant: "<p>At the top of each iteration of the outer loop, <strong>the window " +
      "<code>[l, r]</code> satisfies the problem's validity predicate, and <code>l</code> is the " +
      "smallest left endpoint for which that holds given the current <code>r</code></strong>. The " +
      "state variables (counts, sums, distinct counters) exactly describe <code>[l, r]</code> and " +
      "nothing else.</p>" +
      "<p>The left pointer never retreats, because if <code>[l, r]</code> is valid then " +
      "<code>[l, r+1]</code> can only become invalid by needing a <em>larger</em> " +
      "<code>l</code>, never a smaller one.</p>",
    extra: [
      { kind: "tip", title: "The exactly-K trick",
        html: "<p>\"Exactly K distinct\" is not monotone: shrinking a window can take you from " +
          "<code>K</code> to <code>K-1</code>, so there is no single threshold left endpoint. But " +
          "\"at most K\" <em>is</em> monotone, and</p>" +
          "<span class=\"eq\">exactly(K) = atMost(K) &minus; atMost(K &minus; 1)</span>" +
          "<p>so you run the same linear window twice and subtract. This converts a whole family " +
          "of hard-looking counting problems into two applications of a template you already " +
          "have. It works for any property where \"at most\" is monotone: distinct characters, " +
          "odd numbers, zeros, and so on.</p>" },
      { kind: "math", title: "Counting subarrays, not just measuring them",
        html: "<p>When \"at most K\" holds for the window <code>[l, r]</code>, every subarray " +
          "ending at <code>r</code> and starting at <code>l, l+1, &hellip;, r</code> is also " +
          "valid, because shrinking preserves \"at most\". That is " +
          "<code>r - l + 1</code> subarrays, so the counting version of the template just " +
          "accumulates <code>count += r - l + 1</code> at each step instead of taking a maximum. " +
          "Recognising that one line converts \"find the longest\" into \"count them all\" is " +
          "worth a lot.</p>" },
      { kind: "warn", title: "Negative numbers break everything",
        html: "<p>\"Shortest subarray with sum at least <code>k</code>\" is a clean window problem " +
          "when all values are non-negative, because the sum is monotone in the window size. Add " +
          "one negative value and it collapses: a longer window can have a smaller sum, so " +
          "\"shrink while valid\" no longer finds the shortest. The correct tool becomes prefix " +
          "sums plus a monotonic deque (LeetCode 862). Always check the sign constraint before " +
          "committing to a window.</p>" },
    ],
  },

  visuals: [
    {
      kind: "array", vizId: "swLongest",
      h3: "Longest substring without repeating characters",
      intro: "The string is <code>abcabcbb</code>. The right pointer always advances; the left " +
        "pointer jumps forward only when the incoming character is already inside the window. " +
        "Notice that <code>l</code> never moves backwards.",
      caption: "Template 2 in action. The answer is recorded after the repair loop, when the window " +
        "is guaranteed valid.",
      data: {
        label: "s = a b c a b c b b",
        array: ["a", "b", "c", "a", "b", "c", "b", "b"],
        vars: ["l", "r", "window", "best"],
        speed: 950,
        frames: [
          { note: "r = 0, add 'a'. Window \"a\" is valid, length 1.",
            active: [0], window: [0, 0], dim: [1,2,3,4,5,6,7],
            values: { l: 0, r: 0, window: "a", best: 1 } },
          { note: "r = 1, add 'b'. Still no repeat. Length 2.",
            active: [1], window: [0, 1], dim: [2,3,4,5,6,7],
            values: { l: 0, r: 1, window: "ab", best: 2 } },
          { note: "r = 2, add 'c'. Length 3, the best so far.",
            active: [2], window: [0, 2], dim: [3,4,5,6,7],
            values: { l: 0, r: 2, window: "abc", best: 3 } },
          { note: "r = 3, add 'a'. Now 'a' appears twice, so the window is invalid. Repair by advancing l.",
            active: [3], x: [0], window: [0, 3], dim: [4,5,6,7],
            values: { l: 0, r: 3, window: "abca (invalid)", best: 3 } },
          { note: "Remove s[0] = 'a'. The window is valid again at \"bca\", still length 3.",
            active: [3], window: [1, 3], done: [0], dim: [4,5,6,7],
            values: { l: 1, r: 3, window: "bca", best: 3 } },
          { note: "r = 4, add 'b'. Duplicate 'b' at index 1, so advance l past it.",
            active: [4], x: [1], window: [1, 4], done: [0], dim: [5,6,7],
            values: { l: 1, r: 4, window: "bcab (invalid)", best: 3 } },
          { note: "l = 2. Window \"cab\", valid, length 3. Best is unchanged.",
            active: [4], window: [2, 4], done: [0,1], dim: [5,6,7],
            values: { l: 2, r: 4, window: "cab", best: 3 } },
          { note: "r = 5, add 'c'. Duplicate at index 2, so l moves to 3. Window \"abc\", length 3.",
            active: [5], window: [3, 5], done: [0,1,2], dim: [6,7],
            values: { l: 3, r: 5, window: "abc", best: 3 } },
          { note: "r = 6, add 'b'. Duplicate 'b' at index 4, so l jumps to 5. Window \"cb\", length 2.",
            active: [6], window: [5, 6], done: [0,1,2,3,4], dim: [7],
            values: { l: 5, r: 6, window: "cb", best: 3 } },
          { note: "r = 7, add 'b'. Duplicate again, l jumps to 7. Window \"b\", length 1.",
            active: [7], window: [7, 7], done: [0,1,2,3,4,5,6],
            values: { l: 7, r: 7, window: "b", best: 3 } },
          { note: "Answer 3. Both pointers travelled at most 8 steps each, so the scan is O(n) even though the inner repair looks like a nested loop.",
            best: [0, 1, 2], done: [3,4,5,6,7],
            values: { l: "\u2014", r: "\u2014", window: "abc", best: 3 } },
        ],
      },
    },
    {
      kind: "grid", vizId: "swExactK",
      h3: "The exactly-K trick, counted",
      intro: "Array <code>[1, 2, 1, 2, 3]</code>, counting subarrays with exactly 2 distinct " +
        "values. The grid tracks <code>atMost(2)</code> and <code>atMost(1)</code> side by side; " +
        "the answer is their difference.",
      caption: "Each row is one position of the right pointer. The counting line is " +
        "<code>count += r - l + 1</code>, because every suffix of a valid window is also valid.",
      data: {
        corner: "r",
        rowHeads: ["r=0", "r=1", "r=2", "r=3", "r=4", "total"],
        colHeads: ["a[r]", "atMost(2)", "atMost(1)", "running diff"],
        vars: ["step", "atMost(2)", "atMost(1)", "exactly(2)"],
        speed: 1250,
        frames: [
          { note: "r = 0, value 1. Both windows are just [1]. Each contributes 1 subarray.",
            cells: [{ r: 0, c: 0, val: "1" }, { r: 0, c: 1, val: "+1" },
                    { r: 0, c: 2, val: "+1" }, { r: 0, c: 3, val: "0" }],
            values: { step: "r=0", "atMost(2)": 1, "atMost(1)": 1, "exactly(2)": 0 } },
          { note: "r = 1, value 2. atMost(2) window is [1,2], contributing 2. atMost(1) must shrink to [2], contributing 1.",
            cells: [{ r: 1, c: 0, val: "2" }, { r: 1, c: 1, val: "+2" },
                    { r: 1, c: 2, val: "+1" }, { r: 1, c: 3, val: "1", cls: "target" }],
            values: { step: "r=1", "atMost(2)": 3, "atMost(1)": 2, "exactly(2)": 1 } },
          { note: "r = 2, value 1. atMost(2) window is [1,2,1], contributing 3. atMost(1) shrinks to [1], contributing 1.",
            cells: [{ r: 2, c: 0, val: "1" }, { r: 2, c: 1, val: "+3" },
                    { r: 2, c: 2, val: "+1" }, { r: 2, c: 3, val: "3", cls: "target" }],
            values: { step: "r=2", "atMost(2)": 6, "atMost(1)": 3, "exactly(2)": 3 } },
          { note: "r = 3, value 2. atMost(2) window is the whole [1,2,1,2], contributing 4. atMost(1) is [2], contributing 1.",
            cells: [{ r: 3, c: 0, val: "2" }, { r: 3, c: 1, val: "+4" },
                    { r: 3, c: 2, val: "+1" }, { r: 3, c: 3, val: "6", cls: "target" }],
            values: { step: "r=3", "atMost(2)": 10, "atMost(1)": 4, "exactly(2)": 6 } },
          { note: "r = 4, value 3. atMost(2) must shrink to [2,3] \u2014 wait, to [1,2,3] minus the 1s, i.e. l moves to 3, contributing 2. atMost(1) is [3], contributing 1.",
            cells: [{ r: 4, c: 0, val: "3" }, { r: 4, c: 1, val: "+2" },
                    { r: 4, c: 2, val: "+1" }, { r: 4, c: 3, val: "7", cls: "target" }],
            values: { step: "r=4", "atMost(2)": 12, "atMost(1)": 5, "exactly(2)": 7 } },
          { note: "atMost(2) = 12, atMost(1) = 5, so exactly(2) = 7. Two linear passes, no extra cleverness needed.",
            cells: [{ r: 5, c: 1, val: "12" }, { r: 5, c: 2, val: "5" },
                    { r: 5, c: 3, val: "7", cls: "answer" }],
            values: { step: "answer", "atMost(2)": 12, "atMost(1)": 5, "exactly(2)": 7 } },
        ],
      },
    },
    {
      kind: "mermaid", vizId: "swPick",
      h3: "Choosing the template",
      caption: "The first question is always about sign and contiguity, because those decide " +
        "whether a window is legal at all.",
      src: `flowchart TD
  q(["longest / shortest / count of a segment"]) --> contig{"must the segment be contiguous?"}
  contig -- no --> dp["not a window: use DP"]
  contig -- yes --> sign{"sums involved, with negative values?"}
  sign -- yes --> pfx["prefix sums plus HashMap or monotonic deque"]
  sign -- no --> size{"is the size fixed at k?"}
  size -- yes --> t1["template 1: add a[r], if size > k remove a[l], l++"]
  size -- no --> goal{"what is asked?"}
  goal -- "longest valid" --> t2["template 2: while invalid, shrink; then record r-l+1"]
  goal -- "shortest valid" --> t3["template 3: while valid, record then shrink"]
  goal -- "count with at most K" --> t4["template 2, accumulate count += r-l+1"]
  goal -- "count with exactly K" --> t5["atMost(K) minus atMost(K-1)"]
  goal -- "max or min inside the window" --> t6["template 1 plus a monotonic deque"]`,
      wide: true,
    },
  ],

  steps: [
    "<strong>Confirm the window is legal:</strong> contiguous segment, and non-negative values if " +
      "the condition involves sums.",
    "<strong>Pick the template</strong> from the flowchart: fixed size, longest valid, shortest " +
      "valid, or a counting variant.",
    "<strong>Design the <code>O(1)</code>-updatable state.</strong> Usually a count array plus one " +
      "scalar summary (<code>distinct</code>, <code>satisfied</code>, <code>sum</code>).",
    "<strong>Write the add step</strong> for <code>a[r]</code>, updating both the counts and the " +
      "scalar.",
    "<strong>Write the remove step</strong> for <code>a[l]</code> as the exact mirror image. " +
      "Asymmetry here is the most common bug.",
    "<strong>Place the answer update correctly:</strong> after the repair loop for longest, inside " +
      "the shrink loop for shortest.",
    "<strong>For counting, accumulate <code>r - l + 1</code></strong> instead of taking a maximum.",
    "<strong>For \"exactly K\", call the at-most helper twice</strong> and subtract.",
  ],

  dryRun: {
    intro: "Minimum window substring: <code>s = \"ADOBECODEBANC\"</code>, <code>t = \"ABC\"</code>. " +
      "<code>need</code> is how many of the required characters still have unmet quotas.",
    cols: ["r", "s[r]", "window", "need", "action"],
    rows: [
      { cells: ["0", "A", "A", "2", "grow"], action: "A satisfied; B and C still missing." },
      { cells: ["3", "B", "ADOB", "1", "grow"], action: "B satisfied." },
      { cells: ["5", "C", "ADOBEC", "0", "<strong>valid</strong>, start shrinking"],
        action: "All three present. Record length 6, then shrink from the left.", change: true },
      { cells: ["5", "&mdash;", "DOBEC", "1", "shrink broke it"],
        action: "Removing A makes it invalid, so stop shrinking and resume growing." },
      { cells: ["10", "A", "DOBECODEBA", "0", "<strong>valid</strong>, shrink"],
        action: "A is back. Shrink while it stays valid.", change: true },
      { cells: ["10", "&mdash;", "ODEBA", "0", "still valid, keep shrinking"],
        action: "Dropped D, O, B, E, C&hellip; wait: recheck. Window <code>BECODEBA</code> then <code>ECODEBA</code>&hellip;" },
      { cells: ["10", "&mdash;", "CODEBA", "0", "length 6, tie"],
        action: "The shortest valid window ending at index 10." },
      { cells: ["12", "C", "CODEBANC", "0", "<strong>valid</strong>, shrink hard"],
        action: "Now C appears twice, so the left side can drop a long way.", change: true },
      { cells: ["12", "&mdash;", "BANC", "0", "length 4 &mdash; new best"],
        action: "Shrinking further would drop B, breaking validity. Final answer.", change: true },
    ],
    after: "<p>Answer: <code>\"BANC\"</code>, length 4. Each character is added once and removed " +
      "at most once, so the whole scan is <code>O(|s| + |t|)</code> despite the nested shrink " +
      "loop.</p>",
  },

  code: [
    { tab: "Three templates", panel: "Templates", file: "WindowTemplates.java",
      intro: "Memorise these three shapes. Almost every window problem is one of them with a " +
        "different state variable, and the position of the answer update is the part to get right.",
      highlight: "9-19,27-40,48-61",
      code: `import java.util.HashMap;
import java.util.Map;

public class WindowTemplates {

    /**
     * TEMPLATE 1 - fixed size k.
     * The size is constant, so the shrink is an if, not a while.
     */
    static long maxSumFixed(int[] a, int k) {
        long sum = 0, best = Long.MIN_VALUE;
        for (int r = 0; r < a.length; r++) {
            sum += a[r];                            // add the incoming element
            if (r >= k) {
                sum -= a[r - k];                    // remove the outgoing element
            }
            if (r >= k - 1) {
                best = Math.max(best, sum);         // only once the window is full
            }
        }
        return best;
    }

    /**
     * TEMPLATE 2 - longest valid window.
     * Grow, repair while invalid, THEN record.
     */
    static int longestAtMostKDistinct(int[] a, int k) {
        Map<Integer, Integer> cnt = new HashMap<>();
        int l = 0, best = 0;
        for (int r = 0; r < a.length; r++) {
            cnt.merge(a[r], 1, Integer::sum);
            while (cnt.size() > k) {                // invalid: too many distinct
                int out = a[l++];
                if (cnt.merge(out, -1, Integer::sum) == 0) {
                    cnt.remove(out);                // must remove, or size() lies
                }
            }
            best = Math.max(best, r - l + 1);       // window is valid here
        }
        return best;
    }

    /**
     * TEMPLATE 3 - shortest valid window.
     * Grow, then record INSIDE the shrink loop while it stays valid.
     * Requires non-negative values.
     */
    static int shortestSumAtLeast(int[] a, int target) {
        int l = 0, best = Integer.MAX_VALUE;
        long sum = 0;
        for (int r = 0; r < a.length; r++) {
            sum += a[r];
            while (sum >= target) {                 // valid: try to make it smaller
                best = Math.min(best, r - l + 1);
                sum -= a[l++];
            }
        }
        return best == Integer.MAX_VALUE ? 0 : best;
    }

    public static void main(String[] args) {
        System.out.println(maxSumFixed(new int[] {2, 1, 5, 1, 3, 2}, 3));
        System.out.println(longestAtMostKDistinct(new int[] {1, 2, 1, 2, 3}, 2));
        System.out.println(shortestSumAtLeast(new int[] {2, 3, 1, 2, 4, 3}, 7));
    }
    // Output: 9
    //         4
    //         2
}`,
    },
    { tab: "Character windows", panel: "Strings", file: "StringWindows.java",
      intro: "The two most-asked string window problems. Both use an <code>int[128]</code> rather " +
        "than a <code>HashMap</code>, which is roughly ten times faster and removes all boxing.",
      highlight: "11-19,36-58",
      code: `public class StringWindows {

    /**
     * Longest substring with no repeated characters. O(n).
     * lastSeen[c] lets l jump directly instead of stepping one at a time.
     */
    static int longestUnique(String s) {
        int[] lastSeen = new int[128];
        java.util.Arrays.fill(lastSeen, -1);
        int l = 0, best = 0;
        for (int r = 0; r < s.length(); r++) {
            char c = s.charAt(r);
            if (lastSeen[c] >= l) {
                l = lastSeen[c] + 1;              // jump past the previous occurrence
            }
            lastSeen[c] = r;
            best = Math.max(best, r - l + 1);
        }
        return best;
    }

    /**
     * Minimum window in s containing every character of t with multiplicity.
     * O(|s| + |t|). 'need' counts how many distinct required chars are still short.
     */
    static String minWindow(String s, String t) {
        if (s.length() < t.length()) {
            return "";
        }
        int[] want = new int[128];
        int need = 0;
        for (char c : t.toCharArray()) {
            if (want[c]++ == 0) {
                need++;                            // a new distinct requirement
            }
        }
        int[] have = new int[128];
        int satisfied = 0, l = 0, bestLen = Integer.MAX_VALUE, bestL = 0;
        for (int r = 0; r < s.length(); r++) {
            char c = s.charAt(r);
            if (++have[c] == want[c]) {
                satisfied++;                       // this char's quota is now met
            }
            while (satisfied == need) {            // valid: shrink as far as possible
                if (r - l + 1 < bestLen) {
                    bestLen = r - l + 1;
                    bestL = l;
                }
                char out = s.charAt(l++);
                if (have[out]-- == want[out]) {
                    satisfied--;                   // quota broken; stop shrinking
                }
            }
        }
        return bestLen == Integer.MAX_VALUE ? "" : s.substring(bestL, bestL + bestLen);
    }

    /** All start indices of anagrams of p in s. Fixed-size window over 26 counts. */
    static java.util.List<Integer> findAnagrams(String s, String p) {
        java.util.List<Integer> out = new java.util.ArrayList<>();
        if (s.length() < p.length()) {
            return out;
        }
        int[] want = new int[26], have = new int[26];
        for (char c : p.toCharArray()) {
            want[c - 'a']++;
        }
        for (int r = 0; r < s.length(); r++) {
            have[s.charAt(r) - 'a']++;
            if (r >= p.length()) {
                have[s.charAt(r - p.length()) - 'a']--;
            }
            if (r >= p.length() - 1 && java.util.Arrays.equals(have, want)) {
                out.add(r - p.length() + 1);       // 26 comparisons = O(1)
            }
        }
        return out;
    }

    public static void main(String[] args) {
        System.out.println(longestUnique("abcabcbb"));
        System.out.println(longestUnique("bbbbb"));
        System.out.println(minWindow("ADOBECODEBANC", "ABC"));
        System.out.println(findAnagrams("cbaebabacd", "abc"));
    }
    // Output: 3
    //         1
    //         BANC
    //         [0, 6]
}`,
    },
    { tab: "Exactly K counting", panel: "Exactly K", file: "ExactlyK.java",
      intro: "The identity <code>exactly(K) = atMost(K) - atMost(K-1)</code> applied to two " +
        "different predicates. Once you see the pattern, a whole class of \"count subarrays " +
        "with exactly&hellip;\" problems becomes mechanical.",
      highlight: "9-11,30-32",
      code: `import java.util.HashMap;
import java.util.Map;

public class ExactlyK {

    /** Number of subarrays with exactly k distinct integers. O(n). */
    static int subarraysWithKDistinct(int[] a, int k) {
        return atMostDistinct(a, k) - atMostDistinct(a, k - 1);
    }

    /** Subarrays with at most k distinct. Counting line: count += r - l + 1. */
    private static int atMostDistinct(int[] a, int k) {
        if (k < 0) {
            return 0;
        }
        Map<Integer, Integer> cnt = new HashMap<>();
        int l = 0, total = 0;
        for (int r = 0; r < a.length; r++) {
            cnt.merge(a[r], 1, Integer::sum);
            while (cnt.size() > k) {
                int out = a[l++];
                if (cnt.merge(out, -1, Integer::sum) == 0) {
                    cnt.remove(out);
                }
            }
            total += r - l + 1;      // every subarray ending at r and starting in
                                     // [l, r] is valid, because shrinking preserves
                                     // "at most k distinct"
        }
        return total;
    }

    /** Number of subarrays containing exactly k odd numbers ("nice subarrays"). */
    static int numberOfNiceSubarrays(int[] a, int k) {
        return atMostOdd(a, k) - atMostOdd(a, k - 1);
    }

    private static int atMostOdd(int[] a, int k) {
        if (k < 0) {
            return 0;
        }
        int l = 0, odds = 0, total = 0;
        for (int r = 0; r < a.length; r++) {
            odds += a[r] & 1;
            while (odds > k) {
                odds -= a[l++] & 1;
            }
            total += r - l + 1;
        }
        return total;
    }

    public static void main(String[] args) {
        System.out.println(subarraysWithKDistinct(new int[] {1, 2, 1, 2, 3}, 2));
        System.out.println(subarraysWithKDistinct(new int[] {1, 2, 1, 3, 4}, 3));
        System.out.println(numberOfNiceSubarrays(new int[] {1, 1, 2, 1, 1}, 3));
        System.out.println(numberOfNiceSubarrays(new int[] {2, 2, 2, 1, 2, 2, 1, 2, 2, 2}, 2));
    }
    // Output: 7
    //         3
    //         2
    //         16
}`,
    },
  ],

  complexity: {
    time: "O(n) for the scan; O(n &middot; A) if you compare full count arrays",
    space: "O(A) where A is the alphabet or distinct-value count",
    derivation: [
      "<p>Both pointers move only forward and each is bounded by <code>n</code>, so the total " +
      "number of pointer movements is at most <code>2n</code>:</p>",
      "<span class=\"eq\">T(n) = &Theta;(n) &times; O(cost of one add/remove) = &Theta;(n) when the state update is O(1)</span>",
      "<p>The nested <code>while</code> does not make it quadratic, for the same amortised reason " +
      "as <a href=\"two-pointers.html\">two pointers</a>: <code>l</code> never decreases. Each " +
      "element enters the window exactly once and leaves at most once.</p>",
      "<p>The constant hides in the state update. With an <code>int[26]</code> and a scalar " +
      "summary, add and remove are single array operations. With a <code>HashMap</code> they are " +
      "<code>O(1)</code> expected but roughly 20&ndash;50 times slower per operation. And the " +
      "anagram template that calls <code>Arrays.equals(have, want)</code> per position is " +
      "<code>&Theta;(n &middot; 26)</code> &mdash; still linear in <code>n</code>, but you can " +
      "reduce it to <code>&Theta;(n)</code> by maintaining a <code>matched</code> counter " +
      "instead.</p>",
      "<p>The exactly-K trick runs the same linear scan twice, so it is " +
      "<code>&Theta;(2n) = &Theta;(n)</code> &mdash; the constant is 2, and that is the entire " +
      "price of converting a non-monotone problem into a monotone one.</p>",
    ],
    compare: [
      ["Brute force all subarrays", "<code>O(n&sup2;)</code> or <code>O(n&sup3;)</code>", "<code>O(1)</code>", "n &le; 2000 only"],
      ["Sliding window, array counts", "<code>O(n)</code>", "<code>O(A)</code>", "Bounded alphabet; the fastest option"],
      ["Sliding window, HashMap", "<code>O(n)</code> expected", "<code>O(n)</code>", "Unbounded values"],
      ["Exactly K via two at-most passes", "<code>O(n)</code>", "<code>O(A)</code>", "Counting problems"],
      ["Window + <a href=\"../03-linear-structures/queues-and-monotonic-deque.html\">monotonic deque</a>", "<code>O(n)</code>", "<code>O(k)</code>", "Max or min inside the window"],
      ["Prefix + HashMap", "<code>O(n)</code>", "<code>O(n)</code>", "Exact sums with negative values"],
      ["Prefix + monotonic deque", "<code>O(n)</code>", "<code>O(n)</code>", "Shortest sum &ge; k with negatives"],
    ],
  },

  pitfalls: [
    { title: "Using a window when values can be negative",
      bug: "\"Shortest subarray with sum at least <code>k</code>\" on an array containing " +
        "negatives. Shrinking from the left can <em>increase</em> the sum, so the shrink loop " +
        "terminates early and misses the answer.",
      fix: "Check the sign constraint first. With negatives, use prefix sums plus a monotonic " +
        "deque (the deque keeps prefix indices in increasing order of prefix value)." },
    { title: "Recording the answer in the wrong place",
      bug: "In the longest-valid template, updating <code>best</code> before the repair loop " +
        "records an invalid window. In the shortest-valid template, updating after the shrink loop " +
        "records a window that has already been broken.",
      fix: "Longest: record after repairing. Shortest: record inside the shrink loop, before " +
        "removing. Write the template from memory a few times until the placement is automatic." },
    { title: "Asymmetric add and remove",
      bug: "Incrementing <code>distinct</code> when a count goes from 0 to 1, but forgetting to " +
        "decrement it when a count returns to 0. The state then describes a window that does not " +
        "exist.",
      fix: "Write remove as the literal mirror of add, and check the transition condition on both " +
        "sides. With a <code>HashMap</code>, actually <code>remove</code> the key at zero &mdash; " +
        "otherwise <code>map.size()</code> counts stale entries." },
    { title: "<code>map.size()</code> counting zero-valued keys",
      bug: "Using <code>cnt.size() &gt; k</code> as the validity test while leaving entries whose " +
        "value has dropped to 0 in the map. The window looks invalid forever and <code>l</code> " +
        "runs past <code>r</code>.",
      fix: "<code>if (cnt.merge(key, -1, Integer::sum) == 0) cnt.remove(key);</code>, or maintain " +
        "an explicit <code>distinct</code> counter and never call <code>size()</code>." },
    { title: "Fixed-size window using a <code>while</code>",
      bug: "<code>while (r - l + 1 &gt; k) { &hellip; }</code> in the fixed-size template is " +
        "harmless but signals confusion; the real bug is starting to record before the window is " +
        "full, which yields answers from undersized windows.",
      fix: "Guard the answer update with <code>if (r &ge; k - 1)</code>, and use a single " +
        "<code>if</code> for the removal since the size grows by exactly one each step." },
    { title: "Trying to window \"exactly K\" directly",
      bug: "Writing <code>while (distinct &gt; k)</code> and then recording only when " +
        "<code>distinct == k</code>. This undercounts, because for a given <code>r</code> there " +
        "is a <em>range</em> of valid left endpoints and the window only sees one of them.",
      fix: "<code>atMost(K) - atMost(K-1)</code>. Two passes of a template you already trust, and " +
        "no special-case reasoning." },
    { title: "Character index out of range",
      bug: "<code>int[26]</code> indexed by <code>c - 'a'</code> when the input contains uppercase " +
        "letters, digits or spaces. Throws " +
        "<code>ArrayIndexOutOfBoundsException</code>, or silently corrupts memory-adjacent counts " +
        "with a negative index.",
      fix: "Read the constraints on the alphabet. Use <code>int[128]</code> indexed by the raw " +
        "<code>char</code> for ASCII, or a <code>HashMap</code> for Unicode. The extra 100 ints " +
        "cost nothing." },
  ],

  variants: [
    ["Fixed window with a monotonic deque",
      "Maintain the maximum or minimum inside a window of size <code>k</code> in " +
      "<code>O(1)</code> amortised per step by keeping a deque of indices in decreasing value order.",
      "while (!dq.isEmpty() && a[dq.peekLast()] <= a[r]) dq.pollLast();  dq.addLast(r);",
      "<a href=\"../03-linear-structures/queues-and-monotonic-deque.html\">Monotonic Deque</a>"],
    ["Window over a circular array",
      "Duplicate the array (or use modular indices) and cap the window length at <code>n</code>.",
      "for (r = 0; r < 2*n; r++) { ...; if (r - l + 1 > n) shrink(); }",
      "LC 918"],
    ["Window with at most one violation",
      "Allow <code>k</code> exceptions and shrink only when the exception count exceeds " +
      "<code>k</code>. Covers \"longest ones after flipping at most k zeros\".",
      "zeros += (a[r] == 0); while (zeros > k) zeros -= (a[l++] == 0);",
      "LC 1004, LC 424"],
    ["Two-pass windows for \"exactly\"",
      "Any counting property where \"at most\" is monotone: distinct values, odd numbers, zeros, " +
      "characters above a threshold.",
      "exactly(K) = atMost(K) - atMost(K-1)",
      "LC 992, LC 1248"],
    ["Window on a sorted array (after sorting)",
      "Sorting first is legal when the answer does not depend on original order. \"Maximum number " +
      "of elements within a range of size k\" becomes a window on the sorted array.",
      "sort(a); while (a[r] - a[l] > k) l++;  best = max(best, r - l + 1);",
      "LC 1838"],
    ["Window over prefix sums (for negatives)",
      "When negatives break the direct window, run a monotonic deque over the prefix array " +
      "instead, keeping indices with increasing prefix value.",
      "while (!dq.isEmpty() && P[r] <= P[dq.peekLast()]) dq.pollLast();",
      "LC 862"],
  ],

  followups: [
    ["Why does the left pointer never need to move backwards?",
      "<p>Because validity is monotone in the left endpoint for a fixed right endpoint. If " +
      "<code>[l, r]</code> is invalid, then <code>[l', r]</code> for any <code>l' &lt; l</code> is " +
      "also invalid, since it contains strictly more elements and the constraints are all of the " +
      "\"at most\" form. So once <code>l</code> has advanced past a position, that position can " +
      "never become a valid left endpoint again for any larger <code>r</code>. That is exactly the " +
      "property that fails for \"exactly K\", which is why the direct window does not work there.</p>"],
    ["Prove the <code>atMost(K) - atMost(K-1)</code> identity.",
      "<p>Let <code>D(S)</code> be the number of distinct values in subarray <code>S</code>. " +
      "<code>atMost(K)</code> counts all subarrays with <code>D(S) &le; K</code>, and " +
      "<code>atMost(K-1)</code> counts those with <code>D(S) &le; K-1</code>. Every subarray " +
      "counted by the first but not the second has <code>D(S) &le; K</code> and " +
      "<code>D(S) &gt; K-1</code>, i.e. <code>D(S) = K</code> exactly. The sets are nested, so the " +
      "subtraction is exact with no double counting. The same argument works for any integer-valued " +
      "monotone statistic of the window.</p>"],
    ["How do you find the maximum in every window of size k?",
      "<p>A monotonic deque of <em>indices</em>, kept in decreasing order of value. When " +
      "<code>r</code> advances, pop from the back while the back's value is at most " +
      "<code>a[r]</code> &mdash; those can never be the maximum again, since <code>a[r]</code> is " +
      "both larger and stays in the window longer. Then pop from the front if its index has left " +
      "the window. The front is always the maximum. Each index is pushed and popped once, so the " +
      "whole scan is <code>O(n)</code>. Storing indices rather than values is essential, because " +
      "the expiry test needs the position.</p>"],
    ["When is a window wrong for a sum problem?",
      "<p>Whenever any value can be negative or zero-with-a-twist. The window technique needs " +
      "\"extending increases the sum\" so that shrinking is the correct repair. With negatives, " +
      "the correct tool depends on the question: for \"count subarrays with sum exactly " +
      "<code>k</code>\" use <a href=\"prefix-sums.html\">prefix sums plus a hash map</a>; for " +
      "\"shortest subarray with sum at least <code>k</code>\" use prefix sums plus a monotonic " +
      "deque. Both are <code>O(n)</code>, so you lose nothing but the simplicity.</p>"],
    ["What is the complexity of the anagram-finding template?",
      "<p>As written with <code>Arrays.equals(have, want)</code> at each position it is " +
      "<code>O(n &middot; 26)</code>, which is linear in <code>n</code> but with a constant of 26. " +
      "You can make it a true <code>O(n)</code> with a small constant by maintaining a " +
      "<code>matched</code> counter: increment it when a character's count becomes exactly equal " +
      "to its requirement and decrement it when it stops being equal, then test " +
      "<code>matched == 26</code> in <code>O(1)</code>. Both pass comfortably, but the second " +
      "version is the one to mention.</p>"],
    ["How do you handle a window on a circular array?",
      "<p>Either concatenate the array with itself and cap the window length at <code>n</code>, " +
      "or index with <code>i % n</code> and run <code>r</code> from 0 to <code>2n - 1</code>. The " +
      "cap is essential: without it the window can wrap all the way around and count an element " +
      "twice. For \"maximum circular subarray sum\" specifically there is a neater trick &mdash; " +
      "the answer is <code>max(kadaneMax, totalSum - kadaneMin)</code>, with a special case when " +
      "all values are negative.</p>"],
  ],

  problemsIntro: "Do LC 3, LC 76 and LC 992 first &mdash; those are template 2, template 3 and the " +
    "exactly-K trick respectively, and everything else here is a variation on one of them.",

  problems: [
    { name: "Longest Substring Without Repeating Characters", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
      badge: "lc", tag: "LC 3", level: "Medium", pattern: "Template 2; lastSeen[] lets l jump instead of stepping" },
    { name: "Minimum Size Subarray Sum", url: "https://leetcode.com/problems/minimum-size-subarray-sum/",
      badge: "lc", tag: "LC 209", level: "Medium", pattern: "Template 3; note the all-positive precondition" },
    { name: "Minimum Window Substring", url: "https://leetcode.com/problems/minimum-window-substring/",
      badge: "lc", tag: "LC 76", level: "Hard", pattern: "Template 3 with a satisfied-counter; the canonical hard window" },
    { name: "Permutation in String", url: "https://leetcode.com/problems/permutation-in-string/",
      badge: "lc", tag: "LC 567", level: "Medium", pattern: "Fixed window over 26 counts" },
    { name: "Find All Anagrams in a String", url: "https://leetcode.com/problems/find-all-anagrams-in-a-string/",
      badge: "lc", tag: "LC 438", level: "Medium", pattern: "Same as 567 but collect every start index" },
    { name: "Longest Repeating Character Replacement", url: "https://leetcode.com/problems/longest-repeating-character-replacement/",
      badge: "lc", tag: "LC 424", level: "Medium", pattern: "Window valid when size minus maxCount &le; k" },
    { name: "Max Consecutive Ones III", url: "https://leetcode.com/problems/max-consecutive-ones-iii/",
      badge: "lc", tag: "LC 1004", level: "Medium", pattern: "At most k zeros; the cleanest exception-budget window" },
    { name: "Subarrays with K Different Integers", url: "https://leetcode.com/problems/subarrays-with-k-different-integers/",
      badge: "lc", tag: "LC 992", level: "Hard", pattern: "The exactly-K trick. Learn this one properly" },
    { name: "Count Number of Nice Subarrays", url: "https://leetcode.com/problems/count-number-of-nice-subarrays/",
      badge: "lc", tag: "LC 1248", level: "Medium", pattern: "Exactly-K applied to odd counts" },
    { name: "Fruit Into Baskets", url: "https://leetcode.com/problems/fruit-into-baskets/",
      badge: "lc", tag: "LC 904", level: "Medium", pattern: "Longest subarray with at most 2 distinct" },
    { name: "Sliding Window Maximum", url: "https://leetcode.com/problems/sliding-window-maximum/",
      badge: "lc", tag: "LC 239", level: "Hard", pattern: "Fixed window plus a monotonic deque of indices" },
    { name: "Shortest Subarray with Sum at Least K", url: "https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/",
      badge: "lc", tag: "LC 862", level: "Hard", pattern: "Negatives break the window: prefix sums + deque" },
    { name: "Longest Subarray of 1's After Deleting One Element", url: "https://leetcode.com/problems/longest-subarray-of-1s-after-deleting-one-element/",
      badge: "lc", tag: "LC 1493", level: "Medium", pattern: "At most one zero, then subtract one from the length" },
    { name: "Number of Substrings Containing All Three Characters", url: "https://leetcode.com/problems/number-of-substrings-containing-all-three-characters/",
      badge: "lc", tag: "LC 1358", level: "Medium", pattern: "Counting version: add l once the window is valid" },
    { name: "Playlist", url: "https://cses.fi/problemset/task/1141",
      badge: "cf", tag: "CSES", level: "Easy", pattern: "Longest window with all-distinct values" },
    { name: "Subarray Distinct Values", url: "https://cses.fi/problemset/task/2428",
      badge: "cf", tag: "CSES", level: "Medium", pattern: "Counting version of at-most-k distinct" },
  ],

  spoilers: [
    { summary: "Hint for LC 424 &mdash; why you never need to shrink <code>maxCount</code>",
      body: "<p>The window is valid when <code>(r - l + 1) - maxCount &le; k</code>, where " +
        "<code>maxCount</code> is the frequency of the most common character inside it. The " +
        "surprising part is that you can let <code>maxCount</code> go stale &mdash; never " +
        "recompute it downward when the window shrinks &mdash; and the answer is still correct. " +
        "The reason: the final answer only ever comes from a window whose <code>maxCount</code> is " +
        "genuinely achieved, and a stale (too large) <code>maxCount</code> only prevents the window " +
        "from shrinking, never lets it grow beyond a truly achievable size. Transferable lesson: " +
        "<em>when you only care about the maximum window size ever reached, monotone-but-stale " +
        "state is often safe, and checking that is cheaper than maintaining exact state.</em></p>" },
    { summary: "Hint for LC 862 &mdash; the deque over prefix sums",
      body: "<p>Compute prefix sums <code>P</code>. You want the smallest <code>r - l</code> with " +
        "<code>P[r] - P[l] &ge; k</code>. Maintain a deque of indices with <em>increasing</em> " +
        "<code>P</code> values. Two rules: pop from the <em>front</em> while " +
        "<code>P[r] - P[front] &ge; k</code>, recording the length &mdash; that front index can " +
        "never give a shorter answer later. Pop from the <em>back</em> while " +
        "<code>P[r] &le; P[back]</code> &mdash; a later index with a smaller prefix dominates an " +
        "earlier index with a larger one, for every future <code>r</code>. Both pops are " +
        "permanent, so the scan is <code>O(n)</code>. General lesson: <em>when a window fails " +
        "because of non-monotonicity, look for a monotonic structure over the prefix array " +
        "instead &mdash; the deque enforces the monotonicity the data lacks.</em></p>" },
  ],

  recap: {
    bullets: [
      "<strong>Three templates:</strong> fixed size (<code>if</code> shrink), longest valid " +
        "(<code>while</code> repair then record), shortest valid (record inside the shrink loop).",
      "<strong>Design <code>O(1)</code> state:</strong> a count array plus one scalar summary such " +
        "as <code>distinct</code>, <code>satisfied</code>, or <code>sum</code>. Add and remove must " +
        "be exact mirrors.",
      "<strong>Counting adds one line:</strong> <code>count += r - l + 1</code>, because every " +
        "suffix of a valid \"at most\" window is also valid.",
      "<strong>Exactly K is <code>atMost(K) - atMost(K-1)</code></strong> &mdash; two linear " +
        "passes, no special reasoning.",
      "<strong>Negatives kill the window.</strong> Switch to prefix sums with a hash map (exact " +
        "sums) or a monotonic deque (shortest sum at least k).",
    ],
    oneliner: "grow r always | longest: while(invalid) shrink, then record | shortest: while(valid) record, then shrink | exactly K = atMost(K)-atMost(K-1)",
  },
},

/* ========================================= 4. binary-search-basics ====== */
{
  id: "binary-search-basics",
  difficulty: "Easy",
  readTime: "24 min",
  tagline: "One template, written once, that never has an off-by-one error: find the first index " +
    "where a monotone predicate becomes true, and express every search as that.",
  tags: ["binary search", "lower bound", "monotone", "P0"],
  prereqs: [["Complexity Analysis", "../00-foundations/complexity-analysis.html"]],

  why: {
    paras: [
      "Everyone knows binary search and almost everyone writes it wrong under pressure. The bugs " +
      "are always the same three: an infinite loop from the wrong midpoint rounding, an " +
      "off-by-one from <code>hi = mid</code> versus <code>hi = mid - 1</code>, and an overflow " +
      "from <code>(lo + hi) / 2</code>. The cure is not care; it is committing to a single " +
      "template and never deviating.",
      "That template is <strong>find the first index where a predicate is true</strong>. Every " +
      "other search is a rewrite of it. Looking for an exact value is \"first index where " +
      "<code>a[i] &ge; target</code>, then check\". Upper bound is \"first index where " +
      "<code>a[i] &gt; target</code>\". Counting occurrences is the difference of two such " +
      "searches. Once you accept that framing, the boundary reasoning happens once, in one place, " +
      "and never again.",
      "The deeper point is that binary search is not about sorted arrays. It is about " +
      "<strong>monotone predicates</strong>: any function from the index space to " +
      "<code>{false, true}</code> that never goes back from true to false. Sortedness is just the " +
      "most common way to get one. That reframing is what turns binary search into " +
      "<a href=\"binary-search-on-answer.html\">binary search on the answer</a>, which is one of " +
      "the highest-value techniques in competitive programming.",
    ],
    insight: "Do not search for a value; search for a <em>boundary</em>. Define a boolean " +
      "predicate that is false-then-true over the range and find the first true. Every classic " +
      "binary search is that with a different predicate.",
  },

  recognise: {
    yes: [
      "A <strong>sorted</strong> array (or one you may sort) with lookup, insertion-point, or " +
        "count queries",
      "\"Find the first / last element satisfying &hellip;\"",
      "\"How many elements are less than <code>x</code>?\" &rarr; that is exactly a lower bound",
      "A rotated sorted array, or a mountain / bitonic array &mdash; one comparison identifies " +
        "which half is ordered",
      "Any predicate you can evaluate in <code>O(1)</code> or <code>O(n)</code> that is " +
        "<strong>monotone</strong> over the search space",
    ],
    no: [
      "The array is unsorted and cannot be sorted &rarr; nothing to halve; use hashing or a linear " +
        "scan",
      "The predicate is not monotone &rarr; binary search will find <em>a</em> boundary but not " +
        "necessarily the one you want; verify monotonicity first",
      "You need <em>all</em> matches and there are many &rarr; find the boundaries and then scan " +
        "the range",
      "<code>n</code> is tiny (below about 50) &rarr; a linear scan is faster in practice and " +
        "impossible to get wrong",
    ],
    table: [
      ["\"does x exist in the sorted array?\"", "Exact match", "<code>lowerBound</code>, then check <code>a[i] == x</code>"],
      ["\"first index with a[i] &ge; x\"", "Lower bound", "predicate <code>a[i] &ge; x</code>"],
      ["\"first index with a[i] &gt; x\"", "Upper bound", "predicate <code>a[i] &gt; x</code>"],
      ["\"how many elements equal x?\"", "Count in a range", "<code>upperBound(x) &minus; lowerBound(x)</code>"],
      ["\"insertion position to keep it sorted\"", "Lower bound", "The same function, different name"],
      ["\"first and last position of x\"", "Two boundaries", "<code>lowerBound(x)</code> and <code>upperBound(x) &minus; 1</code>"],
      ["\"minimum in a rotated sorted array\"", "One half is always sorted", "Compare <code>a[mid]</code> with <code>a[hi]</code>"],
      ["\"peak of a mountain array\"", "Slope is monotone", "predicate <code>a[mid] &gt; a[mid+1]</code>"],
      ["<strong>Confused with:</strong> <code>Arrays.binarySearch</code> on duplicates",
        "Returns <em>any</em> matching index, not the first", "Write your own lower bound"],
    ],
    constraint: "<code>log&#8322;(10&#8310;) &asymp; 20</code> and " +
      "<code>log&#8322;(10&#8313;) &asymp; 30</code>, so a binary search is essentially free. If " +
      "<code>q</code> queries each need a search, the cost is " +
      "<code>O(n log n + q log n)</code> &mdash; sorting usually dominates.",
  },

  core: {
    heading: "Core idea: search for a boundary, not a value",
    paras: [
      "Model the search space as a sequence of booleans: <code>F F F F T T T T</code>. Binary " +
      "search finds the position of the first <code>T</code>. The requirement is monotonicity: " +
      "once the predicate is true it stays true. For a sorted array and the predicate " +
      "<code>a[i] &ge; x</code>, monotonicity is immediate. For \"can we finish in <code>t</code> " +
      "minutes?\" it usually needs a one-line argument, and that argument is the real content of " +
      "<a href=\"binary-search-on-answer.html\">binary search on the answer</a>.",
      "The template that never fails uses a half-open interval. Keep <code>lo</code> as the " +
      "smallest candidate and <code>hi</code> as one past the largest. Loop while " +
      "<code>lo &lt; hi</code>; compute <code>mid = lo + (hi - lo) / 2</code>; if the predicate " +
      "holds at <code>mid</code>, the answer is at <code>mid</code> or earlier, so " +
      "<code>hi = mid</code>; otherwise the answer is strictly after, so " +
      "<code>lo = mid + 1</code>. When the loop ends, <code>lo == hi</code> is the first true " +
      "index, or <code>n</code> if there is none.",
      "That version terminates for a simple reason: the interval length <code>hi - lo</code> " +
      "strictly decreases every iteration. With floor division, <code>mid &lt; hi</code> always, " +
      "so <code>hi = mid</code> makes progress; and <code>lo = mid + 1</code> obviously does. The " +
      "classic infinite loop comes from writing <code>lo = mid</code> in the else branch, which " +
      "can leave the interval unchanged when <code>hi - lo == 1</code>.",
    ],
    invariantTitle: "The invariant",
    invariant: "<p>At the top of every iteration: <strong>the first index satisfying the predicate " +
      "lies in <code>[lo, hi]</code></strong>. Equivalently, the predicate is false for every " +
      "index below <code>lo</code>, and true for <code>hi</code> if <code>hi &lt; n</code>.</p>" +
      "<p>The loop preserves this and shrinks the interval, so on exit <code>lo == hi</code> is " +
      "the answer. If the predicate is false everywhere, <code>lo</code> ends at " +
      "<code>n</code> &mdash; which is exactly the \"not found\" signal you want, and needs no " +
      "special case.</p>",
    extra: [
      { kind: "tip", title: "The one template to memorise",
        html: "<pre class=\"eq\" style=\"text-align:left\">int lo = 0, hi = n;            // half-open: hi is one past the end\n" +
          "while (lo &lt; hi) {\n" +
          "    int mid = lo + (hi - lo) / 2;\n" +
          "    if (predicate(mid)) hi = mid;   // answer is mid or earlier\n" +
          "    else                lo = mid + 1;\n" +
          "}\n" +
          "return lo;                     // first true index, or n</pre>" +
          "<p>Write this from memory until it is automatic. Then <em>never</em> write a different " +
          "binary search &mdash; change the predicate instead.</p>" },
      { kind: "warn", title: "<code>Arrays.binarySearch</code> and duplicates",
        html: "<p>Java's built-in returns <em>an</em> index of a matching element when duplicates " +
          "exist, not the first or the last, and the choice is unspecified. When the element is " +
          "absent it returns <code>-(insertionPoint) - 1</code>, so the insertion point is " +
          "<code>-result - 1</code>. That is genuinely useful for lower-bound behaviour on unique " +
          "arrays, but for duplicates you must write your own. Note that " +
          "<code>TreeMap.floorKey</code> / <code>ceilingKey</code> and <code>TreeSet.floor</code> " +
          "/ <code>ceiling</code> give the same semantics with clearer names.</p>" },
      { kind: "math", title: "Why exactly &lceil;log&#8322;(n+1)&rceil; steps",
        html: "<p>Each iteration at least halves the interval, so after <code>k</code> steps the " +
          "length is at most <code>n / 2<sup>k</sup></code>. The loop stops when the length " +
          "reaches 1, giving <code>k = &lceil;log&#8322;(n+1)&rceil;</code>. Concretely: 20 steps " +
          "for a million elements, 30 for a billion, 60 for the whole <code>long</code> range. " +
          "This is also the information-theoretic minimum, since each comparison yields one bit " +
          "and you need <code>log&#8322; n</code> bits to identify one of <code>n</code> " +
          "positions.</p>" },
    ],
  },

  visuals: [
    {
      kind: "array", vizId: "bsLower",
      h3: "Lower bound: first index with <code>a[i] &ge; 5</code>",
      intro: "Array <code>[1, 3, 3, 5, 5, 5, 8, 9]</code>. The predicate row shows " +
        "<code>a[i] &ge; 5</code>, which is <code>F F F T T T T T</code> &mdash; monotone, which is " +
        "the only requirement.",
      caption: "The interval is half-open. When <code>lo == hi</code> the loop stops and " +
        "<code>lo</code> is the first true index, index 3 here.",
      data: {
        label: "a (sorted), looking for the first a[i] >= 5",
        array: [1, 3, 3, 5, 5, 5, 8, 9],
        vars: ["lo", "hi", "mid", "a[mid] >= 5?"],
        speed: 1000,
        frames: [
          { note: "Start with lo = 0, hi = 8 (one past the end). The answer is somewhere in [0, 8].",
            window: [0, 7], values: { lo: 0, hi: 8, mid: "\u2014", "a[mid] >= 5?": "\u2014" } },
          { note: "mid = 0 + (8-0)/2 = 4. a[4] = 5, which satisfies the predicate, so the answer is at 4 or earlier: hi = 4.",
            active: [4], window: [0, 7], values: { lo: 0, hi: 8, mid: 4, "a[mid] >= 5?": "true" } },
          { note: "Interval is now [0, 4). Indices 4 through 7 are eliminated \u2014 they may satisfy the predicate but cannot be the FIRST.",
            active: [4], window: [0, 3], dim: [4,5,6,7],
            values: { lo: 0, hi: 4, mid: 4, "a[mid] >= 5?": "true" } },
          { note: "mid = 0 + (4-0)/2 = 2. a[2] = 3, which is below 5, so the answer is strictly after: lo = 3.",
            active: [2], x: [2], window: [0, 3], dim: [4,5,6,7],
            values: { lo: 0, hi: 4, mid: 2, "a[mid] >= 5?": "false" } },
          { note: "Interval is [3, 4). Indices 0 through 2 are eliminated.",
            window: [3, 3], done: [0,1,2], dim: [4,5,6,7],
            values: { lo: 3, hi: 4, mid: 2, "a[mid] >= 5?": "false" } },
          { note: "mid = 3 + (4-3)/2 = 3. a[3] = 5, true, so hi = 3.",
            active: [3], window: [3, 3], done: [0,1,2], dim: [4,5,6,7],
            values: { lo: 3, hi: 4, mid: 3, "a[mid] >= 5?": "true" } },
          { note: "lo == hi == 3, so the loop exits. The first index with a[i] >= 5 is 3. Three comparisons for eight elements.",
            best: [3], done: [0,1,2], dim: [4,5,6,7],
            values: { lo: 3, hi: 3, mid: "\u2014", "a[mid] >= 5?": "answer = 3" } },
          { note: "Upper bound uses the predicate a[i] > 5 instead, giving index 6. So the count of 5s is upperBound - lowerBound = 6 - 3 = 3.",
            best: [3, 6], window: [3, 5],
            values: { lo: "lower=3", hi: "upper=6", mid: "\u2014", "a[mid] >= 5?": "count = 3" } },
        ],
      },
    },
    {
      kind: "array", vizId: "bsRotated",
      h3: "Rotated sorted array: one half is always ordered",
      intro: "Array <code>[4, 5, 6, 7, 0, 1, 2]</code>, searching for <code>0</code>. Comparing " +
        "<code>a[mid]</code> with <code>a[lo]</code> tells you which half is sorted, and then a " +
        "range test tells you which half to keep.",
      caption: "The rotation point breaks global sortedness but never breaks <em>both</em> halves " +
        "at once, so one comparison always identifies a fully sorted side.",
      data: {
        label: "rotated array, target = 0",
        array: [4, 5, 6, 7, 0, 1, 2],
        vars: ["lo", "hi", "mid", "sorted half", "decision"],
        speed: 1150,
        frames: [
          { note: "lo = 0, hi = 6, mid = 3. a[3] = 7.",
            active: [3], window: [0, 6],
            values: { lo: 0, hi: 6, mid: 3, "sorted half": "\u2014", decision: "\u2014" } },
          { note: "a[lo] = 4 <= a[mid] = 7, so the LEFT half [0,3] is fully sorted (4,5,6,7).",
            active: [3], window: [0, 3], best: [0, 1, 2, 3],
            values: { lo: 0, hi: 6, mid: 3, "sorted half": "left", decision: "\u2014" } },
          { note: "Is the target 0 inside [4, 7]? No. So it must be in the right half: lo = mid + 1 = 4.",
            x: [0,1,2,3], window: [4, 6],
            values: { lo: 4, hi: 6, mid: 3, "sorted half": "left", decision: "go right" } },
          { note: "lo = 4, hi = 6, mid = 5. a[5] = 1.",
            active: [5], window: [4, 6], x: [0,1,2,3],
            values: { lo: 4, hi: 6, mid: 5, "sorted half": "\u2014", decision: "\u2014" } },
          { note: "a[lo] = 0 <= a[mid] = 1, so the left half [4,5] is sorted (0,1).",
            active: [5], window: [4, 5], best: [4, 5], x: [0,1,2,3],
            values: { lo: 4, hi: 6, mid: 5, "sorted half": "left", decision: "\u2014" } },
          { note: "Is 0 inside [0, 1]? Yes. So discard the right: hi = mid - 1 = 4.",
            window: [4, 4], x: [0,1,2,3,6],
            values: { lo: 4, hi: 4, mid: 5, "sorted half": "left", decision: "go left" } },
          { note: "lo = hi = 4, mid = 4, a[4] = 0. Found at index 4 in three comparisons.",
            best: [4], x: [0,1,2,3,5,6],
            values: { lo: 4, hi: 4, mid: 4, "sorted half": "\u2014", decision: "found" } },
        ],
      },
    },
    {
      kind: "mermaid", vizId: "bsPick",
      h3: "Turning a question into a predicate",
      caption: "Every branch ends at the same template. Only the predicate changes, which is the " +
        "whole point of standardising on one implementation.",
      src: `flowchart TD
  q(["a search question"]) --> mono{"is the search space monotone?"}
  mono -- no --> nope["binary search does not apply; sort or rethink"]
  mono -- yes --> what{"what is asked?"}
  what -- "does x exist" --> ex["predicate: a[i] >= x, then check a[lo] == x"]
  what -- "first index >= x" --> lb["predicate: a[i] >= x"]
  what -- "first index > x" --> ub["predicate: a[i] > x"]
  what -- "last index <= x" --> last["upperBound(x) minus 1"]
  what -- "count of x" --> cnt["upperBound(x) minus lowerBound(x)"]
  what -- "smallest feasible answer" --> ans["predicate: feasible(candidate)"]
  ex --> tmpl["the one template: while lo < hi, mid, hi=mid or lo=mid+1"]
  lb --> tmpl
  ub --> tmpl
  last --> tmpl
  cnt --> tmpl
  ans --> tmpl`,
      wide: true,
    },
  ],

  steps: [
    "<strong>Confirm monotonicity.</strong> State the predicate and check that it never goes from " +
      "true back to false across the range.",
    "<strong>Set the half-open interval:</strong> <code>lo = 0</code>, <code>hi = n</code>. Use " +
      "<code>hi = n</code>, not <code>n - 1</code>, so \"no answer\" falls out naturally.",
    "<strong>Loop while <code>lo &lt; hi</code></strong> &mdash; strict inequality, never " +
      "<code>&le;</code> with this template.",
    "<strong>Compute <code>mid = lo + (hi - lo) / 2</code></strong> to avoid overflow.",
    "<strong>If the predicate holds at <code>mid</code>, set <code>hi = mid</code></strong>; " +
      "otherwise <code>lo = mid + 1</code>. Never <code>lo = mid</code>.",
    "<strong>Return <code>lo</code></strong>, which is the first true index or <code>n</code>.",
    "<strong>For an exact match, check afterwards:</strong> " +
      "<code>lo &lt; n && a[lo] == target</code>.",
    "<strong>Test on the three boundary cases:</strong> target below everything, above everything, " +
      "and equal to a duplicated value.",
  ],

  dryRun: {
    intro: "Lower bound for <code>5</code> in <code>[1, 3, 3, 5, 5, 5, 8, 9]</code>, then upper " +
      "bound, then the count. Note that the interval length strictly decreases every row, which is " +
      "the termination proof.",
    cols: ["Search", "lo", "hi", "mid", "a[mid]", "predicate", "new interval"],
    rows: [
      { cells: ["lower(5)", "0", "8", "4", "5", "5 &ge; 5 true", "[0, 4)"], action: "Half eliminated on the right." },
      { cells: ["lower(5)", "0", "4", "2", "3", "3 &ge; 5 false", "[3, 4)"], action: "Half eliminated on the left." },
      { cells: ["lower(5)", "3", "4", "3", "5", "5 &ge; 5 true", "[3, 3)"], action: "Loop ends: <code>lo == hi == 3</code>.", change: true },
      { cells: ["upper(5)", "0", "8", "4", "5", "5 &gt; 5 false", "[5, 8)"], action: "Strict comparison flips this branch." },
      { cells: ["upper(5)", "5", "8", "6", "8", "8 &gt; 5 true", "[5, 6)"], action: "Narrowing from the right." },
      { cells: ["upper(5)", "5", "6", "5", "5", "5 &gt; 5 false", "[6, 6)"], action: "Loop ends: <code>lo == hi == 6</code>.", change: true },
      { cells: ["count", "&mdash;", "&mdash;", "&mdash;", "&mdash;", "6 &minus; 3", "<strong>3</strong>"],
        action: "Three occurrences of 5, computed with two searches and a subtraction.", change: true },
    ],
    after: "<p>The <em>only</em> difference between the two searches is <code>&ge;</code> versus " +
      "<code>&gt;</code>. That is the payoff of the predicate framing: two classic functions " +
      "differ by one character.</p>",
  },

  code: [
    { tab: "The template", panel: "Template", file: "BinarySearchTemplate.java",
      intro: "Learn <code>firstTrue</code> and derive everything else from it. The four wrappers " +
        "below are one line each, which is the strongest argument for the approach.",
      highlight: "10-19,26,33,40,47",
      code: `import java.util.function.IntPredicate;

public class BinarySearchTemplate {

    /**
     * THE template. Returns the smallest i in [lo, hi) with pred(i) true,
     * or hi if there is none. Requires pred to be monotone: F...FT...T.
     * O(log(hi - lo)).
     */
    static int firstTrue(int lo, int hi, IntPredicate pred) {
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;      // never (lo + hi) / 2
            if (pred.test(mid)) {
                hi = mid;                      // answer is mid or earlier
            } else {
                lo = mid + 1;                  // answer is strictly after mid
            }
        }
        return lo;
    }

    /** First index with a[i] >= x. Also the insertion point. */
    static int lowerBound(int[] a, int x) {
        return firstTrue(0, a.length, i -> a[i] >= x);
    }

    /** First index with a[i] > x. */
    static int upperBound(int[] a, int x) {
        return firstTrue(0, a.length, i -> a[i] > x);
    }

    /** Index of x, or -1. */
    static int find(int[] a, int x) {
        int i = lowerBound(a, x);
        return (i < a.length && a[i] == x) ? i : -1;
    }

    /** How many elements equal x. */
    static int count(int[] a, int x) {
        return upperBound(a, x) - lowerBound(a, x);
    }

    /** Largest index with a[i] <= x, or -1 if none. */
    static int lastAtMost(int[] a, int x) {
        return upperBound(a, x) - 1;
    }

    public static void main(String[] args) {
        int[] a = {1, 3, 3, 5, 5, 5, 8, 9};
        System.out.println("lowerBound(5) = " + lowerBound(a, 5));
        System.out.println("upperBound(5) = " + upperBound(a, 5));
        System.out.println("count(5)      = " + count(a, 5));
        System.out.println("find(8)       = " + find(a, 8));
        System.out.println("find(4)       = " + find(a, 4));
        System.out.println("lastAtMost(4) = " + lastAtMost(a, 4));
        System.out.println("lowerBound(0) = " + lowerBound(a, 0));   // before everything
        System.out.println("lowerBound(99)= " + lowerBound(a, 99));  // past the end
    }
    // Output: lowerBound(5) = 3
    //         upperBound(5) = 6
    //         count(5)      = 3
    //         find(8)       = 6
    //         find(4)       = -1
    //         lastAtMost(4) = 2
    //         lowerBound(0) = 0
    //         lowerBound(99)= 8
}`,
    },
    { tab: "Rotated and bitonic", panel: "Rotated", file: "RotatedSearch.java",
      intro: "Two searches where the array is not globally sorted but a monotone predicate still " +
        "exists. The trick in both cases is comparing <code>a[mid]</code> with an endpoint rather " +
        "than with the target.",
      highlight: "10-13,29-38",
      code: `public class RotatedSearch {

    /**
     * Minimum of a rotated sorted array with distinct values. O(log n).
     * Predicate: a[mid] < a[hi] means the minimum is at mid or to its left.
     */
    static int findMin(int[] a) {
        int lo = 0, hi = a.length - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] < a[hi]) {
                hi = mid;                      // right half is sorted; min is left of it
            } else {
                lo = mid + 1;                  // a[mid] > a[hi]: the drop is to the right
            }
        }
        return a[lo];
    }

    /**
     * Search a rotated sorted array for target. O(log n).
     * One half is always sorted; decide which, then test whether the target
     * lies inside that half's range.
     */
    static int search(int[] a, int target) {
        int lo = 0, hi = a.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] == target) {
                return mid;
            }
            if (a[lo] <= a[mid]) {             // left half [lo, mid] is sorted
                if (a[lo] <= target && target < a[mid]) {
                    hi = mid - 1;
                } else {
                    lo = mid + 1;
                }
            } else {                            // right half [mid, hi] is sorted
                if (a[mid] < target && target <= a[hi]) {
                    lo = mid + 1;
                } else {
                    hi = mid - 1;
                }
            }
        }
        return -1;
    }

    /** Peak of a mountain array. Predicate a[mid] > a[mid+1] is monotone. */
    static int peakIndex(int[] a) {
        int lo = 0, hi = a.length - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] > a[mid + 1]) {
                hi = mid;                      // we are past the peak (or on it)
            } else {
                lo = mid + 1;                  // still climbing
            }
        }
        return lo;
    }

    public static void main(String[] args) {
        int[] rot = {4, 5, 6, 7, 0, 1, 2};
        System.out.println("min      = " + findMin(rot));
        System.out.println("find 0   = " + search(rot, 0));
        System.out.println("find 3   = " + search(rot, 3));
        System.out.println("peak of [0,2,5,3,1] = " + peakIndex(new int[] {0, 2, 5, 3, 1}));
    }
    // Output: min      = 0
    //         find 0   = 4
    //         find 3   = -1
    //         peak of [0,2,5,3,1] = 2
}`,
    },
    { tab: "Java library", panel: "Library", file: "LibrarySearch.java",
      intro: "What the JDK gives you and where it is not enough. Knowing " +
        "<code>Arrays.binarySearch</code>'s exact return contract and the <code>TreeSet</code> " +
        "navigation methods saves real time in interviews.",
      code: `import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.TreeMap;
import java.util.TreeSet;

public class LibrarySearch {

    public static void main(String[] args) {
        int[] a = {1, 3, 3, 5, 5, 5, 8, 9};

        // Present: returns SOME matching index, unspecified which one.
        System.out.println("binarySearch(5) = " + Arrays.binarySearch(a, 5));

        // Absent: returns -(insertionPoint) - 1.
        int r = Arrays.binarySearch(a, 4);
        System.out.println("binarySearch(4) = " + r
                + ", insertionPoint = " + (-r - 1));

        // Collections.binarySearch has the same contract for Lists.
        List<Integer> list = Arrays.asList(1, 3, 3, 5, 5, 5, 8, 9);
        System.out.println("Collections.binarySearch(8) = "
                + Collections.binarySearch(list, 8));

        // TreeSet: the readable way to get bound semantics.
        TreeSet<Integer> set = new TreeSet<>(list);
        System.out.println("floor(4)   = " + set.floor(4)      // largest <= 4
                + "  ceiling(4) = " + set.ceiling(4)           // smallest >= 4
                + "  lower(5)   = " + set.lower(5)             // largest  < 5
                + "  higher(5)  = " + set.higher(5));          // smallest > 5

        // TreeMap when duplicates must be counted.
        TreeMap<Integer, Integer> freq = new TreeMap<>();
        for (int v : a) {
            freq.merge(v, 1, Integer::sum);
        }
        System.out.println("count of 5 = " + freq.get(5)
                + "  keys < 5 = " + freq.headMap(5).keySet()
                + "  keys >= 5 = " + freq.tailMap(5).keySet());

        // Searching a 2D matrix by treating it as one flat sorted array.
        int[][] m = {{1, 3, 5}, {7, 9, 11}, {13, 15, 17}};
        System.out.println("matrix contains 9  = " + searchMatrix(m, 9));
        System.out.println("matrix contains 10 = " + searchMatrix(m, 10));
    }

    /** Row-major sorted matrix: index k maps to (k / cols, k % cols). */
    static boolean searchMatrix(int[][] m, int target) {
        int rows = m.length, cols = m[0].length;
        int lo = 0, hi = rows * cols;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (m[mid / cols][mid % cols] >= target) {
                hi = mid;
            } else {
                lo = mid + 1;
            }
        }
        return lo < rows * cols && m[lo / cols][lo % cols] == target;
    }
    // Output: binarySearch(5) = 4
    //         binarySearch(4) = -4, insertionPoint = 3
    //         Collections.binarySearch(8) = 6
    //         floor(4)   = 3  ceiling(4) = 5  lower(5)   = 3  higher(5)  = 8
    //         count of 5 = 3  keys < 5 = [1, 3]  keys >= 5 = [5, 8, 9]
    //         matrix contains 9  = true
    //         matrix contains 10 = false
}`,
    },
  ],

  complexity: {
    time: "O(log n) per search",
    space: "O(1) iterative, O(log n) recursive",
    derivation: [
      "<p>Each iteration replaces the interval of length <code>L</code> with one of length at most " +
      "<code>&lceil;L/2&rceil;</code>, so the recurrence is</p>",
      "<span class=\"eq\">T(n) = T(n/2) + &Theta;(1) &nbsp;&rArr;&nbsp; T(n) = &Theta;(log n)</span>",
      "<p>by <a href=\"../00-foundations/recurrences-and-master-theorem.html\">case 2 of the " +
      "master theorem</a> with <code>c = log&#8322;1 = 0</code> and " +
      "<code>f(n) = &Theta;(n&#8304;)</code>. Exactly " +
      "<code>&lceil;log&#8322;(n+1)&rceil;</code> iterations run in the worst case.</p>",
      "<p>This is also optimal. Each comparison yields one bit of information, and distinguishing " +
      "<code>n + 1</code> possible outcomes (the <code>n</code> positions plus \"absent\") " +
      "requires <code>log&#8322;(n+1)</code> bits, so <code>&Omega;(log n)</code> comparisons are " +
      "necessary for any comparison-based search on an ordered structure.</p>",
      "<p>The practical numbers: 20 iterations at <code>n = 10&#8310;</code>, 30 at " +
      "<code>n = 10&#8313;</code>, 63 over the whole <code>long</code> range. Note that a linear " +
      "scan is often <em>faster</em> below about <code>n = 50</code>, because binary search's " +
      "unpredictable branches defeat the CPU's branch predictor while a linear scan streams " +
      "through cache perfectly.</p>",
    ],
    compare: [
      ["Linear scan", "<code>O(n)</code>", "<code>O(1)</code>", "n &lt; ~50, or unsorted data"],
      ["Binary search", "<code>O(log n)</code>", "<code>O(1)</code>", "Sorted array, the default"],
      ["<code>Arrays.binarySearch</code>", "<code>O(log n)</code>", "<code>O(1)</code>", "Unique keys only; odd return contract"],
      ["<code>TreeSet.floor</code> / <code>ceiling</code>", "<code>O(log n)</code>", "<code>O(n)</code>", "Dynamic set with ordered queries"],
      ["<code>HashSet.contains</code>", "<code>O(1)</code> expected", "<code>O(n)</code>", "Membership only, no ordering"],
      ["Interpolation search", "<code>O(log log n)</code> uniform", "<code>O(1)</code>", "Uniformly distributed numeric keys"],
      ["Sort + binary search", "<code>O(n log n + q log n)</code>", "<code>O(1)</code>", "Many queries on a static array"],
    ],
  },

  pitfalls: [
    { title: "<code>(lo + hi) / 2</code> overflow",
      bug: "With <code>lo</code> and <code>hi</code> both near <code>2&times;10&#8313;</code>, the " +
        "sum exceeds <code>int</code> and wraps negative, producing " +
        "<code>ArrayIndexOutOfBoundsException</code> or an infinite loop. This bug lived in the " +
        "JDK's own binary search for nine years.",
      fix: "<code>int mid = lo + (hi - lo) / 2;</code>. The difference always fits. This matters " +
        "in practice for <a href=\"binary-search-on-answer.html\">binary search on the answer</a>, " +
        "where the bounds are values rather than indices." },
    { title: "Infinite loop from <code>lo = mid</code>",
      bug: "Writing <code>else lo = mid;</code> instead of <code>lo = mid + 1;</code>. When " +
        "<code>hi - lo == 1</code>, <code>mid == lo</code>, so the interval never shrinks and the " +
        "loop spins forever.",
      fix: "With floor division and the half-open template, the true branch must be " +
        "<code>hi = mid</code> and the false branch must be <code>lo = mid + 1</code>. If you ever " +
        "need <code>lo = mid</code>, you must round the midpoint <em>up</em> instead &mdash; which " +
        "is why standardising on one template is worth it." },
    { title: "Mixing half-open and closed intervals",
      bug: "Initialising <code>hi = n - 1</code> but looping <code>while (lo &lt; hi)</code>. Then " +
        "the last element can never be returned, and \"target larger than everything\" gives " +
        "<code>n - 1</code> instead of <code>n</code>.",
      fix: "Half-open throughout: <code>hi = n</code>, <code>while (lo &lt; hi)</code>, return " +
        "<code>lo</code>. Pick one convention and never mix." },
    { title: "Assuming <code>Arrays.binarySearch</code> returns the first match",
      bug: "On <code>[5, 5, 5]</code> it may return index 0, 1 or 2 &mdash; the specification does " +
        "not say which. Code that computes <code>result</code> as \"the first occurrence\" is " +
        "wrong on duplicates.",
      fix: "Write your own <code>lowerBound</code>. It is five lines and its behaviour is fully " +
        "specified, including the not-found case." },
    { title: "Applying binary search to a non-monotone predicate",
      bug: "Searching for a local maximum in an arbitrary array with <code>a[mid] &gt; a[mid+1]</code>. " +
        "That predicate is not monotone unless the array is genuinely bitonic, so the search " +
        "converges to <em>a</em> local peak, which may not be the one you want.",
      fix: "Verify monotonicity explicitly. If the predicate is <code>T F T F</code>, binary " +
        "search is not applicable &mdash; consider " +
        "<a href=\"../13-greedy-and-offline/ternary-search-and-convexity.html\">ternary search</a> " +
        "for unimodal functions." },
    { title: "Forgetting the existence check after a lower bound",
      bug: "<code>return lowerBound(a, x);</code> as if it were a find. It returns an insertion " +
        "point even when <code>x</code> is absent, so callers see a plausible index for a value " +
        "that is not there.",
      fix: "<code>int i = lowerBound(a, x); return (i &lt; n && a[i] == x) ? i : -1;</code>. Both " +
        "conditions matter: the index check prevents an out-of-bounds read when " +
        "<code>x</code> exceeds everything." },
    { title: "Binary searching an unsorted array",
      bug: "Forgetting to sort, or sorting by one key and searching by another. The search " +
        "returns a plausible index that is simply wrong, and small tests often pass by luck.",
      fix: "Sort by the exact key you search on. If the array is sorted by a comparator, the " +
        "predicate must use the same comparator." },
  ],

  variants: [
    ["Binary search on the answer",
      "The search space is the set of possible answers rather than array indices, and the " +
      "predicate is a feasibility check. This is the single most valuable generalisation.",
      "lo = minAnswer, hi = maxAnswer + 1; predicate = canAchieve(mid)",
      "<a href=\"binary-search-on-answer.html\">Binary Search on Answer</a>"],
    ["Binary search on a real interval",
      "For continuous answers, iterate a fixed number of times (about 100) rather than comparing " +
      "for equality, which never terminates reliably with floating point.",
      "for (int it = 0; it < 100; it++) { double mid = (lo+hi)/2; if (ok(mid)) hi = mid; else lo = mid; }",
      "<a href=\"binary-search-on-answer.html\">Binary Search on Answer</a>"],
    ["Binary lifting (search on a tree)",
      "Jump by powers of two to find an ancestor. Same halving idea applied to tree depth rather " +
      "than array indices.",
      "for (int k = LOG-1; k >= 0; k--) if (up[k][v] != -1 && depth[up[k][v]] >= d) v = up[k][v];",
      "<a href=\"../05-trees/lca-binary-lifting.html\">LCA Binary Lifting</a>"],
    ["Parallel binary search",
      "Answer <code>q</code> monotone queries simultaneously by running all their searches in " +
      "lockstep over <code>log</code> rounds.",
      "for round in 1..log(maxAns): group queries by their current mid, process offline",
      "<a href=\"../13-greedy-and-offline/mos-algorithm.html\">Offline techniques</a>"],
    ["Exponential (galloping) search",
      "When the array is unbounded or the answer is likely near the start, double the bound until " +
      "the predicate flips, then binary search inside that range.",
      "int hi = 1; while (!pred(hi)) hi *= 2; return firstTrue(hi/2, hi, pred);",
      "Unbounded or streaming input"],
    ["Fractional cascading / descent on a segment tree",
      "Answer \"first index in [l, r] with value at least x\" in <code>O(log n)</code> by " +
      "descending the tree instead of binary searching an array.",
      "descend: if (leftChild.max >= x) go left, else go right",
      "<a href=\"../06-range-queries/segment-tree.html\">Segment Tree</a>"],
  ],

  followups: [
    ["Write binary search with no off-by-one errors. What is your approach?",
      "<p>I use a single template: find the first index where a monotone predicate is true, with a " +
      "half-open interval <code>[lo, hi)</code>. <code>lo = 0</code>, <code>hi = n</code>, loop " +
      "while <code>lo &lt; hi</code>, <code>mid = lo + (hi - lo) / 2</code>, and then " +
      "<code>hi = mid</code> on true or <code>lo = mid + 1</code> on false. It terminates because " +
      "the interval strictly shrinks, and it returns <code>n</code> when nothing satisfies the " +
      "predicate, which is exactly the not-found signal. Every other search &mdash; exact match, " +
      "upper bound, count, last-at-most &mdash; is one line on top of it.</p>"],
    ["How do you handle duplicates?",
      "<p>Two searches. <code>lowerBound(x)</code> uses the predicate <code>a[i] &ge; x</code> and " +
      "gives the first occurrence; <code>upperBound(x)</code> uses <code>a[i] &gt; x</code> and " +
      "gives one past the last. The count is the difference, and the last occurrence is " +
      "<code>upperBound(x) - 1</code>. Note that <code>Arrays.binarySearch</code> cannot do this: " +
      "it returns an unspecified matching index, which is why writing your own is worthwhile.</p>"],
    ["How does binary search work on a rotated sorted array?",
      "<p>The key observation is that at least one half is always fully sorted, and one comparison " +
      "identifies which: if <code>a[lo] &le; a[mid]</code>, the left half is sorted, otherwise the " +
      "right half is. Then test whether the target lies within that sorted half's value range; if " +
      "so recurse there, otherwise recurse in the other half. Each step still halves the interval, " +
      "so it remains <code>O(log n)</code>. With duplicates it degrades to <code>O(n)</code> worst " +
      "case, because <code>a[lo] == a[mid] == a[hi]</code> gives no information and you must " +
      "shrink by one.</p>"],
    ["What if the array is sorted but you cannot access its length?",
      "<p>Exponential search. Probe indices <code>1, 2, 4, 8, &hellip;</code> until you either go " +
      "out of bounds or find a value exceeding the target, then binary search within " +
      "<code>[bound/2, bound]</code>. Finding the bound takes <code>O(log p)</code> where " +
      "<code>p</code> is the answer's position, and the search takes another " +
      "<code>O(log p)</code>, so the total is <code>O(log p)</code> &mdash; potentially far better " +
      "than <code>O(log n)</code> when the target is near the front. This is the standard approach " +
      "for unbounded or streaming data.</p>"],
    ["Why is binary search sometimes slower than a linear scan?",
      "<p>Cache behaviour and branch prediction. A linear scan reads memory sequentially, which " +
      "the hardware prefetcher handles perfectly, and its branch is predicted correctly almost " +
      "every time. Binary search jumps unpredictably, causing a cache miss and a branch " +
      "misprediction per step. Below roughly 50&ndash;100 elements the linear scan wins in " +
      "wall-clock time despite the worse asymptotics. This is a good example of " +
      "<a href=\"../00-foundations/complexity-analysis.html\">constants mattering</a> when the " +
      "input is small.</p>"],
    ["How would you binary search a 2D sorted matrix?",
      "<p>If each row is sorted and every row starts after the previous one ends, treat it as one " +
      "flat array of length <code>rows &times; cols</code> and map index <code>k</code> to " +
      "<code>(k / cols, k % cols)</code> &mdash; a single <code>O(log(rc))</code> search. If only " +
      "rows and columns are individually sorted (LeetCode 240), that mapping is invalid; instead " +
      "start at the top-right corner and walk: move left when the value is too large, down when it " +
      "is too small. That is <code>O(r + c)</code>, which is better than the " +
      "<code>O(n<sup>1.585</sup>)</code> quadrant recursion.</p>"],
  ],

  problemsIntro: "Do LC 704 and LC 34 first to lock in the template, then LC 33 and LC 153 for the " +
    "rotated variants. The predicate framing is what makes the harder ones routine.",

  problems: [
    { name: "Binary Search", url: "https://leetcode.com/problems/binary-search/",
      badge: "lc", tag: "LC 704", level: "Easy", pattern: "The template, unadorned" },
    { name: "Search Insert Position", url: "https://leetcode.com/problems/search-insert-position/",
      badge: "lc", tag: "LC 35", level: "Easy", pattern: "Lower bound, exactly" },
    { name: "First Bad Version", url: "https://leetcode.com/problems/first-bad-version/",
      badge: "lc", tag: "LC 278", level: "Easy", pattern: "The predicate framing made explicit by the problem" },
    { name: "Find First and Last Position of Element", url: "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/",
      badge: "lc", tag: "LC 34", level: "Medium", pattern: "lowerBound and upperBound side by side" },
    { name: "Search in Rotated Sorted Array", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/",
      badge: "lc", tag: "LC 33", level: "Medium", pattern: "Identify the sorted half, then a range test" },
    { name: "Find Minimum in Rotated Sorted Array", url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/",
      badge: "lc", tag: "LC 153", level: "Medium", pattern: "Compare a[mid] with a[hi], never with a[lo]" },
    { name: "Search in Rotated Sorted Array II", url: "https://leetcode.com/problems/search-in-rotated-sorted-array-ii/",
      badge: "lc", tag: "LC 81", level: "Medium", pattern: "Duplicates force an O(n) worst case; know why" },
    { name: "Find Peak Element", url: "https://leetcode.com/problems/find-peak-element/",
      badge: "lc", tag: "LC 162", level: "Medium", pattern: "Slope predicate; any peak is acceptable" },
    { name: "Search a 2D Matrix", url: "https://leetcode.com/problems/search-a-2d-matrix/",
      badge: "lc", tag: "LC 74", level: "Medium", pattern: "Flatten to one index with / and %" },
    { name: "Search a 2D Matrix II", url: "https://leetcode.com/problems/search-a-2d-matrix-ii/",
      badge: "lc", tag: "LC 240", level: "Medium", pattern: "Flattening is invalid here; walk from the top-right" },
    { name: "Median of Two Sorted Arrays", url: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
      badge: "lc", tag: "LC 4", level: "Hard", pattern: "Binary search the partition point, not the value" },
    { name: "Find Smallest Letter Greater Than Target", url: "https://leetcode.com/problems/find-smallest-letter-greater-than-target/",
      badge: "lc", tag: "LC 744", level: "Easy", pattern: "Upper bound with a wraparound" },
    { name: "Peak Index in a Mountain Array", url: "https://leetcode.com/problems/peak-index-in-a-mountain-array/",
      badge: "lc", tag: "LC 852", level: "Medium", pattern: "Guaranteed bitonic, so the slope predicate is monotone" },
    { name: "Time Based Key-Value Store", url: "https://leetcode.com/problems/time-based-key-value-store/",
      badge: "lc", tag: "LC 981", level: "Medium", pattern: "Last-at-most on a per-key sorted timestamp list" },
    { name: "Missing Number in Arithmetic Progression", url: "https://leetcode.com/problems/missing-number-in-arithmetic-progression/",
      badge: "lc", tag: "LC 1228", level: "Easy", pattern: "Predicate on the deviation from the expected value" },
  ],

  spoilers: [
    { summary: "Hint for LC 4 &mdash; binary search the partition, not the value",
      body: "<p>Do not search for the median value. Search for how many elements of the shorter " +
        "array belong to the left half of the merged arrangement &mdash; call it <code>i</code>. " +
        "Then <code>j = (m + n + 1)/2 - i</code> is forced. A partition is correct when " +
        "<code>A[i-1] &le; B[j]</code> and <code>B[j-1] &le; A[i]</code>, and this condition is " +
        "monotone in <code>i</code>, so the template applies directly. Use " +
        "<code>Integer.MIN_VALUE</code> and <code>MAX_VALUE</code> as sentinels for the out-of-range " +
        "ends, and always binary search over the <em>shorter</em> array so the range is " +
        "<code>O(log min(m, n))</code>. Transferable lesson: <em>when the answer itself is hard to " +
        "search over, look for a structural parameter (a split point, a count, an index) that " +
        "determines it and is monotone.</em></p>" },
    { summary: "Hint for LC 81 &mdash; why duplicates cost you the logarithm",
      body: "<p>In a rotated array with duplicates, <code>a[lo] == a[mid] == a[hi]</code> is " +
        "possible &mdash; for example <code>[1,1,1,0,1]</code> &mdash; and in that situation " +
        "neither half can be identified as sorted, so no information is gained. The only safe move " +
        "is <code>lo++</code> (or <code>hi--</code>), which is <code>O(n)</code> in the worst case " +
        "when the array is nearly all equal. This is not a flaw in the implementation; it is " +
        "information-theoretic, since distinguishing the rotation point among <code>n</code> equal " +
        "values genuinely requires looking at them. General lesson: <em>binary search needs each " +
        "comparison to eliminate a constant fraction; when a comparison can be uninformative, the " +
        "worst case degrades to linear.</em></p>" },
  ],

  recap: {
    bullets: [
      "<strong>One template:</strong> half-open <code>[lo, hi)</code>, " +
        "<code>while (lo &lt; hi)</code>, <code>mid = lo + (hi - lo) / 2</code>, " +
        "<code>hi = mid</code> on true, <code>lo = mid + 1</code> on false, return <code>lo</code>.",
      "<strong>Search for a boundary, not a value.</strong> Lower bound, upper bound, count, " +
        "exact match and last-at-most are all one line on top of <code>firstTrue</code>.",
      "<strong>Monotonicity is the only requirement</strong> &mdash; sortedness is just the most " +
        "common source of it. That is what enables binary search on the answer.",
      "<strong>Three classic bugs:</strong> <code>(lo + hi) / 2</code> overflow, " +
        "<code>lo = mid</code> infinite loop, and mixing closed with half-open intervals.",
      "<strong>Rotated arrays:</strong> one half is always sorted; compare <code>a[mid]</code> " +
        "with an endpoint to find out which, then test the target's range.",
    ],
    oneliner: "lo=0, hi=n; while(lo<hi){mid=lo+(hi-lo)/2; if(pred(mid)) hi=mid; else lo=mid+1;} return lo;",
  },
},

/* ===================================== 5. binary-search-on-answer ======= */
{
  id: "binary-search-on-answer",
  difficulty: "Medium",
  readTime: "24 min",
  tagline: "When the answer is a number and the predicate \"can I do it with this budget?\" is " +
    "monotone, search the answer itself instead of constructing it.",
  tags: ["binary search", "predicate", "monotonicity", "P0"],
  prereqs: [["Binary Search Basics", "binary-search-basics.html"]],

  why: {
    paras: [
      "A large family of interview problems ask for the <em>minimum maximum</em> or " +
      "<em>maximum minimum</em>: smallest capacity that can ship all packages in <code>D</code> " +
      "days, fewest bananas-per-hour so Koko finishes before the guards return, smallest largest " +
      "sum after splitting an array into <code>k</code> parts. The construction is messy. The " +
      "check is easy: given a candidate capacity, a single greedy pass tells you whether it works.",
      "If that check is monotone &mdash; once a budget is enough, every larger budget is also " +
      "enough &mdash; then the first true budget is the answer, and you already have a " +
      "<a href=\"binary-search-basics.html\">firstTrue</a> template for it. The search space is " +
      "no longer an index range; it is the range of feasible answers, often " +
      "<code>[1, sum(a)]</code> or <code>[max(a), sum(a)]</code>.",
      "This is the single highest-leverage binary-search skill after the basic template. Google " +
      "and Meta ask it constantly because it looks like DP or greedy until you name the " +
      "predicate.",
    ],
    insight: "Do not search for the construction. Search for the <em>smallest number</em> " +
      "<code>x</code> such that a greedy/check function <code>feasible(x)</code> returns true. " +
      "The hard part is proving the check is monotone and writing it correctly; the search is " +
      "five lines you already know.",
  },

  recognise: {
    yes: [
      "\"Minimum possible maximum\" / \"maximum possible minimum\" / \"smallest capacity / speed / days\"",
      "You can check a candidate answer in linear (or <code>n log n</code>) time, but you cannot construct the optimum directly",
      "The check is monotone: if <code>x</code> works then <code>x+1</code> works (or the reverse)",
      "Split / allocate / ship / eat / cut with a budget, minimise the budget",
      "A real-valued answer with an &epsilon; tolerance (square root, min-max distance)",
    ],
    no: [
      "The check is not monotone &rarr; you cannot binary-search the answer; try ternary search, DP, or a heap",
      "You need the actual partition, not just the min-max value &rarr; still binary-search the value, then reconstruct with the same greedy",
      "The search space is an unsorted array of values &rarr; that is ordinary binary search or hashing, not this pattern",
      "You are counting constructions &rarr; DP or combinatorics",
    ],
    table: [
      ["\"smallest / minimum <em>X</em> such that \u2026 is possible\"", "Classic firstTrue over X", "Binary search on the answer"],
      ["\"largest <em>X</em> such that \u2026 is still possible\"", "lastTrue: invert the predicate or search the complement", "Same template, return lo-1"],
      ["Split array into k parts, minimise the largest sum", "feasible(cap) = \"can I split with no part exceeding cap?\"", "LC 410"],
      ["Koko / eating / shipping with a rate", "feasible(rate) = \"finishes by the deadline?\"", "LC 875 / 1011"],
      ["Minimise the max distance / wait / load", "Monotone in the distance", "Aggressive cows / LC 1552"],
      ["A real answer, |err| < 1e-6", "Same idea over doubles; loop ~80 times or while hi-lo > eps", "sqrt, min-max distance"],
      ["<strong>Confused with:</strong> ternary search",
        "Ternary search needs a <em>unimodal</em> function, not a boolean predicate",
        "<a href=\"../13-greedy-and-offline/ternary-search-and-convexity.html\">Ternary search</a>"],
    ],
    constraint: "<code>n &le; 10&#8309;</code> with a check that is <code>O(n)</code> and an " +
      "answer range of size <code>10&#8312;</code> &rarr; <code>O(n log MAX)</code> is intended. " +
      "If <code>n &le; 100</code> and the answer looks like DP, it probably is DP.",
  },

  core: {
    heading: "Core idea and the invariant",
    paras: [
      "Pick the type of the answer (usually a positive integer). Find a lower bound " +
      "<code>lo</code> that is always feasible-or-too-small (often <code>max(a)</code> or 0) and " +
      "an exclusive upper bound <code>hi</code> that is always feasible (often <code>sum(a)+1</code>). " +
      "Write <code>feasible(x)</code> so that it is false for every <code>x</code> below the " +
      "optimum and true for every <code>x</code> at or above it.",
      "Then run the half-open firstTrue template. When the loop ends, <code>lo</code> is the " +
      "smallest feasible answer. The loop invariant is identical to ordinary binary search: " +
      "everything below <code>lo</code> is known infeasible, everything at or above <code>hi</code> " +
      "is known feasible.",
    ],
    invariantTitle: "Say this out loud",
    invariant: "<p><em>\"I am binary-searching the answer <code>x</code>. " +
      "<code>feasible(x)</code> asks whether a budget of <code>x</code> is enough. That predicate " +
      "is monotone, so the first true <code>x</code> is the optimum. I keep the half-open " +
      "invariant: <code>[0, lo)</code> infeasible, <code>[hi, \u221e)</code> feasible.\"</em></p>",
    extra: [
      { kind: "key", title: "The only new work is the check",
        html: "<p>If you cannot write <code>feasible</code> in ten lines, you have not found the " +
          "right predicate yet. It is almost always a greedy scan: walk left to right, start a " +
          "new group / day / pile whenever adding the next item would exceed <code>x</code>, and " +
          "count how many groups you needed.</p>" },
      { kind: "warn", title: "Bounds must sandwich the answer",
        html: "<p>If <code>lo</code> starts above the true answer you will never find it. If " +
          "<code>hi</code> starts below every feasible value the loop returns garbage. Always " +
          "argue: \"the answer is at least <code>max(a)</code> because one item alone needs that " +
          "much, and at most <code>sum(a)</code> because one group containing everything works.\"</p>" },
    ],
  },

  visuals: [
    {
      kind: "array", vizId: "bsaScan",
      h3: "Searching the capacity, not the array",
      intro: "Split <code>[7, 2, 5, 10, 8]</code> into <code>k = 2</code> parts and minimise the " +
        "largest part sum. The cells are candidate capacities; amber is the current search " +
        "interval. <code>feasible(x)</code> is true iff we can split into at most 2 parts each " +
        "summing to at most <code>x</code>.",
      caption: "firstTrue over capacities. The array being searched is the integer line, not the input.",
      data: {
        label: "candidate capacity x",
        array: [10, 11, 12, 13, 14, 15, 16, 17, 18],
        indexLabels: [10, 11, 12, 13, 14, 15, 16, 17, 18],
        vars: ["lo", "hi", "mid", "feasible"],
        speed: 1100,
        frames: [
          { note: "Bounds: lo = max(a) = 10 (one item needs at least that), hi = sum+1 = 33, shown cropped to 10..18. mid = 14.",
            active: [4], window: [0, 8], pointers: { lo: 0, mid: 4, hi: 8 },
            values: { lo: 10, hi: 19, mid: 14, feasible: "?" } },
          { note: "feasible(14): [7,2,5] = 14, then [10] overflows, [10,8] = 18 > 14, needs 3 parts. False. Discard 10..14.",
            active: [4], dim: [0,1,2,3,4], window: [5, 8], x: [0,1,2,3,4],
            pointers: { lo: 5, hi: 8 },
            values: { lo: 15, hi: 19, mid: 14, feasible: "false" } },
          { note: "mid = 17. feasible(17): [7,2,5]=14, [10] = 10, [10,8]=18>17 so [10] then [8] \u2014 3 parts. Still false.",
            active: [7], dim: [0,1,2,3,4], window: [5, 8], x: [0,1,2,3,4],
            pointers: { lo: 5, mid: 7, hi: 8 },
            values: { lo: 15, hi: 19, mid: 17, feasible: "false" } },
          { note: "Wait \u2014 17 is still false? [7,2,5]=14 OK, next 10 OK as a new part (2 parts so far), 8 needs a third. Yes. Discard up to 17.",
            active: [7], dim: [0,1,2,3,4,5,6,7], window: [8, 8], x: [0,1,2,3,4,5,6,7],
            pointers: { lo: 8, hi: 8 },
            values: { lo: 18, hi: 19, mid: 17, feasible: "false" } },
          { note: "Interval is [18, 19). Check 18: [7,2,5]=14, [10,8]=18. Exactly 2 parts. True. hi = 18.",
            active: [8], done: [8], dim: [0,1,2,3,4,5,6,7],
            pointers: { lo: 8, hi: 8 },
            values: { lo: 18, hi: 18, mid: 18, feasible: "true" } },
          { note: "lo == hi == 18. Smallest capacity that works is 18, witnessed by [7,2,5] | [10,8].",
            best: [8], dim: [0,1,2,3,4,5,6,7],
            pointers: { lo: 8 },
            values: { lo: 18, hi: 18, mid: "\u2014", feasible: "answer" } },
        ],
      },
    },
    {
      kind: "mermaid", vizId: "bsaFlow",
      h3: "The decision flowchart",
      caption: "If you cannot name a monotone boolean predicate, this is not binary search on the answer.",
      src: `flowchart TD
  readQ["read the question as minimise x"] --> canCheck{"can I check a candidate x in almost linear time?"}
  canCheck -- no --> other["try DP, heap, or two pointers"]
  canCheck -- yes --> mono{"if x works, does x+1 also work?"}
  mono -- no --> other2["not this pattern"]
  mono -- yes --> bounds["set lo = tight lower bound, hi = exclusive proven-feasible bound"]
  bounds --> loop["firstTrue on feasible"]
  loop --> doneNode["lo is the answer"]`,
    },
  ],

  steps: [
    "<strong>Name the answer type <code>x</code></strong> &mdash; a capacity, a rate, a distance, a day count.",
    "<strong>Write <code>feasible(x)</code></strong> as a boolean: true iff a budget of <code>x</code> is enough. Prove it is monotone.",
    "<strong>Bound the search.</strong> <code>lo</code> = smallest conceivable answer (often <code>max(a)</code> or 0). <code>hi</code> = one past a proven-feasible value (often <code>sum(a)+1</code>).",
    "<strong>Run firstTrue:</strong> <code>while (lo &lt; hi) { mid = lo + (hi-lo)/2; if (feasible(mid)) hi = mid; else lo = mid + 1; }</code>",
    "<strong>Return <code>lo</code>.</strong> It is the smallest feasible <code>x</code>.",
    "<strong>If the problem wants the largest feasible <code>x</code></strong>, search the first infeasible and return <code>lo - 1</code>, or invert the predicate.",
    "<strong>Reconstruct if asked:</strong> walk the same greedy with <code>x = lo</code> and record the cuts.",
  ],

  dryRun: {
    intro: "Minimise the largest part after splitting <code>[7, 2, 5, 10, 8]</code> into 2 parts. " +
      "Highlighted rows change <code>lo</code> or <code>hi</code>.",
    cols: ["lo", "hi", "mid", "parts needed @ mid", "feasible", "new interval"],
    rows: [
      { cells: ["10", "33", "21", "2 ([7,2,5,10]=24>21 \u2192 3? wait [7,2,5]=14, [10,8]=18)", "true", "[10, 21]"],
        action: "21 works (parts [7,2,5] and [10,8]). hi = 21.", change: true },
      { cells: ["10", "21", "15", "3", "false", "[16, 21]"],
        action: "15: [7,2,5]=14, [10], [8] \u2014 3 parts. lo = 16.", change: true },
      { cells: ["16", "21", "18", "2", "true", "[16, 18]"],
        action: "18 works. hi = 18.", change: true },
      { cells: ["16", "18", "17", "3", "false", "[18, 18]"],
        action: "17 needs 3 parts. lo = 18.", change: true },
      { cells: ["18", "18", "\u2014", "\u2014", "\u2014", "done"],
        action: "Answer 18. Witness [7,2,5] | [10,8]." },
    ],
  },

  code: [
    { tab: "Brute force", panel: "Brute", file: "SplitArrayBrute.java",
      intro: "Try every capacity from max(a) to sum(a). Correct, and immediately shows the monotone structure.",
      code: `public class SplitArrayBrute {

    static boolean feasible(int[] a, int k, int cap) {
        int parts = 1, sum = 0;
        for (int v : a) {
            if (v > cap) return false;
            if (sum + v > cap) { parts++; sum = v; }
            else sum += v;
        }
        return parts <= k;
    }

    static int splitArray(int[] a, int k) {
        int lo = 0, hi = 1;
        for (int v : a) { lo = Math.max(lo, v); hi += v; }
        for (int cap = lo; cap < hi; cap++) {
            if (feasible(a, k, cap)) return cap;
        }
        return lo;
    }

    public static void main(String[] args) {
        System.out.println(splitArray(new int[] {7, 2, 5, 10, 8}, 2));
    }
    // Input : a = [7,2,5,10,8], k = 2
    // Output: 18
}` },
    { tab: "Optimal O(n log SUM)", panel: "Optimal", file: "SplitArray.java", highlight: "16-19",
      intro: "Same check, firstTrue over the capacity. The highlighted four lines are the entire search.",
      code: `public class SplitArray {

    static boolean feasible(int[] a, int k, int cap) {
        int parts = 1, sum = 0;
        for (int v : a) {
            if (sum + v > cap) { parts++; sum = v; }
            else sum += v;
        }
        return parts <= k;
    }

    static int splitArray(int[] a, int k) {
        int lo = 0, hi = 1;                 // hi exclusive
        for (int v : a) { lo = Math.max(lo, v); hi += v; }
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (feasible(a, k, mid)) hi = mid;
            else lo = mid + 1;
        }
        return lo;
    }

    public static void main(String[] args) {
        System.out.println(splitArray(new int[] {7, 2, 5, 10, 8}, 2));
    }
    // Input : a = [7,2,5,10,8], k = 2
    // Output: 18
}` },
    { tab: "Reusable template", panel: "Template", file: "BinarySearchAnswer.java",
      intro: "Parameterise only the predicate and the bounds. Koko, shipping, and split-array are three call sites of this.",
      code: `import java.util.function.IntPredicate;

public class BinarySearchAnswer {

    /** Smallest x in [lo, hi) such that pred.test(x) is true. pred must be monotone. */
    static int firstTrue(int lo, int hi, IntPredicate pred) {
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (pred.test(mid)) hi = mid;
            else lo = mid + 1;
        }
        return lo;
    }

    static int koko(int[] piles, int h) {
        int max = 0;
        for (int p : piles) max = Math.max(max, p);
        return firstTrue(1, max + 1, speed -> {
            long hours = 0;
            for (int p : piles) hours += (p + (long) speed - 1) / speed;
            return hours <= h;
        });
    }

    public static void main(String[] args) {
        System.out.println(koko(new int[] {3, 6, 7, 11}, 8));
    }
    // Input : piles = [3,6,7,11], h = 8
    // Output: 4
}` },
  ],

  complexity: {
    time: "O(n log RANGE)",
    space: "O(1)",
    derivation: [
      "<p>Each of the <code>O(log RANGE)</code> probes runs an <code>O(n)</code> scan, so</p>",
      "<span class=\"eq\">T = O(n) &middot; log&#8322;(hi &minus; lo) = O(n log RANGE)</span>",
      "<p>RANGE is typically <code>sum(a)</code> &le; <code>n &middot; max|a[i]|</code>. At " +
      "<code>n = 10&#8309;</code> and <code>max = 10&#8313;</code> that is 30 probes, about " +
      "3 &times; 10&#8310; additions &mdash; fine. The brute linear scan of the answer space is " +
      "<code>O(n &middot; RANGE)</code> and dies immediately.</p>",
    ],
    compare: [
      ["Linear scan of capacities", "O(n &middot; RANGE)", "O(1)", "RANGE tiny only"],
      ["Binary search on the answer", "O(n log RANGE)", "O(1)", "The default"],
      ["DP over splits", "O(n&sup2; k) or better", "O(nk)", "When you also need counts / reconstructions that greedy cannot give"],
      ["Heap / greedy construction", "O(n log n)", "O(n)", "When a direct greedy is provable (not always)"],
    ],
  },

  pitfalls: [
    { title: "Off-by-one in the ceiling division",
      bug: "<code>hours += piles[i] / speed;</code> truncates. Koko needs " +
        "<code>ceil(p / speed)</code> hours for a pile.",
      fix: "<code>hours += (p + (long) speed - 1) / speed;</code>. Cast to <code>long</code> first " +
        "or <code>p + speed</code> overflows." },
    { title: "Starting <code>lo</code> at 0 when 0 is not a legal answer",
      bug: "Koko with <code>speed = 0</code> divides by zero. Split-array with " +
        "<code>cap = 0</code> is meaningless if items are positive.",
      fix: "Lower bound is the tightest necessary value: <code>1</code> for a rate, " +
        "<code>max(a)</code> for a capacity." },
    { title: "Using <code>int</code> for the accumulator inside <code>feasible</code>",
      bug: "<code>int hours</code> on Koko with <code>piles[i] = 1e9</code> and " +
        "<code>speed = 1</code> overflows and the predicate flips.",
      fix: "<code>long</code> for every running sum / count inside the check." },
    { title: "Assuming feasibility is monotone without proving it",
      bug: "\"Minimise the number of groups whose XOR is 0\" is not monotone in a useful way. " +
        "Binary search returns a plausible lie.",
      fix: "Prove: if <code>x</code> works, <code>x+1</code> works, in one sentence, before you " +
        "code. If you cannot, stop." },
    { title: "<code>hi</code> not exclusive / not proven feasible",
      bug: "Initialising <code>hi = sum(a)</code> and using a closed interval, then returning " +
        "<code>lo</code> after <code>while (lo &lt; hi)</code>, can miss the case where " +
        "<code>sum(a)</code> itself is the answer.",
      fix: "Half-open: <code>hi = sum + 1</code>, which is always a feasible exclusive bound " +
        "because a single part equal to the whole array works." },
    { title: "Integer vs real search",
      bug: "Using integer binary search for a real-valued answer (minimise a distance) and " +
        "stopping when <code>lo == hi</code> &mdash; they never meet.",
      fix: "Loop a fixed 80 times, or <code>while (hi - lo &gt; 1e-7)</code>, and return " +
        "<code>(lo+hi)/2</code>. Never compare doubles with <code>==</code>." },
  ],

  variants: [
    ["Koko / shipping / magnetic force",
      "Same firstTrue, different feasible: hours-needed, days-needed, or min-distance placement",
      "return firstTrue(lo, hi, x -> check(x));",
      "<a href=\"https://leetcode.com/problems/koko-eating-bananas/\" target=\"_blank\" rel=\"noopener\">LC 875</a>"],
    ["Largest feasible (max-min)",
      "Search the first infeasible and subtract one, or invert the predicate",
      "if (!feasible(mid)) hi = mid; else lo = mid + 1; return lo - 1;",
      "<a href=\"https://leetcode.com/problems/magnetic-force-between-two-balls/\" target=\"_blank\" rel=\"noopener\">LC 1552</a>"],
    ["Real-valued",
      "Same idea over doubles, fixed iteration count",
      "for (int it = 0; it < 80; it++) { mid = (lo+hi)/2; if (ok(mid)) hi = mid; else lo = mid; }",
      "sqrt / min-max distance"],
    ["Reconstruct the split",
      "After finding x, walk the greedy once and record the cuts",
      "if (sum + v > x) { cuts.add(i); sum = v; }",
      "interview follow-up"],
  ],

  followups: [
    ["Prove that feasible is monotone for split-array.",
      "<p>If a split exists with every part &le; x, the same split has every part &le; x+1. " +
      "So the set of feasible capacities is a suffix of the integers, and the first true value " +
      "is well-defined.</p>"],
    ["Now return the actual parts, not just the min-max sum.",
      "<p>Run the same greedy with the optimal capacity: start a new part whenever adding the " +
      "next element would exceed it. Because the capacity is optimal, this uses at most k parts. " +
      "If you need exactly k, split leftover singleton parts from the right.</p>"],
    ["What if k can be as large as n?",
      "<p>Then the answer is max(a): every element is its own part. Your lower bound already " +
      "handles this; just make sure feasible returns true for cap = max(a) when k &ge; n.</p>"],
    ["Can you do it in O(n) expected time?",
      "<p>The decision tree of the search depends on the data, so you cannot skip the log in " +
      "the comparison model for an arbitrary feasible. In practice the log is 30 and is not " +
      "worth removing.</p>"],
    ["The answer is a real number and the judge uses 1e-6 absolute error.",
      "<p>Loop 80 times (2^{-80} is far smaller than 1e-6 over any reasonable range) or iterate " +
      "while hi-lo &gt; 1e-7. Returning (lo+hi)/2 is fine. Do not mix integer mid-rounding with " +
      "doubles.</p>"],
  ],

  problems: [
    { url: "https://leetcode.com/problems/koko-eating-bananas/", name: "Koko Eating Bananas",
      badge: "lc", tag: "LC 875", level: "Medium", pattern: "firstTrue on a rate" },
    { url: "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/", name: "Capacity To Ship Packages Within D Days",
      badge: "lc", tag: "LC 1011", level: "Medium", pattern: "firstTrue on a capacity" },
    { url: "https://leetcode.com/problems/split-array-largest-sum/", name: "Split Array Largest Sum",
      badge: "lc", tag: "LC 410", level: "Hard", pattern: "minimise max part sum" },
    { url: "https://leetcode.com/problems/magnetic-force-between-two-balls/", name: "Magnetic Force Between Two Balls",
      badge: "lc", tag: "LC 1552", level: "Medium", pattern: "maximise min distance" },
    { url: "https://leetcode.com/problems/kth-smallest-number-in-multiplication-table/", name: "Kth Smallest Number in Multiplication Table",
      badge: "lc", tag: "LC 668", level: "Hard", pattern: "count-how-many-leq as feasible" },
    { url: "https://leetcode.com/problems/find-k-th-smallest-pair-distance/", name: "Find K-th Smallest Pair Distance",
      badge: "lc", tag: "LC 719", level: "Hard", pattern: "sort + two pointers inside feasible" },
    { url: "https://leetcode.com/problems/minimize-max-distance-to-gas-station/", name: "Minimize Max Distance to Gas Station",
      badge: "lc", tag: "LC 774", level: "Hard", pattern: "real-valued firstTrue" },
    { url: "https://www.spoj.com/problems/AGGRCOW/", name: "Aggressive Cows",
      badge: "gfg", tag: "SPOJ", level: "Medium", pattern: "the classic max-min placement" },
    { url: "https://codeforces.com/problemset/problem/1117/C", name: "Magic Ship",
      badge: "cf", tag: "CF 1117C", level: "Hard", pattern: "firstTrue on days, vector reachability" },
    { url: "https://codeforces.com/problemset/problem/670/D2", name: "Magic Powder",
      badge: "cf", tag: "CF 670D2", level: "Medium", pattern: "firstTrue on cookies baked" },
  ],

  spoilers: [
    { summary: "Hint for LC 668 \u2014 Kth in the multiplication table",
      body: "<p>feasible(x) = \"at least k entries of the n&times;m table are &le; x\". For a " +
        "fixed row i the count is min(m, x/i). Sum over rows in O(n). firstTrue over " +
        "[1, n*m]. The k-th smallest <em>is</em> the smallest x with count(x) &ge; k.</p>" },
    { summary: "Hint for CF 1117C \u2014 Magic Ship",
      body: "<p>After t days the wind contributes a known vector W(t) (prefix sums of the " +
        "weather string, cycling). You can spend t extra moves of length 1. feasible(t) iff " +
        "manhattan(target - start - W(t)) &le; t and (t - manhattan) is even. Binary search t.</p>" },
  ],

  recap: {
    bullets: [
      "<strong>Search the answer, not the array.</strong> The input is only used inside <code>feasible</code>.",
      "<strong>Monotonicity is the licence to search.</strong> If x works, x+1 must work. Prove it.",
      "<strong>Bounds sandwich the answer:</strong> lo is necessary, hi is exclusive and proven feasible.",
      "<strong>The check is a greedy scan</strong> almost every time. If you cannot write it, you have the wrong x.",
      "<strong>Same four lines as ordinary binary search.</strong> Only the predicate changes.",
    ],
    oneliner: "while(lo<hi){mid=lo+(hi-lo)/2; if(feasible(mid)) hi=mid; else lo=mid+1;} return lo;",
  },
},

/* =========================================== 6. kth-and-selection ======= */
{
  id: "kth-and-selection",
  difficulty: "Hard",
  readTime: "22 min",
  tagline: "Find the k-th smallest element in linear expected time, or the median of two sorted " +
    "arrays in logarithmic time, by discarding half the remaining candidates each step.",
  tags: ["quickselect", "median", "binary search", "P1"],
  prereqs: [
    ["Binary Search Basics", "binary-search-basics.html"],
    ["Binary Search on the Answer", "binary-search-on-answer.html"],
  ],

  why: {
    paras: [
      "Sorting then indexing is always correct and almost always good enough: " +
      "<code>O(n log n)</code> to read <code>a[k]</code>. Selection problems exist because some " +
      "constraints are tighter, and because the <em>median of two sorted arrays</em> question is " +
      "a Google classic that sorting would turn into a merge.",
      "Quickselect is quicksort that only recurses into the side that contains rank k. Average " +
      "<code>O(n)</code>, worst-case <code>O(n&sup2;)</code> unless you add median-of-medians " +
      "or a random pivot. The two-array median is a binary search on how many elements you take " +
      "from the shorter array.",
      "Both are discard-half arguments. Once you see them that way, k-th in a sorted matrix and " +
      "k-th pair distance become the same idea with a different feasible.",
    ],
    insight: "You do not need full order to know rank k. You only need to know, for a candidate " +
      "cut, how many items lie on each side \u2014 then throw one side away.",
  },

  recognise: {
    yes: [
      "\"k-th smallest / largest\" in an unsorted array, and n is large enough that n log n is tight",
      "Median (k = n/2) of one array, or of two already-sorted arrays",
      "k-th smallest in a row-and-column-sorted matrix",
      "k-th smallest pair distance / pair sum \u2014 count-how-many-leq + binary search",
    ],
    no: [
      "You need the full sorted order afterwards &rarr; just sort",
      "k is tiny (1, 2, 3) &rarr; a heap or a few comparisons, not quickselect",
      "The array is already sorted &rarr; return a[k]",
      "You must do it in-place and worst-case linear &rarr; median-of-medians, rarely asked",
    ],
    table: [
      ["k-th of one unsorted array", "Partition around a pivot, recurse one side", "Quickselect"],
      ["Median of two sorted arrays", "Binary search the cut in the shorter array", "LC 4"],
      ["k-th in a sorted matrix", "Binary search the value, count how many \u2264 mid", "LC 378"],
      ["k largest (not the k-th only)", "Size-k heap, or quickselect then take the suffix", "LC 215"],
      ["<strong>Confused with:</strong> heap of size k",
        "O(n log k) is simpler and often fast enough; mention it first in an interview",
        "Prefer heap unless they ask for linear expected"],
    ],
    constraint: "<code>n &le; 10&#8309;</code> and \"k-th only\" &rarr; heap O(n log k) or " +
      "quickselect. Two arrays of length 1e5 already sorted &rarr; O(log(m+n)) cut search, not merge.",
  },

  core: {
    paras: [
      "Quickselect: pick a pivot, partition so everything smaller is on the left. If the pivot " +
      "lands at index k you are done. If it lands to the right, recurse left; otherwise recurse " +
      "right. Expected linear because each step throws away a constant fraction on average.",
      "Two-array median: imagine the merged array. A valid cut takes i elements from A and " +
      "(half-i) from B such that every value on the left of the cut is \u2264 every value on the " +
      "right. Binary-search i. The conditions are <code>A[i-1] \u2264 B[j]</code> and " +
      "<code>B[j-1] \u2264 A[i]</code> (with sentinels for empty sides).",
    ],
    invariant: "<p><em>After a partition at p, ranks [lo..p] live in a[lo..p] and ranks " +
      "(p+1..hi] live in a[p+1..hi]. Rank k is in exactly one of those two pieces, so I can " +
      "discard the other.</em> For two arrays: <em>I am searching the number of elements I take " +
      "from the shorter array; the cut is valid iff the two crossing inequalities hold.</em></p>",
  },

  visuals: [
    {
      kind: "array", vizId: "qsel",
      h3: "Quickselect for k = 3 (0-based) on [7, 2, 1, 6, 8, 5, 3]",
      intro: "Amber is the active range. The pivot is highlighted; after partition, the discarded half dims.",
      caption: "Each partition places one element at its final rank and discards one side.",
      data: {
        array: [7, 2, 1, 6, 8, 5, 3],
        vars: ["k", "pivot", "p", "action"],
        frames: [
          { note: "Want rank 3. Pivot = 3 (last element). Partition the whole array.",
            active: [6], window: [0, 6], values: { k: 3, pivot: 3, p: "?", action: "partition" } },
          { note: "After partition: [2,1,3,6,8,5,7]. Pivot 3 sits at index 2. k=3 is to the right.",
            window: [0, 6], best: [2], dim: [0, 1],
            values: { k: 3, pivot: 3, p: 2, action: "recurse right" } },
          { note: "Active [3..6] = [6,8,5,7]. Pivot 7. After partition: [6,5,7,8], p = 5.",
            window: [3, 6], best: [5], active: [5],
            values: { k: 3, pivot: 7, p: 5, action: "p > k, recurse left" } },
          { note: "Active [3..4] = [6,5]. Pivot 5. Partition swaps to [5,6], p = 3. p == k. Done. a[3] = 5.",
            window: [3, 4], best: [3],
            values: { k: 3, pivot: 5, p: 3, action: "found" } },
          { note: "The 4th-smallest (k=3) is 5. Sorted order would be [1,2,3,5,6,7,8]. We never sorted.",
            best: [3], done: [0,1,2,4,5,6],
            values: { k: 3, pivot: 5, p: 3, action: "answer = 5" } },
        ],
      },
    },
    {
      kind: "mermaid", vizId: "cutFig",
      h3: "A valid cut of two sorted arrays",
      caption: "i elements from A, j = half - i from B. Crossing inequalities make the cut a true median cut.",
      src: `graph LR
  Aleft["A left i elems"] --> cut["cut"]
  Bleft["B left j elems"] --> cut
  cut --> Aright["A right"]
  cut --> Bright["B right"]
  Aleft -->|"A[i-1] <= B[j]"| Bright
  Bleft -->|"B[j-1] <= A[i]"| Aright`,
    },
  ],

  steps: [
    "<strong>Quickselect.</strong> Pick a pivot (random or last). Partition <code>[lo, hi]</code> so the pivot sits at <code>p</code>.",
    "<strong>If <code>p == k</code></strong> return <code>a[p]</code>. If <code>k &lt; p</code> set <code>hi = p-1</code>, else <code>lo = p+1</code>. Repeat.",
    "<strong>Two-array median.</strong> Ensure A is the shorter. Binary-search i = how many to take from A.",
    "<strong>j = half - i</strong> where half = (m+n+1)/2 (left side is the larger half when the total is odd).",
    "<strong>If Aleft &gt; Bright</strong> i is too big; if Bleft &gt; Aright, i is too small. Otherwise the cut is valid.",
    "<strong>Odd total:</strong> answer is max(Aleft, Bleft). <strong>Even:</strong> average of that and min(Aright, Bright).",
    "<strong>Use sentinels</strong> \u00b1\u221e when a side is empty so the comparisons stay uniform.",
  ],

  dryRun: {
    intro: "Quickselect for rank k = 3 on <code>[7, 2, 1, 6, 8, 5, 3]</code>, pivot = last element each time.",
    cols: ["lo", "hi", "pivot", "p", "a after partition", "decision"],
    rows: [
      { cells: ["0", "6", "3", "2", "[2,1,3,6,8,5,7]", "p < k, lo = 3"], change: true, action: "Discard the left side." },
      { cells: ["3", "6", "7", "5", "[2,1,3,6,5,7,8]", "p > k, hi = 4"], change: true, action: "Discard 7 and 8." },
      { cells: ["3", "4", "5", "3", "[2,1,3,5,6,7,8]", "p == k"], change: true, action: "a[3] = 5 is the answer." },
    ],
  },

  code: [
    { tab: "Sort (brute)", panel: "Brute", file: "KthSort.java",
      intro: "Always mention this first. For n \u2264 1e5 it is the right answer unless they ask for linear.",
      code: `import java.util.Arrays;

public class KthSort {
    static int kth(int[] a, int k) {
        int[] b = a.clone();
        Arrays.sort(b);
        return b[k];
    }
    public static void main(String[] args) {
        System.out.println(kth(new int[] {7, 2, 1, 6, 8, 5, 3}, 3));
    }
    // Input : [7,2,1,6,8,5,3], k = 3 (0-based)
    // Output: 5
}` },
    { tab: "Quickselect O(n) expected", panel: "Optimal", file: "Quickselect.java", highlight: "18-22",
      code: `import java.util.Random;

public class Quickselect {
    static final Random R = new Random();

    static int kth(int[] a, int k) {
        int lo = 0, hi = a.length - 1;
        while (lo <= hi) {
            int p = partition(a, lo, hi, lo + R.nextInt(hi - lo + 1));
            if (p == k) return a[p];
            if (k < p) hi = p - 1;
            else lo = p + 1;
        }
        throw new IllegalArgumentException();
    }

    static int partition(int[] a, int lo, int hi, int pi) {
        int pivot = a[pi];
        swap(a, pi, hi);
        int store = lo;
        for (int i = lo; i < hi; i++) if (a[i] < pivot) swap(a, store++, i);
        swap(a, store, hi);
        return store;
    }

    static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }

    public static void main(String[] args) {
        System.out.println(kth(new int[] {7, 2, 1, 6, 8, 5, 3}, 3));
    }
    // Input : [7,2,1,6,8,5,3], k = 3
    // Output: 5
}` },
    { tab: "Median of two sorted", panel: "Template", file: "MedianTwo.java",
      intro: "The O(log(m+n)) cut search. Always binary-search the shorter array.",
      code: `public class MedianTwo {
    static double findMedianSortedArrays(int[] A, int[] B) {
        if (A.length > B.length) return findMedianSortedArrays(B, A);
        int m = A.length, n = B.length;
        int lo = 0, hi = m, half = (m + n + 1) / 2;
        while (lo <= hi) {
            int i = lo + (hi - lo) / 2;
            int j = half - i;
            int Aleft  = (i == 0) ? Integer.MIN_VALUE : A[i - 1];
            int Aright = (i == m) ? Integer.MAX_VALUE : A[i];
            int Bleft  = (j == 0) ? Integer.MIN_VALUE : B[j - 1];
            int Bright = (j == n) ? Integer.MAX_VALUE : B[j];
            if (Aleft > Bright) hi = i - 1;
            else if (Bleft > Aright) lo = i + 1;
            else {
                int leftMax = Math.max(Aleft, Bleft);
                if (((m + n) & 1) == 1) return leftMax;
                return (leftMax + Math.min(Aright, Bright)) / 2.0;
            }
        }
        throw new IllegalArgumentException();
    }
    public static void main(String[] args) {
        System.out.println(findMedianSortedArrays(new int[] {1, 3}, new int[] {2}));
        System.out.println(findMedianSortedArrays(new int[] {1, 2}, new int[] {3, 4}));
    }
    // Input : [1,3]+[2] then [1,2]+[3,4]
    // Output: 2.0
    //         2.5
}` },
  ],

  complexity: {
    time: "Quickselect O(n) expected / O(n\u00b2) worst; two-array median O(log min(m,n))",
    space: "O(1) iterative",
    derivation: [
      "<p>Quickselect: a random pivot leaves expected half the work, so " +
      "<code>T(n) = T(n/2) + O(n) = O(n)</code>. Adversarial pivots give the full quicksort " +
      "recurrence <code>T(n) = T(n-1) + O(n) = O(n&sup2;)</code>. Randomise the pivot.</p>",
      "<p>Two-array median: the search space is the shorter length, halved each step, and each " +
      "step is O(1) comparisons, so <code>O(log min(m,n))</code>.</p>",
    ],
    compare: [
      ["Sort + index", "O(n log n)", "O(n)", "Default; mention first"],
      ["Size-k heap", "O(n log k)", "O(k)", "k-largest, simpler than quickselect"],
      ["Quickselect", "O(n) expected", "O(1)", "When they want linear"],
      ["Median of medians", "O(n) worst-case", "O(log n)", "Almost never asked to implement"],
      ["Two-array cut search", "O(log min(m,n))", "O(1)", "LC 4"],
      ["Value-binary-search + count", "O(n log RANGE)", "O(1)", "k-th in a sorted matrix"],
    ],
  },

  pitfalls: [
    { title: "k is 1-based in the problem and 0-based in your code",
      bug: "LC 215 asks for the k-th <em>largest</em>, which is rank <code>n-k</code> in 0-based ascending order.",
      fix: "Convert once at the top: <code>int rank = a.length - k;</code> for k-th largest, and never touch k again." },
    { title: "Worst-case quadratic on sorted input",
      bug: "Always pivoting on <code>a[hi]</code> of an already-sorted array degenerates.",
      fix: "Swap a random index into the pivot slot. In an interview, say this out loud." },
    { title: "Off-by-one on empty sides of the two-array cut",
      bug: "Accessing <code>A[i-1]</code> when <code>i == 0</code>.",
      fix: "Sentinels: empty left is MIN_VALUE, empty right is MAX_VALUE." },
    { title: "Averaging two ints for the even case",
      bug: "<code>(leftMax + rightMin) / 2</code> truncates and can overflow.",
      fix: "<code>(leftMax + (double) rightMin) / 2.0</code> or <code>/ 2.0</code> with a long cast." },
    { title: "Mutating the caller's array",
      bug: "In-place quickselect reorders <code>a</code>. Tests that reuse the array then fail.",
      fix: "Clone if the caller still needs the original, or document the mutation." },
    { title: "Duplicate-heavy arrays and <code>&lt;</code> vs <code>&le;</code> in partition",
      bug: "A partition that sends equals to one side unbalances on all-equal input.",
      fix: "3-way partition (Dutch flag) around the pivot, then check whether k falls in the equal block." },
  ],

  variants: [
    ["k largest, not k-th", "Quickselect to rank n-k, then the suffix; or a min-heap of size k",
      "return Arrays.copyOfRange(a, n-k, n);",
      "<a href=\"https://leetcode.com/problems/kth-largest-element-in-an-array/\" target=\"_blank\" rel=\"noopener\">LC 215</a>"],
    ["k-th in a sorted matrix", "Binary search the value; count how many entries \u2264 mid with a staircase walk",
      "while (countLessEq(mid) < k) lo = mid+1;",
      "<a href=\"https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/\" target=\"_blank\" rel=\"noopener\">LC 378</a>"],
    ["Median of a data stream", "Two heaps, not quickselect \u2014 see heaps page",
      "lo.peek() / average of lo.peek() and hi.peek()",
      "<a href=\"https://leetcode.com/problems/find-median-from-data-stream/\" target=\"_blank\" rel=\"noopener\">LC 295</a>"],
  ],

  followups: [
    ["Why is the expected time linear?",
      "<p>A random pivot's rank is uniform. The expected remaining size is the average of " +
      "0,1,\u2026,n-1 which is n/2, and T(n) = T(n/2)+O(n) solves to O(n). More carefully the " +
      "constant is 4n or so, not n.</p>"],
    ["Can you make it worst-case linear?",
      "<p>Median-of-medians picks a pivot guaranteed to be in the 30th\u201370th percentile, so " +
      "you discard at least 30% each time. The recurrence is T(n)=T(n/5)+T(7n/10)+O(n)=O(n). " +
      "Nobody wants you to code it in an interview; naming it is enough.</p>"],
    ["Generalise LC 4 to the k-th of two sorted arrays.",
      "<p>The same cut search with half = k (1-based) instead of (m+n+1)/2. Return max(Aleft, Bleft). " +
      "This is how you also solve \"k-th of n sorted arrays\" with a heap or a binary search on value.</p>"],
    ["The matrix is sorted by rows only, not columns.",
      "<p>You lose the staircase count. Heap the heads of each row (O(k log n)) or binary-search " +
      "the value and binary-search each row (O(n log RANGE log n)).</p>"],
    ["Must not mutate the array and must be O(1) extra memory.",
      "<p>You cannot quickselect. Heap of size k uses O(k). For k-th of one array under these " +
      "constraints you are stuck with sorting if you cannot overwrite, unless you are allowed " +
      "O(n) extra to copy.</p>"],
  ],

  problems: [
    { url: "https://leetcode.com/problems/kth-largest-element-in-an-array/", name: "Kth Largest Element in an Array",
      badge: "lc", tag: "LC 215", level: "Medium", pattern: "quickselect or size-k heap" },
    { url: "https://leetcode.com/problems/median-of-two-sorted-arrays/", name: "Median of Two Sorted Arrays",
      badge: "lc", tag: "LC 4", level: "Hard", pattern: "cut search on the shorter array" },
    { url: "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/", name: "Kth Smallest in a Sorted Matrix",
      badge: "lc", tag: "LC 378", level: "Medium", pattern: "value binary search + count" },
    { url: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/", name: "Kth Smallest in a BST",
      badge: "lc", tag: "LC 230", level: "Medium", pattern: "inorder, not array selection" },
    { url: "https://leetcode.com/problems/find-k-th-smallest-pair-distance/", name: "Find K-th Smallest Pair Distance",
      badge: "lc", tag: "LC 719", level: "Hard", pattern: "sort + count pairs \u2264 mid" },
    { url: "https://leetcode.com/problems/k-th-smallest-prime-fraction/", name: "K-th Smallest Prime Fraction",
      badge: "lc", tag: "LC 786", level: "Hard", pattern: "binary search a real + count" },
    { url: "https://leetcode.com/problems/find-median-from-data-stream/", name: "Find Median from Data Stream",
      badge: "lc", tag: "LC 295", level: "Hard", pattern: "two heaps" },
    { url: "https://codeforces.com/problemset/problem/448/D", name: "Multiplication Table",
      badge: "cf", tag: "CF 448D", level: "Medium", pattern: "k-th in n\u00d7n product table" },
    { url: "https://codeforces.com/problemset/problem/812/C", name: "Sagheer and Nubian Market",
      badge: "cf", tag: "CF 812C", level: "Medium", pattern: "binary search k, then select/sort costs" },
    { url: "https://www.geeksforgeeks.org/problems/kth-element-in-matrix/1", name: "Kth element in Matrix",
      badge: "gfg", tag: "GfG", level: "Medium", pattern: "same as LC 378" },
  ],

  spoilers: [
    { summary: "Hint for LC 4 \u2014 Median of two sorted arrays",
      body: "<p>Always binary-search the shorter array. i elements from A, j = half-i from B. " +
        "The cut is valid when A[i-1] \u2264 B[j] and B[j-1] \u2264 A[i]. Empty sides are \u00b1\u221e. " +
        "Odd \u2192 max(lefts); even \u2192 average of max(lefts) and min(rights).</p>" },
    { summary: "Hint for LC 378 \u2014 Kth in a sorted matrix",
      body: "<p>Binary-search the <em>value</em>, not an index. Count how many entries are \u2264 mid " +
        "by walking from the bottom-left (or top-right) in O(n). firstTrue for count \u2265 k.</p>" },
  ],

  recap: {
    bullets: [
      "<strong>Full sort is the default.</strong> Reach for selection only when they ask for linear or the two-array log.",
      "<strong>Quickselect = quicksort that discards one side.</strong> Randomise the pivot.",
      "<strong>k-th largest is rank n-k</strong> in 0-based ascending order. Convert once.",
      "<strong>Two-array median is a cut search</strong> on how many you take from the shorter array.",
      "<strong>k-th in a matrix is binary search on the value</strong> plus a linear count.",
    ],
    oneliner: "p=partition(a,lo,hi); if(p==k)return a[p]; else if(k<p)hi=p-1; else lo=p+1;",
  },
},

];

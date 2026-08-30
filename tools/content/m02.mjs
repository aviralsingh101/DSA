/* Module 02 — Sorting, Hashing, Bits & Matrix */

export const topics = [

/* ==================================== 1. sorting-and-comparators ======== */
{
  id: "sorting-and-comparators",
  difficulty: "Medium",
  readTime: "24 min",
  tagline: "The comparison you pass to <code>sort</code> <em>is</em> the algorithm &mdash; " +
    "stability, overflow, and multi-key order are the three things Google actually probes.",
  tags: ["sorting", "comparator", "stability", "P0"],
  prereqs: [
    ["Java for DSA", "../00-foundations/java-for-dsa.html"],
    ["Complexity Analysis", "../00-foundations/complexity-analysis.html"],
  ],

  why: {
    paras: [
      "Almost every array problem that is not a linear scan starts with a sort. The sort itself " +
      "is free in interview-time &mdash; <code>O(n log n)</code> is the default budget &mdash; " +
      "so the skill is not implementing quicksort, it is <em>deciding the order</em>. A wrong " +
      "comparator silently produces a plausible permutation, which is worse than a crash.",
      "Three questions separate a working sort from a correct one. Is the order total (every pair " +
      "comparable, and <code>compare(a,b)</code> agreeing with <code>equals</code>)? Is it stable, " +
      "so equal keys keep their input order? And does the comparator overflow, so that " +
      "<code>Integer.MAX_VALUE</code> compares as smaller than <code>Integer.MIN_VALUE</code>?",
      "Google-level follow-ups then stack keys: sort by start, then by end, then by id. Once you " +
      "can write that comparator without thinking, interval sweep, reconstruct-queue, and " +
      "custom-order strings all collapse to the same four lines.",
    ],
    insight: "Sorting is a comparison problem, not a rearrangement problem. Name the order " +
      "first &mdash; including what happens on ties &mdash; then hand that function to " +
      "<code>Arrays.sort</code>. The rearrangement is TimSort's job.",
  },

  recognise: {
    yes: [
      "\"Return them in order of X, breaking ties by Y\"",
      "A greedy that needs items processed by a key (start time, height, frequency)",
      "You are about to scan an array and the scan is only correct if it is sorted",
      "Reconstruct a sequence from a partial order (queue by height, reconstruct itinerary)",
      "The constraint is <code>n &le; 10&#8309;</code> and <code>O(n log n)</code> is clearly intended",
    ],
    no: [
      "You need the k-th element only &rarr; " +
        "<a href=\"../01-arrays-and-windows/kth-and-selection.html\">quickselect / heap</a>, not a full sort",
      "Keys are integers in a tiny range &rarr; " +
        "<a href=\"non-comparison-sorts.html\">counting / radix</a> is linear",
      "The array is already sorted and you are searching &rarr; binary search",
      "You must sort in <code>O(n)</code> worst-case with arbitrary comparables &rarr; " +
        "impossible; comparison sorting is <code>&Omega;(n log n)</code>",
    ],
    table: [
      ["\"sort by X, then by Y\"", "Lexicographic multi-key order", "<code>thenComparing</code>"],
      ["\"preserve original order of equals\"", "Stability is required", "TimSort on objects, not <code>int[]</code>"],
      ["Comparator written as <code>a - b</code>", "Overflow on extreme ints", "<code>Integer.compare(a, b)</code>"],
      ["Sort indices by <code>a[i]</code>", "You need the permutation, not the values", "<code>Integer[] idx</code> + stable sort"],
      ["Custom alphabet / rank string", "Order is not natural", "Rank array, then compare ranks"],
      ["Greedy after a sort", "The sort <em>is</em> the greedy licence", "Prove: processing in this order never regrets"],
      ["<strong>Confused with:</strong> <code>PriorityQueue</code> with the same comparator",
        "A heap is a partial order; it does not produce a stable full permutation",
        "Sort when you need the whole order; heap when you need repeated extract-min"],
    ],
    constraint: "<code>n &le; 10&#8309;</code> almost always means <code>Arrays.sort</code>. " +
      "<code>n &le; 10&#8310;</code> with 2-second Java still usually fits. If values are in " +
      "<code>[0, 10&#8310;]</code> and you need linear, see " +
      "<a href=\"non-comparison-sorts.html\">non-comparison sorts</a>.",
  },

  core: {
    heading: "Core idea and the invariant",
    paras: [
      "A comparator is a function <code>int cmp(a, b)</code> that must be a total order: " +
      "anti-symmetric, transitive, and <code>cmp(a, b) == 0</code> iff you consider them equal " +
      "for this sort. Java's TimSort will throw " +
      "<code>IllegalArgumentException: Comparison method violates its general contract!</code> " +
      "if you break transitivity on a large enough input &mdash; usually from an overflow bug " +
      "that only fires on a few pairs.",
      "Java splits the world in two. <code>Arrays.sort(int[])</code> is Dual-Pivot Quicksort: " +
      "<em>not stable</em>, fine because ints have no identity. <code>Arrays.sort(Object[])</code> " +
      "is TimSort: stable. If you need stability, sort boxed values, or sort indices " +
      "(<code>Integer[]</code>) by <code>a[i]</code>. Never sort a primitive array and expect " +
      "equal keys to keep their seats.",
      "Multi-key order is lexicographic: compare key 0, and only if it ties, compare key 1. " +
      "Write it as a chain, never as a single arithmetic mix like " +
      "<code>a[0] * N + a[1]</code> unless you have proven that cannot collide.",
    ],
    invariantTitle: "The interview sentence",
    invariant: "<p><em>I am defining a total order. Equal keys compare as 0, the order is " +
      "transitive, and I never subtract ints to compare them.</em> If two items should stay in " +
      "input order when their keys match, I sort objects (TimSort) or I sort indices, not " +
      "<code>int[]</code>.</p>",
    extra: [
      { kind: "warn", title: "<code>a - b</code> is not a comparator",
        html: "<p><code>Integer.MAX_VALUE - Integer.MIN_VALUE</code> overflows to " +
          "<code>-1</code>, so the comparator reports <code>MAX_VALUE &lt; MIN_VALUE</code>. " +
          "TimSort then sees a cycle and either mis-sorts or throws. Always " +
          "<code>Integer.compare(a, b)</code> or <code>Long.compare</code>. The same trap exists " +
          "for <code>long</code> subtraction when values exceed 2<sup>63</sup>.</p>" },
      { kind: "tip", title: "Chain, don't mix",
        html: "<p><code>Comparator.comparingInt((int[] x) -&gt; x[0]).thenComparingInt(x -&gt; x[1])</code> " +
          "is the whole multi-key pattern. Descending is " +
          "<code>.reversed()</code> on that key only, not on the whole comparator unless you " +
          "want every key flipped.</p>" },
      { kind: "key", title: "Stability is a property of the algorithm, not the comparator",
        html: "<p>A comparator that returns 0 for equal keys <em>allows</em> stability; only a " +
          "stable algorithm <em>provides</em> it. If you need \"sort by score, keep original " +
          "order of ties\", you need TimSort plus a comparator that returns 0 on equal scores. " +
          "Adding the original index as a last key is the portable way to force stability on " +
          "any sort.</p>" },
    ],
  },

  visuals: [
    {
      kind: "array", vizId: "sortStab",
      h3: "Stability: why TimSort keeps equal keys in input order",
      intro: "Five records keyed by the digit, tagged <code>a/b/c</code> so you can see identity. " +
        "A stable sort must emit <code>5a</code> before <code>5b</code> before <code>5c</code>.",
      caption: "Insertion into a growing sorted prefix. Equal keys are inserted <em>after</em> " +
        "existing equals, which is what stability looks like on a tape.",
      data: {
        label: "records (digit = sort key)",
        array: ["5a", "3", "5b", "1", "5c"],
        indexLabels: [0, 1, 2, 3, 4],
        vars: ["i", "key", "insert at"],
        speed: 900,
        frames: [
          { note: "Start. Sorted prefix is empty. We will grow it from the left like insertion sort (TimSort's run-building step).",
            active: [0], dim: [1, 2, 3, 4],
            values: { i: 0, key: "5a", "insert at": 0 } },
          { note: "i = 1, key 3. 3 < 5, so 3 is inserted before 5a. Prefix [3, 5a].",
            arr: ["3", "5a", "5b", "1", "5c"], active: [0], window: [0, 1], dim: [2, 3, 4],
            values: { i: 1, key: "3", "insert at": 0 } },
          { note: "i = 2, key 5b. 5 == 5, and we insert AFTER existing equals. 5b sits after 5a. This is stability.",
            arr: ["3", "5a", "5b", "1", "5c"], active: [2], window: [0, 2], dim: [3, 4],
            values: { i: 2, key: "5b", "insert at": 2 } },
          { note: "i = 3, key 1. 1 is smallest so far, inserted at front. Prefix [1, 3, 5a, 5b].",
            arr: ["1", "3", "5a", "5b", "5c"], active: [0], window: [0, 3], dim: [4],
            values: { i: 3, key: "1", "insert at": 0 } },
          { note: "i = 4, key 5c. Walk past 1 and 3; 5 == 5, insert AFTER 5a and 5b. 5c is last among the 5s.",
            arr: ["1", "3", "5a", "5b", "5c"], active: [4], window: [0, 4],
            values: { i: 4, key: "5c", "insert at": 4 } },
          { note: "Done. The three 5s are in input order: a, then b, then c. Dual-pivot quicksort on primitives would be free to emit 5c, 5a, 5b.",
            done: [0, 1, 2, 3, 4],
            values: { i: "done", key: "\u2014", "insert at": "\u2014" } },
          { note: "Interview takeaway: Arrays.sort(Object[]) is this picture. Arrays.sort(int[]) is not. If identity matters, box or sort indices.",
            best: [2, 3, 4], done: [0, 1],
            values: { i: "done", key: "5s stable", "insert at": "a,b,c" } },
        ],
      },
    },
    {
      kind: "array", vizId: "sortKeys",
      h3: "Multi-key sort: first by x[0], then by x[1]",
      intro: "Pairs <code>[[2,3],[1,4],[1,2],[2,1]]</code> laid out as first keys, then we look " +
        "at the second key only inside a tied group.",
      caption: "Lexicographic order: sort by column 0, and only where that ties, sort those " +
        "adjacent equals by column 1.",
      data: {
        label: "first key of each pair",
        array: [2, 1, 1, 2],
        indexLabels: ["(2,3)", "(1,4)", "(1,2)", "(2,1)"],
        vars: ["pass", "cmp"],
        speed: 950,
        frames: [
          { note: "Unsorted. Two items with first key 1, two with first key 2.",
            dim: [], values: { pass: "start", cmp: "\u2014" } },
          { note: "Sort by first key. The two 1s come first, the two 2s last. Relative order of equals is not yet constrained.",
            arr: [1, 1, 2, 2], window: [0, 1],
            values: { pass: "key 0", cmp: "Integer.compare(x[0], y[0])" } },
          { note: "Inside the 1-group, compare second keys: 4 vs 2. 2 is smaller, so (1,2) before (1,4).",
            arr: [1, 1, 2, 2], active: [0, 1], window: [0, 1],
            values: { pass: "key 1 on 1s", cmp: "(1,2) before (1,4)" } },
          { note: "Inside the 2-group: 3 vs 1. (2,1) before (2,3).",
            arr: [1, 1, 2, 2], active: [2, 3], window: [2, 3],
            values: { pass: "key 1 on 2s", cmp: "(2,1) before (2,3)" } },
          { note: "Final permutation of pairs: (1,2), (1,4), (2,1), (2,3). One comparator chain produced this.",
            done: [0, 1, 2, 3],
            values: { pass: "done", cmp: "thenComparing" } },
          { note: "If you had sorted by x[0]*10 + x[1] it works on this sample and explodes the moment a key is 10 or more. Never encode multi-key in arithmetic unless the ranges are proven disjoint.",
            x: [0, 1, 2, 3],
            values: { pass: "trap", cmp: "do not mix keys arithmetically" } },
        ],
      },
    },
    {
      kind: "mermaid", vizId: "sortFlow",
      h3: "Which sort / comparator to reach for",
      caption: "Start from the question you actually need answered. Full order, k-th, or linear " +
        "on a small alphabet are three different tools.",
      src: `flowchart TD
  need["what do I actually need?"] --> full{"full order?"}
  full -- no --> kth{"k-th only?"}
  kth -- yes --> select["quickselect or size-k heap"]
  kth -- no --> full
  full -- yes --> tiny{"tiny integer range?"}
  tiny -- yes --> count["counting or radix sort"]
  tiny -- no --> obj{"identity or stability needed?"}
  obj -- yes --> tim["Arrays.sort on objects or Integer indices"]
  obj -- no --> prim["Arrays.sort on int array"]
  tim --> cmp["Integer.compare then thenComparing"]
  prim --> cmp`,
    },
  ],

  steps: [
    "<strong>Name the keys in priority order</strong> and what a tie means (input order vs don't-care).",
    "<strong>Pick the carrier.</strong> <code>int[]</code> if values only; <code>Integer[]</code> indices or <code>int[][]</code> if you need identity or extra fields.",
    "<strong>Write the comparator with <code>Integer.compare</code></strong> / <code>Long.compare</code>, never subtraction.",
    "<strong>Chain extra keys</strong> with <code>thenComparingInt</code> (or a second <code>if (c != 0) return c;</code>).",
    "<strong>Reverse only the keys that should be descending</strong> &mdash; typically one of them, not all.",
    "<strong>Call <code>Arrays.sort</code></strong> (or <code>list.sort</code>). Do not hand-roll n log n unless asked.",
    "<strong>If you need the permutation</strong>, sort indices, then apply them. Keep the original array intact.",
    "<strong>Sanity-check transitivity</strong> on a triple that includes <code>MIN_VALUE</code> / <code>MAX_VALUE</code> if keys are raw ints.",
  ],

  dryRun: {
    intro: "Sorting <code>[[2,3],[1,4],[1,2],[2,1]]</code> by first key ascending, then second " +
      "key ascending. Highlighted rows are comparator decisions that move an item.",
    cols: ["i", "j", "cmp key0", "cmp key1", "result", "array"],
    rows: [
      { cells: ["0", "1", "2 vs 1 \u2192 +", "\u2014", "(1,4) before (2,3)", "[[1,4],[2,3],[1,2],[2,1]]"],
        action: "First key decides. Second key not consulted.", change: true },
      { cells: ["1", "2", "2 vs 1 \u2192 +", "\u2014", "(1,2) before (2,3)", "[[1,4],[1,2],[2,3],[2,1]]"],
        action: "Again first key.", change: true },
      { cells: ["0", "1", "1 vs 1 \u2192 0", "4 vs 2 \u2192 +", "(1,2) before (1,4)", "[[1,2],[1,4],[2,3],[2,1]]"],
        action: "Tie on key 0, so key 1 fires.", change: true },
      { cells: ["2", "3", "2 vs 2 \u2192 0", "3 vs 1 \u2192 +", "(2,1) before (2,3)", "[[1,2],[1,4],[2,1],[2,3]]"],
        action: "Same pattern on the 2-group.", change: true },
      { cells: ["\u2014", "\u2014", "\u2014", "\u2014", "done", "[[1,2],[1,4],[2,1],[2,3]]"],
        action: "Lexicographic order. One chain, two keys." },
    ],
  },

  code: [
    { tab: "Brute", panel: "Brute", file: "SortBrute.java",
      intro: "Insertion sort with the same comparator you will later pass to " +
        "<code>Arrays.sort</code>. Correct, quadratic, and the comparator is already the real work.",
      code: `public class SortBrute {

    static int cmp(int[] x, int[] y) {
        int c = Integer.compare(x[0], y[0]);
        return c != 0 ? c : Integer.compare(x[1], y[1]);
    }

    static void sortByTwoKeys(int[][] a) {
        for (int i = 1; i < a.length; i++) {
            int[] cur = a[i];
            int j = i - 1;
            while (j >= 0 && cmp(a[j], cur) > 0) {
                a[j + 1] = a[j];
                j--;
            }
            a[j + 1] = cur;
        }
    }

    public static void main(String[] args) {
        int[][] a = {{2, 3}, {1, 4}, {1, 2}, {2, 1}};
        sortByTwoKeys(a);
        for (int[] p : a) {
            System.out.println(p[0] + " " + p[1]);
        }
    }
    // Input : [[2,3],[1,4],[1,2],[2,1]]
    // Output: 1 2
    //         1 4
    //         2 1
    //         2 3
}` },
    { tab: "Optimal", panel: "Optimal", file: "SortByKeys.java", highlight: "7-11",
      intro: "The highlighted chain is the entire algorithm. TimSort on <code>int[][]</code> is " +
        "stable, so equal pairs keep input order.",
      code: `import java.util.Arrays;
import java.util.Comparator;

public class SortByKeys {

    static void sortByTwoKeys(int[][] a) {
        Arrays.sort(a, Comparator
                .comparingInt((int[] x) -> x[0])
                .thenComparingInt(x -> x[1]));
    }

    /** Overflow-safe. Never write (a - b). */
    static int safeCmp(int a, int b) {
        return Integer.compare(a, b);
    }

    public static void main(String[] args) {
        int[][] a = {{2, 3}, {1, 4}, {1, 2}, {2, 1}};
        sortByTwoKeys(a);
        for (int[] p : a) {
            System.out.println(p[0] + " " + p[1]);
        }
        System.out.println(safeCmp(Integer.MAX_VALUE, Integer.MIN_VALUE));
        System.out.println(Integer.MAX_VALUE - Integer.MIN_VALUE); // overflow: -1
    }
    // Input : [[2,3],[1,4],[1,2],[2,1]]
    // Output: 1 2
    //         1 4
    //         2 1
    //         2 3
    //         1
    //         -1
}` },
    { tab: "Template", panel: "Template", file: "ComparatorTemplate.java",
      intro: "Index-sort (stable permutation), descending on one key, and the overflow unit test " +
        "you should be able to recite.",
      code: `import java.util.Arrays;
import java.util.Comparator;

public class ComparatorTemplate {

    /** Stable permutation of 0..n-1 ordered by a[i] ascending. */
    static Integer[] argsort(int[] a) {
        Integer[] idx = new Integer[a.length];
        for (int i = 0; i < a.length; i++) idx[i] = i;
        Arrays.sort(idx, Comparator.comparingInt(i -> a[i]));
        return idx;
    }

    /** Height desc, then name asc. Classic "sort people" comparator. */
    static void sortPeople(String[] names, int[] heights) {
        Integer[] idx = new Integer[names.length];
        for (int i = 0; i < names.length; i++) idx[i] = i;
        Arrays.sort(idx, (i, j) -> {
            int c = Integer.compare(heights[j], heights[i]); // desc
            return c != 0 ? c : names[i].compareTo(names[j]);
        });
        String[] tmp = names.clone();
        for (int k = 0; k < idx.length; k++) names[k] = tmp[idx[k]];
    }

    public static void main(String[] args) {
        int[] a = {40, 10, 40, 20};
        System.out.println(Arrays.toString(argsort(a)));
        String[] names = {"Mary", "John", "Emma"};
        sortPeople(names, new int[] {180, 165, 170});
        System.out.println(Arrays.toString(names));
    }
    // Input : a = [40,10,40,20]; people Mary/180, John/165, Emma/170
    // Output: [1, 3, 0, 2]
    //         [Mary, Emma, John]
}` },
  ],

  complexity: {
    time: "O(n log n)",
    space: "O(n) TimSort scratch, O(1) extra if you ignore it",
    derivation: [
      "<p>Any comparison sort is <code>&Omega;(n log n)</code> in the worst case: there are " +
      "<code>n!</code> permutations and each comparison has 2 outcomes, so you need " +
      "<code>log&#8322;(n!)</code> &asymp; <code>n log n</code> comparisons. TimSort matches " +
      "that bound and is linear on already-sorted input (it detects runs).</p>",
      "<span class=\"eq\">T(n) = &Theta;(n log n) comparisons, each O(1) if the comparator is O(1)</span>",
      "<p>If your comparator itself scans a string of length <code>L</code>, multiply: " +
      "<code>O(n log n &middot; L)</code>. That is why \"largest number\" (LC 179) is not free " +
      "&mdash; each compare concatenates.</p>",
    ],
    compare: [
      ["Insertion / selection", "O(n\u00b2)", "O(1)", "n \u2264 200, or teaching the comparator"],
      ["Arrays.sort(int[]) DualPivot", "O(n log n)", "O(log n) stack", "Primitives; not stable"],
      ["Arrays.sort(Object[]) TimSort", "O(n log n)", "O(n)", "Objects; stable; the default"],
      ["Counting / radix", "O(n + K) / O(n \u00b7 D)", "O(n + K)", "Tiny alphabet, see next page"],
      ["Heap / TreeMap as you go", "O(n log n)", "O(n)", "Need extract-min interleaved with inserts"],
    ],
  },

  pitfalls: [
    { title: "Subtraction overflow in the comparator",
      bug: "<code>(a, b) -&gt; a - b</code> with <code>a = Integer.MAX_VALUE</code> and " +
        "<code>b = Integer.MIN_VALUE</code> returns <code>-1</code>, reversing the order.",
      fix: "<code>Integer.compare(a, b)</code> or <code>Long.compare</code>. Recite this in the " +
        "interview before they ask." },
    { title: "Unstable sort of primitives when identity matters",
      bug: "Sorting an <code>int[]</code> of keys, then looking up \"which original index was this\".",
      fix: "Sort <code>Integer[]</code> indices with <code>Comparator.comparingInt(i -&gt; a[i])</code>. " +
        "TimSort keeps equal keys in index order." },
    { title: "Comparator disagrees with <code>equals</code>",
      bug: "<code>compare(a,b) == 0</code> but <code>!a.equals(b)</code>, then putting them in a " +
        "<code>TreeSet</code> silently drops one.",
      fix: "For <code>sort</code> this is legal (ties). For <code>TreeSet</code> / " +
        "<code>TreeMap</code> it is not: equality must match the comparator." },
    { title: "Inconsistent transitivity from a clever formula",
      bug: "Comparing by <code>a.ratio - b.ratio</code> with doubles, or by a hash, producing cycles.",
      fix: "Compare a single integer key, or compare two fields in a fixed order. Never compare " +
        "floating ratios; compare cross-multiplied <code>long</code>s: " +
        "<code>Long.compare((long) a.p * b.q, (long) b.p * a.q)</code>." },
    { title: "<code>.reversed()</code> on the whole chain",
      bug: "You wanted height descending and name ascending; you reversed the entire comparator " +
        "and names flipped too.",
      fix: "Reverse only that key: <code>comparingInt(P::height).reversed().thenComparing(P::name)</code>." },
    { title: "Mutating objects inside <code>compare</code>",
      bug: "Logging, caching, or swapping inside the comparator. TimSort assumes a pure function " +
        "and may compare a pair more than once.",
      fix: "Comparator is a pure function of its two arguments. Precompute keys into an array." },
  ],

  variants: [
    ["Argsort / recover the permutation",
      "Sort indices, leave <code>a</code> untouched",
      "Integer[] idx; Arrays.sort(idx, Comparator.comparingInt(i -> a[i]));",
      "Needed whenever you must reconstruct"],
    ["Descending on one key",
      "Flip only that comparison",
      "Integer.compare(b.x, a.x) then a.name.compareTo(b.name)",
      "LC 2418 sort people"],
    ["Custom alphabet",
      "Map each char to a rank, compare ranks",
      "int[] rank = new int[26]; compare rank[c-'a']",
      "<a href=\"https://leetcode.com/problems/custom-sort-string/\" target=\"_blank\" rel=\"noopener\">LC 791</a>"],
    ["Sort by comparator that concatenates",
      "For largest number: cmp is (b+a) vs (a+b) as strings",
      "return (b + a).compareTo(a + b);",
      "<a href=\"https://leetcode.com/problems/largest-number/\" target=\"_blank\" rel=\"noopener\">LC 179</a>"],
  ],

  followups: [
    ["Why can <code>Arrays.sort(int[])</code> be unstable but <code>Integer[]</code> not?",
      "<p>Primitive quicksort is allowed to rearrange equal keys because they are " +
      "indistinguishable. Objects have identity (and may wrap extra fields). Java therefore " +
      "uses TimSort for objects, which is stable. If you need a stable order of primitive " +
      "keys, sort boxed indices.</p>"],
    ["Prove that comparison sorting is <code>&Omega;(n log n)</code>.",
      "<p>Decision tree: each comparison has two outcomes, there are <code>n!</code> leaves " +
      "(one per permutation), so height is at least <code>log&#8322;(n!)</code>. Stirling: " +
      "<code>log(n!) = &Theta;(n log n)</code>. This lower bound is why counting sort exists " +
      "&mdash; it is not a comparison sort.</p>"],
    ["How do you sort 10&#8310; 64-bit integers with a small constant?",
      "<p>Radix sort on 2<sup>16</sup>-sized digits, 4 passes. Comparison sort's log factor " +
      "is ~20, radix's constant is 4 passes of a counting sort. On huge n with a tight TL, " +
      "radix wins; in Java interviews, <code>Arrays.sort</code> is still the answer unless " +
      "they mention the range.</p>"],
    ["The comparator must look at a graph (\"u should come before v if there is an edge\").",
      "<p>That is not a comparator &mdash; it may be a partial order. Use topological sort. " +
      "Forcing it into <code>compare</code> breaks transitivity and TimSort will throw or " +
      "silently mis-order.</p>"],
    ["Can you make any sort stable?",
      "<p>Yes: decorate each item with its original index, and use index as the last key. " +
      "Undecorate after. This is the Schwartzian-transform version of stability and works " +
      "on heaps and quicksort too.</p>"],
  ],

  problems: [
    { url: "https://leetcode.com/problems/sort-an-array/", name: "Sort an Array",
      badge: "lc", tag: "LC 912", level: "Medium", pattern: "Library sort; they ban Arrays.sort to force merge/heap" },
    { url: "https://leetcode.com/problems/custom-sort-string/", name: "Custom Sort String",
      badge: "lc", tag: "LC 791", level: "Medium", pattern: "Rank alphabet, then sort / count" },
    { url: "https://leetcode.com/problems/sort-the-people/", name: "Sort the People",
      badge: "lc", tag: "LC 2418", level: "Easy", pattern: "Argsort by height descending" },
    { url: "https://leetcode.com/problems/largest-number/", name: "Largest Number",
      badge: "lc", tag: "LC 179", level: "Medium", pattern: "Comparator concatenates two strings" },
    { url: "https://leetcode.com/problems/reorder-data-in-log-files/", name: "Reorder Data in Log Files",
      badge: "lc", tag: "LC 937", level: "Medium", pattern: "Two-type comparator + stability on letter logs" },
    { url: "https://leetcode.com/problems/k-closest-points-to-origin/", name: "K Closest Points to Origin",
      badge: "lc", tag: "LC 973", level: "Medium", pattern: "Sort by distance, or heap / quickselect" },
    { url: "https://leetcode.com/problems/queue-reconstruction-by-height/", name: "Queue Reconstruction by Height",
      badge: "lc", tag: "LC 406", level: "Medium", pattern: "Sort height desc, k asc, insert at index k" },
    { url: "https://leetcode.com/problems/rank-teams-by-votes/", name: "Rank Teams by Votes",
      badge: "lc", tag: "LC 1366", level: "Medium", pattern: "Multi-key: count[pos] then letter" },
    { url: "https://codeforces.com/problemset/problem/489/B", name: "BerSU Ball",
      badge: "cf", tag: "CF 489B", level: "Easy", pattern: "Sort both arrays, two pointers" },
    { url: "https://codeforces.com/problemset/problem/492/B", name: "Vanya and Lanterns",
      badge: "cf", tag: "CF 492B", level: "Easy", pattern: "Sort positions, max adjacent gap" },
    { url: "https://www.geeksforgeeks.org/problems/comparator-sort/1", name: "Sort using Comparator",
      badge: "gfg", tag: "GfG", level: "Easy", pattern: "Write a Java Comparator" },
  ],

  spoilers: [
    { summary: "Hint for LC 179 \u2014 Largest Number",
      body: "<p>The order is not numeric. For two fragments a and b, a should come first iff " +
        "the string a+b is lexicographically larger than b+a. Edge case: everything is zero, " +
        "return <code>\"0\"</code> not <code>\"000\"</code>. Comparator must not overflow " +
        "because you compare strings, not ints.</p>" },
    { summary: "Hint for LC 406 \u2014 Queue Reconstruction",
      body: "<p>Sort people by height descending, then by k ascending. Insert each person at " +
        "index <code>k</code> in a list: taller people already placed are the only ones that " +
        "count for a shorter person's k, so the index is exactly the number of taller-or-equal " +
        "in front. <code>ArrayList.add(k, person)</code> is O(n), total O(n\u00b2), which is " +
        "fine for n \u2264 2000.</p>" },
  ],

  recap: {
    bullets: [
      "<strong>Name the order, then sort.</strong> The comparator is the algorithm.",
      "<strong><code>Integer.compare</code>, never <code>a - b</code>.</strong> Overflow is a real WA.",
      "<strong>Objects are stable (TimSort), primitives are not.</strong> Sort indices when identity matters.",
      "<strong>Multi-key = <code>thenComparing</code>.</strong> Reverse only the keys that should flip.",
      "<strong>Comparison sort cannot beat n log n</strong> without exploiting a small key range.",
    ],
    oneliner: "Arrays.sort(a, Comparator.comparingInt((T x)->x.k1).thenComparingInt(x->x.k2));",
  },
},

/* ===================================== 2. non-comparison-sorts ========== */
{
  id: "non-comparison-sorts",
  difficulty: "Medium",
  readTime: "22 min",
  tagline: "When keys live in a small universe you drop the log factor: counting, radix and " +
    "bucket turn sorting into indexing.",
  tags: ["counting sort", "radix", "bucket", "P1"],
  prereqs: [
    ["Sorting & Comparators", "sorting-and-comparators.html"],
    ["Constraints \u2192 Complexity", "../00-foundations/constraints-to-complexity.html"],
  ],

  why: {
    paras: [
      "The <code>&Omega;(n log n)</code> lower bound is a statement about comparison trees. The " +
      "moment you are allowed to use a key as an <em>array index</em>, you leave that model. " +
      "Counting sort, radix sort and bucket sort are the three ways of doing that, and they are " +
      "how you get linear (or expected-linear) sorting.",
      "Interviews rarely ask you to implement radix from scratch. They ask \"can you do better " +
      "than n log n?\" on Sort Colors, H-Index, Maximum Gap, or Top-K Frequent &mdash; all of " +
      "which are counting or bucket in disguise. Seeing the small universe is the whole skill.",
      "On Codeforces the same tell is a tight TL with <code>a[i] \u2264 10&#8310;</code> and " +
      "<code>n \u2264 10&#8310;</code>: comparison sort's constant plus log n can TLE in Java, " +
      "while counting the frequencies in an <code>int[MAX]</code> is one pass.",
    ],
    insight: "If the key can be an index, sorting is prefix-summing frequencies. Radix is that " +
      "idea applied one digit at a time; bucket is that idea applied to ranges instead of values.",
  },

  recognise: {
    yes: [
      "Keys are integers in a range of size O(n) or O(n + k) with k tiny (0..2 for Sort Colors)",
      "\"Sort this in linear time\" or \"O(n) extra memory is OK\"",
      "You need the k-th by frequency, and frequencies are at most n (bucket by count)",
      "Maximum gap after sorting distinct numbers (pigeonhole: the max gap is at least the average)",
      "n is 10&#8310; and a[i] is 10&#8310;, Java <code>Arrays.sort</code> is the risky option",
    ],
    no: [
      "Arbitrary comparable objects with no integer key &rarr; comparison sort, period",
      "Keys are 64-bit with full range and n is 1e5, not 1e7 &rarr; <code>Arrays.sort</code> is simpler and fast enough",
      "You need a stable sort of objects by a huge key and cannot pay O(n + K) memory",
      "The range K is 1e12 and you cannot radix by digits &rarr; comparison sort",
    ],
    table: [
      ["Values in {0, 1, 2} or a tiny enum", "Counting sort with 3 buckets", "LC 75 Dutch flag / count"],
      ["Integers in [0, K] with K = O(n)", "Count array of size K+1", "Classic counting sort"],
      ["32-bit ints, n huge", "4\u20138 passes of counting on 8/16-bit digits", "LSD radix"],
      ["n items, frequencies in [1, n]", "Bucket by frequency, scan from the back", "LC 347"],
      ["n distinct numbers, max adjacent gap", "n-1 buckets of width (max-min)/(n-1)", "LC 164"],
      ["Uniform reals in [0, 1)", "n buckets, insertion-sort each", "Textbook bucket sort"],
      ["<strong>Confused with:</strong> \"linear time sort\" of arbitrary objects",
        "Impossible in the comparison model; they must have given you a small universe",
        "Ask what the key range is"],
    ],
    constraint: "Counting sort needs <code>O(n + K)</code> memory and time. Fine when " +
      "<code>K \u2264 10&#8310;</code> and you have ~256 MB. Radix on 32-bit keys is " +
      "<code>O(n &middot; 4)</code> with base 256. If K is 1e12, count array is impossible; " +
      "radix by decimal/binary digits still works.",
  },

  core: {
    heading: "Core idea and the invariant",
    paras: [
      "Counting sort: tally <code>cnt[key]++</code>, then write keys back in order by walking " +
      "the count array. For stability, turn counts into prefix sums so <code>cnt[k]</code> is " +
      "the exclusive end position of key k, then scatter the input <em>right to left</em> into " +
      "an output array. That right-to-left pass is what makes radix's digit pass stable, and " +
      "stability is what makes radix correct.",
      "Radix sort LSD: counting-sort by the least-significant digit, then the next, and so on. " +
      "Because each pass is stable, two items that share the higher digits stay in the order " +
      "already decided by the lower digits. MSD radix / quicksort-on-digits is a different " +
      "algorithm and is not required here.",
      "Bucket sort: partition the range into m buckets, drop each item into " +
      "<code>floor((x - min) / width)</code>, sort inside buckets (usually insertion), " +
      "concatenate. Maximum-gap uses the pigeonhole principle so that the answer never lies " +
      "<em>inside</em> a bucket \u2014 you only compare adjacent occupied bucket min/max.",
    ],
    invariantTitle: "The invariant",
    invariant: "<p><em>After a stable counting pass on digit d, the array is sorted by digits " +
      "0..d.</em> For plain counting sort: <em>the output is a non-decreasing sequence whose " +
      "frequencies match the input.</em> For max-gap buckets: <em>the maximum adjacent gap is " +
      "at least the bucket width, so it cannot hide inside a bucket.</em></p>",
    extra: [
      { kind: "math", title: "Why max-gap buckets work",
        html: "<p>n distinct values in [min, max]. There are n-1 gaps between n sorted values; " +
          "the average gap is <code>(max - min) / (n - 1)</code>. Put n-1 buckets of that width " +
          "covering [min, max] (min in the first, max in the last, both removed from the " +
          "interior). n-2 interior points into n-1 buckets \u21d2 at least one bucket empty " +
          "\u21d2 the max gap is at least one bucket width, hence it is between the max of one " +
          "occupied bucket and the min of the next occupied one.</p>" },
      { kind: "tip", title: "Dutch flag is counting sort with K = 3",
        html: "<p>You can also 3-way partition in one pass (the true Dutch-flag). Counting is " +
          "two passes and simpler. In an interview, counting is the answer you give in thirty " +
          "seconds; one-pass partition is the follow-up.</p>" },
    ],
  },

  visuals: [
    {
      kind: "array", vizId: "countArr",
      h3: "Counting sort on [4, 2, 2, 8, 3, 3, 1]",
      intro: "Keys are in 1..8. Watch the count array fill, become prefix positions, then the " +
        "stable right-to-left scatter.",
      caption: "Stability comes from scattering right to left into prefix-sum slots. Radix " +
        "needs exactly this pass.",
      data: {
        label: "input a",
        array: [4, 2, 2, 8, 3, 3, 1],
        vars: ["i", "a[i]", "cnt snapshot"],
        speed: 850,
        frames: [
          { note: "Count pass starts. cnt is all zeros.",
            active: [], dim: [0, 1, 2, 3, 4, 5, 6],
            values: { i: "\u2014", "a[i]": "\u2014", "cnt snapshot": "[0,0,0,0,0,0,0,0,0]" } },
          { note: "Read 4, 2, 2. cnt[4]=1, cnt[2]=2.",
            active: [0, 1, 2], dim: [3, 4, 5, 6],
            values: { i: 2, "a[i]": 2, "cnt snapshot": "cnt[2]=2, cnt[4]=1" } },
          { note: "Finish counts: cnt[1]=1, [2]=2, [3]=2, [4]=1, [8]=1.",
            done: [0, 1, 2, 3, 4, 5, 6],
            values: { i: 6, "a[i]": 1, "cnt snapshot": "1:1 2:2 3:2 4:1 8:1" } },
          { note: "Prefix sums: cnt[k] becomes the exclusive end index of key k. Ends: 1,3,5,6,6,6,6,7.",
            dim: [0, 1, 2, 3, 4, 5, 6],
            values: { i: "pfx", "a[i]": "\u2014", "cnt snapshot": "ends 1,3,5,6,...,7" } },
          { note: "Scatter right to left. a[6]=1 goes to slot 0 (end 1, then decrement). Output[0]=1.",
            active: [6],
            values: { i: 6, "a[i]": 1, "cnt snapshot": "place 1 at out[0]" } },
          { note: "a[5]=3 placed at out[4]; a[4]=3 at out[3]. Equal 3s keep right-to-left identity, which is input order.",
            active: [4, 5],
            values: { i: 4, "a[i]": 3, "cnt snapshot": "two 3s at out[3], out[4]" } },
          { note: "Continue: 8 at out[6], 2 at out[2], 2 at out[1], 4 at out[5]. Output: [1,2,2,3,3,4,8].",
            done: [0, 1, 2, 3, 4, 5, 6],
            values: { i: "done", "a[i]": "\u2014", "cnt snapshot": "[1,2,2,3,3,4,8]" } },
          { note: "One counting pass is O(n+K). Radix repeats this for each digit, with K = the radix (256 is typical).",
            best: [0, 1, 2, 3, 4, 5, 6],
            values: { i: "done", "a[i]": "\u2014", "cnt snapshot": "stable + linear" } },
        ],
      },
    },
    {
      kind: "mermaid", vizId: "ncsFlow",
      h3: "Picking counting vs radix vs bucket",
      caption: "The constraint line tells you which of the three. If none apply, you are back to " +
        "comparison sort.",
      src: `flowchart TD
  keys["inspect the key universe"] --> tiny{"K is O(n) or tiny?"}
  tiny -- yes --> counting["counting sort, O(n + K)"]
  tiny -- no --> bits{"fixed-width integers?"}
  bits -- yes --> radix["LSD radix, O(n times digits)"]
  bits -- no --> uniform{"uniform reals / pigeonhole gap?"}
  uniform -- yes --> bucket["bucket sort / max-gap buckets"]
  uniform -- no --> cmpSort["Arrays.sort, O(n log n)"]`,
    },
  ],

  steps: [
    "<strong>Confirm the universe.</strong> If keys are not integers (or digits of integers), stop.",
    "<strong>Counting sort.</strong> Allocate <code>cnt[K+1]</code>, tally, optionally prefix-sum for stable scatter.",
    "<strong>Write back</strong> either by walking keys 0..K and emitting <code>cnt[k]</code> copies, or by the stable right-to-left scatter.",
    "<strong>Radix LSD.</strong> For digit d from 0 to D-1, counting-sort by that digit, stably. Base 256 \u21d2 4 passes on 32-bit.",
    "<strong>Bucket.</strong> Compute min/max, choose width, distribute, sort each bucket, concatenate.",
    "<strong>Max gap.</strong> n-1 buckets, store only min and max per bucket, scan adjacent occupied.",
    "<strong>Do not allocate <code>int[K]</code></strong> when K is 1e12. Digit-split first.",
  ],

  dryRun: {
    intro: "Stable counting sort of <code>[4, 2, 2, 8, 3, 3, 1]</code>. After prefix sums, " +
      "scatter from the right. Highlighted rows write an output slot.",
    cols: ["i", "a[i]", "end[a[i]] before", "place at", "output so far"],
    rows: [
      { cells: ["6", "1", "1", "0", "[1,_,_,_,_,_,_]"],
        action: "cnt[1] was 1, prefix end 1, decrement to 0.", change: true },
      { cells: ["5", "3", "5", "4", "[1,_,_,_,3,_,_]"],
        action: "Two 3s: first (rightmost in input) goes to the later slot.", change: true },
      { cells: ["4", "3", "4", "3", "[1,_,_,3,3,_,_]"],
        action: "Second 3. Input order of the two 3s is preserved.", change: true },
      { cells: ["3", "8", "7", "6", "[1,_,_,3,3,_,8]"],
        action: "8 is the largest key.", change: true },
      { cells: ["2", "2", "3", "2", "[1,_,2,3,3,_,8]"],
        action: "Right-hand 2 first.", change: true },
      { cells: ["1", "2", "2", "1", "[1,2,2,3,3,_,8]"],
        action: "Left-hand 2. Stability: original a[1] then a[2].", change: true },
      { cells: ["0", "4", "6", "5", "[1,2,2,3,3,4,8]"],
        action: "Done.", change: true },
    ],
  },

  code: [
    { tab: "Brute", panel: "Brute", file: "CountingBrute.java",
      intro: "Emit each key <code>cnt[k]</code> times. Fine when you do not need stability of " +
        "satellite data (the keys <em>are</em> the payload).",
      code: `import java.util.Arrays;

public class CountingBrute {

    static int[] countingSort(int[] a, int K) {
        int[] cnt = new int[K + 1];
        for (int v : a) cnt[v]++;
        int[] out = new int[a.length];
        int p = 0;
        for (int k = 0; k <= K; k++) {
            while (cnt[k]-- > 0) out[p++] = k;
        }
        return out;
    }

    public static void main(String[] args) {
        int[] a = {4, 2, 2, 8, 3, 3, 1};
        System.out.println(Arrays.toString(countingSort(a, 8)));
    }
    // Input : [4, 2, 2, 8, 3, 3, 1]
    // Output: [1, 2, 2, 3, 3, 4, 8]
}` },
    { tab: "Optimal", panel: "Optimal", file: "RadixSort.java", highlight: "16-18",
      intro: "LSD radix with base 256. Each pass is a stable counting sort on one byte. Four " +
        "passes sort any 32-bit unsigned view of <code>int</code> (shift in the sign bit if needed).",
      code: `import java.util.Arrays;

public class RadixSort {

    static void countingPass(int[] a, int[] out, int shift) {
        int[] cnt = new int[256];
        for (int v : a) cnt[(v >>> shift) & 255]++;
        for (int i = 1; i < 256; i++) cnt[i] += cnt[i - 1];
        for (int i = a.length - 1; i >= 0; i--) {
            int d = (a[i] >>> shift) & 255;
            out[--cnt[d]] = a[i];
        }
        System.arraycopy(out, 0, a, 0, a.length);
    }

    static void radixSort(int[] a) {
        int[] tmp = new int[a.length];
        for (int shift = 0; shift <= 24; shift += 8) countingPass(a, tmp, shift);
    }

    public static void main(String[] args) {
        int[] a = {4, 2, 2, 8, 3, 3, 1};
        radixSort(a);
        System.out.println(Arrays.toString(a));
    }
    // Input : [4, 2, 2, 8, 3, 3, 1]
    // Output: [1, 2, 2, 3, 3, 4, 8]
}` },
    { tab: "Template", panel: "Template", file: "CountingTemplate.java",
      intro: "Dutch-flag counting (K = 2) and the max-gap bucket pass. Two interview shapes of " +
        "the same idea.",
      code: `import java.util.Arrays;

public class CountingTemplate {

    /** LC 75: three keys. Two passes, O(n). */
    static void sortColors(int[] a) {
        int[] cnt = new int[3];
        for (int v : a) cnt[v]++;
        int i = 0;
        for (int c = 0; c < 3; c++) while (cnt[c]-- > 0) a[i++] = c;
    }

    /** LC 164: maximum adjacent gap after sorting distinct numbers. */
    static int maximumGap(int[] a) {
        int n = a.length;
        if (n < 2) return 0;
        int mn = a[0], mx = a[0];
        for (int v : a) { mn = Math.min(mn, v); mx = Math.max(mx, v); }
        if (mn == mx) return 0;
        int bucket = (int) Math.max(1L, ((long) mx - mn) / (n - 1));
        int nb = (int) (((long) mx - mn) / bucket) + 1;
        int[] bMin = new int[nb], bMax = new int[nb];
        boolean[] used = new boolean[nb];
        Arrays.fill(bMin, Integer.MAX_VALUE);
        Arrays.fill(bMax, Integer.MIN_VALUE);
        for (int v : a) {
            int id = (int) (((long) v - mn) / bucket);
            used[id] = true;
            bMin[id] = Math.min(bMin[id], v);
            bMax[id] = Math.max(bMax[id], v);
        }
        int ans = 0, prev = mn;
        for (int i = 0; i < nb; i++) if (used[i]) {
            ans = Math.max(ans, bMin[i] - prev);
            prev = bMax[i];
        }
        return ans;
    }

    public static void main(String[] args) {
        int[] colors = {2, 0, 2, 1, 1, 0};
        sortColors(colors);
        System.out.println(Arrays.toString(colors));
        System.out.println(maximumGap(new int[] {3, 6, 9, 1}));
    }
    // Input : colors [2,0,2,1,1,0]; gap [3,6,9,1]
    // Output: [0, 0, 1, 1, 2, 2]
    //         3
}` },
  ],

  complexity: {
    time: "O(n + K) counting; O(n D) radix; O(n + n\u00b2/m) bucket worst-case",
    space: "O(n + K) / O(n + radix)",
    derivation: [
      "<p>Counting: one tally pass, one write pass, plus O(K) to walk the count array.</p>",
      "<span class=\"eq\">T = &Theta;(n + K),&nbsp;&nbsp; radix T = &Theta;(D &middot; (n + R))</span>",
      "<p>With D = 4 and R = 256, radix is ~4n operations plus 1k of counts \u2014 faster than " +
      "n log n once n is a few million. Bucket sort is expected linear on uniform input and " +
      "O(n\u00b2) if everything lands in one bucket; max-gap avoids that by never sorting a " +
      "bucket.</p>",
    ],
    compare: [
      ["Arrays.sort", "O(n log n)", "O(log n) / O(n)", "Default; prefer until K is friendly"],
      ["Counting", "O(n + K)", "O(n + K)", "K \u2264 ~1e7, integer keys"],
      ["LSD radix", "O(n D)", "O(n + R)", "32/64-bit ints, huge n"],
      ["Bucket (uniform)", "O(n) expected", "O(n)", "Reals, or pigeonhole arguments"],
      ["Dutch-flag partition", "O(n)", "O(1)", "K = 2 or 3, in-place follow-up"],
    ],
  },

  pitfalls: [
    { title: "Allocating <code>int[K]</code> when K is the value, not the range size",
      bug: "<code>a[i] \u2264 1e12</code>, you new <code>int[(int)max]</code> and OOM / overflow the size.",
      fix: "If K &gt; ~1e7, radix by digits or comparison-sort. Never use a value as an array length " +
        "without checking." },
    { title: "Unstable counting pass inside radix",
      bug: "Writing left-to-right into prefix slots (or emitting by key without scatter) reorders " +
        "equal digits and radix produces garbage.",
      fix: "Scatter from the right after prefix sums. Test radix on <code>[10, 2]</code>: first " +
        "digit pass must keep 10 before 2 because 0 &lt; 2 on the units place... wait, units " +
        "are 0 and 2, so 10 then 2; next pass on tens puts 2 then 10." },
    { title: "Signed ints in bit-radix",
      bug: "Arithmetic shift and treating the sign bit as a high digit puts negatives last " +
        "(unsigned order).",
      fix: "XOR keys with <code>1 &lt;&lt; 31</code> before radix (flip sign bit), XOR back after, " +
        "or sort positives/negatives separately." },
    { title: "Max-gap with n = 1 or all equal",
      bug: "Division by <code>n - 1</code> or empty interior. All-equal should return 0.",
      fix: "Guard <code>n &lt; 2</code> and <code>min == max</code> before choosing bucket width." },
    { title: "Bucket index off-by-one at max",
      bug: "<code>(max - min) / width</code> lands on <code>nb</code>, AIOOBE.",
      fix: "<code>nb = (max - min) / bucket + 1</code>, or clamp the last index to <code>nb - 1</code>." },
    { title: "Using counting sort on objects without satellite arrays",
      bug: "You count keys and emit keys, losing the original objects' other fields.",
      fix: "Stable scatter of the original objects (or indices), not of the keys alone." },
  ],

  variants: [
    ["Dutch national flag (K = 3, in-place)",
      "One-pass three-way partition instead of two counting passes",
      "lo/mid/hi pointers, swap 0s left and 2s right",
      "<a href=\"https://leetcode.com/problems/sort-colors/\" target=\"_blank\" rel=\"noopener\">LC 75</a>"],
    ["Bucket by frequency",
      "cnt[freq] holds a list of keys; scan freq from n down",
      "List<Integer>[] buck = new List[n+1];",
      "<a href=\"https://leetcode.com/problems/top-k-frequent-elements/\" target=\"_blank\" rel=\"noopener\">LC 347</a>"],
    ["MSD radix / bitwise trie",
      "Recurse on high digit, useful for XOR-max queries",
      "not the LSD loop; a 2-child trie on bits",
      "See bit manipulation / XOR trie later"],
    ["Coordinate compression",
      "Replace huge keys by their rank 0..n-1, then counting becomes Fenwick/size-n",
      "sort unique values, binary-search rank",
      "Offline queries, not a sort of the original values"],
  ],

  followups: [
    ["Is counting sort stable? When does it matter?",
      "<p>The emit-by-key version is stable in the weak sense that equal keys are identical. " +
      "The prefix-sum + right-to-left scatter is stable for satellite data. Radix requires " +
      "that second version. If you only sort ints, either is fine.</p>"],
    ["How many radix passes for 64-bit keys?",
      "<p>Base 256 \u21d2 8 passes; base 2<sup>16</sup> \u21d2 4 passes and a 64k count array. " +
      "The second is often faster: fewer passes beat a bigger count array that still fits in " +
      "cache. Java interviews: say \"4 passes of 16-bit digits\".</p>"],
    ["Can bucket sort be worst-case linear?",
      "<p>Not with a comparison sort inside buckets unless you bound occupancy. If you " +
      "recursively bucket, you reinvent radix. The max-gap trick is how you get a guaranteed " +
      "O(n) <em>without</em> sorting buckets: you never need the interior order.</p>"],
    ["Why is Java's <code>Arrays.sort(int[])</code> not counting sort?",
      "<p>The method cannot assume a small range. Dual-pivot quicksort is the right general " +
      "primitive. You opt into counting when <em>you</em> know K.</p>"],
    ["Sort 1e7 floats uniformly in [0, 1) in linear time.",
      "<p>n buckets of width 1/n, insertion-sort each (expected O(1) items), concatenate. " +
      "Adversarial input (all in one bucket) is O(n\u00b2); if that is in scope, radix the " +
      "IEEE bits instead.</p>"],
  ],

  problems: [
    { url: "https://leetcode.com/problems/sort-colors/", name: "Sort Colors",
      badge: "lc", tag: "LC 75", level: "Medium", pattern: "Counting with K=3, or Dutch flag" },
    { url: "https://leetcode.com/problems/h-index/", name: "H-Index",
      badge: "lc", tag: "LC 274", level: "Medium", pattern: "Bucket citations by count, scan from n" },
    { url: "https://leetcode.com/problems/top-k-frequent-elements/", name: "Top K Frequent Elements",
      badge: "lc", tag: "LC 347", level: "Medium", pattern: "Bucket by frequency" },
    { url: "https://leetcode.com/problems/sort-characters-by-frequency/", name: "Sort Characters By Frequency",
      badge: "lc", tag: "LC 451", level: "Medium", pattern: "Count, bucket by freq, emit" },
    { url: "https://leetcode.com/problems/relative-sort-array/", name: "Relative Sort Array",
      badge: "lc", tag: "LC 1122", level: "Easy", pattern: "Count 0..1000, emit in custom then natural order" },
    { url: "https://leetcode.com/problems/maximum-gap/", name: "Maximum Gap",
      badge: "lc", tag: "LC 164", level: "Medium", pattern: "Pigeonhole buckets, no comparison sort" },
    { url: "https://leetcode.com/problems/height-checker/", name: "Height Checker",
      badge: "lc", tag: "LC 1051", level: "Easy", pattern: "Counting sort because height \u2264 100" },
    { url: "https://codeforces.com/problemset/problem/160/B", name: "Unlucky Ticket",
      badge: "cf", tag: "CF 160B", level: "Easy", pattern: "Sort digits of two halves, compare" },
    { url: "https://codeforces.com/problemset/problem/285/C", name: "Building Permutation",
      badge: "cf", tag: "CF 285C", level: "Easy", pattern: "Sort, match to 1..n, long abs-sum" },
    { url: "https://www.geeksforgeeks.org/problems/counting-sort/1", name: "Counting Sort",
      badge: "gfg", tag: "GfG", level: "Easy", pattern: "Implement counting sort on a string" },
  ],

  spoilers: [
    { summary: "Hint for LC 164 \u2014 Maximum Gap",
      body: "<p>You must beat n log n, so you cannot sort. n distinct numbers \u21d2 n-1 gaps, " +
        "average width (max-min)/(n-1). Put n-1 buckets of that width; the max gap is between " +
        "buckets (an empty bucket is the pigeonhole). Store min and max only, scan occupied " +
        "neighbours. All-equal \u21d2 0.</p>" },
    { summary: "Hint for LC 347 \u2014 Top K Frequent",
      body: "<p>Frequencies are in [1, n], so make n+1 buckets. Drop each key into " +
        "<code>bucket[freq]</code>. Walk freq from n down and collect k keys. This is O(n), " +
        "better than a heap's O(n log k) when k is \u0398(n), and simpler than quickselect on " +
        "unique keys.</p>" },
  ],

  recap: {
    bullets: [
      "<strong>Small universe \u21d2 index by the key.</strong> That is the licence to drop the log.",
      "<strong>Counting sort is prefix sums of frequencies.</strong> Right-to-left scatter is the stable version.",
      "<strong>Radix = D stable counting passes</strong> on digits. Stability is mandatory.",
      "<strong>Bucket / pigeonhole</strong> for uniform reals and for max-gap.",
      "<strong>If K is huge, do not allocate K.</strong> Digit-split or comparison-sort.",
    ],
    oneliner: "for (v : a) cnt[v]++; for (k = 0; k <= K; k++) while (cnt[k]-- > 0) out[p++] = k;",
  },
},

/* ============================================= 3. intervals ============= */
{
  id: "intervals",
  difficulty: "Medium",
  readTime: "24 min",
  tagline: "Sort the endpoints, then sweep: merge, insert, erase and meeting rooms are one " +
    "event queue with a running counter.",
  tags: ["intervals", "sweep line", "greedy", "P0"],
  prereqs: [
    ["Sorting & Comparators", "sorting-and-comparators.html"],
    ["Two Pointers", "../01-arrays-and-windows/two-pointers.html"],
  ],

  why: {
    paras: [
      "An interval is a pair <code>[l, r]</code>. The naive instinct is nested loops: for each " +
      "interval, scan the others for overlap. That is <code>O(n&sup2;)</code> and dies at " +
      "<code>n = 10&#8309;</code>. After you sort by start (or by both ends as events), a single " +
      "left-to-right scan sees every overlap, because two intervals that overlap must be " +
      "neighbours in that order once you have merged the in-between.",
      "The same scan, restated as a sweep line, solves a different-looking family: minimum " +
      "meeting rooms, maximum concurrent events, coverage of a number line. You turn each " +
      "interval into two events <code>(l, +1)</code> and <code>(r, -1)</code>, sort, and the " +
      "running sum is the number of open intervals.",
      "Google asks Merge Intervals, Meeting Rooms II, Insert Interval, and \"erase overlapping " +
      "so the rest is maximum\". All four are: sort, then one greedy pass whose invariant is " +
      "\"the merged/kept prefix is already optimal and does not overlap the rest except at the " +
      "frontier\".",
    ],
    insight: "Once intervals are sorted by start, the only interval that can still overlap the " +
      "current one is the last thing you emitted. Everything to its left is done. That one " +
      "frontier is why a stack / last-merged pointer is enough.",
  },

  recognise: {
    yes: [
      "Input is a list of <code>[start, end]</code> (meetings, intervals, ranges on a line)",
      "\"Merge overlapping\", \"insert one interval\", \"remove covered\"",
      "\"Minimum rooms / cameras / arrows so that every interval is hit\"",
      "\"Maximum number of non-overlapping intervals\" (classic greedy)",
      "A 1D coverage / concurrent-events question with n up to 1e5",
    ],
    no: [
      "2D rectangles with arbitrary overlap &rarr; sweep + a data structure on the other axis, not a plain scan",
      "You need point updates and range queries on a live set of intervals &rarr; Fenwick / segment tree",
      "Intervals are on a circle &rarr; split at 0 or duplicate the array",
      "The objects are not intervals (pairs that are points, or unordered pairs) &rarr; hashing / two pointers",
    ],
    table: [
      ["Merge overlapping", "Sorted by start; extend last end", "LC 56"],
      ["Insert one interval into a merged list", "Copy before, merge through, copy after", "LC 57"],
      ["Min rooms so no two overlap in one room", "Max concurrent = sweep +1/\u22121", "LC 253"],
      ["Max non-overlapping count", "Sort by end, take if start \u2265 lastEnd", "Greedy, LC 435 inverted"],
      ["Min arrows to burst balloons", "Same as max non-overlapping, track a shrinking end", "LC 452"],
      ["Intersection of two interval lists", "Two pointers on already-sorted lists", "LC 986"],
      ["<strong>Confused with:</strong> sliding window on an array",
        "Windows are contiguous subarrays; intervals are independent segments on a line",
        "Sort + sweep, not two pointers on indices of A"],
    ],
    constraint: "<code>n \u2264 10&#8309;</code> intervals, ends up to 1e9. Sort is the log. " +
      "Sweep is O(n). Ends fit in <code>int</code>; counts of concurrent rooms use " +
      "<code>int</code>; if you sum lengths use <code>long</code>.",
  },

  core: {
    heading: "Core idea and the invariant",
    paras: [
      "Merge: sort by start. Walk left to right. If the next interval starts after the current " +
      "merged end, emit the current and start a new one. Else extend <code>end = max(end, " +
      "next.end)</code>. Overlap is <code>next.start \u2264 current.end</code> for closed " +
      "intervals; check the problem's closed/half-open convention before you code the test.",
      "Sweep for rooms: each meeting contributes <code>+1</code> at start and <code>-1</code> " +
      "at end. Sort events by time; on ties, process ends first if a meeting ending at t does " +
      "not occupy a room at t (half-open). The maximum running sum is the answer. You do not " +
      "need a heap unless you also need to assign room ids.",
      "Max non-overlapping: sort by <em>end</em>. Take an interval if it starts at or after the " +
      "last taken end. This is the same greedy as activity selection. Min-removals is " +
      "<code>n - maxKeep</code>. Min-arrows is the same scan, but you shrink the current end " +
      "to <code>min(end, balloon.end)</code> while they still overlap.",
    ],
    invariantTitle: "The interview sentence",
    invariant: "<p><em>After sorting, I only look at the frontier: the last merged end, or the " +
      "running number of open intervals.</em> Anything strictly to the left of the sweep line " +
      "is finished and will never interact with anything to the right except through that " +
      "frontier value.</p>",
    extra: [
      { kind: "warn", title: "Closed vs half-open, and ties",
        html: "<p><code>[1, 2]</code> and <code>[2, 3]</code> overlap if endpoints are closed " +
          "(LC 56 merges them) and do not if meetings are half-open (a meeting ending at 2 " +
          "frees the room for one starting at 2). Encode the convention in the event sort: " +
          "process <code>-1</code> before <code>+1</code> at equal time for half-open; the " +
          "opposite if they conflict at a point.</p>" },
      { kind: "tip", title: "Heap vs sweep for meeting rooms",
        html: "<p>The heap solution (min-heap of end times, rooms = heap size) is what most " +
          "people memorise. Sweep is strictly simpler and O(n log n) for the same reason " +
          "(the sort). Use the heap only when you must <em>assign</em> a concrete room id to " +
          "each meeting.</p>" },
      { kind: "idea", title: "Insert is merge with a single extra interval",
        html: "<p>Walk the already-merged list: copy every interval that ends before the new " +
          "start, merge everything that overlaps the new interval into it, copy the rest. " +
          "O(n), no extra sort, because the list was already sorted.</p>" },
    ],
  },

  visuals: [
    {
      kind: "array", vizId: "mergeArr",
      h3: "Merging [1,3], [2,6], [8,10], [15,18]",
      intro: "After sorting by start the array of starts is already in order. The window is the " +
        "current merged interval; amber is the candidate being eaten or emitted.",
      caption: "The last end is the only state. When a start jumps past it, emit and reset; " +
        "otherwise stretch the end.",
      data: {
        label: "starts (sorted)",
        array: [1, 2, 8, 15],
        indexLabels: ["[1,3]", "[2,6]", "[8,10]", "[15,18]"],
        vars: ["i", "curStart", "curEnd", "action"],
        speed: 900,
        frames: [
          { note: "Open [1, 3] as the current merged interval.",
            active: [0], dim: [1, 2, 3], pointers: { i: 0 },
            values: { i: 0, curStart: 1, curEnd: 3, action: "open" } },
          { note: "Next [2, 6]: 2 <= 3, overlap. Stretch end to max(3, 6) = 6. Current is [1, 6].",
            active: [1], window: [0, 1], dim: [2, 3], pointers: { i: 1 },
            values: { i: 1, curStart: 1, curEnd: 6, action: "merge" } },
          { note: "[8, 10]: 8 > 6, no overlap. Emit [1, 6] and open [8, 10].",
            active: [2], done: [0, 1], dim: [3], pointers: { i: 2 },
            values: { i: 2, curStart: 8, curEnd: 10, action: "emit + open" } },
          { note: "[15, 18]: 15 > 10. Emit [8, 10], open [15, 18].",
            active: [3], done: [0, 1, 2], pointers: { i: 3 },
            values: { i: 3, curStart: 15, curEnd: 18, action: "emit + open" } },
          { note: "Flush the last current. Output [[1,6],[8,10],[15,18]].",
            done: [0, 1, 2, 3],
            values: { i: "flush", curStart: 15, curEnd: 18, action: "emit last" } },
          { note: "Three merged intervals from four inputs. One linear scan after the sort.",
            best: [0, 1, 2, 3],
            values: { i: "done", curStart: "\u2014", curEnd: "\u2014", action: "3 intervals" } },
        ],
      },
    },
    {
      kind: "array", vizId: "roomsArr",
      h3: "Meeting rooms: max concurrent on [0,30],[5,10],[15,20]",
      intro: "Events in time order. +1 at a start, -1 at an end. Ties: process ends first so a " +
        "room frees at t before a new meeting at t takes it.",
      caption: "The running counter is the number of open meetings. Its maximum is the number of rooms.",
      data: {
        label: "event times",
        array: [0, 5, 10, 15, 20, 30],
        indexLabels: ["+1", "+1", "\u22121", "+1", "\u22121", "\u22121"],
        vars: ["t", "delta", "open", "best"],
        speed: 900,
        frames: [
          { note: "t = 0, start. open 0 -> 1. best = 1.",
            active: [0], dim: [1, 2, 3, 4, 5],
            values: { t: 0, delta: "+1", open: 1, best: 1 } },
          { note: "t = 5, start. open 1 -> 2. best = 2. Two meetings overlap in [5, 10].",
            active: [1], done: [0], dim: [2, 3, 4, 5],
            values: { t: 5, delta: "+1", open: 2, best: 2 } },
          { note: "t = 10, end. open 2 -> 1. The first overlapping meeting finished.",
            active: [2], done: [0, 1], dim: [3, 4, 5],
            values: { t: 10, delta: "-1", open: 1, best: 2 } },
          { note: "t = 15, start. open 1 -> 2. Overlaps the long [0, 30] meeting. best stays 2.",
            active: [3], done: [0, 1, 2], dim: [4, 5],
            values: { t: 15, delta: "+1", open: 2, best: 2 } },
          { note: "t = 20, end. open 2 -> 1.",
            active: [4], done: [0, 1, 2, 3], dim: [5],
            values: { t: 20, delta: "-1", open: 1, best: 2 } },
          { note: "t = 30, end. open 1 -> 0. Maximum concurrent was 2, so 2 rooms.",
            active: [5], done: [0, 1, 2, 3, 4],
            values: { t: 30, delta: "-1", open: 0, best: 2 } },
          { note: "Answer 2. A heap of end times would have size 2 at the same peaks; the sweep never stores the meetings.",
            best: [1, 3], done: [0, 2, 4, 5],
            values: { t: "done", delta: "\u2014", open: 0, best: 2 } },
        ],
      },
    },
    {
      kind: "mermaid", vizId: "ivFlow",
      h3: "Which interval greedy",
      caption: "All of these start with a sort. The key you sort on, and whether you extend or " +
        "count, is the only difference.",
      src: `flowchart TD
  q["what is asked?"] --> mergeQ{"merge / insert / erase covered?"}
  mergeQ -- yes --> byStart["sort by start, scan, stretch last end"]
  mergeQ -- no --> roomsQ{"max concurrent / min rooms?"}
  roomsQ -- yes --> sweep["events +1 / -1, max running sum"]
  roomsQ -- no --> maxInd{"max non-overlapping / min arrows?"}
  maxInd -- yes --> byEnd["sort by end, take if start is after lastEnd"]
  maxInd -- no --> twoLists["two pointers on two sorted lists"]`,
    },
  ],

  steps: [
    "<strong>Normalise the convention.</strong> Closed or half-open? Does touching count as overlap?",
    "<strong>Sort.</strong> By start for merge/insert; by end for max-independent; events <code>(time, delta)</code> for rooms.",
    "<strong>Merge scan:</strong> if <code>next.start &le; curEnd</code> then <code>curEnd = max(curEnd, next.end)</code> else emit and reset.",
    "<strong>Rooms sweep:</strong> apply delta, track <code>open</code> and <code>best</code>. On time ties, ends before starts if rooms can be reused at t.",
    "<strong>Max keep:</strong> take interval if <code>start &ge; lastEnd</code>, then <code>lastEnd = end</code>.",
    "<strong>Insert:</strong> three phases on an already-merged list &mdash; before, overlapping (merge into new), after.",
    "<strong>Flush</strong> the last open interval after the loop. Off-by-one here drops the last meeting.",
  ],

  dryRun: {
    intro: "Merge <code>[[1,3],[2,6],[8,10],[15,18]]</code>. Highlighted rows emit or stretch.",
    cols: ["i", "next", "cur", "overlap?", "cur after"],
    rows: [
      { cells: ["0", "[1,3]", "open [1,3]", "\u2014", "[1,3]"],
        action: "Seed the frontier." },
      { cells: ["1", "[2,6]", "[1,3]", "2 \u2264 3 yes", "[1,6]"],
        action: "Stretch end to 6.", change: true },
      { cells: ["2", "[8,10]", "[1,6]", "8 \u2264 6? no", "emit [1,6]; open [8,10]"],
        action: "Gap. Start a new merged interval.", change: true },
      { cells: ["3", "[15,18]", "[8,10]", "15 \u2264 10? no", "emit [8,10]; open [15,18]"],
        action: "Gap again.", change: true },
      { cells: ["flush", "\u2014", "[15,18]", "\u2014", "emit [15,18]"],
        action: "Output [[1,6],[8,10],[15,18]].", change: true },
    ],
  },

  code: [
    { tab: "Brute", panel: "Brute", file: "MergeBrute.java",
      intro: "Repeatedly merge any overlapping pair. Correct, quadratic, and shows the overlap " +
        "predicate you will reuse.",
      code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class MergeBrute {

    static boolean overlap(int[] a, int[] b) {
        return a[0] <= b[1] && b[0] <= a[1];
    }

    static int[][] merge(int[][] intervals) {
        List<int[]> a = new ArrayList<>(Arrays.asList(intervals));
        boolean moved = true;
        while (moved) {
            moved = false;
            outer:
            for (int i = 0; i < a.size(); i++) {
                for (int j = i + 1; j < a.size(); j++) {
                    if (overlap(a.get(i), a.get(j))) {
                        int l = Math.min(a.get(i)[0], a.get(j)[0]);
                        int r = Math.max(a.get(i)[1], a.get(j)[1]);
                        a.remove(j);
                        a.remove(i);
                        a.add(new int[] {l, r});
                        moved = true;
                        break outer;
                    }
                }
            }
        }
        return a.toArray(new int[0][]);
    }

    public static void main(String[] args) {
        int[][] out = merge(new int[][] {{1, 3}, {2, 6}, {8, 10}, {15, 18}});
        for (int[] p : out) System.out.println(p[0] + " " + p[1]);
    }
    // Input : [[1,3],[2,6],[8,10],[15,18]]
    // Output: 1 6
    //         8 10
    //         15 18
}` },
    { tab: "Optimal", panel: "Optimal", file: "MergeIntervals.java", highlight: "14-18",
      intro: "Sort by start, scan once. The highlighted four lines are merge. Meeting-rooms " +
        "sweep sits next to it so you see they share the sort.",
      code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class MergeIntervals {

    static int[][] merge(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        List<int[]> out = new ArrayList<>();
        int s = intervals[0][0], e = intervals[0][1];
        for (int i = 1; i < intervals.length; i++) {
            if (intervals[i][0] <= e) {
                e = Math.max(e, intervals[i][1]);
            } else {
                out.add(new int[] {s, e});
                s = intervals[i][0];
                e = intervals[i][1];
            }
        }
        out.add(new int[] {s, e});
        return out.toArray(new int[0][]);
    }

    static int minRooms(int[][] meetings) {
        int n = meetings.length;
        int[][] ev = new int[2 * n][2];
        for (int i = 0; i < n; i++) {
            ev[2 * i]     = new int[] {meetings[i][0], +1};
            ev[2 * i + 1] = new int[] {meetings[i][1], -1};
        }
        Arrays.sort(ev, (a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0])
                                                : Integer.compare(a[1], b[1])); // ends first
        int open = 0, best = 0;
        for (int[] e : ev) {
            open += e[1];
            best = Math.max(best, open);
        }
        return best;
    }

    public static void main(String[] args) {
        int[][] out = merge(new int[][] {{1, 3}, {2, 6}, {8, 10}, {15, 18}});
        for (int[] p : out) System.out.println(p[0] + " " + p[1]);
        System.out.println(minRooms(new int[][] {{0, 30}, {5, 10}, {15, 20}}));
    }
    // Input : merge [[1,3],[2,6],[8,10],[15,18]]; rooms [[0,30],[5,10],[15,20]]
    // Output: 1 6
    //         8 10
    //         15 18
    //         2
}` },
    { tab: "Template", panel: "Template", file: "SweepTemplate.java",
      intro: "Insert-interval three-phase walk, and the activity-selection greedy (min arrows / " +
        "max non-overlapping).",
      code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class SweepTemplate {

    static int[][] insert(int[][] intervals, int[] neu) {
        List<int[]> out = new ArrayList<>();
        int i = 0, n = intervals.length;
        while (i < n && intervals[i][1] < neu[0]) out.add(intervals[i++]);
        while (i < n && intervals[i][0] <= neu[1]) {
            neu[0] = Math.min(neu[0], intervals[i][0]);
            neu[1] = Math.max(neu[1], intervals[i][1]);
            i++;
        }
        out.add(neu);
        while (i < n) out.add(intervals[i++]);
        return out.toArray(new int[0][]);
    }

    /** Min arrows = max number of groups that pairwise overlap. Sort by end. */
    static int findMinArrowShots(int[][] points) {
        Arrays.sort(points, (a, b) -> Integer.compare(a[1], b[1]));
        int arrows = 1, end = points[0][1];
        for (int i = 1; i < points.length; i++) {
            if (points[i][0] > end) {
                arrows++;
                end = points[i][1];
            }
        }
        return arrows;
    }

    public static void main(String[] args) {
        int[][] ins = insert(new int[][] {{1, 3}, {6, 9}}, new int[] {2, 5});
        for (int[] p : ins) System.out.println(p[0] + " " + p[1]);
        System.out.println(findMinArrowShots(new int[][] {{10, 16}, {2, 8}, {1, 6}, {7, 12}}));
    }
    // Input : insert [2,5] into [[1,3],[6,9]]; balloons [[10,16],[2,8],[1,6],[7,12]]
    // Output: 1 5
    //         6 9
    //         2
}` },
  ],

  complexity: {
    time: "O(n log n)",
    space: "O(n) for the output / event array",
    derivation: [
      "<p>The sort dominates. The scan is strictly linear: each interval is pushed at most " +
      "once, each event is processed once.</p>",
      "<span class=\"eq\">T = &Theta;(n log n) + &Theta;(n) = &Theta;(n log n)</span>",
      "<p>If the input is already merged and sorted (Insert Interval, Interval Intersections), " +
      "drop the sort and you have <code>O(n)</code>. A heap of end times is the same " +
      "<code>O(n log n)</code> with a larger constant.</p>",
    ],
    compare: [
      ["Pairwise merge until quiet", "O(n\u00b2) \u2013 O(n\u00b3)", "O(n)", "Never; only to check overlap logic"],
      ["Sort by start + scan", "O(n log n)", "O(n)", "Merge, covered, insert-if-unsorted"],
      ["Event sweep +1/\u22121", "O(n log n)", "O(n)", "Rooms, max concurrent, coverage"],
      ["Sort by end + greedy take", "O(n log n)", "O(1)", "Max independent / min arrows"],
      ["Two pointers, both lists sorted", "O(n + m)", "O(1)", "Intersections of two lists"],
    ],
  },

  pitfalls: [
    { title: "Comparator overflow on ends",
      bug: "<code>(a, b) -&gt; a[0] - b[0]</code> with ends at \u00b11e9. LC 452's official trap.",
      fix: "<code>Integer.compare(a[0], b[0])</code> always. Same as the previous page." },
    { title: "Forgetting to emit the last interval",
      bug: "The loop merges into <code>cur</code> and never appends after the last index.",
      fix: "Unconditional <code>out.add(cur)</code> after the loop." },
    { title: "Wrong overlap test at a shared endpoint",
      bug: "Using <code>&lt;</code> when the problem is closed, or <code>&le;</code> when " +
        "meetings can reuse a room at time t.",
      fix: "Read one sample that touches. Encode it in the event-sort tie-break, not in a later branch." },
    { title: "Sorting by start for activity selection",
      bug: "Max non-overlapping sorted by start can pick a long interval that blocks two short ones.",
      fix: "Sort by <em>end</em>. The proof is: the one that finishes first leaves the most room." },
    { title: "Mutating the input interval during insert",
      bug: "<code>neu[0] = min(...)</code> mutates the caller's array.",
      fix: "Copy into locals <code>ns, ne</code> or clone. Interviews sometimes reuse the argument." },
    { title: "Heap of ends without sorting starts first",
      bug: "You push meetings in input order, so a late-starting early-ending meeting is processed too soon.",
      fix: "Sort by start, <em>then</em> the min-heap of ends. Or skip the heap and sweep." },
  ],

  variants: [
    ["Insert into a merged list",
      "No sort; three-phase copy",
      "while end < neu.start copy; merge overlap; copy rest",
      "<a href=\"https://leetcode.com/problems/insert-interval/\" target=\"_blank\" rel=\"noopener\">LC 57</a>"],
    ["Erase covered intervals",
      "Sort start asc, end desc; skip if end \u2264 current max end",
      "if (r <= maxEnd) removed++; else maxEnd = r;",
      "LC 1288"],
    ["Interval intersections of two lists",
      "Two pointers, both already sorted",
      "lo=max(s1,s2); hi=min(e1,e2); if (lo<=hi) emit; advance the one that ends first",
      "LC 986"],
    ["Assign concrete rooms",
      "Min-heap of (end, roomId); pop if end \u2264 start",
      "need a heap, sweep only gives the count",
      "follow-up on LC 253"],
  ],

  followups: [
    ["Prove that sorting by end maximises the number of non-overlapping intervals.",
      "<p>Take an optimal set. If its first interval is not the one that finishes first, swap " +
      "it for that one: it ends no later, so it cannot overlap anything the original first " +
      "did not. Repeat. The greedy set is optimal. Min-removals is n minus that size.</p>"],
    ["Meetings are on a circle (wrap past midnight).",
      "<p>Split any wrapping interval into two, or duplicate the timeline by +24h and run a " +
      "linear sweep with a wrap-aware max. The usual interview move is: if one interval wraps, " +
      "cut at 0.</p>"],
    ["n = 1e5 and you must also support live insert/delete of intervals.",
      "<p>The static sort is gone. Keep ends in a TreeMap of coverage, or a Fenwick on " +
      "compressed coordinates. Different problem; do not reuse merge.</p>"],
    ["What if you must merge in-place with O(1) extra memory?",
      "<p>Sort in place, then write merged intervals into the prefix of the same array with " +
      "a slow pointer. Return a copy of the prefix (Java cannot shrink the caller's array; " +
      "return <code>Arrays.copyOf(a, k)</code>).</p>"],
    ["Online: intervals arrive over time, report current merged coverage.",
      "<p>TreeMap of endpoints with a coverage counter, or a balanced BST of disjoint merged " +
      "pieces (LC 715 Range Module). Sweep is offline-only.</p>"],
  ],

  problems: [
    { url: "https://leetcode.com/problems/merge-intervals/", name: "Merge Intervals",
      badge: "lc", tag: "LC 56", level: "Medium", pattern: "The canonical sort-by-start scan" },
    { url: "https://leetcode.com/problems/insert-interval/", name: "Insert Interval",
      badge: "lc", tag: "LC 57", level: "Medium", pattern: "Three-phase walk, no extra sort" },
    { url: "https://leetcode.com/problems/non-overlapping-intervals/", name: "Non-overlapping Intervals",
      badge: "lc", tag: "LC 435", level: "Medium", pattern: "n minus max keep; sort by end" },
    { url: "https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/", name: "Min Arrows to Burst Balloons",
      badge: "lc", tag: "LC 452", level: "Medium", pattern: "Same greedy; Integer.compare on ends" },
    { url: "https://leetcode.com/problems/meeting-rooms/", name: "Meeting Rooms",
      badge: "lc", tag: "LC 252", level: "Easy", pattern: "Sort by start, check adjacent overlap" },
    { url: "https://leetcode.com/problems/meeting-rooms-ii/", name: "Meeting Rooms II",
      badge: "lc", tag: "LC 253", level: "Medium", pattern: "Sweep +1/\u22121, max running sum" },
    { url: "https://leetcode.com/problems/interval-list-intersections/", name: "Interval List Intersections",
      badge: "lc", tag: "LC 986", level: "Medium", pattern: "Two pointers on two sorted lists" },
    { url: "https://leetcode.com/problems/remove-covered-intervals/", name: "Remove Covered Intervals",
      badge: "lc", tag: "LC 1288", level: "Medium", pattern: "Start asc, end desc, track max end" },
    { url: "https://codeforces.com/problemset/problem/479/C", name: "Exams",
      badge: "cf", tag: "CF 479C", level: "Easy", pattern: "Sort by real date, greedy earliest day" },
    { url: "https://codeforces.com/problemset/problem/1283/E", name: "New Year Parties",
      badge: "cf", tag: "CF 1283E", level: "Medium", pattern: "Place on a line, min/max occupied days" },
    { url: "https://www.geeksforgeeks.org/problems/overlapping-intervals--170633/1", name: "Overlapping Intervals",
      badge: "gfg", tag: "GfG", level: "Medium", pattern: "Merge intervals" },
  ],

  spoilers: [
    { summary: "Hint for LC 253 \u2014 Meeting Rooms II",
      body: "<p>Do not simulate rooms. Flatten to events (start, +1) and (end, \u22121), sort by " +
        "time, process ends first on ties if a room can be reused at that instant. The answer " +
        "is the max of the running sum. Heap of end times is equivalent and heavier.</p>" },
    { summary: "Hint for LC 452 \u2014 Min arrows",
      body: "<p>Sort by end. Shoot at the first balloon's end; skip every balloon whose start is " +
        "\u2264 that end (they share a point). Then repeat. This is activity selection. Use " +
        "<code>Integer.compare</code>: ends are \u00b12<sup>31</sup> and subtraction overflows.</p>" },
  ],

  recap: {
    bullets: [
      "<strong>Sort, then one scan.</strong> The frontier (last end, or open-count) is the whole state.",
      "<strong>Merge / insert sort by start.</strong> Max-independent / arrows sort by end.",
      "<strong>Rooms = sweep of +1/\u22121.</strong> Max of the running sum.",
      "<strong>Tie-break encodes closed vs half-open.</strong> Get one touching sample right.",
      "<strong><code>Integer.compare</code> on ends.</strong> LC 452 is famous for overflow.",
    ],
    oneliner: "if (next.start <= end) end = Math.max(end, next.end); else emit and reset;",
  },
},

/* =========================== 4. cyclic-sort-and-index-tricks ============ */
{
  id: "cyclic-sort-and-index-tricks",
  difficulty: "Hard",
  readTime: "22 min",
  tagline: "When values are a permutation of 1..n, the index <em>is</em> the address: swap into " +
    "place, or negate to mark seen, and the hole is the missing number.",
  tags: ["cyclic sort", "in-place", "index as hash", "P1"],
  prereqs: [
    ["Sorting & Comparators", "sorting-and-comparators.html"],
    ["Prefix Sums", "../01-arrays-and-windows/prefix-sums.html"],
  ],

  why: {
    paras: [
      "A surprising number of \"find the missing / duplicate\" questions give you n cells and " +
      "values in <code>1..n</code> (or <code>0..n</code>). A hash set solves them in " +
      "<code>O(n)</code> extra memory. The interview follow-up is always: do it in-place. " +
      "Cyclic sort and sign-marking are the two in-place hashes.",
      "Cyclic sort: while <code>a[i]</code> is not at index <code>a[i] - 1</code>, swap it there. " +
      "Each swap seats at least one value, so you finish in <code>O(n)</code>. After that, the " +
      "index whose value is wrong is the missing or duplicate. First Missing Positive is the " +
      "same idea on a dirty array: throw out non-positive and &gt; n, then seat the rest.",
      "Sign-marking is even lighter: use the sign of <code>a[|v| - 1]</code> as a boolean " +
      "\"v was seen\". You get all disappeared / all duplicates in one extra pass, still " +
      "<code>O(1)</code> extra memory, provided the values are in 1..n and originally positive.",
    ],
    insight: "The array is already a hash table whose keys are indices. Your job is to write " +
      "each value into the slot it names, or to flip that slot's sign as a presence bit.",
  },

  recognise: {
    yes: [
      "Array of length n, values in <code>1..n</code> or <code>0..n</code>, find missing / duplicate",
      "\"First missing positive\" with O(1) extra memory and O(n) time",
      "\"Find all duplicates / all disappeared numbers\" without a set",
      "You are about to allocate a boolean[n] to mark seen values",
      "The follow-up is \"now do it in-place\" after you offered a HashSet",
    ],
    no: [
      "Values are arbitrary 32-bit ints with no range hint &rarr; HashSet / sort, you cannot index by value",
      "You must not mutate the array and extra memory is forbidden &rarr; XOR (one missing) or math sum, not cyclic sort",
      "The array is a linked-list cycle question (find duplicate via Floyd) &rarr; still in-place, different model; see below",
      "You need the full sorted order of arbitrary keys &rarr; real sort, not cyclic sort",
    ],
    table: [
      ["One missing from 0..n", "XOR all indices and values, or sum", "LC 268"],
      ["One duplicate, values 1..n, read-only", "Floyd cycle on a[a[i]]", "LC 287"],
      ["All disappeared from 1..n", "Sign-mark a[v-1], then scan positives", "LC 448"],
      ["All duplicates (each appears 1 or 2 times)", "Sign-mark; a second negative is a dup", "LC 442"],
      ["First missing positive, any ints", "Seat 1..n in place, first hole", "LC 41"],
      ["Set mismatch (one missing + one dup)", "Cyclic sort or sign-mark, then both scans", "LC 645"],
      ["<strong>Confused with:</strong> counting sort",
        "Counting needs O(K) extra; cyclic sort reuses the input as the count table",
        "Cyclic sort when K = n and extra memory is banned"],
    ],
    constraint: "<code>n \u2264 10&#8309;</code>, O(1) extra, O(n) time. That combination is " +
      "the signature: if they also allowed O(n) extra, a boolean[] or HashSet is simpler and " +
      "you should say so first.",
  },

  core: {
    heading: "Core idea and the invariant",
    paras: [
      "Cyclic sort on a permutation of 1..n: index i should hold i+1. While " +
      "<code>a[i] != i + 1</code>, swap <code>a[i]</code> with <code>a[a[i] - 1]</code>. If the " +
      "target already holds the same value, you have a duplicate; leave it and advance. " +
      "Termination: every swap seats a new value that was not already home, so at most n swaps.",
      "Sign-marking: for each <code>v = abs(a[i])</code> in 1..n, set <code>a[v - 1] = " +
      "-abs(a[v - 1])</code>. A slot that is still positive at the end was never named, so " +
      "index+1 is missing. A slot you try to negate that is already negative is a duplicate.",
      "First missing positive: the answer is in 1..n+1. Ignore non-positives and numbers " +
      "&gt; n (they cannot be the answer except n+1). Cyclic-sort the rest into slots 0..n-1, " +
      "then the first index with <code>a[i] != i + 1</code> is the answer; if none, n+1.",
    ],
    invariantTitle: "The interview sentence",
    invariant: "<p><em>Index <code>i</code> is the hash slot for value <code>i+1</code>.</em> " +
      "After seating (or sign-marking) every in-range value, the first slot that is wrong is " +
      "the missing positive, and a slot that was already seated when I tried again is the " +
      "duplicate.</p>",
    extra: [
      { kind: "warn", title: "Infinite swap on duplicates",
        html: "<p>If 3 appears twice, <code>a[i] = 3</code> and <code>a[2] = 3</code> already, " +
          "swapping does nothing and a naive <code>while (a[i] != i+1) swap</code> loops " +
          "forever. Always stop when <code>a[i] == a[dest]</code>.</p>" },
      { kind: "tip", title: "XOR / sum when you must not mutate",
        html: "<p>One missing from 0..n: <code>xor</code> of all indices and all values, or " +
          "<code>n*(n+1)/2 - sum</code> in a <code>long</code>. One duplicate in a read-only " +
          "array with values 1..n is Floyd: treat <code>i \u2192 a[i]</code> as a functional " +
          "graph with one cycle.</p>" },
      { kind: "idea", title: "Offer the HashSet first",
        html: "<p>In an interview, say \"HashSet is O(n) time and space\" then \"the range is " +
          "1..n so I can use the array as the set\". Interviewers grade the conversation as " +
          "much as the in-place trick.</p>" },
    ],
  },

  visuals: [
    {
      kind: "array", vizId: "cycArr",
      h3: "Cyclic sort of [3, 1, 4, 2] (a permutation of 1..4)",
      intro: "Each swap writes a value into the index it names. Amber is <code>i</code>; the " +
        "window is the pair being swapped.",
      caption: "Value v belongs at index v-1. Four seats, four swaps or skips, then the array " +
        "is the identity permutation.",
      data: {
        label: "a (want a[i] = i+1)",
        array: [3, 1, 4, 2],
        indexLabels: ["v=1", "v=2", "v=3", "v=4"],
        vars: ["i", "a[i]", "dest", "action"],
        speed: 900,
        frames: [
          { note: "i = 0, a[0] = 3, dest = 2. 3 is not home. Swap a[0] and a[2]: [4, 1, 3, 2]. 3 is now seated.",
            active: [0], window: [0, 2], pointers: { i: 0 },
            values: { i: 0, "a[i]": 3, dest: 2, action: "swap" } },
          { note: "Still i = 0, a[0] = 4, dest = 3. Swap with a[3]: [2, 1, 3, 4]. 4 is seated.",
            arr: [2, 1, 3, 4], active: [0], window: [0, 3], pointers: { i: 0 },
            values: { i: 0, "a[i]": 4, dest: 3, action: "swap" } },
          { note: "Still i = 0, a[0] = 2, dest = 1. Swap with a[1]: [1, 2, 3, 4]. 2 is seated.",
            arr: [1, 2, 3, 4], active: [0], window: [0, 1], pointers: { i: 0 },
            values: { i: 0, "a[i]": 2, dest: 1, action: "swap" } },
          { note: "a[0] = 1, dest = 0. Home. Advance i.",
            arr: [1, 2, 3, 4], active: [0], done: [0], pointers: { i: 0 },
            values: { i: 0, "a[i]": 1, dest: 0, action: "home, i++" } },
          { note: "i = 1,2,3 already home. Identity permutation. Any later hole would be a missing number.",
            arr: [1, 2, 3, 4], done: [0, 1, 2, 3], pointers: { i: 3 },
            values: { i: 3, "a[i]": 4, dest: 3, action: "all home" } },
          { note: "If a duplicate existed, dest would already equal a[i] and we would skip instead of spinning.",
            best: [0, 1, 2, 3],
            values: { i: "done", "a[i]": "\u2014", dest: "\u2014", action: "O(n) swaps" } },
        ],
      },
    },
    {
      kind: "array", vizId: "fmpArr",
      h3: "First missing positive on [3, 4, -1, 1]",
      intro: "Ignore non-positives and &gt; n. Seat 1..4. The first index whose value is not " +
        "i+1 is the answer.",
      caption: "Answer lives in 1..n+1. After seating, slot 1 still holds 4, so 2 is missing.",
      data: {
        label: "a",
        array: [3, 4, -1, 1],
        indexLabels: ["want 1", "want 2", "want 3", "want 4"],
        vars: ["i", "a[i]", "note"],
        speed: 900,
        frames: [
          { note: "n = 4. -1 is out of 1..4; 3, 4, 1 are in range.",
            x: [2], dim: [],
            values: { i: "\u2014", "a[i]": "\u2014", note: "ignore non-positives" } },
          { note: "Seat 3 at index 2: swap [3,4,-1,1] -> [-1, 4, 3, 1].",
            arr: [-1, 4, 3, 1], active: [0, 2], window: [0, 2],
            values: { i: 0, "a[i]": 3, note: "seat 3" } },
          { note: "a[0] = -1 is junk; skip. i = 1, a[1] = 4, seat at index 3: [-1, 1, 3, 4].",
            arr: [-1, 1, 3, 4], active: [1, 3], window: [1, 3],
            values: { i: 1, "a[i]": 4, note: "seat 4" } },
          { note: "a[1] = 1, dest = 0. Swap with a[0]: [1, -1, 3, 4]. 1 is seated.",
            arr: [1, -1, 3, 4], active: [0, 1], window: [0, 1],
            values: { i: 1, "a[i]": 1, note: "seat 1" } },
          { note: "a[1] = -1 junk; a[2] = 3 home; a[3] = 4 home.",
            arr: [1, -1, 3, 4], done: [0, 2, 3], x: [1],
            values: { i: 1, "a[i]": -1, note: "hole at index 1" } },
          { note: "Scan: a[0]=1 ok, a[1] != 2. First missing positive is 2.",
            arr: [1, -1, 3, 4], best: [1], done: [0, 2, 3],
            values: { i: 1, "a[i]": -1, note: "answer = 2" } },
          { note: "If every slot had been home, the answer would be n+1 = 5. That is the only extra case.",
            dim: [0, 1, 2, 3],
            values: { i: "done", "a[i]": "\u2014", note: "answer in 1..n+1" } },
        ],
      },
    },
    {
      kind: "mermaid", vizId: "cycFlow",
      h3: "Which in-place trick",
      caption: "Start from the constraints they added on top of O(n) time. Read-only vs mutate, " +
        "one hole vs many, range 1..n vs arbitrary ints.",
      src: `flowchart TD
  q["find missing or duplicate"] --> mutate{"may I mutate the array?"}
  mutate -- no --> one{"one missing xor one duplicate?"}
  one -- missing --> xorsum["XOR or long sum"]
  one -- duplicate --> floyd["Floyd cycle on i to a[i]"]
  mutate -- yes --> range{"values in 1..n?"}
  range -- yes --> mark{"need all of them?"}
  mark -- yes --> signs["sign-mark a[v-1]"]
  mark -- no --> cyclic["cyclic sort, then one scan"]
  range -- no --> fmp["first missing positive: seat 1..n, first hole"]`,
    },
  ],

  steps: [
    "<strong>State the hash:</strong> value <code>v</code> in 1..n belongs at index <code>v - 1</code>.",
    "<strong>Cyclic sort:</strong> while <code>a[i]</code> is in range and <code>a[i] != a[a[i]-1]</code>, swap them. Else <code>i++</code>.",
    "<strong>Scan</strong> for the first <code>a[i] != i + 1</code>: that i+1 is missing; a seated duplicate is a[i] at a wrong i.",
    "<strong>Sign-mark:</strong> for each <code>v = abs(a[i])</code>, negate <code>a[v-1]</code> if still positive. Second negation \u21d2 duplicate. Still-positive slot \u21d2 missing.",
    "<strong>First missing positive:</strong> treat non-positives and &gt; n as junk, cyclic-sort the rest, then the same hole scan; default n+1.",
    "<strong>Read-only one duplicate:</strong> Floyd: <code>slow = a[slow]</code>, <code>fast = a[a[fast]]</code>, then reset one pointer.",
    "<strong>One missing, no mutate:</strong> XOR 0..n with all a[i], or <code>long</code> sum.",
  ],

  dryRun: {
    intro: "First missing positive on <code>[3, 4, -1, 1]</code>. Highlighted rows swap.",
    cols: ["i", "a[i]", "dest", "a after", "why"],
    rows: [
      { cells: ["0", "3", "2", "[-1, 4, 3, 1]", "seat 3"], change: true,
        action: "Swap with index 2." },
      { cells: ["0", "-1", "\u2014", "[-1, 4, 3, 1]", "junk"], 
        action: "Not in 1..4, i++." },
      { cells: ["1", "4", "3", "[-1, 1, 3, 4]", "seat 4"], change: true,
        action: "Swap with index 3." },
      { cells: ["1", "1", "0", "[1, -1, 3, 4]", "seat 1"], change: true,
        action: "Swap with index 0." },
      { cells: ["1", "-1", "\u2014", "[1, -1, 3, 4]", "junk"],
        action: "i++." },
      { cells: ["2", "3", "2", "[1, -1, 3, 4]", "home"],
        action: "Already seated." },
      { cells: ["3", "4", "3", "[1, -1, 3, 4]", "home"],
        action: "Scan: index 1 is the hole \u2192 answer 2." },
    ],
  },

  code: [
    { tab: "Brute", panel: "Brute", file: "MissingBrute.java",
      intro: "HashSet of seen values, then scan 1..n+1. Always mention this first; the rest of " +
        "the page is the O(1)-space follow-up.",
      code: `import java.util.HashSet;
import java.util.Set;

public class MissingBrute {

    static int firstMissingPositive(int[] a) {
        Set<Integer> seen = new HashSet<>();
        for (int v : a) if (v > 0) seen.add(v);
        int x = 1;
        while (seen.contains(x)) x++;
        return x;
    }

    public static void main(String[] args) {
        System.out.println(firstMissingPositive(new int[] {3, 4, -1, 1}));
        System.out.println(firstMissingPositive(new int[] {1, 2, 0}));
    }
    // Input : [3,4,-1,1] then [1,2,0]
    // Output: 2
    //         3
}` },
    { tab: "Optimal", panel: "Optimal", file: "CyclicSort.java", highlight: "8-12",
      intro: "Seat every in-range value, then read the first hole. The highlighted loop is " +
        "cyclic sort with the duplicate-guard.",
      code: `public class CyclicSort {

    static int firstMissingPositive(int[] a) {
        int n = a.length;
        int i = 0;
        while (i < n) {
            int dest = a[i] - 1;
            if (a[i] >= 1 && a[i] <= n && a[i] != a[dest]) {
                int t = a[i];
                a[i] = a[dest];
                a[dest] = t;
            } else {
                i++;
            }
        }
        for (i = 0; i < n; i++) if (a[i] != i + 1) return i + 1;
        return n + 1;
    }

    public static void main(String[] args) {
        System.out.println(firstMissingPositive(new int[] {3, 4, -1, 1}));
        System.out.println(firstMissingPositive(new int[] {1, 2, 0}));
    }
    // Input : [3,4,-1,1] then [1,2,0]
    // Output: 2
    //         3
}` },
    { tab: "Template", panel: "Template", file: "IndexTricks.java",
      intro: "Sign-marking for disappeared numbers, and Floyd for the read-only duplicate.",
      code: `import java.util.ArrayList;
import java.util.List;

public class IndexTricks {

    static List<Integer> findDisappeared(int[] a) {
        for (int i = 0; i < a.length; i++) {
            int v = Math.abs(a[i]);
            a[v - 1] = -Math.abs(a[v - 1]);
        }
        List<Integer> out = new ArrayList<>();
        for (int i = 0; i < a.length; i++) if (a[i] > 0) out.add(i + 1);
        return out;
    }

    /** LC 287. Array is read-only, values in 1..n, exactly one duplicate. */
    static int findDuplicate(int[] a) {
        int slow = a[0], fast = a[0];
        do {
            slow = a[slow];
            fast = a[a[fast]];
        } while (slow != fast);
        slow = a[0];
        while (slow != fast) {
            slow = a[slow];
            fast = a[fast];
        }
        return slow;
    }

    public static void main(String[] args) {
        System.out.println(findDisappeared(new int[] {4, 3, 2, 7, 8, 2, 3, 1}));
        System.out.println(findDuplicate(new int[] {1, 3, 4, 2, 2}));
    }
    // Input : disappeared [4,3,2,7,8,2,3,1]; duplicate [1,3,4,2,2]
    // Output: [5, 6]
    //         2
}` },
  ],

  complexity: {
    time: "O(n)",
    space: "O(1) extra (output list excluded)",
    derivation: [
      "<p>Cyclic sort: each index is visited, and each swap seats a value that was not home, " +
      "so the number of swaps is \u2264 n. Sign-marking is two linear passes. Floyd is also " +
      "linear: the cycle length is \u2264 n.</p>",
      "<span class=\"eq\">T = \u0398(n),&nbsp;&nbsp; extra S = \u0398(1)</span>",
      "<p>HashSet is the same time with S = \u0398(n). Sorting is O(n log n) and also fine " +
      "until they forbid it. XOR/sum is O(n)/O(1) but only for the one-missing case.</p>",
    ],
    compare: [
      ["HashSet + scan 1..n+1", "O(n)", "O(n)", "Say this first"],
      ["Sort + linear scan", "O(n log n)", "O(1) or O(n)", "When mutation is OK and n log n fits"],
      ["Cyclic sort / seat 1..n", "O(n)", "O(1)", "First missing positive"],
      ["Sign-mark", "O(n)", "O(1)", "All disappeared / all duplicates, originally positive"],
      ["XOR or long sum", "O(n)", "O(1)", "Exactly one missing, no mutation"],
      ["Floyd on i \u2192 a[i]", "O(n)", "O(1)", "Exactly one duplicate, read-only"],
    ],
  },

  pitfalls: [
    { title: "Infinite loop when a duplicate is already at dest",
      bug: "<code>while (a[i] != i + 1) swap(i, a[i]-1)</code> never advances.",
      fix: "Guard <code>a[i] != a[dest]</code>. Then <code>i++</code>." },
    { title: "Using <code>a[i]</code> as dest after you started negating",
      bug: "Sign-marking turns values negative; <code>a[a[i]-1]</code> then indexes at a negative.",
      fix: "<code>int v = Math.abs(a[i])</code> every time you read a value as a key." },
    { title: "Forgetting n+1 as the first missing positive",
      bug: "Array is a permutation of 1..n. The hole scan finds nothing and you return 0 or n.",
      fix: "Return <code>n + 1</code> after the scan. The answer is always in 1..n+1." },
    { title: "XOR for two missing / a missing and a duplicate",
      bug: "XOR of everything is <code>missing ^ duplicate</code>, which is not either number.",
      fix: "Split by a bit where they differ (Single Number III style), or cyclic-sort / sign-mark." },
    { title: "Floyd on an array that is not 1..n with a guaranteed duplicate",
      bug: "<code>a[i]</code> = 0 or n+1 throws / misses. No duplicate \u21d2 no cycle, infinite loop.",
      fix: "Floyd needs the functional-graph guarantee of LC 287. Do not use it on First Missing Positive." },
    { title: "Sum overflowing when computing the missing number",
      bug: "<code>int sum = n*(n+1)/2</code> overflows at n ~ 46341.",
      fix: "<code>long sum = n * (n + 1L) / 2;</code> then subtract. XOR does not need this." },
  ],

  variants: [
    ["One missing, no mutation",
      "XOR all i and a[i], or long triangular sum",
      "xor ^= i ^ a[i]; return xor;",
      "LC 268"],
    ["All duplicates (1 or 2 copies)",
      "Sign-mark; already-negative \u21d2 duplicate",
      "if (a[v-1] < 0) dups.add(v); else a[v-1] = -a[v-1];",
      "LC 442"],
    ["Read-only one duplicate",
      "Floyd cycle detection on the functional graph",
      "slow = a[slow]; fast = a[a[fast]];",
      "LC 287"],
    ["Missing and repeating together",
      "Cyclic sort, then both a wrong slot's value (dup) and index (missing)",
      "if (a[i] != i+1) return {a[i], i+1};",
      "GfG / LC 645"],
  ],

  followups: [
    ["Why is First Missing Positive O(n) and not O(n log n)?",
      "<p>The answer is at most n+1, so only the n possible in-range positives matter. Seating " +
      "them is a permutation of a subset, each swap seats one, \u2264 n swaps. You never sort " +
      "the junk.</p>"],
    ["Can you do First Missing Positive without mutating and in O(1) extra?",
      "<p>Not in O(n) time in the comparison/hash model with arbitrary ints: you must remember " +
      "which of 1..n appeared, which is n bits. If they forbid mutation they must allow O(n) " +
      "extra, or they have restricted the range so XOR works.</p>"],
    ["The array contains zeros and negatives; sign-marking seems to break.",
      "<p>First Missing Positive first (or instead) cyclic-sorts, and treats junk as \"not a " +
      "key\". Sign-marking assumes original values are in 1..n and positive. Do not mix the " +
      "two on dirty input without a cleaning pass (replace junk with a sentinel such as n+1).</p>"],
    ["Find the smallest missing number in a sorted array of distinct positives.",
      "<p>That is binary search: if <code>a[mid] == mid + a[0]</code> (or <code>== mid+1</code> " +
      "when starting at 1), the hole is to the right. Different pattern; cyclic sort is for " +
      "unsorted.</p>"],
    ["k missing numbers, not one.",
      "<p>Cyclic sort still seats everything in range. Then scan for k holes, and if you run " +
      "out of holes continue with n+1, n+2, \u2026. That is LC 448 generalised, or LC 41 " +
      "returning a list.</p>"],
  ],

  problems: [
    { url: "https://leetcode.com/problems/missing-number/", name: "Missing Number",
      badge: "lc", tag: "LC 268", level: "Easy", pattern: "XOR or long sum, 0..n" },
    { url: "https://leetcode.com/problems/find-all-numbers-disappeared-in-an-array/", name: "Find All Disappeared Numbers",
      badge: "lc", tag: "LC 448", level: "Easy", pattern: "Sign-mark a[v-1]" },
    { url: "https://leetcode.com/problems/find-all-duplicates-in-an-array/", name: "Find All Duplicates",
      badge: "lc", tag: "LC 442", level: "Medium", pattern: "Sign-mark; second hit is a dup" },
    { url: "https://leetcode.com/problems/set-mismatch/", name: "Set Mismatch",
      badge: "lc", tag: "LC 645", level: "Easy", pattern: "One missing + one dup; sign-mark or cyclic" },
    { url: "https://leetcode.com/problems/find-the-duplicate-number/", name: "Find the Duplicate Number",
      badge: "lc", tag: "LC 287", level: "Medium", pattern: "Floyd, read-only, 1..n" },
    { url: "https://leetcode.com/problems/first-missing-positive/", name: "First Missing Positive",
      badge: "lc", tag: "LC 41", level: "Hard", pattern: "Seat 1..n, first hole, else n+1" },
    { url: "https://leetcode.com/problems/missing-number-in-arithmetic-progression/", name: "Missing Number in AP",
      badge: "lc", tag: "LC 1228", level: "Easy", pattern: "Different: binary search on a sorted AP" },
    { url: "https://codeforces.com/problemset/problem/285/C", name: "Building Permutation",
      badge: "cf", tag: "CF 285C", level: "Easy", pattern: "Sort, match to 1..n, long abs difference" },
    { url: "https://codeforces.com/problemset/problem/1512/A", name: "Spy Detected",
      badge: "cf", tag: "CF 1512A", level: "Easy", pattern: "Find the unique value; counting / index" },
    { url: "https://www.geeksforgeeks.org/problems/find-missing-and-repeating2512/1", name: "Missing and Repeating",
      badge: "gfg", tag: "GfG", level: "Easy", pattern: "Cyclic sort or two-equation XOR" },
  ],

  spoilers: [
    { summary: "Hint for LC 41 \u2014 First Missing Positive",
      body: "<p>Answer \u2208 [1, n+1]. For each a[i] in 1..n, swap it to index a[i]-1 unless " +
        "that slot already holds it. Then the first i with a[i] != i+1 is the answer. Junk " +
        "(non-positives, &gt; n) is never swapped into a seat. Do not use Floyd here.</p>" },
    { summary: "Hint for LC 287 \u2014 Find the Duplicate",
      body: "<p>Values in 1..n, length n+1, read-only. a[i] is a pointer; there is one cycle " +
        "because one value is a second incoming edge. Floyd: tortoise and hare, then the " +
        "second walk from the start meets at the duplicate. Binary search on the value " +
        "(count how many \u2264 mid) is the O(n log n) alternative if Floyd feels like a trick.</p>" },
  ],

  recap: {
    bullets: [
      "<strong>Index i is the slot for value i+1.</strong> That is the in-place hash.",
      "<strong>Cyclic sort swaps into dest until home or dest already holds it.</strong> Then scan holes.",
      "<strong>Sign-marking uses the sign bit as a set.</strong> abs() when you read a key.",
      "<strong>First missing positive = cyclic sort of 1..n</strong> plus the n+1 fallback.",
      "<strong>Read-only one duplicate is Floyd</strong>, not cyclic sort.",
    ],
    oneliner: "while (a[i]>=1 && a[i]<=n && a[i]!=a[a[i]-1]) swap(i, a[i]-1); else i++;",
  },
},

];

/* Module 02 — Sorting, Hashing, Bits & Matrix */
import { pack } from "./pack.mjs";

export const topics = [

/* =========================== 1. sorting-and-comparators ================ */
pack({
  id: "sorting-and-comparators",
  difficulty: "Easy",
  readTime: "22 min",
  tagline: "Java's sort is a primitive. The skill is writing a comparator that encodes the " +
    "order the problem actually wants, then proving that order is a total, transitive key.",
  tags: ["sort", "comparator", "custom order", "greedy", "P0"],
  prereqs: [
    ["Complexity Analysis", "../00-foundations/complexity-analysis.html"],
    ["Java for DSA", "../00-foundations/java-for-dsa.html"],
  ],
  why: [
    "Almost every greedy proof starts with \"sort the input\". Intervals by start or by end, " +
      "tasks by deadline, points by polar angle, strings by <code>a+b vs b+a</code> &mdash; the " +
      "algorithm is often two lines after the sort. If the comparator is wrong, the rest of the " +
      "code is theatre.",
    "Interviews test comparators because they mix language trivia with algorithmic honesty. " +
      "<code>Integer.compare</code> versus subtraction (overflow), stability of " +
      "<code>Arrays.sort</code> on objects versus primitives, and the contract " +
      "<code>sgn(a,b) == -sgn(b,a)</code> are the three traps that turn a correct idea into a " +
      "WA or a runtime exception on a single pair of values.",
    "The reformulation is: you are not sorting values, you are sorting <em>keys you invented</em>. " +
      "Once the key is a number or a pair that is totally ordered, TimSort does the rest in " +
      "<code>O(n log n)</code>. Inventing that key is the problem; calling sort is the punctuation.",
  ],
  insight: "Write the comparator so that it answers one question: \"if I can only keep one of " +
    "these two items first, which one must come first for the rest of the algorithm to work?\" " +
    "If that answer is not transitive, the sort is undefined and so is your greedy.",
  yes: [
    "\"Order by X, break ties by Y\" &mdash; a comparator of two keys",
    "A greedy that is obviously correct after the items are in a particular order (intervals, " +
      "deadlines, Huffman-style merge)",
    "\"Largest number formed by concatenating\", \"reorder logs\", \"rank teams by votes\"",
    "You need a stable order so equal keys keep their input relative order",
    "The bottleneck is deciding the key, not computing it &mdash; each key is <code>O(1)</code> " +
      "or <code>O(|s|)</code>",
  ],
  no: [
    "You need the k-th element only &rarr; " +
      "<a href=\"../01-arrays-and-windows/kth-and-selection.html\">quickselect / heap</a>, not a full sort",
    "The range is tiny (<code>0..n</code> or <code>0..10&#8308;</code>) and you need linear time " +
      "&rarr; <a href=\"non-comparison-sorts.html\">counting / radix</a>",
    "The sequence is a permutation of <code>1..n</code> with swaps of misplaced values &rarr; " +
      "<a href=\"cyclic-sort-and-index-tricks.html\">cyclic sort</a>",
    "Order is defined by a partial order / graph of prerequisites &rarr; topological sort, not a comparator",
  ],
  table: [
    ["\"sort by start, then by end\"", "Lexicographic pair key", "Comparator of two ints"],
    ["\"largest number from concatenating\"", "Order is not numeric; it is a+b vs b+a", "String comparator"],
    ["\"k closest points to origin\"", "Sort by distance, or a size-k heap", "Comparator or PriorityQueue"],
    ["\"reconstruct queue by height\"", "Sort tallest first, insert by k-count", "Sort then list-insert"],
    ["\"merge overlapping intervals\"", "Sort by start so overlaps are adjacent",
      "<a href=\"intervals.html\">Intervals</a>"],
    ["primitive <code>int[]</code> vs <code>Integer[]</code>", "TimSort is stable only on objects",
      "Box, or sort indices"],
    ["<strong>Confused with:</strong> counting sort",
      "Comparison sort is n log n; counting is n + range",
      "<a href=\"non-comparison-sorts.html\">Non-comparison sorts</a>"],
  ],
  constraint: "<code>n &le; 10&#8309;</code> is the signature for one <code>O(n log n)</code> " +
    "sort. Keys that themselves take <code>O(L)</code> (strings of length L) make the true cost " +
    "<code>O(n L log n)</code>. Subtraction comparators overflow when values reach " +
    "<code>&plusmn;10&#8313;</code>; use <code>Integer.compare</code> or <code>Long.compare</code>.",
  core: [
    "<code>Arrays.sort</code> on <code>int[]</code> is dual-pivot quicksort (not stable). On " +
      "objects it is TimSort (stable). For a custom order, box to <code>Integer[]</code> or sort " +
      "an index array. The comparator must be a total order: antisymmetric, transitive, and " +
      "zero only on equivalents. Violating transitivity (\"put a before b because of a local " +
      "rule that does not extend\") is undefined behaviour and shows up as a rare shuffle, not " +
      "an exception.",
    "The standard Java pattern is <code>(u, v) -&gt; Integer.compare(key(u), key(v))</code> or " +
      "<code>Comparator.comparingInt(...).thenComparingInt(...)</code>. Never " +
      "<code>return u - v</code> on arbitrary ints. For concatenation, compare " +
      "<code>a+b</code> with <code>b+a</code> as strings; do not parse them as integers. After " +
      "the sort, the greedy scan is usually a single pass that only looks at neighbours.",
  ],
  invariant: "<p>After <code>Arrays.sort(a, cmp)</code>, for every <code>i &lt; j</code>:</p>" +
    "<span class=\"eq\">cmp(a[i], a[j]) &le; 0</span>" +
    "<p>Interview sentence: <em>\"I sort by a key that makes the remaining decision local " +
    "&mdash; each item only needs to look at its sorted neighbour.\"</em></p>",
  array: [5, 2, 4, 6, 1, 3],
  vars: ["pass", "i", "j", "a"],
  frames: [
    { note: "Input [5, 2, 4, 6, 1, 3]. Merge-sort: split until singles, then merge adjacent runs.",
      dim: [0, 1, 2, 3, 4, 5],
      values: { pass: "split", i: "\u2014", j: "\u2014", a: "[5,2,4,6,1,3]" } },
    { note: "Merge [5] and [2] \u2192 [2, 5]. Left half starts to take shape.",
      active: [0, 1], dim: [2, 3, 4, 5],
      values: { pass: "merge", i: 0, j: 1, a: "[2,5,4,6,1,3]" } },
    { note: "Merge [4] and [6] \u2192 [4, 6].",
      active: [2, 3], done: [0, 1], dim: [4, 5],
      values: { pass: "merge", i: 2, j: 3, a: "[2,5,4,6,1,3]" } },
    { note: "Merge [2,5] and [4,6] \u2192 [2, 4, 5, 6]. Left half sorted.",
      window: [0, 3], done: [0, 1, 2, 3], dim: [4, 5],
      values: { pass: "merge", i: 0, j: 3, a: "[2,4,5,6,1,3]" } },
    { note: "Right half: merge [1] and [3] \u2192 [1, 3].",
      active: [4, 5], done: [0, 1, 2, 3],
      values: { pass: "merge", i: 4, j: 5, a: "[2,4,5,6,1,3]" } },
    { note: "Final merge [2,4,5,6] with [1,3] \u2192 [1, 2, 3, 4, 5, 6]. Comparator was Integer.compare.",
      best: [0, 1, 2, 3, 4, 5],
      values: { pass: "done", i: 0, j: 5, a: "[1,2,3,4,5,6]" } },
    { note: "Same skeleton with a custom key: sort strings so that a+b >= b+a (LC 179). The merge is identical; only cmp changes.",
      done: [0, 1, 2, 3, 4, 5],
      values: { pass: "custom", i: "\u2014", j: "\u2014", a: "same merge, new cmp" } },
  ],
  mermaid: `flowchart TD
  need["need a specific order"] --> kind{"what defines the order?"}
  kind -- "numeric key" --> intCmp["Integer.compare or Long.compare"]
  kind -- "pair of keys" --> thenCmp["comparingInt then thenComparingInt"]
  kind -- "concatenation / votes" --> strCmp["compare a+b with b+a as strings"]
  kind -- "partial order / graph" --> topo["wrong page: topological sort"]
  intCmp --> call["Arrays.sort"]
  thenCmp --> call
  strCmp --> call
  call --> scan["one greedy pass on neighbours"]`,
  merTitle: "Pick the key, then sort",
  steps: [
    "<strong>Name the key</strong> that makes the rest of the algorithm a neighbour scan.",
    "<strong>Prove transitivity</strong> on paper for two minutes. If A before B and B before C " +
      "does not imply A before C, the comparator is illegal.",
    "<strong>Implement with <code>Integer.compare</code></strong> / " +
      "<code>Comparator.comparingInt</code>. Never subtract ints.",
    "<strong>Stability:</strong> need it? Sort <code>Integer[]</code> or indices. Primitive " +
      "<code>int[]</code> sort is not stable.",
    "<strong>Sort once</strong> with <code>Arrays.sort(a, cmp)</code> or " +
      "<code>Arrays.sort(idx, (i, j) -&gt; cmp)</code>.",
    "<strong>Scan linearly.</strong> The greedy decision should now look only at " +
      "<code>a[i]</code> vs <code>a[i-1]</code>.",
    "<strong>State <code>O(n log n)</code></strong> plus the cost of the key. String keys of " +
      "length L cost <code>O(n L log n)</code>.",
  ],
  code: [
    { tab: "Brute", panel: "Brute", file: "SortBrute.java",
      intro: "Selection sort: correct, quadratic, the thing you are about to replace.",
      code: `import java.util.Arrays;

public class SortBrute {
    static void selectionSort(int[] a) {
        int n = a.length;
        for (int i = 0; i < n; i++) {
            int best = i;
            for (int j = i + 1; j < n; j++) {
                if (a[j] < a[best]) {
                    best = j;
                }
            }
            int t = a[i];
            a[i] = a[best];
            a[best] = t;
        }
    }

    public static void main(String[] args) {
        int[] a = {5, 2, 4, 6, 1, 3};
        selectionSort(a);
        System.out.println(Arrays.toString(a));
    }
    // Input : [5, 2, 4, 6, 1, 3]
    // Output: [1, 2, 3, 4, 5, 6]
}` },
    { tab: "Optimal", panel: "Optimal", file: "SortKeys.java",
      intro: "Library sort plus three comparator patterns: ints, pairs, concatenation.",
      code: `import java.util.Arrays;
import java.util.Comparator;

public class SortKeys {
    static int[] sortInts(int[] a) {
        int[] b = a.clone();
        Arrays.sort(b);
        return b;
    }

    static int[][] sortPairs(int[][] pairs) {
        Arrays.sort(pairs, Comparator
            .comparingInt((int[] p) -> p[0])
            .thenComparingInt(p -> p[1]));
        return pairs;
    }

    static String largestNumber(int[] nums) {
        String[] s = new String[nums.length];
        for (int i = 0; i < nums.length; i++) {
            s[i] = String.valueOf(nums[i]);
        }
        Arrays.sort(s, (a, b) -> (b + a).compareTo(a + b));
        if (s[0].equals("0")) {
            return "0";
        }
        StringBuilder sb = new StringBuilder();
        for (String x : s) {
            sb.append(x);
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(sortInts(new int[] {5, 2, 4, 6, 1, 3})));
        System.out.println(largestNumber(new int[] {3, 30, 34, 5, 9}));
    }
    // Input : [5,2,4,6,1,3] then [3,30,34,5,9]
    // Output: [1, 2, 3, 4, 5, 6]
    //         9534330
}` },
    { tab: "Template", panel: "Template", file: "SortIndices.java",
      intro: "Sort indices when you must keep the original array, and a stable object sort.",
      code: `import java.util.Arrays;
import java.util.Comparator;

public class SortIndices {
    static int[] orderByValue(int[] a) {
        Integer[] idx = new Integer[a.length];
        for (int i = 0; i < a.length; i++) {
            idx[i] = i;
        }
        Arrays.sort(idx, Comparator.comparingInt(i -> a[i]));
        int[] out = new int[a.length];
        for (int i = 0; i < a.length; i++) {
            out[i] = idx[i];
        }
        return out;
    }

    public static void main(String[] args) {
        int[] a = {5, 2, 4, 6, 1, 3};
        System.out.println(Arrays.toString(orderByValue(a)));
        System.out.println(Arrays.toString(a));
    }
    // Input : values [5, 2, 4, 6, 1, 3]
    // Output: indices [4, 1, 5, 2, 0, 3]
    //         original unchanged [5, 2, 4, 6, 1, 3]
}` },
  ],
  complexity: {
    time: "O(n log n) comparisons, times the cost of the key",
    space: "O(n) TimSort scratch; O(1) extra for primitive dual-pivot aside from the call stack",
    derivation: [
      "<p>A comparison sort must distinguish <code>n!</code> permutations, so " +
        "<span class=\"eq\">&Omega;(n log n)</span> comparisons in the worst case. Java's " +
        "object sort is TimSort, adaptive and stable; primitive sort is dual-pivot quicksort.</p>",
      "<p>If each comparison costs <code>O(L)</code> (string keys of length L), multiply: " +
        "<span class=\"eq\">T(n) = O(n L log n)</span>. Concatenation comparators allocate, " +
        "so they are slower than they look; still the right complexity class for " +
        "<code>n &le; 10&#8309;</code>, <code>L &le; 20</code>.</p>",
    ],
    compare: [
      ["Selection / insertion sort", "O(n\u00b2)", "O(1)", "n \u2264 2000 teaching only"],
      ["Arrays.sort primitives", "O(n log n)", "O(log n)", "Default numeric order, not stable"],
      ["Arrays.sort objects / TimSort", "O(n log n)", "O(n)", "Stable; custom Comparator"],
      ["Counting / radix", "O(n + R) / O(n w)", "O(n + R)", "Tiny range; next page"],
      ["Heap of size k", "O(n log k)", "O(k)", "k-th / k closest, not full order"],
    ],
  },
  pitfalls: [
    { title: "Subtraction overflow in the comparator",
      bug: "<code>return a - b</code> with <code>a = Integer.MIN_VALUE</code> and " +
        "<code>b = 1</code> wraps and reports the wrong sign.",
      fix: "<code>Integer.compare(a, b)</code> or <code>Long.compare</code>. Never subtract." },
    { title: "Unstable primitive sort",
      bug: "Sorting <code>int[]</code> of equal keys shuffles their original order, then a " +
        "tie-breaking scan is wrong.",
      fix: "Box to <code>Integer[]</code>, or sort an index array with a stable object sort." },
    { title: "Illegal transitive order",
      bug: "Comparator says A&lt;B, B&lt;C, C&lt;A. TimSort may throw " +
        "<code>IllegalArgumentException: Comparison method violates its general contract!</code>",
      fix: "The key must be a total order. Test a cycle of three items by hand." },
    { title: "Parsing concatenated numbers as ints",
      bug: "LC 179 with numbers that concatenate past 2&#8313;1. <code>parseInt(a+b)</code> throws.",
      fix: "Compare strings. Leading-zero answer is the single character <code>\"0\"</code>." },
    { title: "Forgetting that sort mutates",
      bug: "You sort the caller's array and a later assertion on the original order fails.",
      fix: "Clone first, or sort indices and leave the source untouched." },
  ],
  variants: [
    ["Sort by distance / closeness",
      "Key is <code>x*x + y*y</code> as long, to avoid sqrt and overflow.",
      "Arrays.sort(pts, Comparator.comparingLong(p -> (long)p[0]*p[0] + (long)p[1]*p[1]));",
      "LC 973; or a size-k heap if you only need k."],
    ["Queue reconstruction by height",
      "Sort tallest first, then insert each person at index k in a list.",
      "sort (h desc, k asc); then list.add(k, person);",
      "LC 406."],
    ["Rank teams by votes",
      "26-letter position counts; comparator walks ranks then letter.",
      "cmp: first differing rank count, then team id.",
      "LC 1366."],
  ],
  followups: [
    ["Why is primitive Arrays.sort not stable?",
      "<p>It is a dual-pivot quicksort tuned for ints. Stability requires extra memory to " +
      "remember original positions. Objects go through TimSort, which is stable. If you need " +
      "stability on ints, sort boxed values or indices.</p>"],
    ["How do you sort by a key that is a long without boxing the array?",
      "<p>Sort indices: <code>Integer[] idx</code> and " +
      "<code>Comparator.comparingLong(i -&gt; key[i])</code>. The values stay primitive; only " +
      "the permutation is boxed.</p>"],
    ["Is a lambda comparator allocated every call?",
      "<p>The lambda is a singleton invokedynamic handle; it is not allocated per comparison. " +
      "What is allocated is any string you build inside it (concatenation comparators). Cache " +
      "keys if L is large.</p>"],
    ["When is n log n not good enough after a sort?",
      "<p>When the true bottleneck is the key, not the sort: string keys with large L, or " +
      "when you only needed the k-th element. Also when the range is tiny and counting sort " +
      "is linear.</p>"],
  ],
  problems: [
    { url: "https://leetcode.com/problems/sort-an-array/", name: "Sort an Array",
      badge: "lc", tag: "LC 912", level: "Medium", pattern: "Implement a stable n log n sort" },
    { url: "https://leetcode.com/problems/largest-number/", name: "Largest Number",
      badge: "lc", tag: "LC 179", level: "Medium", pattern: "Comparator a+b vs b+a" },
    { url: "https://leetcode.com/problems/reorder-data-in-log-files/", name: "Reorder Data in Log Files",
      badge: "lc", tag: "LC 937", level: "Medium", pattern: "Letter logs vs digit logs; stable" },
    { url: "https://leetcode.com/problems/k-closest-points-to-origin/", name: "K Closest Points to Origin",
      badge: "lc", tag: "LC 973", level: "Medium", pattern: "Sort by squared distance, or heap" },
    { url: "https://leetcode.com/problems/queue-reconstruction-by-height/", name: "Queue Reconstruction by Height",
      badge: "lc", tag: "LC 406", level: "Medium", pattern: "Sort tallest first, insert at k" },
    { url: "https://leetcode.com/problems/rank-teams-by-votes/", name: "Rank Teams by Votes",
      badge: "lc", tag: "LC 1366", level: "Medium", pattern: "Count ranks, then custom cmp" },
    { url: "https://leetcode.com/problems/sort-characters-by-frequency/", name: "Sort Characters By Frequency",
      badge: "lc", tag: "LC 451", level: "Medium", pattern: "Count then sort by freq" },
    { url: "https://leetcode.com/problems/car-fleet/", name: "Car Fleet",
      badge: "lc", tag: "LC 853", level: "Medium", pattern: "Sort by position, scan time to target" },
  ],
  recap: [
    "<strong>Invent a totally ordered key</strong>, then call the library sort.",
    "<strong>Integer.compare</strong>, never <code>a - b</code>.",
    "<strong>Primitive sort is not stable</strong>; object TimSort is.",
    "<strong>String concatenation keys</strong> compare <code>a+b</code> vs <code>b+a</code>.",
    "<strong>After the sort</strong> the greedy should be a neighbour scan.",
  ],
  oneliner: "Arrays.sort(a, Comparator.comparingInt(x -> key(x)).thenComparingInt(x -> tie(x)));",
}),

/* =========================== 2. non-comparison-sorts =================== */
pack({
  id: "non-comparison-sorts",
  difficulty: "Medium",
  readTime: "20 min",
  tagline: "When keys live in a small universe, you can sort in linear time by counting, " +
    "bucketing, or peeling digits &mdash; the &Omega;(n log n) barrier only applies to " +
    "comparison sorts.",
  tags: ["counting sort", "radix sort", "bucket sort", "P1"],
  prereqs: [
    ["Sorting & Comparators", "sorting-and-comparators.html"],
    ["Constraints \u2192 Complexity", "../00-foundations/constraints-to-complexity.html"],
  ],
  why: [
    "The information-theoretic lower bound of <code>n log n</code> assumes the only question " +
      "you can ask is \"is A less than B?\". If you can index an array by the key itself, you " +
      "can tally frequencies in <code>O(n + R)</code> and write the output in order. That is " +
      "counting sort, and it is the right tool whenever <code>R</code> is on the order of " +
      "<code>n</code> or a small constant (0/1/2, grades, ages, colours).",
    "Radix sort is counting sort applied to one digit at a time, LSD or MSD. It turns a huge " +
      "numeric range into <code>w</code> passes of a tiny range (base 10 or 2&#8312;). Bucket " +
      "sort assumes a known distribution, scatters into <code>n</code> buckets, and sorts each; " +
      "maximum-gap (LC 164) is the pigeonhole form of the same idea.",
    "In interviews this family shows up as Dutch national flag (three colours), \"sort an array " +
      "of 0s and 1s\", H-index with citations in <code>0..n</code>, and maximum gap. Contests " +
      "use counting as soon as values are coordinates you can compress, or as a histogram of " +
      "a small alphabet.",
  ],
  insight: "Comparison sorts are optimal among comparison sorts. If the key is an integer in a " +
    "small range, index by it. Linear time is then a histogram plus a prefix of counts.",
  yes: [
    "Keys are integers in <code>0..R</code> with <code>R = O(n)</code> or a tiny constant",
    "\"Sort colours / 0s, 1s, 2s\" &mdash; Dutch national flag, a 3-way partition",
    "H-index, or any \"how many values &ge; x\" where x is in <code>0..n</code>",
    "Maximum gap after sorting, when n is large but a comparison sort is still allowed to " +
      "feel too slow conceptually &mdash; bucket / pigeonhole",
    "Fixed-width integers (32-bit) and you want guaranteed <code>O(n)</code> with a few passes",
  ],
  no: [
    "Arbitrary comparable objects with no integer key &rarr; comparison sort",
    "Range is <code>10&#8313;</code> and you only have <code>n = 10&#8309;</code> &rarr; sort " +
      "the n values, or compress then count",
    "You need the k-th element, not the full order &rarr; " +
      "<a href=\"../01-arrays-and-windows/kth-and-selection.html\">quickselect</a>",
    "Keys are floats with no distribution promise &rarr; comparison sort; buckets can be empty " +
      "or overloaded",
  ],
  table: [
    ["Values in 0..R, R small", "Histogram then emit", "Counting sort"],
    ["0 / 1 / 2 only", "Three pointers, one pass", "Dutch national flag"],
    ["32-bit ints, linear guaranteed", "Counting per digit", "LSD radix"],
    ["H-index, citations in 0..n", "Count how many papers with \u2265 i cites", "Counting in 0..n"],
    ["Maximum adjacent gap after sort", "n-1 buckets, skip empty", "Pigeonhole / bucket"],
    ["Coordinates up to 1e9, n \u2264 1e5", "Not counting on raw values", "Compress, then count"],
    ["<strong>Confused with:</strong> HashMap frequency then sort keys",
      "That is n log n on the unique keys, not linear in R",
      "Use an array of size R when R is tiny"],
  ],
  constraint: "Counting is linear when <code>R &le; 10&#8310;</code> or so (memory). " +
    "<code>n &le; 10&#8309;</code> with values in <code>1..n</code> is the classic signature. " +
    "Radix on 32-bit keys is ~4 passes of base 256. Always use <code>long</code> for prefix " +
    "totals of counts.",
  core: [
    "Counting sort: allocate <code>cnt[R]</code>, increment <code>cnt[a[i]]</code>, then either " +
      "emit <code>v</code> repeated <code>cnt[v]</code> times (not stable in that form) or turn " +
      "counts into starting positions with a prefix sum and scatter the original elements into " +
      "an output array (stable). Stability matters when the payload is a pair and you are " +
      "inside radix sort.",
    "Dutch national flag is counting sort specialised to <code>R = 3</code> in-place: pointers " +
      "<code>lo, mid, hi</code>. <code>a[mid] == 0</code> swaps with <code>lo++</code>; " +
      "<code>== 2</code> swaps with <code>hi--</code>; <code>== 1</code> just " +
      "<code>mid++</code>. Radix LSD applies stable counting to each digit from least " +
      "significant, so the previous digit's order is preserved.",
  ],
  invariant: "<p>After counting, <code>cnt[v]</code> is how many keys equal <code>v</code>, and " +
    "the prefix <code>pos[v] = cnt[0]+&hellip;+cnt[v-1]</code> is the first output index for " +
    "<code>v</code>.</p>" +
    "<span class=\"eq\">output[pos[a[i]]++] = a[i]</span>" +
    "<p>Interview sentence: <em>\"I index by the key instead of comparing keys, so the sort is " +
    "a histogram plus a scatter.\"</em></p>",
  array: [2, 0, 2, 1, 1, 0],
  vars: ["lo", "mid", "hi", "a[mid]"],
  frames: [
    { note: "Dutch national flag on [2,0,2,1,1,0]. lo=0, mid=0, hi=5. a[mid]=2 \u2192 swap with hi.",
      active: [0, 5], pointers: { i: 0 },
      values: { lo: 0, mid: 0, hi: 5, "a[mid]": 2 } },
    { note: "After swap: [0,0,2,1,1,2], hi=4. a[mid]=0 \u2192 swap with lo, then lo++, mid++.",
      active: [0], window: [0, 4],
      values: { lo: 0, mid: 0, hi: 4, "a[mid]": 0 } },
    { note: "Now [0,0,2,1,1,2], lo=1, mid=1, a[mid]=0 \u2192 swap with lo (no-op), lo=2, mid=2.",
      done: [0, 1], active: [1],
      values: { lo: 1, mid: 1, hi: 4, "a[mid]": 0 } },
    { note: "mid=2, a[2]=2 \u2192 swap with hi=4: [0,0,1,1,2,2], hi=3. Do not increment mid yet.",
      active: [2, 4], done: [0, 1],
      values: { lo: 2, mid: 2, hi: 4, "a[mid]": 2 } },
    { note: "a[mid]=1 \u2192 just mid++. Then a[mid]=1 \u2192 mid++. mid > hi, stop.",
      active: [2, 3], done: [0, 1, 4, 5],
      values: { lo: 2, mid: 3, hi: 3, "a[mid]": 1 } },
    { note: "Done: [0,0,1,1,2,2]. Zeros left of lo, twos right of hi, ones in the middle.",
      best: [0, 1, 2, 3, 4, 5],
      values: { lo: 2, mid: 4, hi: 3, "a[mid]": "\u2014" } },
    { note: "Same array via counting: cnt=[2,2,2], emit two 0s, two 1s, two 2s. Linear, extra R memory.",
      done: [0, 1, 2, 3, 4, 5],
      values: { lo: "count", mid: "\u2014", hi: "\u2014", "a[mid]": "[2,2,2]" } },
  ],
  mermaid: `flowchart TD
  key["integer key"] --> range{"how large is R?"}
  range -- "R is 2 or 3" --> flag["Dutch national flag in place"]
  range -- "R = O(n)" --> count["counting sort, array of size R"]
  range -- "32-bit but R huge" --> radix["LSD radix, stable counting per digit"]
  range -- "unknown distribution" --> bucket["bucket / pigeonhole for gaps"]
  range -- "no integer key" --> cmp["wrong page: comparison sort"]`,
  merTitle: "Which linear sort?",
  steps: [
    "<strong>Read the range.</strong> If keys are not integers in a small universe, stop.",
    "<strong>R \u2264 3:</strong> Dutch national flag, in-place, one pass.",
    "<strong>R = O(n):</strong> <code>int[] cnt = new int[R]</code>, tally, then emit or scatter.",
    "<strong>Stable scatter:</strong> prefix of counts \u2192 starting index; walk the input " +
      "left-to-right or right-to-left as required.",
    "<strong>Radix LSD:</strong> for each digit from least significant, stable-count on that digit.",
    "<strong>Buckets / max gap:</strong> n-1 buckets over [min,max]; the max gap is not inside " +
      "a bucket.",
    "<strong>Negatives:</strong> shift by <code>min</code>, or radix on unsigned bit patterns.",
  ],
  code: [
    { tab: "Brute", panel: "Brute", file: "CountBrute.java",
      intro: "Library sort is correct and simpler. Use it unless R is tiny or they ask for linear.",
      code: `import java.util.Arrays;

public class CountBrute {
    static int[] sort(int[] a) {
        int[] b = a.clone();
        Arrays.sort(b);
        return b;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(sort(new int[] {2, 0, 2, 1, 1, 0})));
    }
    // Input : [2, 0, 2, 1, 1, 0]
    // Output: [0, 0, 1, 1, 2, 2]
}` },
    { tab: "Optimal", panel: "Optimal", file: "DutchFlag.java",
      intro: "Three-way partition and counting sort on a general small range.",
      code: `import java.util.Arrays;

public class DutchFlag {
    static void sortColors(int[] a) {
        int lo = 0, mid = 0, hi = a.length - 1;
        while (mid <= hi) {
            if (a[mid] == 0) {
                swap(a, lo++, mid++);
            } else if (a[mid] == 2) {
                swap(a, mid, hi--);
            } else {
                mid++;
            }
        }
    }

    static int[] countingSort(int[] a, int r) {
        int[] cnt = new int[r];
        for (int v : a) {
            cnt[v]++;
        }
        int[] out = new int[a.length];
        int k = 0;
        for (int v = 0; v < r; v++) {
            for (int c = 0; c < cnt[v]; c++) {
                out[k++] = v;
            }
        }
        return out;
    }

    static void swap(int[] a, int i, int j) {
        int t = a[i];
        a[i] = a[j];
        a[j] = t;
    }

    public static void main(String[] args) {
        int[] a = {2, 0, 2, 1, 1, 0};
        sortColors(a);
        System.out.println(Arrays.toString(a));
        System.out.println(Arrays.toString(countingSort(new int[] {2, 0, 2, 1, 1, 0}, 3)));
    }
    // Input : [2, 0, 2, 1, 1, 0]
    // Output: [0, 0, 1, 1, 2, 2]
    //         [0, 0, 1, 1, 2, 2]
}` },
    { tab: "Template", panel: "Template", file: "RadixLsd.java",
      intro: "Stable LSD radix on non-negative ints, base 256, four passes.",
      code: `import java.util.Arrays;

public class RadixLsd {
    static void radixSort(int[] a) {
        int n = a.length;
        int[] tmp = new int[n];
        for (int shift = 0; shift < 32; shift += 8) {
            int[] cnt = new int[256];
            for (int v : a) {
                cnt[(v >>> shift) & 255]++;
            }
            int[] pos = new int[256];
            for (int i = 1; i < 256; i++) {
                pos[i] = pos[i - 1] + cnt[i - 1];
            }
            for (int v : a) {
                int d = (v >>> shift) & 255;
                tmp[pos[d]++] = v;
            }
            int[] swap = a;
            a = tmp;
            tmp = swap;
        }
    }

    public static void main(String[] args) {
        int[] a = {170, 45, 75, 90, 802, 24, 2, 66};
        radixSort(a);
        System.out.println(Arrays.toString(a));
    }
    // Input : [170, 45, 75, 90, 802, 24, 2, 66]
    // Output: [2, 24, 45, 66, 75, 90, 170, 802]
}` },
  ],
  complexity: {
    time: "Counting O(n + R); radix O(n \u00b7 w); DNF O(n)",
    space: "O(n + R) for stable counting; O(1) extra for DNF",
    derivation: [
      "<p>Counting: one tally pass and one emit/scatter pass over n items plus R buckets: " +
        "<span class=\"eq\">T(n,R) = \u0398(n + R)</span>. Memory is the same order.</p>",
      "<p>LSD radix with digit width w (e.g. 4 bytes): " +
        "<span class=\"eq\">T(n) = \u0398(w(n + B))</span> with B = 256. That is linear in n " +
        "for fixed-width ints. DNF is one pass, three pointers, no extra histogram.</p>",
    ],
    compare: [
      ["Arrays.sort", "O(n log n)", "O(log n)", "Default when R is huge"],
      ["Dutch flag", "O(n)", "O(1)", "Exactly 2 or 3 values"],
      ["Counting sort", "O(n + R)", "O(n + R)", "R = O(n) integers"],
      ["LSD radix", "O(n w)", "O(n)", "Fixed-width integers"],
      ["Bucket / pigeonhole", "O(n)", "O(n)", "Max gap; uniform assumption"],
    ],
  },
  pitfalls: [
    { title: "Indexing cnt[a[i]] on a negative key",
      bug: "<code>ArrayIndexOutOfBoundsException</code> or a huge R if you shift wrong.",
      fix: "Subtract <code>min</code> first, or radix on unsigned bits (<code>&gt;&gt;&gt;</code>)." },
    { title: "Incrementing mid after swapping a 2",
      bug: "The value swapped in from <code>hi</code> has not been inspected. You skip a 0.",
      fix: "On a 2: swap with hi and do <em>not</em> increment mid. On a 0: increment both." },
    { title: "Unstable counting inside radix",
      bug: "Emitting by walking v = 0..R destroys the previous digit's order.",
      fix: "Scatter via prefix positions, walking the input in a consistent direction." },
    { title: "R = 1e9 with n = 1e5",
      bug: "<code>new int[1_000_000_000]</code> is a memory error, not a linear sort.",
      fix: "Coordinate-compress, or comparison-sort the n values." },
    { title: "Max-gap putting n values into n buckets of width (max-min)/n",
      bug: "The max adjacent gap in the sorted array can sit inside a bucket if you use n " +
        "buckets carelessly, or you divide by zero when max==min.",
      fix: "Use n-1 buckets over the exclusive range, handle max==min, scan adjacent " +
        "non-empty buckets." },
  ],
  variants: [
    ["H-index (citations in 0..n)",
      "Clamp cites at n, count, walk from n down until papers \u2265 i.",
      "cnt[Math.min(c, n)]++; then accumulate from the right.",
      "LC 274."],
    ["Maximum gap",
      "Pigeonhole: max adjacent sorted gap is at least ceil((max-min)/(n-1)).",
      "Buckets store min/max; answer is max over empty-skipped neighbours.",
      "LC 164."],
    ["Relative sort / custom order",
      "Count 0..1000, emit in arr2 order, then the rest sorted.",
      "int[] cnt = new int[1001]; then walk arr2 then 0..1000.",
      "LC 1122."],
  ],
  followups: [
    ["Why does radix need a stable inner sort?",
      "<p>After sorting on digit k, items with the same digit k must keep their order from " +
      "digits 0..k-1. An unstable inner sort reshuffles those, and the higher-digit pass " +
      "cannot recover it. Counting-with-scatter is stable; dual-pivot quicksort is not.</p>"],
    ["Can counting sort be in-place?",
      "<p>The histogram is extra R memory. You can cycle-swap into place using the prefix " +
      "positions, but it is not worth it in an interview. DNF is the in-place special case " +
      "for R=3.</p>"],
    ["How do you handle 32-bit negatives in radix?",
      "<p>XOR with 1&lt;&lt;31 to flip the sign bit so negatives come first as unsigned, sort, " +
      "then flip back. Or shift by subtracting Integer.MIN_VALUE as long.</p>"],
    ["When is counting slower than Arrays.sort?",
      "<p>When R is millions and n is thousands: you touch a huge cold array. Constants " +
      "matter. Rule of thumb: counting wins when R is a small multiple of n and the array " +
      "fits in cache.</p>"],
  ],
  problems: [
    { url: "https://leetcode.com/problems/sort-colors/", name: "Sort Colors",
      badge: "lc", tag: "LC 75", level: "Medium", pattern: "Dutch national flag" },
    { url: "https://leetcode.com/problems/h-index/", name: "H-Index",
      badge: "lc", tag: "LC 274", level: "Medium", pattern: "Count citations clamped to n" },
    { url: "https://leetcode.com/problems/maximum-gap/", name: "Maximum Gap",
      badge: "lc", tag: "LC 164", level: "Medium", pattern: "Pigeonhole buckets" },
    { url: "https://leetcode.com/problems/relative-sort-array/", name: "Relative Sort Array",
      badge: "lc", tag: "LC 1122", level: "Easy", pattern: "Count 0..1000, emit in custom order" },
    { url: "https://leetcode.com/problems/sort-characters-by-frequency/", name: "Sort Characters By Frequency",
      badge: "lc", tag: "LC 451", level: "Medium", pattern: "Count 256, bucket by frequency" },
    { url: "https://leetcode.com/problems/top-k-frequent-elements/", name: "Top K Frequent Elements",
      badge: "lc", tag: "LC 347", level: "Medium", pattern: "Count then bucket by freq 0..n" },
    { url: "https://codeforces.com/problemset/problem/670/C", name: "Cinema",
      badge: "cf", tag: "CF 670C", level: "Medium", pattern: "Count language frequencies, then pick" },
    { url: "https://codeforces.com/problemset/problem/433/B", name: "Kuriyama Mirai's Stones",
      badge: "cf", tag: "CF 433B", level: "Easy", pattern: "Sort a copy, prefix both orders" },
  ],
  recap: [
    "<strong>Small integer range</strong> \u2192 histogram, not comparisons.",
    "<strong>R=3</strong> \u2192 Dutch flag, do not increment mid on a swap with hi.",
    "<strong>Radix LSD</strong> needs a stable inner counting scatter.",
    "<strong>R \u226b n</strong> \u2192 compress or comparison-sort; do not allocate R.",
    "<strong>Max gap</strong> is pigeonhole: the big empty space is between buckets.",
  ],
  oneliner: "while (mid <= hi) { if (a[mid]==0) swap(lo++,mid++); else if (a[mid]==2) swap(mid,hi--); else mid++; }",
}),

/* =========================== 3. intervals ============================== */
pack({
  id: "intervals",
  difficulty: "Medium",
  readTime: "22 min",
  tagline: "Sort intervals by start (or by end), then a linear scan merges, punches holes, " +
    "or counts how many overlap a point &mdash; the geometry is one-dimensional.",
  tags: ["intervals", "sweep", "merge", "greedy", "P0"],
  prereqs: [
    ["Sorting & Comparators", "sorting-and-comparators.html"],
    ["Two Pointers", "../01-arrays-and-windows/two-pointers.html"],
  ],
  why: [
    "An interval is a pair <code>[l, r]</code>. Naive \"compare every pair\" is " +
      "<code>O(n&sup2;)</code> and dies at <code>n = 10&#8309;</code>. After sorting by " +
      "start, overlaps are contiguous: if the current interval does not touch the previous " +
      "merged end, nothing later with a larger start will touch it either. That single " +
      "observation is merge intervals, insert interval, and coverage.",
    "The other sort, by end, is the greedy for \"how many can I keep if they must not " +
      "overlap\": always keep the one that finishes first. Meeting rooms, arrows bursting " +
      "balloons, and non-overlapping removal are the same proof with a flipped sign.",
    "Sweep-line is the same idea with an explicit event queue: +1 at l, &minus;1 at r, " +
      "walk left to right, and the running sum is how many intervals cover this point. " +
      "That answers \"maximum concurrent meetings\" without building the merged list.",
  ],
  insight: "In one dimension, sorting turns geometry into adjacency. After the sort, every " +
    "decision looks at the current interval and a single running endpoint (or a running count).",
  yes: [
    "\"Merge overlapping intervals\", \"insert an interval into a sorted list\"",
    "\"Minimum arrows / meetings / rooms\" &mdash; concurrent overlap or greedy keep-by-end",
    "\"Employee free time\", \"covered points\", \"range module\" as a list of disjoint intervals",
    "A set of segments on a line; queries about union length or maximum overlap",
    "\"Can you attend all meetings?\" &mdash; sort by start, check adjacent overlap",
  ],
  no: [
    "2D rectangles with both axes mattering &rarr; sweep + a tree on the other axis, not this page",
    "Intervals that you must update online as a balanced tree of ranges &rarr; TreeMap or a segment tree",
    "Circular intervals on a clock without a cut &rarr; duplicate the array or pick a cut point",
    "Graph intervals as edges of a constraint graph &rarr; 2-SAT / difference constraints",
  ],
  table: [
    ["\"merge all overlapping\"", "Sort by start, extend running end", "LC 56"],
    ["\"insert one interval\"", "Copy before, merge through, copy after", "LC 57"],
    ["\"erase overlap, keep max number\"", "Sort by end, greedy take", "LC 435"],
    ["\"min arrows to burst balloons\"", "Same greedy as 435, arrows at ends", "LC 452"],
    ["\"meeting rooms II\"", "Sweep +1/\u22121, max running", "LC 253"],
    ["\"interval intersection of two lists\"", "Two pointers on sorted disjoint lists", "LC 986"],
    ["<strong>Confused with:</strong> sliding window on an array",
      "Windows are index ranges on a sequence; intervals are values on a line",
      "<a href=\"../01-arrays-and-windows/sliding-window.html\">Sliding window</a>"],
  ],
  constraint: "<code>n &le; 10&#8309;</code> intervals forces <code>O(n log n)</code> sort plus " +
    "a linear scan. Coordinates up to <code>10&#8313;</code> need <code>long</code> for union " +
    "length. Inclusive vs exclusive ends is a spec question: check whether <code>[1,2]</code> " +
    "and <code>[2,3]</code> overlap.",
  core: [
    "Merge: sort by start. Keep a running <code>[curL, curR]</code>. If the next start is " +
      "<code>&le; curR</code> (or <code>&lt;</code> if ends are exclusive), extend " +
      "<code>curR = max(curR, nextR)</code>; else emit <code>cur</code> and start a new one. " +
      "The sort is what makes \"next\" the only candidate that can overlap.",
    "Non-overlap greedy: sort by <em>end</em>. Keep the interval that finishes first; skip " +
      "anything that starts before that end. Proof: any kept set can replace its last interval " +
      "with this earlier finish without losing feasibility, so the greedy stays ahead. Sweep " +
      "for rooms: emit start events before end events at a tied time if a meeting can reuse a " +
      "room that just freed (depends on the statement).",
  ],
  invariant: "<p>After sorting by start, a single running end <code>curR</code> satisfies:</p>" +
    "<span class=\"eq\">every emitted interval is disjoint from the later ones, and curR is " +
    "the max end of the open merge</span>" +
    "<p>Interview sentence: <em>\"I sort so overlaps become adjacent, then I only track one " +
    "running endpoint.\"</em></p>",
  array: [1, 3, 2, 6, 8, 10, 15, 18],
  indexLabels: ["l0", "r0", "l1", "r1", "l2", "r2", "l3", "r3"],
  vars: ["i", "curL", "curR", "action"],
  frames: [
    { note: "Sorted by start: [1,3], [2,6], [8,10], [15,18]. Flattened as [1,3,2,6,8,10,15,18]. Open [1,3].",
      window: [0, 1], dim: [2, 3, 4, 5, 6, 7],
      values: { i: 0, curL: 1, curR: 3, action: "open first" } },
    { note: "Next [2,6]: 2 \u2264 3, overlap. Extend curR = max(3,6) = 6. Current merge [1,6].",
      window: [0, 3], active: [2, 3],
      values: { i: 1, curL: 1, curR: 6, action: "extend" } },
    { note: "Next [8,10]: 8 > 6, no overlap. Emit [1,6] and open [8,10].",
      best: [0, 1, 2, 3], active: [4, 5], dim: [6, 7],
      values: { i: 2, curL: 8, curR: 10, action: "emit + open" } },
    { note: "Next [15,18]: 15 > 10. Emit [8,10], open [15,18].",
      done: [0, 1, 2, 3], best: [4, 5], active: [6, 7],
      values: { i: 3, curL: 15, curR: 18, action: "emit + open" } },
    { note: "End of list. Emit [15,18]. Merged: [1,6], [8,10], [15,18].",
      done: [0, 1, 2, 3, 4, 5], best: [6, 7],
      values: { i: "done", curL: 15, curR: 18, action: "emit last" } },
    { note: "Same data, rooms-greedy would sort by end and count a new room whenever start < lastEnd.",
      dim: [0, 1, 2, 3, 4, 5, 6, 7],
      values: { i: "alt", curL: "\u2014", curR: "\u2014", action: "sort by end" } },
    { note: "Sweep view: +1 at 1, +1 at 2, \u22121 at 3, \u22121 at 6 \u2192 max overlap 2 in [2,3].",
      window: [0, 3],
      values: { i: "sweep", curL: 2, curR: 3, action: "max cover = 2" } },
  ],
  mermaid: `flowchart TD
  q["interval question"] --> goal{"union, select, or overlap count?"}
  goal -- union / merge --> byStart["sort by start, extend running end"]
  goal -- max keep / min arrows --> byEnd["sort by end, greedy take"]
  goal -- max concurrent --> sweep["+1 at start, -1 at end, max running"]
  goal -- two sorted lists --> twoPtr["two pointers, advance the one that ends first"]
  byStart --> out["linear scan after n log n sort"]
  byEnd --> out
  sweep --> out
  twoPtr --> out`,
  merTitle: "Which interval sort?",
  steps: [
    "<strong>Decide inclusive vs exclusive</strong> ends. It changes <code>&le;</code> vs <code>&lt;</code>.",
    "<strong>Union / merge:</strong> sort by start, extend a running end, emit when a gap appears.",
    "<strong>Max non-overlapping:</strong> sort by end, take if start &ge; lastEnd.",
    "<strong>Rooms / concurrent:</strong> events +1/\u22121, sort by time, max the running sum.",
    "<strong>Two lists of disjoint intervals:</strong> two pointers; advance the earlier end.",
    "<strong>Insert:</strong> copy strictly-before, merge all that overlap the new one, copy after.",
    "<strong>Use long</strong> for union length: ends up to 1e9, n up to 1e5.",
  ],
  code: [
    { tab: "Brute", panel: "Brute", file: "IntervalBrute.java",
      intro: "Pairwise overlap checks. Correct, quadratic, only for n \u2264 2000.",
      code: `public class IntervalBrute {
    static boolean anyOverlap(int[][] a) {
        int n = a.length;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (a[i][0] <= a[j][1] && a[j][0] <= a[i][1]) {
                    return true;
                }
            }
        }
        return false;
    }

    public static void main(String[] args) {
        int[][] a = {{1, 3}, {2, 6}, {8, 10}};
        System.out.println(anyOverlap(a));
    }
    // Input : [1,3], [2,6], [8,10]
    // Output: true
}` },
    { tab: "Optimal", panel: "Optimal", file: "MergeIntervals.java",
      intro: "Sort by start, merge in one pass. Also the min-arrows greedy (sort by end).",
      code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class MergeIntervals {
    static int[][] merge(int[][] a) {
        Arrays.sort(a, (u, v) -> Integer.compare(u[0], v[0]));
        List<int[]> out = new ArrayList<>();
        int curL = a[0][0], curR = a[0][1];
        for (int i = 1; i < a.length; i++) {
            if (a[i][0] <= curR) {
                curR = Math.max(curR, a[i][1]);
            } else {
                out.add(new int[] {curL, curR});
                curL = a[i][0];
                curR = a[i][1];
            }
        }
        out.add(new int[] {curL, curR});
        return out.toArray(new int[0][]);
    }

    static int minArrows(int[][] points) {
        Arrays.sort(points, (u, v) -> Integer.compare(u[1], v[1]));
        int arrows = 1;
        int end = points[0][1];
        for (int i = 1; i < points.length; i++) {
            if (points[i][0] > end) {
                arrows++;
                end = points[i][1];
            }
        }
        return arrows;
    }

    public static void main(String[] args) {
        int[][] m = merge(new int[][] {{1, 3}, {2, 6}, {8, 10}, {15, 18}});
        System.out.println(Arrays.deepToString(m));
        System.out.println(minArrows(new int[][] {{10, 16}, {2, 8}, {1, 6}, {7, 12}}));
    }
    // Input : merge [1,3][2,6][8,10][15,18]; arrows [10,16][2,8][1,6][7,12]
    // Output: [[1, 6], [8, 10], [15, 18]]
    //         2
}` },
    { tab: "Template", panel: "Template", file: "IntervalSweep.java",
      intro: "Sweep for maximum overlap (meeting rooms II) and two-list intersection.",
      code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class IntervalSweep {
    static int minRooms(int[][] meetings) {
        int n = meetings.length;
        int[] start = new int[n];
        int[] end = new int[n];
        for (int i = 0; i < n; i++) {
            start[i] = meetings[i][0];
            end[i] = meetings[i][1];
        }
        Arrays.sort(start);
        Arrays.sort(end);
        int i = 0, j = 0, cur = 0, best = 0;
        while (i < n) {
            if (start[i] < end[j]) {
                cur++;
                best = Math.max(best, cur);
                i++;
            } else {
                cur--;
                j++;
            }
        }
        return best;
    }

    static int[][] intersect(int[][] a, int[][] b) {
        List<int[]> out = new ArrayList<>();
        int i = 0, j = 0;
        while (i < a.length && j < b.length) {
            int l = Math.max(a[i][0], b[j][0]);
            int r = Math.min(a[i][1], b[j][1]);
            if (l <= r) {
                out.add(new int[] {l, r});
            }
            if (a[i][1] < b[j][1]) {
                i++;
            } else {
                j++;
            }
        }
        return out.toArray(new int[0][]);
    }

    public static void main(String[] args) {
        System.out.println(minRooms(new int[][] {{0, 30}, {5, 10}, {15, 20}}));
        int[][] x = intersect(new int[][] {{0, 2}, {5, 10}, {13, 23}},
            new int[][] {{1, 5}, {8, 12}, {15, 24}});
        System.out.println(Arrays.deepToString(x));
    }
    // Input : rooms [0,30][5,10][15,20]; intersect two disjoint lists
    // Output: 2
    //         [[1, 2], [5, 5], [8, 10], [15, 23]]
}` },
  ],
  complexity: {
    time: "O(n log n) sort + O(n) scan",
    space: "O(n) for the output (and for event arrays)",
    derivation: [
      "<p>The sort dominates: <span class=\"eq\">T(n) = \u0398(n log n) + \u0398(n)</span>. " +
        "After sorting, each interval is inspected a constant number of times.</p>",
      "<p>Sweep with 2n events is the same class. Two-pointer intersection of already-sorted " +
        "disjoint lists is <code>O(n + m)</code> with no extra sort.</p>",
    ],
    compare: [
      ["Pairwise overlap", "O(n\u00b2)", "O(1)", "n \u2264 2000"],
      ["Sort by start + merge", "O(n log n)", "O(n)", "Union / coverage"],
      ["Sort by end + greedy", "O(n log n)", "O(1)", "Max keep / min arrows"],
      ["Sweep +1/\u22121", "O(n log n)", "O(n)", "Max concurrent rooms"],
      ["TreeMap of ranges", "O(n log n) online", "O(n)", "Range module / calendars"],
    ],
  },
  pitfalls: [
    { title: "Inclusive ends treated as exclusive",
      bug: "[1,2] and [2,3] should merge on LC 56 but a <code>&lt;</code> test leaves a gap.",
      fix: "Read the statement. LC 56 overlaps at a shared endpoint; LC 452 arrows too." },
    { title: "Sorting by the wrong coordinate",
      bug: "Merging after sorting by end misses an overlap that starts late and stretches far.",
      fix: "Union \u2192 sort by start. Greedy keep \u2192 sort by end. Do not mix." },
    { title: "int overflow on union length",
      bug: "<code>r - l + 1</code> with l, r up to 1e9 and n up to 1e5, summed in int.",
      fix: "Accumulate in <code>long</code>. Subtract as long before adding one." },
    { title: "Forgetting to emit the last interval",
      bug: "The loop only emits when a gap appears, so the final running merge is dropped.",
      fix: "Always <code>out.add(cur)</code> after the loop." },
    { title: "Start and end events at the same time",
      bug: "Processing a start before an end at time t counts an extra room that just freed.",
      fix: "If a room can be reused at time t, process ends first. Match the problem's " +
        "\"touching is OK\" rule." },
  ],
  variants: [
    ["Insert interval",
      "Walk until overlap, merge the overlapping run, copy the tail.",
      "three phases: before, merge-while-overlap, after.",
      "LC 57."],
    ["Covered points / union length",
      "Merge then sum (r-l) of disjoint pieces; or sweep with a counter.",
      "long union = 0; for merged: union += (long) r - l;",
      "CF 1000C is the online version with a map."],
    ["Video stitching / jump-on-intervals",
      "Sort by start, among intervals that cover currentEnd pick the farthest end.",
      "Same as jump game II on a line of segments.",
      "LC 1024, LC 1326."],
  ],
  followups: [
    ["Why sort by end for \"remove minimum overlapping\"?",
      "<p>The interval that finishes first leaves the most room for the rest. If an optimal " +
      "solution keeps a later-ending interval in that slot, swap it for the greedy choice: " +
      "the end only moves left, so later intervals that fitted still fit.</p>"],
    ["How do you list points covered by exactly k intervals?",
      "<p>Sweep with +1 at l and \u22121 at r. Whenever the running count changes, close the " +
      "previous segment at this x and open a new one. Group by the count value.</p>"],
    ["Intervals arrive online and you must merge on the fly?",
      "<p>A TreeMap from start to end, or a balanced tree of disjoint ranges. Lower-bound the " +
      "start, walk neighbours that overlap, delete them, insert the union. See TreeMap patterns.</p>"],
    ["What changes on a circle?",
      "<p>Cut at 0, or duplicate the array shifted by the circumference so a wrap-around " +
      "interval becomes a linear one. Take care not to double-count the cut point.</p>"],
  ],
  problems: [
    { url: "https://leetcode.com/problems/merge-intervals/", name: "Merge Intervals",
      badge: "lc", tag: "LC 56", level: "Medium", pattern: "Sort by start, extend end" },
    { url: "https://leetcode.com/problems/insert-interval/", name: "Insert Interval",
      badge: "lc", tag: "LC 57", level: "Medium", pattern: "Copy / merge / copy" },
    { url: "https://leetcode.com/problems/non-overlapping-intervals/", name: "Non-overlapping Intervals",
      badge: "lc", tag: "LC 435", level: "Medium", pattern: "Sort by end, greedy keep" },
    { url: "https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/", name: "Min Arrows to Burst Balloons",
      badge: "lc", tag: "LC 452", level: "Medium", pattern: "Same greedy as 435" },
    { url: "https://leetcode.com/problems/meeting-rooms/", name: "Meeting Rooms",
      badge: "lc", tag: "LC 252", level: "Easy", pattern: "Sort by start, check adjacent" },
    { url: "https://leetcode.com/problems/meeting-rooms-ii/", name: "Meeting Rooms II",
      badge: "lc", tag: "LC 253", level: "Medium", pattern: "Sweep max overlap" },
    { url: "https://leetcode.com/problems/interval-list-intersections/", name: "Interval List Intersections",
      badge: "lc", tag: "LC 986", level: "Medium", pattern: "Two pointers on sorted lists" },
    { url: "https://leetcode.com/problems/remove-covered-intervals/", name: "Remove Covered Intervals",
      badge: "lc", tag: "LC 1288", level: "Medium", pattern: "Sort start asc, end desc" },
  ],
  recap: [
    "<strong>Sort by start</strong> to merge / take union.",
    "<strong>Sort by end</strong> to keep the maximum non-overlapping set.",
    "<strong>Sweep +1/\u22121</strong> for maximum concurrent overlap.",
    "<strong>Emit the last interval</strong> after the merge loop.",
    "<strong>Inclusive vs exclusive</strong> ends change the comparison.",
  ],
  oneliner: "if (a[i][0] <= curR) curR = Math.max(curR, a[i][1]); else emit and restart;",
}),

/* =========================== 4. cyclic-sort-and-index-tricks =========== */
pack({
  id: "cyclic-sort-and-index-tricks",
  difficulty: "Medium",
  readTime: "20 min",
  tagline: "When the array is a permutation of a known range, the value is the address: " +
    "swap each number toward index value-1 until every cycle closes.",
  tags: ["cyclic sort", "permutation", "index as hash", "P1"],
  prereqs: [
    ["Sorting & Comparators", "sorting-and-comparators.html"],
    ["Two Pointers", "../01-arrays-and-windows/two-pointers.html"],
  ],
  why: [
    "If every value lies in <code>1..n</code> (or <code>0..n-1</code>) and you are allowed " +
      "to mutate, the array is its own hash table. The number <code>x</code> belongs at index " +
      "<code>x-1</code>. Swapping along that rule sorts in linear time with O(1) extra memory, " +
      "and the leftover mismatches are exactly the missing, duplicate, or disappeared numbers.",
    "This is the native language of a whole LC cluster: missing number, first missing " +
      "positive, find all duplicates, set mismatch, find the duplicate without modifying " +
      "(Floyd on the functional graph). Interviewers like it because it looks like a magic " +
      "trick until you say \"the value is the index\".",
    "The same idea without swaps is \"index as a sign bit\": negate <code>a[|x|-1]</code> to " +
      "mark that x was seen. It needs the array to be writable and the range to be " +
      "<code>1..n</code>. When you cannot write, the functional graph of " +
      "<code>i \u2192 a[i]</code> still has a cycle you can find with Floyd.",
  ],
  insight: "A permutation is a set of cycles on indices. Putting each value at its index is " +
    "walking those cycles with swaps. What refuses to sit still is the duplicate or the missing.",
  yes: [
    "Array of length n, values in 1..n or 0..n, possibly with one duplicate / one missing",
    "\"Find all numbers that disappeared\", \"first missing positive\"",
    "\"Find the duplicate without extra memory\" (cycle in the functional graph)",
    "You may mutate the array and O(1) extra space is required",
    "\"Place each number at index num-1\" is a legal operation on the input",
  ],
  no: [
    "Arbitrary integers with a huge range &rarr; hash set or sort, not index placement",
    "You must not mutate and you may use O(n) space &rarr; HashSet / boolean[]",
    "The graph is a general directed graph, not a functional graph of outdegree 1 \u2192 DFS on a real graph, not cyclic sort",
    "You need full sorted order of arbitrary keys \u2192 comparison sort",
  ],
  table: [
    ["Values are a permutation of 1..n", "Swap a[i] toward a[i]-1", "Cyclic sort"],
    ["One missing from 0..n", "XOR all indices and values, or place 1..n", "LC 268"],
    ["All disappeared from 1..n", "Place, then collect indices still wrong", "LC 448"],
    ["Find the duplicate, may mutate", "Place; the one that collides is the duplicate", "LC 287 mutate"],
    ["Find the duplicate, no mutate", "Floyd: i \u2192 a[i] has a cycle", "LC 287 Floyd"],
    ["First missing positive", "Ignore out of 1..n, cyclic-sort the rest", "LC 41"],
    ["<strong>Confused with:</strong> counting sort",
      "Counting uses extra R memory; cyclic sort uses the array as the table",
      "Use cyclic when O(1) extra is required"],
  ],
  constraint: "<code>n &le; 10&#8309;</code> with values in a range of length n is the " +
    "signature. First-missing-positive allows values outside 1..n: skip those, they cannot " +
    "be placed. Floyd needs the array to encode a function on 1..n with no zeros.",
  core: [
    "Cyclic sort: for i from 0 to n-1, while <code>a[i]</code> is in range and not already " +
      "at home (<code>a[i] != a[a[i]-1]</code>), swap it there. Each swap homes at least one " +
      "value, so the inner while is amortised O(n). Afterward, index i should hold i+1; any " +
      "break is the answer.",
    "First missing positive: treat anything \u2264 0 or &gt; n as garbage that cannot occupy " +
      "a slot. After placement, the first i with <code>a[i] != i+1</code> is the answer; if " +
      "none, the answer is n+1. Floyd for the duplicate: interpret the array as " +
      "<code>next(i) = a[i]</code> (1-based), run tortoise and hare, then find the cycle entrance.",
  ],
  invariant: "<p>After the swaps, every in-range value <code>x</code> that appeared sits at " +
    "index <code>x-1</code>, unless a duplicate already occupies that slot.</p>" +
    "<span class=\"eq\">a[x-1] == x &nbsp;for every x that could be placed uniquely</span>" +
    "<p>Interview sentence: <em>\"The value is the address; I swap until every cycle of the " +
    "permutation is rotated into place, then I read the holes.\"</em></p>",
  array: [3, 1, 3, 4, 2],
  vars: ["i", "a[i]", "home", "action"],
  frames: [
    { note: "Cyclic sort on [3,1,3,4,2], looking for the duplicate. i=0, a[0]=3 belongs at index 2.",
      active: [0, 2], dim: [1, 3, 4],
      values: { i: 0, "a[i]": 3, home: 2, action: "swap 0 \u2194 2" } },
    { note: "After swap: [3,1,3,4,2] wait, a[2] was 3, so [3,1,3,4,2] \u2014 collision. Actually start [3,1,4,2,2] as LC 287 sample. Use [3,1,3,4,2]. Swap 3 with index 2: [3,1,3,4,2] \u2192 [3,1,3,4,2] if a[2] is already 3.",
      active: [0, 2],
      values: { i: 0, "a[i]": 3, home: 2, action: "a[2] already 3, stop swaps" } },
    { note: "Rewind to a clean trace on [3,1,4,2,5] a true permutation. i=0, 3 goes to index 2: [4,1,3,2,5].",
      active: [0, 2],
      values: { i: 0, "a[i]": 3, home: 2, action: "swap \u2192 [4,1,3,2,5]" } },
    { note: "i still 0, a[0]=4 belongs at 3: [2,1,3,4,5]. Then a[0]=2 belongs at 1: [1,2,3,4,5].",
      window: [0, 4], best: [0, 1, 2, 3, 4],
      values: { i: 0, "a[i]": 1, home: 0, action: "homed" } },
    { note: "Remaining indices already home. For [3,1,3,4,2]: after placement index 0 still holds 3, so 1 is missing and 3 is duplicate.",
      x: [0], done: [1, 2, 3, 4],
      values: { i: "scan", "a[i]": 3, home: 0, action: "missing 1, dup 3" } },
    { note: "First missing positive on [3,4,-1,1]: ignore -1, place 3 and 4 and 1 \u2192 first hole is 2.",
      dim: [0, 1, 2, 3, 4],
      values: { i: "LC41", "a[i]": "\u2014", home: "\u2014", action: "answer 2" } },
    { note: "Floyd view of [1,3,4,2,2]: next(i)=a[i] has a cycle at 2. Meeting point then entrance = duplicate.",
      best: [4],
      values: { i: "floyd", "a[i]": 2, home: 2, action: "cycle entrance" } },
  ],
  mermaid: `flowchart TD
  range["values sit in 1..n"] --> mutate{"may I mutate?"}
  mutate -- yes --> place["swap a[i] to index a[i]-1"]
  mutate -- no extra mem --> floyd["Floyd on i maps to a[i]"]
  mutate -- extra O(n) ok --> set["HashSet, skip this page"]
  place --> scan["read holes: missing / duplicate / first positive"]
  floyd --> scan`,
  merTitle: "Place, mark, or chase the cycle",
  steps: [
    "<strong>Confirm the range</strong> is length n (or 1..n after ignoring garbage).",
    "<strong>For each i</strong>, while <code>a[i]</code> is in range and " +
      "<code>a[i] != a[a[i]-1]</code>, swap.",
    "<strong>Stop the while</strong> when a duplicate already sits at the home index, or the " +
      "value is out of range.",
    "<strong>Scan i = 0..n-1.</strong> If <code>a[i] != i+1</code>, i+1 is missing and a[i] " +
      "may be the duplicate.",
    "<strong>First missing positive:</strong> skip \u2264 0 and &gt; n; if every slot is home, " +
      "return n+1.",
    "<strong>No-mutate duplicate:</strong> Floyd tortoise/hare on <code>f(x)=a[x]</code> " +
      "(careful with 0-based vs 1-based).",
    "<strong>Never use a[a[i]]</strong> without checking range, or you index out of bounds.",
  ],
  code: [
    { tab: "Brute", panel: "Brute", file: "CyclicBrute.java",
      intro: "HashSet of seen values. Correct, O(n) extra, what cyclic sort avoids.",
      code: `import java.util.HashSet;
import java.util.Set;

public class CyclicBrute {
    static int firstMissingPositive(int[] a) {
        Set<Integer> s = new HashSet<>();
        for (int v : a) {
            if (v > 0) {
                s.add(v);
            }
        }
        int x = 1;
        while (s.contains(x)) {
            x++;
        }
        return x;
    }

    public static void main(String[] args) {
        System.out.println(firstMissingPositive(new int[] {3, 4, -1, 1}));
        System.out.println(firstMissingPositive(new int[] {1, 2, 0}));
    }
    // Input : [3, 4, -1, 1] then [1, 2, 0]
    // Output: 2
    //         3
}` },
    { tab: "Optimal", panel: "Optimal", file: "CyclicSort.java",
      intro: "Place each in-range value at index value-1, then read the first hole.",
      code: `public class CyclicSort {
    static int firstMissingPositive(int[] a) {
        int n = a.length;
        for (int i = 0; i < n; i++) {
            while (a[i] >= 1 && a[i] <= n && a[a[i] - 1] != a[i]) {
                swap(a, i, a[i] - 1);
            }
        }
        for (int i = 0; i < n; i++) {
            if (a[i] != i + 1) {
                return i + 1;
            }
        }
        return n + 1;
    }

    static int findDuplicate(int[] a) {
        int n = a.length;
        for (int i = 0; i < n; i++) {
            while (a[i] >= 1 && a[i] <= n && a[a[i] - 1] != a[i]) {
                swap(a, i, a[i] - 1);
            }
        }
        for (int i = 0; i < n; i++) {
            if (a[i] != i + 1) {
                return a[i];
            }
        }
        return -1;
    }

    static void swap(int[] a, int i, int j) {
        int t = a[i];
        a[i] = a[j];
        a[j] = t;
    }

    public static void main(String[] args) {
        System.out.println(firstMissingPositive(new int[] {3, 4, -1, 1}));
        System.out.println(findDuplicate(new int[] {1, 3, 4, 2, 2}));
    }
    // Input : [3, 4, -1, 1] then [1, 3, 4, 2, 2]
    // Output: 2
    //         2
}` },
    { tab: "Template", panel: "Template", file: "FloydDup.java",
      intro: "Find the duplicate with Floyd when mutation is forbidden. Array is f(x)=a[x].",
      code: `public class FloydDup {
    static int findDuplicate(int[] a) {
        int slow = a[0];
        int fast = a[0];
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
        System.out.println(findDuplicate(new int[] {1, 3, 4, 2, 2}));
        System.out.println(findDuplicate(new int[] {3, 1, 3, 4, 2}));
    }
    // Input : [1, 3, 4, 2, 2] then [3, 1, 3, 4, 2]
    // Output: 2
    //         3
}` },
  ],
  complexity: {
    time: "O(n) amortised swaps + O(n) scan",
    space: "O(1) extra (Floyd also O(1); HashSet is O(n))",
    derivation: [
      "<p>Each swap places at least one new value into its home (or proves a duplicate). A " +
        "value already home is never swapped again, so the inner while runs \u2264 n times " +
        "across the whole array: <span class=\"eq\">T(n) = \u0398(n)</span>.</p>",
      "<p>Floyd is the linked-list cycle proof on a functional graph of n+1 nodes and n+1 " +
        "edges (indices 0 unused, values 1..n). Two O(n) pointer walks.</p>",
    ],
    compare: [
      ["HashSet", "O(n)", "O(n)", "Simplest; extra memory"],
      ["Sort then scan", "O(n log n)", "O(1) or O(n)", "Allowed when they do not want the trick"],
      ["Cyclic sort", "O(n)", "O(1)", "May mutate; range is 1..n"],
      ["Negate-as-mark", "O(n)", "O(1)", "Writable array, values 1..n"],
      ["Floyd cycle", "O(n)", "O(1)", "Duplicate, no mutate"],
    ],
  },
  pitfalls: [
    { title: "Infinite swap on a duplicate",
      bug: "<code>while (a[i] != i+1) swap(i, a[i]-1)</code> loops forever when two copies of " +
        "x both want index x-1.",
      fix: "Stop when <code>a[a[i]-1] == a[i]</code>, i.e. home already holds this value." },
    { title: "Placing 0 or n+1",
      bug: "<code>a[a[i]-1]</code> with a[i]=0 indexes -1. First missing positive must skip " +
        "out-of-range values.",
      fix: "Guard <code>a[i] &gt;= 1 &amp;&amp; a[i] &lt;= n</code> before any home access." },
    { title: "Floyd 0-based off-by-one",
      bug: "Starting at index 0 when 0 is not a node of f(x)=a[x] on a 1-based permutation.",
      fix: "LC 287 stores values 1..n in an array of length n+1; start at a[0], follow a[·]." },
    { title: "Negate mark colliding with already-negative input",
      bug: "LC 448 input is 1..n so negation is safe; LC 41 has negatives already.",
      fix: "Cyclic-sort LC 41; do not negate unless you first sanitise the range." },
    { title: "Returning n instead of n+1",
      bug: "Array [1,2,3] as first missing positive should return 4, not a hole inside.",
      fix: "After a clean scan, the missing is n+1." },
  ],
  variants: [
    ["Find all disappeared",
      "Place or negate; collect i+1 where slot i is wrong / still positive.",
      "if (a[i] != i+1) ans.add(i+1);",
      "LC 448."],
    ["Set mismatch (one dup, one missing)",
      "Place; the slot with the wrong value is the dup, i+1 is missing.",
      "return new int[] {a[i], i+1};",
      "LC 645."],
    ["Index as hash without full placement",
      "For each x, mark a[abs(x)-1] negative; a second negative means duplicate.",
      "if (a[idx] < 0) dup = abs(x); else a[idx] = -a[idx];",
      "LC 442."],
  ],
  followups: [
    ["Why is the inner while O(n) total, not O(n\u00b2)?",
      "<p>A swap that does not immediately home a[i] still homes the other slot. Each index " +
      "becomes home at most once. Duplicates stop the loop via the <code>a[home]==value</code> " +
      "guard, so no cycle of swaps among equals.</p>"],
    ["Can you recover the original array after cyclic sort?",
      "<p>No, unless you stored the permutation. The algorithm is in-place destructive. If " +
      "the caller needs the input, clone first (and then you have O(n) extra anyway, so a " +
      "HashSet was simpler).</p>"],
    ["Why does Floyd apply to finding a duplicate?",
      "<p>n+1 slots holding values in 1..n is a pigeonhole: the map x \u2192 a[x] has a node " +
      "with two incoming edges (the duplicate). That node is the entrance of a cycle. Same " +
      "proof as linked-list cycle II.</p>"],
    ["First missing positive when n=1?",
      "<p>[1] \u2192 2; [0] \u2192 1; [2] \u2192 1. The out-of-range 2 is ignored, slot 0 is " +
      "not 1, answer 1. Always include these three unit tests.</p>"],
  ],
  problems: [
    { url: "https://leetcode.com/problems/missing-number/", name: "Missing Number",
      badge: "lc", tag: "LC 268", level: "Easy", pattern: "XOR or place 0..n-1" },
    { url: "https://leetcode.com/problems/find-all-numbers-disappeared-in-an-array/", name: "Find All Numbers Disappeared",
      badge: "lc", tag: "LC 448", level: "Easy", pattern: "Place or negate-mark" },
    { url: "https://leetcode.com/problems/find-the-duplicate-number/", name: "Find the Duplicate Number",
      badge: "lc", tag: "LC 287", level: "Medium", pattern: "Floyd or cyclic sort" },
    { url: "https://leetcode.com/problems/find-all-duplicates-in-an-array/", name: "Find All Duplicates",
      badge: "lc", tag: "LC 442", level: "Medium", pattern: "Negate-mark, second hit is dup" },
    { url: "https://leetcode.com/problems/set-mismatch/", name: "Set Mismatch",
      badge: "lc", tag: "LC 645", level: "Easy", pattern: "Place; hole + colliding value" },
    { url: "https://leetcode.com/problems/first-missing-positive/", name: "First Missing Positive",
      badge: "lc", tag: "LC 41", level: "Hard", pattern: "Ignore out of 1..n, then place" },
    { url: "https://codeforces.com/problemset/problem/285/C", name: "Building Permutation",
      badge: "cf", tag: "CF 285C", level: "Easy", pattern: "Sort, match to 1..n, long cost" },
    { url: "https://codeforces.com/problemset/problem/1367/B", name: "Even Array",
      badge: "cf", tag: "CF 1367B", level: "Easy", pattern: "Index parity vs value parity" },
  ],
  recap: [
    "<strong>Value is the address</strong> when the range is 1..n.",
    "<strong>Guard the home index</strong> so duplicates do not infinite-loop.",
    "<strong>Skip out-of-range</strong> values in first-missing-positive.",
    "<strong>Floyd</strong> when you cannot mutate: cycle entrance is the duplicate.",
    "<strong>After placement, scan holes</strong>: a[i] should equal i+1.",
  ],
  oneliner: "while (a[i] >= 1 && a[i] <= n && a[a[i] - 1] != a[i]) swap(a, i, a[i] - 1);",
}),

/* =========================== 5. hashing-patterns ======================= */
pack({
  id: "hashing-patterns",
  difficulty: "Easy",
  readTime: "22 min",
  tagline: "A hash map turns \"have I seen the partner of this value?\" into expected O(1), " +
    "which is why two-sum, anagrams, and longest consecutive all look like the same trick.",
  tags: ["hash map", "hash set", "frequency", "prefix", "P0"],
  prereqs: [
    ["Complexity Analysis", "../00-foundations/complexity-analysis.html"],
    ["Prefix Sums", "../01-arrays-and-windows/prefix-sums.html"],
  ],
  why: [
    "The naive partner search is a nested loop. A map from value to index (or value to " +
      "count) makes the inner loop a lookup. That is two-sum, group-anagrams (key = sorted " +
      "letters or a 26-count), and \"subarray sum equals k\" (key = prefix). The data " +
      "structure is the algorithm.",
    "The second skill is choosing the key. For anagrams it is a canonical signature. For " +
      "consecutive sequence it is membership in a set, plus the rule \"only start a run " +
      "from a value whose predecessor is absent\". For sliding-window uniqueness it is a " +
      "map of last-seen indices. Wrong keys give wrong collisions, which look like random " +
      "WA rather than an obvious off-by-one.",
    "Java's <code>HashMap</code> is expected O(1) and worst-case O(n) if keys collide. In " +
      "interviews state expected linear. In contests, adversarial tests exist; for integer " +
      "keys in a small range prefer an array, and for 64-bit keys consider a custom hash.",
  ],
  insight: "Store the thing you would have nested-looped for. The key is the partner: " +
    "target-x, the anagram signature, the prefix that would complete sum k, or the " +
    "predecessor that would extend a consecutive run.",
  yes: [
    "\"Two sum / pair with given XOR / pair with given difference\" in expected linear time",
    "\"Group anagrams\", \"valid anagram\", \"sort characters by frequency\"",
    "\"Longest consecutive sequence\" in O(n) expected",
    "\"Count subarrays with sum k / XOR k\" &mdash; prefix + map",
    "\"Contains nearby duplicate\", last-seen index within distance k",
  ],
  no: [
    "You need ordered keys (floor / ceiling / range) &rarr; TreeMap, not HashMap",
    "The partner is the next greater element, not an equal-to-target &rarr; monotonic stack",
    "Keys are 1..n and you may mutate &rarr; " +
      "<a href=\"cyclic-sort-and-index-tricks.html\">index as hash</a>",
    "You need worst-case O(1) lookups in a contest with anti-hash tests and huge ints &rarr; " +
      "sorted vector + binary search, or a custom splitmix hash",
  ],
  table: [
    ["two sum, pair = target", "Map value \u2192 index, look up t-x", "LC 1"],
    ["group anagrams", "Canonical key: sorted string or 26-count", "LC 49"],
    ["longest consecutive", "Set; start only if x-1 is absent", "LC 128"],
    ["subarray sum = k", "Map prefix \u2192 count, look up prefix-k", "LC 560"],
    ["no-repeat substring", "Last-seen index, shrink left", "LC 3"],
    ["4-sum II", "Map of pair sums, look up the negation", "LC 454"],
    ["<strong>Confused with:</strong> TreeMap for floor/ceiling",
      "HashMap has no order; nearby-by-value needs a tree or buckets",
      "LC 220 is TreeMap / buckets, not HashMap"],
  ],
  constraint: "<code>n &le; 10&#8309;</code> with expected O(1) lookups is the hash " +
    "signature. Integer overflow on <code>target - x</code> needs <code>long</code> keys. " +
    "Seed prefix maps with <code>(0, 1)</code> for subarray counts. Load factor and boxing " +
    "cost real constants; an <code>int[]</code> of size R beats a map when R is tiny.",
  core: [
    "Two-sum one pass: for each x, if <code>map.containsKey(target - x)</code> return the " +
      "pair of indices; then <code>map.put(x, i)</code>. Putting after the lookup avoids " +
      "using the same element twice. Consecutive sequence: dump everything into a HashSet, " +
      "then for each x whose <code>x-1</code> is missing, walk x, x+1, \u2026 until the run " +
      "breaks. Each number is visited twice at most, so expected linear.",
    "Prefix+map: running sum S, add <code>map[S-k]</code> to the answer, then increment " +
      "<code>map[S]</code>. The empty prefix 0 must be in the map before the loop. Anagram " +
      "keys: <code>char[]</code> sorted, or a frozen 26-int signature. Never use the raw " +
      "string as a key unless you want grouping by identity, not by letter bag.",
  ],
  invariant: "<p>After processing prefix <code>a[0..i]</code>, the map holds every partner " +
    "that prefix could complete:</p>" +
    "<span class=\"eq\">map[v] = how we would answer \"have I seen v?\" on a[0..i]</span>" +
    "<p>Interview sentence: <em>\"I hash the partner, not the whole nested search.\"</em></p>",
  array: [2, 7, 11, 15],
  vars: ["i", "x", "need", "map"],
  frames: [
    { note: "Two-sum, target 9, array [2,7,11,15]. Map empty. i=0, x=2, need=7. 7 not in map. Put 2\u21920.",
      active: [0], dim: [1, 2, 3],
      values: { i: 0, x: 2, need: 7, map: "{2:0}" } },
    { note: "i=1, x=7, need=2. 2 is in the map at index 0. Pair (0,1). Done.",
      active: [1], best: [0, 1], dim: [2, 3],
      values: { i: 1, x: 7, need: 2, map: "{2:0}" } },
    { note: "If we continued: i=2, x=11, need=-2, miss, put 11\u21922.",
      active: [2], done: [0, 1], dim: [3],
      values: { i: 2, x: 11, need: -2, map: "{2:0,11:2}" } },
    { note: "Consecutive on [100,4,200,1,3,2]: set of six. 1 has no predecessor, run 1-2-3-4 length 4.",
      window: [1, 3, 4, 5],
      values: { i: "run", x: 1, need: "x-1 missing", map: "set of 6" } },
    { note: "Start-of-run rule skips 2,3,4 (each has x-1). 100 and 200 are length-1 runs.",
      dim: [0, 2],
      values: { i: "skip", x: 2, need: "1 present", map: "do not restart" } },
    { note: "Prefix+map for sum k=3 on [1,2,1,2,1]: seed {0:1}. After four 1-2 pairs the count is 4.",
      done: [0, 1, 2, 3],
      values: { i: "pref", x: "S", need: "S-3", map: "counts of prefixes" } },
    { note: "HashMap is expected O(1). For keys in 0..n, prefer int[] so there is no hash at all.",
      done: [0, 1, 2, 3],
      values: { i: "note", x: "\u2014", need: "\u2014", map: "array if range tiny" } },
  ],
  mermaid: `flowchart TD
  need["need a partner lookup"] --> key{"what is the key?"}
  key -- "value / t-x" --> two["HashMap value to index"]
  key -- "letter bag" --> ana["sorted string or 26-count"]
  key -- "prefix sum" --> pre["map prefix to count, seed 0"]
  key -- "membership only" --> set["HashSet, start runs at x-1 missing"]
  key -- "floor / ceiling" --> tree["wrong page: TreeMap"]
  two --> lin["expected O(n)"]
  ana --> lin
  pre --> lin
  set --> lin`,
  merTitle: "Pick the hash key",
  steps: [
    "<strong>Name the partner</strong> you would have searched for in a nested loop.",
    "<strong>Choose the key:</strong> value, signature, prefix, or membership.",
    "<strong>One pass:</strong> look up first, then insert, so an element is not its own partner.",
    "<strong>Seed prefix maps with 0.</strong> For longest-subarray, store the earliest index.",
    "<strong>Consecutive:</strong> only expand a run from x where x-1 is absent.",
    "<strong>Tiny integer range:</strong> replace the map with <code>int[]</code>.",
    "<strong>State expected O(n)</strong> time, O(n) extra space.",
  ],
  code: [
    { tab: "Brute", panel: "Brute", file: "HashBrute.java",
      intro: "Nested two-sum. Correct, quadratic, the map removes the inner loop.",
      code: `import java.util.Arrays;

public class HashBrute {
    static int[] twoSum(int[] a, int target) {
        int n = a.length;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (a[i] + a[j] == target) {
                    return new int[] {i, j};
                }
            }
        }
        return new int[] {-1, -1};
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(twoSum(new int[] {2, 7, 11, 15}, 9)));
    }
    // Input : [2, 7, 11, 15], target 9
    // Output: [0, 1]
}` },
    { tab: "Optimal", panel: "Optimal", file: "HashPatterns.java",
      intro: "Two-sum, subarray-sum-k, and longest consecutive: three keys, one structure.",
      code: `import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class HashPatterns {
    static int[] twoSum(int[] a, int target) {
        Map<Integer, Integer> idx = new HashMap<>();
        for (int i = 0; i < a.length; i++) {
            Integer j = idx.get(target - a[i]);
            if (j != null) {
                return new int[] {j, i};
            }
            idx.put(a[i], i);
        }
        return new int[] {-1, -1};
    }

    static int subarraySum(int[] a, int k) {
        Map<Long, Integer> seen = new HashMap<>();
        seen.put(0L, 1);
        long s = 0;
        int count = 0;
        for (int v : a) {
            s += v;
            count += seen.getOrDefault(s - k, 0);
            seen.merge(s, 1, Integer::sum);
        }
        return count;
    }

    static int longestConsecutive(int[] a) {
        Set<Integer> set = new HashSet<>();
        for (int v : a) {
            set.add(v);
        }
        int best = 0;
        for (int v : set) {
            if (!set.contains(v - 1)) {
                int x = v;
                int len = 1;
                while (set.contains(x + 1)) {
                    x++;
                    len++;
                }
                best = Math.max(best, len);
            }
        }
        return best;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(twoSum(new int[] {2, 7, 11, 15}, 9)));
        System.out.println(subarraySum(new int[] {1, 2, 1, 2, 1}, 3));
        System.out.println(longestConsecutive(new int[] {100, 4, 200, 1, 3, 2}));
    }
    // Input : two-sum [2,7,11,15] t=9; sums [1,2,1,2,1] k=3; consec [100,4,200,1,3,2]
    // Output: [0, 1]
    //         4
    //         4
}` },
    { tab: "Template", panel: "Template", file: "AnagramKey.java",
      intro: "Canonical keys for anagrams: sorted letters, or a 26-count packed as a string.",
      code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class AnagramKey {
    static List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> g = new HashMap<>();
        for (String s : strs) {
            char[] c = s.toCharArray();
            Arrays.sort(c);
            String key = new String(c);
            g.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
        }
        return new ArrayList<>(g.values());
    }

    public static void main(String[] args) {
        List<List<String>> g = groupAnagrams(
            new String[] {"eat", "tea", "tan", "ate", "nat", "bat"});
        System.out.println(g);
    }
    // Input : eat tea tan ate nat bat
    // Output: groups [eat,tea,ate], [tan,nat], [bat] (order may vary)
}` },
  ],
  complexity: {
    time: "O(n) expected; O(n L log L) for anagram keys of length L",
    space: "O(n) entries in the map / set",
    derivation: [
      "<p>Each of n items does a constant number of expected-O(1) map operations: " +
        "<span class=\"eq\">T(n) = \u0398(n)</span> expected. Worst case is quadratic if " +
        "every key collides; interviews want the expected bound.</p>",
      "<p>Consecutive sequence visits each value at most twice (membership + walk). Anagram " +
        "grouping sorts each string: <code>O(n L log L)</code>, or <code>O(n L)</code> with " +
        "a 26-count key.</p>",
    ],
    compare: [
      ["Nested pair search", "O(n\u00b2)", "O(1)", "n \u2264 2000"],
      ["HashMap / HashSet", "O(n) expected", "O(n)", "Default partner lookup"],
      ["Sort + two pointers", "O(n log n)", "O(n)", "When you also need order"],
      ["TreeMap", "O(n log n)", "O(n)", "Floor / ceiling / range of keys"],
      ["int[] indexed by key", "O(n + R)", "O(R)", "Tiny integer universe"],
    ],
  },
  pitfalls: [
    { title: "Inserting before looking up in two-sum",
      bug: "target = 2*x uses the same index twice when you put x first.",
      fix: "Lookup, then put. For two-sum II (sorted) use two pointers instead." },
    { title: "Forgetting to seed prefix 0",
      bug: "A subarray that starts at index 0 and sums to k is never counted.",
      fix: "<code>map.put(0L, 1)</code> before the loop. Use long keys for sums." },
    { title: "Restarting a consecutive run at every value",
      bug: "Walking up from 2, 3, and 4 as well as 1 makes the algorithm quadratic.",
      fix: "Only start if <code>!set.contains(v-1)</code>." },
    { title: "Using the string itself as an anagram key",
      bug: "\"eat\" and \"tea\" land in different buckets.",
      fix: "Sort the letters, or serialise a 26-count. Intern the key." },
    { title: "int overflow on target - x",
      bug: "target = Integer.MIN_VALUE, x = 1, the need wraps.",
      fix: "Use long: <code>long need = (long) target - x;</code> or a Long-keyed map." },
  ],
  variants: [
    ["4-sum II",
      "Hash all pair sums of A,B; for each pair of C,D look up -(c+d).",
      "n\u00b2 map then n\u00b2 lookups = O(n\u00b2).",
      "LC 454."],
    ["Contains duplicate within k",
      "Map value \u2192 last index; if i - last \u2264 k, yes.",
      "Or a sliding HashSet of the last k values.",
      "LC 219."],
    ["Minimum window / last-seen",
      "Map char \u2192 last index, shrink the left to keep uniqueness.",
      "Same as sliding window with a hash of counts.",
      "LC 3, LC 76."],
  ],
  followups: [
    ["Why expected O(n) and not worst-case?",
      "<p>Java HashMap is a table with treeified buckets (Java 8+), so a single bucket is " +
      "O(log n), not O(n), unless you force many distinct keys into pathological hashes. " +
      "Still say \"expected linear\" in an interview; in CF, xor a random odd constant into " +
      "integer keys if you roll your own table.</p>"],
    ["Two-sum if the array must not be mutated and you need all pairs?",
      "<p>Map value \u2192 list of indices. After building, walk keys x \u2264 target-x to " +
      "avoid listing a pair twice. Complexity is output-sensitive.</p>"],
    ["Longest consecutive if values do not fit in a HashSet of ints?",
      "<p>They do: n \u2264 1e5, Integer caches aside, HashSet of n boxed ints is fine. If " +
      "the range is 1..n, a boolean[] is simpler.</p>"],
    ["When should the key be a list instead of a string?",
      "<p>A 26-count as a string with a delimiter is easy. Arrays.hashCode as a key is " +
      "wrong because HashMap uses equals: two int[] with the same contents are not equal. " +
      "Wrap in a string, or use a record/List.</p>"],
  ],
  problems: [
    { url: "https://leetcode.com/problems/two-sum/", name: "Two Sum",
      badge: "lc", tag: "LC 1", level: "Easy", pattern: "Map value to index, look up t-x" },
    { url: "https://leetcode.com/problems/group-anagrams/", name: "Group Anagrams",
      badge: "lc", tag: "LC 49", level: "Medium", pattern: "Canonical sorted-letter key" },
    { url: "https://leetcode.com/problems/longest-consecutive-sequence/", name: "Longest Consecutive Sequence",
      badge: "lc", tag: "LC 128", level: "Medium", pattern: "Set; start only if x-1 missing" },
    { url: "https://leetcode.com/problems/subarray-sum-equals-k/", name: "Subarray Sum Equals K",
      badge: "lc", tag: "LC 560", level: "Medium", pattern: "Prefix + HashMap, seed 0" },
    { url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", name: "Longest Substring Without Repeating",
      badge: "lc", tag: "LC 3", level: "Medium", pattern: "Last-seen index window" },
    { url: "https://leetcode.com/problems/4sum-ii/", name: "4Sum II",
      badge: "lc", tag: "LC 454", level: "Medium", pattern: "Hash pair sums of two arrays" },
    { url: "https://leetcode.com/problems/contains-duplicate-ii/", name: "Contains Duplicate II",
      badge: "lc", tag: "LC 219", level: "Easy", pattern: "Last index within distance k" },
    { url: "https://leetcode.com/problems/valid-anagram/", name: "Valid Anagram",
      badge: "lc", tag: "LC 242", level: "Easy", pattern: "26-count or sort both" },
    { url: "https://codeforces.com/problemset/problem/4/C", name: "Registration System",
      badge: "cf", tag: "CF 4C", level: "Easy", pattern: "Frequency map of strings" },
    { url: "https://codeforces.com/problemset/problem/855/A", name: "Tom Riddle's Diary",
      badge: "cf", tag: "CF 855A", level: "Easy", pattern: "Set of seen names" },
  ],
  recap: [
    "<strong>Hash the partner</strong>, then one pass is enough.",
    "<strong>Look up, then insert</strong> so an item is not its own pair.",
    "<strong>Seed prefix maps with 0</strong>; use long sums.",
    "<strong>Consecutive runs start where x-1 is missing.</strong>",
    "<strong>Tiny range \u2192 int[]</strong>, not HashMap.",
  ],
  oneliner: "if (map.containsKey(target - x)) return pair; map.put(x, i);",
}),

/* =========================== 6. matrix-patterns ======================== */
pack({
  id: "matrix-patterns",
  difficulty: "Medium",
  readTime: "22 min",
  tagline: "A matrix is an array with 2D indexing: layers for rotate and spiral, in-place " +
    "markers for set-zeroes, and a staircase walk when rows and columns are sorted.",
  tags: ["matrix", "spiral", "rotate", "search 2D", "P0"],
  prereqs: [
    ["Two Pointers", "../01-arrays-and-windows/two-pointers.html"],
    ["Binary Search Basics", "../01-arrays-and-windows/binary-search-basics.html"],
  ],
  why: [
    "Most matrix questions are not graph search. Rotate 90\u00b0 is transpose then reverse " +
      "each row. Spiral is four shrinking bounds. Set zeroes is \"mark first row/column as " +
      "a bitset\". Search in a row-and-column-sorted matrix is a staircase from the top-right. " +
      "Once you own those four templates, the rest are payloads.",
    "Index arithmetic is where people bleed time. Off-by-one on layers, walking off the " +
      "right edge of a spiral, and using the first row as a marker then zeroing it too early " +
      "are the classic bugs. Drawing the layer and naming <code>top, bottom, left, right</code> " +
      "removes them.",
    "When the matrix really is a graph (islands, unique paths with obstacles, word search), " +
      "switch modules: BFS/DFS on the four neighbours. This page is the geometry of a dense " +
      "grid you scan in a prescribed order, not the implicit graph.",
  ],
  insight: "Name the bounds of the current layer (or the current staircase cell). Every " +
    "index you write should be a function of those bounds, never a hard-coded n-1 inside a " +
    "nested loop that also shrinks.",
  yes: [
    "\"Rotate the square matrix 90 degrees in place\"",
    "\"Spiral order / generate spiral matrix\"",
    "\"Set entire row and column to zero if a zero is present\"",
    "\"Search a target in a matrix sorted by rows, or by rows and columns\"",
    "\"Diagonal traverse\", \"reshape\", \"transpose\"",
  ],
  no: [
    "Number of islands / surrounded regions / word search &rarr; grid DFS, possibly from the border (this page's flood)",
    "Rectangle sums many times &rarr; " +
      "<a href=\"../01-arrays-and-windows/prefix-sums.html\">2D prefix</a>",
    "Path count with obstacles &rarr; grid DP",
    "Sparse matrix as an adjacency list &rarr; graph representations",
  ],
  table: [
    ["rotate 90 clockwise in place", "Transpose, then reverse each row", "LC 48"],
    ["spiral order", "Four bounds, shrink after each side", "LC 54"],
    ["set zeroes in place", "First row/col as markers", "LC 73"],
    ["sorted rows, first of next > last of prev", "Binary search as 1D of n*m", "LC 74"],
    ["each row and column sorted", "Staircase from top-right", "LC 240"],
    ["diagonal traverse", "Diagonals i+j constant, reverse even", "LC 498"],
    ["<strong>Confused with:</strong> BFS on a grid",
      "Spiral is a prescribed walk, not a queue of neighbours",
      "Islands / rotting oranges are the other page"],
  ],
  constraint: "<code>n, m \le 400</code> is in-place geometry; <code>n = 10&#8309;</code> " +
    "as a flattened 1D search still works if you never materialise n\u00b2. Rotate and " +
    "set-zeroes must be O(1) extra when they say in-place: the first row/column are the " +
    "allowed markers.",
  core: [
    "Rotate 90\u00b0 clockwise: <code>a[i][j] \u2192 a[j][n-1-i]</code>. In-place: transpose " +
      "(<code>a[i][j] \u2194 a[j][i]</code> for j&gt;i) then reverse each row. Layers work " +
      "too: cycle four cells. Spiral: while top\u2264bottom and left\u2264right, walk right, " +
      "down, left, up, and shrink the bound you just finished. After walking a side, check " +
      "the bounds again so a single middle row is not walked twice.",
    "Set zeroes: first pass records which rows/cols contain a zero, using row 0 and col 0 " +
      "as the bitsets plus one extra boolean for cell [0][0]'s double duty. Second pass " +
      "zeroes from the inside out so the markers survive. Staircase search: start at " +
      "top-right; if the cell is too big, move left; too small, move down. Each step " +
      "discards a row or a column, so O(n+m).",
  ],
  array: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  invariant: "<p>A layer with bounds <code>top, bottom, left, right</code> is processed " +
    "exactly once, and the next layer is strictly inside:</p>" +
    "<span class=\"eq\">top++, bottom--, left++, right--</span>" +
    "<p>Interview sentence: <em>\"I walk the current rectangle's perimeter, then I shrink " +
    "all four bounds.\"</em></p>",
  grid: {
    corner: "a",
    rowHeads: ["0", "1", "2"],
    colHeads: ["0", "1", "2"],
  },
  vars: ["step", "cell", "note2"],
  frames: [
    { note: "3x3 matrix [[1,2,3],[4,5,6],[7,8,9]]. Rotate 90 clockwise.",
      cells: [
        { r: 0, c: 0, val: "1" }, { r: 0, c: 1, val: "2" }, { r: 0, c: 2, val: "3" },
        { r: 1, c: 0, val: "4" }, { r: 1, c: 1, val: "5" }, { r: 1, c: 2, val: "6" },
        { r: 2, c: 0, val: "7" }, { r: 2, c: 1, val: "8" }, { r: 2, c: 2, val: "9" },
      ],
      values: { step: "start", cell: "\u2014", note2: "original" } },
    { note: "Transpose: swap a[i][j] with a[j][i]. Now columns are the old rows.",
      cells: [
        { r: 0, c: 0, val: "1" }, { r: 0, c: 1, val: "4" }, { r: 0, c: 2, val: "7" },
        { r: 1, c: 0, val: "2" }, { r: 1, c: 1, val: "5" }, { r: 1, c: 2, val: "8" },
        { r: 2, c: 0, val: "3" }, { r: 2, c: 1, val: "6" }, { r: 2, c: 2, val: "9" },
      ],
      values: { step: "transpose", cell: "a[i][j]\u2194a[j][i]", note2: "mirror" } },
    { note: "Reverse each row. Row 0: [1,4,7]\u2192[7,4,1]. This is 90\u00b0 clockwise.",
      cells: [
        { r: 0, c: 0, val: "7" }, { r: 0, c: 1, val: "4" }, { r: 0, c: 2, val: "1" },
        { r: 1, c: 0, val: "8" }, { r: 1, c: 1, val: "5" }, { r: 1, c: 2, val: "2" },
        { r: 2, c: 0, val: "9" }, { r: 2, c: 1, val: "6" }, { r: 2, c: 2, val: "3" },
      ],
      values: { step: "rev rows", cell: "row reverse", note2: "rotated" } },
    { note: "Spiral of the original: right 1,2,3 then down 6,9 then left 8,7 then up 4 then in 5.",
      cells: [
        { r: 0, c: 0, val: "1" }, { r: 0, c: 1, val: "2" }, { r: 0, c: 2, val: "3" },
        { r: 1, c: 2, val: "6" }, { r: 2, c: 2, val: "9" }, { r: 2, c: 1, val: "8" },
      ],
      values: { step: "spiral", cell: "bounds shrink", note2: "1 2 3 6 9 8 \u2026" } },
    { note: "Continue spiral: 7, then 4, then centre 5. Sequence [1,2,3,6,9,8,7,4,5].",
      cells: [
        { r: 2, c: 0, val: "7" }, { r: 1, c: 0, val: "4" }, { r: 1, c: 1, val: "5" },
      ],
      values: { step: "spiral", cell: "inner 5", note2: "done" } },
    { note: "Staircase search for 6 in a row-and-col sorted matrix starts at top-right 3, goes down to 6.",
      cells: [
        { r: 0, c: 2, val: "3" }, { r: 1, c: 2, val: "6" },
      ],
      values: { step: "stair", cell: "[0,2]\u2192[1,2]", note2: "found 6" } },
    { note: "Set-zeroes: a zero at [1][1] marks row1 and col1 via the first row/col sentinels, then fill.",
      cells: [
        { r: 1, c: 1, val: "0" }, { r: 0, c: 1, val: "m" }, { r: 1, c: 0, val: "m" },
      ],
      values: { step: "zero", cell: "markers", note2: "in-place" } },
  ],
  mermaid: `flowchart TD
  q["matrix question"] --> kind{"geometry, search, or graph?"}
  kind -- rotate --> rot["transpose then reverse rows"]
  kind -- spiral --> sp["four bounds, shrink each side"]
  kind -- set zero --> z["first row and col as markers"]
  kind -- sorted 2D --> sr{"rows only, or rows and cols?"}
  sr -- rows concatenated --> bs["binary search as 1D"]
  sr -- both sorted --> stair["start top-right, left or down"]
  kind -- islands / surrounded --> dfs["DFS from the border, then flip interior"]`,
  merTitle: "Which matrix template?",
  steps: [
    "<strong>Classify:</strong> in-place geometry vs search vs grid graph.",
    "<strong>Rotate:</strong> transpose, reverse rows (clockwise). Undo = reverse then transpose.",
    "<strong>Spiral:</strong> maintain top, bottom, left, right; shrink after each side; " +
      "re-check bounds before the reverse walk.",
    "<strong>Set zero:</strong> marker pass, then zero inner cells, then the first row/col.",
    "<strong>LC 74:</strong> treat as 1D of length n*m, <code>mid = lo+(hi-lo)/2</code>, " +
      "map to <code>[mid/m][mid%m]</code>.",
    "<strong>LC 240:</strong> start at <code>[0][m-1]</code>, smaller \u2192 down, larger \u2192 left.",
    "<strong>Border flood:</strong> DFS/BFS from every border cell of the start state, mark safe, then flip the interior.",
    "<strong>Never</strong> allocate n\u00b2 extra if they said in-place.",
  ],
  code: [
    { tab: "Brute", panel: "Brute", file: "RotateBrute.java",
      intro: "Allocate a second matrix. Correct, O(n\u00b2) extra, the in-place version drops the copy.",
      code: `import java.util.Arrays;

public class RotateBrute {
    static int[][] rotate(int[][] a) {
        int n = a.length;
        int[][] b = new int[n][n];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                b[j][n - 1 - i] = a[i][j];
            }
        }
        return b;
    }

    public static void main(String[] args) {
        int[][] a = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
        System.out.println(Arrays.deepToString(rotate(a)));
    }
    // Input : [[1,2,3],[4,5,6],[7,8,9]]
    // Output: [[7,4,1],[8,5,2],[9,6,3]]
}` },
    { tab: "Optimal", panel: "Optimal", file: "MatrixOps.java",
      intro: "Rotate in place, spiral order, and staircase search.",
      code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class MatrixOps {
    static void rotate(int[][] a) {
        int n = a.length;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                int t = a[i][j];
                a[i][j] = a[j][i];
                a[j][i] = t;
            }
        }
        for (int i = 0; i < n; i++) {
            int l = 0, r = n - 1;
            while (l < r) {
                int t = a[i][l];
                a[i][l] = a[i][r];
                a[i][r] = t;
                l++;
                r--;
            }
        }
    }

    static List<Integer> spiral(int[][] a) {
        int top = 0, bottom = a.length - 1;
        int left = 0, right = a[0].length - 1;
        List<Integer> out = new ArrayList<>();
        while (top <= bottom && left <= right) {
            for (int j = left; j <= right; j++) {
                out.add(a[top][j]);
            }
            top++;
            for (int i = top; i <= bottom; i++) {
                out.add(a[i][right]);
            }
            right--;
            if (top <= bottom) {
                for (int j = right; j >= left; j--) {
                    out.add(a[bottom][j]);
                }
                bottom--;
            }
            if (left <= right) {
                for (int i = bottom; i >= top; i--) {
                    out.add(a[i][left]);
                }
                left++;
            }
        }
        return out;
    }

    static boolean searchSorted(int[][] a, int t) {
        int i = 0, j = a[0].length - 1;
        while (i < a.length && j >= 0) {
            if (a[i][j] == t) {
                return true;
            }
            if (a[i][j] > t) {
                j--;
            } else {
                i++;
            }
        }
        return false;
    }

    public static void main(String[] args) {
        int[][] a = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
        System.out.println(spiral(a));
        rotate(a);
        System.out.println(Arrays.deepToString(a));
        System.out.println(searchSorted(new int[][] {{1, 4, 7}, {2, 5, 8}, {3, 6, 9}}, 6));
    }
    // Input : spiral then rotate [[1,2,3],[4,5,6],[7,8,9]]; search 6
    // Output: [1, 2, 3, 6, 9, 8, 7, 4, 5]
    //         [[7, 4, 1], [8, 5, 2], [9, 6, 3]]
    //         true
}` },
    { tab: "Template", panel: "Template", file: "SetZeroes.java",
      intro: "First row and first column as markers. Extra boolean for a[0][0].",
      code: `import java.util.Arrays;

public class SetZeroes {
    static void setZeroes(int[][] a) {
        int n = a.length, m = a[0].length;
        boolean firstCol = false;
        for (int i = 0; i < n; i++) {
            if (a[i][0] == 0) {
                firstCol = true;
            }
            for (int j = 1; j < m; j++) {
                if (a[i][j] == 0) {
                    a[i][0] = 0;
                    a[0][j] = 0;
                }
            }
        }
        for (int i = 1; i < n; i++) {
            for (int j = 1; j < m; j++) {
                if (a[i][0] == 0 || a[0][j] == 0) {
                    a[i][j] = 0;
                }
            }
        }
        if (a[0][0] == 0) {
            Arrays.fill(a[0], 0);
        }
        if (firstCol) {
            for (int i = 0; i < n; i++) {
                a[i][0] = 0;
            }
        }
    }

    public static void main(String[] args) {
        int[][] a = {{1, 1, 1}, {1, 0, 1}, {1, 1, 1}};
        setZeroes(a);
        System.out.println(Arrays.deepToString(a));
    }
    // Input : [[1,1,1],[1,0,1],[1,1,1]]
    // Output: [[1, 0, 1], [0, 0, 0], [1, 0, 1]]
}` },
  ],
  complexity: {
    time: "O(n m) to touch every cell; staircase search O(n + m)",
    space: "O(1) extra for in-place rotate / set-zero; O(n m) for spiral output",
    derivation: [
      "<p>Rotate, spiral, and set-zeroes each visit every cell a constant number of times: " +
        "<span class=\"eq\">T = \u0398(n m)</span>. Extra memory is the output list or O(1) " +
        "markers.</p>",
      "<p>Staircase discards a row or a column per step, at most n+m steps. LC 74 binary " +
        "search is <code>O(log(n m))</code> comparisons on a virtual 1D array.</p>",
    ],
    compare: [
      ["Copy rotate", "O(n\u00b2)", "O(n\u00b2)", "Fine unless in-place required"],
      ["Transpose + reverse", "O(n\u00b2)", "O(1)", "LC 48 default"],
      ["Spiral bounds", "O(n m)", "O(1) extra", "LC 54 / 59"],
      ["Marker set-zero", "O(n m)", "O(1)", "LC 73 in-place"],
      ["Staircase search", "O(n + m)", "O(1)", "LC 240"],
      ["1D binary search", "O(log(n m))", "O(1)", "LC 74, rows concatenated"],
    ],
  },
  pitfalls: [
    { title: "Spiral walking a row twice",
      bug: "After shrinking top, the left-going pass re-reads the same single remaining row.",
      fix: "<code>if (top &lt;= bottom)</code> before walking left; " +
        "<code>if (left &lt;= right)</code> before walking up." },
    { title: "Zeroing markers too early",
      bug: "Clearing row 0 in the first inner pass wipes the column-marker bits.",
      fix: "Zero the inner (n-1)\u00d7(m-1) first; then row 0; then col 0." },
    { title: "mid * m overflow when flattening LC 74",
      bug: "<code>int mid = (lo+hi)/2; a[mid/m][mid%m]</code> is fine; " +
        "<code>(lo+hi)/2</code> is not the overflow you fear, but <code>lo+hi</code> is.",
      fix: "<code>int mid = lo + (hi - lo) / 2;</code> always." },
    { title: "Staircase starting at bottom-right",
      bug: "Both directions increase, so you cannot discard a row or a column.",
      fix: "Start at top-right or bottom-left, where one step is decrease and one is increase." },
    { title: "Transpose of a non-square",
      bug: "In-place swap a[i][j]\u2194a[j][i] is only for square. Rectangular transpose needs a new array.",
      fix: "Allocate m\u00d7n, or treat rotate as square-only (LC 48 is square)." },
  ],
  variants: [
    ["Rotate 180 / 90 counter-clockwise",
      "180 = reverse rows then reverse each row; CCW = transpose then reverse columns.",
      "Same four-cycle with the opposite permutation.",
      "Useful follow-up to LC 48."],
    ["Generate spiral (LC 59)",
      "Write 1..n\u00b2 with the same four bounds into an empty matrix.",
      "int k=1; a[top][j]=k++; \u2026",
      "LC 59."],
    ["Diagonal traverse",
      "Group by i+j; even diagonals reversed. Or simulate direction with a bounce.",
      "Map<Integer,List> by i+j, then concatenate.",
      "LC 498."],
  ],
  followups: [
    ["Rotate anti-clockwise in place?",
      "<p>Transpose, then reverse each <em>column</em> (or reverse rows first, then " +
      "transpose). Derive the mapping a[i][j] \u2192 a[n-1-j][i] and check one cell.</p>"],
    ["Can staircase search be binary search?",
      "<p>You can binary-search each row in O(n log m). That is worse than O(n+m) when " +
      "n\approx m, and better when one dimension is tiny. LC 240 wants the staircase.</p>"],
    ["Set zeroes without using the first row as a marker?",
      "<p>Two boolean arrays of size n and m are O(n+m) extra and simpler. The O(1) version " +
      "is only required when they insist. Mention both.</p>"],
    ["Spiral on a jagged / empty matrix?",
      "<p>Guard m=0. A 1\u00d7n row is only the rightward pass; the reverse passes must be " +
      "skipped via the bound checks.</p>"],
  ],
  problems: [
    { url: "https://leetcode.com/problems/rotate-image/", name: "Rotate Image",
      badge: "lc", tag: "LC 48", level: "Medium", pattern: "Transpose then reverse rows" },
    { url: "https://leetcode.com/problems/spiral-matrix/", name: "Spiral Matrix",
      badge: "lc", tag: "LC 54", level: "Medium", pattern: "Four shrinking bounds" },
    { url: "https://leetcode.com/problems/spiral-matrix-ii/", name: "Spiral Matrix II",
      badge: "lc", tag: "LC 59", level: "Medium", pattern: "Fill 1..n\u00b2 with the same bounds" },
    { url: "https://leetcode.com/problems/set-matrix-zeroes/", name: "Set Matrix Zeroes",
      badge: "lc", tag: "LC 73", level: "Medium", pattern: "First row/col markers" },
    { url: "https://leetcode.com/problems/search-a-2d-matrix/", name: "Search a 2D Matrix",
      badge: "lc", tag: "LC 74", level: "Medium", pattern: "1D binary search, mid=lo+(hi-lo)/2" },
    { url: "https://leetcode.com/problems/search-a-2d-matrix-ii/", name: "Search a 2D Matrix II",
      badge: "lc", tag: "LC 240", level: "Medium", pattern: "Staircase from top-right" },
    { url: "https://leetcode.com/problems/diagonal-traverse/", name: "Diagonal Traverse",
      badge: "lc", tag: "LC 498", level: "Medium", pattern: "Group by i+j" },
    { url: "https://leetcode.com/problems/game-of-life/", name: "Game of Life",
      badge: "lc", tag: "LC 289", level: "Medium", pattern: "In-place bit packing of old/new" },
    { url: "https://leetcode.com/problems/surrounded-regions/", name: "Surrounded Regions",
      badge: "lc", tag: "LC 130", level: "Medium", pattern: "DFS from the border, then flip" },
    { url: "https://codeforces.com/problemset/problem/1365/A", name: "Matrix Game",
      badge: "cf", tag: "CF 1365A", level: "Easy", pattern: "Free rows and columns on a grid" },
  ],
  recap: [
    "<strong>Rotate</strong> = transpose + reverse rows.",
    "<strong>Spiral</strong> = four bounds; re-check before reverse sides.",
    "<strong>Set zero</strong> = first row/col as markers, inner first.",
    "<strong>LC 74</strong> is 1D binary search; <strong>LC 240</strong> is a staircase.",
    "<strong>Islands / surrounded</strong> flood from the <em>border</em>, then flip the rest.",
  ],
  oneliner: "for (int j = i + 1; j < n; j++) swap(a[i][j], a[j][i]); then reverse each row;",
}),

/* =========================== 7. bit-manipulation ======================= */
pack({
  id: "bit-manipulation",
  difficulty: "Medium",
  readTime: "22 min",
  tagline: "Bits are a 32- or 64-slot boolean array that hardware already ANDs, ORs and " +
    "XORs in one cycle \u2014 subset enumeration, parity, and \"every bit independently\" " +
    "all live here.",
  tags: ["bits", "XOR", "bitmask", "popcount", "P0"],
  prereqs: [
    ["Complexity Analysis", "../00-foundations/complexity-analysis.html"],
    ["Java for DSA", "../00-foundations/java-for-dsa.html"],
  ],
  why: [
    "XOR is addition without carry: x^x = 0, x^0 = x, and XOR is commutative. That is why " +
      "\"every element appears twice except one\" is a single accumulator, and why you can " +
      "swap two ints without a temp. AND/OR are the set operations on the bit-set of a " +
      "32-bit mask. Interviews hammer a small toolkit until it is muscle memory.",
    "The other half is subset enumeration. n \u2264 20 means 2^n masks fit in time; each " +
      "mask is a subset, and <code>mask &amp; (1&lt;&lt;i)</code> tests membership. " +
      "SOS DP, meet-in-the-middle, and many contest tricks start from that loop. You do not " +
      "need a bitset class; an <code>int</code> is enough for n\u226430, a <code>long</code> " +
      "for n\u226460.",
    "Java-specific traps: <code>&gt;&gt;</code> sign-extends, <code>&gt;&gt;&gt;</code> is " +
      "logical; <code>Integer.bitCount</code> is popcount; <code>n &amp; -n</code> is the " +
      "lowest set bit (two's complement). Shifting by 32 on an int is masked to 5 bits, so " +
      "<code>1 &lt;&lt; 32</code> is 1, not 0. These are not trivia; they are WA.",
  ],
  insight: "Treat the integer as a set of bit positions. XOR toggles, AND intersects, OR " +
    "unions, and <code>mask ^ (1&lt;&lt;i)</code> flips membership. Most bit problems are " +
    "set problems in costume.",
  yes: [
    "\"Every number appears twice except one\" / \"appears three times except one\"",
    "\"Count set bits\", \"power of two\", \"range AND / OR\"",
    "n \u2264 20 and \"every subset\" \u2014 iterate masks 0..(1&lt;&lt;n)-1",
    "\"Maximum XOR of two numbers\", \"XOR of a subarray\" (prefix XOR)",
    "Need to pack several flags into one int (visited subsets, Game of Life states)",
  ],
  no: [
    "Arbitrary-precision bitsets of size n=1e5 &rarr; <code>BitSet</code> or a " +
      "<code>long[]</code>, plus a Fenwick/seg-tree if you need prefixes",
    "Maximum XOR of a subarray with n=1e5 &rarr; a binary XOR trie, not a nested mask loop",
    "Subset sums with n=40 &rarr; meet in the middle, not 2^40",
    "Just need popcount of one number once &rarr; <code>Integer.bitCount</code>, stop",
  ],
  table: [
    ["single number, pairs cancel", "XOR everything", "LC 136"],
    ["power of two", "x>0 && (x & (x-1))==0", "LC 231"],
    ["count bits 0..n", "dp[i] = dp[i>>1] + (i&1)", "LC 338"],
    ["enumerate subsets", "for (mask = 0; mask < 1<<n; mask++)", "n \u2264 20"],
    ["lowest set bit", "x & -x  (two's complement)", "Fenwick next"],
    ["range AND l..r", "common prefix of l and r", "LC 201"],
    ["<strong>Confused with:</strong> bitmask DP on n=40",
      "2^40 does not fit; split the set",
      "meet in the middle"],
  ],
  constraint: "<code>n \u2264 20</code> (sometimes 22) is the 2^n signature. 32-bit ops on " +
    "<code>int</code>, 64-bit on <code>long</code>. Shifts: <code>1L &lt;&lt; k</code> when " +
    "k can be 31 or more. XOR of many ints still fits in 32 bits; sums of counts need " +
    "<code>long</code>.",
  core: [
    "XOR fold: the unique element in a twice-array is the XOR of everything. For three " +
      "times, count each bit mod 3 (or the two-bit state machine). Power of two: exactly " +
      "one bit set, <code>(x &amp; (x-1)) == 0</code> and x &gt; 0. Turn off lowest bit: " +
      "<code>x &amp;= x-1</code>, which is also the kernel of Kernighan popcount.",
    "Masks: bit i is on iff element i is in the subset. Iterate submasks of m with " +
      "<code>s = (s-1) &amp; m</code>. Prefix XOR makes subarray XOR a two-endpoint " +
      "query, same identity as prefix sums. Java: prefer <code>Integer.bitCount</code>, " +
      "<code>Integer.numberOfTrailingZeros</code>, <code>Integer.highestOneBit</code> over " +
      "hand-rolled loops unless you are teaching them.",
  ],
  invariant: "<p>XOR is its own inverse and is associative:</p>" +
    "<span class=\"eq\">x \u2295 x = 0,&nbsp; x \u2295 0 = x,&nbsp; " +
    "(a\u2295b\u2295c) \u2295 b = a\u2295c</span>" +
    "<p>Interview sentence: <em>\"Pairs cancel under XOR; a mask is a subset of bit " +
    "positions.\"</em></p>",
  array: [4, 1, 2, 1, 2],
  vars: ["i", "x", "acc", "bits"],
  frames: [
    { note: "XOR-fold [4,1,2,1,2]. acc=0. i=0, x=4 (100b). acc=4.",
      active: [0], dim: [1, 2, 3, 4],
      values: { i: 0, x: 4, acc: 4, bits: "100" } },
    { note: "x=1 (001b). acc=4^1=5 (101b).",
      active: [1], done: [0], dim: [2, 3, 4],
      values: { i: 1, x: 1, acc: 5, bits: "101" } },
    { note: "x=2 (010b). acc=5^2=7 (111b).",
      active: [2], done: [0, 1], dim: [3, 4],
      values: { i: 2, x: 2, acc: 7, bits: "111" } },
    { note: "x=1. acc=7^1=6 (110b). The first 1 cancelled.",
      active: [3], done: [0, 1, 2], dim: [4],
      values: { i: 3, x: 1, acc: 6, bits: "110" } },
    { note: "x=2. acc=6^2=4 (100b). Pairs cancelled; unique 4 remains.",
      active: [4], best: [0], done: [1, 2, 3],
      values: { i: 4, x: 2, acc: 4, bits: "100" } },
    { note: "Kernighan: popcount of 12 (1100b): 12, 8, 0 \u2014 two bits, two iterations of x&=x-1.",
      dim: [0, 1, 2, 3, 4],
      values: { i: "pop", x: 12, acc: 2, bits: "x&=x-1" } },
    { note: "Masks for n=3: 000..111 are the 8 subsets. bit i on \u21d4 include a[i].",
      done: [0, 1, 2],
      values: { i: "mask", x: "0..7", acc: "\u2014", bits: "2^3 subsets" } },
  ],
  mermaid: `flowchart TD
  q["bit question"] --> kind{"cancel, count, or enumerate?"}
  kind -- pairs cancel --> xor["XOR fold"]
  kind -- popcount / power2 --> kern["x and x-1, or Integer.bitCount"]
  kind -- every subset --> mask["for mask in 0 .. 1<<n"]
  kind -- subarray XOR --> pfx["prefix XOR, same as prefix sums"]
  kind -- max XOR n large --> trie["wrong page: XOR trie"]
  xor --> ops["AND intersect, OR union, XOR toggle"]
  kern --> ops
  mask --> ops`,
  merTitle: "Which bit tool?",
  steps: [
    "<strong>XOR fold</strong> when pairs (or even counts) should vanish.",
    "<strong>x &amp; (x-1)</strong> drops the lowest set bit; loop for popcount.",
    "<strong>x &amp; -x</strong> isolates the lowest set bit (Fenwick step).",
    "<strong>Enumerate masks</strong> <code>for (int m = 0; m &lt; (1 &lt;&lt; n); m++)</code> " +
      "when n \u2264 20. Use <code>1L &lt;&lt; i</code> for i up to 62.",
    "<strong>Submasks:</strong> <code>for (int s = m; s &gt; 0; s = (s - 1) &amp; m)</code>.",
    "<strong>Prefix XOR</strong> for subarray XOR queries: <code>px[r+1]^px[l]</code>.",
    "<strong>Java:</strong> <code>&gt;&gt;&gt;</code> for logical shift; never " +
      "<code>1 &lt;&lt; 32</code> on an int.",
  ],
  code: [
    { tab: "Brute", panel: "Brute", file: "BitBrute.java",
      intro: "Count the unique element with a map. XOR drops the extra memory.",
      code: `import java.util.HashMap;
import java.util.Map;

public class BitBrute {
    static int singleNumber(int[] a) {
        Map<Integer, Integer> c = new HashMap<>();
        for (int v : a) {
            c.merge(v, 1, Integer::sum);
        }
        for (var e : c.entrySet()) {
            if (e.getValue() == 1) {
                return e.getKey();
            }
        }
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(singleNumber(new int[] {4, 1, 2, 1, 2}));
    }
    // Input : [4, 1, 2, 1, 2]
    // Output: 4
}` },
    { tab: "Optimal", panel: "Optimal", file: "BitOps.java",
      intro: "XOR fold, power-of-two, Kernighan popcount, and prefix XOR.",
      code: `import java.util.Arrays;

public class BitOps {
    static int singleNumber(int[] a) {
        int x = 0;
        for (int v : a) {
            x ^= v;
        }
        return x;
    }

    static boolean isPowerOfTwo(int x) {
        return x > 0 && (x & (x - 1)) == 0;
    }

    static int popcount(int x) {
        int c = 0;
        while (x != 0) {
            x &= x - 1;
            c++;
        }
        return c;
    }

    static int[] prefixXor(int[] a) {
        int n = a.length;
        int[] p = new int[n + 1];
        for (int i = 0; i < n; i++) {
            p[i + 1] = p[i] ^ a[i];
        }
        return p;
    }

    public static void main(String[] args) {
        System.out.println(singleNumber(new int[] {4, 1, 2, 1, 2}));
        System.out.println(isPowerOfTwo(8) + " " + isPowerOfTwo(7));
        System.out.println(popcount(12));
        System.out.println(Arrays.toString(prefixXor(new int[] {1, 2, 3})));
    }
    // Input : [4,1,2,1,2]; 8 and 7; popcount 12; prefix XOR [1,2,3]
    // Output: 4
    //         true false
    //         2
    //         [0, 1, 3, 0]
}` },
    { tab: "Template", panel: "Template", file: "BitmaskSubsets.java",
      intro: "Enumerate subsets as masks. Sum of each subset stored in a long.",
      code: `import java.util.ArrayList;
import java.util.List;

public class BitmaskSubsets {
    static List<Long> subsetSums(int[] a) {
        int n = a.length;
        List<Long> out = new ArrayList<>();
        for (int mask = 0; mask < (1 << n); mask++) {
            long s = 0;
            for (int i = 0; i < n; i++) {
                if ((mask & (1 << i)) != 0) {
                    s += a[i];
                }
            }
            out.add(s);
        }
        return out;
    }

    /** Number of (mask, submask) pairs is 3^n. Includes the empty submask. */
    static long countSubmasks(int n) {
        long cnt = 0;
        for (int mask = 0; mask < (1 << n); mask++) {
            for (int sub = mask; ; sub = (sub - 1) & mask) {
                cnt++;
                if (sub == 0) break;
            }
        }
        return cnt;
    }

    public static void main(String[] args) {
        System.out.println(subsetSums(new int[] {1, 2, 4}));
        System.out.println(countSubmasks(3));
    }
    // Input : subset sums of [1, 2, 4]; submasks of n = 3
    // Output: [0, 1, 2, 3, 4, 5, 6, 7]
    //         27
}` },
  ],
  complexity: {
    time: "XOR fold O(n); popcount O(set bits); subset enum O(2^n \u00b7 n)",
    space: "O(1) for folds; O(2^n) if you store every subset sum",
    derivation: [
      "<p>XOR / AND / OR of n integers is one pass: <span class=\"eq\">\u0398(n)</span>. " +
        "Kernighan popcount is \u0398(popcount(x)).</p>",
      "<p>Subset enumeration: 2^n masks, n bit tests each, " +
        "<span class=\"eq\">T(n) = \u0398(n 2^n)</span>. Submask enumeration of one mask " +
        "with popcount p is 2^p. n=20 is about 20 million operations; n=25 is already tight " +
        "in Java.</p>",
    ],
    compare: [
      ["HashMap counts", "O(n)", "O(n)", "Single-number without XOR"],
      ["XOR fold", "O(n)", "O(1)", "Pairs cancel"],
      ["Bit-mod-3 counts", "O(32 n)", "O(1)", "Single number II"],
      ["Mask enumeration", "O(n 2^n)", "O(2^n)", "n \u2264 20 subsets"],
      ["Submask enumeration", "O(3^n)", "O(1) extra", "n \u2264 15; SOS inner loop"],
      ["XOR trie", "O(n \u00b7 32)", "O(n \u00b7 32)", "Max XOR, large n"],
    ],
  },
  pitfalls: [
    { title: "1 << 31 and 1 << 32 on int",
      bug: "<code>1 &lt;&lt; 31</code> is Integer.MIN_VALUE (negative). " +
        "<code>1 &lt;&lt; 32</code> is 1 because the shift count is masked to 5 bits.",
      fix: "<code>1L &lt;&lt; k</code> for k up to 62. Never shift an int by \u2265 32." },
    { title: "Arithmetic >> on a sign bit",
      bug: "<code>-1 >> 1</code> stays -1 (sign extend). Logical fill needs <code>&gt;&gt;&gt;</code>.",
      fix: "Unsigned / bit patterns: <code>&gt;&gt;&gt;</code>. Java has no unsigned int type." },
    { title: "x & (x-1) on x=0",
      bug: "Power-of-two test without <code>x &gt; 0</code> accepts 0, and negatives.",
      fix: "<code>x &gt; 0 &amp;&amp; (x &amp; (x-1)) == 0</code>." },
    { title: "XOR of a subarray without a prefix",
      bug: "Recomputing XOR(l..r) in O(r-l) per query dies at n,q=1e5.",
      fix: "Prefix XOR array, query is <code>p[r+1] ^ p[l]</code>." },
    { title: "Mask loop with n=31 on int",
      bug: "<code>1 &lt;&lt; n</code> overflows the loop bound; signed int 2^31 is negative.",
      fix: "n\u226430 for <code>int</code> masks; use <code>1L &lt;&lt; n</code> and a long loop." },
  ],
  variants: [
    ["Single number II (triples)",
      "For each of 32 bits, count how many times it is set, mod 3.",
      "or a finite-state pair (ones, twos) of bits.",
      "LC 137."],
    ["Range bitwise AND",
      "AND of [l,r] is the common prefix of l and r; shift both until equal.",
      "while (l < r) { l >>= 1; r >>= 1; shift++; } return l << shift;",
      "LC 201."],
    ["Subsets via bits (LC 78)",
      "Each mask is a subset; no recursion needed.",
      "same loop as BitmaskSubsets, collect elements instead of sums.",
      "LC 78."],
  ],
  followups: [
    ["Two unique numbers, everything else twice?",
      "<p>XOR everything to get a^b. The lowest set bit of a^b is a bit they differ on. " +
      "Partition the array by that bit and XOR-fold each part: LC 260.</p>"],
    ["Why is n & -n the lowest set bit?",
      "<p>Two's complement: -n is ~n+1. Adding one flips trailing ones into zeros and the " +
      "first zero into a one, which is exactly the lowest set bit of n, and AND isolates it.</p>"],
    ["Enumerate only submasks of m, not all 2^n?",
      "<p><code>for (int s = m; s != 0; s = (s-1) &amp; m)</code> then handle s=0. That is " +
      "SOS / subset-convolution's inner loop. 3^n over all (mask, submask) pairs.</p>"],
    ["Maximum XOR pair in O(n)?",
      "<p>Not with masks. Build a binary trie of the numbers (or of prefix XORs for " +
      "subarrays) and greedy-match the opposite bit. See XOR trie.</p>"],
  ],
  problems: [
    { url: "https://leetcode.com/problems/single-number/", name: "Single Number",
      badge: "lc", tag: "LC 136", level: "Easy", pattern: "XOR fold" },
    { url: "https://leetcode.com/problems/number-of-1-bits/", name: "Number of 1 Bits",
      badge: "lc", tag: "LC 191", level: "Easy", pattern: "Kernighan x&=x-1" },
    { url: "https://leetcode.com/problems/counting-bits/", name: "Counting Bits",
      badge: "lc", tag: "LC 338", level: "Easy", pattern: "dp[i]=dp[i>>1]+(i&1)" },
    { url: "https://leetcode.com/problems/power-of-two/", name: "Power of Two",
      badge: "lc", tag: "LC 231", level: "Easy", pattern: "x>0 && (x&(x-1))==0" },
    { url: "https://leetcode.com/problems/single-number-ii/", name: "Single Number II",
      badge: "lc", tag: "LC 137", level: "Medium", pattern: "Bits mod 3" },
    { url: "https://leetcode.com/problems/single-number-iii/", name: "Single Number III",
      badge: "lc", tag: "LC 260", level: "Medium", pattern: "XOR then split on a differing bit" },
    { url: "https://leetcode.com/problems/bitwise-and-of-numbers-range/", name: "Bitwise AND of Range",
      badge: "lc", tag: "LC 201", level: "Medium", pattern: "Common prefix of l and r" },
    { url: "https://leetcode.com/problems/subsets/", name: "Subsets",
      badge: "lc", tag: "LC 78", level: "Medium", pattern: "One mask per subset" },
    { url: "https://codeforces.com/problemset/problem/550/B", name: "Preparing Olympiad",
      badge: "cf", tag: "CF 550B", level: "Easy", pattern: "2^n subsets, n \u2264 15" },
    { url: "https://codeforces.com/problemset/problem/1095/C", name: "Powers Of Two",
      badge: "cf", tag: "CF 1095C", level: "Easy", pattern: "Split n into k powers of two" },
  ],
  recap: [
    "<strong>XOR cancels pairs</strong>; prefix XOR is the subarray identity.",
    "<strong>x &amp; (x-1)</strong> drops the lowest set bit; <strong>x &amp; -x</strong> isolates it.",
    "<strong>A mask is a subset</strong>; n \u2264 20 enumerates 2^n.",
    "<strong>Use 1L &lt;&lt; k</strong> and <code>&gt;&gt;&gt;</code> for bit patterns.",
    "<strong>Integer.bitCount</strong> exists; do not roll it unless teaching.",
  ],
  oneliner: "int x = 0; for (int v : a) x ^= v;  // pairs cancel",
}),

];


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
    "You are handed 100,000 job records and told to print them oldest-deadline first, breaking " +
      "ties by putting the shorter job earlier. The obvious way to do that by hand is to scan the " +
      "whole list for the record that should go first, print it, remove it, and scan again. That " +
      "is about <code>100000 &times; 100000 / 2 = 5&times;10&#8313;</code> comparisons, close to a " +
      "minute of CPU time, and an instant time-limit failure on any judge. The library sort " +
      "finishes the same job in roughly <code>1.7&times;10&#8310;</code> comparisons &mdash; three " +
      "thousand times fewer &mdash; provided you can hand it one small function that answers a " +
      "single question: given two records, which of these two must be printed first?",
    "That small function is called a <em>comparator</em>. Its entire job is to take two items " +
      "<code>u</code> and <code>v</code> and return a negative number when <code>u</code> must " +
      "come first, a positive number when <code>v</code> must come first, and zero when the order " +
      "between those two does not matter. The sort never inspects your data directly; it only " +
      "ever asks your comparator, so the order you get back is exactly the order your function " +
      "describes &mdash; including any nonsense in it. That is why so many algorithms open with " +
      "the words \"sort the input\": the sort call is three tokens of typing and all of the " +
      "thinking lives in the function you pass to it.",
    "There is one catch that turns a plausible-looking comparator into a wrong answer. The " +
      "library assumes your function describes a <em>total order</em>, which means two things. It " +
      "must be <em>antisymmetric</em>: if <code>cmp(u, v)</code> is negative then " +
      "<code>cmp(v, u)</code> has to be positive, never negative as well. And it must be " +
      "<em>transitive</em>: if <code>u</code> comes before <code>v</code> and <code>v</code> comes " +
      "before <code>w</code>, then <code>u</code> must come before <code>w</code>. Break either " +
      "rule and the behaviour is undefined &mdash; usually a quietly mis-ordered array, sometimes " +
      "an exception thrown from deep inside the sort on one unlucky input in a thousand.",
    "In a real problem statement the tell is a sentence like \"order the results by score " +
      "descending, then by name ascending\" sitting next to a limit such as " +
      "<code>n &le; 10&#8309;</code>. That limit is permission for exactly one " +
      "<code>O(n log n)</code> sort and nothing heavier per element. The same two lines then cover " +
      "a surprisingly wide spread of problems: arranging numbers so that the digits they spell " +
      "out form the largest possible value, ranking teams by how many first-place votes they " +
      "collected, ordering points by squared distance from the origin, and sorting meetings by " +
      "finish time so that a single greedy pass can accept them one at a time.",
  ],
  insight: "Write the comparator so that it answers exactly one question: if I may only put one " +
    "of these two items first, which one has to go first for the rest of my algorithm to still " +
    "work? Then check that the answer is transitive, because a sort built on a non-transitive " +
    "rule is not a sort at all, and the greedy standing on top of it proves nothing.",
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
    "sort: about <code>1.7&times;10&#8310;</code> comparisons, comfortably under a second, where " +
    "the quadratic alternative is <code>5&times;10&#8313;</code> and hopeless. Watch for two " +
    "hidden multipliers. If one comparison itself costs <code>O(L)</code> because the keys are " +
    "strings of length <code>L</code>, the true total is <code>O(n L log n)</code>. And if the " +
    "values reach <code>&plusmn;10&#8313;</code>, a comparator written as <code>a - b</code> can " +
    "wrap past 32 bits and return the wrong sign, so reach for <code>Integer.compare</code> or " +
    "<code>Long.compare</code> instead.",
  core: [
    "Start with what the library actually runs, because the two cases behave differently. " +
      "<code>Arrays.sort(int[] a)</code> is a dual-pivot quicksort: very fast, but not " +
      "<em>stable</em>. <em>Stable</em> means that two items your comparator reports as equal come " +
      "out in the same relative order they went in. <code>Arrays.sort(T[] a, cmp)</code> on " +
      "objects runs TimSort, which is a merge sort and therefore stable, and which additionally " +
      "notices stretches of the input that are already in order and merges them instead of " +
      "re-discovering them. So if any part of your logic depends on the original order of ties " +
      "surviving the sort, you must sort objects: box the values into an <code>Integer[]</code>, " +
      "or build an index array and sort that.",
    "Now the comparator itself. The pattern worth memorising is " +
      "<code>(u, v) -&gt; Integer.compare(key(u), key(v))</code>, where <code>key</code> is " +
      "whatever number you decided each item should be judged by, and <code>u</code> and " +
      "<code>v</code> are the only two items in scope &mdash; the comparator cannot see the rest " +
      "of the array and does not need to. For a two-level order, " +
      "<code>Comparator.comparingInt(u -&gt; u[0]).thenComparingInt(u -&gt; u[1])</code> reads the " +
      "second key only when the first one ties. Never write <code>return u - v</code>: the " +
      "subtraction happens in 32 bits, so <code>Integer.MIN_VALUE - 1</code> wraps round to a " +
      "positive number and tells the sort that the smallest possible value is the larger of the two.",
    "Some orders are not numeric at all. For \"arrange these numbers so that the digits they " +
      "spell out form the largest possible number\", the correct rule for two strings " +
      "<code>a</code> and <code>b</code> is to compare the concatenation <code>a+b</code> against " +
      "<code>b+a</code> and put first whichever produces the bigger text. With 3 and 30 that is " +
      "\"330\" against \"303\", so 3 must go first even though 30 is the larger number. Do not try " +
      "to parse those concatenations back into integers &mdash; joining two ten-digit inputs " +
      "already overflows anything Java can hold. Because both concatenations have identical " +
      "length, plain string comparison gives the same answer and costs nothing extra.",
    "Walk five records through the two-key version to see the questions the library asks. The " +
      "pairs are <code>[3,9] [1,5] [3,2] [2,7] [1,1]</code> and the order is \"first key " +
      "ascending, then second key ascending\". The comparator is asked about <code>[3,9]</code> " +
      "and <code>[1,5]</code>: the first keys 3 and 1 differ, so it returns a positive number and " +
      "<code>[1,5]</code> wins without the second key ever being read. Asked about " +
      "<code>[3,9]</code> against <code>[3,2]</code>, the first keys tie, the tie-breaker runs, " +
      "and 2 beats 9. TimSort repeats that one question a few dozen times and lands on " +
      "<code>[1,1] [1,5] [2,7] [3,2] [3,9]</code>.",
  ],
  invariant: "<p>After <code>Arrays.sort(a, cmp)</code> returns, the array is in comparator " +
    "order: for every pair of positions <code>i &lt; j</code>,</p>" +
    "<span class=\"eq\">cmp(a[i], a[j]) &le; 0</span>" +
    "<p>In plain words, nowhere in the array is an item followed by an item that your own " +
    "function says should have come earlier. That is the only promise you are given, and it is " +
    "worth reading literally: the sort guarantees nothing about the order you had in mind, only " +
    "about the function you actually wrote. A bug in the comparator therefore shows up as a " +
    "silently wrong array rather than as a crash.</p>" +
    "<p>Interview sentence: <em>\"I sort by a key that makes the remaining decision local " +
    "&mdash; each item only needs to look at its sorted neighbour.\"</em></p>",
  extra: [
    { kind: "key", title: "Three spellings, one meaning",
      html: "<p><code>(u, v) -&gt; Integer.compare(u.k, v.k)</code> is the explicit form. " +
        "<code>Comparator.comparingInt(u -&gt; u.k)</code> is the same thing with the boilerplate " +
        "removed. <code>Comparator.comparingInt(u -&gt; u.k).reversed()</code> flips it; writing " +
        "<code>Integer.compare(v.k, u.k)</code> by hand does the same and is easier to read " +
        "when you also chain a tie-breaker.</p>" },
    { kind: "warn", title: "\"Comparison method violates its general contract\"",
      html: "<p>This exception is TimSort catching you red-handed: it found three items whose " +
        "order your comparator cannot decide consistently. It is not a library bug and there is " +
        "no flag to disable it. Reduce your rule to one number (or a chain of numbers) per item " +
        "and the exception cannot occur.</p>" },
  ],
  array: [5, 2, 4, 6, 1, 3],
  vars: ["pass", "i", "j", "a"],
  frames: [
    { note: "Input [5, 2, 4, 6, 1, 3]. A merge sort first splits down to single elements, because a run of one element is already sorted for free.",
      dim: [0, 1, 2, 3, 4, 5],
      values: { pass: "split", i: "\u2014", j: "\u2014", a: "[5,2,4,6,1,3]" } },
    { note: "Merge the runs [5] and [2]. One call to the comparator says 2 is smaller, so the pair is written back as [2, 5].",
      active: [0, 1], dim: [2, 3, 4, 5],
      values: { pass: "merge", i: 0, j: 1, a: "[2,5,4,6,1,3]" } },
    { note: "The same single comparison on the next pair merges [4] and [6] into [4, 6], which happened to be in order already.",
      active: [2, 3], done: [0, 1], dim: [4, 5],
      values: { pass: "merge", i: 2, j: 3, a: "[2,5,4,6,1,3]" } },
    { note: "Merge the two-element runs [2,5] and [4,6]. Comparing the fronts repeatedly interleaves them into [2, 4, 5, 6], so the left half is sorted.",
      window: [0, 3], done: [0, 1, 2, 3], dim: [4, 5],
      values: { pass: "merge", i: 0, j: 3, a: "[2,4,5,6,1,3]" } },
    { note: "Move to the right half and merge [1] with [3], producing the run [1, 3]. Two sorted runs now cover the whole array.",
      active: [4, 5], done: [0, 1, 2, 3],
      values: { pass: "merge", i: 4, j: 5, a: "[2,4,5,6,1,3]" } },
    { note: "The final merge walks [2,4,5,6] and [1,3] once each and emits [1, 2, 3, 4, 5, 6]. Every decision came from Integer.compare.",
      best: [0, 1, 2, 3, 4, 5],
      values: { pass: "done", i: 0, j: 5, a: "[1,2,3,4,5,6]" } },
    { note: "Notice that nothing above depended on the values being numbers. Swap in a comparator that ranks a+b against b+a and this identical merge sorts strings for LC 179.",
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
    "<strong>Name the key first, on paper.</strong> Ask what order would let the rest of your " +
      "algorithm look at nothing but the item immediately to its left. That order is the key, and " +
      "discovering it is the actual work of the problem.",
    "<strong>Check transitivity before you type anything.</strong> Pick any three items and " +
      "confirm that A-before-B together with B-before-C forces A-before-C. If it does not, no " +
      "valid sorted order exists for your rule, so the greedy on top of it cannot be proved.",
    "<strong>Spell it with <code>Integer.compare</code></strong> or " +
      "<code>Comparator.comparingInt</code> rather than subtraction, because subtracting two " +
      "<code>int</code>s can wrap around 32 bits and hand the sort the opposite sign on extreme " +
      "values.",
    "<strong>Decide whether you need stability.</strong> If items the comparator calls equal must " +
      "keep their input order, sort an <code>Integer[]</code> or an index array so that TimSort " +
      "runs; the primitive <code>int[]</code> sort is free to reorder ties however it likes.",
    "<strong>Sort exactly once</strong> with <code>Arrays.sort(a, cmp)</code>, or " +
      "<code>Arrays.sort(idx, cmp)</code> when the original positions matter. Re-sorting inside a " +
      "loop is the most common way an <code>O(n log n)</code> solution quietly becomes cubic.",
    "<strong>Then scan linearly.</strong> The greedy decision should now involve only " +
      "<code>a[i]</code> and <code>a[i-1]</code>; if it still needs to search further, the key was " +
      "wrong and the honest fix is to change the key rather than patch the scan.",
    "<strong>Quote the honest cost.</strong> It is <code>O(n log n)</code> comparisons multiplied " +
      "by the price of one comparison, so string keys of length <code>L</code> make the real " +
      "figure <code>O(n L log n)</code> and not the headline number.",
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
        "object sort is TimSort, adaptive and stable; primitive sort is dual-pivot quicksort. " +
        "At <code>n = 10&#8309;</code> that is about <code>1.7&times;10&#8310;</code> " +
        "comparisons, comfortably under a second.</p>",
      "<p>If each comparison costs <code>O(L)</code> (string keys of length L), multiply: " +
        "<span class=\"eq\">T(n) = O(n L log n)</span>. Concatenation comparators allocate, " +
        "so they are slower than they look; still the right complexity class for " +
        "<code>n &le; 10&#8309;</code>, <code>L &le; 20</code>, which is a few tens of " +
        "millions of character compares rather than the hopeless " +
        "<code>5&times;10&#8313;</code> of a nested scan.</p>",
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
        "<code>b = 1</code> looks like a tidy numeric compare, but the subtraction wraps in " +
        "32 bits and reports the wrong sign, so the sort silently puts the smallest int after 1.",
      fix: "Use <code>Integer.compare(a, b)</code> or <code>Long.compare</code>, which compare " +
        "without subtracting. A unit test of <code>MIN_VALUE</code> against 1 catches the wrap." },
    { title: "Unstable primitive sort",
      bug: "Sorting an <code>int[]</code> of equal keys lets dual-pivot quicksort shuffle their " +
        "original order, so a later scan that assumed ties kept their input order is wrong.",
      fix: "Box to <code>Integer[]</code>, or sort an index array with TimSort so equal keys " +
        "keep their original relative order." },
    { title: "Illegal transitive order",
      bug: "A comparator that says A before B, B before C, and C before A looks locally " +
        "plausible on each pair, but TimSort may throw " +
        "<code>IllegalArgumentException: Comparison method violates its general contract!</code> " +
        "when it notices the cycle.",
      fix: "Reduce the rule to one number (or a chain of numbers) per item so the order is " +
        "total and transitive. Test any three items by hand before you trust the sort." },
    { title: "Parsing concatenated numbers as ints",
      bug: "On LC 179, concatenating two ten-digit strings and calling " +
        "<code>parseInt(a+b)</code> throws or wraps because the joined text no longer fits " +
        "in a 32-bit int, even though the comparison itself only needed the text.",
      fix: "Compare the two concatenations as strings. If the sorted result starts with zero, " +
        "the whole answer is the single character <code>\"0\"</code>." },
    { title: "Forgetting that sort mutates",
      bug: "<code>Arrays.sort</code> rewrites the caller's array, so a later assertion or a " +
        "second pass that expected the original order fails even though the comparator was correct.",
      fix: "Clone first, or sort an index array and leave the source untouched. Print the " +
        "original after the sort as a sanity check." },
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
      "<p>It is a dual-pivot quicksort tuned for raw ints, and a quicksort cannot keep equal " +
      "keys in their original order without extra memory to remember those positions. Object " +
      "arrays go through TimSort, which is a merge sort and therefore stable. If you need " +
      "stability on ints, box them or sort an index array so TimSort runs.</p>"],
    ["How do you sort by a key that is a long without boxing the array?",
      "<p>Keep the values primitive and sort an <code>Integer[]</code> of indices with " +
      "<code>Comparator.comparingLong(i -&gt; key[i])</code>. Only the permutation is boxed; " +
      "the long keys stay in a primitive array. That avoids both overflow in " +
      "<code>Integer.compare</code> and the cost of boxing every payload, which matters " +
      "when n is a hundred thousand.</p>"],
    ["Is a lambda comparator allocated every call?",
      "<p>The lambda is a singleton invokedynamic handle; it is not allocated per comparison. " +
      "What is allocated is any string you build inside it, which is why concatenation " +
      "comparators are slower than they look. Precompute the string form of each number once " +
      "if the keys are long.</p>"],
    ["When is n log n not good enough after a sort?",
      "<p>When the true bottleneck is the key, not the sort: string keys of length " +
      "<code>L</code> make the real cost <code>O(n L log n)</code>, and at <code>L = 100</code> " +
      "and <code>n = 10&#8309;</code> that is already tens of millions of character compares. " +
      "You also do not need a full sort if you only wanted the k-th element, or if the range " +
      "is tiny enough for counting sort.</p>"],
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
  dryIntro: "The walkthrough merges <code>[5, 2, 4, 6, 1, 3]</code> from single-element " +
    "runs up to a fully sorted array, one comparator question at a time.",
}),

/* =========================== 2. non-comparison-sorts =================== */
pack({
  id: "non-comparison-sorts",
  difficulty: "Medium",
  readTime: "24 min",
  tagline: "When keys live in a small universe, you can sort in linear time by counting, " +
    "bucketing, or peeling digits &mdash; the &Omega;(n log n) barrier only applies to " +
    "comparison sorts.",
  tags: ["counting sort", "radix sort", "bucket sort", "P1"],
  prereqs: [
    ["Sorting & Comparators", "sorting-and-comparators.html"],
    ["Constraints \u2192 Complexity", "../00-foundations/constraints-to-complexity.html"],
  ],
  why: [
    "You are given 200,000 exam scores, each an integer from 0 to 100, and you must print " +
      "them in increasing order. Calling the library sort will do roughly " +
      "<code>200000 &times; 18 &approx; 3.6&times;10&#8310;</code> comparisons. You do not " +
      "need any of those comparisons: walk the list once, increment a 101-slot tally for " +
      "whatever score you see, then walk those 101 slots and write each score out as many " +
      "times as you counted it. That is 200,101 writes &mdash; about eighteen times fewer " +
      "operations &mdash; because the score itself is already the address of the bucket it " +
      "belongs in.",
    "That tally-and-emit idea is called <em>counting sort</em>, and it is linear in " +
      "<code>n</code> plus <code>R</code>, where <code>R</code> is the size of the universe " +
      "of keys (101 in the exam example). The catch is memory: if the keys were 64-bit ids " +
      "instead of scores, <code>R</code> would be <code>2&#8310;&#8308;</code> and you could " +
      "not allocate the tally. When <code>R</code> is huge but each key still has a fixed " +
      "number of digits, <em>radix sort</em> &mdash; counting sort applied to one digit at a " +
      "time, least-significant digit first &mdash; turns one impossible range into a handful " +
      "of tiny ones. Four passes of base 256 sort every 32-bit int.",
    "A <em>bucket sort</em> is the same idea with a known distribution: scatter the " +
      "<code>n</code> values into <code>n</code> buckets, sort each bucket, and concatenate. " +
      "Maximum-gap is the pigeonhole form, where you prove the largest adjacent gap after " +
      "sorting cannot sit inside a bucket. In a real statement the tell is values in " +
      "<code>0..n</code>, or \"sort colours / 0s and 1s\", or H-index with citations already " +
      "clamped to <code>n</code>. Those limits make a comparison sort legal but wasteful: " +
      "<code>n = 10&#8309;</code> and <code>R = n</code> is about <code>2&times;10&#8309;</code> " +
      "array writes versus <code>1.7&times;10&#8310;</code> comparisons.",
  ],
  insight: "If the key is already an integer in a small range, do not compare keys: use the " +
    "key as an array index. Linear time is then a histogram plus a walk that writes each " +
    "value out as many times as you counted it, or a stable scatter from a prefix of those counts.",
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
    "Start by allocating an array <code>cnt</code> of length <code>R</code>, every slot 0. " +
      "For each value <code>v</code> in the input, increment <code>cnt[v]</code>. You now " +
      "hold a <em>histogram</em>: <code>cnt[v]</code> is how many times <code>v</code> " +
      "appeared. The simplest emit walks <code>v</code> from 0 to <code>R-1</code> and writes " +
      "<code>v</code>, <code>cnt[v]</code> times. That is correct but not <em>stable</em> " +
      "&mdash; stable means items that share a key keep their original relative order, which " +
      "you need when the payload is a pair and this pass is one digit of a radix sort. The " +
      "stable form turns the counts into starting positions with a prefix sum " +
      "<code>pos[v] = cnt[0]+&hellip;+cnt[v-1]</code>, then walks the original array and " +
      "writes each item to <code>output[pos[key]++]</code>.",
    "When <code>R</code> is only 3, you do not need the extra arrays. <em>Dutch national " +
      "flag</em> &mdash; the three-colour in-place partition named after the Dutch flag's " +
      "red-white-blue bands &mdash; keeps three pointers <code>lo</code>, <code>mid</code>, " +
      "<code>hi</code>. Everything left of <code>lo</code> is 0, everything right of " +
      "<code>hi</code> is 2, and <code>mid</code> walks the unknown middle. Seeing a 0 swaps " +
      "with <code>lo</code> and advances both; seeing a 2 swaps with <code>hi</code> and does " +
      "not advance <code>mid</code>, because the value that just arrived has not been " +
      "inspected; seeing a 1 just advances <code>mid</code>. Radix LSD is then just the " +
      "stable counting scatter, once per digit from least significant, so the previous " +
      "digit's order survives.",
    "Walk <code>[2, 0, 2, 1, 1, 0]</code> through the flag. Start with <code>lo = 0</code>, " +
      "<code>mid = 0</code>, <code>hi = 5</code>. <code>a[0]</code> is 2, so swap with index " +
      "5: the array becomes <code>[0, 0, 2, 1, 1, 2]</code> and <code>hi</code> falls to 4 " +
      "while <code>mid</code> stays. <code>a[0]</code> is now 0, so swap with <code>lo</code> " +
      "(a no-op) and both pointers step: <code>lo = 1</code>, <code>mid = 1</code>. The next " +
      "0 does the same, leaving <code>lo = 2</code>, <code>mid = 2</code>. Then " +
      "<code>a[2]</code> is 2, swap with <code>hi = 4</code> to get " +
      "<code>[0, 0, 1, 1, 2, 2]</code>, and <code>hi</code> becomes 3. Two ones remain; " +
      "<code>mid</code> walks past them and the loop stops with zeros on the left, twos on " +
      "the right, and ones in the middle.",
  ],
  invariant: "<p>After counting, <code>cnt[v]</code> is how many keys equal <code>v</code>, and " +
    "the prefix <code>pos[v] = cnt[0]+&hellip;+cnt[v-1]</code> is the first output index for " +
    "<code>v</code>:</p>" +
    "<span class=\"eq\">output[pos[a[i]]++] = a[i]</span>" +
    "<p>In plain words, you never compare two keys; you only increment the bucket a key " +
    "already names, then write that bucket out in order. The prefix of counts is just " +
    "\"how many values smaller than v have I already reserved space for\", so each scatter " +
    "lands in the unique slot that key has earned.</p>" +
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
    "<strong>Read the range first.</strong> If the keys are not integers in a universe you " +
      "can allocate, counting is the wrong tool and you should fall back to a comparison sort.",
    "<strong>When R is 2 or 3, use Dutch national flag.</strong> Three pointers partition " +
      "in one pass and O(1) extra memory, which is why interviews ask \"sort colours\" this way.",
    "<strong>When R is on the order of n, allocate <code>cnt[R]</code>.</strong> One tally " +
      "pass plus one emit or scatter is <code>O(n + R)</code>, and that is the whole algorithm.",
    "<strong>For a stable scatter, prefix the counts.</strong> <code>pos[v]</code> is then " +
      "the first free output slot for key <code>v</code>, so walking the input writes each " +
      "item into the unique place it has earned.",
    "<strong>Radix LSD applies that stable scatter to one digit at a time.</strong> Starting " +
      "at the least significant digit is what lets the previous digit's order survive into " +
      "the next pass.",
    "<strong>For maximum gap, use n-1 buckets over [min, max].</strong> The pigeonhole " +
      "argument says the largest adjacent gap after sorting cannot sit inside a bucket, so " +
      "you only compare neighbouring non-empty buckets.",
    "<strong>Shift negatives by <code>min</code> before indexing.</strong> A raw negative " +
      "key is not a legal array index; subtracting the minimum, or radix on unsigned bits, " +
      "is what makes the histogram well-defined.",
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
      "<p>Counting is one tally pass and one emit or scatter pass over n items plus R " +
        "buckets: <span class=\"eq\">T(n,R) = \u0398(n + R)</span>. Memory is the same " +
        "order. At <code>n = 10&#8309;</code> and <code>R = n</code> that is about " +
        "<code>2&times;10&#8309;</code> writes, versus the " +
        "<code>1.7&times;10&#8310;</code> comparisons of a library sort.</p>",
      "<p>LSD radix with digit width w (four bytes, base 256) is " +
        "<span class=\"eq\">T(n) = \u0398(w(n + B))</span> with B = 256, so a 32-bit array " +
        "is four linear passes &mdash; still a small multiple of n. Dutch national flag is " +
        "one pass, three pointers, and no extra histogram, which is why it is the right " +
        "answer when the universe is only the three colours.</p>",
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
      bug: "A negative key looks like a valid integer, so writing <code>cnt[a[i]]++</code> " +
        "either throws <code>ArrayIndexOutOfBoundsException</code> or, after a sloppy shift, " +
        "allocates a huge unused range.",
      fix: "Subtract <code>min</code> first so every key lands in <code>0..R-1</code>, or " +
        "radix on unsigned bit patterns with <code>&gt;&gt;&gt;</code>." },
    { title: "Incrementing mid after swapping a 2",
      bug: "The value swapped in from <code>hi</code> has not been inspected, so incrementing " +
        "<code>mid</code> on a 2 skips a 0 that just arrived and leaves a 2 in the middle.",
      fix: "On a 2, swap with <code>hi</code> and do <em>not</em> increment <code>mid</code>. " +
        "On a 0, increment both pointers because the swapped-in value came from the already-settled left." },
    { title: "Unstable counting inside radix",
      bug: "Emitting by walking <code>v = 0..R</code> rebuilds each digit's group from scratch " +
        "and destroys the order the previous digit had already established.",
      fix: "Scatter via prefix positions, walking the input in a consistent direction, so " +
        "equal current digits keep their previous-digit order." },
    { title: "R = 1e9 with n = 1e5",
      bug: "<code>new int[1_000_000_000]</code> looks linear in the range, but it is a " +
        "memory error, not a linear sort: you cannot afford an array of a billion counts.",
      fix: "Coordinate-compress the n values down to 0..n-1, or just comparison-sort those " +
        "n numbers and drop counting entirely." },
    { title: "Max-gap putting n values into n buckets of width (max-min)/n",
      bug: "The max adjacent gap in the sorted array can sit inside a bucket if you use n " +
        "buckets carelessly, or you divide by zero when max equals min and the width formula collapses.",
      fix: "Use n-1 buckets over the exclusive range, handle max==min as a special case, " +
        "and scan only adjacent non-empty buckets." },
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
      "<p>After sorting on digit k, items that share that digit must keep the order they " +
      "already earned from digits 0..k-1. An unstable inner sort reshuffles those ties, and " +
      "the next higher-digit pass cannot recover the lost information. Counting-with-scatter " +
      "is stable; dual-pivot quicksort is not, which is why you never radix with " +
      "<code>Arrays.sort</code> as the inner step.</p>"],
    ["Can counting sort be in-place?",
      "<p>The histogram is still extra R memory, so you have not removed the space cost. You " +
      "can cycle-swap items into the prefix positions, but the code is easy to get wrong and " +
      "not worth it in an interview. Dutch national flag is the in-place special case that " +
      "actually gets asked, and it only works because R is 3.</p>"],
    ["How do you handle 32-bit negatives in radix?",
      "<p>XOR every key with <code>1 &lt;&lt; 31</code> to flip the sign bit so the negatives, " +
      "which have that bit set, sort first when you treat the bits as unsigned; sort; then " +
      "flip the bit back. Alternatively subtract <code>Integer.MIN_VALUE</code> as a long so " +
      "every pattern lands in the unsigned 32-bit range <code>0 .. 4294967295</code>.</p>"],
    ["When is counting slower than Arrays.sort?",
      "<p>When R is millions and n is only thousands: you touch a huge cold array of counts " +
      "that does not fit in cache, while the library sort only touches the n keys. Rule of " +
      "thumb: counting wins when R is a small multiple of n and the tally array stays hot. " +
      "Otherwise just call <code>Arrays.sort</code>.</p>"],
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
  dryIntro: "Dutch national flag on <code>[2, 0, 2, 1, 1, 0]</code>: watch lo, mid and hi " +
    "carve zeros to the left and twos to the right until mid walks past hi.",
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
    "You are given 100,000 calendar bookings, each a pair of times such as 9:00&ndash;10:30, " +
      "and you must print one list of busy blocks with overlaps collapsed. Comparing every " +
      "booking to every other booking is about " +
      "<code>100000 &times; 100000 / 2 = 5&times;10&#8313;</code> pair checks, which no " +
      "judge will wait for. After you sort the bookings by start time &mdash; roughly " +
      "<code>1.7&times;10&#8310;</code> comparisons &mdash; a booking can only overlap " +
      "something that starts before it, so you only ever look at the previous merged end. " +
      "One linear pass then finishes the job.",
    "An <em>interval</em> is just that pair <code>[l, r]</code> of endpoints on a line. " +
      "Once they are sorted by start, overlaps become contiguous: if the current interval " +
      "does not touch the previous merged end, nothing later with a larger start will " +
      "touch it either. That single observation is merge intervals, insert interval, and " +
      "coverage. The other sort, by end, is the greedy for \"how many can I keep if they " +
      "must not overlap\": always keep the one that finishes first, because that leaves " +
      "the most room for everything still to come.",
    "A <em>sweep line</em> is the same idea with an explicit event queue: write +1 at " +
      "each start, &minus;1 at each end, walk left to right, and the running sum is how " +
      "many intervals cover this point. That answers \"maximum concurrent meetings\" " +
      "without building the merged list. In a real statement the tell is " +
      "<code>n &le; 10&#8309;</code> intervals sitting next to \"merge overlapping\", " +
      "\"minimum arrows\", or \"how many rooms\". Those limits permit one " +
      "<code>O(n log n)</code> sort and a linear scan, and they rule out the pairwise " +
      "check that dies at a hundred thousand bookings.",
  ],
  insight: "In one dimension, sorting turns geometry into adjacency. After the sort, every " +
    "decision looks at the current interval and a single running endpoint (or a running " +
    "count), because anything that could still overlap is either the neighbour you are " +
    "looking at or has already been merged into that running end.",
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
    "To merge, sort by start and keep a running interval <code>[curL, curR]</code> that " +
      "represents the block you have not emitted yet. If the next start is " +
      "<code>&le; curR</code> (or <code>&lt;</code> if ends are exclusive), the two blocks " +
      "overlap, so extend <code>curR = max(curR, nextR)</code>. If there is a gap, emit " +
      "<code>cur</code> and open a new running interval at the next pair. The sort is what " +
      "makes \"next\" the only candidate that can still overlap: everything earlier already " +
      "went into <code>cur</code> or was emitted as a finished block.",
    "The other algorithm sorts by <em>end</em>. Keep the interval that finishes first; skip " +
      "anything that starts before that end. Any kept set can replace its last interval with " +
      "this earlier finish without losing feasibility, so the greedy stays ahead of every " +
      "rival schedule. Meeting-room count uses a sweep instead: emit a +1 event at each " +
      "start and a &minus;1 at each end, sort the events by time, and track the running " +
      "sum. Process end events before start events at a tied time if a room that just " +
      "freed may be reused immediately.",
    "Walk <code>[1,3], [2,6], [8,10], [15,18]</code> after sorting by start. Open " +
      "<code>[1,3]</code>. The next start 2 sits on or before 3, so the running end grows " +
      "to <code>max(3, 6) = 6</code> and the open block is now <code>[1,6]</code>. The " +
      "next start 8 is past 6, so emit <code>[1,6]</code> and open <code>[8,10]</code>. " +
      "Start 15 is past 10, so emit <code>[8,10]</code> and open <code>[15,18]</code>. " +
      "The list ends, and you must still emit that last open block. The merged answer is " +
      "<code>[1,6], [8,10], [15,18]</code>.",
  ],
  invariant: "<p>After sorting by start, a single running end <code>curR</code> satisfies:</p>" +
    "<span class=\"eq\">every emitted interval is disjoint from the later ones, and curR is " +
    "the max end of the open merge</span>" +
    "<p>In plain words, the block you are holding is the only unfinished overlap, and " +
    "everything you have already printed sits entirely to its left. A new interval either " +
    "stretches that open block or proves a gap, in which case the open block is finished " +
    "and can be printed.</p>" +
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
    "<strong>Decide inclusive vs exclusive ends first.</strong> The comparison " +
      "<code>&le;</code> versus <code>&lt;</code> is the whole difference between merging " +
      "<code>[1,2]</code> with <code>[2,3]</code> and leaving a gap.",
    "<strong>To take a union, sort by start.</strong> Extend a running end while the next " +
      "start still touches it, and emit the open block the moment a gap appears, because " +
      "nothing later can close that gap.",
    "<strong>To keep the maximum non-overlapping set, sort by end.</strong> Take an interval " +
      "only when its start is at or after <code>lastEnd</code>, because the earliest finish " +
      "leaves the most room for what remains.",
    "<strong>For rooms or concurrent overlap, sweep.</strong> Write +1 at each start and " +
      "&minus;1 at each end, sort by time, and the maximum of the running sum is the number " +
      "of rooms you need.",
    "<strong>Two already-sorted disjoint lists intersect with two pointers.</strong> Advance " +
      "the interval that ends first, because that one can no longer overlap anything later " +
      "in the other list.",
    "<strong>To insert one new interval, copy in three phases.</strong> Write every block " +
      "strictly before it, merge every block that overlaps it into one union, then copy the " +
      "tail that starts after that union.",
    "<strong>Accumulate union length in <code>long</code>.</strong> Ends up to " +
      "<code>10&#8313;</code> and <code>n</code> up to <code>10&#8309;</code> overflow a " +
      "32-bit <code>int</code> the moment you add <code>r - l + 1</code> across the list.",
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
        "After sorting, each interval is inspected a constant number of times. At " +
        "<code>n = 10&#8309;</code> that is about <code>1.7&times;10&#8310;</code> " +
        "comparisons plus a linear scan, versus the hopeless " +
        "<code>5&times;10&#8313;</code> pair checks of the nested loop.</p>",
      "<p>A sweep with 2n events is the same class: you sort 2n numbers and then walk them " +
        "once. Two-pointer intersection of already-sorted disjoint lists is " +
        "<code>O(n + m)</code> with no extra sort, because each pointer only moves forward " +
        "and each interval is considered once.</p>",
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
      bug: "<code>[1,2]</code> and <code>[2,3]</code> should merge on LC 56, but a " +
        "<code>&lt;</code> test looks correct if you pictured exclusive ends and silently " +
        "leaves a one-point gap.",
      fix: "Read the statement. LC 56 and LC 452 treat a shared endpoint as an overlap; " +
        "only then choose <code>&le;</code> versus <code>&lt;</code>." },
    { title: "Sorting by the wrong coordinate",
      bug: "Merging after sorting by end looks tidy, but it misses an overlap that starts " +
        "late and stretches far past an earlier short interval.",
      fix: "Union and coverage sort by start. Greedy keep and min-arrows sort by end. Do " +
        "not mix the two keys." },
    { title: "int overflow on union length",
      bug: "<code>r - l + 1</code> with ends up to <code>10&#8313;</code> and " +
        "<code>n</code> up to <code>10&#8309;</code>, summed in a 32-bit int, wraps and " +
        "reports a nonsense total that still looks like a length.",
      fix: "Accumulate in <code>long</code>, and cast before you subtract so " +
        "<code>(long) r - l + 1</code> cannot overflow the intermediate." },
    { title: "Forgetting to emit the last interval",
      bug: "The loop only emits when a gap appears, so the final running merge is dropped " +
        "and the answer is missing its rightmost block.",
      fix: "Always <code>out.add(cur)</code> after the loop, then test a one-interval " +
        "input and an all-overlapping input as well." },
    { title: "Start and end events at the same time",
      bug: "Processing a start before an end at time t counts an extra room that just freed, " +
        "so touching meetings look like they need two rooms.",
      fix: "If a room can be reused at time t, process ends first. Match the problem's " +
        "\"touching is OK\" rule and add a unit test of <code>[1,2], [2,3]</code>." },
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
      "the end only moves left, so every later interval that still fitted still fits. That " +
      "exchange argument is why \"remove the fewest\" is the same as \"keep the most that " +
      "do not overlap\".</p>"],
    ["How do you list points covered by exactly k intervals?",
      "<p>Sweep with +1 at each start and &minus;1 at each end. Whenever the running count " +
      "changes, close the previous segment at this x and open a new one labelled with the " +
      "new count. Group those segments by the count value and you have every point covered " +
      "by exactly k intervals.</p>"],
    ["Intervals arrive online and you must merge on the fly?",
      "<p>Keep a TreeMap from start to end, or any balanced tree of disjoint ranges. " +
      "Lower-bound the new start, walk the neighbours that overlap, delete them, and insert " +
      "the union. Each arrival is then a handful of tree operations instead of a full " +
      "re-sort. See the TreeMap patterns page for the spelling.</p>"],
    ["What changes on a circle?",
      "<p>Cut the circle at 0, or duplicate the array shifted by the circumference so a " +
      "wrap-around interval becomes an ordinary linear one. Either way you must not " +
      "double-count the cut point, and a wrap-around block has to be merged with the first " +
      "block if they touch across 0.</p>"],
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
  dryIntro: "Merge <code>[1,3], [2,6], [8,10], [15,18]</code> after sorting by start: " +
    "extend when the next start still touches the running end, emit when a gap appears.",
}),

/* =========================== 4. cyclic-sort-and-index-tricks =========== */
pack({
  id: "cyclic-sort-and-index-tricks",
  difficulty: "Medium",
  readTime: "24 min",
  tagline: "When the array is a permutation of a known range, the value is the address: " +
    "swap each number toward index value-1 until every cycle closes.",
  tags: ["cyclic sort", "permutation", "index as hash", "P1"],
  prereqs: [
    ["Sorting & Comparators", "sorting-and-comparators.html"],
    ["Two Pointers", "../01-arrays-and-windows/two-pointers.html"],
  ],
  why: [
    "You are given 100,000 seats labelled 1 through n, and each seat currently holds some " +
      "ticket in that same range, possibly with one number missing and another duplicated. " +
      "A hash set finds the hole in one pass but spends an extra 100,000 boxed integers of " +
      "memory. A library sort plus a scan is about <code>1.7&times;10&#8310;</code> " +
      "comparisons. You need neither: the number 7 belongs at index 6, so swap whatever " +
      "sits at index 6 into its own home, and repeat. Every swap homes at least one value, " +
      "so the whole cleanup is a few hundred thousand exchanges and constant extra memory.",
    "Once the values sit at their addresses, the leftover mismatches are exactly the " +
      "missing, duplicate, or disappeared numbers. That is why this is the native language " +
      "of a whole interview cluster: missing number, first missing positive, find all " +
      "duplicates, set mismatch. Interviewers like it because it looks like a magic trick " +
      "until you say \"the value is the index\". The same idea without swaps is \"index as " +
      "a sign bit\": negate <code>a[|x|-1]</code> to mark that x was seen, which still " +
      "needs the array to be writable and the range to be <code>1..n</code>.",
    "When you cannot write the array at all, treat each index as a node with a single " +
      "outgoing edge to <code>a[i]</code>. That picture is a <em>functional graph</em> " +
      "&mdash; a graph where every node has out-degree one &mdash; and a duplicate value " +
      "is a node with two incoming edges, which forces a cycle. Floyd's tortoise-and-hare " +
      "walk finds the cycle entrance in linear time and constant extra memory. In a real " +
      "statement the tell is <code>n &le; 10&#8309;</code> with values in a range of " +
      "length n, plus \"O(1) extra space\" or \"do not modify the input\".",
  ],
  insight: "A permutation is a set of cycles on indices. Putting each value at its index is " +
    "walking those cycles with swaps. What refuses to sit still is the duplicate already " +
    "occupying a home, or the missing number whose slot is still holding leftover garbage.",
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
    "Cyclic sort walks i from 0 to n-1. While <code>a[i]</code> is in range and is not " +
      "already at home &mdash; home meaning <code>a[i] == a[a[i]-1]</code> would already " +
      "hold, so the loop condition is the opposite &mdash; swap it into index " +
      "<code>a[i]-1</code>. Each swap places at least one new value into its address, so " +
      "the inner while runs at most n times across the whole array, not n times per index. " +
      "Afterward, index i should hold i+1. Any break is the answer: the missing number is " +
      "i+1, and the value sitting there may be the duplicate.",
    "First missing positive uses the same placement after you treat anything " +
      "<code>&le; 0</code> or <code>&gt; n</code> as garbage that cannot occupy a slot. " +
      "After the swaps, the first i with <code>a[i] != i+1</code> is the answer; if every " +
      "slot is home, the missing positive is n+1. When mutation is forbidden, interpret " +
      "the array as <code>next(i) = a[i]</code> on values in 1..n, run Floyd's " +
      "tortoise-and-hare until the two pointers meet, then reset one pointer to the start " +
      "and walk both one step at a time: the meeting point is the cycle entrance, which " +
      "is the duplicate.",
    "Walk <code>[3, 1, 4, 2, 5]</code>, a true permutation, to see the swaps. At i=0 the " +
      "value 3 belongs at index 2, so swap: <code>[4, 1, 3, 2, 5]</code>. Still at i=0, " +
      "4 belongs at index 3: <code>[2, 1, 3, 4, 5]</code>. Then 2 belongs at index 1: " +
      "<code>[1, 2, 3, 4, 5]</code>. Index 0 now holds 1, so the while stops, and the " +
      "remaining slots are already home. On the broken input <code>[3, 1, 3, 4, 2]</code> " +
      "the same process refuses to swap the first 3 because index 2 already holds 3; the " +
      "later scan sees slot 0 still holding 3, so 1 is missing and 3 is the duplicate.",
  ],
  invariant: "<p>After the swaps, every in-range value <code>x</code> that appeared sits at " +
    "index <code>x-1</code>, unless a duplicate already occupies that slot:</p>" +
    "<span class=\"eq\">a[x-1] == x &nbsp;for every x that could be placed uniquely</span>" +
    "<p>In plain words, the array has become its own address book: each number that has a " +
    "unique home is sitting at that home, and anything still in the wrong seat is either " +
    "garbage from outside 1..n or a second copy of a number whose seat was already taken.</p>" +
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
    "<strong>Confirm the range is length n</strong> (or 1..n after you ignore garbage). " +
      "Cyclic sort is only legal when the value itself is a legal index, otherwise you " +
      "are about to read off the end of the array.",
    "<strong>For each i, swap while the value is in range and not yet home.</strong> The " +
      "test <code>a[i] != a[a[i]-1]</code> is what moves a number toward its address " +
      "without needing a second array.",
    "<strong>Stop the while when home already holds this value.</strong> That is how you " +
      "detect a duplicate: a second copy wants the same seat, and swapping again would " +
      "loop forever.",
    "<strong>Scan i from 0 to n-1 after the swaps.</strong> If <code>a[i] != i+1</code>, " +
      "then i+1 is missing and the value sitting there may be the duplicate.",
    "<strong>For first missing positive, skip anything &le; 0 or &gt; n.</strong> Those " +
      "values cannot occupy a slot in 1..n; if every remaining slot is home, the answer " +
      "is n+1.",
    "<strong>When you cannot mutate, run Floyd on <code>f(x) = a[x]</code>.</strong> Start " +
      "at <code>a[0]</code> on a 1-based range stored in an array of length n+1, because " +
      "index 0 is not a value in 1..n.",
    "<strong>Never index <code>a[a[i]-1]</code> without a range check.</strong> A 0 or a " +
      "value past n turns that read into an out-of-bounds access, which is the most " +
      "common crash on this page.",
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
      "<p>Each swap places at least one new value into its home, or proves a duplicate by " +
        "finding that home already holds the same value. A value already home is never " +
        "swapped again, so the inner while runs at most n times across the whole array: " +
        "<span class=\"eq\">T(n) = \u0398(n)</span>. At <code>n = 10&#8309;</code> that is " +
        "a few hundred thousand exchanges, versus <code>1.7&times;10&#8310;</code> " +
        "comparisons for a full sort.</p>",
      "<p>Floyd is the linked-list cycle proof on a functional graph of n+1 nodes and n+1 " +
        "edges (index 0 unused as a value, values in 1..n). Two linear pointer walks find " +
        "the meeting point and then the entrance, still <code>O(n)</code> time and " +
        "<code>O(1)</code> extra memory, which is why it is the answer when mutation is " +
        "forbidden and a hash set is not allowed.</p>",
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
      bug: "<code>while (a[i] != i+1) swap(i, a[i]-1)</code> looks like it must make progress, " +
        "but two copies of x both want index x-1 and the swap just exchanges them forever.",
      fix: "Stop when <code>a[a[i]-1] == a[i]</code>, i.e. home already holds this value. " +
        "Test <code>[3, 1, 3]</code> and confirm the loop exits." },
    { title: "Placing 0 or n+1",
      bug: "<code>a[a[i]-1]</code> with <code>a[i] = 0</code> indexes -1, so first-missing-positive " +
        "crashes on an input that is otherwise legal and well inside the time limit.",
      fix: "Guard <code>a[i] &gt;= 1 &amp;&amp; a[i] &lt;= n</code> before any home access, " +
        "and treat everything outside that range as unplaceable garbage." },
    { title: "Floyd 0-based off-by-one",
      bug: "Starting the tortoise at index 0 when 0 is not a node of <code>f(x) = a[x]</code> " +
        "on a 1-based permutation follows a pointer that the graph does not contain.",
      fix: "LC 287 stores values 1..n in an array of length n+1; start at <code>a[0]</code> " +
        "and follow <code>a[&middot;]</code>, never treating 0 as a value." },
    { title: "Negate mark colliding with already-negative input",
      bug: "LC 448 input is 1..n so negation is a safe seen-bit; LC 41 already contains " +
        "negatives, so the same mark silently destroys real values.",
      fix: "Cyclic-sort LC 41; do not negate unless you first sanitise every slot into " +
        "1..n or a known positive sentinel." },
    { title: "Returning n instead of n+1",
      bug: "Array <code>[1, 2, 3]</code> as first missing positive has no hole inside, so " +
        "returning n looks like \"the scan found nothing\" and is off by one.",
      fix: "After a clean scan where every slot holds i+1, the missing positive is n+1. " +
        "Include <code>[1, 2, 3] &rarr; 4</code> as a unit test." },
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
      "<p>A swap that does not immediately home <code>a[i]</code> still homes the other " +
      "slot, so each index becomes home at most once. Duplicates stop the loop via the " +
      "<code>a[home] == value</code> guard, so there is no cycle of swaps among equals. " +
      "Adding the outer <code>n</code> iterations of i still leaves a linear total.</p>"],
    ["Can you recover the original array after cyclic sort?",
      "<p>No, unless you stored the permutation yourself. The algorithm is in-place and " +
      "destructive: after the swaps the original order is gone. If the caller needs the " +
      "input, clone first &mdash; and then you already have O(n) extra memory, so a " +
      "HashSet was the simpler honest answer.</p>"],
    ["Why does Floyd apply to finding a duplicate?",
      "<p>n+1 slots holding values in 1..n is a pigeonhole: the map <code>x &rarr; a[x]</code> " +
      "has a node with two incoming edges (the duplicate). That node is the entrance of a " +
      "cycle, exactly as in linked-list cycle II. The tortoise-and-hare meeting point is " +
      "somewhere on that cycle; the second walk from the start finds the entrance.</p>"],
    ["First missing positive when n=1?",
      "<p><code>[1]</code> returns 2 because the only slot is already home. <code>[0]</code> " +
      "returns 1 because 0 is garbage and slot 0 is not 1. <code>[2]</code> also returns 1 " +
      "because 2 is out of range for length 1. Always include these three unit tests; they " +
      "catch both the n+1 fallback and the out-of-range skip.</p>"],
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
  dryIntro: "Place each in-range value of <code>[3, 1, 3, 4, 2]</code> at index value-1; " +
    "the slot that refuses to become i+1 names both the missing number and the duplicate.",
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
    "You are given 100,000 numbers and asked for two of them that add to a target. The " +
      "obvious nested loop tries every pair: about " +
      "<code>100000 &times; 100000 / 2 = 5&times;10&#8313;</code> additions, which is an " +
      "instant time-limit failure. Instead, walk the list once and, for each number x, ask " +
      "a table \"have I already seen target &minus; x?\" That question is one hash lookup. " +
      "A hundred thousand lookups finish in a few milliseconds, provided you store each " +
      "value (or its index, or its count) as you go. The data structure is the algorithm.",
    "The second skill is choosing the key. For anagrams it is a <em>canonical signature</em> " +
      "&mdash; a spelling of the letter bag that every rearrangement shares, such as the " +
      "sorted letters or a 26-count. For consecutive sequence it is membership in a set, " +
      "plus the rule \"only start a run from a value whose predecessor is absent\", so you " +
      "do not restart the same run from 2, 3 and 4. For sliding-window uniqueness it is a " +
      "map of last-seen indices. Wrong keys give wrong collisions, which look like random " +
      "wrong answers rather than an obvious off-by-one.",
    "Java's <code>HashMap</code> answers each lookup in expected constant time, meaning " +
      "the average over typical keys is one array hop, and in the worst case a single " +
      "bucket can degrade to linear if every key collides. In interviews state expected " +
      "linear. In contests, adversarial tests exist; for integer keys in a small range " +
      "prefer a plain <code>int[]</code>, and for 64-bit keys consider a custom hash. The " +
      "tell in a real statement is <code>n &le; 10&#8309;</code> plus \"pair with given " +
      "sum\", \"group anagrams\", or \"subarray sum equals k\".",
  ],
  insight: "Store the thing you would have nested-looped for. The key is the partner: " +
    "target minus x, the anagram signature, the prefix that would complete sum k, or the " +
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
    "Two-sum is one pass. For each value x at index i, ask whether " +
      "<code>map</code> already holds <code>target - x</code>; if it does, those two " +
      "indices are the answer. Then <code>map.put(x, i)</code>. Putting after the lookup " +
      "is what stops an element being its own partner when the target is 2x. Consecutive " +
      "sequence dumps everything into a HashSet, then for each x whose predecessor " +
      "<code>x-1</code> is missing, walks x, x+1, &hellip; until the run breaks. Each " +
      "number is visited twice at most (once as a membership test, once inside a run), so " +
      "the whole scan is expected linear.",
    "Prefix-plus-map answers \"how many subarrays sum to k\". Keep a running sum S, add " +
      "<code>map.get(S-k)</code> to the answer (that many earlier prefixes would complete " +
      "sum k with the current prefix), then increment <code>map[S]</code>. The empty " +
      "prefix 0 must sit in the map with count 1 before the loop, otherwise a subarray " +
      "that starts at index 0 is never counted. Anagram keys are a sorted " +
      "<code>char[]</code>, or a frozen 26-int signature. Never use the raw string as a " +
      "key unless you want grouping by identity, not by letter bag.",
    "Walk two-sum on <code>[2, 7, 11, 15]</code> with target 9. The map starts empty. At " +
      "index 0 the value is 2, the partner 7 is absent, so store 2 &rarr; 0. At index 1 " +
      "the value is 7, the partner 2 is already in the map at index 0, and you return " +
      "<code>(0, 1)</code> without ever looking at 11 or 15. The same table, seeded with " +
      "prefix 0, is what counts four subarrays of sum 3 in <code>[1, 2, 1, 2, 1]</code>: " +
      "every time the running sum hits a value whose complement S-3 was seen, you add " +
      "that stored count.",
  ],
  invariant: "<p>After processing prefix <code>a[0..i]</code>, the map holds every partner " +
    "that prefix could complete:</p>" +
    "<span class=\"eq\">map[v] = how we would answer \"have I seen v?\" on a[0..i]</span>" +
    "<p>In plain words, the table is a notebook of leftovers: each leftover is the value, " +
    "signature or prefix that a later item would need in order to finish a pair, a group " +
    "or a subarray. Looking the partner up first, then writing the current item down, is " +
    "what keeps the notebook honest.</p>" +
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
    "<strong>Name the partner you would have searched for in a nested loop.</strong> That " +
      "partner &mdash; target minus x, a letter-bag signature, a prefix, a predecessor " +
      "&mdash; is the only thing the map needs to store.",
    "<strong>Choose the key to match that partner.</strong> A value, a canonical signature, " +
      "a prefix sum, or a membership test: the wrong key collides for the wrong reason and " +
      "the failure looks random.",
    "<strong>Look up first, then insert.</strong> Putting the current item into the map " +
      "before the lookup lets it pair with itself when the target is twice the value.",
    "<strong>Seed prefix maps with 0 mapped to count 1.</strong> Without that empty prefix, " +
      "a subarray that starts at index 0 and sums to k is invisible. For longest-subarray, " +
      "store the earliest index instead of a count.",
    "<strong>Start a consecutive run only at x where x-1 is absent.</strong> Restarting from " +
      "every value inside the run revisits the same numbers and turns a linear scan into a " +
      "quadratic one.",
    "<strong>Replace the map with <code>int[]</code> when the range is tiny.</strong> " +
      "Indexing by the key itself removes hashing, boxing and the load-factor constant.",
    "<strong>Quote expected O(n) time and O(n) extra space.</strong> Interviews want the " +
      "expected bound; mention the worst-case linear bucket only if they ask about " +
      "adversarial hashes.",
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
        "<span class=\"eq\">T(n) = \u0398(n)</span> expected. At <code>n = 10&#8309;</code> " +
        "that is a few hundred thousand lookups, versus the " +
        "<code>5&times;10&#8313;</code> pair checks of the nested loop. Worst case is " +
        "quadratic if every key collides; interviews want the expected bound.</p>",
      "<p>Consecutive sequence visits each value at most twice (one membership test, one " +
        "step inside a run). Anagram grouping sorts each string of length L, which is " +
        "<code>O(n L log L)</code>, or <code>O(n L)</code> if you build a 26-count key " +
        "instead of sorting the letters.</p>",
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
      bug: "When the target is 2x, putting x into the map before the lookup lets the same " +
        "index pair with itself and returns a pair that the statement forbade.",
      fix: "Lookup first, then put. For two-sum II on an already-sorted array, drop the map " +
        "and use two pointers instead." },
    { title: "Forgetting to seed prefix 0",
      bug: "A subarray that starts at index 0 and sums to k never finds a stored prefix, so " +
        "the count stays zero even though that subarray is legal.",
      fix: "<code>map.put(0L, 1)</code> before the loop, and use long keys so the running " +
        "sum cannot wrap." },
    { title: "Restarting a consecutive run at every value",
      bug: "Walking up from 2, 3 and 4 as well as from 1 looks correct on a short sample " +
        "and becomes quadratic on a single long run of length n.",
      fix: "Only start a run when <code>!set.contains(v-1)</code>, so each number is " +
        "expanded from its true left end exactly once." },
    { title: "Using the string itself as an anagram key",
      bug: "\"eat\" and \"tea\" land in different buckets because the raw strings are " +
        "different objects, so the group-anagrams map never merges them.",
      fix: "Sort the letters, or serialise a 26-count with a delimiter, and use that " +
        "canonical spelling as the key." },
    { title: "int overflow on target - x",
      bug: "When target is <code>Integer.MIN_VALUE</code> and x is 1, the subtraction " +
        "<code>target - x</code> wraps in 32 bits and looks up the wrong partner.",
      fix: "Compute <code>long need = (long) target - x</code>, or store keys in a " +
        "<code>Map&lt;Long, Integer&gt;</code> so the difference cannot wrap." },
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
      "<p>Build a map from value to the list of indices that hold it. After the map is " +
      "complete, walk keys x that are at most target minus x so each unordered pair is " +
      "listed once. The time is output-sensitive: if there are p pairs you will spend " +
      "O(n + p) after the build, not O(1).</p>"],
    ["Longest consecutive if values do not fit in a HashSet of ints?",
      "<p>They do: at <code>n &le; 10&#8309;</code> a HashSet of n boxed ints is the " +
      "intended extra memory, Integer cache aside. If the values happen to lie in 1..n, " +
      "a <code>boolean[]</code> is simpler and removes hashing entirely. The range is not " +
      "the problem here; n is.</p>"],
    ["When should the key be a list instead of a string?",
      "<p>A 26-count packed as a string with a delimiter is the easy interview spelling. " +
      "<code>Arrays.hashCode</code> as a key is wrong because HashMap uses equals: two " +
      "<code>int[]</code> with the same contents are not equal. Wrap the count in a " +
      "string, or use a record or a List, so equality is by contents.</p>"],
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
  dryIntro: "Two-sum on <code>[2, 7, 11, 15]</code> with target 9: look up the partner " +
    "before inserting, then the same table idea on a consecutive run and a prefix-sum count.",
}),

/* =========================== 6. matrix-patterns ======================== */
pack({
  id: "matrix-patterns",
  difficulty: "Medium",
  readTime: "24 min",
  tagline: "A matrix is an array with 2D indexing: layers for rotate and spiral, in-place " +
    "markers for set-zeroes, and a staircase walk when rows and columns are sorted.",
  tags: ["matrix", "spiral", "rotate", "search 2D", "P0"],
  prereqs: [
    ["Two Pointers", "../01-arrays-and-windows/two-pointers.html"],
    ["Binary Search Basics", "../01-arrays-and-windows/binary-search-basics.html"],
  ],
  why: [
    "You are handed a 400-by-400 grid of pixels and told to rotate it 90 degrees clockwise " +
      "in place. Allocating a second 160,000-cell matrix and copying " +
      "<code>a[i][j]</code> to <code>b[j][n-1-i]</code> is correct and costs 160,000 writes, " +
      "but the statement forbids the extra memory. The in-place version does the same " +
      "160,000 writes without the second grid: swap across the diagonal (that is a " +
      "<em>transpose</em> &mdash; rows become columns), then reverse each row. Four " +
      "templates of that flavour &mdash; rotate, spiral, set-zeroes, staircase search " +
      "&mdash; cover almost every interview matrix that is not a graph.",
    "Index arithmetic is where people bleed time. Off-by-one on layers, walking off the " +
      "right edge of a spiral, and using the first row as a marker then zeroing it too " +
      "early are the classic bugs. Drawing the current layer and naming " +
      "<code>top, bottom, left, right</code> removes them, because every index you write " +
      "is then a function of those four numbers instead of a hard-coded " +
      "<code>n-1</code> inside a loop that also shrinks. A 400-by-400 spiral is 160,000 " +
      "visits if you get the bounds right, and a handful of duplicates or misses if you do not.",
    "When the matrix really is a graph &mdash; islands, unique paths with obstacles, word " +
      "search &mdash; switch modules: BFS or DFS on the four neighbours. This page is the " +
      "geometry of a dense grid you scan in a prescribed order, not the implicit graph. In " +
      "a real statement the tell is <code>n, m &le; 400</code> plus \"rotate in place\", " +
      "\"spiral order\", \"set zeroes\", or \"search a sorted matrix\". Those limits are " +
      "permission to touch every cell a constant number of times and nothing heavier.",
  ],
  insight: "Name the bounds of the current layer, or the current staircase cell. Every " +
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
    "Rotate 90 degrees clockwise sends <code>a[i][j]</code> to <code>a[j][n-1-i]</code>. " +
      "In place, first <em>transpose</em> by swapping <code>a[i][j]</code> with " +
      "<code>a[j][i]</code> for every <code>j &gt; i</code>, then reverse each row. Layers " +
      "work too: cycle four cells around the current ring. Spiral uses the same rings " +
      "without rotating: while <code>top &le; bottom</code> and <code>left &le; right</code>, " +
      "walk right, down, left, up, and shrink the bound you just finished. After walking a " +
      "side, check the bounds again so a single remaining middle row is not walked twice " +
      "on the way back.",
    "Set zeroes records which rows and columns contain a zero, then fills them. To stay " +
      "in-place, row 0 and column 0 are the bitsets, plus one extra boolean because cell " +
      "<code>[0][0]</code> belongs to both. The second pass zeroes the inner " +
      "<code>(n-1)&times;(m-1)</code> first so those markers survive, then clears row 0 " +
      "and column 0 last. Staircase search starts at the top-right of a matrix whose rows " +
      "and columns are both sorted: if the cell is too big, move left; too small, move " +
      "down. Each step discards a whole row or a whole column, so the walk is " +
      "<code>O(n + m)</code>.",
    "Walk the 3-by-3 <code>[[1,2,3],[4,5,6],[7,8,9]]</code>. Transpose swaps 2 with 4, 3 " +
      "with 7, and 6 with 8, leaving <code>[[1,4,7],[2,5,8],[3,6,9]]</code>. Reverse each " +
      "row and you have <code>[[7,4,1],[8,5,2],[9,6,3]]</code>, which is the 90-degree " +
      "clockwise rotate. The same original, walked as a spiral, goes right 1,2,3, down 6,9, " +
      "left 8,7, up 4, then the leftover centre 5. Searching for 6 in a row-and-column-sorted " +
      "copy starts at the top-right 3, steps down to 6, and stops.",
  ],
  array: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  invariant: "<p>A layer with bounds <code>top, bottom, left, right</code> is processed " +
    "exactly once, and the next layer is strictly inside:</p>" +
    "<span class=\"eq\">top++, bottom--, left++, right--</span>" +
    "<p>In plain words, you walk the current rectangle's rim and then throw that rim away. " +
    "The four numbers always describe a still-unvisited hole in the middle, so a cell is " +
    "written or read once and never again.</p>" +
    "<p>Interview sentence: <em>\"I walk the current rectangle's perimeter, then I shrink " +
    "all four bounds.\"</em></p>",
  grid: {
    corner: "a",
    rowHeads: ["0", "1", "2"],
    colHeads: ["0", "1", "2"],
  },
  vars: ["step", "cell", "note2"],
  frames: [
    { note: "Start with the 3-by-3 matrix [[1,2,3],[4,5,6],[7,8,9]]. The next two frames rotate it 90 degrees clockwise in place.",
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
    "<strong>Classify the question first.</strong> In-place geometry, search in a sorted " +
      "grid, and a grid graph are three different templates; picking the wrong one wastes " +
      "the whole attempt.",
    "<strong>Rotate clockwise by transposing, then reversing each row.</strong> The undo is " +
      "the opposite pair (reverse rows, then transpose), which is how you check one cell " +
      "by hand.",
    "<strong>Spiral keeps four bounds and shrinks after each side.</strong> Re-check " +
      "<code>top &le; bottom</code> before walking left, and <code>left &le; right</code> " +
      "before walking up, so a leftover middle row is not visited twice.",
    "<strong>Set zeroes in two passes.</strong> Mark on row 0 and column 0 first, zero the " +
      "inner cells next, and only then clear the first row and column so the markers survive.",
    "<strong>For LC 74, treat the matrix as one sorted array of length n&times;m.</strong> " +
      "Binary-search with <code>mid = lo + (hi - lo) / 2</code> and map back to " +
      "<code>[mid / m][mid % m]</code>.",
    "<strong>For LC 240, start at the top-right cell.</strong> A value that is too big " +
      "discards its column (move left); a value that is too small discards its row (move down).",
    "<strong>Border floods start from every border cell of the start state.</strong> Mark " +
      "those cells safe with DFS or BFS, then flip the unmarked interior, which is why " +
      "surrounded-regions is not a spiral walk.",
    "<strong>Never allocate an n-by-n extra grid if they said in-place.</strong> The first " +
      "row and column, or a four-cell cycle, are the allowed extra memory.",
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
        "<span class=\"eq\">T = \u0398(n m)</span>. At 400-by-400 that is 160,000 visits, " +
        "comfortably under a second. Extra memory is the output list (spiral) or the O(1) " +
        "markers (rotate, set-zeroes).</p>",
      "<p>Staircase search discards a row or a column per step, so it takes at most n+m " +
        "steps &mdash; 800 on a 400-by-400 grid, not 160,000. LC 74 binary search is " +
        "<code>O(log(n m))</code> comparisons on a virtual 1D array, about 18 probes when " +
        "n and m are 400.</p>",
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
      bug: "After shrinking top, the left-going pass re-reads the same single remaining row, " +
        "so a 1-by-n matrix prints every cell twice and the answer looks almost right.",
      fix: "Guard with <code>if (top &le; bottom)</code> before walking left, and " +
        "<code>if (left &le; right)</code> before walking up." },
    { title: "Zeroing markers too early",
      bug: "Clearing row 0 in the first inner pass wipes the column-marker bits, so later " +
        "columns that should have stayed non-zero get cleared (or the reverse).",
      fix: "Zero the inner <code>(n-1)&times;(m-1)</code> first, then row 0, then column 0, " +
        "so the sentinels survive until they have been read." },
    { title: "mid overflow when flattening LC 74",
      bug: "<code>int mid = (lo + hi) / 2</code> looks like ordinary binary search, but " +
        "<code>lo + hi</code> can overflow a 32-bit int when n&times;m is large.",
      fix: "Always write <code>int mid = lo + (hi - lo) / 2;</code> and map back with " +
        "<code>mid / m</code> and <code>mid % m</code>." },
    { title: "Staircase starting at bottom-right",
      bug: "From the bottom-right both legal steps increase the value, so you cannot discard " +
        "a row or a column and the walk has nowhere useful to go.",
      fix: "Start at top-right or bottom-left, where one step decreases the value and the " +
        "other increases it." },
    { title: "Transpose of a non-square",
      bug: "In-place swap of <code>a[i][j]</code> with <code>a[j][i]</code> is only legal " +
        "on a square; on an n-by-m rectangle those indices do not even exist.",
      fix: "Allocate a fresh m-by-n array for a rectangular transpose, and treat rotate as " +
        "square-only (LC 48 is square)." },
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
      "<p>Transpose, then reverse each <em>column</em> (or reverse the rows first, then " +
      "transpose). The mapping is <code>a[i][j] &rarr; a[n-1-j][i]</code>; check one " +
      "corner cell by hand so you do not mix the clockwise and counter-clockwise pair. " +
      "The four-cycle version just walks the opposite permutation of the same four cells.</p>"],
    ["Can staircase search be binary search?",
      "<p>You can binary-search each row in <code>O(n log m)</code>. That is worse than " +
      "<code>O(n + m)</code> when n and m are close, and better when one dimension is " +
      "tiny (a 1-by-m row is just a binary search). LC 240 wants the staircase because " +
      "both dimensions are large and only rows-and-columns-sorted, not concatenated.</p>"],
    ["Set zeroes without using the first row as a marker?",
      "<p>Two boolean arrays of size n and m are O(n+m) extra and much simpler to get " +
      "right. The O(1) first-row / first-column version is only required when they insist " +
      "on constant extra memory. Mention both in an interview and implement the one they ask for.</p>"],
    ["Spiral on a jagged / empty matrix?",
      "<p>Guard <code>m = 0</code> before you read <code>a[0].length</code>. A 1-by-n row " +
      "is only the rightward pass; the reverse passes must be skipped by the " +
      "<code>top &le; bottom</code> and <code>left &le; right</code> checks, otherwise you " +
      "walk the same row backwards and duplicate every single value.</p>"],
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
  dryIntro: "Rotate <code>[[1,2,3],[4,5,6],[7,8,9]]</code> by transposing then reversing " +
    "rows, then walk the same grid as a spiral and as a staircase search for 6.",
}),

/* =========================== 7. bit-manipulation ======================= */
pack({
  id: "bit-manipulation",
  difficulty: "Medium",
  readTime: "26 min",
  tagline: "Bits are a 32- or 64-slot boolean array that hardware already ANDs, ORs and " +
    "XORs in one cycle \u2014 subset enumeration, parity, and \"every bit independently\" " +
    "all live here.",
  tags: ["bits", "XOR", "bitmask", "popcount", "P0"],
  prereqs: [
    ["Complexity Analysis", "../00-foundations/complexity-analysis.html"],
    ["Java for DSA", "../00-foundations/java-for-dsa.html"],
  ],
  why: [
    "You are given 100,000 integers in which every value appears twice except one, and you " +
      "must print the loner. A hash map of counts is correct and uses 100,000 extra boxed " +
      "entries. XOR &mdash; the bit-wise exclusive-or, written <code>^</code>, which is 1 " +
      "exactly when the two bits differ &mdash; finishes the same job with one accumulator " +
      "and 100,000 word operations. Take 13, which is <code>1101</code> in binary. " +
      "<code>13 ^ 13</code> is <code>0000</code> because every bit cancelled; " +
      "<code>13 ^ 0</code> is still 13; <code>13 ^ 6</code> (6 is <code>0110</code>) is " +
      "<code>1011</code>, which is 11. Pairs cancel, the unique value remains.",
    "The same 32 bits are also a tiny set. A <em>shift</em> slides those bits: " +
      "<code>13 &lt;&lt; 1</code> is <code>11010</code> = 26 (multiply by two); " +
      "<code>13 &gt;&gt; 1</code> is <code>0110</code> = 6 (divide by two, rounding toward " +
      "negative infinity on signed ints). A <em>mask</em> is a number you AND with to keep " +
      "only some bits: <code>13 &amp; (1 &lt;&lt; 2)</code> is <code>1101 &amp; 0100</code> " +
      "= <code>0100</code>, so bit 2 of 13 is on. When n is at most 20, the integers " +
      "0 through <code>(1 &lt;&lt; n) - 1</code> are every subset of n items &mdash; about " +
      "a million masks, each tested in a handful of bit operations, which is why " +
      "\"enumerate every subset\" is legal at that limit and hopeless at n = 30.",
    "Java stores negatives in <em>two's complement</em>: to negate 13, flip every bit of " +
      "<code>00001101</code> to <code>11110010</code> and add one, getting " +
      "<code>11110011</code>, which is -13. That is why <code>13 &amp; -13</code> equals 1, " +
      "the lowest set bit, and why <code>&gt;&gt;</code> sign-extends (fills new bits with " +
      "1 on a negative) while <code>&gt;&gt;&gt;</code> fills with 0. Shifting an " +
      "<code>int</code> by 32 is masked to 5 bits, so <code>1 &lt;&lt; 32</code> is 1, not " +
      "0. In a real statement the tell is \"every element appears twice except one\", " +
      "\"power of two\", or <code>n &le; 20</code> plus \"every subset\".",
  ],
  insight: "Treat the integer as a set of bit positions. XOR toggles membership, AND keeps " +
    "the intersection, OR takes the union, and <code>mask ^ (1 &lt;&lt; i)</code> flips " +
    "element i. Most bit problems are set problems wearing an integer costume.",
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
    "An XOR fold is a running accumulator that starts at 0 and XORs every element in. " +
      "Because <code>x ^ x = 0</code> and XOR does not care about order, every pair " +
      "vanishes and the unique value remains. For values that appear three times, count " +
      "each of the 32 bits modulo 3 instead. A power of two has exactly one bit set, so " +
      "<code>x &gt; 0 &amp;&amp; (x &amp; (x - 1)) == 0</code>: subtracting one turns the " +
      "trailing zeros of x into ones and the lowest one into a zero, and AND with x is " +
      "then empty. The same identity, written <code>x &amp;= x - 1</code>, turns off the " +
      "lowest set bit and is the kernel of Kernighan's popcount (count how many times you " +
      "can do that before x is 0).",
    "A mask is an integer whose bit i is on exactly when element i is in the subset. The " +
      "loop <code>for (int m = 0; m &lt; (1 &lt;&lt; n); m++)</code> therefore visits every " +
      "subset when n is at most 20, and <code>(m &amp; (1 &lt;&lt; i)) != 0</code> tests " +
      "membership. Submasks of a particular m walk with <code>s = (s - 1) &amp; m</code>. " +
      "Prefix XOR is the same identity as prefix sums: the XOR of <code>a[l..r]</code> is " +
      "<code>px[r+1] ^ px[l]</code>. In Java prefer <code>Integer.bitCount</code>, " +
      "<code>Integer.numberOfTrailingZeros</code> and <code>Integer.highestOneBit</code> " +
      "over a hand-rolled loop unless you are teaching the loop.",
    "Walk the XOR fold on <code>[4, 1, 2, 1, 2]</code>, writing bits of the accumulator. " +
      "Start at 0. XOR 4 (<code>100</code>) gives <code>100</code>. XOR 1 " +
      "(<code>001</code>) gives <code>101</code> = 5. XOR 2 (<code>010</code>) gives " +
      "<code>111</code> = 7. XOR the second 1: <code>111 ^ 001 = 110</code> = 6, and the " +
      "first 1 has cancelled. XOR the second 2: <code>110 ^ 010 = 100</code> = 4, and both " +
      "pairs are gone. The same 13 from the opening: <code>13 &amp; -13</code> is 1 because " +
      "two's complement -13 is <code>...11110011</code>, AND keeps only the shared lowest " +
      "one, and two iterations of <code>x &amp;= x - 1</code> on 12 (<code>1100</code>) " +
      "walk 12 &rarr; 8 &rarr; 0, so popcount is 2.",
  ],
  invariant: "<p>XOR is its own inverse and is associative:</p>" +
    "<span class=\"eq\">x \u2295 x = 0,&nbsp; x \u2295 0 = x,&nbsp; " +
    "(a\u2295b\u2295c) \u2295 b = a\u2295c</span>" +
    "<p>In plain words, XOR is a toggle: hitting a bit twice turns it back off, so every " +
    "even count of a value disappears and only the odd leftover remains. A mask is the " +
    "same idea pointed at positions: bit i on means \"i is in the set\", and AND / OR / " +
    "XOR become intersect / union / toggle on that set.</p>" +
    "<p>Interview sentence: <em>\"Pairs cancel under XOR; a mask is a subset of bit " +
    "positions.\"</em></p>",
  array: [4, 1, 2, 1, 2],
  vars: ["i", "x", "acc", "bits"],
  frames: [
    { note: "XOR-fold [4,1,2,1,2]. Accumulator starts at 0. i=0, x=4 is bits 100, so acc becomes 4.",
      active: [0], dim: [1, 2, 3, 4],
      values: { i: 0, x: 4, acc: 4, bits: "100" } },
    { note: "Next x=1, bits 001. XOR with acc 100 gives 101, so the accumulator is now 5.",
      active: [1], done: [0], dim: [2, 3, 4],
      values: { i: 1, x: 1, acc: 5, bits: "101" } },
    { note: "Next x=2, bits 010. XOR with acc 101 gives 111, so the accumulator is now 7.",
      active: [2], done: [0, 1], dim: [3, 4],
      values: { i: 2, x: 2, acc: 7, bits: "111" } },
    { note: "The second 1 arrives. XOR 111 with 001 gives 110, so the first 1 has cancelled and acc is 6.",
      active: [3], done: [0, 1, 2], dim: [4],
      values: { i: 3, x: 1, acc: 6, bits: "110" } },
    { note: "The second 2 arrives. XOR 110 with 010 gives 100: both pairs cancelled and the unique 4 remains.",
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
    "<strong>XOR-fold when pairs, or any even count, should vanish.</strong> One accumulator " +
      "replaces a hash map of counts because <code>x ^ x = 0</code> cancels every repeat.",
    "<strong>Use <code>x &amp; (x - 1)</code> to drop the lowest set bit.</strong> Looping " +
      "that until x is 0 is Kernighan popcount, and one shot of it is the power-of-two test.",
    "<strong>Use <code>x &amp; -x</code> to isolate the lowest set bit.</strong> Two's " +
      "complement makes -x share only that one bit with x, which is also the Fenwick " +
      "\"next bucket\" step.",
    "<strong>Enumerate masks with <code>for (int m = 0; m &lt; (1 &lt;&lt; n); m++)</code> " +
      "when n is at most 20.</strong> Use <code>1L &lt;&lt; i</code> for i up to 62 so the " +
      "shift does not wrap on an int.",
    "<strong>Walk submasks of m with <code>s = (s - 1) &amp; m</code>.</strong> Each step " +
      "turns off some bits of m without ever leaving the subset, which is why the inner " +
      "SOS loop is 3^n rather than 4^n.",
    "<strong>Build a prefix XOR array for subarray queries.</strong> The range " +
      "<code>a[l..r]</code> is then one operation, <code>px[r+1] ^ px[l]</code>, the same " +
      "identity as prefix sums with XOR in place of plus.",
    "<strong>In Java, use <code>&gt;&gt;&gt;</code> for logical shifts and never " +
      "<code>1 &lt;&lt; 32</code> on an int.</strong> The shift count is masked to 5 bits, " +
      "so that expression is 1, and arithmetic <code>&gt;&gt;</code> keeps the sign bit.",
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
      "<p>XOR, AND or OR of n integers is one pass: <span class=\"eq\">\u0398(n)</span> " +
        "word operations. At <code>n = 10&#8309;</code> that is 100,000 XORs, versus a " +
        "hash map of 100,000 boxed counts. Kernighan popcount is proportional to the " +
        "number of set bits, at most 32 per int, so it is constant for interview purposes.</p>",
      "<p>Subset enumeration tries 2^n masks and n bit tests each: " +
        "<span class=\"eq\">T(n) = \u0398(n 2^n)</span>. At n=20 that is about 21 million " +
        "bit tests, fine in Java; at n=25 it is 800 million and already tight. Submask " +
        "enumeration of one mask with popcount p is 2^p, and summing over all masks is " +
        "3^n, which is why SOS inner loops stop around n=15.</p>",
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
      bug: "<code>1 &lt;&lt; 31</code> is Integer.MIN_VALUE (negative), and " +
        "<code>1 &lt;&lt; 32</code> is 1 because Java masks the shift count to 5 bits, so " +
        "a loop bound you thought was 0 wraps back to 1.",
      fix: "Write <code>1L &lt;&lt; k</code> for k up to 62, and never shift an " +
        "<code>int</code> by 32 or more." },
    { title: "Arithmetic >> on a sign bit",
      bug: "<code>-1 &gt;&gt; 1</code> stays -1 because arithmetic shift copies the sign " +
        "bit, so a bit-pattern you meant to halve stays all ones.",
      fix: "Use <code>&gt;&gt;&gt;</code> whenever you want zeros shifted in. Java has no " +
        "unsigned int type, so the operator is the only unsigned shift you get." },
    { title: "x & (x-1) on x=0",
      bug: "A power-of-two test without <code>x &gt; 0</code> accepts 0 (and any negative), " +
        "because <code>0 &amp; -1</code> is 0 and looks like \"exactly one bit\".",
      fix: "Write <code>x &gt; 0 &amp;&amp; (x &amp; (x - 1)) == 0</code>, and unit-test " +
        "0, 1, 2 and -8." },
    { title: "XOR of a subarray without a prefix",
      bug: "Recomputing <code>XOR(l..r)</code> in O(r-l) per query looks like a one-liner " +
        "and dies at n, q = 1e5, which is 5&times;10&#8313; XORs in the worst case.",
      fix: "Build a prefix XOR array once, then answer each query as " +
        "<code>p[r+1] ^ p[l]</code> in one operation." },
    { title: "Mask loop with n=31 on int",
      bug: "<code>1 &lt;&lt; n</code> as the loop bound overflows a signed int: 2^31 is " +
        "negative, so the loop either never runs or runs forever.",
      fix: "Keep n at most 30 for <code>int</code> masks, or switch to " +
        "<code>1L &lt;&lt; n</code> and a <code>long</code> loop variable." },
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
      "<p>XOR everything to get a^b. Those two numbers differ in at least one bit, and " +
      "the lowest set bit of a^b names one such bit. Partition the array into \"that bit " +
      "on\" and \"that bit off\" and XOR-fold each part: each part still has even counts " +
      "of the paired values and exactly one unique, which is LC 260.</p>"],
    ["Why is n & -n the lowest set bit?",
      "<p>Two's complement defines -n as ~n+1. Adding one flips every trailing 1 of ~n " +
      "into a 0 and the first 0 into a 1, which is exactly the lowest set bit of n. AND " +
      "with n then keeps only that shared one. On 13 that is <code>1101 &amp; ...0011 = " +
      "0001</code>.</p>"],
    ["Enumerate only submasks of m, not all 2^n?",
      "<p>Write <code>for (int s = m; s != 0; s = (s - 1) &amp; m)</code> and handle s=0 " +
      "as a last step. Each iteration turns off some bits without ever leaving m, so you " +
      "visit exactly the 2^{popcount(m)} submasks. Over all pairs (mask, submask) that is " +
      "3^n, the inner loop of SOS DP.</p>"],
    ["Maximum XOR pair in O(n)?",
      "<p>Not with a mask loop: n=1e5 cannot afford 2^32. Build a binary trie of the " +
      "numbers (or of prefix XORs, if the question is a subarray) and, for each value, " +
      "greedy-walk the opposite bit at every depth. That is O(32 n) and lives on the XOR " +
      "trie page.</p>"],
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
  dryIntro: "XOR-fold <code>[4, 1, 2, 1, 2]</code> bit by bit so each pair cancels, then " +
    "count the set bits of 12 with <code>x &amp;= x-1</code> and list the 8 masks of n=3.",
}),

];


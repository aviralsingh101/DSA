/* Module 03 — Linear Data Structures */

export const topics = [

/* ================================ 1. stacks-and-monotonic-stack ======== */
{
  id: "stacks-and-monotonic-stack",
  difficulty: "Medium",
  readTime: "28 min",
  tagline: "A stack answers \"who is waiting for me?\" in linear time: next greater, nearest " +
    "smaller, histogram rectangles, trapped rain, and the contribution of every subarray minimum.",
  tags: ["stack", "monotonic stack", "NGE", "histogram", "P0"],
  prereqs: [
    ["Java for DSA", "../00-foundations/java-for-dsa.html"],
    ["Two Pointers", "../01-arrays-and-windows/two-pointers.html"],
  ],

  why: {
    paras: [
      "The next-greater-element question looks like it wants a nested scan: for each index, walk " +
      "right until you find a strictly larger value. That is <code>O(n&sup2;)</code>, and it dies " +
      "at <code>n = 10&#8309;</code>. The observation that saves it is that most of those inner " +
      "scans are wasted: if <code>a[j]</code> is smaller than <code>a[i]</code> and <code>j</code> " +
      "is to the right of <code>i</code>, then <code>a[j]</code> can never be the next greater of " +
      "anyone still waiting to the left of <code>i</code>. A stack of unresolved indices, popped " +
      "the moment a greater value arrives, does all the work in one left-to-right pass.",
      "That same pop-when-dominated structure is the engine behind an entire SDE-2 cluster. " +
      "Largest rectangle in a histogram is next-smaller on both sides. Trapping rain water is " +
      "\"bounded by the nearest taller bar on the left and on the right\". Sum of subarray " +
      "minimums is \"how many subarrays is this element the min of?\", which is previous-less " +
      "times next-less. Daily temperatures, online stock span, visible people in a queue: all " +
      "next-greater with a different payload. Once you see the cluster, you stop solving them as " +
      "separate puzzles.",
      "The other stack family is structural, not monotonic: matching brackets, decoding nested " +
      "strings, and evaluating expressions (RPN, calculator with +&minus;&times;/ and parentheses). " +
      "Those keep unmatched openers or pending operators, not a monotone sequence of values. " +
      "Mixing the two families in an interview is a classification error, so this page separates " +
      "them cleanly and drills the monotonic one until the recognition is automatic.",
    ],
    insight: "A monotonic stack stores indices whose answer is not yet known, in an order that " +
      "lets you discard dominated candidates forever. Each index is pushed once and popped once, " +
      "so the nested <code>while</code> is <code>O(n)</code> amortised, not quadratic.",
  },

  recognise: {
    yes: [
      "\"Next / previous strictly greater (or smaller) element\" for every index, or a quantity " +
        "that is a function of those two neighbours",
      "\"Largest rectangle in a histogram\", \"maximal rectangle of 1s\" after reducing each row " +
        "to a histogram",
      "\"How much water can be trapped\", when the bound at each bar is the nearest taller bar " +
        "on both sides",
      "\"Sum of subarray minimums / maximums\", \"number of subarrays where the min is X\" &mdash; " +
        "contribution of each element equals " +
        "<code>(i &minus; prev) &times; (next &minus; i)</code>",
      "A stream where the useful history is the increasing (or decreasing) envelope of recent " +
        "values: stock span, online next greater, visible people to the right",
      "Matching parentheses, nested decode, or operator-precedence evaluation (the structural " +
        "stack, not the monotonic one)",
    ],
    no: [
      "You need the maximum inside a <em>sliding window of fixed size</em> &rarr; that is a " +
        "<a href=\"queues-and-monotonic-deque.html\">monotonic deque</a>, because candidates " +
        "also expire by age, not only by being dominated",
      "The query is \"k-th greatest so far\" or \"median of a stream\" &rarr; a " +
        "<a href=\"heaps-and-priority-queue.html\">heap</a>, not a stack",
      "You need the nearest greater in <em>either</em> direction with updates in between &rarr; " +
        "a sparse table or a segment tree, not a one-pass stack",
      "The sequence is not compared by a total order on values (graphs, permutations as swaps) " +
        "&rarr; a different structure",
    ],
    table: [
      ["\"next greater element to the right\"", "Unresolved indices, popped by a larger arrival",
        "Decreasing stack of indices, left to right"],
      ["\"previous smaller element\"", "Same idea, opposite comparison or opposite scan",
        "Increasing stack"],
      ["\"largest rectangle in histogram\"", "Width = next-smaller minus prev-smaller minus 1",
        "One pass with a 0-sentinel at the end"],
      ["\"trapping rain water\"", "Water on a bar is min(tallest-left, tallest-right) minus height",
        "Stack of bars, or two-pointer with running maxes"],
      ["\"sum of subarray mins\"", "Each value contributes to a rectangle of subarrays it owns",
        "Prev-less and next-less; one side strict to break ties"],
      ["\"daily temperatures\" / \"stock span\"", "NGE with distance instead of value",
        "Same stack, payload is <code>i &minus; j</code>"],
      ["\"evaluate RPN / basic calculator\"", "Pending values and operators, not monotone values",
        "Structural stack; two deques or one of pairs"],
      ["<strong>Confused with:</strong> sliding-window maximum",
        "Window expiry is by index age, not only by domination",
        "<a href=\"queues-and-monotonic-deque.html\">Monotonic deque</a> (stack has no cheap front-expiry)"],
    ],
    constraint: "<code>n &le; 10&#8309;</code> with a next-greater / histogram / rain flavour is " +
      "the signature for a linear stack. Areas and summed contributions need <code>long</code>: " +
      "heights up to <code>10&#8313;</code> times widths up to <code>10&#8309;</code> overflow " +
      "<code>int</code>.",
  },

  core: {
    heading: "Core idea and the invariant",
    paras: [
      "Keep a stack of indices whose next-greater (or next-smaller) is unknown. The values at " +
      "those indices are monotone: decreasing if you are hunting a strictly greater neighbour, " +
      "increasing if you are hunting a strictly smaller one. When the incoming <code>a[i]</code> " +
      "breaks the monotone property, every index you can pop has just found its answer, and those " +
      "indices can never be useful again &mdash; anything they could have answered is better " +
      "answered by <code>i</code>, which is both more extreme and further right (so it stays live " +
      "longer).",
      "Store <em>indices</em>, not values. Distances, widths and \"is this still in range\" all " +
      "need the position. The sentinel trick for histogram is to run the loop to " +
      "<code>i = n</code> with a virtual height of 0, so every remaining bar is forced to pop and " +
      "report its rectangle. Forgetting the sentinel undercounts every bar that is a suffix minimum.",
      "Contribution problems (sum of subarray mins) use the same neighbours. For a unique " +
      "minimum at <code>i</code>, the subarrays where it is the min are those that start in " +
      "<code>(prevLess, i]</code> and end in <code>[i, nextLess)</code>. Ties must be broken by " +
      "making one side strict and the other non-strict, otherwise a plateau is counted twice or " +
      "not at all.",
    ],
    invariantTitle: "The invariant",
    invariant: "<p>The stack holds indices of unresolved candidates in monotone order of " +
      "<code>a[·]</code>. For a decreasing stack used for next-greater:</p>" +
      "<span class=\"eq\">a[s&#8320;] &ge; a[s&#8321;] &ge; &hellip; &ge; a[s&#8342;] , and every " +
      "popped index j has a[j] &lt; a[i] with no greater value in (j, i)</span>" +
      "<p>Each index is pushed once and popped at most once, so the inner <code>while</code> " +
      "costs <code>O(n)</code> total. That amortised bound is the sentence you say in an " +
      "interview when they point at the nested loop and ask \"isn't this quadratic?\".</p>",
    extra: [
      { kind: "math", title: "Why a popped candidate is dead",
        html: "<p>Suppose <code>j</code> is below <code>i</code> on a decreasing stack and " +
          "<code>a[i] &ge; a[j]</code>. For any later index <code>k</code>, the next-greater of " +
          "<code>k</code> that could have been <code>j</code> is at least as well served by " +
          "<code>i</code>: <code>i</code> is closer to <code>k</code> if we were going left, and " +
          "to the right <code>i</code> is found first. Either way <code>j</code> is dominated, so " +
          "popping it is not a heuristic &mdash; it is exact.</p>" },
      { kind: "tip", title: "<code>ArrayDeque</code>, never <code>Stack</code>",
        html: "<p>Java's <code>Stack</code> is a synchronised legacy class that extends " +
          "<code>Vector</code>. Use <code>ArrayDeque&lt;Integer&gt;</code> with " +
          "<code>addLast</code> / <code>pollLast</code> / <code>peekLast</code>. It is the fastest " +
          "stack, does not allow <code>null</code>, and is the same type you will use for the " +
          "monotonic deque on the next page. Treat <code>new Stack&lt;&gt;()</code> as a bug in " +
          "this course.</p>" },
      { kind: "warn", title: "Strict vs non-strict is a correctness question",
        html: "<p>Equal values: if you pop on <code>&le;</code> you compute next-greater-<em>or-equal</em>, " +
          "which is wrong for NGE and right for some histogram variants. For contribution " +
          "problems, pick one side strict so each subarray has exactly one owner. Draw a " +
          "plateau of three equal mins and count by hand before you trust the comparison.</p>" },
    ],
  },

  visuals: [
    {
      kind: "array", vizId: "ngePass",
      h3: "Next greater to the right, one pass",
      intro: "Array <code>[2, 1, 2, 4, 3]</code>. The stack holds indices waiting for a strictly " +
        "greater value, bottom to top in decreasing order. Watch each pop write an answer; " +
        "whatever is left at the end has no greater to the right.",
      caption: "Each index is pushed once and popped at most once. The nested while is therefore " +
        "linear, and the answer is [4, 2, 4, -1, -1].",
      data: {
        label: "a (next-greater written into cells as they resolve)",
        array: [2, 1, 2, 4, 3],
        vars: ["i", "a[i]", "stack", "wrote"],
        speed: 950,
        frames: [
          { note: "Start. Stack empty. Answers are unknown, shown as the original values.",
            dim: [0, 1, 2, 3, 4],
            values: { i: "\u2014", "a[i]": "\u2014", stack: "[]", wrote: "\u2014" } },
          { note: "i = 0, a[0] = 2. Nothing to pop. Push 0. Stack [0].",
            active: [0], dim: [1, 2, 3, 4], pointers: { i: 0 },
            values: { i: 0, "a[i]": 2, stack: "[0]", wrote: "\u2014" } },
          { note: "i = 1, a[1] = 1. 1 is not greater than 2, so 0 still waits. Push 1. Stack [0,1].",
            active: [1], done: [0], dim: [2, 3, 4], pointers: { i: 1 },
            values: { i: 1, "a[i]": 1, stack: "[0, 1]", wrote: "\u2014" } },
          { note: "i = 2, a[2] = 2. 2 > a[1] = 1, so pop 1 and write nge[1] = 2.",
            active: [2], x: [1], done: [0], dim: [3, 4], pointers: { i: 2 },
            values: { i: 2, "a[i]": 2, stack: "[0]", wrote: "nge[1] = 2" } },
          { note: "2 is not greater than a[0] = 2 (strict). Push 2. Stack [0,2].",
            active: [2], done: [0, 1], dim: [3, 4], pointers: { i: 2 },
            values: { i: 2, "a[i]": 2, stack: "[0, 2]", wrote: "\u2014" } },
          { note: "i = 3, a[3] = 4. 4 > a[2] = 2, pop 2, write nge[2] = 4.",
            active: [3], x: [2], done: [0, 1], dim: [4], pointers: { i: 3 },
            values: { i: 3, "a[i]": 4, stack: "[0]", wrote: "nge[2] = 4" } },
          { note: "4 > a[0] = 2 as well, pop 0, write nge[0] = 4. Push 3. Stack [3].",
            active: [3], best: [0, 2], done: [1], dim: [4], pointers: { i: 3 },
            values: { i: 3, "a[i]": 4, stack: "[3]", wrote: "nge[0] = 4" } },
          { note: "i = 4, a[4] = 3. 3 is not greater than 4, so 3 still waits. Push 4. Stack [3,4].",
            active: [4], done: [0, 1, 2], pointers: { i: 4 },
            values: { i: 4, "a[i]": 3, stack: "[3, 4]", wrote: "\u2014" } },
          { note: "End of array. Remaining indices have no greater to the right: nge[3] = nge[4] = -1. Answer [4, 2, 4, -1, -1].",
            best: [0, 1, 2], done: [3, 4],
            values: { i: "done", "a[i]": "\u2014", stack: "[]", wrote: "[4, 2, 4, -1, -1]" } },
        ],
      },
    },
    {
      kind: "array", vizId: "histRect",
      h3: "Histogram rectangle from nearest-smaller neighbours",
      intro: "Heights <code>[2, 1, 5, 6, 2, 3]</code>. For the bar of height 5 at index 2, the " +
        "previous smaller is index 1 and the next smaller is index 4, so the width is " +
        "<code>4 &minus; 1 &minus; 1 = 2</code> and the area is 10. That is the global maximum.",
      caption: "The largest rectangle is always some bar extended left and right until a strictly " +
        "smaller neighbour. Computing those two neighbours for every bar is one monotonic-stack pass.",
      data: {
        label: "heights",
        array: [2, 1, 5, 6, 2, 3],
        vars: ["bar", "prevSmall", "nextSmall", "area"],
        speed: 1100,
        frames: [
          { note: "Bar 0, height 2. No smaller on the left; next smaller is index 1. Width 1, area 2.",
            active: [0], dim: [1, 2, 3, 4, 5],
            values: { bar: 0, prevSmall: -1, nextSmall: 1, area: 2 } },
          { note: "Bar 1, height 1. No smaller on either side (it is a global min). Width 6, area 6.",
            active: [1], window: [0, 5],
            values: { bar: 1, prevSmall: -1, nextSmall: 6, area: 6 } },
          { note: "Bar 2, height 5. Previous smaller = 1, next smaller = 4. Width 2, area 10.",
            active: [2], window: [2, 3], best: [2, 3], dim: [0, 1, 4, 5],
            values: { bar: 2, prevSmall: 1, nextSmall: 4, area: 10 } },
          { note: "Bar 3, height 6. Previous smaller = 2, next smaller = 4. Width 1, area 6.",
            active: [3], window: [3, 3], dim: [0, 1, 2, 4, 5],
            values: { bar: 3, prevSmall: 2, nextSmall: 4, area: 6 } },
          { note: "Bar 4, height 2. Previous smaller = 1, next smaller = n. Width 4, area 8.",
            active: [4], window: [2, 5], dim: [0, 1],
            values: { bar: 4, prevSmall: 1, nextSmall: 6, area: 8 } },
          { note: "Bar 5, height 3. Previous smaller = 4, next smaller = n. Width 1, area 3.",
            active: [5], dim: [0, 1, 2, 3, 4],
            values: { bar: 5, prevSmall: 4, nextSmall: 6, area: 3 } },
          { note: "Best area 10, from the two bars of heights 5 and 6. The 0-sentinel at i = n is what lets bars 4 and 5 pop without a separate drain loop.",
            best: [2, 3], done: [0, 1, 4, 5],
            values: { bar: "best", prevSmall: 1, nextSmall: 4, area: 10 } },
        ],
      },
    },
    {
      kind: "mermaid", vizId: "stackPick",
      h3: "Which stack is this?",
      caption: "The first split is monotonic vs structural. Inside the monotonic family the " +
        "comparison and the scan direction are the only knobs.",
      src: `flowchart TD
  ask(["a linear-time question about nearest neighbours or nested structure"]) --> kind{"nearest greater/smaller, or nested syntax?"}
  kind -- "nearest neighbour" --> side{"need both sides or one?"}
  side -- one --> nge["monotonic stack, scan toward the unknown side"]
  side -- both --> hist["same stack; widths from prev and next smaller"]
  kind -- "nested syntax" --> syn{"brackets, decode, or operators?"}
  syn -- brackets --> match["stack of unmatched openers"]
  syn -- decode --> nest["stack of previous strings and multipliers"]
  syn -- operators --> calc["values deque plus operators deque"]
  nge --> window{"do candidates also expire by age?"}
  window -- yes --> deque["wrong page: monotonic deque"]
  window -- no --> doneNode["ArrayDeque as a stack of indices"]`,
      wide: true,
    },
  ],

  steps: [
    "<strong>Classify.</strong> Nearest greater/smaller (monotonic) vs nested structure " +
      "(matching / evaluation). Do not mix the templates.",
    "<strong>Choose the comparison.</strong> Decreasing stack for next-greater; increasing stack " +
      "for next-smaller. Decide strict vs non-strict from the statement, not from habit.",
    "<strong>Store indices</strong> in an <code>ArrayDeque&lt;Integer&gt;</code>. Push with " +
      "<code>addLast</code>, pop with <code>pollLast</code>, peek with <code>peekLast</code>.",
    "<strong>Scan once.</strong> For each <code>i</code>, <code>while</code> the top is dominated " +
      "by <code>a[i]</code>, pop it and write its answer. Then push <code>i</code>.",
    "<strong>Sentinel.</strong> For histogram, run <code>i</code> to <code>n</code> with virtual " +
      "height 0 so every remaining bar pops. For NGE, leftover indices get <code>-1</code>.",
    "<strong>Widths and contributions.</strong> " +
      "<code>width = nextSmall &minus; prevSmall &minus; 1</code>. For subarray mins, " +
      "<code>count = (i &minus; prev) * (next &minus; i)</code>, accumulated in <code>long</code>.",
    "<strong>State the amortised bound</strong> before they ask: each index is pushed once and " +
      "popped once, so the nested <code>while</code> is <code>O(n)</code>.",
  ],

  dryRun: {
    intro: "Next greater to the right on <code>[2, 1, 2, 4, 3]</code>. Stack stores indices. " +
      "Highlighted rows are the pops that write an answer.",
    cols: ["i", "a[i]", "stack after", "writes"],
    rows: [
      { cells: ["0", "2", "[0]", "&mdash;"],
        action: "Empty stack, push 0." },
      { cells: ["1", "1", "[0, 1]", "&mdash;"],
        action: "1 is not greater than 2; 0 still waits." },
      { cells: ["2", "2", "[0, 2]", "nge[1] = 2"],
        action: "Pop 1 (1 &lt; 2). Strict: do not pop 0.", change: true },
      { cells: ["3", "4", "[3]", "nge[2] = 4, nge[0] = 4"],
        action: "4 dominates both remaining candidates.", change: true },
      { cells: ["4", "3", "[3, 4]", "&mdash;"],
        action: "3 &lt; 4, so 3 waits." },
      { cells: ["n", "&mdash;", "[]", "nge[3] = nge[4] = -1"],
        action: "Drain: no greater to the right.", change: true },
    ],
    after: "<p>Answer <code>[4, 2, 4, -1, -1]</code>. Six stack operations for five elements: " +
      "the inner loop did not make it quadratic.</p>",
  },

  code: [
    { tab: "Brute NGE", panel: "Brute", file: "NgeBrute.java",
      intro: "Always mention this. It is correct, it makes the spec obvious, and it is what you " +
        "are about to beat. Acceptable only for <code>n &le; 2000</code>.",
      highlight: "8-14",
      code: `import java.util.Arrays;

public class NgeBrute {

    static int[] nextGreater(int[] a) {
        int n = a.length;
        int[] ans = new int[n];
        Arrays.fill(ans, -1);
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (a[j] > a[i]) {
                    ans[i] = a[j];
                    break;
                }
            }
        }
        return ans;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(nextGreater(new int[] {2, 1, 2, 4, 3})));
        System.out.println(Arrays.toString(nextGreater(new int[] {1, 3, 2, 4})));
    }
    // Input : [2, 1, 2, 4, 3]
    //         [1, 3, 2, 4]
    // Output: [4, 2, 4, -1, -1]
    //         [3, 4, 4, -1]
}`,
    },
    { tab: "Optimal stack", panel: "Optimal", file: "MonotonicStack.java",
      intro: "Next-greater, largest histogram rectangle, and trapped rain: three payloads on the " +
        "same decreasing-stack skeleton. Areas use <code>long</code>.",
      highlight: "12-16,36-43",
      code: `import java.util.ArrayDeque;
import java.util.Arrays;

public class MonotonicStack {

    /** Next greater to the right. Decreasing stack of indices. O(n). */
    static int[] nextGreater(int[] a) {
        int n = a.length;
        int[] ans = new int[n];
        Arrays.fill(ans, -1);
        ArrayDeque<Integer> st = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            while (!st.isEmpty() && a[st.peekLast()] < a[i]) {
                ans[st.pollLast()] = a[i];          // popped index just found its NGE
            }
            st.addLast(i);
        }
        return ans;
    }

    /**
     * Largest rectangle in a histogram.
     * Sentinel i == n with height 0 forces every remaining bar to pop.
     */
    static int largestRectangle(int[] h) {
        int n = h.length;
        ArrayDeque<Integer> st = new ArrayDeque<>();
        long best = 0;
        for (int i = 0; i <= n; i++) {
            int cur = (i == n) ? 0 : h[i];
            while (!st.isEmpty() && h[st.peekLast()] > cur) {
                int height = h[st.pollLast()];
                int left = st.isEmpty() ? -1 : st.peekLast();
                best = Math.max(best, (long) height * (i - left - 1));
            }
            st.addLast(i);
        }
        return (int) best;
    }

    /** Trapping rain water via nearest taller bounds. O(n). */
    static int trap(int[] h) {
        ArrayDeque<Integer> st = new ArrayDeque<>();
        long water = 0;
        for (int i = 0; i < h.length; i++) {
            while (!st.isEmpty() && h[i] > h[st.peekLast()]) {
                int mid = st.pollLast();
                if (st.isEmpty()) {
                    break;                          // no left bound
                }
                int left = st.peekLast();
                int width = i - left - 1;
                int bounded = Math.min(h[left], h[i]) - h[mid];
                water += (long) bounded * width;
            }
            st.addLast(i);
        }
        return (int) water;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(nextGreater(new int[] {2, 1, 2, 4, 3})));
        System.out.println(largestRectangle(new int[] {2, 1, 5, 6, 2, 3}));
        System.out.println(trap(new int[] {0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1}));
    }
    // Input : NGE [2,1,2,4,3]; histogram [2,1,5,6,2,3]; rain [0,1,0,2,1,0,1,3,2,1,2,1]
    // Output: [4, 2, 4, -1, -1]
    //         10
    //         6
}`,
    },
    { tab: "Template", panel: "Template", file: "StackTemplates.java",
      intro: "Contribution (sum of subarray mins) and a structural stack (RPN). The first reuses " +
        "the monotonic skeleton; the second is a different family &mdash; keep them both loaded.",
      highlight: "14-22,48-62",
      code: `import java.util.ArrayDeque;
import java.util.Arrays;

public class StackTemplates {

    /**
     * Sum of subarray minimums, mod 1e9+7.
     * Left: previous strictly less. Right: next less-or-equal.
     * The asymmetric comparison makes each subarray have one owner.
     */
    static int sumSubarrayMins(int[] a) {
        int n = a.length;
        int mod = 1_000_000_007;
        int[] prev = new int[n];
        int[] next = new int[n];
        ArrayDeque<Integer> st = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            while (!st.isEmpty() && a[st.peekLast()] > a[i]) {
                st.pollLast();
            }
            prev[i] = st.isEmpty() ? -1 : st.peekLast();
            st.addLast(i);
        }
        st.clear();
        for (int i = n - 1; i >= 0; i--) {
            while (!st.isEmpty() && a[st.peekLast()] >= a[i]) {
                st.pollLast();
            }
            next[i] = st.isEmpty() ? n : st.peekLast();
            st.addLast(i);
        }
        long ans = 0;
        for (int i = 0; i < n; i++) {
            ans += (long) a[i] * (i - prev[i]) * (next[i] - i);
            ans %= mod;
        }
        return (int) ans;
    }

    /** Reverse Polish notation. Values as long to survive intermediate products. */
    static int evalRpn(String[] tokens) {
        ArrayDeque<Long> st = new ArrayDeque<>();
        for (String t : tokens) {
            if (t.length() == 1 && "+-*/".indexOf(t.charAt(0)) >= 0) {
                long b = st.pollLast();
                long a = st.pollLast();
                char op = t.charAt(0);
                long v = switch (op) {
                    case '+' -> a + b;
                    case '-' -> a - b;
                    case '*' -> a * b;
                    default  -> a / b;             // Java truncates toward zero
                };
                st.addLast(v);
            } else {
                st.addLast(Long.parseLong(t));
            }
        }
        return st.peekLast().intValue();
    }

    public static void main(String[] args) {
        System.out.println(sumSubarrayMins(new int[] {3, 1, 2, 4}));
        System.out.println(evalRpn(new String[] {"2", "1", "+", "3", "*"}));
        System.out.println(evalRpn(new String[] {"4", "13", "5", "/", "+"}));
    }
    // Input : mins [3,1,2,4]; RPN (2+1)*3 and 4+(13/5)
    // Output: 17
    //         9
    //         6
}`,
    },
  ],

  complexity: {
    time: "O(n) amortised",
    space: "O(n) for the stack and the answer array",
    derivation: [
      "<p>Every index is pushed at most once and popped at most once. If <code>P</code> is the " +
      "total number of pops across the whole scan:</p>",
      "<span class=\"eq\">T(n) = n pushes + P pops , and P &le; n , so T(n) = &Theta;(n)</span>",
      "<p>The nested <code>while</code> is therefore not a hidden quadratic. Quote this bound " +
      "the moment you write the loop; interviewers ask it on purpose.</p>",
      "<p>Histogram and rain are the same pass with more arithmetic per pop. Sum of subarray " +
      "mins is two passes (left neighbours, right neighbours) plus a linear accumulation, still " +
      "<code>&Theta;(n)</code>. RPN is <code>&Theta;(m)</code> in the number of tokens. The " +
      "only extra space is the deque, which in the worst case holds all <code>n</code> indices " +
      "(a strictly decreasing array for NGE).</p>",
    ],
    compare: [
      ["Nested scan for NGE", "<code>O(n&sup2;)</code>", "<code>O(1)</code>", "n &le; 2000 only"],
      ["Monotonic stack", "<code>O(n)</code>", "<code>O(n)</code>", "Default for nearest-neighbour questions"],
      ["Two-pointer rain water", "<code>O(n)</code>", "<code>O(1)</code>", "Rain only; no NGE payload"],
      ["Precompute left-max / right-max", "<code>O(n)</code>", "<code>O(n)</code>", "Rain; simpler than the stack if that is all you need"],
      ["Segment tree of range max", "<code>O(n log n)</code>", "<code>O(n)</code>", "When the array is updated between queries"],
      ["Structural stack (RPN / calculator)", "<code>O(m)</code>", "<code>O(m)</code>", "Nested syntax, not monotone values"],
    ],
  },

  pitfalls: [
    { title: "Using <code>java.util.Stack</code>",
      bug: "<code>new Stack&lt;Integer&gt;()</code> compiles, is synchronised, and extends " +
        "<code>Vector</code>. It is slower, allows <code>null</code>, and signals outdated Java.",
      fix: "<code>ArrayDeque&lt;Integer&gt;</code> with <code>addLast</code> / " +
        "<code>pollLast</code> / <code>peekLast</code>. Same type as the monotonic deque." },
    { title: "Storing values instead of indices",
      bug: "The stack holds <code>a[i]</code>. You then cannot compute widths, distances, or " +
        "\"has this index left the window\", and equal values become indistinguishable.",
      fix: "Always store indices. Read values through <code>a[st.peekLast()]</code>." },
    { title: "Wrong strictness on equals",
      bug: "Popping on <code>&le;</code> when the problem wants strictly greater, or using the " +
        "same comparison on both sides of a contribution problem so a plateau is double-counted.",
      fix: "NGE is strict <code>&lt;</code>. Contribution: one side strict, the other " +
        "non-strict, so each subarray has a unique owner. Check a plateau by hand." },
    { title: "Forgetting the histogram sentinel",
      bug: "Looping only to <code>n - 1</code> leaves the suffix of non-decreasing bars on the " +
        "stack. Their rectangles are never computed, and the sample that ends with a tall bar still passes.",
      fix: "<code>for (int i = 0; i &le; n; i++)</code> with virtual height 0 at <code>i == n</code>." },
    { title: "<code>int</code> overflow on area and contribution",
      bug: "<code>height * width</code> with both up to <code>10&#8313;</code> overflows " +
        "<code>int</code> before you store it. Sum of subarray mins overflows even faster.",
      fix: "Cast to <code>long</code> before multiplying: " +
        "<code>(long) height * (i - left - 1)</code>. Reduce mod only after the product." },
    { title: "Circular NGE without the <code>ans[j] == -1</code> guard",
      bug: "Scanning <code>2n</code> and writing on every pop overwrites a real next-greater " +
        "with a wrapped one that is further away, or writes a self-reference.",
      fix: "Only write if <code>ans[j]</code> is still <code>-1</code>, iterate " +
        "<code>i</code> in <code>[0, 2n)</code>, and never push index <code>&ge; n</code>." },
  ],

  variants: [
    ["Circular next greater (LC 503)",
      "Imagine the array concatenated. Scan <code>2n</code> indices; only assign the first time.",
      "for (int i = 0; i < 2*n; i++) { int v = a[i % n]; ... if (ans[j] == -1) ans[j] = v; }",
      "LC 503"],
    ["Next greater of a subset (LC 496)",
      "NGE on the bigger array, then look up the query values in a map.",
      "Map the NGE array, then for each query x answer map.getOrDefault(x, -1).",
      "LC 496"],
    ["Maximal rectangle of 1s (LC 85)",
      "For each row, treat consecutive 1s above as histogram heights, then run largest-rectangle.",
      "height[c] = (row[c]==1) ? height[c]+1 : 0;  best = max(best, largestRectangle(height));",
      "LC 85"],
    ["Online stock span",
      "Next-greater to the <em>left</em> on a stream: pop while top price is &le; today's, span " +
      "is <code>i &minus; newTop</code>.",
      "while (!st.isEmpty() && st.peekLast()[0] <= price) st.pollLast();",
      "LC 901"],
    ["Basic calculator with parentheses",
      "Structural: a stack of (sign, accumulator) at each '('. Not monotone.",
      "on '(': st.addLast(new long[] {sign, acc}); acc = 0; sign = 1;",
      "LC 224"],
  ],

  followups: [
    ["Why is the nested while O(n) and not O(n&sup2;)?",
      "<p>Amortisation, not a per-iteration bound. An index that has been popped is never " +
      "pushed again, so across the whole scan the inner loop runs at most <code>n</code> times " +
      "in total. Worst-case single iteration is <code>O(n)</code> (a new maximum that drains the " +
      "stack), but that expensive step is paid for by the cheap steps that built the stack. " +
      "State it as \"each index is pushed once and popped once\".</p>"],
    ["Histogram vs trapping rain: same stack, different payload. What is the difference?",
      "<p>Histogram asks for the largest rectangle that uses some bar as its shortest side, so " +
      "on a pop you compute <code>height[mid] * (right - left - 1)</code> and take a max. Rain " +
      "asks for water bounded by the two remaining walls, so on a pop you compute " +
      "<code>(min(h[left], h[right]) - h[mid]) * (right - left - 1)</code> and add. Same pops, " +
      "same neighbours, different arithmetic. Two-pointer rain is simpler if they only want rain; " +
      "the stack is the one to reach for if they then ask for histogram in the follow-up.</p>"],
    ["How do you avoid double-counting equal minima in sum-of-subarray-mins?",
      "<p>Assign every subarray to exactly one occurrence of its minimum, typically the leftmost. " +
      "Compute previous <em>strictly</em> less on the left and next less-<em>or-equal</em> on the " +
      "right. Then a run of equal values: the leftmost owns the whole run's subarrays, and the " +
      "others own nothing that would overlap. Swap the strictness and you assign to the rightmost " +
      "instead; both are correct as long as they are opposite.</p>"],
    ["Can you do trapping rain in O(1) extra space?",
      "<p>Yes: two pointers at the ends plus a running <code>leftMax</code> and " +
      "<code>rightMax</code>. The pointer on the side with the smaller max can be resolved, " +
      "because the other side is a guaranteed bound. It is the same domination argument as the " +
      "stack, specialised to this problem. Mention it; then note that it does not generalise to " +
      "histogram or NGE, so the stack is the more transferable tool.</p>"],
    ["What changes for next greater in a circular array?",
      "<p>Scan twice the length, index with <code>i % n</code>, and write only if the answer is " +
      "still unset. Do not push indices <code>&ge; n</code> &mdash; they are aliases of " +
      "<code>0..n-1</code> already on the stack. A strictly decreasing array is the worst case " +
      "and a good test: every answer wraps to <code>a[0]</code> except <code>a[0]</code> itself, " +
      "which stays <code>-1</code>.</p>"],
  ],

  problemsIntro: "Do LC 496 / 503 for the NGE primitive, then LC 84 and LC 42 back to back, then " +
    "LC 907. That cluster is the whole page. The rest is payload changes.",

  problems: [
    { url: "https://leetcode.com/problems/next-greater-element-i/", name: "Next Greater Element I",
      badge: "lc", tag: "LC 496", level: "Easy", pattern: "NGE on nums2, then map-lookup for nums1" },
    { url: "https://leetcode.com/problems/next-greater-element-ii/", name: "Next Greater Element II",
      badge: "lc", tag: "LC 503", level: "Medium", pattern: "Circular NGE; scan 2n, write once" },
    { url: "https://leetcode.com/problems/daily-temperatures/", name: "Daily Temperatures",
      badge: "lc", tag: "LC 739", level: "Medium", pattern: "NGE with distance i - j as the payload" },
    { url: "https://leetcode.com/problems/online-stock-span/", name: "Online Stock Span",
      badge: "lc", tag: "LC 901", level: "Medium", pattern: "Previous-greater on a stream" },
    { url: "https://leetcode.com/problems/largest-rectangle-in-histogram/", name: "Largest Rectangle in Histogram",
      badge: "lc", tag: "LC 84", level: "Hard", pattern: "Prev-smaller and next-smaller; 0-sentinel" },
    { url: "https://leetcode.com/problems/trapping-rain-water/", name: "Trapping Rain Water",
      badge: "lc", tag: "LC 42", level: "Hard", pattern: "Stack of bars, or two-pointer with running max" },
    { url: "https://leetcode.com/problems/sum-of-subarray-minimums/", name: "Sum of Subarray Minimums",
      badge: "lc", tag: "LC 907", level: "Medium", pattern: "Contribution: (i-prev)*(next-i)*a[i]" },
    { url: "https://leetcode.com/problems/maximal-rectangle/", name: "Maximal Rectangle",
      badge: "lc", tag: "LC 85", level: "Hard", pattern: "Each row as a histogram, then LC 84" },
    { url: "https://leetcode.com/problems/evaluate-reverse-polish-notation/", name: "Evaluate Reverse Polish Notation",
      badge: "lc", tag: "LC 150", level: "Medium", pattern: "Structural stack of long values" },
    { url: "https://leetcode.com/problems/basic-calculator/", name: "Basic Calculator",
      badge: "lc", tag: "LC 224", level: "Hard", pattern: "Sign + accumulator stack at each '('" },
    { url: "https://leetcode.com/problems/number-of-visible-people-in-a-queue/", name: "Number of Visible People in a Queue",
      badge: "lc", tag: "LC 1944", level: "Hard", pattern: "Decreasing stack; count pops plus one more if not empty" },
    { url: "https://cses.fi/problemset/task/1645", name: "Nearest Smaller Values",
      badge: "cf", tag: "CSES", level: "Easy", pattern: "Previous-smaller; the NGE primitive flipped" },
  ],

  spoilers: [
    { summary: "Hint for LC 84 &mdash; why the 0-sentinel is mandatory",
      body: "<p>Every popped bar computes a rectangle that uses that bar as the shortest side, " +
        "stretching from the new top (previous smaller) to the current index (next smaller). Bars " +
        "that never meet a smaller value to their right stay on the stack until the array ends. " +
        "Without a virtual height-0 at index <code>n</code>, those bars never pop, so every " +
        "suffix-minimum rectangle is missing. The sample <code>[2,1,5,6,2,3]</code> still gets " +
        "the answer 10 from the 5-and-6 pair, which is why a missing sentinel can hide. Always " +
        "test a strictly increasing histogram: the answer is <code>n * min</code> of the last " +
        "bar's stretch, and only the sentinel produces it.</p>" },
    { summary: "Hint for LC 907 &mdash; the plateau rule",
      body: "<p>On <code>[3,1,2,1]</code> the two 1s must not both claim the subarray that " +
        "covers both of them. Previous-strictly-less plus next-less-or-equal gives the left 1 " +
        "ownership of every subarray that has that 1 as its leftmost minimum, and the right 1 " +
        "only owns subarrays that start after the left 1. Swap the strictness to assign to the " +
        "rightmost instead. Using <code>&lt;</code> on both sides undercounts; using " +
        "<code>&le;</code> on both overcounts. Transferable lesson: <em>when several equal " +
        "values could own the same subarray, make the two comparisons opposite so ownership is a " +
        "partition, not a cover.</em></p>" },
  ],

  recap: {
    bullets: [
      "<strong>Store indices</strong> in an <code>ArrayDeque</code>, never values and never " +
        "<code>java.util.Stack</code>.",
      "<strong>Decreasing stack</strong> for next-greater; <strong>increasing</strong> for " +
        "next-smaller. Strictness is part of the spec.",
      "<strong>Amortised <code>O(n)</code>:</strong> each index is pushed once and popped once.",
      "<strong>Histogram / rain / contribution</strong> are the same neighbours with a different " +
        "payload. Sentinel height 0 at <code>i = n</code> for histogram.",
      "<strong>Structural stacks</strong> (RPN, calculator, brackets) are a different family. " +
        "Use <code>long</code> for values and products.",
    ],
    oneliner: "while (!st.isEmpty() && a[st.peekLast()] < a[i]) ans[st.pollLast()] = a[i]; st.addLast(i);",
  },
},

/* ================================ 2. queues-and-monotonic-deque ======== */
{
  id: "queues-and-monotonic-deque",
  difficulty: "Medium",
  readTime: "26 min",
  tagline: "A deque that is a stack at the back and a queue at the front: candidates die either " +
    "by being dominated or by falling out of the window, and the front is always the answer.",
  tags: ["deque", "monotonic deque", "sliding window", "prefix sums", "P0"],
  prereqs: [
    ["Stacks & Monotonic Stack", "stacks-and-monotonic-stack.html"],
    ["Sliding Window", "../01-arrays-and-windows/sliding-window.html"],
    ["Prefix Sums", "../01-arrays-and-windows/prefix-sums.html"],
  ],

  why: {
    paras: [
      "Sliding-window maximum is the problem that makes people reach for a heap and then lose " +
      "the interview. A heap of size <code>k</code> gives <code>O(n log k)</code> and needs " +
      "lazy deletion to drop expired indices. A monotonic deque of indices, decreasing in " +
      "value, gives the same answer in <code>O(n)</code>: the front is the current maximum, " +
      "the back is where new arrivals evict dominated (smaller-or-equal and older) candidates, " +
      "and the front is popped when its index leaves the window. Each index is pushed and " +
      "popped at most once.",
      "The same deque, pointed at prefix sums instead of raw values, solves the question that " +
      "breaks a sliding window: shortest subarray with sum at least <code>k</code> when values " +
      "may be negative. Validity is no longer monotone in window size, so the two-pointer " +
      "repair is unsound. Prefix sums restore a monotone structure &mdash; you want the " +
      "smallest <code>r - l</code> with <code>P[r] - P[l] &ge; k</code> &mdash; and a deque of " +
      "increasing prefixes lets you pop hopeless left ends from the front and dominated left " +
      "ends from the back.",
      "If you already know the monotonic stack, the only new operation is <em>expiry at the " +
      "front</em>. A stack cannot do that cheaply. That is the entire distinction, and it is " +
      "the recognition test: does a candidate die only by being beaten, or also by getting " +
      "too old? Beaten-only is a stack; beaten-or-old is a deque.",
    ],
    insight: "The deque stores indices in an order that is monotone in value. New arrivals " +
      "evict from the back (domination). Window expiry evicts from the front (age). The " +
      "front is the best living candidate, in <code>O(1)</code>.",
  },

  recognise: {
    yes: [
      "\"Maximum (or minimum) in every window of size <code>k</code>\"",
      "\"Shortest subarray with sum &ge; <code>k</code>\" when values can be negative or zero",
      "A sliding window plus an extreme (max/min/first-to-exceed) that a count array cannot track",
      "Constrained-subsequence / jump-game variants: best previous in a sliding range of indices",
      "You already have a monotonic stack but candidates also leave because of a moving left bound",
    ],
    no: [
      "The window only needs a sum, a distinct-count, or a \"contains all of T\" flag &rarr; " +
        "plain <a href=\"../01-arrays-and-windows/sliding-window.html\">sliding window</a>, no deque",
      "Nearest greater with no window expiry &rarr; " +
        "<a href=\"stacks-and-monotonic-stack.html\">monotonic stack</a>",
      "\"k-th largest in each window\" for <code>k</code> not 1 &rarr; two heaps or a policy " +
        "tree; a deque only tracks the extreme",
      "All values are positive and you want shortest sum &ge; k &rarr; the two-pointer window " +
        "is enough; the deque is correct but heavier",
    ],
    table: [
      ["\"max of every window of size k\"", "Extreme plus age-expiry", "Decreasing deque of indices"],
      ["\"min of every window of size k\"", "Same, flipped comparison", "Increasing deque of indices"],
      ["\"shortest subarray, sum &ge; k\", negatives allowed",
        "P[r] - P[l] &ge; k, smallest r-l", "Increasing deque over prefix sums"],
      ["\"longest subarray, max - min &le; limit\"", "Two extremes in one window",
        "Two deques, or a TreeMap (next page)"],
      ["\"jump game with max score, jump at most k\"", "Best previous in [i-k, i)",
        "Decreasing deque of dp values"],
      ["\"sliding window median\"", "Need the middle, not the extreme",
        "Two heaps, not a deque"],
      ["<strong>Confused with:</strong> monotonic stack NGE",
        "No left bound moving; candidates die only by domination",
        "Stack (deque's front-pop is unused)"],
    ],
    constraint: "<code>n &le; 10&#8309;</code> with window size <code>k</code> and a max/min " +
      "query is the deque signature. Prefix-sum versions need <code>long[]</code>: " +
      "<code>n = 10&#8309;</code> values of <code>10&#8313;</code> reach " +
      "<code>10&sup1;&#8308;</code>.",
  },

  core: {
    heading: "Core idea and the invariant",
    paras: [
      "For window maximum: the deque holds indices in <em>decreasing</em> order of " +
      "<code>a[·]</code>. When <code>r</code> arrives, pop the back while " +
      "<code>a[back] &le; a[r]</code> &mdash; those values can never be the max of any future " +
      "window that contains <code>r</code>, because <code>r</code> is larger (or equal) and " +
      "younger. Then pop the front if <code>front &le; r - k</code>. The front is the max of " +
      "<code>[r-k+1, r]</code>. Equal values: pop on <code>&le;</code> so the younger index " +
      "wins; keeping equals only wastes space.",
      "For shortest subarray with sum &ge; k: build prefix sums <code>P[0] = 0</code>, " +
      "<code>P[i] = a[0]+&hellip;+a[i-1]</code>. You want min <code>r - l</code> with " +
      "<code>P[r] - P[l] &ge; k</code>. Keep a deque of indices with <em>increasing</em> " +
      "<code>P</code>. Pop the front while the difference is at least k (that left end is " +
      "used up: a later <code>r</code> would only make a longer subarray). Pop the back " +
      "while <code>P[r] &le; P[back]</code> (a later, smaller-or-equal prefix dominates an " +
      "earlier larger one as a left end).",
      "Both are the same two-ended structure. Back = domination. Front = \"this candidate is " +
      "done\". The invariant below is what you recite when they ask why the front is safe to " +
      "trust without scanning the window.",
    ],
    invariantTitle: "The invariant",
    invariant: "<p>The deque stores indices <code>d&#8320;, d&#8321;, &hellip;</code> such " +
      "that:</p>" +
      "<span class=\"eq\">values are monotone (decreasing for window-max, increasing prefixes " +
      "for shortest-sum), and every index is still inside the relevant range</span>" +
      "<p>The front is therefore the best living candidate. Anything not on the deque is " +
      "either expired or dominated by something that is. Each index enters and leaves at most " +
      "once, so the scan is <code>O(n)</code>.</p>",
    extra: [
      { kind: "tip", title: "Deque API, written once",
        html: "<p><code>ArrayDeque&lt;Integer&gt;</code>: <code>addLast</code> / " +
          "<code>pollLast</code> / <code>peekLast</code> at the back (the stack end), " +
          "<code>pollFirst</code> / <code>peekFirst</code> at the front (the queue end). " +
          "Never <code>get(i)</code> &mdash; that is linear. Never " +
          "<code>LinkedList</code> as a deque in a hot loop; it is a node allocation per " +
          "element.</p>" },
      { kind: "math", title: "Why a smaller later prefix dominates",
        html: "<p>For shortest-sum, if <code>i &lt; j</code> and <code>P[j] &le; P[i]</code>, " +
          "then for every future right end <code>r</code>, <code>P[r] - P[j] &ge; P[r] - P[i]</code>, " +
          "and <code>r - j &lt; r - i</code>. So <code>j</code> is a better left end than " +
          "<code>i</code> on both the sum test and the length. Index <code>i</code> can be " +
          "deleted forever. That is the back-pop.</p>" },
      { kind: "warn", title: "Positive arrays do not need this",
        html: "<p>If every <code>a[i] &ge; 0</code>, shortest subarray with sum &ge; k is a " +
          "plain two-pointer window: extending increases the sum, shrinking decreases it. " +
          "Reach for the deque only after you have checked the sign constraint. Interviewers " +
          "plant a single negative to punish the window.</p>" },
    ],
  },

  visuals: [
    {
      kind: "array", vizId: "winMax",
      h3: "Sliding window maximum, k = 3",
      intro: "Array <code>[1, 3, -1, -3, 5, 3, 6, 7]</code>. The deque holds indices of a " +
        "decreasing envelope. The front of the deque is the window max once the window is full.",
      caption: "Answer [3, 3, 5, 5, 6, 7]. Each index is pushed once and popped at most once, " +
        "from the back (dominated) or the front (expired).",
      data: {
        label: "a",
        array: [1, 3, -1, -3, 5, 3, 6, 7],
        vars: ["r", "dq (vals)", "window max"],
        speed: 950,
        frames: [
          { note: "r = 0, value 1. Deque empty, push 0. Window not yet size 3.",
            active: [0], dim: [1, 2, 3, 4, 5, 6, 7], pointers: { r: 0 },
            values: { r: 0, "dq (vals)": "[1]", "window max": "\u2014" } },
          { note: "r = 1, value 3. 3 >= 1, pop back 0. Push 1. Deque values [3].",
            active: [1], x: [0], dim: [2, 3, 4, 5, 6, 7], pointers: { r: 1 },
            values: { r: 1, "dq (vals)": "[3]", "window max": "\u2014" } },
          { note: "r = 2, value -1. -1 < 3, push 2. Window [0,2] is full. Front is 3.",
            active: [2], window: [0, 2], dim: [3, 4, 5, 6, 7], pointers: { r: 2 },
            values: { r: 2, "dq (vals)": "[3, -1]", "window max": 3 } },
          { note: "r = 3, value -3. Push 3. Index 0 has left the window but was already popped. Front still 3.",
            active: [3], window: [1, 3], dim: [0, 4, 5, 6, 7], pointers: { r: 3 },
            values: { r: 3, "dq (vals)": "[3, -1, -3]", "window max": 3 } },
          { note: "r = 4, value 5. 5 dominates -3, -1, and 3: pop all three from the back. Push 4. Front is 5.",
            active: [4], window: [2, 4], x: [1, 2, 3], dim: [0, 5, 6, 7], pointers: { r: 4 },
            values: { r: 4, "dq (vals)": "[5]", "window max": 5 } },
          { note: "r = 5, value 3. 3 < 5, push 5. Front stays 5.",
            active: [5], window: [3, 5], dim: [0, 1, 2, 6, 7], pointers: { r: 5 },
            values: { r: 5, "dq (vals)": "[5, 3]", "window max": 5 } },
          { note: "r = 6, value 6. 6 dominates 3 and 5. Pop both, push 6. Front is 6.",
            active: [6], window: [4, 6], x: [4, 5], dim: [0, 1, 2, 3, 7], pointers: { r: 6 },
            values: { r: 6, "dq (vals)": "[6]", "window max": 6 } },
          { note: "r = 7, value 7. 7 dominates 6. Pop, push 7. Front is 7. Answer [3, 3, 5, 5, 6, 7].",
            active: [7], window: [5, 7], best: [7], dim: [0, 1, 2, 3, 4], pointers: { r: 7 },
            values: { r: 7, "dq (vals)": "[7]", "window max": 7 } },
        ],
      },
    },
    {
      kind: "array", vizId: "shortSum",
      h3: "Shortest subarray with sum at least 3",
      intro: "Array <code>[2, -1, 2]</code>, <code>k = 3</code>. Prefix array " +
        "<code>P = [0, 2, 1, 3]</code>. The deque keeps increasing prefixes; the first time " +
        "<code>P[r] - P[front] &ge; 3</code> we record <code>r - front</code> and pop that front " +
        "for good.",
      caption: "The whole array sums to 3, length 3. No shorter subarray works (the negatives " +
        "break two-pointer). Answer 3.",
      data: {
        label: "P (prefix sums, P[0] = 0)",
        array: [0, 2, 1, 3],
        indexLabels: ["P0", "P1", "P2", "P3"],
        vars: ["r", "P[r]", "dq", "best"],
        speed: 1100,
        frames: [
          { note: "P built: 0, 2, 1, 3. Deque empty. best = n+1 = 4 (\"none yet\").",
            dim: [0, 1, 2, 3],
            values: { r: "\u2014", "P[r]": "\u2014", dq: "[]", best: 4 } },
          { note: "r = 0, P = 0. Push 0. Difference checks: none.",
            active: [0], dim: [1, 2, 3], pointers: { r: 0 },
            values: { r: 0, "P[r]": 0, dq: "[0]", best: 4 } },
          { note: "r = 1, P = 2. 2 - 0 = 2 < 3, so do not pop front. 2 > 0, so do not pop back. Push 1.",
            active: [1], done: [0], dim: [2, 3], pointers: { r: 1 },
            values: { r: 1, "P[r]": 2, dq: "[0, 1]", best: 4 } },
          { note: "r = 2, P = 1. 1 - 0 = 1 < 3. Back-pop: 1 <= P[1] = 2, so index 1 is dominated. Push 2. Deque [0, 2].",
            active: [2], x: [1], done: [0], dim: [3], pointers: { r: 2 },
            values: { r: 2, "P[r]": 1, dq: "[0, 2]", best: 4 } },
          { note: "r = 3, P = 3. 3 - 0 = 3 >= k. Record length 3, pop front 0. This front can never give a shorter answer later.",
            active: [3], best: [0, 3], window: [0, 3], pointers: { r: 3 },
            values: { r: 3, "P[r]": 3, dq: "[2]", best: 3 } },
          { note: "Still at r = 3: 3 - P[2] = 3 - 1 = 2 < 3. Push 3. Scan done. best = 3, which is <= n, so answer 3.",
            active: [3], done: [0, 1, 2], pointers: { r: 3 },
            values: { r: 3, "P[r]": 3, dq: "[2, 3]", best: 3 } },
          { note: "If best had stayed n+1 we would return -1. Here a valid subarray exists: the whole array.",
            best: [0, 1, 2, 3],
            values: { r: "done", "P[r]": "\u2014", dq: "[]", best: 3 } },
        ],
      },
    },
    {
      kind: "mermaid", vizId: "dequePick",
      h3: "Stack, window, or deque?",
      caption: "The extra question on top of a monotonic stack is whether candidates expire by " +
        "age. The extra question on top of a sliding window is whether you need an extreme, not " +
        "a sum or a count.",
      src: `flowchart TD
  q(["linear scan with a live set of candidates"]) --> expire{"do candidates expire by a moving left bound?"}
  expire -- no --> stackPage["monotonic stack of indices"]
  expire -- yes --> what{"what do you need from the live set?"}
  what -- "sum / count / distinct" --> windowPage["plain sliding window"]
  what -- "max or min" --> dqMax["decreasing or increasing deque"]
  what -- "shortest sum at least k" --> signs{"any negative values?"}
  signs -- no --> windowTwo["two-pointer window on the raw array"]
  signs -- yes --> dqPfx["increasing deque on prefix sums"]
  what -- "median or k-th" --> heapPage["two heaps, not a deque"]`,
      wide: true,
    },
  ],

  steps: [
    "<strong>Confirm you need an extreme or a prefix-sum threshold</strong>, not a running " +
      "sum or a distinct-count.",
    "<strong>Pick the orientation.</strong> Decreasing deque for window-max; increasing for " +
      "window-min; increasing prefixes for shortest-sum &ge; k.",
    "<strong>Store indices</strong> in an <code>ArrayDeque&lt;Integer&gt;</code>.",
    "<strong>On each right end <code>r</code>:</strong> pop the back while the new value " +
      "dominates, then pop the front while it is expired (or while the prefix difference meets " +
      "<code>k</code>), then push <code>r</code>.",
    "<strong>Read the answer from the front</strong> once the window is full, or record " +
      "<code>r - front</code> when the prefix test succeeds.",
    "<strong>Use <code>long[]</code> for prefix sums.</strong> Initialise <code>best = n + 1</code> " +
      "and return <code>-1</code> if it never improved.",
    "<strong>State amortised <code>O(n)</code></strong>: each index is pushed once and popped " +
      "once, from one end or the other.",
  ],

  dryRun: {
    intro: "Window maximum on <code>[1, 3, -1, -3, 5, 3, 6, 7]</code>, <code>k = 3</code>. " +
      "Deque shown as values for readability; the code stores indices.",
    cols: ["r", "a[r]", "deque values", "max"],
    rows: [
      { cells: ["0", "1", "[1]", "&mdash;"],
        action: "Push 0. Window not full." },
      { cells: ["1", "3", "[3]", "&mdash;"],
        action: "3 dominates 1; pop back, push 1." },
      { cells: ["2", "-1", "[3, -1]", "3"],
        action: "Window full. Front is the max.", change: true },
      { cells: ["3", "-3", "[3, -1, -3]", "3"],
        action: "Index 0 already gone. Front still 3." },
      { cells: ["4", "5", "[5]", "5"],
        action: "5 dominates everything; deque resets.", change: true },
      { cells: ["5", "3", "[5, 3]", "5"],
        action: "3 < 5, keep both." },
      { cells: ["6", "6", "[6]", "6"],
        action: "6 dominates 3 and 5.", change: true },
      { cells: ["7", "7", "[7]", "7"],
        action: "7 dominates 6. Answer [3, 3, 5, 5, 6, 7].", change: true },
    ],
    after: "<p>Eight right ends, eight pushes, seven pops. Linear.</p>",
  },

  code: [
    { tab: "Brute window max", panel: "Brute", file: "WindowMaxBrute.java",
      intro: "Rescan each window. Correct, and the thing they will ask you to beat. Fine for " +
        "<code>n &middot; k &le; 10&#8312;</code> only.",
      code: `import java.util.Arrays;

public class WindowMaxBrute {

    static int[] maxSlidingWindow(int[] a, int k) {
        int n = a.length;
        int[] ans = new int[n - k + 1];
        for (int i = 0; i <= n - k; i++) {
            int m = a[i];
            for (int j = i + 1; j < i + k; j++) {
                m = Math.max(m, a[j]);
            }
            ans[i] = m;
        }
        return ans;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(
            maxSlidingWindow(new int[] {1, 3, -1, -3, 5, 3, 6, 7}, 3)));
    }
    // Input : [1, 3, -1, -3, 5, 3, 6, 7], k = 3
    // Output: [3, 3, 5, 5, 6, 7]
}`,
    },
    { tab: "Optimal deque", panel: "Optimal", file: "MonotonicDeque.java",
      intro: "Window maximum in linear time. Pop back while dominated, pop front when expired, " +
        "read the front.",
      highlight: "12-22",
      code: `import java.util.ArrayDeque;
import java.util.Arrays;

public class MonotonicDeque {

    static int[] maxSlidingWindow(int[] a, int k) {
        int n = a.length;
        int[] ans = new int[n - k + 1];
        ArrayDeque<Integer> dq = new ArrayDeque<>();   // indices, decreasing a[·]
        for (int r = 0; r < n; r++) {
            while (!dq.isEmpty() && a[dq.peekLast()] <= a[r]) {
                dq.pollLast();                         // dominated: older and not larger
            }
            dq.addLast(r);
            if (dq.peekFirst() <= r - k) {
                dq.pollFirst();                        // expired: left the window
            }
            if (r >= k - 1) {
                ans[r - k + 1] = a[dq.peekFirst()];
            }
        }
        return ans;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(
            maxSlidingWindow(new int[] {1, 3, -1, -3, 5, 3, 6, 7}, 3)));
        System.out.println(Arrays.toString(
            maxSlidingWindow(new int[] {1}, 1)));
    }
    // Input : [1, 3, -1, -3, 5, 3, 6, 7], k = 3
    //         [1], k = 1
    // Output: [3, 3, 5, 5, 6, 7]
    //         [1]
}`,
    },
    { tab: "Template", panel: "Template", file: "ShortestSubarray.java",
      intro: "The prefix-sum deque. This is the answer when a sliding window is illegal because " +
        "of negatives. <code>long</code> prefixes, <code>best = n + 1</code> as the \"none\" " +
        "sentinel.",
      highlight: "14-27",
      code: `import java.util.ArrayDeque;

public class ShortestSubarray {

    /** Shortest subarray with sum at least k. Negatives allowed. O(n). */
    static int shortestSubarray(int[] a, int k) {
        int n = a.length;
        long[] p = new long[n + 1];
        for (int i = 0; i < n; i++) {
            p[i + 1] = p[i] + a[i];
        }
        int best = n + 1;
        ArrayDeque<Integer> dq = new ArrayDeque<>();   // increasing p[·]
        for (int r = 0; r <= n; r++) {
            while (!dq.isEmpty() && p[r] - p[dq.peekFirst()] >= k) {
                best = Math.min(best, r - dq.pollFirst());
            }
            while (!dq.isEmpty() && p[r] <= p[dq.peekLast()]) {
                dq.pollLast();                         // later, smaller-or-equal prefix wins
            }
            dq.addLast(r);
        }
        return best <= n ? best : -1;
    }

    public static void main(String[] args) {
        System.out.println(shortestSubarray(new int[] {2, -1, 2}, 3));
        System.out.println(shortestSubarray(new int[] {1, 2}, 4));
        System.out.println(shortestSubarray(new int[] {1}, 1));
    }
    // Input : [2, -1, 2], k = 3
    //         [1, 2], k = 4
    //         [1], k = 1
    // Output: 3
    //         -1
    //         1
}`,
    },
  ],

  complexity: {
    time: "O(n)",
    space: "O(n) for the deque (O(k) for a fixed window of size k)",
    derivation: [
      "<p>Every index is pushed once. It leaves at most once, either from the back (dominated) " +
      "or from the front (expired / already used as a left end):</p>",
      "<span class=\"eq\">T(n) = n arrivals &times; O(1) amortised = &Theta;(n)</span>",
      "<p>A heap of the live window is the tempting alternative: " +
      "<code>O(n log k)</code> with lazy deletion, extra constants, and a worse bound. Quote " +
      "the deque first.</p>",
      "<p>The prefix-sum version allocates a <code>long[n+1]</code> and a deque of up to " +
      "<code>n+1</code> indices. Still linear. The <code>int</code> overflow on prefixes is " +
      "the only practical failure mode.</p>",
    ],
    compare: [
      ["Rescan each window", "<code>O(n k)</code>", "<code>O(1)</code>", "k tiny, or n small"],
      ["Heap of the window (lazy delete)", "<code>O(n log k)</code>", "<code>O(k)</code>", "When you need k-th, not max"],
      ["Monotonic deque", "<code>O(n)</code>", "<code>O(k)</code>", "Window max / min; the default"],
      ["Two-pointer window on positives", "<code>O(n)</code>", "<code>O(1)</code>", "Shortest sum &ge; k, all a[i] &ge; 0"],
      ["Prefix + monotonic deque", "<code>O(n)</code>", "<code>O(n)</code>", "Shortest sum &ge; k with negatives"],
      ["Prefix + TreeMap of prefixes", "<code>O(n log n)</code>", "<code>O(n)</code>", "Correct but slower; use only if you also need order statistics"],
    ],
  },

  pitfalls: [
    { title: "A two-pointer window on an array with negatives",
      bug: "\"Shortest subarray with sum &ge; k\" implemented as shrink-while-valid. One " +
        "negative makes shrinking <em>increase</em> the sum, so the repair is wrong.",
      fix: "Check signs first. With negatives, prefix sums plus an increasing deque. With " +
        "all non-negative, the two-pointer window is enough." },
    { title: "Storing values in the deque",
      bug: "You cannot test expiry (<code>index &le; r - k</code>) or compute " +
        "<code>r - l</code> from values alone. Equal values also collide.",
      fix: "Store indices. Read <code>a[dq.peekFirst()]</code> / <code>p[dq.peekFirst()]</code>." },
    { title: "Popping the front too late, or not at all",
      bug: "Writing the answer before removing an index that has left the window. The reported " +
        "max is an element that is no longer inside.",
      fix: "Expiry pop, then read. For window max: <code>if (peekFirst() &le; r - k) pollFirst()</code> " +
        "before recording." },
    { title: "<code>int</code> prefix sums",
      bug: "<code>int[] p</code> overflows silently; the comparison <code>p[r] - p[l] &ge; k</code> " +
        "wraps and you return -1 on a case that has an answer.",
      fix: "<code>long[] p</code>, always. Cast <code>a[i]</code> by adding into a long." },
    { title: "Keeping equal values on the back",
      bug: "Popping only on <code>&lt;</code> leaves a plateau of equal maxima. Correct but " +
        "the deque grows to <code>O(n)</code> on a constant array, and the older equal is a " +
        "worse candidate anyway.",
      fix: "Pop on <code>&le;</code> for window max. The younger index of an equal value " +
        "expires later, so it strictly dominates." },
    { title: "Returning 0 instead of -1 when no subarray works",
      bug: "Initialising <code>best = Integer.MAX_VALUE</code> and returning it, or returning " +
        "0, when no prefix difference ever reached k.",
      fix: "<code>int best = n + 1;</code> then <code>return best &le; n ? best : -1;</code>. " +
        "A valid length is at most n, so <code>n + 1</code> is a clean sentinel." },
  ],

  variants: [
    ["Window minimum",
      "Flip the comparison: increasing deque, pop back while <code>a[back] &ge; a[r]</code>.",
      "while (!dq.isEmpty() && a[dq.peekLast()] >= a[r]) dq.pollLast();",
      "Symmetric to LC 239"],
    ["Longest window with max - min &le; limit (LC 1438)",
      "Two deques in one scan, or a TreeMap of the window. Shrink the left until " +
      "<code>max - min &le; limit</code>.",
      "while (a[maxDq.peekFirst()] - a[minDq.peekFirst()] > limit) { /* expire l++ */ }",
      "LC 1438"],
    ["DP with a sliding range of previous states",
      "Jump-game / constrained-subsequence: deque of dp indices, decreasing dp value, expire " +
      "<code>i - k</code>.",
      "dp[i] = a[i] + max(0, dq.isEmpty() ? 0 : dp[dq.peekFirst()]);",
      "LC 1696, LC 1425"],
    ["Fixed window, but you want the median",
      "A deque cannot do this. Two heaps (or a TreeMap of frequencies) over the window.",
      "See heaps page: two-heap median plus lazy deletion of expired indices.",
      "LC 480"],
  ],

  followups: [
    ["Why not a heap for sliding-window maximum?",
      "<p>A max-heap of the live indices is correct at <code>O(n log k)</code> with lazy " +
      "deletion (you cannot delete an arbitrary index from <code>PriorityQueue</code> in " +
      "log time, so you skip expired tops). The deque is <code>O(n)</code> and simpler. " +
      "Reach for the heap only when they want the k-th, not the max. Saying this distinction " +
      "out loud is the SDE-2 answer.</p>"],
    ["Prove that popping the front after a successful prefix test is safe.",
      "<p>Once <code>P[r] - P[l] &ge; k</code>, any later right end <code>r' &gt; r</code> " +
      "paired with the same <code>l</code> is a strictly longer subarray. If a later " +
      "<code>r'</code> still needs a left end, a larger <code>l'</code> (still in the deque) " +
      "is the only candidate that could be shorter. So <code>l</code> will never be the " +
      "left end of a better answer, and can be discarded.</p>"],
    ["How do you maintain both max and min of a window in O(1)?",
      "<p>Two deques, one decreasing (max) and one increasing (min), sharing the same " +
      "<code>l, r</code>. Each index is in both. LC 1438 (longest window with " +
      "<code>max - min &le; limit</code>) is the standard application: grow r, then shrink " +
      "l while <code>max - min &gt; limit</code>. A " +
      "<a href=\"treemap-treeset-patterns.html\">TreeMap</a> of frequencies also works at " +
      "<code>O(n log n)</code> and is easier to write under pressure if you have not drilled " +
      "the two-deque version.</p>"],
    ["What is the deque's worst-case occupancy?",
      "<p>For window max on a strictly decreasing array, nothing is ever dominated, so the " +
      "deque holds the whole window: <code>O(k)</code>. For the prefix version on a strictly " +
      "increasing prefix array, the deque holds all indices: <code>O(n)</code>. Both are " +
      "tight. Popping equals on <code>&le;</code> is what keeps a constant array at " +
      "<code>O(1)</code> occupancy instead of <code>O(n)</code>.</p>"],
  ],

  problemsIntro: "LC 239 is the primitive. LC 862 is the prefix-sum exam question. Everything " +
    "else is a sliding extreme inside DP or a two-extreme window.",

  problems: [
    { url: "https://leetcode.com/problems/sliding-window-maximum/", name: "Sliding Window Maximum",
      badge: "lc", tag: "LC 239", level: "Hard", pattern: "Decreasing deque of indices; the primitive" },
    { url: "https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/", name: "Shortest Subarray with Sum at Least K",
      badge: "lc", tag: "LC 862", level: "Hard", pattern: "Increasing deque on prefix sums" },
    { url: "https://leetcode.com/problems/longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit/", name: "Longest Subarray with abs(max-min) <= Limit",
      badge: "lc", tag: "LC 1438", level: "Medium", pattern: "Two deques, or TreeMap of the window" },
    { url: "https://leetcode.com/problems/jump-game-vi/", name: "Jump Game VI",
      badge: "lc", tag: "LC 1696", level: "Medium", pattern: "DP + decreasing deque of last k scores" },
    { url: "https://leetcode.com/problems/constrained-subsequence-sum/", name: "Constrained Subsequence Sum",
      badge: "lc", tag: "LC 1425", level: "Hard", pattern: "Same as 1696 with a max(0, ·) option" },
    { url: "https://leetcode.com/problems/sliding-window-median/", name: "Sliding Window Median",
      badge: "lc", tag: "LC 480", level: "Hard", pattern: "Not a deque: two heaps + lazy deletion" },
    { url: "https://leetcode.com/problems/sum-of-subarray-ranges/", name: "Sum of Subarray Ranges",
      badge: "lc", tag: "LC 2104", level: "Medium", pattern: "Contribution of max minus contribution of min" },
    { url: "https://leetcode.com/problems/longest-turbulent-subarray/", name: "Longest Turbulent Subarray",
      badge: "lc", tag: "LC 978", level: "Medium", pattern: "Window whose comparison sign flips every step" },
    { url: "https://cses.fi/problemset/task/3226", name: "Sliding Window Maximum",
      badge: "cf", tag: "CSES", level: "Medium", pattern: "Same deque as LC 239 on larger n" },
    { url: "https://cses.fi/problemset/task/1076", name: "Sliding Window Median",
      badge: "cf", tag: "CSES", level: "Hard", pattern: "Two policy / two heaps; contrast with the max deque" },
  ],

  spoilers: [
    { summary: "Hint for LC 862 &mdash; two pops, two reasons",
      body: "<p>Front pop: <code>P[r] - P[front] &ge; k</code>. That left end has produced a " +
        "candidate, and any later r with the same left end is longer, so discard it. Back pop: " +
        "<code>P[r] &le; P[back]</code>. A later index with a smaller-or-equal prefix is a " +
        "strictly better left end for every future r (shorter and a larger difference). After " +
        "both pops, push r. The deque of prefixes stays increasing, which is what makes the " +
        "front the cheapest left end worth testing. If you only implement one of the two pops, " +
        "you either get TLE (deque grows) or a wrong longer answer.</p>" },
    { summary: "Hint for LC 1696 &mdash; DP with a sliding max",
      body: "<p><code>dp[i]</code> is the best score landing on i. The recurrence is " +
        "<code>dp[i] = a[i] + max(dp[i-k], &hellip;, dp[i-1])</code> (and you cannot jump from " +
        "before 0). The max of a sliding range of dp values is exactly window-maximum on the " +
        "dp array: a decreasing deque of indices, expire <code>i - k</code>. Do not recompute " +
        "the max by scanning, and do not put a heap here. Transferable lesson: <em>whenever DP " +
        "asks for the best of the last k states, the inner max is a monotonic deque, not a " +
        "loop of size k.</em></p>" },
  ],

  recap: {
    bullets: [
      "<strong>Back = domination, front = expiry.</strong> That is the only extra operation " +
        "beyond a monotonic stack.",
      "<strong>Window max:</strong> decreasing deque of indices, pop <code>&le;</code>, expire " +
        "<code>front &le; r - k</code>, read the front.",
      "<strong>Shortest sum &ge; k with negatives:</strong> increasing deque on " +
        "<code>long[]</code> prefixes. Two-pointer windows are illegal here.",
      "<strong>Each index is pushed and popped once</strong> &rarr; <code>O(n)</code>, not " +
        "<code>O(n log k)</code>.",
      "<strong>Median / k-th in a window is not this pattern</strong> &mdash; two heaps or a " +
        "TreeMap.",
    ],
    oneliner: "while (back dominated) pollLast(); if (front expired) pollFirst(); addLast(r); ans = a[peekFirst()];",
  },
},

/* ======================================== 3. linked-lists =============== */
{
  id: "linked-lists",
  difficulty: "Medium",
  readTime: "26 min",
  tagline: "Pointer surgery under a fixed extra-space budget: reverse a range, detect a cycle " +
    "and its entry, merge two ordered lists, and clone a graph that happens to look like a list.",
  tags: ["linked list", "two pointers", "Floyd", "in-place", "P0"],
  prereqs: [
    ["Two Pointers", "../01-arrays-and-windows/two-pointers.html"],
  ],

  why: {
    paras: [
      "Linked-list questions in interviews are almost never about the node type. They are about " +
      "rewriting pointers without losing the rest of the list, in <code>O(1)</code> extra " +
      "memory, while the input is a structure you cannot index into. Reverse a list, reverse " +
      "every k-group, detect a cycle and find its entry, merge two sorted lists, copy a list " +
      "with random pointers: five problems, and they recycle the same three moves &mdash; " +
      "save the next, rewire, advance.",
      "The reason they keep being asked at SDE-2 is that they punish sketchy pointer handling " +
      "the way array problems punish off-by-ones. A missed <code>prev</code> update silently " +
      "drops a suffix. A cycle detector that returns the meeting point instead of the entry " +
      "looks like it works on the sample. A k-group reverse that does not check there are k " +
      "nodes left corrupts the tail. Interviewers have seen every one of these.",
      "Floyd's cycle algorithm is the one piece of theory: two pointers at 1&times; and 2&times; " +
      "speed meet inside a cycle, and resetting one to the head then walking both at 1&times; " +
      "lands on the entry. The meeting-point-is-not-the-entry distinction is the follow-up. " +
      "Copy-random is the other classic: HashMap is the obvious <code>O(n)</code> space; the " +
      "weave (clone in between originals, wire randoms, then unweave) is the " +
      "<code>O(1)</code>-space flex they may ask if you finish early.",
    ],
    insight: "Before you rewire <code>curr.next</code>, save it. After you rewire, the old " +
      "successor is gone unless you held it. Every in-place list algorithm is that sentence " +
      "plus a dummy node to delete the head-special-case.",
  },

  recognise: {
    yes: [
      "The input is a singly (or doubly) linked list and you must rearrange it in place",
      "\"Reverse the list\" / \"reverse nodes in k-group\" / \"reverse between left and right\"",
      "\"Detect a cycle\" or \"return the node where the cycle begins\"",
      "\"Merge two (or k) sorted lists\"",
      "\"Copy a list that has an extra random pointer\" (clone a graph with outdegree 2)",
      "\"Find the middle\" / \"delete the n-th from the end\" &mdash; fast and slow pointers",
    ],
    no: [
      "You need order statistics or binary search on the values &rarr; the list is the wrong " +
        "representation; copy to an array first if n allows, or use a skip list / tree",
      "Random access by index is the hot path &rarr; an <code>ArrayList</code>, not a list of nodes",
      "The \"list\" is actually a graph with branching &rarr; BFS/DFS, not pointer reversal",
      "k-list merge when k is large &rarr; the heap version on the " +
        "<a href=\"heaps-and-priority-queue.html\">heaps page</a>, not pairwise merge",
    ],
    table: [
      ["\"reverse the whole list\"", "Three pointers: prev, curr, next", "Iterative reverse; dummy unused"],
      ["\"reverse every k nodes\"", "Identify a group, reverse it, stitch, repeat", "Dummy + groupPrev + k-check"],
      ["\"does it have a cycle?\"", "Fast moves 2, slow moves 1", "Floyd detect"],
      ["\"where does the cycle begin?\"", "After they meet, reset slow to head, both at 1&times;", "Floyd entry"],
      ["\"merge two sorted lists\"", "Dummy + tail, splice the smaller head", "Same pattern as merge in mergesort"],
      ["\"copy list with random pointer\"", "Clone a graph: map old&rarr;new, or weave", "HashMap, or O(1)-space weave"],
      ["\"delete n-th from end\"", "Gap of n between two pointers, then splice", "Dummy so deleting the head is uniform"],
      ["<strong>Confused with:</strong> finding a duplicate in an array of n+1 values in 1..n",
        "The array is a functional graph; Floyd still applies, but the input is an int[]",
        "Same algorithm, different wrapper (LC 287)"],
    ],
    constraint: "<code>n &le; 10&#8309;</code> with <code>O(1)</code> extra space is the usual " +
      "tell. Recursion that goes n frames deep will blow the Java stack around " +
      "<code>n = 10&#8308;</code>; prefer iterative reverse. k-group with " +
      "<code>k = n</code> is just reverse.",
  },

  core: {
    heading: "Core idea and the invariant",
    paras: [
      "Iterative reverse: <code>prev = null, curr = head</code>. Each step saves " +
      "<code>next = curr.next</code>, sets <code>curr.next = prev</code>, then advances " +
      "<code>prev = curr, curr = next</code>. The invariant is that <code>prev</code> is the " +
      "head of the already-reversed prefix and <code>curr</code> is the head of the still-forward " +
      "suffix. When <code>curr</code> is null, <code>prev</code> is the new head.",
      "k-group is reverse applied to successive slices, with a dummy so the first group is not " +
      "a special case. Before reversing a group, walk k steps from the node before it; if you " +
      "run out, leave the tail alone. After reversing, the old group head is the new group tail " +
      "and must be wired to the next group.",
      "Floyd: slow and fast start at head. If there is a cycle they meet. Meeting point is " +
      "<em>some</em> node on the cycle, not necessarily the entry. Set slow back to head and " +
      "walk both one step at a time; they meet at the entry. The algebra: if the stem has " +
      "length <code>a</code> and the cycle has length <code>c</code> and they meet " +
      "<code>b</code> into the cycle, then <code>a + b</code> is a multiple of <code>c</code>, " +
      "so a further <code>a</code> steps from the meeting point is the entry.",
    ],
    invariantTitle: "The invariant",
    invariant: "<p><strong>Reverse:</strong> the chain from <code>prev</code> backwards is " +
      "the reversed prefix; the chain from <code>curr</code> forwards is untouched.</p>" +
      "<p><strong>Floyd:</strong> after the first meeting, <code>distance(head, entry) = " +
      "distance(meeting, entry)</code> along the cycle. Walking both at speed 1 from those two " +
      "starts collides at the entry.</p>" +
      "<p>A dummy node whose <code>next</code> is the real head makes \"what if we replace the " +
      "head?\" the same code path as every other splice.</p>",
    extra: [
      { kind: "math", title: "Floyd's meeting algebra",
        html: "<p>Let the stem be length <code>a</code>, cycle length <code>c</code>, meeting " +
          "point <code>b</code> steps into the cycle. Slow has walked <code>a + b</code>, fast " +
          "has walked <code>2(a + b)</code>. The extra <code>a + b</code> that fast walked is a " +
          "whole number of laps: <code>a + b = m c</code>. Then <code>a = m c - b</code>, so " +
          "from the meeting point, <code>c - b</code> more steps reach the entry, which is the " +
          "same as walking <code>a</code> steps from the head. Resetting slow to head and moving " +
          "both at 1&times; implements that.</p>" },
      { kind: "tip", title: "Dummy nodes delete head-special-cases",
        html: "<p>Merge, delete-n-th-from-end, k-group, partition: all of them might produce a " +
          "new head. Allocate <code>ListNode dummy = new ListNode(0, head)</code> and splice " +
          "through <code>dummy.next</code>. Return <code>dummy.next</code>. The first time you " +
          "skip the dummy you will write a broken head-delete.</p>" },
      { kind: "warn", title: "Do not recurse n frames in Java",
        html: "<p>Recursive reverse is pretty and blows the stack at a few thousand frames in " +
          "the default JVM. Interview constraints of <code>n = 10&#8309;</code> make it a " +
          "latent crash. Write the iterative three-pointer version; mention the recursive one " +
          "as a curiosity.</p>" },
    ],
  },

  visuals: [
    {
      kind: "array", vizId: "revList",
      h3: "In-place reverse of 1 &rarr; 2 &rarr; 3 &rarr; 4 &rarr; 5",
      intro: "Cells are node values in their original index order. Pointers <code>prev</code>, " +
        "<code>curr</code>, <code>nxt</code> move left to right; the \"done\" cells have already " +
        "had their <code>next</code> flipped.",
      caption: "Three pointers, five steps, new head is 5. Losing nxt is the only way to drop " +
        "the suffix.",
      data: {
        label: "nodes (original order)",
        array: [1, 2, 3, 4, 5],
        vars: ["prev", "curr", "nxt"],
        speed: 900,
        frames: [
          { note: "Start: prev = null, curr = head (1), nxt not yet saved.",
            active: [0], dim: [1, 2, 3, 4], pointers: { curr: 0 },
            values: { prev: "null", curr: 1, nxt: "\u2014" } },
          { note: "Save nxt = 2, rewire 1.next = null. Advance: prev = 1, curr = 2.",
            active: [1], done: [0], dim: [2, 3, 4], pointers: { prev: 0, curr: 1 },
            values: { prev: 1, curr: 2, nxt: 2 } },
          { note: "Save nxt = 3, rewire 2.next = 1. Advance: prev = 2, curr = 3.",
            active: [2], done: [0, 1], dim: [3, 4], pointers: { prev: 1, curr: 2 },
            values: { prev: 2, curr: 3, nxt: 3 } },
          { note: "Save nxt = 4, rewire 3.next = 2. Advance: prev = 3, curr = 4.",
            active: [3], done: [0, 1, 2], dim: [4], pointers: { prev: 2, curr: 3 },
            values: { prev: 3, curr: 4, nxt: 4 } },
          { note: "Save nxt = 5, rewire 4.next = 3. Advance: prev = 4, curr = 5.",
            active: [4], done: [0, 1, 2, 3], pointers: { prev: 3, curr: 4 },
            values: { prev: 4, curr: 5, nxt: 5 } },
          { note: "Save nxt = null, rewire 5.next = 4. Advance: prev = 5, curr = null. Loop ends.",
            best: [4], done: [0, 1, 2, 3], pointers: { prev: 4 },
            values: { prev: 5, curr: "null", nxt: "null" } },
          { note: "Return prev. The list is 5 -> 4 -> 3 -> 2 -> 1. Every rewire was preceded by a save of nxt.",
            best: [4, 3, 2, 1, 0],
            values: { prev: 5, curr: "null", nxt: "\u2014" } },
        ],
      },
    },
    {
      kind: "array", vizId: "kGroup",
      h3: "Reverse k-group, k = 2, on 1 &rarr; 2 &rarr; 3 &rarr; 4 &rarr; 5",
      intro: "Each window of two is reversed and stitched. The leftover tail of length 1 is " +
        "left as-is because a full group of k was not available.",
      caption: "Result 2 &rarr; 1 &rarr; 4 &rarr; 3 &rarr; 5. The dummy node (not shown) is what " +
        "makes stitching the first group identical to stitching the rest.",
      data: {
        label: "nodes",
        array: [1, 2, 3, 4, 5],
        vars: ["group", "k left?", "list"],
        speed: 1100,
        frames: [
          { note: "Dummy attached in front of 1. First group starts at 1. Walk k = 2: nodes 1, 2 exist.",
            window: [0, 1], dim: [2, 3, 4],
            values: { group: "1-2", "k left?": "yes", list: "1-2-3-4-5" } },
          { note: "Reverse the group. 2 becomes the new head of this slice; 1 becomes its tail.",
            window: [0, 1], best: [1, 0], dim: [2, 3, 4],
            values: { group: "1-2", "k left?": "yes", list: "2-1-3-4-5" } },
          { note: "Stitch: dummy.next = 2, tail 1.next = 3. Next group starts at 3.",
            done: [0, 1], window: [2, 3], dim: [4],
            values: { group: "3-4", "k left?": "checking", list: "2-1-3-4-5" } },
          { note: "Walk k = 2 from 3: nodes 3, 4 exist. Reverse them.",
            done: [0, 1], window: [2, 3], best: [3, 2], dim: [4],
            values: { group: "3-4", "k left?": "yes", list: "2-1-4-3-5" } },
          { note: "Stitch: 1.next = 4, tail 3.next = 5. Next candidate starts at 5.",
            done: [0, 1, 2, 3], active: [4],
            values: { group: "5", "k left?": "checking", list: "2-1-4-3-5" } },
          { note: "Walk k = 2 from 5: only one node. Stop. Do not reverse a partial group.",
            done: [0, 1, 2, 3], dim: [4],
            values: { group: "5", "k left?": "no", list: "2-1-4-3-5" } },
          { note: "Return dummy.next. Answer 2 -> 1 -> 4 -> 3 -> 5.",
            best: [1, 0, 3, 2, 4],
            values: { group: "done", "k left?": "\u2014", list: "2-1-4-3-5" } },
        ],
      },
    },
    {
      kind: "mermaid", vizId: "floydMeet",
      h3: "Floyd: detect, then find the entry",
      caption: "The meeting point is on the cycle. The entry is a second walk. Returning the " +
        "meeting point as the answer is the classic half-solved submission.",
      src: `flowchart TD
  startNode["slow = fast = head"] --> move["slow plus 1, fast plus 2"]
  move --> nullQ{"fast is null or fast.next is null?"}
  nullQ -- yes --> acyclic["no cycle: return null"]
  nullQ -- no --> meetQ{"slow equals fast?"}
  meetQ -- no --> move
  meetQ -- yes --> reset["slow = head  (fast stays at meeting point)"]
  reset --> walk["both plus 1"]
  walk --> entryQ{"slow equals fast?"}
  entryQ -- no --> walk
  entryQ -- yes --> found["this node is the cycle entry"]`,
      wide: true,
    },
  ],

  steps: [
    "<strong>Draw the nodes and the next pointers</strong> for the sample, including the dummy " +
      "if the head might change.",
    "<strong>Reverse:</strong> save <code>nxt</code>, rewire <code>curr.next = prev</code>, " +
      "advance <code>prev, curr</code>. Return <code>prev</code>.",
    "<strong>k-group:</strong> from <code>groupPrev</code>, walk k nodes. If fewer than k " +
      "remain, stop. Reverse that slice, stitch <code>groupPrev.next</code> to the new head " +
      "and the old head (now tail) to the next group.",
    "<strong>Floyd detect:</strong> <code>while (fast != null && fast.next != null)</code>, " +
      "advance slow by 1 and fast by 2. Equal references mean a cycle.",
    "<strong>Floyd entry:</strong> after they meet, set <code>slow = head</code> and walk both " +
      "at 1&times; until they meet again. That node is the entry.",
    "<strong>Merge:</strong> dummy + tail; attach the smaller of the two heads; drain the rest.",
    "<strong>Copy random:</strong> HashMap old&rarr;new in two passes, or weave clones, wire " +
      "<code>clone.random = orig.random.next</code>, then unweave.",
  ],

  dryRun: {
    intro: "Reverse k-group, <code>k = 2</code>, on <code>1 &rarr; 2 &rarr; 3 &rarr; 4 &rarr; 5</code>. " +
      "<code>groupPrev</code> is the node before the group being reversed.",
    cols: ["groupPrev", "group", "k left?", "list after"],
    rows: [
      { cells: ["dummy", "1, 2", "yes", "1-2-3-4-5"],
        action: "First group is complete." },
      { cells: ["dummy", "1, 2", "reversing", "2-1-3-4-5"],
        action: "Stitch dummy.next = 2, 1.next = 3.", change: true },
      { cells: ["1", "3, 4", "yes", "2-1-3-4-5"],
        action: "Second group is complete." },
      { cells: ["1", "3, 4", "reversing", "2-1-4-3-5"],
        action: "Stitch 1.next = 4, 3.next = 5.", change: true },
      { cells: ["3", "5", "no", "2-1-4-3-5"],
        action: "Fewer than k nodes: stop.", change: true },
    ],
    after: "<p>Answer <code>2 &rarr; 1 &rarr; 4 &rarr; 3 &rarr; 5</code>. Partial groups stay in " +
      "original order; that is in the spec (LC 25) and is the usual source of over-reversing.</p>",
  },

  code: [
    { tab: "Reverse / k-group", panel: "Reverse", file: "ListReverse.java",
      intro: "The three-pointer reverse, then k-group built on top of it. The k-check before " +
        "reversing is the part that fails on the leftover tail.",
      highlight: "10-16,36-44",
      code: `public class ListReverse {

    static class ListNode {
        int val;
        ListNode next;
        ListNode(int v) { val = v; }
        ListNode(int v, ListNode n) { val = v; next = n; }
    }

    static ListNode reverse(ListNode head) {
        ListNode prev = null, curr = head;
        while (curr != null) {
            ListNode nxt = curr.next;   // save
            curr.next = prev;           // rewire
            prev = curr;
            curr = nxt;
        }
        return prev;
    }

    static ListNode reverseKGroup(ListNode head, int k) {
        ListNode dummy = new ListNode(0, head);
        ListNode groupPrev = dummy;
        while (true) {
            ListNode kth = groupPrev;
            for (int i = 0; i < k && kth != null; i++) {
                kth = kth.next;
            }
            if (kth == null) {
                break;                  // leftover tail shorter than k
            }
            ListNode groupNext = kth.next;
            ListNode prev = groupNext;
            ListNode curr = groupPrev.next;
            while (curr != groupNext) {
                ListNode nxt = curr.next;
                curr.next = prev;
                prev = curr;
                curr = nxt;
            }
            ListNode oldHead = groupPrev.next;
            groupPrev.next = kth;
            groupPrev = oldHead;
        }
        return dummy.next;
    }

    static String str(ListNode h) {
        StringBuilder sb = new StringBuilder();
        for (; h != null; h = h.next) {
            if (sb.length() > 0) sb.append("->");
            sb.append(h.val);
        }
        return sb.toString();
    }

    static ListNode build(int... a) {
        ListNode d = new ListNode(0), t = d;
        for (int v : a) { t.next = new ListNode(v); t = t.next; }
        return d.next;
    }

    public static void main(String[] args) {
        System.out.println(str(reverse(build(1, 2, 3, 4, 5))));
        System.out.println(str(reverseKGroup(build(1, 2, 3, 4, 5), 2)));
        System.out.println(str(reverseKGroup(build(1, 2, 3, 4, 5), 3)));
    }
    // Input : 1->2->3->4->5 ; k = 2 and k = 3
    // Output: 5->4->3->2->1
    //         2->1->4->3->5
    //         3->2->1->4->5
}`,
    },
    { tab: "Floyd + merge", panel: "Floyd", file: "ListFloyd.java",
      intro: "Cycle detection, cycle entry, and merge of two sorted lists. Returning the " +
        "meeting point as the entry is the bug this tab exists to prevent.",
      highlight: "28-40",
      code: `public class ListFloyd {

    static class ListNode {
        int val;
        ListNode next;
        ListNode(int v) { val = v; }
        ListNode(int v, ListNode n) { val = v; next = n; }
    }

    static boolean hasCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) return true;
        }
        return false;
    }

    /** Node where the cycle begins, or null. */
    static ListNode detectCycle(ListNode head) {
        ListNode slow = head, fast = head;
        boolean met = false;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) { met = true; break; }
        }
        if (!met) return null;
        slow = head;                    // reset; fast stays at the meeting point
        while (slow != fast) {
            slow = slow.next;
            fast = fast.next;
        }
        return slow;
    }

    static ListNode mergeTwo(ListNode a, ListNode b) {
        ListNode dummy = new ListNode(0), tail = dummy;
        while (a != null && b != null) {
            if (a.val <= b.val) { tail.next = a; a = a.next; }
            else                { tail.next = b; b = b.next; }
            tail = tail.next;
        }
        tail.next = (a != null) ? a : b;
        return dummy.next;
    }

    static String str(ListNode h) {
        StringBuilder sb = new StringBuilder();
        for (; h != null; h = h.next) {
            if (sb.length() > 0) sb.append("->");
            sb.append(h.val);
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        ListNode n1 = new ListNode(3);
        ListNode n2 = new ListNode(2);
        ListNode n3 = new ListNode(0);
        ListNode n4 = new ListNode(-4);
        n1.next = n2; n2.next = n3; n3.next = n4; n4.next = n2;  // cycle at 2
        System.out.println(hasCycle(n1));
        System.out.println(detectCycle(n1).val);

        ListNode a = new ListNode(1, new ListNode(2, new ListNode(4)));
        ListNode b = new ListNode(1, new ListNode(3, new ListNode(4)));
        System.out.println(str(mergeTwo(a, b)));
    }
    // Input : cycle 3->2->0->-4->2... ; merge 1->2->4 and 1->3->4
    // Output: true
    //         2
    //         1->1->2->3->4->4
}`,
    },
    { tab: "Copy random", panel: "Copy", file: "CopyRandom.java",
      intro: "O(n) space with a map is what you write first. The weave is the O(1)-space " +
        "follow-up: clone after each original, wire randoms via <code>orig.random.next</code>, " +
        "then split the two lists.",
      highlight: "18-24,44-52",
      code: `import java.util.HashMap;
import java.util.Map;

public class CopyRandom {

    static class Node {
        int val;
        Node next, random;
        Node(int v) { val = v; }
    }

    static Node copyMap(Node head) {
        if (head == null) return null;
        Map<Node, Node> map = new HashMap<>();
        for (Node p = head; p != null; p = p.next) {
            map.put(p, new Node(p.val));
        }
        for (Node p = head; p != null; p = p.next) {
            map.get(p).next = map.get(p.next);
            map.get(p).random = map.get(p.random);
        }
        return map.get(head);
    }

    /** O(1) extra space: weave, wire, unweave. */
    static Node copyWeave(Node head) {
        if (head == null) return null;
        for (Node p = head; p != null; p = p.next.next) {
            Node cl = new Node(p.val);
            cl.next = p.next;
            p.next = cl;
        }
        for (Node p = head; p != null; p = p.next.next) {
            if (p.random != null) {
                p.next.random = p.random.next;     // clone.random = orig.random's clone
            }
        }
        Node dummy = new Node(0), tail = dummy;
        for (Node p = head; p != null; p = p.next) {
            tail.next = p.next;
            tail = tail.next;
            p.next = p.next.next;                  // restore the original list
        }
        return dummy.next;
    }

    public static void main(String[] args) {
        Node a = new Node(7), b = new Node(13), c = new Node(11);
        a.next = b; b.next = c;
        a.random = null; b.random = a; c.random = c;
        Node copied = copyWeave(a);
        System.out.println(copied.val + " " + copied.next.val + " " + copied.next.next.val);
        System.out.println(copied.random + " " + copied.next.random.val + " " + copied.next.next.random.val);
        System.out.println(copyMap(a).val);
    }
    // Input : 7->13->11 with randoms [null, 7, 11]
    // Output: 7 13 11
    //         null 7 11
    //         7
}`,
    },
  ],

  complexity: {
    time: "O(n) for reverse, Floyd, merge of two, copy",
    space: "O(1) extra for reverse / Floyd / merge / weave; O(n) for the HashMap copy",
    derivation: [
      "<p>Reverse and k-group visit each node a constant number of times (k-group: one walk " +
      "to find the k-th, one walk to reverse). Floyd: fast walks at most twice the length of " +
      "stem plus cycle before meeting, then both walk the stem again:</p>",
      "<span class=\"eq\">T(n) = &Theta;(n) pointer assignments</span>",
      "<p>Merge of two lists is <code>&Theta;(n + m)</code>. Merge of k lists by repeated " +
      "pairwise merge is <code>O(n log k)</code> if you merge as a tree (not left-to-right, " +
      "which is <code>O(n k)</code>); the heap version on the heaps page is the same bound " +
      "with simpler code.</p>",
      "<p>Copy-random is two or three linear passes. The map holds n entries. The weave holds " +
      "the clones in the original list's <code>next</code> pointers, so extra space is " +
      "<code>O(1)</code> beyond the output, which does not count.</p>",
    ],
    compare: [
      ["Iterative reverse", "<code>O(n)</code>", "<code>O(1)</code>", "Default; does not blow the stack"],
      ["Recursive reverse", "<code>O(n)</code>", "<code>O(n)</code> frames", "Fine for tiny n; not for 1e5"],
      ["Floyd detect + entry", "<code>O(n)</code>", "<code>O(1)</code>", "Cycle questions; do not return the meeting point"],
      ["HashSet of seen nodes", "<code>O(n)</code>", "<code>O(n)</code>", "Detect only; wastes the O(1)-space follow-up"],
      ["Merge two lists", "<code>O(n + m)</code>", "<code>O(1)</code>", "Dummy + tail"],
      ["Copy random, HashMap", "<code>O(n)</code>", "<code>O(n)</code>", "Write this first"],
      ["Copy random, weave", "<code>O(n)</code>", "<code>O(1)</code> extra", "The follow-up"],
    ],
  },

  pitfalls: [
    { title: "Rewiring <code>curr.next</code> before saving it",
      bug: "The suffix becomes unreachable. The algorithm \"works\" on a one-node list and " +
        "fails on everything else.",
      fix: "<code>ListNode nxt = curr.next;</code> as the first line of the loop body. Recite " +
        "save, rewire, advance." },
    { title: "Returning Floyd's meeting point as the cycle entry",
      bug: "LC 141 (has cycle) is done, LC 142 (entry) is not. The meeting point is some node " +
        "on the cycle, equal to the entry only when the stem length is a multiple of the cycle.",
      fix: "Reset slow to head, walk both at 1&times;, return the second meeting." },
    { title: "Reversing a leftover tail in k-group",
      bug: "Not checking that k nodes remain, so a final group of size <code>&lt; k</code> is " +
        "reversed. The spec says leave it.",
      fix: "Walk k steps from <code>groupPrev</code>; if you hit null, break before reversing." },
    { title: "Forgetting the dummy when the head can change",
      bug: "Merge, delete-head, k-group first group: you return the old head, which is now in " +
        "the middle or detached.",
      fix: "<code>ListNode dummy = new ListNode(0, head);</code> and return " +
        "<code>dummy.next</code>." },
    { title: "Comparing node values instead of references in Floyd",
      bug: "<code>slow.val == fast.val</code> on a list with duplicate values. False cycle, or " +
        "a missed one.",
      fix: "Compare the node objects: <code>slow == fast</code>." },
    { title: "Breaking the original list in the weave copy",
      bug: "Unweaving wrong so the caller's list is interleaved with clones, or " +
        "<code>clone.random</code> wired to an original instead of a clone.",
      fix: "<code>clone.random = orig.random.next</code> (the clone sits at " +
        "<code>.next</code> of the original). Restore <code>orig.next = clone.next</code> in " +
        "the split pass." },
  ],

  variants: [
    ["Reverse a sublist [left, right] (LC 92)",
      "Walk to left-1, reverse the next (right-left+1) nodes, stitch.",
      "Same three-pointer reverse, bounded by a count instead of null.",
      "LC 92"],
    ["Palindrome list (LC 234)",
      "Slow/fast to the middle, reverse the second half, compare, optionally restore.",
      "ListNode mid = slow; ListNode second = reverse(slow.next);",
      "LC 234"],
    ["Intersection of two lists (LC 160)",
      "Two pointers: when one hits null, jump to the other list's head. They meet at the " +
      "intersection or at null.",
      "if (p == null) p = headB; else p = p.next;  (and the same for q / headA)",
      "LC 160"],
    ["Flatten a multilevel list (LC 430)",
      "Treat child as a splice: stack of next-to-resume, or a linear scan that stitches child " +
      "then continues.",
      "if (p.child != null) { /* splice child, park p.next on a stack */ }",
      "LC 430"],
    ["Reorder list 1,n,2,n-1,... (LC 143)",
      "Middle, reverse second half, merge-interleave.",
      "Three primitives from this page composed.",
      "LC 143"],
  ],

  followups: [
    ["Why does resetting one pointer to the head find the entry?",
      "<p>See the algebra in the core section. After the first meeting, slow has walked " +
      "<code>a + b</code> and that quantity is a multiple of the cycle length. Therefore " +
      "<code>a</code> more steps from the meeting point land on the entry, which is also " +
      "<code>a</code> steps from the head. Walking both at speed 1 from those two starts " +
      "implements the equality. If you cannot reconstruct this under pressure, at least " +
      "state the result and the reset step correctly.</p>"],
    ["Can Floyd be used to find a duplicate number in an array?",
      "<p>Yes, LC 287. An array <code>a</code> of <code>n+1</code> values in " +
      "<code>1..n</code> is a functional graph: edge <code>i &rarr; a[i]</code>. There is a " +
      "cycle because of the pigeonhole duplicate, and the cycle entry is the duplicate " +
      "value. Index 0 is a stem into that cycle. Same code, with " +
      "<code>slow = a[slow]</code> and <code>fast = a[a[fast]]</code>. You must not modify " +
      "the array and you must use <code>O(1)</code> extra space &mdash; that is why Floyd " +
      "is the intended solution rather than a HashSet.</p>"],
    ["How do you reverse a list in groups of k if k does not divide n?",
      "<p>Leave the leftover tail in original order (LC 25). The implementation is: from the " +
      "node before the would-be group, try to walk k steps; if you cannot, stop. Some " +
      "variants reverse the leftover too &mdash; read the spec. Testing n = 5, k = 3 " +
      "(answer 3-2-1-4-5) and n = 5, k = 1 (identity) and n = 5, k = 5 (full reverse) covers " +
      "the corners.</p>"],
    ["Map vs weave for copy-random: which do you write in 25 minutes?",
      "<p>The map. Two obvious passes, O(n) extra, hard to get wrong. Mention the weave as " +
      "the O(1)-space follow-up and write it if they ask. The weave has two extra bug " +
      "surfaces (wiring randoms to clones via <code>.next</code>, and restoring the original " +
      "list) and is not worth the time unless extra space is forbidden.</p>"],
    ["How do you merge k sorted lists?",
      "<p>A min-heap of the current heads, <code>O(n log k)</code>. Pairwise merge in a " +
      "tournament (merge list i with i+1, then the results) is the same bound. Repeatedly " +
      "merging into an accumulator is <code>O(n k)</code> and times out. Details on the " +
      "<a href=\"heaps-and-priority-queue.html\">heaps page</a>.</p>"],
  ],

  problemsIntro: "Reverse, k-group, Floyd entry, merge, copy-random: those five are the " +
    "interview set. Palindrome and reorder list are compositions of reverse + middle.",

  problems: [
    { url: "https://leetcode.com/problems/reverse-linked-list/", name: "Reverse Linked List",
      badge: "lc", tag: "LC 206", level: "Easy", pattern: "Three pointers: save, rewire, advance" },
    { url: "https://leetcode.com/problems/reverse-nodes-in-k-group/", name: "Reverse Nodes in k-Group",
      badge: "lc", tag: "LC 25", level: "Hard", pattern: "Dummy + k-check + reverse a slice" },
    { url: "https://leetcode.com/problems/linked-list-cycle/", name: "Linked List Cycle",
      badge: "lc", tag: "LC 141", level: "Easy", pattern: "Floyd detect" },
    { url: "https://leetcode.com/problems/linked-list-cycle-ii/", name: "Linked List Cycle II",
      badge: "lc", tag: "LC 142", level: "Medium", pattern: "Floyd entry: reset slow to head" },
    { url: "https://leetcode.com/problems/merge-two-sorted-lists/", name: "Merge Two Sorted Lists",
      badge: "lc", tag: "LC 21", level: "Easy", pattern: "Dummy + tail, splice the smaller" },
    { url: "https://leetcode.com/problems/copy-list-with-random-pointer/", name: "Copy List with Random Pointer",
      badge: "lc", tag: "LC 138", level: "Medium", pattern: "HashMap, or weave / unweave" },
    { url: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/", name: "Remove Nth Node From End of List",
      badge: "lc", tag: "LC 19", level: "Medium", pattern: "Dummy + gap of n, then splice" },
    { url: "https://leetcode.com/problems/palindrome-linked-list/", name: "Palindrome Linked List",
      badge: "lc", tag: "LC 234", level: "Easy", pattern: "Middle + reverse second half + compare" },
    { url: "https://leetcode.com/problems/reorder-list/", name: "Reorder List",
      badge: "lc", tag: "LC 143", level: "Medium", pattern: "Middle + reverse + merge-interleave" },
    { url: "https://leetcode.com/problems/intersection-of-two-linked-lists/", name: "Intersection of Two Linked Lists",
      badge: "lc", tag: "LC 160", level: "Easy", pattern: "Two pointers jumping to the other head" },
    { url: "https://leetcode.com/problems/sort-list/", name: "Sort List",
      badge: "lc", tag: "LC 148", level: "Medium", pattern: "Mergesort: middle split + merge two" },
    { url: "https://leetcode.com/problems/find-the-duplicate-number/", name: "Find the Duplicate Number",
      badge: "lc", tag: "LC 287", level: "Medium", pattern: "Floyd on the functional graph of an array" },
  ],

  spoilers: [
    { summary: "Hint for LC 25 &mdash; reverse a bounded slice without a helper that needs a head",
      body: "<p>You can reverse a group in place between <code>groupPrev.next</code> and " +
        "<code>groupNext</code> by running the standard reverse with <code>prev</code> " +
        "initialised to <code>groupNext</code> (not null). Then every node's next already " +
        "points at the correct successor when the group is done, including the tail wiring " +
        "to the next group. After the loop, the old group head is the new tail; the k-th " +
        "node is the new head. Swap them onto <code>groupPrev</code> and advance " +
        "<code>groupPrev</code> to the old head. The leftover-tail check is a separate walk " +
        "of k steps that happens <em>before</em> this reverse, not inside it.</p>" },
    { summary: "Hint for LC 138 weave &mdash; random of a clone is next of random of original",
      body: "<p>After the weave the list looks like " +
        "<code>A &rarr; A' &rarr; B &rarr; B' &rarr; C &rarr; C'</code>. The clone of any " +
        "original X sits at <code>X.next</code>. Therefore the clone of <code>X.random</code> " +
        "sits at <code>X.random.next</code>, which is exactly " +
        "<code>X.next.random</code>'s assignment. Null randoms stay null. The split pass must " +
        "restore <code>A.next = B</code> as well as collect <code>A'</code>, otherwise you " +
        "have cloned the list and destroyed the input &mdash; some judges (and interviewers) " +
        "notice.</p>" },
  ],

  recap: {
    bullets: [
      "<strong>Save, rewire, advance.</strong> Lose <code>nxt</code> and you lose the suffix.",
      "<strong>Dummy node</strong> whenever the head might change (merge, k-group, delete).",
      "<strong>Floyd detect is not Floyd entry.</strong> Reset slow to head, walk both at 1&times;.",
      "<strong>k-group:</strong> walk k first; leftover tail stays in original order.",
      "<strong>Copy random:</strong> HashMap first; weave if they forbid extra space.",
    ],
    oneliner: "nxt = curr.next; curr.next = prev; prev = curr; curr = nxt;  // dummy when head changes",
  },
},

];

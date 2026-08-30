/* Module 03 — Linear Data Structures */
import { pack } from "./pack.mjs";

export const topics = [

/* =========================== 1. stacks-and-monotonic-stack ============= */
pack({
  id: "stacks-and-monotonic-stack",
  difficulty: "Medium",
  readTime: "24 min",
  tagline: "A stack answers \"who is waiting for me?\" in linear time: next greater, nearest " +
    "smaller, histogram rectangles, trapped rain, and the contribution of every subarray minimum.",
  tags: ["stack", "monotonic stack", "NGE", "histogram", "P0"],
  prereqs: [
    ["Java for DSA", "../00-foundations/java-for-dsa.html"],
    ["Two Pointers", "../01-arrays-and-windows/two-pointers.html"],
  ],
  why: [
    "The next-greater-element question looks like a nested scan: for each index, walk right " +
      "until a strictly larger value. That is <code>O(n&sup2;)</code> and dies at " +
      "<code>n = 10&#8309;</code>. If <code>a[j]</code> is smaller than <code>a[i]</code> and " +
      "to its right, <code>a[j]</code> can never be the next greater of anyone still waiting " +
      "left of <code>i</code>. A stack of unresolved indices, popped when a greater value " +
      "arrives, does all the work in one pass.",
    "That same pop-when-dominated structure is an entire SDE-2 cluster. Largest rectangle in " +
      "a histogram is next-smaller on both sides. Trapping rain is bounded by the nearest " +
      "taller bar on each side. Sum of subarray minimums is previous-less times next-less. " +
      "Daily temperatures and stock span are next-greater with a distance payload.",
    "The other stack family is structural, not monotonic: matching brackets, decoding nested " +
      "strings, RPN / calculator. Those keep unmatched openers or pending operators. Mixing " +
      "the two families in an interview is a classification error.",
  ],
  insight: "A monotonic stack stores indices whose answer is not yet known, in an order that " +
    "lets you discard dominated candidates forever. Each index is pushed once and popped once, " +
    "so the nested while is O(n) amortised, not quadratic.",
  yes: [
    "\"Next / previous strictly greater (or smaller) element\" for every index",
    "\"Largest rectangle in a histogram\", \"maximal rectangle of 1s\" after each row is a histogram",
    "\"How much water can be trapped\" bounded by nearest taller bars",
    "\"Sum of subarray minimums\" &mdash; contribution (i-prev)*(next-i)",
    "Stock span, daily temperatures, visible people in a queue",
    "Matching parentheses, nested decode, or operator-precedence evaluation (structural stack)",
  ],
  no: [
    "Maximum inside a <em>sliding window of fixed size</em> &rarr; " +
      "<a href=\"queues-and-monotonic-deque.html\">monotonic deque</a> (candidates also expire by age)",
    "\"k-th greatest so far\" or \"median of a stream\" &rarr; " +
      "<a href=\"heaps-and-priority-queue.html\">heap</a>",
    "Nearest greater with updates between queries &rarr; sparse table or segment tree",
    "The sequence is not a total order on values &rarr; a different structure",
  ],
  table: [
    ["next greater to the right", "Unresolved indices, popped by a larger arrival", "Decreasing stack"],
    ["previous smaller", "Same idea, opposite comparison or scan", "Increasing stack"],
    ["largest rectangle in histogram", "Width = next-smaller - prev-smaller - 1", "0-sentinel at i=n"],
    ["trapping rain water", "min(tallest-left, tallest-right) - height", "Stack, or two-pointer maxes"],
    ["sum of subarray mins", "Each value owns a rectangle of subarrays", "Prev-less * next-less"],
    ["daily temperatures / stock span", "NGE with distance instead of value", "Payload i-j"],
    ["<strong>Confused with:</strong> sliding-window maximum",
      "Window expiry is by index age, not only by domination",
      "<a href=\"queues-and-monotonic-deque.html\">Monotonic deque</a>"],
  ],
  constraint: "<code>n &le; 10&#8309;</code> with a next-greater / histogram / rain flavour is " +
    "the linear-stack signature. Areas and contributions need <code>long</code>: heights up to " +
    "<code>10&#8313;</code> times widths up to <code>10&#8309;</code> overflow int.",
  core: [
    "Keep a stack of indices whose next-greater (or next-smaller) is unknown. Values are " +
      "monotone: decreasing when hunting a strictly greater neighbour, increasing when hunting " +
      "smaller. When <code>a[i]</code> breaks the monotone property, every popped index has " +
      "just found its answer, and is dominated forever. Store <em>indices</em>, not values: " +
      "widths and distances need the position. Histogram sentinel: loop to <code>i = n</code> " +
      "with virtual height 0 so every remaining bar pops.",
    "Contribution (sum of subarray mins): subarrays where i is the unique min start in " +
      "(prevLess, i] and end in [i, nextLess). Make one side strict so a plateau is not " +
      "counted twice. Use <code>ArrayDeque</code>, never <code>java.util.Stack</code>.",
  ],
  invariant: "<p>The stack holds unresolved indices in monotone order of <code>a[&middot;]</code>. " +
    "For a decreasing stack used for next-greater:</p>" +
    "<span class=\"eq\">a[s0] &ge; a[s1] &ge; &hellip; , and every popped j has a[j] &lt; a[i] " +
    "with no greater value in (j, i)</span>" +
    "<p>Interview sentence: <em>\"Each index is pushed once and popped once, so the nested " +
    "while is O(n).\"</em></p>",
  array: [2, 1, 2, 4, 3],
  vars: ["i", "a[i]", "stack", "wrote"],
  frames: [
    { note: "Start. Stack empty. Answers unknown.",
      dim: [0, 1, 2, 3, 4],
      values: { i: "\u2014", "a[i]": "\u2014", stack: "[]", wrote: "\u2014" } },
    { note: "i=0, a[0]=2. Nothing to pop. Push 0.",
      active: [0], dim: [1, 2, 3, 4],
      values: { i: 0, "a[i]": 2, stack: "[0]", wrote: "\u2014" } },
    { note: "i=1, a[1]=1. 1 is not greater than 2. Push 1. Stack [0,1].",
      active: [1], done: [0], dim: [2, 3, 4],
      values: { i: 1, "a[i]": 1, stack: "[0, 1]", wrote: "\u2014" } },
    { note: "i=2, a[2]=2. 2>1, pop 1, write nge[1]=2. Strict: do not pop 0. Push 2.",
      active: [2], x: [1], done: [0], dim: [3, 4],
      values: { i: 2, "a[i]": 2, stack: "[0, 2]", wrote: "nge[1]=2" } },
    { note: "i=3, a[3]=4. Pop 2 then 0; write nge[2]=4 and nge[0]=4. Push 3.",
      active: [3], best: [0, 2], done: [1], dim: [4],
      values: { i: 3, "a[i]": 4, stack: "[3]", wrote: "nge[0]=nge[2]=4" } },
    { note: "i=4, a[4]=3. 3<4, push 4. End: leftover get -1. Answer [4,2,4,-1,-1].",
      active: [4], done: [0, 1, 2],
      values: { i: 4, "a[i]": 3, stack: "[3, 4]", wrote: "[4,2,4,-1,-1]" } },
    { note: "Histogram on [2,1,5,6,2,3]: bar of height 5 has prev-smaller 1 and next-smaller 4, area 10.",
      dim: [0, 1, 2, 3, 4],
      values: { i: "hist", "a[i]": 5, stack: "\u2014", wrote: "area 10" } },
  ],
  mermaid: `flowchart TD
  ask["nearest neighbour or nested syntax?"] --> kind{"which family?"}
  kind -- "nearest greater/smaller" --> side{"one side or both?"}
  side -- one --> nge["monotonic stack, scan toward the unknown"]
  side -- both --> hist["same stack; widths from prev and next"]
  kind -- "nested syntax" --> syn{"brackets, decode, or operators?"}
  syn -- brackets --> match["stack of unmatched openers"]
  syn -- decode --> nest["stack of strings and multipliers"]
  syn -- operators --> calc["values deque plus operators deque"]
  nge --> window{"do candidates also expire by age?"}
  window -- yes --> deque["wrong page: monotonic deque"]
  window -- no --> doneNode["ArrayDeque as a stack of indices"]`,
  merTitle: "Which stack?",
  steps: [
    "<strong>Classify.</strong> Nearest greater/smaller (monotonic) vs nested structure.",
    "<strong>Comparison:</strong> decreasing stack for next-greater; increasing for next-smaller. Strictness is spec.",
    "<strong>Store indices</strong> in <code>ArrayDeque&lt;Integer&gt;</code>: addLast / pollLast / peekLast.",
    "<strong>Scan once.</strong> While the top is dominated by a[i], pop and write. Then push i.",
    "<strong>Sentinel.</strong> Histogram: i to n with height 0. NGE leftovers get -1.",
    "<strong>Widths:</strong> nextSmall - prevSmall - 1. Contributions in <code>long</code>.",
    "<strong>Amortised O(n):</strong> each index pushed once and popped once.",
  ],
  code: [
    { tab: "Brute NGE", file: "NgeBrute.java",
      intro: "Correct nested scan. Mention it, then beat it. Only for n \u2264 2000.",
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
    }
    // Input : [2, 1, 2, 4, 3]
    // Output: [4, 2, 4, -1, -1]
}` },
    { tab: "Optimal stack", file: "MonotonicStack.java",
      intro: "Next-greater, histogram, rain: three payloads on one decreasing-stack skeleton.",
      code: `import java.util.ArrayDeque;
import java.util.Arrays;

public class MonotonicStack {
    static int[] nextGreater(int[] a) {
        int n = a.length;
        int[] ans = new int[n];
        Arrays.fill(ans, -1);
        ArrayDeque<Integer> st = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            while (!st.isEmpty() && a[st.peekLast()] < a[i]) {
                ans[st.pollLast()] = a[i];
            }
            st.addLast(i);
        }
        return ans;
    }

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
            if (i < n) {
                st.addLast(i);
            }
        }
        return (int) best;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(nextGreater(new int[] {2, 1, 2, 4, 3})));
        System.out.println(largestRectangle(new int[] {2, 1, 5, 6, 2, 3}));
    }
    // Input : NGE [2,1,2,4,3]; histogram [2,1,5,6,2,3]
    // Output: [4, 2, 4, -1, -1]
    //         10
}` },
    { tab: "Template", file: "StackTemplates.java",
      intro: "Sum of subarray mins (asymmetric strictness) and RPN on ArrayDeque of long.",
      code: `import java.util.ArrayDeque;

public class StackTemplates {
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
                    default -> a / b;
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
    }
    // Input : mins [3,1,2,4]; RPN (2+1)*3
    // Output: 17
    //         9
}` },
  ],
  complexity: {
    time: "O(n) amortised",
    space: "O(n) for the stack and the answer array",
    derivation: [
      "<p>Every index is pushed at most once and popped at most once. If P is the total pops:</p>" +
        "<span class=\"eq\">T(n) = n pushes + P pops, P \u2264 n, so T(n) = \u0398(n)</span>",
      "<p>The nested while is therefore not a hidden quadratic. Histogram and rain are the same " +
        "pass with more arithmetic per pop. Sum of subarray mins is two passes plus a linear " +
        "accumulation, still \u0398(n).</p>",
    ],
    compare: [
      ["Nested scan for NGE", "O(n\u00b2)", "O(1)", "n \u2264 2000 only"],
      ["Monotonic stack", "O(n)", "O(n)", "Default for nearest-neighbour"],
      ["Two-pointer rain", "O(n)", "O(1)", "Rain only; no NGE payload"],
      ["Left-max / right-max", "O(n)", "O(n)", "Rain; simpler if that is all"],
      ["Segment tree of range max", "O(n log n)", "O(n)", "When the array is updated"],
    ],
  },
  pitfalls: [
    { title: "Using java.util.Stack",
      bug: "Synchronised Vector subclass. Slower, allows null, signals outdated Java.",
      fix: "ArrayDeque with addLast / pollLast / peekLast." },
    { title: "Storing values instead of indices",
      bug: "Cannot compute widths, distances, or equal-value identity.",
      fix: "Always store indices. Read values through a[st.peekLast()]." },
    { title: "Wrong strictness on equals",
      bug: "Plateau double-counted or undercounted in contribution problems.",
      fix: "NGE is strict. Contribution: one side strict, the other not." },
    { title: "Forgetting the histogram sentinel",
      bug: "Suffix minima never pop; strictly increasing samples still look OK.",
      fix: "Loop i to n with virtual height 0 at i==n." },
    { title: "int overflow on area",
      bug: "height * width wraps before you store it.",
      fix: "(long) height * (i - left - 1). Reduce mod only after the product." },
  ],
  variants: [
    ["Circular next greater (LC 503)",
      "Scan 2n; write only if ans[j] is still -1; never push index \u2265 n.",
      "for (int i = 0; i < 2*n; i++) { int v = a[i % n]; ... }",
      "LC 503."],
    ["Maximal rectangle of 1s",
      "Each row: height[c] = row[c]==1 ? height[c]+1 : 0; then histogram.",
      "best = max(best, largestRectangle(height));",
      "LC 85."],
    ["Online stock span",
      "Previous-greater on a stream: pop while top price \u2264 today.",
      "span = i - (empty ? -1 : peek);",
      "LC 901."],
  ],
  followups: [
    ["Why is the nested while O(n) not O(n\u00b2)?",
      "<p>Amortisation. An index that has been popped is never pushed again, so the inner " +
      "loop runs at most n times in total. State it as \"each index is pushed once and popped once\".</p>"],
    ["Histogram vs rain: same stack, different payload?",
      "<p>Histogram: height[mid]*(right-left-1), take max. Rain: (min(h[left],h[right])-h[mid])*width, add. " +
      "Two-pointer rain is simpler if they only want rain; the stack generalises to histogram.</p>"],
    ["How do you avoid double-counting equal minima?",
      "<p>Previous strictly-less and next less-or-equal (or the opposite). Ownership is a " +
      "partition of subarrays, not a cover.</p>"],
    ["Circular NGE without overwriting?",
      "<p>Only write if ans[j]==-1. Do not push aliases i\u2265n. A strictly decreasing array " +
      "is the worst case: every answer wraps except a[0] which stays -1.</p>"],
  ],
  problems: [
    { url: "https://leetcode.com/problems/next-greater-element-i/", name: "Next Greater Element I",
      badge: "lc", tag: "LC 496", level: "Easy", pattern: "NGE on nums2, map-lookup nums1" },
    { url: "https://leetcode.com/problems/next-greater-element-ii/", name: "Next Greater Element II",
      badge: "lc", tag: "LC 503", level: "Medium", pattern: "Circular NGE; scan 2n" },
    { url: "https://leetcode.com/problems/daily-temperatures/", name: "Daily Temperatures",
      badge: "lc", tag: "LC 739", level: "Medium", pattern: "NGE with distance i-j" },
    { url: "https://leetcode.com/problems/online-stock-span/", name: "Online Stock Span",
      badge: "lc", tag: "LC 901", level: "Medium", pattern: "Previous-greater on a stream" },
    { url: "https://leetcode.com/problems/largest-rectangle-in-histogram/", name: "Largest Rectangle in Histogram",
      badge: "lc", tag: "LC 84", level: "Hard", pattern: "Prev-smaller and next-smaller; 0-sentinel" },
    { url: "https://leetcode.com/problems/trapping-rain-water/", name: "Trapping Rain Water",
      badge: "lc", tag: "LC 42", level: "Hard", pattern: "Stack of bars, or two-pointer maxes" },
    { url: "https://leetcode.com/problems/sum-of-subarray-minimums/", name: "Sum of Subarray Minimums",
      badge: "lc", tag: "LC 907", level: "Medium", pattern: "Contribution (i-prev)*(next-i)*a[i]" },
    { url: "https://leetcode.com/problems/maximal-rectangle/", name: "Maximal Rectangle",
      badge: "lc", tag: "LC 85", level: "Hard", pattern: "Each row as a histogram, then LC 84" },
    { url: "https://leetcode.com/problems/evaluate-reverse-polish-notation/", name: "Evaluate Reverse Polish Notation",
      badge: "lc", tag: "LC 150", level: "Medium", pattern: "Structural ArrayDeque of long" },
    { url: "https://leetcode.com/problems/basic-calculator/", name: "Basic Calculator",
      badge: "lc", tag: "LC 224", level: "Hard", pattern: "Sign + accumulator at each '('" },
    { url: "https://leetcode.com/problems/number-of-visible-people-in-a-queue/", name: "Number of Visible People in a Queue",
      badge: "lc", tag: "LC 1944", level: "Hard", pattern: "Decreasing stack; count pops plus one" },
    { url: "https://cses.fi/problemset/task/1645", name: "Nearest Smaller Values",
      badge: "cf", tag: "CSES", level: "Easy", pattern: "Previous-smaller; NGE flipped" },
  ],
  spoilers: [
    { summary: "Hint for LC 84 &mdash; the 0-sentinel",
      body: "<p>Bars that never meet a smaller value to their right stay on the stack until the " +
        "array ends. Without a virtual height-0 at index n, those bars never pop, so every " +
        "suffix-minimum rectangle is missing. Test a strictly increasing histogram.</p>" },
    { summary: "Hint for LC 907 &mdash; the plateau rule",
      body: "<p>Previous strictly-less plus next less-or-equal assigns each subarray to exactly " +
        "one occurrence of its minimum. Using the same comparison on both sides overcounts or " +
        "undercounts a run of equal values.</p>" },
  ],
  recap: [
    "<strong>Store indices</strong> in ArrayDeque, never values and never java.util.Stack.",
    "<strong>Decreasing</strong> for next-greater; <strong>increasing</strong> for next-smaller.",
    "<strong>Amortised O(n):</strong> each index pushed once and popped once.",
    "<strong>Histogram / rain / contribution</strong> are the same neighbours, different payload.",
    "<strong>Structural stacks</strong> (RPN, calculator) are a different family; use long.",
  ],
  oneliner: "while (!st.isEmpty() && a[st.peekLast()] < a[i]) ans[st.pollLast()] = a[i]; st.addLast(i);",
}),

/* =========================== 2. queues-and-monotonic-deque ============= */
pack({
  id: "queues-and-monotonic-deque",
  difficulty: "Medium",
  readTime: "22 min",
  tagline: "A deque drops candidates from both ends: the front expires by age, the back is " +
    "dominated by a better newer value &mdash; sliding-window maximum in O(n).",
  tags: ["queue", "deque", "sliding window max", "monotonic deque", "P0"],
  prereqs: [
    ["Stacks & Monotonic Stack", "stacks-and-monotonic-stack.html"],
    ["Sliding Window", "../01-arrays-and-windows/sliding-window.html"],
  ],
  why: [
    "A queue is FIFO: BFS, moving averages, \"first task that arrived\". The structure that " +
      "actually wins interviews is the <em>monotonic deque</em>: indices of candidates for " +
      "the window maximum (or minimum), increasing in index and decreasing in value. The " +
      "front is the answer for the current window; the back is where new arrivals land after " +
      "popping everything they dominate.",
    "Without the deque, window-max is O(nk) or O(n log k) with a heap that cannot cheaply " +
      "delete the element that just left. The deque deletes expired indices from the front " +
      "in O(1) and dominated indices from the back in amortised O(1). Same bound as a " +
      "monotonic stack, plus age.",
    "The same deque solves shortest subarray with sum \u2265 k (on prefixes), jump game VI, " +
      "and constrained subsequence sum. Structural queues (recent calls, circular queue, " +
      "implement queue with stacks) are a different, easier family.",
  ],
  insight: "The front of a decreasing deque is the max of the live window because everything " +
    "older and smaller has been popped from the back, and everything too old has been popped " +
    "from the front.",
  yes: [
    "\"Maximum / minimum of every window of size k\"",
    "\"Longest subarray whose max-min \u2264 limit\" (two deques, or one TreeMap)",
    "\"Shortest subarray with sum \u2265 k\" allowing negatives (prefix + increasing deque)",
    "Jump game VI / constrained subsequence: dp[i] = a[i] + max of a window of dp",
    "BFS, moving average, recent-calls queue (structural FIFO)",
  ],
  no: [
    "Next greater with no window expiry &rarr; " +
      "<a href=\"stacks-and-monotonic-stack.html\">monotonic stack</a> (one end only)",
    "k-th of a window, not max/min &rarr; two heaps or a policy-based tree",
    "Need floor/ceiling of arbitrary keys &rarr; " +
      "<a href=\"treemap-treeset-patterns.html\">TreeMap</a>",
    "Single running max with no expiry &rarr; a variable, not a deque",
  ],
  table: [
    ["sliding window maximum", "Decreasing deque of indices", "LC 239"],
    ["window min", "Increasing deque", "Same template, flipped cmp"],
    ["max-min \u2264 limit", "Two deques, grow/shrink r and l", "LC 1438"],
    ["shortest subarray sum \u2265 k", "Increasing deque of prefixes", "LC 862"],
    ["dp[i] = a[i] + max(dp[i-k..i-1])", "Deque of dp indices", "LC 1696"],
    ["BFS / level order", "FIFO ArrayDeque of nodes", "Trees / graphs"],
    ["<strong>Confused with:</strong> monotonic stack",
      "Stack has no cheap front-expiry; windows need a deque",
      "If candidates only die by domination, a stack suffices"],
  ],
  constraint: "<code>n &le; 10&#8309;</code>, window k up to n: the deque must be O(n), not " +
    "O(n log k). Prefix sums for LC 862 need <code>long</code>. Use ArrayDeque, not LinkedList " +
    "(cache) and not Stack.",
  core: [
    "Maintain indices with a[dq] strictly decreasing. For each i: pop back while " +
      "<code>a[dq.peekLast()] \u2264 a[i]</code> (i is better and newer); push i; pop front " +
      "while <code>dq.peekFirst() \u2264 i-k</code> (expired). The answer for window ending " +
      "at i is <code>a[dq.peekFirst()]</code>. Push after cleaning so the new index is live.",
    "For prefix-minima (shortest subarray sum \u2265 k): the deque holds increasing prefixes. " +
      "If <code>P[i] - P[dq.front] \u2265 k</code>, the front can be popped as a candidate " +
      "start (later starts only make the subarray shorter once this one already works). " +
      "Negatives make sliding-window-on-values illegal; the deque on prefixes is the repair.",
  ],
  invariant: "<p>The deque is increasing in index and decreasing in value (for window max):</p>" +
    "<span class=\"eq\">idx0 &lt; idx1 &lt; \u2026 and a[idx0] \u2265 a[idx1] \u2265 \u2026 , " +
    "all idx in (i-k, i]</span>" +
    "<p>Interview sentence: <em>\"Front is the max of the live window; back pops everyone " +
    "the new arrival dominates.\"</em></p>",
  array: [1, 3, -1, -3, 5, 3, 6, 7],
  vars: ["i", "window", "deque", "max"],
  frames: [
    { note: "Window k=3 on [1,3,-1,-3,5,3,6,7]. i=0, push 0. Deque [0].",
      active: [0], dim: [1, 2, 3, 4, 5, 6, 7],
      values: { i: 0, window: "[1]", deque: "[0]", max: "\u2014" } },
    { note: "i=1, a=3 \u2265 1, pop 0, push 1. Deque [1].",
      active: [1], dim: [2, 3, 4, 5, 6, 7],
      values: { i: 1, window: "[1,3]", deque: "[1]", max: "\u2014" } },
    { note: "i=2, a=-1 < 3, push 2. First full window: max = a[1]=3.",
      window: [0, 2], best: [1],
      values: { i: 2, window: "[1,3,-1]", deque: "[1,2]", max: 3 } },
    { note: "i=3, a=-3. Push 3. Front 1 is still in window (3-3=0, 1>0). Max still 3.",
      window: [1, 3], best: [1],
      values: { i: 3, window: "[3,-1,-3]", deque: "[1,2,3]", max: 3 } },
    { note: "i=4, a=5. Pop back -3,-1,3 (all \u2264 5). Front 1 expires (1\u22644-3). Push 4. Max=5.",
      window: [2, 4], best: [4],
      values: { i: 4, window: "[-1,-3,5]", deque: "[4]", max: 5 } },
    { note: "i=5, a=3 < 5, push 5. Max=5. Then 6 and 7 will drain the deque to a new max each time.",
      window: [3, 5], best: [4],
      values: { i: 5, window: "[-3,5,3]", deque: "[4,5]", max: 5 } },
    { note: "Finish: windows maxima [3,3,5,5,6,7]. Each index entered and left the deque at most once.",
      done: [0, 1, 2, 3, 4, 5, 6, 7],
      values: { i: "done", window: "all", deque: "[7]", max: "[3,3,5,5,6,7]" } },
  ],
  mermaid: `flowchart TD
  q["queue-shaped question"] --> kind{"FIFO, or window max/min?"}
  kind -- FIFO --> bfs["ArrayDeque addLast / pollFirst"]
  kind -- window agg --> which{"max/min, or k-th?"}
  which -- max or min --> dq["monotonic deque of indices"]
  which -- k-th --> heap["wrong page: two heaps / TreeMap"]
  dq --> ends["pop front by age, pop back by domination"]
  kind -- two stacks --> impl["implement queue with two deques"]`,
  merTitle: "Queue vs monotonic deque",
  steps: [
    "<strong>Window max:</strong> decreasing deque of indices.",
    "<strong>For each i:</strong> pop back while a[back] \u2264 a[i].",
    "<strong>Push i.</strong> Then pop front while front \u2264 i-k.",
    "<strong>Record</strong> a[peekFirst] once i \u2265 k-1.",
    "<strong>Prefix variant:</strong> increasing deque of P[i]; pop front when P[i]-P[front] \u2265 k.",
    "<strong>BFS:</strong> addLast / pollFirst; never mix with peekLast unless it is a 0-1 BFS.",
    "<strong>ArrayDeque</strong>, 4-space, long for prefix sums.",
  ],
  code: [
    { tab: "Brute window", file: "WindowBrute.java",
      intro: "Scan each window. O(nk). Fine for teaching, dead at n=1e5, k=n/2.",
      code: `import java.util.Arrays;

public class WindowBrute {
    static int[] maxSliding(int[] a, int k) {
        int n = a.length;
        int[] ans = new int[n - k + 1];
        for (int i = 0; i + k <= n; i++) {
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
            maxSliding(new int[] {1, 3, -1, -3, 5, 3, 6, 7}, 3)));
    }
    // Input : [1,3,-1,-3,5,3,6,7], k=3
    // Output: [3, 3, 5, 5, 6, 7]
}` },
    { tab: "Optimal deque", file: "MonoDeque.java",
      intro: "Sliding-window max in O(n). Front is the answer; back is the insertion end.",
      code: `import java.util.ArrayDeque;
import java.util.Arrays;

public class MonoDeque {
    static int[] maxSliding(int[] a, int k) {
        int n = a.length;
        int[] ans = new int[n - k + 1];
        ArrayDeque<Integer> dq = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            while (!dq.isEmpty() && a[dq.peekLast()] <= a[i]) {
                dq.pollLast();
            }
            dq.addLast(i);
            if (dq.peekFirst() <= i - k) {
                dq.pollFirst();
            }
            if (i >= k - 1) {
                ans[i - k + 1] = a[dq.peekFirst()];
            }
        }
        return ans;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(
            maxSliding(new int[] {1, 3, -1, -3, 5, 3, 6, 7}, 3)));
    }
    // Input : [1, 3, -1, -3, 5, 3, 6, 7], k=3
    // Output: [3, 3, 5, 5, 6, 7]
}` },
    { tab: "Template", file: "ShortestSubarray.java",
      intro: "LC 862: increasing deque of prefix indices. Negatives make a plain window illegal.",
      code: `import java.util.ArrayDeque;

public class ShortestSubarray {
    static int shortest(int[] a, int k) {
        int n = a.length;
        long[] p = new long[n + 1];
        for (int i = 0; i < n; i++) {
            p[i + 1] = p[i] + a[i];
        }
        int best = n + 1;
        ArrayDeque<Integer> dq = new ArrayDeque<>();
        for (int i = 0; i <= n; i++) {
            while (!dq.isEmpty() && p[i] - p[dq.peekFirst()] >= k) {
                best = Math.min(best, i - dq.pollFirst());
            }
            while (!dq.isEmpty() && p[dq.peekLast()] >= p[i]) {
                dq.pollLast();
            }
            dq.addLast(i);
        }
        return best <= n ? best : -1;
    }

    public static void main(String[] args) {
        System.out.println(shortest(new int[] {1}, 1));
        System.out.println(shortest(new int[] {1, 2}, 4));
        System.out.println(shortest(new int[] {2, -1, 2}, 3));
    }
    // Input : [1] k=1; [1,2] k=4; [2,-1,2] k=3
    // Output: 1
    //         -1
    //         3
}` },
  ],
  complexity: {
    time: "O(n) amortised",
    space: "O(k) for a window of size k, O(n) worst case",
    derivation: [
      "<p>Each index is pushed at most once and popped at most once from each end:</p>" +
        "<span class=\"eq\">T(n) = \u0398(n)</span>",
      "<p>A heap of size k is O(n log k) and cannot delete the expired max without a lazy " +
        "deletion map. The deque wins whenever you only need min or max, not k-th.</p>",
    ],
    compare: [
      ["Scan each window", "O(n k)", "O(1)", "k tiny"],
      ["Heap + lazy delete", "O(n log n)", "O(n)", "Works; heavier"],
      ["Monotonic deque", "O(n)", "O(k)", "Window max/min default"],
      ["TreeMap of window", "O(n log k)", "O(k)", "When you need min and max, or k-th"],
      ["Monotonic stack", "O(n)", "O(n)", "No age expiry"],
    ],
  },
  pitfalls: [
    { title: "Popping the front with < instead of \u2264 i-k",
      bug: "An index exactly k ago stays and poisons the max.",
      fix: "while peekFirst \u2264 i-k (strictly outside the window of size k ending at i)." },
    { title: "Using < instead of \u2264 when popping the back",
      bug: "Equal values pile up; the older equal expires later and you keep a stale index.",
      fix: "Pop back on \u2264 so the newest equal sits at the front when the older expires." },
    { title: "Recording the max before the window is full",
      bug: "ans[0] written at i=0 for k=3.",
      fix: "Only record when i \u2265 k-1." },
    { title: "Sliding window on values when negatives exist",
      bug: "Two pointers for sum\u2265k is wrong if a[i] can be negative.",
      fix: "Prefix + increasing deque (LC 862), not a shrinkable positive window." },
    { title: "LinkedList as a deque",
      bug: "Pointer chasing, extra objects. Correct but slow in Java.",
      fix: "ArrayDeque. pollFirst/Last, peekFirst/Last, addFirst/Last." },
  ],
  variants: [
    ["Longest window with max-min \u2264 limit",
      "Two deques (max and min); advance r, then advance l until max-min \u2264 limit.",
      "LC 1438. TreeMap of counts also works in n log n.",
      "LC 1438."],
    ["Jump Game VI",
      "dq holds dp indices decreasing in dp; dp[i]=a[i]+dp[front]; expire i-k.",
      "Same template with dp as the array.",
      "LC 1696."],
    ["Moving average / recent calls",
      "Structural FIFO: addLast, pollFirst while expired, peek size.",
      "No monotonicity needed.",
      "LC 346, LC 933."],
  ],
  followups: [
    ["Why not a max-heap of the window?",
      "<p>You can, with lazy deletion of indices \u2264 i-k when they appear at the top. It is " +
      "O(n log n) and more code. The deque is linear and the intended answer.</p>"],
    ["Can the deque store values instead of indices?",
      "<p>Only if you also store the index beside the value (a pair). Age tests need the " +
      "index. A value-only deque cannot tell whether the front has left the window.</p>"],
    ["Shortest subarray with sum \u2265 k and all positives?",
      "<p>Then a two-pointer sliding window on the array itself is enough (prefix is " +
      "increasing). The deque is what you reach for once negatives appear.</p>"],
    ["Implement a queue with two stacks?",
      "<p>Inbox stack for push, outbox stack for pop: dump inbox into outbox when outbox is " +
      "empty. Amortised O(1). ArrayDeque already is a queue; this is the design question.</p>"],
  ],
  problems: [
    { url: "https://leetcode.com/problems/sliding-window-maximum/", name: "Sliding Window Maximum",
      badge: "lc", tag: "LC 239", level: "Hard", pattern: "Decreasing deque of indices" },
    { url: "https://leetcode.com/problems/longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit/", name: "Longest Continuous Subarray Diff \u2264 Limit",
      badge: "lc", tag: "LC 1438", level: "Medium", pattern: "Two deques, max-min" },
    { url: "https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/", name: "Shortest Subarray with Sum at Least K",
      badge: "lc", tag: "LC 862", level: "Hard", pattern: "Increasing deque of prefixes" },
    { url: "https://leetcode.com/problems/jump-game-vi/", name: "Jump Game VI",
      badge: "lc", tag: "LC 1696", level: "Medium", pattern: "Deque of dp indices" },
    { url: "https://leetcode.com/problems/constrained-subsequence-sum/", name: "Constrained Subsequence Sum",
      badge: "lc", tag: "LC 1425", level: "Hard", pattern: "Same as jump VI with max(0, dp)" },
    { url: "https://leetcode.com/problems/moving-average-from-data-stream/", name: "Moving Average from Data Stream",
      badge: "lc", tag: "LC 346", level: "Easy", pattern: "FIFO queue of last k, long sum" },
    { url: "https://leetcode.com/problems/number-of-recent-calls/", name: "Number of Recent Calls",
      badge: "lc", tag: "LC 933", level: "Easy", pattern: "Poll expired, addLast, size" },
    { url: "https://leetcode.com/problems/implement-queue-using-stacks/", name: "Implement Queue using Stacks",
      badge: "lc", tag: "LC 232", level: "Easy", pattern: "Inbox / outbox ArrayDeque" },
    { url: "https://cses.fi/problemset/task/1076", name: "Sliding Window Median",
      badge: "cf", tag: "CSES", level: "Hard", pattern: "Contrast: two heaps, not a max-deque" },
    { url: "https://cses.fi/problemset/task/3226", name: "Sliding Window Maximum",
      badge: "cf", tag: "CSES", level: "Medium", pattern: "Same deque as LC 239, larger n" },
  ],
  spoilers: [
    { summary: "Hint for LC 862 &mdash; two pops, two reasons",
      body: "<p>Front pop: P[r]-P[front] \u2265 k, that left end is used up (later r only makes " +
        "it longer). Back pop: P[r] \u2264 P[back], a later smaller-or-equal prefix is a strictly " +
        "better left end. After both, push r. Miss either pop and you TLE or return a longer answer.</p>" },
    { summary: "Hint for LC 1696 &mdash; DP with a sliding max",
      body: "<p>dp[i] = a[i] + max(dp[i-k..i-1]). That inner max is window-maximum on the dp " +
        "array: decreasing deque of indices, expire i-k. Do not scan k previous states.</p>" },
  ],
  recap: [
    "<strong>Front expires by age</strong>, back by domination.",
    "<strong>Decreasing deque</strong> for window max; increasing for min / prefix.",
    "<strong>Store indices</strong>, pop back on \u2264 so equals do not stale.",
    "<strong>Negatives + range sum</strong> \u2192 prefix deque, not a two-pointer window.",
    "<strong>ArrayDeque</strong> is both the queue and the deque.",
  ],
  oneliner: "while (!dq.isEmpty() && a[dq.peekLast()] <= a[i]) dq.pollLast(); dq.addLast(i);",
}),

/* ======================================== 3. linked-lists =============== */
pack({
  id: "linked-lists",
  difficulty: "Medium",
  readTime: "26 min",
  tagline: "Pointer surgery under a fixed extra-space budget: reverse a range, detect a cycle " +
    "and its entry, merge two ordered lists, and clone a graph that happens to look like a list.",
  tags: ["linked list", "two pointers", "Floyd", "in-place", "P0"],
  prereqs: [["Two Pointers", "../01-arrays-and-windows/two-pointers.html"]],
  why: [
    "Linked-list questions are almost never about the node type. They are about rewriting " +
      "pointers without losing the rest of the list, in O(1) extra memory, on a structure you " +
      "cannot index into. Reverse, reverse k-group, Floyd cycle+entry, merge, copy-random: " +
      "five problems, three moves &mdash; save the next, rewire, advance.",
    "They keep being asked at SDE-2 because they punish sketchy pointer handling the way " +
      "arrays punish off-by-ones. A missed prev drops a suffix. A cycle detector that returns " +
      "the meeting point instead of the entry looks like it works on the sample. A k-group " +
      "reverse that does not check k nodes remain corrupts the tail.",
    "Floyd is the one piece of theory: 1&times; and 2&times; pointers meet inside a cycle; " +
      "reset one to the head and walk both at 1&times; to land on the entry. Copy-random is " +
      "the other classic: HashMap is O(n) space; the weave (clone between originals, wire " +
      "randoms, unweave) is the O(1)-space follow-up.",
  ],
  insight: "Before you rewire curr.next, save it. After you rewire, the old successor is gone " +
    "unless you held it. Every in-place list algorithm is that sentence plus a dummy node to " +
    "delete the head-special-case.",
  yes: [
    "The input is a singly (or doubly) linked list and you must rearrange it in place",
    "\"Reverse the list\" / \"reverse nodes in k-group\" / \"reverse between left and right\"",
    "\"Detect a cycle\" or \"return the node where the cycle begins\"",
    "\"Merge two (or k) sorted lists\"",
    "\"Copy a list that has an extra random pointer\"",
    "\"Find the middle\" / \"delete the n-th from the end\" &mdash; fast and slow pointers",
  ],
  no: [
    "You need order statistics or binary search on the values &rarr; copy to an array, or a tree",
    "Random access by index is the hot path &rarr; ArrayList, not a list of nodes",
    "The \"list\" is actually a graph with branching &rarr; BFS/DFS",
    "k-list merge when k is large &rarr; the heap version on the " +
      "<a href=\"heaps-and-priority-queue.html\">heaps page</a>",
  ],
  table: [
    ["reverse the whole list", "Three pointers: prev, curr, next", "Iterative reverse"],
    ["reverse every k nodes", "Identify a group, reverse, stitch, repeat", "Dummy + groupPrev + k-check"],
    ["does it have a cycle?", "Fast moves 2, slow moves 1", "Floyd detect"],
    ["where does the cycle begin?", "After they meet, reset slow to head, both at 1&times;", "Floyd entry"],
    ["merge two sorted lists", "Dummy + tail, splice the smaller head", "Same as merge in mergesort"],
    ["copy list with random pointer", "Clone a graph: map old\u2192new, or weave", "HashMap, or O(1)-space weave"],
    ["delete n-th from end", "Gap of n between two pointers, then splice", "Dummy so deleting the head is uniform"],
    ["<strong>Confused with:</strong> find the duplicate in an array of n+1 values in 1..n",
      "The array is a functional graph; Floyd still applies",
      "Same algorithm, different wrapper (LC 287)"],
  ],
  constraint: "<code>n &le; 10&#8309;</code> with O(1) extra space is the usual tell. Recursion " +
    "n frames deep blows the Java stack around n = 10&#8308;; prefer iterative reverse.",
  core: [
    "Iterative reverse: prev = null, curr = head. Each step saves nxt = curr.next, sets " +
      "curr.next = prev, then advances prev = curr, curr = nxt. When curr is null, prev is " +
      "the new head. k-group is reverse applied to successive slices, with a dummy so the " +
      "first group is not special. Walk k steps first; if you run out, leave the tail alone.",
    "Floyd: slow and fast start at head. If there is a cycle they meet at some node on the " +
      "cycle, not necessarily the entry. Set slow back to head and walk both one step at a " +
      "time; they meet at the entry. Merge: dummy + tail, attach the smaller head. Copy-random: " +
      "HashMap first; weave if they forbid extra space.",
  ],
  invariant: "<p><strong>Reverse:</strong> the chain from prev backwards is the reversed prefix; " +
    "from curr forwards is untouched.</p>" +
    "<p><strong>Floyd:</strong> after the first meeting, distance(head, entry) equals " +
    "distance(meeting, entry) along the cycle. Walking both at speed 1 from those two starts " +
    "collides at the entry.</p>" +
    "<p>A dummy whose next is the real head makes \"what if we replace the head?\" the same " +
    "code path as every other splice.</p>",
  extra: [
    { kind: "math", title: "Floyd's meeting algebra",
      html: "<p>Stem length a, cycle c, meeting b into the cycle. Slow walked a+b, fast " +
        "2(a+b). The extra a+b is a whole number of laps: a+b = m c, so a = m c - b. From " +
        "the meeting point, c-b more steps reach the entry, which is also a steps from the " +
        "head. Resetting slow to head implements that.</p>" },
  ],
  array: [1, 2, 3, 4, 5],
  arrayLabel: "nodes (original order)",
  vars: ["prev", "curr", "nxt"],
  vizTitle: "In-place reverse of 1\u21922\u21923\u21924\u21925",
  vizIntro: "Cells are node values in original index order. prev / curr / nxt move left to " +
    "right; done cells have already had their next flipped.",
  vizCaption: "Three pointers, five steps, new head is 5. Losing nxt is the only way to drop the suffix.",
  frames: [
    { note: "Start: prev = null, curr = head (1).",
      active: [0], dim: [1, 2, 3, 4],
      values: { prev: "null", curr: 1, nxt: "\u2014" } },
    { note: "Save nxt=2, rewire 1.next=null. Advance: prev=1, curr=2.",
      active: [1], done: [0], dim: [2, 3, 4],
      values: { prev: 1, curr: 2, nxt: 2 } },
    { note: "Save nxt=3, rewire 2.next=1. Advance: prev=2, curr=3.",
      active: [2], done: [0, 1], dim: [3, 4],
      values: { prev: 2, curr: 3, nxt: 3 } },
    { note: "Save nxt=4, rewire 3.next=2. Advance: prev=3, curr=4.",
      active: [3], done: [0, 1, 2], dim: [4],
      values: { prev: 3, curr: 4, nxt: 4 } },
    { note: "Save nxt=5, rewire 4.next=3. Advance: prev=4, curr=5.",
      active: [4], done: [0, 1, 2, 3],
      values: { prev: 4, curr: 5, nxt: 5 } },
    { note: "Save nxt=null, rewire 5.next=4. curr=null. Return prev=5. List is 5\u21924\u21923\u21922\u21921.",
      best: [4], done: [0, 1, 2, 3],
      values: { prev: 5, curr: "null", nxt: "null" } },
  ],
  mermaid: `flowchart TD
  startNode["slow = fast = head"] --> move["slow plus 1, fast plus 2"]
  move --> nullQ{"fast is null or fast.next is null?"}
  nullQ -- yes --> acyclic["no cycle: return null"]
  nullQ -- no --> meetQ{"slow equals fast?"}
  meetQ -- no --> move
  meetQ -- yes --> reset["slow = head  (fast stays at meeting)"]
  reset --> walk["both plus 1"]
  walk --> entryQ{"slow equals fast?"}
  entryQ -- no --> walk
  entryQ -- yes --> found["this node is the cycle entry"]`,
  merTitle: "Floyd: detect, then find the entry",
  merCaption: "The meeting point is on the cycle. The entry is a second walk. Returning the " +
    "meeting point as the answer is the classic half-solved submission.",
  steps: [
    "<strong>Draw the nodes and next pointers</strong>, including a dummy if the head might change.",
    "<strong>Reverse:</strong> save nxt, rewire curr.next = prev, advance prev, curr. Return prev.",
    "<strong>k-group:</strong> from groupPrev walk k nodes. If fewer remain, stop. Reverse that slice and stitch.",
    "<strong>Floyd detect:</strong> while (fast != null && fast.next != null), slow+1, fast+2.",
    "<strong>Floyd entry:</strong> after they meet, slow = head, both at 1&times; until they meet again.",
    "<strong>Merge:</strong> dummy + tail; attach the smaller of the two heads; drain the rest.",
    "<strong>Copy random:</strong> HashMap old\u2192new in two passes, or weave / unweave.",
  ],
  dryIntro: "Reverse k-group, k=2, on 1\u21922\u21923\u21924\u21925. groupPrev is the node before the group.",
  dryCols: ["groupPrev", "group", "k left?", "list after"],
  dryRows: [
    { cells: ["dummy", "1, 2", "yes", "1-2-3-4-5"], action: "First group is complete." },
    { cells: ["dummy", "1, 2", "reversing", "2-1-3-4-5"], action: "Stitch dummy.next=2, 1.next=3.", change: true },
    { cells: ["1", "3, 4", "yes", "2-1-3-4-5"], action: "Second group is complete." },
    { cells: ["1", "3, 4", "reversing", "2-1-4-3-5"], action: "Stitch 1.next=4, 3.next=5.", change: true },
    { cells: ["3", "5", "no", "2-1-4-3-5"], action: "Fewer than k nodes: stop.", change: true },
  ],
  dryAfter: "<p>Answer 2\u21921\u21924\u21923\u21925. Partial groups stay in original order (LC 25).</p>",
  code: [
    { tab: "Reverse / k-group", file: "ListReverse.java",
      intro: "Three-pointer reverse, then k-group on top of it. The k-check before reversing is what fails on the leftover tail.",
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
            ListNode nxt = curr.next;
            curr.next = prev;
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
            for (int i = 0; i < k && kth != null; i++) kth = kth.next;
            if (kth == null) break;
            ListNode groupNext = kth.next;
            ListNode prev = groupNext, curr = groupPrev.next;
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
}` },
    { tab: "Floyd + merge", file: "ListFloyd.java",
      intro: "Cycle detection, cycle entry, and merge of two sorted lists. Returning the meeting point as the entry is the bug this tab exists to prevent.",
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

    static ListNode detectCycle(ListNode head) {
        ListNode slow = head, fast = head;
        boolean met = false;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) { met = true; break; }
        }
        if (!met) return null;
        slow = head;
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
            else { tail.next = b; b = b.next; }
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
        n1.next = n2; n2.next = n3; n3.next = n4; n4.next = n2;
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
}` },
    { tab: "Copy random", file: "CopyRandom.java",
      intro: "O(n) space with a map first. The weave is the O(1)-space follow-up: clone after each original, wire randoms via orig.random.next, then split.",
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
        for (Node p = head; p != null; p = p.next) map.put(p, new Node(p.val));
        for (Node p = head; p != null; p = p.next) {
            map.get(p).next = map.get(p.next);
            map.get(p).random = map.get(p.random);
        }
        return map.get(head);
    }

    static Node copyWeave(Node head) {
        if (head == null) return null;
        for (Node p = head; p != null; p = p.next.next) {
            Node cl = new Node(p.val);
            cl.next = p.next;
            p.next = cl;
        }
        for (Node p = head; p != null; p = p.next.next) {
            if (p.random != null) p.next.random = p.random.next;
        }
        Node dummy = new Node(0), tail = dummy;
        for (Node p = head; p != null; p = p.next) {
            tail.next = p.next;
            tail = tail.next;
            p.next = p.next.next;
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
}` },
  ],
  complexity: {
    time: "O(n) for reverse, Floyd, merge of two, copy",
    space: "O(1) extra for reverse / Floyd / merge / weave; O(n) for the HashMap copy",
    derivation: [
      "<p>Reverse and k-group visit each node a constant number of times. Floyd: fast walks at " +
        "most twice the stem plus cycle, then both walk the stem:</p>" +
        "<span class=\"eq\">T(n) = \u0398(n) pointer assignments</span>",
      "<p>Merge of two lists is \u0398(n+m). Merge of k lists by a heap is O(n log k) on the " +
        "heaps page. Copy-random is two or three linear passes.</p>",
    ],
    compare: [
      ["Iterative reverse", "O(n)", "O(1)", "Default; does not blow the stack"],
      ["Recursive reverse", "O(n)", "O(n) frames", "Fine for tiny n; not for 1e5"],
      ["Floyd detect + entry", "O(n)", "O(1)", "Do not return the meeting point"],
      ["HashSet of seen nodes", "O(n)", "O(n)", "Detect only; wastes the O(1) follow-up"],
      ["Merge two lists", "O(n+m)", "O(1)", "Dummy + tail"],
      ["Copy random, HashMap", "O(n)", "O(n)", "Write this first"],
      ["Copy random, weave", "O(n)", "O(1) extra", "The follow-up"],
    ],
  },
  pitfalls: [
    { title: "Rewiring curr.next before saving it",
      bug: "The suffix becomes unreachable. Works on one node, fails on everything else.",
      fix: "ListNode nxt = curr.next as the first line. Save, rewire, advance." },
    { title: "Returning Floyd's meeting point as the cycle entry",
      bug: "LC 141 is done, LC 142 is not. Meeting point equals the entry only when stem length is a multiple of the cycle.",
      fix: "Reset slow to head, walk both at 1\u00d7, return the second meeting." },
    { title: "Reversing a leftover tail in k-group",
      bug: "A final group of size < k is reversed. The spec says leave it.",
      fix: "Walk k steps from groupPrev; if you hit null, break before reversing." },
    { title: "Forgetting the dummy when the head can change",
      bug: "Merge, delete-head, k-group first group: you return the old head, now in the middle.",
      fix: "ListNode dummy = new ListNode(0, head); return dummy.next." },
    { title: "Comparing node values instead of references in Floyd",
      bug: "slow.val == fast.val on a list with duplicates. False cycle, or a missed one.",
      fix: "Compare the node objects: slow == fast." },
    { title: "Breaking the original list in the weave copy",
      bug: "clone.random wired to an original, or the caller's list left interleaved with clones.",
      fix: "clone.random = orig.random.next. Restore orig.next = clone.next in the split pass." },
  ],
  variants: [
    ["Reverse a sublist [left, right] (LC 92)",
      "Walk to left-1, reverse the next (right-left+1) nodes, stitch.",
      "Same three-pointer reverse, bounded by a count.",
      "LC 92"],
    ["Palindrome list (LC 234)",
      "Slow/fast to the middle, reverse the second half, compare, optionally restore.",
      "ListNode second = reverse(slow.next);",
      "LC 234"],
    ["Intersection of two lists (LC 160)",
      "When one pointer hits null, jump to the other list's head. They meet at the intersection or at null.",
      "if (p == null) p = headB; else p = p.next;",
      "LC 160"],
    ["Reorder list 1,n,2,n-1 (LC 143)",
      "Middle, reverse second half, merge-interleave. Three primitives from this page composed.",
      "LC 143"],
  ],
  followups: [
    ["Why does resetting one pointer to the head find the entry?",
      "<p>After the first meeting, slow has walked a+b and that is a multiple of the cycle. " +
      "So a more steps from the meeting point land on the entry, which is also a steps from " +
      "the head. Walking both at speed 1 from those two starts implements the equality.</p>"],
    ["Can Floyd find a duplicate number in an array?",
      "<p>Yes, LC 287. An array a of n+1 values in 1..n is a functional graph i \u2192 a[i]. " +
      "The cycle entry is the duplicate. Same code with slow = a[slow] and fast = a[a[fast]].</p>"],
    ["How do you reverse groups of k if k does not divide n?",
      "<p>Leave the leftover tail in original order (LC 25). From the node before the would-be " +
      "group, try to walk k steps; if you cannot, stop. Test n=5 k=3, n=5 k=1, n=5 k=5.</p>"],
    ["Map vs weave for copy-random in 25 minutes?",
      "<p>The map. Two obvious passes, O(n) extra. Mention the weave as the O(1)-space " +
      "follow-up and write it if they ask.</p>"],
    ["How do you merge k sorted lists?",
      "<p>A min-heap of the current heads, O(n log k). Pairwise tournament merge is the same " +
      "bound. Repeatedly merging into an accumulator is O(n k). Details on the " +
      "<a href=\"heaps-and-priority-queue.html\">heaps page</a>.</p>"],
  ],
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
    { url: "https://leetcode.com/problems/sort-list/", name: "Sort List",
      badge: "lc", tag: "LC 148", level: "Medium", pattern: "Mergesort: middle split + merge two" },
    { url: "https://leetcode.com/problems/find-the-duplicate-number/", name: "Find the Duplicate Number",
      badge: "lc", tag: "LC 287", level: "Medium", pattern: "Floyd on the functional graph of an array" },
  ],
  spoilers: [
    { summary: "Hint for LC 25 &mdash; reverse a slice with prev initialised to groupNext",
      body: "<p>Reverse in place between groupPrev.next and groupNext by running the standard " +
        "reverse with prev initialised to groupNext (not null). Then every node's next already " +
        "points at the correct successor, including the tail wiring to the next group. After " +
        "the loop, the old group head is the new tail and the k-th node is the new head.</p>" },
    { summary: "Hint for LC 138 weave &mdash; random of a clone is next of random of original",
      body: "<p>After the weave the list is A \u2192 A' \u2192 B \u2192 B'. The clone of X sits " +
        "at X.next, so the clone of X.random sits at X.random.next. The split pass must restore " +
        "A.next = B as well as collect A', otherwise you destroy the input.</p>" },
  ],
  recap: [
    "<strong>Save, rewire, advance.</strong> Lose nxt and you lose the suffix.",
    "<strong>Dummy node</strong> whenever the head might change (merge, k-group, delete).",
    "<strong>Floyd detect is not Floyd entry.</strong> Reset slow to head, walk both at 1\u00d7.",
    "<strong>k-group:</strong> walk k first; leftover tail stays in original order.",
    "<strong>Copy random:</strong> HashMap first; weave if they forbid extra space.",
  ],
  oneliner: "nxt = curr.next; curr.next = prev; prev = curr; curr = nxt;",
}),

/* ================================ 4. heaps-and-priority-queue ========== */
pack({
  id: "heaps-and-priority-queue",
  difficulty: "Medium",
  readTime: "26 min",
  tagline: "A binary heap is an array with parent-child arithmetic: sift in O(log n), heapify " +
    "in O(n), and the interview patterns are k-largest, merge-k, two-heap median, and lazy deletion.",
  tags: ["heap", "priority queue", "heapify", "median", "P0"],
  prereqs: [
    ["Complexity Analysis", "../00-foundations/complexity-analysis.html"],
    ["K-th Element & Selection", "../01-arrays-and-windows/kth-and-selection.html"],
  ],
  why: [
    "A heap gives the current min (or max) in O(1) and insert / delete-min in O(log n). " +
      "Problems that look like sorting but only need the extreme of a live set \u2014 k largest, " +
      "merge k sorted lists, running median \u2014 are heap problems. Arrays.sort costs an extra " +
      "log you often do not have to pay, and does not work at all on a stream.",
    "Two facts separate people who have used PriorityQueue from people who understand it. " +
      "First, heapify is O(n), not O(n log n): sift down from the last parent, and the geometric " +
      "series of subtree heights sums to less than 2n. Second, Java's PriorityQueue cannot " +
      "delete an arbitrary element in log time, so \"remove this later\" is lazy deletion: leave " +
      "it in the heap and skip it when it shows up at the top.",
    "The two-heap median combines both. A max-heap of the lower half and a min-heap of the " +
      "upper half, kept within one of size, gives the median in O(1) and insertions in O(log n). " +
      "Sliding-window median adds lazy deletion on top.",
  ],
  insight: "A heap answers \"what is the best of a live set?\" in logarithmic updates. If you " +
    "need the k-th, keep a heap of size k or two heaps that split at the median. If you need " +
    "to delete from the middle, fake it with lazy skipping.",
  yes: [
    "\"k largest / k smallest / k closest\" on an unsorted array or a stream",
    "\"merge k sorted lists\" (or k sorted arrays)",
    "\"find median from a data stream\" / \"sliding window median\"",
    "Scheduling: always process the currently best (earliest, cheapest, highest-profit) item",
    "A live set that grows and shrinks, and you must answer after every insertion",
  ],
  no: [
    "Maximum of a sliding window and k is the window size, not an order statistic \u2192 " +
      "<a href=\"queues-and-monotonic-deque.html\">monotonic deque</a> in O(n)",
    "The array is static and you need k-th once \u2192 " +
      "<a href=\"../01-arrays-and-windows/kth-and-selection.html\">quickselect</a>",
    "You need floor/ceiling/range of keys, not just min \u2192 " +
      "<a href=\"treemap-treeset-patterns.html\">TreeMap</a>",
    "Graph shortest paths with negative weights \u2192 Bellman-Ford, not Dijkstra's heap",
  ],
  table: [
    ["k largest elements", "Live set of size k, evict the smallest", "Min-heap of size k"],
    ["k closest points", "Same, ordered by distance", "Max-heap of size k, or quickselect"],
    ["merge k sorted lists", "Best current head among k", "Min-heap of list heads"],
    ["median of a stream", "Need the middle, not the extreme", "Max-heap lo + min-heap hi"],
    ["sliding window median", "Median plus expiry", "Two heaps + lazy deletion"],
    ["reorganise string / task scheduler", "Always pick the currently most frequent", "Max-heap of counts"],
    ["<strong>Confused with:</strong> sliding-window maximum",
      "You need the extreme of a range, not of a dynamic set of size k",
      "Monotonic deque, O(n), not a heap"],
  ],
  constraint: "<code>n &le; 10&#8309;</code> with k-largest or a stream of operations is the " +
    "heap signature. n log n sort is the fallback when k is \u0398(n). Never (a,b) \u2192 b-a " +
    "on ints: overflow. Use Integer.compare or reverseOrder().",
  core: [
    "A binary heap is an array h[0..n) with parent (i-1)/2 and children 2i+1, 2i+2. Min-heap: " +
      "h[parent] \u2264 h[child]. Sift-up after insert, sift-down after removing the root. Both " +
      "O(log n) because height is floor(log n). Heapify builds in O(n) by sifting down from " +
      "n/2-1 to 0. Java PriorityQueue is a min-heap; max-heap via Collections.reverseOrder().",
    "For k-largest, a min-heap of size k is the default: the root is the k-th largest, and " +
      "anything smaller is discarded. Two-heap median: every value in lo (max-heap) is \u2264 " +
      "every value in hi (min-heap), and lo.size() == hi.size() or lo.size() == hi.size()+1. " +
      "Lazy deletion: a Map of stale counts; prune tops before every peek/poll.",
  ],
  invariant: "<p><strong>Heap property:</strong> every parent is at least as extreme as its " +
    "children, so the root is the global extreme.</p>" +
    "<p><strong>k-largest min-heap:</strong> the heap holds the k largest seen so far; its root " +
    "is the smallest of those, i.e. the current k-th.</p>" +
    "<p><strong>Two-heap median:</strong> lo.peek() is the median on an odd count, or average " +
    "the two peeks (even), with a long cast.</p>",
  extra: [
    { kind: "math", title: "Heapify is O(n)",
      html: "<p>Height H = log n. At most n / 2^{h+1} nodes of height h, sifting one costs O(h):</p>" +
        "<span class=\"eq\">T(n) = \u03a3 h \u00b7 n / 2^h &lt; 2n</span>" +
        "<p>Building by n inserts is O(n log n). new PriorityQueue(list) already heapifies.</p>" },
  ],
  array: [3, 2, 1, 5, 6, 4],
  arrayLabel: "incoming stream",
  vars: ["x", "heap", "kth"],
  vizTitle: "K largest with a min-heap of size k = 2",
  vizIntro: "Array [3,2,1,5,6,4], k=2. The heap holds the 2 largest seen; its root is the smaller of those two.",
  vizCaption: "A min-heap of size k, not a max-heap of size n. At the end the root is the 2nd largest, 5.",
  frames: [
    { note: "See 3. Heap not full, insert. Heap [3].",
      active: [0], dim: [1, 2, 3, 4, 5],
      values: { x: 3, heap: "[3]", kth: "\u2014" } },
    { note: "See 2. Insert. Min-heap [2, 3], root 2.",
      active: [1], done: [0], dim: [2, 3, 4, 5],
      values: { x: 2, heap: "[2, 3]", kth: 2 } },
    { note: "See 1. Heap full and 1 < root, discard.",
      active: [2], x: [2], done: [0, 1], dim: [3, 4, 5],
      values: { x: 1, heap: "[2, 3]", kth: 2 } },
    { note: "See 5. 5 > 2, evict 2, insert 5. Heap [3, 5], root 3.",
      active: [3], done: [0, 1, 2], dim: [4, 5],
      values: { x: 5, heap: "[3, 5]", kth: 3 } },
    { note: "See 6. 6 > 3, evict 3, insert 6. Heap [5, 6], root 5.",
      active: [4], done: [0, 1, 2, 3], dim: [5],
      values: { x: 6, heap: "[5, 6]", kth: 5 } },
    { note: "See 4. 4 < 5, discard. Answer: k-th largest is the root 5. O(n log k), not O(n log n).",
      active: [5], x: [5], best: [3, 4], done: [0, 1, 2],
      values: { x: 4, heap: "[5, 6]", kth: 5 } },
  ],
  mermaid: `flowchart TD
  need["need the best of a live set"] --> which{"what is best?"}
  which -- min or max --> size{"how many do you keep?"}
  size -- "exactly k" --> kHeap["heap of size k, opposite polarity to the answer"]
  size -- all --> pq["PriorityQueue of everything"]
  which -- median --> two["max-heap lo plus min-heap hi"]
  which -- "k-th once, static array" --> sel["quickselect, not a heap"]
  which -- "window max, not k-th" --> dq["monotonic deque"]
  two --> expire{"do values expire later?"}
  expire -- yes --> lazy["two heaps plus a stale-count map"]
  expire -- no --> stream["offer, rebalance, peek"]`,
  merTitle: "Which heap, and of what size?",
  steps: [
    "<strong>Name the live set and the order.</strong> Min-heap or max-heap? Size k or n or two halves?",
    "<strong>For k-largest:</strong> min-heap of size k. Offer x; if size > k, poll. Root is the k-th.",
    "<strong>For merge-k:</strong> min-heap of current heads (the node, so you can advance next).",
    "<strong>For stream median:</strong> offer into lo or hi, then rebalance sizes to differ by at most one.",
    "<strong>For expiry:</strong> do not call remove. Increment a stale counter and skip tops in prune().",
    "<strong>Build from an array with heapify</strong> (sift down from n/2-1), not n inserts.",
    "<strong>Comparators:</strong> Integer.compare or reverseOrder(), never subtraction.",
  ],
  code: [
    { tab: "Brute (sort)", file: "KthSort.java",
      intro: "Always mention it. For a one-shot k-th on a static array, sort is honest. For a stream, it is illegal.",
      code: `import java.util.Arrays;

public class KthSort {
    static int kthLargest(int[] a, int k) {
        int[] b = a.clone();
        Arrays.sort(b);
        return b[b.length - k];
    }

    public static void main(String[] args) {
        System.out.println(kthLargest(new int[] {3, 2, 1, 5, 6, 4}, 2));
    }
    // Input : [3,2,1,5,6,4], k = 2
    // Output: 5
}` },
    { tab: "Optimal heap", file: "HeapsAndPQ.java",
      intro: "K-largest with a size-k min-heap, in-place max-heapify, and merge-k lists.",
      code: `import java.util.ArrayList;
import java.util.List;
import java.util.PriorityQueue;

public class HeapsAndPQ {
    static class ListNode {
        int val;
        ListNode next;
        ListNode(int v) { val = v; }
        ListNode(int v, ListNode n) { val = v; next = n; }
    }

    static int kthLargest(int[] a, int k) {
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        for (int x : a) {
            pq.offer(x);
            if (pq.size() > k) pq.poll();
        }
        return pq.peek();
    }

    static void heapify(int[] h) {
        for (int i = h.length / 2 - 1; i >= 0; i--) siftDown(h, i, h.length);
    }

    static void siftDown(int[] h, int i, int n) {
        while (true) {
            int l = 2 * i + 1, r = l + 1, best = i;
            if (l < n && h[l] > h[best]) best = l;
            if (r < n && h[r] > h[best]) best = r;
            if (best == i) break;
            int tmp = h[i]; h[i] = h[best]; h[best] = tmp;
            i = best;
        }
    }

    static ListNode mergeK(ListNode[] lists) {
        PriorityQueue<ListNode> pq =
            new PriorityQueue<>((a, b) -> Integer.compare(a.val, b.val));
        for (ListNode h : lists) if (h != null) pq.offer(h);
        ListNode dummy = new ListNode(0), tail = dummy;
        while (!pq.isEmpty()) {
            ListNode n = pq.poll();
            tail.next = n;
            tail = n;
            if (n.next != null) pq.offer(n.next);
        }
        return dummy.next;
    }

    static String str(ListNode h) {
        List<Integer> v = new ArrayList<>();
        for (; h != null; h = h.next) v.add(h.val);
        return v.toString();
    }

    public static void main(String[] args) {
        System.out.println(kthLargest(new int[] {3, 2, 1, 5, 6, 4}, 2));
        int[] h = {4, 10, 3, 5, 1};
        heapify(h);
        System.out.println(java.util.Arrays.toString(h));
        ListNode a = new ListNode(1, new ListNode(4, new ListNode(5)));
        ListNode b = new ListNode(1, new ListNode(3, new ListNode(4)));
        ListNode c = new ListNode(2, new ListNode(6));
        System.out.println(str(mergeK(new ListNode[] {a, b, c})));
    }
    // Input : k-th [3,2,1,5,6,4] k=2; heapify [4,10,3,5,1]; lists 1->4->5, 1->3->4, 2->6
    // Output: 5
    //         [10, 5, 3, 4, 1]
    //         [1, 1, 2, 3, 4, 4, 5, 6]
}` },
    { tab: "Template", file: "MedianFinder.java",
      intro: "Two-heap median plus a prune helper for lazy deletion (sliding-window median).",
      code: `import java.util.Collections;
import java.util.Map;
import java.util.PriorityQueue;

public class MedianFinder {
    final PriorityQueue<Integer> lo = new PriorityQueue<>(Collections.reverseOrder());
    final PriorityQueue<Integer> hi = new PriorityQueue<>();

    void add(int x) {
        if (lo.isEmpty() || x <= lo.peek()) lo.offer(x);
        else hi.offer(x);
        rebalance();
    }

    void rebalance() {
        if (lo.size() > hi.size() + 1) hi.offer(lo.poll());
        else if (hi.size() > lo.size()) lo.offer(hi.poll());
    }

    double median() {
        if (lo.size() > hi.size()) return lo.peek();
        return ((long) lo.peek() + hi.peek()) / 2.0;
    }

    /** Skip cancelled tops. Each insertion is skipped at most once. */
    static void prune(PriorityQueue<Integer> pq, Map<Integer, Integer> stale) {
        while (!pq.isEmpty() && stale.getOrDefault(pq.peek(), 0) > 0) {
            int v = pq.poll();
            if (stale.merge(v, -1, Integer::sum) == 0) stale.remove(v);
        }
    }

    public static void main(String[] args) {
        MedianFinder mf = new MedianFinder();
        mf.add(1);
        System.out.println(mf.median());
        mf.add(2);
        System.out.println(mf.median());
        mf.add(3);
        System.out.println(mf.median());
    }
    // Input : add 1, add 2, add 3
    // Output: 1.0
    //         1.5
    //         2.0
}` },
  ],
  complexity: {
    time: "O(n log k) for k-largest; O(n) heapify; O(n log k) merge-k; O(log n) per median insert",
    space: "O(k) for k-largest; O(n) for a full heap or two-heap median",
    derivation: [
      "<p>K-largest: n offers into a heap of size at most k:</p>" +
        "<span class=\"eq\">T(n, k) = n log k</span>",
      "<p>Heapify: \u03a3 h \u00b7 n / 2^h &lt; 2n. Merge-k: n polls on a heap of size k. " +
        "Lazy deletion is amortised O(1) extra polls per inserted element.</p>",
    ],
    compare: [
      ["Sort, then pick", "O(n log n)", "O(n)", "One-shot, k ~ n, no stream"],
      ["Min-heap of size k", "O(n log k)", "O(k)", "k-largest on an array or stream"],
      ["Quickselect", "O(n) expected", "O(1) extra", "One-shot k-th, mutable array"],
      ["Heapify + k delete-max", "O(n + k log n)", "O(1) extra", "When you already own the array"],
      ["Merge k lists, heap", "O(n log k)", "O(k)", "The default"],
      ["Two-heap median", "O(log n) / insert", "O(n)", "Stream median"],
    ],
  },
  pitfalls: [
    { title: "Max-heap via (a, b) \u2192 b - a",
      bug: "Overflow on large magnitudes. The comparator contract breaks silently.",
      fix: "new PriorityQueue<>(Collections.reverseOrder()) or Integer.compare(b, a)." },
    { title: "Min-heap of size n for k-largest",
      bug: "You keep everything and pay n log n. The point is a heap of size k.",
      fix: "Offer, then if (size > k) poll(). Opposite polarity: min-heap for k-largest." },
    { title: "Calling pq.remove(x) in a loop",
      bug: "remove is linear. Inside n operations it is quadratic.",
      fix: "Lazy deletion: a stale-count map and prune-while-top-is-stale." },
    { title: "Forgetting to rebalance the two heaps",
      bug: "Sizes drift by more than one. Median is a wrong peek, often passing the first two ops.",
      fix: "After every offer: if lo.size() > hi.size()+1 move lo\u2192hi; if hi.size() > lo.size() move hi\u2192lo." },
    { title: "Averaging two ints without long",
      bug: "(lo.peek() + hi.peek()) / 2.0 overflows int before the promotion to double.",
      fix: "((long) lo.peek() + hi.peek()) / 2.0." },
    { title: "Heapifying by n inserts",
      bug: "You tell the interviewer build is O(n log n). It can be O(n).",
      fix: "Sift down from n/2-1. Sketch the geometric series." },
  ],
  variants: [
    ["K smallest", "Max-heap of size k; evict when the new value is smaller than the root.",
      "PriorityQueue<Integer> pq = new PriorityQueue<>(Collections.reverseOrder());", "Symmetric to LC 215"],
    ["K closest points (LC 973)", "Max-heap of size k ordered by distance, or quickselect on distance.",
      "pq.offer(p); if (pq.size() > k) pq.poll();", "LC 973"],
    ["Task scheduler / reorganise string", "Max-heap of remaining counts; a cooldown queue of (count, readyTime).",
      "pq.offer(count); wait.offer(new int[] {count-1, time+n});", "LC 621, LC 767"],
    ["Sliding window median (LC 480)", "Two heaps plus lazy deletion of a[l]. Size accounting must ignore stale elements.",
      "delayRemove(a[l]); prune both heaps; rebalance live sizes.", "LC 480"],
  ],
  followups: [
    ["Why is a min-heap the right polarity for k-largest?",
      "<p>You want to evict the smallest of the k candidates whenever a larger value arrives. " +
      "The extreme you need to evict is therefore the min of the live set. The root at the end " +
      "is the smallest of the k largest, which is the k-th largest.</p>"],
    ["Prove heapify is O(n).",
      "<p>At height h there are at most n/2^{h+1} nodes, each costing O(h). Sum h\u00b7n/2^h " +
      "converges to 2n because Sum h x^h = x/(1-x)^2 at x=1/2. Quoting \"geometric series of " +
      "heights\" is the short version.</p>"],
    ["How do you delete from a PriorityQueue in log time?",
      "<p>You do not. remove(x) is linear. Options: lazy deletion with a stale map; wrap " +
      "entries with a dead flag; use TreeMap if you also need floor/ceiling; write your own " +
      "heap with an index map for decrease-key. In interviews, lazy deletion is expected for " +
      "window-median and Dijkstra-without-decrease-key.</p>"],
    ["When is quickselect better than a heap for k-th?",
      "<p>When the array is mutable, you need one k-th, and you do not need the k elements as " +
      "a set. Expected O(n). Heaps are deterministic O(n log k), work on streams, and return " +
      "the k elements. Lead with the heap in a design-flavoured interview.</p>"],
  ],
  problems: [
    { url: "https://leetcode.com/problems/kth-largest-element-in-an-array/", name: "Kth Largest Element in an Array",
      badge: "lc", tag: "LC 215", level: "Medium", pattern: "Min-heap of size k, or quickselect" },
    { url: "https://leetcode.com/problems/merge-k-sorted-lists/", name: "Merge k Sorted Lists",
      badge: "lc", tag: "LC 23", level: "Hard", pattern: "Min-heap of current heads" },
    { url: "https://leetcode.com/problems/find-median-from-data-stream/", name: "Find Median from Data Stream",
      badge: "lc", tag: "LC 295", level: "Hard", pattern: "Two heaps, rebalance after each add" },
    { url: "https://leetcode.com/problems/sliding-window-median/", name: "Sliding Window Median",
      badge: "lc", tag: "LC 480", level: "Hard", pattern: "Two heaps + lazy deletion" },
    { url: "https://leetcode.com/problems/top-k-frequent-elements/", name: "Top K Frequent Elements",
      badge: "lc", tag: "LC 347", level: "Medium", pattern: "Min-heap of size k on frequencies" },
    { url: "https://leetcode.com/problems/k-closest-points-to-origin/", name: "K Closest Points to Origin",
      badge: "lc", tag: "LC 973", level: "Medium", pattern: "Max-heap of size k by distance" },
    { url: "https://leetcode.com/problems/task-scheduler/", name: "Task Scheduler",
      badge: "lc", tag: "LC 621", level: "Medium", pattern: "Max-heap of counts + cooldown" },
    { url: "https://leetcode.com/problems/reorganize-string/", name: "Reorganize String",
      badge: "lc", tag: "LC 767", level: "Medium", pattern: "Max-heap of counts; never pick the same twice" },
    { url: "https://leetcode.com/problems/ugly-number-ii/", name: "Ugly Number II",
      badge: "lc", tag: "LC 264", level: "Medium", pattern: "Min-heap of candidates, or three pointers" },
    { url: "https://codeforces.com/problemset/problem/1140/C", name: "Playlist",
      badge: "cf", tag: "CF 1140C", level: "Medium", pattern: "Sort by beauty, min-heap of k lengths" },
    { url: "https://codeforces.com/problemset/problem/1353/D", name: "Constructing the Array",
      badge: "cf", tag: "CF 1353D", level: "Medium", pattern: "Max-heap of empty segments by length" },
  ],
  spoilers: [
    { summary: "Hint for LC 295 &mdash; which heap is allowed to be larger?",
      body: "<p>Convention: lo (max-heap of the lower half) holds one extra, so the median on " +
        "an odd count is lo.peek() with no branch. Insertion: if x \u2264 lo.peek() (or lo is " +
        "empty) offer lo, else offer hi; then rebalance. Even count: average with a long cast. " +
        "Getting the polarity backwards is the usual bug.</p>" },
    { summary: "Hint for LC 480 &mdash; size accounting with stale elements",
      body: "<p>The two heaps' .size() include stale entries, so you cannot rebalance on those " +
        "sizes. Keep integer counters of the live occupancy of each half. Lazy deletion makes " +
        "pq.size() a lie.</p>" },
  ],
  recap: [
    "<strong>Heap = array + parent/child index arithmetic</strong>, property at every parent.",
    "<strong>Heapify is O(n)</strong> by sifting down from the last parent.",
    "<strong>K-largest: min-heap of size k.</strong> K-smallest: max-heap of size k.",
    "<strong>Median: max-heap lo + min-heap hi</strong>, sizes differ by at most one. Average with long.",
    "<strong>No decrease-key:</strong> lazy deletion with a stale map. Never pq.remove in a loop.",
  ],
  oneliner: "pq.offer(x); if (pq.size() > k) pq.poll();  // min-heap of size k is the k-th largest",
}),

/* ================================ 5. treemap-treeset-patterns ========== */
pack({
  id: "treemap-treeset-patterns",
  difficulty: "Medium",
  readTime: "24 min",
  tagline: "Java's red-black tree in a box: floor, ceiling, first/last and subMap turn " +
    "\"nearest key\" and \"live set of intervals\" into O(log n) per operation.",
  tags: ["TreeMap", "TreeSet", "floor", "ceiling", "intervals", "P1"],
  prereqs: [
    ["Heaps & Priority Queue", "heaps-and-priority-queue.html"],
    ["Java for DSA", "../00-foundations/java-for-dsa.html"],
  ],
  why: [
    "A HashMap answers \"is this exact key present?\" and cannot tell you the next key to the " +
      "left. A heap answers \"what is the min?\" and cannot tell you the predecessor of an " +
      "arbitrary value. A balanced BST answers both: floor, ceiling, higher, lower, first, last, " +
      "and a view of a key range. Java ships that tree as TreeMap / TreeSet.",
    "The second cluster is interval bookkeeping. My Calendar, overlapping-range counts, \"can " +
      "I book [s, e)?\": store start \u2192 end in a TreeMap, and the predecessor / successor of " +
      "a query start are the only two intervals that can conflict. Sweep-line problems (covered " +
      "points, skyline) are the same tree with a running counter as the payload.",
    "This is P1 because it is how you write the O(n log n) solution when a deque is too " +
      "specialised and a heap is too weak, and because Codeforces uses it constantly. The Java " +
      "API is the whole skill: floorKey vs lowerKey is closed vs open intervals.",
  ],
  insight: "HashMap is exact match. Heap is current extreme. TreeMap is nearest key and ordered " +
    "range. Floor / ceiling / subMap are the three methods that justify the log n.",
  yes: [
    "\"Closest element to x\", \"contains nearby almost-duplicate\", \"next interval that starts after t\"",
    "Booking / calendar: \"does [s, e) overlap an existing booking?\"",
    "A live ordered set of values with insert, erase, and \"what is the nearest\"",
    "Sweep line: events at coordinates, need the current min/max/count of active items",
    "Sliding window that needs max and min and you would rather write a TreeMap than two deques",
  ],
  no: [
    "Exact-key lookup only \u2192 HashMap, faster and simpler",
    "Only the current min or max, never a predecessor of an arbitrary value \u2192 a " +
      "<a href=\"heaps-and-priority-queue.html\">heap</a>",
    "Window maximum of a fixed array range \u2192 " +
      "<a href=\"queues-and-monotonic-deque.html\">monotonic deque</a> in O(n)",
    "Static range min after build, no updates \u2192 sparse table, not a tree",
  ],
  table: [
    ["largest key \u2264 x", "Predecessor, inclusive", "floorKey(x) / floor(x)"],
    ["smallest key \u2265 x", "Successor, inclusive", "ceilingKey(x) / ceiling(x)"],
    ["strictly less / strictly greater", "Open neighbour", "lowerKey / higherKey"],
    ["book [s, e) if no overlap", "Conflict is floor's end and ceiling's start", "TreeMap start \u2192 end"],
    ["count of covered points on the line", "Sweep + running coverage", "TreeMap coord \u2192 delta"],
    ["max - min of a window \u2264 limit", "Ordered window", "TreeMap of frequencies, or two deques"],
    ["<strong>Confused with:</strong> HashMap",
      "HashMap has no floor/ceiling; TreeMap has no O(1) expected get",
      "Need nearest? Tree. Need exact? Hash."],
  ],
  constraint: "<code>n \u2264 10&#8309;</code> with n ordered inserts plus n predecessor queries " +
    "is the TreeMap signature: O(n log n) is the budget. Null-check floor/ceiling before unboxing.",
  core: [
    "TreeMap&lt;K,V&gt; is a red-black tree of keys. floorKey(x) is the greatest key \u2264 x, or " +
      "null. ceilingKey(x) is the least key \u2265 x. lowerKey / higherKey are the strict versions. " +
      "TreeSet is a TreeMap with dummy values. Null return is \"no such key\"; unboxing it is an NPE.",
    "Interval bookkeeping: store each booked interval as map.put(start, end) with half-open " +
      "[start, end). To test [s, e): prev = floorKey(s), next = ceilingKey(s). Overlap iff prev " +
      "exists and map.get(prev) > s, or next exists and next < e. Two lookups, not a scan. " +
      "subMap is a live view, not a copy.",
  ],
  invariant: "<p>The map's keys are totally ordered. After every put / remove:</p>" +
    "<span class=\"eq\">floor(x) = max { k in keys | k \u2264 x }  (or none)</span>" +
    "<p>For intervals stored as start \u2192 end, the only intervals that can overlap a query " +
    "[s, e) are the predecessor of s and the successor of s. Checking those two is complete.</p>",
  array: [1, 3, 5, 8, 12],
  arrayLabel: "sorted keys in the tree",
  vars: ["query", "floor", "ceiling"],
  vizTitle: "Floor and ceiling on a live ordered set",
  vizIntro: "TreeSet after inserting 1, 3, 5, 8, 12. Queries look up 6, then 5, then 0, then 13.",
  vizCaption: "Floor is the rightmost key on or left of the query; ceiling is the leftmost on or right.",
  frames: [
    { note: "Set is {1, 3, 5, 8, 12}. No query yet.",
      dim: [0, 1, 2, 3, 4],
      values: { query: "\u2014", floor: "\u2014", ceiling: "\u2014" } },
    { note: "Query 6. Floor is 5 (greatest \u2264 6). Ceiling is 8 (least \u2265 6).",
      active: [2, 3], dim: [0, 1, 4],
      values: { query: 6, floor: 5, ceiling: 8 } },
    { note: "Query 5. Floor and ceiling are both 5: the key is present. lower(5)=3, higher(5)=8.",
      best: [2], dim: [0, 1, 3, 4],
      values: { query: 5, floor: 5, ceiling: 5 } },
    { note: "Query 0. Floor is null (nothing \u2264 0). Ceiling is 1. Unboxing floor is an NPE.",
      active: [0], dim: [1, 2, 3, 4],
      values: { query: 0, floor: "null", ceiling: 1 } },
    { note: "Query 12. Floor is 12. Ceiling is 12. higher(12) is null.",
      active: [4], dim: [0, 1, 2, 3],
      values: { query: 12, floor: 12, ceiling: 12 } },
    { note: "Query 13. Floor is 12. Ceiling is null. Remove 5 and query 6 again: floor becomes 3.",
      best: [4], dim: [0, 1, 2, 3],
      values: { query: 13, floor: 12, ceiling: "null" } },
  ],
  mermaid: `flowchart TD
  q["ordered inserts plus queries"] --> query{"what is the query?"}
  query -- "exact key" --> hash["HashMap / HashSet"]
  query -- "current min or max only" --> heap["PriorityQueue"]
  query -- "nearest key, floor or ceiling" --> tree["TreeMap / TreeSet"]
  query -- "all keys in a range" --> sub["TreeMap.subMap"]
  query -- "does interval [s, e) overlap?" --> cal["TreeMap start to end, two probes"]
  query -- "running coverage of the line" --> sweep["TreeMap coord to delta, then scan"]
  tree --> nullCheck["null-check floor/ceiling before unboxing"]`,
  merTitle: "HashMap, heap, or TreeMap?",
  steps: [
    "<strong>Name the key.</strong> What is ordered? Values, start-times, coordinates?",
    "<strong>Pick TreeSet vs TreeMap.</strong> Set if you only need presence and neighbours; map if each key carries a payload.",
    "<strong>Choose floor/ceiling vs lower/higher</strong> from whether equality counts. Null-check before unboxing.",
    "<strong>For intervals:</strong> store [s, e) as start \u2192 end. Probe floorKey(s) and ceilingKey(s).",
    "<strong>For a window of values:</strong> merge(+1) on enter, decrement-and-remove on leave, then lastKey() - firstKey().",
    "<strong>For a sweep:</strong> TreeMap of coordinate \u2192 delta, then iterate entrySet in order.",
    "<strong>Do not iterate the whole map</strong> to find a neighbour.",
  ],
  dryIntro: "My Calendar on an empty map. Book [10,20), [15,25), [20,30). Half-open: the third touches the first and is legal if the second was rejected.",
  dryCols: ["book", "floor", "ceiling", "decision"],
  dryRows: [
    { cells: ["[10, 20)", "null", "null", "put 10\u219220"], action: "Empty map, always ok.", change: true },
    { cells: ["[15, 25)", "10 (end 20)", "null", "reject"], action: "floor's end 20 > 15.", change: true },
    { cells: ["[20, 30)", "10 (end 20)", "null", "put 20\u219230"], action: "20 is not > 20; touching is legal.", change: true },
    { cells: ["[20, 25)", "20 (end 30)", "null", "reject"], action: "Same start as an existing interval." },
    { cells: ["[0, 10)", "null", "10", "put 0\u219210"], action: "ceiling 10 is not < 10.", change: true },
  ],
  code: [
    { tab: "Brute scan", file: "CalendarBrute.java",
      intro: "Store intervals in a list and scan them all. Correct, O(n) per book.",
      code: `import java.util.ArrayList;
import java.util.List;

public class CalendarBrute {
    static class Cal {
        final List<int[]> a = new ArrayList<>();
        boolean book(int s, int e) {
            for (int[] iv : a) {
                if (s < iv[1] && iv[0] < e) return false;
            }
            a.add(new int[] {s, e});
            return true;
        }
    }

    public static void main(String[] args) {
        Cal c = new Cal();
        System.out.println(c.book(10, 20));
        System.out.println(c.book(15, 25));
        System.out.println(c.book(20, 30));
    }
    // Input : book [10,20), [15,25), [20,30)
    // Output: true
    //         false
    //         true
}` },
    { tab: "Optimal TreeMap", file: "CalendarTree.java",
      intro: "Two probes per book. The same skeleton is My Calendar, Exam Room, and most range-conflict questions.",
      code: `import java.util.TreeMap;

public class CalendarTree {
    static class MyCalendar {
        final TreeMap<Integer, Integer> map = new TreeMap<>();

        boolean book(int s, int e) {
            Integer prev = map.floorKey(s);
            if (prev != null && map.get(prev) > s) return false;
            Integer next = map.ceilingKey(s);
            if (next != null && next < e) return false;
            map.put(s, e);
            return true;
        }
    }

    public static void main(String[] args) {
        MyCalendar c = new MyCalendar();
        System.out.println(c.book(10, 20));
        System.out.println(c.book(15, 25));
        System.out.println(c.book(20, 30));
        System.out.println(c.book(0, 10));
    }
    // Input : [10,20), [15,25), [20,30), [0,10)
    // Output: true
    //         false
    //         true
    //         true
}` },
    { tab: "Template", file: "TreeMapTemplates.java",
      intro: "Floor/ceiling on a TreeSet (contains-nearby-duplicate) and a frequency TreeMap for a window's max-min.",
      code: `import java.util.TreeMap;
import java.util.TreeSet;

public class TreeMapTemplates {
    static boolean nearbyAlmostDuplicate(int[] a, int k, int t) {
        TreeSet<Long> set = new TreeSet<>();
        for (int i = 0; i < a.length; i++) {
            long x = a[i];
            Long ceil = set.ceiling(x);
            if (ceil != null && ceil - x <= t) return true;
            Long floor = set.floor(x);
            if (floor != null && x - floor <= t) return true;
            set.add(x);
            if (i >= k) set.remove((long) a[i - k]);
        }
        return false;
    }

    static int longestSubarray(int[] a, int limit) {
        TreeMap<Integer, Integer> freq = new TreeMap<>();
        int l = 0, best = 0;
        for (int r = 0; r < a.length; r++) {
            freq.merge(a[r], 1, Integer::sum);
            while (freq.lastKey() - freq.firstKey() > limit) {
                if (freq.merge(a[l], -1, Integer::sum) == 0) freq.remove(a[l]);
                l++;
            }
            best = Math.max(best, r - l + 1);
        }
        return best;
    }

    public static void main(String[] args) {
        System.out.println(nearbyAlmostDuplicate(new int[] {1, 2, 3, 1}, 3, 0));
        System.out.println(nearbyAlmostDuplicate(new int[] {1, 5, 9, 1, 5, 9}, 2, 3));
        System.out.println(longestSubarray(new int[] {8, 2, 4, 7}, 4));
        System.out.println(longestSubarray(new int[] {10, 1, 2, 4, 7, 2}, 5));
    }
    // Input : nearby ([1,2,3,1], k=3, t=0) and ([1,5,9,1,5,9], k=2, t=3)
    //         longest ([8,2,4,7], 4) and ([10,1,2,4,7,2], 5)
    // Output: true
    //         false
    //         2
    //         4
}` },
  ],
  complexity: {
    time: "O(log n) per insert / floor / ceiling; O(n log n) for n operations",
    space: "O(n) keys in the tree",
    derivation: [
      "<p>A red-black tree of n keys has height O(log n). Each API call walks a root-to-leaf path:</p>" +
        "<span class=\"eq\">T(n ops) = n \u00b7 O(log n) = O(n log n)</span>",
      "<p>The brute interval scan is O(n) per book, O(n\u00b2) total. Two TreeMap probes replace " +
        "that scan. A window as a TreeMap of frequencies is O(n log n) versus O(n) for two deques.</p>",
    ],
    compare: [
      ["Scan all intervals", "O(n) / book", "O(n)", "n a few thousand"],
      ["TreeMap start \u2192 end", "O(log n) / book", "O(n)", "Calendar / no-overlap booking"],
      ["TreeSet of a window", "O(n log k)", "O(k)", "Nearby duplicates, max-min window"],
      ["Two monotonic deques", "O(n)", "O(n)", "Max-min window when you want linear"],
      ["HashMap", "O(1) expected", "O(n)", "Exact keys only; no floor"],
      ["Heap", "O(log n)", "O(n)", "Extreme only; no predecessor of x"],
    ],
  },
  pitfalls: [
    { title: "Unboxing a null floor/ceiling",
      bug: "int f = set.floor(x); when x is smaller than every key. NPE, often only on the minimum query.",
      fix: "Assign to Integer / Long, null-check, then unbox. Same for floorKey." },
    { title: "floor vs lower on a closed interval",
      bug: "Using lowerKey(s) when an interval that starts at s should count as a conflict.",
      fix: "Conflict with an interval that starts at s is a floor (inclusive)." },
    { title: "Closed vs half-open overlap test",
      bug: "prev.end >= s on a half-open spec rejects a legal touch.",
      fix: "LC 729 is [s, e) so overlap is end > s and next < e." },
    { title: "TreeSet.remove of duplicate values in a window",
      bug: "A set cannot hold two equal values. Nearby-duplicate with t=0 silently drops one.",
      fix: "If duplicates of the values themselves matter, store indices or use a TreeMap of counts." },
    { title: "Mutating a map while iterating entrySet",
      bug: "ConcurrentModificationException, or skipped entries, during a sweep.",
      fix: "Build the delta map first, then iterate. Or snapshot keySet into an ArrayList." },
    { title: "Comparator inconsistent with equals",
      bug: "A TreeMap with (a,b) \u2192 a.x - b.x treats two objects with the same x as the same key.",
      fix: "If keys can tie on the sort field, add a unique id. Never subtract ints." },
  ],
  variants: [
    ["My Calendar II (at most two overlaps)",
      "TreeMap of deltas: d[s]++, d[e]--. Reject if any prefix would exceed 2.",
      "map.merge(s, 1, Integer::sum); map.merge(e, -1, Integer::sum); then scan coverage.",
      "LC 731"],
    ["Sweep coverage (Covered Points Count)",
      "Delta map of +1 at L and -1 at R+1 (closed), then walk keys in order.",
      "for (entry : map.entrySet()) { cov += e.getValue(); ans[cov] += next - coord; }",
      "CF 1000C"],
    ["Exam room / max gap",
      "TreeSet of taken seats. Next seat is the midpoint of the largest gap.",
      "Integer lo = taken.lower(p); Integer hi = taken.higher(p);",
      "LC 855"],
    ["Range module (LC 715)",
      "TreeMap of disjoint intervals; split on add/remove using floor and ceiling, then merge.",
      "The calendar two-probe, plus a merge-run of touching intervals.",
      "LC 715"],
  ],
  followups: [
    ["floorKey vs lowerKey: which one for interval overlap?",
      "<p>You need the interval that starts at or before s, so floor (inclusive). If an " +
      "interval starts at s it overlaps [s, e) for any e > s. Stick to floor + ceiling on the start.</p>"],
    ["When do you prefer two deques over a TreeMap for max-min of a window?",
      "<p>When they want O(n) and the window is on an array you scan once. A TreeMap of " +
      "frequencies is O(log n) per step, shorter to write. LC 1438 accepts both. Say both, " +
      "write the TreeMap unless they push for linear.</p>"],
    ["How does this relate to a policy-based tree on Codeforces?",
      "<p>TreeMap cannot answer \"k-th key\" in log n without walking, because Java's red-black " +
      "tree does not store subtree sizes. headMap(x).size() is O(n), not log n. Use Fenwick / " +
      "segment tree on compressed keys, or accept linear for order statistics.</p>"],
    ["Can a TreeMap replace a heap?",
      "<p>Yes, with worse constants: firstKey is min, pollFirstEntry is delete-min, and you " +
      "also get floor/ceiling and arbitrary delete in log n. Stay with PriorityQueue when you " +
      "only ever need the extreme. A TreeMap of counts is the cleanest multiset Java has.</p>"],
  ],
  problems: [
    { url: "https://leetcode.com/problems/my-calendar-i/", name: "My Calendar I",
      badge: "lc", tag: "LC 729", level: "Medium", pattern: "TreeMap start\u2192end, two probes" },
    { url: "https://leetcode.com/problems/my-calendar-ii/", name: "My Calendar II",
      badge: "lc", tag: "LC 731", level: "Medium", pattern: "Delta map, reject coverage > 2" },
    { url: "https://leetcode.com/problems/contains-duplicate-iii/", name: "Contains Duplicate III",
      badge: "lc", tag: "LC 220", level: "Hard", pattern: "TreeSet of last k, floor/ceiling vs t" },
    { url: "https://leetcode.com/problems/longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit/", name: "Longest Subarray abs(max-min) <= Limit",
      badge: "lc", tag: "LC 1438", level: "Medium", pattern: "TreeMap of window frequencies (or two deques)" },
    { url: "https://leetcode.com/problems/exam-room/", name: "Exam Room",
      badge: "lc", tag: "LC 855", level: "Medium", pattern: "TreeSet of taken seats, max gap" },
    { url: "https://leetcode.com/problems/data-stream-as-disjoint-intervals/", name: "Data Stream as Disjoint Intervals",
      badge: "lc", tag: "LC 352", level: "Hard", pattern: "TreeMap of intervals, merge on insert" },
    { url: "https://leetcode.com/problems/range-module/", name: "Range Module",
      badge: "lc", tag: "LC 715", level: "Hard", pattern: "Split + merge disjoint intervals in a TreeMap" },
    { url: "https://leetcode.com/problems/odd-even-jump/", name: "Odd Even Jump",
      badge: "lc", tag: "LC 975", level: "Hard", pattern: "TreeMap of suffix values, ceiling/floor jumps" },
    { url: "https://codeforces.com/problemset/problem/702/C", name: "Cellular Network",
      badge: "cf", tag: "CF 702C", level: "Medium", pattern: "For each city, floor/ceiling of tower positions" },
    { url: "https://codeforces.com/problemset/problem/1000/C", name: "Covered Points Count",
      badge: "cf", tag: "CF 1000C", level: "Medium", pattern: "Delta TreeMap, sweep coverage" },
    { url: "https://codeforces.com/problemset/problem/1353/D", name: "Constructing the Array",
      badge: "cf", tag: "CF 1353D", level: "Medium", pattern: "TreeSet / heap of empty segments by length" },
  ],
  spoilers: [
    { summary: "Hint for CF 702C \u2014 one ceiling per city",
      body: "<p>Sort the tower positions (or put them in a TreeSet). For each city at x the " +
        "nearest tower is min(x - floor(x), ceiling(x) - x), missing neighbour treated as " +
        "infinity. The answer is the max over cities of that distance. Binary search on a " +
        "static array is the same algorithm without a tree.</p>" },
    { summary: "Hint for CF 1000C \u2014 coverage by how many segments",
      body: "<p>Each segment [L, R] contributes +1 at L and -1 at R+1 (closed integer segments). " +
        "Walk adjacent keys of the TreeMap: between coord and nextCoord there are (next-coord) " +
        "points with the current coverage. Off-by-one on R vs R+1 is the whole problem.</p>" },
  ],
  recap: [
    "<strong>Floor \u2264 x \u2264 ceiling; lower &lt; x &lt; higher.</strong> Null-check before unboxing.",
    "<strong>Intervals:</strong> TreeMap start \u2192 end, two probes, half-open unless the spec says otherwise.",
    "<strong>Window bag:</strong> TreeMap of frequencies; firstKey/lastKey are min and max.",
    "<strong>Sweep:</strong> TreeMap of coordinate deltas, then iterate in key order.",
    "<strong>Not a heap and not a HashMap:</strong> you are here because you need a nearest key or an ordered range.",
  ],
  oneliner: "Integer prev = map.floorKey(s); if (prev != null && map.get(prev) > s) return false;",
}),

/* =========================== 6. design-data-structures ================ */
pack({
  id: "design-data-structures",
  difficulty: "Medium",
  readTime: "24 min",
  tagline: "Design rounds are two structures glued together: LRU is HashMap + doubly linked " +
    "list, LFU is LRU buckets per frequency, and the randomized set is HashMap + ArrayList.",
  tags: ["design", "LRU", "LFU", "HashMap", "P0"],
  prereqs: [
    ["Linked Lists", "linked-lists.html"],
    ["Heaps & Priority Queue", "heaps-and-priority-queue.html"],
    ["Java for DSA", "../00-foundations/java-for-dsa.html"],
  ],
  why: [
    "\"Design LRU cache\" is the most-asked design question because it forces O(1) get and " +
      "put under a capacity: a HashMap for lookup, a doubly linked list for recency. Miss " +
      "either piece and you have O(n) eviction. LFU is the follow-up: buckets per frequency, " +
      "each an LRU, plus a minFreq integer.",
    "The other classics are min-stack (store minSoFar with each push), insert-delete-getRandom " +
      "O(1) (map + array, delete is swap-with-last), and all-O(1). Median-from-stream sits on " +
      "the heaps page; a trie is a design problem too.",
    "The transferable sentence: name the operations, name the bottleneck, pick one structure " +
      "per bottleneck, then write the glue that keeps them in sync on every mutation.",
  ],
  insight: "O(1) lookup is a HashMap. O(1) recency is a DLL with dummy head/tail. O(1) " +
    "random is an ArrayList. Eviction updates both sides in the same method.",
  yes: [
    "\"Design LRU / LFU cache\" with O(1) get and put",
    "\"Insert, delete, getRandom in O(1)\"",
    "\"Min stack\" / \"max stack\" in O(1)",
    "\"All O(1)\" frequency + recency (LC 432)",
    "They ask you to pick structures before you write a line",
  ],
  no: [
    "The operations are only offer/poll of the extreme &rarr; a heap, not a design glue",
    "You need floor/ceiling of keys &rarr; TreeMap calendar, previous page",
    "The cache can be O(log n) &rarr; TreeMap by recency is legal but they want O(1) LRU",
    "It is a graph / tree algorithm wearing a \"design\" title &rarr; solve the algorithm",
  ],
  table: [
    ["LRU cache", "HashMap + DLL, dummy head/tail", "LC 146"],
    ["LFU cache", "freq to LRU bucket, minFreq", "LC 460"],
    ["Min stack", "ArrayDeque of (val, minSoFar)", "LC 155"],
    ["Randomized set", "HashMap + ArrayList, swap-with-last", "LC 380"],
    ["All O(1)", "key to freq, freq to keys DLL", "LC 432"],
    ["Median stream", "Two heaps", "LC 295 (heaps page)"],
    ["<strong>Confused with:</strong> LinkedHashMap accessOrder",
      "It is LRU, and interviewers still want you to write the DLL",
      "Mention it, then implement"],
  ],
  constraint: "Capacity up to 1e4, 1e5 operations, O(1) worst-case per op. Do not scan the " +
    "list. Dummy nodes so head/tail deletes have no null cases.",
  core: [
    "LRU: Node(key, val) in a DLL, newest at head. HashMap key to node. get: map lookup, " +
      "move node to head. put: update + move, or insert at head; if over capacity, unlink " +
      "tail.prev and map.remove that key. Dummy head and tail so unlink is four pointer writes.",
    "LFU: each key has a freq. freqMap: freq to DLL of keys at that freq. On get/put, unlink " +
      "from freq, insert into freq+1, and if the old bucket is empty and freq==minFreq, " +
      "increment minFreq. New keys reset minFreq to 1. Randomized set: map key to index in " +
      "ArrayList; delete swaps with the last element, fixes that key's index, then pops.",
  ],
  invariant: "<p>After every get/put the map and the recency (and frequency) lists describe " +
    "the same set of keys. The tail of the recency list is the LRU victim. minFreq is the " +
    "smallest freq that still has a key.</p>",
  array: [1, 2, 3, 1, 4],
  arrayLabel: "ops =",
  indexLabels: ["put1", "put2", "put3", "get1", "put4"],
  vars: ["cap", "head", "tail", "evict"],
  frames: [
    { note: "LRU capacity 2. put(1). List: 1. Map {1}.",
      active: [0], dim: [1, 2, 3, 4],
      values: { cap: 2, head: 1, tail: 1, evict: "\u2014" } },
    { note: "put(2). List: 2-1. Newest is 2.",
      active: [1], done: [0], dim: [2, 3, 4],
      values: { cap: 2, head: 2, tail: 1, evict: "\u2014" } },
    { note: "put(3). Over capacity. Evict tail 1. List: 3-2.",
      active: [2], x: [0], dim: [3, 4],
      values: { cap: 2, head: 3, tail: 2, evict: 1 } },
    { note: "get(1) misses because 1 was evicted.",
      active: [3], dim: [4],
      values: { cap: 2, head: 3, tail: 2, evict: "miss 1" } },
    { note: "If we had get(2) instead: move 2 to head. List 2-3. Tail is 3.",
      active: [1], best: [1],
      values: { cap: 2, head: 2, tail: 3, evict: "\u2014" } },
    { note: "put(4) after 3-2: evict 2, list 4-3.",
      active: [4], x: [1],
      values: { cap: 2, head: 4, tail: 3, evict: 2 } },
  ],
  mermaid: `flowchart TD
  ask{"which pair of bottlenecks?"}
  ask -- "lookup + recency" --> lru["HashMap + DLL"]
  ask -- "lookup + recency + frequency" --> lfu["freq buckets of LRU + minFreq"]
  ask -- "lookup + random" --> rnd["HashMap + ArrayList, swap-with-last"]
  ask -- "push/pop + running min" --> mnst["ArrayDeque of val and minSoFar"]
  lru --> glue["every mutation updates both structures"]`,
  merTitle: "One structure per bottleneck",
  steps: [
    "<strong>List the operations and the required complexity.</strong>",
    "<strong>Assign a structure</strong> to each bottleneck (hash, DLL, array, heap).",
    "<strong>Dummy head and tail</strong> for any DLL. Unlink is four assignments.",
    "<strong>LRU get/put:</strong> map, move-to-head; evict tail.prev and the map entry.",
    "<strong>LFU:</strong> bump freq, fix minFreq when a bucket dies.",
    "<strong>Random delete:</strong> swap-with-last, update the swapped key's index, pop.",
    "<strong>Keep them in sync</strong> in the same method; a missed map.remove is the usual bug.",
  ],
  code: [
    { tab: "Brute", file: "LruBrute.java",
      intro: "ArrayList of pairs, scan on get. Correct, O(n), the thing they will reject.",
      code: `import java.util.ArrayList;
import java.util.List;

public class LruBrute {
    static class E { int k, v; E(int k, int v) { this.k = k; this.v = v; } }
    final int cap;
    final List<E> a = new ArrayList<>();
    LruBrute(int cap) { this.cap = cap; }
    int get(int k) {
        for (int i = 0; i < a.size(); i++) {
            if (a.get(i).k == k) {
                E e = a.remove(i);
                a.add(e);
                return e.v;
            }
        }
        return -1;
    }
    void put(int k, int v) {
        for (int i = 0; i < a.size(); i++) {
            if (a.get(i).k == k) {
                a.remove(i);
                break;
            }
        }
        a.add(new E(k, v));
        if (a.size() > cap) {
            a.remove(0);
        }
    }
    public static void main(String[] args) {
        LruBrute c = new LruBrute(2);
        c.put(1, 1); c.put(2, 2);
        System.out.println(c.get(1));
        c.put(3, 3);
        System.out.println(c.get(2));
    }
    // Input : cap 2; put 1,2; get 1; put 3; get 2
    // Output: 1
    //         -1
}` },
    { tab: "Optimal", file: "LruCache.java",
      intro: "HashMap + DLL. Dummy head/tail. Move-to-head on get and put.",
      code: `import java.util.HashMap;
import java.util.Map;

public class LruCache {
    static class Node {
        int k, v;
        Node prev, next;
        Node(int k, int v) { this.k = k; this.v = v; }
    }
    final int cap;
    final Node head = new Node(0, 0), tail = new Node(0, 0);
    final Map<Integer, Node> map = new HashMap<>();
    LruCache(int cap) {
        this.cap = cap;
        head.next = tail;
        tail.prev = head;
    }
    void unlink(Node n) {
        n.prev.next = n.next;
        n.next.prev = n.prev;
    }
    void insertHead(Node n) {
        n.next = head.next;
        n.prev = head;
        head.next.prev = n;
        head.next = n;
    }
    int get(int k) {
        Node n = map.get(k);
        if (n == null) {
            return -1;
        }
        unlink(n);
        insertHead(n);
        return n.v;
    }
    void put(int k, int v) {
        Node n = map.get(k);
        if (n != null) {
            n.v = v;
            unlink(n);
            insertHead(n);
            return;
        }
        n = new Node(k, v);
        map.put(k, n);
        insertHead(n);
        if (map.size() > cap) {
            Node lru = tail.prev;
            unlink(lru);
            map.remove(lru.k);
        }
    }
    public static void main(String[] args) {
        LruCache c = new LruCache(2);
        c.put(1, 1); c.put(2, 2);
        System.out.println(c.get(1));
        c.put(3, 3);
        System.out.println(c.get(2));
    }
    // Input : cap 2; put 1,2; get 1; put 3; get 2
    // Output: 1
    //         -1
}` },
    { tab: "Template", file: "RandomizedSet.java",
      intro: "Map + ArrayList. Delete is swap-with-last.",
      code: `import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

public class RandomizedSet {
    final List<Integer> a = new ArrayList<>();
    final Map<Integer, Integer> at = new HashMap<>();
    boolean insert(int x) {
        if (at.containsKey(x)) {
            return false;
        }
        at.put(x, a.size());
        a.add(x);
        return true;
    }
    boolean remove(int x) {
        Integer i = at.get(x);
        if (i == null) {
            return false;
        }
        int last = a.get(a.size() - 1);
        a.set(i, last);
        at.put(last, i);
        a.remove(a.size() - 1);
        at.remove(x);
        return true;
    }
    int getRandom() {
        return a.get(ThreadLocalRandom.current().nextInt(a.size()));
    }
    public static void main(String[] args) {
        RandomizedSet s = new RandomizedSet();
        System.out.println(s.insert(1) + " " + s.insert(1) + " " + s.insert(2));
        s.remove(1);
        System.out.println(s.getRandom());
    }
    // Input : insert 1, 1, 2; remove 1; getRandom
    // Output: true false true
    //         2
}` },
  ],
  complexity: {
    time: "O(1) per LRU / LFU / randomized / min-stack operation",
    space: "O(capacity)",
    derivation: [
      "<p>HashMap and DLL pointer writes are O(1). Eviction is one unlink plus one map.remove. " +
        "Randomized delete is O(1) because swap-with-last avoids a linear hole.</p>",
    ],
    compare: [
      ["Scan a list", "O(n)", "O(n)", "Rejected"],
      ["HashMap + DLL (LRU)", "O(1)", "O(cap)", "LC 146"],
      ["LinkedHashMap accessOrder", "O(1)", "O(cap)", "Library LRU; still implement"],
      ["TreeMap by recency", "O(log n)", "O(cap)", "Legal, not the asked bound"],
      ["Two heaps (median)", "O(log n)", "O(n)", "Heaps page"],
    ],
  },
  pitfalls: [
    { title: "Evict from the list but not the map",
      bug: "get of the evicted key returns a detached node. Capacity appears to grow.",
      fix: "unlink and map.remove in the same two lines." },
    { title: "No dummy head/tail",
      bug: "Null checks on every unlink; empty-list and one-node cases fail.",
      fix: "Sentinel head and tail, always linked to each other when empty." },
    { title: "Randomized delete without fixing the swapped index",
      bug: "You move last into i but leave map[last] pointing at the old last index.",
      fix: "<code>at.put(last, i)</code> before pop. If x is already last, the put is a no-op." },
    { title: "LFU: forgetting to bump minFreq",
      bug: "You empty the minFreq bucket and still evict from it.",
      fix: "If that bucket is empty after a bump, minFreq++. New keys set minFreq = 1." },
    { title: "Min-stack storing only the global min",
      bug: "After popping the current min you do not know the previous min.",
      fix: "Store minSoFar with every node, or a second stack of mins." },
  ],
  variants: [
    ["LFU",
      "freqMap of DLLs plus key to node. Evict the LRU of the minFreq bucket.",
      "LC 460.",
      "New key always freq 1, minFreq = 1."],
    ["Min stack",
      "ArrayDeque of val and minSoFar. Push min(val, peek.min). Never java.util.Stack.",
      "LC 155.",
      "O(1) extra per element."],
    ["All O(1)",
      "Like LFU without a capacity: inc/dec freq and return min/max key.",
      "LC 432.",
      "Same buckets, plus a maxFreq."],
  ],
  followups: [
    ["Why not a heap of (time, key) for LRU?",
      "<p>Get would need decrease-key on that key's timestamp. PriorityQueue cannot. A DLL " +
      "move-to-head is O(1) and is the decrease-key.</p>"],
    ["Is LinkedHashMap enough?",
      "<p>Yes for LRU: accessOrder=true and override removeEldestEntry. Say so, then write " +
      "the DLL. They are testing the glue, not the library.</p>"],
    ["How does LFU break a tie?",
      "<p>Among keys with minFreq, evict the least recently used. That is why each freq " +
      "bucket is itself an LRU list, not a bag.</p>"],
    ["Can getRandom be O(1) with deletes if you use a HashSet?",
      "<p>No. HashSet has no index. You need an array for random access and a map to find " +
      "the hole in O(1).</p>"],
  ],
  problems: [
    { url: "https://leetcode.com/problems/lru-cache/", name: "LRU Cache",
      badge: "lc", tag: "LC 146", level: "Medium", pattern: "HashMap + DLL" },
    { url: "https://leetcode.com/problems/lfu-cache/", name: "LFU Cache",
      badge: "lc", tag: "LC 460", level: "Hard", pattern: "freq buckets of LRU" },
    { url: "https://leetcode.com/problems/min-stack/", name: "Min Stack",
      badge: "lc", tag: "LC 155", level: "Medium", pattern: "Deque of (val, minSoFar)" },
    { url: "https://leetcode.com/problems/insert-delete-getrandom-o1/", name: "Insert Delete GetRandom O(1)",
      badge: "lc", tag: "LC 380", level: "Medium", pattern: "Map + ArrayList, swap-with-last" },
    { url: "https://leetcode.com/problems/all-oone-data-structure/", name: "All O(1) Data Structure",
      badge: "lc", tag: "LC 432", level: "Hard", pattern: "LFU without capacity" },
    { url: "https://leetcode.com/problems/find-median-from-data-stream/", name: "Find Median from Data Stream",
      badge: "lc", tag: "LC 295", level: "Hard", pattern: "Two heaps" },
    { url: "https://leetcode.com/problems/implement-trie-prefix-tree/", name: "Implement Trie",
      badge: "lc", tag: "LC 208", level: "Medium", pattern: "Design a 26-way trie" },
    { url: "https://leetcode.com/problems/max-stack/", name: "Max Stack",
      badge: "lc", tag: "LC 716", level: "Hard", pattern: "Two stacks, or TreeMap + DLL" },
  ],
  recap: [
    "<strong>LRU = HashMap + DLL</strong>, dummy head/tail, evict both sides.",
    "<strong>LFU = LRU buckets per freq</strong> plus minFreq.",
    "<strong>Randomized set = map + ArrayList</strong>, delete is swap-with-last.",
    "<strong>Min-stack = deque of (val, minSoFar)</strong>.",
    "<strong>Name the bottleneck, pick a structure, glue them on every write.</strong>",
  ],
  oneliner: "map.get(k); unlink(n); insertHead(n); if (map.size()>cap) { unlink(tail.prev); map.remove(key); }",
}),

];

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
    "You are handed the closing price of a stock for every day of the year, say " +
      "<code>[2, 1, 2, 4, 3]</code> for a very short year, and for each day you must report the " +
      "first later day whose price is strictly higher. Day 0 at price 2 has to wait until day 3 " +
      "at price 4; day 1 at price 1 is answered immediately by day 2. The program that writes " +
      "itself is two nested loops: stand on each index and walk rightwards until you see " +
      "something bigger. On five days that is instant. On <code>n = 10&#8309;</code> days a " +
      "gently decreasing input makes every inner walk run all the way to the end of the array, " +
      "which is roughly <code>10&#8309; &times; 10&#8309; / 2 = 5&times;10&#8313;</code> " +
      "comparisons &mdash; minutes of CPU time for a problem that gives you one second.",
    "The wasted effort has a very definite shape, and seeing it is the whole trick. Suppose you " +
      "are standing at index <code>i</code> and somewhere to its right sits an index " +
      "<code>j</code> with <code>a[j]</code> smaller than <code>a[i]</code>. Then <code>a[j]</code> " +
      "can never be the answer for <code>i</code>, and it can never be the answer for any earlier " +
      "index that is still unanswered either, because a value bigger than <code>a[i]</code> is " +
      "certainly bigger than <code>a[j]</code> and would have been reached first. The moment a " +
      "larger value shows up, <code>a[j]</code> is <em>dominated</em> &mdash; permanently useless " +
      "as a candidate for anybody &mdash; and can be discarded forever. The nested loops keep " +
      "re-reading those dead values, and that re-reading is the entire cost.",
    "A <em>stack</em> is a container where the only element you may inspect or remove is the one " +
      "you added most recently, last in and first out, like a pile of plates. Keep a stack of the " +
      "indices whose answer you have not found yet, deliberately arranged so their values decrease " +
      "as you go from the bottom to the top. That never-turning-around ordering is what the word " +
      "<em>monotonic</em> means here. When a new value arrives it settles every index on top of the " +
      "stack that it beats, popping each one and writing its answer on the way, and then it joins " +
      "the stack itself to wait for something bigger. An index is pushed exactly once and popped at " +
      "most once, so the whole scan does at most <code>n</code> pushes and <code>n</code> pops.",
    "Once that skeleton is visible, a cluster of famous problems collapses into the same single " +
      "pass with a different quantity computed at the moment of each pop. Largest rectangle in a " +
      "histogram asks how far each bar can stretch left and right before it meets a shorter bar, " +
      "which is nearest-smaller on both sides. Trapping rain water fills each column up to the " +
      "shorter of the tallest bar on its left and the tallest on its right. Sum of subarray minimums " +
      "multiplies each value by the number of subarrays it is the minimum of, and that count is a " +
      "product of two gaps between its previous-smaller and its next-smaller position. Daily " +
      "temperatures and stock span are next-greater where you record the distance <code>i - j</code> " +
      "rather than the value.",
    "In a real statement the signal is <code>n &le; 10&#8309;</code> sitting next to a phrase about " +
      "the nearest larger or smaller neighbour, an area under a row of bars, or water held between " +
      "them. Be careful, though: there is a second and completely unrelated family that also uses a " +
      "stack. Matching brackets, decoding a nested string like <code>3[ab]</code>, and evaluating an " +
      "expression with parentheses all push something and pop it later, but what they hold is " +
      "unmatched openers or pending operators, and no comparison between values ever happens. " +
      "Deciding which of the two families a question belongs to before you write a line is the " +
      "classification an interviewer is quietly watching for.",
  ],
  insight: "A monotonic stack holds exactly the indices whose answer is still unknown, kept in " +
    "sorted order so that one comparison against the newest arrival is enough to decide whether the " +
    "top is finished. Every index enters once and leaves once, so the loop nested inside a loop " +
    "still costs <code>&Theta;(n)</code> in total; the word for that accounting is " +
    "<em>amortised</em> &mdash; a single step can be expensive, but the average over the whole run " +
    "is constant.",
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
  constraint: "<code>n &le; 10&#8309;</code> next to a next-greater, histogram or rain-water " +
    "flavour is the linear-stack signature: the nested scan would be about " +
    "<code>5&times;10&#8313;</code> comparisons and this pass is about <code>2&times;10&#8309;</code>. " +
    "Watch the arithmetic as well as the loop &mdash; areas and contributions must be accumulated " +
    "in <code>long</code>, because a height of <code>10&#8313;</code> times a width of " +
    "<code>10&#8309;</code> is far past the two-billion ceiling of a Java <code>int</code> and " +
    "wraps silently to a negative number.",
  core: [
    "The container is an <code>ArrayDeque&lt;Integer&gt;</code> called <code>st</code>, and it holds " +
      "<em>indices</em>, never values. At any instant during the scan, <code>st</code> contains " +
      "exactly those positions to the left of the current index <code>i</code> whose next-greater " +
      "element has not been found yet, oldest at the bottom and newest at the top, and the values " +
      "<code>a[st]</code> read from bottom to top never increase. Storing indices rather than values " +
      "matters because widths, distances and the identity of equal values all need the position; the " +
      "value is one lookup away as <code>a[st.peekLast()]</code> whenever you want it.",
    "The scan is a single loop over <code>i</code> from 0 to <code>n-1</code>. Before pushing " +
      "<code>i</code>, look at the top index <code>j = st.peekLast()</code>. If <code>a[j] &lt; a[i]</code> " +
      "then <code>i</code> is the <em>first</em> position right of <code>j</code> holding a larger " +
      "value &mdash; first because everything strictly between them was itself pushed and then popped " +
      "by a value no larger than <code>a[i]</code>, so nothing in the gap could have beaten " +
      "<code>a[j]</code> earlier. Write <code>ans[j] = a[i]</code>, pop <code>j</code>, and test the " +
      "new top, which is exactly why the pop lives in a <code>while</code> and not an <code>if</code>: " +
      "one arrival can settle many waiting indices at once. When the top no longer loses to " +
      "<code>a[i]</code> the descending order is restored, so push <code>i</code> and move on. " +
      "Whatever is still on the stack when the loop ends never met a larger value, and gets " +
      "<code>-1</code>.",
    "Two knobs adapt this skeleton to every problem in the family. The comparison direction picks the " +
      "question: values decreasing up the stack finds the next <em>greater</em> element, and flipping " +
      "the comparison so values increase finds the next <em>smaller</em> one. The second knob is the " +
      "sentinel, a fake element appended purely to force the loop to finish its work. For the histogram " +
      "you run <code>i</code> from 0 all the way to <code>n</code> and pretend the bar at index " +
      "<code>n</code> has height 0; being shorter than everything real, it drains the stack, so bars " +
      "that never met a shorter neighbour still get measured. When a bar of height <code>h[j]</code> " +
      "pops at position <code>i</code>, the index left underneath it on the stack, call it " +
      "<code>left</code>, is by the invariant the nearest shorter bar on that side, so the rectangle " +
      "of that height spans <code>i - left - 1</code> columns.",
    "Trace <code>[2, 1, 2, 4, 3]</code> by hand. Index 0 lands on an empty stack, so <code>st = [0]</code> " +
      "standing for the value 2. At <code>i = 1</code> the value 1 does not beat 2, nothing pops, and " +
      "<code>st = [0, 1]</code> reads 2 then 1 going up &mdash; decreasing, as promised. At " +
      "<code>i = 2</code> the value 2 beats the top value 1, so index 1 pops with <code>ans[1] = 2</code>; " +
      "the new top is index 0 whose value 2 is not <em>strictly</em> less than 2, so the popping halts " +
      "there and <code>st = [0, 2]</code>. At <code>i = 3</code> the value 4 knocks out index 2 and then " +
      "index 0, writing <code>ans[2] = 4</code> and <code>ans[0] = 4</code> and leaving the stack empty " +
      "before 3 joins it. At <code>i = 4</code> the value 3 loses to 4 and simply sits down. Indices 3 " +
      "and 4 are still waiting when the array runs out, so they take <code>-1</code>, and the finished " +
      "answer is <code>[4, 2, 4, -1, -1]</code>.",
  ],
  invariant: "<p>The stack holds the still-unresolved indices in monotone order of " +
    "<code>a[&middot;]</code>. For a decreasing stack used for next-greater, at the top of every " +
    "iteration:</p>" +
    "<span class=\"eq\">s0 &lt; s1 &lt; &hellip; &lt; sk &lt; i, and a[s0] &ge; a[s1] &ge; &hellip; " +
    "&ge; a[sk]</span>" +
    "<p>In plain words, everything currently on the stack is still waiting for a bigger number, the " +
    "entries nearer the top are the more recent and the smaller ones, and any index that has already " +
    "left the stack has been handed its final answer and will never be touched again. That is a claim " +
    "you can check line by line while reading the code: if a pop ever happens without writing an " +
    "answer, or a push ever leaves a smaller value below a larger one, one half of the statement is " +
    "broken and the output will be wrong.</p>" +
    "<p>Interview sentence: <em>\"Each index is pushed once and popped once, so the nested " +
    "while is O(n).\"</em></p>",
  extra: [
    { kind: "math", title: "Why the inner while is not a second loop",
      html: "<p>Count pops instead of counting iterations. The outer loop runs <code>n</code> times and " +
        "pushes one index each time, so the stack receives exactly <code>n</code> elements over the " +
        "whole run and can therefore give back at most <code>n</code>. Every single turn of the inner " +
        "<code>while</code> removes one of them permanently, so all the inner turns added together " +
        "number at most <code>n</code> &mdash; no matter how they are distributed. One unlucky arrival " +
        "may pop 99 999 predecessors, but then the other 99 999 arrivals pop nothing at all. This is " +
        "the standard <em>amortised</em> argument: you pay for the pop when you push, not when you " +
        "pop.</p>" },
    { kind: "warn", title: "Strict or non-strict changes the answer, not just the style",
      html: "<p>On a plateau of equal values, <code>a[j] &lt; a[i]</code> leaves the earlier equal " +
        "index on the stack while <code>a[j] &le; a[i]</code> evicts it. Next-greater-element specs say " +
        "<em>strictly</em> greater, so use <code>&lt;</code>. Contribution problems such as sum of " +
        "subarray minimums need one side strict and the other not, so that a run of equal minima is " +
        "counted by exactly one of its occurrences rather than by all of them.</p>" },
  ],
  array: [2, 1, 2, 4, 3],
  vars: ["i", "a[i]", "stack", "wrote"],
  frames: [
    { note: "Before the scan starts the stack is empty and no index has an answer yet, so every cell is greyed out as unresolved.",
      dim: [0, 1, 2, 3, 4],
      values: { i: "\u2014", "a[i]": "\u2014", stack: "[]", wrote: "\u2014" } },
    { note: "i=0, value 2. The stack is empty so there is nobody to settle; index 0 goes on and starts waiting for something bigger.",
      active: [0], dim: [1, 2, 3, 4],
      values: { i: 0, "a[i]": 2, stack: "[0]", wrote: "\u2014" } },
    { note: "i=1, value 1. It does not beat the top value 2, so index 0 keeps waiting and index 1 stacks on top of it, values still descending.",
      active: [1], done: [0], dim: [2, 3, 4],
      values: { i: 1, "a[i]": 1, stack: "[0, 1]", wrote: "\u2014" } },
    { note: "i=2, value 2. It beats the top value 1, so index 1 pops with answer 2. The next top holds 2 as well, and strictly-greater means a tie does not pop, so index 0 stays.",
      active: [2], x: [1], done: [0], dim: [3, 4],
      values: { i: 2, "a[i]": 2, stack: "[0, 2]", wrote: "nge[1]=2" } },
    { note: "i=3, value 4. One arrival settles two waiting indices: 2 pops, then 0 pops, both answered with 4. The stack empties and index 3 is pushed onto it.",
      active: [3], best: [0, 2], done: [1], dim: [4],
      values: { i: 3, "a[i]": 4, stack: "[3]", wrote: "nge[0]=nge[2]=4" } },
    { note: "i=4, value 3. It loses to the 4 below it, so nothing pops and it simply joins the stack as another unanswered index.",
      active: [4], done: [0, 1, 2],
      values: { i: 4, "a[i]": 3, stack: "[3, 4]", wrote: "[4,2,4,-1,-1]" } },
    { note: "The same skeleton on the histogram [2,1,5,6,2,3]: the bar of height 5 pops when the shorter bar 2 arrives, its nearest shorter neighbours sit at indices 1 and 4, leaving a width of two columns and an area of 10.",
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
  dryIntro: "Walk <code>[2, 1, 2, 4, 3]</code> left to right. At every step the stack holds only " +
    "unresolved indices, each pop writes that index's next-greater, and leftovers at the end stay <code>-1</code>.",
  steps: [
    "<strong>Classify the family first</strong> so you do not write the wrong loop. A nearest-greater " +
      "or nearest-smaller question wants a monotonic stack of indices; a brackets or operator question " +
      "wants unmatched openers and never compares values.",
    "<strong>Pick the comparison from the question</strong>, not from habit. Values decreasing up the " +
      "stack find the next greater element; values increasing find the next smaller. Whether equals " +
      "pop is written in the spec, not guessed.",
    "<strong>Store indices, never values</strong>, in an <code>ArrayDeque</code> used only from the " +
      "back. Widths, distances and the identity of equal values all need the position; the value is " +
      "one lookup away as <code>a[st.peekLast()]</code>.",
    "<strong>Scan once from left to right.</strong> While the top is strictly smaller than " +
      "<code>a[i]</code>, pop it and write the answer, because <code>i</code> is the first later " +
      "index that beats it. Then push <code>i</code> so it can wait for its own neighbour.",
    "<strong>Force the leftovers to finish</strong> with a sentinel when every bar must be measured. " +
      "Histogram loops <code>i</code> to <code>n</code> with a fake height 0; next-greater leftovers " +
      "simply stay <code>-1</code> because nothing to their right was larger.",
    "<strong>Turn neighbours into a width or a contribution</strong> at the moment of the pop. The " +
      "rectangle of height <code>h[j]</code> spans <code>nextSmall - prevSmall - 1</code> columns, " +
      "and that product must be computed in <code>long</code> before any modulo.",
    "<strong>Defend the nested <code>while</code> with amortisation</strong> &mdash; a single step " +
      "can be expensive, but the average over the whole run is constant. Each index is pushed once " +
      "and popped at most once, so the inner loop cannot be quadratic no matter how the pops cluster.",
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
      "<p>The nested <code>while</code> is therefore not a hidden quadratic: one unlucky arrival " +
        "may pop almost every predecessor, but those popped indices never return, so the other " +
        "arrivals do almost no inner work. Histogram and rain are the same pass with a few extra " +
        "arithmetic operations per pop. Sum of subarray mins is two linear passes plus a linear " +
        "accumulation, still <code>&Theta;(n)</code>. At <code>n = 10&#8309;</code> that is about " +
        "<code>2&times;10&#8309;</code> stack operations, not the <code>5&times;10&#8313;</code> " +
        "comparisons of the nested scan.</p>",
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
      bug: "java.util.Stack is a synchronised Vector subclass, so every push pays a lock and " +
        "null is allowed. It looks like the obvious name for a stack, which is why people reach for it.",
      fix: "Use ArrayDeque from the back only: addLast, pollLast, peekLast. That is the current Java stack." },
    { title: "Storing values instead of indices",
      bug: "Storing values instead of indices looks simpler until you need a width, a distance, " +
        "or to tell two equal values apart. The answer then cannot be recovered from the stack.",
      fix: "Always push indices, never the raw values. Read the value through a[st.peekLast()] whenever a comparison needs it." },
    { title: "Wrong strictness on equals",
      bug: "Using the same comparison on both sides of a plateau double-counts or undercounts " +
        "equal minima, and the sample of distinct values still passes, so the bug hides.",
      fix: "Next-greater is strict. Contribution problems make one side strict and the other " +
        "not, so each subarray has exactly one owner." },
    { title: "Forgetting the histogram sentinel",
      bug: "Without a height-0 sentinel, suffix-minimum bars never pop. A strictly increasing " +
        "histogram still looks correct because every earlier bar pops later anyway.",
      fix: "Loop i from 0 to n and treat index n as height 0 so every real bar is forced to pop and be measured." },
    { title: "int overflow on area",
      bug: "height * width is computed in int first, wraps past two billion, and is then stored " +
        "in a long. The overflow has already happened and the area comes back negative.",
      fix: "Cast first: (long) height * (i - left - 1). Reduce modulo only after the full product is in a long." },
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
      "<p>Count pops, not iterations of the inner loop. Each index is pushed exactly once and, " +
      "once popped, is never pushed again, so the <code>while</code> can fire at most <code>n</code> " +
      "times across the whole scan. One arrival may drain almost the entire stack; the remaining " +
      "arrivals then pop nothing. That accounting is called <em>amortised</em> constant time per index.</p>"],
    ["Histogram vs rain: same stack, different payload?",
      "<p>Same nearest-smaller neighbours, different arithmetic at the pop. Histogram multiplies " +
      "<code>height[mid] * (right - left - 1)</code> and keeps the max. Rain fills the column up " +
      "to <code>min(h[left], h[right]) - h[mid]</code> and adds. Two-pointer rain is simpler if " +
      "they only want rain; the stack is what generalises to histogram and to contribution problems.</p>"],
    ["How do you avoid double-counting equal minima?",
      "<p>Give every subarray exactly one owner. Previous strictly-less plus next less-or-equal " +
      "(or the opposite pair) partitions the subarrays instead of covering them twice. Using the " +
      "same comparison on both sides overcounts a plateau of equal minima, and a sample of distinct " +
      "values will not catch it.</p>"],
    ["Circular NGE without overwriting?",
      "<p>Scan the array twice so the wrap-around is visible, but only write <code>ans[j]</code> " +
      "when it is still <code>-1</code>, and never push an alias index <code>i &ge; n</code>. A " +
      "strictly decreasing array is the worst case: every answer wraps except the global maximum, " +
      "which stays <code>-1</code> because nothing in the circle is larger than it.</p>"],
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
  readTime: "26 min",
  tagline: "A deque drops candidates from both ends: the front expires by age, the back is " +
    "dominated by a better newer value &mdash; sliding-window maximum in O(n).",
  tags: ["queue", "deque", "sliding window max", "monotonic deque", "P0"],
  prereqs: [
    ["Stacks & Monotonic Stack", "stacks-and-monotonic-stack.html"],
    ["Sliding Window", "../01-arrays-and-windows/sliding-window.html"],
  ],
  why: [
    "You are given the array <code>[1, 3, -1, -3, 5, 3, 6, 7]</code> and asked for the maximum " +
      "of every contiguous window of length 3. The first window <code>[1, 3, -1]</code> answers " +
      "3; the next <code>[3, -1, -3]</code> is still 3; then <code>[-1, -3, 5]</code> jumps to 5. " +
      "The program that writes itself scans each window from scratch. On five or eight numbers " +
      "that is instant. On <code>n = 10&#8309;</code> and a window around <code>n/2</code> that " +
      "is about <code>2.5&times;10&#8313;</code> comparisons, and the judge's one-second budget " +
      "is gone long before you finish.",
    "A heap of the live window looks smarter because peek is the max, but Java's " +
      "<code>PriorityQueue</code> cannot delete the element that just slid out of the left edge " +
      "in logarithmic time. You either scan the heap &mdash; back to quadratic &mdash; or leave " +
      "the stale value in and skip it later, which is <code>n log n</code> with extra bookkeeping. " +
      "The wasted work has a shape: once a newer, larger-or-equal value arrives, every older and " +
      "smaller neighbour is <em>dominated</em> &mdash; permanently useless as a window maximum " +
      "&mdash; and can be thrown away forever.",
    "A <em>deque</em> is a double-ended queue: you may add or remove from either end, unlike a " +
      "stack (one end only) or a plain FIFO queue (add back, remove front). Keep a deque of " +
      "indices of still-useful candidates, increasing in index from front to back and decreasing " +
      "in value. That never-turning-around ordering is what <em>monotonic</em> means here. At " +
      "any instant the front is the maximum of the current window, because everything older and " +
      "smaller has already been popped from the back, and everything too old has already been " +
      "popped from the front. An index is pushed once and popped at most once from each end, so " +
      "the nested loops are still linear.",
    "In a real statement the signal is <code>n &le; 10&#8309;</code> sitting next to \"maximum " +
      "of every window of size <code>k</code>\", or a DP recurrence whose inner max is itself a " +
      "sliding window. The same deque, flipped so values increase, solves shortest subarray with " +
      "sum <code>&ge; k</code> on prefix sums, because negatives make a two-pointer shrink illegal. " +
      "Structural queues &mdash; recent calls, circular buffers, implement a queue with two stacks " +
      "&mdash; are a different and easier family: they never compare values, they only remember " +
      "insertion order.",
  ],
  insight: "At any instant the deque holds only live candidates, oldest at the front and newest " +
    "at the back, values decreasing so the front is the window max. An index leaves the back " +
    "because a newer arrival dominates it, or the front because it aged out of the window. Each " +
    "index is pushed once and popped once, so the nested loops stay linear.",
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
  constraint: "<code>n &le; 10&#8309;</code> with a window <code>k</code> up to <code>n</code> " +
    "is the linear-deque signature: a heap of the window is about <code>n log n</code> and a " +
    "scan of each window is about <code>n k</code>, while this pass is about " +
    "<code>2&times;10&#8309;</code> deque operations. Prefix sums for shortest-subarray need " +
    "<code>long</code>. Use <code>ArrayDeque</code>, not <code>LinkedList</code> and not " +
    "<code>Stack</code>.",
  core: [
    "The container is an <code>ArrayDeque&lt;Integer&gt;</code> called <code>dq</code>, and it " +
      "holds <em>indices</em>, never values. At any instant during the scan, <code>dq</code> " +
      "contains exactly the live candidates for the window ending at the current index " +
      "<code>i</code>: their indices increase from front to back, and the values " +
      "<code>a[dq]</code> decrease, so the front is the current maximum. An index is popped " +
      "from the back when a newer arrival is at least as large &mdash; it can never be the " +
      "answer for any later window that also contains the newcomer. An index is popped from " +
      "the front when it has aged out of the window of size <code>k</code>, because it is no " +
      "longer a legal candidate even if it is still the biggest number you have seen.",
    "The scan is a single loop over <code>i</code> from 0 to <code>n-1</code>. Before pushing " +
      "<code>i</code>, pop the back while <code>a[dq.peekLast()] &le; a[i]</code>, because " +
      "<code>i</code> is both larger-or-equal and newer. Then push <code>i</code>. Then pop " +
      "the front while <code>dq.peekFirst() &le; i-k</code>, because that index sits strictly " +
      "outside the window ending at <code>i</code>. Once <code>i &ge; k-1</code> the window is " +
      "full, and the answer is <code>a[dq.peekFirst()]</code>. The inner loops look nested and " +
      "dangerous; they are not, because each index enters once and leaves at most once from " +
      "each end &mdash; the same <em>amortised</em> argument as the monotonic stack, plus an " +
      "age test at the front.",
    "Trace <code>[1, 3, -1, -3, 5, 3, 6, 7]</code> with <code>k = 3</code>. At <code>i = 0</code> " +
      "the deque is <code>[0]</code>. At <code>i = 1</code> the value 3 beats 1, so index 0 pops " +
      "from the back and <code>dq = [1]</code>. At <code>i = 2</code> the value -1 loses to 3, so " +
      "it sits at the back: <code>[1, 2]</code>, and the first full window answers 3. At " +
      "<code>i = 3</code> the value -3 sits down: <code>[1, 2, 3]</code>; front 1 is still inside " +
      "(<code>1 &gt; 3-3</code>). At <code>i = 4</code> the value 5 dominates everything still on " +
      "the deque, so -3, -1 and 3 all pop from the back, and front 1 also expires " +
      "(<code>1 &le; 4-3</code>); <code>dq</code> becomes <code>[4]</code> and the answer is 5. " +
      "The remaining windows answer 5, then 6, then 7.",
  ],
  invariant: "<p>The deque holds live candidates, increasing in index and decreasing in value " +
    "(for window max). At the top of every iteration:</p>" +
    "<span class=\"eq\">idx0 &lt; idx1 &lt; \u2026 and a[idx0] \u2265 a[idx1] \u2265 \u2026 , " +
    "all idx in (i-k, i]</span>" +
    "<p>In plain words, the front is the maximum of the current window, the back is where the " +
    "newest arrival lands after kicking off everyone it dominates, and any index that has left " +
    "either end is finished: it will never be a candidate again. If a pop ever happens without " +
    "one of those two reasons, or a push ever leaves a smaller value in front of a larger one, " +
    "the claim is broken and the output will be wrong.</p>" +
    "<p>Interview sentence: <em>\"Front is the max of the live window; back pops everyone " +
    "the new arrival dominates.\"</em></p>",
  array: [1, 3, -1, -3, 5, 3, 6, 7],
  vars: ["i", "window", "deque", "max"],
  frames: [
    { note: "Window k=3 on [1,3,-1,-3,5,3,6,7]. i=0, the deque is empty so index 0 is pushed and waits as the only live candidate.",
      active: [0], dim: [1, 2, 3, 4, 5, 6, 7],
      values: { i: 0, window: "[1]", deque: "[0]", max: "\u2014" } },
    { note: "i=1, value 3 dominates the back value 1, so index 0 pops from the back and index 1 becomes the only candidate.",
      active: [1], dim: [2, 3, 4, 5, 6, 7],
      values: { i: 1, window: "[1,3]", deque: "[1]", max: "\u2014" } },
    { note: "i=2, value -1 loses to 3, so it sits at the back. The first full window answers with the front value 3.",
      window: [0, 2], best: [1],
      values: { i: 2, window: "[1,3,-1]", deque: "[1,2]", max: 3 } },
    { note: "i=3, value -3 sits at the back. Front 1 is still inside the window, so the max stays 3.",
      window: [1, 3], best: [1],
      values: { i: 3, window: "[3,-1,-3]", deque: "[1,2,3]", max: 3 } },
    { note: "i=4, value 5 pops every smaller back, then front 1 expires by age. Index 4 is the new max.",
      window: [2, 4], best: [4],
      values: { i: 4, window: "[-1,-3,5]", deque: "[4]", max: 5 } },
    { note: "i=5, value 3 loses to 5 and joins the back. Later 6 and 7 will each drain the deque and become the new front.",
      window: [3, 5], best: [4],
      values: { i: 5, window: "[-3,5,3]", deque: "[4,5]", max: 5 } },
    { note: "Done. Window maxima are [3,3,5,5,6,7]. Each index entered once and left at most once, so the nested pops stayed linear.",
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
  dryIntro: "Walk <code>[1, 3, -1, -3, 5, 3, 6, 7]</code> with window <code>k = 3</code>. " +
    "The deque holds live candidate indices; the front is the max of the current window once it is full.",
  steps: [
    "<strong>Name a decreasing deque of indices</strong> for window maximum, because the front " +
      "must stay the largest live value and the back is the only place a new arrival is allowed to land.",
    "<strong>For each index i, pop the back first</strong> while <code>a[back] &le; a[i]</code>. " +
      "Those older values can never win a later window that also contains <code>i</code>, so keeping " +
      "them would only waste space and poison the front later.",
    "<strong>Push i, then pop the front by age</strong> while <code>front &le; i-k</code>. The " +
      "new index is now live, and anything that has slid out of the window of size <code>k</code> " +
      "must leave even if it is still the biggest number you have seen.",
    "<strong>Record the front only once the window is full</strong>, that is when " +
      "<code>i &ge; k-1</code>. Writing earlier invents a short prefix window the statement did not ask for.",
    "<strong>For shortest subarray with sum &ge; k</strong>, flip the deque to increasing prefixes. " +
      "Pop the front when <code>P[i] - P[front] &ge; k</code> because that start already works and " +
      "a later start can only make the same end shorter.",
    "<strong>Keep structural BFS on a plain FIFO</strong>: <code>addLast</code> / " +
      "<code>pollFirst</code> only. Mixing in <code>peekLast</code> is reserved for 0-1 BFS, not " +
      "for a monotonic window.",
    "<strong>Use ArrayDeque and long prefix sums</strong> so the structure is contiguous in memory " +
      "and a sum of <code>10&#8309;</code> values near <code>10&#8313;</code> does not wrap a Java " +
      "<code>int</code> before you compare it to <code>k</code>.",
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
        "<span class=\"eq\">T(n) = n pushes + P_back + P_front, each P \u2264 n, so T(n) = \u0398(n)</span>",
      "<p>The nested loops are therefore not a hidden quadratic: one arrival may drain the " +
        "whole back, but those indices never return. A heap of size <code>k</code> is " +
        "<code>O(n log k)</code> and cannot delete the expired max without a lazy-deletion map. " +
        "At <code>n = 10&#8309;</code> the deque is about <code>3&times;10&#8309;</code> " +
        "operations; the heap is closer to <code>1.7&times;10&#8310;</code>. The deque wins " +
        "whenever you only need min or max, not the k-th.</p>",
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
      bug: "An index exactly k ago stays on the front and poisons every later max. It looks " +
        "correct because the off-by-one is still inside a slightly larger window than the spec asked for.",
      fix: "Pop while peekFirst \u2264 i-k, so anything strictly outside the window of size k ending at i is gone." },
    { title: "Using < instead of \u2264 when popping the back",
      bug: "Equal values pile up at the back; the older equal expires later and you keep a " +
        "stale index as the front after the newer twin has already left.",
      fix: "Pop the back on \u2264 so the newest equal sits at the front when the older one expires." },
    { title: "Recording the max before the window is full",
      bug: "ans[0] is written at i=0 when k=3, inventing a one-element window. The sample of " +
        "n=k still passes, so the bug hides until a longer array arrives.",
      fix: "Only record a[peekFirst] once i \u2265 k-1, when the window ending at i actually has k elements." },
    { title: "Sliding window on values when negatives exist",
      bug: "Two pointers for sum \u2265 k look right from the positive-window lecture, but a " +
        "negative in the middle means shrinking the left end can make the sum larger, not smaller.",
      fix: "Build prefix sums and keep an increasing deque of prefix indices (LC 862), not a shrinkable window on the raw values." },
    { title: "LinkedList as a deque",
      bug: "LinkedList works as a deque and the API looks identical, so the code is correct, " +
        "but every node is a separate object and the judge's time limit is tighter than it looks.",
      fix: "Use ArrayDeque with pollFirst/Last, peekFirst/Last, addFirst/Last. It is the contiguous Java deque and the one the judge expects." },
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
      "<p>You can, with lazy deletion of indices <code>&le; i-k</code> when they appear at the " +
      "top. That is correct and <code>O(n log n)</code>, but it is more code and a worse bound. " +
      "The deque is linear because each index is pushed once and popped once, and it is the " +
      "answer an interviewer wants when the query is only min or max, not the k-th.</p>"],
    ["Can the deque store values instead of indices?",
      "<p>Only if you also store the index beside the value as a pair. The age test " +
      "<code>front &le; i-k</code> needs the position, and a value-only deque cannot tell " +
      "whether the front has already left the window. Storing indices is the default: the " +
      "value is one lookup away as <code>a[dq.peekFirst()]</code>.</p>"],
    ["Shortest subarray with sum \u2265 k and all positives?",
      "<p>Then a two-pointer sliding window on the array itself is enough, because every " +
      "prefix is strictly increasing and shrinking the left end can only decrease the sum. " +
      "The deque on prefixes is what you reach for once negatives appear, since a negative " +
      "breaks that shrink-makes-smaller assumption.</p>"],
    ["Implement a queue with two stacks?",
      "<p>Use an inbox stack for push and an outbox stack for pop: dump the whole inbox into " +
      "the outbox only when the outbox is empty, so each element moves at most twice. That is " +
      "amortised <code>O(1)</code> per operation. <code>ArrayDeque</code> already is a queue; " +
      "this trick is the design-question version, not the window-maximum version.</p>"],
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
  readTime: "28 min",
  tagline: "Pointer surgery under a fixed extra-space budget: reverse a range, detect a cycle " +
    "and its entry, merge two ordered lists, and clone a graph that happens to look like a list.",
  tags: ["linked list", "two pointers", "Floyd", "in-place", "P0"],
  prereqs: [["Two Pointers", "../01-arrays-and-windows/two-pointers.html"]],
  why: [
    "You are given the list <code>1 &rarr; 2 &rarr; 3 &rarr; 4 &rarr; 5</code> and asked to " +
      "reverse it in place, returning the new head 5. You cannot jump to index 3 the way you " +
      "would in an array; you can only follow a <code>next</code> pointer, and the moment you " +
      "overwrite <code>curr.next</code> the rest of the list is gone unless you saved it. The " +
      "whole family of interview questions is that constraint: rewrite pointers in " +
      "<code>O(1)</code> extra memory on a structure you cannot index into.",
    "They keep being asked because they punish sketchy pointer handling the way arrays punish " +
      "off-by-ones, and the wrong version often looks correct on the sample. A missed save of " +
      "<code>curr.next</code> drops the suffix and still reverses a one-node list. A cycle " +
      "detector that returns the meeting point instead of the entry works whenever the stem " +
      "length is a multiple of the cycle. A k-group reverse that does not first check that " +
      "<code>k</code> nodes remain corrupts the leftover tail. On <code>n = 10&#8309;</code> " +
      "you also cannot recurse: a Java stack frame per node blows up around " +
      "<code>n = 10&#8308;</code>.",
    "Five famous problems share three moves &mdash; save the next, rewire, advance &mdash; plus " +
      "one dummy node so replacing the head is the same code path as every other splice. " +
      "Floyd's cycle algorithm is the one piece of theory: a pointer that walks one step and a " +
      "pointer that walks two steps meet inside a cycle; reset one to the head and walk both at " +
      "one step to land on the entry. Copy-list-with-random is the other classic: a " +
      "<code>HashMap</code> is <code>O(n)</code> space; weaving a clone between each original, " +
      "wiring randoms, then unweaving is the <code>O(1)</code>-space follow-up.",
    "In a real statement the signal is a singly-linked input plus an in-place rearrangement, " +
      "a cycle question, or a merge of ordered lists, usually with <code>n &le; 10&#8309;</code> " +
      "and a constant extra-space budget. If you need random access by index, copy to an array. " +
      "If you are merging <code>k</code> lists and <code>k</code> is large, that is a heap " +
      "problem, not more pointer surgery.",
  ],
  insight: "Before you rewire <code>curr.next</code>, save it. After you rewire, the old " +
    "successor is gone unless you held it. Every in-place list algorithm is that sentence plus " +
    "a dummy node so replacing the head is not a special case.",
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
  constraint: "<code>n &le; 10&#8309;</code> with an <code>O(1)</code> extra-space budget is " +
    "the usual tell: you must rearrange pointers, not copy the list into an array. Recursion " +
    "<code>n</code> frames deep blows the Java stack around <code>n = 10&#8308;</code>, so " +
    "prefer the iterative reverse even when the recursive one looks shorter.",
  core: [
    "Iterative reverse uses three pointers. <code>prev</code> starts at <code>null</code> and " +
      "will become the new head; <code>curr</code> starts at <code>head</code> and walks the " +
      "still-untouched suffix. Each step first saves <code>nxt = curr.next</code>, then sets " +
      "<code>curr.next = prev</code>, then advances <code>prev = curr</code> and " +
      "<code>curr = nxt</code>. When <code>curr</code> is null, <code>prev</code> is the new " +
      "head. Reverse-in-k-group is that same walk applied to successive slices, with a dummy " +
      "node in front so the first group is not a special case. Walk <code>k</code> steps from " +
      "the node before the group first; if you run out, leave the leftover tail in original order.",
    "Floyd starts two pointers at the head. <code>slow</code> walks one step, <code>fast</code> " +
      "walks two. If there is a cycle they eventually share a node, but that meeting point is " +
      "somewhere on the cycle, not necessarily the entry. Set <code>slow</code> back to the " +
      "head and walk both one step at a time; they meet at the entry because the stem length " +
      "equals the remaining distance around the cycle. Merge of two sorted lists is a dummy " +
      "plus a tail that always attaches the smaller current head. Copy-list-with-random is a " +
      "<code>HashMap</code> from old node to new node first; weave a clone after each original " +
      "only if they forbid the extra space.",
    "Trace reverse on <code>1 &rarr; 2 &rarr; 3</code>. Start with <code>prev = null</code> " +
      "and <code>curr</code> on 1. Save <code>nxt = 2</code>, point 1 at null, then slide: " +
      "<code>prev</code> is 1 and <code>curr</code> is 2. Save <code>nxt = 3</code>, point 2 " +
      "at 1, slide onto 3. Save <code>nxt = null</code>, point 3 at 2, slide onto null. Return " +
      "<code>prev</code>, which is 3, and the list is <code>3 &rarr; 2 &rarr; 1</code>. Losing " +
      "<code>nxt</code> on any of those three steps would have dropped the suffix forever.",
  ],
  invariant: "<p><strong>Reverse:</strong> the chain from <code>prev</code> backwards is the " +
    "already-reversed prefix; the chain from <code>curr</code> forwards is still untouched.</p>" +
    "<p><strong>Floyd:</strong> after the first meeting, distance(head, entry) equals " +
    "distance(meeting, entry) along the cycle. Walking both at speed 1 from those two starts " +
    "collides at the entry.</p>" +
    "<p>In plain words, you have flipped every arrow you have already walked past, you have " +
    "not yet touched anything still ahead of <code>curr</code>, and a dummy whose " +
    "<code>next</code> is the real head makes \"what if we replace the head?\" the same four " +
    "pointer writes as every other splice. If a reverse step ever overwrites " +
    "<code>curr.next</code> without a saved <code>nxt</code>, the suffix is gone and the " +
    "invariant is broken.</p>",
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
    { note: "Start with prev null and curr on the head 1, so the whole list is still untouched.",
      active: [0], dim: [1, 2, 3, 4],
      values: { prev: "null", curr: 1, nxt: "\u2014" } },
    { note: "Save nxt as 2 first, point 1 at null, then slide prev onto 1 and curr onto 2.",
      active: [1], done: [0], dim: [2, 3, 4],
      values: { prev: 1, curr: 2, nxt: 2 } },
    { note: "Save nxt as 3 first, point 2 back at 1, then slide prev onto 2 and curr onto 3.",
      active: [2], done: [0, 1], dim: [3, 4],
      values: { prev: 2, curr: 3, nxt: 3 } },
    { note: "Save nxt as 4 first, point 3 back at 2, then slide prev onto 3 and curr onto 4.",
      active: [3], done: [0, 1, 2], dim: [4],
      values: { prev: 3, curr: 4, nxt: 4 } },
    { note: "Save nxt as 5 first, point 4 back at 3, then slide prev onto 4 and curr onto 5.",
      active: [4], done: [0, 1, 2, 3],
      values: { prev: 4, curr: 5, nxt: 5 } },
    { note: "Save nxt as null, point 5 back at 4, then curr becomes null. Return prev, the new head 5.",
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
    "<strong>Draw the nodes and every next pointer</strong>, and put a dummy in front whenever " +
      "the head might change. Without the picture, a splice that looks local silently drops a suffix.",
    "<strong>Reverse with three pointers</strong>: save <code>nxt</code> first, then point " +
      "<code>curr.next</code> at <code>prev</code>, then slide both pointers forward. Return " +
      "<code>prev</code> because that is the new head once <code>curr</code> walks off the end.",
    "<strong>For k-group, walk k nodes from groupPrev first.</strong> If you hit null, stop " +
      "and leave the leftover tail alone; only then reverse that slice and stitch it back so " +
      "the previous group still points at the new head.",
    "<strong>Detect a cycle with different speeds</strong>: while fast and fast.next are non-null, " +
      "move slow one step and fast two. They meet inside the cycle if one exists, and the null " +
      "guard is what proves the list is finite.",
    "<strong>Find the entry by resetting slow to the head</strong> after the first meeting, then " +
      "walk both at one step. Returning the meeting point itself is only correct when the stem " +
      "length happens to be a multiple of the cycle.",
    "<strong>Merge with a dummy and a tail</strong> so attaching the smaller current head is " +
      "one assignment. When one list runs out, hang the rest on the tail and return " +
      "<code>dummy.next</code>, not the old head.",
    "<strong>Copy random with a HashMap first</strong>, old node to new node, in two obvious " +
      "passes. Mention the weave as the <code>O(1)</code>-space follow-up and write it only if they ask.",
  ],
  dryIntro: "Reverse groups of <code>k = 2</code> on <code>1 &rarr; 2 &rarr; 3 &rarr; 4 &rarr; 5</code>. " +
    "<code>groupPrev</code> is the node sitting just before the group about to flip, starting at the dummy.",
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
      "<p>Reverse and k-group visit each node a constant number of times &mdash; save, rewire, " +
        "advance, and at most one extra walk of <code>k</code> to test the group. Floyd: fast " +
        "walks at most twice the stem plus one extra lap of the cycle, then both walk the stem:</p>" +
        "<span class=\"eq\">T(n) = \u0398(n) pointer assignments</span>",
      "<p>Merge of two lists is <code>&Theta;(n+m)</code> splices. Merge of <code>k</code> lists " +
        "by a heap is <code>O(n log k)</code> on the heaps page. Copy-random is two or three " +
        "linear passes. At <code>n = 10&#8309;</code> that is a few hundred thousand pointer " +
        "writes, not a recursive stack of a hundred thousand frames.</p>",
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
      bug: "The suffix becomes unreachable the instant you overwrite curr.next. It still " +
        "reverses a one-node list, which is why the sample can pass and everything longer fails.",
      fix: "ListNode nxt = curr.next as the first line of the loop. Save, then rewire, then advance." },
    { title: "Returning Floyd's meeting point as the cycle entry",
      bug: "LC 141 is done, LC 142 is not. The meeting point equals the entry only when the " +
        "stem length happens to be a multiple of the cycle, so many samples look correct.",
      fix: "Reset slow to head after they meet, walk both at one step, and return the second meeting." },
    { title: "Reversing a leftover tail in k-group",
      bug: "A final group of size less than k is reversed because the loop did not check " +
        "that k nodes remain. The spec says leave that tail in original order.",
      fix: "Walk k steps from groupPrev first; if you hit null, break before reversing that incomplete slice." },
    { title: "Forgetting the dummy when the head can change",
      bug: "Merge, delete-the-head, and the first k-group all return the old head, which now " +
        "sits in the middle of the list. The rest of the splices looked local and correct.",
      fix: "ListNode dummy = new ListNode(0, head); do every splice through the dummy; then return dummy.next as the real head." },
    { title: "Comparing node values instead of references in Floyd",
      bug: "slow.val == fast.val on a list with duplicate values reports a false cycle, or " +
        "misses a real one when two different nodes happen to share a value.",
      fix: "Compare the node objects themselves: slow == fast. Values are irrelevant to the meeting test." },
    { title: "Breaking the original list in the weave copy",
      bug: "clone.random is wired to an original node, or the caller's list is left interleaved " +
        "with clones, because the split pass never restored orig.next.",
      fix: "Set clone.random = orig.random.next so randoms stay on clones, then restore orig.next = clone.next in the same split pass." },
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
      "<p>Yes, that is LC 287. An array <code>a</code> of <code>n+1</code> values in " +
      "<code>1..n</code> is a functional graph <code>i &rarr; a[i]</code>: every index has " +
      "outdegree one, so a duplicate value creates exactly one cycle. The cycle entry is the " +
      "duplicate. The same code runs with <code>slow = a[slow]</code> and " +
      "<code>fast = a[a[fast]]</code>.</p>"],
    ["How do you reverse groups of k if k does not divide n?",
      "<p>Leave the leftover tail in original order, which is the LC 25 spec. From the node " +
      "before the would-be group, try to walk <code>k</code> steps; if you cannot, stop and " +
      "do not reverse. Test <code>n=5, k=3</code> (answer starts 3,2,1 and ends 4,5), " +
      "<code>k=1</code> (identity), and <code>k=5</code> (full reverse).</p>"],
    ["Map vs weave for copy-random in 25 minutes?",
      "<p>Write the map. Two obvious passes, old node to new node, <code>O(n)</code> extra " +
      "memory, and you will finish. Mention the weave &mdash; clone after each original, wire " +
      "randoms via <code>orig.random.next</code>, then split &mdash; as the " +
      "<code>O(1)</code>-space follow-up, and write it only if they ask.</p>"],
    ["How do you merge k sorted lists?",
      "<p>Put the current head of each list into a min-heap and always splice the smallest, " +
      "which is <code>O(n log k)</code> on <code>n</code> total nodes. Pairwise tournament " +
      "merge has the same bound. Repeatedly merging into an accumulator is " +
      "<code>O(n k)</code> and dies when <code>k</code> is large. Details sit on the " +
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
  readTime: "28 min",
  tagline: "A binary heap is an array with parent-child arithmetic: sift in O(log n), heapify " +
    "in O(n), and the interview patterns are k-largest, merge-k, two-heap median, and lazy deletion.",
  tags: ["heap", "priority queue", "heapify", "median", "P0"],
  prereqs: [
    ["Complexity Analysis", "../00-foundations/complexity-analysis.html"],
    ["K-th Element & Selection", "../01-arrays-and-windows/kth-and-selection.html"],
  ],
  why: [
    "You are handed <code>[3, 2, 1, 5, 6, 4]</code> and asked for the 2nd-largest number. " +
      "Sorting the whole array answers 5 and costs <code>n log n</code> &mdash; about " +
      "<code>1.7&times;10&#8310;</code> comparisons at <code>n = 10&#8309;</code> &mdash; and " +
      "it cannot run at all on a stream that never sits still long enough to sort. A " +
      "<em>heap</em> is a tree stored as an array that keeps the current minimum (or maximum) " +
      "at the root, so you can read the extreme in one lookup and insert or delete it in " +
      "<code>log n</code> sifts. Problems that look like sorting but only need the extreme of " +
      "a live set &mdash; k largest, merge k sorted lists, a running median &mdash; are heap problems.",
    "Two facts separate people who have called <code>PriorityQueue</code> from people who " +
      "understand it. First, building a heap from an array is <code>O(n)</code>, not " +
      "<code>O(n log n)</code>: you sift down from the last parent, and the geometric series " +
      "of subtree heights sums to less than <code>2n</code>. Second, Java's heap cannot delete " +
      "an arbitrary element in logarithmic time, so \"remove this later\" is <em>lazy deletion</em> " +
      "&mdash; leave the stale value in the heap and skip it when it eventually shows up at the " +
      "top, rather than calling the linear <code>remove</code>.",
    "The two-heap median combines both ideas. A max-heap of the lower half and a min-heap of " +
      "the upper half, kept within one of each other in size, gives the median in one peek and " +
      "accepts each insertion in <code>log n</code>. Sliding-window median adds lazy deletion " +
      "on top so a value that just left the window is ignored the next time it reaches a root. " +
      "In a real statement the signal is <code>n &le; 10&#8309;</code> next to \"k largest\", " +
      "\"merge k lists\", or a stream of operations that must answer after every insert.",
  ],
  insight: "A heap answers \"what is the best of a live set?\" in logarithmic updates. If you " +
    "need the k-th, keep a heap of size k or two heaps that split at the median. If you need " +
    "to delete from the middle, fake it with lazy skipping rather than a linear remove.",
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
    "heap signature: you can afford <code>n log k</code>, not a full sort, and not a linear " +
    "scan per query. Full <code>n log n</code> sort is the fallback when <code>k</code> is " +
    "already <code>&Theta;(n)</code>. Never write a comparator as <code>(a, b) &rarr; b - a</code> " +
    "on ints &mdash; overflow breaks the contract. Use <code>Integer.compare</code> or " +
    "<code>reverseOrder()</code>.",
  core: [
    "A binary heap is an array <code>h[0..n)</code> with a parent at <code>(i-1)/2</code> and " +
      "children at <code>2i+1</code> and <code>2i+2</code>. A min-heap keeps " +
      "<code>h[parent] &le; h[child]</code> at every index, so the root is the global minimum. " +
      "Insert appends and sifts up; delete-min swaps the last leaf into the root and sifts down. " +
      "Both walks are <code>O(log n)</code> because the height is <code>floor(log n)</code>. " +
      "Heapify builds the same property in <code>O(n)</code> by sifting down from the last " +
      "parent <code>n/2-1</code> to 0. Java <code>PriorityQueue</code> is a min-heap; a max-heap " +
      "is <code>new PriorityQueue&lt;&gt;(Collections.reverseOrder())</code>.",
    "For k-largest, a min-heap of size <code>k</code> is the default: the root is the smallest " +
      "of the k largest seen so far, which is exactly the current k-th, and anything smaller " +
      "than that root is discarded. Two-heap median: every value in <code>lo</code> (a max-heap " +
      "of the lower half) is <code>&le;</code> every value in <code>hi</code> (a min-heap of the " +
      "upper half), and the sizes differ by at most one. Lazy deletion is a map of stale counts: " +
      "before every peek or poll, throw away a root whose cancel-count is still positive, because " +
      "<code>remove(x)</code> on a <code>PriorityQueue</code> is linear.",
    "Trace k-largest on <code>[3, 2, 1, 5, 6, 4]</code> with <code>k = 2</code> and a min-heap. " +
      "See 3: the heap is not full, so it becomes <code>[3]</code>. See 2: insert, heap " +
      "<code>[2, 3]</code>, root 2. See 1: the heap is full and 1 is smaller than the root, so " +
      "discard it. See 5: 5 beats 2, evict 2, heap <code>[3, 5]</code>. See 6: evict 3, heap " +
      "<code>[5, 6]</code>. See 4: 4 loses to 5 and is discarded. The root 5 is the 2nd-largest, " +
      "and you never stored more than two numbers.",
  ],
  invariant: "<p><strong>Heap property:</strong> every parent is at least as extreme as its " +
    "children, so the root is the global extreme.</p>" +
    "<p><strong>k-largest min-heap:</strong> the heap holds the k largest seen so far; its root " +
    "is the smallest of those, i.e. the current k-th.</p>" +
    "<p><strong>Two-heap median:</strong> <code>lo.peek()</code> is the median on an odd count, " +
    "or the average of the two peeks on an even count, with a <code>long</code> cast.</p>" +
    "<p>In plain words, the best of the live set always sits at the root, a size-k heap for " +
    "k-largest never keeps a value that can no longer be among the k winners, and the two " +
    "median heaps always split the numbers so everything on the left is " +
    "<code>&le;</code> everything on the right. If a parent is ever worse than a child, or " +
    "the two halves drift more than one apart, the next peek is a lie.</p>",
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
    { note: "See 3. The heap is still empty so 3 is inserted and becomes the only candidate.",
      active: [0], dim: [1, 2, 3, 4, 5],
      values: { x: 3, heap: "[3]", kth: "\u2014" } },
    { note: "See 2. Insert beside 3. The min-heap is now [2, 3] and the root 2 is the current 2nd-largest.",
      active: [1], done: [0], dim: [2, 3, 4, 5],
      values: { x: 2, heap: "[2, 3]", kth: 2 } },
    { note: "See 1. The heap is already size 2 and 1 is smaller than the root, so 1 can never be among the two largest.",
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
  dryIntro: "Walk <code>[3, 2, 1, 5, 6, 4]</code> with a min-heap of size <code>k = 2</code>. " +
    "The root is always the smaller of the two largest seen so far, which is the running 2nd-largest.",
  steps: [
    "<strong>Name the live set and the order first</strong> so the polarity is not guessed later. " +
      "Decide min-heap or max-heap, and whether the heap holds k items, everything, or two halves " +
      "split at the median.",
    "<strong>For k-largest, keep a min-heap of size k.</strong> Offer each value, then poll if " +
      "the size exceeds k, because the extreme you need to evict is the smallest of the current " +
      "winners. The root at the end is the k-th largest.",
    "<strong>For merge-k, heap the current heads</strong> as nodes, not just values, so after " +
      "you poll a node you can offer its <code>next</code>. A value-only heap would lose the " +
      "rest of that list.",
    "<strong>For a stream median, offer into lo or hi</strong> by comparing with " +
      "<code>lo.peek()</code>, then rebalance so the sizes differ by at most one. Without that " +
      "fix-up the next peek is a value from the wrong half.",
    "<strong>For expiry, never call remove.</strong> Increment a stale counter for the leaving " +
      "value and skip a root in <code>prune()</code> whenever its count is still positive, " +
      "because <code>remove</code> is linear and n of them are quadratic.",
    "<strong>Build from an array with heapify</strong>, sifting down from the last parent " +
      "<code>n/2-1</code>, not with n separate inserts. The geometric series of heights is " +
      "what makes the build linear.",
    "<strong>Write comparators with Integer.compare or reverseOrder()</strong>, never " +
      "subtraction of two ints. Overflow on large magnitudes breaks the heap contract silently " +
      "and the root is no longer the true extreme.",
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
      "<p>K-largest: n offers into a heap of size at most k, and each offer or poll sifts " +
        "<code>O(log k)</code> levels:</p>" +
        "<span class=\"eq\">T(n, k) = n log k</span>",
      "<p>At <code>n = 10&#8309;</code> and <code>k = 100</code> that is about " +
        "<code>7&times;10&#8309;</code> comparisons, not the <code>1.7&times;10&#8310;</code> of a " +
        "full sort. Heapify sums <code>h &middot; n / 2^h</code> over heights and stays under " +
        "<code>2n</code>. Merge-k is n polls on a heap of size k. Lazy deletion adds at most " +
        "one extra poll per inserted element, still amortised constant extra work.</p>",
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
      bug: "Subtracting two ints overflows on large magnitudes and the comparator contract " +
        "breaks silently, so the root is no longer the true max. It looks like the textbook " +
        "trick for reversing order.",
      fix: "Build the max-heap with Collections.reverseOrder, or compare with Integer.compare(b, a). Never subtract two ints just to reverse their order." },
    { title: "Min-heap of size n for k-largest",
      bug: "You keep every value and pay n log n, which is exactly the sort you were trying " +
        "to avoid. The sample still returns the right k-th, so the wasted work hides.",
      fix: "Offer, then if (size > k) poll(). Opposite polarity: a min-heap of size k for k-largest." },
    { title: "Calling pq.remove(x) in a loop",
      bug: "remove scans the whole heap, so it is linear. Inside n operations that is " +
        "quadratic, and the code still looks like the obvious \"delete this key\" API.",
      fix: "Lazy deletion: a stale-count map, and prune the top while its cancel-count is still positive." },
    { title: "Forgetting to rebalance the two heaps",
      bug: "Sizes drift by more than one, so the median is a peek from the wrong half. The " +
        "first two operations often still pass because the heaps have not had time to skew.",
      fix: "After every offer: if lo is two bigger, move lo to hi; if hi is bigger at all, move hi to lo." },
    { title: "Averaging two ints without long",
      bug: "(lo.peek() + hi.peek()) / 2.0 adds two ints first, wraps past two billion, and " +
        "only then promotes to double. The overflow has already happened.",
      fix: "((long) lo.peek() + hi.peek()) / 2.0 so the sum is a long before the divide." },
    { title: "Heapifying by n inserts",
      bug: "You tell the interviewer that building the heap is O(n log n), which is true of " +
        "n inserts and false of heapify. The distinction is a common follow-up.",
      fix: "Sift down from n/2-1 to 0. Sketch the geometric series of heights to defend the O(n) bound." },
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
      "<p>At height h there are at most <code>n / 2^{h+1}</code> nodes, and sifting one of " +
      "them costs <code>O(h)</code>. The sum <code>h &middot; n / 2^h</code> over h converges " +
      "to less than <code>2n</code> because <code>Sum h x^h = x / (1-x)^2</code> at " +
      "<code>x = 1/2</code>. Quoting \"geometric series of heights\" is the short interview " +
      "version of the same argument.</p>"],
    ["How do you delete from a PriorityQueue in log time?",
      "<p>You do not. remove(x) is linear. Options: lazy deletion with a stale map; wrap " +
      "entries with a dead flag; use TreeMap if you also need floor/ceiling; write your own " +
      "heap with an index map for decrease-key. In interviews, lazy deletion is expected for " +
      "window-median and Dijkstra-without-decrease-key.</p>"],
    ["When is quickselect better than a heap for k-th?",
      "<p>When the array is mutable, you need one k-th, and you do not need the k elements as " +
      "a set afterwards. Expected time is linear. Heaps are deterministic <code>O(n log k)</code>, " +
      "work on streams that you cannot rearrange, and return the k elements themselves. Lead " +
      "with the heap in a design-flavoured interview and mention quickselect as the one-shot alternative.</p>"],
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
  readTime: "26 min",
  tagline: "Java's red-black tree in a box: floor, ceiling, first/last and subMap turn " +
    "\"nearest key\" and \"live set of intervals\" into O(log n) per operation.",
  tags: ["TreeMap", "TreeSet", "floor", "ceiling", "intervals", "P1"],
  prereqs: [
    ["Heaps & Priority Queue", "heaps-and-priority-queue.html"],
    ["Java for DSA", "../00-foundations/java-for-dsa.html"],
  ],
  why: [
    "You must decide whether each new booking <code>[s, e)</code> overlaps any existing one. " +
      "The first request <code>[10, 20)</code> is free; <code>[15, 25)</code> collides with it; " +
      "<code>[20, 30)</code> only touches 20 and is legal on a half-open spec. Scanning every " +
      "previous booking is correct and costs one pass per request. After " +
      "<code>n = 10&#8309;</code> bookings that is about <code>5&times;10&#8313;</code> " +
      "comparisons, and the judge will cut you off. You need the nearest neighbour of " +
      "<code>s</code>, not a scan.",
    "A <code>HashMap</code> answers \"is this exact key present?\" and cannot tell you the " +
      "next key to the left. A heap answers \"what is the current min?\" and cannot tell you " +
      "the predecessor of an arbitrary value. A balanced binary search tree answers both: " +
      "<em>floor</em> (greatest key <code>&le; x</code>), <em>ceiling</em> (least key " +
      "<code>&ge; x</code>), higher, lower, first, last, and a view of a key range. Java ships " +
      "that tree as <code>TreeMap</code> / <code>TreeSet</code>. For calendar, store " +
      "start <code>&rarr;</code> end; the predecessor and successor of the query start are the " +
      "only two intervals that can conflict.",
    "Sweep-line problems &mdash; covered points, skyline, running coverage of the number line " +
      "&mdash; are the same tree with a running counter as the payload: put a <code>+1</code> " +
      "at each left endpoint and a <code>-1</code> at each right, then walk the keys in order. " +
      "This page is how you write the <code>O(n log n)</code> solution when a deque is too " +
      "specialised and a heap is too weak. The Java API is the whole skill: " +
      "<code>floorKey</code> versus <code>lowerKey</code> is closed versus open, and unboxing " +
      "a null floor is the NPE that only fires on the minimum query.",
  ],
  insight: "HashMap is exact match. Heap is the current extreme. TreeMap is the nearest key " +
    "and an ordered range. Floor, ceiling and subMap are the three methods that justify paying " +
    "<code>log n</code> instead of hashing.",
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
  constraint: "<code>n &le; 10&#8309;</code> with n ordered inserts plus n predecessor queries " +
    "is the TreeMap signature: <code>O(n log n)</code> is the budget, about " +
    "<code>1.7&times;10&#8310;</code> node visits, not a quadratic scan of previous intervals. " +
    "Null-check every floor and ceiling before unboxing; the miss is a real answer, not an error.",
  core: [
    "<code>TreeMap&lt;K,V&gt;</code> is a red-black tree of keys &mdash; a self-balancing binary " +
      "search tree, so every walk from the root to a leaf is <code>O(log n)</code>. " +
      "<code>floorKey(x)</code> is the greatest key <code>&le; x</code>, or null if none exists. " +
      "<code>ceilingKey(x)</code> is the least key <code>&ge; x</code>. <code>lowerKey</code> and " +
      "<code>higherKey</code> are the strict versions. <code>TreeSet</code> is the same tree with " +
      "dummy values. A null return means \"no such key\"; writing <code>int f = set.floor(x)</code> " +
      "unboxes that null into a <code>NullPointerException</code> the first time x is smaller " +
      "than every key.",
    "Interval bookkeeping stores each booked interval as <code>map.put(start, end)</code> on the " +
      "half-open range <code>[start, end)</code>. To test a new <code>[s, e)</code>, look up " +
      "<code>prev = floorKey(s)</code> and <code>next = ceilingKey(s)</code>. They overlap if " +
      "<code>prev</code> exists and its end is strictly after <code>s</code>, or if " +
      "<code>next</code> exists and starts strictly before <code>e</code>. Two lookups replace " +
      "a scan of every booking. <code>subMap</code> is a live view of a key range, not a copy: " +
      "mutating it mutates the tree.",
    "Trace My Calendar on an empty map. Book <code>[10, 20)</code>: both neighbours are null, " +
      "so store <code>10 &rarr; 20</code>. Book <code>[15, 25)</code>: floor of 15 is 10 and " +
      "that interval ends at 20, which is past 15, so reject. Book <code>[20, 30)</code>: floor " +
      "of 20 is still 10, but the end 20 is not strictly after 20, and there is no ceiling " +
      "before 30, so the touch is legal and you store <code>20 &rarr; 30</code>. Two probes, " +
      "never a walk over the bookings you already accepted.",
  ],
  invariant: "<p>The map's keys are totally ordered. After every put / remove:</p>" +
    "<span class=\"eq\">floor(x) = max { k in keys | k \u2264 x }  (or none)</span>" +
    "<p>For intervals stored as start \u2192 end, the only intervals that can overlap a query " +
    "[s, e) are the predecessor of s and the successor of s. Checking those two is complete.</p>" +
    "<p>In plain words, the tree always knows the nearest key on the left and on the right of " +
    "any query, and for a calendar those two neighbours are the only bookings that can collide " +
    "with the new request. If a book ever scans the whole map, or a floor is unboxed without a " +
    "null check, one half of that claim is already broken.</p>",
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
    "<strong>Name the ordered key first</strong> so the tree is not built on the wrong field. " +
      "Decide whether you are ordering values, start times, or coordinates; everything else is a payload.",
    "<strong>Pick TreeSet versus TreeMap from the payload.</strong> A set is enough when you " +
      "only need presence and neighbours; a map is required when each key carries an end time, " +
      "a count, or a delta.",
    "<strong>Choose floor/ceiling versus lower/higher</strong> from whether an exact match " +
      "counts as a neighbour. Assign the result to <code>Integer</code> or <code>Long</code> " +
      "and null-check before unboxing, because \"no such key\" is a real answer.",
    "<strong>For intervals, store [s, e) as start to end</strong> and probe " +
      "<code>floorKey(s)</code> and <code>ceilingKey(s)</code> only. Those two neighbours are " +
      "the only bookings that can overlap the new request.",
    "<strong>For a window of values, keep a frequency TreeMap</strong>: merge +1 on enter, " +
      "decrement and remove on leave, then <code>lastKey() - firstKey()</code> is max minus min " +
      "without scanning the window.",
    "<strong>For a sweep, put coordinate deltas in the tree first</strong>, then iterate " +
      "<code>entrySet</code> in key order. Building the map and walking it are two separate " +
      "passes so you never mutate while iterating.",
    "<strong>Do not iterate the whole map to find a neighbour.</strong> That walk is linear " +
      "and throws away the reason you paid for a tree. Floor and ceiling are the " +
      "<code>O(log n)</code> API.",
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
      "<p>A red-black tree of n keys has height <code>O(log n)</code>. Each API call walks a " +
        "root-to-leaf path:</p>" +
        "<span class=\"eq\">T(n ops) = n \u00b7 O(log n) = O(n log n)</span>",
      "<p>At <code>n = 10&#8309;</code> that is about <code>1.7&times;10&#8310;</code> node " +
        "visits. The brute interval scan is <code>O(n)</code> per book and " +
        "<code>O(n&sup2;)</code> total, around <code>5&times;10&#8313;</code> comparisons. Two " +
        "TreeMap probes replace that scan. A window as a TreeMap of frequencies is " +
        "<code>O(n log n)</code> versus <code>O(n)</code> for two deques, which is why you " +
        "mention both and write the tree unless they push for linear.</p>",
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
      bug: "int f = set.floor(x) throws when x is smaller than every key. It looks like a " +
        "normal lookup, and the NPE often fires only on the minimum query after the sample passed.",
      fix: "Assign to Integer or Long, null-check, then unbox. The same rule applies to floorKey and ceilingKey." },
    { title: "floor vs lower on a closed interval",
      bug: "Using lowerKey(s) skips an interval that starts exactly at s, so a same-start " +
        "booking is accepted. Inclusive conflict needs the key that equals s, not the one before it.",
      fix: "Conflict with an interval that starts at s is a floor (inclusive). Stick to floor plus ceiling on the start." },
    { title: "Closed vs half-open overlap test",
      bug: "Testing prev.end >= s on a half-open spec rejects a legal touch at the shared " +
        "endpoint. [10, 20) and [20, 30) are allowed to meet at 20.",
      fix: "LC 729 is [s, e), so overlap is end > s on the predecessor and next < e on the successor." },
    { title: "TreeSet.remove of duplicate values in a window",
      bug: "A set cannot hold two equal values, so nearby-duplicate with t=0 silently drops " +
        "one of a pair and later reports no duplicate.",
      fix: "If duplicates of the values themselves matter, store indices or use a TreeMap of counts as a multiset." },
    { title: "Mutating a map while iterating entrySet",
      bug: "Putting a new delta while walking entrySet throws ConcurrentModificationException, " +
        "or silently skips an entry, because the tree's iterator is fail-fast.",
      fix: "Build the whole delta map first, then iterate. Or snapshot keySet into an ArrayList before mutating." },
    { title: "Comparator inconsistent with equals",
      bug: "A TreeMap with (a, b) -> a.x - b.x treats two objects with the same x as the same " +
        "key, so the second silently overwrites the first. Subtraction also overflows.",
      fix: "If keys can tie on the sort field, add a unique id as a tie-break. Never subtract ints to compare." },
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
      "<p>You need the interval that starts at or before <code>s</code>, so floor (inclusive). " +
      "If an interval starts exactly at <code>s</code> it overlaps <code>[s, e)</code> for any " +
      "<code>e &gt; s</code>. <code>lowerKey</code> would skip that same-start booking and " +
      "accept a collision. Stick to floor plus ceiling on the start and ignore lower/higher " +
      "for this pattern.</p>"],
    ["When do you prefer two deques over a TreeMap for max-min of a window?",
      "<p>When they want <code>O(n)</code> and the window is on an array you scan once. A " +
      "TreeMap of frequencies is <code>O(log n)</code> per step and shorter to write. LC 1438 " +
      "accepts both. Say both out loud, write the TreeMap unless they push for the linear " +
      "bound, and switch to two monotonic deques if they do.</p>"],
    ["How does this relate to a policy-based tree on Codeforces?",
      "<p>TreeMap cannot answer \"k-th key\" in <code>log n</code> without walking, because " +
      "Java's red-black tree does not store subtree sizes. <code>headMap(x).size()</code> is " +
      "<code>O(n)</code>, not logarithmic. Use a Fenwick tree or segment tree on compressed " +
      "keys, or accept a linear scan for order statistics. Policy-based trees in C++ are the " +
      "structure Java is missing here.</p>"],
    ["Can a TreeMap replace a heap?",
      "<p>Yes, with worse constants: <code>firstKey</code> is min, <code>pollFirstEntry</code> " +
      "is delete-min, and you also get floor, ceiling, and arbitrary delete in " +
      "<code>log n</code>. Stay with <code>PriorityQueue</code> when you only ever need the " +
      "extreme. A TreeMap of counts is still the cleanest multiset Java has, because a heap " +
      "cannot delete an arbitrary key in log time.</p>"],
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
  readTime: "26 min",
  tagline: "Design rounds are two structures glued together: LRU is HashMap + doubly linked " +
    "list, LFU is LRU buckets per frequency, and the randomized set is HashMap + ArrayList.",
  tags: ["design", "LRU", "LFU", "HashMap", "P0"],
  prereqs: [
    ["Linked Lists", "linked-lists.html"],
    ["Heaps & Priority Queue", "heaps-and-priority-queue.html"],
    ["Java for DSA", "../00-foundations/java-for-dsa.html"],
  ],
  why: [
    "You must implement <code>get</code> and <code>put</code> on a cache of capacity 2 so that " +
      "every operation is constant time. After <code>put(1)</code>, <code>put(2)</code>, " +
      "<code>put(3)</code> the oldest key 1 must already be gone, and a later <code>get(1)</code> " +
      "must miss. Scanning a list of pairs is correct and costs a full walk per call. After " +
      "<code>10&#8309;</code> operations on a cache of size <code>10&#8308;</code> that is about " +
      "<code>10&#8313;</code> steps, and the judge asked for <code>O(1)</code> worst case, not " +
      "amortised luck.",
    "\"Design LRU cache\" is the most-asked design question because it forces two bottlenecks " +
      "at once: find a key instantly, and know which key is the least recently used without " +
      "scanning. A <code>HashMap</code> solves lookup; a doubly linked list &mdash; each node " +
      "points to both neighbours, so unlink is four pointer writes &mdash; solves recency if " +
      "the newest node sits at the head. Miss either piece and eviction is linear. LFU is the " +
      "follow-up: one LRU list per frequency, plus an integer <code>minFreq</code> so the victim " +
      "is the least-recent key among the least-frequent ones.",
    "The other classics are the same recipe with a different pair of bottlenecks. A min-stack " +
      "stores <code>minSoFar</code> beside each push so popping the current min does not lose " +
      "the previous one. Insert-delete-getRandom in <code>O(1)</code> is a map plus an " +
      "<code>ArrayList</code>, and delete is swap-with-last so the hole is not a linear shift. " +
      "The transferable sentence is: name the operations, name the bottleneck, pick one " +
      "structure per bottleneck, then write the glue that keeps them in sync on every mutation.",
  ],
  insight: "<code>O(1)</code> lookup is a HashMap. <code>O(1)</code> recency is a doubly linked " +
    "list with dummy head and tail. <code>O(1)</code> random is an ArrayList. Eviction must " +
    "update both sides in the same method, or the next get returns a key you already threw away.",
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
  constraint: "Capacity up to <code>10&#8308;</code> and <code>10&#8309;</code> operations with " +
    "an <code>O(1)</code> worst-case bound per call is the design-glue signature. Do not scan " +
    "the list on get or evict. Dummy head and tail nodes make an empty list and a one-node " +
    "list the same four pointer writes as a full one.",
  core: [
    "LRU stores each entry as a <code>Node(key, val)</code> in a doubly linked list, newest " +
      "just after a dummy head, oldest just before a dummy tail. A <code>HashMap</code> from " +
      "key to that node makes lookup one hash. <code>get</code> finds the node, unlinks it, " +
      "and inserts it at the head so it is now the most recent. <code>put</code> updates and " +
      "moves an existing key the same way, or inserts a new node at the head; if the map is " +
      "now over capacity, unlink <code>tail.prev</code> and <code>map.remove</code> that key " +
      "in the same two lines. The dummies exist so unlink is always four pointer writes and " +
      "never a null check.",
    "LFU adds a frequency to each key. <code>freqMap</code> takes a frequency to a doubly " +
      "linked list of the keys currently at that frequency, each list itself an LRU. On get " +
      "or put you unlink the key from its old bucket, insert it into frequency plus one, and " +
      "if the old bucket is now empty and that frequency was <code>minFreq</code>, increment " +
      "<code>minFreq</code> so the next eviction does not walk an empty list. A brand-new key " +
      "resets <code>minFreq</code> to 1. Randomized set is the other pairing: a map from key " +
      "to index in an <code>ArrayList</code>; delete swaps the victim with the last element, " +
      "repairs that last key's index, then pops.",
    "Trace LRU of capacity 2. <code>put(1)</code> makes the list <code>1</code> and the map " +
      "<code>{1}</code>. <code>put(2)</code> inserts at the head: list <code>2-1</code>. " +
      "<code>put(3)</code> is over capacity, so evict the tail 1 from both the list and the " +
      "map, leaving <code>3-2</code>. <code>get(1)</code> misses because 1 is gone. Had you " +
      "<code>get(2)</code> instead, 2 would move to the head and the tail would become 3, so " +
      "the next overflow would evict 3, not 2. Forgetting <code>map.remove(1)</code> on the " +
      "eviction is the bug that makes capacity appear to grow.",
  ],
  invariant: "<p>After every get or put the map and the recency (and frequency) lists describe " +
    "the same set of keys. The node just before the dummy tail is the LRU victim. " +
    "<code>minFreq</code> is the smallest frequency that still has a key.</p>" +
    "<p>In plain words, if a key is in the hash map it is also on exactly one list, the oldest " +
    "live key is always the one you would evict next, and a frequency counter never points at " +
    "an empty bucket. If you ever unlink a node without removing its map entry, or bump a key " +
    "out of the last <code>minFreq</code> slot without incrementing the counter, the next " +
    "eviction will be wrong.</p>",
  array: [1, 2, 3, 1, 4],
  arrayLabel: "ops =",
  indexLabels: ["put1", "put2", "put3", "get1", "put4"],
  vars: ["cap", "head", "tail", "evict"],
  frames: [
    { note: "LRU capacity 2. put(1) inserts the first node at the head; the map and the list both hold key 1.",
      active: [0], dim: [1, 2, 3, 4],
      values: { cap: 2, head: 1, tail: 1, evict: "\u2014" } },
    { note: "put(2) inserts at the head. The list is now 2-1, so 2 is newest and 1 is the eviction candidate.",
      active: [1], done: [0], dim: [2, 3, 4],
      values: { cap: 2, head: 2, tail: 1, evict: "\u2014" } },
    { note: "put(3) is over capacity, so evict tail 1 from both the list and the map. The list is now 3-2.",
      active: [2], x: [0], dim: [3, 4],
      values: { cap: 2, head: 3, tail: 2, evict: 1 } },
    { note: "get(1) misses because 1 was removed from the map when it left the tail, not only from the list.",
      active: [3], dim: [4],
      values: { cap: 2, head: 3, tail: 2, evict: "miss 1" } },
    { note: "Had we get(2) instead, 2 would move to the head and 3 would become the tail, so the next overflow would evict 3.",
      active: [1], best: [1],
      values: { cap: 2, head: 2, tail: 3, evict: "\u2014" } },
    { note: "put(4) after the list 3-2 evicts the tail 2 from both sides, leaving 4 at the head and 3 at the tail.",
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
  dryIntro: "Walk LRU of capacity 2 through put(1), put(2), put(3), get(1). Newest sits at " +
    "the head; the tail is the victim; the map and the list must agree after every call.",
  steps: [
    "<strong>List the operations and the required complexity first</strong> so you do not " +
      "pick a heap for a problem that demanded worst-case constant time. Write the verbs " +
      "and the bounds on the whiteboard before any field.",
    "<strong>Assign one structure to each bottleneck</strong> &mdash; hash for lookup, a " +
      "doubly linked list for recency, an array for random access, a heap only if the extreme " +
      "is allowed to be logarithmic. One structure never covers two bottlenecks.",
    "<strong>Give every doubly linked list a dummy head and tail</strong> so unlink is four " +
      "assignments and never a null check. Empty and one-node lists then share the same code " +
      "path as a full cache.",
    "<strong>On LRU get and put, look up, then move to head.</strong> If the map is over " +
      "capacity, unlink <code>tail.prev</code> and <code>map.remove</code> that key in the " +
      "same two lines so a later get cannot resurrect an evicted node.",
    "<strong>On LFU, bump the frequency and fix minFreq</strong> the moment a bucket becomes " +
      "empty. Leaving <code>minFreq</code> pointing at a dead list makes the next eviction " +
      "walk nothing and drop the wrong key.",
    "<strong>On randomized delete, swap with the last element</strong>, write the swapped " +
      "key's new index into the map, then pop. Skipping that index repair leaves the map " +
      "pointing at a hole that <code>getRandom</code> will later read.",
    "<strong>Keep every structure in sync inside the same method.</strong> A missed " +
      "<code>map.remove</code> is the usual bug: the list looks right, capacity appears to " +
      "grow, and get of the evicted key returns a detached node.",
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
      "<p>A HashMap get or put is expected constant time. Unlink and insert-at-head are four " +
        "pointer writes each, so they are worst-case constant. Eviction is one unlink plus one " +
        "<code>map.remove</code>, still constant:</p>" +
        "<span class=\"eq\">T(get) = T(put) = \u0398(1)</span>",
      "<p>Randomized delete is constant because swap-with-last avoids shifting a linear hole " +
        "down the array; only the swapped key's index is repaired. A scan of a list of size " +
        "<code>cap</code> on every call would be <code>O(cap)</code> and, at " +
        "<code>cap = 10&#8308;</code> with <code>10&#8309;</code> operations, about " +
        "<code>10&#8313;</code> steps. The glue exists to stay off that scan.</p>",
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
      bug: "get of the evicted key returns a detached node, so capacity appears to grow. The " +
        "list looks correct, which is why the missed map.remove hides until a later get.",
      fix: "unlink the victim and map.remove its key in the same two lines, before the method returns." },
    { title: "No dummy head/tail",
      bug: "Every unlink needs a null check, and the empty-list and one-node cases fail in " +
        "different ways. The three-node sample still works, so the bug waits for capacity 1.",
      fix: "Sentinel head and tail, always linked to each other when the cache is empty. Unlink is then four assignments." },
    { title: "Randomized delete without fixing the swapped index",
      bug: "You move last into index i but leave map[last] pointing at the old last slot. " +
        "The next remove of that key writes into a hole, and getRandom can return a stale value.",
      fix: "<code>at.put(last, i)</code> before you pop. If x is already last, the put overwrites the same index and is a no-op." },
    { title: "LFU: forgetting to bump minFreq",
      bug: "You empty the minFreq bucket and still evict from it, so the victim is missing " +
        "or you walk an empty list. It looks right until the last key at that frequency is accessed.",
      fix: "If that bucket is empty after a bump, increment minFreq. A brand-new key always sets minFreq back to 1." },
    { title: "Min-stack storing only the global min",
      bug: "After popping the current min you do not know the previous min, so the next " +
        "getMin is wrong. A single variable looks enough because it works until the first min is popped.",
      fix: "Store minSoFar with every pushed node, or keep a second stack of minima. Both restore the previous min on pop." },
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
      "<p>Get would need decrease-key on that key's timestamp so it becomes the newest, and " +
      "<code>PriorityQueue</code> cannot decrease an arbitrary key in log time. A doubly " +
      "linked list move-to-head is four pointer writes and is exactly that decrease-key. The " +
      "heap also makes get <code>O(log n)</code>, which misses the asked constant bound.</p>"],
    ["Is LinkedHashMap enough?",
      "<p>Yes for production LRU: construct with <code>accessOrder=true</code> and override " +
      "<code>removeEldestEntry</code>. Say that out loud so they know you know the library, " +
      "then write the HashMap plus doubly linked list anyway. They are testing the glue that " +
      "keeps lookup and recency in sync, not whether you can import a class.</p>"],
    ["How does LFU break a tie?",
      "<p>Among keys that share <code>minFreq</code>, evict the least recently used of those, " +
      "not an arbitrary one. That is why each frequency bucket is itself an LRU list with a " +
      "dummy head and tail, not a bag or a heap. The tail of the <code>minFreq</code> list is " +
      "the unique victim.</p>"],
    ["Can getRandom be O(1) with deletes if you use a HashSet?",
      "<p>No. A HashSet has no index, so picking a uniform random element means walking an " +
      "iterator a random number of steps, which is linear. You need an array for random " +
      "access and a map from key to index so the hole left by a delete can be filled in " +
      "constant time by swap-with-last.</p>"],
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

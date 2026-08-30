/* Module 04 — Recursion, Backtracking & D&C */

export const topics = [

/* ============================================ 1. recursion-fundamentals == */
{
  id: "recursion-fundamentals",
  difficulty: "Easy",
  readTime: "24 min",
  tagline: "A recursive call is a stack frame with a return address, not magic &mdash; draw the " +
    "tree, write the base case first, and treat Java's missing tail-call optimisation as a fact.",
  tags: ["recursion", "call stack", "base case", "tail recursion", "P0"],
  prereqs: [
    ["Complexity Analysis", "../00-foundations/complexity-analysis.html"],
    ["Recurrences &amp; Master Theorem", "../00-foundations/recurrences-and-master-theorem.html"],
  ],

  why: {
    paras: [
      "Every tree walk, every backtracking search, every divide-and-conquer sort, and every " +
      "memoised DP you will write is the same mechanism: a function that solves a smaller " +
      "instance of the same problem and a <strong>base case</strong> that stops the descent. " +
      "If that model is fuzzy, the later pages in this module become folklore you copy. If it is " +
      "sharp, they become one-line variations.",
      "The reason people get recursion wrong in interviews is not the idea, it is the " +
      "<em>machine</em>. Java allocates a stack frame per call. The frame holds the parameters, " +
      "the locals, and the address to resume at. Depth is therefore space, and a path of length " +
      "<code>10&#8309;</code> is a <code>StackOverflowError</code>, not a slow program. Java " +
      "also does <strong>not</strong> rewrite tail calls into loops, so \"make it tail recursive\" " +
      "does not save the stack the way it would in Scheme or Scala.",
      "The transferable habit is to draw the <strong>recursion tree</strong> before writing a " +
      "line: what is one call's work, how many children does it spawn, and when does a branch " +
      "die? That drawing is the same artefact " +
      "<a href=\"../00-foundations/recurrences-and-master-theorem.html\">the master theorem</a> " +
      "asks you to account, and it is the same drawing " +
      "<a href=\"subsets-permutations-combinations.html\">subset generation</a> walks.",
    ],
    insight: "A recursive function is a loop over a tree of stack frames. The base case is the " +
      "loop's termination test. Auxiliary space is the longest root-to-leaf path, not the number " +
      "of nodes.",
  },

  recognise: {
    yes: [
      "The problem on input of size <code>n</code> reduces cleanly to the same problem on a " +
        "strictly smaller input (or a few of them)",
      "The natural description is \"do this at the current node, then recurse on the children\"",
      "You can name a <em>trivial input</em> whose answer is immediate: empty array, " +
        "<code>n == 0</code>, <code>null</code> node, empty string",
      "An interviewer asks you to \"think recursively\" about a linked list, a tree, or a " +
        "divide-and-conquer sort",
      "You need the shape of the call tree to price the algorithm &mdash; branching factor " +
        "times depth, or a recurrence",
    ],
    no: [
      "The subproblems overlap and the naive tree is exponential &rarr; that is " +
        "<a href=\"../10-dynamic-programming/dp-foundations.html\">DP</a>; memoise or tabulate, " +
        "do not just recurse",
      "The input is a long path or a linked list of length <code>10&#8309;</code> &rarr; an " +
        "explicit <code>ArrayDeque</code> loop, because the JVM stack will die",
      "You are only reducing the argument by one and doing constant work &rarr; write the " +
        "equivalent loop; the recursion adds nothing but frames",
      "The recurrence is data-dependent and unbalanced (worst-case quicksort) &rarr; analyse " +
        "expected cost, not a master-theorem split",
    ],
    table: [
      ["\"empty / null / n == 0 is the answer X\"", "A base case exists", "Write it first, then the recursive step"],
      ["\"recurse on n-1\"", "Linear chain of frames", "<code>O(n)</code> time and <code>O(n)</code> stack"],
      ["\"recurse on n/2 once\"", "Halving, one child", "<code>O(log n)</code> time and stack"],
      ["\"recurse on both halves\"", "Balanced binary tree", "Master theorem; mergesort shape"],
      ["\"try include and exclude\"", "Full binary tree of depth n", "<code>O(2&#8319;)</code>; see subsets"],
      ["\"the last thing the function does is the recursive call\"", "Syntactic tail recursion",
        "Still <code>O(n)</code> stack in Java; rewrite as a loop"],
      ["A tree / graph DFS that can be a path", "Worst-case depth is n",
        "Iterative stack, or raise <code>-Xss</code> only as a last resort"],
      ["<strong>Confused with:</strong> \"recursive so it is <code>O(log n)</code>\"",
        "Depth is <code>log n</code> only when the argument is <em>divided</em>",
        "Check subtract vs divide before quoting space"],
    ],
    constraint: "The HotSpot default thread stack is roughly 1&nbsp;MB. A frame is a few dozen " +
      "to a few hundred bytes, so you overflow somewhere between a few thousand and about " +
      "<code>10&#8308;</code> frames. Treat <code>n &ge; 10&#8308;</code> linear recursion as " +
      "illegal in Java unless you have rewritten it as a loop.",
  },

  core: {
    heading: "Core idea: frames, trees, and the base case",
    paras: [
      "When <code>f(n)</code> calls <code>f(n-1)</code>, the JVM pushes a frame for " +
      "<code>f(n)</code>, then a frame for <code>f(n-1)</code>, and so on, until a call hits " +
      "the base case and returns a value. Each return pops one frame and resumes the caller. " +
      "That last-in-first-out discipline <em>is</em> the call stack, and it is why a recursive " +
      "in-order walk of a BST emits keys in sorted order without you managing a stack yourself.",
      "A <strong>recursion tree</strong> is the same process drawn in two dimensions: the root " +
      "is the original call, each edge is a child call, and the leaves are base cases. Time is " +
      "the number of nodes (each does some work). Extra space is the longest path, because " +
      "sibling frames do not coexist &mdash; a child returns before its sibling is pushed.",
      "Tail recursion is the special case where the recursive call is the last action, so the " +
      "caller's frame is dead the moment the child starts. Languages with tail-call " +
      "optimisation reuse the frame and turn the recursion into a jump. <strong>Java does not " +
      "do this.</strong> A tail-recursive factorial of <code>n = 10&#8309;</code> still " +
      "explodes. The correct Java rewrite is a <code>while</code> loop that mutates the " +
      "accumulator.",
    ],
    invariantTitle: "The interview sentence",
    invariant: "<p>Write the base case so that every recursive call makes <em>measurable " +
      "progress</em> toward it (smaller <code>n</code>, a shorter suffix, a child pointer). Then " +
      "state space as <code>O(depth)</code> and time as \"nodes in the tree times work per " +
      "node\". If depth can reach <code>10&#8308;</code>, replace the recursion with an " +
      "<code>ArrayDeque</code> before you talk about anything else.</p>",
    extra: [
      { kind: "warn", title: "Java has no tail-call optimisation",
        html: "<p>This is the most-quoted myth on this page. " +
          "<code>return fact(n - 1, n * acc)</code> looks tail recursive and is still " +
          "<code>O(n)</code> frames. The JVM specification does not require TCO, and HotSpot " +
          "does not implement it. If an interviewer says \"can you make it tail recursive?\" " +
          "show the tail form <em>and</em> the loop, and say why only the loop is safe.</p>" },
      { kind: "tip", title: "Base case first, then one step",
        html: "<p>The mechanical recipe: (1) name the smallest input and its answer; (2) assume " +
          "the function already works on every smaller input; (3) write the current answer in " +
          "terms of those. That is induction, and it is also how you keep a backtracking " +
          "routine from missing a case or looping forever.</p>" },
      { kind: "math", title: "Two trees you must recognise on sight",
        html: "<p><code>T(n) = T(n-1) + &Theta;(1)</code> is a stick: <code>n</code> nodes, " +
          "depth <code>n</code>. <code>T(n) = T(n-1) + T(n-2) + &Theta;(1)</code> is the " +
          "Fibonacci tree: <code>&Theta;(&phi;&#8319;)</code> nodes, depth <code>n</code>. " +
          "The second is why naive <code>fib(n)</code> dies at <code>n &asymp; 40</code> and " +
          "why the fix is memoisation (overlap) or a loop (the recurrence is linear), not a " +
          "\"smarter\" recursive split.</p>" },
    ],
  },

  visuals: [
    {
      kind: "array", vizId: "recStack",
      h3: "The call stack for factorial(5)",
      intro: "Each cell is one live frame, labelled with its <code>n</code>. Frames push on " +
        "the way down and pop on the way up. Watch the accumulator come back: that is the " +
        "return value travelling through the stack.",
      caption: "Five frames at peak depth, then five multiplies on the way back. Time and " +
        "stack are both <code>&Theta;(n)</code>. A tail-recursive rewrite would still look " +
        "like this in Java.",
      data: {
        label: "live frames (n)",
        array: [5, 4, 3, 2, 1],
        indexLabels: ["f5", "f4", "f3", "f2", "f1"],
        vars: ["n", "action", "returning"],
        speed: 950,
        frames: [
          { note: "Call fact(5). One frame. Not a base case, so it will call fact(4).",
            active: [0], dim: [1, 2, 3, 4],
            values: { n: 5, action: "push", returning: "\u2014" } },
          { note: "fact(4) pushed. The fact(5) frame is waiting to multiply by 5 after this returns.",
            active: [1], done: [0], dim: [2, 3, 4],
            values: { n: 4, action: "push", returning: "\u2014" } },
          { note: "Descent continues. Peak stack will be five frames. This is why depth is space.",
            active: [2], done: [0, 1], dim: [3, 4],
            values: { n: 3, action: "push", returning: "\u2014" } },
          { note: "fact(2) calls fact(1). Next call is the base case.",
            active: [3], done: [0, 1, 2], dim: [4],
            values: { n: 2, action: "push", returning: "\u2014" } },
          { note: "fact(1) is the base case and returns 1. No further call. The stack now starts to unwind.",
            active: [4], done: [0, 1, 2, 3],
            values: { n: 1, action: "base case", returning: 1 } },
          { note: "fact(2) resumes: 2 * 1 = 2. Its frame pops.",
            best: [3], done: [0, 1, 2], dim: [4],
            values: { n: 2, action: "pop", returning: 2 } },
          { note: "fact(3) resumes: 3 * 2 = 6.",
            best: [2], done: [0, 1], dim: [3, 4],
            values: { n: 3, action: "pop", returning: 6 } },
          { note: "Unwinding finishes: 4*6=24, then 5*24=120. Five multiplies, five frames. The iterative version does the same multiplies with O(1) space.",
            best: [0], done: [1, 2, 3, 4],
            values: { n: 5, action: "done", returning: 120 } },
        ],
      },
    },
    {
      kind: "mermaid", vizId: "recKinds",
      h3: "Which recursive shape is this?",
      caption: "Identify the shape first. The complexity, the stack risk, and the rewrite " +
        "(loop, memo, or divide-and-conquer) all follow from it.",
      src: `flowchart TD
  ask{"how does the argument shrink?"}
  ask -- "subtract 1, one call" --> stick["stick: T of n-1. depth n. rewrite as a loop"]
  ask -- "subtract 1, two calls" --> fibTree["Fibonacci tree: exponential nodes unless memoised"]
  ask -- "divide by 2, one call" --> binSearch["binary-search stick: depth log n"]
  ask -- "divide by 2, two calls" --> mergeShape["mergesort tree: n log n if combine is linear"]
  ask -- "include or exclude each item" --> subsetTree["full binary tree of depth n"]
  stick --> jvmRisk["StackOverflowError at n around 1e4 in Java"]
  fibTree --> memoOrLoop["memo or a linear loop, do not recurse raw"]
  subsetTree --> laterPage["see subsets, permutations, combinations"]`,
    },
  ],

  steps: [
    "<strong>Name the trivial input</strong> and write its answer. Empty, <code>null</code>, " +
      "<code>n == 0</code>, <code>n == 1</code> &mdash; be explicit about all of them.",
    "<strong>State the progress measure.</strong> Each call must reduce <code>n</code>, shorten " +
      "a suffix, or move to a child. If you cannot name it, the function can loop forever.",
    "<strong>Assume the function works on every smaller input</strong> and write the current " +
      "answer in terms of those returns.",
    "<strong>Draw the tree</strong> for a 4-element example. Count nodes (time) and the longest " +
      "path (space).",
    "<strong>Check the JVM stack.</strong> If depth can reach thousands, switch to an " +
      "<code>ArrayDeque</code> or a loop <em>now</em>.",
    "<strong>Do not rely on tail recursion</strong> to save space in Java. Rewrite tails as " +
      "<code>while</code> loops that update an accumulator.",
    "<strong>If nodes repeat</strong>, you have overlapping subproblems: add a memo table or " +
      "go to <a href=\"../10-dynamic-programming/dp-foundations.html\">DP</a>.",
    "<strong>Trace one return path</strong> by hand so you know what the caller does with the " +
      "child's result (multiply, min, concat, void side-effect).",
  ],

  dryRun: {
    intro: "Evaluating <code>fact(5)</code> as a stack machine. Highlighted rows are the " +
      "unwinding multiplies &mdash; the part people forget to write after they get the descent right.",
    cols: ["call", "n", "waiting to do", "returns"],
    rows: [
      { cells: ["fact(5)", "5", "5 * fact(4)", "pending"],
        action: "Push. Not a base case." },
      { cells: ["fact(4)", "4", "4 * fact(3)", "pending"],
        action: "Push." },
      { cells: ["fact(3)", "3", "3 * fact(2)", "pending"],
        action: "Push." },
      { cells: ["fact(2)", "2", "2 * fact(1)", "pending"],
        action: "Push." },
      { cells: ["fact(1)", "1", "base: return 1", "1"],
        action: "Base case. No further call.", change: true },
      { cells: ["fact(2)", "2", "2 * 1", "2"],
        action: "Pop and multiply.", change: true },
      { cells: ["fact(3)", "3", "3 * 2", "6"],
        action: "Pop and multiply." },
      { cells: ["fact(4)", "4", "4 * 6", "24"],
        action: "Pop and multiply." },
      { cells: ["fact(5)", "5", "5 * 24", "120"],
        action: "Done. Peak stack was 5 frames.", change: true },
    ],
    after: "<p>The iterative version is the same five multiplies with a single " +
      "<code>long acc = 1</code>. Same time, <code>O(1)</code> space, no overflow risk.</p>",
  },

  code: [
    { tab: "Brute", panel: "Naive recursion", file: "RecursionBrute.java",
      intro: "The Fibonacci tree is the canonical warning: correct, exponential, and the " +
        "reason you never recurse on overlapping subproblems without a memo.",
      highlight: "4-10",
      code: `public class RecursionBrute {

    static int fib(int n) {
        if (n <= 1) {
            return n;
        }
        return fib(n - 1) + fib(n - 2);
    }

    static long fact(int n) {
        if (n <= 1) {
            return 1;
        }
        return n * fact(n - 1);
    }

    public static void main(String[] args) {
        System.out.println(fact(5));
        System.out.println(fib(6));
    }
    // Input : fact(5), fib(6)
    // Output: 120
    //         8
}`,
    },
    { tab: "Optimal", panel: "Loop / tail form", file: "RecursionOptimal.java",
      intro: "The tail-recursive form is shown so you can discuss it, then immediately rewritten " +
        "as a loop. Only the loop is safe at interview constraints.",
      highlight: "15-21",
      code: `public class RecursionOptimal {

    /** Syntactically tail recursive. Still O(n) stack in Java. */
    static long factTail(int n, long acc) {
        if (n <= 1) {
            return acc;
        }
        return factTail(n - 1, acc * n);
    }

    /** The Java version you actually ship. */
    static long factIter(int n) {
        long acc = 1;
        for (int i = 2; i <= n; i++) {
            acc *= i;
        }
        return acc;
    }

    static long fibIter(int n) {
        if (n <= 1) {
            return n;
        }
        long a = 0, b = 1;
        for (int i = 2; i <= n; i++) {
            long c = a + b;
            a = b;
            b = c;
        }
        return b;
    }

    public static void main(String[] args) {
        System.out.println(factTail(5, 1) + " " + factIter(5));
        System.out.println(fibIter(6));
    }
    // Input : 5 and 6
    // Output: 120 120
    //         8
}`,
    },
    { tab: "Template", panel: "Recursion template", file: "RecursionTemplate.java",
      intro: "A depth-guarded template. Use it when the problem is naturally recursive but the " +
        "input can be a long path. The guard turns a silent overflow into a loud, testable failure.",
      code: `import java.util.ArrayDeque;

public class RecursionTemplate {

    static final int DEPTH_LIMIT = 10_000;

    static long solve(int n) {
        return go(n, 0);
    }

    static long go(int n, int depth) {
        if (depth > DEPTH_LIMIT) {
            throw new IllegalStateException("depth " + depth + "; rewrite as a loop");
        }
        if (n <= 1) {                 // base case
            return 1;
        }
        return n * go(n - 1, depth + 1);
    }

    /** Same computation, explicit stack, O(1) JVM frames. */
    static long solveIter(int n) {
        ArrayDeque<Integer> st = new ArrayDeque<>();
        while (n > 1) {
            st.push(n--);
        }
        long acc = 1;
        while (!st.isEmpty()) {
            acc *= st.pop();
        }
        return acc;
    }

    public static void main(String[] args) {
        System.out.println(solve(5) + " " + solveIter(5));
    }
    // Input : 5
    // Output: 120 120
}`,
    },
  ],

  complexity: {
    time: "shape-dependent",
    space: "O(depth)",
    derivation: [
      "<p>Time is the number of nodes in the recursion tree times the non-recursive work at " +
      "each node. Space is the longest root-to-leaf path, because only that chain of frames " +
      "is live at once.</p>",
      "<span class=\"eq\">T(n) = T(n-1) + &Theta;(1) &rArr; &Theta;(n) time, &Theta;(n) stack</span>",
      "<span class=\"eq\">T(n) = T(n/2) + &Theta;(1) &rArr; &Theta;(log n) time and stack</span>",
      "<span class=\"eq\">T(n) = T(n-1) + T(n-2) + &Theta;(1) &rArr; &Theta;(&phi;<sup>n</sup>) nodes</span>",
      "<p>Java does not recover the stack on a tail call, so the tail-recursive column of any " +
      "textbook table does not apply. Quote the loop's <code>O(1)</code> auxiliary space " +
      "instead.</p>",
    ],
    compare: [
      ["Linear recursion (fact, list reverse)", "O(n)", "O(n) stack", "Rewrite as a loop in Java"],
      ["Tail recursion in Java", "O(n)", "O(n) stack", "Looks pretty; still overflows"],
      ["Equivalent loop", "O(n)", "O(1)", "What you ship"],
      ["Halving, one call", "O(log n)", "O(log n)", "Binary search, <code>pow</code>"],
      ["Naive Fibonacci", "O(&phi;&#8319;)", "O(n)", "Memo or iterate"],
      ["Memo Fibonacci", "O(n)", "O(n)", "DP; overlapping subproblems"],
    ],
  },

  pitfalls: [
    { title: "Missing or incomplete base case",
      bug: "<code>if (n == 0) return 1;</code> on a function that is also called with " +
        "<code>n == 1</code> in a way that does not terminate, or forgetting the " +
        "<code>null</code> child on a tree.",
      fix: "List every trivial input. For trees: <code>null</code>. For arrays: empty <em>and</em> " +
        "length 1 if the recursive step assumes two sides. For integers: both 0 and 1 when the " +
        "recurrence mentions <code>n-2</code>." },
    { title: "Believing Java will optimise a tail call",
      bug: "Rewriting <code>return n * fact(n-1)</code> as <code>return fact(n-1, acc*n)</code> " +
        "and claiming <code>O(1)</code> space.",
      fix: "Say it out loud: HotSpot does not do TCO. Then write the loop. The tail form is " +
        "useful only as a stepping stone to the loop." },
    { title: "Quoting time as the depth",
      bug: "\"Fibonacci is <code>O(n)</code> because the deepest call is <code>fib(0)</code>.\" " +
        "Depth is space. Time is the number of calls, which is exponential.",
      fix: "Draw the tree. Count nodes for time, the longest path for space. They are equal " +
        "only on a stick." },
    { title: "Recursing down a linked list of length 1e5",
      bug: "Elegant <code>reverse(head.next)</code> that passes the sample and throws " +
        "<code>StackOverflowError</code> on the hidden test.",
      fix: "Interview lists are often short, contest lists are not. If " +
        "<code>n &le; 10&#8309;</code>, use three pointers or an <code>ArrayDeque</code>." },
    { title: "Making no progress",
      bug: "<code>f(n)</code> calling <code>f(n)</code>, or a DFS that does not mark visited, " +
        "or a suffix recursion that passes the same index.",
      fix: "Every call must change a parameter toward the base case. If the parameter is an " +
        "index, it must increase (or decrease) on every call." },
  ],

  variants: [
    ["Mutual recursion",
      "Two functions call each other (<code>isEven</code> / <code>isOdd</code>). Same stack " +
      "rules; the base case can live in either.",
      "boolean isEven(int n) { return n == 0 || isOdd(n - 1); }",
      "Rare in interviews; same overflow risk."],
    ["Indirect / delayed work",
      "The recursive call is not the last statement, but the leftover work is a constant. " +
      "Still not tail, still <code>O(depth)</code> stack.",
      "void printRev(Node x) { if (x==null) return; printRev(x.next); System.out.println(x.v); }",
      "Classic linked-list print-reverse."],
    ["Divide once vs twice",
      "One recursive call on half is binary search. Two is mergesort. The stack of the first " +
      "is <code>O(log n)</code>; the second is also <code>O(log n)</code> because siblings " +
      "do not coexist, even though the <em>tree</em> has <code>O(n)</code> nodes.",
      "T(n)=T(n/2)+O(1) vs T(n)=2T(n/2)+O(n)",
      "<a href=\"divide-and-conquer.html\">Divide &amp; Conquer</a>"],
  ],

  followups: [
    ["Why does naive Fibonacci take exponential time if there are only n distinct answers?",
      "<p>Because the tree recomputes <code>fib(k)</code> from scratch at every node that " +
      "needs it. There are only <code>n</code> distinct <em>values</em>, but " +
      "<code>&Theta;(&phi;&#8319;)</code> <em>calls</em>. A memo table of size <code>n</code> " +
      "collapses the DAG back to <code>O(n)</code> work. That collapse is dynamic programming.</p>"],
    ["Is the space of a balanced binary-tree DFS <code>O(n)</code> or <code>O(log n)</code>?",
      "<p><code>O(height)</code>. On a perfectly balanced tree that is <code>O(log n)</code>. " +
      "On a skewed tree (which is a linked list) it is <code>O(n)</code>. Always quote height, " +
      "then say what the worst-case tree looks like. Interviewers listen for that distinction.</p>"],
    ["Can I just raise <code>-Xss</code> and recurse?",
      "<p>In a local experiment, yes. In a judged solution or a production service, no: you " +
      "do not control the launcher, and a 100&nbsp;MB stack per thread is not a strategy. " +
      "Rewrite the recursion. <code>-Xss</code> is a debugging aid, not a solution.</p>"],
    ["What should I say when they ask for a tail-recursive version in Java?",
      "<p>Write it, explain that it would be <code>O(1)</code> space in a TCO language, then " +
      "write the equivalent loop and say that is the version you would commit. That answer " +
      "scores both the concept and the platform knowledge.</p>"],
  ],

  problemsIntro: "These lock in the machine model. Trace the stack by hand on the first four " +
    "before you touch the later ones.",

  problems: [
    { name: "Fibonacci Number", url: "https://leetcode.com/problems/fibonacci-number/",
      badge: "lc", tag: "LC 509", level: "Easy",
      pattern: "Naive tree vs loop; say the exponential cost out loud" },
    { name: "Climbing Stairs", url: "https://leetcode.com/problems/climbing-stairs/",
      badge: "lc", tag: "LC 70", level: "Easy",
      pattern: "Same recurrence as Fibonacci; the loop is the real solution" },
    { name: "Pow(x, n)", url: "https://leetcode.com/problems/powx-n/",
      badge: "lc", tag: "LC 50", level: "Medium",
      pattern: "Halving recurrence; watch n == Integer.MIN_VALUE" },
    { name: "Reverse Linked List", url: "https://leetcode.com/problems/reverse-linked-list/",
      badge: "lc", tag: "LC 206", level: "Easy",
      pattern: "Recursive and iterative; quote the O(n) stack of the recursive one" },
    { name: "Maximum Depth of Binary Tree", url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
      badge: "lc", tag: "LC 104", level: "Easy",
      pattern: "Space is O(height), not O(1)" },
    { name: "Merge Two Sorted Lists", url: "https://leetcode.com/problems/merge-two-sorted-lists/",
      badge: "lc", tag: "LC 21", level: "Easy",
      pattern: "Elegant recursion; iterative is safer at n = 1e5" },
    { name: "K-th Symbol in Grammar", url: "https://leetcode.com/problems/k-th-symbol-in-grammar/",
      badge: "lc", tag: "LC 779", level: "Medium",
      pattern: "Recurse on n-1 and the half that contains k" },
    { name: "Apple Division", url: "https://cses.fi/problemset/task/1623",
      badge: "cf", tag: "CSES", level: "Easy",
      pattern: "Include/exclude recursion; n <= 20 so 2^n is fine" },
    { name: "Creating Strings", url: "https://cses.fi/problemset/task/1622",
      badge: "cf", tag: "CSES", level: "Easy",
      pattern: "Recurse on the unused multiset of characters" },
    { name: "Kefa and Park", url: "https://codeforces.com/problemset/problem/580/C",
      badge: "cf", tag: "CF 580C", level: "Easy",
      pattern: "Tree DFS with a running consecutive-cat count" },
  ],

  spoilers: [
    { summary: "Hint for LC 50 &mdash; Pow(x, n) without overflowing the exponent",
      body: "<p><code>n</code> can be <code>Integer.MIN_VALUE</code>, whose negation does not " +
        "fit in an <code>int</code>. Widen to <code>long</code> first, then use the halving " +
        "identity <code>x<sup>n</sup> = (x<sup>2</sup>)<sup>n/2</sup></code> with a multiply " +
        "by <code>x</code> when <code>n</code> is odd. Depth is <code>O(log |n|)</code>, which " +
        "is the rare recursive Java function that is stack-safe at full constraint.</p>" },
    { summary: "Hint for LC 779 &mdash; you do not generate the string",
      body: "<p>Row <code>n</code> is row <code>n-1</code> concatenated with its bitwise " +
        "complement. If <code>k</code> sits in the second half, the answer is 1 minus the " +
        "answer for <code>k - 2^{n-2}</code> in the previous row. " +
        "<code>O(n)</code> time, <code>O(n)</code> stack, and you never allocate the " +
        "<code>2^{n-1}</code> characters.</p>" },
  ],

  recap: {
    bullets: [
      "<strong>A call is a stack frame.</strong> Depth is space. Java will not reuse a tail frame.",
      "<strong>Write the base case first</strong> and name the progress measure.",
      "<strong>Time is nodes; space is the longest path.</strong> They coincide only on a stick.",
      "<strong>Overlapping subproblems mean DP</strong>, not a deeper recursion.",
      "<strong>Linear recursion at n &ge; 10&#8308; is a rewrite</strong>, not a bigger stack.",
    ],
    oneliner: "if (n<=1) return 1; return n*go(n-1); // depth is space; Java has no TCO",
  },
},

/* ============================== 2. subsets-permutations-combinations === */
{
  id: "subsets-permutations-combinations",
  difficulty: "Medium",
  readTime: "28 min",
  tagline: "Every generation problem is include/exclude or \"place the next choice\", and " +
    "almost every bug is a broken duplicate rule &mdash; the rules below are exact, not folklore.",
  tags: ["backtracking", "subsets", "permutations", "bitmask", "dedup", "P0"],
  prereqs: [
    ["Recursion Fundamentals", "recursion-fundamentals.html"],
    ["Bit Manipulation", "../02-sorting-hashing-bits/bit-manipulation.html"],
  ],

  why: {
    paras: [
      "\"Return all subsets / permutations / combinations\" is a single family. The search " +
      "tree is always the same shape: at each position you either take an element or you do " +
      "not, or you try every unused element as the next pick. The code is twenty lines. The " +
      "reason this page is long is <strong>duplicates</strong>: the same multiset can be " +
      "reached by many paths, and interviewers grade the skip rule, not the recursion.",
      "There are two mechanical implementations and they are not interchangeable. " +
      "<strong>Include/exclude</strong> (or the equivalent bitmask loop) builds subsets. " +
      "<strong>Swap / <code>used[]</code></strong> builds permutations. Combinations are " +
      "subsets of a fixed size, generated with a <code>start</code> index so order does not " +
      "explode into permutations. Combination-sum is the same tree with a remaining-target " +
      "and a reuse policy.",
      "Memorise the four skip predicates below as if they were an API. \"Sort, then skip " +
      "equals\" is not a rule; it is four different rules that happen to start with a sort.",
    ],
    insight: "Duplicates are equal values at the <em>same depth</em> of the tree. Skip the " +
      "second equal when its previous copy was not taken in this path; never skip across depths.",
  },

  recognise: {
    yes: [
      "\"Return all subsets / all permutations / all combinations of size k\"",
      "\"Combination sum\": pick numbers that add to a target, with or without reuse",
      "<code>n &le; 20</code> and you need every subset, or <code>n &le; 10</code> and you " +
        "need every permutation",
      "The statement says \"unique\" or the input contains duplicates",
      "Letter combinations of a phone number, generate parentheses, restore IP addresses " +
        "&mdash; the same tree with a different child-generation rule",
    ],
    no: [
      "You need the <em>count</em> of subsets with a property, not the list, and " +
        "<code>n</code> is large &rarr; " +
        "<a href=\"../10-dynamic-programming/knapsack-family.html\">DP / knapsack</a>",
      "You need any one subset that works &rarr; you may still backtrack, but you return on " +
        "the first success; or you use meet-in-the-middle / DP",
      "<code>n &le; 40</code> subset-sum &rarr; " +
        "<a href=\"meet-in-the-middle.html\">meet in the middle</a>, not <code>2&#8319;</code>",
      "The objects being chosen have a forced order (LIS, scheduling) &rarr; greedy or DP, " +
        "not generation",
    ],
    table: [
      ["\"all subsets\" / power set", "Include or exclude each index once", "include/exclude or bitmask 0 .. 2^n-1"],
      ["\"all permutations\"", "Every unused item as the next position", "swap in place, or used[]"],
      ["\"combinations of size k\"", "Subsets, order does not matter", "start index; recurse i+1"],
      ["\"combination sum\", reuse allowed", "Same value many times", "recurse with start = i, not i+1"],
      ["\"combination sum\", each number once", "0/1 choice plus dups in the array", "sort; start = i+1; skip equals at this depth"],
      ["Input has duplicates, unique outputs required", "Many paths, one multiset", "Apply the exact skip rule for that tree"],
      ["n <= 20 and a numeric property of subsets", "Enumerate, do not generate lists", "bitmask loop, accumulate a sum / xor"],
      ["<strong>Confused with:</strong> permutations of a subset vs combinations",
        "Permutations care about order; combinations do not",
        "If the answer list treats [1,2] and [2,1] as the same, you want combinations"],
    ],
    constraint: "<code>2&#8319;</code> is comfortable at <code>n &le; 20</code>, tight at 22, " +
      "dead at 30. <code>n!</code> is comfortable at <code>n &le; 9</code>, optional at 10, " +
      "dead at 12. If the output itself is exponential, the time lower bound is the output " +
      "size &mdash; do not hunt for a polynomial.",
  },

  core: {
    heading: "Core idea and the exact dedup rules",
    paras: [
      "Include/exclude walks indices left to right. From index <code>i</code> you either skip " +
      "<code>a[i]</code> and go to <code>i+1</code>, or you append it, go to <code>i+1</code>, " +
      "and pop on the way back. Every subset appears once. The bitmask form is the same tree " +
      "flattened: bit <code>j</code> of mask <code>m</code> means \"include <code>a[j]</code>\".",
      "Permutations fill positions. The swap implementation puts every remaining index into " +
      "slot <code>i</code> by swapping <code>a[i]</code> with <code>a[j]</code> for " +
      "<code>j &ge; i</code>, then recurses on <code>i+1</code>, then swaps back. The " +
      "<code>used[]</code> implementation keeps the array intact and tracks which indices are " +
      "already in the path. Both are <code>O(n &middot; n!)</code> including output copies.",
      "Dedup is a predicate on <em>siblings</em>, not on the whole path. Sort first so equals " +
      "are adjacent. Then apply exactly one of the four rules below &mdash; mixing them is " +
      "how you drop a valid subset or emit <code>[1,2]</code> twice.",
    ],
    invariantTitle: "The four skip predicates (memorise these)",
    invariant: "<p>Always <code>Arrays.sort(a)</code> first when the input can contain " +
      "duplicates and the output must be unique.</p>" +
      "<ul>" +
      "<li><strong>Subsets II / combination sum II</strong> (start-index tree, each value at " +
      "most once): at a fixed <code>start</code>, skip <code>i</code> when " +
      "<code>i &gt; start &amp;&amp; a[i] == a[i-1]</code>. Same-depth equals share a parent; " +
      "the first copy is allowed to be chosen or not, the rest must not start a new sibling.</li>" +
      "<li><strong>Permutations II</strong> (<code>used[]</code> tree): skip index " +
      "<code>i</code> when <code>used[i]</code>, <em>or</em> when " +
      "<code>i &gt; 0 &amp;&amp; a[i] == a[i-1] &amp;&amp; !used[i-1]</code>. The previous " +
      "equal must already be in the path; otherwise this pick is a sibling permutation of " +
      "an earlier pick.</li>" +
      "<li><strong>Combination sum (unlimited reuse)</strong>: do not skip equals; recurse " +
      "with <code>start = i</code> so you may pick <code>a[i]</code> again, and never pick " +
      "an earlier index, so <code>[2,3]</code> and <code>[3,2]</code> cannot both appear.</li>" +
      "<li><strong>Bitmask subsets</strong>: no skip rule. Each mask is a unique index-set. " +
      "If values duplicate, two masks can have the same multiset &mdash; bitmask is the " +
      "wrong tool for \"unique value subsets\".</li>" +
      "</ul>",
    extra: [
      { kind: "key", title: "Swap vs used[]",
        html: "<p>Swap mutates the array and needs no extra boolean array; the remaining " +
          "suffix <code>a[i..]</code> <em>is</em> the unused set. Dedup with swap is " +
          "awkward (you must skip a value already swapped into this slot). Prefer " +
          "<code>used[]</code> the moment the input has duplicates. Prefer swap when the " +
          "values are unique and you want cache-friendly in-place code.</p>" },
      { kind: "warn", title: "Copy the path when you record it",
        html: "<p><code>ans.add(path)</code> stores a reference. The next " +
          "<code>path.add</code> mutates every previously stored answer. Always " +
          "<code>ans.add(new ArrayList&lt;&gt;(path))</code>. This is the single most " +
          "common backtracking bug in Java interviews.</p>" },
      { kind: "tip", title: "Bitmasks when you do not need the lists",
        html: "<p>If you only need a count, a min, or an XOR of subsets, loop " +
          "<code>m = 0 .. (1&lt;&lt;n)-1</code> and walk set bits. No recursion, no " +
          "allocation, and the inner loop is <code>O(n)</code> or " +
          "<code>O(popcount)</code>. This is the default at <code>n &le; 20</code> on " +
          "Codeforces.</p>" },
    ],
  },

  visuals: [
    {
      kind: "array", vizId: "subIncExc",
      h3: "Include/exclude on [1, 2, 3]",
      intro: "The path is the current subset. Green is chosen, dim is not yet considered, " +
        "red is excluded. Every leaf is one subset, including the empty one.",
      caption: "Eight leaves for three elements. Recording happens at the leaf (or at every " +
        "node, which is equivalent for subsets). The pop after include is the \"backtrack\".",
      data: {
        label: "a = [1, 2, 3]",
        array: [1, 2, 3],
        vars: ["i", "path", "decision"],
        speed: 900,
        frames: [
          { note: "Start. i = 0, path empty. Two children: exclude 1, or include 1.",
            dim: [0, 1, 2], values: { i: 0, path: "[]", decision: "root" } },
          { note: "Exclude 1. Path still []. Now decide about 2.",
            x: [0], dim: [1, 2], values: { i: 1, path: "[]", decision: "exclude 1" } },
          { note: "Exclude 2 as well. Path []. Decide about 3.",
            x: [0, 1], dim: [2], values: { i: 2, path: "[]", decision: "exclude 2" } },
          { note: "Exclude 3. Leaf: record []. First of eight subsets.",
            x: [0, 1, 2], values: { i: 3, path: "[]", decision: "record empty" } },
          { note: "Backtrack and include 3 instead. Record [3].",
            x: [0, 1], best: [2], values: { i: 3, path: "[3]", decision: "include 3" } },
          { note: "Backtrack to i = 1, include 2. Path [2]. The next decisions about 3 produce [2] and [2,3].",
            x: [0], best: [1], dim: [2], values: { i: 2, path: "[2]", decision: "include 2" } },
          { note: "The include-1 branch is the other half of the tree. Same shape, paths start with 1: [1], [1,3], [1,2], [1,2,3].",
            best: [0], dim: [1, 2], values: { i: 1, path: "[1]", decision: "include 1" } },
          { note: "Eight subsets, no duplicates, because each index is decided once. If a were [1,2,2], this tree would emit [1,2] twice \u2014 that is when the skip rule fires.",
            done: [0, 1, 2], values: { i: "done", path: "8 subsets", decision: "2^n leaves" } },
        ],
      },
    },
    {
      kind: "mermaid", vizId: "subPick",
      h3: "Which generator and which skip rule?",
      caption: "Pick the tree first, then the skip predicate. The most common mix-up is using " +
        "the permutation skip on a combination-sum tree, which drops valid answers.",
      src: `flowchart TD
  q{"what must be unique?"}
  q -- "index-sets, values unique" --> bits["bitmask 0 to 2^n-1, or include/exclude"]
  q -- "value-subsets, input has dups" --> sub2["sort; start-index; skip i greater than start and a[i]==a[i-1]"]
  q -- "order matters" --> perm{"input has dups?"}
  perm -- no --> swapWay["in-place swap, no skip"]
  perm -- yes --> usedWay["used array; skip if a[i]==a[i-1] and previous unused"]
  q -- "size k, order ignored" --> comb["start-index, recurse i+1, stop at path size k"]
  q -- "sum to target" --> reuse{"may reuse a value?"}
  reuse -- yes --> combSum["start stays i; no sibling skip"]
  reuse -- no --> combSum2["start becomes i+1; same skip as Subsets II"]`,
    },
  ],

  steps: [
    "<strong>Classify the tree.</strong> Subsets / combinations &rarr; start index. " +
      "Permutations &rarr; swap or <code>used[]</code>. Target sum &rarr; add a remaining.",
    "<strong>Sort</strong> if the output must be unique and the input can contain duplicates.",
    "<strong>Write the skip predicate</strong> for that tree before any other line. Do not " +
      "improvise a third rule.",
    "<strong>Record a copy of the path</strong> at the right moment: leaf for permutations " +
      "and combinations of size k; every node (or the leaf of include/exclude) for subsets.",
    "<strong>Push, recurse, pop.</strong> The pop is mandatory even on early returns; a " +
      "<code>finally</code>-shaped pair of lines, not a hope.",
    "<strong>For unlimited combination-sum</strong>, recurse with <code>start = i</code> and " +
      "subtract <code>a[i]</code>. Guard <code>remain &lt; 0</code> as a prune.",
    "<strong>Prefer a bitmask loop</strong> when you need a numeric aggregate over subsets, " +
      "not the lists themselves.",
    "<strong>Price the output.</strong> If you emit <code>k</code> arrays of length " +
      "<code>n</code>, you have already paid <code>O(kn)</code>; the recursion is not the cost.",
  ],

  dryRun: {
    intro: "Subsets II on <code>[1, 2, 2]</code> with the start-index skip. Highlighted rows " +
      "are the skipped sibling &mdash; the whole point of the rule.",
    cols: ["start", "i", "a[i]", "path after", "action"],
    rows: [
      { cells: ["0", "0", "1", "[1]", "include 1, recurse start=1"],
        action: "First copy of 1; no skip possible." },
      { cells: ["1", "1", "2", "[1,2]", "include first 2, recurse start=2"],
        action: "First 2 at this depth." },
      { cells: ["2", "2", "2", "[1,2,2]", "include second 2; record"],
        action: "Different depth, so the equal is allowed.", change: true },
      { cells: ["2", "\u2014", "\u2014", "[1,2]", "pop; no more i at start=2"],
        action: "Record [1,2] on the way, depending on style." },
      { cells: ["1", "2", "2", "[1]", "skip: i>start and a[i]==a[i-1]"],
        action: "Sibling of the first 2. Emitting it would duplicate [1,2].", change: true },
      { cells: ["0", "1", "2", "[2]", "exclude 1, include first 2"],
        action: "Paths without 1." },
      { cells: ["0", "2", "2", "[]", "skip the second 2 as a sibling of the first"],
        action: "Same rule at the root depth.", change: true },
      { cells: ["done", "\u2014", "\u2014", "6 subsets", "[], [1], [1,2], [1,2,2], [2], [2,2]"],
        action: "No [2] twice, no [1,2] twice." },
    ],
  },

  code: [
    { tab: "Brute", panel: "Bitmask subsets", file: "SubsetsBrute.java",
      intro: "The loop you write when values are unique and you want every subset. No stack, " +
        "no path copies until you decide to materialise one.",
      highlight: "8-16",
      code: `import java.util.ArrayList;
import java.util.List;

public class SubsetsBrute {

    static List<List<Integer>> subsets(int[] a) {
        int n = a.length;
        List<List<Integer>> ans = new ArrayList<>();
        for (int m = 0; m < (1 << n); m++) {
            List<Integer> path = new ArrayList<>();
            for (int i = 0; i < n; i++) {
                if ((m & (1 << i)) != 0) {
                    path.add(a[i]);
                }
            }
            ans.add(path);
        }
        return ans;
    }

    public static void main(String[] args) {
        System.out.println(subsets(new int[] {1, 2, 3}));
    }
    // Input : [1, 2, 3]
    // Output: [[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]]
}`,
    },
    { tab: "Optimal", panel: "Deduped generators", file: "SubsetsOptimal.java",
      intro: "Subsets II and Permutations II with the exact skip predicates. Sort is not " +
        "optional.",
      highlight: "18,37",
      code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class SubsetsOptimal {

    static List<List<Integer>> subsetsWithDup(int[] a) {
        Arrays.sort(a);
        List<List<Integer>> ans = new ArrayList<>();
        goSub(a, 0, new ArrayList<>(), ans);
        return ans;
    }

    static void goSub(int[] a, int start, List<Integer> path, List<List<Integer>> ans) {
        ans.add(new ArrayList<>(path));
        for (int i = start; i < a.length; i++) {
            if (i > start && a[i] == a[i - 1]) {   // Subsets II skip
                continue;
            }
            path.add(a[i]);
            goSub(a, i + 1, path, ans);
            path.remove(path.size() - 1);
        }
    }

    static List<List<Integer>> permuteUnique(int[] a) {
        Arrays.sort(a);
        List<List<Integer>> ans = new ArrayList<>();
        goPerm(a, new boolean[a.length], new ArrayList<>(), ans);
        return ans;
    }

    static void goPerm(int[] a, boolean[] used, List<Integer> path, List<List<Integer>> ans) {
        if (path.size() == a.length) {
            ans.add(new ArrayList<>(path));
            return;
        }
        for (int i = 0; i < a.length; i++) {
            if (used[i]) {
                continue;
            }
            if (i > 0 && a[i] == a[i - 1] && !used[i - 1]) {  // Perm II skip
                continue;
            }
            used[i] = true;
            path.add(a[i]);
            goPerm(a, used, path, ans);
            path.remove(path.size() - 1);
            used[i] = false;
        }
    }

    public static void main(String[] args) {
        System.out.println(subsetsWithDup(new int[] {1, 2, 2}));
        System.out.println(permuteUnique(new int[] {1, 1, 2}));
    }
    // Input : [1,2,2] and [1,1,2]
    // Output: [[], [1], [1, 2], [1, 2, 2], [2], [2, 2]]
    //         [[1, 1, 2], [1, 2, 1], [2, 1, 1]]
}`,
    },
    { tab: "Template", panel: "Combination sum", file: "CombinationSum.java",
      intro: "Unlimited reuse versus 0/1. The only structural difference is " +
        "<code>i</code> versus <code>i+1</code> and whether equals are skipped.",
      highlight: "16,35-37",
      code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class CombinationSum {

    /** Reuse allowed. Candidates are usually unique. */
    static List<List<Integer>> combinationSum(int[] a, int target) {
        Arrays.sort(a);
        List<List<Integer>> ans = new ArrayList<>();
        go(a, 0, target, new ArrayList<>(), ans);
        return ans;
    }

    static void go(int[] a, int start, int remain, List<Integer> path, List<List<Integer>> ans) {
        if (remain == 0) {
            ans.add(new ArrayList<>(path));
            return;
        }
        for (int i = start; i < a.length && a[i] <= remain; i++) {
            path.add(a[i]);
            go(a, i, remain - a[i], path, ans);   // reuse: start stays i
            path.remove(path.size() - 1);
        }
    }

    /** Each index at most once; input may contain duplicates. */
    static List<List<Integer>> combinationSum2(int[] a, int target) {
        Arrays.sort(a);
        List<List<Integer>> ans = new ArrayList<>();
        go2(a, 0, target, new ArrayList<>(), ans);
        return ans;
    }

    static void go2(int[] a, int start, int remain, List<Integer> path, List<List<Integer>> ans) {
        if (remain == 0) {
            ans.add(new ArrayList<>(path));
            return;
        }
        for (int i = start; i < a.length && a[i] <= remain; i++) {
            if (i > start && a[i] == a[i - 1]) {
                continue;
            }
            path.add(a[i]);
            go2(a, i + 1, remain - a[i], path, ans);
            path.remove(path.size() - 1);
        }
    }

    public static void main(String[] args) {
        System.out.println(combinationSum(new int[] {2, 3, 6, 7}, 7));
        System.out.println(combinationSum2(new int[] {2, 1, 2, 5}, 5));
    }
    // Input : candidates [2,3,6,7] target 7; [2,1,2,5] target 5
    // Output: [[2, 2, 3], [7]]
    //         [[1, 2, 2], [5]]
}`,
    },
  ],

  complexity: {
    time: "O(n * 2^n) / O(n * n!)",
    space: "O(n) plus output",
    derivation: [
      "<p>Subsets: <code>2&#8319;</code> nodes if you recurse include/exclude, or " +
      "<code>2&#8319;</code> masks. Materialising each subset of average size " +
      "<code>n/2</code> costs another <code>O(n)</code>, hence " +
      "<code>O(n &middot; 2&#8319;)</code>.</p>",
      "<span class=\"eq\">permutations = n! leaves, O(n) work to copy each &rArr; O(n &middot; n!)</span>",
      "<p>Combinations of size <code>k</code> produce <code>C(n,k)</code> leaves. Combination " +
      "sum is output-sensitive and can be exponential in the target when 1 is a candidate.</p>",
      "<p>The skip rules do not change the worst-case class; they only remove duplicate " +
      "leaves. Sorting is <code>O(n log n)</code> and is dominated.</p>",
    ],
    compare: [
      ["Bitmask subsets", "O(n 2^n)", "O(n) per mask", "Unique indices; numeric aggregates"],
      ["Include/exclude", "O(n 2^n)", "O(n) stack", "Same tree, easier to prune"],
      ["Permutations, unique", "O(n n!)", "O(n)", "Swap in place"],
      ["Permutations II", "O(n n!)", "O(n) used[]", "used[] plus the sibling skip"],
      ["Combination sum, reuse", "output-sensitive", "O(target / min a)", "start stays i"],
      ["Combination sum II", "output-sensitive", "O(n)", "start = i+1 plus skip"],
    ],
  },

  pitfalls: [
    { title: "Storing the path by reference",
      bug: "<code>ans.add(path)</code> then <code>path.add(x)</code>. Every stored list " +
        "mutates. The judge shows n copies of the last path.",
      fix: "<code>ans.add(new ArrayList&lt;&gt;(path))</code> at every record point." },
    { title: "The wrong skip predicate",
      bug: "Using <code>!used[i-1]</code> on a start-index tree, or " +
        "<code>i &gt; start &amp;&amp; a[i]==a[i-1]</code> on a permutation tree.",
      fix: "Subsets II / Comb Sum II: same-depth skip via <code>i &gt; start</code>. " +
        "Permutations II: previous equal must already be used. Do not mix." },
    { title: "Forgetting to sort before skipping",
      bug: "The skip looks at <code>a[i-1]</code>, which is only the previous equal after " +
        "a sort. Unsorted <code>[2,1,2]</code> will emit duplicate subsets.",
      fix: "<code>Arrays.sort(a)</code> is part of the contract of every unique-output " +
        "generator except pure bitmask-on-unique-indices." },
    { title: "Reuse going backwards",
      bug: "Combination-sum with <code>start = 0</code> on every call, so " +
        "<code>[2,3]</code> and <code>[3,2]</code> both appear.",
      fix: "Never decrease <code>start</code>. Unlimited reuse keeps <code>start = i</code>; " +
        "0/1 use advances to <code>i+1</code>." },
    { title: "Bitmask on duplicate values when uniqueness is required",
      bug: "Looping <code>0 .. 2^n-1</code> on <code>[1,2,2]</code> and dumping every mask. " +
        "[1,2] appears twice.",
      fix: "Bitmasks identify index-sets. For unique value-subsets, use the start-index " +
        "tree. For unique index-sets, bitmask is correct and simpler." },
  ],

  variants: [
    ["Generate parentheses / phone letters",
      "The children are not array elements; they are a small explicit alphabet that depends " +
      "on the path (open/close counts, or the next digit's letters).",
      "if (open < n) go(open+1, close); if (close < open) go(open, close+1);",
      "<a href=\"https://leetcode.com/problems/generate-parentheses/\" target=\"_blank\" rel=\"noopener\">LC 22</a>"],
    ["k-subsets only",
      "Stop when <code>path.size() == k</code>. Prune when " +
      "<code>path.size() + (n-i) &lt; k</code>.",
      "if (path.size() == k) { record; return; }",
      "LC 77 Combinations"],
    ["Count, do not list",
      "Drop the path and the copies. Return a long. Or loop bitmasks and increment.",
      "return go(i+1, remain) + go(i+1, remain-a[i]);",
      "Becomes knapsack DP the moment n exceeds ~20"],
  ],

  followups: [
    ["Why is <code>!used[i-1]</code> the right permutation skip?",
      "<p>Equals are adjacent after sorting. If <code>a[i-1]</code> is unused, then this " +
      "call is trying to pick the second equal <em>before</em> the first, at the same path " +
      "prefix &mdash; a sibling of a permutation you already produced (or will produce) by " +
      "picking the first equal first. Forcing <code>used[i-1]</code> linearises the equals: " +
      "they may only be taken left-to-right.</p>"],
    ["Can I dedup by stuffing paths into a <code>Set&lt;List&gt;</code>?",
      "<p>Yes, and it is correct, and it is the wrong answer. It costs a hash of every " +
      "path and hides a broken generator. The skip rules remove the duplicates at the " +
      "source in <code>O(1)</code> per sibling. Interviewers ask you to write the rule.</p>"],
    ["Swap or <code>used[]</code> for unique permutations?",
      "<p>Swap. There is nothing to skip. <code>used[]</code> is extra memory and extra " +
      "branches. Use swap until the input has duplicates, then switch &mdash; swap-plus-skip " +
      "is easy to get wrong because the suffix is no longer a clean unused multiset after " +
      "previous swaps.</p>"],
    ["When does combination sum become DP?",
      "<p>The moment they ask for the <em>number</em> of combinations (order irrelevant) " +
      "and <code>n</code> or the target is large. That is unbounded knapsack. If they want " +
      "the lists, you are stuck with output-sensitive backtracking no matter how large " +
      "the target is.</p>"],
  ],

  problemsIntro: "Do LC 78, LC 46, LC 90 and LC 47 in that order. Those four are the two trees " +
    "and the two skip rules. Combination sum is the same page with a remaining integer.",

  problems: [
    { name: "Subsets", url: "https://leetcode.com/problems/subsets/",
      badge: "lc", tag: "LC 78", level: "Medium", pattern: "Pure include/exclude or bitmask" },
    { name: "Subsets II", url: "https://leetcode.com/problems/subsets-ii/",
      badge: "lc", tag: "LC 90", level: "Medium", pattern: "Sort + start-index skip" },
    { name: "Permutations", url: "https://leetcode.com/problems/permutations/",
      badge: "lc", tag: "LC 46", level: "Medium", pattern: "Swap or used[]; no skip" },
    { name: "Permutations II", url: "https://leetcode.com/problems/permutations-ii/",
      badge: "lc", tag: "LC 47", level: "Medium", pattern: "used[] and !used[i-1] skip" },
    { name: "Combinations", url: "https://leetcode.com/problems/combinations/",
      badge: "lc", tag: "LC 77", level: "Medium", pattern: "start-index, size k" },
    { name: "Combination Sum", url: "https://leetcode.com/problems/combination-sum/",
      badge: "lc", tag: "LC 39", level: "Medium", pattern: "Reuse: recurse with start = i" },
    { name: "Combination Sum II", url: "https://leetcode.com/problems/combination-sum-ii/",
      badge: "lc", tag: "LC 40", level: "Medium", pattern: "0/1 + Subsets II skip" },
    { name: "Generate Parentheses", url: "https://leetcode.com/problems/generate-parentheses/",
      badge: "lc", tag: "LC 22", level: "Medium", pattern: "Two counters as the state" },
    { name: "Letter Combinations of a Phone Number",
      url: "https://leetcode.com/problems/letter-combinations-of-a-phone-number/",
      badge: "lc", tag: "LC 17", level: "Medium", pattern: "Children = letters of digits[i]" },
    { name: "Creating Strings", url: "https://cses.fi/problemset/task/1622",
      badge: "cf", tag: "CSES", level: "Easy", pattern: "Permutations of a multiset" },
    { name: "Preparing Olympiad", url: "https://codeforces.com/problemset/problem/550/B",
      badge: "cf", tag: "CF 550B", level: "Easy", pattern: "Bitmask subsets with sum / min / max filters" },
    { name: "Switches", url: "https://atcoder.jp/contests/abc128/tasks/abc128_c",
      badge: "atc", tag: "ABC 128C", level: "Easy", pattern: "2^n masks of switch on/off" },
  ],

  spoilers: [
    { summary: "Hint for LC 47 &mdash; why used[i-1] must be true",
      body: "<p>Take <code>[1a, 1b, 2]</code>. The permutations that start with 1 must all " +
        "use 1a before 1b. If you allow a path to pick 1b while 1a is still free, you " +
        "rebuild the same sequences the 1a-first branch already emitted. The predicate " +
        "<code>!used[i-1]</code> is exactly \"I am picking this equal while the previous " +
        "equal is still free\" &mdash; the sibling you must kill.</p>" },
    { summary: "Hint for LC 40 &mdash; combination sum II",
      body: "<p>This is Subsets II plus a remaining-target prune. Sort, walk " +
        "<code>i</code> from <code>start</code>, skip <code>i &gt; start &amp;&amp; " +
        "a[i]==a[i-1]</code>, recurse <code>i+1</code>, and bail when " +
        "<code>a[i] &gt; remain</code> (legal only because you sorted). Reuse is forbidden, " +
        "so <code>start</code> must advance.</p>" },
  ],

  recap: {
    bullets: [
      "<strong>Subsets = include/exclude or bitmasks.</strong> Permutations = swap or used[].",
      "<strong>Combinations keep a start index</strong> so order cannot explode.",
      "<strong>Subsets II skip:</strong> <code>i &gt; start &amp;&amp; a[i]==a[i-1]</code>.",
      "<strong>Permutations II skip:</strong> <code>a[i]==a[i-1] &amp;&amp; !used[i-1]</code>.",
      "<strong>Combination sum:</strong> reuse keeps <code>start = i</code>; 0/1 uses " +
        "<code>i+1</code> plus the Subsets II skip.",
      "<strong>Always copy the path</strong> when you record it.",
    ],
    oneliner: "if (i>start && a[i]==a[i-1]) continue; path.add(a[i]); go(i+1); path.remove(path.size()-1);",
  },
},

/* ======================================== 3. backtracking-with-pruning == */
{
  id: "backtracking-with-pruning",
  difficulty: "Hard",
  readTime: "28 min",
  tagline: "Backtracking is generation plus a veto: the moment a partial assignment cannot " +
    "extend to a solution, you pop and try the next sibling instead of finishing the branch.",
  tags: ["backtracking", "pruning", "N-Queens", "Sudoku", "bitmask", "P1"],
  prereqs: [
    ["Subsets, Permutations, Combinations", "subsets-permutations-combinations.html"],
    ["Bit Manipulation", "../02-sorting-hashing-bits/bit-manipulation.html"],
  ],

  why: {
    paras: [
      "The previous page enumerates a Cartesian product. This page survives products that do " +
      "not fit in memory by <strong>pruning</strong>: a constraint checked on the prefix that " +
      "proves every completion is illegal. N-Queens without pruning is 16! board fillings; " +
      "with column and diagonal bitmasks it is a few thousand leaves on n = 8 and a standard " +
      "interview.",
      "The same skeleton covers Sudoku (cell, row, column, box uniqueness), word search " +
      "(grid DFS that unmarks on the way back), and palindrome partitioning (only cut when " +
      "the piece is already a palindrome). The skill is not the skeleton &mdash; you already " +
      "have it &mdash; it is choosing a cheap, complete veto.",
      "Bitmasks turn the N-Queens veto into a few bitwise operations and make n = 14 " +
      "solvable. That encoding is the one piece of this page that transfers to " +
      "<a href=\"../10-dynamic-programming/bitmask-dp.html\">bitmask DP</a> and to several " +
      "Codeforces constructive searches.",
    ],
    insight: "A prune is a proof that the current path is dead. If the check can wait until " +
      "the leaf, it is not a prune, it is a filter, and the tree will still explode.",
  },

  recognise: {
    yes: [
      "Place n non-attacking pieces, fill a grid under uniqueness constraints, or cut a " +
        "string under a local predicate",
      "\"Restore\" / \"solve\" / \"find all valid boards / partitions\"",
      "The search space is a product (cells &times; choices) that is illegal for n without " +
        "early rejection",
      "You can name a constraint that depends only on the prefix: used columns, used " +
        "characters, remaining unmatched opens",
      "Word search / path-in-a-grid that must not reuse a cell",
    ],
    no: [
      "You need the count of configurations and n is large enough that DP over subsets or " +
        "profile DP exists &rarr; do not backtrack",
      "Any feasible solution is fine and a greedy choice property holds &rarr; " +
        "<a href=\"../13-greedy-and-offline/greedy-foundations.html\">greedy</a>",
      "The constraint is a numeric knapsack on n &le; 40 &rarr; " +
        "<a href=\"meet-in-the-middle.html\">meet in the middle</a>",
      "You are searching a real graph for a shortest path &rarr; BFS, not backtracking",
    ],
    table: [
      ["N-Queens / n rooks / n knights", "One piece per row, attack columns", "Row-by-row + column/diag bitmasks"],
      ["Sudoku / Latin square", "Row, col, box uniqueness", "Next-empty cell; bitsets of remaining digits"],
      ["Word search", "Path of letters, no cell reuse", "DFS + mark/unmark; prune on mismatch"],
      ["Palindrome partition", "Every piece must be a palindrome", "Only recurse from cuts that already pass"],
      ["Restore IP / split string", "Each piece must match a regex", "Same cut-and-prune shape"],
      ["Hamiltonian path on n <= 12", "Visit every vertex once", "used-mask backtrack, or bitmask DP"],
      ["Maze: knock down walls / leave k empty", "Grid DFS with a remaining budget", "CF 377A shape"],
      ["<strong>Confused with:</strong> BFS / Dijkstra on a grid",
        "Those find shortest paths; they do not enumerate constrained fillings",
        "If the question is \"does a filling exist / list them\", it is backtracking"],
    ],
    constraint: "n = 8 or 9 (N-Queens, Sudoku) is the interview signature. n = 14 N-Queens " +
      "needs bitmasks. A 4&times;4 word-search board is fine; a 50&times;50 board with a long " +
      "dictionary is a trie + pruning problem (LC 212), not a naive DFS.",
  },

  core: {
    heading: "Core idea: assign, veto, undo",
    paras: [
      "The template is four lines of control flow. Pick the next decision (next row, next " +
      "empty cell, next cut). Iterate the candidates. If a candidate fails the veto, skip " +
      "it. Otherwise apply it, recurse, then undo. The undo is the difference between " +
      "backtracking and \"just recurse\": the same <code>used</code> structure is shared " +
      "across siblings, so it must be restored.",
      "N-Queens bitmasks: row <code>r</code> tries every free bit of " +
      "<code>avail = all &amp; ~(cols | d1 | d2)</code>. Placing bit <code>b</code> updates " +
      "<code>cols | b</code>, <code>(d1 | b) &lt;&lt; 1</code>, <code>(d2 | b) &gt;&gt; 1</code>. " +
      "The shifts slide the diagonals as you move to the next row. No arrays, no " +
      "<code>O(n)</code> attack scan.",
      "Word search marks <code>board[r][c] = '#'</code> (or a <code>used[][]</code>) before " +
      "the four recursive calls and restores the letter after. Palindrome partition " +
      "precomputes <code>isPal[i][j]</code> in <code>O(n&sup2;)</code> so every cut is " +
      "<code>O(1)</code> to validate; without that, you re-scan the piece at every node.",
    ],
    invariantTitle: "The interview sentence",
    invariant: "<p>A candidate is legal if and only if it does not violate a constraint with " +
      "the prefix already chosen. Check that <em>before</em> the recursive call. Undo every " +
      "mutation (cell, bitmask, mark) on the way back, including after a successful leaf if " +
      "you are enumerating all solutions.</p>",
    extra: [
      { kind: "tip", title: "Pick the most constrained decision next",
        html: "<p>Sudoku is dramatically faster if you fill the cell with the fewest remaining " +
          "digits, not \"the next empty in row-major order\". The same heuristic " +
          "(minimum-remaining-values) applies to any filling problem. Interviewers love " +
          "hearing the words even if they only wanted the row-major version.</p>" },
      { kind: "math", title: "Why bitmasks are enough for n <= 31",
        html: "<p>Columns and diagonals of an n-Queen board are n-bit sets. An " +
          "<code>int</code> holds 32 bits; use a <code>long</code> for n up to 63. " +
          "<code>avail &amp; -avail</code> isolates the lowest set bit; " +
          "<code>avail -= bit</code> (or <code>avail &amp;= avail-1</code>) consumes it. " +
          "That loop body is the entire branching.</p>" },
      { kind: "warn", title: "Undo on every exit path",
        html
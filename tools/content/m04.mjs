/* Module 04 — Recursion, Backtracking & D&C */
import { pack } from "./pack.mjs";

/** Flatten a full-schema topic (why.paras, visuals, recap.bullets, …) into pack() fields. */
function F(t) {
  const viz = (t.visuals || []).find((v) => v.kind === "array" || v.kind === "grid") || { data: {} };
  const mer = (t.visuals || []).find((v) => v.kind === "mermaid") || {};
  const d = viz.data || {};
  const rec = t.recognise || {};
  const core = t.core || {};
  const recap = t.recap || {};
  const dry = t.dryRun || {};
  return {
    id: t.id,
    difficulty: t.difficulty,
    readTime: t.readTime,
    tagline: t.tagline,
    tags: t.tags,
    prereqs: t.prereqs || [],
    why: t.why.paras,
    insight: t.why.insight,
    yes: rec.yes,
    no: rec.no,
    table: rec.table,
    constraint: rec.constraint,
    coreHeading: core.heading,
    core: core.paras,
    invariant: core.invariant,
    extra: core.extra || [],
    array: d.array || [0, 1, 2, 3, 4, 5],
    vars: d.vars,
    frames: d.frames,
    grid: viz.kind === "grid"
      ? { corner: d.corner, rowHeads: d.rowHeads, colHeads: d.colHeads }
      : undefined,
    indexLabels: d.indexLabels,
    arrayLabel: d.label,
    vizTitle: viz.h3,
    vizIntro: viz.intro,
    vizCaption: viz.caption,
    mermaid: mer.src,
    merTitle: mer.h3,
    merCaption: mer.caption,
    steps: t.steps,
    dryIntro: dry.intro,
    dryCols: dry.cols,
    dryRows: dry.rows,
    dryAfter: dry.after,
    code: t.code,
    complexity: t.complexity,
    pitfalls: t.pitfalls,
    variants: t.variants,
    followups: t.followups,
    problems: t.problems,
    spoilers: t.spoilers,
    recap: recap.bullets,
    oneliner: recap.oneliner,
  };
}

export const topics = [

/* ============================================ 1. recursion-fundamentals == */
pack(F({
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
      "Suppose somebody hands you the top folder of a project and asks how many bytes it holds " +
      "in total. You cannot write three nested loops for that, because you do not know how deep " +
      "the folders go &mdash; one branch might be two levels deep and another eleven. What you " +
      "can say is much simpler: the size of a folder is the sum of the files sitting directly " +
      "inside it, plus the total size of each folder sitting directly inside it. That sentence " +
      "describes the answer for a big folder purely in terms of the answer for smaller folders, " +
      "and a function written exactly like that sentence &mdash; one that calls itself on each " +
      "sub-folder &mdash; is a <strong>recursive</strong> function.",
      "The idea is the easy half. The half that trips people up is the machine underneath. When " +
      "one method calls another, Java sets aside a small block of memory called a <strong>stack " +
      "frame</strong>, holding that call's parameters, its local variables, and the address of " +
      "the instruction to return to when the call finishes. Frames are stacked: the newest one " +
      "sits on top and has to finish before the one below it can resume. A recursive function " +
      "therefore pays memory for how deeply it nests, not for how much total work it does. The " +
      "default HotSpot thread stack is roughly one megabyte and a frame costs tens to a few " +
      "hundred bytes, so somewhere between a few thousand and about <code>10&#8308;</code> " +
      "nested calls the program dies with a <code>StackOverflowError</code>.",
      "Cost is the other half. Draw the calls as a tree: the first call is the root, every call " +
      "it makes is a child, and calls that answer immediately without calling anything are the " +
      "leaves. Running time is the number of nodes in that <strong>recursion tree</strong> times " +
      "the work each node does on its own, while extra memory is the length of the longest " +
      "root-to-leaf path, because a child always finishes and releases its frame before its " +
      "sibling is even created. That distinction is worth real money. Naive " +
      "<code>fib(50)</code>, which calls itself twice at every node, builds roughly " +
      "<code>2.7&times;10&#185;&#8304;</code> nodes and runs for minutes, and yet its deepest " +
      "path is only 50 frames deep.",
      "Two facts are specific to Java and both show up in interviews. First, the JVM never turns " +
      "a recursive call into a loop, not even when the call is the very last thing the function " +
      "does &mdash; a shape called a <em>tail call</em> that Scheme and Scala do collapse. " +
      "Writing <code>return fact(n-1, acc*n)</code> still costs one frame per level here, so " +
      "\"make it tail recursive\" buys back no stack at all. Second, the constraint line of a " +
      "problem tells you when plain recursion is simply illegal: a list of length " +
      "<code>10&#8309;</code>, or a graph search over <code>2&times;10&#8309;</code> nodes that " +
      "could degenerate into one long path, has to be rewritten with an explicit " +
      "<code>ArrayDeque</code> before you submit it.",
    ],
    insight: "A recursive function is nothing more than a loop over a tree of stack frames: the " +
      "<strong>base case</strong> &mdash; the input small enough to answer outright, with no " +
      "further call &mdash; is that loop's stopping test, the number of nodes in the tree is " +
      "your running time, and the longest root-to-leaf path, not the node count, is the memory " +
      "the JVM must hold all at once.",
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
    constraint: "The signal is any bound that lets the <em>depth</em> of the recursion grow " +
      "with the input. The HotSpot default thread stack is roughly 1&nbsp;MB and one frame " +
      "costs a few dozen to a few hundred bytes, so you overflow somewhere between a few " +
      "thousand and about <code>10&#8308;</code> nested calls &mdash; long before you run out " +
      "of time. Treat a linear recursion at <code>n &ge; 10&#8308;</code> as illegal in Java " +
      "unless you have already rewritten it as a loop or an explicit stack. A halving " +
      "recursion is safe at any bound you will meet, because <code>log&#8322;(10&#8313;)</code> " +
      "is only thirty frames.",
  },

  core: {
    heading: "Core idea: frames, trees, and the base case",
    paras: [
      "When <code>f(n)</code> calls <code>f(n-1)</code>, the JVM pushes a frame for " +
      "<code>f(n)</code>, then a frame for <code>f(n-1)</code>, and so on, until a call hits " +
      "the <strong>base case</strong> &mdash; the input small enough to answer with no further " +
      "call &mdash; and returns a value. Each return pops one frame and resumes the caller at " +
      "the instruction after the recursive call. That last-in-first-out discipline <em>is</em> " +
      "the call stack, and the chain of resumes is the <strong>return path</strong>: " +
      "<code>fact(5)</code> waits to multiply by 5 only after <code>fact(4)</code> comes back. " +
      "That is why a recursive in-order walk of a BST emits keys in sorted order without you " +
      "managing a stack yourself.",
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
          { note: "fact(3) resumes: 3 * 2 = 6. Its frame then pops.",
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
      "path (space), because those two numbers are the cost you will quote.",
    "<strong>Check the JVM stack.</strong> If depth can reach thousands, switch to an " +
      "<code>ArrayDeque</code> or a loop <em>now</em>.",
    "<strong>Do not rely on tail recursion</strong> to save space in Java. Rewrite tails as " +
      "<code>while</code> loops that update an accumulator.",
    "<strong>If the same nodes repeat</strong>, you have overlapping subproblems: add a memo " +
      "table or go to <a href=\"../10-dynamic-programming/dp-foundations.html\">DP</a>.",
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
        "and claiming <code>O(1)</code> space, because textbooks call that a tail call and " +
        "other languages collapse it.",
      fix: "Say it out loud: HotSpot does not do TCO. Then write the loop. The tail form is " +
        "useful only as a stepping stone to the loop." },
    { title: "Quoting time as the depth",
      bug: "\"Fibonacci is <code>O(n)</code> because the deepest call is <code>fib(0)</code>.\" " +
        "Depth is space. Time is the number of calls, which is exponential.",
      fix: "Draw the tree. Count nodes for time, the longest path for space. They are equal " +
        "only on a stick." },
    { title: "Recursing down a linked list of length 1e5",
      bug: "An elegant <code>reverse(head.next)</code> that passes the short sample and throws " +
        "<code>StackOverflowError</code> on the hidden <code>n = 10&#8309;</code> list, because " +
        "the recursive form looks like the textbook definition.",
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
      "collapses the DAG back to <code>O(n)</code> work. That collapse of repeated calls into " +
      "one stored answer is dynamic programming.</p>"],
    ["Is the space of a balanced binary-tree DFS <code>O(n)</code> or <code>O(log n)</code>?",
      "<p><code>O(height)</code>. On a perfectly balanced tree that is <code>O(log n)</code>. " +
      "On a skewed tree (which is a linked list) it is <code>O(n)</code>. Always quote height, " +
      "then say what the worst-case tree looks like for this input. Interviewers always " +
      "listen for that distinction.</p>"],
    ["Can I just raise <code>-Xss</code> and recurse?",
      "<p>In a local experiment, yes. In a judged solution or a production service, no: you " +
      "do not control the launcher, and a 100&nbsp;MB stack per thread is not a strategy. " +
      "Rewrite the recursion as a loop or an explicit <code>ArrayDeque</code>. " +
      "<code>-Xss</code> is a debugging aid, not a solution.</p>"],
    ["What should I say when they ask for a tail-recursive version in Java?",
      "<p>Write it, explain that it would be <code>O(1)</code> space in a TCO language, then " +
      "write the equivalent loop and say that is the version you would actually commit in " +
      "Java. That answer scores both the concept and the platform knowledge that HotSpot " +
      "will not collapse the tail call.</p>"],
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
})),

/* ============================== 2. subsets-permutations-combinations === */
pack(F({
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
      "<strong>Include/exclude</strong> (or the equivalent bitmask loop) builds subsets: at " +
      "index <code>i</code> you either take <code>a[i]</code> or you skip it. " +
      "<strong>Swap / <code>used[]</code></strong> builds permutations: each unused value " +
      "tries the next slot. Combinations are subsets of a fixed size, generated with a " +
      "<code>start</code> index so order does not explode into permutations. Combination-sum " +
      "is the same tree with a remaining-target and a reuse policy.",
      "Take the array <code>[1, 2, 2]</code>. A naive include/exclude tree emits " +
      "<code>[1, 2]</code> twice: once by taking the first 2 and skipping the second, and " +
      "once by skipping the first 2 and taking the second. Those two paths sit at the same " +
      "depth under the same parent, which is why the skip talks about siblings and not about " +
      "the whole path. Memorise the four skip predicates below as if they were an API. " +
      "\"Sort, then skip equals\" is not one rule; it is four different rules that happen " +
      "to start with a sort.",
    ],
    insight: "Duplicates are equal values at the <em>same depth</em> of the tree. Skip the " +
      "second equal when its previous copy was not taken in this path; never skip an equal " +
      "that sits at a deeper level.",
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
      "and pop on the way back so the next sibling sees a clean path. On <code>[1, 2, 3]</code> " +
      "that produces eight leaves, from <code>[]</code> to <code>[1, 2, 3]</code>, and every " +
      "subset appears exactly once each. The bitmask form is the same tree flattened: bit " +
      "<code>j</code> of mask <code>m</code> means \"include <code>a[j]</code>\".",
      "Permutations fill positions. The swap implementation puts every remaining index into " +
      "slot <code>i</code> by swapping <code>a[i]</code> with <code>a[j]</code> for " +
      "<code>j &ge; i</code>, then recurses on <code>i+1</code>, then swaps back so the next " +
      "<code>j</code> still sees the original suffix. The <code>used[]</code> implementation " +
      "keeps the array intact and tracks which indices are already in the path. Both are " +
      "<code>O(n &middot; n!)</code> including the copies you write into the answer list.",
      "Dedup is a predicate on <em>siblings</em>, not on the whole path. Sort first so equals " +
      "are adjacent. Then apply exactly one of the four rules below &mdash; mixing them is " +
      "how you drop a valid subset or emit <code>[1,2]</code> twice. On " +
      "<code>[1, 2, 2]</code> the start-index skip kills the second 2 at the same " +
      "<code>start</code>, so the six unique subsets appear once each and the extra " +
      "<code>[1, 2]</code> never ships.",
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
          { note: "Backtrack and include 3 instead. Record the subset [3].",
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
    "<strong>Sort</strong> if the output must be unique and the input can contain duplicates, " +
      "because every skip rule reads <code>a[i-1]</code> as the previous equal.",
    "<strong>Write the skip predicate</strong> for that tree before any other line. Do not " +
      "improvise a third rule that mixes the two trees.",
    "<strong>Record a copy of the path</strong> at the right moment: leaf for permutations " +
      "and combinations of size k; every node (or the leaf of include/exclude) for subsets.",
    "<strong>Push, recurse, pop.</strong> The pop is mandatory even on early returns; a " +
      "<code>finally</code>-shaped pair of lines, not a hope.",
    "<strong>For unlimited combination-sum</strong>, recurse with <code>start = i</code> and " +
      "subtract <code>a[i]</code>. Guard <code>remain &lt; 0</code> as a prune.",
    "<strong>Prefer a bitmask loop</strong> when you need a numeric aggregate over subsets " +
      "(sum, XOR, count), not the lists themselves.",
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
      bug: "<code>ans.add(path)</code> then <code>path.add(x)</code>. Every stored list is " +
        "the same object, so later mutations rewrite earlier answers. The judge shows n " +
        "copies of the last path.",
      fix: "<code>ans.add(new ArrayList&lt;&gt;(path))</code> at every record point, so each " +
        "answer is a snapshot that later pops cannot touch." },
    { title: "The wrong skip predicate",
      bug: "Using <code>!used[i-1]</code> on a start-index tree, or " +
        "<code>i &gt; start &amp;&amp; a[i]==a[i-1]</code> on a permutation tree. Each " +
        "predicate looks locally correct and silently drops valid answers.",
      fix: "Subsets II / Comb Sum II: same-depth skip via <code>i &gt; start</code>. " +
        "Permutations II: previous equal must already be used. Do not mix." },
    { title: "Forgetting to sort before skipping",
      bug: "The skip looks at <code>a[i-1]</code>, which is only the previous equal after " +
        "a sort. Unsorted <code>[2,1,2]</code> will emit duplicate subsets.",
      fix: "<code>Arrays.sort(a)</code> is part of the contract of every unique-output " +
        "generator except a pure bitmask over unique indices. Sort first, then skip." },
    { title: "Reuse going backwards",
      bug: "Combination-sum with <code>start = 0</code> on every call, so " +
        "<code>[2,3]</code> and <code>[3,2]</code> both appear. The reuse looks correct " +
        "because you can pick 2 again, but the start index walked backwards.",
      fix: "Never decrease <code>start</code>. Unlimited reuse keeps <code>start = i</code>; " +
        "0/1 use advances to <code>i+1</code>." },
    { title: "Bitmask on duplicate values when uniqueness is required",
      bug: "Looping <code>0 .. 2^n-1</code> on <code>[1,2,2]</code> and dumping every mask. " +
        "The masks <code>011</code> and <code>101</code> are different index-sets, so " +
        "<code>[1,2]</code> appears twice and looks like a complete power set.",
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
      "source in <code>O(1)</code> per sibling. Interviewers ask you to write the rule, " +
      "not to paper over it with a set.</p>"],
    ["Swap or <code>used[]</code> for unique permutations?",
      "<p>Swap, when the values are unique. There is nothing to skip. <code>used[]</code> " +
      "is extra memory and extra branches. Use swap until the input has duplicates, then " +
      "switch &mdash; swap-plus-skip is easy to get wrong because the suffix is no longer " +
      "a clean unused multiset after previous swaps.</p>"],
    ["When does combination sum become DP?",
      "<p>The moment they ask for the <em>number</em> of combinations (order irrelevant) " +
      "and <code>n</code> or the target is large. That is unbounded knapsack, and a " +
      "<code>dp[remain]</code> loop beats the tree. If they want the lists, you are stuck " +
      "with output-sensitive backtracking no matter how large the target is.</p>"],
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
})),

/* ======================================== 3. backtracking-with-pruning == */
pack(F({
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
      "You are given an n-by-n chessboard and you must place n queens so that none share a " +
      "row, column, or diagonal. The previous page enumerates a Cartesian product. This page " +
      "survives products that do not fit in memory by <strong>pruning</strong>: a constraint " +
      "checked on the prefix that proves every completion is illegal. N-Queens without " +
      "pruning is 16! board fillings; with column and diagonal bitmasks it is a few thousand " +
      "leaves on n = 8 and a standard interview.",
      "The same skeleton covers Sudoku (cell, row, column, box uniqueness), word search " +
      "(grid DFS that unmarks on the way back), and palindrome partitioning (only cut when " +
      "the piece is already a palindrome). You are given a partial assignment and you must " +
      "extend it without violating a local rule. The skill is not the skeleton &mdash; you " +
      "already have it &mdash; it is choosing a cheap, complete veto that you can check on " +
      "the prefix alone, before you spend another recursive call.",
      "Bitmasks turn the N-Queens veto into a few bitwise operations and make n = 14 " +
      "solvable: each column and each diagonal is one bit, so a placement is a handful of " +
      "shifts and ORs instead of an <code>O(n)</code> scan of the board. That encoding is " +
      "the one piece of this page that transfers to " +
      "<a href=\"../10-dynamic-programming/bitmask-dp.html\">bitmask DP</a> and to several " +
      "Codeforces constructive searches where the state is \"which columns or vertices are " +
      "already taken\".",
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
      "across siblings, so it must be restored after the child returns. If you place a queen " +
      "in column 1 and never clear that bit, every later sibling still thinks column 1 is " +
      "taken and the rest of the tree is silently empty.",
      "N-Queens bitmasks: row <code>r</code> tries every free bit of " +
      "<code>avail = all &amp; ~(cols | d1 | d2)</code>. Placing bit <code>b</code> updates " +
      "<code>cols | b</code>, <code>(d1 | b) &lt;&lt; 1</code>, <code>(d2 | b) &gt;&gt; 1</code>. " +
      "The shifts slide the diagonals as you move to the next row. No arrays, no " +
      "<code>O(n)</code> attack scan.",
      "Word search marks <code>board[r][c] = '#'</code> (or a <code>used[][]</code>) before " +
      "the four recursive calls and restores the letter after, so a later starting cell can " +
      "reuse that square. Palindrome partition precomputes <code>isPal[i][j]</code> in " +
      "<code>O(n&sup2;)</code> so every cut is <code>O(1)</code> to validate; without that, " +
      "you re-scan the piece at every node. On <code>s = \"aab\"</code> the table says " +
      "<code>aa</code> is already a palindrome, so the cut after index 1 is legal and the " +
      "tree never builds <code>\"a\" + \"ab\"</code> as a candidate.",
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
        html: "<p>A successful leaf still shares the same board or bitmasks as its " +
          "siblings. Restore every mutation after the recursive call, including after a " +
          "true return if you are enumerating all solutions. The safe shape is apply, " +
          "recurse, undo as three consecutive lines.</p>" },
    ],
  },

  visuals: [
    {
      kind: "grid", vizId: "nq4",
      h3: "N-Queens on a 4 x 4, bitmask view",
      intro: "Rows top to bottom. Q is a queen, x is rejected by the current masks, a dot " +
        "is still free. Watch row 2 die with <code>avail = 0</code> &mdash; that is the prune.",
      caption: "One failed branch, then a complete solution. The prune at row 2 never " +
        "spawns row 3, which is the whole point of a veto.",
      data: {
        corner: "r/c",
        rowHeads: ["0", "1", "2", "3"],
        colHeads: ["0", "1", "2", "3"],
        vars: ["row", "cols", "avail"],
        speed: 1100,
        frames: [
          { note: "Empty board. all = 1111b. Row 0 may place in any column.",
            cells: [
              { r: 0, c: 0, val: "." }, { r: 0, c: 1, val: "." },
              { r: 0, c: 2, val: "." }, { r: 0, c: 3, val: "." },
              { r: 1, c: 0, val: "." }, { r: 1, c: 1, val: "." },
              { r: 1, c: 2, val: "." }, { r: 1, c: 3, val: "." },
              { r: 2, c: 0, val: "." }, { r: 2, c: 1, val: "." },
              { r: 2, c: 2, val: "." }, { r: 2, c: 3, val: "." },
              { r: 3, c: 0, val: "." }, { r: 3, c: 1, val: "." },
              { r: 3, c: 2, val: "." }, { r: 3, c: 3, val: "." },
            ],
            values: { row: 0, cols: "0000", avail: "1111" } },
          { note: "Place row 0, column 1. cols becomes 0010. Diagonals will slide on the next row.",
            cells: [
              { r: 0, c: 0, val: "." }, { r: 0, c: 1, val: "Q", cls: "answer" },
              { r: 0, c: 2, val: "." }, { r: 0, c: 3, val: "." },
            ],
            values: { row: 0, cols: "0010", avail: "placed 1" } },
          { note: "Row 1: column 1 and the two diagonals through (0,1) are blocked. Place column 3.",
            cells: [
              { r: 0, c: 1, val: "Q", cls: "filled" },
              { r: 1, c: 0, val: "." }, { r: 1, c: 1, val: "x", cls: "block" },
              { r: 1, c: 2, val: "x", cls: "block" }, { r: 1, c: 3, val: "Q", cls: "answer" },
            ],
            values: { row: 1, cols: "1010", avail: "placed 3" } },
          { note: "Row 2: cols 1 and 3 plus sliding diagonals leave nothing. avail = 0000. Prune.",
            cells: [
              { r: 0, c: 1, val: "Q", cls: "filled" },
              { r: 1, c: 3, val: "Q", cls: "filled" },
              { r: 2, c: 0, val: "x", cls: "block" }, { r: 2, c: 1, val: "x", cls: "block" },
              { r: 2, c: 2, val: "x", cls: "block" }, { r: 2, c: 3, val: "x", cls: "block" },
            ],
            values: { row: 2, cols: "1010", avail: "0000 prune" } },
          { note: "Undo row 1 column 3. Try row 1 column 0, the other free bit from earlier.",
            cells: [
              { r: 0, c: 1, val: "Q", cls: "filled" },
              { r: 1, c: 0, val: "Q", cls: "answer" }, { r: 1, c: 1, val: "x", cls: "block" },
              { r: 1, c: 2, val: "x", cls: "block" }, { r: 1, c: 3, val: "." },
            ],
            values: { row: 1, cols: "0011", avail: "placed 0" } },
          { note: "Row 2 is still cramped. This branch dies too. Undo row 0 column 1 entirely.",
            cells: [
              { r: 0, c: 1, val: "Q", cls: "filled" },
              { r: 1, c: 0, val: "Q", cls: "filled" },
              { r: 2, c: 0, val: "x", cls: "block" }, { r: 2, c: 1, val: "x", cls: "block" },
              { r: 2, c: 2, val: "x", cls: "block" }, { r: 2, c: 3, val: "." },
            ],
            values: { row: 2, cols: "0011", avail: "almost empty" } },
          { note: "Restart: row 0 column 2, then row 1 column 0. This is the winning branch.",
            cells: [
              { r: 0, c: 2, val: "Q", cls: "answer" },
              { r: 1, c: 0, val: "Q", cls: "answer" },
            ],
            values: { row: 1, cols: "0101", avail: "placed 0" } },
          { note: "A solution of n = 4: queens at (0,2), (1,0), (2,3), (3,1). Two solutions exist; this is one.",
            cells: [
              { r: 0, c: 2, val: "Q", cls: "answer" },
              { r: 1, c: 0, val: "Q", cls: "answer" },
              { r: 2, c: 3, val: "Q", cls: "answer" },
              { r: 3, c: 1, val: "Q", cls: "answer" },
            ],
            values: { row: 4, cols: "1111", avail: "solved" } },
        ],
      },
    },
    {
      kind: "mermaid", vizId: "btFlow",
      h3: "The assign / veto / undo loop",
      caption: "Every problem on this page is this flowchart with a different next-decision " +
        "and a different veto.",
      src: `flowchart TD
  pick["pick the next undecided slot"] --> empty{"any slot left?"}
  empty -- no --> record["record a solution"]
  empty -- yes --> cand["generate candidates for that slot"]
  cand --> veto{"does this candidate fight the prefix?"}
  veto -- yes --> nextCand["skip, try the next candidate"]
  veto -- no --> apply["apply: set cell, flip bits, mark used"]
  apply --> rec["recurse on the following slot"]
  rec --> undoStep["undo the apply"]
  undoStep --> nextCand
  nextCand --> more{"candidates remain?"}
  more -- yes --> veto
  more -- no --> back["return to the parent slot"]`,
    },
  ],

  steps: [
    "<strong>Name the decision sequence.</strong> One queen per row; next empty Sudoku cell; " +
      "next cut index; next grid step matching the next letter.",
    "<strong>Name the veto</strong> as a function of the prefix only. If you cannot check it " +
      "yet, you do not have a prune.",
    "<strong>Encode the veto cheaply.</strong> Bitmasks for N-Queens; row/col/box bitsets for " +
      "Sudoku; a mark on the cell for word search; <code>isPal[i][j]</code> for partitions.",
    "<strong>Apply, recurse, undo</strong> as three consecutive operations, because the " +
      "shared board or bitmask must look unused again before the next sibling runs.",
    "<strong>For find-one</strong>, return a boolean and stop siblings on true. For find-all, " +
      "collect the leaf and keep going so later solutions are not skipped.",
    "<strong>Precompute what you can</strong> &mdash; a palindrome table, remaining digit " +
      "counts &mdash; so the veto is <code>O(1)</code> at every node.",
    "<strong>Prefer bitmasks at n &le; 31</strong> whenever the veto is a set of columns or " +
      "used vertices, because an <code>int</code> already holds the whole set.",
    "<strong>Count nodes on a 4-queen board by hand</strong> once so you believe the prune: " +
      "the dead branch at row 2 never creates a row-3 frame.",
  ],

  dryRun: {
    intro: "N-Queens n = 4, first successful placement. Bitmasks in binary, bit 0 = column 0. " +
      "Highlighted rows are the prunes that kill a prefix.",
    cols: ["row", "place col", "cols", "avail next", "result"],
    rows: [
      { cells: ["0", "1", "0010", "row1: 1001", "try"],
        action: "First branch. Symmetric to placing column 2." },
      { cells: ["1", "3", "1010", "row2: 0000", "prune"],
        action: "No free bit. Undo column 3.", change: true },
      { cells: ["1", "0", "0011", "row2 cramped", "dies later"],
        action: "The other child of row 1 also dies.", change: true },
      { cells: ["0", "2", "0100", "row1: 1001", "try other root"],
        action: "Undo everything from column 1." },
      { cells: ["1", "0", "0101", "row2 has a free bit", "extend"],
        action: "This is the winning branch." },
      { cells: ["2", "3", "1101", "row3: 0010", "extend"],
        action: "Only column 1 remains." },
      { cells: ["3", "1", "1111", "none", "solution"],
        action: "Queens at columns 2, 0, 3, 1.", change: true },
      { cells: ["0", "0 or 3", "edge columns", "both die", "one more solution"],
        action: "The second solution is the left-right mirror." },
    ],
  },

  code: [
    { tab: "Brute", panel: "N-Queens arrays", file: "NQueensBrute.java",
      intro: "The version you can explain in sixty seconds. Each placement scans column and " +
        "diagonals in O(n). Fine for n = 8; the bitmask rewrite is the follow-up.",
      highlight: "18-27",
      code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class NQueensBrute {

    static List<List<String>> solveNQueens(int n) {
        char[][] b = new char[n][n];
        for (char[] row : b) {
            Arrays.fill(row, '.');
        }
        List<List<String>> ans = new ArrayList<>();
        go(0, b, ans);
        return ans;
    }

    static void go(int r, char[][] b, List<List<String>> ans) {
        int n = b.length;
        if (r == n) {
            List<String> pack = new ArrayList<>();
            for (char[] row : b) {
                pack.add(new String(row));
            }
            ans.add(pack);
            return;
        }
        for (int c = 0; c < n; c++) {
            if (!safe(b, r, c)) {
                continue;
            }
            b[r][c] = 'Q';
            go(r + 1, b, ans);
            b[r][c] = '.';
        }
    }

    static boolean safe(char[][] b, int r, int c) {
        for (int i = 0; i < r; i++) {
            if (b[i][c] == 'Q') {
                return false;
            }
        }
        for (int i = r - 1, j = c - 1; i >= 0 && j >= 0; i--, j--) {
            if (b[i][j] == 'Q') {
                return false;
            }
        }
        for (int i = r - 1, j = c + 1; i >= 0 && j < b.length; i--, j++) {
            if (b[i][j] == 'Q') {
                return false;
            }
        }
        return true;
    }

    public static void main(String[] args) {
        System.out.println(solveNQueens(4).size());
    }
    // Input : n = 4
    // Output: 2
}`,
    },
    { tab: "Optimal", panel: "Bitmask N-Queens", file: "NQueensBitmask.java",
      intro: "Same tree, O(1) veto. <code>avail &amp; -avail</code> peels the lowest free " +
        "column. Shifts slide the diagonals to the next row.",
      highlight: "12-20",
      code: `public class NQueensBitmask {

    static int totalNQueens(int n) {
        return go(0, 0, 0, 0, n);
    }

    static int go(int row, int cols, int d1, int d2, int n) {
        if (row == n) {
            return 1;
        }
        int count = 0;
        int all = (1 << n) - 1;
        int avail = all & ~(cols | d1 | d2);
        while (avail != 0) {
            int bit = avail & -avail;
            avail -= bit;
            count += go(row + 1, cols | bit, (d1 | bit) << 1, (d2 | bit) >> 1, n);
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(totalNQueens(4));
        System.out.println(totalNQueens(8));
    }
    // Input : 4, then 8
    // Output: 2
    //         92
}`,
    },
    { tab: "Template", panel: "Word search + palindrome cut", file: "BacktrackTemplate.java",
      intro: "Two other vetoes on the same skeleton. Word search marks the cell; palindrome " +
        "partition only recurses from a cut that is already a palindrome.",
      highlight: "16-28,48-52",
      code: `import java.util.ArrayList;
import java.util.List;

public class BacktrackTemplate {

    static boolean exist(char[][] b, String word) {
        for (int r = 0; r < b.length; r++) {
            for (int c = 0; c < b[0].length; c++) {
                if (dfs(b, r, c, 0, word)) {
                    return true;
                }
            }
        }
        return false;
    }

    static boolean dfs(char[][] b, int r, int c, int k, String word) {
        if (k == word.length()) {
            return true;
        }
        if (r < 0 || c < 0 || r >= b.length || c >= b[0].length) {
            return false;
        }
        if (b[r][c] != word.charAt(k)) {
            return false;
        }
        char saved = b[r][c];
        b[r][c] = '#';
        boolean ok = dfs(b, r + 1, c, k + 1, word)
                || dfs(b, r - 1, c, k + 1, word)
                || dfs(b, r, c + 1, k + 1, word)
                || dfs(b, r, c - 1, k + 1, word);
        b[r][c] = saved;
        return ok;
    }

    static List<List<String>> partition(String s) {
        int n = s.length();
        boolean[][] pal = new boolean[n][n];
        for (int i = n - 1; i >= 0; i--) {
            for (int j = i; j < n; j++) {
                pal[i][j] = s.charAt(i) == s.charAt(j)
                        && (j - i < 2 || pal[i + 1][j - 1]);
            }
        }
        List<List<String>> ans = new ArrayList<>();
        cut(s, 0, pal, new ArrayList<>(), ans);
        return ans;
    }

    static void cut(String s, int start, boolean[][] pal, List<String> path,
                    List<List<String>> ans) {
        if (start == s.length()) {
            ans.add(new ArrayList<>(path));
            return;
        }
        for (int end = start; end < s.length(); end++) {
            if (!pal[start][end]) {
                continue;
            }
            path.add(s.substring(start, end + 1));
            cut(s, end + 1, pal, path, ans);
            path.remove(path.size() - 1);
        }
    }

    public static void main(String[] args) {
        char[][] b = {
            {'A', 'B', 'C', 'E'},
            {'S', 'F', 'C', 'S'},
            {'A', 'D', 'E', 'E'},
        };
        System.out.println(exist(b, "ABCCED"));
        System.out.println(partition("aab"));
    }
    // Input : board + ABCCED; s = aab
    // Output: true
    //         [[a, a, b], [aa, b]]
}`,
    },
  ],

  complexity: {
    time: "pruned product",
    space: "O(depth)",
    derivation: [
      "<p>Without a prune, N-Queens is at most <code>n!</code> column permutations. The " +
      "diagonal veto removes a large constant; the tree is still super-exponential, which is " +
      "why interviews stop at n = 9 and contests stop at n = 14 with bitmasks only.</p>",
      "<span class=\"eq\">word search: O(RC &middot; 4<sup>L</sup>) worst case</span>",
      "<p>Palindrome partition is <code>O(n &middot; 2&#8319;)</code> plus " +
      "<code>O(n&sup2;)</code> to build <code>isPal</code>. Sudoku is a 9<sup>81</sup> " +
      "product in theory and a few thousand nodes once row/col/box bitsets veto digits.</p>",
    ],
    compare: [
      ["N-Queens, scan attacks", "O(n!) * O(n)", "O(n)", "Fine for n = 8"],
      ["N-Queens, bitmasks", "O(n!) pruned", "O(n)", "Same tree, O(1) veto"],
      ["Sudoku row-major", "huge, pruned", "O(1) extra", "Interview default"],
      ["Word search", "O(RC 4^L)", "O(L)", "Mark/unmark the cell"],
      ["Palindrome partition", "O(n 2^n)", "O(n^2) table", "Precompute isPal"],
    ],
  },

  pitfalls: [
    { title: "Checking the constraint only at the leaf",
      bug: "Fill all n queens, then test the whole board. That looks tidy because the " +
        "checker is one function, but the tree is n^n placements, not n! permutations.",
      fix: "Veto as soon as a queen, digit or letter is placed, before the recursive call." },
    { title: "Forgetting to unmark a cell",
      bug: "Word search sets <code>board[r][c] = '#'</code> and returns without restoring, " +
        "because the early true-return looks like the search is done.",
      fix: "Restore the letter after the four recursive calls, on every path, including " +
        "the successful one." },
    { title: "Shifting diagonals the wrong way",
      bug: "Illegal placements survive because attacks slide off the wrong side, and the " +
        "bitmask still looks like a clean occupancy set.",
      fix: "Draw one queen at (0,1) and write the next row's bits by hand. n = 4 (answer 2) is the unit test." },
    { title: "Substring allocations inside the cut loop",
      bug: "Calling <code>s.substring</code> before you know the piece is a palindrome, " +
        "because the cut loop looks like ordinary string splitting work.",
      fix: "Test <code>pal[start][end]</code> first. Only then allocate the substring, so " +
        "rejected cuts never pay for a new string." },
    { title: "Sudoku box index off by one",
      bug: "<code>r / 3 + c / 3</code> instead of <code>(r / 3) * 3 + (c / 3)</code>. The " +
        "shorter formula looks like a box id and silently aliases three boxes together.",
      fix: "Box id is <code>(r / 3) * 3 + (c / 3)</code>. Print it on a solved board once." },
  ],

  variants: [
    ["Count solutions only",
      "Drop the board packing. N-Queens II is the bitmask function on this page.",
      "return go(...) increment at row==n",
      "<a href=\"https://leetcode.com/problems/n-queens-ii/\" target=\"_blank\" rel=\"noopener\">LC 52</a>"],
    ["Word Search II",
      "Many words. Build a trie and DFS the board once, pruning when the node has no child.",
      "TrieNode nxt = node.ch[board[r][c]-'a']; if (nxt==null) return;",
      "<a href=\"https://leetcode.com/problems/word-search-ii/\" target=\"_blank\" rel=\"noopener\">LC 212</a>"],
    ["Sudoku solver",
      "Next empty cell, try digits 1-9, veto with row/col/box bitsets, return true on the first complete board.",
      "int bit = 1 << d; if ((row[r] & bit) != 0) continue;",
      "<a href=\"https://leetcode.com/problems/sudoku-solver/\" target=\"_blank\" rel=\"noopener\">LC 37</a>"],
  ],

  followups: [
    ["Why do the diagonal shifts work?",
      "<p>A down-right diagonal has constant <code>r - c</code>. Moving to <code>r+1</code> " +
      "increases the occupied column on that diagonal by 1, which is a left shift if bit 0 " +
      "is column 0. The other diagonal is constant <code>r + c</code> and slides the other " +
      "way. Bits that shift off the ends have left the board.</p>"],
    ["Is word search BFS or DFS?",
      "<p>DFS with mark/unmark. BFS would need a used-set per path, because two different " +
      "routes can visit the same cell, and there is no shortest-path objective. LC 79 is " +
      "existence of any matching walk, so backtracking DFS is the default and the cheaper " +
      "structure to write.</p>"],
    ["When do I switch from backtracking to bitmask DP?",
      "<p>When you need a count or an optimum over subsets of n &le; 20, and the same " +
      "subset is reached by many orders, so memoising the mask beats replaying every " +
      "permutation. Filling under local constraints with n = 9 (Sudoku) stays backtracking, " +
      "because the state is the board, not a subset of items.</p>"],
    ["Can I prune palindrome partition without the n^2 table?",
      "<p>Yes: scan the piece at each node with two pointers. It is correct and slower, " +
      "because the same substring is re-tested on many branches. The <code>O(n&sup2;)</code> " +
      "table is the expected interview extra: build it once up front, then every later " +
      "cut is a constant-time lookup.</p>"],
  ],

  problemsIntro: "LC 51, LC 37, LC 79 and LC 131 are the four vetoes on this page. The " +
    "Codeforces problems use the same idea on a grid or a subset mask.",

  problems: [
    { name: "N-Queens", url: "https://leetcode.com/problems/n-queens/",
      badge: "lc", tag: "LC 51", level: "Hard", pattern: "Row-by-row + attack veto" },
    { name: "N-Queens II", url: "https://leetcode.com/problems/n-queens-ii/",
      badge: "lc", tag: "LC 52", level: "Hard", pattern: "Bitmask count" },
    { name: "Sudoku Solver", url: "https://leetcode.com/problems/sudoku-solver/",
      badge: "lc", tag: "LC 37", level: "Hard", pattern: "Next empty + row/col/box bitsets" },
    { name: "Word Search", url: "https://leetcode.com/problems/word-search/",
      badge: "lc", tag: "LC 79", level: "Medium", pattern: "DFS mark/unmark" },
    { name: "Palindrome Partitioning", url: "https://leetcode.com/problems/palindrome-partitioning/",
      badge: "lc", tag: "LC 131", level: "Medium", pattern: "Cut only when isPal" },
    { name: "Word Search II", url: "https://leetcode.com/problems/word-search-ii/",
      badge: "lc", tag: "LC 212", level: "Hard", pattern: "Trie + board DFS" },
    { name: "Beautiful Arrangement", url: "https://leetcode.com/problems/beautiful-arrangement/",
      badge: "lc", tag: "LC 526", level: "Medium", pattern: "Permutation with a cheap veto" },
    { name: "Chessboard and Queens", url: "https://cses.fi/problemset/task/1624",
      badge: "cf", tag: "CSES", level: "Medium", pattern: "N-Queens with reserved squares" },
    { name: "Preparing Olympiad", url: "https://codeforces.com/problemset/problem/550/B",
      badge: "cf", tag: "CF 550B", level: "Easy", pattern: "Bitmask + filter" },
    { name: "Maze", url: "https://codeforces.com/problemset/problem/377/A",
      badge: "cf", tag: "CF 377A", level: "Medium", pattern: "DFS empties, turn the last s into walls" },
    { name: "N-Queen Problem", url: "https://www.geeksforgeeks.org/problems/n-queen-problem0315/1",
      badge: "gfg", tag: "GfG", level: "Hard", pattern: "Same as LC 51, 1-based columns" },
    { name: "Rat in a Maze", url: "https://www.geeksforgeeks.org/problems/rat-in-a-maze-problem/1",
      badge: "gfg", tag: "GfG", level: "Medium", pattern: "Grid DFS, record the path string" },
  ],

  spoilers: [
    { summary: "Hint for CF 377A &mdash; Maze",
      body: "<p>You must leave exactly <code>k</code> empty cells, still connected. DFS the " +
        "empties from any start; the last <code>s = empties - k</code> cells you finish can " +
        "become walls. A prefix of the same search stays connected. Do not place walls first.</p>" },
    { summary: "Hint for LC 212 &mdash; Word Search II",
      body: "<p>A separate DFS per word dies. Insert every word into a trie. DFS each board " +
        "cell once, walking the trie; prune when there is no child. Restore the board cell " +
        "the same way as LC 79.</p>" },
  ],

  recap: {
    bullets: [
      "<strong>Assign, veto, recurse, undo.</strong> The veto is the prune.",
      "<strong>N-Queens bitmasks:</strong> <code>avail &amp; -avail</code>, then shift the diagonals.",
      "<strong>Sudoku:</strong> next empty plus row/col/box sets.",
      "<strong>Word search:</strong> mark, recurse four ways, unmark.",
      "<strong>Palindrome partition:</strong> precompute <code>isPal</code>, cut only on true.",
    ],
    oneliner: "int bit=avail&-avail; avail-=bit; go(row+1, cols|bit, (d1|bit)<<1, (d2|bit)>>1);",
  },
})),

/* ============================================== 4. divide-and-conquer === */
pack(F({
  id: "divide-and-conquer",
  difficulty: "Medium",
  readTime: "26 min",
  tagline: "Split the input, solve the halves, and spend linear time combining them &mdash; " +
    "the recipe behind mergesort, inversion counting, majority, and closest pair.",
  tags: ["divide and conquer", "mergesort", "inversions", "quicksort", "P0"],
  prereqs: [
    ["Recursion Fundamentals", "recursion-fundamentals.html"],
    ["Recurrences &amp; Master Theorem", "../00-foundations/recurrences-and-master-theorem.html"],
  ],

  why: {
    paras: [
      "You are given an array of n numbers and you must sort it, or count how many pairs " +
      "are out of order, without writing a double loop. Divide and conquer is the reason " +
      "<code>O(n log n)</code> exists as a default target. Split the array in half, recurse, " +
      "merge the two sorted runs in linear time. The tree has <code>log n</code> levels and " +
      "each level touches every element once, so the total is <code>n log n</code> &mdash; " +
      "about <code>1.7 &times; 10&#8310;</code> operations at <code>n = 10&#8309;</code>. " +
      "That accounting is case 2 of " +
      "<a href=\"../00-foundations/recurrences-and-master-theorem.html\">the master theorem</a>.",
      "The same split produces inversion counts (a merge that also counts split pairs), " +
      "majority without Boyer-Moore, and the <code>O(n log n)</code> closest-pair algorithm. " +
      "Quicksort is the same idea with an uneven, data-dependent split and a free combine " +
      "&mdash; which is why its worst case is quadratic and its expected case is " +
      "<code>n log n</code>. A reverse-sorted input with the first element as pivot is the " +
      "picture that kills the naive version.",
      "The skill is the <strong>combine</strong>. The recursive calls are boilerplate. The " +
      "interview is: what must each half return so the cross terms can be counted in linear " +
      "time? For inversions that return is a sorted run plus a count; for closest pair it is " +
      "a y-sorted strip. If you cannot name the extra payload, you do not yet have a " +
      "divide-and-conquer solution, only a recursive split.",
    ],
    insight: "If the cross-half contribution can be computed in linear time after the halves " +
      "are sorted, the whole algorithm is <code>O(n log n)</code>: <code>log n</code> levels, " +
      "each touching every element once.",
  },

  recognise: {
    yes: [
      "\"Count inversions / reverse pairs / smaller elements to the right\"",
      "A naive double loop that compares <code>i &lt; j</code> with <code>a[i] ? a[j]</code>",
      "Implement mergesort or quicksort",
      "Majority element when they want a recursive argument rather than Boyer-Moore",
      "Closest pair of points, or any geometric pair that splits on x",
    ],
    no: [
      "The combine is quadratic and you cannot sort the halves first &rarr; " +
        "<code>T(n) = 2T(n/2) + n&sup2; = &Theta;(n&sup2;)</code>, no win",
      "You need an online answer after each insert &rarr; Fenwick or a balanced tree",
      "The split is unbalanced and you cannot randomise &rarr; worst-case quadratic quicksort",
      "n &le; 40 subset-style counting &rarr; " +
        "<a href=\"meet-in-the-middle.html\">meet in the middle</a>",
    ],
    table: [
      ["\"sort the array\"", "Two sorted halves + linear merge", "Mergesort"],
      ["\"count inversions\"", "Split pairs are leftover-left on a right-take", "Mergesort + counter"],
      ["\"reverse pairs\" a[i] > 2*a[j]", "Two-pointer count before the merge", "LC 493"],
      ["\"majority element\"", "Majority of a half, then combine counts", "D&C majority"],
      ["\"k-th smallest\"", "Partition, recurse on one side", "Quickselect"],
      ["\"closest pair of points\"", "Split on x, then a strip combine", "O(n log n) geometry"],
      ["\"maximum subarray\"", "Best left, best right, best crossing", "O(n log n) Kadane cousin"],
      ["<strong>Confused with:</strong> binary search on the answer",
        "That divides the value range, not the array",
        "<a href=\"../01-arrays-and-windows/binary-search-on-answer.html\">BS on answer</a>"],
    ],
    constraint: "<code>n &le; 10&#8309;</code> plus a pair-counting condition is the " +
      "signature for mergesort-with-a-counter: a double loop is <code>5 &times; 10&#8313;</code> " +
      "and dies, while <code>n log n</code> fits in a second. Shuffle before a hand-rolled " +
      "quicksort partition; contests will feed you the adversarial permutation.",
  },

  core: {
    heading: "Core idea: the combine pays for the split",
    paras: [
      "Mergesort: sort <code>a[lo..mid)</code> and <code>a[mid..hi)</code>, then merge into " +
      "a buffer. Two pointers walk two sorted runs; each step emits the smaller head. " +
      "Stability comes from preferring the left head on a tie, so equal keys keep the order " +
      "they had in the input. The buffer is the only extra linear memory; the recursion " +
      "itself is only <code>O(log n)</code> frames because siblings do not coexist.",
      "Inversions: a pair (i, j) with i &lt; j and a[i] &gt; a[j] is both-left, both-right, " +
      "or split. The first two come from the recursive calls. A split inversion is counted " +
      "when the merge takes a head from the right: every unused left element is greater and " +
      "to the left, so add <code>leftRemaining</code>. On <code>[2, 5, 8] | [1, 3, 9]</code> " +
      "taking 1 adds 3, taking 3 adds 2, and the five split inversions are the whole answer " +
      "because each half was already sorted.",
      "Quicksort partitions around a pivot and recurses on both sides; combine is free " +
      "because the work already happened in the partition. A random pivot makes the expected " +
      "cost <code>n log n</code>. Majority-by-D&amp;C: the majority of n votes, if it exists, " +
      "is the majority of at least one half; count the two candidates in a linear pass to " +
      "decide. Boyer-Moore is faster; this version is the proof you can recite.",
    ],
    invariantTitle: "The interview sentence",
    invariant: "<p>After both halves are solved, every pair inside one half is already " +
      "counted. The combine exists only to handle pairs that <em>cross the midpoint</em>, " +
      "and it must do that in linear time. In plain words, the recursive calls finish all " +
      "the local work, and the merge's only job is the pairs that have one foot on each " +
      "side &mdash; leftover left values sitting above a right head &mdash; without scanning " +
      "every pair again.</p>",
    extra: [
      { kind: "math", title: "The recurrence you quote",
        html: "<p><code>T(n) = 2T(n/2) + &Theta;(n) = &Theta;(n log n)</code>. Closest pair " +
          "is the same class: the strip has a constant number of candidate neighbours per " +
          "point (the 7-neighbour argument), so the combine stays linear.</p>" },
      { kind: "warn", title: "mid = lo + (hi - lo) / 2",
        html: "<p>Left half is <code>[lo, mid)</code>, right is <code>[mid, hi)</code>, stop " +
          "when <code>hi - lo &le; 1</code>. Inclusive bounds plus <code>mid</code> in both " +
          "calls is the classic infinite-recursion bug.</p>" },
      { kind: "tip", title: "Boyer-Moore vs D&C majority",
        html: "<p>Boyer-Moore is O(n) / O(1) and is what you ship. The D&C version is the " +
          "proof. Know both; do not confuse them.</p>" },
    ],
  },

  visuals: [
    {
      kind: "array", vizId: "msMerge",
      h3: "Merge step, and the inversion counter",
      intro: "Left run <code>[2, 5, 8]</code>, right run <code>[1, 3, 9]</code>. Taking a " +
        "right head while left still has leftovers is a batch of split inversions.",
      caption: "Three right-takes while left is non-empty add 3, 2 and 0. Those five " +
        "inversions are the split pairs. In-half inversions were already counted below.",
      data: {
        label: "two sorted runs",
        array: [2, 5, 8, 1, 3, 9],
        indexLabels: ["L", "L", "L", "R", "R", "R"],
        vars: ["take", "inv add", "inv total"],
        speed: 950,
        frames: [
          { note: "Both runs sorted. Heads are 2 and 1. 1 is smaller, so take right.",
            active: [0, 3], dim: [1, 2, 4, 5],
            values: { take: "1 from R", "inv add": 3, "inv total": 3 } },
          { note: "Taking 1 while [2,5,8] remain on the left adds 3 inversions.",
            active: [3], x: [], dim: [1, 2, 4, 5],
            values: { take: "1", "inv add": 3, "inv total": 3 } },
          { note: "Now 2 vs 3. Take 2 from the left. Left-takes add zero inversions.",
            active: [0, 4], best: [3], dim: [1, 2, 5],
            values: { take: "2 from L", "inv add": 0, "inv total": 3 } },
          { note: "5 vs 3. Take 3 from the right. Two left leftovers: add 2.",
            active: [1, 4], best: [0, 3], dim: [2, 5],
            values: { take: "3 from R", "inv add": 2, "inv total": 5 } },
          { note: "5 vs 9. Take 5, then 8, then 9. No more right-takes with leftovers.",
            active: [1, 5], best: [0, 3, 4], dim: [2],
            values: { take: "5 from L", "inv add": 0, "inv total": 5 } },
          { note: "Flush 8 then 9. Merged array is [1,2,3,5,8,9]. Split inversions = 5.",
            best: [0, 1, 2, 3, 4, 5],
            values: { take: "flush", "inv add": 0, "inv total": 5 } },
          { note: "Drop the counter and this is ordinary mergesort. Closest-pair's strip walk is the geometric analogue of this linear combine.",
            done: [0, 1, 2, 3, 4, 5],
            values: { take: "done", "inv add": "\u2014", "inv total": 5 } },
        ],
      },
    },
    {
      kind: "mermaid", vizId: "dcTree",
      h3: "The three inversion buckets",
      caption: "Every inversion lives in exactly one bucket. Recursive calls return the " +
        "in-half counts; the merge returns the split count.",
      src: `flowchart TD
  root["count all inversions"] --> leftHalf["in-left inversions"]
  root --> rightHalf["in-right inversions"]
  root --> mergeStep["merge: split inversions only"]
  leftHalf --> L1["recurse"]
  leftHalf --> L2["recurse"]
  rightHalf --> R1["recurse"]
  rightHalf --> R2["recurse"]
  mergeStep --> rule["each right-take adds leftover left length"]`,
    },
  ],

  steps: [
    "<strong>Write the base case:</strong> a run of length 0 or 1 is already sorted and " +
      "contributes 0 inversions, so the recursion has somewhere to stop.",
    "<strong>Split at mid = lo + (hi-lo)/2</strong> with half-open ranges so a two-element " +
      "run cannot recurse forever on itself.",
    "<strong>Recurse on both halves</strong> and keep their returned counts; those are the " +
      "already finished in-left and in-right inversions.",
    "<strong>Combine in linear time.</strong> For inversions: merge and add <code>mid - i</code> " +
      "on every right take, because those leftover left values sit above the right head.",
    "<strong>Copy the buffer back</strong> into <code>a[lo..hi)</code> so the parent merge " +
      "sees two sorted runs on the next level.",
    "<strong>For quicksort:</strong> partition, recurse both sides. Shuffle or pick a random " +
      "pivot so a sorted input cannot become a stick.",
    "<strong>For majority:</strong> recurse both halves, then count the two candidates in one " +
      "linear pass over the current range.",
    "<strong>Quote T(n) = 2T(n/2) + O(n)</strong> and name the combine, because the linear " +
      "merge is what buys the <code>n log n</code> bound.",
  ],

  dryRun: {
    intro: "Inversion count on <code>[2, 5, 8, 1, 3, 9]</code>. Halves are already sorted, " +
      "so they return 0. Only the root merge is expanded.",
    cols: ["take", "left leftover", "add", "emitted", "inv"],
    rows: [
      { cells: ["1 (R)", "2,5,8", "3", "[1]", "3"],
        action: "First right-take.", change: true },
      { cells: ["2 (L)", "5,8", "0", "[1,2]", "3"],
        action: "Left-take, no add." },
      { cells: ["3 (R)", "5,8", "2", "[1,2,3]", "5"],
        action: "Second right-take.", change: true },
      { cells: ["5 (L)", "8", "0", "[1,2,3,5]", "5"],
        action: "Left-take." },
      { cells: ["8 (L)", "none", "0", "[1,2,3,5,8]", "5"],
        action: "Left-take." },
      { cells: ["9 (R)", "none", "0", "[1,2,3,5,8,9]", "5"],
        action: "Right-take with empty left adds 0." },
      { cells: ["done", "\u2014", "\u2014", "sorted", "5"],
        action: "Plus 0 from each half = 5 inversions." },
    ],
  },

  code: [
    { tab: "Brute", panel: "Double loop", file: "InversionsBrute.java",
      intro: "The O(n^2) oracle.",
      code: `public class InversionsBrute {

    static long count(int[] a) {
        long inv = 0;
        for (int i = 0; i < a.length; i++) {
            for (int j = i + 1; j < a.length; j++) {
                if (a[i] > a[j]) {
                    inv++;
                }
            }
        }
        return inv;
    }

    public static void main(String[] args) {
        System.out.println(count(new int[] {2, 5, 8, 1, 3, 9}));
    }
    // Input : [2, 5, 8, 1, 3, 9]
    // Output: 5
}`,
    },
    { tab: "Optimal", panel: "Mergesort + inversions", file: "InversionsMerge.java",
      intro: "Left leftover on a right-take is the split count. Use <code>long</code>: " +
        "n = 1e5 can produce ~5e9 inversions.",
      highlight: "18-21",
      code: `public class InversionsMerge {

    static long sortCount(int[] a) {
        return go(a, new int[a.length], 0, a.length);
    }

    static long go(int[] a, int[] buf, int lo, int hi) {
        if (hi - lo <= 1) {
            return 0;
        }
        int mid = lo + (hi - lo) / 2;
        long inv = go(a, buf, lo, mid) + go(a, buf, mid, hi);
        int i = lo, j = mid, k = lo;
        while (i < mid && j < hi) {
            if (a[j] < a[i]) {
                buf[k++] = a[j++];
                inv += mid - i;
            } else {
                buf[k++] = a[i++];
            }
        }
        while (i < mid) {
            buf[k++] = a[i++];
        }
        while (j < hi) {
            buf[k++] = a[j++];
        }
        System.arraycopy(buf, lo, a, lo, hi - lo);
        return inv;
    }

    public static void main(String[] args) {
        System.out.println(sortCount(new int[] {2, 5, 8, 1, 3, 9}));
    }
    // Input : [2, 5, 8, 1, 3, 9]
    // Output: 5
}`,
    },
    { tab: "Template", panel: "Quicksort + majority", file: "DivideConquerTemplate.java",
      intro: "Two other combines: a no-op after partition, and a linear recount of two " +
        "majority candidates.",
      highlight: "8-12,36-46",
      code: `import java.util.Random;

public class DivideConquerTemplate {

    static final Random RND = new Random(1);

    static void quicksort(int[] a, int lo, int hi) {
        if (hi - lo <= 1) {
            return;
        }
        int p = partition(a, lo, hi);
        quicksort(a, lo, p);
        quicksort(a, p + 1, hi);
    }

    static int partition(int[] a, int lo, int hi) {
        int pivotAt = lo + RND.nextInt(hi - lo);
        swap(a, pivotAt, hi - 1);
        int pivot = a[hi - 1];
        int store = lo;
        for (int i = lo; i < hi - 1; i++) {
            if (a[i] < pivot) {
                swap(a, store++, i);
            }
        }
        swap(a, store, hi - 1);
        return store;
    }

    static void swap(int[] a, int i, int j) {
        int t = a[i];
        a[i] = a[j];
        a[j] = t;
    }

    static int majority(int[] a, int lo, int hi) {
        if (hi - lo == 1) {
            return a[lo];
        }
        int mid = lo + (hi - lo) / 2;
        int left = majority(a, lo, mid);
        int right = majority(a, mid, hi);
        if (left == right) {
            return left;
        }
        return count(a, lo, hi, left) >= count(a, lo, hi, right) ? left : right;
    }

    static int count(int[] a, int lo, int hi, int v) {
        int c = 0;
        for (int i = lo; i < hi; i++) {
            if (a[i] == v) {
                c++;
            }
        }
        return c;
    }

    public static void main(String[] args) {
        int[] a = {2, 5, 8, 1, 3, 9};
        quicksort(a, 0, a.length);
        System.out.println(java.util.Arrays.toString(a));
        System.out.println(majority(new int[] {2, 2, 1, 2, 3}, 0, 5));
    }
    // Input : [2,5,8,1,3,9] and [2,2,1,2,3]
    // Output: [1, 2, 3, 5, 8, 9]
    //         2
}`,
    },
  ],

  complexity: {
    time: "O(n log n)",
    space: "O(n) mergesort / O(log n) quicksort expected",
    derivation: [
      "<p>Mergesort and inversion count share the same recurrence: two half-size subproblems " +
      "plus a linear scan of the current range. There are <code>log n</code> levels and each " +
      "level touches every element once, so the total is <code>n log n</code> &mdash; about " +
      "<code>1.7 &times; 10&#8310;</code> operations at <code>n = 10&#8309;</code>.</p>",
      "<span class=\"eq\">T(n) = 2T(n/2) + &Theta;(n) = &Theta;(n log n)</span>",
      "<p>Quicksort expected: a random pivot produces a uniform split and expected depth " +
      "<code>O(log n)</code>. Worst case: <code>T(n) = T(n-1) + O(n) = O(n&sup2;)</code>, " +
      "which is why you shuffle.</p>",
      "<p>D&amp;C majority is <code>O(n log n)</code>, strictly worse than Boyer-Moore's " +
      "single pass. Quote the linear algorithm unless they asked for the recursive proof.</p>",
    ],
    compare: [
      ["Double loop inversions", "O(n^2)", "O(1)", "Oracle / n <= 4000"],
      ["Mergesort + count", "O(n log n)", "O(n)", "The default"],
      ["Fenwick on ranks", "O(n log n)", "O(n)", "Online / streaming variant"],
      ["Quicksort, random pivot", "O(n log n) expected", "O(log n)", "In-place; worst n^2"],
      ["Boyer-Moore majority", "O(n)", "O(1)", "What you ship"],
      ["D&C majority", "O(n log n)", "O(log n)", "The proof version"],
    ],
  },

  pitfalls: [
    { title: "Inclusive bounds that recurse forever",
      bug: "<code>go(lo, mid)</code> and <code>go(mid, hi)</code> with both ends inclusive " +
        "and <code>mid == lo</code> on a two-element run. The split looks symmetric and the " +
        "function never reaches a length-1 base case.",
      fix: "Use half-open <code>[lo, hi)</code> and stop when <code>hi - lo &le; 1</code>, " +
        "so a two-element run splits into 1+1." },
    { title: "Counting inversions with an int",
      bug: "n = 1e5 reverse-sorted produces ~5e9 inversions. A signed 32-bit counter wraps " +
        "to a negative number that still looks like a plausible count.",
      fix: "<code>long inv</code> from the first line. Same for reverse-pairs, where the " +
        "product of two ints can overflow too." },
    { title: "Adding leftover on a left-take",
      bug: "You add <code>hi - j</code> when taking from the left, which counts " +
        "non-inversions: those right leftovers are larger, so they are in order.",
      fix: "Add leftover-left only when the right head loses the comparison and is emitted " +
        "into the buffer." },
    { title: "Unstable merge",
      bug: "On a tie, taking the right head. The merge still sorts, so the output looks " +
        "correct, and interviews then ask for stability.",
      fix: "<code>if (a[j] &lt; a[i])</code> take right; on equal, take left so original " +
        "order is kept." },
    { title: "Quicksort without shuffling",
      bug: "Pivot = first element on a sorted array. The partition produces a stick, so " +
        "the tree is quadratic and the JVM stack overflows.",
      fix: "Swap a random index into the pivot slot before every partition, or shuffle the " +
        "array once." },
  ],

  variants: [
    ["Reverse pairs (a[i] > 2*a[j])",
      "Two-pointer count before merging. Need longs: 2*a[j] overflows int.",
      "while (j < hi && (long) a[i] > 2L * a[j]) j++; inv += j - mid;",
      "<a href=\"https://leetcode.com/problems/reverse-pairs/\" target=\"_blank\" rel=\"noopener\">LC 493</a>"],
    ["Count of smaller numbers after self",
      "Mergesort on (value, index). When a right value is taken it is smaller than every " +
      "leftover left index.",
      "ans[leftIndex] += rightTakenSoFar;",
      "<a href=\"https://leetcode.com/problems/count-of-smaller-numbers-after-self/\" target=\"_blank\" rel=\"noopener\">LC 315</a>"],
    ["Closest pair of points",
      "Sort by x, recurse, d = min(left, right). Strip of points with |x-midX| less than d, " +
      "already sorted by y; check a constant number of neighbours.",
      "for i: for j=i+1; j<n && yj-yi < d; j++ update d",
      "The 7-neighbour lemma keeps the inner loop O(1) amortised"],
  ],

  followups: [
    ["Why is the closest-pair strip linear, not quadratic?",
      "<p>Points closer than d cannot pack tightly in the strip: each point has only a " +
      "constant number of neighbours that could beat the current best. Walking the y-sorted " +
      "strip and looking a few steps ahead is enough. That constant (classically seven) is " +
      "why the combine stays linear instead of becoming a double loop.</p>"],
    ["Mergesort or Fenwick for inversions?",
      "<p>Same <code>O(n log n)</code> complexity. Mergesort is self-contained and needs no " +
      "rank compression. Fenwick on compressed ranks also does online queries after each " +
      "insert. If the problem is only a one-shot inversion count, write the merge; if later " +
      "queries arrive, switch to a Fenwick tree.</p>"],
    ["Is Java's Arrays.sort a mergesort?",
      "<p>Primitives: Dual-Pivot Quicksort, which is not stable and does not expose a merge " +
      "hook. Objects: TimSort, a stable mergesort cousin. Neither lets you inject an " +
      "inversion counter, so you write the merge yourself when the problem asks for the " +
      "pairs rather than a sorted array.</p>"],
    ["How do I explain majority D&C in thirty seconds?",
      "<p>If a value owns more than half the range, it owns more than half of at least one " +
      "half &mdash; otherwise both halves would be minority and the total could not be a " +
      "majority. The only two candidates are therefore the majorities of the two halves. " +
      "Count both on the current range and pick the winner, or report that neither qualifies.</p>"],
  ],

  problemsIntro: "Implement mergesort once; inversion count is a five-line edit. LC 315 and " +
    "LC 493 are the same edit with a different inequality.",

  problems: [
    { name: "Sort an Array", url: "https://leetcode.com/problems/sort-an-array/",
      badge: "lc", tag: "LC 912", level: "Medium", pattern: "Implement mergesort or heapsort" },
    { name: "Count Inversions", url: "https://www.geeksforgeeks.org/problems/inversion-of-array-1587115620/1",
      badge: "gfg", tag: "GfG", level: "Medium", pattern: "The merge counter, use long" },
    { name: "INVCNT", url: "https://www.spoj.com/problems/INVCNT/",
      badge: "gfg", tag: "SPOJ", level: "Medium", pattern: "Same, large n, many tests" },
    { name: "Count of Smaller Numbers After Self",
      url: "https://leetcode.com/problems/count-of-smaller-numbers-after-self/",
      badge: "lc", tag: "LC 315", level: "Hard", pattern: "Mergesort on (value, index)" },
    { name: "Reverse Pairs", url: "https://leetcode.com/problems/reverse-pairs/",
      badge: "lc", tag: "LC 493", level: "Hard", pattern: "Count a[i] > 2*a[j] during merge" },
    { name: "Majority Element", url: "https://leetcode.com/problems/majority-element/",
      badge: "lc", tag: "LC 169", level: "Easy", pattern: "Boyer-Moore; also write the D&C version" },
    { name: "Maximum Subarray", url: "https://leetcode.com/problems/maximum-subarray/",
      badge: "lc", tag: "LC 53", level: "Medium", pattern: "Crossing-sum D&C, then Kadane" },
    { name: "Beautiful Array", url: "https://leetcode.com/problems/beautiful-array/",
      badge: "lc", tag: "LC 932", level: "Medium", pattern: "Odd/even split construction" },
    { name: "Enemy is Weak", url: "https://codeforces.com/problemset/problem/61/E",
      badge: "cf", tag: "CF 61E", level: "Hard", pattern: "Two-layer inversion / Fenwick" },
    { name: "Pashmak and Parmida's problem", url: "https://codeforces.com/problemset/problem/459/D",
      badge: "cf", tag: "CF 459D", level: "Medium", pattern: "Prefix/suffix frequency pairs" },
  ],

  spoilers: [
    { summary: "Hint for LC 315 &mdash; smaller after self",
      body: "<p>Mergesort pairs <code>(a[i], i)</code> by value. When the merge takes a " +
        "right value, it is smaller than every leftover left element and originally sat to " +
        "its right. Increment those left indices. Same tree as inversions, answers hang off " +
        "the original indices.</p>" },
    { summary: "Hint for CF 61E &mdash; Enemy is Weak",
      body: "<p>A triple i &lt; j &lt; k with a[i] &gt; a[j] &gt; a[k] is a length-3 inversion. " +
        "For each j, multiply (greater to the left) by (smaller to the right). Two Fenwick " +
        "trees on compressed ranks. Use 64-bit answers.</p>" },
  ],

  recap: {
    bullets: [
      "<strong>T(n) = 2T(n/2) + O(n)</strong> once the cross terms are linear.",
      "<strong>Inversions:</strong> add leftover-left on every right-take.",
      "<strong>Use long</strong> for any n^2-style counter.",
      "<strong>Quicksort:</strong> randomise the pivot; worst case is n^2.",
      "<strong>Majority D&C</strong> is the proof; Boyer-Moore is the algorithm.",
    ],
    oneliner: "if (a[j] < a[i]) { buf[k++]=a[j++]; inv += mid-i; } else buf[k++]=a[i++];",
  },
})),

/* ============================================== 5. meet-in-the-middle === */
pack(F({
  id: "meet-in-the-middle",
  difficulty: "Hard",
  readTime: "24 min",
  tagline: "When n is 40, 2^n is dead and n/2 is 20: enumerate both halves, then match in " +
    "the middle with a sort and a binary search.",
  tags: ["meet in the middle", "subset sum", "4-sum", "P2"],
  prereqs: [
    ["Subsets, Permutations, Combinations", "subsets-permutations-combinations.html"],
    ["Binary Search Basics", "../01-arrays-and-windows/binary-search-basics.html"],
  ],

  why: {
    paras: [
      "You are given n = 40 integers and a target, and you must decide whether some subset " +
      "adds to that target. Subset sum on n = 40 is the poster child. " +
      "<code>2<sup>40</sup></code> is a trillion. <code>2<sup>20</sup></code> is a million. " +
      "Split the array, enumerate every subset sum of each half, and ask whether a left sum " +
      "plus a right sum hits the target. The ask is a sort plus a binary search, which is " +
      "how 2<sup>n/2</sup> becomes the running time.",
      "The same split turns 4-sum into two 2-sums: all pairwise sums of the first half of " +
      "the variables versus all pairwise sums of the second. You are given four arrays of " +
      "length 400 and you must decide whether some a+b+c+d hits a target; n^3 is too slow, " +
      "n^2 pairwise maps fit. It also solves closest subsequence sum (LC 1755) and the " +
      "Codeforces problems whose constraint line is n &le; 40.",
      "Meet-in-the-middle is not a clever search. It is the observation that a Cartesian " +
      "product A &times; B can be enumerated from both sides when each factor is about the " +
      "square root of a product you cannot afford. Split, list every left sum, list every " +
      "right sum, then ask whether some pair adds to the target. The listing is a bitmask " +
      "loop you already know; the interview is the join, and forgetting the empty subset " +
      "is the bug that hides a target sitting entirely in one half.",
    ],
    insight: "2<sup>n</sup> = 2<sup>n/2</sup> &times; 2<sup>n/2</sup>. Enumerate each factor, " +
      "then join with a sort and a binary search. The join, not the enumeration, is where " +
      "the bugs live.",
  },

  recognise: {
    yes: [
      "<code>n &le; 40</code> (or 36, 42) and a subset / assignment whose naive cost is 2^n",
      "4-sum over four independent arrays when n^3 is too slow and n^2 is fine",
      "\"Closest subsequence sum to a target\" with n &le; 40",
      "Two independent choices (left path / right path) that combine with XOR or addition",
      "The statement offers n &le; 20 as a special case and n &le; 40 as the full constraint",
    ],
    no: [
      "n &le; 20 &rarr; plain bitmask; MITM is extra code for no gain",
      "n &le; 80 with small sums &rarr; knapsack DP on the value",
      "You need the subset reconstructed and have not planned how to store the witness",
      "The combine is not a group operation and you cannot sort either half",
    ],
    table: [
      ["subset sum, n <= 40", "Split, 2^{n/2} sums each side", "sort one side, lower_bound target-y"],
      ["closest subsequence sum", "Same, keep the closest rather than exact", "LC 1755"],
      ["4-sum of four arrays", "All a[i]+b[j] vs all c[k]+d[l]", "hash map or sort + two pointers"],
      ["XOR path meeting in the middle of a grid", "Walk each half, join on the middle column", "CF 1006F"],
      ["assign each item to 3 groups, n=20", "3^{n/2} per half", "still MITM, larger alphabet"],
      ["count subsets with sum in [L,R]", "sorted left, two binary searches per right sum", "prefix counts"],
      ["n = 20, exact sum", "Do not split", "plain bitmask"],
      ["<strong>Confused with:</strong> divide and conquer",
        "D&C recurses; MITM enumerates both halves fully and joins once",
        "No recurrence, just 2 * 2^{n/2} plus a join"],
    ],
    constraint: "n &le; 40 with a subset-sum flavour is the tell. 2<sup>20</sup> &asymp; 1e6, " +
      "times a log, fits in a second. 2<sup>25</sup> is the edge; 2<sup>30</sup> is a memory " +
      "problem (an <code>int[]</code> of length 2<sup>30</sup> is 4&nbsp;GB).",
  },

  core: {
    heading: "Core idea: enumerate halves, then join",
    paras: [
      "Split <code>a[0..n)</code> into <code>L = a[0..n/2)</code> and " +
      "<code>R = a[n/2..n)</code>. Enumerate every subset sum of L with a bitmask loop, " +
      "same for R, including mask 0 so the empty half is present. Sort the left sums. For " +
      "each right sum <code>y</code>, binary-search <code>target - y</code> (exact) or the " +
      "closest values (closest-sum). On <code>[2, 4, 5 | 1, 3, 7]</code> targeting 10, the " +
      "right sum 10 pairs with left 0 and that is a real subset.",
      "4-sum over four arrays is the same picture with pairwise sums in place of subset " +
      "sums: build every <code>a[i]+b[j]</code>, then probe with <code>target-(c[k]+d[l])</code>. " +
      "4-sum over one array of n numbers is n^3 after a sort; MITM is the right tool when " +
      "you have four <em>independent</em> arrays of size n &asymp; 400, where n^2 is a " +
      "160 000-entry map and n^3 would be tens of millions.",
      "Memory is the silent constraint. Two arrays of 2<sup>20</sup> ints are 8&nbsp;MB and " +
      "fit comfortably; two arrays of boxed <code>Long</code> keys in a " +
      "<code>HashMap</code> do not, because each entry carries object headers. Store " +
      "witnesses (the mask next to the sum) only when the problem asks for the subset, and " +
      "otherwise keep a sorted <code>long[]</code>. At n = 40 that array is a million " +
      "entries, not a memory problem and not a reason to reach for a map.",
    ],
    invariantTitle: "The interview sentence",
    invariant: "<p>Every subset of the whole array is a subset of the left half plus a " +
      "subset of the right half, including the two empty ones. Enumerate both families and " +
      "join a pair of sums in log time, and you have enumerated 2^n subsets in " +
      "2^{n/2} log time.</p>",
    extra: [
      { kind: "tip", title: "Two pointers for a range join",
        html: "<p>Sorted left sums, walk right sums, maintain a window of left values in " +
          "<code>[L - y, R - y]</code>. Total join is linear after the sort. Use this when " +
          "you count subsets with sum in a range.</p>" },
      { kind: "warn", title: "Empty subsets are real",
        html: "<p>Mask 0 is sum 0 on each half. Forgetting it drops \"the target lives " +
          "entirely in one half\" and the empty-empty case for target 0. Start the bitmask " +
          "loop at 0, not 1.</p>" },
      { kind: "math", title: "Why not three-way split?",
        html: "<p>A 3-way split is 3 &times; 2^{n/3} plus a harder join. Two-way is the " +
          "default; three-way shows up when 2^{n/2} does not fit and the join can be hashed.</p>" },
    ],
  },

  visuals: [
    {
      kind: "array", vizId: "mitmJoin",
      h3: "Subset sum n = 6, target 10, split 3 + 3",
      intro: "<code>a = [2, 4, 5, 1, 3, 7]</code>. Left sums of <code>[2,4,5]</code>, right " +
        "sums of <code>[1,3,7]</code>. Each right value asks for <code>10 - y</code> in the " +
        "sorted left array.",
      caption: "Eight left sums, eight right sums. After sorting the left, each right value " +
        "is one binary search. Hits include empty-left + {3,7}, which is why 0 stays in the array.",
      data: {
        label: "left subset sums, sorted",
        array: [0, 2, 4, 5, 6, 7, 9, 11],
        vars: ["y right", "need", "found"],
        speed: 950,
        frames: [
          { note: "Left sums of {2,4,5} already sorted. Right starts at y = 0 (empty). Need 10: miss.",
            dim: [0, 1, 2, 3, 4, 5, 6, 7],
            values: { "y right": 0, need: 10, found: "no" } },
          { note: "y = 1 (right {1}), need 9. 9 is in the left array (4+5).",
            active: [6], values: { "y right": 1, need: 9, found: "yes {4,5,1}" } },
          { note: "Hit. Existence could return true here. We continue to see the join.",
            best: [6], values: { "y right": 1, need: 9, found: "yes" } },
          { note: "y = 3, need 7. 7 is in left (2+5).",
            active: [5], values: { "y right": 3, need: 7, found: "yes {2,5,3}" } },
          { note: "y = 7, need 3. 3 is not a left sum. Miss.",
            x: [0, 1, 2, 3, 4, 5, 6, 7],
            values: { "y right": 7, need: 3, found: "no" } },
          { note: "y = 11 (all of the right), need -1. Impossible.",
            dim: [0, 1, 2, 3, 4, 5, 6, 7],
            values: { "y right": 11, need: -1, found: "no" } },
          { note: "y = 10 ({3,7}), need 0. 0 is the empty left subset. This is why mask 0 must stay.",
            best: [0], values: { "y right": 10, need: 0, found: "yes {3,7}" } },
          { note: "Existence is true. A count would tally every (x,y) with x+y=10. Closest-sum would track min |x+y-target| instead.",
            done: [0, 1, 2, 3, 4, 5, 6, 7],
            values: { "y right": "all 8", need: "\u2014", found: "several hits" } },
        ],
      },
    },
    {
      kind: "mermaid", vizId: "mitmFlow",
      h3: "The split-enumerate-join pipeline",
      caption: "Two bitmask loops, one sort, then a join. Nothing here is recursive. That " +
        "is the difference from divide and conquer.",
      src: `flowchart TD
  splitA["split a into L and R of size n/2"] --> enumL["bitmask all subset sums of L"]
  splitA --> enumR["bitmask all subset sums of R"]
  enumL --> sortL["sort left sums"]
  enumR --> joinQ{"what is asked?"}
  sortL --> joinQ
  joinQ -- "exists target" --> bsearch["for each y, binary search target-y"]
  joinQ -- "closest" --> close["for each y, find closest to target-y"]
  joinQ -- "count in a range" --> twoPtr["two pointers or two lower_bounds per y"]
  joinQ -- "4-sum of four arrays" --> pairs["same join, but the sums are pairwise"]`,
    },
  ],

  steps: [
    "<strong>Confirm n is in the 30&ndash;42 window</strong> and naive 2^n is impossible, " +
      "because 2^40 is a trillion loop iterations.",
    "<strong>Split</strong> at <code>n/2</code>. Uneven 20+21 is fine: one extra bit is " +
      "still only about a million masks.",
    "<strong>Enumerate both halves</strong> with a bitmask loop. Include mask 0 so a " +
      "target that lives in one half is not lost. Use <code>long</code> for sums.",
    "<strong>Sort one side</strong>, usually the left sums, so each right value is one " +
      "binary search instead of a linear scan.",
    "<strong>Join.</strong> For each right sum y, search <code>target - y</code> in the " +
      "sorted left array and treat a non-negative index as a hit.",
    "<strong>Keep the empty-empty case.</strong> Target 0 is true because both empty " +
      "subsets sum to zero when taken together.",
    "<strong>If you need the subset</strong>, store the mask next to the sum, or re-enumerate " +
      "the winning half.",
    "<strong>Mind memory:</strong> 2^{n/2} longs plus a sort. Boxed HashMap keys are optional " +
      "only at n &le; 36, where 2^18 entries still fit.",
  ],

  dryRun: {
    intro: "Existence of subset sum 10 on <code>[2, 4, 5, 1, 3, 7]</code>. Each row is one " +
      "right-hand mask against sorted left sums <code>[0, 2, 4, 5, 6, 7, 9, 11]</code>.",
    cols: ["right mask", "y", "need 10-y", "in left?", "subset"],
    rows: [
      { cells: ["000", "0", "10", "no", "\u2014"],
        action: "Empty right." },
      { cells: ["001", "1", "9", "yes", "{4,5} + {1}"],
        action: "First hit.", change: true },
      { cells: ["010", "3", "7", "yes", "{2,5} + {3}"],
        action: "Second hit." },
      { cells: ["100", "7", "3", "no", "\u2014"],
        action: "3 is not a left sum." },
      { cells: ["011", "4", "6", "yes", "{2,4} + {1,3}"],
        action: "6 = 2+4." },
      { cells: ["101", "8", "2", "yes", "{2} + {1,7}"],
        action: "Hit." },
      { cells: ["110", "10", "0", "yes", "{} + {3,7}"],
        action: "Empty left. This is why 0 stays in the array.", change: true },
      { cells: ["111", "11", "-1", "no", "\u2014"],
        action: "Need negative; skip." },
    ],
    after: "<p>Four distinct subsets hit 10. Existence would have returned true on the " +
      "second row.</p>",
  },

  code: [
    { tab: "Brute", panel: "Full 2^n", file: "MitmBrute.java",
      intro: "The oracle. Correct, and the reason n = 40 is impossible.",
      code: `public class MitmBrute {

    static boolean subsetSum(int[] a, long target) {
        int n = a.length;
        for (int m = 0; m < (1 << n); m++) {
            long s = 0;
            for (int i = 0; i < n; i++) {
                if ((m & (1 << i)) != 0) {
                    s += a[i];
                }
            }
            if (s == target) {
                return true;
            }
        }
        return false;
    }

    public static void main(String[] args) {
        System.out.println(subsetSum(new int[] {2, 4, 5, 1, 3, 7}, 10));
    }
    // Input : [2, 4, 5, 1, 3, 7], target 10
    // Output: true
}`,
    },
    { tab: "Optimal", panel: "Meet in the middle", file: "MitmOptimal.java",
      intro: "Enumerate halves, sort the left, binary-search each complement. " +
        "<code>Arrays.binarySearch</code> returns a non-negative index on a hit.",
      highlight: "22-28",
      code: `import java.util.Arrays;

public class MitmOptimal {

    static boolean subsetSum(int[] a, long target) {
        int n = a.length;
        int mid = n / 2;
        long[] left = enumSums(a, 0, mid);
        long[] right = enumSums(a, mid, n);
        Arrays.sort(left);
        for (long y : right) {
            if (Arrays.binarySearch(left, target - y) >= 0) {
                return true;
            }
        }
        return false;
    }

    static long[] enumSums(int[] a, int from, int to) {
        int m = to - from;
        long[] sums = new long[1 << m];
        for (int mask = 0; mask < (1 << m); mask++) {
            long s = 0;
            for (int i = 0; i < m; i++) {
                if ((mask & (1 << i)) != 0) {
                    s += a[from + i];
                }
            }
            sums[mask] = s;
        }
        return sums;
    }

    public static void main(String[] args) {
        System.out.println(subsetSum(new int[] {2, 4, 5, 1, 3, 7}, 10));
        System.out.println(subsetSum(new int[] {2, 4, 5, 1, 3, 7}, 8));
    }
    // Input : [2,4,5,1,3,7] targets 10 and 8
    // Output: true
    //         true
}`,
    },
    { tab: "Template", panel: "Closest + 4-sum halves", file: "MitmTemplate.java",
      intro: "Closest subsequence sum, and 4-sum over four arrays via pairwise halves.",
      highlight: "14-24,40-52",
      code: `import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

public class MitmTemplate {

    static int closestSum(int[] a, int target) {
        int n = a.length, mid = n / 2;
        long[] left = enumSums(a, 0, mid);
        long[] right = enumSums(a, mid, n);
        Arrays.sort(left);
        long best = Long.MAX_VALUE / 4;
        int ans = 0;
        for (long y : right) {
            int i = lowerBound(left, target - y);
            for (int k = i - 1; k <= i; k++) {
                if (k < 0 || k >= left.length) {
                    continue;
                }
                long s = left[k] + y;
                long d = Math.abs(s - target);
                if (d < best) {
                    best = d;
                    ans = (int) s;
                }
            }
        }
        return ans;
    }

    static int lowerBound(long[] a, long x) {
        int lo = 0, hi = a.length;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] < x) {
                lo = mid + 1;
            } else {
                hi = mid;
            }
        }
        return lo;
    }

    static long[] enumSums(int[] a, int from, int to) {
        int m = to - from;
        long[] sums = new long[1 << m];
        for (int mask = 0; mask < (1 << m); mask++) {
            long s = 0;
            for (int i = 0; i < m; i++) {
                if ((mask & (1 << i)) != 0) {
                    s += a[from + i];
                }
            }
            sums[mask] = s;
        }
        return sums;
    }

    /** Four independent arrays: exists a+b+c+d == target? */
    static boolean fourSumHalves(int[] A, int[] B, int[] C, int[] D, int target) {
        Map<Integer, Integer> left = new HashMap<>();
        for (int a : A) {
            for (int b : B) {
                left.merge(a + b, 1, Integer::sum);
            }
        }
        for (int c : C) {
            for (int d : D) {
                if (left.containsKey(target - c - d)) {
                    return true;
                }
            }
        }
        return false;
    }

    public static void main(String[] args) {
        System.out.println(closestSum(new int[] {2, 4, 5, 1, 3, 7}, 10));
        System.out.println(fourSumHalves(
                new int[] {1, 2}, new int[] {-2, -1},
                new int[] {-1, 2}, new int[] {0, 2}, 0));
    }
    // Input : closest to 10; four arrays target 0
    // Output: 10
    //         true
}`,
    },
  ],

  complexity: {
    time: "O(2^{n/2} * n)",
    space: "O(2^{n/2})",
    derivation: [
      "<p>Each half has size n/2, so each bitmask loop is " +
      "<code>O(2^{n/2} &middot; n/2)</code> if you walk bits, or " +
      "<code>O(2^{n/2})</code> if you use SOS / Gray-code incremental adds. At n = 40 that " +
      "is about a million masks per side, not a trillion.</p>",
      "<span class=\"eq\">sort 2^{n/2} sums + 2^{n/2} binary searches = O(2^{n/2} n)</span>",
      "<p>4-sum over four arrays of length m is <code>O(m&sup2;)</code> time and memory " +
      "for the map of pairwise sums. That is why m &le; 400 is the usual constraint: " +
      "160 000 map entries fit, while a four-nested loop does not.</p>",
    ],
    compare: [
      ["Full 2^n bitmask", "O(n 2^n)", "O(1)", "n <= 22"],
      ["MITM + sort + binary search", "O(n 2^{n/2})", "O(2^{n/2})", "n <= 42"],
      ["MITM + two pointers", "O(n 2^{n/2})", "O(2^{n/2})", "range counts"],
      ["Knapsack DP", "O(n * sum)", "O(sum)", "When sums are small"],
      ["4-sum, one array, 3 pointers", "O(n^3)", "O(1)", "Classic LC 18"],
      ["4-sum, four arrays, MITM", "O(m^2)", "O(m^2)", "LC 454"],
    ],
  },

  pitfalls: [
    { title: "Forgetting mask 0",
      bug: "Looping <code>mask = 1 .. 2^m-1</code>, so sum 0 is missing. Target that lives " +
        "in one half, or target 0, is reported absent.",
      fix: "Start the bitmask loop at 0. The empty subset is a legitimate half and sum 0 " +
        "must stay in the array." },
    { title: "int sums on large values",
      bug: "n = 40, a[i] = 1e9, a subset sum is 4e10. Signed 32-bit wrap. Wrong misses " +
        "that look like ordinary absent targets.",
      fix: "<code>long[]</code> sums and a <code>long</code> target from the first line, " +
        "before any addition can wrap." },
    { title: "binarySearch confusion",
      bug: "Treating a negative <code>Arrays.binarySearch</code> return as a valid index, " +
        "or using it as \"closest\" without decoding the insertion point. A miss still " +
        "returns a number, so the code compiles and looks like a hit.",
      fix: "Existence: <code>&gt;= 0</code> is a hit. Closest: write your own lower_bound " +
        "and inspect both neighbours." },
    { title: "HashMap of 2^{20} boxed Longs",
      bug: "A <code>HashMap&lt;Long, Integer&gt;</code> of 2^{20} keys makes memory and GC " +
        "explode, even though the algorithm is otherwise right. A <code>long[]</code> plus " +
        "a sort is smaller and faster.",
      fix: "Prefer sorted primitive arrays. Hash only the pairwise 4-sum side, where m^2 " +
        "is about 1e5 entries." },
    { title: "Splitting 4-sum on one array the MITM way without handling index reuse",
      bug: "Pairwise sums from the same array can pick the same index twice, so a hit " +
        "looks valid even though one element was spent on both halves.",
      fix: "Either use four independent arrays (LC 454), or generate pairs as (i, j) with " +
        "i &lt; j and reject overlapping index pairs at join time." },
  ],

  variants: [
    ["Closest subsequence sum",
      "Same split. For each y, look at the left values around target-y and keep the closest.",
      "inspect left[lb] and left[lb-1]; track min |x+y-target|",
      "<a href=\"https://leetcode.com/problems/closest-subsequence-sum/\" target=\"_blank\" rel=\"noopener\">LC 1755</a>"],
    ["4-sum over four arrays",
      "Pairwise sums instead of subset sums. HashMap on A+B, probe with target-(C+D).",
      "left.merge(a+b, 1, Integer::sum);",
      "<a href=\"https://leetcode.com/problems/4sum-ii/\" target=\"_blank\" rel=\"noopener\">LC 454</a>"],
    ["XOR / path MITM",
      "Walk from both ends of a path or both sides of a grid, meet on the middle vertex " +
      "or column, join on XOR or remaining length.",
      "map[xorAtMid]++ from the left; probe from the right",
      "CF 1006F Xor-Paths"],
  ],

  followups: [
    ["Why not just knapsack DP?",
      "<p>If the sums are bounded by S and nS fits in time and memory, knapsack DP is " +
      "simpler and often faster. MITM wins when S is 40 * 1e9 and n is 40: the value " +
      "dimension is unusable (a 4e10-long array), while the index dimension splits cleanly " +
      "into two halves of twenty.</p>"],
    ["Can I recover the subset?",
      "<p>Store (sum, mask) pairs. On a hit, the two masks translate back to indices in " +
      "each half. Or, once you know the two sums, re-enumerate the half (2^{20}) to find " +
      "a mask that produces them. The second uses no extra memory and is the version you " +
      "write when the judge only asked for existence first.</p>"],
    ["What is the 4-sum-over-halves trick on one array?",
      "<p>Generate all pair sums with i &lt; j from the left n/2 indices, all pair sums " +
      "from the right n/2 indices, and join. Pairs that need two left and two right " +
      "indices are covered; pairs that sit entirely in one half must be counted inside " +
      "that half. It is messier than four arrays, which is why LC 18 stays n^3.</p>"],
    ["Gray codes and incremental sums?",
      "<p>Walking masks in Gray-code order adds or removes one element per step, so each " +
      "half is O(2^{n/2}) additions instead of O(n 2^{n/2}) bit walks. That factor of n/2 " +
      "matters at n = 42, where you are already near the time limit; it is unnecessary at " +
      "n = 36, where a plain bitmask loop already finishes.</p>"],
  ],

  problemsIntro: "CSES Meet in the Middle and CF 888E are the two problems that teach the " +
    "pattern. LC 1755 is the closest-sum variant; LC 454 is the 4-sum-over-halves variant.",

  problems: [
    { name: "Meet in the Middle", url: "https://cses.fi/problemset/task/1628",
      badge: "cf", tag: "CSES", level: "Medium", pattern: "Count subsets with sum x, n <= 40" },
    { name: "Maximum Subsequence", url: "https://codeforces.com/problemset/problem/888/E",
      badge: "cf", tag: "CF 888E", level: "Medium", pattern: "Max subset sum modulo m, n <= 35" },
    { name: "Xor-Paths", url: "https://codeforces.com/problemset/problem/1006/F",
      badge: "cf", tag: "CF 1006F", level: "Medium", pattern: "Walk both halves of a grid, join XOR" },
    { name: "Closest Subsequence Sum", url: "https://leetcode.com/problems/closest-subsequence-sum/",
      badge: "lc", tag: "LC 1755", level: "Hard", pattern: "MITM + closest, not exact" },
    { name: "4Sum II", url: "https://leetcode.com/problems/4sum-ii/",
      badge: "lc", tag: "LC 454", level: "Medium", pattern: "Pairwise halves + HashMap" },
    { name: "4Sum", url: "https://leetcode.com/problems/4sum/",
      badge: "lc", tag: "LC 18", level: "Medium", pattern: "n^3 two-pointers; contrast with MITM" },
    { name: "Partition Array Into Two Arrays to Minimize Sum Difference",
      url: "https://leetcode.com/problems/partition-array-into-two-arrays-to-minimize-sum-difference/",
      badge: "lc", tag: "LC 2035", level: "Hard", pattern: "MITM by size of the left pick" },
    { name: "Apple Division", url: "https://cses.fi/problemset/task/1623",
      badge: "cf", tag: "CSES", level: "Easy", pattern: "n <= 20, so plain 2^n; the warmup" },
    { name: "Lizard Era: Beginning", url: "https://codeforces.com/problemset/problem/585/D",
      badge: "cf", tag: "CF 585D", level: "Hard", pattern: "3^{n/2} MITM on three stats" },
    { name: "Switches", url: "https://atcoder.jp/contests/abc128/tasks/abc128_c",
      badge: "atc", tag: "ABC 128C", level: "Easy", pattern: "n <= 10, bitmask; contrast with n=40" },
    { name: "Programming Contest", url: "https://atcoder.jp/contests/abc184/tasks/abc184_f",
      badge: "atc", tag: "ABC 184F", level: "Medium", pattern: "Classic MITM subset sum with a cap T" },
    { name: "Subset Sums", url: "https://www.geeksforgeeks.org/problems/subset-sums2234/1",
      badge: "gfg", tag: "GfG", level: "Easy", pattern: "List all subset sums, n <= 15" },
  ],

  spoilers: [
    { summary: "Hint for CF 888E &mdash; Maximum Subsequence",
      body: "<p>Maximise a subset sum modulo m, n &le; 35. Enumerate left and right sums " +
        "already reduced modulo m, sort the left. For each right value y, the best left x " +
        "is the largest x &le; m-1-y (so x+y &lt; m), or the largest x at all (wrap). Two " +
        "binary searches per y, plus the two empty-half candidates.</p>" },
    { summary: "Hint for LC 2035 &mdash; minimise partition difference",
      body: "<p>You must pick exactly n/2 elements into one side. Split the array in half; " +
        "for each half enumerate sums <em>grouped by how many items you picked</em>. Join a " +
        "left pick of k with a right pick of n/2-k. Closest total to sum/2 wins. This is " +
        "MITM with an extra size coordinate.</p>" },
  ],

  recap: {
    bullets: [
      "<strong>n &le; 40 subset-sum &rarr; split, enumerate, join.</strong>",
      "<strong>Include mask 0</strong> on both halves.",
      "<strong>Sums are long.</strong> Sort one side; binary-search the complement.",
      "<strong>4-sum over four arrays</strong> is pairwise sums, same join.",
      "<strong>This is not divide and conquer.</strong> No recurrence, one join.",
    ],
    oneliner: "for (long y : right) if (Arrays.binarySearch(left, target-y) >= 0) return true;",
  },
})),

];

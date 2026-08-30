/* Module 10 — Dynamic Programming */
import { pack } from "./pack.mjs";

export const topics = [

pack({
  id: "dp-foundations",
  difficulty: "Easy",
  readTime: "24 min",
  tagline: "DP is not a list of named tricks &mdash; it is a pipeline: name the state, write the transition, fix the base, pick an order (or memoize), then shave the space.",
  tags: [ "DP", "state", "memoization", "P0" ],
  prereqs: [
    [ "Recurrences", "../00-foundations/recurrences-and-master-theorem.html" ],
    [ "Constraints → Complexity", "../00-foundations/constraints-to-complexity.html" ],
  ],
  why: [
    "Most interview DP failures are not arithmetic. They are a missing definition of <em>what a state means</em>, a transition that does not cover every way to form that state, or a loop that reads a cell before it has been written. The named problems (knapsack, LIS, LCS, digit DP) are the same pipeline with different state shapes.",
    "The reason the pipeline is worth drilling is that it is mechanical. Once you can write \"dp[i] = number of ways to climb i stairs\" and \"dp[i] = dp[i-1] + dp[i-2]\" without blinking, every later page on this module is a change of coordinates, not a new subject.",
    "Climbing stairs / Fibonacci is the smallest complete example: overlapping subproblems, an optimal-substructure recurrence, a base case, a linear order, and a rolling-array space optimisation. We run that example to the ground so the later families can assume the vocabulary.",
  ],
  insight: "A DP state is a question with a numeric answer. The transition is how that answer is assembled from strictly smaller questions. If you cannot say those two sentences out loud, you are not ready to code.",
  yes: [
    "\"Number of ways\" / \"minimum cost\" / \"can you reach\" on a structure with overlapping subproblems",
    "A recurrence that would be exponential if you recurse without storing answers",
    "The statement smells like recursion plus \"do not recompute\"",
    "n is 40..1e4 and a 1D or 2D table of that size fits",
    "You can name a suffix/prefix/subarray/subset whose answer depends only on smaller ones",
  ],
  no: [
    "Subproblems do not overlap (pure divide-and-conquer) &rarr; no table, just the recurrence",
    "A greedy choice is provably safe &rarr; do not force DP",
    "The graph of states has cycles with no decreasing rank &rarr; not a DAG of states; rethink",
    "n = 1e5 and your first state is O(n&sup2;) &rarr; the state is wrong, not the idea of DP",
  ],
  table: [
    [ "\"number of ways to do X\"", "Counting DP, usually += ", "1D/2D ways[]" ],
    [ "\"minimum cost to achieve X\"", "Min DP", "dp[state] = min over choices" ],
    [ "\"is it possible\"", "Boolean DP, or = or" ],
    [ "Recursion with repeated calls", "Overlapping subproblems", "Memo first, then tabulate" ],
    [ "n ≤ 20 plus subsets", "State is a mask", "<a href=\"bitmask-dp.html\">Bitmask DP</a>" ],
    [
      "n ≤ 1e5, O(n) or O(n log n) needed",
      "1D + data structure, not n²",
      "<a href=\"dp-1d.html\">1-D DP</a> / LIS",
    ],
    [
      "<strong>Confused with:</strong> greedy",
      "Greedy needs an exchange proof; DP needs a state proof",
      "If you cannot prove greedy, write the DP",
    ],
  ],
  constraint: "A table of size S and a transition of cost T must have S &middot; T under about 10&#8312;. That single inequality is how you reject an over-large state before you write it. Answers that sum ways usually need <code>long</code> and a modulus.",
  coreHeading: "The five-line pipeline",
  core: [
    "<strong>State.</strong> Write a sentence: <code>dp[i]</code> = number of ways to climb <code>i</code> stairs taking steps of 1 or 2. Until that sentence is unambiguous, do not open an editor.",
    "<strong>Transition and base.</strong> The last step was 1 or 2, so <code>dp[i] = dp[i-1] + dp[i-2]</code>. Bases: <code>dp[0] = 1</code> (one way to stand still) and <code>dp[1] = 1</code>. Every index the transition reads must be defined. <strong>Order or memo, then space.</strong> Recurse + hashmap of seen states, or fill <code>i = 2 .. n</code> left to right. Only the last two cells are live, so a pair of integers replaces the array. That is the whole subject, at this scale.",
  ],
  invariant: "<p>DP = DAG of questions. An edge <code>A &larr; B</code> means \"A's answer uses B's answer\". A valid order is any topological order of that DAG. Memoized recursion discovers the order for you; tabulation requires you to write it.</p><span class=\"eq\">dp[i] = ways to climb i = dp[i-1] + dp[i-2]</span>",
  extra: [
    {
      kind: "key",
      title: "Overlapping + optimal substructure",
      html: "<p>Overlapping: the same (i) is asked from many parents. Optimal substructure: a best/count answer for i is assembled from best/count answers for smaller i, not from some hidden extra that the state forgot. If the \"how we got here\" still matters, the state is incomplete (add a parameter).</p>",
    },
    {
      kind: "tip",
      title: "Memo first in an interview",
      html: "<p>Write the recursive function that computes the state, add a cache keyed by the arguments, then &mdash; if time remains &mdash; invert it into loops. Interviewers score the recurrence. The loops are polish.</p>",
    },
  ],
  grid: {
    corner: "i",
    rowHeads: [ "dp" ],
    colHeads: [ "0", "1", "2", "3", "4", "5", "6" ],
  },
  vars: [ "i", "from", "dp[i]" ],
  frames: [
    {
      note: "Base: dp[0] = 1 (empty climb) and dp[1] = 1 (a single step of 1).",
      cells: [
        {
          r: 0,
          c: 0,
          val: "1",
          cls: "answer",
        },
        {
          r: 0,
          c: 1,
          val: "1",
          cls: "answer",
        },
      ],
      values: {
        i: "base",
        from: "—",
        "dp[i]": "1, 1",
      },
    },
    {
      note: "i = 2. Read dp[1] and dp[0], write 1+1 = 2.",
      cells: [
        {
          r: 0,
          c: 2,
          val: "2",
          cls: "target",
        },
        {
          r: 0,
          c: 1,
          val: "1",
          cls: "from",
        },
        {
          r: 0,
          c: 0,
          val: "1",
          cls: "from",
        },
      ],
      values: {
        i: 2,
        from: "1+0",
        "dp[i]": 2,
      },
    },
    {
      note: "i = 3. from dp[2] and dp[1]: 2+1 = 3.",
      cells: [
        {
          r: 0,
          c: 3,
          val: "3",
          cls: "target",
        },
        {
          r: 0,
          c: 2,
          val: "2",
          cls: "from",
        },
        {
          r: 0,
          c: 1,
          val: "1",
          cls: "from",
        },
      ],
      values: {
        i: 3,
        from: "2+1",
        "dp[i]": 3,
      },
    },
    {
      note: "i = 4. 3+2 = 5.",
      cells: [
        {
          r: 0,
          c: 4,
          val: "5",
          cls: "target",
        },
        {
          r: 0,
          c: 3,
          val: "3",
          cls: "from",
        },
        {
          r: 0,
          c: 2,
          val: "2",
          cls: "from",
        },
      ],
      values: {
        i: 4,
        from: "3+2",
        "dp[i]": 5,
      },
    },
    {
      note: "i = 5. 5+3 = 8.",
      cells: [
        {
          r: 0,
          c: 5,
          val: "8",
          cls: "target",
        },
        {
          r: 0,
          c: 4,
          val: "5",
          cls: "from",
        },
        {
          r: 0,
          c: 3,
          val: "3",
          cls: "from",
        },
      ],
      values: {
        i: 5,
        from: "4+3",
        "dp[i]": 8,
      },
    },
    {
      note: "i = 6. 8+5 = 13. This is the answer for n = 6.",
      cells: [
        {
          r: 0,
          c: 6,
          val: "13",
          cls: "target",
        },
        {
          r: 0,
          c: 5,
          val: "8",
          cls: "from",
        },
        {
          r: 0,
          c: 4,
          val: "5",
          cls: "from",
        },
      ],
      values: {
        i: 6,
        from: "5+4",
        "dp[i]": 13,
      },
    },
    {
      note: "Only the last two cells were live at each step. Space-opt keeps prev2=8, prev1=13 and drops the array.",
      cells: [
        {
          r: 0,
          c: 5,
          val: "8",
          cls: "from",
        },
        {
          r: 0,
          c: 6,
          val: "13",
          cls: "answer",
        },
      ],
      values: {
        i: "roll",
        from: "two ints",
        "dp[i]": 13,
      },
    },
  ],
  vizTitle: "Filling dp[0..6] for climbing 6 stairs",
  vizIntro: "One row. The target cell is the one being written; the from cells are the two it adds. Step through it once and the later families will feel like the same movie in more than one dimension.",
  vizCaption: "dp[i] = dp[i-1] + dp[i-2]. Green is the cell we write; blue is the pair we read. After i = 6 the answer is 13.",
  mermaid: "flowchart TD\n  q([\"what is the question?\"]) --> state[\"name dp of args = one number\"]\n  state --> trans[\"write the transition from smaller states\"]\n  trans --> base[\"fix the bases so every read is defined\"]\n  base --> dag{\"is the state graph a DAG?\"}\n  dag -- no --> more[\"add a parameter or change the state\"]\n  more --> state\n  dag -- yes --> how{\"memo or loops?\"}\n  how -- memo --> rec[\"recurse + cache keyed by args\"]\n  how -- loops --> ord[\"pick a topo order and fill\"]\n  rec --> space{\"only a window of states live?\"}\n  ord --> space\n  space -- yes --> roll[\"roll the array\"]\n  space -- no --> doneNode[\"done\"]\n  roll --> doneNode",
  merTitle: "The pipeline you run on every later page",
  merCaption: "If a box fails, do not skip it. A wrong state cannot be saved by clever loops.",
  steps: [
    "<strong>Write the state sentence</strong> with every argument named.",
    "<strong>Write the transition</strong> as a formula that only reads strictly smaller states.",
    "<strong>Write the bases</strong> and check the first recursive index against them.",
    "<strong>Estimate S &times; T</strong> against the constraint. If it dies, shrink the state.",
    "<strong>Implement memoized recursion</strong> first, on the dry-run sample.",
    "<strong>Invert into a loop</strong> in a legal order (here, increasing i).",
    "<strong>Roll the array</strong> if only a constant window is live.",
    "<strong>Reconstruct</strong> if asked: store the argmax / parent of each transition.",
  ],
  dryIntro: "Climb n = 6, steps 1 or 2. Each row writes one new cell.",
  dryCols: [ "i", "dp[i-2]", "dp[i-1]", "dp[i]", "meaning" ],
  dryRows: [
    {
      cells: [ "0", "—", "—", "1", "empty" ],
      action: "Base.",
    },
    {
      cells: [ "1", "—", "1", "1", "one single step" ],
      action: "Base.",
    },
    {
      cells: [ "2", "1", "1", "2", "1+1 or 2" ],
      action: "First transition.",
      change: true,
    },
    {
      cells: [ "3", "1", "2", "3", "three sequences" ],
      action: "",
    },
    {
      cells: [ "4", "2", "3", "5", "Fibonacci" ],
      action: "",
    },
    {
      cells: [ "5", "3", "5", "8", "" ],
      action: "",
    },
    {
      cells: [ "6", "5", "8", "13", "answer" ],
      action: "Return 13.",
      change: true,
    },
  ],
  code: [
    {
      tab: "Recursion",
      file: "ClimbRec.java",
      code: "public class ClimbRec {\n\n    static int ways(int n) {\n        if (n < 0) {\n            return 0;\n        }\n        if (n == 0) {\n            return 1;\n        }\n        return ways(n - 1) + ways(n - 2);\n    }\n\n    public static void main(String[] args) {\n        System.out.println(ways(6));\n    }\n    // Input : n = 6\n    // Output: 13\n}",
    },
    {
      tab: "Memo",
      file: "ClimbMemo.java",
      code: "import java.util.Arrays;\n\npublic class ClimbMemo {\n\n    static int ways(int n, int[] memo) {\n        if (n < 0) {\n            return 0;\n        }\n        if (n == 0) {\n            return 1;\n        }\n        if (memo[n] != -1) {\n            return memo[n];\n        }\n        return memo[n] = ways(n - 1, memo) + ways(n - 2, memo);\n    }\n\n    public static void main(String[] args) {\n        int n = 6;\n        int[] memo = new int[n + 1];\n        Arrays.fill(memo, -1);\n        System.out.println(ways(n, memo));\n    }\n    // Input : n = 6\n    // Output: 13\n}",
    },
    {
      tab: "Tabulated",
      file: "ClimbTab.java",
      code: "public class ClimbTab {\n\n    static int ways(int n) {\n        if (n == 0) {\n            return 1;\n        }\n        int[] dp = new int[n + 1];\n        dp[0] = 1;\n        dp[1] = 1;\n        for (int i = 2; i <= n; i++) {\n            dp[i] = dp[i - 1] + dp[i - 2];\n        }\n        return dp[n];\n    }\n\n    public static void main(String[] args) {\n        System.out.println(ways(6));\n    }\n    // Input : n = 6\n    // Output: 13\n}",
    },
    {
      tab: "Space-opt",
      file: "ClimbRoll.java",
      code: "public class ClimbRoll {\n\n    static int ways(int n) {\n        int prev2 = 1, prev1 = 1;\n        for (int i = 2; i <= n; i++) {\n            int cur = prev1 + prev2;\n            prev2 = prev1;\n            prev1 = cur;\n        }\n        return prev1;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(ways(6));\n    }\n    // Input : n = 6\n    // Output: 13\n}",
    },
  ],
  complexity: {
    time: "O(n) memo / tab / roll; O(φ^n) naked recursion",
    space: "O(n) memo/tab; O(1) roll; O(n) recursion depth",
    derivation: [
      "<p>There are n + 1 states. Each transition reads two earlier cells in O(1):</p>",
      "<span class=\"eq\">T = &Theta;(n) once each state is stored</span>",
      "<p>Naked recursion is the Fibonacci tree, &Theta;(&phi;<sup>n</sup>). That gap is exactly what \"overlapping subproblems\" means, measured.</p>",
    ],
    compare: [
      [ "Naked recursion", "O(φ^n)", "O(n) stack", "Only to derive the recurrence" ],
      [ "Memo", "O(n)", "O(n)", "Interview default" ],
      [ "Tabulated", "O(n)", "O(n)", "Clear order, easy to roll" ],
      [ "Rolling", "O(n)", "O(1)", "When only a window is live" ],
    ],
  },
  pitfalls: [
    {
      title: "dp[0] = 0 for ways",
      bug: "Zero ways to do nothing. Then every later cell is 0.",
      fix: "Empty plan is one way for counting problems. Empty cost is 0 for min-cost.",
    },
    {
      title: "Off-by-one on n vs n+1 allocation",
      bug: "dp of length n, then write dp[n].",
      fix: "If the state is \"first i\" or \"value i\", allocate n+1 and be explicit about whether i is 0-based size or 1-based value.",
    },
    {
      title: "Reading a cell you have not written",
      bug: "Looping i downwards when the transition reads i-1.",
      fix: "Draw the dependency arrow; walk against it. Memo hides this; tabulation does not.",
    },
    {
      title: "int overflow on ways",
      bug: "Climbing stairs is tiny; knapsack-style counts are not.",
      fix: "long, and the modulus in the addition if the statement gives one.",
    },
    {
      title: "Forgetting the state still depends on a choice you discarded",
      bug: "House-robber-style \"take or skip\" encoded as a 1D array that cannot tell whether i was taken.",
      fix: "Either store two values (took / skipped) or define dp[i] as \"best on prefix i with i decided\" so the transition can refer to i-2.",
    },
    {
      title: "Calling it DP when there is no overlap",
      bug: "Memoizing a tree recursion whose every state is unique. You pay for a hashmap and gain nothing.",
      fix: "If each state is hit once, it is just recursion (or a tree DP that still stores per-node answers, which <em>is</em> overlap across queries).",
    },
  ],
  variants: [
    [
      "Min-cost climb",
      "dp[i] = cost[i] + min(dp[i-1], dp[i-2]). Same skeleton, min instead of +.",
      "LC 746",
      "<a href=\"dp-1d.html\">1-D DP</a>",
    ],
    [
      "k-wide steps",
      "dp[i] = sum of dp[i-1] .. dp[i-k]. Sliding window of the last k.",
      "O(n) after a running sum",
      "LC 1425 is the hard cousin",
    ],
    [
      "Modulo",
      "Every addition becomes (a + b) % MOD. Negative-safe: (a + b) % MOD, with + MOD if you subtract.",
      "MOD = 1_000_000_007",
      "Most CF counting DPs",
    ],
    [
      "Reconstruction",
      "Store prev[i] = which predecessor won. Walk back from n.",
      "prev[i] = i-1 or i-2",
      "Needed when the problem asks for a sequence, not a number",
    ],
  ],
  followups: [
    [
      "Memo or tabulation, which do I write first?",
      "<p>Memo. It is the recurrence plus a cache, and it only computes reachable states. Tabulation needs an order and fills everything. After the memo is correct, inverting it is mechanical and often faster by a constant (no call stack, better locality).</p>",
    ],
    [
      "What if the dependency graph is not obvious?",
      "<p>If every transition strictly decreases some rank (i, i+j, popcount, remaining capacity), an order exists. If you cannot name a rank, you probably have a cycle and the state is wrong (shortest-path-on-states, not DP).</p>",
    ],
    [
      "How do I know the state is complete?",
      "<p>After writing the transition, ask: \"is there any information about the past that I still need and did not put in the args?\" If yes, add a parameter or change the meaning of the index. Completeness is the only hard part of DP.</p>",
    ],
    [
      "Why is climb-stairs Fibonacci and not 2^n?",
      "<p>Sequences of 1s and 2s that sum to n, not every binary string. The recurrence counts compositions with parts in {1,2}, whose generating function is 1/(1-x-x^2), i.e. Fibonacci. 2^n would be if each stair independently had a yes/no decision.</p>",
    ],
  ],
  problems: [
    {
      name: "Climbing Stairs",
      url: "https://leetcode.com/problems/climbing-stairs/",
      badge: "lc",
      tag: "LC 70",
      level: "Easy",
      pattern: "The dry-run problem",
    },
    {
      name: "Fibonacci Number",
      url: "https://leetcode.com/problems/fibonacci-number/",
      badge: "lc",
      tag: "LC 509",
      level: "Easy",
      pattern: "Same recurrence, different base",
    },
    {
      name: "Min Cost Climbing Stairs",
      url: "https://leetcode.com/problems/min-cost-climbing-stairs/",
      badge: "lc",
      tag: "LC 746",
      level: "Easy",
      pattern: "min instead of +",
    },
    {
      name: "House Robber",
      url: "https://leetcode.com/problems/house-robber/",
      badge: "lc",
      tag: "LC 198",
      level: "Medium",
      pattern: "Take/skip 1D, next page",
    },
    {
      name: "N-th Tribonacci Number",
      url: "https://leetcode.com/problems/n-th-tribonacci-number/",
      badge: "lc",
      tag: "LC 1137",
      level: "Easy",
      pattern: "Three-term rolling",
    },
    {
      name: "Dice Combinations",
      url: "https://cses.fi/problemset/task/1633",
      badge: "gfg",
      tag: "CSES",
      level: "Easy",
      pattern: "Climb stairs with faces 1..6, modulo",
    },
    {
      name: "Boredom",
      url: "https://codeforces.com/problemset/problem/455/A",
      badge: "cf",
      tag: "CF 455A",
      level: "Medium",
      pattern: "House-robber on values, not indices",
    },
    {
      name: "Frog 1",
      url: "https://atcoder.jp/contests/dp/tasks/dp_a",
      badge: "atc",
      tag: "ATC DP-A",
      level: "Easy",
      pattern: "Educational DP contest, min-cost jump",
    },
    {
      name: "Reach a given score",
      url: "https://www.geeksforgeeks.org/problems/reach-a-given-score-1587115621/1",
      badge: "gfg",
      tag: "GfG",
      level: "Easy",
      pattern: "Coin-change-style ways",
    },
    {
      name: "Unique Paths",
      url: "https://leetcode.com/problems/unique-paths/",
      badge: "lc",
      tag: "LC 62",
      level: "Medium",
      pattern: "Same pipeline in 2D, see grid-dp",
    },
  ],
  spoilers: [
    {
      summary: "Hint for CSES Dice Combinations",
      body: "<p>dp[x] = ways to sum to x with faces 1..6, order matters (compositions). dp[0]=1, dp[x] += dp[x-f] for f=1..6 if x-f &ge; 0, mod 1e9+7. That is climb-stairs with k = 6. If order did not matter it would be coin change unbounded, a different loop order &mdash; see knapsack.</p>",
    },
    {
      summary: "Hint for CF 455A Boredom",
      body: "<p>Taking value v deletes v-1 and v+1. Compress to counts cnt[v], then house-robber on the value line: dp[v] = max(dp[v-1], dp[v-2] + v*cnt[v]). The state is the value, not the index. long for the answer.</p>",
    },
  ],
  recap: [
    "<strong>State sentence, then transition, then base, then order.</strong>",
    "<strong>Memo is the recurrence plus a cache</strong>; tabulation is the same DAG in loops.",
    "<strong>S &times; T must fit the constraint</strong> before you code.",
    "<strong>Roll the window</strong> when only the last few states are live.",
    "<strong>Counting uses long / modulus; empty ways = 1, empty cost = 0.</strong>",
  ],
  oneliner: "name the state | write rec from smaller | base | memo or topo-fill | roll if a window",
}),

pack({
  id: "dp-1d",
  difficulty: "Easy",
  readTime: "24 min",
  tagline: "One index, two choices &mdash; take it or skip it &mdash; is house robber, frog jumps, decode ways, and most \"best on a prefix\" problems.",
  tags: [ "1D DP", "house robber", "prefix", "P0" ],
  prereqs: [
    [ "DP Foundations", "dp-foundations.html" ],
  ],
  why: [
    "Once the state is \"best / ways using the first i elements\", a surprising fraction of array DP collapses to one loop. The live question is only what the last decision was: did we take a[i], and what does that forbid?",
    "House robber is the mascot: taking i forbids i-1, so <code>dp[i] = max(dp[i-1], dp[i-2] + a[i])</code>. Decode ways, delete-and-earn, and frog-jump costs are the same shape with a different combine. Learn the shape, not the story.",
    "The space trick is automatic: two (or k) previous answers replace the array. That is why 1D DP is the first family after foundations &mdash; it is foundations with an array of weights attached.",
  ],
  insight: "Define dp[i] as the answer for the prefix a[0..i]. The transition looks only at a constant number of earlier prefixes plus a[i] itself.",
  yes: [
    "Best / ways / possibility on a prefix of an array",
    "\"Cannot pick two adjacent\" / \"jump at most k\" / \"last decision is local\"",
    "Delete-and-earn, house robber, decode ways, frog 1/2",
    "A linear scan would work if you stored a few running answers",
    "n = 1e5 rules out n&sup2;, and the dependency is local",
  ],
  no: [
    "The answer for prefix i depends on an arbitrary earlier j &rarr; LIS / nested loops / n log n",
    "Capacity / remaining budget is a second dimension &rarr; knapsack",
    "A grid, not an array &rarr; grid DP",
    "Subarrays as intervals [l,r] &rarr; interval DP",
  ],
  table: [
    [ "Cannot pick adjacent", "Take or skip", "dp[i]=max(dp[i-1], dp[i-2]+a[i])" ],
    [ "Jump 1..k with a cost", "min over a window", "dp[i]=a[i]+min(dp[i-1]..dp[i-k])" ],
    [ "Decode / split a string", "Last 1 or 2 chars valid?", "ways[i]+=ways[i-1]/i-2" ],
    [ "Delete-and-earn", "House robber on compressed values", "Same rec on cnt[v]" ],
    [ "Max sum with no two adjacent", "House robber", "This page" ],
    [
      "Kadane (any subarray)",
      "Different invariant: reset vs extend",
      "<a href=\"../01-arrays-and-windows/kadane.html\">Kadane</a>",
    ],
    [
      "<strong>Confused with:</strong> Kadane",
      "Kadane allows a reset to a[i]; house robber cannot drop the prefix freely",
      "If you may start a new segment anywhere, it is Kadane",
    ],
  ],
  constraint: "<code>n &le; 10&#8309;</code> wants O(n) after you roll. Answers are <code>long</code> when values are 1e9. A window of k with a naive min is O(nk) and dies at k = n; then you need a monotonic deque (still 1D DP).",
  coreHeading: "Take or skip, written as a prefix",
  core: [
    "Let <code>dp[i]</code> be the maximum money from houses <code>0..i</code>. If you skip i you already have <code>dp[i-1]</code>. If you take i you cannot have taken i-1, so you add <code>a[i]</code> to <code>dp[i-2]</code>. The max of those two is optimal, because every plan decides i one way or the other.",
    "Bases: <code>dp[0] = a[0]</code>, <code>dp[1] = max(a[0], a[1])</code>. The loop runs i = 2 .. n-1. Rolling: keep <code>prev2, prev1</code> and write <code>cur = max(prev1, prev2 + a[i])</code>. Decode ways is the counting twin: a valid last digit uses ways[i-1], a valid last pair uses ways[i-2]. Same indices, <code>+</code> instead of <code>max</code>, and a validity predicate on the characters.",
  ],
  invariant: "<p><code>dp[i]</code> is the best answer that is allowed to use any subset of <code>a[0..i]</code> obeying the local constraint (no two adjacent, jump limit, &hellip;). After i = n-1 you have the full-array answer.</p><span class=\"eq\">dp[i] = max(dp[i-1], dp[i-2] + a[i])</span>",
  extra: [
    {
      kind: "warn",
      title: "Circular house robber",
      html: "<p>If n and 0 are adjacent, you cannot take both. Run the linear DP twice, once on [0..n-2] and once on [1..n-1], and take the max. The empty / single-house cases are the only extra bases.</p>",
    },
    {
      kind: "math",
      title: "Window of k, O(n) with a deque",
      html: "<p>dp[i] = a[i] + min_{i-k &le; j &lt; i} dp[j]. A monotonic deque of increasing dp values with indices, popping the front when it leaves the window, makes each i O(1). That is still 1D DP; the deque is the data structure, not a new family.</p>",
    },
  ],
  grid: {
    corner: "i",
    rowHeads: [ "a", "dp" ],
    colHeads: [ "0", "1", "2", "3", "4" ],
  },
  vars: [ "i", "choice", "dp[i]" ],
  frames: [
    {
      note: "a = [2, 7, 9, 3, 1]. Base dp[0] = 2.",
      cells: [
        {
          r: 0,
          c: 0,
          val: "2",
        },
        {
          r: 0,
          c: 1,
          val: "7",
        },
        {
          r: 0,
          c: 2,
          val: "9",
        },
        {
          r: 0,
          c: 3,
          val: "3",
        },
        {
          r: 0,
          c: 4,
          val: "1",
        },
        {
          r: 1,
          c: 0,
          val: "2",
          cls: "answer",
        },
      ],
      values: {
        i: 0,
        choice: "must take 2",
        "dp[i]": 2,
      },
    },
    {
      note: "dp[1] = max(2, 7) = 7. Better to take the second house alone.",
      cells: [
        {
          r: 1,
          c: 1,
          val: "7",
          cls: "target",
        },
        {
          r: 1,
          c: 0,
          val: "2",
          cls: "from",
        },
      ],
      values: {
        i: 1,
        choice: "max(skip, take)",
        "dp[i]": 7,
      },
    },
    {
      note: "i=2. skip = dp[1]=7, take = dp[0]+9=11. Write 11.",
      cells: [
        {
          r: 1,
          c: 2,
          val: "11",
          cls: "target",
        },
        {
          r: 1,
          c: 1,
          val: "7",
          cls: "from",
        },
        {
          r: 1,
          c: 0,
          val: "2",
          cls: "from",
        },
      ],
      values: {
        i: 2,
        choice: "take 9",
        "dp[i]": 11,
      },
    },
    {
      note: "i=3. skip=11, take=7+3=10. Skip wins: 11.",
      cells: [
        {
          r: 1,
          c: 3,
          val: "11",
          cls: "target",
        },
        {
          r: 1,
          c: 2,
          val: "11",
          cls: "from",
        },
        {
          r: 1,
          c: 1,
          val: "7",
          cls: "from",
        },
      ],
      values: {
        i: 3,
        choice: "skip 3",
        "dp[i]": 11,
      },
    },
    {
      note: "i=4. skip=11, take=11+1=12. Take the last house. Answer 12.",
      cells: [
        {
          r: 1,
          c: 4,
          val: "12",
          cls: "target",
        },
        {
          r: 1,
          c: 3,
          val: "11",
          cls: "from",
        },
        {
          r: 1,
          c: 2,
          val: "11",
          cls: "from",
        },
      ],
      values: {
        i: 4,
        choice: "take 1",
        "dp[i]": 12,
      },
    },
    {
      note: "Rolling view: only dp[i-1]=11 and dp[i-2]=11 were needed to write 12.",
      cells: [
        {
          r: 1,
          c: 4,
          val: "12",
          cls: "answer",
        },
        {
          r: 1,
          c: 3,
          val: "11",
          cls: "from",
        },
        {
          r: 1,
          c: 2,
          val: "11",
          cls: "from",
        },
      ],
      values: {
        i: "roll",
        choice: "two ints",
        "dp[i]": 12,
      },
    },
    {
      note: "Reconstruction: 12 came from take, so include a[4], jump to i=2. 11 came from take, include a[2], jump to i=0. Include a[0]. Set {0,2,4}.",
      cells: [
        {
          r: 0,
          c: 0,
          val: "2",
          cls: "answer",
        },
        {
          r: 0,
          c: 2,
          val: "9",
          cls: "answer",
        },
        {
          r: 0,
          c: 4,
          val: "1",
          cls: "answer",
        },
        {
          r: 1,
          c: 4,
          val: "12",
          cls: "target",
        },
      ],
      values: {
        i: "path",
        choice: "0,2,4",
        "dp[i]": 12,
      },
    },
  ],
  vizTitle: "House robber on [2, 7, 9, 3, 1]",
  vizIntro: "One row of dp[i]. Target is the cell we write; from cells are the skip (i-1) and the take (i-2) options.",
  vizCaption: "Answer 12 = 2+9+1, which is take / skip / take / skip / take. The table never stores the subset, only the best value.",
  mermaid: "flowchart TD\n  q([\"array, best or ways\"]) --> adj{\"adjacent constraint?\"}\n  adj -- \"no two adjacent\" --> hr[\"house robber max\"]\n  adj -- \"last 1 or 2 tokens\" --> dec[\"decode-ways +=\"]\n  adj -- \"jump 1..k\" --> jmp[\"min over window, maybe deque\"]\n  adj -- \"value line, delete neighbours\" --> de[\"compress, then house robber\"]\n  hr --> roll[\"roll two integers\"]\n  dec --> roll\n  jmp --> roll\n  de --> roll",
  merTitle: "Which 1D template?",
  merCaption: "Local constraint plus a prefix state. If the second index is a capacity, leave this page.",
  steps: [
    "<strong>State:</strong> dp[i] = answer on prefix 0..i.",
    "<strong>Decision at i:</strong> skip (read i-1) or take (read i-2, or a window).",
    "<strong>Bases</strong> for i = 0 and i = 1, written out, not stuffed into the loop.",
    "<strong>Loop i = 2 .. n-1</strong> and apply the formula.",
    "<strong>Roll</strong> to two (or k) running values if you do not need the table.",
    "<strong>Circular:</strong> run twice, drop the first house or the last.",
    "<strong>Reconstruct</strong> by comparing which branch produced dp[i].",
  ],
  dryIntro: "House robber on [2, 7, 9, 3, 1].",
  dryCols: [ "i", "a[i]", "skip dp[i-1]", "take dp[i-2]+a[i]", "dp[i]" ],
  dryRows: [
    {
      cells: [ "0", "2", "—", "2", "2" ],
      action: "Base.",
    },
    {
      cells: [ "1", "7", "2", "7", "7" ],
      action: "max(a[0], a[1]).",
    },
    {
      cells: [ "2", "9", "7", "2+9=11", "11" ],
      action: "Take.",
      change: true,
    },
    {
      cells: [ "3", "3", "11", "7+3=10", "11" ],
      action: "Skip.",
    },
    {
      cells: [ "4", "1", "11", "11+1=12", "12" ],
      action: "Take. Answer 12.",
      change: true,
    },
  ],
  code: [
    {
      tab: "Recursion",
      file: "RobRec.java",
      code: "public class RobRec {\n\n    static int rob(int[] a, int i) {\n        if (i >= a.length) {\n            return 0;\n        }\n        return Math.max(rob(a, i + 1), a[i] + rob(a, i + 2));\n    }\n\n    public static void main(String[] args) {\n        System.out.println(rob(new int[] {2, 7, 9, 3, 1}, 0));\n    }\n    // Input : [2, 7, 9, 3, 1]\n    // Output: 12\n}",
    },
    {
      tab: "Memo",
      file: "RobMemo.java",
      code: "import java.util.Arrays;\n\npublic class RobMemo {\n\n    static int rob(int[] a, int i, int[] memo) {\n        if (i >= a.length) {\n            return 0;\n        }\n        if (memo[i] != -1) {\n            return memo[i];\n        }\n        return memo[i] = Math.max(rob(a, i + 1, memo), a[i] + rob(a, i + 2, memo));\n    }\n\n    public static void main(String[] args) {\n        int[] a = {2, 7, 9, 3, 1};\n        int[] memo = new int[a.length];\n        Arrays.fill(memo, -1);\n        System.out.println(rob(a, 0, memo));\n    }\n    // Input : [2, 7, 9, 3, 1]\n    // Output: 12\n}",
    },
    {
      tab: "Tabulated",
      file: "RobTab.java",
      code: "public class RobTab {\n\n    static int rob(int[] a) {\n        int n = a.length;\n        if (n == 1) {\n            return a[0];\n        }\n        int[] dp = new int[n];\n        dp[0] = a[0];\n        dp[1] = Math.max(a[0], a[1]);\n        for (int i = 2; i < n; i++) {\n            dp[i] = Math.max(dp[i - 1], dp[i - 2] + a[i]);\n        }\n        return dp[n - 1];\n    }\n\n    public static void main(String[] args) {\n        System.out.println(rob(new int[] {2, 7, 9, 3, 1}));\n    }\n    // Input : [2, 7, 9, 3, 1]\n    // Output: 12\n}",
    },
    {
      tab: "Space-opt",
      file: "RobRoll.java",
      code: "public class RobRoll {\n\n    static int rob(int[] a) {\n        int prev2 = 0, prev1 = 0;\n        for (int x : a) {\n            int cur = Math.max(prev1, prev2 + x);\n            prev2 = prev1;\n            prev1 = cur;\n        }\n        return prev1;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(rob(new int[] {2, 7, 9, 3, 1}));\n    }\n    // Input : [2, 7, 9, 3, 1]\n    // Output: 12\n}",
    },
  ],
  complexity: {
    time: "O(n)",
    space: "O(1) rolled; O(n) table",
    derivation: [
      "<p>n states, O(1) transition (or O(k) for a naive window, O(1) with a deque):</p>",
      "<span class=\"eq\">T = &Theta;(n)</span>",
    ],
    compare: [
      [ "House robber", "O(n)", "O(1)", "Take / skip adjacent" ],
      [ "Decode ways", "O(n)", "O(1)", "Counting twin" ],
      [ "Jump min, window k naive", "O(nk)", "O(n)", "k small" ],
      [ "Jump min + deque", "O(n)", "O(k)", "k up to n" ],
      [ "Kadane", "O(n)", "O(1)", "Different reset rule" ],
    ],
  },
  pitfalls: [
    {
      title: "Empty array / single house",
      bug: "Reading dp[1] on n = 1.",
      fix: "Guard n == 0 / n == 1 before the loop, or use the rolling form which starts at 0,0.",
    },
    {
      title: "Circular without splitting",
      bug: "Running linear DP on a ring. Taking both ends is legal in the table and illegal in the house.",
      fix: "max(rob(0..n-2), rob(1..n-1)).",
    },
    {
      title: "Mixing Kadane's reset into house robber",
      bug: "cur = max(a[i], cur + a[i]) drops the prefix and can pick two adjacent houses after a skip of thinking.",
      fix: "House robber never resets to \"start here ignoring the constraint history\". It only skips or takes.",
    },
    {
      title: "Delete-and-earn without compressing",
      bug: "Treating indices as the line. Deleting a value deletes every copy and the neighbours' values.",
      fix: "cnt[v], then house-robber on v = 1..maxA.",
    },
    {
      title: "int when a[i] is 1e4 and n is 100",
      bug: "Usually fine; on CF with 1e9 values it overflows.",
      fix: "long running totals whenever the statement's product n * maxA can exceed 2e9.",
    },
    {
      title: "Off-by-one in decode ways on leading zeros",
      bug: "\"06\" is not a valid pair, \"0\" is not a valid single. Counting them inflates the answer.",
      fix: "A single digit is valid iff it is 1..9. A pair is valid iff 10..26.",
    },
  ],
  variants: [
    [
      "House robber II (circle)",
      "Two linear runs, drop an endpoint each time.",
      "max(rob(a,0,n-2), rob(a,1,n-1))",
      "LC 213",
    ],
    [
      "Delete and earn",
      "cnt[v] * v is the take-value; taking v skips v-1 and v+1.",
      "Same rec on the value axis",
      "LC 740",
    ],
    [
      "Decode ways",
      "ways[i] += ways[i-1] if a[i] valid; += ways[i-2] if pair valid.",
      "LC 91",
      "Counting, not max",
    ],
    [
      "Frog with k",
      "dp[i] = cost + min of last k. Deque if k is large.",
      "AtCoder DP-B",
      "Window minimum",
    ],
  ],
  followups: [
    [
      "How is this different from Kadane?",
      "<p>Kadane's decision is \"extend the current subarray or start a new one at i\". House robber's decision is \"take i (and skip i-1) or skip i\". Both are 1D DP. The constraint is what changes the formula.</p>",
    ],
    [
      "Can I reconstruct the subset in O(1) space?",
      "<p>Not from the two rolling integers alone. Keep the full dp[] (or a parent bit) if the subset is required. Rolling is for the value.</p>",
    ],
    [
      "What if taking i forbids the previous k houses?",
      "<p>dp[i] = max(dp[i-1], dp[i-k-1] + a[i]). Still O(n). The \"k\" sits in the index, not in a new dimension.</p>",
    ],
    [
      "Why does delete-and-earn become house robber?",
      "<p>Once you decide to take value v you must take all copies and you cannot take v-1. Adjacent values on the number line behave exactly like adjacent houses.</p>",
    ],
  ],
  problems: [
    {
      name: "House Robber",
      url: "https://leetcode.com/problems/house-robber/",
      badge: "lc",
      tag: "LC 198",
      level: "Medium",
      pattern: "The dry-run problem",
    },
    {
      name: "House Robber II",
      url: "https://leetcode.com/problems/house-robber-ii/",
      badge: "lc",
      tag: "LC 213",
      level: "Medium",
      pattern: "Circle: two linear runs",
    },
    {
      name: "Delete and Earn",
      url: "https://leetcode.com/problems/delete-and-earn/",
      badge: "lc",
      tag: "LC 740",
      level: "Medium",
      pattern: "Compress values, then robber",
    },
    {
      name: "Decode Ways",
      url: "https://leetcode.com/problems/decode-ways/",
      badge: "lc",
      tag: "LC 91",
      level: "Medium",
      pattern: "Counting twin",
    },
    {
      name: "Jump Game II",
      url: "https://leetcode.com/problems/jump-game-ii/",
      badge: "lc",
      tag: "LC 45",
      level: "Medium",
      pattern: "Greedy is intended; DP is O(n^2)",
    },
    {
      name: "Frog 2",
      url: "https://atcoder.jp/contests/dp/tasks/dp_b",
      badge: "atc",
      tag: "ATC DP-B",
      level: "Easy",
      pattern: "Window of k jumps",
    },
    {
      name: "Boredom",
      url: "https://codeforces.com/problemset/problem/455/A",
      badge: "cf",
      tag: "CF 455A",
      level: "Medium",
      pattern: "Delete-and-earn on CF",
    },
    {
      name: "Vacation",
      url: "https://atcoder.jp/contests/dp/tasks/dp_c",
      badge: "atc",
      tag: "ATC DP-C",
      level: "Easy",
      pattern: "1D with 3 last-choices",
    },
    {
      name: "Stickler Thief",
      url: "https://www.geeksforgeeks.org/problems/stickler-theif-1587115621/1",
      badge: "gfg",
      tag: "GfG",
      level: "Easy",
      pattern: "House robber wording",
    },
    {
      name: "Maximum sum of non-adjacent nodes",
      url: "https://www.geeksforgeeks.org/problems/maximum-sum-of-non-adjacent-nodes/1",
      badge: "gfg",
      tag: "GfG",
      level: "Medium",
      pattern: "Same rec on a tree",
    },
  ],
  spoilers: [
    {
      summary: "Hint for LC 213",
      body: "<p>Houses 0 and n-1 are adjacent. Any legal plan misses at least one of them. So the answer is max(linear on 0..n-2, linear on 1..n-1). n = 1 is just a[0].</p>",
    },
    {
      summary: "Hint for AtCoder DP-C Vacation",
      body: "<p>dp[i][c] = max happiness on day i if you do activity c. Transition: max over c' != c of dp[i-1][c'] + a[i][c]. Three last-choices, still 1D in the day index. Roll the 3-array.</p>",
    },
  ],
  recap: [
    "<strong>dp[i] is the answer on the prefix 0..i.</strong>",
    "<strong>House robber:</strong> max(skip i-1, take i-2 + a[i]).",
    "<strong>Circle = two linear runs.</strong>",
    "<strong>Roll to two integers</strong> unless you must reconstruct.",
    "<strong>Kadane is a different 1D rec</strong> (reset vs extend).",
  ],
  oneliner: "dp[i]=max(dp[i-1], dp[i-2]+a[i]) | circle: drop an end | roll two ints",
}),

pack({
  id: "knapsack-family",
  difficulty: "Medium",
  readTime: "26 min",
  tagline: "A second dimension that is a remaining budget &mdash; 0/1, unbounded, and bounded knapsack are the same table with three different loop directions.",
  tags: [ "knapsack", "0/1", "unbounded", "P0" ],
  prereqs: [
    [ "DP Foundations", "dp-foundations.html" ],
  ],
  why: [
    "Knapsack is the first time a DP state needs two arguments: how many items you have considered, and how much capacity is left. That extra axis is the model for every \"budget / weight / sum / volume\" problem you will meet, including subset-sum, partition, coin change, and target-sum.",
    "The family splits on whether each item may be used once (0/1), infinitely (unbounded), or up to c_i times (bounded). Those three are not three algorithms. They are three ways to iterate the same recurrence so that you do or do not reuse an item in one pass.",
    "Pseudo-polynomial time O(nW) is the constraint tell. If W is 1e9 the table does not fit and you need meet-in-the-middle or a greedy/convex structure. If W is 1e4 and n is 100, this page is the intended solution.",
  ],
  insight: "dp[i][w] = best value using a prefix of i items and capacity exactly (or at most) w. 0/1 walks w downwards in the rolled array; unbounded walks w upwards.",
  yes: [
    "Items with a weight and a value, a capacity W, maximise value or test reachability",
    "Subset-sum / partition-equal-subset / last-stone-weight II",
    "Coin change: fewest coins or number of combinations",
    "\"Pick each at most once\" vs \"unlimited supply\" in the statement",
    "n * W fits in 1e7 .. 1e8",
  ],
  no: [
    "W is 1e9 and n is 40 &rarr; meet-in-the-middle, not a W-table",
    "Items interact beyond a single budget (two capacities) &rarr; 3D knapsack or two rolls",
    "Fractional items &rarr; greedy by value/weight, not DP",
    "The \"weight\" is actually a time on a DAG &rarr; DAG DP, not knapsack",
  ],
  table: [
    [ "Each item at most once", "0/1", "i outer, w descending" ],
    [ "Unlimited copies", "Unbounded", "i outer, w ascending (or coin outer)" ],
    [ "At most c_i copies", "Bounded", "binary split into 0/1 items, or a third loop" ],
    [ "Can you make sum S?", "Subset sum", "Boolean 0/1 knapsack" ],
    [ "Fewest coins to make S", "Unbounded min", "dp[w] = min dp[w-c]+1" ],
    [
      "Number of combinations (order ignored)",
      "Unbounded ways, coin outer",
      "Avoid permutations",
    ],
    [
      "<strong>Confused with:</strong> number of permutations of coins",
      "Item-outer vs sum-outer flips combinations vs permutations",
      "Coin change LC 518 is combinations: coin loop outside",
    ],
  ],
  constraint: "<code>n &le; 100</code>, <code>W &le; 10&#8308;</code> is the textbook signature. O(nW) time and O(W) extra after rolling. Values and ways need <code>long</code>. W = 1e9 is a hard no.",
  coreHeading: "The 2D table and the roll direction",
  core: [
    "0/1: <code>dp[i][w] = max(dp[i-1][w], dp[i-1][w-wt] + val)</code> if w &ge; wt, else skip. Item i is considered once, against a table that does not yet contain it.",
    "Rolling to <code>long[] dp</code> of size W+1: iterate items outside, and <strong>w from W down to wt</strong> so that <code>dp[w-wt]</code> is still the previous item's row. Unbounded flips that: <strong>w from wt up to W</strong> so you <em>do</em> reuse the current item. Subset-sum is the boolean special case (val = 1 or just OR). Coin-change fewest is unbounded min. Coin-change combinations is unbounded += with the coin loop outside so that {1,2} is counted once, not as 1-then-2 and 2-then-1.",
  ],
  invariant: "<p>After processing a prefix of items, <code>dp[w]</code> is the best value (or ways, or possibility) using capacity <code>w</code> and only those items, with the reuse rule of the family you chose.</p><span class=\"eq\">0/1: w ↓ &nbsp;&nbsp; unbounded: w ↑</span>",
  extra: [
    {
      kind: "warn",
      title: "The direction is the algorithm",
      html: "<p>Ascending w on a 0/1 problem lets an item be taken many times in one pass. Descending w on unbounded forbids reuse and under-counts. Draw one row and mark whether dp[w-wt] is \"old\" or \"new\" before you pick the for-loop.</p>",
    },
    {
      kind: "math",
      title: "Bounded via binary splitting",
      html: "<p>c copies of weight wt become copies of 1, 2, 4, ... up to c, each a 0/1 item. That is O(n log C) 0/1 items and is usually simpler than a third nested loop over take-count.</p>",
    },
  ],
  grid: {
    corner: "i\\w",
    rowHeads: [ "i=0", "i=1 wt1", "i=2 wt2", "i=3 wt3" ],
    colHeads: [ "0", "1", "2", "3", "4", "5" ],
  },
  vars: [ "i", "w", "dp" ],
  frames: [
    {
      note: "Row 0: no items, every capacity is value 0.",
      cells: [
        {
          r: 0,
          c: 0,
          val: "0",
        },
        {
          r: 0,
          c: 1,
          val: "0",
        },
        {
          r: 0,
          c: 2,
          val: "0",
        },
        {
          r: 0,
          c: 3,
          val: "0",
        },
        {
          r: 0,
          c: 4,
          val: "0",
        },
        {
          r: 0,
          c: 5,
          val: "0",
        },
      ],
      values: {
        i: 0,
        w: "all",
        dp: 0,
      },
    },
    {
      note: "Item 1, w=1. skip=0, take=0+6. Write 6.",
      cells: [
        {
          r: 1,
          c: 1,
          val: "6",
          cls: "target",
        },
        {
          r: 0,
          c: 1,
          val: "0",
          cls: "from",
        },
        {
          r: 0,
          c: 0,
          val: "0",
          cls: "from",
        },
      ],
      values: {
        i: 1,
        w: 1,
        dp: 6,
      },
    },
    {
      note: "Item 1 fills the row: any w>=1 can take it once, value 6.",
      cells: [
        {
          r: 1,
          c: 1,
          val: "6",
        },
        {
          r: 1,
          c: 2,
          val: "6",
        },
        {
          r: 1,
          c: 3,
          val: "6",
        },
        {
          r: 1,
          c: 4,
          val: "6",
        },
        {
          r: 1,
          c: 5,
          val: "6",
          cls: "answer",
        },
      ],
      values: {
        i: 1,
        w: "2..5",
        dp: 6,
      },
    },
    {
      note: "Item 2 (wt=2, val=10), w=5. skip=6, take=dp[1][3]+10=16. Write 16.",
      cells: [
        {
          r: 2,
          c: 5,
          val: "16",
          cls: "target",
        },
        {
          r: 1,
          c: 5,
          val: "6",
          cls: "from",
        },
        {
          r: 1,
          c: 3,
          val: "6",
          cls: "from",
        },
      ],
      values: {
        i: 2,
        w: 5,
        dp: 16,
      },
    },
    {
      note: "Row 2 complete: [0,6,10,16,16,16]. Taking item 2 is better than item 1 alone once w>=2.",
      cells: [
        {
          r: 2,
          c: 0,
          val: "0",
        },
        {
          r: 2,
          c: 1,
          val: "6",
        },
        {
          r: 2,
          c: 2,
          val: "10",
        },
        {
          r: 2,
          c: 3,
          val: "16",
        },
        {
          r: 2,
          c: 4,
          val: "16",
        },
        {
          r: 2,
          c: 5,
          val: "16",
        },
      ],
      values: {
        i: 2,
        w: "row",
        dp: 16,
      },
    },
    {
      note: "Item 3 (wt=3, val=12), w=5. skip=16, take=dp[2][2]+12=22. Write 22.",
      cells: [
        {
          r: 3,
          c: 5,
          val: "22",
          cls: "target",
        },
        {
          r: 2,
          c: 5,
          val: "16",
          cls: "from",
        },
        {
          r: 2,
          c: 2,
          val: "10",
          cls: "from",
        },
      ],
      values: {
        i: 3,
        w: 5,
        dp: 22,
      },
    },
    {
      note: "Optimal 22 = items 2 and 3. Capacity 2+3=5. Item 1 is left out.",
      cells: [
        {
          r: 3,
          c: 5,
          val: "22",
          cls: "answer",
        },
        {
          r: 2,
          c: 2,
          val: "10",
          cls: "from",
        },
      ],
      values: {
        i: 3,
        w: 5,
        dp: 22,
      },
    },
  ],
  vizTitle: "0/1 knapsack: weights [1,2,3], values [6,10,12], W = 5",
  vizIntro: "Rows are items committed so far; columns are capacity. Target is the cell we write; from is skip (same w, previous item) and take (w - wt, previous item).",
  vizCaption: "Answer dp[3][5] = 22 (items 2 and 3: 10+12). Item 1+3 = 18 is worse. The green cell always reads only the previous row.",
  mermaid: "flowchart TD\n  q([\"items + capacity\"]) --> reuse{\"how many times may an item be used?\"}\n  reuse -- \"at most once\" --> zo[\"0/1: w from W down to wt\"]\n  reuse -- \"unlimited\" --> unb[\"unbounded: w from wt up to W\"]\n  reuse -- \"at most c_i\" --> bnd[\"binary-split into 0/1 items\"]\n  zo --> goal{\"what is asked?\"}\n  unb --> goal\n  bnd --> goal\n  goal -- \"max value\" --> mx[\"max of skip and take\"]\n  goal -- \"can you make w\" --> bo[\"boolean OR\"]\n  goal -- \"fewest items\" --> mn[\"min + 1\"]\n  goal -- \"number of combinations\" --> ways[\"+= , coin loop outside\"]",
  merTitle: "Which knapsack loop?",
  merCaption: "The reuse rule picks the walk direction. Getting this wrong is a silent WA, not a crash.",
  steps: [
    "<strong>Identify the family:</strong> 0/1, unbounded, or bounded.",
    "<strong>State:</strong> dp[w] = best / ways / possible with capacity w (rolled), after a prefix of items.",
    "<strong>Allocate long[] (or boolean[]) of W+1.</strong> dp[0] = 0 (value) or 1 (ways) or true.",
    "<strong>For each item</strong> walk w in the correct direction.",
    "<strong>0/1:</strong> for w = W; w &gt;= wt; w-- : dp[w] = max(dp[w], dp[w-wt] + val).",
    "<strong>Unbounded:</strong> the same line with w++ from wt.",
    "<strong>Read dp[W]</strong> (or max over w, or dp[sum/2] for partition).",
  ],
  dryIntro: "0/1 rolled array, items (1,6), (2,10), (3,12), W = 5. Each row is after one item.",
  dryCols: [ "item", "w=0", "1", "2", "3", "4", "5" ],
  dryRows: [
    {
      cells: [ "none", "0", "0", "0", "0", "0", "0" ],
      action: "Start.",
    },
    {
      cells: [ "(1,6)", "0", "6", "6", "6", "6", "6" ],
      action: "First item fills w>=1.",
      change: true,
    },
    {
      cells: [ "(2,10)", "0", "6", "10", "16", "16", "16" ],
      action: "Descending w uses the old row.",
      change: true,
    },
    {
      cells: [ "(3,12)", "0", "6", "10", "16", "18", "22" ],
      action: "w=5: max(16, 10+12)=22.",
      change: true,
    },
  ],
  code: [
    {
      tab: "Recursion",
      file: "KsRec.java",
      code: "public class KsRec {\n\n    static int rec(int[] wt, int[] val, int i, int left) {\n        if (i == wt.length || left <= 0) {\n            return 0;\n        }\n        int skip = rec(wt, val, i + 1, left);\n        int take = 0;\n        if (wt[i] <= left) {\n            take = val[i] + rec(wt, val, i + 1, left - wt[i]);\n        }\n        return Math.max(skip, take);\n    }\n\n    public static void main(String[] args) {\n        System.out.println(rec(new int[] {1, 2, 3}, new int[] {6, 10, 12}, 0, 5));\n    }\n    // Input : wt=[1,2,3] val=[6,10,12] W=5\n    // Output: 22\n}",
    },
    {
      tab: "Memo",
      file: "KsMemo.java",
      code: "import java.util.Arrays;\n\npublic class KsMemo {\n\n    static int rec(int[] wt, int[] val, int i, int left, int[][] memo) {\n        if (i == wt.length || left <= 0) {\n            return 0;\n        }\n        if (memo[i][left] != -1) {\n            return memo[i][left];\n        }\n        int best = rec(wt, val, i + 1, left, memo);\n        if (wt[i] <= left) {\n            best = Math.max(best, val[i] + rec(wt, val, i + 1, left - wt[i], memo));\n        }\n        return memo[i][left] = best;\n    }\n\n    public static void main(String[] args) {\n        int[] wt = {1, 2, 3}, val = {6, 10, 12};\n        int W = 5;\n        int[][] memo = new int[wt.length][W + 1];\n        for (int[] row : memo) {\n            Arrays.fill(row, -1);\n        }\n        System.out.println(rec(wt, val, 0, W, memo));\n    }\n    // Input : same\n    // Output: 22\n}",
    },
    {
      tab: "Tabulated",
      file: "KsTab.java",
      code: "public class KsTab {\n\n    static int knapsack(int[] wt, int[] val, int W) {\n        int n = wt.length;\n        int[][] dp = new int[n + 1][W + 1];\n        for (int i = 1; i <= n; i++) {\n            for (int w = 0; w <= W; w++) {\n                dp[i][w] = dp[i - 1][w];\n                if (wt[i - 1] <= w) {\n                    dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - wt[i - 1]] + val[i - 1]);\n                }\n            }\n        }\n        return dp[n][W];\n    }\n\n    public static void main(String[] args) {\n        System.out.println(knapsack(new int[] {1, 2, 3}, new int[] {6, 10, 12}, 5));\n    }\n    // Input : same\n    // Output: 22\n}",
    },
    {
      tab: "Space-opt",
      file: "KsRoll.java",
      code: "public class KsRoll {\n\n    static int knapsack(int[] wt, int[] val, int W) {\n        int[] dp = new int[W + 1];\n        for (int i = 0; i < wt.length; i++) {\n            for (int w = W; w >= wt[i]; w--) {\n                dp[w] = Math.max(dp[w], dp[w - wt[i]] + val[i]);\n            }\n        }\n        return dp[W];\n    }\n\n    public static void main(String[] args) {\n        System.out.println(knapsack(new int[] {1, 2, 3}, new int[] {6, 10, 12}, 5));\n    }\n    // Input : same\n    // Output: 22\n}",
    },
  ],
  complexity: {
    time: "O(n W)",
    space: "O(W) rolled; O(n W) full table",
    derivation: [
      "<p>n items, W + 1 capacities, O(1) work per cell:</p>",
      "<span class=\"eq\">T = &Theta;(n W) &nbsp; (pseudo-polynomial in the numeric value W)</span>",
    ],
    compare: [
      [ "0/1 rolled", "O(nW)", "O(W)", "w descending" ],
      [ "Unbounded rolled", "O(nW)", "O(W)", "w ascending" ],
      [ "Full 2D", "O(nW)", "O(nW)", "Need reconstruction" ],
      [ "Meet in the middle", "O(2^{n/2} n)", "O(2^{n/2})", "n≤40, W huge" ],
      [ "Fractional", "O(n log n)", "O(1)", "Greedy, not this page" ],
    ],
  },
  pitfalls: [
    {
      title: "Ascending w on 0/1",
      bug: "Item reused in one pass; knapsack becomes unbounded by accident.",
      fix: "0/1: w--. Unbounded: w++. Say it out loud before the loop.",
    },
    {
      title: "Ways vs permutations of coins",
      bug: "Sum loop outside, coin inside counts 1+2 and 2+1 as two ways.",
      fix: "Combinations: for each coin, for each w. Permutations: the opposite (usually not wanted).",
    },
    {
      title: "dp[0] = 0 for ways",
      bug: "Zero ways to make 0. Every cell stays 0.",
      fix: "ways[0] = 1. value[0] = 0. possible[0] = true.",
    },
    {
      title: "W = 1e9",
      bug: "Allocating dp of size 1e9. MLE before TLE.",
      fix: "If n ≤ 40, meet-in-the-middle. Otherwise the problem is not knapsack-DP.",
    },
    {
      title: "int overflow on value * n",
      bug: "n = 100, val = 1e9, sum does not fit in int.",
      fix: "long[] dp.",
    },
    {
      title: "Partition with odd sum",
      bug: "Looking at dp[sum/2] when sum is odd. Integer division hides the impossibility.",
      fix: "If sum is odd return false before allocating.",
    },
  ],
  variants: [
    [
      "Subset sum / partition",
      "Boolean 0/1, val unused. Can you make exactly S?",
      "if (dp[w-wt]) dp[w] = true;  w descending",
      "LC 416",
    ],
    [
      "Unbounded coin change",
      "Fewest coins: min. Combinations: += with coin outer.",
      "LC 322 / LC 518",
      "Ascending w",
    ],
    [
      "Bounded / multiple knapsack",
      "Binary split counts into 0/1 items of wt, 2wt, 4wt, ...",
      "O(n log C * W)",
      "Classic CF / AtCoder",
    ],
    [
      "Knapsack with reconstruction",
      "Keep the 2D table or a take[i][w] bit. Walk back from (n, W).",
      "if dp[i][w] != dp[i-1][w] then item i was taken",
      "When the subset is asked",
    ],
  ],
  followups: [
    [
      "Why is O(nW) called pseudo-polynomial?",
      "<p>W is a numeric magnitude, not a count of input tokens. Its bit length is log W, so the runtime is exponential in the input size of W. That is why knapsack is NP-hard and still easy when W is 1e4.</p>",
    ],
    [
      "How do I reconstruct the items?",
      "<p>Full table: if dp[i][w] &gt; dp[i-1][w] (or != for boolean after a take), item i was taken; set w -= wt[i-1] and i--. Otherwise i--. Rolling reconstruction needs an extra bit matrix or a second pass.</p>",
    ],
    [
      "Two constraints (weight and volume)?",
      "<p>dp[w][v] or roll one axis. Time O(n W V). If both are large, it does not fit; look for a different state.</p>",
    ],
    [
      "Meet-in-the-middle, briefly?",
      "<p>Split items into two halves, enumerate 2^{n/2} subsets each, store (weight, value) of the left, sort, and for each right subset binary-search the best left that still fits. n ≤ 40, W arbitrary.</p>",
    ],
  ],
  problems: [
    {
      name: "Partition Equal Subset Sum",
      url: "https://leetcode.com/problems/partition-equal-subset-sum/",
      badge: "lc",
      tag: "LC 416",
      level: "Medium",
      pattern: "Boolean 0/1, target sum/2",
    },
    {
      name: "Target Sum",
      url: "https://leetcode.com/problems/target-sum/",
      badge: "lc",
      tag: "LC 494",
      level: "Medium",
      pattern: "P - N = target, P+N = sum",
    },
    {
      name: "Coin Change",
      url: "https://leetcode.com/problems/coin-change/",
      badge: "lc",
      tag: "LC 322",
      level: "Medium",
      pattern: "Unbounded min",
    },
    {
      name: "Coin Change II",
      url: "https://leetcode.com/problems/coin-change-ii/",
      badge: "lc",
      tag: "LC 518",
      level: "Medium",
      pattern: "Unbounded ways, coin outer",
    },
    {
      name: "Last Stone Weight II",
      url: "https://leetcode.com/problems/last-stone-weight-ii/",
      badge: "lc",
      tag: "LC 1049",
      level: "Medium",
      pattern: "Partition closest to sum/2",
    },
    {
      name: "Knapsack 1",
      url: "https://atcoder.jp/contests/dp/tasks/dp_d",
      badge: "atc",
      tag: "ATC DP-D",
      level: "Easy",
      pattern: "Classic 0/1, long values",
    },
    {
      name: "Knapsack 2",
      url: "https://atcoder.jp/contests/dp/tasks/dp_e",
      badge: "atc",
      tag: "ATC DP-E",
      level: "Medium",
      pattern: "W huge: DP on value, min weight",
    },
    {
      name: "Knapsack",
      url: "https://www.geeksforgeeks.org/problems/0-1-knapsack-problem0945/1",
      badge: "gfg",
      tag: "GfG",
      level: "Medium",
      pattern: "Implement 0/1",
    },
    {
      name: "Woodcutters",
      url: "https://codeforces.com/problemset/problem/545/C",
      badge: "cf",
      tag: "CF 545C",
      level: "Medium",
      pattern: "1D take/skip with a position budget",
    },
    {
      name: "Hit the Lottery",
      url: "https://codeforces.com/problemset/problem/996/A",
      badge: "cf",
      tag: "CF 996A",
      level: "Easy",
      pattern: "Unbounded greedy works; contrast with DP coins",
    },
  ],
  spoilers: [
    {
      summary: "Hint for AtCoder DP-E &mdash; invert the axes",
      body: "<p>W is 1e9, values sum to at most n*maxV = 1e5. So dp[v] = minimum weight to achieve value v, 0/1 on items, then the largest v with dp[v] &le; W. Same family, state flipped. This is the move whenever one axis is huge and the other is not.</p>",
    },
    {
      summary: "Hint for LC 494 Target Sum",
      body: "<p>Let P be the subset with + and N with -. P+N = sum, P-N = target, so P = (sum+target)/2. If that is not an integer or is negative, 0. Then count 0/1 ways to make P. Watch the +0 / ways[0]=1 base.</p>",
    },
  ],
  recap: [
    "<strong>0/1: w descending. Unbounded: w ascending.</strong>",
    "<strong>dp[w] is the answer at capacity w</strong> after a prefix of items.",
    "<strong>ways[0] = 1, value[0] = 0, possible[0] = true.</strong>",
    "<strong>Combinations: coin loop outside.</strong>",
    "<strong>O(nW) is pseudo-polynomial</strong> &mdash; refuse W = 1e9.",
  ],
  oneliner: "0/1 w-- | unbounded w++ | ways[0]=1 | coin-outer for combinations | long",
}),

pack({
  id: "lis",
  difficulty: "Medium",
  readTime: "24 min",
  tagline: "Longest increasing subsequence is O(n&sup2;) prefix DP or O(n log n) patience sorting &mdash; same answer, different constraint.",
  tags: [ "LIS", "patience", "n log n", "P0" ],
  prereqs: [
    [ "1-D DP", "dp-1d.html" ],
    [ "Binary Search Basics", "../01-arrays-and-windows/binary-search-basics.html" ],
  ],
  why: [
    "LIS is the first 1D DP whose transition is not O(1). dp[i] = 1 + max dp[j] over j &lt; i with a[j] &lt; a[i], else 1. That is O(n&sup2;), fine at n = 2000, dead at n = 1e5.",
    "The O(n log n) upgrade keeps tails[len] = the smallest tail of any increasing subsequence of that length. A new value either extends the longest (append) or lowers a tail (binary-search replace). The length of tails is the LIS length. The array tails is <em>not</em> itself an LIS.",
    "Variants (LDS, longest bitonic, longest chain of pairs, Russian-doll envelopes) are this page after a sort or a sign flip. Reconstruction needs a parent pointer; the n log n length algorithm does not give the sequence for free.",
  ],
  insight: "dp[i] is the LIS <em>ending at i</em>. The global answer is the max of those. Patience tails answers only the length, in n log n, by keeping one representative per length.",
  yes: [
    "Longest increasing / decreasing / non-decreasing subsequence (not subarray)",
    "n ≤ 2000 → n² DP; n ≤ 1e5 → n log n tails",
    "Box nesting, envelopes, chaining pairs after a sort",
    "Longest bitonic = LIS + LDS meeting at i",
    "You need the length, or the sequence, of a monotone subsequence",
  ],
  no: [
    "Contiguous → longest increasing <em>subarray</em> is a one-pass, not LIS",
    "Any subset that sums to k → knapsack",
    "Longest common subsequence of two strings → string DP, not this page",
    "You must pick a contiguous window of indices → sliding window / Kadane",
  ],
  table: [
    [ "LIS length, n≤2000", "dp[i] ending at i", "O(n²) double loop" ],
    [ "LIS length, n≤1e5", "patience tails", "lower_bound + replace" ],
    [ "LIS sequence", "parent[i] = best j", "Walk back from argmax" ],
    [ "LDS", "Flip comparisons or negate a[]", "Same algorithm" ],
    [ "Bitonic", "LIS from left + LDS from right - 1", "Two passes" ],
    [ "Envelopes / boxes", "Sort one axis, LIS on the other", "LC 354" ],
    [
      "<strong>Confused with:</strong> LCS of a and sorted(a)",
      "That counts a longest non-decreasing <em>if you keep duplicates right</em> and is O(n²)",
      "Use LIS directly; LCS-of-sorted is a slower equivalent for strict increase after unique",
    ],
  ],
  constraint: "<code>n &le; 10&#8309;</code> forces O(n log n). <code>n &le; 2000</code> lets you write the n&sup2; DP and reconstruct easily. Values may need compression before a Fenwick-LIS.",
  coreHeading: "Ending-at-i, then tails",
  core: [
    "O(n&sup2;): for each i, scan j &lt; i, take the max dp[j] among a[j] &lt; a[i], then dp[i] = that max + 1 (or 1). Answer max(dp). parent[i] = the j that won, or -1.",
    "O(n log n): tails starts empty. For each x, lower_bound the first tail &ge; x (strict LIS: first tail &ge; x, replace it; non-decreasing: first tail &gt; x). If x is larger than every tail, append. The length of tails is the answer. Why tails works: an increasing subsequence of length k can always be rewritten to end as small as possible without hurting future extensions. Replacing a tail is that rewrite. You lose the actual sequence unless you also store a predecessor per index.",
  ],
  invariant: "<p><code>dp[i]</code> = length of a longest strictly increasing subsequence that <em>ends at i</em>.</p><span class=\"eq\">tails[k] = smallest tail of any IS of length k+1</span>",
  extra: [
    {
      kind: "tip",
      title: "lower_bound in Java",
      html: "<p>Collections.binarySearch on a List, or a manual lo/hi on an int[] used as a size-t prefix. Insertion point = -idx-1 on a miss. mid = lo + (hi-lo)/2.</p>",
    },
    {
      kind: "warn",
      title: "tails is not an LIS",
      html: "<p>After [3, 1, 2] tails is [1, 2], which happens to be an LIS. After [1, 3, 2] tails ends as [1, 2], and [1, 2] is an LIS, but the replacements can mix values from different subsequences. Do not print tails.</p>",
    },
  ],
  grid: {
    corner: "",
    rowHeads: [ "a", "dp" ],
    colHeads: [ "0", "1", "2", "3", "4", "5" ],
  },
  vars: [ "i", "best j", "dp[i]" ],
  frames: [
    {
      note: "a = [10, 9, 2, 5, 3, 7]. Each singleton starts at length 1.",
      cells: [
        {
          r: 0,
          c: 0,
          val: "10",
        },
        {
          r: 0,
          c: 1,
          val: "9",
        },
        {
          r: 0,
          c: 2,
          val: "2",
        },
        {
          r: 0,
          c: 3,
          val: "5",
        },
        {
          r: 0,
          c: 4,
          val: "3",
        },
        {
          r: 0,
          c: 5,
          val: "7",
        },
        {
          r: 1,
          c: 0,
          val: "1",
          cls: "answer",
        },
      ],
      values: {
        i: 0,
        "best j": "—",
        "dp[i]": 1,
      },
    },
    {
      note: "i=1, a=9. 10 is not < 9. dp[1]=1.",
      cells: [
        {
          r: 1,
          c: 1,
          val: "1",
          cls: "target",
        },
        {
          r: 1,
          c: 0,
          val: "1",
          cls: "from",
        },
      ],
      values: {
        i: 1,
        "best j": "none",
        "dp[i]": 1,
      },
    },
    {
      note: "i=2, a=2. Nobody is smaller. dp[2]=1.",
      cells: [
        {
          r: 1,
          c: 2,
          val: "1",
          cls: "target",
        },
      ],
      values: {
        i: 2,
        "best j": "none",
        "dp[i]": 1,
      },
    },
    {
      note: "i=3, a=5. j=2 (2<5) wins. dp[3]=2. Target 3, from 2.",
      cells: [
        {
          r: 1,
          c: 3,
          val: "2",
          cls: "target",
        },
        {
          r: 1,
          c: 2,
          val: "1",
          cls: "from",
        },
      ],
      values: {
        i: 3,
        "best j": 2,
        "dp[i]": 2,
      },
    },
    {
      note: "i=4, a=3. j=2 (2<3) wins. dp[4]=2.",
      cells: [
        {
          r: 1,
          c: 4,
          val: "2",
          cls: "target",
        },
        {
          r: 1,
          c: 2,
          val: "1",
          cls: "from",
        },
      ],
      values: {
        i: 4,
        "best j": 2,
        "dp[i]": 2,
      },
    },
    {
      note: "i=5, a=7. j=3 (dp=2) and j=4 (dp=2) both legal. dp[5]=3.",
      cells: [
        {
          r: 1,
          c: 5,
          val: "3",
          cls: "target",
        },
        {
          r: 1,
          c: 3,
          val: "2",
          cls: "from",
        },
        {
          r: 1,
          c: 4,
          val: "2",
          cls: "from",
        },
      ],
      values: {
        i: 5,
        "best j": "3 or 4",
        "dp[i]": 3,
      },
    },
    {
      note: "max dp = 3. One LIS: indices 2,3,5 = 2,5,7.",
      cells: [
        {
          r: 1,
          c: 5,
          val: "3",
          cls: "answer",
        },
        {
          r: 0,
          c: 2,
          val: "2",
          cls: "from",
        },
        {
          r: 0,
          c: 3,
          val: "5",
          cls: "from",
        },
        {
          r: 0,
          c: 5,
          val: "7",
          cls: "target",
        },
      ],
      values: {
        i: "LIS",
        "best j": "2-3-5",
        "dp[i]": 3,
      },
    },
  ],
  vizTitle: "O(n²) dp[i] on [10, 9, 2, 5, 3, 7]",
  vizIntro: "One row of lengths ending at each index. When we sit on i, from cells are the legal j's we consider; target is i.",
  vizCaption: "Answer 3, e.g. 2,5,7 or 2,3,7. Index 5 (value 7) reads the 2 at i=2 and i=4.",
  mermaid: "flowchart TD\n  q([\"longest monotone subsequence\"]) --> nsize{\"how big is n?\"}\n  nsize -- \"n <= 2000 or need sequence cheaply\" --> n2[\"dp[i] ending at i, O(n squared)\"]\n  nsize -- \"n <= 1e5, length only\" --> nlog[\"tails + lower_bound\"]\n  n2 --> rec[\"parent[i] = best j, walk back\"]\n  nlog --> rec2[\"optional: store pred at each append/replace\"]\n  nsize -- \"bitonic\" --> bit[\"LIS left + LDS right\"]",
  merTitle: "n² or n log n?",
  merCaption: "Need the sequence? Prefer n² or extra parent bookkeeping on tails.",
  steps: [
    "<strong>Decide length-only vs sequence, and n vs 2000.</strong>",
    "<strong>n&sup2;:</strong> dp[i]=1, for j &lt; i if a[j] &lt; a[i] and dp[j]+1 &gt; dp[i], update and set parent.",
    "<strong>Answer</strong> is max(dp); reconstruct from the argmax via parent.",
    "<strong>n log n:</strong> int[] tails, size t = 0.",
    "<strong>For each x:</strong> lower_bound first index with tails[i] &ge; x (strict). Replace or append.",
    "<strong>Return t.</strong> Do not print tails as the sequence.",
    "<strong>Non-decreasing:</strong> lower_bound first tail &gt; x (upper bound).",
  ],
  dryIntro: "Patience tails on [10, 9, 2, 5, 3, 7]. lower_bound on first tail ≥ x.",
  dryCols: [ "x", "tails before", "action", "tails after", "len" ],
  dryRows: [
    {
      cells: [ "10", "[]", "append", "[10]", "1" ],
      action: "First pile.",
    },
    {
      cells: [ "9", "[10]", "replace 10", "[9]", "1" ],
      action: "Smaller tail.",
      change: true,
    },
    {
      cells: [ "2", "[9]", "replace 9", "[2]", "1" ],
      action: "",
    },
    {
      cells: [ "5", "[2]", "append", "[2, 5]", "2" ],
      action: "New length.",
      change: true,
    },
    {
      cells: [ "3", "[2, 5]", "replace 5", "[2, 3]", "2" ],
      action: "Better tail of len 2.",
    },
    {
      cells: [ "7", "[2, 3]", "append", "[2, 3, 7]", "3" ],
      action: "Answer 3.",
      change: true,
    },
  ],
  code: [
    {
      tab: "Recursion",
      file: "LisRec.java",
      code: "public class LisRec {\n\n    static int lis(int[] a, int i) {\n        int best = 1;\n        for (int j = i + 1; j < a.length; j++) {\n            if (a[j] > a[i]) {\n                best = Math.max(best, 1 + lis(a, j));\n            }\n        }\n        return best;\n    }\n\n    static int lis(int[] a) {\n        int ans = 0;\n        for (int i = 0; i < a.length; i++) {\n            ans = Math.max(ans, lis(a, i));\n        }\n        return ans;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(lis(new int[] {10, 9, 2, 5, 3, 7}));\n    }\n    // Input : [10, 9, 2, 5, 3, 7]\n    // Output: 3\n}",
    },
    {
      tab: "Memo / n²",
      file: "LisN2.java",
      code: "public class LisN2 {\n\n    static int lis(int[] a) {\n        int n = a.length, ans = 1;\n        int[] dp = new int[n];\n        for (int i = 0; i < n; i++) {\n            dp[i] = 1;\n            for (int j = 0; j < i; j++) {\n                if (a[j] < a[i] && dp[j] + 1 > dp[i]) {\n                    dp[i] = dp[j] + 1;\n                }\n            }\n            ans = Math.max(ans, dp[i]);\n        }\n        return ans;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(lis(new int[] {10, 9, 2, 5, 3, 7}));\n    }\n    // Input : [10, 9, 2, 5, 3, 7]\n    // Output: 3\n}",
    },
    {
      tab: "Tabulated n log n",
      file: "LisNlogN.java",
      code: "public class LisNlogN {\n\n    static int lowerBound(int[] t, int hi, int x) {\n        int lo = 0;\n        while (lo < hi) {\n            int mid = lo + (hi - lo) / 2;\n            if (t[mid] >= x) {\n                hi = mid;\n            } else {\n                lo = mid + 1;\n            }\n        }\n        return lo;\n    }\n\n    static int lis(int[] a) {\n        int[] tails = new int[a.length];\n        int t = 0;\n        for (int x : a) {\n            int i = lowerBound(tails, t, x);\n            tails[i] = x;\n            if (i == t) {\n                t++;\n            }\n        }\n        return t;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(lis(new int[] {10, 9, 2, 5, 3, 7}));\n    }\n    // Input : [10, 9, 2, 5, 3, 7]\n    // Output: 3\n}",
    },
  ],
  complexity: {
    time: "O(n²) or O(n log n)",
    space: "O(n)",
    derivation: [
      "<p>Ending-at-i tries every pair (j, i):</p>",
      "<span class=\"eq\">T = &Theta;(n&sup2;)</span>",
      "<p>Each of n values does one binary search on a tails array of size at most n:</p>",
      "<span class=\"eq\">T = &Theta;(n log n)</span>",
    ],
    compare: [
      [ "n² ending-at-i", "O(n²)", "O(n)", "n≤2000, easy reconstruct" ],
      [ "Patience tails", "O(n log n)", "O(n)", "Length only, n=1e5" ],
      [ "Fenwick / segtree on values", "O(n log V)", "O(V)", "Also reconstructable" ],
      [ "LCS with sorted unique", "O(n²)", "O(n²)", "Slower equivalent" ],
    ],
  },
  pitfalls: [
    {
      title: "Printing tails as the LIS",
      bug: "Tails mixes values from different subsequences after replacements.",
      fix: "parent / predecessor per index, walk from the last append that grew the length.",
    },
    {
      title: "Wrong bound for non-decreasing",
      bug: "Using ≥ when equals are allowed. Equal values replace instead of extend.",
      fix: "Strict: first tail ≥ x. Non-decreasing: first tail &gt; x.",
    },
    {
      title: "LIS vs subarray",
      bug: "A one-pass \"longest run of increases\" on a problem that allows gaps.",
      fix: "Subsequence may skip. If the problem says contiguous, it is not this page.",
    },
    {
      title: "n² at n = 1e5",
      bug: "10^10 operations. TLE, not WA.",
      fix: "Tails or a Fenwick of max dp by compressed value.",
    },
    {
      title: "Envelopes without a tie-break sort",
      bug: "Same-width envelopes nest in the LIS of heights. They should not.",
      fix: "Sort width ascending, height descending on ties, then LIS on height.",
    },
    {
      title: "Empty array",
      bug: "max of an empty dp, or tails length 0 vs 1.",
      fix: "n == 0 → 0. n == 1 → 1.",
    },
  ],
  variants: [
    [
      "Longest decreasing",
      "Negate a[], or flip < to >.",
      "Same tails with reversed compare",
      "Bitonic left half",
    ],
    [
      "Longest bitonic",
      "lis[i] + lds[i] - 1, max over i.",
      "Two n² (or two n log n) passes",
      "GfG classic",
    ],
    [ "Russian doll envelopes", "Sort (w, -h), LIS on h.", "LC 354", "Tie-break is mandatory" ],
    [
      "Minimum deletions to sort",
      "n - LIS. Delete what is not on some LIS.",
      "Same length algorithm",
      "Interview wording",
    ],
  ],
  followups: [
    [
      "Why is tails increasing?",
      "<p>If tails[k] &le; tails[k-1], the longer sequence would have a smaller-or-equal tail and would have replaced the shorter one. The construction maintains a strictly increasing tails.</p>",
    ],
    [
      "How do I reconstruct with tails?",
      "<p>Store, for each index i, the length assigned and a predecessor index that had length-1 when you placed i. Then walk from any index that received the maximum length. Several extra arrays, still O(n log n).</p>",
    ],
    [
      "Fenwick LIS?",
      "<p>Compress values. Fenwick stores max dp among values &lt; a[i]. Query, then update a[i] with that max+1. Same n log n, and reconstruction is natural via parent.</p>",
    ],
    [
      "Does LCS(a, sort(a)) equal LIS?",
      "<p>For strictly increasing, sort unique first or LCS can pick duplicates. It is O(n²) and a useful check, not an algorithm you submit at n = 1e5.</p>",
    ],
  ],
  problems: [
    {
      name: "Longest Increasing Subsequence",
      url: "https://leetcode.com/problems/longest-increasing-subsequence/",
      badge: "lc",
      tag: "LC 300",
      level: "Medium",
      pattern: "Length, n log n expected",
    },
    {
      name: "Largest Divisible Subset",
      url: "https://leetcode.com/problems/largest-divisible-subset/",
      badge: "lc",
      tag: "LC 368",
      level: "Medium",
      pattern: "Sort, then LIS with a[i]%a[j]==0",
    },
    {
      name: "Russian Doll Envelopes",
      url: "https://leetcode.com/problems/russian-doll-envelopes/",
      badge: "lc",
      tag: "LC 354",
      level: "Hard",
      pattern: "Sort + LIS, tie-break heights",
    },
    {
      name: "Number of Longest Increasing Subsequence",
      url: "https://leetcode.com/problems/number-of-longest-increasing-subsequence/",
      badge: "lc",
      tag: "LC 673",
      level: "Medium",
      pattern: "dp + cnt ending at i",
    },
    {
      name: "Maximum Length of Pair Chain",
      url: "https://leetcode.com/problems/maximum-length-of-pair-chain/",
      badge: "lc",
      tag: "LC 646",
      level: "Medium",
      pattern: "Greedy also works; LIS after sort",
    },
    {
      name: "Longest Increasing Subsequence",
      url: "https://atcoder.jp/contests/dp/tasks/dp_q",
      badge: "atc",
      tag: "ATC DP-Q",
      level: "Medium",
      pattern: "Weighted LIS, Fenwick",
    },
    {
      name: "LIS",
      url: "https://www.geeksforgeeks.org/problems/longest-increasing-subsequence-1587115620/1",
      badge: "gfg",
      tag: "GfG",
      level: "Medium",
      pattern: "Implement length",
    },
    {
      name: "Nested Segments",
      url: "https://codeforces.com/problemset/problem/652/D",
      badge: "cf",
      tag: "CF 652D",
      level: "Medium",
      pattern: "Sort + Fenwick, LIS cousin",
    },
    {
      name: "LCS on Permutations",
      url: "https://codeforces.com/problemset/problem/10/D",
      badge: "cf",
      tag: "CF 10D",
      level: "Hard",
      pattern: "LCS of two perms = LIS after remap",
    },
    {
      name: "CSES Increasing Subsequence",
      url: "https://cses.fi/problemset/task/1145",
      badge: "gfg",
      tag: "CSES",
      level: "Medium",
      pattern: "n=2e5, tails required",
    },
  ],
  spoilers: [
    {
      summary: "Hint for LC 354",
      body: "<p>Sort by width ascending. On equal width, height descending so two equal widths cannot form an increasing height pair in the later LIS. Then patience LIS on heights. n = 1e5, so n² dies.</p>",
    },
    {
      summary: "Hint for AtCoder DP-Q Flowers",
      body: "<p>Weighted LIS: max sum of beauties with increasing heights. Fenwick or segtree on height: query max dp among height &lt; h[i], add beauty[i], update. Compress heights. long.</p>",
    },
  ],
  recap: [
    "<strong>dp[i] = LIS ending at i</strong>, O(n&sup2;), easy parent.",
    "<strong>tails[k] = smallest tail of length k+1</strong>, O(n log n) length.",
    "<strong>Do not print tails.</strong> Reconstruct with parent.",
    "<strong>Strict vs non-decreasing is the bound</strong> (≥ vs &gt;).",
    "<strong>Envelopes: sort one axis, LIS the other, tie-break.</strong>",
  ],
  oneliner: "n2: max dp[j]+1 for a[j]<a[i] | nlog: tails lower_bound replace/append | tails != LIS",
}),

pack({
  id: "grid-dp",
  difficulty: "Easy",
  readTime: "24 min",
  tagline: "A grid that only moves down and right is already a DAG &mdash; <code>dp[r][c]</code> reads the cell above and the cell to the left.",
  tags: [ "grid", "unique paths", "min path", "P0" ],
  prereqs: [
    [ "DP Foundations", "dp-foundations.html" ],
    [
      "Topological Sort &amp; DAG DP",
      "../07-graphs-core/topological-sort-and-dag-dp.html",
    ],
  ],
  why: [
    "Unique paths, minimum path sum, dungeon game, falling path, and cherry pickup all share one picture: a cell's answer is a combine of a constant number of incoming cells. Because you cannot move up or left (or you process layers so that you never need to), the dependency is a DAG and a double loop in row-major order is a topo scan.",
    "This is the most visual DP. The table is the grid. The from cells are the legal predecessors. If you can fill a 3&times;3 unique-paths table by hand, you can write every problem on this page.",
    "Obstacles are just cells you skip (leave at 0 ways / +inf cost). Space-opt rolls the previous row into one array. The hard variants add a second robot or a third dimension (remaining health, remaining cherries) &mdash; same grid, thicker state.",
  ],
  insight: "dp[r][c] = combine(dp[r-1][c], dp[r][c-1]) plus whatever the cell itself contributes. Row-major (or diagonal) order writes every from-cell first.",
  yes: [
    "Paths on a grid with only down/right (or 4-way with a decreasing rank)",
    "Unique paths, min/max path sum, dungeon game, falling path sum",
    "Obstacles that block a cell",
    "Two tokens moving on the same grid (cherry pickup): add a dimension",
    "R, C ≤ 200 so R*C*extra fits",
  ],
  no: [
    "4-way movement with no decreasing rank and you want a shortest unweighted path → BFS",
    "Weighted 4-way shortest path → Dijkstra, not a simple double loop",
    "You must visit every cell → Hamiltonian, not grid DP",
    "The \"grid\" is a matrix chain / interval → interval DP",
  ],
  table: [
    [ "Unique paths, empty grid", "ways += from up and left", "LC 62" ],
    [ "Obstacles", "blocked cell stays 0 / skip", "LC 63" ],
    [ "Min path sum", "cell + min(up, left)", "LC 64" ],
    [ "Falling path (any col in next row)", "min of 3 parents above", "LC 931" ],
    [ "Dungeon / health", "work backwards from the exit", "LC 174" ],
    [ "Two people pick cherries", "dp[r1][c1][r2] (c2 implied)", "LC 741" ],
    [
      "<strong>Confused with:</strong> BFS on a maze",
      "BFS is shortest hops with 4-way and walls",
      "Grid DP is for path-aggregates on a DAG of moves",
    ],
  ],
  constraint: "<code>R, C &le; 200</code> is the usual. O(RC) time, O(C) space after rolling. Extra dimensions (k, second robot) must still fit 1e7..1e8 cells. Ways need long / modulus.",
  coreHeading: "One cell, two parents",
  core: [
    "Unique paths on an empty R&times;C grid: dp[0][*] = dp[*][0] = 1, then dp[r][c] = dp[r-1][c] + dp[r][c-1]. That is the dry run. With an obstacle, that cell is 0 and contributes nothing to its children.",
    "Min path sum: dp[r][c] = a[r][c] + min(up, left), with the first row/col being prefix sums (only one parent). Dungeon game is the same DAG run backwards: you need enough health to enter a cell and still survive the later min-requirement. Rolling: dp[c] += dp[c-1] for unique paths (the old dp[c] is \"up\", dp[c-1] is \"left\" already updated). Order inside the row is left-to-right so left is new and up is old &mdash; the 0/1-knapsack direction trick in costume.",
  ],
  invariant: "<p>After processing (r, c), <code>dp[r][c]</code> is the aggregate (ways, min sum, min required health) over all legal paths from the start (or to the exit, if you ran backwards) that end at this cell.</p><span class=\"eq\">dp[r][c] = dp[r-1][c] + dp[r][c-1]</span>",
  extra: [
    {
      kind: "tip",
      title: "First row and first column are prefix-only",
      html: "<p>They have one parent. Initialise them as a running sum / running product of ways (0 after the first obstacle). Forgetting this is the usual off-by-one.</p>",
    },
    {
      kind: "warn",
      title: "Cherry pickup is not two independent paths",
      html: "<p>Two robots on the same grid share the cherries. State must remember both positions (and usually the step, or use r1+c1=r2+c2 to drop a coordinate). Adding two independent unique-path answers double-counts cells both visit.</p>",
    },
  ],
  grid: {
    corner: "r\\c",
    rowHeads: [ "0", "1", "2" ],
    colHeads: [ "0", "1", "2" ],
  },
  vars: [ "r,c", "from", "ways" ],
  frames: [
    {
      note: "Start (0,0) has 1 empty path. First row and first col are all 1s: only one way along the border.",
      cells: [
        {
          r: 0,
          c: 0,
          val: "1",
          cls: "answer",
        },
        {
          r: 0,
          c: 1,
          val: "1",
        },
        {
          r: 0,
          c: 2,
          val: "1",
        },
        {
          r: 1,
          c: 0,
          val: "1",
        },
        {
          r: 2,
          c: 0,
          val: "1",
        },
      ],
      values: {
        "r,c": "border",
        from: "one parent",
        ways: 1,
      },
    },
    {
      note: "(1,1): from up=1 and left=1. Write 2.",
      cells: [
        {
          r: 1,
          c: 1,
          val: "2",
          cls: "target",
        },
        {
          r: 0,
          c: 1,
          val: "1",
          cls: "from",
        },
        {
          r: 1,
          c: 0,
          val: "1",
          cls: "from",
        },
      ],
      values: {
        "r,c": "1,1",
        from: "up+left",
        ways: 2,
      },
    },
    {
      note: "(1,2): from up=1 and left=2. Write 3.",
      cells: [
        {
          r: 1,
          c: 2,
          val: "3",
          cls: "target",
        },
        {
          r: 0,
          c: 2,
          val: "1",
          cls: "from",
        },
        {
          r: 1,
          c: 1,
          val: "2",
          cls: "from",
        },
      ],
      values: {
        "r,c": "1,2",
        from: "up+left",
        ways: 3,
      },
    },
    {
      note: "(2,1): from up=2 and left=1. Write 3.",
      cells: [
        {
          r: 2,
          c: 1,
          val: "3",
          cls: "target",
        },
        {
          r: 1,
          c: 1,
          val: "2",
          cls: "from",
        },
        {
          r: 2,
          c: 0,
          val: "1",
          cls: "from",
        },
      ],
      values: {
        "r,c": "2,1",
        from: "up+left",
        ways: 3,
      },
    },
    {
      note: "(2,2): from up=3 and left=3. Write 6. That is the answer.",
      cells: [
        {
          r: 2,
          c: 2,
          val: "6",
          cls: "target",
        },
        {
          r: 1,
          c: 2,
          val: "3",
          cls: "from",
        },
        {
          r: 2,
          c: 1,
          val: "3",
          cls: "from",
        },
      ],
      values: {
        "r,c": "2,2",
        from: "3+3",
        ways: 6,
      },
    },
    {
      note: "Full table. Every interior cell is the sum of the two from-cells.",
      cells: [
        {
          r: 0,
          c: 0,
          val: "1",
        },
        {
          r: 0,
          c: 1,
          val: "1",
        },
        {
          r: 0,
          c: 2,
          val: "1",
        },
        {
          r: 1,
          c: 0,
          val: "1",
        },
        {
          r: 1,
          c: 1,
          val: "2",
        },
        {
          r: 1,
          c: 2,
          val: "3",
        },
        {
          r: 2,
          c: 0,
          val: "1",
        },
        {
          r: 2,
          c: 1,
          val: "3",
        },
        {
          r: 2,
          c: 2,
          val: "6",
          cls: "answer",
        },
      ],
      values: {
        "r,c": "done",
        from: "—",
        ways: 6,
      },
    },
    {
      note: "Space-opt: one array [1,1,1] then [1,2,3] then [1,3,6]. Left-to-right, old value is up.",
      cells: [
        {
          r: 2,
          c: 0,
          val: "1",
          cls: "from",
        },
        {
          r: 2,
          c: 1,
          val: "3",
          cls: "from",
        },
        {
          r: 2,
          c: 2,
          val: "6",
          cls: "target",
        },
      ],
      values: {
        "r,c": "roll",
        from: "1 row",
        ways: 6,
      },
    },
  ],
  vizTitle: "Unique paths on a 3&times;3 grid",
  vizIntro: "Each cell is ways to reach it from (0,0) moving only right or down. Target is the cell we write; from is up and left.",
  vizCaption: "Answer 6. The centre 2 is 1+1; the exit 6 is 3+3. This is the table you should be able to rebuild on a whiteboard in thirty seconds.",
  mermaid: "graph TD\n  a00[\"0,0  ways 1\"] --> a01[\"0,1  ways 1\"]\n  a00 --> a10[\"1,0  ways 1\"]\n  a01 --> a11[\"1,1  ways 2\"]\n  a10 --> a11",
  merTitle: "The DAG of a 2&times;2 grid",
  merCaption: "Every edge goes down or right. Row-major is a topo order. No mermaid node named end.",
  steps: [
    "<strong>Confirm the move set is a DAG</strong> (down/right, or falling down a row).",
    "<strong>Allocate dp[R][C]</strong> (or one row).",
    "<strong>Base:</strong> start cell 1 (ways) or a[0][0] (cost). Fill first row and first col from their single parent.",
    "<strong>For r = 1..R-1, for c = 1..C-1:</strong> combine up and left (and the cell).",
    "<strong>Obstacles:</strong> write 0 / skip / +inf and do not feed children.",
    "<strong>Roll</strong> into one array of length C if you do not need the table.",
    "<strong>Read dp[R-1][C-1].</strong> Backwards problems (dungeon) start at the exit.",
  ],
  dryIntro: "Unique paths, 3&times;3, no obstacles.",
  dryCols: [ "r,c", "up", "left", "dp", "note" ],
  dryRows: [
    {
      cells: [ "0,0", "—", "—", "1", "start" ],
      action: "Base.",
    },
    {
      cells: [ "0,1 / 0,2", "—", "1", "1", "first row" ],
      action: "",
    },
    {
      cells: [ "1,0 / 2,0", "1", "—", "1", "first col" ],
      action: "",
    },
    {
      cells: [ "1,1", "1", "1", "2", "first interior" ],
      action: "from both.",
      change: true,
    },
    {
      cells: [ "1,2", "1", "2", "3", "" ],
      action: "",
    },
    {
      cells: [ "2,1", "2", "1", "3", "" ],
      action: "",
    },
    {
      cells: [ "2,2", "3", "3", "6", "answer" ],
      action: "6 paths.",
      change: true,
    },
  ],
  code: [
    {
      tab: "Recursion",
      file: "PathsRec.java",
      code: "public class PathsRec {\n\n    static int ways(int r, int c, int R, int C) {\n        if (r >= R || c >= C) {\n            return 0;\n        }\n        if (r == R - 1 && c == C - 1) {\n            return 1;\n        }\n        return ways(r + 1, c, R, C) + ways(r, c + 1, R, C);\n    }\n\n    public static void main(String[] args) {\n        System.out.println(ways(0, 0, 3, 3));\n    }\n    // Input : 3 x 3\n    // Output: 6\n}",
    },
    {
      tab: "Memo",
      file: "PathsMemo.java",
      code: "import java.util.Arrays;\n\npublic class PathsMemo {\n\n    static int ways(int r, int c, int R, int C, int[][] memo) {\n        if (r >= R || c >= C) {\n            return 0;\n        }\n        if (r == R - 1 && c == C - 1) {\n            return 1;\n        }\n        if (memo[r][c] != -1) {\n            return memo[r][c];\n        }\n        return memo[r][c] = ways(r + 1, c, R, C, memo) + ways(r, c + 1, R, C, memo);\n    }\n\n    public static void main(String[] args) {\n        int[][] memo = new int[3][3];\n        for (int[] row : memo) {\n            Arrays.fill(row, -1);\n        }\n        System.out.println(ways(0, 0, 3, 3, memo));\n    }\n    // Input : 3 x 3\n    // Output: 6\n}",
    },
    {
      tab: "Tabulated",
      file: "PathsTab.java",
      code: "public class PathsTab {\n\n    static int uniquePaths(int R, int C) {\n        int[][] dp = new int[R][C];\n        for (int r = 0; r < R; r++) {\n            dp[r][0] = 1;\n        }\n        for (int c = 0; c < C; c++) {\n            dp[0][c] = 1;\n        }\n        for (int r = 1; r < R; r++) {\n            for (int c = 1; c < C; c++) {\n                dp[r][c] = dp[r - 1][c] + dp[r][c - 1];\n            }\n        }\n        return dp[R - 1][C - 1];\n    }\n\n    public static void main(String[] args) {\n        System.out.println(uniquePaths(3, 3));\n    }\n    // Input : 3 x 3\n    // Output: 6\n}",
    },
    {
      tab: "Space-opt",
      file: "PathsRoll.java",
      code: "import java.util.Arrays;\n\npublic class PathsRoll {\n\n    static int uniquePaths(int R, int C) {\n        int[] dp = new int[C];\n        Arrays.fill(dp, 1);\n        for (int r = 1; r < R; r++) {\n            for (int c = 1; c < C; c++) {\n                dp[c] += dp[c - 1];\n            }\n        }\n        return dp[C - 1];\n    }\n\n    public static void main(String[] args) {\n        System.out.println(uniquePaths(3, 3));\n    }\n    // Input : 3 x 3\n    // Output: 6\n}",
    },
  ],
  complexity: {
    time: "O(R C)",
    space: "O(C) rolled; O(R C) table",
    derivation: [
      "<p>One constant-time combine per cell:</p>",
      "<span class=\"eq\">T = &Theta;(R C)</span>",
      "<p>Unique paths without obstacles is also a binomial <code>C(R+C-2, R-1)</code>, computable in O(R) multiplications if you only need the empty-grid count.</p>",
    ],
    compare: [
      [ "Unique / min path", "O(RC)", "O(C)", "This page" ],
      [ "Binomial closed form", "O(R+C)", "O(1)", "Empty grid, ways only" ],
      [ "4-way shortest hops", "O(RC)", "O(RC)", "BFS, not DP" ],
      [ "Cherry pickup", "O(R C min(R,C))", "O(R C min)", "Third coordinate" ],
    ],
  },
  pitfalls: [
    {
      title: "Not initialising the first row/col",
      bug: "Interior formula reads 0 from an unfilled border and the whole table stays 0.",
      fix: "Set the start, then walk the first row using only left, first col using only up.",
    },
    {
      title: "Obstacle on the start or the exit",
      bug: "Returning 1 or a[0][0] anyway.",
      fix: "If either is blocked, ways = 0 / min-path is impossible.",
    },
    {
      title: "Rolling right-to-left for unique paths",
      bug: "dp[c-1] would be the old row's left, not the new left. You mix two rows wrong.",
      fix: "Left-to-right: old dp[c] is up, new dp[c-1] is left.",
    },
    {
      title: "int overflow on ways",
      bug: "C(38, 18) already exceeds int. LC 62 is within int; CF often is not.",
      fix: "long, or the modulus.",
    },
    {
      title: "Dungeon game run forwards",
      bug: "Min health is not a min-sum. A deep negative late cell cannot be prepaid from an early surplus in the naive forwards rec.",
      fix: "dp[r][c] = min health needed from here to the exit. Work from the exit backward.",
    },
    {
      title: "Two independent min-path sums for two robots",
      bug: "Shared cells counted twice.",
      fix: "One state that holds both positions (or one position plus the step).",
    },
  ],
  variants: [
    [
      "Min path sum",
      "dp = a[r][c] + min(up, left). First row/col are prefix sums.",
      "LC 64",
      "Same loops, min instead of +",
    ],
    [
      "Obstacles",
      "If grid[r][c] is blocked, dp = 0 and do not add into it.",
      "LC 63",
      "Zero the cell, continue",
    ],
    [
      "Falling path",
      "From row r, parents are (r-1, c-1), (r-1,c), (r-1,c+1).",
      "LC 931",
      "Still a DAG, down only",
    ],
    [
      "Dungeon / backwards",
      "Need = max(1, laterNeed - a[r][c]). Start at exit.",
      "LC 174",
      "Reverse topo",
    ],
  ],
  followups: [
    [
      "When is the binomial enough?",
      "<p>Empty rectangle, only down/right, count of paths: C(R+C-2, R-1). Obstacles, min cost, or extra state kill the closed form. Use it as a check on the empty table.</p>",
    ],
    [
      "Can I grid-DP a 4-way maze?",
      "<p>Only if you add a rank that strictly decreases (remaining health, remaining steps, a bitset of visited &mdash; the last is exponential). Plain 4-way shortest path is BFS/Dijkstra. A naive 4-way \"dp[r][c] = min of four neighbours\" is a cyclic system, not a DAG.</p>",
    ],
    [
      "How does cherry pickup drop a coordinate?",
      "<p>After t steps, r+c = t for each robot. So r1+c1 = r2+c2, and c2 = r1+c1-r2. The state (t, r1, r2) or (r1, c1, r2) is enough. That is what keeps it O(n^3).</p>",
    ],
    [
      "Rolling two rows vs one?",
      "<p>Falling path needs the previous row intact while you write the next (three parents in the same old row). Keep two rows, or write into a fresh array. Unique paths can overwrite in place left-to-right.</p>",
    ],
  ],
  problems: [
    {
      name: "Unique Paths",
      url: "https://leetcode.com/problems/unique-paths/",
      badge: "lc",
      tag: "LC 62",
      level: "Medium",
      pattern: "The dry-run problem",
    },
    {
      name: "Unique Paths II",
      url: "https://leetcode.com/problems/unique-paths-ii/",
      badge: "lc",
      tag: "LC 63",
      level: "Medium",
      pattern: "Obstacles zero a cell",
    },
    {
      name: "Minimum Path Sum",
      url: "https://leetcode.com/problems/minimum-path-sum/",
      badge: "lc",
      tag: "LC 64",
      level: "Medium",
      pattern: "cell + min(up,left)",
    },
    {
      name: "Triangle",
      url: "https://leetcode.com/problems/triangle/",
      badge: "lc",
      tag: "LC 120",
      level: "Medium",
      pattern: "Falling path on a triangle",
    },
    {
      name: "Dungeon Game",
      url: "https://leetcode.com/problems/dungeon-game/",
      badge: "lc",
      tag: "LC 174",
      level: "Hard",
      pattern: "Backwards min-health",
    },
    {
      name: "Cherry Pickup",
      url: "https://leetcode.com/problems/cherry-pickup/",
      badge: "lc",
      tag: "LC 741",
      level: "Hard",
      pattern: "Two robots, 3D state",
    },
    {
      name: "Grid 1",
      url: "https://atcoder.jp/contests/dp/tasks/dp_h",
      badge: "atc",
      tag: "ATC DP-H",
      level: "Easy",
      pattern: "Unique paths + obstacles, mod",
    },
    {
      name: "Minimum path in a grid",
      url: "https://www.geeksforgeeks.org/problems/path-in-matrix3805/1",
      badge: "gfg",
      tag: "GfG",
      level: "Medium",
      pattern: "Falling max/min",
    },
    {
      name: "Two Routes",
      url: "https://codeforces.com/problemset/problem/601/A",
      badge: "cf",
      tag: "CF 601A",
      level: "Medium",
      pattern: "Graph, not grid — contrast; see 407B",
    },
    {
      name: "Long Path",
      url: "https://codeforces.com/problemset/problem/407/B",
      badge: "cf",
      tag: "CF 407B",
      level: "Medium",
      pattern: "1D/grid-like ways with portals, mod",
    },
  ],
  spoilers: [
    {
      summary: "Hint for LC 174 Dungeon Game",
      body: "<p>dp[r][c] = min health you must have <em>on entry</em> to survive from here to the princess. From the exit, need max(1, 1 - a[R-1][C-1]). Then dp[r][c] = max(1, min(dp[r+1][c], dp[r][c+1]) - a[r][c]). Forwards min-sum is a different (wrong) problem.</p>",
    },
    {
      summary: "Hint for LC 741 Cherry Pickup",
      body: "<p>Two paths of n-1 down/right steps. State (r1, c1, r2); c2 = r1+c1-r2. Add cell cherries once if the two sit on the same cell. Transition: 4 pairs of (down/right, down/right). Walk in increasing r1+c1.</p>",
    },
  ],
  recap: [
    "<strong>Down/right grids are DAGs.</strong> Row-major is the topo order.",
    "<strong>dp[r][c] combines up and left</strong> (plus the cell for costs).",
    "<strong>Obstacles write 0 / +inf</strong> and contribute nothing.",
    "<strong>Roll one row</strong> left-to-right for unique paths.",
    "<strong>4-way shortest path is BFS</strong>, not this page, unless a rank decreases.",
  ],
  oneliner: "dp[r][c] = up + left (or min + cell) | first row/col prefix | roll one row L-to-R",
}),

pack({
  id: "string-dp",
  difficulty: "Medium",
  readTime: "26 min",
  tagline: "Two indices into one or two strings: LCS, edit distance, palindrome partitions &mdash; the cell <code>(i, j)</code> is the answer for the two prefixes.",
  tags: [ "LCS", "edit distance", "palindrome", "P0" ],
  prereqs: [
    [ "Grid DP", "grid-dp.html" ],
  ],
  why: [
    "String DP is grid DP on the prefixes of one or two strings. dp[i][j] answers a question about s[0..i) and t[0..j) (or about s[i..j] for palindromes). The alphabet never appears in the state: only whether two characters match, and the three standard moves (drop s, drop t, or consume both).",
    "LCS and edit distance are the same table with a different combine. Palindrome subsequence is LCS(s, reverse(s)). Palindrome substring / min-cut is a different axis: intervals of one string, which is the bridge to the next page.",
    "n, m ≤ 1000 is the signature: O(nm) time, O(min(n,m)) space after rolling. Reconstruction of the LCS or the alignment walks the table back from (n, m).",
  ],
  insight: "If s[i-1] == t[j-1], the pair is free (or worth +1). If not, you must drop one side or substitute. Those three neighbours are the only from-cells.",
  yes: [
    "Longest common subsequence / substring of two strings",
    "Edit / Levenshtein distance, insert-delete-replace",
    "Distinct subsequences, wildcard matching, regex DP",
    "Longest palindromic subsequence = LCS with the reverse",
    "Interleaving string, wildcards, min ASCII delete sum",
  ],
  no: [
    "Longest common <em>substring</em> can also be DP, but sliding / suffix array is often intended",
    "Anagrams / character counts only → hashing, not a 2D table",
    "LIS in an array of numbers → previous page, even if you cast to a string",
    "Interval palindrome cuts with n ≤ 400 and a third loop → interval DP",
  ],
  table: [
    [ "LCS length", "match → diag+1, else max(left, up)", "LC 1143" ],
    [ "Edit distance", "match → diag, else 1+min(3 neighbours)", "LC 72" ],
    [ "Distinct subsequences", "+= from skip / take-if-match", "LC 115" ],
    [ "Wildcard matching", "boolean, '*' eats or not", "LC 44" ],
    [ "LPS", "LCS(s, reverse(s))", "LC 516" ],
    [ "Min insert to palindrome", "n - LPS", "LC 1312" ],
    [
      "<strong>Confused with:</strong> longest common substring",
      "Substring requires a contiguous match; on mismatch the length resets to 0",
      "Same table, different recurrence (diag+1 or 0)",
    ],
  ],
  constraint: "<code>n, m &le; 1000</code> → O(nm) is the intended bound. <code>n = 5000</code> still fits if you roll and watch constants. Answers fit in int for lengths; ways need long / modulus.",
  coreHeading: "Prefixes (i, j) and three neighbours",
  core: [
    "LCS: if s[i-1]==t[j-1] then dp[i][j] = dp[i-1][j-1]+1, else max(dp[i-1][j], dp[i][j-1]). First row and col are 0 (empty prefix). This is the dry-run table.",
    "Edit distance: match copies the diagonal; otherwise 1 + min(insert = left, delete = up, replace = diagonal). First row is 0..m (insert all), first col is 0..n (delete all). Rolling: keep the previous row, or even two cells if you walk carefully. Reconstruction: from (n,m), if match follow diagonal, else follow the neighbour that produced the value, emitting the operation.",
  ],
  invariant: "<p><code>dp[i][j]</code> is the LCS length (or edit distance) of the prefixes <code>s[0..i)</code> and <code>t[0..j)</code>.</p><span class=\"eq\">match: diag + 1 &nbsp;&nbsp; mismatch: max(up, left)</span>",
  extra: [
    {
      kind: "key",
      title: "Substring vs subsequence",
      html: "<p>Substring: on mismatch, dp[i][j] = 0, and the answer is the global max in the table, not dp[n][m]. Subsequence: on mismatch, you may still drop a character and keep a positive length. Mixing them is a common WA.</p>",
    },
    {
      kind: "tip",
      title: "LPS without building the reverse",
      html: "<p>dp[i][j] = LPS of s[i..j]. If s[i]==s[j], 2+dp[i+1][j-1], else max(dp[i+1][j], dp[i][j-1]). That is interval DP on one string; fill by increasing length. Same answer as LCS(s, reverse(s)).</p>",
    },
  ],
  grid: {
    corner: "s\\t",
    rowHeads: [ "\"\"", "a", "ab", "abc", "abcd", "abcde" ],
    colHeads: [ "\"\"", "a", "ac", "ace" ],
  },
  vars: [ "i,j", "chars", "dp" ],
  frames: [
    {
      note: "Row 0 and col 0 stay 0: LCS with an empty string is 0.",
      cells: [
        {
          r: 0,
          c: 0,
          val: "0",
        },
        {
          r: 0,
          c: 1,
          val: "0",
        },
        {
          r: 0,
          c: 2,
          val: "0",
        },
        {
          r: 0,
          c: 3,
          val: "0",
        },
        {
          r: 1,
          c: 0,
          val: "0",
        },
        {
          r: 2,
          c: 0,
          val: "0",
        },
        {
          r: 3,
          c: 0,
          val: "0",
        },
        {
          r: 4,
          c: 0,
          val: "0",
        },
        {
          r: 5,
          c: 0,
          val: "0",
        },
      ],
      values: {
        "i,j": "border",
        chars: "empty",
        dp: 0,
      },
    },
    {
      note: "s[0]='a' vs t[0]='a': match. diag 0+1 = 1. Target (1,1), from (0,0).",
      cells: [
        {
          r: 1,
          c: 1,
          val: "1",
          cls: "target",
        },
        {
          r: 0,
          c: 0,
          val: "0",
          cls: "from",
        },
      ],
      values: {
        "i,j": "1,1",
        chars: "a / a",
        dp: 1,
      },
    },
    {
      note: "s[1]='b' vs t[0]='a': mismatch. max(up=1, left=0) = 1.",
      cells: [
        {
          r: 2,
          c: 1,
          val: "1",
          cls: "target",
        },
        {
          r: 1,
          c: 1,
          val: "1",
          cls: "from",
        },
        {
          r: 2,
          c: 0,
          val: "0",
          cls: "from",
        },
      ],
      values: {
        "i,j": "2,1",
        chars: "b / a",
        dp: 1,
      },
    },
    {
      note: "s[2]='c' vs t[1]='c': match. diag dp[2][1]+1 = 2. Target (3,2), from (2,1).",
      cells: [
        {
          r: 3,
          c: 2,
          val: "2",
          cls: "target",
        },
        {
          r: 2,
          c: 1,
          val: "1",
          cls: "from",
        },
      ],
      values: {
        "i,j": "3,2",
        chars: "c / c",
        dp: 2,
      },
    },
    {
      note: "s[4]='e' vs t[2]='e': match. diag + 1 = 3. Target (5,3).",
      cells: [
        {
          r: 5,
          c: 3,
          val: "3",
          cls: "target",
        },
        {
          r: 4,
          c: 2,
          val: "2",
          cls: "from",
        },
      ],
      values: {
        "i,j": "5,3",
        chars: "e / e",
        dp: 3,
      },
    },
    {
      note: "dp[5][3] = 3 is the LCS length of the full strings.",
      cells: [
        {
          r: 5,
          c: 3,
          val: "3",
          cls: "answer",
        },
      ],
      values: {
        "i,j": "n,m",
        chars: "abcde / ace",
        dp: 3,
      },
    },
    {
      note: "Reconstruction walks diag on matches: (5,3)e, (3,2)c, (1,1)a — \"ace\".",
      cells: [
        {
          r: 1,
          c: 1,
          val: "1",
          cls: "from",
        },
        {
          r: 3,
          c: 2,
          val: "2",
          cls: "from",
        },
        {
          r: 5,
          c: 3,
          val: "3",
          cls: "target",
        },
      ],
      values: {
        "i,j": "path",
        chars: "a,c,e",
        dp: 3,
      },
    },
  ],
  vizTitle: "LCS of s = \"abcde\" and t = \"ace\"",
  vizIntro: "Rows are prefixes of s (empty, a, ab, abc, abcd, abcde). Columns are prefixes of t (empty, a, ac, ace). Target is the cell we write; from is diag on a match, else up and left.",
  vizCaption: "Answer 3: \"ace\". Each match walks the diagonal and adds 1. The green cell always has its from-cells already filled.",
  mermaid: "flowchart TD\n  q([\"string DP\"]) --> nstr{\"how many strings?\"}\n  nstr -- two --> kind{\"what is asked?\"}\n  kind -- \"common subsequence\" --> lcs[\"LCS: match diag+1 else max up left\"]\n  kind -- \"edit / align\" --> ed[\"edit: 1+min of three\"]\n  kind -- \"s as subsequence of t\" --> ds[\"distinct subsequences +=\"]\n  nstr -- one --> pal{\"palindrome?\"}\n  pal -- subsequence --> lps[\"LCS with reverse, or interval LPS\"]\n  pal -- substring / min cuts --> iv[\"interval DP, next page\"]",
  merTitle: "Which string table?",
  merCaption: "Two strings → LCS / edit / distinct. One string palindrome → LPS or interval.",
  steps: [
    "<strong>Index prefixes as i = 0..n, j = 0..m</strong> with 0 = empty.",
    "<strong>Base:</strong> first row and col (0 for LCS, 0..n / 0..m for edit).",
    "<strong>For i = 1..n, j = 1..m:</strong> if s[i-1]==t[j-1] take the match branch, else the mismatch branch.",
    "<strong>LCS mismatch:</strong> max(up, left). <strong>Edit mismatch:</strong> 1+min(up,left,diag).",
    "<strong>Roll</strong> the previous row if you only need the number.",
    "<strong>Reconstruct</strong> from (n,m) following the neighbour that matches the recurrence.",
    "<strong>LPS:</strong> either LCS(s, reverse(s)) or interval dp on one string.",
  ],
  dryIntro: "LCS \"abcde\" vs \"ace\". Only the interesting cells.",
  dryCols: [ "i,j", "s[i-1]", "t[j-1]", "match?", "dp[i][j]" ],
  dryRows: [
    {
      cells: [ "1,1", "a", "a", "yes", "1" ],
      action: "diag+1",
      change: true,
    },
    {
      cells: [ "2,1", "b", "a", "no", "1" ],
      action: "max(1,0)",
    },
    {
      cells: [ "3,1", "c", "a", "no", "1" ],
      action: "",
    },
    {
      cells: [ "3,2", "c", "c", "yes", "2" ],
      action: "diag+1",
      change: true,
    },
    {
      cells: [ "5,2", "e", "c", "no", "2" ],
      action: "max(up,left)",
    },
    {
      cells: [ "5,3", "e", "e", "yes", "3" ],
      action: "answer",
      change: true,
    },
  ],
  code: [
    {
      tab: "Recursion",
      file: "LcsRec.java",
      code: "public class LcsRec {\n\n    static int lcs(String s, String t, int i, int j) {\n        if (i == s.length() || j == t.length()) {\n            return 0;\n        }\n        if (s.charAt(i) == t.charAt(j)) {\n            return 1 + lcs(s, t, i + 1, j + 1);\n        }\n        return Math.max(lcs(s, t, i + 1, j), lcs(s, t, i, j + 1));\n    }\n\n    public static void main(String[] args) {\n        System.out.println(lcs(\"abcde\", \"ace\", 0, 0));\n    }\n    // Input : s=abcde t=ace\n    // Output: 3\n}",
    },
    {
      tab: "Memo",
      file: "LcsMemo.java",
      code: "import java.util.Arrays;\n\npublic class LcsMemo {\n\n    static int lcs(String s, String t, int i, int j, int[][] memo) {\n        if (i == s.length() || j == t.length()) {\n            return 0;\n        }\n        if (memo[i][j] != -1) {\n            return memo[i][j];\n        }\n        if (s.charAt(i) == t.charAt(j)) {\n            return memo[i][j] = 1 + lcs(s, t, i + 1, j + 1, memo);\n        }\n        return memo[i][j] = Math.max(lcs(s, t, i + 1, j, memo), lcs(s, t, i, j + 1, memo));\n    }\n\n    public static void main(String[] args) {\n        String s = \"abcde\", t = \"ace\";\n        int[][] memo = new int[s.length()][t.length()];\n        for (int[] row : memo) {\n            Arrays.fill(row, -1);\n        }\n        System.out.println(lcs(s, t, 0, 0, memo));\n    }\n    // Input : s=abcde t=ace\n    // Output: 3\n}",
    },
    {
      tab: "Tabulated",
      file: "LcsTab.java",
      code: "public class LcsTab {\n\n    static int lcs(String s, String t) {\n        int n = s.length(), m = t.length();\n        int[][] dp = new int[n + 1][m + 1];\n        for (int i = 1; i <= n; i++) {\n            for (int j = 1; j <= m; j++) {\n                if (s.charAt(i - 1) == t.charAt(j - 1)) {\n                    dp[i][j] = dp[i - 1][j - 1] + 1;\n                } else {\n                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);\n                }\n            }\n        }\n        return dp[n][m];\n    }\n\n    public static void main(String[] args) {\n        System.out.println(lcs(\"abcde\", \"ace\"));\n    }\n    // Input : s=abcde t=ace\n    // Output: 3\n}",
    },
    {
      tab: "Space-opt",
      file: "LcsRoll.java",
      code: "public class LcsRoll {\n\n    static int lcs(String s, String t) {\n        if (s.length() < t.length()) {\n            String tmp = s; s = t; t = tmp;\n        }\n        int[] dp = new int[t.length() + 1];\n        for (int i = 1; i <= s.length(); i++) {\n            int prev = 0;\n            for (int j = 1; j <= t.length(); j++) {\n                int tmp = dp[j];\n                if (s.charAt(i - 1) == t.charAt(j - 1)) {\n                    dp[j] = prev + 1;\n                } else {\n                    dp[j] = Math.max(dp[j], dp[j - 1]);\n                }\n                prev = tmp;\n            }\n        }\n        return dp[t.length()];\n    }\n\n    public static void main(String[] args) {\n        System.out.println(lcs(\"abcde\", \"ace\"));\n    }\n    // Input : s=abcde t=ace\n    // Output: 3\n}",
    },
  ],
  complexity: {
    time: "O(n m)",
    space: "O(min(n, m)) rolled; O(n m) for reconstruction",
    derivation: [
      "<p>A constant-time combine at every prefix pair:</p>",
      "<span class=\"eq\">T = &Theta;(n m)</span>",
    ],
    compare: [
      [ "LCS / edit", "O(nm)", "O(min(n,m))", "This page" ],
      [ "Hirschberg LCS reconstruct", "O(nm)", "O(n+m)", "Linear-space sequence" ],
      [ "LPS via reverse", "O(n²)", "O(n)", "LCS(s, rev(s))" ],
      [ "Common substring", "O(nm) DP or better suffix", "O(n)", "Reset on mismatch" ],
    ],
  },
  pitfalls: [
    {
      title: "Indexing charAt(i) against dp[i] without the empty row",
      bug: "Off-by-one: s[i] vs prefix i+1. The table is n+1 by m+1 for a reason.",
      fix: "dp[i][j] uses s.charAt(i-1) and t.charAt(j-1).",
    },
    {
      title: "LCS recurrence for substring",
      bug: "Keeping max(up,left) on a mismatch when the problem wants a contiguous block.",
      fix: "Substring: mismatch → 0, answer = max over the table.",
    },
    {
      title: "Rolling without saving the diagonal",
      bug: "dp[j] is overwritten before you need it as dp[i-1][j-1].",
      fix: "Stash prev = old dp[j] (which is up-right after you write, i.e. the old diagonal for the next j).",
    },
    {
      title: "Edit distance first row = 0",
      bug: "Inserting m characters into empty s costs m, not 0.",
      fix: "dp[0][j] = j, dp[i][0] = i.",
    },
    {
      title: "Modulo on LCS length",
      bug: "Lengths do not wrap. Ways-of-LCS do.",
      fix: "Only modulus counting problems. Lengths are int.",
    },
    {
      title: "Wildcard '*' as a single char",
      bug: "Treating '*' like '?' instead of \"empty or eat one and stay\".",
      fix: "dp[i][j] |= dp[i][j-1] (eat empty) and dp[i-1][j] (eat s[i-1], star remains).",
    },
  ],
  variants: [
    [
      "Edit distance",
      "1 + min(insert, delete, replace); match copies diag.",
      "LC 72",
      "Same table, min",
    ],
    [
      "Distinct subsequences",
      "dp[j] += dp[j-1] when s[i]==t[j], walk t backwards if rolling.",
      "LC 115",
      "Counting",
    ],
    [
      "Longest palindromic subsequence",
      "LCS(s, reverse(s)) or interval on one string.",
      "LC 516",
      "n - LPS = min deletions to palindrome",
    ],
    [
      "Shortest common supersequence",
      "n + m - LCS. Reconstruct by emitting the non-LCS chars too.",
      "LC 1092",
      "Walk the LCS table, output both sides",
    ],
  ],
  followups: [
    [
      "How do I print one LCS?",
      "<p>From (n,m): if s[i-1]==t[j-1], prepend that char and go diag. Else go to the neighbour that equals dp[i][j] (prefer up or left, your choice). Reverse at the end. Need the full table.</p>",
    ],
    [
      "Is LCS NP-hard?",
      "<p>For two strings it is O(nm). For an arbitrary number of strings it is NP-hard. That is why interviews stick to two.</p>",
    ],
    [
      "Can I do better than O(nm)?",
      "<p>Slightly, with Four-Russians or bit-parallel tricks, and Hunt-Szymanski when the LCS is short. In contests, O(nm) at n=5000 with a rolled int[] is the expected work.</p>",
    ],
    [
      "Wildcard vs regex DP?",
      "<p>'?' and '*' globbing is LC 44. Full regex with '*' meaning \"previous char, 0 or more\" is LC 10 and the star binds to the previous token, so the transition is slightly different. Both are boolean string DP.</p>",
    ],
  ],
  problems: [
    {
      name: "Longest Common Subsequence",
      url: "https://leetcode.com/problems/longest-common-subsequence/",
      badge: "lc",
      tag: "LC 1143",
      level: "Medium",
      pattern: "The dry-run problem",
    },
    {
      name: "Edit Distance",
      url: "https://leetcode.com/problems/edit-distance/",
      badge: "lc",
      tag: "LC 72",
      level: "Medium",
      pattern: "Three-way min",
    },
    {
      name: "Distinct Subsequences",
      url: "https://leetcode.com/problems/distinct-subsequences/",
      badge: "lc",
      tag: "LC 115",
      level: "Hard",
      pattern: "Counting, roll backwards",
    },
    {
      name: "Wildcard Matching",
      url: "https://leetcode.com/problems/wildcard-matching/",
      badge: "lc",
      tag: "LC 44",
      level: "Hard",
      pattern: "Boolean, star eats",
    },
    {
      name: "Regular Expression Matching",
      url: "https://leetcode.com/problems/regular-expression-matching/",
      badge: "lc",
      tag: "LC 10",
      level: "Hard",
      pattern: "Regex star on previous token",
    },
    {
      name: "Longest Palindromic Subsequence",
      url: "https://leetcode.com/problems/longest-palindromic-subsequence/",
      badge: "lc",
      tag: "LC 516",
      level: "Medium",
      pattern: "LCS with reverse",
    },
    {
      name: "LCS",
      url: "https://atcoder.jp/contests/dp/tasks/dp_f",
      badge: "atc",
      tag: "ATC DP-F",
      level: "Medium",
      pattern: "Print the string, n=3000",
    },
    {
      name: "Edit Distance",
      url: "https://www.geeksforgeeks.org/problems/edit-distance3702/1",
      badge: "gfg",
      tag: "GfG",
      level: "Medium",
      pattern: "Implement Levenshtein",
    },
    {
      name: "Two Substrings",
      url: "https://codeforces.com/problemset/problem/550/A",
      badge: "cf",
      tag: "CF 550A",
      level: "Easy",
      pattern: "Not LCS; contrast. See 10D",
    },
    {
      name: "LCS",
      url: "https://codeforces.com/problemset/problem/10/D",
      badge: "cf",
      tag: "CF 10D",
      level: "Hard",
      pattern: "Printable LCS of two sequences",
    },
  ],
  spoilers: [
    {
      summary: "Hint for AtCoder DP-F",
      body: "<p>n, m ≤ 3000, so O(nm) memory of 9e6 ints is tight but fine. Keep the full table (or prev-pointers) and walk back to emit the characters. Rolling only the values is not enough because you must reconstruct.</p>",
    },
    {
      summary: "Hint for LC 72",
      body: "<p>dp[0][j]=j, dp[i][0]=i. Match: dp[i-1][j-1]. Else 1+min(insert dp[i][j-1], delete dp[i-1][j], replace dp[i-1][j-1]). That is the entire algorithm.</p>",
    },
  ],
  recap: [
    "<strong>dp[i][j] is the answer for prefixes i and j.</strong>",
    "<strong>LCS match: diag+1; mismatch: max(up, left).</strong>",
    "<strong>Edit: match copies diag; else 1+min of three.</strong>",
    "<strong>Substring resets to 0</strong> on mismatch; subsequence does not.",
    "<strong>Roll one row</strong> if you only need the number; keep the table to reconstruct.",
  ],
  oneliner: "prefixes (i,j) | match diag+1 | else max(up,left) | edit = 1+min3 | roll + stash diag",
}),

pack({
  id: "interval-dp",
  difficulty: "Medium",
  readTime: "26 min",
  tagline: "The state is a subarray <code>s[l..r]</code>, and the last cut (or last burst, or last merge) splits it into two smaller intervals.",
  tags: [ "interval DP", "MCM", "burst balloons", "P1" ],
  prereqs: [
    [ "String DP", "string-dp.html" ],
  ],
  why: [
    "Interval DP is the family where the natural subproblem is a contiguous segment. Matrix-chain multiplication, bursting balloons, palindrome partitioning, merging stones, and \"min cost to cut a stick\" all ask: given [l, r], what is the best cost, and the last operation happens at some k in between.",
    "The order is by interval length. Length 1 is the base; a length-L interval only reads strictly shorter pieces. That is a DAG on O(n&sup2;) states with an O(n) transition, hence O(n&sup3;) &mdash; the constraint tell n ≤ 400.",
    "P1 because the modelling (what is the last action?) is the whole trick, and because you must pad sentinels for balloons / cuts. Once the recurrence is written, the loops are mechanical.",
  ],
  insight: "Name the last cut k inside [l, r]. Then dp[l][r] combines dp[l][k] and dp[k][r] with the cost of doing that last operation now.",
  yes: [
    "Min / max cost to process a subarray by repeatedly merging / bursting / cutting",
    "Matrix-chain, burst balloons, min cost to cut a stick, merging stones",
    "Palindrome partition min cuts, longest palindromic subsequence (already seen)",
    "n ≤ 400, O(n&sup3;) fits; n ≤ 100 is even more comfortable",
    "The statement talks about a last remaining element or a last cut",
  ],
  no: [
    "Non-contiguous subsets → knapsack / bitmask",
    "n = 2000 with O(n&sup3;) → you need Knuth / D&amp;C opt (later page) or a different state",
    "The \"interval\" is a sliding window with a monotone property → two pointers",
    "Only two strings' prefixes → string DP, not a third loop over k",
  ],
  table: [
    [ "Matrix chain / min multiplications", "last multiply at k", "MCM O(n³)" ],
    [ "Burst balloons", "k is the last remaining in (l, r)", "LC 312, pad 1s" ],
    [ "Cut a stick", "last cut, cost = current length", "LC 1547, pad ends" ],
    [ "Merging stones", "m-way merge, extra residue dim", "LC 1000" ],
    [ "Palindrome min cuts", "last palindromic suffix", "LC 132, often O(n²)" ],
    [ "Optimal BST", "k is the root of [l,r]", "Classic CLRS" ],
    [
      "<strong>Confused with:</strong> gap DP vs prefix DP",
      "If the two pieces after a cut must both be solved, it is interval",
      "If only a prefix remains, it is 1D",
    ],
  ],
  constraint: "<code>n &le; 400</code> is O(n&sup3;). <code>n &le; 100</code> is the comfortable balloon range. Cost products need <code>long</code>. Knuth optimisation applies when the argmin is monotone (see DP Optimisations).",
  coreHeading: "Length, then left, then the cut",
  core: [
    "Burst balloons as the running example. Pad a with 1s on both ends. dp[l][r] = max coins from bursting everything strictly between l and r, with a[l] and a[r] still alive. The last balloon burst in (l, r) is k, scoring a[l]*a[k]*a[r] plus the two solved interiors.",
    "Fill by increasing r-l. For length 1 interiors the answer is 0 (nothing to burst). The global answer is dp[0][n+1] after padding. MCM is the same loops: dp[i][j] min cost to multiply matrices i..j, last split k, cost = dp[i][k] + dp[k+1][j] + rows[i]*cols[k]*cols[j].",
  ],
  invariant: "<p><code>dp[l][r]</code> is the best cost (or coins) to finish the open interval <code>(l, r)</code> while the boundaries stay alive.</p><span class=\"eq\">dp[l][r] = max/min over k of dp[l][k] + dp[k][r] + cost(l,k,r)</span>",
  extra: [
    {
      kind: "warn",
      title: "Pad, then never burst the sentinels",
      html: "<p>Balloons and stick-cuts become uniform only after you add fake boundaries. Loops over k run from l+1 to r-1. Bursting a sentinel is a meaningless index error or a zero-score bug.</p>",
    },
    {
      kind: "math",
      title: "Why O(n&sup3;)",
      html: "<p>O(n&sup2;) pairs (l, r) and O(n) candidate k per pair. Nothing is O(n&sup2;) unless you can drop the k-loop (precomputed palindrome table, Knuth on the argmin).</p>",
    },
  ],
  grid: {
    corner: "l\\r",
    rowHeads: [ "0", "1", "2", "3" ],
    colHeads: [ "1", "2", "3", "4" ],
  },
  vars: [ "l,r", "k", "dp" ],
  frames: [
    {
      note: "Gap 1: adjacent boundaries, nothing between them. dp = 0. Not shown as numbers yet.",
      cells: [
        {
          r: 0,
          c: 0,
          val: "0",
        },
        {
          r: 1,
          c: 1,
          val: "0",
        },
        {
          r: 2,
          c: 2,
          val: "0",
        },
        {
          r: 3,
          c: 3,
          val: "0",
        },
      ],
      values: {
        "l,r": "gap 1",
        k: "—",
        dp: 0,
      },
    },
    {
      note: "(0,2): only k=1 (val 3). Coins 1*3*1 = 3. From empty interiors.",
      cells: [
        {
          r: 0,
          c: 1,
          val: "3",
          cls: "target",
        },
        {
          r: 0,
          c: 0,
          val: "0",
          cls: "from",
        },
      ],
      values: {
        "l,r": "0,2",
        k: 1,
        dp: 3,
      },
    },
    {
      note: "(1,3): k=2 (val 1). Coins 3*1*5 = 15.",
      cells: [
        {
          r: 1,
          c: 2,
          val: "15",
          cls: "target",
        },
      ],
      values: {
        "l,r": "1,3",
        k: 2,
        dp: 15,
      },
    },
    {
      note: "(2,4): k=3 (val 5). Coins 1*5*1 = 5.",
      cells: [
        {
          r: 2,
          c: 3,
          val: "5",
          cls: "target",
        },
      ],
      values: {
        "l,r": "2,4",
        k: 3,
        dp: 5,
      },
    },
    {
      note: "(0,3): k=1 or 2. k=1: 3 + 0 + 15? walk the formula. Best 30.",
      cells: [
        {
          r: 0,
          c: 2,
          val: "30",
          cls: "target",
        },
        {
          r: 0,
          c: 1,
          val: "3",
          cls: "from",
        },
        {
          r: 1,
          c: 2,
          val: "15",
          cls: "from",
        },
      ],
      values: {
        "l,r": "0,3",
        k: "1 or 2",
        dp: 30,
      },
    },
    {
      note: "(1,4) fills similarly. Then (0,4): last k=1,2,3. k=3 gives 30+0+5 + 1*5*1 wait: interiors dp[0][3]+dp[3][4] plus 1*5*1.",
      cells: [
        {
          r: 0,
          c: 3,
          val: "35",
          cls: "target",
        },
        {
          r: 0,
          c: 2,
          val: "30",
          cls: "from",
        },
        {
          r: 2,
          c: 3,
          val: "5",
          cls: "from",
        },
      ],
      values: {
        "l,r": "0,4",
        k: 3,
        dp: 35,
      },
    },
    {
      note: "dp[0][4] = 35 is the answer for the padded array. One optimal last burst is the 5.",
      cells: [
        {
          r: 0,
          c: 3,
          val: "35",
          cls: "answer",
        },
      ],
      values: {
        "l,r": "ans",
        k: 3,
        dp: 35,
      },
    },
  ],
  vizTitle: "Burst [3, 1, 5] padded to [1, 3, 1, 5, 1]",
  vizIntro: "dp[l][r] for increasing gap. Target is the interval being solved; from cells are the two pieces after choosing last-burst k.",
  vizCaption: "Answer dp[0][4] = 35. Last burst k=3 (value 5) scores 1*5*1 plus interiors.",
  mermaid: "graph TD\n  full[\"dp of l,r\"] --> leftP[\"dp of l,k\"]\n  full --> rightP[\"dp of k,r\"]\n  full --> cost[\"plus a[l] * a[k] * a[r]\"]",
  merTitle: "Last burst splits the interval",
  merCaption: "k stays until the end, so the two interiors never see each other except through a[k].",
  steps: [
    "<strong>Pad sentinels</strong> if the cost of an operation uses outside neighbours.",
    "<strong>State:</strong> dp[l][r] = best on the open interval (l, r).",
    "<strong>Base:</strong> r = l+1 → 0 (empty interior).",
    "<strong>For len = 2 .. n+1, for l, r = l+len:</strong> try every k in (l, r).",
    "<strong>Transition:</strong> combine dp[l][k], dp[k][r], and cost(l,k,r).",
    "<strong>Take max or min</strong> over k.",
    "<strong>Answer</strong> is dp[0][padded n+1] (balloons) or dp[0][n-1] (MCM on dimensions).",
  ],
  dryIntro: "Padded a = [1, 3, 1, 5, 1]. Evaluate (0,4) candidates after smaller intervals exist.",
  dryCols: [ "l,r", "k", "left", "right", "cost l*k*r", "total" ],
  dryRows: [
    {
      cells: [ "0,2", "1", "0", "0", "1*3*1=3", "3" ],
      action: "Base-ish length.",
    },
    {
      cells: [ "1,3", "2", "0", "0", "3*1*5=15", "15" ],
      action: "",
    },
    {
      cells: [ "2,4", "3", "0", "0", "1*5*1=5", "5" ],
      action: "",
    },
    {
      cells: [ "0,4", "1", "0", "dp[1,4]", "1*3*1=3", "uses bigger right" ],
      action: "One candidate.",
    },
    {
      cells: [ "0,4", "3", "30", "0", "1*5*1=5", "35" ],
      action: "Best last burst = 5.",
      change: true,
    },
  ],
  dryAfter: "<p>The 35 matches the grid's final cell. Reconstruction stores the best k.</p>",
  code: [
    {
      tab: "Recursion",
      file: "BurstRec.java",
      code: "public class BurstRec {\n\n    static int rec(int[] a, int l, int r) {\n        int best = 0;\n        for (int k = l + 1; k < r; k++) {\n            best = Math.max(best, rec(a, l, k) + rec(a, k, r) + a[l] * a[k] * a[r]);\n        }\n        return best;\n    }\n\n    static int maxCoins(int[] nums) {\n        int n = nums.length;\n        int[] a = new int[n + 2];\n        a[0] = 1;\n        a[n + 1] = 1;\n        System.arraycopy(nums, 0, a, 1, n);\n        return rec(a, 0, n + 1);\n    }\n\n    public static void main(String[] args) {\n        System.out.println(maxCoins(new int[] {3, 1, 5}));\n    }\n    // Input : [3, 1, 5]\n    // Output: 35\n}",
    },
    {
      tab: "Memo",
      file: "BurstMemo.java",
      code: "import java.util.Arrays;\n\npublic class BurstMemo {\n\n    static int rec(int[] a, int l, int r, int[][] memo) {\n        if (r - l <= 1) {\n            return 0;\n        }\n        if (memo[l][r] != -1) {\n            return memo[l][r];\n        }\n        int best = 0;\n        for (int k = l + 1; k < r; k++) {\n            best = Math.max(best, rec(a, l, k, memo) + rec(a, k, r, memo) + a[l] * a[k] * a[r]);\n        }\n        return memo[l][r] = best;\n    }\n\n    public static void main(String[] args) {\n        int[] nums = {3, 1, 5};\n        int n = nums.length;\n        int[] a = new int[n + 2];\n        a[0] = a[n + 1] = 1;\n        System.arraycopy(nums, 0, a, 1, n);\n        int[][] memo = new int[n + 2][n + 2];\n        for (int[] row : memo) {\n            Arrays.fill(row, -1);\n        }\n        System.out.println(rec(a, 0, n + 1, memo));\n    }\n    // Input : [3, 1, 5]\n    // Output: 35\n}",
    },
    {
      tab: "Tabulated",
      file: "BurstTab.java",
      code: "public class BurstTab {\n\n    static int maxCoins(int[] nums) {\n        int n = nums.length;\n        int[] a = new int[n + 2];\n        a[0] = a[n + 1] = 1;\n        System.arraycopy(nums, 0, a, 1, n);\n        int[][] dp = new int[n + 2][n + 2];\n        for (int gap = 2; gap <= n + 1; gap++) {\n            for (int l = 0; l + gap <= n + 1; l++) {\n                int r = l + gap;\n                for (int k = l + 1; k < r; k++) {\n                    dp[l][r] = Math.max(dp[l][r],\n                            dp[l][k] + dp[k][r] + a[l] * a[k] * a[r]);\n                }\n            }\n        }\n        return dp[0][n + 1];\n    }\n\n    public static void main(String[] args) {\n        System.out.println(maxCoins(new int[] {3, 1, 5}));\n    }\n    // Input : [3, 1, 5]\n    // Output: 35\n}",
    },
  ],
  complexity: {
    time: "O(n³)",
    space: "O(n²)",
    derivation: [
      "<p>O(n&sup2;) intervals, O(n) cuts each:</p>",
      "<span class=\"eq\">T = &Theta;(n&sup3;)</span>",
    ],
    compare: [
      [ "Naive interval", "O(n³)", "O(n²)", "n≤400" ],
      [ "Knuth opt", "O(n²)", "O(n²)", "When argmin is monotone" ],
      [ "Palindrome min cuts + precompute", "O(n²)", "O(n²)", "k-loop dropped" ],
      [ "MCM", "O(n³)", "O(n²)", "Same loops" ],
    ],
  },
  pitfalls: [
    {
      title: "Filling by l, r increasing, not by length",
      bug: "dp[l][k] is still 0 because that interval is longer in one index and not yet computed.",
      fix: "Outer loop is gap / length. Then l. Then k.",
    },
    {
      title: "Forgetting the pad",
      bug: "Bursting the first balloon uses a missing left neighbour.",
      fix: "a = [1] + nums + [1]. k runs in (l, r).",
    },
    {
      title: "Using closed [l,r] including bursting l",
      bug: "Then the neighbour formula double-counts or uses already-burst values.",
      fix: "Open interval: l and r stay alive. Last burst is strictly inside.",
    },
    {
      title: "int overflow on a[l]*a[k]*a[r]",
      bug: "Values 100, n=300, the product and the sum of products can exceed int.",
      fix: "long, or the problem's guaranteed bound.",
    },
    {
      title: "Merging stones without the (len-1)%(K-1)==0 check",
      bug: "You cannot merge an arbitrary pile count into one with K-way merges.",
      fix: "A pile of p stones is mergeable iff (p-1) % (K-1) == 0.",
    },
    {
      title: "n³ at n=2000",
      bug: "8e9 operations.",
      fix: "Knuth / D&C / a different model. See DP Optimisations.",
    },
  ],
  variants: [
    [
      "Matrix chain",
      "cost = rows[i]*mid*cols[j] + two sides. Min.",
      "CLRS / GfG MCM",
      "Same gap loops",
    ],
    [
      "Min cost to cut a stick",
      "Pad 0 and n. Cost of a cut is the current length r-l.",
      "LC 1547",
      "Last cut, not last remaining",
    ],
    [
      "Palindrome partition",
      "dp[r] = 1+min dp[l-1] for palindromic s[l..r]. Precompute isPal[l][r] in n².",
      "LC 132",
      "Often no k-loop at query time",
    ],
    [
      "Knuth optimisation",
      "opt[l][r-1] ≤ opt[l][r] ≤ opt[l+1][r] lets you shrink the k-range to O(1) amortised.",
      "<a href=\"dp-optimizations.html\">DP Optimisations</a>",
      "O(n²) MCM-like",
    ],
  ],
  followups: [
    [
      "Why last, not first?",
      "<p>The first burst of a balloon would leave a new neighbour pair that is hard to name as two independent intervals. The last remaining balloon k splits the original range into two interiors that never interact except through k. Always try \"last action\" when first action fails to decompose.</p>",
    ],
    [
      "When is the k-loop droppable?",
      "<p>When the extra cost does not depend on a free k, or when a boolean (is palindrome) can be precomputed. Knuth drops it down to amortised O(1) per interval when the quadrangle inequality holds.</p>",
    ],
    [
      "How do I reconstruct the burst order?",
      "<p>Store bestK[l][r]. The last burst is that k; recurse on (l,k) and (k,r). The actual time order is interiors first, k last — reverse of the stored last-k.</p>",
    ],
    [
      "Is LPS interval DP or string DP?",
      "<p>Both. LPS as LCS(s, rev(s)) is two-string DP. LPS as dp[i][j] on one string with a match using i+1,j-1 is interval DP of a simpler transition (no k-loop). Same answer.</p>",
    ],
  ],
  problems: [
    {
      name: "Burst Balloons",
      url: "https://leetcode.com/problems/burst-balloons/",
      badge: "lc",
      tag: "LC 312",
      level: "Hard",
      pattern: "The dry-run problem",
    },
    {
      name: "Minimum Cost to Cut a Stick",
      url: "https://leetcode.com/problems/minimum-cost-to-cut-a-stick/",
      badge: "lc",
      tag: "LC 1547",
      level: "Hard",
      pattern: "Pad ends, last cut",
    },
    {
      name: "Palindrome Partitioning II",
      url: "https://leetcode.com/problems/palindrome-partitioning-ii/",
      badge: "lc",
      tag: "LC 132",
      level: "Hard",
      pattern: "n² with isPal table",
    },
    {
      name: "Strange Printer",
      url: "https://leetcode.com/problems/strange-printer/",
      badge: "lc",
      tag: "LC 664",
      level: "Hard",
      pattern: "Last print of a colour",
    },
    {
      name: "Minimum Score Triangulation of Polygon",
      url: "https://leetcode.com/problems/minimum-score-triangulation-of-polygon/",
      badge: "lc",
      tag: "LC 1039",
      level: "Medium",
      pattern: "MCM on a polygon",
    },
    {
      name: "Matrix Chain Multiplication",
      url: "https://www.geeksforgeeks.org/problems/matrix-chain-multiplication0303/1",
      badge: "gfg",
      tag: "GfG",
      level: "Hard",
      pattern: "Classic MCM",
    },
    {
      name: "Zuma Game cousin",
      url: "https://atcoder.jp/contests/dp/tasks/dp_n",
      badge: "atc",
      tag: "ATC DP-N",
      level: "Medium",
      pattern: "Slimes: merge cost prefix sums",
    },
    {
      name: "Zuma Game",
      url: "https://codeforces.com/problemset/problem/607/B",
      badge: "cf",
      tag: "CF 607B",
      level: "Hard",
      pattern: "Interval, matching colours collapse",
    },
    {
      name: "Coloured Balls",
      url: "https://codeforces.com/problemset/problem/149/D",
      badge: "cf",
      tag: "CF 149D",
      level: "Hard",
      pattern: "Bracket colouring, interval + 3 colours",
    },
    {
      name: "Beautiful Array",
      url: "https://codeforces.com/problemset/problem/1155/D",
      badge: "cf",
      tag: "CF 1155D",
      level: "Hard",
      pattern: "Kadane-like 3-state, not interval; contrast",
    },
  ],
  spoilers: [
    {
      summary: "Hint for CF 607B Zuma",
      body: "<p>dp[l][r] = min removals of a[l..r] as a Zuma interval. If a[l]==a[r], you may treat them as collapsing with the interior (dp[l+1][r-1]). Also try a split k. Fill by length. n ≤ 500, O(n&sup3;) is intended.</p>",
    },
    {
      summary: "Hint for AtCoder DP-N Slimes",
      body: "<p>Cost to merge [l, r] is the sum of that range (prefix sums) plus the two child merges. dp[l][r] = pref[r]-pref[l-1] + min over k of dp[l][k]+dp[k+1][r]. Standard MCM with a prefix-sum cost.</p>",
    },
  ],
  recap: [
    "<strong>State is an interval [l, r] (often open).</strong>",
    "<strong>Last action at k</strong> splits into two strictly smaller intervals.",
    "<strong>Fill by increasing length / gap.</strong>",
    "<strong>Pad sentinels</strong> for balloons and stick cuts.",
    "<strong>O(n&sup3;), n ≤ 400.</strong> Faster needs Knuth or a dropped k-loop.",
  ],
  oneliner: "dp[l][r] = max/min_k dp[l][k]+dp[k][r]+cost | fill by gap | pad sentinels",
}),

pack({
  id: "bitmask-dp",
  difficulty: "Hard",
  readTime: "26 min",
  tagline: "When n ≤ 20 the subset <em>is</em> the state: <code>dp[mask]</code> (and maybe a last vertex) enumerates 2<sup>n</sup> subsets in a DAG of popcounts.",
  tags: [ "bitmask", "TSP", "subset", "P1" ],
  prereqs: [
    [ "DP Foundations", "dp-foundations.html" ],
    [ "Bit Manipulation", "../02-sorting-hashing-bits/bit-manipulation.html" ],
  ],
  why: [
    "n ≤ 20 is not a suggestion of brute force permutations. It is a signature for 2<sup>n</sup> n or 2<sup>n</sup> n&sup2; DP over subsets. Held-Karp TSP, assignment, \"smallest team covering all skills\", and \"number of Hamiltonian paths\" all live here.",
    "The mask is an integer whose bits remember which items / vertices / skills are used. Transitions turn a bit off (or on) and maybe record who was last. Iterating masks in order of popcount (or by the natural 0..2^n-1 increasing order, which adds bits) is the topo order.",
    "P1 because the bit tricks (iterate submasks, lowest set bit, popcount) are as much the topic as the recurrence, and because a missed bit means a silent wrong count.",
  ],
  insight: "dp[mask] is the answer for exactly the subset whose bits are set. A transition names one element of the subset as \"the one we added last\".",
  yes: [
    "n ≤ 16 .. 22, and the state must remember an arbitrary subset",
    "TSP / shortest Hamiltonian path in a dense small graph",
    "Assignment: n jobs, n workers, min cost bijection",
    "Cover all skills / all remaining with a smallest team",
    "Count Hamiltonian paths, or DP over used vertices plus last",
  ],
  no: [
    "n = 40 subset-sum → meet-in-the-middle, not 2^n n DP on one side only if n=40 full",
    "n = 1e5 → the subset cannot be the state",
    "SOS over all submasks of all masks is a different (next) page",
    "The graph is a DAG of n=1e5 → DAG DP, not a mask",
  ],
  table: [
    [ "TSP min cost", "dp[mask][u] last vertex u", "Held-Karp O(2^n n²)" ],
    [ "Assignment", "dp[mask] = min cost pairing used workers", "O(2^n n)" ],
    [ "Count Hamiltonian paths", "+= along unused vertices", "mod often" ],
    [ "Min team covering bits", "OR skills, min size", "LC 1125" ],
    [ "Iterate all submasks", "s = (s-1) & mask", "SOS cousin" ],
    [ "n=20, 3^n", "each item: skip / A / B", "split into two groups" ],
    [
      "<strong>Confused with:</strong> 2^n brute of permutations",
      "n! is 2e18 at n=20; 2^n n^2 is 4e8",
      "Always DP the subset, never permute n=20",
    ],
  ],
  constraint: "<code>n &le; 20</code> for O(2^n n^2) (~4e8, tight in Java). <code>n &le; 24</code> only for O(2^n n) with tiny constants. Allocate <code>int[1<<n]</code> or <code>int[1<<n][n]</code>; 2^24 ints is 64 MB.",
  coreHeading: "Masks as vertices of a DAG",
  core: [
    "Assignment dry-run: n = 3 workers, costs[i][j] = cost of worker i doing job j, jobs are bits. dp[mask] = min cost to assign the workers 0..popcount(mask)-1 to the job subset mask (or: workers are bits). We take the second convention: bits = used jobs, and we assign workers in order 0,1,2,... so dp[mask] uses the first popcount(mask) workers.",
    "Held-Karp: dp[mask][u] = min cost of a path that visits exactly the vertices in mask and ends at u. Transition: for v in mask, v != u, dp[mask][u] = min dp[mask^(1<<u)][v] + w[v][u]. Start dp[1<<s][s] = 0. Iterate mask from 0 to (1<<n)-1; a submask with one fewer bit is a smaller integer, so it is already filled. That is the free topo order.",
  ],
  invariant: "<p><code>dp[mask][u]</code> is the best cost (or ways) of visiting exactly the set <code>mask</code>, currently sitting at <code>u</code> (u's bit is on).</p><span class=\"eq\">dp[mask][u] = min_v dp[mask without u][v] + w[v][u]</span>",
  extra: [
    {
      kind: "tip",
      title: "Iterate set bits",
      html: "<p><code>for (int s = mask; s != 0; s &= s-1) { int v = Integer.numberOfTrailingZeros(s); }</code> visits each set bit of mask in O(popcount). Do not loop v = 0..n-1 if n is 20 and you are inside another n loop unless you must.</p>",
    },
    {
      kind: "warn",
      title: "Java int sign bit",
      html: "<p>1&lt;&lt;31 is negative. Keep n ≤ 30 for int masks, or use long and 1L&lt;&lt;i. Iterate with <code>s = (s-1)&amp;mask</code> on ints only when mask is non-negative.</p>",
    },
  ],
  grid: {
    corner: "mask\\last",
    rowHeads: [ "001", "010", "011", "100", "101", "110", "111" ],
    colHeads: [ "u=0", "u=1", "u=2" ],
  },
  vars: [ "mask", "u", "dp" ],
  frames: [
    {
      note: "Start: mask 001, at 0, cost 0. Other singletons from 0 are inf (we fix start = 0).",
      cells: [
        {
          r: 0,
          c: 0,
          val: "0",
          cls: "answer",
        },
        {
          r: 1,
          c: 1,
          val: "inf",
        },
        {
          r: 3,
          c: 2,
          val: "inf",
        },
      ],
      values: {
        mask: "001",
        u: 0,
        dp: 0,
      },
    },
    {
      note: "mask 011 (0 and 1), last=1. From {0} at 0 plus w=5. Write 5. Target last=1, from last=0.",
      cells: [
        {
          r: 2,
          c: 1,
          val: "5",
          cls: "target",
        },
        {
          r: 0,
          c: 0,
          val: "0",
          cls: "from",
        },
      ],
      values: {
        mask: "011",
        u: 1,
        dp: 5,
      },
    },
    {
      note: "mask 101 (0 and 2), last=2. From {0} at 0 plus w=1. Write 1.",
      cells: [
        {
          r: 4,
          c: 2,
          val: "1",
          cls: "target",
        },
        {
          r: 0,
          c: 0,
          val: "0",
          cls: "from",
        },
      ],
      values: {
        mask: "101",
        u: 2,
        dp: 1,
      },
    },
    {
      note: "mask 111, last=1. Previous is mask 101 last=2, plus w[2][1]=2. Write 1+2=3.",
      cells: [
        {
          r: 6,
          c: 1,
          val: "3",
          cls: "target",
        },
        {
          r: 4,
          c: 2,
          val: "1",
          cls: "from",
        },
      ],
      values: {
        mask: "111",
        u: 1,
        dp: 3,
      },
    },
    {
      note: "mask 111, last=2. Previous mask 011 last=1, plus w[1][2]=2. Write 5+2=7.",
      cells: [
        {
          r: 6,
          c: 2,
          val: "7",
          cls: "target",
        },
        {
          r: 2,
          c: 1,
          val: "5",
          cls: "from",
        },
      ],
      values: {
        mask: "111",
        u: 2,
        dp: 7,
      },
    },
    {
      note: "Close the cycle: 3+w(1,0)=8 vs 7+w(2,0)=8. Answer 8.",
      cells: [
        {
          r: 6,
          c: 1,
          val: "3",
          cls: "from",
        },
        {
          r: 6,
          c: 2,
          val: "7",
          cls: "from",
        },
        {
          r: 0,
          c: 0,
          val: "8",
          cls: "target",
        },
      ],
      values: {
        mask: "close",
        u: "back to 0",
        dp: 8,
      },
    },
    {
      note: "Without returning, shortest Hamiltonian path from 0 is min(dp[111][1], dp[111][2]) = 3.",
      cells: [
        {
          r: 6,
          c: 1,
          val: "3",
          cls: "answer",
        },
        {
          r: 6,
          c: 2,
          val: "7",
        },
      ],
      values: {
        mask: "path",
        u: 1,
        dp: 3,
      },
    },
  ],
  vizTitle: "Mini TSP, n = 3, undirected weights 0-1:5, 0-2:1, 1-2:2, start at 0",
  vizIntro: "Rows are masks 1..7; columns are last vertex 0,1,2. inf = unreachable. Target is the cell we write; from is the previous last vertex.",
  vizCaption: "Hamiltonian cycles back to 0: path 0-2-1-0 costs 1+2+5=8. dp[7][1]+w[1][0] and dp[7][2]+w[2][0] compete.",
  mermaid: "graph TD\n  m0[\"000\"] --> m1[\"001\"]\n  m0 --> m2[\"010\"]\n  m0 --> m4[\"100\"]\n  m1 --> m3[\"011\"]\n  m1 --> m5[\"101\"]\n  m2 --> m3\n  m2 --> m6[\"110\"]\n  m4 --> m5\n  m4 --> m6\n  m3 --> m7[\"111\"]\n  m5 --> m7\n  m6 --> m7",
  merTitle: "Popcount layers for n = 3",
  merCaption: "Edges add one bit. Any increasing-mask loop respects this DAG.",
  steps: [
    "<strong>Confirm n ≤ 20</strong> and that the forgotten information is exactly a subset.",
    "<strong>Allocate dp[1<<n]</strong> or dp[1<<n][n], fill with inf / 0.",
    "<strong>Base:</strong> empty mask 0, or singletons 1<<s.",
    "<strong>For mask = 0 .. (1<<n)-1:</strong> for each set bit u, for each previous v, relax.",
    "<strong>Use n &amp; -n / trailing zeros</strong> to iterate set bits.",
    "<strong>Answer</strong> is min over endings, plus the return edge for a cycle.",
    "<strong>Reconstruct</strong> with a parent pair (prev mask, prev u).",
  ],
  dryIntro: "Held-Karp from 0 on the 3-vertex graph. inf omitted.",
  dryCols: [ "mask", "u", "from", "w", "dp" ],
  dryRows: [
    {
      cells: [ "001", "0", "—", "0", "0" ],
      action: "Start.",
    },
    {
      cells: [ "011", "1", "001,u0", "5", "5" ],
      action: "Visit 1.",
      change: true,
    },
    {
      cells: [ "101", "2", "001,u0", "1", "1" ],
      action: "Visit 2.",
      change: true,
    },
    {
      cells: [ "111", "1", "101,u2", "2", "3" ],
      action: "0-2-1.",
    },
    {
      cells: [ "111", "2", "011,u1", "2", "7" ],
      action: "0-1-2.",
    },
    {
      cells: [ "cycle", "0", "111,u1 or u2", "5 or 1", "8" ],
      action: "Both closes cost 8.",
      change: true,
    },
  ],
  code: [
    {
      tab: "Recursion",
      file: "TspRec.java",
      code: "public class TspRec {\n\n    static int rec(int[][] w, int used, int u, int n) {\n        if (used == (1 << n) - 1) {\n            return w[u][0];\n        }\n        int best = Integer.MAX_VALUE / 4;\n        for (int v = 0; v < n; v++) {\n            if ((used & (1 << v)) == 0) {\n                best = Math.min(best, w[u][v] + rec(w, used | (1 << v), v, n));\n            }\n        }\n        return best;\n    }\n\n    public static void main(String[] args) {\n        int[][] w = {{0, 5, 1}, {5, 0, 2}, {1, 2, 0}};\n        System.out.println(rec(w, 1, 0, 3));\n    }\n    // Input : n=3, weights as in the figure, start 0, return to 0\n    // Output: 8\n}",
    },
    {
      tab: "Memo",
      file: "TspMemo.java",
      code: "import java.util.Arrays;\n\npublic class TspMemo {\n\n    static int rec(int[][] w, int used, int u, int n, int[][] memo) {\n        if (used == (1 << n) - 1) {\n            return w[u][0];\n        }\n        if (memo[used][u] != -1) {\n            return memo[used][u];\n        }\n        int best = Integer.MAX_VALUE / 4;\n        for (int v = 0; v < n; v++) {\n            if ((used & (1 << v)) == 0) {\n                best = Math.min(best, w[u][v] + rec(w, used | (1 << v), v, n, memo));\n            }\n        }\n        return memo[used][u] = best;\n    }\n\n    public static void main(String[] args) {\n        int[][] w = {{0, 5, 1}, {5, 0, 2}, {1, 2, 0}};\n        int n = 3;\n        int[][] memo = new int[1 << n][n];\n        for (int[] row : memo) {\n            Arrays.fill(row, -1);\n        }\n        System.out.println(rec(w, 1, 0, n, memo));\n    }\n    // Input : same\n    // Output: 8\n}",
    },
    {
      tab: "Tabulated",
      file: "TspTab.java",
      code: "import java.util.Arrays;\n\npublic class TspTab {\n\n    static int tsp(int[][] w) {\n        int n = w.length;\n        int inf = Integer.MAX_VALUE / 4;\n        int[][] dp = new int[1 << n][n];\n        for (int[] row : dp) {\n            Arrays.fill(row, inf);\n        }\n        dp[1][0] = 0;\n        for (int mask = 1; mask < (1 << n); mask++) {\n            for (int u = 0; u < n; u++) {\n                if ((mask & (1 << u)) == 0) {\n                    continue;\n                }\n                for (int v = 0; v < n; v++) {\n                    if ((mask & (1 << v)) != 0) {\n                        continue;\n                    }\n                    int nmask = mask | (1 << v);\n                    dp[nmask][v] = Math.min(dp[nmask][v], dp[mask][u] + w[u][v]);\n                }\n            }\n        }\n        int best = inf;\n        int full = (1 << n) - 1;\n        for (int u = 1; u < n; u++) {\n            best = Math.min(best, dp[full][u] + w[u][0]);\n        }\n        return best;\n    }\n\n    public static void main(String[] args) {\n        int[][] w = {{0, 5, 1}, {5, 0, 2}, {1, 2, 0}};\n        System.out.println(tsp(w));\n    }\n    // Input : same\n    // Output: 8\n}",
    },
  ],
  complexity: {
    time: "O(2^n n²) Held-Karp; O(2^n n) assignment",
    space: "O(2^n n) or O(2^n)",
    derivation: [
      "<p>2<sup>n</sup> masks, n choices for last, n choices for previous:</p>",
      "<span class=\"eq\">T<sub>TSP</sub> = &Theta;(2<sup>n</sup> n&sup2;)</span>",
    ],
    compare: [
      [ "Held-Karp TSP", "O(2^n n²)", "O(2^n n)", "n≤20" ],
      [ "Assignment", "O(2^n n)", "O(2^n)", "n≤24" ],
      [ "n! permute", "O(n! n)", "O(n)", "n≤12" ],
      [ "Iterate submasks of all masks", "O(3^n)", "O(2^n)", "<a href=\"sos-dp.html\">SOS</a>" ],
    ],
  },
  pitfalls: [
    {
      title: "Starting dp[0][0] = 0 with vertex 0 not in the mask",
      bug: "Last-vertex bit is off. Transitions that require u in mask skip the start.",
      fix: "dp[1<<s][s] = 0. The start bit is on.",
    },
    {
      title: "Closing the cycle inside the DP instead of at the end",
      bug: "Adding w[u][s] on every mask, including non-full ones.",
      fix: "Return-edge only when mask is full.",
    },
    {
      title: "int overflow, inf + w wrapping",
      bug: "Integer.MAX_VALUE + w is negative and wins the min.",
      fix: "inf = MAX/4, or skip if dp[mask][u] is still inf.",
    },
    {
      title: "1<<n for n=31",
      bug: "Sign bit, negative array size or infinite loop.",
      fix: "n ≤ 30 for int, or long masks.",
    },
    {
      title: "Forgetting u's bit is set in mask",
      bug: "Transition from mask including u, still iterating u as previous.",
      fix: "Previous mask is mask ^ (1<<u), and v iterates bits of that.",
    },
    {
      title: "O(2^n n^2) at n=24 in Java",
      bug: "TLE. 2^24 * 576 is billions.",
      fix: "Shrink n, or drop a dimension (assignment is 2^n n).",
    },
  ],
  variants: [
    [
      "Assignment / min cost matching",
      "dp[mask] = min over unused job j of dp[mask^(1<<j)] + cost[popcount][j].",
      "O(2^n n)",
      "n workers in order",
    ],
    [
      "Count Hamiltonian paths",
      "+= instead of min, often mod 1e9+7.",
      "AtCoder DP-O matching is related",
      "long + modulus",
    ],
    [
      "Min OR-cover of skills",
      "Each person is a bitmask of skills. dp[mask] min people to reach at least mask.",
      "LC 1125",
      "OR transitions",
    ],
    [
      "3^n split",
      "Each item in A, B, or neither. Loop trit masks or SOS-style.",
      "Meet in the middle cousin",
      "n≤14",
    ],
  ],
  followups: [
    [
      "Why is 2^n n^2 better than n!?",
      "<p>n! paths remember the whole order. DP remembers only the set and the last vertex, which is enough for the next edge. That is optimal substructure: the best path through a set ending at u does not care about the order before u, only the cost.</p>",
    ],
    [
      "How do I iterate all submasks of a mask?",
      "<p><code>for (int s = mask; ; s = (s-1) & mask) { ... if (s==0) break; }</code>. Across all masks that is 3^n, which is SOS without the smart order. Prefer the SOS page when you need F[mask] = sum over submasks.</p>",
    ],
    [
      "Can I bitmask a grid of 8x8?",
      "<p>If the state is one row's occupancy, n = number of columns ≤ 8 is classic \"profile DP\" / broken profile. That is bitmask DP on a sliding row, still this family, with extra care for vertical constraints.</p>",
    ],
    [
      "TSP approximation?",
      "<p>Held-Karp is exact. For n &gt; 20 you need Christofides / local search / ILP, which are not this course. In contests, n &gt; 20 means the graph is special (metric on a line, bitonic, DAG).</p>",
    ],
  ],
  problems: [
    {
      name: "Shortest Path Visiting All Nodes",
      url: "https://leetcode.com/problems/shortest-path-visiting-all-nodes/",
      badge: "lc",
      tag: "LC 847",
      level: "Hard",
      pattern: "BFS on (mask, u), unweighted TSP",
    },
    {
      name: "Smallest Sufficient Team",
      url: "https://leetcode.com/problems/smallest-sufficient-team/",
      badge: "lc",
      tag: "LC 1125",
      level: "Hard",
      pattern: "OR-cover of skill bits",
    },
    {
      name: "Maximum Students Taking Exam",
      url: "https://leetcode.com/problems/maximum-students-taking-exam/",
      badge: "lc",
      tag: "LC 1349",
      level: "Hard",
      pattern: "Profile DP, row masks",
    },
    {
      name: "Partition to K Equal Sum Subsets",
      url: "https://leetcode.com/problems/partition-to-k-equal-sum-subsets/",
      badge: "lc",
      tag: "LC 698",
      level: "Medium",
      pattern: "mask of used, or backtrack",
    },
    {
      name: "Matching",
      url: "https://atcoder.jp/contests/dp/tasks/dp_o",
      badge: "atc",
      tag: "ATC DP-O",
      level: "Hard",
      pattern: "Count perfect matchings, 2^n n",
    },
    {
      name: "Travelling Salesman",
      url: "https://www.geeksforgeeks.org/problems/travelling-salesman-problem2732/1",
      badge: "gfg",
      tag: "GfG",
      level: "Hard",
      pattern: "Held-Karp implement",
    },
    {
      name: "Kefa and Dishes",
      url: "https://codeforces.com/problemset/problem/580/D",
      badge: "cf",
      tag: "CF 580D",
      level: "Medium",
      pattern: "dp[mask][last] + bonus edges",
    },
    {
      name: "Team",
      url: "https://codeforces.com/problemset/problem/1316/E",
      badge: "cf",
      tag: "CF 1316E",
      level: "Hard",
      pattern: "People as mask of positions",
    },
    {
      name: "Harmony",
      url: "https://atcoder.jp/contests/dp/tasks/dp_u",
      badge: "atc",
      tag: "ATC DP-U",
      level: "Hard",
      pattern: "Grouping, 3^n submask enum",
    },
    {
      name: "Shortest Hamiltonian Path",
      url: "https://cses.fi/problemset/task/1690",
      badge: "gfg",
      tag: "CSES",
      level: "Hard",
      pattern: "Count paths visiting all, mod",
    },
  ],
  spoilers: [
    {
      summary: "Hint for CF 580D",
      body: "<p>n ≤ 18 dishes, m extra satisfaction pairs (x,y,z) if y is eaten immediately after x. dp[mask][last] = max satisfaction. Transition: add a new dish v, add a[v] plus z if (last,v) is a bonus. Answer max over masks with popcount m and all last. long.</p>",
    },
    {
      summary: "Hint for AtCoder DP-O Matching",
      body: "<p>n men, n women, compatibility matrix. dp[mask] = ways to match the first popcount(mask) men to the woman-subset mask. For each unused woman, add. Mod 1e9+7. O(2^n n). n=21 is the upper end; write tight Java.</p>",
    },
  ],
  recap: [
    "<strong>n ≤ 20 ⇒ 2<sup>n</sup> subset states</strong>, never n!.",
    "<strong>dp[mask][u]</strong> = best for this set, currently at u.",
    "<strong>Increasing mask is a topo order</strong> (bits only turn on).",
    "<strong>inf = MAX/4</strong>, start with the start bit on.",
    "<strong>Iterate set bits with s &= s-1</strong>.",
  ],
  oneliner: "dp[mask][u] | start 1<<s | add unused v | close cycle on full mask | n<=20",
}),

pack({
  id: "game-theory-and-grundy",
  difficulty: "Hard",
  readTime: "26 min",
  tagline: "Impartial games collapse to a Nim heap: the Grundy / mex number of a position, XOR of the heaps, and a non-zero XOR is a first-player win.",
  tags: [ "Grundy", "Nim", "mex", "P1" ],
  prereqs: [
    [ "DP Foundations", "dp-foundations.html" ],
  ],
  why: [
    "Nim is the only impartial game you need, because Sprague-Grundy says every impartial sum of games is equivalent to a Nim heap whose size is the mex of the reachable heaps. Subtraction games, Kayles, turning turtles, and \"split a pile into two unequal piles\" all become XOR.",
    "The DP is: grundy[pos] = mex { grundy[q] : pos → q }. mex is the smallest non-negative integer not in the set. Precompute by increasing rank (pile size, remaining squares). Then the position is winning iff the XOR of component grundies is non-zero.",
    "P1 because the modelling (what are the independent components? what are the moves?) is the interview, and because people XOR the pile sizes instead of the grundy numbers of those piles.",
  ],
  insight: "First player wins iff grundy(position) ≠ 0. For a sum of independent games, XOR the grundies. A single Nim heap of size n has grundy n, which is why plain Nim is XOR of the sizes.",
  yes: [
    "Two players, optimal play, last move wins (normal play) or last move loses (misère)",
    "The game is a disjoint sum of smaller boards / piles",
    "Moves on one pile do not affect the others",
    "\"Subtraction set\", splitting piles, removing objects with a local rule",
    "n piles up to 1e5 values, you need O(maxA) precompute then O(1) per pile",
  ],
  no: [
    "Scoring games / partizan (Go, chess) → not Sprague-Grundy",
    "The winner is decided by a score, not by who moves last",
    "Players have different move sets (partizan) → Conway, not this page",
    "Misère with large heaps is a minefield; only apply the easy misère Nim rule when all heaps are tiny",
  ],
  table: [
    [ "Classic Nim, heaps, remove any from one heap", "grundy(n)=n", "XOR of sizes" ],
    [ "Subtraction {s1..sk}", "grundy[n]=mex of grundy[n-si]", "Period often appears" ],
    [ "Split into two non-empty", "XOR of the two parts is the move", "grundy of a sum" ],
    [ "Several independent boards", "XOR the board grundies", "The theorem" ],
    [ "Win/lose only, no parts", "dp[pos] = exists a losing child", "Boolean DAG DP" ],
    [ "Misère Nim, all heaps ≤1", "Flip the usual XOR test", "Special case" ],
    [
      "<strong>Confused with:</strong> XORing pile sizes in a non-Nim game",
      "You must XOR grundy(pile), not the size, unless grundy happens to be the identity",
      "Compute mex first",
    ],
  ],
  constraint: "Pile size up to 1e5, precompute grundy in O(maxA * moves). Number of piles 1e5, then one XOR pass. Recursion without memo on a DAG of positions is exponential.",
  coreHeading: "mex, then XOR",
  core: [
    "A position is losing (second-player, grundy 0) iff every move leads to a winning position for the opponent, i.e. iff there is no move to a grundy-0 position. That is exactly mex of the child grundies being 0 when all children are non-zero.",
    "Dry-run: subtraction game S = {1, 3}. grundy[0]=0 (no moves). grundy[1]=mex{g[0]}=mex{0}=1. grundy[2]=mex{g[1]}=mex{1}=0. grundy[3]=mex{g[2], g[0]}=mex{0,0}=1. grundy[4]=mex{g[3], g[1]}=mex{1,1}=0. Pattern 0,1,0,1,... Two piles of size 4 and 1: 0 XOR 1 = 1, first player wins. Boolean DP is the special case of a single component: win[pos] = OR over children of !win[child]. Grundy is what you need when there are several components.",
  ],
  invariant: "<p>The grundy number of a disjoint sum is the XOR of the grundy numbers. Normal play: first player wins iff the total XOR is not 0.</p><span class=\"eq\">g(x) = mex { g(y) : x → y } &nbsp;&nbsp; mex S = min n≥0, n∉S</span>",
  extra: [
    {
      kind: "math",
      title: "Why XOR?",
      html: "<p>Nim heaps XOR because a move on one heap can set that heap to any smaller size, which is any smaller grundy, which is exactly the moves you need to cancel the total XOR to 0. The theorem says every impartial game is equivalent to one such heap.</p>",
    },
    {
      kind: "warn",
      title: "Misère is not \"flip the winner\"",
      html: "<p>Misère Nim: if every heap has size ≤ 1, the winner is the opposite of normal play; otherwise the winner is the same as normal. For other games, misère Sprague-Grundy is hard. Do not invent a rule.</p>",
    },
  ],
  grid: {
    corner: "n",
    rowHeads: [ "g" ],
    colHeads: [ "0", "1", "2", "3", "4", "5", "6" ],
  },
  vars: [ "n", "children", "mex" ],
  frames: [
    {
      note: "g[0] = mex{} = 0. Terminal, losing.",
      cells: [
        {
          r: 0,
          c: 0,
          val: "0",
          cls: "answer",
        },
      ],
      values: {
        n: 0,
        children: "none",
        mex: 0,
      },
    },
    {
      note: "n=1. Only 1-1=0. Children {0}. mex = 1. Target 1, from 0.",
      cells: [
        {
          r: 0,
          c: 1,
          val: "1",
          cls: "target",
        },
        {
          r: 0,
          c: 0,
          val: "0",
          cls: "from",
        },
      ],
      values: {
        n: 1,
        children: "0",
        mex: 1,
      },
    },
    {
      note: "n=2. Only 2-1=1. Children {1}. mex = 0.",
      cells: [
        {
          r: 0,
          c: 2,
          val: "0",
          cls: "target",
        },
        {
          r: 0,
          c: 1,
          val: "1",
          cls: "from",
        },
      ],
      values: {
        n: 2,
        children: "1",
        mex: 0,
      },
    },
    {
      note: "n=3. 3-1=2 and 3-3=0. Children {0, 0}. mex = 1.",
      cells: [
        {
          r: 0,
          c: 3,
          val: "1",
          cls: "target",
        },
        {
          r: 0,
          c: 2,
          val: "0",
          cls: "from",
        },
        {
          r: 0,
          c: 0,
          val: "0",
          cls: "from",
        },
      ],
      values: {
        n: 3,
        children: "2,0",
        mex: 1,
      },
    },
    {
      note: "n=4. 4-1=3 and 4-3=1. Children {1, 1}. mex = 0.",
      cells: [
        {
          r: 0,
          c: 4,
          val: "0",
          cls: "target",
        },
        {
          r: 0,
          c: 3,
          val: "1",
          cls: "from",
        },
        {
          r: 0,
          c: 1,
          val: "1",
          cls: "from",
        },
      ],
      values: {
        n: 4,
        children: "3,1",
        mex: 0,
      },
    },
    {
      note: "n=5. Children g[4], g[2] = {0,0}. mex = 1.",
      cells: [
        {
          r: 0,
          c: 5,
          val: "1",
          cls: "target",
        },
        {
          r: 0,
          c: 4,
          val: "0",
          cls: "from",
        },
        {
          r: 0,
          c: 2,
          val: "0",
          cls: "from",
        },
      ],
      values: {
        n: 5,
        children: "4,2",
        mex: 1,
      },
    },
    {
      note: "Piles (4, 1): 0 XOR 1 = 1 ≠ 0, first player wins. Move the 1-pile to 0, leaving a single even pile.",
      cells: [
        {
          r: 0,
          c: 4,
          val: "0",
          cls: "from",
        },
        {
          r: 0,
          c: 1,
          val: "1",
          cls: "from",
        },
        {
          r: 0,
          c: 0,
          val: "xor=1",
          cls: "target",
        },
      ],
      values: {
        n: "4 xor 1",
        children: "win",
        mex: 1,
      },
    },
  ],
  vizTitle: "grundy[n] for subtraction {1, 3}",
  vizIntro: "One row. Target is n; from cells are n-1 and n-3 when they exist. The mex of those values is the new entry.",
  vizCaption: "0,1,0,1,0,1. Even n is losing as a single pile. Two piles XOR those bits.",
  mermaid: "flowchart TD\n  q([\"impartial, last move wins\"]) --> split{\"sum of independent games?\"}\n  split -- no --> dag[\"boolean win[pos] = exists losing child\"]\n  split -- yes --> g[\"grundy[comp] = mex of child grundies\"]\n  g --> x[\"XOR all components\"]\n  x --> z{\"xor == 0?\"}\n  z -- yes --> second[\"second player wins\"]\n  z -- no --> first[\"first player wins\"]",
  merTitle: "From a statement to XOR",
  merCaption: "If you cannot split into independent games, you only have a win/lose DAG on the whole position.",
  steps: [
    "<strong>Confirm impartial + normal play</strong> (or handle misère separately).",
    "<strong>Decompose</strong> into independent components (piles, boards, chains).",
    "<strong>List the moves</strong> from a component of size n.",
    "<strong>Compute grundy[0..max]</strong> in increasing order: mex of reachable grundies.",
    "<strong>XOR</strong> grundy of every component.",
    "<strong>Non-zero → first wins</strong>; zero → second.",
    "<strong>To move:</strong> find a component whose grundy you can change so the new XOR is 0.",
  ],
  dryIntro: "Subtraction {1,3}, piles 4 and 1.",
  dryCols: [ "n", "moves to", "child g", "mex = g[n]" ],
  dryRows: [
    {
      cells: [ "0", "—", "{}", "0" ],
      action: "Lose.",
    },
    {
      cells: [ "1", "0", "{0}", "1" ],
      action: "",
    },
    {
      cells: [ "2", "1", "{1}", "0" ],
      action: "Lose as a single pile.",
    },
    {
      cells: [ "3", "2, 0", "{0}", "1" ],
      action: "",
    },
    {
      cells: [ "4", "3, 1", "{1}", "0" ],
      action: "",
    },
    {
      cells: [ "XOR", "g4 xor g1", "0 xor 1", "1" ],
      action: "First player wins.",
      change: true,
    },
  ],
  code: [
    {
      tab: "Recursion",
      file: "GrundyRec.java",
      code: "public class GrundyRec {\n\n    static boolean win(int n, int[] s) {\n        for (int x : s) {\n            if (n >= x && !win(n - x, s)) {\n                return true;\n            }\n        }\n        return false;\n    }\n\n    public static void main(String[] args) {\n        int[] s = {1, 3};\n        System.out.println(win(4, s) + \" \" + win(1, s));\n    }\n    // Input : S={1,3}, single piles 4 and 1\n    // Output: false true\n}",
    },
    {
      tab: "Memo / Tabulated",
      file: "GrundyTab.java",
      code: "import java.util.Arrays;\n\npublic class GrundyTab {\n\n    static int mex(boolean[] seen) {\n        int m = 0;\n        while (m < seen.length && seen[m]) {\n            m++;\n        }\n        return m;\n    }\n\n    static int[] grundy(int n, int[] s) {\n        int[] g = new int[n + 1];\n        for (int i = 1; i <= n; i++) {\n            boolean[] seen = new boolean[s.length + 1];\n            for (int x : s) {\n                if (i >= x) {\n                    seen[g[i - x]] = true;\n                }\n            }\n            g[i] = mex(seen);\n        }\n        return g;\n    }\n\n    public static void main(String[] args) {\n        int[] g = grundy(4, new int[] {1, 3});\n        System.out.println(Arrays.toString(g));\n        System.out.println((g[4] ^ g[1]) != 0 ? \"first\" : \"second\");\n    }\n    // Input : S={1,3}, piles 4 and 1\n    // Output: [0, 1, 0, 1, 0]\n    //         first\n}",
    },
    {
      tab: "Space-opt Nim",
      file: "NimXor.java",
      code: "public class NimXor {\n\n    static boolean firstWins(int[] heaps) {\n        int x = 0;\n        for (int h : heaps) {\n            x ^= h;\n        }\n        return x != 0;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(firstWins(new int[] {3, 4, 5}));\n        System.out.println(firstWins(new int[] {4, 1}));\n    }\n    // Input : heaps [3,4,5] then [4,1] as plain Nim (not subtraction)\n    // Output: true\n    //         true\n}",
    },
  ],
  complexity: {
    time: "O(maxA * |S|) precompute + O(piles) XOR",
    space: "O(maxA)",
    derivation: [
      "<p>Each pile size computes a mex over |S| children:</p>",
      "<span class=\"eq\">T = &Theta;(N &middot; |S|) + &Theta;(piles)</span>",
    ],
    compare: [
      [ "Boolean win DAG", "O(states * moves)", "O(states)", "One component" ],
      [ "Grundy + XOR", "O(N * moves)", "O(N)", "Many piles" ],
      [ "Plain Nim", "O(piles)", "O(1)", "g(n)=n" ],
      [ "Misère Nim", "O(piles)", "O(1)", "Special all-small rule" ],
    ],
  },
  pitfalls: [
    {
      title: "XORing sizes in a subtraction game",
      bug: "Piles 4 and 1 in S={1,3}: 4 xor 1 = 5 ≠ 0 would still say first, luckily; other sizes lie.",
      fix: "XOR grundy[size], which for this S is size%2, not size.",
    },
    {
      title: "mex of the move sizes instead of child grundies",
      bug: "mex{1,3}=0 always. Nonsense.",
      fix: "The set is { grundy[next] }, not { the subtraction amount }.",
    },
    {
      title: "seen[] too small",
      bug: "Grundy can be larger than |S| (not usually, but mex needs an extra slot). If you size seen to max child g without +1 you infinite-loop or miss.",
      fix: "seen of length |S|+2, or a HashSet, or a vis-stamp array of size n+2.",
    },
    {
      title: "Treating a splitting move as one child",
      bug: "A move to two piles is a move to the XOR of those two grundies, one child value, not two separate games added after the fact.",
      fix: "Child grundy = g[a] XOR g[b] when you split n → (a,b).",
    },
    {
      title: "Misère by flipping every winner",
      bug: "Wrong as soon as a heap is ≥ 2.",
      fix: "Use the standard misère Nim lemma, or refuse to generalise.",
    },
    {
      title: "Recursive win() without memo on overlapping positions",
      bug: "Exponential, TLE at n=40.",
      fix: "Tabulate grundy bottom-up, or memoize.",
    },
  ],
  variants: [
    [
      "Subtraction game",
      "Fixed S. Often periodic grundy. Precompute, then O(1) per pile.",
      "This page's dry run",
      "Wythoff is the 2-pile cousin, not mex-period",
    ],
    [
      "Kayles / bowling",
      "Knock 1 or 2 adjacent, splitting the row into two independent rows.",
      "Child = g[left] XOR g[right]",
      "Classic",
    ],
    [
      "Tree games / green Hackenbush",
      "Grundy on a tree via DFS: mex of child-xor options, or XOR of (1+child grundy) for some rules.",
      "CF 839C is expectation, not this",
      "Model the move set carefully",
    ],
    [
      "Win/lose without XOR",
      "If there is only one component, boolean DP is enough and simpler.",
      "win[i] = exists !win[j]",
      "Stone games on one pile",
    ],
  ],
  followups: [
    [
      "How do I find a winning move?",
      "<p>Let X be the total XOR. For a component with grundy g, you need a move to g' with g' == (g XOR X) wait: you need g' such that (X XOR g XOR g') = 0, i.e. g' = X XOR g, and g' &lt; g in Nim, or generally a child whose grundy equals X XOR g. If X==0 there is no winning move.</p>",
    ],
    [
      "What is mex, intuitively?",
      "<p>The smallest heap size you cannot mimic with one move. It is the unique Nim heap equivalent of the position. You never need grundy larger than the branching factor + a bit; it is a small integer.</p>",
    ],
    [
      "Partizan games?",
      "<p>Left and Right have different moves (Domineering, chess). Sprague-Grundy does not apply. You can still do win/lose DP if the state space is small, but there is no XOR decomposition. Do not force grundy.</p>",
    ],
    [
      "Why is a grundy-0 position losing?",
      "<p>Every move is to a non-zero (winning for the opponent), and there is no move to 0. If there are no moves at all, mex is 0, matching the terminal loss in normal play.</p>",
    ],
  ],
  problems: [
    {
      name: "Nim Game",
      url: "https://leetcode.com/problems/nim-game/",
      badge: "lc",
      tag: "LC 292",
      level: "Easy",
      pattern: "One heap, S={1,2,3}, n%4",
    },
    {
      name: "Divisor Game",
      url: "https://leetcode.com/problems/divisor-game/",
      badge: "lc",
      tag: "LC 1025",
      level: "Easy",
      pattern: "Boolean DP, or n even",
    },
    {
      name: "Stone Game",
      url: "https://leetcode.com/problems/stone-game/",
      badge: "lc",
      tag: "LC 877",
      level: "Medium",
      pattern: "Interval DP, always first",
    },
    {
      name: "Cat and Mouse",
      url: "https://leetcode.com/problems/cat-and-mouse/",
      badge: "lc",
      tag: "LC 913",
      level: "Hard",
      pattern: "Game DP on a graph, not impartial XOR",
    },
    {
      name: "Nim Game I",
      url: "https://cses.fi/problemset/task/1730",
      badge: "gfg",
      tag: "CSES",
      level: "Easy",
      pattern: "XOR the heaps",
    },
    {
      name: "Stair Game",
      url: "https://cses.fi/problemset/task/1709",
      badge: "gfg",
      tag: "CSES",
      level: "Medium",
      pattern: "Grundy on stairs, XOR odd stairs",
    },
    {
      name: "Sequential Nim",
      url: "https://codeforces.com/problemset/problem/1382/B",
      badge: "cf",
      tag: "CF 1382B",
      level: "Easy",
      pattern: "First pile >1 decides",
    },
    {
      name: "Industrial Nim",
      url: "https://codeforces.com/problemset/problem/15/C",
      badge: "cf",
      tag: "CF 15C",
      level: "Medium",
      pattern: "XOR of ranges of heap sizes",
    },
    {
      name: "Game With Sticks",
      url: "https://codeforces.com/problemset/problem/451/A",
      badge: "cf",
      tag: "CF 451A",
      level: "Easy",
      pattern: "min(n,m) odd/even",
    },
    {
      name: "Stone Game",
      url: "https://atcoder.jp/contests/dp/tasks/dp_k",
      badge: "atc",
      tag: "ATC DP-K",
      level: "Easy",
      pattern: "Boolean win on one pile, S given",
    },
    {
      name: "Dequeue Game",
      url: "https://atcoder.jp/contests/dp/tasks/dp_l",
      badge: "atc",
      tag: "ATC DP-L",
      level: "Medium",
      pattern: "Interval game, score DP",
    },
    {
      name: "Nim Game",
      url: "https://www.geeksforgeeks.org/problems/nim-game1627/1",
      badge: "gfg",
      tag: "GfG",
      level: "Easy",
      pattern: "XOR",
    },
  ],
  spoilers: [
    {
      summary: "Hint for CSES Stair Game",
      body: "<p>Moving a stone down a stair is like a Nim heap on the odd-indexed stairs (from the bottom). XOR the counts on odd stairs; first wins iff non-zero. The modelling is the whole problem; the XOR is one line.</p>",
    },
    {
      summary: "Hint for AtCoder DP-K",
      body: "<p>One pile, subtraction set A. win[0]=false. win[x] = true iff some a in A has x>=a and !win[x-a]. Print First/Second for n. That is boolean DP, equivalent to grundy[n]!=0 for a single component.</p>",
    },
  ],
  recap: [
    "<strong>grundy = mex of child grundies.</strong> 0 is a losing position.",
    "<strong>Independent components XOR.</strong> Non-zero total = first player.",
    "<strong>Plain Nim: grundy[n]=n</strong>, so XOR the sizes.",
    "<strong>A split is one child</strong> whose value is g[a] XOR g[b].",
    "<strong>Misère is a special lemma</strong>, not a flipped XOR.",
  ],
  oneliner: "g=mex{g(child)} | XOR components | !=0 first | Nim: xor sizes | split: g[a]^g[b]",
}),

pack({
  id: "sos-dp",
  difficulty: "Hard",
  readTime: "24 min",
  tagline: "Sum over subsets in O(n 2<sup>n</sup>) instead of O(3<sup>n</sup>): for each bit, add the values of masks that differ only in that bit.",
  tags: [ "SOS", "submasks", "zeta transform", "P2" ],
  prereqs: [
    [ "Bitmask DP", "bitmask-dp.html" ],
  ],
  why: [
    "Naive F[mask] = sum of A[sub] over sub subseteq mask is 3<sup>n</sup> if you loop every mask and every submask. SOS (sum over subsets) does the same zeta transform in n 2<sup>n</sup> by a DP that looks like a fast Walsh/zeta: for bit b from 0 to n-1, for every mask with bit b set, add the value of mask without b.",
    "That one transform is the bottleneck in \"for every mask, combine with every submask\" problems: subset-OR convolution, counting pairs (i, j) with a[i]|a[j] = x, sum of f[sub] * g[mask^sub], and CF classics like 165E Compatible Numbers.",
    "P2 because the implementation is short and the mistakes (wrong loop order, summing supersets vs subsets, in-place twice) are silent. Draw the n=3 cube once.",
  ],
  insight: "After processing bit b, every mask has already absorbed all submasks that differ only in the processed bits. At the end, f[mask] holds the sum over all submasks.",
  yes: [
    "F[mask] should be the sum / or / min of A over all submasks of mask",
    "n ≤ 20 and 3^n TLE but n 2^n fits",
    "Compatible pairs: a[i] & a[j] = 0, or a[i] | a[j] = ALL",
    "Subset convolution (with extra extra-bits of popcount)",
    "For every mask, query the sum of an array over its submasks, many queries",
  ],
  no: [
    "You only need one mask's submasks → iterate s = (s-1)&mask once, O(2^{popcount})",
    "n = 40 → not 2^n memory",
    "Ordinary knapsack / TSP → previous pages",
    "You need sum over supersets: run SOS on the complement, or reverse the add direction",
  ],
  table: [
    [ "Sum over submasks, all masks", "Zeta / SOS", "n 2^n in-place" ],
    [ "Sum over supersets", "SOS on reversed bits, or add when bit is 0", "Möbius cousin" ],
    [ "Count submasks with A[sub]=1", "SOS on the indicator", "CF 165E" ],
    [
      "Subset convolution",
      "SOS per popcount layer, then pointwise, then inverse",
      "Advanced",
    ],
    [ "Naive submask enum of all masks", "3^n", "n≤14 only" ],
    [ "Single mask submasks", "(s-1)&mask", "No SOS needed" ],
    [
      "<strong>Confused with:</strong> FWHT XOR convolution",
      "XOR convolution is a different transform (Walsh)",
      "SOS is the subset (OR) zeta transform",
    ],
  ],
  constraint: "<code>n &le; 20</code> (2^20 = 1e6, times 20 is 2e7). n = 23 is the Java edge. Values need long. Inverse Möbius is the same loop with subtraction.",
  coreHeading: "One bit at a time",
  core: [
    "Start with f = A copied. For b = 0..n-1, for mask = 0..2^n-1, if mask has bit b, f[mask] += f[mask ^ (1<<b)]. After bit b, f[mask] includes all submasks that may differ in bits 0..b and must match bits > b.",
    "Dry-run n=3, A = [1,2,3,4,5,6,7,8] on masks 0..7. After all bits, f[7] = sum of all A[0..7] = 36. f[1] = A[0]+A[1], because the only submasks of 001 are 000 and 001. Inverse (Möbius): the same loops with -= instead of +=. Supersets: add f[mask | (1<<b)] into f[mask] when bit b is off, or SOS the array reversed.",
  ],
  invariant: "<p>f[mask] = sum of A[sub] over sub that agree with mask on bits &gt; b and are subseteq mask on bits ≤ b.</p><span class=\"eq\">if (mask &amp; (1&lt;&lt;b)) f[mask] += f[mask ^ (1&lt;&lt;b)]</span>",
  extra: [
    {
      kind: "warn",
      title: "Loop mask from 0 to 2^n-1, not the other way, for +=",
      html: "<p>You read mask without bit b, which is a smaller integer, so 0..2^n-1 is safe in-place. If you reversed the add (supersets), you may need to walk masks downwards. Draw n=2 once if unsure.</p>",
    },
    {
      kind: "tip",
      title: "OR-convolution via SOS",
      html: "<p>To compute C[k] = sum_{i|j=k} A[i]B[j], zeta-transform A and B, pointwise multiply, inverse zeta. That is the subset/OR convolution. XOR uses FWHT instead.</p>",
    },
  ],
  grid: {
    corner: "f",
    rowHeads: [ "A/f" ],
    colHeads: [ "0", "1", "2", "3", "4", "5", "6", "7" ],
  },
  vars: [ "bit", "mask", "f" ],
  frames: [
    {
      note: "Start: f = A = [1,2,3,4,5,6,7,8] for masks 000..111.",
      cells: [
        {
          r: 0,
          c: 0,
          val: "1",
        },
        {
          r: 0,
          c: 1,
          val: "2",
        },
        {
          r: 0,
          c: 2,
          val: "3",
        },
        {
          r: 0,
          c: 3,
          val: "4",
        },
        {
          r: 0,
          c: 4,
          val: "5",
        },
        {
          r: 0,
          c: 5,
          val: "6",
        },
        {
          r: 0,
          c: 6,
          val: "7",
        },
        {
          r: 0,
          c: 7,
          val: "8",
        },
      ],
      values: {
        bit: "init",
        mask: "all",
        f: "A",
      },
    },
    {
      note: "Bit 0: mask 001 += mask 000 → 2+1=3. Target 1, from 0.",
      cells: [
        {
          r: 0,
          c: 1,
          val: "3",
          cls: "target",
        },
        {
          r: 0,
          c: 0,
          val: "1",
          cls: "from",
        },
      ],
      values: {
        bit: 0,
        mask: 1,
        f: 3,
      },
    },
    {
      note: "Bit 0: mask 011 += 010 → 4+3=7. Mask 101 += 100, 111 += 110 similarly.",
      cells: [
        {
          r: 0,
          c: 3,
          val: "7",
          cls: "target",
        },
        {
          r: 0,
          c: 2,
          val: "3",
          cls: "from",
        },
        {
          r: 0,
          c: 5,
          val: "11",
        },
        {
          r: 0,
          c: 7,
          val: "15",
        },
      ],
      values: {
        bit: 0,
        mask: "odds",
        f: "done bit0",
      },
    },
    {
      note: "Bit 1: mask 010 += 000 → 3+1=4. Target 2, from 0.",
      cells: [
        {
          r: 0,
          c: 2,
          val: "4",
          cls: "target",
        },
        {
          r: 0,
          c: 0,
          val: "1",
          cls: "from",
        },
      ],
      values: {
        bit: 1,
        mask: 2,
        f: 4,
      },
    },
    {
      note: "Bit 1 continues: 011 += 001, 110 += 100, 111 += 101.",
      cells: [
        {
          r: 0,
          c: 3,
          val: "10",
          cls: "target",
        },
        {
          r: 0,
          c: 1,
          val: "3",
          cls: "from",
        },
      ],
      values: {
        bit: 1,
        mask: 3,
        f: 10,
      },
    },
    {
      note: "Bit 2: 100 += 000, 101 += 001, 110 += 010, 111 += 011. f[7] becomes 1+2+3+4+5+6+7+8=36.",
      cells: [
        {
          r: 0,
          c: 7,
          val: "36",
          cls: "target",
        },
        {
          r: 0,
          c: 3,
          val: "10",
          cls: "from",
        },
      ],
      values: {
        bit: 2,
        mask: 7,
        f: 36,
      },
    },
    {
      note: "Final f = sums of submasks. f[0]=1, f[1]=1+2=3, f[7]=36. Query any mask in O(1) now.",
      cells: [
        {
          r: 0,
          c: 0,
          val: "1",
          cls: "answer",
        },
        {
          r: 0,
          c: 1,
          val: "3",
        },
        {
          r: 0,
          c: 7,
          val: "36",
          cls: "answer",
        },
      ],
      values: {
        bit: "done",
        mask: "query",
        f: "O(1)",
      },
    },
  ],
  vizTitle: "SOS on n = 3, A = [1,2,3,4,5,6,7,8]",
  vizIntro: "One row of 8 masks. Each bit-layer adds the from-cell (mask with bit cleared) into the target (bit set).",
  vizCaption: "After bit 0: odd masks absorbed their even neighbour. After all 3 bits, f[mask] is the sum of A on the subcube below mask.",
  mermaid: "graph TD\n  z[\"000\"] --> a[\"001\"]\n  z --> b[\"010\"]\n  z --> c[\"100\"]\n  a --> ab[\"011\"]\n  a --> ac[\"101\"]\n  b --> ab\n  b --> bc[\"110\"]\n  c --> ac\n  c --> bc\n  ab --> abc[\"111\"]\n  ac --> abc\n  bc --> abc",
  merTitle: "The n=3 subset lattice",
  merCaption: "SOS pushes values along these edges, one bit-direction per layer.",
  steps: [
    "<strong>Copy A into f</strong> of length 1&lt;&lt;n.",
    "<strong>For b = 0 .. n-1:</strong>",
    "<strong>For mask = 0 .. (1&lt;&lt;n)-1:</strong> if bit b is set, f[mask] += f[mask ^ (1&lt;&lt;b)].",
    "<strong>Use long</strong> if the sum of A can exceed 2e9.",
    "<strong>Now f[mask] is the submask sum.</strong> Inverse: the same loops with -=.",
    "<strong>Supersets:</strong> add the other way, or reverse the array indices by ~mask.",
    "<strong>Do not run the transform twice</strong> unless you meant to.",
  ],
  dryIntro: "n=2, A=[1,2,3,4] on 00,01,10,11. Bits 0 then 1.",
  dryCols: [ "step", "f[00]", "f[01]", "f[10]", "f[11]" ],
  dryRows: [
    {
      cells: [ "A", "1", "2", "3", "4" ],
      action: "Copy.",
    },
    {
      cells: [ "bit0", "1", "3", "3", "7" ],
      action: "01+=00, 11+=10.",
      change: true,
    },
    {
      cells: [ "bit1", "1", "3", "4", "10" ],
      action: "10+=00, 11+=01.",
      change: true,
    },
    {
      cells: [ "check", "1", "1+2=3", "1+3=4", "1+2+3+4=10" ],
      action: "Matches all submask sums.",
    },
  ],
  code: [
    {
      tab: "Recursion / naive",
      file: "SosNaive.java",
      code: "import java.util.Arrays;\n\npublic class SosNaive {\n\n    static long[] sos(long[] a, int n) {\n        int N = 1 << n;\n        long[] f = new long[N];\n        for (int mask = 0; mask < N; mask++) {\n            for (int s = mask; ; s = (s - 1) & mask) {\n                f[mask] += a[s];\n                if (s == 0) {\n                    break;\n                }\n            }\n        }\n        return f;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(Arrays.toString(sos(new long[] {1, 2, 3, 4, 5, 6, 7, 8}, 3)));\n    }\n    // Input : A=1..8, n=3\n    // Output: [1, 3, 4, 10, 6, 14, 16, 36]\n}",
    },
    {
      tab: "Memo / SOS",
      file: "SosDp.java",
      code: "import java.util.Arrays;\n\npublic class SosDp {\n\n    static long[] sos(long[] a, int n) {\n        int N = 1 << n;\n        long[] f = Arrays.copyOf(a, N);\n        for (int b = 0; b < n; b++) {\n            for (int mask = 0; mask < N; mask++) {\n                if ((mask & (1 << b)) != 0) {\n                    f[mask] += f[mask ^ (1 << b)];\n                }\n            }\n        }\n        return f;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(Arrays.toString(sos(new long[] {1, 2, 3, 4, 5, 6, 7, 8}, 3)));\n    }\n    // Input : A=1..8, n=3\n    // Output: [1, 3, 4, 10, 6, 14, 16, 36]\n}",
    },
    {
      tab: "Tabulated inverse",
      file: "SosMobius.java",
      code: "import java.util.Arrays;\n\npublic class SosMobius {\n\n    static long[] mobius(long[] f, int n) {\n        int N = 1 << n;\n        long[] a = Arrays.copyOf(f, N);\n        for (int b = 0; b < n; b++) {\n            for (int mask = 0; mask < N; mask++) {\n                if ((mask & (1 << b)) != 0) {\n                    a[mask] -= a[mask ^ (1 << b)];\n                }\n            }\n        }\n        return a;\n    }\n\n    public static void main(String[] args) {\n        long[] f = {1, 3, 4, 10, 6, 14, 16, 36};\n        System.out.println(Arrays.toString(mobius(f, 3)));\n    }\n    // Input : SOS result of 1..8\n    // Output: [1, 2, 3, 4, 5, 6, 7, 8]\n}",
    },
  ],
  complexity: {
    time: "O(n 2^n)",
    space: "O(2^n)",
    derivation: [
      "<p>n layers, 2<sup>n</sup> masks, O(1) add each:</p>",
      "<span class=\"eq\">T = &Theta;(n 2<sup>n</sup>) vs naive &Theta;(3<sup>n</sup>)</span>",
    ],
    compare: [
      [ "Naive all submasks", "O(3^n)", "O(2^n)", "n≤14" ],
      [ "SOS zeta", "O(n 2^n)", "O(2^n)", "n≤20" ],
      [ "One mask's submasks", "O(2^{popcount})", "O(1)", "No SOS" ],
      [ "FWHT XOR", "O(n 2^n)", "O(2^n)", "Different product" ],
    ],
  },
  pitfalls: [
    {
      title: "Adding supersets with the subset loop",
      bug: "You wanted \"how many a[i] are supersets of mask\" and ran the standard SOS.",
      fix: "Flip the condition (add when bit is off) or reverse indices via ((1<<n)-1)^mask.",
    },
    {
      title: "In-place SOS twice",
      bug: "Second pass turns sums-of-sums into garbage.",
      fix: "One transform. Inverse is -=, not a second +=.",
    },
    {
      title: "int overflow",
      bug: "1e6 entries of 1e9.",
      fix: "long[] f.",
    },
    {
      title: "3^n \"because I know submask enumeration\"",
      bug: "n=20, 3.4e9.",
      fix: "If you need F for every mask, it is SOS, not nested (s-1)&mask.",
    },
    {
      title: "Off-by-one on n vs array length",
      bug: "A has 8 elements and you pass n=2.",
      fix: "N = 1<<n must equal a.length.",
    },
    {
      title: "XOR convolution with SOS",
      bug: "OR/subset product is SOS; XOR product is FWHT. Mixing them is a wrong count.",
      fix: "Name the monoid: OR → zeta, XOR → Walsh, AND → reverse zeta.",
    },
  ],
  variants: [
    [
      "Sum over supersets",
      "if ((mask & (1<<b))==0) f[mask] += f[mask | (1<<b)] walking masks high-to-low, or SOS the reversed array.",
      "Compatible numbers often need supersets of the complement",
      "CF 165E",
    ],
    [
      "Möbius inversion",
      "Same loops, -=. Recovers A from F.",
      "When you have prefix-or sums and want exactly-mask",
      "This page's third tab",
    ],
    [
      "Subset convolution",
      "SOS on each popcount slice, pointwise, inverse, extract popcount layer.",
      "O(n^2 2^n)",
      "When i&j=0 and i|j=k",
    ],
    [
      "High-dimension prefix sums",
      "SOS is n-dimensional prefix sums on the boolean lattice.",
      "Same code as 2D prefix, n axes",
      "Mental model",
    ],
  ],
  followups: [
    [
      "Why n 2^n and not 3^n?",
      "<p>Each element A[sub] should be added to every mask supseteq sub. There are n bits to \"turn on\" from sub to mask. SOS adds it along those bits one at a time, so each (sub, extra-bit) pair is handled once, totalling n 2^n, not one add per (sub, mask).</p>",
    ],
    [
      "How is this related to FMT / zeta?",
      "<p>It is the fast zeta transform on the subset poset. Möbius inversion is the inverse transform. The same idea on other posets gives AND/OR/XOR convolutions.</p>",
    ],
    [
      "Can I SOS with min instead of +?",
      "<p>Yes if you want f[mask] = min of A on submasks: f[mask] = min(f[mask], f[mask without b]). Idempotent semirings work; subtraction inverse does not. For min, there is no Möbius.</p>",
    ],
    [
      "Query-only, n=20, q=1e5?",
      "<p>Build SOS once in n 2^n, then each query is O(1) if it is a submask-sum of a stored mask. If queries are arbitrary, that is a different structure.</p>",
    ],
  ],
  problems: [
    {
      name: "Compatible Numbers",
      url: "https://codeforces.com/problemset/problem/165/E",
      badge: "cf",
      tag: "CF 165E",
      level: "Hard",
      pattern: "SOS on existence, query complement",
    },
    {
      name: "Jzzhu and Numbers",
      url: "https://codeforces.com/problemset/problem/449/D",
      badge: "cf",
      tag: "CF 449D",
      level: "Hard",
      pattern: "SOS + inclusion on AND=0",
    },
    {
      name: "Vowels",
      url: "https://codeforces.com/problemset/problem/383/E",
      badge: "cf",
      tag: "CF 383E",
      level: "Hard",
      pattern: "SOS over alphabet bits",
    },
    {
      name: "SOS practice",
      url: "https://atcoder.jp/contests/dp/tasks/dp_u",
      badge: "atc",
      tag: "ATC DP-U",
      level: "Hard",
      pattern: "3^n grouping; SOS is the faster cousin",
    },
    {
      name: "Bitwise Equations",
      url: "https://www.geeksforgeeks.org/sum-of-bitwise-or-of-all-subsets/",
      badge: "gfg",
      tag: "GfG",
      level: "Medium",
      pattern: "Contribution, not always SOS",
    },
    {
      name: "Maximum XOR of Two Numbers",
      url: "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/",
      badge: "lc",
      tag: "LC 421",
      level: "Medium",
      pattern: "Trie; contrast with SOS-not-XOR",
    },
    {
      name: "Number of Valid Words for Each Puzzle",
      url: "https://leetcode.com/problems/number-of-valid-words-for-each-puzzle/",
      badge: "lc",
      tag: "LC 1178",
      level: "Hard",
      pattern: "Submasks of 7-bit puzzles",
    },
    {
      name: "Count Pairs With AND equal to 0",
      url: "https://codeforces.com/problemset/problem/1416/C",
      badge: "cf",
      tag: "CF 1416C",
      level: "Hard",
      pattern: "Bit DP cousin; XOR inversions",
    },
    {
      name: "Subset Zeta",
      url: "https://cses.fi/problemset/task/2220",
      badge: "gfg",
      tag: "CSES",
      level: "Hard",
      pattern: "Digit-ish; see also SOS blogs",
    },
    {
      name: "And Closure",
      url: "https://atcoder.jp/contests/abc187/tasks/abc187_f",
      badge: "atc",
      tag: "ABC 187F",
      level: "Hard",
      pattern: "Graph + subset DP, SOS optional",
    },
  ],
  spoilers: [
    {
      summary: "Hint for CF 165E Compatible Numbers",
      body: "<p>Two numbers are compatible if a &amp; b = 0, i.e. b is a submask of ~a (restricted to n bits). SOS an existence array of the input values over supersets (or submasks of the complement). For each a print any stored value whose bits sit inside ~a, or -1.</p>",
    },
    {
      summary: "Hint for CF 449D",
      body: "<p>Count subsets whose AND is 0. Inclusion via SOS: let g[mask] = count of values that are supersets of mask. Then 2^{g[mask]} subsets have AND supseteq mask. Möbius to get AND == 0. Mod 1e9+7, handle 2^n with fastpow.</p>",
    },
  ],
  recap: [
    "<strong>F[mask] = sum of A over submasks</strong> in O(n 2^n), not O(3^n).",
    "<strong>For each bit, add f[mask without bit] into f[mask].</strong>",
    "<strong>Inverse is the same loop with minus.</strong>",
    "<strong>Supersets flip the direction</strong> or reverse the index.",
    "<strong>OR-convolution = zeta, multiply, inverse zeta.</strong>",
  ],
  oneliner: "for b for mask: if bit b set, f[mask]+=f[mask^1<<b] | n 2^n | inverse -=",
}),

pack({
  id: "digit-dp",
  difficulty: "Hard",
  readTime: "26 min",
  tagline: "Count (or sum) the numbers ≤ R whose digits satisfy a local property by walking the decimal positions with a tight flag.",
  tags: [ "digit DP", "tight", "counting", "P2" ],
  prereqs: [
    [ "DP Foundations", "dp-foundations.html" ],
  ],
  why: [
    "\"How many numbers ≤ R have digit-sum S / no two adjacent equal / exactly K non-zero digits?\" looks like a loop to R, which dies at R = 10^{18}. Digit DP walks the decimal representation left to right. At each position you choose a digit, remembering only a small state (position, tight, started, sum so far, last digit).",
    "The tight flag is the whole trick. If the prefix so far matches R, the next digit may not exceed R's digit; otherwise 0..9 are free. A started flag avoids counting leading zeros as real digits when the property cares.",
    "Range [L, R] is f(R) - f(L-1), with f(-1) = 0. That reduction is why every problem is \"count ≤ R\". P2 because the state design (what to remember so the property is Markov) is the contest, and tight/started bugs fail hidden tests.",
  ],
  insight: "A number ≤ R is a walk through digit positions where, as long as you have tied R, you are not allowed to step above its next digit. Dropping below frees you forever.",
  yes: [
    "Count / sum of integers in [L, R] with a digit property, R up to 10^18",
    "Digit sum, last digit, adjacent difference, count of a certain digit",
    "\"Classy numbers\", \"numbers with no consecutive 1s in decimal\"",
    "The property depends on O(1) extra (sum ≤ 9*18, last digit, tight, started)",
    "L and R given as strings of up to 18–100 digits",
  ],
  no: [
    "R ≤ 1e6 and the property is awkward → just loop",
    "The property needs the whole number modulo a large coprime in a way that explodes the state",
    "Prime in [L,R] → sieve / segmented sieve, not digit DP",
    "Subsequence of digits matching a regex of length m → add m to the state (still digit DP if m is tiny)",
  ],
  table: [
    [ "Count ≤ R with digit sum = S", "pos, sum, tight, started", "Classic" ],
    [ "[L, R] range", "f(R) − f(L−1)", "Always" ],
    [
      "No leading zeros in the property",
      "started flag",
      "Do not count 0 as a digit 0 until started",
    ],
    [ "Adjacent distinct digits", "last digit in the state", "+1 dimension" ],
    [ "R as a 100-digit string", "pos up to 100, same DP", "Big integers as arrays of digits" ],
    [
      "Sum of such numbers, not count",
      "add the place-value contribution in the transition",
      "Extra long in the DP value",
    ],
    [
      "<strong>Confused with:</strong> generating all numbers",
      "You never emit the numbers; you count walks in the digit trie of ≤ R",
      "States, not enumeration",
    ],
  ],
  constraint: "R ≤ 10^{18} (18 positions) or a 10^4-digit string. Extra state (sum, mod, last) must keep pos * extras * 2 * 2 under 1e7. Answers are long.",
  coreHeading: "pos, tight, started, and the extras",
  core: [
    "Write the digits of R as d[0..len) most-significant first. rec(pos, sum, tight, started) = how many ways to fill positions pos..end. If pos == len, return 1 if the state is legal (and maybe started, if you do not count 0), else 0.",
    "The next digit lo is 0; hi is tight ? d[pos] : 9. For each digit v in lo..hi, recurse with nsum = sum + (started || v>0 ? v : 0), ntight = tight && v==d[pos], nstarted = started || v>0. Memoize on those arguments. Dry-run: count numbers in 0..23 with digit sum 5. Length 2, d = [2,3]. The legal numbers are 5, 14, 23 — three of them. The table below walks the tight tree.",
  ],
  invariant: "<p>rec(pos, extra, tight, started) counts completions of the remaining suffix that stay ≤ R if tight, and that realise a legal extra-state at the end.</p><span class=\"eq\">hi = tight ? d[pos] : 9 &nbsp;&nbsp; ntight = tight &amp;&amp; v == d[pos]</span>",
  extra: [
    {
      kind: "key",
      title: "Leading zeros",
      html: "<p>Until started is true, v = 0 does not add to the digit sum and does not set last-digit. The number 0 itself is the walk of all zeros; decide whether it satisfies the property (sum 0 usually yes if S=0).</p>",
    },
    {
      kind: "tip",
      title: "f(R) - f(L-1)",
      html: "<p>Implement one function on a digit array. For L-1, handle L=0 as 0. String subtraction or parse L as long when it fits, then convert L-1 to digits.</p>",
    },
  ],
  grid: {
    corner: "pos",
    rowHeads: [ "pos0", "pos1", "done" ],
    colHeads: [ "tight1 st0", "tight0 st1", "tight1 st1", "ans" ],
  },
  vars: [ "pos", "tight", "ways" ],
  frames: [
    {
      note: "Leaves: pos=2 (done). A state is 1 way iff running sum is 5, else 0.",
      cells: [
        {
          r: 2,
          c: 3,
          val: "0/1",
          cls: "answer",
        },
      ],
      values: {
        pos: "done",
        tight: "—",
        ways: "sum==5",
      },
    },
    {
      note: "From pos=1, tight=1 (prefix 2, so ones digit 0..3). To reach sum 5 we need ones = 5-tens.",
      cells: [
        {
          r: 1,
          c: 2,
          val: "?",
          cls: "target",
        },
        {
          r: 2,
          c: 3,
          val: "0/1",
          cls: "from",
        },
      ],
      values: {
        pos: 1,
        tight: 1,
        ways: "hi=3",
      },
    },
    {
      note: "Number 23: tens=2, ones=3, sum=5, both tight. One leaf fires.",
      cells: [
        {
          r: 0,
          c: 0,
          val: "…",
        },
        {
          r: 1,
          c: 2,
          val: "1",
          cls: "from",
        },
        {
          r: 2,
          c: 3,
          val: "1",
          cls: "target",
        },
      ],
      values: {
        pos: "23",
        tight: 1,
        ways: 1,
      },
    },
    {
      note: "Number 14: tens=1 < 2, so after tens we are tight=0, ones can be 0..9. ones=4 gives sum 5.",
      cells: [
        {
          r: 1,
          c: 1,
          val: "1",
          cls: "target",
        },
        {
          r: 2,
          c: 3,
          val: "1",
          cls: "from",
        },
      ],
      values: {
        pos: "14",
        tight: 0,
        ways: 1,
      },
    },
    {
      note: "Number 5: leading zero at tens, started stays 0, then ones=5 (and 5>3 so this walk is NOT under tight=1 unless we first put tens=0, hi=2, 0 is allowed, then ones tight with hi=3 — 5 is illegal. Wait: 05 is 5, which is <=23. tens=0, still tight? 0<2 so tight drops, ones 0-9, ones=5 works.",
      cells: [
        {
          r: 1,
          c: 1,
          val: "2",
          cls: "target",
        },
        {
          r: 0,
          c: 0,
          val: "…",
          cls: "from",
        },
      ],
      values: {
        pos: "05",
        tight: 0,
        ways: 1,
      },
    },
    {
      note: "Summing the three successful walks: 5, 14, 23. Start state ways = 3.",
      cells: [
        {
          r: 0,
          c: 0,
          val: "3",
          cls: "target",
        },
        {
          r: 1,
          c: 1,
          val: "2",
          cls: "from",
        },
        {
          r: 1,
          c: 2,
          val: "1",
          cls: "from",
        },
      ],
      values: {
        pos: 0,
        tight: 1,
        ways: 3,
      },
    },
    {
      note: "f(23) = 3. For a range [L,R] subtract f(L-1). No number was enumerated explicitly; only states were counted.",
      cells: [
        {
          r: 0,
          c: 3,
          val: "3",
          cls: "answer",
        },
      ],
      values: {
        pos: "ans",
        tight: "—",
        ways: 3,
      },
    },
  ],
  vizTitle: "Memo table slice: pos × tight for sum-so-far = 0..5, n = 23, target sum 5",
  vizIntro: "Simplified view: rows are digit positions (0 = tens, 1 = ones, 2 = done). Columns are (tight, started) pairs we actually hit. Values are remaining ways to reach sum 5. Target is the state we fill; from is a child position.",
  vizCaption: "Reading top-down, each cell sums the children that keep the running sum ≤ 5. The start cell (pos 0, tight 1, started 0) is 3.",
  mermaid: "graph TD\n  start[\"pos 0 tight, hi = 2\"] --> z[\"v=0, tight drops\"]\n  start --> one[\"v=1, tight drops\"]\n  start --> two[\"v=2, still tight\"]\n  z --> zFree[\"ones 0..9\"]\n  one --> oneFree[\"ones 0..9\"]\n  two --> twoTight[\"ones 0..3\"]",
  merTitle: "The tight bit on n = 23",
  merCaption: "As soon as a digit drops below d[pos], the rest of the number is free (tight = 0).",
  steps: [
    "<strong>Convert R to a digit array</strong> d[0..len) MSB first.",
    "<strong>State:</strong> pos, extra (sum / last / mod), tight, started.",
    "<strong>Base:</strong> pos == len → 1 if extra is legal (and handle 0).",
    "<strong>hi = tight ? d[pos] : 9.</strong> Loop v = 0..hi.",
    "<strong>Recurse</strong> with updated extra, ntight, nstarted. Add the results.",
    "<strong>Memoize</strong> on the tuple. Use long.",
    "<strong>[L,R] = f(R) - f(L-1).</strong>",
  ],
  dryIntro: "Count x in 0..23 with digit sum 5. Walks that succeed.",
  dryCols: [ "tens v", "tight after", "ones v", "sum", "keep?" ],
  dryRows: [
    {
      cells: [ "0", "0", "5", "5", "yes (number 5)" ],
      action: "Leading zero, then free ones.",
      change: true,
    },
    {
      cells: [ "1", "0", "4", "5", "yes (14)" ],
      action: "Dropped below 2.",
      change: true,
    },
    {
      cells: [ "1", "0", "5", "6", "no" ],
      action: "Sum too big.",
    },
    {
      cells: [ "2", "1", "3", "5", "yes (23)" ],
      action: "Stayed tight, ones ≤3.",
      change: true,
    },
    {
      cells: [ "2", "1", "4", "6", "illegal digit" ],
      action: "hi=3.",
    },
    {
      cells: [ "total", "—", "—", "—", "3" ],
      action: "Answer.",
      change: true,
    },
  ],
  code: [
    {
      tab: "Recursion",
      file: "DigitRec.java",
      code: "public class DigitRec {\n\n    static int[] d;\n    static int target;\n\n    static long rec(int pos, int sum, boolean tight, boolean started) {\n        if (pos == d.length) {\n            return (started && sum == target) || (!started && target == 0) ? 1 : 0;\n        }\n        int hi = tight ? d[pos] : 9;\n        long ans = 0;\n        for (int v = 0; v <= hi; v++) {\n            boolean nst = started || v > 0;\n            int nsum = sum + (nst ? v : 0);\n            if (nsum > target) {\n                continue;\n            }\n            ans += rec(pos + 1, nsum, tight && v == d[pos], nst);\n        }\n        return ans;\n    }\n\n    static long count(int n, int s) {\n        d = String.valueOf(n).chars().map(c -> c - '0').toArray();\n        target = s;\n        return rec(0, 0, true, false);\n    }\n\n    public static void main(String[] args) {\n        System.out.println(count(23, 5));\n    }\n    // Input : R=23, S=5\n    // Output: 3\n}",
    },
    {
      tab: "Memo",
      file: "DigitMemo.java",
      code: "import java.util.Arrays;\n\npublic class DigitMemo {\n\n    static int[] d;\n    static int target;\n    static long[][][][] memo;\n\n    static long rec(int pos, int sum, int tight, int started) {\n        if (pos == d.length) {\n            return (started == 1 && sum == target) || (started == 0 && target == 0) ? 1 : 0;\n        }\n        if (memo[pos][sum][tight][started] != -1) {\n            return memo[pos][sum][tight][started];\n        }\n        int hi = tight == 1 ? d[pos] : 9;\n        long ans = 0;\n        for (int v = 0; v <= hi; v++) {\n            int nst = (started == 1 || v > 0) ? 1 : 0;\n            int nsum = sum + (nst == 1 ? v : 0);\n            if (nsum > target) {\n                continue;\n            }\n            ans += rec(pos + 1, nsum, (tight == 1 && v == d[pos]) ? 1 : 0, nst);\n        }\n        return memo[pos][sum][tight][started] = ans;\n    }\n\n    static long count(int n, int s) {\n        d = String.valueOf(n).chars().map(c -> c - '0').toArray();\n        target = s;\n        memo = new long[d.length][s + 1][2][2];\n        for (long[][][] a : memo) {\n            for (long[][] b : a) {\n                for (long[] c : b) {\n                    Arrays.fill(c, -1);\n                }\n            }\n        }\n        return rec(0, 0, 1, 0);\n    }\n\n    public static void main(String[] args) {\n        System.out.println(count(23, 5));\n    }\n    // Input : R=23, S=5\n    // Output: 3\n}",
    },
    {
      tab: "Tabulated",
      file: "DigitTab.java",
      code: "public class DigitTab {\n\n    static long count(int n, int S) {\n        int[] d = String.valueOf(n).chars().map(c -> c - '0').toArray();\n        int len = d.length;\n        // dp[pos][sum][tight][started] remaining from pos — fill pos = len down to 0\n        long[][][][] dp = new long[len + 1][S + 1][2][2];\n        for (int sum = 0; sum <= S; sum++) {\n            dp[len][sum][0][1] = sum == S ? 1 : 0;\n            dp[len][sum][1][1] = sum == S ? 1 : 0;\n            dp[len][0][0][0] = S == 0 ? 1 : 0;\n            dp[len][0][1][0] = S == 0 ? 1 : 0;\n        }\n        for (int pos = len - 1; pos >= 0; pos--) {\n            for (int sum = 0; sum <= S; sum++) {\n                for (int tight = 0; tight < 2; tight++) {\n                    for (int started = 0; started < 2; started++) {\n                        int hi = tight == 1 ? d[pos] : 9;\n                        long ans = 0;\n                        for (int v = 0; v <= hi; v++) {\n                            int nst = (started == 1 || v > 0) ? 1 : 0;\n                            int nsum = sum + (nst == 1 ? v : 0);\n                            if (nsum > S) {\n                                continue;\n                            }\n                            int nt = (tight == 1 && v == d[pos]) ? 1 : 0;\n                            ans += dp[pos + 1][nsum][nt][nst];\n                        }\n                        dp[pos][sum][tight][started] = ans;\n                    }\n                }\n            }\n        }\n        return dp[0][0][1][0];\n    }\n\n    public static void main(String[] args) {\n        System.out.println(count(23, 5));\n    }\n    // Input : R=23, S=5\n    // Output: 3\n}",
    },
  ],
  complexity: {
    time: "O(len * extra * 10)",
    space: "O(len * extra) memo",
    derivation: [
      "<p>len positions, extra = O(digitSum) or O(mod), 2 tight, 2 started, 10 digit tries:</p>",
      "<span class=\"eq\">T = &Theta;(len &middot; extra &middot; 10)</span>",
    ],
    compare: [
      [ "Loop to R", "O(R log R)", "O(1)", "R≤1e7" ],
      [ "Digit DP memo", "O(len * extra * 10)", "O(len * extra)", "R=1e18" ],
      [ "Digit DP tabulated", "O(len * extra * 10)", "O(len * extra)", "Same bound, no recursion" ],
      [ "Digit DP on a big string", "O(|s| * extra * 10)", "O(|s| * extra)", "1000 digits" ],
    ],
  },
  pitfalls: [
    {
      title: "Forgetting tight",
      bug: "Counting all len-digit strings, including those > R.",
      fix: "hi depends on tight; ntight = tight && v==d[pos].",
    },
    {
      title: "Leading zeros counted as digits",
      bug: "Number 5 counted as tens=0, ones=5 with sum 0+5 but also as a 2-digit 05 with last-digit property treating 0 as last.",
      fix: "started flag. Zeros before the first non-zero do not update extra.",
    },
    {
      title: "f(R) - f(L) instead of f(L-1)",
      bug: "Drops L or double-counts, depending on inclusivity.",
      fix: "Closed range [L,R] = f(R) - f(L-1). L=0 → just f(R).",
    },
    {
      title: "Memo key missing a flag",
      bug: "Same pos and sum reused for tight and non-tight, mixing answers.",
      fix: "Every argument of rec is part of the key, including tight and started.",
    },
    {
      title: "int for the answer",
      bug: "Count of 18-digit numbers is up to 1e18.",
      fix: "long. Modulus if the statement asks.",
    },
    {
      title: "target == 0 and the number 0",
      bug: "started stays false all the way; you return 0 and miss the empty/zero case, or return 1 and overcount.",
      fix: "Decide explicitly: !started && target==0 is the number 0.",
    },
  ],
  variants: [
    [
      "Sum of numbers with the property",
      "DP returns (count, sum). When you place digit v at a remaining place-value, add v * 10^rest * count_of_suffix.",
      "Two longs per state",
      "CF 55C / digit-sum sums",
    ],
    [
      "Last digit / adjacent",
      "Put last in the state, 10 extra values, or 11 with a dummy for unstarted.",
      "No two consecutive equal",
      "Classic",
    ],
    [
      "Mod M",
      "running value % M in the state. Extra = M. M ≤ 100 is the usual.",
      "CF 628D",
      "M larger → not digit DP",
    ],
    [
      "Digits in a given alphabet / binary",
      "Same template, base b instead of 10, hi in 0..b-1.",
      "Binary digit DP is the same idea",
      "AtCoder DP-S",
    ],
  ],
  followups: [
    [
      "Why is dropping below R irreversible?",
      "<p>The remaining suffix of R is some number T. Once your prefix is already strictly smaller, any suffix of the right length is still ≤ R. So tight never turns back on. That is why one bit suffices.</p>",
    ],
    [
      "Do I need started if I only care about digit sum?",
      "<p>Leading zeros add 0 to the sum, so for pure digit-sum you can skip started. You need it as soon as \"count of digits\", \"last digit\", or \"no leading zero in the output number\" matters. Keeping it always is cheaper than debugging.</p>",
    ],
    [
      "How do I handle L and R as 1000-digit strings?",
      "<p>f on a char array. For L-1, decrement the digit string (borrow). Do not parse as long. Memo dimension pos ≤ 1000 is fine.</p>",
    ],
    [
      "Is this related to automata?",
      "<p>Yes. The extra state is the automaton of the property; tight is the automaton of ≤ R. Digit DP is counting walks of length len on the product automaton.</p>",
    ],
  ],
  problems: [
    {
      name: "Numbers At Most N Given Digit Set",
      url: "https://leetcode.com/problems/numbers-at-most-n-given-digit-set/",
      badge: "lc",
      tag: "LC 902",
      level: "Hard",
      pattern: "Digit DP with a restricted alphabet",
    },
    {
      name: "Digit Count in Range",
      url: "https://leetcode.com/problems/digit-count-in-range/",
      badge: "lc",
      tag: "LC 1067",
      level: "Hard",
      pattern: "Count digit d in [L,R]",
    },
    {
      name: "Numbers With Repeated Digits",
      url: "https://leetcode.com/problems/numbers-with-repeated-digits/",
      badge: "lc",
      tag: "LC 1012",
      level: "Hard",
      pattern: "Used-digit mask + tight",
    },
    {
      name: "Digit DP",
      url: "https://atcoder.jp/contests/dp/tasks/dp_s",
      badge: "atc",
      tag: "ATC DP-S",
      level: "Medium",
      pattern: "Digit sum % D, big K as string",
    },
    {
      name: "Classy Numbers",
      url: "https://codeforces.com/problemset/problem/1036/C",
      badge: "cf",
      tag: "CF 1036C",
      level: "Medium",
      pattern: "At most 3 non-zero digits",
    },
    {
      name: "Magic Numbers",
      url: "https://codeforces.com/problemset/problem/628/D",
      badge: "cf",
      tag: "CF 628D",
      level: "Hard",
      pattern: "Even positions digit d, mod m",
    },
    {
      name: "Investigation",
      url: "https://lightoj.com/problem/investigation",
      badge: "gfg",
      tag: "LightOJ",
      level: "Medium",
      pattern: "Digit sum and number both % k",
    },
    {
      name: "Counting Numbers",
      url: "https://cses.fi/problemset/task/2220",
      badge: "gfg",
      tag: "CSES",
      level: "Medium",
      pattern: "No two adjacent digits equal",
    },
    {
      name: "Digit DP GfG",
      url: "https://www.geeksforgeeks.org/digit-dp-introduction/",
      badge: "gfg",
      tag: "GfG",
      level: "Medium",
      pattern: "Tutorial + practice links",
    },
    {
      name: "Non-negative Integers without Consecutive Ones",
      url: "https://leetcode.com/problems/non-negative-integers-without-consecutive-ones/",
      badge: "lc",
      tag: "LC 600",
      level: "Hard",
      pattern: "Binary digit DP",
    },
  ],
  spoilers: [
    {
      summary: "Hint for CF 1036C Classy Numbers",
      body: "<p>A classy number has at most 3 non-zero digits. State = (pos, nonZeroCount, tight). started is implied by count&gt;0. n ≤ 10^18, q ≤ 1e4, so memo per query (reset by a vis-stamp). [L,R] = f(R)-f(L-1).</p>",
    },
    {
      summary: "Hint for AtCoder DP-S",
      body: "<p>K has up to 10000 digits, D ≤ 100. Count numbers ≤ K whose digit sum is 0 mod D. State (pos, sumMod, tight). Mod 1e9+7. Do not parse K as long. Subtract 0 if you excluded 0 and the problem includes it — read the statement; usually 0 is allowed and has sum 0.</p>",
    },
  ],
  recap: [
    "<strong>Walk digits MSB first</strong> with tight (and usually started).",
    "<strong>hi = tight ? d[pos] : 9.</strong> ntight = tight && v==d[pos].",
    "<strong>Extra state holds the property</strong> (sum, last, mask, mod).",
    "<strong>[L,R] = f(R) - f(L-1)</strong>, long answers.",
    "<strong>Memo every argument</strong> including the two flags.",
  ],
  oneliner: "rec(pos,extra,tight,started) | hi=tight?d[pos]:9 | [L,R]=f(R)-f(L-1) | long",
}),

pack({
  id: "probability-and-expectation-dp",
  difficulty: "Hard",
  readTime: "26 min",
  tagline: "Expectation is linear, and E[state] is 1 (or a cost) plus a weighted sum of neighbour expectations &mdash; a linear system that DP solves when the state DAG is acyclic.",
  tags: [ "expectation", "probability", "coupon", "P2" ],
  prereqs: [
    [ "DP Foundations", "dp-foundations.html" ],
    [ "Game Theory &amp; Grundy", "game-theory-and-grundy.html" ],
  ],
  why: [
    "\"Expected number of rolls until all faces have appeared\", \"expected days until n coupons\", \"probability of ruin\", and \"expected score of an optimal player\" are the same writing task: name a state, write E[s] or P[s] in terms of neighbours, and solve the system in a legal order (or by Gaussian elimination if there are cycles).",
    "Linearity of expectation is the cheat code that removes dependence: you do not need the distribution of a sum to know its mean. Indicator variables turn \"expected count of X\" into a sum of probabilities, often without any DP at all. Use DP when the next step depends on a compact state.",
    "P2 because floating-point, self-loops (the \"stay with probability p\" term that you must algebraically move to the left side), and cyclic graphs (Gaussian) are the usual sources of WA. The dry run is coupon collector for n = 3.",
  ],
  insight: "If from state i you always spend 1 and then go to j with probability p_j, then E[i] = 1 + sum p_j E[j]. If a p_i term points back at i, subtract it: E[i] = (1 + sum_{j\neq i} p_j E[j]) / (1 - p_i).",
  yes: [
    "Expected time / expected score / probability of reaching a set of states",
    "Coupon collector, dice until a pattern, frog on a line with random jumps",
    "Optimal play that maximises expected value (not just win/lose)",
    "Linearity: expected number of something = sum of indicator probabilities",
    "n states, each with a known distribution over next states",
  ],
  no: [
    "You need the full distribution, not the mean → track more, or generating functions",
    "Adversarial (worst-case) play, not random → game DP / grundy",
    "The graph of states has cycles and you only have an iterative \"relax E\" without solving the linear system",
    "n is 1e5 and each state has a dense transition → the system is too big",
  ],
  table: [
    [ "Coupon collector", "E[k] from k distinct", "E[k]=(n/(n-k))+E[k+1]" ],
    [
      "Probability of reaching t",
      "P[s] = sum p_j P[j], P[t]=1, P[absorb lose]=0",
      "DAG or Gaussian",
    ],
    [ "Expected steps on a DAG", "Post-order / reverse topo", "This page" ],
    [
      "Expected steps with self-loops",
      "Move E[i] to the left, divide by 1-p_stay",
      "Algebra",
    ],
    [ "Expected count of events", "Linearity, no DP", "Indicators" ],
    [ "Optimal expected score", "max over actions of the expected next", "Bellman" ],
    [
      "<strong>Confused with:</strong> most probable path",
      "That is max-product (or log-sum), not expectation",
      "Viterbi vs this page",
    ],
  ],
  constraint: "States ≤ 1e4 for a DAG. Cyclic systems of size n ≤ 200 need Gaussian O(n&sup3;). Use double; print with a fixed precision. n coupons is O(n).",
  coreHeading: "Write the equation, then pick an order",
  core: [
    "Coupon collector, n faces, E[k] = expected extra rolls when you already have k distinct. E[n] = 0. From k you roll: stay with k/n, advance with (n-k)/n. So E[k] = 1 + (k/n) E[k] + ((n-k)/n) E[k+1]. Rearrange: E[k] = n/(n-k) + E[k+1]. Walk k = n-1 down to 0. For n=3: E[2]=3, E[1]=3/2+3=4.5, E[0]=1+4.5=5.5 = 3 H_3.",
    "Probability DP is the same skeleton without the \"+1\" and with absorbing 0/1 bases. On a DAG, fill sinks first. On a cycle, write every equation and Gaussian-eliminate. Linearity: expected number of distinct values in a random sample is sum_v (1 - (1-1/n)^k), no state required. Reach for indicators before you reach for a table.",
  ],
  invariant: "<p>For a state with a forced step of cost c and transition probabilities p_j (including possibly j = i):</p><span class=\"eq\">E[i] = c + &sum; p<sub>j</sub> E[j] &nbsp;&nbsp;⇒&nbsp;&nbsp; E[i] = (c + &sum;<sub>j≠i</sub> p<sub>j</sub> E[j]) / (1-p<sub>i</sub>)</span>",
  extra: [
    {
      kind: "warn",
      title: "Forgetting to move the self-loop",
      html: "<p>If you code E[i] = 1 + p*E[i] + (1-p)*E[next] as a one-liner that reads the old E[i] (0), you compute a wrong smaller value. Always solve for E[i] algebraically when p_stay &gt; 0.</p>",
    },
    {
      kind: "math",
      title: "Coupon collector closed form",
      html: "<p>E = n (1 + 1/2 + … + 1/n) = n H_n. The DP is how you derive it, and how you handle variants (only a subset of faces, a pattern of last rolls, a max-face constraint) where no closed form is sitting around.</p>",
    },
  ],
  grid: {
    corner: "k",
    rowHeads: [ "E" ],
    colHeads: [ "0", "1", "2", "3" ],
  },
  vars: [ "k", "formula", "E[k]" ],
  frames: [
    {
      note: "E[3] = 0. You already have every face.",
      cells: [
        {
          r: 0,
          c: 3,
          val: "0",
          cls: "answer",
        },
      ],
      values: {
        k: 3,
        formula: "absorb",
        "E[k]": 0,
      },
    },
    {
      note: "k=2. Stay 2/3, advance 1/3. E[2] = 1 + (2/3)E[2] + (1/3)*0 ⇒ E[2] = 3. Target 2, from 3.",
      cells: [
        {
          r: 0,
          c: 2,
          val: "3",
          cls: "target",
        },
        {
          r: 0,
          c: 3,
          val: "0",
          cls: "from",
        },
      ],
      values: {
        k: 2,
        formula: "3/(3-2)",
        "E[k]": 3,
      },
    },
    {
      note: "k=1. E[1] = 3/(3-1) + E[2] = 1.5 + 3 = 4.5. Target 1, from 2.",
      cells: [
        {
          r: 0,
          c: 1,
          val: "4.5",
          cls: "target",
        },
        {
          r: 0,
          c: 2,
          val: "3",
          cls: "from",
        },
      ],
      values: {
        k: 1,
        formula: "3/2 + E[2]",
        "E[k]": 4.5,
      },
    },
    {
      note: "k=0. E[0] = 3/3 + E[1] = 1 + 4.5 = 5.5. Target 0, from 1.",
      cells: [
        {
          r: 0,
          c: 0,
          val: "5.5",
          cls: "target",
        },
        {
          r: 0,
          c: 1,
          val: "4.5",
          cls: "from",
        },
      ],
      values: {
        k: 0,
        formula: "1 + E[1]",
        "E[k]": 5.5,
      },
    },
    {
      note: "Check: 3 * (1 + 1/2 + 1/3) = 3 * 11/6 = 5.5. Matches.",
      cells: [
        {
          r: 0,
          c: 0,
          val: "5.5",
          cls: "answer",
        },
        {
          r: 0,
          c: 1,
          val: "4.5",
        },
        {
          r: 0,
          c: 2,
          val: "3",
        },
        {
          r: 0,
          c: 3,
          val: "0",
        },
      ],
      values: {
        k: "H_3",
        formula: "3 H_3",
        "E[k]": 5.5,
      },
    },
    {
      note: "If you had forgotten the self-loop algebra at k=2 and coded E=1+(1/3)*0, you would have written 1 instead of 3.",
      cells: [
        {
          r: 0,
          c: 2,
          val: "1",
          cls: "block",
        },
        {
          r: 0,
          c: 2,
          val: "3",
          cls: "from",
        },
      ],
      values: {
        k: "bug",
        formula: "forgot stay",
        "E[k]": 1,
      },
    },
    {
      note: "Start at 0 distinct. Answer 5.5 expected rolls for 3 faces.",
      cells: [
        {
          r: 0,
          c: 0,
          val: "5.5",
          cls: "target",
        },
      ],
      values: {
        k: 0,
        formula: "start",
        "E[k]": 5.5,
      },
    },
  ],
  vizTitle: "Coupon collector n = 3, E[k] extra rolls from k distinct",
  vizIntro: "One row, k = 3 down to 0. Target is the cell we solve; from is the already-known E[k+1] (and the implicit self-loop we divided out).",
  vizCaption: "E[3]=0, E[2]=3, E[1]=4.5, E[0]=5.5. That 5.5 is 3(1+1/2+1/3).",
  mermaid: "flowchart TD\n  write[\"write E[i] = c + sum p_j E[j]\"] --> stay{\"is p_i > 0?\"}\n  stay -- no --> dag[\"fill children first, then assign\"]\n  stay -- yes --> alg[\"E[i] = (c + sum of others) / (1 - p_i)\"]\n  alg --> dag\n  dag --> cyc{\"any cycle among states?\"}\n  cyc -- yes --> gauss[\"Gaussian elimination on the system\"]\n  cyc -- no --> doneNode[\"done\"]",
  merTitle: "Solving the self-loop",
  merCaption: "Any p_stay must be moved to the left-hand side before you code the assignment.",
  steps: [
    "<strong>Name the state</strong> so the future is independent of the past given that state.",
    "<strong>Write E[s] or P[s]</strong> as cost + sum p * next.",
    "<strong>Algebraically remove self-loops.</strong>",
    "<strong>If the graph is a DAG,</strong> fill sinks first (reverse topo / decreasing rank).",
    "<strong>If there are cycles,</strong> build the linear system and Gaussian-eliminate.",
    "<strong>Check a closed form</strong> on a tiny n (coupon: n H_n) before submitting.",
    "<strong>Use double</strong> and the required print precision.",
  ],
  dryIntro: "Coupon n = 3. Rearranged E[k] = n/(n-k) + E[k+1].",
  dryCols: [ "k", "n/(n-k)", "E[k+1]", "E[k]" ],
  dryRows: [
    {
      cells: [ "3", "—", "—", "0" ],
      action: "Done.",
    },
    {
      cells: [ "2", "3/1=3", "0", "3" ],
      action: "Self-loop divided out.",
      change: true,
    },
    {
      cells: [ "1", "3/2=1.5", "3", "4.5" ],
      action: "",
    },
    {
      cells: [ "0", "3/3=1", "4.5", "5.5" ],
      action: "Answer.",
      change: true,
    },
  ],
  code: [
    {
      tab: "Recursion",
      file: "ExpRec.java",
      code: "public class ExpRec {\n\n    static double e(int k, int n) {\n        if (k == n) {\n            return 0;\n        }\n        return (double) n / (n - k) + e(k + 1, n);\n    }\n\n    public static void main(String[] args) {\n        System.out.println(e(0, 3));\n    }\n    // Input : n = 3 coupons, start with 0\n    // Output: 5.5\n}",
    },
    {
      tab: "Memo / Tabulated",
      file: "ExpTab.java",
      code: "public class ExpTab {\n\n    static double coupon(int n) {\n        double[] e = new double[n + 1];\n        e[n] = 0;\n        for (int k = n - 1; k >= 0; k--) {\n            e[k] = (double) n / (n - k) + e[k + 1];\n        }\n        return e[0];\n    }\n\n    public static void main(String[] args) {\n        System.out.println(coupon(3));\n    }\n    // Input : n = 3\n    // Output: 5.5\n}",
    },
    {
      tab: "Space-opt",
      file: "ExpRoll.java",
      code: "public class ExpRoll {\n\n    static double coupon(int n) {\n        double e = 0;\n        for (int have = n - 1; have >= 0; have--) {\n            e = (double) n / (n - have) + e;\n        }\n        return e;\n    }\n\n    public static void main(String[] args) {\n        double e = coupon(3);\n        double h = 1 + 0.5 + 1.0 / 3.0;\n        System.out.println(e + \" \" + (3 * h));\n    }\n    // Input : n = 3\n    // Output: 5.5 5.5\n}",
    },
  ],
  complexity: {
    time: "O(states) on a DAG; O(n³) Gaussian on a cyclic system of n states",
    space: "O(states)",
    derivation: [
      "<p>Coupon collector is n decreasing assignments:</p>",
      "<span class=\"eq\">T = &Theta;(n) &nbsp;&nbsp; E = n H<sub>n</sub></span>",
    ],
    compare: [
      [ "DAG expectation", "O(S + transitions)", "O(S)", "Fill sinks first" ],
      [ "Self-loop algebra", "O(1) extra", "—", "Divide by 1-p" ],
      [ "Gaussian", "O(n³)", "O(n²)", "Cycles, n≤200" ],
      [ "Linearity only", "O(terms)", "O(1)", "When indicators suffice" ],
    ],
  },
  pitfalls: [
    {
      title: "Not dividing out p_stay",
      bug: "E coded as 1 + p*E + (1-p)*Enext using E=0, so you miss the geometric waiting time.",
      fix: "E = (1 + (1-p)*Enext) / (1-p) = 1/(1-p) + Enext. For coupon, 1/(1-k/n) = n/(n-k).",
    },
    {
      title: "Cyclic system filled in an arbitrary order",
      bug: "Each assignment uses stale neighbours; the numbers never become consistent.",
      fix: "Gaussian (or iterate to convergence only if you prove contraction and the judge's epsilon is loose).",
    },
    {
      title: "Probability not expectation, but you add +1",
      bug: "P[s] does not pay a cost. The +1 is for time.",
      fix: "P[s] = sum p_j P[j]. E[s] = c + sum p_j E[j].",
    },
    {
      title: "Using float",
      bug: "Precision WA on 1e-9 relative.",
      fix: "double, and print 10+ decimals if asked. Sometimes the answer is a rational you should output as a fraction.",
    },
    {
      title: "Linearity forgotten, huge DP built",
      bug: "Expected number of distinct = n * (1 - ((n-1)/n)^k), one line.",
      fix: "Ask whether the question is a sum of indicators before designing a state.",
    },
    {
      title: "Absorbing states not pinned",
      bug: "E[n] left uninitialised, or P[lose] left as a variable.",
      fix: "Write the bases first: E[done]=0, P[success]=1, P[fail]=0.",
    },
  ],
  variants: [
    [
      "Probability of reaching t",
      "Same DAG, no +1, bases 0/1.",
      "P[s] = sum p P[next]",
      "Gambler's ruin has a closed form too",
    ],
    [
      "Expected max / optimal play",
      "At a state, max (or min) over actions of the expected next. Still a DAG if the state rank decreases.",
      "AtCoder DP-I / J",
      "Bellman expectation",
    ],
    [
      "Pattern on a die / string",
      "State = current KMP prefix of the pattern. Expected extra rolls to absorb.",
      "Classic string-expectation",
      "Self-loops from KMP fail",
    ],
    [
      "Gaussian on a graph",
      "E[v] = 1 + average of neighbours, E[t]=0. n≤200.",
      "CF 148D is different (game); CF 280C uses linearity on a tree",
      "When cycles exist",
    ],
  ],
  followups: [
    [
      "When is linearity enough?",
      "<p>Whenever the question is a sum (count, total length, total cost) and each term's expectation is easy. Indicators for \"does event i happen\" are the usual. You need a state DP when the question is a waiting time whose rate depends on progress, or a max, or a probability of a path property.</p>",
    ],
    [
      "How do I handle a cycle of two states?",
      "<p>Two equations, two unknowns. Substitute. For larger cycles, Gaussian with partial pivot on doubles. If the chain is absorbing, the system is non-singular.</p>",
    ],
    [
      "Expected value of a max?",
      "<p>Linearity does <em>not</em> pass through max. You need the distribution (or a state that is the current max). That is why \"expected maximum of k dice\" is a distribution DP, not a one-line indicator.</p>",
    ],
    [
      "Why coupon is n H_n?",
      "<p>Waiting to hit a new face when k are known is geometric with success (n-k)/n, mean n/(n-k). Sum from k=0 to n-1. That is n H_n.</p>",
    ],
  ],
  problems: [
    {
      name: "New 21 Game",
      url: "https://leetcode.com/problems/new-21-game/",
      badge: "lc",
      tag: "LC 837",
      level: "Medium",
      pattern: "Probability DP, sliding window of W",
    },
    {
      name: "Soup Servings",
      url: "https://leetcode.com/problems/soup-servings/",
      badge: "lc",
      tag: "LC 808",
      level: "Medium",
      pattern: "P[empty A first], memo + limit",
    },
    {
      name: "Knight Probability in Chessboard",
      url: "https://leetcode.com/problems/knight-probability-in-chessboard/",
      badge: "lc",
      tag: "LC 688",
      level: "Medium",
      pattern: "P on a grid, k steps",
    },
    {
      name: "Coins",
      url: "https://atcoder.jp/contests/dp/tasks/dp_i",
      badge: "atc",
      tag: "ATC DP-I",
      level: "Medium",
      pattern: "P[heads > tails] after n tosses",
    },
    {
      name: "Sushi",
      url: "https://atcoder.jp/contests/dp/tasks/dp_j",
      badge: "atc",
      tag: "ATC DP-J",
      level: "Hard",
      pattern: "3D expectation, self-loops",
    },
    {
      name: "Bag of mice",
      url: "https://codeforces.com/problemset/problem/148/D",
      badge: "cf",
      tag: "CF 148D",
      level: "Medium",
      pattern: "P[princess wins], game + random",
    },
    {
      name: "Game on Tree",
      url: "https://codeforces.com/problemset/problem/280/C",
      badge: "cf",
      tag: "CF 280C",
      level: "Hard",
      pattern: "Linearity: 1/depth contribution",
    },
    {
      name: "Expectation",
      url: "https://codeforces.com/problemset/problem/453/A",
      badge: "cf",
      tag: "CF 453A",
      level: "Medium",
      pattern: "E[max of n dice]",
    },
    {
      name: "Dice Probability",
      url: "https://cses.fi/problemset/task/1725",
      badge: "gfg",
      tag: "CSES",
      level: "Medium",
      pattern: "Distribution of sum of n dice",
    },
    {
      name: "Expected steps",
      url: "https://www.geeksforgeeks.org/expected-number-of-trials-until-n-consecutive-heads/",
      badge: "gfg",
      tag: "GfG",
      level: "Medium",
      pattern: "Pattern expectation, KMP-like state",
    },
  ],
  spoilers: [
    {
      summary: "Hint for AtCoder DP-J Sushi",
      body: "<p>State (a,b,c) = counts of 1-sushi, 2-sushi, 3-sushi dishes. From (a,b,c) you may draw empty (n-a-b-c)/n and stay. Divide that self-loop out. Transitions: a 3 becomes a 2, etc. E[0,0,0]=0. Memo on the triple. n≤300 is O(n^3).</p>",
    },
    {
      summary: "Hint for CF 280C",
      body: "<p>A random permutation of deletion order. A vertex v survives in its \"component\" until the first of its ancestors (including itself) is deleted. E[contribution of v] = 1 / depth(v) from the root (size of the ancestor chain). Sum over v. Linearity, no DP table. Tree DFS for depths.</p>",
    },
  ],
  recap: [
    "<strong>Write the equation first</strong>, then pick DAG order or Gaussian.",
    "<strong>Self-loops: divide by 1-p_stay.</strong>",
    "<strong>Coupon: E[k] = n/(n-k) + E[k+1]</strong>, total n H_n.",
    "<strong>Linearity beats a table</strong> when the question is a sum of indicators.",
    "<strong>double, pin absorbing bases</strong> (0 / 1 / E=0).",
  ],
  oneliner: "E=c+sum p E[next] | divide out p_stay | DAG sinks first else Gaussian | try linearity",
}),

pack({
  id: "dp-optimizations",
  difficulty: "Hard",
  readTime: "28 min",
  tagline: "When the naive transition is O(n) per state, convexity or monotonicity of the argmin lets you drop a log or a full factor of n.",
  tags: [ "CHT", "D&C opt", "Knuth", "P2" ],
  prereqs: [
    [ "Knapsack Family", "knapsack-family.html" ],
    [ "Interval DP", "interval-dp.html" ],
  ],
  why: [
    "A huge family of DPs looks like dp[i] = min_{j &lt; i} dp[j] + C(j, i), or the 2D form dp[i][j] = min_{i ≤ k &lt; j} dp[i][k] + dp[k+1][j] + C(i, j). Naive is O(n&sup2;) or O(n&sup3;). When C satisfies a quadrangle inequality or the opt pointer is monotone, Knuth, divide-and-conquer optimisation, and Convex Hull Trick cut this to O(n&sup2;) or O(n log n).",
    "You do not invent the inequality in an interview. You recognise the shape (layered DP on a line, MCM-like, or min of linear functions) and name the tool. The implementation is a hull of lines or a recursive split of the opt range.",
    "P2 because the proofs are short if you already believe the quadrangle inequality, and because the hull must be maintained carefully (slopes monotone → deque; otherwise a Li Chao tree / multiset).",
  ],
  insight: "If the best j for i does not decrease as i grows (or the best k for [l,r] sits between the bests of the two smaller intervals), you may restrict the search window and the extra factor of n disappears.",
  yes: [
    "dp[i] = min_{j<i} dp[j] + C(j,i) with C satisfying QI, n = 1e5",
    "Layered: dp[k][i] = min_{j<i} dp[k-1][j] + C(j,i), k layers, n=3000..1e5",
    "MCM-like dp[l][r] with monotone argmin (Knuth)",
    "C(j,i) = b[j] * a[i] + extra(j) — lines of slope b[j]",
    "CF / AtCoder problems tagged cht, d&c opt, knuth",
  ],
  no: [
    "C is an arbitrary table with no inequality → you cannot drop the inner loop",
    "n ≤ 400 interval DP without QI → stay O(n&sup3;)",
    "The min is over a data-structure query you already have (Fenwick of max) → that is enough",
    "Online slopes that are not monotone and n is 1e5 → Li Chao, still this family but heavier",
  ],
  table: [
    [ "opt[i] ≤ opt[i+1] on a 1D rec", "D&C opt or SMAWK", "O(n log n) per layer" ],
    [ "opt[l][r-1] ≤ opt[l][r] ≤ opt[l+1][r]", "Knuth", "O(n²) interval" ],
    [ "C(j,i) = slope[j] * x[i] + intercept[j]", "CHT / Li Chao", "O(n) deque or O(n log)" ],
    [
      "Quadrangle inequality on C",
      "Implies opt monotone",
      "Check C(a,c)+C(b,d) ≤ C(a,d)+C(b,c)",
    ],
    [ "Layered partitions into k groups", "D&C opt on the layer", "CF 321E" ],
    [ "Aliens trick / wqs", "When k is the layer count and dp is convex in k", "P2 extra" ],
    [
      "<strong>Confused with:</strong> Knuth-Morris-Pratt",
      "Different Knuth. This Knuth is the MCM opt-pointer trick",
      "Name \"Knuth optimisation\"",
    ],
  ],
  constraint: "n = 3000 with k = 800 is the D&C-opt signature (nk log n). n = 1e5 with line queries is CHT. n = 4000 MCM-like is Knuth O(n&sup2;). Prove or cite QI before coding.",
  coreHeading: "Three tools, one monotone idea",
  core: [
    "Knuth (interval): if opt[l][r] is the best k and opt[l][r-1] ≤ opt[l][r] ≤ opt[l+1][r], then when you fill by length you only walk k in that shrinking range. Total k-iterations become O(n&sup2;).",
    "D&C opt (layered): for a fixed layer, the opt j as a function of i is monotone. To fill i in [L,R], compute the middle i, brute j in the allowed [jL, jR], then recurse left with jR = that opt and right with jL = that opt. O(n log n) per layer. CHT: dp[i] = min_j (m_j * x_i + b_j) with x increasing and m monotone. Keep a deque of lines, pop back while the new line makes a worse intersection, pop front while the next line is better at x_i. Amortised O(1) per query.",
  ],
  invariant: "<p>Name which monotonicity you have. Knuth: 2D opt nest. D&C: 1D opt monotone per layer. CHT: the choices are lines and the query x is sorted.</p><span class=\"eq\">dp[i] = min<sub>j &lt; i</sub> dp[j] + C(j, i)</span>",
  extra: [
    {
      kind: "math",
      title: "Quadrangle inequality",
      html: "<p>C(a,c)+C(b,d) ≤ C(a,d)+C(b,c) for a≤b≤c≤d. Together with monotonicity of C, this is the usual sufficient condition for Knuth and for D&C opt. On a line with C = cost of a segment, convex costs often satisfy it.</p>",
    },
    {
      kind: "tip",
      title: "When slopes are not sorted",
      html: "<p>Li Chao segment tree: each node stores one line, and you recurse on the half where the new line is better. O(n log X) or O(n log n) on compressed x. Heavier constant, no monotonicity needed.</p>",
    },
  ],
  grid: {
    corner: "l\\r",
    rowHeads: [ "0", "1", "2" ],
    colHeads: [ "1", "2", "3" ],
  },
  vars: [ "l,r", "k-range", "dp" ],
  frames: [
    {
      note: "Gap 1: adjacent, no split. dp = C = 1.",
      cells: [
        {
          r: 0,
          c: 0,
          val: "1",
        },
        {
          r: 1,
          c: 1,
          val: "1",
        },
        {
          r: 2,
          c: 2,
          val: "1",
        },
      ],
      values: {
        "l,r": "gap1",
        "k-range": "none",
        dp: 1,
      },
    },
    {
      note: "(0,2): k=1 only. dp = 0+0+C(0,2)=4. Target (0,2).",
      cells: [
        {
          r: 0,
          c: 1,
          val: "4",
          cls: "target",
        },
        {
          r: 0,
          c: 0,
          val: "1",
          cls: "from",
        },
        {
          r: 1,
          c: 1,
          val: "1",
          cls: "from",
        },
      ],
      values: {
        "l,r": "0,2",
        "k-range": "1",
        dp: 4,
      },
    },
    {
      note: "(1,3): similarly 4.",
      cells: [
        {
          r: 1,
          c: 2,
          val: "4",
          cls: "target",
        },
      ],
      values: {
        "l,r": "1,3",
        "k-range": "2",
        dp: 4,
      },
    },
    {
      note: "(0,3): Knuth says try k from opt[0][2] to opt[1][3], here {1}..{2}. Evaluate k=1 and k=2.",
      cells: [
        {
          r: 0,
          c: 2,
          val: "?",
          cls: "target",
        },
        {
          r: 0,
          c: 1,
          val: "4",
          cls: "from",
        },
        {
          r: 1,
          c: 2,
          val: "4",
          cls: "from",
        },
      ],
      values: {
        "l,r": "0,3",
        "k-range": "1..2",
        dp: "min",
      },
    },
    {
      note: "k=1: dp[0][1]+dp[1][3]+C(0,3) = 1+4+9=14. k=2: 4+1+9=14. Write 14.",
      cells: [
        {
          r: 0,
          c: 2,
          val: "14",
          cls: "target",
        },
      ],
      values: {
        "l,r": "0,3",
        "k-range": "1..2",
        dp: 14,
      },
    },
    {
      note: "Naive would have tried every k in (0,3). Knuth tried two. On n=4000 that is the difference between n^3 and n^2.",
      cells: [
        {
          r: 0,
          c: 2,
          val: "14",
          cls: "answer",
        },
      ],
      values: {
        "l,r": "ans",
        "k-range": "shrunk",
        dp: 14,
      },
    },
    {
      note: "CHT picture (separate rec): each old j is a line. Query at x=i pops a deque front.",
      cells: [
        {
          r: 0,
          c: 0,
          val: "line j",
        },
        {
          r: 0,
          c: 2,
          val: "query i",
          cls: "target",
        },
      ],
      values: {
        "l,r": "CHT",
        "k-range": "deque",
        dp: "O(1)",
      },
    },
  ],
  vizTitle: "Tiny Knuth-style table: 4 points, C(l,r) = (r-l)^2, dp[l][r] min split cost + C",
  vizIntro: "Rows l, columns r. We fill by gap. Target is [l,r]; from cells are the two children of the best k. opt pointers only move right as r grows.",
  vizCaption: "Dummy: dp[i][i]=0, dp[i][i+1]=C. For gap 3 the k-loop is already restricted by opt of the two smaller intervals. Answer sits in dp[0][3].",
  mermaid: "flowchart TD\n  q([\"min over a range of previous states\"]) --> shape{\"what is C?\"}\n  shape -- \"m_j * x_i + b_j, x sorted\" --> cht[\"CHT deque or Li Chao\"]\n  shape -- \"2D interval, opt nested\" --> kn[\"Knuth: shrink k to [opt L, opt R]\"]\n  shape -- \"1D / layered, opt[i] monotone\" --> dc[\"D and C opt on mid i\"]\n  shape -- \"no structure\" --> naive[\"keep n squared / n cubed\"]",
  merTitle: "Which optimisation?",
  merCaption: "If you cannot name a monotone opt or a line, you do not have a tool yet.",
  steps: [
    "<strong>Write the naive rec</strong> and identify C(j, i) or C(l, r).",
    "<strong>Check QI / opt monotonicity</strong> (prove or trust the editorial).",
    "<strong>Knuth:</strong> store opt[l][r], loop k only in [opt[l][r-1], opt[l+1][r]].",
    "<strong>D&C:</strong> compute(layer, iLo, iHi, jLo, jHi): mid i, brute j, recurse.",
    "<strong>CHT:</strong> lines (m, b) into a deque; query at x_i from the front.",
    "<strong>Verify on a brute n=30</strong> against the naive DP.",
    "<strong>Watch long</strong> for costs; mid = lo + (hi-lo)/2 on any binary search inside Li Chao.",
  ],
  dryIntro: "CHT sketch: lines y = m x + b with m decreasing, query x increasing. Lines (m,b) = (3,0), (2,2), (0,7). Queries x = 0, 2, 5.",
  dryCols: [ "action", "deque (m,b)", "x", "best" ],
  dryRows: [
    {
      cells: [ "add (3,0)", "[(3,0)]", "—", "—" ],
      action: "First line.",
    },
    {
      cells: [ "add (2,2)", "[(3,0),(2,2)]", "—", "—" ],
      action: "Intersect at x=2.",
    },
    {
      cells: [ "query", "same", "0", "0" ],
      action: "Front wins at x=0.",
      change: true,
    },
    {
      cells: [ "query", "same", "2", "4" ],
      action: "Tie at intersection; either line.",
    },
    {
      cells: [ "add (0,7)", "[(2,2),(0,7)]", "—", "—" ],
      action: "(3,0) popped: dominated past x=2.",
    },
    {
      cells: [ "query", "same", "5", "7" ],
      action: "Line (0,7) wins.",
      change: true,
    },
  ],
  code: [
    {
      tab: "Recursion / naive",
      file: "OptNaive.java",
      code: "import java.util.Arrays;\n\npublic class OptNaive {\n\n    static long minCost(int[] a) {\n        int n = a.length;\n        long[] pref = new long[n + 1];\n        for (int i = 0; i < n; i++) {\n            pref[i + 1] = pref[i] + a[i];\n        }\n        long[] dp = new long[n + 1];\n        Arrays.fill(dp, Long.MAX_VALUE / 4);\n        dp[0] = 0;\n        for (int i = 1; i <= n; i++) {\n            for (int j = 0; j < i; j++) {\n                long d = pref[i] - pref[j];\n                dp[i] = Math.min(dp[i], dp[j] + d * d);\n            }\n        }\n        return dp[n];\n    }\n\n    public static void main(String[] args) {\n        System.out.println(minCost(new int[] {1, 3, 1, 3}));\n    }\n    // Input : [1, 3, 1, 3]\n    // Output: 20\n}",
    },
    {
      tab: "Memo / CHT",
      file: "OptCht.java",
      code: "import java.util.ArrayDeque;\n\npublic class OptCht {\n\n    static long minCost(int[] a) {\n        int n = a.length;\n        long[] pref = new long[n + 1];\n        for (int i = 0; i < n; i++) {\n            pref[i + 1] = pref[i] + a[i];\n        }\n        long[] dp = new long[n + 1];\n        ArrayDeque<long[]> dq = new ArrayDeque<>(); // {m, b}\n        dq.addLast(new long[] {0, 0});             // dp[0]=0, pref[0]=0\n        for (int i = 1; i <= n; i++) {\n            long x = pref[i];\n            while (dq.size() >= 2) {\n                long[] p = dq.pollFirst();\n                long[] q = dq.peekFirst();\n                if (p[0] * x + p[1] <= q[0] * x + q[1]) {\n                    dq.addFirst(p);\n                    break;\n                }\n            }\n            long[] best = dq.peekFirst();\n            dp[i] = best[0] * x + best[1] + x * x;\n            long m = -2 * pref[i];\n            long b = dp[i] + pref[i] * pref[i];\n            while (dq.size() >= 2) {\n                long[] y = dq.pollLast();\n                long[] z = dq.peekLast();\n                // pop y if intersection(z,y) >= intersection(y, new)\n                if ((y[1] - z[1]) * (y[0] - m) >= (b - y[1]) * (z[0] - y[0])) {\n                    continue;\n                }\n                dq.addLast(y);\n                break;\n            }\n            dq.addLast(new long[] {m, b});\n        }\n        return dp[n];\n    }\n\n    public static void main(String[] args) {\n        System.out.println(minCost(new int[] {1, 3, 1, 3}));\n    }\n    // Input : [1, 3, 1, 3]\n    // Output: 20\n}",
    },
    {
      tab: "Tabulated D&C",
      file: "OptDc.java",
      code: "public class OptDc {\n\n    static long[] pref, dp0, dp1;\n\n    static void compute(int iLo, int iHi, int jLo, int jHi) {\n        if (iLo > iHi) {\n            return;\n        }\n        int iMid = iLo + (iHi - iLo) / 2;\n        int bestJ = jLo;\n        long best = Long.MAX_VALUE / 4;\n        int jMax = Math.min(jHi, iMid - 1);\n        for (int j = jLo; j <= jMax; j++) {\n            long d = pref[iMid] - pref[j];\n            long val = dp0[j] + d * d;\n            if (val < best) {\n                best = val;\n                bestJ = j;\n            }\n        }\n        dp1[iMid] = best;\n        compute(iLo, iMid - 1, jLo, bestJ);\n        compute(iMid + 1, iHi, bestJ, jHi);\n    }\n\n    public static void main(String[] args) {\n        int[] a = {1, 3, 1, 3};\n        int n = a.length;\n        pref = new long[n + 1];\n        for (int i = 0; i < n; i++) {\n            pref[i + 1] = pref[i] + a[i];\n        }\n        dp0 = new long[n + 1];\n        dp1 = new long[n + 1];\n        compute(1, n, 0, n);\n        System.out.println(dp1[n]);\n    }\n    // Input : [1, 3, 1, 3], one layer\n    // Output: 16\n}",
    },
  ],
  complexity: {
    time: "CHT O(n); D&C opt O(n log n) per layer; Knuth O(n²)",
    space: "O(n) or O(n²) for Knuth tables",
    derivation: [
      "<p>D&C: each recursion level spends O(n) on the j-sweeps (they do not overlap more than a telescoping sum), and there are log n levels of mid-splits:</p>",
      "<span class=\"eq\">T<sub>D&C</sub> = &Theta;(n log n) per layer</span>",
      "<p>Knuth: each (l,r) examines a disjoint k-range relative to its neighbours; the standard charging gives O(n&sup2;).</p>",
    ],
    compare: [
      [ "Naive 1D", "O(n²)", "O(n)", "No structure" ],
      [ "CHT deque", "O(n)", "O(n)", "Monotone slopes + x" ],
      [ "Li Chao", "O(n log n)", "O(n)", "Unsorted slopes" ],
      [ "D&C opt", "O(kn log n)", "O(n)", "k layers, monotone opt" ],
      [ "Knuth", "O(n²)", "O(n²)", "Interval, nested opt" ],
    ],
  },
  pitfalls: [
    {
      title: "Applying Knuth without QI",
      bug: "opt is not monotone; shrinking the k-range misses the real min. Silent WA.",
      fix: "Prove QI or compare against naive on random tests of n=40.",
    },
    {
      title: "CHT intersection overflow",
      bug: "(b2-b1)/(m1-m2) computed with longs that wrap, or with doubles that mis-order equal slopes.",
      fix: "Cross-multiply in a careful long (or __int128 in C++). Reject equal slopes by keeping the better intercept.",
    },
    {
      title: "D&C iMid with empty j-range",
      bug: "iMid == 0 or jMax < jLo. You write inf and recurse with inverted bounds.",
      fix: "Guard jMax = min(jHi, iMid-1) and if jLo>jMax write inf, still recurse consistently.",
    },
    {
      title: "Querying CHT with unsorted x",
      bug: "Deque pops are irreversible; a later smaller x is broken.",
      fix: "Sort queries, or use Li Chao / a multiset hull.",
    },
    {
      title: "int costs",
      bug: "(pref[i]-pref[j])^2 with pref = 1e5*1e9.",
      fix: "long everywhere, including m*x + b.",
    },
    {
      title: "Off-by-one on inclusive j",
      bug: "j < i vs j ≤ i, empty segments, C(i,i) not defined.",
      fix: "Match the naive rec exactly; empty prefix j=0 is a legal start.",
    },
  ],
  variants: [
    [
      "Li Chao tree",
      "Online lines, no slope order. Segment tree over x, one line per node.",
      "O(n log X)",
      "When x is not sorted",
    ],
    [
      "Aliens / WQS binary search",
      "Add a penalty λ per group, drop the k dimension, search λ so the opt uses k groups.",
      "Needs convexity in k",
      "CF 321E can also be D&C",
    ],
    [
      "Lagrange / Knuth on MCM",
      "opt[i][j] nest after QI on the matrix-chain cost.",
      "O(n²) MCM",
      "AtCoder DP-N sometimes Knuth-able",
    ],
    [
      "SMAWK",
      "Totally monotone matrices, O(n) row-minima. Rare in CF, common in papers.",
      "Heavier to code than D&C",
      "Same applicability as D&C, faster",
    ],
  ],
  followups: [
    [
      "How do I check QI in five minutes?",
      "<p>For a segment cost on a line, convex / concave costs often work. Empirically: compute naive opt[i] on n=50 and assert opt[i] ≤ opt[i+1]. If it fails on random arrays, you do not have the structure. If it holds, you still want a proof for confidence, but CF will accept the code.</p>",
    ],
    [
      "CHT vs D&C for the same rec?",
      "<p>If C(j,i) is a line in i, CHT is faster and simpler. If C is a black-box segment cost with monotone opt but not a line (e.g. a range-cost from a precomputed table), D&C still works and CHT does not.</p>",
    ],
    [
      "Why does the D&C j-range not explode?",
      "<p>The mid's brute force of length J is charged once per level, and the left and right halves get complementary j-ranges that sum to J plus O(1). Across a level the j-sweeps telescope to O(n).</p>",
    ],
    [
      "Can I combine Knuth with reconstruction?",
      "<p>Yes. Store opt[l][r] = best k. The last split is that k; recurse. Same as interval DP reconstruction, just with a smaller search during the fill.</p>",
    ],
  ],
  problems: [
    {
      name: "Ciel and Gondolas",
      url: "https://codeforces.com/problemset/problem/321/E",
      badge: "cf",
      tag: "CF 321E",
      level: "Hard",
      pattern: "D&C opt, k layers of grouping",
    },
    {
      name: "Cats Transport",
      url: "https://codeforces.com/problemset/problem/311/B",
      badge: "cf",
      tag: "CF 311B",
      level: "Hard",
      pattern: "CHT, feed cats by time",
    },
    {
      name: "Guards in the Storehouse",
      url: "https://codeforces.com/problemset/problem/867/E",
      badge: "cf",
      tag: "CF 867E",
      level: "Hard",
      pattern: "CHT / greedy-heap cousin",
    },
    {
      name: "Kalila and Dimna in the Logging Industry",
      url: "https://codeforces.com/problemset/problem/319/C",
      badge: "cf",
      tag: "CF 319C",
      level: "Hard",
      pattern: "Textbook CHT",
    },
    {
      name: "Slimes",
      url: "https://atcoder.jp/contests/dp/tasks/dp_n",
      badge: "atc",
      tag: "ATC DP-N",
      level: "Medium",
      pattern: "Interval; Knuth optional",
    },
    {
      name: "Task Assignment",
      url: "https://atcoder.jp/contests/dp/tasks/dp_w",
      badge: "atc",
      tag: "ATC DP-W",
      level: "Hard",
      pattern: "Segtree + CHT-ish range add",
    },
    {
      name: "Matrix Chain Multiplication",
      url: "https://www.geeksforgeeks.org/problems/matrix-chain-multiplication0303/1",
      badge: "gfg",
      tag: "GfG",
      level: "Hard",
      pattern: "Naive n^3; Knuth when QI holds",
    },
    {
      name: "Minimum Cost to Cut a Stick",
      url: "https://leetcode.com/problems/minimum-cost-to-cut-a-stick/",
      badge: "lc",
      tag: "LC 1547",
      level: "Hard",
      pattern: "Interval; n small so no opt needed",
    },
    {
      name: "Split Array Largest Sum",
      url: "https://leetcode.com/problems/split-array-largest-sum/",
      badge: "lc",
      tag: "LC 410",
      level: "Hard",
      pattern: "Binary search; D&C opt also works",
    },
    {
      name: "The Fair Nut and Rectangles",
      url: "https://codeforces.com/problemset/problem/1083/E",
      badge: "cf",
      tag: "CF 1083E",
      level: "Hard",
      pattern: "CHT on rectangles",
    },
  ],
  spoilers: [
    {
      summary: "Hint for CF 319C",
      body: "<p>dp[i] = min_{j<i} dp[j] + b[j]*a[i] with a increasing, b decreasing. That is a CHT deque. Line j has slope b[j] and intercept dp[j]. Query at x=a[i], then push the new line. long. n=1e5.</p>",
    },
    {
      summary: "Hint for CF 321E",
      body: "<p>Cost of a contiguous group is a precomputed 2D prefix of pairwise ugliness (O(n^2) preprocess). dp[k][i] = min_{j<i} dp[k-1][j] + cost(j+1,i). QI holds, so D&C opt per layer. k,n ≤ 4000, O(kn log n) after O(n^2) prep.</p>",
    },
  ],
  recap: [
    "<strong>Naive min-over-j is O(n) per state</strong> until you name a monotone opt or a line.",
    "<strong>CHT:</strong> lines + sorted x → deque, O(n).",
    "<strong>D&C opt:</strong> monotone opt[i] → mid split, O(n log n) per layer.",
    "<strong>Knuth:</strong> nested opt on intervals → O(n&sup2;).",
    "<strong>Prove or empirically check QI</strong> before shrinking a search range.",
  ],
  oneliner: "CHT deque if lines | D&C if opt[i] monotone | Knuth if opt nested | else naive",
}),

];

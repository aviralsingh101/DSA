/* Module 13 — Greedy & Offline Techniques */
import { pack, lc, cf } from "./pack.mjs";

export const topics = [

pack({
  id: "greedy-foundations",
  difficulty: "Easy",
  readTime: "22 min",
  tagline: "A greedy choice is legal only with an exchange argument or a matroid / stay-ahead proof &mdash; \"it looks locally good\" is not a proof.",
  tags: ["greedy", "exchange", "stay-ahead", "P0"],
  prereqs: [
    ["Problem-Solving Framework", "../00-foundations/problem-solving-framework.html"],
    ["Sorting & Comparators", "../02-sorting-hashing-bits/sorting-and-comparators.html"],
  ],
  why: [
    "Half of the \"just sort it\" interview problems are greedy, and half of the wrong contest submissions are greedy on a problem that needed DP. The difference is a proof: exchange (any optimal solution can be rewritten to include your first choice) or stay-ahead (your prefix is always at least as good as any other).",
    "The mechanical test: if swapping two inversions of your order never hurts, the order is optimal. Activity selection, Huffman, Kruskal, and scheduling by deadline all have one-paragraph exchange proofs. Coin change with US denominations happens to work; arbitrary coin sets do not &mdash; that is the DP counterexample you should name.",
    "This page is the proof toolkit. The next page is the list of classic problem shapes. If you cannot sketch the exchange, do not code the greedy.",
  ],
  insight: "Write the first greedy choice, take an optimal solution that disagrees as early as possible, and swap. If the swap never loses, induction finishes the proof.",
  yes: [
    "An ordering (by start, by ratio, by deadline) suggests itself and a swap does not hurt",
    "Matroid flavour: independent sets, Kruskal, scheduling with unit jobs",
    "\"Take the smallest / earliest / highest-ratio next\" in the statement",
    "You can prove a stay-ahead invariant on prefixes of the schedule",
    "Counterexamples for nearby rules come easily, so this particular rule might be the right one",
  ],
  no: [
    "Overlapping subproblems with a numeric state &rarr; DP",
    "Need a global matching / flow &rarr; not a local choice",
    "Arbitrary coin systems, unbounded knapsack &rarr; DP",
    "The swap can make a later constraint infeasible &rarr; greedy is lying",
  ],
  table: [
    ["Earliest finish time", "Activity selection", "Greedy"],
    ["Sort by deadline, fill from left", "Unit-time scheduling", "Greedy"],
    ["Any coin system", "Optimal substructure, overlapping", "DP knapsack"],
    ["Fractional knapsack", "Ratio order, exchange", "Greedy"],
    ["0/1 knapsack", "Cannot take fractions", "DP"],
    ["<strong>Confused with:</strong> \"locally optimal so globally\"", "Needs a proof; Huffman yes, coin change no", "Name the proof"],
  ],
  constraint: "Greedy is usually O(n log n) from the sort. If the constraint is n=100 and values look like knapsack, it is DP even if a greedy runs.",
  core: [
    "Exchange: let G be greedy and O optimal, first index i where they differ. Build O' by putting G's item i into O (possibly dropping a later O item). Show cost(O') \le cost(O) (or \ge for max). Then O' is optimal and closer to G. Repeat.",
    "Stay-ahead: after k choices, greedy's k-th event happens no later (or its load is no larger) than any other feasible k-set. The last step implies optimality.",
  ],
  invariant: "<p>If a swap that aligns the next greedy choice with some optimal solution never worsens that solution, the greedy prefix is contained in some optimal solution. That is the interview sentence.</p>",
  array: [1, 3, 0, 5, 8, 5],
  arrayLabel: "finish times of activities =",
  indexLabels: ["0", "1", "2", "3", "4", "5"],
  vars: ["pick", "lastFin", "set"],
  frames: [
    { note: "Activities (start,fin): (1,4), (3,5), (0,6), (5,7), (8,9), (5,9). Sort by finish: 0,1,2,3,4,5 wait \u2014 sorted by fin: idx 0 (4), 1 (5), 2 (6), 3 (7), 4 (9), 5 (9).",
      active: [0], values: { pick: "sort", lastFin: "\u2014", set: "[]" } },
    { note: "Take earliest finish: idx 0, fin=4.",
      active: [0], values: { pick: 0, lastFin: 4, set: "{0}" } },
    { note: "idx 1 starts at 3 < 4, skip. idx 2 starts 0 < 4, skip. idx 3 starts 5 \u2265 4, take. lastFin=7.",
      active: [3], values: { pick: 3, lastFin: 7, set: "{0,3}" } },
    { note: "idx 4 starts 8 \u2265 7, take. idx 5 starts 5 < 9, skip.",
      active: [4], values: { pick: 4, lastFin: 9, set: "{0,3,4}" } },
    { note: "Three activities. Optimal. Exchange: any schedule that skipped 0 could swap in 0 for the first overlapping job without losing count.",
      active: [0, 3, 4], values: { pick: "done", lastFin: 9, set: "size 3" } },
    { note: "Wrong greedy \"shortest duration\" would take (8,9) first and can still do well here, but fails on other instances \u2014 so we needed the finish-time proof.",
      active: [4], values: { pick: "counter", lastFin: "\u2014", set: "wrong rule" } },
  ],
  mermaid: `flowchart TD
  idea["candidate greedy rule"] --> proof{"exchange or stay-ahead?"}
  proof -- "swap never hurts" --> codeG["sort and scan"]
  proof -- "swap can lose" --> dp["it is DP or search"]
  codeG --> check["test a known counterexample of nearby rules"]`,
  merTitle: "Proof first, then the sort",
  merCaption: "If you cannot finish the swap paragraph, do not ship the greedy.",
  steps: [
    "<strong>Name the choice:</strong> which item is taken first, and by which key?",
    "<strong>Sort</strong> by that key (and a tie-break you can justify).",
    "<strong>Scan</strong> and take every item that is still feasible given what you took.",
    "<strong>Write the exchange</strong> in comments or on the whiteboard before coding.",
    "<strong>Hunt a counterexample</strong> for the next-most-tempting key (shortest, earliest start, \u2026).",
    "<strong>Implement</strong> the scan; greedy code is usually ten lines after the sort.",
  ],
  code: [
    { tab: "Brute", file: "ActivityBrute.java",
      intro: "Enumerate subsets. Only n \u2264 20.",
      code: `public class ActivityBrute {
    static int best(int[] s, int[] f) {
        int n = s.length, ans = 0;
        for (int m = 0; m < (1 << n); m++) {
            int cnt = 0, ok = 1, last = -1;
            for (int i = 0; i < n && ok == 1; i++) if (((m >> i) & 1) == 1) {
                if (s[i] < last) ok = 0;
                else { last = f[i]; cnt++; }
            }
            if (ok == 1) ans = Math.max(ans, cnt);
        }
        return ans;
    }
    public static void main(String[] args) {
        System.out.println(best(new int[] {1, 3, 0, 5, 8, 5}, new int[] {4, 5, 6, 7, 9, 9}));
    }
    // Input : classic 6 activities
    // Output: 3
}` },
    { tab: "Optimal", file: "ActivityGreedy.java",
      intro: "Sort by finish time, take if start \u2265 last finish.",
      code: `import java.util.*;
public class ActivityGreedy {
    static int pick(int[] s, int[] f) {
        int n = s.length;
        Integer[] id = new Integer[n];
        for (int i = 0; i < n; i++) id[i] = i;
        Arrays.sort(id, Comparator.comparingInt(i -> f[i]));
        int cnt = 0, last = -1;
        for (int i : id) if (s[i] >= last) { last = f[i]; cnt++; }
        return cnt;
    }
    public static void main(String[] args) {
        System.out.println(pick(new int[] {1, 3, 0, 5, 8, 5}, new int[] {4, 5, 6, 7, 9, 9}));
    }
    // Input : same six
    // Output: 3
}` },
    { tab: "Template", file: "ExchangeSketch.java",
      intro: "A comment-only template of the proof you should recite.",
      code: `public class ExchangeSketch {
    public static void main(String[] args) {
        // Let G = greedy sequence, O = some optimal.
        // Let i be the first index they differ.
        // Replace O[i] with G[i] (drop a conflicting later job).
        // Feasibility is preserved because G[i] finishes first.
        // |O'| >= |O|, so O' is optimal and agrees longer. QED.
        System.out.println("proof, then code");
    }
    // Input : none
    // Output: proof, then code
}` },
  ],
  complexity: {
    time: "O(n log n)",
    space: "O(n)",
    derivation: [
      "<p>The sort dominates. The scan is linear. Brute subsets are O(2^n n).</p>",
    ],
    compare: [
      ["Subset enum", "O(2^n n)", "O(n)", "n <= 20"],
      ["Greedy + sort", "O(n log n)", "O(n)", "When an exchange exists"],
      ["DP", "poly in state", "state", "When exchange fails"],
      ["Network flow", "poly larger", "graph", "When the choice is a matching"],
    ],
  },
  pitfalls: [
    { title: "Sorting by start time",
      bug: "A long early activity blocks everything. Classic counterexample vs finish-time greedy.",
      fix: "Earliest finish, not earliest start." },
    { title: "Skipping the proof because the sample passed",
      bug: "Coin change on [1,3,4] for 6: greedy 4+1+1 vs 3+3.",
      fix: "If you cannot exchange, write DP." },
    { title: "Wrong tie-break",
      bug: "Equal finish times: taking the one with later start can still be OK for count, but reconstruction may differ. For weighted activity you need DP anyway.",
      fix: "Unweighted count: any tie-break. Weighted: not this greedy." },
    { title: "Mutating the original index order",
      bug: "You sort the finish array but not the starts, pairing the wrong jobs.",
      fix: "Sort indices, or sort pairs." },
    { title: "Claiming Huffman / Kruskal without naming the structure",
      bug: "Interviewers ask \"why greedy\". \"Because Kruskal\" is not a reason.",
      fix: "Cut property / matroid / exchange in one sentence." },
  ],
  variants: [
    ["Weighted activity", "Greedy by finish is wrong. DP on sorted finish + binary search p(i).", "LC 1235", "DP"],
    ["Fractional knapsack", "Sort by value/weight, take prefix. Exchange on density.", "textbook", "fractions allowed"],
    ["Huffman", "Always merge two lightest. Exchange on tree shape.", "LC 1167 analogue", "prefix-free codes"],
  ],
  followups: [
    ["Give a one-line exchange for earliest-finish.",
      "<p>Among jobs that overlap greedy's first pick, greedy's pick finishes first, so replacing the optimal's first overlapping job with it frees the timeline no later and keeps feasibility.</p>"],
    ["When is coin greedy correct?",
      "<p>Canonical coin systems (like US coins). Proof is not obvious. In contests, assume DP unless the statement says the canonical set or n is huge and values are 1,5,10,25.</p>"],
    ["Matroid in one sentence?",
      "<p>A family of independent sets closed under subsets, with the exchange property (you can always grow the smaller). Kruskal is the graphic matroid. Greedy on weights works on every matroid.</p>"],
    ["Stay-ahead vs exchange?",
      "<p>Stay-ahead compares prefixes (Dijkstra, Huffman sometimes). Exchange rewrites a full optimal solution. Both are induction. Use whichever is shorter.</p>"],
  ],
  problems: [
    lc("435", "non-overlapping-intervals", "Medium", "Equivalent to activity selection"),
    lc("452", "minimum-number-of-arrows-to-burst-balloons", "Medium", "Sort by end, shoot"),
    lc("55", "jump-game", "Medium", "Stay-ahead on farthest reach"),
    lc("134", "gas-station", "Medium", "If total gas \u2265 cost, a unique greedy start works"),
    lc("455", "assign-cookies", "Easy", "Sort both, two pointers"),
    lc("860", "lemonade-change", "Easy", "Canonical-ish change; still check fives"),
    cf("489B", "BerSU Ball", "Easy", "Sort both, two pointers \u2014 greedy matching"),
    cf("996A", "Hit the Lottery", "Easy", "Canonical coins; name the caveat"),
  ],
  recap: [
    "Greedy needs an exchange or stay-ahead paragraph.",
    "Activity selection = earliest finish.",
    "Nearby keys (shortest, earliest start) have counters.",
    "If the swap can break a later constraint, it is DP.",
    "Code is a sort plus a linear scan.",
  ],
  oneliner: "sort by key; for (x : items) if (feasible(x)) take(x);",
}),

pack({
  id: "greedy-classics",
  difficulty: "Medium",
  readTime: "24 min",
  tagline: "A field guide to the greedy shapes you will actually be handed: intervals, jumps, gas, candies, Huffman-like merging, and scheduling.",
  tags: ["greedy", "intervals", "scheduling", "P0"],
  prereqs: [
    ["Greedy Foundations", "greedy-foundations.html"],
    ["Heaps & Priority Queue", "../03-linear-structures/heaps-and-priority-queue.html"],
  ],
  why: [
    "Once the proof toolkit exists, recognition is the remaining skill. These patterns share a sort key and a one-pass decision; mixing the keys is the usual bug.",
    "Intervals: finish time, or \"min arrows / rooms\" as a sweep. Jumps: farthest reach. Gas: prefix of gas-cost, start after the minimum prefix. Candies / ratings: two passes. Merging files: always merge two smallest (Huffman / heap).",
    "Interviewers chain them: \"now the weighted version\" (DP), \"now k rooms\" (heap of end times). Know which upgrade kills the greedy.",
  ],
  insight: "Name the sort key in one phrase before you touch the keyboard. If you cannot, you do not yet know which classic it is.",
  yes: [
    "Intervals on a line: select, cover, or puncture",
    "Jump game / jump game II",
    "Circular gas / circular tour",
    "Ratings with a neighbour constraint (candies)",
    "Repeatedly combine two smallest costs",
  ],
  no: [
    "Weighted interval scheduling \u2192 DP",
    "Must take fractions? wait, fractional knapsack IS greedy; 0/1 is DP",
    "Need exact k-cover with costs \u2192 maybe min-cost flow",
    "Graph shortest path \u2192 Dijkstra is greedy-with-a-proof, but it is its own page",
  ],
  table: [
    ["Max non-overlapping intervals", "Sort by end", "Activity"],
    ["Min arrows / min rooms", "Sort by end or sweep starts/ends", "Arrows / heap of rooms"],
    ["Jump Game II", "Greedy farthest in the current window", "Jumps"],
    ["Gas station", "Start after the worst prefix deficit", "Circular"],
    ["Candies", "Two slope passes", "Ratings"],
    ["<strong>Confused with:</strong> merge k lists vs Huffman", "Huffman pays the sum every time a file is re-merged", "Heap of sizes"],
  ],
  constraint: "All of these are n log n or n. If you wrote DP on n=1e5 intervals, you picked the weighted variant by mistake \u2014 or the unweighted one.",
  core: [
    "Jump Game II: the current interval [L,R] was reachable in s jumps. Scan it for the farthest index, which becomes the next R. That is BFS-on-array without a queue.",
    "Gas: if total gas &lt; total cost, impossible. Otherwise the unique start is the index after the minimum prefix of (gas-cost). Proof: that prefix is the deepest deficit; starting just after it never goes negative.",
  ],
  invariant: "<p>Each classic has one invariant: activity \u2014 last-finish is minimal among k-sets; jumps \u2014 [0,R] is exactly the set reachable in \u2264 s jumps; gas \u2014 prefix surplus is minimised at start-1.</p>",
  array: [2, 3, 1, 1, 4],
  arrayLabel: "jump length =",
  vars: ["s", "R", "farthest"],
  frames: [
    { note: "Jump Game II on [2,3,1,1,4]. s=0, window [0,0], farthest=2.",
      active: [0], values: { s: 0, R: 0, farthest: 2 } },
    { note: "Window ends: one jump covers [1,2]. Scan them: from 1 can reach 1+3=4, from 2 reach 2+1=3. farthest=4.",
      active: [1, 2], values: { s: 1, R: 2, farthest: 4 } },
    { note: "Second jump window [3,4] already includes n-1. Answer 2.",
      active: [4], values: { s: 2, R: 4, farthest: 4 } },
    { note: "Gas example [1,2,3,4,5] cost [3,4,5,1,2]. prefix of gas-cost: -2,-4,-6,-3,0. Min at index 2, start at 3.",
      active: [3], values: { s: "gas", R: "start 3", farthest: "ok" } },
    { note: "Candies [1,0,2]: left pass [1,1,2], right pass [2,1,2], sum 5.",
      active: [0, 1, 2], values: { s: "candy", R: "\u2014", farthest: "5" } },
    { note: "Huffman: files 1,2,3,4. Merge 1+2=3, then 3+3=6, then 6+4=10. Total cost 3+6+10=19.",
      active: [0, 1], values: { s: "heap", R: "\u2014", farthest: 19 } },
  ],
  mermaid: `flowchart TD
  q["what is being chosen?"] --> iv{"intervals?"}
  iv -- yes --> endK["sort by end / sweep"]
  q --> jp{"jumps on an array?"}
  jp -- yes --> far["farthest in window"]
  q --> gs{"circular surplus?"}
  gs -- yes --> pref["start after min prefix"]
  q --> mg{"repeated merge cost?"}
  mg -- yes --> heapN["min-heap of sizes"]`,
  merTitle: "Pick the classic by the object",
  merCaption: "One diagram for the five keys. Weighted interval scheduling is not on it \u2014 that is DP.",
  steps: [
    "<strong>Classify</strong> the object: interval, jump, circular, rating, merge.",
    "<strong>Sort or heap</strong> with the matching key.",
    "<strong>One pass</strong> maintaining the invariant (last end, farthest, prefix, slope, heap pop).",
    "<strong>Handle impossible</strong> (gas total, jump that cannot grow R).",
    "<strong>Upgrade check:</strong> weights? k resources? \u2192 DP or a heap of k.",
    "<strong>Reconstruct</strong> if asked: store parent jumps / chosen indices.",
  ],
  code: [
    { tab: "Brute", file: "JumpBrute.java",
      intro: "Min jumps by DFS. Exponential.",
      code: `public class JumpBrute {
    static int min(int[] a, int i) {
        if (i >= a.length - 1) return 0;
        int best = 1_000_000;
        for (int j = 1; j <= a[i]; j++) best = Math.min(best, 1 + min(a, i + j));
        return best;
    }
    public static void main(String[] args) {
        System.out.println(min(new int[] {2, 3, 1, 1, 4}, 0));
    }
    // Input : [2,3,1,1,4]
    // Output: 2
}` },
    { tab: "Optimal", file: "JumpGameII.java",
      intro: "Greedy window. O(n).",
      code: `public class JumpGameII {
    static int jumps(int[] a) {
        int jumps = 0, r = 0, far = 0;
        for (int i = 0; i < a.length - 1; i++) {
            far = Math.max(far, i + a[i]);
            if (i == r) { jumps++; r = far; }
        }
        return jumps;
    }
    public static void main(String[] args) {
        System.out.println(jumps(new int[] {2, 3, 1, 1, 4}));
    }
    // Input : [2,3,1,1,4]
    // Output: 2
}` },
    { tab: "Template", file: "GasStation.java",
      intro: "Circular tour start index.",
      code: `public class GasStation {
    static int start(int[] gas, int[] cost) {
        int n = gas.length, tank = 0, min = 0, idx = 0;
        for (int i = 0; i < n; i++) {
            tank += gas[i] - cost[i];
            if (tank < min) { min = tank; idx = i + 1; }
        }
        return tank < 0 ? -1 : idx % n;
    }
    public static void main(String[] args) {
        System.out.println(start(new int[] {1, 2, 3, 4, 5}, new int[] {3, 4, 5, 1, 2}));
    }
    // Input : gas 1..5, cost 3,4,5,1,2
    // Output: 3
}` },
  ],
  complexity: {
    time: "O(n) or O(n log n)",
    space: "O(1) to O(n)",
    derivation: [
      "<p>Jumps and gas are one pass. Interval problems sort. Huffman is n heap operations, O(n log n).</p>",
    ],
    compare: [
      ["Activity / arrows", "O(n log n)", "O(n)", "Sort by end"],
      ["Jump II", "O(n)", "O(1)", "Window farthest"],
      ["Gas", "O(n)", "O(1)", "Min prefix"],
      ["Huffman merge", "O(n log n)", "O(n)", "Min-heap"],
    ],
  },
  pitfalls: [
    { title: "Jump Game II loop including last index",
      bug: "You add an extra jump when i hits n-1.",
      fix: "Loop to n-2 only." },
    { title: "Gas returning 0 when total is negative",
      bug: "The min-prefix still exists but the tour is impossible.",
      fix: "Check total &lt; 0 first." },
    { title: "Meeting rooms without a heap",
      bug: "Sorting by start and counting overlap naively is O(n^2), or wrong if you only look at the previous meeting.",
      fix: "Min-heap of end times, or a sweep of +1/-1." },
    { title: "Candies one pass",
      bug: "A decreasing then increasing valley needs both directions.",
      fix: "Left-to-right enforce left neighbour, right-to-left enforce right, take max." },
    { title: "Huffman adding the new file once",
      bug: "Cost is the sum of internal nodes, not just the final root. Push the merged size back.",
      fix: "ans += a+b; heap.add(a+b);" },
  ],
  variants: [
    ["Meeting rooms II", "Sweep or min-heap of ends.", "LC 253", "k rooms"],
    ["Weighted intervals", "DP + binary search previous compatible.", "LC 1235", "kills greedy"],
    ["Jump Game I", "Only reachability: track farthest, no jump count.", "LC 55", "easier"],
  ],
  followups: [
    ["Why is Jump II not DP?",
      "<p>It can be DP (min jumps to i). The greedy window is BFS layers on the array, so the first time you reach n-1 is the shortest. That is the proof.</p>"],
    ["Two starting points for gas?",
      "<p>If total \u2265 0 there is exactly one start (modulo a stretch of zeros). The unique deepest prefix deficit pins it.</p>"],
    ["Can Huffman run on more than two-way merges?",
      "<p>Yes, k-way: always merge k lightest. Pad with zeros if n-1 is not divisible by k-1.</p>"],
    ["Interval covering from a point?",
      "<p>Sort by start, greedy take the interval that covers the current point and extends farthest. Jump Game in disguise.</p>"],
  ],
  problems: [
    lc("45", "jump-game-ii", "Medium", "Farthest window"),
    lc("134", "gas-station", "Medium", "Min prefix"),
    lc("135", "candy", "Hard", "Two passes"),
    lc("253", "meeting-rooms-ii", "Medium", "Heap of ends / sweep"),
    lc("1235", "maximum-profit-in-job-scheduling", "Hard", "Weighted \u2014 DP, know why greedy dies"),
    lc("406", "queue-reconstruction-by-height", "Medium", "Sort height desc, insert at k"),
    cf("545C", "Woodcutters", "Medium", "Left/right fall greedy"),
    cf("1132B", "Draw It!", "Easy", "Sort and drop k largest"),
  ],
  recap: [
    "Intervals: sort by end (or sweep).",
    "Jumps: farthest in the current BFS layer.",
    "Gas: start after the minimum prefix.",
    "Candies: max of two slope passes.",
    "Merges: always two smallest, push back.",
  ],
  oneliner: "classify; sort or heap; one pass that maintains the invariant;",
}),

pack({
  id: "sweep-line",
  difficulty: "Medium",
  readTime: "24 min",
  tagline: "Sort the interesting x-coordinates, keep an active set of segments that currently intersect the sweepline, and answer geometry / interval problems in one pass.",
  tags: ["sweep", "intervals", "geometry", "P1"],
  prereqs: [
    ["Greedy Classics", "greedy-classics.html"],
    ["Heaps & Priority Queue", "../03-linear-structures/heaps-and-priority-queue.html"],
  ],
  why: [
    "Intersection of segments, union of rectangles, \"how many intervals cover this point\", closest pair, and meeting-rooms all become: sort events, process left-to-right, maintain the active y-structure.",
    "The sweepline is a vertical line that jumps from event to event (starts, ends, crossings). Between events the combinatorial structure is constant, so you only work at O(n) events.",
    "1D sweep is a sorted list of +1/-1 at endpoints (coverage). 2D sweep needs a balanced tree of y-coordinates. Closest pair is divide-and-conquer with a sweep strip.",
  ],
  insight: "Nothing interesting happens between event x-coordinates. Sort events, update an active set, query that set.",
  yes: [
    "Union / intersection of intervals or rectangles",
    "Segment intersections, \"any two overlap?\"",
    "Coverage of a line by segments as x moves",
    "Meeting rooms / skyline / overlapping pop",
    "Closest pair of points (sweep or D&C)",
  ],
  no: [
    "Static range queries on an array &rarr; prefix / Fenwick",
    "Graph shortest path &rarr; not a geometry sweep",
    "Need all pairwise intersections listed and m is n^2 &rarr; output-sensitive algorithms, still a sweep with a tree",
    "Offline 2D queries that Fenwick-on-y after sorting x already handles without a \"line\"",
  ],
  table: [
    ["Interval coverage", "+1 at L, -1 at R, sort, running sum", "1D sweep"],
    ["Skyline / union of rects", "x-events, segment tree on y", "2D sweep"],
    ["Any overlap?", "sort by start, track max end", "Greedy / sweep"],
    ["Closest pair", "sort x, tree of y in the strip", "Sweep"],
    ["Meeting rooms", "same as 1D coverage max", "LC 253"],
    ["<strong>Confused with:</strong> Mo's algorithm", "Mo reorders queries in blocks; sweep moves a line through geometry", "Different offline"],
  ],
  constraint: "<code>n &le; 10&#8309;</code> for 1D. Rectangle union with a lazy segtree on compressed y is n log n. Closest pair n log n.",
  core: [
    "1D: events (x, +1) and (x, -1) (process + before - or the reverse depending on closed/open intervals). Running counter is current coverage; max is the answer for meeting rooms.",
    "2D rectangles: events (x, y1, y2, +1/-1). A segment tree stores coverage of y-intervals and the measure of covered length. Area += (x_next - x) * covered_y.",
  ],
  invariant: "<p>After processing all events at x, the active structure represents exactly the objects that intersect the closed or half-open vertical line at x. The next event is the next x where that set changes.</p>",
  array: [1, 2, 2, 3],
  arrayLabel: "coverage after events =",
  indexLabels: ["+L0", "+L1", "-R0", "-R1"],
  vars: ["event", "cover", "maxC"],
  frames: [
    { note: "Intervals [1,3], [2,4]. Events: + at 1, + at 2, - at 3, - at 4.",
      active: [0], values: { event: "+1", cover: 1, maxC: 1 } },
    { note: "+ at 2: cover=2. Max overlapping = 2.",
      active: [1], values: { event: "+2", cover: 2, maxC: 2 } },
    { note: "- at 3: cover=1.",
      active: [2], values: { event: "-3", cover: 1, maxC: 2 } },
    { note: "- at 4: cover=0. Done.",
      active: [3], values: { event: "-4", cover: 0, maxC: 2 } },
    { note: "Tie at the same x: process + before - if intervals are closed and a touch counts as overlap; reverse if they do not.",
      active: [1, 2], values: { event: "tie", cover: "policy", maxC: 2 } },
    { note: "Skyline would store heights in a multiset as x hits left/right walls.",
      active: [0], values: { event: "skyline", cover: "multiset", maxC: "h" } },
  ],
  mermaid: `flowchart TD
  ev["sort events by x"] --> proc["at each x, apply +1/-1"]
  proc --> active["query active set"]
  active --> area["add deltaX times measure"]
  area --> nextX["next event"]`,
  merTitle: "Events, active set, measure",
  merCaption: "The sweepline jumps. Between jumps the picture is combinatorially constant.",
  steps: [
    "<strong>List events</strong> (x, type, payload). Type order at equal x is part of the problem.",
    "<strong>Sort</strong> by x, then type.",
    "<strong>Init</strong> the active structure (counter, TreeSet, segment tree).",
    "<strong>Process</strong> each event: update active, then (if x changed) add the contribution of the previous strip.",
    "<strong>Query</strong> the active set when the statement asks about \"right now\".",
    "<strong>Compress y</strong> if the tree is an array-based segtree.",
  ],
  code: [
    { tab: "Brute", file: "OverlapBrute.java",
      intro: "Check all pairs. O(n^2).",
      code: `public class OverlapBrute {
    static int maxCover(int[][] a) {
        int n = a.length, best = 0;
        for (int x = 0; x < 100; x++) {
            int c = 0;
            for (int[] iv : a) if (iv[0] <= x && x < iv[1]) c++;
            best = Math.max(best, c);
        }
        return best;
    }
    public static void main(String[] args) {
        System.out.println(maxCover(new int[][] {{1, 3}, {2, 4}}));
    }
    // Input : [1,3],[2,4]
    // Output: 2
}` },
    { tab: "Optimal", file: "SweepCover.java",
      intro: "1D +1/-1 sweep. Max coverage.",
      code: `import java.util.*;
public class SweepCover {
    static int maxCover(int[][] a) {
        int n = a.length;
        int[][] ev = new int[2 * n][2];
        for (int i = 0; i < n; i++) {
            ev[2 * i] = new int[] {a[i][0], 1};
            ev[2 * i + 1] = new int[] {a[i][1], -1};
        }
        Arrays.sort(ev, (p, q) -> p[0] != q[0] ? p[0] - q[0] : p[1] - q[1]);
        int cur = 0, best = 0;
        for (int[] e : ev) { cur += e[1]; best = Math.max(best, cur); }
        return best;
    }
    public static void main(String[] args) {
        System.out.println(maxCover(new int[][] {{1, 3}, {2, 4}}));
    }
    // Input : [1,3],[2,4]
    // Output: 2
}` },
    { tab: "Template", file: "SkylineSweep.java",
      intro: "Multiset of heights. LC 218 shape.",
      code: `import java.util.*;
public class SkylineSweep {
    static List<int[]> skyline(int[][] b) {
        List<int[]> ev = new ArrayList<>();
        for (int[] x : b) {
            ev.add(new int[] {x[0], -x[2]});
            ev.add(new int[] {x[1], x[2]});
        }
        ev.sort((p, q) -> p[0] != q[0] ? p[0] - q[0] : p[1] - q[1]);
        TreeMap<Integer, Integer> h = new TreeMap<>();
        h.put(0, 1);
        int prev = 0;
        List<int[]> ans = new ArrayList<>();
        for (int[] e : ev) {
            if (e[1] < 0) h.merge(-e[1], 1, Integer::sum);
            else {
                int c = h.get(e[1]);
                if (c == 1) h.remove(e[1]); else h.put(e[1], c - 1);
            }
            int cur = h.lastKey();
            if (cur != prev) { ans.add(new int[] {e[0], cur}); prev = cur; }
        }
        return ans;
    }
    public static void main(String[] args) {
        System.out.println(skyline(new int[][] {{1, 3, 2}, {2, 4, 3}}).size());
    }
    // Input : two buildings
    // Output: 3
}` },
  ],
  complexity: {
    time: "O(n log n)",
    space: "O(n)",
    derivation: [
      "<p>O(n) events, sort O(n log n), each update O(log n) in a tree or O(1) for a counter. Rectangle area is the same with a segtree measure.</p>",
    ],
    compare: [
      ["Pairwise", "O(n^2)", "O(1)", "n tiny"],
      ["1D sweep", "O(n log n)", "O(n)", "Coverage, rooms"],
      ["2D + segtree", "O(n log n)", "O(n)", "Union area"],
      ["Mo", "O((n+q) sqrt n)", "O(n)", "Offline array queries, not geometry"],
    ],
  },
  pitfalls: [
    { title: "Same-x order",
      bug: "A segment ends at x and another starts at x. Processing - first makes coverage 0 in between and you miss a touch (or the reverse).",
      fix: "Decide closed/open. For max overlap of closed intervals, process + first." },
    { title: "Using a HashSet of active y without duplicates",
      bug: "Two segments at the same y. TreeSet of y collapses them.",
      fix: "Multiset (TreeMap counts) or store unique ids." },
    { title: "Integer overflow on area",
      bug: "Width * coveredHeight for 1e9 coordinates.",
      fix: "<code>long</code>." },
    { title: "Forgetting to add the last strip",
      bug: "You update at event x but never add (x - prevX) * measure before the last event.",
      fix: "On x change: add, then update prevX, then apply the event. Or apply then add using next x." },
    { title: "Y not compressed",
      bug: "segtree of size 1e9.",
      fix: "Collect y's, unique, map to 0..2n." },
  ],
  variants: [
    ["Union of rectangles area", "Lazy coverage count + length of positive coverage.", "CSES Rectangle Union", "2D sweep"],
    ["Closest pair", "Sort x; keep a TreeSet of points in [x-d, x] ordered by y.", "O(n log n)", "CLRS"],
    ["Bentley-Ottmann", "Segment intersections, events include crossings.", "O((n+k) log n)", "rare in interviews"],
  ],
  followups: [
    ["Sweep vs sort+greedy for meeting rooms?",
      "<p>They are the same 1D sweep. The heap-of-ends version is also a sweep that only stores active ends.</p>"],
    ["How do you get union length of intervals?",
      "<p>Same +1/-1. When coverage goes 0\to1 start a run; when it returns to 0 add the length. Or add \u0394x whenever coverage &gt; 0.</p>"],
    ["Why a segment tree for y?",
      "<p>You need to add +1 on a y-interval and query the measure of y with coverage &gt; 0. That is lazy coverage, not a TreeSet (TreeSet cannot add a range of y at once).</p>"],
    ["Offline 2D points \"count in rectangle\"?",
      "<p>Sort points and queries by x, Fenwick on compressed y. It is a sweep, just with Fenwick as the active structure.</p>"],
  ],
  problems: [
    lc("253", "meeting-rooms-ii", "Medium", "1D sweep / heap"),
    lc("218", "the-skyline-problem", "Hard", "x-events + height multiset"),
    lc("850", "rectangle-area-ii", "Hard", "2D sweep + y segtree"),
    lc("391", "perfect-rectangle", "Hard", "Sweep / corner counting"),
    cf("1000C", "Covered Points Count", "Medium", "1D coverage histogram"),
    cf("1313C2", "Skyscrapers", "Hard", "Different greedy; nearby construction"),
    lc("732", "my-calendar-iii", "Hard", "Sweep or lazy tree of counts"),
    lc("1288", "remove-covered-intervals", "Medium", "Sort and scan, cousin of sweep"),
  ],
  recap: [
    "Events at interesting x, sort them.",
    "Active set = objects that currently intersect the line.",
    "1D coverage is +1/-1 and a counter.",
    "2D area needs a y-structure (segtree).",
    "Equal-x order is a semantic choice.",
  ],
  oneliner: "sort events; for (e : events) { add strip; update active; }",
}),

pack({
  id: "coordinate-compression",
  difficulty: "Medium",
  readTime: "20 min",
  tagline: "Replace huge or sparse values by their ranks 0..k-1 so Fenwick trees, arrays, and DP tables fit in memory &mdash; the ranks preserve order.",
  tags: ["compression", "ranking", "offline", "P1"],
  prereqs: [
    ["Fenwick Tree", "../06-range-queries/fenwick-tree.html"],
    ["Sorting & Comparators", "../02-sorting-hashing-bits/sorting-and-comparators.html"],
  ],
  why: [
    "Values live in 1..1e9 but there are only n of them. A Fenwick of size 1e9 is impossible; a Fenwick of size n on ranks is O(n). Compression is the map value \u2192 rank that keeps &lt; and =.",
    "Offline algorithms collect every coordinate that will ever appear (array values, query bounds, rectangle y's), sort-unique, then replace each by lower_bound. Online structures that must accept new keys use a balanced tree instead.",
    "It shows up in inversion counts, 2D Fenwick, sweep-line y-axes, and DP on \"the next larger value\". Forgetting to unique duplicates maps two equal values to different ranks if you used a raw sort index.",
  ],
  insight: "Order is all you need. Ranks 0..k-1 are a strictly increasing relabelling of the distinct keys.",
  yes: [
    "Fenwick / segtree on values from 1e9, only n distinct",
    "2D points with large x,y",
    "Offline queries whose bounds are in the input",
    "Need an array indexed by value",
    "Discrete version of a sweep y-axis",
  ],
  no: [
    "You need the actual numeric gaps (distance 1e9 vs 2) in the index &rarr; compression loses gaps",
    "Online arbitrary new keys without rebuild \u2192 TreeMap / dynamic segtree",
    "Values already in 1..n \u2192 nothing to do",
    "Hashing as identity, not order \u2192 HashMap, not ranks",
  ],
  table: [
    ["Inversion count, values 1e9", "Rank then Fenwick", "This page + BIT"],
    ["Rectangle y for segtree", "Collect y, unique, rank", "Sweep"],
    ["Need distances between keys", "Do not compress the axis you measure", "Keep originals"],
    ["Online inserts of new keys", "Dynamic segtree / treap", "Not static rank"],
    ["Map for equality only", "HashMap", "No order"],
    ["<strong>Confused with:</strong> discretisation vs hashing", "Ranks preserve order; hashes do not", "Fenwick needs order"],
  ],
  constraint: "k distinct \u2264 n or 3n (values + query bounds). Java <code>Arrays.binarySearch</code> on the unique array is the rank.",
  core: [
    "Copy all relevant numbers into a list, sort, unique. Rank of x is the lowest index with unique[i]==x (binary search). Replace a[i] with rank(a[i]).",
    "Queries with bounds [L,R] on the value axis: rankL = lower_bound(L), rankR = upper_bound(R)-1. Off-by-one here is the usual WA.",
  ],
  invariant: "<p>rank(x) &lt; rank(y) iff x &lt; y, and rank(x)==rank(y) iff x==y, for every x,y that appeared in the collected set.</p>",
  array: [100, 3, 100, 50],
  arrayLabel: "a =",
  vars: ["x", "unique", "rank"],
  frames: [
    { note: "a = [100, 3, 100, 50]. Collect, sort: 3,50,100,100.",
      active: [0, 1, 2, 3], values: { x: "all", unique: "3,50,100,100", rank: "\u2014" } },
    { note: "Unique: [3, 50, 100]. k=3.",
      active: [1], values: { x: "uniq", unique: "[3,50,100]", rank: "\u2014" } },
    { note: "3 \u2192 0, 50 \u2192 1, 100 \u2192 2. Compressed a = [2,0,2,1].",
      active: [0], values: { x: 100, unique: "[3,50,100]", rank: 2 } },
    { note: "Fenwick of size 3 now counts frequencies. Inversions: walk left-to-right, query how many ranks already seen are larger.",
      active: [1], values: { x: 3, unique: "bit n=3", rank: 0 } },
    { note: "Query \"count values in [40,100]\": lower_bound 40 = 1 (50), upper_bound 100 = 3, ranks [1,2].",
      active: [0, 2, 3], values: { x: "q", unique: "lb/ub", rank: "1..2" } },
    { note: "If you needed a[i+1]-a[i] as a length, you would still use original values for the length and ranks only as indices.",
      active: [3], values: { x: "gap", unique: "keep 50", rank: "index 1" } },
  ],
  mermaid: `flowchart TD
  collect["collect every key"] --> sortU["sort and unique"]
  sortU --> lb["rank x = lower_bound"]
  lb --> idx["Fenwick / array index"]
  idx --> q["query bounds also ranked"]`,
  merTitle: "Collect, unique, lower_bound",
  merCaption: "Equal values must share a rank. Unique is not optional.",
  steps: [
    "<strong>Collect</strong> every integer that will be an index (values, query L/R, y1/y2).",
    "<strong>Sort</strong> and <code>unique</code> (compact equal runs).",
    "<strong>rank(x)</strong> = lower_bound in the unique array.",
    "<strong>Rewrite</strong> the data. Fenwick size = unique.length (or +2).",
    "<strong>Query [L,R]</strong> on values: [lower_bound(L), upper_bound(R)-1].",
    "<strong>Keep originals</strong> if you still need numeric differences.",
  ],
  code: [
    { tab: "Brute", file: "FenwickHuge.java",
      intro: "Cannot allocate 1e9. Shown as the thing we refuse.",
      code: `public class FenwickHuge {
    public static void main(String[] args) {
        // long[] bit = new long[1_000_000_001]; // OOM
        System.out.println("compress first");
    }
    // Input : values up to 1e9
    // Output: compress first
}` },
    { tab: "Optimal", file: "Compress.java",
      intro: "Unique + binarySearch. Ranks of the sample.",
      code: `import java.util.*;
public class Compress {
    static int[] unique(int[] a) {
        int[] b = a.clone();
        Arrays.sort(b);
        int k = 0;
        for (int i = 0; i < b.length; i++)
            if (k == 0 || b[i] != b[k - 1]) b[k++] = b[i];
        return Arrays.copyOf(b, k);
    }
    static int rank(int[] u, int x) {
        int r = Arrays.binarySearch(u, x);
        return r < 0 ? -1 : r;
    }
    public static void main(String[] args) {
        int[] a = {100, 3, 100, 50};
        int[] u = unique(a);
        for (int x : a) System.out.print(rank(u, x) + " ");
        System.out.println();
    }
    // Input : [100,3,100,50]
    // Output: 2 0 2 1
}` },
    { tab: "Template", file: "InvCountCompressed.java",
      intro: "Inversions with Fenwick on ranks.",
      code: `import java.util.*;
public class InvCountCompressed {
    static long inv(int[] a) {
        int[] u = a.clone();
        Arrays.sort(u);
        int k = 0;
        for (int x : u) if (k == 0 || x != u[k - 1]) u[k++] = x;
        int n = a.length;
        long[] bit = new long[k + 2];
        long ans = 0;
        for (int i = n - 1; i >= 0; i--) {
            int r = Arrays.binarySearch(u, 0, k, a[i]) + 1;
            long s = 0;
            for (int j = r - 1; j > 0; j -= j & -j) s += bit[j];
            ans += s;
            for (int j = r; j <= k; j += j & -j) bit[j]++;
        }
        return ans;
    }
    public static void main(String[] args) {
        System.out.println(inv(new int[] {3, 1, 2}));
    }
    // Input : [3,1,2]
    // Output: 2
}` },
  ],
  complexity: {
    time: "O(n log n)",
    space: "O(n)",
    derivation: [
      "<p>Sort + unique is O(n log n). Each rank is a binary search. The later Fenwick is O(n log k).</p>",
    ],
    compare: [
      ["Array of size maxA", "O(maxA)", "O(maxA)", "maxA <= 1e6"],
      ["Compression", "O(n log n)", "O(n)", "maxA = 1e9, n = 1e5"],
      ["TreeMap Fenwick", "O(n log n)", "O(n)", "Online, slower constants"],
      ["Dynamic segtree", "O(n log MAX)", "O(n log MAX)", "Online ranks"],
    ],
  },
  pitfalls: [
    { title: "Not uniquing",
      bug: "binarySearch on a sorted array with duplicates returns an arbitrary duplicate index; equal values get different ranks across calls.",
      fix: "Unique first, then search on the compact array." },
    { title: "Forgetting query bounds in the collected set",
      bug: "A query L that never appeared has no rank; binarySearch returns -insertion-1, which you must treat as lower_bound.",
      fix: "Insert all L/R into the list before unique, or use the insertion point as rank." },
    { title: "Compressing an axis you still measure",
      bug: "Rectangle width becomes rank difference 1, area is wrong.",
      fix: "Store original coordinates for lengths; ranks only index the tree." },
    { title: "1-based Fenwick vs 0-based ranks",
      bug: "rank 0 never updates bit[0] which is unused \u2014 you skip all minima, or you AIOOB.",
      fix: "Use rank+1 as Fenwick index." },
    { title: "long vs int keys",
      bug: "1e18 coordinates in int[] overflow.",
      fix: "<code>long[]</code> unique." },
  ],
  variants: [
    ["With query bounds", "Push L and R into the list even if they are not array values.", "offline 2D count", "CF problems"],
    ["Dynamic", "Don't compress; use a Treap / dynamic segtree keyed by the raw value.", "online", "when keys appear later"],
    ["Pair compression", "(x,y) as one long: x<<32|y, then unique.", "when order is lexicographic on pairs", "rare"],
  ],
  followups: [
    ["lower_bound vs rank of an absent L?",
      "<p>lower_bound(L) is the first stored key \u2265 L. That is the first rank that should be included in \"values \u2265 L\". upper_bound(R) is the first key &gt; R.</p>"],
    ["Why not HashMap to dense ids?",
      "<p>HashMap assignment order is insertion, not value order. Fenwick prefix would no longer mean \"all smaller values\".</p>"],
    ["Can you compress online?",
      "<p>If all keys are known up front, yes (offline). If not, you cannot pre-assign ranks without leaving gaps. Use a BBST.</p>"],
    ["2D compression?",
      "<p>Compress x and y independently. A 2D Fenwick is then k_x by k_y. If that product is too big, sweep one axis and Fenwick the other.</p>"],
  ],
  problems: [
    lc("315", "count-of-smaller-numbers-after-self", "Hard", "Rank + Fenwick"),
    lc("327", "count-of-range-sum", "Hard", "Prefix sums compressed"),
    lc("493", "reverse-pairs", "Hard", "Rank of 2*val"),
    cf("61E", "Enemy is Weak", "Medium", "3-layer inversions, compress"),
    cf("459D", "Pashmak and Parmida's Problem", "Medium", "Compress frequencies"),
    cf("540E", "Infinite Inversions", "Medium", "Compress huge indices"),
    cf("1311F", "Moving Points", "Medium", "Compress position + BIT"),
    lc("307", "range-sum-query-mutable", "Medium", "If coords huge, compress first"),
  ],
  recap: [
    "Collect, sort, unique, lower_bound.",
    "Equal keys \u2192 equal ranks. Unique is required.",
    "Fenwick size is k, not 1e9.",
    "Lengths still use original coordinates.",
    "Query bounds must be in the collected set or handled as insertion points.",
  ],
  oneliner: "sort unique; rank(x)=lower_bound(unique, x);",
}),

pack({
  id: "ternary-search-and-convexity",
  difficulty: "Medium",
  readTime: "22 min",
  tagline: "On a unimodal function, two probes shrink the interval by a constant factor &mdash; ternary search, or a golden-section / integer-trinary loop.",
  tags: ["ternary search", "unimodal", "convex", "P2"],
  prereqs: [
    ["Binary Search on Answer", "../01-arrays-and-windows/binary-search-on-answer.html"],
    ["Greedy Foundations", "greedy-foundations.html"],
  ],
  why: [
    "Binary search needs a monotonic predicate. Many contest functions go down then up (or up then down): distance-sum to points on a line, a convex cost, a unimodal bitwise function. Ternary search finds the trough in O(log n) probes.",
    "Convex DP (divide-and-conquer / Knuth / Li Chao / cht) is the data-structure upgrade of the same picture: the opt[i] as a function of i is unimodal or the cost is convex, so you can search or hull it.",
    "On integers, a loop that keeps [lo, hi] and compares f(m1) and f(m2) is safer than floating ternary. Stop when hi-lo is a few units and brute the remainder.",
  ],
  insight: "If f decreases then increases, the minimum cannot lie in the worse third. Throw that third away. Convexity of f is a sufficient condition.",
  yes: [
    "Unimodal f on a line / on an index range",
    "\"Choose x to minimise sum |x-a_i| or sum (x-a_i)^2\"",
    "Ternary on the real line with a convex cost",
    "Integer unimodal array, find the peak (also bitonic search)",
    "Alphas of convex DP where you ternary an opt",
  ],
  no: [
    "Monotone predicate \u2192 binary search, one probe",
    "Multiple local minima \u2192 ternary is wrong",
    "Need the whole DP hull \u2192 Li Chao / CHT, not a one-shot ternary",
    "Discrete not unimodal (random array) \u2192 linear scan",
  ],
  table: [
    ["Bitonic array peak", "Compare mid neighbours or ternary", "This page"],
    ["Min sum |x-ai|", "Median, no search needed", "Greedy"],
    ["Min sum (x-ai)^2", "Mean; or ternary to be sure", "Convex"],
    ["f with one turn", "Ternary / golden", "This page"],
    ["DP convext hull", "CHT / Li Chao", "dp-optimizations"],
    ["<strong>Confused with:</strong> binary search on answer", "Binary needs monotone yes/no; ternary needs unimodal numeric f", "Check the shape of f"],
  ],
  constraint: "O(log range) evaluations. If f is O(n), total O(n log X). On doubles, 80-100 iterations beat eps 1e-9. Integers: while hi-lo&gt;3.",
  core: [
    "Integer: while hi-lo&gt;2, m1 = lo+(hi-lo)/3, m2 = hi-(hi-lo)/3. If f(m1)&lt;f(m2) the min is not right of m2, set hi=m2; else lo=m1. Then scan lo..hi.",
    "Floats: same, or golden-section to reuse probes. Prove unimodality first: second differences of f \u2265 0 (discrete convex), or derivative changes sign once.",
  ],
  invariant: "<p>The minimum (maximum) of a unimodal f on [lo, hi] still lies in the shrunk interval after a third is discarded. When hi-lo is O(1), brute is exact.</p>",
  array: [9, 7, 4, 2, 3, 8],
  arrayLabel: "f(i) =",
  vars: ["lo,hi", "m1,m2", "f"],
  frames: [
    { note: "f = [9,7,4,2,3,8], min at i=3. lo=0, hi=5.",
      active: [0, 5], values: { "lo,hi": "0,5", "m1,m2": "\u2014", f: "start" } },
    { note: "m1=1, m2=4. f(1)=7 &gt; f(4)=3, min is not left of m1: lo=1.",
      active: [1, 4], values: { "lo,hi": "1,5", "m1,m2": "1,4", f: "7 vs 3" } },
    { note: "m1=2, m2=4. f(2)=4 &gt; f(4)=3, lo=2.",
      active: [2, 4], values: { "lo,hi": "2,5", "m1,m2": "2,4", f: "4 vs 3" } },
    { note: "m1=3, m2=4. f(3)=2 &lt; f(4)=3, hi=4.",
      active: [3, 4], values: { "lo,hi": "2,4", "m1,m2": "3,4", f: "2 vs 3" } },
    { note: "hi-lo small: scan 2..4, min 2 at index 3.",
      active: [3], values: { "lo,hi": "2,4", "m1,m2": "scan", f: 2 } },
    { note: "If f were W-shaped, discarding a third could drop the true min. Unimodality is required.",
      active: [0, 5], values: { "lo,hi": "counter", "m1,m2": "\u2014", f: "not unimodal" } },
  ],
  mermaid: `flowchart TD
  uni{"is f unimodal?"}
  uni -- no --> scan["linear or DP"]
  uni -- yes --> ter["compare f m1 and f m2"]
  ter --> drop["drop the worse third"]
  drop --> small{"hi-lo tiny?"}
  small -- no --> ter
  small -- yes --> brute["scan the remainder"]`,
  merTitle: "Discard a third, then brute the seed",
  merCaption: "Integer ternary should not run until lo==hi \u2014 plateaus can pin the wrong side. Finish with a scan.",
  steps: [
    "<strong>Prove</strong> unimodality (convex / one peak).",
    "<strong>Choose domain:</strong> indices, or a real x, or a discrete parameter.",
    "<strong>Loop</strong> with m1, m2 at 1/3 and 2/3 (or golden).",
    "<strong>Drop</strong> the third with the worse f.",
    "<strong>Stop</strong> when the interval is O(1) (ints) or width &lt; eps (reals).",
    "<strong>Brute</strong> remaining integers. Return argmin.",
  ],
  code: [
    { tab: "Brute", file: "MinScan.java",
      intro: "Evaluate f everywhere. Correct, uses the unimodal array.",
      code: `public class MinScan {
    static int argmin(int[] f) {
        int b = 0;
        for (int i = 1; i < f.length; i++) if (f[i] < f[b]) b = i;
        return b;
    }
    public static void main(String[] args) {
        System.out.println(argmin(new int[] {9, 7, 4, 2, 3, 8}));
    }
    // Input : [9,7,4,2,3,8]
    // Output: 3
}` },
    { tab: "Optimal", file: "TernaryInt.java",
      intro: "Integer ternary plus a finishing scan.",
      code: `public class TernaryInt {
    static int argmin(int[] f) {
        int lo = 0, hi = f.length - 1;
        while (hi - lo > 3) {
            int m1 = lo + (hi - lo) / 3;
            int m2 = hi - (hi - lo) / 3;
            if (f[m1] < f[m2]) hi = m2;
            else lo = m1;
        }
        int b = lo;
        for (int i = lo + 1; i <= hi; i++) if (f[i] < f[b]) b = i;
        return b;
    }
    public static void main(String[] args) {
        System.out.println(argmin(new int[] {9, 7, 4, 2, 3, 8}));
    }
    // Input : [9,7,4,2,3,8]
    // Output: 3
}` },
    { tab: "Template", file: "TernaryReal.java",
      intro: "Minimise a convex f on [L,R] with 80 iterations.",
      code: `public class TernaryReal {
    static double f(double x) { return (x - 3) * (x - 3) + 1; }
    static double minX(double lo, double hi) {
        for (int it = 0; it < 80; it++) {
            double m1 = lo + (hi - lo) / 3;
            double m2 = hi - (hi - lo) / 3;
            if (f(m1) < f(m2)) hi = m2;
            else lo = m1;
        }
        return (lo + hi) / 2;
    }
    public static void main(String[] args) {
        System.out.printf("%.4f%n", minX(0, 10));
    }
    // Input : (x-3)^2+1 on [0,10]
    // Output: 3.0000
}` },
  ],
  complexity: {
    time: "O(log_{3/2} range) evaluations",
    space: "O(1)",
    derivation: [
      "<p>Each step multiplies the interval by \u2264 2/3. Integer domain of size n dies in O(log n) steps; you still brute O(1) leftovers.</p>",
    ],
    compare: [
      ["Linear scan", "O(n)", "O(1)", "Always correct"],
      ["Ternary", "O(log n) evals", "O(1)", "Unimodal f"],
      ["Binary on derivative", "O(log n)", "O(1)", "If you can test f(m) vs f(m+1)"],
      ["CHT / Li Chao", "O(n log n)", "O(n)", "Whole hull of lines"],
    ],
  },
  pitfalls: [
    { title: "Plateaus",
      bug: "f(m1)==f(m2) on a flat bottom: dropping either third can throw away the only index you needed if you don't brute the end.",
      fix: "Stop early and scan; or treat == as a case that shrinks both sides carefully." },
    { title: "Not unimodal",
      bug: "Two valleys. Ternary converges to a local min.",
      fix: "Prove convexity. Plot f on a small test." },
    { title: "Floating ternary with too few iters",
      bug: "eps 1e-9 on [0,1e9] needs ~ 2 log_{3/2}(1e18) \u2248 90 iterations, not 40.",
      fix: "80-100 iterations, ignore eps." },
    { title: "Integer overflow in m1/m2",
      bug: "lo + (hi-lo)/3 is safe; (2*lo+hi)/3 can overflow.",
      fix: "The code above." },
    { title: "Ternary when binary on f(m)&lt;=f(m+1) works",
      bug: "Two probes per step instead of one. Slower and more error-prone.",
      fix: "On integers, binary-search the first index with f[i]&lt;=f[i+1] for a bitonic array." },
  ],
  variants: [
    ["Bitonic peak", "Binary: if a[m]&lt;a[m+1] peak is right.", "LC 852", "one probe"],
    ["Ternary on reals", "Geometry: minimise max distance to points on a line.", "CF 1354C2? classic", "80 iters"],
    ["Convex DP", "opt is monotone; D&amp;C optimisation or CHT.", "dp-optimizations.html", "next module"],
  ],
  followups: [
    ["Why not always binary on f(m) vs f(m+1)?",
      "<p>On reals there is no m+1. On integers with a cheap neighbour test, binary is better. Ternary still works when you can only evaluate f, not compare adjacent discrete points easily (f is a heavy simulation).</p>"],
    ["Is every convex function unimodal?",
      "<p>Yes, a strictly convex f has a unique minimum. Weakly convex can have a flat bottom \u2014 brute the remainder.</p>"],
    ["Golden section vs 1/3-2/3?",
      "<p>Golden reuses one probe per step (one new evaluation). 1/3-2/3 is simpler and twice as many evals, still log. Use 1/3 in contests.</p>"],
    ["Connection to ternary search on trees?",
      "<p>Unrelated name. \"Ternary search on the answer\" vs a 3-ary search tree. Here we mean shrinking a numeric interval.</p>"],
  ],
  problems: [
    lc("852", "peak-index-in-a-mountain-array", "Easy", "Bitonic binary / ternary"),
    lc("1095", "find-in-mountain-array", "Hard", "Peak then two binaries"),
    cf("1354C", "Simple Polygon", "Medium", "Geometry, often math not ternary"),
    cf("578C", "Weakness and Poorness", "Hard", "Ternary on the mean"),
    cf("439D", "Devu and his Brother", "Medium", "Unimodal cost, ternary or sort"),
    { url: "https://codeforces.com/problemset/problem/1059/C", name: "Sequence Transformation", badge: "cf", tag: "CF 1059C", level: "Medium", pattern: "Not ternary \u2014 skip; use  pres" },
    lc("162", "find-peak-element", "Medium", "Local peak, binary on slope"),
    lc("4", "median-of-two-sorted-arrays", "Hard", "Binary, not ternary; contrast"),
  ],
  recap: [
    "Unimodal f: discard the worse third.",
    "Integers: stop at width 3 and scan.",
    "Reals: 80 iterations.",
    "Flat bottoms and multi-minima break it.",
    "Neighbour compare \u2192 binary, fewer probes.",
  ],
  oneliner: "while(hi-lo>3){ m1=lo+(hi-lo)/3; m2=hi-(hi-lo)/3; if(f(m1)<f(m2)) hi=m2; else lo=m1; }",
}),

pack({
  id: "mos-algorithm",
  difficulty: "Hard",
  readTime: "24 min",
  tagline: "Reorder offline range queries into sqrt-blocks so adding/removing one endpoint is amortised <code>O(n sqrt n)</code> instead of <code>O(nq)</code>.",
  tags: ["Mo", "offline", "sqrt", "P2"],
  prereqs: [
    ["Coordinate Compression", "coordinate-compression.html"],
    ["Two Pointers", "../01-arrays-and-windows/two-pointers.html"],
  ],
  why: [
    "n,q = 1e5 range queries that are not prefix-friendly (distinct count, mode, mex) cannot use Fenwick. If you can add and remove one index in O(1) or O(log n), Mo's algorithm orders the queries so the two pointers L,R move O(n sqrt n) times total.",
    "Sort queries by (L / B, R) with B \u2248 n/sqrt(q) or sqrt(n). Hilbert-order curves cut the constant further. Hilbert is optional; block sort is the interview version.",
    "Mo on trees (Euler tour, two visits) and Mo with updates (time as a third coordinate, n^{5/3}) are the upgrades. If the add is already O(log n), total is O(n sqrt n log n), still often fine.",
  ],
  insight: "You pay for moving L and R, not for answering. Sort queries so consecutive ones are nearby on the number line, in blocks.",
  yes: [
    "Offline [L,R] queries, add/remove an index is O(1)/O(log)",
    "Distinct values in a range (no updates)",
    "Sum of frequencies^2, mode, mex with a frequency of frequencies",
    "n,q \u2264 1e5 and you cannot think of a Fenwick identity",
    "Tree-path queries via Euler tour (Mo on trees)",
  ],
  no: [
    "Online queries &rarr; you cannot reorder",
    "Range sum / XOR \u2192 prefix, do not Mo",
    "Updates + queries at 1e5 if add is O(n) \u2192 too slow even for Mo-with-time",
    "n=1e6, q=1e6, add=O(1) \u2192 n sqrt n = 1e9, too slow; need a better structure",
  ],
  table: [
    ["Distinct in range, offline", "Mo + frequency map", "This page"],
    ["Range sum, static", "Prefix", "Not Mo"],
    ["Range sum, updates", "Fenwick", "Not Mo"],
    ["Mo with updates", "Blocks of size n^{2/3}", "3D Mo"],
    ["Tree paths", "Euler tour + Mo", "Mo on trees"],
    ["<strong>Confused with:</strong> sqrt decomposition of the array", "Sqrt-decomp precomputes blocks; Mo reorders queries", "Both are sqrt, different"],
  ],
  constraint: "<code>n, q &le; 10&#8309;</code>, add/remove O(1) \u2192 ~ n sqrt n = 3e7-2e8 operations. Java: keep the inner add tiny, use arrays not HashMap.",
  core: [
    "Maintain current [curL, curR] (init empty or [0,-1]). For each query in block order, while curL&gt;L add --curL; while curR&lt;R add ++curR; while curL&lt;L rem curL++; while curR&gt;R rem curR--. Then store ans[id].",
    "Block id of L is L/B. Sort by block, then by R ascending (odd blocks descending R \u2014 Hilbert-lite, cuts moves in half).",
  ],
  invariant: "<p>After processing a query, [curL, curR] equals the query range and the frequency structure matches that range. Total |endpoint moves| = O((n+q) sqrt n) with B = sqrt(n).</p>",
  array: [1, 2, 1, 3, 2],
  arrayLabel: "a =",
  vars: ["L,R", "cur", "distinct"],
  frames: [
    { note: "a=[1,2,1,3,2]. Queries: [0,2] dist 2, [1,4] dist 3, [0,4] dist 3. B=2.",
      active: [0, 1, 2], values: { "L,R": "init", cur: "[0,-1]", distinct: 0 } },
    { note: "Block-sorted: [0,2] then [0,4] then [1,4] (same/nearby blocks).",
      active: [0], values: { "L,R": "order", cur: "\u2014", distinct: "\u2014" } },
    { note: "Expand to [0,2]: add 1,2,1. distinct=2.",
      active: [0, 1, 2], values: { "L,R": "0,2", cur: "[0,2]", distinct: 2 } },
    { note: "Expand R to 4: add 3,2. distinct=3. Answer [0,4].",
      active: [0, 1, 2, 3, 4], values: { "L,R": "0,4", cur: "[0,4]", distinct: 3 } },
    { note: "Move L to 1: remove a[0]=1, freq[1] 2\u21921, still distinct 3. Answer [1,4].",
      active: [1, 2, 3, 4], values: { "L,R": "1,4", cur: "[1,4]", distinct: 3 } },
    { note: "Pointers moved a few steps, not 3 full rebuilds.",
      active: [1], values: { "L,R": "done", cur: "Mo", distinct: "saved" } },
  ],
  mermaid: `flowchart TD
  sortQ["sort queries by L/B then R"] --> move["add/remove until curL curR match"]
  move --> rec["record ans id"]
  rec --> nextQ["next query"]
  nextQ --> move`,
  merTitle: "Reorder, then crawl L and R",
  merCaption: "Add and rem must be inverses. Empty range is a legal start.",
  steps: [
    "<strong>Compress</strong> values if they are 1e9 so freq[] is an array.",
    "<strong>Pack queries</strong> (L,R,id). Sort by (L/B, R) with odd-even R.",
    "<strong>add(i):</strong> freq[a[i]]++; if freq==1 distinct++.",
    "<strong>rem(i):</strong> if freq==1 distinct--; freq[--].",
    "<strong>Move</strong> the four while-loops in an order that never goes invalid (add before rem when expanding).",
    "<strong>Write ans[id]</strong>. Print in original order.",
  ],
  code: [
    { tab: "Brute", file: "DistinctBrute.java",
      intro: "Rebuild a set per query.",
      code: `import java.util.*;
public class DistinctBrute {
    static int dist(int[] a, int l, int r) {
        Set<Integer> s = new HashSet<>();
        for (int i = l; i <= r; i++) s.add(a[i]);
        return s.size();
    }
    public static void main(String[] args) {
        int[] a = {1, 2, 1, 3, 2};
        System.out.println(dist(a, 0, 2) + " " + dist(a, 1, 4));
    }
    // Input : [1,2,1,3,2], queries [0,2] [1,4]
    // Output: 2 3
}` },
    { tab: "Optimal", file: "MoDistinct.java",
      intro: "Classic Mo for distinct counts.",
      highlight: "24-32",
      code: `import java.util.*;
public class MoDistinct {
    static int[] a, freq, ans;
    static int distinct;
    static void add(int i) { if (freq[a[i]]++ == 0) distinct++; }
    static void rem(int i) { if (--freq[a[i]] == 0) distinct--; }
    public static void main(String[] args) {
        a = new int[] {1, 2, 1, 3, 2};
        int[][] qs = {{0, 2, 0}, {1, 4, 1}};
        int n = a.length, B = (int) Math.sqrt(n);
        Arrays.sort(qs, (p, q) -> {
            int bp = p[0] / B, bq = q[0] / B;
            if (bp != bq) return bp - bq;
            return (bp & 1) == 0 ? p[1] - q[1] : q[1] - p[1];
        });
        freq = new int[4];
        ans = new int[2];
        int cl = 0, cr = -1;
        for (int[] q : qs) {
            while (cl > q[0]) add(--cl);
            while (cr < q[1]) add(++cr);
            while (cl < q[0]) rem(cl++);
            while (cr > q[1]) rem(cr--);
            ans[q[2]] = distinct;
        }
        System.out.println(ans[0] + " " + ans[1]);
    }
    // Input : same two queries
    // Output: 2 3
}` },
    { tab: "Template", file: "MoAddRem.java",
      intro: "The four while-loops, isolated. Plug any add/rem.",
      code: `public class MoAddRem {
    static void dummy() {}
    static void run(int[][] qs) {
        int cl = 0, cr = -1;
        for (int[] q : qs) {
            while (cl > q[0]) { dummy(); cl--; }
            while (cr < q[1]) { dummy(); cr++; }
            while (cl < q[0]) { dummy(); cl++; }
            while (cr > q[1]) { dummy(); cr--; }
        }
    }
    public static void main(String[] args) {
        run(new int[][] {{0, 2, 0}});
        System.out.println("ok");
    }
    // Input : one query
    // Output: ok
}` },
  ],
  complexity: {
    time: "O((n + q) sqrt n * T_add)",
    space: "O(n + q)",
    derivation: [
      "<p>L moves: each block of L has size B, q queries, plus n resets: O(q B + n n/B). R moves O(n * n/B + q n/B wait): R is monotonic inside a block, so O((n/B)*n + q*something). Set B=sqrt(n), both are O(n sqrt n).</p>",
    ],
    compare: [
      ["Rebuild each query", "O(n q)", "O(n)", "tiny q"],
      ["Mo", "O(n sqrt n)", "O(n)", "Offline, O(1) add"],
      ["Fenwick distinct (offline sort)", "O(n log n)", "O(n)", "When a BIT identity exists"],
      ["Mo + updates", "O(n^{5/3})", "O(n)", "Time as 3rd coord"],
    ],
  },
  pitfalls: [
    { title: "add/rem not inverses",
      bug: "Removing twice, or freq going negative, then distinct drifts forever.",
      fix: "rem is the exact inverse. Assert freq[x]>=0." },
    { title: "HashMap frequencies at 1e5",
      bug: "T_add is huge; n sqrt n * hashmap blows the TL.",
      fix: "Compress to 1..n, int[] freq." },
    { title: "Starting from [0,0] without adding 0",
      bug: "You think the first index is in, but it is not, or you double-add it.",
      fix: "Start [0,-1] empty, only add in the while loops." },
    { title: "Sorting by R only",
      bug: "L jumps randomly, O(nq).",
      fix: "Primary key is L-block." },
    { title: "Inclusive/exclusive mix",
      bug: "Queries are [l,r] inclusive, you rem r when you meant r+1.",
      fix: "Stick to inclusive and the four loops above." },
  ],
  variants: [
    ["Odd-even R", "Inside odd blocks sort R descending. Fewer R resets.", "Hilbert-lite", "always do this"],
    ["Mo on trees", "Euler tour; a node with both copies in range is not on the path.", "toggle add/rem", "CF 375D"],
    ["With updates", "Block size n^{2/3}; time coordinate; apply/rollback updates.", "3D Mo", "when needed"],
  ],
  followups: [
    ["Why sqrt?",
      "<p>Balance L-moves (worse when B is large) against R-moves (worse when B is small / more blocks). B=n/sqrt(q) is slightly better than sqrt(n) when q differs from n.</p>"],
    ["Can Mo be online?",
      "<p>No. The sort needs all queries. If queries are online, you need a real data structure.</p>"],
    ["Distinct with updates, online?",
      "<p>Not Mo. Segment tree of Fenwicks, or a wavelet tree, or sqrt rebuild. Harder.</p>"],
    ["Hilbert order?",
      "<p>Map (L,R) to a position on a Hilbert curve so nearby queries in 2D are nearby in 1D. Faster constants, longer code. Block sort first.</p>"],
  ],
  problems: [
    lc("307", "range-sum-query-mutable", "Medium", "Wrong tool: Fenwick, not Mo"),
    cf("86D", "Powerful array", "Hard", "sum freq^2 * value, Mo"),
    cf("375D", "Tree and Queries", "Hard", "Mo on trees / sack"),
    cf("220B", "Little Elephant and Array", "Medium", "How many x with freq x == x"),
    lc("898", "bitwise-ors-of-subarrays", "Medium", "Not Mo \u2014 different"),
    { url: "https://codeforces.com/problemset/problem/617/E", name: "XOR and Favorite Number", badge: "cf", tag: "CF 617E", level: "Hard", pattern: "Mo on prefix XOR" },
    cf("617E", "XOR and Favorite Number", "Hard", "Mo on prefix XOR"),
    lc("699", "falling-squares", "Hard", "Not Mo; contrast"),
  ],
  recap: [
    "Offline only. Sort by (L/B, R).",
    "Four while-loops move [curL,curR].",
    "add/rem inverse, array frequencies after compress.",
    "Start empty [0,-1].",
    "B \u2248 sqrt(n); odd-even R helps.",
  ],
  oneliner: "while(cl>L)add(--cl); while(cr<R)add(++cr); while(cl<L)rem(cl++); while(cr>R)rem(cr--);",
}),

pack({
  id: "randomized-techniques",
  difficulty: "Medium",
  readTime: "22 min",
  tagline: "Randomised algorithms in contests: hashing bases, Miller-Rabin, treaps, random shuffle + greedy, and Monte-Carlo fingerprints &mdash; plus how to bound the failure probability.",
  tags: ["random", "hashing", "treap", "P2"],
  prereqs: [
    ["Rolling Hash", "../12-strings-advanced/rolling-hash.html"],
    ["Modular Arithmetic", "../11-math-and-number-theory/modular-arithmetic.html"],
  ],
  why: [
    "A lot of deterministic-looking problems become short with a random hash or a random partition. Rolling hashes, Zobrist hashing of sets, and randomised incremental construction (Delaunay, treaps) are standard. Interviews may ask Miller-Rabin or \"why shuffle then greedy\".",
    "Monte-Carlo algorithms can be wrong with tiny probability (hash collision). Las Vegas algorithms are always correct and only the runtime is random (randomised quicksort, treap). Know which one you shipped.",
    "CF anti-hash tests punish fixed bases. Randomise on startup from a high-resolution clock. Never seed with 0 only.",
  ],
  insight: "If a random fingerprint collides with probability 1/2^{64}, q = 1e5 comparisons still fail with probability ~ 1e5/2^{64}. That is the calculation you recite.",
  yes: [
    "Rolling hash / Zobrist set equality",
    "Miller-Rabin primality, Pollard Rho factoring",
    "Treap / implicit treap as a randomised BST",
    "Shuffle the array then a greedy that is correct in expectation or w.h.p.",
    "Randomised incremental: random order of insertion",
  ],
  no: [
    "The judge is adversarial and you used a fixed hash \u2192 still randomise, or go deterministic (KMP, SA)",
    "Need a guaranteed worst-case O(n log n) BST \u2192 splay / scapegoat / policy_rbtree, not a treap without care",
    "Cryptographic randomness \u2192 java.security.SecureRandom, not contest RNG",
    "Derandomisation required by the statement \u2192 method of conditional probabilities, rare",
  ],
  table: [
    ["Substring equality", "Polynomial hash, random base", "Rolling hash"],
    ["Multiset equality", "Zobrist XOR of random 64-bit ids", "Zobrist"],
    ["Primality n ~ 1e18", "Miller-Rabin", "This page"],
    ["Split/merge a sequence", "Implicit treap, random priority", "Treap"],
    ["Quickselect expected n", "Random pivot", "kth"],
    ["<strong>Confused with:</strong> random test generation", "That's fuzzing your solution; here randomness is in the solution", "Different"],
  ],
  constraint: "Failure 2^{-64} is enough for 1e9 operations. Miller-Rabin: 7-13 bases for 64-bit, or random witnesses. Java <code>ThreadLocalRandom</code> / <code>Random</code> with nanoTime seed.",
  core: [
    "Zobrist: each value (or each (position,value)) gets a random 64-bit mask. XOR is the set hash; add/remove is XOR again. Collisions like 2^64 hashes.",
    "Miller-Rabin: write n-1 = 2^s * d. For a witness a, compute a^d and square s times; if you never see 1 or n-1 at the right time, n is composite. Random a, or a fixed list that is deterministic for 64-bit integers.",
  ],
  invariant: "<p>A Monte-Carlo fingerprint is a homomorphism from the object (string, set) to a ring. Distinct objects collide with probability about 1/|ring| per comparison if the map is pairwise independent / polynomial.</p>",
  array: [7, 13, 15, 17, 21],
  arrayLabel: "n tested =",
  vars: ["n", "MR", "verdict"],
  frames: [
    { note: "7 is prime. Miller-Rabin with a=2: 7-1=2^1*3, 2^3=8\equiv1 mod 7. Pass.",
      active: [0], values: { n: 7, MR: "a=2", verdict: "prime" } },
    { note: "13 prime. Pass.",
      active: [1], values: { n: 13, MR: "pass", verdict: "prime" } },
    { note: "15=3*5 composite. a=2: 15-1=2^1*7, 2^7=128\equiv8 mod 15, not 1 or 14. Fail \u2192 composite.",
      active: [2], values: { n: 15, MR: "a=2", verdict: "composite" } },
    { note: "17 prime. Pass.",
      active: [3], values: { n: 17, MR: "pass", verdict: "prime" } },
    { note: "Zobrist: set {1,2} XOR {2,1} same masks, equal. {1,2} vs {1,3} differ w.h.p.",
      active: [0, 1], values: { n: "zobrist", MR: "xor", verdict: "equal sets" } },
    { note: "Shuffle then \"first that works\": expected few trials if a constant fraction of permutations are good.",
      active: [4], values: { n: "shuffle", MR: "Las Vegas", verdict: "retry" } },
  ],
  mermaid: `flowchart TD
  kind{"Monte-Carlo or Las Vegas?"}
  kind -- "may be wrong" --> mc["hash / MR fingerprint"]
  kind -- "always correct" --> lv["treap / rand quicksort"]
  mc --> bound["fail ~ q / 2^64"]
  lv --> exp["expected time"]`,
  merTitle: "Name the error model",
  merCaption: "Monte-Carlo: bound the failure. Las Vegas: bound the expected time. Do not mix them in the analysis.",
  steps: [
    "<strong>Pick the model:</strong> fingerprint (MC) or random structure (LV).",
    "<strong>Seed</strong> RNG from nanoTime xor identityHash, not a constant.",
    "<strong>Hash:</strong> random base / Zobrist table of 64-bit values.",
    "<strong>MR:</strong> deterministic bases for 64-bit, or k random witnesses.",
    "<strong>Treap:</strong> random priority per node, rotate to heap-order.",
    "<strong>State the bound</strong> in a comment if the blog / interview asks.",
  ],
  code: [
    { tab: "Brute", file: "IsPrimeBrute.java",
      intro: "Trial division up to sqrt(n). Fine for n \u2264 1e12 if careful, slow at 1e18.",
      code: `public class IsPrimeBrute {
    static boolean prime(long n) {
        if (n < 2) return false;
        for (long i = 2; i * i <= n; i++) if (n % i == 0) return false;
        return true;
    }
    public static void main(String[] args) {
        System.out.println(prime(15) + " " + prime(17));
    }
    // Input : 15, 17
    // Output: false true
}` },
    { tab: "Optimal", file: "MillerRabin.java",
      intro: "Deterministic Miller-Rabin for 64-bit (known witness set).",
      code: `public class MillerRabin {
    static long mul(long a, long b, long m) {
        return (long) ((a * (double) b) % m); // demo only; use BigInteger or int128 mulMod in real contests
    }
    static long pow(long a, long e, long m) {
        long r = 1 % m;
        while (e > 0) {
            if ((e & 1) == 1) r = mul(r, a, m);
            a = mul(a, a, m);
            e >>= 1;
        }
        return r;
    }
    static boolean check(long n, long a) {
        if (n % a == 0) return n == a;
        long d = n - 1, s = 0;
        while ((d & 1) == 0) { d >>= 1; s++; }
        long x = pow(a, d, n);
        if (x == 1 || x == n - 1) return true;
        for (int i = 1; i < s; i++) {
            x = mul(x, x, n);
            if (x == n - 1) return true;
        }
        return false;
    }
    static boolean prime(long n) {
        if (n < 2) return false;
        for (int p : new int[] {2, 3, 5, 7, 11, 13, 17}) if (n == p) return true;
        for (int a : new int[] {2, 3, 5, 7, 11, 13, 17}) if (!check(n, a)) return false;
        return true;
    }
    public static void main(String[] args) {
        System.out.println(prime(15) + " " + prime(17));
    }
    // Input : 15, 17
    // Output: false true
}` },
    { tab: "Template", file: "Zobrist.java",
      intro: "Set hash: XOR of random masks. Toggle membership.",
      code: `import java.util.Random;
public class Zobrist {
    static final long[] MASK = new long[64];
    static {
        Random rng = new Random(1_000_000_007L);
        for (int i = 0; i < MASK.length; i++) MASK[i] = rng.nextLong();
    }
    static long toggle(long h, int x) { return h ^ MASK[x]; }
    public static void main(String[] args) {
        long a = 0, b = 0;
        a = toggle(a, 1); a = toggle(a, 2);
        b = toggle(b, 2); b = toggle(b, 1);
        System.out.println(a == b);
    }
    // Input : {1,2} vs {2,1}
    // Output: true
}` },
  ],
  complexity: {
    time: "MR O(k log n mul); hash O(1); treap O(log n) expected",
    space: "O(1) to O(n)",
    derivation: [
      "<p>Miller-Rabin is k modular exponentiations. Each mulMod is O(1) with 128-bit, O(log m) with BigInteger. Collision bound: union bound over comparisons.</p>",
    ],
    compare: [
      ["Trial division", "O(sqrt n)", "O(1)", "n <= 1e12"],
      ["Miller-Rabin", "O(k log n)", "O(1)", "n <= 2^64"],
      ["Deterministic SA / KMP", "O(n)", "O(n)", "When you refuse MC"],
      ["Treap", "O(log n) expected", "O(n)", "Split/merge sequences"],
    ],
  },
  pitfalls: [
    { title: "Fixed hash base on CF",
      bug: "Anti-hash tests. WA on test 67.",
      fix: "Random base, two moduli, or 2^61-1 + unsigned." },
    { title: "mul overflow in MR",
      bug: "a*b % m for 1e18 wraps long and the witness is wrong: primes declared composite.",
      fix: "BigInteger, or long mulMod via split, or Math.multiplyHigh / unsigned." },
    { title: "Seeding Random with 0",
      bug: "Reproducible collisions the setter can target if they know the seed.",
      fix: "nanoTime, or accept determinism for local debug only." },
    { title: "Treap without unique priorities",
      bug: "Equal priorities can unbalance or infinite-rotate if you are not careful.",
      fix: "Random long priorities; on equal, treat as heap-tie by pointer." },
    { title: "Calling a Monte-Carlo algorithm Las Vegas in an interview",
      bug: "You claim \"always correct\" about hashing.",
      fix: "Say \"error 2^{-64}\" or verify with a deterministic compare on collision." },
  ],
  variants: [
    ["Pollard Rho", "Random walk to factor 64-bit. Pair with MR.", "CF factoring", "n <= 1e18"],
    ["Implicit treap", "Array split/merge, lazy reverse.", "sequence operations", "alternative to splay"],
    ["Randomised incremental geometry", "Insert points in random order; expected O(n log n) hull/Delaunay.", "convex hull next module", "Clarkson"],
  ],
  followups: [
    ["Monte-Carlo vs Las Vegas?",
      "<p>MC: bounded error, usually fast worst-case (hash). LV: always correct, expected fast (random pivot). Quicksort is LV. Hashing without verify is MC.</p>"],
    ["Why do 7 MR bases suffice for 64-bit?",
      "<p>There is a proven finite set of witnesses that jointly catch every 64-bit composite. Using them makes MR deterministic for that range.</p>"],
    ["Zobrist vs polynomial hash for sets?",
      "<p>Polynomial cares about order. XOR of random ids is commutative \u2014 it hashes sets/multisets (multiset needs a counter-dependent mask or 2D table).</p>"],
    ["Can you derandomise hashing?",
      "<p>Universal hashing with a random draw from a 2-universal family is already the theoretical version. Worst-case deterministic substring equality is KMP/SA/Z.</p>"],
  ],
  problems: [
    lc("215", "kth-largest-element-in-an-array", "Medium", "Randomised quickselect"),
    lc("384", "shuffle-an-array", "Medium", "Fisher-Yates"),
    lc("398", "random-pick-index", "Medium", "Reservoir sampling"),
    cf("17E", "Palisection", "Hard", "Hash palindromes (heavy)"),
    cf("702F", "T-Shirts", "Hard", "Implicit treap"),
    { url: "https://codeforces.com/problemset/problem/776/D", name: "The Door Problem", badge: "cf", tag: "CF 776D", level: "Hard", pattern: "2-SAT, not random" },
    lc("380", "insert-delete-getrandom-o1", "Medium", "Hash + array swap"),
    lc("528", "random-pick-with-weight", "Medium", "Prefix + binary search"),
  ],
  recap: [
    "Monte-Carlo: bound q/2^{64}. Las Vegas: expected time.",
    "Randomise hash bases. Never a famous fixed 31 + 1e9+7 alone on CF.",
    "Miller-Rabin for 64-bit primality; mulMod carefully.",
    "Zobrist XOR for sets.",
    "Treap = BST + random heap priorities.",
  ],
  oneliner: "seed RNG; fingerprint or random priority; state the failure/expectation bound;",
}),
];

/* Module 13 — Greedy & Offline Techniques */
import { pack, lc, cf } from "./pack.mjs";

export const topics = [

pack({
  id: "greedy-foundations",
  difficulty: "Easy",
  readTime: "28 min",
  tagline: "A greedy choice is legal only with an exchange argument or a matroid / stay-ahead proof &mdash; \"it looks locally good\" is not a proof.",
  tags: ["greedy", "exchange", "stay-ahead", "P0"],
  prereqs: [
    ["Problem-Solving Framework", "../00-foundations/problem-solving-framework.html"],
    ["Sorting & Comparators", "../02-sorting-hashing-bits/sorting-and-comparators.html"],
  ],
  why: [
    "You are given a list of meetings, each with a start time and a finish time, and you must pack as many as possible into one room so that no two overlap. Trying every subset is perfectly correct: with twenty meetings that is about a million subsets, and with a hundred thousand meetings it is not an option the judge will wait for. A tempting shortcut is \"always take the meeting that starts first\", but one long meeting that opens at time 0 and closes at noon then blocks every short meeting that could have fitted after nine. The technique on this page is the proof that tells you which shortcut is legal.",
    "The subset scan costs <code>2<sup>n</sup></code> times a linear overlap check. At <code>n = 40</code> that is already a trillion steps, and dynamic programming on \"which meetings I have used\" is the same exponential unless you invent a small numeric state. What a legal greedy buys is a sort plus one pass: each of the <code>n</code> meetings is compared during the sort at <code>log n</code> cost, then scanned once, which is about <code>1.7 &times; 10<sup>6</sup></code> operations at <code>n = 10<sup>5</sup></code>. That budget only works when you can prove the first choice you make already appears in some optimal answer.",
    "The proof is an <em>exchange argument</em>, said in words before any symbol appears: take any optimal answer, and if its first choice is not mine, swap that first choice for mine without making the answer worse. After the swap you still have a legal schedule, it is still optimal, and it now agrees with you on the first pick. Repeat on whatever is left. If every swap stays feasible and never loses quality, your whole sequence is optimal. <em>Stay-ahead</em> is the cousin: after <code>k</code> picks, your <code>k</code>-th event is already at least as good as anyone else's, so the last step is optimal by itself.",
    "In a real problem statement the signal is a request to pick, schedule, or order items sitting next to limits such as <code>n &le; 10<sup>5</sup></code>, with no extra weight on each item. That combination rules out subset enumeration and usually rules out DP. The same paragraph covers Huffman merging, Kruskal's lightest-edge rule, and deadline scheduling. Coin change is the counterexample you should name: US denominations happen to work, but the set <code>{1, 3, 4}</code> making 6 prefers <code>3+3</code> over the greedy <code>4+1+1</code>, so the swap can lose and you write DP instead.",
  ],
  insight: "Take any optimal answer and swap its first choice for mine without making it worse; if that swap is always legal, induction says the whole greedy sequence is optimal. Stay-ahead is the same idea on prefixes: after <code>k</code> picks you are already no worse than any other feasible <code>k</code>-set.",
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
  constraint: "A sort-plus-scan at <code>n &le; 10<sup>5</sup></code> is the signature: about <code>n log n</code> comparisons, which a judge accepts, while <code>2<sup>n</sup></code> subsets are not. If the constraint is <code>n = 100</code> and the values look like a knapsack (weights, capacities, \"at most W\"), it is DP even when a greedy happens to pass the sample. Weighted activity selection is the same trap.",
  core: [
    "Call the greedy sequence <code>G</code> and some optimal sequence <code>O</code>, both written in the order of the sort key. Walk them from the left until the first index <code>i</code> where they disagree: <code>G</code> took item <code>g</code> and <code>O</code> took item <code>o</code>. Build a new sequence <code>O'</code> by putting <code>g</code> into <code>O</code> in place of <code>o</code> (or in place of whichever later <code>O</code>-item conflicts with <code>g</code>). The exchange argument is the claim that <code>O'</code> is still feasible and that <code>cost(O')</code> is no worse than <code>cost(O)</code> &mdash; for a maximum-count problem, <code>|O'| &ge; |O|</code>. Then <code>O'</code> is optimal and agrees with <code>G</code> one step longer.",
    "Stay-ahead names a different pair of quantities. After <code>k</code> choices, let <code>t<sub>G</sub>(k)</code> be the time (or load, or finish) of greedy's <code>k</code>-th event, and let <code>t<sub>O</sub>(k)</code> be the same number for any other feasible <code>k</code>-set. The invariant is <code>t<sub>G</sub>(k) &le; t<sub>O</sub>(k)</code> (or the reverse, depending on the measure). Because the next greedy pick is the locally best remaining item, the inequality survives one more step. When the sequences end, greedy is at least as good as <code>O</code>, so it is optimal. Dijkstra's extracted distances and Huffman's merged weights are stay-ahead arguments of this shape.",
    "Walk the six activities <code>(1,4)</code>, <code>(3,5)</code>, <code>(0,6)</code>, <code>(5,7)</code>, <code>(8,9)</code>, <code>(5,9)</code> after sorting by finish time. Greedy takes index 0 because it finishes first, at time 4. Indices 1 and 2 start before 4 so they are skipped; index 3 starts at 5 and is taken; index 4 starts at 8 and is taken; index 5 overlaps. The set <code>{0, 3, 4}</code> has size 3. Any optimal that skipped 0 must have taken some later job that overlaps 0; swapping that job for 0 frees the timeline no later than before, so the count does not drop, and the rest of the proof is induction.",
  ],
  invariant: "<p>If a swap that aligns the next greedy choice with some optimal solution never worsens that solution, the greedy prefix is contained in some optimal solution.</p><p>In plain words, take any optimal answer, swap its first choice for mine, and check that you did not make it worse &mdash; if that sentence is true, you may code the sort.</p><p>Interview sentence: <em>\"I take any optimal answer and swap its first choice for mine without making it worse.\"</em></p>",
  extra: [
    {
      kind: "key",
      title: "The exchange in one breath",
      html: "<p>Take any optimal answer. Swap its first choice for mine. If the swap never makes that answer worse, induction finishes the proof. If you cannot finish that paragraph on the whiteboard, do not ship the greedy.</p>",
    },
    {
      kind: "warn",
      title: "Nearby keys have counters",
      html: "<p>Earliest start and shortest duration look locally smart and fail on tiny instances. Coin change on <code>{1,3,4}</code> for 6 is the other classic: greedy takes 4 and then two 1s, while <code>3+3</code> is better, so the swap can lose.</p>",
    },
  ],
  dryIntro: "Six meetings sorted by finish time. Each row is one scan step: the meeting under consideration, the last finish we committed to, and the set we have taken so far.",
  array: [1, 3, 0, 5, 8, 5],
  arrayLabel: "finish times of activities =",
  indexLabels: ["0", "1", "2", "3", "4", "5"],
  vars: ["pick", "lastFin", "set"],
  frames: [
    { note: "Six meetings (start, finish): (1,4), (3,5), (0,6), (5,7), (8,9), (5,9). Sorting by finish puts them in index order 0, 1, 2, 3, 4, 5.",
      active: [0], values: { pick: "sort", lastFin: "\u2014", set: "[]" } },
    { note: "The earliest finish is index 0 at time 4, so that is the first greedy pick and lastFin becomes 4.",
      active: [0], values: { pick: 0, lastFin: 4, set: "{0}" } },
    { note: "Index 1 starts at 3, which is before 4, so skip it; index 2 starts at 0, skip; index 3 starts at 5 and is taken, lastFin becomes 7.",
      active: [3], values: { pick: 3, lastFin: 7, set: "{0,3}" } },
    { note: "Index 4 starts at 8, which is after 7, so take it; index 5 starts at 5 and overlaps the new finish 9, so skip it.",
      active: [4], values: { pick: 4, lastFin: 9, set: "{0,3,4}" } },
    { note: "The set {0, 3, 4} has size 3. Any optimal that skipped 0 can swap 0 in for its first overlapping job without losing a slot.",
      active: [0, 3, 4], values: { pick: "done", lastFin: 9, set: "size 3" } },
    { note: "Shortest-duration greedy would grab (8,9) first and still looks fine here, but it fails on other instances, which is why the finish-time proof is required.",
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
    "<strong>Name the first choice and the key.</strong> Say out loud which item is taken first and by which number (finish time, density, deadline), because that sentence is the thing the exchange has to defend.",
    "<strong>Sort by that key, with a justified tie-break.</strong> The order is the candidate greedy sequence; a tie-break you cannot explain is usually a sign that the key is still fuzzy.",
    "<strong>Scan once and take every still-feasible item.</strong> After each take, update the resource you spent (last finish, remaining capacity) so the next check is a constant-time comparison.",
    "<strong>Write the exchange before you code.</strong> Take any optimal answer, swap its first choice for yours, and check that the swap does not make that answer worse; if the sentence stalls, stop.",
    "<strong>Hunt a counterexample for the next-most-tempting key.</strong> Earliest start and shortest duration look locally smart; a two-meeting instance that breaks them is what you recite when the interviewer asks \"why this key\".",
    "<strong>Implement the scan only after the paragraph works.</strong> Greedy code is usually ten lines after the sort, which is exactly why a wrong key ships so easily and why the proof comes first.",
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
      "<p>Each of the <code>n</code> items is compared during the sort, and a comparison-based sort costs <code>log n</code> per item, which is <code>n log n</code> operations in total. The later scan touches each item once and does a constant-time feasibility check, so it is absorbed. Putting real numbers in: at <code>n = 10<sup>5</sup></code> the sort is about <code>1.7 &times; 10<sup>6</sup></code> comparisons and finishes in milliseconds.</p>",
      "<p>The brute alternative enumerates <code>2<sup>n</sup></code> subsets and spends a linear scan on each, which is already a trillion steps at <code>n = 40</code> and is why the exchange has to exist. When the exchange fails you fall back to DP whose cost is whatever the state space is, not this <code>n log n</code> bound.</p>",
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
      bug: "Earliest-start looks right because it fills the room immediately, but a long early meeting then blocks every short one that could have fitted later, so the count can drop by one on a three-meeting instance.",
      fix: "Sort by earliest finish, not earliest start. Test it on <code>(0,10), (1,2), (3,4)</code>: start-time greedy takes one, finish-time greedy takes two." },
    { title: "Skipping the proof because the sample passed",
      bug: "Coin change on <code>{1,3,4}</code> for 6 looks like the US-coin habit, so greedy takes 4 then two 1s and reports 3 coins, which matches a wrong mental model of \"largest first always works\".",
      fix: "If you cannot finish the swap paragraph, write DP. The counter is <code>3+3</code>, two coins; recite it when someone says \"coins are greedy\"." },
    { title: "Wrong tie-break",
      bug: "Equal finish times make any pick look interchangeable for the unweighted count, so taking the later start still passes samples, while the weighted version silently needs DP and a reconstruction that this greedy cannot give.",
      fix: "Unweighted count: any tie-break is fine. Weighted activity: this greedy is the wrong algorithm, so switch to DP on sorted finishes." },
    { title: "Mutating the original index order",
      bug: "Sorting the finish array in place and leaving starts unmoved looks like a harmless reorder, but it pairs each finish with the wrong start and the scan then accepts overlapping jobs.",
      fix: "Sort an index array, or sort pairs <code>(start, finish)</code> together. Check that after the sort, <code>s[id[i]]</code> still belongs to <code>f[id[i]]</code>." },
    { title: "Claiming Huffman / Kruskal without naming the structure",
      bug: "\"Because Kruskal is greedy\" sounds like a reason in an interview, but it names an algorithm instead of a property, so a follow-up of \"why does the swap not lose?\" has nowhere to go.",
      fix: "Say the exchange, the cut property, or \"it is a matroid\" in one sentence. The algorithm name is not the proof." },
  ],
  variants: [
    ["Weighted activity", "Greedy by finish is wrong. DP on sorted finish + binary search p(i).", "LC 1235", "DP"],
    ["Fractional knapsack", "Sort by value/weight, take prefix. Exchange on density.", "textbook", "fractions allowed"],
    ["Huffman", "Always merge two lightest. Exchange on tree shape.", "LC 1167 analogue", "prefix-free codes"],
  ],
  followups: [
    ["Give a one-line exchange for earliest-finish.",
      "<p>Take any optimal answer and look at the first job in it that overlaps greedy's first pick. Greedy's pick finishes no later than that job, so swapping it in frees the timeline at least as early and the rest of the optimal schedule stays feasible. The count does not drop, so the new answer is still optimal and now agrees on the first choice.</p>"],
    ["When is coin greedy correct?",
      "<p>It is correct on <em>canonical</em> coin systems such as US denominations, where each coin is at least twice the next smaller one in a way that makes the swap never lose. The proof is not obvious and is easy to get wrong. In a contest, assume DP unless the statement names a canonical set or the limits are huge and the coins are exactly <code>1, 5, 10, 25</code>.</p>"],
    ["Matroid in one sentence?",
      "<p>A <em>matroid</em> is a family of independent sets that is closed under taking subsets and has an exchange property: you can always grow the smaller of two independent sets by stealing an element from the larger. Kruskal is greedy on the graphic matroid (forests of a graph). Weighted greedy is optimal on every matroid, which is why \"it is a matroid\" is a complete interview reason.</p>"],
    ["Stay-ahead vs exchange?",
      "<p>Stay-ahead compares prefixes: after <code>k</code> picks, greedy's <code>k</code>-th event is already no worse than any other feasible <code>k</code>-set, and the last step is then optimal by itself. Exchange rewrites a full optimal solution until it matches greedy. Both are induction. Use whichever paragraph is shorter for the problem in front of you; Dijkstra and Huffman are usually stay-ahead, activity selection is usually exchange.</p>"],
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
  readTime: "28 min",
  tagline: "A field guide to the greedy shapes you will actually be handed: intervals, jumps, gas, candies, Huffman-like merging, and scheduling.",
  tags: ["greedy", "intervals", "scheduling", "P0"],
  prereqs: [
    ["Greedy Foundations", "greedy-foundations.html"],
    ["Heaps & Priority Queue", "../03-linear-structures/heaps-and-priority-queue.html"],
  ],
  why: [
    "You are given one of a handful of shapes that interviews and contests recycle: a list of intervals to pack, an array of jump lengths, a circular gas route, ratings that must beat their neighbours, or files that must be merged two at a time. Each shape has exactly one sort key and one linear pass, and mixing the keys is the usual wrong submission. The previous page is the proof toolkit; this page is the field guide that says which key belongs to which object, so you do not spend the first ten minutes reinventing activity selection under a new name.",
    "The obvious alternative is to write a DP for every one of them. Min-jumps-to-index is a correct DP, weighted interval scheduling is a correct DP, and both die at <code>n = 10<sup>5</sup></code> if the state is quadratic. What the classics buy is a linear or <code>n log n</code> scan once the key is named: sort intervals by finish, walk jumps in one BFS-shaped window, find the deepest gas-cost prefix, run two slope passes on ratings, or pop a heap of file sizes. At a hundred thousand items that is a couple of million operations, not a hundred million DP transitions.",
    "In a real problem statement the signal is the object itself sitting next to those limits. \"Maximum number of non-overlapping intervals\" is earliest finish. \"Minimum jumps to the last index\" is farthest reach in the current window. \"Circular tour, unique start\" is the index after the minimum prefix. Interviewers then chain an upgrade: \"now each interval has a profit\" kills the greedy and you write DP; \"now you have <code>k</code> rooms\" keeps a greedy but upgrades the structure to a heap of end times. Knowing which upgrade kills the key is the rest of the skill.",
  ],
  insight: "Name the sort key in one phrase before you touch the keyboard: earliest finish, farthest in the window, start after the worst prefix, two slope passes, or always merge the two lightest. If you cannot say that phrase, you do not yet know which classic it is.",
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
  constraint: "All of these run in <code>n</code> or <code>n log n</code>, so <code>n = 10<sup>5</sup></code> is the intended budget. If you wrote a quadratic DP on a hundred thousand intervals you picked the weighted variant by mistake, or you missed that the unweighted count is a sort. A heap of <code>k</code> end times is still this family; a profit on each interval is not.",
  core: [
    "Jump Game II keeps three integers. <code>s</code> is how many jumps you have already committed to, <code>R</code> is the farthest index those <code>s</code> jumps can reach, and <code>farthest</code> is the farthest index you have seen while scanning the current window <code>[L, R]</code>. When the scan index <code>i</code> hits <code>R</code>, you must jump: increment <code>s</code> and set <code>R</code> to <code>farthest</code>. That window is a BFS layer on the array without a queue, so the first time <code>R</code> covers the last index the jump count is shortest. Loop only to <code>n-2</code>, because landing on the last index does not spend another jump.",
    "Gas uses a running prefix of <code>gas[i] - cost[i]</code>. If the total over the whole circle is negative the tour is impossible and you return <code>-1</code> immediately. Otherwise there is a unique start: the index just after the minimum prefix, because that prefix is the deepest deficit on the circle and starting immediately after it is the only way the tank never goes negative. You can compute the same answer with a tank variable that resets at every local crash; both views are the same one-pass scan.",
    "Walk the jump array <code>[2, 3, 1, 1, 4]</code>. From index 0 you can reach 2, so the first window is <code>[1, 2]</code> after one jump. Scanning that window, index 1 can reach 4 and index 2 can reach 3, so <code>farthest</code> becomes 4. The second jump's window already contains the last index, and the answer is 2. The same page's gas sample <code>gas = [1,2,3,4,5]</code>, <code>cost = [3,4,5,1,2]</code> has prefixes <code>-2, -4, -6, -3, 0</code>; the minimum sits at index 2, so the start is 3, and the tank stays non-negative from there.",
    "Candies and Huffman close the field guide. Ratings need two slope passes: left-to-right enforce \"more than the left neighbour\", right-to-left enforce the right neighbour, then take the max at each index &mdash; one pass misses a valley. File merging always pops the two lightest sizes from a heap, pays their sum, and pushes the sum back, because every later merge will pay that combined size again. That last fact is the exchange: swapping a heavier pair earlier only increases every ancestor's cost.",
  ],
  invariant: "<p>Each classic has one invariant that the pass maintains: activity &mdash; the last finish among any <code>k</code> taken jobs is minimal for greedy; jumps &mdash; <code>[0, R]</code> is exactly the set reachable in at most <code>s</code> jumps; gas &mdash; the prefix surplus is minimised at <code>start - 1</code>.</p><p>In plain words, name the number the scan is protecting (earliest free time, farthest reach, deepest deficit, neighbour slopes, or lightest pair) and refuse to update it with a different key.</p><p>Interview sentence: <em>\"I name the key first; the pass only protects that number.\"</em></p>",
  extra: [
    {
      kind: "idea",
      title: "The upgrade that kills the key",
      html: "<p>Weights on intervals turn activity selection into DP. A budget of <code>k</code> rooms keeps a greedy but needs a heap of end times. If the interviewer adds either sentence, say which upgrade you are making before you touch the keyboard.</p>",
    },
  ],
  dryIntro: "One jump-game window, then the matching gas, candy, and Huffman traces. Each row names the key the scan is protecting at that moment.",
  array: [2, 3, 1, 1, 4],
  arrayLabel: "jump length =",
  vars: ["s", "R", "farthest"],
  frames: [
    { note: "Jump Game II on [2, 3, 1, 1, 4]. Zero jumps so far, the window is just index 0, and from there farthest is 2.",
      active: [0], values: { s: 0, R: 0, farthest: 2 } },
    { note: "One jump now covers the window [1, 2]. Index 1 can reach 4 and index 2 can reach 3, so farthest becomes 4.",
      active: [1, 2], values: { s: 1, R: 2, farthest: 4 } },
    { note: "The second jump opens the window [3, 4], which already contains the last index, so the answer is 2 and we stop.",
      active: [4], values: { s: 2, R: 4, farthest: 4 } },
    { note: "Gas [1,2,3,4,5] against cost [3,4,5,1,2] has prefixes -2, -4, -6, -3, 0. The minimum sits at index 2, so the start is 3.",
      active: [3], values: { s: "gas", R: "start 3", farthest: "ok" } },
    { note: "Candies on ratings [1, 0, 2]: the left pass writes [1, 1, 2], the right pass writes [2, 1, 2], and the sum of the maxes is 5.",
      active: [0, 1, 2], values: { s: "candy", R: "\u2014", farthest: "5" } },
    { note: "Huffman on files 1, 2, 3, 4 merges 1+2=3, then 3+3=6, then 6+4=10. The paid cost is 3+6+10=19, not just the final 10.",
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
    "<strong>Classify the object first.</strong> Say whether you are looking at intervals, a jump array, a circular surplus, neighbour ratings, or a merge cost, because that sentence picks the key and everything else follows from it.",
    "<strong>Sort or heap with that matching key.</strong> Finish times, a min-heap of ends, a min-heap of file sizes: using the wrong structure here is how meeting-rooms becomes a quadratic nested loop.",
    "<strong>Run one pass that protects the invariant.</strong> Last finish, farthest reach, prefix surplus, left/right slopes, or the two lightest sizes: update only that number, and refuse a second key mid-scan.",
    "<strong>Handle the impossible cases explicitly.</strong> A gas total below zero, or a jump window whose farthest cannot grow, must return failure; skipping the check still produces a start index that looks plausible.",
    "<strong>Ask which upgrade the interviewer just added.</strong> Weights on intervals are DP; <code>k</code> rooms stay greedy with a heap of ends. Saying the upgrade out loud stops you from shipping the unweighted scan on the weighted problem.",
    "<strong>Reconstruct only if asked.</strong> Store the parent jump or the chosen indices during the same pass; a second walk that re-sorts by a different key will not match the proof you just used.",
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
      "<p>Jump Game II and gas each walk the array once and do a constant amount of work per index, so they are <code>n</code> additions and comparisons. Interval problems pay a sort of <code>n</code> pairs, which is <code>n log n</code> comparisons, then a linear scan. Huffman does <code>n</code> heap pops and pushes; each heap operation is <code>log n</code>, so the merge loop is another <code>n log n</code>.</p>",
      "<p>Putting real numbers in: at <code>n = 10<sup>5</sup></code> a linear pass is a hundred thousand steps and a sort is about <code>1.7 &times; 10<sup>6</sup></code> comparisons, both fine. A quadratic min-jumps DP on the same size is about <code>10<sup>10</sup></code> transitions if every index can jump far, which no judge accepts. That gap is why naming the key matters more than writing a recurrences first.</p>",
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
      bug: "Looping to <code>n-1</code> looks like a normal array walk, so when <code>i</code> lands on the last index you increment <code>s</code> one extra time and report a jump you never needed to take.",
      fix: "Loop only to <code>n-2</code>. Reaching the last index is the goal, not a place that spends a jump. Test on <code>[1, 1]</code>: the answer is 1, not 2." },
    { title: "Gas returning 0 when total is negative",
      bug: "The minimum prefix still exists on an impossible tour, so returning <code>minIndex + 1</code> looks like the usual unique-start rule and the sample with a non-negative total still passes.",
      fix: "Check that the total of <code>gas[i] - cost[i]</code> is non-negative first, and only then use the min-prefix start. A negative total must return <code>-1</code>." },
    { title: "Meeting rooms without a heap",
      bug: "Sorting by start and comparing each meeting only to the previous one looks linear and works on non-nested samples, but a third meeting can overlap the first while missing the second, so the room count is wrong or you fall back to a quadratic pair check.",
      fix: "Keep a min-heap of end times, or run a +1/-1 sweep on the endpoints. Both are <code>n log n</code> and count true overlap." },
    { title: "Candies one pass",
      bug: "A single left-to-right pass looks enough because each rating is compared to one neighbour, but a valley that decreases then increases needs the right slope too, and the bottom of the valley is then under-paid.",
      fix: "Left-to-right enforce the left neighbour, right-to-left enforce the right neighbour, then take the max at each index. The valley <code>[1, 0, 2]</code> is the test: the answer is 5, not 4." },
    { title: "Huffman adding the new file once",
      bug: "Paying only the final root looks right because that number is the total size, but every internal node is a merge that later ancestors pay again, so omitting <code>ans += a + b</code> undercounts the cost.",
      fix: "After each pop, do <code>ans += a + b</code> and push <code>a + b</code> back onto the heap. Files 1, 2, 3, 4 must total 19, not 10." },
  ],
  variants: [
    ["Meeting rooms II", "Sweep or min-heap of ends.", "LC 253", "k rooms"],
    ["Weighted intervals", "DP + binary search previous compatible.", "LC 1235", "kills greedy"],
    ["Jump Game I", "Only reachability: track farthest, no jump count.", "LC 55", "easier"],
  ],
  followups: [
    ["Why is Jump II not DP?",
      "<p>It can be DP: <code>dp[i]</code> is the fewest jumps that reach index <code>i</code>, and that is correct and quadratic. The greedy window is the same computation viewed as BFS layers on the array: every index inside the current <code>[L, R]</code> is reachable in exactly <code>s</code> jumps, so the first time a layer covers <code>n-1</code> is the shortest path. That layer argument is the exchange / stay-ahead that lets you drop the DP table.</p>"],
    ["Two starting points for gas?",
      "<p>If the total surplus is non-negative there is exactly one start, except for a stretch of zeros that all work equally well. The unique deepest prefix deficit pins that start: every other index has a strictly worse prefix behind it and the tank would go negative before you climbed out. Check the total first, then report the index after the minimum prefix.</p>"],
    ["Can Huffman run on more than two-way merges?",
      "<p>Yes: a <code>k</code>-way Huffman always merges the <code>k</code> lightest current sizes, pays their sum, and pushes the sum back. If <code>n-1</code> is not divisible by <code>k-1</code> you pad with zero-size dummy files so the last merge still has exactly <code>k</code> children. The exchange is the same as the binary case: a heavier tuple merged earlier only increases later ancestor costs.</p>"],
    ["Interval covering from a point?",
      "<p>Sort the intervals by start. While you still have an uncovered point <code>x</code>, take the interval that covers <code>x</code> and extends farthest to the right, then jump <code>x</code> to that new end. That is Jump Game II in disguise: the current point is the left of the window and \"extends farthest\" is <code>farthest</code>. If no interval covers <code>x</code>, the instance is impossible.</p>"],
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
  readTime: "28 min",
  tagline: "Sort the interesting x-coordinates, keep an active set of segments that currently intersect the sweepline, and answer geometry / interval problems in one pass.",
  tags: ["sweep", "intervals", "geometry", "P1"],
  prereqs: [
    ["Greedy Classics", "greedy-classics.html"],
    ["Heaps & Priority Queue", "../03-linear-structures/heaps-and-priority-queue.html"],
  ],
  why: [
    "You are given a pile of intervals or rectangles on the plane, and you must answer something about how they overlap: how many rooms you need, the area of the union, whether any two segments cross, or the closest pair of points. Checking every pair is perfectly correct and costs about <code>n<sup>2</sup> / 2</code> comparisons. At a hundred thousand segments that is five billion pair tests, and the judge will cut you off long before you finish. The technique on this page is to stop looking at pairs and instead walk a vertical line from left to right, looking only at the objects that currently touch the line.",
    "That vertical line is the <em>sweepline</em>. It does not crawl continuously: it jumps from event to event, where an event is a start, an end, or a crossing. Between two consecutive events the set of objects that intersect the line cannot change, so the answer you care about (coverage, union height, closest pair in the strip) is constant on that whole open interval. You therefore do work only at <code>O(n)</code> x-coordinates instead of at every real x. A 1D coverage problem needs only a counter; a 2D union of rectangles needs a tree on the y-axis that can add a range and report how much of y is currently covered.",
    "In a real problem statement the signal is geometry or intervals sitting next to <code>n &le; 10<sup>5</sup></code>, with a question about overlap, union, or \"right now as x moves\". Meeting rooms, skyline, rectangle area, and closest pair all compress to the same three sentences: list the events, sort them, maintain an active structure. If the question is a static range sum on an array you already have prefix sums and you do not need a line. If the question is offline \"count points in this rectangle\", a Fenwick on compressed y after sorting x is the same idea with a different active structure.",
  ],
  insight: "Nothing interesting happens between event x-coordinates, so you only work where the picture changes. Sort those events, update the set of objects that currently intersect the line, and query that set; the rest of the plane is combinatorially constant.",
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
  constraint: "<code>n &le; 10<sup>5</sup></code> is the 1D signature: a sort of <code>2n</code> endpoints plus a counter. Rectangle union with a lazy segment tree on compressed y is the same <code>n log n</code> budget. Closest pair is also <code>n log n</code>. If <code>n</code> is a few thousand and you only need any-overlap, a pairwise check still works, but the sweep is the intended algorithm at the usual limits.",
  core: [
    "A 1D sweep stores events as pairs <code>(x, +1)</code> at each left endpoint and <code>(x, -1)</code> at each right endpoint. Sort by <code>x</code>, and at equal <code>x</code> decide the type order from the problem: for closed intervals where a touch counts as overlap, process the +1 first so coverage never dips to zero in between. A running integer <code>cover</code> is the number of intervals that currently contain the line; the maximum value <code>cover</code> ever takes is the number of meeting rooms, and the stretches where <code>cover &gt; 0</code> are the union of the intervals.",
    "A 2D sweep of rectangles uses the same x-events, but each event now carries a y-interval <code>[y1, y2]</code> and a sign. The active structure is a segment tree (or a Fenwick of coverage) on the compressed y-coordinates: it can add +1 or -1 on a y-range and report the <em>measure</em>, the total length of y that currently has coverage at least one. When the sweepline jumps from <code>x</code> to the next event <code>x_next</code>, you add <code>(x_next - x) &times; covered_y</code> to the area. That product is why the originals, not the ranks, are the lengths you multiply.",
    "Walk two intervals <code>[1, 3]</code> and <code>[2, 4]</code>. The events in order are +1 at 1, +1 at 2, -1 at 3, -1 at 4. After the first +1, coverage is 1. After the second, coverage is 2, which is the maximum overlap. The two minuses walk it back down to 0. If a third interval started exactly where the first ended, the type order at that shared x is what decides whether the touch counts. A skyline is the same walk with a multiset of heights instead of a counter: the active maximum height is the skyline y until the next wall.",
  ],
  invariant: "<p>After processing every event at a given <code>x</code>, the active structure represents exactly the objects that intersect the vertical line at <code>x</code> (closed or half-open, matching the type order you chose). The next event is the next x-coordinate where that set is allowed to change.</p><p>In plain words, the line only knows about objects it is currently stabbing, and between events that set is frozen, so you may charge a whole strip to one query of the active structure.</p><p>Interview sentence: <em>\"I jump the line from event to event and query only the objects that currently touch it.\"</em></p>",
  extra: [
    {
      kind: "warn",
      title: "Equal-x order is part of the problem",
      html: "<p>A start and an end at the same <code>x</code> are not interchangeable. For closed intervals where a touch counts, process +1 before -1. For half-open intervals where a touch does not count, reverse it. Write the policy in a comment; do not leave it to <code>Arrays.sort</code> stability.</p>",
    },
  ],
  dryIntro: "Two overlapping intervals walked left to right. Each row is one event: the coverage after applying it, and the maximum overlap seen so far.",
  array: [1, 2, 2, 3],
  arrayLabel: "coverage after events =",
  indexLabels: ["+L0", "+L1", "-R0", "-R1"],
  vars: ["event", "cover", "maxC"],
  frames: [
    { note: "Intervals [1, 3] and [2, 4] produce four events: +1 at x=1, +1 at x=2, -1 at x=3, and -1 at x=4.",
      active: [0], values: { event: "+1", cover: 1, maxC: 1 } },
    { note: "The second plus lands at x=2, coverage becomes 2, and that is the maximum overlap these two intervals ever reach.",
      active: [1], values: { event: "+2", cover: 2, maxC: 2 } },
    { note: "A minus at x=3 removes the first interval, so coverage drops back to 1 while the second interval is still active.",
      active: [2], values: { event: "-3", cover: 1, maxC: 2 } },
    { note: "The last minus at x=4 removes the second interval, coverage returns to 0, and the sweep is finished.",
      active: [3], values: { event: "-4", cover: 0, maxC: 2 } },
    { note: "If a start and an end share an x, process the plus first when closed intervals should count a touch as overlap; reverse that when they should not.",
      active: [1, 2], values: { event: "tie", cover: "policy", maxC: 2 } },
    { note: "A skyline uses the same x-walk but stores building heights in a multiset, so the active maximum is the skyline y until the next wall.",
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
    "<strong>List every event as (x, type, payload).</strong> Starts, ends, and crossings are the only x-coordinates where the stabbed set can change, so missing one of them silently drops a strip from the answer.",
    "<strong>Sort by x, then by the type order the problem needs.</strong> Equal-x order is a semantic choice, not a convenience: closed versus half-open intervals disagree on whether a touch counts, and the comparator is where that decision lives.",
    "<strong>Initialise the active structure empty.</strong> A counter for 1D coverage, a TreeMap multiset for skyline heights, or a segment tree on compressed y for rectangle measure: pick the structure that can answer the query you will ask at every jump.",
    "<strong>At each new x, first charge the previous strip, then apply the event.</strong> Area and union length use <code>(x - prevX) &times; measure</code>; applying the event first would charge the new set to the old width and the last strip would go missing.",
    "<strong>Query the active set when the statement asks about \"right now\".</strong> Maximum coverage, current skyline height, or closest y-neighbour in the strip: that query is legal only after every event at this x has been applied.",
    "<strong>Compress y before allocating an array-based tree.</strong> Raw coordinates up to <code>10<sup>9</sup></code> cannot index a segment tree; collecting and ranking the y-endpoints gives a tree of size <code>O(n)</code> whose ranks still preserve order.",
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
      "<p>There are <code>2n</code> endpoints, or <code>O(n + k)</code> events if crossings are included, and sorting them is <code>n log n</code> comparisons. Each event then updates the active structure: a coverage counter is constant time, a balanced tree or segment tree is <code>log n</code> per update. Over <code>n</code> events that is another <code>n log n</code>, which is absorbed into the sort.</p>",
      "<p>Putting real numbers in: at <code>n = 10<sup>5</sup></code> you sort two hundred thousand events, about <code>3.6 &times; 10<sup>6</sup></code> comparisons, then do as many tree updates. Pairwise overlap on the same input is about <code>5 &times; 10<sup>9</sup></code> tests and will time out. Rectangle union is the same <code>n log n</code> once y is compressed; the segment tree adds a small constant but does not change the class.</p>",
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
      bug: "A segment ending at <code>x</code> and another starting at <code>x</code> look interchangeable in the sort, so processing the minus first drops coverage to 0 in between and a closed touch is missed (or the reverse, and an open touch is counted).",
      fix: "Decide closed versus half-open before you write the comparator. For maximum overlap of closed intervals, process +1 before -1, and test two intervals that only share an endpoint." },
    { title: "Using a HashSet of active y without duplicates",
      bug: "Two segments at the same y look like one key, so a TreeSet of raw y-values collapses them and the second removal deletes the first segment that is still alive.",
      fix: "Store a multiset (TreeMap of counts) or key the set by a unique segment id. Two identical y-coordinates must survive as two active objects." },
    { title: "Integer overflow on area",
      bug: "Width times covered height with coordinates up to <code>10<sup>9</sup></code> fits the mental picture of an <code>int</code> product, but <code>10<sup>9</sup> &times; 10<sup>9</sup></code> overflows 32 bits and the area wraps to a small wrong number.",
      fix: "Accumulate the area in a <code>long</code>, and cast at least one factor to <code>long</code> before multiplying. Test a single rectangle of width and height <code>10<sup>9</sup></code>." },
    { title: "Forgetting to add the last strip",
      bug: "Updating the tree at event <code>x</code> looks complete because the active set is now right, but the strip from the previous x to this one was never charged, so the last rectangle is silently dropped from the area.",
      fix: "On every x-change: add <code>(x - prevX) &times; measure</code>, then update <code>prevX</code>, then apply the event. The last event still has a previous strip behind it." },
    { title: "Y not compressed",
      bug: "Allocating a segment tree of size <code>10<sup>9</sup></code> looks like it matches the coordinate range, then the process runs out of memory before the first query.",
      fix: "Collect every y-endpoint, unique them, and map each to a rank in <code>0 .. 2n</code>. Ranks index the tree; original y-values still supply the lengths." },
  ],
  variants: [
    ["Union of rectangles area", "Lazy coverage count + length of positive coverage.", "CSES Rectangle Union", "2D sweep"],
    ["Closest pair", "Sort x; keep a TreeSet of points in [x-d, x] ordered by y.", "O(n log n)", "CLRS"],
    ["Bentley-Ottmann", "Segment intersections, events include crossings.", "O((n+k) log n)", "rare in interviews"],
  ],
  followups: [
    ["Sweep vs sort+greedy for meeting rooms?",
      "<p>They are the same 1D sweep written two ways. The +1/-1 counter version sorts every endpoint and the running maximum is the room count. The heap-of-ends version sorts meetings by start and pops every end that is already past, which is a sweep that only stores the currently open ends. Both are <code>n log n</code>; pick the one whose structure you already have typed.</p>"],
    ["How do you get union length of intervals?",
      "<p>Use the same +1/-1 events. Whenever coverage steps from 0 to 1 you start a run; whenever it returns to 0 you add the length of that run to the answer. Equivalently, on every x-change add <code>&Delta;x</code> whenever the current coverage is already positive. Closed versus open endpoints only change the type order, not this charging rule.</p>"],
    ["Why a segment tree for y?",
      "<p>A rectangle event asks you to add +1 on a whole y-interval at once and then to report the measure of y that currently has coverage at least one. A TreeSet can insert a single y but cannot paint a range. A lazy coverage segment tree (or a Fenwick of difference plus a length table) is the structure that supports both operations in <code>log n</code> after y is compressed.</p>"],
    ["Offline 2D points \"count in rectangle\"?",
      "<p>Sort the points and the query corners by x, then walk left to right inserting each point's y into a Fenwick of compressed y-ranks. A query \"how many points have x &le; X and y in [y1, y2]\" is then one prefix read at that X. It is a sweep whose active structure is a Fenwick rather than a coverage tree; the line still only moves to interesting x-coordinates.</p>"],
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
  readTime: "26 min",
  tagline: "Replace huge or sparse values by their ranks 0..k-1 so Fenwick trees, arrays, and DP tables fit in memory &mdash; the ranks preserve order.",
  tags: ["compression", "ranking", "offline", "P1"],
  prereqs: [
    ["Fenwick Tree", "../06-range-queries/fenwick-tree.html"],
    ["Sorting & Comparators", "../02-sorting-hashing-bits/sorting-and-comparators.html"],
  ],
  why: [
    "You are given <code>n</code> numbers that live anywhere in <code>1 .. 10<sup>9</sup></code>, and you must index a Fenwick tree, a segment tree, or a frequency array by those numbers. Allocating an array of size a billion is not an option: that is four billion bytes on a 32-bit cell, and the process is dead before the first update. There are only <code>n</code> numbers, so only <code>n</code> distinct ranks can ever appear. Coordinate compression is the map that sends each value to its rank in <code>0 .. k-1</code> while keeping every less-than and every equal intact.",
    "The obvious alternative is a <code>TreeMap</code> or a dynamic segment tree keyed by the raw values. Both work online and both pay heavier constants. Compression is the offline bargain: collect every integer that will ever be used as an index (array values, query bounds, rectangle y-endpoints), sort them, squeeze equal runs into one slot, then replace each original by a binary search into that unique list. A Fenwick of size <code>k</code> then runs in <code>n log k</code>, about two million operations at <code>n = 10<sup>5</sup></code>, instead of an allocation that cannot exist.",
    "In a real problem statement the signal is values or coordinates up to <code>10<sup>9</sup></code> sitting next to a structure that wants an array index: inversion count, 2D Fenwick, sweep-line y-axes, \"next larger value\" DP. If the values are already in <code>1 .. n</code> there is nothing to compress. If new keys arrive after you have built the tree, you cannot pre-assign ranks without leaving gaps, and you want a balanced tree instead. Forgetting to unique the sorted list is the classic wrong version: two equal values then receive different ranks from a raw sort index, and \"equal\" silently dies.",
  ],
  insight: "Order is all the later structure needs. Ranks <code>0 .. k-1</code> are a strictly increasing relabelling of the distinct keys, so every comparison that used to say <code>x &lt; y</code> still says <code>rank(x) &lt; rank(y)</code>, and equals stay equal.",
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
  constraint: "The number of distinct keys <code>k</code> is at most <code>n</code>, or about <code>3n</code> once query bounds and both rectangle y-endpoints are collected. That is the size of the Fenwick, not <code>10<sup>9</sup></code>. Java's <code>Arrays.binarySearch</code> on the unique array is the rank, and a missing key returns the insertion point you must treat as a lower bound.",
  core: [
    "Collect every integer that will be used as an index into one list: the array values, every query <code>L</code> and <code>R</code>, every rectangle <code>y1</code> and <code>y2</code>. Sort that list, then compact equal runs so each distinct key appears once; call the compact array <code>unique</code> and let <code>k</code> be its length. The <em>rank</em> of a collected value <code>x</code> is the unique index <code>i</code> with <code>unique[i] = x</code>, found by binary search. Rewrite the working array by replacing each <code>a[i]</code> with <code>rank(a[i])</code>, and size the Fenwick at <code>k</code> (or <code>k+2</code> if you prefer a 1-based tree with a dummy).",
    "Queries that ask about a value range <code>[L, R]</code>, not an index range, need two extra binary searches. <code>lower_bound(L)</code> is the first stored key that is at least <code>L</code>, and that is the first rank you want included. <code>upper_bound(R)</code> is the first stored key strictly greater than <code>R</code>, so the last included rank is one less. Off-by-one on those two calls is the usual wrong answer: including a key just below <code>L</code>, or dropping the key that equals <code>R</code>. Keys that never appeared in the array must still have been collected, or you must use the insertion point as the rank.",
    "Walk <code>a = [100, 3, 100, 50]</code>. The collected sorted list is <code>3, 50, 100, 100</code>; after unique it is <code>[3, 50, 100]</code> and <code>k = 3</code>. The ranks are 2, 0, 2, 1, so the compressed array is <code>[2, 0, 2, 1]</code>. A Fenwick of size 3 can now count frequencies or inversions: walking left to right, query how many already-seen ranks are larger than the current one. A later query \"how many values lie in <code>[40, 100]</code>\" becomes ranks <code>[1, 2]</code>, because 40 lower-bounds to 50 and 100 upper-bounds just past the last key.",
  ],
  invariant: "<p>For every pair of keys that appeared in the collected set, <code>rank(x) &lt; rank(y)</code> if and only if <code>x &lt; y</code>, and <code>rank(x) = rank(y)</code> if and only if <code>x = y</code>.</p><p>In plain words, the new labels are just a denser spelling of the same order: equals stay glued together, and a smaller original still receives a smaller rank. Lengths and differences still use the original numbers, because ranks throw the gaps away.</p><p>Interview sentence: <em>\"I collect, sort, unique, then binary-search; ranks preserve order, not distance.\"</em></p>",
  extra: [
    {
      kind: "pitfall",
      title: "Ranks are indices, not lengths",
      html: "<p>A rectangle of width <code>10<sup>9</sup></code> still has width <code>10<sup>9</sup></code> after compression. The rank difference between its two x-endpoints may be 1. Multiply original coordinates for area; use ranks only to index the tree.</p>",
    },
  ],
  dryIntro: "Four values collected, uniqued, and rewritten as ranks. Later rows show a Fenwick-sized inversion walk and a value-range query on the same unique array.",
  array: [100, 3, 100, 50],
  arrayLabel: "a =",
  vars: ["x", "unique", "rank"],
  frames: [
    { note: "The array [100, 3, 100, 50] is collected and sorted into 3, 50, 100, 100, still carrying the duplicate 100.",
      active: [0, 1, 2, 3], values: { x: "all", unique: "3,50,100,100", rank: "\u2014" } },
    { note: "Compacting equal runs leaves the unique list [3, 50, 100], so only three ranks will ever be issued.",
      active: [1], values: { x: "uniq", unique: "[3,50,100]", rank: "\u2014" } },
    { note: "3 becomes rank 0, 50 becomes rank 1, and both copies of 100 become rank 2, so the compressed array is [2, 0, 2, 1].",
      active: [0], values: { x: 100, unique: "[3,50,100]", rank: 2 } },
    { note: "A Fenwick of size 3 can now count frequencies. An inversion walk queries how many already-seen ranks are larger than the current one.",
      active: [1], values: { x: 3, unique: "bit n=3", rank: 0 } },
    { note: "The value-range query [40, 100] lower-bounds 40 to rank 1 (the key 50) and upper-bounds 100 just past rank 2, so it reads ranks 1 through 2.",
      active: [0, 2, 3], values: { x: "q", unique: "lb/ub", rank: "1..2" } },
    { note: "A length such as a[i+1] - a[i] still uses the original numbers; ranks only index the tree and must not be subtracted as distances.",
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
    "<strong>Collect every integer that will be used as an index.</strong> Array values, query bounds, and both y-endpoints of every rectangle belong on the list; a bound you forget cannot be ranked later without guessing an insertion point.",
    "<strong>Sort the list and compact equal runs.</strong> Unique is not optional: a raw sort index would give two copies of 100 two different ranks, and the later Fenwick would treat equals as ordered.",
    "<strong>Define rank(x) as the lower_bound in the unique array.</strong> For a key that was collected, binary search returns its exact slot; for a missing bound, the insertion point is the first rank that should be included.",
    "<strong>Rewrite the working data and size the tree at k.</strong> Replace each <code>a[i]</code> with its rank, allocate the Fenwick at <code>unique.length</code> (plus one if you are 1-based), and never allocate <code>10<sup>9</sup></code>.",
    "<strong>Translate a value-range [L, R] into ranks.</strong> The inclusive rank interval is <code>[lower_bound(L), upper_bound(R) - 1]</code>; off-by-one on either end includes a key you did not ask for or drops one you did.",
    "<strong>Keep the original numbers wherever a length is needed.</strong> Area, gap, and difference queries still subtract originals. Ranks throw those gaps away on purpose, which is why they fit in memory.",
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
      "<p>Collecting <code>n</code> (or a few times <code>n</code>) keys and sorting them is <code>n log n</code> comparisons. Compacting equals is a linear pass. Each later rank is one binary search on a list of length <code>k</code>, so rewriting the array is another <code>n log k</code>. The Fenwick or segment tree you build afterwards is <code>O(n log k)</code> updates and queries on a structure of size <code>k</code>.</p>",
      "<p>Putting real numbers in: at <code>n = 10<sup>5</sup></code> and <code>k</code> about the same, the sort is roughly <code>1.7 &times; 10<sup>6</sup></code> comparisons and the tree is a few million bit operations, which is fine. The thing compression avoids is an array of length <code>10<sup>9</sup></code>, which is four gigabytes on a 32-bit cell and will not allocate. A <code>TreeMap</code> Fenwick is the same <code>n log n</code> class with slower constants, useful only when keys arrive online.</p>",
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
      bug: "<code>Arrays.binarySearch</code> on a sorted array that still holds duplicates returns an arbitrary copy of the key, so two calls on the same value can receive two different ranks and \"equal\" silently becomes ordered.",
      fix: "Compact equal runs first, then search only on the unique array. Two copies of 100 must share one rank; that is the test." },
    { title: "Forgetting query bounds in the collected set",
      bug: "A query <code>L</code> that never appeared as an array value has no slot, so <code>binarySearch</code> returns <code>-insertion - 1</code>, and treating that negative number as a rank either crashes or reads the wrong prefix.",
      fix: "Push every query <code>L</code> and <code>R</code> into the collected list before you unique, or decode the insertion point as a lower bound and never use the raw negative return." },
    { title: "Compressing an axis you still measure",
      bug: "A rectangle whose x-span is a billion looks like width 1 after ranking, so area becomes the rank difference and the sample with tiny coordinates still passes.",
      fix: "Store original coordinates for every length and area product. Ranks index the tree and nothing else; subtract originals when you need a gap." },
    { title: "1-based Fenwick vs 0-based ranks",
      bug: "Rank 0 looks like a legal index into <code>bit[]</code>, but a Fenwick leaves <code>bit[0]</code> unused, so the smallest key is never updated, or <code>j -= j &amp; -j</code> walks off the array.",
      fix: "Use <code>rank + 1</code> as the Fenwick index, or allocate <code>k + 2</code> and ignore slot 0. Query a single minimum and check that it appears in the tree." },
    { title: "long vs int keys",
      bug: "Coordinates up to <code>10<sup>18</sup></code> fit the problem statement and look like they belong in an <code>int[]</code>, then they overflow on the way into the unique array and two distant keys collide.",
      fix: "Store the unique list in a <code>long[]</code> (or a <code>Long</code> list) whenever the statement's range exceeds <code>2<sup>31</sup></code>. Rank comparisons must use the same type." },
  ],
  variants: [
    ["With query bounds", "Push L and R into the list even if they are not array values.", "offline 2D count", "CF problems"],
    ["Dynamic", "Don't compress; use a Treap / dynamic segtree keyed by the raw value.", "online", "when keys appear later"],
    ["Pair compression", "(x,y) as one long: x<<32|y, then unique.", "when order is lexicographic on pairs", "rare"],
  ],
  followups: [
    ["lower_bound vs rank of an absent L?",
      "<p><code>lower_bound(L)</code> is the first stored key that is at least <code>L</code>. That is exactly the first rank that should be included in \"values &ge; L\", even when <code>L</code> itself never appeared. <code>upper_bound(R)</code> is the first stored key strictly greater than <code>R</code>, so the last included rank is one less. If you collected <code>L</code> up front, both calls are ordinary binary searches on the unique array.</p>"],
    ["Why not HashMap to dense ids?",
      "<p>A HashMap can pack values into <code>0 .. n-1</code>, but it assigns ids in insertion order, not value order. A Fenwick prefix then means \"the keys I happened to see first\", not \"every smaller value\". Compression exists specifically so that a smaller original still receives a smaller rank; hashing throws that property away.</p>"],
    ["Can you compress online?",
      "<p>If every key is known before the first update, yes: that is the offline collect-sort-unique pipeline on this page. If a brand-new key can arrive later, you cannot pre-assign a dense rank without leaving gaps or rebuilding. Use a balanced tree, a treap, or a dynamic segment tree keyed by the raw value.</p>"],
    ["2D compression?",
      "<p>Compress the x-coordinates and the y-coordinates independently, each with its own unique list. A 2D Fenwick is then <code>k<sub>x</sub></code> by <code>k<sub>y</sub></code>. If that product is too large for memory, sweep one axis (sort by x) and Fenwick only the other (compressed y), which is the offline rectangle-count sweep from the previous page.</p>"],
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
  readTime: "28 min",
  tagline: "On a unimodal function, two probes shrink the interval by a constant factor &mdash; ternary search, or a golden-section / integer-trinary loop.",
  tags: ["ternary search", "unimodal", "convex", "P2"],
  prereqs: [
    ["Binary Search on Answer", "../01-arrays-and-windows/binary-search-on-answer.html"],
    ["Greedy Foundations", "greedy-foundations.html"],
  ],
  why: [
    "You are given a function that goes down and then up &mdash; the sum of distances from a point on a line, a convex construction cost, a unimodal bitwise score &mdash; and you must find the input that makes it smallest. Binary search will not help, because binary search needs a yes/no predicate that flips once, and here the answers are numbers that first improve and then get worse. Evaluating the function at every integer in a range of size <code>10<sup>9</sup></code> is a billion calls; if each call is a linear scan you are looking at <code>10<sup>14</sup></code> steps. Ternary search finds the trough with a logarithmic number of probes.",
    "The idea is geometric. If <code>f</code> decreases and then increases, the minimum cannot sit in the third that currently looks worse, so you throw that third away and repeat. <em>Convexity</em> &mdash; the second differences of <code>f</code> are non-negative, or the derivative changes sign only once &mdash; is a sufficient reason for that shape, which is called <em>unimodal</em>. Convex DP (divide-and-conquer optimisation, Knuth, Li Chao, convex hull trick) is the data-structure upgrade of the same picture: the optimal choice as a function of <code>i</code> is itself unimodal, so you search it or hull it instead of trying every transition.",
    "In a real problem statement the signal is a numeric parameter you get to choose, sitting next to a cost that is obviously \"closer is cheaper, then farther is more expensive\", and a range too large to scan. On integers, a loop that keeps <code>[lo, hi]</code> and compares <code>f(m1)</code> against <code>f(m2)</code> is safer than floating ternary: stop when the interval is a few units wide and brute the remainder, because a flat bottom can pin the wrong side if you run until <code>lo == hi</code>. On doubles, eighty to a hundred iterations beat an <code>eps</code> of <code>10<sup>-9</sup></code> on a range of <code>10<sup>9</sup></code>.",
  ],
  insight: "If <code>f</code> decreases then increases, the minimum cannot lie in the third that currently looks worse, so you throw that third away. Convexity of <code>f</code> is a sufficient condition for that shape; a W-shaped function will send the search into the wrong valley.",
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
  constraint: "Each evaluation is whatever <code>f</code> costs; the search does <code>O(log X)</code> of them. If <code>f</code> is a linear scan then the total is <code>O(n log X)</code>, which at <code>n = 10<sup>5</sup></code> and <code>X = 10<sup>9</sup></code> is a few tens of millions of steps. On doubles prefer 80&ndash;100 fixed iterations over a tiny <code>eps</code>. On integers, loop while <code>hi - lo &gt; 3</code> and scan the seed.",
  core: [
    "On integers keep two bounds <code>lo</code> and <code>hi</code> that are guaranteed to contain the minimiser. While <code>hi - lo</code> is larger than 3, place <code>m1 = lo + (hi - lo) / 3</code> and <code>m2 = hi - (hi - lo) / 3</code>. Evaluate <code>f</code> at both. If <code>f(m1)</code> is strictly smaller than <code>f(m2)</code>, the minimum cannot sit to the right of <code>m2</code> (a unimodal <code>f</code> would already be climbing), so set <code>hi = m2</code>; otherwise set <code>lo = m1</code>. When the interval is a handful of integers, scan it and return the argmin. The finishing scan is what makes a flat bottom safe.",
    "On reals the same third-and-third split works, or you can use golden-section search, which reuses one probe per step so each iteration costs one new evaluation instead of two. Prove unimodality before you trust either loop. Discrete convexity is the check that second differences are non-negative: <code>f(i) - 2 f(i+1) + f(i+2) &ge; 0</code> for every <code>i</code>. On a differentiable <code>f</code>, the first derivative should change sign only once. If you can cheaply compare <code>f(m)</code> with <code>f(m+1)</code> on integers, binary search for the first rise is fewer probes than ternary.",
    "Walk <code>f = [9, 7, 4, 2, 3, 8]</code>, whose minimum is 2 at index 3. Start with <code>lo = 0</code>, <code>hi = 5</code>. The first thirds land at 1 and 4; <code>f(1) = 7</code> is worse than <code>f(4) = 3</code>, so the minimum is not left of 1 and <code>lo</code> becomes 1. The next pair is 2 and 4; 4 beats 3, so <code>lo</code> becomes 2. Then 3 and 4: <code>f(3) = 2</code> beats 3, so <code>hi</code> becomes 4. The remainder <code>2 .. 4</code> scans to index 3. A W-shaped array would have let one of those discards throw the true minimum away, which is why the shape has to be proved, not hoped.",
  ],
  invariant: "<p>If <code>f</code> is unimodal on <code>[lo, hi]</code>, the minimiser (or maximiser) still lies in the interval after the worse third is discarded. When <code>hi - lo</code> is a constant, a linear scan of the remainder is exact even if the bottom is flat.</p><p>In plain words, you are allowed to throw away the side that is already climbing, and you must stop and look at the last few points instead of trusting one last comparison on a plateau.</p><p>Interview sentence: <em>\"I discard the worse third of a unimodal f, then brute the last few integers.\"</em></p>",
  extra: [
    {
      kind: "warn",
      title: "A W-shaped f is not unimodal",
      html: "<p>Two valleys make ternary converge to whichever local minimum the first discard happened to keep. Plot <code>f</code> on a tiny test, or prove second differences, before you ship the loop. Binary search on a monotone predicate is the wrong cousin, not a fallback.</p>",
    },
  ],
  dryIntro: "A six-point unimodal array whose minimum sits at index 3. Each row is one third-and-third comparison, then a finishing scan of the leftover integers.",
  array: [9, 7, 4, 2, 3, 8],
  arrayLabel: "f(i) =",
  vars: ["lo,hi", "m1,m2", "f"],
  frames: [
    { note: "The array [9, 7, 4, 2, 3, 8] is unimodal with its minimum 2 at index 3. The search starts with lo = 0 and hi = 5.",
      active: [0, 5], values: { "lo,hi": "0,5", "m1,m2": "\u2014", f: "start" } },
    { note: "The first thirds land at 1 and 4. f(1) = 7 is worse than f(4) = 3, so the minimum cannot sit left of 1 and lo becomes 1.",
      active: [1, 4], values: { "lo,hi": "1,5", "m1,m2": "1,4", f: "7 vs 3" } },
    { note: "The next pair is 2 and 4. f(2) = 4 is still worse than f(4) = 3, so lo advances again, this time to 2.",
      active: [2, 4], values: { "lo,hi": "2,5", "m1,m2": "2,4", f: "4 vs 3" } },
    { note: "Now m1 = 3 and m2 = 4. f(3) = 2 beats f(4) = 3, so the minimum cannot sit right of 4 and hi becomes 4.",
      active: [3, 4], values: { "lo,hi": "2,4", "m1,m2": "3,4", f: "2 vs 3" } },
    { note: "The leftover integers 2 through 4 are scanned in a line, and the true minimum 2 is found at index 3.",
      active: [3], values: { "lo,hi": "2,4", "m1,m2": "scan", f: 2 } },
    { note: "A W-shaped function would have let one of those discarded thirds carry the true minimum away, which is why unimodality has to be proved first.",
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
    "<strong>Prove the function is unimodal before you search.</strong> Second differences non-negative, a derivative that changes sign once, or a one-sentence convexity argument: without that, a discarded third can contain the true answer.",
    "<strong>Choose the domain you will shrink.</strong> Array indices, a real coordinate, or a discrete parameter such as a bit-width: the loop is the same, but the stopping rule is not (scan a few integers, or run a fixed number of real iterations).",
    "<strong>Place m1 and m2 at one-third and two-thirds, or use golden section.</strong> The safe integer spelling is <code>lo + (hi - lo) / 3</code>, which cannot overflow; <code>(2 * lo + hi) / 3</code> can.",
    "<strong>Discard the third whose probe is worse.</strong> If <code>f(m1)</code> is smaller then the minimum is not right of <code>m2</code>; otherwise it is not left of <code>m1</code>. A plateau should not be trusted to this comparison alone.",
    "<strong>Stop while the interval is still a handful of integers, or after 80 real iterations.</strong> Running until <code>lo == hi</code> on a flat bottom can pin the wrong index; a tiny <code>eps</code> on a huge real range under-iterates.",
    "<strong>Scan the leftover integers and return the argmin.</strong> That finishing pass is exact, cheap, and the reason integer ternary is safer than floating ternary copied onto an array.",
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
      "<p>Each step replaces an interval of length <code>L</code> by an interval of length at most <code>(2/3) L</code>, because one of the two outer thirds is thrown away. The number of steps until <code>L</code> drops from <code>n</code> to a constant is <code>O(log n)</code> in base <code>3/2</code>, which is a few dozen iterations even at <code>n = 10<sup>9</sup></code>. Two evaluations per step (or one, with golden section) multiply that count by a small constant. The finishing scan of a handful of integers is absorbed.</p>",
      "<p>Putting real numbers in: an integer range of size <code>10<sup>9</sup></code> dies in about 60 third-and-third steps, 120 evaluations. If each <code>f</code> is a linear scan of <code>n = 10<sup>5</sup></code> items, the total is about <code>1.2 &times; 10<sup>7</sup></code> operations, which is comfortable. A full scan of the domain would be a billion evaluations. On doubles, 80 to 100 fixed iterations shrink a range of <code>10<sup>9</sup></code> well past <code>10<sup>-9</sup></code>; forty iterations are not enough and are the usual wrong <code>eps</code> loop.</p>",
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
      bug: "When <code>f(m1) == f(m2)</code> on a flat bottom, either third looks discardable, so dropping one of them can throw away the only index you needed if you then run the loop until the bounds meet.",
      fix: "Stop while several integers remain and scan them. Treating equality as \"shrink both sides a little\" also works; the finishing scan is the simpler test." },
    { title: "Not unimodal",
      bug: "A W-shaped cost has two valleys, and the first comparison happily discards the third that held the global minimum, so the loop converges to a local min and the sample with one valley still passes.",
      fix: "Prove convexity, or plot <code>f</code> on a tiny constructed W. Ternary is the wrong algorithm the moment there are two turns." },
    { title: "Floating ternary with too few iters",
      bug: "An <code>eps</code> of <code>10<sup>-9</sup></code> on <code>[0, 10<sup>9</sup>]</code> looks like the usual real-search stopping rule, but shrinking by <code>2/3</code> each time needs about 90 iterations, and forty leaves an error of metres.",
      fix: "Run 80 to 100 fixed iterations and ignore <code>eps</code>. The midpoint of the final interval is the answer you print." },
    { title: "Integer overflow in m1/m2",
      bug: "<code>(2 * lo + hi) / 3</code> looks like a tidy one-third formula, then <code>2 * lo</code> overflows a 32-bit <code>int</code> when the domain is a billion and the midpoints jump into garbage.",
      fix: "Write <code>m1 = lo + (hi - lo) / 3</code> and <code>m2 = hi - (hi - lo) / 3</code>. Those two lines are overflow-safe for non-negative bounds." },
    { title: "Ternary when binary on f(m) vs f(m+1) works",
      bug: "Two probes per step look necessary because the page is about ternary, but on a discrete bitonic array you can test the slope with one neighbour compare, so you spend twice the evaluations and invite plateau bugs.",
      fix: "On integers with a cheap neighbour test, binary-search the first index where <code>f[i] &le; f[i+1]</code>. Keep ternary for a heavy <code>f</code> you can only evaluate, not differentiate." },
  ],
  variants: [
    ["Bitonic peak", "Binary: if a[m]&lt;a[m+1] peak is right.", "LC 852", "one probe"],
    ["Ternary on reals", "Geometry: minimise max distance to points on a line.", "CF 1354C2? classic", "80 iters"],
    ["Convex DP", "opt is monotone; D&amp;C optimisation or CHT.", "dp-optimizations.html", "next module"],
  ],
  followups: [
    ["Why not always binary on f(m) vs f(m+1)?",
      "<p>On the reals there is no next integer <code>m+1</code> to compare against, so a slope test is not even defined. On integers, if a neighbour evaluation is cheap, binary search for the first rise is fewer probes and avoids plateau bugs. Ternary still earns its keep when <code>f</code> is a heavy simulation you can only evaluate at chosen points, not at <code>m</code> and <code>m+1</code> for free on every candidate.</p>"],
    ["Is every convex function unimodal?",
      "<p>A strictly convex <code>f</code> has a unique minimum, so it is unimodal and ternary is safe. A weakly convex <code>f</code> can have a flat bottom: every point on the plateau is optimal, but a third-and-third compare that sees two equal values can discard the plateau if you do not scan the remainder. That is why integer ternary stops early and brutes the seed.</p>"],
    ["Golden section vs 1/3-2/3?",
      "<p>Golden-section search places the probes at the golden-ratio offsets so one of them can be reused after the discard; each iteration then costs one new evaluation. Third-and-third is simpler to type and spends two evaluations per step, still logarithmic. In contests type the 1/3 loop; golden is a constant-factor win on a very expensive <code>f</code>.</p>"],
    ["Connection to ternary search on trees?",
      "<p>Unrelated name. A 3-ary search tree branches on three children; \"ternary search on the answer\" shrinks a numeric interval by discarding a third. The phrase on this page always means the interval shrink. If a problem asks you to walk a ternary trie or a 3-child tree, that is a different algorithm and this loop will not help.</p>"],
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
  readTime: "30 min",
  tagline: "Reorder offline range queries into sqrt-blocks so adding/removing one endpoint is amortised <code>O(n sqrt n)</code> instead of <code>O(nq)</code>.",
  tags: ["Mo", "offline", "sqrt", "P2"],
  prereqs: [
    ["Coordinate Compression", "coordinate-compression.html"],
    ["Two Pointers", "../01-arrays-and-windows/two-pointers.html"],
  ],
  why: [
    "You are given an array of length <code>n</code> and <code>q</code> range questions such as \"how many distinct values sit in <code>[L, R]</code>\", \"what is the mode\", or \"what is the mex\". Prefix sums cannot help, because those answers do not have an inverse: knowing the distinct count of <code>[0, R]</code> and of <code>[0, L-1]</code> tells you nothing about <code>[L, R]</code>. Rebuilding a frequency map from scratch for every query costs about <code>n q</code> additions. At <code>n = q = 10<sup>5</sup></code> that is ten billion steps, and the judge will cut you off. Mo's algorithm is the offline reorder that makes two pointers crawl the array so cheaply that the same add/remove work finishes in tens of millions of steps instead.",
    "You are allowed to answer the queries in any order, so you sort them before you walk. The sort key is the block of the left endpoint, <code>L / B</code>, and inside a block the right endpoint <code>R</code>. That one decision is what bounds the pointer movement, and the arithmetic is why. The left pointer, inside a single block, lives in a window of only <code>B</code> indices, so it moves at most <code>B</code> steps per query and <code>q B</code> steps in total; when the block changes it may jump across the whole array, at most <code>n</code> steps per block, and there are <code>n / B</code> blocks, which is another <code>n<sup>2</sup> / B</code>. The right pointer is sorted inside each block, so it travels across the array at most once per block (or twice if you reset), which is again <code>(n / B) &times; n = n<sup>2</sup> / B</code>. Adding those up gives <code>q B + n<sup>2</sup> / B</code> endpoint moves. Setting <code>B &approx; &radic;n</code> (or <code>n / &radic;q</code> when <code>q</code> differs from <code>n</code>) balances the two terms at about <code>n &radic;n</code>.",
    "In a real problem statement the signal is offline <code>[L, R]</code> queries sitting next to <code>n, q &le; 10<sup>5</sup></code> and an answer that is not a prefix difference: distinct, mode, mex, sum of <code>freq<sup>2</sup> &times; value</code>. If you can add or remove one index in constant time (or a log, still often fine), the bound above is the intended budget &mdash; about <code>3 &times; 10<sup>7</sup></code> to <code>2 &times; 10<sup>8</sup></code> add/remove calls in Java if the inner function stays an array bump, not a HashMap. Hilbert order cuts the constant further and is optional; the block sort is the interview version. Queries that arrive online cannot be reordered, and then you need a real data structure instead.",
  ],
  insight: "You pay for moving <code>L</code> and <code>R</code>, not for answering. Sorting by the block of <code>L</code> and then by <code>R</code> is what caps those moves at <code>q B + n<sup>2</sup> / B</code>, which becomes about <code>n &radic;n</code> once the block size is <code>&radic;n</code>.",
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
  constraint: "<code>n, q &le; 10<sup>5</sup></code> with an add/remove that is <code>O(1)</code> is the signature: about <code>n &radic;n &approx; 3 &times; 10<sup>7</sup></code> endpoint moves, up to a couple of hundred million if the constant is sloppy. Java will accept that only if <code>add</code> is an array bump, not a HashMap. Online queries, or <code>n = 10<sup>6</sup></code> with the same bound, push you off this page.",
  core: [
    "Keep a live window <code>[curL, curR]</code> and a frequency structure that matches exactly those indices. Start empty, conventionally <code>curL = 0</code> and <code>curR = -1</code>, so nothing is in the window and you never double-add index 0. For each query <code>(L, R, id)</code> in the sorted order, expand or shrink with four loops: while <code>curL &gt; L</code> add <code>--curL</code>; while <code>curR &lt; R</code> add <code>++curR</code>; while <code>curL &lt; L</code> remove <code>curL++</code>; while <code>curR &gt; R</code> remove <code>curR--</code>. Expand before you shrink so the window is never invalid. Then write <code>ans[id]</code>. The functions <code>add(i)</code> and <code>rem(i)</code> must be exact inverses: for distinct count, <code>add</code> does <code>freq[a[i]]++</code> and increments <code>distinct</code> when the count leaves 0, and <code>rem</code> decrements first and drops <code>distinct</code> when the count returns to 0.",
    "The sort is what makes those four loops cheap, and this is the arithmetic. Pick a block size <code>B</code>, usually <code>&lfloor;&radic;n&rfloor;</code>. Give every query the key <code>(L / B, R)</code>, and for a small extra constant sort <code>R</code> descending in odd-numbered blocks so the right pointer does not reset from <code>n</code> back to 0 at every block boundary. Inside one block the left endpoints all lie in an interval of length <code>B</code>, so <code>curL</code> moves at most <code>B</code> steps per query: that is <code>q B</code> left-moves. At a block change <code>curL</code> may jump up to <code>n</code> indices, and there are <code>n / B</code> blocks, which is <code>n<sup>2</sup> / B</code> more left-moves. Because <code>R</code> is monotonic inside a block, <code>curR</code> travels the array at most once per block: another <code>(n / B) &times; n = n<sup>2</sup> / B</code> right-moves. The total is <code>q B + 2 n<sup>2</sup> / B</code> add/remove calls. Substitute <code>B = &radic;n</code> and both pieces become <code>n &radic;n</code> when <code>q &approx; n</code>.",
    "Walk <code>a = [1, 2, 1, 3, 2]</code> with queries <code>[0, 2]</code>, <code>[1, 4]</code>, <code>[0, 4]</code> and <code>B = 2</code>. Block-sorted order is <code>[0, 2]</code>, then <code>[0, 4]</code>, then <code>[1, 4]</code>, because the first two share block 0 and are ordered by <code>R</code>. Start empty. Expanding to <code>[0, 2]</code> adds 1, 2, 1 and <code>distinct</code> becomes 2. Expanding <code>R</code> to 4 adds 3 and 2, <code>distinct</code> becomes 3, and that answers <code>[0, 4]</code>. Moving <code>L</code> from 0 to 1 removes a single 1, the frequency of 1 drops from 2 to 1, and <code>distinct</code> stays 3, which answers <code>[1, 4]</code>. The pointers crawled a handful of steps instead of rebuilding three frequency maps from scratch.",
  ],
  invariant: "<p>After each query is processed, <code>[curL, curR]</code> equals that query's range and the frequency structure matches it exactly. With block size <code>B = &radic;n</code>, the total number of endpoint moves is <code>O((n + q) &radic;n)</code>, because left-moves cost <code>q B + n<sup>2</sup> / B</code> and right-moves cost <code>n<sup>2</sup> / B</code>.</p><p>In plain words, you never rebuild the window: you slide it from the previous query to the next, and the block-then-<code>R</code> order is what stops those slides from adding up to <code>n q</code>.</p><p>Interview sentence: <em>\"I sort by L-block then R so the two pointers move O(n sqrt n) times, not O(n q).\"</em></p>",
  extra: [
    {
      kind: "math",
      title: "Why the block sort bounds the pointers",
      html: "<p>Left: <code>q B</code> inside blocks plus <code>n &times; (n / B)</code> at block changes. Right: <code>n</code> of travel per block times <code>n / B</code> blocks. Total <code>q B + n<sup>2</sup> / B</code>. Set <code>B = &radic;n</code> (or <code>n / &radic;q</code>) to balance the two terms. Odd-even <code>R</code> does not change the big-O; it roughly halves the right-pointer resets.</p>",
    },
    {
      kind: "warn",
      title: "add and rem are inverses",
      html: "<p>If <code>rem</code> is not the exact undo of <code>add</code>, <code>distinct</code> drifts and every later answer is wrong. Start from the empty window <code>[0, -1]</code> and only mutate inside the four while-loops, so you cannot double-add index 0 by accident.</p>",
    },
  ],
  dryIntro: "Three distinct-count queries on a five-element array, answered in block order. Each row is one pointer move and the frequency picture after that move.",
  array: [1, 2, 1, 3, 2],
  arrayLabel: "a =",
  vars: ["L,R", "cur", "distinct"],
  frames: [
    { note: "Array [1, 2, 1, 3, 2] and queries [0, 2], [1, 4], [0, 4], with block size 2. The live window starts empty at [0, -1].",
      active: [0, 1, 2], values: { "L,R": "init", cur: "[0,-1]", distinct: 0 } },
    { note: "Block sort puts [0, 2] first, then [0, 4], then [1, 4], because the first two share block 0 and are ordered by the right endpoint.",
      active: [0], values: { "L,R": "order", cur: "\u2014", distinct: "\u2014" } },
    { note: "Expanding to [0, 2] adds the values 1, 2, 1. Two distinct numbers are now in the window, which answers the first query.",
      active: [0, 1, 2], values: { "L,R": "0,2", cur: "[0,2]", distinct: 2 } },
    { note: "The next query only needs R to grow to 4, so we add 3 and then 2. Distinct becomes 3 and that answers [0, 4].",
      active: [0, 1, 2, 3, 4], values: { "L,R": "0,4", cur: "[0,4]", distinct: 3 } },
    { note: "Moving L from 0 to 1 removes a[0] = 1. Its frequency drops from 2 to 1, distinct stays 3, and that answers [1, 4].",
      active: [1, 2, 3, 4], values: { "L,R": "1,4", cur: "[1,4]", distinct: 3 } },
    { note: "The two pointers crawled a handful of indices instead of rebuilding three frequency maps, which is the block order paying off.",
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
    "<strong>Compress values so freq[] is a plain array.</strong> Keys up to <code>10<sup>9</sup></code> cannot index a frequency table; ranks in <code>1 .. n</code> make <code>add</code> a single increment, which is the only reason <code>n &radic;n</code> fits the time limit.",
    "<strong>Pack each query as (L, R, id) and sort by (L / B, R).</strong> The block of the left endpoint is the primary key because that is what caps left-pointer travel; odd blocks should sort <code>R</code> descending so the right pointer does not reset at every boundary.",
    "<strong>Write add(i) as the exact increment.</strong> For distinct count: bump <code>freq[a[i]]</code> and increment <code>distinct</code> only when the count leaves zero. Any other answer (mode, mex, freq-squared) plugs in here and nowhere else.",
    "<strong>Write rem(i) as the exact undo of add.</strong> Decrement first, then drop <code>distinct</code> when the count returns to zero. A rem that is not the inverse makes every later answer drift, and the bug is invisible on the first query.",
    "<strong>Move with the four while-loops, expand before shrink.</strong> Starting from the empty window <code>[0, -1]</code>, only these loops mutate the structure, so you cannot double-add index 0 or remove an index that was never in.",
    "<strong>Store ans[id] and print in the original order.</strong> The sort permutes the queries; the <code>id</code> field is what puts the answers back. Forgetting it prints a correct bag of numbers in the wrong rows.",
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
      "<p>Fix a block size <code>B</code>. Left-pointer travel splits in two. Inside one block every <code>L</code> lies in an interval of length <code>B</code>, so each of the <code>q</code> queries moves <code>curL</code> by at most <code>B</code>, which is <code>q B</code> steps. At a block change <code>curL</code> may jump up to <code>n</code> indices, and there are <code>n / B</code> blocks, which is <code>n<sup>2</sup> / B</code> more steps. Right-pointer travel is simpler: because queries inside a block are sorted by <code>R</code>, <code>curR</code> is monotonic and crosses the array at most once per block, another <code>(n / B) &times; n = n<sup>2</sup> / B</code>. The grand total is</p>",
      "<span class=\"eq\">T = O(q B + n<sup>2</sup> / B)</span>",
      "<p>Set <code>B = &radic;n</code> when <code>q &approx; n</code>, or <code>B = n / &radic;q</code> when they differ, and both terms become <code>O((n + q) &radic;n)</code>. Putting real numbers in: at <code>n = q = 10<sup>5</sup></code> we have <code>&radic;n &approx; 316</code>, so about <code>3 &times; 10<sup>7</sup></code> add/remove calls, a few hundred milliseconds in Java if each call is an array bump. Rebuild-per-query on the same input is <code>n q = 10<sup>10</sup></code> steps. Skip the block key and sort only by <code>R</code>, and the left pointer jumps randomly for an <code>O(n q)</code> again.</p>",
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
      bug: "A rem that decrements after checking <code>freq == 1</code>, or that is called twice on the same index, looks locally symmetric and then <code>freq</code> goes negative, so <code>distinct</code> drifts and every later query is silently wrong.",
      fix: "Make <code>rem</code> the exact undo of <code>add</code>, and assert <code>freq[x] &ge; 0</code> after every removal. The first query can still pass while the third is already garbage." },
    { title: "HashMap frequencies at 1e5",
      bug: "A HashMap looks like the natural way to count values up to <code>10<sup>9</sup></code>, but each add then costs a hash plus possible resize, and <code>n &radic;n</code> of those is several hundred million map operations that miss the time limit.",
      fix: "Compress values to <code>1 .. n</code> and use an <code>int[] freq</code>. The inner function must stay a couple of array writes; that is the whole point of the bound." },
    { title: "Starting from [0,0] without adding 0",
      bug: "Initialising <code>curL = curR = 0</code> looks like \"the window starts at the first index\", so you either forget to add <code>a[0]</code> or you add it once at init and again in the first expand, and the first answer is off by one value.",
      fix: "Start from the empty window <code>[0, -1]</code> and only add or remove inside the four while-loops. Index 0 enters exactly when a query needs it." },
    { title: "Sorting by R only",
      bug: "Sorting queries by the right endpoint alone looks like it should keep <code>curR</code> monotonic, which it does, but then <code>curL</code> jumps anywhere in the array on every query and the left-pointer term becomes <code>O(n q)</code> again.",
      fix: "The primary key must be the block of <code>L</code>. The right endpoint is only the secondary key, and that is the split the <code>q B + n<sup>2</sup> / B</code> bound depends on." },
    { title: "Inclusive/exclusive mix",
      bug: "Queries arrive as inclusive <code>[l, r]</code> and the expand loops look like they should stop at <code>r + 1</code>, so you remove <code>r</code> when you meant to keep it, or you add one past the end and read garbage.",
      fix: "Pick inclusive endpoints and the four loops on this page, and do not mix in an exclusive <code>r</code> from a Fenwick habit. A one-element query <code>[i, i]</code> is the test." },
  ],
  variants: [
    ["Odd-even R", "Inside odd blocks sort R descending. Fewer R resets.", "Hilbert-lite", "always do this"],
    ["Mo on trees", "Euler tour; a node with both copies in range is not on the path.", "toggle add/rem", "CF 375D"],
    ["With updates", "Block size n^{2/3}; time coordinate; apply/rollback updates.", "3D Mo", "when needed"],
  ],
  followups: [
    ["Why sqrt?",
      "<p>The total movement is <code>q B + n<sup>2</sup> / B</code>. The first term grows with <code>B</code> (left pointer wanders more inside a fat block); the second term shrinks with <code>B</code> (fewer blocks, so fewer full-array travels of <code>R</code> and fewer left-pointer resets). Those two pieces balance when <code>B</code> is about <code>&radic;n</code>, or more tightly <code>n / &radic;q</code> when <code>q</code> is far from <code>n</code>. Either choice is <code>O((n + q) &radic;n)</code>; the second is a constant-factor win on unbalanced inputs.</p>"],
    ["Can Mo be online?",
      "<p>No. The bound depends on sorting every query before the pointers move, so you must hold the whole batch. If queries arrive one at a time and must be answered immediately, you cannot reorder them and this page does not apply. Reach for a Fenwick, a segment tree, or a wavelet tree that supports the same question online.</p>"],
    ["Distinct with updates, online?",
      "<p>Still not Mo, even the 3D variant, because online forbids reordering. A segment tree of Fenwicks, a wavelet tree, or a sqrt-rebuild of the array are the usual answers, and they are heavier code. Mo-with-updates (time as a third coordinate, blocks of size <code>n<sup>2/3</sup></code>) is only for an offline mix of updates and queries.</p>"],
    ["Hilbert order?",
      "<p>A Hilbert curve maps each pair <code>(L, R)</code> to a position on a space-filling curve so queries that are close in the 2D square are close in the 1D sort order. The pointer travel then has a smaller constant than block sort, at the cost of longer code and a 64-bit interleave. Learn the block sort first; add Hilbert only after the add/remove is already tiny and you are still near the time limit.</p>"],
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
  readTime: "28 min",
  tagline: "Randomised algorithms in contests: hashing bases, Miller-Rabin, treaps, random shuffle + greedy, and Monte-Carlo fingerprints &mdash; plus how to bound the failure probability.",
  tags: ["random", "hashing", "treap", "P2"],
  prereqs: [
    ["Rolling Hash", "../12-strings-advanced/rolling-hash.html"],
    ["Modular Arithmetic", "../11-math-and-number-theory/modular-arithmetic.html"],
  ],
  why: [
    "You are given two strings, or two sets, or a 64-bit integer that might be prime, and a deterministic structure that answers the question is a page of code you do not want to write under a clock. A random fingerprint &mdash; a 64-bit hash, a random witness, a random heap priority &mdash; turns the same question into a handful of multiplications. Rolling hashes, Zobrist hashes of sets, Miller-Rabin primality, and treaps are the usual forms. The cost of that brevity is a failure probability you must be willing to bound out loud, because a fixed base on Codeforces will be hunted by an anti-hash test and a wrong primality test will declare a composite prime.",
    "There are two error models and they are not interchangeable. A <em>Monte-Carlo</em> algorithm may return the wrong answer, with a probability you choose, and its worst-case runtime is usually deterministic: a hash comparison that collides, a Miller-Rabin witness that lies. A <em>Las Vegas</em> algorithm is always correct and only the runtime is random: randomised quicksort, a treap, a shuffle-then-greedy that retries until a witness works. Shipping a hash without saying \"error about <code>q / 2<sup>64</sup></code>\" is claiming Las Vegas for a Monte-Carlo algorithm, which is the interview trap.",
    "In a real problem statement the signal is equality of strings or sets, primality of a 64-bit integer, or a sequence that wants split and merge, sitting next to limits that make the deterministic alternative (KMP build, trial division to <code>&radic;n</code>, a splay tree) either slower to type or slower to run. Codeforces anti-hash tests punish a famous fixed base such as 31 modulo <code>10<sup>9</sup>+7</code>. Randomise the base from <code>System.nanoTime()</code> at startup, or use two moduli. Never seed <code>new Random(0)</code> in a submission you cannot reproduce the setter's attack against.",
  ],
  insight: "If a random 64-bit fingerprint collides with probability about <code>1 / 2<sup>64</sup></code>, then <code>q = 10<sup>5</sup></code> comparisons still fail with probability about <code>10<sup>5</sup> / 2<sup>64</sup></code>, which is the calculation you recite. Las Vegas algorithms skip that sentence because they are never wrong, only sometimes slow.",
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
  constraint: "A per-comparison failure of <code>2<sup>-64</sup></code> is small enough for a billion operations; a union bound still leaves the whole run safer than a hardware glitch. Miller-Rabin on a 64-bit integer needs a known set of 7 deterministic witnesses, or a handful of random ones. Java's <code>ThreadLocalRandom</code> or a <code>Random</code> seeded from <code>nanoTime</code> is the contest RNG; do not use <code>SecureRandom</code> unless the statement is about cryptography.",
  core: [
    "Zobrist hashing gives each value (or each pair of position and value) a random 64-bit mask, stored in a table you fill once at startup. The hash of a set is the XOR of the masks of its members; adding or removing an element is XOR-ing that mask again, because XOR is its own inverse. Two different sets collide only when their symmetric difference XORs to zero, which for random 64-bit masks happens with probability about <code>2<sup>-64</sup></code> per comparison. Polynomial rolling hashes are the ordered cousin: a random base and one or two big moduli turn a string into a number, and a substring becomes a pair of prefix hashes. Both are Monte-Carlo: you state the union bound and you move on.",
    "Miller-Rabin tests whether an odd <code>n</code> is prime. Write <code>n - 1 = 2<sup>s</sup> &times; d</code> with <code>d</code> odd. For a witness <code>a</code>, compute <code>a<sup>d</sup> mod n</code> and then square that value <code>s</code> times. If you never see 1 or <code>n - 1</code> at the moment the theorem demands, <code>n</code> is composite for sure. If every squaring looks legal, <code>n</code> is probably prime; a random witness lies with probability at most <code>1/4</code>, so a dozen independent witnesses push the error below <code>2<sup>-20</sup></code>. For every 64-bit integer there is a short fixed list of witnesses that jointly catch every composite, which is how the test becomes deterministic on that range. The implementation trap is <code>a * b % m</code> on longs: a billion times a billion overflows, the witness is garbage, and primes are declared composite.",
    "Walk a few integers. For <code>n = 7</code>, <code>n - 1 = 2<sup>1</sup> &times; 3</code>; the witness 2 gives <code>2<sup>3</sup> = 8 &equiv; 1 (mod 7)</code>, which is a pass. For <code>n = 15 = 3 &times; 5</code>, <code>n - 1 = 2<sup>1</sup> &times; 7</code> and <code>2<sup>7</sup> = 128 &equiv; 8 (mod 15)</code>, which is neither 1 nor 14, so 15 is composite after one witness. Zobrist on the side: the sets <code>{1, 2}</code> and <code>{2, 1}</code> XOR the same two masks and compare equal; <code>{1, 2}</code> versus <code>{1, 3}</code> differ unless those three masks are linearly dependent over <code>GF(2)</code>, which is the <code>2<sup>-64</sup></code> event. A shuffle-then-try-first-feasible permutation is Las Vegas: if a constant fraction of permutations work, the expected number of trials is a small constant.",
  ],
  invariant: "<p>A Monte-Carlo fingerprint is a homomorphism from the object (string, set, integer) into a ring or a bit-vector. Distinct objects collide with probability about <code>1 / |ring|</code> per comparison when the map is pairwise independent or a random polynomial; a union bound over <code>q</code> comparisons is the failure probability of the whole run.</p><p>In plain words, you replaced the object by a random name that almost surely differs from every other object's name, and you must say \"almost surely\" rather than \"always\".</p><p>Interview sentence: <em>\"Hashing is Monte-Carlo with error q over 2 to the 64; a treap is Las Vegas and always correct.\"</em></p>",
  extra: [
    {
      kind: "key",
      title: "Name the error model",
      html: "<p>Monte-Carlo: bounded error, usually a deterministic runtime (hash, a single Miller-Rabin round). Las Vegas: always correct, expected runtime (random pivot, treap, retry-until-witness). Do not call a hash \"always correct\" unless you verify collisions with a deterministic compare.</p>",
    },
  ],
  dryIntro: "Miller-Rabin on a short list of integers, then a Zobrist equality and a shuffle-retry. Each row is one witness or one fingerprint, and the verdict it produces.",
  array: [7, 13, 15, 17, 21],
  arrayLabel: "n tested =",
  vars: ["n", "MR", "verdict"],
  frames: [
    { note: "Seven is prime. Miller-Rabin with witness 2 writes 7-1 as 2^1 times 3, and 2^3 = 8, which is 1 mod 7, so the witness passes.",
      active: [0], values: { n: 7, MR: "a=2", verdict: "prime" } },
    { note: "Thirteen is also prime. The same witness 2 satisfies the squaring conditions, so Miller-Rabin reports prime again.",
      active: [1], values: { n: 13, MR: "pass", verdict: "prime" } },
    { note: "Fifteen is 3 times 5. Witness 2 gives 2^7 = 128, which is 8 mod 15, neither 1 nor 14, so the test correctly reports composite.",
      active: [2], values: { n: 15, MR: "a=2", verdict: "composite" } },
    { note: "Seventeen is prime and the witness 2 passes once more, which is the pattern for every prime: a legal witness never rejects it.",
      active: [3], values: { n: 17, MR: "pass", verdict: "prime" } },
    { note: "Zobrist hashes of {1, 2} and {2, 1} XOR the same two masks and compare equal; {1, 2} versus {1, 3} differ except on a 2^-64 collision.",
      active: [0, 1], values: { n: "zobrist", MR: "xor", verdict: "equal sets" } },
    { note: "Shuffle then try the first feasible permutation is Las Vegas: if a constant fraction of orders work, the expected number of retries is a small constant.",
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
    "<strong>Name the error model before you pick a tool.</strong> A fingerprint (hash, one Miller-Rabin round) is Monte-Carlo; a random tree or a random pivot is Las Vegas. Mixing the two in the analysis is how \"always correct\" gets attached to a hash.",
    "<strong>Seed the RNG from the clock, not from a constant.</strong> <code>System.nanoTime()</code> xor-ed with an identity hash is enough for a contest; <code>new Random(0)</code> is a target the setter can reproduce.",
    "<strong>Draw a random hash base or a Zobrist table of 64-bit masks.</strong> One random base plus two moduli, or XOR of random ids for a set: state the collision probability once in a comment and then treat compares as equalities.",
    "<strong>For 64-bit primality, use the known witness list (or k random witnesses).</strong> Deterministic bases make Miller-Rabin always correct on that range; random witnesses need the <code>4<sup>-k</sup></code> bound said out loud.",
    "<strong>Give every treap node a random long priority and rotate to heap order.</strong> The BST order stays on the keys, the heap order on the priorities, and split/merge then run in expected logarithmic time.",
    "<strong>Write the failure or expectation bound where a reviewer will see it.</strong> Interviews ask for that sentence; a blog without it reads as if the algorithm were deterministic, which is the claim that anti-hash tests exist to punish.",
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
      "<p>Miller-Rabin on one integer is <code>k</code> modular exponentiations, each a <code>O(log n)</code> sequence of multiplications modulo <code>n</code>. With a 128-bit <code>mulMod</code> those multiplications are constant time; with <code>BigInteger</code> they are <code>O(log n)</code> each, still fine for a few dozen tests. A Zobrist or rolling-hash compare is a handful of XORs or multiplications, treated as <code>O(1)</code>. A treap split or merge is expected <code>O(log n)</code> rotations because a random priority heap has logarithmic height.</p>",
      "<p>The failure calculation is a union bound. One 64-bit fingerprint collides with probability about <code>2<sup>-64</sup></code>; <code>q</code> independent compares therefore fail with probability at most <code>q / 2<sup>64</sup></code>. Putting real numbers in: <code>q = 10<sup>5</sup></code> gives about <code>5 &times; 10<sup>-15</sup></code>, and even a billion compares is still about <code>5 &times; 10<sup>-11</sup></code>. Miller-Rabin with seven deterministic 64-bit witnesses has error zero on that range. Trial division to <code>&radic;n</code> on a 64-bit composite is up to <code>2<sup>32</sup></code> divisions and is the thing these tests replace.</p>",
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
      bug: "A famous base such as 31 modulo <code>10<sup>9</sup>+7</code> looks identical to the textbook rolling-hash, so the sample and the first sixty tests pass, then an anti-hash test constructs a collision and you WA on test 67.",
      fix: "Draw the base from the clock, or use two independent moduli, or hash modulo <code>2<sup>61</sup>-1</code> with unsigned overflow. Re-run against a known anti-hash pair before you submit." },
    { title: "mul overflow in MR",
      bug: "<code>a * b % m</code> on longs looks like the usual modular multiply, but when <code>a</code> and <code>b</code> are near <code>10<sup>18</sup></code> the product wraps in 64 bits, the witness becomes garbage, and a real prime is reported composite.",
      fix: "Use <code>BigInteger</code>, a split <code>mulMod</code>, <code>Math.multiplyHigh</code>, or unsigned 128-bit arithmetic. Test on a known 64-bit prime near <code>2<sup>64</sup></code>, not on 17." },
    { title: "Seeding Random with 0",
      bug: "A constant seed makes every hash table identical across machines, which is convenient for debugging and is exactly the table a setter can target once they know the seed.",
      fix: "Seed from <code>System.nanoTime()</code> in the submission. Keep the constant seed only in a local debug build that you will not send to the judge." },
    { title: "Treap without unique priorities",
      bug: "Equal integer priorities look harmless because the BST order is still well defined, but a rotate-on-tie can loop or build a long chain, and the expected-log proof assumes distinct random priorities.",
      fix: "Draw a random <code>long</code> per node. On the rare remaining tie, break it by node identity and never rotate in a cycle." },
    { title: "Calling a Monte-Carlo algorithm Las Vegas in an interview",
      bug: "\"The hash is always correct\" sounds like confidence, but a fingerprint can collide, so the claim is false and a follow-up of \"what is the error?\" has no number attached.",
      fix: "Say \"error about <code>q / 2<sup>64</sup></code>\" for a 64-bit hash, or verify a suspected collision with a deterministic compare (KMP, character-by-character). Treaps and random pivots are the ones that are always correct." },
  ],
  variants: [
    ["Pollard Rho", "Random walk to factor 64-bit. Pair with MR.", "CF factoring", "n <= 1e18"],
    ["Implicit treap", "Array split/merge, lazy reverse.", "sequence operations", "alternative to splay"],
    ["Randomised incremental geometry", "Insert points in random order; expected O(n log n) hull/Delaunay.", "convex hull next module", "Clarkson"],
  ],
  followups: [
    ["Monte-Carlo vs Las Vegas?",
      "<p>A Monte-Carlo algorithm may be wrong, with a probability you bound, and its worst-case runtime is usually deterministic: a hash compare, a single Miller-Rabin round. A Las Vegas algorithm is never wrong and only the runtime is random: randomised quicksort, a treap, a retry-until-witness loop. Hashing without a deterministic verify is Monte-Carlo. Do not mix the two sentences in an interview.</p>"],
    ["Why do 7 MR bases suffice for 64-bit?",
      "<p>There is a proven finite set of witnesses that jointly catch every composite below <code>2<sup>64</sup></code>. Checking those witnesses, and no others, makes Miller-Rabin deterministic on unsigned 64-bit integers: every composite fails at least one of them, and no prime fails any of them. Random witnesses are for bigger integers, or for when you have not memorised the list.</p>"],
    ["Zobrist vs polynomial hash for sets?",
      "<p>A polynomial hash cares about order: swapping two characters changes the value. XOR of random ids is commutative and involutive, so it hashes sets (and, with a counter-dependent mask or a 2D table, multisets). Use Zobrist when the object is \"these elements, in any order\"; use a polynomial when the object is a string or a sequence.</p>"],
    ["Can you derandomise hashing?",
      "<p>Universal hashing &mdash; drawing a function from a 2-universal family at startup &mdash; is already the theoretical version of what this page does with a random base. Worst-case deterministic substring equality does not hash at all: it uses KMP, the Z-function, or a suffix array. If the statement forbids randomness, those are the tools, not a fixed \"random-looking\" base.</p>"],
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

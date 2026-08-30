/* Module 08 — Graphs: Advanced */

export const topics = [

/* ======================== 1. bellman-ford-and-negative-cycles ========== */
{
  id: "bellman-ford-and-negative-cycles",
  difficulty: "Medium",
  readTime: "26 min",
  tagline: "Relax every edge <code>n-1</code> times to compute single-source distances when " +
    "weights can be negative, then use one extra pass to detect a negative cycle that can reach " +
    "the target.",
  tags: ["shortest path", "negative cycle", "relaxation", "P1"],
  prereqs: [
    ["Dijkstra", "../07-graphs-core/dijkstra.html"],
    ["DFS & Components", "../07-graphs-core/dfs-and-components.html"],
  ],

  why: {
    paras: [
      "Dijkstra is wrong the moment an edge weight is negative. Its proof needs non-negative " +
        "weights so that the first time a vertex leaves the heap its distance is final. A " +
        "negative edge can later improve a settled vertex, and the algorithm silently returns " +
        "garbage.",
      "Bellman-Ford drops the heap and just <em>relaxes every edge</em>, <code>n-1</code> times. " +
        "After <code>k</code> passes, every shortest path that uses at most <code>k</code> edges " +
        "is correct. A simple path has at most <code>n-1</code> edges, so " +
        "<code>n-1</code> passes finish the job &mdash; or prove that no finite shortest path " +
        "exists, because a further improvement means a negative cycle.",
      "Interview and contest problems hide this as \"maximum score / minimum cost with possible " +
        "bonus loops\", \"arbitrage\", and \"cheapest flights with at most <code>k</code> stops\". " +
        "The last one is Bellman-Ford truncated to <code>k+1</code> passes.",
    ],
    insight: "A shortest path is a sequence of edge relaxations. If you offer every edge " +
      "<code>n-1</code> chances to fire, every simple path has been considered. A distance that " +
      "still improves on pass <code>n</code> is sitting on a negative cycle.",
  },

  recognise: {
    yes: [
      "Edge weights can be negative and you need single-source distances",
      "The statement mentions a cycle that increases score / decreases cost forever",
      "\"Cheapest path using at most <code>k</code> edges\" &mdash; truncated Bellman-Ford",
      "Currency exchange / arbitrage: a cycle whose log-rates sum to less than zero",
      "You must report whether a finite answer exists, not only the number",
    ],
    no: [
      "All weights are non-negative &rarr; " +
        "<a href=\"../07-graphs-core/dijkstra.html\">Dijkstra</a> is faster",
      "Weights are only 0 and 1 &rarr; " +
        "<a href=\"../07-graphs-core/zero-one-bfs.html\">0-1 BFS</a>",
      "You need all-pairs distances on a dense graph &rarr; " +
        "<a href=\"floyd-warshall.html\">Floyd-Warshall</a>",
      "The graph is a DAG &rarr; one topo pass is enough, see " +
        "<a href=\"../07-graphs-core/topological-sort-and-dag-dp.html\">DAG DP</a>",
    ],
    table: [
      ["Negative weights, no cycle talk", "Single-source shortest paths", "Bellman-Ford"],
      ["\"Infinite profit / unbounded score\"", "Negative cycle that can reach the target",
        "n-th relaxation pass + reachability"],
      ["At most k stops / k edges", "Truncate to k+1 passes", "LC 787"],
      ["All-pairs, n &le; 400", "Dense DP over intermediates", "Floyd-Warshall"],
      ["Non-negative weights", "Greedy extract-min is safe", "Dijkstra"],
      ["<strong>Confused with:</strong> SPFA",
        "Queue-optimised Bellman-Ford; worst-case still O(nm) and easy to TLE on CF",
        "Use the n-1 loop unless n and m are tiny"],
    ],
    constraint: "<code>n &le; 2&times;10&#179;</code> and <code>m &le; 5&times;10&#179;</code> is " +
      "the classic Bellman-Ford window (<code>O(nm)</code> &asymp; 10&#8311;). " +
      "<code>n &le; 10&#8309;</code> with negative weights is not this algorithm.",
  },

  core: {
    heading: "Relaxation and the n-th pass",
    paras: [
      "Relaxing an edge <code>u &rarr; v</code> with weight <code>w</code> is the assignment " +
        "<code>if (dist[u] + w &lt; dist[v]) dist[v] = dist[u] + w</code>. It is safe: it never " +
        "makes a distance worse, and it is complete: every shortest path is a chain of such " +
        "improvements from the source.",
      "After pass <code>i</code>, <code>dist[v]</code> equals the shortest walk from the source " +
        "that uses at most <code>i</code> edges (or <code>+&infin;</code> if none exists). A " +
        "simple path has &le; <code>n-1</code> edges, so pass <code>n-1</code> finishes every " +
        "finite shortest path. Pass <code>n</code> is a detector: any vertex that improves is " +
        "reachable from a negative cycle, and so is everything those vertices can reach.",
      "When the problem asks for the shortest path <em>to a particular target</em>, a negative " +
        "cycle elsewhere is irrelevant. Mark vertices that improved on pass <code>n</code>, then " +
        "BFS/DFS forward (or on the reverse graph, backward from the target) to see whether the " +
        "cycle can actually affect the answer.",
    ],
    invariantTitle: "The interview sentence",
    invariant: "<p><em>After <code>i</code> full relaxations of every edge, every shortest " +
      "walk of at most <code>i</code> edges is correctly computed. A further improvement " +
      "proves a negative cycle on some walk from the source.</em> In an interview, say that, " +
      "then mention the extra reachability check if the answer is a single target.</p>",
    extra: [
      { kind: "warn", title: "Overflow on dist[u] + w",
        html: "<p>If <code>dist[u]</code> is <code>Long.MAX_VALUE / 2</code> and <code>w</code> " +
          "is positive, the add can wrap. Sentinel-infinity should be large enough for the " +
          "answer but small enough that <code>inf + minW</code> still fits in a " +
          "<code>long</code> &mdash; <code>10&#185;&#8308; / 4</code> is the usual choice.</p>" },
      { kind: "tip", title: "Parent pointers reconstruct the cycle",
        html: "<p>Keep <code>par[v] = u</code> on a successful relax. After the n-th pass, start " +
          "from an improved vertex and walk <code>n</code> parent steps to land on the cycle, " +
          "then walk once more until you return. That is the CSES Cycle Finding construction.</p>" },
    ],
  },

  visuals: [
    {
      kind: "grid", vizId: "bfDist",
      h3: "Distance table after each relaxation pass",
      intro: "Same layout as a Dijkstra distance row, but one row per pass. Columns are vertices. " +
        "Source is <code>0</code>. Edges in order: " +
        "<code>0&rarr;1 (5), 0&rarr;2 (4), 2&rarr;1 (-2), 1&rarr;3 (3), 2&rarr;3 (4)</code>.",
      caption: "After pass k, column v is the shortest walk from 0 that uses at most k edges. " +
        "Green is a value that improved on this pass.",
      data: {
        corner: "pass\\v",
        rowHeads: ["0", "1", "2", "3", "4"],
        colHeads: ["0", "1", "2", "3"],
        vars: ["pass", "relaxed", "dist"],
        speed: 1100,
        frames: [
          { note: "Pass 0: only the source is 0. Everyone else is infinity.",
            cells: [
              { r: 0, c: 0, val: "0", cls: "answer" },
              { r: 0, c: 1, val: "\u221e" }, { r: 0, c: 2, val: "\u221e" }, { r: 0, c: 3, val: "\u221e" },
            ],
            values: { pass: 0, relaxed: "\u2014", dist: "[0, inf, inf, inf]" } },
          { note: "Pass 1, edge 0\u21921: 0+5 improves inf. dist[1] = 5.",
            cells: [
              { r: 1, c: 0, val: "0" }, { r: 1, c: 1, val: "5", cls: "from" },
              { r: 1, c: 2, val: "\u221e" }, { r: 1, c: 3, val: "\u221e" },
            ],
            values: { pass: 1, relaxed: "0\u21921", dist: "[0, 5, inf, inf]" } },
          { note: "Pass 1, edge 0\u21922: 0+4 improves inf. dist[2] = 4.",
            cells: [
              { r: 1, c: 0, val: "0" }, { r: 1, c: 1, val: "5" },
              { r: 1, c: 2, val: "4", cls: "from" }, { r: 1, c: 3, val: "\u221e" },
            ],
            values: { pass: 1, relaxed: "0\u21922", dist: "[0, 5, 4, inf]" } },
          { note: "Pass 1, edge 2\u21921: 4+(-2)=2 beats 5. The negative edge fires inside the same pass because 2 was already updated.",
            cells: [
              { r: 1, c: 0, val: "0" }, { r: 1, c: 1, val: "2", cls: "answer" },
              { r: 1, c: 2, val: "4" }, { r: 1, c: 3, val: "\u221e" },
            ],
            values: { pass: 1, relaxed: "2\u21921", dist: "[0, 2, 4, inf]" } },
          { note: "Pass 1, edges 1\u21923 and 2\u21923: 2+3=5 wins over 4+4=8. dist[3] = 5.",
            cells: [
              { r: 1, c: 0, val: "0" }, { r: 1, c: 1, val: "2" },
              { r: 1, c: 2, val: "4" }, { r: 1, c: 3, val: "5", cls: "from" },
            ],
            values: { pass: 1, relaxed: "1\u21923", dist: "[0, 2, 4, 5]" } },
          { note: "Passes 2 and 3 change nothing. n-1 = 3, so these distances are final. Pass 4 (not shown as a change) would also be quiet: no negative cycle.",
            cells: [
              { r: 2, c: 0, val: "0" }, { r: 2, c: 1, val: "2" }, { r: 2, c: 2, val: "4" }, { r: 2, c: 3, val: "5" },
              { r: 3, c: 0, val: "0" }, { r: 3, c: 1, val: "2" }, { r: 3, c: 2, val: "4" }, { r: 3, c: 3, val: "5" },
              { r: 4, c: 0, val: "0", cls: "answer" }, { r: 4, c: 1, val: "2", cls: "answer" },
              { r: 4, c: 2, val: "4", cls: "answer" }, { r: 4, c: 3, val: "5", cls: "answer" },
            ],
            values: { pass: "2..4", relaxed: "none", dist: "[0, 2, 4, 5] final" } },
        ],
      },
    },
    {
      kind: "mermaid", vizId: "bfGraph",
      h3: "The graph being relaxed",
      caption: "Vertex 2 undercuts vertex 1 via a negative edge. That is exactly why Dijkstra " +
        "would have settled 1 too early at distance 5.",
      src: `graph LR
  srcN["0"] -->|"5"| nodeA["1"]
  srcN -->|"4"| nodeB["2"]
  nodeB -->|"-2"| nodeA
  nodeA -->|"3"| nodeC["3"]
  nodeB -->|"4"| nodeC`,
    },
  ],

  steps: [
    "<strong>Init.</strong> <code>long[] dist = new long[n]</code>, fill with a safe infinity, " +
      "<code>dist[src] = 0</code>. Optionally <code>int[] par</code> for reconstruction.",
    "<strong>Repeat <code>n-1</code> times:</strong> for every edge <code>(u, v, w)</code>, if " +
      "<code>dist[u] != INF && dist[u] + w &lt; dist[v]</code>, set <code>dist[v] = dist[u] + w</code> " +
      "and <code>par[v] = u</code>.",
    "<strong>Optional early exit:</strong> if a whole pass changes nothing, stop.",
    "<strong>Negative-cycle pass.</strong> One more sweep. Collect every <code>v</code> that still improves.",
    "<strong>Reachability.</strong> From those vertices, walk the residual / original graph. If " +
      "the target (or \"any vertex\", depending on the problem) is reachable, report unbounded.",
    "<strong>Cycle reconstruction (if asked).</strong> From an improved <code>x</code>, walk " +
      "<code>par</code> <code>n</code> times, then walk until you repeat.",
    "<strong>Answer.</strong> <code>dist[t]</code> if finite and not affected by a bad cycle, else " +
      "the problem-specific sentinel.",
  ],

  dryRun: {
    intro: "Edges in the order shown. Infinity is written as inf. Highlighted rows are the ones " +
      "that change a distance.",
    cols: ["pass", "edge", "dist[u]+w", "dist[v]", "new dist"],
    rows: [
      { cells: ["1", "0\u21921 w=5", "5", "inf", "[0, 5, inf, inf]"],
        action: "First reach of 1.", change: true },
      { cells: ["1", "0\u21922 w=4", "4", "inf", "[0, 5, 4, inf]"],
        action: "First reach of 2.", change: true },
      { cells: ["1", "2\u21921 w=-2", "2", "5", "[0, 2, 4, inf]"],
        action: "Negative edge undercuts 1.", change: true },
      { cells: ["1", "1\u21923 w=3", "5", "inf", "[0, 2, 4, 5]"],
        action: "First reach of 3 via the improved 1.", change: true },
      { cells: ["1", "2\u21923 w=4", "8", "5", "[0, 2, 4, 5]"],
        action: "8 does not beat 5." },
      { cells: ["2", "all five", "\u2014", "\u2014", "[0, 2, 4, 5]"],
        action: "No improvement. Later passes are idle." },
    ],
  },

  code: [
    { tab: "Brute walks", panel: "Brute", file: "BellmanFordBrute.java",
      intro: "Enumerate simple walks by DFS. Exponential, and it cannot even talk about negative " +
        "cycles cleanly. Shown so you can reject it in an interview in one sentence.",
      highlight: "10-16",
      code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class BellmanFordBrute {
    static final long INF = (long) 1e15;

    static long dfs(List<int[]>[] g, int u, int t, long cost, boolean[] seen) {
        if (u == t) return cost;
        long best = INF;
        seen[u] = true;
        for (int[] e : g[u]) {
            if (!seen[e[0]]) best = Math.min(best, dfs(g, e[0], t, cost + e[1], seen));
        }
        seen[u] = false;
        return best;
    }

    public static void main(String[] args) {
        int n = 4;
        List<int[]>[] g = new List[n];
        for (int i = 0; i < n; i++) g[i] = new ArrayList<>();
        g[0].add(new int[] {1, 5});
        g[0].add(new int[] {2, 4});
        g[2].add(new int[] {1, -2});
        g[1].add(new int[] {3, 3});
        g[2].add(new int[] {3, 4});
        System.out.println(dfs(g, 0, 3, 0, new boolean[n]));
    }
    // Input : edges (0,1,5) (0,2,4) (2,1,-2) (1,3,3) (2,3,4), src=0, t=3
    // Output: 5
}` },
    { tab: "Optimal", panel: "Optimal", file: "BellmanFord.java",
      intro: "The <code>n-1</code> relaxation loop plus a flag for a negative cycle that can " +
        "reach anywhere from the source. Distances use <code>long</code>.",
      highlight: "22-30",
      code: `import java.util.Arrays;

public class BellmanFord {
    static final long INF = (long) 1e15;

    static long[] dist;
    static boolean hasNegCycle;

    static void run(int n, int[][] edges, int src) {
        dist = new long[n];
        Arrays.fill(dist, INF);
        dist[src] = 0;
        hasNegCycle = false;
        for (int i = 0; i < n - 1; i++) {
            boolean changed = false;
            for (int[] e : edges) {
                int u = e[0], v = e[1], w = e[2];
                if (dist[u] >= INF / 2) continue;
                if (dist[u] + w < dist[v]) {
                    dist[v] = dist[u] + w;
                    changed = true;
                }
            }
            if (!changed) return;
        }
        for (int[] e : edges) {
            int u = e[0], v = e[1], w = e[2];
            if (dist[u] >= INF / 2) continue;
            if (dist[u] + w < dist[v]) {
                hasNegCycle = true;
                return;
            }
        }
    }

    public static void main(String[] args) {
        int[][] edges = {
            {0, 1, 5}, {0, 2, 4}, {2, 1, -2}, {1, 3, 3}, {2, 3, 4}
        };
        run(4, edges, 0);
        System.out.println(Arrays.toString(dist) + " neg=" + hasNegCycle);
    }
    // Input : n=4, edges as above, src=0
    // Output: [0, 2, 4, 5] neg=false
}` },
    { tab: "Template", panel: "Template", file: "BellmanFordKStops.java",
      intro: "LC 787 shape: at most <code>k</code> stops means at most <code>k+1</code> edges, " +
        "so copy <code>dist</code> each pass (or the same-pass leak uses more than k edges).",
      highlight: "12-20",
      code: `import java.util.Arrays;

public class BellmanFordKStops {
    static final long INF = (long) 1e15;

    static long cheapest(int n, int[][] flights, int src, int dst, int k) {
        long[] dist = new long[n];
        Arrays.fill(dist, INF);
        dist[src] = 0;
        for (int pass = 0; pass <= k; pass++) {
            long[] next = dist.clone();
            for (int[] e : flights) {
                int u = e[0], v = e[1], w = e[2];
                if (dist[u] < INF / 2 && dist[u] + w < next[v]) {
                    next[v] = dist[u] + w;
                }
            }
            dist = next;
        }
        return dist[dst] >= INF / 2 ? -1 : dist[dst];
    }

    public static void main(String[] args) {
        int[][] flights = {{0, 1, 100}, {1, 2, 100}, {0, 2, 500}};
        System.out.println(cheapest(3, flights, 0, 2, 1));
    }
    // Input : n=3, flights as above, src=0, dst=2, k=1
    // Output: 200
}` },
  ],

  complexity: {
    time: "O(n m)",
    space: "O(n + m)",
    derivation: [
      "<p>Each of <code>n-1</code> passes walks every edge once, so " +
        "<span class=\"eq\">T = (n-1) &middot; m = O(nm)</span>. The detector pass is one more " +
        "<code>O(m)</code>. Reachability is <code>O(n + m)</code>.</p>",
      "<p>SPFA tries to only re-relax vertices that just improved. Average case is faster; " +
        "worst case is still <code>O(nm)</code> and a crafted graph makes the queue explode. On " +
        "Codeforces, prefer the plain loop unless you must squeeze a log.</p>",
    ],
    compare: [
      ["DFS all simple paths", "O(n!)", "O(n)", "Only n \u2264 8"],
      ["Bellman-Ford", "O(n m)", "O(n)", "Negative weights, n m \u2264 ~1e8"],
      ["SPFA", "O(n m) worst", "O(n + m)", "Faster average, easy to TLE"],
      ["Dijkstra", "O(m log n)", "O(n + m)", "Non-negative weights only"],
      ["Floyd-Warshall", "O(n\u00b3)", "O(n\u00b2)", "All-pairs, n \u2264 400"],
      ["DAG relaxation", "O(n + m)", "O(n)", "When a topo order exists"],
    ],
  },

  pitfalls: [
    { title: "Relaxing from an unreachable infinity",
      bug: "<code>dist[u] + w</code> when <code>dist[u]</code> is the sentinel wraps, or " +
        "\"improves\" a vertex that is not reachable from the source.",
      fix: "Guard with <code>if (dist[u] &gt;= INF / 2) continue;</code> before every add." },
    { title: "Same-array leak on a k-edge bound",
      bug: "LC 787 coded with one <code>dist[]</code> so an update in pass <code>i</code> is " +
        "reused later in the same pass, using more than <code>i</code> edges.",
      fix: "Clone <code>dist</code> into <code>next</code> each pass, or iterate edges from a snapshot." },
    { title: "Reporting a negative cycle that cannot reach the target",
      bug: "Any n-th-pass improvement returns \"unbounded\", even if that cycle is in another component.",
      fix: "Flood from improved vertices (or backwards from the target) and only then refuse a finite answer." },
    { title: "int overflow on a long path of -10^9 edges",
      bug: "<code>n &times; |w|</code> exceeds <code>2&#179;&#185;</code> on the usual CF bounds.",
      fix: "Store distances in <code>long</code>. Always." },
    { title: "Forgetting the graph can be disconnected",
      bug: "Printing <code>0</code> or the sentinel without a problem-specific \"no path\" value.",
      fix: "Agree the output for unreachable: <code>-1</code>, <code>INF</code>, or \"NO\" as the statement says." },
  ],

  variants: [
    ["At most k edges",
      "Stop after k+1 passes; snapshot dist each pass.",
      "for (int i = 0; i <= k; i++) { next = dist.clone(); relax into next; dist = next; }",
      "<a href=\"https://leetcode.com/problems/cheapest-flights-within-k-stops/\" target=\"_blank\" rel=\"noopener\">LC 787</a>"],
    ["Detect and print a negative cycle",
      "Keep parents; walk n steps from an improved vertex, then dump the loop.",
      "for (int i = 0; i < n; i++) x = par[x]; then walk until x repeats",
      "<a href=\"https://cses.fi/problemset/task/1197\" target=\"_blank\" rel=\"noopener\">CSES Cycle Finding</a>"],
    ["Maximum score (negate weights)",
      "Negate every weight and run the same algorithm; a positive cycle becomes a negative one.",
      "w = -w; then standard Bellman-Ford",
      "<a href=\"https://cses.fi/problemset/task/1673\" target=\"_blank\" rel=\"noopener\">CSES High Score</a>"],
  ],

  followups: [
    ["Why n-1 and not n, or n-2?",
      "<p>A simple path on n vertices has n-1 edges. After n-1 successful relaxations along that " +
        "path &mdash; in the worst edge order, one new edge per pass &mdash; the last vertex is " +
        "correct. One fewer pass misses a path that is a Hamiltonian chain processed backwards.</p>"],
    ["Can you reconstruct the shortest path, not just the distance?",
      "<p>Yes: store <code>par[v] = u</code> on every improving relax. Walk from t to src. If a " +
        "negative cycle can reach t, there is no shortest path to reconstruct.</p>"],
    ["How do you find <em>any</em> negative cycle, not only one reachable from src?",
      "<p>Add a super-source with 0-weight edges to every vertex, then run Bellman-Ford from it. " +
        "Equivalently, initialise <code>dist[*] = 0</code> instead of infinity: that pretends " +
        "every vertex is a source.</p>"],
    ["SPFA vs the n-1 loop in a contest?",
      "<p>SPFA is fine on random graphs and dies on constructed ones. CF testers know the " +
        "constructions. If <code>nm</code> fits, write the loop. If it does not, the intended " +
        "solution is not Bellman-Ford.</p>"],
  ],

  problems: [
    { url: "https://leetcode.com/problems/network-delay-time/", name: "Network Delay Time",
      badge: "lc", tag: "LC 743", level: "Medium", pattern: "Single-source; Dijkstra is faster but BF is correct" },
    { url: "https://leetcode.com/problems/cheapest-flights-within-k-stops/", name: "Cheapest Flights Within K Stops",
      badge: "lc", tag: "LC 787", level: "Medium", pattern: "Truncate to k+1 passes, snapshot dist" },
    { url: "https://leetcode.com/problems/path-with-maximum-probability/", name: "Path with Maximum Probability",
      badge: "lc", tag: "LC 1514", level: "Medium", pattern: "Relax with products (or log-sums)" },
    { url: "https://cses.fi/problemset/task/1673", name: "High Score",
      badge: "gfg", tag: "CSES", level: "Hard", pattern: "Negate weights; cycle must reach n" },
    { url: "https://cses.fi/problemset/task/1197", name: "Cycle Finding",
      badge: "gfg", tag: "CSES", level: "Hard", pattern: "Print any negative cycle via parents" },
    { url: "https://cses.fi/problemset/task/1672", name: "Shortest Routes II",
      badge: "gfg", tag: "CSES", level: "Medium", pattern: "All-pairs; Floyd, not BF, once n grows" },
    { url: "https://codeforces.com/problemset/problem/1473/E", name: "Minimum Path",
      badge: "cf", tag: "CF 1473E", level: "Hard", pattern: "Layered shortest path; BF mindset, Dijkstra engine" },
    { url: "https://codeforces.com/problemset/problem/449/B", name: "Jzzhu and Cities",
      badge: "cf", tag: "CF 449B", level: "Medium", pattern: "Which extra edges are useless given shortest paths" },
    { url: "https://atcoder.jp/contests/abc061/tasks/abc061_d", name: "Score Attack",
      badge: "atc", tag: "ABC 061D", level: "Hard", pattern: "High-score / negative-cycle to n" },
    { url: "https://www.geeksforgeeks.org/problems/distance-from-the-source-bellman-ford-algorithm/1",
      name: "Bellman-Ford GfG", badge: "gfg", tag: "GfG", level: "Medium", pattern: "Implement the n-1 loop" },
  ],

  spoilers: [
    { summary: "Hint for CSES High Score",
      body: "<p>Negate every edge and run Bellman-Ford from 1. A negative cycle is a positive " +
        "score cycle. It only makes the answer unbounded if that cycle can reach n: from every " +
        "vertex improved on pass n, DFS forward, and also confirm the cycle is reachable from 1.</p>" },
    { summary: "Hint for LC 787",
      body: "<p>At most k stops = at most k+1 edges. Each pass must read a frozen snapshot of " +
        "<code>dist</code>, otherwise a chain of updates inside one loop uses extra stops. " +
        "Unreachable is <code>-1</code>.</p>" },
  ],

  recap: {
    bullets: [
      "<strong>Relax every edge n-1 times.</strong> After pass i, walks of at most i edges are optimal.",
      "<strong>Pass n is a detector</strong>, not another distance update you keep.",
      "<strong>A bad cycle only matters if it can reach the answer vertex.</strong>",
      "<strong>k-edge variants snapshot <code>dist</code></strong> each pass.",
      "<strong>Use <code>long</code> and a safe infinity</strong> that will not overflow on <code>+ w</code>.",
    ],
    oneliner: "for(i=0;i<n-1;i++) for(e:edges) if(dist[u]+w<dist[v]) dist[v]=dist[u]+w;",
  },
},

/* =========================================== 2. floyd-warshall ========== */
{
  id: "floyd-warshall",
  difficulty: "Medium",
  readTime: "24 min",
  tagline: "A three-line DP that fills every pair's shortest path by trying each vertex as an " +
    "intermediate &mdash; <code>O(n&sup3;)</code>, and the only all-pairs algorithm you will " +
    "write in an interview.",
  tags: ["all-pairs", "DP", "shortest path", "P1"],
  prereqs: [
    ["Bellman-Ford & Negative Cycles", "bellman-ford-and-negative-cycles.html"],
    ["Dijkstra", "../07-graphs-core/dijkstra.html"],
  ],

  why: {
    paras: [
      "n single-source Dijkstras solve all-pairs on non-negative graphs in " +
        "<code>O(n m log n)</code>. That is the right tool when the graph is sparse. The moment " +
        "<code>n</code> is a few hundred and you need every pair &mdash; or the graph is dense, " +
        "or weights can be negative &mdash; the cubic DP wins on simplicity and constants.",
      "Floyd-Warshall is the same recurrence as matrix multiplication of the min-plus semiring: " +
        "<code>d[i][j] = min(d[i][j], d[i][k] + d[k][j])</code> for <code>k = 0..n-1</code>. " +
        "You do not need to know that name in an interview; you do need to write the triple loop " +
        "in the right order, with <code>k</code> outermost.",
      "The same table answers \"is j reachable from i\", \"what is the min-max edge on a path\", " +
        "and \"does a negative cycle exist\" (<code>d[v][v] &lt; 0</code>). That last check is why " +
        "the algorithm shows up in graph-closure problems that never mention distances.",
    ],
    insight: "After processing intermediate <code>k</code>, <code>d[i][j]</code> is the shortest " +
      "i-to-j path whose internal vertices all lie in <code>{0..k}</code>. Growing that set by " +
      "one vertex is one addition and one min.",
  },

  recognise: {
    yes: [
      "All-pairs shortest paths and <code>n &le; 400</code>",
      "\"Smallest number of reachable cities with distance &le; T\" (LC 1334)",
      "Transitive closure / reachability on a dense digraph",
      "Minimax path: minimise the worst edge on the path (replace <code>+</code> by <code>max</code>)",
      "Detect any negative cycle, not only one that a given source can reach",
    ],
    no: [
      "Single-source, non-negative, n = 1e5 &rarr; Dijkstra",
      "Single-source, negative, sparse &rarr; Bellman-Ford",
      "Only connectivity, undirected &rarr; BFS or DSU",
      "n = 1000 all-pairs &rarr; n Dijkstras if weights are non-negative, not n&sup3; = 1e9",
    ],
    table: [
      ["n \u2264 400, all pairs", "Cubic DP over intermediates", "Floyd-Warshall"],
      ["n \u2264 1e5, one source", "Heap shortest path", "Dijkstra"],
      ["Negative cycle anywhere", "d[v][v] < 0 after the loops", "This page"],
      ["Reachability only", "Boolean Floyd, or = instead of +", "Transitive closure"],
      ["Minimise the max edge", "d[i][j] = min(d[i][j], max(d[i][k], d[k][j]))", "Minimax"],
      ["<strong>Confused with:</strong> Warshall vs Floyd",
        "Warshall is the boolean reachability ancestor; Floyd adds weights",
        "Same loop nest"],
    ],
    constraint: "<code>n &le; 400</code> is the tell for <code>O(n&sup3;)</code> in Java. " +
      "<code>n = 500</code> is possible if the inner body is tiny and you use a primitive array.",
  },

  core: {
    paras: [
      "Initialise <code>d[i][j]</code> to the edge weight <code>i&rarr;j</code> (or infinity), " +
        "<code>d[i][i] = 0</code>. Then the single recurrence, <code>k</code> outermost: " +
        "<code>d[i][j] = min(d[i][j], d[i][k] + d[k][j])</code>.",
      "k outermost is not a style choice. After the k-loop has finished, every pair may use k " +
        "as an intermediate. If k is inner, you read <code>d[i][k]</code> before those values " +
        "have been given the chance to use earlier intermediates correctly in some implementations " +
        "&mdash; the standard proof assumes k grows as a set, which the outer loop encodes.",
    ],
    invariant: "<p><em>After the outer iteration for vertex k, d[i][j] is the shortest i-j path " +
      "that only uses intermediates from {0, 1, &hellip;, k}.</em> That is the interview " +
      "sentence. The base k = &minus;1 is \"paths that are a single edge\".</p>",
    extra: [
      { kind: "math", title: "Min-plus matrix product",
        html: "<p>One Floyd k-iteration is <code>(D &star; D)</code> in the semiring where " +
          "<code>+</code> means min and <code>&times;</code> means plus. Running it n times is " +
          "repeated squaring of that product, which is also how " +
          "<a href=\"../11-math-and-number-theory/matrix-exponentiation.html\">matrix " +
          "exponentiation</a> counts walks.</p>" },
    ],
  },

  visuals: [
    {
      kind: "grid", vizId: "fwDist",
      h3: "Distance matrix as k grows",
      intro: "Four vertices. Initial edges: 0\u21921 = 3, 0\u21923 = 5, 1\u21922 = 1, 2\u21923 = 1, " +
        "3\u21921 = 2. Each frame is the full matrix after allowing one more intermediate.",
      caption: "Rows are from, columns are to. Amber is a cell that just improved via the current k.",
      data: {
        corner: "from\\to",
        rowHeads: ["0", "1", "2", "3"],
        colHeads: ["0", "1", "2", "3"],
        vars: ["k", "cell", "via"],
        speed: 1200,
        frames: [
          { note: "k = -1: only direct edges and the zero diagonal. Missing edges are infinity.",
            cells: [
              { r: 0, c: 0, val: "0" }, { r: 0, c: 1, val: "3" }, { r: 0, c: 2, val: "\u221e" }, { r: 0, c: 3, val: "5" },
              { r: 1, c: 0, val: "\u221e" }, { r: 1, c: 1, val: "0" }, { r: 1, c: 2, val: "1" }, { r: 1, c: 3, val: "\u221e" },
              { r: 2, c: 0, val: "\u221e" }, { r: 2, c: 1, val: "\u221e" }, { r: 2, c: 2, val: "0" }, { r: 2, c: 3, val: "1" },
              { r: 3, c: 0, val: "\u221e" }, { r: 3, c: 1, val: "2" }, { r: 3, c: 2, val: "\u221e" }, { r: 3, c: 3, val: "0" },
            ],
            values: { k: "-1", cell: "init", via: "direct edges" } },
          { note: "k = 0: nothing uses 0 as a useful hop (row 0 has no incoming). Matrix unchanged.",
            cells: [
              { r: 0, c: 0, val: "0" }, { r: 0, c: 1, val: "3" }, { r: 0, c: 2, val: "\u221e" }, { r: 0, c: 3, val: "5" },
              { r: 1, c: 1, val: "0" }, { r: 1, c: 2, val: "1" }, { r: 2, c: 2, val: "0" }, { r: 2, c: 3, val: "1" },
              { r: 3, c: 1, val: "2" }, { r: 3, c: 3, val: "0" },
            ],
            values: { k: 0, cell: "\u2014", via: "no improvement" } },
          { note: "k = 1: 0\u21922 via 1 becomes 3+1 = 4. 3\u21922 via 1 becomes 2+1 = 3. 0\u2192? already had 3.",
            cells: [
              { r: 0, c: 0, val: "0" }, { r: 0, c: 1, val: "3" }, { r: 0, c: 2, val: "4", cls: "from" }, { r: 0, c: 3, val: "5" },
              { r: 1, c: 1, val: "0" }, { r: 1, c: 2, val: "1" },
              { r: 2, c: 2, val: "0" }, { r: 2, c: 3, val: "1" },
              { r: 3, c: 1, val: "2" }, { r: 3, c: 2, val: "3", cls: "from" }, { r: 3, c: 3, val: "0" },
            ],
            values: { k: 1, cell: "0,2 and 3,2", via: "d[i][1]+d[1][j]" } },
          { note: "k = 2: 0\u21923 via 2 becomes 4+1 = 5 (tie). 1\u21923 via 2 becomes 1+1 = 2. 3\u21923 stays 0.",
            cells: [
              { r: 0, c: 0, val: "0" }, { r: 0, c: 1, val: "3" }, { r: 0, c: 2, val: "4" }, { r: 0, c: 3, val: "5" },
              { r: 1, c: 2, val: "1" }, { r: 1, c: 3, val: "2", cls: "from" },
              { r: 2, c: 3, val: "1" },
              { r: 3, c: 1, val: "2" }, { r: 3, c: 2, val: "3" }, { r: 3, c: 3, val: "0" },
            ],
            values: { k: 2, cell: "1,3", via: "1\u21922\u21923" } },
          { note: "k = 3: 0\u21921 via 3 is 5+2 = 7, worse than 3. 2\u21921 via 3 is 1+2 = 3. 1\u21921 stays 0 (no neg cycle).",
            cells: [
              { r: 0, c: 0, val: "0" }, { r: 0, c: 1, val: "3" }, { r: 0, c: 2, val: "4" }, { r: 0, c: 3, val: "5" },
              { r: 1, c: 1, val: "0" }, { r: 1, c: 2, val: "1" }, { r: 1, c: 3, val: "2" },
              { r: 2, c: 1, val: "3", cls: "from" }, { r: 2, c: 2, val: "0" }, { r: 2, c: 3, val: "1" },
              { r: 3, c: 1, val: "2" }, { r: 3, c: 2, val: "3" }, { r: 3, c: 3, val: "0" },
            ],
            values: { k: 3, cell: "2,1", via: "2\u21923\u21921" } },
          { note: "Done. Shortest 0\u21923 is 5 (either the direct edge or 0-1-2-3). Diagonal still zero: no negative cycle.",
            cells: [
              { r: 0, c: 0, val: "0", cls: "answer" }, { r: 0, c: 1, val: "3", cls: "answer" },
              { r: 0, c: 2, val: "4", cls: "answer" }, { r: 0, c: 3, val: "5", cls: "answer" },
              { r: 1, c: 3, val: "2", cls: "answer" }, { r: 2, c: 1, val: "3", cls: "answer" },
            ],
            values: { k: "done", cell: "all pairs", via: "\u2014" } },
        ],
      },
    },
    {
      kind: "mermaid", vizId: "fwOrder",
      h3: "Why k is the outermost index",
      caption: "The allowed-intermediate set grows by one vertex per outer iteration. That is " +
        "the DP dimension. i and j are just the pair being updated.",
      src: `flowchart TD
  init["d equals edge weights, diagonal 0"] --> kLoop["for k from 0 to n-1"]
  kLoop --> iLoop["for i from 0 to n-1"]
  iLoop --> jLoop["for j from 0 to n-1"]
  jLoop --> relax["d ij = min of d ij and d ik plus d kj"]
  relax --> nextK{"k plus 1"}
  nextK -- "more k" --> kLoop
  nextK -- "done" --> check["any d vv less than 0 means a negative cycle"]`,
    },
  ],

  steps: [
    "<strong>Allocate</strong> <code>long[][] d = new long[n][n]</code>, fill with a safe infinity.",
    "<strong>Diagonal.</strong> <code>d[i][i] = 0</code> for every i.",
    "<strong>Direct edges.</strong> <code>d[u][v] = min(d[u][v], w)</code> for each edge (handle multis).",
    "<strong>Triple loop, k outermost</strong>, then i, then j. Skip additions from infinity.",
    "<strong>Negative cycle:</strong> if any <code>d[v][v] &lt; 0</code>, report it.",
    "<strong>Query</strong> is an array read. Unreachable pairs stay at infinity.",
    "<strong>Path reconstruction (optional):</strong> store <code>nxt[i][j] = k</code> when k improves the pair, or the first hop.",
  ],

  dryRun: {
    intro: "The interesting updates from the matrix walkthrough. k is the intermediate.",
    cols: ["k", "i", "j", "d[i][k]+d[k][j]", "old d[i][j]", "new"],
    rows: [
      { cells: ["1", "0", "2", "3+1=4", "inf", "4"],
        action: "0-1-2 appears.", change: true },
      { cells: ["1", "3", "2", "2+1=3", "inf", "3"],
        action: "3-1-2 appears.", change: true },
      { cells: ["2", "1", "3", "1+1=2", "inf", "2"],
        action: "1-2-3 appears.", change: true },
      { cells: ["2", "0", "3", "4+1=5", "5", "5"],
        action: "Tie with the direct edge." },
      { cells: ["3", "2", "1", "1+2=3", "inf", "3"],
        action: "2-3-1 appears.", change: true },
      { cells: ["3", "0", "1", "5+2=7", "3", "3"],
        action: "Direct 0-1 stays better." },
    ],
  },

  code: [
    { tab: "n Dijkstras", panel: "Brute", file: "AllPairsDijkstra.java",
      intro: "Correct when weights are non-negative. Shown as the alternative you should name " +
        "when n is large and the graph is sparse.",
      code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.PriorityQueue;

public class AllPairsDijkstra {
    static final long INF = (long) 1e15;

    static long[] dijkstra(List<int[]>[] g, int src) {
        int n = g.length;
        long[] dist = new long[n];
        Arrays.fill(dist, INF);
        dist[src] = 0;
        PriorityQueue<long[]> pq = new PriorityQueue<>((a, b) -> Long.compare(a[0], b[0]));
        pq.add(new long[] {0, src});
        while (!pq.isEmpty()) {
            long[] cur = pq.poll();
            int u = (int) cur[1];
            if (cur[0] != dist[u]) continue;
            for (int[] e : g[u]) {
                if (dist[u] + e[1] < dist[e[0]]) {
                    dist[e[0]] = dist[u] + e[1];
                    pq.add(new long[] {dist[e[0]], e[0]});
                }
            }
        }
        return dist;
    }

    public static void main(String[] args) {
        int n = 4;
        List<int[]>[] g = new List[n];
        for (int i = 0; i < n; i++) g[i] = new ArrayList<>();
        g[0].add(new int[] {1, 3});
        g[0].add(new int[] {3, 5});
        g[1].add(new int[] {2, 1});
        g[2].add(new int[] {3, 1});
        g[3].add(new int[] {1, 2});
        System.out.println(Arrays.toString(dijkstra(g, 0)));
    }
    // Input : graph from the dry run, src=0
    // Output: [0, 3, 4, 5]
}` },
    { tab: "Optimal", panel: "Optimal", file: "FloydWarshall.java",
      intro: "k outermost. Skip infinite endpoints so <code>INF + x</code> cannot wrap.",
      highlight: "16-22",
      code: `import java.util.Arrays;

public class FloydWarshall {
    static final long INF = (long) 1e15;

    static long[][] allPairs(int n, int[][] edges) {
        long[][] d = new long[n][n];
        for (int i = 0; i < n; i++) {
            Arrays.fill(d[i], INF);
            d[i][i] = 0;
        }
        for (int[] e : edges) d[e[0]][e[1]] = Math.min(d[e[0]][e[1]], e[2]);
        for (int k = 0; k < n; k++) {
            for (int i = 0; i < n; i++) {
                if (d[i][k] >= INF / 2) continue;
                for (int j = 0; j < n; j++) {
                    if (d[k][j] >= INF / 2) continue;
                    if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];
                }
            }
        }
        return d;
    }

    public static void main(String[] args) {
        long[][] d = allPairs(4, new int[][] {
            {0, 1, 3}, {0, 3, 5}, {1, 2, 1}, {2, 3, 1}, {3, 1, 2}
        });
        System.out.println(Arrays.toString(d[0]));
        System.out.println(d[1][3] + " " + d[2][1]);
    }
    // Input : edges of the dry-run graph
    // Output: [0, 3, 4, 5]
    //         2 3
}` },
    { tab: "Template", panel: "Template", file: "FloydReachAndNeg.java",
      intro: "Two extras you will actually need: a negative-cycle flag and a boolean closure.",
      code: `public class FloydReachAndNeg {
    static final long INF = (long) 1e15;

    static boolean hasNegCycle(long[][] d) {
        for (int v = 0; v < d.length; v++) if (d[v][v] < 0) return true;
        return false;
    }

    static boolean[][] closure(int n, int[][] edges) {
        boolean[][] r = new boolean[n][n];
        for (int i = 0; i < n; i++) r[i][i] = true;
        for (int[] e : edges) r[e[0]][e[1]] = true;
        for (int k = 0; k < n; k++)
            for (int i = 0; i < n; i++) if (r[i][k])
                for (int j = 0; j < n; j++) r[i][j] |= r[k][j];
        return r;
    }

    public static void main(String[] args) {
        boolean[][] r = closure(3, new int[][] {{0, 1}, {1, 2}});
        System.out.println(r[0][2] + " " + r[2][0]);
        System.out.println(hasNegCycle(new long[][] {{0, 1}, {-2, 0}}));
    }
    // Input : 0->1->2 reachability; then a 2-cycle of weight -1
    // Output: true false
    //         true
}` },
  ],

  complexity: {
    time: "O(n\u00b3)",
    space: "O(n\u00b2)",
    derivation: [
      "<p>Three nested loops of length n, constant work inside: " +
        "<span class=\"eq\">T = n&sup3;</span>. Space is the matrix. You can overwrite in place; " +
        "you do not need a second copy if k is outermost.</p>",
      "<p>n Dijkstra runs are <code>O(n (m + n) log n)</code> with a heap. On a dense graph " +
        "<code>m = n&sup2;</code> that is worse than Floyd by a log, and the code is longer.</p>",
    ],
    compare: [
      ["Floyd-Warshall", "O(n\u00b3)", "O(n\u00b2)", "n \u2264 400, any weights"],
      ["n \u00d7 Dijkstra", "O(n m log n)", "O(n + m)", "Sparse, non-negative"],
      ["n \u00d7 Bellman-Ford", "O(n\u00b2 m)", "O(n + m)", "Almost never"],
      ["Johnson", "O(n m + n\u00b2 log n)", "O(n + m)", "Sparse + negative, rare in interviews"],
      ["Transitive closure", "O(n\u00b3) or bitset O(n\u00b3/64)", "O(n\u00b2)", "Reachability only"],
    ],
  },

  pitfalls: [
    { title: "k not outermost",
      bug: "Writing <code>for i for j for k</code>. Some pairs then use k before k's own row " +
        "has absorbed earlier intermediates, and the DP set interpretation dies.",
      fix: "Memorise <code>for (k) for (i) for (j)</code>. k is the DP dimension." },
    { title: "Leaving the diagonal as infinity",
      bug: "No <code>d[i][i] = 0</code>, so a later <code>d[i][k] + d[k][i]</code> looks like a " +
        "self-path of two edges and the negative-cycle test is meaningless.",
      fix: "Zero the diagonal after filling infinity, before loading edges. A negative self-loop " +
        "edge will then correctly overwrite it." },
    { title: "INF + INF wrap",
      bug: "Adding two sentinels overflows a <code>long</code> and becomes a \"short\" path.",
      fix: "Skip if either side is at least <code>INF/2</code>, or use a sentinel around 1e15." },
    { title: "Undirected edges entered once",
      bug: "Loading only <code>d[u][v] = w</code> on an undirected input.",
      fix: "Write both <code>d[u][v]</code> and <code>d[v][u]</code>, taking min with what is already there." },
    { title: "Multiple edges, taking the last",
      bug: "<code>d[u][v] = w</code> overwrites a cheaper parallel edge.",
      fix: "<code>d[u][v] = Math.min(d[u][v], w)</code>." },
  ],

  variants: [
    ["Minimax / maximin path",
      "Replace + with max (or min) so the path cost is the worst (best) edge.",
      "d[i][j] = min(d[i][j], Math.max(d[i][k], d[k][j]));",
      "bottleneck path in an undirected graph"],
    ["Transitive closure",
      "Booleans and OR/AND instead of min/plus.",
      "r[i][j] |= r[i][k] && r[k][j];",
      "<a href=\"https://leetcode.com/problems/course-schedule-iv/\" target=\"_blank\" rel=\"noopener\">LC 1462</a>"],
    ["Count walks of any length \u2264 n",
      "Same loop in +/* if you want a count; or use matrix expo for exactly k steps.",
      "see matrix-exponentiation.html",
      "<a href=\"../11-math-and-number-theory/matrix-exponentiation.html\">Matrix Expo</a>"],
  ],

  followups: [
    ["How do you recover the actual path?",
      "<p>Keep <code>nxt[i][j]</code> = first hop from i toward j. When k improves i-j, set " +
        "<code>nxt[i][j] = nxt[i][k]</code>. Walk <code>i = nxt[i][j]</code> until j. If any " +
        "vertex on that walk has <code>d[v][v] &lt; 0</code>, the path is not well-defined.</p>"],
    ["Can you do better than n&sup3;?",
      "<p>In the comparison model, all-pairs shortest paths is essentially cubic. In practice, n " +
        "Dijkstras on a sparse non-negative graph are faster. Johnson's algorithm handles " +
        "negatives on sparse graphs by a Bellman-Ford potential plus n Dijkstras.</p>"],
    ["The graph has a negative cycle. Which distances are still valid?",
      "<p>d[i][j] is valid iff no vertex v with d[v][v] &lt; 0 is reachable from i and can reach " +
        "j. After Floyd, that is: if there exists v with d[i][v] &lt; INF, d[v][v] &lt; 0, " +
        "d[v][j] &lt; INF, then i-j is unbounded.</p>"],
    ["Why is this the same as Gaussian elimination?",
      "<p>Both are \"eliminate one index and substitute into every pair\". Floyd eliminates " +
        "vertex k from paths the way Gauss eliminates variable k from equations. Fun, not " +
        "needed in an interview.</p>"],
  ],

  problems: [
    { url: "https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/",
      name: "Find the City With the Smallest Number of Neighbors",
      badge: "lc", tag: "LC 1334", level: "Medium", pattern: "All-pairs then count per row" },
    { url: "https://leetcode.com/problems/evaluate-division/", name: "Evaluate Division",
      badge: "lc", tag: "LC 399", level: "Medium", pattern: "Weighted reachability; Floyd or BFS" },
    { url: "https://leetcode.com/problems/course-schedule-iv/", name: "Course Schedule IV",
      badge: "lc", tag: "LC 1462", level: "Medium", pattern: "Boolean Floyd / transitive closure" },
    { url: "https://cses.fi/problemset/task/1672", name: "Shortest Routes II",
      badge: "gfg", tag: "CSES", level: "Medium", pattern: "Undirected all-pairs, print INF as -1" },
    { url: "https://codeforces.com/problemset/problem/295/B", name: "Greg and Graph",
      badge: "cf", tag: "CF 295B", level: "Hard", pattern: "Floyd in reverse deletion order" },
    { url: "https://codeforces.com/problemset/problem/25/C", name: "Roads in Berland",
      badge: "cf", tag: "CF 25C", level: "Medium", pattern: "Add an edge, update all pairs in O(n\u00b2)" },
    { url: "https://codeforces.com/problemset/problem/33/B", name: "String Problem",
      badge: "cf", tag: "CF 33B", level: "Medium", pattern: "26-letter Floyd on change costs" },
    { url: "https://www.geeksforgeeks.org/problems/implementing-floyd-warshall2042/1",
      name: "Implementing Floyd-Warshall", badge: "gfg", tag: "GfG", level: "Medium",
      pattern: "Fill the matrix, print INF as a sentinel" },
    { url: "https://atcoder.jp/contests/abc012/tasks/abc012_4", name: "Bus",
      badge: "atc", tag: "ABC 012D", level: "Medium", pattern: "Minimise the worst-row max" },
    { url: "https://leetcode.com/problems/network-delay-time/", name: "Network Delay Time",
      badge: "lc", tag: "LC 743", level: "Medium", pattern: "Single-source; name Floyd only if n is tiny" },
  ],

  spoilers: [
    { summary: "Hint for CF 295B \u2014 Greg and Graph",
      body: "<p>Vertices are deleted one by one. Reverse the deletions: you are <em>adding</em> " +
        "vertices. Run Floyd with k ranging over the added prefix only. After each addition, " +
        "sum d[i][j] over the currently-alive pairs. That sum is the answer in reverse.</p>" },
    { summary: "Hint for CF 25C \u2014 Roads in Berland",
      body: "<p>After inserting an undirected edge (a,b,w), the only new paths use that edge at " +
        "most once. For every pair i,j: <code>d[i][j] = min(d[i][j], d[i][a]+w+d[b][j], " +
        "d[i][b]+w+d[a][j])</code>. O(n&sup2;) per insertion, not a full restart.</p>" },
  ],

  recap: {
    bullets: [
      "<strong>k outermost</strong> is the algorithm. i and j just name the pair.",
      "<strong>d[i][i] = 0</strong>, then load edges with min, then the triple loop.",
      "<strong>d[v][v] &lt; 0</strong> means a negative cycle exists somewhere.",
      "<strong>n \u2264 400</strong> is the constraint tell. Larger n wants n Dijkstras.",
      "<strong>The same nest is a closure</strong> if you switch to booleans.",
    ],
    oneliner: "for(k=0;k<n;k++) for(i=0;i<n;i++) for(j=0;j<n;j++) d[i][j]=min(d[i][j], d[i][k]+d[k][j]);",
  },
},

/* =========================================== 3. mst-kruskal-prim ========== */
{
  id: "mst-kruskal-prim",
  difficulty: "Medium",
  readTime: "24 min",
  tagline: "A minimum spanning tree is any subset of edges that connects the graph at minimum " +
    "total weight &mdash; Kruskal grows it by cheapest legal edge, Prim grows it by cheapest " +
    "outgoing edge.",
  tags: ["MST", "DSU", "greedy", "P1"],
  prereqs: [
    ["Disjoint Set Union", "../06-range-queries/dsu.html"],
    ["Heaps & Priority Queue", "../03-linear-structures/heaps-and-priority-queue.html"],
  ],

  why: {
    paras: [
      "Connect n cities at minimum cable cost, build a redundant-free backbone, or prove a " +
        "cut is cheap: those are MST problems. The structure is unique in cost (not always in " +
        "shape), and both classic algorithms are greedy with a one-line exchange proof.",
      "Kruskal sorts every edge and adds it if its ends are in different DSU components. Prim " +
        "is Dijkstra with a different relaxation: the key of a vertex is the cheapest edge " +
        "that would attach it to the growing tree. Same answer, different graphs they like.",
      "Interview follow-ups are the real content: second-best MST, critical edges, MST with a " +
        "forced edge, minimax path (the max edge on the unique MST path). All of them start " +
        "from this page.",
    ],
    insight: "The cut property: for any partition of the vertices, the cheapest edge that " +
      "crosses the cut is in some MST. Kruskal and Prim just pick a convenient cut each step.",
  },

  recognise: {
    yes: [
      "\"Connect all nodes at minimum cost\" on an undirected weighted graph",
      "Minimise the <em>maximum</em> edge on a path (minimax) &mdash; that edge lives on the MST",
      "Critical / pseudo-critical edges of an MST (LC 1489)",
      "Add the fewest edges so the graph becomes connected, with costs",
      "A spanning tree is asked for explicitly, or \"backbone\" / \"cables\" / \"roads\"",
    ],
    no: [
      "Directed graph &rarr; arborescence / Edmonds, not Kruskal",
      "Shortest path from s to t &rarr; Dijkstra, the MST path is not a shortest path",
      "Need a Steiner tree (only a subset must be connected) &rarr; different problem, NP-hard",
      "Capacities and a source/sink &rarr; max flow, not MST",
    ],
    table: [
      ["Undirected, connect all, min sum", "Greedy by weight + cut property", "Kruskal or Prim"],
      ["Dense: m ~ n\u00b2", "Prim with a linear scan, O(n\u00b2)", "Prim"],
      ["Sparse: m ~ n", "Kruskal + DSU", "Kruskal"],
      ["Minimise the worst edge s-t", "That edge is on the MST path s-t", "Kruskal, stop when s,t unite"],
      ["Which edges are in every MST", "Force / forbid the edge and recompute", "LC 1489"],
      ["<strong>Confused with:</strong> shortest-path tree",
        "Dijkstra tree minimises distances from s, not total weight",
        "Different objective, different tree"],
    ],
    constraint: "<code>n &le; 10&#8309;</code>, <code>m &le; 2&times;10&#8309;</code> &rarr; " +
      "Kruskal <code>O(m log m)</code>. Dense n &le; 2000 &rarr; Prim <code>O(n&sup2;)</code> " +
      "without a heap.",
  },

  core: {
    paras: [
      "Kruskal: sort edges by weight. Scan. If <code>find(u) != find(v)</code>, unite and add " +
        "the edge. Stop at n-1 edges or report disconnected. The DSU is the whole data structure.",
      "Prim: start at any vertex. A min-heap stores (cheapest-attach-edge, vertex). Pop, skip if " +
        "already in the tree, otherwise add and push all edges to outsiders. Identical to " +
        "Dijkstra except the key is the edge weight, not dist[u] + w.",
    ],
    invariant: "<p><em>The forest built so far is a subset of some MST.</em> That is the " +
      "interview sentence. The cut property plus an exchange argument proves you never paint " +
      "yourself into a corner: if the greedy edge is not in this MST, swap it for the MST edge " +
      "that crosses the same cut.</p>",
    extra: [
      { kind: "key", title: "Kruskal vs Prim, pick in ten seconds",
        html: "<p>Need the edges in order / offline / \"for each edge, is it in an MST\"? " +
          "Kruskal. Dense adjacency matrix? Prim <code>O(n&sup2;)</code>. Already have a " +
          "neighbour list and a heap template? Prim. Directed? Neither.</p>" },
    ],
  },

  visuals: [
    {
      kind: "array", vizId: "kruskalEdges",
      h3: "Kruskal adding the cheapest legal edges",
      intro: "Edges already sorted by weight: (0-1:1), (1-2:2), (0-2:3), (2-3:4), (1-3:5). " +
        "Cells hold the edge weight. Red is a rejected cycle-maker.",
      caption: "The third edge 0-2 is refused: 0 and 2 are already in one component. The MST " +
        "weight is 1+2+4 = 7.",
      data: {
        label: "edge weight in sorted order",
        array: [1, 2, 3, 4, 5],
        indexLabels: ["0-1", "1-2", "0-2", "2-3", "1-3"],
        vars: ["edge", "find u,v", "action", "cost"],
        speed: 1000,
        frames: [
          { note: "Start. Five edges, four vertices, DSU all singletons. Need 3 tree edges.",
            dim: [0, 1, 2, 3, 4],
            values: { edge: "\u2014", "find u,v": "all distinct", action: "init", cost: 0 } },
          { note: "Take 0-1 weight 1. Different components. Unite 0 and 1. cost = 1.",
            active: [0], dim: [1, 2, 3, 4],
            values: { edge: "0-1", "find u,v": "0, 1", action: "add", cost: 1 } },
          { note: "Take 1-2 weight 2. 1 is with 0, 2 is alone. Unite. cost = 3.",
            active: [1], done: [0], dim: [2, 3, 4],
            values: { edge: "1-2", "find u,v": "0, 2", action: "add", cost: 3 } },
          { note: "Take 0-2 weight 3. Both already find to 0. Cycle. Skip.",
            x: [2], done: [0, 1], dim: [3, 4],
            values: { edge: "0-2", "find u,v": "0, 0", action: "skip cycle", cost: 3 } },
          { note: "Take 2-3 weight 4. 2 is in {0,1,2}, 3 is new. Unite. 3 edges: done.",
            active: [3], done: [0, 1], x: [2], dim: [4],
            values: { edge: "2-3", "find u,v": "0, 3", action: "add, n-1 edges", cost: 7 } },
          { note: "1-3 is unused. MST edges are 0-1, 1-2, 2-3. Total 7. The skipped 0-2 was the cycle closer.",
            done: [0, 1, 3], x: [2], dim: [4],
            values: { edge: "done", "find u,v": "one component", action: "MST", cost: 7 } },
        ],
      },
    },
    {
      kind: "mermaid", vizId: "mstCut",
      h3: "The cut property on this graph",
      caption: "After {0,1} is grown, the cheapest edge leaving the set is 1-2 weight 2. It " +
        "must sit in some MST. Prim would pick it next; Kruskal already did.",
      src: `graph LR
  nodeZ["0"] ---|"1"| nodeA["1"]
  nodeA ---|"2"| nodeB["2"]
  nodeZ ---|"3"| nodeB
  nodeB ---|"4"| nodeC["3"]
  nodeA ---|"5"| nodeC`,
    },
  ],

  steps: [
    "<strong>Kruskal.</strong> Put edges in an array of <code>int[]{u,v,w}</code>. Sort by w.",
    "<strong>DSU.</strong> <code>find</code> / <code>unite</code> with union by size and path compression.",
    "<strong>Scan.</strong> If <code>find(u) != find(v)</code>, unite, add w to the answer, count++.",
    "<strong>Disconnected?</strong> After the scan, count != n-1 means no spanning tree.",
    "<strong>Prim alternative.</strong> Heap of (w, v, parent). Mark inTree on pop. Push neighbours.",
    "<strong>Dense Prim.</strong> Drop the heap: scan the n keys in O(n) per added vertex, O(n&sup2;) total.",
    "<strong>Record the edges</strong> if the problem wants the tree, not only the cost.",
  ],

  dryRun: {
    intro: "Kruskal on the five-edge graph. DSU parents after each accepted edge.",
    cols: ["w", "u-v", "find u", "find v", "decision", "parent"],
    rows: [
      { cells: ["1", "0-1", "0", "1", "unite", "[0,0,2,3]"],
        action: "First edge.", change: true },
      { cells: ["2", "1-2", "0", "2", "unite", "[0,0,0,3]"],
        action: "Grows the tree to 2.", change: true },
      { cells: ["3", "0-2", "0", "0", "skip", "[0,0,0,3]"],
        action: "Same component." },
      { cells: ["4", "2-3", "0", "3", "unite", "[0,0,0,0]"],
        action: "Last vertex. MST complete.", change: true },
      { cells: ["5", "1-3", "0", "0", "unused", "[0,0,0,0]"],
        action: "Already finished." },
    ],
  },

  code: [
    { tab: "Brute spanning trees", panel: "Brute", file: "MstBrute.java",
      intro: "Enumerate subsets of n-1 edges and test connectivity. Only for n &le; 8 lectures.",
      code: `import java.util.ArrayList;
import java.util.List;

public class MstBrute {
    static int find(int[] p, int x) {
        return p[x] == x ? x : (p[x] = find(p, p[x]));
    }

    static int costIfTree(int n, int[][] edges, int mask) {
        if (Integer.bitCount(mask) != n - 1) return Integer.MAX_VALUE;
        int[] p = new int[n];
        for (int i = 0; i < n; i++) p[i] = i;
        int cost = 0, used = 0;
        for (int i = 0; i < edges.length; i++) if (((mask >> i) & 1) == 1) {
            int a = find(p, edges[i][0]), b = find(p, edges[i][1]);
            if (a == b) return Integer.MAX_VALUE;
            p[a] = b;
            cost += edges[i][2];
            used++;
        }
        return used == n - 1 ? cost : Integer.MAX_VALUE;
    }

    public static void main(String[] args) {
        int[][] e = {{0,1,1},{1,2,2},{0,2,3},{2,3,4},{1,3,5}};
        int best = Integer.MAX_VALUE;
        for (int m = 0; m < (1 << e.length); m++) best = Math.min(best, costIfTree(4, e, m));
        System.out.println(best);
    }
    // Input : 4 vertices, 5 edges of the dry run
    // Output: 7
}` },
    { tab: "Optimal Kruskal", panel: "Optimal", file: "Kruskal.java",
      intro: "Sort + DSU. This is the default you write in a contest.",
      highlight: "24-30",
      code: `import java.util.Arrays;

public class Kruskal {
    static int[] p, sz;

    static int find(int x) { return p[x] == x ? x : (p[x] = find(p[x])); }

    static boolean unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (sz[a] < sz[b]) { int t = a; a = b; b = t; }
        p[b] = a;
        sz[a] += sz[b];
        return true;
    }

    static long mst(int n, int[][] edges) {
        p = new int[n];
        sz = new int[n];
        for (int i = 0; i < n; i++) { p[i] = i; sz[i] = 1; }
        Arrays.sort(edges, (x, y) -> Integer.compare(x[2], y[2]));
        long cost = 0;
        int used = 0;
        for (int[] e : edges) if (unite(e[0], e[1])) {
            cost += e[2];
            if (++used == n - 1) return cost;
        }
        return -1;
    }

    public static void main(String[] args) {
        System.out.println(mst(4, new int[][] {
            {0, 1, 1}, {1, 2, 2}, {0, 2, 3}, {2, 3, 4}, {1, 3, 5}
        }));
    }
    // Input : dry-run graph
    // Output: 7
}` },
    { tab: "Template Prim", panel: "Template", file: "Prim.java",
      intro: "Heap Prim. The key is the attaching edge, not a path sum. Skip stale heap entries.",
      code: `import java.util.ArrayList;
import java.util.List;
import java.util.PriorityQueue;

public class Prim {
    static long mst(List<int[]>[] g) {
        int n = g.length;
        boolean[] in = new boolean[n];
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
        pq.add(new int[] {0, 0});
        long cost = 0;
        int taken = 0;
        while (!pq.isEmpty() && taken < n) {
            int[] cur = pq.poll();
            int w = cur[0], u = cur[1];
            if (in[u]) continue;
            in[u] = true;
            cost += w;
            taken++;
            for (int[] e : g[u]) if (!in[e[0]]) pq.add(new int[] {e[1], e[0]});
        }
        return taken == n ? cost : -1;
    }

    public static void main(String[] args) {
        List<int[]>[] g = new List[4];
        for (int i = 0; i < 4; i++) g[i] = new ArrayList<>();
        int[][] e = {{0,1,1},{1,2,2},{0,2,3},{2,3,4},{1,3,5}};
        for (int[] x : e) {
            g[x[0]].add(new int[] {x[1], x[2]});
            g[x[1]].add(new int[] {x[0], x[2]});
        }
        System.out.println(mst(g));
    }
    // Input : same undirected graph
    // Output: 7
}` },
  ],

  complexity: {
    time: "Kruskal O(m log m); Prim O(m log n) heap / O(n\u00b2) dense",
    space: "O(n + m)",
    derivation: [
      "<p>Kruskal is dominated by the sort: <span class=\"eq\">O(m log m)</span>. DSU is " +
        "effectively O(m). Prim with a binary heap is the Dijkstra bound " +
        "<code>O(m log n)</code>. Dense Prim keeps an <code>int[n]</code> of keys and scans it, " +
        "<code>O(n&sup2;)</code>, no log.</p>",
    ],
    compare: [
      ["Kruskal + DSU", "O(m log m)", "O(n + m)", "Sparse default"],
      ["Heap Prim", "O(m log n)", "O(n + m)", "When you already have adj lists"],
      ["Dense Prim", "O(n\u00b2)", "O(n\u00b2)", "Adjacency matrix, n \u2264 2000"],
      ["Subset enum", "O(2^m n)", "O(n)", "n \u2264 8 only"],
      ["Bor\u016fvka", "O(m log n)", "O(n + m)", "Nice for parallel; rarely asked"],
    ],
  },

  pitfalls: [
    { title: "Treating the MST path as a shortest path",
      bug: "Answering s-t distance with the unique MST path. Counterexample: a triangle 1, 100, 100.",
      fix: "MST minimises the <em>sum of used edges</em>, not s-t distance. Use Dijkstra for distances." },
    { title: "Directed input",
      bug: "Running Kruskal on a one-way road graph. The DSU still unites, the \"tree\" ignores direction.",
      fix: "MST is defined for undirected graphs. Directed minimum spanning arborescence is Edmonds." },
    { title: "Not checking connectivity",
      bug: "Returning the sum of every added edge when the graph had three components.",
      fix: "Count unites. Need exactly n-1. Otherwise return -1 / \"IMPOSSIBLE\"." },
    { title: "1-based vertices and a size-n DSU",
      bug: "Vertices labelled 1..n stored in <code>p[n]</code>, so vertex n is out of bounds.",
      fix: "Allocate n+1 or decrement labels once at input." },
    { title: "Prim using dist[u]+w as the key",
      bug: "Copy-pasting Dijkstra. That builds a shortest-path tree, not an MST.",
      fix: "The heap key is the raw edge weight to the tree, never a path sum." },
  ],

  variants: [
    ["Second-best MST",
      "Build the MST, then for every unused edge uv try replacing the max edge on the MST path u-v.",
      "precompute maxEdgeOnPath via binary lifting; ans = min(mst - max + w(uv))",
      "<a href=\"https://codeforces.com/problemset/problem/609/E\" target=\"_blank\" rel=\"noopener\">CF 609E</a>"],
    ["Critical edges",
      "An edge is critical if MST without it is worse (or disconnected).",
      "forbid e, recompute; or count how many edges of that weight were available vs used",
      "<a href=\"https://leetcode.com/problems/find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree/\" target=\"_blank\" rel=\"noopener\">LC 1489</a>"],
    ["Minimax s-t path",
      "The minimum possible bottleneck equals the max edge on the MST path s-t.",
      "Kruskal until find(s)==find(t); the last added weight is the answer",
      "offline queries: sort queries with Kruskal"],
  ],

  followups: [
    ["Prove the cut property in two sentences.",
      "<p>Take a cheapest crossing edge e. If some MST T misses e, T plus e has a cycle which " +
        "crosses the cut again, say at f. w(e) \u2264 w(f), so T - f + e is an MST that contains e.</p>"],
    ["The graph has negative weights.",
      "<p>Both algorithms still work. There are no cycles in a tree, so a negative edge is just " +
        "a cheap edge you are happy to take. Do not take absolute values.</p>"],
    ["Online: edges arrive one by one, maintain MST cost.",
      "<p>The new edge uv is useful only if it is cheaper than the max edge on the current MST " +
        "path u-v. Delete that max (link-cut or rebuild for n \u2264 1000) and insert uv.</p>"],
    ["Maximum spanning tree?",
      "<p>Negate weights, or sort Kruskal descending. Same code. Useful for maximising a " +
        "bottleneck or for some XOR / product tricks.</p>"],
  ],

  problems: [
    { url: "https://leetcode.com/problems/min-cost-to-connect-all-points/", name: "Min Cost to Connect All Points",
      badge: "lc", tag: "LC 1584", level: "Medium", pattern: "Complete graph on points; Prim or Kruskal" },
    { url: "https://leetcode.com/problems/connecting-cities-with-minimum-cost/", name: "Connecting Cities With Minimum Cost",
      badge: "lc", tag: "LC 1135", level: "Medium", pattern: "Straight Kruskal, check n-1" },
    { url: "https://leetcode.com/problems/optimize-water-distribution-in-a-village/", name: "Optimize Water Distribution",
      badge: "lc", tag: "LC 1168", level: "Hard", pattern: "Virtual node 0 for wells, then MST" },
    { url: "https://leetcode.com/problems/find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree/",
      name: "Critical and Pseudo-Critical Edges",
      badge: "lc", tag: "LC 1489", level: "Hard", pattern: "Force / forbid each edge" },
    { url: "https://cses.fi/problemset/task/1675", name: "Road Reparation",
      badge: "gfg", tag: "CSES", level: "Medium", pattern: "Kruskal, IMPOSSIBLE if disconnected" },
    { url: "https://codeforces.com/problemset/problem/1245/D", name: "Shichikuji and Power Grid",
      badge: "cf", tag: "CF 1245D", level: "Hard", pattern: "Virtual node for power stations" },
    { url: "https://codeforces.com/problemset/problem/609/E", name: "Minimum spanning tree for each edge",
      badge: "cf", tag: "CF 609E", level: "Hard", pattern: "MST + max-on-path for every edge" },
    { url: "https://www.geeksforgeeks.org/problems/minimum-spanning-tree/1", name: "Minimum Spanning Tree",
      badge: "gfg", tag: "GfG", level: "Medium", pattern: "Implement Kruskal or Prim" },
    { url: "https://atcoder.jp/contests/abc218/tasks/abc218_e", name: "Destruction",
      badge: "atc", tag: "ABC 218E", level: "Medium", pattern: "Sum of edges you can delete and stay connected" },
    { url: "https://cses.fi/problemset/task/1676", name: "Road Construction",
      badge: "gfg", tag: "CSES", level: "Medium", pattern: "DSU online, not a full MST" },
  ],

  spoilers: [
    { summary: "Hint for LC 1168 \u2014 wells as a virtual node",
      body: "<p>Building a well in city i is an edge from a dummy node 0 to i of cost " +
        "<code>wells[i]</code>. Pipes are ordinary edges. The MST of this n+1 vertex graph is " +
        "the cheapest way to give every city a water source.</p>" },
    { summary: "Hint for CF 609E",
      body: "<p>Compute one MST. For an MST edge the answer is the MST cost. For a non-tree " +
        "edge uv, replacing the heaviest edge on the tree path u-v with uv gives the best MST " +
        "that is forced to use uv. Binary-lift the max edge.</p>" },
  ],

  recap: {
    bullets: [
      "<strong>Cut property:</strong> cheapest edge across any cut sits in some MST.",
      "<strong>Kruskal</strong> = sort + DSU. <strong>Prim</strong> = Dijkstra with edge-weight keys.",
      "<strong>Need n-1 edges</strong> or the graph is disconnected.",
      "<strong>MST path is not a shortest path</strong>, but it is a minimax path.",
      "<strong>Virtual-node trick</strong> models \"build a facility here\" as an edge to 0.",
    ],
    oneliner: "sort(edges by w); for(e:edges) if(unite(u,v)) { cost+=w; if(++used==n-1) break; }",
  },
},
];


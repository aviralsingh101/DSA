/* Module 08 — Graphs: Advanced */
import { pack, lc, cf } from "./pack.mjs";

export const topics = [

/* ============================== 1. bellman-ford ======================= */
pack({
  id: "bellman-ford-and-negative-cycles",
  difficulty: "Medium",
  readTime: "22 min",
  tagline: "Relax every edge <code>n-1</code> times. A successful relaxation on the n-th pass is a negative cycle that can reach the target.",
  tags: ["Bellman-Ford", "negative cycle", "shortest path", "P1"],
  prereqs: [["Dijkstra's Algorithm", "../07-graphs-core/dijkstra.html"]],
  why: [
    "Dijkstra assumes non-negative weights. One negative edge and the extracted-min order is a lie. Bellman-Ford only assumes there is no negative cycle on the path you care about, and it <em>detects</em> the ones that exist.",
    "The algorithm is the definition of a shortest path of at most <code>k</code> edges: after <code>i</code> full relax passes, <code>dist[v]</code> is the cheapest walk from the source that uses at most <code>i</code> edges. A simple path has at most <code>n-1</code> edges, so <code>n-1</code> passes suffice. A cheap n-th relaxation means a cycle with negative total weight.",
    "Interview and contest uses: \"cheapest flights with at most k stops\" is Bellman-Ford stopped early; \"can I make money forever on these exchange rates\" is a negative cycle on <code>-log(rate)</code>.",
  ],
  insight: "After i relax-all-edges passes, dist is exact for paths of at most i edges. One more success on pass n is a negative cycle, not a longer simple path.",
  yes: [
    "Directed (or undirected) graph with negative weights, single source",
    "Detect whether a negative cycle exists, or can reach a given node",
    "\"At most k edges / k stops\" — stop after k relax passes",
    "Arbitrage / exchange rates (negate the log of the rate)",
    "n is a few thousand, m a few thousand — O(nm) fits",
  ],
  no: [
    "Non-negative weights and you need speed &rarr; Dijkstra",
    "All-pairs on a dense graph of n <= 400 &rarr; Floyd-Warshall",
    "0-1 weights &rarr; 0-1 BFS",
    "You only need a spanning tree &rarr; MST, not shortest paths",
  ],
  table: [
    ["Negative weights, single source", "Relax all edges n-1 times", "Bellman-Ford"],
    ["Negative cycle detect / reach", "One more pass; walk parents", "SPFA / BF + extra pass"],
    ["At most k edges", "Stop after k passes", "LC 787"],
    ["Non-negative, sparse", "Faster", "Dijkstra"],
    ["All-pairs, n <= 400", "Dense DP", "Floyd-Warshall"],
    ["<strong>Confused with:</strong> Dijkstra with a decrease-key skip", "Skipping stale heap entries does not make Dijkstra correct on negatives", "Use BF"],
  ],
  constraint: "<code>n &le; 2&times;10&#179;</code>, <code>m &le; 5&times;10&#179;</code> is the O(nm) window. Distances need <code>long</code>: n * |w| can hit 1e14. Undirected negative edges are already a negative cycle of length 2.",
  core: [
    "Store an edge list. <code>dist[src] = 0</code>, rest INF. Repeat n-1 times: for every edge <code>u\to v</code> of weight w, if <code>dist[u]</code> is finite and <code>dist[u]+w &lt; dist[v]</code>, write the new distance and <code>par[v] = u</code>.",
    "Nth pass: any successful relax is a node on (or reachable from) a negative cycle. To recover the cycle, walk parent pointers n times from that node to enter the cycle, then walk once more to print it. To mark every node that can be driven to -INF, BFS/DFS from all nth-pass victims along the graph (or the reverse graph, depending on the question).",
  ],
  invariant: "<p>After pass i, <code>dist[v]</code> equals the minimum weight of a walk from the source to v that uses at most i edges, or INF if none exists. A simple path cannot need more than n-1 edges, so pass n-1 is exact in a graph with no negative cycle on that path.</p>",
  array: [0, 5, 2, 6],
  arrayLabel: "dist =",
  indexLabels: ["0", "1", "2", "3"],
  vars: ["pass", "edge", "dist"],
  frames: [
    { note: "Edges: 0\to1 w=5, 0\to2 w=4, 2\to1 w=-2, 1\to3 w=1, 2\to3 w=3. src=0. dist=[0,inf,inf,inf].",
      active: [0], values: { pass: 0, edge: "init", dist: "0,inf,inf,inf" } },
    { note: "Pass 1: relax 0\to1 \u2192 dist[1]=5; 0\to2 \u2192 dist[2]=4.",
      active: [1, 2], values: { pass: 1, edge: "0-1, 0-2", dist: "0,5,4,inf" } },
    { note: "Still pass 1: 2\to1 improves 5 to 2. 1\to3 sets dist[3]=6. 2\to3 would be 7, worse.",
      active: [1, 3], values: { pass: 1, edge: "2-1, 1-3", dist: "0,2,4,3" } },
    { note: "Wait: 1\to3 after dist[1]=2 gives dist[3]=3. Array is [0,2,4,3].",
      active: [3], values: { pass: 1, edge: "1-3 again", dist: "0,2,4,3" } },
    { note: "Pass 2: 2\to1 already 2; 1\to3 already 3. No change. Passes 3 have nothing to do.",
      active: [0, 1, 2, 3], values: { pass: 2, edge: "none", dist: "0,2,4,3" } },
    { note: "Pass n=4 finds no improvement: no negative cycle reachable from 0.",
      active: [0], values: { pass: 4, edge: "detect", dist: "stable" } },
  ],
  mermaid: `graph LR
  n0["0"] -->|"5"| n1["1"]
  n0 -->|"4"| n2["2"]
  n2 -->|"-2"| n1
  n1 -->|"1"| n3["3"]
  n2 -->|"3"| n3`,
  steps: [
    "<strong>dist[src] = 0</strong>, others INF, parent = -1.",
    "<strong>Repeat n-1 times:</strong> for every edge, relax <code>dist[v] = min(dist[v], dist[u]+w)</code> when dist[u] is finite.",
    "<strong>Optional early exit</strong> if a pass changes nothing.",
    "<strong>Nth pass:</strong> collect every vertex whose distance still drops.",
    "<strong>Cycle recover:</strong> from any victim walk parent n times, then walk until repeat.",
    "<strong>-INF reach:</strong> flood from those victims (forward or reverse, as the question asks).",
  ],
  code: [
    { tab: "Brute", file: "BellmanFordBrute.java",
      code: `import java.util.Arrays;
public class BellmanFordBrute {
    static long[] bf(int n, int[][] edges, int src) {
        long[] d = new long[n];
        Arrays.fill(d, Long.MAX_VALUE / 4);
        d[src] = 0;
        for (int i = 0; i < n - 1; i++)
            for (int[] e : edges)
                if (d[e[0]] + e[2] < d[e[1]]) d[e[1]] = d[e[0]] + e[2];
        return d;
    }
    public static void main(String[] args) {
        int[][] e = {{0,1,5},{0,2,4},{2,1,-2},{1,3,1},{2,3,3}};
        System.out.println(Arrays.toString(bf(4, e, 0)));
    }
    // Input : 4 nodes, edges as above, src 0
    // Output: [0, 2, 4, 3]
}` },
    { tab: "Optimal", file: "BellmanFord.java",
      code: `import java.util.*;
public class BellmanFord {
    static boolean hasNegCycle(int n, int[][] edges, int src) {
        long[] d = new long[n];
        Arrays.fill(d, Long.MAX_VALUE / 4);
        d[src] = 0;
        for (int i = 0; i < n - 1; i++)
            for (int[] e : edges)
                if (d[e[0]] + (long) e[2] < d[e[1]]) d[e[1]] = d[e[0]] + e[2];
        for (int[] e : edges)
            if (d[e[0]] + (long) e[2] < d[e[1]]) return true;
        return false;
    }
    public static void main(String[] args) {
        int[][] e = {{0,1,5},{0,2,4},{2,1,-2},{1,3,1},{2,3,3}};
        System.out.println(hasNegCycle(4, e, 0));
        int[][] cyc = {{0,1,1},{1,2,-3},{2,0,1},{0,3,4}};
        System.out.println(hasNegCycle(4, cyc, 0));
    }
    // Input : first graph no cycle; second 0-1-2-0 weight -1
    // Output: false
    //         true
}` },
    { tab: "Template", file: "KStops.java",
      code: `import java.util.Arrays;
public class KStops {
    static int cheapest(int n, int[][] flights, int src, int dst, int k) {
        long[] d = new long[n];
        Arrays.fill(d, Long.MAX_VALUE / 4);
        d[src] = 0;
        for (int i = 0; i <= k; i++) {
            long[] nd = d.clone();
            for (int[] e : flights)
                if (d[e[0]] + e[2] < nd[e[1]]) nd[e[1]] = d[e[0]] + e[2];
            d = nd;
        }
        return d[dst] >= Long.MAX_VALUE / 8 ? -1 : (int) d[dst];
    }
    public static void main(String[] args) {
        int[][] f = {{0,1,100},{1,2,100},{0,2,500}};
        System.out.println(cheapest(3, f, 0, 2, 1));
    }
    // Input : flights 0-1 100, 1-2 100, 0-2 500; k=1
    // Output: 200
}` },
  ],
  complexity: {
    time: "O(n m)",
    space: "O(n + m)",
    derivation: [
      "<p>n-1 passes, each scans m edges, so <code>O(nm)</code>. SPFA is faster on random graphs and worst-case exponential — do not use it when an adversary exists unless you have a queue-count cutoff that falls back to BF.</p>",
    ],
    compare: [
      ["Bellman-Ford", "O(nm)", "O(n)", "Negatives, cycle detect"],
      ["Dijkstra", "O(m log n)", "O(n)", "Non-negative only"],
      ["0-1 BFS", "O(n+m)", "O(n)", "Weights 0/1"],
      ["Floyd-Warshall", "O(n^3)", "O(n^2)", "All-pairs, n<=400"],
    ],
  },
  pitfalls: [
    { title: "Relaxing from INF",
      bug: "<code>INF + negative</code> becomes a finite junk distance and \"reaches\" a node that the source cannot.",
      fix: "Only relax when <code>dist[u]</code> is finite." },
    { title: "int overflow",
      bug: "<code>n * |w|</code> exceeds Integer.MAX_VALUE and a real shortest path looks like a negative cycle.",
      fix: "<code>long[] dist</code>. Sentinel <code>Long.MAX_VALUE/4</code> so additions do not overflow." },
    { title: "Nth-pass victim is not on the cycle",
      bug: "It is only reachable <em>from</em> the cycle. Walking parents once may stop at a tree edge.",
      fix: "Walk parent n times first to land on the cycle, then walk until you repeat." },
    { title: "Undirected negative edge",
      bug: "Storing both directions of a negative edge is a 2-cycle of negative weight.",
      fix: "Undirected negatives are almost always a modelling error. Confirm the statement." },
    { title: "In-place relax for \"at most k edges\"",
      bug: "Using one array lets a pass use a distance written earlier in the same pass, which is a path of more than one extra edge.",
      fix: "Clone <code>dist</code> each pass (LC 787)." },
  ],
  variants: [
    ["k stops", "Exactly k extra edges: k+1 passes, two arrays.", "LC 787", "cheapest flights"],
    ["SPFA", "Queue only vertices that improved. Fast typical, worst-case exponential.", "cutoff visits > n", "use with care"],
    ["Arbitrage", "Edge weight = -log(rate). A negative cycle is a profitable loop.", "print the cycle", "CF 15D-ish"],
  ],
  followups: [
    ["Why n-1, not n?",
      "<p>A simple path has at most n-1 edges. If a cheaper walk uses n edges it repeats a vertex, hence contains a cycle, hence (if it is cheaper) a negative cycle.</p>"],
    ["Does BF work on undirected graphs?",
      "<p>Yes if every weight is non-negative. A single negative undirected edge is a negative cycle. Model the graph as directed with both orientations only when weights are \u2265 0.</p>"],
    ["How do you list every node that can be driven to -INF?",
      "<p>After the nth pass, the victims are nodes that improved. DFS/BFS forward from them (and, if the question is \"source can cheat to reach t\", also require they are reachable from the source).</p>"],
    ["Bellman-Ford vs Dijkstra with potentials?",
      "<p>Johnson's algorithm runs BF once from a dummy source to compute potentials, then Dijkstra with non-negative reduced costs for every source. That is the all-pairs algorithm when n is too big for Floyd and weights can be negative but there is no negative cycle.</p>"],
  ],
  problems: [
    lc("787", "cheapest-flights-within-k-stops", "Medium", "BF with k passes"),
    lc("743", "network-delay-time", "Medium", "Dijkstra usually; BF also works"),
    cf("20C", "Dijkstra?", "Medium", "Non-negative; parent recover"),
    cf("449B", "Jzzhu and Cities", "Medium", "Shortest paths + extra train edges"),
    { url: "https://codeforces.com/problemset/problem/1213/G", name: "Path Queries", badge: "cf", tag: "CF 1213G", level: "Medium", pattern: "Offline MST, not BF — contrast" },
    { url: "https://leetcode.com/problems/path-with-minimum-effort/", name: "Path With Minimum Effort", badge: "lc", tag: "LC 1631", level: "Medium", pattern: "Dijkstra / 0-1 thinking" },
    { url: "https://cses.fi/problemset/task/1197", name: "Cycle Finding", badge: "gfg", tag: "CSES", level: "Medium", pattern: "Recover a negative cycle" },
    { url: "https://cses.fi/problemset/task/1673", name: "High Score", badge: "gfg", tag: "CSES", level: "Hard", pattern: "Negate weights, -INF reach" },
  ],
  recap: [
    "Relax all edges n-1 times; dist is then exact for simple paths.",
    "A success on pass n is a negative cycle.",
    "Do not relax from INF.",
    "k-stop problems use a cloned array per pass.",
    "Walk parent n times before printing the cycle.",
  ],
  oneliner: "for n-1 passes: for each edge relax dist[v] with dist[u]+w; one more success => neg cycle;",
}),

/* ============================== 2. floyd-warshall ===================== */
pack({
  id: "floyd-warshall",
  difficulty: "Medium",
  readTime: "20 min",
  tagline: "The triple loop <code>for k, for i, for j</code> is \"allow vertex k as an intermediate\". After k = 0..n-1 every pair is optimal.",
  tags: ["Floyd-Warshall", "all-pairs", "APSP", "P1"],
  prereqs: [["Bellman-Ford & Negative Cycles", "bellman-ford-and-negative-cycles.html"]],
  why: [
    "n single-source Dijkstras are fine on sparse non-negative graphs. When n is a few hundred, the graph is dense, or you need the whole distance matrix (transitive closure, \"best meeting city\", \"minimax path\"), one <code>O(n&sup3;)</code> pass is simpler and faster.",
    "The recurrence is shortest path whose intermediate vertices all lie in <code>{0..k}</code>. Fixing k as the newly allowed intermediate and trying it on every pair is exactly the update <code>d[i][j] = min(d[i][j], d[i][k]+d[k][j])</code>.",
    "The same skeleton computes reachability (OR instead of min-plus), minimax (min of max-edge), and detects a negative cycle on the diagonal <code>d[i][i] &lt; 0</code>.",
  ],
  insight: "k is not \"the current source\". k is the highest-index vertex you are now allowed to use as an intermediate. The loop order is k, then i, then j — always.",
  yes: [
    "All-pairs shortest paths, n <= 400",
    "Transitive closure / reachability matrix",
    "\"Smallest max-edge on a path\" (minimax) between every pair",
    "Negative cycle anywhere in the graph (some d[i][i] < 0)",
    "You need d[u][v] after adding vertices one by one (CF 295B)",
  ],
  no: [
    "Single source, sparse, non-negative &rarr; Dijkstra",
    "n = 2000 &rarr; n Dijkstras or Johnson, not n^3",
    "Only reachability on a DAG &rarr; DFS / topo",
    "Negative cycle on an undirected graph with a negative edge — already yes, no algorithm needed",
  ],
  table: [
    ["All-pairs, n<=400", "Triple loop", "Floyd-Warshall"],
    ["Reachability", "d[i][j] |= d[i][k] && d[k][j]", "Transitive closure"],
    ["Minimax path", "min(d[i][j], max(d[i][k], d[k][j]))", "Same skeleton"],
    ["Add vertices in reverse", "Run k from n-1 down to 0", "CF 295B"],
    ["Single source sparse", "Wrong complexity", "Dijkstra / BF"],
    ["<strong>Confused with:</strong> matrix exponentiation of adj", "That counts walks of length exactly K, not shortest paths", "matpow on (min,+) is Floyd in log if you want length <= 2^p"],
  ],
  constraint: "<code>n &le; 400</code> is the Floyd signature (64 million operations). Use <code>long</code> and a sentinel that will not overflow when added.",
  core: [
    "Initialise <code>d[i][i] = 0</code>, <code>d[u][v] = w</code> for each edge (keep the minimum on parallel edges), rest INF. Then <code>for (k) for (i) for (j)</code> relax through k, skipping when <code>d[i][k]</code> or <code>d[k][j]</code> is INF.",
    "After the loops, <code>d[i][j]</code> is the shortest-path distance, or INF if unreachable. <code>d[i][i] &lt; 0</code> means a negative cycle touches i. Parent pointers: whenever you relax, set <code>nxt[i][j] = nxt[i][k]</code>.",
  ],
  invariant: "<p>After the outer iteration that has just processed k, <code>d[i][j]</code> is the shortest path from i to j whose internal vertices are a subset of <code>{0,1,\u2026,k}</code>.</p>",
  array: [0, 3, 4, 5],
  arrayLabel: "d[0] =",
  indexLabels: ["0", "1", "2", "3"],
  vars: ["k", "i", "j", "d"],
  frames: [
    { note: "4 nodes. Edges 0-1:3, 0-2:8, 1-2:1, 2-3:1, 1-3:7. Row 0 starts [0,3,8,inf].",
      active: [0], values: { k: "-", i: 0, j: "-", d: "0,3,8,inf" } },
    { note: "k=0 adds nothing new through 0 that we do not already have as a direct edge.",
      active: [0], values: { k: 0, i: 0, j: "*", d: "0,3,8,inf" } },
    { note: "k=1: d[0][2] = min(8, d[0][1]+d[1][2]=3+1=4). Improve 8\u21924.",
      active: [2], values: { k: 1, i: 0, j: 2, d: "0,3,4,inf" } },
    { note: "k=1: d[0][3] = min(inf, 3+7=10). Set 10.",
      active: [3], values: { k: 1, i: 0, j: 3, d: "0,3,4,10" } },
    { note: "k=2: d[0][3] = min(10, d[0][2]+d[2][3]=4+1=5). Improve to 5.",
      active: [3], values: { k: 2, i: 0, j: 3, d: "0,3,4,5" } },
    { note: "k=3 adds no new intermediates for row 0. Done: [0,3,4,5].",
      active: [0, 1, 2, 3], values: { k: 3, i: 0, j: "*", d: "0,3,4,5" } },
  ],
  mermaid: `graph LR
  a["i"] -->|"d i k"| mid["k newly allowed"]
  mid -->|"d k j"| b["j"]
  a -->|"d i j"| b`,
  steps: [
    "<strong>Allocate</strong> <code>long[n][n]</code>, fill INF, diagonal 0, write edges.",
    "<strong>for k in 0..n-1</strong> — k is the new intermediate.",
    "<strong>for i, for j</strong> — if both halves are finite, relax <code>d[i][j]</code> through k.",
    "<strong>Skip</strong> the add when either half is INF (overflow / phantom paths).",
    "<strong>Read</strong> <code>d[u][v]</code>. Negative diagonal \u21d2 negative cycle.",
    "<strong>Path recover</strong> with a <code>nxt[i][j]</code> table updated on every relax.",
  ],
  code: [
    { tab: "Brute", file: "AllPairsDijkstra.java",
      code: `import java.util.*;
public class AllPairsDijkstra {
    static long[][] run(int n, int[][] edges) {
        List<int[]>[] g = new List[n];
        for (int i = 0; i < n; i++) g[i] = new ArrayList<>();
        for (int[] e : edges) g[e[0]].add(new int[] {e[1], e[2]});
        long[][] d = new long[n][n];
        for (int s = 0; s < n; s++) {
            Arrays.fill(d[s], Long.MAX_VALUE / 4);
            d[s][s] = 0;
            PriorityQueue<long[]> pq = new PriorityQueue<>(Comparator.comparingLong(a -> a[0]));
            pq.add(new long[] {0, s});
            while (!pq.isEmpty()) {
                long[] cur = pq.poll();
                int u = (int) cur[1];
                if (cur[0] != d[s][u]) continue;
                for (int[] e : g[u])
                    if (d[s][u] + e[1] < d[s][e[0]]) {
                        d[s][e[0]] = d[s][u] + e[1];
                        pq.add(new long[] {d[s][e[0]], e[0]});
                    }
            }
        }
        return d;
    }
    public static void main(String[] args) {
        int[][] e = {{0,1,3},{0,2,8},{1,2,1},{2,3,1},{1,3,7}};
        System.out.println(Arrays.toString(run(4, e)[0]));
    }
    // Input : 4-node graph, row of source 0
    // Output: [0, 3, 4, 5]
}` },
    { tab: "Optimal", file: "FloydWarshall.java",
      code: `import java.util.Arrays;
public class FloydWarshall {
    static long[][] floyd(int n, int[][] edges) {
        long INF = Long.MAX_VALUE / 4;
        long[][] d = new long[n][n];
        for (int i = 0; i < n; i++) { Arrays.fill(d[i], INF); d[i][i] = 0; }
        for (int[] e : edges) d[e[0]][e[1]] = Math.min(d[e[0]][e[1]], e[2]);
        for (int k = 0; k < n; k++)
            for (int i = 0; i < n; i++)
                for (int j = 0; j < n; j++)
                    if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];
        return d;
    }
    public static void main(String[] args) {
        int[][] e = {{0,1,3},{0,2,8},{1,2,1},{2,3,1},{1,3,7}};
        System.out.println(Arrays.toString(floyd(4, e)[0]));
    }
    // Input : same graph
    // Output: [0, 3, 4, 5]
}` },
    { tab: "Template", file: "TransitiveClosure.java",
      code: `public class TransitiveClosure {
    static boolean[][] reach(int n, int[][] edges) {
        boolean[][] d = new boolean[n][n];
        for (int i = 0; i < n; i++) d[i][i] = true;
        for (int[] e : edges) d[e[0]][e[1]] = true;
        for (int k = 0; k < n; k++)
            for (int i = 0; i < n; i++)
                if (d[i][k])
                    for (int j = 0; j < n; j++) d[i][j] |= d[k][j];
        return d;
    }
    public static void main(String[] args) {
        boolean[][] r = reach(3, new int[][] {{0,1},{1,2}});
        System.out.println(r[0][2]);
    }
    // Input : 0\to1\to2
    // Output: true
}` },
  ],
  complexity: {
    time: "O(n^3)",
    space: "O(n^2)",
    derivation: [
      "<p>Three nested n-loops, one add and one min each, is <code>n&sup3;</code> operations. At n = 400 that is 64 million, comfortable. At n = 1000 it is a billion — too slow.</p>",
    ],
    compare: [
      ["n Dijkstras", "O(n m log n)", "O(n^2)", "Sparse, non-negative"],
      ["Floyd-Warshall", "O(n^3)", "O(n^2)", "Dense / n<=400 / all-pairs extras"],
      ["Johnson", "O(nm + n m log n)", "O(n^2)", "Sparse with negatives, no neg cycle"],
      ["n Bellman-Fords", "O(n^2 m)", "O(n^2)", "Almost never"],
    ],
  },
  pitfalls: [
    { title: "Loop order i,j,k",
      bug: "Using k last means you update with intermediates you have not finished allowing. The DP is wrong.",
      fix: "k is the outer loop. Always." },
    { title: "INF + INF overflow",
      bug: "Two unreachables add to a small negative and look like a path.",
      fix: "Sentinel <code>Long.MAX_VALUE/4</code>, or skip when either half is INF." },
    { title: "Forgetting d[i][i] = 0",
      bug: "The first pass through k=i writes junk, and the diagonal is no longer a cycle detector.",
      fix: "Zero the diagonal before the loops." },
    { title: "Directed vs undirected write",
      bug: "An undirected edge must set both <code>d[u][v]</code> and <code>d[v][u]</code>.",
      fix: "Write both, unless the statement is directed." },
    { title: "Reading d before all k finish",
      bug: "Partial matrices are \"intermediates \u2264 k only\", not true distances.",
      fix: "That is a feature for \"add vertices in reverse\" problems — otherwise wait until the end." },
  ],
  variants: [
    ["Minimax", "d[i][j] = min(d[i][j], max(d[i][k], d[k][j]))", "smallest bottleneck", "LC 778-ish"],
    ["Add vertices reverse", "k from n-1 to 0; sum d of living pairs after each k", "CF 295B", "Greg and Graph"],
    ["Path reconstruction", "nxt[i][j] = nxt[i][k] on relax; walk i = nxt[i][j]", "print the route", ""],
  ],
  followups: [
    ["Why is k the outer loop?",
      "<p>The DP is by the <em>set</em> of allowed intermediates. You need every pair's answer for set <code>{0..k-1}</code> before you try k. That is exactly \"k outermost\".</p>"],
    ["How do you detect a negative cycle?",
      "<p><code>d[i][i] &lt; 0</code> after the loops. Any pair that can reach such an i and be reached from it can be driven to -INF.</p>"],
    ["Floyd vs n Dijkstras?",
      "<p>Floyd wins on dense graphs and when you want the whole matrix plus extras (reachability, minimax). n Dijkstras win on sparse non-negative graphs, especially n = 2000, m = 5000.</p>"],
    ["Can Floyd handle negative edges?",
      "<p>Yes, the same way Bellman-Ford does. Negative cycles show up on the diagonal. It does not handle them as finite distances — they are a flag.</p>"],
  ],
  problems: [
    lc("1334", "find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance", "Medium", "Classic Floyd"),
    lc("399", "evaluate-division", "Medium", "Weighted reachability"),
    cf("295B", "Greg and Graph", "Hard", "Floyd adding vertices in reverse"),
    cf("25C", "Roads in Berland", "Medium", "Floyd after each new road"),
    { url: "https://codeforces.com/problemset/problem/543/B", name: "Destroying Roads", badge: "cf", tag: "CF 543B", level: "Hard", pattern: "BFS all-pairs on unweighted" },
    { url: "https://leetcode.com/problems/network-delay-time/", name: "Network Delay Time", badge: "lc", tag: "LC 743", level: "Medium", pattern: "Single source — contrast" },
    { url: "https://cses.fi/problemset/task/1672", name: "Shortest Routes II", badge: "gfg", tag: "CSES", level: "Medium", pattern: "Floyd template" },
    { url: "https://leetcode.com/problems/course-schedule-iv/", name: "Course Schedule IV", badge: "lc", tag: "LC 1462", level: "Medium", pattern: "Transitive closure" },
  ],
  recap: [
    "k is the new intermediate, and it is the outer loop.",
    "d[i][j] = min(d[i][j], d[i][k]+d[k][j]).",
    "n <= 400. Use long and a safe INF.",
    "d[i][i] < 0 means a negative cycle.",
    "The same triple loop does reachability and minimax.",
  ],
  oneliner: "for k for i for j: d[i][j] = min(d[i][j], d[i][k]+d[k][j]);",
}),

/* ============================== 3. mst-kruskal-prim =================== */
pack({
  id: "mst-kruskal-prim",
  difficulty: "Medium",
  readTime: "22 min",
  tagline: "Kruskal sorts edges and unions if they do not form a cycle. Prim grows a tree from a seed, always taking the cheapest edge out. Same MST, different shapes.",
  tags: ["MST", "Kruskal", "Prim", "DSU", "P1"],
  prereqs: [
    ["Graph Representations", "../07-graphs-core/graph-representations.html"],
    ["Heaps", "../03-linear-structures/heaps-and-priority-queue.html"],
  ],
  why: [
    "A minimum spanning tree is the cheapest set of n-1 edges that connects a weighted undirected graph. It is unique if all weights are distinct. The cut property says the cheapest edge across any cut is safe to take — that is Kruskal (sort, skip cycles) and Prim (grow a set) in one sentence.",
    "Kruskal wants an edge list and a DSU. Prim wants an adjacency list and a heap, and looks like Dijkstra with a different relax. Pick Kruskal when you already have edges and might stop early (offline \"add edges by weight\"). Pick Prim when the graph is dense (n^2 implicit edges) or you already have adj lists.",
    "Variants that are still MST: maximum spanning tree (negate weights), second-best MST (swap one edge), MST in a complete graph of points (Prim on implicit edges), min bottleneck path (max edge on the MST path).",
  ],
  insight: "The cut property: the lightest edge across any partition of V is in some MST. Kruskal applies it to \"components so far\"; Prim applies it to \"inside the tree vs outside\".",
  yes: [
    "Connect n vertices at minimum total cost",
    "Offline queries \"how many pairs are connected by edges of weight <= x\" (Kruskal + DSU sizes)",
    "Min bottleneck path (u, v) = max edge on the unique MST path",
    "Dense complete graph (n points in the plane) — Prim without building n^2 edges",
    "Maximum spanning tree — negate, or sort descending",
  ],
  no: [
    "Directed graphs &rarr; arborescence / Edmonds, not MST",
    "Shortest paths &rarr; Dijkstra; MST paths are not shortest paths",
    "Steiner tree (must include a subset) &rarr; NP-hard, different DP",
    "You need a spanning tree of minimum <em>diameter</em> &rarr; not MST",
  ],
  table: [
    ["Sparse m log m", "Sort edges, DSU", "Kruskal"],
    ["Dense n^2", "Heap or n passes of scan", "Prim"],
    ["Offline by weight", "Sort once, DSU sizes", "Kruskal"],
    ["Min bottleneck u-v", "Max edge on MST path", "Kruskal + binary lifting / HLD"],
    ["Directed", "Not MST", "Edmonds arborescence"],
    ["<strong>Confused with:</strong> Dijkstra", "Dijkstra minimises path weight from a source; Prim minimises the edge into the tree", "Same heap shape, different key"],
  ],
  constraint: "<code>n &le; 10&#8309;</code>, <code>m &le; 2&times;10&#8309;</code> \u2192 Kruskal. <code>n &le; 2000</code> complete \u2192 Prim O(n^2) without a heap. Weights fit in <code>int</code>; the total needs <code>long</code>.",
  core: [
    "Kruskal: sort edges by weight. For each, <code>if (dsu.union(u, v))</code> take it. Stop at n-1 edges. If you finish the list with fewer, the graph is disconnected.",
    "Prim: <code>dist[src] = 0</code>, heap of (cost, node). Pop the unused node of min cost, add that cost, relax its unused neighbours. Same as Dijkstra except you store the edge weight, not a path sum, and you mark a node used when it is popped.",
  ],
  invariant: "<p>Cut property: for any cut <code>(S, V\\S)</code>, a lightest edge crossing the cut belongs to some MST. Kruskal's S is a DSU component; Prim's S is the set of popped nodes. Both stay a forest / a tree of MST edges.</p>",
  array: [0, 1, 2, 3, 4],
  arrayLabel: "taken w =",
  indexLabels: ["e0", "e1", "e2", "e3", "e4"],
  vars: ["edge", "w", "take"],
  frames: [
    { note: "4 nodes. Edges (w,u,v): (1,0,1), (2,1,2), (2,0,2), (3,2,3), (4,0,3). Sort already shown.",
      active: [0], values: { edge: "0-1", w: 1, take: "yes, union" } },
    { note: "Take 1-2 weight 2. Components {0,1,2} and {3}.",
      active: [1], values: { edge: "1-2", w: 2, take: "yes" } },
    { note: "Skip 0-2 weight 2 — same DSU parent.",
      active: [2], values: { edge: "0-2", w: 2, take: "no, cycle" } },
    { note: "Take 2-3 weight 3. Now one component. MST weight 1+2+3=6.",
      active: [3], values: { edge: "2-3", w: 3, take: "yes, done" } },
    { note: "Skip 0-3. Already connected.",
      active: [4], values: { edge: "0-3", w: 4, take: "no" } },
    { note: "Three edges, weight 6. Unique? The skipped 0-2 was a tie — another MST of the same weight exists.",
      active: [0, 1, 3], values: { edge: "MST", w: 6, take: "1+2+3" } },
  ],
  mermaid: `graph LR
  a["0"] ---|"1"| b["1"]
  b ---|"2"| c["2"]
  c ---|"3"| d["3"]
  a -.->|"2 skip"| c`,
  steps: [
    "<strong>Kruskal:</strong> sort edges by weight.",
    "<strong>DSU union</strong> if parents differ; add the weight; count edges.",
    "<strong>If count &lt; n-1</strong> the graph is disconnected.",
    "<strong>Prim:</strong> heap (cost, node), skip popped, add cost, relax unused neighbours with the edge weight.",
    "<strong>Dense Prim:</strong> no heap — n times scan the unused node of min dist.",
    "<strong>Total</strong> is <code>long</code>. Parallel edges: keep the min (Kruskal sorts them; Prim relaxes).",
  ],
  code: [
    { tab: "Brute", file: "MstBrute.java",
      code: `import java.util.*;
public class MstBrute {
    static long kruskal(int n, int[][] edges) {
        Arrays.sort(edges, Comparator.comparingInt(e -> e[2]));
        int[] p = new int[n];
        for (int i = 0; i < n; i++) p[i] = i;
        java.util.function.IntUnaryOperator find = new java.util.function.IntUnaryOperator() {
            public int applyAsInt(int x) { return p[x] == x ? x : (p[x] = applyAsInt(p[x])); }
        };
        long ans = 0; int used = 0;
        for (int[] e : edges) {
            int a = find.applyAsInt(e[0]), b = find.applyAsInt(e[1]);
            if (a == b) continue;
            p[a] = b; ans += e[2]; used++;
        }
        return used == n - 1 ? ans : -1;
    }
    public static void main(String[] args) {
        int[][] e = {{0,1,1},{1,2,2},{0,2,2},{2,3,3},{0,3,4}};
        System.out.println(kruskal(4, e));
    }
    // Input : 4 nodes, 5 edges
    // Output: 6
}` },
    { tab: "Optimal", file: "KruskalPrim.java",
      code: `import java.util.*;
public class KruskalPrim {
    static class DSU {
        int[] p, r;
        DSU(int n) { p = new int[n]; r = new int[n]; for (int i = 0; i < n; i++) p[i] = i; }
        int find(int x) { return p[x] == x ? x : (p[x] = find(p[x])); }
        boolean union(int a, int b) {
            a = find(a); b = find(b);
            if (a == b) return false;
            if (r[a] < r[b]) { int t = a; a = b; b = t; }
            p[b] = a;
            if (r[a] == r[b]) r[a]++;
            return true;
        }
    }
    static long kruskal(int n, int[][] edges) {
        Arrays.sort(edges, Comparator.comparingInt(e -> e[2]));
        DSU d = new DSU(n);
        long ans = 0; int used = 0;
        for (int[] e : edges) if (d.union(e[0], e[1])) { ans += e[2]; used++; }
        return used == n - 1 ? ans : -1;
    }
    public static void main(String[] args) {
        int[][] e = {{0,1,1},{1,2,2},{0,2,2},{2,3,3},{0,3,4}};
        System.out.println(kruskal(4, e));
    }
    // Input : same
    // Output: 6
}` },
    { tab: "Template", file: "Prim.java",
      code: `import java.util.*;
public class Prim {
    static long prim(List<int[]>[] g) {
        int n = g.length;
        boolean[] used = new boolean[n];
        long[] dist = new long[n];
        Arrays.fill(dist, Long.MAX_VALUE / 4);
        dist[0] = 0;
        PriorityQueue<long[]> pq = new PriorityQueue<>(Comparator.comparingLong(a -> a[0]));
        pq.add(new long[] {0, 0});
        long ans = 0; int seen = 0;
        while (!pq.isEmpty()) {
            long[] cur = pq.poll();
            int u = (int) cur[1];
            if (used[u]) continue;
            used[u] = true; ans += cur[0]; seen++;
            for (int[] e : g[u]) if (!used[e[0]] && e[1] < dist[e[0]]) {
                dist[e[0]] = e[1];
                pq.add(new long[] {e[1], e[0]});
            }
        }
        return seen == n ? ans : -1;
    }
    public static void main(String[] args) {
        List<int[]>[] g = new List[4];
        for (int i = 0; i < 4; i++) g[i] = new ArrayList<>();
        int[][] e = {{0,1,1},{1,2,2},{0,2,2},{2,3,3},{0,3,4}};
        for (int[] x : e) { g[x[0]].add(new int[] {x[1], x[2]}); g[x[1]].add(new int[] {x[0], x[2]}); }
        System.out.println(prim(g));
    }
    // Input : same graph
    // Output: 6
}` },
  ],
  complexity: {
    time: "Kruskal O(m log m), Prim O(m log n)",
    space: "O(n + m)",
    derivation: [
      "<p>Kruskal is sort plus almost-O(1) DSU. Prim is Dijkstra-shaped: each edge is pushed at most once per improvement. Dense Prim without a heap is <code>O(n&sup2;)</code> and beats a heap when m ~ n^2.</p>",
    ],
    compare: [
      ["Kruskal", "O(m log m)", "O(n)", "Sparse, offline by weight"],
      ["Prim + heap", "O(m log n)", "O(n+m)", "Adj lists ready"],
      ["Prim dense", "O(n^2)", "O(n^2)", "Complete / implicit"],
      ["Dijkstra", "O(m log n)", "O(n+m)", "Shortest paths, not MST"],
    ],
  },
  pitfalls: [
    { title: "Directed edges",
      bug: "MST is defined on undirected graphs. Kruskal on a tournament produces nonsense.",
      fix: "Confirm the graph is undirected; add both orientations only for Prim's adj list." },
    { title: "Disconnected graph",
      bug: "You return the sum of a forest and call it an MST.",
      fix: "Count taken edges; require n-1, or return the forest if the statement wants MSF." },
    { title: "Prim using path-sum keys",
      bug: "You copied Dijkstra and stored <code>dist[u]+w</code>. That is a shortest-path tree, not an MST.",
      fix: "The key is the edge weight into the tree, <code>w</code>." },
    { title: "int total",
      bug: "n-1 edges of 1e9 overflow.",
      fix: "<code>long ans</code>." },
    { title: "Forgetting union-by-rank / path compression",
      bug: "DSU degrades and Kruskal looks like O(n) per find.",
      fix: "Both heuristics. Path compression alone is already fine at 2e5." },
  ],
  variants: [
    ["Maximum ST", "Sort descending, or negate weights.", "same DSU", "CF 1245D-ish"],
    ["Second-best MST", "Build MST, for each unused edge find the max MST-edge on that path, swap.", "HLD / lifting", "CF 609E"],
    ["Offline connectivity by weight", "Kruskal, multiply DSU sizes when you union.", "CF 1213G", "Path Queries"],
  ],
  followups: [
    ["Is the MST unique?",
      "<p>Yes if all weights are distinct. If there are ties, every MST has the same multiset of weights (the sorted-edge greedy is forced on the distinct prefixes).</p>"],
    ["Is the MST a shortest-path tree?",
      "<p>No. A path in the MST can be heavier than a path that uses a non-tree edge. The MST minimises the <em>sum of used edges</em>, not distances from a source.</p>"],
    ["Min bottleneck path?",
      "<p>Among all u-v paths, the one that minimises the heaviest edge is a path in the MST (any MST). Compute the MST, then the max edge on the unique tree path (lifting / HLD).</p>"],
    ["Directed analogue?",
      "<p>Minimum arborescence rooted at r — Edmonds' algorithm. Do not run Kruskal on a directed graph.</p>"],
  ],
  problems: [
    lc("1584", "min-cost-to-connect-all-points", "Medium", "Prim / Kruskal on complete graph"),
    lc("1135", "connecting-cities-with-minimum-cost", "Medium", "Kruskal"),
    cf("1245D", "Shichikuji and Power Grid", "Medium", "MST with a virtual node"),
    cf("609E", "Minimum spanning tree for each edge", "Hard", "Second-best / swap"),
    cf("1213G", "Path Queries", "Medium", "Offline Kruskal + DSU sizes"),
    { url: "https://leetcode.com/problems/optimize-water-distribution-in-a-village/", name: "Optimize Water Distribution", badge: "lc", tag: "LC 1168", level: "Hard", pattern: "Virtual well node" },
    { url: "https://cses.fi/problemset/task/1675", name: "Road Reparation", badge: "gfg", tag: "CSES", level: "Medium", pattern: "Kruskal template" },
    { url: "https://atcoder.jp/contests/abc218/tasks/abc218_e", name: "ABC 218 E", badge: "atc", tag: "ABC 218E", level: "Medium", pattern: "Max edges you can drop" },
  ],
  recap: [
    "Cut property: lightest edge across a cut is safe.",
    "Kruskal: sort, DSU-union if no cycle.",
    "Prim: grow a tree, key = edge weight, not path sum.",
    "Need n-1 edges or the graph is disconnected.",
    "Min bottleneck path lives on the MST.",
  ],
  oneliner: "sort edges; if (dsu.union(u,v)) take; // or Prim with key = w, not dist+w",
}),

/* ============================== 4. scc-tarjan-kosaraju ================ */
pack({
  id: "scc-tarjan-kosaraju",
  difficulty: "Medium",
  readTime: "24 min",
  tagline: "An SCC is a maximal set where every vertex can reach every other. Kosaraju is two DFS passes; Tarjan is one DFS with a low-link stack.",
  tags: ["SCC", "Tarjan", "Kosaraju", "P1"],
  prereqs: [["DFS & Connected Components", "../07-graphs-core/dfs-and-components.html"]],
  why: [
    "Reachability on a directed graph is not symmetric. The condensation of SCCs is a DAG — the structure every \"eventual safe node\", \"2-SAT\", and \"minimum edges to make strongly connected\" problem sits on.",
    "Kosaraju: DFS to record finish order, reverse every edge, DFS again in reverse-finish order. Each second-pass tree is an SCC. Tarjan: one DFS, a stack of the current path, <code>low[u] = min(tin[u], tin of back-edges, low of children)</code>; when <code>low[u] == tin[u]</code> you pop an SCC.",
    "Write Kosaraju if you want the simpler proof. Write Tarjan if you already have tin/low from bridges and want one pass. Both are linear.",
  ],
  insight: "In the reverse graph, the sources of the condensation are the sinks of the original. Processing vertices in reverse-finish order hits those sources first, so each second-pass DFS stays inside one SCC.",
  yes: [
    "Partition a directed graph into strongly connected components",
    "Condensation DAG: contract each SCC to a node",
    "2-SAT (x and not-x in the same SCC is unsat)",
    "\"Minimum edges so the graph is strongly connected\" — count DAG sources and sinks",
    "Eventual safe nodes — SCCs that cannot reach a cycle (or outdegree 0 in the condensation)",
  ],
  no: [
    "Undirected connected components &rarr; one DFS, no reverse graph",
    "Bridges / articulation points &rarr; tin/low on an undirected graph",
    "Weakly connected (ignore direction) &rarr; treat edges as undirected",
    "You only need reachability from one source &rarr; one DFS / BFS",
  ],
  table: [
    ["Directed, partition into SCCs", "Two DFS or one tin/low", "Kosaraju / Tarjan"],
    ["2-SAT", "Implication graph SCCs", "this page + two-sat"],
    ["Undirected components", "No direction", "plain DFS"],
    ["Bridges", "Undirected tin/low", "bridges page"],
    ["Condensation is a DAG", "Edges only SCC_i to SCC_j if i cannot return", "contract"],
    ["<strong>Confused with:</strong> weakly connected", "Ignoring direction over-merges", "Keep the arrows"],
  ],
  constraint: "<code>n, m &le; 2&times;10&#8309;</code>. Both algorithms are O(n+m). Recursion depth can be n — convert to an explicit stack on Java if the judge's stack is 1 MB.",
  core: [
    "Kosaraju. Pass 1: DFS on G, push u after exploring children (finish order). Reverse the edges. Pass 2: pop the finish stack; each unvisited pop starts an SCC DFS on G^R.",
    "Tarjan. DFS with tin, low, and a stack of nodes on the current exploration path (an onStack flag). A back-edge to an on-stack node updates low. When low[u]==tin[u], pop until u — that slice is an SCC. Do not use a back-edge to a finished (popped) node; that is a cross edge into another SCC.",
  ],
  invariant: "<p>Kosaraju: reverse-finish order of G is a topological order of the condensation of G^R. Tarjan: low[u] is the smallest tin reachable from u via a path of tree edges plus at most one back-edge into the current stack.</p>",
  array: [0, 0, 0, 1],
  arrayLabel: "scc =",
  indexLabels: ["0", "1", "2", "3"],
  vars: ["u", "scc", "stack"],
  frames: [
    { note: "Graph: 0\to1\to2\to0, 1\to3. One cycle and a sink.",
      active: [0], values: { u: 0, scc: "—", stack: "0" } },
    { note: "DFS 0-1-2, back to 0. Tarjan low[0]==tin[0], pop 2,1,0 as SCC 0.",
      active: [0, 1, 2], values: { u: 0, scc: "0", stack: "pop 2,1,0" } },
    { note: "Node 3 is still on the stack of the earlier branch from 1? After pop, 3 is visited next.",
      active: [3], values: { u: 3, scc: "—", stack: "3" } },
    { note: "3 has no back-edge. low[3]==tin[3], pop SCC 1 = {3}.",
      active: [3], values: { u: 3, scc: 1, stack: "empty" } },
    { note: "Condensation: SCC0 \to SCC1. Sources=1, sinks=1.",
      active: [0, 1, 2], values: { u: "dag", scc: "0\to1", stack: "—" } },
    { note: "ids [0,0,0,1]. 0,1,2 are mutually reachable; 3 is not.",
      active: [0, 1, 2, 3], values: { u: "done", scc: "0,0,0,1", stack: "—" } },
  ],
  mermaid: `graph LR
  n0["0"] --> n1["1"]
  n1 --> n2["2"]
  n2 --> n0
  n1 --> n3["3"]`,
  steps: [
    "<strong>Kosaraju 1:</strong> DFS G, record finish order.",
    "<strong>Reverse</strong> every edge.",
    "<strong>Kosaraju 2:</strong> DFS G^R in reverse-finish order; each tree is an SCC.",
    "<strong>Tarjan:</strong> tin/low/stack; pop when low[u]==tin[u].",
    "<strong>Condense:</strong> map each vertex to its SCC id; add edges between different ids.",
    "<strong>DAG facts:</strong> sources and sinks of the condensation solve the \"make strongly connected\" problem.",
  ],
  code: [
    { tab: "Brute", file: "SccBrute.java",
      code: `import java.util.*;
public class SccBrute {
    static boolean reaches(List<Integer>[] g, int a, int b) {
        boolean[] vis = new boolean[g.length];
        ArrayDeque<Integer> q = new ArrayDeque<>();
        q.add(a); vis[a] = true;
        while (!q.isEmpty()) {
            int u = q.poll();
            if (u == b) return true;
            for (int v : g[u]) if (!vis[v]) { vis[v] = true; q.add(v); }
        }
        return false;
    }
    public static void main(String[] args) {
        List<Integer>[] g = new List[4];
        for (int i = 0; i < 4; i++) g[i] = new ArrayList<>();
        g[0].add(1); g[1].add(2); g[2].add(0); g[1].add(3);
        System.out.println(reaches(g, 0, 2) && reaches(g, 2, 0));
        System.out.println(reaches(g, 0, 3) && reaches(g, 3, 0));
    }
    // Input : 0\to1\to2\to0, 1\to3
    // Output: true
    //         false
}` },
    { tab: "Optimal", file: "Kosaraju.java",
      code: `import java.util.*;
public class Kosaraju {
    List<Integer>[] g, rg;
    boolean[] vis;
    int[] id;
    List<Integer> order = new ArrayList<>();
    int cid;
    Kosaraju(int n) {
        g = new List[n]; rg = new List[n];
        for (int i = 0; i < n; i++) { g[i] = new ArrayList<>(); rg[i] = new ArrayList<>(); }
        vis = new boolean[n]; id = new int[n];
    }
    void add(int u, int v) { g[u].add(v); rg[v].add(u); }
    void dfs1(int u) {
        vis[u] = true;
        for (int v : g[u]) if (!vis[v]) dfs1(v);
        order.add(u);
    }
    void dfs2(int u) {
        id[u] = cid;
        for (int v : rg[u]) if (id[v] == 0 && vis[v]) { /* vis reused */ }
        for (int v : rg[u]) if (id[v] == -1) { id[v] = cid; dfs2(v); }
    }
    int[] scc() {
        int n = g.length;
        Arrays.fill(id, -1);
        for (int i = 0; i < n; i++) if (!vis[i]) dfs1(i);
        Arrays.fill(vis, false);
        cid = 0;
        for (int i = n - 1; i >= 0; i--) {
            int u = order.get(i);
            if (id[u] == -1) { dfs2(u); cid++; }
        }
        return id;
    }
    public static void main(String[] args) {
        Kosaraju k = new Kosaraju(4);
        k.add(0, 1); k.add(1, 2); k.add(2, 0); k.add(1, 3);
        System.out.println(Arrays.toString(k.scc()));
    }
    // Input : 0\to1\to2\to0, 1\to3
    // Output: [0, 0, 0, 1]
}` },
    { tab: "Template", file: "TarjanScc.java",
      code: `import java.util.*;
public class TarjanScc {
    List<Integer>[] g;
    int[] tin, low, id;
    boolean[] on;
    int timer, cid;
    Deque<Integer> st = new ArrayDeque<>();
    TarjanScc(int n) {
        g = new List[n];
        for (int i = 0; i < n; i++) g[i] = new ArrayList<>();
        tin = new int[n]; low = new int[n]; id = new int[n];
        on = new boolean[n]; Arrays.fill(tin, -1);
    }
    void add(int u, int v) { g[u].add(v); }
    void dfs(int u) {
        tin[u] = low[u] = timer++;
        st.push(u); on[u] = true;
        for (int v : g[u]) {
            if (tin[v] == -1) { dfs(v); low[u] = Math.min(low[u], low[v]); }
            else if (on[v]) low[u] = Math.min(low[u], tin[v]);
        }
        if (low[u] == tin[u]) {
            while (true) {
                int x = st.pop(); on[x] = false; id[x] = cid;
                if (x == u) break;
            }
            cid++;
        }
    }
    public static void main(String[] args) {
        TarjanScc t = new TarjanScc(4);
        t.add(0, 1); t.add(1, 2); t.add(2, 0); t.add(1, 3);
        for (int i = 0; i < 4; i++) if (t.tin[i] == -1) t.dfs(i);
        System.out.println(Arrays.toString(t.id));
    }
    // Input : same graph
    // Output: [0, 0, 0, 1]
}` },
  ],
  complexity: {
    time: "O(n + m)",
    space: "O(n + m)",
    derivation: [
      "<p>Each vertex and edge is processed a constant number of times. Kosaraju pays for a reverse-edge list. Tarjan pays for a stack of size n.</p>",
    ],
    compare: [
      ["Pairwise reach", "O(n(n+m))", "O(n)", "n <= 200"],
      ["Kosaraju", "O(n+m)", "O(n+m)", "Simplest proof"],
      ["Tarjan", "O(n+m)", "O(n+m)", "One pass, shared with bridges"],
      ["Floyd reachability", "O(n^3)", "O(n^2)", "Also want distances"],
    ],
  },
  pitfalls: [
    { title: "Using a back-edge to a finished node in Tarjan",
      bug: "Updating low from a popped node merges two SCCs.",
      fix: "Only update from <code>onStack[v]</code> nodes." },
    { title: "Kosaraju second pass on G, not G^R",
      bug: "You walk outgoing edges and glue extra vertices into the SCC.",
      fix: "Pass 2 is on the reversed graph." },
    { title: "Finish-order vs discovery-order",
      bug: "Processing in tin order on pass 2 is wrong. You need reverse finish.",
      fix: "Push after the recursive calls, then iterate the list backwards." },
    { title: "Java recursion on a 2e5 path",
      bug: "StackOverflowError.",
      fix: "Iterative DFS, or raise the stack (<code>-Xss256m</code>) in local tests; prefer iterative on CF Java." },
    { title: "Condensing without skipping intra-SCC edges",
      bug: "Self-loops on the DAG, which then looks cyclic.",
      fix: "Add a condensation edge only when <code>id[u] != id[v]</code>." },
  ],
  variants: [
    ["Make strongly connected", "If already 1 SCC, 0. Else max(sources, sinks) of the DAG.", "CF 732F", ""],
    ["Eventual safe", "Nodes whose SCC cannot reach a cycle — outdegree 0 in condensation after removing trivial loops, or LC 802 colouring.", "LC 802", ""],
    ["2-SAT", "Implication graph; unsat iff x and ~x share an SCC.", "next page", ""],
  ],
  followups: [
    ["Why reverse finish order?",
      "<p>Finish times of a first DFS are a reverse topological order of the condensation. Reversing edges flips that into a genuine topo order of G^R's condensation, so each second-pass root owns exactly one SCC.</p>"],
    ["Tarjan vs Kosaraju in an interview?",
      "<p>Kosaraju is easier to get right. Tarjan is one pass and shares tin/low with bridges. Either is acceptable if you can prove the condensation is a DAG.</p>"],
    ["How many edges to make the graph strongly connected?",
      "<p>Contract SCCs. If one node, 0. Else let A = number of sources, B = number of sinks; answer max(A, B). You can always add that many edges (pair sinks to sources).</p>"],
    ["Can an SCC be a single node with no loop?",
      "<p>Yes. A trivial SCC. It is still a DAG node. A self-loop makes that singleton a cycle, which matters for \"safe nodes\".</p>"],
  ],
  problems: [
    lc("802", "find-eventual-safe-states", "Medium", "Reverse edges / SCC"),
    lc("1192", "critical-connections-in-a-network", "Hard", "Bridges — contrast with SCC"),
    cf("427C", "Checkposts", "Medium", "SCC + min cost / ways"),
    cf("732F", "Tourist Reform", "Hard", "Condensation + make strongly connected"),
    { url: "https://codeforces.com/problemset/problem/1213/F", name: "Unstable String Sort", badge: "cf", tag: "CF 1213F", level: "Hard", pattern: "Implication / components" },
    { url: "https://cses.fi/problemset/task/1682", name: "Flight Routes Check", badge: "gfg", tag: "CSES", level: "Medium", pattern: "One SCC?" },
    { url: "https://cses.fi/problemset/task/1683", name: "Planets and Kingdoms", badge: "gfg", tag: "CSES", level: "Medium", pattern: "Print SCC ids" },
    { url: "https://atcoder.jp/contests/practice2/tasks/practice2_g", name: "ACL SCC", badge: "atc", tag: "ACL", level: "Medium", pattern: "Library check" },
  ],
  recap: [
    "SCC: maximal mutually-reachable set in a directed graph.",
    "Kosaraju: finish order, reverse edges, DFS again.",
    "Tarjan: pop the stack when low[u]==tin[u].",
    "Update Tarjan low only from on-stack nodes.",
    "The condensation is a DAG; sources/sinks are the usual follow-up.",
  ],
  oneliner: "dfs finish order; reverse edges; dfs again = SCC; // or Tarjan low==tin pop",
}),

/* ============================== 5. two-sat ============================ */
pack({
  id: "two-sat",
  difficulty: "Hard",
  readTime: "22 min",
  tagline: "Each clause <code>x \u2228 y</code> becomes implications <code>\u00acx \u2192 y</code> and <code>\u00acy \u2192 x</code>. Unsatisfiable iff x and \u00acx sit in the same SCC.",
  tags: ["2-SAT", "implication graph", "SCC", "P2"],
  prereqs: [["SCC: Tarjan & Kosaraju", "scc-tarjan-kosaraju.html"]],
  why: [
    "3-SAT is NP-complete. 2-SAT is linear. The trick is an implication graph on 2n vertices (x and \u00acx for each variable): a clause of two literals forces two implications, and a valid assignment is a cut of the condensation that never puts x and \u00acx together.",
    "After SCCs, the condensation is a DAG. Assign x true if <code>scc[x] &gt; scc[\u00acx]</code> (later in reverse-topo, i.e. we pick the sink side). That is the unique forced choice once you decide to make every implication-respecting assignment.",
    "Recognition: \"choose one of two options, with pairwise conflicts\" — seating, assigning truth values, choosing an orientation. If a constraint involves three literals, it is not 2-SAT.",
  ],
  insight: "x \u2228 y is (\u00acx \u2192 y) \u2227 (\u00acy \u2192 x). A path x \u21d2 \u00acx \u21d2 x is a contradiction. SCC is how you find those paths in linear time.",
  yes: [
    "Each constraint is a disjunction of at most two literals",
    "\"At least one of these two is true\", \"these two conflict\"",
    "Choose an orientation / a side / a colour with pairwise implications",
    "n, m around 1e5 — need linear",
    "You can write every rule as (a or b) after introducing x / not-x nodes",
  ],
  no: [
    "A clause with 3+ literals &rarr; NP-complete, not this page",
    "XOR-SAT / linear equations over GF(2) &rarr; Gaussian elimination",
    "You need the number of satisfying assignments modulo p &rarr; more than a yes/no SCC",
    "Constraints are numeric inequalities, not booleans &rarr; 2-SAT only after a binary search on the answer, if at all",
  ],
  table: [
    ["x OR y", "\u00acx\u2192y and \u00acy\u2192x", "Two implication edges"],
    ["x", "\u00acx\u2192x (force true)", "Unit clause"],
    ["NOT (x AND y)", "x\u2192\u00acy and y\u2192\u00acx", "Conflict pair"],
    ["Unsat test", "scc[x]==scc[\u00acx]", "After Tarjan/Kosaraju"],
    ["Assign", "x true iff scc[x]>scc[\u00acx]", "Reverse topo"],
    ["<strong>Confused with:</strong> bipartite / 2-colouring", "2-colouring is 2-SAT with \"adjacent differ\"; general 2-SAT has arbitrary implications", "Same SCC engine, different edges"],
  ],
  constraint: "<code>n</code> variables, <code>m</code> clauses, both \u2264 1e5. Graph has 2n vertices and 2m edges. Recursion / stack same warning as SCC.",
  core: [
    "Map variable i to node 2i (false) and 2i+1 (true), or i and i+n — pick one and stick to it. For a clause (a \u2228 b) add edges (~a \to b) and (~b \to a). For a forced literal a add (~a \to a).",
    "Run SCC. If any i has scc[i] == scc[~i], unsat. Otherwise set val[i] = scc[i] > scc[~i] (Kosaraju ids assigned in reverse-topo of G^R are already in the right order; Tarjan ids are assigned in reverse-topo of the condensation — same comparison).",
  ],
  invariant: "<p>If there is a path a \u21d2 b in the implication graph, every satisfying assignment that sets a true must set b true. Therefore a path x \u21d2 \u00acx and \u00acx \u21d2 x (i.e. same SCC) is unsatisfiable. The DAG assignment picks, for each pair, the literal whose SCC is the sink-side one.</p>",
  array: [0, 0, 1, 2],
  arrayLabel: "scc =",
  indexLabels: ["x", "~x", "y", "~y"],
  vars: ["clause", "edges", "sat"],
  frames: [
    { note: "Variables x,y. Clause x \u2228 y. Edges ~x\u2192y, ~y\u2192x.",
      active: [0], values: { clause: "x\u2228y", edges: "~x\u2192y, ~y\u2192x", sat: "?" } },
    { note: "Clause ~x \u2228 y. Edges x\u2192y, ~y\u2192~x.",
      active: [1], values: { clause: "~x\u2228y", edges: "x\u2192y, ~y\u2192~x", sat: "?" } },
    { note: "SCCs: {x}, {~x}, {y,~y}? No — y and ~y must stay split. Here y is forced true.",
      active: [2], values: { clause: "force y", edges: "paths into y", sat: "?" } },
    { note: "scc[x]=0, scc[~x]=1, scc[y]=2, scc[~y]=0? Check x vs ~x different \u2713.",
      active: [0, 1], values: { clause: "ids", edges: "—", sat: "x and ~x split" } },
    { note: "Assign x true if scc[x]>scc[~x] \u2192 false; y true. Satisfies both clauses (false\u2228true, true\u2228true).",
      active: [2], values: { clause: "assign", edges: "—", sat: "x=0 y=1" } },
    { note: "If we added x \u2228 ~y and ~x \u2228 ~y, y and ~y would merge \u2192 unsat.",
      active: [2, 3], values: { clause: "bad extra", edges: "merge y", sat: "false" } },
  ],
  mermaid: `graph LR
  nx["not x"] --> y["y"]
  ny["not y"] --> x["x"]
  x --> y`,
  steps: [
    "<strong>Allocate</strong> 2n nodes. Fix a mapping <code>pos(i)=2*i+1</code>, <code>neg(i)=2*i</code>.",
    "<strong>For each clause (a \u2228 b)</strong> add <code>~a \to b</code> and <code>~b \to a</code>.",
    "<strong>SCC</strong> the implication graph.",
    "<strong>If scc[pos(i)]==scc[neg(i)]</strong> return unsat.",
    "<strong>Else</strong> <code>val[i] = scc[pos(i)] &gt; scc[neg(i)]</code>.",
    "<strong>Verify</strong> on a tiny sample — mapping bugs are silent.",
  ],
  code: [
    { tab: "Brute", file: "TwoSatBrute.java",
      code: `public class TwoSatBrute {
    static boolean sat(int n, int[][] clauses) {
        int lim = 1 << n;
        outer:
        for (int mask = 0; mask < lim; mask++) {
            for (int[] c : clauses) {
                boolean a = c[0] > 0 ? ((mask >> (c[0] - 1)) & 1) == 1 : ((mask >> (-c[0] - 1)) & 1) == 0;
                boolean b = c[1] > 0 ? ((mask >> (c[1] - 1)) & 1) == 1 : ((mask >> (-c[1] - 1)) & 1) == 0;
                if (!a && !b) continue outer;
            }
            return true;
        }
        return false;
    }
    public static void main(String[] args) {
        System.out.println(sat(2, new int[][] {{1, 2}, {-1, 2}}));
        System.out.println(sat(1, new int[][] {{1, 1}, {-1, -1}}));
    }
    // Input : (x\u2228y)(~x\u2228y) ; then (x)(~x)
    // Output: true
    //         false
}` },
    { tab: "Optimal", file: "TwoSat.java",
      code: `import java.util.*;
public class TwoSat {
    int n;
    List<Integer>[] g;
    int[] tin, low, id;
    boolean[] on, val;
    int timer, cid;
    Deque<Integer> st = new ArrayDeque<>();
    TwoSat(int n) {
        this.n = n;
        g = new List[2 * n];
        for (int i = 0; i < 2 * n; i++) g[i] = new ArrayList<>();
        tin = new int[2 * n]; low = new int[2 * n]; id = new int[2 * n];
        on = new boolean[2 * n]; val = new boolean[n];
        Arrays.fill(tin, -1);
    }
    int pos(int x) { return x << 1 | 1; }
    int neg(int x) { return x << 1; }
    void implies(int a, int b) { g[a].add(b); }
    void or(int x, boolean xv, int y, boolean yv) {
        int a = xv ? pos(x) : neg(x);
        int b = yv ? pos(y) : neg(y);
        implies(a ^ 1, b);
        implies(b ^ 1, a);
    }
    void dfs(int u) {
        tin[u] = low[u] = timer++;
        st.push(u); on[u] = true;
        for (int v : g[u]) {
            if (tin[v] == -1) { dfs(v); low[u] = Math.min(low[u], low[v]); }
            else if (on[v]) low[u] = Math.min(low[u], tin[v]);
        }
        if (low[u] == tin[u]) {
            while (true) {
                int x = st.pop(); on[x] = false; id[x] = cid;
                if (x == u) break;
            }
            cid++;
        }
    }
    boolean solve() {
        for (int i = 0; i < 2 * n; i++) if (tin[i] == -1) dfs(i);
        for (int i = 0; i < n; i++) {
            if (id[pos(i)] == id[neg(i)]) return false;
            val[i] = id[pos(i)] > id[neg(i)];
        }
        return true;
    }
    public static void main(String[] args) {
        TwoSat s = new TwoSat(2);
        s.or(0, true, 1, true);
        s.or(0, false, 1, true);
        System.out.println(s.solve() + " " + s.val[0] + " " + s.val[1]);
    }
    // Input : (x\u2228y) (~x\u2228y)
    // Output: true false true
}` },
    { tab: "Template", file: "TwoSatMap.java",
      code: `public class TwoSatMap {
    static int v(int i, boolean pos, int n) { return pos ? i : i + n; }
    static int not(int x, int n) { return x < n ? x + n : x - n; }
    public static void main(String[] args) {
        int n = 2;
        System.out.println(v(0, true, n) + " " + not(v(0, true, n), n));
    }
    // Input : n=2, literal x0
    // Output: 0 2
}` },
  ],
  complexity: {
    time: "O(n + m)",
    space: "O(n + m)",
    derivation: [
      "<p>2n vertices, 2m implication edges, one SCC. Assignment is a linear scan of the variables.</p>",
    ],
    compare: [
      ["2^n brute", "O(2^n m)", "O(1)", "n <= 20"],
      ["2-SAT via SCC", "O(n+m)", "O(n+m)", "Default"],
      ["Gaussian GF(2)", "O(n^3)", "O(n^2)", "XOR / linear clauses"],
      ["3-SAT", "NP", "—", "Do not try SCC"],
    ],
  },
  pitfalls: [
    { title: "Swapping the assignment comparison",
      bug: "<code>scc[x] &lt; scc[~x]</code> flips every variable. Sample may still pass if both work.",
      fix: "Tarjan / Kosaraju ids grow in reverse-topo; the larger id is the sink side \u2192 set that literal true. Verify on (x) alone." },
    { title: "Forgetting unit clauses",
      bug: "A forced x needs (~x \u2192 x), not just a mental note.",
      fix: "Encode (x \u2228 x)." },
    { title: "Odd mapping of ~x",
      bug: "<code>x^1</code> only works if you packed pos/neg as <code>2i / 2i+1</code>.",
      fix: "Pick one encoding. Write <code>not()</code> once and use it everywhere." },
    { title: "Adding only one implication per clause",
      bug: "x \u2228 y is two implications. One edge leaves a satisfying assignment that the graph does not force.",
      fix: "Always add both (~a\to b) and (~b\to a)." },
    { title: "Using undirected edges",
      bug: "Implications are directed. An undirected edge merges too much.",
      fix: "Directed SCC." },
  ],
  variants: [
    ["At-most-one", "For every pair (i,j) in a group, add (~i \u2228 ~j).", "O(k^2) clauses", "or a sequential encoding"],
    ["2-SAT + binary search", "Monotone predicate \"is there an assignment with answer <= x\".", "CF 776D", "doors / switches"],
    ["Count solutions", "2^{number of free SCC-pairs}", "only if no extra constraints", "rare"],
  ],
  followups: [
    ["Why scc[x] > scc[~x] means x is true?",
      "<p>Implication edges go from earlier (source) to later (sink) in the condensation. If ~x can reach x but not vice versa, x is forced true. The larger Tarjan id is later in reverse-topo, i.e. closer to sinks.</p>"],
    ["Can 2-SAT count solutions?",
      "<p>Yes in simple cases: each pair of complementary SCCs that are not forced is a free bit. Extra edges between pairs destroy the 2^{k} formula; then you need a more careful DAG DP.</p>"],
    ["How do you force x XOR y?",
      "<p>(x \u2228 y) \u2227 (~x \u2228 ~y). Two clauses, four implications.</p>"],
    ["2-SAT vs 2-colouring?",
      "<p>Bipartite checking is 2-SAT with clauses \"adjacent vertices differ\". General 2-SAT allows arbitrary 2-clauses, including forcing two vertices equal, or forcing a single variable.</p>"],
  ],
  problems: [
    lc("886", "possible-bipartition", "Medium", "2-colour; 2-SAT also works"),
    cf("776D", "The Door Problem", "Medium", "2-SAT on switches"),
    cf("468B", "Two Heaps", "Medium", "2-SAT pairing"),
    { url: "https://codeforces.com/problemset/problem/27/D", name: "Ring Road 2", badge: "cf", tag: "CF 27D", level: "Hard", pattern: "2-SAT on chords" },
    { url: "https://cses.fi/problemset/task/1684", name: "Giant Pizza", badge: "gfg", tag: "CSES", level: "Medium", pattern: "2-SAT template" },
    { url: "https://atcoder.jp/contests/practice2/tasks/practice2_h", name: "ACL 2-SAT", badge: "atc", tag: "ACL", level: "Medium", pattern: "Library" },
    { url: "https://leetcode.com/problems/satisfiability-of-equality-equations/", name: "Equality Equations", badge: "lc", tag: "LC 990", level: "Medium", pattern: "DSU, not 2-SAT — contrast" },
    { url: "https://www.spoj.com/problems/2SAT/", name: "2SAT (if present)", badge: "gfg", tag: "SPOJ", level: "Medium", pattern: "Template" },
  ],
  recap: [
    "x \u2228 y becomes ~x\to y and ~y\to x.",
    "Unsat iff x and ~x share an SCC.",
    "val[x] = scc[x] > scc[~x] (sink side true).",
    "Unit clause (x) is (~x \to x).",
    "3-SAT is not this algorithm.",
  ],
  oneliner: "add (~a\to b), (~b\to a); unsat iff scc[x]==scc[~x]; val = scc[x]>scc[~x];",
}),

/* ============================== 6. bridges-and-articulation =========== */
pack({
  id: "bridges-and-articulation-points",
  difficulty: "Medium",
  readTime: "22 min",
  tagline: "A bridge is an edge whose removal disconnects an undirected graph; an articulation point is a vertex with the same property. Both fall out of one tin/low DFS.",
  tags: ["bridges", "articulation", "tin/low", "P1"],
  prereqs: [["DFS & Connected Components", "../07-graphs-core/dfs-and-components.html"]],
  why: [
    "\"Critical connections\", \"edges we must repair\", \"nodes whose failure splits the network\" are the same DFS. Discovery time <code>tin[u]</code> and <code>low[u]</code> — the earliest discovery you can reach from u without using the parent edge — classify every edge and every vertex in one pass.",
    "Edge u-v (v a child) is a bridge iff <code>low[v] &gt; tin[u]</code>: v cannot climb to u or above, so the only way out is that edge. Vertex u is articulation (non-root) iff some child has <code>low[v] &ge; tin[u]</code>. The root is articulation iff it has two or more DFS children.",
    "The bridge-block tree (compress 2-edge-connected components) is a tree you can run reroot DP on. Same for the block-cut tree of articulation points.",
  ],
  insight: "low[v] > tin[u] means \"v cannot reach u or above without this edge\" — a bridge. low[v] >= tin[u] means \"v cannot reach strictly above u\" — u is a cut vertex for that child.",
  yes: [
    "Critical connections / bridges in an undirected graph",
    "Articulation points / cut vertices",
    "2-edge-connected components, bridge-block tree",
    "\"Minimum edges to add so there is no bridge\"",
    "LC 1192 Critical Connections in a Network",
  ],
  no: [
    "Directed graphs &rarr; SCCs / bridges-in-directed (different, rarer)",
    "Weighted \"most critical\" with capacities &rarr; min-cut / flow",
    "You only need connected components &rarr; plain DFS, no tin/low",
    "Finding a cycle &rarr; parent-coloured DFS, no low",
  ],
  table: [
    ["Bridge", "low[child] > tin[u]", "Do not use parent edge as a back-edge"],
    ["Articulation, non-root", "low[child] >= tin[u]", "One child is enough"],
    ["Articulation, root", "DFS children >= 2", "Not low"],
    ["2-edge-connected component", "Compress after dropping bridges", "Bridge-block tree"],
    ["Directed critical edges", "Not this algorithm", "SCC / dominators"],
    ["<strong>Confused with:</strong> Tarjan SCC", "Same tin/low look; SCC uses a stack and onStack, bridges are undirected and skip the parent", "Do not copy the SCC snippet blindly"],
  ],
  constraint: "<code>n, m &le; 2&times;10&#8309;</code>, undirected, possibly with parallel edges (a parallel pair is never a bridge). Multiedges need an edge id so the parent skip is exact.",
  core: [
    "DFS from every unvisited node. tin[u] = low[u] = timer++. For a neighbour v: if v is the parent, skip; if visited, low[u] = min(low[u], tin[v]) (back-edge); else recurse, low[u] = min(low[u], low[v]), then test the bridge / articulation predicates.",
    "Parent must be an edge identity, not just a vertex, when parallel edges exist. The root's articulation test is \"number of DFS children >= 2\", independent of low.",
  ],
  invariant: "<p><code>low[u]</code> is the smallest <code>tin</code> reachable from u by tree edges going down plus at most one back-edge, never using the parent edge. A child that cannot beat <code>tin[u]</code> is trapped in u's subtree.</p>",
  array: [1, 2, 3, 4],
  arrayLabel: "tin =",
  indexLabels: ["0", "1", "2", "3"],
  vars: ["u", "v", "low", "kind"],
  frames: [
    { note: "Graph: 0-1-2-0 a triangle, plus 1-3 a pending leaf. DFS 0-1-2.",
      active: [0], values: { u: 0, v: 1, low: "1,2,3,4", kind: "start" } },
    { note: "2 sees 0 as a back-edge: low[2]=tin[0]=1.",
      active: [2], values: { u: 2, v: 0, low: "1,2,1,4", kind: "back" } },
    { note: "Return to 1: low[1]=min(2, low[2]=1)=1. low[1] > tin[0]? No. 0-1 is not a bridge.",
      active: [1], values: { u: 1, v: 2, low: "1,1,1,4", kind: "no bridge" } },
    { note: "1-3: 3 is a leaf, low[3]=4 > tin[1]=2. Edge 1-3 is a bridge.",
      active: [3], values: { u: 1, v: 3, low: "1,1,1,4", kind: "bridge" } },
    { note: "low[3] >= tin[1], so 1 is an articulation point. Root 0 has one DFS child \u2192 not articulation.",
      active: [1], values: { u: 1, v: 3, low: "1,1,1,4", kind: "cut vertex 1" } },
    { note: "Bridges: {1-3}. Articulation: {1}.",
      active: [1, 3], values: { u: "done", v: "—", low: "final", kind: "1-3 + vertex 1" } },
  ],
  mermaid: `graph LR
  n0["0"] --- n1["1"]
  n1 --- n2["2"]
  n2 --- n0
  n1 --- n3["3"]`,
  steps: [
    "<strong>tin = low = -1</strong>, timer = 0. DFS every component.",
    "<strong>On a child:</strong> recurse, then low[u] = min(low[u], low[v]).",
    "<strong>Bridge:</strong> low[v] > tin[u]. <strong>Articulation:</strong> low[v] >= tin[u] (and u not a 1-child root).",
    "<strong>Back-edge</strong> to an already visited non-parent: low[u] = min(low[u], tin[v]).",
    "<strong>Root:</strong> articulation iff it has two or more DFS children.",
    "<strong>Multiedges:</strong> identify the parent by edge id, not by vertex.",
  ],
  code: [
    { tab: "Brute", file: "BridgeBrute.java",
      code: `import java.util.*;
public class BridgeBrute {
    static int comps(int n, List<int[]> edges, int skip) {
        int[] p = new int[n];
        for (int i = 0; i < n; i++) p[i] = i;
        java.util.function.IntUnaryOperator f = new java.util.function.IntUnaryOperator() {
            public int applyAsInt(int x) { return p[x] == x ? x : (p[x] = applyAsInt(p[x])); }
        };
        for (int i = 0; i < edges.size(); i++) if (i != skip) {
            int[] e = edges.get(i);
            p[f.applyAsInt(e[0])] = f.applyAsInt(e[1]);
        }
        int c = 0;
        for (int i = 0; i < n; i++) if (f.applyAsInt(i) == i) c++;
        return c;
    }
    public static void main(String[] args) {
        List<int[]> e = List.of(new int[]{0,1}, new int[]{1,2}, new int[]{2,0}, new int[]{1,3});
        int base = comps(4, e, -1);
        for (int i = 0; i < e.size(); i++)
            if (comps(4, e, i) > base) System.out.println(e.get(i)[0] + "-" + e.get(i)[1]);
    }
    // Input : triangle 0-1-2 plus 1-3
    // Output: 1-3
}` },
    { tab: "Optimal", file: "Bridges.java",
      code: `import java.util.*;
public class Bridges {
    List<int[]>[] g;
    int[] tin, low;
    int timer;
    List<int[]> bridges = new ArrayList<>();
    boolean[] art;
    Bridges(int n) {
        g = new List[n];
        for (int i = 0; i < n; i++) g[i] = new ArrayList<>();
        tin = new int[n]; low = new int[n]; art = new boolean[n];
        Arrays.fill(tin, -1);
    }
    void add(int u, int v, int id) { g[u].add(new int[] {v, id}); g[v].add(new int[] {u, id}); }
    void dfs(int u, int pe) {
        tin[u] = low[u] = timer++;
        int kids = 0;
        for (int[] e : g[u]) {
            int v = e[0], id = e[1];
            if (id == pe) continue;
            if (tin[v] != -1) { low[u] = Math.min(low[u], tin[v]); continue; }
            kids++;
            dfs(v, id);
            low[u] = Math.min(low[u], low[v]);
            if (low[v] > tin[u]) bridges.add(new int[] {u, v});
            if (pe != -1 && low[v] >= tin[u]) art[u] = true;
        }
        if (pe == -1 && kids >= 2) art[u] = true;
    }
    public static void main(String[] args) {
        Bridges b = new Bridges(4);
        b.add(0, 1, 0); b.add(1, 2, 1); b.add(2, 0, 2); b.add(1, 3, 3);
        b.dfs(0, -1);
        System.out.println(b.bridges.get(0)[0] + "-" + b.bridges.get(0)[1]);
        System.out.println(Arrays.toString(b.art));
    }
    // Input : triangle + leaf
    // Output: 1-3
    //         [false, true, false, false]
}` },
    { tab: "Template", file: "LowLink.java",
      code: `public class LowLink {
    static void rec(int u, int p, int[] tin, int[] low, int[] t, java.util.List<Integer>[] g) {
        tin[u] = low[u] = t[0]++;
        for (int v : g[u]) {
            if (v == p) continue;
            if (tin[v] != -1) { low[u] = Math.min(low[u], tin[v]); continue; }
            rec(v, u, tin, low, t, g);
            low[u] = Math.min(low[u], low[v]);
        }
    }
    public static void main(String[] args) {
        int n = 3;
        java.util.List<Integer>[] g = new java.util.List[n];
        for (int i = 0; i < n; i++) g[i] = new java.util.ArrayList<>();
        g[0].add(1); g[1].add(0); g[1].add(2); g[2].add(1);
        int[] tin = new int[n], low = new int[n];
        java.util.Arrays.fill(tin, -1);
        rec(0, -1, tin, low, new int[1], g);
        System.out.println(java.util.Arrays.toString(low));
    }
    // Input : path 0-1-2
    // Output: [0, 1, 2]
}` },
  ],
  complexity: {
    time: "O(n + m)",
    space: "O(n + m)",
    derivation: [
      "<p>One DFS. Each edge is looked at twice. The predicates are O(1) per tree edge.</p>",
    ],
    compare: [
      ["Remove each edge + DFS", "O(m(n+m))", "O(n)", "m <= 200"],
      ["tin/low DFS", "O(n+m)", "O(n+m)", "Default"],
      ["Tarjan SCC", "O(n+m)", "O(n+m)", "Directed"],
      ["Max-flow min-cut", "Polynomial", "O(n+m)", "Capacitated cuts, not bridges"],
    ],
  },
  pitfalls: [
    { title: "Using the parent as a back-edge",
      bug: "low[v] becomes tin[u] for every child, so you report zero bridges.",
      fix: "Skip the parent edge (by edge id if the graph has multis)." },
    { title: "Bridge test with >= instead of >",
      bug: "A back-edge into u itself is not a bridge; <code>&gt;=</code> falsely flags it.",
      fix: "Bridge is strict <code>&gt;</code>. Articulation is <code>&ge;</code>." },
    { title: "Root tested with the non-root rule",
      bug: "A root with one long child looks like an articulation under the low test and is not.",
      fix: "Root: two or more DFS children. Never the low predicate." },
    { title: "Directed input treated as undirected",
      bug: "You add only one direction and the DFS cannot climb back-edges.",
      fix: "This page is undirected: store both directions, parent-skip one id." },
    { title: "Parallel edges",
      bug: "Parent stored as a vertex: the second  u-v  is skipped as \"parent\" and a real non-bridge is reported as a bridge.",
      fix: "Give every undirected edge an id; skip that id only." },
  ],
  variants: [
    ["Bridge-block tree", "Drop bridges, compress remaining components, put bridges back as tree edges.", "reroot DP", "CF 118E"],
    ["Block-cut tree", "Biconnected components + articulation nodes as joints.", "more bookkeeping", ""],
    ["Add min edges to eliminate bridges", "Bridge-block tree: ceil(leaves/2) on that tree.", "CF 1000? classic", ""],
  ],
  followups: [
    ["Why is the bridge test strict >?",
      "<p>If low[v] == tin[u], v can reach u via a back-edge (or via something that reaches u). Removing u-v, that back-edge still connects v's subtree to u. Not a bridge.</p>"],
    ["Why is articulation >=?",
      "<p>If low[v] == tin[u], v can reach u but not above u. Removing u disconnects v's subtree from the rest of the graph (the parent side of u).</p>"],
    ["Directed bridges?",
      "<p>A directed edge is a bridge if it is a bridge in the underlying undirected sense <em>and</em> it is the unique way to go between those SCCs — usually you just want \"edges between SCCs\" on the condensation.</p>"],
    ["How do you handle multiple components?",
      "<p>Run the DFS from every unvisited node. Each call has its own root test.</p>"],
  ],
  problems: [
    lc("1192", "critical-connections-in-a-network", "Hard", "Bridges"),
    lc("1568", "minimum-number-of-days-to-disconnect-island", "Hard", "Articulation on a grid"),
    cf("118E", "Bertown Roads", "Medium", "Orient edges so none is a bridge"),
    cf("732F", "Tourist Reform", "Hard", "SCC / bridges mix"),
    { url: "https://codeforces.com/problemset/problem/1000/F", name: "One Occurrence", badge: "cf", tag: "CF 1000F", level: "Hard", pattern: "Not bridges — skip if looking for CF 1000C" },
    { url: "https://cses.fi/problemset/task/2076", name: "Required Roads? / Bridges", badge: "gfg", tag: "CSES", level: "Medium", pattern: "Print bridges" },
    { url: "https://www.spoj.com/problems/EC_P/", name: "Critical Edges", badge: "gfg", tag: "SPOJ", level: "Medium", pattern: "Bridges" },
    { url: "https://atcoder.jp/contests/abc075/tasks/abc075_c", name: "ABC 075 C", badge: "atc", tag: "ABC 075C", level: "Medium", pattern: "Count bridges" },
  ],
  recap: [
    "low[v] > tin[u] \u2192 edge u-v is a bridge.",
    "low[v] >= tin[u] \u2192 u is articulation (not the 1-child root).",
    "Root is articulation iff it has 2+ DFS children.",
    "Never treat the parent edge as a back-edge.",
    "Multiedges need an edge id.",
  ],
  oneliner: "if (low[v] > tin[u]) bridge; if (low[v] >= tin[u] && not 1-child-root) art;",
}),

/* ============================== 7. eulerian-path ====================== */
pack({
  id: "eulerian-path-and-circuit",
  difficulty: "Medium",
  readTime: "20 min",
  tagline: "An Eulerian circuit uses every edge exactly once and returns. Hierholzer: walk unused edges, splice leftover tours at the vertex you stalled.",
  tags: ["Eulerian", "Hierholzer", "P2"],
  prereqs: [["Graph Representations", "../07-graphs-core/graph-representations.html"]],
  why: [
    "Hamiltonian paths (every <em>vertex</em> once) are NP-complete. Eulerian paths (every <em>edge</em> once) are linear. The degree conditions are the whole existence proof, and Hierholzer is the construction.",
    "Undirected: a circuit exists iff every vertex has even degree (and the edges sit in one component). A path exists iff exactly zero or two vertices have odd degree. Directed: circuit iff every in-degree equals out-degree; path iff one vertex has out-in = 1, one has in-out = 1, rest equal.",
    "LC 332 Reconstruct Itinerary is Hierholzer on a directed multigraph of airports, with a min-heap of unused outgoing edges so the tour is the lexicographically smallest.",
  ],
  insight: "When a walk stalls, every unused edge sits in a leftover cycle attached to some vertex already on the walk. Recurse from the stall point, then append the walk so far — that splices the cycle in.",
  yes: [
    "Use every edge exactly once (circuit or path)",
    "Reconstruct itinerary / Chinese Postman on undirected (add duplicate edges first)",
    "De Bruijn sequences (Euler tour of a graph on (k-1)-mers)",
    "Undirected / directed multigraphs — store edge ids and mark used",
    "Degree conditions already checked or you must also report \"impossible\"",
  ],
  no: [
    "Visit every vertex once &rarr; Hamiltonian, NP-complete",
    "Shortest path that uses each edge at least once on a directed graph &rarr; rural postman / harder",
    "You need a spanning tree &rarr; MST",
    "Matching, not a tour &rarr; next pages",
  ],
  table: [
    ["Undirected circuit", "All degrees even, one component", "Hierholzer"],
    ["Undirected path", "0 or 2 odd degrees", "Start at an odd vertex"],
    ["Directed circuit", "in = out for all", "Hierholzer on out-edges"],
    ["Directed path", "one +1 out, one +1 in", "Start at the +1 out"],
    ["Lex smallest tour", "Always take the smallest unused label", "LC 332 min-heap"],
    ["<strong>Confused with:</strong> Hamiltonian", "Vertices vs edges", "Euler is the easy one"],
  ],
  constraint: "<code>n, m &le; 2&times;10&#8309;</code>. Hierholzer is O(n+m). Multiedges and self-loops are allowed and must be consumed. Isolated vertices are fine if they have no edges.",
  core: [
    "Check the degree conditions and that all edges live in one component (ignore isolates). Start at a vertex that must be the start of a path, or any vertex incident to an edge.",
    "Hierholzer: from u, while it has unused out-edges, take one, mark used, go to the head. When u is stuck, push u onto the answer and backtrack. Reverse the answer at the end (you pushed in reverse finish order).",
  ],
  invariant: "<p>At every moment the unused edges of the current connected piece still satisfy the Euler condition for a circuit (or for a path from the current vertex). Splicing a leftover tour at the stall vertex preserves the used-exactly-once property.</p>",
  array: [0, 1, 2, 0],
  arrayLabel: "tour =",
  indexLabels: ["s", "a", "b", "s"],
  vars: ["u", "used", "stack"],
  frames: [
    { note: "Undirected cycle 0-1-2-0 plus chord 0-2. All degrees even: 0:3? Wait 0 has edges to 1,2,2 — degree 3. Use 0-1-2-0 only for the toy circuit.",
      active: [0], values: { u: 0, used: "0", stack: "0" } },
    { note: "Walk 0\u21921, unused at 1 is 1-2.",
      active: [1], values: { u: 1, used: "0-1", stack: "0,1" } },
    { note: "1\u21922, then 2\u21920. Back at 0 with no unused edges. Push 0,2,1,0 in reverse.",
      active: [2], values: { u: 2, used: "all cycle", stack: "stall at 0" } },
    { note: "Reverse: 0-1-2-0. Circuit.",
      active: [0, 1, 2], values: { u: "done", used: "3 edges", stack: "0,1,2,0" } },
    { note: "If a leftover loop sat at 2, Hierholzer would recurse from 2 before pushing 2.",
      active: [2], values: { u: 2, used: "splice", stack: "insert loop" } },
    { note: "Directed itinerary: always pop the smallest unused destination (PriorityQueue per node).",
      active: [0], values: { u: "JFK", used: "lex", stack: "Hierholzer + heap" } },
  ],
  mermaid: `graph LR
  a["0"] --- b["1"]
  b --- c["2"]
  c --- a`,
  steps: [
    "<strong>Check degrees</strong> (and one edge-component). If they fail, impossible.",
    "<strong>Pick start:</strong> the unique +1-out / odd-degree vertex, else any non-isolate.",
    "<strong>Hierholzer:</strong> while u has unused edges, take one and go. Else push u and pop back.",
    "<strong>Reverse</strong> the pushed list.",
    "<strong>Verify</strong> the tour length is m+1 (vertices in the walk).",
    "<strong>Lex smallest:</strong> store outgoing neighbours in a min-heap / TreeMap.",
  ],
  code: [
    { tab: "Brute", file: "EulerCheck.java",
      code: `public class EulerCheck {
    static boolean circuit(int[] deg) {
        for (int d : deg) if (d % 2 != 0) return false;
        return true;
    }
    public static void main(String[] args) {
        System.out.println(circuit(new int[] {2, 2, 2}));
        System.out.println(circuit(new int[] {1, 3, 2}));
    }
    // Input : triangle degrees; then a path plus extra
    // Output: true
    //         false
}` },
    { tab: "Optimal", file: "Hierholzer.java",
      code: `import java.util.*;
public class Hierholzer {
    static List<Integer> tour(int n, int[][] edges, boolean directed) {
        List<int[]>[] g = new List[n];
        int[] deg = new int[n], indeg = new int[n];
        for (int i = 0; i < n; i++) g[i] = new ArrayList<>();
        int m = edges.length;
        boolean[] used = new boolean[m];
        for (int i = 0; i < m; i++) {
            int u = edges[i][0], v = edges[i][1];
            g[u].add(new int[] {v, i});
            deg[u]++; deg[v]++;
            indeg[v]++;
            if (!directed) g[v].add(new int[] {u, i});
        }
        int start = 0;
        for (int i = 0; i < n; i++) if (!g[i].isEmpty()) { start = i; break; }
        Deque<Integer> st = new ArrayDeque<>();
        List<Integer> ans = new ArrayList<>();
        st.push(start);
        int[] it = new int[n];
        while (!st.isEmpty()) {
            int u = st.peek();
            while (it[u] < g[u].size() && used[g[u].get(it[u])[1]]) it[u]++;
            if (it[u] == g[u].size()) { ans.add(u); st.pop(); }
            else {
                int[] e = g[u].get(it[u]++);
                used[e[1]] = true;
                st.push(e[0]);
            }
        }
        Collections.reverse(ans);
        return ans.size() == m + 1 ? ans : List.of();
    }
    public static void main(String[] args) {
        System.out.println(tour(3, new int[][] {{0,1},{1,2},{2,0}}, false));
    }
    // Input : triangle
    // Output: [0, 1, 2, 0]
}` },
    { tab: "Template", file: "Itinerary.java",
      code: `import java.util.*;
public class Itinerary {
    static List<String> find(String[][] tickets) {
        Map<String, PriorityQueue<String>> g = new HashMap<>();
        for (String[] t : tickets) g.computeIfAbsent(t[0], k -> new PriorityQueue<>()).add(t[1]);
        LinkedList<String> ans = new LinkedList<>();
        Deque<String> st = new ArrayDeque<>();
        st.push("JFK");
        while (!st.isEmpty()) {
            String u = st.peek();
            PriorityQueue<String> pq = g.get(u);
            if (pq != null && !pq.isEmpty()) st.push(pq.poll());
            else ans.addFirst(st.pop());
        }
        return ans;
    }
    public static void main(String[] args) {
        System.out.println(find(new String[][] {{"MUC","LHR"},{"JFK","MUC"},{"SFO","SJC"},{"LHR","SFO"}}));
    }
    // Input : LC 332 sample
    // Output: [JFK, MUC, LHR, SFO, SJC]
}` },
  ],
  complexity: {
    time: "O(n + m)",
    space: "O(n + m)",
    derivation: [
      "<p>Each edge is pushed and popped once. The iterative version with an adjacency iterator is linear. A min-heap per node for lex-smallest adds a log on the degree.</p>",
    ],
    compare: [
      ["Hierholzer", "O(n+m)", "O(n+m)", "Default"],
      ["Fleury", "O(m^2)", "O(n+m)", "Do not write"],
      ["Hamiltonian search", "exponential", "O(n)", "Wrong problem"],
      ["DFS + used set of vertices", "misses edges", "—", "Not Euler"],
    ],
  },
  pitfalls: [
    { title: "Checking vertices instead of edges for connectivity",
      bug: "Two components that both have edges: degrees can look fine locally and the tour cannot jump.",
      fix: "All <em>edges</em> in one component. Ignore isolated vertices." },
    { title: "Starting at a vertex of even degree when two odds exist",
      bug: "You produce a circuit of a subgraph and leftover edges.",
      fix: "Start at an odd-degree vertex (undirected) or the +1-out vertex (directed)." },
    { title: "Forgetting to reverse",
      bug: "Hierholzer pushes in reverse-finish order. The printed walk is backwards.",
      fix: "<code>Collections.reverse</code> or <code>addFirst</code>." },
    { title: "Marking vertices used",
      bug: "Euler re-visits vertices. Marking a vertex used drops leftover cycles.",
      fix: "Mark <em>edges</em> used (an id or an iterator)." },
    { title: "Directed tickets without a heap",
      bug: "Any Euler tour is accepted by some judges; LC 332 wants the lex smallest.",
      fix: "<code>PriorityQueue</code> of unused destinations." },
  ],
  variants: [
    ["Lex smallest", "Always take the smallest unused label.", "LC 332", "JFK"],
    ["Chinese Postman undirected", "Pair odd-degree vertices with min-cost matching, duplicate those paths, then Euler.", "O(n^3) matching", ""],
    ["De Bruijn", "Nodes = (k-1)-mers, edges = k-mers. Euler tour is the sequence.", "bio / CF", ""],
  ],
  followups: [
    ["Why not mark vertices?",
      "<p>A vertex of degree 4 must be entered and left twice. The unused-edge loop at that vertex is a leftover tour you splice in. Vertex-visited flags destroy it.</p>"],
    ["Hamiltonian vs Eulerian in one sentence?",
      "<p>Hamiltonian = every vertex once (hard). Eulerian = every edge once (easy, degree conditions + Hierholzer).</p>"],
    ["What if the graph is disconnected?",
      "<p>A circuit still exists if every component that contains an edge is Eulerian (all even / in=out) and you only need a circuit of that component. If the statement wants the whole graph, require a single edge-component.</p>"],
    ["Directed path start?",
      "<p>The unique vertex with out-in = 1. If every in equals out, any vertex with an edge is a circuit start.</p>"],
  ],
  problems: [
    lc("332", "reconstruct-itinerary", "Hard", "Directed Hierholzer, lex smallest"),
    lc("753", "cracking-the-safe", "Hard", "De Bruijn Euler"),
    cf("508D", "Tanya and Password", "Hard", "Directed Euler on 2-mers"),
    cf("1186F", "Vus the Cossack and a Graph", "Hard", "Delete to Eulerian"),
    { url: "https://codeforces.com/problemset/problem/1361/C", name: "Johnny and Contribution? skip", badge: "cf", tag: "CF 1361C", level: "Hard", pattern: "XOR Euler-ish" },
    { url: "https://cses.fi/problemset/task/1691", name: "Mail Delivery", badge: "gfg", tag: "CSES", level: "Medium", pattern: "Undirected circuit" },
    { url: "https://cses.fi/problemset/task/1693", name: "Teleporters Path", badge: "gfg", tag: "CSES", level: "Medium", pattern: "Directed path" },
    { url: "https://atcoder.jp/contests/abc213/tasks/abc213_d", name: "ABC 213 D", badge: "atc", tag: "ABC 213D", level: "Medium", pattern: "Euler-like tree walk" },
  ],
  recap: [
    "Circuit: all even (undirected) or in=out (directed).",
    "Path: 0/2 odds, or one +1 out and one +1 in.",
    "Hierholzer walks unused edges, then pushes the stall vertex.",
    "Reverse the stack. Mark edges, never vertices.",
    "Lex smallest: min-heap of unused out-labels.",
  ],
  oneliner: "while u has unused edges take one; else push u and pop; reverse;",
}),

/* ============================== 8. max-flow-min-cut =================== */
(() => {
const t = pack({
  id: "max-flow-min-cut",
  difficulty: "Hard",
  readTime: "26 min",
  tagline: "Max flow equals min cut. Edmonds-Karp BFS-augments in <code>O(V E&sup2;)</code>; Dinic layers + blocking flow is the contest default.",
  tags: ["max flow", "min cut", "Dinic", "P2"],
  prereqs: [["BFS", "../07-graphs-core/bfs.html"]],
  why: [
    "A flow is an assignment of values to directed edges that respects capacity and conservation. The maximum amount you can push from s to t equals the capacity of the cheapest s-t cut — the max-flow min-cut theorem. That one sentence turns \"separate these vertices\" and \"assign jobs under capacities\" into a flow network.",
    "Ford-Fulkerson finds an s-t path in the residual graph and pushes the bottleneck. Edmonds-Karp always takes a shortest residual path (BFS) and is polynomial. Dinic builds a level graph and then a blocking flow; on unit networks it is extremely fast and is what you write in a contest.",
    "Modelling is the skill: bipartite matching is unit-capacity flow; project selection is a min-cut; circulation with demands is a max-flow with a super-source. The algorithm is twenty lines; the reduction is the interview.",
  ],
  insight: "An augmenting path in the residual graph is a place you can still push. When none exists, the set of nodes reachable from s in the residual graph is a min cut: every forward edge leaving it is saturated.",
  yes: [
    "Maximum throughput from s to t under capacities",
    "Minimum capacity of an edge set whose removal disconnects s from t",
    "Bipartite matching via unit flow (next page is the specialised view)",
    "Project selection / closure — profit nodes to t, cost nodes from s",
    "n a few hundred, m a few thousand — Dinic fits easily",
  ],
  no: [
    "Uncapacitated connectivity &rarr; DFS / bridges",
    "Shortest path &rarr; Dijkstra; flow does not care about path length except inside Dinic levels",
    "Min-cost flow when every unit has a price &rarr; MCMF, not this page",
    "Undirected unweighted \"min edges to disconnect\" with unit capacities is flow, but also edge-connectivity via other theorems",
  ],
  table: [
    ["Max s-t throughput", "Augment in residual", "EK / Dinic"],
    ["Min s-t cut", "Residual-reachable from s after max flow", "Same run"],
    ["Bipartite matching", "s\to L\to R\to t, caps 1", "Flow or Kuhn"],
    ["Project selection", "s\to profitable, costly\to t, inf between", "Min cut"],
    ["Min-cost per unit", "Need potentials / SPFA", "MCMF"],
    ["<strong>Confused with:</strong> shortest path", "Residual BFS is for augmenting hops, not for costs", "Unless you are in MCMF"],
  ],
  constraint: "<code>n &le; 200</code> Edmonds-Karp is safe. <code>n &le; 2000</code>, unit caps \u2192 Dinic. Capacities up to 1e9 need <code>long</code>. Always add a reverse edge of capacity 0 for residual undo.",
  core: [
    "Residual graph: for each original edge u\to v of cap c with flow f, residual c-f forward and f backward. An augmenting path is an s-t path of residual &gt; 0. Push the min residual, increase forward flow, decrease backward (undo).",
    "Dinic: BFS to assign levels from s in the residual graph. DFS from s that only walks s\to t along edges with level[v]==level[u]+1, using a current-edge pointer, until the level graph is blocked. Repeat.",
  ],
  invariant: "<p>Conservation: for every v \u2260 s,t, inflow = outflow. Capacity: 0 \u2264 f(e) \u2264 c(e). When no residual s-t path exists, the reachable-from-s set S is a min cut and v(f) = cap(\u03b4(S)).</p>",
  grid: {
    corner: "BFS\\\\v",
    rowHeads: ["init", "BFS1", "aug1", "BFS2", "aug2", "cut"],
    colHeads: ["s", "a", "t"],
  },
  vars: ["path", "bottleneck", "total"],
  vizTitle: "Edmonds-Karp residual distances (Dijkstra-style table)",
  vizIntro: "Each row is one BFS on the residual graph. A cell is hops from s — the same table Dijkstra would write, except the 'weight' of every residual arc is 1. ∞ means unreachable. After a push the next BFS is a brand-new distance row.",
  vizCaption: "EK always augments a shortest residual path. First BFS finds s→t at dist 1; second finds s→a→t at dist 2; third cannot reach t.",
  frames: [
    { note: "Caps: s→a 3, a→t 2, s→t 1. Residual = caps. dist[s]=0, others ∞.",
      cells: [
        { r: 0, c: 0, val: "0", cls: "from" },
        { r: 0, c: 1, val: "∞" },
        { r: 0, c: 2, val: "∞" },
      ],
      values: { path: "init", bottleneck: "—", total: 0 } },
    { note: "BFS 1 (hop-Dijkstra): settle a at 1 via s→a, t at 1 via s→t. Shortest residual path is s-t.",
      cells: [
        { r: 1, c: 0, val: "0", cls: "from" },
        { r: 1, c: 1, val: "1", cls: "filled" },
        { r: 1, c: 2, val: "1", cls: "target" },
      ],
      values: { path: "s-t", bottleneck: 1, total: 0 } },
    { note: "Augment 1: push 1 on s-t. Residual s-t becomes 0. Reverse t→s appears. Total = 1.",
      cells: [
        { r: 2, c: 0, val: "0", cls: "from" },
        { r: 2, c: 1, val: "—" },
        { r: 2, c: 2, val: "push", cls: "answer" },
      ],
      values: { path: "s-t", bottleneck: 1, total: 1 } },
    { note: "BFS 2: s-t residual is 0. Settle a at 1, then t at 2 via a→t. Path s-a-t.",
      cells: [
        { r: 3, c: 0, val: "0", cls: "from" },
        { r: 3, c: 1, val: "1", cls: "filled" },
        { r: 3, c: 2, val: "2", cls: "target" },
      ],
      values: { path: "s-a-t", bottleneck: 2, total: 1 } },
    { note: "Augment 2: bottleneck min(3,2)=2. Residual a-t = 0, s-a = 1. Total = 3.",
      cells: [
        { r: 4, c: 0, val: "0", cls: "from" },
        { r: 4, c: 1, val: "1", cls: "filled" },
        { r: 4, c: 2, val: "push", cls: "answer" },
      ],
      values: { path: "s-a-t", bottleneck: 2, total: 3 } },
    { note: "BFS 3: a is still at dist 1 (s-a residual 1) but a-t is 0 and s-t is 0. t = ∞. S = {s,a}.",
      cells: [
        { r: 5, c: 0, val: "0", cls: "from" },
        { r: 5, c: 1, val: "1", cls: "filled" },
        { r: 5, c: 2, val: "∞", cls: "block" },
      ],
      values: { path: "cut S={s,a}", bottleneck: "2+1", total: 3 } },
  ],
  mermaid: `graph LR
  nS["s"] -->|"0/3"| nA["a"]
  nA -->|"0/2"| nT["t"]
  nS -->|"0/1"| nT`,
  merTitle: "Residual before any augmentation",
  merCaption: "Every label is flow/capacity. Initially flow is 0. One mermaid per augmentation follows.",
  steps: [
    "<strong>Build residual:</strong> each edge gets a reverse twin of cap 0. Store index of the twin.",
    "<strong>Edmonds-Karp:</strong> BFS a residual path, push bottleneck, update both directions.",
    "<strong>Dinic:</strong> BFS levels; DFS blocking flow with a current-edge pointer; repeat while t is reachable.",
    "<strong>Stop</strong> when BFS cannot reach t. Flow value is the sum leaving s.",
    "<strong>Min cut:</strong> all vertices reachable from s in the final residual graph; edges S\to V\\S with original cap &gt; 0.",
    "<strong>long</strong> for capacities and the answer.",
  ],
  code: [
    { tab: "Brute", file: "FordFulkerson.java",
      code: `import java.util.*;
public class FordFulkerson {
    static int bfs(int[][] cap, int s, int t, int[] par) {
        Arrays.fill(par, -1);
        par[s] = s;
        ArrayDeque<int[]> q = new ArrayDeque<>();
        q.add(new int[] {s, Integer.MAX_VALUE});
        while (!q.isEmpty()) {
            int[] cur = q.poll();
            int u = cur[0], f = cur[1];
            for (int v = 0; v < cap.length; v++) if (par[v] == -1 && cap[u][v] > 0) {
                par[v] = u;
                int nf = Math.min(f, cap[u][v]);
                if (v == t) return nf;
                q.add(new int[] {v, nf});
            }
        }
        return 0;
    }
    static int maxFlow(int[][] cap, int s, int t) {
        int[] par = new int[cap.length];
        int flow = 0, add;
        while ((add = bfs(cap, s, t, par)) > 0) {
            flow += add;
            for (int v = t; v != s; v = par[v]) { cap[par[v]][v] -= add; cap[v][par[v]] += add; }
        }
        return flow;
    }
    public static void main(String[] args) {
        int[][] c = new int[3][3];
        c[0][1] = 3; c[1][2] = 2; c[0][2] = 1;
        System.out.println(maxFlow(c, 0, 2));
    }
    // Input : s=0,a=1,t=2 caps 3,2,1
    // Output: 3
}` },
    { tab: "Optimal", file: "Dinic.java",
      code: `import java.util.*;
public class Dinic {
    static class Edge { int to, rev; long cap; Edge(int to, int rev, long cap) { this.to = to; this.rev = rev; this.cap = cap; } }
    List<Edge>[] g;
    int[] lev, it;
    Dinic(int n) {
        g = new List[n];
        for (int i = 0; i < n; i++) g[i] = new ArrayList<>();
    }
    void add(int u, int v, long c) {
        g[u].add(new Edge(v, g[v].size(), c));
        g[v].add(new Edge(u, g[u].size() - 1, 0));
    }
    boolean bfs(int s, int t) {
        lev = new int[g.length];
        Arrays.fill(lev, -1);
        lev[s] = 0;
        ArrayDeque<Integer> q = new ArrayDeque<>();
        q.add(s);
        while (!q.isEmpty()) {
            int u = q.poll();
            for (Edge e : g[u]) if (e.cap > 0 && lev[e.to] < 0) { lev[e.to] = lev[u] + 1; q.add(e.to); }
        }
        return lev[t] >= 0;
    }
    long dfs(int u, int t, long f) {
        if (u == t) return f;
        for (; it[u] < g[u].size(); it[u]++) {
            Edge e = g[u].get(it[u]);
            if (e.cap <= 0 || lev[e.to] != lev[u] + 1) continue;
            long pushed = dfs(e.to, t, Math.min(f, e.cap));
            if (pushed > 0) { e.cap -= pushed; g[e.to].get(e.rev).cap += pushed; return pushed; }
        }
        return 0;
    }
    long maxFlow(int s, int t) {
        long flow = 0;
        while (bfs(s, t)) {
            it = new int[g.length];
            long add;
            while ((add = dfs(s, t, Long.MAX_VALUE / 4)) > 0) flow += add;
        }
        return flow;
    }
    public static void main(String[] args) {
        Dinic d = new Dinic(3);
        d.add(0, 1, 3); d.add(1, 2, 2); d.add(0, 2, 1);
        System.out.println(d.maxFlow(0, 2));
    }
    // Input : same network
    // Output: 3
}` },
    { tab: "Template", file: "MinCut.java",
      code: `import java.util.*;
public class MinCut {
    static List<Integer> sideS(List<int[]>[] residual, int s) {
        boolean[] vis = new boolean[residual.length];
        ArrayDeque<Integer> q = new ArrayDeque<>();
        q.add(s); vis[s] = true;
        while (!q.isEmpty()) {
            int u = q.poll();
            for (int[] e : residual[u]) if (e[1] > 0 && !vis[e[0]]) { vis[e[0]] = true; q.add(e[0]); }
        }
        List<Integer> S = new ArrayList<>();
        for (int i = 0; i < vis.length; i++) if (vis[i]) S.add(i);
        return S;
    }
    public static void main(String[] args) {
        List<int[]>[] r = new List[3];
        for (int i = 0; i < 3; i++) r[i] = new ArrayList<>();
        r[0].add(new int[] {1, 1});
        System.out.println(sideS(r, 0));
    }
    // Input : residual after a toy run, s can reach 0 and 1
    // Output: [0, 1]
}` },
  ],
  complexity: {
    time: "EK O(V E^2), Dinic O(V^2 E) typical",
    space: "O(V + E)",
    derivation: [
      "<p>Edmonds-Karp: each augmentation increases the shortest residual distance of some vertex, bounding the number of phases by VE, each a BFS. Dinic: O(V) phases, each a blocking flow; unit networks are much faster in practice (<code>O(E min(E^{1/2}, V^{2/3}))</code>).</p>",
    ],
    compare: [
      ["Ford-Fulkerson (DFS)", "unbounded if caps are large", "O(E)", "Do not use with big caps"],
      ["Edmonds-Karp", "O(V E^2)", "O(V+E)", "n <= 200"],
      ["Dinic", "O(V^2 E) worst", "O(V+E)", "Contest default"],
      ["Push-relabel", "O(V^2 E)", "O(V+E)", "Dense; more code"],
    ],
  },
  pitfalls: [
    { title: "No reverse edges",
      bug: "You cannot undo a bad push and the algorithm gets stuck below max flow.",
      fix: "Every add(u,v,c) creates add(v,u,0) and the two store each other's indices." },
    { title: "int overflow on cap sums",
      bug: "n * 1e9 exceeds int.",
      fix: "<code>long</code> capacities and flow." },
    { title: "Using original caps to read the min cut",
      bug: "You need residual reachability, not \"edges that still have cap\".",
      fix: "BFS from s in the residual after the flow run; cut is S \to V\\S." },
    { title: "Multiple edges overwritten in a matrix",
      bug: "An adj-matrix residual silently keeps one cap.",
      fix: "Edge list (Dinic) or add onto the matrix cell." },
    { title: "Bidirected input as two independent caps",
      bug: "Sometimes the statement is undirected: one capacity shared both ways. Model as two directed edges of that cap, which is correct for undirected flow.",
      fix: "Undirected edge of cap c \u2192 add(u,v,c) and add(v,u,c)." },
  ],
  variants: [
    ["Bipartite matching", "s\to L (1), L\to R (1), R\to t (1).", "next page", "Kuhn is shorter"],
    ["Project selection", "s\to profit (profit), cost\to t (cost), inf along prerequisites.", "min cut = -max closure", ""],
    ["Vertex capacities", "Split v into vin\to vout with the vertex cap.", "standard gadget", ""],
  ],
  followups: [
    ["State the max-flow min-cut theorem.",
      "<p>In any flow network the value of a maximum s-t flow equals the capacity of a minimum s-t cut. Proof: weak inequality is easy (any flow is \u2264 any cut); when FF stops, residual-unreachable t gives a cut of capacity equal to the flow.</p>"],
    ["How do you recover the cut edges?",
      "<p>S = residual-reachable from s. Cut edges are original edges u\to v with u in S, v not in S. Their residual is 0 (they are saturated).</p>"],
    ["Why Dinic's current-edge pointer?",
      "<p>Once a residual edge is exhausted inside a blocking-flow phase it will not come back in that phase. The pointer makes each phase scan every edge a constant number of times.</p>"],
    ["Unit-capacity bipartite matching complexity?",
      "<p>Dinic on that network is <code>O(E \u221aV)</code> (Hopcroft-Karp is the same bound with different language). Kuhn is <code>O(VE)</code> and often faster to write for n = 500.</p>"],
  ],
  problems: [
    lc("778", "swim-in-rising-water", "Hard", "Not flow — binary search + DFS; contrast"),
    cf("653D", "Delivery Bears", "Hard", "Binary search + max flow"),
    cf("546E", "Soldier and Traveling", "Medium", "Flow conservation gadget"),
    cf("269C", "Flawed Flow", "Hard", "Reconstruct orientations from a flow"),
    { url: "https://cses.fi/problemset/task/1694", name: "Download Speed", badge: "gfg", tag: "CSES", level: "Medium", pattern: "Dinic template" },
    { url: "https://cses.fi/problemset/task/1695", name: "Police Chase", badge: "gfg", tag: "CSES", level: "Medium", pattern: "Min cut edges" },
    { url: "https://atcoder.jp/contests/practice2/tasks/practice2_d", name: "ACL Max Flow", badge: "atc", tag: "ACL", level: "Medium", pattern: "Library" },
    { url: "https://leetcode.com/problems/maximum-students-taking-exam/", name: "Maximum Students Taking Exam", badge: "lc", tag: "LC 1349", level: "Hard", pattern: "Bipartite matching / flow" },
  ],
  recap: [
    "Max flow = min cut. Residual paths are leftover capacity.",
    "Every edge needs a reverse twin for undo.",
    "Edmonds-Karp = BFS augment. Dinic = levels + blocking flow.",
    "Min cut = residual-reachable from s after the run.",
    "Modelling (gadgets) is most of the problem.",
  ],
  oneliner: "while BFS residual s-t: push bottleneck; reverse +=; // Dinic: levels then blocking DFS",
});
  t.visuals.push(
    {
      kind: "mermaid",
      vizId: "maxFlowAug1",
      h3: "After augmentation 1 (push 1 on s-t)",
      caption: "Labels are flow/capacity. Residual s-t is now 0. The next BFS must go s-a-t.",
      src: `graph LR
  nS1["s"] -->|"0/3"| nA1["a"]
  nA1 -->|"0/2"| nT1["t"]
  nS1 -->|"1/1"| nT1`,
    },
    {
      kind: "mermaid",
      vizId: "maxFlowAug2",
      h3: "After augmentation 2 (push 2 on s-a-t)",
      caption: "Labels are flow/capacity. a-t and s-t are saturated. Residual-reachable from s is {s,a}: the min cut of capacity 3.",
      src: `graph LR
  nS2["s"] -->|"2/3"| nA2["a"]
  nA2 -->|"2/2"| nT2["t"]
  nS2 -->|"1/1"| nT2`,
    },
  );
  return t;
})(),

/* ============================== 9. bipartite-matching ================= */
pack({
  id: "bipartite-matching",
  difficulty: "Medium",
  readTime: "22 min",
  tagline: "A matching is a set of edges with no shared vertex. In a bipartite graph, Kuhn / Hopcroft-Karp (or unit flow) finds a maximum matching in polynomial time. K\u0151nig: max matching = min vertex cover.",
  tags: ["matching", "Kuhn", "Kőnig", "P2"],
  prereqs: [
    ["Max Flow / Min Cut", "max-flow-min-cut.html"],
    ["Cycle Detection & Bipartite", "../07-graphs-core/cycle-detection-and-bipartite.html"],
  ],
  why: [
    "Assigning jobs to workers, boys to girls, rows to columns of a chessboard — if the graph is bipartite, a maximum matching is the complete answer and is not NP-hard. Kuhn's DFS-augment is twenty lines; Hopcroft-Karp is the faster version you write when n is a few thousand.",
    "K\u0151nig's theorem: in a bipartite graph the size of a maximum matching equals the size of a minimum vertex cover. Hall's marriage theorem is the existence form. After a max matching, a min cover is recovered from the Hungarian forest (unsaturated L, alternate reach).",
    "The flow view is the same algorithm: s \to L \to R \to t with unit capacities. Write Kuhn when you want less code; write Dinic when you already have a flow snippet and the graph is bigger.",
  ],
  insight: "An augmenting path alternates free-edge / matching-edge and starts at a free left vertex. Flipping it increases the matching by one. When none exists, the matching is maximum (Berge).",
  yes: [
    "Bipartite graph, maximum number of pairs",
    "Minimum vertex cover / maximum independent set on a bipartite graph (n - matching)",
    "Assign rows to columns with forbidden cells (rook placement)",
    "n <= 500 Kuhn, n <= 2000 Hopcroft-Karp / Dinic",
    "You already proved the graph is bipartite",
  ],
  no: [
    "General-graph matching &rarr; Blossom, not this page",
    "Weighted assignment &rarr; Hungarian / min-cost flow",
    "The graph is not bipartite and you still want a pairing &rarr; different algorithm",
    "Edge cover vs vertex cover — different theorems",
  ],
  table: [
    ["Max matching, n<=500", "DFS augment from each free L", "Kuhn"],
    ["n<=2000, dense-ish", "Hopcroft-Karp / Dinic", "O(E \u221aV)"],
    ["Min vertex cover", "Hungarian forest after max matching", "Kőnig"],
    ["Max independent set", "n - max matching (bipartite)", "same"],
    ["Weighted", "Hungarian or MCMF", "not unweighted Kuhn"],
    ["<strong>Confused with:</strong> general matching", "Odd cycles need blossoms", "Edmonds, not Kuhn"],
  ],
  constraint: "<code>|L|, |R| \le 500</code> is Kuhn. <code>2000</code> wants Hopcroft-Karp or Dinic. Recursion depth is the augmenting-path length; iterative is safer on CF Java.",
  core: [
    "Kuhn: <code>matchR[r] = -1</code>. For each left u, DFS: try unused neighbours v; if v is free or <code>dfs(matchR[v])</code> succeeds, set matchR[v]=u and return true. Clear the seen-on-right array every start from a free u (or every phase).",
    "Min vertex cover: from all free left vertices, walk unused edges L\to R and matching edges R\to L (the Hungarian forest). Cover = (unvisited L) \u222a (visited R).",
  ],
  invariant: "<p>Berge: a matching is maximum iff there is no augmenting path. Kuhn searches one from every free left vertex. After termination, K\u0151nig's construction on the Hungarian forest is a vertex cover of the same size.</p>",
  array: [-1, 0, 1],
  arrayLabel: "matchR =",
  indexLabels: ["r0", "r1", "r2"],
  vars: ["u", "v", "match"],
  frames: [
    { note: "L={0,1,2}, R={0,1,2}. Edges 0-0, 0-1, 1-1, 2-2.",
      active: [0], values: { u: 0, v: 0, match: "free" } },
    { note: "u=0 takes r0. matchR[0]=0.",
      active: [0], values: { u: 0, v: 0, match: "0\to r0" } },
    { note: "u=1 wants r1 (free). matchR[1]=1.",
      active: [1], values: { u: 1, v: 1, match: "1\to r1" } },
    { note: "u=2 takes r2. Matching size 3.",
      active: [2], values: { u: 2, v: 2, match: "2\to r2" } },
    { note: "If r1 were taken, u=1 would DFS into matchR[1] and try to rematch that left vertex.",
      active: [1], values: { u: 1, v: 1, match: "augment flip" } },
    { note: "No free L remains. Maximum matching = 3.",
      active: [0, 1, 2], values: { u: "done", v: "—", match: "size 3" } },
  ],
  mermaid: `graph LR
  s["s"] -->|"1/1"| l0["L0"]
  s -->|"1/1"| l1["L1"]
  l0 -->|"1/1"| r0["R0"]
  l1 -->|"1/1"| r1["R1"]
  r0 -->|"1/1"| t["t"]
  r1 -->|"1/1"| t`,
  merCaption: "Unit-capacity flow network for the same matching. Labels are flow/capacity.",
  steps: [
    "<strong>Confirm bipartite</strong> (2-colour). If you already have L and R, skip.",
    "<strong>matchR = -1</strong>. For each left u, clear seen, DFS-augment.",
    "<strong>DFS:</strong> try each unused neighbour; claim it if free or if its match can rematch.",
    "<strong>Size</strong> is the number of r with matchR[r] != -1.",
    "<strong>Min cover:</strong> Hungarian forest from free L; cover = unvisited L + visited R.",
    "<strong>Independent set</strong> is the complement of the cover (size n - matching).",
  ],
  code: [
    { tab: "Brute", file: "MatchBrute.java",
      code: `import java.util.*;
public class MatchBrute {
    static int max(int n, List<Integer>[] g) {
        int best = 0, lim = 1 << n;
        for (int m = 0; m < lim; m++) {
            boolean[] used = new boolean[n];
            int ok = 1, cnt = 0;
            for (int u = 0; u < n && ok == 1; u++) if (((m >> u) & 1) == 1) {
                boolean got = false;
                for (int v : g[u]) if (!used[v]) { used[v] = true; got = true; break; }
                if (!got) ok = 0;
                else cnt++;
            }
            if (ok == 1) best = Math.max(best, cnt);
        }
        return best;
    }
    public static void main(String[] args) {
        List<Integer>[] g = new List[2];
        g[0] = List.of(0, 1); g[1] = List.of(1);
        System.out.println(max(2, g));
    }
    // Input : L0-R0, L0-R1, L1-R1
    // Output: 2
}` },
    { tab: "Optimal", file: "Kuhn.java",
      code: `import java.util.*;
public class Kuhn {
    List<Integer>[] g;
    int[] match;
    boolean[] seen;
    Kuhn(int nL, int nR) {
        g = new List[nL];
        for (int i = 0; i < nL; i++) g[i] = new ArrayList<>();
        match = new int[nR];
        Arrays.fill(match, -1);
    }
    boolean dfs(int u) {
        for (int v : g[u]) {
            if (seen[v]) continue;
            seen[v] = true;
            if (match[v] == -1 || dfs(match[v])) { match[v] = u; return true; }
        }
        return false;
    }
    int maxMatching() {
        int ans = 0;
        for (int u = 0; u < g.length; u++) {
            seen = new boolean[match.length];
            if (dfs(u)) ans++;
        }
        return ans;
    }
    public static void main(String[] args) {
        Kuhn k = new Kuhn(2, 2);
        k.g[0].add(0); k.g[0].add(1); k.g[1].add(1);
        System.out.println(k.maxMatching());
    }
    // Input : L0-R0, L0-R1, L1-R1
    // Output: 2
}` },
    { tab: "Template", file: "KonigCover.java",
      code: `import java.util.*;
public class KonigCover {
    static List<Integer>[] g;
    static int[] matchR, matchL;
    static boolean[] visL, visR;
    static void dfs(int u) {
        visL[u] = true;
        for (int v : g[u]) if (!visR[v] && matchL[u] != v) {
            visR[v] = true;
            if (matchR[v] != -1) dfs(matchR[v]);
        }
    }
    public static void main(String[] args) {
        g = new List[2];
        g[0] = new ArrayList<>(List.of(0, 1));
        g[1] = new ArrayList<>(List.of(1));
        matchR = new int[] {0, 1};
        matchL = new int[] {0, 1};
        visL = new boolean[2]; visR = new boolean[2];
        // no free L in this tiny perfect matching
        System.out.println(Arrays.toString(visL) + " " + Arrays.toString(visR));
    }
    // Input : perfect matching of size 2
    // Output: [false, false] [false, false]
}` },
  ],
  complexity: {
    time: "Kuhn O(V E), Hopcroft-Karp O(E \u221aV)",
    space: "O(V + E)",
    derivation: [
      "<p>Kuhn starts an O(E) DFS from each of V left vertices, so O(VE). Hopcroft-Karp (and Dinic on the unit network) groups shortest augmenting paths into phases; there are O(\u221aV) phases.</p>",
    ],
    compare: [
      ["Kuhn", "O(VE)", "O(V+E)", "n <= 500"],
      ["Hopcroft-Karp / Dinic", "O(E \u221aV)", "O(V+E)", "n <= 2000"],
      ["General Blossom", "O(V^3)", "O(V+E)", "Non-bipartite"],
      ["Hungarian weighted", "O(V^3)", "O(V^2)", "Costs on edges"],
    ],
  },
  pitfalls: [
    { title: "Not resetting seen per left vertex",
      bug: "A failed attempt poisons the seen flags and later left vertices cannot use those right vertices.",
      fix: "New <code>seen[]</code> (or a vis-token) every time you start from a free u." },
    { title: "Running Kuhn on a non-bipartite graph",
      bug: "Odd-cycle blossoms are ignored; the matching can be non-maximum.",
      fix: "2-colour first. If it fails, you need Blossom or a different model." },
    { title: "Min cover = the matched vertices",
      bug: "That set can miss an unmatched cover vertex or include both ends of a matching edge.",
      fix: "Hungarian forest: free L, alternate; cover = unvisited L \u222a visited R." },
    { title: "Independent set = the matching",
      bug: "A matching is an edge set. Max independent set on a bipartite graph is n - matching (vertices).",
      fix: "Complement of the min vertex cover." },
    { title: "Flow gadget with cap 2 on L-R edges",
      bug: "A left vertex can then match two rights.",
      fix: "s\to L and R\to t have cap 1; L\to R cap 1 is enough and necessary." },
  ],
  variants: [
    ["Minimum path cover on a DAG", "Split vertices, edge u\to v becomes u_out-v_in; path cover = n - matching.", "classic", ""],
    ["Weighted assignment", "Hungarian, or MCMF with cost = -weight.", "O(n^3)", ""],
    ["Hall violator", "The unreachable side of the Hungarian forest is a Hall-violating set.", "debug assignments", ""],
  ],
  followups: [
    ["State Kőnig's theorem.",
      "<p>In a bipartite graph, the cardinality of a maximum matching equals the cardinality of a minimum vertex cover. The Hungarian-forest construction is the proof you can code.</p>"],
    ["Maximum independent set?",
      "<p>On a bipartite graph it is <code>n - max matching</code>: the complement of a min vertex cover. On a general graph it is NP-hard.</p>"],
    ["How do you recover the actual pairs?",
      "<p><code>matchR[v] = u</code> means edge u-v is in the matching. Invert if you want matchL.</p>"],
    ["Kuhn vs Hopcroft-Karp in an interview?",
      "<p>Kuhn. Mention the O(E \u221aV) algorithm and the flow reduction. Do not write HK from scratch unless asked.</p>"],
  ],
  problems: [
    lc("785", "is-graph-bipartite", "Medium", "The check you run first"),
    lc("1349", "maximum-students-taking-exam", "Hard", "Grid matching"),
    cf("489B", "BerSU Ball", "Easy", "Greedy almost-matching"),
    cf("1139E", "Maximize Mex", "Hard", "Matching + offline deletions"),
    { url: "https://codeforces.com/problemset/problem/1139/C", name: "Edgy Trees", badge: "cf", tag: "CF 1139C", level: "Medium", pattern: "Not matching — extra CF" },
    { url: "https://cses.fi/problemset/task/1696", name: "School Dance", badge: "gfg", tag: "CSES", level: "Medium", pattern: "Kuhn / flow template" },
    { url: "https://atcoder.jp/contests/practice2/tasks/practice2_d", name: "ACL Matching via flow", badge: "atc", tag: "ACL", level: "Medium", pattern: "Dinic matching" },
    { url: "https://www.spoj.com/problems/MATCHING/", name: "Fast Maximum Matching", badge: "gfg", tag: "SPOJ", level: "Hard", pattern: "Hopcroft-Karp" },
  ],
  recap: [
    "Berge: no augmenting path \u21d4 maximum matching.",
    "Kuhn: DFS-augment from every free left vertex; reset seen.",
    "Kőnig: max matching = min vertex cover (bipartite only).",
    "Independent set = n - matching.",
    "Unit flow s-L-R-t is the same matching.",
  ],
  oneliner: "for each free u: dfs try v; if (match[v]<0 || dfs(match[v])) match[v]=u;",
}),
];



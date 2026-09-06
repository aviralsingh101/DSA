/* Module 08 — Graphs: Advanced */
import { pack, lc, cf } from "./pack.mjs";

export const topics = [

/* ============================== 1. bellman-ford ======================= */
pack({
  id: "bellman-ford-and-negative-cycles",
  difficulty: "Medium",
  readTime: "26 min",
  tagline: "Relax every edge <code>n-1</code> times. A successful relaxation on the n-th pass is a negative cycle that can reach the target.",
  tags: ["Bellman-Ford", "negative cycle", "shortest path", "P1"],
  prereqs: [["Dijkstra's Algorithm", "../07-graphs-core/dijkstra.html"]],
  why: [
    "You are pricing delivery routes across a handful of towns. Most roads cost money to drive, but a few of them pay you: one sponsor refunds 3 units if your van passes through their town, so that road carries a weight of &minus;3. You want the cheapest cost from town 0 to every other town. The tool you would normally reach for, Dijkstra, works by repeatedly picking the unfinished town with the smallest known cost and declaring that cost final forever. With a refund in the graph that declaration is simply false: a town you settled at cost 7 can later be reached for 4 through a road that pays you back, and Dijkstra never reopens a settled town. There is no crash and no warning, just a wrong number in the output.",
    "The algorithm on this page throws the clever ordering away and does something brutally simple instead. To <em>relax</em> an edge from <code>u</code> to <code>v</code> of weight <code>w</code> means one check: if <code>dist[u] + w</code> is smaller than the value currently stored in <code>dist[v]</code>, overwrite <code>dist[v]</code> with it. Bellman-Ford relaxes every edge in the graph, then relaxes every edge again, and repeats that sweep <code>n-1</code> times, where <code>n</code> is the number of towns. There is no priority queue and no such thing as a settled vertex, so a discovery made late is always allowed to improve a value written early. With <code>n = 2000</code> towns and <code>m = 5000</code> roads the whole run is 2000 &times; 5000 = <code>10&#8310;</code> edge checks, a few milliseconds.",
    "Why exactly <code>n-1</code> sweeps and not some other number? After the first sweep every distance reachable using a single road is correct; after the second, every distance reachable using two roads; and in general after sweep <code>i</code> the array is correct for every route of at most <code>i</code> roads. A route that never revisits a town touches at most <code>n</code> towns and therefore at most <code>n-1</code> roads, so <code>n-1</code> sweeps cover every sensible route. That bound also hands you a free detector. Run one extra sweep, and if some edge still improves a distance, the only possible explanation is a route that revisits a town and gets cheaper by doing so &mdash; a <em>negative cycle</em>, a loop whose weights sum to a negative number, which you could drive round forever to push the cost down without limit.",
    "In a problem statement the tell is a sentence that explicitly allows negative weights, or a question phrased as \"can you profit forever\", sitting beside small limits such as <code>n &le; 2&times;10&#179;</code> and <code>m &le; 5&times;10&#179;</code>. Two standard disguises are worth memorising. \"Cheapest flight with at most <code>k</code> stops\" is this algorithm stopped after <code>k+1</code> sweeps instead of <code>n-1</code>, because the sweep counter <em>is</em> the edge budget. Currency arbitrage is the other: set each exchange edge to <code>-log(rate)</code> so that multiplying rates becomes adding weights, and a sequence of trades that multiplies your money by more than one becomes exactly a cycle of negative total weight.",
  ],
  insight: "After <code>i</code> full sweeps of the edge list, <code>dist[v]</code> is exactly the cost of the cheapest route from the source to <code>v</code> that spends at most <code>i</code> edges, so the sweep counter is really an edge budget. An honest route never needs more than <code>n-1</code> edges, which is why anything that still improves on sweep <code>n</code> must be looping to save money rather than travelling somewhere new.",
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
  constraint: "<code>n &le; 2&times;10&#179;</code> and <code>m &le; 5&times;10&#179;</code> is the window where <code>n &times; m</code> fits. Distances need <code>long</code> because a path of <code>n</code> edges each of size <code>10&#8309;</code> already hits <code>2&times;10&#185;&#8308;</code>. An undirected negative edge stored both ways is already a negative cycle of length 2, so confirm the statement is directed before you duplicate every road.",
  core: [
    "Keep the graph as a flat list of triples <code>(u, v, w)</code> rather than adjacency lists, because each sweep must look at every road anyway. Allocate <code>dist[0..n-1]</code> filled with a huge sentinel, set <code>dist[src] = 0</code>, and allocate <code>par[v] = -1</code> so you can walk a route backwards later. To <em>relax</em> the edge <code>u &rarr; v</code> of weight <code>w</code> means: if <code>dist[u]</code> is already a real number and <code>dist[u] + w</code> is strictly smaller than <code>dist[v]</code>, overwrite <code>dist[v]</code> and remember <code>par[v] = u</code>. Never relax from the sentinel: adding a negative weight to \"infinity\" fabricates a finite junk distance to a town the source cannot reach.",
    "Repeat that sweep over the whole edge list exactly <code>n-1</code> times. After sweep <code>i</code> the array holds the cheapest walk that uses at most <code>i</code> edges, so <code>n-1</code> sweeps cover every walk that never revisits a town. Then run one extra sweep and collect every vertex whose distance still drops: each such victim sits on, or can be reached from, a <em>negative cycle</em> &mdash; a loop whose weights sum to a negative number. To print the loop, walk <code>par</code> exactly <code>n</code> steps from any victim (that walk is long enough to be forced onto the cycle) and then walk until a vertex repeats. To mark every town whose cheapest cost is unbounded, flood forwards from those victims, or flood on the reverse graph if the question is \"can the source cheat its way to <code>t</code>\".",
    "Walk the four-town sample in words. Edges are <code>0 &rarr; 1</code> weight 5, <code>0 &rarr; 2</code> weight 4, <code>2 &rarr; 1</code> weight &minus;2, <code>1 &rarr; 3</code> weight 1, <code>2 &rarr; 3</code> weight 3, source 0. After the first sweep <code>dist</code> is <code>[0, 2, 4, 3]</code> because the refund <code>2 &rarr; 1</code> improves town 1 from 5 down to 2 and then town 3 from 6 down to 3. The second sweep changes nothing, and neither does the extra detection sweep, so there is no negative cycle reachable from 0 and those four numbers are final.",
  ],
  extra: [
    {
      kind: "key",
      title: "The extra sweep is the cycle detector",
      html: "<p>A walk that still improves after <code>n-1</code> edges must repeat a vertex and get cheaper by doing so. That is the definition of a negative cycle reachable from the source. The extra sweep does not compute a new distance; it only raises a flag, and the parent pointers already stored during the first <code>n-1</code> sweeps are what you walk to recover the loop.</p>",
    },
    {
      kind: "warn",
      title: "Never relax from the sentinel",
      html: "<p>If <code>dist[u]</code> is still INF, the source has not reached <code>u</code>. Adding a negative <code>w</code> would write a finite number into <code>dist[v]</code> and pretend a path exists. Gate every relax on <code>dist[u]</code> being finite, and pick a sentinel such as <code>Long.MAX_VALUE / 4</code> so even a legal finite add cannot overflow.</p>",
    },
  ],
  invariant: "<p>After sweep <code>i</code>, <code>dist[v]</code> equals the minimum weight of a walk from the source to <code>v</code> that uses at most <code>i</code> edges, or INF if no such walk exists.</p><p>In plain words, the sweep counter is an edge budget, not a clock: each full pass of the edge list is allowed to grow every surviving route by exactly one more road, and a route that never loops cannot need more than <code>n-1</code> roads. That is why a successful relax on sweep <code>n</code> cannot be travelling somewhere new &mdash; it must be looping to save money.</p>",
  array: [0, 5, 2, 6],
  arrayLabel: "dist =",
  indexLabels: ["0", "1", "2", "3"],
  vars: ["pass", "edge", "dist"],
  frames: [
    { note: "Edges: 0&rarr;1 weight 5, 0&rarr;2 weight 4, 2&rarr;1 weight &minus;2, 1&rarr;3 weight 1, 2&rarr;3 weight 3. Source 0 starts at cost 0; every other town is still unknown.",
      active: [0], values: { pass: 0, edge: "init", dist: "0,inf,inf,inf" } },
    { note: "First sweep: the two roads out of 0 write dist[1]=5 and dist[2]=4, the cheapest one-edge routes from the source.",
      active: [1, 2], values: { pass: 1, edge: "0-1, 0-2", dist: "0,5,4,inf" } },
    { note: "Still the first sweep: the refund 2&rarr;1 improves town 1 from 5 down to 2, and 1&rarr;3 then writes dist[3]=3 rather than the worse 7 via 2.",
      active: [1, 3], values: { pass: 1, edge: "2-1, 1-3", dist: "0,2,4,3" } },
    { note: "The same first sweep, after dist[1] became 2, set dist[3] to 3. The array is now [0, 2, 4, 3] and every one-or-two-edge route has been tried.",
      active: [3], values: { pass: 1, edge: "1-3 again", dist: "0,2,4,3" } },
    { note: "Second sweep re-checks every road and changes nothing: 2&rarr;1 is already 2 and 1&rarr;3 is already 3, so later sweeps have no work left.",
      active: [0, 1, 2, 3], values: { pass: 2, edge: "none", dist: "0,2,4,3" } },
    { note: "The extra detection sweep, pass n=4, finds no improvement either, so no negative cycle can be reached from town 0.",
      active: [0], values: { pass: 4, edge: "detect", dist: "stable" } },
  ],
  mermaid: `graph LR
  n0["0"] -->|"5"| n1["1"]
  n0 -->|"4"| n2["2"]
  n2 -->|"-2"| n1
  n1 -->|"1"| n3["3"]
  n2 -->|"3"| n3`,
  steps: [
    "<strong>Initialise distances and parents.</strong> Set <code>dist[src] = 0</code>, fill every other slot with a huge sentinel, and set <code>par[v] = -1</code>, so a town with no written route is visibly unreachable and a later walk has a place to start.",
    "<strong>Sweep the edge list n-1 times.</strong> For every triple <code>(u, v, w)</code>, if <code>dist[u]</code> is finite and <code>dist[u] + w</code> beats <code>dist[v]</code>, overwrite the distance and remember <code>par[v] = u</code>, because only a real route is allowed to improve another town.",
    "<strong>Stop a sweep early when nothing moves.</strong> If a full pass of the edge list changes no entry, later passes cannot change anything either, so you may break; the extra detection sweep is then guaranteed to be quiet as well.",
    "<strong>Run one more sweep as a detector.</strong> Collect every vertex whose distance still drops on sweep <code>n</code>: each of those victims is on, or reachable from, a negative cycle, and that is the only information this extra pass is meant to produce.",
    "<strong>Recover a cycle from the parent pointers.</strong> Starting at any victim, follow <code>par</code> exactly <code>n</code> times so the walk is forced onto the loop, then walk once more until a vertex repeats and emit that loop.",
    "<strong>Mark every town that can be driven to minus infinity.</strong> Flood forwards from the victims (or on the reverse graph, if the question is whether the source can cheat its way to a given target) so every node that inherits the unbounded improvement is flagged.",
  ],
  dryIntro: "Four towns, source 0, and one refund edge 2&rarr;1 of weight &minus;2. Watch dist settle at [0, 2, 4, 3] and the extra sweep stay quiet.",
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
      "<p>Each of the <code>n-1</code> sweeps looks at every one of the <code>m</code> edges, and the extra detection sweep does the same, so the work is <code>(n) &times; m</code> relax attempts. At the usual limits that is 2000 &times; 5000 = <code>10&#8310;</code> additions, a few milliseconds. The parent array and the distance array are both length <code>n</code>, and the edge list is length <code>m</code>, so the memory is linear in the input.</p>",
      "<p>SPFA queues only the vertices that just improved and is faster on random graphs, but an adversary can force a vertex to re-enter the queue exponentially often. Do not ship SPFA on a contest that allows worst-case input unless you add a visit cutoff of about <code>n</code> and fall back to this <code>O(nm)</code> sweep when the cutoff fires.</p>",
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
      bug: "<code>INF + negative</code> wraps into a finite junk distance, so a town the source cannot reach looks reachable and the extra sweep may even raise a false cycle flag.",
      fix: "Gate every relax on <code>dist[u]</code> being finite, and pick a sentinel such as <code>Long.MAX_VALUE / 4</code> so a legal add cannot overflow either." },
    { title: "int overflow",
      bug: "A path of <code>n</code> edges each of size <code>10&#8309;</code> exceeds <code>Integer.MAX_VALUE</code>, so a real shortest path wraps negative and looks like a cycle the extra sweep will \"detect\".",
      fix: "Store <code>long[] dist</code> and add with a <code>long</code> cast. Test on a three-edge path of weight <code>10&#8309;</code> each and check the printed sum is <code>3&times;10&#8309;</code>." },
    { title: "Nth-pass victim is not on the cycle",
      bug: "A victim is only reachable <em>from</em> the cycle, so walking <code>par</code> once can stop on a tree edge that leads into the loop rather than on the loop itself, and the printed walk is not closed.",
      fix: "Walk parent exactly <code>n</code> times first so you are forced onto the cycle, then walk until a vertex repeats. Test on a cycle with a tail hanging off it." },
    { title: "Undirected negative edge",
      bug: "Storing both orientations of a single negative undirected edge creates a two-cycle whose weights sum negative, so the detector fires on a graph that had no interesting loop.",
      fix: "Undirected negatives are almost always a modelling error. Confirm the statement is directed before you duplicate every road, and if it is undirected then reject a negative weight immediately." },
    { title: "In-place relax for \"at most k edges\"",
      bug: "Using one array lets a sweep read a distance written earlier in the same sweep, which is a walk of more than one extra edge, so \"at most k stops\" silently becomes \"at most many stops\".",
      fix: "Clone <code>dist</code> at the start of each sweep and write improvements into the clone (LC 787). Test on a two-edge cheapest route that should be illegal when <code>k = 0</code>." },
  ],
  variants: [
    ["k stops", "Exactly k extra edges: k+1 passes, two arrays.", "LC 787", "cheapest flights"],
    ["SPFA", "Queue only vertices that improved. Fast typical, worst-case exponential.", "cutoff visits > n", "use with care"],
    ["Arbitrage", "Edge weight = -log(rate). A negative cycle is a profitable loop.", "print the cycle", "CF 15D-ish"],
  ],
  followups: [
    ["Why n-1, not n?",
      "<p>A walk that never revisits a town uses at most <code>n-1</code> roads, because it touches at most <code>n</code> towns. If a cheaper walk still uses <code>n</code> roads it must repeat a town, and the loop it closed must have negative total weight &mdash; otherwise dropping the loop would be cheaper. That is why sweep <code>n</code> is reserved for detection rather than for computing one more honest distance.</p>"],
    ["Does BF work on undirected graphs?",
      "<p>Yes, but only when every weight is non-negative, in which case you may store both orientations and the extra sweep will stay quiet. A single negative undirected edge stored both ways is already a negative two-cycle, so the detector fires immediately. If the statement really is undirected and allows a negative road, the cheapest cost is unbounded and you should reject the input rather than run this algorithm.</p>"],
    ["How do you list every node that can be driven to -INF?",
      "<p>After the extra sweep, the victims are the towns whose distance still improved. Flood forwards from those victims along the original edges to mark everyone who can inherit the unbounded improvement. If the question is \"can the source cheat its way to <code>t</code>\", you also need the victim to be reachable from the source, which the first <code>n-1</code> sweeps already recorded as a finite <code>dist</code>.</p>"],
    ["Bellman-Ford vs Dijkstra with potentials?",
      "<p>Johnson's algorithm runs Bellman-Ford once from a dummy source that has a zero-weight edge into every vertex, reads the resulting distances as <em>potentials</em>, and rewrites every edge weight as <code>w + pot[u] - pot[v]</code>. Those reduced weights are non-negative when no negative cycle exists, so you may then run Dijkstra from every source. That is the all-pairs tool when <code>n</code> is too big for Floyd-Warshall but the graph is sparse and has no negative cycle.</p>"],
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
  readTime: "26 min",
  tagline: "The triple loop <code>for k, for i, for j</code> is \"allow vertex k as an intermediate\". After k = 0..n-1 every pair is optimal.",
  tags: ["Floyd-Warshall", "all-pairs", "APSP", "P1"],
  prereqs: [["Bellman-Ford & Negative Cycles", "bellman-ford-and-negative-cycles.html"]],
  why: [
    "You are given a handful of cities and the one-way flight cost between some pairs, and you must answer \"what is the cheapest way from every city to every other city?\" &mdash; the whole square table, not a single source. Running Dijkstra once per city works when every cost is non-negative and the graph is sparse, but with <code>n = 400</code> cities a dense table already has about 160000 flights, and four hundred heap runs are more code and no faster than one tight triple loop. You also want extras the heap will not give you: a reachability matrix, the smallest bottleneck between every pair, or a flag that some loop of flights refunds money forever.",
    "The algorithm on this page fills an <code>n</code> by <code>n</code> table <code>d</code> by asking one question at a time: \"if I am now allowed to use city <code>k</code> as a stopover, does going <code>i &rarr; k &rarr; j</code> beat the best route I already have from <code>i</code> to <code>j</code>?\" That is the single assignment <code>d[i][j] = min(d[i][j], d[i][k] + d[k][j])</code>. The outer loop is <code>k</code>, not <code>i</code>: you must finish every pair's answer using only stopovers from <code>{0, 1, &hellip;, k-1}</code> before anyone is allowed to use city <code>k</code>. After <code>k</code> has run from 0 through <code>n-1</code>, every city has been allowed as a stopover and the table is the true all-pairs answer.",
    "The same three loops do more than distances. Replace the min-plus update with a boolean OR and you get <em>transitive closure</em> &mdash; a yes/no matrix of who can reach whom. Replace the sum with a max and the outer min stays, and you get the minimax (smallest bottleneck) path between every pair. After the loops, a negative number on the diagonal <code>d[i][i]</code> means a negative cycle touches city <code>i</code>. In a problem statement the tell is <code>n &le; 400</code> sitting next to \"distance between every pair\", \"can A reach B after these prerequisites\", or \"smallest max-edge on a path\".",
  ],
  insight: "The outer index <code>k</code> is not a source and not a destination: it is the highest-numbered city you are now allowed to use as a stopover. After the <code>k</code> iteration, <code>d[i][j]</code> is the cheapest <code>i</code>-to-<code>j</code> route whose internal cities all lie in <code>{0, 1, &hellip;, k}</code>, which is why the loop order is always <code>k</code>, then <code>i</code>, then <code>j</code>.",
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
  constraint: "<code>n &le; 400</code> is the Floyd signature: the triple loop is <code>n&sup3;</code> additions, about 64 million at the cap, which is comfortable, and a billion at <code>n = 1000</code>, which is not. Use <code>long</code> and a sentinel such as <code>Long.MAX_VALUE / 4</code> so two infinities cannot add into a small negative and fake a path. If the graph is sparse and weights are non-negative, <code>n</code> Dijkstras will beat this table.",
  core: [
    "Allocate <code>long[n][n]</code>, fill every cell with a huge sentinel, then write <code>d[i][i] = 0</code> so a city reaches itself at cost 0. For each flight <code>u &rarr; v</code> of cost <code>w</code> store <code>d[u][v] = min(d[u][v], w)</code>, keeping the cheaper of two parallel flights. If the statement is undirected, write both <code>d[u][v]</code> and <code>d[v][u]</code>. That filled table is the answer using <em>no</em> intermediate city, and it is the base of the dynamic program.",
    "Now allow stopovers one city at a time. The outer loop is <code>k</code> from 0 to <code>n-1</code>. For every pair <code>(i, j)</code>, if both <code>d[i][k]</code> and <code>d[k][j]</code> are finite, try <code>d[i][j] = min(d[i][j], d[i][k] + d[k][j])</code>. Skipping a half that is still infinite is not a micro-optimisation: adding two sentinels can overflow to a small negative and invent a phantom path. Whenever a relax succeeds and you need the actual route, set <code>nxt[i][j] = nxt[i][k]</code> so a later walk from <code>i</code> follows the first hop toward <code>k</code>.",
    "Walk the four-city sample in words. Flights are 0-1 cost 3, 0-2 cost 8, 1-2 cost 1, 2-3 cost 1, 1-3 cost 7, and we watch row 0. After <code>k = 0</code> nothing new appears, because using city 0 as a stopover cannot help a route that already starts at 0. After <code>k = 1</code> the route 0-1-2 beats the direct 8 with 3+1=4, and 0-1-3 writes 10. After <code>k = 2</code> the route 0-2-3 beats 10 with 4+1=5. City 3 as a stopover adds nothing for this row, and the finished row is <code>[0, 3, 4, 5]</code>.",
  ],
  extra: [
    {
      kind: "key",
      title: "k is a newly allowed stopover, not a source",
      html: "<p>People coming from Dijkstra hear \"for each source\" and write <code>i</code> as the outer loop. That updates a pair using a stopover whose own row is not finished yet, so the recurrence is no longer \"intermediates from a prefix of cities\". Keep <code>k</code> outermost, always. The same skeleton with OR instead of min-plus is transitive closure; with <code>min</code> of <code>max</code> it is the smallest bottleneck.</p>",
    },
  ],
  invariant: "<p>After the outer iteration that has just processed city <code>k</code>, <code>d[i][j]</code> is the cheapest path from <code>i</code> to <code>j</code> whose internal vertices all lie in <code>{0, 1, &hellip;, k}</code>, or INF if no such path exists.</p><p>In plain words, each outer iteration only asks \"may I now use this one extra city as a stopover?\", and because every pair has already been optimised for the previous set of stopovers, trying the new city on every pair is enough. A negative <code>d[i][i]</code> at the end means a loop of negative total weight touches city <code>i</code>.</p>",
  array: [0, 3, 4, 5],
  arrayLabel: "d[0] =",
  indexLabels: ["0", "1", "2", "3"],
  vars: ["k", "i", "j", "d"],
  frames: [
    { note: "Four cities. Flights 0-1 cost 3, 0-2 cost 8, 1-2 cost 1, 2-3 cost 1, 1-3 cost 7. Row 0 of the table starts as [0, 3, 8, inf].",
      active: [0], values: { k: "-", i: 0, j: "-", d: "0,3,8,inf" } },
    { note: "Allowing city 0 as a stopover adds nothing new to row 0, because every route that already starts at 0 does not need to visit 0 again.",
      active: [0], values: { k: 0, i: 0, j: "*", d: "0,3,8,inf" } },
    { note: "Allowing city 1: the route 0&rarr;1&rarr;2 costs 3+1=4 and beats the direct 8, so d[0][2] drops from 8 to 4.",
      active: [2], values: { k: 1, i: 0, j: 2, d: "0,3,4,inf" } },
    { note: "Still with city 1 allowed: 0&rarr;1&rarr;3 costs 3+7=10, which is the first finite number written into d[0][3].",
      active: [3], values: { k: 1, i: 0, j: 3, d: "0,3,4,10" } },
    { note: "Allowing city 2: 0&rarr;2&rarr;3 costs 4+1=5 and beats the 10 we just wrote, so d[0][3] becomes 5.",
      active: [3], values: { k: 2, i: 0, j: 3, d: "0,3,4,5" } },
    { note: "Allowing city 3 as a stopover cannot help a route that already ends at 3 in this row. The finished row is [0, 3, 4, 5].",
      active: [0, 1, 2, 3], values: { k: 3, i: 0, j: "*", d: "0,3,4,5" } },
  ],
  mermaid: `graph LR
  a["i"] -->|"d i k"| mid["k newly allowed"]
  mid -->|"d k j"| b["j"]
  a -->|"d i j"| b`,
  steps: [
    "<strong>Allocate the table and write the base.</strong> Fill <code>long[n][n]</code> with a huge sentinel, zero the diagonal so each city reaches itself at cost 0, and write every flight (both ways if the graph is undirected), keeping the cheaper of two parallel flights.",
    "<strong>Loop k first: k is the newly allowed stopover.</strong> The outer index is the highest-numbered city you may now use in the middle of a route, not a source and not a destination, which is why swapping the loop order silently breaks the recurrence.",
    "<strong>Then loop every pair (i, j) and try i &rarr; k &rarr; j.</strong> If both halves of that candidate are finite, write <code>d[i][j] = min(d[i][j], d[i][k] + d[k][j])</code>, because that is exactly \"use the new stopover or keep what you already had\".",
    "<strong>Skip the add when either half is still infinite.</strong> Adding two sentinels can overflow to a small negative and invent a phantom path between two cities that cannot reach each other, so the finite-gate is part of correctness, not a speed hack.",
    "<strong>Read the finished table, then inspect the diagonal.</strong> <code>d[u][v]</code> is the cheapest <code>u</code>-to-<code>v</code> cost, or still infinite if unreachable, and a negative <code>d[i][i]</code> means a negative cycle touches city <code>i</code>.",
    "<strong>Recover a route from the nxt table.</strong> Whenever a relax through <code>k</code> succeeds, set <code>nxt[i][j] = nxt[i][k]</code>, then walk <code>i = nxt[i][j]</code> until you arrive at <code>j</code> to print the actual sequence of cities.",
  ],
  dryIntro: "Watch row 0 of a four-city table as cities 0, 1, 2, then 3 are allowed as stopovers. The finished row should be [0, 3, 4, 5].",
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
      "<p>Three nested loops of length <code>n</code>, each body doing one add and one min, is exactly <code>n&sup3;</code> operations and <code>n&sup2;</code> cells of memory. At <code>n = 400</code> that is 64 million additions, a few tens of milliseconds. At <code>n = 1000</code> it is a billion additions, which no ordinary judge will accept, so that constraint is telling you to run <code>n</code> Dijkstras or Johnson instead.</p>",
      "<p>The same count holds for the boolean and minimax variants: you still touch every triple <code>(k, i, j)</code> once. Path reconstruction adds an <code>n&sup2;</code> next-hop table and a constant amount of work per successful relax, so it does not change the leading term.</p>",
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
      bug: "Writing <code>k</code> as the inner loop looks like \"try every stopover for this pair\" and reads naturally, but you then update a pair using a stopover whose own row is not finished, so the DP is no longer \"intermediates from a prefix\".",
      fix: "Keep <code>k</code> as the outer loop, always. To test it, take a three-city path 0-1-2 whose cheapest route needs city 1 as a stopover and confirm the table is wrong if <code>i</code> is outermost." },
    { title: "INF + INF overflow",
      bug: "Two unreachable halves add to a small negative (or wrap an <code>int</code>), so a pair that has no path suddenly looks cheaper than every real route.",
      fix: "Use the sentinel <code>Long.MAX_VALUE / 4</code>, and also skip the add when either <code>d[i][k]</code> or <code>d[k][j]</code> is still infinite." },
    { title: "Forgetting d[i][i] = 0",
      bug: "A missing zero on the diagonal lets the first pass through <code>k = i</code> write junk into <code>d[i][i]</code>, after which a negative-cycle check on that cell is meaningless and other pairs pick up the junk as a stopover.",
      fix: "Zero every <code>d[i][i]</code> during initialisation, before any edge is written and before the triple loop starts." },
    { title: "Directed vs undirected write",
      bug: "An undirected road written only as <code>d[u][v]</code> makes the return trip look infinite, so a pair that is one hop apart in the other direction is reported unreachable.",
      fix: "Write both <code>d[u][v]</code> and <code>d[v][u]</code> unless the statement is directed. Test on a single undirected edge and query both orders." },
    { title: "Reading d before all k finish",
      bug: "A table read after only some values of <code>k</code> is \"cheapest route using stopovers from a prefix\", not the true distance, so a mid-loop query is silently too large.",
      fix: "Wait until <code>k</code> has run through every city, unless the problem is the reverse-addition variant (CF 295B) that <em>wants</em> the prefix of living vertices." },
  ],
  variants: [
    ["Minimax", "d[i][j] = min(d[i][j], max(d[i][k], d[k][j]))", "smallest bottleneck", "LC 778-ish"],
    ["Add vertices reverse", "k from n-1 to 0; sum d of living pairs after each k", "CF 295B", "Greg and Graph"],
    ["Path reconstruction", "nxt[i][j] = nxt[i][k] on relax; walk i = nxt[i][j]", "print the route", ""],
  ],
  followups: [
    ["Why is k the outer loop?",
      "<p>The recurrence is defined on the <em>set</em> of cities you are allowed to use as stopovers. To try city <code>k</code> as a new middle, you need every pair's cheapest route using only <code>{0, &hellip;, k-1}</code> already sitting in the table, including the two halves <code>i &rarr; k</code> and <code>k &rarr; j</code>. Putting <code>k</code> outermost is exactly that dependency. Putting <code>i</code> outermost updates a pair with a stopover that has not finished its own row.</p>"],
    ["How do you detect a negative cycle?",
      "<p>After the loops, any <code>d[i][i] &lt; 0</code> means a walk from <code>i</code> back to <code>i</code> of negative total weight, so a negative cycle touches <code>i</code>. A pair <code>(u, v)</code> can then be driven to minus infinity if <code>u</code> can reach such an <code>i</code> and that <code>i</code> can reach <code>v</code>, which you read off the same finished table.</p>"],
    ["Floyd vs n Dijkstras?",
      "<p>Floyd wins when the graph is dense, when <code>n &le; 400</code>, or when you want the whole matrix plus extras such as reachability or minimax from the same skeleton. <code>n</code> Dijkstras win on sparse non-negative graphs, especially around <code>n = 2000</code> and <code>m = 5000</code>, where <code>n&sup3;</code> is a billion and the heap runs are a few million. Johnson replaces the Dijkstras when weights can be negative but there is no negative cycle.</p>"],
    ["Can Floyd handle negative edges?",
      "<p>Yes, in the same sense Bellman-Ford does: a negative edge is just a number, and the min-plus update does not assume a sign. A negative <em>cycle</em> is not turned into a finite distance; it is reported as a negative diagonal entry, and any pair that can reach that cycle can then be driven without bound. Do not treat those cells as real costs.</p>"],
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
  readTime: "26 min",
  tagline: "Kruskal sorts edges and unions if they do not form a cycle. Prim grows a tree from a seed, always taking the cheapest edge out. Same MST, different shapes.",
  tags: ["MST", "Kruskal", "Prim", "DSU", "P1"],
  prereqs: [
    ["Graph Representations", "../07-graphs-core/graph-representations.html"],
    ["Heaps", "../03-linear-structures/heaps-and-priority-queue.html"],
  ],
  why: [
    "You are wiring <code>n</code> houses to each other so that every house can reach every other house along the cables you buy, and you want the cheapest possible total bill. Any connecting set of cables that uses more than <code>n-1</code> of them contains a loop you could drop without disconnecting anyone, so the cheapest connecting set is always a tree: a <em>minimum spanning tree</em>, the cheapest set of <code>n-1</code> undirected edges that joins the whole graph. The naive \"try every subset of <code>n-1</code> edges\" is hopeless: at <code>n = 10&#8309;</code> and <code>m = 2&times;10&#8309;</code> you cannot even list the subsets, let alone score them.",
    "Both algorithms on this page rest on one fact, the <em>cut property</em>. A <em>cut</em> is any way of splitting the houses into two non-empty groups; the property says the cheapest cable that has one end in each group is safe to buy &mdash; it belongs to some cheapest tree. Kruskal applies that fact to \"the groups I have already wired together\": sort every cable from cheap to expensive and buy it if its two ends are still in different groups, which a union-find structure answers in almost constant time. Prim applies the same fact to \"inside the tree so far versus outside\": always buy the cheapest cable that leaves the tree you have already grown.",
    "Pick Kruskal when you already have an edge list and might stop early, or when queries arrive offline as \"add edges in weight order\". Pick Prim when the graph is dense &mdash; a complete graph of <code>n</code> points in the plane has about <code>n&sup2; / 2</code> edges you do not want to materialise &mdash; or when you already hold adjacency lists. In a problem statement the tell is \"connect everyone at minimum total cost\" sitting next to undirected weighted edges. Close cousins that are still this page: a maximum spanning tree (sort descending), the second-best tree (swap one unused edge), and the min-bottleneck path, whose heaviest edge is the heaviest edge on the unique MST path.",
  ],
  insight: "The cut property says the cheapest edge across any split of the vertices belongs to some MST, so you never have to look ahead. Kruskal applies the split \"components wired so far\"; Prim applies the split \"already in the tree versus not yet\". Same cheapest tree, two different shapes of code.",
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
  constraint: "<code>n &le; 10&#8309;</code> and <code>m &le; 2&times;10&#8309;</code> is Kruskal's window: one sort plus almost-constant union-find. A complete graph on <code>n &le; 2000</code> vertices is Prim without a heap, <code>n&sup2;</code> scans and no materialised edge list. Individual weights usually fit in an <code>int</code>, but the sum of <code>n-1</code> of them needs a <code>long</code>. If the statement is directed, this page is the wrong tool.",
  core: [
    "Kruskal needs an edge list and a union-find structure. Sort the edges by weight, cheapest first. For each edge <code>(u, v, w)</code> in that order, ask the structure whether <code>u</code> and <code>v</code> already share a representative. If they do, the edge would close a loop and you skip it. If they do not, <code>union</code> them, add <code>w</code> to a <code>long</code> total, and increment a counter of taken edges. Stop when the counter hits <code>n-1</code>: you have a tree. If the list ends with fewer than <code>n-1</code> taken edges, the graph was disconnected and what you built is a minimum spanning forest.",
    "Prim needs adjacency lists and a heap, and it looks like Dijkstra until you read the key. Set <code>dist[src] = 0</code> and every other <code>dist</code> to a sentinel, then grow a set <code>S</code> of vertices already in the tree. Repeatedly pop the unused vertex of smallest <code>dist</code>, mark it used, add that <code>dist</code> to the total, and for each unused neighbour <code>v</code> write <code>dist[v] = min(dist[v], w(u, v))</code> &mdash; the weight of the edge into the tree, not a path sum. That single difference is the whole algorithm: Dijkstra settles cheapest routes from a source, Prim settles the cheapest cable that leaves the tree.",
    "Walk the four-house sample in words. Edges in sorted order are 0-1 weight 1, 1-2 weight 2, 0-2 weight 2, 2-3 weight 3, 0-3 weight 4. Kruskal buys 0-1, then 1-2, skips 0-2 because 0 and 2 already share a representative, buys 2-3, and stops at three edges of total 6. Prim starting at 0 first buys the cable of weight 1 to house 1, then the cable of weight 2 to house 2, then the cable of weight 3 to house 3, and reports the same 6. The skipped 0-2 is a tie: another tree of weight 6 exists that uses 0-2 in place of 1-2.",
  ],
  extra: [
    {
      kind: "warn",
      title: "Prim's key is the edge weight, not a path sum",
      html: "<p>Copying Dijkstra and writing <code>dist[u] + w</code> builds a shortest-path tree from the seed, which is a different object. The MST question is \"what is the cheapest cable that hangs this new house onto the houses I have already wired?\", so the heap key is <code>w</code> itself. Test the difference on a triangle with weights 1, 100, 100: both algorithms buy 1 plus 100, never 200.</p>",
    },
  ],
  invariant: "<p>Cut property: for any partition of the vertices into <code>S</code> and <code>V \\ S</code>, a lightest edge with one end in each side belongs to some MST. Kruskal's <code>S</code> is one union-find component; Prim's <code>S</code> is the set of vertices already popped into the tree.</p><p>In plain words, the cheapest cable that leaves the group you have already wired is always safe to buy, so both algorithms only ever add an edge that some cheapest tree would have added, and they stop when the group is everyone (or when no leaving cable remains).</p>",
  array: [0, 1, 2, 3, 4],
  arrayLabel: "taken w =",
  indexLabels: ["e0", "e1", "e2", "e3", "e4"],
  vars: ["edge", "w", "take"],
  frames: [
    { note: "Four houses. Sorted cables: 0-1 weight 1, 1-2 weight 2, 0-2 weight 2, 2-3 weight 3, 0-3 weight 4. Buy 0-1; two groups remain.",
      active: [0], values: { edge: "0-1", w: 1, take: "yes, union" } },
    { note: "Buy 1-2 of weight 2. Houses 0, 1, 2 now share a representative; house 3 is still alone.",
      active: [1], values: { edge: "1-2", w: 2, take: "yes" } },
    { note: "Skip 0-2 of weight 2: both ends already climb to the same representative, so the cable would close a loop.",
      active: [2], values: { edge: "0-2", w: 2, take: "no, cycle" } },
    { note: "Buy 2-3 of weight 3. One group remains and three cables have been taken, so the tree is finished at total 6.",
      active: [3], values: { edge: "2-3", w: 3, take: "yes, done" } },
    { note: "Skip 0-3 of weight 4: the two houses are already in the same group, so the more expensive cable is wasted.",
      active: [4], values: { edge: "0-3", w: 4, take: "no" } },
    { note: "Three cables, total 6. The skipped 0-2 was a tie with 1-2, so another tree of the same total exists.",
      active: [0, 1, 3], values: { edge: "MST", w: 6, take: "1+2+3" } },
  ],
  mermaid: `graph LR
  a["0"] ---|"1"| b["1"]
  b ---|"2"| c["2"]
  c ---|"3"| d["3"]
  a -.->|"2 skip"| c`,
  steps: [
    "<strong>Kruskal: sort the edge list by weight.</strong> Cheapest first, so the next cable you consider is always a lightest cable across some cut of the groups you have not yet merged, which is exactly the cut property.",
    "<strong>Union if the ends are still in different groups.</strong> When <code>dsu.union(u, v)</code> returns true, add <code>w</code> to a <code>long</code> total and increment the taken-edge counter; a false return means the cable would close a loop and must be skipped.",
    "<strong>Demand n-1 taken edges, or admit a forest.</strong> If the list ends with fewer than <code>n-1</code> successes the graph was disconnected; return a failure, or return the forest if the statement asked for a minimum spanning forest.",
    "<strong>Prim: grow a tree from a seed with a heap.</strong> The heap key is the weight of the cheapest unused cable into that vertex, not a path sum; skip vertices already popped, add the popped key to the total, and relax unused neighbours with the raw edge weight.",
    "<strong>Dense Prim drops the heap for n scans.</strong> When every pair of vertices has an implicit edge, it is cheaper to scan the unused <code>dist</code> array <code>n</code> times than to push <code>n&sup2;</code> heap entries, which is the complete-graph / points-in-the-plane case.",
    "<strong>Keep the total in a long, and keep parallel edges honest.</strong> <code>n-1</code> weights of <code>10&#8309;</code> overflow an <code>int</code>; Kruskal's sort already prefers the cheaper of two parallel cables, and Prim's relax does the same with a min.",
  ],
  dryIntro: "Four houses and five cables in weight order. Kruskal buys 0-1, 1-2 and 2-3 for total 6, and skips the two cables that would close a loop.",
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
      "<p>Kruskal spends <code>O(m log m)</code> on the sort and then almost-constant time per edge inside union-find, so the sort dominates. At <code>m = 2&times;10&#8309;</code> that is a few million comparisons, comfortable. Prim with a binary heap pushes each edge at most once per improvement and is <code>O(m log n)</code>, the same shape as Dijkstra and the same few-million heap operations on a sparse graph.</p>",
      "<p>Dense Prim without a heap scans an unused array of length <code>n</code> once per vertex and is <code>O(n&sup2;)</code>. At <code>n = 2000</code> that is 4 million scans and beats a heap that would push about <code>n&sup2;</code> entries. Store the running total in a <code>long</code>: <code>n-1</code> edges of weight <code>10&#8309;</code> already overflow an <code>int</code>.</p>",
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
      bug: "MST is defined on undirected graphs, so running Kruskal on a tournament of one-way roads produces a set of arcs that does not even mean \"connected\" in the directed sense, yet the code still returns a number.",
      fix: "Confirm the statement is undirected. Add both orientations only when you are building Prim's adjacency lists from an undirected edge list, never as a substitute for a directed algorithm." },
    { title: "Disconnected graph",
      bug: "You sum whatever the algorithm bought, call that an MST, and hide the fact that two groups of houses were never joined, which looks correct on a connected sample.",
      fix: "Count taken edges and require exactly <code>n-1</code>, or return the forest if the statement asked for a minimum spanning forest. Test on two triangles that do not touch." },
    { title: "Prim using path-sum keys",
      bug: "You copied Dijkstra and stored <code>dist[u] + w</code>. The heap then grows a shortest-path tree from the seed, which is a different object and can pick a heavier set of cables than the MST.",
      fix: "The heap key is the raw edge weight into the tree, <code>w</code>. Test on a triangle 1, 100, 100: both MST algorithms buy 101, never a path of 200." },
    { title: "int total",
      bug: "<code>n-1</code> edges of weight <code>10&#8309;</code> overflow an <code>int</code> and wrap to a small or negative total that still looks like a plausible bill.",
      fix: "Accumulate into <code>long ans</code> from the first addition. Test on three edges of weight <code>10&#8309;</code> and check the printed sum is <code>3&times;10&#8309;</code>." },
    { title: "Forgetting union-by-rank / path compression",
      bug: "A chain of unions that always hangs the old root under a new singleton turns each <code>find</code> into an <code>O(n)</code> walk, so Kruskal at <code>m = 2&times;10&#8309;</code> suddenly looks like a quadratic scan.",
      fix: "Keep both accelerations (rank or size, plus path compression). Path compression alone is already enough at this size; test by unioning <code>i</code> with <code>i+1</code> in order and timing a find on the last element." },
  ],
  variants: [
    ["Maximum ST", "Sort descending, or negate weights.", "same DSU", "CF 1245D-ish"],
    ["Second-best MST", "Build MST, for each unused edge find the max MST-edge on that path, swap.", "HLD / lifting", "CF 609E"],
    ["Offline connectivity by weight", "Kruskal, multiply DSU sizes when you union.", "CF 1213G", "Path Queries"],
  ],
  followups: [
    ["Is the MST unique?",
      "<p>Yes whenever every weight is distinct, because the cut property then names a unique safe edge at every step. When two edges share a weight, more than one cheapest tree can exist, but every MST uses the same <em>multiset</em> of weights: the sorted-edge greedy is forced on every prefix of distinct values, and only the ties may be swapped. The sample on this page has two trees of total 6 that differ on the weight-2 cable.</p>"],
    ["Is the MST a shortest-path tree?",
      "<p>No. A walk along the MST between two houses can be heavier than a walk that uses a cable the MST rejected. The MST minimises the <em>sum of the cables you buy</em>, not the distance from a chosen source. Prim and Dijkstra share a heap shape and nothing else: Prim's key is the edge into the tree, Dijkstra's key is a path sum from the source.</p>"],
    ["Min bottleneck path?",
      "<p>Among all walks from <code>u</code> to <code>v</code>, the walk that minimises its heaviest single edge is a walk in the MST (any MST). Build the tree, then read the maximum edge on the unique tree path with binary lifting or heavy-light decomposition. That is why \"smallest max-edge\" queries on an undirected graph so often start with Kruskal.</p>"],
    ["Directed analogue?",
      "<p>The directed object is a <em>minimum arborescence</em> rooted at a chosen <code>r</code>: a cheapest set of arcs that reaches every vertex from <code>r</code>. Edmonds' algorithm computes it. Kruskal on a directed graph does not even have a well-defined meaning of \"cycle versus connecting\", so do not run it. If the statement is undirected, stay on this page.</p>"],
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
  readTime: "28 min",
  tagline: "An SCC is a maximal set where every vertex can reach every other. Kosaraju is two DFS passes; Tarjan is one DFS with a low-link stack.",
  tags: ["SCC", "Tarjan", "Kosaraju", "P1"],
  prereqs: [["DFS & Connected Components", "../07-graphs-core/dfs-and-components.html"]],
  why: [
    "You are given a one-way street map of a city, and you want to know which junctions can reach each other <em>both ways</em>. On an undirected map that question is just \"are we in the same connected piece?\", answered by one depth-first search. Directed streets break the symmetry: 0 can reach 3 along 0&rarr;1&rarr;3 while 3 has no way home, so they are not in the same group. A <em>strongly connected component</em> (SCC) is a maximal set of junctions where every member can reach every other member by following the arrows. Trying every pair with a fresh search is <code>n</code> searches of a graph with <code>m</code> streets, about <code>4&times;10&#185;&#8304;</code> steps at the usual limits, which no judge accepts.",
    "The algorithms on this page find every SCC in one or two linear passes and then shrink each component to a single supernode. The graph of supernodes, the <em>condensation</em>, has no directed cycles left &mdash; it is a DAG &mdash; because a cycle would have merged those supernodes into one SCC. That DAG is the object every \"eventual safe node\", \"2-SAT\", and \"fewest one-way streets to add so everyone can reach everyone\" problem actually sits on. Kosaraju builds it with two searches and a reversed copy of the streets; Tarjan builds it with one search, a stack, and a number called <code>low</code>.",
    "Write Kosaraju when you want the proof you can say out loud: finish times, reverse the arrows, search again. Write Tarjan when you already have discovery times and low-links from the bridges page and want a single pass. Both are <code>O(n + m)</code>. In a problem statement the tell is a directed graph together with \"mutual reachability\", \"condense into a DAG\", or limits such as <code>n, m &le; 2&times;10&#8309;</code> that rule out pairwise searches.",
  ],
  insight: "In the reversed street map, yesterday's sinks become today's sources. A first search's finish order is a reverse topological order of the condensation, so searching the reversed map in reverse-finish order hits one source &mdash; one whole SCC &mdash; at a time and cannot leak into another.",
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
  constraint: "<code>n, m &le; 2&times;10&#8309;</code> is the linear window: both algorithms touch every vertex and every edge a constant number of times. Recursion depth can be <code>n</code>, so a chain of two hundred thousand one-way streets overflows the default Java stack; convert the search to an explicit stack, or raise <code>-Xss</code> only in local tests. Pairwise reachability at this size is about <code>4&times;10&#185;&#8304;</code> steps and will time out.",
  core: [
    "Kosaraju is two searches and a reversed copy of the streets. Pass 1 runs an ordinary DFS on the original graph and, as each vertex finishes (every outgoing street already explored), pushes it onto a list. Reverse every street to build <code>G<sup>R</sup></code>. Pass 2 pops the finish list from the back and, whenever the popped vertex is still unvisited, starts a DFS on the reversed graph; every vertex that search reaches is one SCC. The reason it cannot leak: reverse-finish order on <code>G</code> is a topological order of the condensation of <code>G<sup>R</sup></code>, so each second-pass root is a source of that DAG and owns exactly one component.",
    "Tarjan is one search. <code>tin[u]</code> is the discovery time, a counter that ticks the first time you enter <code>u</code>. The vertex is pushed onto a stack and flagged <code>onStack</code>. <code>low[u]</code> measures something precise: the smallest discovery time of any vertex you can still reach from <code>u</code> by walking down tree edges inside <code>u</code>'s subtree and then taking at most one back-edge to a vertex that is still on the stack (still being explored). A back-edge to a vertex that has already been popped is a cross edge into a finished SCC and must not update <code>low</code>. When the search at <code>u</code> returns and <code>low[u] == tin[u]</code>, nothing in the subtree can climb to an ancestor of <code>u</code>, so <code>u</code> is the root of an SCC: pop the stack down to <code>u</code> and stamp that slice with a new component id.",
    "Walk the four-junction sample in words. Streets are 0&rarr;1&rarr;2&rarr;0 and 1&rarr;3. Tarjan enters 0, then 1, then 2; the street 2&rarr;0 is a back-edge to an on-stack vertex, so <code>low[2]</code> becomes <code>tin[0]</code>, that number climbs to 1 and then to 0, and <code>low[0] == tin[0]</code> pops 2, 1, 0 as SCC 0. Vertex 3 is entered next, has no back-edge, satisfies <code>low[3] == tin[3]</code>, and pops as the singleton SCC 1. The condensation is one arrow SCC0&rarr;SCC1: one source, one sink. Kosaraju's first pass finishes 2, then 0, then 1, then 3; the reversed search starting at 3 takes only 3, and the next reversed search takes 0, 1, 2.",
  ],
  extra: [
    {
      kind: "key",
      title: "What low[v] actually measures",
      html: "<p><code>low[v]</code> is not \"the parent\" and not \"the smallest neighbour\". It is the earliest discovery time still reachable from <code>v</code> without leaving the current exploration path: walk down the DFS subtree, then take at most one back-edge to a vertex that is still on the stack. If that earliest time is <code>v</code>'s own discovery time, the subtree is trapped &mdash; it cannot reach any ancestor &mdash; and <code>v</code> is an SCC root. Updating <code>low</code> from a vertex that has already been popped merges two components that are not mutually reachable.</p>",
    },
    {
      kind: "tip",
      title: "Kosaraju if you want the proof, Tarjan if you already have tin/low",
      html: "<p>Kosaraju's two-pass story (finish order, reverse arrows, search sources of the reversed condensation) is the one you can say out loud in an interview. Tarjan is one pass and shares the same two arrays as the bridges page. Either is acceptable if you can point at the condensation and say it is a DAG.</p>",
    },
  ],
  invariant: "<p>Kosaraju: reverse-finish order of <code>G</code> is a topological order of the condensation of <code>G<sup>R</sup></code>, so each second-pass DFS tree is exactly one SCC. Tarjan: <code>low[u]</code> is the smallest <code>tin</code> reachable from <code>u</code> by tree edges going down plus at most one back-edge into a vertex still on the stack.</p><p>In plain words, <code>low[u] == tin[u]</code> means \"nothing in my subtree can climb to an ancestor still being explored\", so the vertices sitting above me on the stack down to me are a maximal mutually-reachable set and may be popped as one component.</p>",
  array: [0, 0, 0, 1],
  arrayLabel: "scc =",
  indexLabels: ["0", "1", "2", "3"],
  vars: ["u", "scc", "stack"],
  frames: [
    { note: "One-way streets 0&rarr;1&rarr;2&rarr;0 form a cycle, and 1&rarr;3 hangs a sink off that cycle. Search starts at 0 with the stack holding only 0.",
      active: [0], values: { u: 0, scc: "—", stack: "0" } },
    { note: "The search walks 0-1-2 and the street 2&rarr;0 is a back-edge, so low climbs to tin[0]. Then low[0]==tin[0] pops 2, 1, 0 as SCC 0.",
      active: [0, 1, 2], values: { u: 0, scc: "0", stack: "pop 2,1,0" } },
    { note: "Vertex 3 was never pushed during that cycle. After the pop it is entered next, alone on the stack, with no back-edge waiting.",
      active: [3], values: { u: 3, scc: "—", stack: "3" } },
    { note: "3 has no back-edge to anyone still on the stack, so low[3] stays equal to tin[3] and 3 pops as the singleton SCC 1.",
      active: [3], values: { u: 3, scc: 1, stack: "empty" } },
    { note: "The condensation is one arrow from SCC 0 to SCC 1: one source, one sink, and no way back, which is why 3 is not in the cycle.",
      active: [0, 1, 2], values: { u: "dag", scc: "0&rarr;1", stack: "—" } },
    { note: "Finished ids are [0, 0, 0, 1]: junctions 0, 1, 2 can reach each other both ways, and 3 can be reached but cannot return.",
      active: [0, 1, 2, 3], values: { u: "done", scc: "0,0,0,1", stack: "—" } },
  ],
  mermaid: `graph LR
  n0["0"] --> n1["1"]
  n1 --> n2["2"]
  n2 --> n0
  n1 --> n3["3"]`,
  steps: [
    "<strong>Kosaraju pass 1: search G and record finish order.</strong> Push a vertex onto the list only after every outgoing street has been explored, so the list is a reverse topological order of the condensation and the last vertex finished is a sink of the original DAG of components.",
    "<strong>Reverse every street to build G<sup>R</sup>.</strong> Yesterday's sinks become today's sources, which is the whole reason the second search can start at a source of the reversed condensation and stay inside one SCC.",
    "<strong>Kosaraju pass 2: search G<sup>R</sup> in reverse-finish order.</strong> Each time you pop an unvisited vertex, a new DFS tree is exactly one SCC; do not walk the original outgoing streets or you will glue extra vertices into the component.",
    "<strong>Tarjan: one search with tin, low, and a stack.</strong> Push on entry, update <code>low</code> from children and from back-edges to <code>onStack</code> vertices only, and when <code>low[u] == tin[u]</code> pop down to <code>u</code> &mdash; that slice cannot climb to any ancestor, so it is an SCC.",
    "<strong>Condense: one supernode per SCC id.</strong> Map every vertex to its id and add a condensation edge <code>id[u] &rarr; id[v]</code> only when the two ids differ, otherwise the DAG grows a self-loop and looks cyclic.",
    "<strong>Read sources and sinks of that DAG.</strong> A graph that is already one SCC needs 0 extra streets; otherwise the fewest streets that make it strongly connected is <code>max(sources, sinks)</code>, by pairing sinks back to sources.",
  ],
  dryIntro: "Four junctions: a directed cycle 0&rarr;1&rarr;2&rarr;0 and a sink hanging off 1&rarr;3. Tarjan pops the cycle {0,1,2} first, then the singleton {3}.",
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
      "<p>Kosaraju walks every vertex and every street once on <code>G</code>, once on <code>G<sup>R</sup></code>, and spends linear time building the reversed adjacency lists, so the work is <code>O(n + m)</code>. Tarjan walks every street once, pushes and pops each vertex once, and stores three arrays of length <code>n</code> plus a stack of size at most <code>n</code>, which is the same linear bound with a smaller constant and no reversed copy of the graph.</p>",
      "<p>At <code>n, m = 2&times;10&#8309;</code> that is a few hundred thousand array operations, a few milliseconds. The pairwise alternative &mdash; a search from every vertex &mdash; is about <code>n &times; (n + m)</code>, near <code>8&times;10&#185;&#8304;</code> steps, which no judge accepts. Recursion depth can be <code>n</code>, so a chain overflows the default Java stack; the linear bound assumes an explicit stack or a raised <code>-Xss</code>.</p>",
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
      bug: "A street into a vertex that has already been popped looks like a back-edge, so updating <code>low</code> from it pulls a finished SCC's discovery time into the current one and silently merges two components that are not mutually reachable.",
      fix: "Update <code>low[u]</code> from <code>v</code> only when <code>onStack[v]</code> is still true. A popped neighbour is a cross edge into another SCC and must be ignored." },
    { title: "Kosaraju second pass on G, not G^R",
      bug: "Walking the original outgoing streets on pass 2 follows arrows out of the component and glues extra vertices into the SCC, which looks correct on a single cycle and fails as soon as a sink hangs off it.",
      fix: "Build the reversed adjacency lists in <code>add</code> and run pass 2 on those lists only. Test on 0&rarr;1&rarr;2&rarr;0 plus 1&rarr;3 and check that 3 is not in SCC 0." },
    { title: "Finish-order vs discovery-order",
      bug: "Processing pass 2 in discovery (<code>tin</code>) order starts at sources of the original graph rather than sources of the reversed condensation, so a second-pass tree leaks across several SCCs.",
      fix: "Push a vertex only after its recursive calls return, then iterate that list from the back. The last vertex finished is the first one you should start on <code>G<sup>R</sup></code>." },
    { title: "Java recursion on a 2e5 path",
      bug: "A directed chain of length <code>n</code> makes the recursive DFS <code>n</code> frames deep and throws <code>StackOverflowError</code> on the default Java stack, which looks like a wrong answer rather than a stack problem.",
      fix: "Write the search with an explicit stack, or raise <code>-Xss256m</code> only for local tests. On Codeforces Java prefer the iterative version every time." },
    { title: "Condensing without skipping intra-SCC edges",
      bug: "Copying every original street onto the supernode graph writes a self-loop on any SCC that contained a cycle, so the condensation looks cyclic and source/sink counts come out wrong.",
      fix: "Add a condensation edge only when <code>id[u] != id[v]</code>. Test on a single directed cycle: the condensation must be one isolated supernode, not a loop of one." },
  ],
  variants: [
    ["Make strongly connected", "If already 1 SCC, 0. Else max(sources, sinks) of the DAG.", "CF 732F", ""],
    ["Eventual safe", "Nodes whose SCC cannot reach a cycle — outdegree 0 in condensation after removing trivial loops, or LC 802 colouring.", "LC 802", ""],
    ["2-SAT", "Implication graph; unsat iff x and ~x share an SCC.", "next page", ""],
  ],
  followups: [
    ["Why reverse finish order?",
      "<p>The finish times of a first DFS on <code>G</code> are a reverse topological order of the condensation: a sink component finishes before any component that can reach it. Reversing every street flips sinks into sources, so walking that list from the back starts at a source of <code>G<sup>R</sup></code>'s condensation. A search that starts at a source cannot leave its own SCC, which is why each second-pass tree is exactly one component.</p>"],
    ["Tarjan vs Kosaraju in an interview?",
      "<p>Kosaraju is the one whose proof you can say in two sentences (finish, reverse, search sources). Tarjan is one pass and reuses the same <code>tin</code> / <code>low</code> arrays as the bridges page, but the stack-and-onStack details are easier to get wrong. Either is acceptable if you can point at the condensation and say it is a DAG. Do not start implementing Tarjan from scratch unless the interviewer asks for one pass.</p>"],
    ["How many edges to make the graph strongly connected?",
      "<p>Contract every SCC to a supernode. If a single supernode remains, the answer is 0. Otherwise let <code>A</code> be the number of supernodes with in-degree 0 and <code>B</code> the number with out-degree 0; the fewest new streets is <code>max(A, B)</code>. You can always realise that number by pairing sinks back to sources, because the condensation is a DAG and every supernode sits on some path from a source to a sink.</p>"],
    ["Can an SCC be a single node with no loop?",
      "<p>Yes: a <em>trivial</em> SCC. Vertex 3 on this page is one. It is still a supernode of the condensation. A self-loop on that vertex would make the singleton a cycle, which matters for \"eventual safe nodes\": a trivial SCC with no self-loop is safe only when it cannot reach a cycle elsewhere, i.e. when its out-degree in the condensation is 0 after you ignore other trivial sinks.</p>"],
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
  readTime: "26 min",
  tagline: "Each clause <code>x \u2228 y</code> becomes implications <code>\u00acx \u2192 y</code> and <code>\u00acy \u2192 x</code>. Unsatisfiable iff x and \u00acx sit in the same SCC.",
  tags: ["2-SAT", "implication graph", "SCC", "P2"],
  prereqs: [["SCC: Tarjan & Kosaraju", "scc-tarjan-kosaraju.html"]],
  why: [
    "You are seating people, flipping switches, or choosing an orientation of each street, and every rule mentions at most two choices: \"at least one of Alice and Bob sits on the left\", \"these two switches cannot both be on\". Trying every assignment is <code>2<sup>n</sup></code> checks; at <code>n = 10&#8309;</code> that is not a number you can finish. The same problem with three choices per rule is 3-SAT and is NP-complete. The two-choice version, <em>2-SAT</em>, is linear, because each rule can be rewritten as two forced arrows and those arrows are a directed graph you already know how to search.",
    "A clause <code>x OR y</code> means two sentences at once: \"if <code>x</code> is false then <code>y</code> must be true\", and \"if <code>y</code> is false then <code>x</code> must be true\". Those are directed implications <code>&not;x &rarr; y</code> and <code>&not;y &rarr; x</code>. Build a graph with two vertices per variable, one for the variable and one for its negation, and add those two arrows for every clause. Implications are transitive: a path <code>a &rarr; &hellip; &rarr; b</code> means \"if you set <code>a</code> true you are forced to set <code>b</code> true\". Therefore a path from <code>x</code> to <code>&not;x</code> and a path back from <code>&not;x</code> to <code>x</code> is a contradiction &mdash; setting <code>x</code> either way forces the opposite. Two vertices that can reach each other sit in the same strongly connected component, so unsatisfiability is exactly \"some variable shares an SCC with its negation\".",
    "After the SCCs are found, the condensation is a DAG. For every variable you pick the literal whose component is closer to the sinks, which is the side the implications point toward: set <code>x</code> true when <code>scc[x] &gt; scc[&not;x]</code>. In a problem statement the tell is a family of pairwise conflicts or \"at least one of these two\" sitting next to <code>n, m &le; 10&#8309;</code>. A rule that names three literals is not this page.",
  ],
  insight: "A two-literal clause is two forced arrows, and a forced arrow is transitive, so \"x forces not-x and not-x forces x\" is mutual reachability. SCC is how you find every such pair in linear time; the sink-side literal of each surviving pair is the assignment.",
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
  constraint: "<code>n</code> variables and <code>m</code> clauses, both up to <code>10&#8309;</code>, produce an implication graph of <code>2n</code> vertices and <code>2m</code> directed edges. One SCC run is linear in that size. The same Java-stack warning as the SCC page applies: a chain of implications of length <code>2n</code> overflows the default recursive DFS. A clause with three literals is not 2-SAT and this graph will not save you.",
  core: [
    "Fix one encoding and never mix it. The usual packing is <code>neg(i) = 2*i</code> for \"variable <code>i</code> is false\" and <code>pos(i) = 2*i+1</code> for \"variable <code>i</code> is true\", so <code>x ^ 1</code> flips a literal. The other common packing is <code>i</code> and <code>i+n</code>. For a clause <code>(a OR b)</code> add the two implication edges <code>&not;a &rarr; b</code> and <code>&not;b &rarr; a</code>. A forced literal <code>a</code> (a unit clause) is the clause <code>(a OR a)</code>, which adds the single edge <code>&not;a &rarr; a</code>. Forgetting either arrow of a two-literal clause leaves a satisfying assignment that the graph does not force, so both edges are part of correctness.",
    "Run Tarjan or Kosaraju on that directed graph. If any variable <code>i</code> has <code>scc[pos(i)] == scc[neg(i)]</code>, the instance is unsatisfiable: <code>i</code> and <code>&not;i</code> can reach each other, so each forces the other. Otherwise assign <code>val[i] = scc[pos(i)] &gt; scc[neg(i)]</code>. Both algorithms number components in reverse topological order of the condensation, so the larger id is the sink side &mdash; the side implications point toward, the side you set true. Verify the comparison on the unit clause <code>(x)</code> alone: the edge <code>&not;x &rarr; x</code> puts <code>x</code> later, and the assignment must come back true.",
    "Walk two variables and two clauses in words. Clauses are <code>x OR y</code> and <code>&not;x OR y</code>. The four implication edges are <code>&not;x &rarr; y</code>, <code>&not;y &rarr; x</code>, <code>x &rarr; y</code>, and <code>&not;y &rarr; &not;x</code>. Every path that starts at <code>&not;y</code> is forced toward <code>y</code>, so <code>y</code> and <code>&not;y</code> do not share a component and <code>y</code> sits on the sink side: <code>y</code> is true. <code>x</code> and <code>&not;x</code> also stay split; the sink-side comparison sets <code>x</code> false. Both clauses become <code>false OR true</code> and <code>true OR true</code>. Adding the two extra clauses <code>x OR &not;y</code> and <code>&not;x OR &not;y</code> would merge <code>y</code> with <code>&not;y</code> and the instance would become unsatisfiable.",
  ],
  extra: [
    {
      kind: "key",
      title: "Why the implication graph turns 2-SAT into SCC",
      html: "<p>A clause is a pair of forced arrows, and a path of arrows is a chain of forcing. If <code>x</code> can reach <code>&not;x</code> and <code>&not;x</code> can reach <code>x</code>, each truth value forces the other: a contradiction. Mutual reachability is the definition of a strongly connected component, so the entire question \"does any variable contradict itself?\" becomes one SCC run. The condensation DAG then tells you which side of each surviving pair is forced toward the sinks, which is the assignment.</p>",
    },
    {
      kind: "warn",
      title: "Always add both implication edges",
      html: "<p><code>x OR y</code> is two sentences, not one. A single edge <code>&not;x &rarr; y</code> does not force anything when <code>y</code> is the false one. Write a helper <code>or(a, b)</code> that inserts both arrows, and encode a unit clause as <code>or(a, a)</code> so you never invent a third code path.</p>",
    },
  ],
  invariant: "<p>If the implication graph contains a path <code>a &rarr; &hellip; &rarr; b</code>, every satisfying assignment that sets <code>a</code> true must set <code>b</code> true. Therefore a path both ways between <code>x</code> and <code>&not;x</code> (they share an SCC) is unsatisfiable.</p><p>In plain words, the arrows record forcing, SCC finds every pair of literals that force each other, and the assignment for a surviving pair is \"believe the sink-side literal\", because that is the direction the remaining arrows still point.</p>",
  array: [0, 0, 1, 2],
  arrayLabel: "scc =",
  indexLabels: ["x", "~x", "y", "~y"],
  vars: ["clause", "edges", "sat"],
  frames: [
    { note: "Two variables x and y. The clause x OR y becomes the two forced arrows not-x &rarr; y and not-y &rarr; x.",
      active: [0], values: { clause: "x\u2228y", edges: "~x\u2192y, ~y\u2192x", sat: "?" } },
    { note: "The second clause not-x OR y adds x &rarr; y and not-y &rarr; not-x, so every path out of not-y is now forced toward y.",
      active: [1], values: { clause: "~x\u2228y", edges: "x\u2192y, ~y\u2192~x", sat: "?" } },
    { note: "y and not-y stay in different components: every arrow points at y, so y is forced true and is not merged with its negation.",
      active: [2], values: { clause: "force y", edges: "paths into y", sat: "?" } },
    { note: "x and not-x are also split, so the instance is still satisfiable. The component ids will decide which side of x is the sink.",
      active: [0, 1], values: { clause: "ids", edges: "—", sat: "x and ~x split" } },
    { note: "Sink-side comparison sets x false (scc[x] is smaller) and y true. Both clauses become false OR true and true OR true.",
      active: [2], values: { clause: "assign", edges: "—", sat: "x=0 y=1" } },
    { note: "Adding x OR not-y and not-x OR not-y would merge y with not-y, and the same SCC test would report unsatisfiable.",
      active: [2, 3], values: { clause: "bad extra", edges: "merge y", sat: "false" } },
  ],
  mermaid: `graph LR
  nx["not x"] --> y["y"]
  ny["not y"] --> x["x"]
  x --> y`,
  steps: [
    "<strong>Allocate 2n vertices and freeze one encoding.</strong> The packing <code>neg(i) = 2*i</code>, <code>pos(i) = 2*i+1</code> lets <code>x ^ 1</code> flip a literal; the packing <code>i</code> / <code>i+n</code> needs a <code>not()</code> helper. Mixing the two silently swaps half the arrows.",
    "<strong>Turn every clause into two implication edges.</strong> For <code>(a OR b)</code> add <code>&not;a &rarr; b</code> and <code>&not;b &rarr; a</code>, because each half of the OR is the sentence \"if this side is false, the other side is forced true\".",
    "<strong>Run SCC on that directed graph.</strong> Tarjan or Kosaraju, the same engine as the previous page; the vertices are literals and the streets are forced arrows, not the original variables.",
    "<strong>Reject if any variable shares a component with its negation.</strong> <code>scc[pos(i)] == scc[neg(i)]</code> means <code>i</code> forces <code>&not;i</code> and <code>&not;i</code> forces <code>i</code>, which is a contradiction no assignment can satisfy.",
    "<strong>Otherwise set the sink-side literal true.</strong> <code>val[i] = scc[pos(i)] &gt; scc[neg(i)]</code>, because both algorithms number components in reverse topological order and the larger id is the side implications still point toward.",
    "<strong>Verify the encoding on a unit clause (x) alone.</strong> Mapping bugs and a flipped comparison both produce a clean-looking assignment that fails the one-literal instance, so that is the cheapest test you can write.",
  ],
  dryIntro: "Two variables, clauses (x OR y) and (not-x OR y). The implication arrows force y true and leave x free to be false.",
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
      "<p>The implication graph has <code>2n</code> vertices and exactly two directed edges per clause, so <code>2m</code> edges. One SCC run is <code>O(n + m)</code>, and the assignment is a single scan of the <code>n</code> variables comparing two component ids. At <code>n = m = 10&#8309;</code> that is a few hundred thousand array operations, a few milliseconds, against a brute <code>2<sup>n</sup></code> that cannot start.</p>",
      "<p>The same Java-stack caveat as the SCC page applies: a chain of <code>2n</code> implications is a recursion of depth <code>2n</code>. Counting solutions is not free: only when complementary component-pairs have no extra DAG edges between them is the count a clean power of two; otherwise you need a DAG DP that this linear scan does not perform.</p>",
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
      bug: "Writing <code>scc[x] &lt; scc[&not;x]</code> flips every variable. A sample where both polarities work still passes, so the bug hides until a unit clause or a one-sided force appears.",
      fix: "Tarjan and Kosaraju ids grow in reverse topological order, so the larger id is the sink side: set that literal true. Verify on the instance that is just the clause <code>(x)</code>." },
    { title: "Forgetting unit clauses",
      bug: "A forced <code>x</code> left as a mental note never becomes an edge, so the SCC run does not know <code>x</code> is true and may assign the other way when other clauses allow it.",
      fix: "Encode a unit clause as <code>(x OR x)</code>, which adds the edge <code>&not;x &rarr; x</code>. Put that in the same <code>or()</code> helper so there is no third code path." },
    { title: "Odd mapping of ~x",
      bug: "<code>x ^ 1</code> only flips the right bit when you packed true/false as <code>2i / 2i+1</code>. Using it on an <code>i</code> / <code>i+n</code> encoding points at a random vertex and the graph is silently wrong.",
      fix: "Pick one encoding, write a single <code>not()</code> helper, and use it everywhere. Test by printing the two endpoints of a unit-clause edge and reading them by eye." },
    { title: "Adding only one implication per clause",
      bug: "<code>x OR y</code> is two sentences. A single edge <code>&not;x &rarr; y</code> does not force anything when <code>y</code> is the false literal, so a satisfying assignment exists that the graph never records.",
      fix: "Always add both <code>&not;a &rarr; b</code> and <code>&not;b &rarr; a</code>. The helper <code>or(a, b)</code> should insert the pair and be the only place edges are created." },
    { title: "Using undirected edges",
      bug: "An undirected edge between literals makes each implication run both ways, so two literals that only forced one direction get merged into one SCC and a satisfiable instance is reported unsat.",
      fix: "The implication graph is directed. Run the directed SCC algorithm from the previous page, never an undirected component search." },
  ],
  variants: [
    ["At-most-one", "For every pair (i,j) in a group, add (~i \u2228 ~j).", "O(k^2) clauses", "or a sequential encoding"],
    ["2-SAT + binary search", "Monotone predicate \"is there an assignment with answer <= x\".", "CF 776D", "doors / switches"],
    ["Count solutions", "2^{number of free SCC-pairs}", "only if no extra constraints", "rare"],
  ],
  followups: [
    ["Why scc[x] > scc[~x] means x is true?",
      "<p>Implication edges in the condensation go from sources toward sinks: if you believe a source literal you are forced to believe everything it can reach. When <code>&not;x</code> can reach <code>x</code> but not the other way, believing <code>&not;x</code> forces <code>x</code>, so the only consistent choice is <code>x</code> true. Both Tarjan and Kosaraju number components in reverse topological order, so the larger id is later, closer to the sinks, and that is the literal you set true.</p>"],
    ["Can 2-SAT count solutions?",
      "<p>Sometimes. Each complementary pair of components that is not forced by a path either way is a free bit, and the count is <code>2<sup>k</sup></code> for <code>k</code> such pairs. An extra condensation edge between two pairs destroys that formula, because choosing one pair then forces the other. In that case you need a DAG DP over the condensation, which this linear assignment scan does not do.</p>"],
    ["How do you force x XOR y?",
      "<p>XOR is \"exactly one of the two is true\", which is the pair of clauses <code>(x OR y)</code> and <code>(&not;x OR &not;y)</code>. That is four implication edges: <code>&not;x &rarr; y</code>, <code>&not;y &rarr; x</code>, <code>x &rarr; &not;y</code>, and <code>y &rarr; &not;x</code>. Equality is the other pair, <code>(x OR &not;y)</code> and <code>(&not;x OR y)</code>.</p>"],
    ["2-SAT vs 2-colouring?",
      "<p>Checking that a graph is bipartite is 2-SAT with one variable per vertex and a clause \"adjacent vertices differ\" on every edge, i.e. the XOR encoding above. General 2-SAT allows any two-literal clause: forcing two variables equal, forcing a single variable true, or mixing those freely. Same SCC engine, a richer set of arrows, which is why seating and switch problems land here rather than on a 2-colour DFS.</p>"],
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
  readTime: "26 min",
  tagline: "A bridge is an edge whose removal disconnects an undirected graph; an articulation point is a vertex with the same property. Both fall out of one tin/low DFS.",
  tags: ["bridges", "articulation", "tin/low", "P1"],
  prereqs: [["DFS & Connected Components", "../07-graphs-core/dfs-and-components.html"]],
  why: [
    "You maintain a network of undirected cables, and you must name every cable whose single failure splits the network in two, and every junction whose single failure does the same. Those are <em>bridges</em> (critical edges) and <em>articulation points</em> (cut vertices). Trying every cable or every junction with a fresh connectivity search is <code>m</code> or <code>n</code> depth-first searches, about <code>4&times;10&#185;&#8304;</code> steps at the usual limits. One carefully instrumented search classifies every edge and every vertex in linear time.",
    "The search records two numbers at each vertex. <code>tin[u]</code> is the discovery time, a counter that ticks the first time you enter <code>u</code>. <code>low[u]</code> is the earliest discovery time you can still reach from <code>u</code> by walking down the DFS subtree and then taking at most one back-edge, never using the parent edge you arrived on. If a child <code>v</code> has <code>low[v] &gt; tin[u]</code>, that subtree cannot climb back to <code>u</code> or anything earlier, so the only cable out is <code>u-v</code> and that cable is a bridge. If some child has <code>low[v] &ge; tin[u]</code>, the subtree can reach <code>u</code> but not strictly above it, so removing <code>u</code> disconnects that child from the parent side: <code>u</code> is an articulation point. The root of the search is a special case: it is an articulation point exactly when it has two or more DFS children.",
    "In a problem statement the tell is \"critical connections\", \"edges we must repair\", or \"nodes whose failure splits the network\" on an undirected graph with <code>n, m &le; 2&times;10&#8309;</code>. After you have the bridges you can compress each 2-edge-connected piece into a supernode and obtain a tree, the bridge-block tree, which is the usual place to hang a reroot DP. The same idea with articulation points is the block-cut tree.",
  ],
  insight: "low[v] is the earliest discovery time the subtree of v can still climb to, without walking back over the parent edge. If it cannot even reach u, the edge u-v is a bridge; if it cannot reach strictly above u, then u is a cut vertex for that child.",
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
  constraint: "<code>n, m &le; 2&times;10&#8309;</code> on an undirected graph is the linear window: one DFS, each edge looked at twice. Parallel cables are allowed and a parallel pair is never a bridge, so the parent skip must use an edge id, not a vertex id. Recursion depth can be <code>n</code>; the same Java-stack warning as the SCC page applies. Trying every edge with a fresh search is about <code>4&times;10&#185;&#8304;</code> steps and will time out.",
  core: [
    "Start a DFS from every unvisited vertex so a disconnected graph is handled. On entry set <code>tin[u] = low[u] = timer++</code>, so both numbers begin as the discovery time. For each neighbour <code>v</code>, three cases. If the edge is the parent edge you arrived on, skip it &mdash; walking back over it would pretend the subtree can always climb to <code>u</code> and you would report zero bridges. If <code>v</code> is already visited, this is a back-edge: write <code>low[u] = min(low[u], tin[v])</code>. If <code>v</code> is new, recurse, then write <code>low[u] = min(low[u], low[v])</code> and test the two predicates on that child.",
    "The predicates are the whole classification. <code>low[v] &gt; tin[u]</code> means the child cannot reach <code>u</code> or anything earlier without this edge, so <code>u-v</code> is a bridge (strict inequality: equality means a back-edge still ties the subtree to <code>u</code>). <code>low[v] &ge; tin[u]</code> means the child cannot reach strictly above <code>u</code>, so removing <code>u</code> splits that child off the parent side: a non-root <code>u</code> is then an articulation point. The root ignores <code>low</code> and is an articulation point exactly when it has two or more DFS children. When the graph has parallel edges, store an edge id on both orientations and skip by that id, otherwise the second <code>u-v</code> is mistaken for the parent and a real non-bridge is reported as a bridge.",
    "Walk the four-vertex sample in words. The graph is the triangle 0-1-2 plus a pending leaf 1-3. The search walks 0-1-2; vertex 2 sees 0 as a back-edge and writes <code>low[2] = tin[0] = 1</code>. Returning to 1, <code>low[1]</code> becomes 1, which is not strictly greater than <code>tin[0]</code>, so 0-1 is not a bridge. The child 3 is a leaf: <code>low[3] = tin[3] = 4</code>, which is greater than <code>tin[1]</code>, so 1-3 is a bridge, and the same comparison <code>&ge;</code> marks 1 as an articulation point. Root 0 has only one DFS child, so it is not an articulation point even though the triangle hangs off it.",
  ],
  extra: [
    {
      kind: "key",
      title: "low[v] on an undirected graph",
      html: "<p>Same measuring stick as Tarjan SCC, different graph: <code>low[v]</code> is the earliest discovery time the subtree can still climb to, walking down tree edges and then at most one back-edge, never using the parent cable. The bridge test is strict <code>&gt;</code> because reaching <code>u</code> itself is enough to keep the graph connected after <code>u-v</code> is deleted. The articulation test is <code>&ge;</code> because reaching <code>u</code> but not above it means deleting <code>u</code> isolates that child from the parent side.</p>",
    },
  ],
  invariant: "<p><code>low[u]</code> is the smallest <code>tin</code> reachable from <code>u</code> by tree edges going down plus at most one back-edge, never using the parent edge. A child <code>v</code> with <code>low[v] &gt; tin[u]</code> cannot reach <code>u</code> or above; a child with <code>low[v] &ge; tin[u]</code> cannot reach strictly above <code>u</code>.</p><p>In plain words, <code>low</code> asks \"how far back toward the ancestors can this subtree still climb without walking the cable I just used?\", and the two inequalities decide whether that cable, or that junction, is the only way out.</p>",
  array: [1, 2, 3, 4],
  arrayLabel: "tin =",
  indexLabels: ["0", "1", "2", "3"],
  vars: ["u", "v", "low", "kind"],
  frames: [
    { note: "The graph is the triangle 0-1-2 plus a pending leaf 1-3. The search starts at 0 and walks into 1, then into 2.",
      active: [0], values: { u: 0, v: 1, low: "1,2,3,4", kind: "start" } },
    { note: "Vertex 2 sees the triangle edge back to 0, a back-edge, and writes low[2] = tin[0] = 1 so the subtree can climb to the root.",
      active: [2], values: { u: 2, v: 0, low: "1,2,1,4", kind: "back" } },
    { note: "Returning to 1, low[1] becomes 1. That is not strictly greater than tin[0], so the cable 0-1 is not a bridge.",
      active: [1], values: { u: 1, v: 2, low: "1,1,1,4", kind: "no bridge" } },
    { note: "The leaf 3 has no back-edge, so low[3] stays 4, which is greater than tin[1]. The cable 1-3 is therefore a bridge.",
      active: [3], values: { u: 1, v: 3, low: "1,1,1,4", kind: "bridge" } },
    { note: "The same leaf gives low[3] &ge; tin[1], so junction 1 is an articulation point. Root 0 has only one DFS child, so it is not.",
      active: [1], values: { u: 1, v: 3, low: "1,1,1,4", kind: "cut vertex 1" } },
    { note: "Finished: the only bridge is 1-3 and the only articulation point is 1. The triangle stays 2-edge-connected.",
      active: [1, 3], values: { u: "done", v: "—", low: "final", kind: "1-3 + vertex 1" } },
  ],
  mermaid: `graph LR
  n0["0"] --- n1["1"]
  n1 --- n2["2"]
  n2 --- n0
  n1 --- n3["3"]`,
  steps: [
    "<strong>Initialise tin and low to -1, then DFS every component.</strong> A disconnected graph has several roots; each root gets its own child-count test, and a vertex already discovered in an earlier call is skipped.",
    "<strong>On a new child, recurse first, then pull low[v] into low[u].</strong> The child must finish so its own back-edges have already been written; only then is <code>low[v]</code> a trustworthy earliest-climb for the subtree.",
    "<strong>Test the two predicates on that child.</strong> <code>low[v] &gt; tin[u]</code> flags the tree edge as a bridge; <code>low[v] &ge; tin[u]</code> flags a non-root <code>u</code> as an articulation point. The strictness difference is the whole distinction between \"cannot reach u\" and \"cannot reach above u\".",
    "<strong>On a back-edge to an already visited non-parent, write tin[v] into low[u].</strong> That is the one allowed climb: a single back-edge to a vertex discovered earlier. Do not write <code>low[v]</code> here, and do not treat the parent edge as a back-edge.",
    "<strong>Treat the root as a special case.</strong> The root is an articulation point if and only if it has two or more DFS children, regardless of any <code>low</code> value; a single long child hanging off the root does not split the graph when the root is removed.",
    "<strong>Identify the parent by edge id when parallel cables exist.</strong> Skipping by vertex id treats the second <code>u-v</code> as the parent and a real non-bridge is reported as a bridge; give every undirected edge an id and skip that id only.",
  ],
  dryIntro: "A triangle 0-1-2 plus a pending leaf 1-3. The triangle has a back-edge so 0-1 is not a bridge; the leaf makes 1-3 a bridge and 1 a cut vertex.",
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
      "<p>One DFS visits every vertex once and looks at every undirected edge twice (once from each end). The bridge and articulation tests are a constant amount of work per tree edge, so the whole run is <code>O(n + m)</code>. At <code>n, m = 2&times;10&#8309;</code> that is a few hundred thousand array operations, a few milliseconds.</p>",
      "<p>The brute alternative &mdash; delete each edge and rerun a connectivity search &mdash; is <code>O(m(n + m))</code>, about <code>8&times;10&#185;&#8304;</code> steps at the same limits, which no judge accepts. Recursion depth can be <code>n</code>, so a path graph overflows the default Java stack; prefer an explicit stack on Codeforces Java.</p>",
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
      bug: "Walking back over the parent cable writes <code>tin[u]</code> into every child's <code>low</code>, so every child appears able to climb to <code>u</code> and you report zero bridges on a graph that has several.",
      fix: "Skip the parent edge. When the graph may have parallel cables, skip by edge id, not by vertex id, so the second <code>u-v</code> is still examined." },
    { title: "Bridge test with >= instead of >",
      bug: "A back-edge that reaches <code>u</code> itself makes <code>low[v] == tin[u]</code>. Using <code>&ge;</code> flags that tree edge as a bridge even though the back-edge still ties the subtree to <code>u</code> after the edge is deleted.",
      fix: "The bridge test is strict <code>&gt;</code>. The articulation test is <code>&ge;</code>. Write the two comparisons on separate lines so a later edit cannot blur them." },
    { title: "Root tested with the non-root rule",
      bug: "A root with one long child has <code>low[child] &ge; tin[root]</code> for the trivial reason that nothing sits above the root, so the low test marks a junction whose removal does not split the graph.",
      fix: "The root is an articulation point if and only if it has two or more DFS children. Never apply the <code>low</code> predicate to the root." },
    { title: "Directed input treated as undirected",
      bug: "Storing only one orientation means the search cannot climb a back-edge that the input listed the other way, so every tree edge looks like a bridge.",
      fix: "This page is for undirected graphs: store both directions of every cable and skip one edge id as the parent. Directed \"bridges\" are edges between SCCs, a different page." },
    { title: "Parallel edges",
      bug: "Parent stored as a vertex: the second cable between the same pair is skipped as \"parent\", the real back-edge is never seen, and a pair of parallel cables is reported as a bridge even though neither one disconnects the graph.",
      fix: "Give every undirected edge an integer id, store <code>(neighbour, id)</code> in the adjacency lists, and skip that id only." },
  ],
  variants: [
    ["Bridge-block tree", "Drop bridges, compress remaining components, put bridges back as tree edges.", "reroot DP", "CF 118E"],
    ["Block-cut tree", "Biconnected components + articulation nodes as joints.", "more bookkeeping", ""],
    ["Add min edges to eliminate bridges", "Bridge-block tree: ceil(leaves/2) on that tree.", "CF 1000? classic", ""],
  ],
  followups: [
    ["Why is the bridge test strict >?",
      "<p>If <code>low[v] == tin[u]</code>, the subtree of <code>v</code> can still reach <code>u</code> through a back-edge (or through something that itself reaches <code>u</code>). Delete the tree edge <code>u-v</code> and that back-edge still joins the subtree to <code>u</code>, so the graph stays connected. A bridge is an edge whose deletion really splits the graph, which is the stricter \"cannot even reach <code>u</code>\".</p>"],
    ["Why is articulation >=?",
      "<p>If <code>low[v] == tin[u]</code>, the subtree can reach <code>u</code> but not any ancestor of <code>u</code>. Delete vertex <code>u</code> and the subtree has nowhere to go: it is cut off from the parent side of <code>u</code>. That is why a single child with <code>low[v] &ge; tin[u]</code> is enough to mark a non-root as an articulation point, and why the root needs a different test.</p>"],
    ["Directed bridges?",
      "<p>A directed edge whose deletion breaks reachability is usually just an edge between two SCCs of the condensation, not a tin/low fact on the underlying undirected graph. If the statement is directed, run the SCC page first and look at edges that leave one supernode for another. The algorithm on this page assumes undirected cables stored both ways.</p>"],
    ["How do you handle multiple components?",
      "<p>Run the DFS from every vertex that is still unvisited. Each call has its own root and its own child-count test. Bridges and articulation points are local to a component: a cable cannot be a bridge across two pieces that were never joined, and an isolated vertex is not an articulation point.</p>"],
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
  readTime: "26 min",
  tagline: "An Eulerian circuit uses every edge exactly once and returns. Hierholzer: walk unused edges, splice leftover tours at the vertex you stalled.",
  tags: ["Eulerian", "Hierholzer", "P2"],
  prereqs: [["Graph Representations", "../07-graphs-core/graph-representations.html"]],
  why: [
    "You are a postman who must walk every street of a town exactly once, or a traveller who must use every ticket in a pile exactly once. The hard-looking cousin &mdash; visit every <em>junction</em> exactly once, a Hamiltonian path &mdash; is NP-complete. The version that spends every <em>street</em> exactly once is linear, because a short list of degree conditions decides existence and a single walk constructs the tour. That tour is an <em>Eulerian path</em> if it may start and end at different junctions, and an <em>Eulerian circuit</em> if it must return to where it started.",
    "On an undirected map a circuit exists exactly when every junction has even degree and every street sits in one connected piece (isolated junctions with no streets do not count). A path that need not return exists when exactly zero or two junctions have odd degree: start at an odd one, end at the other. On a directed map a circuit exists when every in-degree equals the matching out-degree; a path exists when one junction has out-in = 1 (the start), one has in-out = 1 (the end), and every other junction is balanced. Checking those conditions is a linear scan; building the tour is Hierholzer's algorithm on this page.",
    "In a problem statement the tell is \"use every edge exactly once\", \"reconstruct the itinerary\", or a de Bruijn sequence (an Euler tour of the graph on (k-1)-mers). LC 332 is the directed multigraph of airports with a min-heap of unused outgoing tickets so the printed tour is the lexicographically smallest. Limits such as <code>n, m &le; 2&times;10&#8309;</code> are the linear window; if the statement asks you to visit every vertex once, you are on the wrong page.",
  ],
  insight: "When a walk stalls, every unused street still sits in a leftover circuit glued to some junction already on the walk. Recurse from the stall, then append the walk you already had: that splices the leftover circuit in without repeating a street.",
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
  constraint: "<code>n, m &le; 2&times;10&#8309;</code> is Hierholzer's linear window: each street is pushed and popped once. Parallel streets and self-loops are allowed and must be consumed, so you mark <em>edges</em> used, never vertices. Isolated junctions with no streets are ignored when you check that the streets sit in one component. A min-heap per junction for the lex-smallest tour adds a <code>log(degree)</code> factor, still fine at these limits.",
  core: [
    "First prove the tour exists, otherwise the walk will silently produce a partial answer. Count degrees (or in/out degrees), reject if the conditions fail, and check that every street lives in one connected piece, ignoring isolated junctions. Then pick the start: an odd-degree junction on an undirected path, the unique +1-out junction on a directed path, or any junction incident to a street if you are building a circuit.",
    "Hierholzer from that start: while the current junction <code>u</code> still has an unused outgoing street, take one, mark it used (by an edge id or by popping an adjacency iterator), and walk to its other end. When <code>u</code> has no unused street left you are stalled: push <code>u</code> onto the answer and backtrack to wherever you came from. The leftover streets at that moment sit in circuits glued to junctions already on the walk, and the recursive (or stack) restart from a stalled junction splices those circuits in. Because you pushed junctions as they stalled, the list is the tour written backwards: reverse it before you print.",
    "Walk the triangle 0-1-2-0 in words. Start at 0, take 0-1, then 1-2, then 2-0, and stall at 0 with nothing unused. Push 0, then 2, then 1, then 0; reverse to 0-1-2-0. If a leftover loop had sat at 2, the walk would have stalled at 2 first, spliced that loop onto the answer, and only then pushed 2. Marking a <em>vertex</em> used would have dropped that leftover loop and printed a tour of a subgraph.",
  ],
  extra: [
    {
      kind: "warn",
      title: "Mark edges used, never vertices",
      html: "<p>A junction of degree 4 must be entered and left twice. The unused streets at that junction are a leftover circuit you are supposed to splice in. A <code>visited[]</code> flag on vertices destroys it. Store an edge id, an iterator into the adjacency list, or a heap of unused destinations, and consume that.</p>",
    },
  ],
  invariant: "<p>At every moment the unused streets of the current connected piece still satisfy the Euler condition for a circuit (or for a path that starts at the current junction). Splicing a leftover tour at the stall junction uses each of those streets exactly once and does not disturb the streets already on the answer.</p><p>In plain words, stalling means \"I have finished the streets I can see from here\", and the leftover streets are always a bunch of circuits glued to the walk you already have, so appending them after a recursive restart is safe.</p>",
  array: [0, 1, 2, 0],
  arrayLabel: "tour =",
  indexLabels: ["s", "a", "b", "s"],
  vars: ["u", "used", "stack"],
  frames: [
    { note: "Toy circuit on the triangle 0-1-2-0. Every degree is 2, so a circuit exists. The walk starts at junction 0 with no street used yet.",
      active: [0], values: { u: 0, used: "0", stack: "0" } },
    { note: "Take the street 0-1. Junction 1 still has the unused street 1-2, so the walk is not stalled and continues.",
      active: [1], values: { u: 1, used: "0-1", stack: "0,1" } },
    { note: "Take 1-2 and then 2-0. The walk is back at 0 with no unused street left, so 0 stalls and the reverse-finish push begins.",
      active: [2], values: { u: 2, used: "all cycle", stack: "stall at 0" } },
    { note: "Junctions were pushed as they stalled, so the list is 0, 2, 1, 0 backwards. Reverse it to print the circuit 0-1-2-0.",
      active: [0, 1, 2], values: { u: "done", used: "3 edges", stack: "0,1,2,0" } },
    { note: "If a leftover loop had sat at 2, the walk would stall at 2 first, splice that loop onto the answer, and only then push 2.",
      active: [2], values: { u: 2, used: "splice", stack: "insert loop" } },
    { note: "For a lex-smallest directed itinerary, store unused destinations in a min-heap per junction and always pop the smallest label.",
      active: [0], values: { u: "JFK", used: "lex", stack: "Hierholzer + heap" } },
  ],
  mermaid: `graph LR
  a["0"] --- b["1"]
  b --- c["2"]
  c --- a`,
  steps: [
    "<strong>Check the degree conditions and one edge-component first.</strong> If they fail, no tour exists and Hierholzer would silently print a walk of a subgraph; reject immediately rather than trusting the walk length later.",
    "<strong>Pick the only legal start.</strong> On an undirected path that is an odd-degree junction; on a directed path that is the unique +1-out junction; on a circuit, any junction that is incident to a street. Starting elsewhere leaves leftover streets.",
    "<strong>Hierholzer: take unused streets until you stall, then push.</strong> While <code>u</code> has an unused outgoing street, consume it and walk; when none remain, push <code>u</code> onto the answer and backtrack, which is how leftover circuits get spliced at the stall.",
    "<strong>Reverse the pushed list before you print.</strong> Junctions were appended as they stalled, which is reverse-finish order, so the printed walk is backwards until you reverse it or <code>addFirst</code> as you pop.",
    "<strong>Verify the tour has m+1 junctions.</strong> A shorter list means leftover streets were never consumed: a second component, a wrong start, or a vertex-visited flag that dropped a loop.",
    "<strong>For a lex-smallest directed tour, heap the unused destinations.</strong> LC 332 wants the smallest unused airport label at every choice; a <code>PriorityQueue</code> per junction (or a TreeMap of leftover tickets) is the only extra data structure.",
  ],
  dryIntro: "Triangle 0-1-2-0, a circuit of three streets. The walk takes each street once, stalls at 0, and reversing the push order prints 0-1-2-0.",
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
      "<p>Each street is consumed exactly once and each junction is pushed onto the answer once, so Hierholzer is <code>O(n + m)</code> with an adjacency iterator (or an edge-id used array). At <code>n, m = 2&times;10&#8309;</code> that is a few hundred thousand operations, a few milliseconds. Fleury's algorithm, which checks \"is this street a bridge?\" at every step, is <code>O(m&sup2;)</code> and is not what you write.</p>",
      "<p>A min-heap per junction for the lex-smallest tour adds <code>log(degree)</code> per street. The sum of degrees is <code>2m</code>, so the extra is <code>O(m log n)</code> in the worst case and still comfortable at these limits. Isolated junctions cost nothing: you never start a walk at a vertex of degree 0.</p>",
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
      bug: "Two pieces that both contain streets can have locally even degrees, so the existence check passes, but the walk cannot jump the gap and you print a tour of only one piece.",
      fix: "Require every <em>street</em> to live in one connected piece. Isolated junctions with no streets are ignored and do not fail the check." },
    { title: "Starting at a vertex of even degree when two odds exist",
      bug: "The walk returns to the even start after using a circuit of a subgraph, leftover streets hang off an odd junction, and the printed list is shorter than <code>m+1</code>.",
      fix: "Start at an odd-degree junction (undirected path) or at the unique +1-out junction (directed path). Only a circuit may start anywhere incident to a street." },
    { title: "Forgetting to reverse",
      bug: "Hierholzer pushes junctions as they stall, which is reverse-finish order, so the printed walk is the tour written backwards and fails a judge that checks the exact sequence.",
      fix: "Call <code>Collections.reverse</code> on the list, or <code>addFirst</code> as you pop, and test on a directed path that is not a palindrome." },
    { title: "Marking vertices used",
      bug: "An Euler tour revisits junctions on purpose. A <code>visited[]</code> flag on vertices drops the leftover circuit at a degree-4 junction and prints a tour of a subgraph that still looks locally correct.",
      fix: "Mark <em>streets</em> used: an edge id, an adjacency iterator, or a heap of unused destinations. Never a vertex flag." },
    { title: "Directed tickets without a heap",
      bug: "Any Euler tour is a correct \"use every ticket once\", so a sample that has only one tour still passes, but LC 332 wants the lexicographically smallest tour and a later test splits.",
      fix: "Store unused destinations in a <code>PriorityQueue</code> per junction and always pop the smallest label. Test on two outgoing tickets from JFK with different destinations." },
  ],
  variants: [
    ["Lex smallest", "Always take the smallest unused label.", "LC 332", "JFK"],
    ["Chinese Postman undirected", "Pair odd-degree vertices with min-cost matching, duplicate those paths, then Euler.", "O(n^3) matching", ""],
    ["De Bruijn", "Nodes = (k-1)-mers, edges = k-mers. Euler tour is the sequence.", "bio / CF", ""],
  ],
  followups: [
    ["Why not mark vertices?",
      "<p>A junction of degree 4 must be entered and left twice: the first visit uses two of its streets, and the remaining two streets form a leftover circuit glued to that junction. Hierholzer is supposed to splice that circuit in when it later stalls there. A vertex-visited flag refuses the second visit and those two streets are never consumed. Mark streets, not junctions.</p>"],
    ["Hamiltonian vs Eulerian in one sentence?",
      "<p>Hamiltonian asks for a walk that visits every <em>junction</em> exactly once, which is NP-complete and has no degree test that decides it. Eulerian asks for a walk that uses every <em>street</em> exactly once, which is decided by the degree conditions on this page and constructed in linear time by Hierholzer. If the statement says \"vertices\", you are on the wrong page.</p>"],
    ["What if the graph is disconnected?",
      "<p>A circuit of a single piece still exists when that piece is Eulerian, even if other isolated junctions sit elsewhere. If the statement wants one tour of the whole input, require that every street lives in one connected piece and ignore degree-0 junctions. Two pieces that both contain streets cannot be joined by any Euler tour.</p>"],
    ["Directed path start?",
      "<p>The unique junction whose out-degree is one more than its in-degree. The unique junction whose in-degree is one more than its out-degree is the end, and you do not start there. If every in-degree equals the matching out-degree, any junction incident to a street is a legal circuit start.</p>"],
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
  readTime: "28 min",
  tagline: "Max flow equals min cut. Edmonds-Karp BFS-augments in <code>O(V E&sup2;)</code>; Dinic layers + blocking flow is the contest default.",
  tags: ["max flow", "min cut", "Dinic", "P2"],
  prereqs: [["BFS", "../07-graphs-core/bfs.html"]],
  why: [
    "You run a network of pipes from a source tank <code>s</code> to a sink tank <code>t</code>. Each pipe has a capacity, the most it can carry, and junctions other than <code>s</code> and <code>t</code> cannot store water: whatever flows in must flow out. A <em>flow</em> is an assignment of numbers to pipes that respects those two rules. The obvious greedy &mdash; pick a path, fill it, forget it &mdash; gets stuck. Push 2 along <code>s &rarr; a &rarr; t</code> on a network that also has a direct <code>s &rarr; t</code> of capacity 1 and you may block a combination that could have carried 3. Trying every subset of paths is exponential; you need a way to undo a greedy push when a better combination appears.",
    "The undo is built into the <em>residual graph</em>. When you push <code>f</code> units along <code>u &rarr; v</code>, you reduce the leftover forward capacity by <code>f</code> and create (or increase) a backward residual edge <code>v &rarr; u</code> of capacity <code>f</code>. That backward edge is not a physical pipe; it is a permission slip that says \"you may send flow backward, which is the same as cancelling previously forwarded flow\". A later path that uses <code>v &rarr; u</code> is undoing the earlier decision so those units can be rerouted. Ford-Fulkerson finds any <code>s</code>-<code>t</code> residual path and pushes the bottleneck. Edmonds-Karp always takes a shortest residual path (a BFS) and is polynomial. Dinic builds a level graph and a blocking flow; on unit-capacity networks it is the contest default.",
    "The same run answers a second question that looks physical. An <em>s-t cut</em> is a partition of the junctions into <code>S</code> containing the source and <code>T</code> containing the sink; its capacity is the total capacity of pipes that leave <code>S</code> for <code>T</code> &mdash; the pipes you would have to shut off to stop every drop. The max-flow min-cut theorem says the most you can push equals the cheapest such shutdown. In a problem statement the tell is \"maximum throughput\", \"minimum capacity to disconnect\", or a modelling sentence such as bipartite matching, project selection, or circulation with demands. The algorithm is twenty lines; the reduction is the interview.",
  ],
  insight: "A residual backward edge is an undo ticket for flow you already pushed. When no residual s-t path remains, the junctions still reachable from s are one side of a cheapest shutdown: every pipe leaving that set is full.",
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
  constraint: "<code>n &le; 200</code> is Edmonds-Karp's comfortable window. <code>n &le; 2000</code> with unit capacities wants Dinic (or Hopcroft-Karp on a bipartite graph). Capacities up to <code>10&#8309;</code> need <code>long</code> for both the leftover residual and the answer. Every original pipe must be born with a reverse twin of capacity 0, otherwise a greedy first path cannot be undone and the algorithm stops below the true maximum.",
  core: [
    "Store the network as an edge list. For every original pipe <code>u &rarr; v</code> of capacity <code>c</code>, append a forward edge of residual <code>c</code> and a reverse twin of residual 0, and remember each twin's index so an update can touch both. After some flow <code>f</code> has been pushed on that pipe, the forward residual is <code>c - f</code> (room still left) and the backward residual is <code>f</code> (room to undo). An <em>augmenting path</em> is any <code>s</code>-<code>t</code> walk whose every residual is positive. The amount you push is the bottleneck, the smallest residual on that walk: subtract it along the walk and add it to every reverse twin. Adding to the reverse is the undo: a later walk that takes the twin is cancelling this push.",
    "Edmonds-Karp finds the augmenting path with a BFS on residual &gt; 0, so each augmentation is a shortest hop-path. Dinic first BFS-labels every junction with its residual distance from <code>s</code>, then DFS-pushes a <em>blocking flow</em>: it only walks edges with <code>level[v] == level[u] + 1</code>, and a current-edge pointer remembers that an exhausted edge will not come back inside this phase. When the DFS can no longer reach <code>t</code>, the level graph is blocked; rebuild levels and repeat until a BFS cannot reach <code>t</code> at all.",
    "Walk the three-pipe sample in words. Capacities are <code>s &rarr; a</code> 3, <code>a &rarr; t</code> 2, <code>s &rarr; t</code> 1. The first BFS finds the one-hop path <code>s-t</code> and pushes 1; the forward residual <code>s &rarr; t</code> becomes 0 and a reverse <code>t &rarr; s</code> of 1 appears. The second BFS must go <code>s-a-t</code>, bottleneck <code>min(3, 2) = 2</code>, and the total becomes 3. The third BFS still reaches <code>a</code> (residual 1 remains on <code>s &rarr; a</code>) but cannot reach <code>t</code>, so the residual-reachable set is <code>S = {s, a}</code>. The pipes leaving <code>S</code> are <code>a &rarr; t</code> (capacity 2) and <code>s &rarr; t</code> (capacity 1), total 3, which equals the flow: that is the cheapest shutdown, physically the pipes you would have to close to isolate the sink.",
  ],
  extra: [
    {
      kind: "key",
      title: "Why a residual reverse edge lets flow be undone",
      html: "<p>Pushing <code>f</code> along <code>u &rarr; v</code> is a decision, not a law of physics. The reverse residual of capacity <code>f</code> is the ticket that lets a later path send <code>f</code> units back from <code>v</code> to <code>u</code>, which cancels those units on the original pipe and frees them to travel a different route. Without the twin, the first greedy path that used a scarce pipe would permanently block a better combination, and Ford-Fulkerson would stop below max flow. The reverse edge is not water flowing backward in the town; it is bookkeeping that says \"this much of my earlier push may be reassigned\".</p>",
    },
    {
      kind: "key",
      title: "What a min-cut means physically",
      html: "<p>An s-t cut is a fence: junctions on the source side <code>S</code>, junctions on the sink side <code>T</code>. Its capacity is the total size of the pipes that cross the fence from <code>S</code> to <code>T</code> &mdash; the pipes you would have to shut off (or the total capacity you would have to destroy) to stop every drop. The cheapest such fence is the min-cut. When the algorithm stops, residual-reachability from <code>s</code> names one cheapest fence: every pipe leaving that set is saturated, so no extra drop can sneak across, and the theorem says you cannot have been pushing more than that fence's capacity.</p>",
    },
  ],
  invariant: "<p>Conservation: for every junction other than <code>s</code> and <code>t</code>, inflow equals outflow. Capacity: <code>0 &le; f(e) &le; c(e)</code> on every pipe. When no residual <code>s</code>-<code>t</code> path exists, the residual-reachable set <code>S</code> is a min-cut and the flow value equals the total capacity of pipes leaving <code>S</code>.</p><p>In plain words, you keep pushing along leftover room (and along undo tickets) until the source side of the leftover network can no longer see the sink; the pipes that then sit on the boundary are all full, and that full boundary is the cheapest way to shut the network down.</p>",
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
    { note: "Pipes: s&rarr;a capacity 3, a&rarr;t capacity 2, s&rarr;t capacity 1. Residual starts as those capacities; only s has distance 0.",
      cells: [
        { r: 0, c: 0, val: "0", cls: "from" },
        { r: 0, c: 1, val: "∞" },
        { r: 0, c: 2, val: "∞" },
      ],
      values: { path: "init", bottleneck: "—", total: 0 } },
    { note: "First BFS settles a at 1 hops via s&rarr;a and t at 1 hop via s&rarr;t, so the shortest residual path is the direct pipe s-t.",
      cells: [
        { r: 1, c: 0, val: "0", cls: "from" },
        { r: 1, c: 1, val: "1", cls: "filled" },
        { r: 1, c: 2, val: "1", cls: "target" },
      ],
      values: { path: "s-t", bottleneck: 1, total: 0 } },
    { note: "Push 1 along s-t. Forward residual s&rarr;t becomes 0 and a reverse ticket t&rarr;s of 1 appears, so that push can later be undone.",
      cells: [
        { r: 2, c: 0, val: "0", cls: "from" },
        { r: 2, c: 1, val: "—" },
        { r: 2, c: 2, val: "push", cls: "answer" },
      ],
      values: { path: "s-t", bottleneck: 1, total: 1 } },
    { note: "Second BFS cannot use s-t. It settles a at 1 hop, then t at 2 hops via a&rarr;t, so the next augmenting path is s-a-t.",
      cells: [
        { r: 3, c: 0, val: "0", cls: "from" },
        { r: 3, c: 1, val: "1", cls: "filled" },
        { r: 3, c: 2, val: "2", cls: "target" },
      ],
      values: { path: "s-a-t", bottleneck: 2, total: 1 } },
    { note: "Push the bottleneck min(3, 2) = 2 along s-a-t. Residual a&rarr;t is now 0, s&rarr;a still has 1 left, and the total flow is 3.",
      cells: [
        { r: 4, c: 0, val: "0", cls: "from" },
        { r: 4, c: 1, val: "1", cls: "filled" },
        { r: 4, c: 2, val: "push", cls: "answer" },
      ],
      values: { path: "s-a-t", bottleneck: 2, total: 3 } },
    { note: "Third BFS still reaches a (s&rarr;a has residual 1) but t is gone. S = {s, a} is the source side of the min-cut, capacity 3.",
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
    "<strong>Build the residual with a reverse twin of capacity 0.</strong> Every <code>add(u, v, c)</code> appends a forward edge and a reverse edge, each storing the other's index, because without the twin a greedy first path cannot be undone.",
    "<strong>Edmonds-Karp: BFS a residual path and push the bottleneck.</strong> Walk only residual &gt; 0, take the shortest hop-path, subtract the bottleneck along it and add the same amount to every reverse twin so the push stays cancellable.",
    "<strong>Dinic: BFS levels, then DFS a blocking flow.</strong> Only walk edges with <code>level[v] == level[u] + 1</code>, and a current-edge pointer skips an exhausted residual inside the same phase; rebuild levels when the DFS can no longer reach <code>t</code>.",
    "<strong>Stop when a BFS cannot reach t at all.</strong> The value of the flow is the total leaving <code>s</code> (or entering <code>t</code>); that number will equal the capacity of the cut you read next.",
    "<strong>Read the min-cut from residual reachability.</strong> <code>S</code> is every junction a leftover-residual BFS from <code>s</code> can still see; the cut pipes are original edges <code>u &rarr; v</code> with <code>u</code> in <code>S</code>, <code>v</code> not in <code>S</code>, and they are all saturated.",
    "<strong>Store capacities and the answer in long.</strong> A pipe of capacity <code>10&#8309;</code> and a path of a few such pipes overflow an <code>int</code> residual and wrap into a fake leftover that looks like room to push.",
  ],
  dryIntro: "Three pipes, source s and sink t. Edmonds-Karp pushes 1 on s-t, then 2 on s-a-t; the leftover residual from s names the min-cut {s, a}.",
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
      "<p>Edmonds-Karp: each augmentation strictly increases the shortest residual distance of at least one junction, and that distance is at most <code>V</code>, so there are at most <code>V E</code> augmentations, each a BFS of the residual graph, which is <code>O(V E&sup2;)</code>. At <code>n = 200</code> and a few thousand pipes that is tens of millions of edge scans, comfortable. Ford-Fulkerson without the shortest-path rule can run for a number of augmentations equal to the max flow itself, which is unbounded when capacities are <code>10&#8309;</code>.</p>",
      "<p>Dinic rebuilds a level graph at most <code>V</code> times and each blocking-flow phase scans every residual edge a constant number of times thanks to the current-edge pointer, which is <code>O(V&sup2; E)</code> in the worst case. On unit-capacity networks the bound tightens to about <code>O(E min(&radic;E, V<sup>2/3</sup>))</code>, which is why Dinic is the contest default at <code>n = 2000</code> with unit caps. Store residuals in <code>long</code>: a handful of pipes of capacity <code>10&#8309;</code> overflow an <code>int</code>.</p>",
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
      bug: "Without a reverse twin, a greedy first path that used a scarce pipe cannot be cancelled, so a later better combination is invisible and the algorithm stops below the true maximum, which looks correct on a sample with only one path.",
      fix: "Every <code>add(u, v, c)</code> must also append a reverse edge of capacity 0, and the two must store each other's indices so a push updates both leftovers." },
    { title: "int overflow on cap sums",
      bug: "A path of a few pipes each of capacity <code>10&#8309;</code> exceeds <code>Integer.MAX_VALUE</code>, so a residual wraps negative and looks like room to push (or like a full pipe), and the printed max flow is junk.",
      fix: "Store capacities, residuals, bottlenecks and the answer as <code>long</code>. Test on two pipes of capacity <code>10&#8309;</code> in series and check the flow is <code>10&#8309;</code>, not a wrapped int." },
    { title: "Using original caps to read the min cut",
      bug: "Listing pipes that still have leftover original capacity includes pipes inside <code>S</code> and misses saturated pipes that actually cross the fence, so the \"cut\" does not disconnect <code>s</code> from <code>t</code>.",
      fix: "After the flow run, BFS from <code>s</code> on residual &gt; 0. The cut pipes are original edges from that reachable set to its complement; they are saturated and their residual is 0." },
    { title: "Multiple edges overwritten in a matrix",
      bug: "An adjacency-matrix residual keeps one cell per pair, so a second pipe between the same junctions silently overwrites the first and the max flow drops.",
      fix: "Use an edge list (the Dinic template) where parallel pipes are two pairs of twins, or add onto the matrix cell instead of assigning." },
    { title: "Bidirected input as two independent caps",
      bug: "An undirected pipe of capacity <code>c</code> is one shared room both ways. Modelling it as a single directed edge lets flow travel only one way; omitting the reverse twin of capacity <code>c</code> is the other half of the same bug.",
      fix: "For an undirected pipe of capacity <code>c</code>, call <code>add(u, v, c)</code> and <code>add(v, u, c)</code>, each of which also creates its residual undo twin of 0." },
  ],
  variants: [
    ["Bipartite matching", "s\to L (1), L\to R (1), R\to t (1).", "next page", "Kuhn is shorter"],
    ["Project selection", "s\to profit (profit), cost\to t (cost), inf along prerequisites.", "min cut = -max closure", ""],
    ["Vertex capacities", "Split v into vin\to vout with the vertex cap.", "standard gadget", ""],
  ],
  followups: [
    ["State the max-flow min-cut theorem.",
      "<p>In any flow network the value of a maximum s-t flow equals the capacity of a minimum s-t cut. Any flow is at most any cut, because every unit that leaves <code>s</code> and reaches <code>t</code> must cross the fence, and cannot exceed the fence's total pipe size. When the algorithm stops, the residual-reachable set <code>S</code> is a cut whose crossing pipes are all saturated, so its capacity equals the flow already pushed, and the two sides of the inequality meet.</p>"],
    ["How do you recover the cut edges?",
      "<p>After the last unsuccessful BFS, let <code>S</code> be every junction still reachable from <code>s</code> on residual &gt; 0. The cut pipes are the original edges <code>u &rarr; v</code> with <code>u</code> in <code>S</code> and <code>v</code> not in <code>S</code>. Each of those has residual 0 &mdash; they are physically full &mdash; and shutting them off is a cheapest way to stop every drop. Do not list leftover-capacity pipes inside <code>S</code>; those never leave the source side.</p>"],
    ["Why Dinic's current-edge pointer?",
      "<p>Inside one blocking-flow phase an exhausted residual edge will not regain capacity, because the only pushes happening are further along the same level graph. The pointer remembers \"I have already given up on this outgoing edge\" so each phase scans every residual edge a constant number of times instead of restarting from the front of the adjacency list after every dead-end DFS.</p>"],
    ["Unit-capacity bipartite matching complexity?",
      "<p>Build <code>s &rarr; L &rarr; R &rarr; t</code> with every capacity 1 and run Dinic: the unit-network bound is <code>O(E &radic;V)</code>, which is the same bound Hopcroft-Karp quotes in matching language. Kuhn's DFS-augment is <code>O(V E)</code> and is often faster to type when both sides have a few hundred vertices. The next page is that specialised view without building the flow network.</p>"],
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
  readTime: "26 min",
  tagline: "A matching is a set of edges with no shared vertex. In a bipartite graph, Kuhn / Hopcroft-Karp (or unit flow) finds a maximum matching in polynomial time. K\u0151nig: max matching = min vertex cover.",
  tags: ["matching", "Kuhn", "Kőnig", "P2"],
  prereqs: [
    ["Max Flow / Min Cut", "max-flow-min-cut.html"],
    ["Cycle Detection & Bipartite", "../07-graphs-core/cycle-detection-and-bipartite.html"],
  ],
  why: [
    "You are assigning jobs to workers, or placing rooks on a chessboard so that no two share a row or a column, or pairing people from two sides of a dance. The graph is <em>bipartite</em>: every edge runs from a left set <code>L</code> to a right set <code>R</code>, never within a side. A <em>matching</em> is a set of those edges that share no vertex &mdash; each worker gets at most one job. On a general graph, finding the largest matching needs Edmonds' blossom algorithm. On a bipartite graph it is twenty lines, because an unused worker can steal a job along an alternating path and the steal always increases the matching by one.",
    "Kuhn's algorithm is that steal, written as a DFS. Hopcroft-Karp (or Dinic on the unit-capacity flow network <code>s &rarr; L &rarr; R &rarr; t</code>) groups many shortest steals into phases and is what you write when both sides have a few thousand vertices. After the matching is maximum, Kőnig's theorem says its size equals the size of a <em>minimum vertex cover</em> &mdash; the smallest set of vertices that touches every edge. The cover is recovered from the Hungarian forest: start at every unmatched left vertex and walk unused edges to the right and matching edges back to the left. Hall's marriage theorem is the existence form of the same picture.",
    "In a problem statement the tell is a bipartite pairing sitting next to <code>|L|, |R| &le; 500</code> (Kuhn) or <code>2000</code> (Hopcroft-Karp / Dinic), or a follow-up that asks for a minimum vertex cover or a maximum independent set on that same graph. If the graph has odd cycles, Kuhn can return a matching that is not maximum: 2-colour first, and if the colouring fails you need blossoms, not this page.",
  ],
  insight: "An augmenting path starts at a free left vertex and alternates unused edge, matching edge, unused edge. Flipping every edge on that path (matched becomes free, free becomes matched) grows the matching by one. When no such path exists, Berge says the matching is already maximum.",
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
  constraint: "<code>|L|, |R| &le; 500</code> is Kuhn's window: one DFS of the right side per left vertex is <code>O(V E)</code>, about a million edge scans at the cap. Around 2000 vertices you want Hopcroft-Karp or Dinic on the unit network, both <code>O(E &radic;V)</code>. Recursion depth is the length of an augmenting path and can be <code>V</code>; an iterative DFS is safer on Codeforces Java. If the graph is not bipartite, this page does not apply.",
  core: [
    "Kuhn stores <code>matchR[r]</code>, the left vertex currently paired with right vertex <code>r</code>, or <code>-1</code> if <code>r</code> is free. For each left vertex <code>u</code> you try to grow the matching by one. Clear a <code>seen[]</code> array on the right (or bump a visit token), then DFS: for each unused neighbour <code>v</code> of <code>u</code>, skip <code>v</code> if already seen on this attempt; if <code>v</code> is free, claim it with <code>matchR[v] = u</code> and return true; if <code>v</code> is taken, recursively ask <code>matchR[v]</code> to rematch, and if that steal succeeds, claim <code>v</code> yourself. A failed attempt must not poison <code>seen[]</code> for the next free <code>u</code>: that is why the array is cleared at every start, not once for the whole run.",
    "After no free left vertex can find an augmenting path, the matching is maximum (Berge's theorem). To read a minimum vertex cover, grow the Hungarian forest: from every unmatched left vertex, walk unused edges <code>L &rarr; R</code> and matching edges <code>R &rarr; L</code>. The cover is (left vertices the forest never visited) union (right vertices the forest did visit). Kőnig says that set has the same size as the matching. The maximum independent set on a bipartite graph is the complement of that cover, so its size is <code>n</code> minus the matching size.",
    "Walk three-plus-three in words. Left {0, 1, 2}, right {0, 1, 2}, edges 0-0, 0-1, 1-1, 2-2. Left 0 claims right 0. Left 1 claims the free right 1. Left 2 claims right 2. The matching has size 3 and no free left vertex remains, so it is maximum. If right 1 had already been taken when left 1 tried, the DFS would have asked <code>matchR[1]</code> to rematch &mdash; that is the steal, and flipping the path would have grown the matching by one instead of failing.",
  ],
  extra: [
    {
      kind: "key",
      title: "Berge in one picture",
      html: "<p>An augmenting path has an unmatched vertex at each end and alternates unused / matched. Flipping it adds one more matched edge than it removes, so the matching grows by one. When every free left vertex has been tried and none found such a path, no larger matching exists. That is why Kuhn's outer loop is \"for each left vertex, try to augment once more\" and why a leftover <code>seen[]</code> from a failed try is a correctness bug, not a speed hack.</p>",
    },
  ],
  invariant: "<p>Berge: a matching is maximum if and only if there is no augmenting path. Kuhn searches for one from every free left vertex. After termination, Kőnig's construction on the Hungarian forest is a vertex cover of the same size as the matching.</p><p>In plain words, if a free worker can steal a job by asking someone else to move, the matching is not yet maximum; when every free worker has tried and failed, the pairing is as large as it can be, and the vertices the steal-search never reached on the left, plus the ones it did reach on the right, cover every leftover edge.</p>",
  array: [-1, 0, 1],
  arrayLabel: "matchR =",
  indexLabels: ["r0", "r1", "r2"],
  vars: ["u", "v", "match"],
  frames: [
    { note: "Left {0, 1, 2} and right {0, 1, 2}, with edges 0-0, 0-1, 1-1, 2-2. Every right vertex starts unmatched.",
      active: [0], values: { u: 0, v: 0, match: "free" } },
    { note: "Left 0 claims the free right 0. matchR[0] becomes 0 and the matching now has size 1.",
      active: [0], values: { u: 0, v: 0, match: "0\to r0" } },
    { note: "Left 1 finds right 1 still free and claims it. matchR[1] becomes 1; no steal was needed.",
      active: [1], values: { u: 1, v: 1, match: "1\to r1" } },
    { note: "Left 2 claims the free right 2. Three edges are matched and every left vertex is paired.",
      active: [2], values: { u: 2, v: 2, match: "2\to r2" } },
    { note: "If right 1 had already been taken, left 1 would DFS into matchR[1] and ask that left vertex to rematch.",
      active: [1], values: { u: 1, v: 1, match: "augment flip" } },
    { note: "No free left vertex remains, so no augmenting path exists and the matching of size 3 is maximum.",
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
    "<strong>Confirm the graph is bipartite, or trust the given sides.</strong> A 2-colouring is the check; an odd cycle means Kuhn can return a non-maximum matching and you need blossoms, not this page.",
    "<strong>Set matchR to -1 and, for each left u, clear seen then DFS-augment.</strong> Clearing <code>seen[]</code> (or bumping a visit token) at every start is required: a failed try must not poison right vertices for the next free <code>u</code>.",
    "<strong>DFS: try each unseen neighbour; claim it if free or if its match can rematch.</strong> That recursive steal is the augmenting path; on success write <code>matchR[v] = u</code> and return true so every edge on the path flips.",
    "<strong>The matching size is the number of r with matchR[r] != -1.</strong> Invert the array if you also need <code>matchL</code>; both views name the same set of edges.",
    "<strong>Read a min vertex cover from the Hungarian forest.</strong> Walk unused edges from every free left vertex and matching edges back; the cover is unvisited-left union visited-right, and Kőnig says it has the same size as the matching.",
    "<strong>A maximum independent set is the complement of that cover.</strong> On a bipartite graph its size is <code>n</code> minus the matching size; on a general graph the same sentence is NP-hard and this construction is illegal.",
  ],
  dryIntro: "Three workers and three jobs, edges 0-0, 0-1, 1-1, 2-2. Each left vertex claims a free right vertex and the matching of size 3 is already maximum.",
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
      "<p>Kuhn starts a DFS from each of the <code>V</code> left vertices, and one DFS looks at every edge at most once, so the bound is <code>O(V E)</code>. At <code>|L| = |R| = 500</code> and a few thousand edges that is a few million edge scans, comfortable. Hopcroft-Karp (and Dinic on <code>s &rarr; L &rarr; R &rarr; t</code> with unit capacities) groups shortest augmenting paths into phases; there are <code>O(&radic;V)</code> phases of work <code>O(E)</code> each, which is why 2000-vertex instances move to that algorithm.</p>",
      "<p>The Hungarian-forest cover is one extra BFS after the matching is finished, linear in <code>V + E</code>, so it does not change the leading term. Recursion depth is the length of an augmenting path and can be <code>V</code>; an iterative stack version of the DFS is the Codeforces-Java-safe spelling of the same <code>O(V E)</code>.</p>",
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
      bug: "A failed augment marks right vertices seen and never unmarks them, so a later free left vertex cannot try those jobs even though they are still legal, and the matching comes out smaller than it should.",
      fix: "Allocate a fresh <code>seen[]</code>, or bump a visit token, every time you start a DFS from a free <code>u</code>. Test by adding a second left vertex that only touches a right vertex the first try already walked." },
    { title: "Running Kuhn on a non-bipartite graph",
      bug: "An odd cycle needs a blossom, which Kuhn never shrinks, so the DFS can miss an augmenting path and return a matching that is not maximum, while every bipartite sample still passes.",
      fix: "2-colour the graph first. If the colouring fails, this page is the wrong algorithm; you need Edmonds' blossom algorithm or a different model of the problem." },
    { title: "Min cover = the matched vertices",
      bug: "Taking both ends of every matching edge double-counts and can miss an unmatched vertex that is the only cover of some leftover edge, so the set is neither minimum nor even a cover.",
      fix: "Grow the Hungarian forest from every free left vertex, alternating unused and matching edges. The cover is unvisited-left union visited-right. Check its size equals the matching size." },
    { title: "Independent set = the matching",
      bug: "A matching is a set of edges. A maximum independent set is a set of vertices. Returning the matched edges (or their endpoints) as an independent set is a type error that still has a plausible size.",
      fix: "The maximum independent set on a bipartite graph is the complement of the min vertex cover, so its size is <code>n</code> minus the matching size. Return those vertices, not the matching edges." },
    { title: "Flow gadget with cap 2 on L-R edges",
      bug: "A left vertex can then send two units across two right vertices, so the \"matching\" pairs one worker with two jobs, which looks like a larger flow and fails the original pairing.",
      fix: "The network is <code>s &rarr; L</code> capacity 1, <code>L &rarr; R</code> capacity 1, <code>R &rarr; t</code> capacity 1. The unit caps on <code>s &rarr; L</code> and <code>R &rarr; t</code> are what force each vertex to be used at most once." },
  ],
  variants: [
    ["Minimum path cover on a DAG", "Split vertices, edge u\to v becomes u_out-v_in; path cover = n - matching.", "classic", ""],
    ["Weighted assignment", "Hungarian, or MCMF with cost = -weight.", "O(n^3)", ""],
    ["Hall violator", "The unreachable side of the Hungarian forest is a Hall-violating set.", "debug assignments", ""],
  ],
  followups: [
    ["State Kőnig's theorem.",
      "<p>In a bipartite graph the size of a maximum matching equals the size of a minimum vertex cover. The proof you can code is the Hungarian forest: after a maximum matching, grow an alternating forest from every free left vertex; unvisited-left union visited-right is a cover, and it cannot be smaller than the matching because every matched edge contributes one unique cover vertex. On a general graph the two numbers can differ.</p>"],
    ["Maximum independent set?",
      "<p>On a bipartite graph it is the complement of a minimum vertex cover, so its size is <code>n</code> minus the size of a maximum matching. That is why so many \"largest set of vertices with no two adjacent\" problems on a 2-coloured graph start with Kuhn. On a general graph the same question is NP-hard and this subtraction is illegal.</p>"],
    ["How do you recover the actual pairs?",
      "<p><code>matchR[v] = u</code> means the edge from left <code>u</code> to right <code>v</code> is in the matching. Walk the right array once and emit every pair whose slot is not <code>-1</code>. If you also want a left-indexed view, invert the array into <code>matchL[u] = v</code> in the same scan. The two arrays name the same set of edges.</p>"],
    ["Kuhn vs Hopcroft-Karp in an interview?",
      "<p>Write Kuhn. Mention that Hopcroft-Karp (and Dinic on the unit network) is <code>O(E &radic;V)</code> and is what you would ship at a few thousand vertices, and that the same matching is a unit-capacity max flow. Do not write Hopcroft-Karp from scratch unless the interviewer asks for the faster algorithm; the phase machinery is easy to get wrong under time pressure.</p>"],
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



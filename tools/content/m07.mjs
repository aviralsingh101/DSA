/* Module 07 — Graphs: Core */

import { pack, lc, cf } from "./pack.mjs";

export const topics = [

/* ============================================ 1. graph-representations == */
pack({
  id: "graph-representations",
  difficulty: "Easy",
  readTime: "20 min",
  tagline: "Pick the encoding before the algorithm: adjacency list, matrix, or edge list " +
    "are not interchangeable, and the wrong one turns an <code>O(n + m)</code> walk into an " +
    "<code>O(n&sup2;)</code> timeout.",
  tags: ["graphs", "adjacency list", "adjacency matrix", "P0"],
  prereqs: [
    ["Complexity Analysis", "../00-foundations/complexity-analysis.html"],
    ["Java for DSA", "../00-foundations/java-for-dsa.html"],
  ],
  why: [
    "Every graph algorithm is written against an encoding, not a picture. The same five-node " +
      "drawing becomes neighbour arrays, an <code>n &times; n</code> matrix, or a flat edge " +
      "list, and each answers a different question in constant time. Choosing the encoding is " +
      "the first algorithmic decision.",
    "Interviews punish the wrong choice immediately. Iterating neighbours of <code>u</code> is " +
      "<code>O(deg(u))</code> on a list and <code>O(n)</code> on a matrix. Testing whether " +
      "<code>(u, v)</code> exists is the opposite. On <code>n = 10&#8309;</code> a matrix is a " +
      "memory error; on <code>n = 400</code> it is the faster structure.",
    "Off-by-one indexing, forgotten reverse edges, and mixing 0-based code with 1-based input " +
      "account for more wrong answers on easy graph problems than the algorithms themselves.",
  ],
  insight: "Adjacency list is the default because most graphs you meet are sparse " +
    "(<code>m = O(n)</code>). Reach for a matrix only when <code>n</code> is a few hundred " +
    "<em>and</em> you need <code>O(1)</code> edge tests.",
  yes: [
    "Input is n and m pairs (u, v), possibly weighted",
    "You will iterate every neighbour of a vertex (BFS, DFS, Dijkstra)",
    "You need O(1) \"is this edge present?\" (Floyd, dense DP)",
    "The graph is undirected and you must add both directions yourself",
    "Nodes arrive 1-indexed from the judge and your arrays are 0-indexed",
  ],
  no: [
    "The graph is an implicit grid &mdash; do not materialise n&sup2; adjacency lists",
    "You only need to sort the edges once (Kruskal) &mdash; keep an edge list",
    "The structure is a tree given as parent pointers &mdash; that already is the encoding",
    "You need range queries on a path &mdash; that is a decomposition, not a representation",
  ],
  table: [
    ["Iterate all neighbours of u", "Most graph algorithms", "Adjacency list"],
    ["Test whether (u, v) exists in O(1)", "Dense DP, Floyd-Warshall", "Adjacency matrix"],
    ["Sort edges by weight once", "Kruskal, offline queries", "Edge list"],
    ["Undirected pair (u, v)", "Must store both directions", "list: add twice; matrix: two cells"],
    ["Grid / maze 4-way moves", "Implicit graph", "On-the-fly neighbours, no adj list"],
    ["<strong>Confused with:</strong> \"I built a list, so edge tests are free\"",
      "Membership on a list is O(deg)",
      "Keep a matrix, a HashSet of pairs, or accept the scan"],
  ],
  constraint: "<code>n, m &le; 2&times;10&#8309;</code> forces lists (n&sup2; memory dies). " +
    "<code>n &le; 400</code> is the matrix signature. Always store vertices as int; weights as " +
    "int or long if sums can overflow.",
  core: [
    "Adjacency list: <code>List&lt;List&lt;Integer&gt;&gt; g</code> with n empty lists, then " +
      "<code>g.get(u).add(v)</code> (and <code>g.get(v).add(u)</code> if undirected). Weighted: " +
      "store <code>int[]{v, w}</code> or a small Edge type. Matrix: " +
      "<code>boolean[][]</code> or <code>int[][]</code> with INF off-edge.",
    "Allocate n+1 and ignore slot 0 when input is 1-based. Never write " +
      "<code>new ArrayList[n]</code> without suppressing warnings; prefer a loop of " +
      "<code>g.add(new ArrayList&lt;&gt;())</code>. Grids stay implicit: from (r,c) try four " +
      "deltas and bounds-check.",
  ],
  invariant: "<p>After the build, walking <code>g.get(u)</code> yields each outgoing neighbour " +
    "exactly once (twice only if you inserted a duplicate edge).</p>" +
    "<span class=\"eq\">undirected (u,v) &rArr; two inserts; 1-based input &rArr; length n+1</span>",
  arrayLabel: "deg[u] after inserting the sample edges",
  array: [2, 3, 3, 1, 1],
  indexLabels: ["0", "1", "2", "3", "4"],
  vars: ["edge", "u-v", "dir", "deg"],
  vizTitle: "Building an undirected list on 5 nodes",
  frames: [
    { note: "n=5, empty lists. Degrees all 0.",
      values: { edge: 0, "u-v": "\u2014", dir: "\u2014", deg: "[0,0,0,0,0]" } },
    { note: "Insert 0-1 undirected: g[0].add(1), g[1].add(0). deg[0]=1, deg[1]=1.",
      active: [0, 1],
      values: { edge: 1, "u-v": "0-1", dir: "both", deg: "[1,1,0,0,0]" } },
    { note: "Insert 0-2. Triangle starts at 0.",
      active: [0, 2],
      values: { edge: 2, "u-v": "0-2", dir: "both", deg: "[2,1,1,0,0]" } },
    { note: "Insert 1-2. The triangle 0-1-2 is complete.",
      active: [1, 2],
      values: { edge: 3, "u-v": "1-2", dir: "both", deg: "[2,2,2,0,0]" } },
    { note: "Insert 1-3.",
      active: [1, 3],
      values: { edge: 4, "u-v": "1-3", dir: "both", deg: "[2,3,2,1,0]" } },
    { note: "Insert 2-4. Final degrees [2,3,3,1,1]. List is the default encoding for every later page.",
      active: [2, 4], best: [0, 1, 2, 3, 4],
      values: { edge: 5, "u-v": "2-4", dir: "both", deg: "[2,3,3,1,1]" } },
  ],
  merTitle: "The running 5-node undirected graph",
  mermaid: `graph TD
  n0["0"] --- n1["1"]
  n0 --- n2["2"]
  n1 --- n2
  n1 --- n3["3"]
  n2 --- n4["4"]`,
  steps: [
    "<strong>Read n, m.</strong> Decide list vs matrix from n and whether you need O(1) tests.",
    "<strong>Allocate</strong> n (or n+1) empty neighbour lists.",
    "<strong>For each edge</strong> (u,v[,w]): add v to g[u]; if undirected also add u to g[v].",
    "<strong>Convert 1-based</strong> either by allocating n+1 or by decrementing on read.",
    "<strong>Grids:</strong> do not build lists; from a cell try 4 or 8 deltas.",
    "<strong>Kruskal-only:</strong> keep int[][] edges and skip the adjacency structure.",
  ],
  code: [
    { tab: "Brute", file: "MatrixBuild.java",
      code: `public class MatrixBuild {
    public static void main(String[] args) {
        int n = 5;
        boolean[][] g = new boolean[n][n];
        int[][] e = {{0,1},{0,2},{1,2},{1,3},{2,4}};
        for (int[] x : e) { g[x[0]][x[1]] = g[x[1]][x[0]] = true; }
        int deg1 = 0;
        for (int v = 0; v < n; v++) if (g[1][v]) deg1++;
        System.out.println(deg1);
    }
    // Input : 5-node sample, undirected
    // Output: 3
}` },
    { tab: "Optimal", file: "AdjList.java",
      code: `import java.util.ArrayList;
import java.util.List;

public class AdjList {
    static List<List<Integer>> build(int n, int[][] edges, boolean undirected) {
        List<List<Integer>> g = new ArrayList<>();
        for (int i = 0; i < n; i++) g.add(new ArrayList<>());
        for (int[] e : edges) {
            g.get(e[0]).add(e[1]);
            if (undirected) g.get(e[1]).add(e[0]);
        }
        return g;
    }
    public static void main(String[] args) {
        int[][] e = {{0,1},{0,2},{1,2},{1,3},{2,4}};
        List<List<Integer>> g = build(5, e, true);
        System.out.println(g.get(1));
        System.out.println(g.get(4));
    }
    // Input : undirected edges 0-1,0-2,1-2,1-3,2-4
    // Output: [0, 2, 3]
    //         [2]
}` },
    { tab: "Template", file: "WeightedList.java",
      code: `import java.util.ArrayList;
import java.util.List;

public class WeightedList {
    static List<List<int[]>> build(int n, int[][] edges) {
        List<List<int[]>> g = new ArrayList<>();
        for (int i = 0; i < n; i++) g.add(new ArrayList<>());
        for (int[] e : edges) {
            g.get(e[0]).add(new int[] {e[1], e[2]});
            g.get(e[1]).add(new int[] {e[0], e[2]});
        }
        return g;
    }
    public static void main(String[] args) {
        int[][] e = {{0,1,4},{1,3,1},{0,2,2},{2,4,7}};
        var g = build(5, e);
        for (int[] x : g.get(0)) System.out.print(x[0] + ":" + x[1] + " ");
        System.out.println();
    }
    // Input : weighted undirected 0-1:4, 1-3:1, 0-2:2, 2-4:7
    // Output: 1:4 2:2
}` },
  ],
  complexity: {
    time: "O(n + m) to build a list; O(n\u00b2) a matrix",
    space: "O(n + m) list; O(n\u00b2) matrix",
    derivation: [
      "Each edge is stored a constant number of times (once directed, twice undirected), so a list is linear in the input size.",
      "<span class=\"eq\">list: S = n + &Theta;(m); matrix: S = n&sup2; regardless of m</span>",
      "Neighbour iteration is O(deg) vs O(n). That factor is why Dijkstra on a matrix is O(n&sup2;) even with a heap-free scan.",
    ],
    compare: [
      ["Adjacency list", "O(n+m) build", "O(n+m)", "Default sparse graphs"],
      ["Adjacency matrix", "O(n\u00b2)", "O(n\u00b2)", "n<=400, O(1) edge tests"],
      ["Edge list", "O(m)", "O(m)", "Kruskal, Bellman-Ford outer scan"],
      ["Implicit grid", "O(1) per move", "O(RC) visited", "Mazes, 01-matrix, rotting oranges"],
    ],
  },
  pitfalls: [
    { title: "Forgetting the reverse edge",
      bug: "Undirected input stored one way. BFS from one endpoint never sees the other.",
      fix: "In the same loop body: add both directions. Directed problems add once." },
    { title: "1-based vs 0-based",
      bug: "ArrayIndexOutOfBounds at n, or vertex 0 is a ghost nobody reaches.",
      fix: "Allocate n+1 and ignore 0, or decrement every label as you read." },
    { title: "new ArrayList[n] generic array",
      bug: "Unchecked warning, and easy to forget to fill each slot, then NPE on g[u].add.",
      fix: "List of lists, loop-init each ArrayList." },
    { title: "Materialising a grid graph",
      bug: "RC vertices and 4RC edges allocated for a maze. Memory and constant-factor death.",
      fix: "Compute neighbours from (r,c) with dr/dc arrays." },
    { title: "Self-loops and multi-edges",
      bug: "Degree counts and \"m = n-1 so it is a tree\" tests lie.",
      fix: "Know whether the statement allows them; skip u==v if they are noise." },
  ],
  variants: [
    ["Weighted pairs", "Store (v,w) not bare ints.", "g.get(u).add(new int[]{v,w});", "Dijkstra, 0-1 BFS"],
    ["CSR / flattened lists", "head[] + to[] + nxt[] for contests that ban ArrayList.",
      "to[++m]=v; nxt[m]=head[u]; head[u]=m;", "Faster, uglier"],
    ["Functional graph", "Each node has outdegree 1: just int[] nxt.",
      "nxt[u] = v;", "Cycle finding in mappings"],
  ],
  followups: [
    ["When is a matrix smaller than a list?",
      "<p>When the graph is dense, m ~ n&sup2;/2. A boolean matrix is n&sup2; bits-or-bytes; a list of Integer objects is much fatter per edge. For n=400, matrix wins. For n=1e5, matrix does not exist.</p>"],
    ["How do you test edge existence on a list quickly?",
      "<p>Sort each neighbour list and binary search, or keep a HashSet of packed longs ((long)u<<32|v). Usually you do not need it: BFS/DFS never ask \"is uv an edge?\" they iterate neighbours.</p>"],
    ["Directed vs undirected in the rest of this module?",
      "<p>BFS/DFS/components assume you stored the right directions. Cycle detection and bipartite are defined differently on directed graphs (that is a later page). Default in interviews: undirected unless the statement says otherwise.</p>"],
    ["Why not Map&lt;Integer,List&lt;Integer&gt;&gt;?",
      "<p>When vertices are 0..n-1 an ArrayList of lists is faster and simpler. Use a map only for sparse labels (word ladder strings, chess squares as packed ints).</p>"],
  ],
  problems: [
    lc(133, "clone-graph", "Medium", "Copy the encoding"),
    lc(1971, "find-if-path-exists-in-graph", "Easy", "Build list, BFS/DFS/DSU"),
    lc(1791, "find-center-of-star-graph", "Easy", "Degree  n-1"),
    lc(997, "find-the-town-judge", "Easy", "In/out degree arrays"),
    lc(1042, "flower-planting-with-no-adjacent", "Medium", "List + greedy colour"),
    cf("115A", "Party", "Easy", "Directed tree as lists, longest chain"),
    lc(1557, "minimum-number-of-vertices-to-reach-all-nodes", "Medium", "In-degree 0 set"),
    lc(323, "number-of-connected-components-in-an-undirected-graph", "Medium", "Build then DFS/DSU"),
  ],
  recap: [
    "<strong>List is the default</strong> for sparse n,m ~ 1e5.",
    "<strong>Matrix</strong> when n&le;400 and you need O(1) edge tests.",
    "<strong>Undirected means two writes</strong> in the same loop.",
    "<strong>1-indexed input: allocate n+1</strong>.",
    "<strong>Do not materialise implicit graphs</strong> (grids, functional maps).",
  ],
  oneliner: "list default O(n+m) | matrix n<=400 | undirected: push both | 1-index: alloc n+1",
}),

/* ============================================ 2. bfs =================== */
pack({
  id: "bfs",
  difficulty: "Easy",
  readTime: "22 min",
  tagline: "The only shortest-path algorithm you need on an unweighted graph: a queue, a " +
    "<code>dist</code> array, and the rule that the first time you see a vertex is the closest time.",
  tags: ["BFS", "queue", "shortest path", "P0"],
  prereqs: [["Graph Representations", "graph-representations.html"]],
  why: [
    "Breadth-first search visits vertices in order of unweighted distance from the source. That " +
      "is why it computes shortest paths on unit-weight graphs, why multi-source flood-fills " +
      "work, and why \"minimum operations to turn A into B\" is a BFS on an implicit graph.",
    "The code is short and the bugs are classic: marking visited at pop instead of push (the " +
      "queue explodes), using a Stack by accident, forgetting disconnected components, and " +
      "treating a weighted graph as unweighted.",
    "The queue is the frontier, dist[u] is the level, and the invariant is visible in the array: " +
      "processed vertices, the current layer, and the undiscovered rest.",
  ],
  insight: "The first time BFS reaches a vertex is via a shortest path. Mark it visited " +
    "<em>when you push</em>, so each vertex enters the queue once.",
  yes: [
    "Shortest path on a graph whose edges all have the same weight",
    "Minimum number of moves / operations to reach a state",
    "Multi-source flooding: rotting oranges, walls and gates, 01-matrix",
    "Level-order of a tree, or nodes at distance k",
    "Implicit graph of a word ladder, a lock, or a grid with 4-way moves",
  ],
  no: [
    "Edges have different positive weights &rarr; Dijkstra",
    "Weights are only 0 and 1 &rarr; 0-1 BFS, not this page",
    "Negative weights &rarr; Bellman-Ford",
    "You need a spanning tree of a component, not distances &rarr; DFS is enough",
  ],
  table: [
    ["Shortest unweighted path s to t", "Layers by distance", "BFS, stop at t"],
    ["Minimum operations A to B", "Implicit graph", "BFS on states"],
    ["Rotting oranges / 01-matrix", "Multi-source", "Queue all sources at dist 0"],
    ["Word ladder", "Words as vertices", "BFS, neighbours = one-letter diffs"],
    ["Weighted positive edges", "Not unit length", "Dijkstra"],
    ["<strong>Confused with:</strong> 0-1 BFS",
      "0-weight edges break \"first visit is best\" unless you deque to the front",
      "See zero-one-bfs"],
  ],
  constraint: "<code>n, m &le; 2&times;10&#8309;</code> or a grid <code>R,C &le; 10&#179;</code>. " +
    "Time O(n+m). Mark on push so the queue holds O(n), not O(n&sup2;) duplicates.",
  core: [
    "dist[] starts at -1 (unseen). Queue the source, dist[s]=0. While the queue is non-empty, " +
      "pop u, and for each unseen neighbour v set dist[v]=dist[u]+1 and push v. First hit is " +
      "shortest because edges have equal weight, so a vertex is never improved later.",
    "Multi-source: push every source with dist 0 first. The first time a cell is reached is " +
      "the distance to the nearest source. Parent[] or a prev map reconstructs the path.",
  ],
  invariant: "<p>Vertices leave the queue in non-decreasing dist order. When u is popped, " +
    "dist[u] is final.</p>" +
    "<span class=\"eq\">first push of v sets dist[v] = dist[u] + 1 = &delta;(s, v)</span>",
  arrayLabel: "dist[u]  (-1 = unseen)",
  array: [0, 1, 1, 2, 2],
  indexLabels: ["0", "1", "2", "3", "4"],
  vars: ["u", "queue", "v", "distV"],
  vizTitle: "BFS from 0 on the 5-node sample",
  frames: [
    { note: "Source 0. dist[0]=0, queue [0]. Others unseen.",
      active: [0], dim: [1, 2, 3, 4],
      values: { u: 0, queue: "[0]", v: "\u2014", distV: 0 } },
    { note: "Pop 0. Neighbours 1 and 2 unseen. Push 1 (dist 1), push 2 (dist 1). Mark on push.",
      active: [1, 2], done: [0],
      values: { u: 0, queue: "[1, 2]", v: "1,2", distV: 1 } },
    { note: "Pop 1. Neighbour 3 unseen, dist 2. Neighbour 2 already seen, skip.",
      active: [3], done: [0, 1],
      values: { u: 1, queue: "[2, 3]", v: 3, distV: 2 } },
    { note: "Pop 2. Neighbour 4 unseen, dist 2. 0 and 1 already seen.",
      active: [4], done: [0, 1, 2],
      values: { u: 2, queue: "[3, 4]", v: 4, distV: 2 } },
    { note: "Pop 3. Neighbour 1 seen. Queue [4].",
      done: [0, 1, 2, 3], active: [4],
      values: { u: 3, queue: "[4]", v: "\u2014", distV: "\u2014" } },
    { note: "Pop 4. Done. dist = [0,1,1,2,2]. First visit was shortest.",
      best: [0, 1, 2, 3, 4],
      values: { u: 4, queue: "[]", v: "done", distV: 2 } },
  ],
  merTitle: "BFS layers from source 0",
  mermaid: `graph TD
  n0["0 dist=0"] --- n1["1 dist=1"]
  n0 --- n2["2 dist=1"]
  n1 --- n2
  n1 --- n3["3 dist=2"]
  n2 --- n4["4 dist=2"]`,
  steps: [
    "<strong>dist = -1 everywhere</strong>, dist[s]=0, queue s. Use ArrayDeque, not Stack.",
    "<strong>While queue nonempty:</strong> u = poll.",
    "<strong>For each neighbour v</strong> with dist[v]==-1: dist[v]=dist[u]+1, offer v.",
    "<strong>Mark on push</strong> (dist[v] != -1 means queued). Never wait until pop.",
    "<strong>Multi-source:</strong> offer every source at dist 0 before the loop.",
    "<strong>Path:</strong> store parent[v]=u on the relaxing push, then walk back from t.",
  ],
  code: [
    { tab: "Brute", file: "AllPathsMin.java",
      code: `import java.util.*;
public class AllPathsMin {
    static int best = Integer.MAX_VALUE;
    static void dfs(List<List<Integer>> g, int u, int t, boolean[] seen, int d) {
        if (u == t) { best = Math.min(best, d); return; }
        seen[u] = true;
        for (int v : g.get(u)) if (!seen[v]) dfs(g, v, t, seen, d + 1);
        seen[u] = false;
    }
    public static void main(String[] args) {
        List<List<Integer>> g = Adj.sample();
        dfs(g, 0, 4, new boolean[5], 0);
        System.out.println(best);
    }
    // Input : sample graph, 0 to 4
    // Output: 2
    static class Adj {
        static List<List<Integer>> sample() {
            List<List<Integer>> g = new ArrayList<>();
            for (int i = 0; i < 5; i++) g.add(new ArrayList<>());
            int[][] e = {{0,1},{0,2},{1,2},{1,3},{2,4}};
            for (int[] x : e) { g.get(x[0]).add(x[1]); g.get(x[1]).add(x[0]); }
            return g;
        }
    }
}` },
    { tab: "Optimal", file: "BFS.java",
      code: `import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class BFS {
    static int[] bfs(List<List<Integer>> g, int s) {
        int n = g.size();
        int[] dist = new int[n];
        Arrays.fill(dist, -1);
        ArrayDeque<Integer> q = new ArrayDeque<>();
        dist[s] = 0;
        q.add(s);
        while (!q.isEmpty()) {
            int u = q.poll();
            for (int v : g.get(u)) if (dist[v] < 0) {
                dist[v] = dist[u] + 1;
                q.add(v);
            }
        }
        return dist;
    }
    public static void main(String[] args) {
        List<List<Integer>> g = new ArrayList<>();
        for (int i = 0; i < 5; i++) g.add(new ArrayList<>());
        int[][] e = {{0,1},{0,2},{1,2},{1,3},{2,4}};
        for (int[] x : e) { g.get(x[0]).add(x[1]); g.get(x[1]).add(x[0]); }
        System.out.println(Arrays.toString(bfs(g, 0)));
    }
    // Input : sample undirected graph, source 0
    // Output: [0, 1, 1, 2, 2]
}` },
    { tab: "Template", file: "GridBFS.java",
      code: `import java.util.ArrayDeque;
import java.util.Arrays;

public class GridBFS {
    static final int[] DR = {-1, 1, 0, 0}, DC = {0, 0, -1, 1};
    static int[][] dist(int[][] grid) {
        int R = grid.length, C = grid[0].length;
        int[][] d = new int[R][C];
        for (int[] row : d) Arrays.fill(row, -1);
        ArrayDeque<int[]> q = new ArrayDeque<>();
        for (int r = 0; r < R; r++)
            for (int c = 0; c < C; c++)
                if (grid[r][c] == 0) { d[r][c] = 0; q.add(new int[]{r, c}); }
        while (!q.isEmpty()) {
            int[] u = q.poll();
            for (int k = 0; k < 4; k++) {
                int nr = u[0] + DR[k], nc = u[1] + DC[k];
                if (nr < 0 || nr >= R || nc < 0 || nc >= C || d[nr][nc] >= 0) continue;
                d[nr][nc] = d[u[0]][u[1]] + 1;
                q.add(new int[]{nr, nc});
            }
        }
        return d;
    }
    public static void main(String[] args) {
        int[][] g = {{0,1,1},{1,1,1},{1,1,1}};
        System.out.println(dist(g)[2][2]);
    }
    // Input : 3x3 grid, source at (0,0)
    // Output: 4
}` },
  ],
  complexity: {
    time: "O(n + m)",
    space: "O(n)",
    derivation: [
      "Each vertex is pushed at most once (marked on push). Each edge is examined a constant number of times from its endpoints.",
      "<span class=\"eq\">T = &Theta;(n + m), S = queue + dist = O(n)</span>",
      "Marking on pop would enqueue the same vertex once per incoming edge and can blow the queue to O(n&sup2;) on dense graphs.",
    ],
    compare: [
      ["DFS path", "O(n+m) but not shortest", "O(n)", "Components, not distances"],
      ["BFS", "O(n+m)", "O(n)", "Unit weights, first visit is best"],
      ["0-1 BFS", "O(n+m)", "O(n)", "Weights in {0,1}"],
      ["Dijkstra", "O(m log n)", "O(n)", "Non-negative weights"],
    ],
  },
  pitfalls: [
    { title: "Marking visited at pop",
      bug: "The same vertex is queued many times; memory and time explode.",
      fix: "Set dist[v] (or seen[v]) in the same breath as q.add(v)." },
    { title: "Using Stack / DFS accidentally",
      bug: "LIFO does not visit by distance. Paths can be long.",
      fix: "ArrayDeque with add/poll (FIFO). addLast/pollLast is a stack." },
    { title: "Weighted edges treated as unit",
      bug: "BFS on a graph with weights 1 and 100 reports the hop-shortest, not the weight-shortest.",
      fix: "Dijkstra or 0-1 BFS." },
    { title: "Disconnected source",
      bug: "dist[t] stays -1 and you print it as a length, or you forget to run BFS from every component.",
      fix: "Unreachable is -1. Multi-component: loop sources or one BFS per unseen." },
    { title: "Grid without bounds checks",
      bug: "nr, nc walk off the board. Crash or wrap.",
      fix: "Reject nr&lt;0 || nr&gt;=R || nc&lt;0 || nc&gt;=C before indexing." },
  ],
  variants: [
    ["Multi-source", "All sources in the queue at dist 0 before the loop.",
      "for (s : sources) { dist[s]=0; q.add(s); }", "Rotting oranges, 01-matrix"],
    ["0-1 BFS", "Deque: weight 0 to front, weight 1 to back.",
      "if (w==0) q.addFirst(v); else q.addLast(v);", "Next page"],
    ["Bidirectional BFS", "Expand from s and t; meet in the middle.",
      "alternate pop from qs and qt", "Word ladder, large implicit graphs"],
  ],
  followups: [
    ["Why is the first visit optimal?",
      "<p>All edges have the same weight, so a walk with fewer edges is always lighter. BFS explores by hop count, so the first time you arrive you have the fewest hops.</p>"],
    ["How do you reconstruct the path?",
      "<p>parent[v]=u when you push v. Then from t walk parent until s, reverse. Length is dist[t].</p>"],
    ["BFS on a tree?",
      "<p>Same code. Level order is BFS. Distances from a node are unique. Two BFS (or one DFS) find the diameter: BFS from any node to a farthest, BFS again from there.</p>"],
    ["When does BFS use more memory than DFS?",
      "<p>On a complete binary tree the last level holds n/2 nodes, so the queue is &Theta;(n). DFS stack is O(height)=O(log n) on a balanced tree and O(n) on a path. Different worst cases.</p>"],
  ],
  problems: [
    lc(102, "binary-tree-level-order-traversal", "Medium", "Tree BFS"),
    lc(200, "number-of-islands", "Medium", "Grid flood; DFS also works"),
    lc(542, "01-matrix", "Medium", "Multi-source BFS"),
    lc(994, "rotting-oranges", "Medium", "Multi-source, minutes = max dist"),
    lc(127, "word-ladder", "Hard", "Implicit BFS"),
    lc(1091, "shortest-path-in-binary-matrix", "Medium", "8-way grid BFS"),
    cf("1037D", "Valid BFS?", "Medium", "Check a claimed BFS order"),
    lc(1293, "shortest-path-in-a-grid-with-obstacles-elimination", "Hard", "State = (r,c,k)"),
  ],
  recap: [
    "<strong>FIFO queue</strong>, ArrayDeque, mark on push.",
    "<strong>First visit is shortest</strong> on unit-weight graphs.",
    "<strong>Multi-source:</strong> all sources at dist 0 first.",
    "<strong>Grids stay implicit</strong> with dr/dc.",
    "<strong>Weighted &ne; BFS</strong> &mdash; Dijkstra or 0-1 BFS.",
  ],
  oneliner: "dist=-1; dist[s]=0; q.add(s); while q: u=poll; for v unseen: dist[v]=dist[u]+1, push",
}),

/* ============================================ 3. dfs-and-components ===== */
pack({
  id: "dfs-and-components",
  difficulty: "Easy",
  readTime: "22 min",
  tagline: "Depth-first search is the graph's recursion: mark, recurse on unseen neighbours, " +
    "and the vertices you touched in one call are a connected component.",
  tags: ["DFS", "components", "recursion", "P0"],
  prereqs: [
    ["Graph Representations", "graph-representations.html"],
    ["BFS", "bfs.html"],
  ],
  why: [
    "DFS does not find shortest paths. It finds a spanning tree of each component, enter/exit " +
      "times, and the connected pieces of an undirected graph. Those facts unlock cycle " +
      "detection, topological sort, bridges and SCCs.",
    "The practical reason to prefer DFS for components is that the code is a six-line recursion " +
      "and the component id of every vertex is \"the start vertex of the DFS that first reached " +
      "it\". Number of islands and provinces are this idea in costume.",
    "The cost is the call stack. On a path of n = 1e5, the JVM throws. The cure is an explicit " +
      "ArrayDeque stack, not a hope that the graph is shallow.",
  ],
  insight: "One DFS from an unvisited vertex paints exactly one connected component. Loop over " +
    "vertices, start a new paint when you see a fresh one, and the number of paints is the " +
    "number of components.",
  yes: [
    "How many connected groups / islands / provinces?",
    "Colour / list every vertex in the same component as X",
    "You need enter/exit times, a preorder, or a parent in a spanning tree",
    "The next algorithm is cycle detection, topo sort, bridges or SCCs",
    "A grid of land/water and 4-way adjacency",
  ],
  no: [
    "You need shortest unweighted distances &rarr; BFS",
    "You need shortest weighted distances &rarr; Dijkstra",
    "Directed groups that can all reach each other &rarr; SCC, not undirected DFS",
    "Pairs to unify and you only need the grouping &rarr; DSU is shorter",
  ],
  table: [
    ["Count islands / provinces", "Undirected components", "DFS flood or DSU"],
    ["Grid land/water", "Implicit 4-way graph", "DFS/BFS flood fill"],
    ["tin[] / tout[] / subtree size", "DFS tree metrics", "Timestamps around rec calls"],
    ["Is the graph connected?", "One component or more", "One DFS, then scan visited"],
    ["Directed, can I reach t from s?", "Reachability, not components", "DFS/BFS from s"],
    ["<strong>Confused with:</strong> BFS components",
      "Same partition, different tree",
      "DFS for recursion/timestamps; BFS for distances"],
  ],
  constraint: "<code>n, m &le; 2&times;10&#8309;</code>. Recursive DFS needs an explicit stack " +
    "at this size. Time O(n+m). A grid is O(RC).",
  core: [
    "Mark u visited (and assign the current component id), then recurse on each unseen " +
      "neighbour. Because an undirected edge is stored both ways, the parent is already " +
      "visited and skipped. Everything else you reach is in the same component.",
    "The outer loop is the part people forget. dfs(0) only paints the component of 0. Iterate " +
      "s = 0..n-1 and start a new DFS with a fresh id whenever s is still unseen. tin/tout " +
      "increment around the recursive calls and turn ancestry into an interval test.",
  ],
  invariant: "<p>During dfs(u), every vertex already marked with the current id is reachable " +
    "from the component start, and when dfs(u) returns, every vertex reachable from u through " +
    "unseen vertices has been marked.</p>" +
    "<span class=\"eq\">one start of dfs on an unvisited vertex = one connected component</span>",
  arrayLabel: "comp[u]  (-1 = unseen)",
  array: [0, 0, 0, 0, 1],
  indexLabels: ["0", "1", "2", "3", "4"],
  vars: ["u", "stack", "id", "compU"],
  vizTitle: "Two components: paint {0,1,2,3} then isolated 4",
  frames: [
    { note: "Add isolated vertex 4 to the sample. All comp = -1. Start at 0, id 0.",
      active: [0], dim: [1, 2, 3, 4],
      values: { u: 0, stack: "[0]", id: 0, compU: 0 } },
    { note: "Recurse to 1, still id 0.",
      active: [1], done: [0],
      values: { u: 1, stack: "[0,1]", id: 0, compU: 0 } },
    { note: "From 1 to 2 and 3. Triangle plus 3 all id 0.",
      active: [2, 3], done: [0, 1],
      values: { u: 2, stack: "[0,1,2]", id: 0, compU: 0 } },
    { note: "Component 0 finished. Outer loop finds 4 unseen.",
      done: [0, 1, 2, 3], dim: [4],
      values: { u: "scan", stack: "[]", id: 0, compU: "0 done" } },
    { note: "dfs(4) with id 1. No neighbours.",
      active: [4], done: [0, 1, 2, 3],
      values: { u: 4, stack: "[4]", id: 1, compU: 1 } },
    { note: "Two components. Answer 2. comp = [0,0,0,0,1].",
      best: [4], done: [0, 1, 2, 3],
      values: { u: "done", stack: "[]", id: 1, compU: "2 comps" } },
  ],
  merTitle: "Two components on five nodes",
  mermaid: `graph TD
  n0["0"] --- n1["1"]
  n0 --- n2["2"]
  n1 --- n2
  n1 --- n3["3"]
  n4["4 isolated"]`,
  steps: [
    "<strong>comp[u] = -1</strong> (unseen). comps = 0.",
    "<strong>For s in 0..n-1</strong> if unseen: dfs(s, comps++).",
    "<strong>dfs(u, id):</strong> comp[u]=id; for v in g[u] if unseen dfs(v, id).",
    "<strong>Grid:</strong> same, recurse to 4-neighbours that are land and unvisited.",
    "<strong>Timestamps:</strong> tin[u]=timer++ before children, tout[u]=timer after (or timer-1).",
    "<strong>If n=1e5 path:</strong> rewrite with an explicit stack of (u, neighbour-index).",
  ],
  code: [
    { tab: "Brute", file: "FloodRecursive.java",
      code: `import java.util.*;
public class FloodRecursive {
    static void dfs(List<List<Integer>> g, int u, int[] comp, int id) {
        comp[u] = id;
        for (int v : g.get(u)) if (comp[v] < 0) dfs(g, v, comp, id);
    }
    public static void main(String[] args) {
        List<List<Integer>> g = new ArrayList<>();
        for (int i = 0; i < 5; i++) g.add(new ArrayList<>());
        int[][] e = {{0,1},{0,2},{1,2},{1,3}};
        for (int[] x : e) { g.get(x[0]).add(x[1]); g.get(x[1]).add(x[0]); }
        int[] comp = new int[5];
        Arrays.fill(comp, -1);
        int id = 0;
        for (int s = 0; s < 5; s++) if (comp[s] < 0) dfs(g, s, comp, id++);
        System.out.println(id + " " + Arrays.toString(comp));
    }
    // Input : triangle 0-1-2 plus 1-3, isolated 4
    // Output: 2 [0, 0, 0, 0, 1]
}` },
    { tab: "Optimal", file: "Components.java",
      code: `import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Components {
    static int[] iterative(List<List<Integer>> g) {
        int n = g.size();
        int[] comp = new int[n];
        Arrays.fill(comp, -1);
        int id = 0;
        ArrayDeque<Integer> st = new ArrayDeque<>();
        for (int s = 0; s < n; s++) if (comp[s] < 0) {
            comp[s] = id;
            st.push(s);
            while (!st.isEmpty()) {
                int u = st.pop();
                for (int v : g.get(u)) if (comp[v] < 0) {
                    comp[v] = id;
                    st.push(v);
                }
            }
            id++;
        }
        return comp;
    }
    public static void main(String[] args) {
        List<List<Integer>> g = new ArrayList<>();
        for (int i = 0; i < 5; i++) g.add(new ArrayList<>());
        int[][] e = {{0,1},{0,2},{1,2},{1,3}};
        for (int[] x : e) { g.get(x[0]).add(x[1]); g.get(x[1]).add(x[0]); }
        System.out.println(Arrays.toString(iterative(g)));
    }
    // Input : same sample, isolated 4
    // Output: [0, 0, 0, 0, 1]
}` },
    { tab: "Template", file: "IslandDfs.java",
      code: `public class IslandDfs {
    static final int[] DR = {-1,1,0,0}, DC = {0,0,-1,1};
    static int numIslands(char[][] g) {
        int R = g.length, C = g[0].length, ans = 0;
        for (int r = 0; r < R; r++)
            for (int c = 0; c < C; c++) if (g[r][c] == '1') {
                ans++;
                dfs(g, r, c);
            }
        return ans;
    }
    static void dfs(char[][] g, int r, int c) {
        if (r < 0 || r >= g.length || c < 0 || c >= g[0].length || g[r][c] != '1') return;
        g[r][c] = '0';
        for (int k = 0; k < 4; k++) dfs(g, r + DR[k], c + DC[k]);
    }
    public static void main(String[] args) {
        char[][] g = {{'1','1','0'},{'1','0','0'},{'0','0','1'}};
        System.out.println(numIslands(g));
    }
    // Input : two islands in a 3x3 grid
    // Output: 2
}` },
  ],
  complexity: {
    time: "O(n + m)",
    space: "O(n) plus recursion / explicit stack",
    derivation: [
      "Each vertex is marked once; each edge is looked at from both ends. Same as BFS.",
      "<span class=\"eq\">T = &Theta;(n + m), S_stack = &Theta;(height) which can be n</span>",
      "That is why the iterative version is the contest default for n=1e5.",
    ],
    compare: [
      ["Recursive DFS", "O(n+m)", "O(n) stack", "Small n, or guaranteed shallow"],
      ["Iterative DFS", "O(n+m)", "O(n) heap", "n=1e5 path graphs"],
      ["BFS components", "O(n+m)", "O(n) queue", "Same answer, distances as a bonus"],
      ["DSU", "O(m \u03b1(n))", "O(n)", "Online edges, Kruskal, no DFS tree"],
    ],
  },
  pitfalls: [
    { title: "dfs(0) only",
      bug: "You paint one component and report 1 on a disconnected graph.",
      fix: "Outer loop over all vertices (or all grid cells)." },
    { title: "StackOverflowError on a path",
      bug: "Recursive DFS depth n. JVM default stack is a few thousand frames.",
      fix: "Explicit ArrayDeque, or DSU." },
    { title: "Not marking the start before pushing neighbours",
      bug: "Same vertex queued many times in the iterative version.",
      fix: "Mark on push, same as BFS." },
    { title: "Directed \"components\"",
      bug: "Undirected DFS on a directed graph reports weakly-connected pieces, not SCCs.",
      fix: "Kosaraju / Tarjan for strong connectivity." },
    { title: "Mutating the grid then needing it later",
      bug: "Painting '1' to '0' destroys the input.",
      fix: "Separate seen[][] if the caller still needs the grid." },
  ],
  variants: [
    ["Timestamps", "tin before children, tout after. Ancestor iff tin[u]<=tin[v]<=tout[u].",
      "tin[u]=timer++; /* rec */ tout[u]=timer;", "Bridges, Euler tour, HLD"],
    ["Explicit stack with iterator", "Push (u, next-neighbour-index) for correct tin/tout.",
      "st.push(new int[]{u, 0});", "When you need the DFS tree, not just the paint"],
    ["DSU instead", "Union every edge, count roots.",
      "if (dsu.union(u,v)) comps--;", "Shorter when you do not need a walk"],
  ],
  followups: [
    ["DFS vs BFS for islands?",
      "<p>Same O(RC). DFS is shorter recursive code. BFS avoids stack overflow on a snake of land. Interviewers accept either; mention the stack issue.</p>"],
    ["How do tin/tout test ancestry?",
      "<p>u is an ancestor of v in the DFS tree iff the interval [tin[u], tout[u]] contains tin[v]. That is the Euler-tour view of a tree.</p>"],
    ["Connected vs strongly connected?",
      "<p>Undirected: one DFS (or one BFS, or DSU) per component. Directed: \"can everyone reach everyone?\" needs SCCs. Weak connectivity is the undirected view of the underlying graph.</p>"],
    ["Why mark on push in iterative DFS?",
      "<p>The same reason as BFS: an unmarked vertex with many incoming tree edges would otherwise sit on the stack many times. For components you only need visited; for tin/tout you need a neighbour iterator.</p>"],
  ],
  problems: [
    lc(200, "number-of-islands", "Medium", "Grid DFS"),
    lc(547, "number-of-provinces", "Medium", "Matrix as graph, DFS/DSU"),
    lc(695, "max-area-of-island", "Medium", "Component size"),
    lc(733, "flood-fill", "Easy", "DFS/BFS paint"),
    lc(841, "keys-and-rooms", "Medium", "Reachability DFS"),
    cf("977E", "Cyclic Components", "Medium", "Components that are single cycles"),
    lc(323, "number-of-connected-components-in-an-undirected-graph", "Medium", "Paint or DSU"),
    cf("598D", "Igor In the Museum", "Medium", "Component + extra payload"),
  ],
  recap: [
    "<strong>One DFS start = one component</strong>; loop the vertices.",
    "<strong>Mark on entry / on push</strong>.",
    "<strong>Iterative stack</strong> when n can be a path.",
    "<strong>tin/tout</strong> turn ancestry into intervals.",
    "<strong>Directed strong connectivity</strong> is a later page (SCC).",
  ],
  oneliner: "for s unseen: dfs(s,id++); dfs: mark, rec unseen neighbours",
}),

/* ============================================ 4. cycle-detection-and-bipartite */
pack({
  id: "cycle-detection-and-bipartite",
  difficulty: "Medium",
  readTime: "22 min",
  tagline: "A back edge to an active ancestor is a cycle; a neighbour already coloured your " +
    "colour is a non-bipartite odd cycle. Same DFS, two extra integers.",
  tags: ["cycle", "bipartite", "coloring", "P0"],
  prereqs: [["DFS & Components", "dfs-and-components.html"]],
  why: [
    "\"Does this graph have a cycle?\" and \"can you 2-colour it?\" are the two most common " +
      "graph predicates after connectivity. Both are one extra field on the DFS/BFS you already " +
      "have: colour WHITE/GRAY/BLACK for directed cycles, parent-skip plus a seen ancestor for " +
      "undirected, and a 0/1 colour for bipartite.",
    "Bipartite is exactly \"no odd cycle\". Course schedule (directed cycle), redundant " +
      "connection (undirected cycle), is-graph-bipartite, and possible-bipartition are the " +
      "interview cluster. Getting the parent-skip wrong reports every undirected edge as a cycle.",
    "Directed and undirected tests are different algorithms that share a walk. Mixing them is " +
      "the classification error this page exists to prevent.",
  ],
  insight: "Undirected cycle: a seen neighbour that is not your parent. Directed cycle: a " +
    "neighbour still on the recursion stack (GRAY). Bipartite: BFS/DFS 2-colour; a same-colour " +
    "neighbour is an odd cycle.",
  yes: [
    "\"Detect a cycle\" in an undirected or directed graph",
    "Course schedule / deadlock / prerequisite graph",
    "\"Is the graph bipartite?\" / \"can you split into two groups with edges only between?\"",
    "Odd-cycle detection, 2-colouring a graph",
    "Redundant connection: the extra edge that closed a cycle",
  ],
  no: [
    "You need the actual set of all cycles &rarr; harder; this page is existence",
    "Directed strong connectivity &rarr; SCC",
    "You only need connectivity, not a cycle &rarr; DFS/DSU",
    "Negative cycle in a weighted graph &rarr; Bellman-Ford, not colour DFS",
  ],
  table: [
    ["Undirected, is there a cycle?", "Back edge not to parent", "DFS with parent, or DSU union fail"],
    ["Directed, is there a cycle?", "Edge to a GRAY node", "3-colour DFS"],
    ["Is the graph bipartite?", "2-colour, conflict = odd cycle", "BFS colour from every unseen"],
    ["Course schedule", "Directed cycle in a prereq graph", "3-colour DFS or Kahn"],
    ["Redundant connection", "First union that fails", "DSU"],
    ["<strong>Confused with:</strong> undirected test on a directed graph",
      "Parent-skip misses directed back edges that are not the parent",
      "Use GRAY/BLACK, not parent"],
  ],
  constraint: "O(n+m), same as DFS. Bipartite colouring must restart from every unseen vertex: " +
    "a disconnected graph can have one bipartite component and one odd cycle elsewhere.",
  core: [
    "Undirected: dfs(u, parent). For each neighbour v, if v is unseen recurse; if v != parent " +
      "you found a cycle. DSU alternative: union every edge, a failed union is a cycle edge.",
    "Directed: colour WHITE=unseen, GRAY=on stack, BLACK=done. Edge to GRAY is a back edge. " +
      "Bipartite: colour[u] in {0,1}, push/rec to v with 1-colour[u]; if v is already coloured " +
      "the same as u, conflict.",
  ],
  invariant: "<p>Undirected: the DFS tree plus a non-parent seen neighbour closes a cycle. " +
    "Directed: GRAY nodes are the active path; a GRAY neighbour is a back edge.</p>" +
    "<span class=\"eq\">bipartite &hArr; 2-colourable &hArr; no odd cycle</span>",
  arrayLabel: "color[u]  (0/1; -1 unseen)",
  array: [0, 1, 0, 1, 1],
  indexLabels: ["0", "1", "2", "3", "4"],
  vars: ["u", "col", "v", "verdict"],
  vizTitle: "2-colour BFS; then an odd-cycle conflict",
  frames: [
    { note: "Start at 0, colour 0. Queue [0].",
      active: [0], dim: [1, 2, 3, 4],
      values: { u: 0, col: 0, v: "\u2014", verdict: "ok" } },
    { note: "Neighbours 1 and 2 get colour 1.",
      active: [1, 2], done: [0],
      values: { u: 0, col: 0, v: "1,2", verdict: "ok" } },
    { note: "From 1, neighbour 3 gets colour 0. Neighbour 2 is already colour 1, different from 1's colour 1? 1 is colour 1, 2 is colour 1 \u2014 SAME. Edge 1-2 is an odd-cycle (triangle 0-1-2).",
      active: [1, 2],
      values: { u: 1, col: 1, v: 2, verdict: "conflict" } },
    { note: "Triangle is odd. Graph is not bipartite. Stop.",
      best: [0, 1, 2],
      values: { u: 1, col: 1, v: 2, verdict: "not bipartite" } },
    { note: "If we deleted 1-2, colours 0,1,0,1,0 would work: 3 and 4 opposite their parents.",
      done: [0, 1, 2, 3, 4],
      values: { u: "alt", col: "2-col", v: "no 1-2", verdict: "bipartite" } },
    { note: "Directed cycle uses GRAY, not 2-colour: a prereq graph can be a DAG (bipartite even) or have a directed cycle (not a DAG).",
      values: { u: "dir", col: "GRAY", v: "back", verdict: "cycle" } },
  ],
  merTitle: "Triangle 0-1-2 is an odd cycle",
  mermaid: `graph TD
  n0["0 col=0"] --- n1["1 col=1"]
  n0 --- n2["2 col=1"]
  n1 --- n2
  n1 --- n3["3"]
  n2 --- n4["4"]
  n1 -.-> n2`,
  steps: [
    "<strong>Undirected cycle:</strong> dfs(u, p); seen neighbour v!=p &rarr; cycle. Or DSU fail.",
    "<strong>Directed cycle:</strong> WHITE/GRAY/BLACK; edge to GRAY &rarr; cycle.",
    "<strong>Bipartite:</strong> colour unseen as 0, BFS/DFS flip bits.",
    "<strong>Conflict:</strong> neighbour already has your colour.",
    "<strong>Restart</strong> from every unseen vertex (disconnected graphs).",
    "<strong>Do not</strong> use parent-skip as a directed cycle test.",
  ],
  code: [
    { tab: "Brute", file: "DsuCycle.java",
      code: `public class DsuCycle {
    static int[] p;
    static int find(int x) { return p[x] == x ? x : (p[x] = find(p[x])); }
    static boolean undirectedCycle(int n, int[][] e) {
        p = new int[n];
        for (int i = 0; i < n; i++) p[i] = i;
        for (int[] x : e) {
            int a = find(x[0]), b = find(x[1]);
            if (a == b) return true;
            p[a] = b;
        }
        return false;
    }
    public static void main(String[] args) {
        System.out.println(undirectedCycle(5, new int[][]{{0,1},{0,2},{1,2},{1,3},{2,4}}));
        System.out.println(undirectedCycle(4, new int[][]{{0,1},{1,2},{2,3}}));
    }
    // Input : triangle graph; then a path of 4
    // Output: true
    //         false
}` },
    { tab: "Optimal", file: "Bipartite.java",
      code: `import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Bipartite {
    static boolean isBipartite(List<List<Integer>> g) {
        int n = g.size();
        int[] col = new int[n];
        Arrays.fill(col, -1);
        ArrayDeque<Integer> q = new ArrayDeque<>();
        for (int s = 0; s < n; s++) if (col[s] < 0) {
            col[s] = 0;
            q.add(s);
            while (!q.isEmpty()) {
                int u = q.poll();
                for (int v : g.get(u)) {
                    if (col[v] < 0) { col[v] = col[u] ^ 1; q.add(v); }
                    else if (col[v] == col[u]) return false;
                }
            }
        }
        return true;
    }
    public static void main(String[] args) {
        List<List<Integer>> g = new ArrayList<>();
        for (int i = 0; i < 5; i++) g.add(new ArrayList<>());
        int[][] e = {{0,1},{0,2},{1,2},{1,3},{2,4}};
        for (int[] x : e) { g.get(x[0]).add(x[1]); g.get(x[1]).add(x[0]); }
        System.out.println(isBipartite(g));
    }
    // Input : sample with triangle
    // Output: false
}` },
    { tab: "Template", file: "DirectedCycle.java",
      code: `import java.util.ArrayList;
import java.util.List;

public class DirectedCycle {
    static boolean dfs(int u, List<List<Integer>> g, int[] col) {
        col[u] = 1;
        for (int v : g.get(u)) {
            if (col[v] == 1) return true;
            if (col[v] == 0 && dfs(v, g, col)) return true;
        }
        col[u] = 2;
        return false;
    }
    static boolean hasCycle(List<List<Integer>> g) {
        int[] col = new int[g.size()];
        for (int s = 0; s < g.size(); s++)
            if (col[s] == 0 && dfs(s, g, col)) return true;
        return false;
    }
    public static void main(String[] args) {
        List<List<Integer>> g = new ArrayList<>();
        for (int i = 0; i < 3; i++) g.add(new ArrayList<>());
        g.get(0).add(1); g.get(1).add(2); g.get(2).add(0);
        System.out.println(hasCycle(g));
    }
    // Input : directed 0->1->2->0
    // Output: true
}` },
  ],
  complexity: {
    time: "O(n + m)",
    space: "O(n)",
    derivation: [
      "One walk paints or colours every vertex and inspects every edge a constant number of times.",
      "<span class=\"eq\">T = &Theta;(n + m)</span>",
      "DSU cycle check is O(m \u03b1(n)) and does not give the directed or bipartite answers.",
    ],
    compare: [
      ["Undirected DFS + parent", "O(n+m)", "O(n)", "Existence of a cycle"],
      ["DSU failed union", "O(m \u03b1(n))", "O(n)", "Undirected only, also finds a cycle edge"],
      ["3-colour DFS", "O(n+m)", "O(n)", "Directed cycle / course schedule"],
      ["2-colour BFS", "O(n+m)", "O(n)", "Bipartite / odd cycle"],
    ],
  },
  pitfalls: [
    { title: "Counting the parent as a back edge",
      bug: "Every undirected edge is stored twice, so the parent looks like a cycle.",
      fix: "Pass parent; skip v==parent. For multiple edges u-v-u, treat multiplicity separately." },
    { title: "2-colour from a single source",
      bug: "A far component with an odd cycle is never visited.",
      fix: "Outer loop over unseen vertices, same as components." },
    { title: "GRAY vs BLACK mix-up",
      bug: "Treating BLACK as a cycle in a DAG (cross/forward edges).",
      fix: "Only GRAY is a back edge. BLACK is finished and legal in a DAG." },
    { title: "Bipartite on a directed graph without undirected view",
      bug: "The usual interview bipartite graph is undirected. Directed \"bipartite\" is a different notion.",
      fix: "Unless stated, undirect the edges for 2-colouring." },
    { title: "Returning true on the first component",
      bug: "You find one bipartite piece and skip the rest.",
      fix: "Conflict anywhere fails the whole graph; success requires every component to pass." },
  ],
  variants: [
    ["DSU bipartite", "XOR-to-root: union with w=1, reject if same-root and XOR 0.",
      "if (find(a)==find(b) && (xr[a]^xr[b])==0) odd;", "Online odd-cycle as edges arrive"],
    ["Output the cycle", "On back edge, walk parent[] up to v and collect.",
      "while (u!=v) { cyc.add(u); u=par[u]; }", "Need the vertices, not just existence"],
    ["Kahn as cycle test", "If the topo queue processes fewer than n vertices, a directed cycle remains.",
      "if (seen != n) hasCycle;", "Next page"],
  ],
  followups: [
    ["Why is an odd cycle exactly non-bipartite?",
      "<p>A 2-colouring along a path alternates. Closing a walk of odd length forces a vertex to take both colours. Even cycles 2-colour fine; forests are always bipartite.</p>"],
    ["Can a disconnected graph be bipartite?",
      "<p>Yes iff every component is. Isolated vertices are bipartite. Always restart colouring.</p>"],
    ["Directed cycle vs topological order?",
      "<p>A DAG is a directed graph with no cycle, equivalently one that has a topological order. Kahn and 3-colour DFS both prove it. Next page uses that order for DP.</p>"],
    ["Self-loop?",
      "<p>Undirected or directed, a self-loop is a cycle (and an odd cycle). Handle u==v before parent-skip.</p>"],
  ],
  problems: [
    lc(207, "course-schedule", "Medium", "Directed cycle"),
    lc(785, "is-graph-bipartite", "Medium", "2-colour"),
    lc(886, "possible-bipartition", "Medium", "Dislike edges, 2-colour"),
    lc(684, "redundant-connection", "Medium", "Undirected cycle edge"),
    lc(261, "graph-valid-tree", "Medium", "n-1 edges and no cycle"),
    lc(802, "find-eventual-safe-states", "Medium", "Nodes not on a directed cycle"),
    cf("977E", "Cyclic Components", "Medium", "Component is a single cycle"),
    lc(210, "course-schedule-ii", "Medium", "Topo if no cycle"),
  ],
  recap: [
    "<strong>Undirected cycle:</strong> seen neighbour other than parent (or DSU fail).",
    "<strong>Directed cycle:</strong> edge to GRAY.",
    "<strong>Bipartite:</strong> 2-colour; same-colour neighbour = odd cycle.",
    "<strong>Restart</strong> from every unseen vertex.",
    "<strong>Do not mix</strong> parent-skip with directed GRAY tests.",
  ],
  oneliner: "undirected: v!=parent && seen | directed: col[v]==GRAY | bipartite: col[v]==col[u]",
}),

/* ============================================ 5. topological-sort-and-dag-dp */
pack({
  id: "topological-sort-and-dag-dp",
  difficulty: "Medium",
  readTime: "24 min",
  tagline: "A DAG has a linear order where every edge goes forward; process vertices in that " +
    "order and every DP recurrence becomes a for-loop.",
  tags: ["topo sort", "Kahn", "DAG DP", "P0"],
  prereqs: [
    ["Cycle Detection & Bipartite", "cycle-detection-and-bipartite.html"],
    ["DFS & Components", "dfs-and-components.html"],
  ],
  why: [
    "Dynamic programming on graphs is illegal the moment a cycle exists: a state would depend " +
      "on itself. On a DAG, there is a topological order, and once you have it, " +
      "<code>dp[v] = f(dp of incoming neighbours)</code> is a single pass. Course schedule II, " +
      "longest increasing path in a matrix (implicit DAG of cells), and \"number of ways to " +
      "reach t\" are this pattern.",
    "Two algorithms produce the order: Kahn (queue of indegree-0 vertices) and DFS (add u after " +
      "all outgoing rec calls, then reverse). Kahn also detects cycles: if you pop fewer than n " +
      "vertices, a directed cycle remains. That is why course-schedule and course-schedule-II " +
      "share a skeleton.",
    "The DP step is easy to get wrong by iterating the adjacency list in file order instead of " +
      "topo order. Always build the order first, then relax along it.",
  ],
  insight: "Topo order is a permutation where every edge u&rarr;v has u before v. DP on a DAG " +
    "is \"for u in topo: update neighbours of u\". Kahn builds the order with a queue of " +
    "indegree 0.",
  yes: [
    "Prerequisites / course order / build order / compilation order",
    "Number of ways / shortest / longest path on a directed graph with no cycles (or after you prove it is a DAG)",
    "Implicit DAG: cells in a matrix with strictly increasing values, jobs with time windows",
    "You already know there is no directed cycle and you need a linear pass",
    "Kahn as a cycle test: processed &lt; n means a cycle",
  ],
  no: [
    "The graph may have directed cycles and you need a path anyway &rarr; not a DAG; maybe SCC condensation first",
    "Undirected graphs have no topo order (unless you orient them)",
    "Shortest path with non-negative weights on a general graph &rarr; Dijkstra, no topo needed",
    "You need any spanning order of an undirected tree &rarr; DFS, not Kahn",
  ],
  table: [
    ["Course order / build order", "Edges = prerequisites", "Kahn or DFS topo"],
    ["Longest path in a DAG", "dp[v] = 1+max over in-edges", "Topo then DP"],
    ["Number of paths s to t in a DAG", "dp[v] += dp[u] along edges u->v", "Topo then DP"],
    ["Grid strictly increasing moves", "Implicit DAG on cells", "Memo DFS is DAG-DP"],
    ["General shortest path, cycles ok, w>=0", "Not a DAG problem", "Dijkstra"],
    ["<strong>Confused with:</strong> BFS levels as a topo order",
      "BFS order is a topo order only on some DAGs (unit-weight from unique source)",
      "Kahn / DFS-finish; do not rely on BFS"],
  ],
  constraint: "<code>n, m &le; 2&times;10&#8309;</code>. Kahn is O(n+m). Recursion DFS-topo has " +
    "the usual stack-depth issue. DP values (ways, sums) need long and possibly a mod.",
  core: [
    "Kahn: compute indegree[], queue every vertex with indegree 0. Pop u, append to order, " +
      "decrement indegree of neighbours, enqueue those that hit 0. If order.size() &lt; n, " +
      "there is a cycle and no topo order.",
    "DAG DP: initialise dp[sources], then for u in order, for v in g[u], relax " +
      "dp[v] = combine(dp[v], dp[u], w(u,v)). Because u is before v, dp[u] is already final. " +
      "DFS-memo from a sink is the same recurrence with the call stack as the topo order.",
  ],
  invariant: "<p>Every vertex that enters Kahn's queue has all incoming edges already processed, " +
    "so it is safe to place next.</p>" +
    "<span class=\"eq\">for every edge u &rarr; v: index(u) &lt; index(v) in the order</span>",
  arrayLabel: "indegree as Kahn runs",
  array: [0, 1, 1, 1, 1],
  indexLabels: ["0", "1", "2", "3", "4"],
  vars: ["u", "queue", "order", "indeg"],
  vizTitle: "Kahn on a 5-node DAG 0->1,0->2,1->3,2->3,2->4",
  frames: [
    { note: "Edges 0->1, 0->2, 1->3, 2->3, 2->4. indeg = [0,1,1,2,1]. Queue [0].",
      active: [0],
      values: { u: "init", queue: "[0]", order: "[]", indeg: "[0,1,1,2,1]" } },
    { note: "Pop 0. Order [0]. Decrement 1 and 2 to 0. Queue [1,2].",
      active: [1, 2], done: [0],
      values: { u: 0, queue: "[1, 2]", order: "[0]", indeg: "[0,0,0,2,1]" } },
    { note: "Pop 1. Order [0,1]. Decrement 3 to 1. Queue [2].",
      active: [3], done: [0, 1],
      values: { u: 1, queue: "[2]", order: "[0, 1]", indeg: "[0,0,0,1,1]" } },
    { note: "Pop 2. Order [0,1,2]. Decrement 3 to 0, 4 to 0. Queue [3,4].",
      active: [3, 4], done: [0, 1, 2],
      values: { u: 2, queue: "[3, 4]", order: "[0, 1, 2]", indeg: "[0,0,0,0,0]" } },
    { note: "Pop 3 then 4. Order [0,1,2,3,4] (or 4 before 3). size==n, it is a DAG.",
      done: [0, 1, 2, 3, 4],
      values: { u: 3, queue: "[4]", order: "[0,1,2,3]", indeg: "all 0" } },
    { note: "DP example: ways[0]=1, then along the order ways[v]+=ways[u]. ways[3]=ways[1]+ways[2]=2.",
      best: [3],
      values: { u: "dp", queue: "[]", order: "done", indeg: "ways[3]=2" } },
  ],
  merTitle: "A 5-node DAG",
  mermaid: `graph TD
  n0["0"] --> n1["1"]
  n0 --> n2["2"]
  n1 --> n3["3"]
  n2 --> n3
  n2 --> n4["4"]`,
  steps: [
    "<strong>indeg[v]++</strong> for every edge u->v.",
    "<strong>Queue</strong> all v with indeg 0 (ArrayDeque).",
    "<strong>Pop u</strong>, append to order; for v in g[u], if --indeg[v]==0 offer v.",
    "<strong>If order.size()!=n</strong> there is a directed cycle; abort.",
    "<strong>DP:</strong> for u in order, relax all edges u->v.",
    "<strong>DFS topo:</strong> rec outgoing first, then add u; reverse the list (or addLast while walking sinks).",
  ],
  code: [
    { tab: "Brute", file: "DfsTopo.java",
      code: `import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class DfsTopo {
    static void dfs(int u, List<List<Integer>> g, boolean[] seen, List<Integer> out) {
        seen[u] = true;
        for (int v : g.get(u)) if (!seen[v]) dfs(v, g, seen, out);
        out.add(u);
    }
    public static void main(String[] args) {
        List<List<Integer>> g = new ArrayList<>();
        for (int i = 0; i < 5; i++) g.add(new ArrayList<>());
        int[][] e = {{0,1},{0,2},{1,3},{2,3},{2,4}};
        for (int[] x : e) g.get(x[0]).add(x[1]);
        boolean[] seen = new boolean[5];
        List<Integer> out = new ArrayList<>();
        for (int s = 0; s < 5; s++) if (!seen[s]) dfs(s, g, seen, out);
        Collections.reverse(out);
        System.out.println(out);
    }
    // Input : DAG 0->1,0->2,1->3,2->3,2->4
    // Output: [0, 2, 4, 1, 3]  (one valid order)
}` },
    { tab: "Optimal", file: "Kahn.java",
      code: `import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;

public class Kahn {
    static List<Integer> topo(int n, int[][] edges) {
        List<List<Integer>> g = new ArrayList<>();
        int[] indeg = new int[n];
        for (int i = 0; i < n; i++) g.add(new ArrayList<>());
        for (int[] e : edges) { g.get(e[0]).add(e[1]); indeg[e[1]]++; }
        ArrayDeque<Integer> q = new ArrayDeque<>();
        for (int i = 0; i < n; i++) if (indeg[i] == 0) q.add(i);
        List<Integer> order = new ArrayList<>();
        while (!q.isEmpty()) {
            int u = q.poll();
            order.add(u);
            for (int v : g.get(u)) if (--indeg[v] == 0) q.add(v);
        }
        return order.size() == n ? order : List.of();
    }
    public static void main(String[] args) {
        int[][] e = {{0,1},{0,2},{1,3},{2,3},{2,4}};
        System.out.println(topo(5, e));
        System.out.println(topo(3, new int[][]{{0,1},{1,2},{2,0}}).isEmpty());
    }
    // Input : DAG sample; then a 3-cycle
    // Output: [0, 1, 2, 3, 4]
    //         true
}` },
    { tab: "Template", file: "DagPaths.java",
      code: `import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;

public class DagPaths {
    static long ways(int n, int[][] edges, int s, int t) {
        List<List<Integer>> g = new ArrayList<>();
        int[] indeg = new int[n];
        for (int i = 0; i < n; i++) g.add(new ArrayList<>());
        for (int[] e : edges) { g.get(e[0]).add(e[1]); indeg[e[1]]++; }
        ArrayDeque<Integer> q = new ArrayDeque<>();
        for (int i = 0; i < n; i++) if (indeg[i] == 0) q.add(i);
        int[] order = new int[n];
        int k = 0;
        int[] deg = indeg.clone();
        q.clear();
        for (int i = 0; i < n; i++) if (deg[i] == 0) q.add(i);
        while (!q.isEmpty()) {
            int u = q.poll();
            order[k++] = u;
            for (int v : g.get(u)) if (--deg[v] == 0) q.add(v);
        }
        long[] dp = new long[n];
        dp[s] = 1;
        for (int i = 0; i < k; i++) {
            int u = order[i];
            for (int v : g.get(u)) dp[v] += dp[u];
        }
        return dp[t];
    }
    public static void main(String[] args) {
        int[][] e = {{0,1},{0,2},{1,3},{2,3},{2,4}};
        System.out.println(ways(5, e, 0, 3));
    }
    // Input : DAG, ways 0 to 3
    // Output: 2
}` },
  ],
  complexity: {
    time: "O(n + m)",
    space: "O(n + m)",
    derivation: [
      "Each vertex enters the Kahn queue once; each edge decrements one indegree. DFS-topo is the same O(n+m) with a postorder list.",
      "<span class=\"eq\">T_topo = T_{DAG-DP} = &Theta;(n + m)</span>",
      "Dijkstra on a DAG is overkill: the topo pass already relaxes each edge once, O(n+m) even with arbitrary (including negative) weights.",
    ],
    compare: [
      ["Kahn", "O(n+m)", "O(n)", "Order + cycle test"],
      ["DFS postorder", "O(n+m)", "O(n) stack", "Order; cycle needs GRAY"],
      ["DAG DP after topo", "O(n+m)", "O(n)", "Shortest/longest/ways on a DAG"],
      ["Dijkstra", "O(m log n)", "O(n)", "General non-neg weights, cycles allowed"],
    ],
  },
  pitfalls: [
    { title: "Using the adjacency-file order as topo",
      bug: "dp[v] uses dp[u] before u is processed. Wrong ways / distances.",
      fix: "Build the order first, then DP along it." },
    { title: "Forgetting the cycle check",
      bug: "Kahn returns a partial order; you DP on it and silently drop a strongly-connected bunch.",
      fix: "order.size()==n, else fail / report impossible." },
    { title: "Indegree on undirected edges",
      bug: "You added both directions, indegree never hits 0 on a two-cycle.",
      fix: "Topo is for directed graphs. Orient first." },
    { title: "int overflow of ways",
      bug: "Number of paths is exponential; int wraps.",
      fix: "long, and mod 1e9+7 when the statement asks." },
    { title: "DFS-topo without reverse",
      bug: "Postorder is sinks first; you needed sources first.",
      fix: "Collections.reverse, or addFirst, or DP in reverse postorder." },
  ],
  variants: [
    ["Lexicographically smallest order", "Kahn with a min-heap instead of a queue.",
      "PriorityQueue<Integer> q;", "Unique labels, CF / interview follow-up"],
    ["Longest path in a DAG", "dp[v]=max(dp[u]+w) over incoming, sources 0.",
      "dp[v] = Math.max(dp[v], dp[u]+w);", "Project scheduling"],
    ["Condensation", "SCC collapse turns any digraph into a DAG, then this page applies.",
      "topo on the SCC graph", "Module 08"],
  ],
  followups: [
    ["Is the topological order unique?",
      "<p>Iff at every Kahn step the queue has size 1, i.e. the DAG is a single Hamiltonian path of forced prefixes. Otherwise many orders are legal; any one is enough for DP.</p>"],
    ["Why can DAG-DP handle negative weights?",
      "<p>There is no cycle, so no negative cycle either. Each edge is relaxed once after its tail is final. Bellman-Ford's extra passes exist only to survive cycles.</p>"],
    ["Memo DFS vs Kahn DP?",
      "<p>Equivalent. Memo DFS computes the same recurrence bottom-up via the call stack. Kahn is iterative and cycle-safe. Use memo DFS on implicit DAGs (grid increasing paths) where building the edge list is annoying.</p>"],
    ["Course schedule II if many orders exist?",
      "<p>Return any. If they want the lexicographically smallest, Kahn with a min-heap. If they want all orders, that is backtracking on the DAG (rare, exponential).</p>"],
  ],
  problems: [
    lc(210, "course-schedule-ii", "Medium", "Kahn"),
    lc(207, "course-schedule", "Medium", "Cycle vs DAG"),
    lc(329, "longest-increasing-path-in-a-matrix", "Hard", "Implicit DAG DP"),
    lc(1136, "parallel-courses", "Medium", "Longest path in a DAG = terms"),
    lc(2050, "parallel-courses-iii", "Hard", "DAG DP of finish times"),
    cf("510C", "Fox And Names", "Medium", "Letters DAG from consecutive words"),
    cf("919D", "Substring", "Medium", "DAG DP of letter counts; cycle = -1"),
    lc(444, "sequence-reconstruction", "Medium", "Unique topo order?"),
  ],
  recap: [
    "<strong>Kahn:</strong> queue indegree 0, decrement neighbours.",
    "<strong>size &lt; n</strong> means a directed cycle, no order.",
    "<strong>DP after the order</strong>, never in input order.",
    "<strong>long / mod</strong> for path counts.",
    "<strong>Negative weights are fine</strong> on a DAG; cycles are not.",
  ],
  oneliner: "queue indeg0; pop u, --indeg[v], enqueue 0s; if order.size==n DP along order",
}),

/* ============================================ 6. dijkstra ============== */
pack({
  id: "dijkstra",
  difficulty: "Medium",
  readTime: "24 min",
  tagline: "Non-negative weighted shortest paths: always expand the unsettled vertex with " +
    "smallest dist, and the first time you settle it the distance is final.",
  tags: ["Dijkstra", "heap", "shortest path", "P0"],
  prereqs: [
    ["BFS", "bfs.html"],
    ["Heaps & Priority Queue", "../03-linear-structures/heaps-and-priority-queue.html"],
  ],
  why: [
    "BFS dies the moment edges have different positive weights: a 1-hop of weight 100 can lose " +
      "to a 3-hop of weight 1+1+1. Dijkstra restores the \"expand closest unsettled\" rule by " +
      "replacing the FIFO queue with a min-heap of (dist, vertex). With non-negative weights, " +
      "the first time a vertex becomes the heap minimum, no future relaxation can improve it.",
    "Network delay time, cheapest flights (with a k-stop twist), path-with-minimum-effort, and " +
      "almost every \"weighted maze\" are Dijkstra. It is also the algorithm you must refuse to " +
      "run on negative edges: the proof needs w &ge; 0.",
    "Java's PriorityQueue does not support decrease-key. The standard contest pattern is " +
      "\"push duplicates, skip stale pops\" where dist[u] &lt; popped distance. That is O(m log m), " +
      "fine at m = 2e5.",
  ],
  insight: "Settle vertices in order of increasing shortest-path distance. Non-negative edges " +
    "mean leaving a closer vertex cannot wait for a farther one to help it. Skip heap entries " +
    "whose distance is stale.",
  yes: [
    "Shortest path with non-negative edge weights",
    "Grid with cell costs / effort / time to enter a cell",
    "Network delay: max over dist[v] from a source",
    "\"Minimum cost\" where cost adds along the path and never decreases by taking extra edges of negative weight",
    "Implicit graphs whose edges you generate from a state with a non-negative cost",
  ],
  no: [
    "Unit weights &rarr; BFS, simpler and O(n+m)",
    "Weights only 0 and 1 &rarr; 0-1 BFS",
    "Negative edges, no negative cycle &rarr; Bellman-Ford / potential + Dijkstra (Johnson)",
    "Negative cycle existence &rarr; Bellman-Ford, not this page",
  ],
  table: [
    ["Non-neg weights, one source", "Classic Dijkstra", "Heap of (dist,u), skip stale"],
    ["Unit weights", "Special case w=1", "BFS"],
    ["Weights in {0,1}", "Deque Dijkstra", "0-1 BFS"],
    ["k extra constraints (stops, fuel)", "State = (vertex, extra)", "Dijkstra on the product graph"],
    ["Negative weights", "Proof fails", "Bellman-Ford"],
    ["<strong>Confused with:</strong> Prim",
      "Prim grows an MST by min edge to the tree; Dijkstra grows an SPT by min dist from s",
      "Same heap shape, different key"],
  ],
  constraint: "<code>n, m &le; 2&times;10&#8309;</code>, weights up to 1e9 so dist is long. " +
    "O(m log m) with duplicate-heap. A naive O(n&sup2;) scan of the min unsettled is better " +
    "only when the graph is a dense matrix (n ~ 1000, m ~ n&sup2;).",
  core: [
    "dist[] = INF, dist[s]=0. Heap holds (dist[u], u). Repeat: pop the smallest; if d != " +
      "dist[u] continue (stale). Otherwise u is settled. For each edge u->v,w, if " +
      "dist[u]+w &lt; dist[v], write dist[v] and push (dist[v], v).",
    "INF must be larger than n * max_w (use 4e18). Never relax from a stale pop: that would " +
      "re-expand a settled vertex and can explode the heap. Parent[] reconstructs the path.",
  ],
  invariant: "<p>When u is first popped with d==dist[u], dist[u] equals the true shortest-path " +
    "distance from s. All remaining heap keys are &ge; dist[u].</p>" +
    "<span class=\"eq\">w &ge; 0  &rArr;  settled set grows by true &delta;(s, u)</span>",
  arrayLabel: "dist[u] as vertices settle",
  array: [0, 4, 2, 5, 9],
  indexLabels: ["0", "1", "2", "3", "4"],
  vars: ["u", "d", "relax", "heap"],
  vizTitle: "Dijkstra from 0: edges 0-1:4, 0-2:2, 2-1:1, 1-3:1, 2-4:7",
  frames: [
    { note: "dist[0]=0, heap [(0,0)]. Others INF.",
      active: [0], dim: [1, 2, 3, 4],
      values: { u: 0, d: 0, relax: "start", heap: "[(0,0)]" } },
    { note: "Settle 0. Relax 0->1 dist=4, 0->2 dist=2. Heap [(2,2),(4,1)].",
      active: [1, 2], done: [0],
      values: { u: 0, d: 0, relax: "1=4, 2=2", heap: "[(2,2),(4,1)]" } },
    { note: "Pop (2,2), settle 2. Relax 2->1 to 3 (improves 4), 2->4 to 9.",
      active: [1, 4], done: [0, 2],
      values: { u: 2, d: 2, relax: "1=3, 4=9", heap: "[(3,1),(4,1),(9,4)]" } },
    { note: "Pop (3,1), settle 1. Stale (4,1) will be skipped later. Relax 1->3 to 4.",
      active: [3], done: [0, 1, 2],
      values: { u: 1, d: 3, relax: "3=4", heap: "[(4,1 stale),(4,3),(9,4)]" } },
    { note: "Skip stale (4,1). Pop (4,3), settle 3.",
      done: [0, 1, 2, 3],
      values: { u: 3, d: 4, relax: "\u2014", heap: "[(9,4)]" } },
    { note: "Settle 4 at 9. dist = [0,3,2,4,9]. First settlement was final because all w>=0.",
      best: [0, 1, 2, 3, 4],
      values: { u: 4, d: 9, relax: "done", heap: "[]" } },
  ],
  merTitle: "Weighted 5-node graph",
  mermaid: `graph TD
  n0["0"] -->|"4"| n1["1"]
  n0 -->|"2"| n2["2"]
  n2 -->|"1"| n1
  n1 -->|"1"| n3["3"]
  n2 -->|"7"| n4["4"]`,
  steps: [
    "<strong>dist = INF</strong> (long), dist[s]=0. PriorityQueue of long[]{d,u} by d.",
    "<strong>Pop (d,u)</strong>. If d != dist[u], stale &mdash; continue.",
    "<strong>For each edge</strong> u->v of weight w: nd = d+w; if nd &lt; dist[v], dist[v]=nd, offer {nd,v}.",
    "<strong>Stop</strong> when the heap is empty, or when you settle t if you only need s-t.",
    "<strong>Unreachable</strong> stays INF; do not add INF+w (overflow).",
    "<strong>Refuse negative w</strong>; the skip-stale proof needs w>=0.",
  ],
  code: [
    { tab: "Brute", file: "DenseDijkstra.java",
      code: `import java.util.Arrays;
public class DenseDijkstra {
    static long[] dijkstra(int[][] w, int s) {
        int n = w.length;
        long[] dist = new long[n];
        boolean[] used = new boolean[n];
        Arrays.fill(dist, Long.MAX_VALUE / 4);
        dist[s] = 0;
        for (int it = 0; it < n; it++) {
            int u = -1;
            for (int i = 0; i < n; i++)
                if (!used[i] && (u < 0 || dist[i] < dist[u])) u = i;
            if (u < 0 || dist[u] >= Long.MAX_VALUE / 4) break;
            used[u] = true;
            for (int v = 0; v < n; v++)
                if (w[u][v] < Integer.MAX_VALUE / 4)
                    dist[v] = Math.min(dist[v], dist[u] + w[u][v]);
        }
        return dist;
    }
    public static void main(String[] args) {
        int INF = Integer.MAX_VALUE / 4;
        int[][] w = new int[5][5];
        for (int[] row : w) Arrays.fill(row, INF);
        w[0][1] = 4; w[0][2] = 2; w[2][1] = 1; w[1][3] = 1; w[2][4] = 7;
        System.out.println(java.util.Arrays.toString(dijkstra(w, 0)));
    }
    // Input : dense matrix of the sample
    // Output: [0, 3, 2, 4, 9]
}` },
    { tab: "Optimal", file: "Dijkstra.java",
      code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.PriorityQueue;

public class Dijkstra {
    static long[] dijkstra(List<List<int[]>> g, int s) {
        int n = g.size();
        long[] dist = new long[n];
        Arrays.fill(dist, Long.MAX_VALUE / 4);
        PriorityQueue<long[]> pq = new PriorityQueue<>(Comparator.comparingLong(a -> a[0]));
        dist[s] = 0;
        pq.add(new long[] {0, s});
        while (!pq.isEmpty()) {
            long[] cur = pq.poll();
            int u = (int) cur[1];
            long d = cur[0];
            if (d != dist[u]) continue;
            for (int[] e : g.get(u)) {
                int v = e[0], w = e[1];
                if (d + w < dist[v]) {
                    dist[v] = d + w;
                    pq.add(new long[] {dist[v], v});
                }
            }
        }
        return dist;
    }
    public static void main(String[] args) {
        List<List<int[]>> g = new ArrayList<>();
        for (int i = 0; i < 5; i++) g.add(new ArrayList<>());
        int[][] e = {{0,1,4},{0,2,2},{2,1,1},{1,3,1},{2,4,7}};
        for (int[] x : e) g.get(x[0]).add(new int[] {x[1], x[2]});
        System.out.println(Arrays.toString(dijkstra(g, 0)));
    }
    // Input : directed sample, source 0
    // Output: [0, 3, 2, 4, 9]
}` },
    { tab: "Template", file: "DijkstraUndirected.java",
      code: `import java.util.*;
public class DijkstraUndirected {
    static long to(List<List<int[]>> g, int s, int t) {
        int n = g.size();
        long[] dist = new long[n];
        Arrays.fill(dist, Long.MAX_VALUE / 4);
        PriorityQueue<long[]> pq = new PriorityQueue<>(Comparator.comparingLong(a -> a[0]));
        dist[s] = 0;
        pq.add(new long[]{0, s});
        while (!pq.isEmpty()) {
            long[] cur = pq.poll();
            int u = (int) cur[1];
            long d = cur[0];
            if (d != dist[u]) continue;
            if (u == t) return d;
            for (int[] e : g.get(u)) {
                int v = e[0], w = e[1];
                if (d + w < dist[v]) {
                    dist[v] = d + w;
                    pq.add(new long[]{dist[v], v});
                }
            }
        }
        return -1;
    }
    public static void main(String[] args) {
        List<List<int[]>> g = new ArrayList<>();
        for (int i = 0; i < 5; i++) g.add(new ArrayList<>());
        int[][] e = {{0,1,4},{0,2,2},{2,1,1},{1,3,1},{2,4,7}};
        for (int[] x : e) {
            g.get(x[0]).add(new int[]{x[1], x[2]});
            g.get(x[1]).add(new int[]{x[0], x[2]});
        }
        System.out.println(to(g, 0, 4));
    }
    // Input : undirected sample, 0 to 4
    // Output: 9
}` },
  ],
  complexity: {
    time: "O((n + m) log m) with a binary heap of duplicates",
    space: "O(n + m)",
    derivation: [
      "Each edge can push at most one new heap node (when it improves dist[v]). At most m heap entries, each pop/push is O(log m).",
      "<span class=\"eq\">T = O(m log m), S = O(n + m)</span>",
      "Fibonacci-heap Dijkstra is O(m + n log n) and nobody implements it in an interview. Dense O(n&sup2;) is the right call for a matrix.",
    ],
    compare: [
      ["BFS", "O(n+m)", "O(n)", "Unit weights"],
      ["0-1 BFS", "O(n+m)", "O(n)", "Weights in {0,1}"],
      ["Heap Dijkstra", "O(m log m)", "O(n+m)", "Non-negative weights, sparse"],
      ["Dense Dijkstra", "O(n\u00b2)", "O(n\u00b2)", "n<=1000 matrix"],
    ],
  },
  pitfalls: [
    { title: "int overflow of dist",
      bug: "INF = Integer.MAX_VALUE then INF+w wraps negative and \"improves\" everything.",
      fix: "long dist, INF = Long.MAX_VALUE/4." },
    { title: "Not skipping stale pops",
      bug: "You re-expand u with an old d, pushing even more garbage.",
      fix: "<code>if (d != dist[u]) continue;</code> immediately after pop." },
    { title: "Negative weights",
      bug: "A later cheaper path through a negative edge never gets a chance; answer is too large, or the loop never settles.",
      fix: "Bellman-Ford. Dijkstra's proof needs w>=0." },
    { title: "Using TreeSet of vertices without updating",
      bug: "Java TreeSet of (d,u) needs remove-old then add-new; easy to forget the remove.",
      fix: "Duplicate-heap is simpler. TreeSet decrease-key is optional." },
    { title: "Undirected input stored one way",
      bug: "Shortest path cannot walk backwards.",
      fix: "Insert both directions with the same weight unless the statement is directed." },
  ],
  variants: [
    ["k-shortest / k stops", "State (u, usedStops) or stop when visits exceed k+1.",
      "dist[u][k], pq on (d,u,k)", "Cheapest flights within k stops"],
    ["0-1 Dijkstra", "Deque instead of heap.",
      "addFirst if w==0", "Next page"],
    ["Potentials (Johnson)", "h[u] from Bellman-Ford, reweight w'=w+h[u]-h[v] >= 0, then Dijkstra.",
      "wPrime = w + h[u] - h[v];", "All-pairs with negatives, no neg cycle"],
  ],
  followups: [
    ["Why non-negative is required?",
      "<p>The settled vertex u is the closest unsettled. If some edge later had negative weight, a not-yet-settled vertex could jump in front of u after we already froze dist[u]. The heap order would lie.</p>"],
    ["Dijkstra vs Prim?",
      "<p>Same mechanical loop, different key. Dijkstra: key = dist from s. Prim: key = min edge weight to the tree. Mixing them is a common interview slip when you have just implemented one.</p>"],
    ["Early exit?",
      "<p>If you only need dist[t], return when you settle t. The heap may still hold other vertices; that is fine. All-destinations must empty the heap.</p>"],
    ["How do you print the path?",
      "<p>parent[v]=u on a successful relaxation. Walk t back to s. If several equal distances, the first relaxation (or a &lt;= vs &lt; policy) picks one shortest path.</p>"],
  ],
  problems: [
    lc(743, "network-delay-time", "Medium", "Dijkstra, answer = max dist"),
    lc(1631, "path-with-minimum-effort", "Medium", "Dijkstra on effort, or BS+BFS"),
    lc(1514, "path-with-maximum-probability", "Medium", "Max-heap of probability"),
    lc(787, "cheapest-flights-within-k-stops", "Medium", "State Dijkstra or k-Bellman"),
    lc(1368, "minimum-cost-to-make-at-least-one-valid-path", "Hard", "0-1 BFS actually"),
    cf("20C", "Dijkstra?", "Medium", "Classic, print the path"),
    cf("1473E", "Minimum Path", "Hard", "Dijkstra with 0/2 extra states"),
    lc(778, "swim-in-rising-water", "Hard", "Dijkstra / BS+BFS on time"),
  ],
  recap: [
    "<strong>Min-heap of (dist, u)</strong>, skip stale pops.",
    "<strong>Settle once:</strong> first fresh pop is final iff w>=0.",
    "<strong>long INF</strong>, never MAX_VALUE + w.",
    "<strong>Unit weights &rarr; BFS;</strong> {0,1} &rarr; 0-1 BFS.",
    "<strong>Not Prim</strong> &mdash; different key.",
  ],
  oneliner: "pq (d,u); pop; if d!=dist[u] continue; relax nd=d+w, push if better",
}),

/* ============================================ 7. zero-one-bfs ========== */
pack({
  id: "zero-one-bfs",
  difficulty: "Medium",
  readTime: "22 min",
  tagline: "When every edge weight is 0 or 1, a deque simulates Dijkstra in <code>O(n + m)</code>: " +
    "0-edges to the front, 1-edges to the back.",
  tags: ["0-1 BFS", "deque", "shortest path", "P1"],
  prereqs: [
    ["BFS", "bfs.html"],
    ["Dijkstra", "dijkstra.html"],
  ],
  why: [
    "Dijkstra's heap is paying a log to order vertices by distance. If the only weights are 0 " +
      "and 1, the new distance is either d or d+1, so the frontier is two consecutive layers. " +
      "A deque maintains that: append-front the 0-relaxations (same layer) and append-back the " +
      "1-relaxations (next layer). The structure stays sorted without a heap.",
    "This shows up as \"move for free in this direction, cost 1 to change direction\", \"break " +
      "a wall or not\", \"0-cost edges plus unit edges\", and several Codeforces labyrinths. " +
      "Using a heap still works but is slower and hides the idea.",
    "The correctness is Dijkstra's: you still expand in non-decreasing distance. The 0-edge is " +
      "the decrease-key that BFS cannot do (BFS would skip a second visit). You may relax a " +
      "vertex twice: once via a 1-edge, then improve via a 0-edge. Marking on first push is " +
      "therefore wrong; compare distances like Dijkstra.",
  ],
  insight: "0-weight goes to the front of the deque (same dist), 1-weight to the back (dist+1). " +
    "The deque stays sorted, so you get Dijkstra in linear time. Allow a second visit when the " +
    "distance improves.",
  yes: [
    "Every edge weight is in {0, 1}",
    "Grid: moving one way is free, turning or breaking a wall costs 1",
    "Graph with 0-cost \"portals\" plus unit steps",
    "Constraints n,m = 1e6 where m log n Dijkstra might scrape the limit",
    "\"Minimum walls to break to reach the exit\" (0 = empty, 1 = wall)",
  ],
  no: [
    "Weights in {0,1,2} or arbitrary &rarr; Dijkstra (or Dial if small integers)",
    "All weights 1 &rarr; ordinary BFS, mark on push",
    "Negative weights &rarr; Bellman-Ford",
    "You need a heap for a second key (probability, lexicographic) &rarr; Dijkstra",
  ],
  table: [
    ["w in {0,1}", "Deque Dijkstra", "0 to front, 1 to back"],
    ["All w=1", "Ordinary BFS", "Mark on push, FIFO"],
    ["Break k walls", "State (cell, broken) or 0-1 on wall edges", "0-1 BFS or BFS on layers"],
    ["Arbitrary non-neg", "Need a heap", "Dijkstra"],
    ["Small integer weights 0..K", "Dial's buckets", "Array of deques"],
    ["<strong>Confused with:</strong> mark-on-push BFS",
      "A later 0-edge can improve a vertex already queued at dist+1",
      "Relax like Dijkstra; allow improved second push"],
  ],
  constraint: "<code>n, m &le; 10&#8310;</code> is comfortable: O(n+m). dist is int (or long if " +
    "you add other costs). Each vertex is pushed at most twice in the 0-1 case (once per " +
    "possible dist parity of improvement), still linear.",
  core: [
    "dist=INF, dist[s]=0, deque holds vertices (not pairs, if you skip stale). Pop front u. " +
      "For each edge u->v of weight w in {0,1}: nd=dist[u]+w; if nd &lt; dist[v], dist[v]=nd, " +
      "then addFirst(v) if w==0 else addLast(v).",
    "Still skip stale: if you store (d,u) in the deque, ignore pops with d!=dist[u]. Do not " +
      "mark visited on first push. Ordinary BFS is the special case with no 0-edges.",
  ],
  invariant: "<p>The deque holds vertices with two consecutive distances d and d+1, the d's " +
    "in front. Expanding front therefore expands in non-decreasing order, as Dijkstra requires.</p>" +
    "<span class=\"eq\">w=0 &rarr; addFirst (dist stays); w=1 &rarr; addLast (dist+1)</span>",
  arrayLabel: "dist[u] during 0-1 BFS from 0",
  array: [0, 1, 0, 1, 1],
  indexLabels: ["0", "1", "2", "3", "4"],
  vars: ["u", "w", "nd", "deque"],
  vizTitle: "0-edges 0-2 and 2-1; 1-edges 0-1, 1-3, 2-4",
  frames: [
    { note: "Start: dist[0]=0, deque [0].",
      active: [0], dim: [1, 2, 3, 4],
      values: { u: 0, w: "\u2014", nd: 0, deque: "[0]" } },
    { note: "From 0: 0-edge to 2, nd=0, addFirst. 1-edge to 1, nd=1, addLast. deque [2,1].",
      active: [1, 2], done: [0],
      values: { u: 0, w: "0 then 1", nd: "2@0, 1@1", deque: "[2, 1]" } },
    { note: "Pop 2 (dist 0). 0-edge 2-1 improves 1 from 1 to 0, addFirst. 1-edge to 4 at dist 1, addLast.",
      active: [1, 4], done: [0, 2],
      values: { u: 2, w: "0 to 1", nd: "1 improved to 0", deque: "[1, 1stale, 4]" } },
    { note: "Pop 1 at dist 0 (the improved copy). Relax 1-3 at dist 1. Skip stale 1 later.",
      active: [3], done: [0, 1, 2],
      values: { u: 1, w: 1, nd: 1, deque: "[stale1, 4, 3]" } },
    { note: "Skip stale. Pop 4 dist 1, pop 3 dist 1.",
      done: [0, 1, 2, 3, 4],
      values: { u: 4, w: "\u2014", nd: 1, deque: "[3]" } },
    { note: "Final dist [0,0,0,1,1]. Vertex 1 was reached twice; the 0-edge was the improvement BFS would have missed.",
      best: [0, 1, 2],
      values: { u: "done", w: "\u2014", nd: "\u2014", deque: "[]" } },
  ],
  merTitle: "Mixed 0/1 weights on five nodes",
  mermaid: `graph TD
  n0["0"] -->|"1"| n1["1"]
  n0 -->|"0"| n2["2"]
  n2 -->|"0"| n1
  n1 -->|"1"| n3["3"]
  n2 -->|"1"| n4["4"]`,
  steps: [
    "<strong>dist = INF</strong>, dist[s]=0, ArrayDeque, add s.",
    "<strong>Pop first</strong> (smallest remaining dist).",
    "<strong>If stale</strong> (stored d != dist[u]) continue.",
    "<strong>w==0:</strong> if improves, dist[v]=nd, addFirst(v).",
    "<strong>w==1:</strong> if improves, dist[v]=nd, addLast(v).",
    "<strong>Do not</strong> mark visited on first discovery.",
  ],
  code: [
    { tab: "Brute", file: "HeapOnZeroOne.java",
      code: `import java.util.*;
public class HeapOnZeroOne {
    static int[] dijkstra(List<List<int[]>> g, int s) {
        int n = g.size();
        int[] dist = new int[n];
        Arrays.fill(dist, Integer.MAX_VALUE / 4);
        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));
        dist[s] = 0;
        pq.add(new int[]{0, s});
        while (!pq.isEmpty()) {
            int[] cur = pq.poll();
            if (cur[0] != dist[cur[1]]) continue;
            for (int[] e : g.get(cur[1])) {
                int nd = cur[0] + e[1];
                if (nd < dist[e[0]]) { dist[e[0]] = nd; pq.add(new int[]{nd, e[0]}); }
            }
        }
        return dist;
    }
    public static void main(String[] args) {
        List<List<int[]>> g = Graph.sample();
        System.out.println(Arrays.toString(dijkstra(g, 0)));
    }
    // Input : 0-1 sample
    // Output: [0, 0, 0, 1, 1]
    static class Graph {
        static List<List<int[]>> sample() {
            List<List<int[]>> g = new ArrayList<>();
            for (int i = 0; i < 5; i++) g.add(new ArrayList<>());
            int[][] e = {{0,1,1},{0,2,0},{2,1,0},{1,3,1},{2,4,1}};
            for (int[] x : e) g.get(x[0]).add(new int[]{x[1], x[2]});
            return g;
        }
    }
}` },
    { tab: "Optimal", file: "ZeroOneBfs.java",
      code: `import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class ZeroOneBfs {
    static int[] bfs01(List<List<int[]>> g, int s) {
        int n = g.size();
        int[] dist = new int[n];
        Arrays.fill(dist, Integer.MAX_VALUE / 4);
        ArrayDeque<Integer> q = new ArrayDeque<>();
        dist[s] = 0;
        q.add(s);
        while (!q.isEmpty()) {
            int u = q.pollFirst();
            for (int[] e : g.get(u)) {
                int v = e[0], w = e[1];
                int nd = dist[u] + w;
                if (nd < dist[v]) {
                    dist[v] = nd;
                    if (w == 0) q.addFirst(v);
                    else q.addLast(v);
                }
            }
        }
        return dist;
    }
    public static void main(String[] args) {
        List<List<int[]>> g = new ArrayList<>();
        for (int i = 0; i < 5; i++) g.add(new ArrayList<>());
        int[][] e = {{0,1,1},{0,2,0},{2,1,0},{1,3,1},{2,4,1}};
        for (int[] x : e) g.get(x[0]).add(new int[]{x[1], x[2]});
        System.out.println(Arrays.toString(bfs01(g, 0)));
    }
    // Input : 0-edges 0-2,2-1; 1-edges 0-1,1-3,2-4
    // Output: [0, 0, 0, 1, 1]
}` },
    { tab: "Template", file: "WallGrid01.java",
      code: `import java.util.ArrayDeque;
import java.util.Arrays;

public class WallGrid01 {
    static final int[] DR = {-1,1,0,0}, DC = {0,0,-1,1};
    static int minWalls(char[][] g) {
        int R = g.length, C = g[0].length;
        int[][] dist = new int[R][C];
        for (int[] row : dist) Arrays.fill(row, Integer.MAX_VALUE / 4);
        ArrayDeque<int[]> q = new ArrayDeque<>();
        dist[0][0] = 0;
        q.add(new int[]{0, 0});
        while (!q.isEmpty()) {
            int[] u = q.pollFirst();
            int r = u[0], c = u[1];
            for (int k = 0; k < 4; k++) {
                int nr = r + DR[k], nc = c + DC[k];
                if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;
                int w = g[nr][nc] == '#' ? 1 : 0;
                int nd = dist[r][c] + w;
                if (nd < dist[nr][nc]) {
                    dist[nr][nc] = nd;
                    if (w == 0) q.addFirst(new int[]{nr, nc});
                    else q.addLast(new int[]{nr, nc});
                }
            }
        }
        return dist[R - 1][C - 1];
    }
    public static void main(String[] args) {
        char[][] g = {".#.".toCharArray(), "..#".toCharArray(), "#..".toCharArray()};
        System.out.println(minWalls(g));
    }
    // Input : 3x3 maze, '#' is a wall that costs 1 to break
    // Output: 0
}` },
  ],
  complexity: {
    time: "O(n + m)",
    space: "O(n)",
    derivation: [
      "Each successful relaxation pushes a vertex. In 0-1 BFS each vertex's distance is a non-negative integer and only decreases, and it can take at most two useful values before settling in practice; the standard proof is that the deque stays sorted by dist, each edge is processed a constant number of times, total linear.",
      "<span class=\"eq\">T = O(n + m)</span> versus Dijkstra's O(m log m).",
      "If you mark on first push you miss 0-edge improvements and the algorithm becomes wrong, not just slower.",
    ],
    compare: [
      ["BFS (all w=1)", "O(n+m)", "O(n)", "Mark on push"],
      ["0-1 BFS", "O(n+m)", "O(n)", "w in {0,1}, relax like Dijkstra"],
      ["Dial (w=0..K)", "O(nK + m)", "O(n+K)", "Bucket queue"],
      ["Heap Dijkstra", "O(m log m)", "O(n+m)", "General non-neg weights"],
    ],
  },
  pitfalls: [
    { title: "Marking visited on first discovery",
      bug: "A 0-edge later would have improved dist; you refuse the second push. Wrong answer.",
      fix: "Only skip if nd >= dist[v]. Same as Dijkstra." },
    { title: "addFirst / addLast swapped",
      bug: "1-edges go to the front, order is no longer sorted, you expand a farther vertex first.",
      fix: "0 = addFirst, 1 = addLast. Always." },
    { title: "Using this for weight 2",
      bug: "A +2 jump can overtake and the two-layer invariant dies.",
      fix: "Dijkstra, or Dial with more buckets." },
    { title: "pollLast instead of pollFirst",
      bug: "You built a stack. Distances are not monotone.",
      fix: "pollFirst / pop from the front, like a queue that you also unshift." },
    { title: "INT overflow INF+1",
      bug: "Integer.MAX_VALUE + 1 is negative, \"improves\" everything.",
      fix: "INF = MAX/4, same as Dijkstra." },
  ],
  variants: [
    ["Dial's algorithm", "Weights 0..K: array of deques, cursor at current dist.",
      "buckets[nd].add(v);", "K up to a few thousand"],
    ["0-K on a grid", "Breaking a wall costs 1, empty 0 &mdash; this page.",
      "w = cell==WALL ? 1 : 0;", "CF labyrinths, LC 1368"],
    ["Product with a tiny extra state", "Still 0-1 if the extra step costs 0 or 1.",
      "state = u * (k+1) + used;", "Direction-change costs"],
  ],
  followups: [
    ["Why can a vertex be pushed twice?",
      "<p>First via a 1-edge at dist d+1, then via a 0-path at dist d. The second is a real improvement. BFS forbids this; 0-1 BFS must allow it.</p>"],
    ["Is 0-1 BFS just Dijkstra?",
      "<p>Yes, with a deque as a specialised heap for two consecutive keys. Saying that sentence is the interview-level understanding.</p>"],
    ["LC 1368 \u2014 why 0-1?",
      "<p>Following the arrow already painted in the cell costs 0; changing the arrow (or walking against it) costs 1. That is exactly 0-1 BFS on the grid graph.</p>"],
    ["What if weights are 1 and 2?",
      "<p>Not 0-1. You can still Dial with K=2, or just Dijkstra. The two-layer deque invariant needs a 0 to sit on the current layer.</p>"],
  ],
  problems: [
    lc(1368, "minimum-cost-to-make-at-least-one-valid-path", "Hard", "0-1 BFS on a grid"),
    lc(2290, "minimum-obstacle-removal-to-reach-corner", "Hard", "0-1: empty 0, obstacle 1"),
    lc(1293, "shortest-path-in-a-grid-with-obstacles-elimination", "Hard", "BFS on (r,c,k); related"),
    cf("1063B", "Labyrinth", "Medium", "Limited left/right, 0-1 / deque"),
    cf("1473E", "Minimum Path", "Hard", "0/2 extras; Dijkstra, same family"),
    cf("590C", "Three States", "Medium", "Multi-source 0-1 on a grid"),
    lc(864, "shortest-path-to-get-all-keys", "Hard", "BFS on state, unit; contrast"),
    cf("173B", "Chamber of Secrets", "Medium", "0-1 BFS on rows/cols"),
  ],
  recap: [
    "<strong>0 to the front, 1 to the back</strong> of an ArrayDeque.",
    "<strong>Relax like Dijkstra</strong>; a later 0-edge may improve a queued vertex.",
    "<strong>Linear time</strong> vs heap Dijkstra.",
    "<strong>Not ordinary BFS</strong> &mdash; do not mark on first push.",
    "<strong>Only {0,1}</strong>; anything else is Dijkstra or Dial.",
  ],
  oneliner: "if (w==0) q.addFirst(v); else q.addLast(v);  // only when nd < dist[v]",
}),

];

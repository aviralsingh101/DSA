/* Module 07 — Graphs: Core */

export const topics = [

/* ============================================ 1. graph-representations == */
{
  id: "graph-representations",
  difficulty: "Easy",
  readTime: "22 min",
  tagline: "Pick the encoding before you pick the algorithm &mdash; adjacency list, matrix and " +
    "edge list are not interchangeable, and the wrong one turns an <code>O(n + m)</code> walk " +
    "into an <code>O(n&sup2;)</code> timeout.",
  tags: ["graphs", "adjacency list", "adjacency matrix", "P0"],
  prereqs: [
    ["Complexity Analysis", "../00-foundations/complexity-analysis.html"],
    ["Java for DSA", "../00-foundations/java-for-dsa.html"],
  ],

  why: {
    paras: [
      "Every graph algorithm is written against an encoding, not against a picture. The same " +
      "four-node drawing becomes a list of neighbour arrays, an <code>n &times; n</code> " +
      "boolean matrix, or a flat list of edges, and each of those answers a different question " +
      "in constant time. Choosing the encoding is therefore the first algorithmic decision, not " +
      "a bookkeeping detail you sort out after the idea is clear.",
      "Interviews and contests punish the wrong choice immediately. Iterating neighbours of " +
      "<code>u</code> is <code>O(deg(u))</code> on a list and <code>O(n)</code> on a matrix. " +
      "Testing whether <code>(u, v)</code> exists is the opposite. On " +
      "<code>n = 10&#8309;</code>, <code>m = 10&#8309;</code> a matrix is a memory error before " +
      "it is a timeout; on <code>n = 400</code> a matrix is the faster, simpler structure. The " +
      "constraint line tells you which world you are in.",
      "A second, quieter reason this page exists: off-by-one indexing, forgotten reverse edges, " +
      "and mixing 0-based code with 1-based input account for more wrong answers on easy graph " +
      "problems than the algorithms themselves. Get the encoding mechanical, then BFS and DFS " +
      "are twenty lines.",
    ],
    insight: "An adjacency list is the default because most graphs you meet are sparse " +
      "(<code>m = O(n)</code> or <code>O(n log n)</code>). Reach for a matrix only when " +
      "<code>n</code> is a few hundred <em>and</em> you need <code>O(1)</code> edge tests or " +
      "dense all-pairs work.",
  },

  recognise: {
    yes: [
      "The input is <code>n</code> and a list of <code>m</code> pairs <code>(u, v)</code>, " +
        "possibly with a weight",
      "You will iterate every neighbour of a vertex many times (BFS, DFS, Dijkstra)",
      "You need a constant-time \"is this edge present?\" test (Floyd-Warshall, some DP)",
      "The graph is undirected and you must add both directions yourself",
      "Nodes arrive 1-indexed from the judge and your arrays are 0-indexed",
    ],
    no: [
      "The \"graph\" is an implicit grid and moves are <code>(dr, dc)</code> &mdash; do not " +
        "materialise <code>n&sup2;</code> adjacency lists",
      "You only need to sort the edges once (Kruskal) &mdash; keep an edge list, skip the " +
        "adjacency structure",
      "The structure is a tree given as parent pointers &mdash; that already is the encoding",
      "You need range queries on a path &mdash; that is a " +
        "<a href=\"../09-decompositions/heavy-light-decomposition.html\">decomposition</a>, " +
        "not a representation choice",
    ],
    table: [
      ["Iterate all neighbours of u", "Most graph algorithms", "Adjacency list"],
      ["Test whether (u, v) exists in O(1)", "Dense DP, Floyd-Warshall, some matching", "Adjacency matrix"],
      ["Sort edges by weight once", "Kruskal, some offline queries", "Edge list"],
      ["Undirected input, pair (u, v)", "Must store both directions", "list: add twice; matrix: set two cells"],
      ["Weighted edges", "Dijkstra, 0-1 BFS, Bellman-Ford", "Store (v, w) pairs, not bare ints"],
      ["Grid / maze with 4- or 8-neighbour moves", "Implicit graph", "On-the-fly neighbours, no adj list"],
      ["n &le; 400 and m is huge", "Dense graph", "Matrix is smaller and faster"],
      ["<strong>Confused with:</strong> \"I built a list, so edge tests are free\"",
        "Membership on a list is O(deg), not O(1)",
        "Keep a matrix, a HashSet of pairs, or accept the scan"],
    ],
    constraint: "<code>n, m &le; 2&times;10&#8309;</code> forces lists " +
      "(<code>n&sup2;</code> memory dies). <code>n &le; 400</code> is the matrix signature. " +
      "Always store vertices as <code>int</code> and weights as <code>int</code> or " +
      "<code>long</code> if sums of weights can overflow.",
  },

  core: {
    heading: "Three encodings and when each wins",
    paras: [
      "An <strong>adjacency list</strong> is an array of lists: <code>g.get(u)</code> holds " +
      "every neighbour of <code>u</code>. Building it from an edge list is one pass. Walking " +
      "the whole graph is <code>O(n + m)</code>, because each edge is stored a constant " +
      "number of times. This is the encoding every BFS, DFS, Dijkstra and 0-1 BFS on this " +
      "module assumes.",
      "An <strong>adjacency matrix</strong> is an <code>n &times; n</code> array where " +
      "<code>mat[u][v]</code> is 1, a weight, or a sentinel. Edge tests and updates are " +
      "<code>O(1)</code>; iterating neighbours is always <code>O(n)</code>. Memory is " +
      "<code>O(n&sup2;)</code>, which at <code>n = 10&#8309;</code> is impossible and at " +
      "<code>n = 400</code> is a comfortable 160&nbsp;000 cells.",
      "An <strong>edge list</strong> is just the input: an array of " +
      "<code>(u, v, w)</code>. Kruskal and Bellman-Ford iterate edges, not vertices, so they " +
      "want this form. Converting between the three is always linear in the size of the source.",
    ],
    invariantTitle: "The interview sentence",
    invariant: "<p>Default to an adjacency list of size <code>n</code> (or " +
      "<code>n + 1</code> if the input is 1-indexed). For every undirected edge " +
      "<code>(u, v)</code> push <code>v</code> onto <code>u</code> and <code>u</code> onto " +
      "<code>v</code>. Then every neighbour scan is <code>for (int v : g.get(u))</code>, and " +
      "the whole graph costs <code>O(n + m)</code>.</p>",
    extra: [
      { kind: "tip", title: "1-index the arrays, do not remap the input",
        html: "<p>If vertices arrive as <code>1..n</code>, allocate " +
          "<code>n + 1</code> lists and ignore index 0. Remapping every edge to 0-based is an " +
          "extra source of off-by-one bugs and saves nothing. The unused slot is one pointer.</p>" },
      { kind: "warn", title: "Undirected means two writes",
        html: "<p>The single most common graph-building bug is adding " +
          "<code>(u, v)</code> and forgetting <code>(v, u)</code>. BFS then reports the graph " +
          "as disconnected, and the sample that happens to start at the right end still passes. " +
          "Write both pushes as a single habit, and write a directed-only path as an explicit " +
          "<code>if (undirected)</code> so the intent is visible.</p>" },
      { kind: "math", title: "When the matrix is actually smaller",
        html: "<p>A list of <code>ArrayList</code> objects plus boxed " +
          "<code>Integer</code>s costs far more than <code>4</code> bytes per edge. On a dense " +
          "graph <code>m &asymp; n&sup2;/2</code>, a boolean matrix is both smaller and faster. " +
          "Rule of thumb: if you would store more than about <code>n/4</code> neighbours per " +
          "vertex, consider a matrix.</p>" },
    ],
  },

  visuals: [
    {
      kind: "mermaid", vizId: "repGraph",
      h3: "The running example",
      intro: "Four vertices, five undirected edges. Every encoding on this page stores exactly " +
        "this graph. Node 3 is a leaf; the triangle 0-1-2 is the dense part.",
      caption: "Undirected graph used by the dry run and the Java. Adjacency lists store each " +
        "undirected edge twice; the matrix stores it in both triangles.",
      src: `graph LR
  n0["0"] --- n1["1"]
  n0 --- n2["2"]
  n1 --- n2["2"]
  n1 --- n3["3"]
  n2 --- n3["3"]`,
    },
    {
      kind: "array", vizId: "repDeg",
      h3: "Degrees and a neighbour walk of vertex 1",
      intro: "The array is the degree of each vertex. Stepping through it is how you verify the " +
        "list was built correctly: the handshaking lemma says the sum of degrees is " +
        "<code>2m</code>.",
      caption: "Degrees [2, 3, 3, 2] sum to 10 = 2 &times; 5 edges. The last frames walk " +
        "<code>g.get(1)</code> = [0, 2, 3] the way BFS will later consume it.",
      data: {
        label: "deg[u]",
        array: [2, 3, 3, 2],
        indexLabels: ["u=0", "u=1", "u=2", "u=3"],
        vars: ["u", "deg[u]", "neighbours"],
        speed: 900,
        frames: [
          { note: "After inserting both directions of every edge, deg[0] = 2 because 0 meets 1 and 2.",
            active: [0], dim: [1, 2, 3], values: { u: 0, "deg[u]": 2, neighbours: "1, 2" } },
          { note: "deg[1] = 3: edges to 0, 2 and 3. This is the highest-degree vertex.",
            active: [1], dim: [0, 2, 3], values: { u: 1, "deg[u]": 3, neighbours: "0, 2, 3" } },
          { note: "deg[2] = 3: edges to 0, 1 and 3.",
            active: [2], dim: [0, 1, 3], values: { u: 2, "deg[u]": 3, neighbours: "0, 1, 3" } },
          { note: "deg[3] = 2: edges to 1 and 2. Sum of degrees = 10 = 2m. The list is consistent.",
            active: [3], done: [0, 1, 2], values: { u: 3, "deg[u]": 2, neighbours: "1, 2" } },
          { note: "Neighbour walk of u = 1, first neighbour 0. This is one iteration of for (int v : g.get(1)).",
            active: [1], best: [0], values: { u: 1, "deg[u]": 3, neighbours: "visiting 0" } },
          { note: "Second neighbour 2.",
            active: [1], best: [2], values: { u: 1, "deg[u]": 3, neighbours: "visiting 2" } },
          { note: "Third neighbour 3. Walk complete: three iterations, matching deg[1]. BFS and DFS are this loop plus a queue or a stack.",
            active: [1], best: [3], done: [0, 2], values: { u: 1, "deg[u]": 3, neighbours: "visiting 3" } },
        ],
      },
    },
  ],

  steps: [
    "<strong>Read <code>n</code> and <code>m</code></strong> and decide 0-based versus 1-based. " +
      "If vertices are <code>1..n</code>, allocate <code>n + 1</code> slots.",
    "<strong>Allocate the structure.</strong> List: <code>n</code> empty " +
      "<code>ArrayList</code>s. Matrix: <code>new int[n][n]</code> filled with 0 or a sentinel.",
    "<strong>For each of the <code>m</code> edges</strong> read <code>u, v</code> (and " +
      "<code>w</code> if weighted).",
    "<strong>Insert the forward edge:</strong> <code>g.get(u).add(v)</code> or " +
      "<code>mat[u][v] = w</code>.",
    "<strong>If undirected, insert the reverse</strong> in the same iteration. Never do it in a " +
      "second pass &mdash; you will forget.",
    "<strong>Sanity-check:</strong> sum of list sizes equals <code>m</code> (directed) or " +
      "<code>2m</code> (undirected).",
    "<strong>Iterate with <code>for (int v : g.get(u))</code></strong>, never with a nested loop " +
      "over all <code>n</code> vertices unless you chose a matrix on purpose.",
  ],

  dryRun: {
    intro: "Build the list and the matrix for the four-node graph, then read the neighbours of " +
      "vertex 1 from each encoding.",
    cols: ["step", "edge", "g.get(u) after", "mat cells set"],
    rows: [
      { cells: ["alloc", "\u2014", "4 empty lists", "4\times4 zeros"],
        action: "n = 4, 0-based." },
      { cells: ["1", "0-1", "0:[1]  1:[0]", "mat[0][1]=mat[1][0]=1"],
        action: "First undirected edge, two writes.", change: true },
      { cells: ["2", "0-2", "0:[1,2]  2:[0]", "mat[0][2]=mat[2][0]=1"],
        action: "Vertex 0 now has two neighbours." },
      { cells: ["3", "1-2", "1:[0,2]  2:[0,1]", "mat[1][2]=mat[2][1]=1"],
        action: "The triangle closes." },
      { cells: ["4", "1-3", "1:[0,2,3]  3:[1]", "mat[1][3]=mat[3][1]=1"],
        action: "Leaf 3 appears." },
      { cells: ["5", "2-3", "2:[0,1,3]  3:[1,2]", "mat[2][3]=mat[3][2]=1"],
        action: "Build complete. Sum of list sizes = 10 = 2m.", change: true },
      { cells: ["read", "neigh(1)", "0, 2, 3", "scan row 1: four cells"],
        action: "List answers in O(deg)=O(3). Matrix scans all n=4 columns." },
    ],
  },

  code: [
    { tab: "Adjacency list", panel: "List", file: "GraphList.java",
      intro: "The default encoding. Weighted edges store a pair; unweighted store a bare " +
        "<code>int</code>. The dry-run graph is built and printed.",
      highlight: "18-21",
      code: `import java.util.ArrayList;
import java.util.List;

public class GraphList {

    static List<List<Integer>> build(int n, int[][] edges, boolean undirected) {
        List<List<Integer>> g = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            g.add(new ArrayList<>());
        }
        for (int[] e : edges) {
            int u = e[0], v = e[1];
            g.get(u).add(v);
            if (undirected) {
                g.get(v).add(u);
            }
        }
        return g;
    }

    static int[] degrees(List<List<Integer>> g) {
        int n = g.size();
        int[] deg = new int[n];
        for (int u = 0; u < n; u++) {
            deg[u] = g.get(u).size();
        }
        return deg;
    }

    public static void main(String[] args) {
        int[][] edges = {{0, 1}, {0, 2}, {1, 2}, {1, 3}, {2, 3}};
        List<List<Integer>> g = build(4, edges, true);
        int[] deg = degrees(g);
        for (int u = 0; u < g.size(); u++) {
            System.out.println(u + ": " + g.get(u) + " deg=" + deg[u]);
        }
    }
    // Input : n=4, edges (0-1)(0-2)(1-2)(1-3)(2-3), undirected
    // Output: 0: [1, 2] deg=2
    //         1: [0, 2, 3] deg=3
    //         2: [0, 1, 3] deg=3
    //         3: [1, 2] deg=2
}`,
    },
    { tab: "Adjacency matrix", panel: "Matrix", file: "GraphMatrix.java",
      intro: "Use this when <code>n</code> is small and you need <code>O(1)</code> edge tests. " +
        "Sentinel <code>0</code> means missing; store a weight if the graph is weighted.",
      code: `public class GraphMatrix {

    static int[][] build(int n, int[][] edges, boolean undirected) {
        int[][] mat = new int[n][n];
        for (int[] e : edges) {
            int u = e[0], v = e[1];
            int w = e.length > 2 ? e[2] : 1;
            mat[u][v] = w;
            if (undirected) {
                mat[v][u] = w;
            }
        }
        return mat;
    }

    static boolean hasEdge(int[][] mat, int u, int v) {
        return mat[u][v] != 0;
    }

    public static void main(String[] args) {
        int[][] edges = {{0, 1}, {0, 2}, {1, 2}, {1, 3}, {2, 3}};
        int[][] mat = build(4, edges, true);
        System.out.println("1-3? " + hasEdge(mat, 1, 3) + "  0-3? " + hasEdge(mat, 0, 3));
        System.out.print("row 1:");
        for (int v = 0; v < 4; v++) {
            System.out.print(" " + mat[1][v]);
        }
        System.out.println();
    }
    // Input : n=4, same five undirected edges
    // Output: 1-3? true  0-3? false
    //         row 1: 1 0 1 1
}`,
    },
    { tab: "Template", panel: "Template", file: "GraphTemplate.java",
      intro: "Weighted list plus an edge-list copy. Copy this into a solution and delete the " +
        "encoding you do not need.",
      code: `import java.util.ArrayList;
import java.util.List;

public class GraphTemplate {

    static final class Edge {
        final int to, w;
        Edge(int to, int w) { this.to = to; this.w = w; }
    }

    int n;
    List<List<Edge>> g;
    int[][] raw;                       // edge list kept for Kruskal / Bellman-Ford

    GraphTemplate(int n, int[][] edges, boolean undirected) {
        this.n = n;
        this.raw = edges;
        g = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            g.add(new ArrayList<>());
        }
        for (int[] e : edges) {
            int u = e[0], v = e[1], w = e.length > 2 ? e[2] : 1;
            g.get(u).add(new Edge(v, w));
            if (undirected) {
                g.get(v).add(new Edge(u, w));
            }
        }
    }

    public static void main(String[] args) {
        int[][] edges = {{0, 1, 2}, {0, 2, 5}, {1, 2, 1}, {1, 3, 4}, {2, 3, 1}};
        GraphTemplate gt = new GraphTemplate(4, edges, true);
        System.out.println("n=" + gt.n + " edges=" + gt.raw.length
                + " deg(1)=" + gt.g.get(1).size());
    }
    // Input : n=4, five weighted undirected edges
    // Output: n=4 edges=5 deg(1)=3
}`,
    },
  ],

  complexity: {
    time: "O(n + m) to build a list; O(n\u00b2) to allocate a matrix",
    space: "O(n + m) list; O(n\u00b2) matrix",
    derivation: [
      "<p>Each edge is stored a constant number of times in a list (once if directed, twice if " +
      "undirected), so build and a full walk are both linear in the input size:</p>",
      "<span class=\"eq\">T<sub>list</sub> = &Theta;(n + m)</span>",
      "<p>A matrix pays <code>n&sup2;</code> regardless of <code>m</code>. That is the right " +
      "price only when you will look at a constant fraction of the cells, or when " +
      "<code>n</code> is small enough that <code>n&sup2;</code> fits and <code>O(1)</code> " +
      "edge tests matter.</p>",
      "<span class=\"eq\">T<sub>matrix neighbour scan</sub> = &Theta;(n) per vertex, &Theta;(n&sup2;) globally</span>",
    ],
    compare: [
      ["Adjacency list", "O(n + m) build / walk", "O(n + m)", "Default. Sparse graphs, BFS, DFS, Dijkstra"],
      ["Adjacency matrix", "O(n\u00b2) alloc, O(1) test", "O(n\u00b2)", "n \u2264 ~400, Floyd-Warshall, dense DP"],
      ["Edge list", "O(m)", "O(m)", "Kruskal, Bellman-Ford, just sorting edges"],
      ["Implicit grid", "O(1) per move", "O(1) extra", "Mazes; never materialise n\u00b2 lists"],
      ["HashSet of pairs", "O(1) expected test", "O(m)", "Need both neighbour iteration and tests"],
    ],
  },

  pitfalls: [
    { title: "Forgetting the reverse edge",
      bug: "Inserting <code>(u, v)</code> only, on an undirected graph. BFS from one end " +
        "reaches everyone; BFS from the other end reports a disconnected graph.",
      fix: "Always write both pushes in the same loop body. Treat \"directed\" as the explicit " +
        "special case, not the default." },
    { title: "0-based arrays, 1-based input",
      bug: "<code>g.get(u)</code> on a vertex labelled <code>n</code> throws, or vertex 0 is a " +
        "phantom that you later iterate.",
      fix: "Allocate <code>n + 1</code> and ignore index 0, <em>or</em> subtract one from every " +
        "id on the way in. Pick one convention per file and do not mix them." },
    { title: "Scanning all n vertices to find neighbours",
      bug: "<code>for (v = 0; v &lt; n; v++) if (mat[u][v] == 1)</code> inside BFS on a list " +
        "problem with <code>n = 10&#8309;</code>. That is <code>O(n&sup2;)</code>.",
      fix: "If you built a list, iterate the list. The matrix scan is only legal when you " +
        "chose a matrix because <code>n</code> is small." },
    { title: "Self-loops and multi-edges",
      bug: "Assuming simple graphs. A self-loop in an undirected cycle check is a cycle of " +
        "length 1; a multi-edge is a cycle of length 2. Some problems include both.",
      fix: "Decide up front whether they count. If they do not, skip <code>u == v</code> and " +
        "deduplicate, or use a matrix which naturally collapses multi-edges." },
    { title: "Storing weights as a parallel array of lists",
      bug: "Two lists <code>to</code> and <code>w</code> that you must keep in lockstep. One " +
        "missed add desynchronises them permanently.",
      fix: "Store a small pair / inner class, or pack " +
        "<code>(to, w)</code> into a <code>long</code>. One structure, one append." },
    { title: "Materialising an implicit graph",
      bug: "Building adjacency lists for every cell of a 1000&times;1000 grid. That is a " +
        "million lists and four million edges you can generate with four additions.",
      fix: "Write a <code>neighbours(r, c)</code> helper that yields the legal moves. BFS " +
        "never needs the lists to exist." },
  ],

  variants: [
    ["Weighted list",
      "Each neighbour is a (to, weight) pair instead of a bare int.",
      "g.get(u).add(new Edge(v, w));",
      "<a href=\"dijkstra.html\">Dijkstra</a>"],
    ["1-indexed contest template",
      "Allocate n+1 lists, read u and v as given, never subtract one.",
      "for (i = 0; i <= n; i++) g.add(new ArrayList<>());",
      "CSES / Codeforces default"],
    ["Forward-star / CSR",
      "Two arrays head[u] and next[e], to[e], w[e]. Faster constants, no boxing.",
      "to[e]=v; next[e]=head[u]; head[u]=e++;",
      "Hot inner loops in Java contests"],
    ["Functional / immutable snapshot",
      "Copy-on-write lists so a recursive search can add a temporary edge and backtrack.",
      "Not needed for BFS/DFS; used in some backtracking on graphs.",
      "<a href=\"../04-recursion-and-dnc/backtracking-with-pruning.html\">Backtracking</a>"],
  ],

  followups: [
    ["When is a matrix faster than a list even on a sparse graph?",
      "<p>When the inner loop is an edge test, not a neighbour walk. Floyd-Warshall looks at " +
      "every triple <code>(k, i, j)</code> and wants <code>mat[i][j]</code> in one array " +
      "read. A list would turn each test into a scan. Also, when <code>n &le; 400</code> the " +
      "matrix fits in cache and beats pointer-chasing <code>ArrayList</code>s.</p>"],
    ["How do I represent a graph that changes (edges inserted and deleted)?",
      "<p>Lists support insert in <code>O(1)</code> and delete in <code>O(deg)</code> unless " +
      "you store iterators or a set. A matrix supports both in <code>O(1)</code>. For " +
      "fully-dynamic connectivity you need a much heavier structure; for \"add a few edges " +
      "then BFS\" just append to the lists.</p>"],
    ["Should I use <code>List&lt;int[]&gt;</code> or a tiny static class for weighted edges?",
      "<p>A static class <code>Edge { int to, w; }</code> is clearer and not slower. " +
      "<code>int[]{to, w}</code> allocates the same object and loses the names. Do not use " +
      "<code>ArrayList&lt;Integer&gt;</code> pairs of lists.</p>"],
    ["What changes for a multigraph or a graph with self-loops?",
      "<p>Lists store them naturally: two entries for a multi-edge, one <code>u</code> in " +
      "<code>g.get(u)</code> for a loop. A matrix collapses multi-edges unless you store a " +
      "count. Cycle detection and Euler tours care; shortest paths usually do not (keep the " +
      "minimum weight).</p>"],
  ],

  problems: [
    { name: "Find the Town Judge", url: "https://leetcode.com/problems/find-the-town-judge/",
      badge: "lc", tag: "LC 997", level: "Easy", pattern: "Degree count, no lists needed" },
    { name: "Find Center of Star Graph", url: "https://leetcode.com/problems/find-center-of-star-graph/",
      badge: "lc", tag: "LC 1791", level: "Easy", pattern: "The centre appears in the first two edges" },
    { name: "Find if Path Exists in Graph", url: "https://leetcode.com/problems/find-if-path-exists-in-graph/",
      badge: "lc", tag: "LC 1971", level: "Easy", pattern: "Build list, then BFS/DFS/DSU" },
    { name: "Keys and Rooms", url: "https://leetcode.com/problems/keys-and-rooms/",
      badge: "lc", tag: "LC 841", level: "Medium", pattern: "The list is already the adjacency list" },
    { name: "All Paths From Source to Target", url: "https://leetcode.com/problems/all-paths-from-source-to-target/",
      badge: "lc", tag: "LC 797", level: "Medium", pattern: "DAG given as a list; backtracking walk" },
    { name: "Number of Provinces", url: "https://leetcode.com/problems/number-of-provinces/",
      badge: "lc", tag: "LC 547", level: "Medium", pattern: "Input is a matrix; convert or scan rows" },
    { name: "New Year Transportation", url: "https://codeforces.com/problemset/problem/500/A",
      badge: "cf", tag: "CF 500A", level: "Easy", pattern: "Functional graph, one outgoing edge each" },
    { name: "Building Roads", url: "https://cses.fi/problemset/task/1666",
      badge: "gfg", tag: "CSES", level: "Easy", pattern: "Build undirected list, then components" },
    { name: "Print adjacency list", url: "https://www.geeksforgeeks.org/problems/print-adjacency-list-1587115620/1",
      badge: "gfg", tag: "GfG", level: "Easy", pattern: "Construct and emit the lists" },
    { name: "Bridges", url: "https://atcoder.jp/contests/abc075/tasks/abc075_c",
      badge: "atc", tag: "ABC 075C", level: "Medium", pattern: "Build, then drop each edge and re-check connectivity" },
  ],

  spoilers: [
    { summary: "Hint for LC 547 &mdash; do not convert the matrix if you do not need to",
      body: "<p>The input <em>is</em> an adjacency matrix. DFS from an unvisited city " +
        "<code>i</code> scans row <code>i</code> for <code>1</code>s. Converting to a list " +
        "first is correct and costs <code>O(n&sup2;)</code>, which you pay anyway. The lesson: " +
        "<em>walk the encoding you were given unless another algorithm demands a different " +
        "one.</em></p>" },
    { summary: "Hint for CF 500A &mdash; a functional graph is already a list of length 1",
      body: "<p>Each portal <code>i</code> goes only to <code>i + a[i]</code>. You do not " +
        "need <code>ArrayList</code>s. Walk from cell 1, jumping, until you pass " +
        "<code>t</code> or the end. Representation insight: <em>when out-degree is 1, an " +
        "<code>int[] next</code> is the adjacency list.</em></p>" },
  ],

  recap: {
    bullets: [
      "<strong>Adjacency list is the default</strong> for sparse graphs and for every algorithm " +
        "on the rest of this module.",
      "<strong>Matrix when <code>n</code> is small and you need <code>O(1)</code> edge tests</strong>.",
      "<strong>Undirected means two writes</strong> in the same loop body.",
      "<strong>1-indexed input: allocate <code>n + 1</code></strong> and ignore slot 0.",
      "<strong>Do not materialise implicit graphs</strong> (grids, functional graphs, " +
        "word-ladder vertices).",
    ],
    oneliner: "list default O(n+m) | matrix n<=400 O(1) test | undirected: push both | 1-index: alloc n+1",
  },
},

/* ================================================= 2. bfs ============== */
{
  id: "bfs",
  difficulty: "Easy",
  readTime: "24 min",
  tagline: "The only shortest-path algorithm you need on an unweighted graph: a queue, a " +
    "<code>dist</code> array, and the rule that the first time you see a vertex is the closest " +
    "time.",
  tags: ["BFS", "queue", "shortest path", "P0"],
  prereqs: [["Graph Representations", "graph-representations.html"]],

  why: {
    paras: [
      "Breadth-first search visits vertices in order of unweighted distance from the source. " +
      "That single fact is why it computes shortest paths on unit-weight graphs, why it " +
      "colours bipartite graphs, why multi-source flood-fills work, and why \"minimum " +
      "operations to turn A into B\" is a BFS on an implicit graph.",
      "The reason it is an interview staple is that the code is short and the bugs are " +
      "classic: marking visited at pop instead of push (the queue explodes), using a " +
      "<code>Stack</code> by accident, forgetting disconnected components, and treating a " +
      "weighted graph as unweighted. If you can write BFS without looking and name those " +
      "four bugs, you have the foundation for Dijkstra and 0-1 BFS.",
      "BFS is also the cleanest way to <em>see</em> a graph algorithm. The queue is the " +
      "frontier, <code>dist[u]</code> is the level, and the invariant is visible in the " +
      "array: processed vertices, the current layer, and the undiscovered rest.",
    ],
    insight: "The first time BFS reaches a vertex is via a shortest path. Mark it visited " +
      "<em>when you push</em>, so each vertex enters the queue once. That is the whole " +
      "correctness argument and the whole complexity proof.",
  },

  recognise: {
    yes: [
      "\"Shortest path\" on a graph whose edges all have the same weight (or weight 1)",
      "\"Minimum number of moves / operations\" to reach a state",
      "Multi-source flooding: rotting oranges, walls and gates, 01-matrix",
      "Level-order traversal of a tree, or \"nodes at distance k\"",
      "The implicit graph of a word ladder, a lock, or a grid with 4-way moves",
    ],
    no: [
      "Edges have different positive weights &rarr; " +
        "<a href=\"dijkstra.html\">Dijkstra</a>",
      "Weights are only 0 and 1 &rarr; <a href=\"zero-one-bfs.html\">0-1 BFS</a>, not " +
        "plain BFS (treating 0-edges as 1 is wrong)",
      "Negative weights &rarr; " +
        "<a href=\"../08-graphs-advanced/bellman-ford-and-negative-cycles.html\">Bellman-Ford</a>",
      "You need any path, or connectivity only, and the graph is a tree &rarr; DFS is " +
        "fine and uses less memory in practice",
    ],
    table: [
      ["\"shortest path\", unit weights", "Levels are distances", "BFS + dist[]"],
      ["\"minimum operations to convert A to B\"", "Implicit unweighted graph", "BFS on states"],
      ["Several sources, min dist to a source", "Super-source, or seed the queue with all", "Multi-source BFS"],
      ["Grid, 4-way moves, obstacles", "Implicit graph, r*C+c as id", "BFS on cells"],
      ["Word ladder / lock / jump game II-style", "Edges generated on the fly", "BFS + visited set"],
      ["Tree, distance from root, or diameter (2 BFS)", "Unique paths", "BFS from a leaf, then from the farthest"],
      ["<strong>Confused with:</strong> Dijkstra on all-ones weights",
        "Correct but slower by a log",
        "Use the queue, not a PriorityQueue"],
    ],
    constraint: "<code>n, m &le; 2&times;10&#8309;</code> is the standard. BFS is " +
      "<code>O(n + m)</code> and <code>O(n)</code> memory for the queue and " +
      "<code>dist</code>. On a grid, <code>n</code> is the cell count. State-space BFS dies " +
      "when the state does not fit in memory or in <code>10&#8312;</code> visits.",
  },

  core: {
    heading: "The invariant and the push-when-seen rule",
    paras: [
      "Start with a queue holding the source (or every source), <code>dist[s] = 0</code>, " +
      "and every other <code>dist[u] = -1</code> meaning unseen. While the queue is not " +
      "empty, pop <code>u</code> and relax every unseen neighbour <code>v</code>: set " +
      "<code>dist[v] = dist[u] + 1</code> and push <code>v</code>. Because vertices leave " +
      "the queue in non-decreasing <code>dist</code>, the first time you see <code>v</code> " +
      "is the closest time.",
      "Visited-on-push is mandatory for correctness of the <code>O(n)</code> bound. If you " +
      "mark at pop, two parents at the same level both push <code>v</code>, the queue can " +
      "hold the same vertex many times, and a dense graph turns " +
      "<code>O(n + m)</code> into something closer to <code>O(n &middot; m)</code>.",
      "Multi-source BFS is the same algorithm with several zeros in the queue at the start. " +
      "Each cell's distance is then the distance to the <em>nearest</em> source, which is " +
      "exactly rotting oranges and 01-matrix.",
    ],
    invariantTitle: "The invariant",
    invariant: "<p>At every moment the queue holds a contiguous range of distances, and " +
      "every vertex already popped has its final shortest-path distance. Equivalently:</p>" +
      "<span class=\"eq\">the first time v is pushed, dist[v] is the unweighted distance from s</span>" +
      "<p>Never overwrite <code>dist[v]</code> after that. There is no second, shorter path " +
      "in an unweighted graph.</p>",
    extra: [
      { kind: "key", title: "Parent pointers reconstruct the path",
        html: "<p>Keep <code>parent[v] = u</code> at the moment you push <code>v</code>. " +
          "Walk from the target back to the source and reverse. The path is unique in a " +
          "tree and <em>a</em> shortest path in a general graph. Do not store the whole " +
          "path on the queue &mdash; that copies <code>O(n)</code> per vertex.</p>" },
      { kind: "warn", title: "ArrayDeque, not Stack, not a linked list used as a stack",
        html: "<p>BFS is a queue: <code>offer</code> at the back, <code>poll</code> at the " +
          "front. <code>java.util.Stack</code> is a vector with a misleading name; " +
          "<code>ArrayDeque.pop</code> is LIFO and gives you DFS. Write " +
          "<code>ArrayDeque&lt;Integer&gt; q</code> and only use <code>offer</code> / " +
          "<code>poll</code>.</p>" },
    ],
  },

  visuals: [
    {
      kind: "mermaid", vizId: "bfsGraph",
      h3: "BFS layers on the running graph",
      intro: "Source 0. Layer 1 is {1, 2}, layer 2 is {3}. Those layers <em>are</em> the " +
        "distances.",
      caption: "Undirected unweighted graph. BFS from 0 visits 1 and 2 at distance 1, then 3 " +
        "at distance 2 via either parent.",
      src: `graph TD
  n0["0  dist 0"] --- n1["1  dist 1"]
  n0 --- n2["2  dist 1"]
  n1 --- n2
  n1 --- n3["3  dist 2"]
  n2 --- n3`,
    },
    {
      kind: "array", vizId: "bfsDist",
      h3: "Queue and dist[] through the run",
      intro: "The array is <code>dist</code>. <code>-1</code> means unseen. Watch the queue " +
        "string in the variables: vertices enter once, in level order.",
      caption: "First touch sets dist[v] forever. The queue never holds a vertex twice " +
        "because we mark on push.",
      data: {
        label: "dist[u]  (-1 = unseen)",
        array: [-1, -1, -1, -1],
        indexLabels: ["0", "1", "2", "3"],
        vars: ["u", "queue", "dist[u]"],
        speed: 950,
        frames: [
          { note: "Seed: push 0, dist[0] = 0. Queue = [0].",
            arr: [0, -1, -1, -1], active: [0], dim: [1, 2, 3],
            values: { u: "seed", queue: "[0]", "dist[u]": 0 } },
          { note: "Pop 0. Neighbours 1 and 2 are unseen. Push 1 with dist 1.",
            arr: [0, 1, -1, -1], active: [1], done: [0], dim: [2, 3],
            values: { u: 0, queue: "[1]", "dist[u]": 0 } },
          { note: "Still processing 0: push 2 with dist 1. Queue = [1, 2]. Layer 1 is complete.",
            arr: [0, 1, 1, -1], active: [2], done: [0], best: [1], dim: [3],
            values: { u: 0, queue: "[1, 2]", "dist[u]": 0 } },
          { note: "Pop 1. Neighbour 0 is seen. Neighbour 3 is unseen: dist[3] = 2, push 3.",
            arr: [0, 1, 1, 2], active: [3], done: [0, 1], best: [2],
            values: { u: 1, queue: "[2, 3]", "dist[u]": 1 } },
          { note: "Pop 2. Neighbours 0, 1, 3 are all already seen. No push.",
            arr: [0, 1, 1, 2], done: [0, 1, 2], active: [3],
            values: { u: 2, queue: "[3]", "dist[u]": 1 } },
          { note: "Pop 3. Neighbours 1 and 2 seen. Queue empty. Distances [0, 1, 1, 2] are final.",
            arr: [0, 1, 1, 2], done: [0, 1, 2, 3],
            values: { u: 3, queue: "[]", "dist[u]": 2 } },
          { note: "Shortest path 0 to 3 has length 2. Either 0-1-3 or 0-2-3; parent[] would record whichever neighbour pushed 3 first.",
            arr: [0, 1, 1, 2], best: [0, 3], done: [1, 2],
            values: { u: "ans", queue: "[]", "dist[u]": 2 } },
        ],
      },
    },
  ],

  steps: [
    "<strong>Allocate <code>int[] dist</code></strong> of length <code>n</code>, fill with " +
      "<code>-1</code> (or a separate <code>boolean[] seen</code>).",
    "<strong>Seed the queue</strong> with every source. Set <code>dist[s] = 0</code> and " +
      "mark seen <em>before</em> the loop.",
    "<strong>While the queue is not empty</strong>, <code>u = q.poll()</code>.",
    "<strong>For each neighbour <code>v</code></strong> of <code>u</code>, skip if " +
      "<code>dist[v] != -1</code>.",
    "<strong>Otherwise</strong> set <code>dist[v] = dist[u] + 1</code>, set " +
      "<code>parent[v] = u</code> if you need the path, and <code>q.offer(v)</code>.",
    "<strong>After the loop</strong>, <code>dist[t] == -1</code> means unreachable; otherwise " +
      "it is the shortest unweighted distance.",
    "<strong>If the graph may be disconnected</strong> and you need every component, wrap " +
      "the above in <code>for (s = 0; s &lt; n; s++) if (dist[s] == -1) bfs(s)</code>.",
  ],

  dryRun: {
    intro: "BFS from vertex 0 on the four-node graph. Each row is a pop, plus the pushes it " +
      "performs.",
    cols: ["u", "dist[u]", "queue before pop", "pushes", "queue after"],
    rows: [
      { cells: ["\u2014", "0", "[]", "seed 0", "[0]"],
        action: "Initialise." },
      { cells: ["0", "0", "[0]", "1, 2", "[1, 2]"],
        action: "First layer discovered.", change: true },
      { cells: ["1", "1", "[1, 2]", "3", "[2, 3]"],
        action: "3 seen for the first time, dist = 2." },
      { cells: ["2", "1", "[2, 3]", "none", "[3]"],
        action: "3 already seen; skip." },
      { cells: ["3", "2", "[3]", "none", "[]"],
        action: "Done. dist = [0, 1, 1, 2].", change: true },
    ],
    after: "<p>Vertex 3 was offered by 1, not by 2. A parent pointer would store " +
      "<code>parent[3] = 1</code>, reconstructing path <code>0-1-3</code>.</p>",
  },

  code: [
    { tab: "Brute (DFS distances)", panel: "Brute", file: "BfsBrute.java",
      intro: "Exploring every simple path and keeping the shortest works, and shows why BFS " +
        "exists: this is exponential on a dense graph.",
      code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class BfsBrute {

    static void dfs(List<List<Integer>> g, int u, int d, int[] best, boolean[] on) {
        if (d >= best[u]) {
            return;
        }
        best[u] = d;
        on[u] = true;
        for (int v : g.get(u)) {
            if (!on[v]) {
                dfs(g, v, d + 1, best, on);
            }
        }
        on[u] = false;
    }

    public static void main(String[] args) {
        List<List<Integer>> g = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            g.add(new ArrayList<>());
        }
        int[][] e = {{0, 1}, {0, 2}, {1, 2}, {1, 3}, {2, 3}};
        for (int[] x : e) {
            g.get(x[0]).add(x[1]);
            g.get(x[1]).add(x[0]);
        }
        int[] best = new int[4];
        Arrays.fill(best, Integer.MAX_VALUE);
        dfs(g, 0, 0, best, new boolean[4]);
        System.out.println(Arrays.toString(best));
    }
    // Input : same four-node graph, source 0
    // Output: [0, 1, 1, 2]
}`,
    },
    { tab: "Optimal BFS", panel: "Optimal", file: "Bfs.java",
      intro: "Mark on push. Returns <code>dist</code>; <code>-1</code> means unreachable.",
      highlight: "16-20",
      code: `import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Bfs {

    static int[] bfs(List<List<Integer>> g, int s) {
        int n = g.size();
        int[] dist = new int[n];
        Arrays.fill(dist, -1);
        ArrayDeque<Integer> q = new ArrayDeque<>();
        dist[s] = 0;
        q.offer(s);
        while (!q.isEmpty()) {
            int u = q.poll();
            for (int v : g.get(u)) {
                if (dist[v] == -1) {
                    dist[v] = dist[u] + 1;
                    q.offer(v);
                }
            }
        }
        return dist;
    }

    public static void main(String[] args) {
        List<List<Integer>> g = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            g.add(new ArrayList<>());
        }
        int[][] e = {{0, 1}, {0, 2}, {1, 2}, {1, 3}, {2, 3}};
        for (int[] x : e) {
            g.get(x[0]).add(x[1]);
            g.get(x[1]).add(x[0]);
        }
        System.out.println(Arrays.toString(bfs(g, 0)));
    }
    // Input : n=4, undirected edges as above, source 0
    // Output: [0, 1, 1, 2]
}`,
    },
    { tab: "Template", panel: "Template", file: "BfsTemplate.java",
      intro: "Multi-source plus parent pointers. Seed <code>sources</code> with every start " +
        "cell; reconstruct with <code>parent</code>.",
      code: `import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class BfsTemplate {

    static int[] bfs(List<List<Integer>> g, int[] sources, int[] parent) {
        int n = g.size();
        int[] dist = new int[n];
        Arrays.fill(dist, -1);
        Arrays.fill(parent, -1);
        ArrayDeque<Integer> q = new ArrayDeque<>();
        for (int s : sources) {
            if (dist[s] == -1) {
                dist[s] = 0;
                q.offer(s);
            }
        }
        while (!q.isEmpty()) {
            int u = q.poll();
            for (int v : g.get(u)) {
                if (dist[v] == -1) {
                    dist[v] = dist[u] + 1;
                    parent[v] = u;
                    q.offer(v);
                }
            }
        }
        return dist;
    }

    public static void main(String[] args) {
        List<List<Integer>> g = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            g.add(new ArrayList<>());
        }
        int[][] e = {{0, 1}, {0, 2}, {1, 2}, {1, 3}, {2, 3}};
        for (int[] x : e) {
            g.get(x[0]).add(x[1]);
            g.get(x[1]).add(x[0]);
        }
        int[] parent = new int[4];
        int[] dist = bfs(g, new int[] {0}, parent);
        System.out.println(Arrays.toString(dist));
        System.out.println("parent[3]=" + parent[3]);
    }
    // Input : source 0
    // Output: [0, 1, 1, 2]
    //         parent[3]=1
}`,
    },
  ],

  complexity: {
    time: "O(n + m)",
    space: "O(n) for queue, dist, parent",
    derivation: [
      "<p>Each vertex is pushed at most once (visited-on-push). Each edge is examined at " +
      "most twice (once from each end if undirected):</p>",
      "<span class=\"eq\">T = &Theta;(n) + &Theta;(m) = &Theta;(n + m)</span>",
      "<p>The queue holds at most <code>n</code> integers. On a grid, replace " +
      "<code>n</code> with cells and <code>m</code> with <code>4 &middot;</code> cells. On " +
      "an implicit state graph, <code>n</code> is the number of reachable states &mdash; " +
      "that is the number you must be able to store.</p>",
    ],
    compare: [
      ["BFS, unit weights", "O(n + m)", "O(n)", "Default shortest path"],
      ["DFS distances", "exponential", "O(n)", "Wrong tool; only for DAGs with memo"],
      ["Dijkstra", "O((n + m) log n)", "O(n)", "When weights differ and are non-negative"],
      ["0-1 BFS", "O(n + m)", "O(n)", "Weights in {0, 1} only"],
      ["Multi-source BFS", "O(n + m)", "O(n)", "Same code, several seeds"],
    ],
  },

  pitfalls: [
    { title: "Marking visited when you pop",
      bug: "Two parents at distance d both push v. The queue grows with duplicates; on a " +
        "complete graph this is catastrophic.",
      fix: "Set dist[v] (or seen[v] = true) at the moment you offer v. The test " +
        "<code>if (dist[v] == -1)</code> is the mark." },
    { title: "Using a stack",
      bug: "<code>ArrayDeque.push / pop</code> or <code>java.util.Stack</code> gives DFS " +
        "order. Distances are then wrong on any graph that is not a tree with a lucky shape.",
      fix: "offer / poll only. If you need DFS, say so and use an explicit stack or recursion." },
    { title: "Treating weighted edges as unit",
      bug: "Running BFS on a Dijkstra problem. The first path to v is the fewest-edges path, " +
        "not the cheapest.",
      fix: "BFS is legal iff every edge you traverse costs the same. Otherwise Dijkstra or " +
        "0-1 BFS." },
    { title: "Disconnected graphs and forgotten sources",
      bug: "One BFS from vertex 0, then treating unvisited vertices as unreachable when the " +
        "problem asked for components, or forgetting to seed every rotten orange.",
      fix: "Match the seed set to the question. Connectivity of the whole graph: loop over " +
        "unvisited starts. Nearest source: put every source in the queue at distance 0." },
    { title: "Storing the path on the queue",
      bug: "<code>Queue&lt;List&lt;Integer&gt;&gt;</code> copying the path at every step. " +
        "Memory becomes O(n&sup2;) and Java's allocator dies before the algorithm does.",
      fix: "parent[v] = u, then walk back from the target. One integer per vertex." },
    { title: "Integer overflow on dist + 1 in weird state spaces",
      bug: "Rare in plain graphs; common when dist is used as a map key mixed with other " +
        "coordinates. Less often: using Integer.MAX_VALUE as unseen and adding 1.",
      fix: "Unseen = -1, never MAX_VALUE + 1. On grids pack coordinates as " +
        "<code>r * cols + c</code> in an int; n*m fits if you checked." },
  ],

  variants: [
    ["Multi-source",
      "Seed every source at dist 0. Distances become distance-to-nearest-source.",
      "for (int s : sources) { dist[s]=0; q.offer(s); }",
      "LC 994, LC 542, LC 286"],
    ["0-1 weights",
      "Use a deque: 0-edges to the front, 1-edges to the back.",
      "See the 0-1 BFS page; do not hack BFS with +0/+1 naively without a deque.",
      "<a href=\"zero-one-bfs.html\">0-1 BFS</a>"],
    ["BFS on a tree for diameter",
      "BFS from any node to a farthest u, then BFS from u. The second distance is the diameter.",
      "int u = farthest(bfs(g, 0)); return max(bfs(g, u));",
      "CSES Tree Diameter"],
    ["Bidirectional BFS",
      "Two queues, from s and from t, meet in the middle. Helps huge implicit graphs (word ladder).",
      "Alternate expanding the smaller frontier.",
      "LC 127"],
  ],

  followups: [
    ["Why is the first visit the shortest?",
      "<p>Edges cost 1. The queue is FIFO, so vertices leave in non-decreasing distance. " +
      "When v is first reached it is from some u at distance d, and every unprocessed vertex " +
      "has distance at least d. No later path can be shorter. This fails the moment edges " +
      "can cost 0 or more than 1.</p>"],
    ["BFS vs DFS for connectivity?",
      "<p>Both are O(n + m) and both find components. BFS uses more memory on a long path " +
      "(the queue holds a layer) and less on a star (the queue holds the leaves of one " +
      "vertex). DFS risks StackOverflowError on a path of 10^5. Prefer BFS when you also " +
      "want distances; prefer an explicit-stack DFS when you only want a component and " +
      "depth can be huge.</p>"],
    ["How do I BFS a grid without building lists?",
      "<p>Encode a cell as <code>id = r * cols + c</code>. From (r, c) try the four " +
      "deltas, skip out-of-bounds and blocked cells, and treat the neighbour id as v. " +
      "visited / dist is a 2D array or a flat array of length rows*cols.</p>"],
    ["Can I early-exit when I pop the target?",
      "<p>Yes. Because distances are final at pop (they were already final at push), the " +
      "moment you poll t you may return dist[t]. Do not exit at push if you still need " +
      "something else from the same layer; for a single target, exiting at push is also " +
      "correct.</p>"],
  ],

  problems: [
    { name: "Flood Fill", url: "https://leetcode.com/problems/flood-fill/",
      badge: "lc", tag: "LC 733", level: "Easy", pattern: "BFS or DFS on a grid, recolour a component" },
    { name: "Number of Islands", url: "https://leetcode.com/problems/number-of-islands/",
      badge: "lc", tag: "LC 200", level: "Medium", pattern: "Component count; BFS from each unvisited land" },
    { name: "01 Matrix", url: "https://leetcode.com/problems/01-matrix/",
      badge: "lc", tag: "LC 542", level: "Medium", pattern: "Multi-source BFS from every 0" },
    { name: "Rotting Oranges", url: "https://leetcode.com/problems/rotting-oranges/",
      badge: "lc", tag: "LC 994", level: "Medium", pattern: "Multi-source, answer is max dist" },
    { name: "Shortest Path in Binary Matrix", url: "https://leetcode.com/problems/shortest-path-in-binary-matrix/",
      badge: "lc", tag: "LC 1091", level: "Medium", pattern: "8-way BFS on a grid" },
    { name: "Word Ladder", url: "https://leetcode.com/problems/word-ladder/",
      badge: "lc", tag: "LC 127", level: "Hard", pattern: "Implicit graph, bidirectional BFS" },
    { name: "Message Route", url: "https://cses.fi/problemset/task/1667",
      badge: "gfg", tag: "CSES", level: "Easy", pattern: "Unweighted shortest path + reconstruct" },
    { name: "Kefa and Park", url: "https://codeforces.com/problemset/problem/580/C",
      badge: "cf", tag: "CF 580C", level: "Easy", pattern: "BFS/DFS on a tree with a running constraint" },
    { name: "BFS of graph", url: "https://www.geeksforgeeks.org/problems/bfs-traversal-of-graph/1",
      badge: "gfg", tag: "GfG", level: "Easy", pattern: "Plain traversal order from node 0" },
    { name: "Maze Master", url: "https://atcoder.jp/contests/abc007/tasks/abc007_3",
      badge: "atc", tag: "ABC 007C", level: "Easy", pattern: "Grid BFS, classic first problem" },
  ],

  spoilers: [
    { summary: "Hint for LC 542 &mdash; multi-source, not per-cell BFS",
      body: "<p>BFS from every 1 is O(n&sup2; m&sup2;). Put every 0 in the queue at distance " +
        "0 and run one BFS. Each 1 receives the distance to the nearest 0. Transferable: " +
        "<em>\"distance to the nearest X\" is one multi-source BFS from all X.</em></p>" },
    { summary: "Hint for LC 127 &mdash; generate neighbours without a full product",
      body: "<p>From a word, change each position to each letter and test membership in a " +
        "HashSet of remaining words. That is 26 * L, not N&sup2; L. Bidirectional BFS from " +
        "beginWord and endWord cuts the branching. Remove a word from the set when you push " +
        "it (visited-on-push).</p>" },
  ],

  recap: {
    bullets: [
      "<strong>Mark on push, poll from an ArrayDeque</strong>. First visit = shortest unweighted path.",
      "<strong>dist[v] = dist[u] + 1</strong> once; never relax again.",
      "<strong>Multi-source is the same loop</strong> with several zeros in the queue.",
      "<strong>parent[] reconstructs</strong>; do not store paths on the queue.",
      "<strong>Not for unequal weights</strong> &mdash; that is Dijkstra or 0-1 BFS.",
    ],
    oneliner: "ArrayDeque offer/poll | mark on push | dist[v]=dist[u]+1 | multi-source = many seeds",
  },
},

/* ============================================ 3. dfs-and-components ===== */
{
  id: "dfs-and-components",
  difficulty: "Easy",
  readTime: "24 min",
  tagline: "Depth-first search is the graph's recursion: mark, recurse on unseen neighbours, " +
    "and the vertices you touched in one call are a connected component.",
  tags: ["DFS", "components", "recursion", "P0"],
  prereqs: [
    ["Graph Representations", "graph-representations.html"],
    ["BFS", "bfs.html"],
  ],

  why: {
    paras: [
      "DFS answers a different question from BFS. It does not find shortest paths. It finds " +
      "a spanning tree of each component, a parenthetical structure of enter/exit times, and " +
      "the connected pieces of an undirected graph. Those three facts unlock cycle detection, " +
      "topological sort, bridges, SCCs and most \"paint the component\" interview problems.",
      "The practical reason to prefer DFS for components is that the code is a six-line " +
      "recursion and the component id of every vertex is just \"the start vertex of the DFS " +
      "that first reached it\". Number of islands, provinces, and \"accounts merge\" are this " +
      "idea in costume.",
      "The cost is the call stack. On a path of <code>n = 10&#8309;</code>, default JVM " +
      "stack size will throw. The cure is an explicit <code>ArrayDeque</code> stack, not a " +
      "hope that the graph is shallow. Learn both forms.",
    ],
    insight: "One DFS (or one explicit-stack walk) from an unvisited vertex paints exactly " +
      "one connected component. Loop over vertices, start a new paint when you see a fresh " +
      "one, and the number of paints is the number of components.",
  },

  recognise: {
    yes: [
      "\"How many connected groups / islands / provinces?\"",
      "\"Colour / list every vertex in the same component as X\"",
      "You need enter/exit times, a preorder, or a parent in a spanning tree",
      "The next algorithm is cycle detection, topo sort, bridges or SCCs",
      "A grid of land/water and 4-way adjacency",
    ],
    no: [
      "You need shortest unweighted distances &rarr; BFS",
      "You need shortest weighted distances &rarr; Dijkstra",
      "Directed \"components\" that should collapse cycles &rarr; " +
        "<a href=\"../08-graphs-advanced/scc-tarjan-kosaraju.html\">SCC</a>, not undirected DFS",
      "The graph is a collection of pairs to unify and you only need the grouping &rarr; " +
        "<a href=\"../06-range-queries/dsu.html\">DSU</a> is shorter",
    ],
    table: [
      ["Count islands / provinces / friend circles", "Undirected components", "DFS flood or DSU"],
      ["Grid land/water", "Implicit 4-way graph", "DFS/BFS flood fill"],
      ["Preorder / timestamps / subtree size", "DFS tree metrics", "tin[], tout[], sz[]"],
      ["\"Is the graph connected?\"", "One component or more", "One DFS, then scan visited"],
      ["Directed, \"can I reach t from s?\"", "Reachability, not components", "DFS/BFS from s"],
      ["Directed, groups that can all reach each other", "Strong connectivity", "Tarjan / Kosaraju"],
      ["<strong>Confused with:</strong> BFS components",
        "Same answer, different tree",
        "Use DFS when you want the recursion; BFS when you want distances"],
    ],
    constraint: "<code>n, m &le; 2&times;10&#8309;</code>. Recursive DFS needs " +
      "<code>-Xss</code> or an explicit stack at this size. Time is <code>O(n + m)</code> " +
      "either way. A grid is <code>O(RC)</code>.",
  },

  core: {
    heading: "The recursion and the component loop",
    paras: [
      "The recursive form is: mark <code>u</code> visited (and assign it the current " +
      "component id), then for each unseen neighbour recurse. Because an undirected edge is " +
      "stored both ways, the parent is already visited and is skipped; everything else you " +
      "reach is in the same component.",
      "The outer loop is the part people forget. A single <code>dfs(0)</code> only paints " +
      "the component of 0. To count components, iterate <code>s = 0 .. n-1</code> and start " +
      "a new DFS (with a fresh id) whenever <code>s</code> is still unseen.",
      "Timestamps <code>tin[u]</code> / <code>tout[u]</code> are incremented around the " +
      "recursive calls. They turn ancestry into an interval test " +
      "(<code>tin[u] &le; tin[v] &le; tout[u]</code>) and are the substrate for bridges, " +
      "HLD and Euler tours. Record them even when the current problem does not ask; they " +
      "cost two integers.",
    ],
    invariantTitle: "The invariant",
    invariant: "<p>During <code>dfs(u)</code>, every vertex already marked with the current " +
      "id is reachable from the component's start, and when <code>dfs(u)</code> returns, " +
      "every vertex reachable from <code>u</code> through unseen vertices has been marked.</p>" +
      "<span class=\"eq\">one start of dfs on an unvisited vertex = one connected component</span>",
    extra: [
      { kind: "warn", title: "Recursion depth is space, and it can be n",
        html: "<p>A path graph is a legal undirected graph. Recursive DFS is then n frames. " +
          "In Java that is a StackOverflowError around a few thousand to tens of thousands " +
          "of frames. The explicit-stack version in the Template tab is the contest default " +
          "for n = 1e5.</p>" },
      { kind: "tip", title: "Iterative DFS must simulate the neighbour iterator",
        html: "<p>Push (u, neighbour-index) pairs, not just u, or push neighbours in reverse " +
          "and mark on push. A naive \"push all neighbours\" still works for components " +
          "(you only need visited) but does not give correct tin/tout.</p>" },
    ],
  },

  visuals: [
    {
      kind: "mermaid", vizId: "dfsGraph",
      h3: "Two components",
      intro: "Add a fifth isolated vertex 4 to the running graph. DFS from 0 paints {0,1,2,3}; " +
        "a second start at 4 paints {4}.",
      caption: "Undirected graph with two components. Component ids after the outer loop: " +
        "[0, 0, 0, 0, 1].",
      src: `graph LR
  n0["0"] --- n1["1"]
  n0 --- n2["2"]
  n1 --- n2
  n1 --- n3["3"]
  n2 --- n3
  n4["4 isolated"]`,
    },
    {
      kind: "array", vizId: "dfsComp",
      h3: "comp[] and the explicit stack as DFS runs",
      intro: "The array is the component id of each vertex, <code>-1</code> unseen. The " +
        "queue-like variable is the explicit stack (LIFO), so you can see DFS order versus " +
        "the BFS queue on the previous page.",
      caption: "Vertices 0-3 receive id 0 in DFS finish-adjacent order. Vertex 4 starts a new " +
        "component. Stack, not queue: children are explored before siblings.",
      data: {
        label: "comp[u]  (-1 = unseen)",
        array: [-1, -1, -1, -1, -1],
        indexLabels: ["0", "1", "2", "3", "4"],
        vars: ["u", "stack", "comp[u]"],
        speed: 900,
        frames: [
          { note: "Outer loop finds 0 unseen. Start component 0, push 0, mark comp[0] = 0.",
            arr: [0, -1, -1, -1, -1], active: [0], dim: [1, 2, 3, 4],
            values: { u: 0, stack: "[0]", "comp[u]": 0 } },
          { note: "Pop 0, push unseen neighbours 2 then 1 (reverse of list [1,2] so 1 is processed first).",
            arr: [0, -1, -1, -1, -1], active: [0], dim: [3, 4],
            values: { u: 0, stack: "[2, 1]", "comp[u]": 0 } },
          { note: "Pop 1, mark if needed (already 0), push unseen neighbours 3 and 2. 2 may already sit on the stack; visited-on-push prevents a second mark.",
            arr: [0, 0, -1, -1, -1], active: [1], done: [0], dim: [4],
            values: { u: 1, stack: "[2, 3, 2]", "comp[u]": 0 } },
          { note: "Pop 2 (or 3 first). Mark 2 with id 0. Remaining unseen neighbour of the triangle is 3.",
            arr: [0, 0, 0, -1, -1], active: [2], done: [0, 1], dim: [4],
            values: { u: 2, stack: "[3, ...]", "comp[u]": 0 } },
          { note: "Mark 3 with id 0. Component 0 is fully painted: {0,1,2,3}. Stack drains.",
            arr: [0, 0, 0, 0, -1], active: [3], done: [0, 1, 2], dim: [4],
            values: { u: 3, stack: "[]", "comp[u]": 0 } },
          { note: "Outer loop finds 4 unseen. Start component 1, mark comp[4] = 1. No neighbours.",
            arr: [0, 0, 0, 0, 1], active: [4], done: [0, 1, 2, 3],
            values: { u: 4, stack: "[4]", "comp[u]": 1 } },
          { note: "Two components. The answer is 2, and comp[] is the labelling you return when the problem asks which vertices belong together.",
            arr: [0, 0, 0, 0, 1], done: [0, 1, 2, 3], best: [4],
            values: { u: "done", stack: "[]", "comp[u]": "2 comps" } },
        ],
      },
    },
  ],

  steps: [
    "<strong>Allocate <code>int[] comp</code></strong> filled with <code>-1</code>, and a " +
      "counter <code>cid = 0</code>.",
    "<strong>For <code>s = 0 .. n-1</code></strong>, skip if <code>comp[s] != -1</code>.",
    "<strong>Otherwise start a component:</strong> call <code>dfs(s, cid)</code>, then " +
      "<code>cid++</code>.",
    "<strong>dfs(u, id):</strong> set <code>comp[u] = id</code>. For each neighbour " +
      "<code>v</code> with <code>comp[v] == -1</code>, recurse (or push on an explicit stack).",
    "<strong>Do not recurse into the parent</strong> if you are also recording a DFS tree " +
      "&mdash; pass <code>p</code> and skip <code>v == p</code>.",
    "<strong>Optional:</strong> record <code>tin[u]</code> before the loop and " +
      "<code>tout[u]</code> after, incrementing a global timer.",
    "<strong>Answer</strong> is <code>cid</code> (count) and/or <code>comp[]</code> (labels).",
  ],

  dryRun: {
    intro: "Recursive DFS, adjacency order 0:[1,2], 1:[0,2,3], 2:[0,1,3], 3:[1,2], 4:[]. " +
      "Parent is skipped.",
    cols: ["call", "comp after mark", "next unseen neigh", "action"],
    rows: [
      { cells: ["dfs(0,0)", "[0,-1,-1,-1,-1]", "1", "start component 0"],
        action: "Outer loop, s = 0.", change: true },
      { cells: ["dfs(1,0)", "[0,0,-1,-1,-1]", "2", "skip parent 0"],
        action: "First child of 0." },
      { cells: ["dfs(2,0)", "[0,0,0,-1,-1]", "3", "skip 0 and 1"],
        action: "Triangle closes via DFS tree edge 1-2." },
      { cells: ["dfs(3,0)", "[0,0,0,0,-1]", "none", "return"],
        action: "Leaf of this DFS tree." },
      { cells: ["returns", "[0,0,0,0,-1]", "\u2014", "component 0 done"],
        action: "Back to the outer loop." },
      { cells: ["dfs(4,1)", "[0,0,0,0,1]", "none", "start component 1"],
        action: "s = 4 was unseen.", change: true },
      { cells: ["done", "[0,0,0,0,1]", "\u2014", "cid = 2"],
        action: "Two components." },
    ],
  },

  code: [
    { tab: "Brute (BFS per start)", panel: "Brute", file: "DfsBrute.java",
      intro: "Components via BFS from every unvisited vertex. Same answer, useful as a check.",
      code: `import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class DfsBrute {

    static int[] componentsBfs(List<List<Integer>> g) {
        int n = g.size();
        int[] comp = new int[n];
        Arrays.fill(comp, -1);
        int cid = 0;
        for (int s = 0; s < n; s++) {
            if (comp[s] != -1) {
                continue;
            }
            ArrayDeque<Integer> q = new ArrayDeque<>();
            comp[s] = cid;
            q.offer(s);
            while (!q.isEmpty()) {
                int u = q.poll();
                for (int v : g.get(u)) {
                    if (comp[v] == -1) {
                        comp[v] = cid;
                        q.offer(v);
                    }
                }
            }
            cid++;
        }
        return comp;
    }

    public static void main(String[] args) {
        List<List<Integer>> g = demo();
        System.out.println(Arrays.toString(componentsBfs(g)));
    }

    static List<List<Integer>> demo() {
        List<List<Integer>> g = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            g.add(new ArrayList<>());
        }
        int[][] e = {{0, 1}, {0, 2}, {1, 2}, {1, 3}, {2, 3}};
        for (int[] x : e) {
            g.get(x[0]).add(x[1]);
            g.get(x[1]).add(x[0]);
        }
        return g;
    }
    // Input : components {0,1,2,3} and {4}
    // Output: [0, 0, 0, 0, 1]
}`,
    },
    { tab: "Optimal DFS", panel: "Optimal", file: "DfsAndComponents.java",
      intro: "Recursive flood. Fine when depth is small; switch to the template for n = 1e5.",
      highlight: "10-16",
      code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class DfsAndComponents {

    static void dfs(List<List<Integer>> g, int u, int id, int[] comp) {
        comp[u] = id;
        for (int v : g.get(u)) {
            if (comp[v] == -1) {
                dfs(g, v, id, comp);
            }
        }
    }

    static int[] components(List<List<Integer>> g) {
        int n = g.size();
        int[] comp = new int[n];
        Arrays.fill(comp, -1);
        int cid = 0;
        for (int s = 0; s < n; s++) {
            if (comp[s] == -1) {
                dfs(g, s, cid++, comp);
            }
        }
        return comp;
    }

    public static void main(String[] args) {
        List<List<Integer>> g = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            g.add(new ArrayList<>());
        }
        int[][] e = {{0, 1}, {0, 2}, {1, 2}, {1, 3}, {2, 3}};
        for (int[] x : e) {
            g.get(x[0]).add(x[1]);
            g.get(x[1]).add(x[0]);
        }
        System.out.println(Arrays.toString(components(g)));
    }
    // Input : same graph as the dry run
    // Output: [0, 0, 0, 0, 1]
}`,
    },
    { tab: "Template", panel: "Template", file: "DfsTemplate.java",
      intro: "Explicit stack, so a path of 1e5 cannot blow the JVM. Mark on push.",
      code: `import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class DfsTemplate {

    static int[] components(List<List<Integer>> g) {
        int n = g.size();
        int[] comp = new int[n];
        Arrays.fill(comp, -1);
        int cid = 0;
        ArrayDeque<Integer> st = new ArrayDeque<>();
        for (int s = 0; s < n; s++) {
            if (comp[s] != -1) {
                continue;
            }
            comp[s] = cid;
            st.push(s);
            while (!st.isEmpty()) {
                int u = st.pop();
                for (int v : g.get(u)) {
                    if (comp[v] == -1) {
                        comp[v] = cid;
                        st.push(v);
                    }
                }
            }
            cid++;
        }
        return comp;
    }

    public static void main(String[] args) {
        List<List<Integer>> g = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            g.add(new ArrayList<>());
        }
        int[][] e = {{0, 1}, {0, 2}, {1, 2}, {1, 3}, {2, 3}};
        for (int[] x : e) {
            g.get(x[0]).add(x[1]);
            g.get(x[1]).add(x[0]);
        }
        System.out.println(Arrays.toString(components(g)));
    }
    // Input : same graph
    // Output: [0, 0, 0, 0, 1]
}`,
    },
  ],

  complexity: {
    time: "O(n + m)",
    space: "O(n) for comp[] and the stack / recursion",
    derivation: [
      "<p>Each vertex is marked once and then never re-entered. Each edge is examined a " +
      "constant number of times from its endpoints:</p>",
      "<span class=\"eq\">T = &Theta;(n + m)</span>",
      "<p>Recursive space is O(depth) extra, which is O(n) on a path. The explicit stack is " +
      "the same bound but lives on the heap, which is what you want at n = 1e5.</p>",
    ],
    compare: [
      ["Recursive DFS", "O(n + m)", "O(n) stack frames", "Fine when depth is small"],
      ["Explicit-stack DFS", "O(n + m)", "O(n) heap", "Contest default for n = 1e5"],
      ["BFS components", "O(n + m)", "O(n) queue", "Same answer, also gives distances"],
      ["DSU", "O(m \u03b1(n))", "O(n)", "When the input is just pairs to unify"],
      ["Directed SCCs", "O(n + m)", "O(n)", "Different problem \u2014 Tarjan/Kosaraju"],
    ],
  },

  pitfalls: [
    { title: "One DFS from vertex 0",
      bug: "Reporting a single component, or \"the graph is connected\", after dfs(0) on a " +
        "graph whose other pieces were never started.",
      fix: "The outer loop over unvisited starts is part of the algorithm, not optional glue." },
    { title: "StackOverflowError on a path",
      bug: "Recursive DFS at n = 1e5 on a linked list of vertices. The judge returns RE, not WA.",
      fix: "Explicit ArrayDeque stack, mark on push. Or raise -Xss if the platform allows it " +
        "(most do not)." },
    { title: "Treating directed reachability as undirected components",
      bug: "Running this page's algorithm on a directed graph and calling the paints " +
        "\"components\". A cycle of directed edges is one SCC, but a one-way edge does not " +
        "merge the two ends.",
      fix: "Undirected: this page. Directed mutual reachability: SCC. Directed one-way: " +
        "just DFS/BFS from the source." },
    { title: "Mutating the grid without a visited array, then failing to restore",
      bug: "Flood-fill that writes '0' over '1' is fine if you do not need the grid later. " +
        "If you do, you have destroyed the input.",
      fix: "Either copy, or keep a parallel boolean[][] seen, and only write if the problem " +
        "asked you to mutate." },
    { title: "Skipping the parent incorrectly in an undirected graph",
      bug: "Using a visited[] and also skipping parent, then missing a multi-edge cycle, or " +
        "the opposite: not skipping parent and treating the back-edge to parent as a cycle.",
      fix: "For components, visited is enough \u2014 parent is already visited. For cycle " +
        "detection, skip the parent explicitly; see the next page." },
    { title: "Sharing one visited[] across independent queries without resetting",
      bug: "Second query sees everything already painted.",
      fix: "Reset, or stamp with a query id integer so you can avoid Arrays.fill." },
  ],

  variants: [
    ["Grid flood fill",
      "Implicit 4-neighbour graph. DFS or BFS from each unvisited land cell.",
      "if (in(nr,nc) && grid[nr][nc]=='1' && !seen[nr][nc]) dfs(nr,nc);",
      "LC 200"],
    ["Timestamps and subtree sizes",
      "tin before children, tout after, sz[u] = 1 + sum sz[v]. Ancestry is an interval test.",
      "tin[u]=++timer; for (v) dfs(v); tout[u]=timer; sz[u]+=sz[v];",
      "Euler tour, HLD prep"],
    ["DSU instead of DFS",
      "union(u,v) for every edge, then count roots. Same components, offline-friendly.",
      "for (e : edges) dsu.union(e.u, e.v);",
      "<a href=\"../06-range-queries/dsu.html\">DSU</a>"],
    ["Bipartite components",
      "2-colour while you flood. A clash means that component is not bipartite.",
      "See cycle-detection-and-bipartite.html"],
  ],

  followups: [
    ["DFS or DSU for component count?",
      "<p>If the graph is already a list and you also want to walk it, DFS/BFS is natural. " +
      "If the input is an edge list and you only need the grouping (or you will add edges " +
      "online), DSU is shorter and does not build lists. Both are O(n + m).</p>"],
    ["How do I get the size of each component?",
      "<p>While painting id, increment cnt[id]. After the outer loop, cnt[comp[u]] is the " +
      "size of u's piece. Alternatively return the size from recursive dfs as an int.</p>"],
    ["What does DFS order give me that BFS does not?",
      "<p>A parenthesis structure: every subtree is a contiguous segment of the Euler tour. " +
      "That is why bridges, articulation points, SCCs (Tarjan), and subtree queries start " +
      "from DFS, not BFS.</p>"],
    ["Can I DFS a directed graph to count \"components\"?",
      "<p>You can count weakly connected components by ignoring direction (add both ways). " +
      "Strongly connected components need a second pass or Tarjan's lowlink. Do not mix the " +
      "two words in an interview.</p>"],
  ],

  problems: [
    { name: "Number of Islands", url: "https://leetcode.com/problems/number-of-islands/",
      badge: "lc", tag: "LC 200", level: "Medium", pattern: "Grid flood, count starts" },
    { name: "Number of Provinces", url: "https://leetcode.com/problems/number-of-provinces/",
      badge: "lc", tag: "LC 547", level: "Medium", pattern: "Matrix input, DFS or DSU" },
    { name: "Max Area of Island", url: "https://leetcode.com/problems/max-area-of-island/",
      badge: "lc", tag: "LC 695", level: "Medium", pattern: "Return size from dfs" },
    { name: "Keys and Rooms", url: "https://leetcode.com/problems/keys-and-rooms/",
      badge: "lc", tag: "LC 841", level: "Medium", pattern: "One component reachable from 0?" },
    { name: "Surrounded Regions", url: "https://leetcode.com/problems/surrounded-regions/",
      badge: "lc", tag: "LC 130", level: "Medium", pattern: "Flood from the border, not the interior" },
    { name: "Accounts Merge", url: "https://leetcode.com/problems/accounts-merge/",
      badge: "lc", tag: "LC 721", level: "Medium", pattern: "Emails as vertices, DFS or DSU" },
    { name: "Building Roads", url: "https://cses.fi/problemset/task/1666",
      badge: "gfg", tag: "CSES", level: "Easy", pattern: "Count components, connect roots" },
    { name: "News Distribution", url: "https://codeforces.com/problemset/problem/1167/C",
      badge: "cf", tag: "CF 1167C", level: "Easy", pattern: "Friendship groups, size of each component" },
    { name: "DFS of Graph", url: "https://www.geeksforgeeks.org/problems/depth-first-traversal-for-a-graph/1",
      badge: "gfg", tag: "GfG", level: "Easy", pattern: "Emit recursive order from 0" },
    { name: "ABC 075 C Bridges", url: "https://atcoder.jp/contests/abc075/tasks/abc075_c",
      badge: "atc", tag: "ABC 075C", level: "Medium", pattern: "Drop each edge, recount components" },
  ],

  spoilers: [
    { summary: "Hint for LC 130 &mdash; flood from the border",
      body: "<p>O's that touch the border cannot be captured. DFS/BFS from every border O, " +
        "mark those as safe, then flip every remaining O. Interior-first search is the " +
        "trap: you cannot know if a region is closed until you have seen the border.</p>" },
    { summary: "Hint for CF 1167C &mdash; groups are cliques, not just edges",
      body: "<p>Each group of k friends is a clique. You do not need k choose 2 edges. " +
        "Union everyone in the group to the first member (or DFS after adding those " +
        "edges). The answer for i is the size of i's component.</p>" },
  ],

  recap: {
    bullets: [
      "<strong>One DFS from an unvisited vertex paints one component.</strong> Loop over starts.",
      "<strong>Recursive DFS dies on a path of 1e5</strong> &mdash; keep an explicit stack.",
      "<strong>Time is O(n + m)</strong>, same as BFS; the difference is the tree you build.",
      "<strong>Directed \"components\" are SCCs</strong>, a different algorithm.",
      "<strong>tin/tout turn ancestry into an interval</strong> and unlock every later DFS topic.",
    ],
    oneliner: "for s if unseen: dfs(s, cid++) | mark on enter | explicit stack at n=1e5",
  },
},

/* ============================ 4. cycle-detection-and-bipartite ========= */
{
  id: "cycle-detection-and-bipartite",
  difficulty: "Medium",
  readTime: "24 min",
  tagline: "A back-edge is a cycle, and a clash while 2-colouring is an odd cycle &mdash; the " +
    "same flood that paints a component also answers both questions.",
  tags: ["cycle", "bipartite", "2-color", "P0"],
  prereqs: [
    ["BFS", "bfs.html"],
    ["DFS &amp; Components", "dfs-and-components.html"],
  ],

  why: {
    paras: [
      "Cycle detection is the first graph question that is not just \"visit everything\". " +
      "In an undirected graph a cycle is a back-edge to an already-seen vertex that is not " +
      "your parent. In a directed graph you need three colours, because a finished vertex " +
      "is allowed to be pointed at and an in-progress vertex is not.",
      "Bipartite checking is the same walk with one extra bit. A graph is bipartite if and " +
      "only if it has no odd cycle, if and only if it is 2-colourable. BFS layers give the " +
      "colours for free: odd distances one side, even the other. A neighbour already " +
      "coloured the same as you is the odd cycle.",
      "Interviews hide these as \"can we split into two groups\", \"is the course schedule " +
      "possible\" (that's directed cycle + topo), \"odd-length cycle\", and \"graph coloring " +
      "with 2 colours\". One template covers them if you know which flavour of graph you have.",
    ],
    insight: "Undirected cycle: seen + not parent. Directed cycle: neighbour is grey (in the " +
      "recursion stack). Bipartite: the same BFS, and a colour clash is an odd cycle.",
  },

  recognise: {
    yes: [
      "\"Does this graph contain a cycle?\" undirected or directed",
      "\"Can we split vertices into two groups with all edges between groups?\"",
      "\"Is the graph bipartite / 2-colourable / free of odd cycles?\"",
      "Course schedule, task dependencies: a directed cycle means impossible",
      "A tree check: n vertices and n-1 edges is necessary but not sufficient without acyclicity",
    ],
    no: [
      "Finding the <em>shortest</em> cycle &rarr; BFS from each vertex, not a boolean walk",
      "Counting cycles or listing all of them &rarr; exponential, different problem",
      "Directed mutual reachability &rarr; SCCs; a cycle is a special SCC of size &ge; 2",
      "Odd cycle through a particular vertex only &rarr; BFS layered from that vertex",
    ],
    table: [
      ["Undirected, \"has a cycle?\"", "Back-edge to seen non-parent", "DFS with parent, or n vs n-1 plus connected"],
      ["Directed, \"has a cycle?\"", "Edge to a grey node", "3-colour DFS"],
      ["\"Bipartite?\" / two teams / two colours", "No odd cycle", "BFS 2-colour, clash = no"],
      ["Course schedule / prerequisites", "Directed cycle = impossible", "3-colour or Kahn leftover"],
      ["\"Is it a tree?\"", "Connected + acyclic", "One component and m = n-1"],
      ["Odd-length cycle exists", "Not bipartite", "Same as 2-colour failure"],
      ["<strong>Confused with:</strong> undirected 3-colour DFS",
        "Parent looks like a grey neighbour",
        "Always skip the parent in the undirected case"],
    ],
    constraint: "<code>n, m &le; 2&times;10&#8309;</code>, one O(n + m) walk. Colour arrays " +
      "are <code>int[]</code> with -1 / 0 / 1, not a HashMap. Directed cycle needs the third " +
      "state; two booleans (seen / done) are the same thing.",
  },

  core: {
    heading: "Three checks, one walk each",
    paras: [
      "Undirected: DFS(u, parent). For each neighbour v, ignore v == parent. If v is already " +
      "visited you have a cycle. If the graph may be disconnected, run from every unvisited " +
      "start. A self-loop is a cycle; a double edge is a cycle of length 2.",
      "Directed: colours WHITE / GREY / BLACK. Paint GREY on enter, BLACK on exit. An edge " +
      "to GREY is a back-edge into the recursion stack, hence a directed cycle. An edge to " +
      "BLACK is a cross or forward edge and is legal.",
      "Bipartite: BFS (or DFS) assigning colour[v] = colour[u] xor 1. If v is already " +
      "coloured and colour[v] == colour[u], there is an odd cycle. Each component is " +
      "checked independently; a graph is bipartite iff every component is.",
    ],
    invariantTitle: "The interview sentence",
    invariant: "<p>A graph is bipartite iff it is 2-colourable iff it has no odd cycle. " +
      "BFS layers are the colours. For directed cycles, <em>grey means on the current " +
      "path</em> &mdash; that is the only extra state beyond visited.</p>",
    extra: [
      { kind: "warn", title: "The parent is not a cycle",
        html: "<p>In an undirected list, the edge you just came from is stored backwards. " +
          "Without <code>if (v == p) continue;</code> every edge looks like a cycle. This is " +
          "the single most common false positive on this page.</p>" },
      { kind: "idea", title: "Kahn's leftover is a directed cycle",
        html: "<p>If you run topological Kahn and vertices remain with positive indegree, " +
          "those leftovers sit on directed cycles. Same answer as 3-colour DFS, useful when " +
          "you already have the indegree array for a schedule problem.</p>" },
    ],
  },

  visuals: [
    {
      kind: "mermaid", vizId: "cycGraph",
      h3: "A triangle is an odd cycle",
      intro: "Triangle 0-1-2 plus a pendant 3. The graph has a cycle and is not bipartite. " +
        "2-colouring from 0 paints 1 red, then 2 wants both red and blue.",
      caption: "Undirected triangle. BFS colours 0 even, 1 and 2 odd &mdash; but 1-2 is an " +
        "edge inside the odd layer, so the colouring fails.",
      src: `graph LR
  n0["0 even"] --- n1["1 odd"]
  n0 --- n2["2 clash"]
  n1 --- n2
  n1 --- n3["3 even"]`,
    },
    {
      kind: "array", vizId: "cycColor",
      h3: "colour[] and the BFS queue during 2-colouring",
      intro: "The array is the colour of each vertex: -1 unseen, 0 even, 1 odd. A clash on " +
        "the edge 1-2 is the moment we know the graph is not bipartite.",
      caption: "Queue holds the BFS frontier. When 2 is first painted 1 (from 0), then later " +
        "seen from 1 with colour 1, the clash fires.",
      data: {
        label: "colour[u]  (-1 unseen, 0 / 1 sides)",
        array: [-1, -1, -1, -1],
        indexLabels: ["0", "1", "2", "3"],
        vars: ["u", "queue", "colour[u]"],
        speed: 950,
        frames: [
          { note: "Seed 0 with colour 0. Queue = [0].",
            arr: [0, -1, -1, -1], active: [0], dim: [1, 2, 3],
            values: { u: "seed", queue: "[0]", "colour[u]": 0 } },
          { note: "Pop 0. Paint 1 with colour 1 and push.",
            arr: [0, 1, -1, -1], active: [1], done: [0], dim: [2, 3],
            values: { u: 0, queue: "[1]", "colour[u]": 0 } },
          { note: "Still from 0: paint 2 with colour 1 and push. Queue = [1, 2].",
            arr: [0, 1, 1, -1], active: [2], done: [0], best: [1], dim: [3],
            values: { u: 0, queue: "[1, 2]", "colour[u]": 0 } },
          { note: "Pop 1. Neighbour 0 is the other colour, fine. Neighbour 3 unseen: paint 0, push.",
            arr: [0, 1, 1, 0], active: [3], done: [0, 1], best: [2],
            values: { u: 1, queue: "[2, 3]", "colour[u]": 1 } },
          { note: "Still from 1: neighbour 2 is already colour 1, same as 1. Clash. Odd cycle 0-1-2.",
            arr: [0, 1, 1, 0], active: [1, 2], x: [2], done: [0],
            values: { u: 1, queue: "[2, 3]", "colour[u]": "clash 1-2" } },
          { note: "We can stop. The graph is not bipartite, and the undirected cycle check would have fired on the same back-edge 1-2.",
            arr: [0, 1, 1, 0], x: [1, 2], done: [0, 3],
            values: { u: "fail", queue: "stop", "colour[u]": "not bipartite" } },
          { note: "If the edge 1-2 were missing, colours [0,1,1,0] would be a valid bipartition: {0,3} vs {1,2}.",
            arr: [0, 1, 1, 0], best: [0, 3], done: [1, 2],
            values: { u: "if no 1-2", queue: "[]", "colour[u]": "ok" } },
        ],
      },
    },
  ],

  steps: [
    "<strong>Decide undirected vs directed vs bipartite.</strong> The three checks share a " +
      "walk and differ in the extra state.",
    "<strong>Undirected cycle:</strong> DFS(u, p). Skip v == p. If v is visited, return true.",
    "<strong>Directed cycle:</strong> WHITE/GREY/BLACK. GREY on enter, BLACK on exit, edge " +
      "to GREY is a cycle.",
    "<strong>Bipartite:</strong> BFS. colour[s] = 0. For each edge, if v unseen paint the " +
      "opposite and push; if colour[v] == colour[u] fail.",
    "<strong>Disconnected:</strong> restart from every unvisited vertex. One bad component " +
      "fails the whole graph.",
    "<strong>Self-loops:</strong> undirected or directed, they are cycles. Handle before the " +
      "parent test if the input can contain them.",
    "<strong>Return</strong> the boolean, and optionally the two colour classes or a vertex " +
      "on the cycle.",
  ],

  dryRun: {
    intro: "2-colour BFS on the triangle-plus-pendant. Adjacency: 0:[1,2], 1:[0,2,3], " +
      "2:[0,1], 3:[1].",
    cols: ["u", "colour[u]", "queue", "edge checked", "result"],
    rows: [
      { cells: ["seed", "0", "[0]", "\u2014", "start"],
        action: "colour = [0,-1,-1,-1]" },
      { cells: ["0", "0", "[1,2]", "0-1, 0-2", "paint 1 and 2 as 1"],
        action: "Both children opposite of 0.", change: true },
      { cells: ["1", "1", "[2,3]", "1-0 ok, 1-3 paint 0", "push 3"],
        action: "Parent is the other colour." },
      { cells: ["1", "1", "[2,3]", "1-2", "clash, both colour 1"],
        action: "Odd cycle. Return false.", change: true },
      { cells: ["stop", "\u2014", "\u2014", "\u2014", "not bipartite"],
        action: "No need to pop 2 or 3." },
    ],
  },

  code: [
    { tab: "Undirected cycle", panel: "Undirected", file: "UndirectedCycle.java",
      intro: "Parent-skipping DFS. Returns true if any component contains a cycle.",
      code: `import java.util.ArrayList;
import java.util.List;

public class UndirectedCycle {

    static boolean dfs(List<List<Integer>> g, int u, int p, boolean[] seen) {
        seen[u] = true;
        for (int v : g.get(u)) {
            if (v == p) {
                continue;
            }
            if (seen[v] || dfs(g, v, u, seen)) {
                return true;
            }
        }
        return false;
    }

    static boolean hasCycle(List<List<Integer>> g) {
        boolean[] seen = new boolean[g.size()];
        for (int s = 0; s < g.size(); s++) {
            if (!seen[s] && dfs(g, s, -1, seen)) {
                return true;
            }
        }
        return false;
    }

    public static void main(String[] args) {
        List<List<Integer>> g = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            g.add(new ArrayList<>());
        }
        int[][] e = {{0, 1}, {0, 2}, {1, 2}, {1, 3}};
        for (int[] x : e) {
            g.get(x[0]).add(x[1]);
            g.get(x[1]).add(x[0]);
        }
        System.out.println(hasCycle(g));
    }
    // Input : triangle 0-1-2 plus pendant 3
    // Output: true
}`,
    },
    { tab: "Bipartite BFS", panel: "Bipartite", file: "Bipartite.java",
      intro: "The dry-run 2-colouring. Same graph returns false; drop edge 1-2 and it becomes true.",
      highlight: "16-22",
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
        for (int s = 0; s < n; s++) {
            if (col[s] != -1) {
                continue;
            }
            col[s] = 0;
            q.offer(s);
            while (!q.isEmpty()) {
                int u = q.poll();
                for (int v : g.get(u)) {
                    if (col[v] == -1) {
                        col[v] = col[u] ^ 1;
                        q.offer(v);
                    } else if (col[v] == col[u]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    public static void main(String[] args) {
        List<List<Integer>> g = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            g.add(new ArrayList<>());
        }
        int[][] e = {{0, 1}, {0, 2}, {1, 2}, {1, 3}};
        for (int[] x : e) {
            g.get(x[0]).add(x[1]);
            g.get(x[1]).add(x[0]);
        }
        System.out.println(isBipartite(g));
    }
    // Input : triangle plus pendant
    // Output: false
}`,
    },
    { tab: "Directed 3-colour", panel: "Directed", file: "DirectedCycle.java",
      intro: "WHITE=0, GREY=1, BLACK=2. An edge into GREY is a directed cycle.",
      code: `import java.util.ArrayList;
import java.util.List;

public class DirectedCycle {

    static boolean dfs(List<List<Integer>> g, int u, int[] col) {
        col[u] = 1;
        for (int v : g.get(u)) {
            if (col[v] == 1) {
                return true;
            }
            if (col[v] == 0 && dfs(g, v, col)) {
                return true;
            }
        }
        col[u] = 2;
        return false;
    }

    static boolean hasCycle(List<List<Integer>> g) {
        int[] col = new int[g.size()];
        for (int s = 0; s < g.size(); s++) {
            if (col[s] == 0 && dfs(g, s, col)) {
                return true;
            }
        }
        return false;
    }

    public static void main(String[] args) {
        List<List<Integer>> g = new ArrayList<>();
        for (int i = 0; i < 3; i++) {
            g.add(new ArrayList<>());
        }
        g.get(0).add(1);
        g.get(1).add(2);
        g.get(2).add(0);
        System.out.println(hasCycle(g));
    }
    // Input : directed cycle 0 -> 1 -> 2 -> 0
    // Output: true
}`,
    },
  ],

  complexity: {
    time: "O(n + m)",
    space: "O(n)",
    derivation: [
      "<p>Each check is one walk of the graph. Bipartite BFS examines every edge once per " +
      "direction; 3-colour DFS does the same:</p>",
      "<span class=\"eq\">T = &Theta;(n + m)</span>",
      "<p>You cannot do better in the worst case: an isolated last edge may be the only " +
      "cycle or the only odd cycle, so every edge must be looked at.</p>",
    ],
    compare: [
      ["Undirected DFS + parent", "O(n + m)", "O(n)", "Has-a-cycle"],
      ["Directed 3-colour DFS", "O(n + m)", "O(n)", "Directed cycle / course schedule"],
      ["BFS 2-colour", "O(n + m)", "O(n)", "Bipartite, odd-cycle"],
      ["Kahn leftover", "O(n + m)", "O(n)", "Directed cycle if you already need topo"],
      ["Shortest cycle", "O(n(n + m))", "O(n)", "BFS from every vertex"],
    ],
  },

  pitfalls: [
    { title: "Not skipping the parent",
      bug: "Every undirected edge is reported as a cycle.",
      fix: "Pass p and continue when v == p. For multi-edges, count how many times p appears; " +
        "a second copy is a real cycle." },
    { title: "Two-colour DFS on a directed graph for \"cycle\"",
      bug: "Using bipartite logic to detect directed cycles. A directed triangle is a cycle " +
        "and may still be 2-colourable as an undirected graph if you ignore direction.",
      fix: "Directed cycle = 3 colours. Bipartite = undirected (or the underlying undirected " +
        "graph) 2-colour." },
    { title: "Only checking one component",
      bug: "The odd cycle or the directed cycle sits in a component you never started.",
      fix: "Outer loop over unvisited / white vertices, same as component count." },
    { title: "Treating a back-edge to BLACK as a directed cycle",
      bug: "Two disjoint paths to a finished vertex look like a cycle if you only have " +
        "visited/unvisited.",
      fix: "GREY vs BLACK. Only GREY is on the current path." },
    { title: "m == n-1 implies tree",
      bug: "A 3-cycle plus an isolated vertex has m = n-1 and is not a tree.",
      fix: "Tree = connected and acyclic, or connected and m = n-1. Check both, or check " +
        "one component and m = n-1." },
    { title: "Colour stored as boolean, unseen as false",
      bug: "You cannot tell unseen from colour 0.",
      fix: "int[] col filled with -1, then 0/1. Three-way state, always." },
  ],

  variants: [
    ["Reconstruct a cycle",
      "Keep parent[]. On the back-edge v-u walk parent from u to v and reverse.",
      "At clash: walk parent from u until v, collect, reverse.",
      "CSES Round Trip"],
    ["Odd / even cycle separately",
      "Bipartite failure is an odd cycle. An even cycle can exist in a bipartite graph (any " +
      "C_4).",
      "isBipartite == false  iff  odd cycle exists",
      "Interview wording trap"],
    ["Directed cycle via Kahn",
      "Queue zeros of indegree, peel. If popped < n, leftover vertices are on cycles.",
      "See topological-sort-and-dag-dp.html",
      "LC 207"],
    ["Bipartite matching graphs",
      "If the graph is promised bipartite you can skip the check; if it is not, run this " +
      "page first or matching will silently be wrong.",
      "<a href=\"../08-graphs-advanced/bipartite-matching.html\">Matching</a>"],
  ],

  followups: [
    ["Why is a colour clash an odd cycle?",
      "<p>BFS colours by distance parity from the component start. An edge inside a layer " +
      "connects two vertices at the same distance, and the two paths back to the start plus " +
      "that edge form a closed walk of odd length. An odd closed walk contains an odd cycle.</p>"],
    ["Can a directed graph be \"bipartite\"?",
      "<p>Usually the question is about the underlying undirected graph. A directed graph " +
      "can still have a 2-colouring of vertices so every arc goes between sides; that is " +
      "\"the underlying graph is bipartite\". It says nothing about directed cycles.</p>"],
    ["How do I find any vertex on a directed cycle?",
      "<p>When you see a GREY neighbour v, v is on the cycle. Walk parent / the recursion " +
      "stack from u back to v. Tarjan/Kosaraju give you the whole SCC if you need every " +
      "vertex that sits on some cycle.</p>"],
    ["Is a self-loop an odd cycle?",
      "<p>A self-loop is a cycle of length 1, which is odd, so the graph is not bipartite. " +
      "Detect it as u == v before the parent test. Directed self-loops are also cycles.</p>"],
  ],

  problems: [
    { name: "Is Graph Bipartite?", url: "https://leetcode.com/problems/is-graph-bipartite/",
      badge: "lc", tag: "LC 785", level: "Medium", pattern: "BFS 2-colour, list input" },
    { name: "Possible Bipartition", url: "https://leetcode.com/problems/possible-bipartition/",
      badge: "lc", tag: "LC 886", level: "Medium", pattern: "Dislike edges, same check" },
    { name: "Course Schedule", url: "https://leetcode.com/problems/course-schedule/",
      badge: "lc", tag: "LC 207", level: "Medium", pattern: "Directed cycle or Kahn leftover" },
    { name: "Redundant Connection", url: "https://leetcode.com/problems/redundant-connection/",
      badge: "lc", tag: "LC 684", level: "Medium", pattern: "Undirected cycle, DSU is cleanest" },
    { name: "Graph Valid Tree", url: "https://leetcode.com/problems/graph-valid-tree/",
      badge: "lc", tag: "LC 261", level: "Medium", pattern: "Connected and m = n-1, or DSU no extra union" },
    { name: "Round Trip", url: "https://cses.fi/problemset/task/1669",
      badge: "gfg", tag: "CSES", level: "Medium", pattern: "Reconstruct an undirected cycle" },
    { name: "Cyclic Components", url: "https://codeforces.com/problemset/problem/977/E",
      badge: "cf", tag: "CF 977E", level: "Medium", pattern: "Count components that are a simple cycle" },
    { name: "Detect cycle in an undirected graph",
      url: "https://www.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1",
      badge: "gfg", tag: "GfG", level: "Medium", pattern: "Parent-skip DFS" },
    { name: "Detect cycle in a directed graph",
      url: "https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1",
      badge: "gfg", tag: "GfG", level: "Medium", pattern: "3-colour DFS" },
    { name: "ABC 126 D Even Relation", url: "https://atcoder.jp/contests/abc126/tasks/abc126_d",
      badge: "atc", tag: "ABC 126D", level: "Medium", pattern: "Tree 2-colour by edge-weight parity" },
  ],

  spoilers: [
    { summary: "Hint for LC 207 &mdash; cycle iff the schedule is impossible",
      body: "<p>Build a directed graph of prerequisites. A cycle means a course depends on " +
        "itself through a chain. 3-colour DFS or Kahn: if you cannot peel n vertices, return " +
        "false. LC 210 is the same with the peeled order as the answer.</p>" },
    { summary: "Hint for CF 977E &mdash; a simple cycle component",
      body: "<p>A component is a simple cycle iff every degree is 2 and it is connected with " +
        "at least 3 vertices. Flood each component, track vertex count and whether any " +
        "degree is not 2. Do not accept a theta graph (degrees 3) or a lone edge.</p>" },
  ],

  recap: {
    bullets: [
      "<strong>Undirected cycle:</strong> seen and not the parent.",
      "<strong>Directed cycle:</strong> edge into a GREY vertex.",
      "<strong>Bipartite:</strong> BFS 2-colour; a clash is an odd cycle.",
      "<strong>Outer loop</strong> over components; one failure fails the graph.",
      "<strong>m = n-1 is not a tree</strong> unless the graph is also connected.",
    ],
    oneliner: "undirected: skip parent | directed: grey=on path | bipartite: colour xor 1, clash=odd cycle",
  },
},

/* ============================ 5. topological-sort-and-dag-dp =========== */
{
  id: "topological-sort-and-dag-dp",
  difficulty: "Medium",
  readTime: "26 min",
  tagline: "A DAG has an order where every edge goes forward, and once you have that order " +
    "every path DP is a single scan &mdash; no recursion, no memo table.",
  tags: ["topo sort", "Kahn", "DAG DP", "P0"],
  prereqs: [
    ["DFS &amp; Components", "dfs-and-components.html"],
    ["Cycle Detection &amp; Bipartite", "cycle-detection-and-bipartite.html"],
  ],

  why: {
    paras: [
      "Topological order is the reason DAGs are the friendliest graphs in the toolkit. If " +
      "every edge u &rarr; v means \"u before v\", then a linear scan in that order " +
      "processes every predecessor of v before v itself. Shortest paths, longest paths, " +
      "counts of paths, and \"minimum time to finish tasks\" all collapse to " +
      "<code>for u in topo: for v in g[u]: relax</code>.",
      "Two constructions: Kahn peels vertices of indegree 0 and is the one you write in " +
      "interviews (it also detects cycles). DFS post-order reversed is the one that falls " +
      "out of the 3-colour cycle walk. Both are O(n + m).",
      "DAG DP is the payoff. On a general graph, longest path is NP-hard. On a DAG it is " +
      "the same relaxation as shortest path with min flipped to max, run in topo order. " +
      "Course-schedule II, alien dictionary, and \"number of ways to arrive\" (on a DAG or " +
      "after Dijkstra's DAG of shortest edges) are this pattern.",
    ],
    insight: "If the graph has a directed cycle, no topo order exists. If it does not, " +
      "every path DP is legal in that order: when you reach v, every incoming edge has " +
      "already been relaxed.",
  },

  recognise: {
    yes: [
      "Prerequisites, task order, compilation order, course schedule",
      "\"Longest / shortest / number of paths\" on a directed graph that is acyclic (or a grid " +
        "only moving down/right)",
      "Alien dictionary: letters must respect a partial order",
      "The constraint graph is a DAG of n \le 1e5, so a general DP would be too slow without " +
        "an order",
      "You already have indegrees and a leftover after peeling would mean \"impossible\"",
    ],
    no: [
      "Undirected graphs &mdash; topo order is a directed idea. Use a tree order or BFS layers",
      "Directed graphs that may have cycles and you need shortest paths with positive weights " +
        "&rarr; Dijkstra, not topo",
      "Negative weights with possible negative cycles &rarr; Bellman-Ford",
      "You need a partial order over all pairs, not just a linear extension",
    ],
    table: [
      ["Course order / prerequisites", "Partial order", "Kahn, emit the peel"],
      ["\"Impossible if a cycle\"", "Leftover indegree > 0", "Kahn, check popped == n"],
      ["Longest path in a DAG", "NP-hard on general graphs", "dp[v] = max dp[u]+w over in-edges"],
      ["Count paths s to t in a DAG", "Each incoming path is finished", "dp[v] += dp[u]"],
      ["Grid only down/right", "Implicit DAG", "Row-major is already a topo order"],
      ["Alien dictionary", "Letters, edges from order of words", "Kahn; multiple answers: pick lex"],
      ["<strong>Confused with:</strong> Dijkstra order",
        "Dijkstra orders by distance, not by edges",
        "Topo needs acyclicity; Dijkstra needs non-negative weights"],
    ],
    constraint: "<code>n, m &le; 2&times;10&#8309;</code>. Kahn uses an ArrayDeque of " +
      "current zeros and an <code>int[] indeg</code>. DP values that count paths need " +
      "<code>long</code> and often a modulus.",
  },

  core: {
    heading: "Kahn, DFS-topo, then one DP scan",
    paras: [
      "Kahn: compute indegree of every vertex, push all zeros into a queue, pop u, append u " +
      "to the order, decrement indegree of every out-neighbour, and push those that hit " +
      "zero. If you emit fewer than n vertices, a cycle remains.",
      "DFS-topo: run the 3-colour walk; on exit (paint BLACK) push u onto a stack. Reverse " +
      "the stack. If you ever see a GREY neighbour, abort: no order exists. The two orders " +
      "need not match; any linear extension is valid.",
      "DAG DP: initialise dp[sources] from the problem (0 for longest-path length, 1 for " +
      "path counts). Then <code>for (u : topo) for (v : g[u]) dp[v] = combine(dp[v], " +
      "dp[u] + w)</code>. Because every in-edge of v comes from an earlier topo index, the " +
      "combine sees the final dp[u].",
    ],
    invariantTitle: "The invariant",
    invariant: "<p>In a topo order <code>t[0..n)</code>, every directed edge " +
      "<code>u &rarr; v</code> satisfies <code>index(u) &lt; index(v)</code>. Therefore a " +
      "left-to-right scan has already finalised every predecessor.</p>" +
      "<span class=\"eq\">dp[v] is complete the moment the scan reaches v</span>",
    extra: [
      { kind: "tip", title: "Prefer Kahn when the problem wants \"impossible\"",
        html: "<p>popped &lt; n is a one-line cycle test and you already have the order. " +
          "DFS-topo needs the extra GREY state. Interviewers almost always expect Kahn for " +
          "course schedule.</p>" },
      { kind: "math", title: "Longest path on a DAG",
        html: "<p>Set dp[u] = 0 at vertices with indegree 0 (or -inf if you only want paths " +
          "from a given s). Relax <code>dp[v] = max(dp[v], dp[u] + w(u,v))</code> in topo " +
          "order. The global max is the longest path length. Reconstruct via parent of the " +
          "best relaxation.</p>" },
    ],
  },

  visuals: [
    {
      kind: "mermaid", vizId: "topoGraph",
      h3: "A small DAG",
      intro: "Edges 0&rarr;1, 0&rarr;2, 1&rarr;3, 2&rarr;3. Two valid orders: 0,1,2,3 and " +
        "0,2,1,3. Longest path 0 to 3 has length 2.",
      caption: "Every edge points rightward in either topo order. DAG DP for longest path: " +
        "dp = [0, 1, 1, 2].",
      src: `graph TD
  n0["0  dp 0"] --> n1["1  dp 1"]
  n0 --> n2["2  dp 1"]
  n1 --> n3["3  dp 2"]
  n2 --> n3`,
    },
    {
      kind: "array", vizId: "topoIndeg",
      h3: "indeg[] and Kahn's queue",
      intro: "The array is remaining indegree. The queue holds current zeros. Each pop " +
        "decrements neighbours; 3 hits zero last.",
      caption: "Kahn peels 0 first (only zero), then 1 and 2 in some order, then 3. The " +
        "queue never holds a vertex with leftover incoming edges.",
      data: {
        label: "indeg[u] remaining",
        array: [0, 1, 1, 2],
        indexLabels: ["0", "1", "2", "3"],
        vars: ["u", "queue", "indeg[u]"],
        speed: 900,
        frames: [
          { note: "Initial indegrees from the four edges. Zeros: only 0. Queue = [0].",
            arr: [0, 1, 1, 2], active: [0], dim: [1, 2, 3],
            values: { u: "seed", queue: "[0]", "indeg[u]": 0 } },
          { note: "Pop 0, emit 0. Decrement 1 and 2. Both hit 0 and are pushed.",
            arr: [0, 0, 0, 2], active: [1, 2], done: [0], dim: [3],
            values: { u: 0, queue: "[1, 2]", "indeg[u]": 0 } },
          { note: "Pop 1, emit 1. Decrement 3: indeg[3] = 1. 3 is not ready.",
            arr: [0, 0, 0, 1], active: [3], done: [0, 1], best: [2],
            values: { u: 1, queue: "[2]", "indeg[u]": 0 } },
          { note: "Pop 2, emit 2. Decrement 3: indeg[3] = 0. Push 3.",
            arr: [0, 0, 0, 0], active: [3], done: [0, 1, 2],
            values: { u: 2, queue: "[3]", "indeg[u]": 0 } },
          { note: "Pop 3, emit 3. Queue empty, popped = 4 = n. Order 0,1,2,3 is a valid topo.",
            arr: [0, 0, 0, 0], done: [0, 1, 2, 3],
            values: { u: 3, queue: "[]", "indeg[u]": 0 } },
          { note: "DAG DP longest path in that order: dp[0]=0, dp[1]=dp[0]+1=1, dp[2]=1, dp[3]=max(1,1)+1=2.",
            arr: [0, 1, 1, 2], best: [3], done: [0, 1, 2],
            values: { u: "dp", queue: "scan", "indeg[u]": "len=2" } },
          { note: "If a 3->0 edge existed, 3 would never hit zero and popped would be 3 < 4: cycle, no order, no DAG DP.",
            arr: [0, 0, 0, 1], x: [3], done: [0, 1, 2],
            values: { u: "cycle", queue: "[]", "indeg[u]": "stuck" } },
        ],
      },
    },
  ],

  steps: [
    "<strong>Build a directed adjacency list</strong> and an <code>int[] indeg</code>.",
    "<strong>Push every vertex with indegree 0</strong> into an ArrayDeque.",
    "<strong>While the queue is not empty:</strong> pop u, append u to <code>order</code>.",
    "<strong>For each out-neighbour v:</strong> decrement indeg[v]; if it hits 0, offer v.",
    "<strong>If order.size() &lt; n</strong> return \"cycle / impossible\".",
    "<strong>Allocate dp[]</strong> and set the base (0 / 1 / -inf) on sources.",
    "<strong>Scan u in order</strong> and relax every out-edge into v with min, max, or +=.",
    "<strong>Read dp[target]</strong> or the global best, depending on the question.",
  ],

  dryRun: {
    intro: "Kahn on 0&rarr;1, 0&rarr;2, 1&rarr;3, 2&rarr;3, then longest-path DP (edge weight 1).",
    cols: ["pop u", "order", "indeg after", "queue", "dp after relax from u"],
    rows: [
      { cells: ["seed", "[]", "[0,1,1,2]", "[0]", "[0,-inf,-inf,-inf]"],
        action: "Only 0 is a source." },
      { cells: ["0", "[0]", "[0,0,0,2]", "[1,2]", "[0,1,1,-inf]"],
        action: "Both children get dp = 1.", change: true },
      { cells: ["1", "[0,1]", "[0,0,0,1]", "[2]", "[0,1,1,2]"],
        action: "Relax 1&rarr;3: dp[3] = 2." },
      { cells: ["2", "[0,1,2]", "[0,0,0,0]", "[3]", "[0,1,1,2]"],
        action: "Relax 2&rarr;3: max stays 2." },
      { cells: ["3", "[0,1,2,3]", "[0,0,0,0]", "[]", "[0,1,1,2]"],
        action: "Done. Longest path length 2.", change: true },
    ],
  },

  code: [
    { tab: "Kahn", panel: "Kahn", file: "KahnTopo.java",
      intro: "Returns the order, or null if a cycle remains. This is the interview default.",
      highlight: "18-24",
      code: `import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class KahnTopo {

    static int[] topo(List<List<Integer>> g) {
        int n = g.size();
        int[] indeg = new int[n];
        for (int u = 0; u < n; u++) {
            for (int v : g.get(u)) {
                indeg[v]++;
            }
        }
        ArrayDeque<Integer> q = new ArrayDeque<>();
        for (int u = 0; u < n; u++) {
            if (indeg[u] == 0) {
                q.offer(u);
            }
        }
        int[] order = new int[n];
        int k = 0;
        while (!q.isEmpty()) {
            int u = q.poll();
            order[k++] = u;
            for (int v : g.get(u)) {
                if (--indeg[v] == 0) {
                    q.offer(v);
                }
            }
        }
        return k == n ? order : null;
    }

    public static void main(String[] args) {
        List<List<Integer>> g = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            g.add(new ArrayList<>());
        }
        g.get(0).add(1);
        g.get(0).add(2);
        g.get(1).add(3);
        g.get(2).add(3);
        System.out.println(Arrays.toString(topo(g)));
    }
    // Input : DAG 0->1, 0->2, 1->3, 2->3
    // Output: [0, 1, 2, 3]
}`,
    },
    { tab: "DAG DP", panel: "DAG DP", file: "DagDp.java",
      intro: "Longest path lengths from sources, using the Kahn order. Edge weight 1.",
      code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class DagDp {

    static int[] longest(List<List<Integer>> g, int[] order) {
        int n = g.size();
        int[] dp = new int[n];
        Arrays.fill(dp, Integer.MIN_VALUE / 2);
        for (int u : order) {
            if (dp[u] < 0) {
                dp[u] = 0;               // source (never relaxed)
            }
            for (int v : g.get(u)) {
                dp[v] = Math.max(dp[v], dp[u] + 1);
            }
        }
        return dp;
    }

    public static void main(String[] args) {
        List<List<Integer>> g = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            g.add(new ArrayList<>());
        }
        g.get(0).add(1);
        g.get(0).add(2);
        g.get(1).add(3);
        g.get(2).add(3);
        int[] order = {0, 1, 2, 3};
        System.out.println(Arrays.toString(longest(g, order)));
    }
    // Input : same DAG, unit weights
    // Output: [0, 1, 1, 2]
}`,
    },
    { tab: "Template", panel: "Template", file: "TopoTemplate.java",
      intro: "Self-contained Kahn plus path-count DP from vertex 0, modulo not needed on this size.",
      code: `import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class TopoTemplate {

    static long[] ways(List<List<Integer>> g, int s) {
        int n = g.size();
        int[] indeg = new int[n];
        for (int u = 0; u < n; u++) {
            for (int v : g.get(u)) {
                indeg[v]++;
            }
        }
        ArrayDeque<Integer> q = new ArrayDeque<>();
        for (int u = 0; u < n; u++) {
            if (indeg[u] == 0) {
                q.offer(u);
            }
        }
        int[] order = new int[n];
        int k = 0;
        while (!q.isEmpty()) {
            int u = q.poll();
            order[k++] = u;
            for (int v : g.get(u)) {
                if (--indeg[v] == 0) {
                    q.offer(v);
                }
            }
        }
        long[] dp = new long[n];
        dp[s] = 1;
        for (int i = 0; i < k; i++) {
            int u = order[i];
            for (int v : g.get(u)) {
                dp[v] += dp[u];
            }
        }
        return dp;
    }

    public static void main(String[] args) {
        List<List<Integer>> g = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            g.add(new ArrayList<>());
        }
        g.get(0).add(1);
        g.get(0).add(2);
        g.get(1).add(3);
        g.get(2).add(3);
        System.out.println(Arrays.toString(ways(g, 0)));
    }
    // Input : same DAG, count paths from 0
    // Output: [1, 1, 1, 2]
}`,
    },
  ],

  complexity: {
    time: "O(n + m)",
    space: "O(n + m)",
    derivation: [
      "<p>Kahn visits each vertex once and each edge once (the decrement). DFS-topo is the " +
      "same bound. The DP scan is a third linear pass:</p>",
      "<span class=\"eq\">T = &Theta;(n + m)</span>",
      "<p>That is why longest path is easy on a DAG and hopeless on a general graph: the " +
      "order is what removes the need to try subsets of vertices.</p>",
    ],
    compare: [
      ["Kahn", "O(n + m)", "O(n)", "Interview default, cycle test included"],
      ["DFS post-order reverse", "O(n + m)", "O(n)", "Falls out of 3-colour DFS"],
      ["DAG DP after topo", "O(n + m)", "O(n)", "Shortest / longest / count paths"],
      ["Dijkstra", "O((n+m) log n)", "O(n)", "Positive weights, cycles allowed"],
      ["General longest path", "NP-hard", "\u2014", "Do not try DP-on-subsets unless n \u2264 20"],
    ],
  },

  pitfalls: [
    { title: "Using the order of input vertices as topo order",
      bug: "Relaxing in label order on a DAG that is not already sorted. dp[v] is read " +
        "before its predecessors are final.",
      fix: "Always compute an order (or prove the labels already are one, as in a grid)." },
    { title: "Forgetting the cycle check",
      bug: "Returning a partial order of length &lt; n and then indexing it as if it were " +
        "complete. DAG DP silently ignores the cyclic leftover.",
      fix: "if (k != n) return impossible. Do this before allocating dp." },
    { title: "Building indegree from an undirected list",
      bug: "Every edge increments both ends; every vertex with a neighbour has positive " +
        "indegree and Kahn emits nothing.",
      fix: "Topo is directed. If the problem is undirected, you want a different order." },
    { title: "Initialising path-count dp to 1 on every vertex",
      bug: "Counts paths that start everywhere, not from s. Sources that are not s " +
        "contribute phantom paths.",
      fix: "dp[s] = 1, everyone else 0. Vertices not reachable from s stay 0." },
    { title: "int overflow on path counts",
      bug: "A 40-vertex skinny DAG already exceeds Integer.MAX_VALUE.",
      fix: "long, and apply the modulus in the relaxation if the statement asks." },
    { title: "PriorityQueue instead of ArrayDeque in Kahn",
      bug: "Correct, and required when the problem wants the lexicographically smallest " +
        "order. Otherwise it is a log factor and a surprise if you thought the order was unique.",
      fix: "ArrayDeque for any valid order. PriorityQueue only when the statement asks for " +
        "smallest labels first." },
  ],

  variants: [
    ["Lexicographically smallest order",
      "Replace the queue with a min-heap of current zeros.",
      "PriorityQueue<Integer> q; ... q.offer(v);",
      "Alien dictionary / some CF problems"],
    ["Shortest path on a DAG (any weights)",
      "Same scan, min instead of max. Negative weights are fine because there is no cycle.",
      "dp[v] = min(dp[v], dp[u] + w);",
      "Cheaper than Dijkstra when you know it is a DAG"],
    ["Minimum time to finish tasks",
      "dp[v] = time[v] + max dp[u] over predecessors. Answer is max dp.",
      "LC 2050, parallel courses",
      "Critical-path method"],
    ["Grid down/right",
      "Indices in row-major (or diagonal) order are already topological. Skip Kahn.",
      "<a href=\"../10-dynamic-programming/grid-dp.html\">Grid DP</a>"],
  ],

  followups: [
    ["Is the topo order unique?",
      "<p>Iff at every peel step exactly one vertex has indegree 0 (the remaining graph is " +
      "a single chain of sources). If two zeros sit in the queue you may emit them in " +
      "either order. Uniqueness is equivalent to a Hamiltonian path in the DAG that is " +
      "forced by edges.</p>"],
    ["How is this related to DP on DAGs versus general DP?",
      "<p>General DP needs an explicit state partial order you invent. DAG DP uses the " +
      "graph's own edges as that order. If your DP states are vertices of a DAG you " +
      "already have, never recurse: topo-scan.</p>"],
    ["Can I topo-sort a graph with cycles after contracting SCCs?",
      "<p>Yes. The condensation of a directed graph is always a DAG. That is how you DP " +
      "on \"almost DAGs\": Tarjan, then Kahn on the components. See SCC in the advanced " +
      "graphs module.</p>"],
    ["Kahn vs DFS-topo for reconstruction of a cycle?",
      "<p>Kahn tells you a cycle exists (leftovers) but does not give the cycle. 3-colour " +
      "DFS gives a back-edge. If you need the cycle itself, DFS; if you only need " +
      "\"impossible\", Kahn.</p>"],
  ],

  problems: [
    { name: "Course Schedule", url: "https://leetcode.com/problems/course-schedule/",
      badge: "lc", tag: "LC 207", level: "Medium", pattern: "Kahn leftover = cycle" },
    { name: "Course Schedule II", url: "https://leetcode.com/problems/course-schedule-ii/",
      badge: "lc", tag: "LC 210", level: "Medium", pattern: "Return the Kahn order" },
    { name: "Alien Dictionary", url: "https://leetcode.com/problems/alien-dictionary/",
      badge: "lc", tag: "LC 269", level: "Hard", pattern: "Edges from adjacent words, then Kahn" },
    { name: "Parallel Courses III", url: "https://leetcode.com/problems/parallel-courses-iii/",
      badge: "lc", tag: "LC 2050", level: "Hard", pattern: "DAG DP: time[v] + max over preds" },
    { name: "Number of Ways to Arrive at Destination",
      url: "https://leetcode.com/problems/number-of-ways-to-arrive-at-destination/",
      badge: "lc", tag: "LC 1976", level: "Medium", pattern: "Dijkstra, then count on the shortest-path DAG" },
    { name: "Course Schedule", url: "https://cses.fi/problemset/task/1679",
      badge: "gfg", tag: "CSES", level: "Medium", pattern: "Kahn, print order or IMPOSSIBLE" },
    { name: "Longest Flight Route", url: "https://cses.fi/problemset/task/1680",
      badge: "gfg", tag: "CSES", level: "Medium", pattern: "Longest path 1 to n on a DAG" },
    { name: "Fox And Two Dots", url: "https://codeforces.com/problemset/problem/510/B",
      badge: "cf", tag: "CF 510B", level: "Medium", pattern: "Directed? No — cycle of length \u22654 in a grid" },
    { name: "Topological sort", url: "https://www.geeksforgeeks.org/problems/topological-sort/1",
      badge: "gfg", tag: "GfG", level: "Medium", pattern: "Return any valid order" },
    { name: "ABC 142 F", url: "https://atcoder.jp/contests/abc142/tasks/abc142_f",
      badge: "atc", tag: "ABC 142F", level: "Hard", pattern: "Induced cycle; topo thinking on leftover" },
  ],

  spoilers: [
    { summary: "Hint for CSES Longest Flight Route",
      body: "<p>Only vertices reachable from 1 can be on the answer. Run Kahn (or DFS-topo) " +
        "on the whole graph, then longest-path DP from 1 (dp[1]=1 city, -inf elsewhere so " +
        "you do not start in the middle). If dp[n] is still -inf, IMPOSSIBLE. Reconstruct " +
        "via parent of the best relaxation.</p>" },
    { summary: "Hint for LC 1976 &mdash; ways on the shortest-path DAG",
      body: "<p>First Dijkstra for dist[]. An edge u-v is a shortest-path edge iff " +
        "dist[u] + w = dist[v]. Those edges form a DAG. Then path-count DP from src, or " +
        "accumulate ways during Dijkstra when you hit equality. Mod 1e9+7, use long.</p>" },
  ],

  recap: {
    bullets: [
      "<strong>Kahn peels indegree 0</strong>; popped &lt; n means a cycle.",
      "<strong>Any linear extension is a valid topo order.</strong>",
      "<strong>DAG DP is one scan</strong> of that order: min, max, or += on out-edges.",
      "<strong>Longest path is easy on a DAG</strong> and NP-hard otherwise.",
      "<strong>Path counts need long</strong> (and usually a modulus).",
    ],
    oneliner: "Kahn: peel indeg 0 | k!=n => cycle | then for u in order relax out-edges",
  },
},

/* ================================================= 6. dijkstra ========= */
{
  id: "dijkstra",
  difficulty: "Medium",
  readTime: "26 min",
  tagline: "Non-negative weights turn shortest paths into \"always expand the closest " +
    "unfinished vertex\" &mdash; a priority queue and a <code>dist[]</code> that only ever " +
    "decreases.",
  tags: ["Dijkstra", "priority queue", "shortest path", "P0"],
  prereqs: [
    ["BFS", "bfs.html"],
    ["Graph Representations", "graph-representations.html"],
  ],

  why: {
    paras: [
      "BFS is Dijkstra with every weight equal to 1, and the queue is already sorted by " +
      "distance. The moment weights differ, that free ordering disappears and you must " +
      "always pull the unfinished vertex with the smallest tentative distance. A min-heap " +
      "does that in O(log n) per push.",
      "This is the default weighted shortest-path algorithm in interviews and contests. " +
      "Network delay time, cheapest flights with no negative prices, path-with-minimum-effort " +
      "(after you turn effort into an edge weight), and almost every \"minimum cost to reach\" " +
      "with positive costs is Dijkstra. The two things it cannot do are negative edges and " +
      "\"longest path\".",
      "The implementation that wins in Java is the lazy one: push a new (dist, v) pair every " +
      "time you improve v, and ignore stale heap entries when they pop with a worse key than " +
      "dist[v]. Decrease-key is not in the standard library and you do not need it.",
    ],
    insight: "Because remaining edge weights are non-negative, the first time a vertex is " +
      "popped from the heap with a key equal to dist[u], that distance is final. You may skip " +
      "every later heap entry for u.",
  },

  recognise: {
    yes: [
      "\"Shortest / cheapest path\" and every edge weight is &ge; 0",
      "A grid where moving to a neighbour costs a positive number (effort, time, fuel)",
      "\"Minimum time for a signal to reach all nodes\"",
      "You need distances from one source (or a few, run it several times) to every vertex",
      "Unit weights would be BFS, but they are not unit",
    ],
    no: [
      "Any negative edge &rarr; Bellman-Ford (and a negative cycle is a different answer)",
      "All weights in {0, 1} &rarr; 0-1 BFS is linear and simpler",
      "All weights equal &rarr; BFS",
      "Longest simple path &rarr; NP-hard; only legal on a DAG",
    ],
    table: [
      ["Positive / zero weights, one source", "Non-negative relaxation is safe", "Dijkstra + heap"],
      ["All weights 1", "Heap is wasted", "BFS"],
      ["Weights 0 and 1 only", "Deque, not a heap", "0-1 BFS"],
      ["Negative edges, no neg cycle needed?", "Potential + Dijkstra, or Bellman-Ford", "Johnson / BF"],
      ["All-pairs, n \u2264 400", "Dense DP", "Floyd-Warshall"],
      ["Grid min effort / min max-edge", "Bottleneck path = Dijkstra on the max", "LC 1631"],
      ["<strong>Confused with:</strong> Prim",
        "Prim grows an MST, Dijkstra grows a shortest-path tree",
        "Same heap shape, different relax rule"],
    ],
    constraint: "<code>n &le; 10&#8309;</code>, <code>m &le; 2&times;10&#8309;</code> is the " +
      "binary-heap range: O((n+m) log n) fits. Dense n = 1e4, m = n&sup2; needs a different " +
      "plan (n&sup2; Dijkstra or Floyd if n is smaller). Distances are long if weights sum " +
      "past 2e9.",
  },

  core: {
    heading: "Lazy heap Dijkstra",
    paras: [
      "dist[s] = 0, every other dist[u] = +inf. Push (0, s). While the heap is not empty, " +
      "pop (d, u). If d != dist[u] this entry is stale: skip. Otherwise u is final. For each " +
      "edge u &rarr; v of weight w, if dist[u] + w &lt; dist[v], write the new distance and " +
      "push (dist[v], v).",
      "Stale entries exist because we never decrease a key in the heap; we push a better " +
      "pair instead. The check <code>if (d != dist[u]) continue;</code> makes each vertex " +
      "finalise at most once. Edges are then relaxed only from a final distance, which is " +
      "the proof that later pops cannot improve them given non-negative w.",
      "On a grid, pack the cell id and use the four (or eight) implicit edges. On a graph " +
      "with a second parameter (k stops, fuel left), the state is (vertex, extra) and the " +
      "heap key is still the cost; that is Dijkstra on a product graph.",
    ],
    invariantTitle: "The invariant",
    invariant: "<p>After u is dequeued with d == dist[u], no remaining path to u can be " +
      "shorter, because any other path would have to leave the finished set through a " +
      "non-negative edge and would already have been at least as long.</p>" +
      "<span class=\"eq\">first pop of u with d == dist[u]  \u21d2  dist[u] is optimal</span>",
    extra: [
      { kind: "warn", title: "Negative edges break the argument",
        html: "<p>A later cheap (even negative) edge could improve a finished vertex. The " +
          "algorithm may then return a wrong distance without crashing. If the statement " +
          "does not say weights are non-negative, do not use Dijkstra.</p>" },
      { kind: "tip", title: "Java heap of int[]",
        html: "<p><code>PriorityQueue&lt;int[]&gt;</code> with a comparator on " +
          "<code>a[0] - b[0]</code> overflows. Compare with " +
          "<code>Integer.compare(a[0], b[0])</code>, or pack " +
          "<code>(dist &lt;&lt; 32) | v</code> into a long if dist fits in 32 bits. " +
          "Store dist as long in the array itself.</p>" },
    ],
  },

  visuals: [
    {
      kind: "mermaid", vizId: "dijGraph",
      h3: "Weighted graph, source 0",
      intro: "Edges 0-1:2, 0-2:5, 1-2:1, 1-3:4, 2-3:1. The shortest path to 3 is 0-1-2-3 " +
        "of cost 4, not the direct-looking 0-1-3 of cost 6.",
      caption: "Dijkstra from 0. Tentative distances shrink: 2 is first seen at 5 via 0, " +
        "then improved to 3 via 1.",
      src: `graph LR
  n0["0  dist 0"] -->|"2"| n1["1  dist 2"]
  n0 -->|"5"| n2["2  dist 3"]
  n1 -->|"1"| n2
  n1 -->|"4"| n3["3  dist 4"]
  n2 -->|"1"| n3`,
    },
    {
      kind: "array", vizId: "dijDist",
      h3: "dist[] as the heap pops",
      intro: "The array is current best distance. inf means unseen. Watch 2 improve from 5 " +
        "to 3, and 3 improve from 6 to 4.",
      caption: "Each final pop locks a cell. Stale heap pairs for an already-final vertex " +
        "are skipped. Queue column shows heap keys, not FIFO order.",
      data: {
        label: "dist[u]  (99 = inf)",
        array: [0, 99, 99, 99],
        indexLabels: ["0", "1", "2", "3"],
        vars: ["u", "heap", "dist[u]"],
        speed: 950,
        frames: [
          { note: "Seed dist[0] = 0, heap = [(0,0)].",
            arr: [0, 99, 99, 99], active: [0], dim: [1, 2, 3],
            values: { u: "seed", heap: "[(0,0)]", "dist[u]": 0 } },
          { note: "Pop (0,0). Relax 0-1: dist[1]=2. Relax 0-2: dist[2]=5. Heap = [(2,1),(5,2)].",
            arr: [0, 2, 5, 99], active: [1, 2], done: [0], dim: [3],
            values: { u: 0, heap: "[(2,1),(5,2)]", "dist[u]": 0 } },
          { note: "Pop (2,1). 1 is final. Relax 1-2: 2+1=3 < 5, so dist[2]=3. Relax 1-3: dist[3]=6.",
            arr: [0, 2, 3, 6], active: [2, 3], done: [0, 1],
            values: { u: 1, heap: "[(3,2),(5,2),(6,3)]", "dist[u]": 2 } },
          { note: "Pop (3,2). 2 is final (the later stale (5,2) will be skipped). Relax 2-3: 3+1=4 < 6.",
            arr: [0, 2, 3, 4], active: [3], done: [0, 1, 2],
            values: { u: 2, heap: "[(4,3),(5,2),(6,3)]", "dist[u]": 3 } },
          { note: "Pop (4,3). 3 is final at 4. Path 0-1-2-3.",
            arr: [0, 2, 3, 4], done: [0, 1, 2, 3],
            values: { u: 3, heap: "[stale...]", "dist[u]": 4 } },
          { note: "Stale (5,2) pops: 5 != dist[2]=3, skip. Stale (6,3): 6 != 4, skip. Heap empty.",
            arr: [0, 2, 3, 4], done: [0, 1, 2, 3], dim: [],
            values: { u: "stale", heap: "[]", "dist[u]": "skip" } },
          { note: "Final dist = [0, 2, 3, 4]. First-pop-is-final held for every vertex.",
            arr: [0, 2, 3, 4], best: [0, 1, 2, 3],
            values: { u: "ans", heap: "[]", "dist[u]": 4 } },
        ],
      },
    },
  ],

  steps: [
    "<strong>Allocate <code>long[] dist</code></strong> filled with a sentinel inf " +
      "(<code>Long.MAX_VALUE / 4</code> so additions cannot overflow).",
    "<strong>dist[s] = 0</strong>, push <code>(0, s)</code> into a min-heap.",
    "<strong>Pop (d, u)</strong>. If <code>d != dist[u]</code> skip (stale).",
    "<strong>Otherwise u is final.</strong> Optionally break if u is the only target.",
    "<strong>For each edge u &rarr; v of weight w:</strong> nd = d + w. If nd &lt; dist[v], " +
      "set dist[v] = nd and push (nd, v).",
    "<strong>Do not mark visited before relaxing</strong> &mdash; a vertex may be improved " +
      "several times before it is popped as final.",
    "<strong>Unreachable vertices stay inf.</strong> Convert to -1 if the problem asks.",
  ],

  dryRun: {
    intro: "Lazy Dijkstra from 0 on the five-edge graph. Heap shown as (key, vertex).",
    cols: ["pop", "stale?", "dist after relax", "heap after"],
    rows: [
      { cells: ["(0,0)", "no", "[0, 2, 5, inf]", "[(2,1), (5,2)]"],
        action: "First pop, 0 final.", change: true },
      { cells: ["(2,1)", "no", "[0, 2, 3, 6]", "[(3,2), (5,2), (6,3)]"],
        action: "Improve 2 via 1; set 3 via 1.", change: true },
      { cells: ["(3,2)", "no", "[0, 2, 3, 4]", "[(4,3), (5,2), (6,3)]"],
        action: "Improve 3 via 2." },
      { cells: ["(4,3)", "no", "[0, 2, 3, 4]", "[(5,2), (6,3)]"],
        action: "3 final." },
      { cells: ["(5,2)", "yes", "unchanged", "[(6,3)]"],
        action: "5 != dist[2]." },
      { cells: ["(6,3)", "yes", "unchanged", "[]"],
        action: "Done. dist = [0,2,3,4].", change: true },
    ],
  },

  code: [
    { tab: "Brute (Bellman-Ford n-1)", panel: "Brute", file: "DijBrute.java",
      intro: "Relax every edge n-1 times. Correct for non-negative weights, slower, and the " +
        "right fallback if a negative edge appears.",
      code: `import java.util.Arrays;

public class DijBrute {

    static long[] bf(int n, int[][] edges, int s) {
        long[] dist = new long[n];
        Arrays.fill(dist, Long.MAX_VALUE / 4);
        dist[s] = 0;
        for (int i = 0; i < n - 1; i++) {
            boolean any = false;
            for (int[] e : edges) {
                int u = e[0], v = e[1], w = e[2];
                if (dist[u] + w < dist[v]) {
                    dist[v] = dist[u] + w;
                    any = true;
                }
            }
            if (!any) {
                break;
            }
        }
        return dist;
    }

    public static void main(String[] args) {
        int[][] edges = {{0, 1, 2}, {0, 2, 5}, {1, 2, 1}, {1, 3, 4}, {2, 3, 1},
                {1, 0, 2}, {2, 0, 5}, {2, 1, 1}, {3, 1, 4}, {3, 2, 1}};
        System.out.println(Arrays.toString(bf(4, edges, 0)));
    }
    // Input : undirected weighted graph as pairs both ways
    // Output: [0, 2, 3, 4]
}`,
    },
    { tab: "Optimal Dijkstra", panel: "Optimal", file: "Dijkstra.java",
      intro: "Lazy binary-heap Dijkstra. Stale pops are ignored. Distances are long.",
      highlight: "22-26",
      code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.PriorityQueue;

public class Dijkstra {

    static long[] dijkstra(List<List<int[]>> g, int s) {
        int n = g.size();
        long[] dist = new long[n];
        Arrays.fill(dist, Long.MAX_VALUE / 4);
        PriorityQueue<long[]> pq = new PriorityQueue<>((a, b) -> Long.compare(a[0], b[0]));
        dist[s] = 0;
        pq.offer(new long[] {0, s});
        while (!pq.isEmpty()) {
            long[] cur = pq.poll();
            long d = cur[0];
            int u = (int) cur[1];
            if (d != dist[u]) {
                continue;
            }
            for (int[] e : g.get(u)) {
                int v = e[0], w = e[1];
                long nd = d + w;
                if (nd < dist[v]) {
                    dist[v] = nd;
                    pq.offer(new long[] {nd, v});
                }
            }
        }
        return dist;
    }

    public static void main(String[] args) {
        List<List<int[]>> g = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            g.add(new ArrayList<>());
        }
        int[][] e = {{0, 1, 2}, {0, 2, 5}, {1, 2, 1}, {1, 3, 4}, {2, 3, 1}};
        for (int[] x : e) {
            g.get(x[0]).add(new int[] {x[1], x[2]});
            g.get(x[1]).add(new int[] {x[0], x[2]});
        }
        System.out.println(Arrays.toString(dijkstra(g, 0)));
    }
    // Input : undirected, weights as in the figure, source 0
    // Output: [0, 2, 3, 4]
}`,
    },
    { tab: "Template", panel: "Template", file: "DijkstraTemplate.java",
      intro: "Same algorithm with parent[] for reconstruction. Stop early when the target is final.",
      code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.PriorityQueue;

public class DijkstraTemplate {

    static long[] dijkstra(List<List<int[]>> g, int s, int t, int[] parent) {
        int n = g.size();
        long[] dist = new long[n];
        Arrays.fill(dist, Long.MAX_VALUE / 4);
        Arrays.fill(parent, -1);
        PriorityQueue<long[]> pq = new PriorityQueue<>((a, b) -> Long.compare(a[0], b[0]));
        dist[s] = 0;
        pq.offer(new long[] {0, s});
        while (!pq.isEmpty()) {
            long[] cur = pq.poll();
            long d = cur[0];
            int u = (int) cur[1];
            if (d != dist[u]) {
                continue;
            }
            if (u == t) {
                break;
            }
            for (int[] e : g.get(u)) {
                int v = e[0], w = e[1];
                long nd = d + w;
                if (nd < dist[v]) {
                    dist[v] = nd;
                    parent[v] = u;
                    pq.offer(new long[] {nd, v});
                }
            }
        }
        return dist;
    }

    public static void main(String[] args) {
        List<List<int[]>> g = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            g.add(new ArrayList<>());
        }
        int[][] e = {{0, 1, 2}, {0, 2, 5}, {1, 2, 1}, {1, 3, 4}, {2, 3, 1}};
        for (int[] x : e) {
            g.get(x[0]).add(new int[] {x[1], x[2]});
            g.get(x[1]).add(new int[] {x[0], x[2]});
        }
        int[] parent = new int[4];
        long[] dist = dijkstra(g, 0, 3, parent);
        System.out.println(dist[3] + " parent[3]=" + parent[3]);
    }
    // Input : target 3
    // Output: 4 parent[3]=2
}`,
    },
  ],

  complexity: {
    time: "O((n + m) log n) lazy binary heap",
    space: "O(n + m) plus O(m) heap entries in the worst case",
    derivation: [
      "<p>Each improving relaxation pushes one heap entry. A vertex can improve many times, " +
      "but in the worst case the number of pushes is O(m). Each push/pop is O(log (heap)):</p>",
      "<span class=\"eq\">T = O((n + m) log m) = O((n + m) log n)</span>",
      "<p>Fibonacci heaps with real decrease-key are O(m + n log n) and not worth it in " +
      "Java. On a dense graph the O(n&sup2;) array-Dijkstra (pick the min unfinished with a " +
      "scan) wins for n \u2264 ~3000.</p>",
    ],
    compare: [
      ["Lazy binary heap", "O((n+m) log n)", "O(m) heap", "Default"],
      ["Array Dijkstra", "O(n\u00b2)", "O(n)", "Dense, n \u2264 ~3000"],
      ["BFS", "O(n + m)", "O(n)", "Unit weights"],
      ["0-1 BFS", "O(n + m)", "O(n)", "Weights in {0,1}"],
      ["Bellman-Ford", "O(n m)", "O(n)", "Negative edges"],
    ],
  },

  pitfalls: [
    { title: "Marking visited when you push",
      bug: "The first time you see v is via some path, not necessarily the shortest. Marking " +
        "then freezes a wrong distance (BFS habit).",
      fix: "A vertex becomes final only when it is popped with d == dist[u]. Relax freely " +
        "until then." },
    { title: "int subtraction comparator",
      bug: "<code>(a, b) -&gt; a[0] - b[0]</code> overflows when keys differ by more than " +
        "2^31, silently breaking the heap.",
      fix: "Long.compare / Integer.compare. Never subtract keys." },
    { title: "inf + w overflow",
      bug: "dist[u] is Integer.MAX_VALUE, w is positive, the sum wraps negative and looks " +
        "like a better path.",
      fix: "Use long distances and inf = Long.MAX_VALUE / 4, or skip relaxation when " +
        "dist[u] is still inf." },
    { title: "Negative weights",
      bug: "The first-pop-is-final proof uses w \u2265 0. A negative edge can improve a " +
        "finished vertex.",
      fix: "Refuse Dijkstra. Bellman-Ford or potentials (Johnson) only after you know there " +
        "is no negative cycle." },
    { title: "Using Dijkstra for longest path",
      bug: "Negating weights invents negatives; flipping the heap to max does not work with " +
        "cycles (you would walk forever).",
      fix: "Longest simple path is NP-hard. Only do it on a DAG, in topo order." },
    { title: "Rebuilding the graph as undirected when it is directed",
      bug: "Flights, one-way roads, and \"from a to b with cost w\" are directed. Adding " +
        "the reverse invents paths.",
      fix: "Read the statement. Add one directed edge unless it says bidirectional." },
  ],

  variants: [
    ["Early exit at the target",
      "Once t is popped as final, stop. Other distances may still be unfinished.",
      "if (u == t) break;",
      "Single-pair queries"],
    ["k-parameter product graph",
      "State (u, k) with k = stops left / fuel. Heap key is still cost.",
      "id = u * (K+1) + k;  or a 2D dist[][]",
      "LC 787, LC 2093"],
    ["Bottleneck / min-max edge",
      "Relax with nd = max(dist[u], w) and a min-heap on that key.",
      "nd = Math.max(d, w); if (nd < dist[v]) ...",
      "LC 1631, min-effort path"],
    ["Count shortest paths",
      "When nd == dist[v], ways[v] += ways[u]; when nd < dist[v], ways[v] = ways[u].",
      "Need long and a modulus.",
      "LC 1976"],
  ],

  followups: [
    ["Why can I skip stale heap entries?",
      "<p>When a better dist[u] is written, every older pair (d, u) has d &gt; dist[u]. " +
      "Popping it cannot be the first-final pop (that already happened or will happen with " +
      "the current dist). Ignoring it is exactly as if we had deleted it.</p>"],
    ["Dijkstra vs Prim, in one sentence?",
      "<p>Both grow a tree with a min-heap. Dijkstra's key is distance from s; Prim's key " +
      "is the cheapest edge out of the tree. Same skeleton, different relax, different " +
      "problem.</p>"],
    ["When is O(n squared) Dijkstra better?",
      "<p>When the graph is dense (m ~ n^2) the heap version is O(n^2 log n) because there " +
      "are O(n^2) pushes. Scanning for the closest unfinished vertex is O(n) per vertex, " +
      "O(n^2) total, and has better constants. Use it for n around 2000 with a matrix.</p>"],
    ["How do I reconstruct the path?",
      "<p>Set parent[v] = u at every improving relaxation. Walk from t to s and reverse. " +
      "If several equal-cost parents exist, the last improvement wins; that is still a " +
      "shortest path.</p>"],
  ],

  problems: [
    { name: "Network Delay Time", url: "https://leetcode.com/problems/network-delay-time/",
      badge: "lc", tag: "LC 743", level: "Medium", pattern: "Dijkstra, answer is max dist" },
    { name: "Path With Minimum Effort", url: "https://leetcode.com/problems/path-with-minimum-effort/",
      badge: "lc", tag: "LC 1631", level: "Medium", pattern: "Bottleneck Dijkstra on a grid" },
    { name: "Cheapest Flights Within K Stops", url: "https://leetcode.com/problems/cheapest-flights-within-k-stops/",
      badge: "lc", tag: "LC 787", level: "Medium", pattern: "Product graph (city, stops)" },
    { name: "Path with Maximum Probability", url: "https://leetcode.com/problems/path-with-maximum-probability/",
      badge: "lc", tag: "LC 1514", level: "Medium", pattern: "Max-heap on probability products" },
    { name: "Swim in Rising Water", url: "https://leetcode.com/problems/swim-in-rising-water/",
      badge: "lc", tag: "LC 778", level: "Hard", pattern: "Min-max Dijkstra or binary search + BFS" },
    { name: "Shortest Routes I", url: "https://cses.fi/problemset/task/1671",
      badge: "gfg", tag: "CSES", level: "Medium", pattern: "Directed Dijkstra, long distances" },
    { name: "Dijkstra?", url: "https://codeforces.com/problemset/problem/20/C",
      badge: "cf", tag: "CF 20C", level: "Medium", pattern: "Classic, reconstruct the path" },
    { name: "The Shortest Path", url: "https://www.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1",
      badge: "gfg", tag: "GfG", level: "Medium", pattern: "Implement and return dist[]" },
    { name: "ABC 061 D Score Attack", url: "https://atcoder.jp/contests/abc061/tasks/abc061_d",
      badge: "atc", tag: "ABC 061D", level: "Hard", pattern: "Negative weights: not Dijkstra" },
    { name: "Minimum Cost to Make at Least One Valid Path",
      url: "https://leetcode.com/problems/minimum-cost-to-make-at-least-one-valid-path-in-a-grid/",
      badge: "lc", tag: "LC 1368", level: "Hard", pattern: "0-1 BFS in disguise; Dijkstra also works" },
  ],

  spoilers: [
    { summary: "Hint for LC 1631 &mdash; the cost is a bottleneck, not a sum",
      body: "<p>Effort of a path is the max absolute height-diff of a step. Dijkstra's key " +
        "at a cell is the min achievable bottleneck to that cell: nd = max(d, |h[u]-h[v]|). " +
        "Binary search on the effort plus BFS is the other solution; both are O(RC log).</p>" },
    { summary: "Hint for CF 20C &mdash; reconstruct and watch 64-bit",
      body: "<p>n, m up to 1e5, weights up to 1e6, so dist up to 1e5 * 1e6 needs long. " +
        "parent[v] = u on every improve. If dist[n] is still inf, -1. Else walk n back to 1 " +
        "and reverse. Graph is undirected.</p>" },
  ],

  recap: {
    bullets: [
      "<strong>Non-negative weights only.</strong> First pop with d == dist[u] is final.",
      "<strong>Lazy heap:</strong> push every improve, skip stale pops.",
      "<strong>long distances, Long.compare</strong> &mdash; never subtract heap keys.",
      "<strong>Unit weights &rarr; BFS; {0,1} &rarr; 0-1 BFS.</strong>",
      "<strong>parent[] on improve reconstructs</strong> a shortest path.",
    ],
    oneliner: "pq min dist | skip d!=dist[u] | relax nd=d+w | long + Long.compare | no negative edges",
  },
},

/* ================================================= 7. zero-one-bfs ===== */
{
  id: "zero-one-bfs",
  difficulty: "Medium",
  readTime: "24 min",
  tagline: "When every edge costs 0 or 1, a deque replaces the heap: 0-edges go to the front, " +
    "1-edges to the back, and you recover BFS-linear shortest paths.",
  tags: ["0-1 BFS", "deque", "shortest path", "P1"],
  prereqs: [
    ["BFS", "bfs.html"],
    ["Dijkstra", "dijkstra.html"],
  ],

  why: {
    paras: [
      "0-1 BFS is the missing middle between BFS and Dijkstra. Edges cost only 0 or 1, so " +
      "the next-closest vertex is either at the same distance (a 0-edge) or one further (a " +
      "1-edge). A deque maintains that: push-front on 0, push-back on 1. Distances come out " +
      "sorted, and the whole run is O(n + m).",
      "The pattern shows up more often than the name. \"You may change a grid arrow for " +
      "cost 1 or follow it for free\", \"close a door / use a special road\", \"minimum " +
      "walls to break to reach the exit\" (if breaking costs 1 and walking is free) are all " +
      "0-1 BFS. Writing Dijkstra is correct and a log slower; writing plain BFS that treats " +
      "0-edges as 1 is wrong.",
      "P1 rather than P0 because you must see the reduction: invent the 0-edges and the " +
      "1-edges from the statement. The code afterwards is twenty lines you can reuse.",
    ],
    insight: "A 0-edge does not increase distance, so that neighbour belongs at the front of " +
      "the frontier, just like the rest of the current BFS layer. A 1-edge is the next layer " +
      "and belongs at the back.",
  },

  recognise: {
    yes: [
      "Every edge weight is in {0, 1}",
      "\"Follow the suggested move for free, any other move costs 1\"",
      "Minimum number of walls / obstacles to remove to reach a cell",
      "Two kinds of roads, free and toll-1, and you want the fewest tolls",
      "A grid whose cells push you in a direction (cost 0) or you override (cost 1)",
    ],
    no: [
      "Weights outside {0, 1} &rarr; Dijkstra (or Dial's algorithm if weights are tiny)",
      "All weights 1 &rarr; plain BFS, the deque is pointless",
      "Negative edges &rarr; Bellman-Ford",
      "You need the number of 0-edges on a path rather than the cost &mdash; still 0-1 BFS " +
        "if that <em>is</em> the cost; otherwise a different DP",
    ],
    table: [
      ["Weights in {0, 1} only", "Deque shortest path", "0-1 BFS"],
      ["\"Stay on the arrow for free\"", "Implied 0-edge along the arrow", "Grid 0-1 BFS"],
      ["Min walls to break", "Break = 1, walk open = 0", "0-1 BFS or 0-k BFS"],
      ["Two graphs overlaid, cheap and expensive", "Cheap edges weight 0", "0-1 BFS"],
      ["Weights 0..W with W small", "Dial: buckets, not a heap", "Dial / 0-W BFS"],
      ["General positive weights", "Need a heap", "Dijkstra"],
      ["<strong>Confused with:</strong> BFS that ignores 0-edges",
        "Treating a 0-edge as a layer boundary is wrong",
        "Push-front, or you over-count"],
    ],
    constraint: "<code>n, m &le; 2&times;10&#8309;</code> like BFS. The deque holds each " +
      "improving push; with visited-on-final-pop a vertex can enter twice (once via 1, then " +
      "improved via 0). Still O(n + m). Distances fit in int when they count 1-edges.",
  },

  core: {
    heading: "Deque + the 0-front / 1-back rule",
    paras: [
      "dist[s] = 0, others inf. Offer s at the back. While the deque is not empty, poll from " +
      "the front (u). For each edge u &rarr; v of weight w in {0, 1}: if dist[u] + w &lt; " +
      "dist[v], write dist[v] and push v to the <em>front</em> if w == 0, else to the " +
      "<em>back</em>.",
      "Why this works: the deque stays sorted by dist. A 0-relax produces the same key as u, " +
      "so v belongs with the current layer (front). A 1-relax produces key + 1, the next " +
      "layer (back). That is Dijkstra's \"extract-min\" with only two possible next keys, " +
      "implemented as a deque instead of a heap.",
      "A vertex can be improved after it was first seen (first via a 1-edge, later via a " +
      "0-edge). That is why we compare distances rather than using a boolean visited-on-push. " +
      "Each vertex is still improved O(1) times in a simple graph, so the bound stays linear.",
    ],
    invariantTitle: "The invariant",
    invariant: "<p>The deque holds vertices in non-decreasing <code>dist</code>, and the " +
      "values present differ by at most 1. Therefore poll-first is extract-min, the same " +
      "guarantee Dijkstra gets from a heap.</p>" +
      "<span class=\"eq\">w = 0 \u2192 offerFirst(v);   w = 1 \u2192 offerLast(v)</span>",
    extra: [
      { kind: "warn", title: "Do not mark visited on the first see",
        html: "<p>A 1-edge can reach v first at distance d+1, then a 0-edge from a sibling " +
          "reaches it at distance d. If you froze v on first see, you keep the worse " +
          "distance. Always relax with a strict &lt; on dist[v].</p>" },
      { kind: "tip", title: "This is also how you see \"min changes to follow the grid\"",
        html: "<p>From (r, c) the cell's arrow is a 0-edge; the other three directions are " +
          "1-edges. That single modelling step is LC 1368. After it, the code is the " +
          "template on this page.</p>" },
    ],
  },

  visuals: [
    {
      kind: "mermaid", vizId: "zobGraph",
      h3: "0-edges dashed in the labels",
      intro: "Edges 0-1 weight 0, 0-2 weight 1, 1-3 weight 1, 2-3 weight 0. Shortest path " +
        "0 to 3 costs 1 (0-1-3 or 0-2-3).",
      caption: "0-edges do not increment dist. BFS that treated every edge as 1 would report " +
        "distance 2 for vertex 3 via 0-1-3, which is wrong for the cost.",
      src: `graph LR
  n0["0  dist 0"] -->|"0"| n1["1  dist 0"]
  n0 -->|"1"| n2["2  dist 1"]
  n1 -->|"1"| n3["3  dist 1"]
  n2 -->|"0"| n3`,
    },
    {
      kind: "array", vizId: "zobDist",
      h3: "dist[] and the deque",
      intro: "The array is dist. The variable tracks the deque (front on the left). 0-edges " +
        "jump to the front; 1-edges append.",
      caption: "Vertex 1 is reached at cost 0 and processed before 2. Vertex 3 is first set " +
        "to 1 via 1-3, then a 0-edge from 2 cannot improve it.",
      data: {
        label: "dist[u]  (99 = inf)",
        array: [0, 99, 99, 99],
        indexLabels: ["0", "1", "2", "3"],
        vars: ["u", "deque", "dist[u]"],
        speed: 950,
        frames: [
          { note: "Seed dist[0]=0, deque = [0].",
            arr: [0, 99, 99, 99], active: [0], dim: [1, 2, 3],
            values: { u: "seed", deque: "[0]", "dist[u]": 0 } },
          { note: "Pop 0. 0-edge to 1: dist[1]=0, offerFirst. Deque = [1].",
            arr: [0, 0, 99, 99], active: [1], done: [0], dim: [2, 3],
            values: { u: 0, deque: "[1]", "dist[u]": 0 } },
          { note: "Still from 0. 1-edge to 2: dist[2]=1, offerLast. Deque = [1, 2].",
            arr: [0, 0, 1, 99], active: [2], done: [0], best: [1], dim: [3],
            values: { u: 0, deque: "[1, 2]", "dist[u]": 0 } },
          { note: "Pop 1 (front). 1-edge to 3: dist[3]=1, offerLast. Deque = [2, 3].",
            arr: [0, 0, 1, 1], active: [3], done: [0, 1], best: [2],
            values: { u: 1, deque: "[2, 3]", "dist[u]": 0 } },
          { note: "Pop 2. 0-edge to 3: 1+0 is not < dist[3]=1. No change.",
            arr: [0, 0, 1, 1], done: [0, 1, 2], active: [3],
            values: { u: 2, deque: "[3]", "dist[u]": 1 } },
          { note: "Pop 3. No unused improving edges. Deque empty. dist = [0, 0, 1, 1].",
            arr: [0, 0, 1, 1], done: [0, 1, 2, 3],
            values: { u: 3, deque: "[]", "dist[u]": 1 } },
          { note: "Cost 1 to reach 3. Plain BFS would have said 2. The 0-edge 0-1 is what made the difference.",
            arr: [0, 0, 1, 1], best: [0, 3], done: [1, 2],
            values: { u: "ans", deque: "[]", "dist[u]": 1 } },
        ],
      },
    },
  ],

  steps: [
    "<strong>Model the 0-edges and the 1-edges</strong> from the statement. This is the " +
      "actual problem.",
    "<strong>Allocate dist[]</strong> with inf, set dist[s] = 0, offerLast(s).",
    "<strong>While the deque is not empty</strong>, u = pollFirst().",
    "<strong>For each edge u &rarr; v of weight w in {0,1}:</strong> nd = dist[u] + w.",
    "<strong>If nd &lt; dist[v]</strong>, write dist[v] = nd.",
    "<strong>If w == 0</strong> offerFirst(v), else offerLast(v).",
    "<strong>Do not use a boolean visited-on-push</strong> unless you prove each vertex is " +
      "improved only once (not true in general).",
    "<strong>Read dist[t]</strong>. Inf means unreachable.",
  ],

  dryRun: {
    intro: "0-1 BFS from 0. Edges (u,v,w): (0,1,0), (0,2,1), (1,3,1), (2,3,0).",
    cols: ["u", "edge", "nd vs dist[v]", "deque after", "dist"],
    rows: [
      { cells: ["seed", "\u2014", "\u2014", "[0]", "[0,inf,inf,inf]"],
        action: "Start." },
      { cells: ["0", "0-1 w=0", "0 < inf, front", "[1]", "[0,0,inf,inf]"],
        action: "0-edge to the front.", change: true },
      { cells: ["0", "0-2 w=1", "1 < inf, back", "[1, 2]", "[0,0,1,inf]"],
        action: "1-edge to the back." },
      { cells: ["1", "1-3 w=1", "1 < inf, back", "[2, 3]", "[0,0,1,1]"],
        action: "3 first seen at cost 1." },
      { cells: ["2", "2-3 w=0", "1 == 1, skip", "[3]", "[0,0,1,1]"],
        action: "No improve." },
      { cells: ["3", "\u2014", "done", "[]", "[0,0,1,1]"],
        action: "Answer dist[3] = 1.", change: true },
    ],
  },

  code: [
    { tab: "Brute (Dijkstra)", panel: "Brute", file: "ZobBrute.java",
      intro: "Correct, a log slower. Use this only to check the deque version.",
      code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.PriorityQueue;

public class ZobBrute {

    static int[] dij(List<List<int[]>> g, int s) {
        int n = g.size();
        int[] dist = new int[n];
        Arrays.fill(dist, Integer.MAX_VALUE / 4);
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
        dist[s] = 0;
        pq.offer(new int[] {0, s});
        while (!pq.isEmpty()) {
            int[] cur = pq.poll();
            if (cur[0] != dist[cur[1]]) {
                continue;
            }
            for (int[] e : g.get(cur[1])) {
                int nd = cur[0] + e[1];
                if (nd < dist[e[0]]) {
                    dist[e[0]] = nd;
                    pq.offer(new int[] {nd, e[0]});
                }
            }
        }
        return dist;
    }

    public static void main(String[] args) {
        List<List<int[]>> g = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            g.add(new ArrayList<>());
        }
        g.get(0).add(new int[] {1, 0});
        g.get(0).add(new int[] {2, 1});
        g.get(1).add(new int[] {3, 1});
        g.get(2).add(new int[] {3, 0});
        System.out.println(Arrays.toString(dij(g, 0)));
    }
    // Input : 0-1:0, 0-2:1, 1-3:1, 2-3:0
    // Output: [0, 0, 1, 1]
}`,
    },
    { tab: "Optimal 0-1 BFS", panel: "Optimal", file: "ZeroOneBfs.java",
      intro: "ArrayDeque as a deque. offerFirst on 0, offerLast on 1.",
      highlight: "20-26",
      code: `import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class ZeroOneBfs {

    static int[] zeroOne(List<List<int[]>> g, int s) {
        int n = g.size();
        int[] dist = new int[n];
        Arrays.fill(dist, Integer.MAX_VALUE / 4);
        ArrayDeque<Integer> dq = new ArrayDeque<>();
        dist[s] = 0;
        dq.offerLast(s);
        while (!dq.isEmpty()) {
            int u = dq.pollFirst();
            for (int[] e : g.get(u)) {
                int v = e[0], w = e[1];
                int nd = dist[u] + w;
                if (nd < dist[v]) {
                    dist[v] = nd;
                    if (w == 0) {
                        dq.offerFirst(v);
                    } else {
                        dq.offerLast(v);
                    }
                }
            }
        }
        return dist;
    }

    public static void main(String[] args) {
        List<List<int[]>> g = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            g.add(new ArrayList<>());
        }
        g.get(0).add(new int[] {1, 0});
        g.get(0).add(new int[] {2, 1});
        g.get(1).add(new int[] {3, 1});
        g.get(2).add(new int[] {3, 0});
        System.out.println(Arrays.toString(zeroOne(g, 0)));
    }
    // Input : directed 0-1:0, 0-2:1, 1-3:1, 2-3:0
    // Output: [0, 0, 1, 1]
}`,
    },
    { tab: "Template", panel: "Template", file: "ZeroOneTemplate.java",
      intro: "Grid form: from each cell the suggested direction is a 0-step, the others are 1.",
      code: `import java.util.ArrayDeque;
import java.util.Arrays;

public class ZeroOneTemplate {

    static final int[] DR = {0, 1, 0, -1};
    static final int[] DC = {1, 0, -1, 0};

    /** grid[r][c] in {0,1,2,3} = suggested dir. Cost 0 to follow, 1 to override. */
    static int minChanges(int[][] grid) {
        int R = grid.length, C = grid[0].length;
        int[][] dist = new int[R][C];
        for (int[] row : dist) {
            Arrays.fill(row, Integer.MAX_VALUE / 4);
        }
        ArrayDeque<int[]> dq = new ArrayDeque<>();
        dist[0][0] = 0;
        dq.offerLast(new int[] {0, 0});
        while (!dq.isEmpty()) {
            int[] p = dq.pollFirst();
            int r = p[0], c = p[1];
            for (int k = 0; k < 4; k++) {
                int nr = r + DR[k], nc = c + DC[k];
                if (nr < 0 || nr >= R || nc < 0 || nc >= C) {
                    continue;
                }
                int w = (k == grid[r][c]) ? 0 : 1;
                int nd = dist[r][c] + w;
                if (nd < dist[nr][nc]) {
                    dist[nr][nc] = nd;
                    if (w == 0) {
                        dq.offerFirst(new int[] {nr, nc});
                    } else {
                        dq.offerLast(new int[] {nr, nc});
                    }
                }
            }
        }
        return dist[R - 1][C - 1];
    }

    public static void main(String[] args) {
        int[][] grid = {{1, 1, 3}, {3, 2, 2}, {1, 1, 0}};
        System.out.println(minChanges(grid));
    }
    // Input : 3x3 arrow grid (dirs 0=R,1=D,2=L,3=U)
    // Output: 0
}`,
    },
  ],

  complexity: {
    time: "O(n + m)",
    space: "O(n)",
    derivation: [
      "<p>Each improving relaxation pushes a vertex once more. In a simple 0-1 graph a " +
      "vertex's distance takes at most two distinct values (first see, optional 0-improve), " +
      "so pushes are O(n) and each edge is examined O(1) times:</p>",
      "<span class=\"eq\">T = &Theta;(n + m)</span>",
      "<p>That is the same class as BFS and a log faster than Dijkstra, which is why you " +
      "bother to notice that the weights are only 0 and 1.</p>",
    ],
    compare: [
      ["0-1 BFS", "O(n + m)", "O(n)", "Weights in {0,1}"],
      ["BFS", "O(n + m)", "O(n)", "All weights 1 (or all equal)"],
      ["Dijkstra", "O((n+m) log n)", "O(n)", "Correct here, unnecessary log"],
      ["Dial 0..W", "O(n + m + nW)", "O(n + W)", "Tiny integer weights"],
      ["Bellman-Ford", "O(n m)", "O(n)", "Overkill"],
    ],
  },

  pitfalls: [
    { title: "Pushing 0-edges to the back",
      bug: "The deque is then just a queue and 0-edges wait behind 1-edges. Distances can " +
        "come out too large if you also freeze on first visit.",
      fix: "offerFirst for w == 0, offerLast for w == 1. Always." },
    { title: "Visited-on-push like BFS",
      bug: "First path to v may be a 1-edge; a later 0-edge is shorter and is ignored.",
      fix: "Relax with nd < dist[v]. A vertex may enter the deque more than once." },
    { title: "Using a PriorityQueue \"just in case\"",
      bug: "Correct, slower, and you lose the point of the pattern. Reviewers will ask why.",
      fix: "If weights are only 0 and 1, write the deque. Mention Dijkstra as the fallback." },
    { title: "Treating \"free then pay\" as two BFS passes",
      bug: "Running BFS on 0-edges then BFS on 1-edges in the wrong order misses mixed paths.",
      fix: "One deque interleaves them. That is the algorithm." },
    { title: "Weights that are 0, 1 and 2",
      bug: "The two-layer deque invariant dies. A 2-edge would need a third place to sit.",
      fix: "Dial's algorithm (an array of deques indexed by distance) or Dijkstra." },
    { title: "pollLast by accident",
      bug: "ArrayDeque has pollFirst and pollLast. The wrong one is DFS-ish and breaks order.",
      fix: "Always pollFirst. The only choice is which end you offer onto." },
  ],

  variants: [
    ["0-k BFS / Dial",
      "Weights in 0..W. Keep an array of deques, or a circular buffer of size W+1.",
      "buckets[(d + w) % (W+1)].offer(v);",
      "When W is tiny (W \u2264 50)"],
    ["Min walls to break",
      "Open cell w=0, wall w=1. Want dist[exit] = walls broken.",
      "Same template on a grid.",
      "LC 2290 is 0-k with k up to 1e9 \u2014 different (deque of states by breaks)"],
    ["Two overlaid graphs",
      "Type-A roads weight 0, type-B weight 1. Build one list with the right weights.",
      "g.get(u).add(new int[]{v, type});",
      "CF 1473E is more general (need Dijkstra)"],
    ["Product with a boolean \"used the free edge\"",
      "Sometimes the 0-edge may be used only once. Then the state is (u, used) and edges " +
      "out of used=1 are all 1s.",
      "dist[u][0], dist[u][1]",
      "One-free-flight patterns"],
  ],

  followups: [
    ["Why is the deque sorted?",
      "<p>Inductively it holds keys d and d+1 only, with all the d's at the front. A 0-push " +
      "inserts another d at the front; a 1-push inserts a d+1 at the back. Polling the front " +
      "always yields a smallest key. When the last d is gone the old d+1s become the new d.</p>"],
    ["Is 0-1 BFS just Dijkstra with a faster heap?",
      "<p>Yes. Extract-min is O(1) because the next key is only d or d+1. That is why the " +
      "complexity drops the log. The modelling work is identical to Dijkstra: define states " +
      "and edge weights, then run the right extractor.</p>"],
    ["Can I 0-1-BFS a graph with 0-cycles?",
      "<p>0-cycles do not change distances, but a careless implementation can loop forever " +
      "if you push on &le; instead of &lt;. Strict improvement stops the walk. 0-cycles are " +
      "otherwise harmless.</p>"],
    ["How is this different from 0-1 knapsack?",
      "<p>Only the name. 0-1 knapsack is a DP on items in-or-out. 0-1 BFS is a shortest-path " +
      "algorithm on two weight values. Do not mix the phrases in an interview.</p>"],
  ],

  problems: [
    { name: "Minimum Cost to Make at Least One Valid Path",
      url: "https://leetcode.com/problems/minimum-cost-to-make-at-least-one-valid-path-in-a-grid/",
      badge: "lc", tag: "LC 1368", level: "Hard", pattern: "Arrow = 0, override = 1" },
    { name: "Shortest Path in a Grid with Obstacles Elimination",
      url: "https://leetcode.com/problems/shortest-path-in-a-grid-with-obstacles-elimination/",
      badge: "lc", tag: "LC 1293", level: "Hard", pattern: "State (r,c,k); walking is 1, closer to BFS" },
    { name: "Minimum Obstacle Removal to Reach Corner",
      url: "https://leetcode.com/problems/minimum-obstacle-removal-to-reach-corner/",
      badge: "lc", tag: "LC 2290", level: "Hard", pattern: "Open 0, obstacle 1: textbook 0-1 BFS" },
    { name: "Snakes and Ladders", url: "https://leetcode.com/problems/snakes-and-ladders/",
      badge: "lc", tag: "LC 909", level: "Medium", pattern: "Mostly BFS; snakes are 0-extra forced moves" },
    { name: "0-1 BFS practice", url: "https://www.geeksforgeeks.org/0-1-bfs-shortest-path-binary-graph/",
      badge: "gfg", tag: "GfG", level: "Medium", pattern: "Binary graph tutorial + problems" },
    { name: "Labyrinth", url: "https://codeforces.com/problemset/problem/1063/B",
      badge: "cf", tag: "CF 1063B", level: "Medium", pattern: "Up/down free, left/right cost 1: 0-1 BFS" },
    { name: "Chamber of Secrets", url: "https://codeforces.com/problemset/problem/173/B",
      badge: "cf", tag: "CF 173B", level: "Medium", pattern: "Mirrors as 0/1 turns, classic 0-1 BFS" },
    { name: "Three States", url: "https://codeforces.com/problemset/problem/590/C",
      badge: "cf", tag: "CF 590C", level: "Hard", pattern: "Multi-source 0-1 BFS between regions" },
    { name: "Minimum Path", url: "https://codeforces.com/problemset/problem/1473/E",
      badge: "cf", tag: "CF 1473E", level: "Hard", pattern: "Cousin: extra 0/1 choices, then Dijkstra" },
    { name: "ABC 218 F", url: "https://atcoder.jp/contests/abc218/tasks/abc218_f",
      badge: "atc", tag: "ABC 218F", level: "Hard", pattern: "Shortest path after deleting one edge" },
    { name: "Labyrinth", url: "https://cses.fi/problemset/task/1193",
      badge: "gfg", tag: "CSES", level: "Easy", pattern: "Plain BFS baseline before 0-1 variants" },
    { name: "Minimum Knight moves ++",
      url: "https://www.geeksforgeeks.org/problems/minimum-cost-path3833/1",
      badge: "gfg", tag: "GfG", level: "Medium", pattern: "Grid costs: Dijkstra, contrast with 0-1" },
  ],

  spoilers: [
    { summary: "Hint for LC 2290 &mdash; the cost is the number of 1-cells you step on",
      body: "<p>Moving into a 0-cell costs 0; moving into a 1-cell costs 1. That is exactly " +
        "0-1 BFS on the grid graph. dist[R-1][C-1] is the minimum obstacles removed (you " +
        "\"remove\" an obstacle by paying 1 to step on it). Do not binary-search the number " +
        "of removals unless you want a slower solution.</p>" },
    { summary: "Hint for LC 1368 &mdash; the arrow is a 0-edge",
      body: "<p>From (r, c) following grid[r][c] is weight 0; the other three directions are " +
        "weight 1. Run the template. Dijkstra also passes; the intended solution is the " +
        "deque. Start cell costs 0 even if you later leave it against its arrow.</p>" },
  ],

  recap: {
    bullets: [
      "<strong>Weights in {0, 1} only</strong> &mdash; otherwise Dijkstra or Dial.",
      "<strong>offerFirst on 0, offerLast on 1, pollFirst always.</strong>",
      "<strong>Relax with nd &lt; dist[v]</strong>; do not freeze on first see.",
      "<strong>The deque stays sorted</strong> with keys d and d+1 only.",
      "<strong>Modelling is the hard part:</strong> name the 0-edges from the statement.",
    ],
    oneliner: "deque: w==0 offerFirst else offerLast | pollFirst | relax nd<dist[v] | O(n+m)",
  },
},

];

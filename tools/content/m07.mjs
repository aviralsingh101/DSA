/* Module 07 — Graphs: Core */

import { pack, lc, cf } from "./pack.mjs";

export const topics = [

/* ============================================ 1. graph-representations == */
pack({
  id: "graph-representations",
  difficulty: "Easy",
  readTime: "24 min",
  tagline: "Pick the encoding before the algorithm: adjacency list, matrix, or edge list " +
    "are not interchangeable, and the wrong one turns an <code>O(n + m)</code> walk into an " +
    "<code>O(n&sup2;)</code> timeout.",
  tags: ["graphs", "adjacency list", "adjacency matrix", "P0"],
  prereqs: [
    ["Complexity Analysis", "../00-foundations/complexity-analysis.html"],
    ["Java for DSA", "../00-foundations/java-for-dsa.html"],
  ],
  why: [
    "You are handed a city map as a plain list of 200000 road segments, each one printed as a " +
      "pair of junction numbers such as <code>17 4093</code>, and you are asked which junctions " +
      "a delivery van starting at junction 0 can eventually reach. Before you can search " +
      "anything you have to decide how those pairs sit in memory, because a bare list of pairs " +
      "cannot tell you which roads leave junction 17 without reading all 200000 of them. If your " +
      "search asks that question once for each of the 100000 junctions, you have signed up for " +
      "roughly <code>2&times;10&#185;&#8304;</code> reads, and a judge that gives you two seconds " +
      "cuts you off after about one percent of the work. The cure is not a cleverer search. It " +
      "is storing the very same edges so that \"the roads leaving 17\" is already gathered in one " +
      "place before the search starts.",
    "Three encodings are in common use, and each makes a different question cheap. An " +
      "<em>adjacency list</em> keeps, for every vertex <code>u</code>, a small growable array of " +
      "the vertices you can step to from <code>u</code>, so listing the neighbours of " +
      "<code>u</code> costs exactly <code>deg(u)</code> reads &mdash; <code>deg(u)</code>, the " +
      "<em>degree</em> of <code>u</code>, being the number of edges that touch it. An " +
      "<em>adjacency matrix</em> is an <code>n &times; n</code> table of booleans where the cell " +
      "in row <code>u</code>, column <code>v</code> is true exactly when that edge exists, so " +
      "\"is there a road from 17 to 4093?\" is a single array read, but listing the neighbours of " +
      "17 means scanning all <code>n</code> cells of row 17 even if only three of them are true. " +
      "An <em>edge list</em> is the raw pairs kept exactly as they arrived; it supports no lookup " +
      "at all, and is the right choice only when the whole algorithm is one sorted sweep over " +
      "every edge.",
    "The input limits usually make the decision for you, so read them first. At " +
      "<code>n = 10&#8309;</code> a matrix wants <code>10&#185;&#8304;</code> cells, which is ten " +
      "gigabytes even at one byte per cell, so it cannot be allocated at all; the adjacency list " +
      "for the same graph stores <code>n + 2m</code> integers, about half a million of them for " +
      "<code>m = 2&times;10&#8309;</code> undirected edges, which is a few megabytes. At " +
      "<code>n = 400</code> the matrix is only 160000 cells and the constant-time edge test " +
      "becomes worth paying for. The word that names the split is <em>sparse</em>: a graph is " +
      "sparse when the edge count <code>m</code> grows roughly like <code>n</code> rather than " +
      "like <code>n&sup2;</code>, and essentially every graph a contest hands you is sparse.",
    "Two problems come from the statement rather than from the algorithm, and both cause more " +
      "wrong answers on easy graph tasks than the algorithms do. First, judges usually number " +
      "vertices from 1 to <code>n</code> while Java arrays start at 0, so either allocate " +
      "<code>n + 1</code> slots and leave slot 0 unused, or subtract one from every label as you " +
      "read it &mdash; choose one convention and never mix them, because half-converted input " +
      "either throws an <code>ArrayIndexOutOfBoundsException</code> at index <code>n</code> or " +
      "leaves a phantom vertex 0 that no edge ever touches. Second, when the statement says the " +
      "roads are two-way, the pair <code>u v</code> has to be inserted twice, once into the list " +
      "of <code>u</code> and once into the list of <code>v</code>; a single insert is the usual " +
      "reason a perfectly correct search reports that half the map is unreachable.",
  ],
  insight: "Store the graph so that the question your algorithm asks most often is the cheap " +
    "one. Nearly every algorithm in this module walks the neighbours of a vertex, which is why " +
    "the adjacency list &mdash; one array of neighbours per vertex &mdash; is the default " +
    "encoding, and why the matrix only earns its <code>n&sup2;</code> cells when <code>n</code> " +
    "is a few hundred and you keep asking whether one specific pair is joined.",
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
  constraint: "<code>n, m &le; 2&times;10&#8309;</code> is the usual sparse-graph signature " +
    "and it forces an adjacency list: an <code>n &times; n</code> matrix would ask for " +
    "<code>4&times;10&#185;&#8304;</code> cells and cannot be allocated. When the statement " +
    "instead gives <code>n &le; 400</code>, the matrix fits in a couple of megabytes and the " +
    "constant-time edge test becomes the reason to pick it. Store vertex ids as " +
    "<code>int</code>; store path-weight sums as <code>long</code> once a weight can reach " +
    "<code>10&#8313;</code>.",
  core: [
    "The default encoding is an <em>adjacency list</em>: an outer list of length " +
      "<code>n</code> whose slot <code>u</code> holds a growable list of the vertices you can " +
      "step to from <code>u</code>. You start with <code>n</code> empty inner lists, then for " +
      "each input pair <code>(u, v)</code> you run <code>g.get(u).add(v)</code>. If the " +
      "statement says the roads are two-way you immediately run <code>g.get(v).add(u)</code> " +
      "as well, in the same loop body, because a later walk from <code>v</code> has no other " +
      "way to discover that edge. A weighted edge stores a small pair " +
      "<code>int[]{v, w}</code> (or a tiny <code>Edge</code> type) instead of a bare integer, " +
      "so the weight travels with the neighbour and Dijkstra never has to look it up elsewhere.",
    "The other two encodings exist for different questions. An <em>adjacency matrix</em> is " +
      "an <code>n &times; n</code> table, <code>boolean[][]</code> for presence or " +
      "<code>int[][]</code> with a huge sentinel off the edge, and the cell " +
      "<code>g[u][v]</code> answers \"is this pair joined?\" in one read. An <em>edge list</em> " +
      "is just the raw triples kept in an array so you can sort them once, which is what " +
      "Kruskal needs and what a neighbour-walk does not. Two Java habits sit next to the " +
      "choice of encoding. If the judge numbers vertices from 1 to <code>n</code>, allocate " +
      "<code>n + 1</code> slots and leave slot 0 unused rather than mixing conversions. And " +
      "never write <code>new ArrayList[n]</code>: loop <code>g.add(new ArrayList&lt;&gt;())</code> " +
      "so every slot is a real list before the first insert. A grid stays implicit: from a " +
      "cell <code>(r, c)</code> you try four deltas and reject any neighbour that walks off " +
      "the board, without ever allocating <code>RC</code> lists.",
    "Walk the five-node sample that the visual uses. The edges arrive as " +
      "<code>0-1</code>, <code>0-2</code>, <code>1-2</code>, <code>1-3</code>, " +
      "<code>2-4</code>, all two-way. After the first insert the lists are " +
      "<code>g[0]=[1]</code> and <code>g[1]=[0]</code>. After <code>0-2</code> you have " +
      "<code>g[0]=[1,2]</code> and <code>g[2]=[0]</code>. The triangle closes with " +
      "<code>1-2</code>, then <code>1-3</code> hangs a leaf off 1, then <code>2-4</code> " +
      "hangs a leaf off 2. The finished degrees are <code>[2, 3, 3, 1, 1]</code>, which is " +
      "exactly the number of times each vertex appears as an endpoint, and a walk that " +
      "starts at 0 now sees 1 and 2 in a handful of reads instead of scanning all five " +
      "input pairs again.",
  ],
  extra: [
    {
      kind: "key",
      title: "Undirected means two writes in the same loop",
      html: "<p>The pair <code>u v</code> is one road with two ends. If you insert it only into " +
        "<code>g[u]</code>, a perfectly correct BFS that starts at <code>v</code> reports that " +
        "<code>u</code> is unreachable. Write both directions before you read the next line of input.</p>",
    },
    {
      kind: "tip",
      title: "Grids never become adjacency lists",
      html: "<p>A <code>1000 &times; 1000</code> maze has a million cells and about four million " +
        "possible steps. Generating the four neighbours from <code>(r, c)</code> with a pair of " +
        "delta arrays costs a few arithmetic operations and no extra heap objects.</p>",
    },
  ],
  invariant: "<p>After the build, walking <code>g.get(u)</code> yields each outgoing neighbour " +
    "exactly once (twice only if the input itself repeated that edge).</p>" +
    "<span class=\"eq\">undirected (u, v) &rArr; two inserts; 1-based input &rArr; length n+1</span>" +
    "<p>In plain words, the list hanging off a vertex is the complete answer to \"where can I " +
    "step from here?\", so a later search never has to reread the original pairs, and a missing " +
    "reverse insert is indistinguishable from a missing road.</p>",
  arrayLabel: "deg[u] after inserting the sample edges",
  array: [2, 3, 3, 1, 1],
  indexLabels: ["0", "1", "2", "3", "4"],
  vars: ["edge", "u-v", "dir", "deg"],
  vizTitle: "Building an undirected list on 5 nodes",
  dryIntro: "Five undirected edges land one at a time into empty neighbour lists. Watch each " +
    "degree rise twice, once at each endpoint, which is the whole reason the reverse insert exists.",
  frames: [
    { note: "Five vertices start with empty neighbour lists, so every degree is still 0 and no walk can leave any vertex yet.",
      values: { edge: 0, "u-v": "\u2014", dir: "\u2014", deg: "[0,0,0,0,0]" } },
    { note: "The first two-way road 0-1 is written into both lists, so g[0] holds 1, g[1] holds 0, and those two degrees become 1.",
      active: [0, 1],
      values: { edge: 1, "u-v": "0-1", dir: "both", deg: "[1,1,0,0,0]" } },
    { note: "Road 0-2 is inserted both ways, so vertex 0 now has two neighbours and the triangle 0-1-2 has two of its three sides.",
      active: [0, 2],
      values: { edge: 2, "u-v": "0-2", dir: "both", deg: "[2,1,1,0,0]" } },
    { note: "Road 1-2 closes the triangle: each of 0, 1 and 2 now stores the other two corners, and those three degrees sit at 2.",
      active: [1, 2],
      values: { edge: 3, "u-v": "1-2", dir: "both", deg: "[2,2,2,0,0]" } },
    { note: "Road 1-3 hangs a leaf off vertex 1, so the list at 1 grows to three neighbours and vertex 3 appears for the first time.",
      active: [1, 3],
      values: { edge: 4, "u-v": "1-3", dir: "both", deg: "[2,3,2,1,0]" } },
    { note: "Road 2-4 hangs the last leaf. Degrees finish at [2, 3, 3, 1, 1], and this list is the encoding every later page will walk.",
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
    "<strong>Read n and m, then pick the encoding from those two numbers.</strong> A list is the default once <code>n</code> is in the tens of thousands, because an <code>n &times; n</code> table cannot be allocated; a matrix earns its keep only when <code>n</code> is a few hundred and you will ask \"is this pair an edge?\" many times.",
    "<strong>Allocate n empty neighbour lists, or n+1 if the judge numbers from 1.</strong> Leaving slot 0 unused is cheaper than mixing conversions later, and every later index into <code>g</code> then matches the printed label.",
    "<strong>For each edge (u, v[, w]), write v into g[u], and if the graph is undirected write u into g[v] in the same body.</strong> The reverse insert is what makes a walk starting at v able to see u; forgetting it is the usual reason half the map looks unreachable.",
    "<strong>Pick one 1-based convention and never mix it.</strong> Either allocate length <code>n+1</code> or subtract one from every label as you read it, because a half-converted vertex either throws at index <code>n</code> or sits in slot 0 as a ghost nobody reaches.",
    "<strong>Leave grids implicit: from (r, c) try four or eight deltas and reject anything off the board.</strong> Materialising <code>RC</code> lists for a maze spends memory and object headers on neighbours you can compute in a few additions.",
    "<strong>If the algorithm only sorts the edges once, keep an int[][] edge list and skip the adjacency structure.</strong> Kruskal never asks for the neighbours of a vertex, so building lists is wasted work on that page.",
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
      "<p>Building a list writes each directed edge once and each undirected edge twice, so the number of stored integers is <code>n</code> list headers plus a constant times <code>m</code>. Walking every neighbour of every vertex then costs one scan of those stored integers, which is <code>n + 2m</code> reads on an undirected graph.</p>",
      "<span class=\"eq\">list: S = n + &Theta;(m); matrix: S = n&sup2; regardless of m</span>",
      "<p>A matrix always occupies <code>n&sup2;</code> cells, about <code>10&#185;&#8304;</code> at <code>n = 10&#8309;</code>, which is why it is illegal at the usual limits. Listing the neighbours of one vertex on a matrix scans a whole row of <code>n</code> cells even if only three are true, so Dijkstra on a matrix is <code>O(n&sup2;)</code> even without a heap. At <code>n = 400</code> that is 160000 cells and the constant-time edge test is the thing you are buying.</p>",
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
      bug: "The input says the roads are two-way, but the loop only writes v into g[u]. A later BFS that starts at v never sees u, so a correct search reports that half the map is unreachable.",
      fix: "In the same loop body write both directions for undirected input, and write once only when the statement says the edges are directed. A two-line print of g.get(u) and g.get(v) after the first edge catches it." },
    { title: "1-based vs 0-based",
      bug: "The judge prints vertices 1..n and the array has length n, so the largest label throws ArrayIndexOutOfBounds, or you leave a phantom vertex 0 that no edge ever touches.",
      fix: "Allocate n+1 and ignore slot 0, or subtract one from every label as you read it. Pick one convention and use it in every later index, including the answer you print." },
    { title: "new ArrayList[n] generic array",
      bug: "The generic-array warning is easy to suppress and then forget to fill each slot, so the first g[u].add throws a NullPointerException that looks like a graph bug.",
      fix: "Build a List of lists and loop g.add(new ArrayList<>()) so every slot is a real list before the first insert. That also avoids the unchecked warning." },
    { title: "Materialising a grid graph",
      bug: "A maze with R rows and C columns is turned into RC vertices and 4RC allocated edges. The object headers alone can cost tens of megabytes and a constant-factor timeout.",
      fix: "Keep the grid as the grid. From (r, c) add the four deltas, reject anything off the board or blocked, and never build an adjacency list for a maze." },
    { title: "Self-loops and multi-edges",
      bug: "A test that says \"m = n-1 so it is a tree\" is wrong if the input allowed a self-loop or a repeated pair, because those inflate the edge count without connecting a new vertex.",
      fix: "Read whether the statement allows loops and parallel edges. Skip u==v when they are noise, and treat a second copy of u-v as a multi-edge if the problem cares about multiplicity." },
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
      "<p>When the graph is dense, meaning m is on the order of n&sup2;/2, a boolean matrix is n&sup2; bits or bytes and a list of Integer objects is much fatter per stored edge. At n = 400 the matrix is 160000 cells and usually wins. At n = 10&#8309; the matrix cannot be allocated at all, so the question does not arise: you use a list because it is the only encoding that fits.</p>"],
    ["How do you test edge existence on a list quickly?",
      "<p>Membership on a list is O(deg(u)), which is fine when you only ever iterate neighbours. If you truly need a yes/no test, sort each neighbour list and binary search, or keep a HashSet of packed longs ((long)u &lt;&lt; 32 | v). BFS and DFS never ask that question: they walk g.get(u) and do not probe arbitrary pairs.</p>"],
    ["Directed vs undirected in the rest of this module?",
      "<p>Every later page assumes you stored the directions the statement named. BFS, DFS and components walk whatever you inserted, so a missing reverse edge silently splits the graph. Cycle detection and bipartite tests are different algorithms on directed graphs, covered on their own page. In interviews, treat the graph as undirected unless the statement says otherwise.</p>"],
    ["Why not Map&lt;Integer,List&lt;Integer&gt;&gt;?",
      "<p>When vertices are already numbered 0..n-1, an ArrayList of lists is a direct index and has no hash overhead. A map is the right tool only when labels are sparse or are not integers at all: word-ladder strings, chess squares packed into ints, or a huge id space where only a few nodes appear. Convert those labels to 0..k-1 at the boundary if you can.</p>"],
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
  readTime: "24 min",
  tagline: "The only shortest-path algorithm you need on an unweighted graph: a queue, a " +
    "<code>dist</code> array, and the rule that the first time you see a vertex is the closest time.",
  tags: ["BFS", "queue", "shortest path", "P0"],
  prereqs: [["Graph Representations", "graph-representations.html"]],
  why: [
    "You are standing at junction 0 on a city map of 100000 junctions and 200000 two-way " +
      "roads, and every road takes the same time to drive. You need the fewest roads that " +
      "reach junction 4093. Trying every walk is hopeless: even a branching of two new roads " +
      "per step explodes, and a judge that gives you two seconds will not wait while you " +
      "enumerate them. What you want is a walk that visits junctions in order of how many " +
      "roads they sit from 0, so the first time you arrive at 4093 you already hold the " +
      "shortest answer and can stop.",
    "That walk is <em>breadth-first search</em>, usually shortened to BFS. It keeps a FIFO " +
      "queue &mdash; first in, first out, the same structure as a line at a ticket window " +
      "&mdash; of junctions that have been reached but whose neighbours have not yet been " +
      "looked at. Because every road has the same weight, a walk that uses fewer roads is " +
      "always cheaper than a walk that uses more. BFS therefore expands layer 0, then layer " +
      "1, then layer 2, and the first time a junction enters the queue it has been reached " +
      "by a walk with the fewest possible roads. That is why BFS is a shortest-path algorithm " +
      "only on unweighted edges (or edges that all share one positive weight you can treat as 1).",
    "The same first-visit rule is also why BFS dies the moment the roads have different " +
      "lengths. Suppose 0 is joined to 2 by one road of length 100, and also joined to 2 by " +
      "the two-road walk 0-1-2 whose roads each have length 1. BFS reaches 2 along the single " +
      "road, records distance 1, and never looks at 2 again, so it reports 1 (or 100 if you " +
      "stored weights) and misses the cheaper total of 2. Different positive weights need " +
      "Dijkstra; weights that are only 0 and 1 need 0-1 BFS. The signal in a real statement " +
      "is \"minimum number of moves / operations / roads\" together with limits such as " +
      "<code>n, m &le; 2&times;10&#8309;</code> or a grid of a thousand rows, and no mention " +
      "of unequal costs.",
  ],
  insight: "On unweighted edges the first time BFS reaches a vertex is via a shortest path, " +
    "because a walk with fewer roads is always cheaper. Mark the vertex visited in the same " +
    "breath as you push it, so each vertex enters the queue once and the queue stays linear.",
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
  constraint: "<code>n, m &le; 2&times;10&#8309;</code> or a grid <code>R, C &le; 10&#179;</code> " +
    "is the usual BFS prompt: one linear walk, about a million steps, fits comfortably in two " +
    "seconds. Mark a vertex on the push, not on the pop, so the queue holds at most <code>n</code> " +
    "entries rather than one copy per incoming edge. If the statement then gives unequal " +
    "positive weights, this page is the wrong tool even when those limits look identical.",
  core: [
    "You need two structures. <code>dist[u]</code> holds the fewest edges from the source " +
      "<code>s</code> to <code>u</code>, and it starts at <code>-1</code> everywhere, which " +
      "is how you say \"unseen\". An <code>ArrayDeque</code> holds the vertices that have " +
      "been reached but whose neighbours have not yet been scanned; this must be a FIFO " +
      "queue, not a stack, because the order of the pops is the order of the distances. You " +
      "set <code>dist[s] = 0</code>, push <code>s</code>, and then repeat: pop <code>u</code>, " +
      "and for each neighbour <code>v</code> whose <code>dist[v]</code> is still <code>-1</code> " +
      "write <code>dist[v] = dist[u] + 1</code> and push <code>v</code>. That write is the " +
      "first place this module <em>relaxes an edge</em> &mdash; asking whether the walk that " +
      "just reached <code>u</code>, plus the one edge <code>u &rarr; v</code>, is a cheaper " +
      "way to <code>v</code> than anything recorded so far. On unit weights the answer is " +
      "yes exactly once, the first time, and never again.",
    "Marking on the push is load-bearing. If you wait until you pop <code>v</code> to set " +
      "<code>dist[v]</code>, every incoming edge can enqueue its own copy of <code>v</code>, " +
      "and on a dense graph the queue grows toward <code>n&sup2;</code> entries. Setting " +
      "<code>dist[v]</code> in the same breath as <code>q.add(v)</code> makes \"already seen\" " +
      "and \"already queued\" the same test. Multi-source BFS is the same loop with a longer " +
      "start: push every source at distance 0 before the loop, and the first time a vertex " +
      "is reached it is the distance to the nearest source. A <code>parent[v] = u</code> " +
      "write on that same relaxing push reconstructs the path by walking backwards from the " +
      "target.",
    "Walk the five-node sample from 0. The edges are the same undirected triangle 0-1-2 with " +
      "leaves 3 and 4. You start with <code>dist = [-1,-1,-1,-1,-1]</code>, set " +
      "<code>dist[0] = 0</code>, and queue <code>[0]</code>. Pop 0, relax 0-1 and 0-2, and " +
      "the queue becomes <code>[1, 2]</code> with both distances 1. Pop 1, relax 1-3 to " +
      "distance 2, and skip 2 because it is already marked. Pop 2, relax 2-4 to distance 2. " +
      "Pops of 3 and 4 find only marked neighbours. The finished array is " +
      "<code>[0, 1, 1, 2, 2]</code>, and every first visit was a shortest unweighted path.",
  ],
  extra: [
    {
      kind: "warn",
      title: "First visit is shortest only when every edge has the same weight",
      html: "<p>BFS counts hops. A one-hop road of weight 100 loses to a three-hop walk of " +
        "weights 1+1+1, but BFS records the one-hop arrival and never reopens that vertex. " +
        "Different positive weights are Dijkstra; weights in {0, 1} are 0-1 BFS on the next " +
        "pages.</p>",
    },
    {
      kind: "key",
      title: "Relax means \"try this edge as a cheaper way in\"",
      html: "<p>To <em>relax</em> an edge <code>u &rarr; v</code> of weight <code>w</code> is to " +
        "ask: is <code>dist[u] + w</code> smaller than the current <code>dist[v]</code>? If " +
        "yes, overwrite <code>dist[v]</code>. On this page <code>w</code> is always 1 and the " +
        "test succeeds only on the first visit.</p>",
    },
  ],
  invariant: "<p>Vertices leave the queue in non-decreasing <code>dist</code> order. When " +
    "<code>u</code> is popped, <code>dist[u]</code> is already the true unweighted distance " +
    "from the source, and no later edge can improve it.</p>" +
    "<span class=\"eq\">first push of v sets dist[v] = dist[u] + 1 = &delta;(s, v)</span>" +
    "<p>In plain words, the queue is a line of people standing in order of how far they live " +
    "from the source, and you only ever add someone to the back of that line, so the person " +
    "at the front is always the closest unfinished junction.</p>",
  arrayLabel: "dist[u]  (-1 = unseen)",
  array: [0, 1, 1, 2, 2],
  indexLabels: ["0", "1", "2", "3", "4"],
  vars: ["u", "queue", "v", "distV"],
  vizTitle: "BFS from 0 on the 5-node sample",
  dryIntro: "Breadth-first search from vertex 0 on the running five-node graph. Each pop " +
    "expands one layer, and a neighbour is marked in the same breath as it is pushed.",
  frames: [
    { note: "Source 0 is marked at distance 0 and sits alone in the queue; the other four vertices are still unseen at -1.",
      active: [0], dim: [1, 2, 3, 4],
      values: { u: 0, queue: "[0]", v: "\u2014", distV: 0 } },
    { note: "Pop 0 and relax both unseen neighbours: 1 and 2 enter the queue at distance 1, marked on the push so neither will be enqueued again.",
      active: [1, 2], done: [0],
      values: { u: 0, queue: "[1, 2]", v: "1,2", distV: 1 } },
    { note: "Pop 1. Neighbour 3 is unseen so it is pushed at distance 2; neighbour 2 is already marked and is skipped.",
      active: [3], done: [0, 1],
      values: { u: 1, queue: "[2, 3]", v: 3, distV: 2 } },
    { note: "Pop 2. Neighbour 4 is unseen so it is pushed at distance 2; 0 and 1 were marked earlier and are skipped.",
      active: [4], done: [0, 1, 2],
      values: { u: 2, queue: "[3, 4]", v: 4, distV: 2 } },
    { note: "Pop 3. Its only neighbour is 1, already marked, so the queue shrinks to the leftover vertex 4.",
      done: [0, 1, 2, 3], active: [4],
      values: { u: 3, queue: "[4]", v: "\u2014", distV: "\u2014" } },
    { note: "Pop 4 and the queue empties. The finished distances [0, 1, 1, 2, 2] are shortest because every edge had the same weight.",
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
    "<strong>Fill dist with -1, set dist[s] = 0, and push s into an ArrayDeque.</strong> The -1 is the unseen sentinel, and a deque used with add/poll is a FIFO queue; addLast/pollLast would turn it into a stack and destroy the layer order.",
    "<strong>While the queue is nonempty, pop the front vertex u.</strong> Because the queue is FIFO, u is a closest unfinished vertex, so its distance is already final and you are ready to look at its neighbours.",
    "<strong>For each neighbour v still at -1, write dist[v] = dist[u] + 1 and push v.</strong> That is the relaxation of the unit-weight edge u &rarr; v: the first time it succeeds it is also the last, which is why BFS never reopens a vertex.",
    "<strong>Mark on the push, never on the pop.</strong> Setting dist[v] in the same breath as q.add(v) means \"already queued\" and \"already seen\" are one test, so a vertex with many incoming edges enters the queue once.",
    "<strong>For multi-source problems, push every source at distance 0 before the loop starts.</strong> The first time any other vertex is reached it is then the distance to the nearest source, which is why rotting oranges and 01-matrix are one BFS, not n of them.",
    "<strong>To reconstruct a path, store parent[v] = u on that same relaxing push, then walk from t back to s and reverse.</strong> The walk has length dist[t], and if dist[t] is still -1 the target was unreachable.",
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
      "<p>Each vertex is pushed at most once, because it is marked in the same breath as the push. Each undirected edge is then looked at from both ends, a constant amount of work per edge. The queue and the dist array each hold at most n integers.</p>",
      "<span class=\"eq\">T = &Theta;(n + m), S = queue + dist = O(n)</span>",
      "<p>At n = 10&#8309; and m = 2&times;10&#8309; that is a few hundred thousand operations, well inside two seconds. Marking on pop instead would enqueue a vertex once per incoming edge and can grow the queue toward n&sup2; entries on a dense graph, about 10&#185;&#8304; integers at n = 10&#8309;, which both times out and runs out of memory.</p>",
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
      bug: "Waiting until pop to set dist[v] looks like \"I mark a vertex when I process it\", but every incoming edge then enqueues its own copy of v and the queue can grow toward n&sup2; on a dense graph.",
      fix: "Set dist[v] (or seen[v]) in the same breath as q.add(v). A vertex whose dist is no longer -1 is already queued and must be skipped." },
    { title: "Using Stack / DFS accidentally",
      bug: "ArrayDeque used with push/pop (or addLast/pollLast) is last-in first-out, so you visit a deep path first and the first arrival is no longer the fewest hops.",
      fix: "Use add and poll, which are FIFO. If you need a stack, say so and switch to DFS; do not let a deque silently become one." },
    { title: "Weighted edges treated as unit",
      bug: "A graph whose edges have weights 1 and 100 is fed to BFS, which reports the hop-shortest path. That looks correct on paper because the code matches the unweighted template, but a 3-hop walk of 1+1+1 beats a 1-hop of 100.",
      fix: "If weights differ and are non-negative, use Dijkstra. If they are only 0 and 1, use 0-1 BFS. Ordinary BFS is legal only when every edge has the same weight." },
    { title: "Disconnected source",
      bug: "dist[t] stays -1 and you print it as a length, or you run one BFS from vertex 0 and miss a component that never touches 0.",
      fix: "Treat -1 as unreachable and do not add it into an answer sum. For a property of every component, loop over unseen vertices and start a fresh BFS at each." },
    { title: "Grid without bounds checks",
      bug: "The four deltas walk nr or nc off the board, and the next index either throws or wraps to a cell that is not a real neighbour.",
      fix: "Reject nr &lt; 0 || nr &ge; R || nc &lt; 0 || nc &ge; C before you read the grid. The bounds test is cheaper than a try/catch and is part of the neighbour generation." },
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
      "<p>Only because every edge has the same weight. A walk that uses fewer edges is then always cheaper than a walk that uses more, and BFS expands in hop-count order, so the first arrival has the fewest hops. If one edge is heavier than another, a later walk with more hops can be cheaper, and BFS will already have frozen the worse first arrival. That is the whole reason this page is not Dijkstra.</p>"],
    ["How do you reconstruct the path?",
      "<p>When you first push v from u, write parent[v] = u. That edge is the last step of a shortest path to v. After the search, start at t and follow parent until you reach s, collecting vertices, then reverse the list. The length of that list minus one equals dist[t], which is a useful sanity check.</p>"],
    ["BFS on a tree?",
      "<p>The same code works, and because a tree has a unique path between any pair the distances are unique as well. Level order of a binary tree is exactly this queue. Two BFS runs find the diameter: start at any node, BFS to a farthest node, then BFS again from there; the second distance is the diameter. One DFS can do the same job if you only need the length.</p>"],
    ["When does BFS use more memory than DFS?",
      "<p>On a complete binary tree the last level holds n/2 nodes, so the BFS queue is &Theta;(n) while a DFS stack is only O(height) = O(log n). On a single path the situation reverses: BFS holds one vertex at a time and DFS recursion is depth n. Quote the worst case that matches the input shape, not a slogan that one is always leaner.</p>"],
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
  readTime: "24 min",
  tagline: "Depth-first search is the graph's recursion: mark, recurse on unseen neighbours, " +
    "and the vertices you touched in one call are a connected component.",
  tags: ["DFS", "components", "recursion", "P0"],
  prereqs: [
    ["Graph Representations", "graph-representations.html"],
    ["BFS", "bfs.html"],
  ],
  why: [
    "You are given 100000 user accounts and 200000 \"these two accounts share an email\" " +
      "pairs, and you must report how many separate groups of people the pairs form. A pair " +
      "is an undirected edge, a group is a <em>connected component</em> &mdash; a maximal set " +
      "of vertices in which you can walk from any member to any other along the stored edges. " +
      "Starting one search at account 0 paints everyone 0 can reach, but it says nothing about " +
      "an account that never touches 0. If you forget the accounts you never started from, you " +
      "report 1 on a graph that has 50 groups, and the judge marks it wrong.",
    "Depth-first search, DFS, is the recursive way to paint one group. From a vertex you mark " +
      "it, then you immediately dive into the first unseen neighbour, and you only come back " +
      "to the second neighbour after that dive returns. The vertices one such start touches " +
      "are exactly one connected component, and the edges you recurse along form a spanning " +
      "tree of that component. Number-of-islands and number-of-provinces are this idea wearing " +
      "a grid or a matrix costume: land cells are vertices, 4-way adjacency is the edge set, " +
      "and each fresh start of the recursion is one island.",
    "DFS is not a shortest-path algorithm. It can wander down a long corridor before it looks " +
      "at a neighbour sitting one step away, so the first time it reaches a vertex is not a " +
      "closest time. What it gives you instead is the component partition, plus enter and exit " +
      "times that later pages use for cycles, topological sort, bridges and strongly connected " +
      "components. The cost you must name out loud is the call stack. On a path of " +
      "<code>n = 10&#8309;</code> the JVM's default stack is only a few thousand frames and " +
      "the recursion throws. The contest default at that size is an explicit " +
      "<code>ArrayDeque</code> used as a stack, or union-find if you only need the grouping.",
  ],
  insight: "One DFS started at an unvisited vertex paints exactly one connected component. " +
    "Loop over every vertex, start a new paint when you see a fresh one, and the number of " +
    "paints is the number of components. Distances are BFS's job, not this one.",
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
  constraint: "<code>n, m &le; 2&times;10&#8309;</code> is one linear walk, the same " +
    "<code>O(n + m)</code> as BFS, and a grid is the same bound with <code>n = RC</code>. " +
    "Recursive DFS at this size needs an explicit stack, because a path of a hundred thousand " +
    "vertices overflows the Java call stack. If you only need the grouping and edges arrive " +
    "online, union-find is shorter than a walk.",
  core: [
    "You need one array <code>comp[u]</code> that starts at <code>-1</code> (unseen) and will " +
      "hold the component id of <code>u</code>. The recursive step is four lines: write " +
      "<code>comp[u] = id</code>, then for each neighbour <code>v</code> still at " +
      "<code>-1</code> call <code>dfs(v, id)</code>. Because an undirected edge is stored both " +
      "ways, the vertex you just came from is already painted and is skipped, which is how " +
      "the recursion does not bounce forever across a two-way road. Everything else the " +
      "recursion can still reach belongs to the same component, which is why one start paints " +
      "exactly one group.",
    "The outer loop is the part people forget. A single <code>dfs(0, 0)</code> paints only " +
      "the group that contains 0. You iterate <code>s</code> from 0 to <code>n-1</code> and, " +
      "whenever <code>s</code> is still unseen, start a new DFS with a fresh id. The number of " +
      "times you increment that id is the number of components. On a grid the same loop walks " +
      "every cell, starts a flood when it sees unseen land, and recurses to the four in-bounds " +
      "land neighbours. Two extra clocks, <code>tin[u]</code> and <code>tout[u]</code>, tick " +
      "around the recursive calls and turn \"is u an ancestor of v in this DFS tree?\" into " +
      "an interval test on those two numbers.",
    "Walk the sample with an isolated vertex 4 added. The edges 0-1, 0-2, 1-2, 1-3 join the " +
      "first four vertices; 4 has no edge. All five <code>comp</code> slots start at " +
      "<code>-1</code>. The outer loop starts <code>dfs(0, 0)</code>, which marks 0, dives to " +
      "1, then to 2 and 3, and returns with <code>comp = [0,0,0,0,-1]</code>. The loop then " +
      "skips 1, 2 and 3 because they are painted, finds 4 unseen, and starts " +
      "<code>dfs(4, 1)</code>. Vertex 4 has no neighbours, so it paints only itself. Two " +
      "starts, two components, finished array <code>[0, 0, 0, 0, 1]</code>.",
  ],
  extra: [
    {
      kind: "warn",
      title: "Recursive DFS on a path of n = 10^5 throws",
      html: "<p>The JVM default stack is a few thousand frames. Rewrite the walk with an " +
        "explicit ArrayDeque used as a stack, marking on push the same way BFS marks on push, " +
        "or switch to union-find if you only need the grouping.</p>",
    },
  ],
  invariant: "<p>During <code>dfs(u)</code>, every vertex already marked with the current id " +
    "is reachable from the vertex that started this paint, and when <code>dfs(u)</code> " +
    "returns, every vertex reachable from <code>u</code> through still-unseen vertices has " +
    "been marked with that same id.</p>" +
    "<span class=\"eq\">one start of dfs on an unvisited vertex = one connected component</span>" +
    "<p>In plain words, diving as deep as you can from a fresh vertex is enough to collect " +
    "everyone who can reach that vertex, and a vertex you never started a dive from is in a " +
    "different group.</p>",
  arrayLabel: "comp[u]  (-1 = unseen)",
  array: [0, 0, 0, 0, 1],
  indexLabels: ["0", "1", "2", "3", "4"],
  vars: ["u", "stack", "id", "compU"],
  vizTitle: "Two components: paint {0,1,2,3} then isolated 4",
  dryIntro: "The running graph plus an isolated vertex 4. Watch the outer loop start a second " +
    "paint when it finds 4 still unmarked after the first dive returns.",
  frames: [
    { note: "Every component id starts at -1. The outer loop begins a dive at vertex 0 with paint id 0, and 4 sits unseen on the side.",
      active: [0], dim: [1, 2, 3, 4],
      values: { u: 0, stack: "[0]", id: 0, compU: 0 } },
    { note: "The recursion follows the first unseen neighbour into 1, still carrying paint id 0, so 0 and 1 now belong to the same group.",
      active: [1], done: [0],
      values: { u: 1, stack: "[0,1]", id: 0, compU: 0 } },
    { note: "From 1 the dive reaches 2 and then 3. The triangle plus the leaf are all paint 0, and the first component is now fully marked.",
      active: [2, 3], done: [0, 1],
      values: { u: 2, stack: "[0,1,2]", id: 0, compU: 0 } },
    { note: "The first dive returns. The outer loop skips 1, 2 and 3 because they are painted, and it stops on unseen vertex 4.",
      done: [0, 1, 2, 3], dim: [4],
      values: { u: "scan", stack: "[]", id: 0, compU: "0 done" } },
    { note: "A second dive starts at 4 with a fresh paint id 1. Vertex 4 has no neighbours, so the new component is a single vertex.",
      active: [4], done: [0, 1, 2, 3],
      values: { u: 4, stack: "[4]", id: 1, compU: 1 } },
    { note: "Two dives were started, so the answer is 2 and the finished ids are [0, 0, 0, 0, 1].",
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
    "<strong>Fill comp with -1 and set a counter comps = 0.</strong> The -1 is the unseen sentinel, and the counter will become the number of groups once the outer loop finishes.",
    "<strong>Loop s from 0 to n-1 and, whenever s is still unseen, start dfs(s, comps++).</strong> A single start from 0 only paints the group of 0; the loop is what finds every other group.",
    "<strong>Inside dfs(u, id), write comp[u] = id, then recurse on every neighbour still at -1.</strong> Marking on entry is what stops the two-way undirected edge from bouncing forever, and everything the recursion can still reach shares this id.",
    "<strong>On a grid, the same loop walks every cell and recurses to the four in-bounds land neighbours of an unseen land cell.</strong> Each fresh start is one island, and water cells are simply never started from.",
    "<strong>If you need ancestry later, set tin[u] = timer++ before the child calls and tout[u] after they return.</strong> Then u is an ancestor of v in this DFS tree exactly when tin[v] sits inside [tin[u], tout[u]].",
    "<strong>If n can be a path of 10^5, rewrite the walk with an explicit stack of (u, next-neighbour-index).</strong> The JVM call stack will not hold a hundred thousand frames, and union-find is the shorter alternative when you only need the grouping.",
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
      "<p>Each vertex is marked once and never entered again, and each undirected edge is inspected from both ends, so the walk is the same linear scan as BFS: a constant amount of work per vertex and per edge.</p>",
      "<span class=\"eq\">T = &Theta;(n + m), S_stack = &Theta;(height) which can be n</span>",
      "<p>At n = 10&#8309; and m = 2&times;10&#8309; the time is a few hundred thousand operations. The hidden cost is the stack: a path graph has height n, so recursive DFS needs n frames and the JVM throws. An explicit ArrayDeque of size n is a few hundred kilobytes and is the contest default at that size. A grid of R rows and C columns is the same bound with n = RC.</p>",
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
      bug: "A single start from vertex 0 paints one group and you report 1, which looks right on a connected sample but is wrong the moment the graph has an isolated vertex.",
      fix: "Loop over every vertex (or every grid cell) and start a new paint whenever the slot is still unseen. The number of starts is the answer." },
    { title: "StackOverflowError on a path",
      bug: "Recursive DFS follows a corridor of n vertices and the JVM default stack is only a few thousand frames, so a correct algorithm throws on the usual n = 10^5 path.",
      fix: "Rewrite with an explicit ArrayDeque used as a stack, or use union-find if you only need the grouping and not a DFS tree." },
    { title: "Not marking the start before pushing neighbours",
      bug: "The iterative version pushes an unseen neighbour without painting it, so every incoming tree edge enqueues another copy and the stack holds the same vertex many times.",
      fix: "Mark on push, the same rule as BFS. For components you only need visited; for tin/tout you also keep a neighbour iterator on the stack." },
    { title: "Directed \"components\"",
      bug: "You drop the directions, run undirected DFS, and report groups that can touch each other if edges are treated as two-way. Those are weakly connected pieces, not strongly connected components.",
      fix: "Undirected DFS answers undirected connectivity. \"Can everyone reach everyone?\" on a directed graph needs Kosaraju or Tarjan, a later page." },
    { title: "Mutating the grid then needing it later",
      bug: "Painting land '1' to water '0' is a tidy in-place mark, but a later part of the problem still wants the original grid and now sees a blank sea.",
      fix: "Keep a separate seen[][] whenever the caller still needs the input. In-place painting is fine only when the grid is throwaway." },
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
      "<p>Both are O(RC) and both paint the same partition. Recursive DFS is fewer lines. BFS (or iterative DFS) avoids a StackOverflowError on a snake of land that is one cell wide and a hundred thousand long. Interviewers accept either; say out loud that you would switch to an explicit stack at contest size.</p>"],
    ["How do tin/tout test ancestry?",
      "<p>You increment a timer just before diving into the children of u, store that as tin[u], and store tout[u] when the dive returns. Then u is an ancestor of v in this DFS tree exactly when tin[v] lies inside the closed interval [tin[u], tout[u]]. That interval view is the Euler tour of the tree, and it is how later pages test ancestry without walking parent pointers.</p>"],
    ["Connected vs strongly connected?",
      "<p>On an undirected graph, one DFS, one BFS or one union-find pass per unseen vertex gives the connected components. On a directed graph, \"can everyone in the group reach everyone else?\" is strong connectivity and needs Kosaraju or Tarjan. Treating the directed edges as two-way gives only weak connectivity, which is a different predicate.</p>"],
    ["Why mark on push in iterative DFS?",
      "<p>The same reason as BFS: an unmarked vertex with several incoming tree edges would otherwise be pushed once per edge and sit on the stack many times. For a component paint you only need visited. If you also want tin/tout, the stack entry has to remember which neighbour you will try next, so you push a pair (u, next-index) rather than a bare vertex.</p>"],
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
  readTime: "24 min",
  tagline: "A back edge to an active ancestor is a cycle; a neighbour already coloured your " +
    "colour is a non-bipartite odd cycle. Same DFS, two extra integers.",
  tags: ["cycle", "bipartite", "coloring", "P0"],
  prereqs: [["DFS & Components", "dfs-and-components.html"]],
  why: [
    "You are given 200000 two-way friendships on 100000 people, and you must say whether the " +
      "network contains a loop &mdash; a walk that starts and ends at the same person without " +
      "repeating a friendship. The same input, asked differently, is \"can you split the people " +
      "into two teams so that every friendship crosses teams?\" Both questions are answered by " +
      "the walk you already have, plus one extra integer per vertex. Getting that extra integer " +
      "wrong is the usual reason a correct-looking DFS reports that every two-way road is a " +
      "cycle: the parent you just came from is stored as a neighbour in the other direction, " +
      "and a naive \"seen neighbour means a cycle\" test fires on every edge.",
    "A graph is <em>bipartite</em> when its vertices can be painted with two colours so that " +
      "every edge joins different colours. That is exactly the same as \"there is no odd " +
      "cycle\", because walking around a loop of odd length forces some vertex to take both " +
      "colours. Course schedule (a directed cycle among prerequisites), redundant connection " +
      "(the extra undirected edge that closed a loop), is-graph-bipartite, and possible " +
      "bipartition are the interview cluster, and they share one skeleton: walk, and watch for " +
      "the forbidden neighbour.",
    "Directed and undirected tests are different algorithms that happen to share a walk. On " +
      "an undirected graph a cycle is a seen neighbour that is not your parent. On a directed " +
      "graph a cycle is an edge to a vertex that is still on the recursion stack, usually " +
      "coloured GRAY. Mixing the two &mdash; parent-skip on a directed graph, or GRAY on an " +
      "undirected one &mdash; is the classification error this page exists to prevent. The " +
      "signal in a statement is the word \"cycle\", \"deadlock\", \"prerequisites\", or \"split " +
      "into two groups\", sitting next to the usual <code>n, m &le; 2&times;10&#8309;</code> " +
      "limits that already tell you one linear walk is enough.",
  ],
  insight: "Undirected cycle: a seen neighbour that is not your parent. Directed cycle: a " +
    "neighbour still on the recursion stack (GRAY). Bipartite: paint 0/1 along the walk; a " +
    "neighbour that already has your colour is an odd cycle.",
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
  constraint: "One walk is <code>O(n + m)</code>, the same budget as DFS, so the usual " +
    "<code>n, m &le; 2&times;10&#8309;</code> limits are comfortable. Bipartite colouring must " +
    "restart from every unseen vertex: a disconnected graph can have one perfectly 2-coloured " +
    "component and one odd cycle sitting in another piece you never visited. A single start " +
    "from vertex 0 is the usual wrong answer.",
  core: [
    "On an undirected graph you pass the parent. <code>dfs(u, p)</code> marks <code>u</code> " +
      "seen, then for each neighbour <code>v</code> it does one of three things: if " +
      "<code>v</code> is unseen it recurses with parent <code>u</code>; if <code>v</code> " +
      "equals <code>p</code> it skips, because that is the two-way road you just walked; if " +
      "<code>v</code> is seen and is not <code>p</code>, the edge <code>u-v</code> closes a " +
      "cycle. Union-find is the same test without a walk: union every edge, and the first " +
      "union that returns false is a cycle edge. A self-loop <code>u-u</code> is a cycle on " +
      "its own and must be caught before the parent-skip, because the parent of <code>u</code> " +
      "is not <code>u</code>.",
    "On a directed graph the parent-skip is the wrong test, because a back edge need not be " +
      "the vertex you came from. You colour each vertex WHITE (unseen), GRAY (on the recursion " +
      "stack) or BLACK (finished). An edge to GRAY is a <em>back edge</em> and is a directed " +
      "cycle. An edge to BLACK is a cross or forward edge and is legal in a DAG, which is why " +
      "treating BLACK as a cycle reports cycles that do not exist. Bipartite colouring is the " +
      "third extra integer: <code>colour[u]</code> is 0 or 1. You start an unseen vertex at " +
      "colour 0 and paint each neighbour the opposite bit. If a neighbour is already painted " +
      "and the colour matches yours, the edge between you is the closing side of an odd cycle.",
    "Walk the running triangle 0-1-2 plus leaves 3 and 4. Start at 0 with colour 0 and queue " +
      "<code>[0]</code>. Neighbours 1 and 2 both get colour 1. From 1 you paint 3 with colour " +
      "0, then you look at neighbour 2, which is already colour 1 &mdash; the same colour as " +
      "1. Edge 1-2 is the third side of the triangle, a cycle of length 3, and the graph is " +
      "not bipartite. Delete 1-2 and the same paint finishes as 0, 1, 1, 0, 1 with no " +
      "conflict, which is a valid 2-colouring of the remaining tree.",
  ],
  extra: [
    {
      kind: "warn",
      title: "Parent-skip is not a directed cycle test",
      html: "<p>Every undirected edge is stored twice, so skipping the parent is mandatory " +
        "there and wrong on a directed graph. Directed cycles use WHITE/GRAY/BLACK: only an " +
        "edge to GRAY is a back edge. BLACK is finished and legal in a DAG.</p>",
    },
  ],
  invariant: "<p>Undirected: the DFS tree plus a seen neighbour that is not the parent closes " +
    "a cycle. Directed: GRAY vertices are the active path, and an edge to a GRAY neighbour is " +
    "a back edge. Bipartite: a same-colour neighbour is an odd cycle.</p>" +
    "<span class=\"eq\">bipartite &hArr; 2-colourable &hArr; no odd cycle</span>" +
    "<p>In plain words, you are walking the graph with one extra label per vertex, and the " +
    "forbidden neighbour &mdash; a non-parent you have already seen, a GRAY stack vertex, or " +
    "someone wearing your colour &mdash; is the whole test.</p>",
  arrayLabel: "color[u]  (0/1; -1 unseen)",
  array: [0, 1, 0, 1, 1],
  indexLabels: ["0", "1", "2", "3", "4"],
  vars: ["u", "col", "v", "verdict"],
  vizTitle: "2-colour BFS; then an odd-cycle conflict",
  dryIntro: "Two-colour BFS on the running graph. The triangle 0-1-2 forces vertices 1 and 2 " +
    "to share a colour, which is the odd-cycle conflict that ends the search.",
  frames: [
    { note: "Start at vertex 0 with colour 0 and an empty rest of the graph. The queue holds only 0, and no edge has been checked yet.",
      active: [0], dim: [1, 2, 3, 4],
      values: { u: 0, col: 0, v: "\u2014", verdict: "ok" } },
    { note: "Both neighbours of 0 are unseen, so 1 and 2 are painted the opposite colour 1 and pushed, still with no conflict.",
      active: [1, 2], done: [0],
      values: { u: 0, col: 0, v: "1,2", verdict: "ok" } },
    { note: "From 1, leaf 3 gets colour 0, but neighbour 2 is already colour 1, the same as 1, so edge 1-2 closes the odd triangle 0-1-2.",
      active: [1, 2],
      values: { u: 1, col: 1, v: 2, verdict: "conflict" } },
    { note: "A cycle of length 3 cannot be 2-coloured, so the graph is not bipartite and the search can stop.",
      best: [0, 1, 2],
      values: { u: 1, col: 1, v: 2, verdict: "not bipartite" } },
    { note: "Delete edge 1-2 and the same paint finishes without a clash: each leaf sits opposite its parent, and the graph becomes a tree.",
      done: [0, 1, 2, 3, 4],
      values: { u: "alt", col: "2-col", v: "no 1-2", verdict: "bipartite" } },
    { note: "A directed cycle is a different test: an edge to a GRAY stack vertex, not a 2-colour clash. A prereq graph can be a DAG and still 2-colour fine.",
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
    "<strong>Undirected cycle: dfs(u, p), and a seen neighbour v other than p is a cycle.</strong> You skip the parent because the two-way road you just walked is stored twice and is not a loop. Union-find is the same test: a failed union is a cycle edge.",
    "<strong>Directed cycle: colour WHITE / GRAY / BLACK, and an edge to GRAY is a back edge.</strong> GRAY means \"still on the recursion stack\", so that edge returns to an active ancestor and closes a directed loop.",
    "<strong>Bipartite: paint an unseen vertex 0 and flip the bit on every step.</strong> BFS or DFS both work; the extra integer is the colour, and the walk is the one you already have.",
    "<strong>A neighbour that already has your colour is an odd cycle, so the graph is not bipartite.</strong> The edge between the two same-colour vertices is the closing side of a loop of odd length.",
    "<strong>Restart the walk from every unseen vertex.</strong> A disconnected graph can hide an odd cycle (or a directed cycle) in a component you never started, and a single start from 0 would miss it.",
    "<strong>Do not use parent-skip as a directed cycle test, and do not treat BLACK as a cycle.</strong> Parent-skip is an undirected trick; a BLACK neighbour in a DAG is a legal cross or forward edge.",
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
      "<p>One walk paints or colours every vertex once and inspects every edge a constant number of times from its endpoints, so the time is the same linear scan as DFS or BFS.</p>",
      "<span class=\"eq\">T = &Theta;(n + m)</span>",
      "<p>At n = 10&#8309; and m = 2&times;10&#8309; that is a few hundred thousand operations. Union-find as an undirected cycle check is O(m &alpha;(n)), effectively linear as well, but it does not answer the directed-cycle question and it does not 2-colour the graph. Restarting from every unseen vertex does not change the bound: each vertex is still painted once.</p>",
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
      bug: "Every undirected edge is stored twice, so the vertex you just came from sits in the neighbour list and a naive \"seen neighbour means a cycle\" test fires on every single edge.",
      fix: "Pass the parent and skip v == parent. A genuine multi-edge u-v stored twice is a cycle of length 2 and should be treated separately from the parent." },
    { title: "2-colour from a single source",
      bug: "You start at vertex 0, colour that component cleanly, and return true, while a far component you never visited contains an odd cycle.",
      fix: "Loop over unseen vertices and start a fresh colouring at each, the same outer loop as components. One conflict anywhere fails the whole graph." },
    { title: "GRAY vs BLACK mix-up",
      bug: "Treating an edge to BLACK as a cycle looks plausible because BLACK is \"already seen\", but those edges are the legal cross and forward edges of a DAG, so you report cycles that do not exist.",
      fix: "Only GRAY is a back edge. BLACK means the dive finished and the vertex is safe to point at. Test it on a small DAG that has a cross edge." },
    { title: "Bipartite on a directed graph without undirected view",
      bug: "The usual interview bipartite graph is undirected. Running 2-colour on directed edges as if they were one-way asks a different question that most statements did not ask.",
      fix: "Unless the statement says otherwise, treat the edges as undirected for 2-colouring. Directed \"bipartite\" is a rarer notion and should be named explicitly." },
    { title: "Returning true on the first component",
      bug: "The first piece 2-colours cleanly, you return true, and you never look at the rest of the vertices. The wrong version looks right on a connected sample.",
      fix: "A conflict anywhere fails the whole graph. Success requires every component to finish without a same-colour neighbour." },
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
      "<p>A 2-colouring along a path has to alternate, 0 then 1 then 0. Closing a walk of odd length brings you back to the start after an odd number of flips, so that start vertex would have to be both colours at once. An even cycle flips an even number of times and lands on the original colour, so it 2-colours fine. A forest has no cycle at all and is always bipartite.</p>"],
    ["Can a disconnected graph be bipartite?",
      "<p>Yes, if and only if every component is bipartite. An isolated vertex is a trivial two-colouring: paint it 0 and it has no neighbour to clash with. That is why the outer loop over unseen vertices is mandatory. One odd cycle in a far component fails the whole graph, and one successful component does not prove the rest.</p>"],
    ["Directed cycle vs topological order?",
      "<p>A DAG is a directed graph with no directed cycle, and that is equivalent to \"the vertices have a topological order\", a permutation where every edge goes forward. Kahn's algorithm and 3-colour DFS both prove the same fact: if you cannot finish n vertices, a directed cycle remains. The next page uses that order to turn a recurrence into a for-loop.</p>"],
    ["Self-loop?",
      "<p>A self-loop u-u is a cycle of length 1, which is odd, so it is both a cycle and a proof that the graph is not bipartite. Handle u == v before the parent-skip, because the parent of u is some other vertex and the skip would miss the loop. Directed self-loops are a GRAY edge from u to itself.</p>"],
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
  readTime: "26 min",
  tagline: "A DAG has a linear order where every edge goes forward; process vertices in that " +
    "order and every DP recurrence becomes a for-loop.",
  tags: ["topo sort", "Kahn", "DAG DP", "P0"],
  prereqs: [
    ["Cycle Detection & Bipartite", "cycle-detection-and-bipartite.html"],
    ["DFS & Components", "dfs-and-components.html"],
  ],
  why: [
    "You are given 200000 directed prerequisite edges on 100000 courses, and you must list " +
      "the courses in an order that never takes a course before its prerequisites. If the " +
      "edges contain a directed loop, no such list exists, because a course would have to " +
      "come before itself. If they do not contain a loop, the graph is a <em>DAG</em> &mdash; " +
      "a directed acyclic graph &mdash; and a <em>topological order</em> is a permutation of " +
      "the vertices in which every edge points forward. Course schedule II is exactly that " +
      "list; \"number of ways to reach t\" and \"longest increasing path in a matrix\" are " +
      "the same order used as the evaluation order of a recurrence.",
    "Dynamic programming on a general graph is illegal the moment a cycle exists, because a " +
      "state would depend on itself. On a DAG the order removes that circularity: once you " +
      "have processed every vertex that can point at <code>v</code>, the value " +
      "<code>dp[v]</code> can be written in one step from those already-final neighbours. " +
      "Two algorithms produce the order. Kahn keeps a queue of vertices whose <em>indegree</em> " +
      "&mdash; the number of incoming edges still not accounted for &mdash; has fallen to " +
      "zero. DFS adds a vertex only after every outgoing recursive call has returned, then " +
      "reverses the list. Kahn also detects the cycle: if you pop fewer than <code>n</code> " +
      "vertices, a directed loop remains, which is why course-schedule and course-schedule-II " +
      "share one skeleton.",
    "The DP step is easy to get wrong by iterating the adjacency list in the order the file " +
      "printed the edges. That order is not a topological order, so you can update " +
      "<code>v</code> while <code>u</code> is still stale, and the ways or distances come out " +
      "short. The constraint that names this page is a directed graph together with " +
      "<code>n, m &le; 2&times;10&#8309;</code> and a phrase such as \"prerequisites\", " +
      "\"build order\", or \"number of ways\", with no request for a shortest path on a graph " +
      "that is allowed to have cycles.",
  ],
  insight: "A topological order is a permutation where every edge u &rarr; v has u before v. " +
    "Build that order first, then walk it once and update each neighbour from already-final " +
    "values. Kahn builds the order with a queue of indegree-zero vertices.",
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
  constraint: "<code>n, m &le; 2&times;10&#8309;</code> is one linear Kahn pass, about a " +
    "million steps. Recursive DFS-topo has the usual stack-depth issue on a long chain and " +
    "should be rewritten with an explicit stack at this size. Path counts and sums need " +
    "<code>long</code>, and often a mod <code>10&#8313;+7</code>, because the number of paths " +
    "in a DAG can be exponential in <code>n</code>.",
  core: [
    "Kahn starts by counting, for every vertex, how many edges point at it. That count is " +
      "the indegree. Every vertex whose indegree is already 0 has no remaining prerequisite " +
      "and goes into an <code>ArrayDeque</code>. You then repeat: pop <code>u</code>, append " +
      "it to the order, and for each outgoing neighbour <code>v</code> decrement " +
      "<code>indeg[v]</code>. If that decrement hits 0, <code>v</code> has just lost its last " +
      "unprocessed in-edge and is safe to enqueue. When the queue empties, either " +
      "<code>order.size()</code> equals <code>n</code> and you hold a topological order, or a " +
      "directed cycle ate the remaining vertices and no order exists.",
    "DAG DP is a second pass over that order. To <em>relax</em> an edge <code>u &rarr; v</code> " +
      "here means: combine the already-final <code>dp[u]</code> into <code>dp[v]</code> using " +
      "whatever the problem asked for &mdash; add the ways, take a min distance, take a max " +
      "length. Because <code>u</code> sits before <code>v</code> in the order, every in-edge " +
      "of <code>v</code> is relaxed only after its tail is final, so one scan is enough even " +
      "when weights are negative. Initialise <code>dp</code> at the sources (ways at " +
      "<code>s</code> start at 1, distances at 0) and leave the rest at the identity of the " +
      "combine. Memoised DFS from a sink is the same recurrence with the call stack standing " +
      "in for the order, which is why longest-increasing-path on a grid does not build an " +
      "edge list.",
    "Walk the five-node DAG with edges 0&rarr;1, 0&rarr;2, 1&rarr;3, 2&rarr;3, 2&rarr;4. " +
      "Indegrees start at <code>[0, 1, 1, 2, 1]</code>, so the queue holds only 0. Pop 0, " +
      "append it, decrement 1 and 2 to 0, and enqueue both. Pop 1, decrement 3 from 2 to 1. " +
      "Pop 2, decrement 3 to 0 and 4 to 0, and enqueue both. Pop 3 and 4. The order is " +
      "<code>[0, 1, 2, 3, 4]</code> (or 4 before 3), size equals n, it is a DAG. A ways " +
      "array that starts <code>ways[0] = 1</code> then adds along each edge finishes with " +
      "<code>ways[3] = ways[1] + ways[2] = 2</code>, the two paths 0-1-3 and 0-2-3.",
  ],
  extra: [
    {
      kind: "key",
      title: "Relax on this page means \"combine a finished tail into its head\"",
      html: "<p>Because the tail sits earlier in the topological order, <code>dp[u]</code> is " +
        "already final when you look at <code>u &rarr; v</code>. That is why one pass is " +
        "enough, and why negative weights are legal on a DAG even though they break Dijkstra.</p>",
    },
  ],
  invariant: "<p>Every vertex that enters Kahn's queue has had all of its incoming edges " +
    "already processed, so it is safe to place next in the order. After the second pass, " +
    "<code>dp[v]</code> combines every in-edge from a finished tail.</p>" +
    "<span class=\"eq\">for every edge u &rarr; v: index(u) &lt; index(v) in the order</span>" +
    "<p>In plain words, you never take a course before its last remaining prerequisite has " +
    "been listed, and you never read a DP value that is still waiting on an earlier course.</p>",
  arrayLabel: "indegree as Kahn runs",
  array: [0, 1, 1, 1, 1],
  indexLabels: ["0", "1", "2", "3", "4"],
  vars: ["u", "queue", "order", "indeg"],
  vizTitle: "Kahn on a 5-node DAG 0->1,0->2,1->3,2->3,2->4",
  dryIntro: "Kahn's algorithm on the five-node DAG. Vertices enter the queue only when their " +
    "last incoming edge has been accounted for, and a ways pass then reads only finished tails.",
  frames: [
    { note: "Indegrees start at [0, 1, 1, 2, 1] because only vertex 0 has no incoming edge, so the queue holds 0 and the order is still empty.",
      active: [0],
      values: { u: "init", queue: "[0]", order: "[]", indeg: "[0,1,1,2,1]" } },
    { note: "Pop 0 and append it. Decrementing the two outgoing edges drops the indegrees of 1 and 2 to 0, so both become safe to enqueue.",
      active: [1, 2], done: [0],
      values: { u: 0, queue: "[1, 2]", order: "[0]", indeg: "[0,0,0,2,1]" } },
    { note: "Pop 1 and append it. The edge 1 to 3 drops that indegree from 2 to 1, so 3 still waits on the other in-edge from 2.",
      active: [3], done: [0, 1],
      values: { u: 1, queue: "[2]", order: "[0, 1]", indeg: "[0,0,0,1,1]" } },
    { note: "Pop 2 and append it. Both remaining in-edges fall to 0, so 3 and 4 enter the queue together and every indegree is now 0.",
      active: [3, 4], done: [0, 1, 2],
      values: { u: 2, queue: "[3, 4]", order: "[0, 1, 2]", indeg: "[0,0,0,0,0]" } },
    { note: "Pop 3 and then 4. The order has length 5, equal to n, so the graph is a DAG and 4 could legally have been popped before 3.",
      done: [0, 1, 2, 3, 4],
      values: { u: 3, queue: "[4]", order: "[0,1,2,3]", indeg: "all 0" } },
    { note: "A ways pass starts with ways[0] = 1 and adds along each forward edge, so ways[3] becomes ways[1] + ways[2] = 2, the two paths from 0.",
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
    "<strong>Count indeg[v]++ for every directed edge u &rarr; v.</strong> That count is how many prerequisites still block v, and a vertex that starts at 0 has nothing blocking it.",
    "<strong>Queue every vertex whose indegree is already 0, using an ArrayDeque.</strong> Those vertices are the legal starts of any topological order, and an empty queue at this point means every vertex sits on a cycle.",
    "<strong>Pop u, append it to the order, then decrement each neighbour and enqueue a neighbour that hits 0.</strong> Hitting 0 means u was that neighbour's last unprocessed in-edge, so it is now safe to list.",
    "<strong>If the order has fewer than n vertices, a directed cycle remains and you abort.</strong> DP on a partial order silently drops the vertices that sat on the cycle, which is why course-schedule and this check share a skeleton.",
    "<strong>DP: walk the finished order and relax every outgoing edge u &rarr; v.</strong> Relaxing here means combining the already-final dp[u] into dp[v]; because u sits earlier, one scan is enough.",
    "<strong>DFS topo: recurse on outgoing neighbours first, then append u, then reverse the list.</strong> Postorder is sinks first, and the reverse (or an addFirst) puts sources first so the DP pass reads finished tails.",
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
      "<p>Each vertex enters Kahn's queue at most once, and each directed edge decrements exactly one indegree, so the first pass is a constant amount of work per vertex and per edge. The DP pass walks the same edges once more. DFS-topo is the same bound with a postorder list.</p>",
      "<span class=\"eq\">T_topo = T_{DAG-DP} = &Theta;(n + m)</span>",
      "<p>At n = 10&#8309; and m = 2&times;10&#8309; both passes together are a few hundred thousand operations. Dijkstra on a DAG is overkill: the topological pass already relaxes each edge once, which is O(n + m) even when weights are negative. A heap would add a log factor you do not need.</p>",
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
      bug: "You walk g in the order the file printed the edges, so dp[v] reads dp[u] while u is still the identity of the combine. Ways come out short and distances look almost right on a sorted sample.",
      fix: "Build the topological order first, then run the DP pass along that order and nowhere else. A three-edge chain printed backwards is a good test." },
    { title: "Forgetting the cycle check",
      bug: "Kahn returns a partial order of the vertices that were not on a cycle; you DP on it and silently drop a strongly-connected bunch, producing a number instead of \"impossible\".",
      fix: "Require order.size() == n before any DP. If the size is smaller, fail or report that no order exists, the same check as course-schedule." },
    { title: "Indegree on undirected edges",
      bug: "You inserted both directions, so every edge is a two-cycle and indegree never falls to 0 except on isolated vertices. Kahn reports a cycle on a tree.",
      fix: "Topological order is defined on directed graphs. If the statement is undirected, this page is the wrong tool unless you first orient the edges." },
    { title: "int overflow of ways",
      bug: "The number of paths in a DAG can be exponential in n, so an int wraps to a small wrong number that still looks like a count.",
      fix: "Store ways in a long, and reduce modulo 10^9+7 when the statement asks for a mod. A skinny chain of 40 vertices already overflows a 32-bit int." },
    { title: "DFS-topo without reverse",
      bug: "Postorder appends a vertex after its outgoing calls, so the list is sinks first. A DP pass that reads it from the front uses unfinished tails.",
      fix: "Collections.reverse the list, or addFirst as you finish, or run the DP backwards through the postorder. Sources must be read first." },
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
      "<p>Only when Kahn's queue has size 1 at every step, which means the DAG is a single forced chain: each prefix has exactly one legal next vertex. Otherwise many permutations are legal, and any one of them is enough for DP because every edge still goes forward. Sequence-reconstruction asks the uniqueness question; course-schedule-II asks for any order.</p>"],
    ["Why can DAG-DP handle negative weights?",
      "<p>There is no directed cycle, so there is no negative cycle either. Each edge is relaxed once, after its tail is already final, so a negative weight just subtracts and cannot come back later to subtract again. Bellman-Ford's extra passes exist only to survive graphs that may contain cycles. Dijkstra is the wrong extra caution here: it refuses negatives that this pass handles for free.</p>"],
    ["Memo DFS vs Kahn DP?",
      "<p>They compute the same recurrence. Memoised DFS uses the call stack as the topological order and is natural on an implicit DAG, such as cells of a grid with a strictly increasing move. Kahn is iterative and reports a cycle when the order is short. Use memo DFS when building an edge list is annoying; use Kahn when you also owe the caller a cycle test.</p>"],
    ["Course schedule II if many orders exist?",
      "<p>Return any legal order. If they want the lexicographically smallest, replace Kahn's queue with a min-heap so the smallest label is always popped next. If they want every possible order, that is backtracking on the DAG and is exponential; interviews almost never go there. Check order.size() == n before you return, so a cycle becomes an empty list rather than a partial one.</p>"],
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
  readTime: "26 min",
  tagline: "Non-negative weighted shortest paths: always expand the unsettled vertex with " +
    "smallest dist, and the first time you settle it the distance is final.",
  tags: ["Dijkstra", "heap", "shortest path", "P0"],
  prereqs: [
    ["BFS", "bfs.html"],
    ["Heaps & Priority Queue", "../03-linear-structures/heaps-and-priority-queue.html"],
  ],
  why: [
    "You are given 100000 junctions and 200000 one-way roads whose driving times are " +
      "positive integers up to a billion, and you need the cheapest time from junction 0 to " +
      "every other junction. BFS is the wrong tool the moment those times are not all equal: " +
      "a single road of time 100 loses to a three-road walk of times 1+1+1, but BFS records " +
      "the first arrival (one hop) and never looks at that junction again. Trying every walk " +
      "is worse: at this size even listing the roads once is a few hundred thousand steps, " +
      "and enumerating walks is exponential. You need a search that always expands the " +
      "unfinished junction whose current best time is smallest.",
    "That search is Dijkstra's algorithm. It keeps a <code>dist</code> array of best times " +
      "found so far, and a min-heap of pairs <code>(dist[u], u)</code> so the next expansion " +
      "is the closest unfinished vertex. Network delay time, path-with-minimum-effort, and " +
      "almost every weighted maze are this heap plus the rule that the first time a vertex " +
      "comes off the heap with a matching <code>dist</code> its time is final. The rule needs " +
      "every weight to be non-negative. With a negative road, a vertex you have already " +
      "frozen can still be cheapened by a detour you have not expanded yet, and the answer " +
      "comes out too large.",
    "A concrete three-node counterexample is enough to refuse negatives. Vertices 0, 1, 2, " +
      "source 0, edges 0&rarr;1 of weight 2, 0&rarr;2 of weight 4, and 2&rarr;1 of weight " +
      "<code>-3</code>. Dijkstra settles 1 at time 2 (the direct road) while 2 still sits at " +
      "time 4, then freezes <code>dist[1]</code>. The true cheapest walk is 0-2-1 with total " +
      "4-3 = 1, which is never applied. Java's <code>PriorityQueue</code> also does not " +
      "support decrease-key, so the contest pattern is \"push a new pair when the time " +
      "improves, skip a popped pair whose time no longer matches <code>dist[u]</code>\". That " +
      "is <code>O(m log m)</code>, fine at <code>m = 2&times;10&#8309;</code>, and the signal " +
      "in a statement is \"minimum cost\" on non-negative weights with those limits.",
  ],
  insight: "Always expand the unfinished vertex with the smallest dist. When every edge " +
    "weight is non-negative, the first fresh heap pop is the true shortest-path distance and " +
    "can be frozen. Skip heap pairs whose stored time no longer matches dist[u].",
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
  constraint: "<code>n, m &le; 2&times;10&#8309;</code> with weights up to <code>10&#8313;</code> " +
    "is the usual heap-Dijkstra prompt: store <code>dist</code> in <code>long</code>, because " +
    "a path of a hundred thousand billion-weight edges overflows an <code>int</code>. The " +
    "duplicate-heap version is <code>O(m log m)</code>, about <code>2&times;10&#8309;</code> " +
    "times 18, which fits. A dense <code>O(n&sup2;)</code> scan of the closest unsettled " +
    "vertex is better only when the graph is a matrix with <code>n</code> around 1000.",
  core: [
    "You need a <code>long[] dist</code> filled with a huge sentinel INF, " +
      "<code>dist[s] = 0</code>, and a min-heap of pairs <code>(d, u)</code>. To " +
      "<em>relax</em> an edge <code>u &rarr; v</code> of weight <code>w</code> is to ask: is " +
      "<code>dist[u] + w</code> smaller than the current <code>dist[v]</code>? If yes, " +
      "overwrite <code>dist[v]</code> and push the new pair <code>(dist[v], v)</code> onto " +
      "the heap. That is the same question BFS asked with <code>w = 1</code>, now asked with " +
      "a real weight. The loop is: pop the pair with the smallest <code>d</code>; if " +
      "<code>d</code> is not equal to <code>dist[u]</code> the pair is stale (an older, " +
      "worse time) and you skip it; otherwise <code>u</code> is <em>settled</em> &mdash; its " +
      "distance is frozen &mdash; and you relax every outgoing edge.",
    "INF must be larger than any real path, so use <code>Long.MAX_VALUE / 4</code>, about " +
      "<code>2&times;10&#185;&#8304;</code>. Adding a weight to <code>Integer.MAX_VALUE</code> " +
      "wraps negative and then \"improves\" every vertex. Never relax from a stale pop: that " +
      "re-expands a settled vertex and can grow the heap without bound. A " +
      "<code>parent[v] = u</code> write on a successful relaxation reconstructs the path. " +
      "The non-negative hypothesis is what makes the first fresh pop final: every remaining " +
      "unsettled vertex is at least as far as <code>u</code>, and an extra non-negative edge " +
      "cannot jump in front of a closer vertex you have already frozen.",
    "Walk the running weighted sample from 0: edges 0&rarr;1 of 4, 0&rarr;2 of 2, 2&rarr;1 " +
      "of 1, 1&rarr;3 of 1, 2&rarr;4 of 7. Start with <code>dist[0] = 0</code> and heap " +
      "<code>[(0, 0)]</code>. Settle 0, relax 0&rarr;1 to 4 and 0&rarr;2 to 2. The next fresh " +
      "pop is 2 at 2; relaxing 2&rarr;1 improves 1 from 4 to 3, and 2&rarr;4 writes 9. The " +
      "next fresh pop is 1 at 3 (the leftover pair (4, 1) is stale and will be skipped). " +
      "Relax 1&rarr;3 to 4, then settle 3 and 4. The finished array is " +
      "<code>[0, 3, 2, 4, 9]</code>, and every first settlement was final because every " +
      "weight was non-negative.",
  ],
  extra: [
    {
      kind: "warn",
      title: "Three nodes are enough to break Dijkstra with a negative edge",
      html: "<p>Source 0, edges 0&rarr;1 weight 2, 0&rarr;2 weight 4, 2&rarr;1 weight " +
        "<code>-3</code>. Dijkstra freezes vertex 1 at 2 before it expands 2. The walk 0-2-1 " +
        "has total 1 and is never applied. Use Bellman-Ford (or Johnson) when any weight can " +
        "be negative.</p>",
    },
    {
      kind: "key",
      title: "Relax means \"is dist[u] + w a cheaper way to v?\"",
      html: "<p>Overwrite <code>dist[v]</code> and push a new heap pair only when the answer " +
        "is yes. The first time a popped pair matches the current <code>dist[u]</code>, that " +
        "value is final &mdash; but only while every <code>w</code> is at least 0.</p>",
    },
  ],
  invariant: "<p>When <code>u</code> is first popped with a pair whose time equals " +
    "<code>dist[u]</code>, that time is the true shortest-path distance from the source, and " +
    "every remaining heap key is at least as large.</p>" +
    "<span class=\"eq\">w &ge; 0  &rArr;  settled set grows by true &delta;(s, u)</span>" +
    "<p>In plain words, you always freeze the closest unfinished junction, and because no " +
    "road has a negative time, nobody you have not yet visited can sneak in with a cheaper " +
    "total than a junction you already froze.</p>",
  arrayLabel: "dist[u] as vertices settle",
  array: [0, 4, 2, 5, 9],
  indexLabels: ["0", "1", "2", "3", "4"],
  vars: ["u", "d", "relax", "heap"],
  vizTitle: "Dijkstra from 0: edges 0-1:4, 0-2:2, 2-1:1, 1-3:1, 2-4:7",
  dryIntro: "Dijkstra from 0 on the weighted five-node sample. Each fresh heap pop freezes a " +
    "distance, and a leftover pair whose time no longer matches dist[u] is skipped as stale.",
  frames: [
    { note: "Source 0 starts at distance 0 in the heap; the other four vertices still hold the INF sentinel and have never been relaxed.",
      active: [0], dim: [1, 2, 3, 4],
      values: { u: 0, d: 0, relax: "start", heap: "[(0,0)]" } },
    { note: "Settle 0 and relax both outgoing edges: vertex 1 is written at 4 and vertex 2 at 2, so the heap is now ordered [(2, 2), (4, 1)].",
      active: [1, 2], done: [0],
      values: { u: 0, d: 0, relax: "1=4, 2=2", heap: "[(2,2),(4,1)]" } },
    { note: "The fresh pop (2, 2) settles 2. Relaxing 2 to 1 improves 4 down to 3, and relaxing 2 to 4 writes 9 for the first time.",
      active: [1, 4], done: [0, 2],
      values: { u: 2, d: 2, relax: "1=3, 4=9", heap: "[(3,1),(4,1),(9,4)]" } },
    { note: "The fresh pop (3, 1) settles 1 at the improved time. The leftover pair (4, 1) is now stale. Relaxing 1 to 3 writes 4.",
      active: [3], done: [0, 1, 2],
      values: { u: 1, d: 3, relax: "3=4", heap: "[(4,1 stale),(4,3),(9,4)]" } },
    { note: "The stale pair (4, 1) is popped and skipped because 4 no longer equals dist[1]. The next fresh pop (4, 3) settles 3.",
      done: [0, 1, 2, 3],
      values: { u: 3, d: 4, relax: "\u2014", heap: "[(9,4)]" } },
    { note: "Settle 4 at 9 and the heap empties. The finished distances [0, 3, 2, 4, 9] are final because every weight was non-negative.",
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
    "<strong>Fill a long[] dist with INF = Long.MAX_VALUE/4, set dist[s] = 0, and push (0, s).</strong> A 32-bit INF plus a positive weight wraps negative and then \"improves\" every vertex, which is why the array is long from the first line.",
    "<strong>Pop the pair (d, u) with the smallest time. If d != dist[u], skip it as stale.</strong> That pair is an older, worse time you pushed before a later relaxation improved u, and re-expanding it would grow the heap for no gain.",
    "<strong>Otherwise u is settled: relax each outgoing edge u &rarr; v of weight w.</strong> Relaxing means: if d + w is smaller than dist[v], overwrite dist[v] and push the new pair. That is the only write that can change an answer.",
    "<strong>Stop when the heap is empty, or return as soon as you settle t if you only need s-t.</strong> All-destinations must drain the heap; a single target can exit early because every later pop is at least as far as t.",
    "<strong>Leave unreachable vertices at INF, and never add a weight onto INF.</strong> Overflow of a sentinel is the usual way a distant vertex suddenly looks cheaper than the source.",
    "<strong>Refuse any negative weight; the freeze-on-first-pop proof needs w &ge; 0.</strong> The three-node graph 0&rarr;1 weight 2, 0&rarr;2 weight 4, 2&rarr;1 weight -3 freezes 1 at 2 and misses the true total 1.",
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
      "<p>Each successful relaxation pushes one new pair, so the heap holds at most m entries in the duplicate-key version. Each push or pop on a binary heap costs O(log m), and each edge is examined once per settlement of its tail.</p>",
      "<span class=\"eq\">T = O(m log m), S = O(n + m)</span>",
      "<p>At m = 2&times;10&#8309; that is about 2&times;10&#8309; times 18 heap operations, a few million steps, which fits in two seconds. A Fibonacci heap would be O(m + n log n) and nobody implements it in an interview. When the graph is a dense matrix with n around 1000, scanning the closest unsettled vertex in O(n&sup2;) is faster than paying a log on n&sup2; heap entries.</p>",
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
      bug: "INF = Integer.MAX_VALUE looks like a safe sentinel, then INF + w wraps to a negative number and every later comparison treats that overflow as a cheaper path.",
      fix: "Use long[] dist and INF = Long.MAX_VALUE / 4. A path of n billion-weight edges then still sits well below the sentinel." },
    { title: "Not skipping stale pops",
      bug: "You re-expand u with an old d, relax its edges again, and push even more leftover pairs. The heap grows and the algorithm can look like it is looping.",
      fix: "Immediately after each pop, if (d != dist[u]) continue. Only a pair that still matches the current best time is allowed to settle and relax." },
    { title: "Negative weights",
      bug: "A later cheaper walk through a negative edge never gets to improve a vertex you already froze, so the printed answer is too large. The three-node graph 0&rarr;1=2, 0&rarr;2=4, 2&rarr;1=-3 is the usual silent wrong answer.",
      fix: "Refuse Dijkstra the moment any weight can be negative. Use Bellman-Ford, or Johnson's reweighting if you need many sources and there is no negative cycle." },
    { title: "Using TreeSet of vertices without updating",
      bug: "A TreeSet of (d, u) used as decrease-key needs a remove of the old pair before the add of the new one; forgetting the remove leaves two keys for one vertex and the set order lies.",
      fix: "The duplicate-heap pattern is simpler and is the contest default. TreeSet decrease-key is optional and only worth it if you already know you will not miss the remove." },
    { title: "Undirected input stored one way",
      bug: "The statement says the roads are two-way but you inserted each pair once, so the shortest walk cannot use a road backwards and a reachable target looks unreachable.",
      fix: "Insert both directions with the same weight unless the statement is directed. The reverse insert belongs in the same loop body as the forward one." },
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
      "<p>The settled vertex u is the closest unfinished vertex, and freezing it is safe only if nobody you have not yet expanded can produce a smaller total. A negative edge can do exactly that. On vertices 0, 1, 2 with edges 0&rarr;1 weight 2, 0&rarr;2 weight 4, 2&rarr;1 weight -3, Dijkstra freezes 1 at 2; the walk 0-2-1 totals 1 and arrives too late. The heap order then describes a world that is no longer true.</p>"],
    ["Dijkstra vs Prim?",
      "<p>The loop shape is the same &mdash; a min-heap of vertices, grow a set one vertex at a time &mdash; but the key is different. Dijkstra's key is the best distance from the source. Prim's key is the cheapest edge that touches the tree so far. Mixing them is a common interview slip when you have just implemented one: you grow an MST when the question asked for shortest paths, or the other way around.</p>"],
    ["Early exit?",
      "<p>If you only need dist[t], return the moment you settle t. Every later fresh pop is at a distance at least as large, so it cannot improve t. The heap may still hold other vertices; that is fine. If you need distances to every vertex you must drain the heap. Do not exit on the first time t is pushed, only on the first time it is settled.</p>"],
    ["How do you print the path?",
      "<p>On each successful relaxation write parent[v] = u, the tail of the edge that just improved v. After the search, start at t and follow parent until you reach s, then reverse the list. If several walks tie, the first relaxation (or a &le; versus &lt; policy) picks one of the shortest paths, not all of them.</p>"],
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
  readTime: "24 min",
  tagline: "When every edge weight is 0 or 1, a deque simulates Dijkstra in <code>O(n + m)</code>: " +
    "0-edges to the front, 1-edges to the back.",
  tags: ["0-1 BFS", "deque", "shortest path", "P1"],
  prereqs: [
    ["BFS", "bfs.html"],
    ["Dijkstra", "dijkstra.html"],
  ],
  why: [
    "You are in a 1000 by 1000 maze. Stepping onto an empty cell is free, and breaking a " +
      "wall costs 1, and you want the fewest walls to break to reach the exit. Dijkstra with " +
      "a heap solves it, but at a million cells the heap pays a log factor on every " +
      "improvement, something like twenty extra operations per edge, and the idea itself is " +
      "hidden inside a generic shortest-path hammer. Ordinary BFS is worse: it marks a cell " +
      "the first time it is reached, so a later free step that would have cheapened that cell " +
      "is refused. You need the freeze-closest rule of Dijkstra without paying for a heap.",
    "The observation is that every weight is 0 or 1, so a new candidate distance is either " +
      "the same as the current vertex or one more. The unfinished vertices therefore sit in " +
      "at most two consecutive layers. A <em>deque</em> &mdash; a double-ended queue, an " +
      "<code>ArrayDeque</code> that you can add to either end &mdash; keeps those two layers " +
      "in order: a 0-weight step goes on the front (same layer) and a 1-weight step goes on " +
      "the back (next layer). Popping from the front then expands in non-decreasing distance, " +
      "which is exactly Dijkstra's order, in linear time.",
    "The same observation is why you must not mark on first push. A vertex can be reached " +
      "first along a 1-edge at distance <code>d+1</code>, then improved along a 0-edge to " +
      "distance <code>d</code>. BFS would have frozen the worse first visit. The signal in a " +
      "statement is \"weights are 0 or 1\", \"follow the painted arrow for free, change it " +
      "for 1\", or \"minimum walls to break\", together with limits such as " +
      "<code>n, m &le; 10&#8310;</code> where a heap still works but is the slower, less " +
      "honest answer.",
  ],
  insight: "A 0-weight edge goes to the front of the deque (same distance) and a 1-weight " +
    "edge goes to the back (distance plus one). The deque stays sorted, so you get Dijkstra " +
    "in linear time. Allow a second visit whenever the distance improves.",
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
  constraint: "<code>n, m &le; 10&#8310;</code> is the reason this page exists: a linear " +
    "deque walk of a few million steps fits, while Dijkstra's <code>O(m log m)</code> is the " +
    "same idea with a slower hammer. Distances are small integers, so <code>int</code> is " +
    "enough unless you mix in a second cost. Each vertex is pushed a constant number of " +
    "times (once per useful improvement), which is still linear.",
  core: [
    "You need a <code>dist</code> array filled with INF, <code>dist[s] = 0</code>, and an " +
      "<code>ArrayDeque</code> that starts holding <code>s</code>. To <em>relax</em> an edge " +
      "<code>u &rarr; v</code> of weight <code>w</code> in <code>{0, 1}</code> is the same " +
      "question as on the Dijkstra page: is <code>dist[u] + w</code> smaller than the current " +
      "<code>dist[v]</code>? If yes, overwrite <code>dist[v]</code>, then " +
      "<code>addFirst(v)</code> when <code>w</code> is 0 (same layer) and " +
      "<code>addLast(v)</code> when <code>w</code> is 1 (next layer). You pop from the front. " +
      "If you store pairs <code>(d, u)</code>, skip a pop whose <code>d</code> no longer " +
      "matches <code>dist[u]</code>, the same stale-pair rule as Dijkstra.",
    "Do not mark a vertex visited on first discovery. A 0-edge is a decrease-key: it can " +
      "improve a vertex that is already sitting in the deque at a worse distance. Ordinary " +
      "BFS is the special case with no 0-edges, which is why its mark-on-push rule is legal " +
      "there and wrong here. Swapping the two ends of the deque &mdash; putting 1-edges on " +
      "the front &mdash; destroys the two-layer order and you expand a farther vertex first. " +
      "Weights outside <code>{0, 1}</code> also break the invariant: a +2 jump can overtake, " +
      "and you need Dijkstra or Dial's buckets.",
    "Walk the five-node sample whose 0-edges are 0-2 and 2-1 and whose 1-edges are 0-1, 1-3 " +
      "and 2-4. Start with <code>dist[0] = 0</code> and deque <code>[0]</code>. From 0 the " +
      "0-edge writes 2 at distance 0 and goes to the front; the 1-edge writes 1 at distance 1 " +
      "and goes to the back, so the deque is <code>[2, 1]</code>. Pop 2 (still distance 0). " +
      "The 0-edge 2-1 improves vertex 1 from 1 to 0 and is pushed to the front; the 1-edge " +
      "2-4 writes 4 at distance 1. Pop the improved 1 at distance 0, write 3 at distance 1, " +
      "and skip the leftover stale copy of 1. The finished array is <code>[0, 0, 0, 1, 1]</code>. " +
      "Vertex 1 was reached twice; the 0-edge was the improvement BFS would have missed.",
  ],
  extra: [
    {
      kind: "warn",
      title: "Mark-on-push BFS is wrong the moment a 0-edge exists",
      html: "<p>A vertex can be queued first along a 1-edge and then improved along a 0-edge. " +
        "Refusing the second push freezes the worse distance. Compare <code>nd</code> against " +
        "<code>dist[v]</code> the way Dijkstra does.</p>",
    },
    {
      kind: "key",
      title: "Relax means the same thing as on the Dijkstra page",
      html: "<p>If <code>dist[u] + w</code> is smaller than <code>dist[v]</code>, overwrite " +
        "and push. The only new rule is which end of the deque receives the push: front for " +
        "weight 0, back for weight 1.</p>",
    },
  ],
  invariant: "<p>The deque holds vertices at two consecutive distances <code>d</code> and " +
    "<code>d+1</code>, with the <code>d</code> copies at the front. Popping the front " +
    "therefore expands in non-decreasing order, which is the order Dijkstra needs.</p>" +
    "<span class=\"eq\">w=0 &rarr; addFirst (dist stays); w=1 &rarr; addLast (dist+1)</span>" +
    "<p>In plain words, free steps stay in the current ticket line and paid steps join the " +
    "line behind it, so you always serve the cheapest unfinished cell next.</p>",
  arrayLabel: "dist[u] during 0-1 BFS from 0",
  array: [0, 1, 0, 1, 1],
  indexLabels: ["0", "1", "2", "3", "4"],
  vars: ["u", "w", "nd", "deque"],
  vizTitle: "0-edges 0-2 and 2-1; 1-edges 0-1, 1-3, 2-4",
  dryIntro: "0-1 BFS from 0 on mixed free and unit edges. Watch vertex 1 get queued at " +
    "distance 1 and then improved to 0 by the free edge 2-1, the second visit BFS would refuse.",
  frames: [
    { note: "Source 0 starts at distance 0 alone in the deque; the other four vertices still hold INF and have never been relaxed.",
      active: [0], dim: [1, 2, 3, 4],
      values: { u: 0, w: "\u2014", nd: 0, deque: "[0]" } },
    { note: "From 0 the free edge writes 2 at distance 0 on the front, and the unit edge writes 1 at distance 1 on the back, so the deque is [2, 1].",
      active: [1, 2], done: [0],
      values: { u: 0, w: "0 then 1", nd: "2@0, 1@1", deque: "[2, 1]" } },
    { note: "Pop 2 at distance 0. The free edge 2-1 improves vertex 1 from 1 to 0 and is pushed to the front; the unit edge writes 4 at distance 1.",
      active: [1, 4], done: [0, 2],
      values: { u: 2, w: "0 to 1", nd: "1 improved to 0", deque: "[1, 1stale, 4]" } },
    { note: "Pop the improved copy of 1 at distance 0 and relax the unit edge to 3 at distance 1. The leftover stale copy of 1 will be skipped.",
      active: [3], done: [0, 1, 2],
      values: { u: 1, w: 1, nd: 1, deque: "[stale1, 4, 3]" } },
    { note: "Skip the stale copy of 1, then pop 4 at distance 1 and pop 3 at distance 1. Both of those distances are already final.",
      done: [0, 1, 2, 3, 4],
      values: { u: 4, w: "\u2014", nd: 1, deque: "[3]" } },
    { note: "The finished distances are [0, 0, 0, 1, 1]. Vertex 1 was reached twice; the free edge was the improvement ordinary BFS would have missed.",
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
    "<strong>Fill dist with INF, set dist[s] = 0, and add s to an ArrayDeque.</strong> INF should be MAX/4, the same sentinel as Dijkstra, so INF + 1 cannot wrap and pretend to be an improvement.",
    "<strong>Pop from the front: that vertex is a closest unfinished vertex.</strong> The two-layer order is what makes the front safe to expand without a heap.",
    "<strong>If you stored a pair (d, u) and d no longer equals dist[u], skip it as stale.</strong> That leftover is an older, worse time, and re-expanding it would push more garbage the way an unfiltered Dijkstra heap does.",
    "<strong>On a 0-edge, if nd is smaller than dist[v], write it and addFirst(v).</strong> A free step stays in the current layer, which is why it goes to the front and can improve a vertex already queued at d+1.",
    "<strong>On a 1-edge, if nd is smaller than dist[v], write it and addLast(v).</strong> A paid step belongs on the next layer, behind every still-pending free step of the current layer.",
    "<strong>Do not mark a vertex visited on first discovery.</strong> A later 0-edge is a real improvement, and refusing the second push freezes the worse first visit the way ordinary BFS would.",
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
      "<p>Each successful relaxation pushes a vertex onto one end of the deque. Distances are non-negative integers and only decrease, and the deque is kept sorted by distance, so each edge is processed a constant number of times. That is a linear scan of the vertices and the edges, with no heap.</p>",
      "<span class=\"eq\">T = O(n + m)</span> versus Dijkstra's O(m log m).",
      "<p>At n = m = 10&#8310; the linear walk is a few million steps. Dijkstra on the same input pays an extra log, about twenty operations per edge, which is tens of millions of heap operations and the slower, less honest answer. Marking on first push does not make the algorithm faster; it makes it wrong, because a later 0-edge is a real improvement you just refused.</p>",
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
      bug: "A vertex is queued along a 1-edge and you mark it seen, so a later 0-edge that would have cheapened it is refused. The code looks like the BFS template, which is why the wrong answer is so common.",
      fix: "Only skip a neighbour when nd is not smaller than dist[v]. That is the same comparison as Dijkstra, and it is what allows the second push." },
    { title: "addFirst / addLast swapped",
      bug: "Putting 1-edges on the front (or 0-edges on the back) looks like a harmless swap, but the two-layer order dies and you expand a farther vertex before a closer one.",
      fix: "Weight 0 is always addFirst and weight 1 is always addLast. A three-edge path 0 -1-> a -0-> t versus 0 -0-> t is a good test of the ends." },
    { title: "Using this for weight 2",
      bug: "A +2 jump can overtake the next layer, so the deque is no longer sorted by distance and the algorithm silently returns a non-shortest walk.",
      fix: "Use Dijkstra for arbitrary non-negative weights, or Dial's bucket queue if the weights are small integers 0..K. This page needs a 0 that stays on the current layer." },
    { title: "pollLast instead of pollFirst",
      bug: "Popping from the back turns the deque into a stack, so distances are no longer monotone and the first expansion of a vertex is not the closest one.",
      fix: "Always pollFirst. The structure is a queue that you also unshift onto, not a stack, and addLast/pollLast would destroy the algorithm." },
    { title: "INT overflow INF+1",
      bug: "Integer.MAX_VALUE + 1 wraps negative, so every 1-edge out of an unreachable vertex looks cheaper than a real path and \"improves\" the whole graph.",
      fix: "Use INF = Integer.MAX_VALUE / 4, the same sentinel as Dijkstra. A real distance in a 0-1 graph is at most n and sits far below that." },
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
      "<p>It can be reached first along a 1-edge at distance d+1, then improved along a 0-edge (or a path of 0-edges) to distance d. That second write is a real cheaper walk, not a duplicate. Ordinary BFS forbids a second visit because on unit weights the first visit is already best. Here the 0-edge is a decrease-key, so the second visit must be allowed.</p>"],
    ["Is 0-1 BFS just Dijkstra?",
      "<p>Yes. The deque is a specialised heap that only ever holds two consecutive keys, so you get the same freeze-closest order without paying a log. Saying that sentence is the interview-level understanding: you still expand in non-decreasing distance, you still relax an edge only when it improves dist[v], and you still skip stale leftover copies.</p>"],
    ["LC 1368 \u2014 why 0-1?",
      "<p>Each cell already has an arrow painted on it. Walking in the painted direction costs 0, because you did not change the grid. Walking in any other direction (or rewriting the arrow) costs 1. Those are exactly the two weights this page knows how to order, so the grid graph is a 0-1 instance and a heap is the slower way to say the same thing.</p>"],
    ["What if weights are 1 and 2?",
      "<p>That is not 0-1. There is no free step that stays on the current layer, so a +2 jump can overtake and the two-layer deque invariant dies. You can still use Dial's algorithm with K = 2 buckets, or just run Dijkstra. The 0 is load-bearing: it is the edge that sits at the front.</p>"],
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

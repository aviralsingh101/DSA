/* Module 09 — Decompositions */
import { pack, lc, cf } from "./pack.mjs";

export const topics = [

/* ============================== 1. heavy-light-decomposition ========== */
pack({
  id: "heavy-light-decomposition",
  difficulty: "Hard",
  readTime: "28 min",
  tagline: "Split every root-path into <code>O(log n)</code> heavy chains so a segment tree on a flattened tree answers path queries in <code>O(log&sup2; n)</code>.",
  tags: ["HLD", "trees", "segment tree", "P2"],
  prereqs: [
    ["Binary Lifting & LCA", "../05-trees/lca-binary-lifting.html"],
    ["Segment Tree", "../06-range-queries/segment-tree.html"],
  ],
  why: [
    "A path in a tree is not an array interval. Naive path-sum walks <code>O(n)</code> edges; a Fenwick tree on a DFS order answers subtree queries, not arbitrary paths. Heavy-light decomposition (HLD) is the standard way to turn a path into a handful of contiguous segments.",
    "The trick is structural: from each node, the edge into its heaviest child (largest subtree) is <em>heavy</em>; every other child edge is <em>light</em>. Light edges at most halve the remaining size, so any root-path crosses <code>O(log n)</code> light edges and therefore lives on <code>O(log n)</code> heavy chains.",
    "Lay each chain down as a contiguous segment of a global array (DFS that prefers the heavy child). A segment tree on that array answers a chain-range in <code>O(log n)</code>, so a full path is <code>O(log&sup2; n)</code>. Path updates with lazy propagation are the same skeleton.",
  ],
  insight: "A light edge halves the subtree, so a root-path uses <code>O(log n)</code> chains. Prefer the heavy child in DFS so each chain occupies a contiguous interval.",
  yes: [
    "Path aggregate or path update on a tree: sum, min, XOR, add-on-path",
    "\"Sum of node values from u to v\" with point updates",
    "Subtree queries <em>and</em> path queries on the same tree (HLD DFS order does both)",
    "<code>n, q &le; 10&#8309;</code> on a tree, so <code>O(log&sup2; n)</code> per query is the intended budget",
    "You already have LCA and a segment tree and the missing piece is \"the path is not an interval\"",
  ],
  no: [
    "Only subtree queries &rarr; Euler tour + Fenwick / segment tree, no HLD",
    "Static path-min / path-max &rarr; binary lifting or a sparse table on the Euler tour",
    "Distance-only queries &rarr; precompute depths and LCA, no values to aggregate",
    "Centroid / small-to-large problems (\"count pairs at distance k\") &rarr; a different decomposition",
  ],
  table: [
    ["Path sum / min / XOR with updates", "Path is O(log) chain ranges", "HLD + segment tree"],
    ["Path add, point query", "Lazy on each chain range", "HLD + lazy segtree"],
    ["Subtree sum only", "DFS interval is already contiguous", "Euler tour, skip HLD"],
    ["Static path minimum", "Idempotent, no updates", "Binary lifting / sparse table"],
    ["k-th ancestor / jump", "Not an aggregate", "Binary lifting"],
    ["<strong>Confused with:</strong> centroid decomposition", "Centroid solves through a separator; HLD linearises paths", "Use centroid for pair-count, HLD for path aggregates"],
  ],
  constraint: "<code>n, q &le; 2&times;10&#8309;</code> is the HLD signature. <code>O(log&sup2; n)</code> Java usually fits; drop the extra log with a Fenwick tree when the operation is prefix-friendly (sum, XOR) and you only need point updates.",
  core: [
    "Two DFS passes. First: compute <code>sz</code>, <code>par</code>, <code>depth</code>, and <code>heavy[u]</code> = child of maximum subtree. Second: assign each node a position <code>pos[u]</code> in a flat array, walking the heavy child first so a chain is contiguous. <code>head[u]</code> is the top of the chain containing <code>u</code>.",
    "A path query lifts the deeper head up one chain at a time: while <code>head[u] != head[v]</code>, query <code>[pos[head[u]], pos[u]]</code> and jump <code>u = par[head[u]]</code>. Finish with the remaining in-chain segment between <code>u</code> and <code>v</code>. Always query the deeper side first so the two pointers meet at the LCA chain.",
  ],
  invariant: "<p>Every root-path crosses <code>O(log n)</code> light edges, hence lives on <code>O(log n)</code> heavy chains. After a heavy-first DFS, each chain is a contiguous <code>[pos[head], pos[node]]</code> interval of the segment tree.</p>",
  array: [1, 2, 3, 4, 5, 6, 7],
  arrayLabel: "pos =",
  indexLabels: ["1", "2", "3", "4", "5", "6", "7"],
  vars: ["u", "head", "chain"],
  frames: [
    { note: "Tree: 1-2-4, 1-2-5, 1-3-6, 1-3-7. Subtree sizes: 7,3,3,1,1,1,1. Heavy child of 1 is 2 (tie broken by first).",
      active: [0], values: { u: 1, head: 1, chain: "start at root" } },
    { note: "Chain A: 1-2-4 (heavy edges). pos = [1,2,4] get indices 0,1,2.",
      active: [0, 1, 2], values: { u: 4, head: 1, chain: "A = 1-2-4" } },
    { note: "Node 5 is a light child of 2, so it starts a new chain B. pos[5] = 3.",
      active: [3], values: { u: 5, head: 5, chain: "B = 5" } },
    { note: "Chain C: 3-6. 3 is a light child of 1. pos[3]=4, pos[6]=5.",
      active: [4, 5], values: { u: 6, head: 3, chain: "C = 3-6" } },
    { note: "Node 7 starts chain D. Four chains cover seven nodes.",
      active: [6], values: { u: 7, head: 7, chain: "D = 7" } },
    { note: "Path 5 to 7: 5 (chain B) -> 2 (chain A) -> 1 (chain A) -> 3 (chain C) -> 7 (chain D). Three chain jumps.",
      active: [3, 1, 0, 4, 6], values: { u: "5..7", head: "B,A,C,D", chain: "3 jumps" } },
  ],
  mermaid: `graph TD
  n1["1 head"] --> n2["2"]
  n1 --> n3["3 head"]
  n2 --> n4["4"]
  n2 --> n5["5 head"]
  n3 --> n6["6"]
  n3 --> n7["7 head"]`,
  merTitle: "Heavy edges vs new heads",
  merCaption: "Thick vertical lines are heavy chains. Each light child starts a new head.",
  steps: [
    "<strong>DFS 1.</strong> Compute <code>sz</code>, <code>par</code>, <code>depth</code>, <code>heavy[u]</code>.",
    "<strong>DFS 2.</strong> Assign <code>pos</code> and <code>head</code>, always recursing into the heavy child first.",
    "<strong>Build</strong> a segment tree on the <code>pos</code>-ordered values.",
    "<strong>pathQuery(u, v):</strong> while heads differ, query the deeper chain and jump to <code>par[head]</code>.",
    "<strong>Same chain:</strong> query the closed interval between <code>pos[u]</code> and <code>pos[v]</code>.",
    "<strong>Updates</strong> are the same walk, writing instead of reading. Subtree query is one interval <code>[pos[u], pos[u]+sz[u])</code>.",
  ],
  code: [
    { tab: "Brute", file: "PathSumBrute.java",
      intro: "Walk parent pointers to the LCA. Correct, <code>O(n)</code> per query.",
      code: `public class PathSumBrute {
    static int[] par, val, depth;
    static int lca(int u, int v) {
        while (depth[u] > depth[v]) u = par[u];
        while (depth[v] > depth[u]) v = par[v];
        while (u != v) { u = par[u]; v = par[v]; }
        return u;
    }
    static int pathSum(int u, int v) {
        int a = lca(u, v), s = val[a];
        while (u != a) { s += val[u]; u = par[u]; }
        while (v != a) { s += val[v]; v = par[v]; }
        return s;
    }
    public static void main(String[] args) {
        par = new int[] {0, 0, 1, 1, 2, 2, 3, 3};
        val = new int[] {0, 1, 2, 3, 4, 5, 6, 7};
        depth = new int[] {0, 0, 1, 1, 2, 2, 2, 2};
        System.out.println(pathSum(5, 7));
    }
    // Input : tree 1-2-4/5, 1-3-6/7, values = ids
    // Output: 18
}` },
    { tab: "Optimal", file: "HldPathSum.java",
      intro: "Full HLD with a Fenwick tree for path sums and point updates.",
      code: `import java.util.*;
public class HldPathSum {
    int n, timer;
    List<Integer>[] g;
    int[] par, depth, sz, heavy, head, pos, val;
    long[] bit;
    HldPathSum(int n) {
        this.n = n;
        g = new List[n];
        for (int i = 0; i < n; i++) g[i] = new ArrayList<>();
        par = new int[n]; depth = new int[n]; sz = new int[n];
        heavy = new int[n]; Arrays.fill(heavy, -1);
        head = new int[n]; pos = new int[n]; val = new int[n];
        bit = new long[n + 2];
    }
    void add(int u, int v) { g[u].add(v); g[v].add(u); }
    void dfsSz(int u, int p) {
        par[u] = p; sz[u] = 1;
        int best = 0;
        for (int v : g[u]) if (v != p) {
            depth[v] = depth[u] + 1;
            dfsSz(v, u);
            sz[u] += sz[v];
            if (sz[v] > best) { best = sz[v]; heavy[u] = v; }
        }
    }
    void dfsHld(int u, int h) {
        head[u] = h; pos[u] = timer++;
        if (heavy[u] != -1) dfsHld(heavy[u], h);
        for (int v : g[u]) if (v != par[u] && v != heavy[u]) dfsHld(v, v);
    }
    void bitAdd(int i, long x) { for (i++; i <= n; i += i & -i) bit[i] += x; }
    long bitSum(int i) { long s = 0; for (i++; i > 0; i -= i & -i) s += bit[i]; return s; }
    long bitRange(int l, int r) { return bitSum(r) - bitSum(l - 1); }
    long pathSum(int u, int v) {
        long s = 0;
        while (head[u] != head[v]) {
            if (depth[head[u]] < depth[head[v]]) { int t = u; u = v; v = t; }
            s += bitRange(pos[head[u]], pos[u]);
            u = par[head[u]];
        }
        if (depth[u] > depth[v]) { int t = u; u = v; v = t; }
        s += bitRange(pos[u], pos[v]);
        return s;
    }
    public static void main(String[] args) {
        HldPathSum h = new HldPathSum(7);
        int[][] e = {{0,1},{0,2},{1,3},{1,4},{2,5},{2,6}};
        for (int[] x : e) h.add(x[0], x[1]);
        for (int i = 0; i < 7; i++) h.val[i] = i + 1;
        h.dfsSz(0, -1); h.dfsHld(0, 0);
        for (int i = 0; i < 7; i++) h.bitAdd(h.pos[i], h.val[i]);
        System.out.println(h.pathSum(4, 6));
    }
    // Input : same 7-node tree, values 1..7, query 5 to 7 (0-based 4,6)
    // Output: 18
}` },
    { tab: "Template", file: "HldTemplate.java",
      intro: "The query walk, isolated. Plug any range structure in for <code>seg.query</code>.",
      code: `public class HldTemplate {
    static int[] head, par, depth, pos;
    static long queryRange(int l, int r) { return 0; } // segtree
    static long pathQuery(int u, int v) {
        long ans = 0;
        while (head[u] != head[v]) {
            if (depth[head[u]] < depth[head[v]]) { int t = u; u = v; v = t; }
            ans += queryRange(pos[head[u]], pos[u]);
            u = par[head[u]];
        }
        if (pos[u] > pos[v]) { int t = u; u = v; v = t; }
        ans += queryRange(pos[u], pos[v]);
        return ans;
    }
    public static void main(String[] args) {
        head = new int[] {0, 0, 2, 0, 4, 2, 6};
        par = new int[] {-1, 0, 0, 1, 1, 2, 2};
        depth = new int[] {0, 1, 1, 2, 2, 2, 2};
        pos = new int[] {0, 1, 4, 2, 3, 5, 6};
        System.out.println(pathQuery(4, 6));
    }
    // Input : heads/pos of the 7-node example
    // Output: 0
}` },
  ],
  complexity: {
    time: "O(n) preprocess, O(log^2 n) per query",
    space: "O(n)",
    derivation: [
      "<p>A light edge at least halves subtree size, so a node has <code>O(log n)</code> light ancestors. The query walk therefore processes <code>O(log n)</code> chains, each a segment-tree range of <code>O(log n)</code>.</p>",
      "<span class=\"eq\">T<sub>query</sub> = O(log n) chains &times; O(log n) = O(log&sup2; n)</span>",
    ],
    compare: [
      ["Walk to LCA", "O(n) / query", "O(n)", "Tiny n or one query"],
      ["Binary lifting", "O(log n)", "O(n log n)", "Static path-min / k-th ancestor"],
      ["HLD + Fenwick", "O(log^2 n)", "O(n)", "Path sum / XOR, point update"],
      ["HLD + lazy segtree", "O(log^2 n)", "O(n)", "Path add + path query"],
    ],
  },
  pitfalls: [
    { title: "DFS does not prefer the heavy child",
      bug: "Chains fragment; a \"chain\" is no longer a contiguous <code>pos</code> interval and every query is wrong.",
      fix: "In the second DFS, recurse into <code>heavy[u]</code> before any light child, and pass the same <code>head</code>." },
    { title: "Forgetting to lift the deeper head",
      bug: "Jumping the shallower pointer first walks off the LCA and double-counts or infinite-loops.",
      fix: "Compare <code>depth[head[u]]</code> (not <code>depth[u]</code>) and always lift the deeper chain." },
    { title: "Off-by-one on the in-chain segment",
      bug: "<code>[pos[u], pos[v])</code> drops the LCA node, or includes it twice if both sides add it.",
      fix: "After heads meet, query the closed interval between the two positions once." },
    { title: "1-index vs 0-index mix",
      bug: "Parent of the root becomes 0, Fenwick index 0 is unused, and <code>bitAdd(pos[root], x)</code> writes the wrong cell.",
      fix: "Pick one convention. Fenwick wants 1-based indices: <code>bitAdd(pos[u] + 1, x)</code> if <code>pos</code> is 0-based." },
    { title: "Updating values after HLD without writing the tree",
      bug: "You change <code>val[u]</code> but not the Fenwick / segment tree cell at <code>pos[u]</code>.",
      fix: "Point update is <code>tree.update(pos[u], newValue)</code>. The original array is only the build source." },
  ],
  variants: [
    ["Subtree query", "DFS interval [pos[u], pos[u]+sz[u]) is contiguous because heavy-first still visits a whole subtree together.", "seg.query(pos[u], pos[u]+sz[u]-1)", "CF 383C"],
    ["Edge values", "Store the edge weight on the child endpoint; skip the LCA node when querying.", "pathQuery then subtract val[lca]", "CF 396C"],
    ["Lazy path add", "Same walk, call seg.rangeAdd instead of query.", "while heads differ: seg.add(pos[head], pos[u], x)", "CF 587C"],
  ],
  followups: [
    ["Why is the bound O(log n) chains, not O(n)?",
      "<p>Each light edge moves to a subtree of size at most half. A walk toward the root therefore meets at most <code>log n</code> light edges, and each light edge is the only place a chain can change.</p>"],
    ["Can you get O(log n) instead of O(log^2 n)?",
      "<p>Yes for prefix-friendly operations (sum, XOR) with point updates: Fenwick on the HLD array is <code>O(log n)</code> per chain range, still <code>O(log^2 n)</code> total. True <code>O(log n)</code> path queries need a top tree or link-cut tree.</p>"],
    ["How do you handle edge weights?",
      "<p>Assign the edge <code>(p, u)</code> to node <code>u</code>. When the two pointers sit on the same chain, query <code>(pos[lca], pos[deeper]]</code> so the LCA node (which holds the parent edge) is excluded.</p>"],
    ["HLD versus centroid for \"count pairs at distance k\"?",
      "<p>HLD linearises paths; it does not enumerate pairs. Centroid decomposition solves through a separator in <code>O(n log n)</code>. Use the tool that matches the query shape.</p>"],
  ],
  problems: [
    lc("209", "minimum-size-subarray-sum", "Medium", "Not HLD — warm-up on range sums"),
    lc("307", "range-sum-query-mutable", "Medium", "The segment tree HLD sits on"),
    cf("383C", "Propagating tree", "Hard", "HLD or Euler + Fenwick"),
    cf("396C", "On Changing Tree", "Hard", "Path / subtree mix"),
    cf("587C", "Duff in the Army", "Hard", "Path k-th with HLD"),
    cf("600E", "Lomsat gelral", "Hard", "Often small-to-large; HLD also works"),
    { url: "https://leetcode.com/problems/lca-of-deepest-leaves/", name: "LCA of Deepest Leaves", badge: "lc", tag: "LC 1123", level: "Medium", pattern: "LCA building block" },
    { url: "https://atcoder.jp/contests/abc294/tasks/abc294_g", name: "ABC 294 G Heavy-Light Decomp", badge: "atc", tag: "ABC 294G", level: "Hard", pattern: "Path sums on a tree" },
  ],
  recap: [
    "Heavy child = largest subtree; a light edge halves size.",
    "Second DFS prefers the heavy child so a chain is contiguous.",
    "Path query = O(log n) chain ranges, always lift the deeper head.",
    "Subtree query is a single [pos, pos+sz) interval.",
    "Edge weights live on the child; skip the LCA node.",
  ],
  oneliner: "while (head[u] != head[v]) { lift deeper chain; } query in-chain segment;",
}),

/* ============================== 2. centroid-decomposition ============= */
pack({
  id: "centroid-decomposition",
  difficulty: "Hard",
  readTime: "26 min",
  tagline: "A centroid splits every remaining component to size at most <code>n/2</code>. Recurse, and every pair of nodes meets at exactly one centroid ancestor.",
  tags: ["centroid", "trees", "divide and conquer", "P2"],
  prereqs: [
    ["DFS & Components", "../07-graphs-core/dfs-and-components.html"],
    ["Binary Lifting & LCA", "../05-trees/lca-binary-lifting.html"],
  ],
  why: [
    "Many tree problems ask about <em>pairs</em>: how many pairs sit at distance <code>k</code>, what is the closest red node, what is the XOR of a path with a given property. Walking every pair is <code>O(n&sup2;)</code>. Layering a balanced separator over the tree drops that to <code>O(n log n)</code>.",
    "A centroid of a tree is a node whose removal leaves components of size at most <code>n/2</code>. Every tree has one (or two adjacent ones). After you solve \"paths that go through this centroid\", you mark it dead and recurse on each remaining component.",
    "The recursion depth is <code>O(log n)</code> because every piece halves. The centroid tree (parent = the centroid that decomposed you) is a balanced tree you can also query online: the answer for a node is an aggregate over its <code>O(log n)</code> centroid ancestors.",
  ],
  insight: "Every path crosses exactly one centroid at each layer of the decomposition. Solve through the centroid, mark it dead, recurse. Depth is <code>log n</code> because pieces halve.",
  yes: [
    "\"How many pairs of nodes at distance k\"",
    "Online \"paint this node, query nearest painted\" on a tree",
    "Count / optimise paths with a numeric constraint (XOR, weight sum, length)",
    "You can compute a contribution <em>through a fixed node</em> in linear time in the current component",
    "<code>n &le; 10&#8309;</code> and a pair-over-tree flavour",
  ],
  no: [
    "Path aggregates with updates &rarr; HLD, not centroid",
    "Subtree queries only &rarr; Euler tour",
    "The graph is not a tree &rarr; you need a block-cut / bridge tree first, or a different tool",
    "Offline queries that Mo's on trees can handle more simply",
  ],
  table: [
    ["Count pairs at distance k", "Through-centroid distances, then recurse", "Centroid + freq array"],
    ["Nearest painted node", "Store min-dist at each centroid ancestor", "Online centroid tree"],
    ["XOR / weighted path counts", "Same, map of prefix values", "Centroid + hashmap"],
    ["Path sum with updates", "Need a mutable path structure", "HLD"],
    ["Static LCA / distance", "Two DFS, no separator needed", "Binary lifting"],
    ["<strong>Confused with:</strong> small-to-large", "Small-to-large merges child maps; centroid splits the tree", "Pair-count through a node vs sack of a subtree"],
  ],
  constraint: "<code>n &le; 10&#8309;</code> with a pair-count or online nearest-painted flavour. Each layer is linear in the live component, total <code>O(n log n)</code> (or <code>O(n log&sup2; n)</code> with maps).",
  core: [
    "To find a centroid: compute subtree sizes in the <em>alive</em> component, then walk from any node toward a child whose live size is <code>&gt; n/2</code> until none exists. That node is a centroid. Do not use global sizes — dead nodes are invisible.",
    "Solve: DFS the alive component from the centroid, compute depths (or prefix XOR, etc.), and combine pairs that go through the centroid without combining two nodes from the same child (those paths do not go through the centroid). Then mark the centroid dead and recurse.",
  ],
  invariant: "<p>In an alive component of size <code>s</code>, the centroid has every remaining piece of size <code>&le; s/2</code>. Recursion depth is therefore <code>O(log n)</code>, and every pair of nodes has a unique deepest centroid that lies on the path between them.</p>",
  array: [7, 3, 3, 1, 1, 1, 1],
  arrayLabel: "sz =",
  indexLabels: ["1", "2", "3", "4", "5", "6", "7"],
  vars: ["u", "sz", "centroid"],
  frames: [
    { note: "Full tree size 7. Node 1 has children of size 3 and 3. Both <= 7/2, so 1 is a centroid.",
      active: [0], values: { u: 1, sz: 7, centroid: 1 } },
    { note: "Solve through 1: distances into the left subtree {2,4,5} and right {3,6,7}. Pairs that cross 1 are counted here.",
      active: [0], values: { u: 1, sz: 7, centroid: "solving" } },
    { note: "Mark 1 dead. Left component {2,4,5}: sizes 3,1,1. Node 2 is the centroid.",
      active: [1], values: { u: 2, sz: 3, centroid: 2 } },
    { note: "Mark 2 dead. Leaves 4 and 5 are trivial centroids.",
      active: [3, 4], values: { u: "4,5", sz: 1, centroid: "leaves" } },
    { note: "Right component {3,6,7}: centroid 3.",
      active: [2], values: { u: 3, sz: 3, centroid: 3 } },
    { note: "Centroid tree parents: 2 and 3 under 1; 4,5 under 2; 6,7 under 3. Height 2 = log 7.",
      active: [0, 1, 2], values: { u: "tree", sz: "—", centroid: "done" } },
  ],
  mermaid: `graph TD
  c1["centroid 1"] --> c2["centroid 2"]
  c1 --> c3["centroid 3"]
  c2 --> c4["4"]
  c2 --> c5["5"]
  c3 --> c6["6"]
  c3 --> c7["7"]`,
  steps: [
    "<strong>Find centroid:</strong> size-DFS on alive nodes, then walk to a node with no child <code>&gt; s/2</code>.",
    "<strong>Solve through it</strong> — enumerate depths / prefixes per child, combine across children.",
    "<strong>Mark the centroid dead</strong> so later size-DFS skips it.",
    "<strong>Recurse</strong> on each remaining alive component.",
    "<strong>Online:</strong> store an aggregate at each centroid; a query walks the <code>O(log n)</code> ancestors.",
    "<strong>Distance</strong> from a node to a centroid ancestor = precomputed <code>dist(u)+dist(c)-2*dist[lca]</code> or a climb with stored depths.",
  ],
  code: [
    { tab: "Brute", file: "PairsDistKBrute.java",
      intro: "DFS from every node. Fine for n <= 2000.",
      code: `import java.util.*;
public class PairsDistKBrute {
    static List<Integer>[] g;
    static int dfs(int u, int p, int d, int k) {
        if (d == k) return 1;
        int c = 0;
        for (int v : g[u]) if (v != p) c += dfs(v, u, d + 1, k);
        return c;
    }
    public static void main(String[] args) {
        int n = 5, k = 2;
        g = new List[n];
        for (int i = 0; i < n; i++) g[i] = new ArrayList<>();
        int[][] e = {{0,1},{0,2},{1,3},{1,4}};
        for (int[] x : e) { g[x[0]].add(x[1]); g[x[1]].add(x[0]); }
        int pairs = 0;
        for (int u = 0; u < n; u++) pairs += dfs(u, -1, 0, k);
        System.out.println(pairs / 2);
    }
    // Input : tree 0-1-3/4, 0-2; k = 2
    // Output: 3
}` },
    { tab: "Optimal", file: "CentroidPairs.java",
      intro: "Count pairs at distance k via centroid decomposition.",
      code: `import java.util.*;
public class CentroidPairs {
    int n, k, ans;
    List<Integer>[] g;
    boolean[] dead;
    int[] sz;
    CentroidPairs(int n, int k) {
        this.n = n; this.k = k;
        g = new List[n];
        for (int i = 0; i < n; i++) g[i] = new ArrayList<>();
        dead = new boolean[n]; sz = new int[n];
    }
    void add(int u, int v) { g[u].add(v); g[v].add(u); }
    int sizeOf(int u, int p) {
        sz[u] = 1;
        for (int v : g[u]) if (v != p && !dead[v]) sz[u] += sizeOf(v, u);
        return sz[u];
    }
    int centroid(int u, int p, int s) {
        for (int v : g[u]) if (v != p && !dead[v] && sz[v] > s / 2) return centroid(v, u, s);
        return u;
    }
    void collect(int u, int p, int d, List<Integer> into) {
        into.add(d);
        for (int v : g[u]) if (v != p && !dead[v]) collect(v, u, d + 1, into);
    }
    void decompose(int src) {
        int s = sizeOf(src, -1);
        int c = centroid(src, -1, s);
        Map<Integer, Integer> all = new HashMap<>();
        all.put(0, 1);
        for (int v : g[c]) if (!dead[v]) {
            List<Integer> got = new ArrayList<>();
            collect(v, c, 1, got);
            for (int d : got) ans += all.getOrDefault(k - d, 0);
            for (int d : got) all.merge(d, 1, Integer::sum);
        }
        dead[c] = true;
        for (int v : g[c]) if (!dead[v]) decompose(v);
    }
    public static void main(String[] args) {
        CentroidPairs t = new CentroidPairs(5, 2);
        int[][] e = {{0,1},{0,2},{1,3},{1,4}};
        for (int[] x : e) t.add(x[0], x[1]);
        t.decompose(0);
        System.out.println(t.ans);
    }
    // Input : same tree, k = 2
    // Output: 3
}` },
    { tab: "Template", file: "CentroidFind.java",
      intro: "Just the find-and-mark loop. Drop your \"solve through c\" in the middle.",
      code: `import java.util.*;
public class CentroidFind {
    static List<Integer>[] g;
    static boolean[] dead;
    static int[] sz;
    static int sizeOf(int u, int p) {
        sz[u] = 1;
        for (int v : g[u]) if (v != p && !dead[v]) sz[u] += sizeOf(v, u);
        return sz[u];
    }
    static int find(int u, int p, int s) {
        for (int v : g[u]) if (v != p && !dead[v] && sz[v] > s / 2) return find(v, u, s);
        return u;
    }
    static void go(int src) {
        int c = find(src, -1, sizeOf(src, -1));
        // solve through c
        dead[c] = true;
        for (int v : g[c]) if (!dead[v]) go(v);
    }
    public static void main(String[] args) {
        int n = 5;
        g = new List[n]; dead = new boolean[n]; sz = new int[n];
        for (int i = 0; i < n; i++) g[i] = new ArrayList<>();
        int[][] e = {{0,1},{0,2},{1,3},{1,4}};
        for (int[] x : e) { g[x[0]].add(x[1]); g[x[1]].add(x[0]); }
        go(0);
        System.out.println(Arrays.toString(dead));
    }
    // Input : 5-node tree
    // Output: [true, true, true, true, true]
}` },
  ],
  complexity: {
    time: "O(n log n)",
    space: "O(n)",
    derivation: [
      "<p>Finding a centroid is linear in the live component. Each node is live in <code>O(log n)</code> layers because every split halves size. Total work is therefore <code>O(n log n)</code>, plus whatever the through-centroid combine costs (maps add a log).</p>",
    ],
    compare: [
      ["DFS from every node", "O(n^2)", "O(n)", "n <= 2000"],
      ["Centroid", "O(n log n)", "O(n)", "Pair counts, online nearest"],
      ["HLD", "O(log^2 n)/query", "O(n)", "Path aggregates, not pairs"],
      ["Small-to-large", "O(n log n)", "O(n)", "Subtree-sack problems"],
    ],
  },
  pitfalls: [
    { title: "Using global subtree sizes",
      bug: "After a centroid dies, sizes still include dead nodes and you pick a fake centroid in a tiny piece.",
      fix: "Recompute <code>sz</code> on alive nodes only, every time you search." },
    { title: "Combining two nodes from the same child",
      bug: "Their path does not go through the centroid, so you double-count paths that a deeper layer already owns.",
      fix: "Collect one child, query against the <em>previous</em> children, then merge." },
    { title: "Forgetting to mark dead before recursing",
      bug: "The next size-DFS walks back through the centroid into other components.",
      fix: "<code>dead[c] = true</code> immediately after the through-solve, before the recursive calls." },
    { title: "O(n) allocation inside the layer",
      bug: "<code>new int[n]</code> freq arrays per centroid blow memory and time to <code>O(n&sup2;)</code>.",
      fix: "Reuse a global freq array and roll back, or use a map of the depths you actually saw." },
    { title: "Distance to a centroid ancestor via naive walk",
      bug: "Online queries become <code>O(n)</code> if you climb the original tree.",
      fix: "Precompute LCA, or store <code>dist(u, centroid)</code> while building the centroid tree." },
  ],
  variants: [
    ["Online nearest painted", "Each centroid stores min distance to a painted node in its layer. Query mins over ancestors.", "ans = min(ans, stored[c] + dist(u,c))", "CF 342E"],
    ["XOR / weighted", "Replace depth with prefix XOR or weight; combine with a hashmap.", "ans += map.get(need ^ pref)", "CF 161D variant"],
    ["Keep the centroid tree", "parent[c] = the centroid that split you; height O(log n).", "for (int x = u; x != -1; x = cpar[x])", "CF 321C"],
  ],
  followups: [
    ["Does every tree have a centroid?",
      "<p>Yes. Walk from any node toward a child of size <code>&gt; n/2</code>. The walk ends: a node with no such child exists, and that node is a centroid. At most two adjacent centroids exist.</p>"],
    ["Why not use HLD for pair counts?",
      "<p>HLD gives you path <em>aggregates</em>, not an enumeration of pairs. Counting pairs that satisfy a numeric constraint needs a separator so you can join two independent sides.</p>"],
    ["What if the \"tree\" has extra edges?",
      "<p>Build the block-cut or bridge-block tree first, then decompose that. Centroid decomposition is defined on trees.</p>"],
    ["How do you roll back a frequency array?",
      "<p>Collect the list of depths you incremented and decrement them after the combine. Clearing <code>int[n]</code> each layer is <code>O(n&sup2;)</code>.</p>"],
  ],
  problems: [
    cf("161D", "Distance in Tree", "Medium", "Pairs at distance k — the classic"),
    cf("321C", "Ciel the Commander", "Medium", "Build the centroid tree, assign ranks"),
    cf("342E", "Xenia and Tree", "Hard", "Online nearest painted"),
    cf("716E", "Digit Tree", "Hard", "Centroid + digit prefixes"),
    { url: "https://leetcode.com/problems/tree-diameter/", name: "Tree Diameter", badge: "lc", tag: "LC 543 variant", level: "Easy", pattern: "Warm-up: one DFS, not centroid" },
    { url: "https://leetcode.com/problems/all-nodes-distance-k-in-binary-tree/", name: "All Nodes Distance K", badge: "lc", tag: "LC 863", level: "Medium", pattern: "Single-source distances" },
    { url: "https://atcoder.jp/contests/abc291/tasks/abc291_f", name: "ABC 291 F", badge: "atc", tag: "ABC 291F", level: "Medium", pattern: "Shortest paths through a node" },
    { url: "https://www.spoj.com/problems/QTREE5/", name: "QTREE5", badge: "gfg", tag: "SPOJ", level: "Hard", pattern: "Online nearest painted" },
  ],
  recap: [
    "Centroid: every remaining piece has size at most half.",
    "Solve through it, mark dead, recurse — depth log n.",
    "Combine across children, never inside one child.",
    "Recompute live sizes every search.",
    "Online: store an aggregate at each centroid ancestor.",
  ],
  oneliner: "c = centroid(alive); solveThrough(c); dead[c]=true; recurse(components);",
}),

/* ============================== 3. small-to-large-merging ============= */
pack({
  id: "small-to-large-merging",
  difficulty: "Medium",
  readTime: "22 min",
  tagline: "Always merge the smaller sack into the larger. Each node is moved <code>O(log n)</code> times, so subtree-map problems become <code>O(n log n)</code>.",
  tags: ["dsu on tree", "small to large", "sack", "P2"],
  prereqs: [
    ["DFS & Components", "../07-graphs-core/dfs-and-components.html"],
    ["Sorting & Comparators", "../02-sorting-hashing-bits/sorting-and-comparators.html"],
  ],
  why: [
    "A whole family of tree problems wants, for every node, some statistic of its subtree: number of distinct colours, the most frequent colour, a map of values. Building a fresh <code>HashMap</code> per node and inserting every descendant is <code>O(n&sup2;)</code>.",
    "Small-to-large (also called DSU-on-tree) keeps one map per subtree and always merges the smaller into the larger. When a value moves, the map it lives in at least doubles, so each value moves <code>O(log n)</code> times. Total is <code>O(n log n)</code> map operations.",
    "The implementation is a DFS that identifies the heaviest child, computes it first and <em>keeps</em> its map as the parent's sack, then merges the lighter children in. That is the same heavy-child idea as HLD, used for maps instead of paths.",
  ],
  insight: "A value that is copied into a larger map now sits in a container at least twice as big. It can be copied at most <code>log n</code> times before the map is the whole tree.",
  yes: [
    "For every node, a statistic of the multiset of values in its subtree",
    "\"Number of distinct colours in the subtree\"",
    "\"Most frequent colour in the subtree\" (CF 600E Lomsat gelral)",
    "You would write <code>map[u] = merge(map[children])</code> if that were cheap",
    "<code>n &le; 10&#8309;</code> with a subtree-of-values flavour",
  ],
  no: [
    "Path queries &rarr; HLD",
    "Pair counts that cross a node &rarr; centroid",
    "The statistic is a simple sum / min you can compute in one DFS without a map",
    "Updates between queries that invalidate sacks &rarr; you need a persistent or segment-tree-of-maps structure",
  ],
  table: [
    ["Distinct values per subtree", "Keep a HashSet, merge small into large", "Small-to-large"],
    ["Mode / most frequent colour", "Keep counts + a \"best\" pair, merge", "CF 600E"],
    ["k-th in subtree", "Ordered set / policy map, merge", "Small-to-large + TreeMap"],
    ["Path aggregate", "Not a subtree sack", "HLD"],
    ["Pairs at distance k", "Need a separator", "Centroid"],
    ["<strong>Confused with:</strong> DSU union-by-size", "Same doubling idea, different object (components vs sacks)", "Both are small-into-large"],
  ],
  constraint: "<code>n &le; 10&#8309;</code> with a per-subtree map. HashMap operations make the hidden constant larger than a Fenwick tree; it still passes typical 2-second Java limits.",
  core: [
    "DFS computes subtree sizes, then processes the heavy child first <em>without clearing</em> its map. That map becomes the parent's sack. Each light child is computed, merged in, and can then be discarded.",
    "If you need the answer at every node, record it after the light children are merged and before you return. If a caller is a light child of someone else, you will rebuild this sack from scratch next time — that is paid for by the doubling bound.",
  ],
  invariant: "<p>When a key is inserted into a larger map, the map size at least doubles. Each of the <code>n</code> values is therefore moved <code>O(log n)</code> times, and the whole DFS is <code>O(n log n)</code> map operations.</p>",
  array: [1, 2, 2, 3, 1, 3, 2],
  arrayLabel: "color =",
  indexLabels: ["1", "2", "3", "4", "5", "6", "7"],
  vars: ["u", "sack", "distinct"],
  frames: [
    { note: "Leaves first. Node 4 colour 3: sack {3:1}, distinct = 1.",
      active: [3], values: { u: 4, sack: "{3:1}", distinct: 1 } },
    { note: "Node 5 colour 1: sack {1:1}.",
      active: [4], values: { u: 5, sack: "{1:1}", distinct: 1 } },
    { note: "Node 2 colour 2, children 4 and 5. Keep 4's sack, merge 5: {3:1,1:1,2:1}, distinct = 3.",
      active: [1], values: { u: 2, sack: "{1,2,3}", distinct: 3 } },
    { note: "Node 6 colour 3, node 7 colour 2 — leaves.",
      active: [5, 6], values: { u: "6,7", sack: "{3},{2}", distinct: 1 } },
    { note: "Node 3 colour 2, merge 6 and 7: {3:1,2:2}, distinct = 2.",
      active: [2], values: { u: 3, sack: "{2:2,3:1}", distinct: 2 } },
    { note: "Root 1 colour 1. Keep the larger child sack (node 2, size 3), merge node 3: distinct = 3.",
      active: [0], values: { u: 1, sack: "{1,2,3}", distinct: 3 } },
  ],
  mermaid: `graph TD
  a["sack of 2 size 3"] --> b["keep it as sack of 1"]
  c["sack of 3 size 2"] --> d["merge into 1"]
  b --> e["each key moved once"]
  d --> e`,
  steps: [
    "<strong>DFS sizes</strong> so you know the heavy child.",
    "<strong>Recurse heavy first</strong> and steal its map — do not copy.",
    "<strong>Recurse each light child</strong>, merge its map into the stolen one, then drop it.",
    "<strong>Insert</strong> the node's own value.",
    "<strong>Record</strong> the answer for this node.",
    "<strong>If this node is a light child</strong> of its parent, the parent will rebuild; that is fine.",
  ],
  code: [
    { tab: "Brute", file: "DistinctBrute.java",
      intro: "Rebuild a set from every descendant. O(n^2).",
      code: `import java.util.*;
public class DistinctBrute {
    static List<Integer>[] g;
    static int[] col, ans;
    static Set<Integer> dfs(int u, int p) {
        Set<Integer> s = new HashSet<>();
        s.add(col[u]);
        for (int v : g[u]) if (v != p) s.addAll(dfs(v, u));
        ans[u] = s.size();
        return s;
    }
    public static void main(String[] args) {
        int n = 7;
        g = new List[n];
        for (int i = 0; i < n; i++) g[i] = new ArrayList<>();
        int[][] e = {{0,1},{0,2},{1,3},{1,4},{2,5},{2,6}};
        for (int[] x : e) { g[x[0]].add(x[1]); g[x[1]].add(x[0]); }
        col = new int[] {1, 2, 2, 3, 1, 3, 2};
        ans = new int[n];
        dfs(0, -1);
        System.out.println(Arrays.toString(ans));
    }
    // Input : colours [1,2,2,3,1,3,2]
    // Output: [3, 3, 2, 1, 1, 1, 1]
}` },
    { tab: "Optimal", file: "SmallToLarge.java",
      intro: "Steal the heavy child's map, merge the rest.",
      code: `import java.util.*;
public class SmallToLarge {
    List<Integer>[] g;
    int[] col, sz, heavy, ans;
    List<Map<Integer, Integer>> sack;
    SmallToLarge(int n) {
        g = new List[n];
        for (int i = 0; i < n; i++) g[i] = new ArrayList<>();
        col = new int[n]; sz = new int[n]; heavy = new int[n];
        Arrays.fill(heavy, -1); ans = new int[n];
        sack = new ArrayList<>();
        for (int i = 0; i < n; i++) sack.add(null);
    }
    void add(int u, int v) { g[u].add(v); g[v].add(u); }
    void dfsSz(int u, int p) {
        sz[u] = 1;
        int best = 0;
        for (int v : g[u]) if (v != p) {
            dfsSz(v, u); sz[u] += sz[v];
            if (sz[v] > best) { best = sz[v]; heavy[u] = v; }
        }
    }
    Map<Integer, Integer> merge(Map<Integer, Integer> a, Map<Integer, Integer> b) {
        if (a.size() < b.size()) { Map<Integer, Integer> t = a; a = b; b = t; }
        for (var e : b.entrySet()) a.merge(e.getKey(), e.getValue(), Integer::sum);
        return a;
    }
    void dfs(int u, int p) {
        Map<Integer, Integer> cur = new HashMap<>();
        if (heavy[u] != -1) { dfs(heavy[u], u); cur = sack.get(heavy[u]); }
        for (int v : g[u]) if (v != p && v != heavy[u]) {
            dfs(v, u);
            cur = merge(cur, sack.get(v));
        }
        cur.merge(col[u], 1, Integer::sum);
        ans[u] = cur.size();
        sack.set(u, cur);
    }
    public static void main(String[] args) {
        SmallToLarge t = new SmallToLarge(7);
        int[][] e = {{0,1},{0,2},{1,3},{1,4},{2,5},{2,6}};
        for (int[] x : e) t.add(x[0], x[1]);
        t.col = new int[] {1, 2, 2, 3, 1, 3, 2};
        t.dfsSz(0, -1); t.dfs(0, -1);
        System.out.println(Arrays.toString(t.ans));
    }
    // Input : same tree and colours
    // Output: [3, 3, 2, 1, 1, 1, 1]
}` },
    { tab: "Template", file: "MergeSmallIntoLarge.java",
      intro: "The doubling merge, usable on arrays of sets too.",
      code: `import java.util.*;
public class MergeSmallIntoLarge {
    static <T> Set<T> merge(Set<T> a, Set<T> b) {
        if (a.size() < b.size()) { Set<T> t = a; a = b; b = t; }
        a.addAll(b);
        return a;
    }
    public static void main(String[] args) {
        Set<Integer> a = new HashSet<>(List.of(1, 2, 3));
        Set<Integer> b = new HashSet<>(List.of(3, 4));
        Set<Integer> c = merge(a, b);
        System.out.println(c.size());
    }
    // Input : {1,2,3} and {3,4}
    // Output: 4
}` },
  ],
  complexity: {
    time: "O(n log n) map operations",
    space: "O(n)",
    derivation: [
      "<p>Each time a key is copied, it lands in a map at least twice as large. A key starting in a singleton can be copied at most <code>log n</code> times. <code>n</code> keys give <code>O(n log n)</code>.</p>",
    ],
    compare: [
      ["Rebuild a set per node", "O(n^2)", "O(n)", "n <= 2000"],
      ["Small-to-large", "O(n log n)", "O(n)", "Subtree sacks"],
      ["Euler + Mo", "O((n+q) sqrt n)", "O(n)", "Offline, arbitrary ranges"],
      ["HLD + segtree-of-sets", "O(log^2 n)/query", "O(n log n)", "When you also need path queries"],
    ],
  },
  pitfalls: [
    { title: "Copying the heavy child's map",
      bug: "<code>new HashMap<>(heavyMap)</code> destroys the bound — you pay linear in the heavy size at every level.",
      fix: "Steal the reference. The heavy child does not need its map after you have recorded <code>ans[heavy]</code>." },
    { title: "Merging large into small",
      bug: "The doubling argument requires the <em>target</em> to be the larger map.",
      fix: "Swap if <code>a.size() &lt; b.size()</code> before iterating." },
    { title: "Recording the answer after discarding the sack",
      bug: "You merge, return, then try to read a map you already cleared.",
      fix: "Write <code>ans[u]</code> while the merged map still belongs to <code>u</code>." },
    { title: "Using this for path queries",
      bug: "A sack is the subtree multiset, not the path. Path problems look similar in the statement and are HLD.",
      fix: "Ask: is the queried set a subtree or a path? Subtree &rarr; small-to-large; path &rarr; HLD." },
    { title: "HashMap on tight limits without reserving",
      bug: "Rehash storms on Java 8 HashMap can TLE at n = 2e5.",
      fix: "Size-hint the first map, or use arrays when values are compressed to <code>[1, n]</code>." },
  ],
  variants: [
    ["Mode of the subtree", "Track a running (bestCount, bestColor) while merging counts.", "if (cnt > best) update", "CF 600E"],
    ["Keep all maps", "Persistent / immutable maps if a parent still needs the child sack later.", "more memory", "rare"],
    ["DSU union-by-size", "Same doubling, on connectivity instead of tree sacks.", "if (sz[a]<sz[b]) swap", "Kruskal"],
  ],
  followups: [
    ["Why is this also called DSU-on-tree?",
      "<p>You are unioning child sacks into a parent the same way DSU unions components — always small into large. The \"DSU\" is a metaphor; there is no rollback-free disjoint-set structure unless you add one.</p>"],
    ["Can you answer path queries this way?",
      "<p>No. A sack is the subtree. For a path you need HLD, or a persistent segment tree on the Euler / DFS order.</p>"],
    ["What if values are large (1e9)?",
      "<p>HashMap is fine. If you need order statistics, compress coordinates first and use a Fenwick of counts inside the sack.</p>"],
    ["How do you handle updates to a node's colour?",
      "<p>Small-to-large is a static DFS. Updates need a different structure: HLD + fenwick-of-colours, or a segment tree with sets.</p>"],
  ],
  problems: [
    cf("600E", "Lomsat gelral", "Hard", "The canonical small-to-large problem"),
    cf("375D", "Tree and Queries", "Hard", "Subtree distinct with a threshold"),
    cf("1009F", "Dominant Indices", "Hard", "Mode of depths in a subtree"),
    cf("208E", "Blood Cousins", "Medium", "Subtree + binary lifting"),
    { url: "https://leetcode.com/problems/number-of-nodes-in-the-sub-tree-with-the-same-label/", name: "Nodes With Same Label", badge: "lc", tag: "LC 1519", level: "Medium", pattern: "26-letter sack, no merge needed" },
    { url: "https://leetcode.com/problems/unique-number-of-occurrences/", name: "Unique Number of Occurrences", badge: "lc", tag: "LC 1207", level: "Easy", pattern: "Warm-up on maps" },
    { url: "https://atcoder.jp/contests/abc183/tasks/abc183_f", name: "ABC 183 F", badge: "atc", tag: "ABC 183F", level: "Hard", pattern: "DSU + small-to-large maps" },
    { url: "https://www.spoj.com/problems/DQUERY/", name: "DQUERY", badge: "gfg", tag: "SPOJ", level: "Medium", pattern: "Distinct on arrays — Mo / fenwick" },
  ],
  recap: [
    "Always merge the smaller map into the larger.",
    "Steal the heavy child's map; do not copy it.",
    "Each value moves O(log n) times because the host doubles.",
    "Record ans[u] before returning the sack.",
    "Subtree sacks, not paths — paths are HLD.",
  ],
  oneliner: "if (a.size() < b.size()) swap; a.mergeAll(b); // each key doubles",
}),
];

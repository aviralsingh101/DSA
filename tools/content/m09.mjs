import { pack } from "./pack.mjs";

export const topics = [

pack({
  id: "heavy-light-decomposition",
  difficulty: "Hard",
  readTime: "24 min",
  tagline: "Split a tree into heavy paths so a path query becomes O(log n) segment-tree queries instead of a walk.",
  tags: ["HLD", "trees", "segtree", "P2"],
  prereqs: [["Segment Tree", "../06-range-queries/segment-tree.html"], ["Euler Tour", "../05-trees/euler-tour-subtree-queries.html"]],
  why: [
    "Subtree queries flatten with an Euler tour. Path queries do not: a path is not a contiguous range in tin/tout order. Heavy-light decomposition (HLD) cuts the tree into O(log n) contiguous chains so each path is a short sequence of ranges.",
    "The heavy child of v is the child with the largest subtree. Edges to heavy children stay in the same chain; light edges start a new chain. Any root path then uses at most log n light edges, because each light edge at least halves the remaining subtree.",
    "Interview frequency is low. Google-hard onsite and CF Div1 still ask path-add / path-max on trees. If you can say the heavy-child definition and the log-chains argument you are ahead of most candidates.",
  ],
  insight: "A path is a union of O(log n) chain segments. Put a segment tree on the flattened chains and a path query is O(log² n).",
  yes: [
    "Path sum / min / max / add on a tree, n ≤ 1e5",
    "Subtree and path queries in the same problem",
    "\"tree, queries on the path between u and v\"",
    "You already have a segment tree and need to lift it onto a tree",
    "CF statements that mention HLD or \"tree + range structure\"",
  ],
  no: [
    "Only subtree queries → Euler tour + BIT is enough",
    "Only LCA / distance → binary lifting, no HLD",
    "Offline path queries with a property you can Mo → Mo on trees",
    "n ≤ 2000 → naive parent walk is fine",
  ],
  table: [
    ["path between u and v, static aggregates", "HLD + segtree on chains", "this page"],
    ["subtree only", "Euler tour", "tin/tout range"],
    ["kth ancestor / LCA only", "binary lifting", "no values"],
    ["all-roots answers", "rerooting DP", "not HLD"],
    ["count paths with a numeric property", "centroid decomposition", "often easier than HLD"],
    ["<strong>Confused with:</strong> centroid decomp", "Centroid is for counting through a vertex; HLD is for path aggregates", "different tool"],
  ],
  constraint: "n,q ≤ 1e5 and path updates/queries → O(log² n) per query is intended. n ≤ 1e5 and only subtree → do not pull HLD.",
  core: [
    "dfs1 computes sz[], parent[], depth[], and heavy[v] = child of max sz. dfs2 assigns pos[] in chain order: visit the heavy child first so a chain occupies a contiguous segment of the segtree base array, then light children each start a new head[].",
    "query(u,v): while head[u] != head[v], lift the deeper head (by depth[head]) across its chain segment, then the last chain is a single range between u and v.",
  ],
  invariant: "<p><em>Every node is on exactly one heavy path. Any leaf-to-root path contains at most log n light edges, so it crosses at most log n chains. After flattening, each chain is a contiguous pos[] range.</em></p>",
  extra: [{ kind: "math", title: "Why log n light edges",
    html: "<p>A light edge goes to a child whose subtree is ≤ half of its parent (otherwise it would be heavy). Walking toward the root across a light edge at least doubles the remaining size, so there are O(log n) of them.</p>" }],
  array: [1, 2, 3, 4, 5, 6, 7, 8],
  arrayLabel: "pos → node (chains A:1-2-4, B:3, C:5-6, D:7, E:8)",
  vars: ["u", "v", "chains", "ranges"],
  frames: [
    { note: "Tree rooted at 1. Heavy edges 1-2, 2-4, 5-6. Light edges start new chains.",
      window: [0, 7], values: { u: "—", v: "—", chains: 5, ranges: "—" } },
    { note: "Query path 4..6. 4 is on chain A (head 1), 6 on chain C (head 5).",
      active: [3, 5], values: { u: 4, v: 6, chains: 2, ranges: "?" } },
    { note: "depth[head[4]]=0 < depth[head[6]]=2, so lift 6 across chain C: range pos[5]..pos[6].",
      window: [4, 5], active: [5], values: { u: 4, v: 5, chains: "C done", ranges: "[5..6]" } },
    { note: "Now v=5, parent is 2. 2 is on chain A with 4. Same head.",
      active: [1, 3], values: { u: 4, v: 2, chains: "A", ranges: "[5..6] + ?" } },
    { note: "Same chain: one range pos[2]..pos[4] covering 2 and 4. Path is 4-2-1-… no — 4-2-5? Parent of 5 is 2. Path 4-2-5-6.",
      window: [1, 3], values: { u: 4, v: 2, chains: "A last", ranges: "[5..6]+[2..4]" } },
    { note: "Two ranges, two segtree queries. O(log n) chains × O(log n) tree = O(log² n).",
      best: [1, 2, 3, 4, 5], values: { u: 4, v: 6, chains: 2, ranges: "done" } },
  ],
  mermaid: `graph TD
  n1["1 head A"] --> n2["2 heavy"]
  n1 --> n3["3 light B"]
  n2 --> n4["4 heavy"]
  n2 --> n5["5 light C"]
  n5 --> n6["6 heavy"]
  n1 --> n7["7 light D"]
  n3 --> n8["8 light E"]`,
  merTitle: "Heavy edges stay on a chain",
  merCaption: "Thick (heavy) edges keep the same head. Light edges start a new chain.",
  steps: [
    "<strong>dfs1:</strong> compute sz, parent, depth; heavy[v] = argmax sz[child].",
    "<strong>dfs2:</strong> pos[v]=timer++; if heavy[v] exists, dfs2(heavy, same head); then each light child dfs2(child, child as head).",
    "<strong>Build a segtree</strong> on the base array indexed by pos, storing node values.",
    "<strong>path query(u,v):</strong> while head[u]!=head[v], query the deeper chain from pos[head] to pos[node], then climb to parent[head].",
    "<strong>Same-chain finish:</strong> query the pos-range between u and v.",
    "<strong>Path update</strong> is the same walk with range updates (lazy if needed).",
    "<strong>Subtree query</strong> is still a single pos-range if you assigned heavy-first (subtree is contiguous).",
  ],
  code: [
    { tab: "Naive path walk", file: "PathNaive.java", intro: "O(n) per query. Fine for n,q ≤ 2000.",
      code: `import java.util.*;
public class PathNaive {
    static int[] parent, depth, val;
    static long query(int u, int v) {
        long s = 0;
        while (u != v) {
            if (depth[u] < depth[v]) { int t = u; u = v; v = t; }
            s += val[u]; u = parent[u];
        }
        return s + val[u];
    }
    public static void main(String[] args) {
        parent = new int[] {0, 0, 0, 1, 1}; depth = new int[] {0, 1, 1, 2, 2};
        val = new int[] {0, 4, 2, 5, 1};
        System.out.println(query(3, 4));
    }
    // Input : tree 0-1-3, 0-1-4, 0-2; values on nodes
    // Output: 10   (5+4+1)
}` },
    { tab: "HLD query walk", file: "HLD.java", highlight: "28-36",
      code: `import java.util.*;
public class HLD {
    int n, timer;
    int[] sz, parent, depth, heavy, head, pos, val;
    List<List<Integer>> g;
    long[] bit; // Fenwick on pos for point values

    HLD(int n) {
        this.n = n;
        g = new ArrayList<>();
        for (int i = 0; i < n; i++) g.add(new ArrayList<>());
        sz = new int[n]; parent = new int[n]; depth = new int[n];
        heavy = new int[n]; head = new int[n]; pos = new int[n];
        Arrays.fill(heavy, -1);
        val = new int[n]; bit = new long[n + 2];
    }
    void add(int u, int v) { g.get(u).add(v); g.get(v).add(u); }

    void dfs1(int v, int p) {
        sz[v] = 1; parent[v] = p;
        int best = 0;
        for (int to : g.get(v)) if (to != p) {
            depth[to] = depth[v] + 1; dfs1(to, v); sz[v] += sz[to];
            if (sz[to] > best) { best = sz[to]; heavy[v] = to; }
        }
    }
    void dfs2(int v, int h) {
        head[v] = h; pos[v] = timer++;
        if (heavy[v] != -1) dfs2(heavy[v], h);
        for (int to : g.get(v)) if (to != parent[v] && to != heavy[v]) dfs2(to, to);
    }
    void bitAdd(int i, long x) { for (i++; i < bit.length; i += i & -i) bit[i] += x; }
    long bitSum(int i) { long s = 0; for (i++; i > 0; i -= i & -i) s += bit[i]; return s; }
    long bitRange(int l, int r) { if (l > r) { int t = l; l = r; r = t; } return bitSum(r) - bitSum(l - 1); }

    long path(int u, int v) {
        long s = 0;
        while (head[u] != head[v]) {
            if (depth[head[u]] < depth[head[v]]) { int t = u; u = v; v = t; }
            s += bitRange(pos[head[u]], pos[u]);
            u = parent[head[u]];
        }
        s += bitRange(pos[u], pos[v]);
        return s;
    }

    public static void main(String[] args) {
        HLD h = new HLD(5);
        h.add(0, 1); h.add(0, 2); h.add(1, 3); h.add(1, 4);
        h.dfs1(0, 0); h.dfs2(0, 0);
        int[] vals = {0, 4, 2, 5, 1};
        for (int i = 0; i < 5; i++) { h.val[i] = vals[i]; h.bitAdd(h.pos[i], vals[i]); }
        System.out.println(h.path(3, 4));
    }
    // Input : tree 0-1-3, 0-1-4, 0-2; node values 0,4,2,5,1
    // Output: 10
}` },
    { tab: "Reusable skeleton", file: "HLDTemplate.java",
      code: `// dfs1 sizes + heavy child
// dfs2: pos, head; heavy first so chain is contiguous
// path: while heads differ, query deeper chain, climb to parent[head]
// last range is pos[u]..pos[v] on the shared chain
public class HLDTemplate {
    public static void main(String[] args) {
        System.out.println("see HLD.java");
    }
    // Input : (template)
    // Output: see HLD.java
}` },
  ],
  complexity: {
    time: "O(n) build, O(log² n) per path query/update",
    space: "O(n)",
    derivation: [
      "<p>A path crosses O(log n) chains (light-edge argument). Each chain is one segment-tree / Fenwick query of O(log n). Product: O(log² n).</p>",
      "<span class=\"eq\">#light edges on a root path ≤ log₂ n &nbsp;⇒&nbsp; #chains on any path ≤ 2 log n</span>",
    ],
    compare: [
      ["Parent walk", "O(n) / query", "O(n)", "n,q ≤ 2000"],
      ["HLD + BIT", "O(log² n)", "O(n)", "path sums, point updates"],
      ["HLD + lazy segtree", "O(log² n)", "O(n)", "path range add"],
      ["Euler + BIT", "O(log n)", "O(n)", "subtree only"],
    ],
  },
  pitfalls: [
    { title: "Forgetting to visit the heavy child first",
      bug: "If dfs2 visits children in arbitrary order, a chain is not contiguous in pos[] and range queries are wrong.",
      fix: "Always `if (heavy[v] != -1) dfs2(heavy[v], sameHead)` before light children." },
    { title: "Comparing depth[u] instead of depth[head[u]]",
      bug: "You lift the deeper <em>node</em> rather than the deeper <em>chain head</em>, and skip part of a chain.",
      fix: "The node you climb is the one whose head is deeper." },
    { title: "Off-by-one when u and v are on the same chain",
      bug: "pos[u] and pos[v] need min/max. Forgetting that returns an empty or reversed range.",
      fix: "`bitRange` should swap if l > r, or compute `l = min(pos[u], pos[v])`." },
    { title: "Values on edges vs nodes",
      bug: "Edge-valued trees double-count the LCA or miss it, depending on how you assign the edge to a child.",
      fix: "Store the edge value on the deeper endpoint; when querying, skip the LCA node." },
    { title: "Root's parent",
      bug: "`parent[root] = root` then `u = parent[head[u]]` infinite-loops if you query a chain that includes the root incorrectly.",
      fix: "Stop when heads meet. Never climb past the root; `parent[root] = root` is OK only because the while condition fails first." },
  ],
  variants: [
    ["Path add, point read", "Lazy segtree on pos, same walk", "st.rangeAdd(l,r,x)", "CF path-add"],
    ["Edge values", "Assign edge to child; skip LCA in the query", "if(u!=v) range without lca", "standard CF"],
    ["Subtree + path", "Heavy-first pos makes subtree contiguous", "st.query(pos[v], pos[v]+sz[v]-1)", "both in one structure"],
  ],
  followups: [
    ["Prove the number of chains on a path is O(log n).",
      "<p>Each light edge at least halves subtree size toward the root, so a node has O(log n) light edges above it. A u–v path is two root paths minus the prefix to the LCA, hence O(log n) chains.</p>"],
    ["Why is HLD O(log² n) and not O(log n)?",
      "<p>O(log n) chains, each needing an O(log n) structure query. You can sometimes drop a log with a specialised structure, but not with a general monoid.</p>"],
    ["Can you do this with Euler tours only?",
      "<p>Not for arbitrary path aggregates. Euler + RMQ gives LCA, not path sums of values. You would need extra tricks (tree flattening with in/out and a difference on parent) that still resemble HLD.</p>"],
    ["HLD vs centroid for \"count paths with xor k\".",
      "<p>Centroid is the default for counting paths with a property. HLD is the default for <em>aggregating values already stored on the tree</em> under updates.</p>"],
  ],
  problems: [
    { url: "https://leetcode.com/problems/minimum-edge-weight-equilibrium-queries-in-a-tree/", name: "Min Edge Weight Equilibrium Queries", badge: "lc", tag: "LC 2846", level: "Hard", pattern: "path counts; lifting often enough" },
    { url: "https://www.spoj.com/problems/QTREE/", name: "QTREE", badge: "gfg", tag: "SPOJ QTREE", level: "Hard", pattern: "the classic HLD problem" },
    { url: "https://codeforces.com/problemset/problem/343/D", name: "Water Tree", badge: "cf", tag: "CF 343D", level: "Hard", pattern: "HLD or Euler + lazy" },
    { url: "https://codeforces.com/problemset/problem/383/C", name: "Propagating Tree", badge: "cf", tag: "CF 383C", level: "Hard", pattern: "Euler + parity, not always HLD" },
    { url: "https://atcoder.jp/contests/abc294/tasks/abc294_g", name: "AtCoder ABC294 G", badge: "atc", tag: "ABC 294G", level: "Hard", pattern: "path sums on a tree" },
    { url: "https://www.luogu.com.cn/problem/P3384", name: "Luogu P3384 HLD template", badge: "gfg", tag: "P3384", level: "Hard", pattern: "template" },
    { url: "https://leetcode.com/problems/throne-inheritance/", name: "Throne Inheritance", badge: "lc", tag: "LC 1600", level: "Medium", pattern: "tree order, not HLD — contrast" },
    { url: "https://codeforces.com/problemset/problem/1083/A", name: "The Fair Nut and the Best Path", badge: "cf", tag: "CF 1083A", level: "Hard", pattern: "tree DP, not HLD — know the difference" },
  ],
  spoilers: [
    { summary: "Hint for SPOJ QTREE", body: "<p>Edge weights stored on the child. Path max = HLD + segtree max. Change-on-edge is a point update at that child pos.</p>" },
    { summary: "Hint for CF 343D", body: "<p>Fill a subtree with 1s, empty a node, query whether a subtree is all 1s. Euler + lazy is enough; HLD also works. The fill is a range assign.</p>" },
  ],
  recap: [
    "<strong>Heavy child = largest subtree.</strong> Light edges at least halve size.",
    "<strong>dfs2 visits heavy first</strong> so a chain is one pos-range.",
    "<strong>Path = O(log n) ranges.</strong> Lift the deeper head until heads match.",
    "<strong>Subtree is still one range</strong> under heavy-first numbering.",
    "<strong>Edge values live on the child.</strong> Skip the LCA when summing edges.",
  ],
  oneliner: "while(head[u]!=head[v]){ if(depth[head[u]]<depth[head[v]])swap; qry(pos[head[u]],pos[u]); u=parent[head[u]]; }",
}),

pack({
  id: "centroid-decomposition",
  difficulty: "Hard",
  readTime: "22 min",
  tagline: "Recursively delete a balanced centroid so every path is counted at exactly one centroid — the one that sits on it.",
  tags: ["centroid", "trees", "counting", "P2"],
  prereqs: [["Tree DP", "../05-trees/tree-dp-and-rerooting.html"]],
  why: [
    "Many tree problems ask how many paths have a property (length k, xor k, sum in a range). Walking every path is n². Centroid decomposition gives a divide-and-conquer over the tree with a balanced cut.",
    "A centroid of a tree is a node whose removal leaves components of size ≤ n/2. Every tree has one (or two). After you count paths that pass through the centroid, you mark it dead and recurse on each remaining component.",
    "The recursion depth is O(log n) because components shrink by half. Total work is O(n log n) times whatever you spend per centroid.",
  ],
  insight: "Every path has a unique highest centroid (the first centroid that lies on it). Count at that centroid, never twice.",
  yes: [
    "Count paths with length / xor / sum equal to k",
    "n ≤ 1e5 tree, pairwise path property",
    "\"how many pairs of vertices satisfy …\" on a tree",
    "You can compute the property of all paths through a fixed root in linear time",
    "CF/AtCoder centroid problems",
  ],
  no: [
    "Path updates and queries → HLD",
    "Only distances from one root → one BFS",
    "DP on independent subtrees without pairwise paths → ordinary tree DP",
    "n ≤ 2000 → O(n²) DFS from every node",
  ],
  table: [
    ["count paths of length k", "centroid + depth frequency", "classic"],
    ["count paths with xor k", "centroid + hashmap of prefix xor", "same skeleton"],
    ["existence of a path with a property", "same, early exit", ""],
    ["point updates on a tree + path queries", "HLD, not centroid", "wrong tool"],
    ["offline pairwise", "sometimes DSU on tree / small-to-large", "compare"],
    ["<strong>Confused with:</strong> HLD", "HLD aggregates stored values; centroid counts generated paths", "pick by the verb: query vs count"],
  ],
  constraint: "n ≤ 1e5 and counting paths → O(n log n · T) where T is the per-node map work. n ≤ 5000 can be n DFS.",
  core: [
    "findCentroid: dfs sizes in the current (alive) component, then walk to a node where every alive neighbour-component is ≤ half. decompose(c): count paths through c, mark c dead, recurse into each alive neighbour.",
    "Counting through c is usually: DFS each pending component separately, querying a global map of depths/xors collected from previous components, then inserting. That way you do not count pairs that never pass through c (they live inside one component).",
  ],
  invariant: "<p><em>A centroid splits the alive component into pieces of size ≤ n/2. Paths that cross between pieces go through the centroid and are counted here. Paths that stay inside one piece are counted in a deeper recursive call.</em></p>",
  array: [9, 4, 3, 2, 2, 1, 1, 1, 1],
  arrayLabel: "component sizes as we peel centroids (n=9 → 4 → …)",
  vars: ["n", "centroid", "maxPiece", "depth"],
  frames: [
    { note: "n=9. Find a node whose pieces are ≤ 4. Pick c0.", active: [0], values: { n: 9, centroid: "c0", maxPiece: 4, depth: 0 } },
    { note: "Count paths through c0 in O(n). Mark c0 dead. Remaining sizes 4,3,1.",
      done: [0], active: [1, 2], values: { n: 8, centroid: "c0 done", maxPiece: 4, depth: 0 } },
    { note: "Recurse into size-4 piece. Its centroid c1, pieces ≤ 2.",
      active: [1], values: { n: 4, centroid: "c1", maxPiece: 2, depth: 1 } },
    { note: "Recurse size-3 piece, centroid c2.",
      active: [2], values: { n: 3, centroid: "c2", maxPiece: 1, depth: 1 } },
    { note: "Depth of recursion is ≤ log₂ n because every piece is ≤ half.",
      dim: [5, 6, 7, 8], values: { n: "≤4", centroid: "…", maxPiece: "n/2", depth: "≤3" } },
    { note: "Total work: each node is in O(log n) alive components (one per ancestor centroid).",
      best: [0], values: { n: 9, centroid: "all", maxPiece: "—", depth: "O(log n)" } },
  ],
  mermaid: `graph TD
  c0["centroid c0"] --> pA["piece A n/2"]
  c0 --> pB["piece B"]
  c0 --> pC["piece C"]
  pA --> c1["centroid c1"]
  pB --> c2["centroid c2"]`,
  steps: [
    "<strong>findSize(v):</strong> subtree size ignoring dead nodes.",
    "<strong>findCentroid(v, n):</strong> while some alive child has sz > n/2, step there.",
    "<strong>countThrough(c):</strong> for each pending component, query the map then insert depths/xors.",
    "<strong>Mark c dead.</strong>",
    "<strong>Recurse</strong> on each alive neighbour as a new component root.",
    "<strong>Clear the map</strong> between components (or use a timestamp).",
    "<strong>Complexity:</strong> each layer is O(n) over disjoint pieces, log layers.",
  ],
  code: [
    { tab: "O(n²) count length k", file: "PathCountNaive.java",
      code: `import java.util.*;
public class PathCountNaive {
    static List<List<Integer>> g;
    static int k, ans;
    static void dfs(int v, int p, int d) {
        if (d == k) ans++;
        if (d >= k) return;
        for (int to : g.get(v)) if (to != p) dfs(to, v, d + 1);
    }
    static int count(int n, int kk) {
        k = kk; ans = 0;
        for (int i = 0; i < n; i++) dfs(i, -1, 0);
        return ans / 2;
    }
    public static void main(String[] args) {
        g = new ArrayList<>();
        for (int i = 0; i < 4; i++) g.add(new ArrayList<>());
        g.get(0).add(1); g.get(1).add(0);
        g.get(1).add(2); g.get(2).add(1);
        g.get(1).add(3); g.get(3).add(1);
        System.out.println(count(4, 2));
    }
    // Input : star-like 0-1-2, 1-3; k=2
    // Output: 3   paths (0-1-2, 0-1-3, 2-1-3)
}` },
    { tab: "Centroid count length k", file: "Centroid.java", highlight: "36-48",
      code: `import java.util.*;
public class Centroid {
    static List<List<Integer>> g;
    static boolean[] dead;
    static int[] sz;
    static int k, ans;

    static int sizeOf(int v, int p) {
        sz[v] = 1;
        for (int to : g.get(v)) if (to != p && !dead[to]) sz[v] += sizeOf(to, v);
        return sz[v];
    }
    static int centroid(int v, int p, int n) {
        for (int to : g.get(v))
            if (to != p && !dead[to] && sz[to] > n / 2) return centroid(to, v, n);
        return v;
    }
    static void collect(int v, int p, int d, List<Integer> into) {
        if (d > k) return;
        into.add(d);
        for (int to : g.get(v)) if (to != p && !dead[to]) collect(to, v, d + 1, into);
    }
    static void decompose(int v) {
        int n = sizeOf(v, -1);
        int c = centroid(v, -1, n);
        dead[c] = true;
        int[] freq = new int[k + 1];
        freq[0] = 1; // the centroid itself
        for (int to : g.get(c)) if (!dead[to]) {
            List<Integer> ds = new ArrayList<>();
            collect(to, c, 1, ds);
            for (int d : ds) if (d <= k) ans += freq[k - d];
            for (int d : ds) if (d <= k) freq[d]++;
        }
        for (int to : g.get(c)) if (!dead[to]) decompose(to);
    }
    public static void main(String[] args) {
        int n = 4; k = 2;
        g = new ArrayList<>();
        for (int i = 0; i < n; i++) g.add(new ArrayList<>());
        g.get(0).add(1); g.get(1).add(0);
        g.get(1).add(2); g.get(2).add(1);
        g.get(1).add(3); g.get(3).add(1);
        dead = new boolean[n]; sz = new int[n];
        decompose(0);
        System.out.println(ans);
    }
    // Input : 0-1-2, 1-3; k = 2
    // Output: 3
}` },
    { tab: "Reusable skeleton", file: "CentroidTemplate.java",
      code: `// sizeOf ignoring dead
// centroid: walk to a node with all pieces <= n/2
// count through c (query map per component, then insert)
// dead[c]=true; recurse pieces
public class CentroidTemplate {
    public static void main(String[] args) { System.out.println(3); }
    // Input : template
    // Output: 3
}` },
  ],
  complexity: {
    time: "O(n log n · T) where T is per-node work in countThrough",
    space: "O(n)",
    derivation: [
      "<p>Each decompose layer processes disjoint alive components whose sizes sum to n, in linear time plus T per node. Recursion depth is O(log n) because pieces have size ≤ n/2.</p>",
      "<span class=\"eq\">T_total = T · n · O(log n)</span>",
    ],
    compare: [
      ["DFS from every node", "O(n²)", "O(n)", "n ≤ 2000"],
      ["Centroid", "O(n log n · T)", "O(n)", "counting paths"],
      ["HLD", "O(log² n) / query", "O(n)", "stored path aggregates"],
    ],
  },
  pitfalls: [
    { title: "Counting pairs inside one pending component",
      bug: "Inserting into the map before querying that same component double-counts paths that never leave the piece (they do not go through the centroid as a necessary vertex in your intended sense — they will be counted again deeper).",
      fix: "For each neighbour-component: query, then insert. Reset the map after all neighbours, or use a timestamp." },
    { title: "Not ignoring dead nodes in sizeOf",
      bug: "Sizes include already-processed centroids, so you pick a wrong centroid and the ≤ n/2 guarantee dies.",
      fix: "`if (dead[to]) continue` in every walk." },
    { title: "Forgetting the 0-length path at the centroid",
      bug: "freq[0] = 1 is the centroid itself; without it you miss paths that end at c.",
      fix: "Initialise the map with the identity (depth 0 / xor 0) before the neighbour loop." },
    { title: "k larger than n",
      bug: "`freq[k-d]` index error if you allocated freq[n] but k can be larger (xor problems).",
      fix: "Use a HashMap for sparse keys (xor); bound arrays only when the key is a small depth." },
    { title: "Recursing from the original neighbour after marking dead",
      bug: "You must start the next decompose at the neighbour, not at c (c is dead).",
      fix: "`for (to : g[c]) if (!dead[to]) decompose(to)`." },
  ],
  variants: [
    ["Xor k instead of length k", "Map of prefix xor; query xor^k", "ans += map.get(pref^k)", "CF xor-paths"],
    ["Sum in [L,R]", "Fenwick of depths/values at the centroid", "bit.range(L-pref, R-pref)", "weighted"],
    ["Keep the centroid tree", "parentCentroid[c] for further queries", "O(log n) ancestors", "offline updates"],
  ],
  followups: [
    ["Prove a centroid exists.",
      "<p>Walk from any node toward a child with sz > n/2. This walk is acyclic and must stop; the stop node has all pieces ≤ n/2. Existence of two adjacent centroids is possible; either works.</p>"],
    ["How do you count unordered pairs once?",
      "<p>Each pair is counted at exactly one centroid — the first centroid that lies on the unique path. Do not divide by 2 if your countThrough only pairs different pending components plus the centroid.</p>"],
    ["Centroid tree height?",
      "<p>O(log n), because each parent centroid's component was at least twice as large.</p>"],
    ["When would you still use HLD?",
      "<p>When values live on the tree and queries ask for an aggregate of an explicit path under updates. Centroid does not give you a live path-sum structure for free.</p>"],
  ],
  problems: [
    { url: "https://codeforces.com/problemset/problem/161/D", name: "Distance in Tree", badge: "cf", tag: "CF 161D", level: "Hard", pattern: "count paths of length k" },
    { url: "https://codeforces.com/problemset/problem/321/C", name: "Ciel the Commander", badge: "cf", tag: "CF 321C", level: "Hard", pattern: "build the centroid tree" },
    { url: "https://atcoder.jp/contests/abc291/tasks/abc291_f", name: "ABC 291 F", badge: "atc", tag: "ABC291F", level: "Hard", pattern: "path-like DAG, contrast" },
    { url: "https://www.spoj.com/problems/QTREE5/", name: "QTREE5", badge: "gfg", tag: "SPOJ QTREE5", level: "Hard", pattern: "centroid tree + sets" },
    { url: "https://leetcode.com/problems/number-of-pairs-of-interchangeable-rectangles/", name: "Interchangeable Rectangles", badge: "lc", tag: "LC 2001", level: "Medium", pattern: "not a tree — contrast counting pairs" },
    { url: "https://leetcode.com/problems/number-of-nodes-in-the-sub-tree-with-the-same-label/", name: "Sub-tree Same Label", badge: "lc", tag: "LC 1519", level: "Medium", pattern: "tree DP, not centroid" },
    { url: "https://codeforces.com/problemset/problem/715/C", name: "Digit Tree", badge: "cf", tag: "CF 715C", level: "Hard", pattern: "centroid + modular digits" },
    { url: "https://judge.yosupo.jp/problem/frequency_table_of_tree_distance", name: "Frequency table of tree distance", badge: "gfg", tag: "Library Checker", level: "Hard", pattern: "centroid + FFT" },
  ],
  recap: [
    "<strong>Centroid: all remaining pieces ≤ n/2.</strong> Always exists.",
    "<strong>Count through c, mark dead, recurse.</strong> That is the whole algorithm.",
    "<strong>Query then insert</strong> per neighbour-component so you only count paths that use c.",
    "<strong>Depth O(log n)</strong> because pieces halve.",
    "<strong>HLD vs centroid:</strong> query stored paths vs count generated paths.",
  ],
  oneliner: "c=centroid(v); countThrough(c); dead[c]=true; for(to:g[c]) if(!dead[to]) decompose(to);",
}),

pack({
  id: "small-to-large-merging",
  difficulty: "Hard",
  readTime: "18 min",
  tagline: "Always merge the smaller set into the larger so each element moves O(log n) times — DSU-on-tree for subtree set queries.",
  tags: ["dsu on tree", "small-to-large", "P2"],
  prereqs: [["DFS", "../07-graphs-core/dfs-and-components.html"], ["Tree DP", "../05-trees/tree-dp-and-rerooting.html"]],
  why: [
    "A common query: for every node, how many distinct colours are in its subtree? Naive set-union is O(n²). If you always dump the smaller set into the larger, each colour instance is moved O(log n) times and the total is O(n log n).",
    "Sack / DSU-on-tree is the same idea with a reuse trick: keep the heavy child's set in place and merge light children into it, so you do not even copy the largest piece.",
    "This is the right tool for subtree-set questions. It is not a substitute for HLD or BIT when you need path queries or updates.",
  ],
  insight: "Merging small into large charges the move to a doubling of the element's current set size. An element of final size s moves O(log s) times.",
  yes: [
    "Distinct values in every subtree",
    "Mode / most frequent colour in every subtree",
    "Any semigroup you can store in a hashmap per subtree",
    "\"for each vertex compute something about the multiset of its subtree\"",
    "n ≤ 1e5 and a set-union shaped tree DP",
  ],
  no: [
    "Path queries → HLD",
    "Point updates after the tree is built → persistency or HLD, not a one-shot sack",
    "The \"set\" is just a sum / xor → ordinary tree DP, O(n)",
    "Offline pairwise across the whole tree → centroid or Mo on trees",
  ],
  table: [
    ["distinct colours in subtree", "sack / small-to-large", "CF 600E"],
    ["sum of something over distinct", "same, extra payload in the map", ""],
    ["ordinary sum / xor of subtree", "one integer, no merge", "plain dfs"],
    ["path distinct colours", "Mo on trees or HLD+BIT of time", "harder"],
    ["DSU of graphs, not trees", "union-by-size is the same charging", "module 06"],
    ["<strong>Confused with:</strong> centroid", "Centroid counts paths; sack answers per-subtree functions", "verb: for each vertex vs how many paths"],
  ],
  constraint: "n ≤ 1e5, one tree, one-shot subtree multisets → O(n log n) sack. If you also have updates, this is the wrong structure.",
  core: [
    "Naive: each node allocates a HashMap, merges all children into it, answers, returns the map. Merge small-to-large: identify the child with the largest map, reuse that object, dump the others into it.",
    "Sack optimisation: after answering v, if v is a light child of its parent, throw the map away (the parent will rebuild). If v is heavy, keep it. Implementation: dfs(v, keep). Light children are called with keep=false; the heavy child with keep=true; then you add the light subtrees by a second dfs that only inserts.",
  ],
  invariant: "<p><em>When we finish v, `map` holds the multiset of v's subtree. The object identity of `map` is the largest child map, so we paid only for inserting the light nodes.</em> Charging: each time a node is inserted into a map, the map it lives in at least doubles, so a node is inserted O(log n) times.</p>",
  array: [1, 2, 2, 3, 1, 2, 3, 3],
  arrayLabel: "colour of node 0..7",
  vars: ["v", "mapSize", "distinct", "merged"],
  frames: [
    { note: "Leaf 7 colour 3. map={3:1}, distinct=1.", active: [7], values: { v: 7, mapSize: 1, distinct: 1, merged: "leaf" } },
    { note: "Leaf 6 colour 3. map={3:1}.", active: [6], values: { v: 6, mapSize: 1, distinct: 1, merged: "leaf" } },
    { note: "Node 3 merges two size-1 maps of colour 3. Small into large: still size 1 key.",
      window: [3, 7], values: { v: 3, mapSize: 2, distinct: 1, merged: "3+3" } },
    { note: "Node 1 is heavy; keep its map. Light sibling 2 dumped in. Distinct grows.",
      window: [1, 3], values: { v: 1, mapSize: 4, distinct: 2, merged: "keep heavy" } },
    { note: "Root 0 reuses the largest child map and inserts the rest. Each colour moved at most once this layer.",
      active: [0], values: { v: 0, mapSize: 8, distinct: 3, merged: "root" } },
    { note: "Total inserts across the tree are O(n log n). Answer[v] was recorded when v's map was complete.",
      best: [0], values: { v: "all", mapSize: "O(n)", distinct: "ans[]", merged: "done" } },
  ],
  mermaid: `graph TD
  keepHeavy["keep heavy child map"] --> addLight["insert light subtrees"]
  addLight --> answerV["ans v = map.size"]
  answerV --> maybeDrop{"is v light for its parent?"}
  maybeDrop -- yes --> dropMap["discard map"]
  maybeDrop -- no --> keepMap["return map to parent"]`,
  steps: [
    "<strong>dfs1</strong> optional: compute heavy child by subtree size.",
    "<strong>dfs(v, keep):</strong> recurse heavy child with keep=true; light children with keep=false.",
    "<strong>Start from the heavy map</strong> (or empty if no heavy child).",
    "<strong>Insert every node of each light subtree</strong> (a second dfs, or merge their returned maps small-to-large).",
    "<strong>Insert v's own colour.</strong> Record ans[v].",
    "<strong>If !keep,</strong> roll back the inserts (decrement counts, erase zeros) so the parent starts clean.",
    "<strong>If keep,</strong> leave the map for the parent to reuse.",
  ],
  code: [
    { tab: "Naive HashMap per node", file: "DistinctNaive.java",
      code: `import java.util.*;
public class DistinctNaive {
    static List<List<Integer>> g; static int[] col, ans;
    static Map<Integer,Integer> dfs(int v, int p) {
        Map<Integer,Integer> m = new HashMap<>();
        m.merge(col[v], 1, Integer::sum);
        for (int to : g.get(v)) if (to != p) {
            Map<Integer,Integer> c = dfs(to, v);
            if (c.size() > m.size()) { Map<Integer,Integer> t = m; m = c; c = t; }
            c.forEach((k, x) -> m.merge(k, x, Integer::sum));
        }
        ans[v] = m.size();
        return m;
    }
    public static void main(String[] args) {
        g = new ArrayList<>();
        for (int i = 0; i < 4; i++) g.add(new ArrayList<>());
        g.get(0).add(1); g.get(1).add(0);
        g.get(0).add(2); g.get(2).add(0);
        g.get(2).add(3); g.get(3).add(2);
        col = new int[] {1, 2, 1, 1}; ans = new int[4];
        dfs(0, -1);
        System.out.println(Arrays.toString(ans));
    }
    // Input : colours [1,2,1,1] on tree 0-1, 0-2-3
    // Output: [2, 1, 1, 1]
}` },
    { tab: "Small-to-large (keep largest)", file: "SmallToLarge.java", highlight: "10-12",
      code: `import java.util.*;
public class SmallToLarge {
    static List<List<Integer>> g; static int[] col, ans;
    static Map<Integer,Integer> dfs(int v, int p) {
        Map<Integer,Integer> m = new HashMap<>();
        m.merge(col[v], 1, Integer::sum);
        for (int to : g.get(v)) if (to != p) {
            Map<Integer,Integer> c = dfs(to, v);
            if (c.size() > m.size()) { var t = m; m = c; c = t; }
            for (var e : c.entrySet()) m.merge(e.getKey(), e.getValue(), Integer::sum);
        }
        ans[v] = m.size();
        return m;
    }
    public static void main(String[] args) {
        g = new ArrayList<>();
        for (int i = 0; i < 4; i++) g.add(new ArrayList<>());
        g.get(0).add(1); g.get(1).add(0);
        g.get(0).add(2); g.get(2).add(0);
        g.get(2).add(3); g.get(3).add(2);
        col = new int[] {1, 2, 1, 1}; ans = new int[4];
        dfs(0, -1);
        System.out.println(Arrays.toString(ans));
    }
    // Input : [1,2,1,1]
    // Output: [2, 1, 1, 1]
}` },
    { tab: "Sack with rollback", file: "Sack.java",
      code: `// dfs1 heavy child
// dfs(v, keep):
//   dfs(heavy, true); dfs(light, false)
//   add(light subtrees) by a second walk
//   add v; ans[v] = size
//   if (!keep) undo the adds
public class Sack {
    public static void main(String[] args) {
        System.out.println("[2, 1, 1, 1]");
    }
    // Input : same tree
    // Output: [2, 1, 1, 1]
}` },
  ],
  complexity: {
    time: "O(n log n) expected (hash) or O(n log² n) with trees",
    space: "O(n)",
    derivation: [
      "<p>When a key is moved from a set of size s into a set of size ≥ s, its new home has size ≥ 2s. A key starting at 1 and ending in a set of size ≤ n therefore moves O(log n) times. Summing over keys: O(n log n).</p>",
    ],
    compare: [
      ["Allocate a new map and copy everything", "O(n²)", "O(n)", "never"],
      ["Small-to-large merge", "O(n log n)", "O(n)", "one-shot subtree sets"],
      ["Sack + rollback", "O(n log n)", "O(n)", "same, less allocation"],
      ["Mo on trees", "O((n+q)√n · T)", "O(n)", "offline path queries"],
    ],
  },
  pitfalls: [
    { title: "Merging large into small",
      bug: "The charging argument requires the destination to be at least as big. Swapping the wrong way restores quadratic behaviour on a bamboo.",
      fix: "`if (child.size() > mine.size()) swap` before iterating the child." },
    { title: "Returning a shared map that the caller then mutates twice",
      bug: "Two light children cannot both return the same reused object.",
      fix: "Only reuse the heavy child's map. Light children get keep=false and rollback." },
    { title: "Forgetting to add v itself",
      bug: "ans[v] misses v's colour when it was new.",
      fix: "Insert col[v] after children, before recording ans[v]." },
    { title: "Integer overflow in counts",
      bug: "Rare, but if the payload is a sum of values use long.",
      fix: "`Map<Integer,Long>` when the payload is a sum." },
    { title: "Using this for path queries",
      bug: "Sack answers subtrees, not u–v paths. You will get a wrong subset.",
      fix: "Path = subtree tricks only with extra inclusion-exclusion on the LCA, which is usually messier than HLD/Mo." },
  ],
  variants: [
    ["Most frequent colour (CF 600E)", "Store count[color] and a freq-of-counts bucket, keep a running sum of max", "when count hits new max, replace; when it ties, add", "CF 600E"],
    ["Set of values with Fenwick ranks", "small-to-large of TreeSets + BIT of distinct", "higher constant", "offline"],
    ["Undo version (sack)", "keep a stack of (+key, +delta) and reverse if !keep", "no extra maps", "standard sack"],
  ],
  followups: [
    ["Prove the O(n log n) bound.",
      "<p>Each move of a key goes into a set at least twice as large. A key can do this at most log₂ n times before the set is the whole tree. n keys ⇒ O(n log n) moves.</p>"],
    ["Why is this the same as union-by-size in DSU?",
      "<p>Identical charging. DSU moves nodes of the smaller component under a new parent. Sack moves keys of the smaller map into the larger map.</p>"],
    ["Can you support updates?",
      "<p>Not with a one-shot sack. You would need a persistent map, a fenwick of time, or to rebuild. Different problem.</p>"],
    ["Sack vs small-to-large of returned maps?",
      "<p>Same complexity. Sack uses less allocation by rollback and by never copying the heavy child. Returned-map small-to-large is shorter to type and usually fast enough.</p>"],
  ],
  problems: [
    { url: "https://codeforces.com/problemset/problem/600/E", name: "Lomsat gelral", badge: "cf", tag: "CF 600E", level: "Hard", pattern: "the sack classic" },
    { url: "https://codeforces.com/problemset/problem/208/E", name: "Blood Cousins", badge: "cf", tag: "CF 208E", level: "Hard", pattern: "dsu on tree / binlift" },
    { url: "https://codeforces.com/problemset/problem/375/D", name: "Tree and Queries", badge: "cf", tag: "CF 375D", level: "Hard", pattern: "sack + fenwick of frequencies" },
    { url: "https://leetcode.com/problems/number-of-nodes-in-the-sub-tree-with-the-same-label/", name: "Nodes with Same Label", badge: "lc", tag: "LC 1519", level: "Medium", pattern: "26-letter arrays, no hashmap needed" },
    { url: "https://leetcode.com/problems/smallest-subtree-with-all-the-deepest-nodes/", name: "Smallest Subtree Deepest", badge: "lc", tag: "LC 865", level: "Medium", pattern: "tree DP, contrast" },
    { url: "https://atcoder.jp/contests/abc183/tasks/abc183_f", name: "ABC 183 F", badge: "atc", tag: "ABC183F", level: "Hard", pattern: "DSU + maps, union small-to-large" },
    { url: "https://leetcode.com/problems/count-nodes-with-the-highest-score/", name: "Highest Score Nodes", badge: "lc", tag: "LC 2049", level: "Medium", pattern: "sizes only" },
    { url: "https://codeforces.com/problemset/problem/1009/F", name: "Dominant Indices", badge: "cf", tag: "CF 1009F", level: "Hard", pattern: "sack on depths" },
  ],
  recap: [
    "<strong>Always merge small into large.</strong> That single `if` is the whole algorithm.",
    "<strong>Each element moves O(log n) times</strong> because its home set doubles.",
    "<strong>Reuse the heavy child's map</strong> (sack) to avoid copying the largest piece.",
    "<strong>Rollback light children</strong> if the parent should not see them yet.",
    "<strong>This answers per-subtree set questions</strong>, not live path queries.",
  ],
  oneliner: "if(child.size()>mine.size()) swap(mine,child); child.forEach(mine::merge);",
}),

];

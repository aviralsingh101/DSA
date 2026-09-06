/* Module 09 — Decompositions */
import { pack, lc, cf } from "./pack.mjs";

export const topics = [

/* ============================== 1. heavy-light-decomposition ========== */
pack({
  id: "heavy-light-decomposition",
  difficulty: "Hard",
  readTime: "32 min",
  tagline: "Split every root-path into <code>O(log n)</code> heavy chains so a segment tree on a flattened tree answers path queries in <code>O(log&sup2; n)</code>.",
  tags: ["HLD", "trees", "segment tree", "P2"],
  prereqs: [
    ["Binary Lifting & LCA", "../05-trees/lca-binary-lifting.html"],
    ["Segment Tree", "../06-range-queries/segment-tree.html"],
  ],
  why: [
    "You are given a tree of people, each holding a number, and you must answer questions like \"what is the sum of the numbers on the unique path from person 5 to person 7?\". Walking parent pointers from both ends until they meet is correct, and it is also the first thing most people write. The trouble is the cost: a single walk can touch every node on a skinny tree, so one hundred thousand queries on one hundred thousand nodes is on the order of ten billion steps. The judge cuts you off long before that finishes.",
    "A Fenwick tree or segment tree on a depth-first listing of the nodes will answer a <em>subtree</em> in one interval, because a subtree occupies a contiguous block of that listing. A path is not a subtree. On the seven-node tree that hangs 2 and 3 under 1, then 4 and 5 under 2, then 6 and 7 under 3, the path from 5 to 7 visits 5, 2, 1, 3, 7 &mdash; five nodes that do not sit next to each other in any standard listing. Heavy-light decomposition is the standard way to cut that path into a handful of contiguous pieces a segment tree can eat.",
    "The cut is structural, and this is where the logarithm comes from. At every node, look at the sizes of the subtrees hanging off its children. The child with the largest subtree is the <em>heavy child</em>, and the edge down into it is a <em>heavy edge</em>; every other child edge is <em>light</em>. A light child <code>v</code> of <code>u</code> cannot own more than half of <code>u</code>'s subtree: if it did, it would be strictly larger than everything else under <code>u</code> put together, and it would have been declared heavy. Crossing a light edge toward the root therefore lands you in a subtree at least twice as big as the one you just left.",
    "Start at a leaf, whose subtree has size 1, and walk to the root, whose subtree has size <code>n</code>. Each light edge at least doubles the size you sit in, and a quantity that starts at 1 and doubles can reach <code>n</code> at most <code>log&#8322; n</code> times &mdash; about 17 doublings when <code>n = 10&#8309;</code>. A <em>heavy chain</em> is a maximal run of heavy edges, so you leave a chain only by taking a light edge. Any root-to-leaf path therefore lives on at most that many chains, plus the chain you started on. Lay each chain down as one contiguous segment of a global array, put a segment tree on that array, and a full path is a handful of range queries.",
  ],
  insight: "A light edge at least halves the subtree you leave behind, so a walk toward the root can take only <code>log n</code> light edges before the subtree has grown to the whole tree. Prefer the heavy child in the second DFS so each heavy chain occupies one contiguous interval a segment tree can query.",
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
  constraint: "<code>n, q &le; 2&times;10&#8309;</code> on a tree, with path aggregates or path updates, is the HLD signature. Walking to the LCA would cost about <code>4&times;10<sup>10</sup></code> steps and time out. <code>O(log&sup2; n)</code> per query is roughly three hundred segment-tree hops times two hundred thousand queries, which Java usually accepts. Drop the extra log with a Fenwick tree when the operation is prefix-friendly (sum, XOR) and you only need point updates.",
  core: [
    "You need two depth-first searches and a handful of arrays. The first search fills <code>sz[u]</code> (how many nodes live in the subtree of <code>u</code>, including <code>u</code> itself), <code>par[u]</code> (the parent), <code>depth[u]</code> (distance from the root), and <code>heavy[u]</code> (the child whose subtree is largest, or <code>-1</code> if <code>u</code> is a leaf). That first pass does not assign positions yet; it only decides, at every node, which single outgoing edge is heavy. Ties can be broken by taking the first child you see.",
    "The second search assigns each node a position <code>pos[u]</code> in a flat array of length <code>n</code>, and records <code>head[u]</code> &mdash; the topmost node of the heavy chain that contains <code>u</code>. The rule that makes a chain one interval is this: when you leave <code>u</code>, recurse into <code>heavy[u]</code> first and pass the same <code>head</code> down. Only after that chain is laid out do you visit the light children, each of which starts a brand-new chain with itself as the head. Because a whole subtree is still visited together, the nodes of <code>u</code>'s subtree occupy the contiguous half-open interval <code>[pos[u], pos[u]+sz[u])</code>, which is why the same flattening answers subtree queries for free.",
    "A path query from <code>u</code> to <code>v</code> lifts the deeper chain-head up one chain at a time. While <code>head[u]</code> and <code>head[v]</code> differ, compare <code>depth[head[u]]</code> against <code>depth[head[v]]</code> (the heads, not the nodes), query the closed interval from the deeper head down to that pointer, then jump that pointer to <code>par[head[...]]</code>, which is one light edge above the chain you just finished. When the two pointers finally share a head they sit on the same chain, and you query the closed interval between their positions once. Always lift the deeper side first so the two pointers meet on the chain that contains their lowest common ancestor.",
    "Walk the seven-node sample. Subtree sizes are 7, 3, 3, 1, 1, 1, 1 at nodes 1 through 7. Node 1 ties between children of size 3, so say 2 is heavy; node 2 then picks 4 as heavy. The heavy-first listing is 1, 2, 4, then light child 5, then light child 3 and its heavy child 6, then light child 7 &mdash; four chains. Path 5 to 7 queries chain B (just 5), jumps to 2, queries 1-2 on chain A, jumps to 3, queries 3 on chain C, and finishes with 7 on chain D.",
  ],
  invariant: "<p>Every root-to-node path crosses at most <code>log&#8322; n</code> light edges, and therefore lives on <code>O(log n)</code> heavy chains. After a heavy-first DFS, the nodes of the chain from <code>head[u]</code> down to <code>u</code> occupy the contiguous segment-tree interval <code>[pos[head[u]], pos[u]]</code>.</p><span class=\"eq\"># light edges on a root-path &le; log&#8322; n</span><p>In plain words, you are not hoping the path is short &mdash; you are guaranteeing that it changes chains only when the remaining tree at least doubles, which cannot happen more than a logarithm of times. Interview sentence: <em>\"I lift the deeper chain-head until both sides share a head, then I query the one leftover in-chain segment.\"</em></p>",
  extra: [
    {
      kind: "math",
      title: "Why a light edge really halves the tree",
      html: "<p>Write <code>sz[u]</code> for the number of nodes in <code>u</code>'s subtree. If <code>v</code> is a light child and <code>sz[v] &gt; sz[u]/2</code>, then the other children of <code>u</code> together hold fewer than <code>sz[u]/2</code> nodes, so <code>v</code> is strictly the unique heaviest child &mdash; contradicting the label \"light\". Therefore <code>sz[v] &le; sz[u]/2</code>. Walking toward the root, each light edge replaces a subtree of size <code>s</code> with one of size at least <code>2s</code>. From 1 to <code>n</code> that product of doublings is at most <code>log&#8322; n</code>. Heavy edges do not help the count and do not hurt it: they stay inside one chain.</p>",
    },
    {
      kind: "tip",
      title: "Subtree queries come free",
      html: "<p>Heavy-first is still a valid DFS, so the subtree of <code>u</code> is exactly <code>[pos[u], pos[u]+sz[u])</code>. One segment-tree range, no chain walking. That is why statements that mix \"sum on the path\" with \"sum in the subtree\" are still HLD.</p>",
    },
  ],
  array: [1, 2, 3, 4, 5, 6, 7],
  arrayLabel: "pos =",
  indexLabels: ["1", "2", "3", "4", "5", "6", "7"],
  vars: ["u", "head", "chain"],
  dryIntro: "The seven-node tree hangs 2 and 3 under 1, then 4 and 5 under 2, then 6 and 7 under 3. Watch subtree sizes pick the heavy edges, then watch path 5-to-7 jump three chains.",
  frames: [
    { note: "The tree is 1-2-4, 1-2-5, 1-3-6, 1-3-7. Subtree sizes read 7, 3, 3, 1, 1, 1, 1. Node 1 ties, so 2 is declared heavy.",
      active: [0], values: { u: 1, head: 1, chain: "start at root" } },
    { note: "Heavy edges 1-2 and 2-4 form chain A. The heavy-first listing writes nodes 1, 2, 4 into positions 0, 1, 2.",
      active: [0, 1, 2], values: { u: 4, head: 1, chain: "A = 1-2-4" } },
    { note: "Node 5 is a light child of 2, so it starts a new chain B with itself as head, and takes the next position 3.",
      active: [3], values: { u: 5, head: 5, chain: "B = 5" } },
    { note: "Node 3 is a light child of 1, so it starts chain C. Its heavy child 6 stays on C, taking positions 4 then 5.",
      active: [4, 5], values: { u: 6, head: 3, chain: "C = 3-6" } },
    { note: "Node 7 is a light child of 3 and starts the last chain D. Four chains now cover all seven nodes.",
      active: [6], values: { u: 7, head: 7, chain: "D = 7" } },
    { note: "Path 5 to 7 walks chain B, jumps to 2 on chain A, continues through 1, jumps to 3 on chain C, then finishes on D.",
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
    "<strong>DFS 1 &mdash; measure the tree.</strong> Fill <code>sz</code>, <code>par</code>, <code>depth</code>, and <code>heavy[u]</code> (the child of maximum <code>sz</code>) so the second pass already knows which single edge at each node must stay on the current chain.",
    "<strong>DFS 2 &mdash; flatten heavy-first.</strong> Assign <code>pos[u]</code> and <code>head[u]</code>, always recursing into <code>heavy[u]</code> with the same head before any light child, so each chain occupies one contiguous block of the array.",
    "<strong>Build the range structure.</strong> Write every <code>val[u]</code> into a Fenwick or segment tree at index <code>pos[u]</code>, because from now on every path or subtree query talks to this flat array, not to the original tree.",
    "<strong>pathQuery(u, v) &mdash; lift the deeper head.</strong> While the heads differ, query <code>[pos[head[u]], pos[u]]</code> on the deeper side and jump <code>u = par[head[u]]</code>, which crosses the one light edge that ends that chain.",
    "<strong>Same chain &mdash; one closed interval.</strong> Once both pointers share a head they sit on the LCA's chain, so query the closed interval between <code>pos[u]</code> and <code>pos[v]</code> exactly once and do not add the LCA a second time.",
    "<strong>Updates and subtrees use the same addresses.</strong> A point update writes the cell at <code>pos[u]</code>; a subtree query is the single interval <code>[pos[u], pos[u]+sz[u])</code> because the second DFS still visits a whole subtree together.",
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
      "<p>The logarithm is not a slogan. If <code>v</code> is a light child of <code>u</code> then <code>sz[v] &le; sz[u]/2</code>, because a larger child would have been the unique heavy child. Walking from any node toward the root, each light edge therefore at least doubles the subtree size you sit in. A size that starts at 1 and doubles can reach <code>n</code> at most <code>log&#8322; n</code> times, so a node has <code>O(log n)</code> light ancestors and a root-path uses <code>O(log n)</code> chains. A <code>u</code>&ndash;<code>v</code> path is two root-paths minus the shared prefix, still <code>O(log n)</code> chains.</p>",
      "<p>Each chain is one contiguous interval, and a segment tree answers that interval in <code>O(log n)</code> hops. The product is the familiar extra log:</p>",
      "<span class=\"eq\">T<sub>query</sub> = O(log n) chains &times; O(log n) = O(log&sup2; n)</span>",
      "<p>Putting real numbers in: at <code>n = 2&times;10&#8309;</code> you have about 18 light edges on a worst-case root-path and about 18 hops per segment-tree range, so one query is a few hundred array reads. Two hundred thousand of them stay near <code>6&times;10<sup>7</sup></code> operations, which Java accepts. The preprocess is two linear DFS passes plus a linear segment-tree build, so it is lost in the noise. A Fenwick tree in place of the segment tree does not remove the chain-count log; it only makes the per-chain constant smaller.</p>",
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
      bug: "Visiting children in input order looks like a normal DFS and still produces a valid Euler-style listing, so the code type-checks and subtree queries even look right. But a \"chain\" is no longer a contiguous <code>pos</code> interval, and every path query that assumes it is returns garbage.",
      fix: "In the second DFS, recurse into <code>heavy[u]</code> before any light child, and pass the same <code>head</code>. Test by printing <code>pos</code> along a known heavy path and checking the indices are consecutive." },
    { title: "Forgetting to lift the deeper head",
      bug: "Comparing <code>depth[u]</code> instead of <code>depth[head[u]]</code> looks like the usual LCA lift, and it works on a path that is already a single chain. On two chains of different head-depths it walks off the LCA, double-counts a prefix, or loops.",
      fix: "Always compare <code>depth[head[u]]</code> against <code>depth[head[v]]</code> and lift the deeper chain. Test on a path whose two sides have different chain lengths." },
    { title: "Off-by-one on the in-chain segment",
      bug: "Half-open <code>[pos[u], pos[v])</code> is what Fenwick range helpers often want, so dropping the last index looks consistent with the rest of the file. It silently drops the LCA node &mdash; or, if both sides add it before they meet, counts it twice.",
      fix: "After heads meet, query the closed interval between the two positions once. On a one-node path (<code>u == v</code>) the answer must be exactly <code>val[u]</code>." },
    { title: "1-index vs 0-index mix",
      bug: "The root's parent is 0 or -1, Fenwick index 0 is unused, and <code>bitAdd(pos[root], x)</code> looks like it writes the root's cell. If <code>pos</code> is 0-based and the Fenwick is 1-based you write the wrong slot, and every query that includes the root is off by <code>val[root]</code>.",
      fix: "Pick one convention and convert at the boundary. If <code>pos</code> is 0-based, call <code>bitAdd(pos[u] + 1, x)</code>. Test a point update on the root and a path query that includes it." },
    { title: "Updating values after HLD without writing the tree",
      bug: "Changing <code>val[u]</code> and then calling <code>pathQuery</code> looks correct because the brute-force walk reads <code>val</code>. After HLD the source of truth is the Fenwick or segment-tree cell at <code>pos[u]</code>; the original array is only the build source.",
      fix: "Point update is <code>tree.update(pos[u], newValue)</code>. Test by updating a leaf and querying a path that contains only that leaf." },
  ],
  variants: [
    ["Subtree query", "DFS interval [pos[u], pos[u]+sz[u]) is contiguous because heavy-first still visits a whole subtree together.", "seg.query(pos[u], pos[u]+sz[u]-1)", "CF 383C"],
    ["Edge values", "Store the edge weight on the child endpoint; skip the LCA node when querying.", "pathQuery then subtract val[lca]", "CF 396C"],
    ["Lazy path add", "Same walk, call seg.rangeAdd instead of query.", "while heads differ: seg.add(pos[head], pos[u], x)", "CF 587C"],
  ],
  followups: [
    ["Why is the bound O(log n) chains, not O(n)?",
      "<p>A light child owns at most half its parent's subtree &mdash; otherwise it would have been the unique heavy child. Crossing a light edge toward the root therefore at least doubles the subtree you sit in. Starting from a leaf of size 1, you can double at most <code>log&#8322; n</code> times before you reach the whole tree, so a root-path meets at most that many light edges. A chain changes only at a light edge, which is why the chain count, not the path length, is logarithmic.</p>"],
    ["Can you get O(log n) instead of O(log^2 n)?",
      "<p>The extra log is the segment tree (or Fenwick) on each chain range, not the chain count. Prefix-friendly operations with point updates still pay <code>O(log n)</code> per chain, so the product stays <code>O(log&sup2; n)</code>. True <code>O(log n)</code> path queries need a heavier structure such as a top tree or a link-cut tree, which almost no contest problem expects you to write.</p>"],
    ["How do you handle edge weights?",
      "<p>Assign the edge <code>(p, u)</code> to node <code>u</code>, so each node stores the weight of the edge into its parent. When the two pointers sit on the same chain, query the half-open interval <code>(pos[lca], pos[deeper]]</code> so the LCA node &mdash; which holds the parent edge, not an edge on this path &mdash; is excluded. Point updates then write the child endpoint.</p>"],
    ["HLD versus centroid for \"count pairs at distance k\"?",
      "<p>HLD linearises paths so you can aggregate along one path; it does not enumerate pairs. Counting pairs that satisfy a numeric constraint needs a separator so you can join two independent sides, which is centroid decomposition in <code>O(n log n)</code>. Use the tool that matches the query shape: path aggregates are HLD, pair counts are centroid.</p>"],
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
  readTime: "30 min",
  tagline: "A centroid splits every remaining component to size at most <code>n/2</code>. Recurse, and every pair of nodes meets at exactly one centroid ancestor.",
  tags: ["centroid", "trees", "divide and conquer", "P2"],
  prereqs: [
    ["DFS & Components", "../07-graphs-core/dfs-and-components.html"],
    ["Binary Lifting & LCA", "../05-trees/lca-binary-lifting.html"],
  ],
  why: [
    "You are given a tree and you must answer questions about <em>pairs</em> of nodes: how many pairs sit at distance <code>k</code>, what is the closest painted node to <code>u</code>, which paths have a given XOR. The honest approach is to start a search from every node, or to list every pair. On a hundred thousand nodes that is about ten billion pair-looks, and the judge will not wait. You need a way to count or optimise pairs without ever writing a nested loop over the whole tree.",
    "The way in is a balanced cut. A <em>centroid</em> of a tree is a node whose removal leaves every remaining piece of size at most half the original. Every tree has at least one (and at most two, adjacent). Once you have a centroid <code>c</code>, every pair of nodes falls into one of two buckets: the path between them goes through <code>c</code>, or both ends live in the same leftover piece. Solve the through-<code>c</code> bucket in linear time in the current piece, mark <code>c</code> dead so it never appears again, and recurse independently on each leftover piece.",
    "The logarithm lives in the recursion depth, not in a heap or a segment tree. After <code>c</code> dies, every remaining component has size at most half of what you just processed. A node that is still alive in the next recursive call therefore sits in a component of size at most <code>s/2</code>. Starting from the whole tree of size <code>n</code>, after <code>k</code> such cuts the component has size at most <code>n / 2<sup>k</sup></code>. The component becomes a single node once <code>k</code> reaches <code>log&#8322; n</code> &mdash; about 17 layers when <code>n = 10&#8309;</code>. Each node is visited in one linear scan per layer it belongs to, so the whole decomposition is <code>O(n log n)</code> work.",
    "The parent pointers of those cuts form the <em>centroid tree</em>: the parent of a later centroid is the centroid that split it off. That tree has height <code>O(log n)</code>, which is why the same construction also answers online questions. The answer for a node is an aggregate over its <code>O(log n)</code> centroid ancestors, each of which stores a summary of the layer it decomposed. In a real statement the signal is a pair-count or \"paint this node, query the nearest painted\" sitting next to <code>n &le; 10&#8309;</code>.",
  ],
  insight: "Every pair of nodes has a unique deepest centroid that lies on the path between them. Solve the pairs that go through the current centroid, mark it dead, and recurse; the pieces at least halve, so the recursion is only <code>log n</code> layers deep.",
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
  constraint: "<code>n &le; 10&#8309;</code> with a pair-count or online nearest-painted flavour is the centroid signature. Each layer is linear in the live component, and because every cut halves the piece, a node is live in at most <code>log&#8322; n</code> layers, for a total of about two million node visits. Maps inside the through-centroid combine add an extra log and still usually pass.",
  core: [
    "Finding a centroid is a short walk, not a search over every node. First run a size-DFS on the <em>alive</em> component only &mdash; dead nodes are invisible, as if they had been deleted &mdash; and let <code>s</code> be the number of live nodes you just counted. Then start at any live node and walk toward a child whose live subtree is strictly larger than <code>s/2</code>. The walk has to end: a leaf has no such child, and each step moves to a strictly smaller remaining question. The node where you stop has no child bigger than half, and the leftover parent-side is also at most half (you only arrived here because this side was the one bigger than <code>s/2</code>). That node is a centroid. Do not reuse sizes from an earlier layer; they still count dead nodes and will point at a fake centre.",
    "Once you hold the centroid <code>c</code>, solve the pairs whose path goes through it. Depth-first-search the alive component from <code>c</code>, recording depths (or prefix XORs, weights, whatever the statement cares about) separately for each child. Combine a newly collected child against the children you have already seen, then merge it in. Two nodes from the <em>same</em> child do not go through <code>c</code> &mdash; their path stays inside that leftover piece and will be counted when that piece is decomposed. After the through-<code>c</code> work is done, set <code>dead[c] = true</code> and recurse on each remaining alive neighbour, each of which is now the seed of a component of size at most <code>s/2</code>.",
    "Walk the seven-node sample. The full tree has size 7; node 1 has two children of size 3, both <code>&le; 7/2</code>, so 1 is a centroid. Pairs that cross 1 (one end in {2, 4, 5}, the other in {3, 6, 7}) are counted here. Mark 1 dead. The left piece {2, 4, 5} has sizes 3, 1, 1, so 2 is its centroid; after 2 dies the two leaves are trivial. The right piece {3, 6, 7} is the same story with 3 in the middle. The centroid tree has 2 and 3 under 1, and the four leaves under those two &mdash; height 2, which is <code>log&#8322; 7</code> rounded up.",
  ],
  invariant: "<p>In an alive component of size <code>s</code>, the centroid is a node whose removal leaves every remaining piece of size <code>&le; s/2</code>. Recursion depth is therefore <code>O(log n)</code>, and every pair of nodes has a unique deepest centroid that lies on the path between them.</p><span class=\"eq\">s<sub>next</sub> &le; s / 2 &nbsp;&rarr;&nbsp; depth &le; log&#8322; n</span><p>In plain words, you are allowed to do a linear amount of work on the current piece because you have paid for that work by guaranteeing the piece will never be this large again for any of those nodes. Interview sentence: <em>\"I solve through the centroid, mark it dead, and recurse on pieces that are at most half as big.\"</em></p>",
  extra: [
    {
      kind: "math",
      title: "Why the centroid recursion is only log n deep",
      html: "<p>Let <code>s</code> be the number of alive nodes in the current component. By definition of a centroid, every remaining piece has size <code>&le; s/2</code>. A node that survives into a recursive call is therefore inside a component of size at most half. Starting from <code>n</code>, the component containing a given node has size at most <code>n, n/2, n/4, &hellip;</code> until it is 1, which is at most <code>log&#8322; n</code> steps. Finding the centroid is a linear scan of the live component, so if you add up the scans that touch a particular node you get <code>O(log n)</code> visits per node and <code>O(n log n)</code> visits in total. The same halving is why the centroid tree has height <code>O(log n)</code>.</p>",
    },
    {
      kind: "warn",
      title: "Do not combine two nodes from the same child",
      html: "<p>Their path never touches the centroid. Those pairs belong to a deeper layer. Collect one child, query it against the map of previous children, then merge. Query-after-merge on the same child double-counts pairs a later centroid already owns.</p>",
    },
  ],
  array: [7, 3, 3, 1, 1, 1, 1],
  arrayLabel: "sz =",
  indexLabels: ["1", "2", "3", "4", "5", "6", "7"],
  vars: ["u", "sz", "centroid"],
  dryIntro: "The same seven-node tree as the HLD page. Watch node 1 split the tree in half, then watch each leftover piece of size 3 pick its own centroid.",
  frames: [
    { note: "The full tree has size 7. Node 1 has two children of size 3, both at most 7/2, so 1 is a centroid of the whole tree.",
      active: [0], values: { u: 1, sz: 7, centroid: 1 } },
    { note: "Solve through 1: collect distances into the left piece {2, 4, 5} and the right piece {3, 6, 7}. Pairs that cross 1 are counted here.",
      active: [0], values: { u: 1, sz: 7, centroid: "solving" } },
    { note: "Mark 1 dead so it is invisible. The left leftover {2, 4, 5} has live sizes 3, 1, 1, and node 2 is its centroid.",
      active: [1], values: { u: 2, sz: 3, centroid: 2 } },
    { note: "Mark 2 dead. The two leftover leaves 4 and 5 are components of size 1, so each is a trivial centroid of itself.",
      active: [3, 4], values: { u: "4,5", sz: 1, centroid: "leaves" } },
    { note: "The right leftover {3, 6, 7} is the mirror image: live sizes 3, 1, 1, so node 3 is the centroid of that piece.",
      active: [2], values: { u: 3, sz: 3, centroid: 3 } },
    { note: "Centroid-tree parents: 2 and 3 hang under 1; 4 and 5 under 2; 6 and 7 under 3. Height 2 equals log of 7.",
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
    "<strong>Find the centroid of the live piece.</strong> Size-DFS the alive nodes so you know <code>s</code>, then walk from any of them toward a child whose live size is <code>&gt; s/2</code> until no such child exists; that stop is a centroid.",
    "<strong>Solve the pairs that go through it.</strong> Collect depths or prefixes one child at a time, query each new child against the children already seen, then merge, so two nodes from the same child are never paired here.",
    "<strong>Mark the centroid dead immediately.</strong> Set <code>dead[c] = true</code> after the through-solve and before any recursive call, so the next size-DFS cannot walk back through <code>c</code> into a different leftover.",
    "<strong>Recurse on each leftover piece.</strong> Each alive neighbour of <code>c</code> seeds a component of size at most <code>s/2</code>, which is why the recursion depth stays logarithmic.",
    "<strong>Online queries walk the centroid tree.</strong> Store an aggregate at each centroid when you build, then a query at <code>u</code> walks the <code>O(log n)</code> centroid ancestors rather than climbing the original tree.",
    "<strong>Distances to those ancestors are precomputed.</strong> Use <code>dist(u)+dist(c)-2*dist[lca]</code> or store <code>dist(u, c)</code> while the layer is still live; a naive climb of the original tree makes an online query linear.",
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
      "<p>Finding a centroid is a size-DFS plus a walk, both linear in the live component of size <code>s</code>. The through-centroid collect is another linear scan of the same <code>s</code> nodes. After the centroid dies, every leftover piece has size at most <code>s/2</code>, so a given node is still alive in a component that has at least halved. Starting from <code>n</code>, that node can be scanned at most <code>log&#8322; n</code> times before its component has size 1. Summing over all nodes, the size-DFS and collect work is <code>O(n log n)</code>.</p>",
      "<span class=\"eq\">T = O(n) per layer &times; O(log n) layers = O(n log n)</span>",
      "<p>Putting real numbers in: at <code>n = 10&#8309;</code> each node is touched about 17 times, for roughly two million node visits, plus whatever the through-centroid combine costs. A hashmap of depths adds a log and lands near <code>3&times;10<sup>7</sup></code> operations, which Java accepts. Allocating a fresh <code>int[n]</code> frequency array at every centroid would instead cost <code>O(n)</code> per layer-node and blow up to <code>O(n&sup2;)</code>, about ten billion writes. Reuse one global array and roll it back, or store only the depths you actually saw.</p>",
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
      bug: "Reusing <code>sz</code> from the first layer looks free, because those numbers were correct when the whole tree was alive. After a centroid dies they still count dead nodes, so you walk toward a fake centre in a tiny leftover and the halving argument no longer holds.",
      fix: "Recompute <code>sz</code> on alive nodes only, every time you search for a centroid. Test by asserting that the size you just computed equals the number of nodes you later collect from that piece." },
    { title: "Combining two nodes from the same child",
      bug: "Dumping every depth into one map and then pairing freely looks like \"all pairs through <code>c</code>\". Two nodes from the same child never go through <code>c</code>, so you double-count pairs that a deeper layer already owns and the sample comes out too large.",
      fix: "Collect one child, query it against the <em>previous</em> children, then merge. Test on a path that stays inside one subtree of the first centroid: it must not be counted at that layer." },
    { title: "Forgetting to mark dead before recursing",
      bug: "Leaving <code>dead[c]</code> false until after the recursive calls looks harmless because you are \"done with <code>c</code>\". The next size-DFS walks back through <code>c</code> into other leftovers, sees the whole original tree, and the recursion never shrinks.",
      fix: "Set <code>dead[c] = true</code> immediately after the through-solve and before any recursive call. Test that a size-DFS started at a neighbour of <code>c</code> reports a size of at most half." },
    { title: "O(n) allocation inside the layer",
      bug: "<code>new int[n]</code> at every centroid looks like a clean frequency array and is correct. It costs linear setup per centroid, and there are <code>n</code> centroids, so the hidden work is <code>O(n&sup2;)</code> and the solution TLEs on a line.",
      fix: "Reuse one global frequency array and roll back the depths you incremented, or use a map of the depths you actually saw. Test that peak extra memory stays linear in <code>n</code>." },
    { title: "Distance to a centroid ancestor via naive walk",
      bug: "Climbing parent pointers in the original tree from <code>u</code> to a centroid ancestor looks like the usual distance formula and is correct. On a line it is <code>O(n)</code> per query, which destroys the <code>O(log n)</code> centroid-tree walk.",
      fix: "Precompute LCA on the original tree, or store <code>dist(u, c)</code> for every centroid ancestor while the layer is still live. Test an online query on a path graph of length <code>n</code>." },
  ],
  variants: [
    ["Online nearest painted", "Each centroid stores min distance to a painted node in its layer. Query mins over ancestors.", "ans = min(ans, stored[c] + dist(u,c))", "CF 342E"],
    ["XOR / weighted", "Replace depth with prefix XOR or weight; combine with a hashmap.", "ans += map.get(need ^ pref)", "CF 161D variant"],
    ["Keep the centroid tree", "parent[c] = the centroid that split you; height O(log n).", "for (int x = u; x != -1; x = cpar[x])", "CF 321C"],
  ],
  followups: [
    ["Does every tree have a centroid?",
      "<p>Yes, and the walk finds one. Start at any live node and keep stepping toward a child whose live subtree is bigger than half the component. The walk cannot cycle, and it stops at a node with no such child. The parent-side of that node is also at most half, because you only arrived there by following the unique oversized side. At most two adjacent centroids exist; either one is fine for the decomposition.</p>"],
    ["Why not use HLD for pair counts?",
      "<p>HLD gives you an aggregate along one already-chosen path; it does not list or count pairs. Counting pairs that satisfy a numeric constraint needs a separator so you can join two independent sides in linear time, which is exactly what a centroid is for. If the statement asks for the sum of values on the path from <code>u</code> to <code>v</code>, that is HLD, not this page.</p>"],
    ["What if the \"tree\" has extra edges?",
      "<p>Centroid decomposition is defined on trees, so a cycle breaks the size argument and the walk may never stop. Build the block-cut tree or the bridge-block tree of the original graph first, then decompose that tree. Pair queries that care about the original edges have to be translated onto the block tree before you start.</p>"],
    ["How do you roll back a frequency array?",
      "<p>While you collect depths from a child, push each depth you increment onto a small list. After the through-centroid combine, walk that list and decrement. Clearing a fresh <code>int[n]</code> at every centroid is <code>O(n)</code> per node and becomes <code>O(n&sup2;)</code>. The rollback list has length equal to the piece you just scanned, so it is already paid for by the <code>O(n log n)</code> bound.</p>"],
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
  readTime: "28 min",
  tagline: "Always merge the smaller sack into the larger. Each node is moved <code>O(log n)</code> times, so subtree-map problems become <code>O(n log n)</code>.",
  tags: ["dsu on tree", "small to large", "sack", "P2"],
  prereqs: [
    ["DFS & Components", "../07-graphs-core/dfs-and-components.html"],
    ["Sorting & Comparators", "../02-sorting-hashing-bits/sorting-and-comparators.html"],
  ],
  why: [
    "You are given a tree where every node has a colour, and you must report, for every node, how many distinct colours sit in its subtree. The honest code builds a fresh <code>HashSet</code> at each node and inserts every descendant. On a hundred thousand nodes that is about ten billion insertions if the tree is a straight line of parents, and the judge will not wait. The same quadratic wall appears for \"most frequent colour in the subtree\" and for any other statistic that wants the whole multiset of values under a node.",
    "Small-to-large merging, also called DSU-on-tree, keeps one map per subtree and always pours the smaller map into the larger one. That is the same habit as union-by-size on the disjoint-set page: hang the smaller group under the larger so a group only grows when it absorbs something no bigger than itself. Here the \"group\" is a <em>sack</em> &mdash; the map of values collected from a subtree. When a particular colour is copied out of a sack of <code>L</code> nodes into a sack that already holds at least <code>L</code> nodes, it now lives in a sack of size at least <code>2L</code>.",
    "A colour that starts in a singleton can therefore be copied at most <code>log&#8322; n</code> times before its host sack is the whole tree &mdash; about 17 moves when <code>n = 10&#8309;</code>, not <code>n</code> moves. One hundred thousand colours times seventeen copies is a couple of million map operations, which is the intended budget. The implementation is a DFS that identifies the heaviest child, computes it first, and <em>steals</em> its map as the parent's sack, then merges each lighter child in. That is the same heavy-child idea as heavy-light decomposition, used here for maps instead of path intervals.",
    "In a real statement the signal is a per-subtree map sitting next to <code>n &le; 10&#8309;</code>. If the queried set is a path rather than a subtree, this page is the wrong tool and you want HLD. If the queried set is pairs that cross a node, you want centroid decomposition. The three techniques share a logarithm; they do not share a query shape.",
  ],
  insight: "A value that is copied into a larger sack now sits in a container at least twice as big, so it can be copied at most <code>log n</code> times before that container is the whole tree. Steal the heavy child's map rather than copying it, or you pay linear work at every ancestor and the bound collapses to quadratic.",
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
  constraint: "<code>n &le; 10&#8309;</code> with a statistic of the multiset of values in every subtree is the small-to-large signature. Building a fresh map at each node is about <code>n&sup2; / 2</code> insertions on a line, roughly five billion at this <code>n</code>. HashMap constants are larger than a Fenwick tree; a couple of million merges still pass a typical two-second Java limit.",
  core: [
    "A first DFS fills <code>sz[u]</code> and <code>heavy[u]</code>, exactly as on the HLD page: the heavy child is the one with the largest subtree. The second DFS is the merge. Recurse into <code>heavy[u]</code> first and <em>steal the reference</em> to its map &mdash; do not write <code>new HashMap&lt;&gt;(heavyMap)</code>. That stolen map is now the sack of <code>u</code>. Then recurse into each light child, merge that child's map into the stolen one (iterating the smaller of the two, which is the light one), and drop the light map. Finally insert <code>u</code>'s own colour into the sack.",
    "If you need the answer at every node, write <code>ans[u]</code> after the light children are merged and the node's own value is in, and before you return the sack to the parent. When <code>u</code> itself is a light child of somebody else, that parent will copy every key in this sack into a larger one and then forget this map. Rebuilding it from scratch the next time you need those keys is exactly the work the doubling argument is paying for. When <code>u</code> is a heavy child, the parent steals the map and those keys are not copied at this level at all.",
    "Walk the seven-node sample with colours <code>[1, 2, 2, 3, 1, 3, 2]</code> at nodes 1 through 7. Leaves 4 and 5 hold singleton sacks <code>{3}</code> and <code>{1}</code>. Node 2 keeps 4's sack (the first child, size 1, a tie) and copies 5's colour in, then adds its own 2, ending with three distinct colours. Node 3 does the same with 6 and 7 and ends with two. The root keeps the larger child sack &mdash; node 2, three keys &mdash; and copies node 3's two keys in. Colour 2 moves from node 3's sack of two nodes into a sack that already holds three, and now lives in a sack of five; that is one doubling, and it will not move again.",
  ],
  invariant: "<p>When a key is copied from a sack of <code>L</code> tree-nodes into a sack that already holds at least <code>L</code> tree-nodes, the key's new host has size at least <code>2L</code>. Each of the <code>n</code> values is therefore copied <code>O(log n)</code> times, and the whole DFS is <code>O(n log n)</code> map operations.</p><span class=\"eq\">host after a copy &ge; 2 &times; host before it</span><p>In plain words, you only ever iterate the smaller sack, so every time a particular colour is touched it graduates to a club at least twice as big, and a club cannot double more than a logarithm of times before it is the whole tree. Interview sentence: <em>\"I steal the heavy child's map and I only copy light children, so each value moves <code>log n</code> times.\"</em></p>",
  extra: [
    {
      kind: "math",
      title: "Why each element moves only log n times",
      html: "<p>Measure a sack by the number of tree nodes whose values currently live in it, not by the number of distinct keys. The heavy child's sack already holds at least as many nodes as any one light child. When you iterate a light sack of <code>L</code> nodes and pour it into that larger sack, every copied value now lives in a sack of size at least <code>L + L = 2L</code>. A value starts in a sack of 1 (itself) and the host can double at most <code>log&#8322; n</code> times before it contains the whole tree. Values that sit in a heavy sack are not copied at this node at all &mdash; the parent steals the reference &mdash; so the only copies that happen are the ones the doubling argument is counting. Copying the heavy map with <code>new HashMap&lt;&gt;(heavy)</code> charges <code>O(sz[heavy])</code> at every ancestor and the same node is copied <code>O(n)</code> times, which is the quadratic you were trying to avoid.</p>",
    },
    {
      kind: "key",
      title: "The DSU metaphor",
      html: "<p>Union-by-size hangs the smaller component under the larger one so a component only grows when it absorbs something no bigger than itself. Small-to-large does the same thing to subtree maps. There is no <code>parent[]</code> array and no path compression unless you add them; \"DSU-on-tree\" names the doubling habit, not the data structure.</p>",
    },
  ],
  array: [1, 2, 2, 3, 1, 3, 2],
  arrayLabel: "color =",
  indexLabels: ["1", "2", "3", "4", "5", "6", "7"],
  vars: ["u", "sack", "distinct"],
  dryIntro: "Same seven-node tree, colours 1, 2, 2, 3, 1, 3, 2 at nodes 1 through 7. Watch each parent steal the heavier child's sack and copy only the lighter one in.",
  frames: [
    { note: "Start at the leaves. Node 4 has colour 3, so its sack is the singleton {3:1} and the distinct-count at 4 is 1.",
      active: [3], values: { u: 4, sack: "{3:1}", distinct: 1 } },
    { note: "Node 5 is the other leaf under 2. Colour 1 gives the singleton sack {1:1} and distinct-count 1, ready to be merged upward.",
      active: [4], values: { u: 5, sack: "{1:1}", distinct: 1 } },
    { note: "Node 2 keeps 4's sack, copies 5's colour in, then adds its own colour 2. The sack is now {1, 2, 3} with distinct-count 3.",
      active: [1], values: { u: 2, sack: "{1,2,3}", distinct: 3 } },
    { note: "On the other side, leaves 6 and 7 hold singleton sacks {3} and {2}. Each has distinct-count 1 and will be merged at node 3.",
      active: [5, 6], values: { u: "6,7", sack: "{3},{2}", distinct: 1 } },
    { note: "Node 3 keeps one child's sack, copies the other, and adds colour 2. The sack is {2:2, 3:1} with distinct-count 2.",
      active: [2], values: { u: 3, sack: "{2:2,3:1}", distinct: 2 } },
    { note: "Root 1 steals the larger child sack (node 2, three keys), copies node 3 in, and adds colour 1. Distinct-count at the root is 3.",
      active: [0], values: { u: 1, sack: "{1,2,3}", distinct: 3 } },
  ],
  mermaid: `graph TD
  a["sack of 2 size 3"] --> b["keep it as sack of 1"]
  c["sack of 3 size 2"] --> d["merge into 1"]
  b --> e["each key moved once"]
  d --> e`,
  steps: [
    "<strong>DFS sizes first.</strong> Fill <code>sz[u]</code> and <code>heavy[u]</code> so the merge pass already knows which one child is allowed to keep its map and which children must be copied.",
    "<strong>Recurse into the heavy child and steal its map.</strong> Do not write <code>new HashMap&lt;&gt;(heavyMap)</code>; take the reference, because copying the heavy keys at every ancestor is exactly the quadratic the doubling argument forbids.",
    "<strong>Recurse each light child, then merge small into large.</strong> Iterate the light map, pour it into the stolen one, and drop it. If a helper ever sees the target smaller than the source, swap first so the doubling still holds.",
    "<strong>Insert the node's own value last.</strong> The sack of <code>u</code> is the union of its children plus <code>u</code> itself, so the node's colour has to land in the map before you read any statistic off it.",
    "<strong>Record <code>ans[u]</code> while the sack still belongs to <code>u</code>.</strong> After you return, a light parent will copy these keys and forget this map, so a later read of the same reference is no longer the subtree of <code>u</code>.",
    "<strong>A light child is allowed to be rebuilt.</strong> If <code>u</code> is itself a light child, the parent will copy every key; that rebuild is the one doubling this value is charged for, and it is why the total stays <code>O(n log n)</code>.",
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
      "<p>Measure each sack by the number of tree nodes in it. The heavy child's sack is already at least as large as any one light child. Copying a light sack of <code>L</code> nodes into that larger sack places every copied value in a host of size at least <code>2L</code>. A value starts in a sack of 1 and the host can double at most <code>log&#8322; n</code> times before it is the whole tree, so each of the <code>n</code> values is copied <code>O(log n)</code> times. Heavy keys are not copied at the current node &mdash; the parent steals the reference &mdash; so they are charged only when this whole node later sits on the light side of somebody else.</p>",
      "<span class=\"eq\">T = n values &times; O(log n) copies = O(n log n) map operations</span>",
      "<p>Putting real numbers in: at <code>n = 10&#8309;</code> you have at most about 17 copies per value, for a couple of million HashMap operations. Java's hash constant is larger than a Fenwick hop, but two million still fits a two-second limit. Copy the heavy map instead and each of the <code>n</code> ancestors of a leaf on a line pays linear work, which is <code>n&sup2; / 2</code> insertions, about five billion, and the solution TLEs. The space is one map entry per live key; stolen references mean you do not keep <code>n</code> full copies at once.</p>",
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
      bug: "<code>new HashMap&lt;&gt;(heavyMap)</code> looks tidy and is correct: the parent really does hold a copy of the heavy keys. It also charges <code>O(sz[heavy])</code> at every ancestor, so a line of nodes copies the same leaf <code>n</code> times and the doubling bound collapses to quadratic.",
      fix: "Steal the reference. The heavy child does not need its map after you have recorded <code>ans[heavy]</code>. Test on a path graph: the heavy spine must not allocate a new map at every node." },
    { title: "Merging large into small",
      bug: "Always iterating <code>b</code> into <code>a</code> looks fine when the caller already passed (heavy, light). A helper that does not swap will, on a tie or a swapped call, copy the larger map into the smaller one and a single value can move a linear number of times.",
      fix: "Swap if <code>a.size() &lt; b.size()</code> before iterating, the same way DSU hangs the smaller root under the larger. Test by merging a singleton into a map of size 100 and then the other way around; both must iterate the singleton." },
    { title: "Recording the answer after discarding the sack",
      bug: "Returning the map and then writing <code>ans[u] = sack.get(u).size()</code> at the parent looks like a clean split of \"merge\" and \"read\". By then a light parent may already have copied and dropped this map, so you read an empty or reused object.",
      fix: "Write <code>ans[u]</code> while the merged map still belongs to <code>u</code>, before the function returns. Test that every <code>ans[u]</code> matches a brute-force set built from the descendants of <code>u</code>." },
    { title: "Using this for path queries",
      bug: "\"Distinct values from <code>u</code> to <code>v</code>\" looks like the same map problem, and a sack of descendants is sitting right there. A sack is the subtree multiset, not the path; using it for a path counts nodes that are off the path and misses nodes that are on it.",
      fix: "Ask: is the queried set a subtree or a path? Subtree &rarr; small-to-large; path &rarr; HLD. Test on a path that is not a subtree: the sack answer and the true path answer must differ." },
    { title: "HashMap on tight limits without reserving",
      bug: "A default-capacity <code>HashMap</code> per sack looks harmless and is correct. Java 8 rehash storms on a stream of <code>n = 2&times;10&#8309;</code> insertions can push a tight limit into TLE even though the asymptotic bound holds.",
      fix: "Size-hint the first map you allocate, or switch to arrays when values are compressed to <code>[1, n]</code>. Test the worst-case line with distinct colours and a two-second cap." },
  ],
  variants: [
    ["Mode of the subtree", "Track a running (bestCount, bestColor) while merging counts.", "if (cnt > best) update", "CF 600E"],
    ["Keep all maps", "Persistent / immutable maps if a parent still needs the child sack later.", "more memory", "rare"],
    ["DSU union-by-size", "Same doubling, on connectivity instead of tree sacks.", "if (sz[a]<sz[b]) swap", "Kruskal"],
  ],
  followups: [
    ["Why is this also called DSU-on-tree?",
      "<p>You are unioning child sacks into a parent the same way disjoint-set union merges components: always the smaller into the larger, so an element moves only when its host at least doubles. The \"DSU\" is a metaphor for that doubling habit. There is no <code>parent[]</code> array, no path compression, and no rollback-free disjoint-set structure unless you add one on top for a different part of the problem.</p>"],
    ["Can you answer path queries this way?",
      "<p>No. A sack is the multiset of values in a subtree, which is a contiguous DFS interval but not a path. For a path you need heavy-light decomposition, or a persistent segment tree on the Euler or DFS order. If you catch yourself merging maps to answer \"from <code>u</code> to <code>v</code>\", stop and switch tools.</p>"],
    ["What if values are large (1e9)?",
      "<p>A <code>HashMap</code> keyed on the raw values is fine for distinct-count and mode. If you need order statistics inside the sack (the k-th colour, a range of values), compress coordinates down to <code>[1, n]</code> first and keep a Fenwick tree of counts, still merging small into large. Compression is a preprocess; it does not change the doubling bound.</p>"],
    ["How do you handle updates to a node's colour?",
      "<p>Small-to-large is a static DFS: the sacks are built once on the way back from the leaves. A colour change invalidates every sack on the path to the root, and there is no cheap way to patch them. Updates need a different structure, typically HLD plus a Fenwick of colours, or a segment tree whose nodes store sets. If the updates are offline, you can sometimes rebuild after each change for tiny <code>n</code> only.</p>"],
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

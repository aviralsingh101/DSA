/* Module 05 — Trees */

import { pack, lc, cf } from "./pack.mjs";

export const topics = [

/* ====================================== 1. binary-tree-basics-and-traversals */
pack({
  id: "binary-tree-basics-and-traversals",
  difficulty: "Easy",
  readTime: "22 min",
  tagline: "A binary tree is a recursive pair of subtrees. Every classic walk &mdash; preorder, " +
    "inorder, postorder, level order &mdash; is the same recursion with the visit moved.",
  tags: ["binary tree", "DFS", "BFS", "traversal", "P0"],
  prereqs: [
    ["Recursion Fundamentals", "../04-recursion-and-dnc/recursion-fundamentals.html"],
    ["Complexity Analysis", "../00-foundations/complexity-analysis.html"],
  ],
  why: [
    "Almost every binary-tree question is a traversal wearing a costume. Diameter, path sum, " +
      "symmetry, serialisation, construction from two orders &mdash; each is \"walk every node " +
      "exactly once and combine the children's answers\". If you cannot write the four walks " +
      "without looking them up, the later pages in this module feel like magic.",
    "The recursive definition is the whole data structure: a node holds a value and two " +
      "optional children. Height, size, and \"is this a leaf\" fall out of that definition in " +
      "three lines. Interviewers ask for both recursive and iterative forms because a " +
      "linked-list-shaped degenerate of n = 1e5 overflows the JVM stack.",
    "The four orders are not four algorithms. They are one DFS with the visit placed before, " +
      "between, or after the two recursive calls, plus one BFS that swaps the implicit stack " +
      "for an ArrayDeque.",
  ],
  insight: "Preorder / inorder / postorder are the same DFS with the visit moved. Level order " +
    "is the same walk with a queue instead of a stack. Learn one walk, then move the visit.",
  yes: [
    "Return the preorder / inorder / postorder / level-order list of values",
    "Height, depth, number of nodes, or is this a leaf / full / complete tree",
    "A problem that is \"do something at every node, using answers from children\"",
    "Reconstruct a tree from two of the three DFS orders",
    "Iterative traversal is requested, or n is large enough that recursion may overflow",
  ],
  no: [
    "The input is a general graph with cycles &rarr; BFS/DFS on graphs, not a tree walk",
    "You need ancestor queries or path aggregates on a static tree &rarr; LCA or Euler tour",
    "The tree is a BST and the question uses the search-tree invariant &rarr; BST page",
    "You are counting strings or XOR pairs &rarr; trie / XOR trie",
  ],
  table: [
    ["List nodes in preorder / inorder / postorder", "DFS, visit placement differs", "Recursive or iterative DFS"],
    ["Level by level, left to right by depth", "BFS, one queue", "ArrayDeque level-order"],
    ["Height / maximum depth", "1 + max of children's heights", "Postorder combine"],
    ["Invert / flip / mirror the tree", "Swap children, then recurse", "Preorder or postorder swap"],
    ["Same tree / symmetric", "Pairwise walk of two pointers", "Simultaneous recursion or BFS"],
    ["<strong>Confused with:</strong> topological order on a DAG",
      "A tree walk has no incoming-edge count and no cycle",
      "Topo sort on graphs"],
  ],
  constraint: "n &le; 1e5 is fine for an iterative walk. Recursive DFS on a skew tree of that " +
    "size overflows the Java stack (typically a few thousand frames). Prefer iterative whenever " +
    "the statement does not promise a balanced tree.",
  core: [
    "A binary tree node is (val, left, right). The recursive walk is: optionally visit, walk " +
      "left, optionally visit, walk right, optionally visit. Preorder visits first, inorder " +
      "between the children, postorder last. Height = 1 + max(hL, hR) with null contributing 0 " +
      "(nodes) or -1 (edges).",
    "Iterative preorder: stack, pop, visit, push right then left. Iterative inorder: walk cur " +
      "left while pushing, then pop-visit and step right. Level order: queue, snapshot size to " +
      "group by depth. Use ArrayDeque, never java.util.Stack.",
  ],
  invariant: "<p>Every node is entered once and left once. The three DFS orders are the same " +
    "walk; only the moment of recording node.val changes:</p>" +
    "<span class=\"eq\">pre = visit, L, R &nbsp;|&nbsp; in = L, visit, R &nbsp;|&nbsp; post = L, R, visit</span>" +
    "<p>Interview sentence: <em>\"I walk every node once; the order is where I put the visit.\"</em></p>",
  arrayLabel: "preorder output",
  array: [1, 2, 4, 5, 3],
  vars: ["node", "phase", "written"],
  vizTitle: "Preorder filling a flat output array",
  frames: [
    { note: "Enter 1. Preorder writes on entry, slot 0 becomes 1. Next: left child 2.",
      active: [0], dim: [1, 2, 3, 4],
      values: { node: 1, phase: "visit", written: 1 } },
    { note: "Enter 2. Write 2 at slot 1. Next: left child 4.",
      active: [1], done: [0], dim: [2, 3, 4],
      values: { node: 2, phase: "visit", written: 2 } },
    { note: "Enter 4. Write 4. Both children null, subtree done.",
      active: [2], done: [0, 1], dim: [3, 4],
      values: { node: 4, phase: "visit leaf", written: 3 } },
    { note: "Back at 2, walk right child 5. Write 5 at slot 3.",
      active: [3], done: [0, 1, 2], dim: [4],
      values: { node: 5, phase: "visit leaf", written: 4 } },
    { note: "Subtree of 2 finished. Back at 1, walk right child 3. Write 3.",
      active: [4], done: [0, 1, 2, 3],
      values: { node: 3, phase: "visit leaf", written: 5 } },
    { note: "Done. Preorder [1,2,4,5,3]. Inorder would be [4,2,5,1,3]; postorder [4,5,2,3,1]; level order [1,2,3,4,5].",
      best: [0, 1, 2, 3, 4],
      values: { node: "done", phase: "all four orders", written: 5 } },
  ],
  merTitle: "The sample tree",
  mermaid: `graph TD
  t1["1"] --> t2["2"]
  t1 --> t3["3"]
  t2 --> t4["4"]
  t2 --> t5["5"]`,
  steps: [
    "<strong>Represent</strong> Node(val, left, right). Missing child is null.",
    "<strong>Recursive DFS:</strong> base-case on null, place out.add before, between, or after the two rec calls.",
    "<strong>Iterative preorder:</strong> stack starts with root; pop, visit, push right then left. ArrayDeque.",
    "<strong>Iterative inorder:</strong> walk cur left while pushing, pop-visit, cur = popped.right.",
    "<strong>Level order:</strong> queue root; drain sz = q.size() each layer.",
    "<strong>Height / size</strong> are postorder combines; if n can be a skew chain, prefer iterative.",
  ],
  code: [
    { tab: "Brute", file: "HeightOnly.java",
      code: `public class HeightOnly {
    static class Node {
        int val; Node left, right;
        Node(int v) { val = v; }
    }
    static int height(Node n) {
        if (n == null) return 0;
        return 1 + Math.max(height(n.left), height(n.right));
    }
    public static void main(String[] args) {
        Node r = new Node(1);
        r.left = new Node(2); r.right = new Node(3);
        r.left.left = new Node(4); r.left.right = new Node(5);
        System.out.println(height(r));
    }
    // Input : tree 1 / 2 3 / 4 5
    // Output: 3
}` },
    { tab: "Optimal", file: "TreeTraversals.java",
      code: `import java.util.ArrayList;
import java.util.List;

public class TreeTraversals {
    static class Node {
        int val; Node left, right;
        Node(int v) { val = v; }
    }
    static void preorder(Node n, List<Integer> out) {
        if (n == null) return;
        out.add(n.val);
        preorder(n.left, out);
        preorder(n.right, out);
    }
    static void inorder(Node n, List<Integer> out) {
        if (n == null) return;
        inorder(n.left, out);
        out.add(n.val);
        inorder(n.right, out);
    }
    static void postorder(Node n, List<Integer> out) {
        if (n == null) return;
        postorder(n.left, out);
        postorder(n.right, out);
        out.add(n.val);
    }
    public static void main(String[] args) {
        Node r = new Node(1);
        r.left = new Node(2); r.right = new Node(3);
        r.left.left = new Node(4); r.left.right = new Node(5);
        List<Integer> pre = new ArrayList<>(), in = new ArrayList<>(), post = new ArrayList<>();
        preorder(r, pre); inorder(r, in); postorder(r, post);
        System.out.println(pre);
        System.out.println(in);
        System.out.println(post);
    }
    // Input : tree 1 / 2 3 / 4 5
    // Output: [1, 2, 4, 5, 3]
    //         [4, 2, 5, 1, 3]
    //         [4, 5, 2, 3, 1]
}` },
    { tab: "Template", file: "LevelOrder.java",
      code: `import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;

public class LevelOrder {
    static class Node {
        int val; Node left, right;
        Node(int v) { val = v; }
    }
    static List<List<Integer>> levelOrder(Node root) {
        List<List<Integer>> out = new ArrayList<>();
        if (root == null) return out;
        ArrayDeque<Node> q = new ArrayDeque<>();
        q.add(root);
        while (!q.isEmpty()) {
            int sz = q.size();
            List<Integer> row = new ArrayList<>();
            for (int i = 0; i < sz; i++) {
                Node u = q.poll();
                row.add(u.val);
                if (u.left != null) q.add(u.left);
                if (u.right != null) q.add(u.right);
            }
            out.add(row);
        }
        return out;
    }
    public static void main(String[] args) {
        Node r = new Node(1);
        r.left = new Node(2); r.right = new Node(3);
        r.left.left = new Node(4); r.left.right = new Node(5);
        System.out.println(levelOrder(r));
    }
    // Input : tree 1 / 2 3 / 4 5
    // Output: [[1], [2, 3], [4, 5]]
}` },
  ],
  complexity: {
    time: "O(n)",
    space: "O(h) recursion / stack, O(w) for BFS",
    derivation: [
      "Each node is pushed and popped a constant number of times, so every walk is linear in the number of nodes.",
      "<span class=\"eq\">T(n) = T(n_L) + T(n_R) + &Theta;(1) = &Theta;(n)</span>",
      "Auxiliary space is the height h (skew = n) or the BFS width w (complete last level = n/2).",
    ],
    compare: [
      ["Recursive DFS", "O(n)", "O(h) stack", "Default; fine when balanced"],
      ["Iterative DFS", "O(n)", "O(h) heap", "Skew trees, or recursion banned"],
      ["Level-order BFS", "O(n)", "O(w)", "Anything that needs depth grouping"],
      ["Morris traversal", "O(n)", "O(1)", "Rare; temporarily threads the tree"],
    ],
  },
  pitfalls: [
    { title: "Using java.util.Stack",
      bug: "Synchronised Vector subclass, wrong methods, slower.",
      fix: "ArrayDeque: push/pop/peek for DFS, add/poll for BFS." },
    { title: "Forgetting the null base case",
      bug: "NPE on a missing child; only shows up on trees that are not perfectly full.",
      fix: "First line: if (node == null) return (or the identity of the combine)." },
    { title: "Height off-by-one (nodes vs edges)",
      bug: "LC 104 wants 1 for a single node; LC 543 diameter is in edges.",
      fix: "State the convention in a comment. Edge-height: null returns -1." },
    { title: "Level-order without snapshotting queue size",
      bug: "Cannot tell where one level ends. Flat list is still correct; grouped list is not.",
      fix: "int sz = q.size(); then a for of that many polls." },
    { title: "Recursive walk on a linked-list-shaped tree",
      bug: "n=1e5 right spine, StackOverflowError.",
      fix: "Write the iterative version." },
  ],
  variants: [
    ["Morris inorder", "Thread predecessor.right back to cur; restore on the second visit.",
      "pred.right = cur; later pred.right = null;", "LC 94 follow-up"],
    ["Zigzag level order", "Same BFS, reverse every other level.",
      "if ((out.size() & 1) == 1) Collections.reverse(level);", "LC 103"],
    ["N-ary walks", "Loop children; no unique inorder.",
      "for (Node c : node.children) rec(c);", "LC 429 / 589 / 590"],
  ],
  followups: [
    ["How do you reconstruct from preorder and inorder?",
      "<p>First preorder value is the root. Find it in inorder: left of it is the left subtree. Map values to indices for O(1) splits, total O(n). Preorder+postorder is ambiguous unless the tree is full.</p>"],
    ["Why is inorder of a BST sorted?",
      "<p>Left &lt; root &lt; right, and inorder is L, root, R. See the BST page.</p>"],
    ["O(1) extra space with parent pointers?",
      "<p>Walk to parent and decide whether you arrived from the left child. Same three-colour state machine as iterative postorder, stored in the current position.</p>"],
    ["What changes for an n-ary tree?",
      "<p>DFS becomes visit then loop children. Level order is unchanged except the enqueue loop. There is no unique inorder.</p>"],
  ],
  problems: [
    lc(144, "binary-tree-preorder-traversal", "Easy", "DFS, visit first"),
    lc(94, "binary-tree-inorder-traversal", "Easy", "DFS, visit between"),
    lc(145, "binary-tree-postorder-traversal", "Easy", "DFS, visit last"),
    lc(102, "binary-tree-level-order-traversal", "Medium", "BFS with size snapshot"),
    lc(104, "maximum-depth-of-binary-tree", "Easy", "Postorder height in nodes"),
    lc(111, "minimum-depth-of-binary-tree", "Easy", "BFS first leaf"),
    lc(100, "same-tree", "Easy", "Simultaneous walk"),
    lc(101, "symmetric-tree", "Easy", "Mirror pair"),
  ],
  recap: [
    "<strong>One DFS, three visit placements</strong> give preorder, inorder, postorder.",
    "<strong>Level order is BFS</strong> with sz = q.size().",
    "<strong>Height and size are postorder combines</strong> with a null identity of 0.",
    "<strong>Iterative forms</strong> are required on skew trees.",
    "<strong>ArrayDeque</strong>, never java.util.Stack.",
  ],
  oneliner: "if (n==null) return; visit/L/R placements | BFS: while q, sz=q.size(), drain, enqueue children",
}),

/* ====================================== 2. binary-tree-problem-patterns */
pack({
  id: "binary-tree-problem-patterns",
  difficulty: "Medium",
  readTime: "24 min",
  tagline: "Diameter, path sum, LCA of two nodes, serialise, and construct-from-orders are " +
    "all a postorder combine or a preorder emit with a payload attached to the walk you already own.",
  tags: ["binary tree", "diameter", "path sum", "P0"],
  prereqs: [["Binary Tree Basics & Traversals", "binary-tree-basics-and-traversals.html"]],
  why: [
    "Once the four walks are mechanical, interview tree problems stop being unique puzzles. " +
      "Diameter is \"height of both children, plus maybe the path through me\". Path-sum is " +
      "\"carry a remaining target, or return a list of leftover contributions\". LCA in a " +
      "general binary tree is \"if I sit in different subtrees of u, u is the answer\".",
    "The pattern language is: return a struct from a postorder (height + diameter, or " +
      "(hasP, hasQ)), or emit on the way down (serialise, construct). If you reach for a " +
      "global ArrayList of all root-to-leaf paths and then scan, you are a generation behind.",
    "This page is the cluster: diameter, max path sum, path sum I/II/III, invert, flatten, " +
      "serialise, construct, lowest common ancestor, subtree of another tree.",
  ],
  insight: "Almost every \"hard\" binary-tree question is a postorder that returns more than " +
    "one number, plus maybe a global best. Name the struct before you code.",
  yes: [
    "Diameter / maximum path sum / binary tree cameras (postorder struct + global)",
    "Path sum I/II/III, path with a given sum anywhere",
    "Lowest common ancestor of two nodes in a general binary tree",
    "Serialise / deserialise, construct from preorder+inorder",
    "Invert, flatten to linked list, subtree of another tree",
  ],
  no: [
    "The tree is a BST and you can use the ordered invariant &rarr; BST page",
    "You need all-pairs on a static tree with n=1e5 &rarr; LCA / rerooting / Euler",
    "n-ary general graph &rarr; graph DFS",
    "You are matching prefixes of strings &rarr; trie",
  ],
  table: [
    ["Diameter of a binary tree", "Through-me = hL+hR, vs best in a child", "Postorder, global best"],
    ["Max path sum (any node to any)", "Gain from a child is max(0, childGain)", "LC 124, same shape"],
    ["Path sum to a leaf / list of paths", "Carry remaining, push/pop the path", "LC 112 / 113"],
    ["LCA of p and q", "If p and q in different sides, node is LCA", "Postorder pair of booleans"],
    ["Construct from two orders", "Pre gives root, inorder splits", "Map + indices, O(n)"],
    ["<strong>Confused with:</strong> tree DP on a general n-ary tree with rerooting",
      "Binary-tree interviews usually want one DFS; rerooting is the next page",
      "This page = interview cluster; next = CP tree DP"],
  ],
  constraint: "n &le; 1e5, values can be negative (max path sum). Recursion depth is h; if " +
    "unbounded, the iterative rewrite is rarely asked for diameter but is asked for traversals.",
  core: [
    "Diameter: a function height(u) that also updates ans = max(ans, hL+hR). The longest path " +
      "counted in edges is that global ans. Max path sum is the same with a twist: a child " +
      "that contributes a negative gain is dropped (max(0, gain)), and the through-me candidate " +
      "is val+gainL+gainR, while the value you return upward is val+max(gainL,gainR).",
    "LCA: rec returns null if the subtree has neither; returns the node if it is p or q or if " +
      "both sides returned non-null. Path-sum III is prefix sums on the root-to-here path with " +
      "a hashmap of leftover prefixes (same as subarray-sum-k on the unique path to the root).",
  ],
  invariant: "<p>After both children return, you know everything about the two subtrees. The " +
    "only new paths are those that go through the current node.</p>" +
    "<span class=\"eq\">ans = max(ans, combine(left, me, right)); return a summary upward</span>",
  arrayLabel: "height[] written in postorder on values [1,2,4,5,3]",
  array: [3, 2, 1, 1, 1],
  indexLabels: ["1", "2", "4", "5", "3"],
  vars: ["u", "hL", "hR", "diam"],
  vizTitle: "Diameter on the sample: through node 2 the path 4-2-5 has length 2",
  frames: [
    { note: "Leaves 4,5,3 have height 1 (nodes) / 0 (edges). Start at 4.",
      active: [2],
      values: { u: 4, hL: 0, hR: 0, diam: 0 } },
    { note: "Node 5 same. Node 2: hL=hR=1 (edges: 0+0, wait in edges null=-1+1=0). Using edges: leaves 0, node 2 through-me = 0+0=0? Sample 4-2-5 is 2 edges. Leaves height 0 in edges, 2 has hL=hR=0? No: leaf height in edges is 0, but the edge to the leaf is counted at the parent: through-me = hL+hR+2 if heights are in edges of subtrees... Standard: height(null)=-1, height(leaf)=0, through = hL+hR+2.",
      active: [1],
      values: { u: 2, hL: 0, hR: 0, diam: 2 } },
    { note: "Convention used in code: height in nodes, through-me = hL+hR (edges = hL+hR of node-heights minus something). LC 543: height in edges, ans = max(hL+hR) with leaf height 0.",
      active: [1],
      values: { u: 2, hL: 1, hR: 1, diam: 2 } },
    { note: "Node 1: hL=2, hR=1, through-me=3 (path 4-2-1-3). Global diam=3 edges? 4-2-1-3 is 3 edges. Path 4-2-5 is 2. Answer 3.",
      active: [0],
      values: { u: 1, hL: 2, hR: 1, diam: 3 } },
    { note: "Return height 3 for the root. Diameter 3 is the global, not the height.",
      best: [0, 1, 2, 4],
      values: { u: 1, hL: 2, hR: 1, diam: 3 } },
    { note: "Max path sum would drop negative children and compare val+L+R against a global.",
      done: [0, 1, 2, 3, 4],
      values: { u: "124", hL: "gain", hR: "gain", diam: "max path" } },
  ],
  merTitle: "Diameter path 4-2-1-3",
  mermaid: `graph TD
  t1["1"] --> t2["2"]
  t1 --> t3["3"]
  t2 --> t4["4"]
  t2 --> t5["5"]`,
  steps: [
    "<strong>Name the struct</strong> returned upward (height, gain, (foundP, foundQ)).",
    "<strong>Postorder:</strong> rec left, rec right, combine, maybe update a global ans.",
    "<strong>Diameter:</strong> ans = max(ans, hL+hR); return 1+max(hL,hR) with null = 0 or -1.",
    "<strong>Max path:</strong> gain = val+max(0,gainL,gainR); ans = max(ans, val+max(0,gL)+max(0,gR)).",
    "<strong>LCA:</strong> if both sides non-null, return u; else return the non-null side.",
    "<strong>Construct:</strong> preorder index advances; inorder lo..hi split at the root value.",
  ],
  code: [
    { tab: "Brute", file: "AllLeafPaths.java",
      code: `public class AllLeafPaths {
    static class Node {
        int val; Node left, right;
        Node(int v) { val = v; }
    }
    static int diam = 0;
    static int height(Node n) {
        if (n == null) return 0;
        int L = height(n.left), R = height(n.right);
        diam = Math.max(diam, L + R);
        return 1 + Math.max(L, R);
    }
    public static void main(String[] args) {
        Node r = new Node(1);
        r.left = new Node(2); r.right = new Node(3);
        r.left.left = new Node(4); r.left.right = new Node(5);
        diam = 0;
        height(r);
        System.out.println(diam);
    }
    // Input : sample tree
    // Output: 3
}` },
    { tab: "Optimal", file: "DiameterLca.java",
      code: `public class DiameterLca {
    static class Node {
        int val; Node left, right;
        Node(int v) { val = v; }
    }
    static int ans;
    static int height(Node n) {
        if (n == null) return 0;
        int L = height(n.left), R = height(n.right);
        ans = Math.max(ans, L + R);
        return 1 + Math.max(L, R);
    }
    static Node lca(Node n, Node p, Node q) {
        if (n == null || n == p || n == q) return n;
        Node L = lca(n.left, p, q), R = lca(n.right, p, q);
        if (L != null && R != null) return n;
        return L != null ? L : R;
    }
    public static void main(String[] args) {
        Node r = new Node(1);
        r.left = new Node(2); r.right = new Node(3);
        r.left.left = new Node(4); r.left.right = new Node(5);
        ans = 0;
        height(r);
        System.out.println(ans);
        System.out.println(lca(r, r.left.left, r.right).val);
    }
    // Input : sample, LCA of 4 and 3
    // Output: 3
    //         1
}` },
    { tab: "Template", file: "MaxPathSum.java",
      code: `public class MaxPathSum {
    static class Node {
        int val; Node left, right;
        Node(int v) { val = v; }
    }
    static int best;
    static int gain(Node n) {
        if (n == null) return 0;
        int L = Math.max(0, gain(n.left));
        int R = Math.max(0, gain(n.right));
        best = Math.max(best, n.val + L + R);
        return n.val + Math.max(L, R);
    }
    public static void main(String[] args) {
        Node r = new Node(-10);
        r.left = new Node(9);
        r.right = new Node(20);
        r.right.left = new Node(15);
        r.right.right = new Node(7);
        best = Integer.MIN_VALUE / 4;
        gain(r);
        System.out.println(best);
    }
    // Input : LC 124 sample
    // Output: 42
}` },
  ],
  complexity: {
    time: "O(n)",
    space: "O(h)",
    derivation: [
      "One DFS, constant work per node. Construction from two arrays is O(n) with a hashmap, O(n^2) if you scan inorder each time.",
      "<span class=\"eq\">T = &Theta;(n)</span>",
      "Path sum III with a hashmap is still O(n) expected if you add/remove on the way down/up (backtracking the prefix count).",
    ],
    compare: [
      ["Naive all-pairs paths", "O(n^2)", "O(h)", "Tiny n"],
      ["Postorder struct", "O(n)", "O(h)", "Diameter, max path, LCA"],
      ["Prefix + hashmap on the path", "O(n)", "O(h)", "Path sum III"],
      ["Binary lifting LCA", "O(n log n) prep", "O(n log n)", "Many queries, next pages"],
    ],
  },
  pitfalls: [
    { title: "Returning the through-me path as height",
      bug: "Height must be one side only. Using L+R as the returned height double-counts.",
      fix: "Return 1+max(L,R). Store L+R only in the global ans." },
    { title: "Max path sum without dropping negatives",
      bug: "A child with gain -5 is forced into the parent. The parent would be better alone.",
      fix: "max(0, childGain) when contributing upward and through-me." },
    { title: "LCA comparing values instead of references",
      bug: "Duplicate values, or nodes that are not the given p,q instances.",
      fix: "Compare node identity (or a unique id), not val, unless the statement says values are unique." },
    { title: "Construct without a map, O(n^2)",
      bug: "indexOf in inorder at every node.",
      fix: "HashMap val -> inorder index, pass lo/hi." },
    { title: "Path sum III double-counting with a global map not backtracked",
      bug: "A prefix from another branch still sits in the map.",
      fix: "map.merge(prefix, 1, add) going down, subtract going up." },
  ],
  variants: [
    ["Serialise", "Preorder with explicit nulls, or BFS with queue.",
      "if (n==null) { out.add(\"#\"); return; }", "LC 297"],
    ["Flatten to linked list", "Postorder: stitch left tail to right, hang left on right.",
      "n.right = left; tail.right = oldRight;", "LC 114"],
    ["Cameras / house robber III", "Return a 3-state / 2-state struct from postorder.",
      "int[] {rob, skip}", "LC 968 / 337"],
  ],
  followups: [
    ["Diameter in nodes vs edges?",
      "<p>LC 543 is edges. A single node is 0. If height is in nodes (leaf=1), diameter in edges is hL+hR of those heights... actually with node-heights leaf=1, through-me edges = hL+hR. With edge-heights leaf=0, through-me = hL+hR. Pick one and match the statement.</p>"],
    ["LCA when one node is ancestor of the other?",
      "<p>The first time you hit p (or q), you return it. The other node sits below, so the other side returns null, and you propagate p upward. That is correct: p is the LCA.</p>"],
    ["Why max(0, gain) in LC 124?",
      "<p>You may choose not to extend the path into a child. The path has to be non-empty (at least the node). Negative children cannot help a path that is allowed to stop at you.</p>"],
    ["Subtree of another tree?",
      "<p>Either serialise both and substring-search, or for each node of A try \"same tree\" with B. Same-tree is a simultaneous walk. O(n m) naive; hashing serialisations is O(n+m).</p>"],
  ],
  problems: [
    lc(543, "diameter-of-binary-tree", "Easy", "Postorder + global"),
    lc(124, "binary-tree-maximum-path-sum", "Hard", "Drop negative gains"),
    lc(112, "path-sum", "Easy", "Carry remaining to a leaf"),
    lc(113, "path-sum-ii", "Medium", "Push/pop the path"),
    lc(437, "path-sum-iii", "Medium", "Prefix map on the root-path"),
    lc(236, "lowest-common-ancestor-of-a-binary-tree", "Medium", "Postorder both-sides"),
    lc(297, "serialize-and-deserialize-binary-tree", "Hard", "Preorder with nulls"),
    lc(105, "construct-binary-tree-from-preorder-and-inorder-traversal", "Medium", "Split inorder"),
  ],
  recap: [
    "<strong>Name the struct</strong> returned from postorder.",
    "<strong>Global ans</strong> for through-me candidates (diameter, max path).",
    "<strong>LCA:</strong> both sides non-null &rarr; this node.",
    "<strong>Path sum III:</strong> prefix + hashmap, backtrack.",
    "<strong>Construct:</strong> map + shrinking inorder window.",
  ],
  oneliner: "hL,hR = rec; ans=max(ans,combine); return summary(hL,hR,val)",
}),

/* ====================================== 3. bst ======================== */
pack({
  id: "bst",
  difficulty: "Easy",
  readTime: "22 min",
  tagline: "Left &lt; node &lt; right on every subtree: inorder is sorted, k-th smallest is " +
    "an inorder walk, and validate is a range (lo, hi) passed down, not a local comparison.",
  tags: ["BST", "inorder", "validate", "P0"],
  prereqs: [
    ["Binary Tree Basics & Traversals", "binary-tree-basics-and-traversals.html"],
    ["Binary Search Basics", "../01-arrays-and-windows/binary-search-basics.html"],
  ],
  why: [
    "A BST is a binary tree plus an invariant, and almost every BST bug is a local check that " +
      "is not the invariant. \"Left child &lt; me &lt; right child\" is necessary and not " +
      "sufficient: a right grandchild can still violate the ancestor. The real invariant is a " +
      "range: every node sits in (lo, hi) inherited from its ancestors.",
    "Because inorder is sorted, k-th smallest is \"walk inorder, stop at k\", and \"two-sum " +
      "in a BST\" is a two-pointer on the iterator, not a hash set you needed for an unsorted " +
      "tree. Delete is the one structural operation people fumble (two children: splice the " +
      "inorder successor).",
    "Balanced BSTs (TreeMap) are a later Java page. This page is the interview BST: validate, " +
      "search, insert, delete, k-th, LCA using values, convert sorted array to BST.",
  ],
  insight: "Validate with a range, not a local compare. Inorder of a BST is strictly increasing " +
    "(if unique keys). k-th smallest is inorder that stops early.",
  yes: [
    "Validate binary search tree",
    "k-th smallest / k-th largest in a BST",
    "Insert / delete / search",
    "LCA in a BST (walk from the root using values)",
    "Convert a sorted array to a height-balanced BST",
  ],
  no: [
    "The tree is not ordered &rarr; general binary-tree patterns",
    "You need O(1) extra k-th after many inserts &rarr; store subtree sizes (order-statistic tree)",
    "String prefixes &rarr; trie",
    "n=1e5 and you need log queries on a static tree of un-ordered values &rarr; not a BST",
  ],
  table: [
    ["Is this a BST?", "Every node in (lo, hi)", "DFS with range, or inorder increasing"],
    ["k-th smallest", "Inorder, stop at k", "O(h+k) / O(n)"],
    ["LCA of two values", "Walk until p and q split", "O(h)"],
    ["Delete a node with two children", "Replace with inorder successor", "Min of right subtree"],
    ["Sorted array to BST", "Mid as root, rec sides", "O(n)"],
    ["<strong>Confused with:</strong> heap",
      "Heap is only parent vs children, not a total inorder",
      "Heap for priority; BST for ordered keys"],
  ],
  constraint: "n &le; 1e4 in interviews, n &le; 1e5 in contests. Skew BST is a linked list: " +
    "search is O(n). TreeMap/TreeSet are red-black, O(log n) guaranteed. Duplicate policy: " +
    "usually unique; if not, pick &le; on one side and document it.",
  core: [
    "Validate: ok(node, lo, hi) with long sentinels (or null bounds). Fail if val &le; lo or " +
      "val &ge; hi. Recurse left with hi=val, right with lo=val. Inorder alternative: prev " +
      "pointer, fail if node.val &le; prev.",
    "Insert: empty slot is the new node; go left if val &lt; cur, else right. Delete: 0 children " +
      "drop; 1 child replace; 2 children copy successor.val then delete successor (which has no " +
      "left). LCA: while node is not between p and q, step left or right.",
  ],
  invariant: "<p>For every node, all keys in its left subtree are &lt; node.val and all keys in " +
    "its right subtree are &gt; node.val (unique keys).</p>" +
    "<span class=\"eq\">lo &lt; node.val &lt; hi, inherited from ancestors</span>",
  arrayLabel: "inorder values (must be strictly increasing)",
  array: [1, 2, 3, 4, 5],
  vars: ["node", "lo", "hi", "ok"],
  vizTitle: "Validate BST: range tightens on the way down",
  frames: [
    { note: "Tree 4 / 2 5 / 1 3. Root 4 in (-inf, +inf).",
      active: [3],
      values: { node: 4, lo: "-inf", hi: "+inf", ok: true } },
    { note: "Left child 2 must be in (-inf, 4).",
      active: [1],
      values: { node: 2, lo: "-inf", hi: 4, ok: true } },
    { note: "1 in (-inf, 2), 3 in (2, 4). Both ok.",
      active: [0, 2],
      values: { node: 3, lo: 2, hi: 4, ok: true } },
    { note: "Right child 5 in (4, +inf). Ok. Whole tree valid.",
      active: [4],
      values: { node: 5, lo: 4, hi: "+inf", ok: true } },
    { note: "If 3 were 6, local 2<6 but 6 is not <4. Range check catches it; a local left<me<right on 2 would not see 6.",
      values: { node: 6, lo: 2, hi: 4, ok: false } },
    { note: "Inorder 1,2,3,4,5 is strictly increasing, the other validator.",
      best: [0, 1, 2, 3, 4],
      values: { node: "inorder", lo: "prev", hi: "\u2014", ok: true } },
  ],
  merTitle: "A valid BST",
  mermaid: `graph TD
  t4["4"] --> t2["2"]
  t4 --> t5["5"]
  t2 --> t1["1"]
  t2 --> t3["3"]`,
  steps: [
    "<strong>Validate:</strong> dfs(n, lo, hi), fail unless lo &lt; n.val &lt; hi; rec left (lo,val), right (val,hi).",
    "<strong>Or inorder:</strong> prev, fail if n.val &le; prev.",
    "<strong>Search / insert:</strong> compare and step, like binary search.",
    "<strong>Delete two-children:</strong> successor = min of right; copy; delete successor.",
    "<strong>k-th:</strong> inorder until count==k, or sizes on nodes for O(h).",
    "<strong>LCA:</strong> from root, step until p and q are on different sides (or one equals the node).",
  ],
  code: [
    { tab: "Brute", file: "BstLocalCheck.java",
      code: `public class BstLocalCheck {
    static class Node {
        int val; Node left, right;
        Node(int v) { val = v; }
    }
    static boolean local(Node n) {
        if (n == null) return true;
        if (n.left != null && n.left.val >= n.val) return false;
        if (n.right != null && n.right.val <= n.val) return false;
        return local(n.left) && local(n.right);
    }
    public static void main(String[] args) {
        Node r = new Node(4);
        r.left = new Node(2); r.right = new Node(5);
        r.left.left = new Node(1); r.left.right = new Node(6);
        System.out.println(local(r));
    }
    // Input : invalid BST (6 in left of 4) that local-check misses
    // Output: true
}` },
    { tab: "Optimal", file: "ValidateBst.java",
      code: `public class ValidateBst {
    static class Node {
        int val; Node left, right;
        Node(int v) { val = v; }
    }
    static boolean ok(Node n, long lo, long hi) {
        if (n == null) return true;
        if (n.val <= lo || n.val >= hi) return false;
        return ok(n.left, lo, n.val) && ok(n.right, n.val, hi);
    }
    static int kth(Node n, int[] k) {
        if (n == null) return -1;
        int L = kth(n.left, k);
        if (k[0] == 0) return L;
        if (--k[0] == 0) return n.val;
        return kth(n.right, k);
    }
    public static void main(String[] args) {
        Node r = new Node(4);
        r.left = new Node(2); r.right = new Node(5);
        r.left.left = new Node(1); r.left.right = new Node(3);
        System.out.println(ok(r, Long.MIN_VALUE, Long.MAX_VALUE));
        System.out.println(kth(r, new int[]{3}));
    }
    // Input : BST 4 / 2 5 / 1 3 , k=3
    // Output: true
    //         3
}` },
    { tab: "Template", file: "LcaBst.java",
      code: `public class LcaBst {
    static class Node {
        int val; Node left, right;
        Node(int v) { val = v; }
    }
    static Node lca(Node n, int p, int q) {
        while (n != null) {
            if (p < n.val && q < n.val) n = n.left;
            else if (p > n.val && q > n.val) n = n.right;
            else return n;
        }
        return null;
    }
    public static void main(String[] args) {
        Node r = new Node(6);
        r.left = new Node(2); r.right = new Node(8);
        r.left.left = new Node(0); r.left.right = new Node(4);
        System.out.println(lca(r, 2, 8).val);
        System.out.println(lca(r, 2, 4).val);
    }
    // Input : LC 235 sample
    // Output: 6
    //         2
}` },
  ],
  complexity: {
    time: "O(h) search/insert/delete/LCA; O(n) validate / k-th naive",
    space: "O(h)",
    derivation: [
      "h is log n on a balanced tree and n on a skew tree. Validate must see every node, O(n).",
      "<span class=\"eq\">T_search = O(h), T_validate = &Theta;(n)</span>",
      "Order-statistic trees store sz[] so k-th is O(h) after each insert.",
    ],
    compare: [
      ["Range DFS validate", "O(n)", "O(h)", "Correct invariant"],
      ["Local child compare", "O(n) but wrong", "O(h)", "Never"],
      ["Inorder + prev", "O(n)", "O(h)", "Also correct"],
      ["TreeMap", "O(log n) guaranteed", "O(n)", "Java library balanced BST"],
    ],
  },
  pitfalls: [
    { title: "Local left < me < right only",
      bug: "A 6 sitting in the left subtree of 4 passes the local check at 2.",
      fix: "Pass (lo, hi). Use long so Integer.MIN_VALUE is a legal node value." },
    { title: "int overflow sentinels",
      bug: "lo = Integer.MIN_VALUE, node.val is also MIN_VALUE, lo < val fails or you use <= wrong.",
      fix: "long lo, hi with Long.MIN/MAX, or Integer bounds as objects." },
    { title: "Delete successor incorrectly",
      bug: "You delete the successor's value from the wrong parent, or forget it has no left child only.",
      fix: "successor = min(right); node.val = s.val; node.right = delete(node.right, s.val)." },
    { title: "Duplicates",
      bug: "<= on both sides, or a validate that uses < both ways, rejects a legal duplicate policy.",
      fix: "Pick a side for equals (usually right) and match validate to it." },
    { title: "k-th by converting to an array always",
      bug: "Fine for one query; wasteful if the follow-up is many k-th with inserts.",
      fix: "Subtree sizes, or a persistent inorder iterator." },
  ],
  variants: [
    ["Recover BST", "Two nodes swapped; inorder finds two inversions, swap values.",
      "first.val <-> second.val", "LC 99"],
    ["Iterator two-sum", "Inorder stack + reverse-inorder stack as two pointers.",
      "left++ / right-- on two iterators", "LC 653"],
    ["Size-augmented", "sz[u]=1+sz[L]+sz[R]; k-th compares k to sz[L]+1.",
      "if (k == szL+1) return u;", "Order-statistic tree"],
  ],
  followups: [
    ["Why long bounds?",
      "<p>The node type is int, so MIN_VALUE and MAX_VALUE are legal keys. If you pass those as the initial lo/hi with int, a root equal to MIN_VALUE is rejected. long sentinels sit strictly outside.</p>"],
    ["Is every inorder-sorted tree a BST?",
      "<p>Yes for unique keys: the BST invariant is equivalent to inorder being strictly increasing. Building a tree from an increasing inorder still needs a structure (balanced mid split) if you also want height log n.</p>"],
    ["Delete complexity?",
      "<p>O(h) to find, O(h) to find the successor, O(h) to splice. Still O(h). Hibbard deletion unbalances over time; interviews ignore that.</p>"],
    ["LCA in BST vs general tree?",
      "<p>BST: walk from the root using values, no extra memory. General: postorder both-sides (previous page) or binary lifting (later).</p>"],
  ],
  problems: [
    lc(98, "validate-binary-search-tree", "Medium", "Range DFS"),
    lc(230, "kth-smallest-element-in-a-bst", "Medium", "Inorder stop at k"),
    lc(701, "insert-into-a-binary-search-tree", "Medium", "Walk to a null"),
    lc(450, "delete-node-in-a-bst", "Medium", "Successor splice"),
    lc(235, "lowest-common-ancestor-of-a-binary-search-tree", "Medium", "Split walk"),
    lc(108, "convert-sorted-array-to-binary-search-tree", "Easy", "Mid as root"),
    lc(99, "recover-binary-search-tree", "Medium", "Two inorder inversions"),
    lc(653, "two-sum-iv-input-is-a-bst", "Easy", "Hash or two iterators"),
  ],
  recap: [
    "<strong>Invariant is a range</strong>, not a local child compare.",
    "<strong>Inorder is sorted</strong> (unique keys).",
    "<strong>k-th = inorder that stops</strong>, or sz[] for O(h).",
    "<strong>Delete two children via successor.</strong>",
    "<strong>long sentinels</strong> for validate.",
  ],
  oneliner: "ok(n,lo,hi): lo<n.val<hi then ok(L,lo,val) && ok(R,val,hi)",
}),

/* ====================================== 4. tree-dp-and-rerooting ====== */
pack({
  id: "tree-dp-and-rerooting",
  difficulty: "Hard",
  readTime: "26 min",
  tagline: "One DFS computes every subtree answer; a second DFS reroots, combining \"down\" " +
    "with \"the rest of the tree\" so every vertex can be treated as the root in O(n).",
  tags: ["tree DP", "rerooting", "P1"],
  prereqs: [
    ["Binary Tree Problem Patterns", "binary-tree-problem-patterns.html"],
    ["DFS & Components", "../07-graphs-core/dfs-and-components.html"],
  ],
  why: [
    "Interview diameter is one global. CP asks \"for every vertex, the longest path starting " +
      "there\", or \"sum of distances to all others\", or \"whether the tree stays balanced if " +
      "we root here\". Computing n independent DFSes is O(n^2). Tree DP is one down-DFS of " +
      "subtree summaries, then optionally a reroot-DFS that pushes the parent's \"outside\" " +
      "answer into each child in O(1) or O(deg) extra.",
    "The algebraic requirement is that you can merge a child's contribution and an \"outside\" " +
      "contribution. Sum of distances: down[u] = sum (down[v]+sz[v]), then reroot " +
      "ans[v] = ans[u] + n - 2*sz[v]. Longest-out-path needs the top-two child depths because " +
      "the excluded child might have been the best.",
    "CF 219D choosing capital, CF 161D distance in tree, and \"sum of distances\" (LC 834) " +
      "are the cluster. If the merge is not invertible, rerooting needs the top-two trick or " +
      "a second pass that recomputes from siblings.",
  ],
  insight: "Subtree DP answers questions about the rooted tree. Rerooting reuses those " +
    "summaries so every vertex's \"if I were root\" answer is O(1) extra after O(n) preprocess.",
  yes: [
    "For every vertex, some aggregate of the tree rooted there",
    "Sum of distances to all nodes (LC 834)",
    "Longest path starting at each vertex / height of every rerooting",
    "Count of good / black-white / capital-moving reroots (CF 219D)",
    "n=1e5 so n independent DFSes are impossible",
  ],
  no: [
    "One global diameter / one root fixed by the statement &rarr; one DFS is enough",
    "The graph is not a tree (cycles) &rarr; different DP",
    "Queries on paths between arbitrary pairs &rarr; LCA / HLD / Euler+segtree",
    "Offline point updates of values with subtree queries &rarr; Euler tour + Fenwick",
  ],
  table: [
    ["Sum of distances from every node", "down sz + reroot n-2sz", "LC 834"],
    ["Height if rooted at each v", "top-two child depths, reroot", "CF / interview follow-up"],
    ["Change capital, count reachable with reverse edges", "down + up DP", "CF 219D"],
    ["Number of pairs at distance k", "tree DP of depth histograms, or centroid", "CF 161D"],
    ["One diameter", "two BFS or one DP of heights", "Previous page"],
    ["<strong>Confused with:</strong> rerooting as n DFS",
      "That is O(n^2); the second DFS is O(n)",
      "Merge outside with child in O(1) or O(deg)"],
  ],
  constraint: "n &le; 2e5. Recursion may overflow; iterative DFS or -Xss. Answers are long " +
    "(n * n * value). Tree is undirected n-1 edges; root at 0 arbitrarily for the down pass.",
  core: [
    "Down: dfs(u, p) computes sz[u], down[u] from children only. Example sum of distances: " +
      "sz[u]=1+sum sz[v], down[u]=sum (down[v]+sz[v]). Then ans[0]=down[0].",
    "Reroot: dfs2(u, p). For each child v, ans[v] = ans[u] - sz[v] + (n - sz[v]) = ans[u] + n " +
      "- 2*sz[v] for sum-of-distances. Recurse. For max-height, pass the best outside depth, " +
      "using the top two child depths so the excluded child's outside is the second-best.",
  ],
  invariant: "<p>After the down pass, down[u] is the answer on the subtree of u. After reroot, " +
    "ans[u] is the answer on the whole tree as if rooted at u.</p>" +
    "<span class=\"eq\">ans[v] = combine(ans[u] without v's subtree, down[v])</span>",
  arrayLabel: "sz[u] after down-DFS on a 5-node tree rooted at 0",
  array: [5, 3, 1, 1, 1],
  indexLabels: ["0", "1", "2", "3", "4"],
  vars: ["u", "sz", "down", "ans"],
  vizTitle: "Sum of distances: down then reroot",
  frames: [
    { note: "Tree: 0-1, 1-2, 1-3, 0-4. Root 0. Leaves sz=1, down=0.",
      active: [2, 3, 4],
      values: { u: "leaves", sz: 1, down: 0, ans: "\u2014" } },
    { note: "Node 1: children 2,3. sz=3, down=(0+1)+(0+1)=2.",
      active: [1],
      values: { u: 1, sz: 3, down: 2, ans: "\u2014" } },
    { note: "Node 0: children 1,4. sz=5, down=(2+3)+(0+1)=6. ans[0]=6.",
      active: [0],
      values: { u: 0, sz: 5, down: 6, ans: 6 } },
    { note: "Reroot to 1: ans[1]=6 + 5 - 2*3 = 5. Intuition: 3 nodes got 1 closer, 2 nodes (0 and 4) got 1 farther.",
      active: [1],
      values: { u: 1, sz: 3, down: 2, ans: 5 } },
    { note: "Reroot to 4: ans[4]=6+5-2*1=9.",
      active: [4],
      values: { u: 4, sz: 1, down: 0, ans: 9 } },
    { note: "All five answers from two DFS passes, not five.",
      best: [0, 1, 2, 3, 4],
      values: { u: "all", sz: "\u2014", down: "\u2014", ans: "done" } },
  ],
  merTitle: "The 5-node tree",
  mermaid: `graph TD
  t0["0"] --> t1["1"]
  t0 --> t4["4"]
  t1 --> t2["2"]
  t1 --> t3["3"]`,
  steps: [
    "<strong>Build undirected lists</strong>, n-1 edges, root at 0.",
    "<strong>Down DFS:</strong> skip parent; compute sz and down from children.",
    "<strong>ans[root] = down[root]</strong> (or a custom combine).",
    "<strong>Reroot DFS:</strong> for each child, write ans[child] from ans[u] and sz[child] (or top-two).",
    "<strong>Top-two</strong> when the merge is max, not a group with inverse.",
    "<strong>long</strong> for sums; iterative stack if n=2e5.",
  ],
  code: [
    { tab: "Brute", file: "NDfs.java",
      code: `import java.util.*;
public class NDfs {
    static List<List<Integer>> g;
    static int dfs(int u, int p) {
        int s = 0;
        for (int v : g.get(u)) if (v != p) s += dfs(v, u) + size(v, u);
        return s;
    }
    static int size(int u, int p) {
        int s = 1;
        for (int v : g.get(u)) if (v != p) s += size(v, u);
        return s;
    }
    public static void main(String[] args) {
        g = new ArrayList<>();
        for (int i = 0; i < 5; i++) g.add(new ArrayList<>());
        int[][] e = {{0,1},{1,2},{1,3},{0,4}};
        for (int[] x : e) { g.get(x[0]).add(x[1]); g.get(x[1]).add(x[0]); }
        System.out.println(dfs(0, -1));
    }
    // Input : 5-node sample, sum of distances from 0
    // Output: 6
}` },
    { tab: "Optimal", file: "RerootSum.java",
      code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class RerootSum {
    static List<List<Integer>> g;
    static int n;
    static int[] sz;
    static long[] down, ans;

    static void dfs1(int u, int p) {
        sz[u] = 1;
        for (int v : g.get(u)) if (v != p) {
            dfs1(v, u);
            sz[u] += sz[v];
            down[u] += down[v] + sz[v];
        }
    }
    static void dfs2(int u, int p) {
        for (int v : g.get(u)) if (v != p) {
            ans[v] = ans[u] + n - 2L * sz[v];
            dfs2(v, u);
        }
    }
    public static void main(String[] args) {
        n = 5;
        g = new ArrayList<>();
        for (int i = 0; i < n; i++) g.add(new ArrayList<>());
        int[][] e = {{0,1},{1,2},{1,3},{0,4}};
        for (int[] x : e) { g.get(x[0]).add(x[1]); g.get(x[1]).add(x[0]); }
        sz = new int[n]; down = new long[n]; ans = new long[n];
        dfs1(0, -1);
        ans[0] = down[0];
        dfs2(0, -1);
        System.out.println(Arrays.toString(ans));
    }
    // Input : tree 0-1-2, 1-3, 0-4
    // Output: [6, 5, 8, 8, 9]
}` },
    { tab: "Template", file: "TopTwoHeight.java",
      code: `import java.util.*;
public class TopTwoHeight {
    static List<List<Integer>> g;
    static int[] down;
    static void dfs(int u, int p) {
        down[u] = 0;
        for (int v : g.get(u)) if (v != p) {
            dfs(v, u);
            down[u] = Math.max(down[u], down[v] + 1);
        }
    }
    public static void main(String[] args) {
        g = new ArrayList<>();
        for (int i = 0; i < 5; i++) g.add(new ArrayList<>());
        int[][] e = {{0,1},{1,2},{1,3},{0,4}};
        for (int[] x : e) { g.get(x[0]).add(x[1]); g.get(x[1]).add(x[0]); }
        down = new int[5];
        dfs(0, -1);
        System.out.println(Arrays.toString(down));
    }
    // Input : same tree, down-height from 0
    // Output: [2, 1, 0, 0, 0]
}` },
  ],
  complexity: {
    time: "O(n)",
    space: "O(n)",
    derivation: [
      "Each edge is traversed a constant number of times across two DFS passes. Combining a child is O(1) for sums, O(deg) total per node for top-two (still O(n) because sum of deg = 2n-2).",
      "<span class=\"eq\">T = &Theta;(n)</span> versus naive &Theta;(n^2)",
      "If the merge needs a full multiset of child answers, you pay extra (small-to-large, or a heap).",
    ],
    compare: [
      ["n DFS from each root", "O(n^2)", "O(n)", "n<=3000 maybe"],
      ["Down DP only", "O(n)", "O(n)", "One fixed root"],
      ["Down + reroot", "O(n)", "O(n)", "Answer at every root"],
      ["Centroid / HLD", "O(n log n)", "O(n)", "Path queries, not reroot-all"],
    ],
  },
  pitfalls: [
    { title: "Forgetting to skip the parent",
      bug: "Infinite recursion on an undirected edge stored both ways.",
      fix: "if (v == p) continue; every loop." },
    { title: "int overflow of n*dist",
      bug: "ans[u] up to n*(n-1) / something times values. int wraps.",
      fix: "long[] ans, down." },
    { title: "Reroot max without top-two",
      bug: "You subtract the child's depth from a max that was that child; outside becomes 0 wrongly.",
      fix: "Store best and second-best child depths at u." },
    { title: "sz[v] after rerooting used as if still rooted at 0",
      bug: "The formula ans[u]+n-2*sz[v] needs sz[v] = size of v's down-subtree in the first rooting, which stays valid for the child v of u on the down tree.",
      fix: "Do not recompute sz during dfs2 unless you know why." },
    { title: "Stack overflow",
      bug: "A path of 2e5. JVM dies.",
      fix: "Iterative DFS or increase stack; contests often have a chain anti-rec test." },
  ],
  variants: [
    ["Top-two for max", "At u keep the two largest child down-values; child's outside = 1+max(up[u], otherChild).",
      "best1, best2 per node", "Height of every rerooting"],
    ["CF 219D", "down = reverse edges in subtree; up = rest. Capital is a reroot min.",
      "ans[v]=ans[u]+(edge uv flipped?)", "Change the root, count edges to reverse"],
    ["Knapsack on a tree", "dp[u][k] merge children with backpack; not reroot, still tree DP.",
      "for (int j=sz;j>=0;j--) for child items", "Size-limited subtree packs"],
  ],
  followups: [
    ["Why n - 2*sz[v]?",
      "<p>Moving the root from u to child v: every node in v's subtree is 1 closer, everyone else is 1 farther. Closer count = sz[v], farther = n-sz[v], delta = (n-sz[v]) - sz[v].</p>"],
    ["When is rerooting impossible in O(n)?",
      "<p>When you cannot compute \"parent's answer without this child\" in O(1) or O(deg). Then small-to-large, or accept O(n log n) / O(n^2).</p>"],
    ["Diameter via rerooting?",
      "<p>Height of a rerooting is the eccentricity of that vertex. Diameter = max eccentricity, also = max over v of down[v]+up[v]. Two BFS is shorter if you only need the diameter value.</p>"],
    ["Weighted edges?",
      "<p>Same formulas with +w(u,v) instead of +1, and \"n-2sz\" becomes a weighted analogue: minus 2*sum of subtree weights plus total. Track subtree weight sum.</p>"],
  ],
  problems: [
    lc(834, "sum-of-distances-in-tree", "Hard", "Classic reroot"),
    lc(337, "house-robber-iii", "Medium", "Tree DP, not reroot"),
    lc(968, "binary-tree-cameras", "Hard", "3-state tree DP"),
    lc(1245, "tree-diameter", "Medium", "Two BFS or tree DP"),
    cf("219D", "Choosing Capital for Treeland", "Medium", "Reroot reverse-edge counts"),
    cf("161D", "Distance in Tree", "Medium", "Tree DP pairs at distance k"),
    cf("337D", "Book of Evil", "Medium", "Reroot / two-direction max"),
    cf("580C", "Kefa and Park", "Easy", "Down DFS with a constraint"),
  ],
  recap: [
    "<strong>Down DFS</strong> = subtree summaries.",
    "<strong>Reroot DFS</strong> = push the outside answer to each child.",
    "<strong>Sum of distances:</strong> ans[v]=ans[u]+n-2*sz[v].",
    "<strong>Max needs top-two</strong> child contributions.",
    "<strong>O(n)</strong>, not O(n^2). long, skip parent.",
  ],
  oneliner: "dfs1 sz/down; ans[0]=down[0]; dfs2 ans[v]=combine(ans[u], sz[v])",
}),

/* ====================================== 5. lca-binary-lifting ========= */
pack({
  id: "lca-binary-lifting",
  difficulty: "Hard",
  readTime: "24 min",
  tagline: "Precompute the 2^k-th ancestor of every node in <code>O(n log n)</code>, then " +
    "LCA and k-th ancestor queries become <code>O(log n)</code> jumps.",
  tags: ["LCA", "binary lifting", "P1"],
  prereqs: [
    ["Tree DP & Rerooting", "tree-dp-and-rerooting.html"],
    ["Bit Manipulation", "../02-sorting-hashing-bits/bit-manipulation.html"],
  ],
  why: [
    "The interview LCA on a binary tree is one DFS. The contest LCA is n,q = 1e5 queries on " +
      "a static tree: distance(u,v), k-th node on a path, max edge on a path. Binary lifting " +
      "stores up[k][v] = the 2^k-th parent of v, built from up[k][v]=up[k-1][up[k-1][v]]. " +
      "Lift the deeper node to the same depth, then lift both until their parents match.",
    "The same table answers \"k-th ancestor\" by jumping bits of k, and with extra payload " +
      "on edges (max, gcd, sum) you merge along the jumps. Euler-tour RMQ is the other LCA; " +
      "lifting is easier to extend with path aggregates.",
    "depth[] from a DFS, parent[0][v] from the same DFS, then the doubling loop. Queries are " +
      "then a short bit loop. Off-by-one on \"lift to depth of LCA+1\" is the classic bug.",
  ],
  insight: "Any ancestor distance d is a sum of distinct powers of two. Jump those bits. LCA " +
    "is: equalise depth, then jump both while the 2^k parents still differ, then take the parent.",
  yes: [
    "Many LCA queries on a static tree",
    "Distance = depth[u]+depth[v]-2*depth[lca]",
    "k-th ancestor, or k-th node on the path u-v",
    "Path min/max/gcd by storing a payload next to up[k][v]",
    "n,q = 1e5, so O(log n) per query after O(n log n) prep",
  ],
  no: [
    "One or two LCA queries on a binary tree in an interview &rarr; the postorder trick",
    "The tree changes (link/cut) &rarr; LCT, not lifting",
    "Subtree queries, not path-to-root &rarr; Euler tour + Fenwick",
    "n=1e9 implicit &rarr; different",
  ],
  table: [
    ["LCA(u,v) many times", "Binary lifting or Euler+RMQ", "up[k][v] table"],
    ["dist(u,v)", "depth[u]+depth[v]-2 depth[lca]", "Same table"],
    ["k-th ancestor of v", "Jump bits of k on up[][]", "O(log n)"],
    ["Max edge on path", "Also lift a max[][] payload", "Merge on jumps"],
    ["Interview binary tree, 1 query", "Postorder both-sides", "Previous patterns page"],
    ["<strong>Confused with:</strong> sparse table on the array",
      "Lifting is a sparse table of ancestors, not of a linear array",
      "Same doubling idea, different domain"],
  ],
  constraint: "n,q &le; 2e5, LOG=18 or 20. up is int[LOG][n] (or [n][LOG]). Root's parent is " +
    "the root or -1; jumping past the root must be defined (stay at root, or -1).",
  core: [
    "DFS from the root: depth[v], up[0][v]=parent. Then for k=1..LOG-1, for all v, " +
      "up[k][v]=up[k-1][up[k-1][v]] (if parent is -1, keep -1).",
    "LCA: if depth[u]&lt;depth[v] swap. Lift u by depth[u]-depth[v] using bits. If u==v return u. " +
      "Then for k=LOG-1..0, if up[k][u]!=up[k][v] jump both. Return up[0][u].",
  ],
  invariant: "<p>up[k][v] is the ancestor of v exactly 2^k steps toward the root (or the root / " +
    "-1 if you run out).</p>" +
    "<span class=\"eq\">lca(u,v) = first common ancestor; dist = d[u]+d[v]-2 d[lca]</span>",
  arrayLabel: "depth[v] on the sample tree rooted at 0",
  array: [0, 1, 2, 2, 1],
  indexLabels: ["0", "1", "2", "3", "4"],
  vars: ["u-v", "depthGap", "jump", "lca"],
  vizTitle: "LCA(2,3): both depth 2, parent 1 is the LCA",
  frames: [
    { note: "Tree 0-1-2, 1-3, 0-4. depth [0,1,2,2,1]. up[0] = parent [-1,0,1,1,0].",
      values: { "u-v": "prep", depthGap: "\u2014", jump: "up[0]", lca: "\u2014" } },
    { note: "up[1][v] = grandparent: [-, -, 0, 0, -].",
      values: { "u-v": "doubling", depthGap: "\u2014", jump: "up[1]", lca: "\u2014" } },
    { note: "LCA(2,3): depths equal. up[1][2]=0 and up[1][3]=0 same, so do not jump 2. up[0][2]=1 != up[0][3]=1? They are equal 1. Then return parent of 2, which is 1. Wait: if up[0] already equal, we still return up[0][u] after the loop... Standard: if after equalising u==v return u. Here 2!=3. Loop k: if parents differ, jump. up[0][2]==up[0][3]==1, so we do not jump, then return up[0][2]=1.",
      active: [2, 3],
      values: { "u-v": "2,3", depthGap: 0, jump: "none", lca: 1 } },
    { note: "LCA(2,4): lift 2 by 1 to 1. 1!=4. up[0][1]=0, up[0][4]=0 equal, return 0.",
      active: [2, 4],
      values: { "u-v": "2,4", depthGap: 1, jump: "2->1", lca: 0 } },
    { note: "dist(2,4)=2+1-0=3. Path 2-1-0-4.",
      best: [0, 1, 2, 4],
      values: { "u-v": "dist", depthGap: "\u2014", jump: "\u2014", lca: "3 hops" } },
    { note: "k-th ancestor of 2, k=2: jump bit 1 (value 2) -> 0.",
      active: [2, 0],
      values: { "u-v": "anc 2 k=2", depthGap: 2, jump: "bit1", lca: 0 } },
  ],
  merTitle: "Sample tree with depths",
  mermaid: `graph TD
  t0["0 d=0"] --> t1["1 d=1"]
  t0 --> t4["4 d=1"]
  t1 --> t2["2 d=2"]
  t1 --> t3["3 d=2"]`,
  steps: [
    "<strong>DFS</strong> from root: depth[], up[0][v]=parent (root parent = -1 or itself).",
    "<strong>Double:</strong> for k=1..LOG-1, up[k][v] = up[k-1][up[k-1][v]] (guard -1).",
    "<strong>Equalise depth</strong> by lifting the deeper node.",
    "<strong>If equal, that is the LCA.</strong>",
    "<strong>From high bit to 0:</strong> if up[k][u]!=up[k][v] jump both.",
    "<strong>Return up[0][u]</strong> (the parent of the nodes just below the LCA).",
  ],
  code: [
    { tab: "Brute", file: "LcaWalk.java",
      code: `import java.util.*;
public class LcaWalk {
    static int[] p, d;
    static int lca(int u, int v) {
        while (d[u] > d[v]) u = p[u];
        while (d[v] > d[u]) v = p[v];
        while (u != v) { u = p[u]; v = p[v]; }
        return u;
    }
    public static void main(String[] args) {
        p = new int[]{-1, 0, 1, 1, 0};
        d = new int[]{0, 1, 2, 2, 1};
        System.out.println(lca(2, 3) + " " + lca(2, 4));
    }
    // Input : sample parents
    // Output: 1 0
}` },
    { tab: "Optimal", file: "BinaryLifting.java",
      code: `import java.util.ArrayList;
import java.util.List;

public class BinaryLifting {
    static final int LOG = 20;
    static int[][] up;
    static int[] depth;
    static List<List<Integer>> g;

    static void dfs(int u, int p) {
        up[0][u] = p;
        for (int k = 1; k < LOG; k++) {
            int mid = up[k - 1][u];
            up[k][u] = mid < 0 ? -1 : up[k - 1][mid];
        }
        for (int v : g.get(u)) if (v != p) {
            depth[v] = depth[u] + 1;
            dfs(v, u);
        }
    }
    static int lift(int u, int h) {
        for (int k = 0; k < LOG; k++) if (((h >> k) & 1) == 1) {
            u = up[k][u];
            if (u < 0) return u;
        }
        return u;
    }
    static int lca(int u, int v) {
        if (depth[u] < depth[v]) { int t = u; u = v; v = t; }
        u = lift(u, depth[u] - depth[v]);
        if (u == v) return u;
        for (int k = LOG - 1; k >= 0; k--)
            if (up[k][u] != up[k][v]) { u = up[k][u]; v = up[k][v]; }
        return up[0][u];
    }
    public static void main(String[] args) {
        int n = 5;
        g = new ArrayList<>();
        for (int i = 0; i < n; i++) g.add(new ArrayList<>());
        int[][] e = {{0,1},{1,2},{1,3},{0,4}};
        for (int[] x : e) { g.get(x[0]).add(x[1]); g.get(x[1]).add(x[0]); }
        up = new int[LOG][n];
        depth = new int[n];
        for (int[] row : up) java.util.Arrays.fill(row, -1);
        dfs(0, -1);
        System.out.println(lca(2, 3) + " " + lca(2, 4));
        System.out.println(depth[2] + depth[4] - 2 * depth[lca(2, 4)]);
    }
    // Input : sample tree, queries (2,3) (2,4)
    // Output: 1 0
    //         3
}` },
    { tab: "Template", file: "KthAncestor.java",
      code: `public class KthAncestor {
    static int[][] up;
    static int kth(int u, int k) {
        for (int i = 0; i < 20; i++) if (((k >> i) & 1) == 1) {
            u = up[i][u];
            if (u < 0) return -1;
        }
        return u;
    }
    public static void main(String[] args) {
        up = new int[20][5];
        for (int[] row : up) java.util.Arrays.fill(row, -1);
        up[0][1] = 0; up[0][2] = 1; up[0][3] = 1; up[0][4] = 0;
        for (int k = 1; k < 20; k++)
            for (int v = 0; v < 5; v++)
                if (up[k - 1][v] >= 0) up[k][v] = up[k - 1][up[k - 1][v]];
        System.out.println(kth(2, 2));
        System.out.println(kth(2, 3));
    }
    // Input : 2's 2nd ancestor and 3rd
    // Output: 0
    //         -1
}` },
  ],
  complexity: {
    time: "O(n log n) build, O(log n) per LCA / k-th ancestor",
    space: "O(n log n)",
    derivation: [
      "LOG = ceil(log2 n) ~ 18. Filling up[k][v] is n * LOG. A query equalises with at most LOG jumps then at most LOG more.",
      "<span class=\"eq\">T_build = O(n log n), T_q = O(log n)</span>",
      "Euler+RMQ is O(n log n) / O(1) with a sparse table, slightly heavier constants, worse at path payloads.",
    ],
    compare: [
      ["Walk parents", "O(n) / query", "O(n)", "q tiny"],
      ["Binary lifting", "O(log n) / query", "O(n log n)", "Default CP LCA"],
      ["Euler + sparse table", "O(1) / query", "O(n log n)", "Many LCA, no extra payload"],
      ["Interview postorder", "O(n) once", "O(h)", "One tree, few queries"],
    ],
  },
  pitfalls: [
    { title: "Lifting past the root without a guard",
      bug: "up[k][-1] or up[k][parent of root] indexes garbage.",
      fix: "Store -1, skip when mid&lt;0. Or parent[root]=root and jumps stay put." },
    { title: "Returning u after the loop instead of up[0][u]",
      bug: "You stopped at the children of the LCA, not the LCA.",
      fix: "After equalise, if u==v return u; else jump while parents differ; return parent." },
    { title: "Filling up[k] inside DFS before children set up[k-1]",
      bug: "up[k][v] depends only on v's ancestors, so filling at v during DFS is actually OK if you fill all k for v after up[0][v] is set, before children. Filling a global k-loop after the whole DFS is simpler.",
      fix: "Either fill all k for u at dfs entry, or a nested loop after DFS." },
    { title: "depth not set when lifting",
      bug: "Forgot DFS, all depths 0, LCA is nonsense.",
      fix: "One DFS from the true root (problem's 1, or 0)." },
    { title: "1-based nodes, 0-based table",
      bug: "n=5 nodes 1..5, array of 5, index 5 dies.",
      fix: "n+1 arrays, ignore 0, or decrement labels." },
  ],
  variants: [
    ["Path max", "mx[k][v] = max(mx[k-1][v], mx[k-1][up[k-1][v]]) along the same jumps.",
      "ans = max(ans, mx[k][u]) when jumping u", "Max edge, min edge, gcd"],
    ["k-th on path u-v", "Let w=lca. If k is on u-w, lift u by k; else lift v by dist(u,v)-k.",
      "int du = depth[u]-depth[w];", "Path node queries"],
    ["Farach-Colton / RMQ LCA", "Euler tour of depth, sparse table of mins, O(1) query.",
      "st min of first[u]..first[v]", "When you only need LCA, not path payload"],
  ],
  followups: [
    ["Why jump from high bits down when equalising is low bits up?",
      "<p>Equalising a known height h uses the bits of h, any order. The LCA's \"while parents differ\" must go from high to low: a low-bit jump first could overshoot the LCA and land on different ancestors that later cannot resync.</p>"],
    ["Virtual trees?",
      "<p>Sort a subset of nodes by tin, LCA consecutive pairs, stack-build the compressed tree. Binary lifting (or RMQ) supplies those LCAs. Used in DP on a few important vertices.</p>"],
    ["Weighted distance?",
      "<p>Store distRoot[v] = distance to root during DFS. dist(u,v)=distRoot[u]+distRoot[v]-2*distRoot[lca]. No extra lifting payload needed for sums.</p>"],
    ["LOG = 20 vs 18?",
      "<p>2^18 = 262144. n=2e5 needs 18. 20 is a safe default. 31 is a waste of memory (n*31 ints).</p>"],
  ],
  problems: [
    lc(236, "lowest-common-ancestor-of-a-binary-tree", "Medium", "Interview DFS, not lifting"),
    lc(1483, "kth-ancestor-of-a-tree-node", "Hard", "Binary lifting table"),
    lc(2096, "step-by-step-directions-from-a-binary-tree-node-to-another", "Medium", "LCA + paths"),
    cf("832D", "Misha, Grisha and Underground", "Hard", "Three LCAs, longest shared tail"),
    cf("1304E", "1-Trees and Queries", "Medium", "dist via LCA, plus one extra edge"),
    cf("191C", "Fools and Roads", "Medium", "Diff on paths via LCA, then down"),
    cf("208E", "Blood Cousins", "Hard", "k-th ancestor + count at depth"),
    lc(1676, "lowest-common-ancestor-of-a-binary-tree-iv", "Medium", "Generalise both-sides"),
  ],
  recap: [
    "<strong>up[k][v] = 2^k-th parent</strong>, doubled from k-1.",
    "<strong>Equalise depth</strong>, then jump while parents differ, return parent.",
    "<strong>dist = d[u]+d[v]-2 d[lca]</strong>.",
    "<strong>k-th ancestor</strong> is jumping the bits of k.",
    "<strong>Path payload</strong> rides along the same jumps.",
  ],
  oneliner: "lift deeper to same depth; for k=LOG-1..0 if up[k][u]!=up[k][v] jump both; return parent",
}),

/* ====================================== 6. euler-tour-subtree-queries */
pack({
  id: "euler-tour-subtree-queries",
  difficulty: "Hard",
  readTime: "24 min",
  tagline: "tin[v]..tout[v] is a contiguous segment of a flattened DFS, so subtree sum / " +
    "add becomes a Fenwick range on that segment.",
  tags: ["Euler tour", "subtree", "tin tout", "P1"],
  prereqs: [
    ["LCA & Binary Lifting", "lca-binary-lifting.html"],
    ["Fenwick Tree", "../06-range-queries/fenwick-tree.html"],
  ],
  why: [
    "A subtree is not a contiguous slice of the parent-pointer array, so a Fenwick on vertex " +
      "ids is meaningless. An Euler tour (enter-time order) numbers vertices so that the " +
      "subtree of v is exactly the interval [tin[v], tout[v]]. Point add + subtree sum is then " +
      "a Fenwick on that interval; subtree add + point query is a range-add on the interval.",
    "The same timestamps give the ancestry test tin[u] &le; tin[v] &le; tout[u] and are the " +
      "substrate for HLD, virtual trees, and Mo on trees. CF 620E New Year Tree, 383C " +
      "Propagating tree, 877E Danil are the cluster.",
    "Tour variants: node-only (one tin per vertex), or enter-and-leave (the true Euler tour " +
      "used for RMQ-LCA). Subtree queries use the node-only flattening.",
  ],
  insight: "DFS enter times make every subtree a contiguous range. Put a Fenwick (or segtree) " +
    "on those times, not on vertex labels.",
  yes: [
    "Add on a subtree, query a point (or the reverse)",
    "Subtree sum / min / xor after point updates",
    "Ancestry tests, flattening for HLD first step",
    "n,q=1e5 static tree shape, values change",
    "Colour / bitset of a subtree (CF 620E) after mapping to [tin,tout]",
  ],
  no: [
    "Path queries u-v, not subtrees &rarr; lift a payload, or HLD",
    "The tree shape changes &rarr; LCT / Euler-tour-tree (different)",
    "One DFS aggregate without updates &rarr; plain tree DP",
    "Queries are LCAs only &rarr; binary lifting, no Fenwick needed",
  ],
  table: [
    ["Subtree sum, point add", "Fenwick at tin[v], query [tin,tout]", "Classic"],
    ["Subtree add, point query", "Range add on [tin,tout], point at tin", "Diff + Fenwick"],
    ["Is u ancestor of v?", "tin[u]<=tin[v]<=tout[u]", "Timestamps only"],
    ["Path u-v updates", "Not a single interval", "HLD or lift+diff at lca"],
    ["RMQ LCA", "True Euler tour of 2n-1 entries, ST on depth", "Other LCA method"],
    ["<strong>Confused with:</strong> Eulerian path in a graph",
      "That is an edge-using tour of a different meaning",
      "This page is DFS timestamps on a tree"],
  ],
  constraint: "n,q &le; 2e5. tin in 0..n-1 (or 1..n). Fenwick of size n+2. Recursion depth: " +
    "iterative DFS to assign tin if the tree is a chain.",
  core: [
    "timer=0. dfs(u,p): tin[u]=timer++. rec children. tout[u]=timer-1 (so [tin,tout] includes " +
      "u and descendants). If you prefer half-open, tout=timer after children and the subtree " +
      "is [tin, tout).",
    "Map vertex v to index tin[v] in a Fenwick. Point add at v: add(tin[v], x). Subtree sum: " +
      "range(tin[v], tout[v]). Subtree add: rangeAdd(tin, tout, x); point query at tin[v].",
  ],
  invariant: "<p>The subtree of v, in DFS enter order, occupies a contiguous index interval.</p>" +
    "<span class=\"eq\">subtree(v) = { u | tin[v] &le; tin[u] &le; tout[v] }</span>",
  arrayLabel: "tin[v] then the flattened order",
  array: [0, 1, 2, 3, 4],
  indexLabels: ["0", "1", "2", "3", "4"],
  vars: ["u", "tin", "tout", "flat"],
  vizTitle: "Euler numbering on 0-1-2, 1-3, 0-4",
  frames: [
    { note: "Enter 0, tin[0]=0. Recurse to 1.",
      active: [0],
      values: { u: 0, tin: 0, tout: "\u2014", flat: "[0]" } },
    { note: "Enter 1, tin[1]=1. Recurse to 2.",
      active: [1],
      values: { u: 1, tin: 1, tout: "\u2014", flat: "[0,1]" } },
    { note: "Enter 2, tin[2]=2, leaf, tout[2]=2. Then 3: tin=3, tout=3.",
      active: [2, 3],
      values: { u: 2, tin: 2, tout: 2, flat: "[0,1,2,3]" } },
    { note: "Leave 1, tout[1]=3. Subtree of 1 is indices 1..3 = {1,2,3}.",
      window: [1, 3],
      values: { u: 1, tin: 1, tout: 3, flat: "sub 1" } },
    { note: "Enter 4, tin[4]=4, tout=4. Leave 0, tout[0]=4. Whole tree [0,4].",
      active: [4],
      values: { u: 4, tin: 4, tout: 4, flat: "[0,1,2,3,4]" } },
    { note: "Fenwick range [1,3] is subtree of 1. Ancestry: 0 is ancestor of 3 because 0<=3<=4 (tins) and tout[0]>=tin[3].",
      best: [1, 2, 3],
      values: { u: "query", tin: 1, tout: 3, flat: "BIT range" } },
  ],
  merTitle: "DFS flatten order 0,1,2,3,4",
  mermaid: `graph TD
  t0["0 tin=0"] --> t1["1 tin=1"]
  t0 --> t4["4 tin=4"]
  t1 --> t2["2 tin=2"]
  t1 --> t3["3 tin=3"]`,
  steps: [
    "<strong>DFS:</strong> tin[u]=timer++ before children; tout[u]=timer-1 after.",
    "<strong>Fenwick of size n</strong> indexed by tin.",
    "<strong>Point add on vertex v:</strong> bit.add(tin[v], delta).",
    "<strong>Subtree sum:</strong> bit.range(tin[v], tout[v]).",
    "<strong>Subtree add, point query:</strong> rangeAdd on [tin,tout], query prefix(tin[v]).",
    "<strong>Ancestry:</strong> tin[u]&lt;=tin[v] &amp;&amp; tout[v]&lt;=tout[u].",
  ],
  code: [
    { tab: "Brute", file: "SubtreeScan.java",
      code: `import java.util.*;
public class SubtreeScan {
    static List<List<Integer>> g;
    static int[] val;
    static int sum(int u, int p) {
        int s = val[u];
        for (int v : g.get(u)) if (v != p) s += sum(v, u);
        return s;
    }
    public static void main(String[] args) {
        g = new ArrayList<>();
        for (int i = 0; i < 5; i++) g.add(new ArrayList<>());
        int[][] e = {{0,1},{1,2},{1,3},{0,4}};
        for (int[] x : e) { g.get(x[0]).add(x[1]); g.get(x[1]).add(x[0]); }
        val = new int[]{1, 1, 1, 1, 1};
        System.out.println(sum(1, 0));
    }
    // Input : all ones, subtree of 1
    // Output: 3
}` },
    { tab: "Optimal", file: "EulerFenwick.java",
      code: `import java.util.ArrayList;
import java.util.List;

public class EulerFenwick {
    static List<List<Integer>> g;
    static int[] tin, tout, timer = {0};
    static long[] bit;
    static int n;

    static void dfs(int u, int p) {
        tin[u] = timer[0]++;
        for (int v : g.get(u)) if (v != p) dfs(v, u);
        tout[u] = timer[0] - 1;
    }
    static void add(int i, long v) {
        for (i++; i <= n; i += i & -i) bit[i] += v;
    }
    static long sum(int i) {
        long s = 0;
        for (i++; i > 0; i -= i & -i) s += bit[i];
        return s;
    }
    static long range(int l, int r) { return sum(r) - (l == 0 ? 0 : sum(l - 1)); }

    public static void main(String[] args) {
        n = 5;
        g = new ArrayList<>();
        for (int i = 0; i < n; i++) g.add(new ArrayList<>());
        int[][] e = {{0,1},{1,2},{1,3},{0,4}};
        for (int[] x : e) { g.get(x[0]).add(x[1]); g.get(x[1]).add(x[0]); }
        tin = new int[n]; tout = new int[n];
        dfs(0, -1);
        bit = new long[n + 2];
        int[] val = {1, 1, 1, 1, 1};
        for (int v = 0; v < n; v++) add(tin[v], val[v]);
        System.out.println(range(tin[1], tout[1]));
        add(tin[2], 10);
        System.out.println(range(tin[1], tout[1]));
    }
    // Input : ones, subtree 1, then +10 at node 2
    // Output: 3
    //         13
}` },
    { tab: "Template", file: "SubtreeAdd.java",
      code: `public class SubtreeAdd {
    static int[] tin, tout;
    static long[] bit;
    static int n;
    static void rangeAdd(int l, int r, long v) {
        for (int i = l + 1; i <= n; i += i & -i) bit[i] += v;
        for (int i = r + 2; i <= n; i += i & -i) bit[i] -= v;
    }
    static long point(int i) {
        long s = 0;
        for (i++; i > 0; i -= i & -i) s += bit[i];
        return s;
    }
    public static void main(String[] args) {
        n = 5;
        tin = new int[]{0,1,2,3,4};
        tout = new int[]{4,3,2,3,4};
        bit = new long[n + 2];
        rangeAdd(tin[1], tout[1], 5);
        System.out.println(point(tin[2]) + " " + point(tin[4]));
    }
    // Input : +5 on subtree of 1 (indices 1..3)
    // Output: 5 0
}` },
  ],
  complexity: {
    time: "O(n) tour, O(log n) per update/query",
    space: "O(n)",
    derivation: [
      "DFS assigns each vertex one tin. Fenwick ops are O(log n). Naive subtree walk is O(subtree) per query and dies at q=1e5.",
      "<span class=\"eq\">T_prep = O(n), T_op = O(log n)</span>",
      "Path queries are not an interval in this flattening (unless you add HLD or lift diffs at the LCA).",
    ],
    compare: [
      ["Walk the subtree", "O(|sub|) / query", "O(n)", "q tiny"],
      ["Euler + Fenwick", "O(log n)", "O(n)", "Subtree point/range"],
      ["HLD", "O(log^2 n)", "O(n)", "Path queries"],
      ["Rerooting DP", "O(n)", "O(n)", "No updates, all roots"],
    ],
  },
  pitfalls: [
    { title: "tout exclusive vs inclusive mix-up",
      bug: "range(tin, tout) with tout=timer after children is exclusive on the right if you also stored tin as the start; off-by-one drops the last descendant or includes a sibling.",
      fix: "Pick one: tout=timer-1 inclusive, or half-open [tin,tout). Draw the sample." },
    { title: "Fenwick on vertex id instead of tin",
      bug: "Subtree {1,2,3} is not ids 1..3 after an arbitrary labelling.",
      fix: "Always index by tin[v]." },
    { title: "Updating val[v] without adding at tin[v]",
      bug: "You change an array the Fenwick never sees.",
      fix: "add(tin[v], newVal-oldVal) or set via two adds." },
    { title: "Root's parent edge in an undirected list causing a second DFS into the parent",
      bug: "tin assigned twice, timer explodes, or infinite rec.",
      fix: "skip parent, same as every tree DFS." },
    { title: "Using this flattening for path u-v",
      bug: "Path is two intervals to the LCA, not one. Queries give nonsense.",
      fix: "HLD, or difference array at u,v,+lca according to the op." },
  ],
  variants: [
    ["True Euler tour (2n-1)", "Push u on enter and after each child; RMQ of depth for LCA.",
      "tour.add(u) before and after", "O(1) LCA with sparse table"],
    ["Subtree add + subtree query", "Two Fenwicks or a lazy segtree on [tin,tout].",
      "lazy range on the tour array", "Heavier ops"],
    ["Mo on trees", "Queries on [tin,tout] for subtree; paths need extra in/out trick.",
      "Euler + Mo", "CF 375D"],
  ],
  followups: [
    ["Ancestry in O(1)?",
      "<p>Yes: tin[u] &le; tin[v] &le; tout[u]. That is why you should still store tout even if you only planned sums.</p>"],
    ["Path add, point query without HLD?",
      "<p>Add +x at v, add -x at parent[u] depending on the op; more carefully: difference on the root-path by adding at the node and subtracting at the LCA's parent. Then a subtree-sum (Euler+BIT) of the diffs reconstructs the point. Common CF trick.</p>"],
    ["tin unique?",
      "<p>Node-only flattening: each vertex once, tin in 0..n-1 permutation. True Euler tour: vertices repeat, length 2n-1, first[] stores the first index for RMQ-LCA.</p>"],
    ["HLD connection?",
      "<p>HLD chains are also intervals, but of a different numbering (heavy-path compressed). The first step of HLD still uses sz[] from a DFS; Euler is the lighter tool when the query is a whole subtree.</p>"],
  ],
  problems: [
    lc(938, "range-sum-of-bst", "Easy", "Not Euler; BST range. Contrast"),
    lc(834, "sum-of-distances-in-tree", "Hard", "Reroot, not Euler"),
    cf("620E", "New Year Tree", "Medium", "Euler + lazy bits of colours"),
    cf("383C", "Propagating tree", "Medium", "Euler + parity Fenwicks"),
    cf("877E", "Danil and a Part-time Job", "Medium", "Euler + lazy flip/sum"),
    cf("1076E", "Vasya and a Tree", "Medium", "Subtree add by depth, Euler/diff"),
    lc(332, "reconstruct-itinerary", "Hard", "Eulerian path, different Euler"),
    cf("375D", "Tree and Queries", "Hard", "Euler + Mo on subtrees"),
  ],
  recap: [
    "<strong>tin before children, tout after</strong> &mdash; subtree is [tin, tout].",
    "<strong>Fenwick indexes tin</strong>, not the vertex label.",
    "<strong>Point add + subtree sum</strong> (or range add + point query).",
    "<strong>Ancestry is an interval test.</strong>",
    "<strong>Paths are not intervals here</strong> &mdash; that is HLD / lifting.",
  ],
  oneliner: "tin[u]=timer++; rec; tout[u]=timer-1; BIT on tin for subtree ranges",
}),

/* ====================================== 7. trie ======================= */
pack({
  id: "trie",
  difficulty: "Medium",
  readTime: "22 min",
  tagline: "A tree of prefixes: each edge is a character, insert/search/startsWith are " +
    "<code>O(|s|)</code>, and the same walk powers word-search II and autocomplete.",
  tags: ["trie", "prefix tree", "P0"],
  prereqs: [["Binary Tree Basics & Traversals", "binary-tree-basics-and-traversals.html"]],
  why: [
    "HashSet.contains is O(|s|) expected for exact strings and cannot answer \"is there a " +
      "stored word that starts with this prefix\" without scanning everything. A trie shares " +
      "prefixes: n words of length L use O(total characters) nodes, and a prefix query walks " +
      "one path of length |prefix|.",
    "LC 208 is the API. Word Search II is \"DFS the board, walk the trie in lockstep, prune " +
      "when the node is null\". Autocomplete, replace-words, and longest-word-in-dictionary " +
      "are the same walk with a different payload on terminal nodes.",
    "The implementation choice is next[26] vs HashMap&lt;Character,Node&gt;. Interviews want " +
      "the array for lowercase English. Count how many words share a node if you must delete.",
  ],
  insight: "A trie node is the set of strings with a given prefix. Child c is that prefix " +
    "extended by c. Terminal flag (or count) marks a complete word.",
  yes: [
    "implement-trie: insert, search, startsWith",
    "Search a board for many words (Word Search II)",
    "Replace words with the shortest dictionary prefix / root",
    "Count words with a given prefix, autocomplete",
    "XOR of numbers &rarr; next page (binary trie), not this 26-way trie",
  ],
  no: [
    "Exact lookup of a few strings, no prefixes &rarr; HashSet",
    "Suffix queries / longest palindrome &rarr; suffix array, Manacher, not a prefix trie",
    "Maximum XOR pair &rarr; XOR trie",
    "n*L too big to store every node and you only need equality &rarr; hashing",
  ],
  table: [
    ["insert / search / startsWith", "Walk |s| edges, create on insert", "LC 208"],
    ["Many words in a grid", "Board DFS + trie pointer, prune dead nodes", "LC 212"],
    ["Shortest root that prefixes the word", "Walk until a terminal", "Replace Words"],
    ["Count prefix occurrences", "cnt on each node, ++ on insert", "freq[node]"],
    ["Max XOR / bit greedy", "Binary children 0/1", "XOR trie page"],
    ["<strong>Confused with:</strong> suffix tree",
      "Suffix tree is compressed suffixes, much heavier",
      "This page is a prefix tree of a dictionary"],
  ],
  constraint: "Total characters &le; 1e5 typical. Node arrays of size 26 are fine. Alphabet " +
    "size &sigma; multiplies memory; HashMap children for huge alphabets. Word Search II: " +
    "4^L board DFS pruned by the trie, L up to 10.",
  core: [
    "Node { Node[] next = new Node[26]; boolean term; int cnt; }. insert: cur = root, for ch " +
      "in s: i=ch-'a'; if next[i]==null next[i]=new Node(); cur=next[i]; cur.cnt++. Then " +
      "cur.term=true. search: walk, fail on null, then term. startsWith: walk, fail on null.",
    "Word Search II: build a trie of the word list. DFS the board; if next[cell]==null return; " +
      "if term, emit word and optionally unmark term (dedup). Restore the cell after DFS. " +
      "Delete dead leaves to prune (optional speed).",
  ],
  invariant: "<p>The path from the root to a node spells a prefix of at least one inserted " +
    "word. term (or cntEnd) is true iff that prefix is a complete word.</p>" +
    "<span class=\"eq\">search(s) = walk(s) lands on a node with term=true</span>",
  arrayLabel: "nodes visited inserting \"app\" then \"ape\" (letter indices)",
  array: ["", "a", "p", "p", "e"],
  vars: ["word", "ch", "node", "term"],
  vizTitle: "Insert app, ape; search ape; startsWith ap",
  frames: [
    { note: "Empty root. Insert app: create a, p, p. Mark term on last p.",
      active: [1, 2, 3],
      values: { word: "app", ch: "p", node: "app", term: true } },
    { note: "Insert ape: reuse a,p, create e, mark term. Shared prefix ap.",
      active: [1, 2, 4],
      values: { word: "ape", ch: "e", node: "ape", term: true } },
    { note: "search(\"ape\"): walk a-p-e, term true.",
      best: [4],
      values: { word: "ape", ch: "e", node: "ape", term: "found" } },
    { note: "search(\"ap\"): land on p, term false (unless you also inserted ap).",
      active: [2],
      values: { word: "ap", ch: "p", node: "ap", term: false } },
    { note: "startsWith(\"ap\"): same walk, no term needed. true.",
      active: [1, 2],
      values: { word: "ap", ch: "p", node: "ap", term: "prefix ok" } },
    { note: "search(\"apple\"): after app the next l is null. false.",
      dim: [4],
      values: { word: "apple", ch: "l", node: "null", term: false } },
  ],
  merTitle: "Trie of app and ape",
  mermaid: `graph TD
  root["root"] --> na["a"]
  na --> np["p"]
  np --> npp["p term app"]
  np --> ne["e term ape"]`,
  steps: [
    "<strong>Node:</strong> next[26], term, optional cnt.",
    "<strong>insert:</strong> create missing children, mark term at the end, bump cnt.",
    "<strong>search:</strong> walk, null &rarr; false, else return term.",
    "<strong>startsWith:</strong> walk, null &rarr; false, else true.",
    "<strong>Board search:</strong> DFS 4-way, trie pointer, emit on term, restore cell.",
    "<strong>Do not</strong> store the whole string on every node unless you need it for output.",
  ],
  code: [
    { tab: "Brute", file: "HashDict.java",
      code: `import java.util.HashSet;
public class HashDict {
    public static void main(String[] args) {
        HashSet<String> s = new HashSet<>();
        s.add("app"); s.add("ape");
        System.out.println(s.contains("ape"));
        boolean pref = false;
        for (String w : s) if (w.startsWith("ap")) pref = true;
        System.out.println(pref);
    }
    // Input : dict app, ape; query ape and prefix ap
    // Output: true
    //         true
}` },
    { tab: "Optimal", file: "Trie.java",
      code: `public class Trie {
    static class Node {
        Node[] next = new Node[26];
        boolean term;
    }
    final Node root = new Node();

    void insert(String w) {
        Node cur = root;
        for (int i = 0; i < w.length(); i++) {
            int c = w.charAt(i) - 'a';
            if (cur.next[c] == null) cur.next[c] = new Node();
            cur = cur.next[c];
        }
        cur.term = true;
    }
    boolean walk(String w, boolean needTerm) {
        Node cur = root;
        for (int i = 0; i < w.length(); i++) {
            int c = w.charAt(i) - 'a';
            if (cur.next[c] == null) return false;
            cur = cur.next[c];
        }
        return needTerm ? cur.term : true;
    }
    public static void main(String[] args) {
        Trie t = new Trie();
        t.insert("app");
        t.insert("ape");
        System.out.println(t.walk("ape", true));
        System.out.println(t.walk("ap", true) + " " + t.walk("ap", false));
    }
    // Input : insert app, ape; search ape, search ap, startsWith ap
    // Output: true
    //         false true
}` },
    { tab: "Template", file: "ReplaceWords.java",
      code: `public class ReplaceWords {
    static class Node {
        Node[] next = new Node[26];
        String word;
    }
    static String replace(String[] dict, String sentence) {
        Node root = new Node();
        for (String w : dict) {
            Node cur = root;
            for (int i = 0; i < w.length(); i++) {
                int c = w.charAt(i) - 'a';
                if (cur.next[c] == null) cur.next[c] = new Node();
                cur = cur.next[c];
            }
            cur.word = w;
        }
        StringBuilder sb = new StringBuilder();
        for (String tok : sentence.split(" ")) {
            Node cur = root;
            String use = tok;
            for (int i = 0; i < tok.length(); i++) {
                int c = tok.charAt(i) - 'a';
                if (cur.next[c] == null) break;
                cur = cur.next[c];
                if (cur.word != null) { use = cur.word; break; }
            }
            if (sb.length() > 0) sb.append(' ');
            sb.append(use);
        }
        return sb.toString();
    }
    public static void main(String[] args) {
        System.out.println(replace(new String[]{"cat", "bat", "rat"}, "the cattle was rattled by the battery"));
    }
    // Input : LC 648 sample
    // Output: the cat was rat by the bat
}` },
  ],
  complexity: {
    time: "O(L) per insert/search/startsWith",
    space: "O(total characters * &sigma;) worst, typically O(total chars)",
    derivation: [
      "Each character of each word creates at most one new node. Shared prefixes share nodes.",
      "<span class=\"eq\">T(insert) = O(|s|), S = O(&Sigma; |s_i|)</span>",
      "HashSet search is also O(|s|) but startsWith is O(n |s|) over the set. Trie makes prefix O(|s|).",
    ],
    compare: [
      ["HashSet of words", "O(L) exact", "O(total)", "No prefix API"],
      ["Trie 26-array", "O(L)", "O(total * 26) worst", "Default lowercase"],
      ["Trie HashMap children", "O(L) expected", "O(total)", "Large alphabet"],
      ["Aho-Corasick", "O(text + dict + matches)", "O(total)", "Many patterns in one text"],
    ],
  },
  pitfalls: [
    { title: "Forgetting term vs prefix",
      bug: "search(\"ap\") true after inserting apple. startsWith and search mixed up.",
      fix: "search requires term; startsWith does not." },
    { title: "Not creating nodes on insert",
      bug: "NPE on next[c].field, or silent drop of the suffix.",
      fix: "if (cur.next[c]==null) cur.next[c]=new Node();" },
    { title: "Word Search II without marking the cell",
      bug: "The same cell is reused in one word (loop).",
      fix: "board[r][c]='#'; rec; restore." },
    { title: "26 vs 'A'",
      bug: "Uppercase or extra characters, negative index.",
      fix: "Normalise, or a map. Guard c in 0..25." },
    { title: "Storing List&lt;String&gt; on every node",
      bug: "Memory explodes; copying lists is O(n) per insert.",
      fix: "term + reconstruct the word, or store one String at terminals only." },
  ],
  variants: [
    ["Count / delete", "cnt words passing through the node; delete decrements and drops cnt==0 children.",
      "cur.cnt++; if (--cur.cnt==0) parent.next[c]=null;", "Memory-conscious dict"],
    ["Word Search II prune", "After emitting, set term false; drop a node with no children.",
      "if (all next null) parent.next[c]=null;", "LC 212 TLE otherwise"],
    ["XOR / bits", "next[2], MSB first.",
      "See xor-trie", "Next page"],
  ],
  followups: [
    ["Why not a HashMap of all prefixes?",
      "<p>You can: insert every prefix of every word into a HashSet for startsWith, and a set of words for search. Memory is worse (every prefix stored as a String) and Word Search II still wants a walk that can prune. The trie is the compressed form of that map.</p>"],
    ["Aho-Corasick vs trie DFS on a text?",
      "<p>Aho adds failure links so you scan the text once for all patterns. If the \"text\" is a 2-D board with 4-way moves, board DFS + trie is the right shape (LC 212). If the text is a string, Aho is linear.</p>"],
    ["Autocomplete top-k?",
      "<p>At the prefix node, the subtree holds candidates. Precompute a small heap of best words at each node, or DFS the subtree (fine if small).</p>"],
    ["Unicode?",
      "<p>HashMap&lt;Character,Node&gt; or a UTF-8 byte trie (256). Do not allocate next[Character.MAX_VALUE].</p>"],
  ],
  problems: [
    lc(208, "implement-trie-prefix-tree", "Medium", "The API"),
    lc(211, "design-add-and-search-words-data-structure", "Medium", "Wildcard DFS"),
    lc(212, "word-search-ii", "Hard", "Board + trie"),
    lc(648, "replace-words", "Medium", "Shortest terminal prefix"),
    lc(677, "map-sum-pairs", "Medium", "cnt on nodes"),
    lc(720, "longest-word-in-dictionary", "Medium", "All prefixes present"),
    lc(1268, "search-suggestions-system", "Medium", "Prefix + first 3"),
    lc(421, "maximum-xor-of-two-numbers-in-an-array", "Medium", "XOR trie, next page"),
  ],
  recap: [
    "<strong>next[26] + term</strong> is the whole node.",
    "<strong>insert creates, search needs term, startsWith does not.</strong>",
    "<strong>Share prefixes</strong> &mdash; that is the memory win.",
    "<strong>Word Search II:</strong> board DFS locked to the trie pointer.",
    "<strong>XOR is a 2-child trie</strong> on the next page.",
  ],
  oneliner: "for ch in s: create next[ch-'a'] if missing; at end term=true",
}),

/* ====================================== 8. xor-trie =================== */
pack({
  id: "xor-trie",
  difficulty: "Hard",
  readTime: "24 min",
  tagline: "A 2-child trie on bits, MSB first: to maximise XOR, greedily take the opposite " +
    "bit whenever that child exists.",
  tags: ["XOR trie", "binary trie", "P1"],
  prereqs: [
    ["Trie", "trie.html"],
    ["Bit Manipulation", "../02-sorting-hashing-bits/bit-manipulation.html"],
  ],
  why: [
    "Maximum XOR of two numbers in an array is not a sort+two-pointer problem in the usual " +
      "way: XOR does not respect order. The greedy that works is bitwise, from bit 31 down: " +
      "given a prefix of x, you want the other number to have the opposite bit. A binary trie " +
      "of the inserted numbers tells you in O(1) whether that opposite child exists.",
    "The same structure answers max XOR with a query value, max XOR of a subarray (insert " +
      "prefix XORs), and CF 706D Vasiliy's Multiset (insert/delete + max XOR with x). It is " +
      "the bit analogue of a BST on the numeric order of the 32-bit strings.",
    "Insert is 32 steps of creating next[bit]. Query is 32 steps of preferring opposite. " +
      "Counts on nodes support delete. Off-by-one on signed ints: treat bits as unsigned " +
      "with &gt;&gt;&gt; or a mask, or work in 30 bits if values are 1e9.",
  ],
  insight: "XOR is maximised by making each bit 1 from the MSB down, independently of lower " +
    "bits in the greedy sense: at bit k, if the opposite child exists, take it. The trie is " +
    "the existence oracle for those children.",
  yes: [
    "Maximum XOR of two numbers in an array (LC 421)",
    "Max XOR of a subarray (prefix XOR + query)",
    "Insert / delete / max XOR with x (CF 706D)",
    "Two numbers from two arrays maximising XOR",
    "Bitwise greedy that needs \"does a number with this prefix exist?\"",
  ],
  no: [
    "Maximum sum / min difference &rarr; sort, not XOR trie",
    "26-letter prefixes &rarr; ordinary trie",
    "n=20, brute 2^n is enough",
    "You need the k-th XOR, not the max &rarr; extra counts on nodes, still this trie",
  ],
  table: [
    ["Max a[i] XOR a[j]", "Insert all, query each (or insert as you go)", "LC 421"],
    ["Max XOR subarray", "Prefix XOR, query trie of previous prefixes", "Same as max pair on prefixes"],
    ["Online insert/delete + max XOR x", "cnt on nodes", "CF 706D"],
    ["Max XOR with a value in [L,R]", "Counts + walk with range constraints, or two tries of prefixes", "Harder"],
    ["Min XOR pair", "Adjacent after sorting by value, actually; or prefer same bit",
      "Sort often enough for min XOR"],
    ["<strong>Confused with:</strong> prefix XOR + hashmap",
      "Hash answers equality of XOR to k, not maximisation",
      "Hash for =k; trie for max"],
  ],
  constraint: "n &le; 1e5, values &le; 1e9 so 30 bits (or 31). O(n * BITS) time and nodes. " +
    "Use cnt if you delete. Java ints: bit 31 is the sign; for non-neg values loop b=30..0.",
  core: [
    "Node { Node[] ch = new Node[2]; int cnt; }. insert(x): from b=30..0, bit=(x>>b)&1, " +
      "create child, cur=child, cnt++. queryMax(x): from b=30..0, want=1-bit, if child want " +
      "exists and cnt&gt;0 take it and set that bit in ans, else take bit.",
    "For max pair: insert a[0], for i=1..n-1 ans=max(ans, queryMax(a[i])), insert a[i]. For " +
      "subarray: same on prefix XOR array. Delete: walk and cnt-- (optionally drop cnt==0).",
  ],
  invariant: "<p>Each root-to-node path is a bit prefix of at least one stored number. queryMax " +
    "walks a path that maximises XOR with x bit by bit.</p>" +
    "<span class=\"eq\">at bit b: if opposite child exists, take it (that bit of XOR is 1)</span>",
  arrayLabel: "numbers then running max-XOR after each insert",
  array: [3, 10, 5, 25, 2, 8],
  vars: ["x", "bit", "want", "best"],
  vizTitle: "Insert 3 (011), query 10 (1010) preferring opposite bits",
  frames: [
    { note: "Insert 3 = 0011. Trie path 0,0,1,1 (4 bits for the demo).",
      active: [0],
      values: { x: 3, bit: "0011", want: "insert", best: 0 } },
    { note: "Query 10 = 1010. MSB want 1 (opposite of 0), no 1-child, take 0. XOR bit 0.",
      values: { x: 10, bit: 3, want: 1, best: 0 } },
    { note: "Next bits: eventually XOR 3^10=9. Insert 10.",
      active: [1],
      values: { x: 10, bit: "1010", want: "done", best: 9 } },
    { note: "Insert 5, 25, ... LC 421 sample ends at 28 = 5 XOR 25.",
      active: [2, 3],
      values: { x: 25, bit: "11001", want: "vs 5", best: 28 } },
    { note: "Greedy opposite at each bit is optimal because a higher bit of XOR outweighs all lower bits combined.",
      best: [2, 3],
      values: { x: "why", bit: "MSB first", want: "greedy", best: 28 } },
    { note: "Prefix-XOR trick: max subarray XOR = max over i<j of pref[j]^pref[i], same trie on prefixes.",
      done: [0, 1, 2, 3, 4, 5],
      values: { x: "pref", bit: "\u2014", want: "subarray", best: "same query" } },
  ],
  merTitle: "Binary trie of 3 (011) and 5 (101), 3 bits",
  mermaid: `graph TD
  root["root"] --> b0["0"]
  root --> b1["1"]
  b0 --> b01["1"]
  b01 --> b011["1 term 3"]
  b1 --> b10["0"]
  b10 --> b101["1 term 5"]`,
  steps: [
    "<strong>BITS=30</strong> (or 31). Node with ch[2] and cnt.",
    "<strong>insert(x):</strong> for b=BITS-1..0, bit=(x>>b)&1, create, cur=ch[bit], cnt++.",
    "<strong>queryMax(x):</strong> want=bit^1; if ch[want]!=null take want and set ans|=(1<<b); else take bit.",
    "<strong>Max pair:</strong> insert as you go, or insert all then query all.",
    "<strong>Subarray:</strong> insert 0 first (empty prefix), then each prefix XOR.",
    "<strong>Delete:</strong> cnt-- along the path of x.",
  ],
  code: [
    { tab: "Brute", file: "XorPairBrute.java",
      code: `public class XorPairBrute {
    static int maxXor(int[] a) {
        int best = 0;
        for (int i = 0; i < a.length; i++)
            for (int j = i + 1; j < a.length; j++)
                best = Math.max(best, a[i] ^ a[j]);
        return best;
    }
    public static void main(String[] args) {
        System.out.println(maxXor(new int[]{3, 10, 5, 25, 2, 8}));
    }
    // Input : LC 421 sample
    // Output: 28
}` },
    { tab: "Optimal", file: "XorTrie.java",
      code: `public class XorTrie {
    static class Node {
        Node[] ch = new Node[2];
        int cnt;
    }
    final Node root = new Node();
    static final int BITS = 30;

    void insert(int x) {
        Node cur = root;
        cur.cnt++;
        for (int b = BITS - 1; b >= 0; b--) {
            int bit = (x >> b) & 1;
            if (cur.ch[bit] == null) cur.ch[bit] = new Node();
            cur = cur.ch[bit];
            cur.cnt++;
        }
    }
    int queryMax(int x) {
        if (root.cnt == 0) return 0;
        Node cur = root;
        int ans = 0;
        for (int b = BITS - 1; b >= 0; b--) {
            int bit = (x >> b) & 1, want = bit ^ 1;
            if (cur.ch[want] != null && cur.ch[want].cnt > 0) {
                ans |= 1 << b;
                cur = cur.ch[want];
            } else {
                cur = cur.ch[bit];
            }
        }
        return ans;
    }
    public static void main(String[] args) {
        int[] a = {3, 10, 5, 25, 2, 8};
        XorTrie t = new XorTrie();
        int best = 0;
        t.insert(a[0]);
        for (int i = 1; i < a.length; i++) {
            best = Math.max(best, t.queryMax(a[i]));
            t.insert(a[i]);
        }
        System.out.println(best);
    }
    // Input : 3 10 5 25 2 8
    // Output: 28
}` },
    { tab: "Template", file: "MaxXorSubarray.java",
      code: `public class MaxXorSubarray {
    static class Node { Node[] ch = new Node[2]; }
    static Node root = new Node();
    static void insert(int x) {
        Node cur = root;
        for (int b = 30; b >= 0; b--) {
            int bit = (x >> b) & 1;
            if (cur.ch[bit] == null) cur.ch[bit] = new Node();
            cur = cur.ch[bit];
        }
    }
    static int queryMax(int x) {
        Node cur = root;
        int ans = 0;
        for (int b = 30; b >= 0; b--) {
            int bit = (x >> b) & 1, want = bit ^ 1;
            if (cur.ch[want] != null) { ans |= 1 << b; cur = cur.ch[want]; }
            else cur = cur.ch[bit];
        }
        return ans;
    }
    public static void main(String[] args) {
        int[] a = {1, 2, 3, 4};
        insert(0);
        int pref = 0, best = 0;
        for (int x : a) {
            pref ^= x;
            best = Math.max(best, queryMax(pref));
            insert(pref);
        }
        System.out.println(best);
    }
    // Input : [1,2,3,4] max subarray XOR
    // Output: 7
}` },
  ],
  complexity: {
    time: "O(n * BITS)",
    space: "O(n * BITS) nodes worst case",
    derivation: [
      "Each insert/query walks BITS nodes, creating at most BITS new nodes. BITS=30, n=1e5 is 3e6 steps.",
      "<span class=\"eq\">T = O(n B), S = O(n B), B &asymp; 30</span>",
      "Brute pairs are O(n^2). Hashing does not help maximisation.",
    ],
    compare: [
      ["All pairs", "O(n^2)", "O(1)", "n<=2000"],
      ["XOR trie", "O(n B)", "O(n B)", "n=1e5, max XOR"],
      ["Hash prefix XOR", "O(n)", "O(n)", "XOR equals k, not max"],
      ["Sort for min XOR pair", "O(n log n)", "O(n)", "Min pair is adjacent in value order"],
    ],
  },
  pitfalls: [
    { title: "Signed shift on negative numbers",
      bug: ">> sign-extends; bit 31 pollutes the walk if you use 32 bits on negatives.",
      fix: "Non-neg constraints: loop 30..0. Else >>> or store as long." },
    { title: "Query on an empty trie",
      bug: "NPE walking null children, or XOR with 0 pretending a number exists.",
      fix: "cnt on root, or insert a dummy only when the problem allows 0." },
    { title: "Forgetting to insert 0 as empty prefix",
      bug: "Max subarray XOR misses prefixes that start at index 0 (XOR of a prefix with 0).",
      fix: "insert(0) before the loop." },
    { title: "Delete without cnt",
      bug: "Removing a number that shared prefixes with another wipes the sibling's path.",
      fix: "cnt++ on insert, cnt-- on delete, treat cnt==0 as missing." },
    { title: "Preferring the same bit for max XOR",
      bug: "You minimise that bit of the XOR. Answer too small.",
      fix: "want = bit ^ 1. Same bit is the fallback, and the rule for min XOR." },
  ],
  variants: [
    ["Min XOR pair", "Prefer the same bit when it exists; or sort and check adjacent.",
      "want = bit, fallback opposite", "Adjacent-in-sorted is O(n log n) and simpler"],
    ["k-th XOR with x", "cnt on subtrees: if opposite child's cnt >= k, take it and k stays; else k -= cnt, take same.",
      "like order-statistic on bits", "CF variants"],
    ["Two tries for [L,R]", "Prefixes of a[1..R] minus prefixes of a[1..L-1] via persistent nodes or cnt snapshots.",
      "persistent binary trie", "Offline [L,R] max XOR with x"],
  ],
  followups: [
    ["Why is bit-greedy optimal?",
      "<p>Bit b is worth 2^b, more than 2^b-1+...+1. If you can set it, you always should, regardless of lower bits. The trie only tells you whether any stored number realises that opposite bit given the bits already chosen (which are a prefix constraint).</p>"],
    ["Max subarray XOR vs max pair XOR?",
      "<p>Subarray XOR is pref[r]^pref[l-1]. Insert prefix XORs into the trie, query the current prefix. That is max pair on the prefix array, including 0.</p>"],
    ["CF 706D operations?",
      "<p>Insert x, delete x (cnt), query max XOR with x. Same trie, watch cnt so two equal inserts need two deletes.</p>"],
    ["Persistent XOR trie?",
      "<p>On insert, copy the O(BITS) nodes on the path. Version i is the trie of the first i numbers. Query a range of versions for [L,R] problems.</p>"],
  ],
  problems: [
    lc(421, "maximum-xor-of-two-numbers-in-an-array", "Medium", "The classic"),
    lc(1707, "maximum-xor-with-an-element-from-array", "Hard", "Offline sort + trie"),
    lc(1803, "count-pairs-with-xor-in-a-range", "Hard", "cnt walk with bit limits"),
    lc(2935, "maximum-strong-pair-xor-ii", "Hard", "Trie + two pointers on values"),
    cf("706D", "Vasiliy's Multiset", "Medium", "Insert/delete/max XOR"),
    cf("888G", "Xor-MST", "Hard", "Boruvka + XOR trie"),
    cf("817E", "Choosing The Commander", "Medium", "Binary trie with counts"),
    cf("282E", "Sausage Maximization", "Medium", "Prefix and suffix XOR tries"),
  ],
  recap: [
    "<strong>Bits MSB first</strong>, two children 0/1.",
    "<strong>Max XOR: prefer the opposite bit</strong> if that child exists.",
    "<strong>O(n B)</strong> with B~30.",
    "<strong>cnt</strong> for delete and empty checks.",
    "<strong>Prefix XOR + trie</strong> for max subarray XOR; insert 0 first.",
  ],
  oneliner: "for b=30..0: want=bit^1; if ch[want]!=null take it else take bit",
}),

];

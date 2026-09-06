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
    "Imagine a comment thread stored the way a database would store it. Each comment is one " +
      "record holding its text plus two references: one to the reply displayed above it and " +
      "one to the reply displayed below it, where a reference of <code>null</code> means there " +
      "is nothing on that side. You are handed exactly one thing, a reference to the top " +
      "comment, and asked to print all 100000 comments. There is no array to loop over and no " +
      "index to increment, so the only way to reach comment number 57000 is to follow " +
      "references down from the top. Everything on this page is about how to follow them so " +
      "that every record is reached exactly once and in an order you can reason about.",
    "Now change the task to \"how many replies sit underneath each comment\". The obvious " +
      "method answers one comment at a time: stand on it, walk everything reachable below it, " +
      "count what you saw, then move to the next comment and start again. That is correct and " +
      "it is also quadratic, because a record sitting 40 levels deep gets counted once for " +
      "each of its 40 ancestors. If the thread happens to be a straight chain of 100000 " +
      "comments, the total work is 1 + 2 + ... + 100000, roughly <code>5&times;10&#8313;</code> " +
      "reference hops &mdash; minutes of computation. One walk that visits each record once " +
      "and hands its count back up to its parent finishes the same job in 100000 hops.",
    "That single walk is the whole subject, so here is the vocabulary for it. A <em>node</em> " +
      "is one record; its two references are its <em>left child</em> and <em>right child</em>; " +
      "a node with no children at all is a <em>leaf</em>; the <em>subtree</em> of a node is " +
      "that node together with everything reachable below it; the topmost node, the one you " +
      "were handed, is the <em>root</em>; the <em>depth</em> of a node is how many steps " +
      "separate it from the root; and the <em>height</em> of the tree is the largest depth in " +
      "it. The walk has exactly one shape &mdash; deal with the left subtree, deal with the " +
      "right subtree &mdash; and the only decision left is when you record the node's own " +
      "value: before both recursive calls (<em>preorder</em>), between them (<em>inorder</em>), " +
      "or after them (<em>postorder</em>).",
    "In a problem statement the tell is that the input is described as a root pointer, or as a " +
      "flat array with <code>null</code> holes, rather than as a list of edges &mdash; and that " +
      "the limit reads something like <code>n &le; 10&#8309;</code> with no promise that the " +
      "tree is balanced. The missing promise is the part that bites. A binary tree is legally " +
      "allowed to be a straight chain, and a recursive walk down a chain of 100000 nodes keeps " +
      "100000 Java stack frames alive at once, while the default JVM stack runs out after a " +
      "few thousand. That is why every walk here also gets an iterative spelling that keeps " +
      "the pending nodes in an <code>ArrayDeque</code> on the heap instead.",
  ],
  insight: "There is only one traversal in this entire module and it is \"handle the left " +
    "subtree, handle the right subtree\"; preorder, inorder and postorder are that same walk " +
    "with the single line that records <code>node.val</code> moved before, between, or after " +
    "the two recursive calls. Level order is the same visiting rule with the recursion's hidden " +
    "stack swapped for an explicit queue, and that swap is the only thing separating " +
    "depth-first from breadth-first.",
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
  constraint: "<code>n &le; 10&#8309;</code>, with the tree handed to you as a root reference " +
    "and no sentence promising it is balanced, is the everyday case, and it is comfortable for " +
    "a walk that touches each node once. The trap here is memory rather than time: a " +
    "chain-shaped tree of 100000 nodes needs 100000 nested calls, and the default JVM stack " +
    "holds only a few thousand frames, so what you get is a <code>StackOverflowError</code> " +
    "rather than a wrong answer. Prefer the iterative form whenever balance is not promised.",
  core: [
    "Fix the data first. A <code>Node</code> holds an <code>int val</code> plus two references " +
      "<code>left</code> and <code>right</code>, either of which may be <code>null</code> to " +
      "mean \"no child on that side\". The recursion has exactly one job: given a reference " +
      "<code>n</code>, deal with the whole subtree rooted at <code>n</code>. Its first line is " +
      "the base case <code>if (n == null) return;</code>, because an absent child is a subtree " +
      "containing nothing and there is nothing to do for it. After that it calls itself on " +
      "<code>n.left</code>, calls itself on <code>n.right</code>, and somewhere around those " +
      "two calls it appends <code>n.val</code> to the output list <code>out</code>.",
    "Where you put <code>out.add(n.val)</code> is the entire difference between the three " +
      "depth-first orders. Put it before both calls and a node is recorded the first time you " +
      "arrive at it, which is preorder. Put it between them and a node is recorded only after " +
      "its whole left subtree has finished, which is inorder. Put it after both and a node is " +
      "recorded only once everything below it is done, which is postorder. Quantities that " +
      "depend on the children have no choice and must be postorder: <code>height(n)</code> " +
      "returns <code>1 + Math.max(height(n.left), height(n.right))</code>, and the size of a " +
      "subtree is <code>1 + szL + szR</code>. Neither of those two numbers exists until both " +
      "recursive calls have returned, so the combine has to happen last.",
    "Level order asks a different question &mdash; list every node at depth 0, then every node " +
      "at depth 1, and so on &mdash; and recursion cannot answer it directly because recursion " +
      "dives. Instead keep an explicit <code>ArrayDeque&lt;Node&gt; q</code> of nodes waiting " +
      "to be handled. Take a node off the front, append its value, and push its non-null " +
      "children onto the back; because a child always enters behind everything already waiting, " +
      "the queue stays sorted by depth for free. To see where one depth ends, read " +
      "<code>int sz = q.size()</code> at the top of each round and poll exactly that many " +
      "nodes: those <code>sz</code> nodes are precisely the current level, since nothing " +
      "enqueued during the round can share their depth.",
    "Run the sample tree to see all four at once: root <code>1</code> with children " +
      "<code>2</code> and <code>3</code>, and <code>2</code> owning children <code>4</code> " +
      "and <code>5</code>. Preorder writes <code>1</code> on arrival, dives left and writes " +
      "<code>2</code>, dives left again and writes <code>4</code> whose two calls both return " +
      "immediately, comes back up to <code>2</code> and writes <code>5</code>, then unwinds to " +
      "<code>1</code> and writes <code>3</code>: <code>[1,2,4,5,3]</code>. The identical walk " +
      "with the recording line between the two calls emits <code>[4,2,5,1,3]</code>, and after " +
      "both calls it emits <code>[4,5,2,3,1]</code>. The queue version pulls <code>1</code>, " +
      "then <code>2,3</code>, then <code>4,5</code>, giving <code>[[1],[2,3],[4,5]]</code>.",
  ],
  invariant: "<p>Every node is entered exactly once and left exactly once, so all four walks " +
    "do <code>&Theta;(n)</code> work; the only thing that differs between them is the moment " +
    "at which <code>node.val</code> is recorded:</p>" +
    "<span class=\"eq\">pre = visit, L, R &nbsp;|&nbsp; in = L, visit, R &nbsp;|&nbsp; post = L, R, visit</span>" +
    "<p>In plain words, the recursion chases exactly the same references in exactly the same " +
    "physical order no matter which of the three orders you asked for; the output lists differ " +
    "only because you chose a different instant to append. You can confirm that yourself on any " +
    "tree by writing all three <code>add</code> lines into one function and watching a single " +
    "walk fill three different lists.</p>" +
    "<p>Interview sentence: <em>\"I walk every node once; the order is just where I put the visit.\"</em></p>",
  arrayLabel: "preorder output",
  array: [1, 2, 4, 5, 3],
  vars: ["node", "phase", "written"],
  vizTitle: "Preorder filling a flat output array",
  frames: [
    { note: "Arrive at the root, node 1. Preorder records a node the moment it is entered, so slot 0 becomes 1; now the walk recurses left into node 2.",
      active: [0], dim: [1, 2, 3, 4],
      values: { node: 1, phase: "visit", written: 1 } },
    { note: "Node 2 is entered and written into slot 1 before either of its own children is touched. The walk immediately dives left again, into node 4.",
      active: [1], done: [0], dim: [2, 3, 4],
      values: { node: 2, phase: "visit", written: 2 } },
    { note: "Node 4 is a leaf: both of its child references are null, so its two recursive calls return at once and slot 2 is all this branch writes.",
      active: [2], done: [0, 1], dim: [3, 4],
      values: { node: 4, phase: "visit leaf", written: 3 } },
    { note: "Control returns to node 2, which still owes work on its right child. Entering node 5 writes it into slot 3, and node 5 is also a leaf.",
      active: [3], done: [0, 1, 2], dim: [4],
      values: { node: 5, phase: "visit leaf", written: 4 } },
    { note: "The subtree of node 2 is now completely finished, so the walk unwinds to node 1 and takes its right child. Node 3 lands in slot 4.",
      active: [4], done: [0, 1, 2, 3],
      values: { node: 3, phase: "visit leaf", written: 5 } },
    { note: "All five nodes were entered once, giving preorder [1,2,4,5,3]. Moving the recording line between the two calls yields [4,2,5,1,3], after both calls [4,5,2,3,1], and the queue version [1,2,3,4,5].",
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
    "<strong>Represent the node.</strong> Store <code>val</code>, <code>left</code> and <code>right</code>, and treat a missing child as <code>null</code>, because that is the only signal the walk has that a branch has ended.",
    "<strong>Write the recursive walk first.</strong> Return immediately on <code>null</code>, then place <code>out.add(n.val)</code> before, between, or after the two recursive calls so the same chase of references produces preorder, inorder or postorder.",
    "<strong>Iterative preorder uses a stack.</strong> Start with the root, pop a node, record it, then push right before left so the left child is handled next, matching the recursive dive.",
    "<strong>Iterative inorder walks left first.</strong> Push every node while stepping <code>cur = cur.left</code>, then pop, record, and move to that node's right child, because inorder must finish the left subtree before the node itself.",
    "<strong>Level order uses a queue and a size snapshot.</strong> Read <code>sz = q.size()</code> at the start of each round and poll exactly that many nodes so children enqueued during the round cannot leak into the current depth.",
    "<strong>Combine children after both calls return.</strong> Height and subtree size do not exist until the two recursive results are known, and if the tree can be a chain of <code>10&#8309;</code> nodes, prefer the iterative spelling so the JVM stack is not the limit.",
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
      "<p>Every walk enters each of the <code>n</code> nodes once and leaves it once. The recursive spelling does a constant amount of work around the two child calls, so the recurrence is <code>T(n) = T(n_L) + T(n_R) + &Theta;(1)</code>, which unfolds to <code>&Theta;(n)</code>. The iterative stack and the BFS queue each push and pop a node a constant number of times, so they are the same linear pass written with an explicit collection.</p>",
      "<span class=\"eq\">T(n) = T(n_L) + T(n_R) + &Theta;(1) = &Theta;(n)</span>",
      "<p>At <code>n = 10&#8309;</code> that is 100000 visits, a few milliseconds. Extra memory is the height <code>h</code> for DFS (a right spine uses <code>n</code> frames) or the width <code>w</code> for BFS (a complete last level holds about <code>n/2</code> nodes). The time is never the problem; the stack is, which is why the iterative forms exist.</p>",
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
      bug: "<code>java.util.Stack</code> looks like the named tool for DFS, so it compiles and even produces the right list on the sample, but it is a synchronised <code>Vector</code> with the wrong method names and a real cost per push.",
      fix: "Use <code>ArrayDeque</code>: <code>push</code>/<code>pop</code>/<code>peek</code> for DFS and <code>add</code>/<code>poll</code> for BFS. Test both walks on a three-node tree." },
    { title: "Forgetting the null base case",
      bug: "Skipping <code>if (n == null) return</code> looks fine on a perfectly full tree where every child exists, then a missing child throws a <code>NullPointerException</code> the first time you read <code>n.val</code>.",
      fix: "Make the null check the first line, or return the identity of the combine (0 for size, -1 for edge-height). Test a root with only a left child." },
    { title: "Height off-by-one (nodes vs edges)",
      bug: "Returning 1 for a single node matches LC 104 (height in nodes) and is wrong for LC 543, which counts edges, so the same helper silently fails the other problem.",
      fix: "Write the convention in a comment. For edge-height, a null child returns -1 so a leaf returns 0. Check a one-node tree against the statement." },
    { title: "Level-order without snapshotting queue size",
      bug: "Polling until the queue is empty still lists every node, so a flat walk looks correct, but children of the current depth leak into the same list and grouped levels come out wrong.",
      fix: "Capture <code>int sz = q.size()</code> and poll exactly that many times. Test that a three-level tree returns three inner lists, not one." },
    { title: "Recursive walk on a linked-list-shaped tree",
      bug: "A right spine of <code>n = 10&#8309;</code> is a legal binary tree, so the recursive walk is correct in theory and then dies with <code>StackOverflowError</code> after a few thousand frames.",
      fix: "Keep an iterative version on the heap whenever the statement does not promise a balanced tree. A chain of a few thousand nodes is the test." },
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
      "<p>The first preorder value is the root, because preorder records a node on arrival. Find that value in the inorder list: everything to its left belongs to the left subtree and everything to its right belongs to the right. A map from value to inorder index makes each split <code>O(1)</code>, so the whole rebuild is <code>O(n)</code>. Preorder plus postorder is ambiguous unless every node has zero or two children, because a single-child node can sit on either side.</p>"],
    ["Why is inorder of a BST sorted?",
      "<p>A BST promises that every key in the left subtree is smaller than the node and every key in the right subtree is larger. Inorder is exactly \"whole left, then the node, then whole right\", so the values come out in increasing order. That fact is load-bearing on the BST page; here it is just a reason to remember where the visit sits.</p>"],
    ["O(1) extra space with parent pointers?",
      "<p>From the current node you can walk to its parent and ask whether you arrived from the left child or the right. That is the same three-colour state machine as iterative postorder, stored in the current position instead of on a stack. You still visit every node a constant number of times; you just stopped allocating the deque.</p>"],
    ["What changes for an n-ary tree?",
      "<p>Depth-first becomes \"record the node, then loop its children\" instead of two named recursive calls, and there is no unique inorder because there is no unique place between \"the left\" and \"the right\". Level order barely changes: enqueue every child instead of two. Height is still one plus the maximum child height.</p>"],
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
  dryIntro: "Preorder on the five-node sample 1 / 2 3 / 4 5, filling the output array one visit at a time so you can see where each value lands.",
}),

/* ====================================== 2. binary-tree-problem-patterns */
pack({
  id: "binary-tree-problem-patterns",
  difficulty: "Medium",
  readTime: "28 min",
  tagline: "Diameter, path sum, LCA of two nodes, serialise, and construct-from-orders are " +
    "all a postorder combine or a preorder emit with a payload attached to the walk you already own.",
  tags: ["binary tree", "diameter", "path sum", "P0"],
  prereqs: [["Binary Tree Basics & Traversals", "binary-tree-basics-and-traversals.html"]],
  why: [
    "You are given a binary tree of 100000 nodes and asked for the longest path anywhere in " +
      "it, counted in edges. The obvious method picks every pair of leaves, walks up to their " +
      "meeting point, and keeps the best length. A tree that is a straight chain of 100000 " +
      "nodes has about <code>5&times;10&#8313;</code> pairs, and even a bushier tree still " +
      "makes you pay for a fresh walk per pair. The judge will cut you off long before you " +
      "finish. The same explosion shows up as \"maximum path sum\", \"lowest common ancestor " +
      "of two nodes\", and \"does this path add to k\": they all look like a new puzzle and " +
      "they are all the same walk you already own.",
    "What changes is the payload you carry, not the chase of left and right. A " +
      "<em>postorder</em> walk &mdash; handle both children, then the node &mdash; lets each " +
      "node see a small summary of its two subtrees and decide what to send upward. Diameter " +
      "needs two heights. Maximum path sum needs two gains, each of which may be dropped if " +
      "it is negative. Lowest common ancestor, usually shortened to LCA, needs a pair of " +
      "\"did I see p?\" / \"did I see q?\" answers. If you instead collect every root-to-leaf " +
      "path into a global list and scan it afterwards, you have thrown away the fact that " +
      "the interesting combination happens at one node.",
    "A few questions emit on the way down instead: serialise writes a node before diving, " +
      "and constructing a tree from preorder plus inorder consumes the next preorder value " +
      "as the current root. Those are still the same walk with the recording line moved. In " +
      "a real statement the tell is a single tree handed as a root pointer, <code>n</code> up " +
      "to <code>10&#8309;</code>, and a question about a path, a diameter, an ancestor, or a " +
      "rebuild from two orders &mdash; not \"answer this for every possible root\" and not " +
      "\"the tree is a BST\".",
  ],
  insight: "Name the struct a node returns after both children finish, plus one global best " +
    "for combinations that go through that node. Almost every hard binary-tree question is " +
    "that postorder plus a decision about what to send upward.",
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
  constraint: "<code>n &le; 10&#8309;</code> with a single root pointer is the everyday " +
    "interview limit, and one postorder that does constant work per node finishes comfortably. " +
    "Values may be negative, which is why maximum path sum cannot blindly add a child. " +
    "Recursion depth equals the height; if the statement does not promise a balanced tree, " +
    "a chain of 100000 nodes will overflow the JVM stack, though interviews rarely demand " +
    "the iterative rewrite for diameter the way they do for the raw walks.",
  core: [
    "Diameter is the longest path anywhere, counted in edges. Write a helper " +
      "<code>height(u)</code> that returns the height of the subtree in nodes (a null child " +
      "returns 0, a leaf returns 1). After both recursive calls you have <code>hL</code> and " +
      "<code>hR</code>. The path that goes through <code>u</code> has <code>hL + hR</code> " +
      "edges, so update a global <code>ans</code> with that sum. What you return upward is " +
      "only one side, <code>1 + max(hL, hR)</code>, because a parent can extend just one " +
      "downward spine. Returning <code>hL + hR</code> as height double-counts and the parent " +
      "then invents paths that do not exist.",
    "Maximum path sum is the same shape with money instead of edges. A child's " +
      "<em>gain</em> &mdash; the best sum of a downward path starting at that child &mdash; " +
      "is dropped when it is negative, written <code>max(0, gain)</code>, because you are " +
      "allowed to stop. The through-me candidate is <code>val + gainL + gainR</code> and " +
      "competes for a global best. What you return upward is <code>val + max(gainL, gainR)</code>, " +
      "one downward arm only. LCA uses a different payload: the recursive call returns " +
      "<code>null</code> if the subtree contains neither target, returns the node itself if " +
      "it is <code>p</code> or <code>q</code>, and if both sides come back non-null the " +
      "current node is the answer. Path-sum III is prefix sums on the unique path from the " +
      "root, with a hashmap of leftover prefixes, the same idea as subarray-sum-k.",
    "Take the sample tree: root 1 with children 2 and 3, and 2 owning 4 and 5. Leaves 4, 5 " +
      "and 3 each have height 1. At node 2 both heights are 1, so the through-me path 4-2-5 " +
      "has 2 edges and <code>ans</code> becomes 2; the height returned upward is 2. At the " +
      "root the heights are 2 and 1, the through-me path 4-2-1-3 has 3 edges, and that is " +
      "the diameter. LCA of 4 and 3 sees a non-null left and a non-null right at node 1 and " +
      "stops there. If the values were instead <code>-10 / 9 20 / 15 7</code>, the same walk " +
      "with gains would keep 15+20+7 = 42 as the global best and drop the <code>-10</code> " +
      "arm when sending a number upward.",
  ],
  invariant: "<p>After both children return, you know every summary of the two subtrees. The " +
    "only new paths are those that go through the current node, so a global <code>ans</code> " +
    "is updated with that through-me combination and a one-sided summary is sent to the parent:</p>" +
    "<span class=\"eq\">ans = max(ans, combine(left, me, right)); return a one-sided summary</span>" +
    "<p>In plain words, a child can tell you the best downward spine it owns, but only you " +
    "can glue the two spines into a path that bends at you, so that glued number lives in " +
    "<code>ans</code> and never travels upward as if it were a height.</p>" +
    "<p>Interview sentence: <em>\"I return a summary from postorder and keep through-me in a global.\"</em></p>",
  arrayLabel: "height[] written in postorder on values [1,2,4,5,3]",
  array: [3, 2, 1, 1, 1],
  indexLabels: ["1", "2", "4", "5", "3"],
  vars: ["u", "hL", "hR", "diam"],
  vizTitle: "Diameter on the sample: through node 2 the path 4-2-5 has length 2",
  frames: [
    { note: "Start at leaf 4. A null child has height 0, so both sides are 0 and the through-me path at 4 has no edges yet.",
      active: [2],
      values: { u: 4, hL: 0, hR: 0, diam: 0 } },
    { note: "Leaf 5 is the same. At node 2 the two downward spines each add one edge, so the bent path 4-2-5 has length 2 and the global diameter becomes 2.",
      active: [1],
      values: { u: 2, hL: 0, hR: 0, diam: 2 } },
    { note: "The helper still returns a one-sided height: each leaf counts as 1, so node 2 sends 2 upward. The 2-edge path stays in the global, not in the returned height.",
      active: [1],
      values: { u: 2, hL: 1, hR: 1, diam: 2 } },
    { note: "At root 1 the heights are 2 and 1. The path 4-2-1-3 has 3 edges, which beats the earlier 2, so the diameter is now 3.",
      active: [0],
      values: { u: 1, hL: 2, hR: 1, diam: 3 } },
    { note: "The root returns height 3, but the answer you report is the global diameter 3, the longest bent path, not that height.",
      best: [0, 1, 2, 4],
      values: { u: 1, hL: 2, hR: 1, diam: 3 } },
    { note: "Maximum path sum uses the same walk: drop a negative child gain, compare val+L+R to a global, and send only one arm upward.",
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
    "<strong>Name the struct before you type.</strong> Decide what a node must return upward &mdash; a height, a gain, or a pair of \"found p / found q\" &mdash; because that choice is the whole algorithm.",
    "<strong>Walk postorder: children first.</strong> Recurse left, recurse right, then combine, so both summaries exist before you invent a through-me candidate or update a global <code>ans</code>.",
    "<strong>Diameter stores the bend separately.</strong> Write <code>ans = max(ans, hL + hR)</code> and return only <code>1 + max(hL, hR)</code>, with null as 0, so a parent extends one spine rather than a already-bent path.",
    "<strong>Maximum path sum drops a losing child.</strong> A negative gain cannot help a path that is allowed to stop, so take <code>max(0, gain)</code> both when sending one arm up and when scoring <code>val + gL + gR</code>.",
    "<strong>LCA returns the first node that sees both targets.</strong> If both recursive calls are non-null this node is the meeting point; otherwise propagate the non-null side, which also covers the case where one target sits under the other.",
    "<strong>Construct consumes preorder and splits inorder.</strong> The next preorder value is the current root, and a map of inorder indices tells you the left and right ranges in <code>O(1)</code> so the rebuild stays linear.",
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
      "<p>One postorder visits each of the <code>n</code> nodes once and does a constant amount of arithmetic around the two child calls, so diameter, maximum path sum and LCA are all <code>&Theta;(n)</code>. Building a tree from preorder and inorder is also <code>O(n)</code> if you map values to inorder indices up front; scanning <code>indexOf</code> at every node turns the same idea into <code>O(n&#178;)</code> and dies at <code>n = 10&#8309;</code>.</p>",
      "<span class=\"eq\">T = &Theta;(n)</span>",
      "<p>Path-sum III with a hashmap is still expected linear time if you increment a prefix count on the way down and decrement it on the way up, so a sibling cannot see a prefix it does not own. At <code>n = 10&#8309;</code> the whole family is a couple of milliseconds. The naive all-pairs walk is about <code>10&#8310;</code> path checks and will not finish.</p>",
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
      bug: "Writing <code>return hL + hR</code> looks right because that number is the diameter contribution, and the sample still prints a plausible answer, but the parent then treats a bent path as a single spine and invents edges that do not exist.",
      fix: "Return <code>1 + max(hL, hR)</code> and store <code>hL + hR</code> only in the global <code>ans</code>. Check that a parent of a three-node V does not report a path longer than 2." },
    { title: "Max path sum without dropping negatives",
      bug: "Adding a child whose gain is <code>-5</code> looks consistent with \"use both children\", yet the parent would have a better path by standing alone, so the global best comes out too small.",
      fix: "Wrap every child gain in <code>max(0, gain)</code> both upward and through-me. A node with two negative children must be allowed to answer with just its own value." },
    { title: "LCA comparing values instead of references",
      bug: "Comparing <code>n.val == p.val</code> looks fine when every value is unique, then a duplicate or a different instance of the same number makes you return the wrong meeting point.",
      fix: "Compare node identity, or a unique id, unless the statement promises unique values. Test two nodes that share a value and sit in different subtrees." },
    { title: "Construct without a map, O(n^2)",
      bug: "Calling <code>indexOf</code> on the inorder array at every node looks like the obvious split and works on the tiny sample, then becomes quadratic once both arrays have 100000 entries.",
      fix: "Build a <code>HashMap</code> from value to inorder index once, and pass shrinking <code>lo</code>/<code>hi</code> bounds. Time a rebuild at a few thousand nodes if you are unsure." },
    { title: "Path sum III double-counting with a global map not backtracked",
      bug: "Leaving a prefix in the map after you leave a subtree looks harmless because the numbers are still \"on some path\", but a later sibling then counts a prefix it does not share and the answer is too large.",
      fix: "Increment the prefix count on the way down and decrement it on the way back up. A two-branch tree with the same running sum on both arms is the test." },
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
      "<p>LC 543 asks for edges, so a single node answers 0. If your helper counts height in nodes (a leaf returns 1), the through-me edge count is still <code>hL + hR</code>, because each side's node-count equals the number of edges on that spine. If you prefer edge-height, a null returns -1 and a leaf returns 0, and through-me is <code>hL + hR + 2</code>. Pick one convention, write it in a comment, and match the statement on a one-node tree.</p>"],
    ["LCA when one node is ancestor of the other?",
      "<p>The first time the walk hits <code>p</code> (or <code>q</code>), it returns that node immediately. The other target sits somewhere below, so the opposite child returns <code>null</code> and you propagate <code>p</code> upward. That is the correct LCA: the first common ancestor is <code>p</code> itself. A sample where 2 is an ancestor of 4 is the check.</p>"],
    ["Why max(0, gain) in LC 124?",
      "<p>A path is allowed to stop at the current node, and it must contain at least that node. A child whose best downward sum is negative cannot improve any path that is allowed to refuse it, so you replace that gain with 0. The through-me score <code>val + gL + gR</code> can still use both children when both help, and the value you send to the parent uses only the better arm.</p>"],
    ["Subtree of another tree?",
      "<p>Either serialise both trees with explicit nulls and ask whether B's string sits inside A's, or for each node of A run a simultaneous \"same tree\" walk against B. The naive version is <code>O(n m)</code>. Hashing the serialisations, or comparing hashes of subtrees, brings it back to linear in the two sizes. The simultaneous walk is the one to write in an interview unless they ask for the hash.</p>"],
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
  dryIntro: "Diameter on the sample 1 / 2 3 / 4 5. Heights come back from the leaves; the global keeps the bent path through each node.",
}),

/* ====================================== 3. bst ======================== */
pack({
  id: "bst",
  difficulty: "Easy",
  readTime: "28 min",
  tagline: "Left &lt; node &lt; right on every subtree: inorder is sorted, k-th smallest is " +
    "an inorder walk, and validate is a range (lo, hi) passed down, not a local comparison.",
  tags: ["BST", "inorder", "validate", "P0"],
  prereqs: [
    ["Binary Tree Basics & Traversals", "binary-tree-basics-and-traversals.html"],
    ["Binary Search Basics", "../01-arrays-and-windows/binary-search-basics.html"],
  ],
  why: [
    "You are handed a binary tree of a few thousand nodes and asked whether it is a binary " +
      "search tree. The tempting check looks at each node and asks only whether the left " +
      "child is smaller and the right child is larger. That test accepts a tree whose root " +
      "is 4, whose left child is 2, and whose right child of 2 is 6: locally 2 &lt; 6, yet 6 " +
      "sits in the left half of 4 and the whole tree is illegal. Almost every BST bug is that " +
      "same mistake written a different way: a local compare that is not the real rule.",
    "A <em>binary search tree</em>, usually shortened to BST, is a binary tree plus one " +
      "range rule: every key in the left subtree is smaller than the node, and every key in " +
      "the right subtree is larger, not just the two children. Because of that rule, an " +
      "inorder walk emits keys in sorted order, so \"k-th smallest\" is \"walk inorder and " +
      "stop at k\", and two-sum on a BST is two iterators walking that sorted sequence, not " +
      "the hash set you needed on an unordered tree. Delete is the one structural edit people " +
      "fumble: a node with two children is replaced by its inorder successor, the next key " +
      "to the right.",
    "This page is the interview BST: validate, search, insert, delete, k-th, LCA using the " +
      "values, and convert a sorted array into a balanced tree. Java's <code>TreeMap</code> " +
      "is a later, self-balancing structure and is not required here. In a statement the " +
      "tell is the phrase \"binary search tree\" next to limits like <code>n &le; 10&#8308;</code> " +
      "in interviews or <code>n &le; 10&#8309;</code> in contests, and a question that uses " +
      "the ordered invariant rather than a general path or diameter.",
  ],
  insight: "Validate by passing a range down from the ancestors, not by comparing a node to " +
    "its two children. Inorder of a BST is strictly increasing when keys are unique, and " +
    "k-th smallest is that same walk stopping early.",
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
  constraint: "Interview limits sit around <code>n &le; 10&#8308;</code>; contests go to " +
    "<code>n &le; 10&#8309;</code>. A skew BST is a linked list, so a search can take " +
    "<code>n</code> steps and a recursive walk can overflow the stack. <code>TreeMap</code> " +
    "and <code>TreeSet</code> are red-black trees and guarantee <code>O(log n)</code>; this " +
    "page does not. Duplicate policy is usually \"keys are unique\"; if equals are allowed, " +
    "pick one side (commonly the right) and make validate match that choice.",
  core: [
    "Validate by passing a live range. The helper is <code>ok(node, lo, hi)</code>, and the " +
      "sentinels must be <code>long</code> (or boxed <code>Integer</code> bounds) because " +
      "<code>Integer.MIN_VALUE</code> is a legal key. Fail as soon as <code>val &le; lo</code> " +
      "or <code>val &ge; hi</code>. The left child inherits <code>(lo, val)</code> and the " +
      "right child inherits <code>(val, hi)</code>, which is how a grandchild is still checked " +
      "against every ancestor. The inorder alternative keeps a <code>prev</code> pointer and " +
      "fails if the current value is not strictly larger; that is the same rule written as a " +
      "sorted scan.",
    "Search and insert are binary search on the tree: go left when the key is smaller, right " +
      "otherwise, and a <code>null</code> slot is where a new node hangs. Delete has three " +
      "shapes. No children: drop the node. One child: replace it with that child. Two children: " +
      "copy the value of the <em>inorder successor</em> &mdash; the leftmost node of the right " +
      "subtree, which has no left child &mdash; then delete that successor. LCA walks from the " +
      "root and steps left while both keys are smaller, right while both are larger, and stops " +
      "at the first node that sits between them.",
    "Walk the sample 4 / 2 5 / 1 3. The root 4 is checked against <code>(-&infin;, +&infin;)</code>. " +
      "Node 2 must sit in <code>(-&infin;, 4)</code>, node 1 in <code>(-&infin;, 2)</code>, node 3 " +
      "in <code>(2, 4)</code>, and node 5 in <code>(4, +&infin;)</code>; all pass, and inorder " +
      "emits 1, 2, 3, 4, 5. Replace 3 with 6 and the local check at 2 still sees 2 &lt; 6, but " +
      "the range <code>(2, 4)</code> rejects 6 at once. Inserting 0 walks 4 to 2 to 1 and hangs " +
      "a left child. Deleting 2 copies 3 into 2's slot and then removes the old 3, which had " +
      "no left child.",
  ],
  invariant: "<p>For every node, every key in its left subtree is strictly less than " +
    "<code>node.val</code> and every key in its right subtree is strictly greater (unique keys). " +
    "That is equivalent to a range inherited from the ancestors:</p>" +
    "<span class=\"eq\">lo &lt; node.val &lt; hi</span>" +
    "<p>In plain words, a node is legal only when it sits inside the open interval its " +
    "ancestors carved out; checking the two children is not enough, because a grandchild can " +
    "break an ancestor the parent never looks at.</p>" +
    "<p>Interview sentence: <em>\"I pass (lo, hi) down; a local left-right check is not the invariant.\"</em></p>",
  arrayLabel: "inorder values (must be strictly increasing)",
  array: [1, 2, 3, 4, 5],
  vars: ["node", "lo", "hi", "ok"],
  vizTitle: "Validate BST: range tightens on the way down",
  frames: [
    { note: "The sample is 4 / 2 5 / 1 3. Root 4 is checked against an open range that covers every integer, so it always passes.",
      active: [3],
      values: { node: 4, lo: "-inf", hi: "+inf", ok: true } },
    { note: "Stepping left tightens the high end: node 2 must sit strictly below 4, which it does, so the walk continues into 2's children.",
      active: [1],
      values: { node: 2, lo: "-inf", hi: 4, ok: true } },
    { note: "Node 1 must sit below 2, and node 3 must sit between 2 and 4. Both ranges hold, so the left subtree of 4 is legal.",
      active: [0, 2],
      values: { node: 3, lo: 2, hi: 4, ok: true } },
    { note: "The right child 5 must sit strictly above 4. It does, so every node has passed and the tree is a BST.",
      active: [4],
      values: { node: 5, lo: 4, hi: "+inf", ok: true } },
    { note: "If 3 were 6, the local check at 2 would still see 2 &lt; 6, but the inherited range (2, 4) rejects 6 at once.",
      values: { node: 6, lo: 2, hi: 4, ok: false } },
    { note: "The other validator is inorder: 1, 2, 3, 4, 5 is strictly increasing, which is the same range rule written as a sorted scan.",
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
    "<strong>Validate with a shrinking range.</strong> Recurse as <code>ok(n, lo, hi)</code> and fail unless <code>lo &lt; n.val &lt; hi</code>, then send <code>(lo, val)</code> left and <code>(val, hi)</code> right so every ancestor still constrains the grandchildren.",
    "<strong>Or walk inorder and keep the previous key.</strong> Fail as soon as <code>n.val &le; prev</code>, because a legal BST with unique keys must emit a strictly increasing sequence.",
    "<strong>Search and insert are binary search.</strong> Compare the key to the current node and step left or right; a <code>null</code> child is the hole where a new node belongs, which is why insert is <code>O(h)</code> and not a rebuild.",
    "<strong>Delete a two-child node via its successor.</strong> The successor is the minimum of the right subtree, it has no left child, so you can copy its value and then delete that easier node instead of splicing two live children.",
    "<strong>k-th smallest is inorder that stops.</strong> Count visits until you hit <code>k</code>, or store subtree sizes on each node if later queries must stay <code>O(h)</code> after inserts.",
    "<strong>LCA walks from the root using values.</strong> Step left while both keys are smaller, right while both are larger, and stop at the first node that sits between them, because that is where the two search paths split.",
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
      "<p>Search, insert, delete and BST-LCA each walk one root-to-node path, so they cost <code>O(h)</code>. On a balanced tree <code>h</code> is about <code>log n</code>, roughly 17 steps at <code>n = 10&#8309;</code>. On a skew tree the same operations become a linked-list scan of <code>n</code> steps. Validate must look at every node, so it is always <code>&Theta;(n)</code> no matter how balanced the tree is.</p>",
      "<span class=\"eq\">T_search = O(h), T_validate = &Theta;(n)</span>",
      "<p>Naive k-th smallest is an inorder walk that stops at <code>k</code>, which is <code>O(h + k)</code> and in the worst case <code>O(n)</code>. If the follow-up is many k-th queries mixed with inserts, store a subtree size on each node and the same question becomes one more <code>O(h)</code> descent. <code>TreeMap</code> hides a red-black tree and quotes <code>O(log n)</code> for all of this; a hand-rolled BST does not.</p>",
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
      bug: "A 6 sitting as the right child of 2, under a root of 4, passes every parent-child compare, so the function returns true on an illegal tree and the sample of a valid BST never exposes it.",
      fix: "Pass <code>(lo, hi)</code> from the ancestors, and use <code>long</code> sentinels so <code>Integer.MIN_VALUE</code> is still a legal key. The 4 / 2 / 6 counterexample is the test." },
    { title: "int overflow sentinels",
      bug: "Starting with <code>lo = Integer.MIN_VALUE</code> looks like \"no lower bound\", then a root whose value is also <code>MIN_VALUE</code> fails <code>lo &lt; val</code>, or you switch to <code>&le;</code> and silently accept a duplicate that the statement forbade.",
      fix: "Use <code>long lo, hi</code> with <code>Long.MIN_VALUE</code> / <code>Long.MAX_VALUE</code>, or pass boxed bounds that can be null. A one-node tree holding <code>Integer.MIN_VALUE</code> is the check." },
    { title: "Delete successor incorrectly",
      bug: "Deleting the successor from the original parent, or treating it as if it might have a left child, looks like a local pointer fix and then either loses the right subtree or leaves a second copy of the key.",
      fix: "Set <code>successor = min(right)</code>, copy <code>s.val</code> into the node, then <code>node.right = delete(node.right, s.val)</code>. The successor of a two-child node never has a left child." },
    { title: "Duplicates",
      bug: "Using <code>&le;</code> on both sides, or a validate that demands a strict <code>&lt;</code> both ways, looks consistent and then either builds a broken tree or rejects a legal policy the statement actually allowed.",
      fix: "Pick one side for equals, usually the right, and make insert, search and validate all agree. A two-node tree with equal keys is the test." },
    { title: "k-th by converting to an array always",
      bug: "Dumping inorder into a list is correct for one query and looks like the obvious answer, then the follow-up of many k-th questions mixed with inserts rebuilds the list each time and becomes linear per query.",
      fix: "Store subtree sizes, or keep a persistent inorder iterator. Time a few thousand mixed operations if the follow-up appears." },
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
      "<p>The node stores an <code>int</code>, so both <code>Integer.MIN_VALUE</code> and <code>Integer.MAX_VALUE</code> are legal keys. If you pass those same values as the initial <code>lo</code> and <code>hi</code> with <code>int</code> arithmetic, a root equal to <code>MIN_VALUE</code> fails the lower-bound test. <code>long</code> sentinels sit strictly outside the <code>int</code> range, so every legal key falls inside the first call.</p>"],
    ["Is every inorder-sorted tree a BST?",
      "<p>For unique keys, yes: the BST range rule is equivalent to inorder being strictly increasing. That does not tell you how to build the tree. An increasing inorder sequence can be laid out as a linked list or as a balanced tree; taking the midpoint of the remaining slice as the root is what gives height about <code>log n</code>.</p>"],
    ["Delete complexity?",
      "<p>You walk <code>O(h)</code> to find the node, another <code>O(h)</code> to find its successor if it has two children, and <code>O(h)</code> to splice that successor out. All of that is still <code>O(h)</code>. Repeated Hibbard deletions slowly unbalance a tree; interviews ignore that and never ask you to rebalance by hand.</p>"],
    ["LCA in BST vs general tree?",
      "<p>On a BST you walk from the root comparing values, using no extra memory beyond a few pointers, because the split point is decided by the keys. On a general binary tree the keys tell you nothing, so you use the postorder both-sides walk from the previous page, or binary lifting when there are many queries on a static tree.</p>"],
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
  dryIntro: "Range-validate the sample BST 4 / 2 5 / 1 3, then watch the same check reject a 6 that a local child compare would have accepted.",
}),

/* ====================================== 4. tree-dp-and-rerooting ====== */
pack({
  id: "tree-dp-and-rerooting",
  difficulty: "Hard",
  readTime: "30 min",
  tagline: "One DFS computes every subtree answer; a second DFS reroots, combining \"down\" " +
    "with \"the rest of the tree\" so every vertex can be treated as the root in O(n).",
  tags: ["tree DP", "rerooting", "P1"],
  prereqs: [
    ["Binary Tree Problem Patterns", "binary-tree-problem-patterns.html"],
    ["DFS & Components", "../07-graphs-core/dfs-and-components.html"],
  ],
  why: [
    "You are given a tree of 200000 vertices and asked, for every vertex, the sum of its " +
      "distances to all the others. The obvious method roots the tree at vertex 0 and walks " +
      "it, then roots it at vertex 1 and walks it again, and so on. Each walk costs a full " +
      "pass, so two hundred thousand walks are about <code>4&times;10&#8310;</code> steps and " +
      "the judge will not wait. The interview version of diameter hides the same trap: one " +
      "global number needs one walk, but \"the longest path starting at every vertex\" is " +
      "n separate questions and will not survive a naive restart.",
    "Tree DP answers the rooted version first. A <em>down</em> DFS, starting at an arbitrary " +
      "root, writes a summary of each subtree: its size, the sum of distances inside it, or " +
      "the longest downward spine. That already answers the question at the chosen root. " +
      "<em>Rerooting</em> is the second walk, and it is the whole point of this page: when " +
      "the root slides from <code>u</code> to a child <code>v</code>, you do not recompute " +
      "those subtree summaries. You recompute only the <em>outside</em> &mdash; everything " +
      "that is not in <code>v</code>'s subtree &mdash; and combine it with the down-summary " +
      "you already have. For sums that combination is a closed formula; for maxima you keep " +
      "the top two child contributions so the excluded child is not reused as its own outside.",
    "In a statement the tell is \"for every vertex\" sitting next to <code>n &le; 2&times;10&#8309;</code> " +
      "on an undirected tree of <code>n - 1</code> edges. LC 834 (sum of distances), CF 219D " +
      "(choose a capital), and \"height if we root here\" are the cluster. If the merge has " +
      "no inverse, rerooting still works, but you must rebuild the outside from siblings " +
      "instead of subtracting, which is why the top-two trick exists.",
  ],
  insight: "The down DFS answers the question as if one chosen vertex were the root. " +
    "Rerooting reuses those subtree summaries and only recomputes the outside contribution " +
    "when the root slides to a child, so every vertex's answer is constant extra work after " +
    "one linear preprocess.",
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
  constraint: "<code>n &le; 2&times;10&#8309;</code> on an undirected tree is the signature. " +
    "A recursive pair of walks can overflow on a chain, so keep an iterative DFS or raise " +
    "the stack. Answers are <code>long</code>: a sum of distances can reach about " +
    "<code>n&times;(n-1)</code>, which wraps an <code>int</code>. Root the first pass at 0 " +
    "(or 1) arbitrarily; the second pass will give every other vertex the same quality of answer.",
  core: [
    "The first walk is ordinary subtree DP. <code>dfs1(u, p)</code> skips the parent, then " +
      "for each child <code>v</code> folds <code>v</code>'s summary into <code>u</code>. For " +
      "sum of distances you store two arrays: <code>sz[u]</code> is the number of vertices " +
      "in <code>u</code>'s subtree, starting at 1 and adding each <code>sz[v]</code>, and " +
      "<code>down[u]</code> is the sum of distances from <code>u</code> to those vertices, " +
      "built as <code>down[u] += down[v] + sz[v]</code> because every node in <code>v</code>'s " +
      "subtree is one edge farther from <code>u</code> than from <code>v</code>. After this " +
      "pass, <code>ans[root] = down[root]</code> is the real answer at the chosen root, and " +
      "every <code>down[u]</code> and <code>sz[u]</code> is finished. Those two arrays are " +
      "not recomputed later.",
    "When the root moves from <code>u</code> to a child <code>v</code>, the vertices that " +
      "change distance are easy to name. Everyone in <code>v</code>'s subtree, " +
      "<code>sz[v]</code> of them, is now one closer. Everyone else, <code>n - sz[v]</code> " +
      "vertices, is now one farther. The new answer is therefore the old answer plus " +
      "<code>(n - sz[v]) - sz[v]</code>, which is <code>ans[u] + n - 2&times;sz[v]</code>. " +
      "That is the only number the second DFS writes: the outside contribution at <code>v</code>. " +
      "It does not rebuild <code>down[]</code>, and it does not recount subtree sizes. For a " +
      "maximum instead of a sum there is no subtraction, so at <code>u</code> you keep the " +
      "best and second-best child depths and give <code>v</code> whichever of those two is " +
      "not <code>v</code> itself, plus the outside already known at <code>u</code>.",
    "Take the five-node tree with edges 0-1, 1-2, 1-3, 0-4, rooted at 0. Leaves 2, 3 and 4 " +
      "have <code>sz = 1</code> and <code>down = 0</code>. Node 1 owns 2 and 3, so " +
      "<code>sz[1] = 3</code> and <code>down[1] = 2</code>. The root then has " +
      "<code>sz[0] = 5</code> and <code>down[0] = (2+3) + (0+1) = 6</code>, which is " +
      "<code>ans[0]</code>. Sliding the root to 1 changes three distances by -1 and two " +
      "(nodes 0 and 4) by +1, so <code>ans[1] = 6 + 5 - 2&times;3 = 5</code>. Sliding from 0 " +
      "to 4 changes one distance by -1 and four by +1, so <code>ans[4] = 6 + 5 - 2&times;1 = 9</code>. " +
      "Two walks, five answers, no fifth DFS.",
  ],
  invariant: "<p>After the down pass, <code>down[u]</code> is the answer on the subtree of " +
    "<code>u</code> in the first rooting. After reroot, <code>ans[u]</code> is the answer on " +
    "the whole tree as if rooted at <code>u</code>:</p>" +
    "<span class=\"eq\">ans[v] = combine(ans[u] without v's subtree, down[v])</span>" +
    "<p>In plain words, moving the root to a child does not ask you to walk the tree again; " +
    "it asks you to adjust the parent's already-known answer by the nodes that got closer " +
    "and the nodes that got farther, then keep going.</p>" +
    "<p>Interview sentence: <em>\"I precompute every subtree, then I only recompute the outside when I slide the root.\"</em></p>",
  arrayLabel: "sz[u] after down-DFS on a 5-node tree rooted at 0",
  array: [5, 3, 1, 1, 1],
  indexLabels: ["0", "1", "2", "3", "4"],
  vars: ["u", "sz", "down", "ans"],
  vizTitle: "Sum of distances: down then reroot",
  frames: [
    { note: "Root the five-node tree at 0. Each leaf has subtree size 1 and a down-sum of 0, because it can see nobody below it.",
      active: [2, 3, 4],
      values: { u: "leaves", sz: 1, down: 0, ans: "\u2014" } },
    { note: "Node 1 owns leaves 2 and 3, so its size is 3 and its down-sum is 2: each of those two nodes is one edge away.",
      active: [1],
      values: { u: 1, sz: 3, down: 2, ans: "\u2014" } },
    { note: "The root folds child 1 (down 2 plus size 3) and leaf 4 (0 plus 1) into a down-sum of 6, which is already the answer at 0.",
      active: [0],
      values: { u: 0, sz: 5, down: 6, ans: 6 } },
    { note: "Slide the root to 1: three nodes get closer and two get farther, so the answer becomes 6 + 5 - 2 times 3, which is 5.",
      active: [1],
      values: { u: 1, sz: 3, down: 2, ans: 5 } },
    { note: "Slide the root from 0 to 4 instead: one node gets closer and four get farther, so the answer becomes 6 + 5 - 2, which is 9.",
      active: [4],
      values: { u: 4, sz: 1, down: 0, ans: 9 } },
    { note: "Every vertex now has its own answer from those two walks. The down-sums were never rebuilt after the first pass.",
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
    "<strong>Build the undirected adjacency lists.</strong> A tree of <code>n</code> vertices has <code>n - 1</code> edges stored both ways, so every loop must skip the parent; root the first pass at 0 so the down summaries have a direction.",
    "<strong>Down DFS writes subtree summaries only.</strong> From the children compute <code>sz[u]</code> and <code>down[u]</code> (or the top-two depths), because those numbers are the ones the second pass will reuse rather than recompute.",
    "<strong>Seed the answer at the chosen root.</strong> Set <code>ans[root] = down[root]</code>, which is already the true whole-tree answer there and is the parent value the reroot step will adjust.",
    "<strong>Reroot by adjusting the outside.</strong> For each child, write <code>ans[v]</code> from <code>ans[u]</code> and <code>sz[v]</code> (or from the top-two depths), because sliding the root changes only who got closer and who got farther.",
    "<strong>Keep a top-two when the merge is a maximum.</strong> There is no inverse for <code>max</code>, so the excluded child's outside must come from the second-best sibling plus the parent's own outside, not from subtracting.",
    "<strong>Use long and prefer an iterative stack at <code>n = 2&times;10&#8309;</code>.</strong> A sum of distances overflows <code>int</code>, and a chain-shaped tree overflows the JVM stack long before the arithmetic does.",
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
      "<p>Each of the <code>n - 1</code> edges is walked a constant number of times across the two DFS passes. Combining a child is <code>O(1)</code> for a sum, and collecting the top two depths at a node is <code>O(deg(u))</code>, which still totals <code>O(n)</code> because the degrees of a tree sum to <code>2n - 2</code>. The naive \"root at each vertex and DFS\" is <code>&Theta;(n&#178;)</code>.</p>",
      "<span class=\"eq\">T = &Theta;(n)</span> versus naive <span class=\"eq\">&Theta;(n&#178;)</span>",
      "<p>At <code>n = 2&times;10&#8309;</code> the two linear walks are a few million edge hops, comfortable; the naive version is about <code>4&times;10&#8310;</code> hops and will time out. If the merge really needs a full multiset of child answers you pay extra (small-to-large, or a heap), but the textbook reroot of a sum or a max does not.</p>",
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
      bug: "An undirected edge is stored both ways, so a loop that treats every neighbour as a child looks like the binary-tree recursion and then recurses forever along the same edge.",
      fix: "Write <code>if (v == p) continue;</code> in every neighbour loop, both passes. A two-node tree is enough to expose the infinite walk." },
    { title: "int overflow of n*dist",
      bug: "A sum of distances can reach about <code>n&times;(n-1)</code>, so an <code>int</code> array wraps to a small wrong number that still looks like a plausible answer on the sample.",
      fix: "Store <code>down</code> and <code>ans</code> as <code>long[]</code>. A star with a 200000-leaf count is the overflow test." },
    { title: "Reroot max without top-two",
      bug: "Subtracting the child's own depth from a parent max that came from that same child looks like the sum-formula's inverse, then the child's outside becomes 0 even though a sibling spine is still there.",
      fix: "Store the best and second-best child depths at <code>u</code>, and give <code>v</code> whichever of those two is not itself. A node with two long arms is the check." },
    { title: "sz[v] after rerooting used as if still rooted at 0",
      bug: "The formula <code>ans[u] + n - 2&times;sz[v]</code> needs <code>sz[v]</code> to stay the down-subtree size from the first rooting; recomputing sizes during the second pass looks tidy and then uses the wrong closer-count.",
      fix: "Leave <code>sz[]</code> alone in <code>dfs2</code> unless you have a separate reason to rebuild it. Check that <code>ans[1]</code> on the five-node sample is 5, not 6." },
    { title: "Stack overflow",
      bug: "A path of <code>2&times;10&#8309;</code> is a legal tree, so the recursive pair of walks is correct on paper and then dies with <code>StackOverflowError</code> on the anti-recursion test.",
      fix: "Write an iterative DFS, or raise the stack, whenever the statement does not promise a bushy tree. Contests like this chain." },
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
      "<p>When the root slides from <code>u</code> to child <code>v</code>, every node in <code>v</code>'s subtree is one hop closer and every node outside that subtree is one hop farther. The closer count is <code>sz[v]</code>, the farther count is <code>n - sz[v]</code>, and the change in the sum is <code>(n - sz[v]) - sz[v]</code>, which is <code>n - 2&times;sz[v]</code>. You add that delta to <code>ans[u]</code>; you do not walk either side again.</p>"],
    ["When is rerooting impossible in O(n)?",
      "<p>When you cannot recover \"the parent's answer without this child\" in constant time or in time proportional to the degree. A merge that needs a full multiset of sibling answers forces small-to-large, a heap, or an honest <code>O(n&#178;)</code>. Sums and maxima with a top-two are the cases that stay linear.</p>"],
    ["Diameter via rerooting?",
      "<p>The height of the tree after rerooting at <code>v</code> is the eccentricity of <code>v</code>, the farthest distance from that vertex. The diameter is the maximum eccentricity, which is also <code>max(down[v] + up[v])</code> over vertices. If you only need the diameter value, two BFS (or two DFS) from a farthest vertex is shorter and does not reroot.</p>"],
    ["Weighted edges?",
      "<p>Replace each <code>+1</code> with the edge weight <code>w(u, v)</code> in the down pass. The reroot delta becomes \"minus twice the total weight of <code>v</code>'s subtree, plus the total weight of every edge\", so you track a subtree weight-sum alongside <code>sz</code>. The picture is the same: closer side loses <code>w</code>, farther side gains <code>w</code>.</p>"],
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
  dryIntro: "Sum of distances on the five-node tree 0-1-2, 1-3, 0-4: first the down-sums from root 0, then the two reroots that adjust who got closer.",
}),

/* ====================================== 5. lca-binary-lifting ========= */
pack({
  id: "lca-binary-lifting",
  difficulty: "Hard",
  readTime: "30 min",
  tagline: "Precompute the 2^k-th ancestor of every node in <code>O(n log n)</code>, then " +
    "LCA and k-th ancestor queries become <code>O(log n)</code> jumps.",
  tags: ["LCA", "binary lifting", "P1"],
  prereqs: [
    ["Tree DP & Rerooting", "tree-dp-and-rerooting.html"],
    ["Bit Manipulation", "../02-sorting-hashing-bits/bit-manipulation.html"],
  ],
  why: [
    "You are given a static tree of 200000 vertices and 200000 questions of the form \"what " +
      "is the lowest common ancestor of u and v?\", or \"how far is u from v?\", or \"what " +
      "is the k-th node on the path?\". The interview LCA on a binary tree is one DFS and " +
      "dies here: walking parents one step at a time can take 200000 hops per question, and " +
      "a batch of that size is about <code>4&times;10&#8310;</code> steps. You need a way to " +
      "climb many edges in one pointer hop.",
    "That is what the table <code>up[k][v]</code> is for. It holds the ancestor of <code>v</code> " +
      "that sits exactly <code>2<sup>k</sup></code> steps toward the root: <code>up[0][v]</code> " +
      "is the parent, <code>up[1][v]</code> is the grandparent, <code>up[2][v]</code> is four " +
      "steps up, and so on. The reason those particular ancestors are enough is that any climb " +
      "of <code>d</code> steps has a binary representation, so <code>d</code> is a sum of " +
      "distinct powers of two. Once every power-of-two ancestor is stored, a climb of " +
      "<code>d</code> steps is at most twenty pointer hops instead of <code>d</code> of them. " +
      "You build the table by doubling: the <code>2<sup>k</sup></code> ancestor is the " +
      "<code>2<sup>k-1</sup></code> ancestor of the <code>2<sup>k-1</sup></code> ancestor.",
    "The same jumps answer k-th ancestor and, with a payload stored next to each jump, the " +
      "max or gcd of the edges you skipped. Euler-tour RMQ is the other LCA and is faster " +
      "when you only need the meeting node; lifting is the one you reach for when the " +
      "statement also wants a path aggregate. The tell in a contest is " +
      "<code>n, q &le; 2&times;10&#8309;</code> on a static tree, plus distance, k-th, or " +
      "path-min language.",
  ],
  insight: "Any climb of d steps is a sum of distinct powers of two, so <code>up[k][v]</code> " +
    "stores the ancestor exactly <code>2<sup>k</sup></code> steps up and a query jumps those " +
    "bits. LCA equalises depth, then lifts both nodes while their <code>2<sup>k</sup></code> " +
    "parents still differ, then takes the parent.",
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
  constraint: "<code>n, q &le; 2&times;10&#8309;</code> is the textbook pair. Take " +
    "<code>LOG = 18</code> or 20, because <code>2<sup>18</sup> = 262144</code> already covers " +
    "the limit. The table is <code>int[LOG][n]</code> (or the swapped layout), about 16 MB " +
    "of integers at <code>n = 2&times;10&#8309;</code> and 20 rows. The root's parent is " +
    "<code>-1</code> or the root itself; whichever you pick, jumping past the root must be " +
    "defined so <code>up[k][-1]</code> is never read.",
  core: [
    "One DFS from the root fills <code>depth[v]</code> and the first row of the table: " +
      "<code>up[0][v]</code> is the parent of <code>v</code>, the ancestor one step up. That " +
      "row is the reason the rest of the table exists at all. The doubling loop then sets " +
      "<code>up[k][v] = up[k-1][up[k-1][v]]</code> for <code>k = 1, 2, &hellip;</code>: to " +
      "jump <code>2<sup>k</sup></code> steps you jump <code>2<sup>k-1</sup></code> twice. " +
      "If a midpoint is <code>-1</code> you keep <code>-1</code>, which is how a short tree " +
      "stays well-defined. After this preprocess, climbing <code>h</code> steps from a node " +
      "is a loop over the bits of <code>h</code>: when bit <code>k</code> is set, replace " +
      "the node by <code>up[k][node]</code>.",
    "LCA uses that climb twice. First swap so <code>u</code> is at least as deep as " +
      "<code>v</code>, then lift <code>u</code> by <code>depth[u] - depth[v]</code> so the " +
      "two nodes sit at the same depth. If they are now equal, the deeper one was under the " +
      "shallower and you are done. Otherwise walk <code>k</code> from <code>LOG-1</code> down " +
      "to 0 and, whenever <code>up[k][u]</code> still differs from <code>up[k][v]</code>, " +
      "jump both. You must go from the high bit downward: a low-bit jump first can overshoot " +
      "the meeting point and land on two different ancestors that later cannot resync. When " +
      "the loop ends the two nodes are the children of the LCA, so the answer is " +
      "<code>up[0][u]</code>. Distance is then <code>depth[u] + depth[v] - 2&times;depth[lca]</code>.",
    "On the sample tree 0-1-2, 1-3, 0-4 the depths are <code>[0, 1, 2, 2, 1]</code> and " +
      "<code>up[0]</code> is <code>[-1, 0, 1, 1, 0]</code>. Doubling fills " +
      "<code>up[1][2] = up[0][1] = 0</code> and <code>up[1][3] = 0</code>, the grandparents. " +
      "LCA(2, 3): depths already match and the nodes differ, <code>up[1]</code> of both is 0 " +
      "so you do not jump 2, <code>up[0]</code> of both is 1 so you do not jump 1 either, " +
      "and you return that parent 1. LCA(2, 4): lift 2 by one step to 1, 1 is not 4, both " +
      "parents are 0, return 0. Distance 2 to 4 is <code>2 + 1 - 0 = 3</code>, the path 2-1-0-4. " +
      "The 2nd ancestor of 2 is a single jump of bit 1, which lands on 0.",
  ],
  invariant: "<p><code>up[k][v]</code> is the ancestor of <code>v</code> sitting exactly " +
    "<code>2<sup>k</sup></code> steps toward the root (or <code>-1</code> / the root if the " +
    "climb runs out). LCA is the deepest node that is an ancestor of both arguments:</p>" +
    "<span class=\"eq\">lca(u,v) = first common ancestor; dist = d[u]+d[v]-2 d[lca]</span>" +
    "<p>In plain words, you never walk one parent at a time: you keep a list of \"skip 1, " +
    "skip 2, skip 4, skip 8, &hellip;\" pointers so any climb is a handful of those skips, " +
    "and the meeting node is what is left after the two nodes have been skipped up to just " +
    "below it.</p>" +
    "<p>Interview sentence: <em>\"up[k][v] is the 2^k-th parent; I equalise depth, then jump while parents differ.\"</em></p>",
  arrayLabel: "depth[v] on the sample tree rooted at 0",
  array: [0, 1, 2, 2, 1],
  indexLabels: ["0", "1", "2", "3", "4"],
  vars: ["u-v", "depthGap", "jump", "lca"],
  vizTitle: "LCA(2,3): both depth 2, parent 1 is the LCA",
  frames: [
    { note: "On 0-1-2, 1-3, 0-4 the depths are 0,1,2,2,1. The first row up[0] is just the parent of each node, so 2 and 3 both point at 1.",
      values: { "u-v": "prep", depthGap: "\u2014", jump: "up[0]", lca: "\u2014" } },
    { note: "Doubling fills up[1][v], the ancestor two steps up. Nodes 2 and 3 both land on the root 0; nodes with no grandparent stay at -1.",
      values: { "u-v": "doubling", depthGap: "\u2014", jump: "up[1]", lca: "\u2014" } },
    { note: "LCA(2,3): depths already match and the nodes differ. Their two-step parents agree, their one-step parents agree, so the answer is that shared parent 1.",
      active: [2, 3],
      values: { "u-v": "2,3", depthGap: 0, jump: "none", lca: 1 } },
    { note: "LCA(2,4): lift 2 by one step to 1 so the depths match. 1 is not 4, both parents are 0, and that parent is the answer.",
      active: [2, 4],
      values: { "u-v": "2,4", depthGap: 1, jump: "2->1", lca: 0 } },
    { note: "Distance 2 to 4 is depth 2 plus depth 1 minus twice the LCA depth 0, which is 3, the path 2-1-0-4.",
      best: [0, 1, 2, 4],
      values: { "u-v": "dist", depthGap: "\u2014", jump: "\u2014", lca: "3 hops" } },
    { note: "The 2nd ancestor of 2 is a single jump of bit 1, value 2, which reads up[1][2] and lands on the root 0.",
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
    "<strong>DFS from the root fills depth and the parent row.</strong> Set <code>up[0][v]</code> to the parent (and the root's parent to <code>-1</code> or itself) because every later jump is defined in terms of that first row.",
    "<strong>Double to fill the rest of the table.</strong> <code>up[k][v] = up[k-1][up[k-1][v]]</code> with a guard on <code>-1</code>, so a jump of <code>2<sup>k</sup></code> is two jumps of <code>2<sup>k-1</sup></code> and you never index <code>up[k][-1]</code>.",
    "<strong>Equalise depth before comparing nodes.</strong> Lift the deeper node by the depth gap, using the bits of that gap, so the two arguments sit at the same level and a later joint jump cannot miss the meeting point.",
    "<strong>If they coincide after the lift, that node is the LCA.</strong> The deeper argument sat inside the shallower one's subtree, and there is nothing left to jump.",
    "<strong>Walk bits from high to low and jump while parents differ.</strong> A low-bit jump first can overshoot the LCA; the high-to-low order keeps both nodes just below the meeting point.",
    "<strong>Return the parent of either node.</strong> After the loop they are the two children of the LCA (or the same child twice), so <code>up[0][u]</code> is the answer and distance is the usual depth formula.",
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
      "<p><code>LOG</code> is <code>ceil(log2 n)</code>, about 18 at <code>n = 2&times;10&#8309;</code>. Filling <code>up[k][v]</code> writes one integer per pair <code>(k, v)</code>, so the preprocess is <code>n&times;LOG</code> assignments, a few million. A query equalises depth with at most <code>LOG</code> jumps and then does at most <code>LOG</code> more, so one LCA is a few dozen pointer reads.</p>",
      "<span class=\"eq\">T_build = O(n log n), T_q = O(log n)</span>",
      "<p>A batch of <code>q = 2&times;10&#8309;</code> queries is a few million jumps, comfortable. Walking parents one step at a time on a chain is <code>O(n)</code> per query and about <code>4&times;10&#8310;</code> steps in the same batch. Euler tour plus a sparse table answers LCA in <code>O(1)</code> after the same <code>n log n</code> preprocess, with heavier constants and no natural hook for a path max; lifting wins when you also need a payload.</p>",
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
      bug: "Reading <code>up[k][-1]</code>, or treating the root's parent as 0 in a 0-based tree, looks like a finished table and then indexes garbage or wraps to a random node on a short climb.",
      fix: "Store <code>-1</code> and skip when the midpoint is negative, or set the root's parent to itself so jumps stay put. A query that asks for the 10th ancestor of a depth-2 node is the test." },
    { title: "Returning u after the loop instead of up[0][u]",
      bug: "The high-to-low walk is designed to stop at the children of the LCA, so returning <code>u</code> looks like you finished the loop and then reports a child instead of the meeting node.",
      fix: "After equalising, if <code>u == v</code> return <code>u</code>; otherwise jump while parents differ and return <code>up[0][u]</code>. LCA(2, 3) on the sample must be 1, not 2." },
    { title: "Filling up[k] inside DFS before children set up[k-1]",
      bug: "A nested <code>k</code>-loop that reads <code>up[k-1][parent]</code> before that parent has been doubled looks like the same recurrence and then writes -1 or a stale parent into later rows.",
      fix: "Fill every <code>k</code> for the current node after <code>up[0]</code> is set and before recursing to children, or run one global doubling loop after the whole DFS. Either order is safe; mixing them is not." },
    { title: "depth not set when lifting",
      bug: "Skipping the DFS leaves every depth at 0, so the equalise step never lifts and LCA of two distant leaves reports a nonsense meeting point that still type-checks.",
      fix: "Run one DFS from the statement's true root (often 1, sometimes 0) and set <code>depth[child] = depth[u] + 1</code>. Print the depth array on the sample before any query." },
    { title: "1-based nodes, 0-based table",
      bug: "Nodes labelled 1..n stored in an array of length n make index n throw, and the same bug looks like an off-by-one only on the last vertex.",
      fix: "Allocate <code>n+1</code> and ignore index 0, or remap labels to <code>0..n-1</code> at the input boundary and stay consistent in every array." },
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
      "<p>Equalising a known height <code>h</code> uses the bits of <code>h</code>, and any order works because you are jumping an exact distance you already computed. The LCA loop is different: you do not know the remaining distance, you only know whether a trial jump of <code>2<sup>k</sup></code> would land on two different ancestors. A low-bit jump first can overshoot the meeting point and leave the two nodes on different branches that later bits cannot bring back together. High-to-low never steps past the LCA.</p>"],
    ["Virtual trees?",
      "<p>Sort a subset of important nodes by their DFS enter times, take LCA of each consecutive pair, and stack-build the compressed tree that contains only those nodes and their meeting points. Binary lifting (or Euler+RMQ) supplies those LCAs. The compressed tree has size linear in the subset, which is why DP on a few marked vertices becomes affordable.</p>"],
    ["Weighted distance?",
      "<p>During the same DFS that fills <code>up[0]</code>, store <code>distRoot[v]</code> as the distance from the root to <code>v</code>. Then <code>dist(u, v) = distRoot[u] + distRoot[v] - 2&times;distRoot[lca]</code>. Sum is invertible, so you do not need a payload on the jumps; max or gcd on the path still does.</p>"],
    ["LOG = 20 vs 18?",
      "<p><code>2<sup>18</sup> = 262144</code>, so <code>n = 2&times;10&#8309;</code> needs 18 rows. 20 is a safe default you can type without thinking. 31 wastes a row per node for no query you will ever make: that is <code>n&times;31</code> integers, about 25 MB, for climbs that 20 already cover.</p>"],
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
  dryIntro: "Build the doubling table on 0-1-2, 1-3, 0-4, then walk LCA(2,3), LCA(2,4), the distance formula, and a 2-step ancestor jump.",
}),

/* ====================================== 6. euler-tour-subtree-queries */
pack({
  id: "euler-tour-subtree-queries",
  difficulty: "Hard",
  readTime: "30 min",
  tagline: "tin[v]..tout[v] is a contiguous segment of a flattened DFS, so subtree sum / " +
    "add becomes a Fenwick range on that segment.",
  tags: ["Euler tour", "subtree", "tin tout", "P1"],
  prereqs: [
    ["LCA & Binary Lifting", "lca-binary-lifting.html"],
    ["Fenwick Tree", "../06-range-queries/fenwick-tree.html"],
  ],
  why: [
    "You are given a tree of 200000 vertices and 200000 operations of the form \"add 5 to " +
      "every node in the subtree of v\" or \"what is the sum of the subtree of v?\". The " +
      "obvious method walks that subtree each time. A star with the query vertex at the " +
      "centre makes every walk cost the whole tree, so the batch is about " +
      "<code>4&times;10&#8310;</code> steps. Putting a Fenwick tree on the vertex labels " +
      "does not help either: the subtree of vertex 7 is not the slice of ids from 7 to " +
      "something, because the labels arrived in input order, not in ancestor order.",
    "An <em>Euler tour</em> of the tree, in the node-only sense used here, is the sequence " +
      "of vertices in the order a DFS first enters them. The reason a subtree becomes a " +
      "contiguous interval is physical, not magical. DFS enters <code>v</code>, then visits " +
      "everything reachable below <code>v</code>, and only then returns to <code>v</code>'s " +
      "parent. Nothing from outside that subtree can be entered in between, because the only " +
      "door out is the edge back to the parent. So the enter times of <code>v</code> and its " +
      "descendants form a consecutive block of integers <code>[tin[v], tout[v]]</code>. A " +
      "point add plus a subtree sum is then a Fenwick on that block; a subtree add plus a " +
      "point query is a range-add on the same block.",
    "The same two timestamps give an ancestry test for free: <code>u</code> is an ancestor " +
      "of <code>v</code> exactly when <code>tin[u] &le; tin[v] &le; tout[u]</code>. They are " +
      "also the first numbering HLD, virtual trees and Mo on trees reuse. In a statement the " +
      "tell is a static tree shape, values that change, subtree (not path) operations, and " +
      "<code>n, q &le; 2&times;10&#8309;</code>. CF 620E, 383C and 877E are the cluster. Path " +
      "queries need HLD or a difference at the LCA; they are not one interval in this flattening.",
  ],
  insight: "DFS enter times make every subtree a contiguous range, because the walk finishes " +
    "a node's descendants before it is allowed to leave. Put a Fenwick (or segment tree) on " +
    "those times, not on the vertex labels.",
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
  constraint: "<code>n, q &le; 2&times;10&#8309;</code> is the usual pair. Enter times sit in " +
    "<code>0..n-1</code> (or <code>1..n</code>); the Fenwick is size <code>n+2</code> so a " +
    "range-add's off-the-end decrement still fits. A chain of 200000 nodes will overflow a " +
    "recursive tour, so assign <code>tin</code> with an iterative stack when balance is not " +
    "promised. The tree shape is static; if edges are added or deleted this numbering dies.",
  core: [
    "A single counter <code>timer</code> starts at 0. <code>dfs(u, p)</code> writes " +
      "<code>tin[u] = timer++</code> on entry, recurses to every child except the parent, " +
      "and on the way out writes <code>tout[u] = timer - 1</code>. Because the timer only " +
      "moves forward, and because every descendant is entered before that last assignment, " +
      "the inclusive interval <code>[tin[u], tout[u]]</code> is exactly <code>u</code> plus " +
      "its descendants. If you prefer a half-open convention, set <code>tout[u] = timer</code> " +
      "after the children and treat the subtree as <code>[tin[u], tout[u])</code>; mixing the " +
      "two conventions is the classic off-by-one. Either way, the flattened array of length " +
      "<code>n</code> is a permutation of the vertices.",
    "A Fenwick (or segment tree) is then indexed by <code>tin</code>, never by the original " +
      "label. Point-add at vertex <code>v</code> is <code>add(tin[v], delta)</code>. Subtree " +
      "sum is the range <code>[tin[v], tout[v]]</code>. The dual, subtree-add plus point-query, " +
      "is a range-add on that same interval and a prefix read at <code>tin[v]</code>. Ancestry " +
      "does not even need the Fenwick: <code>u</code> is an ancestor of <code>v</code> when " +
      "<code>tin[u] &le; tin[v]</code> and <code>tout[v] &le; tout[u]</code>. A true Euler " +
      "tour that records a vertex on enter and on leave has length <code>2n-1</code> and is " +
      "the other numbering, used for RMQ-LCA, not for these subtree ranges.",
    "On the sample 0-1-2, 1-3, 0-4 the tour enters 0 (<code>tin=0</code>), then 1 " +
      "(<code>tin=1</code>), then leaf 2 (<code>tin=2</code>, <code>tout=2</code>), then leaf 3 " +
      "(<code>tin=3</code>, <code>tout=3</code>). Leaving 1 writes <code>tout[1] = 3</code>, so " +
      "the subtree of 1 is the block of indices 1..3, which is exactly the set {1, 2, 3}. " +
      "Leaf 4 takes index 4, and leaving 0 writes <code>tout[0] = 4</code>, the whole tree. " +
      "A Fenwick range <code>[1, 3]</code> is the subtree sum of 1; adding 10 at node 2 " +
      "touches only index 2 and that range becomes 13 if every value started at 1. Vertex 0 " +
      "is an ancestor of 3 because 0 sits at or before 3's enter time and 0's leave covers it.",
  ],
  invariant: "<p>The subtree of <code>v</code>, written in DFS enter order, occupies one " +
    "contiguous index interval, because the walk is not allowed to leave <code>v</code> until " +
    "every descendant has been entered:</p>" +
    "<span class=\"eq\">subtree(v) = { u | tin[v] &le; tin[u] &le; tout[v] }</span>" +
    "<p>In plain words, the numbers you stamp on the way in are just a relabelling that " +
    "makes \"below me\" look like a slice of an array, so every Fenwick or segment-tree trick " +
    "you already know applies to subtrees.</p>" +
    "<p>Interview sentence: <em>\"I flatten by enter time so a subtree is [tin, tout]; the Fenwick indexes tin, not the label.\"</em></p>",
  arrayLabel: "tin[v] then the flattened order",
  array: [0, 1, 2, 3, 4],
  indexLabels: ["0", "1", "2", "3", "4"],
  vars: ["u", "tin", "tout", "flat"],
  vizTitle: "Euler numbering on 0-1-2, 1-3, 0-4",
  frames: [
    { note: "Enter 0 first and stamp tin[0] = 0. The walk must finish every descendant of 0 before it is allowed to leave, so the remaining stamps will be a single block.",
      active: [0],
      values: { u: 0, tin: 0, tout: "\u2014", flat: "[0]" } },
    { note: "Enter 1 next and stamp tin[1] = 1. Everything still below 1 will receive the next consecutive times, because the walk cannot return to 0 yet.",
      active: [1],
      values: { u: 1, tin: 1, tout: "\u2014", flat: "[0,1]" } },
    { note: "Leaf 2 takes time 2 and immediately writes tout[2] = 2. Leaf 3 takes time 3 the same way. No outsider has been entered between them.",
      active: [2, 3],
      values: { u: 2, tin: 2, tout: 2, flat: "[0,1,2,3]" } },
    { note: "Leaving 1 writes tout[1] = 3. The subtree of 1 is now the contiguous block of indices 1 through 3, which is exactly the set {1, 2, 3}.",
      window: [1, 3],
      values: { u: 1, tin: 1, tout: 3, flat: "sub 1" } },
    { note: "Enter leaf 4 at time 4, then leave the root with tout[0] = 4. The whole tree is the interval [0, 4] and every subtree is some sub-block of it.",
      active: [4],
      values: { u: 4, tin: 4, tout: 4, flat: "[0,1,2,3,4]" } },
    { note: "A Fenwick range [1, 3] is the subtree sum of 1. Vertex 0 is an ancestor of 3 because 3's enter time sits inside 0's interval.",
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
    "<strong>Stamp enter time before the children, leave time after.</strong> <code>tin[u] = timer++</code> on the way in and <code>tout[u] = timer - 1</code> on the way out, so the inclusive interval is exactly the descendants and nothing else.",
    "<strong>Build a Fenwick of size n indexed by tin.</strong> Vertex labels are an arbitrary permutation; only the enter-time order makes a subtree look like a slice, which is why the tree sits on <code>tin</code>.",
    "<strong>Point-add at a vertex writes at its enter time.</strong> <code>bit.add(tin[v], delta)</code> updates one cell, and every ancestor range that covers that cell sees the new value on the next query.",
    "<strong>Subtree sum is one range read.</strong> <code>bit.range(tin[v], tout[v])</code> covers <code>v</code> and its descendants because that is precisely the block the DFS stamped for them.",
    "<strong>Subtree add plus point query is the dual.</strong> Range-add on <code>[tin[v], tout[v]]</code> and read the prefix at <code>tin[u]</code>, so a later point query at a descendant sees the add and a node outside the block does not.",
    "<strong>Keep tout even if you only planned sums.</strong> Ancestry is the interval test <code>tin[u] &le; tin[v] &le; tout[u]</code>, and several later techniques (HLD, virtual trees) reuse the same pair of stamps.",
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
      "<p>The DFS assigns each of the <code>n</code> vertices one enter time, which is a linear pass. Each Fenwick update or range query walks about <code>log n</code> cells, around 18 at <code>n = 2&times;10&#8309;</code>. A batch of <code>q = 2&times;10&#8309;</code> operations is a few million cell writes, comfortable. Walking a subtree per query is <code>O(|subtree|)</code> and becomes about <code>4&times;10&#8310;</code> visits when every query hits the root.</p>",
      "<span class=\"eq\">T_prep = O(n), T_op = O(log n)</span>",
      "<p>Path queries are not an interval in this flattening: the path from <code>u</code> to <code>v</code> is two root-paths glued at the LCA, so a single <code>[tin, tout]</code> is the wrong set. Those need HLD, or a difference array at <code>u</code>, <code>v</code> and the LCA, not a second Euler numbering.</p>",
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
      bug: "Writing <code>tout = timer</code> after the children and then calling an inclusive <code>range(tin, tout)</code> looks consistent, then either drops the last descendant or includes the next sibling, and the sample of a one-child tree still happens to pass.",
      fix: "Pick one convention and stick to it: <code>tout = timer - 1</code> inclusive, or half-open <code>[tin, tout)</code>. Draw the five-node sample and check that subtree 1 is exactly {1, 2, 3}." },
    { title: "Fenwick on vertex id instead of tin",
      bug: "Indexing the Fenwick by the input label looks like the obvious map, and a lucky labelling where the subtree of 1 is {1, 2, 3} makes the sample green, then a different numbering makes the same range cover strangers.",
      fix: "Always index by <code>tin[v]</code>. Print both the label and the enter time on the sample before the first query." },
    { title: "Updating val[v] without adding at tin[v]",
      bug: "Writing into a parallel <code>val[]</code> array looks like you stored the new value, but the Fenwick still holds the old number and every later subtree sum is stale.",
      fix: "Translate the update as <code>add(tin[v], newVal - oldVal)</code>, or rebuild that cell with two adds. Query the same subtree immediately after the write." },
    { title: "Root's parent edge in an undirected list causing a second DFS into the parent",
      bug: "Forgetting <code>if (v == p) continue</code> looks like the binary-tree recursion and then either assigns <code>tin</code> twice, blows the timer past <code>n</code>, or recurses forever.",
      fix: "Skip the parent in the tour, the same guard as every other undirected tree DFS. A two-node tree exposes it at once." },
    { title: "Using this flattening for path u-v",
      bug: "A path is two intervals glued at the LCA, so treating it as <code>[tin[u], tin[v]]</code> looks like \"the nodes between them\" and then sums a block of unrelated descendants.",
      fix: "Use HLD, or a difference array at <code>u</code>, <code>v</code> and the LCA according to the operation. The five-node sample path 2-1-0-4 is not the interval [2, 4]." },
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
      "<p>Yes: <code>u</code> is an ancestor of <code>v</code> exactly when <code>tin[u] &le; tin[v] &le; tout[u]</code>. That is the same interval fact that makes subtree sums work, which is why you should still store <code>tout</code> even if the statement only asked for sums. Two integer compares, no Fenwick, no walk.</p>"],
    ["Path add, point query without HLD?",
      "<p>Put a difference on the root-path: add <code>+x</code> at the node and subtract <code>x</code> at the parent of the LCA (the exact endpoints depend on whether the LCA is included). A subtree-sum of those diffs, which is Euler plus a Fenwick, reconstructs the point value. It is a common CF trick and still uses this flattening; it is not a claim that a path is one interval.</p>"],
    ["tin unique?",
      "<p>In the node-only flattening each vertex is entered once, so <code>tin</code> is a permutation of <code>0..n-1</code>. The true Euler tour used for RMQ-LCA records a vertex on enter and after every child, has length <code>2n-1</code>, and stores <code>first[v]</code> as the first index of <code>v</code> in that longer sequence. Subtree queries want the short numbering; LCA-as-RMQ wants the long one.</p>"],
    ["HLD connection?",
      "<p>Heavy-light decomposition also turns some paths into intervals, but the numbering is different: it compresses heavy paths, not whole subtrees. The first step of HLD still runs a DFS for subtree sizes, and that DFS can stamp <code>tin</code>/<code>tout</code> at the same time. Euler alone is the lighter tool when every query is a whole subtree and you do not need an arbitrary path.</p>"],
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
  dryIntro: "Stamp enter and leave times on 0-1-2, 1-3, 0-4, then watch the subtree of 1 become the contiguous block of indices 1 through 3.",
}),

/* ====================================== 7. trie ======================= */
pack({
  id: "trie",
  difficulty: "Medium",
  readTime: "28 min",
  tagline: "A tree of prefixes: each edge is a character, insert/search/startsWith are " +
    "<code>O(|s|)</code>, and the same walk powers word-search II and autocomplete.",
  tags: ["trie", "prefix tree", "P0"],
  prereqs: [["Binary Tree Basics & Traversals", "binary-tree-basics-and-traversals.html"]],
  why: [
    "You are given 100000 words and asked, after each insertion, whether any stored word " +
      "starts with a given prefix. A <code>HashSet</code> answers exact equality in time " +
      "proportional to the query string, which is fine, and then a prefix question forces you " +
      "to scan every word. A hundred thousand words of length 20 is two million character " +
      "compares per prefix query; a few thousand of those queries will not finish. You need " +
      "a structure that shares the common start of <code>app</code>, <code>ape</code> and " +
      "<code>apple</code> so the prefix <code>ap</code> is one walk, not a scan.",
    "A <em>trie</em>, also called a prefix tree, is that structure. Each edge is one " +
      "character, and the path from the root to a node spells the prefix that node represents. " +
      "Words that share a start share the same path, so the whole dictionary occupies " +
      "memory proportional to the total number of characters, not to the number of prefixes " +
      "written out as strings. Insert, exact search and starts-with are each one walk of " +
      "length equal to the query. LC 208 is that API. Word Search II walks the board and the " +
      "trie in lockstep and prunes when the next cell has no child; autocomplete and replace-words " +
      "are the same walk with a different payload on a terminal node.",
    "The implementation choice is <code>next[26]</code> versus a <code>HashMap</code> of " +
      "children. Interviews want the array for lowercase English. A count on each node, " +
      "how many inserted words pass through it, is what lets you delete without pulling the " +
      "rug from under a sibling. In a statement the tell is \"starts with\", \"prefix\", " +
      "\"dictionary of words\", or a board search over many patterns, with total characters " +
      "around <code>10&#8309;</code>. Maximum XOR of numbers is the next page, a 2-child trie " +
      "on bits, not this 26-way tree.",
  ],
  insight: "A trie node is the set of stored strings that share one prefix. The child labelled " +
    "<code>c</code> is that prefix extended by <code>c</code>, and a terminal flag (or a count) " +
    "marks the prefix that is itself a complete word.",
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
  constraint: "Total characters around <code>10&#8309;</code> is the everyday limit, and a " +
    "<code>next[26]</code> array per node is acceptable memory. Alphabet size multiplies " +
    "that memory, so a huge alphabet wants a map of children instead. Word Search II is a " +
    "4-way board DFS of depth up to 10, pruned by the trie; without the prune it is " +
    "<code>4<sup>L</sup></code> and will time out on a 12-by-12 board even when the dictionary " +
    "is tiny.",
  core: [
    "A node holds <code>Node[] next = new Node[26]</code>, a boolean <code>term</code>, and " +
      "optionally an integer <code>cnt</code> of words that pass through it. Insert starts at " +
      "the root and, for each character <code>ch</code>, computes <code>i = ch - 'a'</code>. " +
      "If <code>next[i]</code> is null it allocates a fresh node, then steps into it and " +
      "increments <code>cnt</code>. After the last character it sets <code>term = true</code>. " +
      "Search is the same walk and returns false on a missing child; if the walk finishes it " +
      "returns <code>term</code>, not true. Starts-with is the same walk and returns true as " +
      "soon as the walk finishes, whether or not that node is terminal. Mixing those two " +
      "return values is the classic LC 208 bug.",
    "Word Search II builds a trie of the word list first. The board DFS carries a trie " +
      "pointer alongside the cell: if the next letter has no child, that branch is dead and " +
      "you return. Landing on a terminal node emits the word and, to avoid duplicates, you " +
      "can clear <code>term</code> or delete a now-empty leaf. The cell itself must be marked " +
      "(commonly with <code>'#'</code>) and restored after the four recursive calls, or a " +
      "word can reuse the same square and invent a loop. Autocomplete is simpler: walk the " +
      "prefix, then explore the small subtree under that node.",
    "Insert <code>app</code> then <code>ape</code>. The first word creates the path " +
      "<code>a &rarr; p &rarr; p</code> and marks the last <code>p</code> terminal. The second " +
      "reuses <code>a &rarr; p</code> and creates a sibling <code>e</code>, also terminal. " +
      "Search <code>ape</code> walks three edges and finds <code>term</code> true. Search " +
      "<code>ap</code> lands on the shared <code>p</code>, where <code>term</code> is still " +
      "false unless you also inserted <code>ap</code>. Starts-with <code>ap</code> does that " +
      "same walk and returns true because the node exists. Search <code>apple</code> dies " +
      "when the next letter <code>l</code> has no child. Two words, five nodes, one shared " +
      "prefix of length 2.",
  ],
  invariant: "<p>The path from the root to a node spells a prefix of at least one inserted " +
    "word. <code>term</code> (or an end-count) is true exactly when that prefix is itself a " +
    "complete word:</p>" +
    "<span class=\"eq\">search(s) = walk(s) lands on a node with term = true</span>" +
    "<p>In plain words, sharing a prefix means sharing a path, and \"is this a word\" is a " +
    "flag on the last node, not the mere fact that the path exists.</p>" +
    "<p>Interview sentence: <em>\"I walk one edge per character; search needs term, startsWith only needs the node.\"</em></p>",
  arrayLabel: "nodes visited inserting \"app\" then \"ape\" (letter indices)",
  array: ["", "a", "p", "p", "e"],
  vars: ["word", "ch", "node", "term"],
  vizTitle: "Insert app, ape; search ape; startsWith ap",
  frames: [
    { note: "The trie starts as a bare root. Inserting app creates the path a, p, p and marks only the last p as a complete word.",
      active: [1, 2, 3],
      values: { word: "app", ch: "p", node: "app", term: true } },
    { note: "Inserting ape reuses the shared prefix a, p and hangs a new sibling e, also marked terminal. Two words now share those first two nodes.",
      active: [1, 2, 4],
      values: { word: "ape", ch: "e", node: "ape", term: true } },
    { note: "search(\"ape\") walks a, then p, then e and lands on a node whose term flag is true, so the exact word is present.",
      best: [4],
      values: { word: "ape", ch: "e", node: "ape", term: "found" } },
    { note: "search(\"ap\") lands on the shared p, where term is still false because ap itself was never inserted, so exact search returns false.",
      active: [2],
      values: { word: "ap", ch: "p", node: "ap", term: false } },
    { note: "startsWith(\"ap\") does that same walk and returns true because the node exists. The term flag is not consulted for a prefix query.",
      active: [1, 2],
      values: { word: "ap", ch: "p", node: "ap", term: "prefix ok" } },
    { note: "search(\"apple\") follows app and then looks for l, finds no child, and returns false without inventing a node.",
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
    "<strong>Give each node a 26-slot array, a term flag, and an optional count.</strong> The array is the alphabet; the flag is what distinguishes a finished word from a mere prefix, which is why both fields exist.",
    "<strong>Insert by creating a child only when it is missing.</strong> Step one character at a time, increment <code>cnt</code> if you will later delete, and set <code>term</code> on the last node so a later exact search has something to read.",
    "<strong>Exact search returns the term flag, not the existence of the path.</strong> A missing child is false; a finished walk still asks <code>term</code>, or <code>search(\"ap\")</code> after inserting <code>apple</code> comes back true by mistake.",
    "<strong>Starts-with is the same walk without the flag.</strong> If every edge existed, the prefix is in the dictionary, which is the whole point of sharing paths.",
    "<strong>Board search carries a trie pointer next to the cell.</strong> A missing child prunes that 4-way branch; a terminal node emits a word; the cell is marked and restored so one word cannot reuse the same square.",
    "<strong>Do not store the whole string on every node.</strong> Reconstruct it from the walk, or hang one <code>String</code> on terminal nodes only, because copying lists per insert is linear in the dictionary size.",
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
      "<p>Each character of each word creates at most one new node, and a shared prefix creates none. Insert, search and starts-with therefore walk exactly <code>|s|</code> edges. Memory is proportional to the total number of characters (times 26 pointers in the array implementation). A dictionary of 100000 words of length 10 is about a million nodes in the worst case, comfortable.</p>",
      "<span class=\"eq\">T(insert) = O(|s|), S = O(&Sigma; |s_i|)</span>",
      "<p>A <code>HashSet</code> of the words is also <code>O(|s|)</code> for exact search, but a prefix query scans every word and becomes <code>O(n |s|)</code>: two million compares per query at the usual limit. The trie makes that prefix <code>O(|s|)</code>. Word Search II is a 4-way DFS whose branches die when the trie has no child, which is what keeps <code>4<sup>L</sup></code> from exploding.</p>",
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
      bug: "Returning true from search whenever the walk finishes looks like starts-with, so <code>search(\"ap\")</code> after inserting <code>apple</code> is true and LC 208's two methods silently share one implementation.",
      fix: "Exact search requires <code>term</code>; starts-with does not. Insert only <code>apple</code> and assert both answers, they must differ." },
    { title: "Not creating nodes on insert",
      bug: "Stepping into <code>next[c]</code> without allocating looks fine on a second insert that reuses a prefix, then the first insert of a new letter throws or drops the rest of the word.",
      fix: "Write <code>if (cur.next[c] == null) cur.next[c] = new Node();</code> before the step. A first insert of a two-letter word is the test." },
    { title: "Word Search II without marking the cell",
      bug: "Leaving the cell live looks like \"the board did not change\", then a 4-way DFS re-enters the same square and invents a word that loops through one letter twice.",
      fix: "Set <code>board[r][c] = '#'</code>, recurse, then restore the letter. A 1-by-2 board with word <code>aa</code> is the check." },
    { title: "26 vs 'A'",
      bug: "Subtracting <code>'a'</code> from an uppercase letter or from a punctuation mark produces a negative index, so the first non-lowercase input throws and the lowercase sample never saw it.",
      fix: "Normalise to lowercase, or use a map. Guard that the index sits in <code>0..25</code> before you touch <code>next</code>." },
    { title: "Storing List&lt;String&gt; on every node",
      bug: "Copying the list of words that share a prefix into each child looks convenient for autocomplete, then each insert is linear in the dictionary and memory explodes at a few thousand words.",
      fix: "Keep <code>term</code> plus a reconstruction of the word from the walk, or store one <code>String</code> on terminal nodes only." },
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
      "<p>You can: insert every prefix of every word into a <code>HashSet</code> for starts-with, and keep a second set of complete words for search. Memory is worse because every prefix is stored as its own <code>String</code>, and Word Search II still wants a walk that can prune a dead branch in the middle of a word. The trie is the compressed form of that map, with one node per shared character rather than one string per prefix.</p>"],
    ["Aho-Corasick vs trie DFS on a text?",
      "<p>Aho-Corasick adds failure links so you scan a linear text once and report every pattern that occurs. If the \"text\" is a 2-D board with 4-way moves, that automaton does not match the shape of the search; board DFS locked to a trie pointer is the right tool (LC 212). If the text really is a string, Aho is linear in the text plus the dictionary plus the number of matches.</p>"],
    ["Autocomplete top-k?",
      "<p>The subtree under the prefix node holds every candidate. For a small subtree you can DFS it and pick the best <code>k</code> words. If the subtree is large, precompute a small heap of the best words at each node when you insert, so a later query is a read rather than a walk. Either way you start from the node the prefix walk landed on, not from the root.</p>"],
    ["Unicode?",
      "<p>Use <code>HashMap&lt;Character, Node&gt;</code>, or a byte trie on UTF-8 with 256 slots. Do not allocate <code>next[Character.MAX_VALUE]</code>: that is tens of thousands of unused pointers per node and will exhaust memory on the first handful of words. Interviews stay on lowercase English and the 26-slot array unless the statement names another alphabet.</p>"],
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
  dryIntro: "Insert app then ape into an empty trie, then watch exact search, prefix search, and a missing suffix take three different answers from the same walk.",
}),

/* ====================================== 8. xor-trie =================== */
pack({
  id: "xor-trie",
  difficulty: "Hard",
  readTime: "28 min",
  tagline: "A 2-child trie on bits, MSB first: to maximise XOR, greedily take the opposite " +
    "bit whenever that child exists.",
  tags: ["XOR trie", "binary trie", "P1"],
  prereqs: [
    ["Trie", "trie.html"],
    ["Bit Manipulation", "../02-sorting-hashing-bits/bit-manipulation.html"],
  ],
  why: [
    "You are given 100000 integers and asked for the maximum XOR of any two of them. Sorting " +
      "and walking two pointers, the usual trick for a maximum difference, does not apply: " +
      "XOR does not respect numeric order, so the best pair need not sit near each other after " +
      "a sort. Checking every pair is about <code>5&times;10&#8313;</code> XORs and will not " +
      "finish. The greedy that does work is bitwise, from the highest bit down: given the " +
      "bits of <code>x</code> you have already matched, you want the other number to have " +
      "the opposite bit, because that bit of the XOR becomes 1.",
    "A <em>XOR trie</em> is a 2-child prefix tree on those bits, most-significant bit first. " +
      "Each node is the set of inserted numbers that share one bit-prefix, and the two " +
      "children are \"this prefix plus a 0\" and \"this prefix plus a 1\". Asking whether " +
      "the opposite child exists is then a single pointer check, so a query is 30 or 31 " +
      "steps. The same structure answers maximum XOR against a query value, maximum XOR of " +
      "a subarray (you insert prefix XORs), and CF 706D (insert, delete, then max XOR with " +
      "<code>x</code>). It is the bit analogue of a BST, ordered by the 30-bit strings " +
      "rather than by numeric value.",
    "Insert is one walk that creates a child for each bit. Query is one walk that prefers " +
      "the opposite bit and falls back to the same bit when it must. A count on each node " +
      "is what makes delete safe. In a statement the tell is \"maximum XOR\" next to " +
      "<code>n &le; 10&#8309;</code> and values up to <code>10&#8313;</code>, which is 30 bits. " +
      "Java's sign bit is the usual trap: for non-negative values loop from bit 30 down to 0, " +
      "and do not sign-extend with <code>&gt;&gt;</code> on a 32-bit walk of a negative.",
  ],
  insight: "XOR is maximised by setting each bit to 1 from the most-significant bit down: " +
    "at bit <code>k</code>, take the opposite child if it exists. The trie is the oracle " +
    "that tells you whether any stored number realises that opposite bit given the prefix " +
    "already chosen.",
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
  constraint: "<code>n &le; 10&#8309;</code> and values up to <code>10&#8313;</code> mean 30 " +
    "bits, so time and memory are <code>O(n&times;30)</code>, about three million steps and " +
    "at most that many new nodes. Use a <code>cnt</code> on every node if the statement " +
    "deletes. Java <code>int</code> treats bit 31 as the sign; for non-negative values loop " +
    "<code>b = 30; b &ge; 0; b--</code> and leave bit 31 alone.",
  core: [
    "A node holds <code>Node[] ch = new Node[2]</code> and an integer <code>cnt</code> of " +
      "numbers that pass through it. Insert starts at the root and walks " +
      "<code>b = 30, 29, &hellip;, 0</code>. The bit is <code>(x &gt;&gt; b) &amp; 1</code>. " +
      "Create <code>ch[bit]</code> if it is missing, step into it, increment <code>cnt</code>. " +
      "Query-max walks the same bits of <code>x</code> but asks for the opposite child: " +
      "<code>want = bit ^ 1</code>. If that child exists and its count is positive, take it " +
      "and turn bit <code>b</code> of the answer on, because that bit of the XOR is now 1. " +
      "Otherwise take the same-bit child, and that bit of the answer stays 0. The greedy is " +
      "legal because bit <code>b</code> is worth <code>2<sup>b</sup></code>, more than all " +
      "lower bits added together.",
    "Maximum pair XOR inserts the first number, then for each later <code>a[i]</code> queries " +
      "the trie and inserts. Maximum subarray XOR is the same algorithm on the prefix-XOR " +
      "array, because the XOR of <code>a[l..r]</code> is <code>pref[r] ^ pref[l-1]</code>, " +
      "and you must insert 0 first so a prefix that starts at index 0 has a partner. Delete " +
      "walks the bits of <code>x</code> and decrements <code>cnt</code>; a child whose count " +
      "hits 0 is treated as missing, which is what keeps a shared prefix alive for the " +
      "sibling that still uses it.",
    "Take the LC 421 sample <code>[3, 10, 5, 25, 2, 8]</code> with a 4-bit demo. Insert 3, " +
      "which is <code>0011</code>, creating the path 0, 0, 1, 1. Query 10, which is " +
      "<code>1010</code>: the highest bit of 10 wants a 1-child (opposite of 3's 0), none " +
      "exists yet, so you take 0 and that XOR bit is 0; the remaining bits eventually produce " +
      "<code>3 ^ 10 = 9</code>. Insert 10, then 5, then 25. Querying 25 against 5 prefers " +
      "opposite bits all the way down and reports 28, which is <code>5 ^ 25</code> and the " +
      "answer for the whole array. A later prefix-XOR version of the same trie would insert " +
      "0 first so a prefix that starts at the left edge is not missing its partner.",
  ],
  invariant: "<p>Each root-to-node path is a bit prefix of at least one stored number. " +
    "<code>queryMax(x)</code> walks a path that maximises the XOR with <code>x</code> one " +
    "bit at a time:</p>" +
    "<span class=\"eq\">at bit b: if the opposite child exists, take it (that XOR bit is 1)</span>" +
    "<p>In plain words, you never look at a pair of numbers; you ask, bit by bit, whether " +
    "any stored number has the bit you want given the bits you have already committed to, " +
    "and you always take yes when you can because a higher 1 outweighs every lower choice.</p>" +
    "<p>Interview sentence: <em>\"MSB first, prefer the opposite child; the trie is the existence check.\"</em></p>",
  arrayLabel: "numbers then running max-XOR after each insert",
  array: [3, 10, 5, 25, 2, 8],
  vars: ["x", "bit", "want", "best"],
  vizTitle: "Insert 3 (011), query 10 (1010) preferring opposite bits",
  frames: [
    { note: "Insert 3, written 0011 in four bits for the demo. The trie grows the path 0, 0, 1, 1, one node per bit from the high end.",
      active: [0],
      values: { x: 3, bit: "0011", want: "insert", best: 0 } },
    { note: "Query 10, written 1010. The highest bit wants a 1-child, opposite of 3's 0; none exists, so you take 0 and that XOR bit stays 0.",
      values: { x: 10, bit: 3, want: 1, best: 0 } },
    { note: "The remaining bits finish the walk and report 3 XOR 10, which is 9. Insert 10 so later queries can use its path as well.",
      active: [1],
      values: { x: 10, bit: "1010", want: "done", best: 9 } },
    { note: "After 5 and 25 are inserted, a query of 25 against 5 prefers the opposite child at every bit and reports 28, the sample answer.",
      active: [2, 3],
      values: { x: 25, bit: "11001", want: "vs 5", best: 28 } },
    { note: "Taking the opposite child whenever it exists is safe: a 1 in a higher bit is worth more than every lower bit added together.",
      best: [2, 3],
      values: { x: "why", bit: "MSB first", want: "greedy", best: 28 } },
    { note: "The same trie on prefix XORs answers maximum subarray XOR, because a subarray XOR is two prefixes combined, including the empty prefix 0.",
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
    "<strong>Fix the bit width and the node.</strong> Use 30 bits for values up to <code>10&#8313;</code>, and give each node two children plus a <code>cnt</code>, because every later delete and empty-check reads that count.",
    "<strong>Insert from the high bit down.</strong> For each <code>b</code>, take <code>bit = (x &gt;&gt; b) &amp; 1</code>, create the child if needed, step into it and increment <code>cnt</code>, so a later query can ask whether that prefix still has anyone in it.",
    "<strong>Query-max prefers the opposite child.</strong> Set <code>want = bit ^ 1</code>; if that child exists, take it and turn on bit <code>b</code> of the answer, otherwise fall back to the same bit, which is also the rule for a minimum XOR.",
    "<strong>Maximum pair inserts as it goes, or inserts all then queries all.</strong> Either order is linear in <code>n&times;BITS</code>; the running insert lets you forbid <code>i == j</code> for free if the statement wants two distinct indices.",
    "<strong>Subarray XOR inserts the empty prefix 0 first.</strong> Then each running prefix XOR is queried and inserted, because a subarray starting at index 0 is the current prefix XOR 0 and would otherwise have no partner.",
    "<strong>Delete decrements counts along the path of x.</strong> Treat a child with <code>cnt == 0</code> as missing, so a shared prefix survives for the other numbers that still use it.",
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
      "<p>Each insert or query walks <code>BITS</code> nodes and creates at most <code>BITS</code> new ones. With <code>BITS = 30</code> and <code>n = 10&#8309;</code> that is about three million steps and at most three million nodes, a few tens of milliseconds. The all-pairs scan is <code>n(n-1)/2</code> XORs, about <code>5&times;10&#8313;</code>, which no judge will accept.</p>",
      "<span class=\"eq\">T = O(n B), S = O(n B), B &asymp; 30</span>",
      "<p>A hash set of the numbers, or of the prefix XORs, answers \"is this exact XOR present?\" and does not help you maximise. Minimum pair XOR is a different problem: after sorting by value the best pair is adjacent, which is <code>O(n log n)</code> and does not need this trie.</p>",
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
      bug: "<code>&gt;&gt;</code> sign-extends, so a 32-bit walk of a negative fills the high end with 1s and the query follows a path that no inserted non-negative number ever created, then returns a number that looks like a XOR and is wrong.",
      fix: "For non-negative constraints loop from bit 30 down to 0. If negatives are legal, use <code>&gt;&gt;&gt;</code> or store the value as a <code>long</code>." },
    { title: "Query on an empty trie",
      bug: "Walking <code>ch[want]</code> on a trie with no numbers looks like the usual 30-step query, then a null child throws, or you pretend 0 is present and report <code>x ^ 0</code> when the array was empty.",
      fix: "Keep a <code>cnt</code> on the root and refuse to query when it is 0, or insert a dummy only when the statement allows 0 as a real value." },
    { title: "Forgetting to insert 0 as empty prefix",
      bug: "Starting the subarray loop with an empty trie looks tidy, then every prefix that starts at index 0 has no partner and the answer misses <code>pref[r] ^ 0</code>, which is the prefix itself.",
      fix: "Insert 0 before the loop, then query and insert each running prefix. A one-element array whose answer is the element itself is the test." },
    { title: "Delete without cnt",
      bug: "Nulling a child when one number is removed looks like a clean erase, then a sibling that shared the same high bits loses its path and later queries under-count.",
      fix: "Increment <code>cnt</code> on insert, decrement on delete, and treat <code>cnt == 0</code> as missing. Two inserts of the same value need two deletes." },
    { title: "Preferring the same bit for max XOR",
      bug: "Taking <code>ch[bit]</code> first looks like \"stay close to x\" and actually minimises that bit of the XOR, so the answer comes out too small and the sample of a tiny array still happens to pass.",
      fix: "Set <code>want = bit ^ 1</code> for a maximum. The same-bit child is the fallback, and it is the first choice when you want a minimum XOR instead." },
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
      "<p>Bit <code>b</code> is worth <code>2<sup>b</sup></code>, which is strictly more than <code>2<sup>b</sup> - 1</code>, the sum of every lower bit. If you can set it, you always should, no matter what those lower bits do afterwards. The trie does not search pairs; it only answers whether any stored number realises the opposite bit given the prefix you have already committed to by earlier choices.</p>"],
    ["Max subarray XOR vs max pair XOR?",
      "<p>The XOR of a subarray <code>a[l..r]</code> is <code>pref[r] ^ pref[l-1]</code>. Insert the prefix XORs into the same trie and query the current prefix; that is maximum pair XOR on the prefix array. You must include 0 as <code>pref[-1]</code> so a prefix that starts at the left edge has a partner. Pair XOR on the original array is the same code without the prefix layer.</p>"],
    ["CF 706D operations?",
      "<p>The three operations are insert <code>x</code>, delete <code>x</code>, and query the maximum XOR with a given <code>x</code>. It is this trie plus <code>cnt</code>. Two inserts of the same value need two deletes; a count of 1 after the first delete must still answer queries as if the number is present.</p>"],
    ["Persistent XOR trie?",
      "<p>On insert, copy the <code>O(BITS)</code> nodes on the path you touch and leave the rest of the old version shared. Version <code>i</code> is then the trie of the first <code>i</code> numbers. A later query that wants the best XOR against a value using only indices in <code>[L, R]</code> walks version <code>R</code> while subtracting counts from version <code>L-1</code>, or walks two roots in lockstep.</p>"],
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
  dryIntro: "Insert 3 into a 4-bit XOR trie, query 10, then watch 5 XOR 25 become 28 once those two paths exist to prefer opposite bits.",
}),

];

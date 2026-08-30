/* Module 05 — Trees */

export const topics = [

/* ====================================== 1. binary-tree-basics-and-traversals */
{
  id: "binary-tree-basics-and-traversals",
  difficulty: "Easy",
  readTime: "22 min",
  tagline: "A binary tree is a recursive pair of subtrees. Every classic walk &mdash; preorder, " +
    "inorder, postorder, level order &mdash; is the same recursion with the visit moved.",
  tags: ["binary tree", "DFS", "BFS", "traversal", "P0"],
  prereqs: [["Recursion Fundamentals", "../04-recursion-and-backtracking/recursion-fundamentals.html"],
            ["Complexity Analysis", "../00-foundations/complexity-analysis.html"]],

  why: {
    paras: [
      "Almost every binary-tree question is a traversal wearing a costume. Diameter, path sum, " +
      "symmetry, serialisation, construction from two orders &mdash; each is \"walk every node " +
      "exactly once and combine the children's answers\". If you cannot write the four walks " +
      "without looking them up, the later pages in this module will feel like magic rather than " +
      "a two-line change to a walk you already own.",
      "The recursive definition is the whole data structure: a node holds a value and two " +
      "optional children. Height, size, and \"is this a leaf\" fall out of that definition in " +
      "three lines. Interviewers ask for both the recursive and the iterative forms because the " +
      "iterative form is what you need when the tree is a linked-list-shaped degenerate of " +
      "<code>n = 10&#8309;</code> nodes and the JVM stack will not survive a recursive walk.",
      "The four orders are not four algorithms. They are one DFS with the <code>visit</code> " +
      "call placed before, between, or after the two recursive calls, plus one BFS that swaps " +
      "the implicit recursion stack for an explicit <code>ArrayDeque</code>. Internalise that, " +
      "and every later tree pattern is a payload attached to a walk you already know.",
    ],
    insight: "Preorder / inorder / postorder are the same DFS with the visit moved. Level order " +
      "is the same walk with a queue instead of a stack. Learn one walk, then move the visit.",
  },

  recognise: {
    yes: [
      "\"Return the preorder / inorder / postorder / level-order list of values\"",
      "\"Height\", \"depth\", \"number of nodes\", or \"is this a leaf / full / complete tree\"",
      "A problem that is obviously \"do something at every node, using answers from children\"",
      "You need to reconstruct a tree from two of the three DFS orders",
      "Iterative traversal is requested, or <code>n</code> is large enough that recursion may overflow",
    ],
    no: [
      "The input is a general graph with cycles &rarr; " +
        "<a href=\"../07-graphs-core/bfs.html\">BFS</a> / " +
        "<a href=\"../07-graphs-core/dfs-and-components.html\">DFS on graphs</a>, not a tree walk",
      "You need ancestor queries or path aggregates on a static tree &rarr; " +
        "<a href=\"lca-binary-lifting.html\">LCA</a> or " +
        "<a href=\"euler-tour-subtree-queries.html\">Euler tour</a>",
      "The tree is a BST and the question uses the search-tree invariant &rarr; " +
        "<a href=\"bst.html\">BST</a>",
      "You are counting strings or XOR pairs &rarr; <a href=\"trie.html\">trie</a> / " +
        "<a href=\"xor-trie.html\">XOR trie</a>",
    ],
    table: [
      ["\"list nodes in preorder / inorder / postorder\"", "DFS, visit placement differs", "Recursive or iterative DFS"],
      ["\"level by level\", \"left to right by depth\"", "BFS, one queue", "ArrayDeque level-order"],
      ["\"height / maximum depth\"", "1 + max of children's heights", "Postorder combine"],
      ["\"invert / flip / mirror the tree\"", "Swap children, then recurse", "Preorder or postorder swap"],
      ["\"same tree\" / \"symmetric\"", "Pairwise walk of two pointers", "Simultaneous recursion or BFS"],
      ["\"construct from preorder and inorder\"", "Preorder gives roots, inorder splits",
        "<a href=\"binary-tree-problem-patterns.html\">Construction pattern</a>"],
      ["<strong>Confused with:</strong> topological order on a DAG",
        "A tree walk has no incoming-edge count and no cycle",
        "<a href=\"../07-graphs-core/topological-sort-and-dag-dp.html\">Topo sort</a>"],
    ],
    constraint: "<code>n &le; 10&#8309;</code> is fine for an iterative walk. Recursive DFS on a " +
      "skew tree of that size overflows the Java stack (typically a few thousand frames). Prefer " +
      "iterative, or convert to an explicit stack, whenever the statement does not promise a " +
      "balanced tree.",
  },

  core: {
    heading: "Core idea and the invariant",
    paras: [
      "A binary tree node is <code>(val, left, right)</code>. The recursive walk is: optionally " +
      "visit, walk left, optionally visit, walk right, optionally visit. Preorder visits first " +
      "(root-left-right), inorder visits between the children (left-root-right), postorder " +
      "visits last (left-right-root). Those three plus level-order BFS cover every introductory " +
      "tree problem.",
      "The height of a node is <code>1 + max(height(left), height(right))</code>, with a null " +
      "child contributing <code>0</code> (or <code>-1</code> if you count edges). Size is " +
      "<code>1 + size(left) + size(right)</code>. Both are postorder: you cannot answer the " +
      "parent until the children have returned. That \"combine after the recursive calls\" shape " +
      "is the seed of every tree-DP on the next pages.",
      "Iterative DFS replaces the call stack with an <code>ArrayDeque&lt;Node&gt;</code>. " +
      "Preorder is push-right-then-left so the left child is popped first. Inorder keeps a " +
      "pointer that walks left, dumping nodes onto the stack, then visits and steps right. " +
      "Postorder is two-stack or \"peek and delay\" &mdash; visit a node only after both " +
      "children have been processed.",
    ],
    invariantTitle: "The invariant",
    invariant: "<p>Every node is entered once and left once. The three DFS orders are the same " +
      "walk; only the moment of recording <code>node.val</code> changes:</p>" +
      "<span class=\"eq\">pre = visit, L, R &nbsp;|&nbsp; in = L, visit, R &nbsp;|&nbsp; post = L, R, visit</span>" +
      "<p>Level order records a node when it is dequeued, and enqueues its children. Interview " +
      "sentence: <em>\"I walk every node once; the order is where I put the visit.\"</em></p>",
    extra: [
      { kind: "tip", title: "Null is a first-class child",
        html: "<p>Write the base case as <code>if (node == null) return;</code> (or return " +
          "<code>0</code> / <code>empty list</code>). Do not special-case \"has only a left " +
          "child\" in the caller. The recursion on <code>null</code> is what keeps the code " +
          "short and the invariants true on skewed and complete trees alike.</p>" },
      { kind: "warn", title: "Height in nodes vs height in edges",
        html: "<p>A single node has height <code>1</code> if you count nodes and height " +
          "<code>0</code> if you count edges. LC 104 uses nodes. Diameter problems (LC 543) " +
          "count <em>edges</em> on the longest path. Pick one convention, document it in a " +
          "comment, and convert at the return if the statement disagrees.</p>" },
    ],
  },

  visuals: [
    {
      kind: "array", vizId: "travPre",
      h3: "Preorder filling a flat output array",
      intro: "The tree is <code>1</code> with left <code>2</code> (children <code>4</code>, " +
        "<code>5</code>) and right <code>3</code>. Watch the preorder list grow: visit, then " +
        "left subtree, then right subtree.",
      caption: "Preorder writes the node the moment it is entered. The finished array " +
        "<code>[1, 2, 4, 5, 3]</code> is exactly the sequence of entries.",
      data: {
        label: "preorder output",
        array: ["", "", "", "", ""],
        indexLabels: ["0", "1", "2", "3", "4"],
        vars: ["node", "phase", "written"],
        speed: 900,
        frames: [
          { note: "Enter 1. Preorder writes on entry, so slot 0 becomes 1. Next: left child 2.",
            arr: [1, "", "", "", ""], active: [0], dim: [1, 2, 3, 4],
            values: { node: 1, phase: "visit", written: 1 } },
          { note: "Enter 2. Write 2 at slot 1. Next: left child 4.",
            arr: [1, 2, "", "", ""], active: [1], done: [0], dim: [2, 3, 4],
            values: { node: 2, phase: "visit", written: 2 } },
          { note: "Enter 4. Write 4. Both children are null, so this subtree is done.",
            arr: [1, 2, 4, "", ""], active: [2], done: [0, 1], dim: [3, 4],
            values: { node: 4, phase: "visit leaf", written: 3 } },
          { note: "Back at 2, now walk the right child 5. Write 5 at slot 3.",
            arr: [1, 2, 4, 5, ""], active: [3], done: [0, 1, 2], dim: [4],
            values: { node: 5, phase: "visit leaf", written: 4 } },
          { note: "Subtree of 2 is finished. Back at 1, walk the right child 3. Write 3.",
            arr: [1, 2, 4, 5, 3], active: [4], done: [0, 1, 2, 3],
            values: { node: 3, phase: "visit leaf", written: 5 } },
          { note: "Done. Preorder is [1, 2, 4, 5, 3]. Inorder would have been [4, 2, 5, 1, 3]; postorder [4, 5, 2, 3, 1].",
            arr: [1, 2, 4, 5, 3], best: [0, 1, 2, 3, 4],
            values: { node: "\u2014", phase: "done", written: 5 } },
          { note: "Level order on the same tree is a queue walk: 1, then 2 and 3, then 4 and 5 \u2014 [1, 2, 3, 4, 5]. Same nodes, different visit moment.",
            arr: [1, 2, 3, 4, 5], done: [0, 1, 2, 3, 4],
            values: { node: "BFS", phase: "level order", written: 5 } },
        ],
      },
    },
    {
      kind: "mermaid", vizId: "travTree",
      h3: "The sample tree",
      intro: "Five nodes. Left spine <code>1-2-4</code>, sibling <code>5</code> under " +
        "<code>2</code>, and a right leaf <code>3</code>. Every walk on this page uses it.",
      caption: "Small enough to dry-run by hand, large enough that the three DFS orders actually differ.",
      src: `graph TD
  t1["1"] --> t2["2"]
  t1 --> t3["3"]
  t2 --> t4["4"]
  t2 --> t5["5"]`,
    },
  ],

  steps: [
    "<strong>Represent the tree</strong> as <code>Node(val, left, right)</code>. A missing child is " +
      "<code>null</code>, never a sentinel node, unless you are writing a threaded tree.",
    "<strong>Recursive DFS:</strong> base-case on <code>null</code>, then place the " +
      "<code>out.add(node.val)</code> before, between, or after the two recursive calls.",
    "<strong>Iterative preorder:</strong> stack starts with the root. Pop, visit, push right, then " +
      "left, so left is processed first. Use <code>ArrayDeque</code>, not <code>Stack</code>.",
    "<strong>Iterative inorder:</strong> walk <code>cur</code> left while pushing, then pop-visit " +
      "and set <code>cur = popped.right</code>.",
    "<strong>Level order:</strong> queue the root. While the queue is non-empty, drain the current " +
      "level's size, enqueue children. That size snapshot is what groups nodes by depth.",
    "<strong>Height / size</strong> are postorder combines: " +
      "<code>height = 1 + max(hL, hR)</code>, <code>size = 1 + sL + sR</code>, null returns 0.",
    "<strong>If <code>n</code> can be a skew chain</strong>, prefer the iterative forms; Java's " +
      "call stack will not hold 10&#8309; frames.",
  ],

  dryRun: {
    intro: "Recursive preorder on the sample tree. <code>out</code> is the list being built; " +
      "<code>phase</code> is where we are in the node's three-step life.",
    cols: ["node", "phase", "out after"],
    rows: [
      { cells: ["1", "enter / visit", "[1]"], action: "Write 1, recurse left", change: true },
      { cells: ["2", "enter / visit", "[1, 2]"], action: "Write 2, recurse left", change: true },
      { cells: ["4", "enter / visit", "[1, 2, 4]"], action: "Leaf: both children null", change: true },
      { cells: ["4", "leave", "[1, 2, 4]"], action: "Return to 2", change: false },
      { cells: ["2", "after left", "[1, 2, 4]"], action: "Recurse right", change: false },
      { cells: ["5", "enter / visit", "[1, 2, 4, 5]"], action: "Leaf", change: true },
      { cells: ["2", "leave", "[1, 2, 4, 5]"], action: "Return to 1", change: false },
      { cells: ["1", "after left", "[1, 2, 4, 5]"], action: "Recurse right", change: false },
      { cells: ["3", "enter / visit", "[1, 2, 4, 5, 3]"], action: "Leaf", change: true },
      { cells: ["1", "leave", "[1, 2, 4, 5, 3]"], action: "Done", change: false },
    ],
    after: "<p>Inorder inserts the write between the two recursive calls, producing " +
      "<code>[4, 2, 5, 1, 3]</code>. Postorder writes on leave, producing " +
      "<code>[4, 5, 2, 3, 1]</code>.</p>",
  },

  code: [
    { tab: "Recursive DFS", panel: "Recursion", file: "TreeTraversals.java",
      intro: "The three DFS orders share one skeleton. Only the line that appends " +
        "<code>node.val</code> moves. The <code>main</code> prints the dry-run sample.",
      highlight: "18-21,24-27,30-33",
      code: `import java.util.ArrayList;
import java.util.List;

public class TreeTraversals {

    static class Node {
        int val;
        Node left, right;
        Node(int v) { val = v; }
    }

    static Node sample() {
        Node r = new Node(1);
        r.left = new Node(2);
        r.right = new Node(3);
        r.left.left = new Node(4);
        r.left.right = new Node(5);
        return r;
    }

    static void preorder(Node node, List<Integer> out) {
        if (node == null) return;
        out.add(node.val);
        preorder(node.left, out);
        preorder(node.right, out);
    }

    static void inorder(Node node, List<Integer> out) {
        if (node == null) return;
        inorder(node.left, out);
        out.add(node.val);
        inorder(node.right, out);
    }

    static void postorder(Node node, List<Integer> out) {
        if (node == null) return;
        postorder(node.left, out);
        postorder(node.right, out);
        out.add(node.val);
    }

    static int height(Node node) {
        if (node == null) return 0;          // height in nodes; a leaf is 1
        return 1 + Math.max(height(node.left), height(node.right));
    }

    public static void main(String[] args) {
        Node root = sample();
        List<Integer> pre = new ArrayList<>(), in = new ArrayList<>(), post = new ArrayList<>();
        preorder(root, pre);
        inorder(root, in);
        postorder(root, post);
        System.out.println(pre);
        System.out.println(in);
        System.out.println(post);
        System.out.println(height(root));
    }
    // Input : tree 1 / 2 3 / 4 5
    // Output: [1, 2, 4, 5, 3]
    //         [4, 2, 5, 1, 3]
    //         [4, 5, 2, 3, 1]
    //         3
}`,
    },
    { tab: "Iterative", panel: "Iterative", file: "IterativeTraversals.java",
      intro: "Same three orders without recursion. Preorder is a stack; inorder is the " +
        "left-spine walk; postorder delays a node until both children are done.",
      highlight: "16-23,27-38,42-58",
      code: `import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;

public class IterativeTraversals {

    static class Node {
        int val;
        Node left, right;
        Node(int v) { val = v; }
    }

    static List<Integer> preorder(Node root) {
        List<Integer> out = new ArrayList<>();
        if (root == null) return out;
        ArrayDeque<Node> st = new ArrayDeque<>();
        st.push(root);
        while (!st.isEmpty()) {
            Node cur = st.pop();
            out.add(cur.val);
            if (cur.right != null) st.push(cur.right);
            if (cur.left != null) st.push(cur.left);
        }
        return out;
    }

    static List<Integer> inorder(Node root) {
        List<Integer> out = new ArrayList<>();
        ArrayDeque<Node> st = new ArrayDeque<>();
        Node cur = root;
        while (cur != null || !st.isEmpty()) {
            while (cur != null) {
                st.push(cur);
                cur = cur.left;
            }
            cur = st.pop();
            out.add(cur.val);
            cur = cur.right;
        }
        return out;
    }

    static List<Integer> postorder(Node root) {
        List<Integer> out = new ArrayList<>();
        if (root == null) return out;
        ArrayDeque<Node> st = new ArrayDeque<>();
        Node cur = root, last = null;
        while (cur != null || !st.isEmpty()) {
            if (cur != null) {
                st.push(cur);
                cur = cur.left;
            } else {
                Node peek = st.peek();
                if (peek.right != null && last != peek.right) {
                    cur = peek.right;
                } else {
                    out.add(peek.val);
                    last = st.pop();
                }
            }
        }
        return out;
    }

    public static void main(String[] args) {
        Node r = new Node(1);
        r.left = new Node(2);
        r.right = new Node(3);
        r.left.left = new Node(4);
        r.left.right = new Node(5);
        System.out.println(preorder(r));
        System.out.println(inorder(r));
        System.out.println(postorder(r));
    }
    // Input : tree 1 / 2 3 / 4 5
    // Output: [1, 2, 4, 5, 3]
    //         [4, 2, 5, 1, 3]
    //         [4, 5, 2, 3, 1]
}`,
    },
    { tab: "Level order", panel: "BFS", file: "LevelOrder.java",
      intro: "Snapshot <code>sz = q.size()</code> at the start of each level so you can return " +
        "a list-of-lists. Without the snapshot you still visit every node, but you lose grouping.",
      highlight: "16-27",
      code: `import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;

public class LevelOrder {

    static class Node {
        int val;
        Node left, right;
        Node(int v) { val = v; }
    }

    static List<List<Integer>> levelOrder(Node root) {
        List<List<Integer>> out = new ArrayList<>();
        if (root == null) return out;
        ArrayDeque<Node> q = new ArrayDeque<>();
        q.add(root);
        while (!q.isEmpty()) {
            int sz = q.size();
            List<Integer> level = new ArrayList<>(sz);
            for (int i = 0; i < sz; i++) {
                Node cur = q.removeFirst();
                level.add(cur.val);
                if (cur.left != null) q.add(cur.left);
                if (cur.right != null) q.add(cur.right);
            }
            out.add(level);
        }
        return out;
    }

    public static void main(String[] args) {
        Node r = new Node(1);
        r.left = new Node(2);
        r.right = new Node(3);
        r.left.left = new Node(4);
        r.left.right = new Node(5);
        System.out.println(levelOrder(r));
    }
    // Input : tree 1 / 2 3 / 4 5
    // Output: [[1], [2, 3], [4, 5]]
}`,
    },
  ],

  complexity: {
    time: "O(n)",
    space: "O(h) recursion / stack, O(w) for BFS",
    derivation: [
      "<p>Each node is pushed and popped a constant number of times, so every walk is linear " +
      "in the number of nodes:</p>",
      "<span class=\"eq\">T(n) = T(n<sub>L</sub>) + T(n<sub>R</sub>) + &Theta;(1) = &Theta;(n)</span>",
      "<p>Auxiliary space is the maximum depth of the implicit or explicit stack, which is the " +
      "height <code>h</code>. On a balanced tree <code>h = &Theta;(log n)</code>; on a skew chain " +
      "<code>h = &Theta;(n)</code>. BFS space is the maximum width <code>w</code>, which is " +
      "<code>&Theta;(n)</code> for a complete tree's last level and <code>&Theta;(1)</code> for a " +
      "chain.</p>",
      "<p>You cannot beat <code>&Omega;(n)</code> if the output lists every value. Construction " +
      "and comparison problems that walk two trees are still <code>&Theta;(n)</code>.</p>",
    ],
    compare: [
      ["Recursive DFS", "<code>O(n)</code>", "<code>O(h)</code> stack", "Default; fine when the tree is balanced"],
      ["Iterative DFS", "<code>O(n)</code>", "<code>O(h)</code> heap", "Skew trees, or when the interviewer bans recursion"],
      ["Level-order BFS", "<code>O(n)</code>", "<code>O(w)</code>", "Anything that needs depth grouping"],
      ["Morris traversal", "<code>O(n)</code>", "<code>O(1)</code>", "Rare; temporarily threads the tree"],
    ],
  },

  pitfalls: [
    { title: "Using <code>Stack</code> instead of <code>ArrayDeque</code>",
      bug: "<code>java.util.Stack</code> is synchronised, inherits the wrong methods from " +
        "<code>Vector</code>, and is slower. It also lets you call <code>get(i)</code> and " +
        "break the stack discipline.",
      fix: "Use <code>ArrayDeque</code> for both DFS stacks and BFS queues. " +
        "<code>push</code>/<code>pop</code>/<code>peek</code> for DFS, " +
        "<code>add</code>/<code>removeFirst</code> for BFS." },
    { title: "Forgetting the null base case",
      bug: "<code>node.left.val</code> without a null check, or a recursive call that " +
        "dereferences <code>null</code> at a leaf. The crash only shows up on trees that are " +
        "not perfectly full.",
      fix: "First line of every walk: <code>if (node == null) return;</code> (or return the " +
        "identity of the combine)." },
    { title: "Height off-by-one (nodes vs edges)",
      bug: "Returning <code>0</code> for a leaf when the problem counts nodes, or " +
        "<code>1</code> when it counts edges. LC 104 wants 1 for a single node; LC 543's " +
        "diameter is in edges.",
      fix: "State the convention in a comment and convert at the end if needed. A reliable " +
        "edge-height is <code>max(0, 1 + max(hL, hR))</code> with null returning <code>-1</code>." },
    { title: "Level-order without snapshotting the queue size",
      bug: "A single <code>while (!q.isEmpty())</code> that also enqueues children, so you " +
        "cannot tell where one level ends. The flat list is still correct; the grouped list is not.",
      fix: "<code>int sz = q.size();</code> then a <code>for</code> of that many pops." },
    { title: "Recursive walk on a linked-list-shaped tree",
      bug: "<code>n = 10&#8309;</code> nodes in a right spine. Recursion depth is " +
        "<code>n</code>, and Java throws <code>StackOverflowError</code> long before that.",
      fix: "Write the iterative version, or confirm the tree is balanced (BST from a sorted " +
        "array, heap, etc.)." },
  ],

  variants: [
    ["Morris inorder",
      "Thread a temporary link from a predecessor's right child back to the current node so " +
      "you can walk with <code>O(1)</code> extra memory. Restore the link on the second visit.",
      "pred.right = cur;  ... later pred.right = null; visit(cur);",
      "LC 94 follow-up"],
    ["Zigzag / spiral level order",
      "Same BFS, but reverse every other level (or use a deque and alternate the end you poll).",
      "if ((out.size() & 1) == 1) Collections.reverse(level);",
      "LC 103"],
    ["Vertical / boundary / diagonal views",
      "Annotate each node with <code>(col, row)</code> during BFS and group by column. Boundary " +
      "is left spine + leaves + right spine, without duplicates.",
      "q.add([node, col]); map.computeIfAbsent(col, k -> new ArrayList<>()).add(val);",
      "LC 314, LC 545"],
  ],

  followups: [
    ["How do you reconstruct a tree from preorder and inorder?",
      "<p>The first preorder value is the root. Find it in the inorder array: everything to " +
      "its left is the left subtree, everything to its right is the right subtree. Recurse on " +
      "those two segments. Precompute a value-to-index map so the split is " +
      "<code>O(1)</code>, making the whole build <code>O(n)</code>. Postorder plus inorder is " +
      "the same idea from the other end. Preorder plus postorder is possible only for full " +
      "trees, because otherwise the split is ambiguous.</p>"],
    ["Why is inorder of a BST sorted?",
      "<p>The BST invariant says every value in the left subtree is smaller than the root and " +
      "every value in the right subtree is larger. Inorder visits left, then root, then right, " +
      "so it emits an increasing sequence. That is why \"k-th smallest\" is an inorder walk " +
      "that stops after <code>k</code> visits, and why validating a BST is \"inorder is " +
      "strictly increasing\". See <a href=\"bst.html\">BST</a>.</p>"],
    ["Can you traverse a tree with parent pointers in <code>O(1)</code> extra space?",
      "<p>Yes: from a node you can walk to the parent and decide whether you arrived from the " +
      "left or the right child, which tells you whether to go to the sibling or back up. It is " +
      "the same three-colour (unvisited / left-done / both-done) state machine as iterative " +
      "postorder, stored in the current position rather than on a stack. Rare in interviews, " +
      "useful if the node type already has <code>parent</code>.</p>"],
    ["What changes for an n-ary tree?",
      "<p>DFS becomes \"visit, then loop over <code>node.children</code>\". Level order is " +
      "unchanged except the enqueue loop. There is no unique inorder. Postorder is \"all " +
      "children, then visit\". LC 429 / 589 / 590 are the three n-ary walks.</p>"],
  ],

  problems: [
    { name: "Binary Tree Preorder Traversal", url: "https://leetcode.com/problems/binary-tree-preorder-traversal/",
      badge: "lc", tag: "LC 144", level: "Easy", pattern: "DFS, visit first" },
    { name: "Binary Tree Inorder Traversal", url: "https://leetcode.com/problems/binary-tree-inorder-traversal/",
      badge: "lc", tag: "LC 94", level: "Easy", pattern: "DFS, visit between children" },
    { name: "Binary Tree Postorder Traversal", url: "https://leetcode.com/problems/binary-tree-postorder-traversal/",
      badge: "lc", tag: "LC 145", level: "Easy", pattern: "DFS, visit last" },
    { name: "Binary Tree Level Order Traversal", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
      badge: "lc", tag: "LC 102", level: "Medium", pattern: "BFS with size snapshot" },
    { name: "Maximum Depth of Binary Tree", url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
      badge: "lc", tag: "LC 104", level: "Easy", pattern: "Postorder height in nodes" },
    { name: "Minimum Depth of Binary Tree", url: "https://leetcode.com/problems/minimum-depth-of-binary-tree/",
      badge: "lc", tag: "LC 111", level: "Easy", pattern: "BFS first leaf, or careful postorder" },
    { name: "Same Tree", url: "https://leetcode.com/problems/same-tree/",
      badge: "lc", tag: "LC 100", level: "Easy", pattern: "Simultaneous walk of two roots" },
    { name: "Symmetric Tree", url: "https://leetcode.com/problems/symmetric-tree/",
      badge: "lc", tag: "LC 101", level: "Easy", pattern: "Mirror pair: left-right vs right-left" },
    { name: "Invert Binary Tree", url: "https://leetcode.com/problems/invert-binary-tree/",
      badge: "lc", tag: "LC 226", level: "Easy", pattern: "Swap children, recurse" },
    { name: "Binary Tree Zigzag Level Order", url: "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/",
      badge: "lc", tag: "LC 103", level: "Medium", pattern: "Level order, reverse odd levels" },
  ],

  spoilers: [
    { summary: "Hint for LC 111 &mdash; why min-depth is not just min of children's heights",
      body: "<p>If a node has only one child, the empty side is not a leaf path. " +
        "<code>min(height(left), height(right))</code> would pick <code>0</code> from the " +
        "missing child and claim the node is a leaf. The correct combine is: if one child is " +
        "null, take the other side's min-depth plus one; if both exist, take the min. BFS is " +
        "cleaner: the first time you dequeue a node with no children, that depth is the " +
        "answer, and you can stop.</p>" },
    { summary: "Hint for LC 101 &mdash; symmetry is a paired walk",
      body: "<p>A tree is symmetric if the left and right subtrees are mirrors. Recurse on a " +
        "<em>pair</em> <code>(a, b)</code>: they match when both are null, fail when one is " +
        "null or the values differ, and otherwise check <code>(a.left, b.right)</code> and " +
        "<code>(a.right, b.left)</code>. The same pairing works as a BFS with two queues or " +
        "one queue of pairs. Do not invert one subtree and then compare &mdash; that mutates " +
        "the input and is easy to get wrong on shared nodes.</p>" },
  ],

  recap: {
    bullets: [
      "<strong>One DFS, three visit placements</strong> give preorder, inorder, and postorder.",
      "<strong>Level order is BFS</strong> with <code>sz = q.size()</code> to group by depth.",
      "<strong>Height and size are postorder combines</strong> with a null identity of 0.",
      "<strong>Iterative forms exist for all four walks</strong> and are required on skew trees.",
      "<strong>Use <code>ArrayDeque</code></strong>, never <code>java.util.Stack</code>.",
    ],
    oneliner: "if (n==null) return; visit/L/R placements | BFS: while q, sz=q.size(), drain, enqueue children",
  },
},

/* ====================================== 2. binary-tree-problem-patterns */
{
  id: "binary-tree-problem-patterns",
  difficulty: "Medium",
  readTime: "24 min",
  tagline: "Diameter, path sum, LCA-style splits, construction, serialisation &mdash; all of them " +
    "are a postorder combine with a carefully chosen return value.",
  tags: ["binary tree", "path", "diameter", "construct", "P0"],
  prereqs: [["Binary Tree Basics & Traversals", "binary-tree-basics-and-traversals.html"]],

  why: {
    paras: [
      "Once you can walk a tree, the interview questions stop asking you to print the walk and " +
      "start asking you to <em>compute something while you walk</em>. The catalogue is small: " +
      "path aggregates (any-to-any, root-to-leaf, root-to-any), subtree properties (diameter, " +
      "balance, cameras), construction from two orders, and serialisation. Each is a postorder " +
      "function that returns one number (or a small struct) and maybe updates a global best.",
      "The skill that transfers is picking the return value. Diameter needs height from each " +
      "child, plus a global max of <code>hL + hR</code>. Maximum path sum needs \"best downward " +
      "gain\" from each child, because a path can turn at most once. Construction needs the " +
      "index of the root in inorder so the preorder cursor can split. Get the return type " +
      "wrong and you will rewrite the function three times in the interview.",
      "These patterns also introduce the \"answer is not what you return\" split: the recursive " +
      "function returns a contribution to the parent, while the real answer lives in a " +
      "<code>int[] best</code> (or a field) updated at every node. That split is the entire " +
      "reason LC 124 and LC 543 feel harder than LC 104.",
    ],
    insight: "Decide two things before writing: what a node returns to its parent, and what " +
      "global it updates. Most tree mediums are that pair, not a new algorithm.",
  },

  recognise: {
    yes: [
      "\"Longest / maximum path\" between any two nodes (diameter, max path sum)",
      "\"Root-to-leaf path with sum / product / matching target\"",
      "\"Construct the tree from preorder and inorder\" (or post + in)",
      "\"Serialize and deserialize\", \"flatten to linked list\"",
      "\"Right side view\", \"nodes at distance k\", \"lowest common ancestor of two nodes\"",
    ],
    no: [
      "The tree is a BST and the search invariant is the point &rarr; <a href=\"bst.html\">BST</a>",
      "You need subtree sums under updates &rarr; " +
        "<a href=\"euler-tour-subtree-queries.html\">Euler tour</a>",
      "Unrooted tree with rerooting over all roots &rarr; " +
        "<a href=\"tree-dp-and-rerooting.html\">tree DP</a>",
      "Just print a traversal &rarr; " +
        "<a href=\"binary-tree-basics-and-traversals.html\">basics</a>",
    ],
    table: [
      ["\"diameter\" / \"longest path between any two nodes\"", "hL + hR at each node, take max", "Postorder height + global"],
      ["\"maximum path sum\" (any node to any node)", "Downward gain, path turns at most once", "Postorder, clamp negatives to 0"],
      ["\"path sum equals target\" root-to-leaf", "Carry remaining, check at leaves", "DFS with remaining"],
      ["\"path sum III\" any downward path", "Prefix sums on the root-to-node path", "DFS + HashMap of prefixes"],
      ["\"construct from preorder and inorder\"", "Pre gives roots, in splits ranges", "Index map + recurse"],
      ["\"serialize / deserialize\"", "Preorder with null markers, or level order", "Codec pair"],
      ["<strong>Confused with:</strong> graph shortest path",
        "A tree has one path between two nodes; no Dijkstra needed",
        "Parent pointers + walk up, or LCA"],
    ],
    constraint: "<code>n &le; 10&#8309;</code> with values up to <code>10&#8309;</code> means " +
      "path sums are <code>long</code> (or at least watch LC 124's <code>int</code> range of " +
      "<code>&plusmn;1000</code> per node). Recursion depth is <code>h</code>; skew trees need " +
      "the iterative rewrite or a confirmed bound on height.",
  },

  core: {
    heading: "Core idea and the invariant",
    paras: [
      "Postorder is the default. A node may use both children's answers, so both recursive " +
      "calls happen first. For diameter, a node returns its height and secretly offers " +
      "<code>hL + hR</code> as a candidate longest path that <em>bends here</em>. For max path " +
      "sum, it returns the best <em>downward</em> extension <code>val + max(0, downL, downR)</code> " +
      "and offers <code>val + max(0, downL) + max(0, downR)</code> as a candidate that bends here.",
      "Root-to-leaf path problems carry state down (remaining sum, the path list) instead of " +
      "combining up. Path-sum III mixes both: a prefix-sum map of the current root-to-node " +
      "path, plus the usual two recursive calls, with the map backtracked on return.",
      "Construction inverts a traversal. Preorder's next unused value is the current root; " +
      "its index in inorder splits the leftover values into left and right segments. " +
      "Serialisation is construction's inverse: emit a walk that includes nulls so the shape " +
      "is uniquely determined, then parse it back with the same cursor.",
    ],
    invariantTitle: "The invariant",
    invariant: "<p>At node <code>u</code> after both children have returned:</p>" +
      "<span class=\"eq\">return-to-parent = contribution along one downward ray;&nbsp; " +
      "best = max(best, combination that may bend at u)</span>" +
      "<p>Interview sentence: <em>\"The parent only needs a single ray; the answer may use " +
      "both children, so I keep that in a global.\"</em></p>",
    extra: [
      { kind: "key", title: "Diameter is not height",
        html: "<p>Height is a ray. Diameter is two rays glued at a node. Returning only the " +
          "height and forgetting to update a global with <code>hL + hR</code> is the classic " +
          "miss, and it still produces a plausible number (the height of the root).</p>" },
      { kind: "math", title: "Why negatives are clamped in LC 124",
        html: "<p>A downward extension of a negative child is strictly worse than stopping. " +
          "So <code>down = val + max(0, downL, downR)</code>. The bend candidate still adds " +
          "<em>both</em> sides after clamping, because a path that uses both children is " +
          "allowed to ignore a negative side independently.</p>" },
    ],
  },

  visuals: [
    {
      kind: "array", vizId: "diamWalk",
      h3: "Postorder heights and the diameter candidate",
      intro: "Same sample tree. The array holds each node's height in node-count as it " +
        "finishes. The running diameter (in edges) is <code>hL + hR</code> at the best bend.",
      caption: "Heights fill in postorder: 4 and 5 first, then 2, then 3, then 1. The best " +
        "bend is at 1: <code>2 + 1 = 3</code> edges (path 4-2-1-3).",
      data: {
        label: "height[node] in finishing order",
        array: ["", "", "", "", ""],
        indexLabels: ["h4", "h5", "h2", "h3", "h1"],
        vars: ["node", "hL", "hR", "diam"],
        speed: 950,
        frames: [
          { note: "Leaf 4 finishes. Height 1. No children, so this node offers diameter 0.",
            arr: [1, "", "", "", ""], active: [0], dim: [1, 2, 3, 4],
            values: { node: 4, hL: 0, hR: 0, diam: 0 } },
          { note: "Leaf 5 finishes. Height 1.",
            arr: [1, 1, "", "", ""], active: [1], done: [0], dim: [2, 3, 4],
            values: { node: 5, hL: 0, hR: 0, diam: 0 } },
          { note: "Node 2 combines: hL = 1, hR = 1, height = 2. Bend candidate 1+1 = 2 edges. diam = 2.",
            arr: [1, 1, 2, "", ""], active: [2], done: [0, 1], dim: [3, 4],
            values: { node: 2, hL: 1, hR: 1, diam: 2 } },
          { note: "Leaf 3 finishes. Height 1.",
            arr: [1, 1, 2, 1, ""], active: [3], done: [0, 1, 2], dim: [4],
            values: { node: 3, hL: 0, hR: 0, diam: 2 } },
          { note: "Root 1 combines: hL = 2, hR = 1, height = 3. Bend 2+1 = 3. diam = 3.",
            arr: [1, 1, 2, 1, 3], active: [4], done: [0, 1, 2, 3],
            values: { node: 1, hL: 2, hR: 1, diam: 3 } },
          { note: "Done. Diameter in edges is 3 (4-2-1-3). Returning only height(1)=3 would have been the wrong number for LC 543.",
            arr: [1, 1, 2, 1, 3], best: [4], done: [0, 1, 2, 3],
            values: { node: "ans", hL: 2, hR: 1, diam: 3 } },
          { note: "Max-path-sum on the same tree with these values is 1+2+5+3 = 11, bending at 1 and taking the positive downward rays.",
            arr: [1, 1, 2, 1, 3], best: [0, 1, 2, 3, 4],
            values: { node: "path", hL: "2+4+5", hR: "3", diam: 11 } },
        ],
      },
    },
    {
      kind: "mermaid", vizId: "patTree",
      h3: "The sample tree, path 4-2-1-3 highlighted as the diameter",
      caption: "Two downward rays glued at 1. The recursive function never returns that path; " +
        "it returns a height, and the path lives in the global.",
      src: `graph TD
  p1["1 bend"] --> p2["2"]
  p1 --> p3["3"]
  p2 --> p4["4"]
  p2 --> p5["5"]`,
    },
  ],

  steps: [
    "<strong>Pick the return type.</strong> Height, downward gain, a pair " +
      "<code>(isBST, sum)</code>, or a cursor into an array. Write it down first.",
    "<strong>Pick the global.</strong> Diameter, max path, camera count, a result list. The " +
      "parent does not always need the answer, only a contribution.",
    "<strong>Base case on null</strong> returns the identity: height 0 (or -1 for edges), gain 0, " +
      "empty codec token.",
    "<strong>Recurse both children</strong>, then combine. Update the global from both children's " +
      "answers plus this node's value.",
    "<strong>Return the contribution</strong> a parent can extend: one ray, not the bent path.",
    "<strong>For construction,</strong> preorder's next value is the root; inorder's index splits " +
      "the range. Advance a shared cursor; do not copy arrays.",
    "<strong>For serialisation,</strong> emit nulls so the shape is unique, then parse with the " +
      "same cursor in <code>deserialize</code>.",
  ],

  dryRun: {
    intro: "Diameter (edges) on the sample tree. <code>h</code> is the value returned; " +
      "<code>diam</code> is the global.",
    cols: ["node", "hL", "hR", "return h", "diam after"],
    rows: [
      { cells: ["4", "0", "0", "1", "0"], action: "Leaf", change: true },
      { cells: ["5", "0", "0", "1", "0"], action: "Leaf", change: true },
      { cells: ["2", "1", "1", "2", "2"], action: "Bend 1+1 = 2", change: true },
      { cells: ["3", "0", "0", "1", "2"], action: "Leaf", change: false },
      { cells: ["1", "2", "1", "3", "3"], action: "Bend 2+1 = 3, answer", change: true },
    ],
    after: "<p>The function called on the root returns 3 (height), which is <em>not</em> the " +
      "diameter. The diameter is the global 3. Returning the wrong one is the standard miss.</p>",
  },

  code: [
    { tab: "Brute paths", panel: "Brute", file: "BruteDiameter.java",
      intro: "From every node, compute the two deepest downward rays by a fresh DFS. Correct, " +
        "quadratic on a skew tree, and useful only as a check.",
      highlight: "22-32",
      code: `public class BruteDiameter {

    static class Node {
        int val;
        Node left, right;
        Node(int v) { val = v; }
    }

    static int down(Node node) {
        if (node == null) return 0;
        return 1 + Math.max(down(node.left), down(node.right));
    }

    static int diameterFrom(Node node) {
        if (node == null) return 0;
        return down(node.left) + down(node.right);   // edges through node
    }

    static int brute(Node node) {
        if (node == null) return 0;
        int here = diameterFrom(node);
        return Math.max(here, Math.max(brute(node.left), brute(node.right)));
    }

    public static void main(String[] args) {
        Node r = new Node(1);
        r.left = new Node(2);
        r.right = new Node(3);
        r.left.left = new Node(4);
        r.left.right = new Node(5);
        System.out.println(brute(r));
    }
    // Input : tree 1 / 2 3 / 4 5
    // Output: 3
}`,
    },
    { tab: "Optimal postorder", panel: "Optimal", file: "TreePatterns.java",
      intro: "One postorder pass returns height and updates diameter. The same skeleton with " +
        "a different combine is max-path-sum.",
      highlight: "20-28,32-42",
      code: `public class TreePatterns {

    static class Node {
        int val;
        Node left, right;
        Node(int v) { val = v; }
    }

    static int diameter = 0;

    /** Returns height in nodes. Updates diameter in edges. */
    static int height(Node node) {
        if (node == null) return 0;
        int hL = height(node.left);
        int hR = height(node.right);
        diameter = Math.max(diameter, hL + hR);      // bend here, in edges
        return 1 + Math.max(hL, hR);
    }

    static int maxPath = Integer.MIN_VALUE;

    /** Returns best downward gain. Updates any-to-any max path. */
    static int downGain(Node node) {
        if (node == null) return 0;
        int L = Math.max(0, downGain(node.left));
        int R = Math.max(0, downGain(node.right));
        maxPath = Math.max(maxPath, node.val + L + R);
        return node.val + Math.max(L, R);
    }

    public static void main(String[] args) {
        Node r = new Node(1);
        r.left = new Node(2);
        r.right = new Node(3);
        r.left.left = new Node(4);
        r.left.right = new Node(5);
        diameter = 0;
        height(r);
        maxPath = Integer.MIN_VALUE;
        downGain(r);
        System.out.println(diameter);
        System.out.println(maxPath);
    }
    // Input : tree 1 / 2 3 / 4 5
    // Output: 3
    //         11
}`,
    },
    { tab: "Construct + codec", panel: "Template", file: "ConstructAndCodec.java",
      intro: "Preorder plus inorder rebuilds the tree. Serialise with explicit null markers so " +
        "the reverse parse is unique.",
      highlight: "20-33,44-52,55-66",
      code: `import java.util.ArrayDeque;
import java.util.HashMap;
import java.util.Map;

public class ConstructAndCodec {

    static class Node {
        int val;
        Node left, right;
        Node(int v) { val = v; }
    }

    static int preIdx;

    static Node build(int[] pre, int[] in) {
        Map<Integer, Integer> at = new HashMap<>();
        for (int i = 0; i < in.length; i++) at.put(in[i], i);
        preIdx = 0;
        return buildRange(pre, at, 0, in.length - 1);
    }

    static Node buildRange(int[] pre, Map<Integer, Integer> at, int lo, int hi) {
        if (lo > hi) return null;
        int val = pre[preIdx++];
        Node root = new Node(val);
        int mid = at.get(val);
        root.left = buildRange(pre, at, lo, mid - 1);
        root.right = buildRange(pre, at, mid + 1, hi);
        return root;
    }

    static String serialise(Node node) {
        StringBuilder sb = new StringBuilder();
        dump(node, sb);
        return sb.toString();
    }

    static void dump(Node node, StringBuilder sb) {
        if (node == null) { sb.append("#,"); return; }
        sb.append(node.val).append(',');
        dump(node.left, sb);
        dump(node.right, sb);
    }

    static Node deserialise(String s) {
        ArrayDeque<String> tok = new ArrayDeque<>();
        for (String t : s.split(",")) if (!t.isEmpty()) tok.add(t);
        return parse(tok);
    }

    static Node parse(ArrayDeque<String> tok) {
        String t = tok.removeFirst();
        if (t.equals("#")) return null;
        Node n = new Node(Integer.parseInt(t));
        n.left = parse(tok);
        n.right = parse(tok);
        return n;
    }

    public static void main(String[] args) {
        int[] pre = {1, 2, 4, 5, 3};
        int[] in = {4, 2, 5, 1, 3};
        Node root = build(pre, in);
        String s = serialise(root);
        Node back = deserialise(s);
        System.out.println(s);
        System.out.println(serialise(back));
    }
    // Input : pre=[1,2,4,5,3] in=[4,2,5,1,3]
    // Output: 1,2,4,#,#,5,#,#,3,#,#,
    //         1,2,4,#,#,5,#,#,3,#,#,
}`,
    },
  ],

  complexity: {
    time: "O(n)",
    space: "O(h)",
    derivation: [
      "<p>Each node is visited a constant number of times. Diameter, max-path-sum, " +
      "serialisation, and a single construct pass are all linear:</p>",
      "<span class=\"eq\">T(n) = T(n<sub>L</sub>) + T(n<sub>R</sub>) + &Theta;(1) = &Theta;(n)</span>",
      "<p>The brute diameter recomputes heights from every node and is " +
      "<code>&Theta;(n&sup2;)</code> on a chain. Construction is <code>O(n)</code> with a " +
      "value-to-index map and <code>O(n&sup2;)</code> if you scan inorder at every split. " +
      "Space is the recursion depth <code>h</code>, plus <code>O(n)</code> for the codec " +
      "string or the index map.</p>",
    ],
    compare: [
      ["Brute diameter (height from every node)", "<code>O(n&sup2;)</code>", "<code>O(h)</code>", "Only as a checker"],
      ["Postorder + global", "<code>O(n)</code>", "<code>O(h)</code>", "Diameter, max path, cameras, robbers"],
      ["Construct with HashMap", "<code>O(n)</code>", "<code>O(n)</code>", "Unique values assumed"],
      ["Codec preorder + nulls", "<code>O(n)</code>", "<code>O(n)</code>", "Unique reconstruction"],
    ],
  },

  pitfalls: [
    { title: "Returning the bent path instead of the ray",
      bug: "Max-path-sum returns <code>val + L + R</code> to the parent. The parent then adds " +
        "its own value on top of a path that already used both children, which is not a path.",
      fix: "Return <code>val + max(L, R)</code>. Store <code>val + L + R</code> only in the global." },
    { title: "Not clamping negative children",
      bug: "A child with downward gain <code>-5</code> is still added, so the \"best path\" " +
        "includes a suffix that hurts. LC 124 fails on trees with mixed signs.",
      fix: "<code>L = Math.max(0, downGain(left))</code>." },
    { title: "Diameter in nodes vs edges",
      bug: "Updating the global with <code>hL + hR + 1</code> when the problem counts edges, " +
        "or the reverse. Off-by-one on every tree of size greater than 1.",
      fix: "With height-in-nodes, edges through the node are <code>hL + hR</code>. Verify on " +
        "a two-node tree: diameter is 1." },
    { title: "Construction without a cursor / mutating the arrays",
      bug: "Copying <code>Arrays.copyOfRange</code> at every split makes " +
        "<code>O(n&sup2;)</code> time and hides the preorder cursor. Duplicate values in " +
        "inorder also break a HashMap of indices.",
      fix: "Shared <code>preIdx</code> plus inorder range <code>[lo, hi]</code>. Unique " +
        "values are assumed by LC 105; if duplicates exist you cannot use a single map." },
    { title: "Serialising without null markers",
      bug: "Dumping only the preorder values. Many trees share that preorder, so " +
        "deserialise cannot recover the shape.",
      fix: "Emit a token for null children, or use level-order with trailing-null trimming " +
        "as in LC 297's BFS codec." },
  ],

  variants: [
    ["Path sum III (any downward path)",
      "Prefix sums on the current root-to-node path. At node u with prefix P, add " +
      "<code>count.get(P - target)</code>, then recurse, then decrement to backtrack.",
      "map.merge(P, 1, Integer::sum); dfs(left); dfs(right); map.merge(P, -1, Integer::sum);",
      "LC 437"],
    ["House robber III / binary-tree cameras",
      "Each node returns a small enum or pair: robbed-or-not, covered-or-not. Combine with " +
      "a 2- or 3-state recurrence. Same postorder skeleton.",
      "int[] dfs(Node u) returns {skip, take} or {hasCam, covered, need}",
      "LC 337, LC 968"],
    ["Lowest common ancestor (binary tree, not BST)",
      "If the current node is p or q, return it. Recurse; if both sides return non-null, " +
      "this node is the LCA. Otherwise bubble the non-null side.",
      "if (L != null && R != null) return node; return L != null ? L : R;",
      "LC 236"],
  ],

  followups: [
    ["Why can max-path-sum not just reuse the diameter code with values instead of 1s?",
      "<p>Diameter counts every edge on the two rays. Path sum must be allowed to <em>stop</em> " +
      "before a negative child, and the bend may use one side only. Replacing 1 with " +
      "<code>node.val</code> still forces both full heights, which is a different problem " +
      "(maximum-sum path among all root-to-leaf-to-root V-shapes of full height). Clamp and " +
      "the downward-gain return type are load-bearing.</p>"],
    ["How do you find all nodes at distance k from a target?",
      "<p>Build parent pointers in one walk (or return them as you search for the target), " +
      "then BFS from the target treating the tree as an undirected graph with degree at most " +
      "3. Stop at distance k. LC 863 is exactly that. Without parent pointers you can still " +
      "do it by returning distances upward, but BFS is simpler.</p>"],
    ["Can you flatten a tree to a linked list in place?",
      "<p>LC 114: postorder-ish. Flatten right, flatten left, then splice the old left as " +
      "the new right and walk to the tail to attach the old right. Alternatively, reverse " +
      "preorder: keep <code>prev</code> as the previously visited node in preorder and set " +
      "<code>prev.right = cur; prev.left = null</code>.</p>"],
    ["What if values are not unique in construction?",
      "<p>Inorder plus preorder no longer identifies a unique tree. You would need an extra " +
      "constraint (full tree, or BST so inorder is sorted and positions are determined by " +
      "value comparisons). Interviews that allow duplicates will usually say so; LC 105 " +
      "guarantees uniqueness.</p>"],
  ],

  problems: [
    { name: "Diameter of Binary Tree", url: "https://leetcode.com/problems/diameter-of-binary-tree/",
      badge: "lc", tag: "LC 543", level: "Easy", pattern: "Postorder height + global bend" },
    { name: "Binary Tree Maximum Path Sum", url: "https://leetcode.com/problems/binary-tree-maximum-path-sum/",
      badge: "lc", tag: "LC 124", level: "Hard", pattern: "Downward gain, clamp negatives" },
    { name: "Path Sum", url: "https://leetcode.com/problems/path-sum/",
      badge: "lc", tag: "LC 112", level: "Easy", pattern: "Root-to-leaf remaining" },
    { name: "Path Sum III", url: "https://leetcode.com/problems/path-sum-iii/",
      badge: "lc", tag: "LC 437", level: "Medium", pattern: "Prefix map on the current path" },
    { name: "Lowest Common Ancestor of a Binary Tree",
      url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/",
      badge: "lc", tag: "LC 236", level: "Medium", pattern: "Bubble both-sides-non-null" },
    { name: "Construct from Preorder and Inorder",
      url: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/",
      badge: "lc", tag: "LC 105", level: "Medium", pattern: "Cursor + inorder split" },
    { name: "Serialize and Deserialize Binary Tree",
      url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/",
      badge: "lc", tag: "LC 297", level: "Hard", pattern: "Preorder with null tokens" },
    { name: "Binary Tree Right Side View", url: "https://leetcode.com/problems/binary-tree-right-side-view/",
      badge: "lc", tag: "LC 199", level: "Medium", pattern: "Last node of each BFS level" },
    { name: "All Nodes Distance K", url: "https://leetcode.com/problems/all-nodes-distance-k-in-binary-tree/",
      badge: "lc", tag: "LC 863", level: "Medium", pattern: "Parents + BFS" },
    { name: "House Robber III", url: "https://leetcode.com/problems/house-robber-iii/",
      badge: "lc", tag: "LC 337", level: "Medium", pattern: "Two-state postorder" },
  ],

  spoilers: [
    { summary: "Hint for LC 124 &mdash; two numbers, not one",
      body: "<p>A path that bends at <code>u</code> cannot be extended by <code>u</code>'s " +
        "parent, so it is not a legal return value. Return only the best single-direction " +
        "extension, after dropping a negative child. Update the answer with the bent " +
        "candidate. Seed the answer with <code>Integer.MIN_VALUE</code> so a tree of all " +
        "negatives still reports the least-negative node.</p>" },
    { summary: "Hint for LC 437 &mdash; backtrack the prefix map",
      body: "<p>This is \"subarray sum equals k\" on the unique path from the root to the " +
        "current node. Insert the current prefix before recursing so descendants can use it, " +
        "and remove it after so a different branch does not see a prefix that is not on its " +
        "path. Forgetting the decrement is the bug that passes tests where all paths share " +
        "the same spine and fails on bushy trees.</p>" },
  ],

  recap: {
    bullets: [
      "<strong>Return a ray; store the bend in a global.</strong> Diameter and max-path-sum both do this.",
      "<strong>Clamp negatives</strong> when a path is allowed to stop.",
      "<strong>Construction:</strong> preorder cursor + inorder split via an index map.",
      "<strong>Codec:</strong> emit nulls, parse with the same cursor.",
      "<strong>Path-sum III</strong> is prefix sums on the current root-to-node path, with backtracking.",
    ],
    oneliner: "h=1+max(hL,hR); diam=max(hL+hR) | down=val+max(0,L,R); ans=val+L+R | build: preIdx + in-split",
  },
},

/* ====================================== 3. bst */
{
  id: "bst",
  difficulty: "Medium",
  readTime: "22 min",
  tagline: "Left &lt; node &lt; right, recursively. Inorder is sorted, search is a binary search " +
    "on the tree, and every BST problem is that invariant plus a walk.",
  tags: ["BST", "inorder", "search tree", "P0"],
  prereqs: [["Binary Tree Basics & Traversals", "binary-tree-basics-and-traversals.html"],
            ["Binary Search Basics", "../01-arrays-and-windows/binary-search-basics.html"]],

  why: {
    paras: [
      "A binary search tree stores ordered data in a tree so that search, insert, and (with " +
      "care) delete are <code>O(h)</code> rather than <code>O(n)</code>. In interviews the " +
      "tree is usually already built; the question is whether you <em>use</em> the invariant " +
      "or ignore it and write a generic tree walk. Using it turns \"validate\", \"k-th " +
      "smallest\", \"LCA\", and \"closest value\" into short, obviously-correct routines.",
      "The invariant is stronger than it looks. It is not enough that each node is between " +
      "its two children: every value in the left <em>subtree</em> must be smaller, and every " +
      "value in the right subtree larger. Checking only the two children accepts " +
      "<code>[5, 1, 6, null, null, 4, 7]</code>, which is not a BST because 4 sits in 5's " +
      "right subtree. That example is LC 98's trap.",
      "Inorder of a BST is a sorted array. That single fact gives you k-th smallest (walk " +
      "inorder, stop at k), recovery of a swapped pair (the two dips in an almost-sorted " +
      "inorder), conversion from a sorted array (mid becomes root), and an iterator. If a " +
      "BST question does not mention the invariant, the intended solution still uses it.",
    ],
    insight: "Carry a live <code>(low, high)</code> window down the tree, or walk inorder and " +
      "demand a strictly increasing sequence. Either formulation is the whole topic.",
  },

  recognise: {
    yes: [
      "The statement says \"binary search tree\" and values are comparable",
      "\"k-th smallest / largest\" in a BST (inorder is sorted)",
      "\"validate BST\", \"recover two swapped nodes\", \"trim a BST to [lo, hi]\"",
      "LCA of two nodes in a BST (walk down until they split)",
      "Insert / delete a key, or convert a sorted array to a height-balanced BST",
    ],
    no: [
      "A plain binary tree with no search invariant &rarr; " +
        "<a href=\"binary-tree-problem-patterns.html\">tree patterns</a>",
      "You need guaranteed <code>O(log n)</code> on adversarial input &rarr; balanced trees " +
        "(AVL / red-black), which interviews almost never ask you to code",
      "String prefixes or XOR &rarr; <a href=\"trie.html\">trie</a>",
      "Range queries on an array &rarr; " +
        "<a href=\"../06-range-queries/segment-tree.html\">segment tree</a>",
    ],
    table: [
      ["\"validate BST\"", "Every subtree must lie in a live (low, high) window", "DFS with bounds, or inorder increasing"],
      ["\"k-th smallest\"", "Inorder is sorted; stop at visit k", "Inorder counter, or augmented size"],
      ["\"insert / delete a key\"", "Search path, then splice", "Standard BST update"],
      ["\"LCA of p and q in a BST\"", "First node with p and q on different sides", "Walk from the root, no parent pointers"],
      ["\"convert sorted array to BST\"", "Mid of the range is the root", "Divide and conquer"],
      ["\"trim to [lo, hi]\"", "Drop whole subtrees that lie outside", "Postorder splice"],
      ["<strong>Confused with:</strong> heap / binary heap",
        "Heap order is parent vs children, not a total inorder",
        "Heaps for k-th in an unsorted array, not BST inorder"],
    ],
    constraint: "If the tree is balanced, <code>h = O(log n)</code> and everything on this " +
      "page is logarithmic. If it can be skew, <code>h = n</code> and you are back to linear. " +
      "Statements rarely promise balance; say the complexity in terms of <code>h</code>.",
  },

  core: {
    heading: "Core idea and the invariant",
    paras: [
      "Search follows the same decisions as binary search: go left if the key is smaller, " +
      "right if larger, stop on equal or null. Insert walks to a null and hangs the new node " +
      "there. Delete has three cases: leaf (drop it), one child (replace with the child), two " +
      "children (replace with the inorder successor, then delete that successor, which has no " +
      "left child).",
      "Validation threads a window. At the root the window is <code>(-&infin;, +&infin;)</code>. " +
      "Going left tightens the high bound to the current value; going right tightens the low " +
      "bound. The node is legal iff <code>low &lt; val &lt; high</code> (strict, if duplicates " +
      "are forbidden). Equivalently, inorder must be strictly increasing: keep " +
      "<code>prev</code> and demand <code>prev &lt; cur</code> at every visit.",
      "LCA in a BST does not need the generic LC 236 trick. Walk from the root: while both " +
      "keys are smaller, go left; while both are larger, go right; otherwise this node splits " +
      "them and is the LCA (or equals one of them).",
    ],
    invariantTitle: "The invariant",
    invariant: "<p>For every node <code>u</code>:</p>" +
      "<span class=\"eq\">max(left subtree of u) &lt; u.val &lt; min(right subtree of u)</span>" +
      "<p>Interview sentence: <em>\"I do not just compare with the two children; I compare " +
      "with a window inherited from every ancestor.\"</em></p>",
    extra: [
      { kind: "warn", title: "Children-only checks are not enough",
        html: "<p>LC 98's counterexample <code>[5,1,6,null,null,4,7]</code> has every node " +
          "between its children, but 4 is in 5's right subtree. Carry " +
          "<code>(low, high)</code>, or walk inorder.</p>" },
      { kind: "tip", title: "Successor is the leftmost of the right subtree",
        html: "<p>That node has no left child, so deleting it is the one-child case. This is " +
          "why two-child delete reduces to one-child delete after a value copy.</p>" },
    ],
  },

  visuals: [
    {
      kind: "array", vizId: "bstSearch",
      h3: "Search for 5, then inorder filling a sorted array",
      intro: "BST <code>4 / 2 6 / 1 3 5 7</code>. First frames follow the search path to 5; " +
        "later frames emit inorder into a flat array.",
      caption: "Search is a binary search: 4 too small, 6 too big, 5 hit. Inorder then proves " +
        "the invariant by writing a sorted list.",
      data: {
        label: "inorder output (sorted)",
        array: ["", "", "", "", "", "", ""],
        indexLabels: ["0", "1", "2", "3", "4", "5", "6"],
        vars: ["node", "cmp", "written"],
        speed: 900,
        frames: [
          { note: "Search 5. At 4: 5 > 4, go right.",
            arr: ["", "", "", "", "", "", ""], active: [],
            values: { node: 4, cmp: "5 > 4", written: 0 } },
          { note: "At 6: 5 < 6, go left.",
            arr: ["", "", "", "", "", "", ""], active: [],
            values: { node: 6, cmp: "5 < 6", written: 0 } },
          { note: "At 5: equal. Search done in three steps, not seven.",
            arr: ["", "", "", "", "", "", ""], best: [],
            values: { node: 5, cmp: "hit", written: 0 } },
          { note: "Now inorder. Visit 1, then 2, then 3.",
            arr: [1, 2, 3, "", "", "", ""], active: [0, 1, 2], dim: [3, 4, 5, 6],
            values: { node: 3, cmp: "inorder", written: 3 } },
          { note: "Visit 4 (root), then 5.",
            arr: [1, 2, 3, 4, 5, "", ""], active: [3, 4], done: [0, 1, 2], dim: [5, 6],
            values: { node: 5, cmp: "inorder", written: 5 } },
          { note: "Visit 6, then 7. Array is strictly increasing, so the tree is a BST.",
            arr: [1, 2, 3, 4, 5, 6, 7], done: [0, 1, 2, 3, 4, 5, 6],
            values: { node: 7, cmp: "sorted", written: 7 } },
          { note: "k-th smallest for k = 3 is inorder[2] = 3. Stop the walk after three visits.",
            arr: [1, 2, 3, 4, 5, 6, 7], best: [2], done: [0, 1, 3, 4, 5, 6],
            values: { node: 3, cmp: "k=3", written: 3 } },
        ],
      },
    },
    {
      kind: "mermaid", vizId: "bstShape",
      h3: "The sample BST",
      caption: "Search for 5 follows 4 then 6 then 5. LCA of 1 and 3 is 2; LCA of 3 and 5 is 4.",
      src: `graph TD
  b4["4"] --> b2["2"]
  b4 --> b6["6"]
  b2 --> b1["1"]
  b2 --> b3["3"]
  b6 --> b5["5"]
  b6 --> b7["7"]`,
    },
  ],

  steps: [
    "<strong>Search / insert:</strong> from the root, go left if <code>key &lt; node.val</code>, " +
      "right otherwise, until you hit the key or a null.",
    "<strong>Validate:</strong> DFS with a live <code>(low, high)</code> window, or inorder with " +
      "a <code>prev</code> pointer. Do not only compare a node to its two children.",
    "<strong>k-th smallest:</strong> inorder, increment a counter on visit, stop at k. " +
      "Augment nodes with subtree sizes if you need repeated queries.",
    "<strong>LCA:</strong> walk down while both keys are on the same side; the split node is the LCA.",
    "<strong>Delete:</strong> leaf / one child / two children. Two-child case copies the inorder " +
      "successor, then deletes that successor.",
    "<strong>Sorted array to BST:</strong> mid of <code>[lo, hi]</code> is the root; recurse on " +
      "the two halves. Use <code>mid = lo + (hi - lo) / 2</code>.",
    "<strong>Quote complexity in <code>h</code></strong>, not <code>log n</code>, unless balance " +
      "is promised.",
  ],

  dryRun: {
    intro: "Validate the sample BST with a <code>(low, high)</code> window. Bounds are " +
      "exclusive. <code>&minus;&infin;</code> / <code>+&infin;</code> shown as L / H.",
    cols: ["node", "low", "high", "ok?", "next"],
    rows: [
      { cells: ["4", "L", "H", "yes", "left window (L, 4), right (4, H)"], action: "Root", change: true },
      { cells: ["2", "L", "4", "yes", "left (L, 2), right (2, 4)"], action: "Go left", change: true },
      { cells: ["1", "L", "2", "yes", "both children null"], action: "Leaf", change: true },
      { cells: ["3", "2", "4", "yes", "leaf"], action: "Right of 2", change: true },
      { cells: ["6", "4", "H", "yes", "left (4, 6), right (6, H)"], action: "Right of 4", change: true },
      { cells: ["5", "4", "6", "yes", "leaf"], action: "Fits strictly inside", change: true },
      { cells: ["7", "6", "H", "yes", "leaf"], action: "Tree is a BST", change: true },
    ],
    after: "<p>If 5 were 8, the window at that node would still be <code>(4, 6)</code>, and " +
      "<code>8 &lt; 6</code> would fail &mdash; even though 8 is greater than its parent 6.</p>",
  },

  code: [
    { tab: "Brute inorder", panel: "Brute", file: "BstInorder.java",
      intro: "Dump inorder into a list, then test increasing / pick index k. Correct, extra " +
        "<code>O(n)</code> memory, and does not use the search structure for lookup.",
      highlight: "22-28,31-35",
      code: `import java.util.ArrayList;
import java.util.List;

public class BstInorder {

    static class Node {
        int val;
        Node left, right;
        Node(int v) { val = v; }
    }

    static void inorder(Node node, List<Integer> out) {
        if (node == null) return;
        inorder(node.left, out);
        out.add(node.val);
        inorder(node.right, out);
    }

    static boolean isValid(Node root) {
        List<Integer> a = new ArrayList<>();
        inorder(root, a);
        for (int i = 1; i < a.size(); i++) {
            if (a.get(i) <= a.get(i - 1)) return false;
        }
        return true;
    }

    static int kth(Node root, int k) {
        List<Integer> a = new ArrayList<>();
        inorder(root, a);
        return a.get(k - 1);
    }

    public static void main(String[] args) {
        Node r = new Node(4);
        r.left = new Node(2); r.right = new Node(6);
        r.left.left = new Node(1); r.left.right = new Node(3);
        r.right.left = new Node(5); r.right.right = new Node(7);
        System.out.println(isValid(r));
        System.out.println(kth(r, 3));
    }
    // Input : BST 4 / 2 6 / 1 3 5 7, k = 3
    // Output: true
    //         3
}`,
    },
    { tab: "Optimal", panel: "Optimal", file: "BinarySearchTree.java",
      intro: "Window validation, search, and BST-LCA all walk a single path. k-th smallest " +
        "still uses inorder but stops early via a counter.",
      highlight: "16-22,25-28,31-40,43-51",
      code: `public class BinarySearchTree {

    static class Node {
        int val;
        Node left, right;
        Node(int v) { val = v; }
    }

    static boolean valid(Node node, long low, long high) {
        if (node == null) return true;
        if (node.val <= low || node.val >= high) return false;
        return valid(node.left, low, node.val)
            && valid(node.right, node.val, high);
    }

    static Node search(Node node, int key) {
        while (node != null && node.val != key) {
            node = (key < node.val) ? node.left : node.right;
        }
        return node;
    }

    static Node lca(Node node, int p, int q) {
        while (node != null) {
            if (p < node.val && q < node.val) node = node.left;
            else if (p > node.val && q > node.val) node = node.right;
            else return node;
        }
        return null;
    }

    static int remain;

    static Integer kth(Node node, int k) {
        remain = k;
        return kthGo(node);
    }

    static Integer kthGo(Node node) {
        if (node == null) return null;
        Integer left = kthGo(node.left);
        if (left != null) return left;
        if (--remain == 0) return node.val;
        return kthGo(node.right);
    }

    public static void main(String[] args) {
        Node r = new Node(4);
        r.left = new Node(2); r.right = new Node(6);
        r.left.left = new Node(1); r.left.right = new Node(3);
        r.right.left = new Node(5); r.right.right = new Node(7);
        System.out.println(valid(r, Long.MIN_VALUE, Long.MAX_VALUE));
        System.out.println(search(r, 5).val);
        System.out.println(lca(r, 1, 3).val);
        System.out.println(kth(r, 3));
    }
    // Input : BST 4 / 2 6 / 1 3 5 7
    // Output: true
    //         5
    //         2
    //         3
}`,
    },
    { tab: "Insert / delete", panel: "Template", file: "BstUpdate.java",
      intro: "Insert hangs a new leaf on the search path. Delete reduces the two-child case " +
        "to one-child via the inorder successor.",
      highlight: "16-22,25-44",
      code: `public class BstUpdate {

    static class Node {
        int val;
        Node left, right;
        Node(int v) { val = v; }
    }

    static Node insert(Node node, int key) {
        if (node == null) return new Node(key);
        if (key < node.val) node.left = insert(node.left, key);
        else if (key > node.val) node.right = insert(node.right, key);
        return node;
    }

    static Node delete(Node node, int key) {
        if (node == null) return null;
        if (key < node.val) node.left = delete(node.left, key);
        else if (key > node.val) node.right = delete(node.right, key);
        else {
            if (node.left == null) return node.right;
            if (node.right == null) return node.left;
            Node succ = node.right;
            while (succ.left != null) succ = succ.left;
            node.val = succ.val;
            node.right = delete(node.right, succ.val);
        }
        return node;
    }

    static void inorder(Node node, StringBuilder sb) {
        if (node == null) return;
        inorder(node.left, sb);
        sb.append(node.val).append(' ');
        inorder(node.right, sb);
    }

    public static void main(String[] args) {
        Node r = null;
        for (int v : new int[] {4, 2, 6, 1, 3, 5, 7}) r = insert(r, v);
        r = delete(r, 4);
        StringBuilder sb = new StringBuilder();
        inorder(r, sb);
        System.out.println(sb.toString().trim());
    }
    // Input : insert 4 2 6 1 3 5 7, delete 4
    // Output: 1 2 3 5 6 7
}`,
    },
  ],

  complexity: {
    time: "O(h) per search / insert / delete / LCA; O(n) validate; O(h + k) k-th",
    space: "O(h) recursion",
    derivation: [
      "<p>A search follows one root-to-leaf path, so it is <code>&Theta;(h)</code>. Insert and " +
      "the BST-LCA walk are the same. Delete is one search plus a walk to the successor, still " +
      "<code>O(h)</code>.</p>",
      "<span class=\"eq\">h = &Theta;(log n) if balanced, &nbsp; h = &Theta;(n) if skew</span>",
      "<p>Validate and naive k-th must look at every node in the worst case (k = n, or a " +
      "broken node in the last leaf). Augmenting each node with a subtree size makes k-th " +
      "<code>O(h)</code> by jumping into the correct child.</p>",
    ],
    compare: [
      ["Search / insert / LCA", "<code>O(h)</code>", "<code>O(1)</code> iterative", "Uses the invariant"],
      ["Validate via windows", "<code>O(n)</code>", "<code>O(h)</code>", "Must visit every node"],
      ["k-th via inorder", "<code>O(h + k)</code>", "<code>O(h)</code>", "Stop early when k is small"],
      ["k-th via subtree sizes", "<code>O(h)</code>", "<code>O(n)</code> extra", "Repeated order-statistic queries"],
    ],
  },

  pitfalls: [
    { title: "Checking only the two children",
      bug: "<code>left.val &lt; node.val &lt; right.val</code> and recurse. LC 98's " +
        "<code>[5,1,6,null,null,4,7]</code> is accepted and should not be.",
      fix: "Pass <code>(low, high)</code>, or require strictly increasing inorder." },
    { title: "<code>int</code> overflow in the window",
      bug: "Node values include <code>Integer.MIN_VALUE</code> / <code>MAX_VALUE</code>. " +
        "Seeding the window with those makes a legal extreme node fail, or wrapping " +
        "<code>node.val - 1</code>.",
      fix: "Use <code>long</code> bounds seeded with <code>Long.MIN_VALUE</code> / " +
        "<code>MAX_VALUE</code>, and compare without subtracting." },
    { title: "Allowing duplicates on the wrong side",
      bug: "The problem forbids duplicates but <code>key &lt;= node.val</code> sends equals " +
        "left, silently building an invalid tree. Or the problem allows them and you reject.",
      fix: "Read the statement. LC 98 is strict. Some insert problems put equals on the right." },
    { title: "Delete without handling the successor",
      bug: "Replacing a two-child node with <code>node.right</code> wholesale, which drops " +
        "the left subtree or breaks the order.",
      fix: "Copy the inorder successor's value, then delete the successor (guaranteed one child at most)." },
    { title: "Using generic-tree LCA on a BST",
      bug: "Parent pointers plus a set of ancestors. Correct but <code>O(n)</code> extra and " +
        "misses the point.",
      fix: "Walk from the root until the two keys split. That node is the LCA." },
  ],

  variants: [
    ["Trim a BST to [lo, hi]",
      "If the node is below lo, the whole left subtree is junk: return trim(right). Symmetric " +
      "for hi. Otherwise splice both children.",
      "if (val < lo) return trim(right, lo, hi); if (val > hi) return trim(left, lo, hi);",
      "LC 669"],
    ["Recover two swapped nodes",
      "Inorder is almost sorted with two dips. First dip's left is the high swapped value; " +
      "last dip's right is the low one. Swap them back.",
      "if (prev.val > cur.val) { if (first==null) first=prev; second=cur; }",
      "LC 99"],
    ["Iterator / generator",
      "The iterative inorder stack is a BST iterator: <code>next()</code> pops and pushes " +
      "the right child's left spine. Amortised O(1) per next.",
      "while (cur != null) { st.push(cur); cur = cur.left; }",
      "LC 173"],
  ],

  followups: [
    ["Why is a BST not always O(log n)?",
      "<p>Nothing in the definition rebalances. Inserting sorted keys produces a linked list " +
      "of height n. Balanced BSTs (AVL, red-black, treap) restore the log by rotations. " +
      "Interviews almost never ask you to code those; they do expect you to quote " +
      "<code>O(h)</code> rather than casually saying <code>O(log n)</code>.</p>"],
    ["How do you find the inorder successor of a node without a parent pointer?",
      "<p>If the node has a right child, successor is the leftmost of that subtree. Otherwise " +
      "you must walk from the root and remember the last node you took a left turn from " +
      "&mdash; that is the deepest ancestor for which the node is in the left subtree.</p>"],
    ["Can you delete without copying the successor's value?",
      "<p>Yes: splice the successor out of its place and then overwrite the deleted node's " +
      "left/right/parent links so the successor occupies the deleted node's position. Value " +
      "copy is shorter and fine when nodes hold only an int; splicing is required when " +
      "external pointers to the node must remain valid.</p>"],
    ["What is a self-balancing alternative you can actually code in a contest?",
      "<p>A policy-based data structure in C++, or in Java a <code>TreeMap</code> (red-black). " +
      "If you must roll your own, a treap (random priorities plus BST keys) is the usual " +
      "contest choice. For interviews, <code>TreeMap</code> plus the patterns on this page " +
      "is the expected toolkit.</p>"],
  ],

  problems: [
    { name: "Validate Binary Search Tree", url: "https://leetcode.com/problems/validate-binary-search-tree/",
      badge: "lc", tag: "LC 98", level: "Medium", pattern: "Window DFS or increasing inorder" },
    { name: "Search in a Binary Search Tree", url: "https://leetcode.com/problems/search-in-a-binary-search-tree/",
      badge: "lc", tag: "LC 700", level: "Easy", pattern: "Walk one path" },
    { name: "Insert into a Binary Search Tree", url: "https://leetcode.com/problems/insert-into-a-binary-search-tree/",
      badge: "lc", tag: "LC 701", level: "Medium", pattern: "Hang a new leaf" },
    { name: "Delete Node in a BST", url: "https://leetcode.com/problems/delete-node-in-a-bst/",
      badge: "lc", tag: "LC 450", level: "Medium", pattern: "Three cases, successor copy" },
    { name: "Kth Smallest Element in a BST", url: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/",
      badge: "lc", tag: "LC 230", level: "Medium", pattern: "Inorder counter" },
    { name: "Lowest Common Ancestor of a BST",
      url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/",
      badge: "lc", tag: "LC 235", level: "Medium", pattern: "Walk until the keys split" },
    { name: "Convert Sorted Array to BST",
      url: "https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/",
      badge: "lc", tag: "LC 108", level: "Easy", pattern: "Mid is root" },
    { name: "Recover Binary Search Tree", url: "https://leetcode.com/problems/recover-binary-search-tree/",
      badge: "lc", tag: "LC 99", level: "Medium", pattern: "Two dips in inorder" },
    { name: "Trim a Binary Search Tree", url: "https://leetcode.com/problems/trim-a-binary-search-tree/",
      badge: "lc", tag: "LC 669", level: "Medium", pattern: "Drop whole out-of-range subtrees" },
    { name: "Binary Search Tree Iterator", url: "https://leetcode.com/problems/binary-search-tree-iterator/",
      badge: "lc", tag: "LC 173", level: "Medium", pattern: "Inorder stack as an iterator" },
  ],

  spoilers: [
    { summary: "Hint for LC 98 &mdash; the window, not the children",
      body: "<p>A node can sit between its two children and still violate an ancestor's bound. " +
        "Thread <code>low</code> and <code>high</code> (as <code>long</code>) so that going " +
        "left sets <code>high = node.val</code> and going right sets <code>low = node.val</code>. " +
        "The inorder formulation is equivalent and sometimes shorter: if the sequence ever " +
        "fails to increase, some ancestor-window was violated.</p>" },
    { summary: "Hint for LC 99 &mdash; two swapped values in an otherwise-sorted inorder",
      body: "<p>If you swap two non-adjacent nodes, inorder has two inversions: the first is " +
        "<code>a[i] &gt; a[i+1]</code> where <code>a[i]</code> is the larger swapped value, " +
        "and the second is where <code>a[i+1]</code> is the smaller. Adjacent swaps produce " +
        "one inversion covering both. Track <code>first</code> on the first dip and always " +
        "update <code>second</code> to the current node of a dip; then swap those two values.</p>" },
  ],

  recap: {
    bullets: [
      "<strong>The real invariant is on whole subtrees</strong>, not just the two children.",
      "<strong>Inorder is sorted</strong> &mdash; k-th, recover, iterator all use that.",
      "<strong>Search / insert / BST-LCA are one path</strong>, complexity <code>O(h)</code>.",
      "<strong>Delete's two-child case</strong> copies the successor and reduces to one child.",
      "<strong>Use <code>long</code> windows</strong> so <code>Integer.MIN_VALUE</code> is legal.",
    ],
    oneliner: "low < val < high on the way down | inorder strictly increasing | LCA: walk until p,q split",
  },
},

/* ====================================== 4. tree-dp-and-rerooting */
{
  id: "tree-dp-and-rerooting",
  difficulty: "Medium",
  readTime: "26 min",
  tagline: "Compute a subtree DP rooted at an arbitrary node, then reroot in <code>O(1)</code> " +
    "per edge so every node becomes the root in a second linear pass.",
  tags: ["tree DP", "rerooting", "subtree", "P1"],
  prereqs: [["Binary Tree Problem Patterns", "binary-tree-problem-patterns.html"],
            ["DFS & Connected Components", "../07-graphs-core/dfs-and-components.html"]],

  why: {
    paras: [
      "On a tree, the unique path between two nodes means many global questions decompose into " +
      "independent questions on subtrees. \"Diameter\", \"number of nodes at distance k\", " +
      "\"whether we can place cameras\", \"sum of distances from every node\" all have a " +
      "subtree recurrence. The first DFS computes the answer as if one chosen node were the " +
      "root. That is already enough for a lot of problems.",
      "The second idea, rerooting, handles \"the answer for every possible root\". After the " +
      "downward pass you know, for each child, the contribution of its subtree. Moving the " +
      "root across one edge is an <code>O(1)</code> update: subtract the child's subtree, add " +
      "the rest of the tree as a new \"child\". A second DFS pushes those updated values down, " +
      "so all <code>n</code> roots are answered in <code>O(n)</code> instead of " +
      "<code>O(n&sup2;)</code> separate rootings.",
      "This is the difference between LC 543 (one diameter) and LC 834 (sum of distances from " +
      "<em>every</em> node), and between \"find a centroid\" and \"answer a DP at every " +
      "vertex\". Contest problems (CF 219D, CF 161D) almost always want the all-roots version.",
    ],
    insight: "One DFS computes a rooted DP. Rerooting reuses that DP across every adjacent " +
      "root in O(1), so all-roots answers cost a second linear pass, not n separate DPs.",
  },

  recognise: {
    yes: [
      "\"For every vertex, compute ...\" on a tree (all-roots)",
      "\"Sum of distances from all nodes\", \"choose a capital\", \"reroot the tree\"",
      "A DP state that depends only on the forest of subtrees hanging off a node",
      "Diameter of an unrooted tree, or maximum path that may not go through a given root",
      "Counting pairs of nodes at distance k on a tree (tree-knapsack / merge-smaller)",
    ],
    no: [
      "The graph has cycles &rarr; this is not a tree; use DAG DP after condensation, or a " +
        "different graph algorithm",
      "Binary tree with parent pointers already, and the answer is a single root-to-leaf " +
        "quantity &rarr; " +
        "<a href=\"binary-tree-problem-patterns.html\">ordinary postorder</a>",
      "Subtree sums under updates &rarr; " +
        "<a href=\"euler-tour-subtree-queries.html\">Euler tour + Fenwick</a>",
      "You only need LCA or k-th ancestor &rarr; <a href=\"lca-binary-lifting.html\">binary lifting</a>",
    ],
    table: [
      ["\"subtree size / sum / hash of every node\"", "Rooted DP, one DFS", "Postorder on the rooted tree"],
      ["\"sum of distances from every node\"", "Reroot: ans[c] = ans[u] - sz[c] + (n-sz[c])", "LC 834"],
      ["\"choose a capital / min max-distance\"", "All-roots eccentricity", "Reroot heights, CF 219D"],
      ["\"tree diameter\"", "Two BFS, or DP of two longest child rays", "Either works in O(n)"],
      ["\"count pairs at distance k\"", "Merge child histograms, or centroid", "CF 161D"],
      ["\"paint / cut an edge, DP both sides\"", "Need the complement of a subtree", "Reroot or prefix-on-children"],
      ["<strong>Confused with:</strong> binary-tree max path (LC 124)",
        "That is a rooted postorder on a binary tree, not an unrooted all-roots DP",
        "<a href=\"binary-tree-problem-patterns.html\">Tree patterns</a>"],
    ],
    constraint: "<code>n &le; 2&times;10&#8309;</code> on a tree forbids " +
      "<code>O(n&sup2;)</code> re-rooting. The signature of rerooting is \"answer at every " +
      "vertex\" plus a linear limit. Use adjacency lists, not a binary <code>left/right</code>.",
  },

  core: {
    heading: "Core idea and the invariant",
    paras: [
      "Root the tree at 0. The first DFS computes, for every <code>u</code>, a DP that only " +
      "looks at children: subtree size, sum of distances downward, two longest downward rays, " +
      "and so on. Parent-child edges are skipped by passing <code>p</code> so the undirected " +
      "tree is traversed as a rooted one.",
      "Rerooting for sum-of-distances is the cleanest identity. After the first pass, " +
      "<code>down[u]</code> is the sum of distances from <code>u</code> to nodes in its " +
      "subtree, and <code>sz[u]</code> is the subtree size. When the root moves from " +
      "<code>u</code> to child <code>c</code>, every node in <code>c</code>'s subtree gets " +
      "one closer, and the other <code>n - sz[c]</code> nodes get one farther:",
      "The same pattern works for any DP where you can <em>subtract a child's contribution " +
      "and add the complement</em> in constant (or <code>O(degree)</code>) time. If combining " +
      "two child answers is <code>O(f)</code>, rerooting is usually " +
      "<code>O(n f)</code> after a prefix/suffix fold over children so you can form \"all " +
      "siblings except me\" quickly.",
    ],
    invariantTitle: "The invariant",
    invariant: "<p>After the downward pass, <code>down[u]</code> is the answer inside the " +
      "subtree. Rerooting across <code>u &rarr; c</code> updates the all-tree answer by " +
      "moving one step:</p>" +
      "<span class=\"eq\">ans[c] = ans[u] &minus; sz[c] + (n &minus; sz[c])</span>" +
      "<p>Interview sentence: <em>\"I solve it at one root, then I move the root across each " +
      "edge in O(1) instead of recomputing.\"</em></p>",
    extra: [
      { kind: "math", title: "Why the reroot formula holds",
        html: "<p>Every node in <code>c</code>'s subtree (there are <code>sz[c]</code> of " +
          "them) has its distance from the root decrease by 1. Every node outside that " +
          "subtree (<code>n - sz[c]</code> of them) has its distance increase by 1. Adding " +
          "those two signed counts to <code>ans[u]</code> yields <code>ans[c]</code>.</p>" },
      { kind: "tip", title: "Prefix / suffix over children",
        html: "<p>When the combine is not a simple sum (e.g. product, gcd, two longest " +
          "rays), precompute prefix and suffix aggregates of the children's DP values so " +
          "that \"everything except child i\" is two lookups. That keeps rerooting " +
          "<code>O(n)</code> even if a node has a large degree.</p>" },
    ],
  },

  visuals: [
    {
      kind: "array", vizId: "rerootAns",
      h3: "Subtree sizes, downward sums, then rerooted answers",
      intro: "Tree on nodes <code>0-4</code> with edges <code>0-1, 0-2, 2-3, 2-4</code>. " +
        "Watch <code>sz</code> then <code>ans</code> fill. Root starts at 0.",
      caption: "First pass writes subtree sizes in postorder. Second pass writes " +
        "<code>ans[c] = ans[u] - sz[c] + (n - sz[c])</code> on the way down.",
      data: {
        label: "ans[u] = sum of distances from u",
        array: ["", "", "", "", ""],
        indexLabels: ["0", "1", "2", "3", "4"],
        vars: ["u", "sz[u]", "ans[u]"],
        speed: 950,
        frames: [
          { note: "Postorder: leaves 1, 3, 4 have sz = 1. Node 2 has children 3 and 4, sz[2] = 3. Root sz[0] = 5.",
            arr: [5, 1, 3, 1, 1], active: [0], done: [1, 2, 3, 4],
            values: { u: 0, "sz[u]": 5, "ans[u]": "down=6" } },
          { note: "down[0] = 6 is the sum of distances from 0: 1+1+2+2. Seed ans[0] = 6.",
            arr: [6, "", "", "", ""], active: [0], dim: [1, 2, 3, 4],
            values: { u: 0, "sz[u]": 5, "ans[u]": 6 } },
          { note: "Reroot 0 to 1: ans[1] = 6 - 1 + 4 = 9. The single node in 1's subtree got closer; the other four got farther.",
            arr: [6, 9, "", "", ""], active: [1], done: [0], dim: [2, 3, 4],
            values: { u: 1, "sz[u]": 1, "ans[u]": 9 } },
          { note: "Reroot 0 to 2: ans[2] = 6 - 3 + 2 = 5.",
            arr: [6, 9, 5, "", ""], active: [2], done: [0, 1], dim: [3, 4],
            values: { u: 2, "sz[u]": 3, "ans[u]": 5 } },
          { note: "Reroot 2 to 3: ans[3] = 5 - 1 + 4 = 8.",
            arr: [6, 9, 5, 8, ""], active: [3], done: [0, 1, 2], dim: [4],
            values: { u: 3, "sz[u]": 1, "ans[u]": 8 } },
          { note: "Reroot 2 to 4: ans[4] = 5 - 1 + 4 = 8. All five roots answered in two linear passes.",
            arr: [6, 9, 5, 8, 8], active: [4], done: [0, 1, 2, 3],
            values: { u: 4, "sz[u]": 1, "ans[u]": 8 } },
          { note: "Check: from 2 the distances are 1 (to 0), 2 (to 1), 1 (to 3), 1 (to 4) summing to 5. Matches.",
            arr: [6, 9, 5, 8, 8], best: [2], done: [0, 1, 3, 4],
            values: { u: "check", "sz[u]": "n=5", "ans[u]": 5 } },
        ],
      },
    },
    {
      kind: "mermaid", vizId: "rerootTree",
      h3: "The sample unrooted tree",
      caption: "Rooted at 0 for the first DFS. Moving the root to 2 subtracts the size-3 subtree and adds the complement of size 2.",
      src: `graph TD
  r0["0"] --> r1["1"]
  r0 --> r2["2"]
  r2 --> r3["3"]
  r2 --> r4["4"]`,
    },
  ],

  steps: [
    "<strong>Build an undirected adjacency list</strong> of size <code>n</code>. Trees in this " +
      "family are not binary <code>left/right</code> nodes.",
    "<strong>First DFS</strong> from an arbitrary root: skip the parent, compute " +
      "<code>sz[u]</code> and the downward DP <code>down[u]</code> from children.",
    "<strong>Seed <code>ans[root] = down[root]</code></strong> (or whatever the full-tree " +
      "answer is at that root).",
    "<strong>Second DFS</strong> reroots: for each child, " +
      "<code>ans[c] = combine(ans[u], u, c)</code> in O(1), then recurse.",
    "<strong>For non-sum DPs</strong>, precompute prefix/suffix aggregates of children's " +
      "contributions so \"all siblings except me\" is O(1).",
    "<strong>Never recurse into the parent.</strong> Pass <code>p</code> and skip it; a missed " +
      "skip infinite-loops on the undirected edge.",
    "<strong>Use <code>long</code></strong> for sums of distances: " +
      "<code>n = 10&#8309;</code> and path length <code>n</code> reach <code>10&sup1;&#8308;</code>.",
  ],

  dryRun: {
    intro: "Rerooting sum-of-distances on the sample. <code>n = 5</code>. First five conceptual " +
      "rows are the downward pass; the rest apply the formula.",
    cols: ["u", "parent", "sz[u]", "ans[u]", "formula"],
    rows: [
      { cells: ["1", "0", "1", "\u2014", "leaf, down = 0"], action: "First DFS", change: false },
      { cells: ["3", "2", "1", "\u2014", "leaf"], action: "First DFS", change: false },
      { cells: ["4", "2", "1", "\u2014", "leaf"], action: "First DFS", change: false },
      { cells: ["2", "0", "3", "\u2014", "down = 0+1 + 0+1 = 2"], action: "First DFS", change: true },
      { cells: ["0", "\u2014", "5", "6", "down = 0+1 + 2+3 = 6, seed ans"], action: "Seed", change: true },
      { cells: ["1", "0", "1", "9", "6 - 1 + 4"], action: "Reroot 0 to 1", change: true },
      { cells: ["2", "0", "3", "5", "6 - 3 + 2"], action: "Reroot 0 to 2", change: true },
      { cells: ["3", "2", "1", "8", "5 - 1 + 4"], action: "Reroot 2 to 3", change: true },
      { cells: ["4", "2", "1", "8", "5 - 1 + 4"], action: "Reroot 2 to 4", change: true },
    ],
    after: "<p>The all-roots array is <code>[6, 9, 5, 8, 8]</code>, matching LC 834's shape of " +
      "answer.</p>",
  },

  code: [
    { tab: "Brute all-roots", panel: "Brute", file: "BruteRooting.java",
      intro: "For each candidate root, DFS and sum depths. Correct, <code>O(n&sup2;)</code>, " +
        "dies at <code>n = 10&#8309;</code>.",
      highlight: "16-24",
      code: `import java.util.ArrayList;
import java.util.List;

public class BruteRooting {

    static long dfs(List<Integer>[] g, int u, int p, int depth) {
        long s = depth;
        for (int v : g[u]) if (v != p) s += dfs(g, v, u, depth + 1);
        return s;
    }

    static long[] brute(List<Integer>[] g) {
        int n = g.length;
        long[] ans = new long[n];
        for (int r = 0; r < n; r++) ans[r] = dfs(g, r, -1, 0);
        return ans;
    }

    @SuppressWarnings("unchecked")
    public static void main(String[] args) {
        int n = 5;
        List<Integer>[] g = new ArrayList[n];
        for (int i = 0; i < n; i++) g[i] = new ArrayList<>();
        int[][] e = {{0, 1}, {0, 2}, {2, 3}, {2, 4}};
        for (int[] x : e) { g[x[0]].add(x[1]); g[x[1]].add(x[0]); }
        long[] ans = brute(g);
        for (int i = 0; i < n; i++) System.out.print(ans[i] + (i + 1 < n ? " " : "\\n"));
    }
    // Input : n=5 edges 0-1 0-2 2-3 2-4
    // Output: 6 9 5 8 8
}`,
    },
    { tab: "Rerooting", panel: "Optimal", file: "TreeReroot.java",
      intro: "Two DFS passes. The second applies the O(1) identity across every edge.",
      highlight: "18-27,30-38",
      code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class TreeReroot {

    static int n;
    static List<Integer>[] g;
    static int[] sz;
    static long[] down, ans;

    static void dfs1(int u, int p) {
        sz[u] = 1;
        down[u] = 0;
        for (int v : g[u]) if (v != p) {
            dfs1(v, u);
            sz[u] += sz[v];
            down[u] += down[v] + sz[v];
        }
    }

    static void dfs2(int u, int p) {
        for (int v : g[u]) if (v != p) {
            ans[v] = ans[u] - sz[v] + (n - sz[v]);
            dfs2(v, u);
        }
    }

    @SuppressWarnings("unchecked")
    public static void main(String[] args) {
        n = 5;
        g = new ArrayList[n];
        for (int i = 0; i < n; i++) g[i] = new ArrayList<>();
        int[][] e = {{0, 1}, {0, 2}, {2, 3}, {2, 4}};
        for (int[] x : e) { g[x[0]].add(x[1]); g[x[1]].add(x[0]); }
        sz = new int[n];
        down = new long[n];
        ans = new long[n];
        dfs1(0, -1);
        ans[0] = down[0];
        dfs2(0, -1);
        System.out.println(Arrays.toString(ans));
    }
    // Input : n=5 edges 0-1 0-2 2-3 2-4
    // Output: [6, 9, 5, 8, 8]
}`,
    },
    { tab: "Diameter DP", panel: "Template", file: "TreeDiameterDp.java",
      intro: "Two longest downward rays at each node. The global max of their sum is the " +
        "edge-diameter. Same postorder, no reroot needed.",
      highlight: "16-28",
      code: `import java.util.ArrayList;
import java.util.List;

public class TreeDiameterDp {

    static int best;

    static int down(List<Integer>[] g, int u, int p) {
        int first = 0, second = 0;
        for (int v : g[u]) if (v != p) {
            int d = 1 + down(g, v, u);
            if (d > first) { second = first; first = d; }
            else if (d > second) second = d;
        }
        best = Math.max(best, first + second);
        return first;
    }

    @SuppressWarnings("unchecked")
    public static void main(String[] args) {
        int n = 5;
        List<Integer>[] g = new ArrayList[n];
        for (int i = 0; i < n; i++) g[i] = new ArrayList<>();
        int[][] e = {{0, 1}, {0, 2}, {2, 3}, {2, 4}};
        for (int[] x : e) { g[x[0]].add(x[1]); g[x[1]].add(x[0]); }
        best = 0;
        down(g, 0, -1);
        System.out.println(best);
    }
    // Input : n=5 edges 0-1 0-2 2-3 2-4
    // Output: 3
}`,
    },
  ],

  complexity: {
    time: "O(n) rerooting; O(n^2) naive all-roots",
    space: "O(n)",
    derivation: [
      "<p>Each DFS visits every edge twice (once each direction across the undirected list), " +
      "so two passes are <code>&Theta;(n)</code>:</p>",
      "<span class=\"eq\">T(n) = &Theta;(n) + &Theta;(n) = &Theta;(n),&nbsp;&nbsp; vs naive n &times; &Theta;(n) = &Theta;(n&sup2;)</span>",
      "<p>If combining a child's DP into the parent is <code>O(f)</code>, the first pass is " +
      "<code>O(n f)</code>. Rerooting stays linear when \"remove this child and add the " +
      "complement\" is <code>O(f)</code>, which is why prefix/suffix folds over children " +
      "matter at high-degree nodes.</p>",
      "<p>Sums of distances reach <code>n &times; n = 10&sup1;&#8304;</code> at " +
      "<code>n = 10&#8309;</code>, so <code>long[]</code> is mandatory.</p>",
    ],
    compare: [
      ["DFS from every root", "<code>O(n&sup2;)</code>", "<code>O(n)</code>", "n &le; a few thousand"],
      ["Rerooting (sum / size)", "<code>O(n)</code>", "<code>O(n)</code>", "All-roots, invertible combine"],
      ["Diameter via two BFS", "<code>O(n)</code>", "<code>O(n)</code>", "Unweighted undirected tree"],
      ["Diameter via two-ray DP", "<code>O(n)</code>", "<code>O(n)</code>", "Same pass can collect more DP"],
    ],
  },

  pitfalls: [
    { title: "Forgetting to skip the parent",
      bug: "The adjacency list is undirected. Recursing into <code>p</code> loops forever or " +
        "double-counts the parent as a child.",
      fix: "Every DFS signature is <code>(u, p)</code>. Skip <code>v == p</code>." },
    { title: "<code>int</code> overflow on sum of distances",
      bug: "<code>n = 8&times;10&#8308;</code> on a path: the sum from an endpoint is about " +
        "<code>n&sup2;/2 &asymp; 3&times;10&sup1;&#8305;</code>, which wraps an <code>int</code>.",
      fix: "<code>long[] down, ans</code> unconditionally." },
    { title: "Using subtree size of the old root after rerooting",
      bug: "The formula needs <code>sz[c]</code> as computed in the <em>original</em> rooting. " +
        "Recomputing sizes after moving the root, or using <code>sz[u]</code> in place of " +
        "<code>n - sz[c]</code>, is a common mix-up.",
      fix: "Freeze <code>sz</code> after dfs1. The complement of child c is always " +
        "<code>n - sz[c]</code> in that rooting." },
    { title: "O(deg&sup2;) reroot at a star",
      bug: "For each child, looping over all siblings to form the complement. A star with " +
        "<code>n-1</code> leaves becomes <code>O(n&sup2;)</code>.",
      fix: "Prefix/suffix products or sums over the child list, or use the closed-form " +
        "identity when the combine is a sum." },
    { title: "Treating a binary-tree problem as rerooting",
      bug: "LC 124 / 543 already have a parent/child direction. Rerooting an n-ary undirected " +
        "tree is a different input format (edge list) and a different question (all roots).",
      fix: "If the input is <code>TreeNode</code>, you almost always want ordinary postorder. " +
        "If it is an edge list plus \"answer at every vertex\", you want this page." },
  ],

  variants: [
    ["Tree diameter (two BFS)",
      "BFS from any node to a farthest node u, then BFS from u. The second distance is the " +
      "diameter. Works on unweighted trees; fails on general graphs.",
      "u = farthest(0); return farthest(u).dist;",
      "CSES Tree Diameter"],
    ["Choosing capital (min incoming flips)",
      "DP0: count reversed edges in each subtree. Reroot: moving toward a reversed edge " +
      "decreases the cost by 1, otherwise increases by 1. CF 219D.",
      "ans[c] = ans[u] + (edge u->c was forward ? +1 : -1);",
      "CF 219D"],
    ["Merge child histograms (distance-k pairs)",
      "At each node, merge smaller child maps into the larger (small-to-large) to count " +
      "pairs whose path bends here. Total <code>O(n log n)</code>.",
      "for (map c : children) ans += countPairs(big, c, k); merge(big, c);",
      "CF 161D"],
  ],

  followups: [
    ["When is rerooting O(n) vs O(n log n)?",
      "<p>O(n) when removing a child's contribution and adding the complement is O(1) or " +
      "O(degree) with a prefix fold. O(n log n) when you merge child maps small-to-large " +
      "(each node moves to a at-least-twice-as-large map O(log n) times). If the combine is " +
      "a convolution of sizes, you may need centroid decomposition instead.</p>"],
    ["How do you handle weighted edges?",
      "<p>The reroot identity becomes <code>ans[c] = ans[u] - w[u,c]*sz[c] + w[u,c]*(n - sz[c])</code>: " +
      "the nodes that get closer each drop by the edge weight, the others each rise by it. " +
      "The first DFS adds <code>down[v] + w[u,v]*sz[v]</code>.</p>"],
    ["Can you reroot a 3-state DP like tree cameras?",
      "<p>Yes, but you need the complement of each child, so prefix/suffix arrays of the " +
      "combined child states. It is messy and rarely needed: cameras / robber problems on " +
      "<code>TreeNode</code> are ordinary rooted DP. Reroot 3-state DPs show up in contest " +
      "\"compute the DP at every vertex\" problems.</p>"],
    ["What is the relationship to centroid decomposition?",
      "<p>Rerooting answers a rooted-style question at every vertex. Centroid decomposition " +
      "answers path questions by splitting at centroids, with an extra log factor. Use " +
      "rerooting when the state lives at a vertex; use centroids when the state lives on a " +
      "path and does not reroot cleanly (e.g. count paths with a given XOR).</p>"],
  ],

  problems: [
    { name: "Sum of Distances in Tree", url: "https://leetcode.com/problems/sum-of-distances-in-tree/",
      badge: "lc", tag: "LC 834", level: "Hard", pattern: "The canonical reroot identity" },
    { name: "Minimum Height Trees", url: "https://leetcode.com/problems/minimum-height-trees/",
      badge: "lc", tag: "LC 310", level: "Medium", pattern: "Centroids via peel, or reroot heights" },
    { name: "House Robber III", url: "https://leetcode.com/problems/house-robber-iii/",
      badge: "lc", tag: "LC 337", level: "Medium", pattern: "Rooted 2-state DP, no reroot" },
    { name: "Binary Tree Cameras", url: "https://leetcode.com/problems/binary-tree-cameras/",
      badge: "lc", tag: "LC 968", level: "Hard", pattern: "Rooted 3-state DP" },
    { name: "Diameter of N-Ary Tree", url: "https://leetcode.com/problems/diameter-of-n-ary-tree/",
      badge: "lc", tag: "LC 1522", level: "Medium", pattern: "Two longest child rays" },
    { name: "Distance in Tree", url: "https://codeforces.com/problemset/problem/161/D",
      badge: "cf", tag: "CF 161D", level: "Medium", pattern: "Count pairs at distance k" },
    { name: "Choosing Capital for Treeland", url: "https://codeforces.com/problemset/problem/219/D",
      badge: "cf", tag: "CF 219D", level: "Medium", pattern: "Reroot reversed-edge counts" },
    { name: "Tree Painting", url: "https://codeforces.com/problemset/problem/1187/E",
      badge: "cf", tag: "CF 1187E", level: "Medium", pattern: "Reroot a scoring DP" },
    { name: "Maximum White Subtree", url: "https://codeforces.com/problemset/problem/1324/F",
      badge: "cf", tag: "CF 1324F", level: "Medium", pattern: "Reroot with max(0, child)" },
    { name: "Tree Distances II", url: "https://cses.fi/problemset/task/1133",
      badge: "cf", tag: "CSES", level: "Medium", pattern: "LC 834 with 1-based indexing" },
  ],

  spoilers: [
    { summary: "Hint for LC 834 / CSES Tree Distances II",
      body: "<p>After dfs1 you have <code>down[0]</code>, the answer at the arbitrary root. " +
        "Every other answer is determined by walking the edges: moving onto child c subtracts " +
        "<code>sz[c]</code> and adds <code>n - sz[c]</code>. Do not recompute sizes. The " +
        "formula is the whole problem; the rest is adjacency-list hygiene (skip parent, " +
        "<code>long</code> accumulators, 0- vs 1-based labels).</p>" },
    { summary: "Hint for CF 219D &mdash; reroot a count of reversed edges",
      body: "<p>Treat each directed edge as \"towards the current root\" or \"away\". dfs1 " +
        "counts how many edges in the subtree point the wrong way. When you reroot from u to " +
        "c, that one edge flips its contribution: if it was wrong for u it becomes right for " +
        "c (minus one), otherwise plus one. The vertices with the minimum resulting count " +
        "are the optimal capitals.</p>" },
  ],

  recap: {
    bullets: [
      "<strong>Rooted DP first</strong> (sizes, downward sums, two longest rays).",
      "<strong>Reroot in O(1) per edge</strong> for all-roots answers: " +
        "<code>ans[c] = ans[u] - sz[c] + (n - sz[c])</code> for distances.",
      "<strong>Skip the parent</strong> on an undirected adjacency list or you loop.",
      "<strong>Use long</strong> for path-count and distance sums.",
      "<strong>Prefix/suffix over children</strong> when the combine is not a sum.",
    ],
    oneliner: "dfs1: sz, down | ans[root]=down[root] | dfs2: ans[c]=ans[u]-sz[c]+(n-sz[c])",
  },
},

];

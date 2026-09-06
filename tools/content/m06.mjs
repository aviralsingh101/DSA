/* Module 06 — Range Query Structures */

import { pack, lc, cf } from "./pack.mjs";

export const topics = [

pack({
  "id": "sparse-table-and-rmq",
  "difficulty": "Medium",
  "readTime": "26 min",
  "tagline": "Idempotent range queries on a static array in <code>O(1)</code> after an <code>O(n log n)</code> doubling table &mdash; two overlapping blocks, no inverse required.",
  "tags": [
    "sparse table",
    "RMQ",
    "idempotent",
    "P1"
  ],
  "prereqs": [
    [
      "Prefix Sums",
      "../01-arrays-and-windows/prefix-sums.html"
    ],
    [
      "Binary Search Basics",
      "../01-arrays-and-windows/binary-search-basics.html"
    ]
  ],
  "why": [
    "You are given an array such as <code>[3, 1, 4, 1, 5, 9, 2, 6]</code> that will never change, and someone keeps asking: what is the smallest value between these two indices? Scanning the range is correct, but a hundred thousand queries each walking a hundred thousand cells is ten billion steps and the judge will cut you off. A prefix-sum array would answer a range <em>sum</em> in one subtraction, because addition has an inverse: if you know the sum up to <code>r</code> and the sum up to <code>l-1</code>, you can peel the left prefix off. Minimum has no inverse of that kind. Knowing <code>min(a[0..r])</code> and <code>min(a[0..l-1])</code> tells you nothing about <code>min(a[l..r])</code>, because the overall minimum might sit in the left prefix and hide the answer you actually wanted.",
    "A sparse table exploits a different algebraic property, <em>idempotence</em> &mdash; combining a value with itself gives the same value back, so <code>min(x, x) = x</code>. That means two ranges that overlap in the middle can still be combined freely: the overlap is counted twice, and the minimum does not care. The table stores, for every starting index <code>i</code> and every length that is a power of two, the minimum (or gcd, or bitwise AND) of that block. Any query range of length <code>L</code> is then covered by two such blocks of length <code>2<sup>floor(log<sub>2</sub> L)</sup></code>, one glued to the left end and one glued to the right. Two array lookups and one combine, and you are done in constant time.",
    "The catch is that the array must stay still. Changing one cell invalidates every block that covers it, which in the worst case is about <code>n</code> table entries, so a single point update is as expensive as rebuilding. For mixed updates you want a segment tree. For invertible operations on a static array, a prefix sum is smaller and simpler. This page is the remaining quadrant: the array never changes, and the operation is idempotent.",
    "In a real statement the signal is a static array sitting next to limits such as <code>n, q &le; 10&#8310;</code> and a query that is minimum, maximum, gcd, or bitwise AND / OR. That combination rules out a scan per query, and it is exactly what a sparse table is for. The same doubling then covers the Euler-tour reduction of lowest-common-ancestor, and any other problem that secretly asks for the minimum of a range that never moves."
  ],
  "insight": "Idempotent operations can overlap, so any range is the combine of two power-of-two blocks glued to its ends. The overlap is free for min, gcd and AND; it would double-count a sum, which is why this table is not a prefix array.",
  "yes": [
    "Range minimum / maximum / gcd / AND / OR on a <strong>static</strong> array, many queries",
    "The constraints are <code>n, q &le; 10&#8310;</code> and you cannot afford <code>O(log n)</code> per query constants of a segment tree",
    "LCA via RMQ on an Euler tour (the min-depth range)",
    "\"The array does not change\" is explicit or implied (build once, query many)",
    "You need the <em>index</em> of the minimum, not just the value (store argmin in the table)"
  ],
  "no": [
    "The array is updated between queries &rarr; <a href=\"segment-tree.html\">segment tree</a> or <a href=\"fenwick-tree.html\">Fenwick</a>",
    "The operation is sum / XOR (invertible) on a static array &rarr; <a href=\"../01-arrays-and-windows/prefix-sums.html\">prefix sums</a>",
    "Exactly one query &rarr; just scan the range",
    "You need range add and range min together &rarr; lazy segment tree, not a sparse table"
  ],
  "table": [
    [
      "\"static range minimum, q queries\"",
      "Idempotent, no updates",
      "Sparse table RMQ"
    ],
    [
      "\"static range gcd / AND / OR\"",
      "Same table, different combine",
      "Sparse table"
    ],
    [
      "\"range sum, static\"",
      "Invertible, not idempotent-needed",
      "Prefix sums"
    ],
    [
      "\"range sum, point updates\"",
      "Invertible + updates",
      "Fenwick tree"
    ],
    [
      "\"range min, point updates\"",
      "Idempotent + updates",
      "Segment tree"
    ],
    [
      "\"LCA of two nodes, many queries\"",
      "RMQ on the Euler tour of depths",
      "<a href=\"../05-trees/lca-binary-lifting.html\">or binary lifting</a>"
    ],
    [
      "<strong>Confused with:</strong> sliding-window minimum",
      "That is online in one pass with a deque, not arbitrary offline [L,R] queries",
      "<a href=\"../01-arrays-and-windows/sliding-window.html\">monotonic deque</a>"
    ]
  ],
  "constraint": "<code>n, q &le; 10&#8310;</code> on a static array with a min / max / gcd / AND query is the textbook sparse-table prompt. The table holds <code>n log n</code> integers &mdash; about 80 MB at <code>n = 10&#8310;</code> with 32-bit cells &mdash; which is acceptable. If <code>n</code> is <code>10&#8311;</code> you cannot afford that memory, and if even one update appears you should switch to a segment tree instead.",
  "core": [
    "You need a two-dimensional table <code>st[k][i]</code>. The cell <code>st[k][i]</code> holds the combine of the contiguous block <code>a[i .. i + 2<sup>k</sup> - 1]</code>, a stretch of length <code>2<sup>k</sup></code> that starts at index <code>i</code>. Row <code>k = 0</code> is just a copy of the array, because a block of length 1 is a single element. Every later row is filled from the row below it: <code>st[k][i] = op(st[k-1][i], st[k-1][i + 2<sup>k-1</sup>])</code>, which glues two already-computed halves of length <code>2<sup>k-1</sup></code> into one block of length <code>2<sup>k</sup></code>. The outer loop must be <code>k</code>, then <code>i</code>, because each row reads the row you just finished. You only write a cell when the second half still fits inside the array.",
    "A query on the closed interval <code>[L, R]</code> has length <code>len = R - L + 1</code>. Let <code>k = floor(log<sub>2</sub> len)</code>, the largest power of two that still fits inside the range. The left block <code>[L, L + 2<sup>k</sup> - 1]</code> starts at <code>L</code> and stays inside the query. The right block <code>[R - 2<sup>k</sup> + 1, R]</code> ends at <code>R</code> and also stays inside. Together they cover every index in <code>[L, R]</code>, and they overlap in the middle whenever <code>len</code> is not itself a power of two. That overlap is harmless precisely because the operation is idempotent. Precompute an array <code>lg[i]</code> so the floor-log is one lookup, not a floating-point call in a hot loop.",
    "Idempotence is load-bearing. Sum is <em>not</em> idempotent: two overlapping blocks would add the middle twice and report a number that looks plausible and is wrong. That is why a sparse table is not a replacement for prefix sums, even though both answer range queries on a static array. The operations that work are minimum, maximum, gcd, lcm (with care around zeros), bitwise AND, bitwise OR, and \"the first index at which the minimum occurs\" if you store an argmin instead of a value.",
    "Walk the sample <code>[3, 1, 4, 1, 5, 9, 2, 6]</code> through a query on indices <code>[2, 6]</code>. The length is 5, so <code>k = floor(log<sub>2</sub> 5) = 2</code> and each block has length 4. The left block is indices 2..5, values 4, 1, 5, 9, minimum 1, which is already stored as <code>st[2][2]</code>. The right block starts at <code>6 - 4 + 1 = 3</code>, indices 3..6, values 1, 5, 9, 2, minimum 1, stored as <code>st[2][3]</code>. Combining them gives <code>min(1, 1) = 1</code>. The overlap [3, 5] sat in both blocks and did not change the answer. A sum table on the same two blocks would have added 1+5+9 twice and reported 32 instead of 21."
  ],
  "invariant": "<p>For an idempotent associative operation, any range is the combine of two (possibly overlapping) dyadic blocks:</p><span class=\"eq\">op(L, R) = op( st[k][L], st[k][R - 2<sup>k</sup> + 1] ),&nbsp; k = &lfloor;log<sub>2</sub>(R - L + 1)&rfloor;</span><p>In plain words, you never have to tile the query with disjoint pieces. You grab the longest power-of-two window that starts at <code>L</code> and the longest power-of-two window that ends at <code>R</code>, and because taking the minimum of a value twice does not change it, the stretch that was in both windows is free. Sum would charge you twice for that stretch, which is why this identity is reserved for min, max, gcd and the bitwise cousins.</p><p>Interview sentence: <em>\"I overlap two power-of-two windows; min does not mind the overlap, sum would.\"</em></p>",
  "extra": [
    {
      "kind": "warn",
      "title": "Do not sparse-table a sum",
      "html": "<p>It compiles and produces a number. The number is wrong whenever the two blocks overlap, which is every query whose length is not itself a power of two. Use prefix sums.</p>"
    },
    {
      "kind": "tip",
      "title": "Precompute lg[]",
      "html": "<p><code>lg[1] = 0; for (i = 2; i &le; n; i++) lg[i] = lg[i &gt;&gt; 1] + 1;</code> Integer log in O(1) with no floating point, no <code>numberOfLeadingZeros</code> in a hot loop, and defined at 0-length guards you will not hit.</p>"
    }
  ],
  "array": [
    3,
    1,
    4,
    1,
    5,
    9,
    2,
    6
  ],
  "vars": [
    "L",
    "R",
    "k",
    "ans"
  ],
  "frames": [
    {
      "note": "The array. Query [L, R] = [2, 6], values 4, 1, 5, 9, 2, so the length is 5.",
      "active": [
        2,
        3,
        4,
        5,
        6
      ],
      "window": [
        2,
        6
      ],
      "values": {
        "L": 2,
        "R": 6,
        "k": "?",
        "ans": "?"
      }
    },
    {
      "note": "lg[5] = 2 because 2^2 = 4 <= 5 < 8. k = 2, block length 4.",
      "active": [
        2,
        3,
        4,
        5,
        6
      ],
      "window": [
        2,
        6
      ],
      "values": {
        "L": 2,
        "R": 6,
        "k": 2,
        "ans": "?"
      }
    },
    {
      "note": "Left block starts at L = 2, length 4: indices 2..5, values 4,1,5,9. min = 1. This is st[2][2].",
      "active": [
        2,
        3,
        4,
        5
      ],
      "window": [
        2,
        5
      ],
      "dim": [
        0,
        1,
        6,
        7
      ],
      "values": {
        "L": 2,
        "R": 6,
        "k": 2,
        "ans": "st[2][2]=1"
      }
    },
    {
      "note": "Right block ends at R = 6: starts at 6 - 4 + 1 = 3, indices 3..6, values 1,5,9,2. min = 1. This is st[2][3].",
      "active": [
        3,
        4,
        5,
        6
      ],
      "window": [
        3,
        6
      ],
      "dim": [
        0,
        1,
        2,
        7
      ],
      "values": {
        "L": 2,
        "R": 6,
        "k": 2,
        "ans": "st[2][3]=1"
      }
    },
    {
      "note": "Combine: min(1, 1) = 1. The overlap [3, 5] was in both blocks and did not matter.",
      "best": [
        3
      ],
      "window": [
        2,
        6
      ],
      "done": [
        2,
        4,
        5,
        6
      ],
      "values": {
        "L": 2,
        "R": 6,
        "k": 2,
        "ans": 1
      }
    },
    {
      "note": "A sum sparse table would have added 1+5+9 twice and reported 32 instead of 21. That is why this structure is for min/gcd/AND, not sum.",
      "x": [
        3,
        4,
        5
      ],
      "window": [
        2,
        6
      ],
      "values": {
        "L": 2,
        "R": 6,
        "k": 2,
        "ans": "sum would be wrong"
      }
    },
    {
      "note": "Query [0, 7] has length 8, k = 3, one block covers the whole array: st[3][0] = 1. Two lookups still, both the same cell.",
      "best": [
        1
      ],
      "window": [
        0,
        7
      ],
      "values": {
        "L": 0,
        "R": 7,
        "k": 3,
        "ans": 1
      }
    }
  ],
  "mermaid": "flowchart TD\n  q([\"range query on an array\"]) --> upd{\"does the array change?\"}\n  upd -- yes --> kind{\"point update or range update?\"}\n  kind -- point --> fen[\"Fenwick or segment tree\"]\n  kind -- range --> lazy[\"lazy segment tree\"]\n  upd -- no --> op{\"which operation?\"}\n  op -- \"sum or XOR\" --> pfx[\"prefix array, O of 1 query\"]\n  op -- \"min, max, gcd, AND, OR\" --> st[\"sparse table, O of 1 query\"]",
  "steps": [
    "<strong>Allocate the two tables.</strong> Create <code>st[LOG][n]</code> and <code>lg[n+1]</code>, with <code>LOG = 32 - Integer.numberOfLeadingZeros(n)</code>, so you have one row per power of two that can appear as a block length.",
    "<strong>Fill the floor-log array first.</strong> Set <code>lg[1] = 0</code> and then <code>lg[i] = lg[i >> 1] + 1</code> for every later i, because a query must read <code>k</code> in constant time and a floating-point log will round the wrong way at powers of two.",
    "<strong>Copy the array into row 0.</strong> A block of length <code>2<sup>0</sup> = 1</code> is a single element, so <code>st[0][i] = a[i]</code> is the base case every later row will double from.",
    "<strong>Double each row from the one below.</strong> For k from 1, for every i whose block of length <code>1&lt;&lt;k</code> still fits, write <code>st[k][i] = op(st[k-1][i], st[k-1][i + (1&lt;&lt;(k-1))])</code>. The outer loop is k because each row reads the finished row beneath it.",
    "<strong>Answer [L, R] with two lookups.</strong> Read <code>k = lg[R - L + 1]</code> and return <code>op(st[k][L], st[k][R - (1&lt;&lt;k) + 1])</code>. The <code>+ 1</code> is what makes the right block end exactly at R.",
    "<strong>Refuse this structure for sum or XOR.</strong> The two blocks overlap on almost every query, so a sum would double-count the middle and XOR would cancel it to zero. Those operations belong on a prefix array.",
    "<strong>Rebuild, or switch, if an update arrives.</strong> One write invalidates every block that covers that index, which is linear in n. Rare updates can rebuild the whole table; mixed updates want a segment tree."
  ],
  "code": [
    {
      "tab": "Brute scan",
      "file": "BruteRmq.java",
      "code": "public class BruteRmq {\n\n    static int rangeMin(int[] a, int l, int r) {\n        int m = a[l];\n        for (int i = l + 1; i <= r; i++) m = Math.min(m, a[i]);\n        return m;\n    }\n\n    public static void main(String[] args) {\n        int[] a = {3, 1, 4, 1, 5, 9, 2, 6};\n        System.out.println(rangeMin(a, 2, 6));\n        System.out.println(rangeMin(a, 0, 7));\n        System.out.println(rangeMin(a, 4, 4));\n    }\n    // Input : [3, 1, 4, 1, 5, 9, 2, 6]\n    // Output: 1\n    //         1\n    //         5\n}",
      "intro": "Each query scans the range. Correct, <code>O(n)</code> per query, dies at <code>n = q = 10&#8309;</code>.",
      "highlight": "6-11",
      "panel": "Brute"
    },
    {
      "tab": "Sparse table",
      "file": "SparseTable.java",
      "code": "public class SparseTable {\n\n    final int[] lg;\n    final int[][] st;\n\n    SparseTable(int[] a) {\n        int n = a.length;\n        int LOG = 32 - Integer.numberOfLeadingZeros(n);\n        lg = new int[n + 1];\n        for (int i = 2; i <= n; i++) lg[i] = lg[i >> 1] + 1;\n        st = new int[LOG][n];\n        System.arraycopy(a, 0, st[0], 0, n);\n        for (int k = 1; k < LOG; k++) {\n            for (int i = 0; i + (1 << k) <= n; i++) {\n                st[k][i] = Math.min(st[k - 1][i], st[k - 1][i + (1 << (k - 1))]);\n            }\n        }\n    }\n\n    int rangeMin(int l, int r) {\n        int k = lg[r - l + 1];\n        return Math.min(st[k][l], st[k][r - (1 << k) + 1]);\n    }\n\n    public static void main(String[] args) {\n        int[] a = {3, 1, 4, 1, 5, 9, 2, 6};\n        SparseTable st = new SparseTable(a);\n        System.out.println(st.rangeMin(2, 6));\n        System.out.println(st.rangeMin(0, 7));\n        System.out.println(st.rangeMin(4, 4));\n    }\n    // Input : [3, 1, 4, 1, 5, 9, 2, 6]\n    // Output: 1\n    //         1\n    //         5\n}",
      "intro": "Min-table with precomputed logs. Queries are two lookups. The dry-run sample.",
      "highlight": "16-22,25-28",
      "panel": "Optimal"
    },
    {
      "tab": "GCD table",
      "file": "SparseTableGcd.java",
      "code": "public class SparseTableGcd {\n\n    static int gcd(int a, int b) {\n        while (b != 0) { int t = a % b; a = b; b = t; }\n        return Math.abs(a);\n    }\n\n    final int[] lg;\n    final int[][] st;\n\n    SparseTableGcd(int[] a) {\n        int n = a.length;\n        int LOG = 32 - Integer.numberOfLeadingZeros(n);\n        lg = new int[n + 1];\n        for (int i = 2; i <= n; i++) lg[i] = lg[i >> 1] + 1;\n        st = new int[LOG][n];\n        System.arraycopy(a, 0, st[0], 0, n);\n        for (int k = 1; k < LOG; k++) {\n            for (int i = 0; i + (1 << k) <= n; i++) {\n                st[k][i] = gcd(st[k - 1][i], st[k - 1][i + (1 << (k - 1))]);\n            }\n        }\n    }\n\n    int rangeGcd(int l, int r) {\n        int k = lg[r - l + 1];\n        return gcd(st[k][l], st[k][r - (1 << k) + 1]);\n    }\n\n    public static void main(String[] args) {\n        int[] a = {3, 1, 4, 1, 5, 9, 2, 6};\n        SparseTableGcd st = new SparseTableGcd(a);\n        System.out.println(st.rangeGcd(2, 6));\n        System.out.println(st.rangeGcd(4, 7));\n        System.out.println(st.rangeGcd(0, 0));\n    }\n    // Input : [3, 1, 4, 1, 5, 9, 2, 6]\n    // Output: 1\n    //         1\n    //         3\n}",
      "intro": "The same doubling with <code>gcd</code>. Range gcd is the other common idempotent query; CF 474F is this plus a count of how many array entries equal the gcd.",
      "highlight": "22-28,31-34",
      "panel": "Template"
    }
  ],
  "complexity": {
    "time": "O(n log n) build, O(1) query",
    "space": "O(n log n)",
    "derivation": [
      "<p>Row k has at most n entries, and there are <code>log n</code> rows, each filled with a constant-time combine. At <code>n = 10&#8310;</code> that is about <code>10&#8310; &times; 20 = 2&times;10&#8311;</code> writes, which is a few milliseconds:</p>",
      "<span class=\"eq\">T<sub>build</sub> = &Theta;(n log n),&nbsp;&nbsp; T<sub>query</sub> = &Theta;(1)</span>",
      "<p>A segment tree is <code>O(n)</code> build and <code>O(log n)</code> query, and supports updates. When there are no updates and q is huge, the sparse table wins on query constants (two array reads vs a dozen). At <code>n = 10&#8310;</code> the table is the memory you pay for those constants, about 80 MB of 32-bit cells.</p>",
      "<p>Farach-Colton/Bender RMQ is <code>O(n)</code> build and <code>O(1)</code> query after a Cartesian-tree reduction; nobody codes it in a contest. Binary lifting LCA is the usual alternative when the RMQ is on a tree, not an array.</p>"
    ],
    "compare": [
      [
        "Scan each query",
        "<code>O(n q)</code>",
        "<code>O(1)</code>",
        "q is 1"
      ],
      [
        "Prefix sums",
        "<code>O(n + q)</code>",
        "<code>O(n)</code>",
        "Invertible op, static"
      ],
      [
        "Sparse table",
        "<code>O(n log n + q)</code>",
        "<code>O(n log n)</code>",
        "Idempotent op, static"
      ],
      [
        "Segment tree",
        "<code>O(n + q log n)</code>",
        "<code>O(n)</code>",
        "Updates, any associative op"
      ]
    ]
  },
  "pitfalls": [
    {
      "title": "Using it for sum / XOR",
      "bug": "The two blocks overlap, the middle is combined twice, and XOR of a value with itself is 0, so you can even \"zero out\" the overlap. Silently wrong, and it looks fine on any query whose length is itself a power of two.",
      "fix": "Sparse tables are for idempotent ops only. Sum and XOR go to a prefix array; test a query whose length is not a power of two, because that is where the overlap appears."
    },
    {
      "title": "Off-by-one in the right block",
      "bug": "<code>st[k][r - (1<<k)]</code> without the <code>+ 1</code>, so the right block ends at R-1 and the last element is dropped whenever length is not a power of two.",
      "fix": "Right start is <code>r - (1<<k) + 1</code>. Check a query of length 3: k = 1, blocks of length 2 must cover all three indices."
    },
    {
      "title": "Floating-point log",
      "bug": "<code>(int)(Math.log(len) / Math.log(2))</code> rounding down incorrectly at powers of two, picking k too large, and reading off the end of a row.",
      "fix": "Build an integer <code>lg[]</code> table, or use <code>31 - Integer.numberOfLeadingZeros(len)</code>. Check a query whose length is exactly 8 or 16, where the float version most often slips."
    },
    {
      "title": "Building with i outer, k inner",
      "bug": "<code>st[k][i]</code> reads <code>st[k-1][...]</code> that has not been filled yet if k is the inner loop. The cell looks initialised because Java zeros the array, so you silently combine zeros instead of real values.",
      "fix": "Keep k as the outermost loop, then i. The dependency is the same as binary-lifting's doubling: each row is defined only in terms of the finished row below it."
    },
    {
      "title": "Inclusive / exclusive bounds mix-up",
      "bug": "The table is built for closed intervals but the query is written as <code>[L, R)</code> from a prefix-sum habit, dropping a[R] or throwing.",
      "fix": "Pick closed [L, R] and document it. The length is <code>R - L + 1</code>."
    }
  ],
  "variants": [
    [
      "Argmin table",
      "Store the index of the minimum, not the value. Combine by comparing <code>a[i]</code> at the two candidate indices. LCA-via-RMQ needs this.",
      "st[k][i] = a[leftIdx] <= a[rightIdx] ? leftIdx : rightIdx;",
      "Euler tour + RMQ LCA"
    ],
    [
      "Disjoint sparse table",
      "Blocks do not overlap; any range splits at a unique midpoint into two disjoint dyadic pieces. Supports non-idempotent ops too, still O(1) query, more code.",
      "Split at the highest bit where L and R differ",
      "When you want O(1) range sum without a prefix array (rare)"
    ],
    [
      "2D sparse table",
      "Four-way doubling: st[k][p][i][j] = combine of a 2^k by 2^p submatrix. Query is four overlapping rectangles. Memory is n m log n log m.",
      "Four lookups, same overlap idea",
      "Static 2D RMQ"
    ]
  ],
  "followups": [
    [
      "Can you support updates?",
      "<p>A single point update touches O(n) entries in the worst case (every block that covers that index). Rebuilding the whole table is O(n log n), which is fine if updates are rare. For interleaved updates, use a segment tree: O(log n) per update and query, O(n) memory, and it handles non-idempotent ops too.</p>"
    ],
    [
      "How does this become O(1) LCA?",
      "<p>DFS an Euler tour of every visit (length 2n-1) and the depths at those visits. The LCA of u and v is the minimum-depth node between their first occurrences on the tour. That is RMQ on the depth array, which a sparse table answers in O(1). See <a href=\"../05-trees/lca-binary-lifting.html\">binary lifting</a> for the version that also gives k-th ancestor.</p>"
    ],
    [
      "Why not just use a segment tree always?",
      "<p>You can. A segment tree of mins is O(log n) query, O(n) memory, and survives updates. The sparse table wins when (1) there are no updates, (2) q is large enough that the log n factor and heavier constants show up, and (3) you want the two-line query. In Java the difference is often a factor of 3-5 on query-heavy RMQ.</p>"
    ],
    [
      "Does gcd really belong here?",
      "<p>Yes: gcd(a, a) = a, so it is idempotent, and gcd is associative. Range gcd plus \"how many entries equal that gcd\" is CF 474F: the sparse table gives the gcd, then a binary search on a positions-list of that value counts occurrences in [L, R].</p>"
    ]
  ],
  "problems": [
    {
      "name": "Sliding Window Maximum",
      "url": "https://leetcode.com/problems/sliding-window-maximum/",
      "badge": "lc",
      "tag": "LC 239",
      "level": "Hard",
      "pattern": "Deque is better; ST also works (static)"
    },
    {
      "name": "Range Minimum Query",
      "url": "https://leetcode.com/problems/sliding-window-maximum/",
      "badge": "gfg",
      "tag": "SPOJ RMQSQ",
      "level": "Easy",
      "pattern": "The pure implementation drill"
    },
    {
      "name": "CGCDSSQ",
      "url": "https://codeforces.com/problemset/problem/475/D",
      "badge": "cf",
      "tag": "CF 475D",
      "level": "Medium",
      "pattern": "Sparse table gcd, two pointers on changing gcd"
    },
    {
      "name": "Ant Colony",
      "url": "https://codeforces.com/problemset/problem/474/F",
      "badge": "cf",
      "tag": "CF 474F",
      "level": "Medium",
      "pattern": "Range gcd + count of that gcd"
    },
    {
      "name": "Maximum of Maximums of Minimums",
      "url": "https://codeforces.com/problemset/problem/872/B",
      "badge": "cf",
      "tag": "CF 872B",
      "level": "Easy",
      "pattern": "Casework on k; RMQ intuition"
    },
    {
      "name": "Pair of Numbers",
      "url": "https://codeforces.com/problemset/problem/359/D",
      "badge": "cf",
      "tag": "CF 359D",
      "level": "Hard",
      "pattern": "Binary search + range gcd / min"
    },
    {
      "name": "Static Range Minimum Queries",
      "url": "https://codeforces.com/problemset/problem/872/B",
      "badge": "cf",
      "tag": "CSES",
      "level": "Easy",
      "pattern": "Build and query, nothing else"
    },
    {
      "name": "Company Queries II",
      "url": "https://codeforces.com/problemset/problem/1548/B",
      "badge": "cf",
      "tag": "CSES",
      "level": "Medium",
      "pattern": "LCA as RMQ on an Euler tour"
    },
    {
      "name": "Range GCD",
      "url": "https://leetcode.com/problems/range-sum-query-immutable/",
      "badge": "atc",
      "tag": "ATC",
      "level": "Medium",
      "pattern": "Prefix/suffix gcd, ST optional"
    },
    {
      "name": "Maximum Score of a Good Subarray",
      "url": "https://leetcode.com/problems/maximum-score-of-a-good-subarray/",
      "badge": "lc",
      "tag": "LC 1793",
      "level": "Hard",
      "pattern": "Binary search + RMQ, or two pointers"
    }
  ],
  "recap": [
    "<strong>Idempotent + static</strong> is the sparse-table quadrant.",
    "<strong>Two overlapping dyadic blocks</strong> cover any range in O(1).",
    "<strong>k = lg[R-L+1]</strong>, right block starts at <code>R - (1&lt;&lt;k) + 1</code>.",
    "<strong>Not for sums.</strong> Overlap would double-count.",
    "<strong>Updates kill the table;</strong> switch to a segment tree."
  ],
  "oneliner": "st[k][i]=op(st[k-1][i], st[k-1][i+(1<<(k-1))]) | k=lg[r-l+1]; op(st[k][l], st[k][r-(1<<k)+1])",
  "indexLabels": [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7"
  ],
  "arrayLabel": "a",
  "vizTitle": "Two overlapping blocks answering min on [2, 6]",
  "vizIntro": "Array <code>[3, 1, 4, 1, 5, 9, 2, 6]</code>. Query min of indices 2..6 (values 4, 1, 5, 9, 2). Length 5, so k = 2, blocks of length 4.",
  "vizCaption": "Left block [2, 5] = min(4,1,5,9) = 1. Right block [3, 6] = min(1,5,9,2) = 1. Overlap at [3, 5] is free. Answer 1.",
  "merTitle": "When a sparse table is the right structure",
  "merCaption": "Static plus idempotent is the sparse-table quadrant. The other three quadrants are prefix sums, Fenwick, and segment trees.",
  "coreHeading": "Core idea and the invariant",
  "spoilers": [
    {
      "summary": "Hint for CF 474F &mdash; gcd plus a count",
      "body": "<p>The number of surviving ants in [L, R] is the length minus the number of array entries equal to G = gcd(L, R). Sparse table gives G. The positions of each value are a sorted list; binary search how many sit in [L, R]. If that count is zero, nobody equals G and everyone dies except... wait: ants equal to G survive. Answer is (R-L+1) - count(G in [L,R]).</p>"
    },
    {
      "summary": "Hint for CF 475D &mdash; how many ranges have gcd g",
      "body": "<p>From a fixed right endpoint, as the left end moves left the gcd jumps down a divisor chain at most log A times. A sparse table plus binary search finds, for each jump, the farthest left where the gcd stays the same. Accumulate counts per gcd value. Queries are then map lookups.</p>"
    }
  ],
  "dryIntro": "Building the min-table on <code>[3, 1, 4, 1, 5, 9, 2, 6]</code>, then querying <code>[2, 6]</code>. Only a few representative cells are shown.",
  "dryAfter": "<p>Verify by hand: a[2..6] = 4, 1, 5, 9, 2, min is 1. The two length-4 blocks both contain that 1.</p>"
}),

pack({
  "id": "fenwick-tree",
  "difficulty": "Medium",
  "readTime": "28 min",
  "tagline": "Point update and prefix sum in <code>O(log n)</code> each, using the lowest set bit to jump responsibility ranges &mdash; the smallest structure that beats a prefix array once updates appear.",
  "tags": [
    "Fenwick",
    "BIT",
    "prefix",
    "inversions",
    "P1"
  ],
  "prereqs": [
    [
      "Prefix Sums",
      "../01-arrays-and-windows/prefix-sums.html"
    ],
    [
      "Constraints to Complexity",
      "../00-foundations/constraints-to-complexity.html"
    ]
  ],
  "why": [
    "You are given an array such as <code>[3, 1, 4, 1, 5, 9, 2, 6]</code>, and between asking for the sum of a prefix someone keeps changing a single cell. A prefix-sum array answers each range in one subtraction, but the moment you write <code>a[3] += 2</code> every prefix that includes index 3 is stale, and rewriting those prefixes costs a linear scan. With a hundred thousand updates and a hundred thousand sums you are looking at ten billion writes, and the judge will cut you off. You need the same prefix algebra without the linear repair.",
    "A Fenwick tree, also called a Binary Indexed Tree, keeps each array value inside a handful of <em>buckets</em> instead of one running total. Index <code>i</code> (counting from 1) owns a contiguous range that <em>ends</em> at <code>i</code> and has length equal to the value of i's lowest set bit, written <code>lsb(i) = i &amp; -i</code>. So index 6, whose binary form is <code>110</code>, owns a range of length 2 ending at 6, which is the pair <code>a[5], a[6]</code>. An update of cell <code>i</code> walks every bucket that contains <code>i</code>; a prefix query walks a disjoint set of buckets that tile <code>[1, i]</code>. Each walk is a handful of array reads, never a scan.",
    "The two walks go in opposite directions because they are answering opposite questions. A prefix query wants buckets that sit <em>inside</em> <code>[1, i]</code> and do not overlap, so it peels the bucket ending at the current index off the prefix and jumps to whatever is left, which is <code>i -= lsb(i)</code>. An update wants every bucket that <em>contains</em> index <code>i</code>, including ones that stretch past i to a later end, so it climbs to the next larger owner with <code>i += lsb(i)</code>. Same lowest-set-bit quantity, opposite arithmetic.",
    "In a real statement the signal is point updates mixed with prefix or range sums at limits such as <code>n, q &le; 2&times;10&#8309;</code>. That combination rules out a prefix array and is exactly what Fenwick is for. The same twenty lines then cover inversion counting, \"how many values to the left are smaller\", frequency queries on compressed ranks, and the two-tree trick that turns range-add plus range-sum into four point updates. Reach for a segment tree only when the operation is not a prefix of something invertible."
  ],
  "insight": "Index i owns the contiguous sum of length <code>i &amp; -i</code> that ends at i. A prefix query subtracts that length to peel off disjoint buckets; an update adds it to climb to every larger bucket that still contains i. The two walks are opposite because one is covering a prefix and the other is notifying the owners of a single cell.",
  "yes": [
    "Point add / point set mixed with prefix or range sums",
    "\"Count inversions\", \"count smaller elements to the left / right\"",
    "Frequency queries on compressed values (order-statistic tree)",
    "The two-BIT trick: range add + range sum",
    "<code>n, q &le; 2&times;10&#8309;</code> with updates, operation is sum or XOR"
  ],
  "no": [
    "No updates, only range sums &rarr; <a href=\"../01-arrays-and-windows/prefix-sums.html\">prefix array</a>",
    "Range minimum (no inverse) &rarr; <a href=\"sparse-table-and-rmq.html\">sparse table</a> or <a href=\"segment-tree.html\">segment tree</a>",
    "Range add and range min together &rarr; <a href=\"segment-tree-lazy.html\">lazy segtree</a>",
    "Arbitrary associative combine that is not prefix-invertible &rarr; segment tree"
  ],
  "table": [
    [
      "\"point add, prefix sum\"",
      "The BIT primitive",
      "Fenwick"
    ],
    [
      "\"point add, range sum\"",
      "prefix(r) - prefix(l-1)",
      "Fenwick"
    ],
    [
      "\"count inversions\"",
      "Query how many seen values are greater, then add",
      "BIT on compressed ranks"
    ],
    [
      "\"range add, point query\"",
      "Difference array in a BIT",
      "One Fenwick"
    ],
    [
      "\"range add, range sum\"",
      "Two BITs, B1 and B2",
      "Identity: sum[1..i] = b1*i - b2"
    ],
    [
      "\"range min, point update\"",
      "No inverse, BIT is awkward",
      "Segment tree"
    ],
    [
      "<strong>Confused with:</strong> segment tree",
      "A BIT is a compressed segment tree for prefix operations; it cannot easily store min",
      "Use a segtree when the op is not a prefix sum / XOR"
    ]
  ],
  "constraint": "<code>n, q &le; 2&times;10&#8309;</code> with point updates and prefix or range sums is Fenwick's home. Each operation is about twenty array reads, so the whole batch finishes in milliseconds. Values of <code>10&#8313;</code> with <code>n</code> of <code>10&#8309;</code> overflow an <code>int</code> prefix and need <code>long</code>. If the value universe is <code>10&#8313;</code> but you only have <code>n</code> items, compress the coordinates down to ranks <code>1..n</code> before you index the tree.",
  "core": [
    "Index the tree from 1, never from 0. The cell <code>bit[i]</code> stores the sum of the closed range <code>a[i - lsb(i) + 1 .. i]</code>: a contiguous bucket that ends at i and has length <code>lsb(i)</code>. That length is <code>i &amp; -i</code> because Java integers are two's complement: <code>-i</code> equals <code>~i + 1</code>, which flips every bit of i and then adds one. Adding one walks through the trailing zeros of i, flips them back to zero, and leaves the lowest 1 of i sitting alone in the conjunction. For i = 12 = <code>1100</code> in binary, <code>-i</code> ends with <code>0100</code>, the conjunction is 4, and so <code>bit[12]</code> owns the four entries that end at 12. The same identity is why you must never call it on 0: <code>0 &amp; -0</code> is 0, and adding zero is an infinite loop.",
    "A prefix sum of the first i elements is the sum of the disjoint buckets you land on while repeatedly subtracting the lowest set bit. Each subtraction clears the lowest 1 of the current index, so the walk visits at most one bucket per bit and finishes in at most <code>log<sub>2</sub> i</code> steps. An update at i does the opposite: it adds the delta into <code>bit[i]</code> and then into every larger bucket that still contains i, found by repeatedly adding the lowest set bit. Adding the lsb carries into a higher bit and lands on the next index whose owned range is a proper multiple of the current one, which is exactly the next owner that covers i. The two loops share one helper and no recursion.",
    "A range sum <code>[l, r]</code> is two prefixes, <code>prefix(r) - prefix(l - 1)</code>, which is legal only because addition has an inverse. The same inverse is why Fenwick cannot do range minimum: there is nothing you can subtract from <code>min(a[1..r])</code> to recover <code>min(a[l..r])</code>. A range add on a point-query tree is the difference-array trick sitting inside the BIT: add <code>v</code> at l and add <code>-v</code> at r+1. Two Fenwick trees together give range add and range sum, which is the usual contest upgrade before you reach for a lazy segment tree.",
    "Walk the sample <code>[3, 1, 4, 1, 5, 9, 2, 6]</code> after the tree is built. One-based, the buckets are <code>bit[1]=3</code> (just a[1]), <code>bit[2]=4</code> (a[1]+a[2]), <code>bit[3]=4</code> (just a[3]), <code>bit[4]=9</code> (a[1]..a[4]), <code>bit[5]=5</code>, <code>bit[6]=14</code> (a[5]+a[6]), <code>bit[7]=2</code>, <code>bit[8]=31</code> (the whole array). Asking for prefix(7) starts at 7, adds <code>bit[7]=2</code>, drops to 6, adds <code>bit[6]=14</code>, drops to 4, adds <code>bit[4]=9</code>, and lands on 0 with a total of 25, which is 3+1+4+1+5+9+2. An update of +2 at index 3 climbs the other way: 3, then 4, then 8, because those are the three buckets whose owned ranges contain 3. After that write, the same three query nodes would read 27."
  ],
  "invariant": "<p>With 1-based indexing and <code>lsb(i) = i &amp; -i</code>, each cell owns a contiguous suffix of the prefix that ends at i:</p><span class=\"eq\">bit[i] = sum(a[i - lsb(i) + 1 .. i])</span><p>In plain words, index i does not store \"the sum up to i\". It stores only the last <code>lsb(i)</code> entries before i, and a prefix is recovered by adding those leftover chunks as you strip one set bit at a time. That is why the query walks down (subtract lsb, peel a finished chunk) and the update walks up (add lsb, notify the next larger owner): one of them is assembling a prefix from pieces that sit inside it, and the other is telling every piece that still covers the cell you just changed.</p><p>Interview sentence: <em>\"Update adds lsb, query subtracts lsb; both are walking the binary representation of the index.\"</em></p>",
  "extra": [
    {
      "kind": "math",
      "title": "Why i &amp; -i is the lowest set bit",
      "html": "<p>In two's complement, <code>-i</code> flips every bit of i and adds one, which leaves the lowest 1 of i in place and turns every lower 0 into 0 in the conjunction. Example: i = 12 = 1100<sub>2</sub>, -i = ...0100<sub>2</sub>, conjunction 0100<sub>2</sub> = 4, and bit[12] covers four entries ending at 12. That numeric value <em>is</em> the length of the range i owns, not a coincidence: the lowest set bit of i is the largest power of two that divides i, and Fenwick assigns i a bucket of exactly that length.</p>"
    },
    {
      "kind": "key",
      "title": "Always 1-based",
      "html": "<p><code>i &amp; -i</code> on 0 is 0, so <code>i += 0</code> is an infinite loop. The tree starts at index 1. Translate 0-based array index i to Fenwick index i+1.</p>"
    },
    {
      "kind": "idea",
      "title": "Why the two walks go opposite ways",
      "html": "<p>A prefix query asks \"which of my own buckets tile [1, i]?\" and those buckets end at or before i, so you subtract the lsb and drop to a shorter leftover prefix. An update asks \"which buckets in the whole tree still contain i?\" and those buckets end at or after i, so you add the lsb and climb to the next larger owner. Same helper, opposite question.</p>"
    }
  ],
  "array": [
    3,
    4,
    4,
    9,
    5,
    14,
    2,
    31
  ],
  "vars": [
    "i",
    "lsb",
    "added",
    "acc"
  ],
  "frames": [
    {
      "note": "Built tree. bit[i] holds the sum of lsb(i) entries ending at i, not the whole prefix. Query prefix(7).",
      "dim": [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ],
      "values": {
        "i": 7,
        "lsb": "?",
        "added": 0,
        "acc": 0
      }
    },
    {
      "note": "i = 7 = 111b, lsb = 1. Add bit[7] = 2. acc = 2. Next i = 7 - 1 = 6.",
      "active": [
        6
      ],
      "dim": [
        0,
        1,
        2,
        3,
        4,
        5,
        7
      ],
      "values": {
        "i": 7,
        "lsb": 1,
        "added": 2,
        "acc": 2
      }
    },
    {
      "note": "i = 6 = 110b, lsb = 2. Add bit[6] = 14. acc = 16. Next i = 6 - 2 = 4.",
      "active": [
        5
      ],
      "done": [
        6
      ],
      "dim": [
        0,
        1,
        2,
        3,
        4,
        7
      ],
      "values": {
        "i": 6,
        "lsb": 2,
        "added": 14,
        "acc": 16
      }
    },
    {
      "note": "i = 4 = 100b, lsb = 4. Add bit[4] = 9. acc = 25. Next i = 4 - 4 = 0. Stop.",
      "active": [
        3
      ],
      "done": [
        5,
        6
      ],
      "dim": [
        0,
        1,
        2,
        4,
        7
      ],
      "values": {
        "i": 4,
        "lsb": 4,
        "added": 9,
        "acc": 25
      }
    },
    {
      "note": "Prefix(7) = 25. The query touched three nodes: 7, 6, 4. Range sum [3, 7] would be prefix(7) - prefix(2).",
      "best": [
        3,
        5,
        6
      ],
      "done": [
        0,
        1,
        2,
        4,
        7
      ],
      "values": {
        "i": 0,
        "lsb": "—",
        "added": "—",
        "acc": 25
      }
    },
    {
      "note": "Update index 3 by +2 would climb 3, 4, 8 (add lsb each time) and leave the other buckets alone.",
      "active": [
        2,
        3,
        7
      ],
      "dim": [
        0,
        1,
        4,
        5,
        6
      ],
      "values": {
        "i": "upd 3",
        "lsb": "climb",
        "added": 2,
        "acc": "touches 3,4,8"
      }
    },
    {
      "note": "After that update, prefix(7) would reread the same three nodes and get 27, because bit[4] now holds 11.",
      "best": [
        3,
        5,
        6
      ],
      "values": {
        "i": 7,
        "lsb": "same path",
        "added": "—",
        "acc": 27
      }
    }
  ],
  "mermaid": "graph TD\n  f8[\"bit8 covers 1-8\"] --> f4[\"bit4 covers 1-4\"]\n  f8 --> f6[\"bit6 covers 5-6\"]\n  f8 --> f7[\"bit7 covers 7\"]\n  f4 --> f2[\"bit2 covers 1-2\"]\n  f4 --> f3[\"bit3 covers 3\"]\n  f2 --> f1[\"bit1 covers 1\"]\n  f6 --> f5[\"bit5 covers 5\"]",
  "steps": [
    "<strong>Allocate a 1-based tree.</strong> Create <code>long[] bit</code> of length <code>n + 1</code> and leave index 0 unused, because <code>0 &amp; -0</code> is 0 and a loop that adds zero never terminates.",
    "<strong>Define lsb as <code>i &amp; -i</code>.</strong> That quantity is both the length of i's owned range and the hop you take on every walk, so it is the only helper the two loops share. Never evaluate it at 0.",
    "<strong>add(i, v): climb by adding the lsb.</strong> Loop <code>for (; i &lt; bit.length; i += i &amp; -i) bit[i] += v</code>. Translate a 0-based array index x to <code>i = x + 1</code> first, so you notify every bucket whose owned range contains x.",
    "<strong>prefix(i): drop by subtracting the lsb.</strong> Loop <code>for (; i &gt; 0; i -= i &amp; -i) acc += bit[i]</code>. Each hop peels off the bucket that ends at the current i, and what remains is a strictly shorter prefix.",
    "<strong>Range [l, r] is two prefixes.</strong> Return <code>prefix(r) - prefix(l - 1)</code> with both ends 1-based and inclusive. <code>prefix(0)</code> is 0 because the loop never runs, which is what makes a query that starts at the first cell safe.",
    "<strong>Build by adding each a[i] once, or in linear time.</strong> The naive build is n updates. The linear build writes <code>bit[i] = a[i]</code> and then pushes each cell onto its parent <code>i + lsb(i)</code>, so each index is written a constant number of times.",
    "<strong>Compress coordinates before using the tree as a frequency map.</strong> If values go up to <code>10&#8313;</code> you cannot allocate a bucket per value. Sort the unique keys, rank them 1..n, and index the tree by rank so inversion-counting stays <code>O(n log n)</code>."
  ],
  "code": [
    {
      "tab": "Brute array",
      "file": "BruteRangeSum.java",
      "code": "public class BruteRangeSum {\n\n    static int[] a;\n\n    static void add(int i, int v) { a[i] += v; }\n\n    static long range(int l, int r) {\n        long s = 0;\n        for (int i = l; i <= r; i++) s += a[i];\n        return s;\n    }\n\n    public static void main(String[] args) {\n        a = new int[] {0, 3, 1, 4, 1, 5, 9, 2, 6};   // 1-based\n        System.out.println(range(1, 7));\n        System.out.println(range(3, 7));\n        add(3, 2);\n        System.out.println(range(1, 7));\n    }\n    // Input : [3,1,4,1,5,9,2,6] 1-based, then +2 at index 3\n    // Output: 25\n    //         21\n    //         27\n}",
      "intro": "Point update is O(1), range sum is O(n). The Fenwick swaps those to O(log n) each.",
      "highlight": "10-14",
      "panel": "Brute"
    },
    {
      "tab": "Fenwick",
      "file": "FenwickTree.java",
      "code": "public class FenwickTree {\n\n    final long[] bit;\n\n    FenwickTree(int n) { bit = new long[n + 1]; }\n\n    void add(int i, long v) {\n        for (; i < bit.length; i += i & -i) bit[i] += v;\n    }\n\n    long prefix(int i) {\n        long s = 0;\n        for (; i > 0; i -= i & -i) s += bit[i];\n        return s;\n    }\n\n    long range(int l, int r) { return prefix(r) - prefix(l - 1); }\n\n    public static void main(String[] args) {\n        int[] a = {3, 1, 4, 1, 5, 9, 2, 6};\n        FenwickTree ft = new FenwickTree(a.length);\n        for (int i = 0; i < a.length; i++) ft.add(i + 1, a[i]);\n        System.out.println(ft.prefix(7));\n        System.out.println(ft.range(3, 7));\n        ft.add(3, 2);\n        System.out.println(ft.prefix(7));\n    }\n    // Input : [3,1,4,1,5,9,2,6], then +2 at index 3\n    // Output: 25\n    //         21\n    //         27\n}",
      "intro": "The two loops. Build by adding each element. Same three numbers as the brute tab.",
      "highlight": "12-15,18-23,26-28",
      "panel": "Optimal"
    },
    {
      "tab": "Inversions",
      "file": "InversionBit.java",
      "code": "import java.util.Arrays;\nimport java.util.HashMap;\nimport java.util.Map;\n\npublic class InversionBit {\n\n    static class Fenwick {\n        long[] bit;\n        Fenwick(int n) { bit = new long[n + 1]; }\n        void add(int i, long v) { for (; i < bit.length; i += i & -i) bit[i] += v; }\n        long prefix(int i) {\n            long s = 0;\n            for (; i > 0; i -= i & -i) s += bit[i];\n            return s;\n        }\n        long range(int l, int r) { return prefix(r) - prefix(l - 1); }\n    }\n\n    static int[] compress(int[] a) {\n        int[] b = a.clone();\n        Arrays.sort(b);\n        Map<Integer, Integer> rk = new HashMap<>();\n        int r = 1;\n        for (int v : b) if (!rk.containsKey(v)) rk.put(v, r++);\n        int[] out = new int[a.length];\n        for (int i = 0; i < a.length; i++) out[i] = rk.get(a[i]);\n        return out;\n    }\n\n    static long inversions(int[] a) {\n        int[] rk = compress(a);\n        Fenwick ft = new Fenwick(a.length);\n        long inv = 0;\n        for (int i = 0; i < rk.length; i++) {\n            inv += ft.range(rk[i] + 1, a.length);   // seen ranks strictly larger\n            ft.add(rk[i], 1);\n        }\n        return inv;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(inversions(new int[] {3, 1, 4, 1, 5, 9, 2, 6}));\n        System.out.println(inversions(new int[] {1, 2, 3, 4}));\n        System.out.println(inversions(new int[] {4, 3, 2, 1}));\n    }\n    // Input : [3,1,4,1,5,9,2,6]\n    // Output: 8\n    //         0\n    //         6\n}",
      "intro": "Coordinate-compress, scan left to right, query how many already-inserted ranks are strictly larger, then insert. Classic O(n log n) inversion count.",
      "highlight": "24-32,35-43",
      "panel": "Template"
    }
  ],
  "complexity": {
    "time": "O(log n) per update or prefix query",
    "space": "O(n)",
    "derivation": [
      "<p>Each step of either loop changes i by its lowest set bit, which either clears that bit (query) or carries into a higher bit (update). At most <code>log<sub>2</sub> n</code> bits exist:</p>",
      "<span class=\"eq\">T<sub>op</sub>(n) = O(log n),&nbsp;&nbsp; T<sub>build</sub> = O(n log n) naive / O(n) linear build</span>",
      "<p>A segment tree is the same bound with a larger constant and more memory (4n vs n). Fenwick wins when the query is a prefix of an invertible op. At <code>n = q = 2&times;10&#8309;</code> both pass; Fenwick is shorter to type.</p>",
      "<p>Inversion counting is n updates and n queries on a compressed universe of size n, so <code>O(n log n)</code>, matching merge-sort inversions with a reusable structure.</p>"
    ],
    "compare": [
      [
        "Prefix array",
        "<code>O(1)</code> query, <code>O(n)</code> update",
        "<code>O(n)</code>",
        "No updates"
      ],
      [
        "Fenwick",
        "<code>O(log n)</code> both",
        "<code>O(n)</code>",
        "Point update, prefix/range sum"
      ],
      [
        "Segment tree",
        "<code>O(log n)</code> both",
        "<code>O(n)</code>",
        "Any associative op, easier range min"
      ],
      [
        "Lazy segtree",
        "<code>O(log n)</code> both",
        "<code>O(n)</code>",
        "Range updates"
      ]
    ]
  },
  "pitfalls": [
    {
      "title": "0-based index in a 1-based tree",
      "bug": "<code>add(0, v)</code> does <code>i += 0</code> forever, or immediately ArrayIndexOutOfBounds. The most common Fenwick crash, and it looks like a harmless 0-based habit.",
      "fix": "Map every 0-based array index i to Fenwick index i+1, and assert <code>i &gt;= 1</code> at the top of add. A unit test that updates a[0] will catch the translation."
    },
    {
      "title": "<code>int</code> overflow in the buckets",
      "bug": "n = 10&#8309;, values 10&#8313;, prefixes 10&sup1;&#8308;. Wrapping buckets still look vaguely plausible after a subtraction, so the sample can pass and hidden tests fail.",
      "fix": "Allocate <code>long[] bit</code> every time, even when the array itself is <code>int[]</code>. A single prefix of the whole array is the overflow check."
    },
    {
      "title": "range(l, r) with l = 1 calling prefix(0) incorrectly",
      "bug": "Writing <code>prefix(r) - prefix(l)</code> drops a[l], and the remaining sum still looks like a plausible range. Or calling prefix(-1) when someone passed 0-based l = 0.",
      "fix": "<code>prefix(r) - prefix(l - 1)</code> with l, r 1-based. prefix(0) is 0 because the loop never runs."
    },
    {
      "title": "Using a BIT for range minimum",
      "bug": "There is no inverse, so you cannot peel a left prefix off a right prefix. People still try, get a number, and fail hidden tests.",
      "fix": "Segment tree, or a sparse table if static. Fenwick min-trees exist only for very restricted updates (you can update a value downward, not arbitrarily)."
    },
    {
      "title": "Forgetting to compress before a frequency BIT",
      "bug": "Values up to 10&#8313;, allocating <code>new long[1_000_000_001]</code>, OOM. Or using the raw value as an index and throwing, which looks like a bounds bug rather than a missing compression.",
      "fix": "Sort unique values, rank them 1..n, BIT of size n. Ties need a stable policy (strictly greater vs greater-or-equal) matching the inversion definition."
    }
  ],
  "variants": [
    [
      "Range add, point query",
      "Difference array in the BIT: add v at l, add -v at r+1. Point query is prefix(i).",
      "add(l, v); add(r+1, -v);  query = prefix(i)",
      "Dual of point-add range-sum"
    ],
    [
      "Two BITs for range add + range sum",
      "Maintain B1, B2 so prefix(i) = i * sum(B1, i) - sum(B2, i). Range add [l,r] += v updates four entries. Smaller constant than a lazy segtree.",
      "B1.add(l,v); B1.add(r+1,-v); B2.add(l,v*(l-1)); B2.add(r+1,-v*r);",
      "Contest staple"
    ],
    [
      "XOR Fenwick",
      "Replace += with ^=. XOR is its own inverse, so range XOR is prefix(r) ^ prefix(l-1). Same loops.",
      "bit[i] ^= v;  acc ^= bit[i];",
      "LC 1442-style XOR counts, or CF 242E without lazy"
    ]
  ],
  "followups": [
    [
      "How do you build in O(n) instead of O(n log n)?",
      "<p>Set <code>bit[i] = a[i]</code> (1-based), then for i = 1..n push <code>bit[i]</code> onto <code>j = i + lsb(i)</code> if j &le; n. Each index is written a constant number of times. Useful when n is 10&#8311; and the log in the build actually shows up.</p>"
    ],
    [
      "Why is a Fenwick unable to do range minimum cleanly?",
      "<p>Querying [l, r] as a difference of prefixes needs an inverse. Min has none. You can store mins of the buckets, but combining an arbitrary [l, r] from those buckets needs the same disjoint-dyadic cover a segment tree already gives you, and the BIT addressing does not produce that cover for an arbitrary inner range. Write a segment tree.</p>"
    ],
    [
      "How does inversion count handle duplicates?",
      "<p>For strictly-greater inversions, query ranks <code>&gt; current</code> then insert. Equal values are not inversions. If you insert before querying you count equals as inversions. The order of query-then-insert (or insert-then-query with rank+1) is the whole policy. Coordinate compression must keep duplicates as the <em>same</em> rank.</p>"
    ],
    [
      "When do you pick Fenwick over a segment tree in an interview?",
      "<p>When the interviewer asked for range sums with point updates, or inversions. It is twenty lines and the lsb trick is a talking point. If they then say \"now make it range min\" you have a reason to rewrite as a segment tree, which is the next page.</p>"
    ]
  ],
  "problems": [
    {
      "name": "Range Sum Query - Mutable",
      "url": "https://leetcode.com/problems/range-sum-query-mutable/",
      "badge": "lc",
      "tag": "LC 307",
      "level": "Medium",
      "pattern": "The BIT drill"
    },
    {
      "name": "Count of Smaller Numbers After Self",
      "url": "https://leetcode.com/problems/count-of-smaller-numbers-after-self/",
      "badge": "lc",
      "tag": "LC 315",
      "level": "Hard",
      "pattern": "Scan right to left, query smaller, insert"
    },
    {
      "name": "Reverse Pairs",
      "url": "https://leetcode.com/problems/reverse-pairs/",
      "badge": "lc",
      "tag": "LC 493",
      "level": "Hard",
      "pattern": "Query count of ranks > 2*val, compress longs"
    },
    {
      "name": "Count of Range Sum",
      "url": "https://leetcode.com/problems/count-of-range-sum/",
      "badge": "lc",
      "tag": "LC 327",
      "level": "Hard",
      "pattern": "Prefix sums + BIT of compressed prefixes"
    },
    {
      "name": "Create Sorted Array through Instructions",
      "url": "https://leetcode.com/problems/create-sorted-array-through-instructions/",
      "badge": "lc",
      "tag": "LC 1649",
      "level": "Hard",
      "pattern": "min(count-smaller, count-larger) per insert"
    },
    {
      "name": "Enemy is weak",
      "url": "https://codeforces.com/problemset/problem/61/E",
      "badge": "cf",
      "tag": "CF 61E",
      "level": "Hard",
      "pattern": "Two BITs, count inversions of triples"
    },
    {
      "name": "Subsequences",
      "url": "https://codeforces.com/problemset/problem/597/C",
      "badge": "cf",
      "tag": "CF 597C",
      "level": "Hard",
      "pattern": "k nested BITs counting increasing subsequences"
    },
    {
      "name": "Pashmak and Parmida's Problem",
      "url": "https://codeforces.com/problemset/problem/459/D",
      "badge": "cf",
      "tag": "CF 459D",
      "level": "Medium",
      "pattern": "Prefix/suffix frequencies + BIT"
    },
    {
      "name": "Dynamic Range Sum Queries",
      "url": "https://leetcode.com/problems/range-sum-query-mutable/",
      "badge": "cf",
      "tag": "CSES",
      "level": "Easy",
      "pattern": "Point set, range sum"
    },
    {
      "name": "List Removals",
      "url": "https://codeforces.com/problemset/problem/1354/D",
      "badge": "cf",
      "tag": "CSES",
      "level": "Medium",
      "pattern": "Order-statistic BIT, find k-th remaining"
    }
  ],
  "recap": [
    "<strong>1-based.</strong> <code>i &amp; -i</code> on 0 is an infinite loop.",
    "<strong>Update adds lsb, query subtracts lsb.</strong> Both O(log n).",
    "<strong>Range = prefix(r) - prefix(l-1).</strong> Use long[].",
    "<strong>Compress values</strong> before a frequency BIT.",
    "<strong>Not for min.</strong> That is a segment tree."
  ],
  "oneliner": "add: for(;i<n;i+=i&-i) bit[i]+=v | prefix: for(;i>0;i-=i&-i) s+=bit[i] | range=pref(r)-pref(l-1)",
  "indexLabels": [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8"
  ],
  "arrayLabel": "bit[1..8]",
  "vizTitle": "Prefix(7) on an 8-element Fenwick tree",
  "vizIntro": "Array <code>[3, 1, 4, 1, 5, 9, 2, 6]</code> (1-based indices 1..8). After the build, <code>bit = [3, 4, 4, 9, 5, 14, 2, 31]</code>. Watch prefix(7) add the buckets it touches.",
  "vizCaption": "Query i=7 adds bit[7]=2, drops to 6, adds bit[6]=14, drops to 4, adds bit[4]=9, drops to 0. Total 25 = sum of a[1..7]. Those three slots are the whole query.",
  "merTitle": "Responsibility tree over the 8-element array",
  "merCaption": "Each node covers a power-of-two range ending at its index. Prefix(7) reads the three highlighted leaves of this walk: 7, then 6, then 4.",
  "coreHeading": "Core idea and the invariant",
  "spoilers": [
    {
      "summary": "Hint for LC 315 &mdash; scan from the right",
      "body": "<p>\"Smaller to the right\" means: process a[n-1], then a[n-2], ... At a[i] the BIT already holds the ranks of everything to the right, so <code>prefix(rank(a[i]) - 1)</code> is the answer for i. Then insert rank(a[i]). Compress first. Duplicates: ranks are equal, and prefix(rank-1) correctly ignores equals if you assigned a unique rank per value (not per occurrence).</p>"
    },
    {
      "summary": "Hint for LC 493 &mdash; reverse pairs with 2*val",
      "body": "<p>A reverse pair is i &lt; j and a[i] &gt; 2*a[j]. Scan from the right: query how many inserted values are &gt; 2*a[i] wait no &mdash; when i is current and j's already in (to the right), you want count of inserted values v with a[i] &gt; 2v, i.e. v &lt; a[i]/2. Easier: compress all a[i] and all 2*a[i] together as longs, query the count of ranks strictly above rank(2*a[i]), then insert a[i]. Overflow: 2*a[i] is a long.</p>"
    }
  ],
  "dryIntro": "Prefix(7) on the built tree <code>bit = [_, 3, 4, 4, 9, 5, 14, 2, 31]</code>. Then range [3, 7] via two prefixes.",
  "dryAfter": "<p>a[3..7] = 4, 1, 5, 9, 2 sums to 21. Two prefix walks, five bucket reads total.</p>"
}),

pack({
  "id": "segment-tree",
  "difficulty": "Medium",
  "readTime": "26 min",
  "tagline": "A binary tree over the array: each node is an associative combine of a dyadic segment, so point updates and range queries are <code>O(log n)</code> for any combine, not just sums.",
  "tags": [
    "segment tree",
    "range query",
    "associative",
    "P1"
  ],
  "prereqs": [
    [
      "Fenwick Tree",
      "fenwick-tree.html"
    ],
    [
      "Sparse Table & RMQ",
      "sparse-table-and-rmq.html"
    ]
  ],
  "why": [
    "You are given an array such as <code>[3, 1, 4, 1, 5, 9, 2, 6]</code>, and the questions mix two things a Fenwick tree and a sparse table each refuse: you need the minimum (or the gcd, or a little struct) of a range, <em>and</em> you also need to change a cell in between questions. A Fenwick tree wants an inverse so it can subtract prefixes, and minimum has none. A sparse table wants the array to stay still, and a point write invalidates a linear number of its blocks. Scanning the range per query is correct and dies at a hundred thousand by a hundred thousand.",
    "A segment tree stores the array at the leaves of a binary tree and, at every internal node, the combine of a contiguous segment of the array. The word <em>associative</em> here means only that <code>op(op(a, b), c) = op(a, op(b, c))</code>, so the order of grouping does not matter and a node is allowed to cache the combine of its two children. A point update walks the <code>O(log n)</code> ancestors of one leaf and recomputes each of them from its two children. A range query is answered by <code>O(log n)</code> <em>canonical</em> nodes &mdash; nodes whose segment sits entirely inside the query &mdash; and never more than two of those per level.",
    "Once you can write build, point-update and range-query for a sum, swapping the combine for minimum, gcd, XOR, or a struct (the open / close / already-matched triple of CF 380C) is a one-line change plus a new identity. Lazy propagation, the next page, is the extra machinery you add when the <em>update</em> itself is a range rather than a single cell.",
    "In a real statement the signal is point updates sitting next to a range query that is not a prefix of an invertible operation, at limits such as <code>n, q &le; 2&times;10&#8309;</code>. That combination rules out Fenwick and the sparse table, and it is exactly what a segment tree is for. If the interviewer then says \"now add v to every index in [l, r]\", you are being walked onto the next page."
  ],
  "insight": "Any associative combine gets a point update and a range query in a handful of node visits. The query never reads a node that sticks out past the range; it stops at the O(log n) canonical nodes that sit entirely inside and partition it exactly.",
  "yes": [
    "Point update + range query for min, max, gcd, or a custom struct",
    "The operation is associative but not invertible (so Fenwick prefixes do not work)",
    "You need both the combine and the ability to update, ruling out a sparse table",
    "Merge-sort tree / number of values in [L,R] that are &le; x (offline or with a Fenwick in each node)",
    "<code>n, q &le; 2&times;10&#8309;</code> and the interviewer said \"segment tree\""
  ],
  "no": [
    "Static range min &rarr; <a href=\"sparse-table-and-rmq.html\">sparse table</a> is simpler and O(1)",
    "Point update + range sum &rarr; <a href=\"fenwick-tree.html\">Fenwick</a> is shorter",
    "Range update + range query &rarr; <a href=\"segment-tree-lazy.html\">lazy propagation</a>",
    "No updates, range sum &rarr; prefix array"
  ],
  "table": [
    [
      "\"point set, range min\"",
      "Associative, has updates, no inverse",
      "Segment tree"
    ],
    [
      "\"point add, range sum\"",
      "Invertible prefix",
      "Fenwick is enough"
    ],
    [
      "\"range add, range sum\"",
      "Needs delayed tags",
      "Lazy segment tree"
    ],
    [
      "\"Sereja and Brackets, merge two halves\"",
      "Node stores a small struct",
      "CF 380C"
    ],
    [
      "\"Xenia and Bit Operations\"",
      "Alternate XOR/OR by depth",
      "CF 339D"
    ],
    [
      "\"count of values &le; x in [L,R]\", static",
      "Merge-sort tree or wavelet",
      "Segtree of vectors"
    ],
    [
      "<strong>Confused with:</strong> Fenwick tree",
      "BIT is a compressed segtree for prefixes of an invertible op",
      "Write a segtree when the node is not a prefix sum"
    ]
  ],
  "constraint": "<code>n, q &le; 2&times;10&#8309;</code> with point updates and an associative range query is the signature. Allocate <code>4n</code> nodes for the recursive heap layout (or <code>2n</code> for the iterative one); a tight <code>2n</code> on the recursive tree walks off the end of the array. Recursion depth is <code>log n</code>, which is safe. The combine must be associative; it need not be commutative or invertible.",
  "core": [
    "Give every node an index p and a closed segment [l, r] that it is responsible for. If l equals r the node is a leaf and holds <code>a[l]</code>. Otherwise the midpoint is <code>m = l + (r - l) / 2</code> (never <code>(l + r) / 2</code>, which overflows on large indices), the left child <code>p &lt;&lt; 1</code> covers [l, m], the right child <code>p &lt;&lt; 1 | 1</code> covers [m+1, r], and <code>t[p] = op(t[left], t[right])</code>. Build fills the tree bottom-up: write the children first, then the parent. A point update at index i walks down to the unique leaf that holds i, writes the new value, and recomputes every ancestor from its two children on the way back up, so the path of <code>log n</code> nodes is the only thing that changes.",
    "A query asking for the combine of [ql, qr], sitting at a node whose segment is [l, r], has three cases. If the node is disjoint from the query you return the <em>identity</em> of the operation &mdash; the value that combining with anything leaves unchanged, so 0 for sum or XOR, <code>Integer.MAX_VALUE</code> for min, 0 for gcd. If the node sits entirely inside the query you return <code>t[p]</code> and stop, because that cached combine is already the answer for this piece. If the node only partially overlaps you recurse into both children and combine what they return. The nodes that took the \"entirely inside\" branch are the canonical partition of the query, and there are O(log n) of them.",
    "The iterative layout packs the same tree into <code>t[n .. 2n)</code> as leaves and parents at <code>i &gt;&gt; 1</code>. It is faster and has no recursion, which is why contests prefer it for a plain point-update tree. The recursive form is what you want in an interview, because the three overlap cases are written out as named branches and the lazy tags on the next page hang on exactly those same nodes.",
    "Walk a sum query on [2, 6] of the sample <code>[3, 1, 4, 1, 5, 9, 2, 6]</code>, whose whole-array root holds 31. The root [0, 7] only partially overlaps [2, 6], so you split. The left half [0, 3] is still partial; inside it the node [2, 3] (values 4, 1, sum 5) sits fully inside the query and is taken whole. The right half [4, 7] splits again: [4, 5] (5+9=14) is fully inside, [6, 7] is partial, so you take the leaf 2 and reject the leaf 6. The three canonical pieces are [2, 3], [4, 5] and [6, 6], and 5+14+2 = 21, which is 4+1+5+9+2. A point write at index 3 then walks only the ancestors of that leaf and recomputes each from its two children."
  ],
  "invariant": "<p>Every node stores the combine of its segment. A query returns the combine of O(log n) canonical nodes that partition [ql, qr]:</p><span class=\"eq\">t[p] = op(a[l], a[l+1], &hellip;, a[r])</span><p>In plain words, you never add a node that sticks out past the query, and you never walk into a node that is already fully inside it. The nodes you stop at are a disjoint cover of exactly the indices you were asked about, so combining them is the combine of the range. That is also why a point update only repairs the ancestors of one leaf: every other node's segment does not contain that leaf, so its cached value is still right.</p><p>Interview sentence: <em>\"I recurse until a node is either disjoint or fully inside; the fully-inside nodes are the answer.\"</em></p>",
  "extra": [
    {
      "kind": "key",
      "title": "Identity of the op",
      "html": "<p>The no-overlap return value must be the identity: combining it with anything does nothing. Sum/XOR: 0. Min: Integer.MAX_VALUE. Gcd: 0 (because gcd(x, 0) = x). Getting this wrong poisons every query that does not cover a whole child.</p>"
    },
    {
      "kind": "tip",
      "title": "Allocate 4n, not 2n, for the recursive tree",
      "html": "<p>A complete binary tree on n leaves has 2n nodes, but the recursive heap-indexing with uneven splits can index up to about 4n. <code>new long[4 * n]</code> (or n<<2) is the standard allocation. Iterative trees use 2n.</p>"
    }
  ],
  "array": [
    31,
    9,
    22,
    4,
    5,
    14,
    8,
    3,
    1,
    4,
    1,
    5,
    9,
    2,
    6
  ],
  "vars": [
    "node",
    "seg",
    "add",
    "acc"
  ],
  "frames": [
    {
      "note": "Built tree. t[1] = 31 is the whole array. Query sum[2, 6] = 4+1+5+9+2 = 21.",
      "dim": [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14
      ],
      "values": {
        "node": 1,
        "seg": "0-7",
        "add": 0,
        "acc": 0
      }
    },
    {
      "note": "Root [0, 7] only partially overlaps [2, 6], so it cannot return t[1]. Recurse into both children.",
      "active": [
        0
      ],
      "dim": [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14
      ],
      "values": {
        "node": 1,
        "seg": "0-7 split",
        "add": 0,
        "acc": 0
      }
    },
    {
      "note": "Node 5 covers [2,3] and sits fully inside [2,6]. Add t[5] = 5. acc = 5.",
      "active": [
        4
      ],
      "best": [
        4
      ],
      "dim": [
        0,
        1,
        2,
        3,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14
      ],
      "values": {
        "node": 5,
        "seg": "2-3 full",
        "add": 5,
        "acc": 5
      }
    },
    {
      "note": "Node 6 covers [4,5], fully inside. Add t[6] = 14. acc = 19.",
      "active": [
        5
      ],
      "best": [
        4,
        5
      ],
      "dim": [
        0,
        1,
        2,
        3,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14
      ],
      "values": {
        "node": 6,
        "seg": "4-5 full",
        "add": 14,
        "acc": 19
      }
    },
    {
      "note": "Node 7 covers [6,7], partial (we need only index 6). Recurse. Leaf 14 covers [6,6], full. Add 2. acc = 21.",
      "active": [
        13
      ],
      "best": [
        4,
        5,
        13
      ],
      "dim": [
        0,
        1,
        2,
        3,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        14
      ],
      "values": {
        "node": 14,
        "seg": "6-6 full",
        "add": 2,
        "acc": 21
      }
    },
    {
      "note": "Leaf 15 covers [7,7], disjoint from [2,6]. Identity 0. Query done: 21.",
      "x": [
        14
      ],
      "best": [
        4,
        5,
        13
      ],
      "values": {
        "node": 15,
        "seg": "7-7 miss",
        "add": 0,
        "acc": 21
      }
    },
    {
      "note": "A point update at index 3 walks the ancestors 11, 5, 2, 1 and recomputes each from its two children.",
      "active": [
        10,
        4,
        1,
        0
      ],
      "values": {
        "node": "upd 3",
        "seg": "ancestors",
        "add": "—",
        "acc": "11-5-2-1"
      }
    }
  ],
  "mermaid": "graph TD\n  s1[\"1: 0-7 = 31\"] --> s2[\"2: 0-3 = 9\"]\n  s1 --> s3[\"3: 4-7 = 22\"]\n  s2 --> s4[\"4: 0-1 = 4\"]\n  s2 --> s5[\"5: 2-3 = 5\"]\n  s3 --> s6[\"6: 4-5 = 14\"]\n  s3 --> s7[\"7: 6-7 = 8\"]\n  s4 --> s8[\"8: 0 = 3\"]\n  s4 --> s9[\"9: 1 = 1\"]\n  s5 --> s10[\"10: 2 = 4\"]\n  s5 --> s11[\"11: 3 = 1\"]\n  s6 --> s12[\"12: 4 = 5\"]\n  s6 --> s13[\"13: 5 = 9\"]\n  s7 --> s14[\"14: 6 = 2\"]\n  s7 --> s15[\"15: 7 = 6\"]",
  "steps": [
    "<strong>Allocate <code>t[4n]</code> and pick the identity.</strong> Four times n is what the recursive heap indexing actually reaches on a non-power-of-two n. The identity is 0 for sum, <code>MAX_VALUE</code> for min, 0 for gcd; getting it wrong poisons every query that misses a child.",
    "<strong>Build(p, l, r) bottom-up.</strong> A leaf copies <code>a[l]</code>; otherwise split at <code>m = l + (r-l)/2</code>, build both children, then write <code>t[p] = op(t[p&lt;&lt;1], t[p&lt;&lt;1|1])</code> so the parent is defined only after the children exist.",
    "<strong>Update(p, l, r, i, v) repairs one path.</strong> If the node is a leaf, store v. Otherwise recurse into the unique child whose segment contains i, then recompute <code>t[p]</code> from the two children on the way back up. The rest of the tree is untouched.",
    "<strong>Query(p, l, r, ql, qr) is a three-way branch.</strong> Disjoint returns the identity; fully inside returns <code>t[p]</code>; otherwise combine the two recursive calls. Those three cases are the whole algorithm.",
    "<strong>Never return t[p] on a partial overlap.</strong> That cached value includes indices outside [ql, qr], so a query that only wanted the left half of a node would silently swallow the right half as well.",
    "<strong>Use <code>long</code> for sums, and split with <code>l + (r-l)/2</code>.</strong> An <code>int</code> prefix of <code>n = 10&#8309;</code> values of <code>10&#8313;</code> wraps, and <code>(l+r)/2</code> goes negative on large compressed coordinates.",
    "<strong>Swap the combine and the identity to change the operation.</strong> Min, gcd, XOR, or a struct node are the same recursion with a different <code>op</code> and a different \"do nothing\" value. The layout of the tree does not change."
  ],
  "code": [
    {
      "tab": "Brute",
      "file": "BrutePointRange.java",
      "code": "public class BrutePointRange {\n\n    static int[] a;\n\n    static void set(int i, int v) { a[i] = v; }\n\n    static long rangeSum(int l, int r) {\n        long s = 0;\n        for (int i = l; i <= r; i++) s += a[i];\n        return s;\n    }\n\n    public static void main(String[] args) {\n        a = new int[] {3, 1, 4, 1, 5, 9, 2, 6};\n        System.out.println(rangeSum(2, 6));\n        set(3, 3);\n        System.out.println(rangeSum(2, 6));\n        System.out.println(rangeSum(0, 7));\n    }\n    // Input : [3,1,4,1,5,9,2,6], then a[3]=3\n    // Output: 21\n    //         23\n    //         33\n}",
      "intro": "Point set is O(1), range scan is O(n). The tree makes both O(log n).",
      "highlight": "8-12",
      "panel": "Brute"
    },
    {
      "tab": "Segment tree",
      "file": "SegmentTree.java",
      "code": "public class SegmentTree {\n\n    final int n;\n    final long[] t;\n\n    SegmentTree(int[] a) {\n        n = a.length;\n        t = new long[Math.max(4, n * 4)];\n        build(1, 0, n - 1, a);\n    }\n\n    void build(int p, int l, int r, int[] a) {\n        if (l == r) { t[p] = a[l]; return; }\n        int m = l + (r - l) / 2;\n        build(p << 1, l, m, a);\n        build(p << 1 | 1, m + 1, r, a);\n        t[p] = t[p << 1] + t[p << 1 | 1];\n    }\n\n    void set(int p, int l, int r, int i, long v) {\n        if (l == r) { t[p] = v; return; }\n        int m = l + (r - l) / 2;\n        if (i <= m) set(p << 1, l, m, i, v);\n        else set(p << 1 | 1, m + 1, r, i, v);\n        t[p] = t[p << 1] + t[p << 1 | 1];\n    }\n\n    long query(int p, int l, int r, int ql, int qr) {\n        if (qr < l || r < ql) return 0;              // identity\n        if (ql <= l && r <= qr) return t[p];         // canonical node\n        int m = l + (r - l) / 2;\n        return query(p << 1, l, m, ql, qr)\n             + query(p << 1 | 1, m + 1, r, ql, qr);\n    }\n\n    public static void main(String[] args) {\n        int[] a = {3, 1, 4, 1, 5, 9, 2, 6};\n        SegmentTree st = new SegmentTree(a);\n        System.out.println(st.query(1, 0, st.n - 1, 2, 6));\n        st.set(1, 0, st.n - 1, 3, 3);\n        System.out.println(st.query(1, 0, st.n - 1, 2, 6));\n        System.out.println(st.query(1, 0, st.n - 1, 0, 7));\n    }\n    // Input : [3,1,4,1,5,9,2,6], then a[3]=3\n    // Output: 21\n    //         23\n    //         33\n}",
      "intro": "Recursive sum tree. Query [2, 6] then a point set, matching the dry run.",
      "highlight": "18-24,27-35,38-47",
      "panel": "Optimal"
    },
    {
      "tab": "Range min",
      "file": "SegmentTreeMin.java",
      "code": "public class SegmentTreeMin {\n\n    final int n;\n    final int[] t;\n\n    SegmentTreeMin(int[] a) {\n        n = a.length;\n        t = new int[Math.max(4, n * 4)];\n        build(1, 0, n - 1, a);\n    }\n\n    void build(int p, int l, int r, int[] a) {\n        if (l == r) { t[p] = a[l]; return; }\n        int m = l + (r - l) / 2;\n        build(p << 1, l, m, a);\n        build(p << 1 | 1, m + 1, r, a);\n        t[p] = Math.min(t[p << 1], t[p << 1 | 1]);\n    }\n\n    void set(int p, int l, int r, int i, int v) {\n        if (l == r) { t[p] = v; return; }\n        int m = l + (r - l) / 2;\n        if (i <= m) set(p << 1, l, m, i, v);\n        else set(p << 1 | 1, m + 1, r, i, v);\n        t[p] = Math.min(t[p << 1], t[p << 1 | 1]);\n    }\n\n    int query(int p, int l, int r, int ql, int qr) {\n        if (qr < l || r < ql) return Integer.MAX_VALUE;\n        if (ql <= l && r <= qr) return t[p];\n        int m = l + (r - l) / 2;\n        return Math.min(query(p << 1, l, m, ql, qr),\n                        query(p << 1 | 1, m + 1, r, ql, qr));\n    }\n\n    public static void main(String[] args) {\n        int[] a = {3, 1, 4, 1, 5, 9, 2, 6};\n        SegmentTreeMin st = new SegmentTreeMin(a);\n        System.out.println(st.query(1, 0, st.n - 1, 2, 6));\n        st.set(1, 0, st.n - 1, 6, 0);\n        System.out.println(st.query(1, 0, st.n - 1, 2, 6));\n        System.out.println(st.query(1, 0, st.n - 1, 0, 7));\n    }\n    // Input : [3,1,4,1,5,9,2,6], then a[6]=0\n    // Output: 1\n    //         0\n    //         0\n}",
      "intro": "Same skeleton, identity is <code>Integer.MAX_VALUE</code>, combine is min. This is the structure a sparse table cannot be once updates exist.",
      "highlight": "18-24,38-47",
      "panel": "Template"
    }
  ],
  "complexity": {
    "time": "O(n) build, O(log n) per update or query",
    "space": "O(n)",
    "derivation": [
      "<p>Build visits each of the O(n) nodes once. Update and query each descend one path (or two, for a query that splits) of length O(log n), and a query adds O(1) work per visited node:</p>",
      "<span class=\"eq\">T<sub>build</sub> = &Theta;(n),&nbsp;&nbsp; T<sub>op</sub> = O(log n)</span>",
      "<p>At each of the log n levels a query takes at most two canonical nodes, which is why the cover size is O(log n) and not O(n). A Fenwick tree is the same bound with a smaller constant, but only for prefix-invertible ops. A sparse table is O(1) query with no updates.</p>"
    ],
    "compare": [
      [
        "Scan",
        "<code>O(n)</code> / query",
        "<code>O(1)</code>",
        "q is 1"
      ],
      [
        "Fenwick",
        "<code>O(log n)</code>",
        "<code>O(n)</code>",
        "Prefix-invertible only"
      ],
      [
        "Segment tree",
        "<code>O(log n)</code>",
        "<code>O(n)</code>",
        "Any associative op + updates"
      ],
      [
        "Sparse table",
        "<code>O(1)</code> query",
        "<code>O(n log n)</code>",
        "Idempotent, no updates"
      ]
    ]
  },
  "pitfalls": [
    {
      "title": "Adding t[p] on a partial overlap",
      "bug": "Missing the complete-cover check and always combining children, or worse, returning t[p] whenever the node overlaps at all. The second includes indices outside [ql, qr].",
      "fix": "Three-way branch: disjoint / complete / partial. Only the complete-cover case returns t[p]. A query that stops one index short of a child is the test."
    },
    {
      "title": "Wrong identity",
      "bug": "Range min returns 0 for a disjoint child. Any query that does not cover both children is then capped at 0, which looks like a plausible minimum.",
      "fix": "Min identity is MAX_VALUE (or a sentinel bigger than any array value). Sum/XOR identity is 0. Gcd identity is 0."
    },
    {
      "title": "Allocating 2n for the recursive heap",
      "bug": "Indices run past 2n on non-power-of-two n (the right spine goes to about 4n). Silent corruption or AIOOB, and it looks fine on the power-of-two sample.",
      "fix": "Allocate <code>new long[n * 4]</code> for the recursive tree. Iterative trees may use 2n because their layout is a packed complete tree."
    },
    {
      "title": "<code>(l + r) / 2</code> overflow",
      "bug": "On large index ranges (coordinate-compressed to 10&#8313; in a dynamic tree) l+r overflows int and the split goes negative, so the recursion never hits the leaf you intended.",
      "fix": "Write <code>int m = l + (r - l) / 2;</code> at every split, including the lazy tree on the next page. A query at index <code>10&#8313; - 1</code> is the overflow test."
    },
    {
      "title": "Updating t[p] before the recursive call returns",
      "bug": "Recompute from children that still hold the old value. The new leaf is written but ancestors stay stale, and later queries on large ranges miss the update.",
      "fix": "Recurse into the child first, then write <code>t[p] = op(t[left], t[right])</code> on the way back up. An update followed by a query of the whole array is the staleness test."
    }
  ],
  "variants": [
    [
      "Iterative / bottom-up",
      "Leaves at t[n..2n). Parent of i is i>>1. Query walks L and R inward, combining odd nodes. Faster, no recursion, harder to hang lazy tags on.",
      "for (int i = n + l, j = n + r; i < j; i >>= 1, j >>= 1)",
      "e-maxx iterative template"
    ],
    [
      "Struct nodes (brackets, max+count)",
      "Each node stores several fields; combine is a small function. CF 380C stores (matched, leftover opens, leftover closes) so two halves merge in O(1).",
      "Node merge(Node a, Node b) { take min(a.open, b.close) as new matches; ... }",
      "CF 380C, LC 732 My Calendar III"
    ],
    [
      "Dynamic / implicit",
      "Nodes allocated on demand for a huge index universe (coordinates 10&sup1;&#8312;). Left/right children are pointers, not p<<1. Memory is O(q log U).",
      "if (left == null) left = new Node();",
      "Online coordinate compression alternative"
    ]
  ],
  "followups": [
    [
      "How many canonical nodes does a query use?",
      "<p>At most two per level, so &le; 2 log n. Proof: once a level has a partial node, the next step either takes a complete child (canonical) or continues into one partial child; you cannot keep two partials on the same path for long. This is why query is O(log n), not O(n).</p>"
    ],
    [
      "Can the combine be non-commutative?",
      "<p>Yes, as long as it is associative. Always combine the left child and then the right child, in that order, so the grouping matches the array from left to right. Matrix products along a path, or string concatenation of a segment, both work. Swapping the two children would reverse the product and fail the first non-commutative test.</p>"
    ],
    [
      "What is a merge-sort tree?",
      "<p>Each node stores the sorted list of its segment (merge of the two children). A query [ql, qr] binary-searches \"how many values &le; x\" in each canonical node's list, totalling O(log&sup2; n). Build is O(n log n) memory and time. Fractional cascading removes one log; a Fenwick of Fenwicks or a wavelet tree are the usual contest substitutes.</p>"
    ],
    [
      "When is the iterative form worth it?",
      "<p>When you are tight on time in a contest and the tree is not lazy. The iterative form has no recursion, tighter constants, and a 2n array. In an interview the recursive form is clearer, the three overlap cases read as named branches, and it is the one you will extend with lazy tags on the next page. Learn recursive first and switch only when a clock is running.</p>"
    ]
  ],
  "problems": [
    {
      "name": "Range Sum Query - Mutable",
      "url": "https://leetcode.com/problems/range-sum-query-mutable/",
      "badge": "lc",
      "tag": "LC 307",
      "level": "Medium",
      "pattern": "Point set, range sum"
    },
    {
      "name": "Range Minimum Query with updates",
      "url": "https://leetcode.com/problems/falling-squares/",
      "badge": "lc",
      "tag": "LC 699",
      "level": "Hard",
      "pattern": "Compress coords, range max, point/range set"
    },
    {
      "name": "My Calendar III",
      "url": "https://leetcode.com/problems/my-calendar-iii/",
      "badge": "lc",
      "tag": "LC 732",
      "level": "Hard",
      "pattern": "Dynamic segtree of occupancy"
    },
    {
      "name": "Count of Range Sum",
      "url": "https://leetcode.com/problems/count-of-range-sum/",
      "badge": "lc",
      "tag": "LC 327",
      "level": "Hard",
      "pattern": "Merge-sort tree / BIT on prefixes"
    },
    {
      "name": "Xenia and Bit Operations",
      "url": "https://codeforces.com/problemset/problem/339/D",
      "badge": "cf",
      "tag": "CF 339D",
      "level": "Medium",
      "pattern": "OR/XOR alternating by level"
    },
    {
      "name": "Sereja and Brackets",
      "url": "https://codeforces.com/problemset/problem/380/C",
      "badge": "cf",
      "tag": "CF 380C",
      "level": "Hard",
      "pattern": "Struct node, merge two bracket halves"
    },
    {
      "name": "Knight Tournament",
      "url": "https://codeforces.com/problemset/problem/356/A",
      "badge": "cf",
      "tag": "CF 356A",
      "level": "Medium",
      "pattern": "Range assign who-wins, DSU skip, or segtree"
    },
    {
      "name": "Dynamic Range Minimum Queries",
      "url": "https://codeforces.com/problemset/problem/339/D",
      "badge": "cf",
      "tag": "CSES",
      "level": "Easy",
      "pattern": "Point set, range min"
    },
    {
      "name": "Dynamic Range Sum Queries",
      "url": "https://leetcode.com/problems/range-sum-query-mutable/",
      "badge": "cf",
      "tag": "CSES",
      "level": "Easy",
      "pattern": "Point set, range sum"
    },
    {
      "name": "Range Update Queries",
      "url": "https://codeforces.com/problemset/problem/380/C",
      "badge": "cf",
      "tag": "CSES",
      "level": "Medium",
      "pattern": "Teaser for lazy, or difference + Fenwick"
    }
  ],
  "recap": [
    "<strong>Three-way branch:</strong> disjoint (identity), complete (return t[p]), partial (recurse).",
    "<strong>O(log n) canonical nodes</strong> partition any query range.",
    "<strong>Allocate 4n</strong> for the recursive heap. Mid is <code>l + (r-l)/2</code>.",
    "<strong>Any associative op</strong> works; pick the identity carefully.",
    "<strong>Range updates need lazy tags,</strong> the next page."
  ],
  "oneliner": "if disjoint: id; if ql<=l && r<=qr: t[p]; else op(query L, query R) | t[p]=op(t[L],t[R])",
  "indexLabels": [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15"
  ],
  "arrayLabel": "t[1..15] heap layout",
  "vizTitle": "Range sum [2, 6] on the 8-leaf tree",
  "vizIntro": "Array <code>[3, 1, 4, 1, 5, 9, 2, 6]</code>. Heap-indexed nodes 1..15. The query [2, 6] is covered by three canonical nodes: [2,3], [4,5], [6,6].",
  "vizCaption": "Canonical cover: node 5 (sum 5), node 6 (sum 14), node 14 (sum 2). Total 21. Those three slots are the whole query; the other twelve are not added.",
  "merTitle": "The heap-indexed tree over eight leaves",
  "merCaption": "Query [2, 6] returns nodes 5, 6, and 14. Node 7 is visited but not fully covered, so it is split rather than added.",
  "coreHeading": "Core idea and the invariant",
  "spoilers": [
    {
      "summary": "Hint for CF 380C &mdash; what a node stores",
      "body": "<p>A segment of brackets is not a single integer. Store three numbers: how many matched pairs sit entirely inside, how many unmatched '(' remain, how many unmatched ')' remain. Merging left and right: new matches = left.matches + right.matches + min(left.open, right.close); leftover opens and closes follow. The answer for a query is 2 * matches of that canonical combine. Associative, not commutative in an interesting way, and a poster-child struct node.</p>"
    },
    {
      "summary": "Hint for CF 339D &mdash; the op depends on depth",
      "body": "<p>n is a power of two. Leaves are the array. Odd-height parents OR their children, even-height parents XOR (or the other way around, matching the statement). A point update recomputes ancestors, switching the op at each level. The root is the answer after each update. Implementation is a segment tree whose combine is not uniform; pass a boolean down, or key off the node's range length.</p>"
    }
  ],
  "dryIntro": "A sum query on indices [2, 6] of the sample, walking the tree from the root. Only the canonical (fully covered) nodes add into acc; a partial node is split and a disjoint node returns 0.",
  "dryAfter": "<p>Node 4 [0,1] and node 15 [7,7] are disjoint and return 0. Three additions, answer 21.</p>"
}),

pack({
  "id": "segment-tree-lazy",
  "difficulty": "Hard",
  "readTime": "28 min",
  "tagline": "Range updates become O(log n) by parking a tag on a canonical node and pushing it to the children only when you next have to split that node.",
  "tags": [
    "lazy propagation",
    "range update",
    "segment tree",
    "P2"
  ],
  "prereqs": [
    [
      "Segment Tree",
      "segment-tree.html"
    ]
  ],
  "why": [
    "You are given the same array <code>[3, 1, 4, 1, 5, 9, 2, 6]</code>, but now the update itself is a range: add 2 to every index from 1 to 5, then report the sum (or the minimum) of some other range. A plain segment tree updates one leaf in <code>O(log n)</code>. Doing that for each of the k cells in the update is <code>O(k log n)</code>, and at k = n a hundred thousand such updates is two billion steps. The observation that saves you is the same canonical cover the query already uses: any range splits into O(log n) nodes that sit entirely inside it. If you can apply the update to a whole node in constant time, you never have to touch its leaves &mdash; provided you remember to tell the children later.",
    "That memory is a <em>pending tag</em>, stored in a second array <code>lazy[p]</code>. A pending tag on node p means: \"the combine <code>t[p]</code> already includes this update, so any query that stops here is correct, but my children have not been told yet and their <code>t</code> values are stale.\" When a later operation needs to look at a child, you <em>push</em> the tag down: apply the same update to both children (which updates their <code>t</code> and their own lazy slots), then clear <code>lazy[p]</code> so you cannot apply it twice. Tags sink only on demand, which is why a range update stays O(log n) even though most of the array was logically changed.",
    "Push-down is safe for a precise reason. The update is <em>uniform</em> across p's segment: every leaf under p receives the same add (or the same assign). Applying that update to the left child and the right child, each scaled by its own length, is exactly what would have happened if you had walked every leaf. Clearing the parent tag afterwards is safe because the information has moved, not vanished: <code>t[p]</code> is still the true combine, and the children now carry the responsibility that p was holding. You must not push on a full-cover query, because you do not need the children; pushing there would turn the lazy tree back into an eager one.",
    "In a real statement the signal is mixed range updates and range queries at <code>n, q &le; 2&times;10&#8309;</code>. That combination rules out walking leaves and is the default contest structure for range add plus range sum or min, for range assign, and for range XOR. It is also the first place a segment tree goes wrong on hidden tests: a forgotten push, a tag applied twice, or a parent recomputed from children that have not yet seen the tag."
  ],
  "insight": "A pending tag means t[p] is already correct and the children are the ones who are behind. Apply on a fully covered node in constant time, store the tag, and push that tag down only when you next have to split the node. Pushing is safe because a uniform update on a parent is the same uniform update on each child.",
  "yes": [
    "Range add / range assign mixed with range sum or range min",
    "\"Add v to [l, r], then report min / sum of [l2, r2]\", many mixed operations",
    "Range XOR of a segment, then range sum (CF 242E)",
    "Circular RMQ: range add and range min on a cycle (CF 52C)",
    "The plain point-update tree is not enough because the update itself is a range"
  ],
  "no": [
    "Point updates only &rarr; <a href=\"segment-tree.html\">plain segment tree</a>",
    "Range add, point query &rarr; difference array in a <a href=\"fenwick-tree.html\">Fenwick</a> is shorter",
    "All updates then one read &rarr; difference array, no tree",
    "Static range min &rarr; <a href=\"sparse-table-and-rmq.html\">sparse table</a>"
  ],
  "table": [
    [
      "\"add v to [l,r], query sum [l,r]\"",
      "Range add, range sum",
      "Lazy + length * v"
    ],
    [
      "\"add v to [l,r], query min [l,r]\"",
      "Range add, range min",
      "Lazy + v, min += v"
    ],
    [
      "\"set [l,r] = v, query sum\"",
      "Range assign",
      "Lazy assign tag, overrides add"
    ],
    [
      "\"XOR [l,r] with x, query sum\"",
      "Bit-lazy, 20 bit-segtree or one with bits",
      "CF 242E"
    ],
    [
      "\"range add on a cycle\"",
      "Two linear updates, or a circular split",
      "CF 52C"
    ],
    [
      "\"chmin / chmax on a range\"",
      "More tags (beats, Jotaro)",
      "P2+, not this page"
    ],
    [
      "<strong>Confused with:</strong> Fenwick range-add range-sum",
      "Two BITs do that for sums only, with a smaller constant",
      "Lazy segtree when you also need min, or a custom combine"
    ]
  ],
  "constraint": "<code>n, q &le; 2&times;10&#8309;</code> with mixed range updates and range queries is the signature. Each operation must stay O(log n), so you cannot walk the leaves of an update. Tags must compose: applying v2 after v1 has to collapse into a single combined tag, otherwise two pending updates on the same node would need a queue.",
  "core": [
    "Keep two arrays. <code>t[p]</code> is always the true combine of p's segment, including every update that has been applied to p, even the ones not yet pushed to the children. <code>lazy[p]</code> is the pending tag: the update the children have not received. The helper <code>apply(p, v)</code> writes v into both places at once: for a range add it does <code>t[p] += v * (r - l + 1)</code> so the cached sum stays honest, and <code>lazy[p] += v</code> so a later push can repeat the same add on the children. The helper <code>push(p)</code> is the move: if the tag is non-zero and p is not a leaf, call apply on both children with <code>lazy[p]</code>, then zero the tag. After a push, p's children are as up to date as p was, and p is no longer responsible for telling them.",
    "A range update uses the same three-way branch as a query. If the node is disjoint, return. If the node sits entirely inside the update, apply and return without recursing: that is the whole point of the tag. If the node only partially overlaps, push first so the children see whatever p was holding, recurse into both children, then recompute <code>t[p]</code> from those (now updated) children. A range query is the same three-way branch, with the same push on the partial case, because you must not read a child that has not yet received its parent's tag. A full-cover query returns <code>t[p]</code> and does not push, because t[p] already includes the tag.",
    "Tags must compose, because two updates can land on the same node before either is pushed. For range add, composition is addition: <code>lazy[p] += v</code>. For range assign, a new assign overwrites the old tag, because \"set everything to 7\" cancels a previous \"set everything to 3\". Mixing add and assign needs two tags, or a single tagged union with a defined override rule (assign wins, then add). If the update cannot be summarised from <code>t[p]</code> and the segment length alone &mdash; integer division of every element is the usual counter-example &mdash; lazy propagation does not apply and you are on a different structure.",
    "Walk add 2 to indices [1, 5] on the sample whose whole-array sum is 31. The canonical cover of [1, 5] is the leaf [1, 1], the node [2, 3], and the node [4, 5]. Apply writes leaf t = 1+2 = 3 with lazy 2, node [2, 3] t = 5+4 = 9 with lazy 2, and node [4, 5] t = 14+4 = 18 with lazy 2. The ancestors recompute from those new child values to 13, 26 and 39, which is the old 31 plus 2 times 5. The leaves under [2, 3] still hold 4 and 1; they are stale, and that is fine. A later query of [2, 6] hits [2, 3] as a full cover, reads 9, and does not push. It does the same for [4, 5] (18) and takes the untouched leaf 2, for a total of 29, matching the new array [3, 3, 6, 3, 7, 11, 2, 6] on indices 2..6."
  ],
  "invariant": "<p>After every public operation, two facts hold at every node:</p><span class=\"eq\">t[p] is the true combine of p's segment;&nbsp; lazy[p] is the update the children have not yet seen</span><p>In plain words, a pending tag is not a sticky note you might forget: it is a promise that this node's cached answer is already right and that the work of telling the children has been deferred. Push-down is safe because the update is the same at every leaf under p, so applying it to the two children (each scaled by its own length) is exactly the walk you skipped, and clearing the parent tag afterwards cannot lose information &mdash; the children now carry it. Reading a child without pushing first is the one thing that breaks the promise, because you would combine two stale halves and write the wrong number back into t[p].</p><p>Interview sentence: <em>\"I apply on a full cover and I push before I split. I never read a child without pushing the parent first.\"</em></p>",
  "extra": [
    {
      "kind": "key",
      "title": "Push before you look down",
      "html": "<p>Both query and update, on the partial-overlap branch, must push first. If you recurse without pushing, children hold stale t[] and you combine garbage, then write that garbage back into t[p] on the way up.</p>"
    },
    {
      "kind": "math",
      "title": "Why t[p] += v * length",
      "html": "<p>A range add of v increases every one of the (r-l+1) leaves by v, so the sum increases by v times the length. For range min the length factor is absent: min += v. Applying the wrong formula is a silent off-by-factor.</p>"
    },
    {
      "kind": "idea",
      "title": "Why push-down cannot lose the update",
      "html": "<p>The tag on p is a deferred copy of an update that t[p] already reflects. Pushing writes that same update into both children and then zeros lazy[p]. Nothing is discarded: t[p] stays correct, and the children now hold the promise p was keeping. Applying the tag twice would be the actual loss, which is why the zero after the push is load-bearing.</p>"
    }
  ],
  "array": [
    31,
    9,
    22,
    4,
    5,
    14,
    8,
    3,
    1,
    4,
    1,
    5,
    9,
    2,
    6
  ],
  "vars": [
    "node",
    "tag",
    "t[p]",
    "note"
  ],
  "frames": [
    {
      "note": "Before the update, t[1] = 31. Range add [1, 5] += 2 should increase the total by 2 * 5 = 10.",
      "dim": [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14
      ],
      "values": {
        "node": 1,
        "tag": 0,
        "t[p]": 31,
        "note": "start"
      }
    },
    {
      "note": "Canonical cover of [1,5]: leaf node 9 ([1,1]), node 5 ([2,3]), node 6 ([4,5]). Apply +2 * length there.",
      "active": [
        8,
        4,
        5
      ],
      "values": {
        "node": "cover",
        "tag": "+2",
        "t[p]": "apply 3 nodes",
        "note": "not 5 leaves"
      }
    },
    {
      "note": "Node 9 length 1: t = 1+2 = 3, lazy = 2. Node 5 length 2: t = 5+4 = 9, lazy = 2. Node 6 length 2: t = 14+4 = 18, lazy = 2.",
      "arr": [
        31,
        9,
        22,
        4,
        9,
        18,
        8,
        3,
        3,
        4,
        1,
        5,
        9,
        2,
        6
      ],
      "active": [
        8,
        4,
        5
      ],
      "values": {
        "node": "applied",
        "tag": 2,
        "t[p]": "3, 9, 18",
        "note": "children stale"
      }
    },
    {
      "note": "Recompute ancestors: t[2] = 4+9 = 13, t[3] = 18+8 = 26, t[1] = 13+26 = 39. Whole sum 31+10 = 39. Correct without visiting leaves 10..13.",
      "arr": [
        39,
        13,
        26,
        4,
        9,
        18,
        8,
        3,
        3,
        4,
        1,
        5,
        9,
        2,
        6
      ],
      "active": [
        0,
        1,
        2
      ],
      "done": [
        4,
        5,
        8
      ],
      "values": {
        "node": 1,
        "tag": 0,
        "t[p]": 39,
        "note": "ancestors rebuilt"
      }
    },
    {
      "note": "Query [2,6]: node 5 is a full cover, t[5]=9 already includes the tag. Add 9. Do not push.",
      "arr": [
        39,
        13,
        26,
        4,
        9,
        18,
        8,
        3,
        3,
        4,
        1,
        5,
        9,
        2,
        6
      ],
      "best": [
        4
      ],
      "values": {
        "node": 5,
        "tag": 2,
        "t[p]": 9,
        "note": "acc=9"
      }
    },
    {
      "note": "Node 6 full cover, add 18. acc = 27. Node 14 ([6,6]) disjoint from the update, t=2. acc = 29.",
      "arr": [
        39,
        13,
        26,
        4,
        9,
        18,
        8,
        3,
        3,
        4,
        1,
        5,
        9,
        2,
        6
      ],
      "best": [
        4,
        5,
        13
      ],
      "values": {
        "node": "5+6+14",
        "tag": "—",
        "t[p]": 29,
        "note": "acc=29"
      }
    },
    {
      "note": "Check: new array is [3, 3, 6, 3, 7, 11, 2, 6], sum[2,6] = 6+3+7+11+2 = 29. Three nodes, not five leaves.",
      "arr": [
        39,
        13,
        26,
        4,
        9,
        18,
        8,
        3,
        3,
        4,
        1,
        5,
        9,
        2,
        6
      ],
      "best": [
        4,
        5,
        13
      ],
      "done": [
        0,
        1,
        2
      ],
      "values": {
        "node": "ans",
        "tag": "—",
        "t[p]": 29,
        "note": "matches"
      }
    }
  ],
  "mermaid": "graph TD\n  z1[\"1: sum 39\"] --> z2[\"2: sum 13\"]\n  z1 --> z3[\"3: sum 26\"]\n  z2 --> z4[\"4: 0-1\"]\n  z2 --> z5[\"5: 2-3 tag plus 2\"]\n  z3 --> z6[\"6: 4-5 tag plus 2\"]\n  z3 --> z7[\"7: 6-7\"]\n  z4 --> z8[\"8: a0 = 3\"]\n  z4 --> z9[\"9: a1 tag plus 2\"]\n  z5 --> z10[\"10: stale\"]\n  z5 --> z11[\"11: stale\"]\n  z6 --> z12[\"12: stale\"]\n  z6 --> z13[\"13: stale\"]\n  z7 --> z14[\"14: a6 = 2\"]\n  z7 --> z15[\"15: a7 = 6\"]",
  "steps": [
    "<strong>Store two arrays, t and lazy.</strong> <code>t[4n]</code> holds the current combine of each segment; <code>lazy[4n]</code> holds the pending child update. Build t as in the plain tree; every lazy slot starts at 0, meaning \"nothing pending\".",
    "<strong>apply(p, l, r, v) updates t and the tag together.</strong> For a range add write <code>t[p] += v * (r - l + 1)</code> and <code>lazy[p] += v</code>. This is O(1) and is what makes t[p] correct even though the children have not been visited.",
    "<strong>push(p, l, r) moves the tag one level down.</strong> If lazy[p] is non-zero and p is not a leaf, apply that tag to both children, then zero lazy[p] so the same update cannot fire twice. Leaves have no children to tell.",
    "<strong>Range update is apply-and-stop on a full cover.</strong> Disjoint returns; complete cover calls apply and returns without recursing; otherwise push, recurse both children, then recompute t[p] from the children. Stopping on a full cover is what keeps the update O(log n).",
    "<strong>Range query uses the same three-way branch.</strong> The partial case must push first so the children are up to date before you read them. The full-cover case returns t[p] and does not push, because t[p] already includes the tag.",
    "<strong>Never recurse on a node you have not pushed.</strong> A child you read while a tag still sits on the parent is stale, and writing the combine of two stale children back into t[p] corrupts the only copy of the truth you had.",
    "<strong>Compose tags instead of queuing them.</strong> For add, <code>lazy += v</code>. For assign, overwrite the old tag (after a push, or with an explicit override rule). Two tags that cannot collapse into one will not fit in a single long."
  ],
  "code": [
    {
      "tab": "Brute range add",
      "file": "BruteRangeAdd.java",
      "code": "public class BruteRangeAdd {\n\n    static long[] a;\n\n    static void add(int l, int r, long v) {\n        for (int i = l; i <= r; i++) a[i] += v;\n    }\n\n    static long sum(int l, int r) {\n        long s = 0;\n        for (int i = l; i <= r; i++) s += a[i];\n        return s;\n    }\n\n    public static void main(String[] args) {\n        a = new long[] {3, 1, 4, 1, 5, 9, 2, 6};\n        add(1, 5, 2);\n        System.out.println(sum(2, 6));\n        System.out.println(sum(0, 7));\n        System.out.println(java.util.Arrays.toString(a));\n    }\n    // Input : [3,1,4,1,5,9,2,6], add [1,5] += 2\n    // Output: 29\n    //         41\n    //         [3, 3, 6, 3, 7, 11, 2, 6]\n}",
      "intro": "Loop the range. Correct, O(n) per update, the thing lazy avoids.",
      "highlight": "8-10,13-17",
      "panel": "Brute"
    },
    {
      "tab": "Lazy add",
      "file": "LazySegTree.java",
      "code": "public class LazySegTree {\n\n    final int n;\n    final long[] t, lazy;\n\n    LazySegTree(int[] a) {\n        n = a.length;\n        t = new long[n * 4];\n        lazy = new long[n * 4];\n        build(1, 0, n - 1, a);\n    }\n\n    void build(int p, int l, int r, int[] a) {\n        if (l == r) { t[p] = a[l]; return; }\n        int m = l + (r - l) / 2;\n        build(p << 1, l, m, a);\n        build(p << 1 | 1, m + 1, r, a);\n        t[p] = t[p << 1] + t[p << 1 | 1];\n    }\n\n    void apply(int p, int l, int r, long v) {\n        t[p] += v * (r - l + 1);\n        lazy[p] += v;\n    }\n\n    void push(int p, int l, int r) {\n        if (lazy[p] == 0 || l == r) return;\n        int m = l + (r - l) / 2;\n        apply(p << 1, l, m, lazy[p]);\n        apply(p << 1 | 1, m + 1, r, lazy[p]);\n        lazy[p] = 0;\n    }\n\n    void add(int p, int l, int r, int ql, int qr, long v) {\n        if (qr < l || r < ql) return;\n        if (ql <= l && r <= qr) { apply(p, l, r, v); return; }\n        push(p, l, r);\n        int m = l + (r - l) / 2;\n        add(p << 1, l, m, ql, qr, v);\n        add(p << 1 | 1, m + 1, r, ql, qr, v);\n        t[p] = t[p << 1] + t[p << 1 | 1];\n    }\n\n    long query(int p, int l, int r, int ql, int qr) {\n        if (qr < l || r < ql) return 0;\n        if (ql <= l && r <= qr) return t[p];\n        push(p, l, r);\n        int m = l + (r - l) / 2;\n        return query(p << 1, l, m, ql, qr)\n             + query(p << 1 | 1, m + 1, r, ql, qr);\n    }\n\n    public static void main(String[] args) {\n        int[] a = {3, 1, 4, 1, 5, 9, 2, 6};\n        LazySegTree st = new LazySegTree(a);\n        st.add(1, 0, st.n - 1, 1, 5, 2);\n        System.out.println(st.query(1, 0, st.n - 1, 2, 6));\n        System.out.println(st.query(1, 0, st.n - 1, 0, 7));\n    }\n    // Input : [3,1,4,1,5,9,2,6], add [1,5] += 2\n    // Output: 29\n    //         41\n}",
      "intro": "Range add, range sum. apply / push / the three-way branch. Matches the dry run.",
      "highlight": "22-26,29-36,39-48,51-60",
      "panel": "Optimal"
    },
    {
      "tab": "Lazy min",
      "file": "LazySegTreeMin.java",
      "code": "public class LazySegTreeMin {\n\n    final int n;\n    final long[] t, lazy;\n\n    LazySegTreeMin(int[] a) {\n        n = a.length;\n        t = new long[n * 4];\n        lazy = new long[n * 4];\n        build(1, 0, n - 1, a);\n    }\n\n    void build(int p, int l, int r, int[] a) {\n        if (l == r) { t[p] = a[l]; return; }\n        int m = l + (r - l) / 2;\n        build(p << 1, l, m, a);\n        build(p << 1 | 1, m + 1, r, a);\n        t[p] = Math.min(t[p << 1], t[p << 1 | 1]);\n    }\n\n    void apply(int p, int l, int r, long v) {\n        t[p] += v;\n        lazy[p] += v;\n    }\n\n    void push(int p, int l, int r) {\n        if (lazy[p] == 0 || l == r) return;\n        int m = l + (r - l) / 2;\n        apply(p << 1, l, m, lazy[p]);\n        apply(p << 1 | 1, m + 1, r, lazy[p]);\n        lazy[p] = 0;\n    }\n\n    void add(int p, int l, int r, int ql, int qr, long v) {\n        if (qr < l || r < ql) return;\n        if (ql <= l && r <= qr) { apply(p, l, r, v); return; }\n        push(p, l, r);\n        int m = l + (r - l) / 2;\n        add(p << 1, l, m, ql, qr, v);\n        add(p << 1 | 1, m + 1, r, ql, qr, v);\n        t[p] = Math.min(t[p << 1], t[p << 1 | 1]);\n    }\n\n    long query(int p, int l, int r, int ql, int qr) {\n        if (qr < l || r < ql) return Long.MAX_VALUE;\n        if (ql <= l && r <= qr) return t[p];\n        push(p, l, r);\n        int m = l + (r - l) / 2;\n        return Math.min(query(p << 1, l, m, ql, qr),\n                        query(p << 1 | 1, m + 1, r, ql, qr));\n    }\n\n    public static void main(String[] args) {\n        int[] a = {3, 1, 4, 1, 5, 9, 2, 6};\n        LazySegTreeMin st = new LazySegTreeMin(a);\n        st.add(1, 0, st.n - 1, 1, 5, 2);\n        System.out.println(st.query(1, 0, st.n - 1, 2, 6));\n        System.out.println(st.query(1, 0, st.n - 1, 0, 7));\n    }\n    // Input : [3,1,4,1,5,9,2,6], add [1,5] += 2\n    // Output: 2\n    //         2\n}",
      "intro": "Range add, range min. apply adds v without a length factor. Identity is <code>Long.MAX_VALUE</code>. CF 52C is this on a cycle.",
      "highlight": "22-25,39-48",
      "panel": "Template"
    }
  ],
  "complexity": {
    "time": "O(n) build, O(log n) per range update or query",
    "space": "O(n)",
    "derivation": [
      "<p>A range update applies to O(log n) canonical nodes and pushes O(log n) tags on the way down. Each apply / push is O(1):</p>",
      "<span class=\"eq\">T<sub>update</sub> = T<sub>query</sub> = O(log n)</span>",
      "<p>Without lazy, a range update of length k is O(k log n). At k = n that is O(n log n) per operation, which at q = 10&#8309; is 2&times;10&#8311; and timeouts. Lazy is the difference between those two recurrences.</p>",
      "<p>Two Fenwick trees match the sum special case with a smaller constant. Lazy wins the moment the combine is min, or you also have range assign, or the node is a struct.</p>"
    ],
    "compare": [
      [
        "Loop the range",
        "<code>O(n)</code> / update",
        "<code>O(1)</code>",
        "n is tiny"
      ],
      [
        "Two Fenwicks",
        "<code>O(log n)</code>",
        "<code>O(n)</code>",
        "Range add + range sum only"
      ],
      [
        "Lazy segment tree",
        "<code>O(log n)</code>",
        "<code>O(n)</code>",
        "Range add/assign + any combine"
      ],
      [
        "Plain segment tree",
        "<code>O(k log n)</code> range update",
        "<code>O(n)</code>",
        "k-length updates, no tags"
      ]
    ]
  },
  "pitfalls": [
    {
      "title": "Forgetting to push before splitting",
      "bug": "Partial-overlap update or query recurses into children that have not received the parent's tag. Combining those stale children then overwrites t[p] with a wrong value, and the tag is still sitting on p so a later push double-applies.",
      "fix": "The first line of the partial-overlap branch, in both update and query, is <code>push(p, l, r);</code> A query that hits a node you tagged on the previous update is the test."
    },
    {
      "title": "apply uses the wrong length factor",
      "bug": "Range-sum apply does <code>t[p] += v</code> without multiplying by <code>(r-l+1)</code>, so a tag on a length-4 node undercounts by 4. Range-min apply that <em>does</em> multiply is equally wrong.",
      "fix": "Sum: times length. Min/max: not times length. XOR: <code>t[p] ^= (length is odd ? v : 0)</code> for a range XOR of a sum, or just <code>t[p] ^= v</code> for a range XOR of an XOR-tree."
    },
    {
      "title": "Pushing a leaf",
      "bug": "apply on a leaf is fine; push on a leaf tries to write children that do not exist (or exist as garbage indices). AIOOB or silent corruption.",
      "fix": "<code>if (lazy[p] == 0 || l == r) return;</code> at the top of push, so a leaf never indexes children that do not exist. A range update of a single cell is the leaf-push test."
    },
    {
      "title": "Recomputing t[p] without pushing",
      "bug": "After a partial update you write <code>t[p] = t[left] + t[right]</code> using children that still lack the new tag you just applied further down, <em>and</em> p still has an old tag. Two sources of staleness.",
      "fix": "Push first, recurse, then recompute. After this, lazy[p] is 0 and t[p] matches the children."
    },
    {
      "title": "Assign tags composed like add tags",
      "bug": "Range assign v2 after pending assign v1 should drop v1, not add. Mixing add and assign without an override rule double-counts.",
      "fix": "Assign overwrites. If both exist, store a pair (add, assign) with assign taking priority, and push in that order."
    }
  ],
  "variants": [
    [
      "Range assign (set all to v)",
      "lazy holds the assigned value plus a \"has assign\" flag. apply sets t[p] = v * length. A new assign overwrites the tag without adding.",
      "t[p] = v * (r - l + 1); lazy[p] = v; tagged[p] = true;",
      "CF 356A, range colouring"
    ],
    [
      "Range XOR",
      "For a sum-tree, XOR of v on a segment flips a bit of each element: the sum changes by a closed form per bit. For an XOR-tree, t[p] ^= v if the length is odd. CF 242E keeps 20 bit-count trees.",
      "t[p] ^= v * (length & 1); lazy[p] ^= v;",
      "CF 242E"
    ],
    [
      "Beats (chmin / chmax on a range)",
      "A node stores min, second-min, count-of-min. A chmin tag can be applied in O(1) when it does not cross the second-min; otherwise you must split. Amortised O(log n).",
      "if (tmin >= v) return; if (secondMin > v) apply; else recurse;",
      "Segment-tree beats, P2"
    ]
  ],
  "followups": [
    [
      "Why is a push on a full-cover query unnecessary?",
      "<p>t[p] already includes the tag, by the apply invariant. Returning t[p] is correct for the parent. You only push when you need a child's value, i.e. when you split. Pushing on every full cover would still be correct but would turn a lazy structure back into an eager one and could TLE.</p>"
    ],
    [
      "How do two Fenwicks replace this for sums?",
      "<p>Range add [l, r] += v is four point updates on B1 and B2, and range sum is two prefix evaluations of i*B1 - B2. Constants are much smaller. The moment you need range min, or range assign, or a struct node, the Fenwick identity disappears and this page is the tool.</p>"
    ],
    [
      "What breaks if the update is not uniformly applicable to a node?",
      "<p>If \"add v to every element\" cannot be summarised in O(1) given only t[p] and the length, lazy does not work. Example: \"divide each element by v, integer division\" &mdash; the new sum is not a function of the old sum. Then you need segment-tree beats, a different structure, or to fall back to touching leaves.</p>"
    ],
    [
      "How does CF 52C handle the circular case?",
      "<p>A range that wraps (l &gt; r) is two linear updates [l, n] and [1, r]. Each is an ordinary lazy range add. Queries wrap the same way, combining two range mins. The tree itself stays linear; the circle is a client-side split of one circular request into two ordinary ones, which is why you do not need a special circular node type.</p>"
    ]
  ],
  "problems": [
    {
      "name": "Range Addition",
      "url": "https://leetcode.com/problems/range-addition/",
      "badge": "lc",
      "tag": "LC 370",
      "level": "Medium",
      "pattern": "Difference array; lazy is overkill here"
    },
    {
      "name": "Falling Squares",
      "url": "https://leetcode.com/problems/falling-squares/",
      "badge": "lc",
      "tag": "LC 699",
      "level": "Hard",
      "pattern": "Range max assign after coord compress"
    },
    {
      "name": "My Calendar II / III",
      "url": "https://leetcode.com/problems/my-calendar-iii/",
      "badge": "lc",
      "tag": "LC 732",
      "level": "Hard",
      "pattern": "Range add 1, query max occupancy"
    },
    {
      "name": "Range Module",
      "url": "https://leetcode.com/problems/range-module/",
      "badge": "lc",
      "tag": "LC 715",
      "level": "Hard",
      "pattern": "Range assign coverage bits, dynamic"
    },
    {
      "name": "Circular RMQ",
      "url": "https://codeforces.com/problemset/problem/52/C",
      "badge": "cf",
      "tag": "CF 52C",
      "level": "Hard",
      "pattern": "Range add, range min, wraparound"
    },
    {
      "name": "XOR on Segment",
      "url": "https://codeforces.com/problemset/problem/242/E",
      "badge": "cf",
      "tag": "CF 242E",
      "level": "Hard",
      "pattern": "20 lazy bit-count trees, range XOR"
    },
    {
      "name": "The Child and Sequence",
      "url": "https://codeforces.com/problemset/problem/438/D",
      "badge": "cf",
      "tag": "CF 438D",
      "level": "Hard",
      "pattern": "Range mod, drop out when t[p] < mod"
    },
    {
      "name": "Range Updates and Sums",
      "url": "https://codeforces.com/problemset/problem/52/C",
      "badge": "cf",
      "tag": "CSES",
      "level": "Hard",
      "pattern": "Add and assign tags together"
    },
    {
      "name": "Polynomial Queries",
      "url": "https://leetcode.com/problems/my-calendar-iii/",
      "badge": "cf",
      "tag": "CSES",
      "level": "Hard",
      "pattern": "Arithmetic-progression range add"
    },
    {
      "name": "Please, another Queries on Array?",
      "url": "https://codeforces.com/problemset/problem/1114/F",
      "badge": "cf",
      "tag": "CF 1114F",
      "level": "Hard",
      "pattern": "Lazy product + totient, bitset of primes"
    }
  ],
  "recap": [
    "<strong>apply</strong> updates t[p] in O(1) and records a tag.",
    "<strong>push</strong> sinks the tag to both children before you split.",
    "<strong>Full cover: apply and return.</strong> Do not recurse.",
    "<strong>Sum apply multiplies by length; min apply does not.</strong>",
    "<strong>Compose tags</strong> (add +=, assign overwrites)."
  ],
  "oneliner": "full: apply(p,v); return | partial: push; recurse; t[p]=op(L,R) | apply sum: t+=v*len, lazy+=v",
  "indexLabels": [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15"
  ],
  "arrayLabel": "t[1..15] after add [1,5] += 2",
  "vizTitle": "Range add [1, 5] += 2, then the query [2, 6] reads tagged nodes",
  "vizIntro": "Same 8-element tree. The update parks tags on the canonical cover of [1, 5]: leaf 1, node [2,3], node [4,5]. The array shows t[] after the apply (sums already include +2 * length).",
  "vizCaption": "Update touches three canonical nodes, not five leaves. Query [2, 6] then reads node 5 (already tagged), node 6 (tagged), and leaf 14 (untouched, value 2).",
  "merTitle": "Tags sit on the canonical cover of [1, 5]",
  "merCaption": "Nodes 9, 5, and 6 hold the +2 tag. Their descendants are stale until a later query or update pushes.",
  "coreHeading": "Core idea and the invariant",
  "spoilers": [
    {
      "summary": "Hint for CF 52C &mdash; wrap the circle outside the tree",
      "body": "<p>Store a linear lazy min-tree on a[0..n). If a query or update has l &le; r, it is one call. If l &gt; r, it is the pair [l, n-1] and [0, r]. Combine two mins with ordinary Math.min. Fast IO and 64-bit adds (values plus many updates can exceed 32 bits). The circularity is not a node type; it is two segments.</p>"
    },
    {
      "summary": "Hint for CF 242E &mdash; one tree per bit",
      "body": "<p>XOR of x on a range flips, independently, each bit of x. For bit b, the new count of 1s in a node is length minus old count. Keep 20 trees of 1-counts, or one node storing 20 counts. Range sum is the sum over bits of count[b] * 2^b. Lazy tag is the XOR still to apply. Push flips the children's counts for bits set in the tag.</p>"
    }
  ],
  "dryIntro": "Range add [1, 5] += 2 on the sample, then a sum query on [2, 6]. Watch the tags park on the canonical cover and the query read those tagged nodes without pushing them.",
  "dryAfter": "<p>The five updated leaves were never all visited. Leaves 10..13 stay stale until something splits nodes 5 or 6.</p>"
}),

pack({
  "id": "dsu",
  "difficulty": "Easy",
  "readTime": "22 min",
  "tagline": "Maintain a forest of rooted trees, one per component, so that union and find are almost O(1) after path compression and union by rank.",
  "tags": [
    "DSU",
    "union-find",
    "components",
    "P0"
  ],
  "prereqs": [
    [
      "Complexity Analysis",
      "../00-foundations/complexity-analysis.html"
    ],
    [
      "DFS & Connected Components",
      "../07-graphs-core/dfs-and-components.html"
    ]
  ],
  "why": [
    "Picture a room of computers that starts with no cables plugged in at all. Cables get added one at a time, and in between installations somebody keeps asking: can machine 3 currently reach machine 7? You can answer any single question with a depth-first search, following wires from 3 until you either arrive at 7 or run out of cable to follow. That is perfectly correct, but it costs a fresh walk over the whole network every time you are asked. With a hundred thousand cables and a hundred thousand questions you are looking at something like ten billion steps, and the judge will cut you off long before you finish.",
    "The structure on this page removes the repeated walking by never touching the wires again. Every group of machines that can already reach each other elects one member as its <em>representative</em>, and every other member of the group stores a pointer to somebody nearer that representative. Those pointers form a tree for each group, and the whole collection of trees is called a forest &mdash; hence the name <em>disjoint-set union</em>, usually shortened to union-find. The question \"can 3 reach 7?\" now becomes \"do 3 and 7 climb to the same representative?\", which you answer by following pointers upwards from each of them and comparing where you land.",
    "Left completely alone, that idea can still be slow. If every merge happens to hang a tall tree underneath a short one, the pointers can end up forming a single chain of length <code>n</code>, and climbing that chain is exactly as slow as the search you were trying to avoid. Two small habits prevent it. <em>Union by size</em> always hangs the smaller group underneath the larger one, so a group can only get taller when it merges with something at least as big as itself. <em>Path compression</em> re-points every node you touched on the way up to aim straight at the representative, so the next question about any of them finishes in one hop.",
    "In a real problem statement the signal is the phrase \"edges are added\" (never removed) sitting next to limits such as <code>n, q &le; 2&times;10&#8309;</code>. That combination rules out re-running a search per query, and it is exactly what union-find is for. The same twenty lines then cover a surprisingly wide spread of problems: rejecting the one cable that closes a loop, merging duplicate user accounts that share an email address, checking a batch of <code>a == b</code> and <code>a != b</code> claims for a contradiction, and Kruskal's minimum spanning tree, which is this structure plus a sort and nothing else."
  ],
  "insight": "Two elements belong to the same group exactly when they climb to the same representative, so <code>find</code> answers every question you will be asked and <code>union</code> only ever re-points one representative at another. Keep the trees short by hanging the smaller group underneath, flatten whatever you just walked over, and both operations end up costing about as much as a handful of array reads.",
  "yes": [
    "Edges arrive one by one; after each, ask whether two nodes are connected",
    "\"Redundant connection\", \"number of connected components after adding edges\"",
    "Equality / inequality constraints (union equals, reject conflicting unequals)",
    "Merging sets of names / emails / accounts",
    "Kruskal's MST: add the next lightest edge if it does not form a cycle"
  ],
  "no": [
    "The graph is given all at once and never changes &rarr; <a href=\"../07-graphs-core/dfs-and-components.html\">DFS / BFS components</a>",
    "Edges are deleted, or you need connectivity at many historical times without rollback &rarr; link-cut, or offline divide-and-conquer on a DSU with rollback",
    "Shortest paths, not just connectivity &rarr; Dijkstra / BFS",
    "Directed reachability &rarr; DSU is undirected; use SCC / topo"
  ],
  "table": [
    [
      "\"are u and v connected after adding this edge?\"",
      "Incremental connectivity",
      "DSU"
    ],
    [
      "\"this extra edge forms a cycle\"",
      "union returns false",
      "LC 684"
    ],
    [
      "\"merge emails of the same person\"",
      "Union on shared emails, then group",
      "LC 721"
    ],
    [
      "\"a == b, a != c equations\"",
      "Union equals; unequals must have different roots",
      "LC 990"
    ],
    [
      "\"Kruskal MST\"",
      "Sort edges, union if different roots",
      "Classic"
    ],
    [
      "\"components after adding edges in weight order\"",
      "Offline sort + DSU",
      "CF 1213G"
    ],
    [
      "<strong>Confused with:</strong> heap / priority queue",
      "Union-find is not an ordered set; it only answers same-component",
      "TreeMap / BIT for order statistics"
    ]
  ],
  "constraint": "<code>n, q &le; 2&times;10&#8309;</code> with edges only ever being added is the signature. Answering each of those queries with a fresh traversal would be roughly <code>4&times;10&#8309;&#8304;</code> steps, which no judge accepts, while union-find handles the entire batch in about <code>q</code> array operations. If the statement ever deletes an edge, this structure on its own is the wrong tool; and if you drop either of the two accelerations, a deliberately constructed chain pushes a single <code>find</code> back up to <code>O(n)</code>.",
  "core": [
    "You need two arrays. <code>parent[x]</code> holds the element that <code>x</code> currently points at, and it starts out as <code>x</code> itself, which is how you say \"every element begins alone in a group that it represents\". <code>size[x]</code> is only meaningful when <code>x</code> is a representative, where it counts how many elements that group contains, and it starts at 1. The operation <code>find(x)</code> is the climb: while <code>parent[x]</code> is not equal to <code>x</code>, move up to <code>parent[x]</code>. The element where the loop stops is the one pointing at itself, and that element is the representative of the group containing <code>x</code>.",
    "<code>union(a, b)</code> starts by calling <code>find</code> on both arguments, because you must never re-point an ordinary member &mdash; only a representative. If the two roots come back equal, <code>a</code> and <code>b</code> were already in one group, the edge you were handed is redundant, and you report that without changing anything. If the roots differ, compare their sizes and make sure <code>ra</code> is the larger of the two, swapping the two variables if it is not. Then write <code>parent[rb] = ra</code> and add <code>size[rb]</code> into <code>size[ra]</code>. One group has absorbed the other with a single pointer write.",
    "Path compression is the second habit and it costs one extra line. While climbing inside <code>find</code>, once you know the representative <code>r</code>, set the parent of every node you passed to <code>r</code> directly. The usual recursive spelling does this implicitly, because <code>parent[x] = find(parent[x])</code> assigns the final answer on the way back out of the recursion. The trees therefore get flatter every time you query them, which is why the cost is quoted as <code>&alpha;(n)</code>, the inverse Ackermann function. You never need that function's definition: it stays below 5 for any <code>n</code> a computer can hold, so treat each operation as constant and say so out loud.",
    "Walk five elements through the whole thing. Everything points at itself, so there are five groups. <code>union(0, 1)</code> finds roots 0 and 1, the sizes tie, so 1 is hung under 0 and <code>size[0]</code> becomes 2. <code>union(2, 3)</code> does the same on the other side. Now <code>union(1, 2)</code> climbs from 1 up to root 0 and from 2 up to root 2, sees sizes 2 and 2, and hangs root 2 underneath root 0, so <code>size[0]</code> is 4. Finally asking <code>find(3)</code> climbs 3 to 2 to 0 and, thanks to compression, leaves both 3 and 2 pointing straight at 0."
  ],
  "invariant": "<p>Two elements are in the same component exactly when the climb from each one ends at the same place:</p><span class=\"eq\">connected(x, y) &hArr; find(x) = find(y)</span><p>In plain words, the pointer you store is never a claim about the original graph &mdash; it is not \"my neighbour\", it is only \"one step towards whoever currently speaks for my group\". That is precisely why re-pointing a representative during <code>union</code>, or shortening a path during <code>find</code>, cannot change any answer: both of them shuffle pointers around inside a single group without ever moving an element from one group into another.</p><p>Interview sentence: <em>\"I hang roots, not arbitrary nodes, and I flatten paths on the way up.\"</em></p>",
  "extra": [
    {
      "kind": "warn",
      "title": "Union the roots, not the original nodes",
      "html": "<p><code>parent[a] = b</code> without find breaks the tree if a or b is not a root: you can detach a whole subtree from its component. Always <code>a = find(a); b = find(b); parent[a] = b</code>.</p>"
    },
    {
      "kind": "tip",
      "title": "Iterative find avoids deep recursion",
      "html": "<p>A pathological chain (union without rank, then find the bottom) is depth n before compression. Recursive find can overflow the Java stack once. Two-pass iterative find (walk to root, walk again to flatten) is stack-safe.</p>"
    }
  ],
  "array": [
    0,
    1,
    2,
    3,
    4
  ],
  "vars": [
    "op",
    "ra",
    "rb",
    "comps"
  ],
  "frames": [
    {
      "note": "Starting position: five separate groups of one element each, because every slot holds parent[i] = i and so represents itself.",
      "arr": [
        0,
        1,
        2,
        3,
        4
      ],
      "done": [
        0,
        1,
        2,
        3,
        4
      ],
      "values": {
        "op": "init",
        "ra": "—",
        "rb": "—",
        "comps": 5
      }
    },
    {
      "note": "union(0,1): both are roots of rank 0, so the tie is broken arbitrarily. Element 1 is hung under 0 and rank[0] rises to 1.",
      "arr": [
        0,
        0,
        2,
        3,
        4
      ],
      "active": [
        0,
        1
      ],
      "values": {
        "op": "union 0-1",
        "ra": 0,
        "rb": 1,
        "comps": 4
      }
    },
    {
      "note": "union(1,2): climbing from 1 lands on root 0, and 2 is already a root. Since rank[0] beats rank[2], the shorter tree at 2 is hung under 0.",
      "arr": [
        0,
        0,
        0,
        3,
        4
      ],
      "active": [
        0,
        2
      ],
      "done": [
        1
      ],
      "values": {
        "op": "union 1-2",
        "ra": 0,
        "rb": 2,
        "comps": 3
      }
    },
    {
      "note": "union(3,4): a separate merge on the far side of the array hangs 4 under 3 and lifts rank[3] to 1, leaving two groups in total.",
      "arr": [
        0,
        0,
        0,
        3,
        3
      ],
      "active": [
        3,
        4
      ],
      "done": [
        0,
        1,
        2
      ],
      "values": {
        "op": "union 3-4",
        "ra": 3,
        "rb": 4,
        "comps": 2
      }
    },
    {
      "note": "union(2,3): the roots are 0 and 3 with equal rank 1, so one is picked and 3 is hung under 0; only a genuine tie increments the rank, so rank[0] becomes 2.",
      "arr": [
        0,
        0,
        0,
        0,
        3
      ],
      "active": [
        0,
        3
      ],
      "done": [
        1,
        2
      ],
      "values": {
        "op": "union 2-3",
        "ra": 0,
        "rb": 3,
        "comps": 1
      }
    },
    {
      "note": "find(4) climbs from 4 to 3 and then to the root 0. Path compression now rewrites parent[4] = 0, so asking about element 4 again costs a single hop.",
      "arr": [
        0,
        0,
        0,
        0,
        0
      ],
      "best": [
        0,
        4
      ],
      "done": [
        1,
        2,
        3
      ],
      "values": {
        "op": "find 4",
        "ra": 0,
        "rb": "—",
        "comps": 1
      }
    },
    {
      "note": "connected(1, 4) reports true because both elements climb to representative 0. Everything now points directly at that root, which is compression paying off.",
      "arr": [
        0,
        0,
        0,
        0,
        0
      ],
      "best": [
        1,
        4
      ],
      "values": {
        "op": "same set",
        "ra": 0,
        "rb": 0,
        "comps": 1
      }
    }
  ],
  "mermaid": "graph TD\n  u0[\"0 rank 2\"] --> u1[\"1\"]\n  u0 --> u2[\"2\"]\n  u0 --> u3[\"3\"]\n  u3 --> u4[\"4\"]",
  "steps": [
    "<strong>Initialise the two arrays.</strong> Set <code>parent[i] = i</code> and <code>rank[i] = 0</code> (or <code>size[i] = 1</code>) for every element, which declares <code>n</code> separate groups of one member each, every member representing itself. Keep a counter <code>comps = n</code> if the problem asks how many groups survive.",
    "<strong>find(x): climb to the representative.</strong> Follow <code>parent</code> upwards until you reach the element that points at itself. Every membership question in the problem reduces to this one walk, so this is the operation worth making fast.",
    "<strong>Compress the path while you climb.</strong> Once the representative <code>r</code> is known, re-point every node you visited so it aims directly at <code>r</code>; the recursive line <code>parent[x] = find(parent[x])</code> does it for free on the way back out. Future queries on those nodes now take one hop.",
    "<strong>union(a, b): resolve both ends first.</strong> Compute <code>a = find(a)</code> and <code>b = find(b)</code> before touching anything. If the two are equal then these elements already share a group, the edge closes a cycle, and you return <code>false</code> having changed nothing.",
    "<strong>Hang the smaller tree under the larger.</strong> If <code>rank[a] &lt; rank[b]</code> swap the two roots so <code>a</code> is the taller one, then write <code>parent[b] = a</code>, and increment <code>rank[a]</code> only when the two ranks were equal. Merging the small side into the big side is what keeps every tree short.",
    "<strong>Answer the queries from the roots.</strong> <code>connected(a, b)</code> is simply <code>find(a) == find(b)</code>, and the number of groups falls by exactly one on every union that returned <code>true</code>, so decrement <code>comps</code> at that point and nowhere else.",
    "<strong>Never write parent[a] = b without calling find.</strong> Hanging a non-representative under something else detaches whatever was below it, silently splitting a group in half. Every pointer write in this structure targets a root.",
    "<strong>Prefer an iterative find when n reaches 10&#8309;.</strong> If you ever skip union by rank, a chain of depth <code>n</code> can appear and a recursive climb overflows the Java stack; walking to the root and then walking the path a second time to flatten it is stack-safe."
  ],
  "code": [
    {
      "tab": "Brute DFS",
      "file": "BruteComponents.java",
      "code": "import java.util.ArrayList;\nimport java.util.List;\n\npublic class BruteComponents {\n\n    static boolean dfs(List<Integer>[] g, boolean[] seen, int u, int t) {\n        if (u == t) return true;\n        seen[u] = true;\n        for (int v : g[u]) if (!seen[v] && dfs(g, seen, v, t)) return true;\n        return false;\n    }\n\n    @SuppressWarnings(\"unchecked\")\n    public static void main(String[] args) {\n        int n = 5;\n        List<Integer>[] g = new ArrayList[n];\n        for (int i = 0; i < n; i++) g[i] = new ArrayList<>();\n        int[][] edges = {{0, 1}, {1, 2}, {3, 4}, {2, 3}};\n        for (int[] e : edges) {\n            g[e[0]].add(e[1]);\n            g[e[1]].add(e[0]);\n        }\n        System.out.println(dfs(g, new boolean[n], 1, 4));\n        System.out.println(dfs(g, new boolean[n], 0, 3));\n    }\n    // Input : n=5 edges 0-1, 1-2, 3-4, 2-3\n    // Output: true\n    //         true\n}",
      "intro": "Rebuild the graph and DFS after every edge. Correct, O(n) per query.",
      "highlight": "16-24",
      "panel": "Brute"
    },
    {
      "tab": "DSU",
      "file": "DisjointSet.java",
      "code": "public class DisjointSet {\n\n    final int[] parent, rank;\n    int comps;\n\n    DisjointSet(int n) {\n        parent = new int[n];\n        rank = new int[n];\n        comps = n;\n        for (int i = 0; i < n; i++) parent[i] = i;\n    }\n\n    int find(int x) {\n        if (parent[x] != x) parent[x] = find(parent[x]);\n        return parent[x];\n    }\n\n    boolean union(int a, int b) {\n        a = find(a);\n        b = find(b);\n        if (a == b) return false;\n        if (rank[a] < rank[b]) { int t = a; a = b; b = t; }\n        parent[b] = a;\n        if (rank[a] == rank[b]) rank[a]++;\n        comps--;\n        return true;\n    }\n\n    public static void main(String[] args) {\n        DisjointSet d = new DisjointSet(5);\n        System.out.println(d.union(0, 1));\n        System.out.println(d.union(1, 2));\n        System.out.println(d.union(3, 4));\n        System.out.println(d.union(2, 3));\n        System.out.println(d.union(1, 4));\n        System.out.println(d.comps);\n        System.out.println(d.find(4) == d.find(1));\n    }\n    // Input : n=5, unions 0-1, 1-2, 3-4, 2-3, then 1-4\n    // Output: true\n    //         true\n    //         true\n    //         true\n    //         false\n    //         1\n    //         true\n}",
      "intro": "Path compression plus union by rank. The dry-run unions, then a redundant edge.",
      "highlight": "14-17,20-31",
      "panel": "Optimal"
    },
    {
      "tab": "By size + Kruskal",
      "file": "DsuKruskal.java",
      "code": "import java.util.Arrays;\n\npublic class DsuKruskal {\n\n    static class Dsu {\n        int[] p, sz;\n        Dsu(int n) {\n            p = new int[n];\n            sz = new int[n];\n            for (int i = 0; i < n; i++) { p[i] = i; sz[i] = 1; }\n        }\n        int find(int x) { return p[x] == x ? x : (p[x] = find(p[x])); }\n        boolean union(int a, int b) {\n            a = find(a);\n            b = find(b);\n            if (a == b) return false;\n            if (sz[a] < sz[b]) { int t = a; a = b; b = t; }\n            p[b] = a;\n            sz[a] += sz[b];\n            return true;\n        }\n    }\n\n    public static void main(String[] args) {\n        int n = 4;\n        int[][] edges = {{0, 1, 1}, {1, 2, 2}, {0, 2, 4}, {2, 3, 3}};\n        Arrays.sort(edges, (x, y) -> Integer.compare(x[2], y[2]));\n        Dsu d = new Dsu(n);\n        int weight = 0, used = 0;\n        for (int[] e : edges) {\n            if (d.union(e[0], e[1])) {\n                weight += e[2];\n                used++;\n            }\n        }\n        System.out.println(weight);\n        System.out.println(used);\n    }\n    // Input : 4 nodes, edges (0,1,1), (1,2,2), (0,2,4), (2,3,3)\n    // Output: 6\n    //         3\n}",
      "intro": "Union by size (also stores component sizes) and a tiny Kruskal on a 4-edge graph. MST weight is the sum of edges that union returned true on.",
      "highlight": "14-24,36-42",
      "panel": "Template"
    }
  ],
  "complexity": {
    "time": "Almost O(1) per find/union (inverse Ackermann)",
    "space": "O(n)",
    "derivation": [
      "<p>Take the two accelerations one at a time. Union by rank guarantees that a tree only gets taller when it merges with another tree of the same height, which means a tree of height <code>h</code> must contain at least <code>2&#8319;</code> elements, and therefore <code>h &le; log&#8322; n</code>. That alone caps one <code>find</code> at roughly 20 pointer steps when <code>n = 10&#8310;</code>. Path compression on its own, without any ranking, is also enough for an amortised <code>O(log n)</code>.</p>",
      "<p>Used together the amortised cost per operation drops to <code>&alpha;(n)</code>, the inverse Ackermann function, which is at most 4 for every <code>n</code> that could physically be stored:</p>",
      "<span class=\"eq\">T(q) = &Theta;(q &middot; &alpha;(n)) &approx; &Theta;(q)</span>",
      "<p>Putting real numbers in: <code>q = 2&times;10&#8309;</code> operations land near <code>10&#8310;</code> array reads, which is a few milliseconds. Skip both accelerations and a chain makes each <code>find</code> cost <code>&Theta;(n)</code>, so the same input becomes <code>&Theta;(n q)</code>, about <code>4&times;10&#8309;&#8304;</code> steps. Inside Kruskal the sort at <code>O(m log m)</code> dominates and the <code>O(m &alpha;(n))</code> union-find work is effectively free.</p>"
    ],
    "compare": [
      [
        "DFS per query",
        "<code>O(n)</code> / query",
        "<code>O(n + m)</code>",
        "Graph is static"
      ],
      [
        "DSU, no rank / compress",
        "<code>O(n)</code> worst find",
        "<code>O(n)</code>",
        "Wrong; will TLE"
      ],
      [
        "DSU + rank + compress",
        "<code>O(&alpha;(n))</code>",
        "<code>O(n)</code>",
        "Incremental connectivity"
      ],
      [
        "DSU with rollback",
        "<code>O(log n)</code>",
        "<code>O(n)</code>",
        "No path compression; undo unions"
      ]
    ]
  },
  "pitfalls": [
    {
      "title": "Linking the original nodes instead of the roots",
      "bug": "<code>parent[a] = b</code> when a is already a child. The subtree of a is detached from its old root and the structure is no longer a forest of valid components.",
      "fix": "Always resolve both ends first with <code>a = find(a); b = find(b);</code> and only then write a parent. To test it, union a chain of three and check that the element in the middle still reaches the same root."
    },
    {
      "title": "Skipping union by rank and path compression",
      "bug": "A sequence of unions that always hangs the old root under a new singleton builds a linked list. The next find is O(n) and q of them TLE.",
      "fix": "Keep both accelerations every single time: rank or size to decide which root gets hung, plus compression inside <code>find</code>. To test it, union <code>i</code> with <code>i+1</code> for a hundred thousand values in ascending order and time a find on the last element."
    },
    {
      "title": "Path compression on a DSU you need to roll back",
      "bug": "Compression rewrites parent[] along the whole path, so you cannot undo a union by popping one parent assignment. Offline \"delete edge\" tricks break.",
      "fix": "Rollback DSU: union by rank only (no compression), push (node, oldParent) on a stack, pop to undo. Finds are O(log n)."
    },
    {
      "title": "1-based nodes in a 0-based array",
      "bug": "n nodes labelled 1..n stored in parent[0..n-1], or parent[n] missing, so node n throws. Mixing both conventions in find vs union.",
      "fix": "Allocate n+1 and ignore index 0, or remap labels to 0..n-1 at the input boundary."
    },
    {
      "title": "Using DSU on a directed graph",
      "bug": "\"Can I reach t from s\" is not \"are they in the same undirected component\". Union-find will happily merge both directions of an edge you only had one way.",
      "fix": "Remember that this structure only ever models undirected connectivity. Directed reachability needs a DFS, strongly connected components or 2-SAT instead, so re-read the statement for the word \"directed\" before reaching for union-find."
    }
  ],
  "variants": [
    [
      "Union by size",
      "Hang the smaller component under the larger; size[root] is maintained. Same complexity as rank, and you get component sizes for free (LC 947, CF 1213G).",
      "if (sz[a] < sz[b]) swap; parent[b]=a; sz[a]+=sz[b];",
      "When the answer needs |component|"
    ],
    [
      "Bipartite DSU / parity",
      "Store relation-to-parent (XOR of a bit). find returns (root, parity). Union of an odd edge is a constraint; a conflict is an odd cycle. LC 886 / bipartite incremental.",
      "parity[x] ^= parity[parent[x]] on the compress walk",
      "Odd-cycle detection online"
    ],
    [
      "Rollback DSU",
      "No path compression. Stack of (node, oldParent, oldRank). Used for offline edge deletes via divide-and-conquer on time, or for persistent connectivity.",
      "st.push(b); parent[b]=a;  undo: parent[st.pop()] = st.pop();",
      "CF 1213G alternative, DSU on tree"
    ]
  ],
  "followups": [
    [
      "Why is the bound inverse Ackermann, not just O(1)?",
      "<p>Path compression without rank is already almost linear; rank without compression is O(log n). The combination is one of the most analysed bounds in algorithms, and it is not quite O(1). In every contest and interview you may treat it as O(1). Do not write <code>&alpha;(n)</code> on a whiteboard unless asked; say \"effectively constant\".</p>"
    ],
    [
      "How do you handle weighted edges / MST?",
      "<p>Kruskal: sort edges by weight, then union each if the endpoints have different roots. The unions that return true are the MST edges; their weights sum to the MST cost. If you need the MST as a graph, store those edges. Prim is the heap-based alternative and does not use DSU.</p>"
    ],
    [
      "Can DSU do deletions?",
      "<p>Not online with path compression. Offline: time-split the interval an edge is alive and add it in a segment tree of edges, then DFS the segment tree with a rollback DSU (DSU on tree). Online deletions need link-cut trees or Euler-tour trees. Interviews almost never go there; they ask incremental unions.</p>"
    ],
    [
      "How does LC 128 (longest consecutive sequence) use DSU?",
      "<p>It does not have to: a HashSet plus a scan of runs is the intended O(n) solution. A DSU version unions each value with value+1 when both exist, then the answer is the maximum component size. Same complexity, more code, a useful way to see \"consecutive\" as \"an edge of weight 1\".</p>"
    ]
  ],
  "problems": [
    {
      "name": "Number of Provinces",
      "url": "https://leetcode.com/problems/number-of-provinces/",
      "badge": "lc",
      "tag": "LC 547",
      "level": "Medium",
      "pattern": "Union every connected pair, count roots"
    },
    {
      "name": "Redundant Connection",
      "url": "https://leetcode.com/problems/redundant-connection/",
      "badge": "lc",
      "tag": "LC 684",
      "level": "Medium",
      "pattern": "The edge whose union returns false"
    },
    {
      "name": "Accounts Merge",
      "url": "https://leetcode.com/problems/accounts-merge/",
      "badge": "lc",
      "tag": "LC 721",
      "level": "Medium",
      "pattern": "Union accounts that share an email"
    },
    {
      "name": "Satisfiability of Equality Equations",
      "url": "https://leetcode.com/problems/satisfiability-of-equality-equations/",
      "badge": "lc",
      "tag": "LC 990",
      "level": "Medium",
      "pattern": "Union equals first, then check unequals"
    },
    {
      "name": "Longest Consecutive Sequence",
      "url": "https://leetcode.com/problems/longest-consecutive-sequence/",
      "badge": "lc",
      "tag": "LC 128",
      "level": "Medium",
      "pattern": "HashSet runs, or DSU on value+1"
    },
    {
      "name": "Number of Operations to Make Network Connected",
      "url": "https://leetcode.com/problems/number-of-operations-to-make-network-connected/",
      "badge": "lc",
      "tag": "LC 1319",
      "level": "Medium",
      "pattern": "Spare edges vs components-1"
    },
    {
      "name": "Most Stones Removed with Same Row or Column",
      "url": "https://leetcode.com/problems/most-stones-removed-with-same-row-or-column/",
      "badge": "lc",
      "tag": "LC 947",
      "level": "Medium",
      "pattern": "Union stones by row and by column"
    },
    {
      "name": "Graph Valid Tree",
      "url": "https://leetcode.com/problems/graph-valid-tree/",
      "badge": "lc",
      "tag": "LC 261",
      "level": "Medium",
      "pattern": "n-1 edges and one component, no cycle"
    },
    {
      "name": "Roads not only in Berland",
      "url": "https://codeforces.com/problemset/problem/25/D",
      "badge": "cf",
      "tag": "CF 25D",
      "level": "Medium",
      "pattern": "Redundant roads vs needed roads"
    },
    {
      "name": "Path Queries",
      "url": "https://codeforces.com/problemset/problem/1213/G",
      "badge": "cf",
      "tag": "CF 1213G",
      "level": "Medium",
      "pattern": "Offline sort edges, add by weight, size products"
    }
  ],
  "recap": [
    "<strong>find returns the root;</strong> path compression flattens the walk.",
    "<strong>union hangs one root under the other</strong> by rank or size.",
    "<strong>union returning false</strong> means the edge was redundant (a cycle).",
    "<strong>Effectively O(1)</strong> per op with both accelerations.",
    "<strong>Undirected and incremental.</strong> Deletions need rollback; directed needs a different tool."
  ],
  "oneliner": "find: p[x]==x?x:p[x]=find(p[x]) | union roots by rank | false if already same",
  "indexLabels": [
    "0",
    "1",
    "2",
    "3",
    "4"
  ],
  "arrayLabel": "parent[0..4]",
  "vizTitle": "parent[] through four unions",
  "vizIntro": "Five elements. Unions (0,1), (1,2), (3,4), (2,3). Watch the parent array; find compresses on the last query.",
  "vizCaption": "After the four unions everything shares root 0. find(4) then compresses parent[4] from 3 to 0 in one hop.",
  "merTitle": "The forest just after union(2, 3), before compressing 4",
  "merCaption": "One tree rooted at 0. Node 4 still points at 3 until the next find. Path compression will flatten it.",
  "coreHeading": "Core idea and the invariant",
  "spoilers": [
    {
      "summary": "Hint for LC 990 &mdash; two passes",
      "body": "<p>First union every <code>a == b</code> equation. Then, for every <code>a != b</code>, if find(a) == find(b) the system is unsatisfiable. Doing unequals first, or interleaving, can reject a legal system because the equal- classes are not yet merged. Letters are 26 nodes; the DSU is tiny.</p>"
    },
    {
      "summary": "Hint for LC 721 &mdash; union on the email, not the name",
      "body": "<p>Names are not unique. Build a map email &rarr; first account index that used it. For each later account that repeats an email, union the two account indices. Then group emails by find(account). Sort each group, prefix the name from any account in the component. The DSU lives on accounts, not on email strings.</p>"
    }
  ],
  "dryIntro": "Four unions arriving over five elements, in the order a solution would receive them. The columns <code>ra</code> and <code>rb</code> are the representatives that <code>find</code> returned at that moment, which is why they are often not the two numbers that were passed in.",
  "dryAfter": "<p>union(2, 3) was the only call that could have returned false later; a fifth union of any pair now returns false (redundant edge).</p>"
})

];

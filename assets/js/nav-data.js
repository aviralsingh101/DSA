/* ==========================================================================
   nav-data.js — SINGLE SOURCE OF TRUTH for every module and topic.
   Flatten order == reading order == prev/next order.
   Loaded as a classic script; exposes window.NAV_DATA only.
   ========================================================================== */

window.NAV_DATA = [
  {
    id: "m00", num: "00",
    title: "Foundations",
    dir: "modules/00-foundations",
    desc: "Complexity, recurrences, the constraint-to-complexity table, Java for DSA, and a repeatable attack plan.",
    topics: [
      { id: "complexity-analysis",           title: "Complexity Analysis",              file: "complexity-analysis.html",           tier: "P0" },
      { id: "recurrences-and-master-theorem",title: "Recurrences & Master Theorem",     file: "recurrences-and-master-theorem.html",tier: "P0" },
      { id: "constraints-to-complexity",     title: "Constraints \u2192 Complexity",    file: "constraints-to-complexity.html",     tier: "P0" },
      { id: "java-for-dsa",                  title: "Java for DSA & CP",                file: "java-for-dsa.html",                  tier: "P0" },
      { id: "problem-solving-framework",     title: "Problem-Solving Framework",        file: "problem-solving-framework.html",     tier: "P0" }
    ]
  },
  {
    id: "m01", num: "01",
    title: "Arrays, Prefix Sums & Windows",
    dir: "modules/01-arrays-and-windows",
    desc: "The bread and butter of interview arrays: prefix sums, Kadane, two pointers, windows and binary search.",
    topics: [
      { id: "prefix-sums",             title: "Prefix Sums & Difference Arrays", file: "prefix-sums.html",             tier: "P0" },
      { id: "kadane",                  title: "Kadane's Algorithm",              file: "kadane.html",                  tier: "P0" },
      { id: "two-pointers",            title: "Two Pointers",                    file: "two-pointers.html",            tier: "P0" },
      { id: "sliding-window",          title: "Sliding Window",                  file: "sliding-window.html",          tier: "P0" },
      { id: "binary-search-basics",    title: "Binary Search Basics",            file: "binary-search-basics.html",    tier: "P0" },
      { id: "binary-search-on-answer", title: "Binary Search on the Answer",     file: "binary-search-on-answer.html", tier: "P0" },
      { id: "kth-and-selection",       title: "K-th Element & Selection",        file: "kth-and-selection.html",       tier: "P1" }
    ]
  },
  {
    id: "m02", num: "02",
    title: "Sorting, Hashing, Bits & Matrix",
    dir: "modules/02-sorting-hashing-bits",
    desc: "Comparators, non-comparison sorts, intervals, hashing patterns, matrix moves and bit manipulation.",
    topics: [
      { id: "sorting-and-comparators",      title: "Sorting & Comparators",          file: "sorting-and-comparators.html",      tier: "P0" },
      { id: "non-comparison-sorts",         title: "Non-Comparison Sorts",           file: "non-comparison-sorts.html",         tier: "P1" },
      { id: "intervals",                    title: "Intervals",                      file: "intervals.html",                    tier: "P0" },
      { id: "cyclic-sort-and-index-tricks", title: "Cyclic Sort & Index Tricks",     file: "cyclic-sort-and-index-tricks.html", tier: "P1" },
      { id: "hashing-patterns",             title: "Hashing Patterns",               file: "hashing-patterns.html",             tier: "P0" },
      { id: "matrix-patterns",              title: "Matrix Patterns",                file: "matrix-patterns.html",              tier: "P0" },
      { id: "bit-manipulation",             title: "Bit Manipulation",               file: "bit-manipulation.html",             tier: "P0" }
    ]
  },
  {
    id: "m03", num: "03",
    title: "Linear Data Structures",
    dir: "modules/03-linear-structures",
    desc: "Stacks, monotonic structures, linked lists, heaps, Java's balanced-BST toolkit and design-coding rounds.",
    topics: [
      { id: "stacks-and-monotonic-stack", title: "Stacks & Monotonic Stack",   file: "stacks-and-monotonic-stack.html", tier: "P0" },
      { id: "queues-and-monotonic-deque", title: "Queues & Monotonic Deque",   file: "queues-and-monotonic-deque.html", tier: "P0" },
      { id: "linked-lists",               title: "Linked Lists",               file: "linked-lists.html",               tier: "P0" },
      { id: "heaps-and-priority-queue",   title: "Heaps & Priority Queue",     file: "heaps-and-priority-queue.html",   tier: "P0" },
      { id: "treemap-treeset-patterns",   title: "TreeMap / TreeSet Patterns", file: "treemap-treeset-patterns.html",   tier: "P1" },
      { id: "design-data-structures",     title: "Design Data Structures",     file: "design-data-structures.html",     tier: "P0" }
    ]
  },
  {
    id: "m04", num: "04",
    title: "Recursion, Backtracking & D&C",
    dir: "modules/04-recursion-and-dnc",
    desc: "The call stack model, exhaustive generation with correct dedup rules, pruning, and divide and conquer.",
    topics: [
      { id: "recursion-fundamentals",              title: "Recursion Fundamentals",             file: "recursion-fundamentals.html",              tier: "P0" },
      { id: "subsets-permutations-combinations",   title: "Subsets, Permutations, Combinations",file: "subsets-permutations-combinations.html",   tier: "P0" },
      { id: "backtracking-with-pruning",           title: "Backtracking with Pruning",          file: "backtracking-with-pruning.html",           tier: "P1" },
      { id: "divide-and-conquer",                  title: "Divide & Conquer",                   file: "divide-and-conquer.html",                  tier: "P0" },
      { id: "meet-in-the-middle",                  title: "Meet in the Middle",                 file: "meet-in-the-middle.html",                  tier: "P2" }
    ]
  },
  {
    id: "m05", num: "05",
    title: "Trees",
    dir: "modules/05-trees",
    desc: "Traversals, BST invariants, tree DP and rerooting, LCA, Euler tours and tries.",
    topics: [
      { id: "binary-tree-basics-and-traversals", title: "Binary Tree Basics & Traversals", file: "binary-tree-basics-and-traversals.html", tier: "P0" },
      { id: "binary-tree-problem-patterns",      title: "Binary Tree Problem Patterns",    file: "binary-tree-problem-patterns.html",      tier: "P0" },
      { id: "bst",                               title: "Binary Search Trees",             file: "bst.html",                               tier: "P0" },
      { id: "tree-dp-and-rerooting",             title: "Tree DP & Rerooting",             file: "tree-dp-and-rerooting.html",             tier: "P1" },
      { id: "lca-binary-lifting",                title: "LCA & Binary Lifting",            file: "lca-binary-lifting.html",                tier: "P1" },
      { id: "euler-tour-subtree-queries",        title: "Euler Tour & Subtree Queries",    file: "euler-tour-subtree-queries.html",        tier: "P1" },
      { id: "trie",                              title: "Trie",                            file: "trie.html",                              tier: "P0" },
      { id: "xor-trie",                          title: "XOR Trie (Binary Trie)",          file: "xor-trie.html",                          tier: "P1" }
    ]
  },
  {
    id: "m06", num: "06",
    title: "Range Query Structures",
    dir: "modules/06-range-queries",
    desc: "Sparse tables, Fenwick trees, segment trees with and without lazy propagation, and DSU.",
    topics: [
      { id: "sparse-table-and-rmq", title: "Sparse Table & RMQ",            file: "sparse-table-and-rmq.html", tier: "P1" },
      { id: "fenwick-tree",         title: "Fenwick Tree (BIT)",            file: "fenwick-tree.html",         tier: "P1" },
      { id: "segment-tree",         title: "Segment Tree",                  file: "segment-tree.html",         tier: "P1" },
      { id: "segment-tree-lazy",    title: "Segment Tree with Lazy Prop.",  file: "segment-tree-lazy.html",    tier: "P2" },
      { id: "dsu",                  title: "Disjoint Set Union",            file: "dsu.html",                  tier: "P0" }
    ]
  },
  {
    id: "m07", num: "07",
    title: "Graphs: Core",
    dir: "modules/07-graphs-core",
    desc: "Representations, BFS/DFS, cycle and bipartite checks, topological order, Dijkstra and 0-1 BFS.",
    topics: [
      { id: "graph-representations",         title: "Graph Representations",           file: "graph-representations.html",         tier: "P0" },
      { id: "bfs",                           title: "Breadth-First Search",            file: "bfs.html",                           tier: "P0" },
      { id: "dfs-and-components",            title: "DFS & Connected Components",      file: "dfs-and-components.html",            tier: "P0" },
      { id: "cycle-detection-and-bipartite", title: "Cycle Detection & Bipartite",     file: "cycle-detection-and-bipartite.html", tier: "P0" },
      { id: "topological-sort-and-dag-dp",   title: "Topological Sort & DAG DP",       file: "topological-sort-and-dag-dp.html",    tier: "P0" },
      { id: "dijkstra",                      title: "Dijkstra's Algorithm",            file: "dijkstra.html",                      tier: "P0" },
      { id: "zero-one-bfs",                  title: "0-1 BFS",                         file: "zero-one-bfs.html",                  tier: "P1" }
    ]
  },
  {
    id: "m08", num: "08",
    title: "Graphs: Advanced",
    dir: "modules/08-graphs-advanced",
    desc: "Negative weights, all-pairs paths, MST, SCC, 2-SAT, bridges, Euler paths, flows and matching.",
    topics: [
      { id: "bellman-ford-and-negative-cycles", title: "Bellman-Ford & Negative Cycles", file: "bellman-ford-and-negative-cycles.html", tier: "P1" },
      { id: "floyd-warshall",                   title: "Floyd-Warshall",                 file: "floyd-warshall.html",                   tier: "P1" },
      { id: "mst-kruskal-prim",                 title: "MST: Kruskal & Prim",            file: "mst-kruskal-prim.html",                 tier: "P1" },
      { id: "scc-tarjan-kosaraju",              title: "SCC: Tarjan & Kosaraju",         file: "scc-tarjan-kosaraju.html",              tier: "P1" },
      { id: "two-sat",                          title: "2-SAT",                          file: "two-sat.html",                          tier: "P2" },
      { id: "bridges-and-articulation-points",  title: "Bridges & Articulation Points",  file: "bridges-and-articulation-points.html",  tier: "P1" },
      { id: "eulerian-path-and-circuit",        title: "Eulerian Path & Circuit",        file: "eulerian-path-and-circuit.html",        tier: "P2" },
      { id: "max-flow-min-cut",                 title: "Max Flow / Min Cut",             file: "max-flow-min-cut.html",                 tier: "P2" },
      { id: "bipartite-matching",               title: "Bipartite Matching",             file: "bipartite-matching.html",               tier: "P2" }
    ]
  },
  {
    id: "m09", num: "09",
    title: "Decompositions",
    dir: "modules/09-decompositions",
    desc: "Heavy-light, centroid decomposition and small-to-large merging on trees.",
    topics: [
      { id: "heavy-light-decomposition", title: "Heavy-Light Decomposition", file: "heavy-light-decomposition.html", tier: "P2" },
      { id: "centroid-decomposition",    title: "Centroid Decomposition",    file: "centroid-decomposition.html",    tier: "P2" },
      { id: "small-to-large-merging",    title: "Small-to-Large Merging",    file: "small-to-large-merging.html",    tier: "P2" }
    ]
  },
  {
    id: "m10", num: "10",
    title: "Dynamic Programming",
    dir: "modules/10-dynamic-programming",
    desc: "State design as a mechanical pipeline, then every classic family from knapsack to digit DP.",
    topics: [
      { id: "dp-foundations",                 title: "DP Foundations",                 file: "dp-foundations.html",                 tier: "P0" },
      { id: "dp-1d",                          title: "1-D DP",                         file: "dp-1d.html",                          tier: "P0" },
      { id: "knapsack-family",                title: "Knapsack Family",                file: "knapsack-family.html",                tier: "P0" },
      { id: "lis",                            title: "Longest Increasing Subsequence", file: "lis.html",                            tier: "P0" },
      { id: "grid-dp",                        title: "Grid DP",                        file: "grid-dp.html",                        tier: "P0" },
      { id: "string-dp",                      title: "String DP",                      file: "string-dp.html",                      tier: "P0" },
      { id: "interval-dp",                    title: "Interval DP",                    file: "interval-dp.html",                    tier: "P1" },
      { id: "bitmask-dp",                     title: "Bitmask DP",                     file: "bitmask-dp.html",                     tier: "P1" },
      { id: "game-theory-and-grundy",         title: "Game Theory & Grundy Numbers",   file: "game-theory-and-grundy.html",         tier: "P1" },
      { id: "sos-dp",                         title: "Sum Over Subsets DP",            file: "sos-dp.html",                         tier: "P2" },
      { id: "digit-dp",                       title: "Digit DP",                       file: "digit-dp.html",                       tier: "P2" },
      { id: "probability-and-expectation-dp", title: "Probability & Expectation DP",   file: "probability-and-expectation-dp.html", tier: "P2" },
      { id: "dp-optimizations",               title: "DP Optimisations",               file: "dp-optimizations.html",               tier: "P2" }
    ]
  },
  {
    id: "m11", num: "11",
    title: "Math & Number Theory",
    dir: "modules/11-math-and-number-theory",
    desc: "Modular arithmetic, sieves, extended Euclid, combinatorics, matrix power and geometry.",
    topics: [
      { id: "modular-arithmetic",           title: "Modular Arithmetic",            file: "modular-arithmetic.html",           tier: "P0" },
      { id: "primes-and-sieves",            title: "Primes & Sieves",               file: "primes-and-sieves.html",            tier: "P1" },
      { id: "gcd-and-extended-euclid",      title: "GCD & Extended Euclid",         file: "gcd-and-extended-euclid.html",      tier: "P1" },
      { id: "combinatorics",                title: "Combinatorics",                 file: "combinatorics.html",                tier: "P1" },
      { id: "number-tricks-and-invariants", title: "Number Tricks & Invariants",    file: "number-tricks-and-invariants.html", tier: "P1" },
      { id: "inclusion-exclusion",          title: "Inclusion-Exclusion",           file: "inclusion-exclusion.html",          tier: "P2" },
      { id: "matrix-exponentiation",        title: "Matrix Exponentiation",         file: "matrix-exponentiation.html",        tier: "P2" },
      { id: "geometry-basics",              title: "Geometry Basics",               file: "geometry-basics.html",              tier: "P2" },
      { id: "convex-hull",                  title: "Convex Hull",                   file: "convex-hull.html",                  tier: "P2" }
    ]
  },
  {
    id: "m12", num: "12",
    title: "Strings, Advanced",
    dir: "modules/12-strings-advanced",
    desc: "Prefix function, Z-function, rolling hashes, Manacher, suffix arrays and Aho-Corasick.",
    topics: [
      { id: "kmp-and-prefix-function", title: "KMP & the Prefix Function", file: "kmp-and-prefix-function.html", tier: "P1" },
      { id: "z-function",              title: "Z-Function",                file: "z-function.html",              tier: "P1" },
      { id: "rolling-hash",            title: "Rolling Hash",              file: "rolling-hash.html",            tier: "P1" },
      { id: "manacher",                title: "Manacher's Algorithm",      file: "manacher.html",                tier: "P2" },
      { id: "suffix-array-and-lcp",    title: "Suffix Array & LCP",        file: "suffix-array-and-lcp.html",    tier: "P2" },
      { id: "aho-corasick",            title: "Aho-Corasick",              file: "aho-corasick.html",            tier: "P2" }
    ]
  },
  {
    id: "m13", num: "13",
    title: "Greedy & Offline Techniques",
    dir: "modules/13-greedy-and-offline",
    desc: "How to actually prove a greedy, the classic greedy problem set, sweep line, compression and Mo's.",
    topics: [
      { id: "greedy-foundations",           title: "Greedy Foundations",          file: "greedy-foundations.html",           tier: "P0" },
      { id: "greedy-classics",              title: "Greedy Classics",             file: "greedy-classics.html",              tier: "P0" },
      { id: "sweep-line",                   title: "Sweep Line",                  file: "sweep-line.html",                   tier: "P1" },
      { id: "coordinate-compression",       title: "Coordinate Compression",      file: "coordinate-compression.html",       tier: "P1" },
      { id: "ternary-search-and-convexity", title: "Ternary Search & Convexity",  file: "ternary-search-and-convexity.html", tier: "P2" },
      { id: "mos-algorithm",                title: "Mo's Algorithm",              file: "mos-algorithm.html",                tier: "P2" },
      { id: "randomized-techniques",        title: "Randomised Techniques",       file: "randomized-techniques.html",        tier: "P2" }
    ]
  },
  {
    id: "m14", num: "14",
    title: "Interview Execution",
    dir: "",
    desc: "The master pattern index, a Java snippet vault, unlabelled timed drills and printable cheat sheets.",
    topics: [
      { id: "pattern-index", title: "Pattern Index",       file: "pattern-index.html",  tier: "P0" },
      { id: "java-toolkit",  title: "Java Toolkit",        file: "java-toolkit.html",   tier: "P0" },
      { id: "cheatsheets",   title: "Cheat Sheets",        file: "cheatsheets/index.html", tier: "P0" },
      { id: "mock-drills",   title: "Mock Drills",         file: "mock-drills.html",    tier: "P1" }
    ]
  }
];

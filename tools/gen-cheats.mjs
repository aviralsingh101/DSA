import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

const SHELL = (title, topicId, depth, body) => {
  const u = "../".repeat(depth);
  return `<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} &mdash; Cheat Sheet</title>
<link rel="stylesheet" href="${u}assets/css/theme.css">
<link rel="stylesheet" href="${u}assets/css/components.css">
<link rel="stylesheet" href="${u}assets/css/print.css" media="print">
</head>
<body class="page" data-topic-id="${topicId}">
  <aside id="sidebar" class="sidebar"></aside>
  <div class="shell">
    <header id="topbar" class="topbar"></header>
    <main class="content">
${body}
      <div class="prevnext"></div>
    </main>
  </div>
  <nav id="toc" class="toc"></nav>
  <script src="${u}assets/vendor/mermaid.min.js"></script>
  <script src="${u}assets/js/nav-data.js"></script>
  <script src="${u}assets/js/viz.js"></script>
  <script src="${u}assets/js/app.js"></script>
</body>
</html>
`;
};

const cards = (items) =>
  `<div class="cheat-grid">\n${items.map(([h, inner]) =>
    `  <article class="cheat-card">\n    <h3>${h}</h3>\n    ${inner}\n  </article>`
  ).join("\n")}\n</div>`;

const pre = (s) => `<pre>${s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`;
const ul = (xs) => `<ul>${xs.map((x) => `<li>${x}</li>`).join("")}</ul>`;

const modules = {
  m00: {
    file: "m00-foundations.html",
    title: "00 Foundations",
    items: [
      ["Big-O counting", ul([
        "Innermost statement × executions, drop constants",
        "Independent nests multiply; dependent nests sum a series (still Θ(n²))",
        "Java budget ≈ 1e8 ops/s; divide by 2–5 for boxing / HashMap",
      ])],
      ["Constraint table", ul([
        "n≤10 → n!; n≤20 → 2ⁿ; n≤100 → n³; n≤2e3 → n²; n≤1e5 → n log n; n≤1e7 → n",
      ])],
      ["Master theorem", ul([
        "T(n)=a T(n/b)+f(n), c=log_b a",
        "f = O(n^{c-ε}) → Θ(n^c); f=Θ(n^c log^k n) → Θ(n^c log^{k+1} n); f=Ω(n^{c+ε}) + regularity → Θ(f)",
      ])],
      ["Java landmines", ul([
        "int overflow on sums → long",
        "Arrays.sort(int[]) is dual-pivot quicksort (adversarial TLE) — shuffle or use boxed",
        "ArrayDeque over Stack; StringBuilder over +=",
        "mid = lo + (hi-lo)/2",
      ])],
      ["7-step attack", ul([
        "Restate → examples → brute + cost → constraint tell → pattern index → invariant → code → edges",
      ])],
      ["One-liners", pre(`T ≈ (#hottest line) × cost(line)
amortised double: 1+2+4+…+n < 2n`)],
    ],
  },
  m01: {
    file: "m01-arrays.html",
    title: "01 Arrays & Windows",
    items: [
      ["Prefix", pre(`P[0]=0; P[i+1]=P[i]+a[i];
sum(l,r)=P[r+1]-P[l]
diff: d[l]+=v; d[r+1]-=v`)],
      ["Kadane", pre(`cur=best=a[0];
for i=1..n-1:
  cur=max(a[i], cur+a[i]);
  best=max(best,cur);`)],
      ["Two pointers", pre(`l=0,r=n-1
while l<r:
  if sum<t l++; else r--;`)],
      ["Window", pre(`l=0
for r in 0..n-1:
  add a[r]
  while invalid: remove a[l]; l++
  update ans`)],
      ["firstTrue", pre(`while(lo<hi){
  mid=lo+(hi-lo)/2;
  if(pred(mid)) hi=mid;
  else lo=mid+1;
} return lo;`)],
      ["Pitfalls", ul([
        "Kadane seeded at 0 fails all-negative",
        "(lo+hi)/2 overflow",
        "empty window vs at-least-one",
      ])],
    ],
  },
  m02: {
    file: "m02-sorting-hashing-bits.html",
    title: "02 Sorting, Hashing, Bits",
    items: [
      ["Comparator", pre(`Comparator.comparingInt((int[] x)->x[0])
  .thenComparingInt(x->x[1]);
// never a-b (overflow)`)],
      ["Intervals", pre(`sort by start
if (cur[1]>=next[0]) merge
else emit; rooms = max overlap`)],
      ["Cyclic / index", pre(`while(a[i]!=i+1) swap(i,a[i]-1)
mark: a[x-1] = -abs(a[x-1])`)],
      ["Subarray sum k", pre(`pref+=a[i];
ans += freq.getOrDefault(pref-k,0);
freq.merge(pref,1,Integer::sum);`)],
      ["Bits", pre(`lowbit = x & -x
popcount = Integer.bitCount(x)
submasks: for(s=m;s>0;s=(s-1)&m)`)],
      ["Matrix rotate", pre(`transpose then reverse rows
// or cycle of 4`)],
    ],
  },
  m03: {
    file: "m03-linear.html",
    title: "03 Linear Structures",
    items: [
      ["Mono stack NGE", pre(`for i=0..n:
  while(!st.empty() && a[st.peek()]<a[i])
    nge[st.pop()]=i;
  st.push(i);`)],
      ["Mono deque max", pre(`while(!dq.isEmpty() && a[dq.peekLast()]<=a[i]) dq.pollLast();
dq.offerLast(i);
if(dq.peekFirst()<=i-k) dq.pollFirst();`)],
      ["Floyd cycle", pre(`fast=fast.next.next
when meet: slow=head
advance both → entry`)],
      ["Heap k-largest", pre(`PriorityQueue<Integer> pq; // min-heap
for v: if(pq.size()==k && v>pq.peek()) pq.poll();
pq.offer(v);`)],
      ["LRU", ul(["HashMap<key,Node> + dummy head/tail", "get/put: detach, insert after head", "evict tail.prev"])],
      ["TreeMap", pre(`floorKey / ceilingKey
higherKey / lowerKey
subMap(lo,true,hi,false)`)],
    ],
  },
  m04: {
    file: "m04-recursion.html",
    title: "04 Recursion & D&C",
    items: [
      ["Include / exclude", pre(`dfs(i):
  choose a[i]; dfs(i+1); pop
  dfs(i+1)  // skip`)],
      ["Dedup", pre(`sort first
if(i>start && a[i]==a[i-1]) continue
// perms: skip used[i] and
// used[i-1]==false && a[i]==a[i-1]`)],
      ["Inversions", pre(`inv = inv(L)+inv(R)+mergeCount
mergeCount: when a[i]>a[j] add (mid-i+1)`)],
      ["MITM", pre(`enum left 2^{n/2}
enum right
sort one side; binary search complement`)],
      ["Stack depth", ul(["Java default ~1k–8k frames", "new Thread(null,r,\"t\",1<<26) for deeper"])],
    ],
  },
  m05: {
    file: "m05-trees.html",
    title: "05 Trees",
    items: [
      ["Iterative inorder", pre(`while(cur!=null || !st.empty()){
  while(cur!=null){st.push(cur);cur=cur.left;}
  cur=st.pop(); visit; cur=cur.right;
}`)],
      ["BST validate", pre(`ok(node, lo, hi):
  if(v<=lo || v>=hi) false
  ok(L,lo,v) && ok(R,v,hi)`)],
      ["Binary lifting", pre(`up[k][v]=up[k-1][up[k-1][v]]
lift deeper to same depth
then lift together`)],
      ["Euler tour", pre(`tin[v]=timer++
dfs children
tout[v]=timer-1
subtree = [tin,tout]`)],
      ["Trie", pre(`node.next[26]; node.end
insert / search / startsWith`)],
      ["XOR trie", pre(`prefer opposite bit if present
maxXor ^= (1<<b)`)],
    ],
  },
  m06: {
    file: "m06-range.html",
    title: "06 Range Queries",
    items: [
      ["Sparse table", pre(`st[k][i]=op(st[k-1][i], st[k-1][i+(1<<k-1)])
q(l,r): k=log(r-l+1); op(st[k][l],st[k][r-(1<<k)+1])`)],
      ["Fenwick", pre(`add: for(i++;i<n;i+=i&-i) t[i]+=v
sum: for(i++;i>0;i-=i&-i) s+=t[i]`)],
      ["Segtree merge", pre(`pull: t[v]=op(t[L],t[R])
query: disjoint skip; covered return; else mix`)],
      ["Lazy", pre(`apply to node + mark lazy
push before going down
compose updates`)],
      ["DSU", pre(`find: p[x]==x?x:p[x]=find(p[x])
union by size; comps--`)],
    ],
  },
  m07: {
    file: "m07-graphs-core.html",
    title: "07 Graphs Core",
    items: [
      ["Repr", pre(`List<List<Integer>> g
int[] dr={-1,1,0,0}, dc={0,0,-1,1}`)],
      ["BFS", pre(`q.offer(s); dist[s]=0
while(!q.isEmpty()){
  u=q.poll();
  for v: if(dist[v]<0){dist[v]=dist[u]+1;q.offer(v);}
}`)],
      ["Topo Kahn", pre(`for edges indeg[v]++
queue all indeg==0
pop; for to: if(--indeg[to]==0) offer`)],
      ["Dijkstra", pre(`pq (dist,u); skip if d!=dist[u]
relax: if(dist[v]>dist[u]+w) update + offer`)],
      ["0-1 BFS", pre(`ArrayDeque
w==0 ? addFirst : addLast`)],
      ["Bipartite", pre(`BFS colour 0/1
edge to same colour → odd cycle`)],
    ],
  },
  m08: {
    file: "m08-graphs-adv.html",
    title: "08 Graphs Advanced",
    items: [
      ["Bellman-Ford", ul(["relax all edges n−1 times", "one more success → neg cycle"])],
      ["Floyd", pre(`for k for i for j
  d[i][j]=min(d[i][j], d[i][k]+d[k][j])`)],
      ["Kruskal", pre(`sort edges by w
if(dsu.union(u,v)) take`)],
      ["Tarjan low", pre(`low[v]=min(low[v],low[to])
low[to]>tin[v] → bridge
low[to]>=tin[v] → articulation (not root)`)],
      ["Dinic idea", ul(["BFS level graph", "DFS blocking flow along levels", "O(V²E) typical"])],
      ["2-SAT", ul(["implication graph x∨y ⇒ ¬x→y and ¬y→x", "unsat iff x and ¬x in same SCC", "assign x true if scc[x]>scc[¬x]"])],
    ],
  },
  m09: {
    file: "m09-decompositions.html",
    title: "09 Decompositions",
    items: [
      ["HLD", ul(["heavy child = largest subtree", "chain to head", "path query = O(log) chains × segtree"])],
      ["Centroid", ul(["centroid: every remaining component ≤ n/2", "solve through centroid, mark dead, recurse"])],
      ["Small-to-large", pre(`if(sz[a]<sz[b]) swap
merge map a into b
T = O(n log n) because each
node doubles at most log n times`)],
    ],
  },
  m10: {
    file: "m10-dp.html",
    title: "10 Dynamic Programming",
    items: [
      ["Pipeline", ul(["state → rec → memo → tabulate → space-opt", "iterate so dependencies already filled"])],
      ["0/1 knapsack 1D", pre(`for each item:
  for s=W; s>=w; s--
    dp[s]=max(dp[s], dp[s-w]+val)`)],
      ["LIS n log n", pre(`tails increasing
i = binarySearch(tails, x)
if i==size add else tails[i]=x`)],
      ["Interval", pre(`for len=2..n
  for l=0; r=l+len-1
    for k=l..r-1
      dp[l][r] = opt(dp[l][k],dp[k+1][r])`)],
      ["Digit DP", pre(`dfs(pos, tight, lead0, sum)
tight: still prefix-equal to N`)],
      ["Grundy", pre(`g[v]=mex{ g[to] }
xor of components; 0 = lose`)],
    ],
  },
  m11: {
    file: "m11-math.html",
    title: "11 Math",
    items: [
      ["Mod", pre(`(a%M+M)%M
modPow; inv = modPow(a,M-2)
negatives: ((a%M)+M)%M`)],
      ["Ext Euclid", pre(`ax+by=g
if b==0: x=1,y=0
else recurse; x=y1; y=x1-(a/b)*y1`)],
      ["nCr", pre(`fact[n]*invF[r]%M*invF[n-r]%M`)],
      ["Matpow", pre(`F_n = T^{n-1} * F_1
T = [[1,1],[1,0]] for Fib`)],
      ["Geometry", ul(["cross z = x1 y2 − y1 x2; sign = orientation", "shoelace area", "integer-only when possible"])],
      ["Hull", ul(["Andrew monotone chain: sort x, lower then upper", "pop while not left turn"])],
    ],
  },
  m12: {
    file: "m12-strings.html",
    title: "12 Strings",
    items: [
      ["π / KMP", pre(`j=pi[i-1]
while(j&&s[i]!=s[j]) j=pi[j-1]
if eq j++; pi[i]=j
search: run π on pat+'#'+text`)],
      ["Z", pre(`if i<r: z[i]=min(r-i, z[i-l])
while match z[i]++
if i+z[i]>r: l=i,r=i+z[i]`)],
      ["Hash", pre(`h[i+1]=h[i]*P + s[i]
sub(l,r)=(h[r]-h[l]*p[r-l]) % MOD
double hash against anti-hash`)],
      ["Manacher", ul(["odd/even radii via transformed string", "mirror around current center"])],
      ["SA + LCP", ul(["O(n log² n) doubling", "Kasai LCP from sa and rank"])],
    ],
  },
  m13: {
    file: "m13-greedy.html",
    title: "13 Greedy & Offline",
    items: [
      ["Prove greedy", ul(["Exchange: swap first difference, cost does not worsen", "Stay-ahead: after i steps you are at least as good"])],
      ["Activity", pre(`sort by end
take if start >= lastEnd`)],
      ["Sweep", pre(`events (x, +1 start) (x, -1 end)
sort x then ends first
track live max`)],
      ["Compress", pre(`uniq = sort unique
rank = lower_bound
then BIT on ranks`)],
      ["Mo", pre(`block = n/sqrt(q)
sort (L/block, R)
add/remove as pointers move`)],
    ],
  },
};

const indexLinks = Object.entries(modules).map(([id, m]) =>
  `<li><a href="${m.file}">${m.title}</a></li>`).join("\n          ");

const indexBody = `
      <section class="hero">
        <span class="hero__chip">Module 14</span>
        <h1>Cheat Sheets</h1>
        <p class="hero__tagline">One printable page per module: signatures, complexities, invariants, pitfalls. Use Print → Save as PDF.</p>
        <div class="hero__meta"><span class="pill pill--easy">Easy</span><span class="chip">P0</span></div>
      </section>
      <ol>
          ${indexLinks}
      </ol>
      <p class="text-dim">Sidebar and chrome hide automatically when you print. External URLs are appended after links.</p>
`;

fs.mkdirSync(path.join(ROOT, "cheatsheets"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "cheatsheets/index.html"), SHELL("Cheat Sheets", "cheatsheets", 1, indexBody));

for (const m of Object.values(modules)) {
  const body = `
      <section class="hero">
        <span class="hero__chip">Cheat sheet</span>
        <h1>${m.title}</h1>
        <p class="hero__tagline">Print-optimised. Signatures, complexities, the invariants you say out loud.</p>
      </section>
      ${cards(m.items)}
`;
  fs.writeFileSync(path.join(ROOT, "cheatsheets", m.file), SHELL(m.title, "", 1, body));
  console.log("  + cheatsheets/" + m.file);
}
console.log("  + cheatsheets/index.html");

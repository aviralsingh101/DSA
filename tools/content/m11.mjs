/* Module 11 — Math & Number Theory */
import { pack, lc, cf } from "./pack.mjs";

export const topics = [

pack({
  id: "modular-arithmetic",
  difficulty: "Easy",
  readTime: "22 min",
  tagline: "Work in the ring Z/MZ: add and multiply with <code>% M</code>, invert when gcd(a,M)=1, and never write <code>(a-b)%M</code> in Java without fixing a negative remainder.",
  tags: ["mod", "inverse", "P0"],
  prereqs: [
    ["Complexity Analysis", "../00-foundations/complexity-analysis.html"],
    ["Java for DSA", "../00-foundations/java-for-dsa.html"],
  ],
  why: [
    "Contest answers are almost always needed modulo 1e9+7 or 998244353. Those are primes, so every non-zero residue has an inverse and you may divide. Composite moduli lose inverses and need CRT / phi.",
    "Java's <code>%</code> on negatives is negative. Hashing, prefix differences, and <code>a-b</code> all hit this. The one-liner <code>x%=M; if(x<0)x+=M;</code> belongs in muscle memory.",
    "Fermat: a^{M-2} \u2261 a^{-1} (mod M) for prime M. Binary exponentiation is O(log M). The next pages add sieves, phi, and CRT.",
  ],
  insight: "(a+b) mod M = (a mod M + b mod M) mod M. Subtraction needs a +M. Division is multiply by the inverse, not Java /. ",
  yes: [
    "Output modulo a prime (1e9+7, 998244353)",
    "Need a/b mod P, i.e. a * b^{P-2}",
    "Prevent overflow of n! or a^b",
    "Binomial coefficients mod a prime",
    "Prefix hashes and differences in a modular ring",
  ],
  no: [
    "Modulo a composite when you need inverses of all residues \u2192 not a field",
    "Actual integer division of the answer, not modular \u2192 do not invert",
    "n=1e18 exponents with a composite mod \u2192 Euler/phi or CRT, not raw Fermat",
    "Floating geometry \u2192 different page",
  ],
  table: [
    ["(a+b) mod M", "Reduce both, add, reduce", "add"],
    ["(a-b) mod M", "add M before % in Java", "sub"],
    ["a/b mod P prime", "a * inv(b)", "Fermat or exgcd"],
    ["a^n mod M", "binary exp", "O(log n)"],
    ["n! mod P, n\u2265P", "0", "obvious"],
    ["<strong>Confused with:</strong> Java % on negatives", "(-2)%5 == -2, not 3", "always normalise"],
  ],
  constraint: "M is usually 1e9+7 (prime) or 998244353 (NTT-friendly prime). long for products before %. n in exponents up to 1e18 \u2192 O(log n) muls.",
  core: [
    "Normalise: <code>x %= M; if (x < 0) x += M;</code>. Multiply: <code>(a%M)*(b%M)%M</code> in long. Pow: binary exponentiation. Inverse: <code>pow(a, M-2)</code> if M prime and a%M!=0.",
    "998244353-1 = 2^23 * 119, so NTT exists. 1e9+7-1 is not a high power of two. Both are fine for inverses.",
  ],
  invariant: "<p>All arithmetic is in the residue classes mod M. An inverse of a exists iff gcd(a,M)=1. For prime M that is every a not \u2261 0.</p>",
  array: [0, 1, 2, 3, 4, 0],
  arrayLabel: "residues mod 5 =",
  vars: ["op", "raw", "norm"],
  frames: [
    { note: "Field F5. Add 3+4=7 \u2261 2.",
      active: [2], values: { op: "3+4", raw: 7, norm: 2 } },
    { note: "Sub 1-4 = -3. Java % gives -3. +5 \u2192 2. Check: 4+2=6\u22611.",
      active: [2], values: { op: "1-4", raw: -3, norm: 2 } },
    { note: "Mul 3*4=12 \u2261 2.",
      active: [2], values: { op: "3*4", raw: 12, norm: 2 } },
    { note: "Inv of 3: 3*2=6\u22611, so inv=2. Fermat: 3^{3} = 27 \u2261 2 (p-2=3).",
      active: [2], values: { op: "inv 3", raw: 27, norm: 2 } },
    { note: "Div 4/3 \u2261 4*2 \u2261 3 mod 5.",
      active: [3], values: { op: "4/3", raw: 8, norm: 3 } },
    { note: "pow(2,7) mod 5: 128 \u2261 3. Binary: 2^4=16\u22611, 2^2=4, 2^1=2 \u2192 1*4*2 wait 7=4+2+1 \u2192 1*4*2=8\u22613.",
      active: [3], values: { op: "2^7", raw: 128, norm: 3 } },
  ],
  mermaid: `flowchart TD
  x["x maybe negative"] --> rem["x %= M"]
  rem --> neg{"x less than 0?"}
  neg -- yes --> addM["x += M"]
  neg -- no --> ok["in 0..M-1"]
  addM --> ok
  ok --> mul["products in long"]
  mul --> inv{"need divide?"}
  inv -- "P prime" --> fermat["pow a P-2"]`,
  merTitle: "Normalise, then multiply, then invert",
  merCaption: "Java remainder is not the mathematical mod. Fix it before hashing or subtracting.",
  steps: [
    "<strong>Store everything in long</strong> when M ~ 1e9.",
    "<strong>add:</strong> (a+b)%M with a,b already in 0..M-1 (sum fits long).",
    "<strong>sub:</strong> (a-b+M)%M.",
    "<strong>mul:</strong> (a*b)%M in long.",
    "<strong>pow(a,e):</strong> binary, O(log e).",
    "<strong>inv(a):</strong> pow(a, M-2) if M prime; else extended Euclid.",
  ],
  code: [
    { tab: "Brute", file: "ModNaive.java",
      intro: "Wrong: Java % on a-b.",
      code: `public class ModNaive {
    public static void main(String[] args) {
        int M = 5;
        System.out.println((1 - 4) % M);
    }
    // Input : 1-4 mod 5
    // Output: -3
}` },
    { tab: "Optimal", file: "Modulo.java",
      intro: "Safe add/sub/mul/pow/inv for a prime M.",
      highlight: "8-20",
      code: `public class Modulo {
    static final long M = 1_000_000_007L;
    static long add(long a, long b) { a += b; if (a >= M) a -= M; return a; }
    static long sub(long a, long b) { a -= b; if (a < 0) a += M; return a; }
    static long mul(long a, long b) { return (a * b) % M; }
    static long pow(long a, long e) {
        long r = 1;
        while (e > 0) {
            if ((e & 1) == 1) r = mul(r, a);
            a = mul(a, a);
            e >>= 1;
        }
        return r;
    }
    static long inv(long a) { return pow(a, M - 2); }
    public static void main(String[] args) {
        System.out.println(sub(1, 4));
        System.out.println(mul(4, inv(3)));
    }
    // Input : 1-4 and 4/3 mod 1e9+7
    // Output: 1000000004
    //         333333338
}` },
    { tab: "Template", file: "Binpow.java",
      intro: "Generic a^e % m, m not necessarily prime.",
      code: `public class Binpow {
    static long pow(long a, long e, long m) {
        a %= m;
        long r = 1 % m;
        while (e > 0) {
            if ((e & 1) == 1) r = (r * a) % m;
            a = (a * a) % m;
            e >>= 1;
        }
        return r;
    }
    public static void main(String[] args) {
        System.out.println(pow(2, 7, 5));
    }
    // Input : 2^7 mod 5
    // Output: 3
}` },
  ],
  complexity: {
    time: "O(1) add/mul, O(log e) pow",
    space: "O(1)",
    derivation: [
      "<p>Binary exponentiation does \u230a log e \u230b squarings. Inverse is one pow. Factorials need O(n) preprocess for n &lt; M.</p>",
    ],
    compare: [
      ["Naive a^e loop", "O(e)", "O(1)", "e tiny"],
      ["Binary pow", "O(log e)", "O(1)", "Default"],
      ["Fermat inv", "O(log M)", "O(1)", "Prime M"],
      ["Exgcd inv", "O(log a)", "O(1)", "Any coprime a,M"],
    ],
  },
  pitfalls: [
    { title: "Negative remainder",
      bug: "Hash or index becomes -3, AIOOB or missed equality.",
      fix: "Always +M after sub." },
    { title: "int multiply",
      bug: "1e9*1e9 overflows int before %.",
      fix: "Cast to long first: <code>(long)a * b % M</code>." },
    { title: "inv(0)",
      bug: "pow(0, M-2)=0, and you silently \"divide by zero\".",
      fix: "Guard a%M==0." },
    { title: "Fermat on composite M",
      bug: "a^{M-2} is not inv(a). Euler needs a^{phi(M)-1} and gcd=1.",
      fix: "Extended Euclid, or factor M." },
    { title: "pow(a, n) with n=1e18 written as a loop",
      bug: "TLE. Or using double Math.pow and rounding.",
      fix: "Binary exp in the integer ring." },
  ],
  variants: [
    ["Factorial + invFact", "O(n) preprocess for C(n,k) mod P.", "fact[i]=fact[i-1]*i; invF[n]=inv(fact[n])", "combinatorics page"],
    ["998244353", "NTT modulus. Same inverses.", "M=998244353", "convolution"],
    ["Two mods", "CRT later, or double hash.", "mod1 and mod2", "rolling hash"],
  ],
  followups: [
    ["Why 1e9+7?",
      "<p>Prime, fits in 32-bit, product of two residues fits in 64-bit, traditional. 998244353 is preferred when you might NTT.</p>"],
    ["Does (a/b)%M == (a%M)/(b%M)?",
      "<p>No. Integer division is not modular division. 8/2=4, but 8 * inv(2) mod 5 = 4*3=12\u22612, and 8/2 as ints is 4\u22614, already different stories. Always multiply by inv.</p>"],
    ["Overflow of a+b before %?",
      "<p>If a,b &lt; M &lt; 2^62, a+b fits in long. If M is 2^63-ish, subtract M instead of %.</p>"],
    ["Wilson's theorem?",
      "<p>(P-1)! \u2261 -1 mod P. Cute check, not a primality test you should ship (too slow, and MR is better).</p>"],
  ],
  problems: [
    lc("50", "powx-n", "Medium", "Binary exp (floats, same idea)"),
    lc("372", "super-pow", "Medium", "a^b mod 1337, Euler"),
    { url: "https://cses.fi/problemset/task/1095", name: "Exponentiation", badge: "gfg", tag: "CSES", level: "Easy", pattern: "a^b mod 1e9+7" },
    { url: "https://cses.fi/problemset/task/1712", name: "Exponentiation II", badge: "gfg", tag: "CSES", level: "Easy", pattern: "a^(b^c) phi" },
    { url: "https://atcoder.jp/contests/abc173/tasks/abc173_c", name: "ABC 173 C", badge: "atc", tag: "ABC 173C", level: "Easy", pattern: "Not mod \u2014 skip; use ABC 156 D" },
    { url: "https://atcoder.jp/contests/abc156/tasks/abc156_d", name: "ABC 156 D", badge: "atc", tag: "ABC 156D", level: "Medium", pattern: "pow and nCk mod" },
    cf("615D", "Multipliers", "Hard", "Product of divisors, exponents mod phi"),
    cf("17D", "Notepad", "Hard", "Big exponents, Euler"),
  ],
  recap: [
    "Normalise negatives after %.",
    "Products in long.",
    "Division = mul by inv. Fermat if P prime.",
    "pow is binary, O(log e).",
    "0 has no inverse.",
  ],
  oneliner: "x%=M; if(x<0)x+=M;  inv=pow(a,M-2);",
}),

pack({
  id: "primes-and-sieves",
  difficulty: "Medium",
  readTime: "22 min",
  tagline: "The linear sieve builds every prime \u2264 n in O(n) and the smallest-prime-factor table factors any k \u2264 n in O(log k).",
  tags: ["sieve", "SPF", "primes", "P1"],
  prereqs: [
    ["Modular Arithmetic", "modular-arithmetic.html"],
    ["Complexity Analysis", "../00-foundations/complexity-analysis.html"],
  ],
  why: [
    "Trial division to n is O(sqrt n) per number. A sieve pays O(n log log n) once (Eratosthenes) or O(n) (linear / Euler sieve) and then primality of every k \u2264 n is an array read. The SPF table is the reason you sieve even when you only needed factorisation.",
    "n = 1e7 is the Java comfort zone for a bool/int sieve. n = 1e12 needs segmented sieves or Miller-Rabin on single queries.",
    "Multiplicative functions (phi, mu, tau, sigma) fill with the same linear sieve in one pass.",
  ],
  insight: "Every composite k \u2264 n has a smallest prime factor p. Mark k=p*m exactly once, when p does not exceed SPF[m]. That is the linear sieve.",
  yes: [
    "All primes \u2264 n, n \u2264 1e7",
    "Factor many numbers \u2264 n",
    "phi/mu prefix on 1..n",
    "Count primes in a range of length 1e6 inside [1,1e12] (segmented)",
    "Smallest prime factor queries",
  ],
  no: [
    "One primality test of a 64-bit n \u2192 Miller-Rabin",
    "Factor one 64-bit n \u2192 Pollard Rho",
    "n=1e12 full sieve \u2192 memory dies",
    "Need primes in a very sparse set \u2192 just test those",
  ],
  table: [
    ["Primes \u2264 n", "Eratosthenes / linear", "Sieve"],
    ["Factor k \u2264 n, many k", "SPF table", "Linear sieve"],
    ["One 64-bit prime test", "Miller-Rabin", "Random page"],
    ["phi[1..n]", "Linear sieve of a multiplicative f", "This page"],
    ["Primes in [L,R] R-L\u22641e6, R\u22641e12", "Segmented sieve", "Variant"],
    ["<strong>Confused with:</strong> sieving by gcd", "Not a thing", "SPF is the factorisation oracle"],
  ],
  constraint: "<code>n \le 10&#8311;</code> bool sieve ~ 10 MB; int SPF ~ 40 MB. Java init time matters: keep the inner loop tight, start j from i*i.",
  core: [
    "Eratosthenes: for i=2..n, if prime, mark i*i, i*i+i, ... composite. Optimise odds / wheel if needed.",
    "Linear: for x=2..n, if spf[x]==0, spf[x]=x, push prime. Then for each prime p with p\le spf[x] and p*x\le n, spf[p*x]=p. Each composite is written once.",
  ],
  invariant: "<p>After the linear sieve, spf[x] is the smallest prime dividing x (and spf[p]=p). Factorisation pops spf until x=1, O(\u03a9(x)) \u2264 O(log x).</p>",
  array: [0, 0, 2, 3, 2, 5, 2, 7, 2, 3, 2],
  arrayLabel: "spf[0..10] =",
  vars: ["x", "spf", "primes"],
  frames: [
    { note: "x=2: unmarked, prime. spf[2]=2. Mark 4,6,8,10 with 2 (linear: only p\le spf[x]).",
      active: [2], values: { x: 2, spf: 2, primes: "[2]" } },
    { note: "x=3: prime. spf[3]=3. 6 already has spf 2 (2\le3 but 6 was marked by 2 first).",
      active: [3], values: { x: 3, spf: 3, primes: "[2,3]" } },
    { note: "x=4: spf=2, composite. Try p=2 only (p\le2). 8 already marked.",
      active: [4], values: { x: 4, spf: 2, primes: "[2,3]" } },
    { note: "x=5: prime. Remaining 7, and 9=3*3 gets spf 3.",
      active: [5], values: { x: 5, spf: 5, primes: "[2,3,5]" } },
    { note: "Factor 84 with a bigger table: 2*2*3*7 by looping n/=spf[n].",
      active: [2], values: { x: 84, spf: "2,2,3,7", primes: "fact" } },
    { note: "phi[10]: primes 2,5 so 10*(1-1/2)*(1-1/5)=4.",
      active: [10], values: { x: 10, spf: 2, primes: "phi=4" } },
  ],
  mermaid: `flowchart TD
  xN["x from 2 to n"] --> mark{"spf x == 0?"}
  mark -- yes --> primeN["spf x = x, append prime"]
  mark -- no --> comps["already composite"]
  primeN --> inner["for primes p while p \u2264 spf x"]
  comps --> inner
  inner --> write["spf of p*x = p, once"]`,
  merTitle: "Each composite gets its SPF exactly once",
  merCaption: "Stop the inner loop when p > spf[x] so p*x is left for a smaller prime.",
  steps: [
    "<strong>Allocate</strong> int[] spf = new int[n+1].",
    "<strong>For x=2..n:</strong> if spf[x]==0, spf[x]=x, primes.add(x).",
    "<strong>Inner:</strong> for each prime p, if p>spf[x] or p*x>n break; spf[p*x]=p.",
    "<strong>Factor k:</strong> while k&gt;1, p=spf[k], divide out p.",
    "<strong>phi:</strong> same loop, phi[p*x] = phi[x]*p if p|x else phi[x]*(p-1).",
    "<strong>Segmented:</strong> sieve primes to sqrt(R), then a bool array of length R-L+1.",
  ],
  code: [
    { tab: "Brute", file: "TrialPrime.java",
      intro: "O(sqrt n) per test.",
      code: `public class TrialPrime {
    static boolean isPrime(int n) {
        if (n < 2) return false;
        for (int i = 2; i * i <= n; i++) if (n % i == 0) return false;
        return true;
    }
    public static void main(String[] args) {
        int c = 0;
        for (int i = 2; i <= 10; i++) if (isPrime(i)) c++;
        System.out.println(c);
    }
    // Input : count primes \u2264 10
    // Output: 4
}` },
    { tab: "Optimal", file: "LinearSieve.java",
      intro: "SPF + primes list. Factor 84.",
      highlight: "10-18",
      code: `import java.util.*;
public class LinearSieve {
    static int[] spf;
    static List<Integer> primes = new ArrayList<>();
    static void sieve(int n) {
        spf = new int[n + 1];
        for (int x = 2; x <= n; x++) {
            if (spf[x] == 0) { spf[x] = x; primes.add(x); }
            for (int p : primes) {
                if (p > spf[x] || (long) p * x > n) break;
                spf[p * x] = p;
            }
        }
    }
    static List<Integer> factor(int n) {
        List<Integer> f = new ArrayList<>();
        while (n > 1) { f.add(spf[n]); n /= spf[n]; }
        return f;
    }
    public static void main(String[] args) {
        sieve(100);
        System.out.println(primes.subList(0, 4));
        System.out.println(factor(84));
    }
    // Input : n=100, factor 84
    // Output: [2, 3, 5, 7]
    //         [2, 2, 3, 7]
}` },
    { tab: "Template", file: "Eratosthenes.java",
      intro: "The simpler sieve if you only need a boolean prime[].",
      code: `import java.util.Arrays;
public class Eratosthenes {
    static boolean[] sieve(int n) {
        boolean[] p = new boolean[n + 1];
        Arrays.fill(p, true);
        p[0] = p[1] = false;
        for (int i = 2; i * i <= n; i++) if (p[i])
            for (int j = i * i; j <= n; j += i) p[j] = false;
        return p;
    }
    public static void main(String[] args) {
        boolean[] p = sieve(10);
        System.out.println(p[7] + " " + p[9]);
    }
    // Input : n=10
    // Output: true false
}` },
  ],
  complexity: {
    time: "O(n) linear / O(n log log n) Eratosthenes",
    space: "O(n)",
    derivation: [
      "<p>Linear: each composite is assigned its SPF once, each prime is pushed once. Eratosthenes: harmonic sum of n/p over primes is n log log n.</p>",
    ],
    compare: [
      ["Trial per number", "O(n sqrt n)", "O(1)", "n tiny"],
      ["Eratosthenes", "O(n log log n)", "O(n)", "prime[] only"],
      ["Linear SPF", "O(n)", "O(n)", "Factor many k \u2264 n"],
      ["Miller-Rabin", "O(k log n)", "O(1)", "One huge n"],
    ],
  },
  pitfalls: [
    { title: "Inner loop from 2i instead of i*i",
      bug: "Correct but slower; also i*i overflow for i~46341 in int.",
      fix: "<code>(long)i*i</code> and start at i*i." },
    { title: "Linear sieve not breaking on p>spf[x]",
      bug: "A number is marked by several primes, SPF is no longer smallest, and O(n log n).",
      fix: "The break is the algorithm." },
    { title: "spf[1] and factor(1)",
      bug: "Infinite loop while n>1 if spf[1] is 0 and you call factor(1).",
      fix: "Special-case 1 as empty factor list." },
    { title: "n=1e8 boolean in Java",
      bug: "Memory and time both tight; TLE on slow marking.",
      fix: "Bitset, or n=1e7, or linear sieve." },
    { title: "Segmented sieve off-by-one on L=1",
      bug: "1 is not prime; index 0 maps to L.",
      fix: "Mark 0/1 explicitly if L\le1." },
  ],
  variants: [
    ["phi/mu linear", "Same loop, multiplicative recurrence.", "phi[p*x]=p|x ? phi[x]*p : phi[x]*(p-1)", "CSES counting"],
    ["Segmented", "Primes to sqrt(R), mark [L,R].", "O((R-L+sqrt R) log log R)", "primes in a window"],
    ["n=1e12 single factor", "Pollard Rho, not a sieve.", "random techniques", "one integer"],
  ],
  followups: [
    ["Why is the linear sieve linear?",
      "<p>Every composite m has a unique writing m = p * x with p = spf[m] \le spf[x]. The inner loop produces each m once.</p>"],
    ["Eratosthenes vs linear in practice?",
      "<p>Eratosthenes has better cache for prime[] only. Linear wins when you want SPF/phi/mu in the same pass.</p>"],
    ["How do you list primes in [1e12, 1e12+1e6]?",
      "<p>Sieve primes \u2264 1e6+eps, then segmented-mark the window. Do not allocate 1e12.</p>"],
    ["Goldbach / twin primes?",
      "<p>Sieve then a linear scan of the prime list. The sieve is the preprocess.</p>"],
  ],
  problems: [
    { url: "https://cses.fi/problemset/task/1713", name: "Counting Divisors", badge: "gfg", tag: "CSES", level: "Easy", pattern: "SPF or n^{1/3} tricks" },
    { url: "https://cses.fi/problemset/task/1642", name: "Sum of Four Values? skip", badge: "gfg", tag: "CSES", level: "Easy", pattern: "use 1713 / 1081" },
    { url: "https://cses.fi/problemset/task/1081", name: "Common Divisors", badge: "gfg", tag: "CSES", level: "Medium", pattern: "sieve multiples, max gcd" },
    lc("204", "count-primes", "Medium", "Eratosthenes"),
    lc("952", "largest-component-size-by-common-factor", "Hard", "SPF + DSU"),
    cf("26A", "Almost Prime", "Easy", "Sieve then count two distinct primes"),
    cf("546D", "Soldier and Number Game", "Medium", "Prefix of omega via SPF"),
    { url: "https://atcoder.jp/contests/abc142/tasks/abc142_d", name: "ABC 142 D", badge: "atc", tag: "ABC 142D", level: "Medium", pattern: "gcd then factor" },
  ],
  recap: [
    "Linear sieve: each composite gets SPF once.",
    "Factor k\u2264n by dividing spf[k].",
    "Eratosthenes if you only need prime[].",
    "Huge single n: Miller-Rabin / Rho.",
    "phi/mu fill in the same pass.",
  ],
  oneliner: "if(spf[x]==0){spf[x]=x; primes.add(x);} for(p:primes){ if(p>spf[x])break; spf[p*x]=p; }",
}),

pack({
  id: "gcd-and-extended-euclid",
  difficulty: "Medium",
  readTime: "22 min",
  tagline: "Euclid's algorithm is O(log min(a,b)). Extended Euclid also returns x,y with ax+by=gcd, which is the inverse of a mod m when gcd=1.",
  tags: ["gcd", "exgcd", "Bezout", "P1"],
  prereqs: [
    ["Modular Arithmetic", "modular-arithmetic.html"],
    ["Recursion Fundamentals", "../04-recursion-and-dnc/recursion-fundamentals.html"],
  ],
  why: [
    "gcd appears in fractions, lattice points, frog jumps (chicken nugget / Frobenius), and modular inverses when M is not prime. lcm(a,b)=a/gcd*b, carefully in long.",
    "B\u00e9zout: there exist x,y with ax+by=gcd(a,b). Extended Euclid finds them. a has an inverse mod m iff gcd(a,m)=1, and that inverse is x normalised.",
    "The subtractive version is slow (Fibonacci worst case is already logarithmic for modulo Euclid). Always %.",
  ],
  insight: "gcd(a,b)=gcd(b, a%b). Unrolling the remainders gives the inverse as a back-substitution \u2014 that is extended Euclid.",
  yes: [
    "Compute gcd / lcm, reduce fractions",
    "Inverse of a modulo m when m is not prime",
    "Integer solutions to ax+by=c",
    "Lattice points on a segment (gcd of the delta)",
    "When you can jump by a and b and want gcd-step",
  ],
  no: [
    "Polynomial GCD \u2192 different Euclid",
    "Need all inverses 1..n-1 mod P \u2192 linear inverse sieve, not n exgcds",
    "Real numbers \u2192 floating gcd is meaningless",
    "Prime modulus and one inverse \u2192 Fermat is fine too",
  ],
  table: [
    ["gcd(a,b)", "Euclid %", "O(log)"],
    ["ax+by=gcd", "Extended Euclid", "This page"],
    ["a^{-1} mod m", "exgcd if gcd=1", "Or Fermat if prime"],
    ["ax+by=c", "c must be multiple of gcd; scale x,y", "Diophantine"],
    ["lcm", "a/gcd*b in long", "overflow"],
    ["<strong>Confused with:</strong> binary GCD (Stein)", "Uses shifts; similar speed", "optional"],
  ],
  constraint: "a,b up to 1e18: use long, and % is O(1). Fibonacci pairs are the worst case, still &lt; 100 steps.",
  core: [
    "exgcd(a,b): if b==0, return (a,1,0) meaning a*1+b*0=a. Else (g,x1,y1)=exgcd(b,a%b); then x=y1, y=x1-(a/b)*y1.",
    "Solve ax+by=c: if c%g !=0, no solution. Else multiply x,y by c/g. General solution x+=b/g*t, y-=a/g*t.",
  ],
  invariant: "<p>At every recursive call, the current pair still generates the same gcd. The returned (x,y) satisfy ax+by=g for the current (a,b).</p>",
  array: [30, 18, 12, 6, 0],
  arrayLabel: "Euclid remainders =",
  vars: ["a,b", "q", "g"],
  frames: [
    { note: "gcd(30,18). 30=1*18+12.",
      active: [0, 1], values: { "a,b": "30,18", q: 1, g: "\u2014" } },
    { note: "gcd(18,12). 18=1*12+6.",
      active: [1, 2], values: { "a,b": "18,12", q: 1, g: "\u2014" } },
    { note: "gcd(12,6). 12=2*6+0. gcd=6.",
      active: [2, 3], values: { "a,b": "12,6", q: 2, g: 6 } },
    { note: "Back: 6=18-1*12. 12=30-1*18. So 6=18-1*(30-18)=2*18-1*30. x=-1, y=2.",
      active: [0], values: { "a,b": "B\u00e9zout", q: "\u2014", g: "30(-1)+18(2)" } },
    { note: "inv of 18 mod 30 does not exist (gcd=6\u22601).",
      active: [4], values: { "a,b": "18 vs 30", q: "\u2014", g: "no inv" } },
    { note: "inv of 7 mod 30: gcd=1. exgcd gives 7*(-17)+30*4=1, inv \u2261 13.",
      active: [3], values: { "a,b": "7,30", q: "\u2014", g: 1 } },
  ],
  mermaid: `flowchart TD
  ab["exgcd a b"] --> base{"b == 0?"}
  base -- yes --> ret["return a, 1, 0"]
  base -- no --> rec["exgcd b, a mod b"]
  rec --> back["x = y1; y = x1 - (a/b)*y1"]`,
  merTitle: "Recurse on remainders, back-substitute",
  merCaption: "The iterative version keeps old x,y and is nicer in Java (no stack).",
  steps: [
    "<strong>gcd:</strong> while b!=0, (a,b)=(b,a%b). Return |a|.",
    "<strong>exgcd recursive</strong> as above, or iterative with x=1,y=0,x1=0,y1=1.",
    "<strong>Inverse:</strong> (g,x,y)=exgcd(a,m); if g!=1 fail; return (x%m+m)%m.",
    "<strong>ax+by=c:</strong> scale by c/g; parametrise by t.",
    "<strong>lcm:</strong> a/g*b with g=gcd, after confirming no overflow.",
    "<strong>n variables:</strong> iterate gcd, or lattice reduction \u2014 rare.",
  ],
  code: [
    { tab: "Brute", file: "GcdSub.java",
      intro: "Subtract. Worst-case linear in a+b.",
      code: `public class GcdSub {
    static int gcd(int a, int b) {
        while (a != b) { if (a > b) a -= b; else b -= a; }
        return a;
    }
    public static void main(String[] args) {
        System.out.println(gcd(30, 18));
    }
    // Input : 30,18
    // Output: 6
}` },
    { tab: "Optimal", file: "ExGcd.java",
      intro: "Iterative extended Euclid and modular inverse.",
      highlight: "3-16",
      code: `public class ExGcd {
    static long gcd(long a, long b) { return b == 0 ? a : gcd(b, a % b); }
    static long[] exgcd(long a, long b) {
        long x = 1, y = 0, x1 = 0, y1 = 1;
        while (b != 0) {
            long q = a / b;
            long nb = a % b; a = b; b = nb;
            long nx = x - q * x1; x = x1; x1 = nx;
            long ny = y - q * y1; y = y1; y1 = ny;
        }
        return new long[] {a, x, y};
    }
    static long inv(long a, long m) {
        long[] g = exgcd(a, m);
        if (g[0] != 1) return -1;
        long x = g[1] % m;
        return x < 0 ? x + m : x;
    }
    public static void main(String[] args) {
        System.out.println(gcd(30, 18));
        System.out.println(inv(7, 30));
    }
    // Input : gcd 30,18 and inv 7 mod 30
    // Output: 6
    //         13
}` },
    { tab: "Template", file: "Diophantine.java",
      intro: "One particular solution of ax+by=c, or null.",
      code: `public class Diophantine {
    static long[] exgcd(long a, long b) {
        if (b == 0) return new long[] {a, 1, 0};
        long[] r = exgcd(b, a % b);
        return new long[] {r[0], r[2], r[1] - (a / b) * r[2]};
    }
    static long[] solve(long a, long b, long c) {
        long[] t = exgcd(a, b);
        if (c % t[0] != 0) return null;
        long k = c / t[0];
        return new long[] {t[1] * k, t[2] * k};
    }
    public static void main(String[] args) {
        long[] s = solve(30, 18, 12);
        System.out.println(s[0] + " " + s[1]);
    }
    // Input : 30x+18y=12
    // Output: -2 4
}` },
  ],
  complexity: {
    time: "O(log min(a,b))",
    space: "O(1) iterative / O(log) recursive",
    derivation: [
      "<p>Each remainder is at most 2/3 of the previous (Lam\u00e9). Worst case consecutive Fibonacci numbers, O(log_phi a) steps.</p>",
    ],
    compare: [
      ["Subtractive Euclid", "O(a+b)", "O(1)", "Never"],
      ["Euclid %", "O(log)", "O(1)", "gcd/lcm"],
      ["Exgcd", "O(log)", "O(1)", "Inverse, Bezout"],
      ["Fermat inv", "O(log M)", "O(1)", "Prime M only"],
    ],
  },
  pitfalls: [
    { title: "lcm overflow",
      bug: "<code>a*b/gcd</code> overflows before divide.",
      fix: "<code>a / gcd * b</code> in long, gcd first." },
    { title: "Negative a,b",
      bug: "Java % sign follows dividend; gcd may be negative.",
      fix: "Work with abs, or normalise at the end." },
    { title: "Ignoring g!=1 for inverse",
      bug: "You still return x, and a*x \u2261 0 or other junk.",
      fix: "If g!=1, no inverse. For ax\u2261b, need g|b." },
    { title: "Recursive exgcd on Fibonacci 1e18",
      bug: "Depth ~ 90, fine actually. Still prefer iterative.",
      fix: "Iterative is clearer for the x,y updates." },
    { title: "General solution forgetting t step b/g",
      bug: "You add b instead of b/g and skip solutions.",
      fix: "x += (b/g)*t; y -= (a/g)*t." },
  ],
  variants: [
    ["Linear inverses 1..n", "inv[1]=1; inv[i]=P-P/i*inv[P%i]%P.", "O(n)", "combinatorics"],
    ["CRT two mods", "Need inv of m1 mod m2, i.e. exgcd.", "x=a1+m1*((a2-a1)*inv m1)", "inclusion later"],
    ["Lattice points on (x1,y1)-(x2,y2)", "gcd(|x2-x1|,|y2-y1|)-1 interior.", "Pick's theorem cousin", "geometry"],
  ],
  followups: [
    ["Why does Euclid terminate?",
      "<p>Remainders are non-negative and strictly decrease. gcd is preserved because a divisor of a,b divides a%b and conversely.</p>"],
    ["Binary GCD?",
      "<p>Stein: divide out 2, then subtract odds. Good on huge bit-integers. For 64-bit, % is faster in Java.</p>"],
    ["Frobenius coin problem?",
      "<p>For coprime a,b the largest impossible amount is ab-a-b. If gcd&gt;1, all large enough multiples of the gcd are possible, but not all integers.</p>"],
    ["n-dimensional ax=c?",
      "<p>Gcd of all coefficients must divide c. Finding one solution uses iterative exgcd. The kernel is a lattice of rank n-1.</p>"],
  ],
  problems: [
    lc("1979", "find-greatest-common-divisor-of-array", "Easy", "gcd of min and max"),
    lc("365", "water-and-jug-problem", "Medium", "Bezout: z multiple of gcd, z\le a+b"),
    { url: "https://cses.fi/problemset/task/1079", name: "Binomial Coefficients", badge: "gfg", tag: "CSES", level: "Medium", pattern: "inv via Fermat/exgcd" },
    { url: "https://cses.fi/problemset/task/1713", name: "Counting Divisors", badge: "gfg", tag: "CSES", level: "Easy", pattern: "not gcd \u2014 nearby" },
    cf("182D", "Common Divisors", "Medium", "gcd of lengths, string periods"),
    cf("7C", "Line", "Medium", "ax+by+c=0 integer points, exgcd"),
    { url: "https://atcoder.jp/contests/abc105/tasks/abc105_d", name: "ABC 105 D", badge: "atc", tag: "ABC 105D", level: "Medium", pattern: "prefix gcd-ish; use ABC 149 C? ABC 118 C" },
    { url: "https://atcoder.jp/contests/abc118/tasks/abc118_c", name: "ABC 118 C", badge: "atc", tag: "ABC 118C", level: "Easy", pattern: "gcd of all" },
  ],
  recap: [
    "gcd(a,b)=gcd(b,a%b). Never subtract in a loop.",
    "exgcd returns Bezout coefficients.",
    "Inverse iff gcd(a,m)=1; normalise x.",
    "lcm = a/gcd*b in long.",
    "ax+by=c solvable iff gcd|c.",
  ],
  oneliner: "while(b!=0){ t=a%b; a=b; b=t; }  // exgcd also tracks x,y",
}),

/* ============================== combinatorics ========================= */
pack({
  id: "combinatorics",
  difficulty: "Medium",
  readTime: "22 min",
  tagline: "<code>nCr = n!/(r!(n-r)!)</code> in a prime field is three factorials. Lucas handles <code>n &ge; p</code>. Stars-and-bars is <code>C(n+k-1, k-1)</code>.",
  tags: ["nCr", "Lucas", "Catalan", "P1"],
  prereqs: [["Modular Arithmetic", "modular-arithmetic.html"]],
  why: [
    "Counting problems collapse to choose, distribute, or Catalan. Mod a prime, a fact/invFact table makes every nCr O(1). That table is the primitive the rest of combinatorics sits on.",
    "When n is huge and r is tiny, multiply the falling factorial. When n \u2265 p, n! is 0 and you need Lucas: nCr of the base-p digits.",
    "Stars-and-bars, \"at least one\", Catalan, and derangements are the four named shapes. The algebra is short once nCr is cheap.",
  ],
  insight: "nCr is a field element when M is prime and n < M. Precompute fact and invFact once. Lucas is the same formula on base-p digits when n \u2265 M.",
  yes: [
    "Combinations / distributions modulo a prime",
    "Stars-and-bars: n identical items, k labelled bins",
    "Catalan: brackets, BSTs, monotone paths under the diagonal",
    "n \u2264 1e18, r \u2264 1e6 — falling factorial",
    "nCr mod p with n \u2265 p — Lucas",
  ],
  no: [
    "Composite modulus that is not a prime power \u2192 CRT + per-prime fact",
    "Exact huge integer, not a residue \u2192 BigInteger",
    "Order matters and you used nCr instead of nPr",
    "Subset DP is smaller than the closed form you are forcing",
  ],
  table: [
    ["nCr mod p, n < p", "fact[n]*invF[r]*invF[n-r]", "O(1) after O(n)"],
    ["n huge, r small", "falling / r!", "O(r + log p)"],
    ["n \u2265 p", "Lucas on base-p digits", "O(log_p n)"],
    ["n identical, k bins \u22650", "C(n+k-1, k-1)", "stars and bars"],
    ["Catalan n", "C(2n,n)*inv(n+1)", "or C(2n,n)-C(2n,n-1)"],
    ["<strong>Confused with:</strong> nPr", "Order matters: n!/(n-r)!", "Ask if order counts"],
  ],
  constraint: "M prime, n \u2264 1e6 for a fact table. Falling for r \u2264 1e6. Lucas when p \u2264 1e6 and n is huge.",
  core: [
    "Build fact[0..n] and invFact (one inverse at n, then walk down). nCr = 0 if r<0 or r>n. Stars-and-bars: non-neg solutions of x_1+...+x_k=n is C(n+k-1, k-1).",
    "Lucas: while n or r is nonzero, multiply nCr(n%p, r%p) (0 if a digit of r exceeds n), then n/=p, r/=p. Catalan = C(2n,n)*inv(n+1).",
  ],
  invariant: "<p>C(n,r)=C(n-1,r)+C(n-1,r-1) in Z and in a field. Lucas is that recurrence in base p via (1+x)^n \u2261 \u220f (1+x)^{n_i p^i} (mod p).</p>",
  array: [1, 5, 10, 10, 5, 1],
  arrayLabel: "C(5,k) =",
  indexLabels: ["0", "1", "2", "3", "4", "5"],
  vars: ["n", "r", "val"],
  frames: [
    { note: "Pascal row n=5. C(5,0)=1.",
      active: [0], values: { n: 5, r: 0, val: 1 } },
    { note: "C(5,2)=10 = 5*4/2.",
      active: [2], values: { n: 5, r: 2, val: 10 } },
    { note: "C(5,3)=10 by symmetry.",
      active: [3], values: { n: 5, r: 3, val: 10 } },
    { note: "Stars-and-bars: 3 sweets, 2 kids, \u22650: C(4,1)=4.",
      active: [1], values: { n: "bars", r: 1, val: 4 } },
    { note: "Catalan_3 = C(6,3)/4 = 5.",
      active: [3], values: { n: "Cat3", r: 3, val: 5 } },
    { note: "Lucas C(10,3) mod 7: 10=(1,3)_7, 3=(0,3)_7 \u2192 C(1,0)*C(3,3)=1.",
      active: [0], values: { n: 10, r: 3, val: 1 } },
  ],
  mermaid: `flowchart TD
  q["n vs p vs r"] --> small{"n less than p?"}
  small -- yes --> fact["fact table"]
  small -- "n huge r small" --> fall["falling factorial"]
  small -- "n at least p" --> lucas["Lucas digits"]`,
  steps: [
    "<strong>Pick the formula</strong> from n, r, M.",
    "<strong>fact / invFact</strong> if n < M and many queries.",
    "<strong>Falling</strong> if r is small: multiply (n-i)*inv(i+1).",
    "<strong>Lucas</strong> if n \u2265 p: product of digit nCr.",
    "<strong>Stars-and-bars</strong> C(n+k-1, k-1); IE the caps.",
    "<strong>Catalan</strong> C(2n,n)*inv(n+1), or the difference form if p | n+1.",
  ],
  code: [
    { tab: "Brute", file: "NcrPascal.java",
      code: `public class NcrPascal {
    static int nCr(int n, int r) {
        if (r < 0 || r > n) return 0;
        int[] dp = new int[r + 1];
        dp[0] = 1;
        for (int i = 1; i <= n; i++)
            for (int j = Math.min(i, r); j > 0; j--) dp[j] += dp[j - 1];
        return dp[r];
    }
    public static void main(String[] args) {
        System.out.println(nCr(5, 2));
    }
    // Input : 5 choose 2
    // Output: 10
}` },
    { tab: "Optimal", file: "NcrMod.java",
      code: `public class NcrMod {
    static final int M = 1_000_000_007;
    static long[] fact, invF;
    static long modPow(long a, long e) {
        long r = 1;
        for (; e > 0; e >>= 1, a = a * a % M) if ((e & 1) == 1) r = r * a % M;
        return r;
    }
    static void build(int n) {
        fact = new long[n + 1]; invF = new long[n + 1];
        fact[0] = 1;
        for (int i = 1; i <= n; i++) fact[i] = fact[i - 1] * i % M;
        invF[n] = modPow(fact[n], M - 2);
        for (int i = n; i > 0; i--) invF[i - 1] = invF[i] * i % M;
    }
    static long nCr(int n, int r) {
        if (r < 0 || r > n) return 0;
        return fact[n] * invF[r] % M * invF[n - r] % M;
    }
    public static void main(String[] args) {
        build(20);
        System.out.println(nCr(10, 3));
        System.out.println(nCr(6, 3) * modPow(4, M - 2) % M);
    }
    // Input : C(10,3) ; Catalan_3
    // Output: 120
    //         5
}` },
    { tab: "Template", file: "Lucas.java",
      code: `public class Lucas {
    static long inv(long a, int p) {
        long r = 1, e = p - 2;
        for (a %= p; e > 0; e >>= 1, a = a * a % p) if ((e & 1) == 1) r = r * a % p;
        return r;
    }
    static long nCrSmall(int n, int r, int p) {
        if (r < 0 || r > n) return 0;
        long a = 1, b = 1;
        for (int i = 0; i < r; i++) { a = a * (n - i) % p; b = b * (i + 1) % p; }
        return a * inv(b, p) % p;
    }
    static long lucas(long n, long r, int p) {
        long ans = 1;
        while (n > 0 || r > 0) {
            ans = ans * nCrSmall((int) (n % p), (int) (r % p), p) % p;
            n /= p; r /= p;
        }
        return ans;
    }
    public static void main(String[] args) {
        System.out.println(lucas(10, 3, 7));
    }
    // Input : C(10,3) mod 7
    // Output: 1
}` },
  ],
  complexity: {
    time: "O(n + log M) preprocess, O(1) nCr; Lucas O(log_p n) with a p-table",
    space: "O(n)",
    derivation: [
      "<p>The factorial table is one pass. Lucas does O(log_p n) digits, each an nCr with args &lt; p.</p>",
    ],
    compare: [
      ["Pascal DP", "O(n r)", "O(r)", "No mod, n<=1000"],
      ["fact table", "O(n + Q)", "O(n)", "n < M"],
      ["Falling", "O(r log M)", "O(1)", "r small"],
      ["Lucas", "O(p + log n)", "O(p)", "n >= p"],
    ],
  },
  pitfalls: [
    { title: "fact[n] when n >= M",
      bug: "fact[n]=0, every choose looks like 0.",
      fix: "Lucas." },
    { title: "Stars-and-bars off-by-one",
      bug: "C(n+k-1, k) is not the number of solutions.",
      fix: "C(n+k-1, k-1)." },
    { title: "Catalan inv(n+1) when p | n+1",
      bug: "Division fails.",
      fix: "Use C(2n,n) - C(2n, n-1)." },
    { title: "Integer / on the falling factorial",
      bug: "Truncation in Z, not the field.",
      fix: "Multiply by inv(i+1) mod M." },
    { title: "Order vs combination",
      bug: "Arrangements are nPr.",
      fix: "Ask whether order matters." },
  ],
  variants: [
    ["Upper negation", "C(-n,k)=(-1)^k C(n+k-1,k).", "stars-and-bars in disguise", ""],
    ["Multinomial", "n! / (n1! n2! ...)", "same fact table", ""],
    ["Derangement", "!n = n! * sum (-1)^k/k!", "IE page", ""],
  ],
  followups: [
    ["Why Lucas?",
      "<p>Freshman's dream: (1+x)^p \u2261 1+x^p (mod p). The coefficient of x^r is the product of digit-wise nCr.</p>"],
    ["Each bin at least 1?",
      "<p>Give one first: C(n-1, k-1), n\u2265k.</p>"],
    ["Is Catalan an integer?",
      "<p>Always. Prefer the difference form mod p if p might divide n+1.</p>"],
    ["n=1e18, r=1e18, p=1e9+7?",
      "<p>Cannot sieve a 1e9 table. The problem will guarantee small r, or a different modulus.</p>"],
  ],
  problems: [
    lc("62", "unique-paths", "Medium", "C(n+m-2, n-1)"),
    lc("96", "unique-binary-search-trees", "Medium", "Catalan"),
    cf("300C", "Beautiful Numbers", "Medium", "nCr times digit counts"),
    cf("1312D", "Count the Arrays", "Medium", "nCr times (n-2) * 2^{n-k-1}"),
    { url: "https://cses.fi/problemset/task/1079", name: "Binomial Coefficients", badge: "gfg", tag: "CSES", level: "Medium", pattern: "fact table" },
    { url: "https://cses.fi/problemset/task/1715", name: "Creating Strings II", badge: "gfg", tag: "CSES", level: "Medium", pattern: "Multinomial n! / freq!" },
    { url: "https://atcoder.jp/contests/abc156/tasks/abc156_d", name: "ABC 156 D", badge: "atc", tag: "ABC 156D", level: "Medium", pattern: "2^n - nCr" },
    lc("77", "combinations", "Medium", "Generate, not count"),
  ],
  recap: [
    "nCr = fact[n]*invF[r]*invF[n-r] for n < p.",
    "Falling factorial when r is small.",
    "Lucas when n \u2265 p.",
    "Stars-and-bars C(n+k-1, k-1).",
    "Catalan = C(2n,n)/(n+1).",
  ],
  oneliner: "nCr = fact[n]*invF[r]%M*invF[n-r]%M;  // Lucas if n>=M",
}),

/* ============================== number-tricks-and-invariants ========== */
pack({
  id: "number-tricks-and-invariants",
  difficulty: "Medium",
  readTime: "20 min",
  tagline: "Parity, gcd, xor, and digit-sum mod 9 are invariants: a move that cannot change them cannot reach a target that differs.",
  tags: ["invariants", "parity", "gcd", "P1"],
  prereqs: [["GCD & Extended Euclid", "gcd-and-extended-euclid.html"]],
  why: [
    "\"Can you reach B from A?\" is often one invariant, not a BFS. If every move preserves I and I(A)\u2260I(B), the answer is no.",
    "Workhorses: parity of a sum or of inversions; gcd of a step on a circle; xor of a pile; n \u2261 digitSum (mod 9).",
    "Sufficiency is a second lemma: same I does not automatically mean reachable. Construct, or name the extra obstruction.",
  ],
  insight: "Name the thing a move cannot change. If the target differs, stop. If it matches, construct or search a smaller space.",
  yes: [
    "Reachability under a short list of algebraic moves",
    "Frog on a circle: gcd(step,n) | distance",
    "15-puzzle / swaps — inversion parity",
    "a[i]+=x, a[j]-=x — conserved sum",
    "Digital-root / multiple-of-9 questions",
  ],
  no: [
    "State graph is already small \u2192 just BFS",
    "Every obvious quantity changes \u2192 maybe no cheap I",
    "You need the number of ways \u2192 DP",
    "Full impartial games \u2192 Grundy page",
  ],
  table: [
    ["Frog on a circle", "gcd(step,n) | dist", "Bezout"],
    ["Adjacent swaps", "inversion parity flips each swap", "15-puzzle adds blank taxicab"],
    ["a[i]+=x, a[j]-=x", "sum (and often gcd of diffs)", "conserved"],
    ["Digit sum", "n \u2261 digits (mod 9)", "mod 9"],
    ["Water jugs", "gcd(capA,capB) | target", "LC 365"],
    ["<strong>Confused with:</strong> a heuristic that sometimes changes", "Not an invariant", "Prove I(move(s))=I(s)"],
  ],
  constraint: "Evaluating I is O(1) or O(n). A matching construction is usually another linear pass.",
  core: [
    "Guess I. Prove I(move(s))=I(s) for every move type. Compare start and target. Different \u21d2 NO.",
    "If equal, construct (often by simulating backwards) or prove the I-level is connected.",
  ],
  invariant: "<p>I is a function of the state such that every legal move preserves I. Different values \u21d2 unreachable. Same I is necessary, not always sufficient.</p>",
  array: [3, 1, 4, 2],
  arrayLabel: "a =",
  vars: ["I", "move", "ok"],
  frames: [
    { note: "[3,1,4,2] has 3 inversions (odd).",
      active: [0, 1], values: { I: "inv=3", move: "—", ok: "odd" } },
    { note: "Adjacent swap 3\leftrightarrow1 flips parity to even.",
      active: [0, 1], values: { I: "inv=2", move: "swap", ok: "even" } },
    { note: "Sorted has 0 inversions. Need an odd number of adjacent swaps from the start.",
      active: [0], values: { I: "parity", move: "odd swaps", ok: "yes" } },
    { note: "Circle n=10, jump +4. gcd=2. 0\u21926 yes; 0\u21925 no.",
      active: [2], values: { I: "gcd=2", move: "jump 4", ok: "6 yes" } },
    { note: "38 \u2192 3+8=11 \u2192 2, and 38%9=2.",
      active: [3], values: { I: "mod9=2", move: "digits", ok: "match" } },
    { note: "If any move type changes I, throw I away.",
      active: [0], values: { I: "check all", move: "all types", ok: "must hold" } },
  ],
  mermaid: `flowchart TD
  s["start"] --> i["I start"]
  t["target"] --> j["I target"]
  i --> c{"equal?"}
  j --> c
  c -- no --> no["impossible"]
  c -- yes --> suf["construct or search"]`,
  steps: [
    "<strong>List the moves</strong> algebraically.",
    "<strong>Guess I</strong> (parity, gcd, sum, xor, colour).",
    "<strong>Prove preservation</strong> on every type.",
    "<strong>Compare</strong> start and target.",
    "<strong>If equal</strong>, construct or argue connectivity.",
    "<strong>Backwards</strong> is often easier.",
  ],
  code: [
    { tab: "Brute", file: "ReachBfs.java",
      code: `import java.util.*;
public class ReachBfs {
    static boolean reach(int start, int target, int n, int step) {
        boolean[] vis = new boolean[n];
        ArrayDeque<Integer> q = new ArrayDeque<>();
        q.add(start); vis[start] = true;
        while (!q.isEmpty()) {
            int u = q.poll();
            if (u == target) return true;
            int v = Math.floorMod(u + step, n);
            if (!vis[v]) { vis[v] = true; q.add(v); }
        }
        return false;
    }
    public static void main(String[] args) {
        System.out.println(reach(0, 6, 10, 4) + " " + reach(0, 5, 10, 4));
    }
    // Input : n=10 step=4, targets 6 and 5
    // Output: true false
}` },
    { tab: "Optimal", file: "GcdReach.java",
      code: `public class GcdReach {
    static long gcd(long a, long b) {
        a = Math.abs(a); b = Math.abs(b);
        while (b != 0) { long t = a % b; a = b; b = t; }
        return a;
    }
    static boolean reach(int start, int target, int n, int step) {
        return Math.floorMod(target - start, n) % gcd(step, n) == 0;
    }
    public static void main(String[] args) {
        System.out.println(reach(0, 6, 10, 4) + " " + reach(0, 5, 10, 4));
    }
    // Input : same
    // Output: true false
}` },
    { tab: "Template", file: "InvParity.java",
      code: `public class InvParity {
    static int inversions(int[] a) {
        int c = 0;
        for (int i = 0; i < a.length; i++)
            for (int j = i + 1; j < a.length; j++) if (a[i] > a[j]) c++;
        return c;
    }
    public static void main(String[] args) {
        System.out.println(inversions(new int[] {3, 1, 4, 2}) % 2);
        System.out.println(inversions(new int[] {1, 2, 3, 4}) % 2);
    }
    // Input : [3,1,4,2] vs sorted
    // Output: 1
    //         0
}` },
  ],
  complexity: {
    time: "O(1) or O(n) to evaluate I",
    space: "O(1)",
    derivation: ["<p>The point is to avoid a search. gcd / xor / inversion parity is linear at worst.</p>"],
    compare: [
      ["BFS states", "O(|S|)", "O(|S|)", "When I is not enough"],
      ["Invariant", "O(n)", "O(1)", "Impossibility"],
      ["I + construct", "O(n log n)", "O(n)", "Full solution"],
      ["Grundy", "O(states)", "O(states)", "Games"],
    ],
  },
  pitfalls: [
    { title: "I not actually preserved",
      bug: "A third move type flips it.",
      fix: "Prove it for a generic move of every type." },
    { title: "Necessity as sufficiency",
      bug: "Same gcd, hidden extra obstruction.",
      fix: "Construct or name the extra I." },
    { title: "Mod 9 vs digital root 9",
      bug: "18 \u2261 0, not 9.",
      fix: "Compare residues." },
    { title: "15-puzzle missing blank taxicab",
      bug: "Permutation parity alone is incomplete on 4\u00d74.",
      fix: "XOR with blank taxicab parity." },
    { title: "BFS after a cheap NO",
      bug: "Wasted.",
      fix: "Check I first." },
  ],
  variants: [
    ["Board colouring", "Knight stays on one colour.", "chess", ""],
    ["Nim xor", "Zero xor is the losing position.", "games page", ""],
    ["Potential", "Strictly decreases — proves termination, not invariance.", "different tool", ""],
  ],
  followups: [
    ["Invariant vs potential?",
      "<p>Invariant is constant. Potential strictly decreases and proves termination.</p>"],
    ["How do you invent I?",
      "<p>Look at what the move adds and subtracts. Try the cheapest quantity that is not 0=0.</p>"],
    ["Two step sizes a and b on a circle?",
      "<p>gcd(a,b,n) | distance.</p>"],
    ["When is same I enough?",
      "<p>When you can reduce every same-I state to a normal form.</p>"],
  ],
  problems: [
    lc("365", "water-and-jug-problem", "Medium", "gcd | target"),
    lc("134", "gas-station", "Medium", "total gas vs cost"),
    cf("230B", "T-primes", "Easy", "Squares of primes"),
    cf("26A", "Almost Prime", "Easy", "Exactly two distinct prime factors"),
    { url: "https://cses.fi/problemset/task/1754", name: "Coin Piles", badge: "gfg", tag: "CSES", level: "Easy", pattern: "2a-b, 2b-a and %3" },
    { url: "https://codeforces.com/problemset/problem/1473/A", name: "Replacing Elements", badge: "cf", tag: "CF 1473A", level: "Easy", pattern: "Min two sum" },
    lc("1033", "moving-stones-until-consecutive", "Medium", "Endpoint gaps"),
    { url: "https://atcoder.jp/contests/abc173/tasks/abc173_c", name: "ABC 173 C", badge: "atc", tag: "ABC 173C", level: "Medium", pattern: "Enumerate contrast" },
  ],
  recap: [
    "I(move(s)) must equal I(s).",
    "Different I \u21d2 impossible.",
    "Workhorses: parity, gcd, sum, xor, mod 9.",
    "Same I needs a construction.",
    "Simulate backwards when forward branches.",
  ],
  oneliner: "if (I(start) != I(target)) return NO; // then construct",
}),

/* ============================== inclusion-exclusion =================== */
pack({
  id: "inclusion-exclusion",
  difficulty: "Hard",
  readTime: "22 min",
  tagline: "|A\u222aB|=|A|+|B|-|A\u2229B|. For n sets the sign is (-1)^{|S|+1}. The same sum counts surjections, derangements, and coprime lattice points.",
  tags: ["inclusion-exclusion", "PIE", "Möbius", "P2"],
  prereqs: [["Combinatorics", "combinatorics.html"], ["Primes & Sieves", "primes-and-sieves.html"]],
  why: [
    "\"How many integers \u2264 n are divisible by 2 or 3 or 5?\" is add singles, subtract pairs, add the triple. The same loop counts derangements and gcd==1 pairs.",
    "In code: loop 2^k subsets of k properties, sign = popcount parity. 2^k times the cost of one intersection must fit.",
    "Möbius inversion packages IE on the divisor lattice: \u03a3_{d|n} \u03bc(d)=[n==1]. Coprime pairs become \u03a3 \u03bc(d) floor(n/d)^2.",
  ],
  insight: "You can count a union if you can count every intersection. An element in exactly r sets is counted C(r,1)-C(r,2)+...=1 time.",
  yes: [
    "Union of k\u226420 sets, each intersection easy",
    "Count \u2264 n coprime to m",
    "Derangements n! \u03a3 (-1)^k/k!",
    "Surjections onto k labels",
    "Stars-and-bars with upper bounds",
  ],
  no: [
    "k=40 unstructured properties \u2192 2^40 dies",
    "Subset DP is cheaper",
    "You cannot count A\u2229B",
    "Just one set",
  ],
  table: [
    ["Union of k", "\u03a3 (-1)^{|S|+1} |\u2229 S|", "2^k loop"],
    ["gcd==1 pairs", "\u03a3 \u03bc(d) floor(n/d)^2", "Möbius"],
    ["Derangement", "n! \u03a3 (-1)^k/k!", "fixed points"],
    ["Upper-bounded bars", "subtract x_i \u2265 L+1", "CF 451E"],
    ["Coprime to m, \u2264 n", "IE on primes of m", "\u03c6 if n=m"],
    ["<strong>Confused with:</strong> 1-minus only", "That is IE for one set", "Do not stop at pairs"],
  ],
  constraint: "k\u226420 for a mask loop. Möbius to n=1e7 is a linear sieve. Floor(n/d) blocks make \u03a3 f(d)floor(n/d) O(\u221an).",
  core: [
    "For mask\u22600, count the intersection of those properties. Sign + for odd popcount (union). Sum.",
    "Möbius: sieve \u03bc; g(n)=\u03a3_{d|n} \u03bc(d) f(n/d). gcd==1 is the textbook application.",
  ],
  invariant: "<p>\u03a3_j C(r,j)(-1)^{j+1} = 1 for r\u22651, so every element in the union is counted once.</p>",
  array: [10, 6, 4, 2],
  arrayLabel: "term =",
  indexLabels: ["U", "A", "B", "A\u2229B"],
  vars: ["step", "term", "acc"],
  frames: [
    { note: "1..10 divisible by 2 or 3: |A|=5, |B|=3.",
      active: [1], values: { step: "singles", term: "5+3", acc: 8 } },
    { note: "Subtract |A\u2229B|=1 \u2192 7. Numbers: 2,3,4,6,8,9,10.",
      active: [3], values: { step: "pair", term: "-1", acc: 7 } },
    { note: "Primes 2,3,5: 5+3+2-1-1-0+0=8.",
      active: [0], values: { step: "3 primes", term: 8, acc: 8 } },
    { note: "!3 = 6*(1-1+1/2-1/6)=2.",
      active: [2], values: { step: "derange", term: 2, acc: 2 } },
    { note: "\u03bc(1..6)=1,-1,-1,0,-1,1.",
      active: [0], values: { step: "mu", term: "pairs", acc: "sum" } },
    { note: "Skip mask 0 for a union; + on odd popcount.",
      active: [0], values: { step: "sign", term: "popcount", acc: "odd+" } },
  ],
  mermaid: `flowchart LR
  u["union"] --> a["plus singles"]
  u --> b["minus pairs"]
  u --> c["plus triples"]`,
  steps: [
    "<strong>Name properties</strong> so intersections are countable.",
    "<strong>Loop masks 1..(1<<k)-1</strong>.",
    "<strong>Sign</strong> from popcount; + if odd.",
    "<strong>Skip</strong> if the product of primes exceeds n.",
    "<strong>Möbius</strong> for divisor-lattice questions.",
    "<strong>Verify k=2</strong> against |A|+|B|-|A\u2229B|.",
  ],
  code: [
    { tab: "Brute", file: "UnionBrute.java",
      code: `public class UnionBrute {
    static int count(int n, int[] p) {
        int c = 0;
        outer:
        for (int x = 1; x <= n; x++)
            for (int v : p) if (x % v == 0) { c++; continue outer; }
        return c;
    }
    public static void main(String[] args) {
        System.out.println(count(10, new int[] {2, 3}));
    }
    // Input : 1..10, div by 2 or 3
    // Output: 7
}` },
    { tab: "Optimal", file: "InclusionExclusion.java",
      code: `public class InclusionExclusion {
    static long unionDiv(long n, int[] p) {
        int k = p.length;
        long ans = 0;
        for (int m = 1; m < (1 << k); m++) {
            long prod = 1;
            int bits = 0;
            boolean ov = false;
            for (int i = 0; i < k; i++) if (((m >> i) & 1) == 1) {
                bits++;
                if (prod > n / p[i]) { ov = true; break; }
                prod *= p[i];
            }
            if (ov) continue;
            long term = n / prod;
            ans += (bits % 2 == 1) ? term : -term;
        }
        return ans;
    }
    public static void main(String[] args) {
        System.out.println(unionDiv(10, new int[] {2, 3}));
        System.out.println(unionDiv(10, new int[] {2, 3, 5}));
    }
    // Input : 10 with {2,3} and {2,3,5}
    // Output: 7
    //         8
}` },
    { tab: "Template", file: "MobiusGcd.java",
      code: `import java.util.*;
public class MobiusGcd {
    static int[] mu;
    static void sieve(int n) {
        mu = new int[n + 1];
        int[] spf = new int[n + 1];
        mu[1] = 1;
        List<Integer> pr = new ArrayList<>();
        for (int i = 2; i <= n; i++) {
            if (spf[i] == 0) { spf[i] = i; pr.add(i); mu[i] = -1; }
            for (int p : pr) {
                long v = (long) i * p;
                if (v > n) break;
                spf[(int) v] = p;
                mu[(int) v] = (i % p == 0) ? 0 : -mu[i];
                if (i % p == 0) break;
            }
        }
    }
    static long coprimePairs(int n) {
        sieve(n);
        long ans = 0;
        for (int d = 1; d <= n; d++) ans += (long) mu[d] * (n / d) * (n / d);
        return ans;
    }
    public static void main(String[] args) {
        System.out.println(coprimePairs(3));
    }
    // Input : pairs in 1..3 with gcd 1
    // Output: 7
}` },
  ],
  complexity: {
    time: "O(2^k T); Möbius O(n) + O(\u221an) floor sum",
    space: "O(n) for \u03bc",
    derivation: ["<p>2^k subsets. Möbius is a linear sieve. Floor values group into O(\u221an) blocks.</p>"],
    compare: [
      ["Brute universe", "O(U k)", "O(1)", "U small"],
      ["IE 2^k", "O(2^k T)", "O(k)", "k<=20"],
      ["Möbius + floor", "O(n+\u221an)", "O(n)", "gcd"],
      ["SOS DP", "O(n 2^n)", "O(2^n)", "subset zeta"],
    ],
  },
  pitfalls: [
    { title: "Wrong sign / empty mask",
      bug: "Mask 0 adds the universe.",
      fix: "Skip 0; + on odd popcount." },
    { title: "Product overflow",
      bug: "lcm wraps; n/prod is junk.",
      fix: "If prod would exceed n, skip." },
    { title: "\u03bc of a square not zeroed",
      bug: "mu[i*p]=-mu[i] even when p|i.",
      fix: "If p|i, \u03bc=0." },
    { title: "Derangement integer /",
      bug: "n!/k! must stay exact.",
      fix: "Running mul or mods." },
    { title: "min(|A|,|B|) as intersection",
      bug: "Not the size of A\u2229B.",
      fix: "Count from the structure (lcm, both constraints)." },
  ],
  variants: [
    ["Bars + caps", "Subtract C(n'+k-1, k-1) per exceeding subset.", "CF 451E", ""],
    ["Surjections", "\u03a3 (-1)^{k-i} C(k,i) i^n", "onto functions", ""],
    ["Subset Möbius", "SOS DP is fast zeta on 2^[n].", "sos-dp", ""],
  ],
  followups: [
    ["Why is an r-set element counted once?",
      "<p>\u03a3 C(r,j)(-1)^{j+1}=1 for r\u22651.</p>"],
    ["Möbius vs raw IE?",
      "<p>Möbius is IE on the divisor poset with \u03bc precomputed.</p>"],
    ["n=1e12 in \u03a3 \u03bc(d) floor(n/d)^2?",
      "<p>Cannot sieve to 1e12. Need Du-Jiao / min_25, or n\u22641e7.</p>"],
    ["Three-set formula?",
      "<p>|A\u222aB\u222aC|=|A|+|B|+|C|-|AB|-|AC|-|BC|+|ABC|.</p>"],
  ],
  problems: [
    lc("1201", "ugly-number-iii", "Medium", "Binary search + IE of 3"),
    lc("992", "subarrays-with-k-different-integers", "Hard", "at-most k minus at-most k-1"),
    cf("451E", "Devu and Flowers", "Hard", "Stars-and-bars + IE"),
    cf("449D", "Jzzhu and Numbers", "Hard", "SOS / IE on bits"),
    { url: "https://cses.fi/problemset/task/2185", name: "Prime Multiples", badge: "gfg", tag: "CSES", level: "Medium", pattern: "IE on primes" },
    { url: "https://atcoder.jp/contests/abc172/tasks/abc172_d", name: "ABC 172 D", badge: "atc", tag: "ABC 172D", level: "Medium", pattern: "Sum of d(n)" },
    { url: "https://codeforces.com/problemset/problem/628/D", name: "Magic Numbers", badge: "cf", tag: "CF 628D", level: "Hard", pattern: "Digit DP" },
    { url: "https://www.spoj.com/problems/NDIVPHI/", name: "NDIVPHI", badge: "gfg", tag: "SPOJ", level: "Hard", pattern: "n/phi max" },
  ],
  recap: [
    "Union = plus singles, minus pairs, plus triples.",
    "Skip empty mask; + on odd popcount.",
    "An r-set element is counted once.",
    "Möbius is IE on divisors.",
    "Overflow-check the product.",
  ],
  oneliner: "for mask: ans += (popcount odd ? +1 : -1) * intersection(mask);",
}),
/* ============================== matrix-exponentiation ================= */
pack({
  id: "matrix-exponentiation",
  difficulty: "Hard",
  readTime: "24 min",
  tagline: "A linear recurrence <code>x<sub>n</sub> = &Sigma; a<sub>i</sub> x<sub>n-i</sub></code> is one matrix multiply. Binary exponentiation of that matrix jumps <code>n</code> steps in <code>O(k&sup3; log n)</code>.",
  tags: ["matrix expo", "linear recurrence", "P2"],
  prereqs: [
    ["Modular Arithmetic", "modular-arithmetic.html"],
    ["Recurrences", "../00-foundations/recurrences-and-master-theorem.html"],
  ],
  why: [
    "Fibonacci in O(log n), \"number of ways to tile a 2×n after 10^18 steps\", and graph walks of length n are the same object: a vector of last-k states times a companion / adjacency matrix.",
    "If you can write S_{t+1} = A S_t, then S_n = A^n S_0. Binary exponentiation of A is the only extra skill: multiply k×k matrices, square, multiply-by-A when the bit is on.",
    "n ≤ 10^18 is the tell. k is the state size (2 for Fib, 3–6 for many tilings, |V| for walks). k³ log n must fit; k = 100 is already 1e6 * 60 multiplies — borderline.",
  ],
  insight: "The companion matrix of a linear recurrence is unique once you write the state as a column of the last k terms. After that it is only fast pow.",
  yes: [
    "n-th Fibonacci / Tribonacci / linear recurrence, n ≤ 10^18",
    "Ways to tile / hop with a fixed profile after n steps",
    "Number of walks of length n in a small graph (A^n[u][v])",
    "Sum of a linear recurrence, or \"first n Fibonaccis\" via a larger matrix",
    "DP transition is a fixed linear map, you need the n-th iterate",
  ],
  no: [
    "Non-linear recurrences (x_n = x_{n-1}^2) — matrix expo does not apply",
    "n ≤ 1e6 and k huge — just iterate the recurrence",
    "Shortest path — min-plus \"multiplication\" is a different semiring (and usually not what they want)",
    "Arbitrary DP with max / min that is not a linear combination",
  ],
  table: [
    ["Fibonacci n", "[[1,1],[1,0]]^n", "2×2 expo"],
    ["k-term recurrence", "companion k×k", "O(k³ log n)"],
    ["Walks of length n", "adjacency^n", "A[u][v] ways"],
    ["Sum of first n terms", "augment the state with the prefix", "(k+1)×(k+1)"],
    ["Mod P", "every multiply % P", "same code"],
    ["<strong>Confused with:</strong> binary expo of a scalar", "Same loop, matrices instead of longs", "modPow is the 1×1 case"],
  ],
  constraint: "<code>n &le; 10^{18}</code>, <code>k &le; 80</code> in Java if you are careful; <code>k &le; 20</code> is comfortable. Always take the answer modulo the required prime.",
  core: [
    "Fibonacci: state [F_n, F_{n-1}]^T = [[1,1],[1,0]] [F_{n-1}, F_{n-2}]^T. Then [F_n, F_{n-1}] = A^{n-1} [F_1, F_0].",
    "Multiply two k×k matrices in O(k³). Fast pow: res = I, while n>0: if n odd res = res*A; A = A*A; n >>= 1. Use long and reduce mod P every multiply.",
  ],
  invariant: "<p>If S_{t+1} = A S_t for every t, then S_{t+n} = A^n S_t. Binary exponentiation uses A^{2m} = (A^m)² and A^{2m+1} = A · A^{2m}.</p>",
  array: [0, 1, 1, 2, 3, 5, 8],
  arrayLabel: "F =",
  vars: ["n", "bit", "Fn"],
  frames: [
    { note: "Want F_10. A = [[1,1],[1,0]], start from [F1,F0]=[1,0].",
      active: [1], values: { n: 10, bit: "init", Fn: "—" } },
    { note: "10 = 1010₂. Square to A², A⁴, A⁸. Multiply A² and A⁸.",
      active: [2], values: { n: 10, bit: "1010", Fn: "pow" } },
    { note: "A² gives F_2,F_1. A⁴ gives F_4,F_3. A⁸ gives F_8,F_7.",
      active: [4], values: { n: 8, bit: "A8", Fn: 21 } },
    { note: "A^10 = A^8 A^2 → F_10 = 55.",
      active: [6], values: { n: 10, bit: "done", Fn: 55 } },
    { note: "Same A^n[0][1] or A^n[0][0] depending on the base vector — pick one convention and test F_10.",
      active: [6], values: { n: 10, bit: "check", Fn: 55 } },
    { note: "For walks, A is the adjacency matrix; A^n[u][v] is walks u→v of length n.",
      best: [6], values: { n: "n", bit: "graph", Fn: "A^n" } },
  ],
  mermaid: `flowchart TD
  rec["S t+1 = A S t"] --> pow["S n = A to the n times S 0"]
  pow --> bin["binary exponentiation"]
  bin --> sq["square A"]
  bin --> mul["multiply into result when bit is on"]`,
  steps: [
    "<strong>Write the state vector</strong> of size k (last k terms, or |V| nodes).",
    "<strong>Write A</strong> so that S_{t+1} = A S_t. Check one step by hand.",
    "<strong>Identity</strong> res = I. Fast-pow A^n with O(k³) multiplies.",
    "<strong>Reduce mod P</strong> after every cell multiply. Use long.",
    "<strong>Multiply</strong> A^n by S_0 to read the answer cell.",
    "<strong>Off-by-one:</strong> Fib A^{n-1} vs A^n — test n=0,1,10.",
  ],
  code: [
    { tab: "Brute", file: "FibLoop.java",
      code: `public class FibLoop {
    static long fib(int n) {
        if (n <= 1) return n;
        long a = 0, b = 1;
        for (int i = 2; i <= n; i++) { long c = a + b; a = b; b = c; }
        return b;
    }
    public static void main(String[] args) {
        System.out.println(fib(10));
    }
    // Input : n=10
    // Output: 55
}` },
    { tab: "Optimal", file: "FibMat.java",
      intro: "2×2 matrix expo, O(log n).",
      highlight: "14-24",
      code: `public class FibMat {
    static final long MOD = 1_000_000_007L;
    static long[][] mul(long[][] a, long[][] b) {
        long[][] c = new long[2][2];
        for (int i = 0; i < 2; i++)
            for (int k = 0; k < 2; k++)
                for (int j = 0; j < 2; j++)
                    c[i][j] = (c[i][j] + a[i][k] * b[k][j]) % MOD;
        return c;
    }
    static long[][] pow(long[][] a, long n) {
        long[][] r = {{1, 0}, {0, 1}};
        while (n > 0) {
            if ((n & 1) == 1) r = mul(r, a);
            a = mul(a, a);
            n >>= 1;
        }
        return r;
    }
    static long fib(long n) {
        if (n == 0) return 0;
        return pow(new long[][] {{1, 1}, {1, 0}}, n - 1)[0][0];
    }
    public static void main(String[] args) {
        System.out.println(fib(10));
    }
    // Input : n=10
    // Output: 55
}` },
    { tab: "Template", file: "MatPow.java",
      intro: "k×k multiply + pow. Plug any companion / adjacency matrix.",
      code: `public class MatPow {
    static long[][] mul(long[][] a, long[][] b, long MOD) {
        int n = a.length;
        long[][] c = new long[n][n];
        for (int i = 0; i < n; i++)
            for (int k = 0; k < n; k++) if (a[i][k] != 0)
                for (int j = 0; j < n; j++)
                    c[i][j] = (c[i][j] + a[i][k] * b[k][j]) % MOD;
        return c;
    }
    static long[][] pow(long[][] a, long e, long MOD) {
        int n = a.length;
        long[][] r = new long[n][n];
        for (int i = 0; i < n; i++) r[i][i] = 1;
        while (e > 0) {
            if ((e & 1) == 1) r = mul(r, a, MOD);
            a = mul(a, a, MOD);
            e >>= 1;
        }
        return r;
    }
    public static void main(String[] args) {
        long[][] A = {{1, 1}, {1, 0}};
        System.out.println(pow(A, 9, 1_000_000_007L)[0][0]);
    }
    // Input : Fib companion ^ 9 → F_10
    // Output: 55
}` },
  ],
  complexity: {
    time: "O(k³ log n)",
    space: "O(k²)",
    derivation: [
      "<p>log n squarings, each a k×k multiply of k³ cell products. Sparse A (adjacency of a path) can drop a factor.</p>",
    ],
    compare: [
      ["Loop the recurrence", "O(n k)", "O(k)", "n ≤ 1e7"],
      ["Matrix expo", "O(k³ log n)", "O(k²)", "n ≤ 1e18"],
      ["Doubling Fibonacci identities", "O(log n)", "O(1)", "Fib only"],
      ["NTT / generating functions", "heavier", "heavier", "many recurrences at once"],
    ],
  },
  pitfalls: [
    { title: "n = 0 or n = 1",
      bug: "You pow(A, n-1) and n-1 underflows, or you return A[0][0] for F_0.",
      fix: "Special-case 0. Test F_0=0, F_1=1, F_10=55." },
    { title: "int overflow before mod",
      bug: "a[i][k]*b[k][j] exceeds 2^63 if MOD ~ 1e9 and you accumulated wrong.",
      fix: "Both factors already % MOD; 1e9*1e9 fits in long. Bigger MOD needs care." },
    { title: "Result matrix vs base vector",
      bug: "You print A^n[0][0] but the identity you proved was A^{n-1} v.",
      fix: "Write one step on paper; match the textbook pair (F_n, F_{n-1})." },
    { title: "Forgetting the modulus on the identity",
      bug: "I is fine; intermediate cells exceed MOD and you only reduce at the end.",
      fix: "Reduce in mul, every cell." },
    { title: "Min-plus for shortest paths of length n",
      bug: "You +/* instead of min/+. That counts walks, not shortest paths.",
      fix: "Walks = ordinary (+, *). Shortest k-edge path = (min, +) semiring — different code, rarely needed." },
  ],
  variants: [
    ["Prefix sums of Fib", "State [F_n, F_{n-1}, S_n]; one extra row/column adds F_n into S.", "3×3", "sum of first n"],
    ["Periodic / Pisano", "Fib mod P is periodic; matrix expo still wins for 1e18.", "same code", "CSES"],
    ["Graph walks", "A = adjacency (0/1 or weighted). A^n[u][v] ways.", "k = |V|", "CF walks"],
  ],
  followups: [
    ["Why companion matrix looks like that?",
      "<p>The first row is the coefficients. The remaining rows are shifts: they copy F_{n-1} down to F_{n-2}, and so on. That is what \"remember the last k-1 terms\" means in linear algebra.</p>"],
    ["Can you do better than k³?",
      "<p>Strassen helps only for huge k. For a linear recurrence, Berlekamp-Massey + Kitamasa is O(k² log n) or better — overkill unless k ~ 1000.</p>"],
    ["How do you get the sum of a geometric of matrices?",
      "<p>I + A + … + A^{n-1} has a closed doubling: if n even, (I+A^{n/2})(I+…+A^{n/2-1}). Or augment the matrix.</p>"],
    ["Interview: Fib O(log n) without matrices?",
      "<p>F(2n)=F(n)(F(n+1)+F(n-1)), F(2n+1)=F(n)²+F(n+1)². Same log n, no arrays. Matrices generalise; identities are Fib-only.</p>"],
  ],
  problems: [
    lc("70", "climbing-stairs", "Easy", "Fib, n small — contrast"),
    lc("509", "fibonacci-number", "Easy", "Implement expo or loop"),
    lc("1137", "n-th-tribonacci-number", "Easy", "3×3 companion"),
    lc("1220", "count-vowels-permutation", "Hard", "5×5 adjacency expo"),
    lc("1411", "number-of-ways-to-paint-n-x-3-grid", "Hard", "Profile + expo"),
    { url: "https://cses.fi/problemset/task/1722", name: "Fibonacci Numbers", badge: "gfg", tag: "CSES", level: "Medium", pattern: "Fib mod 1e9+7, n ≤ 1e18" },
    cf("166E", "Tetrahedron", "Medium", "4-state walks, A^n"),
    cf("1117D", "Magic Gems", "Hard", "Linear recurrence + matrix expo"),
    { url: "https://atcoder.jp/contests/dp/tasks/dp_r", name: "Walk", badge: "atc", tag: "AtCoder DP-R", level: "Hard", pattern: "Adjacency^n, count walks" },
  ],
  recap: [
    "Linear map S→AS, then S_n = A^n S_0.",
    "Companion matrix for a k-term recurrence.",
    "Binary expo of matrices, O(k³ log n).",
    "Mod every multiply; test n=0,1,10.",
    "Walks of length n are the same A^n on the graph.",
  ],
  oneliner: "while (n>0) { if ((n&1)==1) r=mul(r,A); A=mul(A,A); n>>=1; }",
}),

/* ============================== geometry-basics ======================= */
pack({
  id: "geometry-basics",
  difficulty: "Hard",
  readTime: "24 min",
  tagline: "Points are <code>long</code> pairs. Orientation is a cross product. Almost every elementary geometry test — left of a line, segment intersection, polygon area — is that one signed area.",
  tags: ["geometry", "cross product", "orientation", "P2"],
  prereqs: [["Complexity Analysis", "../00-foundations/complexity-analysis.html"]],
  why: [
    "Contest geometry is not trigonometry. You almost never need sin, and you almost always need the sign of (b−a)×(c−a) to decide whether c is left, right, or collinear with directed line ab.",
    "Integer coordinates up to 1e9 make every multiply a 2e9×2e9 = 4e18 candidate — it fits in long, not in int. Division is the enemy (it loses the exact predicate). Prefer comparisons of cross products to comparing doubles.",
    "Area of a polygon is the shoelace sum of consecutive crosses. Point-in-polygon is winding or ray-crossing, both built from the same orientation tests. Convex hull is the next page; this page is the toolkit it sits on.",
  ],
  insight: "cross(a,b) = a.x*b.y − a.y*b.x is twice the signed area of the triangle 0,a,b. Its sign is orientation. Overflow of that multiply is the #1 WA.",
  yes: [
    "Is C left of directed line AB? Are three points collinear?",
    "Do two segments intersect (properly or including touching)?",
    "Polygon area, convex? point in triangle / polygon",
    "Closest pair (sweep or D&C) as a follow-up",
    "Integer coordinates, exact predicates required",
  ],
  no: [
    "Convex hull construction — next page (this page is the predicates)",
    "Rotating calipers / diameter of a hull — after you have the hull",
    "3-D / spherical geometry",
    "Need a floating-point intersection point as output and the statement allows 1e-9 error — still compute with long predicates first",
  ],
  table: [
    ["Left / right / on", "sign of cross(b-a, c-a)", "orientation"],
    ["Segment intersect", "straddle tests + on-segment", "4 orientations"],
    ["Polygon area", "shoelace of consecutive crosses", "abs/2"],
    ["Point in convex polygon", "all turns the same way", "n tests or log n"],
    ["Point in general polygon", "ray crossings / winding", "O(n)"],
    ["<strong>Confused with:</strong> dot product", "dot is angle / projection; cross is orientation", "dot=0 ⟂, cross=0 collinear"],
  ],
  constraint: "<code>|x|,|y| &le; 1e9</code> → use <code>long</code> for every cross. <code>|x| &le; 1e18</code> needs BigInteger or a careful 128-bit emulation. n ≤ 1e5 for O(n) scans; closest pair is O(n log n).",
  core: [
    "Point = (x, y). sub(a,b) = a-b. cross(u,v) = u.x*v.y - u.y*v.x. orient(a,b,c) = sign(cross(b-a, c-a)): +1 left, −1 right, 0 collinear.",
    "Segments AB, CD intersect properly if orient(A,B,C) and orient(A,B,D) have opposite signs and the other pair too. Inclusive intersection also accepts the collinear-and-on-segment case (bounding-box + between).",
  ],
  invariant: "<p>orient(a,b,c) &gt; 0 iff you turn left at b walking a→b→c. Shoelace: twice signed area = Σ (p_i × p_{i+1}) with p_n = p_0. Positive means CCW.</p>",
  array: [0, 0, 2, 0, 1, 2],
  arrayLabel: "xy =",
  indexLabels: ["Ax", "Ay", "Bx", "By", "Cx", "Cy"],
  vars: ["cross", "orient", "area2"],
  frames: [
    { note: "A=(0,0), B=(2,0), C=(1,2). u=B-A=(2,0), v=C-A=(1,2).",
      active: [0, 1, 2, 3, 4, 5], values: { cross: "—", orient: "—", area2: "—" } },
    { note: "cross = 2*2 − 0*1 = 4. Positive → C is left of AB.",
      active: [4, 5], values: { cross: 4, orient: "+1", area2: 4 } },
    { note: "If C were (1,-2), cross = −4, right turn.",
      active: [4, 5], values: { cross: -4, orient: "-1", area2: 4 } },
    { note: "If C=(3,0), cross=0, collinear. On-segment? 0≤3≤2 is false.",
      active: [4, 5], values: { cross: 0, orient: 0, area2: 0 } },
    { note: "Triangle area = |cross|/2 = 2.",
      best: [0, 2, 4], values: { cross: 4, orient: "+1", area2: 4 } },
    { note: "Shoelace on a polygon is the sum of these consecutive crosses.",
      best: [0, 2, 4], values: { cross: "Σ", orient: "CCW", area2: "2Area" } },
  ],
  mermaid: `flowchart TD
  pts["points A B C"] --> cr["cross of B-A and C-A"]
  cr --> sgn{"sign?"}
  sgn -- plus --> left["C left of AB"]
  sgn -- minus --> right["C right of AB"]
  sgn -- zero --> col["collinear"]`,
  steps: [
    "<strong>Store</strong> coordinates as long. Never int for a cross.",
    "<strong>orient(a,b,c)</strong> = Long.signum(cross(b-a, c-a)).",
    "<strong>onSeg(a,b,p):</strong> collinear and p in the bounding box of ab.",
    "<strong>intersect(a,b,c,d):</strong> proper-straddle OR (collinear and onSeg).",
    "<strong>area2(poly):</strong> sum cross(p[i], p[i+1]), wrap last to first.",
    "<strong>point in convex:</strong> all orients against edges have the same sign (or 0 on boundary — read the statement).",
  ],
  code: [
    { tab: "Brute", file: "Orient.java",
      code: `public class Orient {
    static long cross(long x1, long y1, long x2, long y2) {
        return x1 * y2 - y1 * x2;
    }
    public static void main(String[] args) {
        System.out.println(Long.signum(cross(2, 0, 1, 2)));
    }
    // Input : AB=(2,0) AC=(1,2)
    // Output: 1
}` },
    { tab: "Optimal", file: "Geom.java",
      intro: "Orientation, on-segment, inclusive segment intersection, shoelace.",
      highlight: "8-28",
      code: `public class Geom {
    static class P {
        long x, y;
        P(long x, long y) { this.x = x; this.y = y; }
        P sub(P o) { return new P(x - o.x, y - o.y); }
    }
    static long cross(P a, P b) { return a.x * b.y - a.y * b.x; }
    static int orient(P a, P b, P c) { return Long.signum(cross(b.sub(a), c.sub(a))); }
    static boolean onSeg(P a, P b, P p) {
        if (orient(a, b, p) != 0) return false;
        return Math.min(a.x, b.x) <= p.x && p.x <= Math.max(a.x, b.x)
            && Math.min(a.y, b.y) <= p.y && p.y <= Math.max(a.y, b.y);
    }
    static boolean intersect(P a, P b, P c, P d) {
        int o1 = orient(a, b, c), o2 = orient(a, b, d);
        int o3 = orient(c, d, a), o4 = orient(c, d, b);
        if (o1 != o2 && o3 != o4) return true;
        return (o1 == 0 && onSeg(a, b, c)) || (o2 == 0 && onSeg(a, b, d))
            || (o3 == 0 && onSeg(c, d, a)) || (o4 == 0 && onSeg(c, d, b));
    }
    static long area2(P[] p) {
        long s = 0;
        for (int i = 0, n = p.length; i < n; i++) s += cross(p[i], p[(i + 1) % n]);
        return s;
    }
    public static void main(String[] args) {
        P a = new P(0, 0), b = new P(2, 0), c = new P(1, 2);
        System.out.println(orient(a, b, c));
        System.out.println(area2(new P[] {a, b, c}));
    }
    // Input : triangle (0,0)(2,0)(1,2)
    // Output: 1
    //         4
}` },
    { tab: "Template", file: "PointInConvex.java",
      intro: "Point in a CCW convex polygon, including boundary.",
      code: `public class PointInConvex {
    static class P { long x, y; P(long x, long y) { this.x = x; this.y = y; } }
    static long cross(P a, P b, P c) {
        return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    }
    static boolean inside(P[] h, P q) {
        int n = h.length;
        for (int i = 0; i < n; i++)
            if (cross(h[i], h[(i + 1) % n], q) < 0) return false;
        return true;
    }
    public static void main(String[] args) {
        P[] h = { new P(0, 0), new P(4, 0), new P(4, 3), new P(0, 3) };
        System.out.println(inside(h, new P(2, 1)));
        System.out.println(inside(h, new P(5, 1)));
    }
    // Input : square [0,4]x[0,3], query (2,1) then (5,1)
    // Output: true
    //         false
}` },
  ],
  complexity: {
    time: "O(1) per predicate; O(n) area / point-in-polygon",
    space: "O(1) extra",
    derivation: [
      "<p>Each test is a constant number of long multiplies. Closest pair and hull are the log-factor algorithms on the next page / D&C.</p>",
    ],
    compare: [
      ["Double + atan2", "unstable", "O(1)", "Never for predicates"],
      ["long cross", "exact at 1e9", "O(1)", "Default"],
      ["BigInteger cross", "exact at 1e18", "slow", "When |x| > 2e9"],
      ["Ray + double", "fragile on edges", "O(n)", "Prefer winding + long"],
    ],
  },
  pitfalls: [
    { title: "int cross",
      bug: "1e9 * 1e9 overflows int (and even 2e9*2e9 needs long).",
      fix: "Every x, y, and every product is long." },
    { title: "Comparing doubles of areas",
      bug: "You divide by 2 or take hypot and then compare to 0 with 1e-9.",
      fix: "Compare 2*area (the raw cross) to 0. No division." },
    { title: "Collinear overlap missed",
      bug: "Proper-straddle only; two collinear overlapping segments report false.",
      fix: "Handle o==0 && onSeg for inclusive intersection." },
    { title: "CW vs CCW polygon",
      bug: "area2 is negative; point-in-convex rejects interior points.",
      fix: "Reverse if area2 < 0, or accept both signs consistently." },
    { title: "On-boundary policy",
      bug: "The statement says strictly inside and you counted the edge.",
      fix: "Treat orient==0 as a separate case; read the problem once." },
  ],
  variants: [
    ["Closest pair", "Sort by x, D&C, scan a strip of width d.", "O(n log n)", "CSES"],
    ["Line intersection point", "Solve the 2×2; output doubles after the predicate says they meet.", "only if they intersect", "constructive"],
    ["Rotating calipers", "After hull: antipodal pairs for diameter / width.", "next page's client", "diameter"],
  ],
  followups: [
    ["Why not atan2 to sort by angle?",
      "<p>You can, with care. Safer: sort by quadrant + orient (cross) so the order is exact. atan2 is a double.</p>"],
    ["Dot vs cross?",
      "<p>dot(u,v) = |u||v|cos. Sign of dot is acute/obtuse. Sign of cross is left/right. Length² is dot(u,u) — no sqrt until output.</p>"],
    ["How do you test collinear in a degenerate triangle?",
      "<p>orient==0. Area is 0. Do not use an epsilon on integer input.</p>"],
    ["Point in non-convex polygon?",
      "<p>Ray to +∞ on x, count crossings, skip vertices carefully (only count an edge if it straddles the ray in y). Or winding number with orient.</p>"],
  ],
  problems: [
    lc("587", "erect-the-fence", "Hard", "Hull — next page, uses these predicates"),
    lc("469", "convex-polygon", "Medium", "All turns same sign"),
    lc("1401", "circle-and-rectangle-overlapping", "Medium", "Clamp point, compare d²"),
    lc("1035", "uncrossed-lines", "Medium", "Not geometry — contrast LCS"),
    { url: "https://cses.fi/problemset/task/2189", name: "Point Location Test", badge: "gfg", tag: "CSES", level: "Easy", pattern: "orient" },
    { url: "https://cses.fi/problemset/task/2190", name: "Line Segment Intersection", badge: "gfg", tag: "CSES", level: "Medium", pattern: "inclusive intersect" },
    { url: "https://cses.fi/problemset/task/2191", name: "Polygon Area", badge: "gfg", tag: "CSES", level: "Easy", pattern: "shoelace" },
    cf("166B", "Polygons", "Hard", "Point in convex / hull inclusion"),
    cf("961D", "Pair Of Lines", "Medium", "All points lie on two lines"),
  ],
  recap: [
    "cross is 2×signed area. Sign is orientation.",
    "long for every product. No epsilon on integer predicates.",
    "Segment intersect = straddle + collinear on-seg.",
    "Shoelace = sum of consecutive crosses.",
    "Convex point-in = all turns the same way.",
  ],
  oneliner: "cross(u,v)=u.x*v.y-u.y*v.x; orient=signum(cross(b-a,c-a));",
}),

/* ============================== convex-hull =========================== */
pack({
  id: "convex-hull",
  difficulty: "Hard",
  readTime: "24 min",
  tagline: "Andrew's monotone chain sorts points by (x, y) and builds lower then upper hulls with a left-turn stack — O(n log n) and the default you should type.",
  tags: ["convex hull", "Andrew", "Graham", "P2"],
  prereqs: [["Geometry Basics", "geometry-basics.html"]],
  why: [
    "The convex hull is the smallest convex polygon containing the points. After you have it, diameter, width, farthest pair, and \"does this polygon contain that one\" become walks on a circular sequence.",
    "Andrew's algorithm is Graham scan after a sort by x: walk left-to-right keeping only left turns (lower hull), then right-to-left (upper hull). The stack pops while the last three points do not make a strict CCW turn.",
    "n ≤ 1e5, integer coords. Degenerate all-collinear is a segment (or a point). Interviews want the sort + stack, the left-turn predicate, and what you do with ties (keep or drop middle of an edge — read the statement).",
  ],
  insight: "After sorting by x, the lower hull is the chain you get by refusing right turns. The same walk backwards is the upper hull. Concatenate and drop the duplicated endpoints.",
  yes: [
    "Smallest convex polygon covering the points (\"erect the fence\")",
    "Diameter / farthest pair (rotating calipers on the hull)",
    "Static point-in-convex after one hull + binary search",
    "Minkowski sum of two convex polygons (walk both hulls)",
    "n ≤ 1e5 points, integer coordinates",
  ],
  no: [
    "Dynamic hull (insert/delete online) → Li Chao / CHT / set of tangents, not a one-shot stack",
    "Non-convex outline / alpha shape / concave enclosure",
    "3-D convex hull",
    "You only need the leftmost / min-max x,y — four points, not a hull",
  ],
  table: [
    ["Static hull", "sort + two monotone chains", "Andrew"],
    ["Angular Graham", "sort by polar around lowest point", "same bound, messier ties"],
    ["Diameter", "rotating calipers on hull", "O(n) after hull"],
    ["Dynamic upper hull of lines", "CHT, previous module", "not this stack"],
    ["All collinear", "hull is the two endpoints (or keep the edge)", "statement"],
    ["<strong>Confused with:</strong> CHT hull of lines", "This page is a hull of points", "Different object"],
  ],
  constraint: "<code>n &le; 1e5</code> is O(n log n) sort plus O(n) stack. Coordinates 1e9 → long crosses. Output vertices in CCW order, no consecutive collinear unless asked.",
  core: [
    "Sort unique points by (x, y). If n ≤ 1 return them. Lower: for each point, while the last two + this one are not a left turn, pop. Upper: walk the array backwards with the same rule. Concatenate lower + upper[1..end-1].",
    "Left turn: cross(stack[-2]→stack[-1], stack[-1]→p) > 0 for a strict hull (drop collinear middles). Use ≥ 0 if you must keep collinear edge points.",
  ],
  invariant: "<p>After the lower pass, every consecutive triple on the stack is a left turn, and the chain is the lower envelope from leftmost to rightmost. The upper pass mirrors that. The closed polygon is convex and contains every input point.</p>",
  array: [0, 1, 2, 3, 4],
  arrayLabel: "id =",
  indexLabels: ["A", "B", "C", "D", "E"],
  vars: ["i", "stack", "cross"],
  frames: [
    { note: "Points A(0,0) B(1,1) C(2,0) D(2,2) E(0,2). Sorted by x then y: A,B,C,E,D wait — E is (0,2) so order A,E,B,C,D.",
      active: [0], values: { i: 0, stack: "A", cross: "—" } },
    { note: "Lower: push A, E. Next B: A→E→B is a right turn (E is above). Pop E. A→B is fine. Then C: A-B-C right-ish? B is above AC — pop B. Lower = A,C.",
      active: [2], values: { i: "C", stack: "A C", cross: "pop B" } },
    { note: "D is to the right. A-C-D is left. Lower = A,C,D.",
      active: [4], values: { i: "D", stack: "A C D", cross: "+" } },
    { note: "Upper backwards: D,E,A. D-E-A left. Full hull A,C,D,E.",
      active: [0, 2, 4], values: { i: "up", stack: "A C D E", cross: "CCW" } },
    { note: "B sits inside, never on the hull.",
      active: [1], values: { i: "B", stack: "inside", cross: 0 } },
    { note: "Output CCW from leftmost: A,C,D,E.",
      best: [0, 2, 4], values: { i: "done", stack: "4 verts", cross: "+" } },
  ],
  mermaid: `flowchart TD
  sortP["sort by x then y"] --> low["lower chain: pop while not left turn"]
  low --> up["upper chain: walk backwards"]
  up --> cat["concatenate, drop duplicate ends"]`,
  steps: [
    "<strong>Dedup</strong> identical points. Sort by x, then y.",
    "<strong>build(dir):</strong> empty stack; for each point in order (or reverse), pop while size≥2 and orient is not a left turn; push.",
    "<strong>Lower</strong> on the sorted list. <strong>Upper</strong> on the reversed list.",
    "<strong>Join</strong> lower + upper without repeating the two endpoints.",
    "<strong>n ≤ 1:</strong> return the points. All collinear: two endpoints if strict.",
    "<strong>Optional:</strong> rotating calipers for diameter on the result.",
  ],
  code: [
    { tab: "Brute", file: "HullBrute.java",
      intro: "O(n³): a point is on the hull if some half-plane has everyone on one side. Not for contests.",
      code: `public class HullBrute {
    static int nOnHull(long[][] p) {
        int n = p.length, c = 0;
        for (int i = 0; i < n; i++) {
            boolean ext = false;
            for (int j = 0; j < n; j++) if (j != i) {
                boolean ok = true;
                long x1 = p[j][0] - p[i][0], y1 = p[j][1] - p[i][1];
                for (int k = 0; k < n; k++) {
                    long cr = x1 * (p[k][1] - p[i][1]) - y1 * (p[k][0] - p[i][0]);
                    if (cr < 0) { ok = false; break; }
                }
                if (ok) { ext = true; break; }
            }
            if (ext || n <= 2) c++;
        }
        return c;
    }
    public static void main(String[] args) {
        long[][] p = {{0,0},{1,1},{2,0},{2,2},{0,2}};
        System.out.println(nOnHull(p));
    }
    // Input : square plus interior
    // Output: 4
}` },
    { tab: "Optimal", file: "AndrewHull.java",
      intro: "Monotone chain, strict left turns, unique points.",
      highlight: "12-28",
      code: `import java.util.*;
public class AndrewHull {
    static class P implements Comparable<P> {
        long x, y;
        P(long x, long y) { this.x = x; this.y = y; }
        public int compareTo(P o) { return x != o.x ? Long.compare(x, o.x) : Long.compare(y, o.y); }
        public boolean equals(Object o) { P p = (P) o; return x == p.x && y == p.y; }
    }
    static long cross(P a, P b, P c) {
        return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    }
    static P[] hull(P[] pts) {
        Arrays.sort(pts);
        int n = pts.length;
        if (n <= 1) return pts;
        P[] st = new P[2 * n];
        int k = 0;
        for (int i = 0; i < n; i++) {
            while (k >= 2 && cross(st[k - 2], st[k - 1], pts[i]) <= 0) k--;
            st[k++] = pts[i];
        }
        for (int i = n - 2, t = k + 1; i >= 0; i--) {
            while (k >= t && cross(st[k - 2], st[k - 1], pts[i]) <= 0) k--;
            st[k++] = pts[i];
        }
        return Arrays.copyOf(st, k - 1);
    }
    public static void main(String[] args) {
        P[] h = hull(new P[] {
            new P(0, 0), new P(1, 1), new P(2, 0), new P(2, 2), new P(0, 2)
        });
        System.out.println(h.length);
    }
    // Input : square plus (1,1)
    // Output: 4
}` },
    { tab: "Template", file: "Diameter.java",
      intro: "Rotating calipers: farthest pair = antipodal walk on the hull.",
      code: `public class Diameter {
    static long dist2(long[] a, long[] b) {
        long dx = a[0] - b[0], dy = a[1] - b[1];
        return dx * dx + dy * dy;
    }
    static long diameter(long[][] h) {
        int n = h.length;
        if (n <= 1) return 0;
        if (n == 2) return dist2(h[0], h[1]);
        long best = 0;
        int j = 1;
        for (int i = 0; i < n; i++) {
            int ni = (i + 1) % n;
            while (true) {
                int nj = (j + 1) % n;
                long now = Math.abs((h[ni][0] - h[i][0]) * (h[j][1] - h[i][1])
                    - (h[ni][1] - h[i][1]) * (h[j][0] - h[i][0]));
                long nxt = Math.abs((h[ni][0] - h[i][0]) * (h[nj][1] - h[i][1])
                    - (h[ni][1] - h[i][1]) * (h[nj][0] - h[i][0]));
                if (nxt > now) j = nj; else break;
            }
            best = Math.max(best, dist2(h[i], h[j]));
            best = Math.max(best, dist2(h[ni], h[j]));
        }
        return best;
    }
    public static void main(String[] args) {
        long[][] h = {{0,0},{3,0},{3,4},{0,4}};
        System.out.println(diameter(h));
    }
    // Input : 3x4 rectangle hull
    // Output: 25
}` },
  ],
  complexity: {
    time: "O(n log n)",
    space: "O(n)",
    derivation: [
      "<p>Sort dominates. Each point is pushed and popped at most once per chain, so the stack passes are O(n).</p>",
    ],
    compare: [
      ["Gift wrapping", "O(n h)", "O(n)", "h tiny"],
      ["Andrew / Graham", "O(n log n)", "O(n)", "Default"],
      ["Chan's algorithm", "O(n log h)", "O(n)", "Theory, rarely typed"],
      ["Dynamic hull", "O(log n) / update", "O(n)", "set + tangents"],
    ],
  },
  pitfalls: [
    { title: "Not sorting (or sorting only by x)",
      bug: "Ties in x leave the chain crossing itself.",
      fix: "Sort by x then y. Dedup equals first." },
    { title: "Wrong inequality on collinear",
      bug: "<code>&lt; 0</code> vs <code>≤ 0</code> keeps or drops edge midpoints. The judge has a collinear triple.",
      fix: "Strict hull: pop on ≤ 0. Keep collinear: pop only on < 0." },
    { title: "Duplicating the start point twice",
      bug: "You copy both chains including both endpoints twice and the polygon has a zero-length edge.",
      fix: "Drop the last point of the second chain (it repeats the first of the first)." },
    { title: "int cross on 1e9 coordinates",
      bug: "Same overflow as the previous page, now inside a while-pop.",
      fix: "long everywhere." },
    { title: "Using the hull as unordered",
      bug: "You dump stack points without the CCW order and a later calipers / area walk breaks.",
      fix: "Andrew already emits CCW if you lower-then-upper. Do not sort the output again." },
  ],
  variants: [
    ["Graham polar sort", "Lowest point as origin, sort by orient, same stack.", "ties by distance", "classic textbook"],
    ["Upper hull only", "Needed for CHT dual / max envelope of points.", "one chain", "3D hull projections"],
    ["Minkowski sum", "Both polygons CCW; two pointers on edges by angle.", "O(n+m)", "sum of convex shapes"],
  ],
  followups: [
    ["Why is the hull O(n) after the sort?",
      "<p>Amortised stack: a popped point never returns on that chain. Two passes, each O(n).</p>"],
    ["How do you find the farthest pair?",
      "<p>It is an antipodal pair on the hull. Rotating calipers walks one pointer monotonically around the polygon in O(h).</p>"],
    ["Point in convex in O(log n)?",
      "<p>Binary search the fan from h[0]: find the triangle h[0],h[i],h[i+1] by orient, then one more orient. Or two binary searches on upper/lower chains.</p>"],
    ["Graham vs Andrew?",
      "<p>Same complexity. Andrew's x-sort avoids polar-angle ties and is shorter in Java. Prefer Andrew unless the textbook said Graham.</p>"],
  ],
  problems: [
    lc("587", "erect-the-fence", "Hard", "Andrew / Graham, keep collinear"),
    lc("936", "stamping-the-grid", "Hard", "Not hull — contrast"),
    { url: "https://cses.fi/problemset/task/2195", name: "Convex Hull", badge: "gfg", tag: "CSES", level: "Medium", pattern: "Andrew, include collinear" },
    { url: "https://cses.fi/problemset/task/2193", name: "Polygon Lattice Points", badge: "gfg", tag: "CSES", level: "Medium", pattern: "Pick's + hull-ish" },
    cf("166B", "Polygons", "Hard", "Hull then contain"),
    cf("70D", "Professor's task", "Hard", "Dynamic hull"),
    { url: "https://open.kattis.com/problems/convexhull", name: "Kattis Convex Hull", badge: "gfg", tag: "Kattis", level: "Medium", pattern: "Standard hull I/O" },
    lc("469", "convex-polygon", "Medium", "Verify convex, not construct"),
  ],
  recap: [
    "Sort by (x, y). Lower chain, then upper chain.",
    "Pop while the last three are not a left turn.",
    "long cross. Decide ≤ vs < for collinear.",
    "Drop the duplicated endpoints when joining.",
    "Diameter / containment are walks on this polygon.",
  ],
  oneliner: "sort; for p: while k>=2 && cross(st[k-2],st[k-1],p)<=0 k--; st[k++]=p; then reverse pass;",
}),

];

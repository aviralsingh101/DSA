/* Module 11 — Math & Number Theory */
import { pack, lc, cf } from "./pack.mjs";

export const topics = [

pack({
  id: "modular-arithmetic",
  difficulty: "Easy",
  readTime: "28 min",
  tagline: "Work in the ring Z/MZ: add and multiply with <code>% M</code>, invert when gcd(a,M)=1, and never write <code>(a-b)%M</code> in Java without fixing a negative remainder.",
  tags: ["mod", "inverse", "P0"],
  prereqs: [
    ["Complexity Analysis", "../00-foundations/complexity-analysis.html"],
    ["Java for DSA", "../00-foundations/java-for-dsa.html"],
  ],
  why: [
    "You are given two integers that can each be as large as a billion, and you must report their product, except the judge only wants the leftover after dividing by <code>1 000 000 007</code>. Multiplying those two numbers already overflows a 32-bit <code>int</code>, and a loop that adds one of them a billion times is far too slow. Working <em>modulo</em> <code>M</code> means you keep only the remainder when you divide by <code>M</code>, so every intermediate value stays between <code>0</code> and <code>M-1</code> and the leftover you hand back is exactly the answer the statement asked for.",
    "The modulus in a contest is almost always a prime such as <code>10<sup>9</sup>+7</code> or <code>998244353</code>. A prime modulus is special because every leftover except <code>0</code> has a <em>modular inverse</em> &mdash; the number you multiply it by to get leftover <code>1</code>, which is what division means in this world. Composite moduli lose some inverses, and then you need Euler's totient or the Chinese Remainder Theorem from later pages. The phrase &ldquo;print the answer modulo <code>10<sup>9</sup>+7</code>&rdquo; sitting next to <code>n</code> up to <code>10<sup>6</sup></code> or an exponent up to <code>10<sup>18</sup></code> is the constraint that signals this page.",
    "Java's remainder operator is not the mathematical leftover. Evaluating <code>(1-4)%5</code> gives <code>-3</code>, not <code>2</code>, because the sign of <code>%</code> follows the left operand. Hashing, prefix differences, and any <code>a-b</code> all hit this, and a negative hash becomes an <code>ArrayIndexOutOfBounds</code> or a missed equality. The one-liner <code>x %= M; if (x &lt; 0) x += M;</code> belongs in muscle memory, and you should apply it after every subtraction before you store or compare the value.",
    "When you need to divide, you do not write <code>a/b</code> in Java. The modular inverse of <code>b</code> is the number that acts like &ldquo;one over <code>b</code>&rdquo;: multiply <code>a</code> by that number and you have divided. When <code>M</code> is prime, Fermat's little theorem says the leftover of <code>b<sup>M-2</sup></code> is exactly that inverse, and binary exponentiation computes it in about thirty multiplies for <code>M</code> around <code>10<sup>9</sup></code>. The next pages add sieves, Euler's totient, and the Chinese Remainder Theorem for the cases Fermat cannot cover.",
  ],
  insight: "Keep every value as its leftover modulo <code>M</code>. Add and multiply, then reduce; subtract by adding <code>M</code> first so Java cannot hand you a negative. Division is multiply by the modular inverse &mdash; the number that acts like one-over &mdash; and Fermat produces that inverse when <code>M</code> is prime.",
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
  constraint: "<code>M</code> is usually <code>10<sup>9</sup>+7</code> (a 32-bit prime) or <code>998244353</code> (an NTT-friendly prime). A product of two residues fits in a 64-bit <code>long</code> before you reduce. Exponents go up to <code>10<sup>18</sup></code>, so a naive loop is impossible and you need about <code>log<sub>2</sub>(10<sup>18</sup>) &approx; 60</code> modular multiplies. If you drop to <code>int</code> for the multiply, <code>10<sup>9</sup> &times; 10<sup>9</sup></code> wraps and the leftover is garbage.",
  core: [
    "Store every residue in a <code>long</code>. The helper <code>add(a, b)</code> writes <code>a+b</code> and, if the sum reached <code>M</code>, subtracts <code>M</code> once &mdash; that computes the leftover of the sum without calling <code>%</code>. The helper <code>sub(a, b)</code> writes <code>a-b</code> and, if the difference went negative, adds <code>M</code> once, which is the leftover of the difference. The helper <code>mul(a, b)</code> is <code>(a * b) % M</code>, and both factors must already be reduced so the product is at most about <code>10<sup>18</sup></code> and fits in a <code>long</code>.",
    "The modular inverse of <code>a</code> is the number <code>inv</code> such that the leftover of <code>a * inv</code> is <code>1</code> &mdash; it is the number that acts like division, because the leftover of <code>b * inv</code> is what &ldquo;<code>b / a</code>&rdquo; means in this ring. When <code>M</code> is prime and <code>a</code> is not a multiple of <code>M</code>, Fermat's little theorem says the leftover of <code>a<sup>M-2</sup></code> equals that inverse. Binary exponentiation computes the power: start with result <code>1</code>, square the base, and multiply into the result on every 1-bit of the exponent. That is about thirty multiplies for <code>M-2</code> when <code>M</code> is <code>10<sup>9</sup>+7</code>.",
    "Walk leftovers modulo <code>5</code>. Adding <code>3</code> and <code>4</code> gives <code>7</code>, leftover <code>2</code>. Subtracting <code>1-4</code> gives <code>-3</code>; Java's <code>%</code> leaves <code>-3</code>, then adding <code>5</code> yields <code>2</code>, and the check <code>4+2 = 6</code> leftover <code>1</code> confirms it. The inverse of <code>3</code> is <code>2</code> because <code>3*2 = 6</code> leftover <code>1</code>; Fermat agrees, because the leftover of <code>3<sup>5-2</sup> = 27</code> is also <code>2</code>. Dividing <code>4</code> by <code>3</code> is therefore the leftover of <code>4*2 = 8</code>, which is <code>3</code>. Raising <code>2</code> to the 7th power: <code>128</code> leftover <code>3</code>, and the binary bits of <code>7</code> (which is <code>4+2+1</code>) multiply leftovers <code>16</code>, <code>4</code>, and <code>2</code> to the same <code>3</code>.",
  ],
  invariant: "<p>Every value you store is a residue class modulo <code>M</code>: two integers that differ by a multiple of <code>M</code> are treated as the same. The inverse of <code>a</code> exists exactly when <code>gcd(a, M) = 1</code> &mdash; they share no prime factor &mdash; and for prime <code>M</code> that is every <code>a</code> whose leftover is not <code>0</code>.</p><p>In plain words, you never keep the full integer; you keep the leftover, you add <code>M</code> after a subtraction so the leftover stays non-negative, and &ldquo;divide by <code>a</code>&rdquo; means &ldquo;multiply by the number that turns <code>a</code> into leftover <code>1</code>&rdquo;.</p><p>Interview sentence: <em>&ldquo;Inverse is the number that acts like division; Fermat gives it when M is prime.&rdquo;</em></p>",
  extra: [
    {
      kind: "warn",
      title: "Java % is not mathematical mod",
      html: "<p><code>(-2) % 5</code> is <code>-2</code> in Java, not <code>3</code>. A hash or prefix difference that goes negative then looks like a different residue, so two equal keys miss each other. Always write <code>x %= M; if (x &lt; 0) x += M;</code> after a subtraction.</p>",
    },
    {
      kind: "tip",
      title: "Fermat needs a prime",
      html: "<p>The leftover of <code>a<sup>M-2</sup></code> is the inverse of <code>a</code> only when <code>M</code> is prime and <code>a</code> is not a multiple of <code>M</code>. On a composite modulus use extended Euclid from the next-but-one page, or factor <code>M</code> and apply Euler / CRT.</p>",
    },
  ],
  array: [0, 1, 2, 3, 4, 0],
  arrayLabel: "residues mod 5 =",
  vars: ["op", "raw", "norm"],
  frames: [
    { note: "Working modulo 5, add 3 and 4 to get 7; the leftover of 7 is 2, which is the residue we store.",
      active: [2], values: { op: "3+4", raw: 7, norm: 2 } },
    { note: "Subtract 1 minus 4 to get -3. Java % leaves -3; adding 5 yields leftover 2, and 4+2 leftover 1 checks it.",
      active: [2], values: { op: "1-4", raw: -3, norm: 2 } },
    { note: "Multiply 3 by 4 to get 12. The leftover of 12 after dividing by 5 is 2, the product in this ring.",
      active: [2], values: { op: "3*4", raw: 12, norm: 2 } },
    { note: "The inverse of 3 is 2 because 3 times 2 leftover 1. Fermat agrees: leftover of 3 to the power 3 is 27 leftover 2.",
      active: [2], values: { op: "inv 3", raw: 27, norm: 2 } },
    { note: "Dividing 4 by 3 means multiply 4 by that inverse 2, so leftover of 8 is 3 modulo 5.",
      active: [3], values: { op: "4/3", raw: 8, norm: 3 } },
    { note: "Power 2 to the 7 is 128 leftover 3. Binary bits of 7 are 4+2+1, so leftovers 16, 4 and 2 multiply to the same 3.",
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
  dryIntro: "Trace leftovers modulo 5 through add, subtract, multiply, inverse, divide, and a binary power, matching the visual walkthrough.",
  steps: [
    "<strong>Store every residue in a long.</strong> When <code>M</code> is around <code>10<sup>9</sup></code> a product of two residues needs 64 bits, so an <code>int</code> wrap before <code>%</code> silently destroys the leftover.",
    "<strong>Add by reducing the sum.</strong> With <code>a</code> and <code>b</code> already in <code>0..M-1</code>, compute <code>a+b</code> and subtract <code>M</code> if it reached <code>M</code>; that leftover of the sum always fits in a <code>long</code>.",
    "<strong>Subtract by adding M first.</strong> Write <code>(a - b + M) % M</code> (or add <code>M</code> when the difference is negative) so Java cannot return a negative remainder that later hashes or indexes wrongly.",
    "<strong>Multiply in long, then reduce.</strong> Cast at least one factor: <code>(long) a * b % M</code> computes the leftover of the product; skipping the cast overflows <code>int</code> and the leftover is garbage.",
    "<strong>Raise to a power by binary exponentiation.</strong> Square the base and multiply into the result on every 1-bit of the exponent, about <code>log e</code> modular multiplies, which is how you handle exponents up to <code>10<sup>18</sup></code>.",
    "<strong>Invert by finding the number that acts like division.</strong> When <code>M</code> is prime call <code>pow(a, M-2)</code>, which Fermat says is the leftover that multiplies <code>a</code> to <code>1</code>; otherwise use extended Euclid from the later page.",
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
      "<p>Addition and subtraction are a handful of arithmetic operations: add or subtract, then maybe add or subtract <code>M</code> once. A multiply is one 64-bit product plus one remainder. Binary exponentiation does one squaring per bit of the exponent and one extra multiply per 1-bit, so an exponent <code>e</code> costs about <code>2 log<sub>2</sub> e</code> modular multiplies. The leftover of <code>a<sup>M-2</sup></code> that Fermat uses as the inverse is therefore one power, roughly sixty multiplies when <code>M</code> is <code>10<sup>9</sup>+7</code>.</p>",
      "<p>Putting real numbers in: an exponent of <code>10<sup>18</sup></code> is sixty bits, so about 120 modular multiplies, a few microseconds. A factorial table up to <code>n = 10<sup>6</sup></code> is one million multiplies and one inverse at the top, then a walk down, which is a few milliseconds. A naive loop of <code>10<sup>18</sup></code> multiplies is impossible; floating <code>Math.pow</code> rounds and is not a leftover in the ring.</p>",
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
      bug: "Java <code>%</code> on a subtraction returns a negative leftover such as <code>-3</code>, which looks correct until you use it as a hash or an array index and miss an equality or throw.",
      fix: "After every subtraction write <code>x %= M; if (x &lt; 0) x += M;</code> and test <code>(1-4) mod 5</code>, which must come back <code>2</code>." },
    { title: "int multiply",
      bug: "A product <code>10<sup>9</sup> * 10<sup>9</sup></code> computed in <code>int</code> wraps before <code>%</code>, so the leftover looks like a plausible residue and the bug is silent.",
      fix: "Cast at least one factor first: <code>(long) a * b % M</code>. Print <code>mul(1_000_000_000, 1_000_000_000)</code> and check it equals leftover <code>49</code> modulo <code>10<sup>9</sup>+7</code>." },
    { title: "inv(0)",
      bug: "<code>pow(0, M-2)</code> returns <code>0</code>, so a later multiply by that &ldquo;inverse&rdquo; silently computes leftover 0 instead of failing as a divide-by-zero.",
      fix: "Guard <code>a % M == 0</code> before inverting. A zero leftover has no number that multiplies it to leftover 1." },
    { title: "Fermat on composite M",
      bug: "The leftover of <code>a<sup>M-2</sup></code> is the inverse only for prime <code>M</code>. On a composite it looks like the same one-liner and produces a number that does not multiply back to 1.",
      fix: "Use extended Euclid when <code>gcd(a, M) = 1</code>, or factor <code>M</code> and apply Euler / CRT. Test that <code>mul(a, inv(a))</code> is leftover 1." },
    { title: "pow(a, n) with n=1e18 written as a loop",
      bug: "A loop of <code>10<sup>18</sup></code> multiplies times out, and <code>Math.pow</code> uses doubles so the leftover is rounded, not exact.",
      fix: "Binary exponentiation in the integer ring: square and multiply on bits. Test <code>2<sup>7</sup> mod 5 = 3</code> before trusting a huge exponent." },
  ],
  variants: [
    ["Factorial + invFact", "O(n) preprocess for C(n,k) mod P.", "fact[i]=fact[i-1]*i; invF[n]=inv(fact[n])", "combinatorics page"],
    ["998244353", "NTT modulus. Same inverses.", "M=998244353", "convolution"],
    ["Two mods", "CRT later, or double hash.", "mod1 and mod2", "rolling hash"],
  ],
  followups: [
    ["Why 1e9+7?",
      "<p>It is a prime that fits in 32 bits, so two residues multiply inside a 64-bit <code>long</code> before you reduce. Contests picked it years ago and every library already has helpers for it. Prefer <code>998244353</code> when you might later run an NTT, because <code>998244353 - 1</code> is a high power of two; both moduli give every non-zero leftover an inverse.</p>"],
    ["Does (a/b)%M == (a%M)/(b%M)?",
      "<p>No. Java <code>/</code> is integer division, which throws away a remainder, not modular division. The leftover of <code>8 / 2</code> as ints is <code>4</code>, but multiplying <code>8</code> by the inverse of <code>2</code> modulo <code>5</code> is leftover of <code>8 * 3 = 24</code>, which is <code>4</code> in one ring and a different story in another. Always multiply by the number that acts like one-over, never use Java <code>/</code> on residues.</p>"],
    ["Overflow of a+b before %?",
      "<p>If <code>a</code> and <code>b</code> are already reduced and <code>M</code> is less than about <code>2<sup>62</sup></code>, the sum <code>a+b</code> still fits in a <code>long</code>. For a modulus near <code>2<sup>63</sup></code> skip <code>%</code> and subtract <code>M</code> when the sum reaches it, which is also faster. Products are the ones that need the <code>long</code> cast; sums of two residues almost never overflow 64 bits at contest moduli.</p>"],
    ["Wilson's theorem?",
      "<p>Wilson says the leftover of <code>(P-1)!</code> is <code>P-1</code> (that is, leftover <code>-1</code>) when <code>P</code> is prime. It is a cute check on a tiny prime and a terrible primality test: computing that factorial is linear in <code>P</code>, and Miller-Rabin is the test you actually ship. Do not invert a factorial of <code>P</code> or larger; that leftover is already <code>0</code>.</p>"],
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
  readTime: "28 min",
  tagline: "The linear sieve builds every prime \u2264 n in O(n) and the smallest-prime-factor table factors any k \u2264 n in O(log k).",
  tags: ["sieve", "SPF", "primes", "P1"],
  prereqs: [
    ["Modular Arithmetic", "modular-arithmetic.html"],
    ["Complexity Analysis", "../00-foundations/complexity-analysis.html"],
  ],
  why: [
    "You are given every integer from <code>2</code> to <code>n</code> and you must mark which of them are prime, or factor a long list of them. Trial division tests one candidate in about <code>sqrt n</code> divisions, so asking the question a million times at <code>n = 10<sup>6</sup></code> is already about a billion steps and the judge will cut you off. A sieve pays that cost once, up front, and then primality of any <code>k &le; n</code> is a single array read.",
    "The extra prize is the <em>smallest-prime-factor</em> table, usually shortened to SPF: <code>spf[k]</code> stores the smallest prime that divides <code>k</code>. Once you have it, factoring any <code>k &le; n</code> is a loop that peels off <code>spf[k]</code> until you hit <code>1</code>, at most about <code>log k</code> divisions. That is why you sieve even when the statement never asked you to list primes &mdash; it asked you to factor many numbers in a range.",
    "In Java a boolean or integer sieve is comfortable up to about <code>n = 10<sup>7</sup></code> (tens of megabytes and a few hundred milliseconds). A limit of <code>10<sup>12</sup></code> cannot allocate an array of that length, so you either sieve a short window (a <em>segmented</em> sieve) or test one huge integer with Miller-Rabin. The constraint that names this page is &ldquo;all primes up to <code>n</code>&rdquo; or &ldquo;factor many <code>k &le; n</code>&rdquo; with <code>n</code> in the <code>10<sup>6</sup></code> to <code>10<sup>7</sup></code> band.",
    "The same linear pass that writes SPF also fills <em>multiplicative functions</em> &mdash; functions determined by their values at prime powers, such as Euler's <code>phi</code> (count of leftovers coprime to <code>n</code>), M&ouml;bius <code>mu</code>, and the divisor-count <code>tau</code>. One sieve, several arrays, and every later query is an array read.",
  ],
  insight: "Every composite <code>k &le; n</code> has a smallest prime factor <code>p</code>. The linear sieve writes <code>k = p * m</code> exactly once, when <code>p</code> does not exceed <code>spf[m]</code>, so each composite is marked by its true smallest prime and the whole table costs a constant amount of work per integer.",
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
  constraint: "A boolean sieve at <code>n = 10<sup>7</sup></code> is about 10 MB; an integer SPF table is about 40 MB. Java init time matters: keep the inner loop tight and start marking at <code>i*i</code>, not at <code>2i</code>. Above <code>n = 10<sup>8</sup></code> both memory and startup get tight; a single 64-bit primality test is Miller-Rabin, not a full sieve.",
  core: [
    "Eratosthenes is the simpler sieve. Allocate a boolean array <code>prime[0..n]</code>, set everything true, then force <code>prime[0]</code> and <code>prime[1]</code> false. For each <code>i</code> from 2 up to <code>sqrt n</code>, if <code>i</code> is still marked prime, walk <code>j = i*i, i*i+i, i*i+2i, ...</code> and mark those slots composite. Starting at <code>i*i</code> is safe because every smaller multiple of <code>i</code> already had a smaller prime factor and was marked earlier. After the loops, <code>prime[k]</code> is true exactly when <code>k</code> is prime.",
    "The linear sieve, also called Euler's sieve, builds SPF instead of a boolean. Allocate <code>spf[0..n]</code> of zeros and an empty list of primes. For each <code>x</code> from 2 to <code>n</code>: if <code>spf[x]</code> is still 0 then <code>x</code> is prime, so write <code>spf[x] = x</code> and append <code>x</code> to the prime list. Then, for every prime <code>p</code> in the list so far, if <code>p</code> exceeds <code>spf[x]</code> or <code>p*x</code> exceeds <code>n</code>, stop; otherwise write <code>spf[p*x] = p</code>. The break when <code>p &gt; spf[x]</code> is the whole algorithm: it guarantees each composite is written exactly once, by its smallest prime.",
    "Walk the table up to 10. At <code>x = 2</code> the slot is unmarked, so 2 is prime and you write <code>spf[4] = spf[6] = spf[8] = spf[10] = 2</code>. At <code>x = 3</code> you append 3; 6 already has SPF 2, so you do not overwrite it. At <code>x = 4</code> the slot is already 2, and the only prime you try is 2. At <code>x = 5</code> you append 5 and later <code>9 = 3*3</code> receives SPF 3. Factoring 84 on a larger table peels <code>2, 2, 3, 7</code> by repeating <code>n /= spf[n]</code>. Euler's <code>phi[10]</code> is 4 because 10 has prime factors 2 and 5, and the leftover count is <code>10 * (1-1/2) * (1-1/5)</code>.",
  ],
  invariant: "<p>After the linear sieve, <code>spf[x]</code> is the smallest prime dividing <code>x</code>, and <code>spf[p] = p</code> for every prime. Factorisation peels <code>spf[k]</code> until <code>k</code> becomes 1, in at most about <code>log k</code> steps because each peel shrinks <code>k</code> by a factor of at least 2.</p><p>In plain words, you do not test each integer against every prime; you let each composite be claimed once by the smallest prime that divides it, and that claim is the factor you will peel first later.</p><p>Interview sentence: <em>&ldquo;Each composite is written once, by its smallest prime; the break on p &gt; spf[x] is the algorithm.&rdquo;</em></p>",
  extra: [
    {
      kind: "key",
      title: "The break is load-bearing",
      html: "<p>If you forget <code>if (p &gt; spf[x]) break</code>, a number such as 12 is written by both 2 and 3. Then <code>spf[12]</code> is no longer the smallest prime, factorisation is wrong, and the pass is no longer linear.</p>",
    },
    {
      kind: "tip",
      title: "Eratosthenes when you only need prime[]",
      html: "<p>A boolean sieve has better cache behaviour if you will never factor. Reach for the linear sieve when you also want SPF, <code>phi</code>, or <code>mu</code> in the same pass.</p>",
    },
  ],
  array: [0, 0, 2, 3, 2, 5, 2, 7, 2, 3, 2],
  arrayLabel: "spf[0..10] =",
  vars: ["x", "spf", "primes"],
  frames: [
    { note: "At x=2 the slot is unmarked, so 2 is prime. Write spf of 4, 6, 8 and 10 as 2, their smallest prime.",
      active: [2], values: { x: 2, spf: 2, primes: "[2]" } },
    { note: "At x=3 you append 3. Six already has spf 2, written when x was 2, so you leave that slot alone.",
      active: [3], values: { x: 3, spf: 3, primes: "[2,3]" } },
    { note: "At x=4 the slot is already 2, so 4 is composite. The only prime you try is 2, and 8 is already marked.",
      active: [4], values: { x: 4, spf: 2, primes: "[2,3]" } },
    { note: "At x=5 you append 5. Later 9 equals 3 times 3 and receives spf 3, its smallest prime.",
      active: [5], values: { x: 5, spf: 5, primes: "[2,3,5]" } },
    { note: "Factor 84 by peeling the table: divide by spf until you hit 1, which yields 2, then 2, then 3, then 7.",
      active: [2], values: { x: 84, spf: "2,2,3,7", primes: "fact" } },
    { note: "Euler phi of 10 counts leftovers coprime to 10. Primes 2 and 5 give 10 times (1-1/2) times (1-1/5), which is 4.",
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
  dryIntro: "Build the smallest-prime-factor table up to 10, then peel 84 and compute Euler's leftover-count for 10.",
  steps: [
    "<strong>Allocate the SPF table.</strong> Create <code>int[] spf = new int[n+1]</code> filled with zeros; a zero slot still means &ldquo;not yet claimed&rdquo;, so you can tell a prime from a composite as you walk.",
    "<strong>Discover primes as you walk x.</strong> For each <code>x</code> from 2 to <code>n</code>, if <code>spf[x]</code> is still 0 then <code>x</code> is prime: write <code>spf[x] = x</code> and append <code>x</code> to the prime list.",
    "<strong>Claim multiples by their smallest prime.</strong> For each prime <code>p</code>, stop if <code>p</code> exceeds <code>spf[x]</code> or <code>p*x</code> exceeds <code>n</code>; otherwise write <code>spf[p*x] = p</code>. That break is what keeps each composite written once.",
    "<strong>Factor by peeling SPF.</strong> While <code>k &gt; 1</code>, push <code>spf[k]</code> and divide <code>k</code> by it. Each peel shrinks <code>k</code>, so the loop finishes in at most about <code>log k</code> steps.",
    "<strong>Fill phi in the same pass.</strong> When you write <code>p*x</code>, set <code>phi[p*x] = phi[x]*p</code> if <code>p</code> already divides <code>x</code>, else <code>phi[x]*(p-1)</code>, which is the leftover-count recurrence for a multiplicative function.",
    "<strong>Segment a huge window.</strong> Sieve primes up to <code>sqrt(R)</code>, then mark a boolean array of length <code>R-L+1</code>. Never allocate an array of length <code>10<sup>12</sup></code>.",
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
      "<p>The linear sieve writes each composite exactly once and appends each prime once, so the whole table is a constant amount of work per integer from 2 to <code>n</code> &mdash; that is why it is quoted as <code>O(n)</code>. Eratosthenes marks every multiple of every prime, and the number of those marks is the harmonic sum of <code>n/p</code> over primes, which is about <code>n log log n</code>. Starting the inner loop at <code>i*i</code> does not change the class, but it cuts a large constant.</p>",
      "<p>Putting real numbers in: at <code>n = 10<sup>7</sup></code> the linear pass is ten million writes, a few hundred milliseconds in Java, and the integer table is about 40 MB. Trial-dividing every integer up to that <code>n</code> would be on the order of <code>n sqrt n &approx; 3 &times; 10<sup>10</sup></code> steps. A segmented window of length <code>10<sup>6</sup></code> inside <code>[1, 10<sup>12</sup>]</code> sieves primes to <code>10<sup>6</sup></code> once, then marks the window, which fits in time and memory; allocating <code>10<sup>12</sup></code> slots does not.</p>",
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
      bug: "Starting at <code>2i</code> is still correct, so it looks fine, but you re-mark numbers that a smaller prime already claimed, and <code>i*i</code> computed in <code>int</code> overflows once <code>i</code> reaches 46341.",
      fix: "Cast <code>(long) i * i</code> and start the inner loop there. Time a sieve to <code>10<sup>7</sup></code> both ways if you want to feel the constant." },
    { title: "Linear sieve not breaking on p>spf[x]",
      bug: "Without the break, 12 is written by both 2 and 3. The table still looks populated, but SPF is no longer the smallest prime and the pass becomes <code>O(n log n)</code>.",
      fix: "The break <code>if (p &gt; spf[x]) break</code> is the algorithm. After sieving, check that <code>spf[12]</code> is 2, not 3." },
    { title: "spf[1] and factor(1)",
      bug: "<code>spf[1]</code> stays 0, so <code>while (n &gt; 1)</code> on input 1 never divides and the loop runs forever, which looks like a hang rather than a factorisation bug.",
      fix: "Special-case 1 as an empty factor list before you enter the peel loop. Unit tests should include <code>factor(1)</code>." },
    { title: "n=1e8 boolean in Java",
      bug: "A boolean array of length <code>10<sup>8</sup></code> is tight on both memory and startup, and a slow marking loop times out even when the idea is right.",
      fix: "Stay at <code>n = 10<sup>7</sup></code>, use a bitset, or switch to the linear sieve. Measure init time, not just the query loop." },
    { title: "Segmented sieve off-by-one on L=1",
      bug: "Index 0 of the window maps to <code>L</code>. If <code>L</code> is 1 you leave 1 marked prime, and later counts are off by one in a way that looks like a fence-post error.",
      fix: "Force 0 and 1 composite whenever the window covers them. Print primes in <code>[1, 10]</code> and confirm you get four, not five." },
  ],
  variants: [
    ["phi/mu linear", "Same loop, multiplicative recurrence.", "phi[p*x]=p|x ? phi[x]*p : phi[x]*(p-1)", "CSES counting"],
    ["Segmented", "Primes to sqrt(R), mark [L,R].", "O((R-L+sqrt R) log log R)", "primes in a window"],
    ["n=1e12 single factor", "Pollard Rho, not a sieve.", "random techniques", "one integer"],
  ],
  followups: [
    ["Why is the linear sieve linear?",
      "<p>Every composite <code>m</code> has exactly one writing <code>m = p * x</code> where <code>p</code> is the smallest prime dividing <code>m</code> and <code>p</code> does not exceed <code>spf[x]</code>. The inner loop emits that pair and then stops, so each composite is produced once and each prime is appended once. That is a constant amount of work per integer, which is why the pass is <code>O(n)</code> rather than <code>O(n log log n)</code>.</p>"],
    ["Eratosthenes vs linear in practice?",
      "<p>Eratosthenes walks contiguous multiples and hits cache better if you only need a boolean <code>prime[]</code>. The linear sieve wins when you also want SPF, <code>phi</code>, or <code>mu</code>, because those arrays fill in the same pass. For a one-off prime list up to <code>10<sup>7</sup></code> either is fine; reach for linear the moment a later query asks you to factor.</p>"],
    ["How do you list primes in [1e12, 1e12+1e6]?",
      "<p>Sieve ordinary primes up to a little past <code>10<sup>6</sup></code> (that is <code>sqrt</code> of the right end), then allocate a boolean window of length <code>10<sup>6</sup>+1</code> and mark multiples of those primes inside it. Do not allocate an array of length <code>10<sup>12</sup></code>. After marking, any unmarked slot whose value is at least 2 is prime.</p>"],
    ["Goldbach / twin primes?",
      "<p>Both are scans over a prime list you already built. Goldbach asks whether <code>n - p</code> is prime for some prime <code>p &le; n/2</code>; twins ask whether <code>p</code> and <code>p+2</code> are both in the list. The sieve is the preprocess; the scan is linear in the number of primes, not a second sieve.</p>"],
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
  readTime: "28 min",
  tagline: "Euclid's algorithm is O(log min(a,b)). Extended Euclid also returns x,y with ax+by=gcd, which is the inverse of a mod m when gcd=1.",
  tags: ["gcd", "exgcd", "Bezout", "P1"],
  prereqs: [
    ["Modular Arithmetic", "modular-arithmetic.html"],
    ["Recursion Fundamentals", "../04-recursion-and-dnc/recursion-fundamentals.html"],
  ],
  why: [
    "You are given two jug sizes, 30 and 18, and you must decide whether you can measure exactly 6 litres by filling, emptying, and pouring. The amounts you can actually measure are exactly the multiples of the <em>greatest common divisor</em> of 30 and 18, written <code>gcd(30, 18)</code> &mdash; the largest positive integer that divides both. Here that gcd is 6, so 6 is possible and 5 is not. The same number appears when you reduce a fraction, count lattice points on a segment, or jump by two step sizes on a circle.",
    "B&eacute;zout's identity says there exist integers <code>x</code> and <code>y</code> such that <code>a*x + b*y</code> equals <code>gcd(a, b)</code> &mdash; that linear combination is the smallest positive amount those two step sizes can build. <em>Extended Euclid</em> is Euclid's remainder loop plus a back-substitution that finds those <code>x</code> and <code>y</code>. When <code>gcd(a, m) = 1</code>, the coefficient <code>x</code> is the modular inverse of <code>a</code> modulo <code>m</code>: the number that acts like division even when <code>m</code> is not prime and Fermat does not apply.",
    "A subtractive loop that replaces the larger number by the difference of the two can take a linear number of steps on a Fibonacci pair. Replacing the larger by the leftover after division &mdash; <code>gcd(a, b) = gcd(b, a % b)</code> &mdash; is already logarithmic even in that worst case, under 100 remainders for 64-bit inputs. Always use <code>%</code>, never a subtract-in-a-loop.",
    "In a real statement the signal is &ldquo;can you make amount <code>z</code> with steps <code>a</code> and <code>b</code>&rdquo;, or &ldquo;inverse of <code>a</code> modulo <code>m</code>&rdquo; when <code>m</code> is not promised prime, or <code>a, b &le; 10<sup>18</sup></code> next to a gcd or lcm query. That combination rules out trial-dividing down from <code>min(a, b)</code>, and it is exactly what this page is for.",
  ],
  insight: "The leftover of <code>a</code> after dividing by <code>b</code> is built from <code>a</code> and <code>b</code>, so they share the same gcd: <code>gcd(a, b) = gcd(b, a % b)</code>. Unrolling those remainders and substituting backwards produces the pair <code>x, y</code> with <code>a*x + b*y = gcd</code> &mdash; that back-substitution is extended Euclid, and it is the inverse when the gcd is 1.",
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
  constraint: "Inputs <code>a</code> and <code>b</code> go up to <code>10<sup>18</sup></code>, so store them in <code>long</code>; a 64-bit remainder is one hardware instruction. Fibonacci pairs are the worst case for Euclid and still finish in under 100 remainders. Trial-dividing down from <code>min(a, b)</code> at that size is about <code>10<sup>18</sup></code> steps and will not return.",
  core: [
    "Plain Euclid is a leftover loop. While <code>b</code> is not 0, replace the pair <code>(a, b)</code> by <code>(b, a % b)</code> &mdash; that leftover is what remains after dividing <code>a</code> by <code>b</code>, and any common divisor of <code>a</code> and <code>b</code> also divides it. When <code>b</code> hits 0 the current <code>a</code> is the gcd; take the absolute value so a negative input cannot poison later arithmetic. The least common multiple is then <code>a / gcd * b</code>, computed in <code>long</code> with the divide first so the product does not overflow.",
    "Extended Euclid also returns the B&eacute;zout pair. If <code>b</code> is 0, the combination is <code>a*1 + b*0 = a</code>, so you return <code>(a, 1, 0)</code>. Otherwise recurse on <code>(b, a % b)</code> and get <code>(g, x1, y1)</code> meaning <code>b*x1 + (a % b)*y1 = g</code>. Substitute <code>a % b = a - (a/b)*b</code> and rearrange: <code>a*y1 + b*(x1 - (a/b)*y1) = g</code>. That is why the update is <code>x = y1</code> and <code>y = x1 - (a/b)*y1</code> &mdash; those two numbers compute a combination that still equals the gcd. The inverse of <code>a</code> modulo <code>m</code> is that <code>x</code>, normalised into <code>0..m-1</code>, but only when the gcd is 1.",
    "Walk 30 and 18. Remainders: <code>30 = 1*18 + 12</code>, then <code>18 = 1*12 + 6</code>, then <code>12 = 2*6 + 0</code>, so the gcd is 6. Substituting backwards: 6 equals <code>18 - 1*12</code>, and 12 equals <code>30 - 1*18</code>, so 6 equals <code>2*18 - 1*30</code>. The inverse of 18 modulo 30 does not exist because that gcd is 6, not 1. The inverse of 7 modulo 30 does: extended Euclid finds <code>7*(-17) + 30*4 = 1</code>, and leftover of <code>-17</code> after adding 30 is 13, the number that acts like one-over-7 in that ring.",
  ],
  invariant: "<p>At every remainder step the current pair still has the same gcd as the original pair, and the coefficients the algorithm returns satisfy <code>a*x + b*y = g</code> for that current pair.</p><p>In plain words, you never invent new common divisors: each leftover is built from the previous two numbers, so the largest shared divisor cannot change, and the back-substitution only rewrites that same gcd as a combination of the original <code>a</code> and <code>b</code>.</p><p>Interview sentence: <em>&ldquo;Remainders preserve the gcd; unrolling them gives the inverse when that gcd is 1.&rdquo;</em></p>",
  extra: [
    {
      kind: "warn",
      title: "No inverse when gcd is not 1",
      html: "<p>Returning <code>x</code> without checking <code>g == 1</code> looks like the same helper you used on a prime modulus. Multiply back: <code>a*x</code> will not have leftover 1, and later modular division is silently wrong. Fail (or report no solution) when the gcd does not divide the target.</p>",
    },
    {
      kind: "tip",
      title: "Divide before you multiply for lcm",
      html: "<p><code>a * b / gcd</code> overflows a <code>long</code> when <code>a</code> and <code>b</code> are both near <code>10<sup>18</sup></code>. Write <code>a / gcd * b</code> after you know <code>gcd</code> divides <code>a</code> exactly.</p>",
    },
  ],
  array: [30, 18, 12, 6, 0],
  arrayLabel: "Euclid remainders =",
  vars: ["a,b", "q", "g"],
  frames: [
    { note: "Start Euclid on 30 and 18. Dividing 30 by 18 leaves leftover 12, so the next pair is 18 and 12.",
      active: [0, 1], values: { "a,b": "30,18", q: 1, g: "\u2014" } },
    { note: "Now 18 and 12. Dividing 18 by 12 leaves leftover 6, and the shared divisor has not changed.",
      active: [1, 2], values: { "a,b": "18,12", q: 1, g: "\u2014" } },
    { note: "Now 12 and 6. Dividing 12 by 6 leaves leftover 0, so the gcd is the current 6.",
      active: [2, 3], values: { "a,b": "12,6", q: 2, g: 6 } },
    { note: "Substitute backwards: 6 is 18 minus 12, and 12 is 30 minus 18, so 6 equals 2 times 18 minus 1 times 30.",
      active: [0], values: { "a,b": "B\u00e9zout", q: "\u2014", g: "30(-1)+18(2)" } },
    { note: "Eighteen has no inverse modulo 30 because that gcd is 6, not 1; no leftover multiplies 18 to leftover 1.",
      active: [4], values: { "a,b": "18 vs 30", q: "\u2014", g: "no inv" } },
    { note: "Seven and 30 are coprime. Extended Euclid finds 7 times -17 plus 30 times 4 equals 1, so the inverse leftover is 13.",
      active: [3], values: { "a,b": "7,30", q: "\u2014", g: 1 } },
  ],
  mermaid: `flowchart TD
  ab["exgcd a b"] --> base{"b == 0?"}
  base -- yes --> ret["return a, 1, 0"]
  base -- no --> rec["exgcd b, a mod b"]
  rec --> back["x = y1; y = x1 - (a/b)*y1"]`,
  merTitle: "Recurse on remainders, back-substitute",
  merCaption: "The iterative version keeps old x,y and is nicer in Java (no stack).",
  dryIntro: "Run Euclid on 30 and 18 to get gcd 6, then back-substitute the B&eacute;zout pair and contrast a missing inverse with the inverse of 7 modulo 30.",
  steps: [
    "<strong>Compute the gcd by remainders.</strong> While <code>b</code> is not 0, replace <code>(a, b)</code> by <code>(b, a % b)</code> and finally return the absolute value of <code>a</code>. The leftover loop is what keeps the worst case logarithmic.",
    "<strong>Track coefficients for extended Euclid.</strong> Recurse as above, or iterate with <code>x, y = 1, 0</code> and <code>x1, y1 = 0, 1</code>, updating them the same way the remainders update, so you finish with <code>a*x + b*y = g</code>.",
    "<strong>Read the inverse from x when gcd is 1.</strong> Call <code>(g, x, y) = exgcd(a, m)</code>; if <code>g != 1</code> there is no inverse. Otherwise return leftover of <code>x</code> in <code>0..m-1</code>, the number that acts like one-over-<code>a</code>.",
    "<strong>Solve ax + by = c by scaling.</strong> If <code>c</code> is not a multiple of <code>g</code> there is no integer solution. Otherwise multiply <code>x</code> and <code>y</code> by <code>c/g</code>, then step <code>x</code> by <code>b/g</code> and <code>y</code> by <code>-a/g</code> to list every solution.",
    "<strong>Form the lcm without overflowing.</strong> Write <code>a / g * b</code> in <code>long</code> after confirming <code>g</code> divides <code>a</code>. Multiplying first can wrap even when the true lcm fits.",
    "<strong>More than two integers.</strong> Fold <code>gcd(gcd(a, b), c)</code> and so on. A full lattice basis for many variables is rare in contests and is a different tool.",
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
      "<p>Lam&eacute;'s theorem says each leftover is at most two-thirds of the previous pair's larger number, so the number of remainders is <code>O(log min(a, b))</code>. The worst inputs are consecutive Fibonacci numbers, where each leftover is the previous Fibonacci, and even then a 64-bit pair finishes in under 100 steps. A subtractive loop on the same pair is linear in the values and dies at <code>10<sup>18</sup></code>.</p>",
      "<p>Putting real numbers in: <code>gcd(F<sub>90</sub>, F<sub>89</sub>)</code> for 64-bit Fibonacci numbers is about ninety remainders, a few hundred nanoseconds. Extended Euclid does the same number of updates plus a handful of multiplies for the coefficients. Fermat's inverse on a prime <code>M &approx; 10<sup>9</sup></code> is about sixty modular multiplies; extended Euclid is comparable and also works when <code>M</code> is composite.</p>",
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
      bug: "<code>a * b / gcd</code> looks like the textbook formula and compiles, but the product wraps a <code>long</code> before the divide when both inputs are near <code>10<sup>18</sup></code>.",
      fix: "Write <code>a / gcd * b</code> in <code>long</code> after computing the gcd first. Test <code>lcm(10<sup>18</sup>/2, 10<sup>18</sup>/4)</code> if you want a loud failure." },
    { title: "Negative a,b",
      bug: "Java <code>%</code> follows the sign of the left operand, so a negative input can make the returned gcd negative and later comparisons or inverses look randomly wrong.",
      fix: "Take absolute values on the way in, or normalise the sign of the gcd at the end. Unit-test <code>gcd(-30, 18)</code> and expect 6." },
    { title: "Ignoring g!=1 for inverse",
      bug: "You still return <code>x</code>, and leftover of <code>a*x</code> is 0 or some other junk, which looks like a legal inverse until a later multiply fails a self-check.",
      fix: "If <code>g != 1</code> there is no inverse. For <code>a*x &equiv; b (mod m)</code> you also need <code>g</code> to divide <code>b</code>. Always test <code>mul(a, inv(a))</code> is leftover 1." },
    { title: "Recursive exgcd on Fibonacci 1e18",
      bug: "Depth is about 90 on a 64-bit Fibonacci pair, which happens to fit the Java stack, so the recursive version looks fine until someone ports it to a tighter limit.",
      fix: "Prefer the iterative update of <code>x, y</code>. It is stack-safe and the coefficient writes are easier to read on a whiteboard." },
    { title: "General solution forgetting t step b/g",
      bug: "Stepping <code>x</code> by <code>b</code> instead of <code>b/g</code> skips legal solutions and the first few you print look plausible, so the off-by-factor hides.",
      fix: "Write <code>x += (b/g)*t</code> and <code>y -= (a/g)*t</code>. Check that two consecutive solutions differ by that reduced step." },
  ],
  variants: [
    ["Linear inverses 1..n", "inv[1]=1; inv[i]=P-P/i*inv[P%i]%P.", "O(n)", "combinatorics"],
    ["CRT two mods", "Need inv of m1 mod m2, i.e. exgcd.", "x=a1+m1*((a2-a1)*inv m1)", "inclusion later"],
    ["Lattice points on (x1,y1)-(x2,y2)", "gcd(|x2-x1|,|y2-y1|)-1 interior.", "Pick's theorem cousin", "geometry"],
  ],
  followups: [
    ["Why does Euclid terminate?",
      "<p>Each leftover is a non-negative integer strictly smaller than the previous <code>b</code>, so the pair cannot descend forever. The gcd is preserved because any common divisor of <code>a</code> and <code>b</code> also divides <code>a % b</code>, and conversely any common divisor of <code>b</code> and that leftover divides <code>a</code>. When the leftover hits 0 you are done, and the current <code>a</code> is the shared divisor.</p>"],
    ["Binary GCD?",
      "<p>Stein's algorithm divides out factors of 2 with shifts, then subtracts odd numbers. It is a win on huge bit-integers where a remainder is expensive. For ordinary 64-bit <code>long</code> values in Java, hardware <code>%</code> is faster and the code is shorter, so stick to Euclid unless the inputs are big-integers.</p>"],
    ["Frobenius coin problem?",
      "<p>If <code>a</code> and <code>b</code> are coprime, the largest amount you cannot make with non-negative combinations is <code>a*b - a - b</code>. If the gcd is greater than 1 you can only ever make multiples of that gcd, so &ldquo;every large enough integer&rdquo; is false &mdash; only every large enough multiple of the gcd is reachable. Water-jug problems are this lemma plus the capacity cap <code>a+b</code>.</p>"],
    ["n-dimensional ax=c?",
      "<p>The gcd of all the coefficients must divide <code>c</code>, or there is no integer solution. One particular solution is built by folding extended Euclid across the coefficients; the remaining freedom is a lattice of rank <code>n-1</code>. Contests almost always stay at two variables, where that lattice is the single parameter <code>t</code> on this page.</p>"],
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
  readTime: "28 min",
  tagline: "<code>nCr = n!/(r!(n-r)!)</code> in a prime field is three factorials. Lucas handles <code>n &ge; p</code>. Stars-and-bars is <code>C(n+k-1, k-1)</code>.",
  tags: ["nCr", "Lucas", "Catalan", "P1"],
  prereqs: [["Modular Arithmetic", "modular-arithmetic.html"]],
  why: [
    "You are asked how many ways there are to choose 3 toppings out of 10, or how many ways to walk from the top-left of a grid to the bottom-right using only right and down steps. Both answers are <em>binomial coefficients</em> <code>C(n, r)</code> &mdash; the number of ways to choose <code>r</code> items from <code>n</code> when order does not matter. Computing that by looping over subsets is exponential. When the answer is needed modulo a prime, a table of factorials and their inverses makes every later choose an array lookup.",
    "The table only works while <code>n</code> is smaller than the prime <code>M</code>. Once <code>n</code> reaches <code>M</code>, leftover of <code>n!</code> is 0 and every choose that uses it looks like 0. Then you either multiply a short <em>falling factorial</em> (when <code>r</code> is tiny) or apply Lucas: write <code>n</code> and <code>r</code> in base <code>p</code> and multiply a choose of each digit pair. The phrase &ldquo;<code>n</code> up to <code>10<sup>18</sup></code>, modulus a prime, many queries&rdquo; is the constraint that picks which of those three tools you reach for.",
    "Four named shapes sit on top of cheap <code>nCr</code>. Stars-and-bars counts non-negative solutions of <code>x<sub>1</sub>+...+x<sub>k</sub> = n</code>. Giving each bin one item first handles &ldquo;at least one&rdquo;. Catalan numbers count balanced brackets, binary trees, and monotone paths that stay under the diagonal. Derangements count permutations with no fixed point and belong with inclusion-exclusion on the next-but-one page. The algebra is short once choose is cheap.",
    "In a real statement you will see &ldquo;number of ways modulo <code>10<sup>9</sup>+7</code>&rdquo; next to <code>n &le; 10<sup>6</sup></code> (build the table), or <code>n &le; 10<sup>18</sup></code> with a small <code>r</code> (falling), or a small prime <code>p</code> with a huge <code>n</code> (Lucas). Pascal's triangle by dynamic programming dies at those sizes: <code>n*r</code> at a million is a trillion cells.",
  ],
  insight: "When <code>M</code> is prime and <code>n &lt; M</code>, leftover of <code>C(n, r)</code> is three table lookups: leftover of <code>n!</code> times the inverse of <code>r!</code> times the inverse of <code>(n-r)!</code>. Precompute those two tables once. Lucas is the same choose, applied to base-<code>p</code> digits, for the case <code>n &ge; M</code>.",
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
  constraint: "The modulus <code>M</code> is a prime. A factorial table is comfortable at <code>n &le; 10<sup>6</sup></code> (a few milliseconds and a few megabytes). Falling factorial is the tool when <code>r &le; 10<sup>6</sup></code> and <code>n</code> is huge. Lucas needs a small-choose helper for arguments less than <code>p</code>, so <code>p &le; 10<sup>6</sup></code> with a huge <code>n</code> is the usual pairing. You cannot build a table of length <code>10<sup>9</sup>+7</code>.",
  core: [
    "Build <code>fact[0..n]</code> by <code>fact[i] = fact[i-1] * i</code> leftover <code>M</code>, starting at <code>fact[0] = 1</code>. Then invert the top cell once with Fermat, <code>invF[n] = pow(fact[n], M-2)</code>, and walk down: <code>invF[i-1] = invF[i] * i</code>. That walk computes every inverse factorial from one inverse. Leftover of <code>C(n, r)</code> is then <code>fact[n] * invF[r] * invF[n-r]</code>, or 0 if <code>r</code> is negative or larger than <code>n</code>. Stars-and-bars says the number of non-negative integer solutions of <code>x<sub>1</sub>+...+x<sub>k</sub> = n</code> is <code>C(n+k-1, k-1)</code> &mdash; that choose counts how to place <code>k-1</code> bars among <code>n</code> stars and those bars.",
    "Lucas handles <code>n &ge; p</code>. While <code>n</code> or <code>r</code> is nonzero, multiply leftover of <code>C(n % p, r % p)</code> (which is 0 if that digit of <code>r</code> exceeds the digit of <code>n</code>), then divide both by <code>p</code>. Each digit choose uses the small table. Catalan number <code>C<sub>n</sub></code> counts the shapes listed above and equals leftover of <code>C(2n, n)</code> times the inverse of <code>n+1</code>. If the prime divides <code>n+1</code> that inverse does not exist; use the difference <code>C(2n, n) - C(2n, n-1)</code>, which computes the same integer without dividing by <code>n+1</code>.",
    "Walk a few values. Pascal's row for <code>n = 5</code> is <code>1, 5, 10, 10, 5, 1</code>: leftover of <code>C(5, 2)</code> is 10 because <code>5*4 / 2 = 10</code>, and <code>C(5, 3)</code> equals <code>C(5, 2)</code> by symmetry. Three identical sweets into two labelled kids with empty allowed is stars-and-bars <code>C(3+2-1, 2-1) = C(4, 1) = 4</code>. Catalan of 3 is leftover of <code>C(6, 3) / 4 = 20/4 = 5</code>. Lucas on <code>C(10, 3)</code> modulo 7 writes 10 as digits <code>(1, 3)</code> and 3 as <code>(0, 3)</code>, then leftover of <code>C(1, 0) * C(3, 3)</code> is 1.",
  ],
  invariant: "<p>Pascal's recurrence <code>C(n, r) = C(n-1, r) + C(n-1, r-1)</code> holds in the integers and leftover a prime. Lucas is that recurrence read in base <code>p</code>: leftover of <code>(1+x)<sup>n</sup></code> factors as a product of leftover of <code>(1+x)</code> raised to each base-<code>p</code> digit, so the coefficient of <code>x<sup>r</sup></code> is the product of the digit-wise chooses.</p><p>In plain words, you never enumerate subsets; you look up factorials, or you look up a handful of tiny chooses of digits, and those leftovers are the number of ways.</p><p>Interview sentence: <em>&ldquo;Table when n is below the prime; Lucas on the digits when it is not.&rdquo;</em></p>",
  extra: [
    {
      kind: "warn",
      title: "fact[n] is 0 once n reaches M",
      html: "<p>Every later <code>nCr</code> that multiplies by that slot becomes leftover 0, including cases where the true choose is not a multiple of <code>M</code>. That is the cue to switch to Lucas, not a bug in the multiply.</p>",
    },
    {
      kind: "math",
      title: "Stars-and-bars chooses the bars",
      html: "<p>The number of non-negative solutions of <code>x<sub>1</sub>+...+x<sub>k</sub> = n</code> is <code>C(n+k-1, k-1)</code>, not <code>C(n+k-1, k)</code>. You are choosing positions for <code>k-1</code> bars. Give each bin one item first to enforce &ldquo;at least one&rdquo;: leftover of <code>C(n-1, k-1)</code> when <code>n &ge; k</code>.</p>",
    },
  ],
  array: [1, 5, 10, 10, 5, 1],
  arrayLabel: "C(5,k) =",
  indexLabels: ["0", "1", "2", "3", "4", "5"],
  vars: ["n", "r", "val"],
  frames: [
    { note: "Pascal's row for n=5 starts at C(5,0)=1, the one way to choose nothing.",
      active: [0], values: { n: 5, r: 0, val: 1 } },
    { note: "C(5,2) is 10, the number of ways to choose 2 out of 5, because 5 times 4 over 2 is 10.",
      active: [2], values: { n: 5, r: 2, val: 10 } },
    { note: "C(5,3) equals C(5,2) by symmetry, so it is also 10: choosing 3 to keep is choosing 2 to leave out.",
      active: [3], values: { n: 5, r: 3, val: 10 } },
    { note: "Three sweets, two kids, empty allowed: stars-and-bars C(3+2-1, 1) is 4 distributions.",
      active: [1], values: { n: "bars", r: 1, val: 4 } },
    { note: "Catalan of 3 is C(6,3) divided by 4, which is 20/4=5 balanced-bracket strings of length 6.",
      active: [3], values: { n: "Cat3", r: 3, val: 5 } },
    { note: "Lucas of C(10,3) modulo 7: digits (1,3) and (0,3), so C(1,0) times C(3,3) leftover 1.",
      active: [0], values: { n: 10, r: 3, val: 1 } },
  ],
  mermaid: `flowchart TD
  q["n vs p vs r"] --> small{"n less than p?"}
  small -- yes --> fact["fact table"]
  small -- "n huge r small" --> fall["falling factorial"]
  small -- "n at least p" --> lucas["Lucas digits"]`,
  dryIntro: "Read Pascal's row for n=5, then stars-and-bars, Catalan of 3, and a Lucas digit product modulo 7.",
  steps: [
    "<strong>Pick the tool from n, r, and M.</strong> Table if <code>n &lt; M</code> and many queries; falling factorial if <code>r</code> is small; Lucas if <code>n &ge; p</code>. The wrong tool either zeros every answer or times out.",
    "<strong>Build fact and invFact when n is below M.</strong> One forward pass of multiplies, one Fermat inverse at the top, one walk down. Every later choose is three lookups.",
    "<strong>Use a falling product when r is small.</strong> Multiply leftover of <code>(n-i)</code> and the inverse of <code>(i+1)</code> for <code>i</code> from 0 to <code>r-1</code>. That computes <code>C(n, r)</code> without a table of length <code>n</code>.",
    "<strong>Apply Lucas when n reaches the prime.</strong> Product of leftover of <code>C</code> of each base-<code>p</code> digit pair, zero if any digit of <code>r</code> exceeds the matching digit of <code>n</code>.",
    "<strong>Translate distributions to stars-and-bars.</strong> Non-negative solutions of a sum is <code>C(n+k-1, k-1)</code>; subtract the overflowing subsets with inclusion-exclusion when bins have caps.",
    "<strong>Read Catalan from a choose.</strong> Leftover of <code>C(2n, n)</code> times the inverse of <code>n+1</code>, or the difference <code>C(2n, n) - C(2n, n-1)</code> when the prime divides <code>n+1</code>.",
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
      "<p>Building <code>fact</code> is one multiply per integer up to <code>n</code>, plus one Fermat inverse and a walk down for <code>invF</code>, so preprocess is <code>O(n + log M)</code> and every later choose is a handful of multiplies. Falling factorial is <code>r</code> multiplies and <code>r</code> inverses, about <code>r log M</code> if you invert each denominator separately. Lucas does one small choose per base-<code>p</code> digit, and there are <code>O(log_p n)</code> digits.</p>",
      "<p>Putting real numbers in: a table to <code>n = 10<sup>6</sup></code> is a million multiplies, a few milliseconds, then a million queries are free. Pascal DP at the same <code>n</code> with <code>r = 10<sup>5</sup></code> is <code>10<sup>11</sup></code> additions. Lucas on <code>n = 10<sup>18</sup></code> with <code>p = 10<sup>6</sup>+3</code> is a handful of digits, each a falling choose below <code>p</code>. You cannot allocate <code>fact[10<sup>9</sup>+7]</code>.</p>",
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
      bug: "Leftover of <code>n!</code> is 0, so every later choose that multiplies by that slot is leftover 0, including answers that are not multiples of <code>M</code>. The table looks built and the multiply looks right.",
      fix: "Switch to Lucas (or a falling product if <code>r</code> is small). A self-check is <code>C(p, 1)</code> leftover <code>p</code>, which must be 0, versus <code>C(p+1, 1)</code>, which must be leftover 1." },
    { title: "Stars-and-bars off-by-one",
      bug: "<code>C(n+k-1, k)</code> looks symmetric and is a legal choose, but it is not the number of non-negative solutions of a <code>k</code>-variable sum.",
      fix: "You choose positions for <code>k-1</code> bars, so the count is <code>C(n+k-1, k-1)</code>. Enumerate the four distributions of 3 sweets to 2 kids by hand." },
    { title: "Catalan inv(n+1) when p | n+1",
      bug: "Fermat's inverse of a multiple of <code>p</code> is leftover 0, so Catalan becomes leftover 0 even though the integer Catalan number is not a multiple of <code>p</code>.",
      fix: "Use leftover of <code>C(2n, n) - C(2n, n-1)</code>, which computes the same integer without dividing by <code>n+1</code>." },
    { title: "Integer / on the falling factorial",
      bug: "Writing <code>(n-i) / (i+1)</code> with Java <code>/</code> truncates in the integers, so a later leftover is not the field element you wanted.",
      fix: "Multiply by the modular inverse of <code>i+1</code>. The running product must stay exact leftover <code>M</code> at every step." },
    { title: "Order vs combination",
      bug: "Arrangements are <code>nPr = n! / (n-r)!</code>. Using <code>nCr</code> when order matters (or the reverse) looks off by a consistent factor that is easy to miss on small samples.",
      fix: "Ask whether swapping two chosen items produces a new answer. If yes, drop the <code>r!</code> in the denominator; if no, keep the choose." },
  ],
  variants: [
    ["Upper negation", "C(-n,k)=(-1)^k C(n+k-1,k).", "stars-and-bars in disguise", ""],
    ["Multinomial", "n! / (n1! n2! ...)", "same fact table", ""],
    ["Derangement", "!n = n! * sum (-1)^k/k!", "IE page", ""],
  ],
  followups: [
    ["Why Lucas?",
      "<p>Freshman's dream says leftover of <code>(1+x)<sup>p</sup></code> equals leftover of <code>1 + x<sup>p</sup></code> when the modulus is prime. Raising both sides to the base-<code>p</code> digits of <code>n</code> factors leftover of <code>(1+x)<sup>n</sup></code> as a product, so the coefficient of <code>x<sup>r</sup></code> &mdash; which is leftover of <code>C(n, r)</code> &mdash; is the product of leftover of <code>C</code> of each digit pair. That is Lucas, and it is why a digit of <code>r</code> larger than the matching digit of <code>n</code> forces the whole answer to 0.</p>"],
    ["Each bin at least 1?",
      "<p>Give every bin one item first, which spends <code>k</code> of the <code>n</code> identical items, then distribute the remaining <code>n-k</code> with empty allowed. Stars-and-bars then says leftover of <code>C((n-k)+k-1, k-1) = C(n-1, k-1)</code>, provided <code>n &ge; k</code>. If <code>n &lt; k</code> the answer is 0 because you cannot give each bin one item.</p>"],
    ["Is Catalan an integer?",
      "<p>Yes, always, even though the formula divides by <code>n+1</code>. In a prime field that division is an inverse, which fails when the prime divides <code>n+1</code>. The difference <code>C(2n, n) - C(2n, n-1)</code> is the same integer and only uses subtraction, so it is the form you ship when the modulus might divide the denominator.</p>"],
    ["n=1e18, r=1e18, p=1e9+7?",
      "<p>You cannot build a factorial table of length <code>10<sup>9</sup>+7</code>, and Lucas at that prime still wants a helper for arguments up to the prime. A well-posed statement will promise a tiny <code>r</code> (falling factorial), a tiny prime, or a different modulus. If both <code>n</code> and <code>r</code> are huge and the prime is <code>10<sup>9</sup>+7</code>, you are probably missing a reduction.</p>"],
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
  readTime: "26 min",
  tagline: "Parity, gcd, xor, and digit-sum mod 9 are invariants: a move that cannot change them cannot reach a target that differs.",
  tags: ["invariants", "parity", "gcd", "P1"],
  prereqs: [["GCD & Extended Euclid", "gcd-and-extended-euclid.html"]],
  why: [
    "You are given a start state A and a target B, and a short list of legal moves, and you must say whether B is reachable. Building the whole state graph and running BFS is correct, but the graph can be enormous: a permutation of 15 tiles is already 10<sup>13</sup> layouts, and a frog on a circle of size <code>10<sup>9</sup></code> is a billion nodes. An <em>invariant</em> is a number you compute from a state that every legal move leaves unchanged. If that number differs at A and at B, you can answer no without searching.",
    "The workhorses are few and they keep showing up. The parity of a sum, or of the number of <em>inversions</em> (pairs that are out of order), flips or stays according to the move. The gcd of a step size with the circle length decides which residues you can land on. The xor of a pile is what Nim cannot change in one honest heap. A number and the sum of its digits have the same leftover modulo 9. Each of those is a one-line function of the state.",
    "Matching invariants is necessary, not sufficient. Same leftover modulo 9 does not mean you can reach 18 from 9 by a given move set; you still have to construct a path or name the extra obstruction. In a real statement the signal is &ldquo;can you reach&rdquo; next to a tiny list of algebraic moves and limits that make a search impossible. Check the invariant first, then construct, and only then fall back to BFS on a reduced space.",
    "The same habit kills a surprising number of &ldquo;prove it is impossible&rdquo; interview questions. Colour a chessboard, watch a token jump, and notice the colour never changes. Sum the array, watch one cell rise and another fall by the same amount, and notice the sum never changes. If the target breaks the thing that cannot change, you are done.",
  ],
  insight: "Name the quantity a legal move cannot change. If the target has a different value, stop and answer no. If the values match, either construct a path or prove that every state with that value can reach a single normal form.",
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
  constraint: "Evaluating the candidate invariant is <code>O(1)</code> or one linear scan of the state. A matching construction is usually another linear pass, maybe with a sort. If the statement's limits make even that scan tight, you picked too expensive a quantity. A BFS of the raw state space at these limits is the thing you are trying not to run.",
  core: [
    "Write the moves algebraically first, so you can see what they add and subtract. Guess a quantity <code>I</code> &mdash; parity of a sum, leftover of a gcd, xor of the piles, leftover of the digit sum modulo 9, colour of a square. Then prove <code>I(move(s)) = I(s)</code> for a generic move of every type, not just the first type you thought of. Compare <code>I(start)</code> and <code>I(target)</code>. If they differ, the answer is no and you can stop.",
    "If they match, you still have work. Either construct a path (often easier backwards, because forward branches and backward collapses) or prove that every state with that value of <code>I</code> can reach one normal form. A second, finer invariant is what you reach for when the first one matches and a tiny extra example is still unreachable. Sufficiency is a lemma, not a slogan.",
    "Walk two pictures. The array <code>[3, 1, 4, 2]</code> has three inversions (the pairs 3-1, 3-2, 4-2), which is odd; an adjacent swap flips that parity, and the sorted array has zero inversions, so you need an odd number of adjacent swaps. On a circle of 10 with jump +4, leftover of <code>gcd(4, 10) = 2</code> divides the distance 6 and does not divide 5, so 0 can reach 6 and cannot reach 5. Digit-sum: 38 has digits 3+8=11, then 1+1=2, and leftover of 38 modulo 9 is also 2. If any move type changes your <code>I</code>, throw that <code>I</code> away.",
  ],
  invariant: "<p><code>I</code> is a function of the state such that every legal move leaves <code>I</code> unchanged. Different values mean the target is unreachable. Equal values are necessary and not always sufficient.</p><p>In plain words, you are looking for a stamp that every move is forbidden to overwrite; if the target wears a different stamp, no sequence of moves can get you there.</p><p>Interview sentence: <em>&ldquo;Name what the move cannot change; if the target differs, stop.&rdquo;</em></p>",
  extra: [
    {
      kind: "warn",
      title: "Same I is not a path",
      html: "<p>Water jugs with gcd 2 can measure 4 and cannot measure 5, but they also cannot measure 100 if the two jugs hold 6 and 8. The capacity cap is a second obstruction. Always construct, or name the extra constraint.</p>",
    },
    {
      kind: "idea",
      title: "Potential is a different tool",
      html: "<p>A potential strictly decreases and proves that a process terminates. An invariant stays constant and proves that a target is impossible. Do not mix the two words on a whiteboard.</p>",
    },
  ],
  array: [3, 1, 4, 2],
  arrayLabel: "a =",
  vars: ["I", "move", "ok"],
  frames: [
    { note: "The array 3,1,4,2 has three inversions (3-1, 3-2, 4-2), so the inversion count is odd.",
      active: [0, 1], values: { I: "inv=3", move: "—", ok: "odd" } },
    { note: "An adjacent swap of 3 and 1 removes one inversion and flips that parity from odd to even.",
      active: [0, 1], values: { I: "inv=2", move: "swap", ok: "even" } },
    { note: "The sorted array has zero inversions. Reaching it therefore needs an odd number of adjacent swaps.",
      active: [0], values: { I: "parity", move: "odd swaps", ok: "yes" } },
    { note: "On a circle of 10, jumping +4 preserves leftover modulo gcd(4,10)=2, so 0 reaches 6 and cannot reach 5.",
      active: [2], values: { I: "gcd=2", move: "jump 4", ok: "6 yes" } },
    { note: "Digits of 38 sum to 11 then 2, and leftover of 38 modulo 9 is also 2, the same invariant.",
      active: [3], values: { I: "mod9=2", move: "digits", ok: "match" } },
    { note: "If even one legal move type changes I, that quantity is not an invariant; throw it away and guess again.",
      active: [0], values: { I: "check all", move: "all types", ok: "must hold" } },
  ],
  mermaid: `flowchart TD
  s["start"] --> i["I start"]
  t["target"] --> j["I target"]
  i --> c{"equal?"}
  j --> c
  c -- no --> no["impossible"]
  c -- yes --> suf["construct or search"]`,
  dryIntro: "Count inversions on 3,1,4,2, then a circle jump that preserves a gcd, then a digit-sum leftover modulo 9.",
  steps: [
    "<strong>List the moves algebraically.</strong> Write what each type adds, subtracts, or swaps, so you can see which quantities have a chance of staying put.",
    "<strong>Guess a candidate I.</strong> Start with the cheapest: parity of a sum, leftover of a gcd, xor of the piles, leftover of the digits modulo 9, or a board colour.",
    "<strong>Prove preservation on every type.</strong> A third move that flips your quantity is the usual false invariant; check a generic move of each kind, not one example.",
    "<strong>Compare start and target.</strong> If the values differ, answer no. That single comparison is the whole point of the technique.",
    "<strong>When they match, construct or argue connectivity.</strong> Same <code>I</code> is necessary, not a path. Reduce to a normal form, or name the extra obstruction.",
    "<strong>Prefer simulating backwards.</strong> Forward moves often branch; backward moves often collapse onto a unique predecessor, which makes the construction shorter.",
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
    derivation: [
      "<p>The point of an invariant is to refuse a search. Leftover of a gcd, xor of <code>n</code> piles, leftover of a digit sum, and parity of a sum are each a handful of arithmetic operations. Inversion parity is a double loop, <code>O(n<sup>2</sup>)</code>, or a Fenwick tree at <code>O(n log n)</code>, still linear-ish in contest limits. A matching construction is usually one more pass.</p>",
      "<p>Putting real numbers in: a frog on a circle of size <code>10<sup>9</sup></code> is one gcd and one remainder, a few nanoseconds, against a BFS of a billion nodes. A 15-puzzle layout space is about <code>10<sup>13</sup></code> states; inversion parity plus blank taxicab is a scan of 16 cells. If you skip the invariant and search first, those limits are what kill you.</p>",
    ],
    compare: [
      ["BFS states", "O(|S|)", "O(|S|)", "When I is not enough"],
      ["Invariant", "O(n)", "O(1)", "Impossibility"],
      ["I + construct", "O(n log n)", "O(n)", "Full solution"],
      ["Grundy", "O(states)", "O(states)", "Games"],
    ],
  },
  pitfalls: [
    { title: "I not actually preserved",
      bug: "The first two move types leave <code>I</code> alone, so the quantity looks invariant, and a third type quietly flips it. Your NO answers become wrong on tests that use that third type.",
      fix: "Prove preservation for a generic move of every type listed in the statement, not for one example of the first type." },
    { title: "Necessity as sufficiency",
      bug: "Start and target share a gcd, so you return YES, but a hidden extra obstruction (a capacity cap, a colour, a second parity) still makes the target unreachable.",
      fix: "Construct a path, or name the extra invariant. A tiny counter-example that matches <code>I</code> and is still stuck is the test." },
    { title: "Mod 9 vs digital root 9",
      bug: "Digital root of 18 is written 9 in some popularisations, but leftover of 18 modulo 9 is 0. Comparing 9 to 0 looks like a mismatch and rejects a reachable target.",
      fix: "Compare residues in <code>0..8</code>. Treat a digital root of 9 as leftover 0, and test 18 against 9 and against 27." },
    { title: "15-puzzle missing blank taxicab",
      bug: "Permutation parity alone looks like the whole story on a 4 by 4 board, but the blank's taxicab distance to home has a parity that also has to match. Half the &ldquo;same parity&rdquo; positions are still impossible.",
      fix: "XOR the permutation parity with the blank's taxicab parity. Both must match the target. Check the classic 14-15 swap, which is the standard impossible instance." },
    { title: "BFS after a cheap NO",
      bug: "You already know the invariant differs, but you still search, which looks thorough and then times out on the large NO cases.",
      fix: "Evaluate <code>I</code> first and return NO immediately on a mismatch. Search only the equal-<code>I</code> slice, if you search at all." },
  ],
  variants: [
    ["Board colouring", "Knight stays on one colour.", "chess", ""],
    ["Nim xor", "Zero xor is the losing position.", "games page", ""],
    ["Potential", "Strictly decreases — proves termination, not invariance.", "different tool", ""],
  ],
  followups: [
    ["Invariant vs potential?",
      "<p>An invariant is a number that every legal move leaves unchanged, and it proves a target is impossible when the values differ. A potential is a number that every move strictly decreases, and it proves that a process cannot run forever. They answer different questions. Mixing the words on a whiteboard confuses the listener even when both proofs are correct.</p>"],
    ["How do you invent I?",
      "<p>Look at what a move adds on one side and subtracts on the other. The cheapest quantity that is not the tautology &ldquo;0 equals 0&rdquo; is usually the sum, the leftover of a gcd, a parity, or a colour. If every cheap guess changes, maybe there is no one-line invariant and you do need a search or a DP.</p>"],
    ["Two step sizes a and b on a circle?",
      "<p>The reachable residues are the multiples of <code>gcd(a, b, n)</code>. You can reach a target at distance <code>d</code> exactly when that gcd divides <code>d</code>. That is B&eacute;zout on three integers: some combination of the two steps, wrapped by the circle length, equals the distance. One step size is the special case <code>gcd(step, n)</code> divides <code>d</code>.</p>"],
    ["When is same I enough?",
      "<p>When you can reduce every state that shares that value of <code>I</code> to a single normal form by legal moves (sorted array, empty jugs, all chips on one cell). Then the level set is connected and matching <code>I</code> is a path. If you cannot name that normal form, treat same <code>I</code> as &ldquo;not yet no&rdquo; and keep working.</p>"],
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
  readTime: "28 min",
  tagline: "|A\u222aB|=|A|+|B|-|A\u2229B|. For n sets the sign is (-1)^{|S|+1}. The same sum counts surjections, derangements, and coprime lattice points.",
  tags: ["inclusion-exclusion", "PIE", "Möbius", "P2"],
  prereqs: [["Combinatorics", "combinatorics.html"], ["Primes & Sieves", "primes-and-sieves.html"]],
  why: [
    "You are asked how many integers from 1 to 10 are divisible by 2 or by 3. Counting multiples of 2 gives 5, counting multiples of 3 gives 3, and adding them gives 8, which is too big because 6 was counted twice. Subtract the one number that is divisible by both and you get 7, which you can check by listing: 2, 3, 4, 6, 8, 9, 10. That is inclusion-exclusion on two sets: overcount, then correct.",
    "Three sets is the same habit with one more correction. Multiples of 2, 3, or 5 up to 10: add the three single counts (5+3+2), subtract the three pairwise overlaps (multiples of 6, 10, and 15), then add back the triple overlap (multiples of 30) because the pairwise subtractions removed it too often. The running total is 5+3+2-1-1-0+0=8. Once you can see the overcount-and-correct on two and three sets, the <code>k</code>-set loop is just that pattern in a mask.",
    "In code you loop every non-empty subset of <code>k</code> properties. The sign is plus when the subset size is odd (you are adding a single, or a triple, &hellip;) and minus when it is even (you are subtracting a pairwise overlap). The product <code>2<sup>k</sup></code> times the cost of counting one intersection must fit; <code>k &le; 20</code> is the usual comfort zone. The phrase &ldquo;divisible by any of these primes&rdquo; or &ldquo;at least one property&rdquo; next to a small <code>k</code> is the constraint that names this page.",
    "The same overcount-and-correct counts derangements (permutations with no fixed point), surjections onto <code>k</code> labels, and pairs with gcd 1. M&ouml;bius inversion is the packaged form on the divisor lattice: leftover of a sum of <code>mu[d]</code> over divisors of <code>n</code> is 1 when <code>n</code> is 1 and 0 otherwise, which turns &ldquo;coprime pairs up to <code>n</code>&rdquo; into a single sum you can sieve.",
  ],
  insight: "You can count a union whenever you can count every intersection. Overcount by adding the singles, correct by subtracting the pairwise overlaps, and on three sets add the triple back. An element that sits in exactly <code>r</code> sets is then counted once, which is why the signed sum equals the size of the union.",
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
  constraint: "A mask loop is comfortable at <code>k &le; 20</code>, because <code>2<sup>20</sup></code> is about a million subsets and each intersection must be cheap. M&ouml;bius up to <code>n = 10<sup>7</sup></code> is one linear sieve. Sums that group <code>floor(n/d)</code> into blocks run in about <code>2 sqrt n</code> iterations, a few thousand at <code>n = 10<sup>6</sup></code>. A universe scan of size <code>n</code> times <code>k</code> dies when <code>n</code> is <code>10<sup>12</sup></code> and <code>k</code> is 20.",
  core: [
    "Start with two sets and say the words out loud. Size of the union is size of A plus size of B minus size of the overlap: you overcounted every element that sat in both, so you subtract the overlap once and each element is counted once. Three sets: add the three singles, subtract the three pairwise overlaps (those elements were added twice too many times after the singles), then add the triple overlap back because the three pairwise subtractions removed it completely. That signed combination is the size of the union of A, B, and C.",
    "The mask loop is the same overcount-and-correct for <code>k</code> properties. Skip mask 0, which would add the whole universe. For each non-empty mask, count the intersection of the chosen properties &mdash; for &ldquo;divisible by these primes&rdquo; that count is <code>floor(n / product)</code>, the number of multiples of that product up to <code>n</code>. Add the term when the popcount is odd, subtract when it is even. If the product would exceed <code>n</code>, skip: there are no multiples, and a wrapped product would invent some.",
    "Walk the sample. Up to 10, multiples of 2 or 3: singles 5+3, overlap 1, union 7. Add 5: singles 5+3+2, pairs 1, 1, 0, triple 0, union 8. Derangements of 3 items: start from <code>3! = 6</code> permutations, subtract those that fix at least one point by the same signed sum, and you get 2 (the two 3-cycles). M&ouml;bius of 1..6 is <code>1, -1, -1, 0, -1, 1</code>, the precomputed signs for the divisor form of the same idea. Always verify the <code>k = 2</code> mask loop against size A plus size B minus the overlap before you trust a larger <code>k</code>.",
  ],
  invariant: "<p>An element that belongs to exactly <code>r &ge; 1</code> of the sets is added once for each singleton it sits in, subtracted once for each pair, added once for each triple, and so on. That signed combination of binomial coefficients equals 1, so the element contributes 1 to the union.</p><p>In plain words, you overcount, then you correct, and after the corrections every element that was in at least one set has been counted exactly once.</p><p>Interview sentence: <em>&ldquo;Add the singles, subtract the overlaps, add the triples back.&rdquo;</em></p>",
  extra: [
    {
      kind: "key",
      title: "Two sets, then three, then the mask",
      html: "<p>Size of A union B is size A plus size B minus the overlap. Size of A union B union C adds the third single, subtracts the three new pairwise overlaps, and adds the triple. The mask loop is that paragraph, not a different idea.</p>",
    },
    {
      kind: "warn",
      title: "Mask 0 is the universe",
      html: "<p>Popcount 0 is even, so a sloppy sign rule subtracts or adds <code>n</code> and the answer is off by the size of the whole universe. Start the loop at mask 1.</p>",
    },
  ],
  array: [10, 6, 4, 2],
  arrayLabel: "term =",
  indexLabels: ["U", "A", "B", "A\u2229B"],
  vars: ["step", "term", "acc"],
  frames: [
    { note: "Up to 10, overcount multiples of 2 and of 3: five plus three is eight, and 6 was counted twice.",
      active: [1], values: { step: "singles", term: "5+3", acc: 8 } },
    { note: "Correct by subtracting the one overlap (multiples of 6). The union is 7: 2, 3, 4, 6, 8, 9, 10.",
      active: [3], values: { step: "pair", term: "-1", acc: 7 } },
    { note: "Three primes: add 5+3+2, subtract the three pairwise overlaps, add the triple, total 8.",
      active: [0], values: { step: "3 primes", term: 8, acc: 8 } },
    { note: "Derangements of 3: start from 6 permutations and apply the same signed sum, which leaves 2.",
      active: [2], values: { step: "derange", term: 2, acc: 2 } },
    { note: "Möbius values on 1..6 are the precomputed plus-or-minus signs for the divisor form of this sum.",
      active: [0], values: { step: "mu", term: "pairs", acc: "sum" } },
    { note: "Skip the empty mask, which is the whole universe, and add a term when the popcount is odd.",
      active: [0], values: { step: "sign", term: "popcount", acc: "odd+" } },
  ],
  mermaid: `flowchart LR
  u["union"] --> a["plus singles"]
  u --> b["minus pairs"]
  u --> c["plus triples"]`,
  dryIntro: "Overcount multiples of 2 or 3 up to 10, correct the overlap, then do the same for three primes and a derangement.",
  steps: [
    "<strong>Name properties so every intersection is countable.</strong> &ldquo;Divisible by this prime&rdquo; and &ldquo;fixes this position&rdquo; work; a property whose overlap you cannot count is the wrong setup.",
    "<strong>Loop every non-empty mask.</strong> Masks from 1 through <code>(1&lt;&lt;k)-1</code> are the singles, the pairs, the triples, and so on. Mask 0 is the universe and must not enter the sum.",
    "<strong>Sign by popcount.</strong> Add the intersection when the subset size is odd (overcount), subtract when it is even (correct). That is the two-set and three-set paragraph in a loop.",
    "<strong>Skip a product that exceeds n.</strong> There are then no multiples, and a 64-bit wrap would invent a fake <code>floor(n / product)</code>.",
    "<strong>Reach for Möbius on divisor questions.</strong> The sieve writes the same plus-or-minus signs on the divisor lattice, so coprime-pair counts become one sum over <code>d</code>.",
    "<strong>Verify the k=2 case by hand.</strong> The mask loop must reproduce size A plus size B minus the overlap before you trust a larger <code>k</code>.",
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
    derivation: [
      "<p>The mask loop visits <code>2<sup>k</sup> - 1</code> non-empty subsets. If counting one intersection costs <code>T</code> (a product of <code>k</code> primes, or a stars-and-bars choose), the whole union is <code>O(2<sup>k</sup> T)</code>. M&ouml;bius is one linear sieve, then a sum over <code>d = 1..n</code>. Grouping equal values of <code>floor(n/d)</code> collapses that sum to about <code>2 sqrt n</code> blocks.</p>",
      "<p>Putting real numbers in: <code>k = 20</code> is a million subsets; if each intersection is a handful of arithmetic operations the batch finishes in tens of milliseconds. A universe scan at <code>n = 10<sup>12</sup></code> is impossible. M&ouml;bius to <code>10<sup>7</sup></code> is a few hundred milliseconds and 40 MB; the same sum at <code>n = 10<sup>12</sup></code> needs a Dirichlet prefix (Du-Jiao) or a promised smaller limit. Floor-block sums at <code>n = 10<sup>12</sup></code> are about two million iterations and are fine on their own.</p>",
    ],
    compare: [
      ["Brute universe", "O(U k)", "O(1)", "U small"],
      ["IE 2^k", "O(2^k T)", "O(k)", "k<=20"],
      ["Möbius + floor", "O(n+\u221an)", "O(n)", "gcd"],
      ["SOS DP", "O(n 2^n)", "O(2^n)", "subset zeta"],
    ],
  },
  pitfalls: [
    { title: "Wrong sign / empty mask",
      bug: "Mask 0 has popcount 0, so a sloppy sign rule adds or subtracts the whole universe. The answer is off by <code>n</code> and still looks like a plausible count.",
      fix: "Start at mask 1. Add when popcount is odd, subtract when even. The two-set case must reproduce size A plus size B minus the overlap." },
    { title: "Product overflow",
      bug: "The product of the chosen primes wraps a <code>long</code>, so <code>n / prod</code> becomes a huge fake count of multiples and the union is wildly too large.",
      fix: "If the next prime would make <code>prod &gt; n</code>, skip that mask. There are then no multiples of that product up to <code>n</code>." },
    { title: "mu of a square not zeroed",
      bug: "Writing <code>mu[i*p] = -mu[i]</code> even when <code>p</code> already divides <code>i</code> leaves a non-zero M&ouml;bius value on a square. Later coprime-pair sums include extra terms and look only slightly off.",
      fix: "If <code>p</code> divides <code>i</code>, set <code>mu[i*p] = 0</code>. After the sieve, <code>mu[4]</code>, <code>mu[9]</code>, and <code>mu[12]</code> must all be 0." },
    { title: "Derangement integer /",
      bug: "Forming leftover of <code>n! / k!</code> with Java <code>/</code> truncates, so the signed sum is no longer the integer number of derangements.",
      fix: "Keep a running multiply leftover <code>M</code>, or stay in exact integers with a running product that divides evenly at each step." },
    { title: "min(|A|,|B|) as intersection",
      bug: "The smaller of the two set sizes is a cheap number and looks like an overlap bound, but it is not the size of the intersection, so the correction term is wrong.",
      fix: "Count the overlap from the structure: multiples of the lcm, or elements that satisfy both constraints. For 2-or-3 up to 10 that overlap is 1, not min(5, 3)=3." },
  ],
  variants: [
    ["Bars + caps", "Subtract C(n'+k-1, k-1) per exceeding subset.", "CF 451E", ""],
    ["Surjections", "\u03a3 (-1)^{k-i} C(k,i) i^n", "onto functions", ""],
    ["Subset Möbius", "SOS DP is fast zeta on 2^[n].", "sos-dp", ""],
  ],
  followups: [
    ["Why is an r-set element counted once?",
      "<p>Picture an element that sits in exactly three of your sets. The singles add it three times. The pairwise overlaps subtract it three times, which removes it completely. The triple adds it back once. Net contribution: 1. In general the signed sum of &ldquo;how many of its <code>r</code> memberships you pick&rdquo; is 1 for every <code>r &ge; 1</code>, which is why overcount-and-correct equals the size of the union rather than some other combination.</p>"],
    ["Möbius vs raw IE?",
      "<p>Raw inclusion-exclusion loops subsets of a short list of properties. M&ouml;bius is the same signed sum, precomputed on the divisor lattice: <code>mu[d]</code> is the plus-or-minus (or zero on squares) you would have written by hand for the property &ldquo;divisible by <code>d</code>&rdquo;. Use the mask loop when <code>k</code> is tiny and the properties are arbitrary; use M&ouml;bius when the properties are &ldquo;divisible by this integer&rdquo; up to <code>n</code>.</p>"],
    ["n=1e12 in sum mu[d] floor(n/d)^2?",
      "<p>That sum computes the number of coprime pairs <code>(i, j)</code> with both at most <code>n</code>: for each <code>d</code>, leftover of <code>mu[d]</code> times the square of how many multiples of <code>d</code> sit in <code>1..n</code>. You cannot sieve <code>mu</code> to <code>10<sup>12</sup></code>. Either the limit is actually <code>10<sup>7</sup></code>, or you need a Dirichlet prefix (Du-Jiao / min_25). Floor-block grouping alone does not remove the need for <code>mu[d]</code>.</p>"],
    ["Three-set formula?",
      "<p>Add the three single sizes (overcount), subtract the three pairwise overlaps (correct the double-counted elements), then add the triple overlap back because those last elements were subtracted too often. The result is the number of elements that sit in at least one of the three sets. It is the two-set rule with one extra correction, and the mask loop is that sentence for every subset size.</p>"],
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
  readTime: "28 min",
  tagline: "A linear recurrence <code>x<sub>n</sub> = &Sigma; a<sub>i</sub> x<sub>n-i</sub></code> is one matrix multiply. Binary exponentiation of that matrix jumps <code>n</code> steps in <code>O(k&sup3; log n)</code>.",
  tags: ["matrix expo", "linear recurrence", "P2"],
  prereqs: [
    ["Modular Arithmetic", "modular-arithmetic.html"],
    ["Recurrences", "../00-foundations/recurrences-and-master-theorem.html"],
  ],
  why: [
    "You are asked for the <code>n</code>-th Fibonacci number, or the number of ways to tile a <code>2 &times; n</code> board, and <code>n</code> can be <code>10<sup>18</sup></code>. Adding the last two terms in a loop is <code>10<sup>18</sup></code> additions and will not return. The same blow-up hits &ldquo;walks of length <code>n</code>&rdquo; on a small graph: raising the adjacency matrix by multiplying it <code>n</code> times is still linear in <code>n</code>. You need a way to jump many steps at once.",
    "If the next state is always a fixed linear mix of the current state &mdash; written <code>S<sub>t+1</sub> = A S<sub>t</sub></code>, where <code>A</code> is a <code>k &times; k</code> matrix of coefficients and <code>S<sub>t</sub></code> is a column of <code>k</code> numbers &mdash; then the state after <code>n</code> steps is leftover of <code>A<sup>n</sup> S<sub>0</sub></code>. That power is the same binary exponentiation you already know for scalars, except each multiply is a matrix multiply. Fibonacci is the 2-by-2 case; a <code>k</code>-term recurrence is a <code>k</code>-by-<code>k</code> companion matrix; walks are the adjacency matrix.",
    "The constraint that names this page is <code>n &le; 10<sup>18</sup></code> next to a linear recurrence or a small graph. The state size <code>k</code> is 2 for Fibonacci, 3 to 6 for many tilings, and <code>|V|</code> for walks. Each matrix multiply is about <code>k<sup>3</sup></code> cell products, and you do about <code>60</code> of them, so <code>k = 20</code> is comfortable and <code>k = 100</code> is already a million times sixty modular multiplies, borderline in Java.",
    "If the recurrence is not linear &mdash; <code>x<sub>n</sub> = x<sub>n-1</sub><sup>2</sup></code>, or a min / max that is not a linear combination &mdash; a matrix cannot encode the step and this page does not apply. If <code>n</code> is only a million and <code>k</code> is huge, just iterate the recurrence. Shortest paths use a different semiring and are not this multiply.",
  ],
  insight: "Once you write the state as a column of the last <code>k</code> terms, there is only one matrix <code>A</code> that sends that column to the next column. After that the whole problem is binary exponentiation of <code>A</code>, which computes leftover of <code>A<sup>n</sup></code> and therefore the state after <code>n</code> steps.",
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
  constraint: "<code>n &le; 10<sup>18</sup></code> is the tell. State size <code>k &le; 20</code> is comfortable in Java; <code>k &le; 80</code> is possible if you are careful with constants. Always reduce leftover the required prime after every cell product. If <code>n</code> is only <code>10<sup>6</sup></code>, iterate the recurrence and skip the matrices.",
  core: [
    "Fibonacci first, so the letters mean something. Let the state column be the pair <code>(F<sub>t</sub>, F<sub>t-1</sub>)</code>. The next pair is <code>(F<sub>t+1</sub>, F<sub>t</sub>) = (F<sub>t</sub>+F<sub>t-1</sub>, F<sub>t</sub>)</code>, which is what the matrix <code>A = [[1, 1], [1, 0]]</code> computes when it multiplies the current column: first row is &ldquo;sum the two entries&rdquo;, second row is &ldquo;copy the first entry down&rdquo;. Starting from <code>(F<sub>1</sub>, F<sub>0</sub>) = (1, 0)</code>, leftover of <code>A<sup>n-1</sup></code> times that column is <code>(F<sub>n</sub>, F<sub>n-1</sub>)</code>. The top-left cell of that power is therefore leftover of <code>F<sub>n</sub></code>.",
    "A general <code>k</code>-term recurrence uses a <em>companion matrix</em>: first row is the coefficients, and each later row is a shift that copies one old term down, which is what &ldquo;remember the last <code>k-1</code> terms&rdquo; means. Multiply two <code>k &times; k</code> matrices in the triple loop of <code>k<sup>3</sup></code> cell products, reducing leftover the prime every time. Binary exponentiation is then the scalar loop you already know: start from the identity, square <code>A</code>, and multiply into the result when the current bit of <code>n</code> is on. Use <code>long</code> for every product.",
    "Walk <code>F<sub>10</sub></code>. Ten in binary is <code>1010</code>, so you need leftover of <code>A<sup>8</sup> A<sup>2</sup></code>. Squaring gives <code>A<sup>2</sup></code> (which holds <code>F<sub>2</sub>, F<sub>1</sub></code>), then <code>A<sup>4</sup></code> (<code>F<sub>4</sub>, F<sub>3</sub></code>), then <code>A<sup>8</sup></code> (<code>F<sub>8</sub>, F<sub>7</sub></code>). Multiplying the 8-step and 2-step powers produces leftover of <code>F<sub>10</sub> = 55</code>. Which cell you read depends on whether you powered <code>n</code> or <code>n-1</code> and on the base column; pick one convention and test <code>F<sub>0</sub>=0</code>, <code>F<sub>1</sub>=1</code>, <code>F<sub>10</sub>=55</code>. For walks, <code>A</code> is the adjacency matrix and leftover of <code>A<sup>n</sup>[u][v]</code> is the number of walks from <code>u</code> to <code>v</code> of length <code>n</code>.",
  ],
  invariant: "<p>If every single step satisfies <code>S<sub>t+1</sub> = A S<sub>t</sub></code>, then leftover of <code>A<sup>n</sup> S<sub>t</sub></code> is the state <code>n</code> steps later. Binary exponentiation computes that power by leftover of <code>(A<sup>m</sup>)<sup>2</sup> = A<sup>2m</sup></code> and leftover of <code>A &middot; A<sup>2m</sup> = A<sup>2m+1</sup></code>.</p><p>In plain words, one matrix multiply is one step of the recurrence, so a power of that matrix is many steps at once, and you build the power by squaring just as you do for a scalar.</p><p>Interview sentence: <em>&ldquo;Write the linear step as a matrix, then fast-pow the matrix.&rdquo;</em></p>",
  extra: [
    {
      kind: "warn",
      title: "Off-by-one on F_0 and F_1",
      html: "<p>Powering <code>A<sup>n-1</sup></code> with <code>n = 0</code> underflows. Special-case zero, and test <code>F<sub>0</sub> = 0</code>, <code>F<sub>1</sub> = 1</code>, <code>F<sub>10</sub> = 55</code> before you trust a huge <code>n</code>.</p>",
    },
    {
      kind: "tip",
      title: "Reduce every cell product",
      html: "<p>Leaving the reduce until the end of <code>mul</code> lets intermediate cells grow past <code>M</code> and then past a <code>long</code>. Reduce leftover the prime on every <code>a[i][k] * b[k][j]</code>.</p>",
    },
  ],
  array: [0, 1, 1, 2, 3, 5, 8],
  arrayLabel: "F =",
  vars: ["n", "bit", "Fn"],
  frames: [
    { note: "Want F_10. The companion A is [[1,1],[1,0]] and the start column is (F_1, F_0) = (1, 0).",
      active: [1], values: { n: 10, bit: "init", Fn: "—" } },
    { note: "Ten in binary is 1010, so square A to the 2, 4 and 8 powers, then multiply the 2-step and 8-step results.",
      active: [2], values: { n: 10, bit: "1010", Fn: "pow" } },
    { note: "Those powers hold (F_2, F_1), then (F_4, F_3), then (F_8, F_7) in the same cell convention.",
      active: [4], values: { n: 8, bit: "A8", Fn: 21 } },
    { note: "Leftover of A^8 times A^2 is A^10, and the answer cell is F_10 = 55.",
      active: [6], values: { n: 10, bit: "done", Fn: 55 } },
    { note: "Which cell you read depends on the base column. Pick one convention and check it against F_10 = 55.",
      active: [6], values: { n: 10, bit: "check", Fn: 55 } },
    { note: "On a graph the same power of the adjacency matrix counts walks: cell (u, v) is walks from u to v of length n.",
      best: [6], values: { n: "n", bit: "graph", Fn: "A^n" } },
  ],
  mermaid: `flowchart TD
  rec["S t+1 = A S t"] --> pow["S n = A to the n times S 0"]
  pow --> bin["binary exponentiation"]
  bin --> sq["square A"]
  bin --> mul["multiply into result when bit is on"]`,
  dryIntro: "Power the Fibonacci companion to reach F_10 by squaring, then read the answer cell and the walk interpretation.",
  steps: [
    "<strong>Write the state column.</strong> Size <code>k</code> is the last <code>k</code> terms of the recurrence, or one slot per vertex if you are counting walks. That column is what one matrix multiply will advance.",
    "<strong>Write the matrix A that takes one step.</strong> Check by hand that leftover of <code>A</code> times the current column is the next column. A wrong first row is the usual silent off-by-one.",
    "<strong>Fast-pow from the identity.</strong> Start <code>res = I</code> and run the binary loop: square <code>A</code>, multiply into <code>res</code> on a 1-bit. Each multiply is the <code>k<sup>3</sup></code> triple loop.",
    "<strong>Reduce leftover the prime on every cell.</strong> Use <code>long</code> for the product. Skipping the reduce lets a cell grow past a <code>long</code> and the leftover is garbage.",
    "<strong>Multiply the power by S_0 and read the answer cell.</strong> That cell is leftover of the term the statement asked for. Do not print a random entry of <code>A<sup>n</sup></code>.",
    "<strong>Test n = 0, 1, and 10.</strong> Fibonacci powered as <code>A<sup>n-1</sup></code> underflows at zero. Confirm <code>F<sub>0</sub> = 0</code>, <code>F<sub>1</sub> = 1</code>, <code>F<sub>10</sub> = 55</code> before a huge exponent.",
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
      "<p>Binary exponentiation does about <code>log<sub>2</sub> n</code> squarings and a handful of extra multiplies on 1-bits. Each multiply of two <code>k &times; k</code> matrices is <code>k<sup>3</sup></code> cell products, so the whole power is about <code>k<sup>3</sup> log n</code> modular multiplies. A sparse adjacency (a path, a cycle) can drop a factor if you skip zero cells, but you should not count on that in the worst case.</p>",
      "<p>Putting real numbers in: Fibonacci is <code>k = 2</code>, so about <code>8 &times; 60 = 480</code> cell products at <code>n = 10<sup>18</sup></code>, a few microseconds. A tiling profile with <code>k = 20</code> is <code>8000 &times; 60 = 4.8 &times; 10<sup>5</sup></code> multiplies, comfortable. At <code>k = 100</code> you are near <code>6 &times; 10<sup>7</sup></code> multiplies, tight in Java. Looping the recurrence at <code>n = 10<sup>18</sup></code> is impossible; looping it at <code>n = 10<sup>6</sup></code> is faster than building matrices.</p>",
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
      bug: "Powering <code>A<sup>n-1</sup></code> with <code>n = 0</code> underflows a <code>long</code>, or you return leftover of <code>A[0][0]</code> as <code>F<sub>0</sub></code>, which is 1 rather than 0. Small samples that start at <code>n = 10</code> hide it.",
      fix: "Special-case zero. Test leftover of <code>F<sub>0</sub> = 0</code>, <code>F<sub>1</sub> = 1</code>, and <code>F<sub>10</sub> = 55</code> before a huge exponent." },
    { title: "int overflow before mod",
      bug: "A cell product of two residues near <code>10<sup>9</sup></code>, accumulated <code>k</code> times without a reduce, can exceed <code>2<sup>63</sup></code> and wrap a <code>long</code>. The leftover then looks like a plausible Fibonacci number.",
      fix: "Reduce both factors leftover the prime first; then one product fits in a <code>long</code>. Reduce again after adding into the cell." },
    { title: "Result matrix vs base vector",
      bug: "You print leftover of <code>A<sup>n</sup>[0][0]</code> but the identity you proved was leftover of <code>A<sup>n-1</sup></code> times the start column, so every answer is the wrong Fibonacci.",
      fix: "Write one step on paper and match the pair <code>(F<sub>n</sub>, F<sub>n-1</sub>)</code>. The three-value test above catches the shift." },
    { title: "Forgetting the modulus on the identity",
      bug: "The identity is already reduced, so it looks safe, but intermediate cells of later multiplies grow past the prime and then past a <code>long</code> if you only reduce at the end of <code>mul</code>.",
      fix: "Reduce leftover the prime on every cell product inside <code>mul</code>, not once after the triple loop." },
    { title: "Min-plus for shortest paths of length n",
      bug: "Ordinary plus-and-times counts walks and produces a large number that looks like a distance on tiny graphs. The statement asked for a shortest path of length <code>n</code>.",
      fix: "Walks use leftover of plus and times. A shortest <code>k</code>-edge path uses min and plus, a different semiring, and is rarely what a matrix-expo problem wants." },
  ],
  variants: [
    ["Prefix sums of Fib", "State [F_n, F_{n-1}, S_n]; one extra row/column adds F_n into S.", "3×3", "sum of first n"],
    ["Periodic / Pisano", "Fib mod P is periodic; matrix expo still wins for 1e18.", "same code", "CSES"],
    ["Graph walks", "A = adjacency (0/1 or weighted). A^n[u][v] ways.", "k = |V|", "CF walks"],
  ],
  followups: [
    ["Why companion matrix looks like that?",
      "<p>The first row is the linear combination that computes the newest term from the previous <code>k</code> terms &mdash; those are the recurrence coefficients. Every later row is a shift: it copies one old term one slot down so the next column still holds a window of the last <code>k</code> values. That is what &ldquo;remember the last <code>k-1</code> terms&rdquo; means, written as a matrix so you can raise it to a power.</p>"],
    ["Can you do better than k³?",
      "<p>Strassen's multiply helps only for huge <code>k</code> that contests do not use. For a single linear recurrence, Berlekamp&ndash;Massey plus Kitamasa computes the <code>n</code>-th term in about <code>k<sup>2</sup> log n</code>, which is worth it around <code>k ~ 1000</code> and overkill at <code>k = 20</code>. Quote <code>k<sup>3</sup> log n</code> unless someone asks.</p>"],
    ["How do you get the sum of a geometric of matrices?",
      "<p>The sum leftover of <code>I + A + ... + A<sup>n-1</sup></code> is the total of the first <code>n</code> states if each state is a matrix power. If <code>n</code> is even it factors as leftover of <code>(I + A^{n/2})</code> times the half-sum, which is a doubling just like the power. The other route is to augment the state with a running total so one extra row accumulates the newest term.</p>"],
    ["Interview: Fib O(log n) without matrices?",
      "<p>The doubling identities leftover of <code>F(2n) = F(n)(F(n+1)+F(n-1))</code> and leftover of <code>F(2n+1) = F(n)<sup>2</sup> + F(n+1)<sup>2</sup></code> give the same <code>log n</code> without storing arrays. They are Fibonacci-only. Matrices are the form that still works for a 5-state tiling or a graph walk, which is why interviews accept either and prefer the matrix once the recurrence is not Fibonacci.</p>"],
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
  readTime: "28 min",
  tagline: "Points are <code>long</code> pairs. Orientation is a cross product. Almost every elementary geometry test — left of a line, segment intersection, polygon area — is that one signed area.",
  tags: ["geometry", "cross product", "orientation", "P2"],
  prereqs: [["Complexity Analysis", "../00-foundations/complexity-analysis.html"]],
  why: [
    "You are given three points A, B, and C with integer coordinates, and you must say whether walking A to B to C turns left, turns right, or stays on a straight line. Sine and cosine will not help: they are floating, they need an angle, and contests almost never give you one. What you need is the sign of one 2-D cross product, because that sign is which way the turn goes.",
    "Coordinates go up to <code>10<sup>9</sup></code>, so a product of two differences is a <code>2 &times; 10<sup>9</sup> &times; 2 &times; 10<sup>9</sup> = 4 &times; 10<sup>18</sup></code> candidate. That fits in a <code>long</code> and does not fit in an <code>int</code>. Division is the enemy: dividing by two to get an area, or taking a hypotenuse, throws away the exact predicate and then you compare a double to zero with an epsilon. Prefer comparing the raw cross product to zero.",
    "Almost every elementary test is that same signed area. Two segments intersect when the endpoints of each straddle the other line, which is four turn tests. Polygon area is the shoelace sum of consecutive crosses, which computes twice the signed area of the polygon. Point-in-polygon is winding or ray-crossing, both built from the same orientation. Convex hull on the next page is a stack of left-turn tests.",
    "The constraint that names this page is integer coordinates, often <code>|x|, |y| &le; 10<sup>9</sup></code>, next to questions about left-of-a-line, intersection, or area, with <code>n &le; 10<sup>5</sup></code> so each test must be constant time. If the statement wants a floating intersection point and allows <code>10<sup>-9</sup></code> error, still decide the combinatorial questions with <code>long</code> predicates first.",
  ],
  insight: "The 2-D cross product leftover of <code>u.x*v.y - u.y*v.x</code> computes twice the signed area of the triangle from the origin through <code>u</code> and <code>v</code>. Its sign is which way the turn goes: positive is left, negative is right, zero is collinear. Overflow of that multiply is the usual wrong answer.",
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
  constraint: "Coordinates satisfy <code>|x|, |y| &le; 10<sup>9</sup></code>, so every cross product must be a <code>long</code>. Coordinates up to <code>10<sup>18</sup></code> need BigInteger or a 128-bit emulation. An <code>O(n)</code> scan is fine at <code>n &le; 10<sup>5</sup></code>; closest pair is the <code>O(n log n)</code> follow-up. A double epsilon test at these magnitudes is a wrong-answer factory.",
  core: [
    "A point is a pair of <code>long</code>s. Subtracting <code>b</code> from <code>a</code> is the vector from <code>b</code> to <code>a</code>. The 2-D cross product leftover of <code>u.x*v.y - u.y*v.x</code> computes twice the signed area of the parallelogram spanned by <code>u</code> and <code>v</code>. Orientation of A, B, C is the sign of that cross on the vectors <code>B-A</code> and <code>C-A</code>: positive means C is to the left of the directed line AB (you turn left at B), negative means you turn right, and zero means the three points are collinear. That sign is which way the turn goes, and it is the only predicate most of this page needs.",
    "Two segments AB and CD intersect properly when C and D lie on opposite sides of AB and A and B lie on opposite sides of CD &mdash; four orientation tests whose signs oppose in pairs. Inclusive intersection also accepts the collinear-and-touching case: the orientation is zero and the shared point lies inside the bounding box of the other segment. Polygon area is the shoelace sum: add leftover of <code>p<sub>i</sub> &times; p<sub>i+1</sub></code> around the closed chain, which computes twice the signed area; positive means the vertices were listed counter-clockwise.",
    "Walk A = (0, 0), B = (2, 0), C = (1, 2). The vectors are <code>B-A = (2, 0)</code> and <code>C-A = (1, 2)</code>. The cross leftover of <code>2*2 - 0*1 = 4</code> is positive, so C is left of AB and you turn left at B. If C were (1, -2) the cross would be -4, a right turn. If C were (3, 0) the cross is 0, collinear, and C is not on the segment because 3 sits outside the bounding box of AB. Absolute leftover of 4 over 2 is the triangle area 2. Shoelace on a larger polygon is that same consecutive cross, summed and wrapped from last to first.",
  ],
  invariant: "<p>Walking A to B to C, leftover of the cross of <code>B-A</code> with <code>C-A</code> is positive exactly when you turn left at B, negative when you turn right, and zero when you do not turn. Shoelace leftover of the sum of consecutive crosses is twice the signed area of the polygon, positive when the vertices run counter-clockwise.</p><p>In plain words, you never compute an angle; you compute which way you turned, and that one sign decides left, right, collinear, intersection, and area.</p><p>Interview sentence: <em>&ldquo;The cross-product sign is which way the turn goes.&rdquo;</em></p>",
  extra: [
    {
      kind: "key",
      title: "Sign first, magnitude second",
      html: "<p>The sign of the cross tells you the turn. The absolute value is twice the area of the triangle. Overflow of the multiply corrupts both, so the <code>long</code> cast is not optional decoration.</p>",
    },
    {
      kind: "warn",
      title: "Do not divide to test zero",
      html: "<p>Comparing leftover of the raw cross to 0 is exact. Dividing by 2 or taking <code>hypot</code> and then comparing a double to <code>1e-9</code> is how collinear points become &ldquo;almost collinear&rdquo; and the judge disagrees.</p>",
    },
  ],
  array: [0, 0, 2, 0, 1, 2],
  arrayLabel: "xy =",
  indexLabels: ["Ax", "Ay", "Bx", "By", "Cx", "Cy"],
  vars: ["cross", "orient", "area2"],
  frames: [
    { note: "A is (0,0), B is (2,0), C is (1,2). The two vectors from A are (2,0) and (1,2).",
      active: [0, 1, 2, 3, 4, 5], values: { cross: "—", orient: "—", area2: "—" } },
    { note: "The cross leftover of 2*2 minus 0*1 is 4. Positive means C is left of AB: you turn left at B.",
      active: [4, 5], values: { cross: 4, orient: "+1", area2: 4 } },
    { note: "If C were (1,-2) the same multiply would be -4, so the sign says you turn right at B.",
      active: [4, 5], values: { cross: -4, orient: "-1", area2: 4 } },
    { note: "If C is (3,0) the cross is 0, so the points are collinear, and 3 is outside the segment AB.",
      active: [4, 5], values: { cross: 0, orient: 0, area2: 0 } },
    { note: "Absolute leftover of that cross over 2 is the triangle area 2, twice-signed-area being 4.",
      best: [0, 2, 4], values: { cross: 4, orient: "+1", area2: 4 } },
    { note: "Shoelace sums these consecutive crosses around a closed polygon to get twice the signed area.",
      best: [0, 2, 4], values: { cross: "Σ", orient: "CCW", area2: "2Area" } },
  ],
  mermaid: `flowchart TD
  pts["points A B C"] --> cr["cross of B-A and C-A"]
  cr --> sgn{"sign?"}
  sgn -- plus --> left["C left of AB"]
  sgn -- minus --> right["C right of AB"]
  sgn -- zero --> col["collinear"]`,
  steps: [
  dryIntro: "Compute the turn at B for three placements of C, then read the triangle area and the shoelace idea.",
  steps: [
    "<strong>Store every coordinate as a long.</strong> An <code>int</code> cross of two <code>10<sup>9</sup></code> differences wraps, and both the turn sign and the area become garbage.",
    "<strong>Orientation is the sign of one cross.</strong> Leftover of <code>cross(B-A, C-A)</code> is which way the turn goes: positive left, negative right, zero collinear. Use <code>Long.signum</code>.",
    "<strong>On-segment needs collinear plus a box.</strong> A point sits on AB only when the turn is zero and both coordinates lie between the endpoints, inclusive.",
    "<strong>Intersection is four turns, plus the touching case.</strong> Proper crossing is opposite signs on each pair of endpoints. Inclusive also accepts collinear-and-on-segment.",
    "<strong>Shoelace sums consecutive crosses.</strong> Wrap the last vertex to the first; leftover of that sum is twice the signed area of the polygon.",
    "<strong>A point is inside a convex polygon when every edge turns the same way.</strong> Treat a zero orientation as boundary and read whether the statement wants the boundary included.",
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
      "<p>One orientation is two subtractions and two multiplies, all in <code>long</code>. Inclusive segment intersection is four orientations plus a bounding-box test, still a handful of operations. Shoelace walks each vertex once, so leftover of twice the area is <code>O(n)</code>. Point-in-convex is one turn per edge, also <code>O(n)</code>, or <code>O(log n)</code> after you binary-search the fan from a vertex.</p>",
      "<p>Putting real numbers in: at <code>n = 10<sup>5</sup></code> a scan of orientations is a few hundred thousand multiplies, a millisecond. Closest pair and convex hull add a sort and become the next page. A double <code>atan2</code> sort at coordinate <code>10<sup>9</sup></code> will mis-order a collinear triple and then every later predicate that trusted that order is wrong.</p>",
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
      bug: "A product of two <code>10<sup>9</sup></code> differences wraps an <code>int</code>, so the turn sign flips or becomes zero and a left turn looks collinear. The code still compiles.",
      fix: "Every coordinate and every product is a <code>long</code>. Print leftover of the cross of <code>(10<sup>9</sup>, 0)</code> with <code>(0, 10<sup>9</sup>)</code> and expect a huge positive, not a wrap." },
    { title: "Comparing doubles of areas",
      bug: "Dividing the cross by 2, or taking a hypotenuse, and then comparing a double to zero with <code>1e-9</code> looks like the textbook area test and then fails on a collinear triple the judge considers exact.",
      fix: "Compare leftover of the raw cross to 0. No division, no epsilon, on integer input." },
    { title: "Collinear overlap missed",
      bug: "The proper-straddle test is true only for an interior crossing, so two collinear overlapping segments report false and an inclusive statement marks you wrong.",
      fix: "When any orientation is zero, also accept the case where an endpoint lies on the other segment (bounding box plus collinear)." },
    { title: "CW vs CCW polygon",
      bug: "Shoelace leftover is negative on a clockwise listing, so a point-in-convex that demands a left turn against every edge rejects every interior point.",
      fix: "Reverse the vertex list if twice-area is negative, or accept one consistent sign for the whole walk." },
    { title: "On-boundary policy",
      bug: "The statement says strictly inside and you counted a point on an edge as inside, or the reverse. The turn is zero, so both policies compile and only the statement distinguishes them.",
      fix: "Treat a zero orientation as its own case. Read once whether the boundary is included, and test a point that sits on an edge." },
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

/* Module 12 — Strings, Advanced */
import { pack, lc, cf } from "./pack.mjs";

export const topics = [

/* ============================== 1. kmp-and-prefix-function =========== */
pack({
  id: "kmp-and-prefix-function",
  difficulty: "Medium",
  readTime: "24 min",
  tagline: "The prefix function <code>&pi;[i]</code> is the longest proper prefix of <code>s[0..i]</code> that is also a suffix &mdash; KMP matching is one scan using those borders.",
  tags: ["KMP", "prefix function", "string", "P1"],
  prereqs: [
    ["Two Pointers", "../01-arrays-and-windows/two-pointers.html"],
    ["Hashing Patterns", "../02-sorting-hashing-bits/hashing-patterns.html"],
  ],
  why: [
    "Naive string matching retries after every mismatch and is O(nm). Knuth-Morris-Pratt never rewinds the text pointer: a mismatch jumps the pattern to its next possible border, computed once as the prefix function.",
    "&pi;[i] is the longest proper prefix of s[0..i] that is also a suffix of s[0..i]. Those borders nest, so a mismatch at i walks &pi; like a failure link. The same array finds periods (i+1 is divisible by i+1-&pi;[i]), counts occurrences, and builds the KMP automaton.",
    "Contest problems hide this as \"shortest period\", \"string that is a prefix of every cyclic shift\", and \"count pattern hits allowing overlap\". Rolling hash is the randomised alternative; KMP is deterministic linear time.",
  ],
  insight: "A mismatch at i means the candidate border of length q failed. The next candidate is &pi;[q-1], the longest border of that border. You never skip a possible alignment.",
  yes: [
    "Find all occurrences of pattern p in text t, overlaps allowed, in O(|t|+|p|)",
    "Shortest period of a string: n % (n - &pi;[n-1]) == 0",
    "Build a failure automaton and feed many texts",
    "\"String matching without hashing / without false positives\"",
    "Compress a string by its border structure",
  ],
  no: [
    "Many different patterns in one text &rarr; Aho-Corasick",
    "You only need palindromes &rarr; Manacher",
    "You need lexicographic suffix order &rarr; suffix array",
    "One equality test of two whole strings &rarr; just compare, or a hash",
  ],
  table: [
    ["Occurrences of one pattern", "Build &pi; of p+#+t", "KMP"],
    ["Shortest period", "n % (n-&pi;[n-1])==0 then n-&pi;[n-1]", "Prefix function"],
    ["Many patterns", "Automaton of all patterns", "Aho-Corasick"],
    ["Palindromes", "Radii, not borders", "Manacher"],
    ["Equality of substrings", "Hash or SA+LCP", "Rolling hash"],
    ["<strong>Confused with:</strong> Z-function", "Z[i] is longest prefix starting at i; &pi;[i] is longest border ending at i", "Z and &pi; convert in linear time"],
  ],
  constraint: "<code>|s| &le; 10&#8310;</code> is the linear-string window. Build is strictly O(n). Recursion is not involved.",
  core: [
    "Compute &pi; in one pass. Keep the current border length q. For each i, while q>0 and s[i]!=s[q], q=&pi;[q-1]. Then if s[i]==s[q] q++. &pi;[i]=q.",
    "To match p in t, compute &pi; of p + '#' + t (the sentinel must not appear in either). Every index in the t-region with &pi;[i]==|p| is an occurrence ending at that index.",
  ],
  invariant: "<p>&pi;[i] = max { k : k &lt; i+1, s[0..k) = s[i-k+1..i] }, or 0. After processing i, q is that value, and it is the only border length you need to try next.</p>",
  array: [0, 0, 1, 2, 3, 0],
  arrayLabel: "\u03c0 =",
  indexLabels: ["a", "b", "a", "b", "a", "c"],
  vars: ["i", "q", "pi"],
  frames: [
    { note: "s = ababac. i=0: no proper prefix. \u03c0[0]=0. q=0.",
      active: [0], values: { i: 0, q: 0, pi: "[0]" } },
    { note: "i=1 'b' vs s[0]='a': mismatch, q stays 0. \u03c0[1]=0.",
      active: [1], values: { i: 1, q: 0, pi: "[0,0]" } },
    { note: "i=2 'a'==s[0]. q becomes 1. \u03c0[2]=1. Border \"a\".",
      active: [2], values: { i: 2, q: 1, pi: "[0,0,1]" } },
    { note: "i=3 'b'==s[1]. q becomes 2. \u03c0[3]=2. Border \"ab\".",
      active: [3], values: { i: 3, q: 2, pi: "[0,0,1,2]" } },
    { note: "i=4 'a'==s[2]. q becomes 3. \u03c0[4]=3. Border \"aba\".",
      active: [4], values: { i: 4, q: 3, pi: "[0,0,1,2,3]" } },
    { note: "i=5 'c'!=s[3]='b'. q=\u03c0[2]=1, 'c'!=s[1], q=\u03c0[0]=0, 'c'!=s[0]. \u03c0[5]=0.",
      active: [5], values: { i: 5, q: 0, pi: "[0,0,1,2,3,0]" } },
  ],
  mermaid: `graph LR
  q0["0"] -->|"a"| q1["1 a"]
  q1 -->|"b"| q2["2 ab"]
  q2 -->|"a"| q3["3 aba"]
  q3 -->|"b"| q4["4 abab"]
  q4 -->|"a"| q5["5 ababa"]
  q5 -->|"c"| q6["6 ababac"]
  q1 -.->|"fail pi0=0"| q0
  q2 -.->|"fail pi1=0"| q0
  q3 -.->|"fail pi2=1"| q1
  q4 -.->|"fail pi3=2"| q2
  q5 -.->|"fail pi4=3"| q3
  q6 -.->|"fail pi5=0"| q0`,
  merTitle: "Full failure-function automaton for s = ababac",
  merCaption: "Solid arrows consume the next character. Dotted arrows are fail links: after reading s[0..i], the automaton sits in state i+1 and fail[i+1] = π[i]. A mismatch retries the same character from the fail state. Borders nest: 5 → 3 → 1 → 0.",
  steps: [
    "<strong>Allocate</strong> <code>int[] pi = new int[n]</code>. q starts at 0.",
    "<strong>For i = 1..n-1</strong> (pi[0] is always 0).",
    "<strong>While</strong> q&gt;0 and s[i]!=s[q], q = pi[q-1].",
    "<strong>If</strong> s[i]==s[q], q++.",
    "<strong>pi[i] = q</strong>.",
    "<strong>Match:</strong> build pi of p+'#'+t; report every i with pi[i]==p.length().",
  ],
  code: [
    { tab: "Brute", file: "MatchBrute.java",
      intro: "Try every alignment. Overlaps handled, quadratic.",
      code: `import java.util.*;
public class MatchBrute {
    static List<Integer> find(String t, String p) {
        List<Integer> ans = new ArrayList<>();
        for (int i = 0; i + p.length() <= t.length(); i++) {
            if (t.regionMatches(i, p, 0, p.length())) ans.add(i);
        }
        return ans;
    }
    public static void main(String[] args) {
        System.out.println(find("ababa", "aba"));
    }
    // Input : text ababa, pattern aba
    // Output: [0, 2]
}` },
    { tab: "Optimal", file: "Kmp.java",
      intro: "Prefix function, then match via the sentinel concatenation.",
      highlight: "6-14",
      code: `import java.util.*;
public class Kmp {
    static int[] prefix(String s) {
        int n = s.length();
        int[] pi = new int[n];
        for (int i = 1, q = 0; i < n; i++) {
            while (q > 0 && s.charAt(i) != s.charAt(q)) q = pi[q - 1];
            if (s.charAt(i) == s.charAt(q)) q++;
            pi[i] = q;
        }
        return pi;
    }
    static List<Integer> find(String t, String p) {
        int[] pi = prefix(p + "#" + t);
        List<Integer> ans = new ArrayList<>();
        int m = p.length();
        for (int i = 0; i < t.length(); i++) {
            if (pi[m + 1 + i] == m) ans.add(i - m + 1);
        }
        return ans;
    }
    public static void main(String[] args) {
        System.out.println(find("ababa", "aba"));
        System.out.println(Arrays.toString(prefix("ababac")));
    }
    // Input : ababa / aba, and pi of ababac
    // Output: [0, 2]
    //         [0, 0, 1, 2, 3, 0]
}` },
    { tab: "Template", file: "Period.java",
      intro: "Shortest period from the last prefix value.",
      code: `public class Period {
    static int period(String s) {
        int n = s.length();
        int[] pi = new int[n];
        for (int i = 1, q = 0; i < n; i++) {
            while (q > 0 && s.charAt(i) != s.charAt(q)) q = pi[q - 1];
            if (s.charAt(i) == s.charAt(q)) q++;
            pi[i] = q;
        }
        int p = n - pi[n - 1];
        return n % p == 0 ? p : n;
    }
    public static void main(String[] args) {
        System.out.println(period("ababab"));
        System.out.println(period("abcab"));
    }
    // Input : ababab, then abcab
    // Output: 2
    //         5
}` },
  ],
  complexity: {
    time: "O(n)",
    space: "O(n)",
    derivation: [
      "<p>q increases by at most 1 per i, and every while-iteration decreases q by at least 1. So the inner loop runs &le; n times total. Matching is one prefix-function call on |p|+|t|+1 characters.</p>",
    ],
    compare: [
      ["Naive align", "O(n m)", "O(1)", "tiny strings"],
      ["KMP / prefix function", "O(n+m)", "O(n+m)", "One pattern, deterministic"],
      ["Z-function", "O(n)", "O(n)", "Prefix matches at every index"],
      ["Rolling hash", "O(n+m)", "O(n)", "Faster to write, randomised"],
    ],
  },
  pitfalls: [
    { title: "Missing the sentinel",
      bug: "Computing &pi; of p+t without '#'. A border can cross the boundary and invent fake matches.",
      fix: "A character that appears in neither string, or match with a separate automaton." },
    { title: "Off-by-one on occurrence index",
      bug: "&pi;[i]==|p| means the match <em>ends</em> at i in the concatenated string.",
      fix: "Start index in t is <code>i - |p| - |p| - 1 + 1</code> wait: i is in concat; t-index = i - (m+1) - m + 1 = i - 2m. Prefer looping i over t as in the code." },
    { title: "Period formula without the divisibility check",
      bug: "abcab has &pi;[n-1]=2, n-&pi;=3, but the string is not (abc) repeating.",
      fix: "Period is n-&pi;[n-1] only when that value divides n." },
    { title: "Using &pi;[q] instead of &pi;[q-1]",
      bug: "Infinite loop or skipped borders. The border of a string of length q lives at index q-1.",
      fix: "The while is <code>q = pi[q-1]</code>." },
    { title: "char vs Character in Java",
      bug: "Building the concat with a char that exists in the input (space, '#', '$').",
      fix: "Pick a char outside the alphabet, or use an int[] with a sentinel code." },
  ],
  variants: [
    ["KMP automaton", "trans[q][c] = next state. Fill using &pi;.", "for c: trans[i][c] = s[i]==c ? i+1 : trans[pi[i-1]][c]", "many texts, one pattern"],
    ["Count overlapping hits", "Every time state hits |p|, add 1 and go to &pi;[|p|-1].", "state = pi[m-1]", "the default"],
    ["Border tree", "parent of i+1 is &pi;[i]; tree of all borders.", "useful for counting distinct borders", "CF 432D"],
  ],
  followups: [
    ["Z-function vs prefix function?",
      "<p>Z[i] is the longest substring starting at i that matches a prefix. &pi;[i] is the longest border ending at i. You can convert either way in O(n). KMP matching is more natural from &pi;.</p>"],
    ["Why is the inner loop amortised O(1)?",
      "<p>Think of q as a potential. Each i increases it by at most 1. Each while-step decreases it. Total decreases &le; total increases &le; n.</p>"],
    ["How do you match without concatenating?",
      "<p>Build &pi; of p only. Scan t with the same while/if, and when q==|p| record a hit and set q=&pi;[q-1].</p>"],
    ["Can KMP find the lexicographically smallest rotation?",
      "<p>Booth's algorithm: KMP on s+s, keep the smallest border-aware start. Duval / Lyndon is the other school.</p>"],
  ],
  problems: [
    lc("28", "find-the-index-of-the-first-occurrence-in-a-string", "Easy", "KMP or rolling hash"),
    lc("1392", "longest-happy-prefix", "Hard", "Exactly &pi;[n-1] as a prefix"),
    lc("459", "repeated-substring-pattern", "Easy", "Period divides n"),
    cf("432D", "Prefixes and Suffixes", "Hard", "All borders + occurrence counts"),
    cf("126B", "Password", "Medium", "Border that also appears in the middle"),
    { url: "https://cses.fi/problemset/task/1753", name: "String Matching", badge: "gfg", tag: "CSES", level: "Medium", pattern: "Count occurrences" },
    { url: "https://atcoder.jp/contests/abc135/tasks/abc135_f", name: "ABC 135 F", badge: "atc", tag: "ABC 135F", level: "Hard", pattern: "KMP on infinite repetitions" },
    { url: "https://www.spoj.com/problems/NHAY/", name: "A Needle in the Haystack", badge: "gfg", tag: "SPOJ", level: "Medium", pattern: "Streaming KMP" },
  ],
  recap: [
    "\u03c0[i] = longest proper border of s[0..i].",
    "On mismatch, q = \u03c0[q-1], never i-- on the text.",
    "Match via p+'#'+t, or an automaton on p.",
    "Period p = n-\u03c0[n-1] when p divides n.",
    "Inner while is amortised O(1) by a potential on q.",
  ],
  oneliner: "while(q>0 && s[i]!=s[q]) q=pi[q-1]; if(s[i]==s[q]) q++; pi[i]=q;",
}),

/* ============================== 2. z-function ======================== */
pack({
  id: "z-function",
  difficulty: "Medium",
  readTime: "22 min",
  tagline: "Z[i] is the longest substring starting at i that matches the prefix of s. One linear pass maintains a rightmost Z-box.",
  tags: ["Z-function", "string", "P1"],
  prereqs: [
    ["KMP & the Prefix Function", "kmp-and-prefix-function.html"],
    ["Two Pointers", "../01-arrays-and-windows/two-pointers.html"],
  ],
  why: [
    "Many string problems ask \"how much of a prefix starts here?\": pattern matching (Z of p+'#'+t), distinct substrings via suffixes, and string-period recovery. The Z-array answers every such question after one O(n) pass.",
    "The algorithm keeps a window [l, r] that is a prefix-match already computed (a Z-box). For a new i inside that box, Z[i] is at least min(Z[i-l], r-i+1), and you only extend when the known copy runs out. That is the same two-pointer idea as Manacher.",
    "Z and the prefix function determine each other. Prefer Z when the question is phrased as prefix matches at every index; prefer &pi; when you are building failure links.",
  ],
  insight: "Inside a Z-box you already know a prefix copy. Reuse Z[i-l] instead of matching from scratch, and only extend when that copy is shorter than the remaining box.",
  yes: [
    "Longest prefix starting at every index",
    "Pattern matching via Z of p+'#'+t: hits where Z[i]==|p|",
    "Number of distinct substrings in O(n^2) made practical as sum n-Z over suffixes, or with SA",
    "You already think in [l,r] windows (Manacher cousin)",
    "String compression / period from Z[i]==n-i",
  ],
  no: [
    "Failure-link automaton &rarr; prefix function",
    "Palindromes &rarr; Manacher",
    "Many patterns &rarr; Aho-Corasick",
    "Substring lexicographic order &rarr; suffix array",
  ],
  table: [
    ["Prefix match at every i", "Z-array", "This page"],
    ["One pattern in a text", "Z of p+# +t", "Z or KMP"],
    ["Borders / periods", "Either Z or \u03c0", "Prefix function is the usual write-up"],
    ["Palindromic radii", "Different window", "Manacher"],
    ["Suffix sorting", "Not Z", "Suffix array"],
    ["<strong>Confused with:</strong> Z[i] vs \u03c0[i]", "Z starts at i; \u03c0 ends at i", "Convert if you have the other"],
  ],
  constraint: "<code>n &le; 10&#8310;</code>. The extend loop is amortised O(n) because r only moves right.",
  core: [
    "Z[0] is 0 or n by convention (we store 0 and never use it). Maintain [l, r] = rightmost segment that matches a prefix. For i=1..n-1: if i&le;r, Z[i] = min(r-i+1, Z[i-l]). Then while i+Z[i]&lt;n and s[Z[i]]==s[i+Z[i]], increment. If i+Z[i]-1 &gt; r, reset [l,r] to [i, i+Z[i]-1].",
    "Matching: Z-array of p+'#'+t. Every position in the t-half with Z[i]==|p| is a hit starting at i-(|p|+1).",
  ],
  invariant: "<p>[l, r] is a prefix of s, copied at l. For every i in (l, r], the prefix of length Z[i-l] starting at i is already known to match, up to the box edge r.</p>",
  array: [0, 0, 3, 0, 1, 0],
  arrayLabel: "Z =",
  indexLabels: ["a", "b", "a", "b", "a", "c"],
  vars: ["i", "l,r", "Z"],
  frames: [
    { note: "s = ababac. Z[0] unused (=0). i=1 'b'!= 'a'. Z[1]=0. Box empty.",
      active: [1], values: { i: 1, "l,r": "0,0", Z: "[0,0]" } },
    { note: "i=2 'a'==s[0]. Extend: abab vs abac, three chars. Z[2]=3. Box [2,4].",
      active: [2, 3, 4], values: { i: 2, "l,r": "2,4", Z: "[0,0,3]" } },
    { note: "i=3 inside the box. Z[3-2]=Z[1]=0, remaining box is 2. min(2,0)=0. Cannot extend. Z[3]=0.",
      active: [3], values: { i: 3, "l,r": "2,4", Z: "[0,0,3,0]" } },
    { note: "i=4 inside. Z[4-2]=Z[2]=3 but remaining is 1, so start with 1. s[1]='b'!=s[5]='c', stay 1. Z[4]=1.",
      active: [4], values: { i: 4, "l,r": "2,4", Z: "[0,0,3,0,1]" } },
    { note: "i=5 'c'!= 'a'. Z[5]=0.",
      active: [5], values: { i: 5, "l,r": "2,4", Z: "[0,0,3,0,1,0]" } },
    { note: "Done. Z = [0,0,3,0,1,0]. A match of \"aba\" would show Z=3 at that start.",
      active: [0, 1, 2, 3, 4, 5], values: { i: "done", "l,r": "2,4", Z: "[0,0,3,0,1,0]" } },
  ],
  mermaid: `flowchart TD
  iNode["i from 1 to n-1"] --> inBox{"i less or equal r?"}
  inBox -- yes --> reuse["Z i = min of r-i+1 and Z of i-l"]
  inBox -- no --> zero["Z i starts at 0"]
  reuse --> ext["extend while s Z equals s i+Z"]
  zero --> ext
  ext --> widen{"i+Z-1 greater than r?"}
  widen -- yes --> box["l=i, r=i+Z-1"]
  widen -- no --> nextI["next i"]
  box --> nextI`,
  merTitle: "Rightmost Z-box",
  merCaption: "r only increases, so character comparisons that extend the box cost O(n) total.",
  steps: [
    "<strong>Z[0]=0</strong> (or n, but then never treat it as a match start).",
    "<strong>l=r=0</strong>. For i=1..n-1:",
    "<strong>If i&le;r</strong> set Z[i]=min(r-i+1, Z[i-l]).",
    "<strong>Extend</strong> while in bounds and characters match.",
    "<strong>If i+Z[i]-1 &gt; r</strong> set l=i, r=i+Z[i]-1.",
    "<strong>Match</strong> on p+'#'+t as with KMP.",
  ],
  code: [
    { tab: "Brute", file: "ZBrute.java",
      intro: "Match a prefix from every i. Quadratic.",
      code: `import java.util.Arrays;
public class ZBrute {
    static int[] z(String s) {
        int n = s.length();
        int[] z = new int[n];
        for (int i = 1; i < n; i++) {
            while (i + z[i] < n && s.charAt(z[i]) == s.charAt(i + z[i])) z[i]++;
        }
        return z;
    }
    public static void main(String[] args) {
        System.out.println(Arrays.toString(z("ababac")));
    }
    // Input : ababac
    // Output: [0, 0, 3, 0, 1, 0]
}` },
    { tab: "Optimal", file: "ZFunction.java",
      intro: "Linear Z-array via the rightmost box.",
      highlight: "8-16",
      code: `import java.util.Arrays;
public class ZFunction {
    static int[] z(String s) {
        int n = s.length();
        int[] z = new int[n];
        for (int i = 1, l = 0, r = 0; i < n; i++) {
            if (i <= r) z[i] = Math.min(r - i + 1, z[i - l]);
            while (i + z[i] < n && s.charAt(z[i]) == s.charAt(i + z[i])) z[i]++;
            if (i + z[i] - 1 > r) { l = i; r = i + z[i] - 1; }
        }
        return z;
    }
    public static void main(String[] args) {
        System.out.println(Arrays.toString(z("ababac")));
    }
    // Input : ababac
    // Output: [0, 0, 3, 0, 1, 0]
}` },
    { tab: "Template", file: "ZMatch.java",
      intro: "Occurrences of p in t.",
      code: `import java.util.*;
public class ZMatch {
    static int[] z(String s) {
        int n = s.length();
        int[] z = new int[n];
        for (int i = 1, l = 0, r = 0; i < n; i++) {
            if (i <= r) z[i] = Math.min(r - i + 1, z[i - l]);
            while (i + z[i] < n && s.charAt(z[i]) == s.charAt(i + z[i])) z[i]++;
            if (i + z[i] - 1 > r) { l = i; r = i + z[i] - 1; }
        }
        return z;
    }
    static List<Integer> find(String t, String p) {
        int[] z = z(p + "#" + t);
        List<Integer> ans = new ArrayList<>();
        int m = p.length();
        for (int i = 0; i < t.length(); i++) if (z[m + 1 + i] == m) ans.add(i);
        return ans;
    }
    public static void main(String[] args) {
        System.out.println(find("ababa", "aba"));
    }
    // Input : ababa / aba
    // Output: [0, 2]
}` },
  ],
  complexity: {
    time: "O(n)",
    space: "O(n)",
    derivation: [
      "<p>Each extend comparison that succeeds increases r. r never decreases. Failed comparisons happen at most once per i after the copied value. Total O(n).</p>",
    ],
    compare: [
      ["Naive prefix match", "O(n^2)", "O(n)", "n <= 3000"],
      ["Z-function", "O(n)", "O(n)", "Prefix-at-i questions"],
      ["Prefix function", "O(n)", "O(n)", "Borders / KMP automaton"],
      ["Rolling hash", "O(n)", "O(n)", "Equality tests, not full Z"],
    ],
  },
  pitfalls: [
    { title: "Using Z[0]=n in the copy",
      bug: "i-l = 0 copies n and you run off the array.",
      fix: "Leave Z[0]=0, or special-case i=l." },
    { title: "Updating [l,r] with a weaker box",
      bug: "Setting r to a smaller value loses the amortised bound and can even make Z too small if you skip extend.",
      fix: "Only widen when i+Z[i]-1 &gt; r." },
    { title: "min(r-i+1, Z[i-l]) without extend",
      bug: "When Z[i-l] hits the box edge, the match might continue past r.",
      fix: "Always run the while after the copy." },
    { title: "Sentinel missing",
      bug: "Same as KMP: Z of p+t without '#' can cross the join.",
      fix: "A character outside the alphabet." },
    { title: "Comparing chars with == on substrings",
      bug: "In Java, <code>s.substring(a)==s.substring(b)</code> is reference equality.",
      fix: "charAt in the extend loop, as written." },
  ],
  variants: [
    ["Period", "If Z[i]==n-i and i divides n, period i.", "for i if z[i]==n-i && n%i==0", "string compression"],
    ["Distinct substrings (slow)", "For each suffix, add n-i-lcp-with-prefix via Z of suffix.", "O(n^2)", "n <= 5000; else SA"],
    ["From \u03c0 to Z", "Known linear conversion; rarely needed if you can compute Z directly.", "see CP-algorithms", "when you only built \u03c0"],
  ],
  followups: [
    ["Why copy min(r-i+1, Z[i-l])?",
      "<p>The box says s[l..r]==s[0..r-l]. Position i corresponds to i-l in the prefix. You cannot claim more than the remaining box, and you cannot claim more than Z[i-l].</p>"],
    ["Z vs KMP for matching?",
      "<p>Same complexity. Z is slightly more code for matching and slightly less conceptual load if the problem is already \"prefix at i\". KMP automata compose better with Aho.</p>"],
    ["Can Z handle wildcards?",
      "<p>Not by itself. Split the pattern on '?', Z-match each chunk, and check gaps. Or use FFT string matching.</p>"],
    ["Manacher uses the same idea?",
      "<p>Yes: a palindrome box [l,r] and copy the mirrored radius, then extend. Once you can write Z, Manacher is a palindrome-flavoured Z.</p>"],
  ],
  problems: [
    lc("28", "find-the-index-of-the-first-occurrence-in-a-string", "Easy", "Z-matching"),
    lc("1392", "longest-happy-prefix", "Hard", "max i with Z[n-i]==i"),
    cf("432D", "Prefixes and Suffixes", "Hard", "Z-values that are also suffixes"),
    cf("126B", "Password", "Medium", "Z/KMP border that occurs inside"),
    { url: "https://cses.fi/problemset/task/1753", name: "String Matching", badge: "gfg", tag: "CSES", level: "Medium", pattern: "Z or KMP" },
    { url: "https://www.spoj.com/problems/QUERYSTR/", name: "Querystr", badge: "gfg", tag: "SPOJ", level: "Medium", pattern: "Z on reverse" },
    { url: "https://codeforces.com/problemset/problem/1051/E", name: "Vasya and Magic Matrix", badge: "cf", tag: "CF 1051E", level: "Hard", pattern: "Digit DP + Z on numbers as strings" },
    { url: "https://atcoder.jp/contests/abc141/tasks/abc141_e", name: "ABC 141 E", badge: "atc", tag: "ABC 141E", level: "Hard", pattern: "Z / SA for repeated substrings" },
  ],
  recap: [
    "Z[i] = longest prefix starting at i.",
    "Reuse the rightmost Z-box; only extend when needed.",
    "r only moves right \u2192 O(n).",
    "Match with p+'#'+t, Z[i]==|p|.",
    "Cousin of Manacher's mirrored window.",
  ],
  oneliner: "if(i<=r) z[i]=min(r-i+1, z[i-l]); while(match) z[i]++; if(i+z[i]-1>r){l=i;r=i+z[i]-1;}",
}),

/* ============================== 3. rolling-hash ====================== */
pack({
  id: "rolling-hash",
  difficulty: "Medium",
  readTime: "24 min",
  tagline: "Map every substring to a polynomial <code>s[l] b^{len-1} + \u2026 + s[r]</code> modulo a prime so equality (and 2D / palindrome checks) become a few multiplies.",
  tags: ["hashing", "polynomial hash", "P1"],
  prereqs: [
    ["Modular Arithmetic", "../11-math-and-number-theory/modular-arithmetic.html"],
    ["Prefix Sums", "../01-arrays-and-windows/prefix-sums.html"],
  ],
  why: [
    "Substring equality, longest common substring, palindrome checks, and \"does this pattern appear\" are O(n) with KMP/Z for one pattern, but hashing stays O(1) per query after an O(n) prefix, and extends to 2D, trees, and sets of strings without a specialised automaton.",
    "The polynomial hash is a prefix array in the ring Z/MZ: H[i] = s[0]b^{i-1} + s[1]b^{i-2} + \u2026 + s[i-1]. A substring is H[r]-H[l]*b^{r-l}, computed with a precomputed pow[]. Two 64-bit moduli (or one 2^64 unsigned plus one prime) make collisions a non-issue in contests.",
    "The interview sentence is \"compare hashes first, verify on a collision if the modulus is small\". On Codeforces, anti-hash tests exist: use a randomised base, two moduli, or 2^61-1.",
  ],
  insight: "A substring hash is a prefix-hash difference scaled by a power of the base &mdash; the same identity as prefix sums, in a modular ring.",
  yes: [
    "O(1) substring equality after O(n) preprocess",
    "Longest common prefix of two suffixes via binary search + hash",
    "Palindrome check: hash(s[l..r]) == reverse-hash of that range",
    "2D grid matching (Rabin-Karp 2D)",
    "You need to put substrings in a HashSet",
  ],
  no: [
    "You must be deterministic with no collision risk and one pattern &rarr; KMP",
    "Need the suffix order, not equality &rarr; suffix array",
    "Alphabet is huge and you need frequency maps &rarr; different tool",
    "Single comparison of two whole strings &rarr; <code>equals</code>",
  ],
  table: [
    ["Substring equality, many queries", "Prefix hashes + pow", "Rolling hash"],
    ["One pattern search", "Rabin-Karp slide, or KMP", "Either"],
    ["Palindrome queries", "Forward + reverse hashes", "This page"],
    ["Deterministic matching", "KMP / Z / SA", "Not hash"],
    ["Lexicographic suffix order", "Compare via LCP of hashes, or SA", "SA is cleaner"],
    ["<strong>Confused with:</strong> Java String.hashCode", "32-bit, not prefix-subtractable the same way, collisions easy", "Roll your own 64-bit"],
  ],
  constraint: "<code>n, q &le; 2&times;10&#8309;</code>. Two 64-bit moduli, base random in [256, 1e9). Never use mod 1e9+7 alone on CF.",
  core: [
    "Fix base b and mod M. H[0]=0, H[i+1] = (H[i]*b + s[i]) % M. pow[0]=1, pow[i+1]=pow[i]*b % M. Substring [l, r) has hash (H[r] - H[l]*pow[r-l]) % M, add M if negative.",
    "Collision probability for one comparison is about (length)/M with a random base. q comparisons \u2192 q/M. Two independent hashes make it q/M^2. Anti-hash: randomise b at startup, or use unsigned long overflow as a free 2^64 ring plus a prime.",
  ],
  invariant: "<p>H[i] = sum_{j=0}^{i-1} s[j] * b^{i-1-j} (mod M). Then hash[l, r) = H[r] - H[l] * b^{r-l} (mod M), the unique polynomial of that substring.</p>",
  array: [0, 1, 5, 16],
  arrayLabel: "H (base 3, a=1, b=2) =",
  indexLabels: ["\u03b5", "a", "ab", "aba"],
  vars: ["i", "H", "sub"],
  frames: [
    { note: "s = aba, map a=1, b=2, b_base=3, no mod for the toy. H[0]=0.",
      active: [0], values: { i: 0, H: 0, sub: "empty" } },
    { note: "H[1] = 0*3+1 = 1. Hash of \"a\".",
      active: [1], values: { i: 1, H: 1, sub: "a" } },
    { note: "H[2] = 1*3+2 = 5. Hash of \"ab\".",
      active: [2], values: { i: 2, H: 5, sub: "ab" } },
    { note: "H[3] = 5*3+1 = 16. Whole string.",
      active: [3], values: { i: 3, H: 16, sub: "aba" } },
    { note: "hash[1,3) = H[3]-H[1]*3^2 = 16-1*9 = 7. That is \"ba\" = 2*3+1 = 7. Match.",
      active: [1, 3], values: { i: "q", H: 16, sub: "ba=7" } },
    { note: "hash[0,2) vs hash[1,3): \"ab\"=5 vs \"ba\"=7, not equal. Palindrome would compare forward [0,3) to reverse hash.",
      active: [0, 2], values: { i: "cmp", H: "5 vs 7", sub: "not palindrome slice" } },
  ],
  mermaid: `flowchart TD
  pref["prefix H and pow"] --> sub["hash l r = H r minus H l times pow r-l"]
  sub --> eq{"hashes equal?"}
  eq -- yes --> maybe["probably equal strings"]
  eq -- no --> noEq["definitely different"]
  maybe --> twoMod["second modulus / verify"]`,
  merTitle: "Prefix polynomial, then a difference",
  merCaption: "Same shape as prefix sums. The extra multiply by pow[len] aligns the powers.",
  steps: [
    "<strong>Pick</strong> a random odd base &gt; alphabet, and one or two moduli (2^61-1, 1e9+9, unsigned 2^64).",
    "<strong>Build</strong> H and pow of length n+1 in one pass.",
    "<strong>hash(l, r)</strong> half-open: <code>h = H[r] - H[l]*pow[r-l]; if (h<0) h+=M;</code>",
    "<strong>Compare</strong> two ranges by hash; optionally verify with char loop if M is small.",
    "<strong>Rabin-Karp slide:</strong> window := window*b - s[i-len]*pow[len] + s[i].",
    "<strong>Reverse hash</strong> on the reversed string (or a second prefix from the right) for palindromes.",
  ],
  code: [
    { tab: "Brute", file: "SubEqBrute.java",
      intro: "substring equals. Correct, O(n) per query.",
      code: `public class SubEqBrute {
    static boolean eq(String s, int l1, int r1, int l2, int r2) {
        return s.substring(l1, r1).equals(s.substring(l2, r2));
    }
    public static void main(String[] args) {
        String s = "abacaba";
        System.out.println(eq(s, 0, 3, 4, 7));
    }
    // Input : abacaba, [0,3) vs [4,7)
    // Output: true
}` },
    { tab: "Optimal", file: "RollingHash.java",
      intro: "Single 64-bit unsigned ring via long overflow (mod 2^64). Fast and usually enough with a random base.",
      highlight: "16-20",
      code: `import java.util.Random;
public class RollingHash {
    long[] H, p;
    RollingHash(String s, long base) {
        int n = s.length();
        H = new long[n + 1];
        p = new long[n + 1];
        p[0] = 1;
        for (int i = 0; i < n; i++) {
            H[i + 1] = H[i] * base + s.charAt(i);
            p[i + 1] = p[i] * base;
        }
    }
    long hash(int l, int r) { return H[r] - H[l] * p[r - l]; }
    public static void main(String[] args) {
        long base = new Random().nextInt(1_000_000) + 257;
        RollingHash h = new RollingHash("abacaba", base);
        System.out.println(h.hash(0, 3) == h.hash(4, 7));
    }
    // Input : abacaba, [0,3) vs [4,7)  ("aba" vs "aba")
    // Output: true
}` },
    { tab: "Template", file: "DoubleHash.java",
      intro: "Two prime moduli. Safer on CF anti-hash.",
      code: `public class DoubleHash {
    static final long M1 = 1_000_000_007L, M2 = 1_000_000_009L, B = 911382323L;
    long[] h1, h2, p1, p2;
    DoubleHash(String s) {
        int n = s.length();
        h1 = new long[n + 1]; h2 = new long[n + 1];
        p1 = new long[n + 1]; p2 = new long[n + 1];
        p1[0] = p2[0] = 1;
        for (int i = 0; i < n; i++) {
            h1[i + 1] = (h1[i] * B + s.charAt(i)) % M1;
            h2[i + 1] = (h2[i] * B + s.charAt(i)) % M2;
            p1[i + 1] = p1[i] * B % M1;
            p2[i + 1] = p2[i] * B % M2;
        }
    }
    long hash(int l, int r) {
        long x = (h1[r] - h1[l] * p1[r - l] % M1 + M1) % M1;
        long y = (h2[r] - h2[l] * p2[r - l] % M2 + M2) % M2;
        return (x << 32) ^ y;
    }
    public static void main(String[] args) {
        DoubleHash h = new DoubleHash("abacaba");
        System.out.println(h.hash(0, 3) == h.hash(4, 7));
    }
    // Input : same aba vs aba
    // Output: true
}` },
  ],
  complexity: {
    time: "O(n) build, O(1) substring hash",
    space: "O(n)",
    derivation: [
      "<p>Prefix and powers are one pass. Each query is a multiply and a subtract. Binary search on LCP is O(log n) hashes = O(log n).</p>",
    ],
    compare: [
      ["char loop equals", "O(n) / query", "O(1)", "few queries"],
      ["Rolling hash", "O(1) / query", "O(n)", "Many equality tests"],
      ["KMP / Z", "O(n+m) deterministic", "O(n)", "One pattern"],
      ["Suffix array + LCP", "O(n log n) build", "O(n)", "All LCP / distinct substrings"],
    ],
  },
  pitfalls: [
    { title: "Negative mod in Java",
      bug: "<code>(h[r] - h[l]*pow) % M</code> can be negative, and HashSet treats -3 and M-3 as different.",
      fix: "<code>x %= M; if (x < 0) x += M;</code>" },
    { title: "Fixed base 31 and mod 1e9+7 on CF",
      bug: "Anti-hash tests exist. Single small prime with a famous base will get WA.",
      fix: "Random base per run, two moduli, or unsigned 64 + one prime." },
    { title: "Mapping letters to 0",
      bug: "Leading zeros make \"a\" and \"aa\" collide when a maps to 0.",
      fix: "Map 'a'.. to 1..26, or use the raw char code which is never 0." },
    { title: "pow overflow before mod",
      bug: "<code>p[i]*B</code> overflows long if you meant a 1e18 modulus.",
      fix: "Use a mul-mod, 2^61-1 trick, or stay in unsigned 2^64." },
    { title: "Half-open vs inclusive mix",
      bug: "hash(l,r) as inclusive but multiplied by pow[r-l] instead of pow[r-l+1].",
      fix: "Pick [l, r) everywhere, including the dry run." },
  ],
  variants: [
    ["Reverse hash", "Build on reversed s, or a second prefix from the right, for palindrome queries.", "fwd(l,r)==rev(n-1-r, n-1-l)", "LC 5 / queries"],
    ["2D Rabin-Karp", "Hash rows, then hash the column of row-hashes.", "O(nm) after O(nm)", "pattern in a grid"],
    ["Hash of a path", "Reroot / binomial of depth; or tree isomorphism hashes.", "AHU-style", "rooted-tree iso"],
  ],
  followups: [
    ["Why a random base?",
      "<p>For a fixed base, an adversary can build collisions (especially with small M). A random base unknown at test-generation time makes the polynomial random, and the Schwartz-Zippel bound applies.</p>"],
    ["Is 2^64 overflow OK?",
      "<p>It is a ring, not a field, so it has zero divisors. Thue-Morse / overflow attacks exist but are rarer. Pair it with a prime modulus if the contest is known-hostile.</p>"],
    ["LCP of two suffixes?",
      "<p>Binary search the length: hash equality is the predicate. O(log n) per LCP. Suffix arrays give all adjacent LCPs faster if you need them all.</p>"],
    ["Hash vs KMP in an interview?",
      "<p>Mention both. If they want worst-case linear, write KMP. If they want substring queries or a set of strings, write hashing and name the collision policy.</p>"],
  ],
  problems: [
    lc("28", "find-the-index-of-the-first-occurrence-in-a-string", "Easy", "Rabin-Karp"),
    lc("1044", "longest-duplicate-substring", "Hard", "Binary search length + hash set"),
    lc("718", "maximum-length-of-repeated-subarray", "Medium", "Binary search + hash, or DP"),
    cf("514C", "Watto and Mechanism", "Medium", "Set of hashes, one-char mismatch"),
    cf("7D", "Palindrome Degree", "Medium", "Prefix palindromes via hash"),
    { url: "https://cses.fi/problemset/task/1753", name: "String Matching", badge: "gfg", tag: "CSES", level: "Medium", pattern: "Rabin-Karp accepted" },
    { url: "https://atcoder.jp/contests/abc141/tasks/abc141_e", name: "ABC 141 E", badge: "atc", tag: "ABC 141E", level: "Hard", pattern: "Binary search + hash" },
    { url: "https://codeforces.com/problemset/problem/1200/E", name: "Compress Words", badge: "cf", tag: "CF 1200E", level: "Medium", pattern: "Hash the overlap of prefix/suffix" },
  ],
  recap: [
    "H[i+1] = H[i]*b + s[i]. hash[l,r) = H[r]-H[l]*b^{r-l}.",
    "Random base, two moduli on CF.",
    "Java % can be negative \u2014 fix it.",
    "Map letters to non-zero.",
    "KMP if they demand deterministic one-pattern search.",
  ],
  oneliner: "h[i+1]=h[i]*B+s[i]; hash(l,r)=h[r]-h[l]*pow[r-l];",
}),

/* ============================== 4. manacher ========================== */
pack({
  id: "manacher",
  difficulty: "Hard",
  readTime: "24 min",
  tagline: "Manacher computes the longest palindromic radius at every centre in <code>O(n)</code> by mirroring inside a rightmost palindrome box &mdash; the palindrome cousin of the Z-function.",
  tags: ["Manacher", "palindrome", "P2"],
  prereqs: [
    ["Z-Function", "z-function.html"],
    ["Two Pointers", "../01-arrays-and-windows/two-pointers.html"],
  ],
  why: [
    "Expand-around-centre is O(n^2). Manacher reuses palindromes already found: if a palindrome covers i, the mirrored index 2c-i already has a radius you can copy (capped by the box edge), then extend only if needed. r only moves right, so total time is linear.",
    "The usual implementation inserts sentinels so odd and even palindromes share one array: T = ^#a#b#a#$ has a centre for every gap. d[i] is the radius in T; the original-string length is d[i]-1.",
    "LC 5 (longest palindromic substring) is the interview problem. Contest follow-ups count palindromic substrings, find the longest palindromic prefix, or build a palindrome tree (a different structure).",
  ],
  insight: "Inside the rightmost palindrome, palindromes mirror. Copy the mirrored radius, clip to the box, then extend. Same amortised argument as Z.",
  yes: [
    "Longest palindromic substring in O(n)",
    "Count of palindromic substrings",
    "All palindromic radii (odd and even) for later queries",
    "Longest palindromic prefix / suffix",
    "n = 1e6 so O(n^2) expand is dead",
  ],
  no: [
    "Palindrome queries on a mutable string &rarr; hashes + Fenwick, or a palindromic tree with updates",
    "One palindrome check of the whole string &rarr; two pointers",
    "Pattern matching &rarr; KMP / Z",
    "You need every distinct palindrome as a node with suffix links &rarr; eertree, not Manacher",
  ],
  table: [
    ["Longest palindromic substring", "Max radius, decode the centre", "Manacher"],
    ["Count palindromic substrings", "Sum of radii (careful with sentinels)", "Manacher"],
    ["Whole-string palindrome", "Two pointers", "Not this"],
    ["Palindrome after one change", "Expand or hash", "Usually not Manacher"],
    ["Online palindromes", "eertree / palindromic tree", "Different structure"],
    ["<strong>Confused with:</strong> Z-function", "Z copies prefix boxes; Manacher copies palindrome boxes", "Same two-pointer skeleton"],
  ],
  constraint: "<code>n &le; 10&#8310;</code>. The sentinel string has length 2n+3. Integer radii; do not use Java substring in the inner loop.",
  core: [
    "Build T with a unique border and '#' between letters so every palindrome in s is an odd palindrome in T. d[i] = radius (how far you can go from i in T, counting the centre).",
    "Maintain [l, r] = rightmost palindrome (centre c = (l+r)/2 conceptually). For i: if i < r, d[i] = min(d[2*c - i], r-i). Then extend while T[i-d]==T[i+d]. If i+d > r, move the box.",
  ],
  invariant: "<p>T[l..r] is a palindrome. For i in (c, r), the mirror j = 2c-i has a known radius, so d[i] is at least min(d[j], r-i) and at most that until you extend past r.</p>",
  array: [0, 1, 2, 1, 4, 1, 2, 1, 0],
  arrayLabel: "d (radii on #a#b#a#) =",
  indexLabels: ["^", "#", "a", "#", "b", "#", "a", "#", "$"],
  vars: ["i", "box", "d"],
  frames: [
    { note: "T = ^#a#b#a#$. Centres on '#' handle even palindromes of s.",
      active: [0], values: { i: 0, box: "none", d: "init" } },
    { note: "i at first 'a'. Extend to #a#. d=2. Box covers that palindrome.",
      active: [2], values: { i: "a", box: "[1,3]", d: 2 } },
    { note: "i at 'b'. Expand #a#b#a# \u2014 the whole string is a palindrome of radius 4 around b.",
      active: [4], values: { i: "b", box: "[0,8]", d: 4 } },
    { note: "i at second 'a'. Mirror of first 'a'. Copy min(d[mirror], remaining box)=2. Matches.",
      active: [6], values: { i: "a2", box: "[0,8]", d: 2 } },
    { note: "Longest in s is length d-1 at centre b: 4-1=3, \"aba\".",
      active: [2, 4, 6], values: { i: "ans", box: "done", d: "len 3" } },
    { note: "Even palindrome \"aa\" would show up as a large d on a '#' centre between the two a's.",
      active: [3, 5], values: { i: "even centres", box: "#", d: "gaps" } },
  ],
  mermaid: `flowchart TD
  iN["next centre i"] --> inside{"i less than r?"}
  inside -- yes --> copy["d i = min of d mirror and r-i"]
  inside -- no --> one["d i = 1"]
  copy --> exp["while T i-d equals T i+d, d plus 1"]
  one --> exp
  exp --> move{"i+d greater than r?"}
  move -- yes --> boxN["c=i, r=i+d"]
  move -- no --> nextC["next i"]
  boxN --> nextC`,
  merTitle: "Mirror, clip, extend",
  merCaption: "r only increases. Every successful extend comparison is charged to r.",
  steps: [
    "<strong>Build T</strong> with '^', '$' borders and '#' between characters.",
    "<strong>d[]</strong> size |T|, c=0, r=0.",
    "<strong>For each i</strong>: mirror = 2*c-i; if i<r, d[i]=min(d[mirror], r-i); else d[i]=1 (or 0 depending on counting).",
    "<strong>Extend</strong> while i\pm d in bounds and T matches.",
    "<strong>If i+d > r</strong> set c=i, r=i+d.",
    "<strong>Decode:</strong> palindrome length in s is d[i]-1; start = (i-d[i])/2 in original indexing with this T.",
  ],
  code: [
    { tab: "Brute", file: "PalExpand.java",
      intro: "Expand around 2n-1 centres. O(n^2).",
      code: `public class PalExpand {
    static String longest(String s) {
        int n = s.length(), bestL = 0, bestR = 0;
        for (int c = 0; c < n; c++) {
            int[] odd = expand(s, c, c), even = expand(s, c, c + 1);
            if (odd[1] - odd[0] > bestR - bestL) { bestL = odd[0]; bestR = odd[1]; }
            if (even[1] - even[0] > bestR - bestL) { bestL = even[0]; bestR = even[1]; }
        }
        return s.substring(bestL, bestR);
    }
    static int[] expand(String s, int l, int r) {
        while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) { l--; r++; }
        return new int[] {l + 1, r};
    }
    public static void main(String[] args) {
        System.out.println(longest("babad"));
    }
    // Input : babad
    // Output: bab
}` },
    { tab: "Optimal", file: "Manacher.java",
      intro: "Linear radii on the sentinel string. Returns the longest piece of s.",
      highlight: "14-22",
      code: `public class Manacher {
    static String longest(String s) {
        StringBuilder sb = new StringBuilder("^");
        for (int i = 0; i < s.length(); i++) sb.append('#').append(s.charAt(i));
        sb.append("#$");
        char[] t = sb.toString().toCharArray();
        int m = t.length;
        int[] d = new int[m];
        int c = 0, r = 0, best = 0, centre = 0;
        for (int i = 1; i < m - 1; i++) {
            if (i < r) d[i] = Math.min(d[2 * c - i], r - i);
            else d[i] = 1;
            while (t[i - d[i]] == t[i + d[i]]) d[i]++;
            if (i + d[i] > r) { c = i; r = i + d[i]; }
            if (d[i] > best) { best = d[i]; centre = i; }
        }
        int start = (centre - best) / 2;
        return s.substring(start, start + best - 1);
    }
    public static void main(String[] args) {
        System.out.println(longest("babad"));
        System.out.println(longest("cbbd"));
    }
    // Input : babad, then cbbd
    // Output: bab
    //         bb
}` },
    { tab: "Template", file: "ManacherCount.java",
      intro: "Count palindromic substrings: each radius contributes d[i]/2 centres in s.",
      code: `public class ManacherCount {
    static int count(String s) {
        StringBuilder sb = new StringBuilder("^");
        for (int i = 0; i < s.length(); i++) sb.append('#').append(s.charAt(i));
        sb.append("#$");
        char[] t = sb.toString().toCharArray();
        int[] d = new int[t.length];
        int c = 0, r = 0, ans = 0;
        for (int i = 1; i < t.length - 1; i++) {
            if (i < r) d[i] = Math.min(d[2 * c - i], r - i);
            else d[i] = 1;
            while (t[i - d[i]] == t[i + d[i]]) d[i]++;
            if (i + d[i] > r) { c = i; r = i + d[i]; }
            ans += d[i] / 2;
        }
        return ans;
    }
    public static void main(String[] args) {
        System.out.println(count("aaa"));
    }
    // Input : aaa
    // Output: 6
}` },
  ],
  complexity: {
    time: "O(n)",
    space: "O(n)",
    derivation: [
      "<p>Each extend step that succeeds increases r. r never decreases. The mirror copy is O(1) per centre. |T| = 2n+3 so still linear.</p>",
    ],
    compare: [
      ["Expand 2n centres", "O(n^2)", "O(1)", "n <= 3000"],
      ["Manacher", "O(n)", "O(n)", "All radii"],
      ["Hash + binary search", "O(n log n)", "O(n)", "Longest palindrome only"],
      ["eertree", "O(n)", "O(n)", "Distinct palindromes as nodes"],
    ],
  },
  pitfalls: [
    { title: "Forgetting sentinels ^ and $",
      bug: "The while loop walks off the array when a palindrome hits an end.",
      fix: "Guaranteed-mismatch borders, or explicit bounds checks." },
    { title: "d counting vs expand-by-1",
      bug: "Mixing \"d is the length in T\" with \"d is the number of extra steps\". Off-by-one on the substring start.",
      fix: "Pick one convention; the code above uses d=1 meaning just the centre, extend while equal." },
    { title: "Using substring inside the extend loop",
      bug: "Java substring copies (older JDKs) and you go quadratic plus allocations.",
      fix: "char[] and indices only." },
    { title: "Even palindromes without '#'",
      bug: "You only computed odd lengths. \"abba\" is missed.",
      fix: "Sentinel string, or two arrays dOdd/dEven." },
    { title: "Decoding start index wrong",
      bug: "(centre-best)/2 vs (centre-best+1)/2 depending on T's first '#'.",
      fix: "Derive once from T = ^#s0#s1#...#$ and test on \"a\", \"aa\", \"aba\"." },
  ],
  variants: [
    ["Two arrays, no sentinels", "d1[i] odd radius, d2[i] even radius. Same box idea twice.", "CP-algorithms manacher", "slightly faster constants"],
    ["Longest palindromic prefix", "The palindrome that touches index 0; or KMP on s + rev(s).", "d[i] with i-d+1==0", "CF 1326D"],
    ["Count / sum of palindromes", "Sum of (d[i]/2) on the sentinel string.", "LC 647", "this page's template"],
  ],
  followups: [
    ["Why is this linear like Z?",
      "<p>Potential r. Mirror copies cost O(1). Extending past r is paid for by increasing r, at most |T| times.</p>"],
    ["Can you support updates?",
      "<p>Not with a static d[]. Rebuild is O(n). Online insertion at the end is an eertree. Hashes handle \"is [l,r] a palindrome\" with updates via a Fenwick of polynomial coefficients, which is heavier.</p>"],
    ["Longest palindromic subsequence vs substring?",
      "<p>Subsequence is DP O(n^2) (LCS of s and reverse). Manacher is substrings only \u2014 contiguous.</p>"],
    ["How do you list all palindromic substrings without O(n^2) memory?",
      "<p>The O(n) radii already represent them. Iterate centres and emit ranges on demand; do not materialise every string.</p>"],
  ],
  problems: [
    lc("5", "longest-palindromic-substring", "Medium", "The interview Manacher / expand"),
    lc("647", "palindromic-substrings", "Medium", "Count via radii"),
    lc("214", "shortest-palindrome", "Hard", "KMP on s+#+rev, or Manacher prefix"),
    cf("1326D2", "Prefix-Suffix Palindrome", "Hard", "Longest palindromic prefix after a pair of borders"),
    cf("7D", "Palindrome Degree", "Medium", "Prefix palindromes; hash is common, Manacher works"),
    { url: "https://atcoder.jp/contests/abc122/tasks/abc122_d", name: "ABC 122 D", badge: "atc", tag: "ABC 122D", level: "Medium", pattern: "Not Manacher \u2014 palindrome-avoiding DP" },
    { url: "https://www.spoj.com/problems/LPS/", name: "Longest Palindromic Substring", badge: "gfg", tag: "SPOJ LPS", level: "Medium", pattern: "Length only" },
    { url: "https://codeforces.com/problemset/problem/17/E", name: "Palisection", badge: "cf", tag: "CF 17E", level: "Hard", pattern: "All palindromes intersecting" },
  ],
  recap: [
    "Sentinel string unifies odd and even centres.",
    "Mirror radius inside the rightmost palindrome box.",
    "Clip to the box, then extend. r only grows.",
    "Length in s is d[i]-1 with the '#' construction.",
    "Substrings, not subsequences.",
  ],
  oneliner: "if(i<r) d[i]=min(d[2*c-i], r-i); while(t[i-d]==t[i+d]) d[i]++; if(i+d>r){c=i;r=i+d;}",
}),

/* ============================== 5. suffix-array-and-lcp ============== */
pack({
  id: "suffix-array-and-lcp",
  difficulty: "Hard",
  readTime: "28 min",
  tagline: "A suffix array is the permutation of starting indices in lexicographic order; Kasai then fills the LCP array in <code>O(n)</code> and string problems become range-min on LCP.",
  tags: ["suffix array", "LCP", "P2"],
  prereqs: [
    ["Sorting & Comparators", "../02-sorting-hashing-bits/sorting-and-comparators.html"],
    ["Sparse Table & RMQ", "../06-range-queries/sparse-table-and-rmq.html"],
  ],
  why: [
    "Every substring is a prefix of some suffix. Sorting the suffixes therefore sorts all substrings, and the longest common prefix of two suffixes is the min LCP on the interval between them in the array. Distinct-substring count, longest repeated substring, and k-th substring fall out of that picture.",
    "O(n log n) doubling (or SA-IS in O(n)) builds the array. Kasai's lemma: if suffix i has LCP h with its predecessor in the order, suffix i+1 has LCP at least h-1 with its predecessor. That one observation makes LCP linear.",
    "Suffix automata / suffix trees are more powerful and more code. In Java contests the suffix array plus a sparse table on LCP is the structure you actually submit.",
  ],
  insight: "LCP of any two suffixes = RMQ of the LCP array between their ranks. Kasai fills that array by walking suffixes in text order, not sorted order.",
  yes: [
    "Number of distinct substrings = n(n+1)/2 - sum LCP",
    "Longest repeated substring = max LCP",
    "Longest common substring of two strings: SA of s+'#'+t, max LCP across the '#' ",
    "k-th lexicographic substring",
    "O(1) LCP after O(n log n) preprocess",
  ],
  no: [
    "One pattern in one text &rarr; KMP, do not build an SA",
    "You need online end-append of characters &rarr; suffix automaton",
    "n = 1e5 and you only compare two whole strings &rarr; equals / hash",
    "Mutable string with substring sorts &rarr; too heavy; hashes + segtree maybe",
  ],
  table: [
    ["Distinct substrings", "n(n+1)/2 - sum lcp", "SA + Kasai"],
    ["Longest repeated", "max lcp[i]", "SA"],
    ["LCS of two strings", "SA of concat, LCP of mixed pair", "SA"],
    ["Pattern search", "Binary search the SA", "or KMP"],
    ["Online extensions", "Suffix automaton", "Not SA"],
    ["<strong>Confused with:</strong> suffix tree", "Tree of suffixes; SA is the leaf order of that tree", "SA+LCP simulates most tree queries"],
  ],
  constraint: "<code>n &le; 4&times;10&#8309;</code> for O(n log n) doubling in Java; O(n log^2) with sort-of-pairs is tight at 4e5. Alphabet can be mapped to 1..n.",
  core: [
    "Doubling: rank by first 2^k characters. At step k you sort suffixes by (rank[i], rank[i+2^k]). After log n steps the order is full. Use a stable counting sort on ranks, not Timsort, if you need O(n log n).",
    "Kasai: inv[sa[i]]=i. Walk i=0..n-1 in text order, keep k = current LCP. Compare sa[rank-1] starting at i. Then k = max(k-1, 0).",
  ],
  invariant: "<p>sa[i] is the start of the i-th smallest suffix. lcp[i] = LCP(suffix sa[i-1], suffix sa[i]). For any i &lt; j, LCP(sa[i], sa[j]) = min(lcp[i+1], \u2026, lcp[j]).</p>",
  array: [5, 3, 1, 0, 4, 2],
  arrayLabel: "sa of banana =",
  indexLabels: ["a", "ana", "anana", "banana", "na", "nana"],
  vars: ["step", "sa", "lcp"],
  frames: [
    { note: "s = banana. Suffixes: 0 banana, 1 anana, 2 nana, 3 ana, 4 na, 5 a.",
      active: [0, 1, 2, 3, 4, 5], values: { step: "list", sa: "0..5", lcp: "\u2014" } },
    { note: "Sorted: 5(a), 3(ana), 1(anana), 0(banana), 4(na), 2(nana). sa = [5,3,1,0,4,2].",
      active: [5], values: { step: "sort", sa: "[5,3,1,0,4,2]", lcp: "\u2014" } },
    { note: "Kasai: LCP(a, ana)=1, LCP(ana, anana)=3, LCP(anana, banana)=0.",
      active: [0, 1, 2], values: { step: "lcp left", sa: "[5,3,1]", lcp: "[1,3,0]" } },
    { note: "LCP(banana, na)=0, LCP(na, nana)=2. lcp = [0,1,3,0,0,2] depending on 1-based lcp[0] unused.",
      active: [3, 4, 5], values: { step: "lcp right", sa: "[0,4,2]", lcp: "[0,2]" } },
    { note: "Longest repeated = max lcp = 3, \"ana\" starting at 1 and 3.",
      active: [1, 3], values: { step: "repeat", sa: "1 and 3", lcp: 3 } },
    { note: "Distinct substrings = 21 - (1+3+0+0+2) = 15.",
      active: [0, 1, 2, 3, 4, 5], values: { step: "distinct", sa: "all", lcp: "sum 6" } },
  ],
  mermaid: `flowchart TD
  dbl["doubling ranks by 2^k"] --> saN["sa permutation"]
  saN --> kas["Kasai: walk i = 0..n-1, k = max k-1, 0"]
  kas --> lcpN["lcp adjacent"]
  lcpN --> rmq["sparse table on lcp"]
  rmq --> any["LCP of any two suffixes"]`,
  merTitle: "SA, then Kasai, then RMQ",
  merCaption: "Adjacent LCPs plus a range-min structure give every pairwise LCP.",
  steps: [
    "<strong>Map</strong> characters to ranks 1..sigma. Append a sentinel 0.",
    "<strong>Doubling:</strong> for k=0,1,2,... sort by (rank[i], rank[i+2^k]) and reassign ranks.",
    "<strong>Stop</strong> when all ranks are unique.",
    "<strong>Kasai:</strong> inv[sa[i]]=i; k=0; for i=0..n-1 compute lcp[inv[i]].",
    "<strong>Sparse table</strong> on lcp for range min.",
    "<strong>Answer</strong> the actual string problem (distinct, LCS, k-th, search).",
  ],
  code: [
    { tab: "Brute", file: "SaBrute.java",
      intro: "Sort suffixes with String.compareTo. O(n^2 log n).",
      code: `import java.util.*;
public class SaBrute {
    static int[] sa(String s) {
        Integer[] idx = new Integer[s.length()];
        for (int i = 0; i < idx.length; i++) idx[i] = i;
        Arrays.sort(idx, (a, b) -> s.substring(a).compareTo(s.substring(b)));
        int[] sa = new int[idx.length];
        for (int i = 0; i < idx.length; i++) sa[i] = idx[i];
        return sa;
    }
    public static void main(String[] args) {
        System.out.println(Arrays.toString(sa("banana")));
    }
    // Input : banana
    // Output: [5, 3, 1, 0, 4, 2]
}` },
    { tab: "Optimal", file: "SuffixArray.java",
      intro: "O(n log^2 n) doubling with Java sort. Fine for n \u2264 1e5.",
      highlight: "12-22",
      code: `import java.util.*;
public class SuffixArray {
    static int[] sa(String s) {
        int n = s.length();
        Integer[] sa = new Integer[n];
        int[] r = new int[n], nr = new int[n];
        for (int i = 0; i < n; i++) { sa[i] = i; r[i] = s.charAt(i); }
        for (int k = 1; k < n; k <<= 1) {
            final int kk = k;
            Arrays.sort(sa, (a, b) -> {
                if (r[a] != r[b]) return Integer.compare(r[a], r[b]);
                int ra = a + kk < n ? r[a + kk] : -1;
                int rb = b + kk < n ? r[b + kk] : -1;
                return Integer.compare(ra, rb);
            });
            nr[sa[0]] = 0;
            for (int i = 1; i < n; i++) {
                int a = sa[i - 1], b = sa[i];
                boolean same = r[a] == r[b]
                    && (a + kk < n ? r[a + kk] : -1) == (b + kk < n ? r[b + kk] : -1);
                nr[b] = nr[a] + (same ? 0 : 1);
            }
            int[] tmp = r; r = nr; nr = tmp;
            if (r[sa[n - 1]] == n - 1) break;
        }
        int[] out = new int[n];
        for (int i = 0; i < n; i++) out[i] = sa[i];
        return out;
    }
    static int[] lcp(String s, int[] sa) {
        int n = s.length();
        int[] inv = new int[n], lcp = new int[n];
        for (int i = 0; i < n; i++) inv[sa[i]] = i;
        int k = 0;
        for (int i = 0; i < n; i++) {
            if (inv[i] == 0) { k = 0; continue; }
            int j = sa[inv[i] - 1];
            while (i + k < n && j + k < n && s.charAt(i + k) == s.charAt(j + k)) k++;
            lcp[inv[i]] = k;
            if (k > 0) k--;
        }
        return lcp;
    }
    public static void main(String[] args) {
        String s = "banana";
        int[] sa = sa(s);
        System.out.println(Arrays.toString(sa));
        System.out.println(Arrays.toString(lcp(s, sa)));
    }
    // Input : banana
    // Output: [5, 3, 1, 0, 4, 2]
    //         [0, 1, 3, 0, 0, 2]
}` },
    { tab: "Template", file: "DistinctSubstrings.java",
      intro: "n(n+1)/2 minus sum of adjacent LCPs.",
      code: `public class DistinctSubstrings {
    static long distinct(int n, int[] lcp) {
        long all = (long) n * (n + 1) / 2;
        for (int x : lcp) all -= x;
        return all;
    }
    public static void main(String[] args) {
        int[] lcp = {0, 1, 3, 0, 0, 2};
        System.out.println(distinct(6, lcp));
    }
    // Input : banana LCPs
    // Output: 15
}` },
  ],
  complexity: {
    time: "O(n log^2 n) this code; O(n log n) with radix; O(n) SA-IS",
    space: "O(n)",
    derivation: [
      "<p>log n doubling steps, each a sort of n pairs. Java Timsort is O(n log n) per step \u2192 O(n log^2 n). Kasai is strictly O(n) because k increases at most n times.</p>",
    ],
    compare: [
      ["Sort substrings naive", "O(n^2 log n)", "O(n)", "n <= 2000"],
      ["Doubling + sort", "O(n log^2 n)", "O(n)", "Java default"],
      ["Doubling + radix", "O(n log n)", "O(n)", "when log^2 TLEs"],
      ["Suffix automaton", "O(n)", "O(n)", "Online, distinct substrings, endpos"],
    ],
  },
  pitfalls: [
    { title: "Kasai forgetting k--",
      bug: "You re-compare from 0 every suffix and go quadratic.",
      fix: "After writing lcp, <code>if (k>0) k--;</code> \u2014 the lemma." },
    { title: "No sentinel / ties",
      bug: "Two suffixes with a common prefix to EOF compare equal and ranks collide forever.",
      fix: "Treat out-of-range rank as -1, strictly smaller than any char." },
    { title: "lcp[0] meaning",
      bug: "Some codes leave lcp[0]=0 unused; summing then subtracts an extra 0 (fine) but RMQ between ranks 0 and 1 must not read lcp[0] as a real LCP.",
      fix: "lcp[i] = LCP(sa[i-1], sa[i]) for i&ge;1. RMQ on (i+1..j)." },
    { title: "Building SA of s+t without a separator",
      bug: "LCS of two strings: suffixes can cross the join.",
      fix: "A char smaller than both alphabets between them." },
    { title: "Integer overflow on n(n+1)/2",
      bug: "n=1e5 \u2192 5e9. int dies.",
      fix: "<code>long</code>." },
  ],
  variants: [
    ["Search a pattern", "Binary search sa; compare s[sa[mid]..] to p in O(|p|).", "O(|p| log n)", "or KMP"],
    ["LCS of two strings", "SA of s+'#'+t; max lcp[i] where sa[i-1] and sa[i] lie in different halves.", "CF classic", "also hashing"],
    ["k-th substring", "Walk sa in order; each suffix sa[i] contributes n-sa[i]-lcp[i] new prefixes.", "skip k", "CF 128B"],
  ],
  followups: [
    ["Prove Kasai's k--.",
      "<p>If suffix i shares h chars with its SA-predecessor, deleting the first character leaves h-1 as a lower bound on the LCP of suffix i+1 with whatever sits just before it in the SA (that predecessor is at least as large as the shifted previous predecessor).</p>"],
    ["SA vs suffix automaton for distinct substrings?",
      "<p>Both O(n). SA needs Kasai and a formula. SAM is one DAG whose endpos sizes sum to the answer. SAM is nicer online; SA is nicer for LCP/RMQ and k-th substring.</p>"],
    ["How do you get LCP of two arbitrary suffixes?",
      "<p>Rank them, RMQ-min the lcp array strictly between those ranks. Sparse table is O(1).</p>"],
    ["Why not always SA-IS?",
      "<p>It is O(n) and long. Doubling is 40 lines and passes n=1e5 in Java. Learn SA-IS later if constants bite.</p>"],
  ],
  problems: [
    { url: "https://cses.fi/problemset/task/2108", name: "Counting Substrings", badge: "gfg", tag: "CSES", level: "Hard", pattern: "Distinct substrings via SA" },
    { url: "https://cses.fi/problemset/task/2105", name: "Distinct Substrings", badge: "gfg", tag: "CSES", level: "Hard", pattern: "n(n+1)/2 - sum lcp" },
    lc("1044", "longest-duplicate-substring", "Hard", "SA max lcp, or binary+hash"),
    lc("718", "maximum-length-of-repeated-subarray", "Medium", "LCS of arrays via SA/hash"),
    cf("452E", "Three strings", "Hard", "SA of three concatenations"),
    cf("128B", "String", "Hard", "k-th substring, careful duplicates"),
    { url: "https://atcoder.jp/contests/abc141/tasks/abc141_e", name: "ABC 141 E", badge: "atc", tag: "ABC 141E", level: "Hard", pattern: "Longest repeated with distance" },
    { url: "https://www.spoj.com/problems/SARRAY/", name: "Suffix Array", badge: "gfg", tag: "SPOJ", level: "Medium", pattern: "Print the SA" },
  ],
  recap: [
    "sa = starting indices of suffixes in lex order.",
    "lcp[i] = LCP of adjacent suffixes in that order.",
    "Kasai: walk text order, k = max(k-1, 0).",
    "Any LCP = RMQ on lcp between ranks.",
    "Distinct = n(n+1)/2 - sum lcp.",
  ],
  oneliner: "sort suffixes by (rank[i], rank[i+k]); kasai: lcp[inv[i]]=k; if(k>0)k--;",
}),

/* ============================== 6. aho-corasick ====================== */
pack({
  id: "aho-corasick",
  difficulty: "Hard",
  readTime: "26 min",
  tagline: "A trie of all patterns plus KMP-style failure links: feed the text once and report every pattern occurrence, overlapping included, in linear time.",
  tags: ["Aho-Corasick", "automaton", "trie", "P2"],
  prereqs: [
    ["KMP & the Prefix Function", "kmp-and-prefix-function.html"],
    ["Trie", "../05-trees/trie.html"],
  ],
  why: [
    "KMP matches one pattern. m patterns in a text of length n is O(n * sum |p|) naively, or m KMP automata. Aho-Corasick builds one automaton whose states are trie nodes and whose failure links jump to the longest proper suffix that is still a prefix of some pattern.",
    "BFS from the root fills failure links (the same queue idea as KMP's \u03c0, on a trie). Output links skip to the next terminal along the failure chain so you do not walk O(patterns) per character.",
    "Hidden as \"virus detection\", \"count how many dictionaries words appear\", and CF problems that DP on the automaton (\"avoid these forbidden words\").",
  ],
  insight: "Failure[u] is the KMP border of the string represented by u, inside the trie of all patterns. Feeding a character is: follow the edge, or fail until you can.",
  yes: [
    "Many patterns, one text, report or count all hits",
    "DP on strings that must avoid a set of forbidden words",
    "Sum of occurrences of every dictionary word, overlaps allowed",
    "You already have a trie and need a failure function on it",
    "n + sum |p| \u2264 1e6 so a linear automaton fits",
  ],
  no: [
    "One pattern &rarr; KMP",
    "Patterns with wildcards / regex &rarr; different automaton",
    "You need suffix order of one string &rarr; SA",
    "Offline \"is this pattern a substring\" of many texts and few patterns &rarr; maybe reverse AC, or hashing",
  ],
  table: [
    ["m patterns in one text", "Trie + failure BFS", "Aho-Corasick"],
    ["One pattern", "Prefix function", "KMP"],
    ["Avoid forbidden words DP", "DP on (position, AC state)", "AC + DP"],
    ["Prefix queries on one dict", "Plain trie", "Trie page"],
    ["All substrings of one s", "Suffix automaton / SA", "Not AC"],
    ["<strong>Confused with:</strong> suffix links of a suffix tree", "Similar idea, different objects", "AC failure is on a dictionary trie"],
  ],
  constraint: "<code>sum |p| + |t| &le; 10&#8310;</code>. Alphabet 26 is an array of 26; larger alphabets use maps and a slower fail. Output-link compression is mandatory if many patterns nest.",
  core: [
    "Insert every pattern into a trie; store pattern ids on terminal nodes. BFS: for each node, for each char, if the child exists, fail[child] = next(fail[node], char); else next(node,char) = next(fail[node], char) (lazy or filled).",
    "Scan the text: state = next(state, c). Then walk output links from state and collect terminals. DP: edges of the automaton are the transitions.",
  ],
  invariant: "<p>The string of fail[u] is the longest proper suffix of u's string that is a prefix of some pattern. After reading a prefix of the text, the current state is the longest suffix of that prefix that is a trie prefix.</p>",
  array: [0, 1, 2, 0, 3],
  arrayLabel: "state after feeding a,b,a,c,a =",
  indexLabels: ["a", "b", "a", "c", "a"],
  vars: ["ch", "state", "hit"],
  frames: [
    { note: "Patterns: ab, ba, aba. Trie: 0 -a-> 1 -b-> 2 (ab, and continue -a-> 4 aba). 0 -b-> 3 (ba).",
      active: [0], values: { ch: "build", state: 0, hit: "none" } },
    { note: "fail[1]=0, fail[2]=3 (\"b\" of \"ab\"), fail[3]=0, fail[4]=1 (\"a\" of \"aba\").",
      active: [0], values: { ch: "fail", state: "links", hit: "\u2014" } },
    { note: "Feed a: state 1. Feed b: state 2, hit \"ab\".",
      active: [0, 1], values: { ch: "ab", state: 2, hit: "ab" } },
    { note: "Feed a: state 4, hit \"aba\" and via fail also \"ba\"? fail[4]=1, output walk collects aba.",
      active: [2], values: { ch: "aba", state: 4, hit: "aba" } },
    { note: "Feed c: no edge, fail to 1 then 0. state 0.",
      active: [3], values: { ch: "c", state: 0, hit: "none" } },
    { note: "Feed a: state 1. Text abaca had hits at \"ab\" and \"aba\".",
      active: [4], values: { ch: "a", state: 1, hit: "done" } },
  ],
  mermaid: `flowchart LR
  r0["root"] -->|"a"| a1["a"]
  r0 -->|"b"| b3["b"]
  a1 -->|"b"| ab2["ab"]
  ab2 -->|"a"| aba4["aba"]
  b3 -->|"a"| baN["ba"]
  ab2 -.->|"fail"| b3
  aba4 -.->|"fail"| a1`,
  merTitle: "Trie edges solid, failure dashed",
  merCaption: "Failure is the KMP border inside the dictionary trie. BFS fills them parent-first.",
  steps: [
    "<strong>Trie insert</strong> every pattern; mark terminals with ids.",
    "<strong>BFS from root:</strong> fail[root]=root (or 0). For each edge, set fail[child] using fail[parent].",
    "<strong>Fill missing transitions</strong> to next(fail, c) so the scan has no while-loop, or keep the while.",
    "<strong>output[u]</strong> = u if terminal, else output[fail[u]] (skip chain).",
    "<strong>Scan t:</strong> state = go(state, c); walk output links; record hits.",
    "<strong>DP variant:</strong> states of the automaton are DP indices.",
  ],
  code: [
    { tab: "Brute", file: "DictBrute.java",
      intro: "For each pattern, indexOf / KMP separately.",
      code: `import java.util.*;
public class DictBrute {
    static int hits(String t, String[] ps) {
        int c = 0;
        for (String p : ps) {
            for (int i = 0; i + p.length() <= t.length(); i++)
                if (t.startsWith(p, i)) c++;
        }
        return c;
    }
    public static void main(String[] args) {
        System.out.println(hits("abaca", new String[] {"ab", "ba", "aba"}));
    }
    // Input : abaca vs ab, ba, aba
    // Output: 2
}` },
    { tab: "Optimal", file: "AhoCorasick.java",
      intro: "Alphabet 26. BFS failure links. Count terminal visits (with output walk).",
      highlight: "28-40",
      code: `import java.util.*;
public class AhoCorasick {
    static final int A = 26;
    int[][] nxt = new int[1][A];
    int[] fail, out;
    int sz = 1;
    void grow() {
        nxt = Arrays.copyOf(nxt, sz + 1);
        nxt[sz] = new int[A];
        sz++;
    }
    void add(String p) {
        int u = 0;
        for (int i = 0; i < p.length(); i++) {
            int c = p.charAt(i) - 'a';
            if (nxt[u][c] == 0) { grow(); nxt[u][c] = sz - 1; }
            u = nxt[u][c];
        }
        out = out == null ? new int[sz] : Arrays.copyOf(out, sz);
        out[u]++;
    }
    void build() {
        fail = new int[sz];
        out = Arrays.copyOf(out == null ? new int[sz] : out, sz);
        ArrayDeque<Integer> q = new ArrayDeque<>();
        for (int c = 0; c < A; c++) if (nxt[0][c] != 0) q.add(nxt[0][c]);
        while (!q.isEmpty()) {
            int u = q.poll();
            for (int c = 0; c < A; c++) {
                int v = nxt[u][c];
                if (v == 0) nxt[u][c] = nxt[fail[u]][c];
                else {
                    fail[v] = nxt[fail[u]][c];
                    out[v] += out[fail[v]];
                    q.add(v);
                }
            }
        }
    }
    long feed(String t) {
        int u = 0;
        long ans = 0;
        for (int i = 0; i < t.length(); i++) {
            u = nxt[u][t.charAt(i) - 'a'];
            ans += out[u];
        }
        return ans;
    }
    public static void main(String[] args) {
        AhoCorasick ac = new AhoCorasick();
        for (String p : new String[] {"ab", "ba", "aba"}) ac.add(p);
        ac.build();
        System.out.println(ac.feed("abaca"));
    }
    // Input : patterns ab, ba, aba; text abaca
    // Output: 2
}` },
    { tab: "Template", file: "AhoGo.java",
      intro: "The go() fallback without pre-filling missing edges \u2014 same idea as KMP's while.",
      code: `public class AhoGo {
    static int go(int[][] nxt, int[] fail, int u, int c) {
        while (u > 0 && nxt[u][c] == 0) u = fail[u];
        return nxt[u][c];
    }
    public static void main(String[] args) {
        int[][] nxt = {{1, 0}, {0, 2}, {0, 0}};
        int[] fail = {0, 0, 0};
        System.out.println(go(nxt, fail, 2, 0));
    }
    // Input : tiny trie, from state 2 ask for 'a'
    // Output: 1
}` },
  ],
  complexity: {
    time: "O((|t| + sum |p|) * alphabet) with filled transitions, or amortised O(|t|+sum|p|) with while-fail",
    space: "O(sum |p| * alphabet)",
    derivation: [
      "<p>Trie size is O(sum |p|). BFS visits each node and each edge once. Scanning the text follows one transition per character; output-link walks are O(hits) if compressed, or can be O(n * patterns) if you naively climb fail every time \u2014 store aggregated out[u] += out[fail[u]].</p>",
    ],
    compare: [
      ["m \u00d7 KMP", "O(n m + sum |p|)", "O(sum |p|)", "few patterns"],
      ["Aho-Corasick", "O(n + sum |p|)", "O(sum |p| \u00b7 \u03c3)", "The default"],
      ["Hash every pattern", "O(n + sum |p|)", "O(sum |p|)", "False positives"],
      ["Suffix automaton of t", "O(|t|)", "O(|t|)", "When the text is one and patterns are queries"],
    ],
  },
  pitfalls: [
    { title: "Not copying out along fail",
      bug: "A nested pattern (\"ab\" inside \"xab\") is missed because you only look at the current node.",
      fix: "<code>out[v] += out[fail[v]]</code> in BFS, or an output link you walk." },
    { title: "fail[child] using an unfilled parent fail",
      bug: "BFS order is mandatory: a node's fail is known before its children are processed? Actually fail[v] uses fail[u] and nxt[fail[u]][c], so parent must already be dequeued. Root's children fail to root.",
      fix: "Queue: push root's children first, fail=0." },
    { title: "nxt[0][c]==0 meaning missing vs meaning root",
      bug: "Using 0 as both \"no edge\" and \"root\". Filling missing edges of root to 0 is correct; using 0 as a real child is not.",
      fix: "Nodes numbered from 0 = root; missing stored as 0 on non-root is \"follow fail\". Root missing stays 0." },
    { title: "Alphabet not 'a'-'z'",
      bug: "char - 'a' negative; crash.",
      fix: "Map to 0..sigma-1, or a HashMap per node (slower fail)." },
    { title: "Growing nxt incorrectly",
      bug: "new int[sz][A] every insert is O(n^2) memory copies.",
      fix: "Preallocate a generous cap, or ArrayList of nodes." },
  ],
  variants: [
    ["DP avoid words", "dp[i][state] ways to build length i landing in state; skip terminals (or absorb into a sink).", "CF 163E / classic", "forbidden-string DP"],
    ["Count each pattern separately", "Don't aggregate out[]; store lists of ids and output-link walk.", "report id list", "when m is small"],
    ["Binary alphabet / bits", "Same trie, 2 children. Used on binary codes.", "nxt[u][0/1]", "CF DNA problems"],
  ],
  followups: [
    ["Why BFS not DFS for failure links?",
      "<p>fail[u] points at a strictly shorter string, which is an ancestor in the failure tree, not necessarily in the trie. BFS by string length (which is trie depth) guarantees that shorter states are ready. Depth BFS on the trie is enough because |fail[u]| &lt; |u|.</p>"],
    ["Aho vs suffix automaton?",
      "<p>AC is a dictionary matcher. SAM represents all substrings of one text. If the text is huge and patterns are queries, SAM or SA of the text. If patterns are the dictionary and the text is a stream, AC.</p>"],
    ["How do you reconstruct positions, not just counts?",
      "<p>Store pattern ids on terminals. On a hit at text index i, the pattern of length L ends at i, starts at i-L+1. Walk output links for nested hits.</p>"],
    ["What is the output link?",
      "<p>The nearest terminal on the failure chain. Jumping output[u] \u2192 output[output[u]] skips non-terminal fails. Aggregating counts into out[u] is even cheaper when you only need totals.</p>"],
  ],
  problems: [
    { url: "https://cses.fi/problemset/task/2102", name: "String Matching II? / Pattern Finder", badge: "gfg", tag: "CSES", level: "Hard", pattern: "Multiple patterns \u2014 CSES Word Combinations is DP" },
    { url: "https://cses.fi/problemset/task/1731", name: "Word Combinations", badge: "gfg", tag: "CSES", level: "Medium", pattern: "Trie DP; AC if many overlapping words" },
    lc("212", "word-search-ii", "Hard", "Trie on board; AC optional"),
    lc("1032", "stream-of-characters", "Hard", "Online AC / reversed trie"),
    cf("163E", "e-Government", "Hard", "AC + Fenwick on fail tree"),
    cf("1202E", "You Are Given Some Strings...", "Hard", "AC both directions"),
    { url: "https://codeforces.com/problemset/problem/963/D", name: "Frequency of String", badge: "cf", tag: "CF 963D", level: "Hard", pattern: "AC + k-th occurrence gaps" },
    { url: "https://www.spoj.com/problems/ACODE/", name: "ACODE", badge: "gfg", tag: "SPOJ", level: "Easy", pattern: "Not AC \u2014 warmup DP; use SUBST1 / JZPGYZ for AC" },
  ],
  recap: [
    "Trie of all patterns + KMP failure on nodes.",
    "BFS fills fail and missing transitions.",
    "out[v] += out[fail[v]] so nested hits are not missed.",
    "Scan is one transition per character.",
    "DP-on-automaton avoids forbidden words.",
  ],
  oneliner: "if (nxt[u][c]==0) nxt[u][c]=nxt[fail[u]][c]; else fail[v]=nxt[fail[u]][c];",
}),
];

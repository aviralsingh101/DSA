/* Module 12 — Strings, Advanced */
import { pack, lc, cf } from "./pack.mjs";

export const topics = [

/* ============================== 1. kmp-and-prefix-function =========== */
pack({
  id: "kmp-and-prefix-function",
  difficulty: "Medium",
  readTime: "32 min",
  tagline: "The prefix function <code>&pi;[i]</code> is the longest proper prefix of <code>s[0..i]</code> that is also a suffix &mdash; KMP matching is one scan using those borders.",
  tags: ["KMP", "prefix function", "string", "P1"],
  prereqs: [
    ["Two Pointers", "../01-arrays-and-windows/two-pointers.html"],
    ["Hashing Patterns", "../02-sorting-hashing-bits/hashing-patterns.html"],
  ],
  why: [
    "You are given a long text and a shorter pattern, and you must find every place the pattern sits inside the text, including places that overlap. The obvious loop tries the pattern at index 0, then at index 1, and so on, and on each try it compares characters from the start of the pattern. That is perfectly correct, and on a text of length <code>n</code> and a pattern of length <code>m</code> it can do about <code>n &times; m</code> comparisons. At <code>n = m = 10<sup>5</sup></code> that is <code>10<sup>10</sup></code> steps, and the judge will cut you off long before you finish.",
    "The array that saves those repeated comparisons is the <em>prefix function</em>. For a string <code>s</code>, the value <code>&pi;[i]</code> is the length of the longest <em>proper prefix</em> of the piece <code>s[0..i]</code> that is also a suffix of that same piece. Proper means the piece itself does not count, so <code>&pi;[i]</code> is always strictly smaller than <code>i+1</code>. People also call that shared piece a <em>border</em>. Once you know every border of the pattern, a mismatch no longer sends you back to the start of the text: it jumps the pattern to its next shorter border and you keep reading the text from the same character.",
    "Those borders nest inside each other, which is why a single array is enough. If a candidate border of length <code>q</code> fails on the next character, every alignment that can still use some of the text you already matched must itself be a border of that failed border. The longest such leftover is exactly <code>&pi;[q-1]</code>, so the fallback <code>q = &pi;[q-1]</code> never skips a viable shift and never invents one. The same array then answers \"shortest period\", counts overlapping hits, and builds the failure automaton you feed many texts through.",
    "In a real statement the signal is a single pattern against a text of length about <code>10<sup>6</sup></code>, or the phrase \"shortest period\" sitting next to a string that looks repetitive. Rolling hash is the randomised cousin and is faster to type; this page is the deterministic linear scan you write when the statement forbids false positives or when you need the border structure itself, not just equality.",
  ],
  insight: "A mismatch at a candidate border of length <code>q</code> does not rewind the text: the next candidate is <code>&pi;[q-1]</code>, the longest border of that border, and every surviving alignment is somewhere on that nested chain. Keep a current length <code>q</code> and you finish both the prefix array and the match in one pass.",
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
  constraint: "<code>|s| &le; 10<sup>6</sup></code> is the linear-string window: you get one pass over the characters and nothing else. Building <code>&pi;</code> is strictly <code>O(n)</code> because the inner fallback loop cannot run more than <code>n</code> times in total. Recursion is not involved; if the statement also asks for many different patterns, this page is the wrong tool and you want Aho-Corasick instead.",
  core: [
    "You need one array <code>pi</code> of length <code>n</code> and one integer <code>q</code>. The slot <code>pi[i]</code> will hold the longest border of the prefix that ends at <code>i</code>, and <code>q</code> is that same length for the prefix you have just finished, so you can try to grow it onto the next character. Start with <code>pi[0] = 0</code> and <code>q = 0</code>, because a single character has no proper prefix. Then for each later index <code>i</code> you do three things: while <code>q</code> is positive and <code>s[i]</code> disagrees with <code>s[q]</code>, replace <code>q</code> by <code>pi[q-1]</code>; if the characters now agree, increment <code>q</code>; finally write <code>pi[i] = q</code>.",
    "The fallback <code>q = pi[q-1]</code> looks like it might skip a match, so sit with why it cannot. After the previous character you already know that the last <code>q</code> characters of the processed prefix equal <code>s[0..q)</code>. When <code>s[i]</code> is not <code>s[q]</code>, a border of length <code>q+1</code> is impossible. Any alignment that still uses some of those already-matched characters must start later, which means the leftover length <code>k</code> has to satisfy <code>s[0..k) = s[q-k..q)</code> &mdash; that is, <code>k</code> itself must be a border of the string of length <code>q</code>. The longest such <code>k</code> is stored at index <code>q-1</code>, so it is exactly <code>pi[q-1]</code>. If that also fails you walk to <code>pi[pi[q-1]-1]</code>, and so on down to 0. Every possible surviving shift is a border of a border, so the chain visits them all and invents none.",
    "The same walk is why the whole pass is linear, even though there is a <code>while</code> inside the <code>for</code>. Treat <code>q</code> as a potential: it starts at 0, each index increases it by at most 1, and every iteration of the inner loop drops it to a strictly smaller non-negative integer. The total of all those drops cannot exceed the total of all the increments, and the increments are at most <code>n-1</code>, so the body of the <code>while</code> runs at most <code>n</code> times across the whole string. Matching is the same arithmetic on a string of length <code>|p| + |t| + 1</code>.",
    "Walk <code>ababac</code> character by character. At <code>i = 0</code> the piece is <code>a</code> and there is no proper prefix, so <code>pi[0] = 0</code>. At <code>i = 1</code> the piece is <code>ab</code>; the only proper prefix is <code>a</code> and the only proper suffix is <code>b</code>, they disagree, and <code>pi[1] = 0</code>. At <code>i = 2</code> the piece is <code>aba</code>; the proper prefixes are <code>a</code> and <code>ab</code>, the proper suffixes are <code>a</code> and <code>ba</code>, and the longest string in both lists is <code>a</code>, so <code>pi[2] = 1</code>. At <code>i = 3</code> you extend that border by <code>b</code> and get <code>ab</code>, so <code>pi[3] = 2</code>. At <code>i = 4</code> you extend again and get <code>aba</code>, so <code>pi[4] = 3</code>. At <code>i = 5</code> the next character is <code>c</code> against <code>s[3] = b</code>; the fallback walks <code>q</code> from 3 to <code>pi[2] = 1</code> (try <code>c</code> against <code>s[1] = b</code>) and then to <code>pi[0] = 0</code> (try <code>c</code> against <code>s[0] = a</code>), both fail, and <code>pi[5] = 0</code>. To match a pattern <code>p</code> inside a text <code>t</code>, build <code>pi</code> of <code>p + '#' + t</code> using a sentinel that appears in neither string; every index in the text half whose value equals <code>|p|</code> is an occurrence ending there.",
  ],
  invariant: "<p>The prefix function is the longest proper border of every prefix:</p><span class=\"eq\">&pi;[i] = max { k : 0 &le; k &lt; i+1 and s[0..k) = s[i-k+1..i] }, or 0 if no such k exists.</span><p>In plain words, after you finish index <code>i</code> the integer <code>q</code> is exactly that longest border, and the only shorter borders you will ever need are the borders of that border, which already live in <code>&pi;</code>. Interview sentence: <em>\"On a mismatch I set <code>q = &pi;[q-1]</code>; that is the next possible alignment, and the potential on <code>q</code> makes the whole scan linear.\"</em></p>",
  extra: [
    { kind: "warn", title: "The fallback is pi[q-1], never pi[q]",
      html: "<p>The string whose border you want has length <code>q</code>, so its last index is <code>q-1</code>. Writing <code>q = pi[q]</code> either reads an entry you have not filled yet or walks a different string, and the loop can spin or skip the alignment you needed. Test the fallback on <code>ababac</code> at the final <code>c</code>: the live length is 3, and the next try must be <code>pi[2] = 1</code>.</p>" },
    { kind: "tip", title: "You do not have to concatenate",
      html: "<p>Build <code>pi</code> of the pattern alone. Scan the text with the same while-and-increment, and when <code>q</code> reaches <code>|p|</code> record a hit and set <code>q = pi[q-1]</code> so overlapping hits are not lost. The sentinel concatenation is the same idea with the bookkeeping already inside <code>pi</code>.</p>" },
    { kind: "math", title: "Why the inner loop cannot exceed n drops",
      html: "<p>Let <code>q</code> be a potential. Each of the <code>n-1</code> values of <code>i</code> increases it by at most 1. Each <code>while</code> iteration replaces <code>q</code> by a strictly smaller non-negative integer. A non-negative integer cannot fall more times than it has risen, so the inner body runs at most <code>n-1</code> times in total &mdash; about a million extra array reads at <code>n = 10<sup>6</sup></code>, not a quadratic blow-up.</p>" },
  ],
  array: [0, 0, 1, 2, 3, 0],
  arrayLabel: "\u03c0 =",
  indexLabels: ["a", "b", "a", "b", "a", "c"],
  vars: ["i", "q", "pi"],
  frames: [
    { note: "The string is ababac. At i = 0 the piece is just a, so there is no proper prefix and pi[0] stays 0 with q = 0.",
      active: [0], values: { i: 0, q: 0, pi: "[0]" } },
    { note: "At i = 1 the character b is compared with s[0] = a. They disagree, q has nowhere to fall, and pi[1] is 0.",
      active: [1], values: { i: 1, q: 0, pi: "[0,0]" } },
    { note: "At i = 2 the character a matches s[0], so q grows to 1. The longest border of aba is the single letter a, and pi[2] becomes 1.",
      active: [2], values: { i: 2, q: 1, pi: "[0,0,1]" } },
    { note: "At i = 3 the character b matches s[1], so q grows to 2. The longest border of abab is the string ab, and pi[3] becomes 2.",
      active: [3], values: { i: 3, q: 2, pi: "[0,0,1,2]" } },
    { note: "At i = 4 the character a matches s[2], so q grows to 3. The longest border of ababa is the string aba, and pi[4] becomes 3.",
      active: [4], values: { i: 4, q: 3, pi: "[0,0,1,2,3]" } },
    { note: "At i = 5 the character c disagrees with s[3] = b. The fallback sets q to pi[2] = 1, then to pi[0] = 0, and pi[5] ends at 0.",
      active: [5], values: { i: 5, q: 0, pi: "[0,0,1,2,3,0]" } },
  ],
  dryIntro: "Every index of ababac, showing how q grows on a match and how the fallback pi[q-1] walks nested borders on the final mismatch.",
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
    "<strong>Allocate the array and the live length.</strong> Create <code>int[] pi = new int[n]</code> and set <code>q = 0</code>. Index 0 has no proper prefix, so <code>pi[0]</code> stays 0 and you never write it again.",
    "<strong>Walk every later index.</strong> For <code>i</code> from 1 to <code>n-1</code> you will try to grow the current border onto <code>s[i]</code>. Starting at 1 is load-bearing: the fallback reads <code>pi[q-1]</code>, which is only defined for prefixes you have already finished.",
    "<strong>Fall back while the next character disagrees.</strong> While <code>q &gt; 0</code> and <code>s[i] != s[q]</code>, replace <code>q</code> by <code>pi[q-1]</code>. That is the longest border of the failed border, so you try the next possible alignment without moving <code>i</code> backwards.",
    "<strong>Grow the border when the characters agree.</strong> If <code>s[i] == s[q]</code> after the fallback (or because <code>q</code> was already 0 and they happen to match), increment <code>q</code>. You have just lengthened the live prefix by one character.",
    "<strong>Record the answer at this index.</strong> Write <code>pi[i] = q</code>. Later fallbacks will read this slot, so the value must be the true longest border, not a shorter one you happened to try along the way.",
    "<strong>Match a pattern by building pi of the concatenation.</strong> Compute the prefix function of <code>p + '#' + t</code> using a sentinel that appears in neither string, then report every index in the text half where <code>pi[i] == p.length()</code>. Those are the ends of occurrences, overlaps included.",
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
      "<p>The outer loop visits each of the <code>n-1</code> later indices once. The live length <code>q</code> starts at 0 and grows by at most 1 after each index, so it can rise at most <code>n-1</code> times. Every iteration of the inner <code>while</code> replaces <code>q</code> by a strictly smaller non-negative integer, and a non-negative integer cannot fall more times than it has risen. Therefore the inner body runs at most <code>n-1</code> times across the whole string, and the whole prefix-function pass is <code>O(n)</code> array reads.</p>",
      "<p>Matching is one more prefix-function call on the concatenated string of length <code>|p| + |t| + 1</code>, which is the same bound. Putting real numbers in: at <code>n = 10<sup>6</sup></code> you do a couple of million character comparisons, which is a few milliseconds. The naive aligner at the same size is <code>n &times; m</code> comparisons, about <code>10<sup>12</sup></code> if both strings are long, and that is not a contest-legal runtime.</p>",
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
      bug: "Computing <code>&pi;</code> of <code>p+t</code> without a separator looks like a clever concatenation, and the array even fills. A border can cross the join and invent a fake occurrence that is half pattern and half text.",
      fix: "Insert a character that appears in neither string, or scan the text with a separate automaton built from <code>p</code> alone. Test it on pattern <code>ab</code> and text <code>ba</code>: without a sentinel you can report a hit that is not there." },
    { title: "Off-by-one on occurrence index",
      bug: "Seeing <code>&pi;[i] == |p|</code> and treating <code>i</code> as a start index looks right because that is how Z-values work. For the prefix function the match <em>ends</em> at <code>i</code> in the concatenated string, so the start in <code>t</code> is a different arithmetic.",
      fix: "Loop <code>i</code> over the text half as in the code, where the start is <code>i - m + 1</code> after you have already offset into <code>t</code>. Check the sample <code>ababa</code> / <code>aba</code>, which must report starts 0 and 2, not 2 and 4." },
    { title: "Period formula without the divisibility check",
      bug: "The string <code>abcab</code> has <code>&pi;[n-1] = 2</code>, so <code>n - &pi; = 3</code> looks like a period, and the formula is sitting right there in every blog post. The string is not <code>abc</code> repeating.",
      fix: "The candidate <code>p = n - &pi;[n-1]</code> is the shortest period only when <code>p</code> divides <code>n</code>. Otherwise the string is not a whole number of copies and you should report <code>n</code> itself." },
    { title: "Using &pi;[q] instead of &pi;[q-1]",
      bug: "Writing <code>q = pi[q]</code> looks symmetric with the live length, and on a lucky sample it even terminates. The border of a string of length <code>q</code> lives at index <code>q-1</code>, so the wrong index either loops or skips a nested border.",
      fix: "The while body is always <code>q = pi[q-1]</code>. Walk <code>ababac</code> at the last character by hand: the live length is 3 and the next try must read <code>pi[2]</code>, not <code>pi[3]</code>." },
    { title: "A sentinel that already appears in the input",
      bug: "Gluing with <code>'#'</code>, a space, or <code>'$'</code> looks safe because those characters are punctuation. If the statement's alphabet includes them, a border can again cross the join and the match list is wrong.",
      fix: "Pick a code that is outside the alphabet, or store the concatenation as an <code>int[]</code> with a sentinel integer such as <code>-1</code>. Print the <code>pi</code> array of <code>p + sentinel + t</code> and check that no value in the text half exceeds <code>|p|</code> except at real hits." },
  ],
  variants: [
    ["KMP automaton", "trans[q][c] = next state. Fill using &pi;.", "for c: trans[i][c] = s[i]==c ? i+1 : trans[pi[i-1]][c]", "many texts, one pattern"],
    ["Count overlapping hits", "Every time state hits |p|, add 1 and go to &pi;[|p|-1].", "state = pi[m-1]", "the default"],
    ["Border tree", "parent of i+1 is &pi;[i]; tree of all borders.", "useful for counting distinct borders", "CF 432D"],
  ],
  followups: [
    ["Z-function vs prefix function?",
      "<p>The Z-value at <code>i</code> is the longest substring that <em>starts</em> at <code>i</code> and matches a prefix of <code>s</code>. The prefix-function value at <code>i</code> is the longest border that <em>ends</em> at <code>i</code>. They determine each other in linear time, so neither is more powerful. Matching a single pattern is more natural from <code>&pi;</code> because the fallback <code>q = &pi;[q-1]</code> is already the next automaton state; Z is more natural when the question is already \"how much prefix starts here?\".</p>"],
    ["Why is the inner loop amortised O(1)?",
      "<p>Amortised here means the expensive steps are rare enough that their total, divided by <code>n</code>, stays constant. The live length <code>q</code> is a potential: each index raises it by at most one, and each inner iteration drops it. The drops cannot outnumber the raises, so across the whole string the inner body runs at most <code>n</code> times. One index might walk a long border chain, but it spends credit that earlier matches deposited.</p>"],
    ["How do you match without concatenating?",
      "<p>Build <code>&pi;</code> of the pattern alone. Scan the text with the same while-and-increment used to fill <code>&pi;</code>, treating the text character as the next <code>s[i]</code> and the live length as the current state. When that state reaches <code>|p|</code> you have a hit ending at the current text index; set the state to <code>&pi;[|p|-1]</code> so the next character can still start an overlapping hit.</p>"],
    ["Can KMP find the lexicographically smallest rotation?",
      "<p>Yes, that is Booth's algorithm: run the prefix-function idea on <code>s+s</code> and keep the smallest start that the border structure still allows. The other school is Duval's Lyndon factorisation, which also finds the least rotation in linear time. In an interview, say you would KMP on the doubled string and then mention Duval if they ask for the cleanest linear construction.</p>"],
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
  readTime: "28 min",
  tagline: "Z[i] is the longest substring starting at i that matches the prefix of s. One linear pass maintains a rightmost Z-box.",
  tags: ["Z-function", "string", "P1"],
  prereqs: [
    ["KMP & the Prefix Function", "kmp-and-prefix-function.html"],
    ["Two Pointers", "../01-arrays-and-windows/two-pointers.html"],
  ],
  why: [
    "You are given a string, and at every starting index you want to know how many characters of a prefix of the whole string sit there. Pattern matching is the same question after you glue the pattern in front of the text; so are \"shortest period\" and a slow-but-honest count of distinct substrings. The obvious answer compares the prefix against the suffix that starts at each <code>i</code> from scratch. On a string of length <code>n</code> that is about <code>n<sup>2</sup> / 2</code> comparisons, and at <code>n = 10<sup>5</sup></code> that is five billion steps the judge will not wait for.",
    "The linear algorithm remembers the rightmost stretch it has already proved is a copy of a prefix. That stretch is called a <em>Z-box</em> and is stored as a closed interval <code>[l, r]</code>, meaning <code>s[l..r]</code> equals <code>s[0..r-l]</code>. When a new index <code>i</code> lands inside that box, the character at <code>i</code> corresponds to the character at <code>i-l</code> in the prefix, so you already know a lower bound on how far a prefix-match from <code>i</code> can run. You copy that bound, clip it so it does not claim more than the remaining box, and only then walk characters if the copy ran out of known ground.",
    "That reuse is the same two-pointer idea Manacher uses for palindromes: a window that only grows to the right, plus a mirror (here a prefix copy) that fills most cells in constant time. Z and the prefix function determine each other in linear time. Prefer Z when the question is already \"how much prefix starts at each index\"; prefer <code>&pi;</code> when you are building failure links or an automaton.",
    "In a real statement the signal is <code>n &le; 10<sup>6</sup></code> together with a question about prefix matches, periods, or one pattern in one text. If the statement asks for many different patterns, this page is the wrong tool; if it asks for palindromic radii, go to Manacher; if it asks for suffix order, go to the suffix array.",
  ],
  insight: "Inside the rightmost Z-box you already hold a prefix copy, so <code>Z[i]</code> starts at <code>min(Z[i-l], r-i+1)</code> instead of at zero. You only compare fresh characters when that copy hits the box edge or when <code>i</code> sits outside the box, and because <code>r</code> never moves left the extra comparisons stay linear.",
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
  constraint: "<code>n &le; 10<sup>6</sup></code> is the linear-string window. The extend loop is amortised <code>O(n)</code> because the right edge <code>r</code> only moves right, so each successful comparison is paid for once. If you forget to reuse the box you fall back to the quadratic scan and those limits will time out; if the statement wants many patterns or palindromes, this is the wrong array.",
  core: [
    "You need an array <code>Z</code> of length <code>n</code> and two integers <code>l</code> and <code>r</code>. The slot <code>Z[i]</code> will hold the longest length such that <code>s[i..i+Z[i])</code> equals <code>s[0..Z[i])</code>. Leave <code>Z[0] = 0</code> and never copy from it: some write-ups store <code>n</code> there, and then a later <code>i-l = 0</code> copies that <code>n</code> and walks off the string. The pair <code>[l, r]</code> is the rightmost Z-box found so far, meaning <code>s[l..r]</code> is already known to equal <code>s[0..r-l]</code>, and both start at 0 so the box is empty.",
    "For each <code>i</code> from 1 to <code>n-1</code> you first ask whether <code>i</code> sits inside the live box. If <code>i &le; r</code>, the prefix-copy says that a match of length <code>Z[i-l]</code> starts at the corresponding prefix index, but you must not claim more characters than the box still covers, so you set <code>Z[i] = min(r-i+1, Z[i-l])</code>. If <code>i</code> is past <code>r</code>, you start <code>Z[i]</code> at 0. Then you extend: while the next character past the current length still matches the corresponding prefix character, increment <code>Z[i]</code>. If the new match now ends to the right of <code>r</code>, move the box so <code>l = i</code> and <code>r = i+Z[i]-1</code>. You never shrink <code>r</code>.",
    "The clip is load-bearing. Suppose the copied value <code>Z[i-l]</code> is 5 but only 2 characters of the box remain. Those 2 are known to match; the third character past <code>r</code> has never been compared at this alignment, so claiming 5 would invent a match. Conversely, if the copied value equals the remaining box exactly, the match might continue past <code>r</code>, which is why you always run the extend loop after the copy and do not stop at the clip. The same picture is Manacher's mirror: copy, clip to the window, then try one more character.",
    "Walk <code>ababac</code>. At <code>i = 1</code> the character <code>b</code> disagrees with <code>s[0] = a</code>, so <code>Z[1] = 0</code> and the box stays empty. At <code>i = 2</code> you start from 0 and extend through <code>aba</code> against the prefix <code>aba</code>, stopping before the last <code>c</code>, so <code>Z[2] = 3</code> and the box becomes <code>[2, 4]</code>. At <code>i = 3</code> you are inside the box; the corresponding prefix index is 1 and <code>Z[1] = 0</code>, so the copy is 0 and you cannot extend, hence <code>Z[3] = 0</code>. At <code>i = 4</code> the copy wants <code>Z[2] = 3</code> but only one character of the box remains, so you start at 1; the next character past the box is <code>c</code> against <code>s[1] = b</code>, they disagree, and <code>Z[4] = 1</code>. At <code>i = 5</code> you are past the box and <code>c</code> disagrees with <code>a</code>, so <code>Z[5] = 0</code>. To match a pattern, build Z of <code>p + '#' + t</code>; every text index with <code>Z[i] == |p|</code> is a hit starting there.",
  ],
  invariant: "<p>The interval <code>[l, r]</code> is a prefix of <code>s</code> copied so that it starts at <code>l</code>:</p><span class=\"eq\">s[l..r] = s[0..r-l], and for i in (l, r] we have Z[i] &ge; min(Z[i-l], r-i+1)</span><p>In plain words, everything strictly inside the rightmost prefix-copy is already answered except when that copy runs out of box, and those leftover characters are the only ones the extend loop is allowed to spend. Interview sentence: <em>\"I reuse the rightmost Z-box, clip to its edge, then extend; <code>r</code> only moves right, so the pass is linear.\"</em></p>",
  extra: [
    { kind: "warn", title: "Always extend after the copy",
      html: "<p>Stopping at <code>min(r-i+1, Z[i-l])</code> looks complete because both numbers are known matches. When the copy hits the box edge the next character is unknown at this alignment and may still match. Skip the <code>while</code> and you under-report Z-values that reach past <code>r</code>, which then poisons later copies.</p>" },
    { kind: "tip", title: "Leave Z[0] at 0",
      html: "<p>Storing <code>n</code> at index 0 is a convention for \"the whole string matches itself\". The algorithm then needs a special case when <code>i-l</code> is 0, because copying <code>n</code> walks off the array. Leaving <code>Z[0] = 0</code> makes the copy line safe and you never use that slot as a match start anyway.</p>" },
  ],
  array: [0, 0, 3, 0, 1, 0],
  arrayLabel: "Z =",
  indexLabels: ["a", "b", "a", "b", "a", "c"],
  vars: ["i", "l,r", "Z"],
  frames: [
    { note: "The string is ababac and Z[0] stays unused at 0. At i = 1 the character b disagrees with a, so Z[1] is 0 and the box is still empty.",
      active: [1], values: { i: 1, "l,r": "0,0", Z: "[0,0]" } },
    { note: "At i = 2 the character a matches the prefix. Extending compares aba against aba and stops before c, so Z[2] becomes 3 and the box is now [2, 4].",
      active: [2, 3, 4], values: { i: 2, "l,r": "2,4", Z: "[0,0,3]" } },
    { note: "Index 3 sits inside the box. The corresponding prefix slot is Z[1] = 0, the remaining box is 2, and min(2, 0) is 0, so Z[3] stays 0.",
      active: [3], values: { i: 3, "l,r": "2,4", Z: "[0,0,3,0]" } },
    { note: "Index 4 sits inside the box. The copy wants Z[2] = 3 but only one character remains, so we start at 1; the next pair is b against c and Z[4] stays 1.",
      active: [4], values: { i: 4, "l,r": "2,4", Z: "[0,0,3,0,1]" } },
    { note: "Index 5 sits past the box. The character c disagrees with the prefix a, so Z[5] is 0 and the box is left untouched.",
      active: [5], values: { i: 5, "l,r": "2,4", Z: "[0,0,3,0,1,0]" } },
    { note: "The finished array is [0, 0, 3, 0, 1, 0]. A pattern aba would show up as a Z-value of 3 at every start where that prefix sits.",
      active: [0, 1, 2, 3, 4, 5], values: { i: "done", "l,r": "2,4", Z: "[0,0,3,0,1,0]" } },
  ],
  dryIntro: "Every index of ababac, showing when the rightmost Z-box is reused, when the copy is clipped to the remaining box, and when a fresh extend widens r.",
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
    "<strong>Zero the unused prefix slot.</strong> Set <code>Z[0] = 0</code> so a later copy with <code>i-l = 0</code> cannot pick up the string length and walk off the array. You will never treat index 0 as a match start.",
    "<strong>Start with an empty box.</strong> Set <code>l = r = 0</code>, then walk <code>i</code> from 1 to <code>n-1</code>. The pair <code>[l, r]</code> will always be the rightmost prefix-copy discovered so far.",
    "<strong>Reuse the box when i sits inside it.</strong> If <code>i &le; r</code>, write <code>Z[i] = min(r-i+1, Z[i-l])</code>. The first number is how much box remains; the second is the known prefix-match at the corresponding prefix index.",
    "<strong>Extend with fresh comparisons.</strong> While <code>i + Z[i]</code> is in bounds and <code>s[Z[i]]</code> equals <code>s[i + Z[i]]</code>, increment. This is the only place new characters are compared, and it is what catches a match that continues past the old <code>r</code>.",
    "<strong>Widen the box, never shrink it.</strong> If <code>i + Z[i] - 1 &gt; r</code>, set <code>l = i</code> and <code>r = i + Z[i] - 1</code>. Charging every successful extend to a rightward move of <code>r</code> is the linear-time argument.",
    "<strong>Match a pattern on the concatenated string.</strong> Build Z of <code>p + '#' + t</code> with a sentinel outside both alphabets, then collect every text index where <code>Z[i] == |p|</code>. Those values are start indices, unlike the prefix-function hits which are ends.",
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
      "<p>The outer loop visits each of the <code>n-1</code> later indices once and the box-copy is a constant amount of arithmetic. The only loop that can run more than once per index is the extend. Every successful extend comparison increases <code>r</code> by at least one, and <code>r</code> never decreases, so successful extends total at most <code>n</code>. A failed extend comparison happens at most once per <code>i</code> after the copied value is installed, which is another <code>n</code> comparisons.</p>",
      "<p>Putting real numbers in: at <code>n = 10<sup>6</sup></code> you do a couple of million character reads, which is a few milliseconds. The naive prefix-at-every-i scan is about <code>n<sup>2</sup> / 2</code> comparisons, five billion at <code>n = 10<sup>5</sup></code> already, and that is the runtime this box is designed to avoid.</p>",
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
      bug: "Storing the string length at index 0 looks tidy because the whole string is a prefix of itself. The first time <code>i-l</code> is 0 the copy writes <code>n</code> into <code>Z[i]</code> and the extend loop walks off the array or invents a match past the end.",
      fix: "Leave <code>Z[0] = 0</code>, or special-case the copy when <code>i</code> equals <code>l</code>. Test a string that starts a new box at every other index, such as <code>ababab</code>." },
    { title: "Updating [l,r] with a weaker box",
      bug: "Moving <code>r</code> left, or replacing the box whenever a new <code>i</code> has a positive Z, looks like you are keeping the window current. Shrinking <code>r</code> throws away known prefix-copies, breaks the amortised bound, and can make later Z-values too small if you then skip the extend.",
      fix: "Only widen when <code>i + Z[i] - 1 &gt; r</code>. The rightmost box is the only one whose remaining characters are still unused information." },
    { title: "min(r-i+1, Z[i-l]) without extend",
      bug: "The clip already looks like the answer, because both arguments are proven matches. When the copied Z-value hits the box edge, the next character past <code>r</code> might still match the prefix and you are supposed to keep going.",
      fix: "Always run the extend <code>while</code> after the copy. A good test is a string whose Z-box ends in the middle of a longer prefix-match, such as <code>aaaabaaa</code>." },
    { title: "Sentinel missing",
      bug: "Building Z of <code>p+t</code> without a separator looks like the KMP concatenation trick with less punctuation. A Z-value can cross the join and report a hit that is half pattern and half text.",
      fix: "Insert a character outside both alphabets. Check that no Z-value in the text half exceeds <code>|p|</code> except at real occurrences." },
    { title: "Comparing chars with == on substrings",
      bug: "Writing <code>s.substring(a) == s.substring(b)</code> looks like an equality test and even compiles. In Java that is reference equality of two new String objects, so it is almost always false and the extend loop never runs.",
      fix: "Compare with <code>charAt</code> in the extend loop, as the listing does. If you ever need a whole-slice check, use <code>equals</code>, not <code>==</code>." },
  ],
  variants: [
    ["Period", "If Z[i]==n-i and i divides n, period i.", "for i if z[i]==n-i && n%i==0", "string compression"],
    ["Distinct substrings (slow)", "For each suffix, add n-i-lcp-with-prefix via Z of suffix.", "O(n^2)", "n <= 5000; else SA"],
    ["From \u03c0 to Z", "Known linear conversion; rarely needed if you can compute Z directly.", "see CP-algorithms", "when you only built \u03c0"],
  ],
  followups: [
    ["Why copy min(r-i+1, Z[i-l])?",
      "<p>The live box says <code>s[l..r]</code> equals <code>s[0..r-l]</code>, so the character at <code>i</code> is a copy of the character at <code>i-l</code> in the prefix. You cannot claim a longer prefix-match than <code>Z[i-l]</code>, because that is already the longest prefix sitting at the corresponding place. You also cannot claim more characters than the remaining box, because past <code>r</code> you have no copy. The minimum of those two numbers is the largest claim that is already proved; the extend loop is what tries to prove more.</p>"],
    ["Z vs KMP for matching?",
      "<p>Both are linear in <code>|p| + |t|</code>. Z is a little more code for matching and a little less conceptual load when the question is already \"prefix at every index\". The prefix function composes better with Aho-Corasick, because a failure link is exactly <code>&pi;[q-1]</code>. In an interview, pick the one whose array the rest of the problem already wants.</p>"],
    ["Can Z handle wildcards?",
      "<p>Not by itself, because a Z-box is a claim that two concrete characters were equal. Split the pattern on each <code>?</code>, Z-match every concrete chunk against the text, and then check that the gaps between those hits have the right lengths. The other school is FFT string matching, which treats a wildcard as a coefficient that does not contribute to the mismatch count.</p>"],
    ["Manacher uses the same idea?",
      "<p>Yes. Manacher keeps a rightmost palindrome instead of a rightmost prefix-copy, and the value it reuses is the radius at the mirrored centre rather than <code>Z[i-l]</code>. The rest of the skeleton is identical: clip to the window, extend if the copy hits the edge, and charge every successful extend to a rightward move of <code>r</code>. Once you can write Z, Manacher is the palindrome-flavoured version of the same pass.</p>"],
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
  readTime: "30 min",
  tagline: "Map every substring to a polynomial <code>s[l] b^{len-1} + \u2026 + s[r]</code> modulo a prime so equality (and 2D / palindrome checks) become a few multiplies.",
  tags: ["hashing", "polynomial hash", "P1"],
  prereqs: [
    ["Modular Arithmetic", "../11-math-and-number-theory/modular-arithmetic.html"],
    ["Prefix Sums", "../01-arrays-and-windows/prefix-sums.html"],
  ],
  why: [
    "You are given a string and a pile of questions of the form \"is the slice from here to there the same as the slice from over there?\" The honest answer compares the two slices character by character. That is correct, and at length <code>n</code> it costs <code>n</code> work per question. With <code>q = 2 &times; 10<sup>5</sup></code> questions on strings of length <code>10<sup>5</sup></code> you are looking at about <code>2 &times; 10<sup>10</sup></code> comparisons, and the judge will not wait. KMP and Z solve the special case of one pattern in one text, but they do not give you an arbitrary pair of slices in constant time, and they do not drop a set of slices into a hash set.",
    "The fix is to treat each slice as a number. Pick a base <code>b</code> and a modulus <code>M</code>, and read the characters of a slice as digits of a base-<code>b</code> integer, then reduce modulo <code>M</code>. Two slices that are equal produce the same number; two slices that differ almost always produce different numbers. After one prefix pass you can recover any slice's number with a subtraction and a multiply, the same shape as a prefix-sum difference, except the powers of <code>b</code> have to be aligned before you subtract.",
    "That number is called a <em>polynomial hash</em> or a <em>rolling hash</em>. One comparison against a small prime can collide, which is why contest code uses a random base, two moduli, or the free ring of unsigned 64-bit overflow. The interview sentence is \"compare hashes first, and if the modulus is small enough to worry about, verify the characters on a hit\". On Codeforces, tests that break a famous base and <code>10<sup>9</sup>+7</code> are a known sport.",
    "In a real statement the signal is many substring-equality questions, a binary search on \"longest common prefix of these two suffixes\", palindrome queries, or \"put these slices in a set\". If you must be deterministic with one pattern and no collision story, write KMP. If you need the lexicographic order of every suffix, write a suffix array.",
  ],
  insight: "A substring hash is a prefix-hash difference scaled by a power of the base &mdash; the same identity as a prefix sum, just living in a modular ring. Build <code>H</code> and <code>pow</code> once, then every slice is one multiply and one subtract, and two slices are equal exactly when those numbers agree (or, with a tiny probability, when they collide).",
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
  constraint: "<code>n, q &le; 2 &times; 10<sup>5</sup></code> substring-equality questions is the signature. Two 64-bit moduli and a base drawn at random from <code>[257, 10<sup>9</sup>)</code> make a collision on that batch a non-event. A single fixed <code>10<sup>9</sup>+7</code> with base 31 is the combination Codeforces anti-hash tests are written to break, so do not ship it alone.",
  core: [
    "You need two arrays, <code>H</code> and <code>pow</code>, both of length <code>n+1</code>. Fix a base <code>b</code> larger than the alphabet and a modulus <code>M</code>. Set <code>H[0] = 0</code> and <code>pow[0] = 1</code>. Then for each index <code>i</code> write <code>H[i+1] = (H[i] * b + s[i]) mod M</code> and <code>pow[i+1] = (pow[i] * b) mod M</code>. After that pass, <code>H[i]</code> is the hash of the prefix <code>s[0..i)</code>, read as a base-<code>b</code> integer. The half-open slice <code>[l, r)</code> has hash <code>(H[r] - H[l] * pow[r-l]) mod M</code>; if the subtraction went negative, add <code>M</code> back, because Java's remainder operator can return a negative representative.",
    "That difference is doing the same job a prefix-sum difference does. <code>H[r]</code> is the number for the whole prefix up to <code>r</code>. <code>H[l]</code> is the number for the prefix up to <code>l</code>, but its digits sit in higher places, so you multiply by <code>b^{r-l}</code> to shift them into the same places they occupy inside <code>H[r]</code>. Subtract, and the leading digits cancel, leaving only the digits of the slice. Two slices are equal if those leftover numbers agree. They can also agree by accident: with a random base the chance of one unlucky comparison is about <code>n / M</code>, <code>q</code> comparisons cost about <code>q / M</code>, and two independent moduli square that chance down to something you will not see in a contest.",
    "Anti-hash hygiene is part of the algorithm, not an optional extra. A fixed base 31 and modulus <code>10<sup>9</sup>+7</code> is famous enough that people generate strings whose polynomials collide on purpose. Draw <code>b</code> from a wide range at startup, or work in unsigned 64-bit overflow (the ring modulo <code>2<sup>64</sup></code>, which Java <code>long</code> arithmetic already is) and pair it with one prime if the contest is known to be hostile. Never map a letter to 0: a leading zero makes <code>a</code> and <code>aa</code> the same number, which is a collision you invented yourself.",
    "Walk the toy string <code>aba</code> with <code>a = 1</code>, <code>b = 2</code>, base 3, and no modulus so the arithmetic stays visible. <code>H[0] = 0</code>. After <code>a</code> you have <code>H[1] = 1</code>. After <code>ab</code> you have <code>H[2] = 1 &times; 3 + 2 = 5</code>. After <code>aba</code> you have <code>H[3] = 5 &times; 3 + 1 = 16</code>. The slice <code>[1, 3)</code> is <code>ba</code>, and the formula gives <code>16 - 1 &times; 3<sup>2</sup> = 7</code>, which is exactly <code>2 &times; 3 + 1</code>. The slice <code>[0, 2)</code> is <code>ab</code> and hashes to 5, so the two middle-overlapping slices are correctly reported different. A palindrome check is the same comparison against a hash built on the reversed string.",
  ],
  invariant: "<p>The prefix array stores the polynomial of every prefix, and a slice is a scaled difference:</p><span class=\"eq\">H[i] = &sum;<sub>j=0</sub><sup>i-1</sup> s[j] &middot; b<sup>i-1-j</sup> (mod M),&nbsp;&nbsp; hash[l, r) = H[r] &minus; H[l] &middot; b<sup>r-l</sup> (mod M)</span><p>In plain words, two slices are the same string exactly when those two polynomials are the same, and with a random base a collision is a rare modular accident rather than a logic bug. Interview sentence: <em>\"I prefix-hash like a prefix sum, multiply by <code>pow[len]</code> to line the powers up, and I never ship base 31 with one small prime on Codeforces.\"</em></p>",
  extra: [
    { kind: "warn", title: "Java % can be negative",
      html: "<p><code>(H[r] - H[l] * pow[r-l]) % M</code> is a correct integer in mathematics and a possibly-negative leftover in Java. A <code>HashSet</code> then treats <code>-3</code> and <code>M-3</code> as different keys, so two equal slices miss each other. Always fold the representative back into <code>[0, M)</code>.</p>" },
    { kind: "tip", title: "Map letters to 1..26, not 0..25",
      html: "<p>A leading zero digit makes <code>a</code> and <code>aa</code> the same polynomial when <code>a</code> maps to 0. Using the raw <code>char</code> code is also safe, because it is never 0. The bug is silent: the rest of the code looks right and only one family of slices collides.</p>" },
    { kind: "math", title: "Collision chance after q comparisons",
      html: "<p>Schwartz&ndash;Zippel on a degree-<code>n</code> polynomial against a random base says one comparison collides with probability about <code>n / M</code>. After <code>q</code> comparisons that is about <code>q n / M</code>. Two independent 64-bit moduli put the product near <code>q n / 2<sup>128</sup></code>, which is not a number you will hit in a contest lifetime.</p>" },
  ],
  array: [0, 1, 5, 16],
  arrayLabel: "H (base 3, a=1, b=2) =",
  indexLabels: ["\u03b5", "a", "ab", "aba"],
  vars: ["i", "H", "sub"],
  frames: [
    { note: "The toy string is aba with a mapped to 1, b mapped to 2, and base 3 so the arithmetic stays visible. The empty prefix hashes to H[0] = 0.",
      active: [0], values: { i: 0, H: 0, sub: "empty" } },
    { note: "After the first letter we store H[1] = 0 times 3 plus 1, which is 1, the hash of the single-character prefix a.",
      active: [1], values: { i: 1, H: 1, sub: "a" } },
    { note: "After the second letter we store H[2] = 1 times 3 plus 2, which is 5, the hash of the prefix ab.",
      active: [2], values: { i: 2, H: 5, sub: "ab" } },
    { note: "After the third letter we store H[3] = 5 times 3 plus 1, which is 16, the hash of the whole string aba.",
      active: [3], values: { i: 3, H: 16, sub: "aba" } },
    { note: "The slice [1, 3) is ba. The prefix difference is 16 minus 1 times 9, which equals 7, and that is exactly 2 times 3 plus 1.",
      active: [1, 3], values: { i: "q", H: 16, sub: "ba=7" } },
    { note: "Comparing [0, 2) against [1, 3) gives 5 versus 7, so ab and ba are correctly reported different. A palindrome check would compare a forward hash to a reverse hash.",
      active: [0, 2], values: { i: "cmp", H: "5 vs 7", sub: "not palindrome slice" } },
  ],
  dryIntro: "Prefix hashes of aba with a visible base-3 encoding, then one slice recovery and one equality test that correctly reports ab different from ba.",
  mermaid: `flowchart TD
  pref["prefix H and pow"] --> sub["hash l r = H r minus H l times pow r-l"]
  sub --> eq{"hashes equal?"}
  eq -- yes --> maybe["probably equal strings"]
  eq -- no --> noEq["definitely different"]
  maybe --> twoMod["second modulus / verify"]`,
  merTitle: "Prefix polynomial, then a difference",
  merCaption: "Same shape as prefix sums. The extra multiply by pow[len] aligns the powers.",
  steps: [
    "<strong>Pick a base and a modulus you would defend out loud.</strong> Draw an odd base larger than the alphabet, and choose one or two moduli from unsigned <code>2<sup>64</sup></code>, <code>2<sup>61</sup>-1</code>, or a pair of 10<sup>9</sup>-ish primes. Do this once at startup, not as a hardcoded 31.",
    "<strong>Build the two prefix arrays in one pass.</strong> Allocate <code>H</code> and <code>pow</code> of length <code>n+1</code>, set the zeros, and fold each character in with <code>H[i+1] = H[i]*b + s[i]</code>. This is the only <code>O(n)</code> work.",
    "<strong>Recover a half-open slice with a scaled difference.</strong> For <code>[l, r)</code> compute <code>h = H[r] - H[l]*pow[r-l]</code> and, if you are in a prime modulus, fold a negative leftover back into <code>[0, M)</code>. Mixing inclusive <code>r</code> with a <code>pow[r-l]</code> shift is the classic off-by-one.",
    "<strong>Compare two slices by those numbers.</strong> Equal hashes mean the slices are almost certainly equal; if the modulus is a small single prime, verify the characters on a hit. Different hashes mean the slices are definitely different.",
    "<strong>Slide a window when the problem is Rabin-Karp search.</strong> The next alignment is <code>window * b - s[i-len]*pow[len] + s[i]</code>, which drops the leaving character and appends the incoming one without rebuilding.",
    "<strong>Build a reverse hash when you need palindromes.</strong> Either prefix-hash the reversed string, or keep a second prefix that grows from the right. A slice is a palindrome when its forward hash equals the reverse hash of the same range.",
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
      "<p>The prefix arrays are one loop of <code>n</code> multiplies. Each substring query is then a constant amount of arithmetic: one multiply by a precomputed power, one subtract, and a possible correction into <code>[0, M)</code>. A binary search that asks \"do these two suffixes share a prefix of length mid?\" spends one hash comparison per probe, so one longest-common-prefix costs <code>O(log n)</code> hashes, about 17 queries at <code>n = 10<sup>5</sup></code>.</p>",
      "<p>Putting real numbers in: <code>n = q = 2 &times; 10<sup>5</sup></code> is a couple of hundred thousand multiplies to build and the same number of multiplies to answer, which is a few milliseconds. The character-loop alternative is <code>q &times; n</code> reads, about <code>4 &times; 10<sup>10</sup></code> in the same limits, which is the number that forces this page. Double hashing doubles the constants and still fits comfortably.</p>",
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
      bug: "Writing <code>(H[r] - H[l]*pow) % M</code> looks like the mathematical remainder and compiles cleanly. Java can return a negative leftover, and a <code>HashSet</code> then stores <code>-3</code> and <code>M-3</code> as two different keys, so equal slices miss each other.",
      fix: "After the remainder, if the value is negative add <code>M</code> once. Test it on a slice whose leading prefix hash is larger than the longer prefix hash, which is the usual way the subtraction goes negative." },
    { title: "Fixed base 31 and mod 1e9+7 on CF",
      bug: "The pair is in every blog post and it passes random tests, so it looks finished. Anti-hash generators know that pair and will hand you two different strings with the same polynomial, which is a wrong-answer, not a timeout.",
      fix: "Draw the base at random each run, use two moduli, or work in unsigned 64-bit overflow plus one prime. On a local stress test, hash a few million random strings into a set and look for unexpected collisions." },
    { title: "Mapping letters to 0",
      bug: "Mapping <code>'a'</code> to 0 looks like a tidy 0-based alphabet. A leading zero digit makes <code>a</code> and <code>aa</code> the same number, so those two slices collide even though the rest of the hash code is correct.",
      fix: "Map <code>'a'..'z'</code> to <code>1..26</code>, or use the raw <code>char</code> code, which is never zero. Check that <code>hash(0,1)</code> and <code>hash(0,2)</code> differ on a string of all <code>a</code>s." },
    { title: "pow overflow before mod",
      bug: "Writing <code>p[i] * B</code> in a <code>long</code> looks safe because you intend to reduce modulo a 10<sup>18</sup>-ish prime afterwards. The product already overflowed the 64-bit register, so the value you reduce is not the product you wanted.",
      fix: "Stay in unsigned <code>2<sup>64</sup></code> and accept the overflow as the modulus, or reduce with a mul-mod (or the <code>2<sup>61</sup>-1</code> trick) before the product leaves 64 bits." },
    { title: "Half-open vs inclusive mix",
      bug: "Documenting <code>hash(l, r)</code> as inclusive while multiplying by <code>pow[r-l]</code> looks consistent with the array length. The power is one short, every slice of length greater than 1 is wrong, and small palindrome checks still pass by luck.",
      fix: "Pick half-open <code>[l, r)</code> everywhere, including the dry-run table, and test a length-1 slice next to a length-2 slice so the off-by-one cannot hide." },
  ],
  variants: [
    ["Reverse hash", "Build on reversed s, or a second prefix from the right, for palindrome queries.", "fwd(l,r)==rev(n-1-r, n-1-l)", "LC 5 / queries"],
    ["2D Rabin-Karp", "Hash rows, then hash the column of row-hashes.", "O(nm) after O(nm)", "pattern in a grid"],
    ["Hash of a path", "Reroot / binomial of depth; or tree isomorphism hashes.", "AHU-style", "rooted-tree iso"],
  ],
  followups: [
    ["Why a random base?",
      "<p>For a fixed base an adversary can solve for strings whose polynomials collide, especially against a small well-known modulus. A base drawn at startup, after the tests were generated, makes the polynomial a random one the adversary did not know. The Schwartz&ndash;Zippel lemma then bounds the collision chance by the degree over the field size, which is the <code>n / M</code> figure in the derivation.</p>"],
    ["Is 2^64 overflow OK?",
      "<p>Java <code>long</code> arithmetic is already the ring modulo <code>2<sup>64</sup></code>, so you get a 64-bit hash with no remainder instruction. It is a ring, not a field, so it has zero divisors and a few known overflow attacks (Thue&ndash;Morse style). Those are rarer than <code>10<sup>9</sup>+7</code> collisions. Pair the overflow hash with one prime if the contest is known to be hostile; otherwise a random base in this ring is the usual Codeforces default.</p>"],
    ["LCP of two suffixes?",
      "<p>Binary search the length. The predicate \"the two suffixes share a prefix of length mid\" is one hash comparison, so one LCP is <code>O(log n)</code> after the prefix arrays exist. If you need the LCP of every adjacent pair of sorted suffixes, a suffix array plus Kasai is the cleaner linear fill; hashing wins when you only ask about a few pairs.</p>"],
    ["Hash vs KMP in an interview?",
      "<p>Mention both and then pick. If they want a worst-case linear scan of one pattern and no probability talk, write KMP. If they want many substring queries, a set of slices, or a binary search on string equality, write a rolling hash and say out loud what you will do on a collision (second modulus, or a character verify). Do not pretend a 32-bit <code>String.hashCode</code> is the same tool.</p>"],
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
  readTime: "32 min",
  tagline: "Manacher computes the longest palindromic radius at every centre in <code>O(n)</code> by mirroring inside a rightmost palindrome box &mdash; the palindrome cousin of the Z-function.",
  tags: ["Manacher", "palindrome", "P2"],
  prereqs: [
    ["Z-Function", "z-function.html"],
    ["Two Pointers", "../01-arrays-and-windows/two-pointers.html"],
  ],
  why: [
    "You are given a string and you want the longest slice that reads the same forwards and backwards, or you want every such slice counted. The honest method sits at each of the <code>2n-1</code> possible centres &mdash; one on every character and one in every gap &mdash; and walks outwards while the two sides match. That is correct, and a string of all the same letter makes every walk run the full length, which is about <code>n<sup>2</sup></code> comparisons. At <code>n = 10<sup>5</sup></code> that is ten billion steps, and the judge will not wait.",
    "Manacher's observation is that a palindrome is its own mirror, so radii you have already measured on the left of a big palindrome are radii you can copy on the right. Keep the rightmost palindrome found so far as a box <code>[L, R]</code> with centre <code>c</code>. For a new centre <code>i</code> that still sits inside that box, its mirror about <code>c</code> is the index <code>j = 2c - i</code>, and the palindrome already sitting at <code>j</code> is a picture of the palindrome sitting at <code>i</code>, at least until you hit the box edge. You copy that radius, clip it so it does not claim past <code>R</code>, and only then walk characters if the copy ran out of known ground.",
    "That is the Z-function skeleton with a palindrome in place of a prefix-copy. The usual implementation inserts a border and a <code>#</code> between every letter so odd and even palindromes of the original string become ordinary odd palindromes of one longer string <code>T</code>. The array <code>d[i]</code> is then the radius at centre <code>i</code> in <code>T</code>, and the original-string length is <code>d[i] - 1</code>. LC 5 is the interview prompt; contest follow-ups count palindromic slices or ask for the longest palindromic prefix.",
    "In a real statement the signal is <code>n &le; 10<sup>6</sup></code> together with \"longest palindromic substring\" or \"count palindromic substrings\". If the string is mutable, this static array is the wrong tool. If the question is about subsequences rather than contiguous slices, this page does not apply: that is an <code>O(n<sup>2</sup>)</code> DP. If you need every distinct palindrome as a node with its own suffix link, you want an eertree, not Manacher.",
  ],
  insight: "Inside the rightmost palindrome, smaller palindromes mirror: the radius at <code>i</code> starts as <code>min(d[2c-i], R-i)</code>, you clip so you do not invent characters past the box, and you only extend when that copy hits the edge. The right end <code>R</code> never moves left, so the extra comparisons stay linear &mdash; the same amortised argument as the Z-box.",
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
  constraint: "<code>n &le; 10<sup>6</sup></code> is the linear-palindrome window. The sentinel string has length <code>2n+3</code>, so the arrays are still linear. Radii are integers compared on a <code>char[]</code>; putting <code>substring</code> inside the extend loop both allocates and can go quadratic on older JDKs. If the statement updates the string between queries, rebuild or pick a different structure.",
  core: [
    "First build a string <code>T</code> that has a unique left border <code>^</code>, a unique right border <code>$</code>, and a <code>#</code> sitting in every gap, including the ends. The sample <code>aba</code> becomes <code>^#a#b#a#$</code>. Every palindrome of the original string, odd or even, is now an odd palindrome of <code>T</code>: even ones of <code>s</code> are centred on a <code>#</code>. You need an array <code>d</code> of length <code>|T|</code>, plus a centre <code>c</code> and a right end <code>R</code> for the rightmost palindrome found so far. The value <code>d[i]</code> is how far you can walk from <code>i</code> in <code>T</code> and still have a palindrome, counting the centre itself, so a lone centre starts at 1.",
    "The mirror step is the load-bearing idea, so sit with why it cannot lose a palindrome. Suppose the rightmost palindrome is <code>T[L..R]</code> with centre <code>c</code>, which means <code>T[c-k] = T[c+k]</code> for every <code>k</code> up to the radius. A new centre <code>i</code> with <code>c &lt; i &lt; R</code> has a mirror <code>j = 2c - i</code> on the left of <code>c</code>, the same distance away. Because the big palindrome equals its reverse, a walk of length <code>k</code> around <code>j</code> that stays inside <code>[L, R]</code> is the same walk, letter for letter, around <code>i</code>. So the palindrome already measured at <code>j</code> is a palindrome at <code>i</code> as well, at least until one of those walks would step past <code>R</code> (or past <code>L</code>, which is the same event by symmetry). That is why the copy is <code>d[i] = min(d[j], R-i)</code> and not a blind <code>d[j]</code>: claiming more than <code>R-i</code> would invent characters you have never compared at this alignment.",
    "You still have to extend after the copy, for the same reason Z extends after clipping. If <code>d[j]</code> is strictly smaller than the remaining box, the palindrome at <code>j</code> ended for a real mismatch, and by the mirror that same mismatch sits at <code>i</code>, so you must not grow. If <code>d[j]</code> reaches exactly to the box edge, the palindrome at <code>j</code> was clipped by the box rather than by a mismatch, and the next pair of characters around <code>i</code> is unknown: they might still match, and the <code>while</code> is what finds out. After extending, if <code>i + d[i]</code> now past <code>R</code>, this palindrome is the new rightmost box and you move <code>c</code> and <code>R</code>. The right end never decreases. Every successful extend comparison increases <code>R</code>, so those comparisons total at most <code>|T|</code>, and a failed extend happens at most once per centre. The whole fill is linear, just like Z.",
    "Walk <code>aba</code> on <code>T = ^#a#b#a#$</code>. The first letter-centre is the first <code>a</code>; you expand to <code>#a#</code> and store radius 2, and that small palindrome is the live box. The centre at <code>b</code> is outside that box, so you start from 1 and expand through the whole string: <code>#a#b#a#</code> is a palindrome of radius 4, and the box now covers everything. The second <code>a</code> sits inside that box; its mirror is the first <code>a</code>, whose radius is 2, and the remaining box is also 2, so you copy 2 and the extend cannot grow. The longest original slice has length <code>d-1 = 3</code> at centre <code>b</code>, which is <code>aba</code>. An even palindrome such as <code>aa</code> would have shown up as a large radius on the <code>#</code> sitting between the two letters.",
  ],
  invariant: "<p>The rightmost palindrome <code>T[L..R]</code> with centre <code>c</code> is a mirror, so every smaller palindrome inside it has a copy:</p><span class=\"eq\">for i in (c, R),&nbsp; d[i] &ge; min(d[2c-i], R-i), and d[i] equals that minimum unless the copy hits the box edge and the next pair still matches.</span><p>In plain words, you never invent characters past the known palindrome, you never throw away a palindrome the mirror already proved, and the only centres that cost more than a couple of array reads are the ones that push <code>R</code> right. Interview sentence: <em>\"I copy the mirrored radius, clip to the box, then extend; <code>R</code> only grows, so Manacher is linear.\"</em></p>",
  extra: [
    { kind: "warn", title: "Clip to the box or you invent a palindrome",
      html: "<p>Copying <code>d[2c-i]</code> without the <code>min(..., R-i)</code> looks right because the two centres are mirrors. The palindrome at the mirror may stick out past the left edge of the big box; the corresponding walk on the right would then step past <code>R</code>, where the big palindrome no longer promises anything. Those extra characters can disagree, and you have just stored a radius that is too big.</p>" },
    { kind: "tip", title: "The sentinels are bounds checks you do not write",
      html: "<p><code>^</code> and <code>$</code> are two characters that appear nowhere else, so the extend loop hits a guaranteed mismatch at each end instead of an <code>ArrayIndexOutOfBoundsException</code>. The <code>#</code> characters are what give even palindromes of <code>s</code> a centre of their own. Test the decode on <code>a</code>, <code>aa</code>, and <code>aba</code> before you trust <code>(centre - best) / 2</code>.</p>" },
    { kind: "math", title: "Why the mirror cannot skip a palindrome",
      html: "<p>Anything the expand-around-centre method would have found at <code>i</code> while staying inside <code>[L, R]</code> is, letter for letter, the expand it already found at the mirror <code>j</code>. Anything it would have found past <code>R</code> is exactly what the extend loop is about to try. There is no third kind of palindrome, so the copy-plus-clip-plus-extend sequence reports the same radius the quadratic method would have, just without redoing the inner work.</p>" },
  ],
  array: [0, 1, 2, 1, 4, 1, 2, 1, 0],
  arrayLabel: "d (radii on #a#b#a#) =",
  indexLabels: ["^", "#", "a", "#", "b", "#", "a", "#", "$"],
  vars: ["i", "box", "d"],
  frames: [
    { note: "The sentinel string is ^#a#b#a#$. Centres that sit on a hash mark are what will report even palindromes of the original string.",
      active: [0], values: { i: 0, box: "none", d: "init" } },
    { note: "The first letter-centre is the first a. Expanding reaches #a# and stores radius 2, and that small palindrome becomes the live box.",
      active: [2], values: { i: "a", box: "[1,3]", d: 2 } },
    { note: "The centre at b sits outside that box, so we expand from scratch and the whole string #a#b#a# is a palindrome of radius 4 around b.",
      active: [4], values: { i: "b", box: "[0,8]", d: 4 } },
    { note: "The second a sits inside the big box. Its mirror is the first a, and min of that radius and the remaining box is 2, which copies cleanly.",
      active: [6], values: { i: "a2", box: "[0,8]", d: 2 } },
    { note: "The longest original slice has length d minus 1 at centre b, which is 3, the string aba. That is the answer this walk was building.",
      active: [2, 4, 6], values: { i: "ans", box: "done", d: "len 3" } },
    { note: "An even palindrome such as aa would have shown up as a large radius on the hash mark sitting in the gap between those two letters.",
      active: [3, 5], values: { i: "even centres", box: "#", d: "gaps" } },
  ],
  dryIntro: "Radii on the sentinel string of aba, showing a fresh expand at the first a, a box-widening expand at b, and a mirrored copy at the second a.",
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
    "<strong>Build the sentinel string first.</strong> Write <code>^</code>, then <code>#</code> and each letter, then a closing <code>#$</code>. The two unique borders stop the extend loop at the ends, and the hashes give even palindromes of <code>s</code> a centre of their own.",
    "<strong>Allocate the radius array and an empty box.</strong> Let <code>d</code> have length <code>|T|</code>, and start with <code>c = 0</code> and <code>R = 0</code> so the first real centre has nothing to mirror yet.",
    "<strong>Copy the mirrored radius when i sits inside the box.</strong> The mirror is <code>2*c - i</code>. If <code>i &lt; R</code>, set <code>d[i] = min(d[mirror], R-i)</code>; otherwise start at 1. The clip is what stops you inventing characters past the known palindrome.",
    "<strong>Extend with fresh comparisons.</strong> While the two characters at <code>i - d[i]</code> and <code>i + d[i]</code> agree, increment. This is the only place new characters are read, and it is what grows a palindrome that the mirror only proved up to the box edge.",
    "<strong>Move the box only when this centre wins the right end.</strong> If <code>i + d[i] &gt; R</code>, set <code>c = i</code> and <code>R = i + d[i]</code>. Charging every successful extend to a rightward move of <code>R</code> is the linear-time argument.",
    "<strong>Decode back into the original string.</strong> With this construction the palindrome length in <code>s</code> is <code>d[i] - 1</code>, and the start index is <code>(i - d[i]) / 2</code>. Confirm the arithmetic on <code>a</code>, <code>aa</code>, and <code>aba</code> before you ship it.",
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
      "<p>There are <code>|T| = 2n+3</code> centres and the mirror copy is a constant amount of arithmetic at each one. The only loop that can run more than once per centre is the extend. Every successful extend comparison increases <code>R</code> by at least one, and <code>R</code> never decreases, so successful extends total at most <code>|T|</code>. A failed extend comparison happens at most once per centre after the copied radius is installed, which is another <code>|T|</code> comparisons.</p>",
      "<p>Putting real numbers in: at <code>n = 10<sup>6</sup></code> the sentinel string has about two million centres and you do a few million character reads, which is a few milliseconds. Expand-around-centre on a string of all <code>a</code>s is about <code>n<sup>2</sup></code> comparisons, <code>10<sup>12</sup></code> at that size, and that is the runtime the mirror is designed to avoid. Hashing plus binary search finds only the single longest palindrome in <code>O(n log n)</code> and does not fill every radius.</p>",
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
      bug: "Leaving the ends of <code>T</code> as ordinary characters looks fine on a sample whose longest palindrome sits in the middle. The first time a palindrome reaches an end, the extend loop reads past the array and throws, or it wraps into a coincidental match.",
      fix: "Put two unique borders on <code>T</code>, or write explicit bounds checks in the <code>while</code>. Test a single-character string and a string that is itself a palindrome." },
    { title: "d counting vs expand-by-1",
      bug: "Mixing \"<code>d</code> is the length in <code>T</code>\" with \"<code>d</code> is the number of extra steps past the centre\" looks like a documentation issue. The start-index formula then shifts by one and you return a neighbour of the real answer, which still looks palindromic on short samples.",
      fix: "Pick one convention and keep it. The listing uses <code>d = 1</code> meaning just the centre, then extends while the next pair matches. Check the decode on <code>a</code>, <code>aa</code>, and <code>aba</code> together." },
    { title: "Using substring inside the extend loop",
      bug: "Comparing <code>T.substring(...)</code> in the inner loop looks like the cleanest way to say \"these two sides match\". On older JDKs each call copies, and even on new ones you have turned a linear scan into a quadratic allocation storm.",
      fix: "Work on a <code>char[]</code> and compare two indices. The inner loop must be two array reads and an increment, nothing else." },
    { title: "Even palindromes without '#'",
      bug: "Expanding only around letters looks complete because those are the centres you can see. Every even palindrome of <code>s</code>, including <code>abba</code> and <code>aa</code>, is then invisible, and LC 5 returns a shorter odd piece.",
      fix: "Build the sentinel string, or keep two radius arrays <code>dOdd</code> and <code>dEven</code> with the same box idea run twice. Test <code>cbbd</code>, whose answer is the even slice <code>bb</code>." },
    { title: "Decoding start index wrong",
      bug: "The formula <code>(centre - best) / 2</code> versus <code>(centre - best + 1) / 2</code> depends on whether <code>T</code> starts with a hash, and both versions look plausible. One of them passes <code>aba</code> and fails <code>aa</code>.",
      fix: "Derive the start once from <code>T = ^#s0#s1#...#$</code> and lock it with tests on <code>a</code>, <code>aa</code>, and <code>aba</code>. Do not mix constructions from two blog posts." },
  ],
  variants: [
    ["Two arrays, no sentinels", "d1[i] odd radius, d2[i] even radius. Same box idea twice.", "CP-algorithms manacher", "slightly faster constants"],
    ["Longest palindromic prefix", "The palindrome that touches index 0; or KMP on s + rev(s).", "d[i] with i-d+1==0", "CF 1326D"],
    ["Count / sum of palindromes", "Sum of (d[i]/2) on the sentinel string.", "LC 647", "this page's template"],
  ],
  followups: [
    ["Why is this linear like Z?",
      "<p>The right end <code>R</code> is a potential. A mirror copy is a constant amount of work. Every successful extend comparison increases <code>R</code>, and <code>R</code> never decreases, so those comparisons total at most <code>|T|</code>. A failed extend happens at most once per centre. That is the same charging argument as the Z-box, with a palindrome in place of a prefix-copy. One centre might expand a long way, but it spends credit that is never spent again.</p>"],
    ["Can you support updates?",
      "<p>Not with a static <code>d[]</code>. Rebuilding after each change is <code>O(n)</code> and is fine if updates are rare. Online insertion of a character at the end is what an eertree (palindromic tree) is for. If the question is only \"is this range a palindrome?\" after point updates, a Fenwick or segment tree of polynomial hash coefficients can answer it, which is a heavier structure and a different page.</p>"],
    ["Longest palindromic subsequence vs substring?",
      "<p>A subsequence does not have to be contiguous, so the mirror box does not apply. The usual answer is an <code>O(n<sup>2</sup>)</code> DP, or LCS of the string with its reverse. Manacher reports contiguous slices only. In an interview, ask which word they said before you reach for this page.</p>"],
    ["How do you list all palindromic substrings without O(n^2) memory?",
      "<p>The <code>O(n)</code> radii already represent every palindromic slice: a centre with radius <code>d</code> in <code>T</code> contributes <code>d/2</code> palindromes of the original string. Iterate centres and emit the ranges on demand. Materialising every slice as a <code>String</code> is what blows the memory, not the algorithm that found them.</p>"],
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
  readTime: "32 min",
  tagline: "A suffix array is the permutation of starting indices in lexicographic order; Kasai then fills the LCP array in <code>O(n)</code> and string problems become range-min on LCP.",
  tags: ["suffix array", "LCP", "P2"],
  prereqs: [
    ["Sorting & Comparators", "../02-sorting-hashing-bits/sorting-and-comparators.html"],
    ["Sparse Table & RMQ", "../06-range-queries/sparse-table-and-rmq.html"],
  ],
  why: [
    "You are given a string and a question about its slices: how many distinct ones are there, what is the longest slice that appears twice, what is the longest slice two strings share, or what is the <code>k</code>-th slice in dictionary order. Every slice of a string is a prefix of one of its suffixes, so if you sort the suffixes you have sorted every slice. The obvious sort compares those suffixes with <code>compareTo</code>, which can read <code>O(n)</code> characters per comparison and costs something like <code>n<sup>2</sup> log n</code> in the worst case. At <code>n = 10<sup>5</sup></code> that is not a contest-legal runtime.",
    "A <em>suffix array</em> is just the permutation of starting indices in that sorted order. Once you have it, the useful second array is the <em>LCP array</em>: <code>lcp[i]</code> is how many leading characters suffix <code>sa[i-1]</code> and suffix <code>sa[i]</code> share. The longest common prefix of any two suffixes is then the minimum LCP on the interval of ranks between them, which a sparse table answers in constant time. Distinct-substring count, longest repeated slice, and the <code>k</code>-th slice all fall out of that picture without ever listing the slices.",
    "Building the permutation in <code>O(n log n)</code> uses doubling: at step <code>k</code> you already know the order of every block of length <code>2<sup>k</sup></code>, and you sort pairs of those blocks to get length <code>2<sup>k+1</sup></code>. Filling the LCP array looks like it should be another <code>O(n<sup>2</sup>)</code> of character walking, but Kasai's observation kills that: if suffix <code>i</code> shares <code>h</code> characters with its sorted predecessor, then suffix <code>i+1</code> shares at least <code>h-1</code> with <em>its</em> predecessor. You walk the suffixes in text order, not sorted order, and you carry that leftover height down.",
    "In a Java contest this pair plus a sparse table on LCP is the structure you actually submit. Suffix trees and suffix automata are more powerful and more code. If the question is one pattern in one text, do not build this: write KMP. If characters are appended online, a suffix automaton is the better fit. The usual limit is <code>n &le; 4 &times; 10<sup>5</sup></code> for the doubling-plus-Java-sort build on this page.",
  ],
  insight: "Sort the suffixes once; the LCP of any two of them is the range-minimum of the adjacent-LCP array between their ranks. Kasai fills that adjacent array in linear time by walking the suffixes in text order and reusing <code>h-1</code> characters of height, which is the observation that stops the fill from going quadratic.",
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
  constraint: "<code>n &le; 4 &times; 10<sup>5</sup></code> is the usual Java window for the doubling build on this page. Each of the <code>log n</code> rounds calls <code>Arrays.sort</code> on <code>n</code> pairs, which is <code>O(n log<sup>2</sup> n)</code> and is tight near the top of that range. A radix sort on the pairs drops the extra log and is what you write if the same limit is <code>10<sup>6</sup></code>. Map a large alphabet down to <code>1..n</code> before you start.",
  core: [
    "You need a permutation <code>sa</code> and a rank array <code>r</code>. Initially <code>sa[i] = i</code> and <code>r[i]</code> is the first character of suffix <code>i</code>. At round <code>k</code> (with <code>k</code> a power of two) two suffixes are compared by the pair <code>(r[i], r[i+k])</code>, using <code>-1</code> when the second half runs off the end so a shorter leftover loses. After you sort <code>sa</code> by those pairs you reassign ranks: equal pairs keep the same new rank, a different pair gets the next integer. Swap the rank buffers and stop early once every rank is unique. After <code>log n</code> rounds you have compared prefixes of length <code>n</code>, which is a full suffix comparison.",
    "Kasai then fills <code>lcp</code> without sorting anything else. Build the inverse <code>inv[sa[i]] = i</code> so you can ask \"where in the sorted order does suffix <code>i</code> sit?\". Walk the starting indices in text order, not sorted order, and keep an integer <code>h</code> for the leftover height. For suffix <code>i</code>, look at the suffix that sits immediately before it in <code>sa</code>, and extend <code>h</code> while the two still match. Write that value into <code>lcp[inv[i]]</code>, then if <code>h</code> is positive decrement it before you move to suffix <code>i+1</code>. That decrement is the lemma: deleting the first character of a match of length <code>h</code> leaves a match of length <code>h-1</code> as a lower bound on the next pair.",
    "Why the decrement cannot go wrong is the same kind of \"we never lose a match\" argument as KMP's fallback. Suffix <code>i</code> and its sorted predecessor share <code>h</code> characters, so the suffixes <code>i+1</code> and \"predecessor plus one\" share the last <code>h-1</code> of those. The actual sorted predecessor of suffix <code>i+1</code> is some suffix that is at least as large as \"predecessor plus one\", and therefore its LCP with <code>i+1</code> is at least that leftover <code>h-1</code> (it can be longer, which is what the extend loop finds). You never restart from zero except when <code>h</code> was already zero or when suffix <code>i</code> is the smallest in the array. Because <code>h</code> grows by at most one per successful comparison and drops by at most one per index, the whole fill is linear.",
    "Walk <code>banana</code>. The six suffixes, already sorted, start at indices 5 (<code>a</code>), 3 (<code>ana</code>), 1 (<code>anana</code>), 0 (<code>banana</code>), 4 (<code>na</code>), 2 (<code>nana</code>), so <code>sa = [5, 3, 1, 0, 4, 2]</code>. Adjacent LCPs are 1, 3, 0, 0, 2. The longest repeated slice is the maximum of those, which is 3, the string <code>ana</code> starting at 1 and at 3. The number of distinct slices is the number of prefixes of suffixes, <code>n(n+1)/2 = 21</code>, minus the ones the LCPs counted twice, which is <code>21 - 6 = 15</code>. Any later \"LCP of suffix 3 and suffix 1\" is the range-minimum of the adjacent values strictly between their ranks, here just 3.",
  ],
  invariant: "<p>The suffix array is the lex order of starting indices, and adjacent LCPs generate every pairwise LCP:</p><span class=\"eq\">sa[i] = start of the i-th smallest suffix,&nbsp; lcp[i] = LCP(sa[i-1], sa[i]),&nbsp; LCP(sa[i], sa[j]) = min(lcp[i+1..j]) for i &lt; j</span><p>In plain words, two suffixes share everything their neighbours on the path between them share, and the shortest of those neighbour-shares is the answer. Interview sentence: <em>\"I sort suffixes by doubling, Kasai walks text order with <code>h = max(h-1, 0)</code>, and any LCP is an RMQ on that array.\"</em></p>",
  extra: [
    { kind: "warn", title: "Forgetting k-- turns Kasai quadratic",
      html: "<p>Restarting the character walk from 0 at every suffix still produces the right LCP array, so the bug hides behind a correct sample. You have thrown away the lemma and the fill is <code>O(n<sup>2</sup>)</code> on a string of all <code>a</code>s. The line after you write <code>lcp[inv[i]]</code> has to be <code>if (h &gt; 0) h--;</code>.</p>" },
    { kind: "tip", title: "Out-of-range rank is -1, not 0",
      html: "<p>A suffix that has no second half must lose to every suffix that still has characters there. Treating the missing half as rank 0 ties it with a real character that mapped to 0, and the ranks never become unique. The listing uses <code>-1</code>, strictly smaller than any character rank.</p>" },
  ],
  array: [5, 3, 1, 0, 4, 2],
  arrayLabel: "sa of banana =",
  indexLabels: ["a", "ana", "anana", "banana", "na", "nana"],
  vars: ["step", "sa", "lcp"],
  frames: [
    { note: "The string is banana. Its six suffixes start at 0 banana, 1 anana, 2 nana, 3 ana, 4 na, and 5 a, which is the list we are about to sort.",
      active: [0, 1, 2, 3, 4, 5], values: { step: "list", sa: "0..5", lcp: "\u2014" } },
    { note: "Dictionary order of those suffixes is a, ana, anana, banana, na, nana, so the suffix array of starting indices is [5, 3, 1, 0, 4, 2].",
      active: [5], values: { step: "sort", sa: "[5,3,1,0,4,2]", lcp: "\u2014" } },
    { note: "Kasai on the left half: a shares 1 with ana, ana shares 3 with anana, and anana shares nothing with banana.",
      active: [0, 1, 2], values: { step: "lcp left", sa: "[5,3,1]", lcp: "[1,3,0]" } },
    { note: "Kasai on the right half: banana shares nothing with na, and na shares 2 with nana. Slot lcp[0] stays unused at 0.",
      active: [3, 4, 5], values: { step: "lcp right", sa: "[0,4,2]", lcp: "[0,2]" } },
    { note: "The longest repeated slice is the maximum adjacent LCP, which is 3, the string ana starting at indices 1 and 3.",
      active: [1, 3], values: { step: "repeat", sa: "1 and 3", lcp: 3 } },
    { note: "Distinct slices equal 21 minus the sum of those LCPs, which is 21 minus 6, so banana has 15 different substrings.",
      active: [0, 1, 2, 3, 4, 5], values: { step: "distinct", sa: "all", lcp: "sum 6" } },
  ],
  dryIntro: "The six suffixes of banana in listed order, then in dictionary order, then the adjacent LCPs Kasai writes, then the two standard applications of that array.",
  mermaid: `flowchart TD
  dbl["doubling ranks by 2^k"] --> saN["sa permutation"]
  saN --> kas["Kasai: walk i = 0..n-1, k = max k-1, 0"]
  kas --> lcpN["lcp adjacent"]
  lcpN --> rmq["sparse table on lcp"]
  rmq --> any["LCP of any two suffixes"]`,
  merTitle: "SA, then Kasai, then RMQ",
  merCaption: "Adjacent LCPs plus a range-min structure give every pairwise LCP.",
  steps: [
    "<strong>Map characters to small ranks.</strong> Replace the alphabet with integers <code>1..sigma</code> and treat a missing second half as <code>-1</code>, never as 0. This is what keeps two suffixes that run off the end from tying forever.",
    "<strong>Double the compared length each round.</strong> For <code>k = 1, 2, 4, ...</code> sort the current permutation by the pair <code>(rank[i], rank[i+k])</code> and write a new rank array in that order. Equal pairs keep the same rank; a different pair gets the next integer.",
    "<strong>Stop once every rank is unique.</strong> When <code>r[sa[n-1]] == n-1</code> the permutation is a full suffix order and further rounds do no work. At worst you need <code>log n</code> rounds.",
    "<strong>Fill LCP with Kasai in text order.</strong> Build <code>inv[sa[i]] = i</code>, start <code>h = 0</code>, and for each starting index <code>i</code> extend against the sorted predecessor, write <code>lcp[inv[i]]</code>, then decrement <code>h</code> if it is positive. That decrement is the linear-time lemma.",
    "<strong>Put a sparse table on the LCP array.</strong> Any later \"how much do suffix <code>x</code> and suffix <code>y</code> share?\" is a range-minimum strictly between their ranks, which is constant time after an <code>O(n log n)</code> table.",
    "<strong>Answer the actual string question from those two arrays.</strong> Distinct slices are <code>n(n+1)/2 - sum lcp</code>, the longest repeat is <code>max lcp</code>, two-string LCS is the max LCP across a separator, and a pattern search is a binary search on <code>sa</code>.",
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
      "<p>Doubling runs at most <code>log n</code> rounds. Each round sorts <code>n</code> pairs; Java Timsort is <code>O(n log n)</code> per round, so the build is <code>O(n log<sup>2</sup> n)</code>. Replacing that sort with a two-pass radix sort on ranks drops the extra log and is the usual next step when the same code TLEs. Kasai is a different argument: the height <code>h</code> grows by at most one per successful character comparison and drops by at most one per starting index, so the extend loop runs at most <code>2n</code> times and the fill is strictly linear.</p>",
      "<p>Putting real numbers in: at <code>n = 10<sup>5</sup></code> you have about 17 sort rounds of a hundred thousand pairs, which is a few tens of millions of comparisons and fits in Java. At <code>n = 4 &times; 10<sup>5</sup></code> the extra log starts to pinch and a radix sort, or SA-IS, is the safer submit. The naive <code>substring</code> sort is <code>O(n<sup>2</sup> log n)</code>, about <code>10<sup>11</sup></code> character reads at the smaller size, which is the runtime this page exists to avoid.</p>",
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
      bug: "Restarting the character walk from zero at every suffix still writes the correct LCP array, so the sample looks finished. You have thrown away the leftover-height lemma, and a string of all <code>a</code>s makes the fill quadratic.",
      fix: "After you write <code>lcp[inv[i]]</code>, do <code>if (h &gt; 0) h--;</code>. Time the fill on a string of a hundred thousand <code>a</code>s; without the decrement it will miss the limit." },
    { title: "No sentinel / ties",
      bug: "Two suffixes that share characters all the way to the end of the string compare equal if the missing half is treated as a real rank. Their ranks never split, doubling never finishes, and the permutation is not a total order.",
      fix: "Treat an out-of-range second half as <code>-1</code>, strictly smaller than any character. That is the sentinel this build uses instead of appending a 0 to the string." },
    { title: "lcp[0] meaning",
      bug: "Leaving <code>lcp[0] = 0</code> unused looks harmless, and summing then subtracts an extra zero. A range-minimum between ranks 0 and 1 that accidentally reads <code>lcp[0]</code> as a real adjacent LCP reports 0 when the true share is <code>lcp[1]</code>.",
      fix: "The convention on this page is <code>lcp[i] = LCP(sa[i-1], sa[i])</code> for <code>i &ge; 1</code>. A pairwise query between ranks <code>i &lt; j</code> reads the minimum on <code>lcp[i+1..j]</code> and never <code>lcp[i]</code>." },
    { title: "Building SA of s+t without a separator",
      bug: "Concatenating two strings and sorting the suffixes looks like the standard longest-common-substring trick. A suffix can cross the join, so an LCP can mix the tail of the first string with the head of the second and report a slice that lives in neither input.",
      fix: "Put a character smaller than both alphabets between them, the same idea as KMP's sentinel. Only accept an LCP whose two suffixes sit on opposite sides of that character." },
    { title: "Integer overflow on n(n+1)/2",
      bug: "The distinct-substring formula is sitting there as a textbook identity, and <code>n * (n+1) / 2</code> in an <code>int</code> looks like the whole answer. At <code>n = 10<sup>5</sup></code> that product is five billion and the 32-bit cell wraps.",
      fix: "Do the arithmetic in a <code>long</code>. The template tab already does; copy that, not a whiteboard <code>int</code>." },
  ],
  variants: [
    ["Search a pattern", "Binary search sa; compare s[sa[mid]..] to p in O(|p|).", "O(|p| log n)", "or KMP"],
    ["LCS of two strings", "SA of s+'#'+t; max lcp[i] where sa[i-1] and sa[i] lie in different halves.", "CF classic", "also hashing"],
    ["k-th substring", "Walk sa in order; each suffix sa[i] contributes n-sa[i]-lcp[i] new prefixes.", "skip k", "CF 128B"],
  ],
  followups: [
    ["Prove Kasai's k--.",
      "<p>Suppose suffix <code>i</code> shares <code>h</code> characters with the suffix that sits immediately before it in the suffix array. Delete the first character of both: the leftovers are suffix <code>i+1</code> and \"that predecessor, plus one\", and they share <code>h-1</code> characters. The true sorted predecessor of suffix <code>i+1</code> is some suffix that is at least as large as \"predecessor plus one\", so its LCP with <code>i+1</code> is at least <code>h-1</code>. You start the next extend from that leftover rather than from zero, and you only ever add more matching characters, never fewer. That is why decrementing cannot under-report and why restarting from zero is only wasted work.</p>"],
    ["SA vs suffix automaton for distinct substrings?",
      "<p>Both can answer in linear time after a linear (or <code>n log n</code>) build. The suffix array needs Kasai and the formula <code>n(n+1)/2 - sum lcp</code>. A suffix automaton is a DAG whose states already are the distinct slices, and the answer is a sum of their lengths. The automaton is nicer if characters arrive online. The suffix array is nicer if you also want LCP queries, a <code>k</code>-th slice, or a range-minimum structure on those heights.</p>"],
    ["How do you get LCP of two arbitrary suffixes?",
      "<p>Look up their ranks in the inverse array, then take the range-minimum of <code>lcp</code> strictly between those two ranks. A sparse table makes that one combine of two power-of-two blocks, which is constant time, because minimum is idempotent. Do not include <code>lcp</code> at the left rank itself; that slot is the share with the previous neighbour, not with the other suffix you asked about.</p>"],
    ["Why not always SA-IS?",
      "<p>SA-IS is linear and long, and a mistyped induced sort is a silent wrong permutation. Doubling is about forty lines, it matches the listing on this page, and it passes <code>n = 10<sup>5</sup></code> in Java without drama. Learn SA-IS when the extra log factor actually bites, or when you are implementing a library rather than a contest solution.</p>"],
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
  readTime: "32 min",
  tagline: "A trie of all patterns plus KMP-style failure links: feed the text once and report every pattern occurrence, overlapping included, in linear time.",
  tags: ["Aho-Corasick", "automaton", "trie", "P2"],
  prereqs: [
    ["KMP & the Prefix Function", "kmp-and-prefix-function.html"],
    ["Trie", "../05-trees/trie.html"],
  ],
  why: [
    "You are given a dictionary of patterns and one long text, and you must report every place any of those patterns sits inside the text, overlaps included. Running KMP once per pattern is correct, and it costs about <code>|t|</code> times the number of patterns plus the total length of the dictionary. At a million-character text and a thousand patterns that is a billion steps, which some judges will still accept and some will not; at a million patterns it is not a contest-legal runtime. The naive nested loop that calls <code>startsWith</code> at every text index is worse still.",
    "Aho-Corasick builds one automaton that knows the whole dictionary. The states are the nodes of a trie of every pattern. The extra ingredient is a <em>failure link</em> (also called a suffix link) on each node: from the string that node represents, jump to the longest proper suffix of that string that is still a prefix of some pattern in the dictionary. That is exactly KMP's <code>&pi;[q-1]</code>, just living on a tree of patterns instead of on one string. Feeding a text character is then: follow the trie edge if it exists, otherwise follow failure links until an edge exists, and never rewind the text pointer.",
    "Those failure links are filled by a breadth-first walk from the root, parent before child, which is the same \"shorter borders first\" order that lets KMP read <code>&pi;[q-1]</code> safely. Nested patterns such as <code>ab</code> sitting inside <code>xab</code> are easy to miss if you only look at the node you landed on; an <em>output link</em> (or an aggregated <code>out[u] += out[fail[u]]</code>) walks the failure chain and reports every dictionary word that ends here. The same automaton is the state space for \"build a string that avoids these forbidden words\".",
    "In a real statement the signal is many patterns against one text, or a DP whose state is \"where am I in the dictionary after reading <code>i</code> characters\", with <code>|t| + sum |p|</code> around <code>10<sup>6</sup></code>. One pattern is still KMP. A huge text and later \"is this word in there?\" questions is a suffix array or a suffix automaton of the text, not this page.",
  ],
  insight: "The failure link of a trie node is the KMP border of the string that node represents, taken inside the dictionary rather than inside one pattern: the longest proper suffix that is still a prefix of some word. Feeding a character follows an edge or walks those links, and because every surviving alignment is a suffix of a suffix you never skip a hit and never rewind the text.",
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
  constraint: "<code>sum |p| + |t| &le; 10<sup>6</sup></code> is the linear-automaton window. Alphabet 26 is a child array of 26 per node; a larger alphabet wants a map and a slower fail walk. If many patterns nest, compressing the failure chain into <code>out[u]</code> or an output link is mandatory: climbing <code>fail</code> raw at every text character can multiply the scan by the number of nested words.",
  core: [
    "You need a trie of every pattern, an array <code>fail</code> of one integer per node, and a number <code>out[u]</code> (or a list of pattern ids) on terminals. Insert each word from the root, creating a child for each new character, and mark the node where the word ends. The root represents the empty string and is state 0. After the trie exists, a breadth-first queue fills the links. Push every direct child of the root first, with <code>fail = 0</code>: a single-character word has no proper suffix that is still a prefix, so it falls back to the empty string. Then, while the queue is not empty, pop a node <code>u</code> and look at each letter <code>c</code>. If <code>u</code> has a child <code>v</code> on <code>c</code>, the failure of <code>v</code> is wherever <code>fail[u]</code> itself goes on <code>c</code>, because that is the longest suffix of <code>u</code>'s string that can still accept <code>c</code>. If <code>u</code> has no child on <code>c</code>, you may fill <code>nxt[u][c] = nxt[fail[u]][c]</code> so the later scan is a single array read.",
    "Why that failure cannot lose a match is the same nested-border argument as <code>q = &pi;[q-1]</code>, just on a tree. After reading some prefix of the text you sit at the node <code>u</code> whose string is the longest suffix of that prefix that is a prefix of some pattern. The next text character is <code>c</code>. If <code>u</code> has an edge on <code>c</code>, you take it and you have grown that dictionary prefix by one. If it does not, every alignment that can still use some of the text you already matched must start later, which means it is a proper suffix of <code>u</code>'s string. The longest such suffix that is still a dictionary prefix is exactly <code>fail[u]</code>, so you retry <code>c</code> from there. If that also fails you walk to <code>fail[fail[u]]</code>, and so on down to the root. Every possible surviving alignment is a suffix of a suffix that the trie still knows about, so the chain visits them all and invents none. You never move the text pointer backwards.",
    "BFS order is what makes the definition computable. The string at <code>fail[u]</code> is always strictly shorter than the string at <code>u</code>, so it is a node of smaller depth. A queue that pushes children after their parent has already been processed therefore finds <code>fail[u]</code> already filled, and <code>nxt[fail[u]][c]</code> already filled if you are precomputing missing edges. A depth-first walk can ask for a failure that has not been written yet and then store a wrong link that silently drops hits. Root children are the base: they fail to the root, which is how the empty string plays the role of <code>&pi;[0] = 0</code>.",
    "Nested words need one more line. Landing on the node for <code>aba</code> should also report <code>ba</code> and <code>a</code> if those are in the dictionary, because they are suffixes of what you just read. During the same BFS, add <code>out[v] += out[fail[v]]</code> (or set <code>output[v]</code> to <code>v</code> if <code>v</code> is terminal and to <code>output[fail[v]]</code> otherwise). Then a scan that does <code>state = nxt[state][c]; ans += out[state]</code> counts every word that ends at this text index, including the ones that only live on the failure chain. Walk the dictionary <code>ab</code>, <code>ba</code>, <code>aba</code> against the text <code>abaca</code>. After <code>a</code> you sit at the first-letter node; after <code>ab</code> you sit at the <code>ab</code> terminal and report one hit; after the next <code>a</code> you sit at <code>aba</code> and the aggregated <code>out</code> reports that word (and would report <code>ba</code> if the failure chain carried it). The letter <code>c</code> has no edge, so you fail to the root; the final <code>a</code> returns to the first-letter node. The text produced two hits, which is the sample.",
  ],
  invariant: "<p>After any prefix of the text, the current state is the longest suffix of that prefix that is still a trie prefix, and the failure chain lists every shorter leftover:</p><span class=\"eq\">fail[u] = longest proper suffix of the string at u that is a prefix of some pattern,&nbsp; and out[u] counts every dictionary word that is a suffix of that string.</span><p>In plain words, you never rewind the text, you never skip a dictionary word that ends here, and a missing letter is the same fallback KMP would take on a one-pattern trie. Interview sentence: <em>\"Failure is KMP's <code>&pi;[q-1]</code> on the dictionary trie; BFS fills it parent-first; <code>out[v] += out[fail[v]]</code> is what reports nested hits.\"</em></p>",
  extra: [
    { kind: "warn", title: "Forgetting out[v] += out[fail[v]] drops nested words",
      html: "<p>Looking only at the node you landed on looks correct, because that node is the longest dictionary prefix you currently hold. A shorter pattern that is a suffix of that prefix lives on the failure chain, not on this node. The word <code>ab</code> inside <code>xab</code> is the classic miss. Aggregate during BFS, or walk an output-link chain at query time.</p>" },
    { kind: "tip", title: "Fill missing edges or keep the while, not both halfway",
      html: "<p>Pre-filling <code>nxt[u][c] = nxt[fail[u]][c]</code> makes the scan one array read per character and is the listing on this page. The other school is a <code>go(u, c)</code> that walks <code>fail</code> until an edge exists, which is the same idea as KMP's inner <code>while</code> and is also linear by the same potential. Mixing a half-filled table with a <code>while</code> that assumes missing means 0 is how you loop at the root.</p>" },
    { kind: "math", title: "Why the scan is linear even with a while-fail",
      html: "<p>If you do not pre-fill edges, each text character may walk several failure links. Those walks drop to a strictly shorter string each time, and a later successful edge grows the current depth by one. Across the whole text the drops cannot outnumber the grows, so the extra hops total at most <code>|t|</code> plus the dictionary depth. That is KMP's potential on <code>q</code>, lifted to a trie.</p>" },
  ],
  array: [0, 1, 2, 0, 3],
  arrayLabel: "state after feeding a,b,a,c,a =",
  indexLabels: ["a", "b", "a", "c", "a"],
  vars: ["ch", "state", "hit"],
  frames: [
    { note: "The dictionary is ab, ba, and aba. The trie grows 0 -a-> 1 -b-> 2 for ab, then 2 -a-> 4 for aba, and a separate 0 -b-> 3 for ba.",
      active: [0], values: { ch: "build", state: 0, hit: "none" } },
    { note: "BFS writes the failure links: the node a falls to the root, ab falls to b, ba falls to the root, and aba falls back to a.",
      active: [0], values: { ch: "fail", state: "links", hit: "\u2014" } },
    { note: "Feeding a moves to state 1. Feeding b takes the trie edge to state 2, which is the terminal for ab, and that is the first hit.",
      active: [0, 1], values: { ch: "ab", state: 2, hit: "ab" } },
    { note: "Feeding the next a moves to state 4, the terminal for aba. The failure chain from here is what would also report a nested ba.",
      active: [2], values: { ch: "aba", state: 4, hit: "aba" } },
    { note: "The letter c has no edge from aba, so the scan follows failure to a and then to the root, and the current state becomes 0.",
      active: [3], values: { ch: "c", state: 0, hit: "none" } },
    { note: "The final a returns to state 1. The text abaca produced hits at ab and at aba, which is two occurrences in total.",
      active: [4], values: { ch: "a", state: 1, hit: "done" } },
  ],
  dryIntro: "Building the trie of ab, ba, and aba, filling failure links parent-first, then feeding the text abaca one character at a time and watching hits appear.",
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
    "<strong>Insert every pattern into one trie.</strong> Start from the root for each word, create a child when the letter is new, and mark the terminal with a count or a pattern id. The trie nodes are the states of the automaton you are about to finish.",
    "<strong>BFS from the root to fill failure links.</strong> Push every child of the root with <code>fail = 0</code>. For each later child <code>v</code> reached by letter <code>c</code> from parent <code>u</code>, set <code>fail[v] = nxt[fail[u]][c]</code>. Parent-first order is what makes that read defined.",
    "<strong>Fill missing transitions, or keep an explicit while.</strong> On a missing letter, store <code>nxt[u][c] = nxt[fail[u]][c]</code> so the later scan is one array read. The other school is a <code>go</code> that walks <code>fail</code> until an edge exists, which is KMP's inner loop on the trie.",
    "<strong>Aggregate nested hits along the failure chain.</strong> During the same BFS write <code>out[v] += out[fail[v]]</code>, or set an output link to the next terminal on that chain. Without this step a nested pattern that is only a suffix of the current node is silently dropped.",
    "<strong>Scan the text with one transition per character.</strong> Start at the root and do <code>state = nxt[state][c]</code> for each letter, then add <code>out[state]</code> (or walk output links) to record every dictionary word that ends here, overlaps included.",
    "<strong>Reuse the same states when the problem is a DP.</strong> \"Build a string that avoids these words\" is <code>dp[i][state]</code>, taking automaton edges as transitions and treating terminals as forbidden (or as a sink). The automaton you just built is the state space.",
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
      "<p>The trie has one new node per character of the dictionary in the worst case, so it holds <code>O(sum |p|)</code> nodes. The BFS visits each node and each of its <code>&sigma;</code> letters once, which is <code>O(sum |p| &middot; &sigma;)</code> with filled transitions, or amortised linear in the dictionary size if you keep a <code>while</code>-fail instead. The text scan is then one transition per character. Aggregating <code>out[u] += out[fail[u]]</code> during BFS makes each text character cost a constant, not a walk down the failure chain.</p>",
      "<p>Putting real numbers in: a million-character dictionary plus a million-character text, alphabet 26, is a few tens of millions of array writes to build and a million reads to scan, which is a few tens of milliseconds. Climbing <code>fail</code> raw at every character when many words nest can multiply that scan by the nesting depth and miss the limit. Running a separate KMP per pattern at <code>m = 10<sup>3</sup></code> patterns is about a billion steps, which is the runtime this one automaton is designed to avoid.</p>",
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
      bug: "Reporting only the terminal you landed on looks complete, because that node is the longest dictionary prefix of the text so far. A shorter pattern that is a suffix of that prefix lives on the failure chain, so <code>ab</code> inside <code>xab</code> is never counted.",
      fix: "During BFS write <code>out[v] += out[fail[v]]</code>, or store an output link to the next terminal on the chain and walk it at query time. Test a dictionary where one word is a suffix of another." },
    { title: "fail[child] using an unfilled parent fail",
      bug: "A depth-first walk of the trie looks like it should fill links, because children are suffixes of their parents. Failure does not walk the trie parent; it walks a shorter string that may sit in a different branch, and a DFS can read <code>fail[u]</code> before BFS would have written it.",
      fix: "Use a queue. Push the root's children first with <code>fail = 0</code>, and only process a node after its parent has been dequeued. That is the order that makes <code>nxt[fail[u]][c]</code> already defined." },
    { title: "nxt[0][c]==0 meaning missing vs meaning root",
      bug: "Storing 0 for both \"no child\" and \"the root\" looks like a tidy default, and filling missing edges of the root to 0 is actually correct. Using 0 as a real child's index is not: you can no longer tell a missing edge from an edge back to the empty string, and the fail walk loops.",
      fix: "Number nodes from 0 as the root. On a non-root, a stored 0 means \"follow fail\". On the root, a stored 0 means \"stay\", which is the empty-string self-loop for a letter the dictionary does not start with." },
    { title: "Alphabet not 'a'-'z'",
      bug: "Subtracting <code>'a'</code> from an uppercase letter, a digit, or a punctuation mark looks like the usual 26-way index. The result is negative or larger than 25, and the next array access throws.",
      fix: "Map the real alphabet onto <code>0..sigma-1</code> at the input boundary, or store a <code>HashMap</code> per node if <code>sigma</code> is huge. The fail-fill is the same; only the child lookup changes." },
    { title: "Growing nxt incorrectly",
      bug: "Allocating <code>new int[sz+1][A]</code> and copying the old table on every inserted character looks like the safe way to grow. Each copy walks the whole trie again, so a dictionary of length <code>n</code> costs <code>O(n<sup>2</sup>)</code> memory traffic before you even start the BFS.",
      fix: "Preallocate a generous cap, or store nodes in an <code>ArrayList</code> and grow by doubling. The listing's <code>grow()</code> copies one row, not the whole table, which is the cheaper of the two honest options." },
  ],
  variants: [
    ["DP avoid words", "dp[i][state] ways to build length i landing in state; skip terminals (or absorb into a sink).", "CF 163E / classic", "forbidden-string DP"],
    ["Count each pattern separately", "Don't aggregate out[]; store lists of ids and output-link walk.", "report id list", "when m is small"],
    ["Binary alphabet / bits", "Same trie, 2 children. Used on binary codes.", "nxt[u][0/1]", "CF DNA problems"],
  ],
  followups: [
    ["Why BFS not DFS for failure links?",
      "<p>The node <code>fail[u]</code> represents a strictly shorter string than <code>u</code>, so it is an ancestor in the failure tree, not necessarily a trie-ancestor. A breadth-first walk by string length (which is trie depth) therefore finds every shorter state already filled, including <code>nxt[fail[u]][c]</code> if you pre-fill missing edges. A depth-first walk can ask for a failure in another branch that has not been written yet. The same reason KMP fills <code>&pi;</code> from left to right: you only read borders of prefixes you have finished.</p>"],
    ["Aho vs suffix automaton?",
      "<p>Aho-Corasick is a dictionary matcher: the patterns are known up front and the text is a stream. A suffix automaton represents every slice of one text, and later \"is this word in there?\" questions walk that automaton. If the text is huge and the patterns arrive as queries, build a suffix automaton or a suffix array of the text. If the patterns are the dictionary and the text arrives online, build Aho-Corasick. They solve opposite sides of the same \"many strings, one scan\" feeling.</p>"],
    ["How do you reconstruct positions, not just counts?",
      "<p>Store pattern ids on terminals instead of (or as well as) a count. When the scan sits at text index <code>i</code> and the output chain reports a word of length <code>L</code>, that word ends at <code>i</code> and starts at <code>i-L+1</code>. Walk the output links for nested hits so a landing on <code>aba</code> also emits <code>ba</code> and <code>a</code> if those ids live on the chain. Aggregated <code>out[u]</code> is enough only when the statement asks for a total.</p>"],
    ["What is the output link?",
      "<p>It is the nearest terminal on the failure chain: from <code>u</code>, skip every non-terminal failure in one hop, then jump <code>output[u] &rarr; output[output[u]]</code> to visit the rest. That is the same information as walking <code>fail</code>, just without stopping at useless nodes. When you only need totals, folding those terminals into <code>out[u] += out[fail[u]]</code> during BFS is cheaper still, because the scan then never walks the chain at all.</p>"],
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

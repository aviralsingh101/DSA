/* ==========================================================================
   app.js — sidebar, topbar, theme, search, tabs, copy, TOC, mermaid, keys.
   Classic script. Exposes nothing. Works from file:// at any folder depth.
   ========================================================================== */

(function () {
  "use strict";

  /* ---------------------------------------------------- root detection --- */
  // app.js always lives at <root>/assets/js/app.js, so stripping that suffix
  // from its own resolved URL gives an absolute site root that is valid on
  // file:// as well as http://, with no ../ counting.
  var thisScript = document.currentScript ||
    (function () {
      var s = document.getElementsByTagName("script");
      return s[s.length - 1];
    })();
  var ROOT = thisScript.src.replace(/assets\/js\/app\.js(\?.*)?$/, "");

  function url(path) { return ROOT + path; }

  function topicHref(mod, topic) {
    return url(mod.dir ? mod.dir + "/" + topic.file : topic.file);
  }

  /* ----------------------------------------------------------- helpers --- */

  var NAV = window.NAV_DATA || [];

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function svgIcon(paths, size) {
    var s = size || 16;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true">' + paths + "</svg>";
  }

  var ICONS = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    left: '<path d="M15 18l-6-6 6-6"/>',
    right: '<path d="M9 18l6-6-6-6"/>',
    burger: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    caret: '<path d="M9 18l6-6-6-6"/>'
  };

  function slug(s) {
    return String(s).toLowerCase()
      .replace(/[\u2192\u2190\u2194]/g, "-")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "section";
  }

  /* --------------------------------------------- flatten reading order --- */

  var FLAT = [];
  NAV.forEach(function (mod) {
    (mod.topics || []).forEach(function (t) {
      FLAT.push({ mod: mod, topic: t });
    });
  });

  var currentId = document.body.getAttribute("data-topic-id") || "";
  var currentIndex = -1;
  for (var i = 0; i < FLAT.length; i++) {
    if (FLAT[i].topic.id === currentId) { currentIndex = i; break; }
  }
  var current = currentIndex >= 0 ? FLAT[currentIndex] : null;
  var prevEntry = currentIndex > 0 ? FLAT[currentIndex - 1] : null;
  var nextEntry = currentIndex >= 0 && currentIndex < FLAT.length - 1 ? FLAT[currentIndex + 1] : null;

  /* ------------------------------------------------------------- theme --- */

  var THEME_KEY = "dsaTheme";

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function applyTheme(name, rerender) {
    document.documentElement.setAttribute("data-theme", name);
    try { localStorage.setItem(THEME_KEY, name); } catch (e) { /* file:// private mode */ }
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.innerHTML = svgIcon(name === "light" ? ICONS.moon : ICONS.sun, 17);
      btn.setAttribute("aria-label", name === "light" ? "Switch to dark theme" : "Switch to light theme");
    }
    if (rerender) renderMermaid(true);
  }

  (function initThemeEarly() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) { /* ignore */ }
    if (saved === "light" || saved === "dark") {
      document.documentElement.setAttribute("data-theme", saved);
    }
  })();

  /* ----------------------------------------------------------- sidebar --- */

  function buildSidebar() {
    var side = document.getElementById("sidebar");
    if (!side) return;

    var head = el("div", "sidebar__head");
    var titleLink = el("a", "sidebar__title", "DSA / CP Relearning Course");
    titleLink.href = url("index.html");
    var sub = el("span", "sidebar__sub",
      NAV.length + " modules \u00b7 " + FLAT.length + " topics");
    head.appendChild(titleLink);
    head.appendChild(sub);
    side.appendChild(head);

    var searchWrap = el("div", "sidebar__searchwrap");
    var search = el("input", "sidebar__search");
    search.type = "search";
    search.id = "nav-search";
    search.placeholder = "Search topics\u2026    /";
    search.setAttribute("aria-label", "Search topics");
    search.autocomplete = "off";
    searchWrap.appendChild(search);
    side.appendChild(searchWrap);

    var quick = el("div", "sidebar__quick");
    [
      ["Roadmap", "roadmap.html"],
      ["Pattern index", "pattern-index.html"],
      ["Java toolkit", "java-toolkit.html"],
      ["Cheat sheets", "cheatsheets/index.html"],
      ["Drills", "mock-drills.html"]
    ].forEach(function (pair) {
      var a = el("a", null, pair[0]);
      a.href = url(pair[1]);
      quick.appendChild(a);
    });
    side.appendChild(quick);

    var links = el("nav", "sidebar__links");
    links.setAttribute("aria-label", "Course contents");

    NAV.forEach(function (mod) {
      var d = el("details", "navgroup");
      d.setAttribute("data-mod", mod.id);
      if (current && current.mod.id === mod.id) d.open = true;

      var sum = el("summary");
      sum.appendChild(el("span", "navgroup__num", mod.num));
      sum.appendChild(el("span", "navgroup__label", mod.title));
      var caret = el("span", "navgroup__caret");
      caret.innerHTML = svgIcon(ICONS.caret, 13);
      sum.appendChild(caret);
      d.appendChild(sum);

      var items = el("div", "navgroup__items");
      (mod.topics || []).forEach(function (t) {
        var a = el("a", "navlink");
        a.href = topicHref(mod, t);
        a.setAttribute("data-topic", t.id);
        a.appendChild(el("span", "navlink__text", t.title));
        var tier = el("span", "navlink__tier", t.tier);
        tier.setAttribute("data-tier", t.tier);
        a.appendChild(tier);
        if (t.id === currentId) {
          a.classList.add("is-active");
          a.setAttribute("aria-current", "page");
        }
        items.appendChild(a);
      });
      d.appendChild(items);
      links.appendChild(d);
    });

    side.appendChild(links);

    var backdrop = el("div", "nav-backdrop");
    backdrop.addEventListener("click", function () {
      document.body.classList.remove("nav-open");
    });
    document.body.appendChild(backdrop);

    wireSearch(search, links);

    // scroll the active link into view inside the sidebar
    var active = links.querySelector(".navlink.is-active");
    if (active) {
      var t = active.offsetTop - side.clientHeight / 2;
      if (t > 0) side.scrollTop = t;
    }
  }

  function wireSearch(input, links) {
    var groups = [].slice.call(links.querySelectorAll(".navgroup"));
    var openState = null;

    function run() {
      var q = input.value.trim().toLowerCase();
      if (!q) {
        groups.forEach(function (g, gi) {
          g.classList.remove("is-hidden");
          [].slice.call(g.querySelectorAll(".navlink")).forEach(function (a) {
            a.classList.remove("is-hidden");
          });
          if (openState) g.open = openState[gi];
        });
        openState = null;
        return;
      }
      if (!openState) openState = groups.map(function (g) { return g.open; });

      groups.forEach(function (g) {
        var modTitle = (g.querySelector(".navgroup__label").textContent || "").toLowerCase();
        var anyVisible = false;
        [].slice.call(g.querySelectorAll(".navlink")).forEach(function (a) {
          var text = (a.querySelector(".navlink__text").textContent || "").toLowerCase();
          var hit = text.indexOf(q) !== -1 || modTitle.indexOf(q) !== -1;
          a.classList.toggle("is-hidden", !hit);
          if (hit) anyVisible = true;
        });
        g.classList.toggle("is-hidden", !anyVisible);
        if (anyVisible) g.open = true;
      });
    }

    input.addEventListener("input", run);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { input.value = ""; run(); input.blur(); }
      if (e.key === "Enter") {
        var first = links.querySelector(".navgroup:not(.is-hidden) .navlink:not(.is-hidden)");
        if (first) first.click();
      }
    });
  }

  /* ------------------------------------------------------------ topbar --- */

  function buildTopbar() {
    var bar = document.getElementById("topbar");
    if (!bar) return;

    var burger = el("button", "topbar__burger");
    burger.innerHTML = svgIcon(ICONS.burger, 18);
    burger.setAttribute("aria-label", "Toggle navigation");
    burger.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
    });
    bar.appendChild(burger);

    var crumb = el("div", "crumb");
    var home = el("a", null, "Home");
    home.href = url("index.html");
    crumb.appendChild(home);
    if (current) {
      crumb.appendChild(el("span", "crumb__sep", "/"));
      crumb.appendChild(el("span", null, "Module " + current.mod.num));
      crumb.appendChild(el("span", "crumb__sep", "/"));
      crumb.appendChild(el("span", "crumb__current", current.topic.title));
    } else {
      var t = document.querySelector("main h1");
      if (t) {
        crumb.appendChild(el("span", "crumb__sep", "/"));
        crumb.appendChild(el("span", "crumb__current", t.textContent));
      }
    }
    bar.appendChild(crumb);

    var actions = el("div", "topbar__actions");

    var prevBtn = el("a", "iconbtn");
    prevBtn.id = "nav-prev";
    prevBtn.innerHTML = svgIcon(ICONS.left, 17);
    if (prevEntry) {
      prevBtn.href = topicHref(prevEntry.mod, prevEntry.topic);
      prevBtn.title = "Previous: " + prevEntry.topic.title + "  [";
      prevBtn.setAttribute("aria-label", "Previous topic: " + prevEntry.topic.title);
    } else {
      prevBtn.setAttribute("aria-disabled", "true");
      prevBtn.setAttribute("aria-label", "No previous topic");
    }
    actions.appendChild(prevBtn);

    var nextBtn = el("a", "iconbtn");
    nextBtn.id = "nav-next";
    nextBtn.innerHTML = svgIcon(ICONS.right, 17);
    if (nextEntry) {
      nextBtn.href = topicHref(nextEntry.mod, nextEntry.topic);
      nextBtn.title = "Next: " + nextEntry.topic.title + "  ]";
      nextBtn.setAttribute("aria-label", "Next topic: " + nextEntry.topic.title);
    } else {
      nextBtn.setAttribute("aria-disabled", "true");
      nextBtn.setAttribute("aria-label", "No next topic");
    }
    actions.appendChild(nextBtn);

    var theme = el("button", "iconbtn");
    theme.id = "theme-toggle";
    theme.title = "Toggle theme  t";
    theme.addEventListener("click", function () {
      applyTheme(currentTheme() === "light" ? "dark" : "light", true);
    });
    actions.appendChild(theme);

    bar.appendChild(actions);
  }

  /* ---------------------------------------------------------- prevnext --- */

  function buildPrevNext() {
    var host = document.querySelector(".prevnext");
    if (!host) return;
    host.innerHTML = "";

    if (prevEntry) {
      var a = el("a", "prevnext__card prevnext__card--prev");
      a.href = topicHref(prevEntry.mod, prevEntry.topic);
      a.appendChild(el("span", "prevnext__dir", "\u2190 Previous"));
      a.appendChild(el("span", "prevnext__title", prevEntry.topic.title));
      a.appendChild(el("span", "prevnext__mod", "Module " + prevEntry.mod.num + " \u00b7 " + prevEntry.mod.title));
      host.appendChild(a);
    }
    if (nextEntry) {
      var b = el("a", "prevnext__card prevnext__card--next");
      b.href = topicHref(nextEntry.mod, nextEntry.topic);
      b.appendChild(el("span", "prevnext__dir", "Next \u2192"));
      b.appendChild(el("span", "prevnext__title", nextEntry.topic.title));
      b.appendChild(el("span", "prevnext__mod", "Module " + nextEntry.mod.num + " \u00b7 " + nextEntry.mod.title));
      host.appendChild(b);
    }
  }

  /* --------------------------------------------------------------- toc --- */

  function buildToc() {
    var toc = document.getElementById("toc");
    var main = document.querySelector("main");
    if (!toc || !main) return;

    var all = [].slice.call(main.querySelectorAll("h2, h3"));
    if (!all.length) { toc.style.display = "none"; return; }

    // Every heading gets an id so it is deep-linkable, but only structural
    // headings appear in the table of contents.
    var used = {};
    all.forEach(function (h) {
      if (!h.id) {
        var base = slug(h.textContent);
        var id = base, n = 2;
        while (used[id] || document.getElementById(id)) { id = base + "-" + n++; }
        h.id = id;
      }
      used[h.id] = true;
    });

    var SKIP = ".recognise__col, .cheat-card, .recap, .card, .tabs__panel, .callout, .drill";
    var heads = all.filter(function (h) { return !h.closest(SKIP); });
    if (!heads.length) { toc.style.display = "none"; return; }

    toc.appendChild(el("div", "toc__title", "On this page"));
    var list = el("ul", "toc__list");

    heads.forEach(function (h) {
      var li = el("li");
      var a = el("a", "toc__link" + (h.tagName === "H3" ? " toc__link--h3" : ""), h.textContent);
      a.href = "#" + h.id;
      a.setAttribute("data-target", h.id);
      li.appendChild(a);
      list.appendChild(li);
    });
    toc.appendChild(list);

    if (!("IntersectionObserver" in window)) return;

    var linkFor = {};
    [].slice.call(list.querySelectorAll(".toc__link")).forEach(function (a) {
      linkFor[a.getAttribute("data-target")] = a;
    });
    var visible = {};

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        visible[en.target.id] = en.isIntersecting;
      });
      var activeId = null;
      for (var k = 0; k < heads.length; k++) {
        if (visible[heads[k].id]) { activeId = heads[k].id; break; }
      }
      if (!activeId) {
        // nothing intersecting: pick the last heading above the viewport
        for (var j = heads.length - 1; j >= 0; j--) {
          if (heads[j].getBoundingClientRect().top < 120) { activeId = heads[j].id; break; }
        }
      }
      Object.keys(linkFor).forEach(function (id) {
        linkFor[id].classList.toggle("is-active", id === activeId);
      });
    }, { rootMargin: "-70px 0px -70% 0px", threshold: 0 });

    heads.forEach(function (h) { obs.observe(h); });
  }

  /* -------------------------------------------------------------- code --- */

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function parseRanges(spec) {
    var set = {};
    String(spec).split(",").forEach(function (part) {
      part = part.trim();
      if (!part) return;
      var m = part.match(/^(\d+)\s*-\s*(\d+)$/);
      if (m) {
        for (var i = +m[1]; i <= +m[2]; i++) set[i] = true;
      } else if (/^\d+$/.test(part)) {
        set[+part] = true;
      }
    });
    return set;
  }

  function enhanceCodeBlocks() {
    [].slice.call(document.querySelectorAll(".code")).forEach(function (box) {
      var codeEl = box.querySelector("pre code");
      if (!codeEl) return;

      var raw = codeEl.textContent.replace(/^\n/, "").replace(/\s+$/, "");
      box.__raw = raw;

      var hiSpec = box.getAttribute("data-highlight");
      if (hiSpec) {
        var hi = parseRanges(hiSpec);
        codeEl.innerHTML = raw.split("\n").map(function (line, idx) {
          var cls = "code__line" + (hi[idx + 1] ? " code__line--hi" : "");
          return '<span class="' + cls + '">' + escapeHtml(line) + "</span>";
        }).join("");
        codeEl.style.padding = "0";
      }

      var btn = box.querySelector(".code__copy");
      if (btn) {
        btn.addEventListener("click", function () {
          copyText(box.__raw, btn);
        });
      }
    });
  }

  function copyText(text, btn) {
    function done() {
      var old = btn.textContent;
      btn.textContent = "Copied!";
      btn.classList.add("is-done");
      setTimeout(function () {
        btn.textContent = old;
        btn.classList.remove("is-done");
      }, 1200);
    }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { btn.textContent = "Ctrl+C"; }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
  }

  /* -------------------------------------------------------------- tabs --- */

  function wireTabs() {
    [].slice.call(document.querySelectorAll(".tabs")).forEach(function (group) {
      var tabs = [].slice.call(group.querySelectorAll(".tabs__tab"));
      var panels = [].slice.call(group.querySelectorAll(".tabs__panel"));

      function select(idx, focus) {
        tabs.forEach(function (t, i) {
          var on = i === idx;
          t.classList.toggle("is-active", on);
          t.setAttribute("aria-selected", on ? "true" : "false");
          t.setAttribute("tabindex", on ? "0" : "-1");
        });
        panels.forEach(function (p, i) { p.classList.toggle("is-active", i === idx); });
        if (focus) tabs[idx].focus();
      }

      tabs.forEach(function (t, i) {
        t.addEventListener("click", function () { select(i); });
        t.addEventListener("keydown", function (e) {
          if (e.key === "ArrowRight") { e.preventDefault(); select((i + 1) % tabs.length, true); }
          if (e.key === "ArrowLeft") { e.preventDefault(); select((i - 1 + tabs.length) % tabs.length, true); }
          if (e.key === "Home") { e.preventDefault(); select(0, true); }
          if (e.key === "End") { e.preventDefault(); select(tabs.length - 1, true); }
        });
      });

      var initial = tabs.findIndex ? tabs.findIndex(function (t) {
        return t.classList.contains("is-active");
      }) : 0;
      select(initial < 0 ? 0 : initial);
    });
  }

  /* ----------------------------------------------------------- mermaid --- */

  var mermaidReady = false;

  function renderMermaid(force) {
    if (!window.mermaid) return;
    var nodes = [].slice.call(document.querySelectorAll(".mermaid"));
    if (!nodes.length) return;

    nodes.forEach(function (n) {
      if (!n.getAttribute("data-mermaid-src")) {
        n.setAttribute("data-mermaid-src", n.textContent.trim());
      }
      if (force) {
        n.removeAttribute("data-processed");
        n.innerHTML = "";
        n.textContent = n.getAttribute("data-mermaid-src");
      }
    });

    var dark = currentTheme() === "dark";
    try {
      window.mermaid.initialize({
        startOnLoad: false,
        securityLevel: "loose",
        theme: dark ? "dark" : "default",
        fontFamily: "ui-sans-serif, system-ui, Segoe UI, Roboto, Arial, sans-serif",
        flowchart: { curve: "basis", useMaxWidth: true, padding: 12 },
        themeVariables: dark
          ? { background: "#161b22", primaryColor: "#1c2128", primaryTextColor: "#e6edf3",
              primaryBorderColor: "#3d444d", lineColor: "#7d8590", secondaryColor: "#243b53",
              tertiaryColor: "#1c2128", mainBkg: "#1c2128", nodeBorder: "#3d444d",
              clusterBkg: "#12161c", clusterBorder: "#2d333b", titleColor: "#e6edf3",
              edgeLabelBackground: "#161b22", fontSize: "14px" }
          : { background: "#ffffff", primaryColor: "#f6f8fa", primaryTextColor: "#1f2328",
              primaryBorderColor: "#c2c9d1", lineColor: "#57606a", secondaryColor: "#eef1f4",
              tertiaryColor: "#f6f8fa", mainBkg: "#f6f8fa", nodeBorder: "#c2c9d1",
              clusterBkg: "#fbfcfd", clusterBorder: "#d8dee4", titleColor: "#1f2328",
              edgeLabelBackground: "#ffffff", fontSize: "14px" }
      });
      mermaidReady = true;
      var pending = nodes.filter(function (n) { return !n.getAttribute("data-processed"); });
      if (pending.length) {
        var p = window.mermaid.run({ nodes: pending });
        // run() is async; an unhandled rejection would pollute the console.
        if (p && typeof p.then === "function") p.then(null, markFallback);
      }
    } catch (e) {
      markFallback();
    }

    function markFallback() {
      nodes.forEach(function (n) {
        if (!n.getAttribute("data-processed")) n.classList.add("mermaid-fallback");
      });
    }
  }

  /* ---------------------------------------------------- table filters --- */

  function wireFilters() {
    [].slice.call(document.querySelectorAll("[data-filter-target]")).forEach(function (input) {
      var table = document.getElementById(input.getAttribute("data-filter-target"));
      if (!table) return;
      var countEl = document.querySelector(input.getAttribute("data-filter-count") || "\u0000");
      var rows = [].slice.call(table.querySelectorAll("tbody tr"));

      function run() {
        var q = input.value.trim().toLowerCase();
        var shown = 0;
        rows.forEach(function (r) {
          if (r.classList.contains("signal-table__group")) { return; }
          var hit = !q || r.textContent.toLowerCase().indexOf(q) !== -1;
          r.classList.toggle("is-hidden", !hit);
          if (hit) shown++;
        });
        // hide a group header when every row under it is hidden
        var groups = [].slice.call(table.querySelectorAll("tr.signal-table__group"));
        groups.forEach(function (g) {
          var any = false, n = g.nextElementSibling;
          while (n && !n.classList.contains("signal-table__group")) {
            if (!n.classList.contains("is-hidden")) any = true;
            n = n.nextElementSibling;
          }
          g.classList.toggle("is-hidden", !any);
        });
        if (countEl) countEl.textContent = shown + " / " + (rows.length - groups.length) + " rows";
      }

      input.addEventListener("input", run);
      input.addEventListener("keydown", function (e) {
        if (e.key === "Escape") { input.value = ""; run(); }
      });
      run();
    });
  }

  /* ---------------------------------------------------------- keyboard --- */

  function wireKeyboard() {
    document.addEventListener("keydown", function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var t = e.target;
      var typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);

      if (e.key === "/" && !typing) {
        var s = document.getElementById("nav-search");
        if (s) { e.preventDefault(); s.focus(); s.select(); }
        return;
      }
      if (typing) return;

      if (e.key === "[" && prevEntry) {
        window.location.href = topicHref(prevEntry.mod, prevEntry.topic);
      } else if (e.key === "]" && nextEntry) {
        window.location.href = topicHref(nextEntry.mod, nextEntry.topic);
      } else if (e.key === "t") {
        applyTheme(currentTheme() === "light" ? "dark" : "light", true);
      } else if (e.key === "Escape") {
        document.body.classList.remove("nav-open");
      }
    });
  }

  /* -------------------------------------------------------------- boot --- */

  function boot() {
    buildSidebar();
    buildTopbar();
    applyTheme(currentTheme(), false);
    buildPrevNext();
    enhanceCodeBlocks();
    wireTabs();
    wireFilters();
    buildToc();
    wireKeyboard();
    renderMermaid(false);
    if (window.VizPlayer && window.VizPlayer.initAll) window.VizPlayer.initAll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

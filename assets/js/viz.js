/* ==========================================================================
   viz.js — VizPlayer: declarative step-through animator for .array-viz and
   .dp-grid targets. Page authors write JSON frames only.
   Reads JSON from an inline <script type="application/json"> so it works on
   file:// with no fetch.
   ========================================================================== */

(function () {
  "use strict";

  var CELL_PITCH = 56;          // 52px cell + 4px gap, keep in sync with CSS
  var PLAY_MS = 900;

  var CELL_MODS = ["active", "window", "done", "best", "dim", "x"];
  var DP_MODS = ["empty", "filled", "from", "target", "answer", "block"];

  function make(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function fmt(v) {
    if (v === null || v === undefined) return "\u2014";
    if (v === Infinity) return "\u221e";
    if (v === -Infinity) return "-\u221e";
    return String(v);
  }

  /* --------------------------------------------------- array rendering --- */

  function ensureArray(target, data, frames) {
    var row = target.querySelector(".array-viz__row");
    var authored = !!row;

    if (!authored) {
      if (data.label) {
        target.insertBefore(make("div", "array-viz__label", data.label), target.firstChild);
      }
      row = make("div", "array-viz__row");
      var vals = data.array || [];
      for (var i = 0; i < vals.length; i++) {
        var c = make("div", "cell");
        c.setAttribute("data-i", String(i));
        c.appendChild(make("span", "cell__val", fmt(vals[i])));
        var idxLabel = data.indexLabels ? data.indexLabels[i] : i;
        c.appendChild(make("span", "cell__idx", String(idxLabel)));
        row.appendChild(c);
      }
      target.appendChild(row);
    }

    var cells = [].slice.call(row.querySelectorAll(".cell"));

    // pointer lane, generated from every pointer name used by any frame
    var names = {};
    frames.forEach(function (f) {
      if (f.pointers) Object.keys(f.pointers).forEach(function (k) { names[k] = true; });
    });
    var lane = target.querySelector(".array-viz__pointers");
    var ptrs = {};
    if (Object.keys(names).length) {
      if (!lane) {
        lane = make("div", "array-viz__pointers");
        target.appendChild(lane);
      }
      Object.keys(names).forEach(function (n) {
        var existing = lane.querySelector('.ptr[data-name="' + n + '"]');
        if (!existing) {
          existing = make("span", "ptr ptr--" + n, n);
          existing.setAttribute("data-name", n);
          lane.appendChild(existing);
        }
        ptrs[n] = existing;
      });
    }

    return { cells: cells, ptrs: ptrs, baseValues: cells.map(function (c) {
      return c.querySelector(".cell__val").textContent;
    }) };
  }

  function applyArrayFrame(view, frame) {
    view.cells.forEach(function (c) {
      CELL_MODS.forEach(function (m) { c.classList.remove("cell--" + m); });
    });

    if (frame.arr) {
      frame.arr.forEach(function (v, i) {
        if (view.cells[i]) view.cells[i].querySelector(".cell__val").textContent = fmt(v);
      });
    }
    if (frame.set) {
      Object.keys(frame.set).forEach(function (k) {
        var c = view.cells[+k];
        if (c) c.querySelector(".cell__val").textContent = fmt(frame.set[k]);
      });
    }
    if (!frame.arr && !frame.set) {
      view.cells.forEach(function (c, i) {
        c.querySelector(".cell__val").textContent = view.baseValues[i];
      });
    }

    function mark(list, mod) {
      (list || []).forEach(function (i) {
        if (view.cells[i]) view.cells[i].classList.add("cell--" + mod);
      });
    }

    if (frame.window && frame.window.length === 2) {
      for (var i = frame.window[0]; i <= frame.window[1]; i++) mark([i], "window");
    }
    mark(frame.done, "done");
    mark(frame.dim, "dim");
    mark(frame.x, "x");
    mark(frame.best, "best");
    mark(frame.active, "active");

    Object.keys(view.ptrs).forEach(function (n) {
      var p = view.ptrs[n];
      var pos = frame.pointers ? frame.pointers[n] : undefined;
      if (pos === undefined || pos === null || pos < 0) {
        p.classList.add("is-hidden");
      } else {
        p.classList.remove("is-hidden");
        p.style.setProperty("--col", String(pos));
      }
    });
  }

  /* ------------------------------------------------- dp-grid rendering --- */

  function ensureGrid(target, data) {
    var built = target.querySelector(".dp-cell");
    var rowHeads = data.rowHeads || [];
    var colHeads = data.colHeads || [];

    if (!built) {
      target.style.gridTemplateColumns = "repeat(" + (colHeads.length + 1) + ", minmax(44px, auto))";
      var corner = make("div", "dp-grid__corner", data.corner || "");
      target.appendChild(corner);
      colHeads.forEach(function (h) {
        target.appendChild(make("div", "dp-grid__colhead", String(h)));
      });
      for (var r = 0; r < rowHeads.length; r++) {
        target.appendChild(make("div", "dp-grid__rowhead", String(rowHeads[r])));
        for (var c = 0; c < colHeads.length; c++) {
          var cell = make("div", "dp-cell dp-cell--empty", "");
          cell.setAttribute("data-r", String(r));
          cell.setAttribute("data-c", String(c));
          target.appendChild(cell);
        }
      }
    }

    var map = {};
    [].slice.call(target.querySelectorAll(".dp-cell")).forEach(function (c) {
      map[c.getAttribute("data-r") + ":" + c.getAttribute("data-c")] = c;
    });
    return { map: map, values: {} };
  }

  function applyGridFrame(view, frame, index) {
    if (index === 0 || frame.clear) view.values = {};

    Object.keys(view.map).forEach(function (k) {
      var c = view.map[k];
      DP_MODS.forEach(function (m) { c.classList.remove("dp-cell--" + m); });
      c.classList.add(view.values[k] !== undefined ? "dp-cell--filled" : "dp-cell--empty");
      c.textContent = view.values[k] !== undefined ? view.values[k] : "";
    });

    (frame.cells || []).forEach(function (spec) {
      var key = spec.r + ":" + spec.c;
      var c = view.map[key];
      if (!c) return;
      if (spec.val !== undefined) {
        view.values[key] = fmt(spec.val);
        c.textContent = view.values[key];
      }
      DP_MODS.forEach(function (m) { c.classList.remove("dp-cell--" + m); });
      c.classList.add("dp-cell--" + (spec.cls || "filled"));
    });
  }

  /* ------------------------------------------------------------ player --- */

  function initPlayer(player) {
    if (player.getAttribute("data-viz-ready") === "1") return;

    var jsonEl = player.querySelector("script.viz-frames");
    if (!jsonEl) return;

    var data;
    try {
      data = JSON.parse(jsonEl.textContent);
    } catch (e) {
      player.appendChild(make("div", "viz-player__note", "Frame data could not be parsed: " + e.message));
      return;
    }

    var frames = data.frames || [];
    if (!frames.length) return;

    var targetId = player.getAttribute("data-viz-target");
    var target = document.querySelector('[data-viz-id="' + targetId + '"]');
    if (!target) return;

    var isGrid = target.classList.contains("dp-grid");
    var view = isGrid ? ensureGrid(target, data) : ensureArray(target, data, frames);

    /* controls */
    var controls = make("div", "viz-player__controls");
    var prev = make("button", "viz-btn", "\u27e8 Prev");
    var play = make("button", "viz-btn viz-btn--play", "\u25b6 Play");
    var next = make("button", "viz-btn", "Next \u27e9");
    var reset = make("button", "viz-btn", "\u21ba Reset");
    var counter = make("span", "viz-player__counter", "");
    prev.type = play.type = next.type = reset.type = "button";
    controls.appendChild(prev);
    controls.appendChild(play);
    controls.appendChild(next);
    controls.appendChild(reset);
    controls.appendChild(counter);
    player.insertBefore(controls, player.firstChild);

    var varsRow = null;
    if (data.vars && data.vars.length) {
      varsRow = make("div", "viz-player__vars");
      player.appendChild(varsRow);
    }

    var note = make("div", "viz-player__note", "");
    note.setAttribute("aria-live", "polite");
    player.appendChild(note);

    var at = 0, timer = null;

    function renderVars(frame) {
      if (!varsRow) return;
      varsRow.innerHTML = "";
      data.vars.forEach(function (name) {
        var chip = make("span", "viz-var");
        chip.appendChild(make("span", "viz-var__name", name + " ="));
        var v = frame.values ? frame.values[name] : undefined;
        chip.appendChild(make("span", "viz-var__val", fmt(v)));
        varsRow.appendChild(chip);
      });
    }

    function show(i) {
      at = Math.max(0, Math.min(frames.length - 1, i));
      var frame = frames[at];
      if (isGrid) applyGridFrame(view, frame, at);
      else applyArrayFrame(view, frame);
      renderVars(frame);
      note.textContent = frame.note || "";
      counter.textContent = (at + 1) + " / " + frames.length;
      prev.setAttribute("aria-disabled", at === 0 ? "true" : "false");
      next.setAttribute("aria-disabled", at === frames.length - 1 ? "true" : "false");
      if (at === frames.length - 1) stop();
    }

    // grid frames accumulate values, so jumping backwards must replay
    function goto(i) {
      if (isGrid && i < at) {
        view.values = {};
        for (var k = 0; k <= i; k++) applyGridFrame(view, frames[k], k);
        at = i;
        var f = frames[at];
        renderVars(f);
        note.textContent = f.note || "";
        counter.textContent = (at + 1) + " / " + frames.length;
        prev.setAttribute("aria-disabled", at === 0 ? "true" : "false");
        next.setAttribute("aria-disabled", at === frames.length - 1 ? "true" : "false");
        return;
      }
      show(i);
    }

    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
      play.textContent = "\u25b6 Play";
    }

    function start() {
      if (timer) return;
      if (at === frames.length - 1) goto(0);
      play.textContent = "\u23f8 Pause";
      timer = setInterval(function () {
        if (at >= frames.length - 1) { stop(); return; }
        show(at + 1);
      }, data.speed || PLAY_MS);
    }

    prev.addEventListener("click", function () { stop(); goto(at - 1); });
    next.addEventListener("click", function () { stop(); goto(at + 1); });
    reset.addEventListener("click", function () { stop(); goto(0); });
    play.addEventListener("click", function () { if (timer) stop(); else start(); });

    player.setAttribute("data-viz-ready", "1");
    goto(0);
  }

  function initAll() {
    [].slice.call(document.querySelectorAll(".viz-player")).forEach(initPlayer);
  }

  window.VizPlayer = { initAll: initAll, init: initPlayer };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { /* app.js drives boot */ });
  }
})();

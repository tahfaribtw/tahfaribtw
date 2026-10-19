/*
 * showpieces.js: one full-width animated scene for the top of a README, drawn from the profile's own data.
 *
 *   departures  repos as flights on a split-flap board, with a ticker along the bottom
 *   holo        the person as a collectible trading card with a foil shimmer, other repos as a fanned deck
 *   metro       languages as metro lines, repos as stations placed by year, all running into one interchange
 *   vinyl       an album: the cover shows the year's number, projects are the tracklist, months bounce as an equaliser
 *   vitals      a bedside monitor: commits as the ECG, the streak as heart rate, PRs, reviews and stars as vitals
 *   garden      repos as flowers sized by stars, the contribution graph as grass; a night sky in dark, a day sky in light
 *   yearcode    a year-in-review: six bold tiles (contributions, top language, busiest month, streak, best day, personality)
 *   newspaper   "The Daily Commit": a front page with the year as its headline, the top repo as the lead story
 *   passport    an open passport: the photo page with a machine-readable zone, and one visa stamp per language
 *   constellation  languages as constellations, repos as stars sized by their stars, with a shooting star
 *   weather     a commit forecast: chance of commits, the last seven days as weather, a radar of recent weeks
 *   pulse       the classic look's own: the year's contributions as one glowing waveform, with the headline numbers
 *   scroll      the Ink world's own: an ink-wash landscape whose ridges are the year, a poem from the profile and a seal
 *
 * Like the cards, motion is plain CSS inside the SVG (no scripts), only ambient loops, and visitors who prefer reduced
 * motion (or anyone with Subtle motion off) get the same scene standing still.
 * ReadmeShowpieces.build(model, options, palette) -> "<svg…>"
 */
(function (root, factory) {
  var node = typeof module === "object" && module.exports;
  var api = factory(node ? require("./core.js") : root.ReadmeCore, node ? require("./worlds.js") : root.ReadmeWorlds);
  if (node) module.exports = api;
  else root.ReadmeShowpieces = api;
})(typeof self !== "undefined" ? self : this, function (core, worlds) {
  "use strict";

  var SANS = "system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
  var MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";
  var SERIF = "Georgia,'Iowan Old Style','Palatino Linotype',Palatino,'Times New Roman',serif";
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function fmt(n) {
    n = Number(n) || 0;
    if (n >= 10000) return Math.round(n / 1000) + "k";
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return String(n);
  }
  function commas(n) { return String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function trunc(s, max) { s = String(s || ""); return s.length > max ? s.slice(0, Math.max(1, max - 1)).trimEnd() + "…" : s; }
  /** Largest font size (up to max) at which text this long fits the width, for a face about k em per character. */
  function fit(text, max, min, width, k) { return Math.max(min, Math.min(max, Math.floor(width / (Math.max(1, String(text).length) * k)))); }
  function wrap(text, maxChars, maxLines) {
    var words = String(text || "").split(/\s+/).filter(Boolean), lines = [], cur = "";
    for (var i = 0; i < words.length && lines.length < maxLines; i++) {
      var w = trunc(words[i], maxChars);
      if (!cur) cur = w;
      else if ((cur + " " + w).length <= maxChars) cur += " " + w;
      else { lines.push(cur); cur = w; }
    }
    if (cur && lines.length < maxLines) lines.push(cur);
    var used = lines.join(" ").split(/\s+/).filter(Boolean).length;
    if (used < words.length && lines.length) lines[lines.length - 1] = trunc(lines[lines.length - 1] + " …", maxChars);
    return lines;
  }
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  /** A theme colour made readable on a scene's surface, so every scene can wear the README's own accents. */
  function on(bg, c, min) {
    var dark = core.contrast(bg, "#ffffff") > core.contrast(bg, "#000000"), t = 0, x = c;
    while (core.contrast(x, bg) < min && t < 0.95) { t += 0.05; x = core.mixHex(c, dark ? "#ffffff" : "#000000", t); }
    return x;
  }
  function mix(a, b, t) { return core.mixHex(a, b, t); }
  /**
   * The README's own surface, so a scene sits on exactly what the cards sit on: their background, their text colours,
   * their accents. Scenes paint objects (a board, a card, a record) from these, never from fixed colours of their own.
   */
  function kit(p) {
    var bg = p.bg1, ink = p.ink, dark = core.contrast(bg, "#ffffff") > core.contrast(bg, "#000000");
    var a1 = on(bg, p.a1, 3.4), a2 = on(bg, p.a2, 3);
    return {
      dark: dark, bg: bg, bg2: p.bg2 || bg, ink: ink,
      muted: on(bg, mix(ink, bg, 0.38), 4.5), dim: on(bg, mix(ink, bg, 0.55), 3), line: mix(ink, bg, 0.84), zone: mix(ink, bg, dark ? 0.94 : 0.95),
      a1: a1, a2: a2, a3: on(bg, mix(p.a1, p.a2, 0.5), 3),
      // a raised panel and its text: a deeper or lighter step of the surface, tinted by the second accent
      panel: mix(mix(bg, p.a2, 0.1), dark ? "#000000" : "#ffffff", dark ? 0.35 : 0.55), panel2: mix(mix(bg, p.a2, 0.18), dark ? "#000000" : "#ffffff", dark ? 0.1 : 0.3),
      shade: dark ? 0.5 : 0.18,
      // text that reads on an accent fill
      onA1: core.contrast(p.a1, "#ffffff") >= core.contrast(p.a1, "#0b0b10") ? "#ffffff" : "#0b0b10"
    };
  }
  function langColor(lang, fallback) { return core.LANG_COLORS[lang] || fallback; }
  function svgOpen(W, H, label) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(label) + '">';
  }
  /** The scene's motion, or nothing when motion is off. Reduced motion always gets the still scene. */
  function motion(p, css) {
    return p.anim ? "<style>" + css + "@media (prefers-reduced-motion:reduce){*{animation:none!important}}</style>" : "";
  }

  /* ---------- the profile's numbers, shared by every scene ---------- */
  function facts(m, o) {
    var a = m.activity, daily = a && a.daily ? a.daily : [];
    var sum = daily.reduce(function (n, v) { return n + v; }, 0);
    var total = a ? (a.total !== null && a.total !== undefined ? a.total : sum) : null;
    // per-month totals across the activity window (at most the last 12 months)
    var months = [], start = a && Date.parse(a.start + "T00:00:00Z");
    if (daily.length && !isNaN(start)) {
      var byKey = {}, order = [];
      daily.forEach(function (v, i) {
        var d = new Date(start + i * 86400000), key = d.getUTCFullYear() * 12 + d.getUTCMonth();
        if (!(key in byKey)) { byKey[key] = 0; order.push(key); }
        byKey[key] += v;
      });
      months = order.slice(-12).map(function (k) { return { label: MONTHS[k % 12], v: byKey[k] }; });
    }
    var peak = months.reduce(function (b, x) { return !b || x.v > b.v ? x : b; }, null);
    var years = m.all.map(function (r) { return Number(String(r.created).slice(0, 4)); }).filter(function (y) { return y > 1990; });
    var newest = m.all.reduce(function (b, r) { return r.pushed > b ? r.pushed : b; }, "");
    return {
      total: total, prs: a ? a.prs : null, reviews: a ? a.reviews : null, issues: a ? a.issues : null,
      streak: a ? a.current : null, longest: a ? a.longest : null, active: a ? a.active : 0, windowDays: a ? a.windowDays : 0,
      weeks: a && a.weeks ? a.weeks : [], daily: daily, months: months, peak: peak,
      firstYear: years.length ? Math.min.apply(null, years) : Number(m.since) || 0,
      lastYear: years.length ? Math.max.apply(null, years) : Number(m.since) || 0,
      newest: newest, projects: core.pickProjects(m, o), role: core.designation(m, o),
      best: bestDay(daily, start), weekdays: weekdayTotals(daily, start),
      endYear: daily.length && !isNaN(start) ? new Date(start + (daily.length - 1) * 86400000).getUTCFullYear() : (years.length ? Math.max.apply(null, years) : Number(m.since) || 0)
    };
  }
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  function bestDay(daily, start) {
    var bi = -1;
    daily.forEach(function (v, i) { if (bi < 0 || v > daily[bi]) bi = i; });
    if (bi < 0 || !daily[bi]) return null;
    var d = new Date(start + bi * 86400000);
    return { v: daily[bi], label: isNaN(start) ? "" : MONTHS[d.getUTCMonth()] + " " + d.getUTCDate(), day: isNaN(start) ? "" : DAYS[d.getUTCDay()] };
  }
  function weekdayTotals(daily, start) {
    var w = [0, 0, 0, 0, 0, 0, 0];
    if (!isNaN(start)) daily.forEach(function (v, i) { w[new Date(start + i * 86400000).getUTCDay()] += v; });
    return w;
  }
  function daysBetween(a, b) { var x = Date.parse(a), y = Date.parse(b); return isNaN(x) || isNaN(y) ? 0 : Math.round((y - x) / 86400000); }
  function firstName(m) { return String(m.name || m.login).split(/\s+/)[0]; }

  /* ================= A. departures board ================= */
  function departures(m, o, p) {
    var f = facts(m, o), r = rng(core.hash(m.login + "flap")), W = 960;
    var S = kit(p), TILE = S.panel, AMBER = on(TILE, p.a1, 4.8), INK = on(TILE, S.ink, 7), MUTED = S.muted;
    var TK = core.contrast(AMBER, "#ffffff") >= core.contrast(AMBER, "#0b0b10") ? "#ffffff" : "#0b0b10", HINGE = mix(TILE, "#000000", S.dark ? 0.55 : 0.22);
    var rows = f.projects.slice(0, 5);
    var rowY = 212, step = 46, statsY = rowY + Math.max(1, rows.length) * step + 30, tickerH = 44, H = statsY + 96 + tickerH;
    var out = [], flips = 0;

    /** A run of split-flap tiles. Some tiles flip now and then (their delay is seeded from the username). */
    function flap(text, x, y, big, color, rate) {
      var w = big ? 34 : 19, h = big ? 50 : 30, gap = big ? 3 : 2, s = "", chars = String(text).toUpperCase().split("");
      chars.forEach(function (ch, i) {
        var gx = x + i * (w + gap), moving = p.anim && r() < rate, rx = big ? 4 : 3;
        var face = '<rect width="' + w + '" height="' + h + '" rx="' + rx + '" fill="url(#tl)"/>' +
          (ch === " " ? "" : '<text x="' + w / 2 + '" y="' + (big ? 37 : 22) + '" text-anchor="middle" font-family="' + MONO + '" font-weight="800" font-size="' + (big ? 36 : 18) + '" fill="' + (color || AMBER) + '">' + esc(ch) + "</text>");
        s += '<g transform="translate(' + gx + " " + y + ')">' + face;
        if (moving) {
          // a real flap: the top half folds down over the hinge, the gap shows dark, then the lower flap drops into place
          var dl = ' style="animation-delay:-' + (r() * 7).toFixed(2) + 's"';
          s += '<rect class="fs"' + dl + ' width="' + w + '" height="' + h + '" rx="' + rx + '" fill="' + HINGE + '"/>' +
            '<g class="fu"' + dl + '><svg width="' + w + '" height="' + h / 2 + '" overflow="hidden">' + face + "</svg></g>" +
            '<g class="fd"' + dl + '><svg y="' + h / 2 + '" width="' + w + '" height="' + h / 2 + '" viewBox="0 ' + h / 2 + " " + w + " " + h / 2 + '" overflow="hidden">' + face + "</svg></g>";
          flips++;
        }
        s += "</g>";
      });
      // one hinge line across the whole run
      s += '<rect x="' + x + '" y="' + (y + h / 2 - 0.5) + '" width="' + (chars.length * (w + gap) - gap) + '" height="1" fill="' + HINGE + '"/>';
      return s;
    }
    function pad(s, n) { s = String(s).toUpperCase(); return s.length > n ? s.slice(0, n) : s + " ".repeat(n - s.length); }

    out.push("<defs>" +
      '<linearGradient id="tl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + mix(TILE, S.ink, 0.08) + '"/><stop offset="0.5" stop-color="' + TILE + '"/><stop offset="0.5" stop-color="' + mix(TILE, "#000000", 0.12) + '"/><stop offset="1" stop-color="' + mix(TILE, "#000000", 0.05) + '"/></linearGradient></defs>');
    out.push("<g>");

    out.push('<text x="40" y="48" font-family="' + SANS + '" font-size="13" font-weight="600" letter-spacing="2.6" fill="' + MUTED + '">✈ DEPARTURES · @' + esc(trunc(m.login, 28).toUpperCase()) + "</text>");
    var starTxt = "★" + fmt(m.stars);
    out.push(flap(starTxt, W - 40 - starTxt.length * 21 + 2, 28, false, AMBER, 0.5));
    // in the Airport world the banner already carries the name on flaps, so this board leads with its title
    out.push(flap(o.world === "airport" ? "DEPARTURES" : trunc(m.name, 24).replace(/…$/, ""), 40, 70, true, AMBER, 0.45));
    if (f.role && o.world !== "airport") out.push('<text x="40" y="156" font-family="' + SANS + '" font-size="15" font-weight="600" letter-spacing="3" fill="' + S.muted + '">' + esc(trunc(f.role, 62).toUpperCase()) + "</text>");

    // columns
    var COL = { since: 40, flight: 140, dest: 428, gate: 712, status: 812 };
    out.push('<g font-family="' + SANS + '" font-size="11" font-weight="600" letter-spacing="2.2" fill="' + S.dim + '">' +
      '<text x="' + COL.since + '" y="196">SINCE</text><text x="' + COL.flight + '" y="196">FLIGHT</text><text x="' + COL.dest + '" y="196">DESTINATION</text>' +
      '<text x="' + COL.gate + '" y="196">GATE ★</text><text x="' + COL.status + '" y="196">STATUS</text></g>');
    out.push('<rect x="40" y="203" width="' + (W - 80) + '" height="1" fill="' + S.line + '"/>');
    if (!rows.length) {
      out.push(flap(pad("NO FLIGHTS YET", 20), COL.flight, rowY + 8, false, INK, 0.2));
    }
    rows.forEach(function (repo, i) {
      var y = rowY + i * step, status;
      if (repo.pushed && repo.pushed === f.newest) status = { t: "BOARDING", c: S.a1, blink: true };
      else if (daysBetween(repo.pushed, f.newest) > 365) status = { t: "LANDED", c: S.dim };
      else if (repo.stars >= 10) status = { t: "SHIPPED", c: S.a2 };
      else status = { t: "ON TIME", c: S.ink };
      var gate = repo.stars >= 1000 ? fmt(repo.stars) : ("000" + repo.stars).slice(-3);
      var dest = repo.desc || repo.lang || "—";
      out.push(flap(String(repo.created).slice(0, 4) || "----", COL.since, y + 8, false, AMBER, 0.15));
      out.push(flap(pad(repo.name, 13), COL.flight, y + 8, false, AMBER, 0.22));
      out.push(flap(pad(dest, 13), COL.dest, y + 8, false, INK, 0.12));
      out.push(flap(("    " + gate).slice(-4), COL.gate, y + 8, false, AMBER, 0.25));
      out.push("<g" + (status.blink && p.anim ? ' class="bk"' : "") + '><circle cx="' + (COL.status + 5) + '" cy="' + (y + 23) + '" r="5" fill="' + status.c + '"/>' +
        '<text x="' + (COL.status + 18) + '" y="' + (y + 28) + '" font-family="' + SANS + '" font-size="14" font-weight="700" letter-spacing="1.6" fill="' + status.c + '">' + status.t + "</text></g>");
      out.push('<rect x="40" y="' + (y + step - 1) + '" width="' + (W - 80) + '" height="1" fill="' + S.line + '" fill-opacity="0.6"/>');
    });

    // headline numbers
    var stats = [];
    if (f.total !== null) stats.push([commas(f.total), "CONTRIBUTIONS"]);
    if (f.prs !== null && f.prs !== undefined) stats.push([commas(f.prs), "PULL REQUESTS"]);
    if (f.streak !== null) stats.push([String(f.streak), "DAY STREAK"]);
    stats.push([String(m.publicRepos), "REPOSITORIES"]);
    stats.slice(0, 4).forEach(function (s, i) {
      var x = 40 + i * 225;
      out.push(flap(trunc(s[0], 9), x, statsY, false, AMBER, 0.2));
      out.push('<text x="' + x + '" y="' + (statsY + 52) + '" font-family="' + SANS + '" font-size="11" font-weight="600" letter-spacing="2" fill="' + MUTED + '">' + s[1] + "</text>");
    });

    // ticker: the same text twice, each forced to an exact width, so sliding by one copy loops seamlessly
    var bits = ["NOW BOARDING: " + (f.role ? trunc(f.role, 48) : "NEW PROJECTS"), "FOLLOW @" + m.login + " ON GITHUB"];
    if (m.langs.length) bits.push("FLIGHT PATH: " + m.langs.slice(0, 3).map(function (l) { return l.name; }).join(" · "));
    var tagline = String(o.tagline || "").trim();
    if (tagline) bits.push(trunc(tagline, 60));
    var text = "";
    while (text.length < 110) text += " ★ " + bits.join(" ★ ");
    text = text.toUpperCase();
    var cw = 9.6, len = Math.round(text.length * cw), ty = H - tickerH;
    out.push('<rect x="0" y="' + ty + '" width="' + W + '" height="' + tickerH + '" fill="' + AMBER + '"/>');
    out.push("<g" + (p.anim ? ' class="tk"' : "") + ' font-family="' + MONO + '" font-size="16" font-weight="800" fill="' + TK + '">' +
      [0, len].map(function (x) { return '<text x="' + x + '" y="' + (ty + 28) + '" textLength="' + len + '" lengthAdjust="spacingAndGlyphs" xml:space="preserve">' + esc(text) + "</text>"; }).join("") + "</g>");
    out.push("</g>");

    var css = ".fu,.fd,.fs{transform-box:fill-box;animation-duration:7s;animation-iteration-count:infinite}" +
      ".fu{transform-origin:center bottom;animation-name:fu;animation-timing-function:ease-in}" +
      ".fd{transform-origin:center top;animation-name:fd;animation-timing-function:cubic-bezier(.3,1.6,.6,1)}" +
      ".fs{opacity:0;animation-name:fs;animation-timing-function:steps(1)}" +
      "@keyframes fu{0%,88%{transform:scaleY(1)}90.5%{transform:scaleY(0)}90.6%,100%{transform:scaleY(1)}}" +
      "@keyframes fd{0%,90.5%{transform:scaleY(1)}90.6%{transform:scaleY(0)}93.5%,100%{transform:scaleY(1)}}" +
      "@keyframes fs{0%,88%{opacity:0}88.1%,93.4%{opacity:1}93.5%,100%{opacity:0}}" +
      "@keyframes bk{50%{opacity:.25}}.bk{animation:bk 1.2s steps(2) infinite}" +
      "@keyframes tk{to{transform:translateX(-" + len + "px)}}.tk{animation:tk " + Math.round(len / 55) + "s linear infinite}";
    return svgOpen(W, H, "Departures board for " + m.login) + motion(p, css) + out.join("") + "</svg>";
  }

  /* ================= B. holo trading card ================= */
  function holo(m, o, p) {
    var f = facts(m, o), r = rng(core.hash(m.login + "holo")), W = 960, H = 560, L = p.light;
    var top = f.projects[0], deck = f.projects.slice(1, 4);
    var hp = f.total !== null ? f.total : m.stars;
    // the card is printed in the README's colours: its foil edge is the two accents, its face the raised surface
    var S = kit(p), FACE = S.panel, CI = on(FACE, S.ink, 7), CM = on(FACE, mix(S.ink, FACE, 0.3), 4.5), CA = on(FACE, p.a1, 4.5), CB = on(FACE, p.a2, 4.5);
    var out = [];
    out.push("<defs>" +
      '<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + mix(p.a1, "#ffffff", 0.35) + '"/><stop offset="0.3" stop-color="' + p.a1 + '"/><stop offset="0.5" stop-color="' + mix(p.a1, "#ffffff", 0.7) + '"/><stop offset="0.7" stop-color="' + p.a2 + '"/><stop offset="1" stop-color="' + mix(p.a2, "#ffffff", 0.35) + '"/></linearGradient>' +
      '<linearGradient id="silver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + mix(FACE, S.ink, 0.35) + '"/><stop offset="0.5" stop-color="' + mix(FACE, S.ink, 0.08) + '"/><stop offset="1" stop-color="' + mix(FACE, S.ink, 0.42) + '"/></linearGradient>' +
      '<linearGradient id="navy" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="' + S.panel2 + '"/><stop offset="1" stop-color="' + FACE + '"/></linearGradient>' +
      '<linearGradient id="foil" x1="0" y1="0" x2="1" y2="0.25"><stop offset="0.2" stop-color="' + p.a1 + '" stop-opacity="0"/><stop offset="0.36" stop-color="' + p.a1 + '" stop-opacity="0.5"/><stop offset="0.46" stop-color="' + p.a2 + '" stop-opacity="0.5"/><stop offset="0.56" stop-color="' + mix(p.a1, "#ffffff", 0.6) + '" stop-opacity="0.45"/><stop offset="0.64" stop-color="' + p.a2 + '" stop-opacity="0.4"/><stop offset="0.8" stop-color="' + p.a2 + '" stop-opacity="0"/></linearGradient>' +
      '<clipPath id="inner"><rect x="70" y="50" width="310" height="460" rx="13"/></clipPath>' +
      '<radialGradient id="glare"><stop offset="0" stop-color="#ffffff" stop-opacity="0.55"/><stop offset="0.5" stop-color="#ffffff" stop-opacity="0.12"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>' +
      '<filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#000" flood-opacity="' + S.shade + '"/></filter>' +
      '<filter id="gl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter></defs>');
    // the card, tilted a little
    out.push('<g transform="rotate(-3 225 280)"><g' + (p.anim ? ' class="tilt"' : "") + '><rect x="60" y="40" width="330" height="480" rx="20" fill="url(#gold)" filter="url(#sh)"/>');
    out.push('<rect x="70" y="50" width="310" height="460" rx="13" fill="url(#navy)"/><g clip-path="url(#inner)">');
    var lang = m.langs.length ? m.langs[0].name : "Code";
    out.push('<text x="86" y="76" font-family="' + SANS + '" font-size="10" font-weight="700" letter-spacing="2" fill="' + CB + '">BASIC · ' + esc(trunc(lang, 16).toUpperCase()) + "</text>");
    out.push('<text x="364" y="77" text-anchor="end" font-family="' + SANS + '" font-size="14" font-weight="800" fill="' + CA + '">HP ' + esc(commas(hp)) + "</text>");
    var name = trunc(m.name, 26), ns = fit(name, 26, 15, 280, 0.58);
    out.push('<text x="86" y="106" font-family="' + SANS + '" font-size="' + ns + '" font-weight="800" fill="' + CI + '">' + esc(name) + "</text>");
    // the art: the contribution graph in foil colours
    out.push('<rect x="86" y="118" width="278" height="150" rx="6" fill="' + mix(FACE, S.dark ? "#000000" : S.ink, S.dark ? 0.35 : 0.06) + '" stroke="url(#gold)" stroke-width="3"/>');
    var cols = 22, cw = 11, gap = 1.5, d = f.daily, n = d.length, nz = d.filter(function (v) { return v > 0; }).sort(function (a, b) { return a - b; });
    var q = function (x) { return nz.length ? nz[Math.min(nz.length - 1, Math.floor(x * nz.length))] : 1; }, t1 = q(0.33), t2 = q(0.66);
    for (var c = 0; c < cols; c++) for (var row = 0; row < 7; row++) {
      var idx = n - (cols - c) * 7 + row, v = idx >= 0 && idx < n ? d[idx] : (n ? 0 : (r() < 0.55 ? 1 + Math.floor(r() * 3) : 0));
      var lv = v <= 0 ? 0 : v <= t1 ? 1 : v <= t2 ? 2 : 3;
      out.push('<rect x="' + (95 + c * (cw + gap)).toFixed(1) + '" y="' + (128 + row * 17) + '" width="' + cw + '" height="14" rx="2" fill="' +
        (lv ? mix(mix(p.a2, p.a1, c / (cols - 1)), S.dark ? "#ffffff" : "#000000", (lv - 1) * 0.14) : CI) + '" fill-opacity="' + (lv ? 0.95 : 0.08) + '"/>');
    }
    out.push('<text x="352" y="258" text-anchor="end" font-family="' + SANS + '" font-size="40" font-weight="900" fill="' + p.a2 + '" filter="url(#gl)" opacity="0.8">' + esc(core.initials(m)) + "</text>");
    out.push('<text x="352" y="258" text-anchor="end" font-family="' + SANS + '" font-size="40" font-weight="900" fill="' + CI + '">' + esc(core.initials(m)) + "</text>");
    out.push('<text x="225" y="286" text-anchor="middle" font-family="' + SANS + '" font-size="10.5" font-style="italic" fill="' + CM + '">' + esc(trunc((f.role ? f.role + " · " : "") + (m.since ? "on GitHub since " + m.since : ""), 52)) + "</text>");

    // two attacks: the best project, then pull requests (or the next project)
    var attacks = [];
    if (top) attacks.push({ cost: 2, name: top.name, text: top.desc || (top.lang ? "Written in " + top.lang + "." : "A project worth a look."), dmg: top.stars });
    if (f.prs) attacks.push({ cost: 3, name: "Pull Request Barrage", text: "Lands " + commas(f.prs) + " pull requests" + (f.streak ? ". Streak +" + f.streak + " this turn." : "."), dmg: f.prs });
    else if (f.projects[1]) attacks.push({ cost: 3, name: f.projects[1].name, text: f.projects[1].desc || "A second favourite.", dmg: f.projects[1].stars });
    attacks.forEach(function (a, i) {
      var y = 312 + i * 72;
      if (i) out.push('<rect x="86" y="' + (y - 18) + '" width="278" height="1" fill="' + CI + '" fill-opacity="0.15"/>');
      for (var k = 0; k < a.cost; k++) out.push('<circle cx="' + (94 + k * 14) + '" cy="' + (y - 4) + '" r="5.5" fill="' + p.a1 + '" stroke="' + mix(p.a1, "#000000", 0.3) + '"/>');
      out.push('<text x="' + (92 + a.cost * 14) + '" y="' + y + '" font-family="' + SANS + '" font-size="15" font-weight="800" fill="' + CI + '">' + esc(trunc(a.name, 20)) + "</text>");
      out.push('<text x="364" y="' + (y + 2) + '" text-anchor="end" font-family="' + SANS + '" font-size="22" font-weight="900" fill="' + CI + '">' + esc(fmt(a.dmg)) + "</text>");
      wrap(a.text, 44, 2).forEach(function (line, j) {
        out.push('<text x="88" y="' + (y + 19 + j * 14) + '" font-family="' + SANS + '" font-size="11" fill="' + CM + '">' + esc(line) + "</text>");
      });
    });
    out.push('<rect x="86" y="452" width="278" height="1" fill="' + CI + '" fill-opacity="0.15"/>');
    [["weakness", "Meetings ×2"], ["resistance", "Outages −30"], ["retreat", "☕☕"]].forEach(function (x, i) {
      var tx = [86, 190, 364][i], anchor = ["start", "middle", "end"][i];
      out.push('<text x="' + tx + '" y="468" text-anchor="' + anchor + '" font-family="' + SANS + '" font-size="9.5" fill="' + CM + '">' + x[0] + "</text>");
      out.push('<text x="' + tx + '" y="481" text-anchor="' + anchor + '" font-family="' + SANS + '" font-size="10.5" font-weight="700" fill="' + CI + '">' + x[1] + "</text>");
    });
    var rarity = m.stars >= 1000 ? "SECRET RARE" : m.stars >= 100 ? "HOLO RARE" : m.stars >= 10 ? "RARE HOLO" : "PROMO HOLO";
    var no = ("00" + (core.hash(m.login) % 365 + 1)).slice(-3);
    out.push('<text x="86" y="500" font-family="' + SANS + '" font-size="9.5" font-weight="700" letter-spacing="1.3" fill="' + CA + '">' + no + "/365 ★ " + rarity + "</text>");
    out.push('<text x="364" y="500" text-anchor="end" font-family="' + SANS + '" font-size="9.5" font-weight="700" letter-spacing="1.3" fill="' + CA + '">' + esc(String(m.since || "")) + " SET</text>");
    // the foil: a rainbow band sliding across, plus a few sparkles
    out.push('<rect x="-240" y="40" width="900" height="480" fill="url(#foil)" style="mix-blend-mode:color-dodge"' + (p.anim ? ' class="hf"' : ' transform="translate(60 0)"') + "/>");
    [[118, 150, 0], [338, 236, 0.8], [250, 420, 1.6]].forEach(function (s) {
      out.push('<circle cx="' + s[0] + '" cy="' + s[1] + '" r="3" fill="#ffffff"' + (p.anim ? ' class="sp" style="animation-delay:' + s[2] + 's"' : ' opacity="0.7"') + "/>");
    });
    out.push('<ellipse cx="160" cy="140" rx="150" ry="110" fill="url(#glare)" style="mix-blend-mode:screen"' + (p.anim ? ' class="gl"' : ' opacity="0.6"') + "/>");
    out.push("</g></g></g>");

    // the rest of the deck
    var ink = S.ink, accent = S.a2;
    out.push('<text x="480" y="80" font-family="' + SANS + '" font-size="12" font-weight="700" letter-spacing="2.6" fill="' + accent + '">YOUR DECK · ' + m.all.length + (m.all.length === 1 ? " CARD" : " CARDS") + "</text>");
    out.push('<text x="480" y="122" font-family="' + SANS + '" font-size="31" font-weight="800" letter-spacing="-0.5" fill="' + ink + '">Every repo is a card.</text>');
    out.push('<text x="480" y="160" font-family="' + SANS + '" font-size="31" font-weight="800" letter-spacing="-0.5" fill="' + ink + '">Your best one is holo.</text>');
    deck.forEach(function (repo, i) {
      var x = 482 + i * 122, y = [222, 236, 222][i], rot = [-8, 2, 10][i];
      var tier = repo.stars >= 100 ? { t: "RARE", c: CA } : repo.stars >= 10 ? { t: "UNCOMMON", c: CB } : { t: "COMMON", c: CM };
      var lc = langColor(repo.lang, p.a1);
      out.push('<g transform="rotate(' + rot + " " + (x + 95) + " " + (y + 130) + ')"><rect x="' + x + '" y="' + y + '" width="190" height="262" rx="13" fill="url(#silver)" filter="url(#sh)"/>' +
        '<rect x="' + (x + 8) + '" y="' + (y + 8) + '" width="174" height="246" rx="8" fill="url(#navy)"/>' +
        '<text x="' + (x + 20) + '" y="' + (y + 30) + '" font-family="' + SANS + '" font-size="9" font-weight="700" letter-spacing="1.6" fill="' + tier.c + '">◆ ' + tier.t + "</text>" +
        '<text x="' + (x + 20) + '" y="' + (y + 52) + '" font-family="' + SANS + '" font-size="' + fit(trunc(repo.name, 20), 15, 10, 150, 0.66) + '" font-weight="800" fill="' + CI + '">' + esc(trunc(repo.name, 20)) + "</text>" +
        '<rect x="' + (x + 20) + '" y="' + (y + 64) + '" width="150" height="90" rx="6" fill="' + lc + '" fill-opacity="0.35"/>' +
        '<rect x="' + (x + 20) + '" y="' + (y + 64) + '" width="150" height="90" rx="6" fill="none" stroke="' + lc + '" stroke-opacity="0.6"/>' +
        '<text x="' + (x + 20) + '" y="' + (y + 190) + '" font-family="' + SANS + '" font-size="22" font-weight="900" fill="' + tier.c + '">★ ' + esc(fmt(repo.stars)) + "</text>" +
        '<text x="' + (x + 20) + '" y="' + (y + 214) + '" font-family="' + SANS + '" font-size="11" fill="' + CM + '">' + esc(trunc(repo.lang || "No language", 22)) + "</text></g>");
    });
    var css = "@keyframes hf{0%{transform:translateX(-260px)}100%{transform:translateX(420px)}}.hf{animation:hf 4.5s ease-in-out infinite alternate}" +
      "@keyframes sp{0%,100%{opacity:0}50%{opacity:1}}.sp{animation:sp 2.4s ease-in-out infinite}" +
      "@keyframes gl{0%,100%{transform:translate(0,0)}50%{transform:translate(150px,260px)}}.gl{animation:gl 7s ease-in-out infinite}" +
      "@keyframes tilt{0%,100%{transform:perspective(900px) rotateY(-4deg) rotateX(2deg)}50%{transform:perspective(900px) rotateY(4deg) rotateX(-2deg)}}" +
      ".tilt{transform-box:fill-box;transform-origin:center;animation:tilt 7s ease-in-out infinite}";
    return svgOpen(W, H, "Trading card for " + m.login) + motion(p, css) + out.join("") + "</svg>";
  }

  /* ================= C. metro map ================= */
  function metro(m, o, p) {
    var f = facts(m, o), W = 960, H = 560, L = p.light;
    var S = kit(p), BG = S.bg, INK = S.ink, MUTED = S.muted, ZONE = S.zone, STATION = S.bg;
    // one line per top language, its four most recent repos as stations; a profile with no languages gets one "Code" line
    var lines = m.langs.slice(0, 4).map(function (l) {
      return { name: l.name, pct: l.pct, color: langColor(l.name, p.a1), repos: m.all.filter(function (r) { return r.lang === l.name && r.created; }) };
    });
    if (!lines.length && m.all.length) lines = [{ name: "Code", pct: 100, color: p.a1, repos: m.all.filter(function (r) { return r.created; }) }];
    lines.forEach(function (ln) { ln.repos = ln.repos.sort(function (a, b) { return a.created < b.created ? -1 : 1; }).slice(-4); });
    lines = lines.filter(function (ln) { return ln.repos.length; });

    var out = [];
    var stations = lines.reduce(function (n, l) { return n + l.repos.length; }, 0);
    out.push('<text x="40" y="52" font-family="' + SANS + '" font-size="26" font-weight="900" letter-spacing="-0.5" fill="' + INK + '">' + esc(trunc(m.login, 30)) + " Metro</text>");
    var sub = "Network map " + (f.firstYear ? f.firstYear + " – " + f.lastYear + " · " : "") + lines.length + (lines.length === 1 ? " line" : " lines") + " · " + stations + (stations === 1 ? " station" : " stations") +
      (f.total !== null ? " · " + commas(f.total) + " journeys this year" : "");
    out.push('<text x="40" y="76" font-family="' + SANS + '" font-size="13" fill="' + MUTED + '">' + esc(sub) + "</text>");
    out.push('<g transform="translate(910 48)"><circle r="22" fill="' + on(BG, p.a2, 3) + '"/><rect x="-29" y="-6.5" width="58" height="13" fill="' + mix(p.a1, "#000000", 0.35) + '"/><text y="3.5" text-anchor="middle" font-family="' + SANS + '" font-size="8" font-weight="900" letter-spacing="1" fill="#ffffff">METRO</text></g>');

    var hubX = W - 160, top = 168, bottom = 446, yHub = (top + bottom) / 2;
    if (!lines.length) {
      out.push('<circle cx="' + W / 2 + '" cy="' + yHub + '" r="16" fill="' + STATION + '" stroke="' + INK + '" stroke-width="5"/>');
      out.push('<text x="' + W / 2 + '" y="' + (yHub + 44) + '" text-anchor="middle" font-family="' + SANS + '" font-size="15" font-weight="700" fill="' + INK + '">Network under construction</text>');
      return svgOpen(W, H, "Metro map for " + m.login) + out.join("") + "</svg>";
    }
    var gapY = lines.length > 1 ? (bottom - top) / (lines.length - 1) : 0;
    lines.forEach(function (ln, i) { ln.y = lines.length > 1 ? top + i * gapY : yHub; });
    var maxDy = Math.max.apply(null, lines.map(function (ln) { return Math.abs(ln.y - yHub); }));
    var x0 = 70, xEnd = hubX - maxDy - 60;

    // time runs left to right; the years are drawn as alternating zones
    function t(iso) { var d = new Date(iso + "T00:00:00Z"); return d.getUTCFullYear() + (d.getUTCMonth() + d.getUTCDate() / 31) / 12; }
    var all = [].concat.apply([], lines.map(function (ln) { return ln.repos; }));
    var y0 = Math.floor(Math.min.apply(null, all.map(function (r) { return t(r.created); })));
    var y1 = Math.floor(Math.max.apply(null, all.map(function (r) { return t(r.created); }))) + 1;
    var X = function (tt) { return x0 + (tt - y0) / (y1 - y0) * (xEnd - x0); };
    var span = X(y0 + 1) - X(y0), every = span >= 44 ? 1 : Math.ceil(44 / span);
    for (var yr = y0; yr < y1; yr++) {
      if ((yr - y0) % 2 === 0) out.push('<rect x="' + X(yr).toFixed(1) + '" y="100" width="' + span.toFixed(1) + '" height="380" fill="' + ZONE + '"/>');
      if ((yr - y0) % every === 0) out.push('<text x="' + (X(yr) + span / 2).toFixed(1) + '" y="120" text-anchor="middle" font-family="' + SANS + '" font-size="11" font-weight="700" letter-spacing="2" fill="' + MUTED + '">' + yr + "</text>");
    }

    // stations: by date, then nudged apart so their names never touch
    lines.forEach(function (ln) {
      ln.st = ln.repos.map(function (r) { return { r: r, x: X(t(r.created)) }; });
      for (var k = 1; k < ln.st.length; k++) ln.st[k].x = Math.max(ln.st[k].x, ln.st[k - 1].x + 124);
      for (k = ln.st.length - 1; k >= 0; k--) {
        ln.st[k].x = Math.min(ln.st[k].x, k === ln.st.length - 1 ? xEnd : ln.st[k + 1].x - 124);
        ln.st[k].x = Math.max(ln.st[k].x, x0 + 10);
      }
      var dy = Math.abs(ln.y - yHub);
      ln.path = "M" + (ln.st[0].x - 34).toFixed(1) + "," + ln.y + " H" + (hubX - dy).toFixed(1) + " L" + hubX + "," + yHub;
      ln.len = (hubX - dy - ln.st[0].x + 34) + dy * Math.SQRT2;
    });
    lines.forEach(function (ln) {
      out.push('<path d="' + ln.path + '" fill="none" stroke="' + ln.color + '" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/>');
    });
    // trains: each rides its line from the first station into the interchange, then starts again
    lines.forEach(function (ln, i) {
      var dur = Math.max(5, ln.len / 90).toFixed(1);
      [0, 0.5].forEach(function (phase) {
        out.push('<rect x="-13" y="-5" width="26" height="10" rx="5" fill="' + (S.dark ? S.ink : S.bg) + '" stroke="' + (S.dark ? S.bg : S.ink) + '" stroke-width="2"' +
          ' style="offset-path:path(\'' + ln.path + "');offset-distance:" + Math.round((phase + i * 0.17) % 1 * 100) + "%" + (p.anim ? ";animation-delay:-" + (dur * ((phase + i * 0.17) % 1)).toFixed(2) + "s;animation-duration:" + dur + "s" : "") + '"' +
          (p.anim ? ' class="tr"' : "") + "/>");
      });
    });
    lines.forEach(function (ln) {
      ln.st.forEach(function (s, k) {
        var above = k % 2 === 0, label = trunc(s.r.name, 17);
        out.push('<circle cx="' + s.x.toFixed(1) + '" cy="' + ln.y + '" r="8" fill="' + STATION + '" stroke="' + INK + '" stroke-width="3"/>');
        out.push('<text x="' + s.x.toFixed(1) + '" y="' + (ln.y + (above ? -17 : 28)) + '" text-anchor="middle" font-family="' + SANS + '" font-size="13" font-weight="600" fill="' + INK + '">' + esc(label) + "</text>");
      });
    });
    if (p.anim) [0, 1.2].forEach(function (dl) { out.push('<circle cx="' + hubX + '" cy="' + yHub + '" r="17" fill="none" stroke="' + INK + '" stroke-width="2" class="pu" style="transform-origin:' + hubX + "px " + yHub + "px;animation-delay:" + dl + 's"/>'); });
    out.push('<circle cx="' + hubX + '" cy="' + yHub + '" r="17" fill="' + STATION + '" stroke="' + INK + '" stroke-width="5"/>');
    out.push('<text x="' + (hubX + 28) + '" y="' + (yHub - 2) + '" font-family="' + SANS + '" font-size="14" font-weight="800" fill="' + INK + '">@' + esc(trunc(m.login, 12)) + "</text>");
    out.push('<text x="' + (hubX + 28) + '" y="' + (yHub + 15) + '" font-family="' + SANS + '" font-size="11" fill="' + MUTED + '">interchange</text>');

    // legend
    var lx = 40;
    lines.forEach(function (ln) {
      out.push('<rect x="' + lx + '" y="' + (H - 42) + '" width="30" height="10" rx="5" fill="' + ln.color + '"/>');
      out.push('<text x="' + (lx + 38) + '" y="' + (H - 32) + '" font-family="' + SANS + '" font-size="13" font-weight="700" fill="' + INK + '">' + esc(trunc(ln.name, 12)) + ' line <tspan font-weight="500" fill="' + MUTED + '">' + ln.pct + "%</tspan></text>");
      lx += 190;
    });
    var css = "@keyframes tr{from{offset-distance:0%}to{offset-distance:100%}}.tr{animation-name:tr;animation-timing-function:linear;animation-iteration-count:infinite}" +
      "@keyframes pu{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.6);opacity:0}}.pu{animation:pu 2.4s cubic-bezier(.2,.6,.3,1) infinite}";
    return svgOpen(W, H, "Metro map for " + m.login) + motion(p, css) + out.join("") + "</svg>";
  }

  /* ================= D. now playing (vinyl) ================= */
  function vinyl(m, o, p) {
    var f = facts(m, o), W = 960, H = 580, L = p.light;
    var S = kit(p), INK = S.ink, MUTED = S.muted, DIM = S.dim, PINK = S.a1, VINYL = S.dark ? mix(S.bg, "#000000", 0.55) : mix(S.ink, "#000000", 0.5);
    var LABEL = core.contrast(mix(p.a1, "#ffffff", 0.5), "#ffffff") > core.contrast(mix(p.a1, "#ffffff", 0.5), "#120c18") ? "#ffffff" : "#120c18";
    var COVER = core.contrast(p.a2, "#ffffff") >= 3 ? "#ffffff" : "#120c18";
    var vol = Math.max(1, (f.lastYear || 0) - (Number(m.since) || f.lastYear || 0) + 1);
    var big = f.total !== null ? commas(f.total) : commas(m.stars);
    var out = [];
    out.push("<defs>" +
      '<linearGradient id="cov" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + mix(p.a2, "#ffffff", 0.3) + '"/><stop offset="0.5" stop-color="' + p.a2 + '"/><stop offset="1" stop-color="' + p.a1 + '"/></linearGradient>' +
      '<radialGradient id="lab"><stop offset="0" stop-color="' + mix(p.a1, "#ffffff", 0.5) + '"/><stop offset="1" stop-color="' + p.a2 + '"/></radialGradient>' +
      '<linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0.3" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.16"/><stop offset="0.7" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '<filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#000" flood-opacity="' + S.shade + '"/></filter></defs>');
    // the record, half out of its sleeve, turning
    var cx = 400, cy = 220, ARM = mix(S.ink, S.bg, 0.25);
    out.push("<g" + (p.anim ? ' class="spin" style="transform-origin:' + cx + "px " + cy + 'px"' : "") + '><circle cx="' + cx + '" cy="' + cy + '" r="160" fill="' + VINYL + '"/>');
    for (var rr = 62; rr < 158; rr += 4) out.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + rr + '" fill="none" stroke="' + mix(VINYL, "#ffffff", 0.07) + '" stroke-width="1.4"/>');
    out.push('<circle cx="' + cx + '" cy="' + cy + '" r="54" fill="url(#lab)"/><text x="' + cx + '" y="' + (cy - 6) + '" text-anchor="middle" font-family="' + SANS + '" font-size="13" font-weight="900" fill="' + LABEL + '">SIDE A</text>' +
      '<text x="' + cx + '" y="' + (cy + 12) + '" text-anchor="middle" font-family="' + SANS + '" font-size="9" font-weight="700" fill="' + LABEL + '">' + esc(trunc(m.login, 12).toUpperCase()) + "</text>" +
      '<circle cx="' + cx + '" cy="' + cy + '" r="5" fill="' + VINYL + '"/></g>');
    out.push('<circle cx="' + cx + '" cy="' + cy + '" r="160" fill="url(#sheen)"/>');
    out.push("<g" + (p.anim ? ' class="arm" style="transform-origin:548px 86px"' : "") + ">" +
      '<path d="M548 86 L514 236 L494 262" fill="none" stroke="' + ARM + '" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<rect x="480" y="256" width="22" height="13" rx="3" fill="' + S.panel + '" stroke="' + ARM + '" stroke-width="2" transform="rotate(-50 491 262)"/></g>' +
      '<circle cx="548" cy="86" r="15" fill="' + S.panel + '" stroke="' + ARM + '" stroke-width="3"/><circle cx="548" cy="86" r="5" fill="' + ARM + '"/>');
    // the sleeve
    out.push('<rect x="40" y="60" width="320" height="320" rx="6" fill="url(#cov)" filter="url(#sh)"/><rect x="40" y="60" width="320" height="320" rx="6" fill="#000" fill-opacity="0.12"/>');
    out.push('<text x="62" y="104" font-family="' + SERIF + '" font-size="16" font-style="italic" fill="' + COVER + '">' + esc(trunc(m.name, 30)) + "</text>");
    out.push('<text x="56" y="262" font-family="' + SANS + '" font-size="' + fit(big, 104, 48, 290, 0.62) + '" font-weight="900" letter-spacing="-4" fill="' + COVER + '" fill-opacity="0.96">' + esc(big) + "</text>");
    out.push('<text x="62" y="292" font-family="' + SANS + '" font-size="12" font-weight="700" letter-spacing="2.4" fill="' + COVER + '">GREATEST HITS · VOL. ' + vol + "</text>");
    out.push('<text x="62" y="360" font-family="' + SANS + '" font-size="10" font-weight="700" letter-spacing="2" fill="' + COVER + '" fill-opacity="0.85">' +
      esc((m.since && f.lastYear ? m.since + "–" + f.lastYear + " · " : "") + f.projects.length + " TRACKS · SIDE A") + "</text>");

    // now playing
    var tx = 580;
    out.push('<text x="' + tx + '" y="80" font-family="' + SANS + '" font-size="11" font-weight="800" letter-spacing="3" fill="' + PINK + '">● NOW PLAYING</text>');
    out.push('<text x="' + tx + '" y="118" font-family="' + SERIF + '" font-size="27" font-weight="700" fill="' + INK + '">Greatest Hits, Vol. ' + vol + "</text>");
    var artist = m.name + (m.langs.length ? " · " + m.langs.slice(0, 4).map(function (l) { return l.name; }).join(" · ") : "");
    out.push('<text x="' + tx + '" y="144" font-family="' + SANS + '" font-size="14" fill="' + MUTED + '">' + esc(trunc(artist, 44)) + "</text>");
    out.push('<rect x="' + tx + '" y="164" width="340" height="4" rx="2" fill="' + S.line + '"/>');
    out.push('<rect x="' + tx + '" y="164" width="' + (p.anim ? 340 : 136) + '" height="4" rx="2" fill="' + PINK + '"' + (p.anim ? ' class="pg"' : "") + "/>");
    var first = f.projects[0];
    out.push('<text x="' + tx + '" y="188" font-family="' + SANS + '" font-size="11" fill="' + MUTED + '">' + esc(first ? trunc(first.name, 30) : "Intro") + "</text>");
    f.projects.slice(0, 4).forEach(function (r, i) {
      var y = 228 + i * 44;
      out.push('<text x="' + tx + '" y="' + y + '" font-family="' + SANS + '" font-size="13" font-weight="700" fill="' + (i ? DIM : PINK) + '">' + (i ? "0" + (i + 1) : "▶") + "</text>");
      out.push('<text x="' + (tx + 34) + '" y="' + (y - 2) + '" font-family="' + SANS + '" font-size="15" font-weight="700" fill="' + INK + '">' + esc(trunc(r.name, 28)) + "</text>");
      out.push('<text x="' + (tx + 34) + '" y="' + (y + 15) + '" font-family="' + SANS + '" font-size="12" fill="' + MUTED + '">' + esc(trunc(r.desc || r.lang || "", 44)) + "</text>");
      out.push('<text x="' + (tx + 340) + '" y="' + y + '" text-anchor="end" font-family="' + SANS + '" font-size="13" fill="' + MUTED + '">★' + esc(fmt(r.stars)) + "</text>");
    });

    // the equaliser: one bar per month of activity (or per language without it)
    var weekly = f.months.length < 6 && f.weeks.length >= 6, bars;
    if (weekly) bars = f.weeks.slice(-24).map(function (v, i, arr) { return { label: (arr.length - i) % 4 === 1 ? "W" + (i + 1) : "", v: v }; });
    else bars = f.months.length ? f.months : m.langs.map(function (l) { return { label: trunc(l.name, 6), v: l.pct }; });
    out.push('<text x="40" y="' + (H - 176) + '" font-family="' + SANS + '" font-size="11" font-weight="800" letter-spacing="2.4" fill="' + DIM + '">EQUALISER · ' +
      (weekly ? "CONTRIBUTIONS PER WEEK" : f.months.length ? "CONTRIBUTIONS PER MONTH" : "REPOS PER LANGUAGE") + "</text>");
    var max = Math.max.apply(null, bars.map(function (b) { return b.v; }).concat([1])), bw = (W - 80) / Math.max(1, bars.length), base = H - 46;
    bars.forEach(function (b, i) {
      var h = Math.max(6, b.v / max * 120), x = 40 + i * bw;
      out.push("<g" + (p.anim ? ' class="eq" style="transform-origin:' + (x + bw / 2).toFixed(1) + "px " + base + "px;animation-duration:" + (0.6 + (i * 37 % 7) / 10).toFixed(1) + "s;animation-delay:-" + (i * 0.13).toFixed(2) + 's"' : "") + ">" +
        '<rect x="' + (x + 6).toFixed(1) + '" y="' + (base - h).toFixed(1) + '" width="' + Math.max(4, bw - 12).toFixed(1) + '" height="' + h.toFixed(1) + '" rx="4" fill="url(#cov)"/></g>');
      out.push('<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (H - 24) + '" text-anchor="middle" font-family="' + SANS + '" font-size="11" font-weight="700" fill="' + DIM + '">' + esc(b.label) + "</text>");
    });
    var css = "@keyframes spin{to{transform:rotate(360deg)}}.spin{animation:spin 3.2s linear infinite}" +
      "@keyframes arm{0%,100%{transform:rotate(0)}50%{transform:rotate(.8deg)}}.arm{animation:arm 3.2s ease-in-out infinite}" +
      "@keyframes eq{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.45)}}.eq{animation:eq 1s ease-in-out infinite}" +
      "@keyframes pg{from{transform:scaleX(.15)}to{transform:scaleX(1)}}.pg{transform-box:fill-box;transform-origin:left center;animation:pg 9s linear infinite}";
    return svgOpen(W, H, "Now playing for " + m.login) + motion(p, css) + out.join("") + "</svg>";
  }

  /* ================= E. vital signs ================= */
  function vitals(m, o, p) {
    var f = facts(m, o), W = 960, H = 600, out = [];
    // the monitor's screen is a step of the README's own surface, and its traces are the README's accents
    var S = kit(p), SCREEN = S.dark ? mix(S.bg, "#000000", 0.45) : mix(S.bg, "#ffffff", 0.6);
    var GREEN = on(SCREEN, p.a1, 4.8), CYAN = on(SCREEN, p.a2, 4.8), YELLOW = on(SCREEN, mix(p.a1, p.a2, 0.5), 4.8), WHITE = on(SCREEN, S.ink, 7), GREY = on(SCREEN, mix(S.ink, SCREEN, 0.45), 4.5);
    var RULE = mix(SCREEN, S.ink, 0.14), HEART = on(SCREEN, mix(p.a1, "#ff4d5e", 0.55), 4);
    out.push("<defs>" +
      '<filter id="g" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '<linearGradient id="sw" x1="0" x2="1"><stop offset="0" stop-color="' + SCREEN + '" stop-opacity="0"/><stop offset="1" stop-color="' + SCREEN + '"/></linearGradient>' +
      '<clipPath id="tr"><rect x="40" y="90" width="620" height="460"/></clipPath></defs>');
    out.push('<rect x="14" y="14" width="' + (W - 28) + '" height="' + (H - 28) + '" rx="14" fill="' + SCREEN + '" stroke="' + RULE + '" stroke-width="2"/>');
    out.push('<text x="40" y="58" font-family="' + MONO + '" font-size="14" letter-spacing="1" fill="' + GREY + '"><tspan fill="' + HEART + '"' + (p.anim ? ' class="bk"' : "") + ">●</tspan> PATIENT: " +
      esc(trunc(m.name, 24).toUpperCase()) + " · BED " + m.publicRepos + (m.since ? " · ADMITTED " + m.since : "") + "</text>");
    var alive = f.streak > 0;
    out.push('<text x="' + (W - 40) + '" y="58" text-anchor="end" font-family="' + MONO + '" font-size="14" fill="' + (alive ? GREEN : YELLOW) + '">STATUS: ' + (alive ? "SHIPPING" : "RESTING") + "</text>");

    // traces: drawn twice as long as one loop, then slid left by exactly one loop
    function ecg(amps, base, period) {
      var d = "M0," + base, x = 0;
      amps.forEach(function (a) {
        d += " L" + (x + period * 0.35) + "," + base + " L" + (x + period * 0.4) + "," + (base - 6) + " L" + (x + period * 0.45) + "," + base +
          " L" + (x + period * 0.5) + "," + (base + 8) + " L" + (x + period * 0.55) + "," + (base - a).toFixed(1) + " L" + (x + period * 0.6) + "," + (base + 16) +
          " L" + (x + period * 0.66) + "," + base + " L" + (x + period * 0.8) + "," + (base - 10) + " L" + (x + period * 0.9) + "," + base;
        x += period;
      });
      return d + " L" + x + "," + base;
    }
    function wave(period, amp, base, n) {
      var d = "M0," + base;
      for (var k = 0; k < n; k++) {
        var x = k * period;
        d += " C" + (x + period * 0.25) + "," + (base - amp) + " " + (x + period * 0.35) + "," + (base - amp) + " " + (x + period * 0.5) + "," + base +
          " S" + (x + period * 0.85) + "," + (base + amp * 0.3) + " " + (x + period) + "," + base;
      }
      return d;
    }
    var series = f.months.length ? f.months.map(function (x) { return x.v; }) : [40, 55, 35, 60];
    var mx = Math.max.apply(null, series.concat([1]));
    var beat = series.map(function (v) { return 24 + v / mx * 46; });
    var loop = beat.length * 50, amps = [];
    while (amps.length * 50 < loop + 640) amps = amps.concat(beat);
    var traces = [
      { c: GREEN, label: "II  ECG · commits", d: ecg(amps, 200, 50), loop: loop, dur: loop / 110 },
      { c: CYAN, label: "PLETH · pull requests", d: wave(60, 38, 350, 18), loop: 300, dur: 3.6 },
      { c: YELLOW, label: "RESP · code reviews", d: wave(150, 24, 490, 8), loop: 300, dur: 6 }
    ];
    traces.forEach(function (t, i) {
      out.push('<text x="40" y="' + (110 + i * 140) + '" font-family="' + MONO + '" font-size="12" fill="' + t.c + '">' + esc(t.label) + "</text>");
      out.push('<g clip-path="url(#tr)"><g transform="translate(40 0)"><g' + (p.anim ? ' class="sc" style="animation-duration:' + t.dur.toFixed(2) + "s;animation-name:sc" + i + '"' : "") + ">" +
        '<path d="' + t.d + '" fill="none" stroke="' + t.c + '" stroke-width="2.4" filter="url(#g)"/></g></g></g>');
    });
    out.push('<rect x="600" y="90" width="60" height="460" fill="url(#sw)"/>');
    // the numbers
    var nums = [
      ["HR", f.streak !== null ? String(f.streak) : "--", "day streak", GREEN, true],
      ["PR", f.prs !== null && f.prs !== undefined ? fmt(f.prs) : fmt(m.followers), f.prs !== null && f.prs !== undefined ? "pull requests" : "followers", CYAN],
      ["RR", f.reviews ? fmt(f.reviews) : f.issues ? fmt(f.issues) : "--", f.reviews ? "code reviews" : "issues", YELLOW],
      ["NIBP", fmt(m.stars) + "/" + m.publicRepos, "stars / repos", WHITE]
    ];
    nums.forEach(function (n, i) {
      var y = 110 + i * 120, size = n[1].length <= 3 ? 66 : n[1].length <= 5 ? 54 : n[1].length <= 7 ? 42 : 32;
      out.push('<rect x="690" y="' + (y - 27) + '" width="250" height="2" fill="' + RULE + '"/>');
      out.push('<text x="700" y="' + (y - 4) + '" font-family="' + MONO + '" font-size="13" fill="' + n[3] + '">' + n[0] + "</text>");
      if (n[4]) out.push('<text x="930" y="' + (y - 2) + '" text-anchor="end" font-family="' + SANS + '" font-size="20" fill="' + HEART + '"' + (p.anim ? ' class="hb" style="transform-origin:921px ' + (y - 8) + 'px"' : "") + ">♥</text>");
      out.push('<text x="940" y="' + (y + 58) + '" text-anchor="end" font-family="' + MONO + '" font-size="' + size + '" font-weight="700" fill="' + n[3] + '" filter="url(#g)">' + esc(n[1]) + "</text>");
      out.push('<text x="700" y="' + (y + 80) + '" font-family="' + MONO + '" font-size="11" fill="' + GREY + '">' + n[2] + "</text>");
    });
    var rhythm = f.windowDays ? (f.active / f.windowDays >= 0.5 ? "regular" : f.active / f.windowDays >= 0.2 ? "steady" : "irregular") : "unknown";
    var prognosis = f.streak >= 7 ? "excellent" : f.streak > 0 ? "stable" : "needs a commit";
    var foot = (f.total !== null ? commas(f.total) + " contributions" + (f.windowDays >= 360 ? " in 12 months" : " in " + f.windowDays + " days") + " · " : "") +
      (f.peak && f.peak.v ? "peak: " + f.peak.label + " (" + f.peak.v + ") · " : "") + "rhythm: " + rhythm + " · prognosis: " + prognosis;
    out.push('<text x="40" y="' + (H - 34) + '" font-family="' + MONO + '" font-size="12" fill="' + GREY + '">' + esc(trunc(foot, 100)) + "</text>");
    var css = traces.map(function (t, i) { return "@keyframes sc" + i + "{to{transform:translateX(-" + t.loop + "px)}}"; }).join("") +
      ".sc{animation-timing-function:linear;animation-iteration-count:infinite}" +
      "@keyframes hb{0%,100%{transform:scale(1)}15%{transform:scale(1.35)}30%{transform:scale(1)}}.hb{animation:hb .9s ease-in-out infinite}" +
      "@keyframes bk{50%{opacity:.2}}.bk{animation:bk 1s steps(2) infinite}";
    return svgOpen(W, H, "Vital signs for " + m.login) + motion(p, css) + out.join("") + "</svg>";
  }

  /* ================= F. code garden ================= */
  function garden(m, o, p) {
    var f = facts(m, o), r = rng(core.hash(m.login + "garden")), W = 960, H = 600, S = kit(p), day = !S.dark, out = [];
    // the sky is the README's own surface, deepening into the second accent; the sun or moon glows in the first
    var LEAF = mix("#4caf50", p.a2, 0.4), LEAF2 = mix(LEAF, "#000000", 0.2), ORB = mix(p.a1, "#ffffff", day ? 0.45 : 0.7);
    out.push("<defs>" +
      '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + S.bg + '" stop-opacity="0"/><stop offset="0.7" stop-color="' + mix(S.bg, p.a2, 0.14) + '" stop-opacity="0.8"/><stop offset="1" stop-color="' + mix(S.bg, p.a2, 0.24) + '"/></linearGradient>' +
      '<radialGradient id="glow"><stop offset="0" stop-color="' + ORB + '"/><stop offset="0.55" stop-color="' + mix(p.a1, "#ffffff", 0.3) + '" stop-opacity="0.6"/><stop offset="1" stop-color="' + p.a1 + '" stop-opacity="0"/></radialGradient></defs>');
    out.push('<g><rect width="' + W + '" height="' + H + '" fill="url(#sky)"/>');
    if (day) {
      out.push('<circle cx="850" cy="90" r="80" fill="url(#glow)"/><circle cx="850" cy="90" r="32" fill="' + ORB + '"/>');
      [[120, 150, 1], [520, 110, 0.8]].forEach(function (c, i) {
        out.push("<g" + (p.anim ? ' class="cl" style="animation-duration:' + (40 + i * 18) + 's"' : "") + ' fill="' + mix(p.a2, "#ffffff", 0.82) + '" fill-opacity="0.9">' +
          '<ellipse cx="' + c[0] + '" cy="' + c[1] + '" rx="' + 60 * c[2] + '" ry="' + 18 * c[2] + '"/><circle cx="' + (c[0] - 18 * c[2]) + '" cy="' + (c[1] - 14 * c[2]) + '" r="' + 22 * c[2] + '"/><circle cx="' + (c[0] + 16 * c[2]) + '" cy="' + (c[1] - 18 * c[2]) + '" r="' + 26 * c[2] + '"/></g>');
      });
    } else {
      for (var i = 0; i < 55; i++) {
        out.push('<circle cx="' + Math.round(r() * W) + '" cy="' + Math.round(r() * 300) + '" r="' + (r() * 1.4 + 0.4).toFixed(1) + '" fill="#ffffff"' +
          (p.anim ? ' class="tw" style="animation-duration:' + (1.5 + r() * 3).toFixed(1) + "s;animation-delay:-" + (r() * 3).toFixed(1) + 's"' : "") + "/>");
      }
      out.push('<circle cx="850" cy="90" r="70" fill="url(#glow)"/><circle cx="850" cy="90" r="30" fill="' + ORB + '"/>');
    }
    var title = S.ink, sub = S.muted;
    out.push('<text x="40" y="62" font-family="' + SERIF + '" font-size="34" font-weight="700" fill="' + title + '">' + esc(trunc(firstName(m), 20)) + "’s code garden</text>");
    var plants = f.projects.slice().sort(function (a, b) { return b.stars - a.stars; }).slice(0, 6);
    var line = (f.total !== null ? commas(f.total) + " seeds planted" : commas(m.all.length) + " seeds planted") +
      (f.streak ? " · watered " + f.streak + (f.streak === 1 ? " day" : " days") + " in a row" : "") + " · " + plants.length + (plants.length === 1 ? " plant" : " plants") + " in bloom";
    out.push('<text x="40" y="90" font-family="' + SANS + '" font-size="14" fill="' + sub + '">' + esc(line) + "</text>");
    out.push('<path d="M0,500 C200,470 400,490 600,478 S860,470 960,486 V600 H0Z" fill="' + mix(LEAF, S.bg, day ? 0.3 : 0.62) + '"/>');
    out.push('<path d="M0,530 C240,510 520,526 960,512 V600 H0Z" fill="' + mix(LEAF2, S.bg, day ? 0.15 : 0.7) + '"/>');

    // one flower per project: taller and bigger with more stars, coloured by language
    var maxS = Math.max.apply(null, plants.map(function (x) { return x.stars; }).concat([1]));
    plants.forEach(function (pl, k) {
      var x = Math.round(80 + (k + 0.5) * (W - 160) / plants.length), base = 506;
      var g = Math.log(1 + pl.stars) / Math.log(1 + maxS), h = 70 + 190 * g, pet = 9 + 9 * g, fy = base - h, col = langColor(pl.lang, p.a1);
      var s = '<path d="M' + x + "," + base + " C" + (x - 8) + "," + (base - h * 0.4).toFixed(1) + " " + (x + 8) + "," + (base - h * 0.7).toFixed(1) + " " + x + "," + fy.toFixed(1) + '" stroke="' + LEAF + '" stroke-width="4" fill="none"/>';
      for (var l = 1; l < 4; l++) {
        var ly = (base - h * l / 4).toFixed(1), dir = l % 2 ? 1 : -1;
        s += '<path d="M' + x + "," + ly + " q" + dir * 22 + ",-14 " + dir * 34 + ",-2 q" + (-dir * 14) + ",12 " + (-dir * 34) + ',2z" fill="' + LEAF2 + '"/>';
      }
      for (var a = 0; a < 6; a++) {
        var ang = a * Math.PI / 3, px = (x + Math.cos(ang) * pet).toFixed(1), py = (fy + Math.sin(ang) * pet).toFixed(1);
        s += '<ellipse cx="' + px + '" cy="' + py + '" rx="' + (pet * 0.75).toFixed(1) + '" ry="' + (pet * 0.45).toFixed(1) + '" transform="rotate(' + a * 60 + " " + px + " " + py + ')" fill="' + col + '"/>';
      }
      s += '<circle cx="' + x + '" cy="' + fy.toFixed(1) + '" r="' + (pet * 0.55).toFixed(1) + '" fill="' + ORB + '"/>';
      out.push("<g" + (p.anim ? ' class="sw" style="transform-origin:' + x + "px " + base + "px;animation-duration:" + (3.2 + k * 0.4).toFixed(1) + "s;animation-delay:-" + (k * 0.7).toFixed(1) + 's"' : "") + ">" + s + "</g>");
      out.push('<rect x="' + (x - 2) + '" y="' + (base + 8) + '" width="4" height="26" fill="' + S.line + '"/><rect x="' + (x - 56) + '" y="' + (base + 14) + '" width="112" height="30" rx="4" fill="' + S.panel + '" stroke="' + S.line + '" stroke-width="2"/>');
      out.push('<text x="' + x + '" y="' + (base + 28) + '" text-anchor="middle" font-family="' + SANS + '" font-size="' + fit(pl.name, 11.5, 8, 100, 0.6) + '" font-weight="800" fill="' + on(S.panel, S.ink, 7) + '">' + esc(trunc(pl.name, 20)) + "</text>");
      out.push('<text x="' + x + '" y="' + (base + 40) + '" text-anchor="middle" font-family="' + SANS + '" font-size="10" font-weight="700" fill="' + on(S.panel, p.a1, 4.5) + '">★ ' + esc(fmt(pl.stars)) + "</text>");
    });
    if (!plants.length) out.push('<text x="' + W / 2 + '" y="440" text-anchor="middle" font-family="' + SERIF + '" font-size="20" font-style="italic" fill="' + title + '">Freshly planted. Push a repo and watch it grow.</text>');

    // the grass is the contribution graph: two blades per week, taller in busier weeks
    var weeks = f.weeks.length ? f.weeks.slice(-52) : [];
    var wmax = Math.max.apply(null, weeks.concat([1])), blades = Math.max(52, weeks.length) * 2, bw = (W - 30) / blades;
    for (var b = 0; b < blades; b++) {
      var v = weeks.length ? weeks[Math.floor(b / 2 * weeks.length / (blades / 2))] / wmax : 0.25 + r() * 0.15;
      var gx = (15 + b * bw).toFixed(1), gh = (8 + v * 32 + r() * 4).toFixed(1), lean = (r() * 6 - 3).toFixed(1);
      var shade = v > 0.66 ? mix(LEAF, "#ffffff", 0.3) : v > 0.33 ? LEAF : LEAF2;
      out.push('<path d="M' + gx + ",586 q2,-" + (gh / 2).toFixed(1) + " " + lean + ",-" + gh + " q2," + (gh / 2).toFixed(1) + " 4," + gh + 'z" fill="' + shade + '"' +
        (p.anim ? ' class="sw" style="transform-origin:' + gx + "px 586px;animation-duration:" + (2 + r() * 2).toFixed(1) + 's"' : "") + "/>");
    }
    out.push('<text x="40" y="112" font-family="' + SANS + '" font-size="12" font-style="italic" fill="' + sub + '">The grass along the bottom is your contribution graph: taller blades, busier weeks.</text>');
    // fireflies at night, drifting pollen by day
    for (var j = 0; j < 10; j++) {
      out.push('<circle cx="' + Math.round(80 + r() * 800) + '" cy="' + Math.round(300 + r() * 170) + '" r="' + (day ? 2 : 2.6) + '" fill="' + (day ? mix(p.a1, "#ffffff", 0.6) : mix(p.a1, "#fff59a", 0.5)) + '"' +
        (p.anim ? ' class="ff" style="animation-duration:' + (4 + r() * 4).toFixed(1) + "s;animation-delay:-" + (r() * 4).toFixed(1) + 's"' : ' opacity="0.7"') + "/>");
    }
    out.push("</g>");
    var css = "@keyframes sw{0%,100%{transform:rotate(-2.5deg)}50%{transform:rotate(2.5deg)}}.sw{animation:sw 3s ease-in-out infinite}" +
      "@keyframes ff{0%{transform:translate(0,0);opacity:.2}25%{opacity:1}50%{transform:translate(40px,-30px);opacity:.4}75%{opacity:1}100%{transform:translate(0,0);opacity:.2}}.ff{animation:ff 6s ease-in-out infinite}" +
      "@keyframes tw{50%{opacity:.15}}.tw{animation:tw 3s ease-in-out infinite}" +
      "@keyframes cl{from{transform:translateX(-200px)}to{transform:translateX(1100px)}}.cl{animation:cl 50s linear infinite}";
    return svgOpen(W, H, "Code garden for " + m.login) + motion(p, css) + out.join("") + "</svg>";
  }

  /* ================= G. year in code ================= */
  function yearcode(m, o, p) {
    var f = facts(m, o), r = rng(core.hash(m.login + "year")), W = 960, H = 620, out = [];
    var year = f.endYear || "", top = m.langs[0];
    // a personality from when the work happens
    var weekTotal = f.weekdays.reduce(function (t, v) { return t + v; }, 0), persona;
    if (!weekTotal) persona = { t: "The Explorer", d: "Just getting started. The best is ahead." };
    else if (f.longest >= 30) persona = { t: "The Streak Machine", d: "Shows up every single day." };
    else if ((f.weekdays[0] + f.weekdays[6]) / weekTotal > 0.35) persona = { t: "The Weekend Warrior", d: "Ships while everyone else is out." };
    else {
      var wi = f.weekdays.indexOf(Math.max.apply(null, f.weekdays));
      persona = { t: "The " + DAYS[wi] + " Titan", d: "Does their best work on " + DAYS[wi] + "s." };
    }
    function lite(c) { var x = c, t = 0; while (core.contrast(x, "#1a0b2a") < 7.5 && t < 0.95) { t += 0.05; x = mix(c, "#ffffff", t); } return x; }
    var S = kit(p), TC = [lite(p.a1), lite(p.a2), lite(mix(p.a1, "#ffd23f", 0.45)), lite(mix(p.a2, "#ff5fa2", 0.4)), lite(mix(p.a1, p.a2, 0.5)), lite(mix(p.a1, "#ffffff", 0.6))];
    var tiles = [
      { k: "Contributions", v: f.total !== null ? commas(f.total) : commas(m.all.length), s: f.total !== null ? (f.windowDays >= 360 ? "in the past year" : "in " + f.windowDays + " days") : "public repos", c: TC[0] },
      { k: "Top language", v: top ? top.name : "—", s: top ? top.pct + "% of your repos" : "no languages yet", c: TC[1] },
      { k: "Busiest month", v: f.peak && f.peak.v ? f.peak.label : "—", s: f.peak && f.peak.v ? commas(f.peak.v) + " contributions" : "quiet so far", c: TC[2] },
      { k: "Longest streak", v: f.longest !== null ? String(f.longest) : "—", s: f.longest === 1 ? "day in a row" : "days in a row", c: TC[3] },
      { k: "Best day", v: f.best ? f.best.label : "—", s: f.best ? f.best.v + " contributions on a " + f.best.day : "still to come", c: TC[4] },
      { k: "Your coding personality", v: persona.t, s: persona.d, c: TC[5] }
    ];
    out.push("<defs>" +
      '<filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40"/></filter>' +
      '<filter id="ts" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000" flood-opacity="' + (S.dark ? 0.35 : 0.14) + '"/></filter></defs>');
    out.push("<g>");
    [[150, 120, TC[1]], [820, 90, TC[0]], [700, 560, TC[2]], [120, 560, TC[3]]].forEach(function (b, i) {
      out.push("<g" + (p.anim ? ' class="bl" style="animation-duration:' + (14 + i * 3) + "s;animation-delay:-" + i * 2 + 's"' : "") + '><circle cx="' + b[0] + '" cy="' + b[1] + '" r="150" fill="' + b[2] + '" opacity="' + (S.dark ? 0.3 : 0.22) + '" filter="url(#blur)"/></g>');
    });
    // confetti
    var CONF = [TC[0], TC[1], TC[2], TC[5], TC[3]];
    for (var c = 0; c < 26; c++) {
      var cx = Math.round(r() * W), cy = Math.round(r() * H), rot = Math.round(r() * 180);
      out.push("<g" + (p.anim ? ' class="cf" style="animation-duration:' + (6 + r() * 6).toFixed(1) + "s;animation-delay:-" + (r() * 10).toFixed(1) + 's"' : "") + '><rect x="' + cx + '" y="' + cy + '" width="8" height="4" rx="1" fill="' + CONF[c % 5] + '" opacity="0.8" transform="rotate(' + rot + " " + cx + " " + cy + ')"/></g>');
    }
    out.push('<text x="44" y="64" font-family="' + SANS + '" font-size="13" font-weight="800" letter-spacing="3.4" fill="' + S.a1 + '">YOUR ' + esc(year) + " IN CODE · @" + esc(trunc(m.login, 24).toUpperCase()) + "</text>");
    var head = trunc(firstName(m), 18) + ", what a year.";
    out.push('<text x="42" y="118" font-family="' + SANS + '" font-size="' + fit(head, 50, 30, 860, 0.56) + '" font-weight="900" letter-spacing="-1.5" fill="' + S.ink + '">' + esc(head) + "</text>");
    tiles.forEach(function (t, i) {
      var col = i % 3, row = Math.floor(i / 3), x = 44 + col * 296, y = 156 + row * 222, rot = [-1.5, 1, -0.5, 1.2, -1, 0.8][i];
      var big = t.v.length <= 8 ? 56 : fit(t.v, 40, 22, 236, 0.58);
      out.push('<g transform="rotate(' + rot + " " + (x + 136) + " " + (y + 98) + ')"><g' + (p.anim ? ' class="pop" style="transform-origin:' + (x + 136) + "px " + (y + 98) + "px;animation-delay:-" + (i * 0.6).toFixed(1) + 's"' : "") + ">" +
        '<rect x="' + x + '" y="' + y + '" width="272" height="196" rx="22" fill="' + t.c + '" filter="url(#ts)"/>' +
        '<text x="' + (x + 22) + '" y="' + (y + 36) + '" font-family="' + SANS + '" font-size="12" font-weight="800" letter-spacing="2" fill="#1a0b2a" fill-opacity="0.7">' + esc(t.k.toUpperCase()) + "</text>" +
        '<text x="' + (x + 20) + '" y="' + (y + 112) + '" font-family="' + SANS + '" font-size="' + big + '" font-weight="900" letter-spacing="-1.5" fill="#1a0b2a">' + esc(trunc(t.v, 20)) + "</text>" +
        wrap(t.s, 34, 2).map(function (l, j) { return '<text x="' + (x + 22) + '" y="' + (y + 150 + j * 18) + '" font-family="' + SANS + '" font-size="14" font-weight="600" fill="#1a0b2a" fill-opacity="0.78">' + esc(l) + "</text>"; }).join("") +
        "</g></g>");
    });
    out.push("</g>");
    var css = "@keyframes bl{0%,100%{transform:translate(0,0)}50%{transform:translate(60px,-40px)}}.bl{animation:bl 16s ease-in-out infinite}" +
      "@keyframes cf{from{transform:translateY(-" + H + "px)}to{transform:translateY(" + H + "px)}}.cf{animation:cf 9s linear infinite}" +
      "@keyframes pop{0%,100%{transform:scale(1)}50%{transform:scale(1.025)}}.pop{animation:pop 3.6s ease-in-out infinite}";
    return svgOpen(W, H, "Year in code for " + m.login) + motion(p, css) + out.join("") + "</svg>";
  }

  /* ================= H. the daily commit (newspaper) ================= */
  function newspaper(m, o, p) {
    var S = kit(p), f = facts(m, o), W = 960, H = 660, out = [], INK = S.ink, PAPER = S.bg, FADE = S.muted, RED = on(S.bg, p.a1, 4.5);
    var top = f.projects[0], vol = Math.max(1, (f.endYear || 0) - (Number(m.since) || f.endYear || 0) + 1);
    var d = f.newest ? new Date(f.newest + "T00:00:00Z") : null;
    var dateline = d && !isNaN(d) ? DAYS[d.getUTCDay()].toUpperCase() + ", " + MONTHS[d.getUTCMonth()].toUpperCase() + " " + d.getUTCDate() + ", " + d.getUTCFullYear() : "LATE EDITION";
    out.push("<defs>" +
      '<pattern id="grain" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.6" fill="' + INK + '" fill-opacity="0.06"/><circle cx="4" cy="4" r="0.5" fill="' + INK + '" fill-opacity="0.04"/></pattern></defs>');
    out.push('<g><rect width="' + W + '" height="' + H + '" fill="url(#grain)"/>');
    // masthead
    out.push('<rect x="40" y="30" width="' + (W - 80) + '" height="3" fill="' + INK + '"/>');
    // in the Broadsheet world the banner is already the masthead, so this page is its front page
    out.push('<text x="' + W / 2 + '" y="92" text-anchor="middle" font-family="' + SERIF + '" font-size="58" font-weight="700" letter-spacing="-1" fill="' + INK + '">' + (o.world === "broadsheet" ? "Front Page" : "The Daily Commit") + "</text>");
    out.push('<rect x="40" y="108" width="' + (W - 80) + '" height="1" fill="' + INK + '"/><rect x="40" y="134" width="' + (W - 80) + '" height="3" fill="' + INK + '"/>');
    out.push('<g font-family="' + SERIF + '" font-size="12" font-weight="700" letter-spacing="1.4" fill="' + INK + '"><text x="44" y="126">VOL. ' + vol + " · No. " + esc(commas(f.total !== null ? f.total : m.publicRepos)) + '</text><text x="' + W / 2 + '" y="126" text-anchor="middle">' + esc(dateline) + '</text><text x="' + (W - 44) + '" y="126" text-anchor="end">PRICE: ONE PULL REQUEST</text></g>');
    // headline
    var headline = (trunc(m.name, 24) + " ships " + (f.total !== null ? commas(f.total) + " contributions" : m.all.length + " repos")).toUpperCase();
    out.push('<text x="' + W / 2 + '" y="188" text-anchor="middle" font-family="' + SERIF + '" font-size="' + fit(headline, 42, 22, 860, 0.74) + '" font-weight="700" letter-spacing="-0.5" fill="' + INK + '">' + esc(headline) + "</text>");
    var sub = (f.role ? f.role.replace(/[.!]+$/, "") + ". " : "") + (top ? "Sources say " + top.name + " is drawing a crowd" + (top.stars ? " with " + commas(top.stars) + (top.stars === 1 ? " star." : " stars.") : ".") : "Quiet desk, big plans.");
    out.push('<text x="' + W / 2 + '" y="218" text-anchor="middle" font-family="' + SERIF + '" font-size="' + fit(trunc(sub, 120), 17, 13, 860, 0.5) + '" font-style="italic" fill="' + FADE + '">' + esc(trunc(sub, 120)) + "</text>");
    out.push('<rect x="40" y="236" width="' + (W - 80) + '" height="1" fill="' + INK + '"/>');
    // column 1: the halftone "photo" of the year
    out.push('<rect x="40" y="252" width="300" height="200" fill="' + S.zone + '"/>');
    var daily = f.daily.slice(-26 * 7), mx = Math.max.apply(null, daily.concat([1]));
    for (var i = 0; i < 26 * 7; i++) {
      var v = daily.length ? daily[Math.max(0, daily.length - 26 * 7 + i)] || 0 : (core.hash(m.login + i) % 4);
      var col = i % 13, row = Math.floor(i / 13), rad = v ? 1.8 + (v / (daily.length ? mx : 3)) * 4.2 : 0.9;
      out.push('<circle cx="' + (58 + col * 22).toFixed(1) + '" cy="' + (266 + row * 13.4).toFixed(1) + '" r="' + rad.toFixed(1) + '" fill="' + INK + '" fill-opacity="' + (v ? 0.85 : 0.18) + '"/>');
    }
    out.push('<text x="40" y="472" font-family="' + SERIF + '" font-size="12" font-style="italic" fill="' + FADE + '">FIG. 1: Half a year, one dot per day.</text>');
    out.push('<text x="40" y="504" font-family="' + SERIF + '" font-size="15" font-weight="700" fill="' + INK + '">IN BRIEF</text>');
    var brief = [];
    if (f.streak) brief.push("Streak reaches " + f.streak + (f.streak === 1 ? " day" : " days") + ".");
    if (f.peak && f.peak.v) brief.push(f.peak.label + " was the busiest month on record.");
    if (m.langs[0]) brief.push(m.langs[0].name + " leads the language polls at " + m.langs[0].pct + "%.");
    if (m.followers) brief.push(commas(m.followers) + " readers now follow the column.");
    brief.slice(0, 4).forEach(function (b, k) { out.push('<text x="40" y="' + (528 + k * 21) + '" font-family="' + SERIF + '" font-size="13.5" fill="' + INK + '">▪ ' + esc(trunc(b, 44)) + "</text>"); });
    out.push('<rect x="356" y="252" width="1" height="340" fill="' + INK + '" fill-opacity="0.4"/><rect x="666" y="252" width="1" height="340" fill="' + INK + '" fill-opacity="0.4"/>');
    // column 2: the lead story
    out.push('<text x="374" y="276" font-family="' + SERIF + '" font-size="12" font-weight="700" letter-spacing="1.6" fill="' + RED + '">LEAD STORY</text>');
    out.push('<text x="374" y="304" font-family="' + SERIF + '" font-size="' + (top ? fit(top.name, 26, 15, 276, 0.56) : 24) + '" font-weight="700" fill="' + INK + '">' + esc(top ? trunc(top.name, 30) : "A blank page") + "</text>");
    var story = top ? (top.desc ? top.desc.replace(/\.$/, "") + ". " : "") + (top.lang ? "Written in " + top.lang + ", it " : "It ") + "has " + commas(top.stars) + (top.stars === 1 ? " star" : " stars") + " and " + commas(top.forks) + (top.forks === 1 ? " fork" : " forks") + " to its name" + (top.pushed ? ", with the latest change in " + MONTHS[Number(top.pushed.slice(5, 7)) - 1] + " " + top.pushed.slice(0, 4) : "") + ". " +
      (f.projects[1] ? "Also on the desk: " + f.projects[1].name + (f.projects[2] ? " and " + f.projects[2].name : "") + "." : "") : "No public repositories yet. Reporters are standing by for the first push.";
    var lines = wrap(story, 42, 9);
    lines.forEach(function (l, k) { out.push('<text x="374" y="' + (332 + k * 20) + '" font-family="' + SERIF + '" font-size="14.5" fill="' + INK + '">' + esc(l) + "</text>"); });
    var im = top ? core.impactFor(o, top) : [];
    if (im.length) {
      var iy = 332 + lines.length * 20 + 14;
      out.push('<text x="374" y="' + iy + '" font-family="' + SERIF + '" font-size="12" font-weight="700" letter-spacing="1.6" fill="' + RED + '">BY THE NUMBERS</text>');
      im.forEach(function (x, k) { out.push('<text x="' + (374 + k * 96) + '" y="' + (iy + 30) + '" font-family="' + SERIF + '" font-size="22" font-weight="700" fill="' + INK + '">' + esc(trunc(x.value, 8)) + '</text><text x="' + (374 + k * 96) + '" y="' + (iy + 46) + '" font-family="' + SERIF + '" font-size="11" fill="' + FADE + '">' + esc(trunc(x.label, 14)) + "</text>"); });
    }
    // column 3: markets, weather, classifieds
    var y3 = 276;
    out.push('<text x="684" y="' + y3 + '" font-family="' + SERIF + '" font-size="12" font-weight="700" letter-spacing="1.6" fill="' + RED + '">MARKETS</text>');
    [["Stars", m.stars], ["Followers", m.followers], ["Repos", m.publicRepos], ["PRs", f.prs]].forEach(function (row, k) {
      if (row[1] === null || row[1] === undefined) return;
      var yy = y3 + 26 + k * 24;
      out.push('<text x="684" y="' + yy + '" font-family="' + SERIF + '" font-size="15" fill="' + INK + '">' + row[0] + '</text><text x="918" y="' + yy + '" text-anchor="end" font-family="' + MONO + '" font-size="14" font-weight="700" fill="' + S.a2 + '">▲ ' + esc(fmt(row[1])) + "</text>");
    });
    y3 += 136;
    out.push('<rect x="684" y="' + (y3 - 18) + '" width="236" height="1" fill="' + INK + '" fill-opacity="0.4"/>');
    var chance = f.windowDays ? Math.round(f.active / f.windowDays * 100) : 0;
    out.push('<text x="684" y="' + (y3 + 4) + '" font-family="' + SERIF + '" font-size="12" font-weight="700" letter-spacing="1.6" fill="' + RED + '">WEATHER</text>');
    out.push('<text x="684" y="' + (y3 + 34) + '" font-family="' + SERIF + '" font-size="26" font-weight="700" fill="' + INK + '">' + chance + "%</text>");
    out.push('<text x="740" y="' + (y3 + 32) + '" font-family="' + SERIF + '" font-size="13.5" fill="' + INK + '">chance of commits</text>');
    y3 += 70;
    out.push('<rect x="684" y="' + (y3 - 18) + '" width="236" height="1" fill="' + INK + '" fill-opacity="0.4"/>');
    out.push('<text x="684" y="' + (y3 + 4) + '" font-family="' + SERIF + '" font-size="12" font-weight="700" letter-spacing="1.6" fill="' + RED + '">CLASSIFIEDS</text>');
    var ad = core.oneLine(o.openTo) ? "AVAILABLE: " + core.oneLine(o.openTo) + ". Serious offers only. Contact @" + m.login + "." : "COLLABORATORS WANTED for " + (top ? top.name : "new projects") + ". Apply within: @" + m.login + ".";
    wrap(ad, 34, 4).forEach(function (l, k) { out.push('<text x="684" y="' + (y3 + 28 + k * 18) + '" font-family="' + SERIF + '" font-size="13" fill="' + INK + '">' + esc(l) + "</text>"); });
    // the EXTRA stamp and the ticker
    out.push("<g" + (p.anim ? ' class="ex" style="transform-origin:860px 72px"' : "") + '><g transform="rotate(-12 860 72)"><rect x="806" y="48" width="108" height="46" rx="6" fill="' + S.panel + '" stroke="' + RED + '" stroke-width="3"/><text x="860" y="81" text-anchor="middle" font-family="' + SERIF + '" font-size="26" font-weight="700" fill="' + RED + '">EXTRA!</text></g></g>');
    var tick = ("BREAKING ▸ " + [top ? top.name + " passes " + commas(top.stars) + " stars" : "", f.streak ? "streak hits " + f.streak + " days" : "", m.langs[0] ? m.langs[0].name + " remains the language of choice" : "", "follow @" + m.login + " for the next edition"].filter(Boolean).join(" ▸ ") + "   ").toUpperCase();
    while (tick.length < 110) tick += tick;
    var tl = Math.round(tick.length * 8.4), ty = H - 40;
    out.push('<rect x="0" y="' + ty + '" width="' + W + '" height="40" fill="' + INK + '"/>');
    out.push("<g" + (p.anim ? ' class="tk"' : "") + ' font-family="' + MONO + '" font-size="14" font-weight="700" fill="' + PAPER + '">' +
      [0, tl].map(function (x) { return '<text x="' + x + '" y="' + (ty + 26) + '" textLength="' + tl + '" lengthAdjust="spacingAndGlyphs" xml:space="preserve">' + esc(tick) + "</text>"; }).join("") + "</g>");
    out.push("</g>");
    var css = "@keyframes ex{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}.ex{animation:ex 1.6s ease-in-out infinite}" +
      "@keyframes tk{to{transform:translateX(-" + tl + "px)}}.tk{animation:tk " + Math.round(tl / 60) + "s linear infinite}";
    return svgOpen(W, H, "The Daily Commit for " + m.login) + motion(p, css) + out.join("") + "</svg>";
  }

  /* ================= I. passport ================= */
  function passport(m, o, p) {
    // the pages are a step of the README's surface, printed in its text colour; the cover is the second accent
    var S = kit(p), f = facts(m, o), W = 960, H = 600, out = [], INK = S.ink, PAGE = S.dark ? mix(S.bg, S.ink, 0.07) : mix(S.bg, "#ffffff", 0.7);
    var words = String(m.name).trim().split(/\s+/), surname = (words.length > 1 ? words[words.length - 1] : m.name), given = words.length > 1 ? words.slice(0, -1).join(" ") : m.login;
    var no = "GH" + ("0000000" + (core.hash(m.login) % 10000000)).slice(-7);
    out.push("<defs>" +
      '<pattern id="gu" width="40" height="16" patternUnits="userSpaceOnUse"><path d="M0 8 Q10 0 20 8 T40 8" fill="none" stroke="' + p.a2 + '" stroke-opacity="0.2"/><path d="M0 12 Q10 4 20 12 T40 12" fill="none" stroke="' + p.a1 + '" stroke-opacity="0.15"/></pattern>' +
      '<linearGradient id="holo" x1="0" y1="0" x2="1" y2="0.3"><stop offset="0.3" stop-color="' + p.a1 + '" stop-opacity="0"/><stop offset="0.45" stop-color="' + p.a2 + '" stop-opacity="0.3"/><stop offset="0.55" stop-color="' + p.a1 + '" stop-opacity="0.25"/><stop offset="0.7" stop-color="' + p.a2 + '" stop-opacity="0"/></linearGradient>' +
      '<clipPath id="lp"><rect x="60" y="50" width="420" height="500" rx="10"/></clipPath>' +
      '<filter id="sh" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#000" flood-opacity="' + S.shade + '"/></filter></defs>');
    out.push('<rect x="52" y="42" width="856" height="516" rx="16" fill="' + mix(p.a2, "#000000", 0.62) + '" filter="url(#sh)"/>');
    out.push('<rect x="60" y="50" width="420" height="500" rx="10" fill="' + PAGE + '"/><rect x="480" y="50" width="420" height="500" rx="10" fill="' + PAGE + '"/>');
    out.push('<rect x="60" y="50" width="840" height="500" fill="url(#gu)"/><rect x="478" y="50" width="4" height="500" fill="#000" fill-opacity="0.12"/>');
    // the photo page
    out.push('<text x="84" y="84" font-family="' + SANS + '" font-size="12" font-weight="800" letter-spacing="2.6" fill="' + INK + '">GITHUB · PASSPORT · PASSEPORT</text>');
    out.push('<rect x="84" y="104" width="128" height="160" rx="6" fill="' + mix(PAGE, p.a2, 0.14) + '" stroke="' + INK + '" stroke-opacity="0.3"/>');
    out.push('<circle cx="148" cy="164" r="34" fill="' + mix(PAGE, INK, 0.2) + '"/><path d="M98 264 Q148 196 198 264Z" fill="' + mix(PAGE, INK, 0.2) + '"/>');
    out.push('<text x="148" y="176" text-anchor="middle" font-family="' + SANS + '" font-size="30" font-weight="900" fill="' + INK + '">' + esc(core.initials(m)) + "</text>");
    var fields = [["Type / Type", "P"], ["Code", "GH"], ["Passport No.", no], ["Surname / Nom", trunc(surname, 20).toUpperCase()], ["Given names / Prénoms", trunc(given, 22).toUpperCase()],
      ["Nationality", "OPEN SOURCE"], ["Date of issue", m.since ? "01 JAN " + m.since : "—"], ["Profession", trunc((f.role || "Developer").toUpperCase(), 22)]];
    fields.forEach(function (x, i) {
      var fx = i < 3 ? 232 + (i % 3) * 82 : 232, fy = i < 3 ? 116 : 116 + (i - 2) * 30;
      if (i < 3 && i > 0) fx = 232 + i * 72;
      out.push('<text x="' + fx + '" y="' + fy + '" font-family="' + SANS + '" font-size="8.5" fill="' + INK + '" fill-opacity="0.6">' + x[0] + "</text>");
      out.push('<text x="' + fx + '" y="' + (fy + 14) + '" font-family="' + MONO + '" font-size="12.5" font-weight="700" fill="' + INK + '">' + esc(x[1]) + "</text>");
    });
    out.push('<text x="84" y="296" font-family="' + SANS + '" font-size="8.5" fill="' + INK + '" fill-opacity="0.6">Signature of bearer</text>');
    out.push('<text x="84" y="324" font-family="' + SERIF + '" font-size="26" font-style="italic" fill="' + on(PAGE, p.a2, 4.5) + '">' + esc(trunc(m.name, 24)) + "</text>");
    out.push('<text x="84" y="364" font-family="' + SANS + '" font-size="8.5" fill="' + INK + '" fill-opacity="0.6">Languages spoken</text>');
    out.push('<text x="84" y="380" font-family="' + MONO + '" font-size="12.5" font-weight="700" fill="' + INK + '">' + esc(trunc(m.langs.map(function (l) { return l.name.toUpperCase(); }).join(", ") || "—", 44)) + "</text>");
    // machine-readable zone
    function mrz(s, n) { s = String(s).toUpperCase().replace(/[^A-Z0-9]+/g, "<"); return (s + "<".repeat(n)).slice(0, n); }
    var l1 = mrz("P<GHB" + surname + "<<" + given, 40), l2 = mrz(no + "<OSS" + (m.since || "0000") + "<" + m.publicRepos + "R<" + m.stars + "S", 40);
    out.push('<rect x="72" y="452" width="396" height="80" rx="4" fill="' + INK + '" fill-opacity="0.05"/>');
    out.push('<text x="84" y="484" font-family="' + MONO + '" font-size="14.5" textLength="372" lengthAdjust="spacingAndGlyphs" fill="' + INK + '">' + esc(l1) + '</text><text x="84" y="514" font-family="' + MONO + '" font-size="14.5" textLength="372" lengthAdjust="spacingAndGlyphs" fill="' + INK + '">' + esc(l2) + "</text>");
    out.push('<g clip-path="url(#lp)"><rect x="-300" y="50" width="900" height="500" fill="url(#holo)" style="mix-blend-mode:' + (S.dark ? "screen" : "multiply") + '"' + (p.anim ? ' class="hl"' : "") + "/></g>");
    // the visa page: one stamp per language, plus the entry stamp
    out.push('<text x="504" y="84" font-family="' + SANS + '" font-size="12" font-weight="800" letter-spacing="2.6" fill="' + INK + '">VISAS · ENTRIES · ' + (m.langs.length) + "</text>");
    var stamps = m.langs.slice(0, 6).map(function (l) {
      var rs = m.all.filter(function (x) { return x.lang === l.name; }), yrs = rs.map(function (x) { return String(x.created).slice(0, 4); }).filter(Boolean).sort();
      return { t: l.name.toUpperCase(), a: "ENTRY " + (yrs[0] || "—"), b: rs.length + (rs.length === 1 ? " REPO" : " REPOS"), c: on(PAGE, langColor(l.name, p.a1), 3.5) };
    });
    stamps.push({ t: "ADMITTED", a: m.since ? "SINCE " + m.since : "WELCOME", b: "@" + trunc(m.login, 14).toUpperCase(), c: on(PAGE, p.a1, 4), round: true });
    stamps.forEach(function (st, i) {
      var cx = 590 + (i % 3) * 112, cy = 160 + Math.floor(i / 3) * 128 + (i % 2) * 14, rot = [-12, 8, -4, 14, -9, 5, -16][i % 7], shape = st.round || i % 3 === 0 ? "c" : i % 3 === 1 ? "r" : "o";
      var g = '<g transform="rotate(' + rot + " " + cx + " " + cy + ')" fill="none" stroke="' + st.c + '" stroke-width="2.4" opacity="0.88">';
      if (shape === "c") g += '<circle cx="' + cx + '" cy="' + cy + '" r="48"/><circle cx="' + cx + '" cy="' + cy + '" r="42" stroke-width="1"/>';
      else if (shape === "r") g += '<rect x="' + (cx - 54) + '" y="' + (cy - 34) + '" width="108" height="68" rx="6"/><rect x="' + (cx - 49) + '" y="' + (cy - 29) + '" width="98" height="58" rx="4" stroke-width="1"/>';
      else g += '<ellipse cx="' + cx + '" cy="' + cy + '" rx="56" ry="38"/>';
      g += '<text x="' + cx + '" y="' + (cy - 6) + '" text-anchor="middle" stroke="none" fill="' + st.c + '" font-family="' + SANS + '" font-size="' + fit(st.t, 14, 8, 80, 0.66) + '" font-weight="900" letter-spacing="1">' + esc(trunc(st.t, 14)) + "</text>" +
        '<text x="' + cx + '" y="' + (cy + 10) + '" text-anchor="middle" stroke="none" fill="' + st.c + '" font-family="' + MONO + '" font-size="9.5" font-weight="700">' + esc(st.a) + "</text>" +
        '<text x="' + cx + '" y="' + (cy + 23) + '" text-anchor="middle" stroke="none" fill="' + st.c + '" font-family="' + MONO + '" font-size="8.5">' + esc(st.b) + "</text></g>";
      out.push("<g" + (p.anim ? ' class="st" style="transform-origin:' + cx + "px " + cy + "px;animation-delay:" + (i * 1.1).toFixed(1) + "s;animation-duration:" + (stamps.length * 1.1 + 2).toFixed(1) + 's"' : "") + ">" + g + "</g>");
    });
    var css = "@keyframes hl{0%{transform:translateX(-200px)}100%{transform:translateX(560px)}}.hl{animation:hl 6s ease-in-out infinite alternate}" +
      "@keyframes st{0%{transform:scale(1);opacity:1}3%{transform:scale(1.35);opacity:0}8%{transform:scale(.94);opacity:1}11%,100%{transform:scale(1);opacity:1}}.st{animation:st 9s ease-out infinite}";
    return svgOpen(W, H, "Passport for " + m.login) + motion(p, css) + out.join("") + "</svg>";
  }

  /* ================= J. constellation sky ================= */
  function constellation(m, o, p) {
    // the sky is the README's surface: light stars on a dark one, an inked star chart on a light one
    var S = kit(p), f = facts(m, o), r = rng(core.hash(m.login + "sky")), W = 960, H = 580, out = [], STAR = S.dark ? "#ffffff" : S.a2;
    out.push("<defs>" +
      '<radialGradient id="sky" cx="0.5" cy="0.35" r="0.85"><stop offset="0" stop-color="' + mix(S.bg, p.a2, 0.2) + '"/><stop offset="1" stop-color="' + S.bg + '" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="star"><stop offset="0" stop-color="' + STAR + '"/><stop offset="0.4" stop-color="' + STAR + '" stop-opacity="0.7"/><stop offset="1" stop-color="' + STAR + '" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="shoot" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + STAR + '" stop-opacity="0"/><stop offset="1" stop-color="' + STAR + '"/></linearGradient></defs>');
    out.push('<g><rect width="' + W + '" height="' + H + '" fill="url(#sky)"/>');
    out.push('<path d="M-40 420 Q300 300 520 360 T1000 240" fill="none" stroke="' + p.a2 + '" stroke-opacity="0.08" stroke-width="90"/>');
    out.push("<g" + (p.anim ? ' class="dr"' : "") + ">");
    for (var i = 0; i < 110; i++) {
      out.push('<circle cx="' + Math.round(r() * W) + '" cy="' + Math.round(r() * H) + '" r="' + (r() * 1.2 + 0.3).toFixed(1) + '" fill="' + S.ink + '" fill-opacity="' + (0.3 + r() * 0.6).toFixed(2) + '"' +
        (p.anim && i % 3 === 0 ? ' class="tw" style="animation-duration:' + (2 + r() * 3).toFixed(1) + "s;animation-delay:-" + (r() * 3).toFixed(1) + 's"' : "") + "/>");
    }
    out.push("</g>");
    out.push('<text x="40" y="56" font-family="' + SERIF + '" font-size="30" font-weight="700" fill="' + S.ink + '">The ' + esc(trunc(m.login, 24)) + " sky</text>");
    var groups = m.langs.slice(0, 5).map(function (l) { return { lang: l.name, repos: m.all.filter(function (x) { return x.lang === l.name; }).sort(function (a, b) { return b.stars - a.stars; }).slice(0, 6) }; }).filter(function (g) { return g.repos.length; });
    var mapped = groups.reduce(function (t, g) { return t + g.repos.length; }, 0), brightest = m.top[0];
    out.push('<text x="40" y="82" font-family="' + SANS + '" font-size="13" fill="' + S.muted + '">' + esc(groups.length + (groups.length === 1 ? " constellation" : " constellations") + " · " + mapped + " stars mapped" + (brightest ? " · brightest: " + trunc(brightest.name, 26) : "")) + "</text>");
    var maxS = Math.max.apply(null, m.all.map(function (x) { return x.stars; }).concat([1]));
    var CENTRES = [[230, 270], [500, 200], [760, 300], [360, 450], [680, 470]];
    groups.forEach(function (g, gi) {
      var c = CENTRES[gi], col = on(S.bg, S.dark ? core.mixHex(langColor(g.lang, p.a1), "#ffffff", 0.35) : langColor(g.lang, p.a1), 3.2), pts = g.repos.map(function (repo, k) {
        var ang = (k / g.repos.length) * Math.PI * 2 + r() * 0.8, rad = g.repos.length === 1 ? 0 : 55 + r() * 45;
        return { x: c[0] + Math.cos(ang) * rad * 1.3, y: c[1] + Math.sin(ang) * rad * 0.8, repo: repo, size: 2.5 + 5 * Math.log(1 + repo.stars) / Math.log(1 + maxS) };
      });
      // a constellation needs a shape: small unnamed companions make up at least four points
      for (var extra = pts.length; extra < 4; extra++) {
        var ang2 = (extra / 4) * Math.PI * 2 + 0.6 + r() * 0.6, rad2 = 60 + r() * 40;
        pts.push({ x: c[0] + Math.cos(ang2) * rad2 * 1.3, y: c[1] + Math.sin(ang2) * rad2 * 0.8, repo: null, size: 1.6 });
      }
      pts.forEach(function (pt) { pt.x = Math.max(40, Math.min(W - 40, pt.x)); pt.y = Math.max(110, Math.min(H - 40, pt.y)); });
      out.push('<path d="M' + pts.map(function (pt) { return pt.x.toFixed(1) + "," + pt.y.toFixed(1); }).join(" L") + 'Z" fill="none" stroke="' + col + '" stroke-opacity="0.4" stroke-width="1.2"/>');
      pts.forEach(function (pt, k) {
        if (pt.repo) out.push('<circle cx="' + pt.x.toFixed(1) + '" cy="' + pt.y.toFixed(1) + '" r="' + (pt.size * 3).toFixed(1) + '" fill="url(#star)" opacity="0.5"' + (p.anim ? ' class="tw" style="animation-duration:' + (2.5 + k * 0.4).toFixed(1) + 's"' : "") + "/>");
        out.push('<circle cx="' + pt.x.toFixed(1) + '" cy="' + pt.y.toFixed(1) + '" r="' + pt.size.toFixed(1) + '" fill="' + col + '"/>');
        if (k === 0) out.push('<text x="' + (pt.x + pt.size + 6).toFixed(1) + '" y="' + (pt.y + 4).toFixed(1) + '" font-family="' + SANS + '" font-size="11.5" fill="' + S.ink + '" fill-opacity="0.85">' + esc(trunc(pt.repo.name, 18)) + " ★" + fmt(pt.repo.stars) + "</text>");
      });
      var low = pts.reduce(function (b, pt) { return pt.y > b.y ? pt : b; }, pts[0]);
      out.push('<text x="' + c[0] + '" y="' + Math.min(H - 18, low.y + 30).toFixed(1) + '" text-anchor="middle" font-family="' + SERIF + '" font-size="15" font-style="italic" letter-spacing="1.5" fill="' + col + '">' + esc(trunc(g.lang, 14)) + (g.repos.length >= 3 ? " Major" : " Minor") + "</text>");
    });
    if (!groups.length) out.push('<text x="' + W / 2 + '" y="320" text-anchor="middle" font-family="' + SERIF + '" font-size="20" font-style="italic" fill="' + S.ink + '">A clear sky. Your first repo will be its first star.</text>');
    out.push("<g" + (p.anim ? ' class="sh"' : ' opacity="0"') + '><line x1="0" y1="0" x2="120" y2="40" stroke="url(#shoot)" stroke-width="2" stroke-linecap="round" transform="translate(120 100)"/></g>');
    out.push("</g>");
    var css = "@keyframes tw{50%{opacity:.2}}.tw{animation:tw 3s ease-in-out infinite}" +
      "@keyframes dr{0%,100%{transform:translate(0,0)}50%{transform:translate(-28px,12px)}}.dr{animation:dr 40s ease-in-out infinite}" +
      "@keyframes sh{0%,82%{transform:translate(0,0);opacity:0}84%{opacity:1}92%{transform:translate(520px,170px);opacity:0}100%{opacity:0}}.sh{animation:sh 7s ease-in infinite}";
    return svgOpen(W, H, "Constellation sky for " + m.login) + motion(p, css) + out.join("") + "</svg>";
  }

  /* ================= K. commit forecast ================= */
  function weather(m, o, p) {
    var f = facts(m, o), W = 960, H = 560, out = [], L = p.light;
    // the sky is the README's surface; the sun is the first accent, the clouds the second, the radar a deeper step of the surface
    var S = kit(p), INK = S.ink, SOFT = S.muted, SCOPE = S.dark ? mix(S.bg, "#000000", 0.4) : mix(S.bg, S.ink, 0.05);
    var RG = on(SCOPE, p.a1, 4.5), CLOUD = S.dark ? mix("#ffffff", p.a2, 0.12) : mix(p.a2, "#ffffff", 0.6), RAY = mix(p.a1, "#ffffff", 0.2);
    var chance = f.windowDays ? Math.round(f.active / f.windowDays * 100) : 0;
    var last7 = f.daily.slice(-7), q = f.daily.filter(function (v) { return v > 0; }).sort(function (a, b) { return a - b; }), mid = q.length ? q[Math.floor(q.length / 2)] : 1;
    function kind(v) { return !v ? "moon" : v < mid ? "cloud" : v < mid * 2 ? "part" : "sun"; }
    var today = kind(last7.length ? Math.max(last7[last7.length - 1], last7[last7.length - 2] || 0) : 0);
    var cond = { sun: "Sunny with scattered pull requests", part: "Partly cloudy, steady commits", cloud: "Overcast, light commits", moon: "Clear and quiet" }[today];
    out.push("<defs>" +
      '<linearGradient id="sk" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="' + mix(S.bg, p.a2, 0.16) + '"/><stop offset="1" stop-color="' + S.bg + '" stop-opacity="0"/></linearGradient>' +
      '<radialGradient id="sun"><stop offset="0" stop-color="' + mix(p.a1, "#ffffff", 0.7) + '"/><stop offset="0.6" stop-color="' + RAY + '"/><stop offset="1" stop-color="' + p.a1 + '"/></radialGradient>' +
      '<radialGradient id="rd"><stop offset="0" stop-color="' + mix(SCOPE, p.a1, 0.14) + '"/><stop offset="1" stop-color="' + SCOPE + '"/></radialGradient>' +
      '<linearGradient id="sw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + RG + '" stop-opacity="0"/><stop offset="1" stop-color="' + RG + '" stop-opacity="0.55"/></linearGradient>' +
      '<clipPath id="rc"><circle cx="760" cy="392" r="122"/></clipPath></defs>');
    out.push('<g><rect width="' + W + '" height="' + H + '" fill="url(#sk)"/>');
    function icon(k, x, y, s, cls) {
      var g = "";
      if (k === "sun" || k === "part") {
        g += "<g" + (p.anim && cls ? ' class="rays" style="transform-origin:' + x + "px " + y + 'px"' : "") + ">";
        for (var a = 0; a < 8; a++) g += '<rect x="' + (x - 2 * s) + '" y="' + (y - 34 * s) + '" width="' + 4 * s + '" height="' + 12 * s + '" rx="' + 2 * s + '" fill="' + RAY + '" transform="rotate(' + a * 45 + " " + x + " " + y + ')"/>';
        g += '</g><circle cx="' + x + '" cy="' + y + '" r="' + 18 * s + '" fill="url(#sun)"/>';
      }
      if (k === "moon") g += '<circle cx="' + x + '" cy="' + y + '" r="' + 18 * s + '" fill="' + mix(p.a1, "#ffffff", 0.75) + '"/><circle cx="' + (x + 9 * s) + '" cy="' + (y - 6 * s) + '" r="' + 15 * s + '" fill="' + S.bg + '"/>';
      if (k === "cloud" || k === "part") {
        var cx = x + (k === "part" ? 14 * s : 0), cy = y + (k === "part" ? 12 * s : 0);
        g += "<g" + (p.anim && cls ? ' class="cl"' : "") + ' fill="' + CLOUD + '" fill-opacity="0.95"><ellipse cx="' + cx + '" cy="' + (cy + 8 * s) + '" rx="' + 26 * s + '" ry="' + 12 * s + '"/><circle cx="' + (cx - 10 * s) + '" cy="' + cy + '" r="' + 12 * s + '"/><circle cx="' + (cx + 8 * s) + '" cy="' + (cy - 4 * s) + '" r="' + 15 * s + '"/></g>';
      }
      return g;
    }
    out.push('<text x="44" y="62" font-family="' + SANS + '" font-size="14" font-weight="700" letter-spacing="2" fill="' + SOFT + '">⌖ @' + esc(trunc(m.login, 24).toUpperCase()) + " · COMMIT FORECAST</text>");
    out.push(icon(today, 120, 168, 2.2, true));
    out.push('<text x="230" y="196" font-family="' + SANS + '" font-size="96" font-weight="200" letter-spacing="-4" fill="' + INK + '">' + chance + '<tspan font-size="48" dy="-36">%</tspan></text>');
    out.push('<text x="44" y="268" font-family="' + SANS + '" font-size="22" font-weight="700" fill="' + INK + '">' + esc(cond) + "</text>");
    out.push('<text x="44" y="296" font-family="' + SANS + '" font-size="15" fill="' + SOFT + '">' + esc("Chance of commits on any given day · High " + (f.best ? f.best.v : 0) + " · Streak " + (f.streak || 0) + (f.streak === 1 ? " day" : " days")) + "</text>");
    // forecast discussion
    out.push('<rect x="44" y="330" width="560" height="1" fill="' + INK + '" fill-opacity="0.2"/>');
    out.push('<text x="44" y="358" font-family="' + SANS + '" font-size="12" font-weight="800" letter-spacing="2" fill="' + SOFT + '">FORECAST DISCUSSION</text>');
    var disc = "Expect " + (m.langs[0] ? m.langs[0].name : "code") + " activity to continue" + (f.projects[0] ? ", centred on " + f.projects[0].name : "") + ". " +
      (f.peak && f.peak.v ? f.peak.label + " brought the heaviest downpour on record (" + commas(f.peak.v) + "). " : "") + (f.streak >= 7 ? "A long warm spell is under way." : f.streak ? "Conditions are improving." : "A quiet front; a fresh push could break it.");
    wrap(disc, 70, 4).forEach(function (l, k) { out.push('<text x="44" y="' + (386 + k * 22) + '" font-family="' + SANS + '" font-size="15" fill="' + INK + '" fill-opacity="0.9">' + esc(l) + "</text>"); });
    // seven-day strip
    out.push('<rect x="628" y="52" width="292" height="182" rx="16" fill="' + S.panel + '" fill-opacity="0.75"/>');
    out.push('<text x="648" y="80" font-family="' + SANS + '" font-size="12" font-weight="800" letter-spacing="2" fill="' + SOFT + '">LAST 7 DAYS</text>');
    var a = m.activity, start = a && Date.parse(a.start + "T00:00:00Z");
    (last7.length ? last7 : [0, 0, 0, 0, 0, 0, 0]).forEach(function (v, k, arr) {
      var x = 668 + k * 40, idx = f.daily.length - arr.length + k, day = a && !isNaN(start) ? DAYS[new Date(start + idx * 86400000).getUTCDay()].slice(0, 2) : "";
      out.push('<text x="' + x + '" y="108" text-anchor="middle" font-family="' + SANS + '" font-size="12" font-weight="700" fill="' + INK + '">' + day + "</text>");
      out.push(icon(kind(v), x, 150, 0.48, false));
      out.push('<text x="' + x + '" y="212" text-anchor="middle" font-family="' + SANS + '" font-size="15" font-weight="700" fill="' + INK + '">' + v + "</text>");
    });
    // radar: the last 12 weeks as echoes on a sweep
    out.push('<circle cx="760" cy="392" r="122" fill="url(#rd)"/>');
    [40, 80, 120].forEach(function (rr) { out.push('<circle cx="760" cy="392" r="' + rr + '" fill="none" stroke="' + RG + '" stroke-opacity="0.25"/>'); });
    out.push('<path d="M638 392H882M760 270V514" stroke="' + RG + '" stroke-opacity="0.2"/>');
    var weeks = f.weeks.slice(-12), wmax = Math.max.apply(null, weeks.concat([1]));
    weeks.forEach(function (v, k) {
      if (!v) return;
      var ang = (k / 12) * Math.PI * 2 - Math.PI / 2, rad = 30 + (k % 3) * 30, x = 760 + Math.cos(ang) * rad, y = 392 + Math.sin(ang) * rad, t = v / wmax;
      var turn = (((ang % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2);
      out.push('<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (6 + t * 12).toFixed(1) + '" fill="' + (t > 0.66 ? on(SCOPE, p.a2, 3) : t > 0.33 ? on(SCOPE, mix(p.a1, p.a2, 0.5), 3) : RG) + '" fill-opacity="0.55"' +
        (p.anim ? ' class="bp" style="transform-origin:' + x.toFixed(1) + "px " + y.toFixed(1) + "px;animation-delay:" + (turn * 4).toFixed(2) + 's"' : "") + "/>");
    });
    out.push('<g clip-path="url(#rc)"><g' + (p.anim ? ' class="sweep" style="transform-origin:760px 392px"' : "") + '><path d="M760 392 L882 392 A122 122 0 0 0 846 306 Z" fill="url(#sw)"/><line x1="760" y1="392" x2="882" y2="392" stroke="' + RG + '" stroke-width="2"/></g></g>');
    out.push('<text x="760" y="540" text-anchor="middle" font-family="' + SANS + '" font-size="11" font-weight="700" letter-spacing="1.6" fill="' + SOFT + '">RADAR · LAST 12 WEEKS</text>');
    out.push("</g>");
    var css = "@keyframes rays{to{transform:rotate(360deg)}}.rays{animation:rays 24s linear infinite}" +
      "@keyframes cl{0%,100%{transform:translateX(0)}50%{transform:translateX(14px)}}.cl{animation:cl 6s ease-in-out infinite}" +
      "@keyframes sweep{to{transform:rotate(360deg)}}.sweep{animation:sweep 4s linear infinite}" +
      "@keyframes bp{0%{opacity:1;transform:scale(1.3)}35%,100%{opacity:.35;transform:scale(1)}}.bp{animation:bp 4s ease-out infinite}";
    return svgOpen(W, H, "Commit forecast for " + m.login) + motion(p, css) + out.join("") + "</svg>";
  }

  /** A smooth path through points (Catmull-Rom as cubic Béziers). */
  function smooth(pts) {
    if (!pts.length) return "";
    var d = "M" + pts[0][0].toFixed(1) + "," + pts[0][1].toFixed(1);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += " C" + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + "," + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + " " +
        (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + "," + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + " " + p2[0].toFixed(1) + "," + p2[1].toFixed(1);
    }
    return d;
  }

  /* ================= L. pulse (the classic look's own scene) ================= */
  function pulse(m, o, p) {
    var f = facts(m, o), S = kit(p), W = 960, H = 520, out = [];
    var series = f.weeks.length >= 4 ? f.weeks.slice(-52) : f.months.length >= 2 ? f.months.map(function (x) { return x.v; }) : [];
    var x0 = 40, x1 = W - 40, base = 452, top = 286, mx = Math.max.apply(null, series.concat([1]));
    var pts = series.map(function (v, i) { return [x0 + (series.length === 1 ? 0 : i / (series.length - 1)) * (x1 - x0), base - 8 - v / mx * (base - top)]; });
    var line = smooth(pts);
    out.push("<defs>" +
      '<linearGradient id="ln" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + S.a1 + '"/><stop offset="1" stop-color="' + S.a2 + '"/></linearGradient>' +
      '<linearGradient id="ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + S.a1 + '" stop-opacity="0.32"/><stop offset="1" stop-color="' + S.a2 + '" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="scan" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + S.ink + '" stop-opacity="0"/><stop offset="0.5" stop-color="' + S.ink + '" stop-opacity="0.07"/><stop offset="1" stop-color="' + S.ink + '" stop-opacity="0"/></linearGradient>' +
      '<filter id="gw" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>');

    // header: a live dot, the handle, the name and the role
    out.push('<circle cx="46" cy="50" r="4.5" fill="' + S.a1 + '" filter="url(#gw)"' + (p.anim ? ' class="lf-plv"' : "") + "/>");
    out.push('<text x="60" y="55" font-family="' + MONO + '" font-size="13" font-weight="600" letter-spacing="3" fill="' + S.a1 + '">PULSE · @' + esc(trunc(m.login, 26).toUpperCase()) + "</text>");
    var name = trunc(m.name, 26);
    out.push('<text x="40" y="112" font-family="' + SANS + '" font-size="' + fit(name, 44, 26, 520, 0.58) + '" font-weight="800" letter-spacing="-1" fill="' + S.ink + '">' + esc(name) + "</text>");
    if (f.role) out.push('<text x="40" y="142" font-family="' + SANS + '" font-size="16" fill="' + S.muted + '">' + esc(trunc(f.role, 60)) + "</text>");
    // languages as pills
    var lx = 40;
    m.langs.slice(0, 4).forEach(function (l) {
      var label = trunc(l.name, 14) + " " + l.pct + "%", w = Math.round(label.length * 7.4 + 34);
      out.push('<g><rect x="' + lx + '" y="166" width="' + w + '" height="28" rx="14" fill="' + S.ink + '" fill-opacity="0.06" stroke="' + S.line + '"/>' +
        '<circle cx="' + (lx + 16) + '" cy="180" r="5" fill="' + langColor(l.name, S.a1) + '"/>' +
        '<text x="' + (lx + 28) + '" y="185" font-family="' + SANS + '" font-size="13" font-weight="600" fill="' + S.ink + '">' + esc(label) + "</text></g>");
      lx += w + 10;
    });
    // headline numbers, right-aligned
    var nums = [];
    if (f.total !== null) nums.push([commas(f.total), f.windowDays >= 360 ? "contributions this year" : "contributions"]);
    if (f.streak !== null) nums.push([String(f.streak), f.streak === 1 ? "day streak" : "day streak"]);
    nums.push([fmt(m.stars), "stars earned"]);
    nums.slice(0, 3).forEach(function (n, i) {
      var y = 76 + i * 64;
      out.push('<text x="' + (W - 40) + '" y="' + y + '" text-anchor="end" font-family="' + SANS + '" font-size="36" font-weight="800" letter-spacing="-1" fill="' + (i ? S.ink : S.a1) + '">' + esc(n[0]) + "</text>");
      out.push('<text x="' + (W - 40) + '" y="' + (y + 20) + '" text-anchor="end" font-family="' + SANS + '" font-size="12" letter-spacing="1.4" fill="' + S.muted + '">' + esc(n[1].toUpperCase()) + "</text>");
    });

    // the waveform: weekly contributions as one glowing line over a soft fill, with a gridline every quarter of the peak
    [0.25, 0.5, 0.75, 1].forEach(function (k) { out.push('<rect x="' + x0 + '" y="' + (base - 8 - k * (base - top)).toFixed(1) + '" width="' + (x1 - x0) + '" height="1" fill="' + S.line + '" fill-opacity="0.5"/>'); });
    out.push('<rect x="' + x0 + '" y="' + base + '" width="' + (x1 - x0) + '" height="1" fill="' + S.line + '"/>');
    if (pts.length >= 2) {
      out.push('<path d="' + line + " L" + x1 + "," + base + " L" + x0 + "," + base + 'Z" fill="url(#ar)"/>');
      out.push('<path d="' + line + '" fill="none" stroke="url(#ln)" stroke-width="3" stroke-linecap="round" filter="url(#gw)"/>');
      // the busiest week, marked
      var pk = 0;
      series.forEach(function (v, i) { if (v > series[pk]) pk = i; });
      var px = pts[pk][0], py = pts[pk][1], right = px > W - 200;
      out.push('<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="7" fill="none" stroke="' + S.a2 + '" stroke-width="2" stroke-opacity="0.5"' + (p.anim ? ' class="lf-ppk" style="transform-origin:' + px.toFixed(1) + "px " + py.toFixed(1) + 'px"' : "") + "/>");
      out.push('<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="5" fill="' + S.a2 + '"/>');
      out.push('<text x="' + (px + (right ? -12 : 12)).toFixed(1) + '" y="' + (py - 10).toFixed(1) + '" text-anchor="' + (right ? "end" : "start") + '" font-family="' + SANS + '" font-size="12" font-weight="700" fill="' + S.a2 + '">PEAK · ' + commas(series[pk]) + (f.weeks.length >= 4 ? " IN A WEEK" : " IN A MONTH") + "</text>");
      // a bright point travels the line, and a soft scan sweeps across
      out.push('<circle r="5" fill="' + S.ink + '" filter="url(#gw)" style="offset-path:path(\'' + line + "');offset-distance:62%\"" + (p.anim ? ' class="lf-prn"' : "") + "/>");
      out.push('<rect x="-160" y="' + (top - 20) + '" width="160" height="' + (base - top + 20) + '" fill="url(#scan)"' + (p.anim ? ' class="lf-psc"' : "") + "/>");
    } else {
      out.push('<text x="' + W / 2 + '" y="' + (base - 60) + '" text-anchor="middle" font-family="' + SANS + '" font-size="18" fill="' + S.muted + '">The pulse starts with the first commit.</text>');
    }
    // months along the base
    if (f.months.length >= 2) f.months.forEach(function (mo, i, arr) {
      if (arr.length > 8 && i % 2) return;
      out.push('<text x="' + (x0 + i / (arr.length - 1) * (x1 - x0)).toFixed(1) + '" y="' + (base + 24) + '" text-anchor="' + (i === 0 ? "start" : i === arr.length - 1 ? "end" : "middle") + '" font-family="' + MONO + '" font-size="11" letter-spacing="1.2" fill="' + S.dim + '">' + mo.label.toUpperCase() + "</text>");
    });
    var css = "@keyframes plv{0%,100%{opacity:1}50%{opacity:.25}}.lf-plv{animation:plv 1.6s ease-in-out infinite}" +
      "@keyframes prn{from{offset-distance:0%}to{offset-distance:100%}}.lf-prn{animation:prn 9s linear infinite}" +
      "@keyframes psc{from{transform:translateX(0)}to{transform:translateX(" + (W + 160) + "px)}}.lf-psc{animation:psc 6s ease-in-out infinite}" +
      "@keyframes ppk{0%{transform:scale(1);opacity:.9}100%{transform:scale(2.8);opacity:0}}.lf-ppk{animation:ppk 2.2s ease-out infinite}";
    return svgOpen(W, H, "Pulse for " + m.login) + motion(p, css) + out.join("") + "</svg>";
  }

  /* ================= M. ink scroll (the Ink world's own scene) ================= */
  function scroll(m, o, p) {
    var f = facts(m, o), S = kit(p), r = rng(core.hash(m.login + "scroll")), W = 960, H = 560, out = [];
    var SEAL = S.a1, SEAL_TEXT = S.onA1;
    // the mountains are the year: far ridges from the months, the near ridge from the weeks
    // each value is a peak, with a saddle between neighbours, so the ridge reads as mountains rather than hills
    function ridgeLine(values, base, height, seed, xs) {
      var rr = rng(seed), mx = Math.max.apply(null, values.concat([1])), n = values.length, span = (W + 40 - xs * 2) / Math.max(1, n), pts = [[-20, base - height * 0.1]];
      values.forEach(function (v, i) {
        var x = xs + (i + 0.5) * span, h = (0.22 + 0.78 * v / mx) * height;
        pts.push([x - span * (0.3 + rr() * 0.12), base - h * (0.3 + rr() * 0.15)]);
        pts.push([x + (rr() - 0.5) * span * 0.2, base - h]);
      });
      pts.push([W + 20, base - height * 0.12]);
      return smooth(pts);
    }
    function ridge(values, base, height, seed, xs) { return ridgeLine(values, base, height, seed, xs) + " L" + (W + 20) + "," + H + " L-20," + H + "Z"; }
    var months = f.months.length >= 3 ? f.months.map(function (x) { return x.v; }) : [3, 5, 4, 7, 6, 8, 5, 6];
    // the near ridge: the last half-year in seven broad hills
    var wk = f.weeks.length >= 7 ? f.weeks.slice(-28) : months.concat(months), weeks = [];
    for (var g = 0; g < 7; g++) weeks.push(wk.slice(Math.floor(g * wk.length / 7), Math.floor((g + 1) * wk.length / 7)).reduce(function (t, v) { return t + v; }, 0));
    out.push("<defs>" +
      '<linearGradient id="wash" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + S.ink + '" stop-opacity="0.16"/><stop offset="1" stop-color="' + S.ink + '" stop-opacity="0"/></linearGradient>' +
      '<filter id="bl" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="9"/></filter></defs>');
    // the moon: an ensō in the second accent, drawn as one brush stroke that leaves a gap
    out.push('<g' + (p.anim ? ' class="en" style="transform-origin:760px 150px"' : "") + '><circle cx="760" cy="150" r="70" fill="none" stroke="' + S.a2 + '" stroke-width="9" stroke-linecap="round" stroke-dasharray="380 60" stroke-opacity="0.85" transform="rotate(-70 760 150)"/></g>');
    out.push('<path d="' + ridge(months.slice().reverse(), 360, 190, core.hash(m.login + "far"), 0) + '" fill="url(#wash)"/>');
    out.push('<path d="' + ridge(months, 420, 170, core.hash(m.login + "mid"), -60) + '" fill="' + S.ink + '" fill-opacity="0.13"/>');
    out.push('<path d="' + ridgeLine(months, 420, 170, core.hash(m.login + "mid"), -60) + '" fill="none" stroke="' + S.ink + '" stroke-opacity="0.35" stroke-width="1.6"/>');
    // drifting mist between the ridges
    [[260, 392, 260], [700, 420, 300]].forEach(function (mi, i) {
      out.push("<g" + (p.anim ? ' class="ms" style="animation-duration:' + (22 + i * 9) + "s;animation-delay:-" + i * 6 + 's"' : "") + '><ellipse cx="' + mi[0] + '" cy="' + mi[1] + '" rx="' + mi[2] + '" ry="18" fill="' + (S.dark ? mix(S.bg, S.ink, 0.3) : S.bg) + '" fill-opacity="' + (S.dark ? 0.35 : 0.7) + '" filter="url(#bl)"/></g>');
    });
    out.push('<path d="' + ridge(weeks, 498, 90, core.hash(m.login + "near"), -30) + '" fill="' + S.ink + '" fill-opacity="0.22"/>');
    out.push('<path d="' + ridgeLine(weeks, 498, 90, core.hash(m.login + "near"), -30) + '" fill="none" stroke="' + S.ink + '" stroke-opacity="0.6" stroke-width="2.4" stroke-linecap="round"/>');
    // birds crossing
    for (var b = 0; b < 3; b++) {
      var bx = 120 + b * 46, by = 210 + (b % 2) * 18;
      out.push("<g" + (p.anim ? ' class="bd" style="animation-delay:-' + (b * 1.4).toFixed(1) + 's"' : "") + '><path d="M' + bx + "," + by + " q7,-7 14,0 q7,-7 14,0" + '" fill="none" stroke="' + S.ink + '" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round"/></g>');
    }
    // the poem, top left, and the seal
    var top = f.projects[0], lang = m.langs[0] ? m.langs[0].name : "quiet";
    var poem = [
      (f.total !== null ? commas(f.total) + " brushstrokes" : m.all.length + " scrolls") + " this year,",
      lang + " ink runs through " + m.publicRepos + (m.publicRepos === 1 ? " scroll" : " scrolls"),
      f.streak ? f.streak + (f.streak === 1 ? " day" : " days") + ", one unbroken line." : "the brush rests, then returns."
    ];
    out.push('<text x="44" y="70" font-family="' + SERIF + '" font-size="30" font-weight="700" fill="' + S.ink + '">' + esc(trunc(m.name, 28)) + "</text>");
    poem.forEach(function (l, i) { out.push('<text x="46" y="' + (110 + i * 26) + '" font-family="' + SERIF + '" font-size="17" font-style="italic" fill="' + S.muted + '">' + esc(trunc(l, 52)) + "</text>"); });
    if (o.world !== "ink") out.push('<g transform="rotate(-4 900 64)"><rect x="868" y="36" width="58" height="58" rx="6" fill="' + SEAL + '"/><rect x="873" y="41" width="48" height="48" rx="3" fill="none" stroke="' + SEAL_TEXT + '" stroke-opacity="0.7" stroke-width="1.5"/>' +
      '<text x="897" y="74" text-anchor="middle" font-family="' + SERIF + '" font-size="20" font-weight="700" fill="' + SEAL_TEXT + '">' + esc(core.initials(m)) + "</text></g>");
    // the three best works, written along the foot like inscriptions
    var works = f.projects.slice(0, 3);
    works.forEach(function (w, i) {
      var x = 44 + i * 300;
      if (i) out.push('<rect x="' + (x - 22) + '" y="512" width="1" height="30" fill="' + S.ink + '" fill-opacity="0.3"/>');
      out.push('<text x="' + x + '" y="524" font-family="' + SERIF + '" font-size="16" font-weight="700" fill="' + S.ink + '">' + esc(trunc(w.name, 24)) + "</text>");
      out.push('<text x="' + x + '" y="542" font-family="' + SANS + '" font-size="12" fill="' + S.muted + '">★ ' + esc(fmt(w.stars)) + (w.lang ? " · " + esc(trunc(w.lang, 16)) : "") + "</text>");
    });
    if (!works.length) out.push('<text x="44" y="530" font-family="' + SERIF + '" font-size="16" font-style="italic" fill="' + S.muted + '">An empty scroll, waiting for its first stroke.</text>');
    // petals in the first accent
    for (var k = 0; k < 7; k++) {
      var cx = Math.round(80 + r() * 800), cy = Math.round(30 + r() * 120);
      out.push("<g" + (p.anim ? ' class="pt" style="animation-duration:' + (9 + r() * 6).toFixed(1) + "s;animation-delay:-" + (r() * 10).toFixed(1) + 's"' : "") + '><ellipse cx="' + cx + '" cy="' + cy + '" rx="5" ry="3" fill="' + S.a1 + '" fill-opacity="0.75" transform="rotate(' + Math.round(r() * 180) + " " + cx + " " + cy + ')"/></g>');
    }
    var css = "@keyframes en{to{transform:rotate(360deg)}}.en{animation:en 60s linear infinite}" +
      "@keyframes ms{0%,100%{transform:translateX(-40px)}50%{transform:translateX(40px)}}.ms{animation:ms 24s ease-in-out infinite}" +
      "@keyframes bd{from{transform:translate(-200px,20px)}to{transform:translate(1000px,-40px)}}.bd{animation:bd 26s linear infinite}" +
      "@keyframes pt{0%{transform:translate(0,0) rotate(0);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translate(140px,360px) rotate(240deg);opacity:0}}.pt{animation:pt 12s linear infinite}";
    return svgOpen(W, H, "Ink scroll for " + m.login) + motion(p, css) + out.join("") + "</svg>";
  }


  /* ================= N. block city (the Voxel world's own scene) ================= */
  function blockcity(m, o, p) {
    var f = facts(m, o), S = kit(p), V = worlds.voxel, r = rng(core.hash(m.login + "city")), W = 960, H = 560, out = [];
    // the city and the bot take the README's colours: blocks in the first accent, the bot in the second
    var q = { bg1: S.bg, ink: S.ink, a1: S.a1, a2: S.a2, anim: p.anim, light: !S.dark };
    out.push("<defs>" + V.botDefs(q) + "</defs>");
    // frosted glass blocks drift behind the city
    out.push("<g" + (p.anim ? ' class="vfl"' : "") + ">" + V.glassCube(330, 430, 40, 40, q) + V.glassCube(880, 40, 34, 34, q) + "</g>");
    // up to the last 12 weeks of data: a stack per day, rows are weekdays, sized to fill the right of the scene
    var cols = f.daily.length ? Math.max(2, Math.min(12, Math.ceil(f.daily.length / 7))) : 12, bw = Math.min(30, 620 / (7 + cols)), bh = bw / 2;
    var ox = 320 + 7 * bw + (620 - (7 + cols) * bw) / 2, oy = 392 - (7 + cols) * bh / 2;
    out.push(V.city(m, q, ox, oy, 7, cols, bw, bh, bw * 0.72, r));
    out.push('<g transform="translate(' + Math.round(ox + 60) + ' 70)"><g' + (p.anim ? ' class="vpat"' : "") + ">" + V.bot(0, 0, 0.8, q) + "</g></g>");
    out.push('<text x="40" y="58" font-family="' + MONO + '" font-size="13" letter-spacing="3" fill="' + S.a1 + '">BLOCK CITY · @' + esc(trunc(m.login, 24).toUpperCase()) + "</text>");
    out.push('<text x="40" y="104" font-family="' + SANS + '" font-size="34" font-weight="800" letter-spacing="-0.5" fill="' + S.ink + '">' + esc(trunc(firstName(m), 16)) + "’s skyline</text>");
    out.push('<text x="40" y="132" font-family="' + SANS + '" font-size="14" fill="' + S.muted + '">One stack a day, a block per level.</text>');
    var tiles = [];
    if (f.total !== null) tiles.push([commas(f.total), "blocks laid"]);
    if (f.best) tiles.push([String(f.best.v), "tallest day · " + f.best.label]);
    if (f.streak !== null) tiles.push([String(f.streak), f.streak === 1 ? "day building" : "days building"]);
    tiles.push([String(m.publicRepos), "districts (repos)"]);
    tiles.slice(0, 4).forEach(function (t, i) {
      var y = 176 + i * 78;
      out.push('<rect x="40" y="' + y + '" width="230" height="64" rx="12" fill="' + S.panel + '" fill-opacity="0.85" stroke="' + S.line + '"/>');
      out.push(V.cube(66, y + 20, 11, 12, i ? mix(S.a1, S.bg, 0.25) : S.a1));
      out.push('<text x="90" y="' + (y + 32) + '" font-family="' + SANS + '" font-size="24" font-weight="800" fill="' + S.ink + '">' + esc(t[0]) + "</text>");
      out.push('<text x="90" y="' + (y + 50) + '" font-family="' + SANS + '" font-size="11.5" fill="' + S.muted + '">' + esc(trunc(t[1], 30)) + "</text>");
    });
    var css = V.botCss + "@keyframes vpat{0%,100%{transform:translate(0,0)}25%{transform:translate(-150px,70px)}50%{transform:translate(60px,140px)}75%{transform:translate(160px,40px)}}.vpat{animation:vpat 16s ease-in-out infinite}@keyframes vfl{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}.vfl{animation:vfl 7s ease-in-out infinite}" +
      "@keyframes vxp{0%,100%{opacity:1}50%{opacity:.5}}.vxp{animation:vxp 2.4s ease-in-out infinite}";
    return svgOpen(W, H, "Block city for " + m.login) + motion(p, css) + out.join("") + "</svg>";
  }

  var SCENES = { departures: departures, holo: holo, metro: metro, vinyl: vinyl, vitals: vitals, garden: garden,
    yearcode: yearcode, newspaper: newspaper, passport: passport, constellation: constellation, weather: weather, pulse: pulse, scroll: scroll, city: blockcity };

  /** The chosen showpiece as an SVG string, or null when none is chosen. */
  function build(m, options, palette) {
    var o = {}, k;
    for (k in core.DEFAULTS) o[k] = core.DEFAULTS[k];
    for (k in (options || {})) if (options[k] !== undefined) o[k] = options[k];
    var draw = SCENES[o.showpiece];
    if (!draw) return null;
    var p = palette;
    if (!p) { p = core.paletteFor(m.login, o); p.anim = o.animate !== false; }
    // scenes speak in the README's own fonts
    var keep = [SANS, MONO, SERIF];
    if (p.font) { SANS = p.font.sans || SANS; SERIF = p.font.display || SERIF; MONO = p.font.mono || MONO; }
    var svg;
    try { svg = draw(m, o, p); } finally { SANS = keep[0]; MONO = keep[1]; SERIF = keep[2]; }
    return dress(svg, p);
  }

  /**
   * Puts a scene in the same frame as the cards: the glass panel of the classic look, or the chosen world's frame.
   * The scene's ids are prefixed so they never clash with the frame's.
   */
  function dress(svg, p) {
    var open = svg.slice(0, svg.indexOf(">") + 1), inner = svg.slice(open.length, svg.length - "</svg>".length);
    var W = Number(/width="(\d+)"/.exec(open)[1]), H = Number(/height="(\d+)"/.exec(open)[1]), label = /aria-label="([^"]*)"/.exec(open)[1]
      .replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
    inner = inner.replace(/ id="([\w-]+)"/g, ' id="s-$1"').replace(/url\(#([\w-]+)\)/g, "url(#s-$1)");
    if (p.frame) return p.frame(W, H, label, '<g clip-path="url(#' + (p.world ? "wf" : "clip") + ')">' + inner + "</g>");
    var S = kit(p);
    return svgOpen(W, H, label) + '<defs><clipPath id="clip"><rect width="' + W + '" height="' + H + '" rx="18"/></clipPath>' +
      '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + S.bg + '"/><stop offset="1" stop-color="' + S.bg2 + '"/></linearGradient></defs>' +
      '<rect width="' + W + '" height="' + H + '" rx="18" fill="url(#bg)"/><g clip-path="url(#clip)">' + inner + "</g>" +
      '<rect x="0.75" y="0.75" width="' + (W - 1.5) + '" height="' + (H - 1.5) + '" rx="17.5" fill="none" stroke="' + S.line + '" stroke-width="1.5"/></svg>';
  }

  return { build: build, SCENES: Object.keys(SCENES) };
});

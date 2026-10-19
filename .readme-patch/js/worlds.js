/*
 * worlds.js: complete designs for the whole README. A world restyles everything from the banner to the footer:
 * its own palette (light and dark), fonts, card frames, section titles, heatmap cells and streak gauges, plus an
 * animated divider between sections and a footer of its own. The cards keep their layout and data; the world
 * decides how they look.
 *
 *   airport      split-flap departure boards: amber on black, flap tiles, a plane crossing between sections
 *   transit      metro signage: roundels, line stripes in your language colours, trains between stations
 *   broadsheet   a newspaper: serif type, double rules, halftone dots, an ink roller across the section rules
 *   observatory  a star chart: deep sky, celestial grid, contributions as stars, a comet between sections
 *   botanical    a herbarium: pressed-specimen sheets, tape and sprigs, leaves for contributions, growing vines
 *   atlas        an antique sea chart: parchment, contour lines, a neatline, a compass rose, a ship sailing between sections
 *   museum       a gallery: brass-framed placards, a gilded frame for the name, a drifting spotlight, velvet ropes
 *   ink          sumi-e on washi: brush strokes, an ensō for each streak, a vermilion seal, falling sakura petals
 *   periodic     a lab notebook: graph paper, element tiles for every section, electron shells, vibrating molecules
 *   abyss        the deep sea: light rays and bubbles, bioluminescent plankton, sonar rings, jellyfish and kelp
 *   voxel        an isometric city: contribution days as stacked blocks, an original hover-bot flying over them
 *
 * Motion is plain CSS (no scripts), only ambient loops, and everything stands still for reduced motion.
 */
(function (root, factory) {
  var node = typeof module === "object" && module.exports;
  var api = factory(node ? require("./core.js") : root.ReadmeCore);
  if (node) module.exports = api;
  else root.ReadmeWorlds = api;
})(typeof self !== "undefined" ? self : this, function (core) {
  "use strict";

  var SANS = "system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
  var GROTESK = "'Helvetica Neue',Helvetica,Arial,system-ui,sans-serif";
  var MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";
  var SERIF = "Georgia,'Iowan Old Style','Palatino Linotype',Palatino,'Times New Roman',serif";

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function trunc(s, max) { s = String(s || ""); return s.length > max ? s.slice(0, Math.max(1, max - 1)).trimEnd() + "…" : s; }
  function fit(text, max, min, width, k) { return Math.max(min, Math.min(max, Math.floor(width / (Math.max(1, String(text).length) * k)))); }
  function fmt(n) { n = Number(n) || 0; return n >= 10000 ? Math.round(n / 1000) + "k" : n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n); }
  function rng(seed) {
    var a = seed >>> 0;
    return function () { a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function css(p, rules) { return p.anim ? "<style>" + rules + "@media (prefers-reduced-motion:reduce){*{animation:none!important}}</style>" : ""; }
  function svgOpen(W, H, label) { return '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(label) + '">'; }
  function sentence(s) { s = String(s).toLowerCase(); return s.charAt(0).toUpperCase() + s.slice(1); }
  function anim(p, cls, style) { return p.anim ? ' class="' + cls + '"' + (style ? ' style="' + style + '"' : "") : ""; }

  /* ---------- palettes and type ---------- */
  var DEF = {
    airport: {
      dark: { bg1: "#0c0c0e", bg2: "#1b1b1f", ink: "#f2f2f4", a1: "#ffd84a", a2: "#ff9f1c", line: "#2a2a2e" },
      font: { sans: SANS, mono: MONO, display: MONO }, glow: false
    },
    transit: {
      light: { bg1: "#f6f3ec", bg2: "#efe9dc", ink: "#1d1d1f", a1: "#0019a8", a2: "#dc241f", line: "#d8d0bf", light: true },
      dark: { bg1: "#0e1520", bg2: "#131c2a", ink: "#e9edf3", a1: "#6d8cff", a2: "#ff5a4f", line: "#26324a" },
      font: { sans: GROTESK, mono: GROTESK, display: GROTESK }, glow: false
    },
    broadsheet: {
      light: { bg1: "#f3eee2", bg2: "#ece5d4", ink: "#1a1712", a1: "#a1261b", a2: "#1a1712", line: "#cfc5b0", light: true },
      dark: { bg1: "#1b1813", bg2: "#221e18", ink: "#efe6d2", a1: "#f07a5f", a2: "#efe6d2", line: "#3a342a" },
      font: { sans: SERIF, mono: SERIF, display: SERIF }, glow: false
    },
    observatory: {
      dark: { bg1: "#050816", bg2: "#0d1335", ink: "#eef1ff", a1: "#a9bcff", a2: "#ffd27a", line: "#1f2752" },
      font: { sans: SANS, mono: MONO, display: SERIF }, glow: true
    },
    botanical: {
      light: { bg1: "#f5f2e7", bg2: "#ebe5d2", ink: "#1f3d2b", a1: "#2f7d4f", a2: "#c0396b", line: "#d6cfb8", light: true },
      dark: { bg1: "#0f1f17", bg2: "#15291e", ink: "#e3efe4", a1: "#7bd88f", a2: "#ff8fb8", line: "#24402f" },
      font: { sans: SANS, mono: SANS, display: SERIF }, glow: false
    }
  };

  /** The world's palette for a mode. Worlds without a light print keep their dark one: a board or a sky is the same object in any light. */
  function palette(key, mode, seed) {
    var d = DEF[key];
    if (!d) return null;
    var t = (mode === "light" && d.light) || d.dark || d.light, out = {};
    for (var k in t) out[k] = t[k];
    out.light = !!t.light; out.world = key; out.font = d.font; out.glow = d.glow;
    out.anim = true; out.seed = seed || 0; out.hue = 0; out.hue2 = 0;
    return out;
  }

  /* ---------- shared pieces ---------- */
  /** Split-flap tiles; some flip now and then, folding the top half over the hinge. */
  function flaps(p, r, text, x, y, w, h, size, color, rate) {
    var s = "", gap = Math.max(2, Math.round(w / 10)), chars = String(text).toUpperCase().split("");
    chars.forEach(function (ch, i) {
      var gx = x + i * (w + gap), face = '<rect width="' + w + '" height="' + h + '" rx="' + Math.max(2, Math.round(w / 8)) + '" fill="url(#tile)"/>' +
        (ch === " " ? "" : '<text x="' + w / 2 + '" y="' + (h * 0.5 + size * 0.36).toFixed(1) + '" text-anchor="middle" font-family="' + MONO + '" font-weight="800" font-size="' + size + '" fill="' + color + '">' + esc(ch) + "</text>");
      s += '<g transform="translate(' + gx + " " + y + ')">' + face;
      if (p.anim && r() < rate) {
        var dl = ' style="animation-delay:-' + (r() * 7).toFixed(2) + 's"';
        s += '<rect class="fs"' + dl + ' width="' + w + '" height="' + h + '" rx="2" fill="#08080a"/>' +
          '<g class="fu"' + dl + '><svg width="' + w + '" height="' + h / 2 + '" overflow="hidden">' + face + "</svg></g>" +
          '<g class="fd"' + dl + '><svg y="' + h / 2 + '" width="' + w + '" height="' + h / 2 + '" viewBox="0 ' + h / 2 + " " + w + " " + h / 2 + '" overflow="hidden">' + face + "</svg></g>";
      }
      s += "</g>";
    });
    s += '<rect x="' + x + '" y="' + (y + h / 2 - 0.5) + '" width="' + (chars.length * (w + gap) - gap) + '" height="1" fill="#000"/>';
    return s;
  }
  var FLAP_CSS = ".fu,.fd,.fs{transform-box:fill-box;animation-duration:7s;animation-iteration-count:infinite}" +
    ".fu{transform-origin:center bottom;animation-name:fu;animation-timing-function:ease-in}" +
    ".fd{transform-origin:center top;animation-name:fd;animation-timing-function:cubic-bezier(.3,1.6,.6,1)}" +
    ".fs{opacity:0;animation-name:fs;animation-timing-function:steps(1)}" +
    "@keyframes fu{0%,88%{transform:scaleY(1)}90.5%{transform:scaleY(0)}90.6%,100%{transform:scaleY(1)}}" +
    "@keyframes fd{0%,90.5%{transform:scaleY(1)}90.6%{transform:scaleY(0)}93.5%,100%{transform:scaleY(1)}}" +
    "@keyframes fs{0%,88%{opacity:0}88.1%,93.4%{opacity:1}93.5%,100%{opacity:0}}";
  var TILE_DEF = '<linearGradient id="tile" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34343a"/><stop offset="0.5" stop-color="#26262b"/><stop offset="0.5" stop-color="#1b1b1f"/><stop offset="1" stop-color="#232327"/></linearGradient>';

  function leaf(x, y, len, ang, fill) {
    return '<path d="M0 0 Q' + (len * 0.5) + " " + (-len * 0.32) + " " + len + " 0 Q" + (len * 0.5) + " " + (len * 0.32) + ' 0 0Z" fill="' + fill + '" transform="translate(' + x.toFixed(1) + " " + y.toFixed(1) + ") rotate(" + ang.toFixed(0) + ')"/>';
  }
  function roundel(x, y, r, p) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="none" stroke="' + p.a2 + '" stroke-width="' + (r * 0.36).toFixed(1) + '"/>' +
      '<rect x="' + (x - r * 1.35).toFixed(1) + '" y="' + (y - r * 0.26).toFixed(1) + '" width="' + (r * 2.7).toFixed(1) + '" height="' + (r * 0.52).toFixed(1) + '" fill="' + p.a1 + '"/>';
  }
  /** A deterministic starfield for a box. */
  function stars(p, r, W, H, n, twinkle) {
    var s = "";
    for (var i = 0; i < n; i++) {
      var tw = twinkle && i % 4 === 0;
      s += '<circle cx="' + (r() * W).toFixed(0) + '" cy="' + (r() * H).toFixed(0) + '" r="' + (0.4 + r() * 1.1).toFixed(1) + '" fill="#ffffff" fill-opacity="' + (0.25 + r() * 0.6).toFixed(2) + '"' +
        (tw ? anim(p, "tw", "animation-duration:" + (2 + r() * 3).toFixed(1) + "s;animation-delay:-" + (r() * 3).toFixed(1) + "s") : "") + "/>";
    }
    return s;
  }

  /* ================= five more worlds, each a self-contained design =================
   * Every world below answers the same questions: frame (a card's surface), title (a card's heading), cell (one heatmap
   * day), ring (a streak gauge), banner, divider (opens a section) and footer. */
  function mix(a, b, t) { return core.mixHex(a, b, t); }
  function grain(id, p, size, op) {
    return '<pattern id="' + id + '" width="' + size + '" height="' + size + '" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.6" fill="' + p.ink + '" fill-opacity="' + op + '"/><circle cx="' + (size * 0.6).toFixed(1) + '" cy="' + (size * 0.6).toFixed(1) + '" r="0.5" fill="' + p.ink + '" fill-opacity="' + (op * 0.7).toFixed(3) + '"/></pattern>';
  }
  function compass(cx, cy, r, fill) {
    var q = r * 0.24;
    return '<path d="M' + cx + " " + (cy - r) + " L" + (cx + q) + " " + (cy - q) + " L" + (cx + r) + " " + cy + " L" + (cx + q) + " " + (cy + q) + " L" + cx + " " + (cy + r) + " L" + (cx - q) + " " + (cy + q) + " L" + (cx - r) + " " + cy + " L" + (cx - q) + " " + (cy - q) + 'Z" fill="' + fill + '"/>';
  }
  /** A wobbly closed loop, like a contour line on a chart. */
  function contour(cx, cy, rx, ry, phase) {
    var pts = [];
    for (var k = 0; k < 28; k++) {
      var a = k / 28 * Math.PI * 2, w = 1 + 0.13 * Math.sin(a * 3 + phase) + 0.07 * Math.sin(a * 5 - phase);
      pts.push((cx + Math.cos(a) * rx * w).toFixed(1) + "," + (cy + Math.sin(a) * ry * w).toFixed(1));
    }
    return "M" + pts.join(" L") + "Z";
  }
  function ship(fill) { return '<path d="M-14 0 L14 0 L9 7 L-9 7Z" fill="' + fill + '"/><path d="M0 -20 L0 0 M0 -19 L11 -4 L0 -4Z" stroke="' + fill + '" stroke-width="1.6" fill="' + fill + '" fill-opacity="0.85"/>'; }
  function brush(x1, x2, y, thick, fill) {
    var mid = (x1 + x2) / 2;
    return '<path d="M' + x1 + " " + y + " Q" + mid + " " + (y - thick) + " " + x2 + " " + (y - thick * 0.2) + " Q" + mid + " " + (y + thick * 0.6) + " " + x1 + " " + y + 'Z" fill="' + fill + '"/>';
  }
  function petal(fill) { return '<path d="M0 0 C4 -6 10 -4 9 1 C8 6 2 6 0 0Z" fill="' + fill + '"/>'; }
  function fish(fill) { return '<path d="M0 0 Q10 -7 20 0 Q10 7 0 0Z M20 0 L28 -6 L28 6Z" fill="' + fill + '"/><circle cx="6" cy="-1" r="1.2" fill="#ffffff"/>'; }
  function jelly(x, y, s, fill) {
    var g = '<path d="M' + (x - 22 * s) + " " + y + " Q" + x + " " + (y - 36 * s) + " " + (x + 22 * s) + " " + y + ' Z" fill="' + fill + '" fill-opacity="0.75"/>';
    for (var t = -2; t <= 2; t++) g += '<path d="M' + (x + t * 8 * s) + " " + y + " q" + (4 * s) + " " + (14 * s) + " 0 " + (28 * s) + " t0 " + (28 * s) + '" fill="none" stroke="' + fill + '" stroke-opacity="0.55" stroke-width="1.4"/>';
    return g;
  }
  function tile(x, y, s, num, sym, fill, ink, sub) {
    return '<rect x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '" rx="' + (s * 0.12).toFixed(1) + '" fill="' + fill + '" fill-opacity="0.16" stroke="' + fill + '" stroke-width="' + Math.max(1, s / 40).toFixed(1) + '"/>' +
      '<text x="' + (x + s * 0.1).toFixed(1) + '" y="' + (y + s * 0.24).toFixed(1) + '" font-family="' + MONO + '" font-size="' + (s * 0.17).toFixed(1) + '" fill="' + ink + '" fill-opacity="0.7">' + esc(num) + "</text>" +
      '<text x="' + (x + s / 2).toFixed(1) + '" y="' + (y + s * 0.66).toFixed(1) + '" text-anchor="middle" font-family="' + GROTESK + '" font-size="' + (s * 0.4).toFixed(1) + '" font-weight="800" fill="' + ink + '">' + esc(sym) + "</text>" +
      (sub ? '<text x="' + (x + s / 2).toFixed(1) + '" y="' + (y + s * 0.88).toFixed(1) + '" text-anchor="middle" font-family="' + GROTESK + '" font-size="' + (s * 0.12).toFixed(1) + '" fill="' + ink + '" fill-opacity="0.75">' + esc(sub) + "</text>" : "");
  }
  function symbolOf(text) { var t = String(text).replace(/[^A-Za-z]/g, ""); return t ? t.charAt(0).toUpperCase() + (t.charAt(1) || "").toLowerCase() : "Xx"; }
  function clipWF(W, H, rx) { return '<clipPath id="wf"><rect width="' + W + '" height="' + H + '" rx="' + rx + '"/></clipPath>'; }

  /* ---------- Voxel pieces: isometric cubes, a contribution city and an original hover-bot ---------- */
  /** An isometric block: (cx, top) is the top corner, w the half-width, d the height of the sides. Lit from the top left. */
  function cube(cx, top, w, d, c, hh) {
    var h = hh || w / 2, x = function (n) { return n.toFixed(1); };
    return '<path d="M' + x(cx) + "," + x(top) + " L" + x(cx + w) + "," + x(top + h) + " L" + x(cx) + "," + x(top + 2 * h) + " L" + x(cx - w) + "," + x(top + h) + 'Z" fill="' + c + '"/>' +
      '<path d="M' + x(cx - w) + "," + x(top + h) + " L" + x(cx) + "," + x(top + 2 * h) + " L" + x(cx) + "," + x(top + 2 * h + d) + " L" + x(cx - w) + "," + x(top + h + d) + 'Z" fill="' + mix(c, "#000000", 0.16) + '"/>' +
      '<path d="M' + x(cx) + "," + x(top + 2 * h) + " L" + x(cx + w) + "," + x(top + h) + " L" + x(cx + w) + "," + x(top + h + d) + " L" + x(cx) + "," + x(top + 2 * h + d) + 'Z" fill="' + mix(c, "#ffffff", 0.72) + '"/>';
  }
function vsky(id, p, W, H) {
    return '<linearGradient id="' + id + '" x1="0.3" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + p.bg1 + '"/><stop offset="0.55" stop-color="' + mix(p.bg1, p.light ? "#bfe6f7" : p.bg2, 0.6) + '"/><stop offset="1" stop-color="' + p.bg2 + '"/></linearGradient>' +
      '<radialGradient id="' + id + 'm" cx="1" cy="0.3" r="0.7"><stop offset="0" stop-color="' + mix(p.a1, "#ffffff", 0.55) + '" stop-opacity="' + (p.light ? 0.35 : 0.14) + '"/><stop offset="1" stop-color="' + p.a1 + '" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + id + 'l" cx="0" cy="1" r="0.8"><stop offset="0" stop-color="' + mix(p.a2, "#a855f7", 0.5) + '" stop-opacity="' + (p.light ? 0.22 : 0.25) + '"/><stop offset="1" stop-color="' + p.a2 + '" stop-opacity="0"/></radialGradient>';
  }
  function vskyFill(id, W, H) { return '<rect width="' + W + '" height="' + H + '" fill="url(#' + id + ')"/><rect width="' + W + '" height="' + H + '" fill="url(#' + id + 'm)"/><rect width="' + W + '" height="' + H + '" fill="url(#' + id + 'l)"/>'; }
  /** A frosted-glass block: pale, see-through faces with a faint rainbow edge. */
  function glassCube(cx, top, w, d, p, hh) {
    var h = hh || w / 2, x = function (n) { return n.toFixed(1); }, edge = p.light ? "#ffffff" : mix(p.ink, p.bg1, 0.5);
    return '<g opacity="' + (p.light ? 0.75 : 0.45) + '"><path d="M' + x(cx) + "," + x(top) + " L" + x(cx + w) + "," + x(top + h) + " L" + x(cx) + "," + x(top + 2 * h) + " L" + x(cx - w) + "," + x(top + h) + 'Z" fill="#ffffff" fill-opacity="0.6" stroke="' + edge + '"/>' +
      '<path d="M' + x(cx - w) + "," + x(top + h) + " L" + x(cx) + "," + x(top + 2 * h) + " L" + x(cx) + "," + x(top + 2 * h + d) + " L" + x(cx - w) + "," + x(top + h + d) + 'Z" fill="' + mix(p.a1, "#ffffff", 0.7) + '" fill-opacity="0.55" stroke="' + edge + '" stroke-opacity="0.7"/>' +
      '<path d="M' + x(cx) + "," + x(top + 2 * h) + " L" + x(cx + w) + "," + x(top + h) + " L" + x(cx + w) + "," + x(top + h + d) + " L" + x(cx) + "," + x(top + 2 * h + d) + 'Z" fill="' + mix(mix(p.a2, "#a855f7", 0.4), "#ffffff", 0.72) + '" fill-opacity="0.5" stroke="' + edge + '" stroke-opacity="0.7"/></g>';
  }
  /** The last rows × cols days as a block city: one stack per day, taller on busier days, drawn back to front. */
  function city(m, p, ox, oy, rows, cols, w, h, unit, r) {
    var daily = m.activity && m.activity.daily ? m.activity.daily.slice(-rows * cols) : [], n = rows * cols;
    var nz = daily.filter(function (v) { return v > 0; }).sort(function (a, b) { return a - b; });
    var q = function (t) { return nz.length ? nz[Math.min(nz.length - 1, Math.floor(t * nz.length))] : 1; };
    var lvl = function (v) { return v <= 0 ? 0 : v <= q(0.25) ? 1 : v <= q(0.5) ? 2 : v <= q(0.75) ? 3 : 4; };
    var cells = [];
    for (var c = 0; c < cols; c++) for (var d = 0; d < rows; d++) {
      var idx = daily.length - n + c * rows + d, v = idx >= 0 && idx < daily.length ? daily[idx] : (daily.length ? 0 : (r() < 0.6 ? 1 + Math.floor(r() * 3) : 0));
      cells.push({ c: c, d: d, lv: daily.length ? lvl(v) : Math.min(4, v) });
    }
    cells.sort(function (a, b) { return (a.c + a.d) - (b.c + b.d) || a.c - b.c; });
    return cells.map(function (k) {
      // a stack of whole blocks, one per level, so the city reads as cubes rather than towers
      var cx = ox + (k.c - k.d) * w, base = oy + (k.c + k.d) * h, ch = Math.min(unit, w * 0.95);
      if (!k.lv) return cube(cx, base - 3 + h * 0.14, w * 0.86, 3, mix(p.bg1, p.ink, 0.1), h * 0.86);
      var col = mix(p.bg1, p.a1, 0.45 + k.lv * 0.1375), g = "";
      for (var j = 0; j < k.lv; j++) g += cube(cx, base - (j + 1) * ch + h * 0.14, w * 0.86, ch, col, h * 0.86);
      return "<g" + (k.lv === 4 ? anim(p, "vxp", "animation-delay:-" + ((k.c * 5 + k.d) % 20 / 10).toFixed(1) + "s") : "") + ">" + g + "</g>";
    }).join("");
  }
  /** An original hover-bot: a rounded head, a visor with two glowing eyes, an antenna and a thruster with a soft beam. */
  function BOT_DEFS(p) {
    var lilac = mix(mix(p.a2, "#a855f7", 0.45), "#ffffff", 0.4);
    return '<linearGradient id="vbh" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + lilac + '"/><stop offset="0.45" stop-color="' + mix(p.a2, "#a855f7", 0.3) + '"/><stop offset="1" stop-color="' + p.a2 + '"/></linearGradient>' +
      '<linearGradient id="vbv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + mix(p.a2, "#000000", 0.35) + '"/><stop offset="1" stop-color="' + mix(p.a2, "#000000", 0.62) + '"/></linearGradient>' +
      '<linearGradient id="vbf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + mix(p.a1, "#ffffff", 0.5) + '"/><stop offset="0.5" stop-color="' + mix(p.a2, "#7dd3fc", 0.6) + '" stop-opacity="0.8"/><stop offset="1" stop-color="' + p.a2 + '" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="vbm" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="' + mix(p.a2, "#7dd3fc", 0.65) + '" stop-opacity="0.9"/><stop offset="1" stop-color="' + mix(p.a2, "#7dd3fc", 0.8) + '" stop-opacity="0"/></linearGradient>';
  }
  /** An original flying robot: a square head with an antenna and two round glowing eyes, a torso with a chest light, little arms and a jet thruster. */
  function bot(x, y, s, p) {
    var t = function (n) { return (n * s).toFixed(1); }, eye = mix(p.a2, "#ffffff", 0.82), dark = mix(p.a2, "#000000", 0.45), bolt = mix(p.a2, "#a855f7", 0.55);
    var rect = function (x0, y0, w, h, r, fill, extra) { return '<rect x="' + t(x0) + '" y="' + t(y0) + '" width="' + t(w) + '" height="' + t(h) + '" rx="' + t(r) + '" fill="' + fill + '"' + (extra || "") + "/>"; };
    return '<g transform="translate(' + x + " " + y + ')">' +
      // the comet trail behind, and the thruster flame below
      '<path d="M' + t(-26) + "," + t(46) + " C" + t(-80) + "," + t(52) + " " + t(-130) + "," + t(80) + " " + t(-200) + "," + t(78) + " C" + t(-130) + "," + t(68) + " " + t(-80) + "," + t(62) + " " + t(-24) + "," + t(62) + 'Z" fill="url(#vbm)" class="vbeam"/>' +
      '<path d="M' + t(-9) + "," + t(86) + " Q0," + t(122) + " " + t(9) + "," + t(86) + 'Z" fill="url(#vbf)" class="vbeam"/>' +
      rect(-12, 78, 24, 10, 3, dark) +
      // arms
      rect(-36, 46, 10, 26, 5, bolt, ' transform="rotate(18 ' + t(-31) + " " + t(48) + ')"') + rect(26, 46, 10, 26, 5, bolt, ' transform="rotate(-18 ' + t(31) + " " + t(48) + ')"') +
      // torso, chest light and panel seams
      rect(-25, 42, 50, 38, 12, "url(#vbh)") +
      '<circle cx="0" cy="' + t(58) + '" r="' + t(6.5) + '" fill="' + dark + '"/><circle cx="0" cy="' + t(58) + '" r="' + t(4) + '" fill="' + mix(p.a1, "#ffffff", 0.25) + '" class="vtip"/>' +
      rect(-15, 70, 30, 2.5, 1.2, dark, ' fill-opacity="0.5"') +
      rect(-7, 36, 14, 8, 3, dark) +
      // antenna
      '<line x1="0" y1="' + t(-10) + '" x2="0" y2="' + t(-26) + '" stroke="' + dark + '" stroke-width="' + t(3.5) + '" stroke-linecap="round"/><circle cx="0" cy="' + t(-29) + '" r="' + t(5.5) + '" fill="' + mix(p.a1, "#ffffff", 0.2) + '" class="vtip"/>' +
      // head, ear bolts, face screen, eyes and mouth
      rect(-43, 6, 9, 20, 3.5, bolt) + rect(34, 6, 9, 20, 3.5, bolt) +
      rect(-36, -12, 72, 52, 15, "url(#vbh)") +
      rect(-28, -4, 56, 36, 10, "url(#vbv)") +
      '<g class="vblink"><circle cx="' + t(-12) + '" cy="' + t(12) + '" r="' + t(7) + '" fill="' + eye + '"/><circle cx="' + t(12) + '" cy="' + t(12) + '" r="' + t(7) + '" fill="' + eye + '"/>' +
      '<circle cx="' + t(-9.5) + '" cy="' + t(9.5) + '" r="' + t(2.2) + '" fill="#ffffff"/><circle cx="' + t(14.5) + '" cy="' + t(9.5) + '" r="' + t(2.2) + '" fill="#ffffff"/></g>' +
      '<path d="M' + t(-7) + "," + t(23) + " q" + t(7) + "," + t(5) + " " + t(14) + ",0" + '" fill="none" stroke="' + eye + '" stroke-width="' + t(2.4) + '" stroke-linecap="round"/></g>';
  }
  var BOT_CSS = "@keyframes vblink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}.vblink{transform-box:fill-box;transform-origin:center;animation:vblink 4.5s ease-in-out infinite}" +
    "@keyframes vbeam{0%,100%{opacity:.85}50%{opacity:.45}}.vbeam{animation:vbeam 1.6s ease-in-out infinite}@keyframes vtip{0%,100%{opacity:1}50%{opacity:.4}}.vtip{animation:vtip 1.2s ease-in-out infinite}";

  var NEW = {
    /* ---------- Atlas: an antique sea chart ---------- */
    atlas: {
      pal: { light: { bg1: "#f1e6cc", bg2: "#e6d6b0", ink: "#3b2a18", a1: "#9a3b24", a2: "#2f5d62", line: "#c9b38a", light: true },
        dark: { bg1: "#13202b", bg2: "#1a2a38", ink: "#efe3c6", a1: "#e0a458", a2: "#7fb3b8", line: "#2d3e4f" } },
      font: { sans: SERIF, mono: SERIF, display: SERIF }, glow: false,
      frame: function (W, H, p, r) {
        var lines = "";
        for (var k = 0; k < 3; k++) {
          var cx = r() * W, cy = r() * H, rx = 60 + r() * 120;
          for (var j = 0; j < 4; j++) lines += '<path d="' + contour(cx, cy, rx * (1 - j * 0.22), rx * 0.6 * (1 - j * 0.22), k + j) + '" fill="none" stroke="' + p.ink + '" stroke-opacity="0.07"/>';
        }
        return { back: "<defs>" + clipWF(W, H, 4) + grain("gr", p, 6, 0.06) + '</defs><g clip-path="url(#wf)"><rect width="' + W + '" height="' + H + '" fill="' + p.bg1 + '"/><rect width="' + W + '" height="' + H + '" fill="url(#gr)"/>' + lines + "</g>",
          over: '<rect x="5" y="5" width="' + (W - 10) + '" height="' + (H - 10) + '" fill="none" stroke="' + p.ink + '" stroke-opacity="0.55" stroke-width="1.2"/><rect x="9" y="9" width="' + (W - 18) + '" height="' + (H - 18) + '" fill="none" stroke="' + p.ink + '" stroke-opacity="0.25" stroke-width="0.6"/>',
          style: ".wcn{transform-box:fill-box;transform-origin:center;animation:wcn 4s ease-in-out infinite}@keyframes wcn{0%,100%{transform:rotate(-14deg)}50%{transform:rotate(14deg)}}" +
            ".wsh{animation:wsh 16s ease-in-out infinite alternate}@keyframes wsh{to{transform:translateX(" + (W - 110) + "px)}}" };
      },
      title: function (p, left, right, edge) {
        return '<g' + anim(p, "wcn") + ">" + compass(36, 35, 9, p.a1) + "</g>" + (p.anim ? '<g transform="translate(46 50)"><g class="wsh"><g transform="scale(.42)">' + ship(p.ink) + "</g></g></g>" : "") + '<text x="52" y="40" font-family="' + SERIF + '" font-size="16" font-style="italic" fill="' + p.ink + '">' + esc(sentence(left)) + "</text>" +
          (right ? '<text x="' + edge + '" y="40" text-anchor="end" font-family="' + SERIF + '" font-size="11" letter-spacing="2" fill="' + p.ink + '" fill-opacity="0.6">' + esc(right) + "</text>" : "") +
          '<line x1="28" y1="52" x2="' + edge + '" y2="52" stroke="' + p.a1 + '" stroke-opacity="0.6" stroke-dasharray="6 4"/>';
      },
      cell: function (p, x, y, size, lv) {
        var fill = lv === 4 ? p.a1 : lv ? mix(p.bg2, p.a2, 0.15 + lv * 0.22) : p.bg2;
        return '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + size.toFixed(1) + '" height="' + size.toFixed(1) + '" rx="1" fill="' + fill + '" stroke="' + p.ink + '" stroke-opacity="0.15" stroke-width="0.5"/>';
      },
      ring: function (p, cx, cy, r, f, arc) {
        var s = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + p.ink + '" stroke-opacity="0.3"/>';
        for (var t = 0; t < 16; t++) { var a = t / 16 * Math.PI * 2; s += '<line x1="' + (Number(cx) + Math.cos(a) * (r - (t % 4 ? 3 : 7))).toFixed(1) + '" y1="' + (cy + Math.sin(a) * (r - (t % 4 ? 3 : 7))).toFixed(1) + '" x2="' + (Number(cx) + Math.cos(a) * r).toFixed(1) + '" y2="' + (cy + Math.sin(a) * r).toFixed(1) + '" stroke="' + p.ink + '" stroke-opacity="0.45"/>'; }
        // the route is drawn solid, then dashed by cutting it with the paper colour
        return s + arc(p.a1, 3) + '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + p.bg1 + '" stroke-width="4" stroke-dasharray="2 5"/>' + '<text x="' + cx + '" y="' + (cy - r - 4) + '" text-anchor="middle" font-family="' + SERIF + '" font-size="9" font-weight="700" fill="' + p.a1 + '">N</text>';
      },
      banner: function (m, o, p, r, W, H, name, sub, chips) {
        var out = ["<defs>" + '<clipPath id="c"><rect width="' + W + '" height="' + H + '" rx="10"/></clipPath>' + grain("gr", p, 6, 0.06) + "</defs>", '<g clip-path="url(#c)"><rect width="' + W + '" height="' + H + '" fill="' + p.bg1 + '"/><rect width="' + W + '" height="' + H + '" fill="url(#gr)"/>'];
        for (var j = 0; j < 5; j++) out.push('<path d="' + contour(760, 260, 260 - j * 44, 120 - j * 20, j) + '" fill="none" stroke="' + p.ink + '" stroke-opacity="0.09"/>');
        var route = "M90 262 C300 300 420 170 620 210 S900 120 1110 70";
        out.push('<path d="' + route + '" fill="none" stroke="' + p.a1 + '" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round"/>');
        out.push('<g style="offset-path:path(\'' + route + "');offset-distance:35%;offset-rotate:0deg\"" + anim(p, "voy") + ">" + ship(p.ink) + "</g>");
        out.push("<g" + anim(p, "rose", "transform-origin:1040px 150px") + ">" + '<circle cx="1040" cy="150" r="86" fill="none" stroke="' + p.ink + '" stroke-opacity="0.35"/><circle cx="1040" cy="150" r="70" fill="none" stroke="' + p.ink + '" stroke-opacity="0.2" stroke-dasharray="1 4"/>' +
          '<g transform="rotate(45 1040 150)">' + compass(1040, 150, 52, p.a2) + "</g>" + compass(1040, 150, 78, p.a1) + "</g>");
        out.push('<text x="1040" y="56" text-anchor="middle" font-family="' + SERIF + '" font-size="14" font-weight="700" fill="' + p.a1 + '">N</text>');
        out.push('<text x="80" y="72" font-family="' + SERIF + '" font-size="13" letter-spacing="3" fill="' + p.ink + '" fill-opacity="0.7">' + esc(("A chart of @" + trunc(m.login, 24) + (m.since ? " · surveyed since " + m.since : "")).toUpperCase()) + "</text>");
        out.push('<text x="78" y="146" font-family="' + SERIF + '" font-size="' + fit(name, 66, 34, 760, 0.5) + '" font-style="italic" font-weight="700" fill="' + p.ink + '">' + esc(trunc(name, 30)) + "</text>");
        if (sub.main) out.push('<text x="80" y="186" font-family="' + SERIF + '" font-size="21" fill="' + p.ink + '" fill-opacity="0.8">' + esc(trunc(sub.main, 64)) + "</text>");
        if (chips.length) out.push('<text x="80" y="222" font-family="' + SERIF + '" font-size="13" letter-spacing="2" fill="' + p.a1 + '">' + esc(("Ports of call: " + chips.join(" · ")).toUpperCase()) + "</text>");
        out.push('</g><rect x="6" y="6" width="' + (W - 12) + '" height="' + (H - 12) + '" rx="6" fill="none" stroke="' + p.ink + '" stroke-opacity="0.5" stroke-width="1.4"/>');
        return { svg: out.join(""), style: "@keyframes voy{0%{offset-distance:2%}100%{offset-distance:98%}}.voy{animation:voy 18s ease-in-out infinite alternate}@keyframes rose{to{transform:rotate(360deg)}}.rose{animation:rose 120s linear infinite}" };
      },
      divider: function (m, o, p, r, W, H, label, num) {
        var out = ['<rect width="' + W + '" height="' + H + '" rx="8" fill="' + p.bg1 + '"/>'];
        for (var k = 0; k < 6; k++) out.push('<rect x="' + (40 + k * 26) + '" y="58" width="26" height="6" fill="' + (k % 2 ? p.bg1 : p.ink) + '" stroke="' + p.ink + '"/>');
        out.push('<text x="40" y="48" font-family="' + SERIF + '" font-size="11" letter-spacing="2" fill="' + p.ink + '" fill-opacity="0.7">CHART ' + num + " · 0 — 3 LEAGUES</text>");
        out.push('<path d="M430 46 H770 M430 54 H770" stroke="' + p.ink + '" stroke-opacity="0.35"/><rect x="460" y="24" width="280" height="48" rx="24" fill="' + p.bg1 + '" stroke="' + p.ink + '" stroke-opacity="0.6"/>');
        out.push('<text x="600" y="56" text-anchor="middle" font-family="' + SERIF + '" font-size="24" font-style="italic" fill="' + p.ink + '">' + esc(trunc(label, 20)) + "</text>");
        out.push('<line x1="800" y1="58" x2="1130" y2="58" stroke="' + p.a1 + '" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round"/>' + compass(1150, 52, 12, p.a1));
        out.push('<g transform="translate(820 56)"><g' + anim(p, "sail") + ">" + ship(p.ink) + "</g></g>");
        return { svg: out.join(""), style: "@keyframes sail{0%,100%{transform:translateX(0)}50%{transform:translateX(280px)}}.sail{animation:sail 12s ease-in-out infinite}" };
      },
      footer: function (m, o, p, r, W, H) {
        var wave = "M0 80 Q37.5 64 75 80 T150 80 T225 80 T300 80 T375 80 T450 80 T525 80 T600 80 T675 80 T750 80 T825 80 T900 80 T975 80 T1050 80 T1125 80 T1200 80 T1275 80 T1350 80 T1425 80 T1500 80 V120 H0Z";
        return { svg: '<text x="600" y="40" text-anchor="middle" font-family="' + SERIF + '" font-size="18" font-style="italic" fill="' + p.ink + '">Terra incognita beyond this line · charted by @' + esc(trunc(m.login, 28)) + "</text>" +
          '<g' + anim(p, "wv") + '><path d="' + wave + '" fill="' + p.a2 + '" fill-opacity="0.35"/></g><g' + anim(p, "wv2") + '><path d="' + wave + '" fill="' + p.a2 + '" fill-opacity="0.55" transform="translate(-40 10)"/></g>',
          style: "@keyframes wv{to{transform:translateX(-150px)}}.wv{animation:wv 6s linear infinite}@keyframes wv2{from{transform:translateX(-150px)}to{transform:translateX(0)}}.wv2{animation:wv2 9s linear infinite}" };
      }
    },

    /* ---------- Museum: a gallery with brass placards ---------- */
    museum: {
      pal: { light: { bg1: "#f6f3ee", bg2: "#ece7df", ink: "#1f1d1a", a1: "#a8834a", a2: "#7a2b3d", line: "#d9d1c4", light: true },
        dark: { bg1: "#151413", bg2: "#1e1c1a", ink: "#f1ece3", a1: "#c9a46a", a2: "#d0707f", line: "#33302b" } },
      font: { sans: GROTESK, mono: GROTESK, display: SERIF }, glow: false,
      frame: function (W, H, p) {
        var screws = [[12, 12], [W - 12, 12], [W - 12, H - 12], [12, H - 12]].map(function (q) { return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="2.6" fill="' + p.a1 + '"/><line x1="' + (q[0] - 1.6) + '" y1="' + q[1] + '" x2="' + (q[0] + 1.6) + '" y2="' + q[1] + '" stroke="' + p.bg1 + '" stroke-width="0.8"/>'; }).join("");
        return { back: "<defs>" + clipWF(W, H, 2) + '<radialGradient id="spot" cx="0.5" cy="0" r="0.75"><stop offset="0" stop-color="#ffffff" stop-opacity="' + (p.light ? 0.75 : 0.09) + '"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs>' +
          '<g clip-path="url(#wf)"><rect width="' + W + '" height="' + H + '" fill="' + p.bg1 + '"/><rect width="' + W + '" height="' + H + '" fill="url(#spot)"' + anim(p, "spot") + "/></g>",
          over: '<rect x="0.75" y="0.75" width="' + (W - 1.5) + '" height="' + (H - 1.5) + '" rx="2" fill="none" stroke="' + p.a1 + '" stroke-width="1.5"/><rect x="5" y="5" width="' + (W - 10) + '" height="' + (H - 10) + '" fill="none" stroke="' + p.line + '"/>' + screws,
          style: "@keyframes spot{0%,100%{opacity:1}50%{opacity:.7}}.spot{animation:spot 6s ease-in-out infinite}" };
      },
      title: function (p, left, right, edge) {
        return '<rect x="28" y="33" width="18" height="2" fill="' + p.a1 + '"/><text x="54" y="39" font-family="' + GROTESK + '" font-size="12" font-weight="700" letter-spacing="2.6" fill="' + p.ink + '">' + esc(left) + "</text>" +
          (right ? '<text x="' + edge + '" y="39" text-anchor="end" font-family="' + SERIF + '" font-size="12.5" font-style="italic" fill="' + p.ink + '" fill-opacity="0.6">' + esc(sentence(right)) + "</text>" : "") +
          '<rect x="28" y="50" width="' + (edge - 28) + '" height="0.8" fill="' + p.ink + '" fill-opacity="0.2"/>';
      },
      cell: function (p, x, y, size, lv) {
        return '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + size.toFixed(1) + '" height="' + size.toFixed(1) + '" fill="' + (lv ? (lv === 4 ? p.a1 : p.a2) : p.ink) + '" fill-opacity="' + (lv ? [0, 0.3, 0.55, 0.85, 1][lv] : 0.05) + '"/>';
      },
      ring: function (p, cx, cy, r, f, arc) {
        return '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r + 5) + '" fill="none" stroke="' + p.a1 + '" stroke-width="1.4"/><circle cx="' + cx + '" cy="' + cy + '" r="' + (r - 5) + '" fill="none" stroke="' + p.a1 + '" stroke-opacity="0.5" stroke-width="0.7"/>' + arc(p.a2, 4);
      },
      banner: function (m, o, p, r, W, H, name, sub, chips) {
        var out = ['<defs><clipPath id="c"><rect width="' + W + '" height="' + H + '" rx="8"/></clipPath>' +
          '<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e7c77f"/><stop offset="0.35" stop-color="#a8792f"/><stop offset="0.55" stop-color="#f3dc9b"/><stop offset="1" stop-color="#8a6326"/></linearGradient>' +
          '<linearGradient id="canvas" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a1a22"/><stop offset="1" stop-color="#5a2433"/></linearGradient>' +
          '<radialGradient id="cone" cx="0.5" cy="0" r="1"><stop offset="0" stop-color="#ffffff" stop-opacity="' + (p.light ? 0.65 : 0.14) + '"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs>',
          '<g clip-path="url(#c)"><rect width="' + W + '" height="' + H + '" fill="' + p.bg1 + '"/>'];
        for (var k = 1; k < 8; k++) out.push('<rect x="' + k * 150 + '" y="0" width="1" height="' + H + '" fill="' + p.ink + '" fill-opacity="0.04"/>');
        out.push('<ellipse cx="400" cy="20" rx="330" ry="250" fill="url(#cone)"' + anim(p, "sp") + "/>");
        out.push('<rect x="90" y="34" width="620" height="200" fill="url(#gold)"/><rect x="104" y="48" width="592" height="172" fill="#7a5a24" fill-opacity="0.5"/><rect x="110" y="54" width="580" height="160" fill="url(#canvas)"/>');
        out.push('<text x="400" y="140" text-anchor="middle" font-family="' + SERIF + '" font-size="' + fit(name, 54, 26, 520, 0.52) + '" font-style="italic" fill="#f3e6cf">' + esc(trunc(name, 30)) + "</text>");
        out.push('<text x="400" y="176" text-anchor="middle" font-family="' + GROTESK + '" font-size="12" font-weight="700" letter-spacing="3" fill="#e7c77f">' + esc(("Collection of @" + trunc(m.login, 24)).toUpperCase()) + "</text>");
        out.push('<rect x="800" y="86" width="330" height="128" fill="' + (p.light ? "#ffffff" : "#24221f") + '" stroke="' + p.line + '"/>');
        out.push('<text x="822" y="118" font-family="' + GROTESK + '" font-size="17" font-weight="800" fill="' + p.ink + '">' + esc(trunc(name, 28)) + "</text>");
        if (sub.main) out.push('<text x="822" y="142" font-family="' + GROTESK + '" font-size="13" fill="' + p.ink + '" fill-opacity="0.75">' + esc(trunc(sub.main, 40)) + "</text>");
        out.push('<text x="822" y="168" font-family="' + SERIF + '" font-size="13" font-style="italic" fill="' + p.ink + '" fill-opacity="0.75">' + esc("Code on GitHub" + (m.since ? ", " + m.since + "–present" : "")) + "</text>");
        if (chips.length) out.push('<text x="822" y="194" font-family="' + GROTESK + '" font-size="11" font-weight="700" letter-spacing="1.6" fill="' + p.a2 + '">' + esc(trunc(chips.join(" · "), 40).toUpperCase()) + "</text>");
        out.push('<path d="M100 276 Q250 300 400 276 Q550 300 700 276" fill="none" stroke="' + p.a2 + '" stroke-width="5" stroke-linecap="round"/>');
        [100, 400, 700].forEach(function (x) { out.push('<rect x="' + (x - 3) + '" y="256" width="6" height="44" fill="' + p.a1 + '"/><circle cx="' + x + '" cy="254" r="7" fill="' + p.a1 + '"/>'); });
        out.push("</g>");
        return { svg: out.join(""), style: "@keyframes sp{0%,100%{transform:translateX(0);opacity:1}50%{transform:translateX(40px);opacity:.8}}.sp{animation:sp 9s ease-in-out infinite}" };
      },
      divider: function (m, o, p, r, W, H, label, num) {
        return { svg: '<defs><radialGradient id="cone" cx="0.5" cy="0" r="1"><stop offset="0" stop-color="' + p.a1 + '" stop-opacity="0.35"/><stop offset="1" stop-color="' + p.a1 + '" stop-opacity="0"/></radialGradient></defs>' +
          '<rect x="40" y="56" width="420" height="1.5" fill="' + p.a1 + '"/><rect x="740" y="56" width="420" height="1.5" fill="' + p.a1 + '"/>' +
          '<ellipse cx="600" cy="10" rx="170" ry="80" fill="url(#cone)"' + anim(p, "sw") + "/>" +
          '<text x="600" y="30" text-anchor="middle" font-family="' + GROTESK + '" font-size="11" font-weight="700" letter-spacing="3" fill="' + p.a1 + '">ROOM ' + num + "</text>" +
          '<text x="600" y="66" text-anchor="middle" font-family="' + SERIF + '" font-size="28" font-style="italic" fill="' + p.ink + '">' + esc(trunc(label, 24)) + "</text>",
          style: "@keyframes sw{0%,100%{transform:translateX(-420px)}50%{transform:translateX(420px)}}.sw{animation:sw 10s ease-in-out infinite}" };
      },
      footer: function (m, o, p) {
        var s = '<path d="M60 70 Q210 100 360 70 Q510 100 660 70 Q810 100 960 70 Q1110 100 1140 76" fill="none" stroke="' + p.a2 + '" stroke-width="5" stroke-linecap="round"' + anim(p, "rp") + "/>";
        [60, 360, 660, 960].forEach(function (x) { s += '<rect x="' + (x - 3) + '" y="52" width="6" height="60" fill="' + p.a1 + '"/><circle cx="' + x + '" cy="50" r="7" fill="' + p.a1 + '"/>'; });
        return { svg: s + '<text x="600" y="34" text-anchor="middle" font-family="' + SERIF + '" font-size="18" font-style="italic" fill="' + p.ink + '">Exit through the gift shop · the @' + esc(trunc(m.login, 28)) + " collection</text>",
          style: "@keyframes rp{0%,100%{transform:translateY(0)}50%{transform:translateY(5px)}}.rp{animation:rp 3.6s ease-in-out infinite}" };
      }
    },

    /* ---------- Ink: sumi-e brushwork on washi, with a vermilion seal ---------- */
    ink: {
      pal: { light: { bg1: "#f6f1e7", bg2: "#ece4d4", ink: "#1b1b1b", a1: "#c0392b", a2: "#57534e", line: "#dcd2bf", light: true },
        dark: { bg1: "#131211", bg2: "#1b1a18", ink: "#ece6da", a1: "#e2553f", a2: "#a8a29e", line: "#2c2a27" } },
      font: { sans: SANS, mono: SERIF, display: SERIF }, glow: false,
      frame: function (W, H, p, r) {
        var fibres = "";
        for (var k = 0; k < Math.round(W * H / 2600); k++) {
          var x = r() * W, y = r() * H, l = 6 + r() * 14;
          fibres += '<path d="M' + x.toFixed(0) + " " + y.toFixed(0) + " q" + (l / 2).toFixed(0) + " " + (r() * 6 - 3).toFixed(0) + " " + l.toFixed(0) + " " + (r() * 4 - 2).toFixed(0) + '" fill="none" stroke="' + p.ink + '" stroke-opacity="0.05"/>';
        }
        var mark = esc(String(p.mark || "").slice(0, 2));
        return { back: "<defs>" + clipWF(W, H, 6) + '</defs><g clip-path="url(#wf)"><rect width="' + W + '" height="' + H + '" fill="' + p.bg1 + '"/>' + fibres + "</g>",
          over: '<rect x="0.5" y="0.5" width="' + (W - 1) + '" height="' + (H - 1) + '" rx="5.5" fill="none" stroke="' + p.line + '"/>' +
            '<g transform="rotate(-8 ' + (W - 22) + ' 16)"><g' + anim(p, "wsl") + '><rect x="' + (W - 32) + '" y="6" width="20" height="20" rx="3" fill="' + p.a1 + '" fill-opacity="0.9"/><text x="' + (W - 22) + '" y="20" text-anchor="middle" font-family="' + SERIF + '" font-size="9" font-weight="700" fill="#fff7ee">' + mark + "</text></g></g>" +
            (p.anim ? '<g clip-path="url(#wf)"><g transform="translate(-14 ' + Math.round(H * 0.18) + ')"><g class="wpt">' + petal("#f2a7b8") + "</g></g></g>" : ""),
          style: ".wsl{transform-box:fill-box;transform-origin:center;animation:wsl 6s ease-in-out infinite}@keyframes wsl{0%,82%,100%{transform:scale(1)}86%{transform:scale(1.3)}90%{transform:scale(.9)}94%{transform:scale(1)}}" +
            ".wpt{animation:wpt 13s linear infinite}@keyframes wpt{0%{transform:translate(0,0) rotate(0);opacity:0}8%,90%{opacity:.9}100%{transform:translate(" + (W + 30) + "px," + Math.round(H * 0.6) + "px) rotate(540deg);opacity:0}}" };
      },
      title: function (p, left, right, edge) {
        return '<rect x="28" y="29" width="10" height="10" rx="1.5" fill="' + p.a1 + '"/><text x="46" y="39" font-family="' + SERIF + '" font-size="16" letter-spacing="0.6" fill="' + p.ink + '">' + esc(sentence(left)) + "</text>" +
          (right ? '<text x="' + edge + '" y="39" text-anchor="end" font-family="' + SERIF + '" font-size="11" letter-spacing="2" fill="' + p.ink + '" fill-opacity="0.55">' + esc(right) + "</text>" : "") + brush(28, edge, 52, 4, p.ink);
      },
      cell: function (p, x, y, size, lv) {
        var c = size / 2, rr = lv ? c * (0.4 + lv * 0.14) : c * 0.14;
        return '<ellipse cx="' + (x + c).toFixed(1) + '" cy="' + (y + c).toFixed(1) + '" rx="' + (rr * 1.12).toFixed(1) + '" ry="' + (rr * 0.88).toFixed(1) + '" transform="rotate(' + (Math.round(x * 3 + y) % 60 - 30) + " " + (x + c).toFixed(1) + " " + (y + c).toFixed(1) + ')" fill="' + (lv === 4 ? p.a1 : p.ink) + '" fill-opacity="' + (lv ? 0.25 + lv * 0.17 : 0.12) + '"/>';
      },
      ring: function (p, cx, cy, r, f, arc) {
        var g = Math.min(f, 0.93), C = 2 * Math.PI * r;
        return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + p.ink + '" stroke-opacity="0.07" stroke-width="7"/>' +
          (g > 0 ? '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + p.ink + '" stroke-width="7" stroke-linecap="round" stroke-dasharray="' + (g * C).toFixed(1) + " " + C.toFixed(1) + '" transform="rotate(-60 ' + cx + " " + cy + ')"/>' +
            '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r + 3) + '" fill="none" stroke="' + p.ink + '" stroke-opacity="0.35" stroke-width="1.5" stroke-dasharray="' + (g * C * 0.8).toFixed(1) + " " + (C * 1.2).toFixed(1) + '" transform="rotate(-55 ' + cx + " " + cy + ')"/>' : "");
      },
      banner: function (m, o, p, r, W, H, name, sub, chips) {
        var out = ['<defs><clipPath id="c"><rect width="' + W + '" height="' + H + '" rx="10"/></clipPath><linearGradient id="wash" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + p.ink + '" stop-opacity="0.22"/><stop offset="1" stop-color="' + p.ink + '" stop-opacity="0"/></linearGradient></defs>',
          '<g clip-path="url(#c)"><rect width="' + W + '" height="' + H + '" fill="' + p.bg1 + '"/>'];
        out.push('<path d="M620 300 L760 170 L840 230 L930 120 L1040 210 L1120 160 L1200 220 V300Z" fill="url(#wash)"/><path d="M700 300 L820 210 L900 260 L1010 190 L1120 250 L1200 230 V300Z" fill="url(#wash)" opacity="0.8"/>');
        out.push('<circle cx="170" cy="150" r="96" fill="none" stroke="' + p.ink + '" stroke-opacity="0.08" stroke-width="16"/>');
        out.push('<circle cx="170" cy="150" r="96" fill="none" stroke="' + p.ink + '" stroke-width="14" stroke-linecap="round" stroke-dasharray="560 640" transform="rotate(-70 170 150)"/>');
        out.push('<circle cx="170" cy="150" r="100" fill="none" stroke="' + p.ink + '" stroke-opacity="0.35" stroke-width="2.5" stroke-dasharray="420 640" transform="rotate(-62 170 150)"/>');
        out.push('<text x="320" y="138" font-family="' + SERIF + '" font-size="' + fit(name, 64, 32, 560, 0.5) + '" fill="' + p.ink + '">' + esc(trunc(name, 28)) + "</text>");
        if (sub.main) out.push('<text x="322" y="178" font-family="' + SERIF + '" font-size="20" font-style="italic" fill="' + p.ink + '" fill-opacity="0.75">' + esc(trunc(sub.main, 56)) + "</text>");
        if (chips.length) out.push('<text x="322" y="214" font-family="' + SERIF + '" font-size="13" letter-spacing="3" fill="' + p.a2 + '">' + esc(chips.join(" · ")) + "</text>");
        out.push(brush(320, 760, 236, 6, p.ink));
        out.push('<rect x="1080" y="40" width="74" height="74" rx="6" fill="' + p.a1 + '"/><rect x="1086" y="46" width="62" height="62" rx="4" fill="none" stroke="#fff7ee" stroke-width="2"/><text x="1117" y="90" text-anchor="middle" font-family="' + SERIF + '" font-size="30" font-weight="700" fill="#fff7ee">' + esc(core.initials(m)) + "</text>");
        for (var k = 0; k < 12; k++) {
          var x = Math.round(r() * W), d = (8 + r() * 8).toFixed(1);
          out.push('<g transform="translate(' + x + ' -10)"><g' + anim(p, "pt", "animation-duration:" + d + "s;animation-delay:-" + (r() * 10).toFixed(1) + "s") + ">" + petal("#f2a7b8") + "</g></g>");
        }
        out.push("</g>");
        return { svg: out.join(""), style: "@keyframes pt{0%{transform:translate(0,0) rotate(0)}100%{transform:translate(-160px,330px) rotate(540deg)}}.pt{animation:pt 12s linear infinite}" };
      },
      divider: function (m, o, p, r, W, H, label, num) {
        return { svg: brush(60, 1140, 50, 7, p.ink) + '<rect x="440" y="22" width="320" height="48" fill="' + (p.light ? "#f6f1e7" : "#131211") + '"/>' +
          '<text x="600" y="56" text-anchor="middle" font-family="' + SERIF + '" font-size="26" letter-spacing="1" fill="' + p.ink + '">' + esc(trunc(label, 22)) + "</text>" +
          '<rect x="1100" y="62" width="22" height="22" rx="3" fill="' + p.a1 + '"/><text x="1111" y="77" text-anchor="middle" font-family="' + SERIF + '" font-size="10" font-weight="700" fill="#fff7ee">' + num + "</text>" +
          '<g transform="translate(80 10)"><g' + anim(p, "pt") + ">" + petal("#f2a7b8") + "</g></g>",
          style: "@keyframes pt{0%{transform:translate(0,0) rotate(0)}100%{transform:translate(1040px,70px) rotate(720deg)}}.pt{animation:pt 14s linear infinite}" };
      },
      footer: function (m, o, p, r, W, H) {
        var s = '<defs><linearGradient id="wash" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + p.ink + '" stop-opacity="0.25"/><stop offset="1" stop-color="' + p.ink + '" stop-opacity="0.02"/></linearGradient></defs>' +
          '<path d="M0 120 L120 70 L220 96 L360 52 L480 92 L600 66 L740 100 L860 58 L980 92 L1100 70 L1200 90 V120Z" fill="url(#wash)"/>';
        for (var k = 0; k < 8; k++) s += '<g transform="translate(' + Math.round(r() * W) + ' -10)"><g' + anim(p, "pt", "animation-delay:-" + (r() * 10).toFixed(1) + "s") + ">" + petal("#f2a7b8") + "</g></g>";
        return { svg: s + '<text x="600" y="36" text-anchor="middle" font-family="' + SERIF + '" font-size="18" fill="' + p.ink + '">Brushed by @' + esc(trunc(m.login, 30)) + "</text>",
          style: "@keyframes pt{0%{transform:translate(0,0) rotate(0)}100%{transform:translate(-80px,140px) rotate(360deg)}}.pt{animation:pt 9s linear infinite}" };
      }
    },

    /* ---------- Periodic: a lab notebook with element tiles ---------- */
    periodic: {
      pal: { light: { bg1: "#f8fafc", bg2: "#eef2f7", ink: "#1c2330", a1: "#2563eb", a2: "#e11d48", line: "#d6dce5", light: true },
        dark: { bg1: "#0f141c", bg2: "#151c27", ink: "#e7ecf3", a1: "#60a5fa", a2: "#fb7185", line: "#263041" } },
      font: { sans: GROTESK, mono: MONO, display: GROTESK }, glow: false,
      frame: function (W, H, p) {
        return { back: "<defs>" + clipWF(W, H, 10) + '<pattern id="gp" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M12 0H0V12" fill="none" stroke="' + p.ink + '" stroke-opacity="0.05"/></pattern>' +
          '<pattern id="gP" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0V60" fill="none" stroke="' + p.ink + '" stroke-opacity="0.08"/></pattern></defs>' +
          '<g clip-path="url(#wf)"><rect width="' + W + '" height="' + H + '" fill="' + p.bg1 + '"/><rect width="' + W + '" height="' + H + '" fill="url(#gp)"/><rect width="' + W + '" height="' + H + '" fill="url(#gP)"/></g>',
          over: '<rect x="0.5" y="0.5" width="' + (W - 1) + '" height="' + (H - 1) + '" rx="9.5" fill="none" stroke="' + p.line + '"/>',
          style: ".wtp{transform-box:fill-box;transform-origin:center;animation:wtp 3.4s ease-in-out infinite}@keyframes wtp{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}" +
            ".whc{animation:whc 2.2s ease-in-out infinite}@keyframes whc{0%,100%{opacity:1}50%{opacity:.5}}" };
      },
      title: function (p, left, right, edge) {
        return '<g' + anim(p, "wtp", "animation-delay:-" + (core.hash(left) % 34 / 10).toFixed(1) + "s") + ">" + tile(26, 18, 30, String(core.hash(left) % 118 + 1), symbolOf(left), p.a1, p.ink) + "</g>" +
          '<text x="66" y="39" font-family="' + GROTESK + '" font-size="15" font-weight="800" fill="' + p.ink + '">' + esc(sentence(left)) + "</text>" +
          (right ? '<text x="' + edge + '" y="39" text-anchor="end" font-family="' + MONO + '" font-size="10.5" letter-spacing="1.4" fill="' + p.ink + '" fill-opacity="0.55">' + esc(right) + "</text>" : "") +
          '<rect x="66" y="50" width="' + (edge - 66) + '" height="1" fill="' + p.ink + '" fill-opacity="0.1"/>';
      },
      cell: function (p, x, y, size, lv) {
        return '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + size.toFixed(1) + '" height="' + size.toFixed(1) + '" rx="2" fill="' + (lv === 4 ? p.a2 : lv ? p.a1 : p.ink) + '" fill-opacity="' + (lv === 4 ? 0.9 : lv ? 0.2 + lv * 0.22 : 0.05) + '"' + (lv === 4 ? anim(p, "whc", "animation-delay:-" + ((x * 3 + y) % 22 / 10).toFixed(1) + "s") : "") + "/>";
      },
      ring: function (p, cx, cy, r, f) {
        var n = Math.max(0, Math.round(f * 8)), s = '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.55).toFixed(1) + '" fill="none" stroke="' + p.ink + '" stroke-opacity="0.18"/><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + p.ink + '" stroke-opacity="0.18"/>';
        var e = "";
        for (var k = 0; k < 8; k++) {
          var a = k / 8 * Math.PI * 2 - Math.PI / 2;
          e += '<circle cx="' + (Number(cx) + Math.cos(a) * r).toFixed(1) + '" cy="' + (cy + Math.sin(a) * r).toFixed(1) + '" r="3.6" fill="' + (k < n ? p.a1 : p.ink) + '" fill-opacity="' + (k < n ? 1 : 0.15) + '"/>';
        }
        return s + '<g' + anim(p, "el", "transform-origin:" + cx + "px " + cy + "px") + ">" + e + "</g>";
      },
      cardCss: "@keyframes el{to{transform:rotate(360deg)}}.el{animation:el 18s linear infinite}",
      banner: function (m, o, p, r, W, H, name, sub, chips) {
        var out = ['<defs><clipPath id="c"><rect width="' + W + '" height="' + H + '" rx="12"/></clipPath><pattern id="gp" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M12 0H0V12" fill="none" stroke="' + p.ink + '" stroke-opacity="0.05"/></pattern></defs>',
          '<g clip-path="url(#c)"><rect width="' + W + '" height="' + H + '" fill="' + p.bg1 + '"/><rect width="' + W + '" height="' + H + '" fill="url(#gp)"/>'];
        out.push(tile(56, 50, 196, String(m.publicRepos), symbolOf(core.initials(m) + core.initials(m).toLowerCase()), p.a1, p.ink, "★ " + fmt(m.stars) + ".00"));
        out.push('<text x="290" y="128" font-family="' + GROTESK + '" font-size="' + fit(name, 60, 30, 520, 0.6) + '" font-weight="800" letter-spacing="-1" fill="' + p.ink + '">' + esc(trunc(name, 26)) + "</text>");
        if (sub.main) out.push('<text x="292" y="166" font-family="' + GROTESK + '" font-size="19" fill="' + p.ink + '" fill-opacity="0.7">' + esc(trunc(sub.main, 46)) + "</text>");
        out.push('<text x="292" y="206" font-family="' + MONO + '" font-size="12.5" letter-spacing="1.4" fill="' + p.a1 + '">' + esc(("Element of @" + trunc(m.login, 22) + (m.since ? " · isolated " + m.since : "")).toUpperCase()) + "</text>");
        m.langs.slice(0, 4).forEach(function (l, i) {
          var x = 820 + (i % 2) * 86, y = 46 + Math.floor(i / 2) * 86, c = core.LANG_COLORS[l.name] || p.a1;
          out.push('<g' + anim(p, "pu", "transform-origin:" + (x + 38) + "px " + (y + 38) + "px;animation-delay:-" + i * 0.8 + "s") + ">" + tile(x, y, 76, String(m.all.filter(function (rr) { return rr.lang === l.name; }).length), symbolOf(l.name), c, p.ink, trunc(l.name, 11)) + "</g>");
        });
        var mol = '<line x1="1080" y1="110" x2="1130" y2="80" stroke="' + p.ink + '" stroke-opacity="0.4" stroke-width="3"/><line x1="1080" y1="110" x2="1128" y2="150" stroke="' + p.ink + '" stroke-opacity="0.4" stroke-width="3"/><line x1="1080" y1="110" x2="1050" y2="165" stroke="' + p.ink + '" stroke-opacity="0.4" stroke-width="3"/>' +
          '<circle cx="1080" cy="110" r="16" fill="' + p.a2 + '"/><circle cx="1130" cy="80" r="10" fill="' + p.a1 + '"/><circle cx="1128" cy="150" r="10" fill="' + p.a1 + '"/><circle cx="1050" cy="165" r="10" fill="' + p.a1 + '"/>';
        out.push('<g' + anim(p, "mo", "transform-origin:1088px 118px") + ">" + mol + "</g>");
        if (chips.length) out.push('<text x="820" y="244" font-family="' + MONO + '" font-size="11.5" letter-spacing="1.2" fill="' + p.ink + '" fill-opacity="0.6">' + esc(("Reagents: " + chips.join(", ")).toUpperCase().slice(0, 52)) + "</text>");
        out.push("</g>");
        return { svg: out.join(""), style: "@keyframes pu{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}.pu{animation:pu 3.2s ease-in-out infinite}@keyframes mo{to{transform:rotate(360deg)}}.mo{animation:mo 24s linear infinite}" };
      },
      divider: function (m, o, p, r, W, H, label, num) {
        var s = tile(40, 16, 60, num, symbolOf(label), p.a1, p.ink) + '<text x="116" y="56" font-family="' + GROTESK + '" font-size="26" font-weight="800" fill="' + p.ink + '">' + esc(trunc(label, 22)) + "</text>";
        var x0 = 520, atoms = "";
        for (var k = 0; k < 9; k++) {
          var x = x0 + k * 72, y = 46 + (k % 2 ? -12 : 12);
          if (k) atoms += '<line x1="' + (x - 72) + '" y1="' + (46 + ((k - 1) % 2 ? -12 : 12)) + '" x2="' + x + '" y2="' + y + '" stroke="' + p.ink + '" stroke-opacity="0.3" stroke-width="2.5"/>';
        }
        for (k = 0; k < 9; k++) {
          var ax = x0 + k * 72, ay = 46 + (k % 2 ? -12 : 12);
          atoms += '<g' + anim(p, "vb", "animation-delay:-" + (k * 0.3).toFixed(1) + "s") + '><circle cx="' + ax + '" cy="' + ay + '" r="' + (k % 3 ? 8 : 11) + '" fill="' + (k % 3 ? p.a1 : p.a2) + '"/></g>';
        }
        return { svg: s + atoms, style: "@keyframes vb{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}.vb{animation:vb 1.6s ease-in-out infinite}" };
      },
      footer: function (m, o, p, r) {
        var s = "";
        for (var k = 0; k < 18; k++) s += '<g transform="translate(' + Math.round(80 + r() * 1040) + ' 120)"><circle r="' + (2 + r() * 4).toFixed(1) + '" fill="none" stroke="' + p.a1 + '" stroke-opacity="0.6"' + anim(p, "bb", "animation-duration:" + (3 + r() * 4).toFixed(1) + "s;animation-delay:-" + (r() * 5).toFixed(1) + "s") + "/></g>";
        return { svg: s + '<text x="600" y="44" text-anchor="middle" font-family="' + GROTESK + '" font-size="18" font-weight="700" fill="' + p.ink + '">Experiment logged by @' + esc(trunc(m.login, 28)) + " · results reproducible</text>",
          style: "@keyframes bb{0%{transform:translateY(0);opacity:0}20%{opacity:1}100%{transform:translateY(-110px);opacity:0}}.bb{animation:bb 5s ease-in infinite}" };
      }
    },

    /* ---------- Abyss: the deep sea, lit by plankton ---------- */
    abyss: {
      pal: { dark: { bg1: "#021019", bg2: "#06324a", ink: "#dff6ff", a1: "#3ee6c4", a2: "#8fb5ff", line: "#0d3a4d" },
        light: { bg1: "#e7f7f9", bg2: "#c3eaf1", ink: "#073446", a1: "#0b8b8b", a2: "#2a63c9", line: "#b7dde4", light: true } },
      font: { sans: SANS, mono: MONO, display: SANS }, glow: true,
      frame: function (W, H, p, r) {
        var rays = "", bubbles = "";
        for (var k = 0; k < 3; k++) { var x = W * (0.15 + k * 0.3); rays += '<path d="M' + x + " 0 L" + (x + 60) + " 0 L" + (x - 40) + " " + H + " L" + (x - 120) + " " + H + 'Z" fill="#ffffff" fill-opacity="' + (p.light ? 0.25 : 0.035) + '"' + anim(p, "ry", "transform-origin:" + x + "px 0px;animation-delay:-" + k * 2 + "s") + "/>"; }
        for (k = 0; k < 4; k++) bubbles += '<circle cx="' + Math.round(20 + r() * (W - 40)) + '" cy="' + (H + 6) + '" r="' + (1.5 + r() * 2.5).toFixed(1) + '" fill="none" stroke="' + p.ink + '" stroke-opacity="0.35"' + anim(p, "bu", "animation-duration:" + (5 + r() * 5).toFixed(1) + "s;animation-delay:-" + (r() * 8).toFixed(1) + "s") + "/>";
        return { back: "<defs>" + clipWF(W, H, 14) + '<linearGradient id="dp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + p.bg2 + '"/><stop offset="1" stop-color="' + p.bg1 + '"/></linearGradient></defs>' +
          '<g clip-path="url(#wf)"><rect width="' + W + '" height="' + H + '" fill="url(#dp)"/>' + rays + bubbles + "</g>",
          over: '<rect x="0.5" y="0.5" width="' + (W - 1) + '" height="' + (H - 1) + '" rx="13.5" fill="none" stroke="' + p.line + '"/>',
          style: "@keyframes ry{0%,100%{transform:skewX(0)}50%{transform:skewX(6deg)}}.ry{animation:ry 8s ease-in-out infinite}@keyframes bu{from{transform:translateY(0)}to{transform:translateY(-" + (H + 20) + "px)}}.bu{animation:bu 7s linear infinite}" };
      },
      title: function (p, left, right, edge) {
        return '<circle cx="34" cy="35" r="2.6" fill="' + p.a1 + '"/><path d="M38 29 A8 8 0 0 1 38 41 M42 26 A12 12 0 0 1 42 44" fill="none" stroke="' + p.a1 + '" stroke-width="1.4" stroke-linecap="round"/>' +
          '<text x="52" y="40" font-family="' + SANS + '" font-size="15" font-weight="700" fill="' + p.ink + '">' + esc(sentence(left)) + "</text>" +
          (right ? '<text x="' + edge + '" y="40" text-anchor="end" font-family="' + MONO + '" font-size="10.5" letter-spacing="1.6" fill="' + p.a1 + '">' + esc(right) + "</text>" : "") +
          '<line x1="28" y1="52" x2="' + edge + '" y2="52" stroke="' + p.a1 + '" stroke-opacity="0.3" stroke-dasharray="1 5" stroke-linecap="round"/>';
      },
      cell: function (p, x, y, size, lv) {
        var c = size / 2;
        return '<circle cx="' + (x + c).toFixed(1) + '" cy="' + (y + c).toFixed(1) + '" r="' + (lv ? c * (0.3 + lv * 0.16) : c * 0.14).toFixed(1) + '" fill="' + (lv ? p.a1 : p.ink) + '" fill-opacity="' + (lv ? 0.35 + lv * 0.16 : 0.15) + '"' + (lv >= 3 ? ' filter="url(#glow)"' : "") +
          (lv === 4 ? anim(p, "gl", "animation-delay:-" + ((x * 3 + y) % 25 / 10).toFixed(1) + "s") : "") + "/>";
      },
      ring: function (p, cx, cy, r, f, arc) {
        return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + p.a1 + '" stroke-opacity="0.15" stroke-width="5"/><circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.55).toFixed(1) + '" fill="none" stroke="' + p.a1 + '" stroke-opacity="0.12"/>' + arc(p.a1, 3, ' stroke-linecap="round" filter="url(#glow)"') +
          '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + p.a1 + '" stroke-width="1.5"' + anim(p, "pg", "transform-origin:" + cx + "px " + cy + "px") + ' opacity="0"/>';
      },
      cardCss: "@keyframes gl{0%,100%{opacity:1}50%{opacity:.45}}.gl{animation:gl 2.5s ease-in-out infinite}@keyframes pg{0%{transform:scale(.6);opacity:.8}100%{transform:scale(1.5);opacity:0}}.pg{animation:pg 3s ease-out infinite}",
      banner: function (m, o, p, r, W, H, name, sub, chips) {
        var out = ['<defs><clipPath id="c"><rect width="' + W + '" height="' + H + '" rx="16"/></clipPath><linearGradient id="dp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + p.bg2 + '"/><stop offset="1" stop-color="' + p.bg1 + '"/></linearGradient>' +
          '<filter id="lum" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>',
          '<g clip-path="url(#c)"><rect width="' + W + '" height="' + H + '" fill="url(#dp)"/>'];
        for (var k = 0; k < 4; k++) { var x = 120 + k * 300; out.push('<path d="M' + x + " 0 L" + (x + 80) + " 0 L" + (x - 60) + " " + H + " L" + (x - 160) + " " + H + 'Z" fill="#ffffff" fill-opacity="' + (p.light ? 0.3 : 0.04) + '"' + anim(p, "ry", "transform-origin:" + x + "px 0px;animation-delay:-" + k * 2 + "s") + "/>"); }
        out.push('<g filter="url(#lum)"><g' + anim(p, "jf") + ">" + jelly(930, 120, 1.4, p.a2) + '</g><g' + anim(p, "jf", "animation-delay:-2s;animation-duration:7s") + ">" + jelly(1080, 170, 1, p.a1) + "</g></g>");
        for (k = 0; k < 16; k++) out.push('<circle cx="' + Math.round(r() * W) + '" cy="' + (H + 8) + '" r="' + (1.5 + r() * 3).toFixed(1) + '" fill="none" stroke="' + p.ink + '" stroke-opacity="0.4"' + anim(p, "bu", "animation-duration:" + (5 + r() * 6).toFixed(1) + "s;animation-delay:-" + (r() * 10).toFixed(1) + "s") + "/>");
        out.push('<text x="70" y="78" font-family="' + MONO + '" font-size="13" letter-spacing="3" fill="' + p.a1 + '">' + esc(("Depth " + commas(m.stars * 10 + 200) + " m · @" + trunc(m.login, 24)).toUpperCase()) + "</text>");
        out.push('<text x="68" y="148" font-family="' + SANS + '" font-size="' + fit(name, 62, 30, 700, 0.6) + '" font-weight="800" letter-spacing="-1" fill="' + (p.light ? p.ink : "#ffffff") + '">' + esc(trunc(name, 28)) + "</text>");
        if (sub.main) out.push('<text x="70" y="188" font-family="' + SANS + '" font-size="20" fill="' + p.ink + '" fill-opacity="0.8">' + esc(trunc(sub.main, 58)) + "</text>");
        if (chips.length) out.push('<text x="70" y="232" font-family="' + MONO + '" font-size="13" letter-spacing="2" fill="' + p.a1 + '">' + esc(chips.join(" · ").toUpperCase()) + "</text>");
        out.push("</g>");
        return { svg: out.join(""), style: "@keyframes ry{0%,100%{transform:skewX(0)}50%{transform:skewX(7deg)}}.ry{animation:ry 9s ease-in-out infinite}" +
          "@keyframes jf{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}.jf{animation:jf 5s ease-in-out infinite}" +
          "@keyframes bu{from{transform:translateY(0)}to{transform:translateY(-320px)}}.bu{animation:bu 8s linear infinite}" };
      },
      divider: function (m, o, p, r, W, H, label, num) {
        return { svg: '<defs><linearGradient id="dp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + p.bg2 + '"/><stop offset="1" stop-color="' + p.bg1 + '"/></linearGradient></defs><rect width="' + W + '" height="' + H + '" rx="14" fill="url(#dp)"/>' +
          '<text x="40" y="54" font-family="' + MONO + '" font-size="13" letter-spacing="2" fill="' + p.a1 + '">−' + (Number(num) * 200) + " m</text>" +
          '<text x="600" y="56" text-anchor="middle" font-family="' + SANS + '" font-size="26" font-weight="800" fill="' + (p.light ? p.ink : "#ffffff") + '">' + esc(trunc(label, 24)) + "</text>" +
          '<g transform="translate(-40 78)"><g' + anim(p, "sw") + ">" + fish(p.a1) + '</g></g><g transform="translate(-80 84) scale(.7)"><g' + anim(p, "sw", "animation-delay:-3s;animation-duration:13s") + ">" + fish(p.a2) + "</g></g>",
          style: "@keyframes sw{from{transform:translateX(0)}to{transform:translateX(1320px)}}.sw{animation:sw 10s linear infinite}" };
      },
      footer: function (m, o, p, r, W, H) {
        var s = '<path d="M0 120 L0 96 Q150 84 300 98 T600 92 T900 100 T1200 90 L1200 120Z" fill="' + (p.light ? "#9fcfd8" : "#010a10") + '"/>';
        for (var k = 0; k < 14; k++) {
          var x = Math.round(30 + k * 85 + r() * 30), h = 40 + r() * 50;
          s += '<path d="M' + x + " 112 q-10 -" + (h / 2).toFixed(0) + " 0 -" + h.toFixed(0) + '" fill="none" stroke="' + (p.light ? "#2f8f6b" : "#1d6b52") + '" stroke-width="4" stroke-linecap="round"' + anim(p, "kp", "transform-origin:" + x + "px 112px;animation-delay:-" + (r() * 4).toFixed(1) + "s") + "/>";
        }
        return { svg: s + '<text x="600" y="40" text-anchor="middle" font-family="' + SANS + '" font-size="18" font-weight="700" fill="' + p.ink + '">Back to the surface · @' + esc(trunc(m.login, 30)) + "</text>",
          style: "@keyframes kp{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}.kp{animation:kp 4s ease-in-out infinite}" };
      }
    },

    /* ---------- Voxel: an isometric city of contribution cubes, with a hover-bot ---------- */
    voxel: {
      pal: { light: { bg1: "#f5feff", bg2: "#cad9fb", ink: "#0a2540", a1: "#0a9831", a2: "#0f3fe5", line: "#cfe6f3", light: true },
        dark: { bg1: "#061226", bg2: "#13204a", ink: "#e8f6ff", a1: "#3ddc6e", a2: "#7b8cff", line: "#1b2f52" } },
      font: { sans: SANS, mono: MONO, display: SANS }, glow: true,
      frame: function (W, H, p) {
        return { back: "<defs>" + clipWF(W, H, 14) + vsky("vsk", p, W, H) +
            '<pattern id="vgr" width="40" height="20" patternUnits="userSpaceOnUse"><path d="M0 10 L20 0 L40 10 L20 20Z" fill="none" stroke="' + p.ink + '" stroke-opacity="0.045"/></pattern></defs>' +
            '<g clip-path="url(#wf)">' + vskyFill("vsk", W, H) + '<rect width="' + W + '" height="' + H + '" fill="url(#vgr)"/></g>',
          over: '<rect x="0.5" y="0.5" width="' + (W - 1) + '" height="' + (H - 1) + '" rx="13.5" fill="none" stroke="' + p.line + '"/>',
          style: "" };
      },
      title: function (p, left, right, edge) {
        return '<g' + anim(p, "vxb") + ">" + cube(36, 25, 8, 6, p.a1) + "</g>" +
          '<text x="54" y="40" font-family="' + SANS + '" font-size="15" font-weight="800" fill="' + p.ink + '">' + esc(sentence(left)) + "</text>" +
          (right ? '<text x="' + edge + '" y="40" text-anchor="end" font-family="' + MONO + '" font-size="10.5" letter-spacing="1.6" fill="' + p.a1 + '">' + esc(right) + "</text>" : "") +
          '<line x1="28" y1="52" x2="' + edge + '" y2="52" stroke="' + p.a1 + '" stroke-opacity="0.35"/>';
      },
      cell: function (p, x, y, size, lv) {
        var w = size / 2, h = size / 4, cx = x + w, top = y + size * 0.12;
        if (!lv) return '<path d="M' + cx.toFixed(1) + "," + (top + h * 1.6).toFixed(1) + " l" + w.toFixed(1) + "," + h.toFixed(1) + " l-" + w.toFixed(1) + "," + h.toFixed(1) + " l-" + w.toFixed(1) + ",-" + h.toFixed(1) + 'Z" fill="' + p.ink + '" fill-opacity="0.1"/>';
        var d = size * (0.12 + lv * 0.1), c = mix(p.bg1, p.a1, 0.35 + lv * 0.16);
        return "<g" + (lv === 4 ? anim(p, "vxp", "animation-delay:-" + ((x * 3 + y) % 25 / 10).toFixed(1) + "s") : "") + ">" + cube(cx, top + size - 2 * h - d, w, d, c, h) + "</g>";
      },
      ring: function (p, cx, cy, r, f, arc) {
        var hex = [];
        for (var k = 0; k < 6; k++) { var a = Math.PI / 6 + k * Math.PI / 3; hex.push((Number(cx) + Math.cos(a) * (r + 6)).toFixed(1) + "," + (cy + Math.sin(a) * (r + 6)).toFixed(1)); }
        return '<polygon points="' + hex.join(" ") + '" fill="none" stroke="' + p.ink + '" stroke-opacity="0.18"/><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + p.a1 + '" stroke-opacity="0.15" stroke-width="5"/>' + arc(p.a1, 5, ' stroke-linecap="round"');
      },
      cardCss: "@keyframes vxp{0%,100%{opacity:1}50%{opacity:.55}}.vxp{animation:vxp 2.4s ease-in-out infinite}@keyframes vxb{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}.vxb{animation:vxb 2.8s ease-in-out infinite}",
      banner: function (m, o, p, r, W, H, name, sub, chips) {
        var out = ['<defs><clipPath id="c"><rect width="' + W + '" height="' + H + '" rx="16"/></clipPath>' + vsky("vsk", p, W, H) + BOT_DEFS(p) + "</defs>",
          '<g clip-path="url(#c)">' + vskyFill("vsk", W, H)];
        // frosted glass blocks low on the left, then the last eight weeks as a city, a stack per day
        out.push('<g' + anim(p, "vfl") + ">" + glassCube(560, 230, 46, 46, p) + glassCube(640, 250, 40, 40, p) + "</g>");
        out.push(city(m, p, 930, 80, 7, 8, 21, 10.5, 16, r));
        out.push('<g transform="translate(760 70)"><g' + anim(p, "vfly") + ">" + bot(0, 0, 0.95, p) + "</g></g>");
        out.push('<text x="70" y="80" font-family="' + MONO + '" font-size="13" letter-spacing="3" fill="' + p.a1 + '">' + esc(("Built block by block · @" + trunc(m.login, 24)).toUpperCase()) + "</text>");
        out.push('<text x="68" y="148" font-family="' + SANS + '" font-size="' + fit(name, 60, 30, 640, 0.6) + '" font-weight="800" letter-spacing="-1" fill="' + p.ink + '">' + esc(trunc(name, 26)) + "</text>");
        if (sub.main) out.push('<text x="70" y="188" font-family="' + SANS + '" font-size="20" fill="' + p.ink + '" fill-opacity="0.75">' + esc(trunc(sub.main, 52)) + "</text>");
        if (chips.length) out.push('<text x="70" y="232" font-family="' + MONO + '" font-size="13" letter-spacing="2" fill="' + p.a2 + '">' + esc(chips.join(" · ").toUpperCase()) + "</text>");
        out.push('</g><rect x="0.5" y="0.5" width="' + (W - 1) + '" height="' + (H - 1) + '" rx="15.5" fill="none" stroke="' + p.line + '"/>');
        return { svg: out.join(""), style: BOT_CSS + "@keyframes vfly{0%,100%{transform:translate(0,0)}25%{transform:translate(-70px,18px)}50%{transform:translate(-20px,34px)}75%{transform:translate(50px,12px)}}.vfly{animation:vfly 12s ease-in-out infinite}" +
          "@keyframes vfl{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}.vfl{animation:vfl 6s ease-in-out infinite}" +
          "@keyframes vxp{0%,100%{opacity:1}50%{opacity:.5}}.vxp{animation:vxp 2.4s ease-in-out infinite}" };
      },
      divider: function (m, o, p, r, W, H, label, num) {
        var out = ['<defs><clipPath id="c"><rect width="' + W + '" height="' + H + '" rx="14"/></clipPath>' + vsky("vsk", p, W, H) + BOT_DEFS(p) + '</defs><g clip-path="url(#c)">' + vskyFill("vsk", W, H) + "</g>"];
        for (var k = 0; k < 9; k++) out.push(cube(80 + k * 22, 44 - (k % 3) * 5, 11, 8 + (k % 3) * 5, k === 8 ? p.a1 : mix(p.a1, p.bg1, 0.25 + (k % 3) * 0.15)));
        for (k = 0; k < 9; k++) out.push(cube(W - 80 - k * 22, 44 - (k % 3) * 5, 11, 8 + (k % 3) * 5, k === 8 ? p.a2 : mix(p.a2, p.bg1, 0.25 + (k % 3) * 0.15)));
        out.push('<text x="40" y="30" font-family="' + MONO + '" font-size="11" letter-spacing="2" fill="' + p.a1 + '">LEVEL ' + num + "</text>");
        out.push('<text x="600" y="56" text-anchor="middle" font-family="' + SANS + '" font-size="26" font-weight="800" fill="' + p.ink + '">' + esc(trunc(label, 24)) + "</text>");
        out.push('<g transform="translate(-40 20) scale(.42)"><g' + anim(p, "vcross") + ">" + bot(0, 0, 1, p) + "</g></g>");
        return { svg: out.join(""), style: BOT_CSS + "@keyframes vcross{from{transform:translateX(0)}to{transform:translateX(3100px)}}.vcross{animation:vcross 14s linear infinite}" };
      },
      footer: function (m, o, p, r, W, H) {
        var s = '<defs>' + BOT_DEFS(p) + '</defs>', daily = m.activity && m.activity.daily ? m.activity.daily.slice(-48) : [], mx = Math.max.apply(null, daily.concat([1]));
        for (var k = 0; k < 48; k++) { var v = daily.length ? daily[k] || 0 : (k * 7 % 5); s += cube(14 + k * 25, 104 - 6 - Math.round((v / (daily.length ? mx : 5)) * 26), 12.5, 6 + Math.round((v / (daily.length ? mx : 5)) * 26), mix(p.a1, p.bg1, v ? 0.1 : 0.6)); }
        s += '<g transform="translate(1110 4) scale(.5)"><g' + anim(p, "vxb") + ">" + bot(0, 0, 1, p) + "</g></g>";
        return { svg: s + '<text x="600" y="40" text-anchor="middle" font-family="' + SANS + '" font-size="18" font-weight="700" fill="' + p.ink + '">Built block by block · @' + esc(trunc(m.login, 30)) + "</text>",
          style: BOT_CSS + "@keyframes vxb{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}.vxb{animation:vxb 2.8s ease-in-out infinite}" };
      }
    }
  };
  function commas(n) { return String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  Object.keys(NEW).forEach(function (k) { DEF[k] = { light: NEW[k].pal.light, dark: NEW[k].pal.dark, font: NEW[k].font, glow: NEW[k].glow }; });

  /* ---------- card frames ---------- */
  /** Wraps a card body in the world's frame. defs come from cards.js (gradients the card bodies use). */
  function frame(W, H, label, p, body, defs) {
    var w = p.world, r = rng((p.seed || 1) + W * 7 + H), o = svgOpen(W, H, label) + defs, back = "", over = "", style = "";
    if (NEW[w]) { var nf = NEW[w].frame(W, H, p, r); return o + css(p, nf.style) + nf.back + "<g>" + body + "</g>" + nf.over + "</svg>"; }
    var clip = '<clipPath id="wf"><rect width="' + W + '" height="' + H + '" rx="' + ({ airport: 14, transit: 10, broadsheet: 2, observatory: 16, botanical: 6 }[w]) + '"/></clipPath>';
    if (w === "airport") {
      back = '<defs>' + clip + '<linearGradient id="wb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d1d21"/><stop offset="1" stop-color="#0c0c0e"/></linearGradient>' +
        '<pattern id="lv" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#ffffff" fill-opacity="0.025"/></pattern>' + TILE_DEF + "</defs>" +
        '<g clip-path="url(#wf)"><rect width="' + W + '" height="' + H + '" fill="url(#wb)"/><rect width="' + W + '" height="' + H + '" fill="url(#lv)"/>' +
        '<rect x="0" y="0" width="' + W + '" height="1" fill="#ffffff" fill-opacity="0.08"/></g>';
      over = '<rect x="0.5" y="0.5" width="' + (W - 1) + '" height="' + (H - 1) + '" rx="13.5" fill="none" stroke="#2c2c31"/>';
      style = ".wft{transform-box:fill-box;transform-origin:center;animation:wft 7s ease-in-out infinite}@keyframes wft{0%,88%{transform:scaleY(1)}91%{transform:scaleY(.05)}94%{transform:scaleY(1)}}" +
        ".wfk{animation:wfk 3.2s steps(1) infinite}@keyframes wfk{0%,100%{opacity:1}46%{opacity:.35}54%{opacity:1}}" +
        ".wlp{animation:wlp 1.4s steps(2) infinite}@keyframes wlp{50%{opacity:.2}}";
    } else if (w === "transit") {
      var bands = p.stripe && p.stripe.length ? p.stripe : [p.a1], bw = W / bands.length;
      back = "<defs>" + clip + '</defs><g clip-path="url(#wf)"><rect width="' + W + '" height="' + H + '" fill="' + p.bg1 + '"/>' +
        bands.map(function (c, i) { return '<rect x="' + (i * bw).toFixed(1) + '" y="0" width="' + (bw + 0.5).toFixed(1) + '" height="7" fill="' + c + '"/>'; }).join("") + "</g>";
      over = '<rect x="0.5" y="0.5" width="' + (W - 1) + '" height="' + (H - 1) + '" rx="9.5" fill="none" stroke="' + p.line + '"/>' +
        '<g clip-path="url(#wf)"><rect x="-34" y="1.5" width="28" height="4" rx="2" fill="#ffffff" stroke="' + p.ink + '" stroke-width="1"' + anim(p, "wtr") + "/></g>";
      style = ".wtr{animation:wtr " + Math.max(5, Math.round(W / 70)) + "s linear infinite}@keyframes wtr{to{transform:translateX(" + (W + 70) + "px)}}";
    } else if (w === "broadsheet") {
      back = "<defs>" + clip + '<pattern id="gr" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.6" fill="' + p.ink + '" fill-opacity="0.07"/><circle cx="4" cy="4" r="0.5" fill="' + p.ink + '" fill-opacity="0.05"/></pattern></defs>' +
        '<rect width="' + W + '" height="' + H + '" fill="' + p.bg1 + '"/><rect width="' + W + '" height="' + H + '" fill="url(#gr)"/>' +
        '<rect x="14" y="10" width="' + (W - 28) + '" height="2.5" fill="' + p.ink + '"/><rect x="14" y="15" width="' + (W - 28) + '" height="0.8" fill="' + p.ink + '"/>' +
        '<rect x="14" y="' + (H - 11) + '" width="' + (W - 28) + '" height="0.8" fill="' + p.ink + '"/>';
      over = '<defs><linearGradient id="rl" x1="0" x2="1"><stop offset="0" stop-color="' + p.a1 + '" stop-opacity="0"/><stop offset="0.5" stop-color="' + p.a1 + '"/><stop offset="1" stop-color="' + p.a1 + '" stop-opacity="0"/></linearGradient></defs>' +
        '<rect x="14" y="9.2" width="120" height="3.8" fill="url(#rl)"' + anim(p, "wro") + "/>";
      style = ".wro{animation:wro 6s ease-in-out infinite alternate}@keyframes wro{to{transform:translateX(" + (W - 148) + "px)}}";
    } else if (w === "observatory") {
      back = "<defs>" + clip + '<radialGradient id="wb" cx="0.3" cy="0.2" r="1"><stop offset="0" stop-color="' + p.bg2 + '"/><stop offset="1" stop-color="' + p.bg1 + '"/></radialGradient></defs>' +
        '<g clip-path="url(#wf)"><rect width="' + W + '" height="' + H + '" fill="url(#wb)"/>' +
        '<path d="M' + (-W * 0.1) + " " + (H * 1.1) + " Q" + (W * 0.5) + " " + (-H * 0.4) + " " + (W * 1.1) + " " + (H * 1.1) + '" fill="none" stroke="' + p.a1 + '" stroke-opacity="0.08"/>' +
        '<path d="M' + (-W * 0.1) + " " + (H * 1.4) + " Q" + (W * 0.5) + " " + (-H * 0.1) + " " + (W * 1.1) + " " + (H * 1.4) + '" fill="none" stroke="' + p.a1 + '" stroke-opacity="0.06" stroke-dasharray="2 6"/>' +
        stars(p, r, W, H, Math.round(W * H / 4000), true) + "</g>";
      over = '<rect x="0.5" y="0.5" width="' + (W - 1) + '" height="' + (H - 1) + '" rx="15.5" fill="none" stroke="' + p.line + '"/>';
      style = "@keyframes tw{50%{opacity:.15}}.tw{animation:tw 3s ease-in-out infinite}";
    } else if (w === "botanical") {
      back = "<defs>" + clip + '<pattern id="gr" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="0.6" fill="' + p.ink + '" fill-opacity="0.05"/></pattern></defs>' +
        '<g clip-path="url(#wf)"><rect width="' + W + '" height="' + H + '" fill="' + p.bg1 + '"/><rect width="' + W + '" height="' + H + '" fill="url(#gr)"/></g>';
      // tape at the top corners, and a sprig in the bottom corner that sways
      over = '<rect x="0.5" y="0.5" width="' + (W - 1) + '" height="' + (H - 1) + '" rx="5.5" fill="none" stroke="' + p.line + '"/>' +
        '<rect x="-10" y="-8" width="58" height="18" fill="' + (p.light ? "#e9dfb8" : "#3d4a3a") + '" fill-opacity="0.75" transform="rotate(-24 20 0)"/>' +
        '<rect x="' + (W - 48) + '" y="-8" width="58" height="18" fill="' + (p.light ? "#e9dfb8" : "#3d4a3a") + '" fill-opacity="0.75" transform="rotate(24 ' + (W - 20) + ' 0)"/>' +
        '<g' + anim(p, "sw", "transform-origin:" + (W - 18) + "px " + (H - 6) + "px") + '><path d="M' + (W - 18) + " " + (H - 6) + " Q" + (W - 26) + " " + (H - 30) + " " + (W - 22) + " " + (H - 52) + '" fill="none" stroke="' + p.a1 + '" stroke-width="1.6"/>' +
        leaf(W - 21, H - 22, 14, 200, p.a1) + leaf(W - 23, H - 36, 12, -20, p.a1) + leaf(W - 22, H - 48, 10, 210, p.a1) + "</g>";
      style = "@keyframes sw{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}.sw{animation:sw 5s ease-in-out infinite}";
    }
    return o + css(p, style) + back + "<g>" + body + "</g>" + over + "</svg>";
  }

  /* ---------- section titles inside cards ---------- */
  function title(p, left, right, W) {
    var w = p.world, edge = (W || 420) - 28, s = "";
    if (NEW[w]) return NEW[w].title(p, left, right, edge);
    if (w === "airport") {
      s += '<g' + anim(p, "wft", "animation-delay:-" + (core.hash(left) % 70 / 10).toFixed(1) + "s") + '><rect x="26" y="25" width="18" height="21" rx="2.5" fill="url(#tile)"/><text x="35" y="40" text-anchor="middle" font-family="' + SANS + '" font-size="12" fill="' + p.a1 + '">✈</text><rect x="26" y="35" width="18" height="0.8" fill="#000"/></g>';
      s += '<text x="52" y="40" font-family="' + MONO + '" font-size="13" font-weight="800" letter-spacing="2.4" fill="' + p.a1 + '">' + esc(left) + "</text>";
      if (right) s += '<text x="' + edge + '" y="40" text-anchor="end" font-family="' + SANS + '" font-size="11" font-weight="600" letter-spacing="2" fill="#8a8a8f">' + esc(right) + "</text>";
      // a status lamp, like the indicator beside every line of a real board
      s += '<circle cx="' + (edge + 12) + '" cy="36" r="3.5" fill="' + p.a1 + '"' + anim(p, "wlp") + "/>";
      s += '<rect x="28" y="51" width="' + (edge - 28) + '" height="1" fill="#2a2a2e"/>';
    } else if (w === "transit") {
      s += roundel(40, 35, 10, p);
      s += '<text x="62" y="40" font-family="' + GROTESK + '" font-size="15" font-weight="800" letter-spacing="0.4" fill="' + p.ink + '">' + esc(sentence(left)) + "</text>";
      if (right) s += '<text x="' + edge + '" y="40" text-anchor="end" font-family="' + GROTESK + '" font-size="12" font-weight="600" fill="' + p.ink + '" fill-opacity="0.55">' + esc(sentence(right)) + "</text>";
    } else if (w === "broadsheet") {
      s += '<text x="28" y="40" font-family="' + SERIF + '" font-size="12.5" font-weight="700" letter-spacing="2.2" fill="' + p.a1 + '">' + esc(left) + "</text>";
      if (right) s += '<text x="' + edge + '" y="40" text-anchor="end" font-family="' + SERIF + '" font-size="12" font-style="italic" fill="' + p.ink + '" fill-opacity="0.6">' + esc(sentence(right)) + "</text>";
      s += '<rect x="28" y="49" width="' + (edge - 28) + '" height="0.8" fill="' + p.ink + '"/>';
    } else if (w === "observatory") {
      s += '<circle cx="34" cy="35" r="5" fill="none" stroke="' + p.a2 + '" stroke-width="1.4"/><circle cx="34" cy="35" r="1.6" fill="' + p.a2 + '"/>';
      s += '<text x="48" y="40" font-family="' + SERIF + '" font-size="16" font-style="italic" fill="' + p.ink + '">' + esc(sentence(left)) + "</text>";
      if (right) s += '<text x="' + edge + '" y="40" text-anchor="end" font-family="' + MONO + '" font-size="10.5" letter-spacing="1.6" fill="' + p.a1 + '" fill-opacity="0.75">' + esc(right) + "</text>";
      s += '<line x1="28" y1="52" x2="' + edge + '" y2="52" stroke="' + p.a1 + '" stroke-opacity="0.3" stroke-dasharray="1 4"/>';
    } else if (w === "botanical") {
      s += leaf(28, 36, 14, -35, p.a1);
      s += '<text x="48" y="40" font-family="' + SERIF + '" font-size="17" font-style="italic" fill="' + p.ink + '">' + esc(sentence(left)) + "</text>";
      if (right) s += '<text x="' + edge + '" y="40" text-anchor="end" font-family="' + SANS + '" font-size="10.5" font-weight="600" letter-spacing="1.8" fill="' + p.ink + '" fill-opacity="0.5">' + esc(right) + "</text>";
      s += '<rect x="28" y="51" width="' + (edge - 28) + '" height="0.8" fill="' + p.ink + '" fill-opacity="0.25"/>';
    }
    return s;
  }

  /* ---------- heatmap cells and streak gauges ---------- */
  var OP = [0.07, 0.3, 0.5, 0.75, 1];
  function cell(p, x, y, size, lv) {
    var w = p.world, c = size / 2, X = x.toFixed(1), Y = y.toFixed(1);
    if (NEW[w]) return NEW[w].cell(p, x, y, size, lv);
    if (w === "airport") return '<rect x="' + X + '" y="' + Y + '" width="' + size.toFixed(1) + '" height="' + size.toFixed(1) + '" rx="1.5" fill="#26262b"/>' +
      (lv ? '<rect x="' + X + '" y="' + Y + '" width="' + size.toFixed(1) + '" height="' + size.toFixed(1) + '" rx="1.5" fill="' + p.a1 + '" fill-opacity="' + OP[lv] + '"/>' : "") +
      '<rect x="' + X + '" y="' + (y + c - 0.4).toFixed(1) + '" width="' + size.toFixed(1) + '" height="0.8" fill="#000" fill-opacity="0.7"/>' +
      (lv === 4 ? '<rect x="' + X + '" y="' + Y + '" width="' + size.toFixed(1) + '" height="' + size.toFixed(1) + '" rx="1.5" fill="#fff6c4" fill-opacity="0.45"' + anim(p, "wfk", "animation-delay:-" + ((x * 7 + y) % 32 / 10).toFixed(1) + "s") + "/>" : "");
    if (w === "transit") return '<circle cx="' + (x + c).toFixed(1) + '" cy="' + (y + c).toFixed(1) + '" r="' + (c * 0.92).toFixed(1) + '" fill="' + (lv ? p.a1 : p.bg1) + '" fill-opacity="' + (lv ? OP[lv] : 1) + '" stroke="' + p.ink + '" stroke-opacity="' + (lv ? 0 : 0.18) + '"/>';
    if (w === "broadsheet") return '<circle cx="' + (x + c).toFixed(1) + '" cy="' + (y + c).toFixed(1) + '" r="' + (lv ? c * (0.35 + lv * 0.16) : c * 0.16).toFixed(1) + '" fill="' + p.ink + '" fill-opacity="' + (lv ? 0.88 : 0.25) + '"/>';
    if (w === "observatory") return '<circle cx="' + (x + c).toFixed(1) + '" cy="' + (y + c).toFixed(1) + '" r="' + (lv ? c * (0.25 + lv * 0.17) : c * 0.12).toFixed(1) + '" fill="' + (lv >= 3 ? p.a2 : "#ffffff") + '" fill-opacity="' + (lv ? 0.55 + lv * 0.1 : 0.2) + '"' +
      (lv === 4 ? anim(p, "tw", "animation-delay:-" + ((x * 7 + y) % 30 / 10).toFixed(1) + "s") : "") + "/>";
    return lv ? leaf(x + 1, y + c, size - 1, -30 + (Math.round(x + y) % 3) * 15, p.a1).replace("/>", ' fill-opacity="' + OP[lv] + '"/>') : '<circle cx="' + (x + c).toFixed(1) + '" cy="' + (y + c).toFixed(1) + '" r="1.2" fill="' + p.ink + '" fill-opacity="0.2"/>';
  }

  function ring(p, cx, cy, r, frac) {
    var w = p.world, f = Math.max(0, Math.min(1, frac)), C = 2 * Math.PI * r, s = "";
    function arc(stroke, width, extra) {
      return f > 0 ? '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + stroke + '" stroke-width="' + width + '" stroke-dasharray="' + (f * C).toFixed(1) + " " + C.toFixed(1) + '" transform="rotate(-90 ' + cx + " " + cy + ')"' + (extra || "") + "/>" : "";
    }
    if (NEW[w]) return NEW[w].ring(p, cx, cy, r, f, arc);
    if (w === "airport") {
      for (var t = 0; t < 24; t++) {
        var a = t / 24 * Math.PI * 2 - Math.PI / 2, on = t / 24 < f;
        s += '<line x1="' + (Number(cx) + Math.cos(a) * (r - 4)).toFixed(1) + '" y1="' + (cy + Math.sin(a) * (r - 4)).toFixed(1) + '" x2="' + (Number(cx) + Math.cos(a) * (r + 4)).toFixed(1) + '" y2="' + (cy + Math.sin(a) * (r + 4)).toFixed(1) + '" stroke="' + (on ? p.a1 : "#2c2c31") + '" stroke-width="3" stroke-linecap="round"/>';
      }
      return s;
    }
    if (w === "transit") {
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + p.ink + '" stroke-opacity="0.1" stroke-width="8"/>' + arc(p.a2, 8, ' stroke-linecap="round"');
      [0, 0.25, 0.5, 0.75].forEach(function (q) {
        var a = q * Math.PI * 2 - Math.PI / 2;
        s += '<circle cx="' + (Number(cx) + Math.cos(a) * r).toFixed(1) + '" cy="' + (cy + Math.sin(a) * r).toFixed(1) + '" r="4" fill="' + p.bg1 + '" stroke="' + p.ink + '" stroke-width="2"/>';
      });
      return s;
    }
    if (w === "broadsheet") return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + p.ink + '" stroke-opacity="0.35" stroke-width="1"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r + 5) + '" fill="none" stroke="' + p.ink + '" stroke-opacity="0.2" stroke-width="0.6"/>' + arc(p.a1, 5);
    if (w === "observatory") {
      var ang = f * 360 - 90, px = Number(cx) + Math.cos(ang * Math.PI / 180) * r, py = cy + Math.sin(ang * Math.PI / 180) * r;
      return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + r + '" ry="' + r + '" fill="none" stroke="' + p.a1 + '" stroke-opacity="0.25" stroke-dasharray="2 4"/>' + arc(p.a1, 1.6) +
        '<g' + anim(p, "orb", "transform-origin:" + cx + "px " + cy + "px") + '><circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="4.5" fill="' + p.a2 + '" filter="url(#glow)"/></g>';
    }
    if (w === "botanical") {
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + p.ink + '" stroke-opacity="0.12" stroke-width="1.4"/>' + arc(p.a1, 2);
      var n = Math.round(f * 14);
      for (var k = 0; k < n; k++) {
        var aa = (k + 0.5) / 14 * Math.PI * 2 - Math.PI / 2, lx = Number(cx) + Math.cos(aa) * r, ly = cy + Math.sin(aa) * r;
        s += leaf(lx, ly, 9, aa * 180 / Math.PI + (k % 2 ? 50 : -50) + 90, p.a1);
      }
      return s;
    }
    return s;
  }
  /** Extra motion rules some cells and gauges use (twinkling stars, orbiting planets). */
  function cardCss(p) {
    if (!p.anim) return "";
    if (NEW[p.world] && NEW[p.world].cardCss) return "<style>" + NEW[p.world].cardCss + "@media (prefers-reduced-motion:reduce){*{animation:none!important}}</style>";
    if (p.world === "observatory") return "<style>@keyframes orb{to{transform:rotate(360deg)}}.orb{animation:orb 14s linear infinite}@media (prefers-reduced-motion:reduce){*{animation:none!important}}</style>";
    return "";
  }

  /* ---------- banners ---------- */
  function banner(m, o, p) {
    var w = p.world, W = 1200, H = 300, r = rng(core.hash(m.login + w)), sub = core.subtitle(m, o), name = m.name || m.login, out = [], style = "";
    var chips = core.chipNames(m, o).slice(0, 4), since = m.since ? m.since : "";
    if (NEW[w]) { var nb = NEW[w].banner(m, o, p, r, W, H, name, sub, chips); return svgOpen(W, H, name + (sub.main ? ", " + sub.main : "")) + css(p, nb.style) + nb.svg + "</svg>"; }
    if (w === "airport") {
      out.push("<defs>" + TILE_DEF + '<linearGradient id="bb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#202024"/><stop offset="1" stop-color="#0c0c0e"/></linearGradient><clipPath id="c"><rect width="' + W + '" height="' + H + '" rx="18"/></clipPath></defs>');
      out.push('<g clip-path="url(#c)"><rect width="' + W + '" height="' + H + '" fill="url(#bb)"/>');
      out.push('<text x="50" y="58" font-family="' + SANS + '" font-size="15" font-weight="700" letter-spacing="3" fill="#8a8a8f">✈ NOW DEPARTING · @' + esc(trunc(m.login, 30).toUpperCase()) + "</text>");
      var nm = trunc(name, 22).replace(/…$/, ""), tw = Math.min(46, Math.floor(1080 / nm.length) - 4);
      out.push(flaps(p, r, nm, 50, 84, tw, Math.round(tw * 1.42), Math.round(tw * 1.02), p.a1, 0.4));
      if (sub.main) out.push('<text x="50" y="' + (84 + tw * 1.42 + 44).toFixed(0) + '" font-family="' + SANS + '" font-size="19" font-weight="600" letter-spacing="3" fill="#c9c9cd">' + esc(trunc(sub.main, 64).toUpperCase()) + "</text>");
      var st = "★" + fmt(m.stars);
      out.push(flaps(p, r, st, W - 50 - st.length * 25, 34, 22, 32, 18, p.a1, 0.5));
      if (chips.length) out.push('<text x="50" y="' + (H - 34) + '" font-family="' + MONO + '" font-size="14" font-weight="700" letter-spacing="2" fill="' + p.a1 + '">' + esc(("GATES: " + chips.join(" · ")).toUpperCase()) + "</text>");
      out.push("</g>");
      style = FLAP_CSS;
    } else if (w === "transit") {
      var langs = m.langs.slice(0, 5), cols = langs.map(function (l) { return core.LANG_COLORS[l.name] || p.a1; });
      out.push('<defs><clipPath id="c"><rect width="' + W + '" height="' + H + '" rx="18"/></clipPath></defs><g clip-path="url(#c)"><rect width="' + W + '" height="' + H + '" fill="' + p.bg1 + '"/>');
      out.push(roundel(110, 116, 46, p));
      var ns = fit(name, 64, 34, 860, 0.58);
      out.push('<text x="196" y="138" font-family="' + GROTESK + '" font-size="' + ns + '" font-weight="800" letter-spacing="-1" fill="' + p.ink + '">' + esc(trunc(name, 30)) + "</text>");
      if (sub.main) out.push('<text x="198" y="176" font-family="' + GROTESK + '" font-size="20" font-weight="600" fill="' + p.ink + '" fill-opacity="0.7">' + esc(trunc(sub.main, 70)) + "</text>");
      // the line along the bottom: one station per language
      var y = 240, path = "M60 " + y + " H" + (W - 60), lc = cols.length ? cols[0] : p.a1;
      out.push('<path d="' + path + '" stroke="' + lc + '" stroke-width="12" stroke-linecap="round"/>');
      langs.forEach(function (l, i) {
        var x = 120 + i * ((W - 240) / Math.max(1, langs.length - 1 || 1)), c = cols[i];
        if (langs.length === 1) x = W / 2;
        out.push('<circle cx="' + x.toFixed(0) + '" cy="' + y + '" r="11" fill="' + p.bg1 + '" stroke="' + p.ink + '" stroke-width="4"/><rect x="' + (x - 18).toFixed(0) + '" y="' + (y - 34) + '" width="36" height="6" rx="3" fill="' + c + '"/>');
        out.push('<text x="' + x.toFixed(0) + '" y="' + (y + 36) + '" text-anchor="middle" font-family="' + GROTESK + '" font-size="15" font-weight="700" fill="' + p.ink + '">' + esc(trunc(l.name, 14)) + "</text>");
      });
      out.push('<rect x="-18" y="-7" width="36" height="14" rx="7" fill="#ffffff" stroke="' + p.ink + '" stroke-width="2.5" style="offset-path:path(\'' + path + "');offset-distance:30%" + (p.anim ? "" : "") + '"' + anim(p, "tr") + "/>");
      out.push("</g>");
      style = "@keyframes tr{from{offset-distance:0%}to{offset-distance:100%}}.tr{animation:tr 14s linear infinite}";
    } else if (w === "broadsheet") {
      out.push('<rect width="' + W + '" height="' + H + '" rx="6" fill="' + p.bg1 + '"/>');
      out.push('<rect x="40" y="30" width="' + (W - 80) + '" height="3" fill="' + p.ink + '"/>');
      out.push('<g font-family="' + SERIF + '" font-size="13" font-weight="700" letter-spacing="1.6" fill="' + p.ink + '"><text x="44" y="56">' + (since ? "ESTABLISHED " + since : "FIRST EDITION") + '</text><text x="' + (W - 44) + '" y="56" text-anchor="end">EDITION No. ' + esc(String(m.publicRepos)) + " · @" + esc(trunc(m.login, 24).toUpperCase()) + "</text></g>");
      out.push('<rect x="40" y="68" width="' + (W - 80) + '" height="1" fill="' + p.ink + '"/>');
      var mh = "The " + trunc(name, 26) + " Gazette";
      out.push('<text x="' + 470 + '" y="152" text-anchor="middle" font-family="' + SERIF + '" font-size="' + fit(mh, 74, 32, 840, 0.6) + '" font-weight="700" letter-spacing="-1.5" fill="' + p.ink + '">' + esc(mh) + "</text>");
      out.push('<rect x="40" y="176" width="' + (W - 80) + '" height="1" fill="' + p.ink + '"/><rect x="40" y="181" width="' + (W - 80) + '" height="3" fill="' + p.ink + '"/>');
      if (sub.main) out.push('<text x="' + W / 2 + '" y="222" text-anchor="middle" font-family="' + SERIF + '" font-size="22" font-style="italic" fill="' + p.ink + '" fill-opacity="0.8">' + esc(trunc(sub.main.replace(/[.!]+$/, ""), 80)) + ".</text>");
      if (chips.length) out.push('<text x="' + W / 2 + '" y="262" text-anchor="middle" font-family="' + SERIF + '" font-size="14" font-weight="700" letter-spacing="2.4" fill="' + p.a1 + '">' + esc(chips.join("  ·  ").toUpperCase()) + "</text>");
      out.push("<g" + anim(p, "ex", "transform-origin:1060px 120px") + '><g transform="rotate(-10 1060 120)"><rect x="1000" y="96" width="120" height="48" rx="6" fill="' + p.bg1 + '" stroke="' + p.a1 + '" stroke-width="3"/><text x="1060" y="130" text-anchor="middle" font-family="' + SERIF + '" font-size="26" font-weight="700" fill="' + p.a1 + '">EXTRA!</text></g></g>');
      style = "@keyframes ex{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}.ex{animation:ex 1.8s ease-in-out infinite}";
    } else if (w === "observatory") {
      out.push('<defs><radialGradient id="sky" cx="0.3" cy="0.2" r="1"><stop offset="0" stop-color="' + p.bg2 + '"/><stop offset="1" stop-color="' + p.bg1 + '"/></radialGradient><clipPath id="c"><rect width="' + W + '" height="' + H + '" rx="18"/></clipPath>' +
        '<filter id="gw" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>');
      out.push('<g clip-path="url(#c)"><rect width="' + W + '" height="' + H + '" fill="url(#sky)"/>' + stars(p, r, W, H, 140, true));
      out.push('<path d="M-60 300 Q600 -120 1260 300" fill="none" stroke="' + p.a1 + '" stroke-opacity="0.1"/><path d="M-60 360 Q600 0 1260 360" fill="none" stroke="' + p.a1 + '" stroke-opacity="0.07" stroke-dasharray="2 6"/>');
      // the orrery on the right: three orbits, one planet each
      [[60, 9, p.a2], [100, 14, p.a1], [140, 22, "#ff9fb2"]].forEach(function (o2, i) {
        out.push('<ellipse cx="980" cy="150" rx="' + o2[0] + '" ry="' + o2[0] * 0.42 + '" fill="none" stroke="#ffffff" stroke-opacity="0.18"/>');
        out.push('<g' + anim(p, "pl", "animation-duration:" + o2[1] + "s;animation-delay:-" + (i * 3) + "s") + '><circle cx="' + (980 + o2[0]) + '" cy="150" r="' + (6 - i) + '" fill="' + o2[2] + '" filter="url(#gw)"/></g>');
      });
      out.push('<circle cx="980" cy="150" r="16" fill="' + p.a2 + '" filter="url(#gw)"/>');
      var coord = core.hash(m.login);
      out.push('<text x="60" y="70" font-family="' + MONO + '" font-size="13" letter-spacing="2.4" fill="' + p.a1 + '">RA ' + ("0" + coord % 24).slice(-2) + "h " + ("0" + coord % 60).slice(-2) + "m · DEC +" + (coord % 89) + "° · @" + esc(trunc(m.login, 24).toUpperCase()) + "</text>");
      out.push('<text x="58" y="150" font-family="' + SERIF + '" font-size="' + fit(name, 70, 36, 780, 0.5) + '" font-style="italic" fill="#ffffff">' + esc(trunc(name, 30)) + "</text>");
      if (sub.main) out.push('<text x="60" y="194" font-family="' + SANS + '" font-size="20" fill="#cfd6ff">' + esc(trunc(sub.main, 60)) + "</text>");
      if (chips.length) out.push('<text x="60" y="246" font-family="' + MONO + '" font-size="13" letter-spacing="2" fill="' + p.a2 + '">' + esc(chips.join("  ✦  ").toUpperCase()) + "</text>");
      out.push("</g>");
      style = "@keyframes tw{50%{opacity:.15}}.tw{animation:tw 3s ease-in-out infinite}" +
        "@keyframes pl{0%{transform:translate(0,0)}25%{transform:translate(-60px,25px) scale(1.15)}50%{transform:translate(-120px,0)}75%{transform:translate(-60px,-25px) scale(.85)}100%{transform:translate(0,0)}}.pl{animation:pl 12s linear infinite}";
    } else if (w === "botanical") {
      out.push('<defs><clipPath id="c"><rect width="' + W + '" height="' + H + '" rx="10"/></clipPath><pattern id="gr" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="0.6" fill="' + p.ink + '" fill-opacity="0.05"/></pattern></defs>');
      out.push('<g clip-path="url(#c)"><rect width="' + W + '" height="' + H + '" fill="' + p.bg1 + '"/><rect width="' + W + '" height="' + H + '" fill="url(#gr)"/>');
      // hanging vines from the top, each with a flower, swaying
      [[90, 150, 0], [210, 90, 1], [990, 120, 2], [1110, 170, 3]].forEach(function (v) {
        var x = v[0], len = v[1], col = [p.a2, "#e8a33d", p.a2, "#8a6bd1"][v[2]], g = '<path d="M' + x + " 0 Q" + (x + 18) + " " + len * 0.5 + " " + x + " " + len + '" fill="none" stroke="' + p.a1 + '" stroke-width="2"/>';
        for (var k = 1; k < 5; k++) g += leaf(x + (k % 2 ? 6 : -4), len * k / 5, 16, k % 2 ? 20 : 160, p.a1);
        for (var a = 0; a < 5; a++) { var ang = a / 5 * Math.PI * 2; g += '<circle cx="' + (x + Math.cos(ang) * 7).toFixed(1) + '" cy="' + (len + Math.sin(ang) * 7).toFixed(1) + '" r="6" fill="' + col + '"/>'; }
        g += '<circle cx="' + x + '" cy="' + len + '" r="4" fill="#ffd23f"/>';
        out.push("<g" + anim(p, "sw", "transform-origin:" + x + "px 0px;animation-duration:" + (4 + v[2] * 0.7) + "s") + ">" + g + "</g>");
      });
      out.push('<text x="' + W / 2 + '" y="136" text-anchor="middle" font-family="' + SERIF + '" font-size="' + fit(name, 66, 34, 700, 0.5) + '" font-weight="700" fill="' + p.ink + '">' + esc(trunc(name, 30)) + "</text>");
      if (sub.main) out.push('<text x="' + W / 2 + '" y="178" text-anchor="middle" font-family="' + SERIF + '" font-size="21" font-style="italic" fill="' + p.ink + '" fill-opacity="0.75">' + esc(trunc(sub.main, 64)) + "</text>");
      out.push('<text x="' + W / 2 + '" y="222" text-anchor="middle" font-family="' + SANS + '" font-size="12" font-weight="700" letter-spacing="3" fill="' + p.a1 + '">' + esc(("SPECIMEN No. " + m.publicRepos + (since ? " · COLLECTED " + since : "") + (chips.length ? " · " + chips.slice(0, 3).join(", ") : "")).toUpperCase()) + "</text>");
      out.push('<path d="M420 250 Q600 236 780 250" fill="none" stroke="' + p.a1 + '" stroke-width="1.4"/>' + leaf(600, 243, 18, -100, p.a1) + leaf(560, 247, 14, 200, p.a1) + leaf(640, 247, 14, -20, p.a1));
      out.push("</g>");
      style = "@keyframes sw{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}.sw{animation:sw 4.5s ease-in-out infinite}";
    }
    return svgOpen(W, H, name + (sub.main ? ", " + sub.main : "")) + css(p, style) + out.join("") + "</svg>";
  }

  /* ---------- the animated divider that opens each section ---------- */
  function divider(m, o, p, key, label, idx, next) {
    var w = p.world, W = 1200, H = 92, num = ("0" + idx).slice(-2), out = [], style = "", r = rng(core.hash(m.login + key));
    if (NEW[w]) { var nd = NEW[w].divider(m, o, p, r, W, H, label, num, next); return svgOpen(W, H, label) + css(p, nd.style) + nd.svg + "</svg>"; }
    if (w === "airport") {
      out.push("<defs>" + TILE_DEF + '<clipPath id="c"><rect width="' + W + '" height="' + H + '" rx="12"/></clipPath></defs><g clip-path="url(#c)"><rect width="' + W + '" height="' + H + '" fill="#0f0f12"/>');
      out.push('<text x="30" y="54" font-family="' + SANS + '" font-size="13" font-weight="700" letter-spacing="2.4" fill="#8a8a8f">GATE ' + num + "</text>");
      out.push(flaps(p, r, trunc(label, 18), 118, 26, 24, 38, 21, p.a1, 0.4));
      out.push('<line x1="620" y1="46" x2="1170" y2="46" stroke="#3a3a40" stroke-width="2" stroke-dasharray="8 8"/>');
      out.push('<g' + anim(p, "pl") + '><path d="M640 46 l-26 -8 l4 8 l-4 8z M640 46 l-14 -18 h6 l18 18 l-18 18 h-6z" fill="' + p.a1 + '" transform="translate(-30 0)"/></g>');
      out.push("</g>");
      style = FLAP_CSS + "@keyframes pl{from{transform:translateX(0)}to{transform:translateX(560px)}}.pl{animation:pl 6s cubic-bezier(.5,0,.5,1) infinite}";
    } else if (w === "transit") {
      var c = p.stripe && p.stripe.length ? p.stripe[(idx - 1) % p.stripe.length] : p.a1, path = "M80 58 H1120";
      out.push('<path d="' + path + '" stroke="' + c + '" stroke-width="10" stroke-linecap="round"/>');
      out.push('<circle cx="140" cy="58" r="13" fill="' + p.bg1 + '" stroke="' + p.ink + '" stroke-width="5"/>');
      out.push('<text x="170" y="40" font-family="' + GROTESK + '" font-size="26" font-weight="800" fill="' + p.ink + '">' + esc(label) + "</text>");
      if (next) out.push('<text x="1120" y="40" text-anchor="end" font-family="' + GROTESK + '" font-size="14" font-weight="600" fill="' + p.ink + '" fill-opacity="0.6">Next: ' + esc(next) + " →</text>");
      out.push('<circle cx="1120" cy="58" r="9" fill="' + p.bg1 + '" stroke="' + p.ink + '" stroke-width="4"/>');
      out.push('<rect x="-22" y="-8" width="44" height="16" rx="8" fill="#ffffff" stroke="' + p.ink + '" stroke-width="2.5" style="offset-path:path(\'' + path + "');offset-distance:40%\"" + anim(p, "tr") + "/>");
      style = "@keyframes tr{from{offset-distance:0%}to{offset-distance:100%}}.tr{animation:tr 7s cubic-bezier(.45,0,.55,1) infinite}";
    } else if (w === "broadsheet") {
      var roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][idx - 1] || String(idx);
      out.push('<rect x="40" y="22" width="1120" height="2.5" fill="' + p.ink + '"/><rect x="40" y="27" width="1120" height="0.8" fill="' + p.ink + '"/>');
      out.push('<text x="600" y="64" text-anchor="middle" font-family="' + SERIF + '" font-size="28" font-weight="700" letter-spacing="1" fill="' + p.ink + '">§ ' + roman + " · " + esc(label) + "</text>");
      out.push('<rect x="40" y="78" width="1120" height="0.8" fill="' + p.ink + '"/>');
      out.push('<defs><linearGradient id="ink" x1="0" x2="1"><stop offset="0" stop-color="' + p.a1 + '" stop-opacity="0"/><stop offset="0.5" stop-color="' + p.a1 + '"/><stop offset="1" stop-color="' + p.a1 + '" stop-opacity="0"/></linearGradient></defs>');
      out.push('<rect x="40" y="21" width="160" height="4.5" fill="url(#ink)"' + anim(p, "ro") + "/>");
      style = "@keyframes ro{from{transform:translateX(0)}to{transform:translateX(960px)}}.ro{animation:ro 5s ease-in-out infinite alternate}";
    } else if (w === "observatory") {
      out.push('<defs><linearGradient id="tail" x1="0" x2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#ffffff"/></linearGradient><radialGradient id="sky" cx="0.5" cy="0.5" r="0.8"><stop offset="0" stop-color="' + p.bg2 + '"/><stop offset="1" stop-color="' + p.bg1 + '"/></radialGradient><clipPath id="c"><rect width="' + W + '" height="' + H + '" rx="14"/></clipPath></defs>');
      out.push('<g clip-path="url(#c)"><rect width="' + W + '" height="' + H + '" fill="url(#sky)"/>' + stars(p, r, W, H, 60, true));
      out.push('<text x="600" y="56" text-anchor="middle" font-family="' + SERIF + '" font-size="30" font-style="italic" fill="#ffffff">' + esc(label) + "</text>");
      out.push('<text x="60" y="54" font-family="' + MONO + '" font-size="11" letter-spacing="2" fill="' + p.a1 + '">CHART ' + num + "</text>");
      out.push('<g' + anim(p, "cm") + '><line x1="0" y1="0" x2="140" y2="0" stroke="url(#tail)" stroke-width="2.2" stroke-linecap="round" transform="translate(80 30) rotate(8)"/><circle cx="218" cy="49" r="3" fill="#ffffff" filter="url(#glow)"/></g>');
      out.push("</g>");
      out.push('<defs><filter id="glow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>');
      style = "@keyframes tw{50%{opacity:.15}}.tw{animation:tw 3s ease-in-out infinite}@keyframes cm{0%{transform:translate(-200px,-10px);opacity:0}10%{opacity:1}60%{transform:translate(900px,40px);opacity:0}100%{opacity:0}}.cm{animation:cm 6s ease-in infinite}";
    } else if (w === "botanical") {
      var vine = "M60 60 C260 30 380 86 600 58 S940 30 1140 60";
      out.push('<path d="' + vine + '" fill="none" stroke="' + p.a1 + '" stroke-width="2"/>');
      for (var k = 0; k < 14; k++) {
        var x = 100 + k * 76, y = 58 + Math.sin(k * 1.3) * 14;
        if (x > 470 && x < 730) continue;
        out.push('<g' + anim(p, "lf", "transform-origin:" + x + "px " + y.toFixed(0) + "px;animation-delay:-" + (k * 0.4).toFixed(1) + "s") + ">" + leaf(x, y, 18, k % 2 ? -40 : 220, p.a1) + "</g>");
      }
      out.push('<rect x="470" y="30" width="260" height="46" rx="4" fill="' + p.bg1 + '" stroke="' + p.line + '"/>');
      out.push('<text x="600" y="62" text-anchor="middle" font-family="' + SERIF + '" font-size="24" font-style="italic" fill="' + p.ink + '">' + esc(trunc(label, 18)) + "</text>");
      out.push('<text x="600" y="20" text-anchor="middle" font-family="' + SANS + '" font-size="10" font-weight="700" letter-spacing="2.4" fill="' + p.a1 + '">PLATE ' + num + "</text>");
      style = "@keyframes lf{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg)}}.lf{animation:lf 4s ease-in-out infinite}";
    }
    return svgOpen(W, H, label) + css(p, style) + out.join("") + "</svg>";
  }

  /* ---------- the footer ---------- */
  function footer(m, o, p) {
    var w = p.world, W = 1200, H = 120, out = [], style = "", r = rng(core.hash(m.login + "foot"));
    if (NEW[w]) { var nt = NEW[w].footer(m, o, p, r, W, H); return svgOpen(W, H, "Footer") + css(p, nt.style) + nt.svg + "</svg>"; }
    if (w === "airport" || w === "broadsheet") {
      var text = (w === "airport" ? "THANK YOU FOR FLYING @" + m.login + " ★ CONNECTING FLIGHTS: " + (m.langs.slice(0, 3).map(function (l) { return l.name; }).join(" · ") || "OPEN SOURCE") + " ★ SAFE TRAVELS ★ "
        : "PRINTED FROM PUBLIC GITHUB DATA ▸ LATE EDITION ▸ @" + m.login + " ▸ SUBSCRIBE BY FOLLOWING ▸ ").toUpperCase();
      while (text.length < 130) text += text;
      var cw = 9.6, len = Math.round(text.length * cw), y = 40;
      out.push('<rect x="0" y="' + y + '" width="' + W + '" height="44" rx="' + (w === "airport" ? 10 : 2) + '" fill="' + (w === "airport" ? p.a1 : p.ink) + '"/>');
      out.push('<defs><clipPath id="tc"><rect x="0" y="' + y + '" width="' + W + '" height="44" rx="10"/></clipPath></defs><g clip-path="url(#tc)"><g' + anim(p, "tk") + ' font-family="' + MONO + '" font-size="16" font-weight="800" fill="' + (w === "airport" ? "#0c0c0e" : p.bg1) + '">' +
        [0, len].map(function (x) { return '<text x="' + x + '" y="' + (y + 28) + '" textLength="' + len + '" lengthAdjust="spacingAndGlyphs" xml:space="preserve">' + esc(text) + "</text>"; }).join("") + "</g></g>");
      style = "@keyframes tk{to{transform:translateX(-" + len + "px)}}.tk{animation:tk " + Math.round(len / 55) + "s linear infinite}";
    } else if (w === "transit") {
      out.push('<path d="M60 70 H1080" stroke="' + p.a1 + '" stroke-width="10" stroke-linecap="round"/><rect x="1080" y="44" width="14" height="52" rx="3" fill="' + p.a2 + '"/>');
      out.push('<text x="60" y="40" font-family="' + GROTESK + '" font-size="18" font-weight="800" fill="' + p.ink + '">This train terminates here. Follow @' + esc(trunc(m.login, 30)) + " for the next service.</text>");
      out.push('<rect x="-22" y="-8" width="44" height="16" rx="8" fill="#ffffff" stroke="' + p.ink + '" stroke-width="2.5" style="offset-path:path(\'M60 70 H1058\');offset-distance:95%"' + anim(p, "tr") + "/>");
      style = "@keyframes tr{0%{offset-distance:0%}70%,100%{offset-distance:100%}}.tr{animation:tr 8s cubic-bezier(.3,0,.2,1) infinite}";
    } else if (w === "observatory") {
      out.push('<defs><radialGradient id="sky" cx="0.5" cy="0" r="1"><stop offset="0" stop-color="' + p.bg2 + '"/><stop offset="1" stop-color="' + p.bg1 + '"/></radialGradient><clipPath id="c"><rect width="' + W + '" height="' + H + '" rx="14"/></clipPath></defs>');
      out.push('<g clip-path="url(#c)"><rect width="' + W + '" height="' + H + '" fill="url(#sky)"/>' + stars(p, r, W, 80, 70, true));
      out.push('<path d="M0 120 L0 96 L120 70 L220 92 L340 58 L470 94 L600 76 L720 98 L860 62 L980 90 L1100 72 L1200 88 L1200 120Z" fill="#02030a"/>');
      out.push('<text x="600" y="50" text-anchor="middle" font-family="' + SERIF + '" font-size="20" font-style="italic" fill="#ffffff" fill-opacity="0.85">Clear skies, from @' + esc(trunc(m.login, 30)) + "</text></g>");
      style = "@keyframes tw{50%{opacity:.15}}.tw{animation:tw 3s ease-in-out infinite}";
    } else if (w === "botanical") {
      for (var b = 0; b < 140; b++) {
        var gx = (b * 8.6 + r() * 4).toFixed(1), gh = (14 + r() * 34).toFixed(1);
        out.push('<path d="M' + gx + " 120 q2 -" + (gh / 2).toFixed(1) + " " + (r() * 8 - 4).toFixed(1) + " -" + gh + " q2 " + (gh / 2).toFixed(1) + ' 4 ' + gh + 'z" fill="' + p.a1 + '" fill-opacity="' + (0.4 + r() * 0.6).toFixed(2) + '"' +
          anim(p, "gs", "transform-origin:" + gx + "px 120px;animation-duration:" + (2.5 + r() * 2).toFixed(1) + "s") + "/>");
      }
      out.push('<text x="600" y="40" text-anchor="middle" font-family="' + SERIF + '" font-size="18" font-style="italic" fill="' + p.ink + '">Tended by @' + esc(trunc(m.login, 30)) + "</text>");
      style = "@keyframes gs{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}.gs{animation:gs 3s ease-in-out infinite}";
    }
    return svgOpen(W, H, "Footer") + css(p, style) + out.join("") + "</svg>";
  }

  return { palette: palette, frame: frame, title: title, cell: cell, ring: ring, cardCss: cardCss, banner: banner, divider: divider, footer: footer, KEYS: Object.keys(DEF), voxel: { cube: cube, city: city, bot: bot, glassCube: glassCube, botDefs: BOT_DEFS, botCss: BOT_CSS } };
});

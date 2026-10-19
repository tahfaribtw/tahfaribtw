#!/usr/bin/env node
/* cli.js: generate README.md and banner.svg from the terminal (Node 18+). */
"use strict";
const fs = require("fs");
const path = require("path");
const core = require("./js/core.js");
const cards = require("./js/cards.js");
const { fetchProfile } = require("./js/github.js");
const { publish } = require("./js/publish.js");

const HELP = `Usage: node cli.js <github-url|username> [options]

Options:
  --style <showcase|changelog>         Layout (default: showcase)
  --world <name>        A complete design for the whole README: airport, transit, broadsheet, observatory, botanical,
                        atlas, museum, ink, periodic, abyss, voxel
                        (banner, every card, animated section dividers, footer and a matching showpiece). Leave out for the classic look.
  --theme <name>        auto (default), aurora, cyber, sunset, emerald, royal, graphite, paper (the classic look's colours)
  --colors <a,b>        Your own two accent colours, like --colors #ff8800,#00c2a8 (switches to the custom theme)
  --order <list>        Section order, any of: stats, stack, timeline, projects, connect
  --featured <list>     Repos to feature as project cards, in order (up to 6), like --featured api,web,docs
  --share-image         Also write share-image.svg, a 1280x640 picture for LinkedIn or X (not part of the README)
  --tagline <text>      Optional smaller line under the job title
  --role <text>         Job title, shown right after the name
  --stack <text>        Skills and tools (comma separated)
  --linkedin <text>     LinkedIn username or URL
  --open-to <text>      What you're open to, shown right under the banner (like "Senior platform roles · Remote")
  --resume <url>        A https:// link to your CV: a Résumé button and link under the banner
  --certs <list>        Certifications, comma separated, shown as badges
  --summary             Add a three-line recruiter summary written from your data
  --proof               Add "Skills, with proof": each skill backed by the repos that show it
  --impact <text>       Impact numbers per project, like "api: 40+ users, 99.9% uptime; web: 3x faster"
  --no-banner --no-cards --no-bars --pie --no-timeline --no-projects --no-links
  --recent              Add a "Recently pushed" card (your latest five repos, in any layout)
  --no-universe         Leave out the 3D contribution universe (on by default, from Git3D Universe)
  --no-wave             Use the orbit banner and a plain footer instead of the wave header and footer (on by default)
  --showpiece <name>    One animated scene under the banner: departures, holo, metro, vinyl, vitals, garden,
                        yearcode, newspaper, passport, constellation, weather, pulse, scroll, city, or none.
                        Left out: the look's own scene (Pulse in the classic look, or the design's showpiece)
  --universe-style <neon|theme>  The universe's colours: Git3D Universe's own cosmic palettes (neon, the default) or the theme's
  --universe-only       Rebuild only cards/universe.svg (and its light twin); used by the 3D universe workflow
  --no-adaptive         One card set only. By default there are dark and light sets, and GitHub shows the one matching the viewer
  --no-animation        Static cards (no motion)
  --no-heatmap          Leave out the contribution heatmap
  --no-credit           Drop the "made with" link from the footer
  --site <url>          Address the footer credit links to
  --config <file>       Read options from a JSON file (the same names the page uses). Flags given here win over the file.
  --require-activity    Stop without writing anything if GitHub activity can't be read (used by the daily update)
  --clean               Delete older banner*.svg and cards/*.svg that the new run no longer produces
  --daily               Also add the daily-update GitHub Action and a copy of this generator (.github/workflows/ and .readme-patch/)
  --publish             Commit the result to <user>/<user> (needs GITHUB_TOKEN with Contents: write; with --daily, also the workflow permission)
  --out <dir>           Output folder (default: ./out)
  --sample              Use built-in sample data (no network)
  --help

Set GITHUB_TOKEN in the environment to raise the API rate limit.`;

/** A JSON file of options, using the same names as the page. Unknown names are ignored; a wrong type is an error. */
function loadConfig(file) {
  let raw;
  try { raw = JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (e) { throw new Error("Couldn't read the config file " + file + ": " + e.message); }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("The config file must contain a JSON object.");
  const INTERNAL = ["mode", "suffix"], out = {};
  Object.keys(raw).forEach((k) => {
    if (!(k in core.DEFAULTS) || INTERNAL.includes(k)) return;          // newer configs still load in an older copy
    if (typeof raw[k] !== typeof core.DEFAULTS[k]) throw new Error('In ' + file + ', "' + k + '" must be a ' + typeof core.DEFAULTS[k] + ".");
    out[k] = raw[k];
  });
  return out;
}

/** Removes generated images that a new run no longer produces. Touches only banner*.svg and cards/*.svg. */
function cleanStale(outDir, keepNames) {
  const keep = new Set(keepNames), removed = [];
  const sweep = (dir, rel, test) => {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach((f) => {
      const name = rel ? rel + "/" + f : f;
      if (test(f) && !keep.has(name) && fs.statSync(path.join(dir, f)).isFile()) { fs.unlinkSync(path.join(dir, f)); removed.push(name); }
    });
  };
  sweep(outDir, "", (f) => /^banner(-light)?\.svg$/.test(f));
  sweep(path.join(outDir, "cards"), "cards", (f) => /\.svg$/.test(f));
  return removed;
}

function parseArgs(argv) {
  const o = { out: "out", sample: false, target: null, opts: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      if (i + 1 >= argv.length) throw new Error("Missing value for " + a);
      return argv[++i];
    };
    switch (a) {
      case "--help": case "-h": o.help = true; break;
      case "--sample": o.sample = true; break;
      case "--style": o.opts.style = next(); break;
      case "--theme": o.opts.theme = next(); break;
      case "--world": o.opts.world = next(); if (o.opts.world === "classic" || o.opts.world === "none") o.opts.world = ""; break;
      case "--colors": {
        const pair = next().split(",").map((c) => c.trim());
        if (pair.length !== 2 || !core.validHex(pair[0]) || !core.validHex(pair[1])) throw new Error("--colors needs two hex colours, like --colors #ff8800,#00c2a8");
        o.opts.theme = "custom"; o.opts.accent1 = pair[0]; o.opts.accent2 = pair[1]; break;
      }
      case "--order": o.opts.order = next(); break;
      case "--featured": o.opts.featured = next(); break;
      case "--share-image": o.shareImage = true; break;
      case "--adaptive": o.opts.adaptive = true; break;
      case "--no-adaptive": o.opts.adaptive = false; break;
      case "--universe": o.opts.universe = true; break;
      case "--wave": o.opts.wave = true; break;
      case "--no-wave": o.opts.wave = false; break;
      case "--no-universe": o.opts.universe = false; break;
      case "--universe-style": o.opts.universeStyle = next(); break;
      case "--showpiece": o.opts.showpiece = next(); break;
      case "--universe-only": o.universeOnly = true; o.opts.universe = true; break;
      case "--no-animation": o.opts.animate = false; break;
      case "--no-heatmap": o.opts.heatmap = false; break;
      case "--no-credit": o.opts.credit = false; break;
      case "--site": o.opts.siteUrl = next(); break;
      case "--tagline": o.opts.tagline = next(); break;
      case "--role": o.opts.role = next(); break;
      case "--stack": o.opts.stack = next(); break;
      case "--linkedin": o.opts.linkedin = next(); break;
      case "--open-to": o.opts.openTo = next(); break;
      case "--resume": o.opts.resume = next(); if (!core.resumeUrl({ resume: o.opts.resume })) throw new Error("--resume needs a full https:// link, like --resume https://example.com/cv.pdf"); break;
      case "--certs": o.opts.certs = next(); break;
      case "--summary": o.opts.summary = true; break;
      case "--proof": o.opts.proof = true; break;
      case "--impact": o.opts.impact = next(); break;
      case "--no-timeline": o.opts.timeline = false; break;
      case "--out": o.out = next(); break;
      case "--publish": o.publish = true; break;
      case "--config": o.configFile = next(); break;
      case "--require-activity": o.requireActivity = true; break;
      case "--clean": o.clean = true; break;
      case "--daily": o.daily = true; break;
      case "--no-banner": o.opts.banner = false; break;
      case "--no-cards": o.opts.cards = false; break;
      case "--no-bars": o.opts.bars = false; break;
      case "--pie": o.opts.pie = true; break;
      case "--no-projects": o.opts.proj = false; break;
      case "--recent": o.opts.recent = true; break;
      case "--no-recent": o.opts.recent = false; break;
      case "--no-links": o.opts.links = false; break;
      default:
        if (a.startsWith("--")) throw new Error("Unknown option " + a);
        o.target = a;
    }
  }
  if (o.configFile) o.opts = Object.assign({}, loadConfig(o.configFile), o.opts);
  if (o.opts.theme && !core.THEME_ORDER.includes(o.opts.theme)) throw new Error("--theme must be one of: " + core.THEME_ORDER.join(", "));
  if (o.opts.theme === "custom" && !o.opts.accent1) throw new Error("--theme custom needs --colors, like --colors #ff8800,#00c2a8");
  if (o.opts.order) {
    const bad = o.opts.order.split(",").map((x) => x.trim().toLowerCase()).filter((x) => x && !core.SECTIONS.includes(x));
    if (bad.length) throw new Error("Unknown section: " + bad.join(", ") + ". Use: " + core.SECTIONS.join(", "));
  }
  if (o.opts.world && !core.WORLD_KEYS.includes(o.opts.world)) throw new Error("--world must be one of: " + core.WORLD_KEYS.join(", ") + " (or classic)");
  if (o.opts.showpiece && o.opts.showpiece !== "none" && !core.SHOWPIECE_KEYS.includes(o.opts.showpiece)) throw new Error("--showpiece must be one of: " + core.SHOWPIECE_KEYS.join(", ") + " (or none)");
  if (o.opts.universeStyle && !["neon", "theme"].includes(o.opts.universeStyle)) throw new Error("--universe-style must be neon or theme");
  if (o.opts.style && !["showcase", "changelog", "manifest", "plain"].includes(o.opts.style)) {
    throw new Error("--style must be showcase or changelog");
  }
  return o;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || (!args.target && !args.sample)) { console.log(HELP); return; }

  let model;
  if (args.sample) model = core.SAMPLE;
  else {
    const user = core.parseUser(args.target);
    if (!user) throw new Error("Not a GitHub profile link or username: " + args.target);
    model = await fetchProfile(user, { token: process.env.GITHUB_TOKEN });
    if (args.requireActivity && !model.activity) throw new Error("GitHub activity couldn't be read, so your files were left unchanged.");
  }

  let files = cards.buildFiles(model, args.opts);            // what gets published
  if (args.universeOnly) {
    if (args.daily || args.publish || args.clean) throw new Error("--universe-only can't be combined with --daily, --publish or --clean");
    files = files.filter((f) => /^cards\/universe(-light)?\.svg$/.test(f.name));
    if (!files.length) throw new Error("There is no contribution activity to draw, so the 3D universe was left unchanged.");
  }
  if (args.daily) {
    if (args.sample) throw new Error("--daily needs a real profile, not --sample");
    const auto = require("./js/automation.js");     // loaded only here: the copy of the generator that runs daily doesn't need (or include) it
    const sources = {};
    auto.RUNTIME.forEach((p) => { sources[p] = fs.readFileSync(path.join(__dirname, p), "utf8"); });
    files.push(...auto.buildAutomationFiles(model.login, Object.assign({}, args.opts), sources));
  }
  const extras = args.shareImage ? cards.buildExtras(model, args.opts) : [];
  for (const f of files.concat(extras)) {
    const dest = path.join(args.out, f.name);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, f.data);
  }
  const removed = args.clean ? cleanStale(args.out, files.concat(extras).map((f) => f.name)) : [];
  if (removed.length) console.log("Removed " + removed.length + " older " + (removed.length === 1 ? "image" : "images") + ": " + removed.join(", "));
  const written = files.concat(extras);
  console.log("Wrote " + written.length + (written.length === 1 ? " file" : " files") + " to " + args.out + "/ : " + written.map((f) => f.name).join(", "));
  if (args.publish) {
    if (args.sample) throw new Error("--publish needs a real profile, not --sample");
    const res = await publish(files, { token: process.env.GITHUB_TOKEN, owner: model.login, message: "Update profile README (Patch your profile)" });
    console.log("Published " + res.files + " files to " + res.url);
    if (res.skipped === "daily") {
      console.error("Daily updates were not added: GitHub refused the workflow from GITHUB_TOKEN. " + res.advice);
      process.exitCode = 1;
    }
  }
}

main().catch((e) => { console.error("Error: " + e.message); process.exit(1); });

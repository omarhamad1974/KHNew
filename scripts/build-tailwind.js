#!/usr/bin/env node
/* KHIP Tailwind build.   Run from the project root:   node scripts/build-tailwind.js
   (add --cdn to go back to the Tailwind CDN, --check to only report the state, --strict to exit with an error when the build fails)

   Why: the pages load Tailwind from its CDN, which downloads a large script and builds the styles in the visitor's browser on every page view.
   This script builds the styles once (tailwind.css, minified, only the classes the site uses) and points the pages at it.

   How it switches: each public page has two marked places in its <head>:
     <!--KHIP-TW-JS:START--> ...CDN script + tailwind-config.js... <!--KHIP-TW-JS:END-->     (before theme.js)
     <!--KHIP-TW-CSS:START--> ...nothing, or the tailwind.css link... <!--KHIP-TW-CSS:END--> (right after styles.css, where the CDN styles also ended up)
   Built:  the first place is emptied and the second holds <link rel="stylesheet" href="tailwind.css?v=...">.
   Not built (or --cdn): the first place holds the CDN tags and the second is empty, which is the original behaviour.
   If the build fails for any reason the pages are put back on the CDN and the old tailwind.css is deleted, so the site never loses its styles.
   The theme (colours, fonts) comes from tailwind-config.js, the same file the CDN uses. admin.html is not touched (it keeps the CDN).
   Needs Node 18+ and network access for "npx tailwindcss@3.4.17" (GitHub Actions has it). Set TAILWIND_BIN to use another command. Safe to run again and again. */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..'), R = f => path.join(ROOT, f);
const args = process.argv.slice(2), CDN_ONLY = args.includes('--cdn'), CHECK = args.includes('--check'), STRICT = args.includes('--strict');
const VERSION = '3.4.17';            // the version the Tailwind CDN serves
const JS = ['<!--KHIP-TW-JS:START-->', '<!--KHIP-TW-JS:END-->'], CSS = ['<!--KHIP-TW-CSS:START-->', '<!--KHIP-TW-CSS:END-->'];
const CDN_TAGS = '<script src="https://cdn.tailwindcss.com"></script>\n<script src="tailwind-config.js?v=9"></script>';
const notes = [], changed = [];
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const pages = () => fs.readdirSync(ROOT).filter(f => f.endsWith('.html') && f !== 'admin.html');
const hasMarks = s => s.includes(JS[0]) && s.includes(JS[1]) && s.includes(CSS[0]) && s.includes(CSS[1]);
const zone = (s, m, inner) => s.replace(new RegExp(esc(m[0]) + '[\\s\\S]*?' + esc(m[1])), () => m[0] + inner + m[1]);

function setMode(link) {              // link: the <link> tag to use, or '' for the CDN
  for (const f of pages()) {
    const s = fs.readFileSync(R(f), 'utf8');
    if (!hasMarks(s)) { notes.push(`${f}: no Tailwind markers, left as it is`); continue; }
    const n = zone(zone(s, JS, link ? '' : '\n' + CDN_TAGS + '\n'), CSS, link ? '\n' + link + '\n' : '');
    if (n !== s) { changed.push(f); if (!CHECK) fs.writeFileSync(R(f), n); }
  }
}
function state() {
  const on = pages().filter(f => /tailwind\.css/.test(fs.readFileSync(R(f), 'utf8').split(CSS[0])[1] || ''));
  return on.length ? `compiled on ${on.length} page(s)` : 'CDN';
}
function fail(why) {
  notes.push('Tailwind build failed, pages use the CDN: ' + why);
  setMode('');
  if (!CHECK && fs.existsSync(R('tailwind.css'))) fs.unlinkSync(R('tailwind.css'));
}
function build() {
  const tmp = R('tailwind.css.tmp');
  const bin = process.env.TAILWIND_BIN ? process.env.TAILWIND_BIN.split(' ') : ['npx', '--yes', 'tailwindcss@' + VERSION];
  const r = cp.spawnSync(bin[0], [...bin.slice(1), '-c', R('scripts/tailwind.config.cjs'), '-i', R('scripts/tailwind-input.css'), '-o', tmp, '--minify'],
    { cwd: ROOT, encoding: 'utf8', shell: process.platform === 'win32' });
  if (r.error || r.status !== 0) return fail((r.error && r.error.message) || (r.stderr || r.stdout || 'exit ' + r.status).trim().split('\n').slice(-3).join(' | '));
  const css = fs.existsSync(tmp) ? fs.readFileSync(tmp, 'utf8') : '';
  fs.existsSync(tmp) && fs.unlinkSync(tmp);
  // sanity: it must really contain the base styles, a common utility and the site's own colours (proves tailwind-config.js was read)
  const bad = [[css.length > 8000, 'the stylesheet is too small'], [/\.flex\{display:flex\}/.test(css), 'no .flex utility'], [/var\(--c-accent-rgb\)/.test(css), 'the site colours are missing'], [/box-sizing:border-box/.test(css), 'no base styles']].find(x => !x[0]);
  if (bad) return fail(bad[1]);
  const v = crypto.createHash('sha1').update(css).digest('hex').slice(0, 8);
  const old = fs.existsSync(R('tailwind.css')) ? fs.readFileSync(R('tailwind.css'), 'utf8') : null;
  if (old !== css) { changed.push('tailwind.css'); if (!CHECK) fs.writeFileSync(R('tailwind.css'), css); }
  setMode(`<link rel="stylesheet" href="tailwind.css?v=${v}">`);
  notes.push(`Built tailwind.css (${(css.length / 1024).toFixed(1)} KB).`);
  return true;
}

if (CHECK) { console.log('Tailwind: ' + state()); process.exit(0); }
let ok = true;
if (CDN_ONLY) { setMode(''); if (fs.existsSync(R('tailwind.css'))) { fs.unlinkSync(R('tailwind.css')); changed.push('tailwind.css'); } notes.push('Pages use the Tailwind CDN.'); }
else ok = build() === true;
console.log(notes.join('\n') + (changed.length ? '\nChanged: ' + [...new Set(changed)].join(', ') : '\nNothing changed.'));
if (!ok && STRICT) process.exit(1);

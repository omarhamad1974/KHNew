#!/usr/bin/env node
/* KHIP SEO build.   Run from the project root:   node scripts/build-seo.js   (add --check to only report what would change)

   What it does (no packages needed, Node 18+):
   1. Writes a generated block into the <head> of every public page: description, canonical address, hreflang links,
      Open Graph / Twitter tags and LegalService structured data (plus FAQPage data when the page has FAQ).
   2. Writes a generated block at the top of <main>: a hidden heading for the home page and a <noscript> copy of the
      page's content (about text, services, countries, news, team, FAQ ...) so crawlers that do not run JavaScript
      still read the real text. Visitors with JavaScript never see it.
   3. When the site languages (admin, General, Languages & words) are "both": writes an Arabic copy of every page
      (index-ar.html, about-ar.html, ...) with Arabic <title>, description, lang="ar" dir="rtl" and hreflang links,
      so Google can index English and Arabic separately.
   4. Writes sitemap.xml and robots.txt.

   Settings (all optional) live in app-data.json under "seo":
     { "siteUrl": "https://www.example.com/", "name": "Khaled Hamada Intellectual Property", "ogImage": "assets/khip-logo.jpg",
       "pages": { "home": { "title": { "en": "", "ar": "" }, "description": { "en": "", "ar": "" } }, "about": {...} } }
   The address can also come from the SITE_URL environment variable. It is never guessed: without it the canonical, hreflang,
   og:url, og:image and sitemap parts are skipped (everything else is still written).
   Page keys: home, about, patents, trademarks, translation. The script is safe to run again and again. */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const R = f => path.join(ROOT, f);
const read = f => fs.readFileSync(R(f), 'utf8');
const CHECK = process.argv.includes('--check');
const changed = [], notes = [];
const write = (f, s) => {
  const p = R(f), old = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
  if (old !== s) { changed.push(f); if (!CHECK) fs.writeFileSync(p, s); }
};

// ---------- data ----------
const en = JSON.parse(read('app-data.json'));
let ar = {}; try { ar = JSON.parse(read('app-data.ar.json')); } catch { notes.push('app-data.ar.json not readable: Arabic pages use English text'); }
const MODE = ['en', 'ar', 'both'].includes(en.languages) ? en.languages : 'en';
const BOTH = MODE === 'both', ROOT_LANG = MODE === 'ar' ? 'ar' : 'en';
const seo = en.seo || {};
const txt = v => typeof v === 'string' && v.trim() !== '';
let KV = null; try { global.window = global.window || {}; require(path.resolve(__dirname, '..', 'video.js')); KV = window.KVIDEO; } catch (e) { notes.push('video.js not loaded: video data is skipped (' + e.message + ')'); }
const clone = o => JSON.parse(JSON.stringify(o));

// the built-in words of the site (lang.js) and the built-in Arabic page titles (pages-i18n.js)
const langSrc = read('lang.js');
const DICT = new Function('return ' + langSrc.slice(langSrc.indexOf('const DICT=') + 11, langSrc.indexOf('\n  if(document.currentScript')).trim().replace(/;$/, ''))();
const win = {}; new Function('window', read('pages-i18n.js'))(win);
const KTX = win.KTX || {};
const ktx = (k, l) => (KTX[k] && KTX[k][l] ? String(KTX[k][l]).replace(/\{khip\}/g, 'KHIP') : '');

// ---------- site address ----------
function siteUrl() {
  const u = process.env.SITE_URL || seo.siteUrl || '';        // never guessed: a wrong address in canonical links would hurt more than none
  return u ? u.replace(/\/*$/, '/') : '';
}
const U = siteUrl();
if (!U) notes.push('No site address yet: canonical, hreflang, og:url, og:image and sitemap.xml are skipped. Set "seo": { "siteUrl": "https://your-domain/" } in app-data.json, then run the build again.');

// ---------- pages ----------
const PAGES = [
  { key: 'home', file: 'index.html' }, { key: 'about', file: 'about.html' }, { key: 'patents', file: 'patents.html' },
  { key: 'trademarks', file: 'trademarks.html' }, { key: 'translation', file: 'translation.html' }
];
const DESC = {
  home: { en: 'KHIP (Khaled Hamada Intellectual Property): patents and trademarks across the Middle East.', ar: 'KHIP (خالد حمادة للملكية الفكرية): براءات الاختراع والعلامات التجارية في الشرق الأوسط وشمال أفريقيا.' },
  about: { en: 'About KHIP: our advantages, offices, jurisdictions across the Middle East and North Africa, and our team.', ar: 'تعرف على KHIP: مزايانا ومكاتبنا والدول التي نغطيها في الشرق الأوسط وشمال أفريقيا وفريقنا.' },
  patents: { en: 'Patent protection with KHIP: filing, prosecution and maintenance across the Middle East and North Africa.', ar: 'حماية براءات الاختراع مع KHIP: التقديم والمتابعة والصيانة في الشرق الأوسط وشمال أفريقيا.' },
  trademarks: { en: 'Trademark protection with KHIP: selecting, registering, protecting and enforcing brands in the Middle East and North Africa.', ar: 'حماية العلامات التجارية مع KHIP: اختيار العلامة وتسجيلها وحمايتها وإنفاذ حقوقها في الشرق الأوسط وشمال أفريقيا.' }, 
  translation: { en: 'KH Translation: accredited translation, interpretation, localization and patent translation services.', ar: 'KH للترجمة: ترجمة معتمدة وترجمة فورية وتوطين وترجمة براءات الاختراع.' }
};
const TITLE_AR_HOME = 'KHIP - حلول الملكية الفكرية والقانونية';
const svcOf = p => (en.services || []).find(s => s.page === p.file);
const live = p => !(p.key !== 'home' && p.key !== 'about' && (!svcOf(p) || svcOf(p).hidden));   // a switched-off service page redirects home: no SEO for it
const fileFor = (p, lang) => BOTH && lang === 'ar' ? p.file.replace('.html', '-ar.html') : p.file;
const hrefFor = (p, lang) => U && (p.key === 'home' && fileFor(p, lang) === 'index.html' ? U : U + fileFor(p, lang));

// ---------- text helpers ----------
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const inl = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
const IMG = /^\s*!\[[^\]]*\]\([^)]*\)\s*$/, BUL = /^\s*(?:[-*\u2022]\s+)(.*)$/, HEAD = /^\s*##\s+(.*)$/;
function rich(t, h = 'h4') {                       // the admin's text format -> simple HTML (no pictures)
  let out = '', open = false;
  for (const l of String(t ?? '').replace(/\r/g, '').split('\n')) {
    if (IMG.test(l)) continue;
    const b = l.match(BUL);
    if (b) { if (!open) { out += '<ul>'; open = true; } out += '<li>' + inl(b[1]) + '</li>'; continue; }
    if (open) { out += '</ul>'; open = false; }
    const hd = l.match(HEAD);
    if (hd) out += `<${h}>${inl(hd[1])}</${h}>`; else if (l.trim()) out += '<p>' + inl(l) + '</p>';
  }
  return out + (open ? '</ul>' : '');
}
const plain = t => String(t ?? '').replace(/\r/g, '').split('\n').filter(l => !IMG.test(l)).map(l => l.replace(HEAD, '$1').replace(BUL, '$1').replace(/\*\*(.+?)\*\*/g, '$1').trim()).filter(Boolean).join(' ');

// ---------- data per language (same rules as KLang.merge in lang.js: Arabic over English, empty Arabic = English) ----------
const NEUTRAL = new Set(['id', 'image', 'icon', 'page', 'code', 'flag', 'date', 'category']);
function merged(lang) {
  const o = clone(en);
  o.ui = lang === 'ar' ? (ar.ui || {}) : (en.ui || {});
  if (lang !== 'ar') return o;
  for (const k of ['aboutMainText', 'about', 'ipServicesText']) if (txt(ar[k])) o[k] = ar[k];
  if (ar.contact && Array.isArray(ar.contact.address) && ar.contact.address.some(txt)) o.contact = Object.assign({}, o.contact, { address: ar.contact.address.filter(txt) });
  const enC = en.newsCategories || [], arC = ar.newsCategories || [], cm = {};
  enC.forEach((c, i) => { if (txt(arC[i])) cm[c] = arC[i]; });
  for (const sec of ['carousel', 'jurisdictions', 'news', 'services', 'testimonials', 'employees', 'products']) {
    const a = ar[sec]; if (!Array.isArray(a) || !Array.isArray(o[sec])) continue;
    const by = new Map(a.filter(x => x && x.id != null).map(x => [String(x.id), x]));
    o[sec].forEach((it, i) => {
      const x = by.get(String(it.id)) || (it.id == null ? a[i] : null); if (!x) return;
      for (const [k, v] of Object.entries(x)) if (!NEUTRAL.has(k) && txt(v)) it[k] = v;
    });
  }
  (o.news || []).forEach(n => { if (cm[n.category]) n.category = cm[n.category]; });
  for (const pg of ['home', 'about']) {                       // video sections: Arabic title, text, link and button words
    const av = (ar.videos || {})[pg], ov = (o.videos || {})[pg]; if (!av || !ov) continue;
    for (const k of ['title', 'text', 'url', 'ctaText']) if (txt(av[k])) ov[k] = av[k];
  }
  const af = ar.faq;
  if (af && o.faq) {
    if (txt(af.title)) o.faq.title = af.title; if (txt(af.intro)) o.faq.intro = af.intro;
    for (const [pk, ap] of Object.entries(af.pages || {})) {
      const op = (o.faq.pages || {})[pk]; if (!op || !ap) continue;
      if (txt(ap.title)) op.title = ap.title; if (txt(ap.intro)) op.intro = ap.intro;
      const by = new Map((ap.items || []).filter(x => x && x.id != null).map(x => [String(x.id), x]));
      (op.items || []).forEach(it => { const x = by.get(String(it.id)); if (!x) return; if (txt(x.q)) it.q = x.q; if (txt(x.a)) it.a = x.a; });
    }
  }
  return o;
}
const DATA = { en: merged('en'), ar: merged('ar') };
const T = (lang, k) => { const u = DATA[lang].ui || {}; return txt(u[k]) ? u[k] : (DICT[lang][k] ?? DICT.en[k] ?? k); };

// ---------- title / description ----------
const pageSeo = (p, field, lang) => { const v = (((seo.pages || {})[p.key] || {})[field] || {})[lang]; return txt(v) ? v.trim() : ''; };
function titleOf(p, lang, srcTitle) {
  return pageSeo(p, 'title', lang) || (lang === 'ar' ? (p.key === 'home' ? TITLE_AR_HOME : ktx(p.key + '.title1', 'ar')) : '') || srcTitle;
}
const descOf = (p, lang) => pageSeo(p, 'description', lang) || DESC[p.key][lang];

// ---------- structured data ----------
function orgLd(lang) {
  const D = DATA[lang], c = D.contact || {}, name = seo.name || 'Khaled Hamada Intellectual Property';
  const o = { '@context': 'https://schema.org', '@type': 'LegalService', name, alternateName: 'KHIP' };
  if (U) { o['@id'] = U + '#organization'; o.url = U; o.logo = U + 'assets/khaled-hamada-ip-logo.png'; o.image = U + (seo.ogImage || 'assets/khip-logo.jpg'); }
  if (c.phones && c.phones[0]) o.telephone = c.phones[0];
  if (c.emails && c.emails[0]) o.email = c.emails[0];
  const adr = (c.address || []).filter(txt).join(', '); if (adr) o.address = { '@type': 'PostalAddress', streetAddress: adr };
  const m = String(c.map || '').split(',').map(Number); if (m.length === 2 && m.every(Number.isFinite)) o.geo = { '@type': 'GeoCoordinates', latitude: m[0], longitude: m[1] };
  const areas = (en.jurisdictions || []).map(j => j.country).filter(txt); if (areas.length) o.areaServed = areas.map(n => ({ '@type': 'Country', name: n }));
  const same = Object.values(en.social || {}).filter(v => /^https:\/\//.test(v || '')); if (same.length) o.sameAs = same;
  o.availableLanguage = BOTH ? ['English', 'Arabic'] : (MODE === 'ar' ? ['Arabic'] : ['English']);
  o.description = descOf(PAGES[0], lang);
  return o;
}
function faqItems(p, lang) {
  const F = DATA[lang].faq || {}, P = (F.pages || {})[p.key] || {};
  if (P.hidden === true) return { items: [], title: '', intro: '' };
  return {
    items: (P.items || []).filter(x => x && txt(String(x.q || '')) && txt(String(x.a || ''))),
    title: txt(P.title) ? P.title : (txt(F.title) ? F.title : T(lang, 'faq_title')), intro: txt(P.intro) ? P.intro : (txt(F.intro) ? F.intro : '')
  };
}
function videoOf(p, lang) {                                    // the video of this page and language, or null
  if (!KV || (p.key !== 'home' && p.key !== 'about')) return null;
  const v = ((DATA[lang] || {}).videos || {})[p.key]; if (!v || v.hidden === true) return null;
  const pv = KV.parse(v.url); return pv ? { v, id: pv.id } : null;
}
function videoLd(p, lang, title) {
  const x = videoOf(p, lang); if (!x) return null;
  const { v, id } = x, desc = plain(v.text) || descOf(p, lang);
  const o = { '@context': 'https://schema.org', '@type': 'VideoObject', name: txt(v.title) ? v.title.trim() : title, description: desc.slice(0, 500),
    thumbnailUrl: [`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`, `https://i.ytimg.com/vi/${id}/hqdefault.jpg`],
    embedUrl: `https://www.youtube.com/embed/${id}`, contentUrl: `https://www.youtube.com/watch?v=${id}` };
  if (txt(v.poster) && U) o.thumbnailUrl = [/^https?:/i.test(v.poster) ? v.poster : U + String(v.poster).replace(/^\.?\//, '').replace(/^(?!assets\/)/, 'assets/')].concat(o.thumbnailUrl);
  if (/^\d{4}-\d{2}-\d{2}$/.test(v.date || '')) o.uploadDate = v.date;
  return o;
}
const faqLd = items => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map(x => ({ '@type': 'Question', name: String(x.q).trim(), acceptedAnswer: { '@type': 'Answer', text: plain(x.a) } })) });
const ld = (o, id) => `<script type="application/ld+json"${id ? ` id="${id}"` : ''}>${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;

// ---------- head block ----------
function headBlock(p, lang, title) {
  const d = descOf(p, lang), L = [];
  L.push(`<meta name="description" content="${esc(d)}">`);
  if (U) {
    L.push(`<link rel="canonical" href="${esc(hrefFor(p, lang))}">`);
    if (BOTH) {
      L.push(`<link rel="alternate" hreflang="en" href="${esc(hrefFor(p, 'en'))}">`);
      L.push(`<link rel="alternate" hreflang="ar" href="${esc(hrefFor(p, 'ar'))}">`);
      L.push(`<link rel="alternate" hreflang="x-default" href="${esc(hrefFor(p, 'en'))}">`);
    }
  }
  L.push('<meta property="og:type" content="website">', `<meta property="og:site_name" content="${esc(seo.name || 'KHIP')}">`,
    `<meta property="og:title" content="${esc(title)}">`, `<meta property="og:description" content="${esc(d)}">`,
    `<meta property="og:locale" content="${lang === 'ar' ? 'ar_AR' : 'en_US'}">`);
  if (BOTH) L.push(`<meta property="og:locale:alternate" content="${lang === 'ar' ? 'en_US' : 'ar_AR'}">`);
  if (U) L.push(`<meta property="og:url" content="${esc(hrefFor(p, lang))}">`, `<meta property="og:image" content="${esc(U + (seo.ogImage || 'assets/khip-logo.jpg'))}">`);
  L.push(`<meta name="twitter:card" content="summary">`, `<meta name="twitter:title" content="${esc(title)}">`, `<meta name="twitter:description" content="${esc(d)}">`);
  L.push(ld(orgLd(lang)));
  const vl = videoLd(p, lang, title); if (vl) L.push(ld(vl, 'video-ld'));
  const f = faqItems(p, lang); if (f.items.length) L.push(ld(faqLd(f.items), 'faq-ld'));     // faq.js reuses this tag (same id) and refreshes it
  return `<!--KHIP-SEO:START generated by scripts/build-seo.js, do not edit-->\n${L.join('\n')}\n<!--KHIP-SEO:END-->\n`;
}

// ---------- body block (hidden heading + <noscript> copy of the page text) ----------
function bodyBlock(p, lang, title) {
  const D = DATA[lang], link = f => esc(fileFor({ file: f }, lang)), out = [];
  const sec = (h, inner) => inner ? `<section><h2>${esc(h)}</h2>${inner}</section>` : '';
  const svcs = (D.services || []).filter(s => s && !s.hidden);
  const contact = () => {
    const c = D.contact || {}, L = [];
    (c.phones || []).filter(txt).forEach(x => L.push(`<p><a href="tel:${esc(x.replace(/[^\d+]/g, ''))}">${esc(x)}</a></p>`));
    (c.emails || []).filter(txt).forEach(x => L.push(`<p><a href="mailto:${esc(x)}">${esc(x)}</a></p>`));
    (c.address || []).filter(txt).forEach(x => L.push(`<p>${esc(x)}</p>`));
    return L.length ? `<section><h2>${lang === 'ar' ? 'تواصل معنا' : 'Contact'}</h2><address>${L.join('')}</address></section>` : '';
  };
  const faq = () => { const f = faqItems(p, lang); return f.items.length ? `<section><h2>${esc(f.title)}</h2>${f.intro ? rich(f.intro) : ''}${f.items.map(x => `<h3>${inl(String(x.q).trim())}</h3>${rich(x.a)}`).join('')}</section>` : ''; };
  // On the Arabic page, text that is still the English text (not translated yet) is left out, so the Arabic page never reads as a copy of the English one.
  const untranslated = (list, it, field) => lang === 'ar' && (list || []).some(x => String(x.id) === String(it.id) && x[field] === it[field]);
  const countries = () => sec(T(lang, 'cov_title'), `<p>${esc(T(lang, 'cov_intro'))}</p><ul>${(D.jurisdictions || []).filter(j => j && txt(j.country)).map(j => `<li><strong>${esc(j.country)}</strong>${txt(j.brief) && !untranslated(en.jurisdictions, j, 'brief') ? ': ' + inl(plain(j.brief)) : ''}</li>`).join('')}</ul>`);
  const video = () => {
    const x = videoOf(p, lang); if (!x) return '';
    const v = x.v, t = txt(v.title) ? v.title.trim() : '';
    return `<section>${t ? `<h2>${esc(t)}</h2>` : ''}${rich(v.text, 'h3')}<p><a href="https://www.youtube.com/watch?v=${x.id}">${esc(t || 'YouTube')}</a></p></section>`;
  };
  let inner = '';
  if (p.key === 'home') {
    inner += rich(D.aboutMainText || D.about, 'h3');
    inner += video();
    inner += sec(T(lang, 'svc_title'), svcs.map(s => `<article><h3>${/^[\w-]+\.html$/.test(s.page || '') ? `<a href="${link(s.page)}">${esc(s.title)}</a>` : esc(s.title)}</h3>${rich(s.description)}</article>`).join(''));
    inner += countries();
    inner += sec(T(lang, 'news_title'), (D.news || []).filter(n => n && txt(n.title) && !untranslated(en.news, n, 'title')).map(n => `<article><h3>${esc(n.title)}</h3>${txt(n.excerpt) && !untranslated(en.news, n, 'excerpt') ? '<p>' + inl(n.excerpt) + '</p>' : ''}</article>`).join(''));
    inner += sec(T(lang, 'testi_title'), (D.testimonials || []).filter(t => t && txt(t.text)).map(t => `<blockquote><p>${esc(t.text)}</p><footer>${esc([t.name, t.role].filter(txt).join(', '))}</footer></blockquote>`).join(''));
  } else if (p.key === 'about') {
    inner += rich(D.aboutMainText || D.about, 'h3');
    inner += video();
    inner += sec(T(lang, 'team_title'), `<ul>${(D.employees || []).filter(e => e && txt(e.name)).map(e => `<li><strong>${esc(e.name)}</strong>${txt(e.position) ? ', ' + esc(e.position) : ''}</li>`).join('')}</ul>`);
    inner += countries();
  } else {
    const s = svcOf(p);                                   // text written in the page itself stays; only content set in the admin is copied here
    if (s && txt(s.pageContent)) inner += rich(s.pageContent, 'h2');
  }
  inner += faq();
  inner += contact();
  const h1 = p.key === 'home' ? `<h1 class="sr-only">${esc(title)}</h1>\n` : '';
  const ns = inner ? `<noscript><div class="khip-noscript" style="max-width:56rem;margin:0 auto;padding:1.5rem;line-height:1.7">${inner}</div></noscript>\n` : '';
  return `<!--KHIP-SEO-BODY:START generated by scripts/build-seo.js, do not edit-->\n${h1}${ns}<!--KHIP-SEO-BODY:END-->\n`;
}

// ---------- assemble a page ----------
const HEAD_RE = /<!--KHIP-SEO:START[\s\S]*?<!--KHIP-SEO:END-->\s*/g, BODY_RE = /<!--KHIP-SEO-BODY:START[\s\S]*?<!--KHIP-SEO-BODY:END-->\s*/g;
const NOTICE = f => `<!-- Generated from ${f} by scripts/build-seo.js. Do not edit this file: change ${f} (or the content in the admin) and run the build. -->`;
function assemble(src, p, lang, isCopy) {
  let s = src.replace(HEAD_RE, '').replace(BODY_RE, '').replace(/<meta\s+name="description"[^>]*>\s*/i, '');
  const m = s.match(/<title([^>]*)>([^<]*)<\/title>/); if (!m || !/<\/head>/.test(s) || !/<main[^>]*>/.test(s)) throw new Error(`${p.file}: needs <title>, </head> and <main>`);
  const title = titleOf(p, lang, m[2].trim().replace(/&amp;/g, '&'));
  if (title !== m[2].trim().replace(/&amp;/g, '&')) s = s.replace(m[0], `<title${m[1]}>${esc(title)}</title>`);
  const attrs = lang === 'ar' && (isCopy || MODE === 'ar') ? ' lang="ar" dir="rtl"' : ' lang="en"';
  s = s.replace(/<html\b[^>]*>/, `<html${attrs}${BOTH ? ` data-khip-lang="${lang}"` : ''}>`);
  s = s.replace(/<\/head>/, headBlock(p, lang, title) + '</head>');
  s = s.replace(/(<main[^>]*>)\s*/, `$1\n${bodyBlock(p, lang, title)}`);
  if (isCopy) s = s.replace(/^(<!DOCTYPE[^>]*>)/i, `$1\n${NOTICE(p.file)}`);
  return s;
}

// ---------- run ----------
let lastmod = f => { try { return cp.execSync(`git log -1 --format=%cs -- ${f.map(x => JSON.stringify(x)).join(' ')}`, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { return ''; } };
const urls = [];
for (const p of PAGES) {
  const arFile = p.file.replace('.html', '-ar.html');
  if (!live(p)) {                                          // switched-off service: drop the generated Arabic copy
    if (fs.existsSync(R(arFile)) && /Generated from/.test(read(arFile))) { changed.push(arFile + ' (removed)'); if (!CHECK) fs.unlinkSync(R(arFile)); }
    notes.push(`${p.file}: service is switched off, skipped`); continue;
  }
  const src = read(p.file).replace(/^(<!DOCTYPE[^>]*>)\s*<!-- Generated from[^>]*-->/i, '$1');
  write(p.file, assemble(src, p, ROOT_LANG, false));
  if (BOTH) write(arFile, assemble(src, p, 'ar', true));
  else if (fs.existsSync(R(arFile)) && /Generated from/.test(read(arFile))) { changed.push(arFile + ' (removed)'); if (!CHECK) fs.unlinkSync(R(arFile)); }
  urls.push(p);
}

if (U) {
  const lm = lastmod(['app-data.json', 'app-data.ar.json']);
  const body = urls.map(p => {
    const langs = BOTH ? ['en', 'ar'] : [ROOT_LANG];
    return langs.map(l => `  <url>\n    <loc>${esc(hrefFor(p, l))}</loc>\n` + (lm ? `    <lastmod>${lm}</lastmod>\n` : '') +
      (BOTH ? ['en', 'ar'].map(a => `    <xhtml:link rel="alternate" hreflang="${a}" href="${esc(hrefFor(p, a))}"/>\n`).join('') + `    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(hrefFor(p, 'en'))}"/>\n` : '') + '  </url>\n').join('');
  }).join('');
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${body}</urlset>\n`);
  write('robots.txt', `# Generated by scripts/build-seo.js\nUser-agent: *\nAllow: /\n\nSitemap: ${U}sitemap.xml\n`);
}

console.log(`SEO build (${MODE} site${U ? ', ' + U : ''}): ${changed.length ? (CHECK ? 'would change' : 'changed') + ' ' + changed.join(', ') : 'nothing to change'}`);
notes.forEach(n => console.log('  note: ' + n));
if (CHECK && changed.length) process.exit(1);

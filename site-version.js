/* Version helpers + debug stamp. Loaded FIRST in <head> on every page (and in admin.html).

   1. KVER.img(url): adds ?v=<IMG_V> to every picture that lives on this site (assets/...), so a browser
      or CDN never shows an old copy. Pictures given as full web addresses (https://...) are left alone.
      To force every visitor to re-download all pictures: change IMG_V below (and the ?v=2 written
      directly in the HTML pages) to the next number.
   2. Debug stamp (public pages only): a small box in the bottom-left corner showing the site build and
      the last time app-data.json / app-data.ar.json were fetched from GitHub, with the file's
      Last-Modified time. It shows the previous fetch while the new one is loading.
        - click the box to shrink / expand it
        - add ?debug=0 to any page address to hide it (remembered), ?debug=1 to show it again
        - to remove it for good, set STAMP=false below. */
(function(){
  'use strict';
  const BUILD='Phase 4 · 15-11-2026', IMG_V='2', STAMP=true;

  const LOCAL=u=>typeof u==='string'&&u&&!/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(u);   // not http:, https:, data:, blob:, //host
  const img=u=>{
    if(!LOCAL(u))return u;
    const h=u.indexOf('#'),base=h<0?u:u.slice(0,h),hash=h<0?'':u.slice(h);
    if(/[?&]v=/.test(base))return u;
    return base+(base.includes('?')?'&':'?')+'v='+IMG_V+hash;
  };
  window.KVER={build:BUILD,imgV:IMG_V,img};

  if(!STAMP||/admin\.html$/.test(location.pathname))return;

  // ---- debug switch -------------------------------------------------------------------------------
  const LSK='khip-stamp',LSV='khip-stamp-view';
  const get=k=>{try{return localStorage.getItem(k)}catch{return null}};
  const put=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
  const q=new URLSearchParams(location.search).get('debug');
  if(q==='0')put(LSV,'off');else if(q==='1')put(LSV,'open');
  if(get(LSV)==='off')return;

  // ---- record every fetch of the site's data files --------------------------------------------------
  let saved={};try{saved=JSON.parse(get(LSK))||{}}catch{}      // last successful fetch per file (from earlier visits)
  const now={};                                                  // this visit: file -> {state, ...}
  const nameOf=i=>{
    const u=typeof i==='string'?i:(i&&i.url)||'';
    let p;try{p=new URL(u,location.href)}catch{return null}
    if(p.origin!==location.origin)return null;
    const m=/\/(app-data(?:\.ar)?\.json)$/.exec(p.pathname);return m?m[1]:null;
  };
  const real=window.fetch;
  if(real)window.fetch=function(input){
    const f=nameOf(input);if(!f)return real.apply(this,arguments);
    now[f]={state:'loading',start:Date.now()};paint();
    return real.apply(this,arguments).then(r=>{
      const h=n=>r.headers.get(n);
      const rec={at:Date.now(),status:r.status,lm:h('last-modified'),date:h('date'),etag:h('etag')};
      if(r.ok){now[f]=Object.assign({state:'ok'},rec);saved[f]=rec;put(LSK,JSON.stringify(saved))}
      else now[f]=Object.assign({state:'fail'},rec);
      paint();return r;
    },e=>{now[f]={state:'fail',at:Date.now(),err:String((e&&e.message)||e)};paint();throw e});
  };

  // ---- the box ---------------------------------------------------------------------------------------
  const p2=n=>String(n).padStart(2,'0');
  const fmt=t=>{const d=new Date(t);return isNaN(d)?'?':`${p2(d.getDate())}-${p2(d.getMonth()+1)}-${d.getFullYear()} ${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`};
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  let box=null;
  function line(f){
    const n=now[f],s=saved[f];
    if(!n&&!s)return '';
    const meta=r=>[r.lm?'file saved '+fmt(r.lm):'',r.etag?'etag '+esc(r.etag.replace(/^W\//,'').replace(/"/g,'').slice(0,10)):''].filter(Boolean).join(' · ');
    if(!n)return `<div>${esc(f)}: last fetch ${fmt(s.at)}<br><span class="k-d">${meta(s)}</span></div>`;
    if(n.state==='loading')return `<div>${esc(f)}: <b>fetching from GitHub…</b>${s?`<br><span class="k-d">previous: ${fmt(s.at)}</span>`:''}</div>`;
    if(n.state==='ok')return `<div>${esc(f)}: <b class="k-ok">fetched ${fmt(n.at)}</b><br><span class="k-d">${meta(n)}</span></div>`;
    return `<div>${esc(f)}: <b class="k-bad">fetch FAILED${n.status?' ('+n.status+')':''}</b>${s?`<br><span class="k-d">showing saved copy, last good fetch ${fmt(s.at)}</span>`:''}</div>`;
  }
  function paint(){
    if(!box)return;
    const open=get(LSV)!=='closed';
    const files=['app-data.json','app-data.ar.json'].filter(f=>now[f]||(f==='app-data.json'));
    const body=files.map(line).join('')||'<div>app-data.json: not fetched yet</div>';
    box.innerHTML=open
      ?`<div><b>KHIP ${esc(BUILD)}</b> · images v${esc(IMG_V)}</div>${body}<div class="k-d">tap to shrink · ?debug=0 hides</div>`
      :`<b>v${esc(BUILD.split(' ')[1]||'')}</b>`;
  }
  function mount(){
    if(box)return;
    const st=document.createElement('style');
    st.textContent='#khip-stamp{position:fixed;left:6px;bottom:calc(var(--khip-h,0px) + 6px);z-index:9999;max-width:min(92vw,22rem);padding:6px 9px;border-radius:8px;background:rgba(15,23,42,.88);color:#e2e8f0;font:11px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace;cursor:pointer;direction:ltr;text-align:left;box-shadow:0 2px 10px rgba(0,0,0,.25)}#khip-stamp .k-d{opacity:.65}#khip-stamp .k-ok{color:#86efac}#khip-stamp .k-bad{color:#fca5a5}#khip-stamp div+div{margin-top:3px}';
    document.head.appendChild(st);
    box=document.createElement('div');box.id='khip-stamp';box.setAttribute('role','status');
    box.addEventListener('click',()=>{put(LSV,get(LSV)==='closed'?'open':'closed');paint()});
    document.body.appendChild(box);paint();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();

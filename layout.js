/* KHIP layout.js: which sections show, in which order, copies of sections, and which parts of a section show.
   Loaded in <head> of every public page, right after theme.js. The settings are in "theme" of app-data.json (admin, Sections):
     theme.layout.hide   {<section>: true}                   the section is not shown
     theme.layout.order  {<page>: [<section>, ...]}           home | about | patents | trademarks | translation; the sections of that page,
                                                              top to bottom (copies included). Not set = the order of the HTML
     theme.layout.copies {<copy>: <section>}                  e.g. {"home-faq-c2": "home-faq"}: a second copy of a section on the same page
     theme.parts         {<section>: {<part>: true}}          hide one part of a section (the parts are listed in PARTS below)
   A section is a <section data-sec="..."> (the home slider is data-lay="home-hero"). Parts carry data-part="...".
   A copy shows the same content as its section and follows it live (texts, lists, language). Its look (background,
   header, parts, columns, cards, fonts, alignment, animation) is its own, under its own name. Buttons and links in a
   copy work: a click is handed to the same button of the original section.
   Nothing changes until something is set. */
(function(){
  'use strict';
  // The parts of each section that can be hidden: [part, label, what it is]. Used by the site (data-part) and the admin.
  const PARTS={
    'home-about':[['logo','Logo','The KHIP logo beside the text'],['text','About text',''],['more','"More" button','The button to the About page']],
    'home-jurisdictions':[['intro','Intro text','The sentence under the title'],['map','Map','The map of the countries'],['chips','Country buttons','The row of country names under the map']],
    'home-services':[['ip','IP Services card','Patents, Trademarks and the other IP services'],['tr','Translation card','']],
    'home-news':[['ctl','Arrows and dots','The controls under the news cards']],
    'home-testimonials':[['ctl','Arrows and dots','The controls under the quote']],
    'home-faq':[['intro','Intro text','Shows only when the FAQ has an intro']],
    'about-intro':[['logo','Logo',''],['text','Text','The paragraphs under the title'],['tiles','Service tiles','Patents, Trademarks and Translation buttons']],
    'about-map':[['chips','Country buttons',''],['card','Country card','The card of the chosen country, with its arrows']],
    'about-value':[['text','Text','']],
    'about-quote':[['quote','Quote','The large text'],['text','Text under the quote','']],
    'about-advantages':[['c1','First card','Quality'],['c2','Second card','Technology'],['c3','Third card','Client experience']],
    'about-team':[['arrows','Arrows and counter',''],['dots','Dots','']],
    'about-faq':[['intro','Intro text','Shows only when the FAQ has an intro']],
    'about-contact':[['text','Text','The sentence under the title'],['follow','Social links',''],['phone','Phone tiles',''],['email','Email tile',''],['address','Address tile',''],['map','Map',''],['year','Year line','The small line at the very end']]
  };
  ['patents','trademarks','translation'].forEach(p=>{
    PARTS[p+'-intro']=[['text','Page text','The introduction under the title'],['facts','Fact cards','The small cards beside the text']];
    PARTS[p+'-faq']=[['intro','Intro text','Shows only when the FAQ has an intro']];
    PARTS[p+'-contact']=[['text','Text','The sentence under the title'],['email','Email button',''],['phone','Phone button',''],['links','Links to the other services','The cards under the box']];
  });
  const KEY=/^[a-z]+-[a-z-]+[a-z](-c[0-9]{1,3})?$/;
  const COPY=/^(.+)-c([0-9]{1,3})$/;
  const base=k=>{const m=COPY.exec(String(k||''));return m?m[1]:String(k||'')};
  // Sections that cannot be copied: the slider (one per page) and the videos (a second player of the same video)
  const NOCOPY=['home-hero','home-video','about-video'];
  window.KLAYOUT={PARTS,KEY,COPY,base,NOCOPY};

  const K=window.KTHEME;
  if(!K||/admin\.html$/.test(location.pathname))return;
  let T=K.current||{};
  const L=()=>(T&&T.layout)||{};
  const keyOf=el=>el.getAttribute('data-sec')||el.getAttribute('data-lay')||'';

  /* ---------- hidden sections and parts: one style sheet, written before the page paints ---------- */
  function css(){
    let s='';
    const H=L().hide||{},P=T.parts||{};
    Object.keys(H).forEach(k=>{if(H[k]===true&&KEY.test(k))s+=`[data-sec="${k}"],[data-lay="${k}"]{display:none!important}\n`});
    Object.keys(P).forEach(k=>{
      const o=P[k];if(!KEY.test(k)||!o||typeof o!=='object')return;
      Object.keys(o).forEach(p=>{if(o[p]===true&&/^[a-z0-9]+$/.test(p))s+=`[data-sec="${k}"] [data-part~="${p}"]{display:none!important}\n`});
    });
    let el=document.getElementById('khip-layout');
    if(!el){el=document.createElement('style');el.id='khip-layout';document.head.appendChild(el)}
    if(el.textContent!==s)el.textContent=s;
  }

  /* ---------- copies ---------- */
  const main=()=>document.querySelector('main');
  const managed=el=>el&&el.nodeType===1&&(el.hasAttribute('data-sec')||el.hasAttribute('data-lay'));
  const copies=new Map();                                   // copy name -> {el, orig, of, mo, t}
  function fill(c){
    const {el,orig}=c,light=el.classList.contains('sec-light');
    el.className=orig.className;el.classList.toggle('sec-light',light);
    el.innerHTML=orig.innerHTML;
    el.querySelectorAll('[id]').forEach(n=>{n.setAttribute('data-cid',n.id);n.removeAttribute('id')});   // one id per page: the original keeps it
    el.querySelectorAll('[aria-live]').forEach(n=>n.setAttribute('aria-live','off'));
    el.querySelectorAll('.ax').forEach(n=>n.classList.remove('ax','ax-go'));
    el.querySelectorAll('.fu').forEach(n=>n.classList.add('in'));
  }
  function later(c){clearTimeout(c.t);c.t=setTimeout(()=>{if(document.contains(c.el))fill(c)},120)}
  // A click in the copy is given to the same element of the original section (sliders, map, pop-ups keep working)
  function forward(c,e){
    const t=e.target;if(!(t instanceof Element))return;
    if(t.closest('a[href],summary,input,select,textarea,label,iframe,video'))return;          // these work by themselves
    const path=[];let n=t;
    while(n&&n!==c.el){const p=n.parentElement;if(!p)return;path.unshift(Array.prototype.indexOf.call(p.children,n));n=p}
    if(n!==c.el)return;
    let o=c.orig;for(const i of path){o=o&&o.children[i]}
    if(!o)return;
    e.preventDefault();e.stopPropagation();
    o.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window,clientX:e.clientX,clientY:e.clientY}));
  }
  function syncCopies(m){
    const C=L().copies||{};
    for(const [k,c] of copies){
      if(C[k]!==c.of||!document.contains(c.orig)){c.mo.disconnect();clearTimeout(c.t);c.el.remove();copies.delete(k)}
    }
    Object.keys(C).forEach(k=>{
      const of=C[k];
      if(copies.has(k)||!KEY.test(k)||base(k)!==of||NOCOPY.includes(of))return;
      const orig=[...m.children].find(x=>x.getAttribute('data-sec')===of&&!x.hasAttribute('data-copy-of'));
      if(!orig)return;                                      // not on this page (or not shown as a section)
      const el=document.createElement(orig.tagName.toLowerCase());
      el.setAttribute('data-sec',k);el.setAttribute('data-copy-of',of);
      let last=orig;while(last.nextElementSibling&&!managed(last.nextElementSibling))last=last.nextElementSibling;
      last.after(el);
      const c={el,orig,of,t:0};
      c.mo=new MutationObserver(rs=>{if(rs.some(r=>!(r.type==='attributes'&&r.attributeName==='open')))later(c)});
      c.mo.observe(orig,{childList:true,subtree:true,characterData:true,attributes:true});
      el.addEventListener('click',e=>forward(c,e),true);
      copies.set(k,c);fill(c);
      if(K.paintSec)K.paintSec([el],T);
    });
  }

  /* ---------- order ---------- */
  function order(m){
    const kids=[...m.children],groups=[];
    kids.forEach(el=>{if(managed(el))groups.push([el]);else if(groups.length)groups[groups.length-1].push(el)});   // a section takes what follows it along
    if(!groups.length)return;
    const page=keyOf(groups[0][0]).split('-')[0],list=((L().order||{})[page])||null;
    if(!Array.isArray(list)||!list.length)return;
    const rank=g=>{const i=list.indexOf(keyOf(g[0]));return i};
    // sections that are not in the list stay just after the section they follow now
    let prev=-1;const ranked=groups.map((g,n)=>{const r=rank(g);const v=r>=0?r:prev+.001*(n+1);if(r>=0)prev=r;return [v,n,g]});
    const want=ranked.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]).map(x=>x[2]);
    if(want.every((g,i)=>g===groups[i]))return;
    want.forEach(g=>g.forEach(el=>m.appendChild(el)));
  }

  /* ---------- run ---------- */
  let busy=false,q=0,mmo=null;
  function update(){
    css();
    const m=main();if(!m)return;
    busy=true;
    try{syncCopies(m);order(m)}finally{if(mmo)mmo.takeRecords();busy=false}
    if(!mmo){
      mmo=new MutationObserver(()=>{if(busy||q)return;q=requestAnimationFrame(()=>{q=0;update()})});   // a section added later (the video)
      mmo.observe(m,{childList:true});
    }
  }
  css();                                                    // hidden sections never flash
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn();
  document.addEventListener('khip-theme',e=>{T=e.detail||{};ready(update)});
  ready(update);
})();

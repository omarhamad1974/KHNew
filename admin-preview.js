/* KHIP admin: the live preview.
   A frame that shows the real site page with what is on screen in the admin RIGHT NOW (saved or not): phone, tablet
   or desktop width, English or Arabic, scrolled to the section being edited and outlined. The page inside the frame is
   the public page itself (index.html, about.html, ...) opened with ?khip-preview=1; preview.js (loaded by every page)
   asks this file for the data instead of GitHub (KPV.data) and tells it when it has loaded (KPV.loaded) or scrolled.
   Loaded by admin.html after admin-general.js. Uses: D, A, tab, gsub, ASSETS, imgSrc, mirror, compact, mark, ASEC, ALOOK. */
const KPV=(()=>{
  const DEV=[['m','Phone',390,'fa-mobile-screen'],['t','Tablet',820,'fa-tablet-screen-button'],['d','Desktop',1280,'fa-desktop']];
  const PAGES=[['home','Home','index.html'],['about','About','about.html'],['patents','Patents','patents.html'],['trademarks','Trademarks','trademarks.html'],['translation','Translation','translation.html']];
  // General pages: which page and section show what that page changes
  const GEN={brand:['home',''],contact:['about','about-contact'],words:['home',''],colors:['home',''],fonts:['home',''],menu:['home',''],cards:['home','home-services'],align:['home','home-about'],imgfx:['home','home-news'],anim:['home','home-services'],motion:['home','home-jurisdictions']};
  const KEY='khip-pv',file=p=>(PAGES.find(x=>x[0]===p)||PAGES[0])[2];
  const st={open:null,dev:matchMedia('(max-width:700px)').matches?'m':'d',lang:'en',hl:true,auto:true,big:false};
  try{Object.assign(st,JSON.parse(localStorage.getItem(KEY))||{});st.big=false}catch{}
  const keep=()=>{try{localStorage.setItem(KEY,JSON.stringify({open:st.open,dev:st.dev,lang:st.lang,hl:st.hl,auto:st.auto}))}catch{}};
  let el=null,frame=null,stage=null,scaler=null,cur={page:'',key:''},genPage=null,y=0,timer=0,watch=0,pending=false,loading=false,shown='',ASSETS0=new Set();
  const $q=s=>el&&el.querySelector(s);

  /* ---------- the data the page inside the frame gets (what saving would write) ---------- */
  function fixImages(o){
    const fix=v=>{if(!v||/^(https?:|data:)/.test(v))return v;const n=String(v).replace(/^\.?\/?assets\//,'');return ASSETS0.has(n)?v:imgSrc(v)};   // a picture uploaded in this session is not on the website yet: read it from GitHub
    const walk=x=>{if(Array.isArray(x))x.forEach(walk);else if(x&&typeof x==='object')for(const k of Object.keys(x)){if((k==='image'||k==='poster')&&typeof x[k]==='string')x[k]=fix(x[k]);else walk(x[k])}};
    walk(o);
  }
  function data(kind,lang){
    if(!D)return '';
    if(kind==='ar')return JSON.stringify(compact(mirror(D,A)));
    const c=JSON.parse(JSON.stringify(D));
    c.languages=lang==='ar'?'ar':'en';                       // the preview shows one language at a time
    if(window.ALOOK&&c.theme)ALOOK.clean(c.theme);
    if(c.theme&&c.theme.sections)Object.keys(c.theme.sections).forEach(k=>{const m=(c.theme.sections[k]||{}).mode;if(m!=='color'&&m!=='image')delete c.theme.sections[k]});
    fixImages(c);
    return JSON.stringify(c);
  }

  /* ---------- what to show ---------- */
  function want(){
    if(typeof tab!=='undefined'&&tab==='sections'){const c=ASEC.cur();return {page:c.page,key:c.key,label:(PAGES.find(p=>p[0]===c.page)||[])[1]+' page · '+((ASEC.entry(c.key)||{}).label||'')}}
    const g=GEN[gsub]||['home',''],p=genPage||g[0];
    return {page:p,key:genPage&&genPage!==g[0]?'':g[1],label:(PAGES.find(x=>x[0]===p)||[])[1]+' page'};
  }
  const url=(w,keepY)=>{
    const u=new URL(file(w.page),location.href),q=u.searchParams;
    q.set('khip-preview','1');q.set('lang',st.lang);if(w.key)q.set('sec',w.key);q.set('hl',st.hl?'1':'0');if(keepY>0)q.set('y',Math.round(keepY));q.set('t',Date.now());
    return u.toString();
  };
  function load(keepY){
    if(!frame||!st.open)return;
    const w=want();cur={page:w.page,key:w.key};
    loading=true;pending=false;head();
    clearTimeout(watch);watch=setTimeout(()=>{if(loading){loading=false;head();$q('#pv-warn').classList.remove('hidden')}},12000);
    $q('#pv-warn').classList.add('hidden');
    frame.src=url(w,keepY&&shown===file(w.page)?y:0);
  }
  // Called whenever the admin screen is drawn: follow the section being edited
  function sync(){
    if(!el)return;
    if(!st.open){btn();return}
    const w=want();
    if(!frame.src||frame.src==='about:blank'||w.page!==cur.page){load(false);return}
    if(w.key!==cur.key){cur.key=w.key;try{frame.contentWindow.__khipFocus&&frame.contentWindow.__khipFocus(w.key)}catch{}}
    head();
  }
  // Called when the data changes (every edit): reload after a short pause, keeping the scroll position
  function touch(){
    if(!el||!st.open)return;
    if(!st.auto){pending=true;head();return}
    clearTimeout(timer);timer=setTimeout(()=>load(true),700);
  }
  // Called by preview.js inside the frame
  const loaded=f=>{
    shown=f;loading=false;clearTimeout(watch);$q('#pv-warn').classList.add('hidden');
    const pg=PAGES.find(p=>p[2]===f);                          // a link followed inside the preview (General): that page is now the one shown
    if(pg&&typeof tab!=='undefined'&&tab==='general'&&pg[0]!==cur.page){genPage=pg[0];cur={page:pg[0],key:''}}
    head();
  };
  const scrolled=v=>{y=v};

  /* ---------- the panel ---------- */
  const b=(a,t,ic,extra='')=>`<button type="button" data-pv="${a}" title="${t}" aria-label="${t}" class="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs flex-shrink-0 ${extra}"><i class="fas ${ic}"></i></button>`;
  function build(){
    el=document.getElementById('pv');if(!el||el.dataset.built)return;el.dataset.built='1';
    el.innerHTML=`<div class="pv-card bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden h-full">
      <div class="flex items-center gap-1.5 p-2 border-b border-gray-200 flex-wrap">
        <div class="flex-1 min-w-[8rem]"><div class="text-xs font-extrabold"><i class="fas fa-eye text-brand-600"></i> Live preview <span id="pv-busy" class="font-normal text-gray-400 hidden"><i class="fas fa-spinner fa-spin"></i> updating</span></div><div id="pv-what" class="text-[11px] text-gray-500 truncate"></div></div>
        <div class="flex gap-1" role="group" aria-label="Screen size">${DEV.map(([k,n,w,i])=>`<button type="button" data-pv="dev" data-k="${k}" title="${n} (${w} px wide)" aria-label="${n}" class="w-8 h-8 rounded-lg text-xs"><i class="fas ${i}"></i></button>`).join('')}</div>
        <div class="flex gap-1" role="group" aria-label="Language"><button type="button" data-pv="lang" data-k="en" class="h-8 px-2 rounded-lg text-[11px] font-extrabold">EN</button><button type="button" data-pv="lang" data-k="ar" lang="ar" class="h-8 px-2 rounded-lg text-[11px] font-extrabold">عربي</button></div>
        ${b('refresh','Refresh the preview now','fa-rotate','')}${b('big','Enlarge or shrink the preview','fa-expand','')}${b('close','Hide the preview','fa-xmark','')}
      </div>
      <div class="flex flex-wrap items-center gap-x-4 gap-y-1 px-2.5 py-1.5 border-b border-gray-200 text-[11px] text-gray-700">
        <label id="pv-pagebox" class="hidden items-center gap-1.5 font-bold">Page <select id="pv-page" class="border border-gray-300 rounded-lg px-1.5 py-1 font-normal bg-white">${PAGES.map(p=>`<option value="${p[0]}">${p[1]}</option>`).join('')}</select></label>
        <label class="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" data-pv="hl"> Outline this section</label>
        <label class="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" data-pv="auto"> Update as I type</label>
      </div>
      <div id="pv-stage" class="relative flex-1 min-h-0 bg-gray-200 overflow-hidden">
        <div id="pv-scaler" class="absolute left-0 top-0" style="transform-origin:0 0"><iframe id="pv-frame" title="Preview of the website with your changes" class="block bg-white border-0 shadow-lg"></iframe></div>
        <p id="pv-warn" class="hidden absolute inset-x-3 top-3 text-xs bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3">The preview did not start. Open this admin page from the website's own address (for example https://your-name.github.io/KHNew/admin.html), not from a file on your computer, then press Refresh.</p>
      </div>
      <p class="text-[10px] text-gray-500 px-2.5 py-1.5 border-t border-gray-200">This is the real page with your unsaved changes. Nothing is published until you press <b>Save to GitHub</b>. Links and buttons are switched off here.</p>
    </div>`;
    frame=$q('#pv-frame');stage=$q('#pv-stage');scaler=$q('#pv-scaler');
    if(window.ResizeObserver)new ResizeObserver(fit).observe(stage);
    el.addEventListener('click',e=>{
      const t=e.target.closest('[data-pv]');if(!t)return;
      const a=t.dataset.pv;
      if(a==='dev'){st.dev=t.dataset.k;keep();head();fit()}
      else if(a==='lang'){st.lang=t.dataset.k;keep();load(true)}
      else if(a==='refresh')load(true);
      else if(a==='big'){st.big=!st.big;layout();head()}
      else if(a==='close')setOpen(false);
    });
    el.addEventListener('change',e=>{
      const t=e.target;
      if(t.id==='pv-page'){genPage=t.value;load(false);return}
      if(t.dataset.pv==='hl'){st.hl=t.checked;keep();try{frame.contentWindow.__khipFocus&&frame.contentWindow.__khipFocus(cur.key,st.hl)}catch{}}
      else if(t.dataset.pv==='auto'){st.auto=t.checked;keep();if(st.auto&&pending)load(true);head()}
    });
    addEventListener('resize',layout);
    addEventListener('keydown',e=>{if(e.key==='Escape'&&st.big){st.big=false;layout();head()}});
  }
  function fit(){
    if(!stage||!st.open)return;
    const W=(DEV.find(d=>d[0]===st.dev)||DEV[2])[2],Ws=stage.clientWidth,Hs=stage.clientHeight;if(!Ws||!Hs)return;
    const s=Math.min(1,Ws/W),left=Math.max(0,(Ws-W*s)/2);
    scaler.style.width=W+'px';scaler.style.height=(Hs/s)+'px';scaler.style.transform=`scale(${s})`;scaler.style.left=left+'px';
    frame.style.width=W+'px';frame.style.height=(Hs/s)+'px';
  }
  function layout(){
    if(!el)return;
    const side=st.open&&!st.big&&matchMedia('(min-width:1280px)').matches;
    document.body.classList.toggle('pv-side',side);
    el.classList.toggle('hidden',!st.open);el.classList.toggle('pv-big',st.big&&st.open);el.classList.toggle('pv-top',st.open&&!side&&!st.big);
    if(side){const h=document.querySelector('#app>header');el.style.setProperty('--pv-top',((h?h.getBoundingClientRect().bottom:120)+8)+'px')}
    fit();btn();
  }
  function head(){
    if(!el||!st.open)return;
    const w=want();
    $q('#pv-what').textContent=w.label+(st.lang==='ar'?' · Arabic':'');
    $q('#pv-busy').classList.toggle('hidden',!loading);
    el.querySelectorAll('[data-pv=dev]').forEach(x=>{const on=x.dataset.k===st.dev;x.className=`w-8 h-8 rounded-lg text-xs ${on?'bg-brand-600 text-white':'bg-gray-100 hover:bg-gray-200'}`});
    el.querySelectorAll('[data-pv=lang]').forEach(x=>{const on=x.dataset.k===st.lang;x.className=`h-8 px-2 rounded-lg text-[11px] font-extrabold ${on?'bg-brand-600 text-white':'bg-gray-100 hover:bg-gray-200'}`});
    const r=$q('[data-pv=refresh]');r.className=`w-8 h-8 rounded-lg text-xs flex-shrink-0 ${pending?'bg-amber-400 text-gray-900 animate-pulse':'bg-gray-100 hover:bg-gray-200'}`;r.title=pending?'Your changes are not in the preview yet: press to refresh':'Refresh the preview now';
    $q('[data-pv=hl]').checked=st.hl;$q('[data-pv=auto]').checked=st.auto;
    const pb=$q('#pv-pagebox');pb.classList.toggle('hidden',!(typeof tab!=='undefined'&&tab==='general'));pb.classList.toggle('flex',typeof tab!=='undefined'&&tab==='general');
    $q('#pv-page').value=w.page;
    const bg=$q('[data-pv=big] i');bg.className='fas '+(st.big?'fa-compress':'fa-expand');
  }
  function btn(){
    const x=document.getElementById('pv-btn');if(!x)return;
    x.className=`text-xs font-bold px-3 py-2 rounded-xl flex-shrink-0 ${st.open?'bg-brand-600 text-white hover:bg-brand-700':'bg-gray-100 hover:bg-gray-200'}`;x.setAttribute('aria-pressed',st.open?'true':'false');
  }
  function setOpen(v){
    st.open=v;keep();if(!el)build();
    if(!v){clearTimeout(timer);clearTimeout(watch);if(frame)frame.src='about:blank';cur={page:'',key:''};st.big=false}
    layout();if(v){head();sync()}
  }
  function init(){
    ASSETS0=new Set(ASSETS||[]);build();genPage=null;
    if(st.open===null)st.open=matchMedia('(min-width:1280px)').matches;
    cur={page:'',key:''};if(frame)frame.src='about:blank';
    layout();if(st.open){head();sync()}
  }
  document.addEventListener('click',e=>{const t=e.target.closest('#pv-btn');if(t&&D){if(!el)build();setOpen(!st.open)}});
  return {init,sync,touch,data,loaded,scrolled,layout};
})();
window.KPV=KPV;

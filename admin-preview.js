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
  const GEN={brand:['home',''],contact:['about','about-contact'],words:['home',''],colors:['home',''],fonts:['home',''],menu:['home',''],cards:['home','home-services'],icons:['home','home-services'],shapes:['home','home-news'],align:['home','home-about'],imgfx:['home','home-news'],anim:['home','home-services'],motion:['home','home-jurisdictions']};
  const KEY='khip-pv',file=p=>(PAGES.find(x=>x[0]===p)||PAGES[0])[2];
  const st={open:null,dev:matchMedia('(max-width:700px)').matches?'m':'d',lang:'en',hl:true,auto:true,big:false,dockH:.46,pick:true};   // pick: tap the page to edit that part   // dockH: share of the screen the docked preview takes (phones, tablets)
  try{Object.assign(st,JSON.parse(localStorage.getItem(KEY))||{});st.big=false}catch{}
  const keep=()=>{try{localStorage.setItem(KEY,JSON.stringify({open:st.open,dev:st.dev,lang:st.lang,hl:st.hl,auto:st.auto,dockH:st.dockH,pick:st.pick}))}catch{}};
  let el=null,frame=null,stage=null,scaler=null,cur={page:'',key:''},lastItem=null,genPage=null,y=0,timer=0,watch=0,pending=false,loading=false,shown='',ASSETS0=new Set();
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
    q.set('khip-preview','1');q.set('lang',st.lang);if(w.key)q.set('sec',w.key);q.set('hl',st.hl?'1':'0');q.set('pick',st.pick?'1':'0');if(keepY>0)q.set('y',Math.round(keepY));q.set('t',Date.now());
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
    if(w.key!==cur.key){cur.key=w.key;lastItem=null;try{frame.contentWindow.__khipFocus&&frame.contentWindow.__khipFocus(w.key)}catch{}}
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
    if(lastItem)setTimeout(()=>showItem(lastItem),400);                     // the item being edited stays shown after an update
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
      <div class="pv-grip" id="pv-grip" role="separator" aria-orientation="horizontal" aria-label="Drag to make the preview taller or shorter" title="Drag to resize; double-tap for full screen"><span></span></div>
      <div class="pv-bar flex items-center gap-1.5 p-2 border-b border-gray-200 flex-wrap">
        <div class="flex-1 min-w-[8rem]"><div class="text-xs font-extrabold"><i class="fas fa-eye text-brand-600"></i> Live preview <span id="pv-busy" class="font-normal text-gray-400 hidden"><i class="fas fa-spinner fa-spin"></i> updating</span></div><div id="pv-what" class="text-[11px] text-gray-500 truncate"></div></div>
        <div class="flex gap-1" role="group" aria-label="Screen size">${DEV.map(([k,n,w,i])=>`<button type="button" data-pv="dev" data-k="${k}" title="${n} (${w} px wide)" aria-label="${n}" class="w-8 h-8 rounded-lg text-xs"><i class="fas ${i}"></i></button>`).join('')}</div>
        <div class="flex gap-1" role="group" aria-label="Language"><button type="button" data-pv="lang" data-k="en" class="h-8 px-2 rounded-lg text-[11px] font-extrabold">EN</button><button type="button" data-pv="lang" data-k="ar" lang="ar" class="h-8 px-2 rounded-lg text-[11px] font-extrabold">عربي</button></div>
        ${b('refresh','Refresh the preview now','fa-rotate','')}${b('big','Enlarge or shrink the preview','fa-expand','')}${b('close','Hide the preview','fa-xmark','')}
      </div>
      <div class="pv-opts flex flex-wrap items-center gap-x-4 gap-y-1 px-2.5 py-1.5 border-b border-gray-200 text-[11px] text-gray-700">
        <label id="pv-pagebox" class="hidden items-center gap-1.5 font-bold">Page <select id="pv-page" class="border border-gray-300 rounded-lg px-1.5 py-1 font-normal bg-white">${PAGES.map(p=>`<option value="${p[0]}">${p[1]}</option>`).join('')}</select></label>
        <label class="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" data-pv="hl"> Outline this section</label>
        <label class="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" data-pv="auto"> Update as I type</label>
        <label class="flex items-center gap-1.5 cursor-pointer font-bold text-brand-700" title="Tap a section, a card, a question or a picture in the preview and its settings open in the editor"><input type="checkbox" data-pv="pick"> Tap the page to edit it</label>
      </div>
      <div id="pv-stage" class="relative flex-1 min-h-0 bg-gray-200 overflow-hidden">
        <div id="pv-scaler" class="absolute left-0 top-0" style="transform-origin:0 0"><iframe id="pv-frame" title="Preview of the website with your changes" class="block bg-white border-0 shadow-lg"></iframe></div>
        <p id="pv-warn" class="hidden absolute inset-x-3 top-3 text-xs bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3">The preview did not start. Open this admin page from the website's own address (for example https://your-name.github.io/KHNew/admin.html), not from a file on your computer, then press Refresh.</p>
      </div>
      <p class="pv-foot text-[10px] text-gray-500 px-2.5 py-1.5 border-t border-gray-200">This is the real page with your unsaved changes. Nothing is published until you press <b>Save to GitHub</b>. Links and buttons are switched off here.</p>
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
      else if(t.dataset.pv==='pick'){st.pick=t.checked;keep();try{frame.contentWindow.__khipPick&&frame.contentWindow.__khipPick(st.pick)}catch{}}
    });
    addEventListener('resize',layout);
    if(window.visualViewport)visualViewport.addEventListener('resize',dockSize);   // a phone keyboard opening: keep the preview to a part of what is left
    // drag the grip to resize the docked preview; double-tap it for full screen
    const g=$q('#pv-grip');let drag=null,lastTap=0;
    g.addEventListener('pointerdown',e=>{drag={y:e.clientY};g.setPointerCapture(e.pointerId)});
    g.addEventListener('pointermove',e=>{if(!drag)return;const H=innerHeight;st.dockH=Math.min(.85,Math.max(.22,(H-e.clientY)/H));dockSize()});
    g.addEventListener('pointerup',e=>{if(!drag)return;const moved=Math.abs(e.clientY-drag.y)>6;drag=null;keep();
      if(!moved){const n=Date.now();if(n-lastTap<350){st.big=true;layout();head()}lastTap=n}});
    // the box you type in stays visible above the docked preview
    document.addEventListener('focusin',e=>{
      if(!document.body.classList.contains('pv-docked'))return;
      const t=e.target;if(!t.matches||!t.matches('input,textarea,select')||(el&&el.contains(t)))return;
      setTimeout(()=>{try{t.scrollIntoView({block:'nearest'})}catch{}},350);
    });
    const fab=document.createElement('button');fab.id='pv-fab';fab.type='button';
    fab.className='fixed right-4 bottom-4 z-30 items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm px-4 py-3 rounded-full shadow-xl';
    fab.innerHTML='<i class="fas fa-eye"></i> Preview';fab.setAttribute('aria-label','Show the live preview');
    fab.addEventListener('click',()=>setOpen(true));document.body.appendChild(fab);
    addEventListener('keydown',e=>{if(e.key==='Escape'&&st.big){st.big=false;layout();head()}});
  }
  function fit(){
    if(!stage||!st.open)return;
    const W=(DEV.find(d=>d[0]===st.dev)||DEV[2])[2],Ws=stage.clientWidth,Hs=stage.clientHeight;if(!Ws||!Hs)return;
    const s=Math.min(1,Ws/W),left=Math.max(0,(Ws-W*s)/2);
    scaler.style.width=W+'px';scaler.style.height=(Hs/s)+'px';scaler.style.transform=`scale(${s})`;scaler.style.left=left+'px';
    frame.style.width=W+'px';frame.style.height=(Hs/s)+'px';
  }
  // the docked preview's height in px: a share of the visible screen (smaller while a phone keyboard is open)
  function dockSize(){
    if(!el||!document.body.classList.contains('pv-docked'))return;
    const vv=window.visualViewport,H=vv?vv.height:innerHeight,kb=vv&&vv.height<innerHeight*.8;
    const h=Math.round(Math.max(150,(kb?Math.min(st.dockH,.4):st.dockH)*H));
    document.documentElement.style.setProperty('--dockh',h+'px');fit();
  }
  function layout(){
    if(!el)return;
    const wide=matchMedia('(min-width:1280px)').matches,side=st.open&&!st.big&&wide,dock=st.open&&!st.big&&!wide;
    document.body.classList.toggle('pv-side',side);
    document.body.classList.toggle('pv-docked',dock);document.documentElement.classList.toggle('pv-docked',dock);
    document.body.classList.toggle('pv-fab',!st.open&&!!D);
    el.classList.toggle('hidden',!st.open);el.classList.toggle('pv-big',st.big&&st.open);el.classList.toggle('pv-dock',dock);el.classList.remove('pv-top');
    if(dock)dockSize();
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
    $q('[data-pv=hl]').checked=st.hl;$q('[data-pv=auto]').checked=st.auto;$q('[data-pv=pick]').checked=st.pick;
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

  /* ---------- tap to edit: the page in the frame says what was tapped (preview.js); open it here ---------- */
  const low=v=>String(v||'').trim().toLowerCase();
  function findItem(list,it){
    const arr=D[list],ar=(A&&A[list])||[];if(!Array.isArray(arr))return -1;
    let i=-1;
    if(it.id!=null)i=arr.findIndex(x=>x&&String(x.id)===String(it.id));
    if(i<0&&it.name){const n=low(it.name);i=arr.findIndex((x,k)=>[x.title,x.name,x.country,(ar[k]||{}).title,(ar[k]||{}).name,(ar[k]||{}).country].some(v=>v&&(low(v)===n||(low(v).length>2&&n.includes(low(v))))))}
    if(i<0&&it.i!=null&&!['employees','services','jurisdictions'].includes(list))i=it.i;
    return i<arr.length?i:-1;
  }
  function pick(o){
    if(!o||!o.key||!window.ASEC||!ASEC.entry(o.key))return;
    ASEC.go(o.key);
    const it=o.item;let label=ASEC.entry(o.key).label;
    if(it&&it.faq){
      const items=((((D.faq||{}).pages||{})[it.faq])||{}).items||[],full=items.map((x,i)=>[x,i]).filter(([x])=>String(x.q||'').trim()&&String(x.a||'').trim()),m=full[it.i];
      if(m){faqPage=it.faq;faqOpen=m[1];label+=' · question '+(m[1]+1)}
    }else if(it&&it.list){
      const i=findItem(it.list,it);if(i>=0){openItem=`${it.list}.${i}`;const x=D[it.list][i]||{};label+=' · '+(x.title||x.name||x.country||('item '+(i+1)))}
    }
    tabs();view();
    lastItem=it||null;if(it)showItem(it);
    setTimeout(()=>{const t=document.querySelector('#items details[open],#faq-items details[open]')||document.getElementById('view'),h=document.querySelector('#app>header');
      window.scrollTo({top:Math.max(0,t.getBoundingClientRect().top+scrollY-(h?h.getBoundingClientRect().bottom:0)-8),behavior:'smooth'})},60);
    if(typeof toast==='function')toast('Editing: '+label);
  }
  function showItem(it){try{frame&&frame.contentWindow.__khipFocusItem&&frame.contentWindow.__khipFocusItem(it)}catch{}}
  // an item opened in the editor (an article, a question, a country ...): the preview shows that one
  document.addEventListener('toggle',e=>{
    const d=e.target;if(!st.open||!d||!d.open||!d.matches||!d.matches('#items>details,#faq-items>details'))return;
    const b=d.querySelector('summary [data-i]');if(!b)return;const i=+b.dataset.i;let it=null;
    if(d.parentElement.id==='faq-items'){
      const items=((((D.faq||{}).pages||{})[faqPage])||{}).items||[];let n=-1;items.forEach((x,k)=>{if(k<=i&&String(x.q||'').trim()&&String(x.a||'').trim())n++});
      it={faq:faqPage,i:n};
    }else{
      const list=typeof LK==='function'?LK():'',x=(D[list]||[])[i]||{};
      it=list==='news'?{list,id:x.id}:list==='jurisdictions'?{list,name:x.country}:list==='employees'?{list,name:x.name}:list==='services'?{list,name:x.title}:{list,i};
    }
    lastItem=it;showItem(it);
  },true);
  const isOpen=()=>!!st.open;
  return {init,sync,touch,data,loaded,scrolled,layout,pick,open:v=>{if(!el)build();setOpen(v)},isOpen};
})();
window.KPV=KPV;

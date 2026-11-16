/* KHIP look.js: behaviour set in the admin "Look" tabs that needs a script.
   Phase 3: the menu. theme.menu = {mode, side, keepNav, bg, text, overlay, width}
     mode ''        the original: links in the header on large screens, bottom bar everywhere
     mode 'bottom'  bottom bar only (no links in the header)
     mode 'both'    bottom bar plus a "sandwich" button in the header that opens an off-canvas menu
   Phase 6: animation of the logos and the map. theme.motion = {map, logos}; see theme.js.
   Phase 5: animation of cards and text. theme.anim = {all, sec}; see theme.js.
   Loaded at the end of every page, after footer.js. Later phases add image effects and animation here. */
(function(){
  const K=window.KTHEME;if(!K)return;
  const root=document.documentElement;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const L=(k,d)=>{try{const v=window.KLang&&KLang.t(k);return v&&v!==k?v:d}catch{return d}};
  const num=(v,d,lo,hi)=>{const n=parseFloat(v);return isFinite(n)?Math.min(hi,Math.max(lo,n)):d};
  const cur=location.pathname.split('/').pop()||'index.html';
  let T={},oc=null,burger=null,svc=null,lastFocus=null,built=false;

  /* ---------- colours and mode ---------- */
  function menuVars(){
    const M=T.menu||{},pal=K.palette(T),col=r=>r?K.resolve(r,T):null,P=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)).join(' ');
    const bg=col(M.bg)||col((T.bar||{}).bg)||pal.ink,fg=col(M.text)||(K.lum(bg)>=.4?pal.ink:'#ffffff');
    const st=root.style;
    st.setProperty('--oc-bg',bg);st.setProperty('--oc-fg',fg);
    st.setProperty('--oc-hv',K.lum(fg)>.6?pal.sand:pal.accent);
    st.setProperty('--oc-line',`rgb(${P(fg)} / .16)`);
    st.setProperty('--oc-ov',`rgb(${P(pal.ink)} / ${(num(M.overlay,50,0,80)/100).toFixed(2)})`);
    st.setProperty('--oc-w',num(M.width,300,240,480)+'px');
  }
  const modeOf=()=>{const m=(T.menu||{}).mode;return m==='bottom'||m==='both'?m:''};

  /* ---------- the button ---------- */
  function ensureBurger(on){
    if(!on){if(burger){burger.remove();burger=null}return}
    if(burger&&document.contains(burger))return;
    const host=(document.getElementById('lang-switch')||{}).parentElement||document.querySelector('header .wrap');if(!host)return;
    burger=document.createElement('button');burger.type='button';burger.className='khip-burger';
    burger.setAttribute('aria-haspopup','dialog');burger.setAttribute('aria-expanded','false');burger.setAttribute('aria-controls','khip-oc');
    burger.setAttribute('aria-label',L('menu_open','Open menu'));burger.innerHTML='<span></span><span></span><span></span>';
    burger.addEventListener('click',()=>oc&&oc.classList.contains('open')?close():open());
    host.appendChild(burger);
  }

  /* ---------- the off-canvas panel ---------- */
  const homePage=/(^|\/)(index\.html)?$/.test(location.pathname);
  const item=(href,txt,cls='')=>`<a href="${esc(href)}" class="oc-a ${cls}${href===cur?' on':''}" ${href===cur?'aria-current="page"':''}>${esc(txt)}</a>`;
  const sec=k=>`<a href="${homePage?'':'index.html'}#${k}" data-sec-go="${k}" class="oc-a">`;
  function links(){
    const sv=svc?svc:'';
    return item('index.html',L('bar_home','Home'))
      +item('about.html',L('nav_about','About'))
      +`${sec('jurisdictions')}${esc(L('nav_jur','Jurisdictions'))}</a>`
      +`${sec('services')}${esc(L('nav_services','Services'))}</a>${sv}`
      +`${sec('news')}${esc(L('nav_news','News'))}</a>`;
  }
  function paintLinks(){const n=oc&&oc.querySelector('.oc-links');if(n)n.innerHTML=links()}
  function build(){
    if(built&&oc&&document.contains(oc))return;
    oc=document.createElement('div');oc.id='khip-oc';oc.className='khip-oc';
    oc.innerHTML=`<div class="oc-back" data-oc-close></div><aside role="dialog" aria-modal="true" aria-label="${esc(L('menu_title','Menu'))}" tabindex="-1"><div class="oc-head"><span>${esc(L('menu_title','Menu'))}</span><button type="button" class="oc-x" data-oc-close aria-label="${esc(L('menu_close','Close menu'))}"><i class="ph-light ph-x"></i></button></div><nav class="oc-links" aria-label="${esc(L('menu_title','Menu'))}"></nav></aside>`;
    document.body.appendChild(oc);built=true;paintLinks();
    oc.addEventListener('click',e=>{
      if(e.target.closest('[data-oc-close]'))return close();
      const g=e.target.closest('[data-sec-go]');
      if(g){const el=document.getElementById(g.dataset.secGo);if(el&&el.offsetParent!==null){e.preventDefault();close();setTimeout(()=>el.scrollIntoView({behavior:'smooth'}),60)}else close();return}
      if(e.target.closest('a'))close();
    });
    oc.addEventListener('keydown',e=>{
      if(e.key==='Escape'){e.preventDefault();close();return}
      if(e.key!=='Tab')return;
      const f=[...oc.querySelectorAll('a[href],button')].filter(x=>x.offsetParent!==null);if(!f.length)return;
      const a=f[0],z=f[f.length-1];
      if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}
    });
    if(window.KLang&&KLang.data)KLang.data().then(D=>{
      const g=KLang.svcSplit(D.services),link=x=>/^[\w-]+\.html$/.test(x.page||'')?x.page:(homePage?'':'index.html')+'#services';
      let h='';
      if(g.ip.length){h+=`<span class="oc-grp">${esc(L('svc_ip','IP Services'))}</span>`;g.ip.forEach(x=>{h+=item(link(x),x.title,'oc-sub')})}
      g.tr.forEach(x=>{h+=item(link(x),x.title,'oc-sub')});
      svc=h;paintLinks();
    }).catch(()=>{});
  }
  const pageEl=()=>document.getElementById('khip-page');
  function open(){
    build();lastFocus=document.activeElement;
    oc.classList.add('open');if(burger){burger.classList.add('is-open');burger.setAttribute('aria-expanded','true');burger.setAttribute('aria-label',L('menu_close','Close menu'))}
    const p=pageEl();if(p)p.style.overflow='hidden';
    setTimeout(()=>{const x=oc.querySelector('.oc-x');x&&x.focus()},30);
  }
  function close(){
    if(!oc)return;oc.classList.remove('open');
    if(burger){burger.classList.remove('is-open');burger.setAttribute('aria-expanded','false');burger.setAttribute('aria-label',L('menu_open','Open menu'))}
    const p=pageEl();if(p)p.style.overflow='';
    if(lastFocus&&lastFocus.focus)lastFocus.focus();
  }

  /* ---------- apply the settings ---------- */
  function applyMenu(){
    const mode=modeOf(),M=T.menu||{};
    menuVars();
    root.classList.toggle('menu-bottom',mode==='bottom');
    root.classList.toggle('menu-both',mode==='both');
    root.classList.toggle('menu-keepnav',mode==='both'&&M.keepNav===true);
    root.classList.toggle('oc-end',M.side==='end');
    if(mode==='both'){ensureBurger(true);build()}
    else{close();ensureBurger(false)}
  }
  const onTheme=t=>{T=t||{};const go=()=>applyMenu();document.readyState==='loading'?document.addEventListener('DOMContentLoaded',go):go()};
  document.addEventListener('khip-theme',e=>onTheme(e.detail));
  if(K.current)onTheme(K.current);

  /* ---------- Phase 5: animation of cards and text ----------
     theme.anim (see theme.js). A section that has an effect set gets data-ax; its cards and text start hidden and play when they scroll into view.
     Hover movement of cards: data-hv on the section. Visitors who ask their device for less motion see everything at once. */
  const CARD=':is(.card,.faq-item,.tframe,.ct-tile,.tcard,.ncard)';
  const TEXT=':is(h1,h2,h3,h4,p,.rule)';
  let axSig='',axIO=null,axMO=[],axSet=new Set(),axTimer=new Map();
  const reduce=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function axClear(el){
    clearTimeout(axTimer.get(el));axTimer.delete(el);
    el.classList.remove('ax','ax-go');['--ax-x','--ax-y','--ax-s','--ax-rx','--ax-b','--ax-t','--ax-d','--ax-e'].forEach(p=>el.style.removeProperty(p));
  }
  function axReset(){
    if(axIO)axIO.disconnect();axMO.forEach(m=>m.disconnect());axMO=[];
    axSet.forEach(e=>{axClear(e);delete e.__ax});axSet=new Set();
    document.querySelectorAll('[data-ax],[data-hv]').forEach(s=>{s.removeAttribute('data-ax');s.removeAttribute('data-hv')});
  }
  function axPlay(batch){
    // batch = entries that came into view together: delays follow their order on the page
    const by=new Map();
    batch.sort((a,b)=>(a.compareDocumentPosition(b)&4)?-1:1).forEach(el=>{const g=el.__ax.kind+'|'+(el.closest('[data-sec]')||{}).dataset?.sec;const n=by.get(g)||0;by.set(g,n+1);
      const v=el.__ax.v,tot=v.d+n*v.st;
      el.style.setProperty('--ax-d',tot.toFixed(2)+'s');
      requestAnimationFrame(()=>{el.classList.add('ax-go');
        clearTimeout(axTimer.get(el));
        axTimer.set(el,setTimeout(()=>{el.classList.remove('ax','ax-go');['--ax-x','--ax-y','--ax-s','--ax-rx','--ax-b','--ax-t','--ax-d','--ax-e'].forEach(p=>el.style.removeProperty(p));el.__ax.played=true},(v.t+tot)*1000+150))});
    });
  }
  function axPrepare(el,kind,v){
    el.__ax={kind,v,played:false};axSet.add(el);
    const st=el.style;st.setProperty('--ax-x',v.x+'px');st.setProperty('--ax-y',v.y+'px');st.setProperty('--ax-s',v.s);st.setProperty('--ax-rx',v.rx+'deg');st.setProperty('--ax-b',v.b+'px');st.setProperty('--ax-t',v.t+'s');st.setProperty('--ax-e',v.e);
    el.classList.add('ax');axIO.observe(el);
  }
  function axScan(sec,cfg){
    const rtl=root.dir==='rtl'||document.dir==='rtl'||getComputedStyle(root).direction==='rtl';
    [['cards',CARD],['text',TEXT]].forEach(([kind,sel])=>{
      const c=cfg[kind];if(!c.effect||c.effect==='none')return;
      const v=K.axVars(c,rtl,kind==='cards');
      sec.querySelectorAll(sel).forEach(el=>{
        if(el.__ax)return;
        if(el.closest('#modal,header,.khip-oc,#khip-bar,details>summary'))return;
        if(kind==='text'&&el.closest(CARD))return;                               // text inside a card moves with the card
        if(kind==='cards'&&el.parentElement&&el.parentElement.closest(CARD))return;
        axPrepare(el,kind,v);
      });
    });
  }
  function applyAnim(){
    const A=T.anim||{},sig=JSON.stringify(A)+(reduce()?'r':'');
    if(sig===axSig)return;axSig=sig;axReset();
    const secs=[...document.querySelectorAll('[data-sec]')];
    const todo=[];
    secs.forEach(sec=>{
      const key=sec.dataset.sec,cards=K.axCfg(T,key,'cards'),text=K.axCfg(T,key,'text');
      if(cards.hover&&cards.hover!=='')sec.setAttribute('data-hv',cards.hover);
      const on=(cards.effect&&cards.effect!=='')||(text.effect&&text.effect!=='');
      if(!on)return;
      sec.setAttribute('data-ax','1');
      if(reduce())return;
      if(!cards.effect)cards.effect='up';if(!text.effect)text.effect='up';        // the unset side keeps the original fade-up
      todo.push([sec,{cards,text}]);
    });
    if(!todo.length)return;
    axIO=new IntersectionObserver(es=>{
      const go=[];
      es.forEach(x=>{
        const el=x.target,m=el.__ax;if(!m)return;
        if(x.isIntersecting&&x.intersectionRatio>=.05){if(!m.started){m.started=true;go.push(el);if(!m.v.repeat)axIO.unobserve(el)}}
        else if(x.intersectionRatio===0&&m.started&&m.played&&m.v.repeat){m.started=false;m.played=false;el.classList.remove('ax-go');el.classList.add('ax')}   // out of sight: ready to play again
      });
      if(go.length)axPlay(go);
    },{threshold:[0,.05,.15]});
    todo.forEach(([sec,cfg])=>{
      axScan(sec,cfg);
      let q=0;const mo=new MutationObserver(()=>{if(q)return;q=requestAnimationFrame(()=>{q=0;axScan(sec,cfg)})});
      mo.observe(sec,{childList:true,subtree:true});axMO.push(mo);
    });
  }
  const onAnim=()=>{const go=()=>applyAnim();document.readyState==='loading'?document.addEventListener('DOMContentLoaded',go):go()};
  document.addEventListener('khip-theme',onAnim);
  if(K.current)onAnim();

  /* ---------- Phase 6: animation of the logos and the map ---------- */
  const LXV=['--lx-x','--lx-y','--lx-s','--lx-rx','--lx-b','--lx-t','--lx-d','--lx-e','--lx-it'];
  let lxSig='',lxIO=null,lxSet=new Set(),lxTimers=new Map(),mxSig='',mxIO=null,mxTimer=0;
  const isRtl=()=>root.dir==='rtl'||document.dir==='rtl'||getComputedStyle(root).direction==='rtl';
  function lxReset(){
    if(lxIO)lxIO.disconnect();
    lxSet.forEach(im=>{clearTimeout(lxTimers.get(im));im.classList.remove('lx','lx-go','lx-i','lx-h');[...im.classList].filter(c=>/^lx-[ih]-/.test(c)).forEach(c=>im.classList.remove(c));LXV.forEach(p=>im.style.removeProperty(p))});
    lxSet=new Set();lxTimers=new Map();
  }
  function applyLogos(){
    const sig=JSON.stringify(((T.motion||{}).logos)||{})+(reduce()?'r':'');
    if(sig===lxSig)return;lxSig=sig;lxReset();
    const rtl=isRtl();
    lxIO=new IntersectionObserver(es=>es.forEach(x=>{
      const im=x.target,m=im.__lx;if(!m||!x.isIntersecting)return;lxIO.unobserve(im);
      im.style.setProperty('--lx-d',m.v.d+'s');
      requestAnimationFrame(()=>{im.classList.add('lx-go');
        lxTimers.set(im,setTimeout(()=>{im.classList.remove('lx','lx-go');LXV.slice(0,8).forEach(p=>im.style.removeProperty(p));m.idle()},(m.v.t+m.v.d)*1000+150))});
    }),{threshold:.05});
    document.querySelectorAll('img[data-logo]').forEach(im=>{
      const c=K.lgCfg(T,im.dataset.logo);
      if(!c.effect&&!c.idle&&!c.hover)return;
      lxSet.add(im);
      if(c.hover)im.classList.add('lx-h','lx-h-'+c.hover);
      const idle=()=>{if(c.idle&&!reduce()){im.style.setProperty('--lx-it',Math.min(8,Math.max(1.5,parseFloat(c.idleSpeed)||4))+'s');im.classList.add('lx-i','lx-i-'+c.idle)}};
      if(c.effect&&!reduce()){
        const v=K.axVars({effect:c.effect,distance:c.distance,speed:c.speed,delay:c.delay},rtl,false);
        im.__lx={v,idle};const st=im.style;
        st.setProperty('--lx-x',v.x+'px');st.setProperty('--lx-y',v.y+'px');st.setProperty('--lx-s',v.s);st.setProperty('--lx-rx',v.rx+'deg');st.setProperty('--lx-b',v.b+'px');st.setProperty('--lx-t',v.t+'s');st.setProperty('--lx-e',v.e);
        im.classList.add('lx');lxIO.observe(im);
      }else idle();
    });
  }

  function mxReset(svg){
    if(mxIO)mxIO.disconnect();clearTimeout(mxTimer);
    [...svg.classList].filter(c=>/^mx-/.test(c)).forEach(c=>svg.classList.remove(c));
    ['--mx-t','--mx-d','--mx-st','--mx-from','--mx-n','--mx-pt','--mx-ps','--mx-pc'].forEach(p=>svg.style.removeProperty(p));
  }
  function applyMap(){
    const svg=document.getElementById('mena-map');if(!svg)return;
    const m=K.mapCfg(T),sig=JSON.stringify(m)+(reduce()?'r':'');
    if(sig===mxSig)return;mxSig=sig;mxReset(svg);
    const ons=[...svg.querySelectorAll('.c.on')];ons.forEach((p,i)=>p.style.setProperty('--i',i));
    const st=svg.style;
    if(m.hover)svg.classList.add('mx-h-'+m.hover);
    if(m.pulse==='none')svg.classList.add('mx-p-none');
    else if(['slow','fast','big'].includes(m.pulse)){const P={slow:[4.2,2.6],fast:[1.4,3.4],big:[2.4,5.5]}[m.pulse];svg.classList.add('mx-pulse');st.setProperty('--mx-pt',P[0]+'s');st.setProperty('--mx-ps',P[1])}
    if(m.pulseColor){const c=K.resolve(m.pulseColor,T);if(c){svg.classList.add('mx-pc');st.setProperty('--mx-pc',c)}}
    const idle=()=>{if(m.idle&&!reduce())svg.classList.add('mx-i-'+m.idle)};
    if(!m.entrance||reduce()){idle();return}
    const t=Math.min(2.5,Math.max(.2,parseFloat(m.speed)||.8)),d=Math.min(2,Math.max(0,parseFloat(m.delay)||0)),sd=Math.min(.5,Math.max(0,m.stagger===undefined?.12:parseFloat(m.stagger)||0));
    st.setProperty('--mx-t',t+'s');st.setProperty('--mx-d',d+'s');st.setProperty('--mx-st',sd+'s');st.setProperty('--mx-n',ons.length);
    st.setProperty('--mx-from',{fade:'none',pop:'scale(.8)',rise:'translateY(14px)'}[m.entrance]||'none');
    svg.classList.add('mx-pre');if(m.base==='fade')svg.classList.add('mx-base');
    mxIO=new IntersectionObserver(es=>{if(!es.some(x=>x.isIntersecting))return;mxIO.disconnect();
      requestAnimationFrame(()=>{svg.classList.add('mx-go');
        mxTimer=setTimeout(()=>{svg.classList.remove('mx-pre','mx-go','mx-base');idle()},(d+ons.length*sd+t*1.6)*1000+200)});
    },{threshold:.15});
    mxIO.observe(svg);
  }
  const onMotion=()=>{const go=()=>{applyLogos();applyMap()};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',go):go()};
  document.addEventListener('khip-theme',onMotion);
  if(K.current)onMotion();
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&oc&&oc.classList.contains('open'))close()});
  addEventListener('resize',()=>{});
})();

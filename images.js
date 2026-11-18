/* KHIP images.js: picture sections, SVG masks (shapes) and animations for the pictures of the site.
   Loaded at the end of every public page (after video.js) and by admin.html (for its previews: KIMG.style / KIMG.css).

   1. Picture sections: "images" in app-data.json (admin: Sections, "Add a picture"), Arabic alt and caption in app-data.ar.json:
        { id, page: home|about|patents|trademarks|translation, after: <section key>, para: 0 | 1..12,
          image, alt, caption, width: full|wide|medium|small|bleed, ratio: auto|16/9|21/9|3/2|4/3|1/1|3/4, fit: cover|contain,
          pos: center|top|bottom|left|right, opacity: 0..100, hidden, + the shape and motion settings below }
      para 0: its own section right after the section "after" (key "<page>-image-<id>", so it can be moved, hidden, copied
      and styled like any section); para n: inside that section, after its n-th paragraph.
   2. Shape and motion of pictures: theme.imgsvg {all, hero, news, team, blocks, sec: {<section>: {...}}} and on a picture section:
        mask: none|circle|rounded|arch|blob|blob2|hexagon|diamond|wave|slant|leaf   (an SVG shape the picture is cut to)
        maskFit: stretch (the shape follows the picture) | keep (the shape keeps its proportions)
        anim: none|zoom|float|breathe|wipe|iris|focus|ripple|morph|waves
              ripple = SVG water ripple (feTurbulence + feDisplacementMap), morph = the SVG shape slowly changes,
              waves = the SVG edge waves; wipe / iris / focus play once (a reveal); the others loop.
        trigger: always | view (starts when it scrolls into view) | hover (while the pointer is on it)
        speed: seconds (0.5..30), strength: 0..100
      A picture takes, setting by setting: its picture section > its section (sec) > its group (hero, news, team, blocks) > all.
      Visitors who ask their device for less motion see the shapes without the motion. */
(function(){
  'use strict';
  const NS='http://www.w3.org/2000/svg';
  // ---------- SVG shapes (viewBox 0 0 100 100) ----------
  const B=['M50 2C76 2 98 20 98 48C98 76 78 98 50 98C22 98 2 78 2 50C2 22 24 2 50 2Z',
           'M54 4C80 0 100 26 96 52C92 80 70 100 44 96C18 92 0 72 4 46C8 20 28 8 54 4Z',
           'M46 0C74 6 96 18 100 46C104 74 80 96 52 100C24 104 4 80 0 54C-4 28 18 -6 46 0Z'];
  const W=['M0 0H100V86C84 96 68 78 50 88C32 98 16 80 0 90Z','M0 0H100V90C84 80 68 98 50 88C32 78 16 96 0 86Z'];
  const SHAPES={
    circle:['Circle / oval','<ellipse cx="50" cy="50" rx="50" ry="50"/>'],
    rounded:['Rounded corners','<rect width="100" height="100" rx="14" ry="14"/>'],
    arch:['Arch','<path d="M0 100V50A50 50 0 0 1 100 50V100Z"/>'],
    blob:['Soft blob',`<path d="${B[1]}"/>`],
    blob2:['Blob, other side',`<path d="${B[2]}"/>`],
    hexagon:['Hexagon','<polygon points="25,1 75,1 100,50 75,99 25,99 0,50"/>'],
    diamond:['Diamond','<polygon points="50,0 100,50 50,100 0,50"/>'],
    wave:['Wavy bottom edge',`<path d="${W[0]}"/>`],
    slant:['Slanted bottom','<polygon points="0,0 100,0 100,82 0,100"/>'],
    leaf:['Leaf (two round corners)','<path d="M0 100V40A40 40 0 0 1 40 0H100V60A40 40 0 0 1 60 100Z"/>']
  };
  const ANIMS={
    zoom:['Slow zoom (Ken Burns)',12],float:['Float up and down',6],breathe:['Breathe (gentle grow)',5],
    wipe:['Reveal from the side',1.2],iris:['Reveal from a circle',1.2],focus:['Come into focus',1.2],
    ripple:['Water ripple (SVG)',8],morph:['Shape morph (SVG)',9],waves:['Waving edge (SVG)',5]
  };
  const ONCE=['wipe','iris','focus'];
  const svgUrl=inner=>`url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="${NS}" viewBox="0 0 100 100" preserveAspectRatio="none">${inner}</svg>`)}")`;
  const spline=n=>Array.from({length:n},()=>'.45 0 .55 1').join(';');
  // the mask of a picture: a still shape, or an animated one (morph / waves are SVG animations inside the mask)
  function maskOf(mask,anim,t){
    if(anim==='morph'){const v=[B[0],B[1],B[2],B[0]].join(';');return svgUrl(`<path d="${B[1]}"><animate attributeName="d" dur="${t}s" repeatCount="indefinite" values="${v}" keyTimes="0;.33;.66;1" calcMode="spline" keySplines="${spline(3)}"/></path>`)}
    if(anim==='waves'){const v=[W[0],W[1],W[0]].join(';');return svgUrl(`<path d="${W[0]}"><animate attributeName="d" dur="${t}s" repeatCount="indefinite" values="${v}" keyTimes="0;.5;1" calcMode="spline" keySplines="${spline(2)}"/></path>`)}
    return SHAPES[mask]?svgUrl(SHAPES[mask][1]):'';
  }
  // ---------- the styles of the animations (the site and the admin previews) ----------
  const CSS=`
@keyframes ia-zoom{from{transform:scale(1) translate(0,0)}to{transform:scale(var(--ia-z,1.12)) translate(var(--ia-x,-2%),var(--ia-y,-1.5%))}}
@keyframes ia-float{0%,100%{transform:translateY(0)}50%{transform:translateY(calc(var(--ia-d,8px) * -1))}}
@keyframes ia-breathe{0%,100%{transform:scale(1)}50%{transform:scale(var(--ia-z,1.05))}}
@keyframes ia-wipe{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
@keyframes ia-iris{from{clip-path:circle(0% at 50% 50%)}to{clip-path:circle(75% at 50% 50%)}}
@keyframes ia-focus{from{filter:blur(var(--ia-b,10px));opacity:.35}to{filter:blur(0);opacity:1}}
img[data-ianim=zoom]{animation:ia-zoom var(--ia-t,12s) ease-in-out infinite alternate}
img[data-ianim=float]{animation:ia-float var(--ia-t,6s) ease-in-out infinite}
img[data-ianim=breathe]{animation:ia-breathe var(--ia-t,5s) ease-in-out infinite}
img[data-ianim=wipe]{animation:ia-wipe var(--ia-t,1.2s) cubic-bezier(.65,0,.35,1) both}
img[data-ianim=iris]{animation:ia-iris var(--ia-t,1.2s) cubic-bezier(.65,0,.35,1) both}
img[data-ianim=focus]{animation:ia-focus var(--ia-t,1.2s) ease-out both}
img[data-ianim][data-iat=view]:not(.ia-on),img[data-ianim][data-iat=hover]{animation-play-state:paused}
img[data-ianim][data-iat=hover]:hover,:hover>img[data-ianim][data-iat=hover]{animation-play-state:running}
img[data-imask]{-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center}
.imgblk{margin:0 auto;width:100%}
.imgblk-full{max-width:none}.imgblk-wide{max-width:64rem}.imgblk-medium{max-width:44rem}.imgblk-small{max-width:28rem}
.imgblk-box{position:relative;overflow:hidden;border-radius:var(--imgblk-r,1.25rem)}
.imgblk-box>img{display:block;width:100%;height:100%}
.imgblk-box[style*="aspect-ratio"]>img{position:absolute;inset:0}
.imgblk figcaption{margin-top:.75rem;font-size:.9rem;text-align:center;opacity:.8}
[data-imgsec].band{padding-top:2.5rem;padding-bottom:2.5rem}
[data-imgsec][data-bleed]{padding:0}[data-imgsec][data-bleed] .imgblk-box{border-radius:0}
.imgblk-inline{margin:1.5rem 0}
@media(prefers-reduced-motion:reduce){img[data-ianim]{animation:none!important;clip-path:none!important}}`;
  function addCss(doc){
    doc=doc||document;if(doc.getElementById('khip-img-css'))return;
    const s=doc.createElement('style');s.id='khip-img-css';s.textContent=CSS;(doc.head||doc.documentElement).appendChild(s);
  }
  const reduce=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const num=(v,d,lo,hi)=>{const n=parseFloat(v);return isFinite(n)?Math.min(hi,Math.max(lo,n)):d};
  // ---------- SVG filters for the ripple (one per strength and speed) ----------
  function fxDefs(doc){
    doc=doc||document;let svg=doc.getElementById('khip-ia');
    if(!svg){svg=doc.createElementNS(NS,'svg');svg.id='khip-ia';svg.setAttribute('aria-hidden','true');svg.setAttribute('width','0');svg.setAttribute('height','0');
      svg.style.cssText='position:absolute;width:0;height:0;overflow:hidden';svg.appendChild(doc.createElementNS(NS,'defs'));(doc.body||doc.documentElement).appendChild(svg)}
    return svg.firstChild;
  }
  function rippleId(k,t,doc){
    const id=`ia-rip-${Math.round(k)}-${String(t).replace('.','_')}`,defs=fxDefs(doc);
    if(!(doc||document).getElementById(id)){
      const sc=(2+k*.3).toFixed(1);
      defs.insertAdjacentHTML('beforeend',`<filter id="${id}" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.010 0.018" numOctaves="2" seed="4" result="n"><animate attributeName="baseFrequency" dur="${t}s" repeatCount="indefinite" values="0.010 0.018;0.018 0.028;0.010 0.018"/></feTurbulence><feDisplacementMap in="SourceGraphic" in2="n" scale="${sc}" xChannelSelector="R" yChannelSelector="G"/></filter>`);
    }
    return id;
  }
  // ---------- one picture: its inline style and attributes from the settings ----------
  // s = {mask, maskFit, anim, trigger, speed, strength}; returns what to put on the <img>
  function style(s){
    s=s||{};
    const anim=ANIMS[s.anim]&&!reduce()?s.anim:'',t=num(s.speed,anim?ANIMS[anim][1]:1,.5,30),k=num(s.strength,50,0,100);
    const m=maskOf(s.mask,anim,t),out={attrs:{},css:{}};
    if(m){out.attrs['data-imask']=anim==='morph'||anim==='waves'?anim:s.mask;out.css['-webkit-mask-image']=m;out.css['mask-image']=m;
      const sz=s.maskFit==='keep'?'contain':'100% 100%';out.css['-webkit-mask-size']=sz;out.css['mask-size']=sz}
    if(anim&&anim!=='morph'&&anim!=='waves'&&anim!=='ripple'){
      out.attrs['data-ianim']=anim;out.attrs['data-iat']=ONCE.includes(anim)&&s.trigger!=='hover'?(s.trigger==='always'?'always':'view'):(['view','hover'].includes(s.trigger)?s.trigger:'always');
      out.css['--ia-t']=t+'s';
      if(anim==='zoom'){out.css['--ia-z']=(1+.02+k*.0026).toFixed(3)}
      if(anim==='breathe'){out.css['--ia-z']=(1+.01+k*.0008).toFixed(3)}
      if(anim==='float'){out.css['--ia-d']=Math.round(2+k*.16)+'px'}
      if(anim==='focus'){out.css['--ia-b']=Math.round(3+k*.17)+'px'}
    }
    if(anim==='ripple')out.ripple={k,t};
    return out;
  }
  const KEYS=['-webkit-mask-image','mask-image','-webkit-mask-size','mask-size','--ia-t','--ia-z','--ia-d','--ia-b'];
  function put(img,s,doc){
    const o=style(s),sig=JSON.stringify(o);
    if(img.__iasig===sig)return;img.__iasig=sig;
    ['data-imask','data-ianim','data-iat'].forEach(a=>{if(o.attrs[a])img.setAttribute(a,o.attrs[a]);else img.removeAttribute(a)});
    KEYS.forEach(k=>{if(o.css[k])img.style.setProperty(k,o.css[k]);else img.style.removeProperty(k)});
    if(img.__iafilter){img.style.removeProperty('filter');img.__iafilter=0}
    if(o.ripple){                                             // keep a colour filter set in Picture effects, and add the ripple after it
      const cs=getComputedStyle(img).filter,id=rippleId(o.ripple.k,o.ripple.t,doc);
      img.style.setProperty('filter',(cs&&cs!=='none'?cs+' ':'')+`url(#${id})`);img.__iafilter=1;
    }
    if(o.attrs['data-iat']==='view')watch(img);else img.classList.remove('ia-on');
  }
  let io=null;
  function watch(img){
    if(!('IntersectionObserver' in window)){img.classList.add('ia-on');return}
    io=io||new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('ia-on');io.unobserve(e.target)}}),{threshold:.2});
    img.classList.remove('ia-on');io.observe(img);
  }
  window.KIMG={SHAPES,ANIMS,ONCE,style,put,maskOf,addCss,CSS};
  if(/admin\.html$/.test(location.pathname))return;          // the admin only uses the definitions and style()

  // ---------- which settings a picture of the page takes ----------
  const GROUPS=[['hero','#carousel .slide img'],['news','.ncard img,#rel-track img'],['team','.tm-item img'],['blocks','[data-imgblk] img']];
  const FIELDS=['mask','maskFit','anim','trigger','speed','strength'];
  const ALL='main img,#carousel img';
  let T={},BLK={};
  function settingsFor(img){
    const S=T.imgsvg||{},out={},layer=o=>{if(o)FIELDS.forEach(f=>{if(o[f]!==undefined&&o[f]!==''&&o[f]!==null)out[f]=o[f]})};
    layer(S.all);
    const g=GROUPS.find(([,sel])=>img.matches(sel));if(g)layer(S[g[0]]);
    const sec=img.closest('[data-sec]');if(sec)layer((S.sec||{})[sec.dataset.sec]);
    const b=img.closest('[data-imgblk]');if(b&&BLK[b.dataset.imgid])layer(BLK[b.dataset.imgid]);
    if(out.mask==='none')delete out.mask;if(out.anim==='none')delete out.anim;
    return out;
  }
  function scan(){
    q=0;
    document.querySelectorAll(ALL).forEach(img=>{
      if(img.hasAttribute('data-logo')||img.closest('header,#modal,#khip-bar,.khip-oc'))return;
      put(img,settingsFor(img));
    });
  }
  let q=0;const soon=()=>{if(!q)q=requestAnimationFrame(scan)};

  // ---------- picture sections ----------
  const PG={'index.html':'home','about.html':'about','patents.html':'patents','trademarks.html':'trademarks','translation.html':'translation'};
  const page=()=>PG[window.KLang&&KLang.page?KLang.page():(location.pathname.split('/').pop()||'index.html')]||'';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const src=u=>{u=String(u||'').trim();const full=/^(https?:\/\/|\.\/|\/|data:image)/.test(u)?u:'./assets/'+u;return window.KVER&&KVER.img?KVER.img(full):full};
  const RATIO={'16/9':'16 / 9','21/9':'21 / 9','3/2':'3 / 2','4/3':'4 / 3','1/1':'1 / 1','3/4':'3 / 4'};
  const POS={top:'center top',bottom:'center bottom',left:'left center',right:'right center'};
  function figure(x,inline){
    const w=['full','wide','medium','small','bleed'].includes(x.width)?x.width:'wide',r=RATIO[x.ratio]||'',fit=x.fit==='contain'?'contain':'cover',op=num(x.opacity,100,0,100)/100;
    return `<figure class="imgblk imgblk-${w==='bleed'?'full':w}${inline?' imgblk-inline':''}" data-imgblk data-imgid="${esc(x.id)}"><div class="imgblk-box"${r?` style="aspect-ratio:${r}"`:''}><img src="${esc(src(x.image))}" alt="${esc(x.alt||'')}" loading="lazy" decoding="async" style="object-fit:${fit};object-position:${POS[x.pos]||'center'};${r?'':'height:auto;'}${op<1?`opacity:${op};`:''}"></div>${x.caption?`<figcaption>${esc(x.caption)}</figcaption>`:''}</figure>`;
  }
  function place(D){
    const pg=page(),list=(Array.isArray(D.images)?D.images:[]).filter(x=>x&&x.id&&x.page===pg&&!x.hidden&&String(x.image||'').trim()&&/^[a-z]{2,12}$/.test(x.id));
    BLK={};list.forEach(x=>{BLK[x.id]=x});
    // remove the ones no longer wanted, then (re)build each one
    const inl=x=>Math.round(num(x.para,0,0,12))>0;
    document.querySelectorAll('[data-imgsec]:not([data-copy-of])').forEach(el=>{const x=BLK[el.getAttribute('data-imgsec')];if(!x||inl(x))el.remove()});   // picture sections
    document.querySelectorAll('figure.imgblk-inline').forEach(el=>{if(el.closest('[data-copy-of]'))return;const x=BLK[el.getAttribute('data-imgid')];if(!x||!inl(x))el.remove()});   // pictures inside a text
    const main=document.querySelector('main');if(!main)return;
    list.forEach(x=>{
      const p=Math.round(num(x.para,0,0,12)),host=document.querySelector(`[data-sec="${x.after}"]:not([data-copy-of])`);
      if(p>0){
        if(!host)return;
        const paras=[...host.querySelectorAll('p')].filter(e=>!e.closest('figure[data-imgblk],.card,.faq-item,header')),at=paras[Math.min(p,paras.length)-1];
        let f=[...document.querySelectorAll(`figure.imgblk-inline[data-imgid="${x.id}"]`)].find(e=>!e.closest('[data-copy-of]'));
        const html=figure(x,true);
        if(!at){if(f)f.remove();return}
        if(f&&f.__html===html&&f.previousElementSibling===at)return;
        if(f)f.remove();
        at.insertAdjacentHTML('afterend',html);f=at.nextElementSibling;f.__html=html;
        return;
      }
      const key=`${pg}-image-${x.id}`,html=figure(x,false);
      let sec=main.querySelector(`[data-imgsec="${x.id}"]`);
      if(!sec){
        sec=document.createElement('section');sec.className='band';sec.setAttribute('data-sec',key);sec.setAttribute('data-imgsec',x.id);
        let last=host&&host.parentElement===main?host:null;
        if(last){while(last.nextElementSibling&&!last.nextElementSibling.matches('[data-sec],[data-lay]'))last=last.nextElementSibling;last.after(sec)}
        else main.appendChild(sec);
      }
      sec.toggleAttribute('data-bleed',x.width==='bleed');
      if(sec.__html!==html){sec.innerHTML=x.width==='bleed'?html:`<div class="wrap">${html}</div>`;sec.__html=html}
      if(window.KTHEME&&KTHEME.paintSec)KTHEME.paintSec([sec],KTHEME.current);
    });
    soon();
  }

  addCss();
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn();
  document.addEventListener('khip-theme',e=>{T=e.detail||{};ready(soon)});
  if(window.KTHEME&&KTHEME.current)T=KTHEME.current;
  ready(()=>{
    soon();
    if(window.MutationObserver)new MutationObserver(rs=>{if(rs.some(r=>r.type==='childList'))soon()}).observe(document.body,{childList:true,subtree:true});
  });
  let lastD=null;
  if(window.KLang&&KLang.load)KLang.load(D=>{lastD=D;ready(()=>place(D))});
  // paragraphs written later (service pages, About text) get their pictures too
  let pq=0;ready(()=>{const m=document.querySelector('main');if(m&&window.MutationObserver)new MutationObserver(rs=>{if(!lastD||pq)return;if(rs.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&!n.matches('[data-imgsec],figure[data-imgblk]')&&n.tagName!=='IMG')))pq=requestAnimationFrame(()=>{pq=0;place(lastD)})}).observe(m,{childList:true,subtree:true})});
})();

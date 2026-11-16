/* KHIP theme: site colours, section backgrounds and section width.
   Loaded in <head> on every public page. The values come from "theme" in app-data.json
   (edit them in admin.html, tabs Colors and Backgrounds). With no "theme" block the defaults
   below apply, and they are the colours the site always used. */
(function(){
  const CACHE='khip-data-v3';
  // Default palette = the colours the site used before the palette existed.
  const DEFAULTS={title:'#173a7a',ink:'#1b2433',gold:'#a8844f',accent:'#1d4ed8',accentDark:'#1e40af',accentSoft:'#eff6ff',sand:'#d9c8a4',page:'#f7f6f3',surface:'#ffffff',text:'#3a4051'};
  // [key, name, where it is used]
  const ROLES=[
    ['title','Titles','All headings, subtitles and card titles'],
    ['ink','Dark','Buttons, the bottom bar and dark panels'],
    ['gold','Gold','Thin lines and quote marks'],
    ['accent','Accent blue','Icons, links, hover colour and the map'],
    ['accentDark','Accent blue, dark','Map hover and active links'],
    ['accentSoft','Accent blue, soft','Round icon backgrounds'],
    ['sand','Sand','WhatsApp and inquiry buttons'],
    ['page','Page background','Main page colour'],
    ['surface','Section background','Alternating white sections'],
    ['text','Body text','Paragraph text']
  ];
  // Sections that can get their own background. [key, label]
  const SECTIONS=[
    ['home-about','Home page: logo and About text'],
    ['home-jurisdictions','Home page: Regional coverage map'],
    ['home-services','Home page: IP Services'],
    ['home-news','Home page: Latest news'],
    ['home-testimonials','Home page: Client endorsements'],
    ['home-faq','Home page: FAQ'],
    ['about-intro','About page: About KHIP'],
    ['about-map','About page: Jurisdictions'],
    ['about-value','About page: KHIP Value'],
    ['about-quote','About page: Quote'],
    ['about-advantages','About page: KHIP advantages'],
    ['about-team','About page: Our team'],
    ['about-faq','About page: FAQ'],
    ['about-contact','About page: Contact'],
    ['patents-intro','Patents page: Introduction'],
    ['patents-details','Patents page: Details'],
    ['patents-faq','Patents page: FAQ'],
    ['patents-contact','Patents page: Contact'],
    ['trademarks-intro','Trademarks page: Introduction'],
    ['trademarks-details','Trademarks page: Details'],
    ['trademarks-faq','Trademarks page: FAQ'],
    ['trademarks-contact','Trademarks page: Contact'],
    ['translation-intro','Translation page: Introduction'],
    ['translation-details','Translation page: Details'],
    ['translation-faq','Translation page: FAQ'],
    ['translation-contact','Translation page: Contact']
  ];
  const HEX=/^#[0-9a-f]{6}$/i;
  const VAR={title:'title0',accentDark:'accent-dark',accentSoft:'accent-soft'};
  const vname=k=>'--c-'+(VAR[k]||k)+'-rgb';
  const parts=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
  const lum=h=>{const [r,g,b]=parts(h).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*r+.7152*g+.0722*b};
  const palette=T=>{const o={};for(const [k] of ROLES)o[k]=HEX.test(((T||{}).colors||{})[k]||'')?T.colors[k]:DEFAULTS[k];return o};
  // A colour reference is "role:ink", "custom:<id>" or a plain #rrggbb value
  function resolve(ref,T){
    ref=String(ref||'');
    if(HEX.test(ref))return ref;
    const c=palette(T);
    if(ref.indexOf('role:')===0)return c[ref.slice(5)]||null;
    if(ref.indexOf('custom:')===0){const x=((T||{}).custom||[]).find(y=>String(y.id)===ref.slice(7));return x&&HEX.test(x.hex||'')?x.hex:null}
    return null;
  }
  const imgUrl=u=>KVER.img(/^(https?:\/\/|\.\/|\/|data:image)/.test(u)?u:'./assets/'+u);
  function vars(T){
    const c=palette(T),r=document.documentElement.style;
    for(const k in c)r.setProperty(vname(k),parts(c[k]).join(' '));
    const w=Math.min(100,Math.max(40,parseFloat((T||{}).sectionWidth)||66.667));
    r.setProperty('--sec-wn',(w/100).toFixed(4));
    hero((T||{}).hero);
    look(T||{});
    fontsRoot(T||{});
  }
  // Hero slider height: {unit:'px'|'vh', mobile, tablet, desktop}. Missing or invalid = the built-in heights.
  const HERO={px:[100,900],vh:[15,100]};
  function hero(H){
    const r=document.documentElement,u=H&&H.unit==='vh'?'vh':'px',lim=HERO[u];
    const val=k=>{const n=parseFloat(H&&H[k]);return isFinite(n)?Math.min(lim[1],Math.max(lim[0],n))+u:''};
    const m=val('mobile'),t=val('tablet'),d=val('desktop');
    if(H&&m&&t&&d){r.style.setProperty('--hero-h-m',m);r.style.setProperty('--hero-h-t',t);r.style.setProperty('--hero-h-d',d);r.classList.add('hero-custom')}
    else{['--hero-h-m','--hero-h-t','--hero-h-d'].forEach(k=>r.style.removeProperty(k));r.classList.remove('hero-custom')}
  }
  function paint(T){
    const S=(T||{}).sections||{},ink=palette(T).ink;
    document.querySelectorAll('[data-sec]').forEach(el=>{
      ['background-color','background-image','background-size','background-position','background-repeat'].forEach(p=>el.style.removeProperty(p));
      el.classList.remove('sec-light');
      const s=S[el.dataset.sec];
      if(!s||(s.mode!=='color'&&s.mode!=='image'))return;
      const tone=s.tone||'auto';let light=false;
      if(s.mode==='color'){
        const c=resolve(s.color,T);if(!c)return;
        el.style.backgroundColor=c;light=tone==='light'||(tone==='auto'&&lum(c)<.4);
      }else{
        if(!s.image)return;
        const ov=Math.min(85,Math.max(0,parseFloat(s.overlay)||0))/100,layers=[],fx=fxVals(T,'sections',el.dataset.sec);
        const flat=(c,a)=>{const [r,g,b]=Array.isArray(c)?c:parts(c);return `linear-gradient(rgba(${r},${g},${b},${a}),rgba(${r},${g},${b},${a}))`};
        if(fx.tint)layers.push(flat(fx.color,fx.k));                       // colour filter on top of the photo
        if(ov>0)layers.push(flat(ink,ov));
        if(fx.op!==null&&fx.op<1){                                           // photo opacity: the photo fades into what is behind it
          const bc=(getComputedStyle(el).backgroundColor.match(/[\d.]+/g)||[]).map(Number),solid=bc.length>=3&&(bc.length<4||bc[3]>0);
          layers.push(flat(tone==='light'||(tone==='auto'&&ov>=.4)?ink:(solid?bc.slice(0,3):palette(T).page),(1-fx.op).toFixed(2)));
        }
        layers.push(`url("${imgUrl(String(s.image)).replace(/"/g,'%22')}")`);
        el.style.backgroundImage=layers.join(',');el.style.backgroundSize='cover';el.style.backgroundPosition='center';el.style.backgroundRepeat='no-repeat';
        light=tone==='light'||(tone==='auto'&&ov>=.4);
        if(light)el.style.backgroundColor=ink;
      }
      el.classList.toggle('sec-light',light);
    });
  }

  /* ---------- Look settings, phase 1 (admin tabs "Header & bar" and "Cards") ----------
     theme.header  {bg, opacity, text, border}           header colours (refs: "role:ink", "custom:<id>" or #rrggbb; empty = default)
     theme.bar     {bg, text}                            bottom bar colours
     theme.wa      {bg, opacity, text, border, btn, btnText}   WhatsApp text box
     theme.cards   {bg, opacity, text, title, border}    all cards
     theme.secCards{<section>: {bg, text, title, border}}  one section's cards, on top of theme.cards
     Everything is optional: with nothing set the CSS fallbacks in styles.css give the original look. */
  const root=document.documentElement;
  const rgb=h=>parts(h).join(' ');
  const num=(v,d,lo,hi)=>{const n=parseFloat(v);return isFinite(n)?Math.min(hi,Math.max(lo,n)):d};
  const put=(st,k,v)=>{if(v===null||v===undefined||v==='')st.removeProperty(k);else st.setProperty(k,v)};
  const col=(ref,T)=>ref?resolve(ref,T):null;
  // The CSS custom properties for header, bottom bar and WhatsApp box: {name: value, '' = not set}.
  // The admin previews use the same map, so what you see there is what the site does.
  function lookMap(T){
    const m={},pal=palette(T),H=T.header||{},hb=col(H.bg,T),hbd=col(H.border,T);
    m['--hdr-bg-rgb']=hb?rgb(hb):'';m['--hdr-bg-a']=hb?(num(H.opacity,90,0,100)/100).toFixed(2):'';
    const hfg=col(H.text,T)||(hb&&lum(hb)<.4?'#ffffff':null);
    m['--hdr-fg-rgb']=hfg?rgb(hfg):'';m['--hdr-hv-rgb']=hfg?rgb(lum(hfg)>.6?pal.sand:pal.accent):'';m['--hdr-bd']=hbd||'';
    const B=T.bar||{},W=T.wa||{},bb=col(B.bg,T),bfg=col(B.text,T)||(bb&&lum(bb)>=.4?pal.ink:null);
    m['--bar-bg']=bb||'';m['--bar-fg']=bfg||'';m['--bar-hv']=bfg?(lum(bfg)>.6?pal.sand:pal.accent):'';
    const wbg=col(W.bg,T),wop=num(W.opacity,100,0,100)/100,wbd=col(W.border,T);
    const mix=(a,b,k)=>{const x=parts(a),y=parts(b);return '#'+x.map((v,i)=>Math.round(v*k+y[i]*(1-k)).toString(16).padStart(2,'0')).join('')};
    const weff=wbg?mix(wbg,bb||pal.ink,wop):null;                 // what the box really looks like on the bar
    const wfg=col(W.text,T)||(weff?(lum(weff)>=.4?pal.ink:'#ffffff'):(bfg||null));
    m['--wa-bg']=wbg?`rgb(${rgb(wbg)} / ${wop})`:(bfg?`rgb(${rgb(bfg)} / .08)`:'');
    m['--wa-bg-f']=wbg?`rgb(${rgb(wbg)} / ${Math.min(1,wop+.08).toFixed(2)})`:(bfg?`rgb(${rgb(bfg)} / .14)`:'');
    m['--wa-fg']=wfg||'';m['--wa-ph']=wfg?`rgb(${rgb(wfg)} / .72)`:'';
    m['--wa-bd']=wbd||(bfg?`rgb(${rgb(bfg)} / .28)`:'');
    m['--wa-btn']=col(W.btn,T)||'';m['--wa-btn-fg']=col(W.btnText,T)||'';
    return m;
  }
  // Card custom properties for the page, or for one section: C = {bg, opacity, text, title, border}
  function cardMap(C,T){
    const bg=col(C.bg,T),fg=col(C.text,T),ti=col(C.title,T),bd=col(C.border,T),op=num(C.opacity,100,0,100)/100;
    return {'--card-bg':bg?`rgb(${rgb(bg)} / ${op})`:'','--card-fg':fg||'','--card-fg-rgb':fg?rgb(fg):'','--card-title-rgb':ti?rgb(ti):'','--card-bd':bd||''};
  }
  const cardsOf=(T,key)=>{                     // the page-wide card settings with one section's own settings on top
    const g=T.cards||{},s=((T.secCards||{})[key])||{};
    if(!key||!Object.keys(s).some(k=>s[k]))return g;
    return {bg:s.bg||g.bg,opacity:s.bg?(s.opacity!=null?s.opacity:100):g.opacity,text:s.text||g.text,title:s.title||g.title,border:s.border||g.border};
  };
  function look(T){
    const m=lookMap(T),st=root.style;
    for(const k in m)put(st,k,m[k]);
    root.classList.toggle('hdr-bg',!!m['--hdr-bg-rgb']);root.classList.toggle('hdr-fg',!!m['--hdr-fg-rgb']);root.classList.toggle('hdr-bd',!!m['--hdr-bd']);
    cardVars(root,cardsOf(T,''),T);
  }
  function cardVars(el,C,T){
    const m=cardMap(C,T);for(const k in m)put(el.style,k,m[k]);
    if(m['--card-fg'])el.setAttribute('data-cfg','1');else el.removeAttribute('data-cfg');
  }
  function paintLook(T){
    document.querySelectorAll('[data-sec]').forEach(el=>{
      const s=(T.secCards||{})[el.dataset.sec];
      cardVars(el,s&&Object.keys(s).some(k=>s[k])?cardsOf(T,el.dataset.sec):{},T);   // nothing special: the page-wide values apply
    });
  }
  /* ---------- Look settings, phase 2: text alignment and logos ----------
     theme.align  {all:{m,t,d}, sec:{<section>:{m,t,d}}}   m = phone, t = tablet, d = desktop; start | center | end | justify
     theme.logos  {header|home|about: {image, m, t, d}}      image = file in assets/ (or a web address); m/t/d = width in px per screen */
  const ALIGN=['start','center','end','justify'];
  const LOGOS=[['header','Header logo','khaled-hamada-ip-logo.png',[60,500]],['home','Home page logo','khip-logo.jpg',[40,600]],['about','About page logo','khip-logo.jpg',[40,600]]];
  const DEV=['m','t','d'];
  function align(T){
    const A=T.align||{},g=A.all||{},S=A.sec||{};
    document.querySelectorAll('[data-sec]').forEach(el=>{
      const s=S[el.dataset.sec]||{};
      DEV.forEach(k=>{const v=ALIGN.includes(s[k])?s[k]:(ALIGN.includes(g[k])?g[k]:'');if(v)el.setAttribute('data-ta-'+k,v);else el.removeAttribute('data-ta-'+k)});
    });
  }
  // The size classes and variables go on <html> early (before the page paints); the pictures are swapped once they exist
  function logoVars(T){
    const L=T.logos||{};
    LOGOS.forEach(([k,,,lim])=>DEV.forEach(d=>{
      const n=parseFloat((L[k]||{})[d]),ok=isFinite(n),v=ok?Math.round(Math.min(lim[1],Math.max(lim[0],n))):0;
      if(ok)root.style.setProperty(`--lg-${k}-${d}`,v+'px');else root.style.removeProperty(`--lg-${k}-${d}`);
      root.classList.toggle(`lg-${k}-${d}`,ok);
    }));
  }
  function logoImgs(T){
    const L=T.logos||{};
    document.querySelectorAll('img[data-logo]').forEach(im=>{
      const k=im.dataset.logo,img=String((L[k]||{}).image||'').trim();
      if(!im.dataset.src0)im.dataset.src0=im.getAttribute('src');
      const want=img?imgUrl(img):im.dataset.src0;
      if(im.getAttribute('src')!==want){im.setAttribute('src',want);if(img){im.removeAttribute('width');im.removeAttribute('height')}}
    });
  }
  const logos=T=>{logoVars(T);logoImgs(T)};
  /* ---------- Look settings, phase 4: image effects ----------
     theme.imgfx {all, hero, news, team, sections, sec:{<section>}}   each {opacity 0-100, color (ref or #rrggbb), intensity 0-100}
     opacity = how solid the picture is; color + intensity = a colour filter over the picture. Groups fall back to "all"; one section's photo
     falls back to "sections", then "all". Pictures keep their own look until something is set. */
  const FXG=[['hero','Home page slider',80],['news','News pictures',100],['team','Team photos',100],['sections','Section background photos',100]];
  // The effective settings: {op: 0..1 or null, color: '#rrggbb' or null, k: 0..1, tint: bool}
  function fxVals(T,g,key){
    const X=T.imgfx||{},chain=[X.all||{},g==='sections'?(X.sections||{}):(X[g]||{})];
    if(key)chain.push((X.sec||{})[key]||{});
    let op=null,ref='',k=null;
    chain.forEach(o=>{
      if(o.opacity!==undefined&&o.opacity!==''&&isFinite(parseFloat(o.opacity)))op=num(o.opacity,100,0,100)/100;
      if(o.color)ref=o.color;
      if(o.intensity!==undefined&&o.intensity!==''&&isFinite(parseFloat(o.intensity)))k=num(o.intensity,35,0,100)/100;
    });
    const color=ref?resolve(ref,T):null,kk=color?(k===null?.35:k):0;
    return {op,color,k:kk,tint:!!color&&kk>0};
  }
  // Pictures in the page get an SVG colour filter (one per group); section photos are backgrounds and are handled in paint()
  function images(T){
    let svg=document.getElementById('khip-fx');
    if(!svg){
      svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.id='khip-fx';svg.setAttribute('width','0');svg.setAttribute('height','0');svg.setAttribute('aria-hidden','true');
      svg.style.cssText='position:absolute;width:0;height:0;overflow:hidden';svg.appendChild(document.createElementNS('http://www.w3.org/2000/svg','defs'));
      (document.body||document.documentElement).appendChild(svg);
    }
    let defs='';
    FXG.forEach(([g])=>{
      if(g==='sections')return;
      const f=fxVals(T,g);
      root.classList.toggle('fxo-'+g,f.op!==null);root.classList.toggle('fxf-'+g,f.tint);
      if(f.op!==null)root.style.setProperty('--fx-'+g+'-o',f.op.toFixed(2));else root.style.removeProperty('--fx-'+g+'-o');
      if(f.tint)defs+=`<filter id="fx-${g}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feFlood flood-color="${f.color}" flood-opacity="${f.k.toFixed(2)}" result="f"/><feComposite in="f" in2="SourceGraphic" operator="atop"/></filter>`;
    });
    svg.firstChild.innerHTML=defs;
  }
  /* ---------- Look settings, phase 5: animation of cards and text ----------
     theme.anim {all:{cards:{...}, text:{...}}, sec:{<section>:{cards:{...}, text:{...}}}}
     each {effect, distance, speed, delay, stagger, easing, repeat}  (cards also: hover)
     A section is animated by look.js as soon as it has any effect set (here or in "all"); otherwise the original fade-up stays. */
  const AXE=[['','As designed (fade up)'],['none','No animation'],['fade','Fade'],['up','Rise'],['down','Drop'],['start','Slide in from the start'],['end','Slide in from the end'],['zoom','Zoom in'],['zoomout','Zoom out'],['flip','Flip up'],['blur','Come into focus']];
  const AXDIST=[['small','Small',14],['medium','Medium',28],['large','Large',60]];
  const AXEASE=[['smooth','Smooth (default)','cubic-bezier(.16,1,.3,1)'],['soft','Soft','ease'],['snappy','Snappy','cubic-bezier(.4,0,.2,1)'],['bounce','Bounce','cubic-bezier(.34,1.56,.64,1)'],['linear','Even','linear']];
  const AXHOVER=[['','As designed (lift)'],['none','No movement'],['lift','Lift'],['zoom','Grow'],['glow','Glow']];
  const AXKEYS=['effect','distance','speed','delay','stagger','easing','repeat','hover'];
  // The effective settings of one target ('cards' or 'text') in one section: the page-wide values with the section's own on top
  function axCfg(T,key,target){
    const A=T.anim||{},out={},parts_=[((A.all||{})[target])||{},((((A.sec||{})[key])||{})[target])||{}];
    parts_.forEach(o=>AXKEYS.forEach(k=>{if(o[k]!==undefined&&o[k]!==null&&o[k]!=='')out[k]=o[k]}));
    return out;
  }
  // From a setting to what the browser needs: start offsets (x, y in px, scale, rotateX deg, blur px), seconds and easing
  function axVars(c,rtl,isCards){
    const e=c.effect&&c.effect!=='none'?c.effect:'up',d=(AXDIST.find(x=>x[0]===c.distance)||AXDIST[1])[2],k=d/28,dir=rtl?-1:1,v={x:0,y:0,s:1,rx:0,b:0};
    if(e==='up')v.y=d;else if(e==='down')v.y=-d;else if(e==='start')v.x=-d*dir;else if(e==='end')v.x=d*dir;
    else if(e==='zoom')v.s=Math.max(.5,1-.15*k);else if(e==='zoomout')v.s=1+.15*k;else if(e==='flip')v.rx=Math.min(80,Math.max(25,55*k));else if(e==='blur')v.b=Math.round(6*k);
    v.t=num(c.speed,.9,.2,2.5);v.d=num(c.delay,0,0,2);v.st=num(c.stagger,isCards?.08:0,0,.5);
    v.e=(AXEASE.find(x=>x[0]===c.easing)||AXEASE[0])[2];v.repeat=c.repeat==='always';
    return v;
  }
  /* ---------- Look settings, phase 6: animation of the map and the logos ----------
     theme.motion.map   {entrance, speed, delay, stagger, base, idle, hover, pulse, pulseColor}
     theme.motion.logos {all, header, home, about}  each {effect, distance, speed, delay, idle, idleSpeed, hover}
     Nothing is animated until something is set. Played by look.js. */
  const LGE=AXE.filter(x=>x[0]!=='none').map(x=>x[0]===''?['','None (as designed)']:x);
  const LGIDLE=[['','None'],['float','Float'],['breathe','Breathe'],['sway','Sway'],['glow','Glow']];
  const LGHOVER=[['','None (as designed)'],['grow','Grow'],['tilt','Tilt'],['lift','Lift'],['glow','Glow']];
  const MAPE=[['','None (as designed)'],['fade','Countries fade in'],['pop','Countries pop in'],['rise','Countries rise in']];
  const MAPIDLE=[['','None'],['breathe','Highlighted countries breathe'],['wave','A wave of light runs across them']];
  const MAPHOVER=[['','As designed (darker fill)'],['glow','Glow'],['pop','Grow'],['raise','Raise']];
  const MAPPULSE=[['','As designed'],['none','No pulse'],['slow','Slow and soft'],['fast','Fast'],['big','Wide']];
  const LGKEYS=['effect','distance','speed','delay','idle','idleSpeed','hover'];
  function lgCfg(T,k){
    const L=((T.motion||{}).logos)||{},out={};
    [L.all||{},L[k]||{}].forEach(o=>LGKEYS.forEach(x=>{if(o[x]!==undefined&&o[x]!==null&&o[x]!=='')out[x]=o[x]}));
    return out;
  }
  const mapCfg=T=>{const o=((T.motion||{}).map)||{},out={};Object.keys(o).forEach(k=>{if(o[k]!==undefined&&o[k]!==null&&o[k]!=='')out[k]=o[k]});return out};

  /* ---------- Fonts (admin restructure, phase 4) ----------
     theme.fonts {all:{head:{en,ar}, body:{en,ar}}, sec:{<section>:{head:{en,ar}, body:{en,ar}}}}
     head = headings, body = all other text. A value is a name from the lists below, "system" (the visitor's own font) or the name of any
     Google Font (letters, digits and spaces). Empty = the font the site always used. A section's own font replaces the site-wide one there.
     The pages read the fonts through four CSS variables (--fh-en, --fh-ar, --fb-en, --fb-ar); styles.css chooses by page direction. */
  // [name, generic family, weights Google Fonts offers]
  const FONTS={
    en:[['Cormorant Garamond','serif',[500,600]],['Playfair Display','serif',[400,500,600]],['Lora','serif',[400,500,600]],['EB Garamond','serif',[400,500,600]],['Merriweather','serif',[300,400,700]],['Libre Baskerville','serif',[400,700]],
        ['Jost','sans-serif',[300,400,500]],['Inter','sans-serif',[300,400,500,600]],['Montserrat','sans-serif',[300,400,500,600]],['Poppins','sans-serif',[300,400,500,600]],['Open Sans','sans-serif',[300,400,500,600]],['Lato','sans-serif',[300,400,700]],['Raleway','sans-serif',[300,400,500,600]],['Source Sans 3','sans-serif',[300,400,500,600]],['DM Sans','sans-serif',[300,400,500]],['Nunito Sans','sans-serif',[300,400,600]]],
    ar:[['Cairo','sans-serif',[300,400,500,600]],['Tajawal','sans-serif',[300,400,500]],['Almarai','sans-serif',[300,400,700]],['IBM Plex Sans Arabic','sans-serif',[300,400,500,600]],['Noto Kufi Arabic','sans-serif',[300,400,500,600]],
        ['Noto Naskh Arabic','serif',[400,500,600]],['Amiri','serif',[400,700]],['El Messiri','sans-serif',[400,500,600]]]
  };
  const FONT_RE=/^[A-Za-z0-9][A-Za-z0-9 ]{1,39}$/;
  const FONT_SYS={en:'system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif',ar:'"Segoe UI",Tahoma,Arial,sans-serif'};
  const fontOk=v=>v==='system'||FONT_RE.test(String(v||''));
  const fontKind=(lang,name)=>{const f=FONTS[lang].find(x=>x[0]===name)||FONTS.en.concat(FONTS.ar).find(x=>x[0]===name);return f?f[1]:null};
  // CSS font-family value for a chosen font; role 'head' falls back to a serif for unknown names
  function fontStack(name,lang,role){
    if(!fontOk(name))return '';
    if(name==='system')return FONT_SYS[lang];
    const kind=fontKind(lang,name)||(role==='head'?'serif':'sans-serif');
    return `"${name}",${kind==='serif'?(lang==='ar'?'"Noto Naskh Arabic"':'Georgia')+',serif':(lang==='ar'?'"Segoe UI",Tahoma,':'system-ui,')+'sans-serif'}`;
  }
  // The chosen fonts of one level ({head:{en,ar}, body:{en,ar}}): {fh-en, fh-ar, fb-en, fb-ar} as CSS values ('' = not set)
  function fontVars(L){
    const o={};
    [['head','fh'],['body','fb']].forEach(([role,k])=>['en','ar'].forEach(lang=>{const v=((L||{})[role]||{})[lang];o[`${k}-${lang}`]=v?fontStack(v,lang,role):''}));
    return o;
  }
  // Every Google font used anywhere in the settings, as one stylesheet address ('' when none is needed)
  function fontUrl(T){
    const F=(T||{}).fonts||{},use=new Map(),lvls=[F.all].concat(Object.values(F.sec||{}));
    lvls.forEach(L=>['head','body'].forEach(role=>['en','ar'].forEach(lang=>{
      const v=((L||{})[role]||{})[lang];if(!v||v==='system'||!fontOk(v))return;
      const f=FONTS.en.concat(FONTS.ar).find(x=>x[0]===v);use.set(v,f?f[2]:null);
    })));
    if(!use.size)return '';
    return 'https://fonts.googleapis.com/css2?'+[...use].sort((a,b)=>a[0]<b[0]?-1:1).map(([n,w])=>'family='+n.replace(/ /g,'+')+(w?':wght@'+w.join(';'):'')).join('&')+'&display=swap';
  }
  function fontLink(T,id){
    const url=fontUrl(T);let l=document.getElementById(id||'khip-fonts');
    if(!url){if(l)l.remove();return}
    if(!l){l=document.createElement('link');l.id=id||'khip-fonts';l.rel='stylesheet';document.head.appendChild(l)}
    if(l.getAttribute('href')!==url)l.setAttribute('href',url);
  }
  function fontsRoot(T){                                 // the whole site (before the page paints)
    const v=fontVars(((T||{}).fonts||{}).all);
    for(const k in v)put(root.style,'--'+k,v[k]);
    fontLink(T);
  }
  function fontsSec(T){                                  // one section's own fonts, on top of the site-wide ones
    const S=((T||{}).fonts||{}).sec||{};
    document.querySelectorAll('[data-sec]').forEach(el=>{
      const v=fontVars(S[el.dataset.sec]);
      for(const k in v)put(el.style,'--'+k,v[k]);
    });
  }
  function apply(D){const T=(D&&D.theme)||{};vars(T);paint(T);paintLook(T);fontsSec(T);align(T);logos(T);images(T);window.KTHEME.current=T;document.dispatchEvent(new CustomEvent('khip-theme',{detail:T}))}
  window.KTHEME={DEFAULTS,ROLES,SECTIONS,HEX,HERO,ALIGN,LOGOS,FXG,fxVals,AXE,AXDIST,AXEASE,AXHOVER,axCfg,axVars,LGE,LGIDLE,LGHOVER,MAPE,MAPIDLE,MAPHOVER,MAPPULSE,lgCfg,mapCfg,FONTS,fontOk,fontStack,fontVars,fontUrl,fontLink,resolve,lum,palette,apply,lookMap,cardMap,cardsOf};
  // The admin page uses the definitions only; it must not recolour itself.
  if(/admin\.html$/.test(location.pathname))return;
  let cached=null;try{cached=JSON.parse(localStorage.getItem(CACHE))}catch{}
  if(cached&&cached.theme){
    window.KTHEME.current=cached.theme;vars(cached.theme);logoVars(cached.theme);               // colours and logo sizes before first paint: no flash
    if(window.MutationObserver&&(cached.theme.logos||{})){const mo=new MutationObserver(()=>logoImgs(cached.theme));mo.observe(document,{childList:true,subtree:true});document.addEventListener('DOMContentLoaded',()=>mo.disconnect())}   // a replaced logo shows as soon as its tag exists
  }
  const go=D=>{apply(D)};
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn();
  ready(()=>{if(cached)go(cached)});
  fetch('./app-data.json',{cache:'no-cache'}).then(r=>r.ok?r.json():Promise.reject()).then(d=>{ready(()=>go(d))}).catch(()=>{});
})();

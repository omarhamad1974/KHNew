/* KHIP admin: the "Look" controls (tabs Header & bar, Cards, and the ones added in later phases).
   Loaded by admin.html after its main script, which provides: D (the data), $, esc, inp, get, set, mark, view, toast,
   theme(), palOptions(), imgSrc() and the colour palette helpers (KTHEME).
   Everything here is saved under "theme" in app-data.json and applied on the site by theme.js (and look.js in later phases). */
const ALOOK=(()=>{
  const TH=()=>window.KTHEME;
  const T=()=>theme();
  const open=new Set();                                  // sections left open in the per-section lists
  const unset=p=>{const k=p.split('.'),l=k.pop();let o=D;for(const x of k){o=o&&o[x];if(!o)return}delete o[l]};
  const val=p=>String(get(D,p)??'');
  const num=(p,d)=>{const n=parseFloat(get(D,p));return isFinite(n)?n:d};
  const styleOf=m=>Object.keys(m).filter(k=>m[k]!==''&&m[k]!=null).map(k=>`${k}:${m[k]}`).join(';');

  /* ---------- small building blocks ---------- */
  // A colour from the site palette, one of your own colours, or any colour. Saved as "role:ink", "custom:<id>" or #rrggbb.
  function cref(p,label,o={}){
    const t=T(),v=val(p),hex=TH().HEX.test(v);
    const opts=`<option value="" ${v===''?'selected':''}>${esc(o.none||'Default')}</option>`+palOptions(t,v);
    return `<div><div class="flex items-end gap-2"><label class="block text-xs font-bold flex-1 min-w-0">${esc(label)}<select data-cref="${p}" class="${inp} mt-1">${opts}</select></label>${hex?`<input type="color" data-p="${p}" value="${esc(v)}" aria-label="${esc(label)}: pick any color" class="w-11 h-11 p-0 border border-gray-300 rounded-lg bg-white cursor-pointer flex-shrink-0">`:''}</div>${o.hint?`<p class="text-[11px] text-gray-500 mt-1">${o.hint}</p>`:''}</div>`;
  }
  function slider(p,label,min,max,step,unit,def,o={}){
    const v=num(p,def);
    return `<label class="block text-xs font-bold ${o.off?'opacity-40':''}">${esc(label)}: <span data-lkout="${p}" data-unit="${unit}">${v}${unit}</span><input type="range" min="${min}" max="${max}" step="${step}" data-p="${p}" value="${v}" ${o.off?'disabled':''} class="mt-1 w-full"></label>`;
  }
  const card=(title,intro,body,extra='')=>`<div class="bg-white p-4 rounded-2xl border border-gray-200 space-y-3"><div class="flex items-start justify-between gap-3"><div><h2 class="font-extrabold text-lg">${title}</h2>${intro?`<p class="text-xs text-gray-600 mt-0.5">${intro}</p>`:''}</div>${extra}</div>${body}</div>`;
  const reset=(act,label='Reset')=>`<button type="button" data-lk="${act}" class="text-xs bg-gray-100 hover:bg-gray-200 font-bold px-3 py-2 rounded-xl flex-shrink-0" title="Back to the original look"><i class="fas fa-rotate-left"></i> ${label}</button>`;
  const grid=h=>`<div class="grid sm:grid-cols-2 gap-3">${h}</div>`;
  const prevBox=(id,inner)=>`<div><span class="text-xs font-bold text-gray-700">Preview</span><div id="${id}" class="mt-1 rounded-xl overflow-hidden border border-gray-200" data-lkprev="${id}">${inner}</div></div>`;
  // A collapsible block with a badge (used inside "Look of this section").
  const det=(id,title,on,onTxt,offTxt,body)=>`<details data-lkd="${id}" ${open.has(id)?'open':''} class="bg-white rounded-2xl border border-gray-200 shadow-sm"><summary class="flex items-center gap-2 p-3 cursor-pointer"><i class="fas fa-chevron-right chev text-[10px] text-gray-400"></i><span class="flex-1 min-w-0 font-bold text-sm truncate">${esc(title)}</span><span class="text-[11px] font-bold px-2 py-1 rounded-lg ${on?'bg-brand-50 text-brand-700':'bg-gray-100 text-gray-500'}">${esc(on?onTxt:offTxt)}</span></summary><div class="p-4 pt-2 space-y-3 border-t">${body}</div></details>`;
  const seeSections=what=>`<div class="bg-white p-4 rounded-2xl border border-gray-200 flex flex-wrap items-center justify-between gap-3"><p class="text-xs text-gray-600 flex-1 min-w-[16rem]">${what} can also be set for <b>a single section</b>: open <b>Sections</b>, pick the section and use <b>Look of this section</b>. Whatever a section leaves on its default follows the settings on this page.</p><button type="button" data-sj="home-about" class="text-xs bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold px-3 py-2 rounded-xl flex-shrink-0"><i class="fas fa-table-list"></i> Go to Sections</button></div>`;

  /* ---------- Header & bar ---------- */
  function hdrPrev(){
    const t=T(),m=TH().lookMap(t),pal=TH().palette(t);
    const bg=`rgb(var(--hdr-bg-rgb,255 255 255) / var(--hdr-bg-a,.9))`,fg=`rgb(var(--hdr-fg-rgb,87 83 78))`;
    return `<div style="${styleOf(m)};background:repeating-linear-gradient(135deg,#e7e5e4 0 10px,#f5f5f4 10px 20px)"><div style="background:${bg};border-bottom:1px solid var(--hdr-bd,#e7e5e4);color:${fg};" class="flex items-center justify-between gap-2 px-3 py-3 text-xs"><b style="color:${fg};letter-spacing:.05em;font-size:13px">KHIP</b><span class="flex gap-3 whitespace-nowrap overflow-hidden"><span>About</span><span>Jurisdictions</span><span>Services</span><span>News</span></span><span class="flex gap-1.5"><span class="w-6 h-6 rounded-full border flex items-center justify-center" style="border-color:rgb(var(--hdr-fg-rgb,214 211 209) / .5)"><i class="fab fa-linkedin-in text-[10px]"></i></span><span class="px-2 h-6 rounded-full border flex items-center" style="border-color:rgb(var(--hdr-fg-rgb,214 211 209) / .5);font-size:10px">AR</span></span></div><div class="h-10"></div></div>`;
  }
  function barPrev(){
    const t=T(),m=TH().lookMap(t),pal=TH().palette(t);
    const nav=[['fa-house','Home'],['fa-shield-halved','Services'],['fa-newspaper','News'],['fa-globe','Jurisdiction'],['fa-circle-info','About']];
    return `<div style="${styleOf(m)}"><div style="background:var(--bar-bg,${pal.ink});color:var(--bar-fg,#fff)" class="px-3 pt-3 pb-2"><div class="relative"><div style="background:var(--wa-bg,rgba(255,255,255,.08));border:1px solid var(--wa-bd,rgba(255,255,255,.28));color:var(--wa-fg,#fff)" class="rounded-full flex items-center gap-2 pl-3 pr-1.5 py-1.5 text-xs"><i class="fab fa-whatsapp text-base"></i><span class="flex-1 truncate" style="color:var(--wa-ph,rgba(255,255,255,.72))">Message KHIP on WhatsApp</span><span class="w-7 h-7 rounded-full flex items-center justify-center" style="background:var(--wa-btn,${pal.sand});color:var(--wa-btn-fg,${pal.ink})"><i class="fas fa-paper-plane text-xs"></i></span></div></div><div class="grid grid-cols-5 text-center mt-2" style="font-size:10px">${nav.map(([i,l])=>`<span><i class="fas ${i} block text-base mb-0.5"></i>${l}</span>`).join('')}</div></div></div>`;
  }
  function viewHeader(){
    const t=T(),hOn=!!val('theme.header.bg');
    $('view').innerHTML=
      card('Header','The bar at the top of every page. Leave a box on <b>Default</b> to keep the original look (white, slightly see-through).',
        grid(cref('theme.header.bg','Background',{none:'Default (white)'})+slider('theme.header.opacity','Opacity',20,100,5,'%',90,{off:!hOn})
          +cref('theme.header.text','Text, menu and icon color',{none:'Automatic (light text on a dark header)'})+cref('theme.header.border','Line under the header',{none:'Default (light grey)'}))
        +prevBox('lk-hdr',hdrPrev())
        +`<p class="text-[11px] text-gray-500">The current logo is blue on a transparent background: it reads well on light and mid-dark headers. If you choose a very dark header, a lighter logo can be uploaded in <b>General, Brand &amp; logos</b>.</p>`,
        reset('reset-header'))
      +card('Bottom bar','The bar at the bottom of every page: the WhatsApp box and the five buttons.',
        grid(cref('theme.bar.bg','Bar background',{none:'Default (dark)'})+cref('theme.bar.text','Button text and icons',{none:'Automatic'})),
        reset('reset-bar'))
      +card('WhatsApp text box','The rounded box where visitors type their message. It follows the bar colors until you choose its own.',
        grid(cref('theme.wa.bg','Box background',{none:'Default (soft see-through)'})+slider('theme.wa.opacity','Box opacity',0,100,5,'%',100,{off:!val('theme.wa.bg')})
          +cref('theme.wa.text','Typed text, hint text and WhatsApp icon',{none:'Automatic'})+cref('theme.wa.border','Box outline',{none:'Default'})
          +cref('theme.wa.btn','Send button',{none:'Default (sand)'})+cref('theme.wa.btnText','Send button icon',{none:'Default (dark)'}))
        +prevBox('lk-bar',barPrev())
        +`<p class="text-[11px] text-gray-500">Tip: a dark bar with light text, or a light bar with dark text, always reads well. The hint text is the typing animation.</p>`,
        reset('reset-wa','Reset box'));
  }

  /* ---------- Cards ---------- */
  function cardsPrev(){
    const t=T(),pal=TH().palette(t),C=t.cards||{},m=TH().cardMap(C,t),fg=!!m['--card-fg'];
    const [r,g,b]=[1,3,5].map(i=>parseInt(pal.title.slice(i,i+2),16));
    const one=(h,txt)=>`<div style="background:var(--card-bg,#fff);color:var(--card-fg,${pal.text});border:1px solid var(--card-bd,rgba(231,229,228,.8))" class="rounded-2xl p-3 shadow-sm"><p style="font-family:Georgia,serif;font-size:15px;font-weight:600;color:rgb(var(--card-title-rgb,${r} ${g} ${b}))">${h}</p><p class="text-xs mt-1">${txt}</p><p class="text-[11px] mt-1.5" style="color:${fg?'rgb(var(--card-fg-rgb) / .8)':'#78716c'}">Muted line</p></div>`;
    return `<div style="${styleOf(m)};background:${pal.page}" class="p-3 grid grid-cols-2 gap-3">${one('Patents','Protect your invention in eleven countries.')}${one('Trademarks','Register and renew your brand.')}</div>`;
  }
  function secCards(key){
    const base=`theme.secCards.${key}.`,s=(T().secCards||{})[key]||{},on=Object.keys(s).some(k=>s[k]);
    const body=grid(cref(base+'bg','Card background',{none:'Same as all cards'})+slider(base+'opacity','Opacity',0,100,5,'%',100,{off:!s.bg})
      +cref(base+'text','Card text',{none:'Same as all cards'})+cref(base+'title','Card titles',{none:'Same as all cards'})+cref(base+'border','Card border',{none:'Same as all cards'}))
      +`<div><button type="button" data-lk="reset-sec" data-k="${key}" class="text-xs bg-gray-100 hover:bg-gray-200 font-bold px-3 py-2 rounded-xl"><i class="fas fa-rotate-left"></i> Same as all cards</button></div>`;
    return det('c:'+key,'Cards',on,'Own colors','Same as all',body);
  }
  function viewCards(){
    T();
    $('view').innerHTML=
      card('All cards','The white boxes of the site: service cards, news cards, team cards, FAQ questions, the quote frame and the contact tiles. Leave a box on <b>Default</b> to keep the original colors.',
        grid(cref('theme.cards.bg','Card background',{none:'Default (white)'})+slider('theme.cards.opacity','Background opacity',0,100,5,'%',100,{off:!val('theme.cards.bg')})
          +cref('theme.cards.text','Card text',{none:'Default (body text color)'})+cref('theme.cards.title','Card titles',{none:'Default (title color)'})
          +cref('theme.cards.border','Card border',{none:'Default (light grey)'}))
        +prevBox('lk-cards',cardsPrev()),
        reset('reset-cards'))
      +seeSections('Card colors');
  }

  /* ---------- Text alignment (phase 2) ---------- */
  const AL_OPTS=[['','Default (as designed)'],['start','Start (left; right in Arabic)'],['center','Center'],['end','End (right; left in Arabic)'],['justify','Justify (even edges)']];
  const DEVS=[['m','Phone','under 640 px'],['t','Tablet','640 to 1023 px'],['d','Desktop','1024 px and up']];
  const alSel=(p,label,sub)=>{const v=val(p);return `<label class=\"block text-xs font-bold\">${esc(label)}${sub?` <span class=\"font-normal text-gray-500\">(${esc(sub)})</span>`:''}<select data-p=\"${p}\" data-lkv=\"1\" class=\"${inp} mt-1\">${AL_OPTS.map(([k,n])=>`<option value=\"${k}\" ${v===k?'selected':''}>${esc(n)}</option>`).join('')}</select></label>`};
  const alTri=base=>`<div class=\"grid sm:grid-cols-3 gap-3\">${DEVS.map(([k,n,s])=>alSel(base+k,n,s)).join('')}</div>`;
  function alignPrev(){
    const g=(T().align||{}).all||{},ok=v=>TH().ALIGN.includes(v)?v:'start';
    const box=([k,n])=>{const a=ok(g[k]);return `<div class=\"rounded-xl border border-gray-200 bg-white p-3\"><p class=\"text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1\">${n}: ${g[k]||'as designed'}</p><div style=\"text-align:${a}\"><p style=\"font-family:Georgia,serif;font-size:15px;font-weight:600\">Our services</p><p class=\"text-xs mt-1 leading-relaxed\">We protect inventions, brands and designs across the region, with one team and one point of contact for every filing.</p></div></div>`};
    return `<div class=\"grid sm:grid-cols-3 gap-3 p-3 bg-gray-50\">${DEVS.map(box).join('')}</div>`;
  }
  function secAlign(key){
    const s=(((T().align||{}).sec||{})[key])||{},on=['m','t','d'].some(k=>s[k]);
    return det('a:'+key,'Text alignment',on,'Own alignment','Same as all',alTri(`theme.align.sec.${key}.`)+`<div><button type="button" data-lk="reset-align-sec" data-k="${key}" class="text-xs bg-gray-100 hover:bg-gray-200 font-bold px-3 py-2 rounded-xl"><i class="fas fa-rotate-left"></i> Same as all sections</button></div>`);
  }
  function viewAlign(){
    T();
    $('view').innerHTML=
      card('All sections','How the text is lined up in every section of the site, separately for phone, tablet and desktop. Leave a box on <b>Default</b> to keep the original layout. Headings are never stretched: with <b>Justify</b> they line up at the start.',
        alTri('theme.align.all.')+`<div><span class="text-xs font-bold text-gray-700">Preview</span><div id="lk-align" class="mt-1 rounded-xl overflow-hidden border border-gray-200" data-lkprev="lk-align">${alignPrev()}</div></div>`
        +`<p class="text-[11px] text-gray-500">Only text is affected; buttons, icons and photos keep their place. The header, the hero slider and the bottom bar are not part of a section.</p>`,
        reset('reset-align','Reset all'))
      +seeSections('Text alignment');
  }

  /* ---------- Logos (phase 2) ---------- */
  const LOGO_PRESETS={header:{S:[120,140,160],M:[150,190,230],L:[190,250,320],XL:[240,320,400]},home:{S:[80,90,100],M:[120,140,160],L:[180,220,260],XL:[240,300,360]},about:{S:[64,72,80],M:[96,112,128],L:[140,170,200],XL:[200,250,300]}};
  const LOGO_INFO={header:'The logo at the top left of every page.',home:'The big logo beside the About text on the home page.',about:'The logo above the title on the About page.'};
  function logoPrev(k){
    const L=((T().logos||{})[k])||{},def=TH().LOGOS.find(x=>x[0]===k),w=parseFloat(L.d)||0;
    const bg=k==='header'?'background:rgb(var(--hdr-bg-rgb,255 255 255) / var(--hdr-bg-a,.9))':'background:#f7f6f3';
    return `<div style=\"${k==='header'?styleOf(TH().lookMap(T())):''};${bg}\" class=\"p-3 overflow-x-auto\"><img src=\"${esc(imgSrc(L.image||def[2]))}\" alt=\"\" style=\"${w?`width:${w}px;`:`width:${k==='header'?'232px':'176px'};`}max-width:none;height:auto;${k==='header'?'':'mix-blend-mode:multiply'}\" onerror=\"this.style.visibility='hidden'\"></div><p class=\"text-[11px] text-gray-500 px-3 py-1.5 bg-white\">Shown at the desktop width${w?` (${w} px)`:' (original size)'}.</p>`;
  }
  function logoCard(k,title){
    const def=TH().LOGOS.find(x=>x[0]===k),lim=def[3],L=((T().logos||{})[k])||{},base=`theme.logos.${k}.`;
    const size=([d,n,s])=>`<label class=\"block text-xs font-bold\">${n} <span class=\"font-normal text-gray-500\">(${s})</span><div class=\"flex items-center gap-1 mt-1\"><input type=\"number\" inputmode=\"numeric\" min=\"${lim[0]}\" max=\"${lim[1]}\" step=\"1\" data-p=\"${base+d}\" value=\"${esc(val(base+d))}\" placeholder=\"Original\" class=\"${inp}\"><span class=\"text-xs text-gray-500\">px</span></div></label>`;
    const presets=Object.keys(LOGO_PRESETS[k]).map(n=>`<button type=\"button\" data-lk=\"logo-preset\" data-k=\"${k}\" data-s=\"${n}\" class=\"text-xs bg-gray-100 hover:bg-gray-200 font-bold px-3 py-2 rounded-xl\">${n}</button>`).join('');
    const body=`<div><span class=\"text-xs font-bold text-gray-700\">Picture</span><div class=\"flex items-center gap-2 mt-1\"><img data-prev=\"${base}image\" src=\"${esc(imgSrc(L.image||def[2]))}\" alt=\"\" onerror=\"this.style.visibility='hidden'\" class=\"w-14 h-14 rounded-lg object-contain bg-gray-100 border border-gray-200 flex-shrink-0\"><input data-p=\"${base}image\" value=\"${esc(val(base+'image'))}\" list=\"assets\" aria-label=\"${esc(title)} picture\" placeholder=\"Original logo (file name in assets, or upload)\" class=\"${inp}\"><label class=\"flex-shrink-0 text-xs bg-brand-50 text-brand-700 font-bold px-3 py-2.5 rounded-lg cursor-pointer hover:bg-brand-100\" title=\"Upload a logo\"><i class=\"fas fa-upload\"></i><input type=\"file\" accept=\"image/*\" data-up=\"${base}image\" class=\"hidden\"></label></div><p class=\"text-[11px] text-gray-500 mt-1\">PNG with a transparent background works best. The logo keeps its shape; only the width is set.</p></div>`
      +`<div><span class=\"text-xs font-bold text-gray-700\">Width on each screen</span><div class=\"grid sm:grid-cols-3 gap-3 mt-1\">${DEVS.map(size).join('')}</div><div class=\"flex flex-wrap items-center gap-2 mt-2\"><span class=\"text-[11px] text-gray-500\">Quick sizes:</span>${presets}</div><p class=\"text-[11px] text-gray-500 mt-1\">Allowed ${lim[0]} to ${lim[1]} px. Leave a box empty to keep the original size on that screen.</p></div>`
      +`<div><span class=\"text-xs font-bold text-gray-700\">Preview</span><div id=\"lk-lg-${k}\" class=\"mt-1 rounded-xl overflow-hidden border border-gray-200\" data-lkprev=\"lk-lg-${k}\">${logoPrev(k)}</div></div>`;
    return card(title,LOGO_INFO[k],body,reset('reset-logo-'+k,'Original'));
  }
  function viewLogos(){
    T();
    $('view').innerHTML=logoCard('header','Header logo')+logoCard('home','Home page logo')+logoCard('about','About page logo');
  }

  /* ---------- Menu (phase 3) ---------- */
  const MODES=[['','Default: links in the header on large screens, bottom bar everywhere'],['bottom','Bottom bar only: no links in the header'],['both','Bottom bar and a top "sandwich" button that opens a side menu']];
  const selBox=(p,label,opts,hint)=>{const v=val(p);return `<div><label class="block text-xs font-bold">${esc(label)}<select data-p="${p}" data-lkv="1" class="${inp} mt-1">${opts.map(([k,n])=>`<option value="${k}" ${v===k?'selected':''}>${esc(n)}</option>`).join('')}</select></label>${hint?`<p class="text-[11px] text-gray-500 mt-1">${hint}</p>`:''}</div>`};
  function menuPrev(){
    const t=T(),M=t.menu||{},pal=TH().palette(t),R=r=>r?TH().resolve(r,t):null;
    const mode=M.mode==='bottom'||M.mode==='both'?M.mode:'',bar=R((t.bar||{}).bg)||pal.ink;
    const bg=R(M.bg)||bar,fg=R(M.text)||(TH().lum(bg)>=.4?pal.ink:'#ffffff'),end=M.side==='end';
    const ov=Math.min(80,Math.max(0,parseFloat(M.overlay)||50))/100,bfg=R((t.bar||{}).text)||(TH().lum(bar)>=.4?pal.ink:'#fff');
    const burger='<span class="w-7 h-7 rounded-full border border-gray-400 flex flex-col items-center justify-center gap-[3px]"><i class="block w-3 h-[2px] bg-gray-600"></i><i class="block w-3 h-[2px] bg-gray-600"></i><i class="block w-3 h-[2px] bg-gray-600"></i></span>';
    const links=(M.mode==='both'?'':mode===''?'<span class="hidden sm:flex gap-3 text-[10px] text-gray-500"><span>About</span><span>Jurisdictions</span><span>Services</span><span>News</span></span>':'');
    const panel=mode==='both'?`<div style="position:absolute;top:0;bottom:0;${end?'right':'left'}:0;width:62%;background:${bg};color:${fg}" class="p-3 text-[11px] shadow-lg"><p class="opacity-70 text-[9px] tracking-widest uppercase mb-2">Menu</p>${['Home','About','Jurisdictions','Services','News'].map(x=>`<p class="py-1.5" style="border-bottom:1px solid ${fg}33">${x}</p>`).join('')}</div>`:'';
    return `<div class="bg-stone-100 p-3"><div class="mx-auto rounded-xl overflow-hidden border border-gray-300 bg-white" style="max-width:300px"><div class="flex items-center justify-between px-3 py-2 border-b border-gray-200"><b class="text-xs">KHIP</b>${links}${mode==='both'?burger:'<span class="w-7 h-7"></span>'}</div><div class="relative bg-stone-50 text-[10px] text-gray-400 px-3 py-4" style="height:170px">Page content${mode==='both'?`<div style="position:absolute;inset:0;background:rgba(27,36,51,${ov})"></div>${panel}`:''}</div><div class="px-3 py-2 text-[9px] text-center grid grid-cols-5" style="background:${bar};color:${bfg}"><span>Home</span><span>Services</span><span>News</span><span>Jurisdiction</span><span>About</span></div></div></div>`;
  }
  function viewMenu(){
    const T0=T(),M=T0.menu||{},both=M.mode==='both';
    $('view').innerHTML=
      card('Menu','How visitors move around the site. The bottom bar (WhatsApp box and five buttons) is always there; here you choose what happens at the top.',
        selBox('theme.menu.mode','Menu layout',MODES)
        +(both?grid(selBox('theme.menu.side','The menu opens from',[['','Start of the screen (left; right in Arabic)'],['end','End of the screen (right; left in Arabic)']])
          +`<label class="flex items-start gap-2 text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-pointer"><input type="checkbox" data-p="theme.menu.keepNav" data-bool="1" data-lkv="1" ${M.keepNav===true?'checked':''} class="mt-0.5"><span>Also keep the links in the header on large screens</span></label>`)
          :'<p class="text-[11px] text-gray-500">Choose <b>Bottom bar and a top sandwich button</b> to get the side menu options (colors, side, darkening).</p>')
        +prevBox('lk-menu',menuPrev()),
        reset('reset-menu'))
      +(both?card('Side menu look','Colors of the panel that opens. Leave on Default to follow the bottom bar colors.',
        grid(cref('theme.menu.bg','Panel background',{none:'Default (bottom bar color)'})+cref('theme.menu.text','Panel text and links',{none:'Automatic'})
          +slider('theme.menu.overlay','Darkening of the page behind',0,80,5,'%',50)+slider('theme.menu.width','Panel width',240,480,10,' px',300))):'');
  }

  /* ---------- Image effects (phase 4) ---------- */
  const fxSample=()=>{const c=(D.carousel||[]).find(x=>x.image)||(D.news||[]).find(x=>x.image);return c?imgSrc(c.image):''};
  function fxPrev(g,key){
    const t=T(),f=TH().fxVals(t,g,key),base=g==='hero'?.8:1,op=f.op===null?base:f.op,src=fxSample();
    const bg=src?`<img src="${esc(src)}" alt="" style="width:100%;height:100%;object-fit:cover;opacity:${op}" onerror="this.style.visibility='hidden'">`:`<div style="width:100%;height:100%;background:linear-gradient(135deg,#94a3b8,#e2e8f0);opacity:${op}"></div>`;
    return `<div style="position:relative;height:110px;background:#fff;overflow:hidden;border-radius:12px">${bg}${f.tint?`<div style="position:absolute;inset:0;background:${f.color};opacity:${f.k}"></div>`:''}</div>`;
  }
  const fxBody=(base,g,key,none)=>grid(slider(base+'opacity','Picture opacity',0,100,5,'%',g==='hero'?80:100)+cref(base+'color','Color filter',{none:none||'No filter'})
      +slider(base+'intensity','Filter intensity',0,100,5,'%',35,{off:!val(base+'color')})+`<div><span class="text-xs font-bold text-gray-700">Preview</span><div data-fxprev="${g}${key?':'+key:''}" class="mt-1">${fxPrev(g,key)}</div></div>`);
  function secFx(key){
    const base=`theme.imgfx.sec.${key}.`,s=(((T().imgfx||{}).sec||{})[key])||{},on=Object.keys(s).some(k=>s[k]!==''&&s[k]!=null),img=((T().sections||{})[key]||{}).mode==='image';
    const body=img?fxBody(base,'sections',key,'Same as section photos')+`<div><button type="button" data-lk="reset-fx-sec" data-k="${key}" class="text-xs bg-gray-100 hover:bg-gray-200 font-bold px-3 py-2 rounded-xl"><i class="fas fa-rotate-left"></i> Same as all section photos</button></div>`
      :'<p class="text-xs text-gray-600">This section has no photo background. Set <b>Background</b> above to <b>Photo</b> and its opacity and color filter appear here.</p>';
    return det('f:'+key,'Photo effect',img&&on,'Own effect',img?'Same as all':'No photo background',body);
  }
  function viewFx(){
    $('view').innerHTML=
      card('All pictures','Opacity and a color filter for the pictures of the site. The filter is a color laid over the picture: choose a site color or any color, then how strong it is. Leave a box on its default to keep the pictures as they are. Each group below can differ.',
        grid(slider('theme.imgfx.all.opacity','Picture opacity',0,100,5,'%',100)+cref('theme.imgfx.all.color','Color filter',{none:'No filter'})
          +slider('theme.imgfx.all.intensity','Filter intensity',0,100,5,'%',35,{off:!val('theme.imgfx.all.color')}))
        +`<div><span class="text-xs font-bold text-gray-700">Preview</span><div data-fxprev="all" class="mt-1">${fxPrev('news')}</div></div>`,
        reset('reset-fx-all','Reset all'))
      +card('Home page slider','The big pictures at the top of the home page. They start at 80% opacity.',fxBody('theme.imgfx.hero.','hero',null,'Same as all pictures'),reset('reset-fx-hero','Same as all'))
      +card('News pictures','News cards, the article pop-up and related news.',fxBody('theme.imgfx.news.','news',null,'Same as all pictures'),reset('reset-fx-news','Same as all'))
      +card('Team photos','The About page team slider.',fxBody('theme.imgfx.team.','team',null,'Same as all pictures'),reset('reset-fx-team','Same as all'))
      +card('Section background photos','Photos used as a section background. Opacity fades the photo into the color behind it; the darkening slider of the background still applies on top.',fxBody('theme.imgfx.sections.','sections',null,'Same as all pictures'),reset('reset-fx-sections','Same as all'))
      +seeSections('The photo effect of a section background');
  }

  /* ---------- Animation (phase 5) ---------- */
  const axSelect=(p,label,opts)=>{const v=val(p);return `<label class="block text-xs font-bold">${esc(label)}<select data-p="${p}" data-lkv="1" class="${inp} mt-1">${opts.map(([k,n])=>`<option value="${k}" ${v===k?'selected':''}>${esc(n)}</option>`).join('')}</select></label>`};
  function axFields(base,isCards){
    const eff=val(base+'effect'),live=eff!==''&&eff!=='none';
    return grid(axSelect(base+'effect','Effect',TH().AXE)
      +(live?axSelect(base+'distance','Distance',TH().AXDIST.map(([k,n])=>[k,n]))+axSelect(base+'easing','Feel',TH().AXEASE.map(([k,n])=>[k,n]))
        +slider(base+'speed','Speed (seconds)',0.2,2.5,0.1,' s',0.9)+slider(base+'delay','Delay before it starts',0,2,0.1,' s',0)
        +slider(base+'stagger','Delay between neighbours',0,0.5,0.05,' s',isCards?0.08:0)
        +axSelect(base+'repeat','Plays',[['','Once'],['always','Every time it scrolls into view']]):'')
      +(isCards?axSelect(base+'hover','When pointing at a card',TH().AXHOVER.map(([k,n])=>[k,n])):''))
      +(live?`<div><button type="button" data-lk="ax-play" data-base="${base}" data-cards="${isCards?1:0}" class="text-xs bg-brand-50 text-brand-700 font-bold px-3 py-2 rounded-xl"><i class="fas fa-play"></i> Play preview</button><div data-axprev="${base}" class="mt-2 rounded-xl border border-gray-200 bg-stone-50 p-4 overflow-hidden" style="min-height:92px">${axSample(isCards)}</div></div>`:'');
  }
  const axSample=isCards=>isCards?'<div class="ax-s rounded-xl border border-gray-200 bg-white p-3 shadow-sm" style="max-width:240px"><b class="text-sm">Patent filing</b><p class="text-xs text-gray-600 mt-1">Protection for inventions across the region.</p></div>':'<div class="ax-s"><p style="font-family:Georgia,serif;font-size:18px;font-weight:600">Our services</p><p class="text-xs text-gray-600 mt-1">One team and one point of contact for every filing.</p></div>';
  function axRun(btn){
    const base=btn.dataset.base,isCards=btn.dataset.cards==='1',box=document.querySelector(`[data-axprev="${base}"]`);if(!box)return;
    const t=T(),c={};
    ['effect','distance','speed','delay','stagger','easing','repeat'].forEach(k=>{const v=val(base+k);if(v!=='')c[k]=v});
    const key=base.startsWith('theme.anim.sec.')?base.split('.')[3]:null,target=isCards?'cards':'text';
    const m=key?TH().axCfg(t,key,target):TH().axCfg(t,'x',target),v=TH().axVars(Object.assign({},m,c),document.documentElement.dir==='rtl',isCards);
    box.innerHTML=axSample(isCards);const el=box.firstElementChild;
    el.style.cssText+=`;opacity:0;transform:translate(${v.x}px,${v.y}px) perspective(900px) rotateX(${v.rx}deg) scale(${v.s});filter:blur(${v.b}px)`;
    void el.offsetWidth;
    el.style.transition=`opacity ${v.t}s ${v.e} ${v.d}s,transform ${v.t}s ${v.e} ${v.d}s,filter ${v.t}s ${v.e} ${v.d}s`;
    el.style.opacity=1;el.style.transform='none';el.style.filter='none';
  }
  function secAx(key){
    const s=(((T().anim||{}).sec||{})[key])||{},on=['cards','text'].some(k=>Object.values(s[k]||{}).some(v=>v!==''&&v!=null));
    return det('x:'+key,'Animation',on,'Own animation','Same as all',`<div class="space-y-4"><div><h4 class="font-bold text-sm mb-2">Cards</h4>${axFields(`theme.anim.sec.${key}.cards.`,true)}</div><div><h4 class="font-bold text-sm mb-2">Text (titles and paragraphs)</h4>${axFields(`theme.anim.sec.${key}.text.`,false)}</div><div><button type="button" data-lk="reset-ax-sec" data-k="${key}" class="text-xs bg-gray-100 hover:bg-gray-200 font-bold px-3 py-2 rounded-xl"><i class="fas fa-rotate-left"></i> Same as all sections</button></div></div>`);
  }
  function viewAnim(){
    $('view').innerHTML=
      card('Cards in every section','How cards (services, news, FAQ, team and contact tiles) appear as they scroll into view, and what they do when pointed at. Leave the effect on <b>As designed</b> to keep the original fade-up.',axFields('theme.anim.all.cards.',true),reset('reset-ax-all','Reset all animation'))
      +card('Text in every section','Titles and paragraphs outside cards.',axFields('theme.anim.all.text.',false))
      +seeSections('Animation')
      +'<p class="text-[11px] text-gray-500 px-1">Visitors who ask their device for less motion see everything at once.</p>';
  }

  /* ---------- Map and logo animation (phase 6) ---------- */
  const moSel=(p,label,opts)=>{const v=val(p);return `<label class="block text-xs font-bold">${esc(label)}<select data-p="${p}" data-lkv="1" class="${inp} mt-1">${opts.map(([k,n])=>`<option value="${k}" ${v===k?'selected':''}>${esc(n)}</option>`).join('')}</select></label>`};
  function mapFields(){
    const b='theme.motion.map.',e=val(b+'entrance'),live=e!==''&&e!=='none';
    return grid(moSel(b+'entrance','When the map comes into view',TH().MAPE)
      +(live?slider(b+'speed','Speed (seconds)',0.2,2.5,0.1,' s',0.8)+slider(b+'delay','Delay before it starts',0,2,0.1,' s',0)+slider(b+'stagger','Delay between countries',0,0.5,0.02,' s',0.12)
        +moSel(b+'base','The rest of the map',[['','Stays as is'],['fade','Fades in too']]):'')
      +moSel(b+'idle','Constant movement',TH().MAPIDLE)+moSel(b+'hover','Pointing at a country',TH().MAPHOVER)
      +moSel(b+'pulse','Pulse around the offices',TH().MAPPULSE)+cref(b+'pulseColor','Pulse color',{none:'Default (gold)'}));
  }
  const lgSample=k=>{const def=TH().LOGOS.find(x=>x[0]===(k==='all'?'home':k)),L=((T().logos||{})[k==='all'?'home':k])||{};return `<img src="${esc(imgSrc(L.image||def[2]))}" alt="" class="lx-s" style="height:56px;width:auto;mix-blend-mode:multiply" onerror="this.style.visibility='hidden'">`};
  function lgFields(base,k){
    const eff=val(base+'effect'),idle=val(base+'idle'),hov=val(base+'hover');
    return grid(moSel(base+'effect','When it appears',TH().LGE)
      +(eff?moSel(base+'distance','Distance',TH().AXDIST.map(([a,n])=>[a,n]))+slider(base+'speed','Speed (seconds)',0.2,2.5,0.1,' s',0.9)+slider(base+'delay','Delay before it starts',0,2,0.1,' s',0):'')
      +moSel(base+'idle','Constant movement',TH().LGIDLE)+(idle?slider(base+'idleSpeed','Seconds per cycle',1.5,8,0.5,' s',4):'')
      +moSel(base+'hover','Pointing at it',TH().LGHOVER))
      +`<div><div class="flex items-center gap-2"><span class="text-xs font-bold text-gray-700">Preview</span>${eff?`<button type="button" data-lk="lg-play" data-base="${base}" class="text-xs bg-brand-50 text-brand-700 font-bold px-3 py-1.5 rounded-lg"><i class="fas fa-play"></i> Play</button>`:''}</div><div data-lgprev="${base}" class="mt-1 rounded-xl border border-gray-200 bg-stone-50 p-4 overflow-hidden" style="min-height:90px">${lgPrevImg(base,k)}</div><p class="text-[11px] text-gray-500 mt-1">${hov?'Point at the logo to see the effect. ':''}${idle?'The movement plays here as it will on the site.':''}</p></div>`;
  }
  function lgPrevImg(base,k){
    const c=TH().lgCfg(T(),k==='all'?'home':k),own={};
    ['idle','idleSpeed','hover'].forEach(x=>{const v=val(base+x);if(v!=='')own[x]=v});
    const m=Object.assign({},c,own);
    const cls=['lx-s',m.hover?'lx-h lx-h-'+m.hover:'',m.idle?'lx-i lx-i-'+m.idle:''].join(' ');
    return lgSample(k).replace('class="lx-s"',`class="${cls}"`).replace('style="',`style="--lx-it:${parseFloat(m.idleSpeed)||4}s;`);
  }
  function lgRun(btn){
    const base=btn.dataset.base,box=document.querySelector(`[data-lgprev="${base}"]`);if(!box)return;
    const k=base.split('.')[3]==='all'?'all':base.split('.')[3],c={};
    ['effect','distance','speed','delay'].forEach(x=>{const v=val(base+x);if(v!=='')c[x]=v});
    const m=Object.assign({},TH().lgCfg(T(),k==='all'?'home':k),c),v=TH().axVars(m,document.documentElement.dir==='rtl',false);
    box.innerHTML=lgPrevImg(base,k);const el=box.firstElementChild;
    el.style.cssText+=`;opacity:0;transform:translate(${v.x}px,${v.y}px) perspective(900px) rotateX(${v.rx}deg) scale(${v.s});filter:blur(${v.b}px)`;
    void el.offsetWidth;
    el.style.transition=`opacity ${v.t}s ${v.e} ${v.d}s,transform ${v.t}s ${v.e} ${v.d}s,filter ${v.t}s ${v.e} ${v.d}s`;
    el.style.opacity=1;el.style.transform='none';el.style.filter='none';
    setTimeout(()=>{el.style.transition='';el.style.transform='';el.style.filter='';el.style.opacity=''},(v.t+v.d)*1000+200);
  }
  function lgOpt(k,label){
    const s=((((T().motion||{}).logos)||{})[k])||{},on=Object.values(s).some(v=>v!==''&&v!=null);
    return `<details data-lkd="l:${k}" ${open.has('l:'+k)?'open':''} class="bg-white rounded-2xl border border-gray-200 shadow-sm"><summary class="flex items-center gap-2 p-3 cursor-pointer"><i class="fas fa-chevron-right chev text-[10px] text-gray-400"></i><span class="flex-1 min-w-0 font-bold text-sm truncate">${esc(label)}</span><span class="text-[11px] font-bold px-2 py-1 rounded-lg ${on?'bg-brand-50 text-brand-700':'bg-gray-100 text-gray-500'}">${on?'Own animation':'Same as all logos'}</span></summary><div class="p-4 pt-2 space-y-3 border-t">${lgFields(`theme.motion.logos.${k}.`,k)}<div><button type="button" data-lk="reset-mo-logo" data-k="${k}" class="text-xs bg-gray-100 hover:bg-gray-200 font-bold px-3 py-2 rounded-xl"><i class="fas fa-rotate-left"></i> Same as all logos</button></div></div></details>`;
  }
  function viewMotion(){
    $('view').innerHTML=
      card('Map','The regional map on the home page: how it appears, how the highlighted countries and office pulses move, and what happens when someone points at a country. Leave everything on <b>None / As designed</b> to keep the map as it is. Open the home page to see the result.',mapFields(),reset('reset-mo-map'))
      +card('All logos','The header logo, the home page logo and the About page logo. Each logo below can differ.',lgFields('theme.motion.logos.all.','all'),reset('reset-mo-all','Reset all'))
      +lgOpt('header','Header logo')+lgOpt('home','Home page logo')+lgOpt('about','About page logo')
      +'<p class="text-[11px] text-gray-500 px-1">Visitors whose device asks for less motion get no automatic movement.</p>';
  }


  /* ---------- Look of one section (Sections page, admin restructure phase 3) ---------- */

  /* ---------- Fonts (admin restructure, phase 4) ---------- */
  const FSLOTS=[['head','Headings'],['body','Text']];
  const FSAMPLE={en:{h:'Protecting your ideas',p:'We file and manage patents and trademarks across the region, and keep every deadline for you.'},ar:{h:'نحمي أفكارك',p:'نسجّل ونُدير براءات الاختراع والعلامات التجارية في المنطقة، ونتابع كل المواعيد نيابةً عنك.'}};
  const fontBase=key=>key?`theme.fonts.sec.${key}.`:'theme.fonts.all.';
  // One font picker: a list of ready fonts plus "Another Google font" with a name box
  function fontPick(base,role,lang,label,sec){
    const p=`${base}${role}.${lang}`,v=val(p),list=TH().FONTS[lang],known=v===''||v==='system'||list.some(x=>x[0]===v)||TH().FONTS.en.concat(TH().FONTS.ar).some(x=>x[0]===v);
    const other=v!==''&&v!=='system'&&!list.some(x=>x[0]===v);
    const opts=`<option value="" ${v===''?'selected':''}>${sec?'Same as the whole site':'Original font of the site'}</option>`
      +`<option value="system" ${v==='system'?'selected':''}>The visitor's own font (system)</option>`
      +list.map(([n,k])=>`<option value="${esc(n)}" ${v===n?'selected':''}>${esc(n)} · ${k==='serif'?'serif':'sans'}</option>`).join('')
      +`<option value="__other" ${other?'selected':''}>Another Google font…</option>`;
    const bad=other&&!TH().fontOk(v);
    return `<div class="block min-w-0"><label class="block text-xs font-bold">${esc(label)}<select data-fsel="${p}" class="${inp} mt-1" ${lang==='ar'?'dir="rtl"':''}>${opts}</select></label>`
      +(other?`<input data-p="${p}" data-fother="1" value="${esc(v)}" placeholder="Exact name, e.g. Roboto Slab" maxlength="40" class="${inp} mt-1 ${bad?'bad':''}" aria-label="Name of the Google font"><p class="text-[10px] ${bad?'text-red-600':'text-gray-500'} mt-0.5">${bad?'Use letters, digits and spaces only (2 to 40 characters).':'Type the name exactly as on fonts.google.com, then leave the box.'}</p>`:'')
      +`</div>`;
  }
  // The effective font of a slot for the preview: the section's own value, else the whole site's, else empty (original)
  function fontEff(key,role,lang){
    const F=T().fonts||{},own=key?((((F.sec||{})[key])||{})[role]||{})[lang]:'',all=(((F.all||{})[role])||{})[lang];
    return own||all||'';
  }
  function fontPrev(key){
    TH().fontLink(T(),'khip-fonts-admin');
    const cell=lang=>{
      const h=TH().fontStack(fontEff(key,'head',lang),lang,'head')||(lang==='ar'?"'Noto Naskh Arabic','Cairo',serif":'"Cormorant Garamond",Georgia,serif');
      const b=TH().fontStack(fontEff(key,'body',lang),lang,'body')||(lang==='ar'?"'Cairo','Segoe UI',Tahoma,Arial,sans-serif":'Jost,system-ui,sans-serif');
      return `<div ${lang==='ar'?'dir="rtl" lang="ar"':''} class="p-4 bg-white"><p style="font-family:${h};font-size:1.7rem;line-height:1.25;font-weight:500;color:${TH().palette(T()).title}">${FSAMPLE[lang].h}</p><p style="font-family:${b};font-size:.95rem;line-height:1.7;font-weight:300;color:${TH().palette(T()).text}" class="mt-1">${FSAMPLE[lang].p}</p></div>`;
    };
    return `<div class="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">${cell('en')+cell('ar')}</div>`;
  }
  function fontFields(base,sec){
    return `<div class="grid sm:grid-cols-2 gap-3"><span class="text-[10px] font-extrabold tracking-wider text-brand-700">EN</span><span lang="ar" class="text-[10px] font-extrabold tracking-wider text-amber-800">عربي</span></div>`
      +FSLOTS.map(([r,n])=>`<div class="grid sm:grid-cols-2 gap-3">${fontPick(base,r,'en',n+' (English)',sec)}${fontPick(base,r,'ar',n+' (Arabic)',sec)}</div>`).join('');
  }
  function viewFonts(){
    T();
    $('view').innerHTML=
      card('Fonts','The letters of the whole site: <b>Headings</b> (titles, card titles, questions) and <b>Text</b> (everything else), set separately for English and Arabic. Leave a box on its first choice to keep the original fonts. The fonts are free Google Fonts; only the ones you choose are loaded by visitors.',
        fontFields(fontBase(''),false)+`<div><span class="text-xs font-bold text-gray-700">Preview</span><div class="mt-1 rounded-xl overflow-hidden border border-gray-200" data-fprev="all">${fontPrev('')}</div></div>`
        +`<p class="text-[11px] text-gray-500">Logos, the KHIP word mark and the icons keep their own look. A very decorative font can be hard to read in small text: choose a plain one for <b>Text</b>.</p>`,
        reset('reset-fonts-all','Reset all'))
      +seeSections('Fonts');
  }
  function secFonts(key){
    const s=((T().fonts||{}).sec||{})[key]||{},on=!!Object.values(s).some(o=>o&&Object.values(o).some(v=>v));
    return det('t:'+key,'Fonts',on,'Own fonts','Same as the site',
      fontFields(fontBase(key),true)+`<div><span class="text-xs font-bold text-gray-700">Preview</span><div class="mt-1 rounded-xl overflow-hidden border border-gray-200" data-fprev="${esc(key)}">${fontPrev(key)}</div></div>`
      +`<div><button type="button" data-lk="reset-fonts-sec" data-k="${key}" class="text-xs bg-gray-100 hover:bg-gray-200 font-bold px-3 py-2 rounded-xl"><i class="fas fa-rotate-left"></i> Same as the whole site</button></div>`);
  }
  /* ---------- Section header (control phase 2): hide or show the title, icon, thin line and WhatsApp button of one section ---------- */
  const HEADLBL={title:['Title','Hide the title. It stays in the page for search engines and screen readers; only the look disappears.'],icon:['Icon','Hide the icon above or beside the title.'],rule:['Thin line','Hide the thin gold line under the title.'],wa:['WhatsApp button','Hide the "WhatsApp us" button at the end of the page.']};
  const BK=k=>window.KLAYOUT?KLAYOUT.base(k):k;          // a copy of a section ("home-faq-c2") has the parts and columns of its section
  function secHead(key){
    const parts=(((window.KSEC||{}).parts)||{})[BK(key)]||[];
    if(!parts.length)return '';
    const s=((T().secHead||{})[key])||{},hid=parts.filter(k=>s[k]===true);
    const one=k=>`<label class="flex items-start gap-2 text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-pointer"><input type="checkbox" data-p="theme.secHead.${key}.${k}" data-bool="1" data-lkv="1" ${s[k]===true?'checked':''} class="mt-0.5"><span>${esc(HEADLBL[k][0])}: <span class="font-normal text-gray-600">${esc(HEADLBL[k][1])}</span></span></label>`;
    return det('h:'+key,'Section header',hid.length>0,hid.length+' hidden','All shown',`<div class="grid sm:grid-cols-2 gap-3">${parts.map(one).join('')}</div><p class="text-[11px] text-gray-500">Tick a box to hide that part on the website, in English and Arabic. Untick it to show it again. Only the parts this section has are listed.</p><div><button type="button" data-lk="reset-sec-head" data-k="${key}" class="text-xs bg-gray-100 hover:bg-gray-200 font-bold px-3 py-2 rounded-xl"><i class="fas fa-rotate-left"></i> Show everything</button></div>`);
  }
  /* ---------- Columns per row (control phase 3): how many cards across on tablet and desktop ---------- */
  function secCols(key){
    const def=((window.KSEC||{}).cols||{})[BK(key)];
    if(!def)return '';
    const s=((T().cols||{})[key])||{},base=`theme.cols.${key}.`,on=!!(s.t||s.d);
    const built=(n,l)=>l||(n?String(n):'cards of a fixed width');
    const sel=(k,label,sub,n,l)=>{const v=val(base+k);return `<label class="block text-xs font-bold">${esc(label)} <span class="font-normal text-gray-500">(${esc(sub)})</span><select data-p="${base+k}" data-lkv="1" class="${inp} mt-1"><option value="" ${v===''?'selected':''}>As designed (${esc(built(n,l))})</option>${[1,2,3,4].map(n=>`<option value="${n}" ${v===String(n)?'selected':''}>${n} across</option>`).join('')}</select></label>`};
    return det('n:'+key,'Columns per row',on,'Own columns','As designed',
      grid(sel('t','Tablet','768 to 1023 px',def.t)+sel('d','Desktop','1024 px and up',def.d,def.dl))
      +`<p class="text-[11px] text-gray-500">How many ${BK(key)==='about-team'?'team members':BK(key)==='home-news'?'news cards':'cards'} sit side by side. Phones keep one at a time or one above the other. The columns share the section width, so 4 across is narrow when the section width is small (General, Colors, Section width).${BK(key)==='home-news'||BK(key)==='about-team'?' If there are more than fit, the row slides.':''}</p>`
      +`<div><button type="button" data-lk="reset-sec-cols" data-k="${key}" class="text-xs bg-gray-100 hover:bg-gray-200 font-bold px-3 py-2 rounded-xl"><i class="fas fa-rotate-left"></i> As designed</button></div>`);
  }
  /* ---------- Parts of this section (layout.js): hide or show one part of a section (logo, text, buttons, cards, map, ...) ---------- */
  function secParts(key){
    const parts=((window.KLAYOUT||{}).PARTS||{})[BK(key)]||[];
    if(!parts.length)return '';
    const s=((T().parts||{})[key])||{},hid=parts.filter(([k])=>s[k]===true);
    const one=([k,l,w])=>`<label class="flex items-start gap-2 text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-pointer"><input type="checkbox" data-p="theme.parts.${key}.${k}" data-bool="1" data-lkv="1" ${s[k]===true?'checked':''} class="mt-0.5"><span>${esc(l)}${w?`: <span class="font-normal text-gray-600">${esc(w)}</span>`:''}</span></label>`;
    return det('p:'+key,'Parts of this section',hid.length>0,hid.length+' hidden','All shown',`<div class="grid sm:grid-cols-2 gap-3">${parts.map(one).join('')}</div><p class="text-[11px] text-gray-500">Tick a box to hide that part on the website, in English and Arabic. Untick it to show it again. What is written for a hidden part is kept.</p><div><button type="button" data-lk="reset-sec-parts" data-k="${key}" class="text-xs bg-gray-100 hover:bg-gray-200 font-bold px-3 py-2 rounded-xl"><i class="fas fa-rotate-left"></i> Show every part</button></div>`);
  }
  /* ---------- IP service buttons (home Services only): the colours of all the Patents / Trademarks / ... buttons ---------- */
  function secBtns(key){
    if(BK(key)!=='home-services')return '';
    const base=`theme.secBtns.${key}.`,s=(T().secBtns||{})[key]||{},on=Object.keys(s).some(k=>s[k]);
    return det('s:'+key,'IP service buttons',on,'Own colors','As designed',
      grid(cref(base+'bg','Button color',{none:'As designed (no color)'})+cref(base+'text','Text and icon color',{none:'As designed (white or dark on a color)'})
        +cref(base+'border','Border color',{none:'As designed'})+cref(base+'hbg','Color when pointed at or tapped',{none:'As designed (dark)'})
        +cref(base+'htext','Text color when pointed at or tapped',{none:'As designed (white or dark)'}))
      +`<p class="text-[11px] text-gray-500">The buttons inside the IP Services card (Patents, Trademarks, ...). One button can have its own colors: open that service in the list above, <b>Button colors</b>.</p>`
      +`<div><button type="button" data-lk="reset-sec-btns" data-k="${key}" class="text-xs bg-gray-100 hover:bg-gray-200 font-bold px-3 py-2 rounded-xl"><i class="fas fa-rotate-left"></i> As designed</button></div>`);
  }
  /* ---------- Icons before titles: size (or fit to the title), colour, circle colour, above or beside the title ----------
     theme.iconsAll (General, Icons) for every section; theme.icons.<section> on top of it (Sections, Look of this section). */
  const tiSet=o=>!!o&&Object.keys(o).some(k=>{const v=o[k];return v!==''&&v!=null&&v!==false&&!(k==='size'&&+v===100)});
  function iconFields(base,sec){
    const o=get(D,base.slice(0,-1))||{},A=T().iconsAll||{},size=o.size,mode=size==='fit'?'fit':(size===''||size==null)?'':'custom';
    const same=sec&&tiSet(A)?'Same as all sections':'As designed';
    const pos=o.pos==='beside'||o.pos==='above'?o.pos:(o.inline===true?'beside':'');
    return `<div class="grid sm:grid-cols-2 gap-3">
      <label class="block text-xs font-bold">Size<select data-tisize="${base}size" class="${inp} mt-1">
        <option value="" ${mode===''?'selected':''}>${same}</option>
        <option value="fit" ${mode==='fit'?'selected':''}>Fit to the title (the height of one line of the title)</option>
        <option value="custom" ${mode==='custom'?'selected':''}>Choose a size</option></select></label>
      <label class="block text-xs font-bold">Position<select data-p="${base}pos" data-lkv="1" class="${inp} mt-1">
        <option value="" ${pos===''?'selected':''}>${sec&&tiPos0(A)?'Same as all sections':'Above the title (as designed)'}</option>
        <option value="beside" ${pos==='beside'?'selected':''}>Beside the title, on one line</option>
        ${sec?`<option value="above" ${pos==='above'?'selected':''}>Above the title (as designed)</option>`:''}</select></label>
    </div>`
    +(mode==='custom'?slider(base+'size','Size of the icon',50,150,5,'%',100):'')
    +grid(cref(base+'color','Icon color',{none:sec&&A.color?'Same as all sections':'As designed'})+cref(base+'bg','Circle color (icons that sit in a circle)',{none:sec&&A.bg?'Same as all sections':'As designed'}))
    +`<div class="flex flex-wrap gap-2"><button type="button" data-lk="ti-oneline" data-b="${base}" class="text-xs bg-brand-600 hover:bg-brand-700 text-white font-bold px-3 py-2 rounded-xl"><i class="fas fa-grip-lines"></i> Small, on one line with the title</button>`
    +`<button type="button" data-lk="${sec?'reset-sec-icons':'reset-icons-all'}" data-k="${sec||''}" class="text-xs bg-gray-100 hover:bg-gray-200 font-bold px-3 py-2 rounded-xl"><i class="fas fa-rotate-left"></i> ${sec&&tiSet(A)?'Same as all sections':'As designed'}</button></div>`
    +`<p class="text-[11px] text-gray-500"><b>Fit to the title</b> makes each icon as tall as one line of its title (smaller on a small title, on phones too), so with <b>Beside the title</b> the icon and the title sit neatly on one line.</p>`;
  }
  const tiPos0=o=>o&&(o.pos==='beside'||o.inline===true);
  function secIcons(key){
    const what=(TH().TI_SECS||{})[BK(key)];if(!what)return '';
    const s=(T().icons||{})[key]||{};
    return det('i:'+key,'Icons before titles',tiSet(s),'Own look',tiSet(T().iconsAll)?'Same as all sections':'As designed',
      `<p class="text-[11px] text-gray-500">${esc(what)}. The settings for all sections are in <b>General, Icons</b>; what you set here is for this section only.</p>`+iconFields(`theme.icons.${key}.`,key));
  }
  function viewIcons(){
    T();
    const list=Object.keys(TH().TI_SECS||{}).map(k=>{const s=(TH().SECTIONS.find(x=>x[0]===k)||[k,k])[1];return `<li>${esc(s)}</li>`}).join('');
    $('view').innerHTML=card('Icons before titles','The icons that sit before a title: the round icons above card titles (Services, Advantages, the Details cards of the service pages), the icon above the title of Patents, Trademarks and Translation, the fact cards, the service tiles and links. Set here for <b>every section</b>; a single section can be set differently in <b>Sections</b>, <b>Look of this section</b>.',
      iconFields('theme.iconsAll.','')+`<details class="text-xs text-gray-600"><summary class="cursor-pointer font-bold">Where these icons are</summary><ul class="list-disc ps-5 mt-1 space-y-0.5">${list}</ul></details>`)
      +seeSections('Icons before titles');
  }
  // the Size list: "Choose a size" shows the slider (starting at 80 %), "Fit to the title" saves "fit"
  document.addEventListener('change',e=>{
    const p=e.target.dataset&&e.target.dataset.tisize;if(!p||!D)return;
    const v=e.target.value;T();
    if(v==='')unset(p);else if(v==='fit')set(D,p,'fit');else{const n=parseFloat(get(D,p));set(D,p,isFinite(n)?String(n):'80')}
    mark();view();
  });
  const SECKEYS=()=>TH().SECTIONS.map(x=>x[0]);
  function hasLook(key){
    const t=T(),has=o=>!!o&&Object.values(o).some(v=>v&&typeof v==='object'?has(v):v!==''&&v!=null&&v!==false);
    if(key==='home-hero')return has((t.imgfx||{}).hero);
    return ['color','image'].includes(((t.sections||{})[key]||{}).mode)||has((t.secCards||{})[key])||has((t.secHead||{})[key])||has((t.parts||{})[key])||has((t.secBtns||{})[key])||has(Object.fromEntries(Object.entries((t.icons||{})[key]||{}).filter(([k,v])=>!(k==='size'&&+v===100))))||has((t.cols||{})[key])||has(((t.align||{}).sec||{})[key])||has(((t.imgfx||{}).sec||{})[key])||has(((t.anim||{}).sec||{})[key])||has(((t.fonts||{}).sec||{})[key]);
  }
  function secLook(key){
    const wrap=(intro,body,extra='')=>`<div class="bg-white p-4 rounded-2xl border border-gray-200 space-y-3"><div class="flex items-start justify-between gap-3"><div><h3 class="font-extrabold text-base">Look of this section</h3><p class="text-xs text-gray-600 mt-0.5">${intro}</p></div>${extra}</div>${body}</div>`;
    if(key==='home-hero'){
      const s=(T().imgfx||{}).hero||{},on=Object.keys(s).some(k=>s[k]!==''&&s[k]!=null);
      return wrap('The slider is not a section of the page, so only its pictures can be styled here. Its height and controls are in the cards above. Anything left on its default follows <b>General, Picture effects</b>.',
        det('f:hero','Photo effect',on,'Own effect','Same as all pictures',fxBody('theme.imgfx.hero.','hero',null,'Same as all pictures')+`<div><button type="button" data-lk="reset-fx-hero" class="text-xs bg-gray-100 hover:bg-gray-200 font-bold px-3 py-2 rounded-xl"><i class="fas fa-rotate-left"></i> Same as all pictures</button></div>`));
    }
    if(!SECKEYS().includes(BK(key)))return '';
    const bg=bgInfo(key);
    return wrap('Background, header parts, parts of the section, columns, buttons, icons, cards, fonts, text alignment, photo effect and animation of this section only. Whatever you leave on its default follows the site-wide settings in <b>General</b> (Colors, Cards, Fonts, Text alignment, Picture effects, Animation). Cards settings only matter where the section has cards.',
      det('b:'+key,'Background',bg.mode!=='default',bg.badge,'Default',bg.body)
      +secHead(key)+secParts(key)+secCols(key)+secCards(key)+secBtns(key)+secIcons(key)+secFonts(key)+secAlign(key)+secFx(key)+secAx(key),
      hasLook(key)?`<button type="button" data-lk="reset-sec-look" data-k="${key}" class="text-xs bg-gray-100 hover:bg-gray-200 font-bold px-3 py-2 rounded-xl flex-shrink-0" title="Remove every look setting of this section"><i class="fas fa-rotate-left"></i> Reset this section</button>`:'');
  }

  /* ---------- tabs registry (later phases add to it) ---------- */

  const tabs={icons:viewIcons,fonts:viewFonts,header:viewHeader,cards:viewCards,align:viewAlign,logos:viewLogos,menu:viewMenu,imgfx:viewFx,anim:viewAnim,motion:viewMotion};
  const previews={fonts:()=>{document.querySelectorAll('[data-fprev]').forEach(b=>{b.innerHTML=fontPrev(b.dataset.fprev==='all'?'':b.dataset.fprev)})},imgfx:()=>{document.querySelectorAll('[data-fxprev]').forEach(b=>{const [g,k]=b.dataset.fxprev.split(':');b.innerHTML=fxPrev(g==='all'?'news':g,k)})},menu:()=>{const a=$('lk-menu');if(a)a.innerHTML=menuPrev()},header:()=>{const a=$('lk-hdr'),b=$('lk-bar');if(a)a.innerHTML=hdrPrev();if(b)b.innerHTML=barPrev()},cards:()=>{const a=$('lk-cards');if(a)a.innerHTML=cardsPrev()},align:()=>{const a=$('lk-align');if(a)a.innerHTML=alignPrev()},logos:()=>{['header','home','about'].forEach(k=>{const a=$('lk-lg-'+k);if(a)a.innerHTML=logoPrev(k)})}};

  /* ---------- saving: drop empty values so the data file stays small ---------- */
  function clean(t){
    if(!t)return;
    const prune=o=>{
      if(!o||typeof o!=='object')return;
      for(const k of Object.keys(o)){
        if(o[k]&&typeof o[k]==='object'&&!Array.isArray(o[k]))prune(o[k]);
        const v=o[k];
        if(v===''||v==null||(v&&typeof v==='object'&&!Array.isArray(v)&&!Object.keys(v).length))delete o[k];
      }
    };
    if(t.secHead){Object.keys(t.secHead).forEach(k=>{const s=t.secHead[k]||{};Object.keys(s).forEach(p=>{if(s[p]!==true)delete s[p]})})}      // only "hide" is saved
    const tiClean=s=>{if(!s)return;if(s.inline===true&&!s.pos)s.pos='beside';delete s.inline;if(s.pos!=='beside'&&s.pos!=='above')delete s.pos;if(s.size!=null&&s.size!=='fit'&&(s.size===''||+s.size===100))delete s.size};
    if(t.icons)Object.values(t.icons).forEach(tiClean);
    tiClean(t.iconsAll);if(t.iconsAll&&t.iconsAll.pos==='above')delete t.iconsAll.pos;
    if(t.parts){Object.keys(t.parts).forEach(k=>{const s=t.parts[k]||{};Object.keys(s).forEach(p=>{if(s[p]!==true)delete s[p]})})}
    if(t.layout){
      const Ly=t.layout;
      if(Ly.hide)Object.keys(Ly.hide).forEach(k=>{if(Ly.hide[k]!==true)delete Ly.hide[k]});
      if(Ly.order)Object.keys(Ly.order).forEach(p=>{if(!Array.isArray(Ly.order[p])||!Ly.order[p].length)delete Ly.order[p]});
      ['hide','order','copies'].forEach(k=>{if(Ly[k]&&!Object.keys(Ly[k]).length)delete Ly[k]});
      if(!Object.keys(Ly).length)delete t.layout;
    }
    ['header','bar','wa','cards','secCards','secHead','parts','secBtns','icons','iconsAll','cols','align','logos','menu','imgfx','anim','motion','fonts'].forEach(k=>{if(t[k]){prune(t[k]);if(!Object.keys(t[k]).length)delete t[k]}});
    // a font name that is not allowed is dropped rather than saved
    const okF=o=>{if(!o||typeof o!=='object')return;['head','body'].forEach(r=>['en','ar'].forEach(l=>{if(o[r]&&o[r][l]&&!TH().fontOk(o[r][l]))delete o[r][l]}))};
    if(t.fonts){okF(t.fonts.all);Object.values(t.fonts.sec||{}).forEach(okF);[t.fonts].concat([t.fonts.all],Object.values(t.fonts.sec||{})).forEach(o=>{if(o)prune(o)});if(!Object.keys(t.fonts).length)delete t.fonts}
    if(t.menu&&t.menu.keepNav!==true)delete t.menu.keepNav;
    if(t.menu&&t.menu.mode!=='both'){['side','keepNav','bg','text','overlay','width'].forEach(k=>delete t.menu[k])}
    // an opacity with no color chosen means nothing
    [['header','bg'],['wa','bg'],['cards','bg']].forEach(([k,c])=>{if(t[k]&&!t[k][c]&&t[k].opacity!=null)delete t[k].opacity});
    Object.keys(t.secCards||{}).forEach(k=>{const s=t.secCards[k];if(s&&!s.bg&&s.opacity!=null)delete s.opacity});
  }

  /* ---------- events ---------- */
  document.addEventListener('change',e=>{
    const p=e.target.dataset&&e.target.dataset.cref;if(!p||!D)return;
    const v=e.target.value;
    if(v==='')unset(p);else if(v==='__custom')set(D,p,TH().resolve(val(p),D.theme)||'#cccccc');else set(D,p,v);
    mark();view();
  });
  // font pickers: "Another Google font" shows a name box, pre-filled with an example
  document.addEventListener('change',e=>{
    const p=e.target.dataset&&e.target.dataset.fsel;if(!p||!D)return;
    const v=e.target.value;T();
    if(v==='')unset(p);else if(v==='__other')set(D,p,'Roboto');else set(D,p,v);
    mark();view();
  });
  document.addEventListener('change',e=>{if(e.target.dataset&&e.target.dataset.fother&&D)setTimeout(()=>{view()},0)});   // a typed font name: load it and redraw the previews
  document.addEventListener('input',e=>{
    const t=e.target;if(!D||!t.dataset)return;
    if(t.dataset.p&&t.type==='range'){document.querySelectorAll(`[data-lkout="${t.dataset.p}"]`).forEach(o=>{o.textContent=t.value+(o.dataset.unit||'')})}
    if(t.dataset.p&&/^theme\./.test(t.dataset.p))setTimeout(()=>Object.values(previews).forEach(f=>f()),0);       // after admin.html has stored the value
  });
  document.addEventListener('change',e=>{if(e.target.dataset&&e.target.dataset.lkv&&D)setTimeout(view,0)});   // alignment lists: refresh the "Own alignment" badges
  document.addEventListener('toggle',e=>{const d=e.target;if(d&&d.dataset&&d.dataset.lkd){d.open?open.add(d.dataset.lkd):open.delete(d.dataset.lkd)}},true);
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-lk]');if(!b||!D)return;
    const a=b.dataset.lk,t=T();
    const wipe=(keys,msg)=>{if(confirm(msg)){keys.forEach(k=>delete t[k]);mark();view()}};
    if(a==='reset-header')wipe(['header'],'Set the header back to its original colors?');
    else if(a==='reset-bar')wipe(['bar'],'Set the bottom bar back to its original colors?');
    else if(a==='reset-wa')wipe(['wa'],'Set the WhatsApp box back to its original colors?');
    else if(a==='reset-cards')wipe(['cards'],'Set the cards of the whole site back to the original colors? Colors set for a single section are kept.');
    else if(a==='reset-align'){if(confirm('Set the site-wide text alignment back to the original? Alignment set for a single section is kept.')){if(t.align)delete t.align.all;mark();view()}}
    else if(a==='reset-align-sec'){if(t.align&&t.align.sec)delete t.align.sec[b.dataset.k];mark();view()}
    else if(a.startsWith('reset-logo-')){const k=a.slice(11);if(confirm('Go back to the original logo and size?')){if(t.logos)delete t.logos[k];mark();view()}}
    else if(a==='logo-preset'){const w=LOGO_PRESETS[b.dataset.k][b.dataset.s];t.logos=t.logos||{};const o=t.logos[b.dataset.k]=t.logos[b.dataset.k]||{};['m','t','d'].forEach((d,i)=>o[d]=String(w[i]));mark();view()}
    else if(a==='reset-fx-all'){if(confirm('Remove the opacity and color filter of every picture group? Effects set for a single section are kept.')){if(t.imgfx){['all','hero','news','team','sections'].forEach(g=>delete t.imgfx[g])}mark();view()}}
    else if(a.startsWith('reset-fx-')&&a!=='reset-fx-sec'){const g=a.slice(9);if(t.imgfx)delete t.imgfx[g];mark();view()}
    else if(a==='reset-fx-sec'){if(t.imgfx&&t.imgfx.sec)delete t.imgfx.sec[b.dataset.k];mark();view()}
    else if(a==='reset-fonts-all'){if(confirm('Go back to the original fonts of the site? Fonts set for a single section are kept.')){if(t.fonts)delete t.fonts.all;mark();view()}}
    else if(a==='reset-fonts-sec'){if(t.fonts&&t.fonts.sec)delete t.fonts.sec[b.dataset.k];mark();view()}
    else if(a==='reset-mo-map'){if(t.motion)delete t.motion.map;mark();view()}
    else if(a==='reset-mo-all')wipe(['motion'],'Remove all map and logo animation settings?');
    else if(a==='reset-mo-logo'){if(t.motion&&t.motion.logos)delete t.motion.logos[b.dataset.k];mark();view()}
    else if(a==='lg-play')lgRun(b);
    else if(a==='reset-ax-all'){if(confirm('Remove the site-wide card and text animation? Animation set for a single section is kept.')){if(t.anim)delete t.anim.all;mark();view()}}
    else if(a==='reset-ax-sec'){if(t.anim&&t.anim.sec)delete t.anim.sec[b.dataset.k];mark();view()}
    else if(a==='ax-play')axRun(b);
    else if(a==='reset-menu')wipe(['menu'],'Set the menu back to the original (links in the header, bottom bar)?');
    else if(a==='reset-sec'){if(t.secCards)delete t.secCards[b.dataset.k];mark();view()}
    else if(a==='reset-sec-cols'){if(t.cols)delete t.cols[b.dataset.k];mark();view()}
    else if(a==='reset-sec-head'){if(t.secHead)delete t.secHead[b.dataset.k];mark();view()}
    else if(a==='reset-sec-btns'){if(t.secBtns)delete t.secBtns[b.dataset.k];mark();view()}
    else if(a==='reset-sec-icons'){if(t.icons)delete t.icons[b.dataset.k];mark();view()}
    else if(a==='reset-icons-all'){if(confirm('Set the icons before titles back to their original look? Icons set for a single section are kept.')){delete t.iconsAll;mark();view()}}
    else if(a==='ti-oneline'){const p=b.dataset.b;set(D,p+'size','fit');set(D,p+'pos','beside');mark();view()}
    else if(a==='reset-sec-parts'){if(t.parts)delete t.parts[b.dataset.k];mark();view()}
    else if(a==='reset-sec-look'){const k=b.dataset.k;if(confirm('Remove the background, hidden header parts, hidden parts, button and icon settings, columns, cards colors, fonts, text alignment, photo effect and animation set for this section? It will follow the site-wide settings.')){if(t.sections)delete t.sections[k];[['secCards'],['secHead'],['parts'],['secBtns'],['icons'],['cols'],['align','sec'],['imgfx','sec'],['anim','sec'],['fonts','sec']].forEach(([a1,a2])=>{const o=a2?(t[a1]||{})[a2]:t[a1];if(o)delete o[k]});mark();view()}}
  });

  return {tabs,clean,previews,secLook,hasLook,cref};
})();

window.ALOOK=ALOOK;

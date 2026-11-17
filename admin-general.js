/* KHIP admin: the General page.
   Brand (logos), contact and social links, languages and words (WhatsApp suggestions, news categories, the short
   words of the site), colors, header / bottom bar / menu, the site-wide defaults of the look (cards, text alignment,
   picture effects, animation; one section's own look is set in Sections) and map and logo motion.
   Loaded by admin.html after admin-look.js. Every English text has its Arabic next to it; the Arabic copy is `A`
   in admin.html and is reached with paths that start with "ar:" (see get / set there). */
const AGEN=(()=>{
  const PAGES=[
    ['brand','Brand & logos','fa-signature'],
    ['contact','Contact & social','fa-address-card'],
    ['words','Languages & words','fa-language'],
    ['colors','Colors','fa-palette'],
    ['fonts','Fonts','fa-font'],
    ['menu','Header, bar & menu','fa-bars'],
    ['cards','Cards','fa-clone'],
    ['align','Text alignment','fa-align-justify'],
    ['imgfx','Picture effects','fa-wand-magic-sparkles'],
    ['anim','Animation','fa-film'],
    ['motion','Map & logo motion','fa-earth-africa']
  ];
  const box=(title,intro,body,extra='')=>`<div class="bg-white p-4 rounded-2xl border border-gray-200 space-y-3"><div class="flex items-start justify-between gap-3"><div><h2 class="font-extrabold text-lg">${title}</h2>${intro?`<p class="text-xs text-gray-600 mt-0.5">${intro}</p>`:''}</div>${extra}</div>${body}</div>`;
  const keep=fn=>{fn();return $('view').innerHTML};           // the Look screens draw into #view: take what they drew
  const go=k=>{gsub=k;render()};

  /* ---------- Brand & logos ---------- */
  function brand(){
    const intro=box('Brand','The logos of the site and the colors and fonts that carry the brand. Logos: replace the picture and set its width on phone, tablet and desktop. Colors and fonts are in their own pages.',
      `<div class="flex flex-wrap gap-2"><button type="button" data-gs="colors" class="text-xs bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold px-3 py-2 rounded-xl"><i class="fas fa-palette"></i> Colors</button>${PAGES.some(p=>p[0]==='fonts')?'<button type="button" data-gs="fonts" class="text-xs bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold px-3 py-2 rounded-xl"><i class="fas fa-font"></i> Fonts</button>':''}</div>`);
    ALOOK.tabs.logos();
    $('view').insertAdjacentHTML('afterbegin',intro);
  }

  /* ---------- Contact & social ---------- */
  function contact(){
    const fields=CONTACT.map(f=>f[0]==='contact.address'?bi('',[f[0],'Address (one line per row, in each language). Shown on the About page; leave empty to hide it','lines'],[],{rows:3,phAr:'Empty: the English address'}):fld('',f)).join('');
    $('view').innerHTML=box('Contact details & social links','Used everywhere on the site: the About page contact block, the contact buttons on the service pages, the WhatsApp box and the icons in the header. Leave a box empty to hide that item. Social addresses must start with https://.',
      fields+`<h3 class="font-bold text-sm pt-2 border-t border-gray-200">Social media</h3><div class="grid md:grid-cols-2 gap-3">${SOCIAL.map(f=>fld('',f)).join('')}</div>`);
  }

  /* ---------- Languages & words ---------- */
  const WORDS=()=>Object.keys(KLang.DICT.en).filter(k=>typeof KLang.DICT.en[k]==='string'&&k!=='switch_to'&&!(window.AGEN_SKIP&&AGEN_SKIP.has(k)));
  const wordRow=k=>`<div data-w="${esc((KLang.DICT.en[k]+' '+KLang.DICT.ar[k]+' '+k).toLowerCase())}" class="grid md:grid-cols-2 gap-3 py-2 border-b border-gray-100 last:border-0">
    <label class="block min-w-0" data-pane="en"><span class="block text-[10px] text-gray-400 font-mono">${esc(k)}</span><input data-p="ui.${k}" value="${esc((D.ui||{})[k]||'')}" placeholder="${esc(KLang.DICT.en[k])}" aria-label="${esc(k)} (English)" class="${inp}"></label>
    <label class="block min-w-0" data-pane="ar"><span class="block text-[10px] text-transparent select-none">.</span><input data-p="ar:ui.${k}" dir="rtl" value="${esc((A.ui||{})[k]||'')}" placeholder="${esc(KLang.DICT.ar[k])}" aria-label="${esc(k)} (Arabic)" class="${inp}"></label></div>`;
  function catRows(){
    const en=D.newsCategories||[],ar=A.newsCategories||[];
    return `<div><div class="flex items-center justify-between"><span class="text-xs font-bold text-gray-700">News categories (labels)</span><button type="button" data-gs-act="cat-add" class="text-xs bg-[#d9c8a4] hover:bg-[#cdb98f] text-[#1b2433] font-bold px-3 py-1.5 rounded-xl"><i class="fas fa-plus"></i> Add category</button></div>
      <div class="grid md:grid-cols-2 gap-3 mt-1"><span data-pane="en" class="text-[10px] font-extrabold tracking-wider text-brand-700">EN</span><span data-pane="ar" lang="ar" class="text-[10px] font-extrabold tracking-wider text-amber-800 hidden md:block">عربي</span></div>
      <div class="space-y-1.5 mt-1">${en.length?en.map((c,i)=>`<div class="flex items-center gap-2"><div class="grid md:grid-cols-2 gap-2 flex-1 min-w-0"><input data-pane="en" data-p="newsCategories.${i}" value="${esc(c)}" aria-label="Category ${i+1} (English)" class="${inp}"><input data-pane="ar" data-p="ar:newsCategories.${i}" dir="rtl" value="${esc(ar[i]||'')}" placeholder="Empty: the English label is shown" aria-label="Category ${i+1} (Arabic)" class="${inp}"></div><button type="button" data-gs-act="cat-del" data-i="${i}" aria-label="Delete category" class="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex-shrink-0"><i class="fas fa-trash text-xs"></i></button></div>`).join(''):'<p class="text-xs text-gray-500">No categories yet.</p>'}</div>
      <p class="text-[11px] text-gray-500 mt-1">Each article picks one of these labels (News tab). Renaming a label does not rename it on articles that already use it.</p></div>`;
  }
  function words(){
    const ws=WORDS();
    $('view').innerHTML=box('Languages','',langCard())
      +box('WhatsApp box suggestions','The lines that are typed, one after another, into the message box at the bottom of every page.',
        bi('',['chatPrompts','Suggestions (one per line)','lines'],[],{rows:5,phAr:KLang.DICT.ar.prompts.join('\n'),phEn:''}))
      +box('News',"",catRows())
      +(KSEC.menu.length?box('Menu labels','The links in the header of the About, Patents, Trademarks and Translation pages. The grey text is the built-in wording: leave a box empty to keep it.',`<div class="space-y-3">${KSEC.menu.map(ASEC.txRow).join('')}</div>`):'')
      +box('Browser tab titles','The title shown on the browser tab and in search results, one per page.',`<div class="space-y-3">${KSEC.titles.map(ASEC.txRow).join('')}</div>`)
      +`<details class="bg-white rounded-2xl border border-gray-200 shadow-sm" open><summary class="flex items-center gap-2 p-3 cursor-pointer"><i class="fas fa-chevron-right chev text-[10px] text-gray-400"></i><span class="flex-1 font-bold text-sm">Short words of the site (${ws.length})</span></summary>
        <div class="p-4 pt-2 border-t"><p class="text-xs text-gray-600 mb-2">Menu, buttons, headings and labels. The grey text is the built-in wording: leave a box empty to keep it, or type your own to replace it. <b>{x}</b> is replaced automatically by a name or number.</p>
        <input type="search" data-wfilter="1" placeholder="Search the words" aria-label="Search the words" class="${inp} mb-2"><div id="w-rows">${ws.map(wordRow).join('')}</div></div></details>`;
  }

  /* ---------- Colors, header / bar / menu, motion: the existing screens ---------- */
  const colors=()=>viewColors();
  function menu(){
    const a=keep(ALOOK.tabs.header),b=keep(ALOOK.tabs.menu);
    $('view').innerHTML=a+b;
  }
  const motion=()=>ALOOK.tabs.motion();
  const cards=()=>ALOOK.tabs.cards(),align=()=>ALOOK.tabs.align(),imgfx=()=>ALOOK.tabs.imgfx(),anim=()=>ALOOK.tabs.anim();   // site-wide defaults; one section's own look is in Sections

  const RENDER={brand,contact,words,colors,fonts:()=>ALOOK.tabs.fonts(),menu,cards,align,imgfx,anim,motion};
  function nav(){
    $('subnav').innerHTML=PAGES.map(([k,n,i])=>`<button type="button" data-gs="${k}" class="text-xs font-bold px-3.5 py-2 rounded-xl ${k===gsub?'bg-gray-900 text-white':'bg-white border border-gray-200 hover:bg-gray-100'}"><i class="fas ${i}"></i> ${n}</button>`).join('');
  }
  function render(){
    if(!RENDER[gsub])gsub='brand';
    nav();RENDER[gsub]();
    if(window.KPV)KPV.sync();
  }
  const add=(k,n,i,fn)=>{PAGES.push([k,n,i]);RENDER[k]=fn};

  /* ---------- events ---------- */
  document.addEventListener('click',e=>{
    const g=e.target.closest('[data-gs]');if(g&&D){go(g.dataset.gs);return}
    const b=e.target.closest('[data-gs-act]');if(!b||!D)return;
    const a=b.dataset.gsAct,i=+b.dataset.i;
    if(a==='cat-add'){(D.newsCategories=D.newsCategories||[]).push('');(A.newsCategories=A.newsCategories||[]).push('');mark();view();document.querySelectorAll('[data-p^="newsCategories."]').forEach((x,n,all)=>{if(n===all.length-2)x.focus()})}
    else if(a==='cat-del'){const c=(D.newsCategories||[])[i];if(confirm(`Delete the category "${c||'(empty)'}"? Articles that use it keep the label.`)){D.newsCategories.splice(i,1);(A.newsCategories||[]).splice(i,1);mark();view()}}
  });
  document.addEventListener('input',e=>{
    if(!e.target.dataset||!e.target.dataset.wfilter)return;
    const v=e.target.value.trim().toLowerCase();
    document.querySelectorAll('#w-rows [data-w]').forEach(r=>r.classList.toggle('hidden',!!v&&!r.dataset.w.includes(v)));
  });

  return {render,add,pages:PAGES,box};
})();
window.AGEN=AGEN;

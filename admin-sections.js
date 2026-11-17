/* KHIP admin: the Sections page.
   Every section of every page of the site, in the order of the page. Opening a section shows its content,
   English on the left and Arabic on the right: its fixed texts, its lists (slides, countries, services,
   articles, quotes, team) and its FAQ, then "Look of this section" (background, cards, text alignment, photo effect,
   animation; drawn by ALOOK.secLook in admin-look.js). Which fixed text sits in which section comes from sections-map.js,
   which was generated from the pages themselves (data-tx keys).
   Loaded by admin.html after sections-map.js. Uses the helpers of admin.html: D, A, $, esc, inp, fld, bi,
   listHtml, items, faqBody, heroCard, mark, tabs, view. */
const ASEC=(()=>{
  const DI=KLang.DICT;
  const PAGES=[['home','Home','index.html'],['about','About','about.html'],['patents','Patents','patents.html'],['trademarks','Trademarks','trademarks.html'],['translation','Translation','translation.html']];
  const S=(key,page,label,o={})=>Object.assign({key,page,label},o);
  const svcSec=(p,n)=>[S(`${p}-intro`,p,'Introduction'),S(`${p}-details`,p,'Details',{svcpage:`${p}.html`}),S(`${p}-faq`,p,'FAQ',{faq:p}),S(`${p}-contact`,p,'Contact',{contact:1})];
  const SECS=[
    S('home-hero','home','Slider',{list:'carousel',hero:1,id:'',desc:'The big pictures that change by themselves at the top of the home page.'}),
    S('home-video','home','Video',{video:'home',id:'video',desc:'A YouTube video with optional text. Starts right under the slider; you can move it after any other section.'}),
    S('home-about','home','Logo and About text',{fields:[['aboutMainText','About text (next to the logo)','area',{rows:6}],['about','Short tagline (used only when the About text is empty)']],dict:['more'],logo:'home',desc:'The logo and the About text under the slider.'}),
    S('home-jurisdictions','home','Regional map',{dict:['cov_title','cov_intro','view_req'],list:'jurisdictions',desc:'The map of the countries. The country cards below are also used on the About page.'}),
    S('home-services','home','Services',{dict:['svc_title','svc_ip'],fields:[['ipServicesText','Short text of the "IP Services" card (empty: the built-in sentence)','area',{rows:3,phEn:DI.en.svc_ip_text,phAr:DI.ar.svc_ip_text}]],list:'services',desc:'Two wide cards: IP Services (Patents, Trademarks) and Translation.'}),
    S('home-news','home','Latest news',{dict:['news_title','related'],list:'news',desc:'News cards and the article pop-up.'}),
    S('home-testimonials','home','Client endorsements',{dict:['testi_title'],list:'testimonials',desc:'One quote at a time.'}),
    S('home-faq','home','FAQ',{faq:'home'}),
    S('about-intro','about','About KHIP',{logo:'about'}),
    S('about-video','about','Video',{video:'about',id:'video',desc:'A YouTube video with optional text. Starts after the first paragraph of the About text; you can move it elsewhere.'}),
    S('about-map','about','Jurisdictions',{list:'jurisdictions',desc:'The slider of country cards. The same countries appear on the map of the home page.'}),
    S('about-value','about','KHIP Value'),
    S('about-quote','about','Quote'),
    S('about-advantages','about','Advantages'),
    S('about-team','about','Our team',{list:'employees'}),
    S('about-faq','about','FAQ',{faq:'about'}),
    S('about-contact','about','Contact',{contact:1}),
    ...svcSec('patents'),...svcSec('trademarks'),...svcSec('translation')
  ];
  window.AGEN_SKIP=new Set(SECS.flatMap(s=>s.dict||[]));      // short words that live in a section: not repeated in General
  let secKey='home-hero',secPage='home';
  const sec=()=>SECS.find(s=>s.key===secKey)||SECS[0];
  const info=k=>((window.KSEC||{}).sections||{})[k]||{keys:[],id:''};
  const box=(title,intro,body,extra='')=>`<div class="bg-white p-4 rounded-2xl border border-gray-200 space-y-3"><div class="flex items-start justify-between gap-3"><div><h3 class="font-extrabold text-base">${title}</h3>${intro?`<p class="text-xs text-gray-600 mt-0.5">${intro}</p>`:''}</div>${extra}</div>${body}</div>`;

  /* ---------- one wording row: English | Arabic, the built-in wording shown as the hint ---------- */
  function row(label,code,p,en,ar,note){
    const long=en.length>110?4:en.length>45?2:1,mk=(path,rtl,ph)=>long===1
      ?`<input data-p="${path}" ${rtl?'dir="rtl"':''} value="${esc(get(D,path))}" placeholder="${esc(ph)}" aria-label="${esc(label)} ${rtl?'(Arabic)':'(English)'}" class="${inp}">`
      :`<textarea data-p="${path}" ${rtl?'dir="rtl"':''} rows="${long}" placeholder="${esc(ph)}" aria-label="${esc(label)} ${rtl?'(Arabic)':'(English)'}" class="${inp}">${esc(get(D,path))}</textarea>`;
    const tag=(t,rtl)=>`<span ${rtl?'lang="ar"':''} class="inline-block text-[10px] font-extrabold tracking-wider px-1.5 py-0.5 rounded mb-1 ${rtl?'bg-amber-100 text-amber-800':'bg-brand-100 text-brand-700'}">${t}</span>`;
    return `<div><span class="text-xs font-bold text-gray-700">${esc(label)} <span class="font-normal text-gray-400 font-mono text-[10px]">${esc(code)}</span>${note?` <span class="font-normal text-[10px] bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">${note}</span>`:''}</span><div class="grid md:grid-cols-2 gap-3 mt-0.5"><div class="min-w-0" data-pane="en">${tag('EN')}${mk(p,false,en)}</div><div class="min-w-0" data-pane="ar">${tag('عربي',true)}${mk('ar:'+p,true,ar)}</div></div></div>`;
  }
  const TAGS={h1:'Heading',h2:'Heading',h3:'Subheading',p:'Text',span:'Label',a:'Link',button:'Button',title:'Browser tab title'};
  function txRow(k){
    const m=(window.KTX||{})[k];if(!m)return '';
    const sh=((KSEC||{}).shared||{})[k],note=sh?`also used in ${sh.length-1} other section${sh.length>2?'s':''}`:'';
    return row(TAGS[(KSEC.tags||{})[k]]||'Text',k,'ui.tx_'+k.replace(/\./g,'_'),m.en,m.ar,note);
  }
  const dictRow=k=>row(k.replace(/_/g,' '),k,'ui.'+k,DI.en[k],DI.ar[k],'');

  /* ---------- video sections (video.js): D.videos.home / D.videos.about; Arabic title, text and link in A.videos ---------- */
  const VPAGES=['home','about'];
  const vget=(p,k,ar)=>String(get(D,(ar?'ar:':'')+`videos.${p}.${k}`)||'').trim();
  function vHint(p){
    const one=(label,u)=>{
      if(!u)return '';
      const r=KVIDEO.parse(u);
      return r?`<span class="inline-flex items-center gap-2 mr-4 mb-1"><img src="https://i.ytimg.com/vi/${r.id}/mqdefault.jpg" alt="" class="w-20 h-11 object-cover rounded bg-gray-200"><span class="text-emerald-700 font-bold">${label}: video found${r.start?` (starts at ${r.start} s)`:''}</span></span>`
        :`<span class="block text-red-700 font-bold mb-1">${label}: this is not the address of a YouTube video. Copy it from the browser bar while the video is open (watch?v=..., youtu.be/..., or a /shorts/ link).</span>`;
    };
    const en=vget(p,'url'),ar=vget(p,'url',true);
    return (en?'':'<span class="block text-amber-700 font-bold mb-1">No English link yet: until you paste one, this section does not show on the site.</span>')+one('English',en)+one('Arabic',ar);
  }
  function videoBlock(p){
    D.videos=D.videos&&typeof D.videos==='object'&&!Array.isArray(D.videos)?D.videos:{};
    if(!D.videos[p]||typeof D.videos[p]!=='object')D.videos[p]={};
    const b=`videos.${p}.`,v=D.videos[p],opts=p==='home'?KVIDEO.HOME:KVIDEO.ABOUT,after=opts.some(o=>o[0]===v.after)?v.after:KVIDEO.defaultAfter(p);
    const sel=(k,label,list,cur,note)=>`<label class="block text-xs font-bold text-gray-700">${label}<select data-p="${b}${k}" class="${inp} mt-1">${list.map(([x,n])=>`<option value="${x}" ${x===cur?'selected':''}>${n}</option>`).join('')}</select>${note?`<span class="block font-normal text-[11px] text-gray-500 mt-1">${note}</span>`:''}</label>`;
    const lay=['top','bottom'].includes(v.layout)?v.layout:'side';
    return box('Video',p==='home'?'A YouTube video on the home page, with an optional title and text.':'A YouTube video on the About page, with an optional title and text.',
      fld(b,['hidden','Hide this video section (keeps what is written below, but nothing shows on the site)','check'])
      +bi(b,['url','YouTube link: open the video on YouTube and copy the address from the browser bar. For the Arabic site you can paste a different (Arabic) video; leave it empty to show the same video'],[],{phEn:'https://www.youtube.com/watch?v=...',phAr:'Empty: the English video is shown'})
      +`<div data-vhint="${p}" class="text-xs space-y-0.5 -mt-1">${vHint(p)}</div>`
      +bi(b,['title','Title (optional)'],[],{})
      +bi(b,['text','Text (optional)','area'],[],{rows:5})
      +bi(b,['ctaText','Button under the text (optional): the words on it, e.g. Message us on WhatsApp'],[],{phEn:'Empty: no button',phAr:'Empty: the English words'})
      +fld(b,['ctaLink','Button link: whatsapp (opens a chat with the WhatsApp number in General), a web address (https://...), tel:+20..., mailto:..., or a page of the site (about.html, about.html#team). The button shows only when both the words and the link are set'])
      +fld(b,['poster','Cover picture (optional): shown before the video plays. Empty: the picture YouTube makes for the video','img'])
      +fld(b,['autoplay','Start by itself, silent and looping, when the video scrolls into view, and pause when it scrolls away (visitors can switch the sound on). Visitors who asked their device for less motion, or who save data, get the play button instead','check'])
      +fld(b,['date','Date the video was published on YouTube (optional; helps Google show the video in search results)','date'])
      +`<div class="grid md:grid-cols-2 gap-3">`
      +sel('after','Position',opts,after,p==='home'?'':'Between two paragraphs the video sits inside the About text; elsewhere it is a full section.')
      +sel('layout','Text and video',[['side','Text beside the video'],['top','Text above the video'],['bottom','Text below the video']],lay,'With no title and no text the video is shown alone, wide. Between two paragraphs of the About text the title and text go above and below the video.')
      +`</div>`);
  }
  // On save: empty values are not written; a link that is not a YouTube address stops the save and points at the box
  function cleanVideos(){
    const V=D.videos;if(!V||typeof V!=='object')return;
    VPAGES.forEach(p=>{
      const v=V[p];if(!v||typeof v!=='object'){delete V[p];return}
      ['url','title','text','ctaText','ctaLink','poster','date'].forEach(k=>{if(typeof v[k]==='string'){v[k]=k==='text'?v[k].replace(/\s+$/,''):v[k].trim();if(!v[k].trim())delete v[k]}});
      if(v.hidden!==true)delete v.hidden;
      if(v.autoplay!==true)delete v.autoplay;
      if(v.layout==='side')delete v.layout;
      if(v.after===KVIDEO.defaultAfter(p))delete v.after;
      if(!Object.keys(v).length)delete V[p];
    });
    Object.keys(V).forEach(k=>{if(!VPAGES.includes(k))delete V[k]});
    if(!Object.keys(V).length)delete D.videos;
  }
  function checkVideos(){
    for(const p of VPAGES)for(const ar of [false,true]){
      const u=vget(p,'url',ar);
      if(u&&!KVIDEO.parse(u)){
        go(`${p}-video`);tabs();view();
        const el=document.querySelector(`[data-p="${ar?'ar:':''}videos.${p}.url"]`);if(el){el.classList.add('bad');el.focus();el.scrollIntoView({block:'center'})}
        return `${p==='home'?'Home':'About'} page, Video${ar?' (Arabic)':''}: the link is not the address of a YouTube video.`;
      }
    }
    for(const p of VPAGES){
      const l=vget(p,'ctaLink'),t=vget(p,'ctaText')||vget(p,'ctaText',true);
      if(l&&!KVIDEO.ctaKind(l)){
        go(`${p}-video`);tabs();view();
        const el=document.querySelector(`[data-p="videos.${p}.ctaLink"]`);if(el){el.classList.add('bad');el.focus();el.scrollIntoView({block:'center'})}
        return `${p==='home'?'Home':'About'} page, Video: the button link must be whatsapp, an address starting with https://, tel:, mailto:, or a page of the site such as about.html.`;
      }
      if(t&&!l&&vget(p,'ctaText')){
        go(`${p}-video`);tabs();view();
        const el=document.querySelector(`[data-p="videos.${p}.ctaLink"]`);if(el){el.classList.add('bad');el.focus();el.scrollIntoView({block:'center'})}
        return `${p==='home'?'Home':'About'} page, Video: the button has words but no link.`;
      }
    }
    return '';
  }
  document.addEventListener('input',e=>{
    const m=/^(?:ar:)?videos\.(home|about)\.url$/.exec(e.target.dataset&&e.target.dataset.p||'');if(!m||!D)return;
    setTimeout(()=>{const h=document.querySelector(`[data-vhint="${m[1]}"]`);if(h)h.innerHTML=vHint(m[1])},0);
  });

  /* ---------- blocks ---------- */
  function svcBlock(file){
    const i=(D.services||[]).findIndex(x=>x.page===file);
    if(i<0)return box('Page content',`No service uses the page <b>${esc(file)}</b>. In <b>Home, Services</b> set the "Dedicated page file" of the service to ${esc(file)}.`,`<button type="button" data-sj="home-services" class="text-xs bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold px-3 py-2 rounded-xl">Go to Home, Services</button>`);
    const sv=D.services[i];
    return box(`Page content: ${esc(sv.title||'')}`,'Text before the first <b>## </b> line is the introduction at the top of the page; each <b>## Heading</b> becomes a card. The title, brief and pop-up of this service are edited in <b>Home, Services</b>.',
      fld(`services.${i}.`,['hidden','Hide this service on the website (home page, About page and its links; this page sends visitors to the home page)','check'])
      +bi(`services.${i}.`,['pageContent','Page content','area'],[],{rows:16})
      +`<div class="flex flex-wrap gap-2"><button type="button" data-imp="svc-open" class="text-xs bg-brand-600 hover:bg-brand-700 text-white font-bold px-3 py-2 rounded-xl"><i class="fas fa-file-import"></i> Import from Word / Markdown</button><button type="button" data-sj="home-services" class="text-xs bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold px-3 py-2 rounded-xl">Edit the title, brief and pop-up of this service</button></div>`);
  }
  const jump=(k,label,icon)=>`<button type="button" data-gj="${k}" class="text-xs bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold px-3 py-2 rounded-xl"><i class="fas ${icon}"></i> ${label}</button>`;
  function body(s){
    const inf=info(s.key);let h='';
    if(s.hero)h+=heroCard();
    if(s.video)h+=videoBlock(s.video);
    if(s.fields)h+=box('Text','English on the left, Arabic on the right. An Arabic box left empty shows the English text.',s.fields.map(f=>bi('',[f[0],f[1],f[2]],[],f[3]||{})).join(''));
    const rows=[...(s.dict||[]).map(dictRow),...inf.keys.map(txRow)].filter(Boolean);
    if(rows.length)h+=box('Fixed texts','The words written into this section of the page. The grey text is the built-in wording: leave a box empty to keep it, or type your own to replace it. <b>{khip}</b> is replaced by the styled KHIP name.',`<div class="space-y-3">${rows.join('')}</div>`);
    if(s.logo)h+=box('Logo','The logo of this section is replaced and sized in General.',jump('brand','Brand & logos','fa-signature'));
    if(s.contact)h+=box('Contact details','Phone numbers, email addresses, address, map, WhatsApp number and social links are set once for the whole site, in General.',jump('contact','Contact & social','fa-address-card'));
    if(s.key==='home-services'){D.ipCard=D.ipCard&&typeof D.ipCard==='object'?D.ipCard:{};h+=box('IP Services card','The wide card that lists Patents, Trademarks and the other IP services. The Translation card is set on its own service below.',cardBgBlock('ipCard.','the IP Services card'))}
    if(s.list)h+=`<div class="space-y-3">${listHtml(s.list)}</div>`;
    if(s.faq)h+=faqBody(s.faq);
    if(s.svcpage)h+=svcBlock(s.svcpage);
    if(!h)h=box('Nothing to edit here yet','This section has no text of its own that can be changed.','');
    return h+ALOOK.secLook(s.key);
  }

  /* ---------- screen ---------- */
  const count=s=>s.list?(D[s.list]||[]).length:s.faq?faqItems(s.faq).length:null;
  function render(){
    const s=sec();secKey=s.key;secPage=s.page;
    $('subnav').innerHTML=PAGES.map(([k,n])=>`<button type="button" data-sp="${k}" class="text-xs font-bold px-3.5 py-2 rounded-xl ${k===secPage?'bg-gray-900 text-white':'bg-white border border-gray-200 hover:bg-gray-100'}">${n}</button>`).join('');
    const file=PAGES.find(p=>p[0]===secPage)[2],pills=SECS.filter(x=>x.page===secPage).map(x=>{const n=count(x);return `<button type="button" data-sc="${x.key}" class="text-xs font-bold px-3 py-2 rounded-xl ${x.key===secKey?'bg-brand-600 text-white':'bg-white border border-gray-200 hover:bg-gray-100'}">${esc(x.label)}${n!=null?` <span class="opacity-70">(${n})</span>`:''}${ALOOK.hasLook(x.key)?` <i class="fas fa-palette text-[9px] ${x.key===secKey?'text-white/80':'text-brand-600'}" title="Has its own look settings"></i>`:''}</button>`}).join('');
    const id=s.id!=null?s.id:info(s.key).id;
    $('view').innerHTML=`<div class="flex flex-wrap gap-1.5">${pills}</div>
      <div class="flex items-start justify-between gap-3 pt-1"><div><h2 class="font-extrabold text-xl">${PAGES.find(p=>p[0]===secPage)[1]} page: ${esc(s.label)}</h2>${s.desc?`<p class="text-xs text-gray-600">${esc(s.desc)}</p>`:''}</div><a href="${file}${id?'#'+id:''}" target="_blank" rel="noopener" class="text-xs text-brand-700 underline whitespace-nowrap flex-shrink-0">View on the site</a></div>
      <div class="space-y-3">${body(s)}</div>`;
    if(document.getElementById('items'))items();
    if(window.KPV)KPV.sync();
  }
  function go(k){const s=SECS.find(x=>x.key===k);if(!s)return;secKey=k;secPage=s.page;tab='sections';q='';openItem=null;faqOpen=null}
  const LISTSEC={carousel:'home-hero',jurisdictions:'home-jurisdictions',services:'home-services',news:'home-news',testimonials:'home-testimonials',employees:'about-team'};
  function goList(c){go(LISTSEC[c]||'home-hero');listKey=c}

  document.addEventListener('click',e=>{
    if(!D)return;
    const sp=e.target.closest('[data-sp]');
    if(sp){const f=SECS.find(x=>x.page===sp.dataset.sp);go(f.key);render();return}
    const sc=e.target.closest('[data-sc]');if(sc){go(sc.dataset.sc);render();return}
    const sj=e.target.closest('[data-sj]');if(sj){go(sj.dataset.sj);tabs();view();window.scrollTo({top:0});return}
    const gj=e.target.closest('[data-gj]');if(gj){tab='general';gsub=gj.dataset.gj;tabs();view();window.scrollTo({top:0})}
  });
  return {render,go,goList,txRow,dictRow,SECS,info,cleanVideos,checkVideos,cur:()=>({key:secKey,page:secPage})};
})();
window.ASEC=ASEC;

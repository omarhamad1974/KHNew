/* KHIP language layer: English (LTR) and Arabic (RTL).
   - The admin chooses which languages the site offers: English only, Arabic only, or both
     ("languages" in app-data.json). With both, visitors switch with the button in the header.
   - Arabic content lives in app-data.ar.json, which mirrors app-data.json. Any field left empty
     there falls back to the English text, so the site is never blank.
   - Short interface words (menu, buttons) come from the table below; the admin can edit the Arabic
     ones under Arabic > Interface text.
   Load this file in <head> (it sets lang/dir before the page paints). */
window.KLang=(function(){
  const LS='khip-lang',CS='khip-langs',AR_FILE='./app-data.ar.json';
  const DICT={
    en:{
      nav_about:'About',nav_jur:'Jurisdictions',nav_services:'Services',nav_news:'News',
      bar_home:'Home',menu_title:'Menu',menu_open:'Open menu',menu_close:'Close menu',bar_services:'Services',bar_news:'News',bar_jur:'Jurisdiction',bar_about:'About',
      more:'More',jur_title:'Jurisdictions',svc_title:'Services',svc_ip:'IP Services',svc_ip_text:'Protecting inventions and brands in Egypt and across the Arab region.',news_title:'Latest news',testi_title:'Client endorsements',
      load_err:"We couldn't load the latest content.",try_again:'Try again',close:'Close',
      no_country:'No matching country. Message us and we will check for you.',ip_guidelines:'IP guidelines available upon inquiry.',
      cov_title:'Our Regional Coverage',cov_intro:'We file and manage IP rights in eleven countries across the Middle East and North Africa, with offices in Cairo, Dubai and Riyadh.',map_aria:'Map of the Middle East and North Africa showing KHIP jurisdictions',prev_c:'Previous country',next_c:'Next country',
      view_req:'View Filing Requirements',req_for:'{x} Filing Requirements',pct:'PCT Filing Guidelines',copy_link:'Copy link',link_copied:'Link copied',related:'Related news',
      more_info:'More information',inquire_about:'Inquire about {x}',wa_service:'Hello KHIP! I would like to inquire about {x}.',wa_hello:'Hello KHIP!',
      wa_jur:'IP filings and legal procedures in {x}',general:'General',msg_wa:'Message KHIP on WhatsApp',send:'Send',
      switch_to:'العربية',flag_aria:'{x} flag',testimonial_n:'Testimonial {x}',news_n:'News {x}',
      video_play:'Play video',prev:'Previous',next:'Next',pause:'Pause slideshow',play:'Play slideshow',slide_n:'Slide {x}',
      faq_title:'Frequently asked questions',team_title:'Our team',team_prev:'Previous team members',team_next:'Next team members',team_page:'Team page {x}',
      filing:'Filing guidelines',filing_none:'Filing guidelines for {x} are available on request. Message us and we will guide you through the process.',browse_c:'Browse countries',
      prompts:["Hello KHIP, I'd like to register a trademark in Egypt","How long does a patent filing take in the UAE?","How can I check if my trademark is available in Saudi Arabia?","What documents do I need for a PCT national phase entry?"]
    },
    ar:{
      nav_about:'من نحن',nav_jur:'الاختصاصات القضائية',nav_services:'الخدمات',nav_news:'الأخبار',
      bar_home:'الرئيسية',menu_title:'القائمة',menu_open:'فتح القائمة',menu_close:'إغلاق القائمة',bar_services:'الخدمات',bar_news:'الأخبار',bar_jur:'الدول',bar_about:'من نحن',
      more:'المزيد',jur_title:'الاختصاصات القضائية',svc_title:'الخدمات',svc_ip:'خدمات الملكية الفكرية',svc_ip_text:'حماية الاختراعات والعلامات التجارية في مصر والعالم العربي.',news_title:'آخر الأخبار',testi_title:'آراء العملاء',
      load_err:'تعذر تحميل أحدث المحتوى.',try_again:'حاول مرة أخرى',close:'إغلاق',
      no_country:'لا توجد دولة مطابقة. راسلنا وسنتحقق لك.',ip_guidelines:'إرشادات الملكية الفكرية متاحة عند الاستفسار.',
      cov_title:'نطاق تغطيتنا الإقليمية',cov_intro:'نقوم بتسجيل وإدارة حقوق الملكية الفكرية في أحد عشر دولة في الشرق الأوسط وشمال أفريقيا، ولدينا مكاتب في القاهرة ودبي والرياض.',map_aria:'خريطة الشرق الأوسط وشمال أفريقيا توضح الاختصاصات القضائية لـ KHIP',prev_c:'الدولة السابقة',next_c:'الدولة التالية',
      view_req:'عرض متطلبات التسجيل',req_for:'متطلبات التسجيل في {x}',pct:'إرشادات تقديم طلبات معاهدة التعاون بشأن البراءات (PCT)',copy_link:'نسخ الرابط',link_copied:'تم نسخ الرابط',related:'أخبار ذات صلة',
      more_info:'مزيد من المعلومات',inquire_about:'استفسر عن {x}',wa_service:'مرحباً KHIP! أود الاستفسار عن {x}.',wa_hello:'مرحباً KHIP!',
      wa_jur:'إجراءات تسجيل الملكية الفكرية والإجراءات القانونية في {x}',general:'عام',msg_wa:'راسل KHIP عبر واتساب',send:'إرسال',
      switch_to:'English',flag_aria:'علم {x}',testimonial_n:'الرأي {x}',news_n:'الخبر {x}',
      video_play:'تشغيل الفيديو',prev:'السابق',next:'التالي',pause:'إيقاف العرض مؤقتاً',play:'تشغيل العرض',slide_n:'الشريحة {x}',
      faq_title:'الأسئلة الشائعة',team_title:'فريقنا',team_prev:'أعضاء الفريق السابقون',team_next:'أعضاء الفريق التاليون',team_page:'صفحة الفريق {x}',
      filing:'إرشادات التسجيل',filing_none:'إرشادات التسجيل في {x} متاحة عند الطلب. راسلنا وسنرشدك خلال الإجراءات.',browse_c:'تصفح الدول',
      prompts:['مرحباً KHIP، أود تسجيل علامة تجارية في مصر','كم يستغرق تقديم طلب براءة اختراع في الإمارات؟','كيف أتحقق من توفر علامتي التجارية في السعودية؟','ما المستندات المطلوبة لدخول المرحلة الوطنية لمعاهدة PCT؟']
    }
  };
  if(document.currentScript&&document.currentScript.hasAttribute('data-passive'))return {DICT}; // admin page: word lists only, no language switching
  // A page can declare its language (<html data-khip-lang="en|ar">, written by scripts/build-seo.js when the site has both languages):
  // then the ADDRESS decides (index.html is English, index-ar.html is Arabic) and the EN | AR button goes to the other address.
  // Inside the admin preview (?khip-preview=1) the declaration is ignored, as before.
  const PREVIEW=/[?&]khip-preview=1/.test(location.search);
  const DECL=(()=>{const h=document.documentElement.getAttribute('data-khip-lang');return (h==='ar'||h==='en')&&!PREVIEW?h:null})();
  const FILE=()=>(location.pathname.split('/').pop()||'index.html').replace(/-ar(\.html)$/,'$1');   // index-ar.html -> index.html
  const HTMLNAME=/^([\w-]+)\.html([?#].*)?$/;
  const get=k=>{try{return localStorage.getItem(k)}catch{return null}};
  const put=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
  let langs=['en','ar','both'].includes(get(CS))?get(CS):'en',ui={};
  function pick(){
    if(DECL)return DECL;
    if(langs==='ar')return 'ar';
    if(langs==='en')return 'en';
    const q=new URLSearchParams(location.search).get('lang');
    if(q==='ar'||q==='en'){put(LS,q);return q}
    return get(LS)==='ar'?'ar':'en';
  }
  const K={DICT,AR_FILE,lang:pick(),rtl:false};
  function fonts(){
    if(document.getElementById('khip-ar-fonts'))return;
    const l=document.createElement('link');l.id='khip-ar-fonts';l.rel='stylesheet';
    l.href='https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600&family=Noto+Naskh+Arabic:wght@500;600&display=swap';
    document.head.appendChild(l);
  }
  function apply(){
    K.rtl=K.lang==='ar';
    const h=document.documentElement;h.lang=K.lang;h.dir=K.rtl?'rtl':'ltr';
    if(K.rtl)fonts();
  }
  apply();
  K.t=(key,vars)=>{
    let v=(ui[key]!=null&&typeof ui[key]==='string'&&ui[key].trim()!==''?ui[key]:null)??DICT[K.lang][key]??DICT.en[key]??key;
    if(typeof v==='string'&&vars)for(const n in vars)v=v.split('{'+n+'}').join(vars[n]);
    return v;
  };
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  // Fixed page texts: elements with data-tx="key" get the Arabic from pages-i18n.js (window.KTX),
  // or the admin's own wording (Arabic > Page texts, stored in ui as "tx_key", dots written as underscores). English pages are left as written.
  function setTx(e,v){
    if(v.indexOf('{khip}')>=0||e.querySelector('.khip')){e.innerHTML=esc(v).replace(/\{khip\}/g,'<span class="khip">KHIP</span>');return}
    if(!e.children.length){e.textContent=v;return}
    let done=false;                                   // an element with an icon: only the text part changes
    [...e.childNodes].forEach(n=>{if(n.nodeType===3&&n.nodeValue.trim()){if(!done){n.nodeValue=' '+v;done=true}else n.nodeValue=''}});
    if(!done)e.appendChild(document.createTextNode(' '+v));
  }
  K.tx=(root=document)=>{
    if(!window.KTX)return;
    root.querySelectorAll('[data-tx]').forEach(e=>{
      const k=e.dataset.tx,d=window.KTX[k];if(!d)return;
      const o=ui['tx_'+k.replace(/\./g,'_')],v=txt(o)?o:(K.rtl?d.ar:null);if(!txt(v))return;   // English pages keep the text as written unless the admin set their own
      if(e.tagName==='TITLE'){document.title=v.replace(/\{khip\}/g,'KHIP');return}
      setTx(e,v);
    });
  };
  K.dom=(root=document)=>{
    K.tx(root);
    root.querySelectorAll('[data-i18n]').forEach(e=>{e.textContent=K.t(e.dataset.i18n)});
    root.querySelectorAll('[data-i18n-attr]').forEach(e=>e.dataset.i18nAttr.split(';').forEach(p=>{const [a,k]=p.split(':');if(a&&k)e.setAttribute(a.trim(),K.t(k.trim()))}));
  };
  // The admin's language choice. Returns true when the language shown has just changed.
  K.settings=v=>{
    const n=['en','ar','both'].includes(v)?v:'en';
    langs=n;put(CS,n);
    if(DECL==='ar'&&n==='en'){location.replace(K.url(FILE(),'en')+location.search+location.hash);return false}   // Arabic switched off: go to the English page
    const old=K.lang;K.lang=pick();apply();K.mount();
    return old!==K.lang;
  };
  K.langs=()=>langs;
  K.set=l=>{
    put(LS,l);const u=new URL(location.href);u.searchParams.delete('lang');
    if(DECL){location.href=K.url(FILE(),l)+u.search+u.hash;return}                  // the other language lives at its own address
    location.href=u.pathname+u.search+u.hash;location.reload();
  };
  // File name of this page in English form (about-ar.html -> about.html); 'index.html' for the bare folder address.
  K.page=FILE;
  // Address of a page in a language: K.url('about.html','ar') -> 'about-ar.html'. Other addresses (#x, https://..., files) are returned unchanged.
  K.url=(f,l)=>{
    l=l||K.lang;if(!DECL)return f;
    const m=String(f).match(HTMLNAME);if(!m)return f;
    return m[1].replace(/-ar$/,'')+(l==='ar'?'-ar':'')+'.html'+(m[2]||'');
  };
  // On an Arabic page every link to another page of the site points to its Arabic version (also links the scripts add later).
  K.links=(root=document)=>{
    if(DECL!=='ar')return;
    root.querySelectorAll('a[href]').forEach(a=>{const h=a.getAttribute('href'),n=K.url(h,'ar');if(n!==h)a.setAttribute('href',n)});
  };
  // The EN | AR button: any element with id="lang-switch" (only filled when both languages are on)
  K.mount=()=>{
    document.querySelectorAll('#lang-switch').forEach(e=>{
      if(langs!=='both'){e.innerHTML='';return}
      e.innerHTML=`<button type="button" class="lang-btn" lang="${K.rtl?'en':'ar'}" aria-label="${K.rtl?'Switch to English':'التبديل إلى العربية'}">${DICT[K.lang].switch_to}</button>`;
      e.firstChild.onclick=()=>K.set(K.rtl?'en':'ar');
    });
  };
  const JSON_GET=async u=>{const r=await fetch(u,{cache:'no-cache'});if(!r.ok)throw new Error(r.status);return r.json()};
  const txt=v=>typeof v==='string'&&v.trim()!=='';
  // The two main services: Translation (a service whose page is translation.html) and IP Services (all the others, e.g. Patents, Trademarks).
  K.svcSplit=list=>{
    const vis=(list||[]).filter(x=>x&&!x.hidden),isTr=x=>/translation\.html$/i.test(x.page||'')||/transl/i.test(x.enTitle||x.title||'');
    return {ip:vis.filter(x=>!isTr(x)),tr:vis.filter(isTr)};
  };
  const NEUTRAL=new Set(['id','image','icon','page','code','flag','date','category']);
  // Arabic over English, field by field; empty Arabic fields keep the English text.
  K.useUi=d=>{if(d&&d._ui&&typeof d._ui==='object')ui=d._ui};          // the saved copy of the data carries its own wording
  K.merge=(en,ar)=>{const o=merge0(en,ar);o._ui=ui;return o};
  const merge0=(en,ar)=>{
    ui=K.rtl?((ar&&ar.ui)||{}):((en&&en.ui)||{});
    if(!K.rtl)return en;
    const o=JSON.parse(JSON.stringify(en));
    (o.jurisdictions||[]).forEach(j=>{j.enCountry=j.country});
    (o.services||[]).forEach(x=>{x.enTitle=x.title});
    o.chatPrompts=ar&&Array.isArray(ar.chatPrompts)&&ar.chatPrompts.some(txt)?ar.chatPrompts.filter(txt):DICT.ar.prompts;
    if(!ar)return o;
    for(const k of ['aboutMainText','about','ipServicesText'])if(txt(ar[k]))o[k]=ar[k];
    if(ar.contact&&Array.isArray(ar.contact.address)&&ar.contact.address.some(txt))o.contact=Object.assign({},o.contact,{address:ar.contact.address.filter(txt)});
    const enC=en.newsCategories||[],arC=ar.newsCategories||[],cm={};
    enC.forEach((c,i)=>{if(txt(arC[i]))cm[c]=arC[i]});
    o.newsCategories=enC.map(c=>cm[c]||c);
    for(const sec of ['carousel','jurisdictions','news','services','testimonials','employees','products','images']){
      const a=ar[sec];if(!Array.isArray(a)||!Array.isArray(o[sec]))continue;
      const by=new Map(a.filter(x=>x&&x.id!=null).map(x=>[String(x.id),x]));
      o[sec].forEach((it,i)=>{const x=by.get(String(it.id))||(it.id==null?a[i]:null);if(!x)return;
        for(const [k,v] of Object.entries(x))if(!NEUTRAL.has(k)&&txt(v))it[k]=v});
    }
    (o.news||[]).forEach(n=>{if(cm[n.category])n.category=cm[n.category]});
    for(const pg of ['home','about']){                  // video sections: Arabic title, text and YouTube link (empty = the English one)
      const av=(ar.videos||{})[pg],ov=(o.videos||{})[pg];if(!av||!ov)continue;
      for(const k of ['title','text','url','ctaText'])if(txt(av[k]))ov[k]=av[k];
    }
    const af=ar.faq;                                   // FAQ: Arabic question and answer per item id; heading and intro per page
    if(af&&o.faq){
      if(txt(af.title))o.faq.title=af.title;if(txt(af.intro))o.faq.intro=af.intro;
      for(const [pk,ap] of Object.entries(af.pages||{})){
        const op=(o.faq.pages||{})[pk];if(!op||!ap)continue;
        if(txt(ap.title))op.title=ap.title;if(txt(ap.intro))op.intro=ap.intro;
        const by=new Map((ap.items||[]).filter(x=>x&&x.id!=null).map(x=>[String(x.id),x]));
        (op.items||[]).forEach(it=>{const x=by.get(String(it.id));if(!x)return;if(txt(x.q))it.q=x.q;if(txt(x.a))it.a=x.a});
      }
    }
    return o;
  };
  // Loads app-data.json (always: it holds the settings), then the Arabic file when Arabic is showing.
  const loadOnce={};
  const realData=async(url)=>{
    const en=await JSON_GET(url);
    K.settings(en.languages);
    let ar=null;
    if(K.rtl){try{ar=await JSON_GET(AR_FILE)}catch{}}
    return K.merge(en,ar);
  };
  K.data=(url='./app-data.json')=>loadOnce[url]||(loadOnce[url]=realData(url).catch(e=>{delete loadOnce[url];throw e}));
  // For the inner pages: apply(data) runs with the saved copy first, then again with the fresh data if it differs.
  K.load=apply=>{
    const ck=()=>'khip-data-v3'+(K.rtl?'-ar':'');
    const first=ck();let cached=null;try{cached=JSON.parse(localStorage.getItem(first))}catch{}
    if(cached){K.useUi(cached);apply(cached)}
    K.data().then(d=>{
      if(JSON.stringify(d)!==JSON.stringify(cached)||ck()!==first){try{localStorage.setItem(ck(),JSON.stringify(d))}catch{}apply(d)}
    }).catch(()=>{});
  };
  const boot=()=>{
    K.mount();K.tx();K.links();
    if(DECL==='ar'&&window.MutationObserver){let q=0;new MutationObserver(()=>{if(q)return;q=requestAnimationFrame(()=>{q=0;K.links()})}).observe(document.body,{childList:true,subtree:true})}
  };
  // Old shared links such as index.html?lang=ar go to the Arabic address
  if(DECL==='en'&&new URLSearchParams(location.search).get('lang')==='ar'){
    const u=new URL(location.href);u.searchParams.delete('lang');location.replace(K.url(FILE(),'ar')+u.search+u.hash);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  return K;
})();

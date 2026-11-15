/* Shared sticky bottom bar (WhatsApp chat box + navigation). Self-contained: add
   <script src="footer.js"></script> before </body> on every page, including about.html. */
(function(){
  let PHONE="201006552255";   // replaced by contact.whatsapp from app-data.json (admin, General tab)
  const T=(k,d)=>window.KLang?KLang.t(k):d;
  let prompts=window.KLang?KLang.t('prompts'):["Hello KHIP, I'd like to register a trademark in Egypt","How long does a patent filing take in the UAE?","How can I check if my trademark is available in Saudi Arabia?","What documents do I need for a PCT national phase entry?"];
  const wa=t=>window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(t)}`,'_blank','noopener');
  window.KHIP={wa,setPrompts:a=>{if(a&&a.length)prompts=a},setPhone:n=>{n=String(n||"").replace(/\D/g,"");if(n)PHONE=n}};
  if(!document.querySelector('link[href*="phosphor"]')){const l=document.createElement('link');l.rel='stylesheet';l.href='https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/light/style.css';document.head.appendChild(l)}
  if(!document.querySelector('link[href*="styles.css"]')){const l=document.createElement('link');l.rel='stylesheet';l.href='styles.css';document.head.appendChild(l)}
  const nav=[['top','ph-house',T('bar_home','Home')],['services','ph-seal-check',T('bar_services','Services')],['news','ph-newspaper',T('bar_news','News')],['jurisdictions','ph-globe-hemisphere-west',T('bar_jur','Jurisdiction')],['about','ph-info',T('bar_about','About')]];
  const bar=document.createElement('div');bar.id='khip-bar';
  bar.innerHTML=`<div class="kin"><form><div class="kf"><i class="ph-light ph-whatsapp-logo"></i><input aria-label="${T('msg_wa','Message KHIP on WhatsApp')}" autocomplete="off"><button type="submit" class="ks" aria-label="${T('send','Send')}" title="${T('send','Send')}"><i class="ph-light ph-paper-plane-right"></i></button></div></form><nav>${nav.map(([k,i,l])=>`<button type="button" data-go="${k}"><i class="ph-light ${i}"></i>${l}</button>`).join('')}</nav></div>`;
  // App-shell layout: the page scrolls inside #khip-page and the bar sits below it as a normal
  // flex row, so nothing (toolbars, content height changes, fades) can ever move the bar.
  const body=document.body,me=document.currentScript;
  body.classList.add('khip-shell');
  let page=document.getElementById('khip-page');
  if(!page){page=document.createElement('div');page.id='khip-page';
    [...body.childNodes].forEach(n=>{if(n!==me&&n!==bar)page.appendChild(n)});body.appendChild(page)}
  body.appendChild(bar);
  const sync=()=>document.documentElement.style.setProperty('--khip-h',bar.offsetHeight+'px');
  sync();addEventListener('resize',sync);if(window.ResizeObserver)new ResizeObserver(sync).observe(bar);
  const inp=bar.querySelector('input');
  bar.querySelector('form').addEventListener('submit',e=>{e.preventDefault();const v=inp.value.trim();if(v){wa(v);inp.value=''}});
  bar.addEventListener('click',e=>{
    const b=e.target.closest('[data-go]');if(!b)return;const k=b.dataset.go,el=document.getElementById(k);
    if(k==='about'){/about\.html/.test(location.pathname)?page.scrollTo({top:0,behavior:'smooth'}):location.href='about.html';return}
    if(k==='top')document.getElementById('app-top')?page.scrollTo({top:0,behavior:'smooth'}):location.href='index.html';
    else el&&el.offsetParent!==null?el.scrollIntoView({behavior:'smooth'}):location.href='index.html#'+k;
  });
  let pi=0,ci=0,del=false;
  (function tick(){
    if(document.activeElement===inp||inp.value){inp.placeholder=T('msg_wa','Message KHIP on WhatsApp');return setTimeout(tick,1000)}
    const m=prompts[pi%prompts.length];ci+=del?-1:1;inp.placeholder=m.slice(0,ci)||' ';
    let d=del?18:42;
    if(!del&&ci>=m.length){del=true;d=2200}else if(del&&ci<=0){del=false;pi++;d=500}
    setTimeout(tick,d);
  })();

  // ---- Header menu: "Services" drop-down (Services > IP Services > Patents, Trademarks; Translation) ----
  (function(){
    const nav=document.querySelector('header nav');if(!nav||!window.KLang)return;
    const home=/(^|\/)(index\.html)?$/.test(location.pathname),sec=(home?'':'index.html')+'#services';
    const cur=location.pathname.split('/').pop()||'index.html',svcPages=['patents.html','trademarks.html','translation.html'];
    const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const old=[...nav.querySelectorAll('a')].filter(a=>a.dataset.i18n==='nav_services'||['about.p3','about.p4','about.p5'].includes(a.dataset.tx));
    const dd=document.createElement('div');dd.className='nav-dd'+(svcPages.includes(cur)?' cur':'');
    dd.innerHTML=`<a href="${sec}" class="nav-dd-top">${esc(KLang.t('nav_services'))}<i class="ph-light ph-caret-down"></i></a><div class="nav-menu"></div>`;
    if(old.length){old[0].replaceWith(dd);old.slice(1).forEach(a=>a.remove())}
    else{const first=nav.querySelector('a');first?first.after(dd):nav.appendChild(dd)}
    const link=x=>/^[\w-]+\.html$/.test(x.page||'')?x.page:sec;
    KLang.data().then(D=>{
      dd.querySelector('.nav-dd-top').firstChild.textContent=KLang.t('nav_services');
      const g=KLang.svcSplit(D.services),a=(href,txt,cls)=>`<a role="menuitem" href="${esc(href)}" class="${cls}${href===cur?' on':''}">${esc(txt)}</a>`;
      let h='';
      if(g.ip.length){h+=a(sec,KLang.t('svc_ip'),'nav-grp');g.ip.forEach(x=>{h+=a(link(x),x.title,'nav-sub')})}
      g.tr.forEach(x=>{h+=a(link(x),x.title,'nav-grp')});
      dd.querySelector('.nav-menu').innerHTML=h?`<div class="nav-menu-in">${h}</div>`:'';
    }).catch(()=>{});
  })();
})();

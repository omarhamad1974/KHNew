/* FAQ section for the Home, About, Patents, Trademarks and Translation pages.
   Each page has an empty <section data-faq="home|about|patents|trademarks|translation"> that stays hidden.
   The questions come from "faq" in app-data.json (admin, tab FAQ), with the Arabic wording from app-data.ar.json laid over them by lang.js:
     faq: { title, intro, pages: { home: { title, intro, hidden, items: [ {id, q, a} ] }, about: {...}, ... } }
   A page with no complete question and answer keeps its FAQ hidden. Answers use the site's text format (**bold**, ## subtitle, - bullet).
   The questions are also published to search engines as FAQ structured data. */
(function(){
  const sec=document.querySelector('[data-faq]');if(!sec)return;
  const key=sec.dataset.faq,E=s=>window.KRich.esc(s);
  const LD='faq-ld',T=k=>window.KLang?KLang.t(k):'Frequently asked questions';
  function ld(items){
    let s=document.getElementById(LD);
    if(!items.length){if(s)s.remove();return}
    if(!s){s=document.createElement('script');s.type='application/ld+json';s.id=LD;document.head.appendChild(s)}
    s.textContent=JSON.stringify({'@context':'https://schema.org','@type':'FAQPage',mainEntity:items.map(x=>({'@type':'Question',name:String(x.q).trim(),acceptedAnswer:{'@type':'Answer',text:window.KRich.plain(x.a).replace(/\u2022 /g,'')}}))}).replace(/</g,'\\u003c');
  }
  function apply(D){
    const F=(D&&D.faq)||{},P=(F.pages||{})[key]||{};
    const items=(P.items||[]).filter(x=>x&&String(x.q||'').trim()&&String(x.a||'').trim());
    if(P.hidden===true||!items.length){sec.classList.add('hidden');ld([]);return}
    const t=String(P.title||F.title||'').trim()||T('faq_title'),intro=String(P.intro||F.intro||'').trim();
    const tt=sec.querySelector('[data-faq-title]'),ti=sec.querySelector('[data-faq-intro]'),l=sec.querySelector('[data-faq-list]');
    if(tt)tt.textContent=t;
    if(ti){ti.innerHTML=intro?window.KRich.rich(intro):'';ti.classList.toggle('hidden',!intro)}
    const open=new Set([...l.querySelectorAll('details[open]')].map(d=>d.dataset.i));       // keep what the visitor opened when the data refreshes
    l.innerHTML=items.map((x,i)=>`<details class="faq-item fu in" data-i="${i}"${open.has(String(i))?' open':''}><summary><span>${E(String(x.q).trim())}</span><i class="ph-light ph-caret-down" aria-hidden="true"></i></summary><div class="faq-a">${window.KRich.rich(String(x.a).trim())}</div></details>`).join('');
    sec.classList.remove('hidden');ld(items);
  }
  KLang.load(apply);                                      // English, or Arabic on top when Arabic is showing
})();

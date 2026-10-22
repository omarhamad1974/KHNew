/* Shared sticky footer: WhatsApp chat box + navigation. Add <script src="footer.js"></script> to every page.
   Needs Tailwind and Phosphor icons loaded on the page. */
(function(){
  const PHONE="201006552255";
  let prompts=["Hello KHIP, I'd like to register a trademark in Egypt","How long does a patent filing take in the UAE?","Can you translate my patent into Arabic?","What documents do I need for a PCT national phase entry?"];
  const wa=t=>window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(t)}`,'_blank','noopener');
  window.KHIP={wa,setPrompts:a=>{if(a&&a.length){prompts=a}}};
  const nav=[['jurisdictions','ph-globe-hemisphere-west','Countries'],['services','ph-seal-check','Services'],['top','ph-house','Home'],['news','ph-newspaper','News'],['about','ph-info','About']];
  const bar=document.createElement('div');
  bar.className='fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-xl border-t border-stone-200 shadow-[0_-8px_30px_rgba(20,30,50,.08)]';
  bar.innerHTML=`<div class="max-w-3xl mx-auto">
    <form id="wa-form" class="px-3 pt-2.5 pb-1.5 flex gap-2">
      <div class="relative flex-1"><i class="ph-light ph-whatsapp-logo absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-700 text-lg"></i>
      <input id="wa-input" aria-label="Message KHIP on WhatsApp" class="w-full pl-10 pr-4 py-2.5 text-sm rounded-full border border-stone-300 bg-white focus:border-emerald-600 focus:outline-none transition"></div>
      <button class="bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white px-5 rounded-full text-sm font-medium transition">Send</button>
    </form>
    <nav class="grid grid-cols-5 pb-2 text-center text-[11px] text-stone-600">${nav.map(([k,i,l])=>`<button data-go="${k}" class="py-1.5 hover:text-brand-600 transition"><i class="ph-light ${i} text-[22px] block"></i>${l}</button>`).join('')}</nav></div>`;
  document.body.appendChild(bar);
  document.body.style.paddingBottom='9rem';
  const inp=bar.querySelector('#wa-input');
  bar.querySelector('#wa-form').addEventListener('submit',e=>{e.preventDefault();const v=inp.value.trim();if(v){wa(v);inp.value=''}});
  bar.addEventListener('click',e=>{
    const b=e.target.closest('[data-go]');if(!b)return;const k=b.dataset.go,el=document.getElementById(k);
    if(k==='top')document.getElementById('app-top')?scrollTo({top:0,behavior:'smooth'}):location.href='index.html';
    else el?el.scrollIntoView({behavior:'smooth'}):location.href='index.html#'+k;
  });
  let pi=0,ci=0,del=false;
  (function tick(){
    if(document.activeElement===inp||inp.value){inp.placeholder='Message KHIP on WhatsApp';return setTimeout(tick,1000)}
    const m=prompts[pi%prompts.length];ci+=del?-1:1;inp.placeholder=m.slice(0,ci)||' ';
    let d=del?18:42;
    if(!del&&ci>=m.length){del=true;d=2200}else if(del&&ci<=0){del=false;pi++;d=500}
    setTimeout(tick,d);
  })();
})();

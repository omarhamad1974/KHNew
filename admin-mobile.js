/* KHIP admin on phones: a bar at the bottom of the screen to move between the parts to edit.
   [<] previous part   [the part being edited, tap to jump anywhere]   next part [>]   [Preview]
   "Jump to" opens a sheet with every General page and every section of every page (hidden ones marked), with a search box.
   Only below 768 px wide. The docked live preview (admin-preview.js) sits just above the bar.
   Loaded by admin.html after admin-preview.js. Uses: D, tab, gsub, tabs, view, esc, ASEC, AGEN, KPV. */
(function(){
  'use strict';
  const mq=matchMedia('(max-width:767px)');
  const SPAGES=[['home','Home'],['about','About'],['patents','Patents'],['trademarks','Trademarks'],['translation','Translation']];
  let bar=null,sheet=null;
  // every place there is to edit, in order: the General pages, then each page of the site with its sections
  function places(){
    const out=[];
    ((window.AGEN&&AGEN.pages)||[]).forEach(([k,n,i])=>out.push({kind:'general',k,label:n,group:'General',icon:i}));
    if(window.ASEC)SPAGES.forEach(([p,n])=>ASEC.pageKeys(p).forEach(k=>{const e=ASEC.entry(k);if(e)out.push({kind:'section',k,label:e.label,group:n+' page',hidden:isHidden(k),copy:!!e.copyOf,img:!!e.img})}));
    return out;
  }
  function isHidden(k){
    const L=(D&&D.theme&&D.theme.layout)||{},m=/^([a-z]+)-image-([a-z]+)$/.exec(k);
    if(m){const x=(D.images||[]).find(i=>i&&i.id===m[2]);return !!(x&&x.hidden)}
    return (L.hide||{})[k]===true;
  }
  function current(){
    if(typeof tab!=='undefined'&&tab==='sections'&&window.ASEC){const c=ASEC.cur();return {kind:'section',k:c.key}}
    return {kind:'general',k:typeof gsub!=='undefined'?gsub:'brand'};
  }
  function goPlace(p){
    if(!p)return;
    if(p.kind==='general'){tab='general';gsub=p.k}else ASEC.go(p.k);
    tabs();view();window.scrollTo({top:0});draw();
  }
  function step(d){
    const L=places(),c=current(),i=L.findIndex(p=>p.kind===c.kind&&p.k===c.k);
    goPlace(L[(i+d+L.length)%L.length]);
  }
  function labelNow(){
    const L=places(),c=current(),p=L.find(x=>x.kind===c.kind&&x.k===c.k);
    return p?[p.group,p.label]:['',''];
  }
  function draw(){
    if(!bar)return;
    const [g,l]=labelNow(),pv=window.KPV&&KPV.isOpen&&KPV.isOpen();
    bar.querySelector('[data-mb=where]').innerHTML=`<span class="block text-[10px] text-gray-400 leading-tight truncate">${esc(g)}</span><span class="block text-sm font-extrabold leading-tight truncate">${esc(l)}</span>`;
    const b=bar.querySelector('[data-mb=pv]');b.classList.toggle('bg-brand-600',!!pv);b.classList.toggle('text-white',!!pv);b.classList.toggle('bg-gray-100',!pv);
    b.setAttribute('aria-pressed',pv?'true':'false');
  }
  function build(){
    bar=document.createElement('nav');bar.id='mbar';bar.setAttribute('aria-label','Move between the parts to edit');
    bar.className='fixed left-0 right-0 bottom-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 shadow-[0_-6px_20px_rgba(15,23,42,.08)] px-2 py-1.5 flex items-center gap-1.5';
    bar.innerHTML=`<button type="button" data-mb="prev" aria-label="Previous part" class="w-11 h-11 rounded-xl bg-gray-100 flex-shrink-0"><i class="fas fa-chevron-left"></i></button>
      <button type="button" data-mb="where" aria-label="Jump to another part" class="flex-1 min-w-0 h-11 rounded-xl bg-gray-50 border border-gray-200 px-3 text-start"></button>
      <button type="button" data-mb="next" aria-label="Next part" class="w-11 h-11 rounded-xl bg-gray-100 flex-shrink-0"><i class="fas fa-chevron-right"></i></button>
      <button type="button" data-mb="pv" aria-label="Live preview" class="h-11 px-3 rounded-xl bg-gray-100 font-bold text-xs flex-shrink-0"><i class="fas fa-eye"></i> Preview</button>`;
    document.body.appendChild(bar);
    bar.addEventListener('click',e=>{
      const t=e.target.closest('[data-mb]');if(!t||!D)return;
      const a=t.dataset.mb;
      if(a==='prev')step(-1);else if(a==='next')step(1);else if(a==='where')openSheet();
      else if(a==='pv'&&window.KPV){KPV.open(!KPV.isOpen());setTimeout(draw,0)}
    });
  }
  function openSheet(){
    if(!sheet){
      sheet=document.createElement('div');sheet.id='msheet';sheet.className='fixed inset-0 z-50 bg-black/40 flex items-end';
      sheet.innerHTML=`<div role="dialog" aria-modal="true" aria-label="Jump to" class="bg-white w-full rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl">
        <div class="p-3 border-b border-gray-200 flex items-center gap-2"><input type="search" data-ms="q" placeholder="Search: news, FAQ, colors ..." aria-label="Search the parts" class="flex-1 px-3 py-2 rounded-lg border border-gray-300" style="font-size:16px"><button type="button" data-ms="close" aria-label="Close" class="w-11 h-11 rounded-xl bg-gray-100"><i class="fas fa-xmark"></i></button></div>
        <div data-ms="list" class="overflow-y-auto p-2"></div></div>`;
      document.body.appendChild(sheet);
      sheet.addEventListener('click',e=>{
        if(e.target===sheet||e.target.closest('[data-ms=close]')){sheet.classList.add('hidden');return}
        const b=e.target.closest('[data-go]');if(b){const L=places();sheet.classList.add('hidden');goPlace(L[+b.dataset.go])}
      });
      sheet.querySelector('[data-ms=q]').addEventListener('input',list);
    }
    sheet.classList.remove('hidden');sheet.querySelector('[data-ms=q]').value='';list();
  }
  function list(){
    const q=sheet.querySelector('[data-ms=q]').value.trim().toLowerCase(),L=places(),c=current();let g='',h='';
    L.forEach((p,i)=>{
      if(q&&!(p.label+' '+p.group).toLowerCase().includes(q))return;
      if(p.group!==g){g=p.group;h+=`<div class="px-2 pt-3 pb-1 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">${esc(g)}</div>`}
      const on=p.kind===c.kind&&p.k===c.k;
      h+=`<button type="button" data-go="${i}" class="w-full text-start flex items-center gap-2 px-3 py-3 rounded-xl ${on?'bg-brand-600 text-white':'hover:bg-gray-100'}"><i class="fas ${p.icon||(p.img?'fa-image':p.copy?'fa-clone':'fa-table-cells-large')} text-xs w-4 ${on?'':'text-gray-400'}"></i><span class="flex-1 font-bold text-sm ${p.hidden?'line-through opacity-60':''}">${esc(p.label)}</span>${p.hidden?'<span class="text-[10px] font-bold bg-amber-100 text-amber-800 rounded px-1.5 py-0.5">hidden</span>':''}</button>`;
    });
    sheet.querySelector('[data-ms=list]').innerHTML=h||'<p class="p-4 text-sm text-gray-500">Nothing found.</p>';
  }
  function layout(){
    const on=mq.matches&&!!D&&!document.getElementById('app').classList.contains('hidden');
    if(on&&!bar)build();
    if(bar)bar.classList.toggle('hidden',!on);
    document.body.classList.toggle('mbar',on);
    if(on)draw();
  }
  mq.addEventListener('change',layout);
  // follow every redraw of the admin (moving between parts by any means)
  document.addEventListener('DOMContentLoaded',()=>{const v=document.getElementById('view');if(v&&window.MutationObserver)new MutationObserver(()=>{clearTimeout(layout.t);layout.t=setTimeout(layout,40)}).observe(v,{childList:true})});
  document.addEventListener('click',e=>{if(e.target.closest('#pv-btn,#pv [data-pv=close],#pv-fab'))setTimeout(draw,0)});
  window.KMOB={layout,draw};
})();

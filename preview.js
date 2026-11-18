/* KHIP preview.js: lets the admin page show this site page with its UNSAVED changes.
   Loaded FIRST in <head> on every public page. It does nothing unless the page is opened inside the admin's preview
   frame (the address carries ?khip-preview=1 and the parent window is admin.html on the same website). Then:
     - app-data.json and app-data.ar.json are answered by the admin (what is on screen there), not by GitHub
     - the saved copies the site keeps in the browser are left alone (nothing from the preview is stored)
     - links and buttons that leave the page (WhatsApp, phone, e-mail, other websites) do nothing
     - links to other pages of the site stay inside the preview
     - the section being edited is scrolled into view and outlined (?sec=home-news, ?hl=1)
   Address parameters: khip-preview=1, lang=en|ar, sec=<section key>, hl=1 (outline), y=<scroll position>. */
(function(){
  'use strict';
  if(!/[?&]khip-preview(=|&|$)/.test(location.search))return;
  var P=null;try{P=window.parent&&window.parent!==window?window.parent.KPV:null}catch(e){}
  if(!P||typeof P.data!=='function')return;
  var Q=new URLSearchParams(location.search),LANG=Q.get('lang')==='ar'?'ar':'en';
  window.__khipPreview={lang:LANG};

  // 1. Browser storage: the language is forced, the saved data copies are neither read nor written
  var SP=Storage.prototype,gi=SP.getItem,si=SP.setItem;
  var mine=function(k){return k==='khip-lang'||k==='khip-langs'||/^khip-data/.test(k)};
  SP.getItem=function(k){
    if(k==='khip-lang'||k==='khip-langs')return LANG;
    if(/^khip-data/.test(k))return null;
    return gi.apply(this,arguments);
  };
  SP.setItem=function(k){if(mine(String(k)))return;return si.apply(this,arguments)};

  // 2. The data files come from the admin
  var rf=window.fetch;
  window.fetch=function(input){
    var u=typeof input==='string'?input:(input&&input.url)||'',m=null;
    try{var a=new URL(u,location.href);if(a.origin===location.origin)m=/\/(app-data(?:\.ar)?\.json)$/.exec(a.pathname)}catch(e){}
    if(m){
      var body='';try{body=P.data(m[1]==='app-data.json'?'en':'ar',LANG)}catch(e){}
      if(body)return Promise.resolve(new Response(body,{status:200,headers:{'Content-Type':'application/json'}}));
    }
    return rf.apply(this,arguments);
  };

  // 3. Nothing leaves the preview
  window.open=function(){return null};
  document.addEventListener('click',function(e){
    var a=e.target&&e.target.closest?e.target.closest('a[href]'):null;if(!a)return;
    var h=a.getAttribute('href')||'';
    if(h.charAt(0)==='#'||/^javascript:/i.test(h))return;
    e.preventDefault();
    if(/^(mailto:|tel:|https?:|\/\/)/i.test(h)||a.target==='_blank')return;
    try{var u=new URL(h,location.href);if(u.origin!==location.origin)return;
      u.searchParams.set('khip-preview','1');u.searchParams.set('lang',LANG);u.searchParams.delete('y');u.searchParams.delete('sec');
      location.href=u.toString();
    }catch(x){}
  },true);
  document.addEventListener('submit',function(e){e.preventDefault()},true);

  // 4. Highlight and scroll (the pages scroll inside #khip-page, see footer.js; older layouts scroll the window)
  var st=null,cur='';
  var sc=function(){return document.getElementById('khip-page')};
  var top=function(){var p=sc();return p?p.scrollTop:window.scrollY};
  var to=function(v){var p=sc();if(p)p.scrollTo({top:v,behavior:'instant'});else window.scrollTo({top:v,behavior:'instant'})};
  var full=function(){var p=sc();return p?{h:p.scrollHeight,v:p.clientHeight}:{h:document.documentElement.scrollHeight,v:innerHeight}};
  function css(){
    if(!st){st=document.createElement('style');st.id='khip-pv-style';(document.head||document.documentElement).appendChild(st)}
    st.textContent='#khip-stamp{display:none!important}'
      +(cur&&Q.get('hl')!=='0'?'[data-sec="'+cur+'"]'+(/-image-([a-z]+)$/.test(cur)?',figure[data-imgid="'+/-image-([a-z]+)$/.exec(cur)[1]+'"]':'')+'{outline:3px solid rgba(29,78,216,.7);outline-offset:-3px}':'');
  }
  function target(key){
    if(!key||key==='home-hero')return document.getElementById('carousel')?document.getElementById('carousel').parentElement:null;
    var el=document.querySelector('[data-sec="'+key+'"]'),m=/-image-([a-z]+)$/.exec(key||'');
    if(!el&&m)el=document.querySelector('figure[data-imgid="'+m[1]+'"]');          // a picture inside a text (images.js)
    return el;
  }
  function focus(key,hl){
    cur=key||'';if(hl===false)Q.set('hl','0');else if(hl===true)Q.set('hl','1');
    css();
    var el=target(key),hd=document.querySelector('header'),off=hd?hd.offsetHeight:0,p=sc();
    if(!key||key==='home-hero'){to(0);return}
    if(el&&el.offsetParent!==null){
      var base=p?p.getBoundingClientRect().top:0;
      to(Math.max(0,el.getBoundingClientRect().top-base+top()-off));
    }
  }
  window.__khipFocus=focus;
  // 5. Tap to edit: a tap on the page tells the admin which part (and which item: an article, a question, a country ...) to open.
  //    The admin also asks this page to show one item (__khipFocusItem) when it is opened there.
  var pickOn=Q.get('pick')!=='0',pst=null;
  function pickCss(){
    if(!pst){pst=document.createElement('style');pst.id='khip-pv-pick';(document.head||document.documentElement).appendChild(pst)}
    pst.textContent=pickOn?'[data-sec]:hover,[data-lay]:hover,figure[data-imgid]:hover{outline:2px dashed rgba(29,78,216,.55);outline-offset:-2px;cursor:pointer}.khip-pv-item{outline:3px solid #f59e0b!important;outline-offset:2px;border-radius:.75rem}':'.khip-pv-item{outline:3px solid #f59e0b!important;outline-offset:2px;border-radius:.75rem}';
  }
  window.__khipPick=function(on){pickOn=!!on;pickCss()};
  var nth=function(list,el){return Array.prototype.indexOf.call(list,el)};
  function itemOf(t){
    var x;
    if((x=t.closest('[data-act="news"][data-id]')))return {list:'news',id:x.getAttribute('data-id')};
    if((x=t.closest('[data-faq] details[data-i]')))return {faq:(x.closest('[data-faq]')||{}).getAttribute?x.closest('[data-faq]').getAttribute('data-faq'):'',i:+x.getAttribute('data-i')};
    if((x=t.closest('.tcard')))return {list:'testimonials',i:nth(x.parentElement.children,x)};
    if((x=t.closest('#carousel .slide')))return {list:'carousel',i:nth(document.querySelectorAll('#carousel .slide'),x)};
    if((x=t.closest('.tm-item')))return {list:'employees',name:((x.querySelector('h3,h4,.font-semibold')||{}).textContent||'').trim(),i:nth(x.parentElement.children,x)};
    if((x=t.closest('[data-n]'))&&x.closest('#mena-map,#map-chips'))return {list:'jurisdictions',name:x.getAttribute('data-n')};
    if((x=t.closest('[data-jur-i]')))return {list:'jurisdictions',i:+x.getAttribute('data-jur-i')};
    if((x=t.closest('.svc-sub,[data-act="service"],[data-svc]')))return {list:'services',name:(x.getAttribute('data-svc')||x.textContent||'').trim()};
    return null;
  }
  document.addEventListener('click',function(e){
    if(!pickOn||!P.pick)return;
    var t=e.target&&e.target.closest?e.target:null;if(!t||t.closest('#khip-bar,header,.khip-oc'))return;
    var f=t.closest('figure[data-imgid]'),sec=t.closest('[data-sec],[data-lay]');
    var key=f&&!f.closest('[data-imgsec]')?(PAGE+'-image-'+f.getAttribute('data-imgid')):sec?(sec.getAttribute('data-sec')||sec.getAttribute('data-lay')):'';
    if(!key)return;
    e.preventDefault();e.stopPropagation();
    try{P.pick({key:key,item:itemOf(t)})}catch(x){}
  },true);
  var PAGE=({'index.html':'home','about.html':'about','patents.html':'patents','trademarks.html':'trademarks','translation.html':'translation'})[location.pathname.split('/').pop()||'index.html']||'home';
  window.__khipFocusItem=function(o){
    document.querySelectorAll('.khip-pv-item').forEach(function(e){e.classList.remove('khip-pv-item')});
    if(!o)return;
    var el=null,all,i;
    if(o.list==='news')el=document.querySelector('[data-act="news"][data-id="'+String(o.id).replace(/"/g,'')+'"]');
    else if(o.faq)el=document.querySelectorAll('[data-faq="'+o.faq+'"] details[data-i]')[o.i];
    else if(o.list==='testimonials')el=document.querySelectorAll('.tcard')[o.i];
    else if(o.list==='carousel')el=document.querySelectorAll('#carousel .slide')[o.i]?document.getElementById('carousel'):null;
    else if(o.list==='jurisdictions'){el=document.querySelector('#map-chips [data-n="'+String(o.name).replace(/"/g,'')+'"]');if(!el){all=document.querySelectorAll('[data-jur-i]');for(i=0;i<all.length;i++)if((all[i].textContent||'').indexOf(o.name)>=0)el=all[i]}}
    else if(o.list==='employees'){all=document.querySelectorAll('.tm-item');for(i=0;i<all.length;i++)if(o.name&&(all[i].textContent||'').indexOf(o.name)>=0){el=all[i];break}}
    else if(o.list==='services'){all=document.querySelectorAll('.svc-sub,[data-act="service"],[data-svc]');for(i=0;i<all.length;i++)if(o.name&&(all[i].textContent||'').indexOf(o.name)>=0){el=all[i].closest('.svc-card')&&all[i].matches('[data-act="service"]:not(.svc-sub)')?all[i].closest('.svc-card'):all[i];break}}
    if(!el)return;
    try{                                                    // a slider that shows one at a time: bring that one in
      if(o.list==='news'&&window.setN&&+getComputedStyle(el).opacity<.1)window.setN(nth(document.querySelectorAll('#news-list>.ncard'),el));
      if(o.list==='testimonials'&&window.setT)window.setT(o.i);
      if(o.list==='carousel'&&window.setSlide)window.setSlide(o.i);
    }catch(x){}
    el.classList.add('khip-pv-item');
    var hp=el.parentElement;                               // a card in a sliding row: slide the row to it (never scroll the admin page around the frame)
    while(hp&&hp!==document.body){if(hp.scrollWidth>hp.clientWidth+4&&/(auto|scroll)/.test(getComputedStyle(hp).overflowX)){hp.scrollLeft+=el.getBoundingClientRect().left-hp.getBoundingClientRect().left-(hp.clientWidth-el.offsetWidth)/2;break}hp=hp.parentElement}
    var hd=document.querySelector('header'),off=hd?hd.offsetHeight:0,p=sc(),r=el.getBoundingClientRect(),base=p?p.getBoundingClientRect().top:0;
    to(Math.max(0,r.top-base+top()-off-40));
  };
  document.addEventListener('DOMContentLoaded',function(){
    cur=Q.get('sec')||'';css();pickCss();
    var y=parseFloat(Q.get('y')),t0=Date.now(),done=false;
    var tick=function(){
      if(done)return;
      var el=cur?target(cur):null,f=full(),ready=cur&&cur!=='home-hero'?(el&&el.offsetParent!==null):(f.h>(isFinite(y)?y:0)+f.v);
      if(ready||Date.now()-t0>4000){
        done=true;
        if(isFinite(y)&&y>0)to(y);else focus(cur);
        try{P.loaded&&P.loaded(location.pathname.split('/').pop()||'index.html',window)}catch(e){}
        return;
      }
      setTimeout(tick,120);
    };
    setTimeout(tick,150);
    (sc()||window).addEventListener('scroll',function(){try{P.scrolled&&P.scrolled(top())}catch(e){}},{passive:true});
  });
})();

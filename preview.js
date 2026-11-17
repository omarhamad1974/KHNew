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
      +(cur&&Q.get('hl')!=='0'?'[data-sec="'+cur+'"]{outline:3px solid rgba(29,78,216,.7);outline-offset:-3px}':'');
  }
  function target(key){
    if(!key||key==='home-hero')return document.getElementById('carousel')?document.getElementById('carousel').parentElement:null;
    return document.querySelector('[data-sec="'+key+'"]');
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
  document.addEventListener('DOMContentLoaded',function(){
    cur=Q.get('sec')||'';css();
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

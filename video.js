/* KHIP video.js: the YouTube video sections (home page and About page).
   Data (app-data.json, key "videos"; Arabic title / text / link in app-data.ar.json):
     videos.home  = { hidden, url, title, text, layout, after }
     videos.about = { hidden, url, title, text, layout, after }
       url     any YouTube address (watch?v=, youtu.be/, /embed/, /shorts/, /live/) or the 11-letter video id; a time (?t=90, &start=90) is kept
       title   optional heading;  text  optional text (**bold**, ## subtitle, - bullet)
       layout  side (text beside the video, default) | top (text above) | bottom (text below); no text = the video alone, wide
       after   where it sits. Home: home-hero (default, right under the slider) | home-about | home-jurisdictions | home-services |
               home-news | home-testimonials | home-faq.  About: p1 (after the first paragraph, default) | p2 | about-intro |
               about-map | about-value | about-quote | about-advantages | about-team | about-faq.
   More fields: poster (own cover picture, file in assets/ or web address), autoplay (true: starts muted, looping, when it scrolls into view;
   pauses when it scrolls away; skipped for visitors who ask for less motion or save data, who get the play button), date (YouTube publish date,
   YYYY-MM-DD, for search engines), ctaText + ctaLink (a button: link is "whatsapp", https://..., tel:..., mailto:..., or a page such as about.html).
   Arabic file: title, text, url, ctaText.
   The picture is only a poster: the YouTube player (youtube-nocookie.com) loads when the visitor presses play, so the page stays fast.
   Pages call KVIDEO.render(D,'home'|'about') every time they draw (it removes its own earlier block first).
   Section keys for the admin look controls and the preview: home-video, about-video. */
window.KVIDEO=(function(){
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const txt=v=>typeof v==='string'&&v.trim()!=='';
  const L=(k,d)=>{try{const v=window.KLang&&KLang.t(k);return v&&v!==k?v:d}catch{return d}};
  const ID=/^[\w-]{11}$/;

  /* ---------- the address ---------- */
  function secs(t){                         // 90 | 90s | 1m30s | 1h2m3s
    t=String(t||'').trim();if(!t)return 0;
    if(/^\d+$/.test(t))return +t;
    const m=/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i.exec(t);
    return m?(+m[1]||0)*3600+(+m[2]||0)*60+(+m[3]||0):0;
  }
  function parse(u){
    u=String(u||'').trim();if(!u)return null;
    if(ID.test(u))return {id:u,start:0};
    let url;try{url=new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(u)?u:'https://'+u)}catch{return null}
    const h=url.hostname.toLowerCase().replace(/^(www|m|music)\./,''),p=url.pathname.split('/').filter(Boolean);
    let id='';
    if(h==='youtu.be')id=p[0]||'';
    else if(h==='youtube.com'||h==='youtube-nocookie.com'){
      if(p[0]==='watch')id=url.searchParams.get('v')||'';
      else if(['embed','shorts','live','v'].includes(p[0]))id=p[1]||'';
    }
    if(!ID.test(id))return null;
    return {id,start:secs(url.searchParams.get('t')||url.searchParams.get('start')||(url.hash.match(/t=([\w]+)/)||[])[1])};
  }

  /* ---------- the player: a poster first, the real player when it is pressed ---------- */
  const PLAY='<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 5.14v13.72a1 1 0 0 0 1.53.85l10.9-6.86a1 1 0 0 0 0-1.7L9.53 4.29A1 1 0 0 0 8 5.14z"/></svg>';
  const REDUCED=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SAVE=!!(navigator.connection&&navigator.connection.saveData);
  const posterSrc=u=>{u=String(u||'').trim();if(!u)return '';const f=/^(https?:\/\/|\.\/|\/|data:image)/.test(u)?u:'./assets/'+u;return window.KVER&&KVER.img?KVER.img(f):f};
  function frame(v,title,o){
    o=o||{};const lab=L('video_play','Play video')+(title?': '+title:''),auto=o.auto&&!REDUCED&&!SAVE;
    const own=posterSrc(o.poster),src=own||`https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg`,set=own&&window.KVER&&KVER.set?KVER.set(o.poster,o.sizes,'(min-width:1024px) 40rem, 100vw'):'';
    return `<div class="kv-frame${auto?' kv-auto':''}" data-kv="${v.id}" data-start="${v.start||0}" data-auto="${auto?1:0}" data-own="${own?1:0}" data-title="${esc(title||L('video_play','Play video'))}"><button type="button" class="kv-play" aria-label="${esc(lab)}"><img class="kv-thumb" src="${esc(src)}"${set} alt="" loading="lazy" decoding="async"><span class="kv-btn">${PLAY}</span></button></div>`;
  }
  const params=(f,auto)=>{
    const q=new URLSearchParams({autoplay:'1',rel:'0',playsinline:'1',modestbranding:'1'});
    if(+f.dataset.start)q.set('start',f.dataset.start);
    if(window.KLang&&KLang.rtl)q.set('hl','ar');
    if(auto){q.set('mute','1');q.set('loop','1');q.set('playlist',f.dataset.kv);q.set('enablejsapi','1');q.set('origin',location.origin)}
    return q;
  };
  function player(f,auto){
    const fr=document.createElement('iframe');
    fr.src=`https://www.youtube-nocookie.com/embed/${f.dataset.kv}?${params(f,auto)}`;
    fr.title=f.dataset.title;fr.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen';
    fr.allowFullscreen=true;fr.referrerPolicy='strict-origin-when-cross-origin';
    return fr;
  }
  const cmd=(fr,fn)=>{try{fr.contentWindow.postMessage(JSON.stringify({event:'command',func:fn,args:[]}),'*')}catch{}};
  function wire(root){
    root.querySelectorAll('.kv-frame').forEach(f=>{
      const im=f.querySelector('.kv-thumb');
      if(im){
        const yt=q=>`https://i.ytimg.com/vi/${f.dataset.kv}/${q}.jpg`;
        const lo=()=>{im.onerror=()=>{im.style.display='none'};im.removeAttribute('srcset');im.src=yt('hqdefault')};   // own picture or large picture missing: YouTube's picture; second failure: plain dark poster
        im.onerror=lo;
        if(f.dataset.own!=='1')im.onload=()=>{if(im.naturalWidth&&im.naturalWidth<=160&&!im.dataset.lo){im.dataset.lo=1;lo()}};   // YouTube's grey stand-in
      }
      if(f.dataset.auto==='1'&&window.IntersectionObserver){      // silent loop: loads when half in view, pauses when out of view
        let fr=null,on=false;
        const vis=new IntersectionObserver(es=>es.forEach(x=>{
          const now=x.isIntersecting&&x.intersectionRatio>=.4;
          if(now&&!fr){
            fr=player(f,true);fr.style.opacity='0';fr.style.transition='opacity .5s';
            fr.addEventListener('load',()=>{fr.style.opacity='1';const p=f.querySelector('.kv-play');if(p)setTimeout(()=>p.remove(),520)});
            f.appendChild(fr);on=true;
          }else if(fr&&now!==on){on=now;cmd(fr,now?'playVideo':'pauseVideo')}
        }),{threshold:[0,.4,1]});
        vis.observe(f);
        f.querySelector('.kv-play').addEventListener('click',()=>{if(!fr){fr=player(f,false);f.replaceChildren(fr);fr.focus();vis.disconnect()}});
        return;
      }
      f.querySelector('.kv-play').addEventListener('click',()=>{const fr=player(f,false);f.replaceChildren(fr);fr.focus()},{once:true});
    });
  }

  /* ---------- the button ---------- */
  // link: "whatsapp" (chat with the number set in General, Contact), a web address, tel:, mailto:, a page of the site (about.html, about.html#team) or #section
  const ctaKind=l=>{l=String(l||'').trim();return /^whatsapp$/i.test(l)?'wa':/^(https?:\/\/\S+|tel:\+?[\d\s().-]{5,}|mailto:\S+@\S+)$/i.test(l)?'ext':/^([\w-]+\.html)?(#[\w-]+)?$/.test(l)&&l?'int':''};
  function cta(v,D){
    const label=txt(v.ctaText)?v.ctaText.trim():'',l=String(v.ctaLink||'').trim(),k=ctaKind(l);
    if(!label||!k)return '';
    let href=l;
    if(k==='wa'){const n=String(((D||{}).contact||{}).whatsapp||'').replace(/\D/g,'');if(!n)return '';href='https://wa.me/'+n}
    const out=k==='wa'||(k==='ext'&&/^https?:/i.test(l)),ic=k==='wa'?'ph-whatsapp-logo':'ph-arrow-right rtl:-scale-x-100';
    return `<div class="kv-cta mt-7"><a href="${esc(href)}"${out?' target="_blank" rel="noopener"':''} class="inline-flex items-center gap-2 text-sm border border-ink/30 hover:bg-ink hover:text-white px-9 py-2.5 rounded-full transition">${esc(label)} <i class="ph-light ${ic}"></i></a></div>`;
  }

  /* ---------- the block ---------- */
  function section(key,v,pv,bgClass,D){
    const title=txt(v.title)?v.title.trim():'',body=txt(v.text)?v.text:'',lay=['top','bottom'].includes(v.layout)?v.layout:'side';
    const head=title?`<h2 class="h2">${esc(title)}</h2><span class="rule"></span>`:'';
    const text=body?`<div class="kv-text text-base md:text-lg leading-relaxed">${KRich.rich(body)}</div>`:'',btn=cta(v,D),fo={poster:v.poster,auto:v.autoplay===true,sizes:(D||{}).imgSizes};
    const copy=cls=>`<div class="fu kv-copy ${cls}">${head}${text}${btn}</div>`;
    const media=`<div class="fu kv-media" style="--d:.1s">${frame(pv,title,fo)}</div>`;
    let inner;
    if(!title&&!body)inner=`<div class="wrap"><div class="kv-wide">${media}${btn?`<div class="fu text-center">${btn}</div>`:''}</div></div>`;
    else if(lay==='side')inner=`<div class="wrap grid lg:grid-cols-2 gap-8 lg:gap-14 items-center">${copy('')}${media}</div>`;
    else inner=`<div class="wrap"><div class="kv-wide">${lay==='top'?copy('mb-8')+media:media+copy('mt-8')}</div></div>`;
    const el=document.createElement('section');
    el.id='video';el.dataset.sec=key;el.dataset.kv='block';el.className='band '+bgClass;el.innerHTML=inner;
    return el;
  }
  function inline(key,v,pv,D){                                    // inside the About text, between two paragraphs
    const title=txt(v.title)?v.title.trim():'',body=txt(v.text)?v.text:'';
    const el=document.createElement('div');
    el.id='video';el.dataset.sec=key;el.dataset.kv='block';el.className='kv-inline fu';
    el.innerHTML=(title?`<h2 class="font-display text-2xl md:text-3xl font-medium text-title mb-3">${esc(title)}</h2>`:'')+frame(pv,title,{poster:v.poster,auto:v.autoplay===true,sizes:(D||{}).imgSizes})+(body?`<div class="kv-text text-base leading-relaxed mt-4">${KRich.rich(body)}</div>`:'')+cta(v,D);
    return el;
  }

  const io=window.IntersectionObserver?new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.08}):null;
  const reveal=el=>el.querySelectorAll('.fu').forEach(e=>io?io.observe(e):e.classList.add('in'));

  /* ---------- where it goes ---------- */
  const HOME=[['home-hero','Right under the slider'],['home-about','After the logo and About text'],['home-jurisdictions','After the regional map'],['home-services','After Services'],['home-news','After Latest news'],['home-testimonials','After Client endorsements'],['home-faq','After the FAQ']];
  const ABOUT=[['p1','After the first paragraph'],['p2','After the second paragraph'],['about-intro','After the whole About KHIP section'],['about-map','After Jurisdictions'],['about-value','After KHIP Value'],['about-quote','After the Quote'],['about-advantages','After Advantages'],['about-team','After Our team'],['about-faq','After the FAQ']];
  const anchor=(page,after)=>{
    if(after==='home-hero'){const c=document.getElementById('carousel');return c&&c.closest('section')}
    if(after==='p1'||after==='p2')return document.querySelector(`[data-tx="about.${after}"]`);
    return document.querySelector(`[data-sec="${after}"]`);
  };
  const defaultAfter=page=>page==='home'?'home-hero':'p1';

  function render(D,page){
    document.querySelectorAll('[data-kv="block"]').forEach(e=>e.remove());                // draw again from scratch
    const v=((D||{}).videos||{})[page],key=page+'-video';
    if(!v||v.hidden===true)return;
    const pv=parse(v.url);if(!pv)return;
    const ok=(page==='home'?HOME:ABOUT).some(x=>x[0]===v.after);
    const a=anchor(page,ok?v.after:defaultAfter(page))||anchor(page,defaultAfter(page));
    if(!a)return;
    let el;
    if(page==='about'&&(a.matches('[data-tx]'))){el=inline(key,v,pv,D);a.after(el)}
    else{
      const target=a.matches&&a.matches('section')?a:a.closest('section');
      if(!target)return;
      el=section(key,v,pv,target.classList.contains('bg-surface')?'':'bg-surface',D);   // white band after a plain one, plain after a white one
      target.after(el);
    }
    wire(el);
    if(window.KTHEME&&KTHEME.current&&KTHEME.apply)try{KTHEME.apply({theme:KTHEME.current})}catch{}    // backgrounds, header parts and fonts set for this section
    reveal(el);
  }
  return {parse,render,ctaKind,HOME,ABOUT,defaultAfter};
})();

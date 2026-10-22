/* Shared sticky bottom bar (WhatsApp chat box + navigation). Self-contained: add
   <script src="footer.js"></script> before </body> on every page, including about.html. */
(function(){
  const PHONE="201006552255";
  let prompts=["Hello KHIP, I'd like to register a trademark in Egypt","How long does a patent filing take in the UAE?","Can you translate my patent into Arabic?","What documents do I need for a PCT national phase entry?"];
  const wa=t=>window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(t)}`,'_blank','noopener');
  window.KHIP={wa,setPrompts:a=>{if(a&&a.length)prompts=a}};
  if(!document.querySelector('link[href*="phosphor"]')){const l=document.createElement('link');l.rel='stylesheet';l.href='https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/light/style.css';document.head.appendChild(l)}
  const st=document.createElement('style');
  st.textContent=`#khip-bar{position:fixed;left:0;right:0;bottom:0;z-index:40;background:rgba(255,255,255,.92);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-top:1px solid #e7e5e4;box-shadow:0 -8px 30px rgba(20,30,50,.08);padding-bottom:env(safe-area-inset-bottom);font-family:inherit}
#khip-bar *{box-sizing:border-box}#khip-bar .kin{max-width:48rem;margin:0 auto}
#khip-bar form{display:flex;gap:8px;padding:10px 12px 6px;margin:0}#khip-bar .kf{position:relative;flex:1}
#khip-bar .kf i{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#047857;font-size:18px}
#khip-bar input{width:100%;padding:10px 16px 10px 40px;font:inherit;font-size:16px;border:1px solid #d6d3d1;border-radius:999px;background:#fff;color:#1c1917;outline:none;transition:border-color .2s}
#khip-bar input:focus{border-color:#059669}
#khip-bar .ks{background:#047857;color:#fff;border:0;border-radius:999px;padding:0 20px;font:inherit;font-size:14px;cursor:pointer;transition:background .2s,transform .1s}
#khip-bar .ks:hover{background:#065f46}#khip-bar .ks:active{transform:scale(.95)}
#khip-bar nav{display:grid;grid-template-columns:repeat(5,1fr);text-align:center;padding-bottom:8px}
#khip-bar nav button{background:none;border:0;padding:6px 0;font:inherit;font-size:11px;color:#57534e;cursor:pointer;transition:color .2s}
#khip-bar nav button:hover{color:#1d4ed8}#khip-bar nav i{display:block;font-size:22px;line-height:1.3}`;
  document.head.appendChild(st);
  const nav=[['jurisdictions','ph-globe-hemisphere-west','Countries'],['services','ph-seal-check','Services'],['top','ph-house','Home'],['news','ph-newspaper','News'],['about','ph-info','About']];
  const bar=document.createElement('div');bar.id='khip-bar';
  bar.innerHTML=`<div class="kin"><form><div class="kf"><i class="ph-light ph-whatsapp-logo"></i><input aria-label="Message KHIP on WhatsApp" autocomplete="off"></div><button class="ks">Send</button></form><nav>${nav.map(([k,i,l])=>`<button type="button" data-go="${k}"><i class="ph-light ${i}"></i>${l}</button>`).join('')}</nav></div>`;
  document.body.appendChild(bar);document.body.style.paddingBottom='9rem';
  const inp=bar.querySelector('input');
  bar.querySelector('form').addEventListener('submit',e=>{e.preventDefault();const v=inp.value.trim();if(v){wa(v);inp.value=''}});
  bar.addEventListener('click',e=>{
    const b=e.target.closest('[data-go]');if(!b)return;const k=b.dataset.go,el=document.getElementById(k);
    if(k==='top')document.getElementById('app-top')?scrollTo({top:0,behavior:'smooth'}):location.href='index.html';
    else el&&el.offsetParent!==null?el.scrollIntoView({behavior:'smooth'}):location.href='index.html#'+k;
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

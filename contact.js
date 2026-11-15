/* Contact details and social links, from app-data.json (admin, General tab, "Contact details & social links").
   Loaded after footer.js on every public page. Fills:
   - the round social icons in the header (#socials)
   - the WhatsApp number of the chat box at the bottom
   - the About page contact block: follow buttons (#ct-follow), phone / email / address tiles, the map (#ct-map)
   - the email and phone buttons on the Patents, Trademarks and Translation pages ([data-ct="email"], [data-ct="phone"])
   If app-data.json has no "contact" block at all, the texts written in the pages are left as they are. */
(function(){
  if(!window.KLang)return;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const NET={linkedin:['ph-linkedin-logo','LinkedIn'],youtube:['ph-youtube-logo','YouTube'],facebook:['ph-facebook-logo','Facebook'],instagram:['ph-instagram-logo','Instagram'],x:['ph-x-logo','X'],tiktok:['ph-tiktok-logo','TikTok']};
  const list=v=>(Array.isArray(v)?v:String(v||'').split('\n')).map(x=>String(x).trim()).filter(Boolean);
  const tel=p=>'tel:'+String(p).replace(/[^\d+]/g,'');
  const tile=(href,ico,tx,label,body,ltr)=>`<${href?`a href="${esc(href)}"`:'div'} class="ct-tile"><span class="ct-ico"><i class="ph-light ${ico}"></i></span><span><span class="block text-xs uppercase tracking-widest text-stone-500" data-tx="${tx}">${label}</span><span class="block text-base text-ink"${ltr?' dir="ltr" style="unicode-bidi:plaintext"':''}>${body}</span></span></${href?'a':'div'}>`;
  const mapQ=m=>encodeURIComponent(String(m).replace(/\s+/g,' ').trim());

  function run(D){
    const c=D.contact,s=D.social||{};
    const nets=Object.keys(NET).filter(k=>/^https:\/\//.test(String(s[k]||'')));
    // header icons
    const so=document.getElementById('socials');
    if(so)so.innerHTML=nets.map(k=>`<a href="${esc(s[k])}" target="_blank" rel="noopener noreferrer" aria-label="${NET[k][1]}" class="w-10 h-10 rounded-full border border-stone-200 text-stone-600 hover:text-brand-600 hover:border-brand-600 flex items-center justify-center transition"><i class="ph-light ${NET[k][0]} text-xl"></i></a>`).join('');
    // About page: follow buttons
    const fo=document.getElementById('ct-follow');
    if(fo)fo.innerHTML=nets.map(k=>`<a href="${esc(s[k])}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 bg-ink hover:bg-brand-600 text-white text-sm px-5 py-2.5 rounded-full transition"><i class="ph-light ${NET[k][0]} text-xl"></i> ${NET[k][1]}</a>`).join('');
    if(!c||typeof c!=='object')return;
    const phones=list(c.phones),emails=list(c.emails),addr=list(c.address);
    if(window.KHIP&&KHIP.setPhone&&c.whatsapp)KHIP.setPhone(c.whatsapp);
    // About page: tiles + map
    const map=document.getElementById('ct-map');
    if(map){
      const host=map.parentElement;
      host.querySelectorAll('.ct-tile').forEach(e=>e.remove());
      const html=phones.map(p=>tile(tel(p),'ph-phone','about.span1','Phone',esc(p),true)).join('')
        +emails.map(m=>tile('mailto:'+m,'ph-envelope-simple','about.span2','Email',esc(m),true)).join('')
        +(addr.length?tile('','ph-map-pin','about.span3','Address',addr.map(esc).join('<br>')):'');
      map.insertAdjacentHTML('beforebegin',html);KLang.tx(host);
      const m=String(c.map||'').trim();
      if(m){
        const q=mapQ(m);
        map.querySelector('iframe').src=`https://www.google.com/maps?q=${q}&z=17&hl=en&output=embed`;
        const a=map.querySelector('a');if(a)a.href=`https://www.google.com/maps?q=${q}&z=17&hl=en`;
      }
      map.hidden=!m;
    }
    // service pages: email and phone buttons
    document.querySelectorAll('[data-ct="email"]').forEach(a=>{if(emails[0]){a.href='mailto:'+emails[0]+'?subject=Request for information';a.textContent=emails[0];a.hidden=false}else a.hidden=true});
    document.querySelectorAll('[data-ct="phone"]').forEach(a=>{if(phones[0]){a.href=tel(phones[0]);a.textContent=phones[0];a.hidden=false}else a.hidden=true});
  }
  KLang.data().then(run).catch(()=>{});
})();

// Validates app-data.json and app-data.ar.json. Run from the project root: node scripts/validate.js
const fs=require('fs'),path=require('path');
const read=f=>JSON.parse(fs.readFileSync(f,'utf8')),errs=[],warn=[];
const d=read('app-data.json');
const need={carousel:['id','title'],jurisdictions:['id','country'],news:['id','title','excerpt'],services:['id','title','description'],products:['id','title'],testimonials:['id','name','text'],employees:['id','name','position']};
// Same rule as the site: a bare file name lives in ./assets/
const resolve=u=>/^(https?:|data:)/.test(u)?null:(/^(\.\/|\/)/.test(u)?u.replace(/^\//,'./'):'./assets/'+u);
for(const [k,fields] of Object.entries(need)){
  const arr=d[k];if(!Array.isArray(arr)){errs.push(`${k}: must be an array`);continue}
  const ids=new Set();
  arr.forEach((x,i)=>{
    fields.forEach(f=>{if(!String(x[f]??'').trim())errs.push(`${k}[${i}]: missing "${f}"`)});
    if(ids.has(x.id))errs.push(`${k}[${i}]: duplicate id "${x.id}"`);ids.add(x.id);
    if(typeof x.image==='string'&&x.image){const f=resolve(x.image);if(f&&!fs.existsSync(path.join('.',f)))errs.push(`${k}[${i}]: image not found ${x.image}`)}
    if(k==='jurisdictions'&&x.code&&!/^[a-z]{2}$/i.test(x.code))errs.push(`${k}[${i}]: code must be 2 letters`);
    if(k==='services'&&x.page&&!/^[\w-]+\.html$/.test(x.page))errs.push(`${k}[${i}]: page must look like patents.html`);
  });
}
if(!d.about&&!d.aboutMainText)errs.push('missing about text');
if(d.chatPrompts!==undefined&&!(Array.isArray(d.chatPrompts)&&d.chatPrompts.every(x=>typeof x==='string')))errs.push('chatPrompts must be a list of text lines');
for(const [k,v] of Object.entries(d.social||{}))if(v&&!/^https:\/\//.test(v))errs.push(`social.${k}: must start with https://`);
const H=(d.theme||{}).hero;
if(H!==undefined){
  if(H.unit&&!['px','vh'].includes(H.unit))errs.push('theme.hero.unit must be px or vh');
  const lim=H.unit==='vh'?[15,100]:[100,900];
  ['mobile','tablet','desktop'].forEach(k=>{const n=Number(H[k]);if(!(n>=lim[0]&&n<=lim[1]))errs.push(`theme.hero.${k}: must be between ${lim[0]} and ${lim[1]}`)});
}
if(d.faq!==undefined){
  const P=['home','about','patents','trademarks','translation'],pg=(d.faq||{}).pages||{};
  for(const k of Object.keys(pg)){
    if(!P.includes(k)){errs.push(`faq.pages.${k}: unknown page (use ${P.join(', ')})`);continue}
    if(!Array.isArray(pg[k].items||[])){errs.push(`faq.pages.${k}.items: must be a list`);continue}
    (pg[k].items||[]).forEach((x,i)=>{if(!String(x.q||'').trim()||!String(x.a||'').trim())errs.push(`faq.pages.${k}.items[${i}]: needs both q (question) and a (answer)`)});
  }
}

// ---- Arabic file: every item must belong to an item of the English file (matched by id) ----
const FAQP=['home','about','patents','trademarks','translation'];
if(fs.existsSync('app-data.ar.json')){
  let a=null;try{a=read('app-data.ar.json')}catch(e){errs.push('app-data.ar.json: not valid JSON ('+e.message+')')}
  if(a){
    for(const k of ['carousel','jurisdictions','news','services','testimonials','employees','products']){
      if(a[k]===undefined)continue;
      if(!Array.isArray(a[k])){errs.push(`ar ${k}: must be an array`);continue}
      const have=new Set((d[k]||[]).map(x=>String(x.id)));
      a[k].forEach((x,i)=>{if(!x||x.id==null||!have.has(String(x.id)))errs.push(`ar ${k}[${i}]: id "${x&&x.id}" does not exist in app-data.json`)});
    }
    if(a.faq!==undefined){
      const ap=(a.faq||{}).pages||{},ep=((d.faq||{}).pages)||{};
      for(const k of Object.keys(ap)){
        if(!FAQP.includes(k)){errs.push(`ar faq.pages.${k}: unknown page (use ${FAQP.join(', ')})`);continue}
        const have=new Set(((ep[k]||{}).items||[]).map(x=>String(x.id)));
        (ap[k].items||[]).forEach((x,i)=>{if(!x||!have.has(String(x.id)))errs.push(`ar faq.pages.${k}.items[${i}]: id "${x&&x.id}" does not exist in the English FAQ`)});
      }
    }
    if(a.ui!==undefined&&(typeof a.ui!=='object'||Array.isArray(a.ui)))errs.push('ar ui: must be an object');
  }
}
if(errs.length){console.error(errs.join('\n'));process.exit(1)}
console.log('app-data.json'+(fs.existsSync('app-data.ar.json')?' and app-data.ar.json':'')+' OK');

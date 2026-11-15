// Validates app-data.json. Run: node scripts/validate.js
const fs=require('fs'),path=require('path');
const d=JSON.parse(fs.readFileSync('app-data.json','utf8')),errs=[];
const need={carousel:['id','title'],jurisdictions:['id','country'],news:['id','title','excerpt'],services:['id','title','description'],products:['id','title'],testimonials:['id','name','text'],employees:['id','name','position']};
for(const [k,fields] of Object.entries(need)){
  const arr=d[k];if(!Array.isArray(arr)){errs.push(`${k}: must be an array`);continue}
  const ids=new Set();
  arr.forEach((x,i)=>{
    fields.forEach(f=>{if(!x[f])errs.push(`${k}[${i}]: missing "${f}"`)});
    if(ids.has(x.id))errs.push(`${k}[${i}]: duplicate id "${x.id}"`);ids.add(x.id);
    if(typeof x.image==='string'&&x.image.startsWith('./')&&!fs.existsSync(path.join('.',x.image)))errs.push(`${k}[${i}]: image not found ${x.image}`);
  });
}
if(!d.about&&!d.aboutMainText)errs.push('missing about text');
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
if(errs.length){console.error(errs.join('\n'));process.exit(1)}
console.log('app-data.json OK');

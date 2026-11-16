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
// ---- Look settings (admin tabs Header & bar, Cards, ...). Colors are "role:<name>", "custom:<id>" or #rrggbb ----
{
  const T=d.theme||{},ROLES=['title','ink','gold','accent','accentDark','accentSoft','sand','page','surface','text'];
  const ownIds=new Set((T.custom||[]).map(c=>String(c.id)));
  const color=(path,v)=>{
    if(v===undefined||v===null||v==='')return;
    if(typeof v!=='string'||!/^(role:[A-Za-z]+|custom:[\w-]+|#[0-9a-fA-F]{6})$/.test(v)){errs.push(`theme.${path}: not a valid color (${v})`);return}
    if(v.startsWith('role:')&&!ROLES.includes(v.slice(5)))errs.push(`theme.${path}: unknown palette color "${v.slice(5)}"`);
    if(v.startsWith('custom:')&&!ownIds.has(v.slice(7)))errs.push(`theme.${path}: your own color "${v.slice(7)}" does not exist`);
  };
  const range=(path,v,lo,hi)=>{if(v===undefined||v===null||v==='')return;const n=Number(v);if(!(n>=lo&&n<=hi))errs.push(`theme.${path}: must be between ${lo} and ${hi}`)};
  const group=(key,colors,numbers)=>{
    const g=T[key];if(g===undefined)return;
    if(typeof g!=='object'||g===null||Array.isArray(g)){errs.push(`theme.${key}: must be an object`);return}
    colors.forEach(c=>color(`${key}.${c}`,g[c]));
    Object.entries(numbers||{}).forEach(([n,[lo,hi]])=>range(`${key}.${n}`,g[n],lo,hi));
  };
  group('header',['bg','text','border'],{opacity:[0,100]});
  group('bar',['bg','text']);
  group('wa',['bg','text','border','btn','btnText'],{opacity:[0,100]});
  group('cards',['bg','text','title','border'],{opacity:[0,100]});
  if(T.secCards!==undefined){
    if(typeof T.secCards!=='object'||T.secCards===null||Array.isArray(T.secCards))errs.push('theme.secCards: must be an object');
    else for(const [k,v] of Object.entries(T.secCards)){
      if(!/^[a-z]+-[a-z-]+$/.test(k))errs.push(`theme.secCards.${k}: not a section name`);
      ['bg','text','title','border'].forEach(c=>color(`secCards.${k}.${c}`,(v||{})[c]));
      range(`secCards.${k}.opacity`,(v||{}).opacity,0,100);
    }
  }
}
// ---- Look phase 2: text alignment and logos ----
{
  const T=d.theme||{},AL=['start','center','end','justify'],SEC=/^[a-z]+-[a-z-]+$/;
  const al=(path,o)=>{if(o===undefined)return;if(typeof o!=='object'||o===null||Array.isArray(o)){errs.push(`theme.${path}: must be an object`);return}
    for(const k of Object.keys(o)){if(!['m','t','d'].includes(k))errs.push(`theme.${path}.${k}: use m (phone), t (tablet) or d (desktop)`);else if(o[k]!==''&&!AL.includes(o[k]))errs.push(`theme.${path}.${k}: must be ${AL.join(', ')} (is "${o[k]}")`)}};
  if(T.align!==undefined){
    if(typeof T.align!=='object'||T.align===null||Array.isArray(T.align))errs.push('theme.align: must be an object');
    else{al('align.all',T.align.all);
      for(const [k,o] of Object.entries(T.align.sec||{})){if(!SEC.test(k))errs.push(`theme.align.sec.${k}: not a section name`);al(`align.sec.${k}`,o)}}
  }
  if(T.logos!==undefined){
    const LIM={header:[60,500],home:[40,600],about:[40,600]};
    if(typeof T.logos!=='object'||T.logos===null||Array.isArray(T.logos))errs.push('theme.logos: must be an object');
    else for(const [k,o] of Object.entries(T.logos)){
      if(!LIM[k]){errs.push(`theme.logos.${k}: unknown logo (use header, home or about)`);continue}
      for(const x of ['m','t','d']){if(o[x]===undefined||o[x]==='')continue;const n=Number(o[x]);if(!(n>=LIM[k][0]&&n<=LIM[k][1]))errs.push(`theme.logos.${k}.${x}: must be between ${LIM[k][0]} and ${LIM[k][1]}`)}
      if(typeof o.image==='string'&&o.image){const f=resolve(o.image);if(f&&!fs.existsSync(path.join('.',f)))errs.push(`theme.logos.${k}.image: image not found ${o.image}`)}
    }
  }
}
// ---- Look phase 3: menu ----
{
  const M=(d.theme||{}).menu;
  if(M!==undefined){
    if(typeof M!=='object'||M===null||Array.isArray(M))errs.push('theme.menu: must be an object');
    else{
      if(M.mode!==undefined&&M.mode!==''&&!['bottom','both'].includes(M.mode))errs.push(`theme.menu.mode: must be bottom or both (is "${M.mode}")`);
      if(M.side!==undefined&&M.side!==''&&M.side!=='end')errs.push('theme.menu.side: must be end (or left out)');
      if(M.keepNav!==undefined&&typeof M.keepNav!=='boolean')errs.push('theme.menu.keepNav: must be true or false');
      const T=d.theme,own=new Set((T.custom||[]).map(c=>String(c.id)));
      ['bg','text'].forEach(c=>{const v=M[c];if(v===undefined||v==='')return;if(typeof v!=='string'||!/^(role:[A-Za-z]+|custom:[\w-]+|#[0-9a-fA-F]{6})$/.test(v))errs.push(`theme.menu.${c}: not a valid color (${v})`);else if(v.startsWith('custom:')&&!own.has(v.slice(7)))errs.push(`theme.menu.${c}: your own color "${v.slice(7)}" does not exist`)});
      [['overlay',0,80],['width',240,480]].forEach(([k,lo,hi])=>{if(M[k]===undefined||M[k]==='')return;const n=Number(M[k]);if(!(n>=lo&&n<=hi))errs.push(`theme.menu.${k}: must be between ${lo} and ${hi}`)});
    }
  }
}
// ---- Look phase 4: image effects ----
{
  const X=(d.theme||{}).imgfx;
  if(X!==undefined){
    const T=d.theme,own=new Set((T.custom||[]).map(c=>String(c.id))),ROLES=['title','ink','gold','accent','accentDark','accentSoft','sand','page','surface','text'];
    const fx=(path,o)=>{
      if(o===undefined)return;
      if(typeof o!=='object'||o===null||Array.isArray(o)){errs.push(`theme.imgfx.${path}: must be an object`);return}
      for(const k of Object.keys(o))if(!['opacity','color','intensity'].includes(k))errs.push(`theme.imgfx.${path}.${k}: unknown setting (use opacity, color, intensity)`);
      ['opacity','intensity'].forEach(k=>{if(o[k]===undefined||o[k]==='')return;const n=Number(o[k]);if(!(n>=0&&n<=100))errs.push(`theme.imgfx.${path}.${k}: must be between 0 and 100`)});
      const v=o.color;if(v!==undefined&&v!==''){
        if(typeof v!=='string'||!/^(role:[A-Za-z]+|custom:[\w-]+|#[0-9a-fA-F]{6})$/.test(v))errs.push(`theme.imgfx.${path}.color: not a valid color (${v})`);
        else if(v.startsWith('role:')&&!ROLES.includes(v.slice(5)))errs.push(`theme.imgfx.${path}.color: unknown palette color "${v.slice(5)}"`);
        else if(v.startsWith('custom:')&&!own.has(v.slice(7)))errs.push(`theme.imgfx.${path}.color: your own color "${v.slice(7)}" does not exist`);
      }
    };
    if(typeof X!=='object'||X===null||Array.isArray(X))errs.push('theme.imgfx: must be an object');
    else for(const [k,o] of Object.entries(X)){
      if(['all','hero','news','team','sections'].includes(k))fx(k,o);
      else if(k==='sec'){if(typeof o!=='object'||o===null||Array.isArray(o))errs.push('theme.imgfx.sec: must be an object');else for(const [s,x] of Object.entries(o)){if(!/^[a-z]+-[a-z-]+$/.test(s))errs.push(`theme.imgfx.sec.${s}: not a section name`);fx('sec.'+s,x)}}
      else errs.push(`theme.imgfx.${k}: unknown group (use all, hero, news, team, sections, sec)`);
    }
  }
}
// ---- Look phase 5: animation of cards and text ----
{
  const A=(d.theme||{}).anim;
  if(A!==undefined){
    const EFF=['none','fade','up','down','start','end','zoom','zoomout','flip','blur'],DIST=['small','medium','large'],EASE=['smooth','soft','snappy','bounce','linear'],HOV=['none','lift','zoom','glow'];
    const isObj=o=>typeof o==='object'&&o!==null&&!Array.isArray(o);
    const one=(path,o,cards)=>{
      if(o===undefined)return;
      if(!isObj(o)){errs.push(`theme.anim.${path}: must be an object`);return}
      const known=['effect','distance','speed','delay','stagger','easing','repeat'].concat(cards?['hover']:[]);
      for(const k of Object.keys(o))if(!known.includes(k))errs.push(`theme.anim.${path}.${k}: unknown setting`);
      const pick=(k,list)=>{if(o[k]!==undefined&&o[k]!==''&&!list.includes(o[k]))errs.push(`theme.anim.${path}.${k}: must be ${list.join(', ')} (is "${o[k]}")`)};
      pick('effect',EFF);pick('distance',DIST);pick('easing',EASE);pick('repeat',['always']);if(cards)pick('hover',HOV);
      [['speed',.2,2.5],['delay',0,2],['stagger',0,.5]].forEach(([k,lo,hi])=>{if(o[k]===undefined||o[k]==='')return;const n=Number(o[k]);if(!(n>=lo&&n<=hi))errs.push(`theme.anim.${path}.${k}: must be between ${lo} and ${hi}`)});
    };
    const pair=(path,o)=>{if(o===undefined)return;if(!isObj(o)){errs.push(`theme.anim.${path}: must be an object`);return}
      for(const k of Object.keys(o)){if(k==='cards')one(path+'.cards',o[k],true);else if(k==='text')one(path+'.text',o[k],false);else errs.push(`theme.anim.${path}.${k}: use cards or text`)}};
    if(!isObj(A))errs.push('theme.anim: must be an object');
    else for(const [k,o] of Object.entries(A)){
      if(k==='all')pair('all',o);
      else if(k==='sec'){if(!isObj(o))errs.push('theme.anim.sec: must be an object');else for(const [s,x] of Object.entries(o)){if(!/^[a-z]+-[a-z-]+$/.test(s))errs.push(`theme.anim.sec.${s}: not a section name`);pair('sec.'+s,x)}}
      else errs.push(`theme.anim.${k}: unknown group (use all or sec)`);
    }
  }
}
// ---- Look phase 6: animation of the map and the logos ----
{
  const Mo=(d.theme||{}).motion;
  if(Mo!==undefined){
    const isObj=o=>typeof o==='object'&&o!==null&&!Array.isArray(o);
    const T=d.theme,own=new Set((T.custom||[]).map(c=>String(c.id))),ROLES=['title','ink','gold','accent','accentDark','accentSoft','sand','page','surface','text'];
    const pick=(path,o,k,list)=>{if(o[k]!==undefined&&o[k]!==''&&!list.includes(o[k]))errs.push(`theme.motion.${path}.${k}: must be ${list.join(', ')} (is "${o[k]}")`)};
    const rng=(path,o,k,lo,hi)=>{if(o[k]===undefined||o[k]==='')return;const n=Number(o[k]);if(!(n>=lo&&n<=hi))errs.push(`theme.motion.${path}.${k}: must be between ${lo} and ${hi}`)};
    const known=(path,o,list)=>{for(const k of Object.keys(o))if(!list.includes(k))errs.push(`theme.motion.${path}.${k}: unknown setting`)};
    const logo=(path,o)=>{
      if(o===undefined)return;if(!isObj(o)){errs.push(`theme.motion.${path}: must be an object`);return}
      known(path,o,['effect','distance','speed','delay','idle','idleSpeed','hover']);
      pick(path,o,'effect',['fade','up','down','start','end','zoom','zoomout','flip','blur']);pick(path,o,'distance',['small','medium','large']);
      pick(path,o,'idle',['float','breathe','sway','glow']);pick(path,o,'hover',['grow','tilt','lift','glow']);
      rng(path,o,'speed',.2,2.5);rng(path,o,'delay',0,2);rng(path,o,'idleSpeed',1.5,8);
    };
    if(!isObj(Mo))errs.push('theme.motion: must be an object');
    else for(const [k,o] of Object.entries(Mo)){
      if(k==='map'){
        if(!isObj(o)){errs.push('theme.motion.map: must be an object');continue}
        known('map',o,['entrance','speed','delay','stagger','base','idle','hover','pulse','pulseColor']);
        pick('map',o,'entrance',['fade','pop','rise']);pick('map',o,'base',['fade']);pick('map',o,'idle',['breathe','wave']);pick('map',o,'hover',['glow','pop','raise']);pick('map',o,'pulse',['none','slow','fast','big']);
        rng('map',o,'speed',.2,2.5);rng('map',o,'delay',0,2);rng('map',o,'stagger',0,.5);
        const c=o.pulseColor;if(c!==undefined&&c!==''){
          if(typeof c!=='string'||!/^(role:[A-Za-z]+|custom:[\w-]+|#[0-9a-fA-F]{6})$/.test(c))errs.push(`theme.motion.map.pulseColor: not a valid color (${c})`);
          else if(c.startsWith('role:')&&!ROLES.includes(c.slice(5)))errs.push(`theme.motion.map.pulseColor: unknown palette color "${c.slice(5)}"`);
          else if(c.startsWith('custom:')&&!own.has(c.slice(7)))errs.push(`theme.motion.map.pulseColor: your own color "${c.slice(7)}" does not exist`);
        }
      }else if(k==='logos'){
        if(!isObj(o)){errs.push('theme.motion.logos: must be an object');continue}
        for(const [n,x] of Object.entries(o)){if(!['all','header','home','about'].includes(n))errs.push(`theme.motion.logos.${n}: unknown logo (use all, header, home or about)`);else logo('logos.'+n,x)}
      }else errs.push(`theme.motion.${k}: unknown group (use map or logos)`);
    }
  }
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
// English wording overrides (admin: General > Languages & words, Sections): ui = { key: "text" }
if(d.ui!==undefined){
  if(typeof d.ui!=='object'||d.ui===null||Array.isArray(d.ui))errs.push('ui: must be an object');
  else for(const [k,v] of Object.entries(d.ui))if(typeof v!=='string')errs.push(`ui.${k}: must be text`);
}
if(errs.length){console.error(errs.join('\n'));process.exit(1)}
console.log('app-data.json'+(fs.existsSync('app-data.ar.json')?' and app-data.ar.json':'')+' OK');

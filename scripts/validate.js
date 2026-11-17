// Validates app-data.json and app-data.ar.json. Run from the project root: node scripts/validate.js
const fs=require('fs'),path=require('path');
const read=f=>JSON.parse(fs.readFileSync(f,'utf8')),errs=[],warn=[];
// The "light" zip has no assets/ folder (the pictures are already in the repository): then missing pictures cannot be checked here.
const HAS_ASSETS=fs.existsSync('assets');let skipped=0;
const noPic=msg=>{if(HAS_ASSETS)errs.push(msg);else skipped++};
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
    if(typeof x.image==='string'&&x.image){const f=resolve(x.image);if(f&&!fs.existsSync(path.join('.',f)))noPic(`${k}[${i}]: image not found ${x.image}`)}
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
      if(typeof o.image==='string'&&o.image){const f=resolve(o.image);if(f&&!fs.existsSync(path.join('.',f)))noPic(`theme.logos.${k}.image: image not found ${o.image}`)}
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
// ---- Fonts (admin restructure phase 4): theme.fonts = {all:{head:{en,ar}, body:{en,ar}}, sec:{<section>: same}} ----
{
  const F=(d.theme||{}).fonts;
  if(F!==undefined){
    const isObj=o=>typeof o==='object'&&o!==null&&!Array.isArray(o);
    const level=(path,L)=>{
      if(!isObj(L)){errs.push(`theme.fonts.${path}: must be an object`);return}
      for(const [r,o] of Object.entries(L)){
        if(!['head','body'].includes(r)){errs.push(`theme.fonts.${path}.${r}: unknown setting (use head or body)`);continue}
        if(!isObj(o)){errs.push(`theme.fonts.${path}.${r}: must be an object`);continue}
        for(const [l,v] of Object.entries(o)){
          if(!['en','ar'].includes(l))errs.push(`theme.fonts.${path}.${r}.${l}: unknown language (use en or ar)`);
          else if(typeof v!=='string'||!(v==='system'||/^[A-Za-z0-9][A-Za-z0-9 ]{1,39}$/.test(v)))errs.push(`theme.fonts.${path}.${r}.${l}: not a valid font name (${v})`);
        }
      }
    };
    if(!isObj(F))errs.push('theme.fonts: must be an object');
    else for(const [k,o] of Object.entries(F)){
      if(k==='all')level('all',o);
      else if(k==='sec'){
        if(!isObj(o))errs.push('theme.fonts.sec: must be an object');
        else for(const [s,x] of Object.entries(o)){if(!/^[a-z]+-[a-z-]+$/.test(s))errs.push(`theme.fonts.sec.${s}: not a section name`);level('sec.'+s,x)}
      }else errs.push(`theme.fonts.${k}: unknown group (use all or sec)`);
    }
  }
}
// ---- Control phase 2: theme.secHead = {<section>: {title, icon, rule, wa: true}} (true = hide that part of the section) ----
{
  const H=(d.theme||{}).secHead;
  if(H!==undefined){
    const isObj=o=>typeof o==='object'&&o!==null&&!Array.isArray(o);
    if(!isObj(H))errs.push('theme.secHead: must be an object');
    else for(const [s,o] of Object.entries(H)){
      if(!/^[a-z]+-[a-z-]+$/.test(s)){errs.push(`theme.secHead.${s}: not a section name`);continue}
      if(!isObj(o)){errs.push(`theme.secHead.${s}: must be an object`);continue}
      for(const [k,v] of Object.entries(o)){
        if(!['title','icon','rule','wa'].includes(k))errs.push(`theme.secHead.${s}.${k}: unknown part (use title, icon, rule or wa)`);
        else if(typeof v!=='boolean')errs.push(`theme.secHead.${s}.${k}: must be true or false`);
      }
    }
  }
}
// ---- Control phase 3: theme.cols = {<section>: {t, d}}, 1 to 4 columns on tablet (t) and desktop (d) ----
{
  const C=(d.theme||{}).cols;
  if(C!==undefined){
    const isObj=o=>typeof o==='object'&&o!==null&&!Array.isArray(o);
    if(!isObj(C))errs.push('theme.cols: must be an object');
    else for(const [s,o] of Object.entries(C)){
      if(!/^[a-z]+-[a-z-]+$/.test(s)){errs.push(`theme.cols.${s}: not a section name`);continue}
      if(!isObj(o)){errs.push(`theme.cols.${s}: must be an object`);continue}
      for(const [k,v] of Object.entries(o)){
        if(!['t','d'].includes(k)){errs.push(`theme.cols.${s}.${k}: use t (tablet) or d (desktop)`);continue}
        if(v===''||v===undefined)continue;
        if(!(Number.isInteger(Number(v))&&Number(v)>=1&&Number(v)<=4))errs.push(`theme.cols.${s}.${k}: must be a whole number from 1 to 4 (is "${v}")`);
      }
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

// ---- Control phase 4: the background of one card: cardBg, cardImage, cardShade, cardText on news, services, employees items and on ipCard ----
{
  const ROLES=['title','ink','gold','accent','accentDark','accentSoft','sand','page','surface','text'],own=new Set(((d.theme||{}).custom||[]).map(c=>String(c.id)));
  const one=(path,o)=>{
    if(typeof o!=='object'||o===null||Array.isArray(o)){errs.push(`${path}: must be an object`);return}
    for(const k of ['cardBg','cardText']){
      const v=o[k];if(v===undefined||v==='')continue;
      if(typeof v!=='string'||!/^(role:[A-Za-z]+|custom:[\w-]+|#[0-9a-fA-F]{6})$/.test(v))errs.push(`${path}.${k}: not a valid color (${v})`);
      else if(v.startsWith('role:')&&!ROLES.includes(v.slice(5)))errs.push(`${path}.${k}: unknown palette color "${v.slice(5)}"`);
      else if(v.startsWith('custom:')&&!own.has(v.slice(7)))errs.push(`${path}.${k}: your own color "${v.slice(7)}" does not exist`);
    }
    if(o.cardPos!==undefined&&o.cardPos!==''&&!['top','center','bottom'].includes(o.cardPos))errs.push(`${path}.cardPos: use top, center or bottom`);
    if(o.cardImage!==undefined&&typeof o.cardImage!=='string')errs.push(`${path}.cardImage: must be a file name or web address`);
    if(o.cardShade!==undefined&&o.cardShade!==''){const n=Number(o.cardShade);if(!(n>=0&&n<=80))errs.push(`${path}.cardShade: must be between 0 and 80`)}
  };
  for(const k of ['news','services','employees'])(Array.isArray(d[k])?d[k]:[]).forEach((x,i)=>one(`${k}[${i}]`,x));
  if(d.ipCard!==undefined)one('ipCard',d.ipCard);
}
// ---- Picture sizes: imgSizes = {"<file>": {w: width of the file, v: [widths of the smaller copies name-w480.ext ...]}} ----
{
  const M=d.imgSizes;
  if(M!==undefined){
    if(typeof M!=='object'||M===null||Array.isArray(M))errs.push('imgSizes: must be an object');
    else for(const [f,e] of Object.entries(M)){
      if(typeof e!=='object'||e===null||!(Number.isInteger(e.w)&&e.w>0)||!Array.isArray(e.v)||!e.v.every(n=>Number.isInteger(n)&&n>0&&n<e.w)){errs.push(`imgSizes.${f}: use {"w": width, "v": [smaller widths]}`);continue}
      if(HAS_ASSETS)for(const w of e.v){const p='assets/'+f.replace(/(\.\w+)$/,`-w${w}$1`);if(!fs.existsSync(p))errs.push(`imgSizes.${f}: the copy ${p} is missing`)}
    }
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
// ---- seo (read by scripts/build-seo.js): { siteUrl, name, ogImage, pages: { home|about|patents|trademarks|translation: { title: {en,ar}, description: {en,ar} } } } ----
if(d.seo!==undefined){
  const S=d.seo;
  if(typeof S!=='object'||S===null||Array.isArray(S))errs.push('seo: must be an object');
  else{
    if(S.siteUrl!==undefined&&S.siteUrl!==''&&!/^https:\/\/[^\s/]+(\/\S*)?$/.test(S.siteUrl))errs.push('seo.siteUrl: must start with https:// (for example https://www.example.com/)');
    for(const k of ['name','ogImage'])if(S[k]!==undefined&&typeof S[k]!=='string')errs.push(`seo.${k}: must be text`);
    for(const [pk,pv] of Object.entries(S.pages||{})){
      if(!['home','about','patents','trademarks','translation'].includes(pk)){errs.push(`seo.pages.${pk}: unknown page (use home, about, patents, trademarks, translation)`);continue}
      for(const f of ['title','description'])for(const [lg,v] of Object.entries((pv||{})[f]||{})){
        if(!['en','ar'].includes(lg))errs.push(`seo.pages.${pk}.${f}.${lg}: use en or ar`);
        else if(typeof v!=='string')errs.push(`seo.pages.${pk}.${f}.${lg}: must be text`);
        else if(f==='description'&&v.length>320)warn.push(`seo.pages.${pk}.description.${lg}: ${v.length} characters; search engines show about 155`);
      }
    }
  }
}
// ---- Video sections (video.js): videos = { home|about: { hidden, url, title, text, layout, after } }; Arabic: title, text, url ----
{
  const isObj=o=>typeof o==='object'&&o!==null&&!Array.isArray(o);
  let parse=()=>({});try{global.window=global.window||{};require(path.resolve(__dirname,'..','video.js'));parse=window.KVIDEO.parse;var KV=window.KVIDEO}catch(e){warn.push('videos: video.js could not be loaded to check the links ('+e.message+')')}
  const check=(file,V)=>{
    if(V===undefined)return;
    if(!isObj(V)){errs.push(`${file} videos: must be an object`);return}
    for(const [pg,v] of Object.entries(V)){
      if(!['home','about'].includes(pg)){errs.push(`${file} videos.${pg}: unknown page (use home or about)`);continue}
      if(!isObj(v)){errs.push(`${file} videos.${pg}: must be an object`);continue}
      for(const k of ['url','title','text'])if(v[k]!==undefined&&typeof v[k]!=='string')errs.push(`${file} videos.${pg}.${k}: must be text`);
      if(typeof v.url==='string'&&v.url.trim()&&!parse(v.url))errs.push(`${file} videos.${pg}.url: not the address of a YouTube video (${v.url})`);
      if(v.hidden!==undefined&&typeof v.hidden!=='boolean')errs.push(`${file} videos.${pg}.hidden: must be true or false`);
      for(const k of ['ctaText','ctaLink','poster','date'])if(v[k]!==undefined&&typeof v[k]!=='string')errs.push(`${file} videos.${pg}.${k}: must be text`);
      if(v.autoplay!==undefined&&typeof v.autoplay!=='boolean')errs.push(`${file} videos.${pg}.autoplay: must be true or false`);
      if(typeof v.date==='string'&&v.date&&!/^\d{4}-\d{2}-\d{2}$/.test(v.date))errs.push(`${file} videos.${pg}.date: use YYYY-MM-DD`);
      if(typeof v.ctaLink==='string'&&v.ctaLink.trim()&&KV&&!KV.ctaKind(v.ctaLink))errs.push(`${file} videos.${pg}.ctaLink: use whatsapp, https://..., tel:, mailto:, or a page such as about.html (${v.ctaLink})`);
      if(typeof v.ctaText==='string'&&v.ctaText.trim()&&!(typeof v.ctaLink==='string'&&v.ctaLink.trim())&&file==='app-data.json')warn.push(`${file} videos.${pg}: the button has words but no link, so it is not shown`);
      if(typeof v.poster==='string'&&v.poster){const f=resolve(v.poster);if(f&&!fs.existsSync(path.join('.',f)))noPic(`${file} videos.${pg}.poster: image not found ${v.poster}`)}
      if(v.layout!==undefined&&!['side','top','bottom'].includes(v.layout))errs.push(`${file} videos.${pg}.layout: use side, top or bottom`);
      if(v.after!==undefined&&KV&&!(pg==='home'?KV.HOME:KV.ABOUT).some(o=>o[0]===v.after))errs.push(`${file} videos.${pg}.after: unknown position "${v.after}"`);
    }
  };
  check('app-data.json',d.videos);
  if(fs.existsSync('app-data.ar.json')){const a=read('app-data.ar.json');check('app-data.ar.json',a.videos);if(a.videos)for(const [pg,v] of Object.entries(a.videos))if(v&&['layout','after','hidden','autoplay','poster','date','ctaLink'].some(k=>v[k]!==undefined))warn.push(`app-data.ar.json videos.${pg}: only url, title, text and ctaText are read here; layout, after, hidden, autoplay, poster, date and ctaLink are set in app-data.json`)}
}
warn.forEach(w=>console.log('warning: '+w));
if(errs.length){console.error(errs.join('\n'));process.exit(1)}
console.log('app-data.json'+(fs.existsSync('app-data.ar.json')?' and app-data.ar.json':'')+' OK'+(skipped?` (no assets/ folder here: ${skipped} picture reference${skipped>1?'s':''} not checked)`:''));

/* KHIP article importer. Reads Word (.docx) and Markdown (.md) files that hold ONE OR MANY news articles.
   Used by admin.html (News tab, "Import"). No libraries: a .docx is a zip file, which the browser can open itself.

   How a file is read
   - Every article starts with a title: Heading 1 (or Title style) in Word, "# Title" in Markdown,
     or a "---" front-matter block that has a "title:" line.
   - Right under the title, short "Label: value" lines set the details:
       Subtitle:  Date:  Category:  Excerpt:  Image:
     (Arabic labels work too). Everything after them is the article text.
   - Pictures: the first picture of an article is its cover; further pictures stay in the text.
     Markdown pictures can be listed by file name and picked together with the .md file (or put in a .zip).
   Exposes window.KImport = { parseFiles, TEMPLATE, normDate }.  */
window.KImport=(function(){
  'use strict';
  const MONTHS={january:1,jan:1,february:2,feb:2,march:3,mar:3,april:4,apr:4,may:5,june:6,jun:6,july:7,jul:7,august:8,aug:8,september:9,sep:9,sept:9,october:10,oct:10,november:11,nov:11,december:12,dec:12,
    'يناير':1,'فبراير':2,'مارس':3,'أبريل':4,'ابريل':4,'مايو':5,'يونيو':6,'يوليو':7,'أغسطس':8,'اغسطس':8,'سبتمبر':9,'أكتوبر':10,'اكتوبر':10,'نوفمبر':11,'ديسمبر':12};
  const META=[
    ['subtitle',/^(sub[\s-]?title|sub[\s-]?heading|brief|short text|العنوان الفرعي|الملخص القصير)$/i],
    ['icon',/^(icon|الأيقونة|ايقونة)$/i],
    ['pagefile',/^(page file|page url|html file|ملف الصفحة)$/i],
    ['hidden',/^(hidden|hide|hide service|مخفي|إخفاء)$/i],
    ['date',/^(date|published|publish date|التاريخ)$/i],
    ['category',/^(category|tag|label|section|التصنيف|الفئة|القسم)$/i],
    ['excerpt',/^(excerpt|summary|short summary|intro|الملخص|مقتطف|نبذة)$/i],
    ['image',/^(image|cover|cover image|photo|الصورة)$/i],
    ['service',/^(service|page|الخدمة|الصفحة)$/i],
    ['lang',/^(lang|language|اللغة)$/i],
    ['title',/^(title|العنوان)$/i]
  ];
  const MIME={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp'};
  const ext=n=>(String(n).match(/\.([a-z0-9]+)$/i)||[,''])[1].toLowerCase();
  const base=n=>String(n).split(/[\\/]/).pop();
  const stem=n=>base(n).replace(/\.[a-z0-9]+$/i,'');
  const lc=s=>String(s).toLowerCase();
  const digits=s=>String(s).replace(/[٠-٩]/g,d=>d.charCodeAt(0)-0x660);

  /* ---------------------------------------------------------------- dates */
  function normDate(v){
    let s=digits(v).trim().replace(/[,،]/g,' ').replace(/\s+/g,' ');if(!s)return '';
    const iso=(y,m,d)=>{y=+y;m=+m;d=+d;if(y<1990||y>2100||m<1||m>12||d<1||d>31)return '';return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`};
    let m=s.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/);if(m)return iso(m[1],m[2],m[3]);
    m=s.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})$/);
    if(m){const a=+m[1],b=+m[2];return a>12?iso(m[3],b,a):b>12?iso(m[3],a,b):iso(m[3],b,a)}     // 03/04/2026 = 3 April (day first)
    m=s.match(/^(\d{1,2})(?:st|nd|rd|th)? ([^\d\s]+) (\d{4})$/);if(m&&MONTHS[lc(m[2])])return iso(m[3],MONTHS[lc(m[2])],m[1]);
    m=s.match(/^([^\d\s]+) (\d{1,2})(?:st|nd|rd|th)? (\d{4})$/);if(m&&MONTHS[lc(m[1])])return iso(m[3],MONTHS[lc(m[1])],m[2]);
    return '';
  }

  /* ---------------------------------------------------------------- helpers shared by Word and Markdown */
  function metaLine(text){
    const m=String(text).match(/^\s*([^:：]{1,30}?)\s*[:：]\s*(.*)$/);if(!m)return null;
    const k=META.find(([,re])=>re.test(m[1].trim()));return k?{key:k[0],value:m[2].trim()}:null;
  }
  function autoExcerpt(text){
    const t=String(text).replace(/\*\*/g,'').replace(/\s+/g,' ').trim();
    if(t.length<=220)return t;
    const cut=t.slice(0,220),sp=cut.lastIndexOf(' ');return cut.slice(0,sp>120?sp:220).replace(/[\s,;:.\-–]+$/,'')+'…';
  }
  /* items: [{k:'h',lvl,text} | {k:'p'|'li'|'sub',text} | {k:'img',img}]  ->  one article per top-level heading */
  function articlesFromItems(items,src,warn){
    const lv=items.filter(i=>i.k==='h').map(i=>i.lvl);
    if(!lv.length)return [];
    const L=Math.min(...lv),parts=[];let cur=null;
    for(const it of items){
      if(it.k==='h'&&it.lvl===L){cur={title:it.text.trim(),items:[]};parts.push(cur)}
      else if(cur)cur.items.push(it);
    }
    return parts.map((p,n)=>buildArticle(p.title,p.items,L,src,warn,n+1));
  }
  function buildArticle(title,items,L,src,warn,n){
    const a={title,subtitle:'',date:'',category:'',excerpt:'',text:'',cover:null,imgs:[],notes:[],source:src};
    let head=true,coverRef=null,body=[];
    for(const it of items){
      if(head){
        if(it.k==='img'){if(!a.cover&&coverRef==null)a.cover=it.img;else body.push(it);continue}
        if(it.k==='sub'){if(!a.subtitle)a.subtitle=it.text.trim();continue}
        if(it.k==='p'){
          if(!it.text.trim())continue;
          const m=metaLine(it.text.replace(/\*\*/g,''));
          if(m){
            if(m.key==='date'){a.date=normDate(m.value);if(!a.date&&m.value)a.notes.push(`Date not understood: "${m.value}"`)}
            else if(m.key==='image')coverRef=m.value;
            else if(m.key==='title'){}
            else a[m.key]=m.value;
            continue;
          }
        }
        head=false;
      }
      body.push(it);
    }
    if(coverRef){a.coverRef=coverRef}
    if(!a.cover&&!coverRef){const i=body.findIndex(x=>x.k==='img');if(i>=0){a.cover=body[i].img;body.splice(i,1)}}
    // body text in the site's own format (## subtitle, - bullet, **bold**); inline pictures become ![alt](img:N)
    let out='',prev='';
    for(const it of body){
      let line,type;
      if(it.k==='h'){line='## '+it.text.trim();type='h'}
      else if(it.k==='li'){line='- '+it.text.trim();type='li'}
      else if(it.k==='img'){a.imgs.push(it.img);line=`![${(it.img.alt||'').replace(/[\[\]]/g,'')}](img:${a.imgs.length-1})`;type='img'}
      else{if(!it.text.trim())continue;line=it.text.trim();type='p'}
      if(it.k==='sub'){line=it.text.trim();type='p'}
      if(out)out+=(prev==='li'&&type==='li')||prev==='h'?'\n':'\n\n';
      out+=line;prev=type;
    }
    a.text=out.trim();
    if(!a.excerpt){
      const first=body.find(x=>x.k==='p'&&x.text.trim());
      if(first){a.excerpt=autoExcerpt(first.text);a.notes.push('Excerpt created from the first paragraph')}
    }
    if(!a.text)a.notes.push('No article text');
    if(!a.date&&!a.notes.some(x=>/^Date/.test(x)))a.notes.push('No date');
    return a;
  }

  /* ---------------------------------------------------------------- Word (.docx) */
  async function unzip(buf){
    const u8=new Uint8Array(buf),dv=new DataView(u8.buffer,u8.byteOffset,u8.byteLength),td=new TextDecoder();
    let e=-1;for(let i=u8.length-22;i>=Math.max(0,u8.length-65557);i--)if(dv.getUint32(i,true)===0x06054b50){e=i;break}
    if(e<0)throw new Error('This is not a valid .docx or .zip file.');
    const n=dv.getUint16(e+10,true);let p=dv.getUint32(e+16,true);const files=new Map();
    for(let k=0;k<n;k++){
      if(dv.getUint32(p,true)!==0x02014b50)break;
      const method=dv.getUint16(p+10,true),csize=dv.getUint32(p+20,true),nl=dv.getUint16(p+28,true),el=dv.getUint16(p+30,true),cl=dv.getUint16(p+32,true),off=dv.getUint32(p+42,true);
      files.set(td.decode(u8.subarray(p+46,p+46+nl)),{method,csize,off});
      p+=46+nl+el+cl;
    }
    async function read(name){
      const f=files.get(name);if(!f)return null;
      const start=f.off+30+dv.getUint16(f.off+26,true)+dv.getUint16(f.off+28,true),data=u8.subarray(start,start+f.csize);
      if(f.method===0)return data.slice();
      if(f.method!==8)throw new Error('This zip file uses a compression type that is not supported.');
      return new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
    }
    return {names:[...files.keys()].filter(x=>!x.endsWith('/')),read};
  }
  const kids=(el,tag)=>[...el.children].filter(c=>c.nodeName===tag);
  const attr=(el,name)=>el?el.getAttribute(name):null;

  async function parseDocx(buf,fname,warn){
    const z=await unzip(buf),td=new TextDecoder();
    const xml=async n=>{const b=await z.read(n);return b?new DOMParser().parseFromString(td.decode(b),'application/xml'):null};
    const doc=await xml('word/document.xml');
    if(!doc||doc.getElementsByTagName('w:body').length===0)throw new Error('No text found in this Word file.');
    const rels=await xml('word/_rels/document.xml.rels'),styles=await xml('word/styles.xml');
    const rel={};if(rels)[...rels.getElementsByTagName('Relationship')].forEach(r=>{rel[r.getAttribute('Id')]={t:r.getAttribute('Target'),ext:r.getAttribute('TargetMode')==='External'}});
    const sname={};if(styles)[...styles.getElementsByTagName('w:style')].forEach(s=>{const id=s.getAttribute('w:styleId'),nm=kids(s,'w:name')[0];sname[id]=attr(nm,'w:val')||id});
    const media=new Map();let imgN=0;
    async function image(rid,alt){
      const r=rel[rid];if(!r||r.ext)return null;
      const path=('word/'+r.t).replace(/word\/\.\.\//,'').replace(/^word\/\//,'word/');
      const x=ext(path);
      if(!MIME[x]){warn(`${fname}: a picture in .${x} format was skipped (use PNG or JPG)`);return null}
      if(media.has(path))return {...media.get(path),alt};
      const bytes=await z.read(path);if(!bytes)return null;
      const o={kind:'bytes',data:bytes,mime:MIME[x],name:`${stem(fname)}-image${++imgN}.${x==='jpeg'?'jpg':x}`,alt:''};
      media.set(path,o);return {...o,alt};
    }
    const items=[];
    async function para(p){
      const pPr=kids(p,'w:pPr')[0];let sid='',isList=false,lvl=0,isSub=false;
      if(pPr){
        sid=attr(kids(pPr,'w:pStyle')[0],'w:val')||'';isList=!!kids(pPr,'w:numPr')[0];
        const ol=kids(pPr,'w:outlineLvl')[0];if(ol&&+attr(ol,'w:val')<9)lvl=+attr(ol,'w:val')+1;
      }
      const nm=lc(sname[sid]||sid);
      let m=nm.match(/^heading\s*(\d)$/)||sid.match(/^heading(\d)$/i);
      if(m)lvl=+m[1];else if(nm==='title')lvl=1;else if(nm==='subtitle')isSub=true;
      if(/^list/.test(nm))isList=true;
      const kind=lvl?'h':isSub?'sub':isList?'li':'p';
      let segs=[];                                   // {s,b}
      const flush=()=>{
        const text=lvl?segs.map(x=>x.s).join(''):joinBold(segs);segs=[];
        (lvl?[text.replace(/\n+/g,' ')]:text.split('\n')).forEach(t=>{if(t.replace(/\*\*/g,'').trim())items.push({k:kind,lvl,text:t.trim()})});
      };
      async function run(r){
        const rPr=kids(r,'w:rPr')[0],bEl=rPr&&kids(rPr,'w:b')[0],b=!!bEl&&!/^(0|false)$/.test(attr(bEl,'w:val')||'');
        for(const c of r.children){
          const t=c.nodeName;
          if(t==='w:t')segs.push({s:c.textContent,b});
          else if(t==='w:tab')segs.push({s:' ',b:false});
          else if(t==='w:br'&&attr(c,'w:type')!=='page')segs.push({s:'\n',b:false});
          else if(t==='w:drawing'||t==='w:pict'||t==='mc:AlternateContent'){
            const blips=[...c.getElementsByTagName('a:blip')],ims=[...c.getElementsByTagName('v:imagedata')];
            const dp=c.getElementsByTagName('wp:docPr')[0],alt=attr(dp,'descr')||'';
            const ids=blips.length?blips.map(x=>x.getAttribute('r:embed')):ims.map(x=>x.getAttribute('r:id'));
            for(const id of ids.slice(0,1)){const img=id&&await image(id,alt);if(img){flush();items.push({k:'img',img})}}
          }
        }
      }
      async function walk(el){
        for(const c of el.children){
          if(c.nodeName==='w:r')await run(c);
          else if(c.nodeName==='w:hyperlink'){
            const before=segs.length;await walk(c);
            const rid=c.getAttribute('r:id'),url=rid&&rel[rid]&&rel[rid].ext?rel[rid].t:'';
            const label=segs.slice(before).map(x=>x.s).join('').trim();
            if(/^https?:/i.test(url)&&label&&label.replace(/^https?:\/\/(www\.)?/i,'').replace(/\/$/,'')!==url.replace(/^https?:\/\/(www\.)?/i,'').replace(/\/$/,''))segs.push({s:` (${url})`,b:false});
          }
          else if(c.nodeName==='w:ins'||c.nodeName==='w:smartTag'||c.nodeName==='w:sdt'||c.nodeName==='w:sdtContent'||c.nodeName==='w:fldSimple')await walk(c);
        }
      }
      await walk(p);flush();
    }
    async function block(el){
      for(const c of el.children){
        if(c.nodeName==='w:p')await para(c);
        else if(c.nodeName==='w:tbl'){
          for(const tr of c.getElementsByTagName('w:tr')){
            const before=items.length;
            for(const tc of kids(tr,'w:tc'))for(const p of kids(tc,'w:p'))await para(p);
            const added=items.splice(before),imgs=added.filter(x=>x.k==='img'),txt=added.filter(x=>x.k!=='img').map(x=>x.text).join(' | ');
            if(txt)items.push({k:'p',text:txt});imgs.forEach(x=>items.push(x));
          }
        }
        else if(c.nodeName==='w:sdt'){const sc=kids(c,'w:sdtContent')[0];if(sc)await block(sc)}
      }
    }
    await block(doc.getElementsByTagName('w:body')[0]);
    return items;
  }
  // Bold runs -> **bold**, keeping spaces outside the stars
  function joinBold(segs){
    const g=[];for(const s of segs){const l=g[g.length-1];if(l&&l.b===s.b)l.s+=s.s;else g.push({s:s.s,b:s.b})}
    return g.map(x=>{
      if(!x.b)return x.s;
      const m=x.s.match(/^(\s*)([\s\S]*?)(\s*)$/);
      return m[2]?m[1]+m[2].split('\n').map(l=>l.trim()?'**'+l.trim()+'**':l).join('\n')+m[3]:x.s;
    }).join('');
  }

  /* ---------------------------------------------------------------- Markdown */
  const IMG_RE=/!\[([^\]]*)\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g;
  function inline(t){
    t=t.replace(/<br\s*\/?>/gi,' ').replace(/<(https?:[^>\s]+)>/g,'$1').replace(/<\/?[a-z][^>]*>/gi,'');
    t=t.replace(/`([^`]+)`/g,'$1');
    t=t.replace(/\[([^\]]+)\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g,(m,a,u)=>{const bare=u.replace(/^https?:\/\/(www\.)?/i,'').replace(/\/$/,'');return a.replace(/^https?:\/\/(www\.)?/i,'').replace(/\/$/,'')===bare||!/^https?:/i.test(u)?a:`${a} (${u})`});
    t=t.replace(/__(.+?)__/g,'**$1**').replace(/\*\*/g,'\u0001').replace(/\*(?!\s)([^*]+?)\*/g,'$1').replace(/\u0001/g,'**');
    t=t.replace(/(^|[\s(])_(?!\s)([^_]+?)_(?=[\s).,;:!?]|$)/g,'$1$2').replace(/~~(.+?)~~/g,'$1').replace(/\\([*_`#\[\]()])/g,'$1');
    return t.replace(/\s+/g,' ').trim();
  }
  function imgFromSrc(src,alt,ctx,warn,fname){
    src=src.trim();
    if(/^https?:\/\//i.test(src))return {kind:'url',url:src,alt};
    let m=src.match(/^data:(image\/(?:png|jpeg|gif|webp));base64,(.+)$/i);
    if(m){const bin=atob(m[2]),u8=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);const x=Object.keys(MIME).find(k=>MIME[k]===lc(m[1]));return {kind:'bytes',data:u8,mime:lc(m[1]),name:`${stem(fname)}-embedded-${++ctx.n}.${x==='jpeg'?'jpg':x}`,alt}}
    let name;try{name=decodeURIComponent(base(src.split(/[?#]/)[0]))}catch{name=base(src)}
    const f=ctx.files.get(lc(name));
    if(f)return {kind:'file',file:f,mime:f.mime,name:f.name,alt};
    if(ctx.assets&&ctx.assets.has(name))return {kind:'asset',name,alt};
    warn(`${fname}: picture not found: ${name} (pick it together with the file, or put both in a .zip)`);
    return null;
  }
  function metaYaml(lines){
    const o={};
    for(let i=0;i<lines.length;i++){
      const m=lines[i].match(/^\s*([^:：#]{1,30}?)\s*[:：]\s*(.*)$/);if(!m)continue;
      const k=META.find(([,re])=>re.test(m[1].trim()));if(!k)continue;
      let v=m[2].trim();
      if(/^[>|][+-]?$/.test(v)){const buf=[];while(i+1<lines.length&&/^\s+\S/.test(lines[i+1]))buf.push(lines[++i].trim());v=buf.join(' ')}
      o[k[0]]=v.replace(/^(["'])(.*)\1$/,'$2');
    }
    return o;
  }
  function parseMarkdown(text,fname,ctx,warn){
    const lines=text.replace(/^﻿/,'').replace(/\r\n?/g,'\n').split('\n');
    // 1) front-matter blocks (--- ... --- with a title line)
    const fm=[];
    for(let i=0;i<lines.length;i++){
      if(lines[i].trim()!=='---')continue;
      let j=i+1;while(j<lines.length&&lines[j].trim()!=='---'&&j-i<40)j++;
      if(j>=lines.length||lines[j].trim()!=='---')continue;
      const meta=metaYaml(lines.slice(i+1,j));
      if(meta.title){fm.push({s:i,e:j,meta});i=j}
    }
    let chunks=[];
    if(fm.length){
      fm.forEach((b,n)=>chunks.push({meta:b.meta,title:b.meta.title,lines:lines.slice(b.e+1,n+1<fm.length?fm[n+1].s:lines.length)}));
    }else{
      let fence=false,cur=null;
      for(const l of lines){
        if(/^\s*(```|~~~)/.test(l))fence=!fence;
        const h=!fence&&l.match(/^#\s+(.+?)\s*#*\s*$/);
        if(h){cur={meta:{},title:inline(h[1]),lines:[],head:true};chunks.push(cur)}
        else if(cur)cur.lines.push(l);
      }
    }
    if(!chunks.length){
      const t=lines.join('\n').trim();
      if(!t)return [];
      warn(`${fname}: no article title found, so the file name is used as the title`);
      chunks=[{meta:{},title:stem(fname),lines}];
    }
    return chunks.map((c,n)=>{
      const hdr={...c.meta};let cover=null,i=0,coverRef=null;
      if(c.head){                                         // "# Title" mode: details are Label: value lines right under the title
        for(;i<c.lines.length;i++){
          const l=c.lines[i];if(!l.trim())continue;
          const im=l.match(/^\s*!\[([^\]]*)\]\(\s*<?([^)\s>]+)>?[^)]*\)\s*$/);
          if(im&&!cover&&coverRef==null){cover=imgFromSrc(im[2],im[1],ctx,warn,fname);continue}
          const m=metaLine(l.replace(/^\s*[-*]\s+/,'').replace(/\*\*/g,''));
          if(m){hdr[m.key]=m.value;continue}
          break;
        }
      }
      const a={title:c.title,subtitle:inline(hdr.subtitle||''),date:'',category:inline(hdr.category||''),excerpt:inline(hdr.excerpt||''),service:inline(hdr.service||''),lang:inline(hdr.lang||''),icon:inline(hdr.icon||''),pagefile:inline(hdr.pagefile||''),hidden:inline(hdr.hidden||''),text:'',cover,imgs:[],notes:[],source:fname};
      if(hdr.date){a.date=normDate(hdr.date);if(!a.date)a.notes.push(`Date not understood: "${hdr.date}"`)}
      if(hdr.image&&!cover){
        const r=imgFromSrc(hdr.image.replace(/^!\[[^\]]*\]\(|\)$/g,''),'',ctx,warn,fname);if(r)a.cover=r;
      }
      // body -> the site's own format
      const blocks=[];let para=[],fence=false;
      const endPara=()=>{if(para.length){pushText(para.join(' '),'p');para=[]}};
      function pushText(raw,type){
        let last=0,m;IMG_RE.lastIndex=0;
        while((m=IMG_RE.exec(raw))){
          const before=inline(raw.slice(last,m.index));if(before)blocks.push({type,text:before});
          const img=imgFromSrc(m[2],m[1],ctx,warn,fname);if(img)blocks.push({type:'img',img});
          last=m.index+m[0].length;type=type==='li'?'p':type;
        }
        const rest=inline(raw.slice(last));if(rest)blocks.push({type,text:rest});
      }
      for(const l of c.lines.slice(i)){
        if(/^\s*(```|~~~)/.test(l)){endPara();fence=!fence;continue}
        if(fence){if(l.trim())blocks.push({type:'p',text:l.trim()});continue}
        if(!l.trim()){endPara();continue}
        if(/^\s*([-*_]\s*){3,}$/.test(l)){endPara();continue}
        let m;
        if((m=l.match(/^\s*#{1,6}\s+(.+?)\s*#*\s*$/))){endPara();const t=inline(m[1]);if(t&&!(!blocks.length&&lc(t)===lc(a.title)))blocks.push({type:'h',text:t});continue}
        if((m=l.match(/^\s*(?:[-*+]|\d+[.)])\s+(.*)$/))){endPara();pushText(m[1],'li');continue}
        para.push(l.replace(/^\s*>\s?/,'').trim());
      }
      endPara();
      if(!a.cover){const k=blocks.findIndex(b=>b.type==='img');if(k>=0){a.cover=blocks[k].img;blocks.splice(k,1)}}
      let out='',prev='';
      for(const b of blocks){
        let line;
        if(b.type==='h')line='## '+b.text;
        else if(b.type==='li')line='- '+b.text;
        else if(b.type==='img'){a.imgs.push(b.img);line=`![${(b.img.alt||'').replace(/[\[\]]/g,'')}](img:${a.imgs.length-1})`}
        else line=b.text;
        if(out)out+=(prev==='li'&&b.type==='li')||prev==='h'?'\n':'\n\n';
        out+=line;prev=b.type;
      }
      a.text=out.trim();
      if(!a.excerpt){const f=blocks.find(b=>b.type==='p');if(f){a.excerpt=autoExcerpt(f.text);a.notes.push('Excerpt created from the first paragraph')}}
      if(!a.text)a.notes.push('No article text');
      if(!hdr.date)a.notes.push('No date');
      return a;
    });
  }

  /* ---------------------------------------------------------------- entry point */
  const isText=n=>/\.(md|markdown|txt)$/i.test(n);
  async function parseFiles(fileList,opts={}){
    const warnings=[],warn=m=>warnings.push(m),articles=[];
    const ctx={files:new Map(),assets:opts.assets||null,n:0};
    const docs=[];                                    // {name,kind:'docx'|'text',read:()=>Promise}
    const addImage=(name,mime,get)=>ctx.files.set(lc(base(name)),{name:base(name),mime,get});
    async function take(name,blob,size){
      const x=ext(name);
      if(x==='docx')docs.push({name:base(name),kind:'docx',read:async()=>blob.arrayBuffer?await blob.arrayBuffer():blob});
      else if(x==='doc')warn(`${base(name)}: old .doc files are not supported. In Word choose Save As, then .docx.`);
      else if(isText(name))docs.push({name:base(name),kind:'text',read:async()=>blob.text?await blob.text():new TextDecoder().decode(blob)});
      else if(MIME[x])addImage(name,MIME[x],async()=>blob.arrayBuffer?new Uint8Array(await blob.arrayBuffer()):blob);
      else if(x==='zip'){
        const z=await unzip(blob.arrayBuffer?await blob.arrayBuffer():blob);
        for(const n of z.names){
          if(/(^|\/)(__MACOSX|\.)/.test(n)||/^~\$/.test(base(n)))continue;
          const xx=ext(n);
          if(xx==='docx'||isText(n)||MIME[xx]){const bytes=await z.read(n);await take(n,bytes)}
        }
      }
      else warn(`${base(name)}: skipped (use .docx, .md, .txt, .zip or pictures)`);
    }
    for(const f of fileList)await take(f.name,f);
    // markdown pictures: make bytes available
    for(const d of docs){
      try{
        let items;
        if(d.kind==='docx'){
          const buf=await d.read();items=await parseDocx(buf,d.name,warn);
          const list=articlesFromItems(items,d.name,warn);
          if(!list.length)warn(`${d.name}: no articles found. Start each article with a Heading 1 (the "Heading 1" style).`);
          articles.push(...list);
        }else{
          const list=parseMarkdown(await d.read(),d.name,ctx,warn);
          if(!list.length)warn(`${d.name}: no articles found.`);
          articles.push(...list);
        }
      }catch(e){warn(`${d.name}: ${e.message||e}`)}
    }
    // cover given by file name ("Image: cover.jpg") in a Word file, or any leftover reference
    for(const a of articles){
      if(a.coverRef&&!a.cover){const r=imgFromSrc(a.coverRef,'',ctx,warn,a.source);if(r)a.cover=r}
      const all=[a.cover,...a.imgs].filter(Boolean);
      for(const im of all)if(im.kind==='file'&&!im.data)im.data=await im.file.get();
      if(a.cover&&a.cover.kind==='file')a.cover={...a.cover,kind:'bytes'};
      a.imgs=a.imgs.map(im=>im&&im.kind==='file'?{...im,kind:'bytes'}:im);
    }
    return {articles,warnings};
  }

  const TEMPLATE=`# Article title goes here
Subtitle: A short line shown under the title
Date: 2026-03-14
Category: Patents
Image: cover-photo.jpg
Excerpt: One or two sentences shown on the news card.

The article text starts here. Use **bold** for emphasis.

## A subheading

- First bullet point
- Second bullet point

![Optional caption](second-photo.jpg)

# Second article title
Date: 2026-03-20
Category: General
Excerpt: Another short summary.

Text of the second article.
`;
  return {parseFiles,TEMPLATE,normDate};
})();

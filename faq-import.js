/* KHIP FAQ importer. Reads the questions and answers of the Home, About, Patents, Trademarks and Translation pages from
   Word (.docx) or Markdown (.md) files, English and Arabic. Used by admin.html (Sections, any FAQ section, "Import FAQ").
   It reuses the Word / Markdown reader of news-import.js, so that file must be loaded first.

   How a file is read
   - Every FAQ list starts with a title: Heading 1 in Word, "# Title" in Markdown. The title is the page name
     (Home, About, Patents, Trademarks, Translation) or its file (patents.html). A "Page:" line can say it instead.
   - Right under the title, an optional "Language: English|Arabic" line (otherwise detected from the text).
   - Each question is a Heading 2 ("## Question?"); the text under it is its answer, in the site's own format
     (**bold**, - bullets, numbered lists). A Heading 3 ("### Title") inside an answer becomes a subtitle of the answer.
   - Text before the first question is the optional introduction of that page's FAQ.
   - An Arabic list is matched to the English questions by position: the 1st Arabic question is the translation of the 1st English one.
   Exposes window.KFaq = { parseFiles, TEMPLATE, PAGES }.  */
window.KFaq=(function(){
  'use strict';
  const lc=s=>String(s||'').trim().toLowerCase();
  const norm=s=>lc(s).replace(/\.html?$/,'').replace(/[ً-ٟـ]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه')
    .replace(/[^a-z0-9؀-ۿ]+/g,' ').trim();
  const AR_RE=/[؀-ۿ]/g,LAT_RE=/[A-Za-z]/g;
  const PAGES=[
    ['home','Home',['home','index','home page','main page','الرئيسيه','الصفحه الرئيسيه']],
    ['about','About',['about','about us','about khip','من نحن','عن الشركه']],
    ['patents','Patents',['patents','patent','براءات الاختراع','براءات']],
    ['trademarks','Trademarks',['trademarks','trademark','العلامات التجاريه','علامات تجاريه']],
    ['translation','Translation',['translation','translations','الترجمه']]
  ];
  const names=PAGES.map(([k,n,al])=>[k,n,[k,n,...al].map(norm)]);
  function langOf(a){
    const l=lc(a.lang);
    if(/^(ar|arabic|عربي|عربى|العربية)$/.test(l))return 'ar';
    if(/^(en|english|الإنجليزية|الانجليزية|انجليزي)$/.test(l))return 'en';
    const s=a.title+' '+a.text;
    return (s.match(AR_RE)||[]).length>(s.match(LAT_RE)||[]).length?'ar':'en';
  }
  function findPage(ref){
    const k=norm(ref);if(!k)return null;
    let hit=names.filter(([,,al])=>al.includes(k));
    if(!hit.length){hit=names.filter(([,,al])=>al.some(n=>n.length>2&&(' '+k+' ').includes(' '+n+' ')));if(hit.length>1)hit=[]}
    return hit[0]?{key:hit[0][0],name:hit[0][1]}:null;
  }
  // split the text into intro + questions
  function split(text){
    const intro=[],qs=[];let cur=null;
    for(const line of String(text||'').split('\n')){
      const m=line.match(/^##\s+(.*?)\s*$/);
      if(m){cur={q:m[1],a:[]};qs.push(cur);continue}
      const l=line.replace(/^###\s+/,'## ');
      (cur?cur.a:intro).push(l);
    }
    const tidy=a=>a.join('\n').replace(/\n{3,}/g,'\n\n').trim();
    return {intro:tidy(intro),qs:qs.map(x=>({q:x.q.trim(),a:tidy(x.a)}))};
  }
  async function parseFiles(files,D,A,opts){
    if(!window.KImport)throw new Error('news-import.js is not loaded');
    const r=await KImport.parseFiles(files,Object.assign({assets:new Set()},opts||{},{keepLevels:true}));
    const items=[],warnings=[...r.warnings],seen=new Set();
    for(const a of r.articles){
      const notes=a.notes.filter(n=>!/^(No date|Date not understood|Excerpt created|No article text)/.test(n));
      const pg=findPage(a.service||a.title),lang=langOf(a);
      let text=String(a.text||'').replace(/^!\[[^\]]*\]\(img:\d+\)\s*$/gm,'').replace(/\n{3,}/g,'\n\n').trim();
      if(a.cover||(a.imgs&&a.imgs.length))notes.push('Pictures were skipped');
      if(!pg)notes.push(`No page called "${a.service||a.title}". Use Home, About, Patents, Trademarks or Translation as the title, or a "Page:" line.`);
      const sp=split(text);
      if(!sp.qs.length)notes.push('No questions found: start each question with a Heading 2 (## Question)');
      const bad=sp.qs.filter(x=>!x.a).length;
      if(bad)notes.push(`${bad} question${bad>1?'s have':' has'} no answer`);
      let dup=false;
      if(pg){const k=pg.key+'|'+lang;dup=seen.has(k);seen.add(k);if(dup)notes.push('Another list for the same page and language is in the files: the last one wins')}
      items.push({title:a.title,page:pg?pg.key:'',pageName:pg?pg.name:'',lang,intro:sp.intro,qs:sp.qs,source:a.source,notes,dup,ok:!!pg&&sp.qs.length>0});
    }
    // Arabic and English lists of the same page should have the same number of questions
    for(const it of items){
      if(!it.page||it.lang!=='ar')continue;
      const en=items.filter(o=>o.page===it.page&&o.lang==='en').pop();
      const n=en?en.qs.length:(((D.faq||{}).pages||{})[it.page]||{}).items?.length||0;
      if(n&&it.qs.length!==n)it.notes.push(`Arabic has ${it.qs.length} question${it.qs.length===1?'':'s'} but English has ${n}: they are matched by position`);
    }
    return {items,warnings};
  }
  const TEMPLATE=`# Patents
Language: English

Optional introduction of the Patents FAQ: the text before the first question.

## What can be patented?

An invention that is **new**, involves an inventive step and can be used in industry.

### Not patentable

- Discoveries and scientific theories
- Business methods as such

## How long does a patent last?

Twenty years from the filing date.

# Patents
Language: Arabic

## ما الذي يمكن تسجيله كبراءة اختراع؟

الاختراع الذي يكون **جديدًا** ويتضمن خطوة ابتكارية وقابلًا للتطبيق الصناعي.

## ما مدة حماية البراءة؟

عشرون سنة من تاريخ تقديم الطلب.
`;
  return {parseFiles,TEMPLATE,PAGES};
})();

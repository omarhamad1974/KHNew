/* KHIP service-page importer. Reads the text of the Patents, Trademarks and Translation pages (and any other service) from
   Word (.docx) or Markdown (.md) files, English and Arabic. Used by admin.html (Sections, service page, "Import").
   It reuses the Word / Markdown reader of news-import.js, so that file must be loaded first.

   How a file is read
   - Every service text starts with a title: Heading 1 in Word, "# Title" in Markdown.
   - Right under the title, short "Label: value" lines set the details:
       Service:  which service it belongs to (its name, e.g. Patents, or its page file, e.g. patents.html). Without it the title is used.
       Language: English or Arabic. Without it the language is detected from the text.
       Subtitle: optional, the short brief shown on the service's card on the home page.
   - Everything after them is the page content: the text before the first "## " is the introduction, each "## Heading" becomes a card.
   Second reader, parseServices (Home, Services, "Import services"): the whole services list. One text = one service, with
   Subtitle/Brief, Icon, Page file and Hidden lines, the text up to a "## Page content" line is the pop-up, and the rest is the page.
   Exposes window.KSvc = { parseFiles, parseServices, TEMPLATE, TEMPLATE_LIST }.  */
window.KSvc=(function(){
  'use strict';
  const lc=s=>String(s||'').trim().toLowerCase();
  const norm=s=>lc(s).replace(/\.html?$/,'').replace(/[^a-z0-9\u0600-\u06FF]+/g,' ').trim();
  const AR_RE=/[\u0600-\u06FF]/g,LAT_RE=/[A-Za-z]/g;
  function langOf(a){
    const l=lc(a.lang);
    if(/^(ar|arabic|عربي|عربى|العربية)$/.test(l))return 'ar';
    if(/^(en|english|الإنجليزية|الانجليزية|انجليزي)$/.test(l))return 'en';
    const s=a.title+' '+a.text;
    return (s.match(AR_RE)||[]).length>(s.match(LAT_RE)||[]).length?'ar':'en';
  }
  function findService(ref,D,A,extra){
    const k=norm(ref);if(!k)return null;
    const svs=[...(D.services||[]),...(extra||[])],ar=[...((A&&A.services)||[]),...(extra||[]).map(x=>({id:x.id,title:x.arTitle||''}))];
    const names=s=>{const a=ar.find(x=>String(x.id)===String(s.id));return [s.id,s.title,s.page,a&&a.title].map(norm).filter(Boolean)};
    let hit=svs.filter(s=>names(s).includes(k));
    if(!hit.length){   // "Patents page", "Trademarks - full text": the service name as a whole word inside the label
      hit=svs.filter(s=>names(s).some(n=>n.length>2&&isNaN(n)&&(' '+k+' ').includes(' '+n+' ')));
      if(hit.length>1)hit=[];
    }
    return hit[0]||null;
  }
  async function parseFiles(files,D,A,opts){
    if(!window.KImport)throw new Error('news-import.js is not loaded');
    const r=await KImport.parseFiles(files,opts||{assets:new Set()});
    const items=[],warnings=[...r.warnings],seen=new Set();
    for(const a of r.articles){
      const notes=a.notes.filter(n=>!/^(No date|Date not understood|Excerpt created)/.test(n));
      const sv=findService(a.service||a.title,D,A);
      const lang=langOf(a);
      let text=String(a.text||'').replace(/^!\[[^\]]*\]\(img:\d+\)\s*$/gm,'').replace(/\n{3,}/g,'\n\n').trim();
      if(a.cover||(a.imgs&&a.imgs.length))notes.push('Pictures are not used on service pages and were skipped');
      if(!sv)notes.push(`No service called "${a.service||a.title}". Add a "Service:" line with the service name or its page file.`);
      let dup=false;
      if(sv){const k=sv.id+'|'+lang;dup=seen.has(k);seen.add(k);if(dup)notes.push('Another text for the same service and language is in the files: the last one wins')}
      items.push({title:a.title,sid:sv?String(sv.id):'',svTitle:sv?sv.title:'',page:sv?sv.page:'',lang,brief:a.subtitle||'',text,source:a.source,notes,dup,cover:null,imgs:[]});
    }
    return {items,warnings};
  }
  const POP_RE=/^##\s+(pop[\s-]?up(\s+(content|text))?|more information|details|النافذة المنبثقة|التفاصيل)\s*$/i;
  const PAGE_RE=/^##\s+(page content|dedicated page( content)?|full page|محتوى الصفحة|الصفحة الكاملة)\s*$/i;
  const yes=v=>/^(yes|y|true|1|hide|hidden|نعم)$/i.test(lc(v)),no=v=>/^(no|n|false|0|show|لا)$/i.test(lc(v));
  // The whole services list: every text is one service (new, or an existing one that is updated).
  async function parseServices(files,D,A,opts){
    if(!window.KImport)throw new Error('news-import.js is not loaded');
    const r=await KImport.parseFiles(files,opts||{assets:new Set()});
    const items=[],warnings=[...r.warnings],fresh=[];
    for(const a of r.articles){
      const notes=a.notes.filter(n=>!/^(No date|Date not understood|Excerpt created)/.test(n));
      const lang=langOf(a),ref=a.service||a.title;
      let sv=findService(ref,D,A,fresh),isNew=false;
      if(!sv&&a.pagefile)sv=findService(a.pagefile,D,A,fresh);
      if(!sv&&lang==='en'&&!a.service){            // an English text with no matching service starts a new one
        isNew=true;sv={id:'new'+(fresh.length+1),title:a.title,page:a.pagefile||'',arTitle:''};fresh.push(sv);
      }else if(!sv){
        notes.push(a.service?`No service called "${a.service}". Use the English name of the service, or its page file.`:'No matching service. Add a "Service:" line with the English name of the service (it must exist, or be in the same file in English).');
      }else if(sv.id&&String(sv.id).startsWith('new')&&lang==='en')notes.push('Another text for this new service is in the files: the last one wins');
      if(sv&&lang==='ar'&&String(sv.id).startsWith('new'))sv.arTitle=a.title;
      // split the body: up to "## Page content" is the pop-up, the rest is the dedicated page
      const pop=[],page=[];let into=pop;
      for(const l of String(a.text||'').replace(/^!\[[^\]]*\]\(img:\d+\)\s*$/gm,'').split('\n')){
        if(PAGE_RE.test(l.trim())){into=page;continue}
        if(POP_RE.test(l.trim())){into=pop;continue}
        into.push(l);
      }
      const clean=x=>x.join('\n').replace(/\n{3,}/g,'\n\n').trim();
      if(a.cover||(a.imgs&&a.imgs.length))notes.push('Pictures are not used here and were skipped');
      let brief=a.subtitle||'';
      if(!brief&&a.excerpt&&!a.notes.some(n=>/^Excerpt created/.test(n)))brief=a.excerpt;   // only an Excerpt: line written by the author, not the automatic one
      const hidden=yes(a.hidden)?true:no(a.hidden)?false:null;
      if(a.hidden&&hidden===null)notes.push(`"Hidden: ${a.hidden}" not understood (use yes or no)`);
      if(lang==='ar'&&(a.icon||a.pagefile||a.hidden))notes.push('Icon, Page file and Hidden belong to the English service and were ignored for this Arabic text');
      items.push({title:a.title,sid:sv?String(sv.id):'',svTitle:sv?(isNew?a.title:sv.title):'',isNew,lang,brief,
        icon:lang==='en'?a.icon:'',pagefile:lang==='en'?a.pagefile:'',hidden:lang==='en'?hidden:null,
        details:clean(pop),pageContent:clean(page),source:a.source,notes,cover:null,imgs:[]});
    }
    return {items,warnings};
  }
  const TEMPLATE=`# Patents
Service: Patents
Language: English
Subtitle: Optional. The short line shown on the Patents card of the home page.

The introduction goes here: the text before the first "##" line, shown at the top of the page.

## First card heading

Text of the first card. Use **bold** for emphasis.

- A bullet point
- Another bullet point

## Second card heading

Text of the second card.

# براءات الاختراع
Service: Patents
Language: Arabic

مقدمة الصفحة تكتب هنا.

## عنوان البطاقة الأولى

نص البطاقة الأولى.
`;
  const TEMPLATE_LIST=`# Patents
Service: Patents
Language: English
Brief: The short text on the Patents card of the home page.
Icon: ph-lightbulb
Page file: patents.html
Hidden: no

The pop-up text goes here (shown when the card is opened). Use **bold** for emphasis.

- A bullet point
- Another bullet point

## Page content

The introduction of the dedicated page: the text before the first "##" heading below.

## First card heading

Text of the first card of the page.

# براءات الاختراع
Service: Patents
Language: Arabic
Brief: النص القصير على بطاقة براءات الاختراع.

نص النافذة المنبثقة هنا.

## Page content

مقدمة الصفحة.

## عنوان البطاقة الأولى

نص البطاقة الأولى.

# Design registration
Language: English
Brief: A NEW service: a title that matches no existing service creates one.

Pop-up text of the new service.
`;
  return {parseFiles,parseServices,TEMPLATE,TEMPLATE_LIST};
})();

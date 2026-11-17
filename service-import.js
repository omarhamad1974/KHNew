/* KHIP service-page importer. Reads the text of the Patents, Trademarks and Translation pages (and any other service) from
   Word (.docx) or Markdown (.md) files, English and Arabic. Used by admin.html (Sections, service page, "Import").
   It reuses the Word / Markdown reader of news-import.js, so that file must be loaded first.

   How a file is read
   - Every service text starts with a title: Heading 1 in Word, "# Title" in Markdown.
   - Right under the title, short "Label: value" lines set the details:
       Service:  which service it belongs to (its name, e.g. Patents, or its page file, e.g. patents.html). Without it the title is used.
       Language: English or Arabic. Without it the language is detected from the text.
       Subtitle: optional, the short brief shown on the service's card on the home page.
       Card title: optional, renames the service (title of the home page card, menu and page).
       Icon:     optional, the card icon (e.g. ph-lightbulb). Taken from the English text.
       Hidden:   optional, yes / no: hide or show the service on the website. Taken from the English text.
       Part:     Page (default) = the full page content, or Pop-up = the pop-up opened from the home page card.
   - Everything after them is the page content (or the pop-up content when Part: Pop-up): the text before the first "## " is the introduction, each "## Heading" becomes a card.
   Exposes window.KSvc = { parseFiles, TEMPLATE }.  */
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
  function findService(ref,D,A){
    const k=norm(ref);if(!k)return null;
    const svs=D.services||[],ar=(A&&A.services)||[];
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
      const notes=a.notes.filter(n=>!/^(No date|Date not understood|Excerpt created|No article text)/.test(n));
      const sv=findService(a.service||a.title,D,A);
      const lang=langOf(a);
      let text=String(a.text||'').replace(/^!\[[^\]]*\]\(img:\d+\)\s*$/gm,'').replace(/\n{3,}/g,'\n\n').trim();
      if(a.cover||(a.imgs&&a.imgs.length))notes.push('Pictures are not used on service pages and were skipped');
      if(!sv)notes.push(`No service called "${a.service||a.title}". Add a "Service:" line with the service name or its page file.`);
      const part=/pop|نافذة|منبثق/i.test(a.part||'')?'popup':'page';
      const hv=lc(a.hidden),hidden=/^(yes|true|1|y|on|نعم|مخفي)$/.test(hv)?true:/^(no|false|0|n|off|لا)$/.test(hv)?false:null;
      if(a.hidden&&hidden===null)notes.push(`\"Hidden:\" not understood (use yes or no): \"${a.hidden}\"`);
      const icon=String(a.icon||'').trim(),cardtitle=String(a.cardtitle||'').trim();
      if(lang==='ar'&&(icon||hidden!==null))notes.push('Icon and Hidden are not translated: they are read from the English text only');
      if(!text&&!a.subtitle&&!cardtitle&&!icon&&hidden===null)notes.push('Nothing to import: no text and no details');
      let dup=false;
      if(sv){const k=sv.id+'|'+lang+'|'+part;dup=seen.has(k);seen.add(k);if(dup)notes.push('Another text for the same service, language and part is in the files: the last one wins')}
      items.push({title:a.title,sid:sv?String(sv.id):'',svTitle:sv?sv.title:'',page:sv?sv.page:'',lang,part,cardtitle,icon,hidden,brief:a.subtitle||'',text,source:a.source,notes,dup,cover:null,imgs:[]});
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

# Patents pop-up
Service: Patents
Language: English
Part: Pop-up

The text shown when the Patents card on the home page is opened.

# براءات الاختراع
Service: Patents
Language: Arabic

مقدمة الصفحة تكتب هنا.

## عنوان البطاقة الأولى

نص البطاقة الأولى.
`;
  return {parseFiles,TEMPLATE};
})();

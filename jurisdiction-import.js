/* KHIP jurisdiction importer. Reads the country texts (overview and filing details) from Word (.docx) or Markdown (.md)
   files, English and Arabic, many countries in one file. Used by admin.html (Sections, Jurisdictions, "Import countries").
   It reuses the Word / Markdown reader of news-import.js, so that file must be loaded first.

   How a file is read
   - Every country text starts with a title: Heading 1 in Word, "# Title" in Markdown. The title is the country name.
   - Right under the title, short "Label: value" lines set the details:
       Language: English or Arabic. Without it the language is detected from the text.
       Country:  optional, the English country name. Use it in an Arabic text so it finds its English country.
       Code:     the 2-letter country code (ae, sa, bh ...). Used to find the flag and to match texts. English text only.
       Tag:      optional, the short label on the country card.
   - Everything after them is the content. Text before the first "## " line (and under "## Overview") is the Overview shown on the
     country card; everything under "## Filing details" (or "## Filing requirements") is the Filing details of the pop-up.
     Other "## Heading" lines stay where they are, inside the part they follow.
   - A country is found by its code, its "Country:" line or its title (English or Arabic name). A country that is not on the
     site yet is added (English text). An Arabic text finds its English country in the site or in the same file.
   Exposes window.KJur = { parseFiles, TEMPLATE }.  */
window.KJur=(function(){
  'use strict';
  const lc=s=>String(s||'').trim().toLowerCase();
  const norm=s=>lc(s).replace(/[ً-ٟـ]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه')
    .replace(/[^a-z0-9؀-ۿ]+/g,' ').trim();
  const AR_RE=/[؀-ۿ]/g,LAT_RE=/[A-Za-z]/g;
  const OVER=/^(overview|summary|about|نظرة عامة|ملخص|نبذة)$/i;
  const FILING=/^(filing(\s+(details|requirements|guidelines))?|requirements|details|متطلبات.*|تفاصيل.*|شروط.*)$/i;
  function langOf(a){
    const l=lc(a.lang);
    if(/^(ar|arabic|عربي|عربى|العربية)$/.test(l))return 'ar';
    if(/^(en|english|الإنجليزية|الانجليزية|انجليزي)$/.test(l))return 'en';
    const s=a.title+' '+a.text;
    return (s.match(AR_RE)||[]).length>(s.match(LAT_RE)||[]).length?'ar':'en';
  }
  // split the body: overview (card) and filing details (pop-up)
  function split(text){
    const out={brief:[],details:[]};let cur='brief';
    for(const line of String(text||'').split('\n')){
      const m=line.match(/^##\s+(.*?)\s*$/);
      if(m){
        const h=m[1].replace(/[:：]\s*$/,'');
        if(OVER.test(h)){cur='brief';continue}
        if(FILING.test(h)){cur='details';continue}
      }
      out[cur].push(line);
    }
    const tidy=a=>a.join('\n').replace(/\n{3,}/g,'\n\n').trim();
    return {brief:tidy(out.brief),details:tidy(out.details)};
  }
  async function parseFiles(files,D,A,opts){
    if(!window.KImport)throw new Error('news-import.js is not loaded');
    const r=await KImport.parseFiles(files,opts||{assets:new Set()});
    const items=[],warnings=[...r.warnings],seen=new Set();
    const js=D.jurisdictions||[],ar=A.jurisdictions||[];
    const arOf=(o,i)=>ar.find(y=>y&&o.id!=null&&String(y.id)===String(o.id))||(o.id==null?ar[i]:null)||{};
    const known=js.map((o,i)=>({i,keys:[o.code,o.country,arOf(o,i).country].map(norm).filter(Boolean)}));
    const find=keys=>{const ks=keys.map(norm).filter(Boolean);if(!ks.length)return -1;const h=known.find(k=>k.keys.some(x=>ks.includes(x)));return h?h.i:-1};
    // pass 1: read every text
    for(const a of r.articles){
      const notes=a.notes.filter(n=>!/^(No date|Date not understood|Excerpt created|No article text)/.test(n));
      const lang=langOf(a);
      let text=String(a.text||'').replace(/^!\[[^\]]*\]\(img:\d+\)\s*$/gm,'').replace(/\n{3,}/g,'\n\n').trim();
      if(a.cover||(a.imgs&&a.imgs.length))notes.push('Pictures are not used on country cards and were skipped');
      const code=String(a.code||'').trim().toLowerCase().replace(/^['"]|['"]$/g,'');
      if(code&&!/^[a-z]{2}$/.test(code))notes.push(`Country code "${a.code}" is not 2 letters`);
      if(lang==='ar'&&code)notes.push('Code is read from the English text only');
      const sp=split(text);
      if(!sp.brief&&!sp.details)notes.push('No text');
      items.push({title:a.title,country:String(a.country||'').trim(),code:/^[a-z]{2}$/.test(code)?code:'',tag:String(a.category||'').trim(),
        lang,brief:sp.brief,details:sp.details,source:a.source,notes,di:-1,pair:-1,isNew:false,dup:false});
    }
    // pass 2: find each country on the site (or, for Arabic, the English text of the same file)
    items.forEach((it,n)=>{
      it.di=find([it.code,it.country,it.title]);
      if(it.di<0&&it.lang==='ar'){
        const p=items.findIndex(o=>o.lang==='en'&&o!==it&&[o.code,o.country,o.title].map(norm).filter(Boolean).some(x=>[it.code,it.country].map(norm).filter(Boolean).includes(x)));
        if(p>=0)it.pair=p;
      }
      if(it.di<0&&it.pair<0){
        if(it.lang==='en'){it.isNew=true;if(!it.code)it.notes.push('New country without a code: it will have no flag. Add a "Code:" line (ae, sa, ...)')}
        else it.notes.push(`No country found for "${it.title}". Add the English text in the same file, or a "Country:" line with the English name or a "Code:" line.`)
      }
      const key=(it.di>=0?'d'+it.di:it.pair>=0?'p'+it.pair:'n'+norm(it.title))+'|'+it.lang;
      if(seen.has(key)){it.dup=true;it.notes.push('Another text for the same country and language is in the files: the last one wins')}
      seen.add(key);
      it.ok=it.di>=0||it.pair>=0||it.isNew;
    });
    return {items,warnings};
  }
  const TEMPLATE=`# United Arab Emirates
Language: English
Code: ae
Tag: GCC

Overview shown on the country card: a few short lines.

## Filing details

First paragraph of the filing requirements.

## Fees and timing

- A bullet point
- Another bullet point

# الإمارات العربية المتحدة
Language: Arabic
Country: United Arab Emirates

نظرة عامة تظهر في بطاقة الدولة.

## متطلبات التسجيل

نص متطلبات التسجيل.
`;
  return {parseFiles,TEMPLATE,split};
})();

/* KHIP hero-slider importer. Reads the slides of the home page slider from files, for admin.html (Carousel tab, "Import slides").
   Accepted files (several at once is fine)
   - Word (.docx), Markdown (.md) or text (.txt): every slide starts with a title (Heading 1 in Word, "# Title" in Markdown).
     Right under the title, short "Label: value" lines set the details:  Subtitle:  Tag:  Image:
     In Word the first picture of a slide is its image. (Arabic labels work too.)
     If there is no "Subtitle:" line, the first paragraph under the title is used (shortened).
   - Spreadsheet (.xlsx, .xls) or .csv: one row per slide. Header row with Title, Subtitle, Tag, Image (any order).
     Image = a file name picked together with the sheet, a file already in assets/, or a web address.
   - A .zip holding Word / Markdown files and pictures also works (spreadsheets must be picked directly, not inside a zip).
   Needs news-import.js (Word / Markdown reader). Exposes window.KSlides = { parseFiles, TEMPLATE_MD, TEMPLATE_CSV }.  */
window.KSlides=(function(){
  'use strict';
  const MIME={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp'};
  const ext=n=>(String(n).match(/\.([a-z0-9]+)$/i)||[,''])[1].toLowerCase();
  const base=n=>String(n).split(/[\\/]/).pop();
  const lc=s=>String(s).toLowerCase();
  const COLS=[
    ['title',/^(slide[\s_-]*)?(title|headline|heading)$|^العنوان$|^عنوان/i],
    ['subtitle',/^(sub[\s_-]?title|sub[\s_-]?heading|text|description|caption|العنوان الفرعي|النص|الوصف)$/i],
    ['tag',/^(tag|label|badge|category|الوسم|التصنيف|الفئة)$/i],
    ['image',/^(image|photo|picture|cover|file|file name|الصورة)$/i]
  ];
  const short=(t,n=120)=>{t=String(t||'').replace(/\*\*/g,'').replace(/\s+/g,' ').trim();if(t.length<=n)return t;const c=t.slice(0,n),sp=c.lastIndexOf(' ');return c.slice(0,sp>60?sp:n).replace(/[\s,;:.\-–]+$/,'')+'…'};

  let xlsxP=null;
  function loadXlsx(){
    if(window.XLSX)return Promise.resolve();
    return xlsxP=xlsxP||new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      s.onload=ok;s.onerror=()=>{xlsxP=null;no(new Error('Could not load the Excel reader. Check your internet connection and try again.'))};document.head.appendChild(s)});
  }
  // a picture reference from a spreadsheet cell -> {kind:'url'|'asset'|'bytes'}
  async function resolveImage(ref,pics,assets,warn,src){
    ref=String(ref||'').trim();if(!ref)return null;
    if(/^https?:\/\//i.test(ref))return {kind:'url',url:ref};
    let name=base(ref.split(/[?#]/)[0]);try{name=decodeURIComponent(name)}catch{}
    const f=pics.get(lc(name));
    if(f){const data=new Uint8Array(await f.arrayBuffer());return {kind:'bytes',data,mime:MIME[ext(name)],name:f.name}}
    if(assets&&assets.has(name))return {kind:'asset',name};
    warn(`${src}: picture not found: ${name} (pick it together with the sheet, or upload it to assets first)`);
    return null;
  }
  async function fromSheet(file,pics,assets,warn){
    await loadXlsx();
    const wb=/\.csv$/i.test(file.name)?XLSX.read(await file.text(),{type:'string',raw:true}):XLSX.read(await file.arrayBuffer(),{type:'array'});
    const rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,raw:true,defval:''});
    let h=-1,map={};
    for(let i=0;i<Math.min(rows.length,8)&&h<0;i++){
      const m={};rows[i].forEach((c,j)=>{const t=String(c).trim();if(!t)return;for(const [k,re] of COLS)if(!(k in m)&&re.test(t)){m[k]=j;break}});
      if('title' in m){h=i;map=m}
    }
    if(h<0){warn(`${file.name}: no header row with a "Title" column was found. The first row should read: Title, Subtitle, Tag, Image.`);return []}
    const out=[];
    for(let i=h+1;i<rows.length;i++){
      const r=rows[i],get=k=>k in map?String(r[map[k]]??'').trim():'';
      if(!get('title')){if(r.some(c=>String(c).trim()))warn(`${file.name}, row ${i+1}: skipped (no title)`);continue}
      out.push({title:get('title'),subtitle:get('subtitle'),tag:get('tag'),image:await resolveImage(get('image'),pics,assets,warn,`${file.name}, row ${i+1}`),source:file.name,notes:[]});
    }
    return out;
  }
  async function parseFiles(list,opts={}){
    const warnings=[],warn=m=>warnings.push(m),slides=[],assets=opts.assets||null;
    const sheets=[],other=[],pics=new Map();
    const queue=[...list];
    while(queue.length){
      const f=queue.shift(),x=ext(f.name);
      if(x==='xlsx'||x==='xls'||x==='csv')sheets.push(f);
      else if(MIME[x]){pics.set(lc(base(f.name)),f);other.push(f)}
      else other.push(f);
    }
    // Word / Markdown / zip files go through the article reader: one "article" = one slide
    if(other.some(f=>/\.(docx|doc|md|markdown|txt|zip)$/i.test(f.name))){
      const r=await window.KImport.parseFiles(other,{assets});
      r.warnings.forEach(w=>warn(w));
      for(const a of r.articles)slides.push({
        title:a.title,subtitle:a.subtitle||short(a.excerpt),tag:a.category||'',image:a.cover||null,source:a.source,
        notes:a.notes.filter(n=>!/^(No date|No article text|Excerpt created)/.test(n))
      });
    }
    for(const f of sheets){try{slides.push(...await fromSheet(f,pics,assets,warn))}catch(e){warn(`${f.name}: ${e.message||e}`)}}
    return {slides,warnings};
  }
  const TEMPLATE_MD=`# Slide title goes here
Subtitle: One short line shown under the title
Tag: Featured
Image: slide-photo.jpg

# Second slide title
Subtitle: Another short line
Image: https://example.com/photo.jpg
`;
  const TEMPLATE_CSV='\ufeffTitle,Subtitle,Tag,Image\r\n"Slide title goes here","One short line shown under the title","Featured","slide-photo.jpg"\r\n"Second slide title","Another short line","","https://example.com/photo.jpg"\r\n';
  return {parseFiles,TEMPLATE_MD,TEMPLATE_CSV};
})();

/* Builds the import templates in templates/: for every importer of the admin a Word file (.docx) and a Markdown file (.md)
   with the same content, and the slides spreadsheet (.csv).
     node scripts/build-templates.js
   The content of each template = a "How to fill in" box (ignored by the importers: it comes before the first Heading 1)
   + the example the admin itself offers (TEMPLATE of news-import.js, slider-import.js, service-import.js,
   jurisdiction-import.js, faq-import.js), so the files always match what the importers read.
   Needs the "docx" npm package (npm install docx) only to run this script; the site does not use it. */
'use strict';
const fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..'),OUT=path.join(ROOT,'templates');
const D=require('docx');
global.window=global;global.document=global.document||{};
['news-import.js','slider-import.js','service-import.js','jurisdiction-import.js','faq-import.js'].forEach(f=>require(path.join(ROOT,f)));

// [file name, title, where in the admin, how-to lines, example (Markdown), Word-only notes]
const T=[
  ['news-template','News articles','Sections, Home, Latest news, Import',[
    'Every article starts with its title in the style Heading 1 (Markdown: a line starting with "# ").',
    'Right under the title, optional lines "Label: value": Subtitle, Date (2026-03-14), Category, Excerpt (the text of the news card), Image (a picture file already on the site, or a web address).',
    'Then the article text. Heading 2 = a subheading, bullets and bold work as usual.',
    'Word: the first picture you insert (Insert, Pictures) under an article becomes its cover; other pictures stay in the text.',
    'Arabic version of an article: its own Heading 1 with the lines "Language: Arabic" and "English title: <the English title>". The date, category and pictures come from the English article.',
    'Many articles can go in one file.'],KImport.TEMPLATE],
  ['slides-template','Home page slider','Sections, Home, Slider, Import slides',[
    'Every slide starts with its title in the style Heading 1 (Markdown: a line starting with "# ").',
    'Right under the title, optional lines "Label: value": Subtitle, Tag, Image (a picture file already on the site, or a web address).',
    'Word: the first picture you insert under a slide title is its picture.',
    'If there is no Subtitle line, the first sentence under the title is used.',
    'You can also fill the spreadsheet slides-template.csv: one row per slide.'],KSlides.TEMPLATE_MD],
  ['service-pages-template','Service pages (Patents, Trademarks, Translation)','Sections, Patents (or Trademarks, Translation), Details, Import from Word / Markdown',[
    'Every text starts with a title in the style Heading 1 (Markdown: "# ").',
    'Right under the title, lines "Label: value": Service (Patents, Trademarks, Translation or the page file), Language (English or Arabic), and optional Subtitle (the short text on the home page card), Card title, Icon, Hidden (yes / no), Part (Page or Pop-up).',
    'Text before the first Heading 2 is the introduction at the top of the page; each Heading 2 becomes a card with the text under it.',
    'Part: Pop-up fills the pop-up opened from the card on the home page instead of the page.',
    'An Arabic text has its own Heading 1 with "Language: Arabic" and the same Service line.'],KSvc.TEMPLATE],
  ['jurisdictions-template','Countries (Jurisdictions)','Sections, Home, Regional map (or About, Jurisdictions), Import countries',[
    'Every country starts with its name in the style Heading 1 (Markdown: "# ").',
    'Right under the name, lines "Label: value": Language (English or Arabic), Code (the 2-letter country code: ae, sa, eg ...), optional Tag (the short label of the country card). In an Arabic text add "Country: <the English name>".',
    'Text before the first Heading 2 is the overview on the country card.',
    'Everything under the Heading 2 "Filing details" is the text of the country pop-up (Filing requirements).',
    'A country that is not on the site yet is added.'],KJur.TEMPLATE],
  ['faq-template','Frequently asked questions','Sections, any FAQ section, Import FAQ',[
    'Every list starts with the page name in the style Heading 1: Home, About, Patents, Trademarks or Translation.',
    'Right under it, an optional line "Language: English" or "Language: Arabic".',
    'Each question is a Heading 2; the text under it is the answer. A Heading 3 inside an answer becomes a small subtitle.',
    'Text before the first question is the optional introduction of that FAQ.',
    'Arabic: a second Heading 1 with the same page and "Language: Arabic". The 1st Arabic question is the translation of the 1st English one, and so on.'],KFaq.TEMPLATE]
];
const COMMON=['Fill in, save, then in the admin open the place above, press Import and pick this file. You see everything before it is saved.',
  'This box is not imported: everything before the first Heading 1 is ignored, so you can leave it or delete it.'];

/* ---------- Markdown ---------- */
const mdOf=([f,title,where,how,ex])=>`> **${title}: how to fill in this template**\n> Import it in the admin: ${where}.\n>\n${how.concat(COMMON).map(l=>'> - '+l).join('\n')}\n\n${ex.trim()}\n`;

/* ---------- Word ---------- */
const AR=/[؀-ۿ]/;
const runs=(text,o={})=>{                                         // **bold** -> bold runs
  const out=[],rtl=AR.test(text);
  String(text).split(/(\*\*[^*]+\*\*)/).filter(Boolean).forEach(p=>{
    const b=/^\*\*.*\*\*$/.test(p);out.push(new D.TextRun({text:b?p.slice(2,-2):p,bold:b||o.bold,italics:o.italics,rightToLeft:rtl,color:o.color}));
  });
  return out;
};
const para=(text,o={})=>new D.Paragraph({children:runs(text,o),bidirectional:AR.test(text),heading:o.heading,numbering:o.bullet?{reference:'bul',level:0}:undefined,
  shading:o.box?{type:D.ShadingType.CLEAR,fill:'FFF6E0',color:'auto'}:undefined,border:o.box?{left:{style:D.BorderStyle.SINGLE,size:18,color:'C9A44C',space:8}}:undefined,
  spacing:o.box?{after:60}:o.gap?{after:140}:undefined,indent:o.box&&!o.bullet?{left:120}:undefined});
function docOf([f,title,where,how,ex]){
  const kids=[
    para(`${title}: how to fill in this template`,{box:1,bold:1}),
    para(`Import it in the admin: ${where}.`,{box:1}),
    ...how.concat(COMMON).map(l=>para(l,{box:1,bullet:1})),
    new D.Paragraph({children:[]})
  ];
  for(const raw of ex.trim().split('\n')){
    const l=raw.trimEnd();
    if(!l.trim())continue;                                         // Word paragraphs replace the blank lines
    if(/^!\[[^\]]*\]\([^)]*\)$/.test(l.trim()))continue;                // Markdown picture: in Word the client inserts a real picture (see the box)
    let m;
    if((m=/^(#{1,3})\s+(.*)$/.exec(l)))kids.push(para(m[2],{heading:[D.HeadingLevel.HEADING_1,D.HeadingLevel.HEADING_2,D.HeadingLevel.HEADING_3][m[1].length-1]}));
    else if((m=/^\s*[-*]\s+(.*)$/.exec(l)))kids.push(para(m[1],{bullet:1}));
    else kids.push(para(l,{gap:!/^[A-Za-z\u0600-\u06FF][A-Za-z\u0600-\u06FF ]{1,24}:\s/.test(l)}));   // a "Label: value" line stays close to the next one
  }
  const H=(size,before)=>({run:{font:'Arial',size,bold:true,color:'173A7A'},paragraph:{spacing:{before,after:120},keepNext:true}});
  return new D.Document({
    creator:'KHIP',title:`KHIP import template: ${title}`,
    styles:{default:{document:{run:{font:'Arial',size:22}},heading1:H(34,360),heading2:H(28,240),heading3:H(24,200)},
      paragraphStyles:[]},
    numbering:{config:[{reference:'bul',levels:[{level:0,format:D.LevelFormat.BULLET,text:'•',alignment:D.AlignmentType.LEFT,style:{paragraph:{indent:{left:540,hanging:300}}}}]}]},
    sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1200,bottom:1200,left:1200,right:1200}}},children:kids}]
  });
}

(async()=>{
  fs.mkdirSync(OUT,{recursive:true});
  for(const t of T){
    fs.writeFileSync(path.join(OUT,t[0]+'.md'),mdOf(t));
    fs.writeFileSync(path.join(OUT,t[0]+'.docx'),await D.Packer.toBuffer(docOf(t)));
    console.log('templates/'+t[0]+'.md + .docx');
  }
  fs.writeFileSync(path.join(OUT,'slides-template.csv'),KSlides.TEMPLATE_CSV);console.log('templates/slides-template.csv');
})();

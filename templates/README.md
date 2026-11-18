# Import templates

Ready-to-fill files for every import of the admin. Each comes as **Word (.docx)** and **Markdown (.md)** with the same content; the slider also has a spreadsheet (.csv). Give them to whoever writes the content: they fill them in, and the admin imports them.

| Template | What it fills | Where to import it in the admin |
|---|---|---|
| `news-template` | News articles (English and Arabic) | Sections, Home, Latest news, **Import** |
| `slides-template` (+ `.csv`) | The slides of the home page slider | Sections, Home, Slider, **Import slides** |
| `service-pages-template` | The Patents, Trademarks and Translation pages, their home page cards and pop-ups | Sections, Patents (or Trademarks, Translation), Details, **Import from Word / Markdown** |
| `jurisdictions-template` | The countries: overview (country card) and filing details (pop-up) | Sections, Home, Regional map (or About, Jurisdictions), **Import countries** |
| `faq-template` | The questions and answers of the Home, About, Patents, Trademarks and Translation pages | Sections, any FAQ section, **Import FAQ** |

## How to fill them in
- Each file starts with a shaded box (Word) or a quoted block (Markdown) that explains it. That box is **not imported** (everything before the first Heading 1 is ignored), so it can stay.
- In **Word**, use the built-in styles: **Heading 1** starts an item (an article, a slide, a country, a page), **Heading 2** is a subheading, a card or a question. Bullets and **bold** are kept. Pictures: insert them (Insert, Pictures); the first picture of a news article or a slide becomes its picture.
- Right under a Heading 1, lines like `Date: 2026-03-14` or `Language: Arabic` set the details. Keep the word before the colon as it is.
- Arabic goes in the same file, under its own Heading 1 with `Language: Arabic`.
- The admin shows everything before saving, so a mistake can be fixed or the import cancelled.

The import windows of the admin also have **Download a Word template** and **Download a Markdown template** links.

## For whoever maintains the site
The files are generated: `node scripts/build-templates.js` (needs `npm install docx` once). The examples come from the importers themselves (`TEMPLATE` in `news-import.js`, `slider-import.js`, `service-import.js`, `jurisdiction-import.js`, `faq-import.js`), so after changing an importer, run it again.

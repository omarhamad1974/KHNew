# KHIP website

**Start with [MANUAL.md](MANUAL.md)**: setup, hosting and daily use. This file is the feature reference.

Static site (HTML + Tailwind CDN). All content lives in `app-data.json` (English) and `app-data.ar.json` (Arabic) in the GitHub repository. There is no database, no sign-in and no client portal: the only thing that needs a login is the admin page, and it uses a GitHub token.

## Day to day: `admin.html`

Open `https://YOUR-SITE/admin.html`, sign in with a GitHub fine-grained token (Contents: read and write, for this repository only), and edit.

- Tabs, in the order of the site: General, Carousel, Services, News, Jurisdictions, **Team**, **Testimonials**, FAQ, then Colors and Backgrounds. Each content tab says where its items appear on the site and links to that page.
- **Team** (About page slider: name, position, square photo) and **Testimonials** (Home page quotes: name, role, quote) can be edited here, in English and in Arabic.
- **Colors**: the site palette. Ten colors (titles, dark, gold, accent blue, sand, page and section backgrounds, body text) start at the colors the site always used; change any of them, pick a ready-made palette, or add your own named colors. Also sets the **section width** on tablet and desktop (67% is about two thirds).
- **Carousel**: the slides, plus a **Hero height** card at the top (phone / tablet / desktop, in pixels or % of screen height, with ready-made sizes and a reset).
- **Import slides** (Carousel tab): add the home page slides from a Word, Markdown or spreadsheet file. Word: a **Heading 1** per slide, then `Subtitle:` and `Tag:` lines and the picture. Markdown: `# Title` plus the same lines (`Image: photo.jpg`). Spreadsheet: columns `Title, Subtitle, Tag, Image`. You review, then add at the end / top or replace the current slides.
- **FAQ**: questions and answers for the Home, About, Patents, Trademarks and Translation pages (pick the page with the buttons). Each page shows an open-and-close list; a page with no questions shows no FAQ. Stored as `faq` in `app-data.json`: `{ "title": "", "intro": "", "pages": { "patents": { "hidden": false, "title": "", "intro": "", "items": [ { "id": "1", "q": "Question", "a": "Answer" } ] } } }`.
- **Backgrounds**: give any section (home, About, Patents, Trademarks, Translation) a background color from the palette, or a photo that covers the section (with an optional darkening slider). Text turns light on dark backgrounds by itself; the "Text color" option overrides that.
- Text boxes support `**bold**`, `## subtitle` and `- bullet` (use the B, H and list buttons).
- Photos: upload from your device (large photos are shrunk automatically) or pick one already in `assets/`.
- Add, duplicate, reorder, delete, search (long lists), Ctrl+S to save, undo arrow to discard changes, download icon for a backup.


## Arabic (right-to-left) site
Files: `lang.js` (language engine), `pages-i18n.js` (fixed texts of the pages, English and built-in Arabic), `app-data.ar.json` (the Arabic content, same structure as `app-data.json`), plus `index.html`, the four inner pages, `faq.js`, `service-page.js`, `footer.js`, `styles.css`, `rich.js` and `admin.html`.
- **Choose the languages:** admin, Website content, General tab, **Site languages**: English only, Arabic only, or both. With both, a button in the header (العربية / English) lets visitors switch on every page; their choice is remembered. Save to GitHub to apply.
- **Write the Arabic content:** in the admin use the **EN | عربي** switch at the top. The Arabic form has the same items as the English content (carousel, jurisdictions, news, services including the full page text, team, testimonials, FAQ), with the English text shown above each box for reference. Leave a field empty and the Arabic site shows the English text for it, so nothing is ever blank. Images, dates, icons and ids are shared. News categories are translated in the same order as the English list. Saving in Arabic mode writes only `app-data.ar.json`.
- **Interface text** (Arabic mode): the short words of the site (menu, buttons, headings). **Page texts** (Arabic mode): the fixed wording written in the About, Patents, Trademarks and Translation pages. Suggested Arabic is built in for both; type your own to replace it.
- **FAQ:** add, remove and reorder questions in English; in Arabic mode write the Arabic question and answer for each.
- A page with a service text left empty in Arabic shows the English text of that service.

## Services: three editable parts
In admin, Services tab, each service has three text parts (Patents, Trademarks and Translation are filled in already):
1. **Brief**: the short text on the home page card (also the top of the pop-up).
2. **Pop-up content**: the extra information in the pop-up that opens from the home page card or from the About page cards.
3. **Dedicated page content**: the text of the full page (`patents.html`, `trademarks.html`, `translation.html`). Text before the first `## ` line is the introduction; each `## Heading` becomes a card. Leave it empty to keep the text written in the page itself.
The **Dedicated page file** field (for example `patents.html`) connects a service to its page and shows the "More information" button.

## Site navigation (bottom bar)
Home, IP Services (IP Services section), News (Latest news section), Jurisdiction (Jurisdictions section), About (about.html). The round paper-plane Send button sits inside the WhatsApp text box.


## Version stamp and fresh pictures (`site-version.js`)
- A small dark box in the bottom-left corner of every public page shows the build name and when `app-data.json` was last fetched from GitHub (plus the file's saved time). Tap it to shrink; `?debug=0` hides it, `?debug=1` shows it again. Set `STAMP=false` in `site-version.js` to remove it for good.
- All site pictures are requested as `picture.jpg?v=2`. To force a re-download for everyone, raise `IMG_V` in `site-version.js` and change `?v=2` in the logo tags of the HTML pages.

## Checks

`node scripts/validate.js` checks `app-data.json` (required fields, duplicate ids, missing images, bad links). GitHub runs it on every push (`.github/workflows/validate.yml`).

## Notes
- The site loads Tailwind from its CDN, which is fine for this size but is not meant for heavy production use. If pages feel slow, compile Tailwind once and replace the CDN script.
- Contact phone numbers, email and office text are written directly in the HTML pages (about, patents, trademarks, translation); change them there.
- `theme.js` must stay in the same folder as the pages. Without a `theme` block in `app-data.json` the site simply uses the default colors.

## Importing articles (admin, News tab, Import)
Add many articles in one go from Word or Markdown files.
1. Admin > News > **Import**, then choose one or more files (you can also drop them). Accepted: `.docx`, `.md`, `.txt`, a `.zip` with the files and pictures, and picture files chosen together with a `.md` file.
2. **Word**: each article starts with a title in the **Heading 1** style. Right under it, one detail per line: `Subtitle:`, `Date:`, `Category:`, `Excerpt:` (Arabic labels work too). Then the article text. The first picture of an article is its cover; other pictures stay inside the text. Heading 2, bold text and bullet lists are kept.
3. **Markdown**: each article starts with `# Title` (or a `---` front-matter block containing `title:`), followed by the same detail lines. Pictures: `Image: cover.jpg` or `![](photo.jpg)`, picked together with the `.md` file or placed in a `.zip`. `https://` picture addresses are used as they are. The Import window has a "Download a Markdown template" link.
4. Review the list (untick what you do not want, choose top or end of the news list), press **Import**, then **Save to GitHub**. Pictures are uploaded when you press Import; a cover is cropped to 2:1 like the normal upload.
- Dates: 2026-03-14, 14/03/2026 (day first) or 14 March 2026. Categories are matched to your list ignoring case; a new one is added to the list. No excerpt: the first paragraph is used. An article whose title already exists is unticked by default.

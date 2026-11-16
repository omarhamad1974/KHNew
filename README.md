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


## Look controls (admin: General and Sections)
Since admin restructure phase 3 there are no separate Look tabs. **Site-wide** settings are pages of **General**: Colors, Header, bar & menu (header, bottom bar, WhatsApp box, menu), Cards, Text alignment, Picture effects, Animation, Map & logo motion, Brand & logos. The look of **one section** (background, cards, text alignment, photo effect, animation) is in **Sections**: pick the page and the section, then open **Look of this section**. A palette icon on a section's button shows that it has its own look; **Reset this section** removes it. Wherever a section leaves a setting on its default it follows General. The descriptions below still apply; read "tab" as "page of General" or "Look of this section".
Everything below is saved under `theme` in `app-data.json`. Nothing changes on the site until you pick something; **Reset** buttons go back to the original look. Colours can be picked from the site palette, from your own colours (Colors tab) or as any colour.
- **Header & bar** (phase 1): header background (with opacity), header text / menu / icon colour (automatic light text on dark backgrounds), the line under the header; bottom bar background and button colours; the **WhatsApp text box**: background (with opacity), typed text, hint text and icon, outline, send button and send icon.
- **Cards** (phase 1): background (with opacity), text, titles and border of every card (service, news, team, FAQ, quote frame, contact tiles), and the same per section ("Cards in one section"; anything left on *Same as all cards* follows the page-wide settings).
- **Text alignment** (phase 2): for the whole site and for each section, choose start, center, end or justify, separately on phone (under 640 px), tablet (640 to 1023 px) and desktop (1024 px and up). Headings never stretch (with Justify they line up at the start); buttons, icons and photos keep their place. Start and end follow the reading direction, so Arabic flips correctly. Saved as `theme.align` (`all`, and `sec` per section).
- **Logos** (phase 2): the header logo (all pages), the home page logo and the About page logo. For each: replace the picture (upload or pick from `assets/`; a PNG with a transparent background is best) and set its width in pixels for phone, tablet and desktop, with quick sizes S / M / L / XL and an **Original** reset. Saved as `theme.logos` (`header`, `home`, `about`, each with `image`, `m`, `t`, `d`).
- **Menu** (phase 3): choose the layout. **Default**: links in the header on large screens plus the bottom bar (as before). **Bottom bar only**: no links in the header. **Bottom bar and sandwich**: a round three-line button in the header opens a side menu (Home, About, Jurisdictions, Services with Patents / Trademarks / Translation, News) on every screen size. For the side menu you can pick the side (start or end; it flips in Arabic), the panel background and text colour (default: the bottom bar colours), how much the page behind darkens, the panel width, and whether the header keeps its links on large screens. It closes with the X, the dark area, Escape, or after choosing a link. Saved as `theme.menu` (`mode`, `side`, `keepNav`, `bg`, `text`, `overlay`, `width`); the behaviour lives in `look.js`.
- **Image effects** (phase 4): for all pictures, and separately for the home slider, news pictures, team photos and section background photos: **opacity** (0 to 100%) and a **color filter** (a site color, one of your own colors, or any color) with an **intensity** (0 to 100%; 35% when you pick a color and do not move the slider). Each group can follow "All pictures" or have its own; a section that uses a photo background can also get its own effect. The slider pictures start at 80% opacity as before. Section photos fade into the color behind them, and the existing darkening slider (Backgrounds tab) still works on top. Saved as `theme.imgfx` (`all`, `hero`, `news`, `team`, `sections`, `sec` per section). Pictures keep their own look until something is set.
- **Animation of cards and text** (phase 5): for all sections and for each section, separately for **cards** (services, news, FAQ, team, contact tiles) and **text** (titles and paragraphs outside cards): effect (rise, drop, slide in from the start or end, fade, zoom in or out, flip, come into focus, none), distance, feel (smooth, soft, snappy, bounce, even), speed, delay, delay between neighbours (stagger), and whether it plays once or every time it scrolls into view. Cards also get a pointing effect: lift, grow, glow or none. A section with no effect set keeps the original fade-up. Visitors whose device asks for less motion see everything at once. Saved as `theme.anim` (`all` and `sec`, each with `cards` and `text`); the behaviour lives in `look.js`.
- **Animation of the map and logos** (phase 6): **Map**: how it appears when it scrolls into view (countries fade, pop or rise in one after another, optionally with the rest of the map), constant movement of the highlighted countries (breathe, or a wave of light), what happens when pointing at a country (glow, grow, raise), and the pulse around the offices (none, slow, fast, wide, any color). **Logos** (header, home, About; set for all and override per logo): entrance effect, distance, speed, delay, constant movement (float, breathe, sway, glow) and a pointing effect (grow, tilt, lift, glow). Visitors whose device asks for less motion get no automatic movement. Saved as `theme.motion` (`map`, `logos`); the behaviour lives in `look.js`.
- All six Look phases are done; the plan is kept in [LOOK-PLAN.md](LOOK-PLAN.md). is in [LOOK-PLAN.md](LOOK-PLAN.md).

## Arabic (right-to-left) site
Files: `lang.js` (language engine), `pages-i18n.js` (fixed texts of the pages, English and built-in Arabic), `app-data.ar.json` (the Arabic content, same structure as `app-data.json`), plus `index.html`, the four inner pages, `faq.js`, `service-page.js`, `footer.js`, `styles.css`, `rich.js` and `admin.html`.
- **Choose the languages:** admin, Website content, General tab, **Site languages**: English only, Arabic only, or both. With both, a button in the header (العربية / English) lets visitors switch on every page; their choice is remembered. Save to GitHub to apply.
- **Write the Arabic content:** in the admin use the **EN | عربي** switch at the top. The Arabic form has the same items as the English content (carousel, jurisdictions, news, services including the full page text, team, testimonials, FAQ), with the English text shown above each box for reference. Leave a field empty and the Arabic site shows the English text for it, so nothing is ever blank. Images, dates, icons and ids are shared. News categories are translated in the same order as the English list. Saving in Arabic mode writes only `app-data.ar.json`.
- **Interface text** (Arabic mode): the short words of the site (menu, buttons, headings). **Page texts** (Arabic mode): the fixed wording written in the About, Patents, Trademarks and Translation pages. Suggested Arabic is built in for both; type your own to replace it.
- **FAQ:** add, remove and reorder questions in English; in Arabic mode write the Arabic question and answer for each.
- A page with a service text left empty in Arabic shows the English text of that service.

## Services on the home page
Two main cards, centred: **IP Services** (every service except Translation, e.g. Patents and Trademarks, shown as buttons that open the pop-up) and **Translation** (the service whose page is `translation.html`). The same grouping builds the header **Services** drop-down. The home slider's arrows, dots and pause button are off unless ticked in admin, Carousel tab, "Slider controls".

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
- Contact phones, emails, address, map, WhatsApp number and social links: admin, General tab, "Contact details & social links" (stored as `contact` and `social`; `contact.js` puts them on the pages). The sentence "Offices in Egypt, the UAE and Saudi Arabia" is still page text (Page texts tab in Arabic mode; HTML for English).
- `theme.js` must stay in the same folder as the pages. Without a `theme` block in `app-data.json` the site simply uses the default colors.

## Importing articles (admin, News tab, Import)
Add many articles in one go from Word or Markdown files.
1. Admin > News > **Import**, then choose one or more files (you can also drop them). Accepted: `.docx`, `.md`, `.txt`, a `.zip` with the files and pictures, and picture files chosen together with a `.md` file.
2. **Word**: each article starts with a title in the **Heading 1** style. Right under it, one detail per line: `Subtitle:`, `Date:`, `Category:`, `Excerpt:` (Arabic labels work too). Then the article text. The first picture of an article is its cover; other pictures stay inside the text. Heading 2, bold text and bullet lists are kept.
3. **Markdown**: each article starts with `# Title` (or a `---` front-matter block containing `title:`), followed by the same detail lines. Pictures: `Image: cover.jpg` or `![](photo.jpg)`, picked together with the `.md` file or placed in a `.zip`. `https://` picture addresses are used as they are. The Import window has a "Download a Markdown template" link.
4. Review the list (untick what you do not want, choose top or end of the news list), press **Import**, then **Save to GitHub**. Pictures are uploaded when you press Import; a cover is cropped to 2:1 like the normal upload.
- Dates: 2026-03-14, 14/03/2026 (day first) or 14 March 2026. Categories are matched to your list ignoring case; a new one is added to the list. No excerpt: the first paragraph is used. An article whose title already exists is unticked by default.

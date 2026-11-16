# Change log

## Batch 1: sliders, logo, services, Bahrain
- **Slider controls and indicators** everywhere a slider exists: home hero (previous/next, dots, pause button, swipe), Latest news (previous/next + dots, mobile and desktop; hidden when everything fits on screen), Client endorsements (previous/next + dots), related news in the article pop-up, and the About page team slider (dots added to the existing buttons). Labels are translated (Interface text tab in Arabic mode).
- **Header logo**: the new Khaled Hamada Intellectual Property logo (`assets/khaled-hamada-ip-logo.png`) replaces the "KHIP | Intellectual Properties" text on every page. Replace that file to change the logo.
- **Translation service hidden**: Services tab, Translation, tick **Hide this service on the website**. It disappears from the home page cards, the About page and the links on the Patents and Trademarks pages; `translation.html` sends visitors to the home page. Untick it to bring it back. The WhatsApp suggestion about translating a patent was replaced.
- **Bahrain flag**: the country was spelled "Bahrian" in `app-data.json`, so no flag was found. Fixed, and every country now has its 2-letter code. The site also tolerates the old spelling.

## Batch 2: sections swapped, country arrows, full-width hero, article import
- **Home and About swapped**: the home page now shows the regional map (formerly "Our Regional Coverage" on About) in the place of the Jurisdictions slider, and the About page shows the Jurisdictions slider in the place of the map. Each section keeps the position, spacing and background setting of the slot it moved into (admin, tab Backgrounds: "Home page: Regional coverage map" and "About page: Jurisdictions"). The bottom-bar "Jurisdiction" button and the menu links still work on both pages.
- **Country arrows**: the Jurisdictions slider has previous/next arrows on both sides of the card (swipe, chips and the 15-second auto-advance still work, and it pauses after you use an arrow). The country pop-up ("View Filing Requirements", from the slider and from the map) has a Previous / Next bar showing the neighbouring country names, the keyboard arrow keys, and swipe on touch screens. It wraps from the last country to the first.
- **Hero carousel**: full page width (no side margins or rounded corners) and half the previous height. Texts are smaller and limited to two lines so they fit.
- **Import articles (admin, News tab, Import button)**: add many articles at once from Word (.docx) or Markdown (.md/.txt) files, with their pictures. See README.md, "Importing articles". New file: `news-import.js`.
- **News subtitle**: articles have a new Subtitle field (shown under the title in the article pop-up; translatable in the Arabic form).
- **Pictures inside articles**: write `![description](photo.jpg)` on its own line in the full article text. Bare file names are looked up in `assets/`.

## Batch 3, phase 1 of 3: hero height
- **Hero height (admin, Carousel tab, top card)**: set how tall the home page slider is, separately for phone (under 640 px), tablet (640 to 1023 px) and desktop (1024 px and up). Pick a ready-made size (Standard, Compact, Tall, Large, Almost full screen) or type your own, in pixels (100 to 900) or as a % of the screen height (15 to 100). A small preview shows the desktop height. **Reset** goes back to the built-in heights. Saved as `theme.hero` in `app-data.json`; until you change something the site looks exactly as before.
- Photos uploaded in the Carousel tab are now cropped to a 16:10 shape (was wider), so taller heroes still show enough of the picture.
- `scripts/validate.js` also checks `theme.hero`.

## Batch 3, phase 2 of 3: import the hero slides from a file
- **Import slides (admin, Carousel tab, button next to Add slide)**: fill the home page slider from a **Word (.docx)**, **Markdown/text** or **spreadsheet (.xlsx, .csv)** file, several files at once. New file: `slider-import.js` (it reuses the Word/Markdown reader in `news-import.js`).
  - Word: each slide starts with a **Heading 1** title; right under it, `Subtitle:` and `Tag:` lines; the slide's first picture becomes its image. With no `Subtitle:` line the first paragraph is used (shortened).
  - Markdown: `# Title`, then `Subtitle:`, `Tag:`, `Image: photo.jpg` lines (a web address works too; pick the picture files together with the .md).
  - Spreadsheet: first row `Title, Subtitle, Tag, Image`, one row per slide.
  - You review every slide (untick any, see pictures and warnings), then choose **add at the end**, **add at the top** or **replace all current slides**. Nothing is published until you press Save.
  - Pictures are resized and cropped to 16:10 automatically. Templates (Markdown and CSV) can be downloaded from the window.

## Batch 3, phase 3 of 3: FAQ on five pages
- **FAQ tab (admin)**: one list of questions and answers for each of the **Home, About, Patents, Trademarks and Translation** pages. Add, duplicate, reorder and delete questions; answers use the usual text format (`**bold**`, `## subtitle`, `- bullet`, pictures). An optional heading and introduction can be set for all pages, and overridden for one page. A **Hide the FAQ on this page** tick keeps the questions but removes the section. A question without an answer (or the reverse) is flagged when you press Save; completely blank rows are dropped.
- **On the site**: a collapsible list (open and close each answer) in a new FAQ section: on Home after the endorsements, on About before Contact, on Patents, Trademarks and Translation before the contact block. A page with no questions shows no FAQ section at all. New file: `faq.js`.
- **Backgrounds**: every FAQ section can get its own color or photo (admin, Backgrounds tab, "... page: FAQ"), like the other sections.
- **Search engines**: the questions are also published as FAQ structured data (schema.org FAQPage) on each page.
- **Translation page**: while the Translation service is switched off (Services tab) its page sends visitors to the home page, so its FAQ is not shown; the admin tells you so.
- English only for now: on the Arabic version of the home page the FAQ shows the English text (changed in cleanup phase 3).
- `scripts/validate.js` also checks `faq`.


## Cleanup, phase 1 of 5: leftovers of an older project removed
- Removed everything that did not belong to this website: the **Leads**, **Users & sectors** and **Issues** areas of the admin, client sign-in (`auth.js`), the **My files** page (`my-stuff.html`), the "My files" link in every page header and in the bottom bar, the sign-in styles, the Supabase configuration, SQL scripts and the `admin-clients` function, and the leftover `brand`, `contact` and `theme.brand` entries in `app-data.json`.
- The admin is now only the website-content editor (GitHub token). The repository name field starts as `KHNew` instead of `Hot-Info`.
- The bottom bar has five buttons (Home, IP Services, News, Jurisdiction, About).
- README and MANUAL rewritten for the site as it is now (no Supabase, no client portal).

## Cleanup, phase 2 of 5: admin rebuilt for the site as it is
- New **Team** tab (About page slider) and **Testimonials** tab (Home page quotes). Before, the site showed both but the admin had no form for them. Both work in English and in Arabic (EN | عربي switch), team photos are cropped square on upload.
- Tabs follow the order of the site (General, Carousel, Services, News, Jurisdictions, Team, Testimonials, FAQ), with Colors and Backgrounds in a separate "Look" group. Every content tab says where its items appear and links to that page.
- Sign-in page rewritten for KHIP (title, text, repository default `KHNew`).

## Cleanup, phase 3 of 5: Arabic on every page
- **About, Patents, Trademarks and Translation now have an Arabic version** (right-to-left), like the home page: the language button in the header (shown when the site languages are set to *both*), the menu, headings, the About text, the contact block, the page title. The built-in Arabic wording for all of it is in the new file `pages-i18n.js` (61 short texts, English next to Arabic). The pages load `lang.js` and `pages-i18n.js` in `<head>`.
- **Page texts tab (admin, Arabic mode)**: shows every fixed text of those pages with the English above and the built-in Arabic as a grey suggestion. Type your own wording to replace it (stored as `tx_...` entries in `ui` in `app-data.ar.json`).
- **FAQ in Arabic (admin, Arabic mode, FAQ tab)**: the same questions as the English list, with the Arabic question and answer written under each; heading and introduction can be translated too. An item without Arabic shows in English. The FAQ search-engine data (FAQPage) follows the language shown. English-only note removed.
- **Service pages in Arabic**: the Patents, Trademarks and Translation pages read the Arabic `pageContent` of each service from `app-data.ar.json` (Services tab, Arabic mode), as the home page already did for the card texts.
- **Team and testimonials**: positions, roles and quotes show in Arabic from the Arabic form (Team and Testimonials tabs); the team slider, country slider and pop-ups mirror for right-to-left (arrows, swipe, keyboard).
- **Draft Arabic content filled in `app-data.ar.json`** so the Arabic site is not empty: the three services (title, brief, pop-up, full page), the home page text, the team positions, the testimonial quote and role, the 11 country names. **It is a draft: have a native legal reader review it before launch.** Names of people, the country summaries/filing guidelines, news and carousel are still empty (they show in English).
- Shared loader `KLang.load()` in `lang.js` (English or Arabic data with one saved copy per language); `faq.js`, `service-page.js` and `about.html` use it.
- **`scripts/validate.js` now really checks what this log claimed earlier**: `theme.hero` and `faq` checks lived only in the copy at the project root, not in the one GitHub runs. Both are now in `scripts/validate.js`, which also checks `app-data.ar.json` (valid JSON, every Arabic item matches an English item by id, FAQ page names).



## Cleanup, phase 4 of 5: version stamp, fresh pictures, final sweep
- **Debug stamp** (new file `site-version.js`, loaded first on every public page): a small box in the bottom-left corner shows the build name and, for `app-data.json` (and `app-data.ar.json` when Arabic shows), the time of the last fetch from GitHub, the file's *saved* time (HTTP Last-Modified) and a short ETag. While the page is loading it says "fetching from GitHub..." and shows the previous fetch; if the fetch fails it says so and shows the last good one. Tap the box to shrink it; add `?debug=0` to a page address to hide it (remembered), `?debug=1` to show it again; set `STAMP=false` in `site-version.js` to remove it.
- **Pictures always fresh**: every picture of the site is requested with `?v=2` (logos, carousel, news, team, pictures inside articles, section backgrounds, admin previews). Pictures given as full web addresses are not changed. To force a re-download for everyone, raise `IMG_V` in `site-version.js` and the `?v=2` in the logo tags of the HTML pages.
- Final sweep for old-project wording: none left in code, data or documents.


## Front end, phase 5: Services menu and two main services
- **Menu**: the item is now called **Services** (header and bottom bar, English and Arabic). On desktop it is a drop-down: **IP Services** (with Patents and Trademarks under it) and **Translation**. It appears on the home page, About page and the Patents, Trademarks and Translation pages (those three pages had separate Patents / Trademarks / Translation links before). The entries come from the Services tab, so a hidden service disappears from the menu.
- **Home page, Services section**: two wide cards, centred on tablet and desktop (stacked on phones): **IP Services** (lists Patents and Trademarks, each opens its pop-up as before) and **Translation** (brief + More). One card alone is centred too. The section title is now "Services".
  - Grouping rule: a service whose page is `translation.html` is the Translation card; every other service goes under IP Services.
  - The sentence on the IP Services card: admin, General tab, "Services section: short text of the IP Services card" (Arabic in Arabic mode). Empty = built-in sentence.
  - **Translation is shown again** (it was hidden in `app-data.json`). Tick "Hide this service on the website" in the Services tab to hide it.
- **Slider controls** (admin, Carousel tab, "Slider controls"): the previous/next arrows, dots and pause button are now **off by default**; tick the box to show them. The slider still changes slides by itself every 10 seconds and can be swiped. Stored as `theme.heroControls`.
- `scripts/validate.js` checks `theme.heroControls` and `ipServicesText`. New helper `KLang.svcSplit` in `lang.js`; menu code in `footer.js`; styles in `styles.css`.


## Front end, phase 6: contact details and social links in the admin
- **Admin, General tab, new card "Contact details & social links"**: WhatsApp number, phone numbers (one per line), email addresses (one per line), address (one line per row), map location (coordinates or an address), and the social addresses: LinkedIn, YouTube, Facebook, Instagram, X, TikTok. Stored as `contact` and `social` in `app-data.json`. The LinkedIn / YouTube boxes moved from the top of the tab into this card.
- **Arabic mode, General tab**: an Arabic address box (empty = the English address shows). Stored as `contact.address` in `app-data.ar.json`.
- **Where it shows** (new file `contact.js`, loaded after `footer.js` on every public page): the round social icons in the header (all pages; on a phone the first two); the WhatsApp number used by the chat box at the bottom; on the About page the "follow" buttons, a tile per phone / email / address and the map; on the Patents, Trademarks and Translation pages the email and phone buttons (the first of each). An empty box hides that item. The numbers, emails, LinkedIn address and map that used to be written in the HTML are now filled in `app-data.json` and come from the admin.
- `scripts/validate.js` checks `contact` (lists of text, WhatsApp digits, email format) and the https:// rule for every social address.


## Phase 6b: files always match the pages
- Every script and the style sheet are now requested as `file.js?v=6b` / `styles.css?v=6b` on the five public pages (like the pictures' `?v=2`), so a browser or the GitHub cache cannot mix new HTML with old scripts. Each release raises this number; the corner stamp shows the build.
- Bottom-bar fallback label is "Services" (was "IP Services").


## Look controls, phase 1 of 6: colours (header, cards, WhatsApp box)
- **New admin tabs in the Look group: Header & bar, Cards** (new file `admin-look.js`, plan in `LOOK-PLAN.md`).
- **Header**: background colour with opacity, text / menu / icon colour (automatic light text when the background is dark), and the line under it. The header logo is unchanged (it can be replaced in phase 2).
- **Bottom bar and WhatsApp text box**: bar background and button colours; box background with opacity, typed text + hint text + WhatsApp icon, outline, send button and send icon. With only the bar colour chosen, the box follows it (light bar = dark text).
- **Cards**: background (opacity), text, titles and border for all cards (service, news, team, FAQ, quote frame, contact tiles), and per section through "Cards in one section". Works on dark sections too.
- Every colour is picked from the palette, your own colours or any colour; a live preview sits in each tab; Reset buttons restore the original look.
- Saved as `theme.header`, `theme.bar`, `theme.wa`, `theme.cards`, `theme.secCards`; checked by `scripts/validate.js`. Empty values are not written, so the data file stays small.
- Files changed: `theme.js` (applies the settings before the page paints, from the browser's saved copy, so there is no flash), `styles.css` (colours come from variables with the old colours as fallbacks), `admin.html`, `admin-look.js` (new), `scripts/validate.js`, `site-version.js`, the five pages (`?v=7a`).



## Look controls, phase 2 of 6: text alignment and logos
- **Text alignment tab (admin, Look group)**: alignment (start, center, end, justify) for all sections, and per section, separately for phone, tablet and desktop. Live preview; **Default** keeps the original layout; per-section reset.
- **Logos tab (admin, Look group)**: replace the header, home page and About page logos and set each logo's width per screen size (quick sizes S / M / L / XL, or exact pixels). The home page text column makes room for a larger logo.
- The logos now carry `data-logo` markers in the pages; `theme.js` applies alignment and logo settings (sizes before the page paints, a replaced logo as soon as it exists); `styles.css` has the matching rules. `scripts/validate.js` checks `theme.align` and `theme.logos`.
- Nothing changes on the site until something is set. Version stamp: "Look phase 2".


## Look controls, phase 3 of 6: menu
- **Menu tab (admin, Look group)**: Default, Bottom bar only, or Bottom bar plus a top "sandwich" button that opens an off-canvas side menu. Options for the side menu: side, panel colours, page darkening, width, keep the header links on large screens. Live preview.
- New file `look.js` (loaded on every page after `footer.js`): builds the button and the panel, closes on X / dark area / Escape / link, keeps keyboard focus inside while open, works left-to-right and right-to-left. Menu texts are translated (`menu_title`, `menu_open`, `menu_close` in `lang.js`).
- `theme.js` now announces the theme to `look.js`; `styles.css` has the menu rules; `scripts/validate.js` checks `theme.menu`. Version stamp: "Look phase 3".
- Nothing changes on the site until a layout is chosen.


## Look controls, phase 4 of 6: image effects
- **Image effects tab (admin, Look group)**: opacity and color filter (site palette, your own colors or any color, with intensity) for all pictures, the home slider, news pictures, team photos and section background photos, plus a per-section override for photo backgrounds. Live preview with the first slide or news picture.
- Pictures in the page are coloured with an SVG filter that `theme.js` adds (one per group); section photos get the filter and the fade as extra background layers. `styles.css` has the matching rules; `scripts/validate.js` checks `theme.imgfx`. Version stamp: "Look phase 4".
- Nothing changes until an effect is set.


## Look controls, phase 5 of 6: animation of cards and text
- **Animation tab (admin, Look group)**: effect, distance, feel, speed, delay, stagger and play-once / every-time for cards and for text, for all sections and per section; hover effect for cards. A "Play preview" button shows the result in the admin.
- `look.js` plays the animations when things scroll into view (also for cards that appear after the data loads); a section with any effect set replaces the old fade-up there. `theme.js` holds the shared effect list; `styles.css` has the rules; `scripts/validate.js` checks `theme.anim`. Version stamp: "Look phase 5".
- Nothing changes until an effect is set. Reduced-motion visitors see everything at once.


## Look controls, phase 6 of 6: animation of the map and the logos
- **Map & logos tab (admin, Look group)**: map entrance, constant movement, pointing effect and office pulse (speed, size and color); for the three logos an entrance, constant movement and pointing effect, set for all logos and per logo. A Play button and a live preview for the logos.
- `look.js` plays them (the map and logos when they come into view; the logo pointing effect uses the separate scale / rotate / translate properties so it works together with the constant movement). `styles.css` has the rules; `scripts/validate.js` checks `theme.motion`. Version stamp: "Look phase 6".
- Nothing changes until something is set. Reduced-motion visitors get no automatic movement.


## Admin restructure, phase 1 of 5: General page, English and Arabic side by side
- **One admin for both languages**: the admin loads `app-data.json` and `app-data.ar.json` together. Every translatable box has the English on the left and the Arabic on the right (stacked on a phone). The EN | عربي switch is gone. **Save to GitHub** writes only the file(s) that changed, English first, then Arabic; if the second write fails the message says so and Save can be pressed again.
- **General page** (first tab) with a row of pages: **Brand & logos** (the three logos and their sizes), **Contact & social** (phones, emails, address in both languages, map, WhatsApp, social links), **Languages & words** (site languages, WhatsApp box suggestions, news categories, and all the short words of the site: menu, buttons, headings), **Colors** (palette and section width), **Header, bar & menu**, **Map & logo motion**. These screens used to be separate tabs or in the Arabic mode.
- **The English wording can be changed too**: the short words of the site (and, in phase 2, the fixed texts of each section) are saved as `ui` in `app-data.json`; empty = the built-in English. `lang.js` applies them on every page, also from the saved copy in the browser.
- The content tabs (Carousel, Services, News, Jurisdictions, Team, Testimonials, FAQ) now show English and Arabic together. The Interface text and Page texts tabs of the Arabic mode were replaced by the Languages & words page (and, in phase 2, by the Sections page).
- `scripts/validate.js` checks `ui` in the English file. Version stamp: "Admin phase 1".


## Admin restructure, phase 2 of 5: the Sections page
- **Sections** (second tab): pick a page (Home, About, Patents, Trademarks, Translation), then one of its sections, in the order they appear on the page: 27 sections in all. Each shows what the visitor sees there, with **English on the left and Arabic on the right**:
  - **Fixed texts**: headings, paragraphs, labels and buttons written into the section. The grey text is the built-in wording (English and Arabic); type your own to replace it, leave empty to keep it. Stored as `ui` in `app-data.json` (English) and `app-data.ar.json` (Arabic). Texts used in several places are marked "also used in ...".
  - **Lists**: slides (with the slider controls and height), countries, services, articles (with Import), client quotes and team members, with add / duplicate / reorder / delete as before.
  - **FAQ** of each page, and the **page content** of the Patents, Trademarks and Translation pages (with the "hide this service" tick).
- The old Content tabs (Carousel, Services, News, Jurisdictions, Team, Testimonials, FAQ) are gone: their content lives in the section where it appears. Errors found when saving (a missing title, an unfinished FAQ item) jump straight to the right section and field.
- **General, Languages & words** also lists the menu labels of the About / service pages and the browser-tab title of each page (new file `sections-map.js`, generated from the pages, tells the admin which text sits in which section).
- Look settings (Backgrounds, Cards, Text alignment, Image effects, Animation) are still in their own tabs; they move into the Sections page in phase 3.
- Version stamp: "Admin phase 2".


## Admin restructure, phase 3 of 5: the look of each section, in the Sections page
- **Look of this section** (Sections page, at the end of every section): five blocks that open and close: **Background** (default, color or photo, with the text color), **Cards** (background, opacity, text, titles, border), **Text alignment** (phone / tablet / desktop), **Photo effect** (opacity and color filter, shown when the section's background is a photo) and **Animation** (cards and text). Each shows a badge ("Own colors", "Own alignment", ...) when the section differs from the site. Anything left on its default follows the site-wide setting.
- A small **palette icon** on a section's button shows that the section has its own look settings. **Reset this section** removes all of them at once.
- The **home slider** has its picture effect (opacity and color filter) in its own section, Home page, Slider.
- **General** has four new pages for the site-wide defaults: **Cards**, **Text alignment**, **Picture effects** and **Animation**. Their Reset buttons now reset only the site-wide part; what was set for a single section is kept.
- The separate **Look** tabs (Backgrounds, Cards, Text alignment, Image effects, Animation) are gone: the admin now has just General and Sections.
- Nothing changes for visitors and no data moved: the same `theme.sections`, `theme.secCards`, `theme.align`, `theme.imgfx` and `theme.anim` settings are read and written, so earlier work is kept. Version stamp: "Admin phase 3".


## Admin restructure, phase 4 of 5: fonts
- **General, Fonts** (new page after Colors): choose the font of **Headings** (titles, card titles, FAQ questions) and of **Text** (everything else), separately for **English** and **Arabic**, for the whole site. Each box offers 16 Latin and 8 Arabic Google fonts, **the visitor's own font (system)** and **Another Google font** (type its exact name). The first choice keeps the original fonts. A live preview shows an English and an Arabic sample.
- **Sections, Look of this section, Fonts** (new block between Cards and Text alignment): the same four choices for one section, on top of the site-wide ones. The badge reads "Own fonts" when set; **Reset this section** removes them with the rest of the section's look.
- On the site: `theme.js` sets `--fh-en`, `--fh-ar`, `--fb-en`, `--fb-ar` (on `<html>`, and on a section's element for its own fonts) before the page paints and loads one Google stylesheet with only the fonts chosen. `styles.css` and `tailwind-config.js` now read `--fh` (headings) and `--fb` (text), which follow the page direction; with nothing set they resolve to the original fonts. The old fixed Arabic font rules were replaced by the same variables, so Arabic headings in `.h2`, FAQ questions and service sub-cards now use the Arabic heading font too (before, they fell back to a browser font).
- Saved as `theme.fonts` (`all`, `sec`). A font name that is not allowed is dropped when saving. `scripts/validate.js` checks `theme.fonts`.
- Nothing changes on the site until a font is chosen.


## Admin restructure, phase 5 of 5: final checks, manual, lighter zip
- **Checks run**: every script passes a syntax check; `scripts/validate.js` passes; the five pages were loaded in English and in Arabic with fonts set (no script errors, headings and text in the chosen font, a section's own font winning over the site's); the admin was loaded with the Fonts page and the section block (choosing, "Another Google font", reset, saving clean-up).
- **Leftovers removed from the package** (they had come back into the upload but belong to the old project and nothing uses them): `my-stuff.html`, `auth.js`, `supabase-config.js`, the three `supabase-*.sql` files, the `supabase/` function, `assets/temp.htm`, and the duplicate root copies `validate.js` and `validate.yml` (GitHub uses `scripts/validate.js` and `.github/workflows/validate.yml`). **Delete these in the repository too** if they are still there.
- **Documents brought up to date**: README (admin = General + Sections, side-by-side languages, Fonts), MANUAL (daily use, fonts, file map). Plans marked done.
- **Cache**: script and style addresses now end in `?v=9`, so browsers fetch the new files. Version stamp: "Admin phase 5".
- **Two zips**: the **complete** site, and a **light** one without the `assets/` folder (about 5 MB smaller) for when the pictures are already in the repository: upload it on top and nothing is lost. 19 pictures in `assets/` are not used by any page or data file (about 3.9 MB); they are kept in the complete zip and listed in README, Notes, so you can delete the ones you do not want.


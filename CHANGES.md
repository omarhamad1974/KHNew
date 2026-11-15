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
- English only for now: on the Arabic version of the home page the FAQ shows the English text.
- `scripts/validate.js` also checks `faq`.


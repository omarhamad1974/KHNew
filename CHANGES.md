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

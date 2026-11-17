# Control phases: plan and status

More control for the admin over what visitors see, and a real preview of it. Each phase is delivered as a **complete site zip without the picture files** (`assets/` is not inside: your pictures are already in the repository), so you can stop after any phase and keep a working site. Until something is changed the site looks exactly as before.

| Phase | What the admin gets | Status |
|---|---|---|
| 1 | **Live preview**: the real page, with your unsaved changes, on phone / tablet / desktop width, English or Arabic, scrolled to the section you are editing | **Done** |
| 2 | **Section header**: hide or show the title, the icon and the thin line of any section. **WhatsApp button**: hide or show it at the end of the service pages | **Done** |
| 3 | **Columns per row** on tablet and desktop for the sections that have cards | **Done** |
| 4 | **Card backgrounds**: a colour or a picture for one card (the IP Services and Translation cards, each news card, each team card) | **Done** |

## Phase 1: live preview
- **Where**: the **Preview** button in the top bar of the admin. On a wide screen (1280 px and up) the preview sits **beside** the editor and stays in view while you scroll; on a narrower screen it opens **above** the editor. **Enlarge** (or Esc to leave) shows it nearly full screen.
- **What it shows**: the real page (`index.html`, `about.html`, ...), not a drawing. It uses what is on screen in the admin right now, saved or not, so nothing needs to be published to see it. Pictures you uploaded in this session are read from GitHub.
- **Follows you**: in **Sections** it opens the page of the section you picked and scrolls to it, with the section outlined (untick *Outline this section* to remove the outline). In **General** it shows the page that setting changes (for example *Cards* shows the Services cards); the **Page** list switches to another page.
- **Phone / Tablet / Desktop** buttons set the width of the page inside the preview (390, 820 and 1280 px), so the phone and tablet layouts are the real ones. **EN / عربي** shows the English or the Arabic site.
- **Updates as you type** (about a second after you stop). Untick it to update only when you press the refresh button, which turns amber when the preview is out of date.
- Links, WhatsApp, phone and e-mail buttons do nothing inside the preview; links to other pages of the site stay inside it. The preview never stores anything in the browser, so it cannot change what your own browser remembers of the live site.
- Needs the admin to be opened from the website's own address (`https://.../admin.html`), not from a file on your computer.
- Files: `preview.js` (every public page, loaded first; does nothing for visitors), `admin-preview.js` (the panel, loaded by `admin.html`).

## Phase 2: section header and WhatsApp button
- **Where**: **Sections**, pick a section, **Look of this section**, **Section header**. Only the parts that section really has are listed: *Title*, *Icon* (the round icon above the title on the Patents / Trademarks / Translation introductions, the quote mark of the Client endorsements and of the Quote), *Thin line* (the short gold line under the title) and, on the contact box of the three service pages, *WhatsApp button* (the "WhatsApp us" button at the end of the page). Tick a box to hide that part; untick it to show it again. **Show everything** clears them all. The section's pill shows the palette mark while anything is hidden.
- **Title hidden = visually hidden, not deleted**: the heading stays in the page for screen readers and search engines (a page keeps its main heading), it simply is not seen. On the About page's *KHIP Value* the text moves up to use the whole width when its title (and line) are hidden.
- **English and Arabic** both follow the setting. The preview shows the result straight away.
- **Saved as** `theme.secHead`: `{ "patents-contact": { "wa": true }, "home-testimonials": { "icon": true, "rule": true } }`. Only hidden parts are written; the default is everything shown, so until something is ticked the site looks exactly as before.
- **Files**: `theme.js` (`secHead()` puts `data-hide="title icon rule wa"` on the section), `styles.css` (the hiding rules, last block), `admin-look.js` (the block in Look of this section), `sections-map.js` (`parts`: which parts each section has), the three service pages and `index.html` / `about.html` (`data-sh="icon"` and `data-sh="wa"` on the icon and the button), `scripts/validate.js` (checks `theme.secHead`).

## Phase 3: columns per row
- **Where**: **Sections**, pick a section, **Look of this section**, **Columns per row**. Two boxes: **Tablet** (768 to 1023 px) and **Desktop** (1024 px and up), each *As designed* or 1, 2, 3 or 4 across. Phones are not affected (one card, or one at a time).
- **Sections that have it**: Home *Services* (the two wide cards), Home *Latest news* (the row of news cards; with *As designed* they keep a fixed width), About *Advantages*, About *Our team* (4 across by default), and the *Details* card grid of Patents, Trademarks and Translation (1 on tablet and 2 on desktop; Translation 3 from 1280 px).
- **How it works**: the columns share the section's width (General, Colors, Section width), so 4 across in a narrow section makes narrow cards. Rows that slide (news, team) show that many at once and slide for the rest; their dots and counter follow.
- **Preview**: the Tablet and Desktop widths of the live preview show the setting directly (820 px and 1280 px).
- **Saved as** `theme.cols`: `{ "about-team": { "t": "2", "d": "3" } }`, whole numbers 1 to 4; an empty box is left out. `scripts/validate.js` checks it.
- **Files**: `theme.js` (`cols()` writes `data-cols-t` / `data-cols-d` and `--cols-t` / `--cols-d` on the section; `KTHEME.colsOf(section)` for scripts), `styles.css` (last block), the pages (`data-cols` on the card containers; `about.html` team slider reads the number and re-lays out when it changes), `admin-look.js`, `sections-map.js` (`cols`: the built-in numbers shown as "As designed").


## Phase 4: card backgrounds
- **Where**: **Sections**, open the item, **Card background**: **Home, Latest news** (each article), **About, Our team** (each member), **Home, Services** (the Translation service, and the **IP Services card** box above the list). Five settings: **Card color** (site palette, your own colours or any colour), **Card picture** (file in assets, or upload; covers the card), **Which part of the picture stays in view** (Center, Top or Bottom), **Darken the picture** (0 to 80 %, so text stays readable) and **Text color on this card**. **As designed** clears them. Empty = the card looks as before.
- **Not included**: the testimonial (one shared frame for all quotes), the Details cards of the service pages (they come from the page text) and the Advantages cards (fixed texts). Their colours are still set per section (Look of this section, Cards).
- **English and Arabic**: the same card in Arabic follows (the settings are on the item, not translated).
- **Saved as**: on the item, `cardBg`, `cardImage`, `cardPos`, `cardShade`, `cardText` (for example `{ "id": "2", "title": "...", "cardBg": "role:ink", "cardText": "#ffffff" }`), and on `ipCard` in `app-data.json` for the IP Services card. `scripts/validate.js` checks them.
- **Files**: `theme.js` (`KTHEME.cb(item)` writes `data-cb` into the card's tag, `paintCards()` turns it into variables), `styles.css` (last block), `index.html` / `about.html` (cards), `admin.html` (Card background block), `admin-sections.js` (IP Services box), `scripts/validate.js`.

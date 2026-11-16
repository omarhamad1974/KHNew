# Look controls: plan and status

Admin controls for how the site looks. Six phases. Each phase is delivered as a **complete site zip** (everything merged, ready to upload to the repository), so you can stop after any phase and keep a working site. All settings are saved under `theme` in `app-data.json`; until something is changed the site looks exactly as before.

| Phase | What the admin gets | Status |
|---|---|---|
| 1 | **Colors**: header background (and text, line), card background and text (all cards, and per section), WhatsApp text box background and text, bottom bar colors | **Done** |
| 2 | **Text alignment** per section on phone / tablet / desktop (start, center, end, justify) and **logos**: replace the header, home and about logos, set each logo's size per screen | **Done** |
| 3 | **Menu**: bottom bar only, or bottom bar plus a top "sandwich" button that opens an off-canvas menu | **Done** |
| 4 | **Image effects**: opacity and a colour filter (site palette or any colour, with an intensity) for uploaded images: slider, news, team, section photos | **Done** |
| 5 | **Animation, cards and text**: effect, speed, delay, stagger, repeat and hover, set for the whole site and per section | **Done** |
| 6 | **Animation, map and logos**: map entrance, country hover and glow, office pulse; logo entrance, idle motion and hover | **Done** |
## Where things live
- Admin screens: `admin-look.js` (loaded by `admin.html`). Since admin restructure phase 3 the Look tabs are gone: site-wide settings are pages of **General** (Colors, Header, bar & menu, Cards, Text alignment, Picture effects, Animation, Map & logo motion, Brand & logos); the settings of one section are in **Sections**, under **Look of this section**.
- Site behaviour: `theme.js` (colours and layout, applied before the page paints), `styles.css`; `look.js` (menu, and later image effects and animation).
- Data: `theme.header`, `theme.bar`, `theme.wa`, `theme.cards`, `theme.secCards` (phase 1); phase 2: `theme.align`, `theme.logos`; phase 3: `theme.menu`; phase 4: `theme.imgfx`; phase 5: `theme.anim`; phase 6: `theme.motion`; later phases add their own keys. `node scripts/validate.js` checks them.

## Notes
- Colours are always chosen from the site palette, from your own colours (Colors tab), or as any colour. They are stored as references (`role:ink`, `custom:<id>`) or `#rrggbb`, so changing the palette later updates everything that uses it.
- If a session ends, upload the latest phase zip: it contains everything that came before.

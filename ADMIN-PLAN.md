# Admin restructure: plan and status

The admin is being rebuilt around two places: **General** (brand and general information) and **Sections** (content and look of every section of the site, English and Arabic side by side). Fonts can be chosen by the admin. Each phase is delivered as a **complete site zip** you can upload to the repository, so you can stop after any phase and keep a working site.

| Phase | What changes | Status |
|---|---|---|
| 1 | **General** page (brand and logos, contact and social, languages and words, colors, header / bar / menu, map and logo motion). English and Arabic are written **side by side** everywhere; both files are loaded together and saved together. The old language switch is gone. English wording of the site's fixed texts can now be changed too. | **Done** |
| 2 | **Sections** page: every section of every page, with its content (fixed texts, lists such as services, news, team, FAQ) in English and Arabic | **Done** |
| 3 | **Sections**: the look of each section in the same place (background, text alignment, cards, picture effects, animation), under **Look of this section**. The site-wide defaults moved into General (Cards, Text alignment, Picture effects, Animation). The old Look tabs are gone | **Done** |
| 4 | **Fonts**: choose the fonts for headings and text, in English and Arabic, for the whole site (General, Fonts) and per section (Look of this section) | **Done** |
| 5 | Final checks, manual, and a lighter zip without the image assets | **Done** |

## How the two languages are stored
- `app-data.json`: English content and all settings. `app-data.ar.json`: the Arabic text of the same items (matched by `id`).
- In the admin an Arabic box left empty means "show the English text". Save writes only the file(s) that changed.
- Fixed wording of the site: `ui` in `app-data.json` (English) and in `app-data.ar.json` (Arabic). Empty = the built-in wording.

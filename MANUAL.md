# KHIP system manual

How to host the KHIP website and keep it up to date. The site is a set of static files; there is no database, no server code and no visitor sign-in.

## 1. How the pieces fit

| Piece | What it does | Where it lives |
|---|---|---|
| Public website | Home, About, Patents, Trademarks, Translation | Static files (GitHub Pages, Cloudflare Pages or any static host) |
| Website content | Text, news, services, jurisdictions, team, testimonials, FAQ, carousel, colors | `app-data.json` (English) and `app-data.ar.json` (Arabic) in the repository |
| Admin | Edits those two files and uploads photos | `admin.html`, talks to the GitHub API with your token |

Saving in the admin writes a commit to the repository. The host republishes the site, so changes appear after a minute or two.

## 2. One-time setup

### 2.1 GitHub repository and hosting
1. Create a repository (for example `KHNew`) and upload every file and folder of this package, keeping the structure.
2. Publish it: GitHub Pages (Settings, Pages, Deploy from branch `main`, folder `/ (root)`), or connect the repository to Cloudflare Pages (no build command, output folder `/`).
3. Open `https://YOUR-SITE/` and `https://YOUR-SITE/admin.html` to check both load.

### 2.2 Access token for the admin
1. GitHub, Settings, Developer settings, Personal access tokens, **Fine-grained tokens**, Generate new token.
2. Repository access: **Only select repositories**, pick the website repository.
3. Repository permissions: **Contents** = Read and write. Nothing else is needed.
4. Copy the token and paste it into `admin.html` (the token stays in your browser and is only sent to `api.github.com`).
5. Set an expiry you can live with and note the date; when it expires, make a new one.

### 2.3 Before you go live
- Check the phone numbers, emails, address and social links (admin, General, Contact & social).
- Check `app-data.json` with `node scripts/validate.js` (GitHub runs it on every push).
- Decide the site languages (admin, General, Languages & words, **Site languages**).

### 2.4 Search engines (once)
1. Open `app-data.json` and add the live address: `"seo": { "siteUrl": "https://YOUR-DOMAIN/" }` (the admin keeps this block when it saves).
2. GitHub, Settings, Actions, General, Workflow permissions: **Read and write permissions**. After the next push the Action "Build SEO pages" adds the generated files (check Actions for a green tick).
3. Add the site to Google Search Console and Bing Webmaster Tools and submit `https://YOUR-DOMAIN/sitemap.xml`. A project site on `owner.github.io/repo/` cannot serve `robots.txt` from its root; use a custom domain for that.
4. Turn on Arabic for search engines: admin, General, Languages & words, Site languages = **English and Arabic**, Save. The Arabic pages appear after the build. Have the Arabic reviewed before this step.

## 3. Daily use
- Open `admin.html`, enter your GitHub user or organization, the repository name, and the token. The first three are remembered by the browser; the token is asked each time unless you tick *Keep me signed in for this browser tab*.
- Edit in **General** and **Sections**, then press **Save to GitHub** (or Ctrl+S). The undo arrow discards unsaved changes; the download icon saves a backup copy of the data file.
- Photos you upload are resized and cropped to their frame automatically and stored in `assets/`.
- Arabic: every box has English on the left and Arabic on the right; an empty Arabic box falls back to English. Save writes only the file(s) that changed.
- **Preview** (button in the top bar): the real page with your unsaved changes, beside the editor. Choose phone / tablet / desktop and English / Arabic.
- Videos: Sections, **Home** (or **About**), **Video**. Paste the YouTube address, add a title and text if you like, and choose the position from the list. Leave the English link empty or tick *Hide this video section* to remove it from the site.
- Fonts: General, **Fonts** (whole site) or Sections, **Look of this section**, **Fonts** (one section). Headings and text, English and Arabic.

- Service pages (Patents, Trademarks, Translation): Sections, open the page, **Page content**, **Import from Word / Markdown**. One file can hold several services and both languages; each text starts with a Heading 1 and a `Service:` line (and `Language:`). Optional lines: `Subtitle:` (home card brief), `Card title:`, `Icon:`, `Hidden:` (yes / no) and `Part:` (Page or Pop-up). Review, then Save.

- Countries (Home Regional map or About Jurisdictions): Sections, the Jurisdictions list, **Import countries**. One file can hold many countries and both languages; each text starts with a Heading 1 (the country name) and `Language:`, `Code:`, `Tag:` lines; `## Filing details` starts the pop-up text. New countries are added. Review, then Save.

- FAQ (any page's FAQ section): **Import FAQ**. One file can hold all five pages and both languages: `# Patents`, `Language: English`, then `## Question?` and its answer. The Arabic list is matched to the English questions by position. Review, then Save.

- Arabic news: in the article import file add `Language: Arabic` and `English title:` (the English article it translates). Arabic slides: import an Arabic slides file and keep the option *Arabic texts for the slides already in the slider* (matched by position).

## 4. Troubleshooting
| Problem | Fix |
|---|---|
| "The token was rejected" | The token expired or was typed wrongly. Make a new one (2.2). |
| "The token cannot write to this repository" | Set **Contents** to Read and write for this repository. |
| "Repository, branch or file not found" | Check the user/organization, repository name and branch (usually `main`). |
| "The file changed on GitHub" | Someone saved in between. Press the undo arrow to reload, then redo your edit. |
| Saved but the site looks the same | Wait a minute or two, then hard-refresh (Ctrl+F5). Visitors' browsers keep a copy and refresh it on their next visit. |
| An image is too large | Images over 3 MB after resizing are refused; compress it first. |
| The site looks unstyled or different after a push | Run `node scripts/build-tailwind.js --cdn` (or restore the five pages from the previous commit) to go back to the Tailwind CDN, then tell whoever maintains the site; check the Action log for "Tailwind build failed". |

## 5. Security and care
- The token is the only secret. Never paste it into the site files or share it. Use a fine-grained token limited to this one repository, with an expiry date.
- The admin page is not linked anywhere on the site and carries `noindex`, but it is a normal public file: it is protected by the token, not by hiding it.
- Back up regularly with the download icon, or rely on the GitHub commit history.

## 6. File map
- `index.html`, `about.html`, `patents.html`, `trademarks.html`, `translation.html`: the pages.
- `app-data.json`, `app-data.ar.json`: all editable content. `app-data.sample.json` is a minimal example.
- `admin.html`: the admin page. `admin-look.js`: the look controls (fonts, header & bar, cards, text alignment, logos, picture effects, animation, map & logo motion), drawn in General (site-wide) and in Sections ("Look of this section"); `admin-general.js`, `admin-sections.js`, `sections-map.js`: the General and Sections pages. `news-import.js`, `slider-import.js`, `service-import.js`, `jurisdiction-import.js`, `faq-import.js`: Word / Markdown / spreadsheet import readers used by the admin.
- `theme.js` (colors, fonts, backgrounds, hero height, header / bar / card colours, text alignment, logo sizes), `lang.js` (English / Arabic engine), `pages-i18n.js` (fixed page texts, English and Arabic), `rich.js` (text formatting), `look.js` (menu behaviour), `faq.js`, `service-page.js`, `footer.js` (bottom bar and WhatsApp box), `tailwind-config.js`, `styles.css`.
- `preview.js` (public pages, inert for visitors) and `admin-preview.js` (admin): the live preview. Plan of the Control phases: `CONTROL-PLAN.md`.
- `video.js`: the YouTube video sections of the home and About pages.
- `templates/`: Word and Markdown templates for every import (see `templates/README.md`); rebuilt with `node scripts/build-templates.js`.
- `images.js`: picture sections and the SVG shapes and motion of pictures. `admin-mobile.js`: the bottom bar of the admin on phones.
- `layout.js`: which sections show, their order, copies of sections, and hidden parts of a section (admin: Sections, Sections of this page).
- `assets/`: logos, team photos and uploaded pictures.
- `scripts/validate.js`, `.github/workflows/validate.yml`: content check run by GitHub.
- `scripts/build-tailwind.js`, `scripts/tailwind.config.cjs`, `scripts/tailwind-input.css`, `tailwind.css` (generated): the compiled Tailwind stylesheet; run by the same Action as the SEO build.

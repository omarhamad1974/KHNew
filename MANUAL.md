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

## 3. Daily use
- Open `admin.html`, enter your GitHub user or organization, the repository name, and the token. The first three are remembered by the browser; the token is asked each time unless you tick *Keep me signed in for this browser tab*.
- Edit in **General** and **Sections**, then press **Save to GitHub** (or Ctrl+S). The undo arrow discards unsaved changes; the download icon saves a backup copy of the data file.
- Photos you upload are resized and cropped to their frame automatically and stored in `assets/`.
- Arabic: every box has English on the left and Arabic on the right; an empty Arabic box falls back to English. Save writes only the file(s) that changed.
- Fonts: General, **Fonts** (whole site) or Sections, **Look of this section**, **Fonts** (one section). Headings and text, English and Arabic.

## 4. Troubleshooting
| Problem | Fix |
|---|---|
| "The token was rejected" | The token expired or was typed wrongly. Make a new one (2.2). |
| "The token cannot write to this repository" | Set **Contents** to Read and write for this repository. |
| "Repository, branch or file not found" | Check the user/organization, repository name and branch (usually `main`). |
| "The file changed on GitHub" | Someone saved in between. Press the undo arrow to reload, then redo your edit. |
| Saved but the site looks the same | Wait a minute or two, then hard-refresh (Ctrl+F5). Visitors' browsers keep a copy and refresh it on their next visit. |
| An image is too large | Images over 3 MB after resizing are refused; compress it first. |

## 5. Security and care
- The token is the only secret. Never paste it into the site files or share it. Use a fine-grained token limited to this one repository, with an expiry date.
- The admin page is not linked anywhere on the site and carries `noindex`, but it is a normal public file: it is protected by the token, not by hiding it.
- Back up regularly with the download icon, or rely on the GitHub commit history.

## 6. File map
- `index.html`, `about.html`, `patents.html`, `trademarks.html`, `translation.html`: the pages.
- `app-data.json`, `app-data.ar.json`: all editable content. `app-data.sample.json` is a minimal example.
- `admin.html`: the admin page. `admin-look.js`: the look controls (fonts, header & bar, cards, text alignment, logos, picture effects, animation, map & logo motion), drawn in General (site-wide) and in Sections ("Look of this section"); `admin-general.js`, `admin-sections.js`, `sections-map.js`: the General and Sections pages. `news-import.js`, `slider-import.js`: Word / Markdown / spreadsheet import readers used by the admin.
- `theme.js` (colors, fonts, backgrounds, hero height, header / bar / card colours, text alignment, logo sizes), `lang.js` (English / Arabic engine), `pages-i18n.js` (fixed page texts, English and Arabic), `rich.js` (text formatting), `look.js` (menu behaviour), `faq.js`, `service-page.js`, `footer.js` (bottom bar and WhatsApp box), `tailwind-config.js`, `styles.css`.
- `assets/`: logos, team photos and uploaded pictures.
- `scripts/validate.js`, `.github/workflows/validate.yml`: content check run by GitHub.

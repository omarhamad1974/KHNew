# KHIP website

**Start with [MANUAL.md](MANUAL.md)**: the full blueprint, including every step to do in GitHub and Supabase before launch. This file is the short version.

Static site (HTML + Tailwind CDN). Content lives in `app-data.json`; client documents live in a private Supabase bucket.

## Day to day: `admin.html`

Open `https://YOUR-SITE/admin.html`. It has two areas, switched from the dark bar at the top.

**Website content** (saves to `app-data.json` on GitHub)
- Sign in with a GitHub fine-grained token (Contents: read and write, for this repository only).
- Tabs: General, Carousel, Jurisdictions, News, Services, Products, Testimonials, Team.
- Text boxes support `**bold**`, `## subtitle` and `- bullet` (use the B, H and list buttons).
- Photos: upload from your device (large photos are shrunk automatically) or pick one already in `assets/`.
- Add, duplicate, reorder, delete, search (long lists), Ctrl+S to save, undo arrow to discard changes, download icon for a backup.

**Client files** (Supabase)
- Sign in with your admin email and password.
- Invite a client by email: they get a link, set a password, and see only their own folder on the My files page.
- Open a client to upload (button or drag and drop), create folders, download and delete.
- Arabic or other non-Latin file names are replaced with a safe name (Supabase storage rejects them); the original extension is kept.
- Re-send an invite, or send a password reset, with the envelope button. Remove an account with the person icon (their files stay until you delete them).

## Site navigation (bottom bar)
Home, Services (IP Practices section), News (Latest news section), Jurisdiction (Jurisdictions section, formerly Countries), My files.
My files opens a sign-in pop-up when the visitor is signed out and the files page when signed in. Sessions persist in the browser (auto-refreshed), so clients sign in once per device until they sign out.

## One-time Supabase setup

1. **Create the project** at supabase.com. Copy *Project URL* and the *anon public* key (Project Settings, API) into `supabase-config.js`. Never use the `service_role` key anywhere in this repository.
2. **Create your admin login**: Authentication, Users, Add user, tick *Auto Confirm User*.
3. **Run `supabase-setup.sql`**: SQL Editor, New query. First change `YOU@YOUR-DOMAIN.COM` in step 5 of the script to your admin email. The last query should show one row with your email. It is safe to run again.
4. **Deploy the invite function** (needed for inviting, listing, re-inviting and removing accounts):
   ```
   npm i -g supabase
   supabase login
   supabase link --project-ref YOUR-PROJECT-REF
   supabase functions deploy admin-clients
   ```
   Without it, the Client files area still works for uploading to existing folders, and you can create logins in the dashboard.
5. **Authentication settings** (Authentication, ...). Also see MANUAL.md 2.8 and 2.9 (own email sender, session length):
   - *Sign In / Providers, Email*: turn **off** "Allow new users to sign up" and keep "Confirm email" on. This stops strangers creating accounts.
   - *URL Configuration*: set *Site URL* to your site, and add `https://YOUR-SITE/my-stuff.html` and `https://YOUR-SITE/admin.html` to *Redirect URLs*.
   - *Email Templates* (optional): edit the "Invite user" text so it reads like KHIP.
6. Keep `allowSignUp:false` in `supabase-config.js`.

### How access works
- Files sit in the private `client-files` bucket under `client-email@example.com/...` (lowercase email).
- A client can read only inside the folder named after their own email.
- Only accounts listed in `public.admins` can upload, replace or delete. To add another admin, create the user in the dashboard and run `insert into public.admins (user_id,email) select id,email from auth.users where email='them@khip.com';`

## What changed in this version
- `admin.html`: two areas (Website content, Client files); duplicate, search, Ctrl+S, discard, automatic photo shrinking; client invites, uploads, folders, deletes.
- `supabase-setup.sql`: repeatable; adds the admin role and admin file rules. New `supabase/functions/admin-clients`.
- Public site: formatting (`**bold**`, `##`, `-`) renders; carousel arrows and swipe; YouTube icon; reduced-motion support; dynamic footer year; My files search and sort.
- New bottom bar (above), sign-in as a pop-up from My files, persistent sessions; sections renamed IP Practices, Latest news, Jurisdictions.
- Validation script and workflow moved to where GitHub can run them.

## Checks

`node scripts/validate.js` checks `app-data.json` (required fields, duplicate ids, missing images, bad links). GitHub runs it on every push (`.github/workflows/validate.yml`).

## Notes
- The site loads Tailwind from its CDN, which is fine for this size but is not meant for heavy production use. If pages feel slow, compile Tailwind once and replace the CDN script.
- Contact phone numbers, email and office text are written directly in the HTML pages (about, patents, trademarks, translation); change them there.

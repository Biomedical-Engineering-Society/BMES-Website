# How to Update Events

## The easy way: the admin tool

Anyone on the exec team can add, edit or delete events and upload photos, with no code and no GitHub.

1. Go to **https://bmes-tmu.vercel.app/admin** (it is not linked anywhere on the site).
2. Press **Sign in with Google**. Any Google account works (TMU or personal), as long as it is on the access list.
   - **Not on the list yet?** You'll see a **Request access** button. Add a note (e.g. your exec role) and send it. An owner gets an email, approves you, and then you sign in again.
   - The **shared password** under "Use the shared password instead" is a backup. It signs you in as an editor and cannot manage access.
3. Open **Events**.
   - **New event**: fill in the form and drag in photos.
   - **Edit**: change any field, add photos, remove photos or reorder them. The first photo is the cover.
   - **Delete**: removes the event and its photos. It asks you to confirm first.
4. Press **Save**. A banner shows "Publishing…" and turns to "live on the site" after about 1–2 minutes.

Past events with no photos are marked **Needs photos** in the list.

### Photos
- Drag them straight from your phone or laptop. **iPhone HEIC photos work.** You do not need to convert, crop or resize anything.
- The tool automatically turns photos the right way up, trims black or white bars off screenshots, resizes to 1920px, and removes location data.
- Up to 15 photos per event, each under 25 MB. The preview shows exactly what will be published.

### Who can do what
- **Editors** can add, edit and delete events.
- **Owners** can do that too, and also open **Access** from the admin home page: approve or decline requests, add someone by email, change roles, and remove people. Removing someone locks them out on their next click.
- **Backup owners** are listed in Vercel (`ADMIN_OWNER_EMAILS`). They are always owners, even if the access list itself is broken, so the club can never be locked out.
- When the exec team changes each year, an owner should remove last year's people and approve the new team.

### Things to know
- Every save is recorded in the GitHub history with your name and Google email (or "(password)"), so any mistake can be undone.
- If two people save at the same time, both changes are kept.
- You stay signed in for 8 hours.

---

## For the webmaster: one-time setup

The tool saves by committing to this repo. Vercel then redeploys the site as it does for any push to `main`.

### 1. Google sign-in (Google Cloud Console)
Use a **club-owned Google account**, not a personal one, so this survives when you graduate.
1. Go to https://console.cloud.google.com and create a project called `BMES Website`.
2. **APIs & Services → OAuth consent screen**: choose **External**, set the app name to `BMES Admin` and add a support email. Leave the scopes at the defaults (email, profile, openid); these don't need Google's review. Then **publish** the app, so it isn't stuck in "testing" with a 100-user cap.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID → Web application.** Add both of these under **Authorized redirect URIs**:
   - `https://bmes-tmu.vercel.app/api/admin/auth/callback`
   - `http://localhost:3000/api/admin/auth/callback`
4. Copy the **Client ID** and **Client secret**.

Google sign-in only works on the addresses listed above, so on Vercel **preview** links, use the shared password.

### 2. Access list (Supabase)
1. In the Supabase project the chatbot already uses, open **SQL Editor → New query**, paste the contents of `supabase/admin-access.sql` and press **Run**.
2. **Project Settings → API keys**: copy the **service_role** key. It is a secret with full database access, so it only ever goes in Vercel.

### 3. Vercel environment variables
Set these in **Vercel → Project → Settings → Environment Variables**:

| Variable | Value |
| --- | --- |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | From step 1. |
| `SUPABASE_SERVICE_ROLE_KEY` | From step 2 (mark it **Sensitive**). `SUPABASE_URL` is already set for the chatbot. |
| `ADMIN_OWNER_EMAILS` | Comma-separated Google emails of the backup owners, e.g. the club account and the webmaster. They always get in as owners. |
| `ADMIN_SESSION_SECRET` | A random string of at least 32 characters (e.g. `openssl rand -base64 32`). Changing it signs everyone out. |
| `ADMIN_PASSWORD` | Optional backup. Editors only. Delete this variable to turn password sign-in off completely. |
| `RESEND_API_KEY` | Already set for the contact form. Access-request emails use it. They only reach owners once a sending domain is verified in Resend (`CONTACT_FROM_EMAIL`). |
| `GITHUB_TOKEN` | A **fine-grained** personal access token with access to **only** `BMES-Website` and the permission **Contents: Read and write**. Create it from an org account that will stay around, and note its expiry date. When it expires, saving stops until it is replaced. |
| `GITHUB_REPO` | Optional. Defaults to `Biomedical-Engineering-Society/BMES-Website`. |
| `GITHUB_BRANCH` | Optional. Defaults to `main`. For the **Preview** environment, set it to a throwaway branch such as `admin-sandbox`, so testing on preview deployments never changes the live site. |

If `main` is protected, allow the token's account to bypass the protection rules, or saves will fail with "GitHub refused the save".

**Local development:** run `npm run dev` with `ADMIN_SESSION_SECRET` plus either `ADMIN_PASSWORD` or the Google variables in `.env`, and **no** `GITHUB_TOKEN`. The tool then writes straight to `data/events.json` and `public/media/events/` on your machine ("Local mode"), and never touches GitHub.

---

## The manual way (fallback)

Events live in `data/events.json`. Each event looks like this:

```json
{
  "id": 17,
  "title": "Your Event Title",
  "date": "2026-04-20",
  "time": "5:00 PM - 7:00 PM EST",
  "location": "Kerr Hall East (KHE 117)",
  "description": "A brief description of what the event is about.",
  "category": "Networking",
  "link": "#",
  "images": ["/media/events/your-event-title-2026/01.jpg"]
}
```

- **id**: unique; use the next number up.
- **date**: must be `YYYY-MM-DD`. It decides whether the event shows as upcoming or past.
- **category**: one of Social, Career, Networking, Workshop, Science & Tech, Competition, Wellness.
- **link**: a registration `https://` link, or `"#"` if there is none.
- **images**: optional. The first one is the cover. Photos go in `public/media/events/<event-name>-<year>/` as `01.jpg`, `02.jpg` and so on. Convert them to JPG and resize them to at most 1920px first; raw phone photos (HEIC, 4 MB+) will not display properly and bloat the repo. Adding photos to a folder on its own does nothing; they have to be listed here.

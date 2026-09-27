# How to Update Events

## The easy way: the admin tool

Anyone on the exec team can add, edit or delete events and upload photos, with no code and no GitHub.

1. Go to **https://bmes-tmu.vercel.app/admin** (it is not linked anywhere on the site).
2. Enter **your name** and the **admin password**. Ask the webmaster for the password.
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

### Things to know
- Every save is recorded in the GitHub history under your name, so any mistake can be undone.
- If two people save at the same time, both changes are kept.
- You stay signed in for 8 hours.

---

## For the webmaster: one-time setup

The tool saves by committing to this repo. Vercel then redeploys the site as it does for any push to `main`. Set these in **Vercel → Project → Settings → Environment Variables**:

| Variable | Value |
| --- | --- |
| `ADMIN_PASSWORD` | A long passphrase. Change it when the exec team turns over; that locks out everyone who knew the old one. |
| `ADMIN_SESSION_SECRET` | A random string of at least 32 characters (e.g. `openssl rand -base64 32`). Changing it signs everyone out. |
| `GITHUB_TOKEN` | A **fine-grained** personal access token with access to **only** `BMES-Website` and the permission **Contents: Read and write**. Create it from an org account that will stay around, and note its expiry date. When it expires, saving stops until it is replaced. |
| `GITHUB_REPO` | Optional. Defaults to `Biomedical-Engineering-Society/BMES-Website`. |
| `GITHUB_BRANCH` | Optional. Defaults to `main`. For the **Preview** environment, set it to a throwaway branch such as `admin-sandbox`, so testing on preview deployments never changes the live site. |

If `main` is protected, allow the token's account to bypass the protection rules, or saves will fail with "GitHub refused the save".

**Local development:** run `npm run dev` with `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` in `.env` and **no** `GITHUB_TOKEN`. The tool then writes straight to `data/events.json` and `public/media/events/` on your machine ("Local mode"), and never touches GitHub.

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

# BMES TMU, official website and AI assistant

> The official repository for the Biomedical Engineering Society, Toronto Metropolitan University chapter.
> A Next.js site plus a custom RAG (Retrieval Augmented Generation) chatbot.

## About the project

This platform serves two purposes:

1. **The website:** a hub for events, team info and resources for BME students.
2. **The AI assistant ("Pulse"):** a context aware chatbot that has read our constitution and event
   schedules so it can answer student questions instantly.

## Tech stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with a token based design system
- **Language:** TypeScript
- **AI / vector DB:** Supabase (pgvector) + Groq (Llama 3.1) + LangChain

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

Environment variables live in `.env` (never committed). See [Environment](#environment) below.

---

## The design system

Everything visual is driven by tokens in [`app/globals.css`](app/globals.css). **Do not hardcode
colours, type sizes or spacing in components.** If you need a new value, add a token first.

### Colour

| Token                       | Hex       | Use                                                   |
| --------------------------- | --------- | ----------------------------------------------------- |
| `brand`                     | `#156cce` | Primary. From the approved logo. Buttons, links, accents |
| `brand-hover`               | `#0d4f99` | Primary button hover                                   |
| `brand-tint` / `brand-tint-2` | `#eff4fc` / `#eaf2fd` | Active nav pill, icon chips, calendar days with events |
| `crimson`                   | `#a90123` | From the logo's ECG line. Eyebrow rules, category pills |
| `navy` / `navy-deep`        | `#071b33` / `#050f1e` | Dark bands / footer                        |
| `ink` / `body` / `muted`    | `#14213d` / `#4a5a75` / `#5b6b85` | Text. `muted` is the lightest text allowed on white |
| `surface` / `surface-2`     | `#f5f8fd` / `#f7f9fd` | Alternating section bands                  |
| `hairline`                  | `#e4eaf4` | Every 1px border and divider                           |
| `salmon`                    | `#ff8a94` | Accent, **on navy grounds only**                       |

### Type

Two Google fonts, loaded in `app/layout.tsx`: **Outfit** for headings and numerals, **Manrope** for
body and UI. Use the type classes rather than raw sizes:

`t-hero` `t-page` `t-page-sm` `t-section` `t-section-sm` `t-band` `t-card` `t-num` `t-lead`

### Layout and components

- `.shell` page container: max `--shell-max` (1440px), gutter scales to 88px. `.shell-nav` uses the
  48px nav gutter. Full-bleed bands should carry the same background as their contents so nothing
  shows past the content edge on a wide monitor.
  **Never put a Tailwind `max-w-*` on the same element as `.shell`**, it overrides the shell width and
  silently centres the block. Put the max width on an inner element instead.
- `.band` / `.band-sm` vertical section rhythm.
- `.eyebrow` small uppercase label with the crimson rule. Variants: `.eyebrow-on-dark`, `.eyebrow-on-brand`.
- `.btn` plus `.btn-primary` `.btn-white` `.btn-ghost-light` `.btn-outline` `.btn-sm`, and `.link-underline`.
- `.card` / `.card-hover` the standard card and its blue border plus soft shadow hover.
- Add a bare `data-reveal=""` attribute to any element to make it fade and rise into view on scroll.
  `RevealOnScroll` observes the whole document, so this works from server components with no wrapper.

---

## Where things live

| Area                | Path                                                                       |
| ------------------- | -------------------------------------------------------------------------- |
| Design tokens       | `app/globals.css`                                                          |
| Shared chrome       | `app/layout.tsx`, `app/components/Navbar.tsx`, `Footer.tsx`                |
| Route transition    | `app/components/RouteTransition.tsx` (the logo curtain between pages)       |
| Chatbot UI          | `app/components/ChatWidget.tsx`, API at `app/api/chat/route.ts`             |
| Pages               | `app/page.tsx`, `app/about/`, `app/events/`, `app/team/`, `app/contact/`    |
| Event data + helpers| `data/events.json`, `lib/events.ts`                                        |
| Team roster         | `lib/team.ts`                                                              |
| Links and contact   | `lib/site.ts`                                                              |
| Brand assets        | `public/brand/`, hero video at `public/media/campus.mp4`                    |

<!-- ### Page ownership

| Page         | Owner      | Path                          |
| ------------ | ---------- | ----------------------------- |
| Home         | Hassan     | `app/page.tsx`                |
| About us     | Nithieshan | `app/about/page.tsx`          |
| Contact      | Haris      | `app/contact/page.tsx`        |
| Team         | Aydin      | `app/team/page.tsx`           |
| Events / AI  | Samin      | `app/events/`, `app/components/ChatWidget.tsx` |

--- -->

## Updating content without touching design code

**Events.** Edit `data/events.json`. Full instructions in
[`data/HOW_TO_UPDATE_EVENTS.md`](data/HOW_TO_UPDATE_EVENTS.md). Dates drive everything: upcoming
versus past, the calendar, the featured panel on the home page and the events page.

**Team.** Edit `lib/team.ts`. Each group has a `title`, a one line `blurb` and a list of members with
`name`, `role`, `image` and an optional `bio`. Portraits go in `public/members/`; leave `image` as
`"default.jpg"` until a photo exists. A member's bio only renders when it is actually written, so
there is no need to fill in placeholder text.

**Links, email and office.** Edit `lib/site.ts`. The navbar, footer, quick links and contact page all
read from it, so changing a link there changes it everywhere.

**Hero video.** Replace `public/media/campus.mp4` and `public/media/campus-poster.jpg`. Keep the file
under about 10MB; the source clip was compressed with:

```bash
ffmpeg -i input.mp4 -an -c:v libx264 -preset slow -crf 30 -pix_fmt yuv420p \
  -vf "scale=1920:-2,fps=30" -movflags +faststart public/media/campus.mp4
```

---

## Chatbot architecture

The AI assistant uses a hybrid RAG architecture:

1. **Ingestion:** `scripts/ingest.ts` scans PDFs in `public/media`, chunks them and stores embeddings
   in Supabase.
2. **Retrieval:** user queries are converted to vectors (via Hugging Face) to find relevant club documents.
3. **Generation:** relevant facts go to Groq (Llama 3.1) to generate an accurate answer.

The assistant's display name is set by `ASSISTANT_NAME` in `app/components/ChatWidget.tsx`.

## Environment

| Variable             | Needed for                                                        |
| -------------------- | ----------------------------------------------------------------- |
| `HUGGINGFACE_TOKEN`  | Embeddings for the chatbot                                        |
| `SUPABASE_URL`, `SUPABASE_API` | Vector store                                            |
| `GROQ_API_KEY`       | Chatbot answers                                                   |
| `RESEND_API_KEY`     | The contact form. Without it the form returns a clear error rather than failing silently |
| `CONTACT_TO_EMAIL`   | Optional. Defaults to `bmes@torontomu.ca`                         |
| `CONTACT_FROM_EMAIL` | Optional. Defaults to Resend's test sender, which only delivers to the Resend account owner. Set a verified domain sender before launch |

## Working on the repo

Never push directly to `main`. Branch, commit, open a pull request. See `instruction.txt` for the
full git walkthrough.

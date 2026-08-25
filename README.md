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
| What the bot knows  | `lib/siteContext.ts` (live site), `data/source-docs/` (knowledge base + PDFs) |
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

**What the chatbot knows about the chapter.** Edit
[`data/source-docs/BMES-Knowledge-Base-v3.md`](data/source-docs/BMES-Knowledge-Base-v3.md), then run
`npm run ingest`. Plain Markdown, so a content change is reviewable in the pull request.

**Hero video.** Replace `public/media/campus.mp4` and `public/media/campus-poster.jpg`. Keep the file
under about 10MB; the source clip was compressed with:

```bash
ffmpeg -i input.mp4 -an -c:v libx264 -preset slow -crf 30 -pix_fmt yuv420p \
  -vf "scale=1920:-2,fps=30" -movflags +faststart public/media/campus.mp4
```

---

## Chatbot architecture

The AI assistant answers from two sources:

1. **Retrieved documents.** `scripts/ingest.ts` chunks everything in
   [`data/source-docs/`](data/source-docs/) and stores embeddings in Supabase; a question is
   vectorised (via Hugging Face) to pull the six most relevant chunks. The main document there is
   `BMES-Knowledge-Base-v3.md`, the chapter reference the bot is grounded against, alongside
   archived PDFs carrying policy and history that can be a year or two out of date. Those files
   live outside `public/` on purpose: anything under `public/` is downloadable by anyone who
   guesses the filename, and several contain contact details.
2. **Live site context.** [`lib/siteContext.ts`](lib/siteContext.ts) builds a description of the
   website on every request from the same modules the pages render from: the route map, the chapter
   facts, every event in `data/events.json` with its dates resolved against today, the current
   executive roster and every link. **There is nothing to re-ingest.** Add an event or change a
   link and the assistant knows on the next message.

Where the two disagree the prompt tells the model the site context wins, and it is instructed to
link students to the page that answers their question (`/events`, `/team` and so on). Those links
render through `next/link` so they navigate without a page reload.

**Retrieval is best effort.** If Supabase or Hugging Face is unconfigured or erroring, the route
reads `BMES-Knowledge-Base-v3.md` off disk and passes the whole thing to the model instead of
giving up. It is a few thousand tokens against a 131k window, so the assistant still answers, and
still answers from the chapter's own material. That makes `GROQ_API_KEY` the only key it cannot
run without, which is what lets someone work on the chatbot without the vector store credentials.
`next.config.ts` keeps that file in the deployment bundle; nothing imports it, so the build would
not otherwise ship it.

Answers are generated by Groq (Llama 3.1). The assistant's display name is `ASSISTANT_NAME` in
[`lib/site.ts`](lib/site.ts), which drives both the widget and the system prompt.

Personal emails and phone numbers are deliberately absent from `lib/team.ts`, so the assistant
cannot hand them out; it routes enquiries to `bmes@torontomu.ca` instead.

### Re-ingesting

```bash
npm run ingest          # skips unchanged files, re-embeds edited ones, adds new ones
npm run ingest:rebuild  # wipes the table and starts clean
```

Files are tracked by a hash of their contents, so editing the knowledge base and re-running
`npm run ingest` actually updates the index. Renames, deletions and chunk-size changes need the
rebuild. See [`data/source-docs/README.md`](data/source-docs/README.md) for the details, including
the one-off rebuild the August 2026 update needs.

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

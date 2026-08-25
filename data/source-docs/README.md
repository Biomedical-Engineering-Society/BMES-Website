# Chatbot source documents

Everything the AI assistant reads. `npm run ingest` chunks these, embeds them and
stores them in Supabase.

Supported file types: `.md`, `.txt`, `.pdf`.

**Keep these out of `public/`.** Anything under `public/` is served at the site
root, so a file there is downloadable by anyone who knows or guesses its name.
Several of these carry names, emails and phone numbers.

## The knowledge base

[`BMES-Knowledge-Base-v3.md`](BMES-Knowledge-Base-v3.md) is the main document and
the one to edit. It is the chapter reference the assistant answers from: what BMES
is, the pillars, the events, governance, contacts, and the tone the bot should use.

It is Markdown, and deliberately so:

- It diffs in a pull request, so a content change is reviewable line by line.
- The ingest splits it on headings and stamps each chunk with its heading trail,
  so a retrieved fragment still knows it is about, say, the Synapse Conference.
- Nothing has to parse a binary. A `.docx` or a `.pdf` loses that structure and
  the ingest cannot read `.docx` at all.

If someone hands you a new Word document, convert it to Markdown and replace the
body of this file rather than adding the `.docx`.

The chat route also reads this exact file directly as a fallback when the vector
store is unavailable, so keeping it accurate matters even if you never re-ingest.

## Adding or changing a document

Drop the file in here and run:

```bash
npm run ingest
```

The script hashes each file's contents and stores that hash alongside every
chunk, so:

- **unchanged** files are skipped, and cost nothing
- **edited** files have their old rows deleted and are re-embedded
- **new** files are embedded

A **renamed or deleted** file is the one case it cannot clean up after, because
the rows are matched by `metadata.source`. Wipe and rebuild for that:

```bash
npm run ingest:rebuild
```

That deletes every row in `documents` first, then re-ingests the folder from
scratch. It is also what to run after changing `CHUNK_SIZE` in
[`scripts/ingest.ts`](../../scripts/ingest.ts), so the index does not end up a
mix of old and new chunk sizes.

## First run after the August 2026 update

Run `npm run ingest:rebuild` once, not `npm run ingest`.

The index still holds rows from two earlier states: chunks embedded at the old
300 character size, and chunks whose `metadata.source` points at
`public/media/...` from before the PDFs moved into this folder. Neither matches
anything the current script looks for, so an incremental run would leave both in
place and retrieval would keep pulling stale fragments. A rebuild clears them.

## Environment

The ingest needs `SUPABASE_URL`, `SUPABASE_API` and `HUGGINGFACE_TOKEN` in `.env`.
It exits with a clear message naming any that are missing.

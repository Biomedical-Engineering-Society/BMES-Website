# Chatbot source documents

Everything the AI assistant reads. `npm run ingest` chunks these, embeds them and
stores them in Supabase.

Supported file types: `.md`, `.txt`, `.pdf`.

The knowledge base below is the only source. The earlier internal PDFs (club
development report, year in review, constitution, chatbot notes) were removed in
August 2026: the knowledge base supersedes their content, and one of them opened
with a table of executives' personal email addresses that the assistant could
then retrieve.

**Keep anything you add out of `public/`.** Anything under `public/` is served at
the site root, so a file there is downloadable by anyone who guesses its name.

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

## Previewing before you spend embedding calls

```bash
npm run ingest:preview
```

Chunks everything and prints what it would embed, including the section list for
each Markdown file, without contacting Supabase or Hugging Face. It needs no
credentials, so this is the one part of the pipeline anyone can run.

This README is skipped by the ingest. It is instructions for us, not material
for the bot.

## If the index looks wrong

Run `npm run ingest:rebuild`. Deleted and renamed files leave rows behind that an
incremental run cannot match, so retrieval keeps pulling fragments of documents
that are no longer here. A rebuild clears the table and re-embeds the folder.

## Environment

The ingest needs `SUPABASE_URL`, `SUPABASE_API` and `HUGGINGFACE_TOKEN` in `.env`.
It exits with a clear message naming any that are missing.

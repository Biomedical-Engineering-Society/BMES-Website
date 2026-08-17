# Chatbot source documents

PDFs the AI assistant reads. `npm run ingest` chunks everything in this folder,
embeds it and stores it in Supabase.

**Keep these out of `public/`.** Anything under `public/` is served at the site
root, so a file there is downloadable by anyone who knows or guesses its name.
Several of these carry names, emails and phone numbers.

To add a document: drop the PDF in here and run `npm run ingest`. Already
ingested files are skipped, so it is safe to re-run.

## One-off note about the move from `public/media`

`ingest.ts` skips a file by matching its **path** against `metadata.source` in
Supabase. These four PDFs were ingested under their old `public/media/...` paths,
so those rows no longer match and a re-run would embed them a second time rather
than skip them.

The existing rows still work and the content has not changed, so there is nothing
to do. If you ever do want a clean rebuild, delete the old rows first:

```sql
delete from documents where metadata->>'source' like 'public/media/%';
```

then run `npm run ingest`.

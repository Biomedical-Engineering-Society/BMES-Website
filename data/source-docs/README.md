# Chatbot source documents

PDFs the AI assistant reads. `npm run ingest` chunks everything in this folder,
embeds it and stores it in Supabase.

**Keep these out of `public/`.** Anything under `public/` is served at the site
root, so a file there is downloadable by anyone who knows or guesses its name.
Several of these carry names, emails and phone numbers.

To add a document: drop the PDF in here and run `npm run ingest`. Already
ingested files are skipped, so it is safe to re-run.

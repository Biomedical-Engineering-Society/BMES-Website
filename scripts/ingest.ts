import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
// Aliased because the DOM lib also defines a global `Document`.
import type { Document as LangChainDocument } from "@langchain/core/documents";

dotenv.config();

// ---------------------------------------------------------------------------
// CONFIGURATION
// ---------------------------------------------------------------------------

// Source documents live outside public/ on purpose: anything under public/ is
// served at the site root, and these contain contact details that should not be
// downloadable by anyone who guesses the filename.
const SOURCE_DIR = "data/source-docs";

// Retrieval quality lives and dies on chunk size. Too small and a chunk is a
// sentence fragment with no idea what it is about; the model then answers from
// half a fact. These are sized so a chunk is roughly a paragraph or a short
// section, which is what a student question actually maps onto.
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 150;

/** Prose separators, longest structural break first. */
const TEXT_SEPARATORS = ["\n\n", "\n", ". ", " ", ""];

/** Markdown gets to break on headings before it breaks on blank lines. */
const MARKDOWN_SEPARATORS = ["\n## ", "\n### ", "\n#### ", "\n\n", "\n", ". ", " ", ""];

const SUPPORTED = [".pdf", ".md", ".txt"] as const;

const REBUILD = process.argv.includes("--rebuild");

// ---------------------------------------------------------------------------
// LOADING
// ---------------------------------------------------------------------------

/**
 * Markdown, split into one document per heading with a breadcrumb of the
 * headings above it.
 *
 * The breadcrumb matters. A chunk that reads "Exact theme, speakers and
 * attendance figures shift year to year" is useless on its own; the same chunk
 * prefixed with "BMES Synapse Conference" both retrieves better and tells the
 * model what it is looking at.
 */
function loadMarkdown(filePath: string, raw: string): LangChainDocument[] {
  const lines = raw.split("\n");
  const trail: string[] = [];
  const sections: { heading: string; body: string[] }[] = [];
  let current: { heading: string; body: string[] } = { heading: "", body: [] };

  for (const line of lines) {
    const match = /^(#{1,6})\s+(.*)$/.exec(line);
    if (!match) {
      current.body.push(line);
      continue;
    }
    if (current.body.join("").trim() || current.heading) sections.push(current);

    const depth = match[1].length;
    const title = match[2].trim();
    trail.length = depth - 1;
    trail[depth - 1] = title;
    current = { heading: trail.filter(Boolean).join(" > "), body: [] };
  }
  if (current.body.join("").trim() || current.heading) sections.push(current);

  return sections
    .map(({ heading, body }) => ({ heading, text: body.join("\n").trim() }))
    .filter(({ text }) => text.length > 0)
    .map(({ heading, text }) => ({
      pageContent: text,
      metadata: { source: filePath, heading },
    }));
}

async function loadFile(filePath: string, ext: string): Promise<LangChainDocument[]> {
  if (ext === ".pdf") return new PDFLoader(filePath).load();

  const raw = fs.readFileSync(filePath, "utf8");
  if (ext === ".md") return loadMarkdown(filePath, raw);
  return [{ pageContent: raw, metadata: { source: filePath } }];
}

/** Short content hash, so an edited file is re-ingested instead of skipped. */
function hashFile(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex").slice(0, 16);
}

// ---------------------------------------------------------------------------
// INGEST
// ---------------------------------------------------------------------------

async function ingestDocuments() {
  const { SUPABASE_URL, SUPABASE_API, HUGGINGFACE_TOKEN } = process.env;
  const missing = Object.entries({ SUPABASE_URL, SUPABASE_API, HUGGINGFACE_TOKEN })
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length > 0) {
    console.error(`[FATAL] Missing environment variables: ${missing.join(", ")}`);
    console.error("        Copy them into .env before running the ingest.");
    process.exit(1);
  }

  const client = createClient(SUPABASE_URL!, SUPABASE_API!);

  if (!fs.existsSync(SOURCE_DIR)) {
    throw new Error(`Directory not found: ${SOURCE_DIR}`);
  }

  // --rebuild wipes the table first. Use it when chunking settings change, or
  // to clear rows left behind by files that have since been moved or renamed:
  // a rename changes metadata.source, so the old rows stop matching anything
  // here and would otherwise sit in the index forever.
  if (REBUILD) {
    console.log("[REBUILD] Deleting every row in `documents` before re-ingesting.");
    const { error } = await client.from("documents").delete().not("id", "is", null);
    if (error) throw new Error(`Could not clear the table: ${error.message}`);
  }

  const files = fs.readdirSync(SOURCE_DIR).sort();
  console.log(`[INFO] Found ${files.length} files in ${SOURCE_DIR}. Checking status...`);

  const pending: LangChainDocument[] = [];

  for (const file of files) {
    const filePath = path.join(SOURCE_DIR, file);
    const ext = path.extname(file).toLowerCase();

    if (!SUPPORTED.includes(ext as (typeof SUPPORTED)[number])) {
      console.log(`[IGNORE] Unsupported file type: ${file}`);
      continue;
    }

    const hash = hashFile(filePath);

    // Ask the database what it already holds for this file. Matching on the
    // hash as well as the path is what makes an edited document re-ingest:
    // the old behaviour matched on path alone, so changes to a file that had
    // been ingested once were silently never picked up.
    const { data: existing, error } = await client
      .from("documents")
      .select("id, metadata")
      .contains("metadata", { source: filePath })
      .limit(1);

    if (error) {
      console.error(`[ERROR] Database check failed for ${file}: ${error.message}`);
      continue;
    }

    if (existing && existing.length > 0) {
      const storedHash = (existing[0].metadata as { hash?: string } | null)?.hash;
      if (storedHash === hash) {
        console.log(`[SKIP] ${file} (unchanged)`);
        continue;
      }

      console.log(`[CHANGED] ${file} — removing the old rows before re-embedding.`);
      const { error: deleteError } = await client
        .from("documents")
        .delete()
        .contains("metadata", { source: filePath });

      if (deleteError) {
        console.error(`[ERROR] Could not clear old rows for ${file}: ${deleteError.message}`);
        continue;
      }
    } else {
      console.log(`[NEW] ${file}`);
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: CHUNK_SIZE,
      chunkOverlap: CHUNK_OVERLAP,
      separators: ext === ".md" ? MARKDOWN_SEPARATORS : TEXT_SEPARATORS,
    });

    const chunks = await splitter.splitDocuments(await loadFile(filePath, ext));

    for (const chunk of chunks) {
      const heading = (chunk.metadata as { heading?: string }).heading;
      // Every chunk carries its own hash so the next run can compare, and its
      // heading inline so a retrieved fragment still says what it is about.
      chunk.metadata = { ...chunk.metadata, source: filePath, hash };
      if (heading) chunk.pageContent = `${heading}\n\n${chunk.pageContent}`;
    }

    console.log(`         ${chunks.length} chunks`);
    pending.push(...chunks);
  }

  if (pending.length === 0) {
    console.log("[INFO] System is up to date. Nothing to embed.");
    return;
  }

  console.log(`[INFO] Generating embeddings for ${pending.length} chunks...`);

  await SupabaseVectorStore.fromDocuments(
    pending,
    new HuggingFaceInferenceEmbeddings({
      apiKey: HUGGINGFACE_TOKEN,
      model: "sentence-transformers/all-MiniLM-L6-v2",
    }),
    {
      client,
      tableName: "documents",
      queryName: "match_documents",
    }
  );

  console.log(`[SUCCESS] Ingestion complete. Stored ${pending.length} chunks.`);
}

ingestDocuments().catch((error) => {
  console.error("[FATAL] Script failed:", error);
  process.exit(1);
});

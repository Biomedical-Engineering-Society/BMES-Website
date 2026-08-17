import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// import { TextLoader } from "langchain/document_loaders/fs/text"; 
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
// Aliased because the DOM lib also defines a global `Document`.
import type { Document as LangChainDocument } from "@langchain/core/documents";

dotenv.config();

// ---------------------------------------------------------------------------
// CONFIGURATION: Add new file types here when you are ready
// ---------------------------------------------------------------------------
/** Anything with a `.load()` returning LangChain documents fits here. */
type DocumentLoader = { load: () => Promise<LangChainDocument[]> };

const LOADERS: Record<string, (path: string) => DocumentLoader> = {
  ".pdf": (path: string) => new PDFLoader(path),
  // ".txt": (path: string) => new TextLoader(path), // Uncomment this line later!
  // ".md": (path: string) => new TextLoader(path),
};

async function ingestDocuments() {
  try {
    const client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_API!
    );

    // Source documents live outside public/ on purpose: anything under public/
    // is served at the site root, and these contain contact details that should
    // not be downloadable by anyone who guesses the filename.
    const SOURCE_DIR = "data/source-docs";

    // 1. Check directory
    if (!fs.existsSync(SOURCE_DIR)) {
      throw new Error(`Directory not found: ${SOURCE_DIR}`);
    }

    const files = fs.readdirSync(SOURCE_DIR);
    console.log(`[INFO] Found ${files.length} files in ${SOURCE_DIR}. Checking status...`);

    const newDocs = [];

    // 2. The "Smart" Loop
    for (const file of files) {
      const filePath = path.join(SOURCE_DIR, file);
      const ext = path.extname(file).toLowerCase();

      // DYNAMIC CHECK: Is this file type in our LOADERS list?
      const loaderFactory = LOADERS[ext];

      if (!loaderFactory) {
        console.log(`[IGNORE] Unsupported file type: ${file}`);
        continue;
      }

      // Check Supabase (Save Money)
      const { data: existingDocs, error } = await client
        .from("documents")
        .select("id")
        .contains("metadata", { source: filePath })
        .limit(1);

      if (error) {
        console.error(`[ERROR] Database check failed for ${file}:`, error.message);
        continue;
      }

      if (existingDocs && existingDocs.length > 0) {
        console.log(`[SKIP] ${file} (Already processed)`);
        continue;
      }

      // LOAD IT
      console.log(`[NEW] Detected new file: ${file}`);
      const loader = loaderFactory(filePath); // Uses the map to pick the right loader
      const docs = await loader.load();
      newDocs.push(...docs);
    }

    // 3. Stop if empty
    if (newDocs.length === 0) {
      console.log("[INFO] System is up to date. No new files to process.");
      return;
    }

    console.log(`[INFO] Processing ${newDocs.length} new document chunks...`);

    // 4. Chunk
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 300,
      chunkOverlap: 50,
      separators: ["\n\n", "\n", " ", ""],
    });

    const splitDocs = await splitter.splitDocuments(newDocs);

    // 5. Embed & Store
    console.log(`[INFO] Generating embeddings for ${splitDocs.length} chunks...`);
    
    await SupabaseVectorStore.fromDocuments(
      splitDocs,
      new HuggingFaceInferenceEmbeddings({
        apiKey: process.env.HUGGINGFACE_TOKEN,
        model: "sentence-transformers/all-MiniLM-L6-v2",
      }),
      {
        client,
        tableName: "documents",
        queryName: "match_documents",
      }
    );

    console.log(`[SUCCESS] Ingestion complete. Added ${newDocs.length} new documents.`);

  } catch (error) {
    console.error("[FATAL] Script failed:", error);
    process.exit(1);
  }
}

ingestDocuments();
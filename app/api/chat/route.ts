import { NextRequest, NextResponse } from "next/server";
import * as fs from "node:fs";
import * as path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import Groq from "groq-sdk"; //INDUSTRY STANDARD: Specialized Inference Engine
import { ASSISTANT_NAME, CONTACT, LINKS } from "@/lib/site";
import { buildSiteContext } from "@/lib/siteContext";

// Reads the knowledge base off disk, so it cannot run on the edge.
export const runtime = "nodejs";

/** How many retrieved chunks to put in front of the model. */
const RETRIEVED_CHUNKS = 6;

/**
 * The chapter knowledge base, in full.
 *
 * Normally the assistant only sees the handful of chunks retrieval picked out.
 * This is the safety net for when there is nothing to retrieve from: no vector
 * store configured, or Supabase or Hugging Face erroring. It is a few thousand
 * tokens, which is nothing next to the model's context window, so a fallback
 * answer is still a grounded answer rather than an apology.
 *
 * `next.config.ts` keeps this file in the deployment bundle.
 */
const KNOWLEDGE_BASE = "data/source-docs/BMES-Knowledge-Base-v3.md";

let knowledgeBase: string | null = null;

function readKnowledgeBase(): string {
  if (knowledgeBase === null) {
    try {
      knowledgeBase = fs.readFileSync(path.join(process.cwd(), KNOWLEDGE_BASE), "utf8");
    } catch (error) {
      console.error(`Could not read ${KNOWLEDGE_BASE}:`, error);
      knowledgeBase = "";
    }
  }
  return knowledgeBase;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = body.message || "What is BMES?";

    console.log(`\n🔍 Searching for: "${query}"`);

    // ---------------------------------------------------------
    // STEP 1: RETRIEVAL (The "R" in RAG)
    // ---------------------------------------------------------
    // Retrieval is best effort. If the vector store is not configured, or is
    // simply having a bad day, we fall back to the full knowledge base below
    // rather than leaving the model with nothing to answer from. The only key
    // the assistant genuinely cannot work without is GROQ_API_KEY.
    const canRetrieve = Boolean(
      process.env.SUPABASE_URL && process.env.SUPABASE_API && process.env.HUGGINGFACE_TOKEN
    );

    let results: { pageContent: string; metadata: Record<string, unknown> }[] = [];

    if (canRetrieve) {
      try {
        const client = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_API!
        );

        // We keep Hugging Face for Embeddings because it is cheap, accurate, and reliable.
        const embeddings = new HuggingFaceInferenceEmbeddings({
          apiKey: process.env.HUGGINGFACE_TOKEN,
          model: "sentence-transformers/all-MiniLM-L6-v2",
        });

        const vectorStore = new SupabaseVectorStore(embeddings, {
          client,
          tableName: "documents",
          queryName: "match_documents",
        });

        results = await vectorStore.similaritySearch(query, RETRIEVED_CHUNKS);
      } catch (retrievalError) {
        console.error("Retrieval failed, reading the knowledge base instead:", retrievalError);
      }
    } else {
      console.warn("No vector store configured, reading the knowledge base instead.");
    }

    // ---------------------------------------------------------
    // STEP 2: GENERATION (The "G" in RAG)
    // ---------------------------------------------------------

    // Prepare the "Context" (The facts the AI must read)
    const retrieved = results.map((doc) => doc.pageContent).join("\n\n---\n\n").trim();
    const contextText = retrieved || readKnowledgeBase();

    // The "System Prompt" (The personality & rules)
    const systemInstruction = `
You are "${ASSISTANT_NAME}" a helpful BMES (Biomedical Engineering Society) student chat assistant to spread the knowledge about the club.
You are chatting with another student on the website.
Your goal is to answer the user's question clearly, accurately, and concisely using the context provided.
Act as if you are chatting with the user in a messaging app (keep it short and conversational).

Instructions:
1. You MUST ONLY answer questions related to BMES (Biomedical Engineering Society) or the university site. If the user asks about ANY other topic (e.g., coding, general knowledge, other clubs, unrelated general chat), do not answer it. Reply with exactly one short line telling them you only cover BMES and inviting a BMES question. Always reply with something; never return an empty message.
2. Answer ONLY what is asked with conversational tone (as if you were texting). Do not add extra "Welcome" messages or huge summaries. You are aware of the entire website and its general context, use your best judgment but stick ONLY to BMES topics.
3. Output your answer in nice visually appealing markdown format (use bullet points, bold text, etc. where appropriate).
4. If you are unsure and the answer is not explicitly written in the documentation or your general knowledge about BMES, say "Sorry, I actually don't have that info handy right now!  Your best bet is to DM us on Instagram or email the team directly."
5. Keep the tone conversational, professional, friendly.
6. Do not add unnecessary marketing fluff.
7. **Be Conversational:** Write like a human text message.
8. **NO HEADERS:** Do not use markdown titles (like # or ##). They look weird in chat.
9. **Short Paragraphs:** Avoid walls of text. Break things up by using spaces and short paragraphs.

**NEVER ask the user for documents.** They are students, they don't have your files.

**If you don't know the answer:** Do NOT mention "context" or "documents." Just say what was on the instruction when you are unsure:

"Sorry, I actually don't have that info handy right now!  Your best bet is to DM us on Instagram or email the team directly."

If the user asks about contact info, social media, how to get involved, how to join the community, or how to reach out, share these links as markdown alongside anything relevant from the context documents:
* Email: [${CONTACT.email}](mailto:${CONTACT.email})
* Instagram: [Instagram](${LINKS.instagram})
* LinkedIn: [LinkedIn](${LINKS.linkedin})
* Linktree: [Everything in one place](${LINKS.linktree})
* Office: ${CONTACT.office}, ${CONTACT.building}

NEVER use HTML tags (like <b> or <br>). Never paste a raw https:// URL. Use STRICT MARKDOWN for links.

**GUIDE PEOPLE AROUND THE SITE.** You know every page of this website (listed below).
When a question is answered by a page, answer it briefly and then link to that page so
they can go and read the rest, for example "we run workshops, panels and a conference,
the full list is on [the events page](/events)". Prefer linking one page that actually
answers the question over listing several.

**WHICH SOURCE WINS.** The WHAT IS ON THIS WEBSITE section below is generated from the
live site, so it is always current. The context documents are the chapter knowledge base
and archived PDFs, which carry history, policy and background and may be a year or two
old. For anything current, who the executives are, what events are running, contact
details, the site section wins and the documents are only background. Never name an
executive or an event that is not in the site section. Questions about who runs the club
are about the current executive team: name a few and link [our team](/team).

${buildSiteContext()}
`;

    console.log("Sending to Groq...");

    // Shown if generation fails. The widget does not render the retrieved
    // sources, so this has to stand on its own.
    let answer = `I could not put an answer together just now. Try again in a moment, or email ${CONTACT.email}.`;
    
    try {
      // We use Groq because it runs on LPUs (Lightning Processing Units).
      // It is 10x faster than standard APIs and doesn't have the "Cold Boot" issues of Hugging Face.
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      
      const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: `Context:\n${contextText}\n\nQuestion: ${query}` }
        ],
        max_tokens: 500,
        temperature: 0.1, // Low temperature = Strict adherence to facts (No hallucinations)
      });
      
      // Extract the answer safely
      answer = response.choices[0]?.message?.content || answer;
      console.log("Groq Answer generated!");

    } catch (llmError) {
      // FAULT TOLERANCE: If the AI fails, we log it but STILL return the documents.
      console.error("Groq Generation Failed:", llmError);
    }

    // ---------------------------------------------------------
    // STEP 3: RESPONSE
    // ---------------------------------------------------------
    return NextResponse.json({
      answer: answer,
      sources: results.length > 0 ? results.map(r => r.metadata.source) : [KNOWLEDGE_BASE],
      matches: results,
      query: query
    });

  } catch (error) {
    // Critical infrastructure failure (Database down, etc.)
    console.error("Critical Error:", error);
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
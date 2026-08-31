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

// Retrieval plus generation is normally about a second. This is headroom for a
// slow Hugging Face cold start, not a target.
export const maxDuration = 30;

/** How many retrieved chunks to put in front of the model. */
const RETRIEVED_CHUNKS = 4;

/**
 * How long to wait for retrieval before answering from the knowledge base.
 *
 * Embedding the question calls Hugging Face, which is a few hundred ms warm but
 * can take half a minute when the provider has to spin the model up. That is
 * longer than a serverless function is allowed to run, so an unbounded wait
 * turns a slow cold start into a failed request. The full knowledge base is
 * already loaded as a fallback, so giving up early still answers the question.
 */
const RETRIEVAL_TIMEOUT_MS = 6000;

function withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    work,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms),
    ),
  ]);
}

/**
 * Generation models, tried in order until one answers.
 *
 * Groq retires models with little notice, and a retired one returns 404 to every
 * request, which the catch below turns into the generic "could not put an answer
 * together" line. That is how the assistant went down once already, so a
 * retirement should degrade to the next model rather than take the bot offline.
 *
 * llama-3.1-8b-instant and llama-3.3-70b-versatile have both moved to Groq's
 * enterprise tier and now 404 on a standard key. Set GROQ_MODEL to pin one; to
 * see what a key can currently reach:
 *   curl https://api.groq.com/openai/v1/models -H "Authorization: Bearer $GROQ_API_KEY"
 */
const GROQ_MODELS = [
  process.env.GROQ_MODEL,
  // Best general model this key can reach, and still cheap at $0.15 / $0.60 per
  // million tokens. gpt-oss-20b is listed faster on paper but follows this
  // prompt noticeably less well, so it is only the fallback.
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
].filter((id): id is string => Boolean(id));

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

        results = await withTimeout(
          vectorStore.similaritySearch(query, RETRIEVED_CHUNKS),
          RETRIEVAL_TIMEOUT_MS,
        );
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
    // Every token here is spent on every question, and the key's budget is a
    // few thousand tokens a minute, so this says each rule once and stops.
    const systemInstruction = `
You are "${ASSISTANT_NAME}", the BMES (Biomedical Engineering Society) assistant on the BMES TMU website, talking to a student.

Answer only what was asked, using what you are given below, like a text message: short, friendly, professional. No marketing fluff, no welcome preamble, no walls of text. Markdown only, with bullets and bold where they help, but never headings (# or ##) and never HTML. Never paste a bare URL; every link is markdown. Always reply with something, never an empty message.

Only cover BMES and this website. For anything else (coding, general knowledge, other clubs, chit chat), reply with one short line saying you only cover BMES and invite a BMES question.

Never mention "context" or "documents", and never ask a student for a file. If the answer is not in what you were given, reply exactly: "Sorry, I actually don't have that info handy right now!  Your best bet is to DM us on Instagram or email the team directly."

Link the one page that answers the question, for example "we run workshops, panels and a conference, the full list is on [the events page](/events)". Never link a page that is not listed below.

Asked how to reach us or get involved, give these:
* Email: [${CONTACT.email}](mailto:${CONTACT.email})
* Instagram: [Instagram](${LINKS.instagram})
* LinkedIn: [LinkedIn](${LINKS.linkedin})
* Linktree: [Everything in one place](${LINKS.linktree})
* Office: ${CONTACT.office}, ${CONTACT.building}

The site facts below are generated live and outrank the knowledge base extracts, which are background and can be out of date. Never name an executive or an event that is not in them. Who runs the club means the current executive team: name a few and link [our team](/team).

${buildSiteContext()}
`;

    console.log("Sending to Groq...");

    // Shown if generation fails. The widget does not render the retrieved
    // sources, so this has to stand on its own.
    const FALLBACK_ANSWER = `I could not put an answer together just now. Try again in a moment, or email ${CONTACT.email}.`;
    let answer = FALLBACK_ANSWER;
    
    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is not set, so the assistant cannot generate an answer.");
    } else {
      // Groq runs on LPUs, so it is fast and has none of the cold-boot latency
      // of Hugging Face inference.
      //
      // maxRetries 0 on purpose. The SDK's default is to sit on a 429 and retry
      // with backoff, which turned a busy minute into a 25 second wait. Each
      // model has its own token bucket, so failing fast and moving to the next
      // one answers sooner and doubles the tokens available per minute.
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY, maxRetries: 0 });
      let allRateLimited = true;

      for (const model of GROQ_MODELS) {
        try {
          const response = await groq.chat.completions.create({
            model,
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: `Context:
${contextText}

Question: ${query}` },
            ],
            max_tokens: 500,
            temperature: 0.1, // Low temperature = strict adherence to the context
            // gpt-oss models reason before answering, and those tokens come out
            // of max_tokens. On anything non-trivial the default effort spent
            // the whole budget thinking and returned a truncated sentence.
            // Everything here is a lookup in supplied context, so low is right,
            // and it is roughly three times cheaper per answer.
            reasoning_effort: "low",
          });

          const content = response.choices[0]?.message?.content?.trim();
          if (content) {
            answer = content;
            console.log(`Answer generated by ${model}.`);
            break;
          }
          console.warn(`${model} returned an empty message, trying the next one.`);
        } catch (llmError) {
          const status = (llmError as { status?: number }).status;
          console.error(`Generation failed on ${model} (${status}):`, llmError);

          // 404 is a retired or ungated model, 429 is that model's token bucket
          // being empty. Both are worth trying the next model for. Anything
          // else will not be fixed by swapping models.
          if (status !== 404 && status !== 429) {
            allRateLimited = false;
            break;
          }
          if (status !== 429) allRateLimited = false;
        }
      }

      // Every model was rate limited, which is a passing condition rather than
      // a fault, so say so instead of implying the question was the problem.
      if (answer === FALLBACK_ANSWER && allRateLimited) {
        answer = "I am getting a lot of questions right now. Give me a minute and ask again.";
      }
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
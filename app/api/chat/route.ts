import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import Groq from "groq-sdk"; //INDUSTRY STANDARD: Specialized Inference Engine
import { ASSISTANT_NAME, CONTACT, LINKS } from "@/lib/site";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = body.message || "What is BMES?";

    console.log(`\n🔍 Searching for: "${query}"`);

    // ---------------------------------------------------------
    // STEP 1: RETRIEVAL (The "R" in RAG)
    // ---------------------------------------------------------
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

    // Retrieve the top 3 most relevant PDF chunks
    const results = await vectorStore.similaritySearch(query, 3);

    // ---------------------------------------------------------
    // STEP 2: GENERATION (The "G" in RAG)
    // ---------------------------------------------------------
    
    // Prepare the "Context" (The facts the AI must read)
    const contextText = results.map((doc) => doc.pageContent).join("\n\n---\n\n");
    
    // The "System Prompt" (The personality & rules)
    const systemInstruction = `
You are "${ASSISTANT_NAME}" a helpful BMES (Biomedical Engineering Society) student chat assistant to spread the knowledge about the club.
You are chatting with another student on the website.
Your goal is to answer the user's question clearly, accurately, and concisely using the context provided.
Act as if you are chatting with the user in a messaging app (keep it short and conversational).

Instructions:
1. You MUST ONLY answer questions related to BMES (Biomedical Engineering Society) or the university site. If the user asks about ANY other topic (e.g., coding, general knowledge, other clubs, unrelated general chat), you must strictly refuse to answer and redirect them back to BMES.
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
`

;

    console.log("Sending to Groq...");

    // The widget does not render the retrieved sources, so this fallback has to
    // stand on its own rather than point at "the documents below".
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
      sources: results.map(r => r.metadata.source),
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
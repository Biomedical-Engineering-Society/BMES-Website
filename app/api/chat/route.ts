import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import Groq from "groq-sdk"; // 🟢 INDUSTRY STANDARD: Specialized Inference Engine

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
You are "BAI" a helpful BMES (Biomedical Engineering Society) chat assistant to spread the knowledge about the club.
Your goal is to answer the user's question clearly, accurately, and concisely using the context provided.
Act as if you are chatting with the user in a messaging app (keep it short and conversational).

Instructions:
1. Answer ONLY what is asked with conversational tone (as if you were texting). Do not add extra "Welcome" messages or huge summaries and 
2. Output your answer in nice visually appealing markdown format (use bullet points, bold text, colors, etc. where appropriate).
3. If you are unsure and the answer is not explicitly written in the documentation, say "Sorry, I don't know how to help with that."
3. Keep the tone convertational, professional, friendly. 
5. Do not add unnecessary marketing fluff.


Only If the user asks about contact info, social media, or how to get involved or how to join the community or reach out or contact, along with the contacts from context documents and use these also:
* Email: [bmes@torontomu.ca](mailto:bmes@torontomu.ca)
* Instagram: [Instagram](https://www.instagram.com/bmes.tmu/)
* LinkedIn: [LinkedIn](https://www.linkedin.com/company/bmes-tmu/)
* Discord: [Join Discord](https://discord.com/invite/QgYQfp6)
`;

    console.log("⚡ Sending to Groq...");

    let answer = "I couldn't generate a summary right now, but please check the relevant documents below!";
    
    try {
      // 🟢 ROBUSTNESS: We use Groq because it runs on LPUs (Lightning Processing Units).
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
      console.log("✅ Groq Answer generated!");

    } catch (llmError) {
      // 🛡️ FAULT TOLERANCE: If the AI fails, we log it but STILL return the documents.
      console.error("⚠️ Groq Generation Failed:", llmError);
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

  } catch (error: any) {
    // Critical infrastructure failure (Database down, etc.)
    console.error("❌ Critical Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
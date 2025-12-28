# BMES AI Assistant (RAG Chatbot)

> A fast, context-aware RAG chatbot for the Biomedical Engineering Society (BMES).

## About

This project is a **RAG (Retrieval Augmented Generation)** application designed to answer student questions about BMES.

Unlike generic AI models that hallucinate or give vague answers, this bot has "read" the official club documentation. It retrieves specific facts from a vector database and uses a Large Language Model (LLM) to generate accurate, human-like answers.

## The Tech Stack

I built this using a **Hybrid Architecture** to optimize for both cost (Free Tier) and speed:

- **Frontend:** [Next.js 15](https://nextjs.org/) (React, TypeScript, Tailwind CSS)
- **Vector Database:** [Supabase](https://supabase.com/) (pgvector)
- **Embeddings:** [Hugging Face](https://huggingface.co/) (`all-MiniLM-L6-v2`)
- **Inference Engine:** [Groq](https://groq.com/) (LPU-accelerated Inference)
- **LLM Model:** Meta's `Llama-3.1-8b-instant`
- **Orchestration:** [LangChain](https://js.langchain.com/)

## How It Works (The Architecture)

1.  **Ingestion (The "Learning" Phase):**

    - A custom script (`scripts/ingest.ts`) scans PDF documents from the `/public` folder.
    - It splits text into chunks and converts them into 384-dimensional vectors using Hugging Face embeddings.
    - These vectors are stored in Supabase.

2.  **Retrieval (The "Search" Phase):**

    - When a user asks a question, the system converts their query into a vector.
    - It performs a semantic similarity search in Supabase to find the 3 most relevant paragraphs (chunks).

3.  **Generation (The "Answer" Phase):**
    - The system sends the user's question + the retrieved paragraphs to **Groq**.
    - Using **Llama 3.1**, it generates a concise answer based _only_ on the provided facts.
    - It enforces strict formatting rules (Markdown, clickable social links) using "System Prompt Engineering."

## 🏁 Getting Started

### Prerequisites

- Node.js & npm
- A Supabase project (with pgvector enabled)
- API Keys for Groq & Hugging Face

### Installation

1.  **Clone the repo:**

    ```
    cd bmes-chatbot
    ```

2.  **Install dependencies:**

    ```
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file and add your keys:

    ```env
    SUPABASE_URL=your_supabase_url
    SUPABASE_API=your_supabase_anon_key
    HUGGINGFACE_TOKEN=your_hf_token
    GROQ_API_KEY=your_groq_key
    ```

4.  **Run the Ingestion Script (Load Knowledge):**

    ```
    npx tsx scripts/ingest.ts
    ```

5.  **Run the App:**
    ```
    npm run dev
    ```

## What I Learned

- How to implement **Vector Search** manually without relying on "black box" tools.
- The importance of **Model Selection**: Why specialized Embedding models (MiniLM) differ from Chat models (Llama).
- **Prompt Engineering:** How to use "System Instructions" to force specific behaviors (like formatting links or overriding data).
- **API Resilience:** Debugging HTTP 500 errors and switching providers (Hugging Face -> Groq) to ensure uptime.

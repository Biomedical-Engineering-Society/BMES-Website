# BMES TMU - Official Website & AI Assistant

> The official repository for the Biomedical Engineering Society (Toronto Metropolitan University Chapter).
> Featuring a Next.js frontend and a custom RAG (Retrieval Augmented Generation) Chatbot.

## About The Project

This platform serves two purposes:

1. **The Website:** A hub for events, team info, and resources for BME students.
2. **The AI Assistant:** A context-aware chatbot that has "read" our constitution and event schedules to answer student questions instantly.

## Tech Stack

We are using a modern, industry-standard stack:

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Language:** TypeScript
- **AI/Vector DB:** Supabase (pgvector) + Groq (Llama 3.1) + LangChain

## Project Structure (Where to Work)

To avoid merge conflicts, please stick to your assigned workspace:

| Page          | Owner      | Folder Path                                                 |
| :------------ | :--------- | :---------------------------------------------------------- |
| **Home**      | Hassan     | `src/app/page.tsx`                                          |
| **About Us**  | Nithieshan | `src/app/about/page.tsx`                                    |
| **Contact**   | Haris      | `src/app/contact/page.tsx`                                  |
| **Team**      | Aydin      | `src/app/team/page.tsx`                                     |
| **Events/AI** | Samin      | `src/app/events/page.tsx` & `src/components/ChatWidget.tsx` |

## Chatbot Architecture

The AI Assistant uses a **Hybrid RAG Architecture**:

1.  **Ingestion:** The script `scripts/ingest.ts` scans PDFs in `/public/media`, chunks them, and stores embeddings in Supabase.
2.  **Retrieval:** User queries are converted to vectors (via Hugging Face) to find relevant club documents.
3.  **Generation:** Relevant facts are sent to **Groq (Llama 3.1)** to generate an accurate answer without hallucinations.

## Getting Started

Please read the `TEAM-INSTRUCTIONS.txt`

### Prerequisites

- Node.js & npm installed.

"use client";
import ReactMarkdown from "react-markdown";
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input) return;
    setLoading(true);
    setResponse(null); // Clear screen while thinking

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-10 bg-gray-50 text-black font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">BMES RAG Bot Test</h1>

        {/* INPUT AREA */}
        <div className="flex gap-2">
          <input
            className="flex-1 p-3 border border-gray-300 rounded shadow-sm"
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Thinking..." : "Ask"}
          </button>
        </div>

        {/* RESULTS AREA */}
        {response && (
          <div className="space-y-6">
            {/* 1. THE AI ANSWER (New!) */}
            <div className="bg-white p-6 rounded-lg shadow border border-blue-200">
              <h2 className="text-xl font-bold mb-4 text-blue-600">
                AI Answer
              </h2>
              <div className="prose text-gray-800 leading-relaxed">
                <ReactMarkdown>{response.answer}</ReactMarkdown>
              </div>
            </div>

            {/* 2. THE RAW CHUNKS (Your old yellow boxes) */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200 opacity-90">
              <h2 className="text-lg font-bold mb-4 text-gray-700">
                Source Context (Debug)
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                I looked at <strong>{response.matches?.length || 0}</strong>{" "}
                chunks to generate that answer:
              </p>

              <div className="space-y-4">
                {response.matches?.map((chunk: any, i: number) => (
                  <div
                    key={i}
                    className="p-4 bg-yellow-50 border border-yellow-200 rounded"
                  >
                    <p className="font-bold text-xs text-yellow-800 uppercase mb-2">
                      Source: {chunk.metadata.source.split("/").pop()}
                    </p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                      {chunk.pageContent}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import ReactMarkdown from "react-markdown";
import { useState, useRef, useEffect } from "react";

// Define what a message looks like
type Message = {
  role: "user" | "ai";
  content: string;
  sources?: any[]; // Optional sources for AI messages
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

  // OLD: const [response, setResponse] = useState(null);
  // NEW: Store an array of messages
  const [messages, setMessages] = useState<Message[]>([]);

  const [loading, setLoading] = useState(false);

  // Auto-scroll to bottom when new message arrives
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // 1. Add User Message immediately
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    // 2. Clear Input and Set Loading
    const currentInput = input; // Save for API call
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: currentInput }),
      });
      const data = await res.json();

      // 3. Add AI Message
      const aiMessage: Message = {
        role: "ai",
        content: data.answer,
        sources: data.matches, // Save sources if you want to show them
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Sorry, something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="mb-4 w-[400px] h-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* Header */}
          <div className="bg-blue-600 p-4 flex justify-between items-center text-white shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <h3 className="font-bold text-sm">BMES Assistant</h3>
                <p className="text-xs text-blue-100 opacity-80">
                  Powered by Llama 3
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-700 w-8 h-8 rounded-full flex items-center justify-center transition"
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-20">
                <p className="text-4xl mb-2">👋</p>
                <p className="text-sm">Hi! Ask me about BMES.</p>
              </div>
            )}

            {/* Loop through history */}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none" // User Bubble
                      : "bg-white text-gray-800 border border-gray-100 rounded-bl-none" // AI Bubble
                  }`}
                >
                  {msg.role === "ai" ? (
                    <div className="prose prose-sm max-w-none text-gray-800 prose-a:text-blue-600 prose-a:font-bold hover:prose-a:text-blue-800 prose-p:leading-relaxed prose-p:mb-2 last:prose-p:mb-0">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm flex gap-1 items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}

            {/* Invisible div to auto-scroll to */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100">
            <div className="relative flex items-center">
              <input
                className="w-full p-3 pr-12 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-black placeholder-gray-400 transition-all"
                placeholder="Type a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="absolute right-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm w-8 h-8 flex items-center justify-center"
              >
                ➤
              </button>
            </div>
            <p className="text-[10px] text-center text-gray-400 mt-2">
              AI can make mistakes. Check important info.
            </p>
          </div>
        </div>
      )}

      {/* TOGGLE BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:scale-105 transition-all duration-300"
      >
        <span className="text-2xl group-hover:hidden">💬</span>
        <span className="text-xl hidden group-hover:block">✕</span>
      </button>
    </div>
  );
}

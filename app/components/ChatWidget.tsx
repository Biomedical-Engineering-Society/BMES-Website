"use client";

import ReactMarkdown from "react-markdown";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChatIcon, CloseIcon, SendIcon } from "./BrandIcons";
import { ASSISTANT_NAME, CONTACT } from "@/lib/site";

type Message = {
  role: "user" | "ai";
  content: string;
};

const SUGGESTED_PROMPTS = [
  "When is the next event?",
  "Where do I find past exams?",
  "How do I join the exec team?",
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  // Closing the panel unmounts it, so focus has to be handed back deliberately
  // or it falls to document.body and keyboard users lose their place.
  const close = useCallback(() => {
    setIsOpen(false);
    launcherRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // Esc closes the panel from anywhere inside it.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || loading) return;

      setMessages((prev) => [...prev, { role: "user", content: question }]);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          body: JSON.stringify({ message: question }),
        });
        const data = await res.json();

        // A failed request still resolves, so without this an HTTP 500 would
        // append a message whose content is undefined and render an empty bubble.
        if (!res.ok || typeof data.answer !== "string") {
          throw new Error(data.error ?? "Chat request failed");
        }

        setMessages((prev) => [...prev, { role: "ai", content: data.answer }]);
      } catch (error) {
        console.error(error);
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content: `Sorry, something went wrong on my end. Try again in a moment, or email ${CONTACT.email}.`,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading],
  );

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3.5 md:bottom-[34px] md:right-[34px]">
      {isOpen && (
        <div
          role="dialog"
          aria-label={`Ask ${ASSISTANT_NAME}, the BMES student assistant`}
          className="flex h-[min(600px,calc(100dvh-9rem))] w-[min(356px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-hairline bg-white shadow-[0_30px_60px_-30px_rgba(7,27,51,0.55)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-4 bg-navy px-5 py-4 text-white">
            <span className="flex flex-col gap-[3px]">
              <span className="font-display text-lg font-bold leading-none">
                Ask {ASSISTANT_NAME}
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-on-navy-soft">
                BMES student assistant
              </span>
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Close chat"
              className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-white/12 text-white transition-colors hover:bg-white/25"
            >
              <CloseIcon size={16} />
            </button>
          </div>

          {/* Conversation. role="log" so a screen reader announces replies as
              they arrive instead of the panel updating silently. */}
          <div
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
            className="scrollbar-slim flex-1 space-y-3.5 overflow-y-auto bg-surface-2 p-5"
          >
            {messages.length === 0 && (
              <div className="flex flex-col gap-2.5">
                <p className="text-sm leading-relaxed text-muted">
                  Courses, the exam bank, upcoming events, joining a committee. Ask away.
                </p>
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => send(prompt)}
                    className="rounded-[10px] border border-hairline bg-white px-3.5 py-3 text-left text-sm font-medium text-ink transition-colors hover:border-brand hover:bg-brand-tint"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    msg.role === "user"
                      ? "rounded-br-md bg-brand text-white"
                      : "rounded-bl-md border border-hairline bg-white text-ink shadow-[0_2px_10px_rgba(7,27,51,0.05)]"
                  }`}
                >
                  {msg.role === "ai" ? (
                    <div className="chat-md">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-hairline bg-white px-4 py-3">
                  <span className="sr-only" role="status">
                    Thinking
                  </span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand/60" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand/60 [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand/60 [animation-delay:240ms]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <div className="border-t border-hairline bg-white p-3">
            <div className="relative flex items-center rounded-full border border-hairline bg-[#f7f9fd] p-1">
              <label htmlFor="chat-input" className="sr-only">
                Ask {ASSISTANT_NAME} a question
              </label>
              <input
                id="chat-input"
                ref={inputRef}
                className="w-full bg-transparent py-2 pl-4 pr-11 text-sm text-ink outline-none placeholder:text-muted"
                placeholder="Type a question..."
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") send(input);
                }}
              />
              <button
                type="button"
                onClick={() => send(input)}
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="absolute right-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-[#c3cede]"
              >
                <SendIcon />
              </button>
            </div>
            <p className="mt-2 text-center text-[12px] text-muted">
              AI can make mistakes. Check important info.
            </p>
          </div>
        </div>
      )}

      <button
        ref={launcherRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close chat" : `Ask ${ASSISTANT_NAME}, the BMES student assistant`}
        className="inline-flex items-center gap-3 rounded-full bg-brand px-5 py-4 text-[15px] font-bold text-white shadow-[0_18px_36px_-18px_rgba(21,108,206,0.9)] transition-colors hover:bg-brand-hover md:px-6"
      >
        {isOpen ? <CloseIcon size={20} /> : <ChatIcon />}
        <span className="hidden sm:inline">Ask {ASSISTANT_NAME}</span>
      </button>
    </div>
  );
}

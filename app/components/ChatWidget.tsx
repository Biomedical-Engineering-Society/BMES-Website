"use client";

import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChatIcon, CloseIcon, SendIcon } from "./BrandIcons";
import { ASSISTANT_NAME, CONTACT } from "@/lib/site";

type Message = {
  role: "user" | "ai";
  content: string;
};

const SUGGESTED_PROMPTS = [
  "What events do you run?",
  "Where do I find past exams?",
  "Who is on the exec team?",
];

/**
 * The assistant links to pages of this site. Route those through next/link so
 * they navigate client side and keep the page transition, and send anything
 * external to a new tab so the conversation is not lost.
 */
const markdownComponents: Components = {
  a({ href, children }) {
    const target = href ?? "";
    if (target.startsWith("/")) {
      return <Link href={target}>{children}</Link>;
    }
    return (
      <a href={target} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  /** Silences the launcher's attention ring once the visitor has engaged once. */
  const [hasOpened, setHasOpened] = useState(false);
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
                      <ReactMarkdown components={markdownComponents}>{msg.content}</ReactMarkdown>
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

      {/* A plain circular launcher in a softened red drawn from the logo's ECG
          line. The echo ring settles the moment the visitor opens the chat, so
          it never nags someone who already found it. */}
      <div className="relative">
        {!isOpen && !hasOpened && (
          <>
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-pulse/35 [animation:chatEcho_2.8s_cubic-bezier(0,0,0.2,1)_infinite]"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-pulse/25 [animation:chatEcho_2.8s_cubic-bezier(0,0,0.2,1)_infinite_700ms]"
            />
          </>
        )}

        <button
          ref={launcherRef}
          type="button"
          onClick={() => {
            setHasOpened(true);
            setIsOpen((open) => !open);
          }}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close chat" : `Ask ${ASSISTANT_NAME}, the BMES student assistant`}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-pulse text-white shadow-[0_14px_30px_-16px_rgba(169,1,35,0.7)] transition-[background-color,transform] duration-200 hover:bg-crimson active:scale-95"
        >
          {isOpen ? <CloseIcon size={22} /> : <ChatIcon size={24} />}

          {/* Name on hover, so the button stays a button. */}
          <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg bg-navy px-3 py-2 text-[13px] font-bold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 max-md:hidden">
            Ask {ASSISTANT_NAME}
          </span>
        </button>
      </div>
    </div>
  );
}

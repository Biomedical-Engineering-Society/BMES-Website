"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { CONTACT } from "@/lib/site";

type ContactFormData = {
  name: string;
  email: string;
  subject?: string;
  message: string;
};

type Status = { kind: "idle" } | { kind: "sent" } | { kind: "error"; message: string };

const FIELD_BASE =
  "w-full rounded-[10px] border bg-white px-4 py-3 text-[15px] text-ink transition-colors placeholder:text-muted focus:border-brand focus:outline-none";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, dirtyFields },
    reset,
  } = useForm<ContactFormData>({
    mode: "onBlur",
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const onSubmit = async (data: ContactFormData) => {
    setStatus({ kind: "idle" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));

      if (res.ok && body.success) {
        reset();
        setStatus({ kind: "sent" });
      } else {
        setStatus({
          kind: "error",
          message:
            body.error || `We could not send that. Please email ${CONTACT.email} instead.`,
        });
      }
    } catch {
      setStatus({
        kind: "error",
        message: `We could not reach the server. Please email ${CONTACT.email} instead.`,
      });
    }
  };

  const borderFor = (field: keyof ContactFormData) => {
    if (errors[field]) return "border-crimson";
    if (dirtyFields[field]) return "border-brand-border";
    return "border-hairline-strong";
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-5" noValidate>
      <div className="flex flex-col gap-2">
        <h2 className="t-band">Send us a message</h2>
        <p className="text-[15px] text-muted">
          Fields marked with an asterisk are required. We usually reply within a few days.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-name" className="text-sm font-semibold text-navlink">
          Name <span className="text-crimson">*</span>
        </label>
        <input
          id="contact-name"
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
          className={`${FIELD_BASE} ${borderFor("name")}`}
          {...register("name", {
            required: "Please tell us your name.",
            minLength: { value: 2, message: "That looks a little short." },
          })}
        />
        {errors.name && (
          <p id="contact-name-error" role="alert" className="text-[13px] font-medium text-crimson">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-email" className="text-sm font-semibold text-navlink">
          Email <span className="text-crimson">*</span>
        </label>
        <input
          id="contact-email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          className={`${FIELD_BASE} ${borderFor("email")}`}
          {...register("email", {
            required: "We need an email to reply to.",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email address.",
            },
          })}
        />
        {errors.email && (
          <p id="contact-email-error" role="alert" className="text-[13px] font-medium text-crimson">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-subject" className="text-sm font-semibold text-navlink">
          Subject
        </label>
        <input
          id="contact-subject"
          className={`${FIELD_BASE} ${borderFor("subject")}`}
          {...register("subject")}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-message" className="text-sm font-semibold text-navlink">
          Message <span className="text-crimson">*</span>
        </label>
        <textarea
          id="contact-message"
          rows={6}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className={`${FIELD_BASE} resize-y ${borderFor("message")}`}
          {...register("message", {
            required: "Let us know what you would like to ask.",
            minLength: { value: 10, message: "A little more detail would help." },
          })}
        />
        {errors.message && (
          <p
            id="contact-message-error"
            role="alert"
            className="text-[13px] font-medium text-crimson"
          >
            {errors.message.message}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={isSubmitting} className="btn btn-primary disabled:opacity-60">
          {isSubmitting ? "Sending..." : "Send message"}
        </button>

        <p aria-live="polite" className="text-[14px] font-semibold">
          {status.kind === "sent" && (
            <span className="text-brand">Thanks, your message is on its way.</span>
          )}
          {status.kind === "error" && <span className="text-crimson">{status.message}</span>}
        </p>
      </div>
    </form>
  );
}

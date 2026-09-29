"use client";

import { useActionState } from "react";
import { requestAccess, type RequestState } from "./actions";
import { fieldClass, labelClass } from "../components/formStyles";

export default function RequestAccessForm() {
  const [state, action, pending] = useActionState<RequestState, FormData>(requestAccess, {});

  if (state.done) {
    return (
      <p role="status" className="mt-5 rounded-lg bg-brand-tint px-4 py-3 text-sm font-semibold text-brand">
        Request sent. An owner will review it, then you can sign in again.
      </p>
    );
  }

  return (
    <form action={action} className="mt-5 flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className={labelClass}>Note for the owners (optional)</span>
        <textarea
          name="note"
          rows={3}
          maxLength={300}
          placeholder="e.g. I'm the new events coordinator."
          className={fieldClass}
        />
      </label>
      {state.error && (
        <p role="alert" className="text-sm font-semibold text-crimson">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-60">
        {pending ? "Sending…" : "Request access"}
      </button>
    </form>
  );
}

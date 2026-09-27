"use client";

import { useActionState } from "react";
import { login, type LoginState } from "../actions";
import { fieldClass, labelClass } from "../components/formStyles";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="mt-6 flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className={labelClass}>Your name</span>
        <input name="name" autoComplete="name" required maxLength={40} className={fieldClass} />
      </label>
      <label className="flex flex-col gap-2">
        <span className={labelClass}>Admin password</span>
        <input name="password" type="password" autoComplete="current-password" required className={fieldClass} />
      </label>
      {state.error && (
        <p role="alert" className="rounded-lg bg-crimson/10 px-4 py-3 text-sm font-semibold text-crimson">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-60">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { endSession, startSession } from "@/lib/admin/session";
import { adminConfigured, passwordEnabled } from "@/lib/admin/sessionToken";

export type LoginState = { error?: string };

/** Hashing first gives equal-length buffers, so the comparison takes the same time either way. */
function passwordMatches(attempt: string): boolean {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(attempt), digest(process.env.ADMIN_PASSWORD ?? ""));
}

/**
 * The shared-password fallback. It only ever grants editor rights, so it can
 * edit content but never change who has access.
 */
export async function passwordLogin(_previous: LoginState, formData: FormData): Promise<LoginState> {
  if (!adminConfigured() || !passwordEnabled()) return { error: "Password sign-in is turned off. Use Google." };

  // Keep it on one line and short: it ends up in commit messages.
  const name = String(formData.get("name") ?? "").replace(/\s+/g, " ").trim().slice(0, 40);
  const password = String(formData.get("password") ?? "");

  if (!name) return { error: "Add your name, so changes show who made them." };
  if (!passwordMatches(password)) {
    // Slows down anyone guessing. The password itself should be a long passphrase.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { error: "That password is not right." };
  }

  await startSession({ name, email: null, role: "editor", method: "password" });
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}

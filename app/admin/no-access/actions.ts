"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createRequest, resolveAccess } from "@/lib/admin/access";
import { notifyOwnersOfRequest } from "@/lib/admin/notify";
import { endSession, getPendingIdentity } from "@/lib/admin/session";

export type RequestState = { error?: string; done?: boolean };

export async function requestAccess(_previous: RequestState, formData: FormData): Promise<RequestState> {
  const identity = await getPendingIdentity();
  if (!identity) return { error: "Your sign-in expired. Sign in with Google again." };

  // Approved since they signed in? Send them to sign in properly instead.
  const access = await resolveAccess(identity.email);
  if (access === "owner" || access === "editor") redirect("/admin/login");

  const note = String(formData.get("note") ?? "").trim().slice(0, 300);
  try {
    const result = await createRequest(identity.email, identity.name, note);
    if (result === "created") {
      const host = (await headers()).get("host") ?? "bmes-tmu.vercel.app";
      const origin = `${host.startsWith("localhost") ? "http" : "https"}://${host}`;
      await notifyOwnersOfRequest({ ...identity, note }, origin);
    }
    return { done: true };
  } catch (error) {
    console.error(error);
    return { error: "The request could not be sent just now. Try again in a minute." };
  }
}

export async function switchAccount(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}

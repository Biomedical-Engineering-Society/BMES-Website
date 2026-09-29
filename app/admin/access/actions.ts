"use server";

import { revalidatePath } from "next/cache";
import {
  AccessError,
  addMember,
  approveRequest,
  declineRequest,
  isBackupOwner,
  removeMember,
  setRole,
} from "@/lib/admin/access";
import { actorLabel, getAdmin } from "@/lib/admin/session";
import type { AdminRole } from "@/lib/admin/sessionToken";

export type ActionResult = { error?: string };

const ROLES: AdminRole[] = ["owner", "editor"];

/** Every change here is owner-only, checked again on the server regardless of what the page showed. */
async function asOwner(change: (by: string) => Promise<void>): Promise<ActionResult> {
  const admin = await getAdmin();
  if (admin?.role !== "owner") return { error: "Only owners can manage access." };
  try {
    await change(actorLabel(admin));
    revalidatePath("/admin/access");
    revalidatePath("/admin");
    return {};
  } catch (error) {
    if (error instanceof AccessError) return { error: error.message };
    console.error(error);
    return { error: "That did not go through. Try again." };
  }
}

function checkRole(role: string): AdminRole {
  if (!ROLES.includes(role as AdminRole)) throw new AccessError("Unknown role.");
  return role as AdminRole;
}

function checkEditable(email: string) {
  if (isBackupOwner(email)) throw new AccessError("Backup owners are set in Vercel and cannot be changed here.");
}

export async function approve(id: string, role: string) {
  return asOwner((by) => approveRequest(id, checkRole(role), by));
}

export async function decline(id: string) {
  return asOwner((by) => declineRequest(id, by));
}

export async function add(email: string, role: string) {
  return asOwner((by) => addMember(email, checkRole(role), by));
}

export async function changeRole(email: string, role: string) {
  return asOwner(async () => {
    checkEditable(email);
    await setRole(email, checkRole(role));
  });
}

export async function remove(email: string) {
  return asOwner(async () => {
    checkEditable(email);
    await removeMember(email);
  });
}

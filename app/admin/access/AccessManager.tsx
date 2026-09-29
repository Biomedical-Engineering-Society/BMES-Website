"use client";

import { useState, useTransition } from "react";
import type { AccessRequest, Member } from "@/lib/admin/access";
import { add, approve, changeRole, decline, remove, type ActionResult } from "./actions";
import { fieldClass, labelClass } from "../components/formStyles";

const when = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" }) : "Never";

export default function AccessManager({
  requests,
  members,
  backupOwners,
  currentEmail,
  canEdit,
}: {
  requests: AccessRequest[];
  members: Member[];
  backupOwners: string[];
  currentEmail: string | null;
  canEdit: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("editor");

  const run = (action: () => Promise<ActionResult>, after?: () => void) =>
    startTransition(async () => {
      setError(null);
      const result = await action();
      if (result.error) setError(result.error);
      else after?.();
    });

  const listed = members.filter((member) => !backupOwners.includes(member.email));

  return (
    <div className="flex flex-col gap-10">
      {error && (
        <p role="alert" className="rounded-xl border border-crimson/30 bg-crimson/5 px-5 py-4 text-sm font-semibold text-crimson">
          {error}
        </p>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-semibold text-ink">
          Requests {requests.length > 0 && <span className="text-crimson">({requests.length})</span>}
        </h2>
        {requests.length === 0 ? (
          <p className="text-muted">No one is waiting.</p>
        ) : (
          <ul className="card divide-y divide-hairline">
            {requests.map((request) => (
              <li key={request.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <div className="min-w-[220px] flex-1">
                  <p className="font-semibold text-ink">{request.name ?? request.email}</p>
                  <p className="text-sm text-muted">
                    {request.email} · asked {when(request.created_at)}
                  </p>
                  {request.note && <p className="mt-1 text-sm text-body">“{request.note}”</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={pending} onClick={() => run(() => approve(request.id, "editor"))} className="btn btn-primary btn-sm disabled:opacity-60">
                    Approve as editor
                  </button>
                  <button type="button" disabled={pending} onClick={() => run(() => approve(request.id, "owner"))} className="btn btn-outline btn-sm disabled:opacity-60">
                    As owner
                  </button>
                  <button type="button" disabled={pending} onClick={() => run(() => decline(request.id))} className="btn btn-sm text-crimson disabled:opacity-60">
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-semibold text-ink">People with access</h2>
        <ul className="card divide-y divide-hairline">
          {backupOwners.map((email) => {
            const name = members.find((member) => member.email === email)?.name;
            return (
            <li key={email} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <div className="min-w-[220px] flex-1">
                <p className="font-semibold text-ink">
                  {name ?? email} {email === currentEmail && <span className="text-sm font-normal text-muted">(you)</span>}
                </p>
                {name && <p className="text-sm text-muted">{email}</p>}
              </div>
              <span className="rounded-full bg-navy px-3 py-1 text-xs font-bold text-white">Backup owner</span>
              <span className="text-xs text-muted">Set in Vercel</span>
            </li>
            );
          })}
          {listed.map((member) => (
            <li key={member.email} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <div className="min-w-[220px] flex-1">
                <p className="font-semibold text-ink">
                  {member.name ?? member.email} {member.email === currentEmail && <span className="text-sm font-normal text-muted">(you)</span>}
                </p>
                <p className="text-sm text-muted">
                  {member.email} · last signed in {when(member.last_sign_in)}
                </p>
              </div>
              <select
                value={member.role}
                disabled={pending || !canEdit}
                onChange={(event) => run(() => changeRole(member.email, event.target.value))}
                aria-label={`Role for ${member.email}`}
                className="rounded-lg border border-hairline-strong bg-white px-3 py-2 text-sm"
              >
                <option value="editor">Editor</option>
                <option value="owner">Owner</option>
              </select>
              {confirmRemove === member.email ? (
                <span className="flex items-center gap-2">
                  <button type="button" disabled={pending} onClick={() => run(() => remove(member.email), () => setConfirmRemove(null))} className="btn btn-sm bg-crimson text-white disabled:opacity-60">
                    Yes, remove
                  </button>
                  <button type="button" onClick={() => setConfirmRemove(null)} className="btn btn-outline btn-sm">
                    Cancel
                  </button>
                </span>
              ) : (
                <button type="button" disabled={pending || !canEdit} onClick={() => setConfirmRemove(member.email)} className="btn btn-sm text-crimson disabled:opacity-60">
                  Remove
                </button>
              )}
            </li>
          ))}
          {backupOwners.length === 0 && listed.length === 0 && <li className="px-5 py-4 text-muted">Nobody yet.</li>}
        </ul>
      </section>

      {canEdit && (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-xl font-semibold text-ink">Add someone directly</h2>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              run(() => add(newEmail, newRole), () => setNewEmail(""));
            }}
            className="card flex flex-wrap items-end gap-4 p-5"
          >
            <label className="flex min-w-[260px] flex-1 flex-col gap-2">
              <span className={labelClass}>Their Google email</span>
              <input type="email" required value={newEmail} onChange={(event) => setNewEmail(event.target.value)} className={fieldClass} />
            </label>
            <label className="flex flex-col gap-2">
              <span className={labelClass}>Role</span>
              <select value={newRole} onChange={(event) => setNewRole(event.target.value)} className={fieldClass}>
                <option value="editor">Editor</option>
                <option value="owner">Owner</option>
              </select>
            </label>
            <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
              Add
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

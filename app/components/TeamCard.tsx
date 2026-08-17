"use client";

import Image from "next/image";
import { useState } from "react";
import type { Member } from "@/lib/team";

/**
 * One person. Cards with a written bio expand it in place on click; cards
 * without one are not interactive.
 */
export default function TeamCard({ member }: { member: Member }) {
  const [open, setOpen] = useState(false);
  const hasBio = Boolean(member.bio?.trim());

  const identity = (
    <>
      <span className="font-display block text-[15px] font-semibold leading-tight tracking-[-0.015em] text-ink sm:text-base">
        {member.name}
      </span>
      <span className="mt-1 block text-[13px] font-semibold leading-snug text-brand">
        {member.role}
      </span>
    </>
  );

  return (
    <li className="card card-hover overflow-hidden" data-reveal="">
      <div className="relative aspect-[4/5] bg-placeholder">
        <Image
          src={`/members/${member.image}`}
          alt={member.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover"
        />
      </div>

      <div className="p-4">
        {hasBio ? (
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            className="w-full text-left"
          >
            {identity}
            <span className="mt-2 inline-block text-[12px] font-bold uppercase tracking-[0.12em] text-muted">
              {open ? "Less" : "Read bio"}
            </span>
          </button>
        ) : (
          <div>{identity}</div>
        )}

        {hasBio && open && (
          <p className="mt-3 border-t border-hairline pt-3 text-[13px] leading-relaxed text-muted">
            {member.bio}
          </p>
        )}
      </div>
    </li>
  );
}

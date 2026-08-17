import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import TeamCard from "../components/TeamCard";
import { TEAM, TEAM_YEAR } from "@/lib/team";

export const metadata: Metadata = {
  title: "Team",
  description:
    "The executives, directors and first year representatives running the Biomedical Engineering Society at Toronto Metropolitan University.",
};

export default function TeamPage() {
  return (
    <>
      {/* ================================================================
          Header
          ================================================================ */}
      <section className="relative overflow-hidden bg-navy text-white">
        {/* Lighter than the other photo heroes: the point of this one is the
            people in it, so the image carries more of the frame and the scrim
            only does as much as the type needs. */}
        <Image
          src="/media/Group_photo.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(100deg,rgba(7,27,51,0.9)_0%,rgba(7,27,51,0.66)_48%,rgba(7,27,51,0.32)_100%)]"
          aria-hidden="true"
        />

        {/* max-width goes on the inner block, never on .shell itself, or it
            overrides the shell width and centres the column. */}
        <div className="shell relative z-10 py-16 md:py-24">
          <div className="flex max-w-[820px] flex-col items-start gap-4">
            <span className="eyebrow eyebrow-on-dark">Our team</span>
            <h1 className="t-page-sm">Meet the people behind it.</h1>
            <p className="t-lead max-w-[640px] text-on-navy">
              Connecting students across campus with a passion for biomedical engineering. Every
              workshop, panel and conference on this site is run by the people below.
            </p>

            {/* Facts as quiet chips rather than a ruled stat row, which cut
                across the photograph. */}
            <ul className="mt-3 flex flex-wrap gap-2.5">
              <li className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[13px] font-semibold text-white backdrop-blur-sm">
                {TEAM_YEAR} <span className="font-normal text-on-navy">academic year</span>
              </li>
              <li className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[13px] font-semibold text-white backdrop-blur-sm">
                POD 377 <span className="font-normal text-on-navy">Podium Building</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ================================================================
          Roster
          ================================================================ */}
      {TEAM.map((group, index) => (
        <section
          key={group.title}
          className={index % 2 === 1 ? "border-y border-hairline bg-surface" : ""}
        >
          <div className="shell band">
            <div className="mb-8 flex flex-col gap-3" data-reveal="">
              <span className="eyebrow">{group.title}</span>
              <h2 className="t-section-sm">{group.blurb}</h2>
            </div>

            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
              {group.members.map((member) => (
                <TeamCard key={`${group.title}-${member.name}`} member={member} />
              ))}
            </ul>
          </div>
        </section>
      ))}

      {/* ================================================================
          CTA
          ================================================================ */}
      {/* Same light closing band as About and Events, so every page ends the
          same way instead of this one shouting in solid blue. */}
      <section className="border-t border-hairline bg-surface">
        <div className="shell band-sm flex flex-col items-start justify-between gap-8 md:flex-row md:items-center md:gap-12">
          <div className="flex flex-col gap-3">
            <h2 className="t-band">Want to get involved?</h2>
            <p className="max-w-[600px] text-[16px] leading-[1.6] text-muted md:text-[17px]">
              Membership is open to every biomedical engineering student at TMU. There is nothing to
              sign up for, just come to an event or say hello.
            </p>
          </div>
          <Link href="/contact" className="btn btn-primary">
            Contact the team →
          </Link>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import TeamCard from "../components/TeamCard";
import { TEAM, TEAM_SIZE } from "@/lib/team";

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
        <Image
          src="/media/Group_photo.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(100deg,rgba(7,27,51,0.94)_0%,rgba(7,27,51,0.8)_45%,rgba(9,38,74,0.58)_100%)]"
          aria-hidden="true"
        />

        <div className="shell relative z-10 flex flex-col gap-10 py-14 md:py-20">
          <div className="flex max-w-[820px] flex-col gap-4">
            <span className="eyebrow eyebrow-on-dark">Our team</span>
            <h1 className="t-page-sm">Meet the people behind it.</h1>
            <p className="t-lead max-w-[640px] text-on-navy">
              Connecting students across campus with a passion for biomedical engineering. Every
              workshop, panel and conference on this site is run by the people below.
            </p>
          </div>

          <dl className="flex flex-wrap gap-x-14 gap-y-6 border-t border-white/15 pt-8">
            <div className="flex flex-col gap-1">
              <dt className="t-num text-[30px] text-white md:text-[34px]">{TEAM_SIZE}</dt>
              <dd className="text-sm text-on-navy">Members on the team</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="t-num text-[30px] text-white md:text-[34px]">{TEAM.length}</dt>
              <dd className="text-sm text-on-navy">Portfolios across the chapter</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="t-num text-[30px] text-white md:text-[34px]">POD 377</dt>
              <dd className="text-sm text-on-navy">Where to find us</dd>
            </div>
          </dl>
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
      <section className="border-t border-hairline bg-brand text-white">
        <div className="shell band-sm flex flex-col items-start justify-between gap-8 md:flex-row md:items-center md:gap-12">
          <div className="flex flex-col gap-3">
            <h2 className="t-band">Want to get involved?</h2>
            <p className="max-w-[600px] text-[16px] leading-[1.6] text-on-brand md:text-[17px]">
              Membership is open to every biomedical engineering student at TMU. There is nothing to
              sign up for, just come to an event or say hello.
            </p>
          </div>
          <Link href="/contact" className="btn btn-white">
            Contact the team →
          </Link>
        </div>
      </section>
    </>
  );
}

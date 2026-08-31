import Image from "next/image";
import Link from "next/link";
import FeaturedEvents from "./components/FeaturedEvents";
import HeroVideo from "./components/HeroVideo";
import { featuredEvents, upcomingEvents } from "@/lib/events";
import { HOME_STATS, PILLARS, QUICK_LINKS } from "@/lib/site";

/** The featured showcase depends on today's date, so do not freeze it at deploy time. */
export const revalidate = 3600;

export default function Home() {
  const featured = featuredEvents(3);
  // Between terms nothing is upcoming and the showcase falls back to recent events.
  const hasUpcoming = upcomingEvents().length > 0;

  return (
    <>
      {/* ================================================================
          Hero
          ================================================================ */}
      <section className="relative flex min-h-[620px] items-center overflow-hidden bg-navy md:h-[780px]">
        <HeroVideo poster="/media/campus-poster.jpg" src="/media/campus.mp4" />

        {/* Scrim and vignette, so the headline stays legible over any frame. */}
        <div
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,27,51,0.78)_0%,rgba(7,27,51,0.55)_38%,rgba(7,27,51,0.62)_70%,rgba(7,27,51,0.88)_100%)]"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_50%,rgba(7,27,51,0)_35%,rgba(7,27,51,0.6)_100%)]"
          aria-hidden="true"
        />

        <div className="shell relative z-10 flex w-full flex-col items-center gap-6 py-24 text-center md:gap-7">
          <h1 className="t-hero text-white">
            Where academia meets <span className="text-salmon">industry</span>
          </h1>

          <p className="t-lead max-w-[68ch] text-on-navy">
            As the Biomedical Engineering Society, we aim to provide a collaborative platform for
            students to connect, grow, develop their skills, and explore their passion in
            biomedical engineering both academically and professionally
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-3.5">
            <Link href="/about" className="btn btn-white">
              About BMES
            </Link>
            <Link href="/events" className="btn btn-ghost-light">
              See upcoming events
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================
          Quick links
          ================================================================ */}
      <section aria-label="Quick links" className="border-b border-hairline">
        <ul className="quick-links">
          {QUICK_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full items-center bg-surface-2 py-6 transition-[background-color,box-shadow] duration-150 hover:bg-white hover:shadow-[inset_0_-3px_0_var(--color-brand)]"
              >
                <span className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                    {link.kicker}
                  </span>
                  <span className="font-display flex items-center gap-2 text-lg font-semibold tracking-[-0.015em] text-[#2b3a52]">
                    {link.label}
                    <span
                      className="text-base text-[#b3c0d1] transition-[color,transform] duration-150 group-hover:translate-x-0.5 group-hover:text-brand"
                      aria-hidden="true"
                    >
                      ↗
                    </span>
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* ================================================================
          About preview
          ================================================================ */}
      <section className="shell band grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-[72px]">
        <div className="flex flex-col gap-6" data-reveal="">
          <span className="eyebrow">Who we are</span>
          <h2 className="t-section">Bridging academia and industry in the biomedical field.</h2>
          <p className="text-[17px] leading-[1.65] text-body text-pretty md:text-lg">
            The Biomedical Engineering Society at TMU is a student-led organization dedicated to
            fostering innovation at the intersection of engineering and healthcare. Founded in
            2010, we are the official TMU chapter of the global Biomedical Engineering Society, and
            we have grown alongside the program ever since, adapting to what each new cohort of
            students actually needs.
          </p>
          <Link href="/about" className="link-underline">
            Read more about us →
          </Link>

          <dl className="mt-4 grid grid-cols-1 gap-7 border-t border-hairline pt-8 sm:grid-cols-3">
            {HOME_STATS.map((stat) => (
              <div key={stat.value} className="flex flex-col gap-1.5">
                <dt className="t-num text-[30px] text-brand md:text-[34px]">{stat.value}</dt>
                <dd className="text-sm leading-snug text-muted">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Collage */}
        <div
          className="grid grid-cols-2 gap-3.5 [grid-template-rows:repeat(2,160px)] md:[grid-template-rows:repeat(2,210px)]"
          data-reveal=""
        >
          <div className="relative row-span-2 overflow-hidden rounded-[14px] bg-placeholder">
            <Image
              src="/media/Group_photo.jpg"
              alt="The BMES TMU team together at a chapter event"
              fill
              sizes="(max-width: 1024px) 50vw, 24vw"
              className="object-cover"
            />
          </div>
          <div className="relative overflow-hidden rounded-[14px] bg-placeholder">
            <Image
              src="/media/cubec.jpg"
              alt="BMES TMU members at a design competition"
              fill
              sizes="(max-width: 1024px) 50vw, 24vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-between overflow-hidden rounded-[14px] bg-navy p-5 md:p-6">
            <Image
              src="/brand/bmes-mark.png"
              alt=""
              width={124}
              height={124}
              className="h-11 w-11 object-contain brightness-0 invert opacity-90 md:h-[62px] md:w-[62px]"
            />
            <span className="font-display text-[17px] font-semibold leading-[1.25] text-white md:text-[19px]">
              A community that grows with you.
            </span>
          </div>
        </div>
      </section>

      {/* ================================================================
          Mission
          ================================================================ */}
      <section className="border-y border-hairline bg-surface">
        <div className="shell band">
          <div className="mb-11 flex flex-col justify-between gap-8 lg:flex-row lg:items-end lg:gap-12">
            <div className="flex max-w-[620px] flex-col gap-4" data-reveal="">
              <span className="eyebrow">Our mission</span>
              <h2 className="t-section-sm">
                Support and empower biomedical engineering students at TMU.
              </h2>
            </div>
            <p
              className="max-w-[470px] text-[16px] leading-[1.6] text-muted text-pretty md:text-[17px]"
              data-reveal=""
            >
              Accessible opportunities for skill-building, networking, mentorship and leadership,
              through programming that reflects the needs and values of our student body.
            </p>
          </div>

          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((pillar) => (
              <li
                key={pillar.num}
                className="card card-hover flex min-h-[216px] flex-col gap-3.5 p-7 pb-8"
                data-reveal=""
              >
                <span className="t-num flex h-10 w-10 items-center justify-center rounded-[10px] bg-brand-tint-2 text-[15px] text-brand">
                  {pillar.num}
                </span>
                <h3 className="t-card">{pillar.title}</h3>
                <p className="text-[15px] leading-[1.55] text-muted">{pillar.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ================================================================
          Featured events
          ================================================================ */}
      <section className="shell band">
        <FeaturedEvents
          events={featured}
          heading={hasUpcoming ? "What's coming up" : "Recent highlights"}
        />
      </section>
    </>
  );
}

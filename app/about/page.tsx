import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PhotoGallery, { type GalleryPhoto } from "../components/PhotoGallery";
import { CheckIcon } from "../components/BrandIcons";

export const metadata: Metadata = {
  title: "About",
  description:
    "Founded in 2010, BMES at Toronto Metropolitan University is the official student chapter of the global Biomedical Engineering Society.",
};

const FACTS = [
  { value: "2010", label: "Founded at Toronto Metropolitan University" },
  { value: "Official chapter", label: "Of the global Biomedical Engineering Society" },
  { value: "POD 377", label: "Our office in the Podium Building" },
];

const VALUES = [
  {
    num: "01",
    title: "Inclusive spaces",
    body: "Collaborative environments open to every student in the program.",
  },
  {
    num: "02",
    title: "Academia to industry",
    body: "Closing the gap between coursework and professional practice.",
  },
  {
    num: "03",
    title: "Wellness first",
    body: "Mental health and holistic student well-being, prioritized.",
  },
  {
    num: "04",
    title: "Technical exploration",
    body: "Creative problem-solving and hands-on design work.",
  },
];

const BENEFITS = [
  "Hands-on technical workshops that complement your coursework",
  "Career events, panels and networking with industry professionals",
  "Mentorship and guidance from upper-year students and alumni",
  "Leadership, collaboration and communication experience through projects",
  "A supportive, student-driven community within biomedical engineering",
];

const HISTORY = [
  {
    year: "2010",
    title: "Chartered at TMU",
    body: "BMES becomes the official TMU student chapter of the global Biomedical Engineering Society.",
  },
  {
    year: "Since",
    title: "Grown with the program",
    body: "The chapter has evolved alongside the biomedical engineering program, adapting its initiatives each year.",
  },
  {
    year: "Today",
    title: "An active community",
    body: "Workshops, industry panels, design competitions and networking sessions throughout the academic year.",
  },
];

const GALLERY: GalleryPhoto[] = [
  { src: "/media/Group_photo.jpg", alt: "The BMES TMU team together at a chapter event" },
  { src: "/media/cubec.jpg", alt: "BMES TMU members at a design competition" },
  { src: "/media/About.png", alt: "Students at a BMES TMU networking night" },
  { src: "/media/DSC_0154.JPG", alt: "A BMES TMU workshop in progress" },
];

export default function AboutPage() {
  return (
    <>
      {/* ================================================================
          Photo hero
          ================================================================ */}
      <section className="relative flex min-h-[380px] items-center overflow-hidden bg-navy md:min-h-[470px]">
        <Image
          src="/media/Group_photo.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(100deg,rgba(7,27,51,0.92)_0%,rgba(7,27,51,0.76)_45%,rgba(9,38,74,0.55)_100%)]"
          aria-hidden="true"
        />
        {/* max-width goes on the inner block, never on .shell itself, or it
            overrides the shell width and centres the column. */}
        <div className="shell relative z-10 py-16 md:py-[78px]">
          <div className="flex max-w-[860px] flex-col gap-4.5">
            <span className="eyebrow eyebrow-on-dark">About us</span>
            <h1 className="t-page-sm text-white">
              A student-led community at the intersection of engineering and healthcare.
            </h1>
          </div>
        </div>
      </section>

      {/* ================================================================
          Who we are
          ================================================================ */}
      <section className="shell band grid gap-12 lg:grid-cols-[1fr_380px] lg:gap-[88px]">
        <div className="flex flex-col gap-6" data-reveal="">
          <span className="eyebrow">Who we are</span>
          <h2 className="t-section-sm">Bridging academia and industry in the biomedical field.</h2>
          <p className="text-[17px] leading-[1.65] text-body text-pretty md:text-[19px]">
            The Biomedical Engineering Society (BMES) at Toronto Metropolitan University is a
            student-led organization dedicated to fostering innovation at the intersection of
            engineering and healthcare. We provide a collaborative platform for students passionate
            about biomedical engineering to connect, develop their skills, and grow both
            academically and professionally.
          </p>
        </div>

        <dl
          className="flex flex-col border-t border-hairline pt-2 lg:border-l lg:border-t-0 lg:pl-[34px] lg:pt-0"
          data-reveal=""
        >
          {FACTS.map((fact) => (
            <div key={fact.value} className="flex flex-col gap-1.5 border-b border-hairline py-5">
              <dt className="t-num text-[24px] text-brand md:text-[26px]">{fact.value}</dt>
              <dd className="text-sm leading-snug text-muted">{fact.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ================================================================
          Mission
          ================================================================ */}
      <section className="border-y border-hairline bg-surface">
        <div className="shell band grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-[72px]">
          <div className="flex flex-col gap-6" data-reveal="">
            <span className="eyebrow">Our mission</span>
            <p className="font-display text-[clamp(1.35rem,2.4vw,1.875rem)] font-medium leading-[1.35] tracking-[-0.02em] text-ink text-pretty">
              To support and empower biomedical engineering students at TMU by promoting community,
              career development, and wellness.
            </p>
            <p className="text-[16px] leading-[1.65] text-muted text-pretty md:text-[17px]">
              We aim to provide accessible opportunities for skill-building, networking,
              mentorship, and leadership through innovative programming that reflects the needs and
              values of our student body.
            </p>
          </div>

          <ul className="flex flex-col" data-reveal="">
            {VALUES.map((value) => (
              <li
                key={value.num}
                className="flex items-start gap-4.5 border-b border-hairline py-5.5"
              >
                <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-brand-tint-2 text-[13px] font-bold text-brand">
                  {value.num}
                </span>
                <span className="flex flex-col gap-1.5">
                  <span className="font-display text-[19px] font-semibold tracking-[-0.015em]">
                    {value.title}
                  </span>
                  <span className="text-[15px] leading-[1.55] text-muted">{value.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ================================================================
          Why join
          ================================================================ */}
      <section className="shell band grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-6" data-reveal="">
          <span className="eyebrow">Why join</span>
          <h2 className="t-section-sm">What being part of BMES actually gets you.</h2>
          <ul className="mt-1 flex flex-col gap-3.5">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3.5">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                  <CheckIcon size={11} />
                </span>
                <span className="text-[16px] leading-[1.55] text-body md:text-[17px]">
                  {benefit}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="relative h-[320px] overflow-hidden rounded-[18px] bg-placeholder md:h-[420px] lg:h-[520px]"
          data-reveal=""
        >
          <Image
            src="/media/BMESConf.png"
            alt="The BMES Synapse conference at Toronto Metropolitan University"
            fill
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* ================================================================
          History
          ================================================================ */}
      <section className="bg-brand text-white">
        <div className="shell band">
          <div className="mb-12 flex max-w-[640px] flex-col gap-4" data-reveal="">
            <span className="eyebrow eyebrow-on-brand">Our history</span>
            <h2 className="t-section-sm">Growing alongside the program since 2010.</h2>
          </div>

          <ol
            className="grid gap-px border-t border-white/28 bg-white/28 md:grid-cols-3"
            data-reveal=""
          >
            {HISTORY.map((entry) => (
              <li key={entry.year} className="flex flex-col gap-3 bg-brand px-7 py-8 md:px-[30px]">
                <span className="t-num text-[26px] text-white md:text-[30px]">{entry.year}</span>
                <span className="font-display text-xl font-semibold tracking-[-0.015em] text-white">
                  {entry.title}
                </span>
                <p className="text-[15px] leading-[1.6] text-on-brand md:text-base">
                  {entry.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ================================================================
          Gallery
          ================================================================ */}
      <section className="shell band">
        <div className="mb-8 flex flex-col gap-4" data-reveal="">
          <span className="eyebrow">Gallery</span>
          <h2 className="t-section-sm">Moments from BMES TMU</h2>
        </div>
        <div data-reveal="">
          <PhotoGallery photos={GALLERY} />
        </div>
      </section>

      {/* ================================================================
          Team teaser
          ================================================================ */}
      <section className="border-t border-hairline bg-surface">
        <div className="shell band-sm flex flex-col items-start justify-between gap-8 md:flex-row md:items-center md:gap-12">
          <div className="flex flex-col gap-3">
            <h2 className="t-band">Meet the people behind it.</h2>
            <p className="max-w-[560px] text-[16px] leading-[1.6] text-muted md:text-[17px]">
              The executive team runs everything from the Synapse conference to drop-in wellness
              weeks.
            </p>
          </div>
          <Link href="/team" className="btn btn-primary">
            See the exec team →
          </Link>
        </div>
      </section>
    </>
  );
}

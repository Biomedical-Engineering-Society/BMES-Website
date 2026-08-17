import type { Metadata } from "next";
import ContactForm from "../components/ContactForm";
import {
  InstagramIcon,
  LinkedInIcon,
  LinktreeIcon,
  MailIcon,
  PinIcon,
} from "../components/BrandIcons";
import { CONTACT, LINKS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach the Biomedical Engineering Society at Toronto Metropolitan University. Find us in POD 377 in the Podium Building, or send us a message.",
};

const CHANNELS = [
  {
    label: "Email us",
    value: CONTACT.email,
    href: LINKS.email,
    Icon: MailIcon,
    external: false,
  },
  {
    label: "Instagram",
    value: LINKS.instagramHandle,
    href: LINKS.instagram,
    Icon: InstagramIcon,
    external: true,
  },
  {
    label: "LinkedIn",
    value: "BMES TMU Chapter",
    href: LINKS.linkedin,
    Icon: LinkedInIcon,
    external: true,
  },
  {
    label: "Linktree",
    value: "Every link in one place",
    href: LINKS.linktree,
    Icon: LinktreeIcon,
    external: true,
  },
];

export default function ContactPage() {
  return (
    <>
      {/* ================================================================
          Header
          ================================================================ */}
      <section className="bg-navy text-white">
        <div className="shell py-14 md:py-20">
          <div className="flex max-w-[860px] flex-col gap-4">
            <span className="eyebrow eyebrow-on-dark">Contact</span>
            <h1 className="t-page-sm">Get in touch with BMES.</h1>
            <p className="t-lead max-w-[620px] text-on-navy">
              Questions about an event, a collaboration, or joining a committee. Send us a message
              or drop by the office in the Podium Building.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================
          Form and channels
          ================================================================ */}
      <section className="shell band grid gap-12 lg:grid-cols-[1fr_400px] lg:gap-20">
        <div data-reveal="">
          <ContactForm />
        </div>

        <div className="flex flex-col gap-5" data-reveal="">
          <h2 className="t-band">Other ways to reach us</h2>

          <ul className="flex flex-col gap-3">
            {CHANNELS.map(({ label, value, href, Icon, external }) => (
              <li key={label}>
                <a
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="card card-hover flex items-center gap-4 p-4.5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-brand-tint-2 text-brand">
                    <Icon size={20} />
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="font-display text-[17px] font-semibold tracking-[-0.015em]">
                      {label}
                    </span>
                    <span className="text-sm text-muted">{value}</span>
                  </span>
                  <span className="ml-auto text-[#b3c0d1]" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div className="card flex items-start gap-4 p-4.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-brand-tint-2 text-brand">
              <PinIcon size={20} />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="font-display text-[17px] font-semibold tracking-[-0.015em]">
                Find the office
              </span>
              <span className="text-sm text-muted">
                {CONTACT.office}, {CONTACT.building}
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* ================================================================
          Visit us
          ================================================================ */}
      <section className="border-t border-hairline bg-surface">
        <div className="shell band grid gap-10 lg:grid-cols-[380px_1fr] lg:items-center lg:gap-16">
          <div className="flex flex-col gap-4" data-reveal="">
            <span className="eyebrow">Visit us</span>
            <h2 className="t-section-sm">Podium Building, room 377.</h2>
            <address className="flex flex-col gap-1 text-[16px] not-italic leading-relaxed text-muted md:text-[17px]">
              {CONTACT.addressLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>
            <a href={LINKS.email} className="link-underline">
              {CONTACT.email} →
            </a>
          </div>

          <div
            className="overflow-hidden rounded-[18px] border border-hairline bg-white"
            data-reveal=""
          >
            <iframe
              title="Map showing Toronto Metropolitan University"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2886.541015998281!2d-79.38181142382295!3d43.65771687110197!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d4cb35431c1395%3A0xe8ed8bd69125d6f4!2sToronto%20Metropolitan%20University!5e0!3m2!1sen!2sca!4v1769862199506!5m2!1sen!2sca"
              className="block h-[320px] w-full border-0 md:h-[420px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  );
}

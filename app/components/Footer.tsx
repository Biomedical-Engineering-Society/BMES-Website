import Image from "next/image";
import { InstagramIcon, LinkedInIcon, LinktreeIcon, MailIcon } from "./BrandIcons";
import { todayISO } from "@/lib/events";
import { CONTACT, LINKS } from "@/lib/site";

const SOCIALS = [
  { label: "Instagram", href: LINKS.instagram, Icon: InstagramIcon },
  { label: "LinkedIn", href: LINKS.linkedin, Icon: LinkedInIcon },
  { label: "Email", href: LINKS.email, Icon: MailIcon },
  { label: "Linktree", href: LINKS.linktree, Icon: LinktreeIcon },
];

export default function Footer() {
  const year = todayISO().slice(0, 4);

  return (
    <footer className="bg-navy-deep">
      <div className="shell flex flex-col items-start justify-between gap-9 py-11 md:flex-row md:items-center md:gap-12">
        <div className="flex flex-col gap-3">
          <Image
            src="/brand/bmes-banner.png"
            alt="Biomedical Engineering Society, Toronto Metropolitan University chapter"
            width={750}
            height={250}
            className="h-[62px] w-auto object-contain object-left opacity-85 brightness-0 invert md:h-[84px]"
          />
          <span className="text-[11px] font-semibold uppercase leading-relaxed tracking-[0.16em] text-footer-text md:text-xs">
            {CONTACT.office} · {CONTACT.building} · {CONTACT.email}
          </span>
        </div>

        <ul className="flex items-center gap-2.5">
          {SOCIALS.map(({ label, href, Icon }) => (
            <li key={label}>
              <a
                href={href}
                aria-label={label}
                target={href.startsWith("mailto:") ? undefined : "_blank"}
                rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                className="flex h-[34px] w-[34px] items-center justify-center rounded-lg text-footer-icon transition-colors duration-150 hover:text-white"
              >
                <Icon />
              </a>
            </li>
          ))}
        </ul>

        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-footer-text md:text-xs">
          © {year} BMES · TMU
        </span>
      </div>
    </footer>
  );
}

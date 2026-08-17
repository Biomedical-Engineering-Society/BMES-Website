/**
 * Single source of truth for everything that appears in more than one place:
 * navigation, contact details and outbound links.
 *
 * If a link or an address changes, change it here and it updates everywhere.
 */

export const SITE = {
  name: "Biomedical Engineering Society",
  shortName: "BMES TMU",
  university: "Toronto Metropolitan University",
  tagline: "Where academia meets industry.",
  description:
    "The Biomedical Engineering Society at Toronto Metropolitan University is a student-led community bridging academia and industry in the biomedical field.",
  url: "https://bmes-website.vercel.app",
} as const;

/**
 * Display name for the AI assistant. Used by the chat widget and by the chat
 * API's system prompt, so the bot never introduces itself as something the UI
 * does not call it. Rename here and it changes in both places.
 */
export const ASSISTANT_NAME = "Pulse";

export const CONTACT = {
  email: "bmes@torontomu.ca",
  office: "POD 377",
  building: "Podium Building",
  addressLines: ["Toronto Metropolitan University", "350 Victoria Street", "Toronto, ON M5B 2K3"],
} as const;

export const LINKS = {
  instagram: "https://www.instagram.com/bmes.tmu/",
  instagramHandle: "@bmes.tmu",
  linkedin: "https://www.linkedin.com/company/bmestmu",
  linktree: "https://linktr.ee/bmestmu",
  examBank: "https://mues.ca/services/academic/",
  email: `mailto:${CONTACT.email}`,
} as const;

export type NavItem = { label: string; href: string };

/** Text links in the navbar. Contact is the primary button, never a link. */
export const NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Team", href: "/team" },
  { label: "Events", href: "/events" },
];

export const QUICK_LINKS = [
  { kicker: "Academics", label: "MUES Exam Bank", href: LINKS.examBank },
  { kicker: "Follow", label: "Instagram", href: LINKS.instagram },
  { kicker: "Connect", label: "LinkedIn", href: LINKS.linkedin },
  { kicker: "Everything", label: "Linktree", href: LINKS.linktree },
] as const;

/** The four mission pillars, used on Home and echoed on About. */
export const PILLARS = [
  {
    num: "01",
    title: "Community",
    body: "Inclusive, collaborative spaces for every student in the program.",
  },
  {
    num: "02",
    title: "Career",
    body: "Networking, mentorship and leadership that reaches into industry.",
  },
  {
    num: "03",
    title: "Wellness",
    body: "Mental health and holistic student well-being, prioritized.",
  },
  {
    num: "04",
    title: "Design",
    body: "Technical exploration and creative problem-solving, hands-on.",
  },
] as const;

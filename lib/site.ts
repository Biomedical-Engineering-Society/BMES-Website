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

/**
 * The quick links band on the home page.
 *
 * `covers` is not rendered. It is what the assistant is told each link is for,
 * so a student asking "where do I find past exams" is answered rather than
 * turned away: the label alone does not say that the exam bank is where past
 * papers live.
 */
export const QUICK_LINKS = [
  {
    kicker: "Academics",
    label: "MUES Exam Bank",
    href: LINKS.examBank,
    covers: "past exams and past papers, course notes and academic resources, run by MUES",
  },
  {
    kicker: "Follow",
    label: "Instagram",
    href: LINKS.instagram,
    covers: "event announcements and day to day updates, the fastest way to reach us",
  },
  {
    kicker: "Connect",
    label: "LinkedIn",
    href: LINKS.linkedin,
    covers: "professional updates and alumni network",
  },
  {
    kicker: "Everything",
    label: "Linktree",
    href: LINKS.linktree,
    covers: "every BMES link in one place, including merch and sign up forms",
  },
] as const;

/**
 * Copy that appears on the pages, kept here rather than inside each page so the
 * assistant can be told what the site actually says. Editing it changes both the
 * page and what the bot knows.
 */

/** Stat row under the About preview on the home page. */
export const HOME_STATS = [
  { value: "2010", label: "Chartered at TMU" },
  { value: "POD 377", label: "Our office, Podium Building" },
  { value: "Official", label: "Student chapter of the global BMES" },
] as const;

/** Fact rail beside "Who we are" on the About page. */
export const ABOUT_FACTS = [
  { value: "2010", label: "Founded at Toronto Metropolitan University" },
  { value: "Official chapter", label: "Of the global Biomedical Engineering Society" },
  { value: "POD 377", label: "Our office in the Podium Building" },
] as const;

/** The four numbered values in the About mission band. */
export const ABOUT_VALUES = [
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
] as const;

/** The "Why join" checklist on the About page. */
export const ABOUT_BENEFITS = [
  "Hands-on technical workshops that complement your coursework",
  "Career events, panels and networking with industry professionals",
  "Mentorship and guidance from upper-year students and alumni",
  "Leadership, collaboration and communication experience through projects",
  "A supportive, student-driven community within biomedical engineering",
] as const;

/** The three-column history band on the About page. */
export const ABOUT_HISTORY = [
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

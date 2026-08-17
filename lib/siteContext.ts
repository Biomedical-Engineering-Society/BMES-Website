import {
  ALL_EVENTS,
  eventCta,
  formatLongDate,
  isPastEvent,
  todayISO,
  upcomingEvents,
} from "./events";
import { CONTACT, LINKS, PILLARS, SITE } from "./site";
import { TEAM, TEAM_YEAR } from "./team";

/**
 * The assistant's map of this website.
 *
 * Built from the same modules the pages render from, so it can never describe a
 * version of the site that no longer exists. Add an event to data/events.json or
 * a member to lib/team.ts and the chatbot knows about it on the next request,
 * with no separate document to re-ingest.
 *
 * This sits alongside the RAG context from the club's PDFs: the PDFs carry
 * policy and history, this carries what is actually on the site right now.
 */

/** Every route, so the assistant can point people at the right page. */
export const SITE_MAP = [
  {
    path: "/",
    name: "Home",
    covers: "Overview of the chapter, quick links, mission pillars and a featured events showcase.",
  },
  {
    path: "/about",
    name: "About",
    covers:
      "Who we are, the mission and its four values, why join, chapter history since 2010, and a photo gallery.",
  },
  {
    path: "/team",
    name: "Team",
    covers: `The ${TEAM_YEAR} executive team, their names and portfolios.`,
  },
  {
    path: "/events",
    name: "Events",
    covers:
      "Every event in a list view or on a month calendar, filterable by upcoming, past or all. Each event opens a details dialog.",
  },
  {
    path: "/contact",
    name: "Contact",
    covers:
      "A message form, every social channel, the office location and a campus map.",
  },
] as const;

function formatEvents(): string {
  const today = todayISO();
  if (ALL_EVENTS.length === 0) return "No events are listed on the site right now.";

  return ALL_EVENTS.map((event) => {
    const when = isPastEvent(event, today) ? "PAST" : "UPCOMING";
    const cta = eventCta(event, today);
    const link = cta.external ? cta.href : `${cta.href} (page on this site)`;
    return [
      `- ${event.title} [${when}]`,
      `  Date: ${formatLongDate(event.date)}`,
      `  Time: ${event.time}`,
      `  Where: ${event.location}`,
      `  Category: ${event.category}`,
      `  About: ${event.description}`,
      `  More: ${link}`,
    ].join("\n");
  }).join("\n");
}

function formatTeam(): string {
  return TEAM.map((group) => {
    const members = group.members.map((m) => `${m.name} (${m.role})`).join(", ");
    return `${group.title} for ${TEAM_YEAR}: ${members}`;
  }).join("\n");
}

/**
 * Rendered fresh per request so event dates stay correct as time passes.
 */
export function buildSiteContext(): string {
  const upcoming = upcomingEvents();
  const nextEvent = upcoming[0];

  return `
=== WHAT IS ON THIS WEBSITE ===
You are embedded in the BMES TMU website. These are its pages. When a question
is answered by one of them, link to it so the student can go straight there.

${SITE_MAP.map((page) => `- ${page.name} (${page.path}): ${page.covers}`).join("\n")}

=== THE CHAPTER ===
${SITE.name} at ${SITE.university}. Tagline: "${SITE.tagline}"
Founded 2010, the official TMU student chapter of the global Biomedical Engineering Society.
A student-led organization fostering innovation at the intersection of engineering and healthcare.
Membership is open to every biomedical engineering student at TMU. There is nothing to sign up
for and no fee: come to an event or say hello.

Mission: to support and empower biomedical engineering students at TMU by promoting community,
career development and wellness.
The four pillars, shown on the home page:
${PILLARS.map((p) => `- ${p.title}: ${p.body}`).join("\n")}

=== CONTACT AND LINKS ===
- Office: ${CONTACT.office}, ${CONTACT.building}, ${CONTACT.addressLines.join(", ")}
- Email: ${CONTACT.email}
- Instagram: ${LINKS.instagram} (${LINKS.instagramHandle})
- LinkedIn: ${LINKS.linkedin}
- Linktree: ${LINKS.linktree}
- MUES exam bank, linked from the home page quick links: ${LINKS.examBank}
- Contact form on the site: /contact

=== EVENTS CURRENTLY ON THE SITE (today is ${todayISO()}) ===
${
  nextEvent
    ? `The next event is ${nextEvent.title} on ${formatLongDate(nextEvent.date)}.`
    : "There are no upcoming events listed yet. Point people at /events and our Instagram for the next announcement."
}

${formatEvents()}

=== EXECUTIVE TEAM ===
${formatTeam()}
Do not give out any member's personal email or phone number; you do not have them.
Route all enquiries to ${CONTACT.email} or the contact page at /contact.

=== HOW TO LINK ===
Use markdown links to site pages, written as root-relative paths, for example
[the events page](/events) or [our team](/team). Never invent a page that is not
in the list above. Use full https URLs only for external links such as Instagram,
LinkedIn, Linktree, the exam bank, or an event's registration page.
`.trim();
}

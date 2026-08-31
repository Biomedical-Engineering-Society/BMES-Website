import {
  ALL_EVENTS,
  eventCta,
  formatLongDate,
  isPastEvent,
  todayISO,
  upcomingEvents,
} from "./events";
import { CONTACT, LINKS, SITE } from "./site";
import { TEAM, TEAM_YEAR } from "./team";

/**
 * The assistant's map of this website.
 *
 * Built from the same modules the pages render from, so it stays in step with
 * the site automatically: add an event to data/events.json or a member to
 * lib/team.ts and the assistant knows on the next request, with no document to
 * re-ingest. Sits alongside the RAG context from the club PDFs, which carry
 * policy and history.
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
    // No description here: it is already in the knowledge base, and repeating
    // it would make this the largest block in a prompt sent on every question.
    return `- ${event.title} [${when}] ${formatLongDate(event.date)}, ${event.time}, ${event.location}. ${event.category}. ${link}`;
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
${SITE.name} at ${SITE.university}. Founded 2010, the official TMU student chapter of the
global Biomedical Engineering Society. Open to every TMU student, no fee and nothing to
sign up for. Mission and pillars are in the knowledge base extracts.

=== CONTACT AND LINKS ===
- Office ${CONTACT.office}, ${CONTACT.building}, ${CONTACT.addressLines.join(", ")}
- MUES exam bank: ${LINKS.examBank}
- Contact form: /contact

=== EVENTS CURRENTLY ON THE SITE (today is ${todayISO()}) ===
${
  nextEvent
    ? `The next event is ${nextEvent.title} on ${formatLongDate(nextEvent.date)}.`
    : "There are no upcoming events listed yet. Point people at /events and our Instagram for the next announcement."
}

${formatEvents()}

=== EXECUTIVE TEAM ===
${formatTeam()}
Never give out a member's personal email address or phone number. Route every
enquiry to ${CONTACT.email} or the contact page at /contact.

=== HOW TO LINK ===
Site pages are root-relative markdown links, e.g. [the events page](/events).
Full https URLs only for external links such as Instagram or a registration page.
`.trim();
}

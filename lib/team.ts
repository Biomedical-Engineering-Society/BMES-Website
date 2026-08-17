/**
 * The BMES TMU roster.
 *
 * To update the team, edit this file only: add, remove or reorder members and
 * the Team page follows. `image` is a filename inside `public/members/`; leave
 * it as "default.jpg" until a portrait is supplied. `bio` is optional and only
 * renders when it is actually written.
 */

export type Member = {
  name: string;
  role: string;
  image: string;
  bio?: string;
};

export type TeamGroup = {
  /** Section heading on the Team page. */
  title: string;
  /** One line under the heading. */
  blurb: string;
  members: Member[];
};

/** Academic year this roster covers. Shown on the Team page. */
export const TEAM_YEAR = "2026 to 27";

/**
 * The 2026/27 executive team.
 *
 * Do not add phone numbers or personal email addresses. This page is public and
 * the chat assistant reads from this file; enquiries route through
 * bmes@torontomu.ca on the Contact page.
 *
 * Directors and first year representatives are not listed yet. Add a second
 * TeamGroup here when that roster is confirmed and the page picks it up.
 */
export const TEAM: TeamGroup[] = [
  {
    title: "Executives",
    blurb: "The team that sets direction for the chapter and answers for it.",
    members: [
      { name: "Ryson Yau", role: "President", image: "default.jpg" },
      { name: "Avril Sacramento", role: "Vice President", image: "default.jpg" },
      { name: "Saidolim Maxmudov", role: "VP of Finance", image: "default.jpg" },
      { name: "Chantelle DeSagun", role: "VP of Operations", image: "default.jpg" },
      { name: "Leo Lopez-Papic", role: "VP of Operations", image: "default.jpg" },
      { name: "Gabrielle Solano", role: "VP of Events", image: "default.jpg" },
      { name: "Raghangi Gunaseelan", role: "VP of Events", image: "default.jpg" },
      { name: "Theresa Cosentino", role: "VP of Communications", image: "default.jpg" },
      { name: "Hala Ayad", role: "VP of Communications", image: "default.jpg" },
      { name: "Noemi Gaitan-Ruiz", role: "VP of Marketing", image: "default.jpg" },
    ],
  },
];

export const TEAM_SIZE = TEAM.reduce((total, group) => total + group.members.length, 0);

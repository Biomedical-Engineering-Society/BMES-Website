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

export const TEAM: TeamGroup[] = [
  {
    title: "Executives",
    blurb: "The team that sets direction for the chapter and answers for it.",
    members: [
      { name: "Mark Yacoub", role: "President", image: "default.jpg" },
      { name: "Ryson Yau", role: "Vice President", image: "default.jpg" },
      { name: "Afrah Khan", role: "Advisor", image: "default.jpg" },
      { name: "Sachit Thakur", role: "Advisor", image: "default.jpg" },
      { name: "Alfonso Santiago", role: "Vice President of Marketing", image: "default.jpg" },
      { name: "Blair Gao", role: "Vice President of Events", image: "default.jpg" },
      { name: "David Faltaous", role: "Vice President of Events", image: "default.jpg" },
      { name: "Ricky Nong", role: "Vice President of Finance", image: "default.jpg" },
      {
        name: "Uma Sivaperuman",
        role: "Vice President of Communications",
        image: "default.jpg",
      },
      { name: "Yang Lu", role: "Vice President of Operations", image: "default.jpg" },
    ],
  },
  {
    title: "Communications",
    blurb: "Keeping members in the loop, on every channel.",
    members: [
      { name: "Kavin Manivannan", role: "Communications Director", image: "default.jpg" },
      { name: "Lior Monroy", role: "Communications Director", image: "default.jpg" },
      { name: "Mirna Zogheib", role: "Communications Director", image: "default.jpg" },
      { name: "Ronit Royan", role: "Communications Director", image: "default.jpg" },
      { name: "Shadid Tabeeb", role: "Communications Director", image: "default.jpg" },
      { name: "Varen Rajoo", role: "Communications Director", image: "default.jpg" },
      { name: "Vladimir Avila", role: "Communications Director", image: "default.jpg" },
      { name: "Wayne Thayaparan", role: "Communications Director", image: "default.jpg" },
    ],
  },
  {
    title: "Events",
    blurb: "Everything from the Synapse conference to drop-in wellness weeks.",
    members: [
      { name: "Astar Alia Al Akkadi", role: "Events Director", image: "default.jpg" },
      { name: "Divya Prajapati", role: "Events Director", image: "default.jpg" },
      { name: "Leonardo Lopez-Papic", role: "Events Director", image: "default.jpg" },
      { name: "Lydia Aziz", role: "Events Director", image: "Lydia Aziz.jpeg" },
      { name: "Manija Said Dawod", role: "Events Director", image: "default.jpg" },
      { name: "Muhammad Taha", role: "Events Director", image: "Muhammad Taha.JPG" },
      { name: "Narendra Persaud", role: "Events Director", image: "default.jpg" },
      { name: "Pranjal Patel", role: "Events Director", image: "default.jpg" },
      { name: "Rameesha Khan", role: "Events Director", image: "default.jpg" },
      { name: "Rhea Braich", role: "Events Director", image: "default.jpg" },
      { name: "Zina Abdalhk", role: "Events Director", image: "default.jpg" },
    ],
  },
  {
    title: "Finance",
    blurb: "Budgets, sponsorships and everything that keeps the lights on.",
    members: [
      { name: "Ciara Roberts", role: "Finance Director", image: "default.jpg" },
      { name: "Joanne Ly", role: "Finance Director", image: "Joanne Ly.jpg" },
    ],
  },
  {
    title: "Marketing",
    blurb: "How BMES looks and sounds across campus.",
    members: [
      { name: "Abdullah Alsibai", role: "Marketing Director", image: "default.jpg" },
      { name: "Avrilmari Sacramento", role: "Marketing Director", image: "default.jpg" },
      { name: "Deyonta Fletcher", role: "Marketing Director", image: "default.jpg" },
      { name: "Dhwanil Rana", role: "Marketing Director", image: "default.jpg" },
      { name: "Gwen Titus", role: "Marketing Director", image: "default.jpg" },
      { name: "Nafiseh Rezagholi", role: "Marketing Director", image: "default.jpg" },
      { name: "Noemi Gaitan-Ruiz", role: "Marketing Director", image: "default.jpg" },
    ],
  },
  {
    title: "Operations",
    blurb: "The logistics behind every room booking and every event day.",
    members: [
      { name: "Anthony Ma", role: "Operations Director", image: "default.jpg" },
      { name: "Hanady Zbib", role: "Operations Director", image: "default.jpg" },
      { name: "Hasan Obaid", role: "Operations Director", image: "Hasan Obaid.jpg" },
      { name: "Jazib Shaoor", role: "Operations Director", image: "default.jpg" },
      { name: "Rachna Patel", role: "Operations Director", image: "default.jpg" },
      { name: "Ruhab Baig", role: "Operations Director", image: "default.jpg" },
      { name: "Sarah Morelli", role: "Operations Director", image: "default.jpg" },
      { name: "Theepiga Jegatheesh", role: "Operations Director", image: "default.jpg" },
    ],
  },
  {
    title: "Website Developers",
    blurb: "The people who build and maintain this site.",
    members: [
      { name: "Aydin Ghanbari", role: "Website Developer", image: "default.jpg" },
      { name: "Haris Siddiqui", role: "Website Developer", image: "default.jpg" },
      { name: "Hassan Laliwala", role: "Website Developer", image: "default.jpg" },
      { name: "Nithieshan Jeyaganeshan", role: "Website Developer", image: "default.jpg" },
      { name: "Samin Maharjan", role: "Website Developer", image: "default.jpg" },
    ],
  },
  {
    title: "First Year Representatives",
    blurb: "New students bringing the first-year perspective into the room.",
    members: [
      { name: "Cezmhar Sibal", role: "First Year Representative", image: "default.jpg" },
      { name: "Kaylin Dhanpaul", role: "First Year Representative", image: "default.jpg" },
      { name: "Kelsi Sumaway", role: "First Year Representative", image: "default.jpg" },
      { name: "Manasseh Mathiyas", role: "First Year Representative", image: "default.jpg" },
      { name: "Raghangi Gunaseelan", role: "First Year Representative", image: "default.jpg" },
      { name: "Shanath Sutharshan", role: "First Year Representative", image: "default.jpg" },
      { name: "Shayan Shahbaz", role: "First Year Representative", image: "default.jpg" },
      { name: "Sneha Chaudhary", role: "First Year Representative", image: "default.jpg" },
      { name: "Vithuja Vigneswaran", role: "First Year Representative", image: "default.jpg" },
    ],
  },
];

export const TEAM_SIZE = TEAM.reduce((total, group) => total + group.members.length, 0);

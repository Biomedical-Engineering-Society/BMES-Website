import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How the ${SITE.name} at ${SITE.university} handles information on this website.`,
};

const UPDATED = "September 28, 2026";

type Section = { id: string; title: string; body: React.ReactNode };

const SECTIONS: Section[] = [
  {
    id: "summary",
    title: "The short version",
    body: (
      <ul>
        <li>You can browse this website without an account. We do not run ads, analytics or tracking cookies.</li>
        <li>We only receive personal information when you choose to send it: through the contact form, the Pulse assistant, or, for the BMES executive team, by signing in to the admin area.</li>
        <li>We never sell your information, and we only share it with the services that run this website, as described below.</li>
      </ul>
    ),
  },
  {
    id: "contact-form",
    title: "Contact form",
    body: (
      <>
        <p>
          When you send a message through the <Link href="/contact">contact page</Link>, we receive your name, email address,
          subject and message. They are emailed to the BMES executive team through our email provider, Resend, so we can reply.
          The website does not keep a copy; the message lives in the BMES inbox.
        </p>
      </>
    ),
  },
  {
    id: "assistant",
    title: "Pulse, the website assistant",
    body: (
      <>
        <p>
          Questions you type into Pulse are sent to Groq, which generates the answer, and to Hugging Face, which helps find
          the relevant information about BMES. Pulse does not ask who you are and does not link questions to you. Questions
          may appear briefly in our hosting provider&apos;s server logs, which are kept for a short period for troubleshooting.
          Please do not enter personal or sensitive information into Pulse.
        </p>
      </>
    ),
  },
  {
    id: "admin",
    title: "Admin sign-in (BMES executive team only)",
    body: (
      <>
        <p>
          Members of the BMES executive team can sign in to a private admin area to update the website, such as adding events
          and photos. Sign-in uses <strong>Sign in with Google</strong>. When you sign in, Google shares with us:
        </p>
        <ul>
          <li>your name,</li>
          <li>your email address, and</li>
          <li>confirmation that Google has verified that email address.</li>
        </ul>
        <p>We do not receive your Google password, contacts, files or any other Google data.</p>
        <p>We use this information only to:</p>
        <ul>
          <li>check whether your email is on the list of people allowed to use the admin area,</li>
          <li>keep you signed in (a secure cookie that lasts up to 8 hours), and</li>
          <li>record who made each change to the website.</li>
        </ul>
        <p>
          <strong>What we store.</strong> For people with admin access, we keep your email address, name, role (editor or
          owner), when you were added and when you last signed in. If you request access, we keep your email address, name,
          any note you add, and whether the request was approved or declined. This is stored in our database provider,
          Supabase, and is only visible to BMES admin owners.
        </p>
        <p>
          <strong>Change history.</strong> This website&apos;s code is published openly on GitHub. When an admin saves a
          change, the change is recorded in that public history with the admin&apos;s name and email address, so the club can
          see who changed what and undo mistakes.
        </p>
        <p>
          <strong>Google user data.</strong> Our use of information received from Google follows the{" "}
          <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements. We do not use it for advertising, do not sell it, and do not share it
          except with the service providers listed below to run the admin area.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    body: (
      <p>
        Visitors get no cookies from us. The admin area sets strictly necessary cookies only for people signing in: one for the
        sign-in handshake with Google (10 minutes), and one that keeps an admin signed in (up to 8 hours).
      </p>
    ),
  },
  {
    id: "providers",
    title: "Services we use",
    body: (
      <ul>
        <li><strong>Vercel</strong> hosts the website.</li>
        <li><strong>Resend</strong> delivers contact form messages and admin notifications by email.</li>
        <li><strong>Groq</strong> and <strong>Hugging Face</strong> power the Pulse assistant.</li>
        <li><strong>Supabase</strong> stores the admin access list and the information Pulse answers from.</li>
        <li><strong>Google</strong> provides admin sign-in.</li>
        <li><strong>GitHub</strong> stores the website&apos;s code, content and change history.</li>
      </ul>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: (
      <p>
        Admin access records are kept while you have access, and are removed when an owner removes you or when you ask us to.
        Access requests are kept so owners can see past decisions, and are deleted on request. Entries in the public change
        history are part of the website&apos;s code history and generally cannot be removed. Contact form messages are kept in
        the BMES inbox for as long as they are useful for club business.
      </p>
    ),
  },
  {
    id: "choices",
    title: "Your choices",
    body: (
      <p>
        You can ask to see, correct or delete the information we hold about you, or to have your admin access removed, by
        emailing <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>. You can also stop the website&apos;s access to your
        Google account at any time from your Google Account settings, under Security, Third-party connections.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        If we change how we handle information, we will update this page and the date at the top.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <>
      <section className="bg-navy text-white">
        <div className="shell py-14 md:py-20">
          <div className="flex max-w-[860px] flex-col gap-4">
            <span className="eyebrow eyebrow-on-dark">Privacy</span>
            <h1 className="t-page-sm">Privacy Policy</h1>
            <p className="t-lead max-w-[620px] text-on-navy">
              How the {SITE.name} at {SITE.university} handles information on this website. Last updated {UPDATED}.
            </p>
          </div>
        </div>
      </section>

      <section className="shell band">
        <div className="flex max-w-[760px] flex-col gap-10 text-[16px] leading-[1.7] text-body md:text-[17px] [&_a]:font-semibold [&_a]:text-brand [&_a:hover]:underline [&_li]:mt-1.5 [&_p+p]:mt-4 [&_p+ul]:mt-3 [&_strong]:text-ink [&_ul]:list-disc [&_ul]:pl-6 [&_ul+p]:mt-4">
          {SECTIONS.map((section) => (
            <div key={section.id} id={section.id} className="scroll-mt-28">
              <h2 className="mb-3 font-display text-2xl font-semibold text-ink">{section.title}</h2>
              {section.body}
            </div>
          ))}

          <div className="rounded-2xl border border-hairline bg-surface p-6">
            <h2 className="font-display text-xl font-semibold text-ink">Questions</h2>
            <p className="mt-2">
              Email <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>, or visit us in {CONTACT.office},{" "}
              {CONTACT.building}, {CONTACT.addressLines.join(", ")}.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

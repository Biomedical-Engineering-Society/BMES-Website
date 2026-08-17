import { Resend } from "resend";

/**
 * Contact form endpoint.
 *
 * The Resend client is built per request, not at module scope: its constructor
 * throws without a RESEND_API_KEY, and at module scope that fails `next build`.
 * Building the site must not depend on a mail key being configured.
 */

const TO_ADDRESS = process.env.CONTACT_TO_EMAIL || "bmes@torontomu.ca";
const FROM_ADDRESS = process.env.CONTACT_FROM_EMAIL || "onboarding@resend.dev";

/** User input is interpolated into an HTML email, so it has to be escaped. */
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return Response.json(
        { success: false, error: "Name, email and message are all required." },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return Response.json(
        { success: false, error: "That email address does not look right." },
        { status: 400 },
      );
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set, so the contact form cannot send mail.");
      return Response.json(
        {
          success: false,
          error: "Email is not configured yet. Please write to bmes@torontomu.ca directly.",
        },
        { status: 503 },
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: TO_ADDRESS,
      replyTo: email.trim(),
      subject: subject?.trim() || `New website message from ${name.trim()}`,
      html: `
        <h2>New contact form submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject) || "(none)"}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
      `,
    });

    if (error) {
      console.error(error);
      return Response.json(
        { success: false, error: "We could not send that just now. Please try again." },
        { status: 502 },
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

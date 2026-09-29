import { Resend } from "resend";
import { listMembers, ownerEmails } from "./access";

/**
 * Email every owner that someone asked for access. Best effort: the request is
 * already saved and shows as a badge in the admin, so a failed email is logged,
 * never shown to the person asking.
 */
export async function notifyOwnersOfRequest(request: { email: string; name: string; note: string }, siteOrigin: string) {
  if (!process.env.RESEND_API_KEY) return;

  try {
    const owners = new Set(ownerEmails());
    for (const member of await listMembers().catch(() => [])) {
      if (member.role === "owner") owners.add(member.email);
    }
    if (owners.size === 0) return;

    const escape = (value: string) =>
      value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
    const from = process.env.CONTACT_FROM_EMAIL || "onboarding@resend.dev";

    const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: `BMES Admin <${from}>`,
      to: [...owners],
      subject: `${request.name} asked for access to the BMES admin`,
      html: `
        <p><strong>${escape(request.name)}</strong> (${escape(request.email)}) asked for access to the BMES website admin.</p>
        ${request.note ? `<p>Their note: ${escape(request.note)}</p>` : ""}
        <p><a href="${siteOrigin}/admin/access">Review the request</a></p>
      `,
    });
    if (error) console.error("Access request email failed:", error);
  } catch (error) {
    console.error("Access request email failed:", error);
  }
}

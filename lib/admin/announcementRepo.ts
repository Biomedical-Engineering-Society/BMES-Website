import {
  expiryFor,
  parseAnnouncement,
  validateAnnouncement,
  type Announcement,
  type AnnouncementErrors,
} from "@/lib/announcement";
import { SaveConflict, type ContentStore } from "./store";

/** Setting and clearing the home page banner through the admin tool. One save is one commit. */

const ANNOUNCEMENT_FILE = "data/announcement.json";
const MAX_ATTEMPTS = 3;

export type AnnouncementOp = { op: "set"; message: unknown; link: unknown; days: unknown } | { op: "clear" };

export class AnnouncementOpError extends Error {
  constructor(
    message: string,
    public status = 400,
    public fieldErrors?: AnnouncementErrors,
  ) {
    super(message);
  }
}

export async function readAnnouncement(store: ContentStore): Promise<{ announcement: Announcement | null; version: string }> {
  const { text, version } = await store.readText(ANNOUNCEMENT_FILE);
  return { announcement: parseAnnouncement(JSON.parse(text)), version };
}

export async function applyAnnouncementOp(
  store: ContentStore,
  op: AnnouncementOp,
  actor: string,
): Promise<{ sha: string; announcement: Announcement | null }> {
  let announcement: Announcement | null = null;
  let message: string;

  if (op.op === "set") {
    const checked = validateAnnouncement({ message: op.message, link: op.link, days: op.days });
    if (!checked.ok) throw new AnnouncementOpError("Some fields need fixing.", 400, checked.errors);
    const { message: text, link, days } = checked.fields;
    announcement = { message: text, link, expiresOn: expiryFor(days) };
    message = `announcement: show "${text.slice(0, 60)}" for ${days} day${days === 1 ? "" : "s"} (via admin, by ${actor})`;
  } else {
    message = `announcement: clear (via admin, by ${actor})`;
  }

  const text = `${JSON.stringify(announcement ?? {}, null, 2)}\n`;

  for (let attempt = 1; ; attempt++) {
    const { version } = await readAnnouncement(store);
    try {
      const { sha } = await store.commit({ message, baseVersion: version, changes: [{ path: ANNOUNCEMENT_FILE, text }] });
      return { sha, announcement };
    } catch (error) {
      if (!(error instanceof SaveConflict) || attempt >= MAX_ATTEMPTS) {
        if (error instanceof SaveConflict) {
          throw new AnnouncementOpError("The site was busy with other saves. Try again in a moment.", 409);
        }
        throw error;
      }
    }
  }
}

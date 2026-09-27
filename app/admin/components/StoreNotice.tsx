/** Tells the admin where saves go when it is anywhere other than the live site. */
export default function StoreNotice({ kind }: { kind: "github" | "local" | null }) {
  const branch = process.env.GITHUB_BRANCH || "main";

  if (kind === null) {
    return (
      <p className="rounded-xl border border-crimson/30 bg-crimson/5 px-5 py-4 text-sm text-crimson">
        <strong>Saving is not set up yet.</strong> GITHUB_TOKEN needs adding in Vercel before changes can be saved.
      </p>
    );
  }
  if (kind === "local") {
    return (
      <p className="rounded-xl border border-hairline-strong bg-white px-5 py-4 text-sm text-muted">
        <strong className="text-ink">Local mode.</strong> Saves write to the files on this computer, not to the live
        site.
      </p>
    );
  }
  if (branch !== "main") {
    return (
      <p className="rounded-xl border border-hairline-strong bg-white px-5 py-4 text-sm text-muted">
        <strong className="text-ink">Test mode.</strong> Saves go to the <code>{branch}</code> branch, not the live site.
      </p>
    );
  }
  return null;
}

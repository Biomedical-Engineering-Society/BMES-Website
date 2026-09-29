import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin/session";
import { adminConfigured, googleConfigured, passwordEnabled } from "@/lib/admin/sessionToken";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

const ERRORS: Record<string, string> = {
  cancelled: "Sign-in was cancelled.",
  expired: "That sign-in took too long or was opened in another browser. Try again.",
  google: "Google sign-in did not go through. Try again.",
  "google-off": "Google sign-in is not set up yet.",
  "access-check": "We could not check the access list just now. Try again in a minute.",
};

type PageProps = { searchParams: Promise<{ error?: string }> };

export default async function LoginPage({ searchParams }: PageProps) {
  if (await getAdmin()) redirect("/admin");
  const { error } = await searchParams;
  const google = googleConfigured();
  const password = passwordEnabled();

  return (
    <div className="mx-auto max-w-[420px]">
      <div className="card p-8">
        <h1 className="font-display text-2xl font-semibold text-ink">Sign in</h1>
        <p className="mt-2 text-[15px] leading-[1.6] text-muted">For the BMES executive team.</p>

        {error && ERRORS[error] && (
          <p role="alert" className="mt-5 rounded-lg bg-crimson/10 px-4 py-3 text-sm font-semibold text-crimson">
            {ERRORS[error]}
          </p>
        )}

        {!adminConfigured() && (
          <p className="mt-5 rounded-lg bg-crimson/10 px-4 py-3 text-sm text-crimson">
            Sign-in is not set up yet. See data/HOW_TO_UPDATE_EVENTS.md.
          </p>
        )}

        {google && (
          // A plain link, not next/link: the route redirects off-site to Google.
          <a href="/api/admin/auth/google" className="btn btn-primary mt-6 w-full gap-3">
            <GoogleMark /> Sign in with Google
          </a>
        )}

        {password &&
          (google ? (
            <details className="mt-6 border-t border-hairline pt-5">
              <summary className="cursor-pointer text-sm font-semibold text-muted hover:text-ink">
                Use the shared password instead
              </summary>
              <p className="mt-3 text-sm text-muted">Signs you in as an editor. It cannot manage access.</p>
              <LoginForm />
            </details>
          ) : (
            <LoginForm />
          ))}
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
        <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z" />
      </svg>
    </span>
  );
}

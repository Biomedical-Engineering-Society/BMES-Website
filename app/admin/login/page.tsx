import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin/session";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");

  return (
    <div className="mx-auto max-w-[420px]">
      <div className="card p-8">
        <h1 className="font-display text-2xl font-semibold text-ink">Sign in</h1>
        <p className="mt-2 text-[15px] leading-[1.6] text-muted">
          For the BMES executive team. Ask the webmaster for the admin password.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";

import { AppToaster } from "@/components/app-toaster";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { requireCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Change password" };

export default async function ChangePasswordPage() {
  await requireCurrentUser("/change-password");

  return (
    <>
      <div className="animate-enter mx-auto max-w-xl">
        <Link
          href="/profile"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-emerald-400"
        >
          <ArrowLeft className="size-4" />
          Back to profile
        </Link>
        <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 sm:p-6">
          <span className="grid size-10 place-items-center rounded-md bg-amber-500/10 text-amber-400">
            <ShieldAlert className="size-5" />
          </span>
          <h1 className="mt-5 text-xl font-semibold tracking-tight text-white">
            Change password
          </h1>
          <p className="mt-2 text-sm text-zinc-400 mb-6">
          After your password changes, all existing sessions are invalidated
          and you’ll sign in again.
          </p>
          <ChangePasswordForm />
        </section>
      </div>
      <AppToaster />
    </>
  );
}

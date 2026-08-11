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
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-blue-300"
        >
          <ArrowLeft className="size-4" />
          Back to profile
        </Link>
        <section className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-xl shadow-slate-950/20 sm:p-8">
          <span className="grid size-11 place-items-center rounded-xl border border-blue-400/20 bg-blue-500/15 text-blue-300">
            <ShieldAlert className="size-5" />
          </span>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-white">
            Change password
          </h1>
          <p className="mt-2 mb-7 text-sm leading-6 text-slate-300">
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

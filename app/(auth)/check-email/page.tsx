import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";

import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = { title: "Check your email" };

type CheckEmailPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CheckEmailPage({
  searchParams,
}: CheckEmailPageProps) {
  const params = await searchParams;
  const isReset = params.type === "reset";

  return (
    <AuthCard
      eyebrow={isReset ? "Account recovery" : "Email verification"}
      title="Check your inbox"
      description={
        isReset
          ? "If an eligible account exists, we sent a secure reset link."
          : "We sent a verification link to the address used during registration."
      }
    >
      <div className="text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl border border-blue-400/20 bg-blue-500/15 text-blue-300">
          <MailCheck className="size-8" />
        </span>
        <p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-slate-300">
          Check your spam folder too. For security, we don’t confirm whether an
          email address belongs to an account.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30"
          >
            Back to sign in
          </Link>
          {!isReset ? (
            <Link
              href="/verify-email"
              className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-slate-600 bg-slate-900/60 px-4 text-sm font-bold text-slate-200 transition hover:border-blue-400/50 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20"
            >
              Resend link
            </Link>
          ) : null}
        </div>
      </div>
    </AuthCard>
  );
}

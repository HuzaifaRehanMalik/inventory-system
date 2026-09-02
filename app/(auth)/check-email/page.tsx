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
        <span className="mx-auto grid size-12 place-items-center rounded-md bg-emerald-500/10 text-emerald-400">
          <MailCheck className="size-8" />
        </span>
        <p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-zinc-400">
          Check your spam folder too. For security, we don’t confirm whether an
          email address belongs to an account.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex h-9 flex-1 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500/50"
          >
            Back to sign in
          </Link>
          {!isReset ? (
            <Link
              href="/verify-email"
              className="inline-flex h-9 flex-1 items-center justify-center rounded-md border border-zinc-700 bg-zinc-800 px-4 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500/50"
            >
              Resend link
            </Link>
          ) : null}
        </div>
      </div>
    </AuthCard>
  );
}

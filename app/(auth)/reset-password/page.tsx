import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { tokenSchema } from "@/validations/auth";

export const metadata: Metadata = { title: "Reset password" };

type ResetPasswordPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  const validTokenShape = tokenSchema.safeParse({ token }).success;

  if (!validTokenShape) {
    return (
      <AuthCard
        eyebrow="Account recovery"
        title="Reset link unavailable"
        description="This link is missing or malformed. Request a fresh password reset email."
      >
        <div className="text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-300">
            <AlertTriangle className="size-7" />
          </span>
          <Link
            href="/forgot-password"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30"
          >
            Request a new link
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      eyebrow="Account recovery"
      title="Choose a new password"
      description="Your new password will invalidate any existing sessions."
    >
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}

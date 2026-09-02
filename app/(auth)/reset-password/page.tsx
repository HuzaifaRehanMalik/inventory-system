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
          <span className="mx-auto grid size-12 place-items-center rounded-md bg-amber-500/10 text-amber-400">
            <AlertTriangle className="size-7" />
          </span>
          <Link
            href="/forgot-password"
            className="mt-6 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500/50"
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

import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { VerifyEmailPanel } from "@/components/auth/verify-email-panel";

export const metadata: Metadata = { title: "Verify email" };

type VerifyEmailPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : undefined;

  return (
    <AuthCard
      eyebrow="Email verification"
      title={token ? "Confirming your identity" : "Need a new verification link?"}
      description={
        token
          ? "We’re securely validating the single-use link."
          : "Verification links expire after 24 hours."
      }
    >
      <VerifyEmailPanel token={token} />
    </AuthCard>
  );
}

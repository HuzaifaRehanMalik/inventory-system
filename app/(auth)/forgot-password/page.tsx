import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      eyebrow="Account recovery"
      title="Forgot your password?"
      description="We’ll send a single-use reset link if your account is eligible."
      footer={
        <Link
          href="/login"
          className="inline-flex items-center gap-2 font-medium text-emerald-400 transition hover:text-emerald-300 hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to sign in
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}

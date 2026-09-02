import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { sanitizeCallbackUrl } from "@/lib/utils";

export const metadata: Metadata = { title: "Sign in" };

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const notice = params.verified
    ? "verified"
    : params.passwordChanged
      ? "password-changed"
      : params.signedOut
        ? "signed-out"
        : undefined;

  return (
    <AuthCard
      eyebrow="Welcome back"
      title="Sign in to your account"
      description="Use your verified work email to access your secure workspace."
      footer={
        <div className="space-y-2">
          <p>
            New to Stockeyfy?{" "}
            <Link
              href="/register"
              className="font-medium text-emerald-400 transition hover:text-emerald-300 hover:underline"
            >
              Create an account
            </Link>
          </p>
          <p>
            Not sure where to begin?{" "}
            <Link
              href="/guide"
              className="font-medium text-emerald-400 transition hover:text-emerald-300 hover:underline"
            >
              See how it works
            </Link>
          </p>
        </div>
      }
    >
      <LoginForm
        callbackUrl={sanitizeCallbackUrl(
          typeof params.callbackUrl === "string" ? params.callbackUrl : undefined,
        )}
        notice={notice}
      />
    </AuthCard>
  );
}

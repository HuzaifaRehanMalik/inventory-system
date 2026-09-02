import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <AuthCard
      eyebrow="Get started"
      title="Create your account"
      description="Set up a verified identity for secure access to Stockeyfy."
      footer={
        <div className="space-y-2">
          <p>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-emerald-400 transition hover:text-emerald-300 hover:underline"
            >
              Sign in
            </Link>
          </p>
          <p>
            Want a quick tour first?{" "}
            <Link
              href="/guide"
              className="font-medium text-emerald-400 transition hover:text-emerald-300 hover:underline"
            >
              Read the User Guide
            </Link>
          </p>
        </div>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}

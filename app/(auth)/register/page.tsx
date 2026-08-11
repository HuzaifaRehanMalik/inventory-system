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
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-blue-400 transition hover:text-blue-300 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}

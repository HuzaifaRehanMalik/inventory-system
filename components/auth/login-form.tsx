"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ApiClientError, apiRequest } from "@/lib/client-api";
import { FormField, PasswordField, SubmitButton } from "@/components/auth/form-controls";
import {
  loginResolver,
  type LoginInput,
} from "@/validations/auth-client";

export function LoginForm({
  callbackUrl,
  notice,
}: {
  callbackUrl: string;
  notice?: "verified" | "password-changed" | "signed-out";
}) {
  const router = useRouter();
  const form = useForm<LoginInput>({
    resolver: loginResolver,
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
      callbackUrl,
    },
  });

  useEffect(() => {
    if (notice === "verified") {
      toast.success("Email verified. You can sign in now.");
    } else if (notice === "password-changed") {
      toast.success("Password updated. Sign in with your new password.");
    } else if (notice === "signed-out") {
      toast.success("You have been signed out.");
    }
  }, [notice]);

  async function onSubmit(input: LoginInput) {
    try {
      const response = await apiRequest<{ redirectTo: string }>(
        "/api/auth/login",
        input,
      );

      toast.success(response.message);
      router.replace(response.data.redirectTo);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiClientError) {
        if (error.code === "EMAIL_NOT_VERIFIED") {
          toast.error(error.message, {
            action: {
              label: "Resend",
              onClick: () => router.push("/verify-email"),
            },
          });
          return;
        }
        toast.error(error.message);
        return;
      }
      toast.error("Sign in failed. Please try again.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <FormField
        label="Email address"
        type="email"
        autoComplete="email"
        placeholder="you@company.com"
        icon={<Mail className="size-4" aria-hidden="true" />}
        error={form.formState.errors.email?.message}
        {...form.register("email")}
      />

      <PasswordField
        label="Password"
        labelAction={
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-blue-400 transition hover:text-blue-300 hover:underline"
          >
            Forgot password?
          </Link>
        }
        autoComplete="current-password"
        placeholder="Enter your password"
        error={form.formState.errors.password?.message}
        {...form.register("password")}
      />

      <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-400">
        <input
          type="checkbox"
          className="mt-0.5 size-4 rounded border-slate-600 accent-blue-600 focus:ring-blue-500"
          {...form.register("rememberMe")}
        />
        <span>
          <span className="font-semibold text-slate-200">
            Remember me
          </span>
          <span className="block text-xs leading-5">
            Keep this device signed in for up to 30 days.
          </span>
        </span>
      </label>

      <SubmitButton loading={form.formState.isSubmitting}>
        Sign in securely
      </SubmitButton>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ApiClientError, apiRequest } from "@/lib/client-api";
import { FormField, SubmitButton } from "@/components/auth/form-controls";
import {
  emailResolver,
  type ForgotPasswordInput,
} from "@/validations/auth-client";

export function ForgotPasswordForm() {
  const router = useRouter();
  const form = useForm<ForgotPasswordInput>({
    resolver: emailResolver,
    defaultValues: { email: "" },
  });

  async function onSubmit(input: ForgotPasswordInput) {
    try {
      const response = await apiRequest<{ emailSent: boolean }>(
        "/api/auth/forgot-password",
        input,
      );
      toast.success(response.message);
      router.push("/check-email?type=reset");
    } catch (error) {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "The request failed. Please try again.",
      );
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
        hint="Use the email address associated with your account."
        {...form.register("email")}
      />
      <SubmitButton loading={form.formState.isSubmitting}>
        Send reset link
      </SubmitButton>
    </form>
  );
}

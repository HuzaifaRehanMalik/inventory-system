"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { ApiClientError, apiRequest } from "@/lib/client-api";
import {
  PasswordChecklist,
  PasswordField,
  SubmitButton,
} from "@/components/auth/form-controls";
import {
  resetPasswordResolver,
  type ResetPasswordInput,
} from "@/validations/auth-client";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const form = useForm<ResetPasswordInput>({
    resolver: resetPasswordResolver,
    defaultValues: {
      token,
      password: "",
      confirmPassword: "",
    },
  });
  const password = useWatch({ control: form.control, name: "password" });

  async function onSubmit(input: ResetPasswordInput) {
    try {
      const response = await apiRequest<{ redirectTo: string }>(
        "/api/auth/reset-password",
        input,
      );
      toast.success(response.message);
      router.replace(response.data.redirectTo);
    } catch (error) {
      if (error instanceof ApiClientError) {
        for (const [field, messages] of Object.entries(error.fieldErrors ?? {})) {
          form.setError(field as never, { message: messages[0] });
        }
        toast.error(error.message);
        return;
      }
      toast.error("Password reset failed. Please request a new link.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <PasswordField
        label="New password"
        autoComplete="new-password"
        placeholder="Create a strong password"
        error={form.formState.errors.password?.message}
        {...form.register("password")}
      />
      <PasswordChecklist password={password} />
      <PasswordField
        label="Confirm new password"
        autoComplete="new-password"
        placeholder="Repeat your password"
        error={form.formState.errors.confirmPassword?.message}
        {...form.register("confirmPassword")}
      />
      <SubmitButton loading={form.formState.isSubmitting}>
        Reset password
      </SubmitButton>
    </form>
  );
}

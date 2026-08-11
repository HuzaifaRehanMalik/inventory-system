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
  changePasswordResolver,
  type ChangePasswordInput,
} from "@/validations/auth-client";

export function ChangePasswordForm() {
  const router = useRouter();
  const form = useForm<ChangePasswordInput>({
    resolver: changePasswordResolver,
    defaultValues: {
      currentPassword: "",
      password: "",
      confirmPassword: "",
    },
  });
  const password = useWatch({ control: form.control, name: "password" });

  async function onSubmit(input: ChangePasswordInput) {
    try {
      const response = await apiRequest<{ redirectTo: string }>(
        "/api/auth/change-password",
        input,
      );
      toast.success(response.message);
      await apiRequest<null>("/api/auth/logout");
      router.replace(response.data.redirectTo);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiClientError) {
        for (const [field, messages] of Object.entries(error.fieldErrors ?? {})) {
          form.setError(field as never, { message: messages[0] });
        }
        toast.error(error.message);
        return;
      }
      toast.error("Password change failed. Please try again.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <PasswordField
        label="Current password"
        autoComplete="current-password"
        placeholder="Enter your current password"
        error={form.formState.errors.currentPassword?.message}
        {...form.register("currentPassword")}
      />
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
        placeholder="Repeat your new password"
        error={form.formState.errors.confirmPassword?.message}
        {...form.register("confirmPassword")}
      />
      <SubmitButton loading={form.formState.isSubmitting}>
        Change password
      </SubmitButton>
    </form>
  );
}

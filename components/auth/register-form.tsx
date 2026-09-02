"use client";

import { useRouter } from "next/navigation";
import { Mail, UserRound } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { ApiClientError, apiRequest } from "@/lib/client-api";
import {
  FormField,
  PasswordChecklist,
  PasswordField,
  SubmitButton,
} from "@/components/auth/form-controls";
import {
  registerResolver,
  type RegisterInput,
} from "@/validations/auth-client";

export function RegisterForm() {
  const router = useRouter();
  const form = useForm<RegisterInput>({
    resolver: registerResolver,
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const password = useWatch({ control: form.control, name: "password" });

  async function onSubmit(input: RegisterInput) {
    try {
      const response = await apiRequest<{ emailSent: boolean }>(
        "/api/auth/register",
        input,
      );
      toast.success(response.message);
      router.push("/check-email?type=verification");
    } catch (error) {
      if (error instanceof ApiClientError) {
        for (const [field, messages] of Object.entries(error.fieldErrors ?? {})) {
          form.setError(field as never, { message: messages[0] });
        }
        toast.error(error.message);
        return;
      }
      toast.error("Account creation failed. Please try again.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField
        label="Full name"
        autoComplete="name"
        placeholder="Alex Morgan"
        icon={<UserRound className="size-4" aria-hidden="true" />}
        error={form.formState.errors.name?.message}
        {...form.register("name")}
      />
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
        autoComplete="new-password"
        placeholder="Create a strong password"
        error={form.formState.errors.password?.message}
        {...form.register("password")}
      />
      <PasswordChecklist password={password} />
      <PasswordField
        label="Confirm password"
        autoComplete="new-password"
        placeholder="Repeat your password"
        error={form.formState.errors.confirmPassword?.message}
        {...form.register("confirmPassword")}
      />
      <p className="text-xs leading-5 text-zinc-400">
        By creating an account, you agree to follow your organization’s access
        and security policies.
      </p>
      <SubmitButton loading={form.formState.isSubmitting}>
        Create secure account
      </SubmitButton>
    </form>
  );
}

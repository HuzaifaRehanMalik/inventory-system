"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ApiClientError, apiRequest } from "@/lib/client-api";
import { FormField, SubmitButton } from "@/components/auth/form-controls";
import {
  updateProfileResolver,
  type UpdateProfileInput,
} from "@/validations/auth-client";

export function ProfileForm({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const form = useForm<UpdateProfileInput>({
    resolver: updateProfileResolver,
    defaultValues: { name, email },
  });

  async function onSubmit(input: UpdateProfileInput) {
    setSaved(false);
    try {
      const response = await apiRequest<{
        emailChanged: boolean;
        reauthenticate: boolean;
      }>("/api/auth/profile", input, "PATCH");

      toast.success(response.message);
      setSaved(true);

      if (response.data.reauthenticate) {
        await apiRequest<null>("/api/auth/logout");
        router.replace("/check-email?type=verification");
        router.refresh();
        return;
      }

      form.reset(input);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiClientError) {
        for (const [field, messages] of Object.entries(error.fieldErrors ?? {})) {
          form.setError(field as never, { message: messages[0] });
        }
        toast.error(error.message);
        return;
      }
      toast.error("Profile update failed. Please try again.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <FormField
        label="Full name"
        autoComplete="name"
        icon={<UserRound className="size-4" />}
        error={form.formState.errors.name?.message}
        {...form.register("name", {
          onChange: () => setSaved(false),
        })}
      />
      <FormField
        label="Email address"
        type="email"
        autoComplete="email"
        icon={<Mail className="size-4" />}
        error={form.formState.errors.email?.message}
        hint="Changing your email signs you out and requires verification."
        {...form.register("email", {
          onChange: () => setSaved(false),
        })}
      />
      <div className="flex items-center gap-4">
        <SubmitButton
          loading={form.formState.isSubmitting}
          className="w-auto px-6"
        >
          Save profile
        </SubmitButton>
        {saved ? (
          <span className="text-sm font-medium text-emerald-400">
            Changes saved
          </span>
        ) : null}
      </div>
    </form>
  );
}

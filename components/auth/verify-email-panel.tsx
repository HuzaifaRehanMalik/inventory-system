"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BadgeCheck,
  LoaderCircle,
  Mail,
  Send,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ApiClientError, apiRequest } from "@/lib/client-api";
import { FormField, SubmitButton } from "@/components/auth/form-controls";
import {
  emailResolver,
  type ForgotPasswordInput,
} from "@/validations/auth-client";

type VerificationState = "idle" | "verifying" | "success" | "error";

export function VerifyEmailPanel({ token }: { token?: string }) {
  const router = useRouter();
  const started = useRef(false);
  const [state, setState] = useState<VerificationState>(
    token ? "verifying" : "idle",
  );
  const [message, setMessage] = useState(
    token ? "Checking your secure verification link…" : "",
  );

  useEffect(() => {
    if (!token || started.current) {
      return;
    }

    started.current = true;

    void apiRequest<{ redirectTo: string }>("/api/auth/verify-email", {
      token,
    })
      .then((response) => {
        setState("success");
        setMessage(response.message);
        toast.success(response.message);
      })
      .catch((error: unknown) => {
        setState("error");
        setMessage(
          error instanceof ApiClientError
            ? error.message
            : "The verification link could not be used.",
        );
      });
  }, [token]);

  if (state === "verifying") {
    return (
      <StatusPanel
        icon={<LoaderCircle className="size-7 animate-spin" />}
        title="Verifying your email"
        message={message}
      />
    );
  }

  if (state === "success") {
    return (
      <StatusPanel
        icon={<BadgeCheck className="size-8 text-emerald-400" />}
        title="Email verified"
        message={message}
        tone="success"
      >
        <button
          type="button"
          onClick={() => router.replace("/login?verified=1")}
          className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          Continue to sign in
        </button>
      </StatusPanel>
    );
  }

  return (
    <div className="space-y-6">
      {state === "error" ? (
        <StatusPanel
          icon={<AlertTriangle className="size-7" />}
          title="Link unavailable"
          message={message}
          tone="error"
        />
      ) : (
        <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-100">
          Enter your account email and we’ll send a fresh verification link if
          one is needed.
        </div>
      )}
      <ResendVerificationForm />
      <p className="text-center text-sm text-zinc-400">
        Already verified?{" "}
        <Link
          href="/login"
          className="font-semibold text-emerald-400 transition hover:text-emerald-300 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

function ResendVerificationForm() {
  const form = useForm<ForgotPasswordInput>({
    resolver: emailResolver,
    defaultValues: { email: "" },
  });

  async function onSubmit(input: ForgotPasswordInput) {
    try {
      const response = await apiRequest<{ emailSent: boolean }>(
        "/api/auth/resend-verification",
        input,
      );
      toast.success(response.message);
      form.reset();
    } catch (error) {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Could not send a verification email.",
      );
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField
        label="Email address"
        type="email"
        autoComplete="email"
        placeholder="you@company.com"
        icon={<Mail className="size-4" />}
        error={form.formState.errors.email?.message}
        {...form.register("email")}
      />
      <SubmitButton loading={form.formState.isSubmitting}>
        <Send className="size-4" aria-hidden="true" />
        Send verification link
      </SubmitButton>
    </form>
  );
}

function StatusPanel({
  icon,
  title,
  message,
  children,
  tone = "neutral",
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  children?: React.ReactNode;
  tone?: "neutral" | "success" | "error";
}) {
  return (
    <div className="text-center" role={tone === "error" ? "alert" : "status"}>
      <span
        className={`mx-auto grid size-14 place-items-center rounded-md ${
          tone === "error"
            ? "border border-red-500/20 bg-red-500/10 text-red-400"
            : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
        }`}
      >
        {icon}
      </span>
      <h2 className="mt-4 text-lg font-bold text-white">
        {title}
      </h2>
      <p className="mt-1 text-sm leading-6 text-zinc-400">
        {message}
      </p>
      {children}
    </div>
  );
}

"use client";

import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { Check, Eye, EyeOff, LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  labelAction?: ReactNode;
};

export const FormField = forwardRef<HTMLInputElement, FieldProps>(
  function FormField(
    {
      label,
      error,
      hint,
      icon,
      labelAction,
      className,
      id: providedId,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const id = providedId ?? generatedId;
    const descriptionId = `${id}-description`;

    return (
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label
            htmlFor={id}
            className="block text-sm font-medium text-zinc-300"
          >
            {label}
          </label>
          {labelAction}
        </div>
        <div className="relative">
          {icon ? (
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-zinc-500">
              {icon}
            </span>
          ) : null}
          <input
            {...props}
            id={id}
            ref={ref}
            aria-invalid={Boolean(error)}
            aria-describedby={error || hint ? descriptionId : undefined}
            className={cn(
              "h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3.5 text-[15px] text-white outline-none transition placeholder:text-zinc-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-10",
              error &&
                "border-red-500/70 focus:border-red-500/70 focus:ring-red-500/20",
              className,
            )}
          />
        </div>
        {error || hint ? (
          <p
            id={descriptionId}
            className={cn(
              "mt-1.5 text-xs leading-5",
              error
                ? "font-medium text-red-400"
                : "text-zinc-500",
            )}
            role={error ? "alert" : undefined}
          >
            {error ?? hint}
          </p>
        ) : null}
      </div>
    );
  },
);

export const PasswordField = forwardRef<HTMLInputElement, FieldProps>(
  function PasswordField(
    {
      label,
      error,
      hint,
      labelAction,
      className,
      id: providedId,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const id = providedId ?? generatedId;
    const descriptionId = `${id}-description`;
    const [visible, setVisible] = useState(false);

    return (
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label
            htmlFor={id}
            className="block text-sm font-medium text-zinc-300"
          >
            {label}
          </label>
          {labelAction}
        </div>
        <div className="relative">
          <input
            {...props}
            id={id}
            ref={ref}
            type={visible ? "text" : "password"}
            aria-invalid={Boolean(error)}
            aria-describedby={error || hint ? descriptionId : undefined}
            className={cn(
              "h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3.5 pr-12 text-[15px] text-white outline-none transition placeholder:text-zinc-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-50",
              error &&
                "border-red-500/70 focus:border-red-500/70 focus:ring-red-500/20",
              className,
            )}
          />
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-md text-zinc-500 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500"
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
          >
            {visible ? (
              <EyeOff className="size-4.5" aria-hidden="true" />
            ) : (
              <Eye className="size-4.5" aria-hidden="true" />
            )}
          </button>
        </div>
        {error || hint ? (
          <p
            id={descriptionId}
            className={cn(
              "mt-1.5 text-xs leading-5",
              error
                ? "font-medium text-red-400"
                : "text-zinc-500",
            )}
            role={error ? "alert" : undefined}
          >
            {error ?? hint}
          </p>
        ) : null}
      </div>
    );
  },
);

export function SubmitButton({
  loading,
  children,
  className,
}: {
  loading: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={cn(
        "inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-white transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      {loading ? (
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      ) : null}
      {children}
    </button>
  );
}

export function PasswordChecklist({ password }: { password: string }) {
  const rules = [
    { label: "6+ characters", met: password.length >= 6 },
    { label: "Upper & lowercase", met: /[A-Z]/.test(password) && /[a-z]/.test(password) },
    { label: "Number", met: /[0-9]/.test(password) },
    { label: "Special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-md border border-zinc-800 bg-zinc-950 p-3 text-xs">
      {rules.map((rule) => (
        <span
          key={rule.label}
          className={cn(
            "flex items-center gap-1.5",
            rule.met
              ? "font-medium text-emerald-400"
              : "text-zinc-500",
          )}
        >
          <span
            className={cn(
              "grid size-4 place-items-center rounded-full border",
              rule.met
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-zinc-700",
            )}
          >
            {rule.met ? <Check className="size-2.5" /> : null}
          </span>
          {rule.label}
        </span>
      ))}
    </div>
  );
}

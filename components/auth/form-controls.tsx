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
            className="block text-sm font-semibold text-slate-200"
          >
            {label}
          </label>
          {labelAction}
        </div>
        <div className="relative">
          {icon ? (
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-500">
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
              "h-12 w-full rounded-xl border border-slate-600 bg-slate-950/65 px-3.5 text-[15px] text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 disabled:cursor-not-allowed disabled:opacity-60",
              icon && "pl-10",
              error &&
                "border-rose-500 focus:border-rose-500 focus:ring-rose-500/15",
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
                ? "font-medium text-rose-400"
                : "text-slate-400",
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
            className="block text-sm font-semibold text-slate-200"
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
              "h-12 w-full rounded-xl border border-slate-600 bg-slate-950/65 px-3.5 pr-12 text-[15px] text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 disabled:cursor-not-allowed disabled:opacity-60",
              error &&
                "border-rose-500 focus:border-rose-500 focus:ring-rose-500/15",
              className,
            )}
          />
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-xl text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
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
                ? "font-medium text-rose-400"
                : "text-slate-400",
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
        "inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition hover:-translate-y-0.5 hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-65",
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
    <div className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-xl border border-slate-700 bg-slate-900/70 p-3 text-xs">
      {rules.map((rule) => (
        <span
          key={rule.label}
          className={cn(
            "flex items-center gap-1.5",
            rule.met
              ? "font-medium text-blue-300"
              : "text-slate-500",
          )}
        >
          <span
            className={cn(
              "grid size-4 place-items-center rounded-full border",
              rule.met
                ? "border-blue-500 bg-blue-600 text-white"
                : "border-slate-600",
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

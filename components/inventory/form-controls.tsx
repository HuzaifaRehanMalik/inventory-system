import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const controlClassName =
  "mt-2 h-10 w-full rounded-md border border-zinc-800 bg-surface-muted px-3.5 text-sm font-normal text-zinc-50 outline-none transition placeholder:text-zinc-500 hover:border-zinc-700 focus:border-emerald-400/60 focus:bg-zinc-900 focus:ring-4 focus:ring-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-50";

export function FormField({
  label,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
}) {
  return (
    <label className="block text-[13px] font-medium text-zinc-300">
      {label}
      <input {...props} className={controlClassName} />
      {hint ? (
        <span className="mt-2 block text-xs font-normal leading-5 text-zinc-500">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export function SelectField({
  label,
  hint,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-[13px] font-medium text-zinc-300">
      {label}
      <select {...props} className={controlClassName}>
        {children}
      </select>
      {hint ? (
        <span className="mt-2 block text-xs font-normal leading-5 text-zinc-500">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export function TextAreaField({
  label,
  hint,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
}) {
  return (
    <label className="block text-[13px] font-medium text-zinc-300">
      {label}
      <textarea
        {...props}
        className={`${controlClassName} min-h-28 resize-y py-3`}
      />
      {hint ? (
        <span className="mt-2 block text-xs font-normal leading-5 text-zinc-500">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export function FormSubmitButton({
  loading,
  children,
  tone = "primary",
}: {
  loading: boolean;
  children: ReactNode;
  tone?: "primary" | "danger";
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`inline-flex h-10 items-center justify-center rounded-md px-5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50 ${
        tone === "danger"
          ? "bg-red-500 text-white hover:bg-red-400 focus-visible:ring-red-500/40"
          : "bg-primary text-primary-ink hover:bg-primary-hover focus-visible:ring-emerald-500/40"
      }`}
    >
      {loading ? "Saving…" : children}
    </button>
  );
}

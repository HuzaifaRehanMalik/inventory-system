import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const controlClassName =
  "mt-1.5 h-9 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-50";

export function FormField({
  label,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
}) {
  return (
    <label className="block text-sm font-medium text-zinc-300">
      {label}
      <input {...props} className={controlClassName} />
      {hint ? (
        <span className="mt-1.5 block text-xs font-normal leading-5 text-zinc-500">
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
    <label className="block text-sm font-medium text-zinc-300">
      {label}
      <select {...props} className={controlClassName}>
        {children}
      </select>
      {hint ? (
        <span className="mt-1.5 block text-xs font-normal leading-5 text-zinc-500">
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
    <label className="block text-sm font-medium text-zinc-300">
      {label}
      <textarea
        {...props}
        className={`${controlClassName} min-h-28 resize-y py-3`}
      />
      {hint ? (
        <span className="mt-1.5 block text-xs font-normal leading-5 text-zinc-500">
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
      className={`inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium text-white transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50 ${
        tone === "danger"
          ? "bg-red-600 hover:bg-red-500 focus-visible:ring-red-500/50"
          : "bg-primary hover:bg-primary-hover focus-visible:ring-emerald-500/50"
      }`}
    >
      {loading ? "Saving…" : children}
    </button>
  );
}

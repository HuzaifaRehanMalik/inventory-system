import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const controlClassName =
  "mt-2 h-11 w-full rounded-xl border border-slate-600 bg-slate-950/65 px-3.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 disabled:cursor-not-allowed disabled:opacity-60";

export function FormField({
  label,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-200">
      {label}
      <input {...props} className={controlClassName} />
      {hint ? (
        <span className="mt-1.5 block text-xs font-normal leading-5 text-slate-400">
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
    <label className="block text-sm font-semibold text-slate-200">
      {label}
      <select {...props} className={controlClassName}>
        {children}
      </select>
      {hint ? (
        <span className="mt-1.5 block text-xs font-normal leading-5 text-slate-400">
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
    <label className="block text-sm font-semibold text-slate-200">
      {label}
      <textarea
        {...props}
        className={`${controlClassName} min-h-28 resize-y py-3`}
      />
      {hint ? (
        <span className="mt-1.5 block text-xs font-normal leading-5 text-slate-400">
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
      className={`inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-bold text-white shadow-lg transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${
        tone === "danger"
          ? "bg-rose-600 shadow-rose-950/25 hover:bg-rose-500 focus-visible:ring-rose-500/30"
          : "bg-blue-600 shadow-blue-950/30 hover:bg-blue-500 focus-visible:ring-blue-500/30"
      }`}
    >
      {loading ? "Saving…" : children}
    </button>
  );
}

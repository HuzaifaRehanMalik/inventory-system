import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function AuthCard({
  eyebrow,
  title,
  description,
  children,
  footer,
  className,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "animate-enter w-full rounded-3xl border border-slate-700 bg-slate-800/95 p-6 shadow-[0_24px_80px_-32px_rgba(2,6,23,.9)] backdrop-blur-xl sm:p-8",
        className,
      )}
    >
      <div className="mb-7">
        {eyebrow ? (
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {description}
        </p>
      </div>
      {children}
      {footer ? (
        <div className="mt-7 border-t border-slate-700 pt-6 text-center text-sm text-slate-300">
          {footer}
        </div>
      ) : null}
    </section>
  );
}

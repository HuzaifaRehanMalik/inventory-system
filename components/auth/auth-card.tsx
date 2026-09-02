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
        "animate-enter w-full rounded-lg border border-zinc-800 bg-zinc-900 p-6 sm:p-8",
        className,
      )}
    >
      <div className="mb-7">
        {eyebrow ? (
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-emerald-400">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-xl font-semibold tracking-tight text-white">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          {description}
        </p>
      </div>
      {children}
      {footer ? (
        <div className="mt-7 border-t border-zinc-800 pt-6 text-center text-sm text-zinc-400">
          {footer}
        </div>
      ) : null}
    </section>
  );
}

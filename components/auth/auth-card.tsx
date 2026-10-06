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
        "animate-enter w-full p-1 sm:p-2",
        className,
      )}
    >
      <div className="mb-8">
        {eyebrow ? (
          <p className="mb-3 text-[13px] font-medium text-emerald-400">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-serif text-4xl font-normal leading-[1.1] text-zinc-50">
          {title}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-zinc-400">
          {description}
        </p>
      </div>
      {children}
      {footer ? (
        <div className="mt-8 border-t border-zinc-800/80 pt-6 text-center text-sm text-zinc-400">
          {footer}
        </div>
      ) : null}
    </section>
  );
}

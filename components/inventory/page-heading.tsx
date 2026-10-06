import type { ReactNode } from "react";

export function PageHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-6 border-b border-zinc-800 pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-emerald-400">{eyebrow}</p>
        <h1 className="mt-2 font-serif text-4xl font-normal leading-[1.1] text-zinc-50 md:text-5xl">
          {title}
        </h1>
        <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-zinc-400">
          {description}
        </p>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      ) : null}
    </header>
  );
}

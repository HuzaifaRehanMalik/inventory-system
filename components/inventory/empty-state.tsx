import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-dashed border-zinc-700 bg-zinc-900 px-6 py-14 text-center">
      <span className="relative mx-auto grid size-14 place-items-center rounded-lg bg-emerald-100 text-emerald-300">
        {icon}
      </span>
      <h2 className="relative mt-5 text-base font-semibold tracking-tight text-zinc-50">
        {title}
      </h2>
      <p className="relative mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">
        {description}
      </p>
      {action ? <div className="relative mt-6">{action}</div> : null}
    </div>
  );
}

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
    <div className="border border-zinc-800 bg-zinc-900/50 rounded-lg p-6 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-lg border border-emerald-500/15 bg-emerald-500/10 text-emerald-400">
        {icon}
      </span>
      <h2 className="mt-4 text-sm font-medium text-zinc-300">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

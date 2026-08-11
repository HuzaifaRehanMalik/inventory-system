import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { inventoryModuleItems } from "@/components/inventory-modules";
import { requireCurrentUser } from "@/lib/auth/session";

export async function InventoryModulePlaceholder({
  moduleHref,
}: {
  moduleHref: string;
}) {
  await requireCurrentUser(moduleHref);

  const item = inventoryModuleItems.find(
    (navigationItem) => navigationItem.href === moduleHref,
  );

  if (!item) {
    throw new Error(`Unknown inventory module: ${moduleHref}`);
  }

  const Icon = item.icon;

  return (
    <div className="animate-enter mx-auto max-w-3xl">
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-slate-400 transition hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to home
      </Link>

      <section className="mt-6 overflow-hidden rounded-3xl border border-brand-border bg-surface/80 shadow-xl shadow-slate-950/15">
        <div className="border-b border-brand-border bg-slate-900/35 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-blue-300">
              <Icon className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-300">
                Stockeyfy feature
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {item.title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                {item.description}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex gap-3 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4 sm:p-5">
            <CheckCircle2
              className="mt-0.5 size-5 shrink-0 text-blue-300"
              aria-hidden="true"
            />
            <div>
              <h2 className="text-sm font-bold text-blue-100">
                Navigation is ready
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-300">
                This module now has a secure destination and is ready to be
                connected to its operational data and workflows.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

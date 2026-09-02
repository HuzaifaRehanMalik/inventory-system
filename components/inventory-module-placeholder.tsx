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
        className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-zinc-400 transition hover:text-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to home
      </Link>

      <section className="mt-6 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
        <div className="border-b border-zinc-800 bg-zinc-950/50 p-5">
          <div className="flex items-start gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-md bg-emerald-500/10 text-emerald-400">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-400">
                Stockeyfy feature
              </p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight text-white">
                {item.title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                {item.description}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex gap-3 rounded-md border border-emerald-500/15 bg-emerald-500/5 p-4">
            <CheckCircle2
              className="mt-0.5 size-5 shrink-0 text-emerald-400"
              aria-hidden="true"
            />
            <div>
              <h2 className="text-sm font-medium text-emerald-300">
                Navigation is ready
              </h2>
              <p className="mt-1 text-sm leading-6 text-zinc-400">
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

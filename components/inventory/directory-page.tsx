import { Building2, Tags, UsersRound } from "lucide-react";

import { AppToaster } from "@/components/app-toaster";
import { DirectoryCreateForm } from "@/components/inventory/directory-create-form";
import { EmptyState } from "@/components/inventory/empty-state";
import { PageHeading } from "@/components/inventory/page-heading";

type DirectoryKind = "category" | "supplier" | "customer";

type DirectoryRecord = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  active?: boolean;
  createdAt: Date;
  usageCount: number;
};

const content = {
  category: {
    eyebrow: "Catalog organization",
    title: "Categories",
    description: "Organize products so inventory can be searched, filtered, and reviewed quickly.",
    emptyTitle: "No categories yet",
    emptyDescription: "Add the first category to organize your product catalog.",
    usageLabel: "products",
    icon: Tags,
  },
  supplier: {
    eyebrow: "Purchasing directory",
    title: "Suppliers",
    description: "Maintain the suppliers you select when receiving inventory.",
    emptyTitle: "No suppliers yet",
    emptyDescription: "Add a supplier to associate it with future Stock In records.",
    usageLabel: "stock receipts",
    icon: Building2,
  },
  customer: {
    eyebrow: "Sales directory",
    title: "Customers",
    description: "Maintain customers and recipients used in Stock Out records.",
    emptyTitle: "No customers yet",
    emptyDescription: "Add a customer to associate it with future Stock Out records.",
    usageLabel: "stock issues",
    icon: UsersRound,
  },
} as const;

export function DirectoryPage({
  kind,
  records,
}: {
  kind: DirectoryKind;
  records: DirectoryRecord[];
}) {
  const details = content[kind];
  const Icon = details.icon;

  return (
    <div className="animate-enter">
      <PageHeading
        eyebrow={details.eyebrow}
        title={details.title}
        description={details.description}
      />

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/80 shadow-xl shadow-slate-950/15">
          {records.length ? (
            <ul className="divide-y divide-slate-700">
              {records.map((record) => (
                <li
                  key={record.id}
                  className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-300">
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-white">{record.name}</p>
                      {record.email || record.phone ? (
                        <p className="mt-1 truncate text-sm text-slate-400">
                          {[record.email, record.phone].filter(Boolean).join(" · ")}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-slate-400">
                          Added {record.createdAt.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pl-13 sm:pl-0">
                    {record.active === false ? (
                      <span className="rounded-full bg-slate-700 px-2.5 py-1 text-xs font-bold text-slate-300">
                        Inactive
                      </span>
                    ) : null}
                    <span className="text-sm font-semibold text-slate-300">
                      {record.usageCount} {details.usageLabel}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 sm:p-10">
              <EmptyState
                icon={<Icon className="size-6" />}
                title={details.emptyTitle}
                description={details.emptyDescription}
              />
            </div>
          )}
        </section>

        <DirectoryCreateForm kind={kind} />
      </div>
      <AppToaster />
    </div>
  );
}

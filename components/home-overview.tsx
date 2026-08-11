import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  CircleDollarSign,
  ClipboardClock,
  PackagePlus,
  PackageSearch,
  PencilLine,
  TriangleAlert,
} from "lucide-react";

import type { InventoryActivityType } from "@/app/generated/prisma/enums";

type DashboardMetrics = {
  totalProducts: number;
  totalInventoryQuantity: number;
  lowStockItems: number;
  totalInventoryValue: number;
  stockInToday: number;
  stockOutToday: number;
  pendingOrders: number;
};

type ActivityItem = {
  id: string;
  type: InventoryActivityType;
  message: string;
  createdAt: Date;
  product: { id: string; name: string } | null;
  performedBy: { name: string };
};

const activityIcons: Record<InventoryActivityType, LucideIcon> = {
  PRODUCT_ADDED: PackagePlus,
  PRODUCT_UPDATED: PencilLine,
  STOCK_RECEIVED: ArrowDownToLine,
  STOCK_REMOVED: ArrowUpFromLine,
  LOW_STOCK_WARNING: TriangleAlert,
  SETTINGS_UPDATED: PencilLine,
};

export function HomeOverview({
  firstName,
  metrics,
  recentActivity,
  currency,
}: {
  firstName: string;
  metrics: DashboardMetrics;
  recentActivity: ActivityItem[];
  currency: string;
}) {
  const summaryItems = [
    {
      label: "Total products",
      value: metrics.totalProducts.toLocaleString(),
      note: "Active catalog products",
      icon: PackageSearch,
      tone: "primary" as const,
    },
    {
      label: "Inventory quantity",
      value: metrics.totalInventoryQuantity.toLocaleString(),
      note: "Units currently on hand",
      icon: Boxes,
      tone: "accent" as const,
    },
    {
      label: "Low stock items",
      value: metrics.lowStockItems.toLocaleString(),
      note:
        metrics.lowStockItems > 0
          ? "Items need attention"
          : "Stock levels are healthy",
      icon: TriangleAlert,
      tone: "warning" as const,
    },
    {
      label: "Inventory value",
      value: formatCurrency(metrics.totalInventoryValue, currency),
      note: "Based on average purchase cost",
      icon: CircleDollarSign,
      tone: "accent" as const,
    },
    {
      label: "Stock in today",
      value: metrics.stockInToday.toLocaleString(),
      note: "Units received today",
      icon: ArrowDownToLine,
      tone: "success" as const,
    },
    {
      label: "Stock out today",
      value: metrics.stockOutToday.toLocaleString(),
      note: "Units removed today",
      icon: ArrowUpFromLine,
      tone: "danger" as const,
    },
    {
      label: "Pending orders",
      value: metrics.pendingOrders.toLocaleString(),
      note: "Orders awaiting completion",
      icon: ClipboardClock,
      tone: "primary" as const,
    },
  ];

  return (
    <div className="animate-enter">
      <section
        className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
        aria-labelledby="home-heading"
      >
        <div>
          <p className="text-sm font-semibold text-accent">Home</p>
          <h1
            id="home-heading"
            className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Monitor stock levels, move inventory, and stay ahead of low-stock
            items from one workspace.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/stock-in"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30"
          >
            <ArrowDownToLine className="size-4" />
            Stock In
          </Link>
          <Link
            href="/stock-out"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 text-sm font-bold text-rose-200 transition hover:border-rose-400/40 hover:bg-rose-500/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/20"
          >
            <ArrowUpFromLine className="size-4" />
            Stock Out
          </Link>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="inventory-overview-heading">
        <div className="mb-4">
          <h2
            id="inventory-overview-heading"
            className="text-base font-bold tracking-tight text-white"
          >
            Inventory overview
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Live values from your Stockeyfy inventory records.
          </p>
        </div>

        <dl className="grid grid-cols-1 gap-3 min-[430px]:grid-cols-2 lg:grid-cols-4">
          {summaryItems.map((item) => (
            <SummaryCard key={item.label} {...item} />
          ))}
        </dl>
      </section>

      <section className="mt-8" aria-labelledby="recent-activity-heading">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2
              id="recent-activity-heading"
              className="text-base font-bold tracking-tight text-white"
            >
              Recent inventory activity
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              The latest product and stock changes in your workspace.
            </p>
          </div>
          <Link
            href="/inventory"
            className="text-sm font-bold text-blue-300 transition hover:text-blue-200"
          >
            View inventory
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-brand-border bg-surface/75 shadow-xl shadow-slate-950/10">
          {recentActivity.length ? (
            <ul className="divide-y divide-slate-700/80">
              {recentActivity.map((activity) => {
                const Icon = activityIcons[activity.type];
                const content = (
                  <div className="flex items-start gap-3 px-4 py-4 sm:px-5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-300">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-5 text-slate-100">
                        {activity.message}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {activity.performedBy.name} · {formatActivityTime(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                );

                return (
                  <li key={activity.id}>
                    {activity.product ? (
                      <Link
                        href={`/inventory/${activity.product.id}`}
                        className="block transition hover:bg-slate-700/25"
                      >
                        {content}
                      </Link>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-6 py-10 text-center">
              <PackageSearch className="mx-auto size-8 text-slate-600" />
              <p className="mt-3 text-sm font-semibold text-slate-300">
                No inventory activity yet
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Add a product or record stock to start the activity feed.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  note,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
  tone: "primary" | "accent" | "warning" | "success" | "danger";
}) {
  const tones = {
    primary: "border-blue-400/20 bg-blue-500/12 text-blue-300",
    accent: "border-sky-400/20 bg-sky-400/10 text-sky-300",
    warning: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    danger: "border-rose-400/20 bg-rose-400/10 text-rose-300",
  };

  return (
    <div className="rounded-2xl border border-brand-border bg-surface/80 p-4 shadow-lg shadow-slate-950/10 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <dt className="text-xs font-semibold text-slate-400">{label}</dt>
          <dd className="mt-1 text-2xl font-bold tracking-tight text-white">
            {value}
          </dd>
        </div>
        <span
          className={`grid size-9 shrink-0 place-items-center rounded-xl border ${tones[tone]}`}
        >
          <Icon className="size-4.5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-xs text-slate-500">{note}</p>
    </div>
  );
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatActivityTime(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

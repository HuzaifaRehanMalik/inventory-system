import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Boxes,
  PackagePlus,
  ShoppingCart,
  TrendingDown,
  Trophy,
  TriangleAlert,
} from "lucide-react";

import { StockStatusBadge } from "@/components/inventory/stock-status-badge";
import type {
  DailyInventoryTrend,
  ProductPerformance,
} from "@/lib/inventory/calculations";

type DashboardMetrics = {
  totalProducts: number;
  totalInventoryQuantity: number;
  totalUnitsSold: number;
  totalUnitsReceived: number;
  lowStockItems: number;
};

type RecentMovement = {
  id: string;
  type: "STOCK_IN" | "STOCK_OUT";
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  occurredAt: Date;
  createdAt: Date;
  product: { id: string; name: string; sku: string };
  performedBy: { name: string };
};

export function HomeOverview({
  firstName,
  metrics,
  productPerformance,
  bestSellingProducts,
  lowestSellingProducts,
  lowStockProducts,
  inventoryTrend,
  recentMovements,
}: {
  firstName: string;
  metrics: DashboardMetrics;
  productPerformance: ProductPerformance[];
  bestSellingProducts: ProductPerformance[];
  lowestSellingProducts: ProductPerformance[];
  lowStockProducts: ProductPerformance[];
  inventoryTrend: DailyInventoryTrend[];
  recentMovements: RecentMovement[];
}) {
  const summaryItems = [
    {
      label: "Total products",
      value: metrics.totalProducts,
      note: "Active inventory items",
      icon: Boxes,
      tone: "primary" as const,
    },
    {
      label: "Current stock",
      value: metrics.totalInventoryQuantity,
      note: "Units available now",
      icon: BarChart3,
      tone: "accent" as const,
    },
    {
      label: "Units sold",
      value: metrics.totalUnitsSold,
      note: "All recorded sales",
      icon: ShoppingCart,
      tone: "success" as const,
    },
    {
      label: "Units received",
      value: metrics.totalUnitsReceived,
      note: "All received inventory",
      icon: ArrowDownToLine,
      tone: "primary" as const,
    },
    {
      label: "Low stock products",
      value: metrics.lowStockItems,
      note: "At or below minimum",
      icon: TriangleAlert,
      tone: "warning" as const,
    },
  ];

  return (
    <div className="animate-enter">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-accent">Inventory analytics</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            See which products are selling, which are underperforming, and where
            current stock needs attention.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ActionLink href="/products/new" icon={PackagePlus}>
            Add Stock
          </ActionLink>
          <ActionLink href="/stock-in" icon={ArrowDownToLine} secondary>
            Receive
          </ActionLink>
          <ActionLink href="/stock-out" icon={ArrowUpFromLine} secondary>
            Sell
          </ActionLink>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="inventory-summary-heading">
        <div className="mb-4">
          <h2 id="inventory-summary-heading" className="text-base font-bold text-white">
            Inventory summary
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Lifetime movement totals and live stock levels from the database.
          </p>
        </div>
        <dl className="grid grid-cols-1 gap-3 min-[430px]:grid-cols-2 lg:grid-cols-5">
          {summaryItems.map((item) => (
            <SummaryCard key={item.label} {...item} />
          ))}
        </dl>
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.75fr)]">
        <MovementChart data={inventoryTrend} />
        <LowStockPanel products={lowStockProducts} />
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <RankingPanel
          title="Best selling products"
          description="Products with the highest recorded unit sales."
          icon={Trophy}
          products={bestSellingProducts}
          emptyMessage="No sales have been recorded yet."
        />
        <RankingPanel
          title="Lowest sales"
          description="Products with the fewest recorded unit sales."
          icon={TrendingDown}
          products={lowestSellingProducts}
          emptyMessage="Add products to compare performance."
        />
      </section>

      <PerformanceTable products={productPerformance} />
      <RecentMovementPanel movements={recentMovements} />
    </div>
  );
}

function ActionLink({
  href,
  icon: Icon,
  secondary = false,
  children,
}: {
  href: string;
  icon: LucideIcon;
  secondary?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 ${
        secondary
          ? "border border-slate-600 bg-slate-800 text-slate-100 hover:border-blue-400/40 hover:text-blue-200 focus-visible:ring-blue-500/20"
          : "bg-blue-600 text-white shadow-lg shadow-blue-950/30 hover:bg-blue-500 focus-visible:ring-blue-500/30"
      }`}
    >
      <Icon className="size-4" aria-hidden="true" />
      {children}
    </Link>
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
  value: number;
  note: string;
  icon: LucideIcon;
  tone: "primary" | "accent" | "warning" | "success";
}) {
  const tones = {
    primary: "border-blue-400/20 bg-blue-500/12 text-blue-300",
    accent: "border-sky-400/20 bg-sky-400/10 text-sky-300",
    warning: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  };

  return (
    <div className="rounded-2xl border border-brand-border bg-surface/80 p-4 shadow-lg shadow-slate-950/10 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <dt className="text-xs font-semibold text-slate-400">{label}</dt>
          <dd className="mt-1 text-2xl font-bold tracking-tight text-white">
            {value.toLocaleString()}
          </dd>
        </div>
        <span className={`grid size-9 place-items-center rounded-xl border ${tones[tone]}`}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-xs text-slate-500">{note}</p>
    </div>
  );
}

function MovementChart({ data }: { data: DailyInventoryTrend[] }) {
  const maximum = Math.max(
    1,
    ...data.flatMap((day) => [day.unitsReceived, day.unitsSold]),
  );

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/75 p-5 shadow-xl shadow-slate-950/10 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white">Sales trend & inventory movement</h2>
          <p className="mt-1 text-sm text-slate-400">
            Daily units sold versus received over the last 30 days.
          </p>
        </div>
        <div className="flex gap-4 text-xs font-semibold text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-blue-400" /> Sold
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-emerald-400" /> Received
          </span>
        </div>
      </div>
      <div className="mt-6 overflow-x-auto pb-7">
        <div
          className="grid h-56 min-w-[620px] grid-cols-[repeat(30,minmax(12px,1fr))] items-end gap-1 border-b border-slate-600 px-1"
          role="img"
          aria-label="Thirty-day chart comparing units sold and received"
        >
          {data.map((day, index) => (
            <div
              key={day.day}
              className="group relative flex h-full items-end justify-center gap-px"
              title={`${formatDay(day.day)}: ${day.unitsSold} sold, ${day.unitsReceived} received, net ${day.netMovement}`}
            >
              <span
                className="w-1/2 min-w-1 rounded-t bg-blue-400/90 transition group-hover:bg-blue-300"
                style={{ height: `${Math.max(1, (day.unitsSold / maximum) * 100)}%` }}
              />
              <span
                className="w-1/2 min-w-1 rounded-t bg-emerald-400/85 transition group-hover:bg-emerald-300"
                style={{ height: `${Math.max(1, (day.unitsReceived / maximum) * 100)}%` }}
              />
              {index % 5 === 0 || index === data.length - 1 ? (
                <span className="absolute -bottom-6 whitespace-nowrap text-[10px] text-slate-500">
                  {formatShortDay(day.day)}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LowStockPanel({ products }: { products: ProductPerformance[] }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/75 p-5 shadow-xl shadow-slate-950/10 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white">Low stock products</h2>
          <p className="mt-1 text-sm text-slate-400">Current levels needing attention.</p>
        </div>
        <TriangleAlert className="size-5 text-amber-300" aria-hidden="true" />
      </div>
      {products.length ? (
        <ul className="mt-5 divide-y divide-slate-700/80">
          {products.map((product) => (
            <li key={product.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
              <div className="min-w-0">
                <Link
                  href={`/inventory/${product.id}`}
                  className="truncate text-sm font-bold text-white hover:text-blue-300"
                >
                  {product.name}
                </Link>
                <p className="mt-1 text-xs text-slate-500">
                  {product.quantity.toLocaleString()} available · minimum {product.minimumStock.toLocaleString()}
                </p>
              </div>
              <StockStatusBadge status={product.status} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-xl border border-emerald-400/15 bg-emerald-400/5 p-4 text-sm text-emerald-200">
          All active products are above their low-stock thresholds.
        </p>
      )}
    </div>
  );
}

function RankingPanel({
  title,
  description,
  icon: Icon,
  products,
  emptyMessage,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  products: ProductPerformance[];
  emptyMessage: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/75 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-9 place-items-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-300">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-bold text-white">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        </div>
      </div>
      {products.length ? (
        <ol className="mt-5 space-y-2">
          {products.map((product, index) => (
            <li key={product.id} className="flex items-center gap-3 rounded-xl bg-slate-900/45 px-3 py-3">
              <span className="grid size-7 place-items-center rounded-lg bg-slate-700 text-xs font-bold text-slate-300">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <Link href={`/inventory/${product.id}`} className="block truncate text-sm font-bold text-white hover:text-blue-300">
                  {product.name}
                </Link>
                <p className="text-xs text-slate-500">{product.sku}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-white">{product.unitsSold.toLocaleString()}</p>
                <p className="text-[11px] text-slate-500">units sold</p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-5 text-sm text-slate-500">{emptyMessage}</p>
      )}
    </div>
  );
}

function PerformanceTable({ products }: { products: ProductPerformance[] }) {
  return (
    <section className="mt-8" aria-labelledby="performance-heading">
      <div className="mb-4">
        <h2 id="performance-heading" className="text-base font-bold text-white">
          Product performance comparison
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Compare sales, receipts, sell-through, and current stock for every active product.
        </p>
      </div>
      {products.length ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-700 bg-slate-800/75">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead className="border-b border-slate-700 bg-slate-900/65 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-4 font-bold">Product</th>
                <th className="px-5 py-4 text-right font-bold">Sold</th>
                <th className="px-5 py-4 text-right font-bold">Received</th>
                <th className="px-5 py-4 text-right font-bold">Sell-through</th>
                <th className="px-5 py-4 text-right font-bold">Current stock</th>
                <th className="px-5 py-4 font-bold">Stock status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/80">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-700/20">
                  <td className="px-5 py-4">
                    <Link href={`/inventory/${product.id}`} className="font-bold text-white hover:text-blue-300">
                      {product.name}
                    </Link>
                    <p className="mt-1 font-mono text-xs text-slate-500">{product.sku}</p>
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-white">{product.unitsSold.toLocaleString()}</td>
                  <td className="px-5 py-4 text-right text-slate-300">{product.unitsReceived.toLocaleString()}</td>
                  <td className="px-5 py-4 text-right text-slate-300">{product.sellThroughRate.toFixed(1)}%</td>
                  <td className="px-5 py-4 text-right font-bold text-white">{product.quantity.toLocaleString()}</td>
                  <td className="px-5 py-4"><StockStatusBadge status={product.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/35 p-8 text-center text-sm text-slate-400">
          Add a stock item to begin comparing product performance.
        </div>
      )}
    </section>
  );
}

function RecentMovementPanel({ movements }: { movements: RecentMovement[] }) {
  return (
    <section className="mt-8" aria-labelledby="recent-movement-heading">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 id="recent-movement-heading" className="text-base font-bold text-white">
            Recent inventory movement
          </h2>
          <p className="mt-1 text-sm text-slate-400">The latest sales and receipts recorded in inventory.</p>
        </div>
        <Link href="/inventory" className="text-sm font-bold text-blue-300 hover:text-blue-200">
          View inventory
        </Link>
      </div>
      {movements.length ? (
        <ul className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/75 divide-y divide-slate-700/80">
          {movements.map((movement) => {
            const received = movement.type === "STOCK_IN";
            const Icon = received ? ArrowDownToLine : ArrowUpFromLine;

            return (
              <li key={movement.id}>
                <Link href={`/inventory/${movement.product.id}`} className="flex items-center gap-3 px-4 py-4 transition hover:bg-slate-700/25 sm:px-5">
                  <span className={`grid size-9 place-items-center rounded-xl border ${received ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border-blue-400/20 bg-blue-500/10 text-blue-300"}`}>
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-white">
                      {received ? "Received" : "Sold"} {movement.quantity.toLocaleString()} units of {movement.product.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {movement.previousQuantity.toLocaleString()} → {movement.newQuantity.toLocaleString()} · {movement.performedBy.name}
                    </p>
                  </div>
                  <time dateTime={movement.occurredAt.toISOString()} className="hidden text-xs text-slate-500 sm:block">
                    {formatMovementDate(movement.occurredAt)}
                  </time>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/35 p-8 text-center text-sm text-slate-400">
          No inventory movements have been recorded yet.
        </div>
      )}
    </section>
  );
}

function formatDay(day: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${day}T00:00:00Z`));
}

function formatShortDay(day: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${day}T00:00:00Z`));
}

function formatMovementDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

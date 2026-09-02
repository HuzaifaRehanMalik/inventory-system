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
          <p className="text-xs font-medium text-zinc-500">Inventory analytics</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-white">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
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
          <h2 id="inventory-summary-heading" className="text-sm font-semibold text-white">
            Inventory summary
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
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
      className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
        secondary
          ? "border border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white"
          : "bg-primary text-white hover:bg-primary-hover"
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
    primary: "bg-emerald-500/10 text-emerald-400",
    accent: "bg-sky-500/10 text-sky-400",
    warning: "bg-amber-500/10 text-amber-400",
    success: "bg-green-500/10 text-green-400",
  };

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <dt className="text-xs font-medium text-zinc-500">{label}</dt>
          <dd className="mt-1 text-2xl font-semibold tracking-tight text-white">
            {value.toLocaleString()}
          </dd>
        </div>
        <span className={`grid size-8 place-items-center rounded-md ${tones[tone]}`}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-xs text-zinc-600">{note}</p>
    </div>
  );
}

function MovementChart({ data }: { data: DailyInventoryTrend[] }) {
  const maximum = Math.max(
    1,
    ...data.flatMap((day) => [day.unitsReceived, day.unitsSold]),
  );

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Sales trend & inventory movement</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Daily units sold versus received over the last 30 days.
          </p>
        </div>
        <div className="flex gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-emerald-400" /> Sold
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-zinc-600" /> Received
          </span>
        </div>
      </div>
      <div className="mt-6 overflow-x-auto pb-7">
        <div
          className="grid h-56 min-w-[620px] grid-cols-[repeat(30,minmax(12px,1fr))] items-end gap-1 border-b border-zinc-700 px-1"
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
                className="w-1/2 min-w-1 rounded-t bg-emerald-400/80 transition group-hover:bg-emerald-400"
                style={{ height: `${Math.max(1, (day.unitsSold / maximum) * 100)}%` }}
              />
              <span
                className="w-1/2 min-w-1 rounded-t bg-zinc-600 transition group-hover:bg-zinc-500"
                style={{ height: `${Math.max(1, (day.unitsReceived / maximum) * 100)}%` }}
              />
              {index % 5 === 0 || index === data.length - 1 ? (
                <span className="absolute -bottom-6 whitespace-nowrap text-[10px] text-zinc-600">
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
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Low stock products</h2>
          <p className="mt-1 text-xs text-zinc-500">Current levels needing attention.</p>
        </div>
        <TriangleAlert className="size-5 text-amber-400" aria-hidden="true" />
      </div>
      {products.length ? (
        <ul className="mt-5 divide-y divide-zinc-800">
          {products.map((product) => (
            <li key={product.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
              <div className="min-w-0">
                <Link
                  href={`/inventory/${product.id}`}
                  className="truncate text-sm font-medium text-white hover:text-emerald-400"
                >
                  {product.name}
                </Link>
                <p className="mt-1 text-xs text-zinc-500">
                  {product.quantity.toLocaleString()} available · minimum {product.minimumStock.toLocaleString()}
                </p>
              </div>
              <StockStatusBadge status={product.status} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-md border border-emerald-500/15 bg-emerald-500/5 p-3 text-sm text-emerald-300">
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
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-8 place-items-center rounded-md bg-emerald-500/10 text-emerald-400">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <p className="mt-1 text-xs text-zinc-500">{description}</p>
        </div>
      </div>
      {products.length ? (
        <ol className="mt-5 space-y-2">
          {products.map((product, index) => (
            <li key={product.id} className="flex items-center gap-3 rounded-md bg-zinc-800/50 px-3 py-2.5">
              <span className="grid size-7 place-items-center rounded bg-zinc-700 text-xs font-bold text-zinc-300">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <Link href={`/inventory/${product.id}`} className="block truncate text-sm font-medium text-white hover:text-emerald-400">
                  {product.name}
                </Link>
                <p className="text-xs text-zinc-500">{product.sku}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{product.unitsSold.toLocaleString()}</p>
                <p className="text-[11px] text-zinc-500">units sold</p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-5 text-sm text-zinc-500">{emptyMessage}</p>
      )}
    </div>
  );
}

function PerformanceTable({ products }: { products: ProductPerformance[] }) {
  return (
    <section className="mt-8" aria-labelledby="performance-heading">
      <div className="mb-4">
        <h2 id="performance-heading" className="text-sm font-semibold text-white">
          Product performance comparison
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Compare sales, receipts, sell-through, and current stock for every active product.
        </p>
      </div>
      {products.length ? (
        <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-950/50 text-xs font-medium uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3 text-right">Sold</th>
                <th className="px-4 py-3 text-right">Received</th>
                <th className="px-4 py-3 text-right">Sell-through</th>
                <th className="px-4 py-3 text-right">Current stock</th>
                <th className="px-4 py-3">Stock status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-zinc-800/50">
                  <td className="px-4 py-3">
                    <Link href={`/inventory/${product.id}`} className="font-medium text-white hover:text-emerald-400">
                      {product.name}
                    </Link>
                    <p className="mt-1 font-mono text-xs text-zinc-500">{product.sku}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-white">{product.unitsSold.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-zinc-300">{product.unitsReceived.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-zinc-300">{product.sellThroughRate.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-right font-medium text-white">{product.quantity.toLocaleString()}</td>
                  <td className="px-4 py-3"><StockStatusBadge status={product.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950/50 p-6 text-center text-sm text-zinc-500">
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
          <h2 id="recent-movement-heading" className="text-sm font-semibold text-white">
            Recent inventory movement
          </h2>
          <p className="mt-1 text-xs text-zinc-500">The latest sales and receipts recorded in inventory.</p>
        </div>
        <Link href="/inventory" className="text-sm font-medium text-emerald-400 hover:text-emerald-300">
          View inventory
        </Link>
      </div>
      {movements.length ? (
        <ul className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 divide-y divide-zinc-800">
          {movements.map((movement) => {
            const received = movement.type === "STOCK_IN";
            const Icon = received ? ArrowDownToLine : ArrowUpFromLine;

            return (
              <li key={movement.id}>
                <Link href={`/inventory/${movement.product.id}`} className="flex items-center gap-3 px-4 py-4 transition hover:bg-zinc-800/50 sm:px-5">
                  <span className={`grid size-9 place-items-center rounded-md ${received ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-700/50 text-zinc-300"}`}>
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {received ? "Received" : "Sold"} {movement.quantity.toLocaleString()} units of {movement.product.name}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {movement.previousQuantity.toLocaleString()} → {movement.newQuantity.toLocaleString()} · {movement.performedBy.name}
                    </p>
                  </div>
                  <time dateTime={movement.occurredAt.toISOString()} className="hidden text-xs text-zinc-500 sm:block">
                    {formatMovementDate(movement.occurredAt)}
                  </time>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950/50 p-6 text-center text-sm text-zinc-500">
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

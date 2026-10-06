import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowUpRight,
  BarChart3,
  Boxes,
  PackageCheck,
  PackagePlus,
  ShoppingCart,
  TrendingDown,
  Trophy,
  TriangleAlert,
} from "lucide-react";

import { CountUp } from "@/components/count-up";
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
  const secondaryMetrics = [
    {
      label: "Total products",
      value: metrics.totalProducts,
      note: "Active inventory items",
      icon: Boxes,
    },
    {
      label: "Units sold",
      value: metrics.totalUnitsSold,
      note: "All recorded sales",
      icon: ShoppingCart,
    },
    {
      label: "Units received",
      value: metrics.totalUnitsReceived,
      note: "All received inventory",
      icon: ArrowDownToLine,
    },
  ];
  const needsAttention = metrics.lowStockItems > 0;

  return (
    <div className="animate-enter">
      <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[13px] font-medium text-emerald-400">Inventory analytics</p>
          <h1 className="mt-2 font-serif text-4xl font-normal leading-[1.1] text-zinc-50 md:text-6xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-3 max-w-[56ch] text-[15px] leading-relaxed text-zinc-400">
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

      <section className="mt-10" aria-labelledby="inventory-summary-heading">
        <h2 id="inventory-summary-heading" className="sr-only">
          Inventory summary
        </h2>
        <dl className="stagger grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
          <div className="panel lift relative overflow-hidden p-8 sm:col-span-2 lg:row-span-2">
            <div className="relative flex h-full flex-col justify-between gap-10">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-sm font-medium text-zinc-400">Current stock</dt>
                <span className="grid size-10 place-items-center rounded-md bg-emerald-100 text-emerald-300">
                  <BarChart3 className="size-5" aria-hidden="true" />
                </span>
              </div>
              <div>
                <dd className="font-serif text-7xl font-normal leading-none text-zinc-50 md:text-8xl">
                  <CountUp value={metrics.totalInventoryQuantity} />
                </dd>
                <p className="mt-3 text-sm text-zinc-400">
                  Units available now across{" "}
                  <span className="font-medium text-zinc-200">
                    {metrics.totalProducts.toLocaleString()} products
                  </span>
                </p>
              </div>
            </div>
          </div>

          {secondaryMetrics.map((item) => (
            <SummaryCard key={item.label} {...item} />
          ))}

          <div className="panel lift flex flex-col justify-between p-5">
            <div className="flex items-start justify-between gap-3">
              <dt className="text-[13px] font-medium text-zinc-400">
                Low stock products
              </dt>
              <TriangleAlert
                className={`size-4 ${needsAttention ? "text-amber-400" : "text-zinc-600"}`}
                aria-hidden="true"
              />
            </div>
            <div className="mt-6">
              <dd className="font-mono text-3xl font-semibold tracking-tight text-zinc-50">
                <CountUp value={metrics.lowStockItems} />
              </dd>
              <p className="mt-1 text-xs text-zinc-500">At or below minimum</p>
            </div>
          </div>
        </dl>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.8fr)]">
        <MovementChart data={inventoryTrend} />
        <LowStockPanel products={lowStockProducts} />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
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
          muted
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
      className={`inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 ${
        secondary
          ? "border border-zinc-800 bg-zinc-900 font-medium text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-50"
          : "bg-primary font-semibold text-primary-ink hover:bg-primary-hover"
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
}: {
  label: string;
  value: number;
  note: string;
  icon: LucideIcon;
}) {
  return (
    <div className="panel lift flex flex-col justify-between p-5">
      <div className="flex items-start justify-between gap-3">
        <dt className="text-[13px] font-medium text-zinc-400">{label}</dt>
        <Icon className="size-4 text-zinc-600" aria-hidden="true" />
      </div>
      <div className="mt-6">
        <dd className="font-mono text-3xl font-semibold tracking-tight text-zinc-50">
          <CountUp value={value} />
        </dd>
        <p className="mt-1 text-xs text-zinc-500">{note}</p>
      </div>
    </div>
  );
}

function MovementChart({ data }: { data: DailyInventoryTrend[] }) {
  const maximum = Math.max(
    1,
    ...data.flatMap((day) => [day.unitsReceived, day.unitsSold]),
  );
  const totalSold = data.reduce((sum, day) => sum + day.unitsSold, 0);
  const totalReceived = data.reduce((sum, day) => sum + day.unitsReceived, 0);

  return (
    <div className="panel lift p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-zinc-50">
            Sales trend & inventory movement
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Daily units sold versus received over the last 30 days.
          </p>
        </div>
        <div className="flex gap-6">
          <div>
            <p className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span className="size-2 rounded-full bg-emerald-400" aria-hidden="true" /> Sold
            </p>
            <p className="mt-1 font-mono text-xl font-semibold text-zinc-50">
              <CountUp value={totalSold} />
            </p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span className="size-2 rounded-full bg-zinc-500" aria-hidden="true" /> Received
            </p>
            <p className="mt-1 font-mono text-xl font-semibold text-zinc-50">
              <CountUp value={totalReceived} />
            </p>
          </div>
        </div>
      </div>
      <div className="mt-8 overflow-x-auto pb-7">
        <div className="relative min-w-[620px]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 grid h-56 grid-rows-4"
          >
            {[0, 1, 2, 3].map((line) => (
              <span key={line} className="border-t border-dashed border-zinc-800" />
            ))}
          </div>
          <div
            className="relative grid h-56 grid-cols-[repeat(30,minmax(12px,1fr))] items-end gap-1 border-b border-zinc-700 px-1"
            role="img"
            aria-label="Thirty-day chart comparing units sold and received"
          >
            {data.map((day, index) => (
              <div
                key={day.day}
                className="group relative flex h-full items-end justify-center gap-px rounded-t-sm transition hover:bg-zinc-950"
                title={`${formatDay(day.day)}: ${day.unitsSold} sold, ${day.unitsReceived} received, net ${day.netMovement}`}
              >
                <span
                  className="bar-grow w-1/2 min-w-1 rounded-t-[2px] bg-emerald-400 transition group-hover:bg-emerald-600"
                  style={{
                    height: `${Math.max(1, (day.unitsSold / maximum) * 100)}%`,
                    animationDelay: `${index * 14}ms`,
                  }}
                />
                <span
                  className="bar-grow w-1/2 min-w-1 rounded-t-[2px] bg-zinc-700 transition group-hover:bg-zinc-600"
                  style={{
                    height: `${Math.max(1, (day.unitsReceived / maximum) * 100)}%`,
                    animationDelay: `${index * 14}ms`,
                  }}
                />
                {index % 5 === 0 || index === data.length - 1 ? (
                  <span className="absolute -bottom-6 whitespace-nowrap font-mono text-[10px] text-zinc-500">
                    {formatShortDay(day.day)}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LowStockPanel({ products }: { products: ProductPerformance[] }) {
  return (
    <div className="panel flex flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-zinc-50">Low stock products</h2>
          <p className="mt-1 text-sm text-zinc-500">Current levels needing attention.</p>
        </div>
        <span className="grid size-9 place-items-center rounded-md bg-[#fbf3db] text-amber-400">
          <TriangleAlert className="size-4" aria-hidden="true" />
        </span>
      </div>
      {products.length ? (
        <ul className="stagger mt-5 space-y-2">
          {products.map((product, index) => {
            const ratio = product.minimumStock
              ? Math.min(1, product.quantity / product.minimumStock)
              : 0;

            return (
              <li key={product.id} style={{ "--i": index } as React.CSSProperties}>
                <Link
                  href={`/inventory/${product.id}`}
                  className="group block rounded-md border border-zinc-800 bg-zinc-900 px-4 py-3 transition hover:border-zinc-700 hover:bg-surface-muted"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-medium text-zinc-50 group-hover:text-emerald-300">
                      {product.name}
                    </span>
                    <StockStatusBadge status={product.status} />
                  </div>
                  <div className="mt-2.5 flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={`bar-grow-x h-1 rounded-full ${product.quantity === 0 ? "bg-red-400" : "bg-amber-400"}`}
                      style={{ width: `${Math.max(4, ratio * 100)}%` }}
                    />
                    <span className="shrink-0 text-[11px] text-zinc-500">
                      <span className="font-mono">{product.quantity.toLocaleString()}</span> available, minimum{" "}
                      <span className="font-mono">{product.minimumStock.toLocaleString()}</span>
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-6 flex flex-1 flex-col items-center justify-center rounded-md bg-emerald-100 px-4 py-8 text-center">
          <PackageCheck className="size-6 text-emerald-400" aria-hidden="true" />
          <p className="mt-3 text-sm text-emerald-200">
            All active products are above their low-stock thresholds.
          </p>
        </div>
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
  muted = false,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  products: ProductPerformance[];
  emptyMessage: string;
  muted?: boolean;
}) {
  const top = Math.max(1, ...products.map((product) => product.unitsSold));

  return (
    <div className="panel p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span
          className={`grid size-9 shrink-0 place-items-center rounded-md ${
            muted ? "bg-zinc-950 text-zinc-400" : "bg-emerald-100 text-emerald-300"
          }`}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-semibold tracking-tight text-zinc-50">{title}</h2>
          <p className="mt-0.5 text-sm text-zinc-500">{description}</p>
        </div>
      </div>
      {products.length ? (
        <ol className="stagger mt-6 space-y-4">
          {products.map((product, index) => (
            <li key={product.id} className="flex items-center gap-4" style={{ "--i": index } as React.CSSProperties}>
              <span className="w-6 shrink-0 font-mono text-sm text-zinc-500">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <Link
                    href={`/inventory/${product.id}`}
                    className="truncate text-sm font-medium text-zinc-50 transition hover:text-emerald-300"
                  >
                    {product.name}
                  </Link>
                  <span className="shrink-0 font-mono text-sm font-semibold text-zinc-50">
                    {product.unitsSold.toLocaleString()}
                    <span className="ml-1 font-sans text-[11px] font-normal text-zinc-500">units sold</span>
                  </span>
                </div>
                <span
                  aria-hidden="true"
                  className={`bar-grow-x mt-2 block h-1 rounded-full ${muted ? "bg-zinc-600" : "bg-emerald-400"}`}
                  style={{ width: `${Math.max(3, (product.unitsSold / top) * 100)}%` }}
                />
                <p className="mt-1.5 font-mono text-[11px] text-zinc-500">{product.sku}</p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-6 rounded-md border border-dashed border-zinc-800 px-4 py-8 text-center text-sm text-zinc-500">
          {emptyMessage}
        </p>
      )}
    </div>
  );
}

function PerformanceTable({ products }: { products: ProductPerformance[] }) {
  return (
    <section className="mt-20" aria-labelledby="performance-heading">
      <div className="mb-5">
        <h2 id="performance-heading" className="font-serif text-3xl font-normal text-zinc-50">
          Product performance comparison
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Compare sales, receipts, sell-through, and current stock for every active product.
        </p>
      </div>
      {products.length ? (
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead className="border-b border-zinc-800 text-xs text-zinc-500">
              <tr>
                <th className="px-5 py-3.5 font-medium">Product</th>
                <th className="px-5 py-3.5 text-right font-medium">Sold</th>
                <th className="px-5 py-3.5 text-right font-medium">Received</th>
                <th className="px-5 py-3.5 text-right font-medium">Sell-through</th>
                <th className="px-5 py-3.5 text-right font-medium">Current stock</th>
                <th className="px-5 py-3.5 font-medium">Stock status</th>
              </tr>
            </thead>
            <tbody className="stagger divide-y divide-zinc-800/70">
              {products.map((product, index) => (
                <tr key={product.id} style={{ "--i": index } as React.CSSProperties} className="transition hover:bg-zinc-950">
                  <td className="px-5 py-3.5">
                    <Link href={`/inventory/${product.id}`} className="font-medium text-zinc-50 transition hover:text-emerald-300">
                      {product.name}
                    </Link>
                    <p className="mt-0.5 font-mono text-xs text-zinc-500">{product.sku}</p>
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono font-medium text-zinc-50">{product.unitsSold.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-right font-mono text-zinc-400">{product.unitsReceived.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-right font-mono text-zinc-400">{product.sellThroughRate.toFixed(1)}%</td>
                  <td className="px-5 py-3.5 text-right font-mono font-medium text-zinc-50">{product.quantity.toLocaleString()}</td>
                  <td className="px-5 py-3.5"><StockStatusBadge status={product.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-900/40 p-10 text-center text-sm text-zinc-500">
          Add a stock item to begin comparing product performance.
        </div>
      )}
    </section>
  );
}

function RecentMovementPanel({ movements }: { movements: RecentMovement[] }) {
  return (
    <section className="mt-20" aria-labelledby="recent-movement-heading">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 id="recent-movement-heading" className="font-serif text-3xl font-normal text-zinc-50">
            Recent inventory movement
          </h2>
          <p className="mt-1 text-sm text-zinc-500">The latest sales and receipts recorded in inventory.</p>
        </div>
        <Link
          href="/inventory"
          className="group inline-flex shrink-0 items-center gap-1 text-sm font-medium text-emerald-400 transition hover:text-emerald-300"
        >
          View inventory
          <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
      {movements.length ? (
        <ul className="panel stagger divide-y divide-zinc-800/70 overflow-hidden">
          {movements.map((movement, index) => {
            const received = movement.type === "STOCK_IN";
            const Icon = received ? ArrowDownToLine : ArrowUpFromLine;

            return (
              <li key={movement.id} style={{ "--i": index } as React.CSSProperties}>
                <Link href={`/inventory/${movement.product.id}`} className="group flex items-center gap-4 px-5 py-4 transition hover:bg-zinc-950 sm:px-6">
                  <span className={`grid size-10 shrink-0 place-items-center rounded-md border ${received ? "border-transparent bg-emerald-100 text-emerald-300" : "border-transparent bg-zinc-950 text-zinc-400"}`}>
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-zinc-300">
                      <span className="font-medium text-zinc-50">
                        {received ? "Received" : "Sold"} {movement.quantity.toLocaleString()} units
                      </span>{" "}
                      of {movement.product.name}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      <span className="font-mono">
                        {movement.previousQuantity.toLocaleString()} → {movement.newQuantity.toLocaleString()}
                      </span>
                      <span className="mx-2 text-zinc-700">/</span>
                      {movement.performedBy.name}
                    </p>
                  </div>
                  <time dateTime={movement.occurredAt.toISOString()} className="hidden font-mono text-xs text-zinc-500 sm:block">
                    {formatMovementDate(movement.occurredAt)}
                  </time>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-900/40 p-10 text-center text-sm text-zinc-500">
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

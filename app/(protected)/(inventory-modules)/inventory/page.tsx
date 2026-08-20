import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  PackagePlus,
  PencilLine,
  Search,
} from "lucide-react";

import { AppToaster } from "@/components/app-toaster";
import { DeleteProductButton } from "@/components/inventory/delete-product-button";
import { EmptyState } from "@/components/inventory/empty-state";
import { PageHeading } from "@/components/inventory/page-heading";
import { StockStatusBadge } from "@/components/inventory/stock-status-badge";
import { requireCurrentUser } from "@/lib/auth/session";
import {
  getBusinessSettings,
  getInventoryPage,
} from "@/lib/inventory/queries";
import { inventorySearchSchema } from "@/validations/inventory";

export const metadata: Metadata = { title: "Inventory" };

type InventoryPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function InventoryPage({
  searchParams,
}: InventoryPageProps) {
  const user = await requireCurrentUser("/inventory");
  const raw = await searchParams;
  const filters = inventorySearchSchema.parse({
    query: singleValue(raw.query),
    category: singleValue(raw.category),
    status: singleValue(raw.status) || "ALL",
    sort: singleValue(raw.sort) || "updated",
    direction: singleValue(raw.direction) || "desc",
    page: singleValue(raw.page) || "1",
  });
  const [inventory, settings] = await Promise.all([
    getInventoryPage(user.id, filters),
    getBusinessSettings(user.id),
  ]);
  const currencyFormatter = new Intl.NumberFormat("en", {
    style: "currency",
    currency: settings.currency,
  });

  return (
    <div className="animate-enter">
      <PageHeading
        eyebrow="Inventory"
        title="Current inventory"
        description="Search, filter, and review every product currently tracked in your Stockeyfy workspace."
        actions={
          <Link
            href="/products/new"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30"
          >
            <PackagePlus className="size-4" />
            Add Stock
          </Link>
        }
      />

      <form
        action="/inventory"
        className="mt-7 grid gap-3 rounded-2xl border border-slate-700 bg-slate-800/65 p-4 md:grid-cols-[minmax(220px,1fr)_180px_160px_160px_110px]"
      >
        <label className="relative block">
          <span className="sr-only">Search products</span>
          <Search className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-slate-500" />
          <input
            name="query"
            defaultValue={filters.query}
            placeholder="Search products or SKU..."
            maxLength={160}
            className="h-11 w-full rounded-xl border border-slate-600 bg-slate-950/65 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
          />
        </label>
        <FilterSelect
          label="Category"
          name="category"
          defaultValue={filters.category}
        >
          <option value="">All categories</option>
          {inventory.categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect label="Status" name="status" defaultValue={filters.status}>
          <option value="ALL">All statuses</option>
          <option value="IN_STOCK">In Stock</option>
          <option value="LOW_STOCK">Low Stock</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
        </FilterSelect>
        <FilterSelect label="Sort" name="sort" defaultValue={filters.sort}>
          <option value="updated">Last updated</option>
          <option value="name">Product name</option>
          <option value="quantity">Quantity</option>
          <option value="price">Unit price</option>
        </FilterSelect>
        <input type="hidden" name="direction" value={filters.direction} />
        <button
          type="submit"
          className="h-11 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30"
        >
          Apply
        </button>
      </form>

      <section className="mt-5">
        {inventory.rows.length ? (
          <>
            <div className="hidden overflow-x-auto rounded-2xl border border-slate-700 bg-slate-800/75 shadow-xl shadow-slate-950/10 md:block">
              <table className="w-full min-w-[1260px] text-left text-sm">
                <thead className="border-b border-slate-700 bg-slate-900/65 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-5 py-4 font-bold">Product</th>
                    <th className="px-5 py-4 font-bold">SKU</th>
                    <th className="px-5 py-4 font-bold">Category</th>
                    <th className="px-5 py-4 text-right font-bold">Quantity</th>
                    <th className="px-5 py-4 text-right font-bold">Unit price</th>
                    <th className="px-5 py-4 text-right font-bold">Total value</th>
                    <th className="px-5 py-4 text-right font-bold">Minimum</th>
                    <th className="px-5 py-4 font-bold">Status</th>
                    <th className="px-5 py-4 font-bold">Last updated</th>
                    <th className="px-5 py-4 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/80">
                  {inventory.rows.map((row) => (
                    <tr key={row.id} className="transition hover:bg-slate-700/20">
                      <td className="px-5 py-4">
                        <Link
                          href={`/inventory/${row.id}`}
                          className="font-bold text-white transition hover:text-blue-300"
                        >
                          {row.name}
                        </Link>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-400">
                        {row.sku}
                      </td>
                      <td className="px-5 py-4 text-slate-300">
                        {row.category?.name ?? "Uncategorized"}
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-white">
                        {row.quantity.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-right text-slate-300">
                        {currencyFormatter.format(row.unitPrice)}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-slate-100">
                        {currencyFormatter.format(row.totalValue)}
                      </td>
                      <td className="px-5 py-4 text-right text-slate-300">
                        {row.minimumStock.toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <StockStatusBadge status={row.status} />
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400">
                        {formatDate(row.updatedAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/products/${row.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-blue-300 transition hover:bg-blue-500/10 hover:text-blue-200"
                          >
                            <PencilLine className="size-3.5" aria-hidden="true" />
                            Edit
                          </Link>
                          <span aria-hidden="true" className="text-slate-600">|</span>
                          <DeleteProductButton
                            productId={row.id}
                            productName={row.name}
                            hasHistory={row.hasHistory}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid gap-4 md:hidden">
              {inventory.rows.map((row) => (
                <article
                  key={row.id}
                  className="rounded-2xl border border-slate-700 bg-slate-800/75 p-5 shadow-xl shadow-slate-950/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/inventory/${row.id}`}
                        className="font-bold text-white transition hover:text-blue-300"
                      >
                        {row.name}
                      </Link>
                      <p className="mt-1 truncate font-mono text-xs text-slate-500">
                        {row.sku}
                      </p>
                    </div>
                    <StockStatusBadge status={row.status} />
                  </div>
                  <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-xs text-slate-500">Category</dt>
                      <dd className="mt-1 text-slate-200">
                        {row.category?.name ?? "Uncategorized"}
                      </dd>
                    </div>
                    <div className="text-right">
                      <dt className="text-xs text-slate-500">Quantity</dt>
                      <dd className="mt-1 font-bold text-white">
                        {row.quantity.toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Unit price</dt>
                      <dd className="mt-1 text-slate-200">
                        {currencyFormatter.format(row.unitPrice)}
                      </dd>
                    </div>
                    <div className="text-right">
                      <dt className="text-xs text-slate-500">Inventory value</dt>
                      <dd className="mt-1 font-semibold text-slate-100">
                        {currencyFormatter.format(row.totalValue)}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-5 flex items-center justify-end gap-1 border-t border-slate-700/80 pt-3">
                    <Link
                      href={`/products/${row.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-blue-300 transition hover:bg-blue-500/10 hover:text-blue-200"
                    >
                      <PencilLine className="size-3.5" aria-hidden="true" />
                      Edit
                    </Link>
                    <span aria-hidden="true" className="text-slate-600">|</span>
                    <DeleteProductButton
                      productId={row.id}
                      productName={row.name}
                      hasHistory={row.hasHistory}
                    />
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Showing {inventory.rows.length} of {inventory.pagination.total} products
              </p>
              <div className="flex items-center gap-2">
                <PaginationLink
                  disabled={inventory.pagination.page <= 1}
                  href={inventoryUrl(filters, inventory.pagination.page - 1)}
                >
                  <ChevronLeft className="size-4" /> Previous
                </PaginationLink>
                <span className="px-2 text-xs font-semibold text-slate-500">
                  Page {inventory.pagination.page} of {inventory.pagination.totalPages}
                </span>
                <PaginationLink
                  disabled={
                    inventory.pagination.page >= inventory.pagination.totalPages
                  }
                  href={inventoryUrl(filters, inventory.pagination.page + 1)}
                >
                  Next <ChevronRight className="size-4" />
                </PaginationLink>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            icon={<Search className="size-5" />}
            title="No inventory matches"
            description={
              filters.query || filters.category || filters.status !== "ALL"
                ? "Try changing the search or filters to find other products."
                : "Add a stock item to begin tracking your inventory."
            }
            action={
              <Link
                href={
                  filters.query || filters.category || filters.status !== "ALL"
                    ? "/inventory"
                    : "/products/new"
                }
                className="inline-flex h-10 items-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-500"
              >
                {filters.query || filters.category || filters.status !== "ALL"
                  ? "Clear filters"
                  : "Add stock"}
              </Link>
            }
          />
        )}
      </section>
      <AppToaster />
    </div>
  );
}

function singleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function FilterSelect({
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
}) {
  return (
    <label>
      <span className="sr-only">{label}</span>
      <select
        {...props}
        className="h-11 w-full rounded-xl border border-slate-600 bg-slate-950/65 px-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
      >
        {children}
      </select>
    </label>
  );
}

function PaginationLink({
  disabled,
  href,
  children,
}: {
  disabled: boolean;
  href: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-800 px-3 text-xs font-bold text-slate-600">
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-700 px-3 text-xs font-bold text-slate-300 transition hover:border-blue-400/30 hover:text-blue-300"
    >
      {children}
    </Link>
  );
}

function inventoryUrl(
  filters: ReturnType<typeof inventorySearchSchema.parse>,
  page: number,
) {
  const params = new URLSearchParams();
  if (filters.query) params.set("query", filters.query);
  if (filters.category) params.set("category", filters.category);
  if (filters.status !== "ALL") params.set("status", filters.status);
  if (filters.sort !== "updated") params.set("sort", filters.sort);
  if (filters.direction !== "desc") params.set("direction", filters.direction);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/inventory?${query}` : "/inventory";
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

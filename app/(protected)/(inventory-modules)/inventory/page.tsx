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
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-white transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500/50"
          >
            <PackagePlus className="size-4" />
            Add Stock
          </Link>
        }
      />

      <form
        action="/inventory"
        className="mt-7 grid gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-3 md:grid-cols-[minmax(220px,1fr)_180px_160px_160px_110px]"
      >
        <label className="relative block">
          <span className="sr-only">Search products</span>
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-zinc-500" />
          <input
            name="query"
            defaultValue={filters.query}
            placeholder="Search products or SKU..."
            maxLength={160}
            className="h-9 w-full rounded-md border border-zinc-700 bg-zinc-950 pl-9 pr-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
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
          className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-white transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500/50"
        >
          Apply
        </button>
      </form>

      <section className="mt-5">
        {inventory.rows.length ? (
          <>
            <div className="hidden overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900 md:block">
              <table className="w-full min-w-[1260px] text-left text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-950/50 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">SKU</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 text-right font-medium">Quantity</th>
                    <th className="px-4 py-3 text-right font-medium">Unit price</th>
                    <th className="px-4 py-3 text-right font-medium">Total value</th>
                    <th className="px-4 py-3 text-right font-medium">Minimum</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Last updated</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {inventory.rows.map((row) => (
                    <tr key={row.id} className="transition hover:bg-zinc-800/50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/inventory/${row.id}`}
                          className="font-medium text-white transition hover:text-emerald-400"
                        >
                          {row.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                        {row.sku}
                      </td>
                      <td className="px-4 py-3 text-zinc-400">
                        {row.category?.name ?? "Uncategorized"}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-white">
                        {row.quantity.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-400">
                        {currencyFormatter.format(row.unitPrice)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-zinc-200">
                        {currencyFormatter.format(row.totalValue)}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-400">
                        {row.minimumStock.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <StockStatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500">
                        {formatDate(row.updatedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/products/${row.id}`}
                            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                          >
                            <PencilLine className="size-3.5" aria-hidden="true" />
                            Edit
                          </Link>
                          <span aria-hidden="true" className="text-zinc-700">|</span>
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
                  className="rounded-lg border border-zinc-800 bg-zinc-900 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/inventory/${row.id}`}
                        className="font-medium text-white transition hover:text-emerald-400"
                      >
                        {row.name}
                      </Link>
                      <p className="mt-1 truncate font-mono text-xs text-zinc-500">
                        {row.sku}
                      </p>
                    </div>
                    <StockStatusBadge status={row.status} />
                  </div>
                  <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-xs text-zinc-500">Category</dt>
                      <dd className="mt-1 text-zinc-200">
                        {row.category?.name ?? "Uncategorized"}
                      </dd>
                    </div>
                    <div className="text-right">
                      <dt className="text-xs text-zinc-500">Quantity</dt>
                      <dd className="mt-1 font-medium text-white">
                        {row.quantity.toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-zinc-500">Unit price</dt>
                      <dd className="mt-1 text-zinc-200">
                        {currencyFormatter.format(row.unitPrice)}
                      </dd>
                    </div>
                    <div className="text-right">
                      <dt className="text-xs text-zinc-500">Inventory value</dt>
                      <dd className="mt-1 font-medium text-zinc-200">
                        {currencyFormatter.format(row.totalValue)}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-5 flex items-center justify-end gap-1 border-t border-zinc-800 pt-3">
                    <Link
                      href={`/products/${row.id}`}
                      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                    >
                      <PencilLine className="size-3.5" aria-hidden="true" />
                      Edit
                    </Link>
                    <span aria-hidden="true" className="text-zinc-700">|</span>
                    <DeleteProductButton
                      productId={row.id}
                      productName={row.name}
                      hasHistory={row.hasHistory}
                    />
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-3 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
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
                <span className="px-2 text-xs font-medium text-zinc-500">
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
                className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-white transition hover:bg-primary-hover"
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
        className="h-9 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
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
      <span className="inline-flex h-8 items-center gap-1 rounded-md border border-zinc-800 px-2.5 text-xs font-medium text-zinc-600">
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="inline-flex h-8 items-center gap-1 rounded-md border border-zinc-700 px-2.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
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

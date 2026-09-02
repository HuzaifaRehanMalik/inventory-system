import type { Metadata } from "next";
import Link from "next/link";
import { PackagePlus, PencilLine } from "lucide-react";

import { AppToaster } from "@/components/app-toaster";
import { DeleteProductButton } from "@/components/inventory/delete-product-button";
import { EmptyState } from "@/components/inventory/empty-state";
import { PageHeading } from "@/components/inventory/page-heading";
import { StockStatusBadge } from "@/components/inventory/stock-status-badge";
import { requireCurrentUser } from "@/lib/auth/session";
import { getBusinessSettings, getProducts } from "@/lib/inventory/queries";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage() {
  const user = await requireCurrentUser("/products");
  const [products, settings] = await Promise.all([
    getProducts(user.id),
    getBusinessSettings(user.id),
  ]);
  const currencyFormatter = new Intl.NumberFormat("en", {
    style: "currency",
    currency: settings.currency,
  });

  return (
    <div className="animate-enter">
      <PageHeading
        eyebrow="Catalog"
        title="Products"
        description="Manage the products, prices, SKUs, categories, and stock thresholds used by your inventory."
        actions={
          <Link
            href="/products/new"
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary hover:bg-primary-hover px-3 text-sm font-medium text-white transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500/50"
          >
            <PackagePlus className="size-4" />
            Add Stock
          </Link>
        }
      />

      <section className="mt-8">
        {products.length ? (
          <>
          <div className="hidden overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900 md:block">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-zinc-800 bg-zinc-950/50 text-xs font-medium uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Quantity</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {products.map((product) => (
                  <tr key={product.id} className="transition hover:bg-zinc-800/50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/inventory/${product.id}`}
                        className="font-medium text-white transition hover:text-emerald-400"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-1 text-xs text-zinc-500">{product.sku}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {product.category?.name ?? "Uncategorized"}
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-200">
                      {currencyFormatter.format(product.unitPrice)}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">
                      {product.inventory?.quantity ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <StockStatusBadge
                        status={product.inventory?.status ?? "OUT_OF_STOCK"}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/products/${product.id}`}
                          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                        >
                          <PencilLine className="size-3.5" aria-hidden="true" />
                          Edit
                        </Link>
                        <span aria-hidden="true" className="text-zinc-700">|</span>
                        <DeleteProductButton
                          productId={product.id}
                          productName={product.name}
                          hasHistory={product.hasHistory}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-4 md:hidden">
            {products.map((product) => (
              <article
                key={product.id}
                className="rounded-lg border border-zinc-800 bg-zinc-900 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/inventory/${product.id}`}
                      className="font-medium text-white transition hover:text-emerald-400"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 truncate font-mono text-xs text-zinc-500">
                      {product.sku}
                    </p>
                  </div>
                  <StockStatusBadge
                    status={product.inventory?.status ?? "OUT_OF_STOCK"}
                  />
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-xs text-zinc-500">Category</dt>
                    <dd className="mt-1 text-zinc-200">
                      {product.category?.name ?? "Uncategorized"}
                    </dd>
                  </div>
                  <div className="text-right">
                    <dt className="text-xs text-zinc-500">Price</dt>
                    <dd className="mt-1 font-medium text-zinc-200">
                      {currencyFormatter.format(product.unitPrice)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-zinc-500">Quantity</dt>
                    <dd className="mt-1 font-medium text-white">
                      {(product.inventory?.quantity ?? 0).toLocaleString()}
                    </dd>
                  </div>
                </dl>
                <div className="mt-5 flex items-center justify-end gap-1 border-t border-zinc-800 pt-3">
                  <Link
                    href={`/products/${product.id}`}
                    className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                  >
                    <PencilLine className="size-3.5" aria-hidden="true" />
                    Edit
                  </Link>
                  <span aria-hidden="true" className="text-zinc-700">|</span>
                  <DeleteProductButton
                    productId={product.id}
                    productName={product.name}
                    hasHistory={product.hasHistory}
                  />
                </div>
              </article>
            ))}
          </div>
          </>
        ) : (
          <EmptyState
            icon={<PackagePlus className="size-5" />}
            title="No products yet"
            description="Add your first stock item to start tracking quantities and product performance."
            action={
              <Link
                href="/products/new"
                className="inline-flex h-9 items-center rounded-md bg-primary hover:bg-primary-hover px-3 text-sm font-medium text-white transition"
              >
                Add your first stock item
              </Link>
            }
          />
        )}
      </section>
      <AppToaster />
    </div>
  );
}

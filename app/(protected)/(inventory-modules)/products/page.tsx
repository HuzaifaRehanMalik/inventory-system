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
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30"
          >
            <PackagePlus className="size-4" />
            Add Stock
          </Link>
        }
      />

      <section className="mt-8">
        {products.length ? (
          <>
          <div className="hidden overflow-x-auto rounded-2xl border border-slate-700 bg-slate-800/75 shadow-xl shadow-slate-950/10 md:block">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-700 bg-slate-900/65 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-5 py-4 font-bold">Product</th>
                  <th className="px-5 py-4 font-bold">Category</th>
                  <th className="px-5 py-4 font-bold">Price</th>
                  <th className="px-5 py-4 font-bold">Quantity</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/80">
                {products.map((product) => (
                  <tr key={product.id} className="transition hover:bg-slate-700/20">
                    <td className="px-5 py-4">
                      <Link
                        href={`/inventory/${product.id}`}
                        className="font-bold text-white transition hover:text-blue-300"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">{product.sku}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {product.category?.name ?? "Uncategorized"}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-200">
                      {currencyFormatter.format(product.unitPrice)}
                    </td>
                    <td className="px-5 py-4 font-bold text-white">
                      {product.inventory?.quantity ?? 0}
                    </td>
                    <td className="px-5 py-4">
                      <StockStatusBadge
                        status={product.inventory?.status ?? "OUT_OF_STOCK"}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/products/${product.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-blue-300 transition hover:bg-blue-500/10 hover:text-blue-200"
                        >
                          <PencilLine className="size-3.5" aria-hidden="true" />
                          Edit
                        </Link>
                        <span aria-hidden="true" className="text-slate-600">|</span>
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
                className="rounded-2xl border border-slate-700 bg-slate-800/75 p-5 shadow-xl shadow-slate-950/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/inventory/${product.id}`}
                      className="font-bold text-white transition hover:text-blue-300"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 truncate font-mono text-xs text-slate-500">
                      {product.sku}
                    </p>
                  </div>
                  <StockStatusBadge
                    status={product.inventory?.status ?? "OUT_OF_STOCK"}
                  />
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-xs text-slate-500">Category</dt>
                    <dd className="mt-1 text-slate-200">
                      {product.category?.name ?? "Uncategorized"}
                    </dd>
                  </div>
                  <div className="text-right">
                    <dt className="text-xs text-slate-500">Price</dt>
                    <dd className="mt-1 font-semibold text-slate-100">
                      {currencyFormatter.format(product.unitPrice)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Quantity</dt>
                    <dd className="mt-1 font-bold text-white">
                      {(product.inventory?.quantity ?? 0).toLocaleString()}
                    </dd>
                  </div>
                </dl>
                <div className="mt-5 flex items-center justify-end gap-1 border-t border-slate-700/80 pt-3">
                  <Link
                    href={`/products/${product.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-blue-300 transition hover:bg-blue-500/10 hover:text-blue-200"
                  >
                    <PencilLine className="size-3.5" aria-hidden="true" />
                    Edit
                  </Link>
                  <span aria-hidden="true" className="text-slate-600">|</span>
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
                className="inline-flex h-10 items-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-500"
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

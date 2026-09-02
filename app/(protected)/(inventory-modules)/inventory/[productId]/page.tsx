import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpFromLine,
  PencilLine,
} from "lucide-react";

import { AppToaster } from "@/components/app-toaster";
import { DeleteProductButton } from "@/components/inventory/delete-product-button";
import { PageHeading } from "@/components/inventory/page-heading";
import { StockStatusBadge } from "@/components/inventory/stock-status-badge";
import { requireCurrentUser } from "@/lib/auth/session";
import {
  getBusinessSettings,
  getProductDetail,
} from "@/lib/inventory/queries";

export const metadata: Metadata = { title: "Inventory details" };

export default async function InventoryDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const user = await requireCurrentUser(`/inventory/${productId}`);
  const [product, settings] = await Promise.all([
    getProductDetail(user.id, productId),
    getBusinessSettings(user.id),
  ]);

  if (!product) {
    notFound();
  }

  const currencyFormatter = new Intl.NumberFormat("en", {
    style: "currency",
    currency: settings.currency,
  });
  const quantity = product.inventory?.quantity ?? 0;
  const averageUnitCost = product.inventory?.averageUnitCost ?? 0;

  return (
    <div className="animate-enter">
      <Link
        href="/inventory"
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-emerald-400"
      >
        <ArrowLeft className="size-4" />
        Back to inventory
      </Link>
      <PageHeading
        eyebrow={product.sku}
        title={product.name}
        description={
          product.description ??
          "Review current stock, valuation, thresholds, and movement history."
        }
        actions={
          <>
            <Link
              href={`/stock-in?product=${product.id}`}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-primary hover:bg-primary-hover px-3 text-sm font-medium text-white transition"
            >
              <ArrowDownToLine className="size-4" /> Receive Stock
            </Link>
            <Link
              href={`/stock-out?product=${product.id}`}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-3 text-sm font-medium text-red-300 transition"
            >
              <ArrowUpFromLine className="size-4" /> Sell Stock
            </Link>
            <Link
              href={`/products/${product.id}`}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 hover:text-white px-3 text-sm font-medium text-zinc-200 transition"
            >
              <PencilLine className="size-4" /> Edit
            </Link>
            <DeleteProductButton
              productId={product.id}
              productName={product.name}
              hasHistory={product.hasHistory}
              redirectTo="/inventory"
            />
          </>
        }
      />

      <dl className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Metric label="Current quantity" value={quantity.toLocaleString()} />
        <Metric
          label="Average unit cost"
          value={currencyFormatter.format(averageUnitCost)}
        />
        <Metric
          label="Inventory value"
          value={currencyFormatter.format(quantity * averageUnitCost)}
        />
        <Metric
          label="Minimum stock"
          value={product.minimumStock.toLocaleString()}
        />
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <dt className="text-xs font-medium text-zinc-500">Status</dt>
          <dd className="mt-3">
            <StockStatusBadge
              status={product.inventory?.status ?? "OUT_OF_STOCK"}
            />
          </dd>
        </div>
      </dl>

      <section className="mt-8" aria-labelledby="stock-history-heading">
        <div className="mb-4">
          <h2 id="stock-history-heading" className="text-lg font-bold text-white">
            Stock history
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Up to 50 of the most recent sales and receipts for this product.
          </p>
        </div>
        {product.transactions.length ? (
          <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900">
            <table className="w-full min-w-[1260px] text-left text-sm">
              <thead className="border-b border-zinc-800 bg-zinc-950/50 text-xs font-medium uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 text-right font-medium">Quantity</th>
                  <th className="px-4 py-3 text-right font-medium">Previous</th>
                  <th className="px-4 py-3 text-right font-medium">New</th>
                  <th className="px-4 py-3 font-medium">Supplier / customer</th>
                  <th className="px-4 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Notes</th>
                  <th className="px-4 py-3 font-medium">Performed by</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {product.transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-zinc-800/50">
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {formatDate(transaction.occurredAt)}
                      <span className="mt-1 block text-[11px] text-zinc-500">
                        Recorded {formatRecordedTime(transaction.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${
                          transaction.type === "STOCK_IN"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {transaction.type === "STOCK_IN" ? "Received" : "Sold"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-white">
                      {transaction.quantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-400">
                      {transaction.previousQuantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-400">
                      {transaction.newQuantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {transaction.counterpartyName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {transaction.referenceNumber ?? "—"}
                    </td>
                    <td className="max-w-64 px-4 py-3 text-zinc-500">
                      <span className="line-clamp-2">
                        {transaction.notes ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {transaction.performedBy.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950/50 px-6 py-8 text-center text-sm text-zinc-500">
            No stock movements have been recorded for this product.
          </div>
        )}
      </section>
      <AppToaster />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <dt className="text-xs font-medium text-zinc-500">{label}</dt>
      <dd className="mt-2 text-xl font-semibold text-white">{value}</dd>
    </div>
  );
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

function formatRecordedTime(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

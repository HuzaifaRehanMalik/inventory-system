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
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-blue-300"
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
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-3.5 text-sm font-bold text-white hover:bg-blue-500"
            >
              <ArrowDownToLine className="size-4" /> Stock In
            </Link>
            <Link
              href={`/stock-out?product=${product.id}`}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-400/25 bg-rose-500/10 px-3.5 text-sm font-bold text-rose-200 hover:bg-rose-500/15"
            >
              <ArrowUpFromLine className="size-4" /> Stock Out
            </Link>
            <Link
              href={`/products/${product.id}`}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 text-sm font-bold text-slate-200 hover:border-blue-400/30 hover:text-blue-300"
            >
              <PencilLine className="size-4" /> Edit
            </Link>
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
        <div className="rounded-2xl border border-slate-700 bg-slate-800/75 p-5">
          <dt className="text-xs font-semibold text-slate-400">Status</dt>
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
            Up to 50 of the most recent inventory movements for this product.
          </p>
        </div>
        {product.transactions.length ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-700 bg-slate-800/75 shadow-xl shadow-slate-950/10">
            <table className="w-full min-w-[1260px] text-left text-sm">
              <thead className="border-b border-slate-700 bg-slate-900/65 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-5 py-4 font-bold">Date</th>
                  <th className="px-5 py-4 font-bold">Type</th>
                  <th className="px-5 py-4 text-right font-bold">Quantity</th>
                  <th className="px-5 py-4 text-right font-bold">Previous</th>
                  <th className="px-5 py-4 text-right font-bold">New</th>
                  <th className="px-5 py-4 font-bold">Supplier / customer</th>
                  <th className="px-5 py-4 font-bold">Reference</th>
                  <th className="px-5 py-4 font-bold">Notes</th>
                  <th className="px-5 py-4 font-bold">Performed by</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/80">
                {product.transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-700/20">
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {formatDate(transaction.occurredAt)}
                      <span className="mt-1 block text-[11px] text-slate-500">
                        Recorded {formatRecordedTime(transaction.createdAt)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-bold ${
                          transaction.type === "STOCK_IN"
                            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                            : "border-rose-400/20 bg-rose-400/10 text-rose-300"
                        }`}
                      >
                        {transaction.type === "STOCK_IN" ? "Stock In" : "Stock Out"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-white">
                      {transaction.quantity.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-right text-slate-300">
                      {transaction.previousQuantity.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-right text-slate-300">
                      {transaction.newQuantity.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {transaction.counterpartyName ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {transaction.referenceNumber ?? "—"}
                    </td>
                    <td className="max-w-64 px-5 py-4 text-slate-400">
                      <span className="line-clamp-2">
                        {transaction.notes ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {transaction.performedBy.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/35 px-6 py-10 text-center text-sm text-slate-400">
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
    <div className="rounded-2xl border border-slate-700 bg-slate-800/75 p-5">
      <dt className="text-xs font-semibold text-slate-400">{label}</dt>
      <dd className="mt-2 text-xl font-bold text-white">{value}</dd>
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

import type { Metadata } from "next";
import Link from "next/link";
import { PackageMinus, Plus } from "lucide-react";

import { AppToaster } from "@/components/app-toaster";
import { EmptyState } from "@/components/inventory/empty-state";
import { PageHeading } from "@/components/inventory/page-heading";
import { StockOutForm } from "@/components/inventory/stock-out-form";
import { requireCurrentUser } from "@/lib/auth/session";
import { getStockOutFormData } from "@/lib/inventory/queries";

export const metadata: Metadata = { title: "Stock Out" };

export default async function StockOutPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string | string[] }>;
}) {
  const user = await requireCurrentUser("/stock-out");
  const [{ product }, formData] = await Promise.all([
    searchParams,
    getStockOutFormData(user.id),
  ]);
  const requestedProductId = typeof product === "string" ? product : "";
  const initialProductId = formData.products.some(
    (item) => item.id === requestedProductId,
  )
    ? requestedProductId
    : "";

  return (
    <div className="animate-enter mx-auto max-w-4xl">
      <PageHeading
        eyebrow="Inventory movement"
        title="Stock Out"
        description="Record inventory leaving the business. Availability is checked again on the server before stock changes."
        actions={
          <Link
            href="/customers"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:border-blue-400/40 hover:text-white"
          >
            <Plus className="size-4" />
            Add customer
          </Link>
        }
      />

      <section className="mt-8 rounded-2xl border border-slate-700 bg-slate-800/80 p-5 shadow-xl shadow-slate-950/15 sm:p-7">
        {formData.products.length ? (
          <StockOutForm {...formData} initialProductId={initialProductId} />
        ) : (
          <EmptyState
            icon={<PackageMinus className="size-6" />}
            title="Add a product before issuing stock"
            description="Stock movements must be linked to a product in your catalog."
            action={
              <Link
                href="/products/new"
                className="inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500"
              >
                Add product
              </Link>
            }
          />
        )}
      </section>
      <AppToaster />
    </div>
  );
}

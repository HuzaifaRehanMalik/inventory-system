import type { Metadata } from "next";
import Link from "next/link";
import { PackagePlus } from "lucide-react";

import { AppToaster } from "@/components/app-toaster";
import { EmptyState } from "@/components/inventory/empty-state";
import { PageHeading } from "@/components/inventory/page-heading";
import { StockInForm } from "@/components/inventory/stock-in-form";
import { requireCurrentUser } from "@/lib/auth/session";
import { getStockInFormData } from "@/lib/inventory/queries";

export const metadata: Metadata = { title: "Receive Stock" };

export default async function StockInPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string | string[] }>;
}) {
  const user = await requireCurrentUser("/stock-in");
  const [{ product }, formData] = await Promise.all([
    searchParams,
    getStockInFormData(user.id),
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
        title="Receive Stock"
        description="Increase available inventory with a positive quantity and keep the movement history synchronized."
      />

      <section className="mt-8 rounded-2xl border border-slate-700 bg-slate-800/80 p-5 shadow-xl shadow-slate-950/15 sm:p-7">
        {formData.products.length ? (
          <StockInForm {...formData} initialProductId={initialProductId} />
        ) : (
          <EmptyState
            icon={<PackagePlus className="size-6" />}
            title="Add a product before receiving stock"
            description="Every received quantity must be linked to an active inventory item."
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

import type { Metadata } from "next";
import Link from "next/link";
import { PackageMinus } from "lucide-react";

import { AppToaster } from "@/components/app-toaster";
import { EmptyState } from "@/components/inventory/empty-state";
import { PageHeading } from "@/components/inventory/page-heading";
import { StockOutForm } from "@/components/inventory/stock-out-form";
import { requireCurrentUser } from "@/lib/auth/session";
import { getStockOutFormData } from "@/lib/inventory/queries";

export const metadata: Metadata = { title: "Sell Stock" };

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
        title="Sell Stock"
        description="Record a sale and decrease inventory. The server rejects quantities above current availability."
      />

      <section className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900 p-4 sm:p-6">
        {formData.products.length ? (
          <StockOutForm {...formData} initialProductId={initialProductId} />
        ) : (
          <EmptyState
            icon={<PackageMinus className="size-6" />}
            title="Add a product before selling stock"
            description="Every sale must be linked to an active inventory item."
            action={
              <Link
                href="/products/new"
                className="inline-flex items-center justify-center rounded-md bg-primary hover:bg-primary-hover text-white font-medium text-sm h-9 px-3 transition"
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

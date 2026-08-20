import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AppToaster } from "@/components/app-toaster";
import { DeleteProductButton } from "@/components/inventory/delete-product-button";
import { PageHeading } from "@/components/inventory/page-heading";
import { ProductForm } from "@/components/inventory/product-form";
import { requireCurrentUser } from "@/lib/auth/session";
import {
  getProductDetail,
  getProductFormData,
} from "@/lib/inventory/queries";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const user = await requireCurrentUser(`/products/${productId}`);
  const [product, formData] = await Promise.all([
    getProductDetail(user.id, productId),
    getProductFormData(user.id),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="animate-enter mx-auto max-w-4xl">
      <Link
        href={`/inventory/${product.id}`}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-blue-300"
      >
        <ArrowLeft className="size-4" />
        Back to inventory details
      </Link>
      <PageHeading
        eyebrow="Inventory"
        title={`Edit ${product.name}`}
        description="Update product information and the threshold used to calculate its stock status."
      />
      <section className="mt-8 rounded-2xl border border-slate-700 bg-slate-800/80 p-5 shadow-xl shadow-slate-950/15 sm:p-7">
        <ProductForm
          categories={formData.categories}
          defaultLowStockThreshold={formData.defaultLowStockThreshold}
          product={{
            id: product.id,
            name: product.name,
            sku: product.sku,
            description: product.description,
            categoryId: product.category?.id ?? null,
            unitPrice: product.unitPrice,
            minimumStock: product.minimumStock,
          }}
        />
      </section>
      <section className="mt-6 rounded-2xl border border-rose-400/20 bg-slate-800/60 p-5 sm:p-7">
        <h2 className="text-base font-bold text-white">Delete stock item</h2>
        <p className="mt-1 mb-4 text-sm leading-6 text-slate-400">
          Safely remove this item from active inventory while retaining its
          historical stock movements.
        </p>
        <DeleteProductButton
          productId={product.id}
          productName={product.name}
          hasHistory={product.hasHistory}
          redirectTo="/inventory"
        />
      </section>
      <AppToaster />
    </div>
  );
}

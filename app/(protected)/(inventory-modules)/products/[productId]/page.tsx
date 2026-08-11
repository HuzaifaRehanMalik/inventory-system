import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AppToaster } from "@/components/app-toaster";
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
        eyebrow="Catalog"
        title={`Edit ${product.name}`}
        description="Update catalog information and the threshold used to calculate inventory status."
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
            active: product.active,
          }}
        />
      </section>
      <AppToaster />
    </div>
  );
}

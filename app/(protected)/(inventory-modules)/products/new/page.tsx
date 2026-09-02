import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AppToaster } from "@/components/app-toaster";
import { PageHeading } from "@/components/inventory/page-heading";
import { ProductForm } from "@/components/inventory/product-form";
import { requireCurrentUser } from "@/lib/auth/session";
import { getProductFormData } from "@/lib/inventory/queries";

export const metadata: Metadata = { title: "Add Stock" };

export default async function NewProductPage() {
  const user = await requireCurrentUser("/products/new");
  const formData = await getProductFormData(user.id);

  return (
    <div className="animate-enter mx-auto max-w-4xl">
      <Link
        href="/products"
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-emerald-400"
      >
        <ArrowLeft className="size-4" />
        Back to products
      </Link>
      <PageHeading
        eyebrow="Inventory"
        title="Add Stock"
        description="Add a new inventory item and record its validated opening quantity."
      />
      <section className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900 p-4 sm:p-6">
        <ProductForm {...formData} />
      </section>
      <AppToaster />
    </div>
  );
}

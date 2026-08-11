import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AppToaster } from "@/components/app-toaster";
import { PageHeading } from "@/components/inventory/page-heading";
import { ProductForm } from "@/components/inventory/product-form";
import { requireCurrentUser } from "@/lib/auth/session";
import { getProductFormData } from "@/lib/inventory/queries";

export const metadata: Metadata = { title: "Add product" };

export default async function NewProductPage() {
  const user = await requireCurrentUser("/products/new");
  const formData = await getProductFormData(user.id);

  return (
    <div className="animate-enter mx-auto max-w-4xl">
      <Link
        href="/products"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-blue-300"
      >
        <ArrowLeft className="size-4" />
        Back to products
      </Link>
      <PageHeading
        eyebrow="Catalog"
        title="Add product"
        description="Create a product record first, then use Stock In to record its opening or incoming quantity."
      />
      <section className="mt-8 rounded-2xl border border-slate-700 bg-slate-800/80 p-5 shadow-xl shadow-slate-950/15 sm:p-7">
        <ProductForm {...formData} />
      </section>
      <AppToaster />
    </div>
  );
}

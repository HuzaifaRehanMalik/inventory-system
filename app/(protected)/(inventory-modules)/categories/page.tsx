import type { Metadata } from "next";

import { DirectoryPage } from "@/components/inventory/directory-page";
import { requireCurrentUser } from "@/lib/auth/session";
import { getCategories } from "@/lib/inventory/queries";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const user = await requireCurrentUser("/categories");
  const categories = await getCategories(user.id);

  return (
    <DirectoryPage
      kind="category"
      records={categories.map((category) => ({
        ...category,
        usageCount: category._count.products,
      }))}
    />
  );
}

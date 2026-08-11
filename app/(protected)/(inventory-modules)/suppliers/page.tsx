import type { Metadata } from "next";

import { DirectoryPage } from "@/components/inventory/directory-page";
import { requireCurrentUser } from "@/lib/auth/session";
import { getSuppliers } from "@/lib/inventory/queries";

export const metadata: Metadata = { title: "Suppliers" };

export default async function SuppliersPage() {
  const user = await requireCurrentUser("/suppliers");
  const suppliers = await getSuppliers(user.id);

  return (
    <DirectoryPage
      kind="supplier"
      records={suppliers.map((supplier) => ({
        ...supplier,
        usageCount: supplier._count.transactions,
      }))}
    />
  );
}

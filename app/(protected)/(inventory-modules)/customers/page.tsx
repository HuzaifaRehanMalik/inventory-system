import type { Metadata } from "next";

import { DirectoryPage } from "@/components/inventory/directory-page";
import { requireCurrentUser } from "@/lib/auth/session";
import { getCustomers } from "@/lib/inventory/queries";

export const metadata: Metadata = { title: "Customers" };

export default async function CustomersPage() {
  const user = await requireCurrentUser("/customers");
  const customers = await getCustomers(user.id);

  return (
    <DirectoryPage
      kind="customer"
      records={customers.map((customer) => ({
        ...customer,
        usageCount: customer._count.transactions,
      }))}
    />
  );
}

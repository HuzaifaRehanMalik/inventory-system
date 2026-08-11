import type { Metadata } from "next";
import { InventoryModulePlaceholder } from "@/components/inventory-module-placeholder";

export const metadata: Metadata = { title: "Sales & Orders" };
export default function SalesPage() {
  return <InventoryModulePlaceholder moduleHref="/sales" />;
}

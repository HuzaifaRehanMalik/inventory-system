import type { Metadata } from "next";
import { InventoryModulePlaceholder } from "@/components/inventory-module-placeholder";

export const metadata: Metadata = { title: "Purchases" };
export default function PurchasesPage() {
  return <InventoryModulePlaceholder moduleHref="/purchases" />;
}

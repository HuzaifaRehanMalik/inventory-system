import type { Metadata } from "next";
import { InventoryModulePlaceholder } from "@/components/inventory-module-placeholder";

export const metadata: Metadata = { title: "Stock Transfers" };
export default function StockTransfersPage() {
  return <InventoryModulePlaceholder moduleHref="/stock-transfers" />;
}

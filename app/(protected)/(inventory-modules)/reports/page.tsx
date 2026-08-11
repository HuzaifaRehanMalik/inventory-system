import type { Metadata } from "next";
import { InventoryModulePlaceholder } from "@/components/inventory-module-placeholder";

export const metadata: Metadata = { title: "Reports & Analytics" };
export default function ReportsPage() {
  return <InventoryModulePlaceholder moduleHref="/reports" />;
}

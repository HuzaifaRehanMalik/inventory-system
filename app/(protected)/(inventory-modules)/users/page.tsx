import type { Metadata } from "next";
import { InventoryModulePlaceholder } from "@/components/inventory-module-placeholder";

export const metadata: Metadata = { title: "Users & Roles" };
export default function UsersPage() {
  return <InventoryModulePlaceholder moduleHref="/users" />;
}

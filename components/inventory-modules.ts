import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  BarChart3,
  Boxes,
  ContactRound,
  Package,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  Tags,
  Truck,
} from "lucide-react";

export type InventoryModuleItem = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export const inventoryModuleItems: InventoryModuleItem[] = [
  {
    title: "Products",
    description: "Manage products, pricing, SKUs, and product information.",
    href: "/products",
    icon: Package,
  },
  {
    title: "Inventory",
    description: "Track quantities, locations, adjustments, and stock levels.",
    href: "/inventory",
    icon: Boxes,
  },
  {
    title: "Categories",
    description: "Organize the catalog into clear, searchable groups.",
    href: "/categories",
    icon: Tags,
  },
  {
    title: "Suppliers",
    description: "Maintain vendor records, terms, and supply relationships.",
    href: "/suppliers",
    icon: Truck,
  },
  {
    title: "Customers",
    description: "View customer details, activity, and account history.",
    href: "/customers",
    icon: ContactRound,
  },
  {
    title: "Sales & Orders",
    description: "Create orders and follow every sale through fulfillment.",
    href: "/sales",
    icon: ShoppingCart,
  },
  {
    title: "Purchases",
    description: "Plan purchasing and manage incoming supplier orders.",
    href: "/purchases",
    icon: ReceiptText,
  },
  {
    title: "Stock Transfers",
    description: "Move stock between warehouses with a clear audit trail.",
    href: "/stock-transfers",
    icon: ArrowLeftRight,
  },
  {
    title: "Reports & Analytics",
    description: "Understand stock movement, sales, and operational trends.",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Users & Roles",
    description: "Control team access, permissions, and responsibilities.",
    href: "/users",
    icon: ShieldCheck,
  },
];

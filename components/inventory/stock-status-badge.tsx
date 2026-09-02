import type { InventoryStockStatus } from "@/app/generated/prisma/enums";

const statusDetails = {
  IN_STOCK: {
    label: "In Stock",
    className: "bg-emerald-500/10 text-emerald-400",
  },
  LOW_STOCK: {
    label: "Low Stock",
    className: "bg-amber-500/10 text-amber-400",
  },
  OUT_OF_STOCK: {
    label: "Out of Stock",
    className: "bg-red-500/10 text-red-400",
  },
} satisfies Record<
  InventoryStockStatus,
  { label: string; className: string }
>;

export function StockStatusBadge({
  status,
}: {
  status: InventoryStockStatus;
}) {
  const details = statusDetails[status];

  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ${details.className}`}
    >
      {details.label}
    </span>
  );
}

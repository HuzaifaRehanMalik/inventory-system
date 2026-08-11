import type { InventoryStockStatus } from "@/app/generated/prisma/enums";

const statusDetails = {
  IN_STOCK: {
    label: "In Stock",
    className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  },
  LOW_STOCK: {
    label: "Low Stock",
    className: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  },
  OUT_OF_STOCK: {
    label: "Out of Stock",
    className: "border-rose-400/20 bg-rose-400/10 text-rose-300",
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
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${details.className}`}
    >
      {details.label}
    </span>
  );
}

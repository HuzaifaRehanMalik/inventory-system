import type { InventoryStockStatus } from "@/app/generated/prisma/enums";

const statusDetails = {
  IN_STOCK: {
    label: "In Stock",
    className: "bg-[#edf3ec] text-[#346538]",
    dot: "bg-[#346538]",
  },
  LOW_STOCK: {
    label: "Low Stock",
    className: "bg-[#fbf3db] text-[#956400]",
    dot: "bg-[#956400]",
  },
  OUT_OF_STOCK: {
    label: "Out of Stock",
    className: "bg-[#fdebec] text-[#9f2f2d]",
    dot: "bg-[#9f2f2d]",
  },
} satisfies Record<
  InventoryStockStatus,
  { label: string; className: string; dot: string }
>;

export function StockStatusBadge({
  status,
}: {
  status: InventoryStockStatus;
}) {
  const details = statusDetails[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] ${details.className}`}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${details.dot}`} />
      {details.label}
    </span>
  );
}

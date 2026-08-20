import { DATABASE_QUANTITY_MAX } from "./quantity-constraints.mjs";

export { DATABASE_QUANTITY_MAX } from "./quantity-constraints.mjs";

export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export class InventoryQuantityError extends Error {
  constructor(
    public readonly code:
      | "INVALID_CURRENT_QUANTITY"
      | "INVALID_QUANTITY"
      | "INSUFFICIENT_STOCK"
      | "QUANTITY_LIMIT_EXCEEDED",
    message: string,
  ) {
    super(message);
    this.name = "InventoryQuantityError";
  }
}

export function calculateStockStatus(
  quantity: number,
  minimumStock: number,
): StockStatus {
  if (quantity === 0) {
    return "OUT_OF_STOCK";
  }

  return quantity <= minimumStock ? "LOW_STOCK" : "IN_STOCK";
}

export function calculateReceivedQuantity(
  currentQuantity: number,
  receivedQuantity: number,
) {
  assertCurrentQuantity(currentQuantity);
  assertMovementQuantity(receivedQuantity);

  const newQuantity = currentQuantity + receivedQuantity;

  if (!Number.isSafeInteger(newQuantity) || newQuantity > DATABASE_QUANTITY_MAX) {
    throw new InventoryQuantityError(
      "QUANTITY_LIMIT_EXCEEDED",
      "The resulting quantity exceeds the database's supported whole-number range.",
    );
  }

  return newQuantity;
}

export function calculateSoldQuantity(
  currentQuantity: number,
  soldQuantity: number,
) {
  assertCurrentQuantity(currentQuantity);
  assertMovementQuantity(soldQuantity);

  if (soldQuantity > currentQuantity) {
    throw new InventoryQuantityError(
      "INSUFFICIENT_STOCK",
      `Insufficient stock. Only ${currentQuantity.toLocaleString()} units are available.`,
    );
  }

  return currentQuantity - soldQuantity;
}

function assertCurrentQuantity(quantity: number) {
  if (
    !Number.isSafeInteger(quantity) ||
    quantity < 0 ||
    quantity > DATABASE_QUANTITY_MAX
  ) {
    throw new InventoryQuantityError(
      "INVALID_CURRENT_QUANTITY",
      "The current inventory quantity is invalid.",
    );
  }
}

function assertMovementQuantity(quantity: number) {
  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    throw new InventoryQuantityError(
      "INVALID_QUANTITY",
      "Quantity must be a whole number greater than zero.",
    );
  }

  if (quantity > DATABASE_QUANTITY_MAX) {
    throw new InventoryQuantityError(
      "QUANTITY_LIMIT_EXCEEDED",
      "Quantity exceeds the database's supported whole-number range.",
    );
  }
}

export type ProductPerformanceInput = {
  id: string;
  name: string;
  sku: string;
  minimumStock: number;
  quantity: number;
  status: StockStatus;
};

export type ProductMovementTotal = {
  productId: string;
  type: "STOCK_IN" | "STOCK_OUT";
  quantity: number;
};

export type ProductPerformance = ProductPerformanceInput & {
  unitsReceived: number;
  unitsSold: number;
  sellThroughRate: number;
};

export function buildProductPerformance(
  products: ProductPerformanceInput[],
  movementTotals: ProductMovementTotal[],
): ProductPerformance[] {
  const movementByProduct = new Map<
    string,
    { unitsReceived: number; unitsSold: number }
  >();

  for (const movement of movementTotals) {
    const totals = movementByProduct.get(movement.productId) ?? {
      unitsReceived: 0,
      unitsSold: 0,
    };

    if (movement.type === "STOCK_IN") {
      totals.unitsReceived += movement.quantity;
    } else {
      totals.unitsSold += movement.quantity;
    }

    movementByProduct.set(movement.productId, totals);
  }

  return products
    .map((product) => {
      const totals = movementByProduct.get(product.id) ?? {
        unitsReceived: 0,
        unitsSold: 0,
      };
      const availableToSell = product.quantity + totals.unitsSold;

      return {
        ...product,
        ...totals,
        sellThroughRate:
          availableToSell > 0
            ? Math.round((totals.unitsSold / availableToSell) * 1_000) / 10
            : 0,
      };
    })
    .sort(
      (left, right) =>
        right.unitsSold - left.unitsSold ||
        right.sellThroughRate - left.sellThroughRate ||
        left.name.localeCompare(right.name),
    );
}

export type DailyMovementTotal = {
  day: string;
  type: "STOCK_IN" | "STOCK_OUT";
  quantity: number;
};

export type DailyInventoryTrend = {
  day: string;
  unitsReceived: number;
  unitsSold: number;
  netMovement: number;
};

export function buildDailyInventoryTrend(
  rows: DailyMovementTotal[],
  startDate: Date,
  numberOfDays: number,
): DailyInventoryTrend[] {
  const totalsByDay = new Map<
    string,
    { unitsReceived: number; unitsSold: number }
  >();

  for (const row of rows) {
    const totals = totalsByDay.get(row.day) ?? {
      unitsReceived: 0,
      unitsSold: 0,
    };

    if (row.type === "STOCK_IN") {
      totals.unitsReceived += row.quantity;
    } else {
      totals.unitsSold += row.quantity;
    }

    totalsByDay.set(row.day, totals);
  }

  return Array.from({ length: numberOfDays }, (_, index) => {
    const day = new Date(startDate);
    day.setUTCDate(day.getUTCDate() + index);
    const key = day.toISOString().slice(0, 10);
    const totals = totalsByDay.get(key) ?? {
      unitsReceived: 0,
      unitsSold: 0,
    };

    return {
      day: key,
      ...totals,
      netMovement: totals.unitsReceived - totals.unitsSold,
    };
  });
}

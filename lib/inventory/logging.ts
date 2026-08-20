import "server-only";

import {
  errorDetailsForLog,
  redactSensitiveTextForLog,
} from "@/lib/api/errors";

type InventoryOperation =
  | "create_product"
  | "stock_in"
  | "stock_out"
  | "delete_product"
  | "inventory_query"
  | "dashboard_query";

export type InventoryLogDetails = {
  requestId?: string;
  operation: InventoryOperation;
  stage: string;
  userId?: string;
  productId?: string;
  quantity?: number;
  occurredAt?: string;
  referenceNumber?: string;
  purchasePrice?: number;
  previousQuantity?: number;
  newQuantity?: number;
  transactionId?: string;
  productCount?: number;
  rowCount?: number;
  validation?: "passed" | "failed";
  databaseOperation?: string;
  deletionDisposition?: "deleted" | "archived";
};

export function logInventoryEvent(details: InventoryLogDetails) {
  console.info(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "info",
      scope: "inventory",
      ...safeInventoryDetails(details),
    }),
  );
}

export function logInventoryError(
  details: InventoryLogDetails,
  error: unknown,
) {
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "error",
      scope: "inventory",
      ...safeInventoryDetails(details),
      error: errorDetailsForLog(error),
    }),
  );
}

function safeInventoryDetails(details: InventoryLogDetails) {
  return {
    ...details,
    ...(details.referenceNumber
      ? {
          referenceNumber: redactSensitiveTextForLog(
            details.referenceNumber,
          ),
        }
      : {}),
  };
}

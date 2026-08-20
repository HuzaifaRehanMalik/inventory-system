import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";

import { errorResponse, successResponse } from "@/lib/api/errors";
import { assertSameOrigin, parseJson } from "@/lib/api/request";
import { enforceRequestRateLimit } from "@/lib/api/rate-limit";
import { requireApiUser } from "@/lib/auth/session";
import {
  logInventoryError,
  logInventoryEvent,
} from "@/lib/inventory/logging";
import { recordStockIn } from "@/lib/inventory/service";
import { stockInSchema, type StockInInput } from "@/validations/inventory";

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  let stage = "request_received";
  let userId: string | undefined;
  let input: StockInInput | undefined;

  logInventoryEvent({ requestId, operation: "stock_in", stage });

  try {
    stage = "origin_check";
    assertSameOrigin(request);
    stage = "authentication";
    const user = await requireApiUser();
    userId = user.id;
    stage = "rate_limit";
    await enforceRequestRateLimit(request, "stock-in", {
      identifier: user.id,
      limit: 120,
      windowMs: 15 * 60 * 1000,
    });
    stage = "validation";
    input = await parseJson(request, stockInSchema);
    logInventoryEvent({
      requestId,
      operation: "stock_in",
      stage: "validation_succeeded",
      validation: "passed",
      userId,
      productId: input.productId,
      quantity: input.quantity,
      purchasePrice: input.purchasePrice,
      occurredAt: input.occurredAt.toISOString(),
      referenceNumber: input.referenceNumber,
    });
    stage = "database_transaction";
    const result = await recordStockIn(user.id, input);

    revalidatePath("/");
    revalidatePath("/inventory");
    revalidatePath("/products");
    revalidatePath(`/inventory/${result.productId}`);
    logInventoryEvent({
      requestId,
      operation: "stock_in",
      stage: "request_succeeded",
      userId,
      productId: result.productId,
      quantity: input.quantity,
      occurredAt: input.occurredAt.toISOString(),
      referenceNumber: input.referenceNumber,
      newQuantity: result.newQuantity,
      transactionId: result.transactionId,
    });
    return successResponse(result, "Stock received successfully.", 201);
  } catch (error) {
    logInventoryError(
      {
        requestId,
        operation: "stock_in",
        stage: `${stage}_failed`,
        validation: stage === "validation" ? "failed" : undefined,
        userId,
        productId: input?.productId,
        quantity: input?.quantity,
        occurredAt: input?.occurredAt.toISOString(),
        referenceNumber: input?.referenceNumber,
      },
      error,
    );
    return errorResponse(error, "receive stock", requestId);
  }
}

export const runtime = "nodejs";
export const maxDuration = 30;

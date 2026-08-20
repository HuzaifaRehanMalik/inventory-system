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
import { recordStockOut } from "@/lib/inventory/service";
import { stockOutSchema, type StockOutInput } from "@/validations/inventory";

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  let stage = "request_received";
  let userId: string | undefined;
  let input: StockOutInput | undefined;

  logInventoryEvent({ requestId, operation: "stock_out", stage });

  try {
    stage = "origin_check";
    assertSameOrigin(request);
    stage = "authentication";
    const user = await requireApiUser();
    userId = user.id;
    stage = "rate_limit";
    await enforceRequestRateLimit(request, "stock-out", {
      identifier: user.id,
      limit: 120,
      windowMs: 15 * 60 * 1000,
    });
    stage = "validation";
    input = await parseJson(request, stockOutSchema);
    logInventoryEvent({
      requestId,
      operation: "stock_out",
      stage: "validation_succeeded",
      validation: "passed",
      userId,
      productId: input.productId,
      quantity: input.quantity,
      occurredAt: input.occurredAt.toISOString(),
      referenceNumber: input.referenceNumber,
    });
    stage = "database_transaction";
    const result = await recordStockOut(user.id, input);

    revalidatePath("/");
    revalidatePath("/inventory");
    revalidatePath("/products");
    revalidatePath(`/inventory/${result.productId}`);
    logInventoryEvent({
      requestId,
      operation: "stock_out",
      stage: "request_succeeded",
      userId,
      productId: result.productId,
      quantity: input.quantity,
      occurredAt: input.occurredAt.toISOString(),
      referenceNumber: input.referenceNumber,
      newQuantity: result.newQuantity,
      transactionId: result.transactionId,
    });
    return successResponse(result, "Stock sold successfully.", 201);
  } catch (error) {
    logInventoryError(
      {
        requestId,
        operation: "stock_out",
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
    return errorResponse(error, "sell stock", requestId);
  }
}

export const runtime = "nodejs";
export const maxDuration = 30;

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
import { createProduct } from "@/lib/inventory/service";
import {
  createProductSchema,
  type CreateProductInput,
} from "@/validations/inventory";

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  let stage = "request_received";
  let userId: string | undefined;
  let input: CreateProductInput | undefined;

  logInventoryEvent({ requestId, operation: "create_product", stage });

  try {
    stage = "origin_check";
    assertSameOrigin(request);
    stage = "authentication";
    const user = await requireApiUser();
    userId = user.id;
    stage = "rate_limit";
    await enforceRequestRateLimit(request, "create-product", {
      identifier: user.id,
      limit: 30,
      windowMs: 15 * 60 * 1000,
    });
    stage = "validation";
    input = await parseJson(request, createProductSchema);
    logInventoryEvent({
      requestId,
      operation: "create_product",
      stage: "validation_succeeded",
      validation: "passed",
      userId,
      quantity: input.initialQuantity,
    });
    stage = "database_transaction";
    const product = await createProduct(user.id, input);

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/inventory");
    logInventoryEvent({
      requestId,
      operation: "create_product",
      stage: "request_succeeded",
      userId,
      productId: product.id,
      quantity: input.initialQuantity,
      newQuantity: product.newQuantity,
      transactionId: product.transactionId,
    });
    return successResponse(product, "Product added successfully.", 201);
  } catch (error) {
    logInventoryError(
      {
        requestId,
        operation: "create_product",
        stage: `${stage}_failed`,
        validation: stage === "validation" ? "failed" : undefined,
        userId,
        quantity: input?.initialQuantity,
      },
      error,
    );
    return errorResponse(error, "create product", requestId);
  }
}

export const runtime = "nodejs";
export const maxDuration = 30;

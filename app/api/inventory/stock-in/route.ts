import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";

import { errorResponse, successResponse } from "@/lib/api/errors";
import { assertSameOrigin, parseJson } from "@/lib/api/request";
import { enforceRequestRateLimit } from "@/lib/api/rate-limit";
import { requireApiUser } from "@/lib/auth/session";
import { recordStockIn } from "@/lib/inventory/service";
import { stockInSchema } from "@/validations/inventory";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await requireApiUser();
    await enforceRequestRateLimit(request, "stock-in", {
      identifier: user.id,
      limit: 120,
      windowMs: 15 * 60 * 1000,
    });
    const input = await parseJson(request, stockInSchema);
    const result = await recordStockIn(user.id, input);

    revalidatePath("/");
    revalidatePath("/inventory");
    revalidatePath("/products");
    revalidatePath(`/inventory/${result.productId}`);
    return successResponse(result, "Stock received successfully.", 201);
  } catch (error) {
    return errorResponse(error, "stock in");
  }
}

export const runtime = "nodejs";
export const maxDuration = 30;

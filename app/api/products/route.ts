import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";

import { errorResponse, successResponse } from "@/lib/api/errors";
import { assertSameOrigin, parseJson } from "@/lib/api/request";
import { enforceRequestRateLimit } from "@/lib/api/rate-limit";
import { requireApiUser } from "@/lib/auth/session";
import { createProduct } from "@/lib/inventory/service";
import { createProductSchema } from "@/validations/inventory";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await requireApiUser();
    await enforceRequestRateLimit(request, "create-product", {
      identifier: user.id,
      limit: 30,
      windowMs: 15 * 60 * 1000,
    });
    const input = await parseJson(request, createProductSchema);
    const product = await createProduct(user.id, input);

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/inventory");
    return successResponse(product, "Product added successfully.", 201);
  } catch (error) {
    return errorResponse(error, "create product");
  }
}

export const runtime = "nodejs";
export const maxDuration = 30;

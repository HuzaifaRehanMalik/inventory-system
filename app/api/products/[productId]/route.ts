import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";

import { errorResponse, successResponse } from "@/lib/api/errors";
import { assertSameOrigin, parseJson } from "@/lib/api/request";
import { enforceRequestRateLimit } from "@/lib/api/rate-limit";
import { requireApiUser } from "@/lib/auth/session";
import { updateProduct } from "@/lib/inventory/service";
import { updateProductSchema } from "@/validations/inventory";

type ProductRouteContext = {
  params: Promise<{ productId: string }>;
};

export async function PATCH(
  request: NextRequest,
  context: ProductRouteContext,
) {
  try {
    assertSameOrigin(request);
    const user = await requireApiUser();
    await enforceRequestRateLimit(request, "update-product", {
      identifier: user.id,
      limit: 60,
      windowMs: 15 * 60 * 1000,
    });
    const { productId } = await context.params;
    const input = await parseJson(request, updateProductSchema);
    const product = await updateProduct(user.id, productId, input);

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/inventory");
    revalidatePath(`/inventory/${productId}`);
    revalidatePath(`/products/${productId}`);
    return successResponse(product, "Product updated successfully.");
  } catch (error) {
    return errorResponse(error, "update product");
  }
}

export const runtime = "nodejs";
export const maxDuration = 30;

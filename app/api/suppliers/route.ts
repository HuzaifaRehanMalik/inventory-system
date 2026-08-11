import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";

import { errorResponse, successResponse } from "@/lib/api/errors";
import { assertSameOrigin, parseJson } from "@/lib/api/request";
import { enforceRequestRateLimit } from "@/lib/api/rate-limit";
import { requireApiUser } from "@/lib/auth/session";
import { createSupplier } from "@/lib/inventory/service";
import { createSupplierSchema } from "@/validations/inventory";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await requireApiUser();
    await enforceRequestRateLimit(request, "create-supplier", {
      identifier: user.id,
      limit: 30,
      windowMs: 15 * 60 * 1000,
    });
    const input = await parseJson(request, createSupplierSchema);
    const supplier = await createSupplier(user.id, input);

    revalidatePath("/suppliers");
    revalidatePath("/stock-in");
    return successResponse(supplier, "Supplier added successfully.", 201);
  } catch (error) {
    return errorResponse(error, "create supplier");
  }
}

export const runtime = "nodejs";

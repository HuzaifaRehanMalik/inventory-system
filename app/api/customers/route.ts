import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";

import { errorResponse, successResponse } from "@/lib/api/errors";
import { assertSameOrigin, parseJson } from "@/lib/api/request";
import { enforceRequestRateLimit } from "@/lib/api/rate-limit";
import { requireApiUser } from "@/lib/auth/session";
import { createCustomer } from "@/lib/inventory/service";
import { createCustomerSchema } from "@/validations/inventory";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await requireApiUser();
    await enforceRequestRateLimit(request, "create-customer", {
      identifier: user.id,
      limit: 30,
      windowMs: 15 * 60 * 1000,
    });
    const input = await parseJson(request, createCustomerSchema);
    const customer = await createCustomer(user.id, input);

    revalidatePath("/customers");
    revalidatePath("/stock-out");
    return successResponse(customer, "Customer added successfully.", 201);
  } catch (error) {
    return errorResponse(error, "create customer");
  }
}

export const runtime = "nodejs";

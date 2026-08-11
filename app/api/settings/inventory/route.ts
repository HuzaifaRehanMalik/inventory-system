import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";

import { errorResponse, successResponse } from "@/lib/api/errors";
import { assertSameOrigin, parseJson } from "@/lib/api/request";
import { enforceRequestRateLimit } from "@/lib/api/rate-limit";
import { requireApiUser } from "@/lib/auth/session";
import { updateBusinessSettings } from "@/lib/inventory/service";
import { updateBusinessSettingsSchema } from "@/validations/inventory";

export async function PATCH(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await requireApiUser();
    await enforceRequestRateLimit(request, "inventory-settings", {
      identifier: user.id,
      limit: 20,
      windowMs: 15 * 60 * 1000,
    });
    const input = await parseJson(request, updateBusinessSettingsSchema);
    const settings = await updateBusinessSettings(user.id, input);

    revalidatePath("/");
    revalidatePath("/settings");
    revalidatePath("/inventory");
    return successResponse(settings, "Settings updated successfully.");
  } catch (error) {
    return errorResponse(error, "update inventory settings");
  }
}

export const runtime = "nodejs";

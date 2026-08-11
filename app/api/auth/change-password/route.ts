import { after, type NextRequest } from "next/server";

import { errorResponse, logServerError, successResponse } from "@/lib/api/errors";
import { assertSameOrigin, parseJson } from "@/lib/api/request";
import { enforceRequestRateLimit } from "@/lib/api/rate-limit";
import { changePassword } from "@/lib/auth/service";
import { requireApiUser } from "@/lib/auth/session";
import { sendPasswordChangedEmail } from "@/lib/email";
import { changePasswordSchema } from "@/validations/auth";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await requireApiUser();
    const input = await parseJson(request, changePasswordSchema);

    await enforceRequestRateLimit(request, "change-password", {
      identifier: user.id,
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });

    const changedUser = await changePassword(user.id, input);

    after(async () => {
      try {
        await sendPasswordChangedEmail(
          changedUser.email,
          changedUser.name,
        );
      } catch (error) {
        logServerError(error, "password changed email");
      }
    });

    return successResponse(
      { redirectTo: "/login?passwordChanged=1" },
      "Password changed. Sign in again on this device.",
    );
  } catch (error) {
    return errorResponse(error, "change password");
  }
}

export const runtime = "nodejs";
export const maxDuration = 30;

import { after, type NextRequest } from "next/server";

import { errorResponse, logServerError, successResponse } from "@/lib/api/errors";
import { assertSameOrigin, parseJson } from "@/lib/api/request";
import { enforceRequestRateLimit } from "@/lib/api/rate-limit";
import { resetPassword } from "@/lib/auth/service";
import { sendPasswordChangedEmail } from "@/lib/email";
import { resetPasswordSchema } from "@/validations/auth";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const input = await parseJson(request, resetPasswordSchema);

    await enforceRequestRateLimit(request, "reset-password", {
      identifier: input.token,
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });

    const user = await resetPassword(input);

    after(async () => {
      try {
        await sendPasswordChangedEmail(user.email, user.name);
      } catch (error) {
        logServerError(error, "password changed email after reset");
      }
    });

    return successResponse(
      { redirectTo: "/login?passwordChanged=1" },
      "Password reset successfully. Sign in with your new password.",
    );
  } catch (error) {
    return errorResponse(error, "reset password");
  }
}

export const runtime = "nodejs";
export const maxDuration = 30;

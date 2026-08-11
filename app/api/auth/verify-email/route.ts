import { after, type NextRequest } from "next/server";

import { errorResponse, logServerError, successResponse } from "@/lib/api/errors";
import { assertSameOrigin, parseJson } from "@/lib/api/request";
import { enforceRequestRateLimit } from "@/lib/api/rate-limit";
import { verifyEmail } from "@/lib/auth/service";
import { sendWelcomeEmail } from "@/lib/email";
import { tokenSchema } from "@/validations/auth";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const input = await parseJson(request, tokenSchema);

    await enforceRequestRateLimit(request, "verify-email", {
      identifier: input.token,
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });

    const user = await verifyEmail(input.token);

    if (user.newlyVerified) {
      after(async () => {
        try {
          await sendWelcomeEmail(user.email, user.name);
        } catch (error) {
          logServerError(error, "welcome email");
        }
      });
    }

    return successResponse(
      { redirectTo: "/login?verified=1" },
      "Email verified successfully.",
    );
  } catch (error) {
    return errorResponse(error, "verify email");
  }
}

export const runtime = "nodejs";
export const maxDuration = 30;

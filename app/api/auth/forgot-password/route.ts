import { after, type NextRequest } from "next/server";

import { errorResponse, logServerError, successResponse } from "@/lib/api/errors";
import { assertSameOrigin, parseJson } from "@/lib/api/request";
import { enforceRequestRateLimit } from "@/lib/api/rate-limit";
import { createPasswordReset } from "@/lib/auth/service";
import { sendPasswordResetEmail } from "@/lib/email";
import { forgotPasswordSchema } from "@/validations/auth";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const input = await parseJson(request, forgotPasswordSchema);

    await enforceRequestRateLimit(request, "forgot-password", {
      identifier: input.email,
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });

    // The account lookup and token creation only happen for real accounts,
    // so doing them before responding would make real emails measurably
    // slower. Run all of it after the response so timing is uniform.
    after(async () => {
      try {
        const delivery = await createPasswordReset(input.email);

        if (delivery) {
          await sendPasswordResetEmail(
            delivery.email,
            delivery.name,
            delivery.token,
          );
        }
      } catch (error) {
        logServerError(error, "password reset email");
      }
    });

    return successResponse(
      { emailSent: true },
      "If an eligible account exists, a reset link will arrive shortly.",
      202,
    );
  } catch (error) {
    return errorResponse(error, "request password reset");
  }
}

export const runtime = "nodejs";
export const maxDuration = 30;

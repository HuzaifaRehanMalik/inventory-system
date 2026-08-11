import { after, type NextRequest } from "next/server";

import { errorResponse, logServerError, successResponse } from "@/lib/api/errors";
import { assertSameOrigin, parseJson } from "@/lib/api/request";
import { enforceRequestRateLimit } from "@/lib/api/rate-limit";
import { createVerificationEmail } from "@/lib/auth/service";
import { sendVerificationEmail } from "@/lib/email";
import { resendVerificationSchema } from "@/validations/auth";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const input = await parseJson(request, resendVerificationSchema);

    await enforceRequestRateLimit(request, "resend-verification", {
      identifier: input.email,
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });

    const delivery = await createVerificationEmail(input.email);

    if (delivery) {
      after(async () => {
        try {
          await sendVerificationEmail(
            delivery.email,
            delivery.name,
            delivery.token,
          );
        } catch (error) {
          logServerError(error, "resend verification email");
        }
      });
    }

    return successResponse(
      { emailSent: true },
      "If the account needs verification, a new link will arrive shortly.",
      202,
    );
  } catch (error) {
    return errorResponse(error, "resend verification");
  }
}

export const runtime = "nodejs";
export const maxDuration = 30;

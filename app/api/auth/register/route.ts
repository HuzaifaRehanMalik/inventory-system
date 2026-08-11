import { after, type NextRequest } from "next/server";

import { errorResponse, logServerError, successResponse } from "@/lib/api/errors";
import { parseJson, assertSameOrigin } from "@/lib/api/request";
import { enforceRequestRateLimit } from "@/lib/api/rate-limit";
import { registerUser } from "@/lib/auth/service";
import { sendVerificationEmail } from "@/lib/email";
import { startPerformanceTimer, withPerformanceTimer } from "@/lib/performance";
import { registerSchema } from "@/validations/auth";

export async function POST(request: NextRequest) {
  const requestTimer = startPerformanceTimer("registration.request");

  try {
    assertSameOrigin(request);
    const input = await withPerformanceTimer(
      "registration.validation",
      () => parseJson(request, registerSchema),
    );

    await withPerformanceTimer("registration.rate-limit", () =>
      enforceRequestRateLimit(request, "register", {
        identifier: input.email,
        limit: 5,
        windowMs: 60 * 60 * 1000,
      }),
    );

    const delivery = await withPerformanceTimer(
      "registration.create-user",
      () => registerUser(input),
    );

    after(async () => {
      try {
        await sendVerificationEmail(
          delivery.email,
          delivery.name,
          delivery.token,
        );
      } catch (error) {
        logServerError(error, "registration verification email");
      }
    });

    const response = successResponse(
      { emailSent: true },
      "Account created. Check your email to verify it.",
      201,
    );
    response.headers.append(
      "Server-Timing",
      `registration;dur=${requestTimer.end({ outcome: "success" }).toFixed(1)}`,
    );
    return response;
  } catch (error) {
    const response = errorResponse(error, "register user");
    response.headers.append(
      "Server-Timing",
      `registration;dur=${requestTimer.end({ outcome: "error" }).toFixed(1)}`,
    );
    return response;
  }
}

export const runtime = "nodejs";
export const maxDuration = 30;

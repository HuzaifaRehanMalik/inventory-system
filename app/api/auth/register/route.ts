import { after, type NextRequest } from "next/server";

import { errorResponse, logServerError, successResponse } from "@/lib/api/errors";
import { parseJson, assertSameOrigin } from "@/lib/api/request";
import { enforceRequestRateLimit } from "@/lib/api/rate-limit";
import { prepareExistingAccountNotice, registerUser } from "@/lib/auth/service";
import { sendAccountExistsNotice, sendVerificationEmail } from "@/lib/email";
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

    const result = await withPerformanceTimer(
      "registration.create-user",
      () => registerUser(input),
    );

    // The response is identical whether or not the email was already
    // registered, so this endpoint cannot be used to enumerate accounts.
    // Any extra work for an existing account happens after the response.
    after(async () => {
      try {
        if (result.status === "created") {
          await sendVerificationEmail(
            result.delivery.email,
            result.delivery.name,
            result.delivery.token,
          );
          return;
        }

        const notice = await prepareExistingAccountNotice(result.email);

        if (notice?.type === "verification") {
          await sendVerificationEmail(
            notice.delivery.email,
            notice.delivery.name,
            notice.delivery.token,
          );
        } else if (notice?.type === "account-exists") {
          await sendAccountExistsNotice(notice.email, notice.name);
        }
      } catch (error) {
        logServerError(error, "registration email");
      }
    });

    const response = successResponse(
      { emailSent: true },
      "Check your email to finish setting up your account.",
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

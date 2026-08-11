import { after, type NextRequest } from "next/server";

import { unstable_update } from "@/auth";
import { errorResponse, logServerError, successResponse } from "@/lib/api/errors";
import { assertSameOrigin, parseJson } from "@/lib/api/request";
import { enforceRequestRateLimit } from "@/lib/api/rate-limit";
import { updateProfile } from "@/lib/auth/service";
import { requireApiUser } from "@/lib/auth/session";
import { sendVerificationEmail } from "@/lib/email";
import { updateProfileSchema } from "@/validations/auth";

export async function GET() {
  try {
    const user = await requireApiUser();

    return successResponse(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      "Profile loaded.",
    );
  } catch (error) {
    return errorResponse(error, "get profile");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const currentUser = await requireApiUser();
    const input = await parseJson(request, updateProfileSchema);

    await enforceRequestRateLimit(request, "update-profile", {
      identifier: currentUser.id,
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });

    const result = await updateProfile(
      currentUser.id,
      currentUser.sessionVersion,
      input,
    );

    if (result.delivery) {
      const delivery = result.delivery;
      after(async () => {
        try {
          await sendVerificationEmail(
            delivery.email,
            delivery.name,
            delivery.token,
          );
        } catch (error) {
          logServerError(error, "profile email change verification");
        }
      });
    } else {
      await unstable_update({ user: { name: result.user.name } });
    }

    return successResponse(
      {
        user: result.user,
        emailChanged: result.emailChanged,
        reauthenticate: result.emailChanged,
      },
      result.emailChanged
        ? "Profile updated. Verify your new email before signing in again."
        : "Profile updated successfully.",
    );
  } catch (error) {
    return errorResponse(error, "update profile");
  }
}

export const runtime = "nodejs";
export const maxDuration = 30;

import type { NextRequest } from "next/server";

import { auth, signOut } from "@/auth";
import { errorResponse, successResponse } from "@/lib/api/errors";
import { assertSameOrigin } from "@/lib/api/request";
import { prisma } from "@/lib/prisma";

// Sessions are stateless JWTs, so clearing the cookie alone leaves any copied
// token valid until it expires (up to 30 days with "remember me"). Bumping
// sessionVersion makes getCurrentUser() reject every token issued before now.
async function revokeServerSession() {
  const session = await auth();
  const userId = session?.user?.id;
  const sessionVersion = session?.user?.sessionVersion;

  if (!userId || typeof sessionVersion !== "number") {
    return;
  }

  // Only bump when the token is still current, so a stale or already
  // revoked cookie cannot be replayed to keep signing out other sessions.
  await prisma.user.updateMany({
    where: { id: userId, sessionVersion },
    data: { sessionVersion: { increment: 1 } },
  });
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);

    try {
      await revokeServerSession();
    } finally {
      // Always clear the cookie, even if revocation failed.
      await signOut({ redirect: false });
    }

    return successResponse(null, "Signed out successfully.");
  } catch (error) {
    return errorResponse(error, "sign out");
  }
}

export const runtime = "nodejs";

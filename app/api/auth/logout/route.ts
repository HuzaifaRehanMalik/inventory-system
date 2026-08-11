import type { NextRequest } from "next/server";

import { signOut } from "@/auth";
import { errorResponse, successResponse } from "@/lib/api/errors";
import { assertSameOrigin } from "@/lib/api/request";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    await signOut({ redirect: false });

    return successResponse(null, "Signed out successfully.");
  } catch (error) {
    return errorResponse(error, "sign out");
  }
}

export const runtime = "nodejs";

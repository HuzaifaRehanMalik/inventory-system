import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { CredentialsSignin } from "next-auth";

import { signIn } from "@/auth";
import { AppError, errorResponse, successResponse } from "@/lib/api/errors";
import { assertSameOrigin, parseJson } from "@/lib/api/request";
import {
  AUTH_SESSION_COOKIE_NAME,
  AUTH_SESSION_COOKIE_OPTIONS,
} from "@/lib/auth/constants";
import { sanitizeCallbackUrl } from "@/lib/utils";
import { loginSchema } from "@/validations/auth";

const loginErrors: Record<
  string,
  { status: number; code: string; message: string }
> = {
  credentials: {
    status: 401,
    code: "INVALID_CREDENTIALS",
    message: "Email or password is incorrect.",
  },
  email_not_verified: {
    status: 403,
    code: "EMAIL_NOT_VERIFIED",
    message: "Verify your email before signing in.",
  },
  account_unavailable: {
    status: 403,
    code: "ACCOUNT_UNAVAILABLE",
    message: "This account is not available. Contact your administrator.",
  },
  rate_limited: {
    status: 429,
    code: "RATE_LIMITED",
    message: "Too many sign-in attempts. Try again later.",
  },
};

function credentialError(code: string) {
  const mapped = loginErrors[code] ?? loginErrors.credentials;

  return new AppError(mapped.status, mapped.code, mapped.message);
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const input = await parseJson(request, loginSchema);
    const redirectTo = sanitizeCallbackUrl(input.callbackUrl);

    const result = await signIn("credentials", {
      email: input.email,
      password: input.password,
      rememberMe: input.rememberMe,
      redirect: false,
      redirectTo,
    });

    const resultUrl = new URL(result, request.url);
    const authError = resultUrl.searchParams.get("error");
    const authCode = resultUrl.searchParams.get("code") ?? "credentials";

    if (authError) {
      throw credentialError(authCode);
    }

    if (!input.rememberMe) {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get(AUTH_SESSION_COOKIE_NAME);

      if (sessionCookie) {
        cookieStore.set(
          AUTH_SESSION_COOKIE_NAME,
          sessionCookie.value,
          AUTH_SESSION_COOKIE_OPTIONS,
        );
      }
    }

    return successResponse(
      { redirectTo },
      "Signed in successfully.",
    );
  } catch (error) {
    // Auth.js server-side signIn() rethrows CredentialsSignin even when
    // redirect is false. Translate expected credential outcomes here while
    // allowing configuration, adapter, and database failures to remain 500s.
    if (error instanceof CredentialsSignin) {
      return errorResponse(credentialError(error.code), "sign in");
    }

    return errorResponse(error, "sign in");
  }
}

export const runtime = "nodejs";

import "server-only";

import { AppError } from "@/lib/api/errors";
import { getClientIp, UNKNOWN_CLIENT_IP } from "@/lib/api/request";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { withPerformanceTimer } from "@/lib/performance";

// Each IP may make this many times the per-identifier limit across all
// identifiers, so one source cannot spray many accounts or email addresses.
export const PER_IP_LIMIT_MULTIPLIER = 5;

export async function enforceRequestRateLimit(
  request: Request,
  namespace: string,
  options: {
    identifier?: string;
    limit: number;
    windowMs: number;
  },
) {
  const ip = getClientIp(request);
  const result = await withPerformanceTimer(
    "rate-limit.enforce",
    () =>
      checkRateLimit({
        namespace,
        identifier: `${ip}:${options.identifier ?? ""}`,
        limit: options.limit,
        windowMs: options.windowMs,
      }),
    { namespace },
  );

  if (result.allowed && ip !== UNKNOWN_CLIENT_IP && options.identifier) {
    const ipResult = await checkRateLimit({
      namespace: `${namespace}:ip`,
      identifier: ip,
      limit: options.limit * PER_IP_LIMIT_MULTIPLIER,
      windowMs: options.windowMs,
    });

    if (!ipResult.allowed) {
      throw new AppError(
        429,
        "RATE_LIMITED",
        "Too many attempts. Please wait before trying again.",
        { retryAfterSeconds: ipResult.retryAfterSeconds },
      );
    }
  }

  if (!result.allowed) {
    throw new AppError(
      429,
      "RATE_LIMITED",
      "Too many attempts. Please wait before trying again.",
      { retryAfterSeconds: result.retryAfterSeconds },
    );
  }

  return result;
}

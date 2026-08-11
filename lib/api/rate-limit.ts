import "server-only";

import { AppError } from "@/lib/api/errors";
import { getClientIp } from "@/lib/api/request";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { withPerformanceTimer } from "@/lib/performance";

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

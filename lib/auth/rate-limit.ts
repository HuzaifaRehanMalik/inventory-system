import "server-only";

import { Prisma } from "@/app/generated/prisma/client";
import { hashToken } from "@/lib/auth/crypto";
import { withPerformanceTimer } from "@/lib/performance";
import { prisma } from "@/lib/prisma";

type RateLimitOptions = {
  namespace: string;
  identifier: string;
  limit: number;
  windowMs: number;
};

type RateLimitRow = {
  count: number;
  resetAt: Date;
};

export async function checkRateLimit({
  namespace,
  identifier,
  limit,
  windowMs,
}: RateLimitOptions) {
  const key = hashToken(`${namespace}:${identifier}`);
  const now = new Date();
  const nextReset = new Date(now.getTime() + windowMs);
  const rows = await withPerformanceTimer(
    "rate-limit.database",
    () => prisma.$queryRaw<RateLimitRow[]>(Prisma.sql`
      INSERT INTO "AuthRateLimit" AS current (
        "key", "count", "resetAt", "createdAt", "updatedAt"
      )
      VALUES (${key}, 1, ${nextReset}, ${now}, ${now})
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN current."resetAt" <= ${now} THEN 1
          ELSE LEAST(current."count" + 1, ${limit + 1})
        END,
        "resetAt" = CASE
          WHEN current."resetAt" <= ${now} THEN ${nextReset}
          ELSE current."resetAt"
        END,
        "updatedAt" = ${now}
      RETURNING "count", "resetAt"
    `),
    { namespace },
  );
  const current = rows[0];

  if (!current) {
    throw new Error("Rate-limit update did not return a row.");
  }

  const allowed = current.count <= limit;

  return {
    allowed,
    remaining: Math.max(0, limit - current.count),
    retryAfterSeconds: allowed
      ? 0
      : Math.max(
          1,
          Math.ceil((current.resetAt.getTime() - now.getTime()) / 1000),
        ),
  };
}

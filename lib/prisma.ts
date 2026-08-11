import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";
import { getDatabaseUrl } from "@/lib/database-url";
import {
  isPerformanceLoggingEnabled,
  logPerformance,
} from "@/lib/performance";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const performanceLoggingEnabled = isPerformanceLoggingEnabled();
  const configuredPoolSize = Number(process.env.DATABASE_POOL_MAX);
  const maxConnections =
    Number.isSafeInteger(configuredPoolSize) && configuredPoolSize > 0
      ? configuredPoolSize
      : process.env.NODE_ENV === "production"
        ? 5
        : 3;
  const adapter = new PrismaPg(
    {
      connectionString: getDatabaseUrl(),
      max: maxConnections,
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 30_000,
      keepAlive: true,
      maxLifetimeSeconds: 5 * 60,
    },
    {
      onPoolError(error) {
        console.error("PostgreSQL pool error", error);
      },
    },
  );
  const client = new PrismaClient({
    adapter,
    errorFormat: process.env.NODE_ENV === "production" ? "minimal" : "pretty",
    log: performanceLoggingEnabled
      ? [
          { emit: "event", level: "query" },
          { emit: "stdout", level: "warn" },
          { emit: "stdout", level: "error" },
        ]
      : [
          { emit: "stdout", level: "warn" },
          { emit: "stdout", level: "error" },
        ],
    transactionOptions: {
      // Neon's first TLS connection can exceed Prisma's 2 second default.
      maxWait: 10_000,
      timeout: 10_000,
    },
  });

  if (performanceLoggingEnabled) {
    client.$on("query", (event) => {
      logPerformance("prisma.query", event.duration, { target: event.target });
    });
  }

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

type PerformanceValue = boolean | number | string | undefined;
type PerformanceContext = Record<string, PerformanceValue>;

export function isPerformanceLoggingEnabled() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.PERFORMANCE_LOGGING === "true"
  );
}

export function logPerformance(
  name: string,
  durationMs: number,
  context: PerformanceContext = {},
) {
  if (!isPerformanceLoggingEnabled()) {
    return;
  }

  console.info(`[perf] ${name}`, {
    durationMs: Number(durationMs.toFixed(1)),
    ...context,
  });
}

export function startPerformanceTimer(
  name: string,
  context: PerformanceContext = {},
) {
  if (!isPerformanceLoggingEnabled()) {
    return {
      end() {
        return 0;
      },
    };
  }

  const startedAt = performance.now();
  let finished = false;

  return {
    end(extraContext: PerformanceContext = {}) {
      if (finished) {
        return 0;
      }

      finished = true;
      const durationMs = performance.now() - startedAt;
      logPerformance(name, durationMs, { ...context, ...extraContext });
      return durationMs;
    },
  };
}

export async function withPerformanceTimer<T>(
  name: string,
  operation: () => Promise<T>,
  context: PerformanceContext = {},
) {
  if (!isPerformanceLoggingEnabled()) {
    return operation();
  }

  const timer = startPerformanceTimer(name, context);

  try {
    const result = await operation();
    timer.end({ outcome: "success" });
    return result;
  } catch (error) {
    timer.end({ outcome: "error" });
    throw error;
  }
}

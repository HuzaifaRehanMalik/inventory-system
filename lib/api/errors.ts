import { ZodError } from "zod";

const SENSITIVE_VALUE_PATTERN =
  /\b(password|passwd|token|secret|api[-_]?key|authorization)\b(\s*[:=]\s*)([^\s,;}]+)/gi;
const CREDENTIAL_URL_PATTERN = /([a-z][a-z0-9+.-]*:\/\/)[^\s/@:]+:[^\s/@]+@/gi;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const JWT_PATTERN = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g;

export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function redactSensitiveTextForLog(value: string) {
  return value
    .replace(CREDENTIAL_URL_PATTERN, "$1[REDACTED]@")
    .replace(SENSITIVE_VALUE_PATTERN, "$1$2[REDACTED]")
    .replace(JWT_PATTERN, "[REDACTED_TOKEN]")
    .replace(EMAIL_PATTERN, "[REDACTED_EMAIL]");
}

export function errorDetailsForLog(error: unknown) {
  if (error instanceof ZodError) {
    return {
      name: error.name,
      issues: error.issues.map((issue) => ({
        code: issue.code,
        path: issue.path.map(String).join("."),
        message: redactSensitiveTextForLog(issue.message),
      })),
    };
  }

  if (error instanceof Error) {
    const codedError = error as Error & { code?: unknown };

    return {
      name: error.name,
      ...(typeof codedError.code === "string"
        ? { code: codedError.code }
        : {}),
      message: redactSensitiveTextForLog(error.message),
      ...(error.stack
        ? { stack: redactSensitiveTextForLog(error.stack) }
        : {}),
    };
  }

  return { message: redactSensitiveTextForLog(String(error)) };
}

export function logServerError(
  error: unknown,
  context: string,
  eventId = crypto.randomUUID(),
) {
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "error",
      eventId,
      context,
      error: errorDetailsForLog(error),
    }),
  );
  return eventId;
}

export function errorResponse(
  error: unknown,
  context: string,
  requestId?: string,
) {
  if (error instanceof AppError) {
    return Response.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          ...error.details,
        },
      },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    return Response.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Please correct the highlighted fields.",
          fieldErrors: error.flatten().fieldErrors,
        },
      },
      { status: 422 },
    );
  }

  const eventId = logServerError(error, context, requestId);

  return Response.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Something went wrong. Please try again.",
        eventId,
      },
    },
    { status: 500 },
  );
}

export function successResponse<T>(
  data: T,
  message: string,
  status = 200,
) {
  return Response.json({ success: true, message, data }, { status });
}

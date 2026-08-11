import { ZodError } from "zod";

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

export function logServerError(error: unknown, context: string) {
  const eventId = crypto.randomUUID();

  console.error(`[${eventId}] ${context}`, error);
  return eventId;
}

export function errorResponse(error: unknown, context: string) {
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

  const eventId = logServerError(error, context);

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

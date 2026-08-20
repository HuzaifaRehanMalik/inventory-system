export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
    retryAfterSeconds?: number;
    eventId?: string;
  };
};

export class ApiClientError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export async function apiRequest<T>(
  url: string,
  body?: unknown,
  method: "POST" | "PATCH" | "DELETE" | "GET" = "POST",
) {
  const response = await fetch(url, {
    method,
    credentials: "same-origin",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let payload: ApiSuccess<T> | ApiFailure;

  try {
    payload = (await response.json()) as ApiSuccess<T> | ApiFailure;
  } catch {
    throw new ApiClientError(
      "INVALID_RESPONSE",
      "The server returned an invalid response. Please try again.",
    );
  }

  if (!response.ok || !payload.success) {
    const failure = payload as ApiFailure;
    throw new ApiClientError(
      failure.error?.code ?? "REQUEST_FAILED",
      failure.error?.message ?? "The request could not be completed.",
      failure.error?.fieldErrors,
    );
  }

  return payload;
}

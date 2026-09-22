import type { NextRequest } from "next/server";
import type { ZodType } from "zod";

import { AppError } from "./errors.ts";

const MAX_JSON_BODY_BYTES = 20_000;

export async function parseJson<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<T> {
  const contentType = request.headers.get("content-type") ?? "";
  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (!contentType.toLowerCase().startsWith("application/json")) {
    throw new AppError(415, "UNSUPPORTED_MEDIA_TYPE", "JSON request body required.");
  }

  if (contentLength > MAX_JSON_BODY_BYTES) {
    throw new AppError(413, "PAYLOAD_TOO_LARGE", "Request body is too large.");
  }

  let bodyText: string;

  try {
    if (!request.body) {
      bodyText = "";
    } else {
      const reader = request.body.getReader();
      const chunks: Uint8Array[] = [];
      let totalBytes = 0;

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        totalBytes += value.byteLength;

        if (totalBytes > MAX_JSON_BODY_BYTES) {
          await reader.cancel();
          throw new AppError(413, "PAYLOAD_TOO_LARGE", "Request body is too large.");
        }

        chunks.push(value);
      }

      const bytes = new Uint8Array(totalBytes);
      let offset = 0;

      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.byteLength;
      }

      bodyText = new TextDecoder().decode(bytes);
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(400, "INVALID_JSON", "Request body contains invalid JSON.");
  }

  let body: unknown;

  try {
    body = JSON.parse(bodyText);
  } catch {
    throw new AppError(400, "INVALID_JSON", "Request body contains invalid JSON.");
  }

  return schema.parse(body);
}

export function assertSameOrigin(request: NextRequest | Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    if (process.env.NODE_ENV === "production") {
      throw new AppError(403, "INVALID_ORIGIN", "Request origin could not be verified.");
    }
    return;
  }

  const allowedOrigins = new Set<string>();
  allowedOrigins.add(new URL(request.url).origin);

  for (const value of [process.env.APP_URL, process.env.AUTH_URL]) {
    if (value) {
      allowedOrigins.add(new URL(value).origin);
    }
  }

  if (!allowedOrigins.has(origin)) {
    throw new AppError(403, "INVALID_ORIGIN", "Request origin could not be verified.");
  }
}

export function getClientIp(request: Request) {
  if (process.env.TRUSTED_PROXY_HEADERS !== "true") {
    return "unknown";
  }

  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

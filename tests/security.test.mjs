import assert from "node:assert/strict";
import test from "node:test";

import { z } from "zod";

import {
  AppError,
  errorResponse,
  successResponse,
} from "../lib/api/errors.ts";
import { assertSameOrigin, getClientIp, parseJson } from "../lib/api/request.ts";

const requestSchema = z.object({ value: z.string() });

test("same-origin checks do not trust spoofed forwarded headers", () => {
  const request = new Request("https://inventory.example/api/test", {
    headers: {
      origin: "https://attacker.example",
      "x-forwarded-host": "attacker.example",
      "x-forwarded-proto": "https",
    },
  });

  assert.throws(
    () => assertSameOrigin(request),
    (error) => error instanceof AppError && error.code === "INVALID_ORIGIN",
  );
});

test("rate limits do not trust forwarded client IPs by default", () => {
  const request = new Request("https://inventory.example/api/test", {
    headers: { "x-forwarded-for": "203.0.113.10" },
  });

  assert.equal(getClientIp(request), "unknown");
});

test("JSON body limits apply when content length is unavailable", async () => {
  const payload = JSON.stringify({ value: "x".repeat(20_000) });
  const encoded = new TextEncoder().encode(payload);
  const request = new Request("https://inventory.example/api/test", {
    method: "POST",
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(encoded);
        controller.close();
      },
    }),
    headers: { "content-type": "application/json" },
    duplex: "half",
  });

  await assert.rejects(
    () => parseJson(request, requestSchema),
    (error) => error instanceof AppError && error.code === "PAYLOAD_TOO_LARGE",
  );
});

test("API success and error responses cannot be cached", () => {
  assert.equal(successResponse({}, "ok").headers.get("cache-control"), "no-store");
  assert.equal(
    errorResponse(new AppError(400, "BAD_REQUEST", "Invalid request."), "test")
      .headers.get("cache-control"),
    "no-store",
  );
});

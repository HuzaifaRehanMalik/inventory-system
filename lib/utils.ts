import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

const CALLBACK_BASE_ORIGIN = "http://callback.invalid";

export function sanitizeCallbackUrl(value: string | null | undefined) {
  // Browsers treat "\" as "/" and strip tabs/newlines, so "/\evil.com" or
  // "/\t/evil.com" resolve to another host. Parse the value the way a browser
  // would and only accept it if it stays on our origin.
  if (!value || !value.startsWith("/")) {
    return "/";
  }

  let url: URL;

  try {
    url = new URL(value, CALLBACK_BASE_ORIGIN);
  } catch {
    return "/";
  }

  if (url.origin !== CALLBACK_BASE_ORIGIN) {
    return "/";
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

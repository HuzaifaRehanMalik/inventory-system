export const BCRYPT_ROUNDS = 12;
export const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
export const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
export const STANDARD_SESSION_TTL_MS = 24 * 60 * 60 * 1000;
export const REMEMBERED_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const AUTH_SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export const DUMMY_PASSWORD_HASH =
  "$2b$12$BbN3X24wjEqKwNCzbXfDsOQuPWvA1bERyGIxYij0vxEE1Qnkr40E.";

export const AUTH_COOKIE_SECURE = process.env.NODE_ENV === "production";
export const AUTH_SESSION_COOKIE_NAME = `${AUTH_COOKIE_SECURE ? "__Secure-" : ""}authjs.session-token`;

export const AUTH_SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: AUTH_COOKIE_SECURE,
};

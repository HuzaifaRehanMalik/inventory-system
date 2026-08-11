import type { DefaultSession } from "next-auth";
type UserRole = "USER" | "ADMIN";
type UserStatus = "ACTIVE" | "SUSPENDED" | "DISABLED";

declare module "next-auth" {
  interface User {
    role: UserRole;
    status: UserStatus;
    emailVerified: Date | null;
    sessionVersion: number;
    rememberMe?: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      status: UserStatus;
      emailVerified: Date | null;
      sessionVersion: number;
    } & DefaultSession["user"];
    sessionExpiresAt: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    status: UserStatus;
    emailVerified: string | null;
    sessionVersion: number;
    sessionExpiresAt: number;
  }
}

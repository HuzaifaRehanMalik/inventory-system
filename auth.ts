import { compare } from "bcrypt";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";

import {
  AUTH_SESSION_COOKIE_NAME,
  AUTH_SESSION_COOKIE_OPTIONS,
  AUTH_SESSION_MAX_AGE_SECONDS,
  DUMMY_PASSWORD_HASH,
  REMEMBERED_SESSION_TTL_MS,
  STANDARD_SESSION_TTL_MS,
} from "@/lib/auth/constants";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { getClientIp } from "@/lib/api/request";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/validations/auth";

type AuthTokenClaims = {
  id: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "DISABLED";
  emailVerified: string | null;
  sessionVersion: number;
  sessionExpiresAt: number;
};

class EmailNotVerifiedError extends CredentialsSignin {
  code = "email_not_verified";
}

class AccountUnavailableError extends CredentialsSignin {
  code = "account_unavailable";
}

class LoginRateLimitError extends CredentialsSignin {
  code = "rate_limited";
}

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
    updateAge: 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: AUTH_SESSION_COOKIE_NAME,
      options: AUTH_SESSION_COOKIE_OPTIONS,
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember me", type: "checkbox" },
      },
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse({
          email: credentials.email,
          password: credentials.password,
          rememberMe:
            credentials.rememberMe === true ||
            credentials.rememberMe === "true",
        });

        if (!parsed.success) {
          await compare("not-a-real-password", DUMMY_PASSWORD_HASH);
          return null;
        }

        const ip = getClientIp(request);
        const rateLimit = await checkRateLimit({
          namespace: "login",
          identifier: `${ip}:${parsed.data.email}`,
          limit: 10,
          windowMs: 15 * 60 * 1000,
        });

        if (!rateLimit.allowed) {
          throw new LoginRateLimitError();
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            passwordHash: true,
            role: true,
            status: true,
            emailVerified: true,
            sessionVersion: true,
          },
        });

        const passwordMatches = await compare(
          parsed.data.password,
          user?.passwordHash ?? DUMMY_PASSWORD_HASH,
        );

        if (!user || !user.passwordHash || !passwordMatches) {
          return null;
        }

        if (user.status !== "ACTIVE") {
          throw new AccountUnavailableError();
        }

        if (!user.emailVerified) {
          throw new EmailNotVerifiedError();
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified,
          sessionVersion: user.sessionVersion,
          rememberMe: parsed.data.rememberMe,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user, trigger }) {
      const authToken = token as typeof token & AuthTokenClaims;

      if (user) {
        authToken.id = user.id!;
        authToken.name = user.name;
        authToken.email = user.email;
        authToken.picture = user.image;
        authToken.role = user.role;
        authToken.status = user.status;
        authToken.emailVerified = user.emailVerified?.toISOString() ?? null;
        authToken.sessionVersion = user.sessionVersion;
        authToken.sessionExpiresAt =
          Date.now() +
          (user.rememberMe
            ? REMEMBERED_SESSION_TTL_MS
            : STANDARD_SESSION_TTL_MS);
      }

      if (trigger === "update" && authToken.id) {
        return prisma.user
          .findUnique({
            where: { id: authToken.id },
            select: {
              name: true,
              email: true,
              image: true,
              role: true,
              status: true,
              emailVerified: true,
              sessionVersion: true,
            },
          })
          .then((freshUser) => {
            if (!freshUser) {
              authToken.sessionExpiresAt = 0;
              return authToken;
            }

            authToken.name = freshUser.name;
            authToken.email = freshUser.email;
            authToken.picture = freshUser.image;
            authToken.role = freshUser.role;
            authToken.status = freshUser.status;
            authToken.emailVerified =
              freshUser.emailVerified?.toISOString() ?? null;
            authToken.sessionVersion = freshUser.sessionVersion;
            return authToken;
          });
      }

      return authToken;
    },
    session({ session, token }) {
      const authToken = token as typeof token & AuthTokenClaims;

      session.user.id = authToken.id;
      session.user.role = authToken.role;
      session.user.status = authToken.status;
      session.user.emailVerified = authToken.emailVerified
        ? new Date(authToken.emailVerified)
        : null;
      session.user.sessionVersion = authToken.sessionVersion;
      session.sessionExpiresAt = authToken.sessionExpiresAt;
      return session;
    },
    redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      if (new URL(url).origin === baseUrl) {
        return url;
      }

      return `${baseUrl}/`;
    },
  },
});

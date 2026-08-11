import "server-only";

import { compare, hash } from "bcrypt";

import { Prisma } from "@/app/generated/prisma/client";
import type {
  ChangePasswordInput,
  RegisterInput,
  ResetPasswordInput,
  UpdateProfileInput,
} from "@/validations/auth";
import {
  BCRYPT_ROUNDS,
  PASSWORD_RESET_TOKEN_TTL_MS,
  VERIFICATION_TOKEN_TTL_MS,
} from "@/lib/auth/constants";
import { generateSecureToken, hashToken } from "@/lib/auth/crypto";
import { AppError } from "@/lib/api/errors";
import { withPerformanceTimer } from "@/lib/performance";
import { prisma } from "@/lib/prisma";

export type EmailDelivery = {
  email: string;
  name: string;
  token: string;
};

type RegisteredUserRow = {
  email: string;
  name: string;
};

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function registerUser(
  input: RegisterInput,
): Promise<EmailDelivery> {
  const token = generateSecureToken();
  const tokenHash = hashToken(token);
  const passwordHash = await withPerformanceTimer(
    "registration.password-hash",
    () => hash(input.password, BCRYPT_ROUNDS),
  );
  const expires = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);

  try {
    const users = await withPerformanceTimer(
      "registration.database",
      () =>
        prisma.$queryRaw<RegisteredUserRow[]>(Prisma.sql`
          WITH new_user AS (
            INSERT INTO "User" (
              "id", "name", "email", "passwordHash", "updatedAt"
            )
            VALUES (
              ${crypto.randomUUID()}, ${input.name}, ${input.email},
              ${passwordHash}, NOW()
            )
            ON CONFLICT ("email") DO NOTHING
            RETURNING "email", "name"
          ),
          new_token AS (
            INSERT INTO "VerificationToken" (
              "identifier", "token", "expires", "createdAt", "updatedAt"
            )
            SELECT "email", ${tokenHash}, ${expires}, NOW(), NOW()
            FROM new_user
            RETURNING "identifier"
          )
          SELECT new_user."email", new_user."name"
          FROM new_user
          INNER JOIN new_token
            ON new_token."identifier" = new_user."email"
        `),
    );
    const user = users[0];

    if (!user) {
      throw new AppError(
        409,
        "EMAIL_ALREADY_REGISTERED",
        "An account with this email already exists.",
      );
    }

    return { email: user.email, name: user.name, token };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new AppError(
        409,
        "EMAIL_ALREADY_REGISTERED",
        "An account with this email already exists.",
      );
    }
    throw error;
  }
}

export async function createPasswordReset(
  email: string,
): Promise<EmailDelivery | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
    },
  });

  if (!user || user.status !== "ACTIVE") {
    return null;
  }

  const token = generateSecureToken();
  const expires = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);

  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
    prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expires,
      },
    }),
  ]);

  return { email: user.email, name: user.name, token };
}

export async function resetPassword(input: ResetPasswordInput) {
  const tokenHash = hashToken(input.token);
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          passwordHash: true,
          status: true,
        },
      },
    },
  });

  if (
    !resetToken ||
    resetToken.expires <= new Date() ||
    resetToken.user.status !== "ACTIVE"
  ) {
    if (resetToken) {
      await prisma.passwordResetToken.deleteMany({
        where: { tokenHash },
      });
    }

    throw new AppError(
      400,
      "INVALID_RESET_TOKEN",
      "This password reset link is invalid or has expired.",
    );
  }

  if (
    resetToken.user.passwordHash &&
    (await compare(input.password, resetToken.user.passwordHash))
  ) {
    throw new AppError(
      422,
      "PASSWORD_REUSED",
      "Choose a password you have not just used.",
      { fieldErrors: { password: ["Choose a different password."] } },
    );
  }

  const passwordHash = await hash(input.password, BCRYPT_ROUNDS);
  const now = new Date();

  await prisma.$transaction(
    async (transaction) => {
      const consumed = await transaction.passwordResetToken.deleteMany({
        where: {
          tokenHash,
          expires: { gt: now },
        },
      });

      if (consumed.count !== 1) {
        throw new AppError(
          400,
          "INVALID_RESET_TOKEN",
          "This password reset link is invalid or has expired.",
        );
      }

      await transaction.user.update({
        where: { id: resetToken.user.id },
        data: {
          passwordHash,
          passwordChangedAt: now,
          sessionVersion: { increment: 1 },
        },
      });

      await transaction.passwordResetToken.deleteMany({
        where: { userId: resetToken.user.id },
      });
    },
    { isolationLevel: "Serializable" },
  );

  return {
    email: resetToken.user.email,
    name: resetToken.user.name,
  };
}

export async function verifyEmail(token: string) {
  const hashedToken = hashToken(token);

  return prisma.$transaction(
    async (transaction) => {
      const verification = await transaction.verificationToken.findUnique({
        where: { token: hashedToken },
      });

      if (!verification || verification.expires <= new Date()) {
        if (verification) {
          await transaction.verificationToken.deleteMany({
            where: { token: hashedToken },
          });
        }

        throw new AppError(
          400,
          "INVALID_VERIFICATION_TOKEN",
          "This verification link is invalid or has expired.",
        );
      }

      const user = await transaction.user.findUnique({
        where: { email: verification.identifier },
      });

      if (!user) {
        await transaction.verificationToken.deleteMany({
          where: { token: hashedToken },
        });
        throw new AppError(
          400,
          "INVALID_VERIFICATION_TOKEN",
          "This verification link is invalid or has expired.",
        );
      }

      if (!user.emailVerified) {
        await transaction.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        });
      }

      await transaction.verificationToken.deleteMany({
        where: { identifier: user.email },
      });

      return {
        email: user.email,
        name: user.name,
        newlyVerified: !user.emailVerified,
      };
    },
    { isolationLevel: "Serializable" },
  );
}

export async function createVerificationEmail(
  email: string,
): Promise<EmailDelivery | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
      status: true,
    },
  });

  if (!user || user.emailVerified || user.status !== "ACTIVE") {
    return null;
  }

  const token = generateSecureToken();
  const expires = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);

  await prisma.$transaction([
    prisma.verificationToken.deleteMany({
      where: { identifier: user.email },
    }),
    prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: hashToken(token),
        expires,
      },
    }),
  ]);

  return { email: user.email, name: user.name, token };
}

export async function changePassword(
  userId: string,
  input: ChangePasswordInput,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      status: true,
    },
  });

  if (!user || !user.passwordHash || user.status !== "ACTIVE") {
    throw new AppError(401, "UNAUTHORIZED", "Authentication is required.");
  }

  const currentPasswordMatches = await compare(
    input.currentPassword,
    user.passwordHash,
  );

  if (!currentPasswordMatches) {
    throw new AppError(
      400,
      "CURRENT_PASSWORD_INCORRECT",
      "Current password is incorrect.",
      { fieldErrors: { currentPassword: ["Current password is incorrect."] } },
    );
  }

  if (await compare(input.password, user.passwordHash)) {
    throw new AppError(
      422,
      "PASSWORD_REUSED",
      "New password must be different from the current password.",
      { fieldErrors: { password: ["Choose a different password."] } },
    );
  }

  const passwordHash = await hash(input.password, BCRYPT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
        sessionVersion: { increment: 1 },
      },
    }),
    prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
  ]);

  return { email: user.email, name: user.name };
}

export async function updateProfile(
  userId: string,
  currentSessionVersion: number,
  input: UpdateProfileInput,
) {
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!currentUser || currentUser.status !== "ACTIVE") {
    throw new AppError(401, "UNAUTHORIZED", "Authentication is required.");
  }

  const emailChanged = currentUser.email !== input.email;
  const token = emailChanged ? generateSecureToken() : null;

  try {
    return await prisma.$transaction(
      async (transaction) => {
        const updated = await transaction.user.updateMany({
          where: {
            id: userId,
            sessionVersion: currentSessionVersion,
          },
          data: {
            name: input.name,
            email: input.email,
            ...(emailChanged
              ? {
                  emailVerified: null,
                  sessionVersion: { increment: 1 },
                }
              : {}),
          },
        });

        if (updated.count !== 1) {
          throw new AppError(
            409,
            "PROFILE_CHANGED",
            "Your profile changed in another session. Refresh and try again.",
          );
        }

        if (emailChanged && token) {
          await transaction.verificationToken.deleteMany({
            where: {
              identifier: { in: [currentUser.email, input.email] },
            },
          });
          await transaction.verificationToken.create({
            data: {
              identifier: input.email,
              token: hashToken(token),
              expires: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
            },
          });
        }

        const user = await transaction.user.findUniqueOrThrow({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            role: true,
            status: true,
            sessionVersion: true,
          },
        });

        return {
          user,
          emailChanged,
          delivery:
            emailChanged && token
              ? { email: user.email, name: user.name, token }
              : null,
        };
      },
      { isolationLevel: "Serializable" },
    );
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new AppError(
        409,
        "EMAIL_ALREADY_REGISTERED",
        "An account with this email already exists.",
        { fieldErrors: { email: ["This email is already in use."] } },
      );
    }
    throw error;
  }
}

import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AppError } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";

export const getCurrentUser = cache(async () => {
  const session = await auth();

  if (
    !session?.user?.id ||
    !session.sessionExpiresAt ||
    session.sessionExpiresAt <= Date.now()
  ) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      role: true,
      status: true,
      sessionVersion: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (
    !user ||
    user.status !== "ACTIVE" ||
    !user.emailVerified ||
    user.sessionVersion !== session.user.sessionVersion
  ) {
    return null;
  }

  return user;
});

export async function requireCurrentUser(callbackUrl = "/") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  return user;
}

export async function requireApiUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication is required.");
  }

  return user;
}

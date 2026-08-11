import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { AppToaster } from "@/components/app-toaster";
import { AUTH_SESSION_COOKIE_NAME } from "@/lib/auth/constants";

export default async function AuthenticationLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();

  // Most visits to an authentication page have no session. Avoid loading the
  // database-backed auth stack unless a session cookie could be valid.
  if (cookieStore.has(AUTH_SESSION_COOKIE_NAME)) {
    const { getCurrentUser } = await import("@/lib/auth/session");
    const user = await getCurrentUser();

    if (user) {
      redirect("/");
    }
  }

  return (
    <>
      <AuthShell>{children}</AuthShell>
      <AppToaster />
    </>
  );
}

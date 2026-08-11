import type { ReactNode } from "react";

import { AccountShell } from "@/components/auth/account-shell";
import { requireCurrentUser } from "@/lib/auth/session";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireCurrentUser("/");

  return <AccountShell user={user}>{children}</AccountShell>;
}

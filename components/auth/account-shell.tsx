import type { ReactNode } from "react";

import { WorkspaceHeader } from "@/components/workspace-header";

type ShellUser = {
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

export function AccountShell({
  user,
  children,
}: {
  user: ShellUser;
  children: ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] text-foreground">
      <WorkspaceHeader user={user} />
      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        {children}
      </main>
    </div>
  );
}

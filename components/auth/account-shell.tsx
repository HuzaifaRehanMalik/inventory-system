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
    <div className="min-h-screen bg-background text-foreground">
      <WorkspaceHeader user={user} />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {children}
      </main>
    </div>
  );
}

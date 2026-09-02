import type { ReactNode } from "react";
import Link from "next/link";

import { WorkspaceHeader } from "@/components/workspace-header";

export default function GuideLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#guide-content"
        className="fixed left-4 top-3 z-50 -translate-y-24 rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition focus:translate-y-0"
      >
        Skip to user guide
      </a>
      <WorkspaceHeader />
      {children}
      <footer className="border-t border-zinc-800 bg-zinc-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>Stockeyfy User Guide — simple help for everyday inventory work.</p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Guide footer">
            <Link className="font-medium text-zinc-400 hover:text-white" href="/guide">
              User Guide
            </Link>
            <Link className="font-medium text-zinc-400 hover:text-white" href="/login">
              Sign in
            </Link>
            <Link className="font-medium text-emerald-400 hover:text-emerald-300" href="/register">
              Create account
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

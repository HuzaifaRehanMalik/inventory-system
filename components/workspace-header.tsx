import Link from "next/link";
import { Boxes, ChevronRight } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { PrimaryNavigation } from "@/components/primary-navigation";
import { initials } from "@/lib/utils";

type WorkspaceUser = {
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

export function WorkspaceHeader({ user }: { user?: WorkspaceUser }) {
  return (
    <header className="relative sticky top-0 z-30 border-b border-brand-border/80 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-slate-950"
          aria-label="Stockeyfy Inventory Management System home"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-white shadow-lg shadow-blue-950/30 transition-transform duration-200 group-hover:-translate-y-0.5">
            <Boxes className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold tracking-tight text-white sm:text-base">
              Stockeyfy
            </span>
            <span className="block truncate text-[11px] font-medium text-slate-400 sm:text-xs">
              Inventory Management System
            </span>
          </span>
        </Link>

        {user ? (
          <>
            <PrimaryNavigation />
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href="/profile"
                className="group flex items-center gap-2 rounded-xl border border-transparent p-1.5 transition hover:border-slate-700 hover:bg-slate-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:gap-3 sm:py-1.5 sm:pl-2 sm:pr-3"
                aria-label={`Open ${user.name}'s profile`}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-blue-400/20 bg-blue-500/15 text-xs font-bold text-blue-300">
                  {initials(user.name)}
                </span>
                <span className="hidden min-w-0 text-left xl:block">
                  <span className="block max-w-40 truncate text-xs font-semibold text-white">
                    {user.name}
                  </span>
                  <span className="block text-[11px] text-slate-400">
                    {user.role === "ADMIN" ? "Administrator" : "Team member"}
                  </span>
                </span>
                <ChevronRight
                  className="hidden size-3.5 text-slate-500 transition-transform group-hover:translate-x-0.5 xl:block"
                  aria-hidden="true"
                />
              </Link>
              <LogoutButton compact />
            </div>
          </>
        ) : (
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:px-4"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex h-10 items-center rounded-xl bg-primary px-3.5 text-sm font-bold text-white shadow-lg shadow-blue-950/25 transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30 sm:px-4"
            >
              Get started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

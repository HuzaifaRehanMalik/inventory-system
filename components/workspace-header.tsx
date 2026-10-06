import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import {
  PrimaryNavigation,
  type NavigationUser,
} from "@/components/primary-navigation";
import { getCurrentUser } from "@/lib/auth/session";

export async function WorkspaceHeader({
  user: providedUser,
}: {
  user?: NavigationUser | null;
}) {
  // Public routes such as /guide do not have a protected parent layout. Resolve
  // their existing Auth.js session here so every WorkspaceHeader is auth-aware.
  const user =
    providedUser === undefined ? await getCurrentUser() : providedUser;
  const navigationUser = user
    ? { name: user.name, email: user.email, role: user.role }
    : null;

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="relative mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href={user ? "/" : "/guide"}
          className="group flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-4 focus-visible:ring-offset-zinc-950"
          aria-label={
            user
              ? "Stockeyfy Inventory Management System dashboard"
              : "Stockeyfy public guide home"
          }
        >
          <BrandLogo tagline="Inventory workspace" />
        </Link>

        <PrimaryNavigation user={navigationUser} />
      </div>
    </header>
  );
}

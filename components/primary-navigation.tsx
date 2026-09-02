"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import {
  getNavigationItems,
  type NavigationItem,
} from "@/components/navigation-items";
import { initials } from "@/lib/utils";

export type NavigationUser = {
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

export function PrimaryNavigation({ user }: { user: NavigationUser | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navigationItems = getNavigationItems(Boolean(user));

  return (
    <>
      <nav
        className="order-3 hidden w-full items-center justify-center gap-1 border-t border-zinc-800 pt-2 md:flex xl:order-none xl:w-auto xl:flex-1 xl:border-t-0 xl:px-3 xl:pt-0"
        aria-label="Main navigation"
      >
        {navigationItems.map((item) => (
          <NavigationLink key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>

      {user ? (
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <UserProfileLink user={user} />
          <LogoutButton compact />
        </div>
      ) : null}

      <button
        type="button"
        className="ml-auto grid size-10 shrink-0 place-items-center rounded-md border border-zinc-700 bg-zinc-800 text-zinc-400 transition hover:border-zinc-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 md:hidden"
        aria-expanded={open}
        aria-controls="mobile-primary-navigation"
        aria-label={open ? "Close navigation" : "Open navigation"}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? (
          <X className="size-5" aria-hidden="true" />
        ) : (
          <Menu className="size-5" aria-hidden="true" />
        )}
      </button>

      <div
        id="mobile-primary-navigation"
        className={`absolute inset-x-0 top-full border-b border-zinc-800 bg-zinc-950 px-4 py-3 md:hidden ${
          open ? "block" : "hidden"
        }`}
      >
        <nav
          className={`mx-auto grid max-w-7xl gap-1 ${
            user ? "grid-cols-2" : "grid-cols-1"
          }`}
          aria-label="Mobile main navigation"
        >
          {navigationItems.map((item) => (
            <NavigationLink
              key={item.href}
              item={item}
              pathname={pathname}
              mobile
              onNavigate={() => setOpen(false)}
            />
          ))}
        </nav>

        {user ? (
          <div className="mx-auto mt-3 flex max-w-7xl items-center gap-3 border-t border-zinc-800 pt-3">
            <UserProfileLink user={user} mobile onNavigate={() => setOpen(false)} />
            <LogoutButton />
          </div>
        ) : null}
      </div>
    </>
  );
}

function NavigationLink({
  item,
  pathname,
  mobile = false,
  onNavigate,
}: {
  item: NavigationItem;
  pathname: string;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const active =
    item.href === "/"
      ? pathname === "/" || matchesAlias(pathname, item.aliases)
      : pathname === item.href ||
        pathname.startsWith(`${item.href}/`) ||
        matchesAlias(pathname, item.aliases);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={navigationLinkClassName(item, active, mobile)}
    >
      {item.label}
    </Link>
  );
}

function matchesAlias(pathname: string, aliases?: string[]) {
  return aliases?.some(
    (alias) => pathname === alias || pathname.startsWith(`${alias}/`),
  );
}

function navigationLinkClassName(
  item: NavigationItem,
  active: boolean | undefined,
  mobile: boolean,
) {
  const spacing = mobile ? "px-3 py-2.5" : "px-3 py-2";

  if (item.emphasis === "primary") {
    return `rounded-md bg-primary text-sm font-medium text-white transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${spacing}`;
  }

  return `rounded-md text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${spacing} ${
    active
      ? "bg-zinc-800 text-white"
      : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
  }`;
}

function UserProfileLink({
  user,
  mobile = false,
  onNavigate,
}: {
  user: NavigationUser;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href="/profile"
      onClick={onNavigate}
      className={`group flex min-w-0 items-center gap-3 rounded-md border border-transparent p-1.5 transition hover:border-zinc-700 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
        mobile ? "mr-auto flex-1" : "sm:py-1.5 sm:pl-2 sm:pr-3"
      }`}
      aria-label={`Open ${user.name}'s profile`}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-xs font-bold text-emerald-400">
        {initials(user.name)}
      </span>
      <span className={`min-w-0 text-left ${mobile ? "block" : "hidden xl:block"}`}>
        <span className="block max-w-40 truncate text-xs font-semibold text-white">
          {user.name}
        </span>
        <span className="block text-[11px] text-zinc-400">
          {user.role === "ADMIN" ? "Administrator" : "Team member"}
        </span>
      </span>
      <ChevronRight
        className={`size-3.5 text-zinc-500 transition-transform ${
          mobile ? "ml-auto" : "hidden xl:block"
        }`}
        aria-hidden="true"
      />
    </Link>
  );
}

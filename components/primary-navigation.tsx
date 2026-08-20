"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

type NavigationItem = {
  label: string;
  href: string;
  aliases?: string[];
};

const navigationItems: NavigationItem[] = [
  { label: "Dashboard", href: "/", aliases: ["/home", "/dashboard"] },
  { label: "Inventory", href: "/inventory" },
  { label: "New Item", href: "/products/new" },
  { label: "Add Stock", href: "/stock-in" },
  { label: "Checkout / Sales", href: "/stock-out" },
  { label: "Settings", href: "/settings" },
];

export function PrimaryNavigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav
        className="order-3 hidden w-full items-center justify-center gap-1 border-t border-slate-800 pt-2 md:flex xl:order-none xl:w-auto xl:flex-1 xl:border-t-0 xl:px-3 xl:pt-0"
        aria-label="Main navigation"
      >
        {navigationItems.map((item) => (
          <NavigationLink key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>

      <button
        type="button"
        className="ml-auto grid size-10 shrink-0 place-items-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 transition hover:border-blue-400/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden"
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
        className={`absolute inset-x-0 top-full border-b border-brand-border bg-slate-950/98 px-4 py-3 shadow-xl shadow-slate-950/30 backdrop-blur-xl md:hidden ${
          open ? "block" : "hidden"
        }`}
      >
        <nav
          className="mx-auto grid max-w-7xl grid-cols-2 gap-1"
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
      ? pathname === "/" || item.aliases?.includes(pathname)
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`rounded-lg text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        mobile ? "px-3 py-2.5" : "px-3 py-2"
      } ${
        active
          ? "bg-blue-500/20 text-blue-100 shadow-inner shadow-blue-400/5 ring-1 ring-blue-400/20"
          : "text-slate-300 hover:bg-slate-800 hover:text-white"
      }`}
    >
      {item.label}
    </Link>
  );
}

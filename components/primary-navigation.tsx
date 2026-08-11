"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

const navigationItems = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Inventory", href: "/inventory" },
  { label: "Stock In", href: "/stock-in" },
  { label: "Stock Out", href: "/stock-out" },
  { label: "Sales & Orders", href: "/sales" },
  { label: "Purchases", href: "/purchases" },
  { label: "Suppliers", href: "/suppliers" },
  { label: "Customers", href: "/customers" },
  { label: "Settings", href: "/settings" },
];

export function PrimaryNavigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav
        className="hidden flex-1 items-center justify-center gap-0.5 px-4 2xl:flex"
        aria-label="Main navigation"
      >
        {navigationItems.map((item) => (
          <NavigationLink key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>

      <button
        type="button"
        className="ml-auto grid size-10 shrink-0 place-items-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 transition hover:border-blue-400/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent 2xl:hidden"
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
        className={`absolute inset-x-0 top-full border-b border-brand-border bg-slate-950/98 px-4 py-3 shadow-xl shadow-slate-950/30 backdrop-blur-xl 2xl:hidden ${
          open ? "block" : "hidden"
        }`}
      >
        <nav
          className="mx-auto grid max-w-7xl grid-cols-2 gap-1 sm:grid-cols-4"
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
  item: (typeof navigationItems)[number];
  pathname: string;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const active =
    item.href === "/"
      ? pathname === "/" || pathname === "/home" || pathname === "/dashboard"
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`rounded-lg text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        mobile ? "px-3 py-2.5" : "px-2.5 py-2"
      } ${
        active
          ? "bg-blue-500/15 text-blue-200"
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
      }`}
    >
      {item.label}
    </Link>
  );
}

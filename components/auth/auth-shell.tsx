import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ChartNoAxesCombined,
} from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-[100dvh] overflow-hidden px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[minmax(400px,0.9fr)_1.1fr] lg:p-3">
      <aside className="relative hidden overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 p-10 text-zinc-50 lg:flex lg:flex-col lg:justify-between lg:gap-8 xl:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        />

        <div className="relative flex items-center justify-between gap-4">
          <Link
            href="/"
            className="group rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label="Stockeyfy home"
          >
            <BrandLogo tagline="Inventory workspace" />
          </Link>
          <Link
            href="/guide"
            className="rounded-md border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-medium text-zinc-300 backdrop-blur transition hover:border-zinc-700 hover:text-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            User Guide
          </Link>
        </div>

        <div className="relative max-w-lg">
          <h2 className="font-serif text-5xl font-normal leading-[1.08] xl:text-6xl">
            Keep every part of your inventory{" "}
            <em className="text-emerald-300">moving.</em>
          </h2>
          <p className="mt-6 max-w-[40ch] text-base leading-relaxed text-zinc-400">
            Organize products, track stock, and understand your business from
            one focused workspace.
          </p>

          <ul className="stagger mt-12 grid gap-px overflow-hidden rounded-lg border border-zinc-800 bg-zinc-800">
            <FeatureRow
              icon={<ArrowDownToLine className="size-4" aria-hidden="true" />}
              title="Stock in"
              text="Receive deliveries against suppliers"
            />
            <FeatureRow
              icon={<ArrowUpFromLine className="size-4" aria-hidden="true" />}
              title="Stock out"
              text="Record sales with live quantity checks"
            />
            <FeatureRow
              icon={<ChartNoAxesCombined className="size-4" aria-hidden="true" />}
              title="Insights"
              text="See what sells and what runs low"
            />
          </ul>
        </div>

        <p className="relative text-xs text-zinc-500">
          Secure accounts with verified email sign-in.
        </p>
      </aside>

      <div className="relative flex min-h-[calc(100dvh-3rem)] items-center justify-center lg:min-h-0">
        <div className="w-full max-w-[440px] py-8">
          <div className="mb-8 flex items-center justify-center gap-4 lg:hidden">
            <Link
              href="/"
              className="group rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              aria-label="Stockeyfy home"
            >
              <BrandLogo />
            </Link>
            <span className="h-5 w-px bg-zinc-700" aria-hidden="true" />
            <Link
              href="/guide"
              className="rounded-md px-2 py-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              User Guide
            </Link>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}

function FeatureRow({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <li className="group flex items-center gap-4 bg-zinc-900 px-5 py-4 transition-colors duration-300 hover:bg-surface-muted">
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-emerald-100 text-emerald-300 transition-transform duration-300 group-hover:scale-110">
        {icon}
      </span>
      <div>
        <p className="text-sm font-medium text-zinc-50">{title}</p>
        <p className="text-sm text-zinc-500">{text}</p>
      </div>
    </li>
  );
}

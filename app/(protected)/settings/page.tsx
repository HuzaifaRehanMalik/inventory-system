import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CircleUserRound,
  KeyRound,
  ShieldCheck,
} from "lucide-react";

import { AppToaster } from "@/components/app-toaster";
import { PageHeading } from "@/components/inventory/page-heading";
import { SettingsForm } from "@/components/inventory/settings-form";
import { requireCurrentUser } from "@/lib/auth/session";
import { getBusinessSettings } from "@/lib/inventory/queries";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireCurrentUser("/settings");
  const settings = await getBusinessSettings(user.id);

  return (
    <div className="animate-enter mx-auto max-w-5xl">
      <PageHeading
        eyebrow="Workspace"
        title="Settings"
        description="Configure business and inventory defaults while keeping your existing account security controls in one place."
      />

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 sm:p-5">
          <SettingsForm settings={settings} />
        </section>

        <aside className="space-y-6">
          <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-xs font-medium text-zinc-500">
              Account
            </p>
            <div className="mt-4 flex items-start gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-md bg-zinc-800 text-zinc-300">
                <CircleUserRound className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-bold text-white">{user.name}</p>
                <p className="mt-1 truncate text-sm text-zinc-400">{user.email}</p>
              </div>
            </div>
            <dl className="mt-5 space-y-3 border-t border-zinc-800 pt-5 text-sm">
              <StatusRow label="Role" value={user.role === "USER" ? "Standard user" : "Administrator"} />
              <StatusRow label="Account" value={user.status === "ACTIVE" ? "Active" : user.status} />
              <StatusRow label="Email" value={user.emailVerified ? "Verified" : "Unverified"} />
            </dl>
            <Link
              href="/profile"
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition"
            >
              Manage profile <ArrowRight className="size-4" />
            </Link>
          </section>

          <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-xs font-medium text-zinc-500">
              Security
            </p>
            <div className="mt-4 flex gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-md bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <p className="font-bold text-white">Authenticated</p>
                <p className="mt-1 text-sm leading-5 text-zinc-400">
                  Your active server-verified session protects this workspace.
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-start gap-3 border-t border-zinc-800 pt-5">
              <BadgeCheck className="mt-0.5 size-4 shrink-0 text-emerald-400" />
              <p className="text-sm leading-5 text-zinc-400">
                Inventory changes require your current account and are scoped to its records.
              </p>
            </div>
            <Link
              href="/change-password"
              className="mt-5 inline-flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
            >
              <KeyRound className="size-4" /> Change password
            </Link>
          </section>
        </aside>
      </div>
      <AppToaster />
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="font-medium text-zinc-200">{value}</dd>
    </div>
  );
}

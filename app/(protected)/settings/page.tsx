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
        <section className="rounded-2xl border border-slate-700 bg-slate-800/80 p-5 shadow-xl shadow-slate-950/15 sm:p-7">
          <SettingsForm settings={settings} />
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-700 bg-slate-800/80 p-5 shadow-xl shadow-slate-950/15">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">
              Account
            </p>
            <div className="mt-4 flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-300">
                <CircleUserRound className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-bold text-white">{user.name}</p>
                <p className="mt-1 truncate text-sm text-slate-400">{user.email}</p>
              </div>
            </div>
            <dl className="mt-5 space-y-3 border-t border-slate-700 pt-5 text-sm">
              <StatusRow label="Role" value={user.role === "USER" ? "Standard user" : "Administrator"} />
              <StatusRow label="Account" value={user.status === "ACTIVE" ? "Active" : user.status} />
              <StatusRow label="Email" value={user.emailVerified ? "Verified" : "Unverified"} />
            </dl>
            <Link
              href="/profile"
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-300 transition hover:text-blue-200"
            >
              Manage profile <ArrowRight className="size-4" />
            </Link>
          </section>

          <section className="rounded-2xl border border-slate-700 bg-slate-800/80 p-5 shadow-xl shadow-slate-950/15">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">
              Security
            </p>
            <div className="mt-4 flex gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-300">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <p className="font-bold text-white">Authenticated</p>
                <p className="mt-1 text-sm leading-5 text-slate-400">
                  Your active server-verified session protects this workspace.
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-start gap-3 border-t border-slate-700 pt-5">
              <BadgeCheck className="mt-0.5 size-4 shrink-0 text-blue-300" />
              <p className="text-sm leading-5 text-slate-400">
                Inventory changes require your current account and are scoped to its records.
              </p>
            </div>
            <Link
              href="/change-password"
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-3.5 py-2.5 text-sm font-bold text-slate-200 transition hover:border-blue-400/40 hover:text-white"
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
      <dt className="text-slate-400">{label}</dt>
      <dd className="font-semibold text-slate-200">{value}</dd>
    </div>
  );
}

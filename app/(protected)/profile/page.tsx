import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { BadgeCheck, CalendarDays, KeyRound, ShieldCheck } from "lucide-react";

import { AppToaster } from "@/components/app-toaster";
import { ProfileForm } from "@/components/auth/profile-form";
import { requireCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireCurrentUser("/profile");

  return (
    <>
      <div className="animate-enter grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-xl shadow-slate-950/20 sm:p-8">
          <p className="text-sm font-semibold text-blue-400">Identity</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
            Profile details
          </h1>
          <p className="mt-2 mb-7 text-sm leading-6 text-slate-300">
            Keep your account information accurate and current.
          </p>
          <ProfileForm name={user.name} email={user.email} />
        </section>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-xl shadow-slate-950/20">
            <h2 className="font-bold text-white">Account status</h2>
            <dl className="mt-5 space-y-4">
            <StatusRow
              icon={<ShieldCheck className="size-4" />}
              label="Status"
              value={user.status === "ACTIVE" ? "Active" : user.status}
            />
            <StatusRow
              icon={<BadgeCheck className="size-4" />}
              label="Email"
              value={user.emailVerified ? "Verified" : "Unverified"}
            />
            <StatusRow
              icon={<KeyRound className="size-4" />}
              label="Role"
              value={user.role === "USER" ? "Standard user" : "Administrator"}
            />
            <StatusRow
              icon={<CalendarDays className="size-4" />}
              label="Member since"
              value={new Intl.DateTimeFormat("en", {
                month: "short",
                year: "numeric",
              }).format(user.createdAt)}
            />
            </dl>
          </section>

          <Link
            href="/change-password"
            className="flex items-center justify-between rounded-2xl border border-blue-400/20 bg-blue-500/10 p-5 text-sm font-bold text-blue-200 transition hover:-translate-y-0.5 hover:border-blue-400/40 hover:bg-blue-500/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20"
          >
            Change password
            <KeyRound className="size-4" />
          </Link>
        </aside>
      </div>
      <AppToaster />
    </>
  );
}

function StatusRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-8 place-items-center rounded-lg border border-slate-700 bg-slate-900/70 text-blue-300">
        {icon}
      </span>
      <div>
        <dt className="text-xs text-slate-400">{label}</dt>
        <dd className="text-sm font-semibold text-white">
          {value}
        </dd>
      </div>
    </div>
  );
}

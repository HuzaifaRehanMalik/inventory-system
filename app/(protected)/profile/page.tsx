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
        <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 sm:p-6">
          <p className="text-xs font-medium text-zinc-500">Identity</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-white">
            Profile details
          </h1>
          <p className="mt-2 text-sm text-zinc-400 mb-6">
            Keep your account information accurate and current.
          </p>
          <ProfileForm name={user.name} email={user.email} />
        </section>

        <aside className="space-y-5">
          <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
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
            className="flex items-center justify-between rounded-md border border-zinc-700 bg-zinc-800 p-3 text-sm font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500/50"
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
      <span className="grid size-8 place-items-center rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/50">
        {icon}
      </span>
      <div>
        <dt className="text-xs text-zinc-500">{label}</dt>
        <dd className="text-sm font-medium text-zinc-200">
          {value}
        </dd>
      </div>
    </div>
  );
}

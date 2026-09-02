import type { ReactNode } from "react";
import Link from "next/link";
import { Boxes, CheckCircle2, LockKeyhole, Sparkles } from "lucide-react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[minmax(360px,0.82fr)_1.18fr] lg:p-0">
      <aside className="relative hidden min-h-screen overflow-hidden border-r border-zinc-800 bg-zinc-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="relative flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 text-lg font-bold">
            <span className="grid size-8 place-items-center rounded-md bg-primary text-white">
              <Boxes className="size-5" aria-hidden="true" />
            </span>
            Stockeyfy
          </Link>
          <Link
            href="/guide"
            className="rounded-md border border-zinc-700 px-3 py-2 text-xs font-bold text-zinc-400 transition hover:border-zinc-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            User Guide
          </Link>
        </div>

        <div className="relative max-w-md">
          <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-emerald-400">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Secure access workspace
          </div>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            Your operations start with a trusted identity.
          </h2>
          <p className="mt-5 max-w-sm text-base leading-7 text-zinc-400">
            Purpose-built account security with verified identities, protected
            sessions, and complete recovery flows.
          </p>

          <div className="mt-10 grid gap-4">
            <SecurityPoint
              icon={<LockKeyhole className="size-4" />}
              text="Encrypted, HTTP-only sessions"
            />
            <SecurityPoint
              icon={<CheckCircle2 className="size-4" />}
              text="Verified email access"
            />
          </div>
        </div>

        <div aria-hidden="true" />
      </aside>

      <div className="relative flex min-h-[calc(100vh-3rem)] items-center justify-center lg:min-h-screen">
        <div className="w-full max-w-[470px] py-8">
          <div className="mb-7 flex items-center justify-center gap-4 lg:hidden">
            <Link
              href="/"
              className="flex items-center gap-2 text-base font-bold text-white"
            >
              <span className="grid size-8 place-items-center rounded-md bg-primary text-white">
                <Boxes className="size-4.5" aria-hidden="true" />
              </span>
              Stockeyfy
            </Link>
            <span className="h-5 w-px bg-zinc-700" aria-hidden="true" />
            <Link
              href="/guide"
              className="rounded-md px-2 py-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
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

function SecurityPoint({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm font-medium text-zinc-400">
      <span className="grid size-8 place-items-center rounded-md border border-zinc-800 bg-zinc-900 text-emerald-400">
        {icon}
      </span>
      {text}
    </div>
  );
}

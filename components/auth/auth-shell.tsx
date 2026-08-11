import type { ReactNode } from "react";
import Link from "next/link";
import { Boxes, CheckCircle2, LockKeyhole, Sparkles } from "lucide-react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="auth-grid relative min-h-screen overflow-hidden bg-[#0f172a] px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[minmax(360px,0.82fr)_1.18fr] lg:p-0">
      <div className="pointer-events-none absolute -left-32 top-1/3 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />
      <aside className="relative hidden min-h-screen overflow-hidden border-r border-slate-700 bg-[#020617] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-20 h-80 w-80 rounded-full border border-blue-400/10 bg-blue-500/10" />
        <Link href="/" className="relative flex items-center gap-3 text-lg font-bold">
          <span className="grid size-10 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-950/40">
            <Boxes className="size-5" aria-hidden="true" />
          </span>
          Stockeyfy
        </Link>

        <div className="relative max-w-md">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-200">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Secure access workspace
          </div>
          <h2 className="text-4xl font-semibold leading-tight tracking-[-0.04em]">
            Your operations start with a trusted identity.
          </h2>
          <p className="mt-5 max-w-sm text-base leading-7 text-slate-300">
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
          <Link
            href="/"
            className="mb-7 flex items-center justify-center gap-2 text-base font-bold text-white lg:hidden"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-950/30">
              <Boxes className="size-4.5" aria-hidden="true" />
            </span>
            Stockeyfy
          </Link>
          {children}
        </div>
      </div>
    </main>
  );
}

function SecurityPoint({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
      <span className="grid size-8 place-items-center rounded-lg border border-slate-700 bg-slate-800 text-blue-300">
        {icon}
      </span>
      {text}
    </div>
  );
}

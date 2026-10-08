"use client";

import { useState } from "react";
import { LogOut, LoaderCircle } from "lucide-react";

import { apiRequest } from "@/lib/client-api";
import { cn } from "@/lib/utils";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function logout() {
    setLoading(true);
    setError(false);
    try {
      await apiRequest<null>("/api/auth/logout");
      // Full navigation so no cached authenticated pages survive sign-out.
      window.location.replace("/login?signedOut=1");
    } catch {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={logout}
        disabled={loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 text-sm font-medium text-zinc-300 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50",
          compact ? "size-10" : "h-9 px-3",
        )}
        aria-label={compact ? "Sign out" : undefined}
        aria-describedby={error ? "logout-error" : undefined}
      >
        {loading ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <LogOut className="size-4" />
        )}
        {compact ? null : "Sign out"}
      </button>
      {error ? (
        <p
          id="logout-error"
          role="alert"
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-md border border-red-500/20 bg-zinc-950 p-3 text-xs font-medium leading-5 text-red-400 shadow-md"
        >
          Could not sign out. Please try again.
        </p>
      ) : null}
    </div>
  );
}

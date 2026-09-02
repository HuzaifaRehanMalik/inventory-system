"use client";

import { useMemo, useState, type FormEvent } from "react";
import { ArrowRight, Search, X } from "lucide-react";

export type GuideSearchEntry = {
  id: string;
  title: string;
  description: string;
  keywords: string;
};

export function GuideSearch({ entries }: { entries: GuideSearchEntry[] }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!normalizedQuery) return [];

    return entries.filter((entry) =>
      `${entry.title} ${entry.description} ${entry.keywords}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [entries, normalizedQuery]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const firstResult = results[0];

    if (firstResult) {
      window.location.hash = firstResult.id;
      setQuery("");
    }
  }

  return (
    <form onSubmit={onSubmit} role="search" className="relative mt-7 max-w-2xl">
      <label htmlFor="guide-search" className="sr-only">
        Search the user guide
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-3 size-4 text-zinc-500"
        aria-hidden="true"
      />
      <input
        id="guide-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search products, stock, settings, password..."
        autoComplete="off"
        aria-describedby="guide-search-hint"
        aria-controls="guide-search-results"
        className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 pl-9 pr-10 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
      />
      {query ? (
        <button
          type="button"
          onClick={() => setQuery("")}
          aria-label="Clear guide search"
          className="absolute right-2.5 top-2 grid size-6 place-items-center rounded text-zinc-400 transition hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      ) : null}
      <p id="guide-search-hint" className="mt-2 text-xs text-zinc-500">
        Search by task, then choose the matching section.
      </p>

      {normalizedQuery ? (
        <div
          id="guide-search-results"
          className="absolute inset-x-0 top-[3rem] z-20 overflow-hidden rounded-md border border-zinc-700 bg-zinc-900 shadow-xl"
        >
          <p className="border-b border-zinc-800 px-4 py-2.5 text-xs font-medium text-zinc-400" aria-live="polite">
            {results.length
              ? `${results.length} matching ${results.length === 1 ? "section" : "sections"}`
              : "No matching sections"}
          </p>
          {results.length ? (
            <ul className="max-h-72 overflow-y-auto p-1.5">
              {results.map((entry) => (
                <li key={entry.id}>
                  <a
                    href={`#${entry.id}`}
                    onClick={() => setQuery("")}
                    className="group flex items-center gap-3 rounded-md px-3 py-2.5 transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-white">
                        {entry.title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-zinc-400">
                        {entry.description}
                      </span>
                    </span>
                    <ArrowRight
                      className="size-4 shrink-0 text-zinc-500 transition group-hover:translate-x-0.5 group-hover:text-emerald-400"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-4 text-sm leading-6 text-zinc-400">
              Try a simple term such as “inventory”, “sale”, “email”, or
              “settings”.
            </p>
          )}
        </div>
      ) : null}
    </form>
  );
}

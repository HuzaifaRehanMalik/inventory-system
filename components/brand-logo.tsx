import { cn } from "@/lib/utils";

// Single source of truth for the Stockeyfy logo: a charcoal tile with a white
// stacked-boxes glyph. Plain SVG (no client icon component) so the same mark
// also renders inside next/og images: app/icon.tsx, app/apple-icon.tsx and
// app/opengraph-image.tsx.
export const BRAND_MARK_BACKGROUND = "#111111";
export const BRAND_MARK_FOREGROUND = "#ffffff";

// Glyph geometry from Lucide "boxes" (ISC license), 24x24 viewBox.
const glyphPaths = [
  "M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z",
  "m7 16.5-4.74-2.85",
  "m7 16.5 5-3",
  "M7 16.5v5.17",
  "M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z",
  "m17 16.5-5-3",
  "m17 16.5 4.74-2.85",
  "M17 16.5v5.17",
  "M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z",
  "M12 8 7.26 5.15",
  "m12 8 4.74-2.85",
  "M12 13.5V8",
];

export function BrandGlyph({
  size,
  color = BRAND_MARK_FOREGROUND,
  className,
}: {
  size: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {glyphPaths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

const markSizes = {
  sm: { tile: "size-8", glyph: 18, word: "text-lg" },
  md: { tile: "size-9", glyph: 20, word: "text-lg" },
  lg: { tile: "size-10", glyph: 22, word: "text-xl" },
} as const;

type BrandSize = keyof typeof markSizes;

export function BrandMark({
  size = "md",
  className,
}: {
  size?: BrandSize;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-md transition-transform duration-300 ease-out group-hover:-rotate-6",
        markSizes[size].tile,
        className,
      )}
      style={{ background: BRAND_MARK_BACKGROUND }}
    >
      <BrandGlyph size={markSizes[size].glyph} />
    </span>
  );
}

export function BrandLogo({
  size = "md",
  tagline,
  className,
}: {
  size?: BrandSize;
  tagline?: string;
  className?: string;
}) {
  return (
    <span className={cn("flex min-w-0 items-center gap-3", className)}>
      <BrandMark size={size} />
      <span className="min-w-0">
        <span
          className={cn(
            "block truncate font-serif leading-none text-zinc-50",
            markSizes[size].word,
          )}
        >
          Stockeyfy
        </span>
        {tagline ? (
          <span className="mt-1 block truncate text-[11px] font-medium leading-none text-zinc-500">
            {tagline}
          </span>
        ) : null}
      </span>
    </span>
  );
}

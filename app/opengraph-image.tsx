import { ImageResponse } from "next/og";

import {
  BRAND_MARK_BACKGROUND,
  BrandGlyph,
} from "@/components/brand-logo";
import { AUTHOR_NAME, COMPANY_NAME } from "@/lib/brand";

export const alt = "Stockeyfy Inventory Management System";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Loads the Newsreader display serif so the wordmark matches <BrandLogo />.
// Falls back to the default font if Google Fonts is unreachable at build time.
async function loadSerif(text: string) {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@72,400&text=${encodeURIComponent(text)}`,
    ).then((response) => response.text());
    const url = css.match(/src: url\((.+?)\) format/)?.[1];
    if (!url) return null;
    return await fetch(url).then((response) => response.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function OpenGraphImage() {
  const headline = "Keep every part of your inventory moving.";
  const credit = `A product of ${COMPANY_NAME}  /  Made by ${AUTHOR_NAME}`;
  const serif = await loadSerif(
    `Stockeyfy${headline}Inventory management system${credit}`,
  );

  return new ImageResponse(
    (
      <div
        style={{
          background: "#f7f6f3",
          color: "#111111",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          padding: 80,
          width: "100%",
        }}
      >
        <div style={{ alignItems: "center", display: "flex", gap: 24 }}>
          <div
            style={{
              alignItems: "center",
              background: BRAND_MARK_BACKGROUND,
              borderRadius: 18,
              display: "flex",
              height: 88,
              justifyContent: "center",
              width: 88,
            }}
          >
            <BrandGlyph size={52} />
          </div>
          <div style={{ fontFamily: "Newsreader", fontSize: 56 }}>Stockeyfy</div>
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "Newsreader",
            fontSize: 84,
            letterSpacing: "-0.025em",
            lineHeight: 1.08,
            maxWidth: 940,
          }}
        >
          {headline}
        </div>
        <div
          style={{
            alignItems: "center",
            display: "flex",
            fontSize: 26,
            justifyContent: "space-between",
          }}
        >
          <div style={{ color: "#2f6b3a", display: "flex" }}>
            Inventory management system
          </div>
          <div style={{ color: "#787774", display: "flex" }}>
            {credit}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: serif
        ? [{ name: "Newsreader", data: serif, style: "normal", weight: 400 }]
        : undefined,
    },
  );
}

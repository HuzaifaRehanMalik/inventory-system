import { ImageResponse } from "next/og";

import {
  BRAND_MARK_BACKGROUND,
  BrandGlyph,
} from "@/components/brand-logo";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

// Same mark as <BrandMark />: charcoal tile with the white Boxes glyph.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: BRAND_MARK_BACKGROUND,
          borderRadius: 40,
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <BrandGlyph size={110} />
      </div>
    ),
    size,
  );
}

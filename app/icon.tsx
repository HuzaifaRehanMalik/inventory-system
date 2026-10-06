import { ImageResponse } from "next/og";

import {
  BRAND_MARK_BACKGROUND,
  BrandGlyph,
} from "@/components/brand-logo";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

// Same mark as <BrandMark />: charcoal tile with the white Boxes glyph.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: BRAND_MARK_BACKGROUND,
          borderRadius: 7,
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <BrandGlyph size={20} />
      </div>
    ),
    size,
  );
}

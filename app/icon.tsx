import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#2563EB",
          borderRadius: 8,
          color: "#F8FAFC",
          display: "flex",
          fontSize: 22,
          fontWeight: 800,
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        S
      </div>
    ),
    size,
  );
}

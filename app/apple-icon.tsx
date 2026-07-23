import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS home-screen bookmark icon — same mark as app/icon.svg, generated as
// a PNG via next/og since Apple doesn't reliably accept SVG for this.
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0F6E56",
        borderRadius: 40,
      }}
    >
      <svg width="100" height="100" viewBox="0 0 32 32">
        <path
          d="M9 22V14M16 22V10M23 22V17"
          stroke="#FFFFFF"
          strokeWidth={3}
          strokeLinecap="round"
        />
      </svg>
    </div>,
    { ...size },
  );
}

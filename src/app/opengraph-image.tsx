import { ImageResponse } from "next/og";

export const alt = "Velnora — Flexi Knee Patches";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0d3327 0%, #145c43 55%, #0d3327 100%)",
          color: "#fbf9f4",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 88,
            fontStyle: "italic",
            fontWeight: 500,
            letterSpacing: -2,
          }}
        >
          Velnora
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 34,
            color: "#f1e6d2",
            letterSpacing: 1,
          }}
        >
          Flexi Knee Patches
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 22,
            color: "rgba(251,249,244,0.75)",
          }}
        >
          Everyday comfort, thoughtfully designed
        </div>
      </div>
    ),
    { ...size }
  );
}

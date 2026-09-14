import { ImageResponse } from "next/og";

export const alt =
  "Detasawy — a community-built data portal for the Pashto language";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The card people see when a link to Detasawy is shared. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: "#F7FBFC",
          color: "#1e2d3d",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#769FCD",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 38,
              fontWeight: 800,
            }}
          >
            D
          </div>
          <div style={{ fontSize: 36, fontWeight: 700 }}>Detasawy</div>
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: -2,
          }}
        >
          The Pashto of tomorrow,
        </div>
        <div
          style={{
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: -2,
            color: "#769FCD",
          }}
        >
          built by its speakers.
        </div>
        <div style={{ marginTop: 36, fontSize: 32, color: "#5b6b7c" }}>
          Community-owned open datasets, one word at a time.
        </div>
      </div>
    ),
    size,
  );
}

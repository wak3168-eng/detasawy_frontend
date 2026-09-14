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
          <svg width="72" height="72" viewBox="0 0 96 96" fill="none">
            <path d="M48 12 L81 31 L48 50 L15 31 Z" fill="#D9EAFD" />
            <path d="M15 31 L15 69 L48 88 L48 50 Z" fill="#BCCCDC" />
            <path d="M81 31 L81 69 L48 88 L48 50 Z" fill="#9AA6B2" />
            <path
              d="M72 42 L58 50 L58 58 L72 50 L72 58 L58 66"
              stroke="#F7FBFC"
              strokeWidth="5"
              strokeLinejoin="miter"
              strokeLinecap="round"
            />
            <path
              d="M48 12 L81 31 L81 69 L48 88 L15 69 L15 31 Z"
              stroke="#22303c"
              strokeWidth="4.5"
              strokeLinejoin="round"
            />
            <path
              d="M48 50 L48 88 M48 50 L15 31 M48 50 L81 31"
              stroke="#22303c"
              strokeWidth="4.5"
              strokeLinejoin="round"
            />
          </svg>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 40, fontWeight: 800 }}>detasawy</div>
            <div
              style={{
                fontSize: 15,
                letterSpacing: 4,
                color: "#769FCD",
                fontWeight: 700,
              }}
            >
              PUKHTO DATASETS
            </div>
          </div>
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

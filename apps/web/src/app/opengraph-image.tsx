import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Talentflow — AI-Powered Developer Marketplace";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
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
          background: "#0a0a0a",
          position: "relative",
          overflow: "hidden",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Subtle grid */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Radial glow behind logo */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Hexagon T logo */}
        <svg
          width="88"
          height="88"
          viewBox="0 0 72 72"
          fill="none"
          style={{ marginBottom: "28px" }}
        >
          <path
            d="M36 4 L64.8 20.5 L64.8 51.5 L36 68 L7.2 51.5 L7.2 20.5 Z"
            fill="none"
            stroke="#f4f3ef"
            strokeWidth="1.6"
          />
          <path
            d="M36 14 L56.5 25.75 L56.5 46.25 L36 58 L15.5 46.25 L15.5 25.75 Z"
            fill="none"
            stroke="#f4f3ef"
            strokeWidth="0.8"
            opacity="0.18"
          />
          <line
            x1="22"
            y1="28"
            x2="50"
            y2="28"
            stroke="#f4f3ef"
            strokeWidth="3.5"
          />
          <line
            x1="36"
            y1="28"
            x2="36"
            y2="51"
            stroke="#f4f3ef"
            strokeWidth="3.5"
          />
          <circle cx="52" cy="50" r="2.5" fill="#f4f3ef" opacity="0.3" />
        </svg>

        {/* Wordmark */}
        <div
          style={{
            fontSize: "26px",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "rgba(244,243,239,0.45)",
            marginBottom: "32px",
            display: "flex",
          }}
        >
          Talentflow
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: "58px",
            fontWeight: 800,
            color: "#f4f3ef",
            letterSpacing: "-0.035em",
            lineHeight: 1.1,
            textAlign: "center",
            maxWidth: "860px",
            display: "flex",
          }}
        >
          Real Code. Real Engineers.
        </div>

        {/* Subline */}
        <div
          style={{
            fontSize: "23px",
            color: "rgba(244,243,239,0.5)",
            marginTop: "22px",
            textAlign: "center",
            maxWidth: "620px",
            lineHeight: 1.5,
            display: "flex",
          }}
        >
          AI-powered assessments that find developers who ship.
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: "36px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "16px",
            color: "rgba(244,243,239,0.25)",
            letterSpacing: "0.04em",
          }}
        >
          codeks.hr
        </div>
      </div>
    ),
    { ...size },
  );
}

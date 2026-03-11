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
          backgroundColor: "#0a0a0a",
          padding: "60px 80px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Top gradient accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #ffffff 0%, #a0a0a0 50%, #ffffff 100%)",
          }}
        />

        {/* Logo + brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          <span
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            Talentflow
          </span>
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            gap: "24px",
            marginTop: "-20px",
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: "9999px",
                padding: "6px 16px",
                fontSize: "14px",
                color: "#a0a0a0",
                fontWeight: 500,
                letterSpacing: "0.04em",
                textTransform: "uppercase" as const,
              }}
            >
              AI-Powered Developer Marketplace
            </div>
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: "56px",
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              maxWidth: "800px",
            }}
          >
            Find exceptional remote engineers
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: "22px",
              color: "#8a8a8a",
              lineHeight: 1.5,
              maxWidth: "700px",
            }}
          >
            Pre-vetted developers through AI-powered code assessments. Real
            GitHub challenges, not resumes.
          </div>
        </div>

        {/* Bottom stats row */}
        <div
          style={{
            display: "flex",
            gap: "48px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: "28px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span
              style={{ fontSize: "24px", fontWeight: 700, color: "#ffffff" }}
            >
              500+
            </span>
            <span style={{ fontSize: "14px", color: "#666666" }}>
              Vetted Developers
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span
              style={{ fontSize: "24px", fontWeight: 700, color: "#ffffff" }}
            >
              50+
            </span>
            <span style={{ fontSize: "14px", color: "#666666" }}>
              Companies Hiring
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span
              style={{ fontSize: "24px", fontWeight: 700, color: "#ffffff" }}
            >
              8
            </span>
            <span style={{ fontSize: "14px", color: "#666666" }}>
              AI Scoring Dimensions
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span
              style={{ fontSize: "24px", fontWeight: 700, color: "#ffffff" }}
            >
              Minutes
            </span>
            <span style={{ fontSize: "14px", color: "#666666" }}>
              Review Turnaround
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

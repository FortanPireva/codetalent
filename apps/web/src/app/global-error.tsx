"use client";

import { useEffect, useState } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
          backgroundColor: "#ffffff",
          color: "#141414",
        }}
      >
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle noise texture via CSS */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: mounted ? 0.03 : 0,
              transition: "opacity 1s ease",
              backgroundImage: `
                linear-gradient(to right, #141414 1px, transparent 1px),
                linear-gradient(to bottom, #141414 1px, transparent 1px)
              `,
              backgroundSize: "80px 80px",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 50% 50%, transparent 20%, #ffffff 70%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              maxWidth: "32rem",
            }}
          >
            {/* Animated pulse ring */}
            <div
              style={{
                position: "relative",
                width: "5rem",
                height: "5rem",
                marginBottom: "2.5rem",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "scale(1)" : "scale(0.8)",
                transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "9999px",
                  border: "2px solid #141414",
                  opacity: 0.1,
                  animation: "pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: "0.5rem",
                  borderRadius: "9999px",
                  border: "2px solid #141414",
                  opacity: 0.2,
                  animation:
                    "pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) 0.3s infinite",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.75rem",
                  fontWeight: 900,
                  letterSpacing: "-0.025em",
                  color: "#141414",
                }}
              >
                500
              </div>
            </div>

            {/* Message */}
            <div
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(16px)",
                transition:
                  "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s",
              }}
            >
              <h1
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  letterSpacing: "-0.025em",
                  color: "#141414",
                  marginBottom: "0.75rem",
                  marginTop: 0,
                }}
              >
                Something went wrong
              </h1>
              <p
                style={{
                  fontSize: "1rem",
                  lineHeight: 1.625,
                  color: "#8a8a8a",
                  marginBottom: "2.5rem",
                  marginTop: 0,
                }}
              >
                An unexpected error occurred. Our team has been notified.
                Please try again.
              </p>
            </div>

            {/* Actions */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.75rem",
                justifyContent: "center",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(16px)",
                transition:
                  "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s",
              }}
            >
              <button
                onClick={() => reset()}
                type="button"
                style={{
                  height: "2.75rem",
                  padding: "0 1.5rem",
                  borderRadius: "0.625rem",
                  border: "none",
                  backgroundColor: "#141414",
                  color: "#fafafa",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  letterSpacing: "0.025em",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontFamily: "inherit",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.opacity = "0.85")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.opacity = "1")
                }
              >
                Try Again
              </button>
              <a
                href="/"
                style={{
                  height: "2.75rem",
                  padding: "0 1.5rem",
                  borderRadius: "0.625rem",
                  border: "1px solid rgba(20, 20, 20, 0.2)",
                  backgroundColor: "transparent",
                  color: "#141414",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  letterSpacing: "0.025em",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  fontFamily: "inherit",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "rgba(20, 20, 20, 0.05)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Back to Home
              </a>
            </div>

            {/* Error digest for debugging */}
            {error.digest && (
              <p
                style={{
                  marginTop: "2rem",
                  fontSize: "0.75rem",
                  color: "#c0c0c0",
                  fontFamily: "var(--font-geist-mono), monospace",
                  letterSpacing: "0.05em",
                  opacity: mounted ? 1 : 0,
                  transition: "opacity 1s ease 0.6s",
                }}
              >
                Error ID: {error.digest}
              </p>
            )}

            {/* Branding */}
            <p
              style={{
                marginTop: "4rem",
                fontSize: "0.75rem",
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(20, 20, 20, 0.2)",
                opacity: mounted ? 1 : 0,
                transition: "opacity 1s ease 0.6s",
              }}
            >
              Talentflow
            </p>
          </div>
        </div>

        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes pulse-ring {
                0%, 100% { opacity: inherit; transform: scale(1); }
                50% { opacity: 0.05; transform: scale(1.15); }
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

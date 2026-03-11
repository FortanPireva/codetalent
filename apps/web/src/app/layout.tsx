import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.png",
  },
  title: {
    default: "Talentflow — AI-Powered Developer Marketplace",
    template: "%s | Talentflow",
  },
  description:
    "The B2B developer marketplace where companies find pre-vetted engineers through AI-powered code assessments, and developers land quality remote roles.",
  metadataBase: new URL(
    process.env.NEXTAUTH_URL ?? "https://codeks.hr"
  ),
  openGraph: {
    type: "website",
    siteName: "Talentflow",
    title: "Talentflow — AI-Powered Developer Marketplace",
    description:
      "Find exceptional remote engineers through AI-powered code assessments. Real GitHub challenges, not resumes.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Talentflow — AI-Powered Developer Marketplace",
    description:
      "Find exceptional remote engineers through AI-powered code assessments. Real GitHub challenges, not resumes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

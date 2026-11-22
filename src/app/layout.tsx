import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FRESHDATE — Fridge-Centered Smart Shopping & Meal Intervention",
  description:
    "Track refrigerator freshness, sync social dining plans, and intervene before overbuying to eliminate food waste at its source.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FRESHDATE",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#F4F6EE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-[#94C060]/30">{children}</body>
    </html>
  );
}

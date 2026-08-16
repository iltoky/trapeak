import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./accessibility.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TRAPEAK — Your fitness and health data for any AI",
    template: "%s | TRAPEAK",
  },
  description: "Keep workouts, nutrition, weight and health history in one permissioned data layer. Use it with compatible AI assistants or share selected categories with people you trust.",
  metadataBase: new URL("https://trapeak.com"),
  openGraph: { title: "Your data. Any AI. People you trust.", description: "A permissioned fitness and health history for compatible AI assistants, coaches, doctors and dietitians.", url: "https://trapeak.com", siteName: "TRAPEAK", type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image", title: "Your data. Any AI. People you trust.", description: "A permissioned fitness and health history for AI and people you choose." },
  icons: {
    icon: [
      { url: "/brand/trapeak-app-icon.svg", type: "image/svg+xml" },
      { url: "/brand/trapeak-app-icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/brand/trapeak-app-icon.svg",
    apple: "/brand/trapeak-app-icon.png",
  },
  alternates: { canonical: "/en/" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

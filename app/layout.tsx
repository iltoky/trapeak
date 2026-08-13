import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist, Geist_Mono } from "next/font/google";
import { isAuthConfigured } from "@/lib/auth/config";
import "./globals.css";
import "./guides.css";
import "./auth.css";

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
    default: "TRAPEAK — Fitness data infrastructure for AI",
    template: "%s | TRAPEAK",
  },
  description: "TRAPEAK private beta connects authorized Wahoo workouts, nutrition records, and laboratory results to compatible AI assistants through a secure personal MCP connection.",
  metadataBase: new URL("https://trapeak.com"),
  alternates: { canonical: "/" },
  openGraph: { title: "TRAPEAK — Fitness data infrastructure for AI", description: "A secure personal MCP connection for authorized fitness, nutrition, and laboratory data. Available in private beta with Wahoo.", url: "https://trapeak.com", siteName: "TRAPEAK", type: "website" },
  icons: {
    icon: [
      { url: "/brand/trapeak-app-icon.svg", type: "image/svg+xml" },
      { url: "/brand/trapeak-app-icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/brand/trapeak-app-icon.svg",
    apple: "/brand/trapeak-app-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <>
      {children}
      <Analytics />
      <SpeedInsights />
    </>
  );

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {isAuthConfigured() ? (
          <ClerkProvider
            appearance={{
              options: {
                logoImageUrl: "/brand/trapeak-logo.svg",
                logoLinkUrl: "https://trapeak.com",
                privacyPageUrl: "https://trapeak.com/privacy",
                termsPageUrl: "https://trapeak.com/terms",
              },
            }}
          >
            {content}
          </ClerkProvider>
        ) : (
          content
        )}
      </body>
    </html>
  );
}

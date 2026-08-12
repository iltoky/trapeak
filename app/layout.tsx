import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./guides.css";

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
  description: "TRAPEAK is developing a secure, user-specific MCP connection for authorized fitness data and compatible AI assistants. Garmin is the first planned integration, subject to approval.",
  metadataBase: new URL("https://trapeak.com"),
  alternates: { canonical: "/" },
  openGraph: { title: "TRAPEAK — Fitness data infrastructure for AI", description: "A planned secure MCP connection between authorized fitness data and the AI assistant a user chooses.", url: "https://trapeak.com", siteName: "TRAPEAK", type: "website" },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
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
        {children}
      </body>
    </html>
  );
}

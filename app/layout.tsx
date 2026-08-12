import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TRAPEAK — Your fitness data, available to any AI",
  description: "Connect Garmin once and securely use your training data with ChatGPT, Claude, and other MCP-compatible assistants.",
  metadataBase: new URL("https://trapeak.com"),
  openGraph: { title: "TRAPEAK — Your fitness data, available to any AI", description: "A secure MCP connection between your fitness data and the AI assistant you choose.", url: "https://trapeak.com", siteName: "TRAPEAK", type: "website" },
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

import type { Metadata, Viewport } from "next";
import { Rubik, JetBrains_Mono } from "next/font/google";

import { config, feedUrls } from "@/lib/config";
import "./globals.css";

// Rubik covers Latin + Hebrew, so the UI and content render in one consistent
// modern face whether posts are in English or Hebrew.
const rubik = Rubik({
  subsets: ["latin", "hebrew"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rubik",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jbmono",
  display: "swap",
});

const urls = feedUrls();

export const metadata: Metadata = {
  title: { default: config.siteTitle, template: `%s — ${config.siteTitle}` },
  description: config.siteDescription,
  alternates: {
    types: {
      "application/rss+xml": urls.rss,
      "application/atom+xml": urls.atom,
      "application/feed+json": urls.json,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${rubik.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}

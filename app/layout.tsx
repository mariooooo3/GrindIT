import type { Metadata, Viewport } from "next";
import "./globals.css";
import SessionProviderWrapper from "@/components/providers/SessionProviderWrapper";
import { MobileGate } from "@/components/ui/MobileGate";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#080612",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://grindit.dev"),
  title: "GrindIT",
  description: "Turn your GitHub activity into a shareable developer recap.",
  applicationName: "GrindIT",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-48x48.png", type: "image/png", sizes: "48x48" },
      { url: "/logo3.png", type: "image/png", sizes: "1024x1024" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "GrindIT",
    description: "Turn your GitHub activity into a shareable developer recap.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GrindIT",
    description: "Turn your GitHub activity into a shareable developer recap.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SessionProviderWrapper>
          <MobileGate>{children}</MobileGate>
        </SessionProviderWrapper>
        {/* debug=false silences the verbose dev-only console logs from both. */}
        <Analytics debug={false} />
        <SpeedInsights debug={false} />
      </body>
    </html>
  );
}

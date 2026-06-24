import type { Metadata, Viewport } from "next";
import "./globals.css";
import SessionProviderWrapper from "@/components/providers/SessionProviderWrapper";
import { MobileGate } from "@/components/ui/MobileGate";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#080612",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://githubwrapped.dev"),
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
    images: [{ url: "/logo3.png", width: 1024, height: 1024, alt: "GrindIT" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GrindIT",
    description: "Turn your GitHub activity into a shareable developer recap.",
    images: ["/logo3.png"],
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
      </body>
    </html>
  );
}

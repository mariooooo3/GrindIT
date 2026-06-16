import type { Metadata, Viewport } from "next";
import "./globals.css";
import SessionProviderWrapper from "@/components/providers/SessionProviderWrapper";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#080612",
};

export const metadata: Metadata = {
  title: "GitHub Wrapped",
  description: "Turn your GitHub activity into a shareable developer recap.",
  applicationName: "GitHub Wrapped",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo3.png", type: "image/png", sizes: "1024x1024" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "GitHub Wrapped",
    description: "Turn your GitHub activity into a shareable developer recap.",
    images: [{ url: "/logo3.png", width: 1024, height: 1024, alt: "GitHub Wrapped" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GitHub Wrapped",
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
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}

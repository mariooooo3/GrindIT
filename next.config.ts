import type { NextConfig } from "next";

// Content-Security-Policy. framer-motion needs 'unsafe-inline' styles; the
// high-value protections (no framing/clickjacking, no plugins, locked
// base-uri/form-action) are always on.
//
// 'unsafe-eval' (string eval / new Function) and the ws:/wss: dev socket are
// ONLY required by Next/Turbopack HMR in development — they're gated on
// NODE_ENV so production never ships them (P1-6).
const isDev = process.env.NODE_ENV !== "production";

const csp = [
  "default-src 'self'",
  // va.vercel-scripts.com serves the Vercel Analytics + Speed Insights scripts.
  `script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // api.dicebear.com serves the fallback avatars used across the slides (P1-1).
  "img-src 'self' data: https://avatars.githubusercontent.com https://flagcdn.com https://api.dicebear.com",
  "font-src 'self' data:",
  // vitals.vercel-insights.com + va.vercel-scripts.com receive the analytics beacons.
  `connect-src 'self'${isDev ? " ws: wss:" : ""} https://avatars.githubusercontent.com https://flagcdn.com https://va.vercel-scripts.com https://vitals.vercel-insights.com`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  transpilePackages: ["next-auth"],
  devIndicators: false,
  // Include public assets in the serverless bundle for opengraph-image.tsx (readFile).
  outputFileTracingIncludes: {
    "/opengraph-image": ["./public/logo3.png"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

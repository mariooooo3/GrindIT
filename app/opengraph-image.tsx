import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "GrindIT — Your GitHub activity, wrapped.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoData = await readFile(join(process.cwd(), "public/logo3.png"));
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#080612",
          padding: "0 80px",
          gap: 56,
        }}
      >
        {/* logo */}
        <img
          src={logoSrc}
          width={220}
          height={220}
          style={{ borderRadius: 36, flexShrink: 0 }}
        />

        {/* text */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 100,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1,
              letterSpacing: "-2px",
            }}
          >
            GrindIT
          </div>
          <div
            style={{
              fontSize: 34,
              color: "#a78bfa",
              lineHeight: 1.3,
            }}
          >
            Your GitHub activity, wrapped.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

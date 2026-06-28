import logo from "@/components/pawcup/assets/logo3.asset.json";

export function SlideWatermark() {
  return (
    <div
      className="pointer-events-none absolute bottom-[54px] right-3 z-50 hidden lg:flex items-center gap-2.5 rounded-full px-3.5 py-2 lg:bottom-5"
      style={{ background: "rgba(0,0,0,0.38)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logo.url}
        alt=""
        aria-hidden
        width={26}
        height={26}
        className="w-[26px] h-[26px] rounded-full"
        style={{
          boxShadow:
            "0 0 0 1.5px oklch(0.72 0.18 295 / 0.72), 0 0 9px oklch(0.72 0.18 295 / 0.5)",
        }}
      />
      {/* G and IT in violet, rind in white — matching landing screen branding */}
      <span className="text-[13px] font-bold tracking-[0.06em] whitespace-nowrap">
        <span style={{ color: "oklch(0.72 0.18 295)" }}>G</span>
        <span style={{ color: "rgba(255,255,255,0.85)" }}>rind</span>
        <span style={{ color: "oklch(0.72 0.18 295)" }}>IT</span>
      </span>
    </div>
  );
}

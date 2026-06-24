import logo from "@/components/pawcup/assets/logo3.asset.json";

export function SlideWatermark() {
  return (
    <div
      className="pointer-events-none absolute bottom-5 right-5 z-50 flex items-center gap-2 rounded-full px-3 py-1.5"
      style={{ background: "rgba(0,0,0,0.38)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logo.url}
        alt=""
        aria-hidden
        width={18}
        height={18}
        className="w-[18px] h-[18px] rounded-full"
        style={{
          boxShadow:
            "0 0 0 1.5px oklch(0.72 0.18 295 / 0.72), 0 0 7px oklch(0.72 0.18 295 / 0.45)",
        }}
      />
      <span
        className="text-[10px] font-bold tracking-[0.06em]"
        style={{ color: "rgba(255,255,255,0.78)" }}
      >
        GrindIT
      </span>
    </div>
  );
}

import { dealingMeta, fmtPx } from "@/lib/ict-calc";
import type { DealingRange } from "@/lib/ict-types";
import { cn } from "@/lib/utils";

export interface RangeBarProps {
  range: DealingRange;
  mark?: number | null;
  markLabel?: string;
  className?: string;
}

export function RangeBar({
  range,
  mark,
  markLabel = "Price",
  className,
}: RangeBarProps) {
  const meta = dealingMeta({ ...range, current: mark ?? range.current ?? range.close ?? null });
  if (!meta.span || meta.high == null || meta.low == null) {
    return (
      <p className="text-sm text-muted-foreground">Set a high and a low to map premium / discount.</p>
    );
  }
  const price = mark ?? range.current ?? range.close;
  const pct = meta.pctFromLow != null ? Math.min(1, Math.max(0, meta.pctFromLow)) : 0.5;

  return (
    <div className={cn("space-y-2.5 rounded-xl border border-white/[0.08] bg-black/40 p-3.5 backdrop-blur-sm", className)}>
      <div className="flex items-center justify-between text-[11px] font-mono">
        <span className="text-muted-foreground">Low <span className="font-semibold text-foreground">{fmtPx(meta.low)}</span></span>
        <span className="rounded-md border border-white/[0.1] bg-white/[0.05] px-2.5 py-0.5 font-medium text-foreground shadow-sm">
          EQ {fmtPx(meta.eq)}
        </span>
        <span className="text-muted-foreground">High <span className="font-semibold text-foreground">{fmtPx(meta.high)}</span></span>
      </div>
      <div className="relative h-9 overflow-hidden rounded-lg border border-white/[0.08] bg-surface-2/60 shadow-inner">
        <div className="absolute inset-y-0 left-0 w-1/2 border-r border-dashed border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-emerald-500/25" />
        <div className="absolute inset-y-0 right-0 w-1/2 border-l border-dashed border-rose-500/30 bg-gradient-to-l from-rose-500/10 to-rose-500/25" />
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/40 shadow-[0_0_4px_rgba(255,255,255,0.4)]" />
        {price != null ? (
          <div
            className="absolute top-1 bottom-1 w-1 rounded-full bg-accent shadow-[0_0_8px_rgba(212,222,208,0.85)] transition-all duration-300"
            style={{ left: `calc(${pct * 100}% - 2px)` }}
          />
        ) : null}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-[11px] font-semibold tracking-wider text-emerald-400 uppercase">Discount (Buy)</span>
        <span
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase",
            meta.location === "premium"
              ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
              : meta.location === "discount"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-white/10 bg-white/5 text-muted-foreground",
          )}
        >
          {markLabel}: {fmtPx(price)} · {meta.location}
        </span>
        <span className="text-[11px] font-semibold tracking-wider text-rose-400 uppercase">Premium (Sell)</span>
      </div>
    </div>
  );
}

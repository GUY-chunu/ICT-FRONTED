import { cn } from "@/lib/utils";

function Progress({ value = 0, className }: { value?: number; className?: string }) {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("relative h-2 w-full overflow-hidden rounded-full border border-white/[0.08] bg-white/[0.04] p-[1px]", className)}>
      <div
        className={cn(
          "h-full rounded-full transition-all duration-300 ease-out",
          v > 80
            ? "bg-gradient-to-r from-amber-500 to-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
            : "bg-gradient-to-r from-accent/70 via-accent to-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]",
        )}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

export { Progress };

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  variant?: "default" | "up" | "down" | "warn";
  className?: string;
}

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  variant = "default",
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-card/90 via-card/75 to-card/50 p-4.5 shadow-lg shadow-black/25 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.18] hover:shadow-xl hover:shadow-black/40 before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/[0.16] before:to-transparent sm:p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">{label}</p>
        {Icon ? (
          <span className="flex size-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-muted-foreground transition-colors group-hover:border-white/20 group-hover:text-foreground">
            <Icon className="size-3.5" />
          </span>
        ) : null}
      </div>
      <p
        className={cn(
          "mt-2 font-mono text-2xl font-bold tracking-tight tabular-nums sm:text-3xl",
          variant === "up" ? "text-up" : variant === "down" ? "text-down" : "text-foreground",
        )}
      >
        {value}
      </p>
      <div className="mt-2 flex items-center gap-1.5">
        <span className="inline-block size-1.5 rounded-full bg-accent/60" />
        <p className="text-xs font-medium text-subtle">{hint}</p>
      </div>
    </div>
  );
}

import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg bg-surface-2/90 px-3.5 text-sm text-foreground border border-white/[0.08] outline-none transition-all duration-[var(--motion-quick)] placeholder:text-muted-foreground/50 focus-visible:border-accent/50 focus-visible:ring-2 focus-visible:ring-accent/15 focus-visible:bg-surface-2 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

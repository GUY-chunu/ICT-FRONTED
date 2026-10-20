import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide border transition-all duration-150",
  {
    variants: {
      variant: {
        default: "bg-surface-2/90 text-foreground/80 border-white/[0.08] shadow-sm",
        accent: "bg-accent/15 text-accent border-accent/30 shadow-sm shadow-accent/5",
        up: "bg-up/10 text-up border-up/25 shadow-sm shadow-up/5",
        down: "bg-down/10 text-down border-down/25 shadow-sm shadow-down/5",
        warn: "bg-warn/10 text-warn border-warn/25 shadow-sm shadow-warn/5",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {}

function Badge({
  className,
  variant,
  ...props
}: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

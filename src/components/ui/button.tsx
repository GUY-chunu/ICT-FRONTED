import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-accent to-[#b8c6b4] text-accent-foreground font-semibold shadow-md shadow-accent/10 hover:brightness-105 active:brightness-95",
        secondary: "bg-surface-2 text-foreground/90 border border-white/[0.08] hover:bg-surface-2/80 hover:border-white/[0.15] shadow-sm",
        outline: "bg-transparent text-foreground/90 border border-white/[0.12] hover:bg-white/[0.05] hover:border-white/[0.25] shadow-sm",
        ghost: "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground",
        destructive: "bg-down/15 text-down border border-down/30 hover:bg-down/25 shadow-sm shadow-down/10",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8.5 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "size-10",
        "icon-sm": "size-8.5",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };

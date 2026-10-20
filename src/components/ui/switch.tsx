import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer inline-flex h-6 w-10 shrink-0 items-center rounded-full shadow-border transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=checked]:bg-accent data-[state=unchecked]:bg-surface-2",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block size-5 translate-x-0.5 rounded-full bg-foreground transition-transform data-[state=checked]:translate-x-4 data-[state=checked]:bg-accent-foreground",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };

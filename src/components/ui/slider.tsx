import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center h-10", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-[2px] w-full grow overflow-hidden bg-white/[0.08]">
      <SliderPrimitive.Range className="absolute h-full bg-white/40" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border border-white/30 bg-white shadow-[0_0_10px_rgba(255,255,255,0.15)] ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing relative z-50 touch-action-none" style={{ touchAction: 'none' }} />
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border border-white/30 bg-white shadow-[0_0_10px_rgba(255,255,255,0.15)] ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing relative z-50 touch-action-none" style={{ touchAction: 'none' }} />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };

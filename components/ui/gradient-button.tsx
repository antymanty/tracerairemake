"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const gradientButtonVariants = cva(
  [
    "relative overflow-hidden group",
    "inline-flex items-center justify-center",
    "rounded-xl min-w-[132px] px-9 py-4",
    "text-base font-medium text-white/90",
    "font-mono",
    "bg-black/80 backdrop-blur-xl",
    "border border-white/10",
    // Multiple layered shadows for depth
    "shadow-[0_0_1px_1px_rgba(255,255,255,0.05)]",
    "after:absolute after:inset-0 after:rounded-xl after:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]",
    "before:absolute before:inset-0 before:rounded-xl before:shadow-[0_0_0_1px_rgba(255,255,255,0.1)]",
    // Glass reflection effect
    "[background-image:linear-gradient(180deg,rgba(255,255,255,0.01),rgba(255,255,255,0)_40%)]",
    // Hover effects
    "hover:bg-black/70",
    "hover:border-white/20",
    "hover:shadow-[0_0_1px_1px_rgba(255,255,255,0.1),0_0_5px_rgba(255,255,255,0.05)]",
    "hover:before:shadow-[0_0_0_1px_rgba(255,255,255,0.2)]",
    "hover:after:shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]",
    // Smooth transitions
    "[transition:all_0.3s_cubic-bezier(0.4,0,0.2,1)]",
    "before:transition-shadow after:transition-shadow",
    // Focus state
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        default: "",
        variant: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof gradientButtonVariants> {
  asChild?: boolean
}

const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(gradientButtonVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
GradientButton.displayName = "GradientButton"

export { GradientButton, gradientButtonVariants }
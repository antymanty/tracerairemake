"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const gradientButtonVariants = cva(
  [
    "relative overflow-hidden",
    "inline-flex items-center justify-center",
    "rounded-xl min-w-[132px] px-9 py-4",
    "text-base font-medium text-white/90",
    "font-mono",
    "bg-black/80 backdrop-blur-md",
    "border border-white/20",
    "shadow-[0_0_15px_rgba(0,0,0,0.6)]",
    "before:absolute before:inset-0",
    "before:rounded-xl before:p-[1px]",
    "before:bg-gradient-to-r before:from-white/20 before:via-white/40 before:to-white/20",
    "before:mask before:mask-composite-exclude",
    "after:absolute after:inset-[1px] after:rounded-[10px]",
    "after:bg-gradient-to-r after:from-black/50 after:to-black/50",
    "after:backdrop-blur-xl",
    "hover:bg-black/70",
    "hover:border-white/30",
    "hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]",
    "hover:before:bg-gradient-to-r hover:before:from-white/30 hover:before:via-white/50 hover:before:to-white/30",
    "group",
    "transition-all duration-300",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        default: "",
        variant: "before:from-emerald-500/20 before:via-teal-500/40 before:to-blue-500/20 hover:before:from-emerald-500/30 hover:before:via-teal-500/50 hover:before:to-blue-500/30",
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
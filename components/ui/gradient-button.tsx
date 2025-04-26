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
    "bg-black/95 backdrop-blur-sm",
    "border border-white/5",
    "shadow-[inset_0_0_1px_rgba(255,255,255,0.05)]",
    "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/[0.02] before:to-transparent",
    "after:absolute after:inset-0 after:bg-gradient-to-r after:from-blue-500/[0.08] after:via-purple-500/[0.08] after:to-pink-500/[0.08]",
    "hover:bg-black/90 hover:border-white/10",
    "hover:before:animate-shine",
    "hover:after:opacity-100",
    "transition-all duration-500",
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/10",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        default: "",
        variant: "after:from-emerald-500/[0.08] after:via-teal-500/[0.08] after:to-blue-500/[0.08]",
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
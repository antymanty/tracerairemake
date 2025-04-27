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
    "text-base font-medium text-black/90",
    "font-mono",
    "bg-white/10 backdrop-blur-2xl",
    "border border-white/30",
    "shadow-[0_0_1px_1px_rgba(0,0,0,0.05)]",
    "after:absolute after:inset-0 after:rounded-xl after:shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]",
    "before:absolute before:inset-0 before:rounded-xl before:shadow-[0_0_0_1px_rgba(0,0,0,0.1)]",
    "hover:bg-white/20",
    "hover:border-white/40",
    "hover:shadow-[0_0_1px_1px_rgba(0,0,0,0.1),0_0_5px_rgba(0,0,0,0.05)]",
    "hover:before:shadow-[0_0_0_1px_rgba(0,0,0,0.2)]",
    "hover:after:shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]",
    "[transition:all_0.3s_cubic-bezier(0.4,0,0.2,1)]",
    "before:transition-shadow after:transition-shadow",
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black/30",
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
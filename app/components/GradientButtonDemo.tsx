"use client"

import { GradientButton } from "@/components/ui/gradient-button"

export function GradientButtonDemo() {
  return (
    <div className="flex gap-8">
      <GradientButton>Get Started</GradientButton>
      <GradientButton variant="variant">Get Started</GradientButton>
    </div>
  )
} 
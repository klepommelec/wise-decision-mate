
import * as React from "react"
import { cn } from "@/lib/utils"

interface StyledCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function StyledCard({ className, children, ...props }: StyledCardProps) {
  return (
    <div className="relative">
      {/* Background decorative hands pattern */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-[url('/lovable-uploads/6101851f-2549-45ba-a231-ed9bfb465e2b.png')] bg-no-repeat bg-contain opacity-5 -rotate-12" />
      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[url('/lovable-uploads/6101851f-2549-45ba-a231-ed9bfb465e2b.png')] bg-no-repeat bg-contain opacity-5 rotate-45" />
      
      {/* Card with gradient border effect */}
      <div
        className={cn(
          // Base card styles
          "relative rounded-2xl",
          // Gradient border effect using padding
          "p-[1px] bg-gradient-to-br from-[#9b87f5] via-[#7E69AB] to-[#D6BCFA]",
          className
        )}
        {...props}
      >
        <div className="relative h-full w-full rounded-2xl bg-white p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

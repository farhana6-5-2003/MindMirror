import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "rounded-3xl border border-gray-100 bg-[var(--color-card)] text-[var(--foreground)] shadow-sm",
            className
        )}
        {...props}
    />
))
Card.displayName = "Card"

export { Card }

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
// Note: We'll implement a simple version without cva for now to keep deps low, 
// or I can just use template literals and clsx.

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
    variant?: "primary" | "secondary" | "ghost" | "outline"
    size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "default", asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"

        const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"

        const variants = {
            primary: "bg-[var(--color-primary)] text-white shadow hover:opacity-90",
            secondary: "bg-[var(--color-accent)] text-white shadow-sm hover:opacity-90",
            ghost: "hover:bg-gray-100 text-[var(--foreground)]",
            outline: "border border-gray-200 bg-transparent shadow-sm hover:bg-gray-100 text-[var(--foreground)]",
        }

        const sizes = {
            default: "h-11 px-6 py-2",
            sm: "h-9 rounded-xl px-3 text-xs",
            lg: "h-12 rounded-2xl px-8",
            icon: "h-10 w-10",
        }

        return (
            <Comp
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }

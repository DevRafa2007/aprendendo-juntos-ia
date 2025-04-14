import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-brand-blue text-white hover:bg-brand-blue/90 shadow-sm",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-gradient-to-r hover:from-brand-blue/5 hover:to-brand-green/5 hover:border-brand-blue/30 hover:shadow-sm transition-all duration-300 ease-in-out transform hover:scale-[1.01]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: 
          "hover:bg-gradient-to-r hover:from-brand-blue/5 hover:to-brand-green/5 transition-all duration-300 ease-in-out transform hover:scale-[1.01]",
        link: "text-brand-blue underline-offset-4 hover:underline",
        gradient: "bg-gradient-to-r from-brand-blue to-brand-green text-white hover:bg-gradient-to-r hover:from-brand-blue/90 hover:to-brand-green/90 shadow-sm transition-all duration-300 ease-in-out hover:scale-[1.02]",
        primary: "bg-brand-blue text-white hover:bg-brand-blue/90 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out transform hover:translate-y-[-2px]",
        success: "bg-brand-green text-white hover:bg-brand-green/90 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out transform hover:translate-y-[-2px]",
        gradientText: "bg-white text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-green hover:bg-white hover:shadow-md shadow-sm transition-all duration-300 ease-in-out transform hover:translate-y-[-2px]",
        whiteOutline: "bg-transparent text-white border border-white hover:bg-white/10 transition-colors duration-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

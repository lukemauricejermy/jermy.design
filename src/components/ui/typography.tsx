import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "scroll-m-20",
      h2: "scroll-m-20 font-medium",
      h3: "scroll-m-20",
      h4: "scroll-m-20",
      lead: "text-muted-foreground",
      p: "leading-7 [&:not(:first-child)]:mt-6",
      large: "text-lg font-semibold",
      small: "text-sm font-medium leading-none",
      muted: "text-sm text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "p",
  },
})

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: React.ElementType
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, as, ...props }, ref) => {
    const Comp = as || (variant === "h1" ? "h1" : variant === "h2" ? "h2" : variant === "h3" ? "h3" : variant === "h4" ? "h4" : "p")
    return (
      <Comp
        ref={ref}
        className={cn(typographyVariants({ variant }), className)}
        {...props}
      />
    )
  }
)
Typography.displayName = "Typography"

// Convenience components
const H1 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="h1"
    as="h1"
    className={className}
    {...props}
  />
))
H1.displayName = "H1"

const H2 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="h2"
    as="h2"
    className={className}
    {...props}
  />
))
H2.displayName = "H2"

const H3 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="h3"
    as="h3"
    className={className}
    {...props}
  />
))
H3.displayName = "H3"

const H4 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="h4"
    as="h4"
    className={className}
    {...props}
  />
))
H4.displayName = "H4"

const Lead = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="lead"
    as="p"
    className={className}
    {...props}
  />
))
Lead.displayName = "Lead"

const P = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <Typography
    ref={ref}
    variant="p"
    as="p"
    className={className}
    {...props}
  />
))
P.displayName = "P"

export { Typography, H1, H2, H3, H4, Lead, P, typographyVariants }

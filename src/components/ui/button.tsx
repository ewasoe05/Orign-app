import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { type ButtonHTMLAttributes, forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-sm font-medium transition-ui focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-page disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-accent text-white hover:bg-accent-hover",
        secondary: "bg-surface-raised text-text-primary hover:bg-border-subtle",
        outline:
          "border border-border-strong bg-transparent text-text-primary hover:bg-surface-raised",
        ghost: "text-text-primary hover:bg-surface-raised",
        destructive: "bg-danger text-white hover:bg-red-500",
      },
      size: {
        default: "h-10 px-4 py-2 text-body",
        sm: "h-8 px-3 text-caption",
        lg: "h-12 px-6 text-body",
        touch: "h-11 min-h-11 px-5 text-body",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          {children}
        </>
      ) : (
        children
      )}
    </button>
  ),
);
Button.displayName = "Button";

export { buttonVariants };

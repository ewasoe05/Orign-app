import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Button, type ButtonProps } from "./button";

export function FormActions({
  className,
  children,
  secondary,
}: {
  className?: string;
  children: ReactNode;
  secondary?: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-3 pt-2", className)}>
      {children}
      {secondary}
    </div>
  );
}

export function FormSubmit({
  className,
  loading,
  children,
  ...props
}: ButtonProps) {
  return (
    <Button type="submit" size="touch" className={cn("w-full", className)} loading={loading} {...props}>
      {children}
    </Button>
  );
}

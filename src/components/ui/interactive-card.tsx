"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type InteractiveCardProps = {
  href: string;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "children" | "className">;

export function InteractiveCard({ href, children, className, ...props }: InteractiveCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "block rounded-lg transition-ui focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-page active:scale-[0.99]",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

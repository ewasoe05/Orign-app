"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-subtle bg-page/95 pb-nav-inner shadow-float backdrop-blur supports-[backdrop-filter]:bg-page/80 lg:hidden">
      <div className="mx-auto flex w-full max-w-xl items-stretch justify-between px-1 py-2">
        {NAV_ITEMS.map(({ href, mobileLabel, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-sm px-1 transition-ui focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                active ? "text-text-secondary" : "text-text-tertiary hover:text-text-secondary",
              )}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0",
                  active ? "text-accent-muted" : "text-text-tertiary",
                )}
              />
              <span className="truncate text-caption">{mobileLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

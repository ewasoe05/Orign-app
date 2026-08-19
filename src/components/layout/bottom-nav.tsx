"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 pb-nav-inner backdrop-blur supports-[backdrop-filter]:bg-zinc-950/80 lg:hidden">
      <div className="mx-auto flex w-full max-w-xl items-stretch justify-between px-1 py-2">
        {NAV_ITEMS.map(({ href, mobileLabel, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-[10px] transition-colors",
                active ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span className="truncate">{mobileLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

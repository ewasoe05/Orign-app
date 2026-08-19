"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS } from "./nav-items";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:border-r lg:border-border-subtle lg:bg-page">
      <div className="flex h-full flex-col px-4 py-6">
        <div className="mb-8">
          <h1 className="text-title">Goal Dashboard</h1>
          <p className="mt-1 text-caption text-text-secondary">Two-year plan</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map(({ href, desktopLabel, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-body font-medium transition-ui focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  active
                    ? "bg-surface-raised text-text-primary"
                    : "text-text-secondary hover:bg-surface hover:text-text-primary",
                )}
              >
                <Icon
                  className={cn("h-5 w-5", active ? "text-accent-muted" : "text-text-tertiary")}
                />
                {desktopLabel}
              </Link>
            );
          })}
        </nav>

        <form action={signOut} className="mt-auto pt-4">
          <Button type="submit" variant="ghost" className="w-full justify-start gap-3 text-text-secondary">
            <LogOut className="h-5 w-5" />
            Sign out
          </Button>
        </form>
      </div>
    </aside>
  );
}

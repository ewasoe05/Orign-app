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
    <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:border-r lg:border-zinc-800 lg:bg-zinc-950">
      <div className="flex h-full flex-col px-4 py-6">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Two-Year Plan</p>
          <h1 className="text-lg font-semibold">Goal Dashboard</h1>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map(({ href, desktopLabel, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-emerald-950/50 text-emerald-400"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100",
                )}
              >
                <Icon className="h-5 w-5" />
                {desktopLabel}
              </Link>
            );
          })}
        </nav>

        <form action={signOut} className="mt-auto pt-4">
          <Button type="submit" variant="ghost" className="w-full justify-start gap-3 text-zinc-400">
            <LogOut className="h-5 w-5" />
            Sign out
          </Button>
        </form>
      </div>
    </aside>
  );
}

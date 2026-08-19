"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  DollarSign,
  PiggyBank,
  Dumbbell,
  Briefcase,
  ClipboardList,
  Map,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/debt", label: "Debt", icon: DollarSign },
  { href: "/savings", label: "Save", icon: PiggyBank },
  { href: "/fitness", label: "Fit", icon: Dumbbell },
  { href: "/business", label: "Biz", icon: Briefcase },
  { href: "/review", label: "Rev", icon: ClipboardList },
  { href: "/plan", label: "Plan", icon: Map },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/80 lg:hidden">
      <div className="mx-auto flex max-w-lg items-end justify-between px-1 py-1.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1 text-[10px] transition-colors",
                active ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

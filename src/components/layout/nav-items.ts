import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Banknote,
  DollarSign,
  PiggyBank,
  Dumbbell,
  Briefcase,
  ClipboardList,
  Map,
} from "lucide-react";

export type NavItem = {
  href: string;
  mobileLabel: string;
  desktopLabel: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", mobileLabel: "Home", desktopLabel: "Dashboard", icon: LayoutDashboard },
  { href: "/paycheck", mobileLabel: "Pay", desktopLabel: "Paycheck", icon: Banknote },
  { href: "/debt", mobileLabel: "Debt", desktopLabel: "Debt", icon: DollarSign },
  { href: "/savings", mobileLabel: "Save", desktopLabel: "Savings", icon: PiggyBank },
  { href: "/fitness", mobileLabel: "Fit", desktopLabel: "Fitness", icon: Dumbbell },
  { href: "/business", mobileLabel: "Biz", desktopLabel: "Business", icon: Briefcase },
  { href: "/review", mobileLabel: "Rev", desktopLabel: "Review", icon: ClipboardList },
  { href: "/plan", mobileLabel: "Plan", desktopLabel: "Full Plan", icon: Map },
];

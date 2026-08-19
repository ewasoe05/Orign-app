import { BottomNav } from "./bottom-nav";
import { SidebarNav } from "./sidebar-nav";
import { NavProgress } from "./nav-progress";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-page text-text-primary lg:flex">
      <NavProgress />
      <SidebarNav />

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-border-subtle bg-page/95 shadow-float backdrop-blur lg:hidden">
          <div className="mx-auto flex w-full max-w-xl items-center justify-between px-4 py-3">
            <h1 className="text-title">Goal Dashboard</h1>
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="touch">
                Sign out
              </Button>
            </form>
          </div>
        </header>

        <main className="mx-auto w-full max-w-xl flex-1 space-y-6 px-4 pb-nav pt-4 md:max-w-3xl lg:max-w-7xl lg:px-8 lg:pb-6 lg:pt-8">
          {children}
        </main>

        <BottomNav />
      </div>
    </div>
  );
}

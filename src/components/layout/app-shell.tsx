import { BottomNav } from "./bottom-nav";
import { SidebarNav } from "./sidebar-nav";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 lg:flex">
      <SidebarNav />

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur lg:hidden">
          <div className="mx-auto flex w-full max-w-xl items-center justify-between px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-500">Two-Year Plan</p>
              <h1 className="text-lg font-semibold">Goal Dashboard</h1>
            </div>
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </header>

        <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-nav pt-4 md:max-w-3xl lg:max-w-7xl lg:px-8 lg:pb-6 lg:pt-8">
          {children}
        </main>

        <BottomNav />
      </div>
    </div>
  );
}

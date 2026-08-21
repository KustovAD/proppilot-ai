"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Building2,
  Users,
  Contact,
  Handshake,
  CheckSquare,
  CalendarDays,
  LineChart,
  UsersRound,
  Settings,
  Menu,
  Search,
  Bell,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-store";
import { useCRM } from "@/lib/store";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/properties", label: "Properties", icon: Building2 },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/contacts", label: "Contacts", icon: Contact },
  { href: "/deals", label: "Deals", icon: Handshake },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/analytics", label: "Analytics", icon: LineChart },
  { href: "/team", label: "Team", icon: UsersRound },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="grid gap-0.5 px-3" aria-label="Primary">
      {NAV.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3 px-5 py-5">
      <span className="grid size-9 place-items-center rounded-full bg-sidebar-primary font-heading text-sm text-sidebar-primary-foreground">
        P
      </span>
      <span>
        <span className="block font-heading text-lg leading-none text-sidebar-foreground">
          PropPilot
        </span>
        <span className="text-[10px] tracking-[0.22em] text-sidebar-primary uppercase">
          AI
        </span>
      </span>
    </Link>
  );
}

function SidebarInner({ onNavigate }: { onNavigate?: () => void }) {
  const workspace = useCRM((s) => s.workspace);
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <Brand />
      <p className="px-5 pb-4 text-[11px] tracking-wide text-sidebar-foreground/50 uppercase">
        {workspace.name}
      </p>
      <NavLinks onNavigate={onNavigate} />
      <div className="mt-auto p-4">
        <div className="rounded-xl bg-sidebar-accent p-3 text-xs text-sidebar-foreground/80">
          <p className="font-medium text-sidebar-primary">Private desk</p>
          <p className="mt-1 leading-relaxed">
            AI copy uses listing facts only. Demo inventory is fictional.
          </p>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const authHydrated = useAuth((s) => s.hydrated);
  const crmHydrated = useCRM((s) => s.hydrated);
  const logout = useAuth((s) => s.logout);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (authHydrated && !user) router.replace("/login");
  }, [authHydrated, user, router]);

  if (!authHydrated || !crmHydrated || !user) {
    return (
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[260px_1fr]">
        <div className="hidden bg-sidebar md:block" />
        <div className="space-y-4 p-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/properties?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 md:block">
        <SidebarInner />
      </aside>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[280px] p-0" showCloseButton>
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <SidebarInner onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </Button>
          <form onSubmit={onSearch} className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search listings…"
              className="pl-8"
              aria-label="Search listings"
            />
          </form>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="hidden items-center gap-2 sm:flex">
              <Avatar className="size-8">
                <AvatarImage src={user.avatarUrl} alt="" />
                <AvatarFallback>{initials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="leading-tight">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-[11px] text-muted-foreground">{user.role}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Sign out"
              onClick={async () => {
                await logout();
                router.replace("/login");
              }}
            >
              <LogOut />
            </Button>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

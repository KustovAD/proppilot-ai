"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/lib/auth-store";
import { useCRM } from "@/lib/store";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const setAuthHydrated = useAuth((s) => s.setHydrated);
  const setCrmHydrated = useCRM((s) => s.setHydrated);

  useEffect(() => {
    if (useAuth.persist.hasHydrated()) setAuthHydrated(true);
    if (useCRM.persist.hasHydrated()) setCrmHydrated(true);
    const unsubAuth = useAuth.persist.onFinishHydration(() => setAuthHydrated(true));
    const unsubCrm = useCRM.persist.onFinishHydration(() => setCrmHydrated(true));
    return () => {
      unsubAuth();
      unsubCrm();
    };
  }, [setAuthHydrated, setCrmHydrated]);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider delay={200}>
        {children}
        <Toaster position="top-right" richColors />
      </TooltipProvider>
    </ThemeProvider>
  );
}

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/constants";
import type { SessionUser } from "@/lib/types";
import { createSupabaseBrowser } from "@/lib/supabase/client";

interface AuthState {
  user: SessionUser | null;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  loginDemo: (email: string, password: string) => { ok: boolean; error?: string };
  registerLocal: (input: {
    name: string;
    email: string;
    password: string;
    workspaceName: string;
  }) => { ok: boolean; error?: string };
  logout: () => Promise<void>;
  updateUser: (patch: Partial<SessionUser>) => void;
}

const DEMO_USER: SessionUser = {
  id: "usr_james",
  name: "James Whitmore",
  email: DEMO_EMAIL,
  role: "owner",
  agentId: "agt_01",
  workspaceId: "ws_meridian",
  avatarUrl: "https://i.pravatar.cc/256?img=12",
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      hydrated: false,
      setHydrated: (v) => set((s) => (s.hydrated === v ? s : { hydrated: v })),
      loginDemo: (email, password) => {
        if (email.toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
          set({ user: DEMO_USER });
          return { ok: true };
        }
        const existing = get().user;
        if (existing && existing.email.toLowerCase() === email.toLowerCase()) {
          set({ user: existing });
          return { ok: true };
        }
        const raw = localStorage.getItem("proppilot-local-users");
        const users: Array<{ email: string; password: string; user: SessionUser }> = raw
          ? JSON.parse(raw)
          : [];
        const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!found || found.password !== password) {
          return { ok: false, error: "Invalid email or password. Use the demo account to explore." };
        }
        set({ user: found.user });
        return { ok: true };
      },
      registerLocal: ({ name, email, password, workspaceName }) => {
        const raw = localStorage.getItem("proppilot-local-users");
        const users: Array<{ email: string; password: string; user: SessionUser }> = raw
          ? JSON.parse(raw)
          : [];
        if (users.some((u) => u.email.toLowerCase() === email.toLowerCase()) || email.toLowerCase() === DEMO_EMAIL) {
          return { ok: false, error: "An account with this email already exists." };
        }
        const user: SessionUser = {
          id: `usr_${crypto.randomUUID().slice(0, 8)}`,
          name,
          email,
          role: "owner",
          agentId: "agt_01",
          workspaceId: "ws_meridian",
          avatarUrl: `https://i.pravatar.cc/256?u=${encodeURIComponent(email)}`,
        };
        users.push({ email, password, user });
        localStorage.setItem("proppilot-local-users", JSON.stringify(users));
        set({ user });
        void workspaceName;
        return { ok: true };
      },
      logout: async () => {
        const supabase = createSupabaseBrowser();
        if (supabase) await supabase.auth.signOut();
        set({ user: null });
      },
      updateUser: (patch) => {
        const current = get().user;
        if (!current) return;
        set({ user: { ...current, ...patch } });
      },
    }),
    {
      name: "proppilot-auth",
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
      partialize: (s) => ({ user: s.user }),
    },
  ),
);

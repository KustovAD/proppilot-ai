"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, Field } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-store";
import { useCRM } from "@/lib/store";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/constants";

export default function SettingsPage() {
  const user = useAuth((s) => s.user);
  const updateUser = useAuth((s) => s.updateUser);
  const workspace = useCRM((s) => s.workspace);
  const updateWorkspace = useCRM((s) => s.updateWorkspace);
  const resetDemo = useCRM((s) => s.resetDemo);
  const [draftName, setDraftName] = useState<string | null>(null);
  const [wsName, setWsName] = useState(workspace.name);
  const [tagline, setTagline] = useState(workspace.tagline);
  const name = draftName ?? user?.name ?? "";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="House settings"
        title="Settings"
        description="Profile, workspace, and a clean reset of the fictional book."
      />

      <section className="rounded-2xl bg-card p-6 ring-1 ring-foreground/8">
        <h2 className="font-heading text-xl">Profile</h2>
        <div className="mt-4 grid max-w-lg gap-3">
          <Field label="Name">
            <Input value={name} onChange={(e) => setDraftName(e.target.value)} />
          </Field>
          <Field label="Email">
            <Input value={user?.email ?? ""} readOnly />
          </Field>
          <Button
            className="w-fit"
            onClick={() => {
              updateUser({ name });
              toast.success("Profile updated");
            }}
          >
            Save profile
          </Button>
        </div>
      </section>

      <section className="rounded-2xl bg-card p-6 ring-1 ring-foreground/8">
        <h2 className="font-heading text-xl">Workspace</h2>
        <div className="mt-4 grid max-w-lg gap-3">
          <Field label="Agency name">
            <Input value={wsName} onChange={(e) => setWsName(e.target.value)} />
          </Field>
          <Field label="Tagline">
            <Textarea rows={2} value={tagline} onChange={(e) => setTagline(e.target.value)} />
          </Field>
          <Button
            className="w-fit"
            onClick={() => {
              updateWorkspace({ name: wsName, tagline });
              toast.success("Workspace updated");
            }}
          >
            Save workspace
          </Button>
        </div>
      </section>

      <section className="rounded-2xl bg-card p-6 ring-1 ring-foreground/8">
        <h2 className="font-heading text-xl">Portfolio demo</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>Auth — local desk, no cloud account. Sign in as {DEMO_EMAIL} / {DEMO_PASSWORD}.</li>
          <li>Data — listings, leads, and deals live in this browser.</li>
          <li>AI copy — grounded writer using only recorded facts. No API key.</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="font-heading text-xl">Reset demo data</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Restores 20 listings, 30 leads, 10 agents, 40 activities, 20 appointments, and 10 deals.
          Local edits in this browser are discarded.
        </p>
        <Button
          variant="destructive"
          className="mt-4"
          onClick={() => {
            resetDemo();
            toast.success("Demo book restored");
          }}
        >
          Restore fictional inventory
        </Button>
      </section>
    </div>
  );
}

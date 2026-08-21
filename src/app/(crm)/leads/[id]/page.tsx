"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import { toast } from "sonner";
import { Sparkles, Pencil } from "lucide-react";
import { PageHeader, ErrorState, NativeSelect } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadStatusBadge, ScoreBadge } from "@/components/status-badge";
import { LeadFormDialog } from "@/components/leads/lead-form-dialog";
import { useCRM } from "@/lib/store";
import { useAuth } from "@/lib/auth-store";
import { compactMoney, money, relativeFmt } from "@/lib/format";
import { FOLLOW_UP_TONES } from "@/lib/constants";
import type { FollowUpResult, FollowUpTone, LeadScoreResult } from "@/lib/types";
import { Progress } from "@/components/ui/progress";

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const leads = useCRM((s) => s.leads);
  const agents = useCRM((s) => s.agents);
  const properties = useCRM((s) => s.properties);
  const leadActivities = useCRM((s) => s.leadActivities);
  const updateLead = useCRM((s) => s.updateLead);
  const addActivity = useCRM((s) => s.addActivity);
  const addGeneration = useCRM((s) => s.addGeneration);
  const user = useAuth((s) => s.user);

  const lead = useMemo(() => leads.find((l) => l.id === id), [leads, id]);
  const agent = useMemo(
    () => agents.find((a) => a.id === lead?.assignedAgentId),
    [agents, lead?.assignedAgentId],
  );
  const property = useMemo(
    () => properties.find((p) => p.id === lead?.interestedPropertyId),
    [properties, lead?.interestedPropertyId],
  );
  const activities = useMemo(
    () => leadActivities.filter((a) => a.leadId === id),
    [leadActivities, id],
  );
  const [edit, setEdit] = useState(false);
  const [tone, setTone] = useState<FollowUpTone>("Professional");
  const [score, setScore] = useState<LeadScoreResult | null>(null);
  const [follow, setFollow] = useState<FollowUpResult | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  if (!lead) {
    return (
      <ErrorState
        title="Lead not found"
        description="This file is not in the current workspace."
        action={
          <Link href="/leads" className="text-sm text-primary hover:underline">
            Back to leads
          </Link>
        }
      />
    );
  }

  const file = lead;

  async function rescore() {
    setBusy("score");
    try {
      const res = await fetch("/api/ai/lead-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead: file, properties, activities }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setScore(json.result);
      updateLead(file.id, {
        score: json.result.score,
        scoreReason: json.result.reason,
        nextAction: json.result.nextAction,
      });
      addGeneration({
        kind: "lead_score",
        targetType: "lead",
        targetId: file.id,
        prompt: "rescore",
        output: JSON.stringify(json.result),
        model: json.model,
      });
      toast.success("Scored from budget, location, and activity");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Score failed");
    } finally {
      setBusy(null);
    }
  }

  async function followUp() {
    setBusy("follow");
    try {
      const res = await fetch("/api/ai/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead: file, property, activities, tone }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setFollow(json.result);
      addGeneration({
        kind: "follow_up",
        targetType: "lead",
        targetId: file.id,
        prompt: tone,
        output: JSON.stringify(json.result),
        model: json.model,
      });
      if (user) {
        addActivity({
          leadId: file.id,
          agentId: user.agentId,
          type: "follow_up",
          title: `Follow-up drafted (${tone})`,
          body: json.result.email.subject,
        });
      }
      toast.success("Follow-up drafted from the file");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Follow-up failed");
    } finally {
      setBusy(null);
    }
  }

  const breakdown = score?.breakdown;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Lead file"
        title={lead.name}
        description={`${lead.email} · ${lead.phone}`}
        actions={
          <>
            <Button variant="outline" className="h-9" onClick={() => setEdit(true)}>
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button className="h-9" onClick={rescore} disabled={!!busy}>
              <Sparkles className="size-4" />
              {busy === "score" ? "Scoring…" : "Rescore"}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl bg-card p-6 ring-1 ring-foreground/8 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <LeadStatusBadge status={lead.status} />
            <ScoreBadge score={lead.score} />
            <span className="text-xs text-muted-foreground">{lead.source}</span>
          </div>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Budget</dt>
              <dd>
                {money(lead.budgetMin)} – {money(lead.budgetMax)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Preference</dt>
              <dd>
                {lead.propertyType} in {lead.preferredLocation}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Timeline</dt>
              <dd>{lead.timeline}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Agent</dt>
              <dd>{agent?.name}</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-muted-foreground">{lead.notes}</p>
          {property ? (
            <Link href={`/properties/${property.id}`} className="mt-4 inline-block text-sm text-primary hover:underline">
              Interested in {property.title} · {compactMoney(property.price)}
            </Link>
          ) : null}
        </div>
        <div className="rounded-3xl bg-forest p-6 text-sidebar-foreground">
          <p className="text-[11px] tracking-[0.18em] text-sidebar-primary uppercase">Score</p>
          <p className="mt-2 font-heading text-5xl">{lead.score}</p>
          <p className="mt-3 text-sm text-sidebar-foreground/80">{lead.scoreReason}</p>
          <p className="mt-4 text-sm">
            <span className="text-sidebar-primary">Next:</span> {lead.nextAction}
          </p>
          {breakdown ? (
            <div className="mt-5 space-y-2">
              {Object.entries(breakdown).map(([k, v]) => (
                <div key={k}>
                  <div className="flex justify-between text-[11px] uppercase opacity-70">
                    <span>{k}</span>
                    <span>{v}</span>
                  </div>
                  <Progress value={v * 4} className="h-1.5" />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl bg-card p-6 ring-1 ring-foreground/8">
          <h2 className="font-heading text-2xl">Activity</h2>
          <ol className="mt-4 space-y-3">
            {activities.map((a) => (
              <li key={a.id} className="border-l-2 border-primary/30 pl-3">
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.body}</p>
                <p className="text-[11px] text-muted-foreground">{relativeFmt(a.createdAt)}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-3xl bg-card p-6 ring-1 ring-foreground/8">
          <h2 className="font-heading text-2xl">AI follow-up</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Uses lead facts, the linked listing, and prior interactions. Tone is yours.
          </p>
          <div className="mt-3 flex gap-2">
            <NativeSelect
              value={tone}
              onChange={(e) => setTone(e.target.value as FollowUpTone)}
              className="w-40"
            >
              {FOLLOW_UP_TONES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </NativeSelect>
            <Button onClick={followUp} disabled={!!busy}>
              {busy === "follow" ? "Drafting…" : "Generate"}
            </Button>
          </div>
          {follow ? (
            <Tabs defaultValue="email" className="mt-4">
              <TabsList>
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="sms">SMS</TabsTrigger>
                <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
              </TabsList>
              <TabsContent value="email">
                <p className="text-sm font-medium">{follow.email.subject}</p>
                <Textarea readOnly rows={10} className="mt-2" value={follow.email.body} />
              </TabsContent>
              <TabsContent value="sms">
                <Textarea readOnly rows={4} value={follow.sms} />
              </TabsContent>
              <TabsContent value="whatsapp">
                <Textarea readOnly rows={6} value={follow.whatsapp} />
              </TabsContent>
            </Tabs>
          ) : null}
        </div>
      </div>

      <LeadFormDialog open={edit} onOpenChange={setEdit} lead={lead} />
    </div>
  );
}

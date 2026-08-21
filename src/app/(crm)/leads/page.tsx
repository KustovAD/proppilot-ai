"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader, EmptyState, NativeSelect } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadStatusBadge, ScoreBadge } from "@/components/status-badge";
import { LeadFormDialog } from "@/components/leads/lead-form-dialog";
import { LeadKanban } from "@/components/leads/lead-kanban";
import { useCRM } from "@/lib/store";
import { LEAD_SOURCES, LEAD_STATUSES } from "@/lib/constants";
import { compactMoney } from "@/lib/format";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LeadsPage() {
  const router = useRouter();
  const leads = useCRM((s) => s.leads);
  const agents = useCRM((s) => s.agents);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [source, setSource] = useState("all");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () =>
      leads.filter((l) => {
        const hay = `${l.name} ${l.email} ${l.preferredLocation}`.toLowerCase();
        if (q && !hay.includes(q.toLowerCase())) return false;
        if (status !== "all" && l.status !== status) return false;
        if (source !== "all" && l.source !== source) return false;
        return true;
      }),
    [leads, q, status, source],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Demand"
        title="Leads"
        description="Score, assign, and move files. The Kanban writes the new status immediately."
        actions={
          <Button className="h-9" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            New lead
          </Button>
        }
      />

      <Tabs defaultValue="board">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <TabsList>
            <TabsTrigger value="board">Pipeline</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>
          <div className="flex flex-wrap gap-2">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search leads…"
              className="w-48"
            />
            <NativeSelect value={status} onChange={(e) => setStatus(e.target.value)} className="w-36">
              <option value="all">All statuses</option>
              {LEAD_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </NativeSelect>
            <NativeSelect value={source} onChange={(e) => setSource(e.target.value)} className="w-36">
              <option value="all">All sources</option>
              {LEAD_SOURCES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </NativeSelect>
          </div>
        </div>
        <TabsContent value="board" className="mt-4">
          <LeadKanban />
        </TabsContent>
        <TabsContent value="table" className="mt-4">
          {filtered.length === 0 ? (
            <EmptyState title="No leads" description="Adjust filters or add a lead to the book." />
          ) : (
            <div className="overflow-x-auto rounded-2xl bg-card ring-1 ring-foreground/8">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Budget</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Agent</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((l) => (
                    <tr key={l.id} className="hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <Link href={`/leads/${l.id}`} className="font-medium hover:underline">
                          {l.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{l.email}</p>
                      </td>
                      <td className="px-4 py-3">{l.preferredLocation}</td>
                      <td className="px-4 py-3">{compactMoney(l.budgetMax)}</td>
                      <td className="px-4 py-3">{l.source}</td>
                      <td className="px-4 py-3">
                        <LeadStatusBadge status={l.status} />
                      </td>
                      <td className="px-4 py-3">
                        <ScoreBadge score={l.score} />
                      </td>
                      <td className="px-4 py-3">
                        {agents.find((a) => a.id === l.assignedAgentId)?.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <LeadFormDialog
        open={open}
        onOpenChange={setOpen}
        onSaved={(id) => {
          toast.success("Lead saved");
          router.push(`/leads/${id}`);
        }}
      />
    </div>
  );
}

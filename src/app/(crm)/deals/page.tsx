"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { PageHeader, EmptyState, Field, NativeSelect, StatCard } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DealStageBadge } from "@/components/status-badge";
import { useCRM } from "@/lib/store";
import { dealSchema, formResolver, type DealInput } from "@/lib/validations";
import { DEAL_STAGES } from "@/lib/constants";
import { compactMoney, dateFmt, money } from "@/lib/format";
import type { DealStage } from "@/lib/types";

export default function DealsPage() {
  const deals = useCRM((s) => s.deals);
  const leads = useCRM((s) => s.leads);
  const properties = useCRM((s) => s.properties);
  const agents = useCRM((s) => s.agents);
  const addDeal = useCRM((s) => s.addDeal);
  const updateDeal = useCRM((s) => s.updateDeal);
  const [open, setOpen] = useState(false);
  const form = useForm<DealInput>({
    resolver: formResolver(dealSchema),
    defaultValues: {
      title: "",
      leadId: leads[0]?.id ?? "",
      propertyId: properties[0]?.id ?? "",
      agentId: agents[0]?.id ?? "",
      stage: "Qualified",
      value: 1000000,
      commissionRate: 2,
      expectedClose: "2026-09-15",
      notes: "",
    },
  });

  const openValue = useMemo(
    () => deals.filter((d) => !d.stage.startsWith("Closed")).reduce((s, d) => s + d.value, 0),
    [deals],
  );
  const commission = useMemo(
    () =>
      deals
        .filter((d) => d.stage !== "Closed Lost")
        .reduce((s, d) => s + d.value * (d.commissionRate / 100), 0),
    [deals],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Mandate"
        title="Deals"
        description="Files in motion, expected close, and the commission still attached."
        actions={
          <Button className="h-9" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            New deal
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Open volume" value={compactMoney(openValue)} />
        <StatCard label="Expected commission" value={compactMoney(commission)} />
        <StatCard label="Files" value={String(deals.length)} />
      </div>
      {deals.length === 0 ? (
        <EmptyState title="No deals" description="Attach a lead to a listing to open a file." />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-card ring-1 ring-foreground/8">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3">Deal</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Commission</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Close</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {deals.map((d) => (
                <tr key={d.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{d.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {properties.find((p) => p.id === d.propertyId)?.title} ·{" "}
                      {agents.find((a) => a.id === d.agentId)?.name}
                    </p>
                  </td>
                  <td className="px-4 py-3">{money(d.value)}</td>
                  <td className="px-4 py-3">
                    {money(d.value * (d.commissionRate / 100))} ({d.commissionRate}%)
                  </td>
                  <td className="px-4 py-3">
                    <NativeSelect
                      className="h-7 w-40"
                      value={d.stage}
                      onChange={(e) => {
                        updateDeal(d.id, { stage: e.target.value as DealStage });
                        toast.success("Stage updated");
                      }}
                    >
                      {DEAL_STAGES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </NativeSelect>
                    <div className="mt-1">
                      <DealStageBadge stage={d.stage} />
                    </div>
                  </td>
                  <td className="px-4 py-3">{dateFmt(d.expectedClose)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New deal</DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={form.handleSubmit((values) => {
              addDeal({ ...values, notes: values.notes ?? "" });
              toast.success("Deal opened");
              setOpen(false);
            })}
          >
            <Field label="Title" error={form.formState.errors.title?.message}>
              <Input {...form.register("title")} />
            </Field>
            <Field label="Lead">
              <NativeSelect {...form.register("leadId")}>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Property">
              <NativeSelect {...form.register("propertyId")}>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Agent">
              <NativeSelect {...form.register("agentId")}>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Value">
                <Input type="number" {...form.register("value")} />
              </Field>
              <Field label="Commission %">
                <Input type="number" step="0.25" {...form.register("commissionRate")} />
              </Field>
            </div>
            <Field label="Expected close">
              <Input type="date" {...form.register("expectedClose")} />
            </Field>
            <Field label="Notes">
              <Textarea rows={3} {...form.register("notes")} />
            </Field>
            <Button type="submit">Save deal</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

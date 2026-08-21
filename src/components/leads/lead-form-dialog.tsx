"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, NativeSelect } from "@/components/ui-kit";
import { formResolver, leadSchema, type LeadInput } from "@/lib/validations";
import { LEAD_SOURCES, LEAD_STATUSES, PROPERTY_TYPES } from "@/lib/constants";
import { useCRM } from "@/lib/store";
import type { Lead } from "@/lib/types";

export function LeadFormDialog({
  open,
  onOpenChange,
  lead,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lead?: Lead;
  onSaved?: (id: string) => void;
}) {
  const agents = useCRM((s) => s.agents);
  const properties = useCRM((s) => s.properties);
  const addLead = useCRM((s) => s.addLead);
  const updateLead = useCRM((s) => s.updateLead);
  const form = useForm<LeadInput>({
    resolver: formResolver(leadSchema),
    values: lead
      ? {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          budgetMin: lead.budgetMin,
          budgetMax: lead.budgetMax,
          preferredLocation: lead.preferredLocation,
          propertyType: lead.propertyType,
          source: lead.source,
          status: lead.status,
          assignedAgentId: lead.assignedAgentId,
          interestedPropertyId: lead.interestedPropertyId,
          timeline: lead.timeline,
          notes: lead.notes,
        }
      : {
          name: "",
          email: "",
          phone: "",
          budgetMin: 500000,
          budgetMax: 1500000,
          preferredLocation: "London",
          propertyType: "Apartment",
          source: "Website",
          status: "New",
          assignedAgentId: agents[0]?.id ?? "",
          timeline: "90 days",
          notes: "",
        },
  });

  function onSubmit(values: LeadInput) {
    if (lead) {
      updateLead(lead.id, values);
      onSaved?.(lead.id);
    } else {
      const id = addLead({
        ...values,
        notes: values.notes ?? "",
      });
      onSaved?.(id);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{lead ? "Edit lead" : "New lead"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
          <Field label="Name" error={form.formState.errors.name?.message}>
            <Input {...form.register("name")} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Email">
              <Input type="email" {...form.register("email")} />
            </Field>
            <Field label="Phone">
              <Input {...form.register("phone")} />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Budget min">
              <Input type="number" {...form.register("budgetMin")} />
            </Field>
            <Field label="Budget max">
              <Input type="number" {...form.register("budgetMax")} />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Preferred location">
              <Input {...form.register("preferredLocation")} />
            </Field>
            <Field label="Property type">
              <NativeSelect {...form.register("propertyType")}>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </NativeSelect>
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Source">
              <NativeSelect {...form.register("source")}>
                {LEAD_SOURCES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Status">
              <NativeSelect {...form.register("status")}>
                {LEAD_STATUSES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Agent">
              <NativeSelect {...form.register("assignedAgentId")}>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </NativeSelect>
            </Field>
          </div>
          <Field label="Interested property">
            <NativeSelect {...form.register("interestedPropertyId")}>
              <option value="">None</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Timeline">
            <Input {...form.register("timeline")} />
          </Field>
          <Field label="Notes">
            <Textarea rows={3} {...form.register("notes")} />
          </Field>
          <Button type="submit" className="h-9">
            Save lead
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

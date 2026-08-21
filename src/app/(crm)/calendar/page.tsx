"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { addDays, isSameDay, isWithinInterval, parseISO, startOfDay } from "date-fns";
import { Plus } from "lucide-react";
import { PageHeader, EmptyState, Field, NativeSelect } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCRM } from "@/lib/store";
import { appointmentSchema, type AppointmentInput } from "@/lib/validations";
import { APPOINTMENT_TYPES } from "@/lib/constants";
import { dateTimeFmt, dayLabel, timeFmt } from "@/lib/format";

const TODAY = startOfDay(new Date("2026-08-18"));

export default function CalendarPage() {
  const appointments = useCRM((s) => s.appointments);
  const agents = useCRM((s) => s.agents);
  const leads = useCRM((s) => s.leads);
  const properties = useCRM((s) => s.properties);
  const addAppointment = useCRM((s) => s.addAppointment);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Date | undefined>(TODAY);
  const form = useForm<AppointmentInput>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      title: "",
      type: "Property Viewing",
      startAt: "2026-08-19T10:00",
      endAt: "2026-08-19T11:00",
      location: "",
      notes: "",
      agentId: agents[0]?.id ?? "",
    },
  });

  const upcoming = useMemo(
    () =>
      appointments
        .filter((a) => parseISO(a.startAt) >= TODAY)
        .sort((a, b) => a.startAt.localeCompare(b.startAt)),
    [appointments],
  );
  const today = upcoming.filter((a) => isSameDay(parseISO(a.startAt), TODAY));
  const week = upcoming.filter((a) =>
    isWithinInterval(parseISO(a.startAt), { start: TODAY, end: addDays(TODAY, 7) }),
  );
  const onDay = selected
    ? appointments.filter((a) => isSameDay(parseISO(a.startAt), selected))
    : [];
  const marked = appointments.map((a) => parseISO(a.startAt));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Diary"
        title="Calendar"
        description="Viewings, calls, meetings, and follow-ups for the private desk."
        actions={
          <Button className="h-9" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            New appointment
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="rounded-2xl bg-card p-4 ring-1 ring-foreground/8">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={setSelected}
            defaultMonth={TODAY}
            modifiers={{ booked: marked }}
            modifiersClassNames={{ booked: "bg-primary/15 text-primary font-medium" }}
          />
          <p className="mt-3 text-xs text-muted-foreground">Gold days carry a booking.</p>
        </div>
        <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/8">
          <h2 className="font-heading text-xl">
            {selected ? dayLabel(selected.toISOString()) : "Select a day"}
          </h2>
          {onDay.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No appointments on this day.</p>
          ) : (
            <ul className="mt-4 divide-y">
              {onDay.map((a) => (
                <li key={a.id} className="py-3">
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.type} · {timeFmt(a.startAt)}–{timeFmt(a.endAt)} · {a.location}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">This week</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>
        {(["today", "week", "upcoming"] as const).map((key) => {
          const list = key === "today" ? today : key === "week" ? week : upcoming;
          return (
            <TabsContent key={key} value={key}>
              {list.length === 0 ? (
                <EmptyState title="Clear diary" description="Nothing booked in this window." />
              ) : (
                <ul className="divide-y rounded-2xl bg-card ring-1 ring-foreground/8">
                  {list.map((a) => (
                    <li key={a.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{a.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {a.type} · {a.location} · {agents.find((x) => x.id === a.agentId)?.name}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">{dateTimeFmt(a.startAt)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New appointment</DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={form.handleSubmit((values) => {
              addAppointment({
                ...values,
                notes: values.notes ?? "",
                startAt: new Date(values.startAt).toISOString(),
                endAt: new Date(values.endAt).toISOString(),
                leadId: values.leadId || undefined,
                propertyId: values.propertyId || undefined,
              });
              toast.success("Appointment booked");
              setOpen(false);
            })}
          >
            <Field label="Title" error={form.formState.errors.title?.message}>
              <Input {...form.register("title")} />
            </Field>
            <Field label="Type">
              <NativeSelect {...form.register("type")}>
                {APPOINTMENT_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </NativeSelect>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start">
                <Input type="datetime-local" {...form.register("startAt")} />
              </Field>
              <Field label="End">
                <Input type="datetime-local" {...form.register("endAt")} />
              </Field>
            </div>
            <Field label="Location">
              <Input {...form.register("location")} />
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
            <Field label="Lead (optional)">
              <NativeSelect {...form.register("leadId")}>
                <option value="">None</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Property (optional)">
              <NativeSelect {...form.register("propertyId")}>
                <option value="">None</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Notes">
              <Textarea rows={3} {...form.register("notes")} />
            </Field>
            <Button type="submit">Save appointment</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

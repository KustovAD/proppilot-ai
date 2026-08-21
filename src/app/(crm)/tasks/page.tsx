"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { PageHeader, EmptyState, Field, NativeSelect } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PriorityBadge } from "@/components/status-badge";
import { useCRM } from "@/lib/store";
import { taskSchema, type TaskInput } from "@/lib/validations";
import { TASK_PRIORITIES } from "@/lib/constants";
import { dateTimeFmt } from "@/lib/format";

export default function TasksPage() {
  const tasks = useCRM((s) => s.tasks);
  const agents = useCRM((s) => s.agents);
  const addTask = useCRM((s) => s.addTask);
  const toggleTask = useCRM((s) => s.toggleTask);
  const deleteTask = useCRM((s) => s.deleteTask);
  const [filter, setFilter] = useState<"open" | "all" | "done">("open");
  const [open, setOpen] = useState(false);
  const form = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      dueAt: "2026-08-19T10:00",
      priority: "Medium",
      agentId: agents[0]?.id ?? "",
    },
  });

  const filtered = useMemo(
    () =>
      tasks.filter((t) => {
        if (filter === "open") return !t.completed;
        if (filter === "done") return t.completed;
        return true;
      }),
    [tasks, filter],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Tasks"
        description="The quiet work that keeps a private desk honest."
        actions={
          <Button className="h-9" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            New task
          </Button>
        }
      />
      <div className="flex gap-2">
        {(["open", "all", "done"] as const).map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
            {f}
          </Button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="Inbox clear" description="No tasks in this view." />
      ) : (
        <ul className="divide-y rounded-2xl bg-card ring-1 ring-foreground/8">
          {filtered.map((t) => (
            <li key={t.id} className="flex items-start gap-3 px-4 py-3">
              <Checkbox
                checked={t.completed}
                onCheckedChange={() => toggleTask(t.id)}
                aria-label={`Complete ${t.title}`}
              />
              <div className="flex-1">
                <p className={`text-sm font-medium ${t.completed ? "text-muted-foreground line-through" : ""}`}>
                  {t.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t.description} · {dateTimeFmt(t.dueAt)} · {agents.find((a) => a.id === t.agentId)?.name}
                </p>
              </div>
              <PriorityBadge priority={t.priority} />
              <Button variant="ghost" size="sm" onClick={() => deleteTask(t.id)}>
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New task</DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={form.handleSubmit((values) => {
              addTask({
                ...values,
                description: values.description ?? "",
                completed: false,
                dueAt: new Date(values.dueAt).toISOString(),
              });
              toast.success("Task added");
              setOpen(false);
            })}
          >
            <Field label="Title" error={form.formState.errors.title?.message}>
              <Input {...form.register("title")} />
            </Field>
            <Field label="Description">
              <Textarea rows={3} {...form.register("description")} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Due">
                <Input type="datetime-local" {...form.register("dueAt")} />
              </Field>
              <Field label="Priority">
                <NativeSelect {...form.register("priority")}>
                  {TASK_PRIORITIES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </NativeSelect>
              </Field>
            </div>
            <Field label="Agent">
              <NativeSelect {...form.register("agentId")}>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Button type="submit">Save task</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

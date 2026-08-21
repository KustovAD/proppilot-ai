"use client";

import Link from "next/link";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { LEAD_STATUSES } from "@/lib/constants";
import type { Lead, LeadStatus } from "@/lib/types";
import { useCRM } from "@/lib/store";
import { useAuth } from "@/lib/auth-store";
import { compactMoney } from "@/lib/format";
import { ScoreBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";

function Card({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab rounded-xl bg-background p-3 ring-1 ring-foreground/8 active:cursor-grabbing",
        isDragging && "opacity-70",
      )}
    >
      <Link href={`/leads/${lead.id}`} className="block" onClick={(e) => e.stopPropagation()}>
        <p className="text-sm font-medium">{lead.name}</p>
      </Link>
      <p className="mt-1 text-xs text-muted-foreground">
        {lead.preferredLocation} · {lead.propertyType}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs">{compactMoney(lead.budgetMax)}</span>
        <ScoreBadge score={lead.score} />
      </div>
    </div>
  );
}

function Column({ status, leads }: { status: LeadStatus; leads: Lead[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[420px] min-w-[240px] flex-1 flex-col rounded-2xl bg-muted/50 p-3",
        isOver && "ring-2 ring-primary/40",
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-medium tracking-[0.14em] uppercase">{status}</h3>
        <span className="text-xs text-muted-foreground">{leads.length}</span>
      </div>
      <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {leads.map((l) => (
            <Card key={l.id} lead={l} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export function LeadKanban() {
  const leads = useCRM((s) => s.leads);
  const updateLeadStatus = useCRM((s) => s.updateLeadStatus);
  const user = useAuth((s) => s.user);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || !user) return;
    const overId = String(over.id);
    const lead = leads.find((l) => l.id === active.id);
    if (!lead) return;
    const isColumn = LEAD_STATUSES.includes(overId as LeadStatus);
    let status: LeadStatus | undefined = isColumn ? (overId as LeadStatus) : undefined;
    if (!status) {
      const overLead = leads.find((l) => l.id === overId);
      status = overLead?.status;
    }
    if (status && status !== lead.status) {
      updateLeadStatus(lead.id, status, user.agentId);
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {LEAD_STATUSES.map((status) => (
          <Column
            key={status}
            status={status}
            leads={leads.filter((l) => l.status === status)}
          />
        ))}
      </div>
    </DndContext>
  );
}

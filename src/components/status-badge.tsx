import { cn } from "@/lib/utils";
import type { LeadStatus, PropertyStatus, DealStage, TaskPriority } from "@/lib/types";

const propertyMap: Record<PropertyStatus, string> = {
  Draft: "bg-muted text-muted-foreground",
  Active: "bg-emerald-700/12 text-emerald-800 dark:text-emerald-300",
  "Under Offer": "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  Sold: "bg-primary/12 text-primary",
  Archived: "bg-stone-500/10 text-stone-600",
};

const leadMap: Record<LeadStatus, string> = {
  New: "bg-sky-600/12 text-sky-800 dark:text-sky-300",
  Contacted: "bg-teal-700/12 text-teal-800 dark:text-teal-300",
  Viewing: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  Negotiating: "bg-orange-600/12 text-orange-800 dark:text-orange-300",
  Won: "bg-emerald-700/12 text-emerald-800 dark:text-emerald-300",
  Lost: "bg-rose-600/12 text-rose-800 dark:text-rose-300",
};

const dealMap: Record<DealStage, string> = {
  Qualified: "bg-sky-600/12 text-sky-800",
  Proposal: "bg-teal-700/12 text-teal-800",
  Negotiation: "bg-amber-500/15 text-amber-800",
  "Due Diligence": "bg-orange-600/12 text-orange-800",
  "Closed Won": "bg-emerald-700/12 text-emerald-800",
  "Closed Lost": "bg-rose-600/12 text-rose-800",
};

const priorityMap: Record<TaskPriority, string> = {
  Low: "bg-muted text-muted-foreground",
  Medium: "bg-sky-600/12 text-sky-800",
  High: "bg-amber-500/15 text-amber-800",
  Urgent: "bg-rose-600/12 text-rose-800",
};

function Pill({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full px-2 text-[11px] font-medium tracking-wide",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function PropertyStatusBadge({ status }: { status: PropertyStatus }) {
  return <Pill className={propertyMap[status]}>{status}</Pill>;
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return <Pill className={leadMap[status]}>{status}</Pill>;
}

export function DealStageBadge({ stage }: { stage: DealStage }) {
  return <Pill className={dealMap[stage]}>{stage}</Pill>;
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return <Pill className={priorityMap[priority]}>{priority}</Pill>;
}

export function ScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 75
      ? "bg-emerald-700/12 text-emerald-800"
      : score >= 50
        ? "bg-amber-500/15 text-amber-800"
        : "bg-rose-600/12 text-rose-800";
  return <Pill className={cls}>{score}</Pill>;
}

"use client";

import { PageHeader } from "@/components/ui-kit";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useCRM } from "@/lib/store";
import { initials } from "@/lib/format";
import { toast } from "sonner";

export default function TeamPage() {
  const agents = useCRM((s) => s.agents);
  const properties = useCRM((s) => s.properties);
  const leads = useCRM((s) => s.leads);
  const deals = useCRM((s) => s.deals);
  const upsertAgent = useCRM((s) => s.upsertAgent);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="House"
        title="Team"
        description="Ten advisors across London, the Gulf, and the Americas — fictional, for the demo book."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((a) => {
          const listings = properties.filter((p) => p.agentId === a.id).length;
          const aLeads = leads.filter((l) => l.assignedAgentId === a.id).length;
          const aDeals = deals.filter((d) => d.agentId === a.id).length;
          return (
            <article key={a.id} className="rounded-2xl bg-card p-5 ring-1 ring-foreground/8">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <Avatar className="size-12">
                    <AvatarImage src={a.avatarUrl} alt="" />
                    <AvatarFallback>{initials(a.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-heading text-xl">{a.name}</h2>
                    <p className="text-xs text-muted-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.city} · {a.role}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={a.active}
                  onCheckedChange={(checked) => {
                    upsertAgent({ ...a, active: Boolean(checked) });
                    toast.success(checked ? `${a.name} is active` : `${a.name} paused`);
                  }}
                  aria-label={`Active status for ${a.name}`}
                />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{a.bio}</p>
              <div className="mt-4 flex flex-wrap gap-1">
                {a.specializations.map((s) => (
                  <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-[11px]">
                    {s}
                  </span>
                ))}
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-muted/60 py-2">
                  <dt className="text-muted-foreground">Listings</dt>
                  <dd className="font-heading text-lg">{listings}</dd>
                </div>
                <div className="rounded-lg bg-muted/60 py-2">
                  <dt className="text-muted-foreground">Leads</dt>
                  <dd className="font-heading text-lg">{aLeads}</dd>
                </div>
                <div className="rounded-lg bg-muted/60 py-2">
                  <dt className="text-muted-foreground">Deals</dt>
                  <dd className="font-heading text-lg">{aDeals}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-muted-foreground">
                {a.email} · {a.phone}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}

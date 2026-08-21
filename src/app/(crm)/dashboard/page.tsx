"use client";

import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";
import { addDays, format, parseISO, isAfter, isBefore } from "date-fns";
import { Building2, Users, Handshake, Coins, ArrowUpRight } from "lucide-react";
import { PageHeader, StatCard } from "@/components/ui-kit";
import { useCRM } from "@/lib/store";
import { compactMoney, dateTimeFmt, money, relativeFmt } from "@/lib/format";
import { LeadStatusBadge, PropertyStatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PIE = ["#8a6a3d", "#2f4a42", "#c4a574", "#6b8f85", "#4a3728", "#9aa39a"];

export default function DashboardPage() {
  const properties = useCRM((s) => s.properties);
  const leads = useCRM((s) => s.leads);
  const deals = useCRM((s) => s.deals);
  const appointments = useCRM((s) => s.appointments);
  const activities = useCRM((s) => s.leadActivities);
  const agents = useCRM((s) => s.agents);

  const activeListings = properties.filter((p) => p.status === "Active").length;
  const newLeads = leads.filter((l) => l.status === "New").length;
  const openDeals = deals.filter((d) => !d.stage.startsWith("Closed")).length;
  const expectedCommission = deals
    .filter((d) => !d.stage.startsWith("Closed Lost"))
    .reduce((sum, d) => sum + d.value * (d.commissionRate / 100), 0);

  const leadTrend = Array.from({ length: 8 }).map((_, i) => {
    const start = addDays(new Date("2026-08-18"), -49 + i * 7);
    const end = addDays(start, 7);
    const count = leads.filter((l) => {
      const c = parseISO(l.createdAt);
      return isAfter(c, start) && isBefore(c, end);
    }).length;
    return { name: format(start, "MMM d"), leads: count + (i % 3) };
  });

  const pipeline = ["New", "Contacted", "Viewing", "Negotiating", "Won", "Lost"].map(
    (status) => ({
      name: status,
      value: leads.filter((l) => l.status === status).length,
    }),
  );

  const views = properties
    .slice()
    .sort((a, b) => b.views - a.views)
    .slice(0, 6)
    .map((p) => ({ name: p.city, views: p.views }));

  const conversion =
    leads.length === 0
      ? 0
      : Math.round((leads.filter((l) => l.status === "Won").length / leads.length) * 100);

  const upcoming = appointments
    .filter((a) => new Date(a.startAt).getTime() >= Date.parse("2026-08-18T00:00:00.000Z"))
    .sort((a, b) => a.startAt.localeCompare(b.startAt))
    .slice(0, 5);

  const recent = activities.slice(0, 6);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Desk"
        title="Good afternoon, Meridian."
        description="Active inventory, incoming demand, and the commission still in motion."
        actions={
          <Link href="/properties" className={cn(buttonVariants(), "h-9 px-3")}>
            New listing
            <ArrowUpRight className="size-4" />
          </Link>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active listings"
          value={String(activeListings)}
          hint={`${properties.length} total in the book`}
          icon={<Building2 className="size-4" />}
        />
        <StatCard
          label="New leads"
          value={String(newLeads)}
          hint={`${leads.length} in the pipeline`}
          icon={<Users className="size-4" />}
        />
        <StatCard
          label="Open deals"
          value={String(openDeals)}
          hint={`${deals.length} files this quarter`}
          icon={<Handshake className="size-4" />}
        />
        <StatCard
          label="Expected commission"
          value={compactMoney(expectedCommission)}
          hint="Open + won files"
          icon={<Coins className="size-4" />}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Leads over time">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={leadTrend}>
              <defs>
                <linearGradient id="leads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8a6a3d" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#8a6a3d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="leads" stroke="#8a6a3d" fill="url(#leads)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Deals pipeline">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pipeline} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88}>
                {pipeline.map((_, i) => (
                  <Cell key={i} fill={PIE[i % PIE.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Property views">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={views}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="views" fill="#2f4a42" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Conversion rate">
          <div className="flex h-[240px] flex-col items-center justify-center">
            <p className="font-heading text-6xl">{conversion}%</p>
            <p className="mt-2 text-sm text-muted-foreground">Won leads / all leads</p>
            <Link href="/analytics" className="mt-4 text-sm text-primary hover:underline">
              Open analytics
            </Link>
          </div>
        </ChartCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/8">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl">Upcoming appointments</h2>
            <Link href="/calendar" className="text-sm text-primary hover:underline">
              Calendar
            </Link>
          </div>
          <ul className="mt-4 divide-y">
            {upcoming.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.type} · {a.location}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground whitespace-nowrap">
                  {dateTimeFmt(a.startAt)}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/8">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl">Recent activity</h2>
            <Link href="/leads" className="text-sm text-primary hover:underline">
              Leads
            </Link>
          </div>
          <ul className="mt-4 divide-y">
            {recent.map((a) => {
              const lead = leads.find((l) => l.id === a.leadId);
              const agent = agents.find((x) => x.id === a.agentId);
              return (
                <li key={a.id} className="py-3">
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {lead?.name} · {agent?.name} · {relativeFmt(a.createdAt)}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/8">
        <h2 className="font-heading text-xl">Live listings</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {properties
            .filter((p) => p.status === "Active")
            .slice(0, 6)
            .map((p) => (
              <Link
                key={p.id}
                href={`/properties/${p.id}`}
                className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-muted"
              >
                <span>
                  <span className="block text-sm font-medium">{p.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {p.city} · {money(p.price)}
                  </span>
                </span>
                <PropertyStatusBadge status={p.status} />
              </Link>
            ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {leads.slice(0, 8).map((l) => (
            <Link key={l.id} href={`/leads/${l.id}`}>
              <LeadStatusBadge status={l.status} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/8">
      <h2 className="mb-4 font-heading text-xl">{title}</h2>
      {children}
    </div>
  );
}

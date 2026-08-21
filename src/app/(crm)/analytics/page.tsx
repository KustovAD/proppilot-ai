"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader, StatCard } from "@/components/ui-kit";
import { useCRM } from "@/lib/store";
import { compactMoney, money } from "@/lib/format";

const COLORS = ["#8a6a3d", "#2f4a42", "#c4a574", "#6b8f85", "#4a3728", "#9aa39a", "#b08968"];

export default function AnalyticsPage() {
  const leads = useCRM((s) => s.leads);
  const deals = useCRM((s) => s.deals);
  const properties = useCRM((s) => s.properties);
  const agents = useCRM((s) => s.agents);

  const won = leads.filter((l) => l.status === "Won").length;
  const conversion = leads.length ? Math.round((won / leads.length) * 100) : 0;
  const closedWon = deals.filter((d) => d.stage === "Closed Won");
  const avgDeal =
    closedWon.length === 0
      ? 0
      : closedWon.reduce((s, d) => s + d.value, 0) / closedWon.length;
  const sold = properties.filter((p) => p.status === "Sold").length;

  const sources = Object.entries(
    leads.reduce<Record<string, number>>((acc, l) => {
      acc[l.source] = (acc[l.source] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const agentPerf = agents.map((a) => {
    const aLeads = leads.filter((l) => l.assignedAgentId === a.id);
    const aWon = aLeads.filter((l) => l.status === "Won").length;
    const aDeals = deals.filter((d) => d.agentId === a.id);
    const volume = aDeals.reduce((s, d) => s + (d.stage === "Closed Lost" ? 0 : d.value), 0);
    return {
      name: a.name.split(" ")[0],
      leads: aLeads.length,
      won: aWon,
      volume,
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="House report"
        title="Analytics"
        description="Conversion, ticket size, and who is actually moving inventory."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Lead conversion" value={`${conversion}%`} hint={`${won} won / ${leads.length} leads`} />
        <StatCard label="Average deal size" value={compactMoney(avgDeal)} hint="Closed won only" />
        <StatCard label="Properties sold" value={String(sold)} hint={`${properties.length} in the book`} />
        <StatCard
          label="Open pipeline"
          value={compactMoney(
            deals.filter((d) => !d.stage.startsWith("Closed")).reduce((s, d) => s + d.value, 0),
          )}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/8">
          <h2 className="mb-4 font-heading text-xl">Lead sources</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={sources} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95}>
                {sources.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/8">
          <h2 className="mb-4 font-heading text-xl">Agent performance — leads</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={agentPerf}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="leads" fill="#2f4a42" radius={[6, 6, 0, 0]} />
              <Bar dataKey="won" fill="#8a6a3d" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-card ring-1 ring-foreground/8">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3">Agent</th>
              <th className="px-4 py-3">Leads</th>
              <th className="px-4 py-3">Won</th>
              <th className="px-4 py-3">Conversion</th>
              <th className="px-4 py-3">Pipeline volume</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {agentPerf.map((a) => (
              <tr key={a.name}>
                <td className="px-4 py-3 font-medium">{a.name}</td>
                <td className="px-4 py-3">{a.leads}</td>
                <td className="px-4 py-3">{a.won}</td>
                <td className="px-4 py-3">{a.leads ? Math.round((a.won / a.leads) * 100) : 0}%</td>
                <td className="px-4 py-3">{money(a.volume)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

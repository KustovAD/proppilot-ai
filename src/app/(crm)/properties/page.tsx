"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LayoutGrid, List, Plus, Search } from "lucide-react";
import { PageHeader, EmptyState, NativeSelect } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PropertyStatusBadge } from "@/components/status-badge";
import { PropertyFormDialog } from "@/components/properties/property-form-dialog";
import { useCRM } from "@/lib/store";
import { CITIES, PROPERTY_STATUSES, PROPERTY_TYPES } from "@/lib/constants";
import { areaFmt, money } from "@/lib/format";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function PropertiesInner() {
  const router = useRouter();
  const params = useSearchParams();
  const properties = useCRM((s) => s.properties);
  const images = useCRM((s) => s.propertyImages);
  const agents = useCRM((s) => s.agents);

  const [q, setQ] = useState(params.get("q") ?? "");
  const [city, setCity] = useState("all");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("listed");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = properties.filter((p) => {
      const hay = `${p.title} ${p.address} ${p.city} ${p.description}`.toLowerCase();
      if (q && !hay.includes(q.toLowerCase())) return false;
      if (city !== "all" && p.city !== city) return false;
      if (type !== "all" && p.propertyType !== type) return false;
      if (status !== "all" && p.status !== status) return false;
      return true;
    });
    list = list.slice().sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "views") return b.views - a.views;
      return b.listedAt.localeCompare(a.listedAt);
    });
    return list;
  }, [properties, q, city, type, status, sort]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inventory"
        title="Properties"
        description="Photography-led listings with factual copy and a named agent on every file."
        actions={
          <Button className="h-9 px-3" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            New listing
          </Button>
        }
      />

      <div className="flex flex-col gap-3 rounded-2xl bg-card p-3 ring-1 ring-foreground/8 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, street, city…"
            className="pl-8"
            aria-label="Search properties"
          />
        </div>
        <NativeSelect value={city} onChange={(e) => setCity(e.target.value)} className="lg:w-36">
          <option value="all">All cities</option>
          {CITIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </NativeSelect>
        <NativeSelect value={type} onChange={(e) => setType(e.target.value)} className="lg:w-36">
          <option value="all">All types</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </NativeSelect>
        <NativeSelect value={status} onChange={(e) => setStatus(e.target.value)} className="lg:w-36">
          <option value="all">All statuses</option>
          {PROPERTY_STATUSES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </NativeSelect>
        <NativeSelect value={sort} onChange={(e) => setSort(e.target.value)} className="lg:w-40">
          <option value="listed">Newest listed</option>
          <option value="price-desc">Price high–low</option>
          <option value="price-asc">Price low–high</option>
          <option value="views">Most viewed</option>
        </NativeSelect>
        <div className="flex rounded-lg border p-0.5">
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="icon-sm"
            aria-label="Grid view"
            onClick={() => setView("grid")}
          >
            <LayoutGrid />
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="icon-sm"
            aria-label="List view"
            onClick={() => setView("list")}
          >
            <List />
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No listings match"
          description="Clear filters or add a listing. Every card is a real record in the demo book."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQ("");
                setCity("all");
                setType("all");
                setStatus("all");
              }}
            >
              Reset filters
            </Button>
          }
        />
      ) : view === "grid" ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => {
            const cover = images.find((i) => i.propertyId === p.id);
            const agent = agents.find((a) => a.id === p.agentId);
            return (
              <Link
                key={p.id}
                href={`/properties/${p.id}`}
                className="group overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/8 transition hover:ring-foreground/20"
              >
                <div className="relative aspect-[4/3]">
                  {cover ? (
                    <Image
                      src={cover.url}
                      alt={cover.alt}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
                    />
                  ) : (
                    <div className="size-full bg-muted" />
                  )}
                  <div className="absolute top-3 left-3">
                    <PropertyStatusBadge status={p.status} />
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                    {p.city} · {p.propertyType}
                  </p>
                  <h2 className="mt-1 font-heading text-xl">{p.title}</h2>
                  <p className="text-sm text-muted-foreground">{p.address}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="font-medium">{money(p.price)}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.bedrooms} bd · {p.bathrooms} ba · {areaFmt(p.area)}
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{agent?.name}</p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/8">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3">Listing</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((p) => {
                const cover = images.find((i) => i.propertyId === p.id);
                const agent = agents.find((a) => a.id === p.agentId);
                return (
                  <tr key={p.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <Link href={`/properties/${p.id}`} className="flex items-center gap-3">
                        <span className="relative size-12 overflow-hidden rounded-lg">
                          {cover ? (
                            <Image src={cover.url} alt="" fill className="object-cover" sizes="48px" />
                          ) : null}
                        </span>
                        <span>
                          <span className="block font-medium">{p.title}</span>
                          <span className="text-xs text-muted-foreground">{p.address}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">{p.city}</td>
                    <td className="px-4 py-3">{money(p.price)}</td>
                    <td className="px-4 py-3">
                      <PropertyStatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3">{agent?.name}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <PropertyFormDialog
        open={open}
        onOpenChange={setOpen}
        onSaved={(id) => {
          toast.success("Listing saved");
          router.push(`/properties/${id}`);
        }}
      />
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <PropertiesInner />
    </Suspense>
  );
}

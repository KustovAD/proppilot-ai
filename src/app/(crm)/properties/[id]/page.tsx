"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Bath,
  BedDouble,
  MapPin,
  Maximize2,
  Sparkles,
  Mail,
  Share2,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ErrorState, PageHeader } from "@/components/ui-kit";
import { PropertyStatusBadge } from "@/components/status-badge";
import { PropertyFormDialog } from "@/components/properties/property-form-dialog";
import { useCRM } from "@/lib/store";
import { areaFmt, dateTimeFmt, money, numberFmt, relativeFmt } from "@/lib/format";
import type { PropertyDescriptionResult } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/format";

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const properties = useCRM((s) => s.properties);
  const propertyImages = useCRM((s) => s.propertyImages);
  const agents = useCRM((s) => s.agents);
  const allLeads = useCRM((s) => s.leads);
  const activities = useCRM((s) => s.leadActivities);
  const allAppointments = useCRM((s) => s.appointments);
  const addGeneration = useCRM((s) => s.addGeneration);
  const updateProperty = useCRM((s) => s.updateProperty);

  const property = useMemo(
    () => properties.find((p) => p.id === id),
    [properties, id],
  );
  const images = useMemo(
    () =>
      propertyImages
        .filter((i) => i.propertyId === id)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [propertyImages, id],
  );
  const agent = useMemo(
    () => agents.find((a) => a.id === property?.agentId),
    [agents, property?.agentId],
  );
  const leads = useMemo(
    () => allLeads.filter((l) => l.interestedPropertyId === id),
    [allLeads, id],
  );
  const appointments = useMemo(
    () =>
      allAppointments
        .filter((a) => a.propertyId === id)
        .sort((a, b) => a.startAt.localeCompare(b.startAt)),
    [allAppointments, id],
  );

  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [copy, setCopy] = useState<PropertyDescriptionResult | null>(null);
  const [edit, setEdit] = useState(false);
  const [model, setModel] = useState<string | null>(null);

  const leadActivity = useMemo(() => {
    const ids = new Set(leads.map((l) => l.id));
    return activities.filter((a) => ids.has(a.leadId)).slice(0, 8);
  }, [activities, leads]);

  if (!property) {
    return (
      <ErrorState
        title="Listing not found"
        description="This property is not in the current workspace book."
        action={
          <Link href="/properties" className="text-sm text-primary hover:underline">
            Back to properties
          </Link>
        }
      />
    );
  }

  const listing = property;
  const cover = images[active] ?? images[0];

  async function run(action: "generate" | "improve" | "social" | "email") {
    setBusy(action);
    try {
      const res = await fetch("/api/ai/property", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, property: listing }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setCopy(json.copy);
      setModel(json.model);
      addGeneration({
        kind:
          action === "email"
            ? "email_campaign"
            : action === "social"
              ? "social_post"
              : "property_description",
        targetType: "property",
        targetId: listing.id,
        prompt: action,
        output: JSON.stringify(json.copy),
        model: json.model,
      });
      toast.success("Generated from listing facts only");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={property.city}
        title={property.title}
        description={`${property.address} · ${property.country}`}
        actions={
          <>
            <Button variant="outline" className="h-9" onClick={() => setEdit(true)}>
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button className="h-9" onClick={() => run("generate")} disabled={!!busy}>
              <Sparkles className="size-4" />
              {busy === "generate" ? "Writing…" : "Generate description"}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="overflow-hidden rounded-3xl bg-card ring-1 ring-foreground/8">
          <div className="relative aspect-[16/10] bg-muted">
            {cover ? (
              <Image
                src={cover.url}
                alt={cover.alt}
                fill
                className="object-cover"
                priority
                sizes="80vw"
              />
            ) : null}
            <div className="absolute top-4 left-4 flex gap-2">
              <PropertyStatusBadge status={property.status} />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 p-2">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setActive(i)}
                className={`relative aspect-[4/3] overflow-hidden rounded-xl ring-2 ${
                  i === active ? "ring-primary" : "ring-transparent"
                }`}
                aria-label={`Photo ${i + 1}`}
              >
                <Image src={img.url} alt={img.alt} fill className="object-cover" sizes="20vw" />
              </button>
            ))}
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="rounded-3xl bg-forest p-6 text-sidebar-foreground">
            <p className="text-[11px] tracking-[0.18em] text-sidebar-primary uppercase">Asking</p>
            <p className="mt-2 font-heading text-4xl">{money(property.price)}</p>
            <p className="mt-4 flex items-center gap-2 text-sm text-sidebar-foreground/80">
              <MapPin className="size-4" />
              {property.address}, {property.city}
            </p>
            <dl className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div>
                <BedDouble className="mx-auto size-4" />
                <dt className="mt-1 text-[10px] uppercase opacity-70">Beds</dt>
                <dd className="font-heading text-xl">{property.bedrooms}</dd>
              </div>
              <div>
                <Bath className="mx-auto size-4" />
                <dt className="mt-1 text-[10px] uppercase opacity-70">Baths</dt>
                <dd className="font-heading text-xl">{property.bathrooms}</dd>
              </div>
              <div>
                <Maximize2 className="mx-auto size-4" />
                <dt className="mt-1 text-[10px] uppercase opacity-70">Area</dt>
                <dd className="font-heading text-lg">{numberFmt(property.area)}</dd>
              </div>
            </dl>
          </div>

          {agent ? (
            <div className="rounded-3xl bg-card p-5 ring-1 ring-foreground/8">
              <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">Agent</p>
              <div className="mt-3 flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarImage src={agent.avatarUrl} alt="" />
                  <AvatarFallback>{initials(agent.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{agent.name}</p>
                  <p className="text-xs text-muted-foreground">{agent.title}</p>
                  <p className="text-xs text-muted-foreground">{agent.phone}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{agent.bio}</p>
            </div>
          ) : null}

          <div className="map-placeholder min-h-40 rounded-3xl ring-1 ring-foreground/8">
            <div className="p-4">
              <p className="text-xs tracking-[0.16em] text-primary uppercase">Map</p>
              <p className="mt-1 font-heading text-lg">{property.city}</p>
              <p className="text-xs text-muted-foreground">{property.address}</p>
            </div>
          </div>
        </aside>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl bg-card p-6 ring-1 ring-foreground/8">
          <h2 className="font-heading text-2xl">Details</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{property.description}</p>
          <p className="mt-2 text-xs text-muted-foreground">{areaFmt(property.area)} interior</p>
          <h3 className="mt-6 font-heading text-xl">Features on file</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {property.features.map((f) => (
              <li key={f} className="rounded-full bg-muted px-3 py-1 text-xs">
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl bg-card p-6 ring-1 ring-foreground/8">
          <h2 className="font-heading text-2xl">AI desk</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Generations use listing facts only. Missing data is omitted.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="outline" disabled={!!busy} onClick={() => run("generate")}>
              <Sparkles className="size-4" />
              Description
            </Button>
            <Button variant="outline" disabled={!!busy} onClick={() => run("improve")}>
              Improve
            </Button>
            <Button variant="outline" disabled={!!busy} onClick={() => run("social")}>
              <Share2 className="size-4" />
              Social
            </Button>
            <Button variant="outline" disabled={!!busy} onClick={() => run("email")}>
              <Mail className="size-4" />
              Email
            </Button>
          </div>
          {copy ? (
            <Tabs defaultValue="long" className="mt-4">
              <TabsList>
                <TabsTrigger value="long">Long</TabsTrigger>
                <TabsTrigger value="short">Short</TabsTrigger>
                <TabsTrigger value="social">Social</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>
              <TabsContent value="long">
                <p className="font-heading text-lg">{copy.headline}</p>
                <Textarea readOnly rows={8} className="mt-2" value={copy.longDescription} />
                <Button
                  className="mt-2"
                  variant="secondary"
                  onClick={() => {
                    updateProperty(property.id, { description: copy.longDescription });
                    toast.success("Description applied to the listing");
                  }}
                >
                  Apply to listing
                </Button>
              </TabsContent>
              <TabsContent value="short">
                <Textarea readOnly rows={5} value={copy.shortDescription} />
              </TabsContent>
              <TabsContent value="social">
                <p className="text-xs text-muted-foreground">Instagram</p>
                <Textarea readOnly rows={4} value={copy.instagramCaption} />
                <p className="mt-2 text-xs text-muted-foreground">Facebook</p>
                <Textarea readOnly rows={5} value={copy.facebookPost} />
              </TabsContent>
              <TabsContent value="seo">
                <Textarea readOnly rows={3} value={copy.seoDescription} />
              </TabsContent>
            </Tabs>
          ) : null}
          {model ? (
            <p className="mt-3 text-[11px] text-muted-foreground">Model: {model}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl bg-card p-6 ring-1 ring-foreground/8">
          <h2 className="font-heading text-2xl">Lead activity</h2>
          {leadActivity.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No lead activity linked to this file yet.</p>
          ) : (
            <ol className="mt-4 space-y-3">
              {leadActivity.map((a) => (
                <li key={a.id} className="border-l-2 border-primary/30 pl-3">
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.body}</p>
                  <p className="text-[11px] text-muted-foreground">{relativeFmt(a.createdAt)}</p>
                </li>
              ))}
            </ol>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {leads.map((l) => (
              <Link
                key={l.id}
                href={`/leads/${l.id}`}
                className="rounded-full bg-muted px-3 py-1 text-xs hover:bg-muted/80"
              >
                {l.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-3xl bg-card p-6 ring-1 ring-foreground/8">
          <h2 className="font-heading text-2xl">Appointments</h2>
          <ul className="mt-4 divide-y">
            {appointments.length === 0 ? (
              <li className="py-3 text-sm text-muted-foreground">No viewings booked on this file.</li>
            ) : (
              appointments.map((a) => (
                <li key={a.id} className="py-3">
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.type} · {dateTimeFmt(a.startAt)}
                  </p>
                </li>
              ))
            )}
          </ul>
          <Link href="/calendar" className="mt-3 inline-block text-sm text-primary hover:underline">
            Open calendar
          </Link>
        </div>
      </div>

      <PropertyFormDialog open={edit} onOpenChange={setEdit} property={property} />
    </div>
  );
}

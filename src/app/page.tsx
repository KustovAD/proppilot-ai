import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Building2,
  Sparkles,
  LineChart,
  ShieldCheck,
  CalendarDays,
  Users,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/constants";

const HERO = "/hero.jpg";

const FEATURES = [
  {
    icon: Building2,
    title: "Listings that look like a house magazine",
    body: "Grid and list inventories, status filters, and detail pages built around photography, facts, and the assigned agent.",
  },
  {
    icon: Users,
    title: "A pipeline operators will actually use",
    body: "Leads move on a Kanban. Status persists. Scores explain budget fit, engagement, and the next humane step.",
  },
  {
    icon: Sparkles,
    title: "AI that refuses to invent the house",
    body: "Descriptions, social posts, emails, and follow-ups are grounded in recorded facts. Missing data is omitted, never guessed.",
  },
  {
    icon: CalendarDays,
    title: "The private-client week, in one diary",
    body: "Viewings, calls, meetings, and follow-ups sit beside tasks and expected commission — not in a separate spreadsheet.",
  },
  {
    icon: LineChart,
    title: "Partners see the desk, not a dump of charts",
    body: "Conversion, sources, agent performance, and deal velocity presented like a house report, not a BI toy.",
  },
  {
    icon: ShieldCheck,
    title: "A full desk with nothing to configure",
    body: "Demo login, seeded inventory, and an AI writer that still works. No API keys, no database, no billing — open the desk and click.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-full bg-primary font-heading text-sm text-primary-foreground">
              P
            </span>
            <span className="font-heading text-lg">PropPilot AI</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#product" className="hover:text-foreground">
              Product
            </a>
            <a href="#ai" className="hover:text-foreground">
              AI desk
            </a>
            <a href="#pricing" className="hover:text-foreground">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }))}>
              Sign in
            </Link>
            <Link href="/register" className={cn(buttonVariants())}>
              Request a desk
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 luxury-grid opacity-70" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div className="flex flex-col justify-center">
            <p className="text-[11px] font-medium tracking-[0.22em] text-primary uppercase">
              For private real estate houses
            </p>
            <h1 className="mt-4 font-heading text-4xl leading-[1.05] tracking-tight sm:text-6xl">
              The CRM that treats inventory like editorial, not a spreadsheet.
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              PropPilot AI runs listings, leads, deals, and the diary for agencies that sell quiet,
              expensive homes. Copy is generated from facts. The pipeline is honest.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")}>
                Open the live demo
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/register"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-5")}
              >
                Create a workspace
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Demo desk: {DEMO_EMAIL} · {DEMO_PASSWORD}
            </p>
          </div>
          <div className="relative min-h-[360px] overflow-hidden rounded-3xl shadow-2xl ring-1 ring-foreground/10">
            <Image
              src={HERO}
              alt="Mayfair residence living space"
              fill
              className="object-cover"
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-transparent to-transparent" />
            <div className="absolute right-4 bottom-4 left-4 rounded-2xl bg-background/90 p-4 backdrop-blur">
              <p className="text-[11px] tracking-[0.18em] text-primary uppercase">Active listing</p>
              <p className="font-heading text-xl">Mayfair Residence</p>
              <p className="text-sm text-muted-foreground">14 Grosvenor Square · $8.45M · 4 bed</p>
            </div>
          </div>
        </div>
      </section>

      <section id="product" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-[11px] tracking-[0.2em] text-primary uppercase">The desk</p>
          <h2 className="mt-2 font-heading text-3xl sm:text-4xl">
            Built for houses that already have a point of view.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <article key={f.title} className="rounded-2xl bg-card p-6 ring-1 ring-foreground/8">
              <f.icon className="size-5 text-primary" />
              <h3 className="mt-4 font-heading text-xl">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="ai" className="border-y bg-forest text-sidebar-foreground">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="text-[11px] tracking-[0.2em] text-sidebar-primary uppercase">AI desk</p>
            <h2 className="mt-2 font-heading text-3xl sm:text-4xl">
              Language models, on a short leash.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-sidebar-foreground/75">
              Every generation receives the listing facts and nothing else. If a terrace is not in
              the file, it will not appear in the Instagram caption. This portfolio build uses a
              grounded writer — no API key, no invented amenities.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-sidebar-foreground/80">
              <li>— Headline, long and short copy, SEO, Instagram, Facebook</li>
              <li>— Lead scores with a reason and a recommended next action</li>
              <li>— Follow-ups as email, SMS, and WhatsApp in four tones</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-sidebar-accent p-6 ring-1 ring-white/10">
            <p className="text-xs tracking-[0.16em] text-sidebar-primary uppercase">Sample output</p>
            <p className="mt-4 font-heading text-2xl">Mayfair Residence — 4-bedroom Penthouse in London</p>
            <p className="mt-3 text-sm leading-relaxed text-sidebar-foreground/75">
              Full-floor penthouse on Grosvenor Square with 4 bedrooms, 4 bathrooms, and 4,120 sq ft.
              Recorded features: private lift, terrace, fireplace, wine cellar, 2 parking spaces, porter.
              Asking price: $8,450,000. No amenities are added beyond the facts supplied.
            </p>
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <p className="text-[11px] tracking-[0.2em] text-primary uppercase">Pricing</p>
          <h2 className="mt-2 font-heading text-3xl sm:text-4xl">Desks, not seats in a warehouse.</h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            {
              name: "Atelier",
              price: "$490",
              detail: "Boutique teams, 1 office",
              items: ["Up to 8 agents", "Listings & pipeline", "Grounded listing copy"],
            },
            {
              name: "Maison",
              price: "$1,200",
              detail: "Multi-city houses",
              items: ["Unlimited listings", "Lead scoring", "Calendar & analytics"],
            },
            {
              name: "Private",
              price: "On request",
              detail: "Family offices & off-market",
              items: ["Workspace RLS", "Custom models", "White-glove onboarding"],
            },
          ].map((tier) => (
            <article
              key={tier.name}
              className={cn(
                "rounded-2xl p-6 ring-1 ring-foreground/8",
                tier.name === "Maison" ? "bg-forest text-sidebar-foreground" : "bg-card",
              )}
            >
              <p className="text-sm">{tier.name}</p>
              <p className="mt-2 font-heading text-3xl">{tier.price}</p>
              <p className="mt-1 text-sm opacity-70">{tier.detail}</p>
              <ul className="mt-6 space-y-2 text-sm opacity-90">
                {tier.items.map((i) => (
                  <li key={i}>— {i}</li>
                ))}
              </ul>
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ variant: tier.name === "Maison" ? "secondary" : "outline" }),
                  "mt-6 w-full",
                )}
              >
                Start
              </Link>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© 2026 PropPilot AI. Fictional inventory for product demonstration.</p>
          <p>Meridian Private Estates is a demo workspace.</p>
        </div>
      </footer>
    </div>
  );
}

# Marketplace kit — PropPilot AI

This build is a **portfolio demo**. No OpenAI key, no Supabase, no billing. `npm install && npm run dev` is the whole setup.

Show the desk. If someone wants a production backend later, that is a separate job.

## Positioning

**One-line:** Luxury real estate CRM you can click in 60 seconds — listings, Kanban, diary, analytics, and copy that never invents property facts.

**What this repo is**

- A finished-looking test project / portfolio piece
- Seeded with fictional inventory (Meridian Private Estates)
- Fully usable in the browser

**What it is not**

- A live SaaS with real payments
- A product that needs API keys to “work”
- A student CRUD tutorial

---

## GitHub (public is fine)

This is a test project, so a **public** repo is the right default. Reviewers clone it and run it.

```bash
git add -A
git commit -m "Release PropPilot AI 1.0 — portfolio real estate CRM demo"
gh repo create PropPilot-AI --public --source=. --remote=origin --push
```

Repo settings:

- Description: `Portfolio demo — luxury real estate CRM. Listings, Kanban, analytics, grounded AI copy. No API keys.`
- Topics: `real-estate`, `crm`, `nextjs`, `typescript`, `tailwindcss`, `portfolio`
- Website: local README or a free Vercel deploy (still no env vars)

Optional live URL (no keys on Vercel either):

```bash
npx vercel
```

Demo login:

```
oscar.d@example.net
demo1234
```

---

## Fiverr

### Gig title (80 chars)

`I will build a luxury AI real estate CRM with listings and pipeline`

Alternates:

- `I will deliver a white-label AI CRM for real estate agencies`
- `I will customize PropPilot, an AI real estate CRM with Kanban and copy`

### Search tags

`real estate crm`, `ai crm`, `next.js`, `property listing`, `lead management`

### Packages

| | Basic | Standard | Premium |
| --- | --- | --- | --- |
| Name | Demo desk | White-label | Production house |
| Price (guide) | $350–600 | $1,200–2,000 | $3,500–6,500 |
| Days | 3 | 7 | 14–21 |
| Includes | Source + Vercel demo + brand colors/logo + 1 revision | Everything in Basic + custom fields/copy + email templates + 2 modules tweaked + 2 revisions | Everything in Standard + Supabase schema + auth + OpenAI live + training call + 30 days support |
| Revisions | 1 | 2 | 3 |
| Extra | Branding | Deploy + docs | Production backend |

Add-ons: extra module $150–400 · extra training call $80 · portal/MLS import (custom quote) · WhatsApp/Twilio wiring (custom quote).

### Gig description

```
Need a real estate CRM that looks like a private house, not a spreadsheet?

I deliver PropPilot AI — a production-ready desk for boutique agencies:

• Photo-led property listings (grid, list, filters, detail, gallery)
• Lead pipeline with Kanban + scores + next action
• Deals, contacts, tasks, calendar
• Analytics (conversion, sources, agent performance)
• AI listing copy, social posts, and follow-ups that use ONLY recorded facts
  (no invented terraces, schools, or sea views)

You get a live demo you can click on day one. No API keys.

How it works
1. You send logo, colors, and must-have fields
2. I deploy a branded demo
3. We iterate on copy, modules, and workflow
4. You receive source + handoff notes

Stack: Next.js 16, TypeScript, Tailwind, shadcn/ui, Zustand. Runs locally with no backend.

This is a commercial-looking portfolio desk, not a student CRUD tutorial.
```

### FAQs

**Is this Salesforce / HubSpot?**
No. It is a focused luxury-house desk. Faster to brand, cheaper to own, built around listings and viewings.

**Do I need OpenAI or a database?**
No. The desk runs in the browser. Copy, scores, and follow-ups are generated from listing facts without a key.

**Do I own the code?**
Yes, under the purchase agreement. I keep the right to reuse the generic product for other clients unless you buy exclusivity (Premium add-on).

**Can you connect my MLS / WhatsApp / Stripe?**
Yes as a custom extra. The core product is listings, pipeline, diary, and AI copy.

**Will it work on mobile?**
Yes. The CRM is responsive; desktop is the primary operator view.

### Gig gallery

Upload in this order:

1. Landing (`docs/screenshots/landing.png`)
2. Dashboard (`03-dashboard.png`)
3. Properties (`04-properties.png`)
4. Kanban (`06-leads.png`)
5. Property file (`05-property.png`)
6. 60–90s Loom walkthrough (see script below)

---

## Upwork

### Catalog / project title

`Luxury AI Real Estate CRM (Next.js) — listings, pipeline, grounded copy`

### Catalog description

```
I build and white-label PropPilot AI, a premium CRM for private-client real estate.

Operators get listings that look editorial, a Kanban they will actually use, a diary of viewings, analytics partners can read, and an AI desk that refuses to invent house facts.

The public demo needs no API keys. Clone, npm install, npm run dev.
```

### Skills

`Next.js`, `TypeScript`, `React`, `Tailwind CSS`, `CRM`, `Real Estate`

### Proposal template

```
Hi [Name] —

I already have a working luxury real estate CRM (PropPilot AI) that matches this brief: listings, Kanban pipeline, deals, calendar, analytics, and AI copy constrained to recorded facts.

Live demo: [URL or GitHub]
Login: oscar.d@example.net / demo1234
No API keys required.

What I would deliver for you
1. Brand the desk (logo, colors, workspace name)
2. Adjust property/lead fields to your market
3. Deploy (Vercel, still no keys) or hand over the repo
4. 45-minute operator walkthrough

Happy to jump on a 10-minute screen share and click through Meridian Private Estates with you.
```

### Profile project (add after the demo is live)

Title: `PropPilot AI — private-client real estate CRM`
Thumbnail: `docs/screenshots/dashboard.png`
Body: 4–6 screenshots + the one-liner + stack + “demo login on request / in the proposal”.

---

## How to present it to a client

### 1. Lead with the click, not the stack

Send, in this order:

1. GitHub README + screenshots (already in the repo)
2. `npm install && npm run dev` — or a Vercel URL with **zero env vars**
3. Demo login
4. Loom 60–90s if they will not clone

Do not mention OpenAI, Supabase, or “add your key”. The product is the desk.

### 2. Loom script (90 seconds)

1. Landing — “This is the public face of the house.”
2. Login with demo account on camera.
3. Dashboard — “Active book, new demand, commission still in motion.”
4. Open Mayfair Residence — photography, facts, AI desk.
5. Generate copy — point out it only uses recorded features. No key.
6. Leads Kanban — drag one card.
7. Open a lead — score, reason, WhatsApp follow-up.
8. Analytics — “What a partner sees.”
9. Close — “Clone it. No keys. This is the test desk.”

### 3. Honest scope (say this out loud)

**In this demo:** listings, leads, contacts, deals, tasks, calendar, analytics, team, settings, AI copy/score/follow-up, local login, browser storage.

**Not in this demo:** live MLS, Twilio/WhatsApp send, payments, cloud auth, native apps.

---

## Price guardrails

| Offer | Floor | Notes |
| --- | --- | --- |
| Source + deploy, no custom work | $350 | Only if you accept reuse by other clients |
| White-label for one agency | $1,200+ | Standard Fiverr / small Upwork |
| Production + auth + AI | $3,500+ | Real operators |
| Exclusive / no resale | $8,000+ | Put it in the contract |

If a buyer wants “the GitHub for $50”, walk away. The demo is the proof; the engagement is the product.

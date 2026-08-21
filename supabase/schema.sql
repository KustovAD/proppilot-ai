-- PropPilot AI — Postgres schema for Supabase
-- Run in the SQL editor of a new project, then optionally load demo data from the app.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Core
-- ---------------------------------------------------------------------------

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  tagline text not null default '',
  plan text not null default 'atelier' check (plan in ('atelier', 'maison', 'private')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  workspace_id uuid references public.workspaces (id) on delete set null,
  full_name text not null default '',
  email text,
  avatar_url text,
  role text not null default 'agent' check (role in ('owner', 'admin', 'agent')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  profile_id uuid references public.profiles (id) on delete set null,
  name text not null,
  email text not null,
  phone text not null default '',
  title text not null default 'Agent',
  city text not null default '',
  bio text not null default '',
  avatar_url text,
  role text not null default 'agent' check (role in ('owner', 'admin', 'agent')),
  specializations text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  title text not null,
  address text not null,
  city text not null,
  country text not null default '',
  price numeric(14, 2) not null,
  currency text not null default 'USD',
  property_type text not null,
  bedrooms integer not null default 0,
  bathrooms numeric(4, 1) not null default 0,
  area integer not null,
  description text not null default '',
  features text[] not null default '{}',
  status text not null default 'Draft'
    check (status in ('Draft', 'Active', 'Under Offer', 'Sold', 'Archived')),
  agent_id uuid references public.agents (id) on delete set null,
  year_built integer,
  parking integer,
  views integer not null default 0,
  listed_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  url text not null,
  alt text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  email text not null,
  phone text not null default '',
  company text,
  city text not null default '',
  type text not null default 'Buyer' check (type in ('Buyer', 'Seller', 'Investor', 'Partner')),
  notes text not null default '',
  agent_id uuid references public.agents (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  email text not null,
  phone text not null default '',
  budget_min numeric(14, 2) not null default 0,
  budget_max numeric(14, 2) not null default 0,
  preferred_location text not null default '',
  property_type text not null,
  source text not null,
  status text not null default 'New'
    check (status in ('New', 'Contacted', 'Viewing', 'Negotiating', 'Won', 'Lost')),
  assigned_agent_id uuid references public.agents (id) on delete set null,
  interested_property_id uuid references public.properties (id) on delete set null,
  contact_id uuid references public.contacts (id) on delete set null,
  timeline text not null default '',
  notes text not null default '',
  score integer not null default 0 check (score between 0 and 100),
  score_reason text not null default '',
  next_action text not null default '',
  last_contacted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  agent_id uuid references public.agents (id) on delete set null,
  type text not null,
  title text not null,
  body text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  title text not null,
  lead_id uuid references public.leads (id) on delete set null,
  property_id uuid references public.properties (id) on delete set null,
  agent_id uuid references public.agents (id) on delete set null,
  stage text not null default 'Qualified',
  value numeric(14, 2) not null,
  commission_rate numeric(5, 2) not null default 2,
  expected_close date,
  notes text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  title text not null,
  type text not null check (type in ('Property Viewing', 'Call', 'Meeting', 'Follow-up')),
  start_at timestamptz not null,
  end_at timestamptz not null,
  location text not null default '',
  notes text not null default '',
  agent_id uuid references public.agents (id) on delete set null,
  lead_id uuid references public.leads (id) on delete set null,
  property_id uuid references public.properties (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  title text not null,
  description text not null default '',
  due_at timestamptz,
  priority text not null default 'Medium' check (priority in ('Low', 'Medium', 'High', 'Urgent')),
  completed boolean not null default false,
  agent_id uuid references public.agents (id) on delete set null,
  lead_id uuid references public.leads (id) on delete set null,
  property_id uuid references public.properties (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  kind text not null,
  target_type text not null check (target_type in ('property', 'lead')),
  target_id uuid not null,
  prompt text not null default '',
  output text not null,
  model text not null default 'proppilot-demo',
  created_at timestamptz not null default timezone('utc', now())
);

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array[
    'workspaces', 'profiles', 'agents', 'properties', 'contacts',
    'leads', 'deals', 'appointments', 'tasks'
  ]
  loop
    execute format(
      'drop trigger if exists set_updated_at on public.%I;
       create trigger set_updated_at before update on public.%I
       for each row execute function public.set_updated_at();',
      t, t
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists agents_workspace_idx on public.agents (workspace_id);
create index if not exists properties_workspace_idx on public.properties (workspace_id);
create index if not exists properties_status_idx on public.properties (status);
create index if not exists properties_city_idx on public.properties (city);
create index if not exists properties_agent_idx on public.properties (agent_id);
create index if not exists property_images_property_idx on public.property_images (property_id, sort_order);
create index if not exists contacts_workspace_idx on public.contacts (workspace_id);
create index if not exists leads_workspace_idx on public.leads (workspace_id);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_agent_idx on public.leads (assigned_agent_id);
create index if not exists lead_activities_lead_idx on public.lead_activities (lead_id, created_at desc);
create index if not exists deals_workspace_idx on public.deals (workspace_id);
create index if not exists deals_stage_idx on public.deals (stage);
create index if not exists appointments_workspace_start_idx on public.appointments (workspace_id, start_at);
create index if not exists tasks_workspace_due_idx on public.tasks (workspace_id, due_at);
create index if not exists ai_generations_workspace_idx on public.ai_generations (workspace_id, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.workspaces enable row level security;
alter table public.profiles enable row level security;
alter table public.agents enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.contacts enable row level security;
alter table public.leads enable row level security;
alter table public.lead_activities enable row level security;
alter table public.deals enable row level security;
alter table public.appointments enable row level security;
alter table public.tasks enable row level security;
alter table public.ai_generations enable row level security;

create or replace function public.current_workspace_id()
returns uuid
language sql
stable
as $$
  select workspace_id from public.profiles where id = auth.uid()
$$;

create policy "profiles are self readable"
  on public.profiles for select
  using (id = auth.uid() or workspace_id = public.current_workspace_id());

create policy "profiles self update"
  on public.profiles for update
  using (id = auth.uid());

create policy "workspace members read workspace"
  on public.workspaces for select
  using (id = public.current_workspace_id());

create policy "workspace members update workspace"
  on public.workspaces for update
  using (id = public.current_workspace_id());

create policy "workspace members read agents"
  on public.agents for all
  using (workspace_id = public.current_workspace_id())
  with check (workspace_id = public.current_workspace_id());

create policy "workspace members manage properties"
  on public.properties for all
  using (workspace_id = public.current_workspace_id())
  with check (workspace_id = public.current_workspace_id());

create policy "workspace members manage property images"
  on public.property_images for all
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.workspace_id = public.current_workspace_id()
    )
  )
  with check (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.workspace_id = public.current_workspace_id()
    )
  );

create policy "workspace members manage contacts"
  on public.contacts for all
  using (workspace_id = public.current_workspace_id())
  with check (workspace_id = public.current_workspace_id());

create policy "workspace members manage leads"
  on public.leads for all
  using (workspace_id = public.current_workspace_id())
  with check (workspace_id = public.current_workspace_id());

create policy "workspace members manage lead activities"
  on public.lead_activities for all
  using (
    exists (
      select 1 from public.leads l
      where l.id = lead_id and l.workspace_id = public.current_workspace_id()
    )
  )
  with check (
    exists (
      select 1 from public.leads l
      where l.id = lead_id and l.workspace_id = public.current_workspace_id()
    )
  );

create policy "workspace members manage deals"
  on public.deals for all
  using (workspace_id = public.current_workspace_id())
  with check (workspace_id = public.current_workspace_id());

create policy "workspace members manage appointments"
  on public.appointments for all
  using (workspace_id = public.current_workspace_id())
  with check (workspace_id = public.current_workspace_id());

create policy "workspace members manage tasks"
  on public.tasks for all
  using (workspace_id = public.current_workspace_id())
  with check (workspace_id = public.current_workspace_id());

create policy "workspace members manage ai generations"
  on public.ai_generations for all
  using (workspace_id = public.current_workspace_id())
  with check (workspace_id = public.current_workspace_id());

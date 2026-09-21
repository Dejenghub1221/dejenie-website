-- ============================================================
--  Dejenie Portfolio — Supabase PostgreSQL Schema
--  Run this ONCE in Supabase SQL Editor
--  Dashboard → SQL Editor → New Query → paste → Run
-- ============================================================

-- ── Profile (single row) ──────────────────────────────────
create table if not exists profile (
  id            serial primary key,
  name          text    default 'Dejenie Abebe',
  title         text    default 'IT Professional',
  tagline       text    default 'IT PROFESSIONAL · ERP · NETWORKING · CYBERSECURITY',
  headline      text    default 'Building Reliable IT Solutions for Modern Businesses',
  bio           text    default '',
  about1        text    default '',
  about2        text    default '',
  about3        text    default '',
  location      text    default 'Addis Ababa, Ethiopia',
  email         text    default '',
  phone         text    default '',
  availability  text    default 'Available for work',
  linkedin      text    default '#',
  github        text    default '#',
  twitter       text    default '#',
  telegram      text    default '#',
  cv_file       text    default '',
  photo         text    default '',
  stat_experience text  default '5',
  stat_projects   text  default '30',
  stat_clients    text  default '20',
  updated_at    timestamptz default now()
);

-- ── Experience ────────────────────────────────────────────
create table if not exists experience (
  id          uuid    primary key default gen_random_uuid(),
  title       text    not null,
  company     text    not null,
  period      text    not null,
  description text    default '',
  tags        text[]  default '{}',
  "order"     integer default 0,
  created_at  timestamptz default now()
);

-- ── Skills ────────────────────────────────────────────────
create table if not exists skills (
  id          uuid    primary key default gen_random_uuid(),
  name        text    not null,
  percentage  integer default 80 check (percentage between 1 and 100),
  category    text    default 'Technical',
  "order"     integer default 0,
  created_at  timestamptz default now()
);

-- ── Projects ──────────────────────────────────────────────
create table if not exists projects (
  id              uuid  primary key default gen_random_uuid(),
  title           text  not null,
  description     text  default '',
  tags            text[] default '{}',
  image           text  default '',
  image_public_id text  default '',
  link            text  default '#',
  "order"         integer default 0,
  created_at      timestamptz default now()
);

-- ── Services ──────────────────────────────────────────────
create table if not exists services (
  id          uuid  primary key default gen_random_uuid(),
  title       text  not null,
  description text  default '',
  icon        text  default 'fas fa-cog',
  color       text  default '#3b82f6',
  "order"     integer default 0,
  created_at  timestamptz default now()
);

-- ── Certifications ────────────────────────────────────────
create table if not exists certifications (
  id          uuid  primary key default gen_random_uuid(),
  title       text  not null,
  issuer      text  default '',
  year        text  default '',
  category    text  default '',
  icon        text  default 'fas fa-certificate',
  color       text  default '#3b82f6',
  "order"     integer default 0,
  created_at  timestamptz default now()
);

-- ── Gallery ───────────────────────────────────────────────
create table if not exists gallery (
  id              uuid  primary key default gen_random_uuid(),
  url             text  not null,
  image_public_id text  default '',
  caption         text  default '',
  created_at      timestamptz default now()
);

-- ── Messages ──────────────────────────────────────────────
create table if not exists messages (
  id          uuid    primary key default gen_random_uuid(),
  name        text    not null,
  email       text    not null,
  subject     text    default '(no subject)',
  message     text    not null,
  read        boolean default false,
  created_at  timestamptz default now()
);

-- ── Chatbot config (single row) ───────────────────────────
create table if not exists chatbot (
  id            serial  primary key,
  enabled       boolean default true,
  bot_name      text    default 'Dejenie Bot',
  greeting      text    default 'Hi there! 👋 I''m Dejenie''s assistant. Ask me anything!',
  placeholder   text    default 'Type a message...',
  color         text    default '#3b82f6',
  quick_replies text[]  default '{}',
  updated_at    timestamptz default now()
);

-- ── Chatbot FAQs ──────────────────────────────────────────
create table if not exists chatbot_faqs (
  id          uuid    primary key default gen_random_uuid(),
  keywords    text[]  default '{}',
  answer      text    not null,
  created_at  timestamptz default now()
);

-- ── Seed default profile row ──────────────────────────────
insert into profile (id) values (1) on conflict (id) do nothing;

-- ── Seed default chatbot row ──────────────────────────────
insert into chatbot (id) values (1) on conflict (id) do nothing;

-- ── Enable Row Level Security (RLS) — public read, no write ──
alter table profile        enable row level security;
alter table experience     enable row level security;
alter table skills         enable row level security;
alter table projects       enable row level security;
alter table services       enable row level security;
alter table certifications enable row level security;
alter table gallery        enable row level security;
alter table messages       enable row level security;
alter table chatbot        enable row level security;
alter table chatbot_faqs   enable row level security;

-- Public SELECT on all tables
create policy "Public read profile"        on profile        for select using (true);
create policy "Public read experience"     on experience     for select using (true);
create policy "Public read skills"         on skills         for select using (true);
create policy "Public read projects"       on projects       for select using (true);
create policy "Public read services"       on services       for select using (true);
create policy "Public read certifications" on certifications for select using (true);
create policy "Public read gallery"        on gallery        for select using (true);
create policy "Public read chatbot"        on chatbot        for select using (true);
create policy "Public read chatbot_faqs"   on chatbot_faqs   for select using (true);

-- Service role full access (used by our API with service_role key)
create policy "Service role all profile"        on profile        for all using (true) with check (true);
create policy "Service role all experience"     on experience     for all using (true) with check (true);
create policy "Service role all skills"         on skills         for all using (true) with check (true);
create policy "Service role all projects"       on projects       for all using (true) with check (true);
create policy "Service role all services"       on services       for all using (true) with check (true);
create policy "Service role all certifications" on certifications for all using (true) with check (true);
create policy "Service role all gallery"        on gallery        for all using (true) with check (true);
create policy "Service role all messages"       on messages       for all using (true) with check (true);
create policy "Service role all chatbot"        on chatbot        for all using (true) with check (true);
create policy "Service role all chatbot_faqs"   on chatbot_faqs   for all using (true) with check (true);

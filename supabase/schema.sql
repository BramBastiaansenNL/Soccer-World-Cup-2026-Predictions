create extension if not exists pgcrypto;

create table if not exists public.teams (
  id text primary key,
  name text not null unique,
  group_label text,
  flag_emoji text,
  sort_order integer not null default 0
);

create table if not exists public.events (
  id text primary key,
  type text not null check (type in ('champion', 'finalist', 'semi_finalist', 'match_winner')),
  title text not null,
  description text not null default '',
  stage text not null default 'Tournament',
  points integer not null check (points > 0),
  importance integer not null default 0,
  display_order integer not null default 0,
  locked boolean not null default false,
  closes_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.event_options (
  event_id text not null references public.events(id) on delete cascade,
  option_id text not null,
  label text not null,
  sort_order integer not null default 0,
  primary key (event_id, option_id)
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  normalized_name text not null unique,
  submitted_at timestamptz not null default now()
);

create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  event_id text not null references public.events(id) on delete cascade,
  selected_option_id text not null,
  selected_label text not null,
  points_awarded integer not null default 0,
  created_at timestamptz not null default now(),
  unique (submission_id, event_id)
);

create table if not exists public.results (
  event_id text primary key references public.events(id) on delete cascade,
  winning_option_id text not null,
  winning_label text not null,
  decided_at timestamptz not null default now()
);

create index if not exists predictions_submission_idx on public.predictions(submission_id);
create index if not exists predictions_event_idx on public.predictions(event_id);
create index if not exists events_display_idx on public.events(display_order, importance desc);

alter table public.teams enable row level security;
alter table public.events enable row level security;
alter table public.event_options enable row level security;
alter table public.submissions enable row level security;
alter table public.predictions enable row level security;
alter table public.results enable row level security;

drop policy if exists "server only teams" on public.teams;
drop policy if exists "server only events" on public.events;
drop policy if exists "server only event_options" on public.event_options;
drop policy if exists "server only submissions" on public.submissions;
drop policy if exists "server only predictions" on public.predictions;
drop policy if exists "server only results" on public.results;

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
  type text not null check (type in ('champion', 'finalist', 'semi_finalist', 'match_winner', 'knockout_match_winner')),
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
  home_score integer,
  away_score integer,
  decided_by text,
  home_penalties integer,
  away_penalties integer,
  decided_at timestamptz not null default now()
);

-- Keep this file safe to rerun against databases created before knockout support.
alter table public.events drop constraint if exists events_type_check;
alter table public.events add constraint events_type_check
  check (type in ('champion', 'finalist', 'semi_finalist', 'match_winner', 'knockout_match_winner'));

alter table public.results add column if not exists home_score integer;
alter table public.results add column if not exists away_score integer;
alter table public.results add column if not exists decided_by text;
alter table public.results add column if not exists home_penalties integer;
alter table public.results add column if not exists away_penalties integer;
alter table public.results drop constraint if exists results_score_shape_check;
alter table public.results add constraint results_score_shape_check check (
  (home_score is null and away_score is null and decided_by is null)
  or (
    home_score >= 0 and away_score >= 0
    and decided_by is null
    and home_penalties is null and away_penalties is null
  )
  or (
    home_score >= 0 and away_score >= 0
    and decided_by in ('regular_time', 'extra_time')
    and home_score <> away_score
    and home_penalties is null and away_penalties is null
  )
  or (
    home_score >= 0 and away_score >= 0
    and decided_by = 'penalties'
    and home_score = away_score
    and home_penalties >= 0 and away_penalties >= 0
    and home_penalties <> away_penalties
  )
);

create table if not exists public.knockout_dependencies (
  source_event_id text not null references public.events(id) on delete cascade,
  outcome text not null check (outcome in ('winner', 'loser')),
  target_event_id text not null references public.events(id) on delete cascade,
  target_slot text not null check (target_slot in ('home', 'away')),
  primary key (target_event_id, target_slot),
  unique (source_event_id, outcome)
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
alter table public.knockout_dependencies enable row level security;

drop policy if exists "server only teams" on public.teams;
drop policy if exists "server only events" on public.events;
drop policy if exists "server only event_options" on public.event_options;
drop policy if exists "server only submissions" on public.submissions;
drop policy if exists "server only predictions" on public.predictions;
drop policy if exists "server only results" on public.results;
drop policy if exists "server only knockout_dependencies" on public.knockout_dependencies;

grant usage on schema public to service_role;
grant select, insert, update, delete on public.teams to service_role;
grant select, insert, update, delete on public.events to service_role;
grant select, insert, update, delete on public.event_options to service_role;
grant select, insert, update, delete on public.submissions to service_role;
grant select, insert, update, delete on public.predictions to service_role;
grant select, insert, update, delete on public.results to service_role;
grant select, insert, update, delete on public.knockout_dependencies to service_role;

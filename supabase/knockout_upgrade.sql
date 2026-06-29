-- Run once in the Supabase SQL editor before deploying the knockout-stage code.
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
  or (home_score >= 0 and away_score >= 0 and decided_by is null and home_penalties is null and away_penalties is null)
  or (home_score >= 0 and away_score >= 0 and decided_by in ('regular_time', 'extra_time') and home_score <> away_score and home_penalties is null and away_penalties is null)
  or (home_score >= 0 and away_score >= 0 and decided_by = 'penalties' and home_score = away_score and home_penalties >= 0 and away_penalties >= 0 and home_penalties <> away_penalties)
);

create table if not exists public.knockout_dependencies (
  source_event_id text not null references public.events(id) on delete cascade,
  outcome text not null check (outcome in ('winner', 'loser')),
  target_event_id text not null references public.events(id) on delete cascade,
  target_slot text not null check (target_slot in ('home', 'away')),
  primary key (target_event_id, target_slot),
  unique (source_event_id, outcome)
);

alter table public.knockout_dependencies enable row level security;
drop policy if exists "server only knockout_dependencies" on public.knockout_dependencies;
grant select, insert, update, delete on public.knockout_dependencies to service_role;

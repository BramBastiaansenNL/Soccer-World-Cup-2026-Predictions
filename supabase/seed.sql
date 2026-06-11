insert into public.teams (id, name, group_label, flag_emoji, sort_order) values
  ('canada', 'Canada', 'A', '🇨🇦', 10),
  ('mexico', 'Mexico', 'A', '🇲🇽', 20),
  ('united-states', 'United States', 'A', '🇺🇸', 30),
  ('argentina', 'Argentina', null, '🇦🇷', 40),
  ('brazil', 'Brazil', null, '🇧🇷', 50),
  ('england', 'England', null, '🏴', 60),
  ('france', 'France', null, '🇫🇷', 70),
  ('germany', 'Germany', null, '🇩🇪', 80),
  ('netherlands', 'Netherlands', null, '🇳🇱', 90),
  ('portugal', 'Portugal', null, '🇵🇹', 100),
  ('spain', 'Spain', null, '🇪🇸', 110),
  ('belgium', 'Belgium', null, '🇧🇪', 120)
on conflict (id) do update set
  name = excluded.name,
  group_label = excluded.group_label,
  flag_emoji = excluded.flag_emoji,
  sort_order = excluded.sort_order;

insert into public.events (id, type, title, description, stage, points, importance, display_order, locked) values
  ('champion', 'champion', 'Who wins the World Cup?', 'The ultimate fame pick.', 'Tournament', 100, 100, 10, false),
  ('finalist-1', 'finalist', 'Finalist pick 1', 'Pick one country you expect to reach the final.', 'Tournament', 60, 80, 20, false),
  ('finalist-2', 'finalist', 'Finalist pick 2', 'Pick another country you expect to reach the final.', 'Tournament', 60, 80, 30, false),
  ('semi-finalist-1', 'semi_finalist', 'Semi-finalist pick 1', 'Pick a country you expect to reach the semi-finals.', 'Tournament', 35, 70, 40, false),
  ('semi-finalist-2', 'semi_finalist', 'Semi-finalist pick 2', 'Pick a country you expect to reach the semi-finals.', 'Tournament', 35, 70, 50, false),
  ('semi-finalist-3', 'semi_finalist', 'Semi-finalist pick 3', 'Pick a country you expect to reach the semi-finals.', 'Tournament', 35, 70, 60, false),
  ('semi-finalist-4', 'semi_finalist', 'Semi-finalist pick 4', 'Pick a country you expect to reach the semi-finals.', 'Tournament', 35, 70, 70, false),
  ('match-001', 'match_winner', 'Opening match winner', 'Add the actual teams in Admin once ready.', 'Group stage', 8, 30, 100, false)
on conflict (id) do update set
  type = excluded.type,
  title = excluded.title,
  description = excluded.description,
  stage = excluded.stage,
  points = excluded.points,
  importance = excluded.importance,
  display_order = excluded.display_order,
  locked = excluded.locked;

insert into public.event_options (event_id, option_id, label, sort_order)
select e.id, t.id, concat(coalesce(t.flag_emoji || ' ', ''), t.name), t.sort_order
from public.events e
cross join public.teams t
where e.type in ('champion', 'finalist', 'semi_finalist')
on conflict (event_id, option_id) do update set
  label = excluded.label,
  sort_order = excluded.sort_order;

insert into public.event_options (event_id, option_id, label, sort_order) values
  ('match-001', 'team-a', 'Team A', 10),
  ('match-001', 'draw', 'Draw', 20),
  ('match-001', 'team-b', 'Team B', 30)
on conflict (event_id, option_id) do update set
  label = excluded.label,
  sort_order = excluded.sort_order;

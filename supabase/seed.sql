insert into public.teams (id, name, group_label, flag_emoji, sort_order) values
  ('canada', 'Canada', 'B', '', 10),
  ('mexico', 'Mexico', 'A', '', 20),
  ('united-states', 'United States', 'D', '', 30),
  ('argentina', 'Argentina', 'J', '', 40),
  ('brazil', 'Brazil', 'C', '', 50),
  ('england', 'England', 'L', '', 60),
  ('france', 'France', 'I', '', 70),
  ('germany', 'Germany', 'E', '', 80),
  ('netherlands', 'Netherlands', 'F', '', 90),
  ('portugal', 'Portugal', 'K', '', 100),
  ('spain', 'Spain', 'H', '', 110),
  ('belgium', 'Belgium', 'G', '', 120),
  ('south-africa', 'South Africa', 'A', '', 130),
  ('korea-republic', 'Korea Republic', 'A', '', 140),
  ('czechia', 'Czechia', 'A', '', 150),
  ('bosnia-and-herzegovina', 'Bosnia and Herzegovina', 'B', '', 160),
  ('paraguay', 'Paraguay', 'D', '', 170),
  ('haiti', 'Haiti', 'C', '', 180),
  ('scotland', 'Scotland', 'C', '', 190),
  ('australia', 'Australia', 'D', '', 200),
  ('turkiye', 'Turkiye', 'D', '', 210),
  ('morocco', 'Morocco', 'C', '', 220),
  ('qatar', 'Qatar', 'B', '', 230),
  ('switzerland', 'Switzerland', 'B', '', 240),
  ('cote-divoire', 'Cote d''Ivoire', 'E', '', 250),
  ('ecuador', 'Ecuador', 'E', '', 260),
  ('curacao', 'Curacao', 'E', '', 270),
  ('japan', 'Japan', 'F', '', 280),
  ('sweden', 'Sweden', 'F', '', 290),
  ('tunisia', 'Tunisia', 'F', '', 300),
  ('saudi-arabia', 'Saudi Arabia', 'H', '', 310),
  ('uruguay', 'Uruguay', 'H', '', 320),
  ('cabo-verde', 'Cabo Verde', 'H', '', 330),
  ('ir-iran', 'IR Iran', 'G', '', 340),
  ('new-zealand', 'New Zealand', 'G', '', 350),
  ('egypt', 'Egypt', 'G', '', 360),
  ('senegal', 'Senegal', 'I', '', 370),
  ('iraq', 'Iraq', 'I', '', 380),
  ('norway', 'Norway', 'I', '', 390),
  ('algeria', 'Algeria', 'J', '', 400),
  ('austria', 'Austria', 'J', '', 410),
  ('jordan', 'Jordan', 'J', '', 420),
  ('ghana', 'Ghana', 'L', '', 430),
  ('panama', 'Panama', 'L', '', 440),
  ('croatia', 'Croatia', 'L', '', 450),
  ('congo-dr', 'Congo DR', 'K', '', 460),
  ('uzbekistan', 'Uzbekistan', 'K', '', 470),
  ('colombia', 'Colombia', 'K', '', 480)
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
  ('match-001', 'match_winner', 'Thu 11 Jun: Mexico vs South Africa', 'Group A - Mexico City Stadium.', 'Group stage', 8, 30, 100, false),
  ('match-002', 'match_winner', 'Thu 11 Jun: Korea Republic vs Czechia', 'Group A - Estadio Guadalajara.', 'Group stage', 8, 30, 110, false),
  ('match-003', 'match_winner', 'Fri 12 Jun: Canada vs Bosnia and Herzegovina', 'Group B - Toronto Stadium.', 'Group stage', 8, 30, 120, false),
  ('match-004', 'match_winner', 'Fri 12 Jun: United States vs Paraguay', 'Group D - Los Angeles Stadium.', 'Group stage', 8, 30, 130, false),
  ('match-005', 'match_winner', 'Sat 13 Jun: Haiti vs Scotland', 'Group C - Boston Stadium.', 'Group stage', 8, 30, 140, false),
  ('match-006', 'match_winner', 'Sat 13 Jun: Australia vs Turkiye', 'Group D - BC Place Vancouver.', 'Group stage', 8, 30, 150, false),
  ('match-007', 'match_winner', 'Sat 13 Jun: Brazil vs Morocco', 'Group C - New York New Jersey Stadium.', 'Group stage', 8, 30, 160, false),
  ('match-008', 'match_winner', 'Sat 13 Jun: Qatar vs Switzerland', 'Group B - San Francisco Bay Area Stadium.', 'Group stage', 8, 30, 170, false),
  ('match-009', 'match_winner', 'Sun 14 Jun: Cote d''Ivoire vs Ecuador', 'Group E - Philadelphia Stadium.', 'Group stage', 8, 30, 180, false),
  ('match-010', 'match_winner', 'Sun 14 Jun: Germany vs Curacao', 'Group E - Houston Stadium.', 'Group stage', 8, 30, 190, false),
  ('match-011', 'match_winner', 'Sun 14 Jun: Netherlands vs Japan', 'Group F - Dallas Stadium.', 'Group stage', 8, 30, 200, false),
  ('match-012', 'match_winner', 'Sun 14 Jun: Sweden vs Tunisia', 'Group F - Estadio Monterrey.', 'Group stage', 8, 30, 210, false),
  ('match-013', 'match_winner', 'Mon 15 Jun: Saudi Arabia vs Uruguay', 'Group H - Miami Stadium.', 'Group stage', 8, 30, 220, false),
  ('match-014', 'match_winner', 'Mon 15 Jun: Spain vs Cabo Verde', 'Group H - Atlanta Stadium.', 'Group stage', 8, 30, 230, false),
  ('match-015', 'match_winner', 'Mon 15 Jun: IR Iran vs New Zealand', 'Group G - Los Angeles Stadium.', 'Group stage', 8, 30, 240, false),
  ('match-016', 'match_winner', 'Mon 15 Jun: Belgium vs Egypt', 'Group G - Seattle Stadium.', 'Group stage', 8, 30, 250, false),
  ('match-017', 'match_winner', 'Tue 16 Jun: France vs Senegal', 'Group I - New York New Jersey Stadium.', 'Group stage', 8, 30, 260, false),
  ('match-018', 'match_winner', 'Tue 16 Jun: Iraq vs Norway', 'Group I - Boston Stadium.', 'Group stage', 8, 30, 270, false),
  ('match-019', 'match_winner', 'Tue 16 Jun: Argentina vs Algeria', 'Group J - Kansas City Stadium.', 'Group stage', 8, 30, 280, false),
  ('match-020', 'match_winner', 'Tue 16 Jun: Austria vs Jordan', 'Group J - San Francisco Bay Area Stadium.', 'Group stage', 8, 30, 290, false),
  ('match-021', 'match_winner', 'Wed 17 Jun: Ghana vs Panama', 'Group L - Toronto Stadium.', 'Group stage', 8, 30, 300, false),
  ('match-022', 'match_winner', 'Wed 17 Jun: England vs Croatia', 'Group L - Dallas Stadium.', 'Group stage', 8, 30, 310, false),
  ('match-023', 'match_winner', 'Wed 17 Jun: Portugal vs Congo DR', 'Group K - Houston Stadium.', 'Group stage', 8, 30, 320, false),
  ('match-024', 'match_winner', 'Wed 17 Jun: Uzbekistan vs Colombia', 'Group K - Mexico City Stadium.', 'Group stage', 8, 30, 330, false)
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
select e.id, t.id, t.name, t.sort_order
from public.events e
cross join public.teams t
where e.type in ('champion', 'finalist', 'semi_finalist')
on conflict (event_id, option_id) do update set
  label = excluded.label,
  sort_order = excluded.sort_order;

with group_slots (group_label, slot, team_id, team_name) as (
  values
    ('A', 1, 'mexico', 'Mexico'), ('A', 2, 'south-africa', 'South Africa'), ('A', 3, 'korea-republic', 'Korea Republic'), ('A', 4, 'czechia', 'Czechia'),
    ('B', 1, 'canada', 'Canada'), ('B', 2, 'bosnia-and-herzegovina', 'Bosnia and Herzegovina'), ('B', 3, 'qatar', 'Qatar'), ('B', 4, 'switzerland', 'Switzerland'),
    ('C', 1, 'haiti', 'Haiti'), ('C', 2, 'scotland', 'Scotland'), ('C', 3, 'brazil', 'Brazil'), ('C', 4, 'morocco', 'Morocco'),
    ('D', 1, 'united-states', 'United States'), ('D', 2, 'paraguay', 'Paraguay'), ('D', 3, 'australia', 'Australia'), ('D', 4, 'turkiye', 'Turkiye'),
    ('E', 1, 'cote-divoire', 'Cote d''Ivoire'), ('E', 2, 'ecuador', 'Ecuador'), ('E', 3, 'germany', 'Germany'), ('E', 4, 'curacao', 'Curacao'),
    ('F', 1, 'netherlands', 'Netherlands'), ('F', 2, 'japan', 'Japan'), ('F', 3, 'sweden', 'Sweden'), ('F', 4, 'tunisia', 'Tunisia'),
    ('G', 1, 'ir-iran', 'IR Iran'), ('G', 2, 'new-zealand', 'New Zealand'), ('G', 3, 'belgium', 'Belgium'), ('G', 4, 'egypt', 'Egypt'),
    ('H', 1, 'saudi-arabia', 'Saudi Arabia'), ('H', 2, 'uruguay', 'Uruguay'), ('H', 3, 'spain', 'Spain'), ('H', 4, 'cabo-verde', 'Cabo Verde'),
    ('I', 1, 'france', 'France'), ('I', 2, 'senegal', 'Senegal'), ('I', 3, 'iraq', 'Iraq'), ('I', 4, 'norway', 'Norway'),
    ('J', 1, 'argentina', 'Argentina'), ('J', 2, 'algeria', 'Algeria'), ('J', 3, 'austria', 'Austria'), ('J', 4, 'jordan', 'Jordan'),
    ('K', 1, 'portugal', 'Portugal'), ('K', 2, 'congo-dr', 'Congo DR'), ('K', 3, 'uzbekistan', 'Uzbekistan'), ('K', 4, 'colombia', 'Colombia'),
    ('L', 1, 'ghana', 'Ghana'), ('L', 2, 'panama', 'Panama'), ('L', 3, 'england', 'England'), ('L', 4, 'croatia', 'Croatia')
),
group_dates (group_label, matchday, date_label, base_order) as (
  values
    ('A', 2, 'Thu 18 Jun', 340), ('B', 2, 'Thu 18 Jun', 380),
    ('C', 2, 'Fri 19 Jun', 420), ('D', 2, 'Fri 19 Jun', 460),
    ('E', 2, 'Sat 20 Jun', 500), ('F', 2, 'Sat 20 Jun', 540),
    ('G', 2, 'Sun 21 Jun', 580), ('H', 2, 'Sun 21 Jun', 620),
    ('I', 2, 'Mon 22 Jun', 660), ('J', 2, 'Mon 22 Jun', 700),
    ('K', 2, 'Tue 23 Jun', 740), ('L', 2, 'Tue 23 Jun', 780),
    ('A', 3, 'Wed 24 Jun', 360), ('B', 3, 'Wed 24 Jun', 400), ('C', 3, 'Wed 24 Jun', 440),
    ('D', 3, 'Thu 25 Jun', 480), ('E', 3, 'Thu 25 Jun', 520), ('F', 3, 'Thu 25 Jun', 560),
    ('G', 3, 'Fri 26 Jun', 600), ('H', 3, 'Fri 26 Jun', 640), ('I', 3, 'Fri 26 Jun', 680),
    ('J', 3, 'Sat 27 Jun', 720), ('K', 3, 'Sat 27 Jun', 760), ('L', 3, 'Sat 27 Jun', 800)
),
pairings (matchday, pair_no, slot_a, slot_b) as (
  values
    (2, 1, 1, 3), (2, 2, 4, 2),
    (3, 1, 4, 1), (3, 2, 2, 3)
),
generated_matches as (
  select
    'group-' || lower(d.group_label) || '-md' || d.matchday || '-' || p.pair_no as event_id,
    d.date_label || ': ' || a.team_name || ' vs ' || b.team_name as title,
    'Group ' || d.group_label || '.' as description,
    d.base_order + p.pair_no as display_order,
    a.team_id as team_a_id,
    a.team_name as team_a_name,
    b.team_id as team_b_id,
    b.team_name as team_b_name
  from group_dates d
  join pairings p on p.matchday = d.matchday
  join group_slots a on a.group_label = d.group_label and a.slot = p.slot_a
  join group_slots b on b.group_label = d.group_label and b.slot = p.slot_b
)
insert into public.events (id, type, title, description, stage, points, importance, display_order, locked)
select event_id, 'match_winner', title, description, 'Group stage', 8, 30, display_order, false
from generated_matches
on conflict (id) do update set
  type = excluded.type,
  title = excluded.title,
  description = excluded.description,
  stage = excluded.stage,
  points = excluded.points,
  importance = excluded.importance,
  display_order = excluded.display_order,
  locked = excluded.locked;

with group_slots (group_label, slot, team_id, team_name) as (
  values
    ('A', 1, 'mexico', 'Mexico'), ('A', 2, 'south-africa', 'South Africa'), ('A', 3, 'korea-republic', 'Korea Republic'), ('A', 4, 'czechia', 'Czechia'),
    ('B', 1, 'canada', 'Canada'), ('B', 2, 'bosnia-and-herzegovina', 'Bosnia and Herzegovina'), ('B', 3, 'qatar', 'Qatar'), ('B', 4, 'switzerland', 'Switzerland'),
    ('C', 1, 'haiti', 'Haiti'), ('C', 2, 'scotland', 'Scotland'), ('C', 3, 'brazil', 'Brazil'), ('C', 4, 'morocco', 'Morocco'),
    ('D', 1, 'united-states', 'United States'), ('D', 2, 'paraguay', 'Paraguay'), ('D', 3, 'australia', 'Australia'), ('D', 4, 'turkiye', 'Turkiye'),
    ('E', 1, 'cote-divoire', 'Cote d''Ivoire'), ('E', 2, 'ecuador', 'Ecuador'), ('E', 3, 'germany', 'Germany'), ('E', 4, 'curacao', 'Curacao'),
    ('F', 1, 'netherlands', 'Netherlands'), ('F', 2, 'japan', 'Japan'), ('F', 3, 'sweden', 'Sweden'), ('F', 4, 'tunisia', 'Tunisia'),
    ('G', 1, 'ir-iran', 'IR Iran'), ('G', 2, 'new-zealand', 'New Zealand'), ('G', 3, 'belgium', 'Belgium'), ('G', 4, 'egypt', 'Egypt'),
    ('H', 1, 'saudi-arabia', 'Saudi Arabia'), ('H', 2, 'uruguay', 'Uruguay'), ('H', 3, 'spain', 'Spain'), ('H', 4, 'cabo-verde', 'Cabo Verde'),
    ('I', 1, 'france', 'France'), ('I', 2, 'senegal', 'Senegal'), ('I', 3, 'iraq', 'Iraq'), ('I', 4, 'norway', 'Norway'),
    ('J', 1, 'argentina', 'Argentina'), ('J', 2, 'algeria', 'Algeria'), ('J', 3, 'austria', 'Austria'), ('J', 4, 'jordan', 'Jordan'),
    ('K', 1, 'portugal', 'Portugal'), ('K', 2, 'congo-dr', 'Congo DR'), ('K', 3, 'uzbekistan', 'Uzbekistan'), ('K', 4, 'colombia', 'Colombia'),
    ('L', 1, 'ghana', 'Ghana'), ('L', 2, 'panama', 'Panama'), ('L', 3, 'england', 'England'), ('L', 4, 'croatia', 'Croatia')
),
group_dates (group_label, matchday, date_label, base_order) as (
  values
    ('A', 2, 'Thu 18 Jun', 340), ('B', 2, 'Thu 18 Jun', 380),
    ('C', 2, 'Fri 19 Jun', 420), ('D', 2, 'Fri 19 Jun', 460),
    ('E', 2, 'Sat 20 Jun', 500), ('F', 2, 'Sat 20 Jun', 540),
    ('G', 2, 'Sun 21 Jun', 580), ('H', 2, 'Sun 21 Jun', 620),
    ('I', 2, 'Mon 22 Jun', 660), ('J', 2, 'Mon 22 Jun', 700),
    ('K', 2, 'Tue 23 Jun', 740), ('L', 2, 'Tue 23 Jun', 780),
    ('A', 3, 'Wed 24 Jun', 360), ('B', 3, 'Wed 24 Jun', 400), ('C', 3, 'Wed 24 Jun', 440),
    ('D', 3, 'Thu 25 Jun', 480), ('E', 3, 'Thu 25 Jun', 520), ('F', 3, 'Thu 25 Jun', 560),
    ('G', 3, 'Fri 26 Jun', 600), ('H', 3, 'Fri 26 Jun', 640), ('I', 3, 'Fri 26 Jun', 680),
    ('J', 3, 'Sat 27 Jun', 720), ('K', 3, 'Sat 27 Jun', 760), ('L', 3, 'Sat 27 Jun', 800)
),
pairings (matchday, pair_no, slot_a, slot_b) as (
  values
    (2, 1, 1, 3), (2, 2, 4, 2),
    (3, 1, 4, 1), (3, 2, 2, 3)
),
generated_matches as (
  select
    'group-' || lower(d.group_label) || '-md' || d.matchday || '-' || p.pair_no as event_id,
    a.team_id as team_a_id,
    a.team_name as team_a_name,
    b.team_id as team_b_id,
    b.team_name as team_b_name
  from group_dates d
  join pairings p on p.matchday = d.matchday
  join group_slots a on a.group_label = d.group_label and a.slot = p.slot_a
  join group_slots b on b.group_label = d.group_label and b.slot = p.slot_b
),
generated_options as (
  select event_id, team_a_id as option_id, team_a_name as label, 10 as sort_order from generated_matches
  union all
  select event_id, 'draw' as option_id, 'Draw' as label, 20 as sort_order from generated_matches
  union all
  select event_id, team_b_id as option_id, team_b_name as label, 30 as sort_order from generated_matches
)
insert into public.event_options (event_id, option_id, label, sort_order)
select event_id, option_id, label, sort_order
from generated_options
on conflict (event_id, option_id) do update set
  label = excluded.label,
  sort_order = excluded.sort_order;

delete from public.event_options where event_id like 'match-%';

insert into public.event_options (event_id, option_id, label, sort_order) values
  ('match-001', 'mexico', 'Mexico', 10),
  ('match-001', 'draw', 'Draw', 20),
  ('match-001', 'south-africa', 'South Africa', 30),
  ('match-002', 'korea-republic', 'Korea Republic', 10),
  ('match-002', 'draw', 'Draw', 20),
  ('match-002', 'czechia', 'Czechia', 30),
  ('match-003', 'canada', 'Canada', 10),
  ('match-003', 'draw', 'Draw', 20),
  ('match-003', 'bosnia-and-herzegovina', 'Bosnia and Herzegovina', 30),
  ('match-004', 'united-states', 'United States', 10),
  ('match-004', 'draw', 'Draw', 20),
  ('match-004', 'paraguay', 'Paraguay', 30),
  ('match-005', 'haiti', 'Haiti', 10),
  ('match-005', 'draw', 'Draw', 20),
  ('match-005', 'scotland', 'Scotland', 30),
  ('match-006', 'australia', 'Australia', 10),
  ('match-006', 'draw', 'Draw', 20),
  ('match-006', 'turkiye', 'Turkiye', 30),
  ('match-007', 'brazil', 'Brazil', 10),
  ('match-007', 'draw', 'Draw', 20),
  ('match-007', 'morocco', 'Morocco', 30),
  ('match-008', 'qatar', 'Qatar', 10),
  ('match-008', 'draw', 'Draw', 20),
  ('match-008', 'switzerland', 'Switzerland', 30),
  ('match-009', 'cote-divoire', 'Cote d''Ivoire', 10),
  ('match-009', 'draw', 'Draw', 20),
  ('match-009', 'ecuador', 'Ecuador', 30),
  ('match-010', 'germany', 'Germany', 10),
  ('match-010', 'draw', 'Draw', 20),
  ('match-010', 'curacao', 'Curacao', 30),
  ('match-011', 'netherlands', 'Netherlands', 10),
  ('match-011', 'draw', 'Draw', 20),
  ('match-011', 'japan', 'Japan', 30),
  ('match-012', 'sweden', 'Sweden', 10),
  ('match-012', 'draw', 'Draw', 20),
  ('match-012', 'tunisia', 'Tunisia', 30),
  ('match-013', 'saudi-arabia', 'Saudi Arabia', 10),
  ('match-013', 'draw', 'Draw', 20),
  ('match-013', 'uruguay', 'Uruguay', 30),
  ('match-014', 'spain', 'Spain', 10),
  ('match-014', 'draw', 'Draw', 20),
  ('match-014', 'cabo-verde', 'Cabo Verde', 30),
  ('match-015', 'ir-iran', 'IR Iran', 10),
  ('match-015', 'draw', 'Draw', 20),
  ('match-015', 'new-zealand', 'New Zealand', 30),
  ('match-016', 'belgium', 'Belgium', 10),
  ('match-016', 'draw', 'Draw', 20),
  ('match-016', 'egypt', 'Egypt', 30),
  ('match-017', 'france', 'France', 10),
  ('match-017', 'draw', 'Draw', 20),
  ('match-017', 'senegal', 'Senegal', 30),
  ('match-018', 'iraq', 'Iraq', 10),
  ('match-018', 'draw', 'Draw', 20),
  ('match-018', 'norway', 'Norway', 30),
  ('match-019', 'argentina', 'Argentina', 10),
  ('match-019', 'draw', 'Draw', 20),
  ('match-019', 'algeria', 'Algeria', 30),
  ('match-020', 'austria', 'Austria', 10),
  ('match-020', 'draw', 'Draw', 20),
  ('match-020', 'jordan', 'Jordan', 30),
  ('match-021', 'ghana', 'Ghana', 10),
  ('match-021', 'draw', 'Draw', 20),
  ('match-021', 'panama', 'Panama', 30),
  ('match-022', 'england', 'England', 10),
  ('match-022', 'draw', 'Draw', 20),
  ('match-022', 'croatia', 'Croatia', 30),
  ('match-023', 'portugal', 'Portugal', 10),
  ('match-023', 'draw', 'Draw', 20),
  ('match-023', 'congo-dr', 'Congo DR', 30),
  ('match-024', 'uzbekistan', 'Uzbekistan', 10),
  ('match-024', 'draw', 'Draw', 20),
  ('match-024', 'colombia', 'Colombia', 30)
on conflict (event_id, option_id) do update set
  label = excluded.label,
  sort_order = excluded.sort_order;

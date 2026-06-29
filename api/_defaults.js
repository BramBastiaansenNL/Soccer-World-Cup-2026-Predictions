const groups = {
  A: ["mexico", "south-africa", "korea-republic", "czechia"],
  B: ["canada", "bosnia-and-herzegovina", "qatar", "switzerland"],
  C: ["haiti", "scotland", "brazil", "morocco"],
  D: ["united-states", "paraguay", "australia", "turkiye"],
  E: ["cote-divoire", "ecuador", "germany", "curacao"],
  F: ["netherlands", "japan", "sweden", "tunisia"],
  G: ["ir-iran", "new-zealand", "belgium", "egypt"],
  H: ["saudi-arabia", "uruguay", "spain", "cabo-verde"],
  I: ["france", "senegal", "iraq", "norway"],
  J: ["argentina", "algeria", "austria", "jordan"],
  K: ["portugal", "congo-dr", "uzbekistan", "colombia"],
  L: ["ghana", "panama", "england", "croatia"]
};

const teamNames = {
  algeria: "Algeria",
  argentina: "Argentina",
  australia: "Australia",
  austria: "Austria",
  belgium: "Belgium",
  "bosnia-and-herzegovina": "Bosnia and Herzegovina",
  brazil: "Brazil",
  "cabo-verde": "Cabo Verde",
  canada: "Canada",
  colombia: "Colombia",
  "congo-dr": "Congo DR",
  "cote-divoire": "Cote d'Ivoire",
  croatia: "Croatia",
  curacao: "Curacao",
  czechia: "Czechia",
  ecuador: "Ecuador",
  egypt: "Egypt",
  england: "England",
  france: "France",
  germany: "Germany",
  ghana: "Ghana",
  haiti: "Haiti",
  "ir-iran": "IR Iran",
  iraq: "Iraq",
  japan: "Japan",
  jordan: "Jordan",
  "korea-republic": "Korea Republic",
  mexico: "Mexico",
  morocco: "Morocco",
  netherlands: "Netherlands",
  "new-zealand": "New Zealand",
  norway: "Norway",
  panama: "Panama",
  paraguay: "Paraguay",
  portugal: "Portugal",
  qatar: "Qatar",
  "saudi-arabia": "Saudi Arabia",
  scotland: "Scotland",
  senegal: "Senegal",
  "south-africa": "South Africa",
  spain: "Spain",
  sweden: "Sweden",
  switzerland: "Switzerland",
  tunisia: "Tunisia",
  turkiye: "Turkiye",
  "united-states": "United States",
  uruguay: "Uruguay",
  uzbekistan: "Uzbekistan"
};

const matchdayDates = {
  A: ["Thu 11 Jun", "Thu 18 Jun", "Wed 24 Jun"],
  B: ["Fri 12 Jun", "Thu 18 Jun", "Wed 24 Jun"],
  C: ["Sat 13 Jun", "Fri 19 Jun", "Wed 24 Jun"],
  D: ["Fri 12 Jun", "Fri 19 Jun", "Thu 25 Jun"],
  E: ["Sun 14 Jun", "Sat 20 Jun", "Thu 25 Jun"],
  F: ["Sun 14 Jun", "Sat 20 Jun", "Thu 25 Jun"],
  G: ["Mon 15 Jun", "Sun 21 Jun", "Fri 26 Jun"],
  H: ["Mon 15 Jun", "Sun 21 Jun", "Fri 26 Jun"],
  I: ["Tue 16 Jun", "Mon 22 Jun", "Fri 26 Jun"],
  J: ["Tue 16 Jun", "Mon 22 Jun", "Sat 27 Jun"],
  K: ["Wed 17 Jun", "Tue 23 Jun", "Sat 27 Jun"],
  L: ["Wed 17 Jun", "Tue 23 Jun", "Sat 27 Jun"]
};

const matchdayPairings = [
  [[1, 2], [3, 4]],
  [[1, 3], [4, 2]],
  [[4, 1], [2, 3]]
];

const knockoutRounds = [
  {
    stage: "Round of 32",
    points: 15,
    matches: [
      ["match-073", "Sun 28 Jun", "South Africa", "south-africa", "Canada", "canada", "Los Angeles Stadium"],
      ["match-074", "Mon 29 Jun", "Germany", "germany", "Paraguay", "paraguay", "Boston Stadium"],
      ["match-075", "Mon 29 Jun", "Netherlands", "netherlands", "Morocco", "morocco", "Estadio Monterrey"],
      ["match-076", "Mon 29 Jun", "Brazil", "brazil", "Japan", "japan", "Houston Stadium"],
      ["match-077", "Tue 30 Jun", "France", "france", "Sweden", "sweden", "New York New Jersey Stadium"],
      ["match-078", "Tue 30 Jun", "Cote d'Ivoire", "cote-divoire", "Norway", "norway", "Dallas Stadium"],
      ["match-079", "Tue 30 Jun", "Mexico", "mexico", "Ecuador", "ecuador", "Mexico City Stadium"],
      ["match-080", "Wed 1 Jul", "England", "england", "Congo DR", "congo-dr", "Atlanta Stadium"],
      ["match-081", "Wed 1 Jul", "United States", "united-states", "Bosnia and Herzegovina", "bosnia-and-herzegovina", "San Francisco Bay Area Stadium"],
      ["match-082", "Wed 1 Jul", "Belgium", "belgium", "Senegal", "senegal", "Seattle Stadium"],
      ["match-083", "Thu 2 Jul", "Portugal", "portugal", "Croatia", "croatia", "Toronto Stadium"],
      ["match-084", "Thu 2 Jul", "Spain", "spain", "Austria", "austria", "Los Angeles Stadium"],
      ["match-085", "Thu 2 Jul", "Switzerland", "switzerland", "Algeria", "algeria", "BC Place Vancouver"],
      ["match-086", "Fri 3 Jul", "Argentina", "argentina", "Cabo Verde", "cabo-verde", "Miami Stadium"],
      ["match-087", "Fri 3 Jul", "Colombia", "colombia", "Ghana", "ghana", "Kansas City Stadium"],
      ["match-088", "Fri 3 Jul", "Australia", "australia", "Egypt", "egypt", "Dallas Stadium"]
    ]
  },
  { stage: "Round of 16", points: 15, dates: [["match-089", "Sat 4 Jul"], ["match-090", "Sat 4 Jul"], ["match-091", "Sun 5 Jul"], ["match-092", "Sun 5 Jul"], ["match-093", "Mon 6 Jul"], ["match-094", "Mon 6 Jul"], ["match-095", "Tue 7 Jul"], ["match-096", "Tue 7 Jul"]] },
  { stage: "Quarterfinals", points: 15, dates: [["match-097", "Thu 9 Jul"], ["match-098", "Fri 10 Jul"], ["match-099", "Sat 11 Jul"], ["match-100", "Sat 11 Jul"]] },
  { stage: "Semifinals", points: 15, dates: [["match-101", "Tue 14 Jul"], ["match-102", "Wed 15 Jul"]] },
  { stage: "Third-place playoff", points: 15, dates: [["match-103", "Sat 18 Jul"]] },
  { stage: "Final", points: 15, dates: [["match-104", "Sun 19 Jul"]] }
];

const knockoutDependencies = [
  ["match-073", "winner", "match-089", "home"], ["match-075", "winner", "match-089", "away"],
  ["match-074", "winner", "match-090", "home"], ["match-077", "winner", "match-090", "away"],
  ["match-076", "winner", "match-091", "home"], ["match-078", "winner", "match-091", "away"],
  ["match-079", "winner", "match-092", "home"], ["match-080", "winner", "match-092", "away"],
  ["match-083", "winner", "match-093", "home"], ["match-084", "winner", "match-093", "away"],
  ["match-081", "winner", "match-094", "home"], ["match-082", "winner", "match-094", "away"],
  ["match-086", "winner", "match-095", "home"], ["match-088", "winner", "match-095", "away"],
  ["match-085", "winner", "match-096", "home"], ["match-087", "winner", "match-096", "away"],
  ["match-089", "winner", "match-097", "home"], ["match-090", "winner", "match-097", "away"],
  ["match-093", "winner", "match-098", "home"], ["match-094", "winner", "match-098", "away"],
  ["match-091", "winner", "match-099", "home"], ["match-092", "winner", "match-099", "away"],
  ["match-095", "winner", "match-100", "home"], ["match-096", "winner", "match-100", "away"],
  ["match-097", "winner", "match-101", "home"], ["match-098", "winner", "match-101", "away"],
  ["match-099", "winner", "match-102", "home"], ["match-100", "winner", "match-102", "away"],
  ["match-101", "loser", "match-103", "home"], ["match-102", "loser", "match-103", "away"],
  ["match-101", "winner", "match-104", "home"], ["match-102", "winner", "match-104", "away"]
].map(([source_event_id, outcome, target_event_id, target_slot]) => ({
  source_event_id,
  outcome,
  target_event_id,
  target_slot
}));

// Kickoff instants, used as per-match voting deadlines.
const knockoutClosesAt = {
  "match-073": "2026-06-28T19:00:00.000Z",
  "match-074": "2026-06-29T20:30:00.000Z",
  "match-075": "2026-06-30T01:00:00.000Z",
  "match-076": "2026-06-29T17:00:00.000Z",
  "match-077": "2026-06-30T21:00:00.000Z",
  "match-078": "2026-06-30T17:00:00.000Z",
  "match-079": "2026-07-01T01:00:00.000Z",
  "match-080": "2026-07-01T16:00:00.000Z",
  "match-081": "2026-07-02T00:00:00.000Z",
  "match-082": "2026-07-01T20:00:00.000Z",
  "match-083": "2026-07-02T23:00:00.000Z",
  "match-084": "2026-07-02T19:00:00.000Z",
  "match-085": "2026-07-03T03:00:00.000Z",
  "match-086": "2026-07-03T18:00:00.000Z",
  "match-087": "2026-07-03T22:00:00.000Z",
  "match-088": "2026-07-04T01:30:00.000Z",
  "match-089": "2026-07-04T21:00:00.000Z",
  "match-090": "2026-07-04T17:00:00.000Z",
  "match-091": "2026-07-05T20:00:00.000Z",
  "match-092": "2026-07-06T00:00:00.000Z",
  "match-093": "2026-07-06T19:00:00.000Z",
  "match-094": "2026-07-07T00:00:00.000Z",
  "match-095": "2026-07-07T16:00:00.000Z",
  "match-096": "2026-07-07T20:00:00.000Z",
  "match-097": "2026-07-09T20:00:00.000Z",
  "match-098": "2026-07-10T19:00:00.000Z",
  "match-099": "2026-07-11T21:00:00.000Z",
  "match-100": "2026-07-12T01:00:00.000Z",
  "match-101": "2026-07-14T19:00:00.000Z",
  "match-102": "2026-07-15T19:00:00.000Z",
  "match-103": "2026-07-18T21:00:00.000Z",
  "match-104": "2026-07-19T19:00:00.000Z"
};

function knockoutDeadline(dateLabel) {
  const [, day, month] = dateLabel.match(/(\d{1,2})\s+(Jun|Jul)/i) || [];
  if (!day) return null;
  const monthIndex = month.toLowerCase() === "jun" ? 5 : 6;
  return new Date(Date.UTC(2026, monthIndex, Number(day), 8, 0, 0)).toISOString();
}

function getKnockoutMatches() {
  const events = [];
  const options = [];
  let displayOrder = 820;

  for (const round of knockoutRounds) {
    const rows = round.matches || round.dates;
    for (const row of rows) {
      const [id, dateLabel, homeLabel, homeId, awayLabel, awayId, venue] = row;
      const sources = knockoutDependencies.filter((dependency) => dependency.target_event_id === id);
      const homeSource = sources.find((dependency) => dependency.target_slot === "home");
      const awaySource = sources.find((dependency) => dependency.target_slot === "away");
      const resolvedHomeLabel = homeLabel || `${homeSource.outcome === "loser" ? "Loser" : "Winner"} of ${homeSource.source_event_id}`;
      const resolvedAwayLabel = awayLabel || `${awaySource.outcome === "loser" ? "Loser" : "Winner"} of ${awaySource.source_event_id}`;
      const resolvedHomeId = homeId || `${homeSource.outcome}-${homeSource.source_event_id}`;
      const resolvedAwayId = awayId || `${awaySource.outcome}-${awaySource.source_event_id}`;

      events.push({
        id,
        type: "knockout_match_winner",
        title: `${dateLabel}: ${resolvedHomeLabel} vs ${resolvedAwayLabel}`,
        description: venue ? `${round.stage} - ${venue}. Pick the team that advances.` : `${round.stage}. Pick the team that advances.`,
        stage: round.stage,
        points: round.points,
        importance: 50,
        display_order: displayOrder,
        locked: false,
        closes_at: knockoutClosesAt[id] || knockoutDeadline(dateLabel)
      });
      options.push(
        { event_id: id, option_id: resolvedHomeId, label: resolvedHomeLabel, sort_order: 10 },
        { event_id: id, option_id: resolvedAwayId, label: resolvedAwayLabel, sort_order: 30 }
      );
      displayOrder += 10;
    }
  }

  return { events, options };
}

function getDefaultTeams() {
  const groupByTeam = Object.fromEntries(
    Object.entries(groups).flatMap(([group, teams]) => teams.map((team) => [team, group]))
  );

  return Object.entries(teamNames).map(([id, name], index) => ({
    id,
    name,
    group_label: groupByTeam[id] || null,
    flag_emoji: "",
    sort_order: (index + 1) * 10
  }));
}

function getDefaultEvents() {
  const tournamentEvents = [
    ["champion", "champion", "Who wins the World Cup?", "The ultimate fame pick.", 100, 100, 10],
    ["finalist-1", "finalist", "Finalist pick 1", "Pick one country you expect to reach the final.", 60, 80, 20],
    ["finalist-2", "finalist", "Finalist pick 2", "Pick another country you expect to reach the final.", 60, 80, 30],
    ["semi-finalist-1", "semi_finalist", "Semi-finalist pick 1", "Pick a country you expect to reach the semi-finals.", 35, 70, 40],
    ["semi-finalist-2", "semi_finalist", "Semi-finalist pick 2", "Pick a country you expect to reach the semi-finals.", 35, 70, 50],
    ["semi-finalist-3", "semi_finalist", "Semi-finalist pick 3", "Pick a country you expect to reach the semi-finals.", 35, 70, 60],
    ["semi-finalist-4", "semi_finalist", "Semi-finalist pick 4", "Pick a country you expect to reach the semi-finals.", 35, 70, 70],
    ["__champion-change-penalty", "champion", "Champion pick change penalty", "Internal score adjustment for champion pick changes.", 1, 0, 9999]
  ].map(([id, type, title, description, points, importance, display_order]) => ({
    id,
    type,
    title,
    description,
    stage: "Tournament",
    points,
    importance,
    display_order,
    locked: false
  }));

  return [...tournamentEvents, ...getDefaultMatches().events, ...getKnockoutMatches().events];
}

function getDefaultOptions() {
  const teams = getDefaultTeams();
  const tournamentOptions = getDefaultEvents()
    .filter((event) => ["champion", "finalist", "semi_finalist"].includes(event.type) && !event.id.startsWith("__"))
    .flatMap((event) => teams.map((team) => ({
      event_id: event.id,
      option_id: team.id,
      label: team.name,
      sort_order: team.sort_order
    })));

  return [...tournamentOptions, ...getDefaultMatches().options, ...getKnockoutMatches().options];
}

function getDefaultMatchIds() {
  return getDefaultMatches().events.map((event) => event.id);
}

function getDefaultMatches() {
  const events = [];
  const options = [];
  let order = 100;
  let matchNumber = 1;

  for (const [group, teamIds] of Object.entries(groups)) {
    for (let matchdayIndex = 0; matchdayIndex < matchdayPairings.length; matchdayIndex += 1) {
      for (let pairIndex = 0; pairIndex < matchdayPairings[matchdayIndex].length; pairIndex += 1) {
        const [slotA, slotB] = matchdayPairings[matchdayIndex][pairIndex];
        const teamA = teamIds[slotA - 1];
        const teamB = teamIds[slotB - 1];
        const eventId = `match-${String(matchNumber).padStart(3, "0")}`;
        const date = matchdayDates[group][matchdayIndex];

        events.push({
          id: eventId,
          type: "match_winner",
          title: `${date}: ${teamNames[teamA]} vs ${teamNames[teamB]}`,
          description: `Group ${group}.`,
          stage: "Group stage",
          points: 8,
          importance: 30,
          display_order: order,
          locked: false
        });

        options.push(
          { event_id: eventId, option_id: teamA, label: teamNames[teamA], sort_order: 10 },
          { event_id: eventId, option_id: "draw", label: "Draw", sort_order: 20 },
          { event_id: eventId, option_id: teamB, label: teamNames[teamB], sort_order: 30 }
        );

        order += 10;
        matchNumber += 1;
      }
    }
  }

  return { events, options };
}

module.exports = {
  getDefaultEvents,
  getDefaultMatchIds,
  getDefaultOptions,
  getDefaultTeams,
  getKnockoutDependencies: () => knockoutDependencies.map((dependency) => ({ ...dependency })),
  getKnockoutMatches
};

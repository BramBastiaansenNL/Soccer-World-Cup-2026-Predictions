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
    ["semi-finalist-4", "semi_finalist", "Semi-finalist pick 4", "Pick a country you expect to reach the semi-finals.", 35, 70, 70]
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

  return [...tournamentEvents, ...getDefaultMatches().events];
}

function getDefaultOptions() {
  const teams = getDefaultTeams();
  const tournamentOptions = getDefaultEvents()
    .filter((event) => ["champion", "finalist", "semi_finalist"].includes(event.type))
    .flatMap((event) => teams.map((team) => ({
      event_id: event.id,
      option_id: team.id,
      label: team.name,
      sort_order: team.sort_order
    })));

  return [...tournamentOptions, ...getDefaultMatches().options];
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
  getDefaultTeams
};

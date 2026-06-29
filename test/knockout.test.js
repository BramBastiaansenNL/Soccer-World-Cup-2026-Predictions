const assert = require("node:assert/strict");
const test = require("node:test");
const { getKnockoutDependencies, getKnockoutMatches } = require("../api/_defaults");
const { normalizeScoreResult } = require("../api/_results");
const { resolveTargetOptions } = require("../api/_bracket");
const { getEventDisplayTitle, hasResolvedParticipants } = require("../date-utils");

const knockoutEvent = { id: "match-085", type: "knockout_match_winner" };
const knockoutOptions = [
  { option_id: "switzerland", label: "Switzerland", sort_order: 10 },
  { option_id: "algeria", label: "Algeria", sort_order: 30 }
];

test("defines every knockout event with two non-draw options", () => {
  const { events, options } = getKnockoutMatches();
  assert.equal(events.length, 32);
  assert.deepEqual([events[0].id, events.at(-1).id], ["match-073", "match-104"]);
  assert.ok(events.every((event) => event.type === "knockout_match_winner" && event.points === 15 && event.closes_at));
  for (const event of events) {
    const eventOptions = options.filter((option) => option.event_id === event.id);
    assert.equal(eventOptions.length, 2);
    assert.ok(eventOptions.every((option) => option.option_id !== "draw"));
  }
});

test("uses verified kickoff instants and localizes displayed knockout dates", () => {
  const { events, options } = getKnockoutMatches();
  const byId = new Map(events.map((event) => [event.id, {
    ...event,
    closesAt: event.closes_at,
    options: options.filter((option) => option.event_id === event.id).map((option) => ({
      optionId: option.option_id,
      label: option.label
    }))
  }]));
  assert.equal(byId.get("match-073").closesAt, "2026-06-28T19:00:00.000Z");
  assert.equal(byId.get("match-075").closesAt, "2026-06-30T01:00:00.000Z");
  assert.equal(byId.get("match-085").closesAt, "2026-07-03T03:00:00.000Z");
  assert.equal(byId.get("match-104").closesAt, "2026-07-19T19:00:00.000Z");
  assert.match(getEventDisplayTitle(byId.get("match-075"), "en-GB", "Europe/Berlin"), /^Tue,? 30 Jun: Netherlands vs Morocco$/);

  const expectedEasternKickoffs = [
    "06-28 15:00", "06-29 16:30", "06-29 21:00", "06-29 13:00",
    "06-30 17:00", "06-30 13:00", "06-30 21:00", "07-01 12:00",
    "07-01 20:00", "07-01 16:00", "07-02 19:00", "07-02 15:00",
    "07-02 23:00", "07-03 14:00", "07-03 18:00", "07-03 21:30",
    "07-04 17:00", "07-04 13:00", "07-05 16:00", "07-05 20:00",
    "07-06 15:00", "07-06 20:00", "07-07 12:00", "07-07 16:00",
    "07-09 16:00", "07-10 15:00", "07-11 17:00", "07-11 21:00",
    "07-14 15:00", "07-15 15:00", "07-18 17:00", "07-19 15:00"
  ];
  const easternFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  });
  const actualEasternKickoffs = events.map((event) => {
    const parts = Object.fromEntries(easternFormatter.formatToParts(new Date(event.closes_at)).map((part) => [part.type, part.value]));
    return `${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
  });
  assert.deepEqual(actualEasternKickoffs, expectedEasternKickoffs);
});

test("uses the requested bracket dependencies including semifinal losers", () => {
  const dependencies = getKnockoutDependencies();
  assert.equal(dependencies.length, 32);
  const edge = (source, outcome, target, slot) => dependencies.some((dependency) =>
    dependency.source_event_id === source && dependency.outcome === outcome
      && dependency.target_event_id === target && dependency.target_slot === slot);
  assert.ok(edge("match-073", "winner", "match-089", "home"));
  assert.ok(edge("match-075", "winner", "match-089", "away"));
  assert.ok(edge("match-074", "winner", "match-090", "home"));
  assert.ok(edge("match-077", "winner", "match-090", "away"));
  assert.ok(edge("match-101", "loser", "match-103", "home"));
  assert.ok(edge("match-102", "winner", "match-104", "away"));
});

test("replaces placeholders and opens a dependent prediction after both winners exist", () => {
  const { options } = getKnockoutMatches();
  const dependencies = getKnockoutDependencies().filter((dependency) => dependency.target_event_id === "match-089");
  const optionsByEvent = new Map(["match-073", "match-075"].map((eventId) => [
    eventId,
    options.filter((option) => option.event_id === eventId)
  ]));
  const oneWinner = resolveTargetOptions(dependencies, new Map([
    ["match-073", { winning_option_id: "canada" }]
  ]), optionsByEvent);
  assert.deepEqual(oneWinner.map((option) => option.label), ["Canada", "Winner of match-075"]);

  const bothWinners = resolveTargetOptions(dependencies, new Map([
    ["match-073", { winning_option_id: "canada" }],
    ["match-075", { winning_option_id: "netherlands" }]
  ]), optionsByEvent);
  const event = {
    type: "knockout_match_winner",
    options: bothWinners.map((option) => ({ optionId: option.option_id, label: option.label }))
  };
  assert.deepEqual(event.options.map((option) => option.label), ["Canada", "Netherlands"]);
  assert.equal(hasResolvedParticipants(event), true);
});

test("normalizes a regular-time knockout result and infers a legacy winner", () => {
  const result = normalizeScoreResult(knockoutEvent, knockoutOptions, { homeScore: 0, awayScore: 1 });
  assert.equal(result.winnerOptionId, "algeria");
  assert.equal(result.decidedBy, "regular_time");
});

test("validates and formats a penalty shootout", () => {
  const result = normalizeScoreResult(knockoutEvent, knockoutOptions, {
    homeScore: 1,
    awayScore: 1,
    homePenalties: 4,
    awayPenalties: 5,
    winnerOptionId: "algeria",
    decidedBy: "penalties"
  });
  assert.equal(result.winningLabel, "Switzerland 1-1 Algeria (4-5 pens)");
  assert.throws(() => normalizeScoreResult(knockoutEvent, knockoutOptions, {
    homeScore: 1,
    awayScore: 1,
    homePenalties: 4,
    awayPenalties: 4,
    decidedBy: "penalties"
  }), /Exactly one team/);
});

test("rejects draws and inconsistent winners in knockout matches", () => {
  assert.throws(() => normalizeScoreResult(knockoutEvent, knockoutOptions, {
    homeScore: 1,
    awayScore: 1,
    decidedBy: "regular_time"
  }), /cannot be tied/);
  assert.throws(() => normalizeScoreResult(knockoutEvent, knockoutOptions, {
    homeScore: 2,
    awayScore: 1,
    winnerOptionId: "algeria",
    decidedBy: "extra_time"
  }), /does not match/);
});

test("keeps legacy group-stage draw inference", () => {
  const groupEvent = { id: "match-001", type: "match_winner" };
  const groupOptions = [
    knockoutOptions[0],
    { option_id: "draw", label: "Draw", sort_order: 20 },
    knockoutOptions[1]
  ];
  const result = normalizeScoreResult(groupEvent, groupOptions, { homeScore: 1, awayScore: 1 });
  assert.equal(result.winnerOptionId, "draw");
  assert.equal(result.decidedBy, null);
});

const assert = require("node:assert/strict");
const test = require("node:test");
const { getKnockoutDependencies, getKnockoutMatches } = require("../api/_defaults");
const { normalizeScoreResult } = require("../api/_results");

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

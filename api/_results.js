const ALLOWED_DECISIONS = new Set(["regular_time", "extra_time", "penalties"]);

function badRequest(message) {
  return Object.assign(new Error(message), { status: 400 });
}

function score(value, label, required = true) {
  if (!required && (value === undefined || value === null || value === "")) return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw badRequest(`${label} must be a non-negative whole number.`);
  }
  return parsed;
}

function normalizeScoreResult(event, options, payload) {
  const teamOptions = options.filter((option) => option.option_id !== "draw").sort((a, b) => a.sort_order - b.sort_order);
  if (teamOptions.length !== 2) throw badRequest("Score updates require exactly two team options.");

  const [home, away] = teamOptions;
  if ([home, away].some((option) => /^(winner|loser)-match-\d{3}$/.test(option.option_id))) {
    throw badRequest("This knockout match still has unresolved participants.");
  }

  const homeScore = score(payload.homeScore, "Home score");
  const awayScore = score(payload.awayScore, "Away score");
  const isKnockout = event.type === "knockout_match_winner";
  let decidedBy = payload.decidedBy || null;

  if (!decidedBy) {
    if (homeScore === awayScore) {
      if (isKnockout) throw badRequest("Knockout matches need a winner and an explicit decidedBy value.");
      decidedBy = null;
    } else {
      decidedBy = "regular_time";
    }
  }
  if (!isKnockout && homeScore === awayScore && decidedBy === "regular_time") decidedBy = null;
  if (decidedBy && !ALLOWED_DECISIONS.has(decidedBy)) throw badRequest("decidedBy must be regular_time, extra_time, or penalties.");

  let homePenalties = null;
  let awayPenalties = null;
  let inferredWinner;
  if (decidedBy === "penalties") {
    if (!isKnockout) throw badRequest("Penalty shootouts are only valid for knockout matches.");
    if (homeScore !== awayScore) throw badRequest("A penalty result must have a tied match score.");
    homePenalties = score(payload.homePenalties, "Home penalties");
    awayPenalties = score(payload.awayPenalties, "Away penalties");
    if (homePenalties === awayPenalties) throw badRequest("Exactly one team must win the penalty shootout.");
    inferredWinner = homePenalties > awayPenalties ? home.option_id : away.option_id;
  } else {
    if (!decidedBy && (isKnockout || homeScore !== awayScore)) throw badRequest("A clear winner needs a valid decidedBy value.");
    if (homeScore === awayScore && isKnockout) throw badRequest("A knockout match decided in regular or extra time cannot be tied.");
    if (homeScore === awayScore) inferredWinner = "draw";
    else inferredWinner = homeScore > awayScore ? home.option_id : away.option_id;
  }

  const winnerOptionId = payload.winnerOptionId || inferredWinner;
  const validWinnerIds = isKnockout ? [home.option_id, away.option_id] : [home.option_id, "draw", away.option_id];
  if (!validWinnerIds.includes(winnerOptionId)) throw badRequest("winnerOptionId is not a valid option for this match.");
  if (winnerOptionId !== inferredWinner) throw badRequest("winnerOptionId does not match the supplied score.");

  const suffix = decidedBy === "penalties"
    ? ` (${homePenalties}-${awayPenalties} pens)`
    : decidedBy === "extra_time" ? " (AET)" : "";

  return {
    eventId: event.id,
    homeScore,
    awayScore,
    winnerOptionId,
    decidedBy,
    homePenalties,
    awayPenalties,
    winningLabel: `${home.label} ${homeScore}-${awayScore} ${away.label}${suffix}`,
    home,
    away
  };
}

module.exports = { ALLOWED_DECISIONS, normalizeScoreResult };

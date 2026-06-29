const { handleError, json, requireConfig, supabase } = require("./_supabase");
const { getDefaultEvents, getDefaultOptions, getDefaultTeams, getKnockoutDependencies } = require("./_defaults");

let defaultsChecked = false;

function rankLeaderboard(submissions, predictions) {
  const bySubmission = new Map();

  for (const submission of submissions) {
    bySubmission.set(submission.id, {
      id: submission.id,
      displayName: submission.display_name,
      submittedAt: submission.submitted_at,
      totalPoints: 0,
      correctPicks: 0,
      picks: 0
    });
  }

  for (const prediction of predictions) {
    const row = bySubmission.get(prediction.submission_id);
    if (!row) continue;
    row.totalPoints += prediction.points_awarded || 0;
    if (String(prediction.event_id || "").startsWith("__")) continue;
    row.picks += 1;
    if ((prediction.points_awarded || 0) > 0) row.correctPicks += 1;
  }

  return [...bySubmission.values()]
    .sort((a, b) => b.totalPoints - a.totalPoints || b.correctPicks - a.correctPicks || a.displayName.localeCompare(b.displayName))
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return json(res, 405, { error: "Method not allowed." });
  }

  if (!requireConfig(res)) return;

  try {
    await ensureDefaultData();

    const [events, options, results, submissions, predictions, dependencies] = await Promise.all([
      supabase("events?select=*&order=display_order.asc"),
      supabase("event_options?select=*&order=sort_order.asc"),
      supabase("results?select=*"),
      supabase("submissions?select=*&order=submitted_at.asc"),
      supabase("predictions?select=*"),
      supabase("knockout_dependencies?select=*")
    ]);

    const sourcesByTarget = dependencies.reduce((acc, dependency) => {
      acc[dependency.target_event_id] ||= {};
      acc[dependency.target_event_id][dependency.target_slot] = {
        eventId: dependency.source_event_id,
        outcome: dependency.outcome
      };
      return acc;
    }, {});
    const advancesBySource = dependencies.reduce((acc, dependency) => {
      acc[dependency.source_event_id] ||= {};
      acc[dependency.source_event_id][dependency.outcome] = {
        eventId: dependency.target_event_id,
        slot: dependency.target_slot
      };
      return acc;
    }, {});

    const optionsByEvent = options.reduce((acc, option) => {
      acc[option.event_id] ||= [];
      acc[option.event_id].push({
        optionId: option.option_id,
        label: option.label,
        sortOrder: option.sort_order
      });
      return acc;
    }, {});

    const resultsByEvent = results.reduce((acc, result) => {
      acc[result.event_id] = {
        winningOptionId: result.winning_option_id,
        winningLabel: result.winning_label,
        homeScore: result.home_score,
        awayScore: result.away_score,
        winnerOptionId: result.winning_option_id,
        decidedBy: result.decided_by,
        homePenalties: result.home_penalties,
        awayPenalties: result.away_penalties,
        decidedAt: result.decided_at
      };
      return acc;
    }, {});

    json(res, 200, {
      events: events.map((event) => ({
        id: event.id,
        type: event.type,
        title: event.title,
        description: event.description,
        stage: event.stage,
        points: event.points,
        importance: event.importance,
        displayOrder: event.display_order,
        locked: event.locked,
        closesAt: event.closes_at,
        options: optionsByEvent[event.id] || [],
        result: resultsByEvent[event.id] || null,
        participantSources: sourcesByTarget[event.id] || null,
        advancesTo: advancesBySource[event.id] || null
      })),
      submissions: submissions.map((submission) => ({
        id: submission.id,
        displayName: submission.display_name,
        normalizedName: submission.normalized_name,
        submittedAt: submission.submitted_at
      })),
      predictions: predictions.map((prediction) => ({
        submissionId: prediction.submission_id,
        eventId: prediction.event_id,
        selectedOptionId: prediction.selected_option_id,
        selectedLabel: prediction.selected_label,
        pointsAwarded: prediction.points_awarded
      })),
      leaderboard: rankLeaderboard(submissions, predictions)
    });
  } catch (error) {
    handleError(res, error);
  }
};

async function ensureDefaultData() {
  if (defaultsChecked || process.env.AUTO_SEED_DEFAULTS === "false") return;

  const [existingEvents, existingOptions, existingDependencies] = await Promise.all([
    supabase("events?select=id,type"),
    supabase("event_options?select=event_id,option_id"),
    supabase("knockout_dependencies?select=source_event_id,outcome,target_event_id,target_slot")
  ]);
  const hasEnoughMatches = existingEvents.filter((event) => event.type === "match_winner").length >= 72;
  const hasKnockoutMatches = existingEvents.filter((event) => event.type === "knockout_match_winner").length >= 32;
  const hasChampion = existingEvents.some((event) => event.id === "champion");
  const hasPenalty = existingEvents.some((event) => event.id === "__champion-change-penalty");
  if (hasEnoughMatches && hasKnockoutMatches && existingDependencies.length >= 32 && hasChampion && hasPenalty) {
    defaultsChecked = true;
    return;
  }

  const defaultTeams = getDefaultTeams();
  const defaultEvents = getDefaultEvents();
  const defaultOptions = getDefaultOptions();
  const defaultDependencies = getKnockoutDependencies();
  const existingEventIds = new Set(existingEvents.map((event) => event.id));
  const existingOptionKeys = new Set(existingOptions.map((option) => `${option.event_id}:${option.option_id}`));
  const missingEvents = defaultEvents.filter((event) => !existingEventIds.has(event.id));
  const missingOptions = defaultOptions.filter((option) => !existingOptionKeys.has(`${option.event_id}:${option.option_id}`));

  await supabase("teams", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify(defaultTeams)
  });

  if (missingEvents.length) {
    await supabase("events", { method: "POST", body: JSON.stringify(missingEvents) });
  }

  if (missingOptions.length) {
    await supabase("event_options", { method: "POST", body: JSON.stringify(missingOptions) });
  }

  await supabase("knockout_dependencies", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify(defaultDependencies)
  });

  defaultsChecked = true;
}

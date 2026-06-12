const { handleError, json, requireConfig, supabase } = require("./_supabase");
const { getDefaultEvents, getDefaultMatchIds, getDefaultOptions, getDefaultTeams } = require("./_defaults");

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

    const [events, options, results, submissions, predictions] = await Promise.all([
      supabase("events?select=*&order=display_order.asc"),
      supabase("event_options?select=*&order=sort_order.asc"),
      supabase("results?select=*"),
      supabase("submissions?select=*&order=submitted_at.asc"),
      supabase("predictions?select=*")
    ]);

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
        result: resultsByEvent[event.id] || null
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

  const existingEvents = await supabase("events?select=id,type");
  const hasEnoughMatches = existingEvents.filter((event) => event.type === "match_winner").length >= 72;
  const hasChampion = existingEvents.some((event) => event.id === "champion");
  const hasPenalty = existingEvents.some((event) => event.id === "__champion-change-penalty");
  if (hasEnoughMatches && hasChampion && hasPenalty) {
    defaultsChecked = true;
    return;
  }

  const defaultTeams = getDefaultTeams();
  const defaultEvents = getDefaultEvents();
  const defaultOptions = getDefaultOptions();
  const defaultMatchIds = getDefaultMatchIds();

  await supabase("teams", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify(defaultTeams)
  });

  await supabase("events", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify(defaultEvents)
  });

  await supabase(`event_options?event_id=in.(${defaultMatchIds.join(",")})`, {
    method: "DELETE"
  });

  await supabase("event_options", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify(defaultOptions)
  });

  defaultsChecked = true;
}

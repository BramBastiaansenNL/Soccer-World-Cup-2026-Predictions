const { handleError, json, normalizeName, readBody, requireConfig, supabase } = require("./_supabase");

const CHAMPION_EVENT_ID = "champion";
const PENALTY_EVENT_ID = "__champion-change-penalty";
const PENALTY_POINTS = 20;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed." });
  }

  if (!requireConfig(res)) return;

  try {
    const body = await readBody(req);
    const displayName = String(body.displayName || "").trim().replace(/\s+/g, " ");
    const normalizedName = normalizeName(displayName);
    const optionId = String(body.optionId || "").trim();

    if (!normalizedName || !optionId) {
      return json(res, 400, { error: "Display name and new champion pick are required." });
    }

    const [submission] = await supabase(`submissions?normalized_name=eq.${encodeURIComponent(normalizedName)}&select=*`);
    if (!submission) {
      return json(res, 404, { error: "No saved picks found for that display name." });
    }

    const [championEvent] = await supabase(`events?id=eq.${CHAMPION_EVENT_ID}&select=id,locked`);
    if (!championEvent || championEvent.locked) {
      return json(res, 400, { error: "Champion picks are locked." });
    }

    const [newOption] = await supabase(`event_options?event_id=eq.${CHAMPION_EVENT_ID}&option_id=eq.${encodeURIComponent(optionId)}&select=option_id,label`);
    if (!newOption) {
      return json(res, 400, { error: "Unknown champion option." });
    }

    const [existingChampion] = await supabase(`predictions?submission_id=eq.${encodeURIComponent(submission.id)}&event_id=eq.${CHAMPION_EVENT_ID}&select=*`);
    if (!existingChampion) {
      return json(res, 400, { error: "You need a saved champion pick before using the change option." });
    }

    if (existingChampion.selected_option_id === newOption.option_id) {
      return json(res, 400, { error: "Choose a different champion before spending points." });
    }

    await ensurePenaltyEvent();

    await supabase(`predictions?id=eq.${encodeURIComponent(existingChampion.id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        selected_option_id: newOption.option_id,
        selected_label: newOption.label,
        points_awarded: 0
      })
    });

    const [existingPenalty] = await supabase(`predictions?submission_id=eq.${encodeURIComponent(submission.id)}&event_id=eq.${PENALTY_EVENT_ID}&select=id,points_awarded`);
    if (existingPenalty) {
      await supabase(`predictions?id=eq.${encodeURIComponent(existingPenalty.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ points_awarded: Number(existingPenalty.points_awarded || 0) - PENALTY_POINTS })
      });
    } else {
      await supabase("predictions", {
        method: "POST",
        body: JSON.stringify({
          submission_id: submission.id,
          event_id: PENALTY_EVENT_ID,
          selected_option_id: "penalty",
          selected_label: "Champion pick change penalty",
          points_awarded: -PENALTY_POINTS
        })
      });
    }

    return json(res, 200, {
      ok: true,
      selectedOptionId: newOption.option_id,
      selectedLabel: newOption.label,
      penaltyPoints: PENALTY_POINTS
    });
  } catch (error) {
    handleError(res, error);
  }
};

async function ensurePenaltyEvent() {
  const [event] = await supabase(`events?id=eq.${PENALTY_EVENT_ID}&select=id`);
  if (event) return;

  await supabase("events", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({
      id: PENALTY_EVENT_ID,
      type: "champion",
      title: "Champion pick change penalty",
      description: "Internal score adjustment for champion pick changes.",
      stage: "Internal",
      points: 1,
      importance: 0,
      display_order: 9999,
      locked: true
    })
  });
}

const { handleError, json, normalizeName, readBody, requireConfig, supabase } = require("./_supabase");

function validateSubmission(body) {
  const displayName = String(body.displayName || "").trim().replace(/\s+/g, " ");
  const normalizedName = normalizeName(displayName);
  const picks = body.picks && typeof body.picks === "object" ? body.picks : {};

  if (displayName.length < 2) {
    return { error: "Please enter your full display name." };
  }

  if (displayName.length > 80) {
    return { error: "Please use a shorter display name." };
  }

  if (!Object.keys(picks).length) {
    return { error: "Please make at least one prediction before submitting." };
  }

  return { displayName, normalizedName, picks };
}

function getDeadline(event) {
  if (event.closes_at) return new Date(event.closes_at);
  if (["champion", "finalist", "semi_finalist"].includes(event.type)) {
    return new Date("2026-06-27T21:59:00Z");
  }
  const match = String(event.title || "").match(/\b(\d{1,2})\s+(Jun|Jul)\b/i);
  if (!match) return null;
  const month = match[2].toLowerCase() === "jun" ? 5 : 6;
  return new Date(Date.UTC(2026, month, Number(match[1]), 0, 0, 0));
}

function isClosed(event) {
  const deadline = getDeadline(event);
  return Boolean(event.locked || (deadline && Date.now() > deadline.getTime()));
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed." });
  }

  if (!requireConfig(res)) return;

  try {
    const body = await readBody(req);
    const parsed = validateSubmission(body);
    if (parsed.error) return json(res, 400, { error: parsed.error });

    let [submission] = await supabase(`submissions?normalized_name=eq.${encodeURIComponent(parsed.normalizedName)}&select=*`);

    const events = await supabase("events?select=id,type,title,locked,points,closes_at");
    const options = await supabase("event_options?select=event_id,option_id,label");
    const eventMap = new Map(events.map((event) => [event.id, event]));
    const optionMap = new Map(options.map((option) => [`${option.event_id}:${option.option_id}`, option]));

    const predictionRows = [];
    for (const [eventId, optionId] of Object.entries(parsed.picks)) {
      const event = eventMap.get(eventId);
      const option = optionMap.get(`${eventId}:${optionId}`);
      if (!event || String(event.id).startsWith("__") || isClosed(event) || !option) continue;
      predictionRows.push({
        event_id: eventId,
        selected_option_id: optionId,
        selected_label: option.label
      });
    }

    if (!predictionRows.length) {
      return json(res, 400, { error: "No unlocked valid predictions were submitted." });
    }

    if (!submission) {
      [submission] = await supabase("submissions", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          display_name: parsed.displayName,
          normalized_name: parsed.normalizedName
        })
      });
    }

    const submittedEventIds = predictionRows.map((row) => row.event_id);
    const existingPredictions = await supabase(`predictions?submission_id=eq.${encodeURIComponent(submission.id)}&event_id=in.(${submittedEventIds.join(",")})&select=event_id,selected_label`);
    if (existingPredictions.length) {
      const names = existingPredictions.map((prediction) => prediction.event_id).join(", ");
      return json(res, 409, {
        error: `You already saved a prediction for ${names}. Saved predictions cannot be changed.`
      });
    }

    await supabase("predictions", {
      method: "POST",
      body: JSON.stringify(predictionRows.map((row) => ({ ...row, submission_id: submission.id, points_awarded: 0 })))
    });

    json(res, 200, {
      submissionId: submission.id,
      displayName: submission.display_name,
      submittedAt: submission.submitted_at,
      savedPredictions: predictionRows.length
    });
  } catch (error) {
    if (error.status === 409 || error.details?.code === "23505") {
      return json(res, 409, { error: "A duplicate prediction conflict occurred. Please refresh and try again." });
    }
    handleError(res, error);
  }
};

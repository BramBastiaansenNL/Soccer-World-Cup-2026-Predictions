const { handleError, json, normalizeName, readBody, requireConfig, supabase } = require("./_supabase");

function assertAdmin(passphrase) {
  const expected = process.env.ADMIN_PASSPHRASE;
  return Boolean(expected && passphrase && String(passphrase) === expected);
}

async function recalculateEvent(eventId) {
  const [event] = await supabase(`events?id=eq.${encodeURIComponent(eventId)}&select=id,points`);
  const [result] = await supabase(`results?event_id=eq.${encodeURIComponent(eventId)}&select=winning_option_id`);
  if (!event || !result) return;

  await supabase(`predictions?event_id=eq.${encodeURIComponent(eventId)}&selected_option_id=eq.${encodeURIComponent(result.winning_option_id)}`, {
    method: "PATCH",
    body: JSON.stringify({ points_awarded: event.points })
  });

  await supabase(`predictions?event_id=eq.${encodeURIComponent(eventId)}&selected_option_id=neq.${encodeURIComponent(result.winning_option_id)}`, {
    method: "PATCH",
    body: JSON.stringify({ points_awarded: 0 })
  });
}

async function setScoreResult(eventId, homeScore, awayScore, lockEvent = true) {
  const options = await supabase(`event_options?event_id=eq.${encodeURIComponent(eventId)}&select=option_id,label,sort_order&order=sort_order.asc`);
  const teamOptions = options.filter((option) => option.option_id !== "draw");
  if (teamOptions.length < 2) {
    throw Object.assign(new Error("Score updates require two team options."), { status: 400 });
  }

  const home = teamOptions[0];
  const away = teamOptions[1];
  const homeGoals = Number(homeScore);
  const awayGoals = Number(awayScore);
  if (!Number.isInteger(homeGoals) || !Number.isInteger(awayGoals) || homeGoals < 0 || awayGoals < 0) {
    throw Object.assign(new Error("Scores must be non-negative whole numbers."), { status: 400 });
  }

  const winningOptionId = homeGoals === awayGoals
    ? "draw"
    : homeGoals > awayGoals ? home.option_id : away.option_id;
  const winningLabel = `${home.label} ${homeGoals}-${awayGoals} ${away.label}`;

  await supabase("results", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({
      event_id: eventId,
      winning_option_id: winningOptionId,
      winning_label: winningLabel,
      decided_at: new Date().toISOString()
    })
  });
  await recalculateEvent(eventId);

  if (lockEvent) {
    await supabase(`events?id=eq.${encodeURIComponent(eventId)}`, {
      method: "PATCH",
      body: JSON.stringify({ locked: true })
    });
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed." });
  }

  if (!requireConfig(res)) return;

  try {
    const body = await readBody(req);
    if (!assertAdmin(body.passphrase)) {
      return json(res, 401, { error: "Invalid admin passphrase." });
    }

    if (body.action === "setLock") {
      await supabase(`events?id=eq.${encodeURIComponent(body.eventId)}`, {
        method: "PATCH",
        body: JSON.stringify({ locked: Boolean(body.locked) })
      });
      return json(res, 200, { ok: true });
    }

    if (body.action === "setResult") {
      const [option] = await supabase(`event_options?event_id=eq.${encodeURIComponent(body.eventId)}&option_id=eq.${encodeURIComponent(body.optionId)}&select=label`);
      if (!option) return json(res, 400, { error: "Unknown result option." });

      await supabase("results", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({
          event_id: body.eventId,
          winning_option_id: body.optionId,
          winning_label: option.label,
          decided_at: new Date().toISOString()
        })
      });
      await recalculateEvent(body.eventId);
      return json(res, 200, { ok: true });
    }

    if (body.action === "setScore") {
      await setScoreResult(body.eventId, body.homeScore, body.awayScore, body.lockEvent !== false);
      return json(res, 200, { ok: true });
    }

    if (body.action === "batchSetScores") {
      const results = Array.isArray(body.results) ? body.results : [];
      if (!results.length) return json(res, 400, { error: "No score results provided." });
      const updated = [];
      for (const result of results) {
        await setScoreResult(result.eventId, result.homeScore, result.awayScore, result.lockEvent !== false);
        updated.push(result.eventId);
      }
      return json(res, 200, { ok: true, updated });
    }

    if (body.action === "clearResult") {
      await supabase(`results?event_id=eq.${encodeURIComponent(body.eventId)}`, { method: "DELETE" });
      await supabase(`predictions?event_id=eq.${encodeURIComponent(body.eventId)}`, {
        method: "PATCH",
        body: JSON.stringify({ points_awarded: 0 })
      });
      return json(res, 200, { ok: true });
    }

    if (body.action === "deleteSubmission") {
      const normalized = normalizeName(body.displayName);
      await supabase(`submissions?normalized_name=eq.${encodeURIComponent(normalized)}`, { method: "DELETE" });
      return json(res, 200, { ok: true });
    }

    if (body.action === "upsertEvent") {
      const event = body.event || {};
      const options = Array.isArray(body.options) ? body.options : [];
      if (!event.id || !event.title || !event.type || !options.length) {
        return json(res, 400, { error: "Event id, title, type, and at least one option are required." });
      }

      await supabase("events", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({
          id: event.id,
          type: event.type,
          title: event.title,
          description: event.description || "",
          stage: event.stage || "Tournament",
          points: Number(event.points || 8),
          importance: Number(event.importance || 20),
          display_order: Number(event.displayOrder || 999),
          locked: Boolean(event.locked)
        })
      });

      await supabase(`event_options?event_id=eq.${encodeURIComponent(event.id)}`, { method: "DELETE" });
      await supabase("event_options", {
        method: "POST",
        body: JSON.stringify(options.map((option, index) => ({
          event_id: event.id,
          option_id: option.optionId,
          label: option.label,
          sort_order: Number(option.sortOrder || (index + 1) * 10)
        })))
      });

      return json(res, 200, { ok: true });
    }

    json(res, 400, { error: "Unknown admin action." });
  } catch (error) {
    handleError(res, error);
  }
};

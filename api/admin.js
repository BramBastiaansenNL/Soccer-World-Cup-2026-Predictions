const { handleError, json, normalizeName, readBody, requireConfig, supabase } = require("./_supabase");
const { normalizeScoreResult } = require("./_results");
const { resolveTargetOptions } = require("./_bracket");

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

async function resetEventPoints(eventId) {
  await supabase(`predictions?event_id=eq.${encodeURIComponent(eventId)}`, {
    method: "PATCH",
    body: JSON.stringify({ points_awarded: 0 })
  });
}

async function clearDependentResults(eventId, visited = new Set()) {
  if (visited.has(eventId)) return;
  visited.add(eventId);
  const dependencies = await supabase(`knockout_dependencies?source_event_id=eq.${encodeURIComponent(eventId)}&select=target_event_id`);
  for (const dependency of dependencies) {
    await clearDependentResults(dependency.target_event_id, visited);
    await supabase(`results?event_id=eq.${encodeURIComponent(dependency.target_event_id)}`, { method: "DELETE" });
    await resetEventPoints(dependency.target_event_id);
    await supabase(`events?id=eq.${encodeURIComponent(dependency.target_event_id)}`, {
      method: "PATCH",
      body: JSON.stringify({ locked: false })
    });
  }
}

async function refreshKnockoutParticipants() {
  const [dependencies, results, options, events] = await Promise.all([
    supabase("knockout_dependencies?select=*&order=target_event_id.asc"),
    supabase("results?select=event_id,winning_option_id"),
    supabase("event_options?select=event_id,option_id,label,sort_order&order=sort_order.asc"),
    supabase("events?type=eq.knockout_match_winner&select=id,title")
  ]);
  const resultByEvent = new Map(results.map((result) => [result.event_id, result]));
  const eventById = new Map(events.map((event) => [event.id, event]));
  const optionsByEvent = new Map();
  for (const option of options) {
    if (!optionsByEvent.has(option.event_id)) optionsByEvent.set(option.event_id, []);
    optionsByEvent.get(option.event_id).push(option);
  }
  const targets = [...new Set(dependencies.map((dependency) => dependency.target_event_id))].sort();

  for (const targetId of targets) {
    const slots = dependencies.filter((dependency) => dependency.target_event_id === targetId);
    const nextOptions = resolveTargetOptions(slots, resultByEvent, optionsByEvent);

    await supabase(`event_options?event_id=eq.${encodeURIComponent(targetId)}`, { method: "DELETE" });
    await supabase("event_options", { method: "POST", body: JSON.stringify(nextOptions) });
    optionsByEvent.set(targetId, nextOptions);

    const targetEvent = eventById.get(targetId);
    if (targetEvent && nextOptions.length === 2) {
      const datePrefix = String(targetEvent.title).includes(":") ? String(targetEvent.title).split(":")[0] : targetId;
      await supabase(`events?id=eq.${encodeURIComponent(targetId)}`, {
        method: "PATCH",
        body: JSON.stringify({ title: `${datePrefix}: ${nextOptions[0].label} vs ${nextOptions[1].label}` })
      });
    }
  }
}

async function scorePredictionEvents(eventIds, winningTeamIds, complete) {
  for (const eventId of eventIds) {
    await resetEventPoints(eventId);
    if (!complete || !winningTeamIds.length) continue;
    const [event] = await supabase(`events?id=eq.${encodeURIComponent(eventId)}&select=points`);
    if (!event) continue;
    await supabase(`predictions?event_id=eq.${encodeURIComponent(eventId)}&selected_option_id=in.(${winningTeamIds.map(encodeURIComponent).join(",")})`, {
      method: "PATCH",
      body: JSON.stringify({ points_awarded: event.points })
    });
  }
}

async function recalculateTournamentMilestones() {
  const results = await supabase("results?select=event_id,winning_option_id");
  const byEvent = new Map(results.map((result) => [result.event_id, result.winning_option_id]));
  const quarterfinals = ["match-097", "match-098", "match-099", "match-100"].map((id) => byEvent.get(id)).filter(Boolean);
  const finalists = ["match-101", "match-102"].map((id) => byEvent.get(id)).filter(Boolean);
  const champion = byEvent.get("match-104");
  await scorePredictionEvents(["semi-finalist-1", "semi-finalist-2", "semi-finalist-3", "semi-finalist-4"], quarterfinals, quarterfinals.length === 4);
  await scorePredictionEvents(["finalist-1", "finalist-2"], finalists, finalists.length === 2);
  await scorePredictionEvents(["champion"], champion ? [champion] : [], Boolean(champion));
}

async function setScoreResult(payload, lockEvent = true) {
  const [event] = await supabase(`events?id=eq.${encodeURIComponent(payload.eventId)}&select=id,type`);
  if (!event || !["match_winner", "knockout_match_winner"].includes(event.type)) {
    throw Object.assign(new Error("Unknown match event."), { status: 400 });
  }
  const options = await supabase(`event_options?event_id=eq.${encodeURIComponent(payload.eventId)}&select=option_id,label,sort_order&order=sort_order.asc`);
  const normalized = normalizeScoreResult(event, options, payload);
  const [previous] = await supabase(`results?event_id=eq.${encodeURIComponent(payload.eventId)}&select=winning_option_id`);
  if (previous && previous.winning_option_id !== normalized.winnerOptionId && event.type === "knockout_match_winner") {
    await clearDependentResults(payload.eventId);
  }

  await supabase("results", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({
      event_id: payload.eventId,
      winning_option_id: normalized.winnerOptionId,
      winning_label: normalized.winningLabel,
      home_score: normalized.homeScore,
      away_score: normalized.awayScore,
      decided_by: normalized.decidedBy,
      home_penalties: normalized.homePenalties,
      away_penalties: normalized.awayPenalties,
      decided_at: new Date().toISOString()
    })
  });
  await recalculateEvent(payload.eventId);

  if (lockEvent) {
    await supabase(`events?id=eq.${encodeURIComponent(payload.eventId)}`, {
      method: "PATCH",
      body: JSON.stringify({ locked: true })
    });
  }
  if (event.type === "knockout_match_winner") await refreshKnockoutParticipants();
  await recalculateTournamentMilestones();
  return normalized;
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
      const [event] = await supabase(`events?id=eq.${encodeURIComponent(body.eventId)}&select=type`);
      if (event?.type === "knockout_match_winner") {
        return json(res, 400, { error: "Knockout results must be saved with scores and decidedBy." });
      }
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
      await setScoreResult(body, body.lockEvent !== false);
      return json(res, 200, { ok: true });
    }

    if (body.action === "batchSetScores") {
      const results = Array.isArray(body.results) ? body.results : [];
      if (!results.length) return json(res, 400, { error: "No score results provided." });
      const updated = [];
      for (const result of results) {
        await setScoreResult(result, result.lockEvent !== false);
        updated.push(result.eventId);
      }
      return json(res, 200, { ok: true, updated });
    }

    if (body.action === "clearResult") {
      await clearDependentResults(body.eventId);
      await supabase(`results?event_id=eq.${encodeURIComponent(body.eventId)}`, { method: "DELETE" });
      await resetEventPoints(body.eventId);
      await refreshKnockoutParticipants();
      await recalculateTournamentMilestones();
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
          locked: Boolean(event.locked),
          closes_at: event.closesAt || null
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

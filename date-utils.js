(function exposeDateUtils(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.WorldCupDates = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function createDateUtils() {
  function getEventDisplayTitle(event, locale, timeZone) {
    if (event?.type !== "knockout_match_winner" || !event.closesAt) return event?.title || "";
    const kickoff = new Date(event.closesAt);
    if (Number.isNaN(kickoff.getTime())) return event.title;
    const dateLabel = kickoff.toLocaleDateString(locale, {
      weekday: "short",
      day: "numeric",
      month: "short",
      ...(timeZone ? { timeZone } : {})
    });
    const teams = (event.options || []).filter((option) => option.optionId !== "draw").map((option) => option.label);
    const matchup = teams.length === 2
      ? `${teams[0]} vs ${teams[1]}`
      : String(event.title || event.id).replace(/^[^:]+:\s*/, "");
    return `${dateLabel}: ${matchup}`;
  }

  function hasResolvedParticipants(event) {
    return event?.type !== "knockout_match_winner" || (event.options || []).length === 2
      && event.options.every((option) => !/^(winner|loser)-match-\d{3}$/.test(option.optionId));
  }

  return { getEventDisplayTitle, hasResolvedParticipants };
}));

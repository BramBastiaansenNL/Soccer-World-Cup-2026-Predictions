function placeholderFor(dependency) {
  const prefix = dependency.outcome === "loser" ? "Loser" : "Winner";
  return {
    event_id: dependency.target_event_id,
    option_id: `${dependency.outcome}-${dependency.source_event_id}`,
    label: `${prefix} of ${dependency.source_event_id}`,
    sort_order: dependency.target_slot === "home" ? 10 : 30
  };
}

function resolveTargetOptions(dependencies, resultByEvent, optionsByEvent) {
  return dependencies.map((dependency) => {
    const sourceResult = resultByEvent.get(dependency.source_event_id);
    const sourceOptions = (optionsByEvent.get(dependency.source_event_id) || []).filter((option) => option.option_id !== "draw");
    if (!sourceResult || sourceOptions.length !== 2) return placeholderFor(dependency);
    const selected = dependency.outcome === "winner"
      ? sourceOptions.find((option) => option.option_id === sourceResult.winning_option_id)
      : sourceOptions.find((option) => option.option_id !== sourceResult.winning_option_id);
    if (!selected) return placeholderFor(dependency);
    return {
      event_id: dependency.target_event_id,
      option_id: selected.option_id,
      label: selected.label,
      sort_order: dependency.target_slot === "home" ? 10 : 30
    };
  }).sort((a, b) => a.sort_order - b.sort_order);
}

module.exports = { placeholderFor, resolveTargetOptions };

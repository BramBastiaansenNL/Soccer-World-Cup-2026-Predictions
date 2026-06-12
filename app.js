const demoState = {
  events: [
    {
      id: "champion",
      type: "champion",
      title: "Who wins the World Cup?",
      description: "The ultimate fame pick.",
      stage: "Tournament",
      points: 100,
      importance: 100,
      locked: false,
      options: ["Argentina", "Brazil", "England", "France", "Germany", "Netherlands", "Portugal", "Spain"].map((name) => ({
        optionId: name.toLowerCase().replaceAll(" ", "-"),
        label: name
      }))
    },
    {
      id: "match-001",
      type: "match_winner",
      title: "Opening match winner",
      description: "Replace this with the real fixture in Admin.",
      stage: "Group stage",
      points: 8,
      importance: 30,
      locked: false,
      options: [
        { optionId: "team-a", label: "Team A" },
        { optionId: "draw", label: "Draw" },
        { optionId: "team-b", label: "Team B" }
      ]
    }
  ],
  leaderboard: [],
  submissions: [],
  predictions: []
};

const state = {
  data: demoState,
  picks: {},
  savedPicks: {},
  activeName: localStorage.getItem("activeName") || "",
  apiReady: true
};

const flagColors = {
  algeria: ["#006233", "#ffffff", "#d21034"],
  argentina: ["#74acdf", "#ffffff", "#f6b40e"],
  australia: ["#012169", "#ffffff", "#e4002b"],
  austria: ["#ed2939", "#ffffff", "#ed2939"],
  belgium: ["#000000", "#fae042", "#ed2939"],
  "bosnia-and-herzegovina": ["#002f6c", "#f7d117", "#ffffff"],
  brazil: ["#009b3a", "#ffdf00", "#002776"],
  "cabo-verde": ["#003893", "#ffffff", "#cf2027"],
  canada: ["#d80621", "#ffffff", "#d80621"],
  colombia: ["#fcd116", "#003893", "#ce1126"],
  "congo-dr": ["#007fff", "#f7d618", "#ce1021"],
  "cote-divoire": ["#f77f00", "#ffffff", "#009e60"],
  croatia: ["#ff0000", "#ffffff", "#171796"],
  curacao: ["#002b7f", "#f9e300", "#ffffff"],
  czechia: ["#ffffff", "#d7141a", "#11457e"],
  ecuador: ["#ffdd00", "#034ea2", "#ed1c24"],
  egypt: ["#ce1126", "#ffffff", "#000000"],
  england: ["#ffffff", "#cf142b", "#ffffff"],
  france: ["#0055a4", "#ffffff", "#ef4135"],
  germany: ["#000000", "#dd0000", "#ffce00"],
  ghana: ["#ce1126", "#fcd116", "#006b3f"],
  haiti: ["#00209f", "#d21034", "#ffffff"],
  "ir-iran": ["#239f40", "#ffffff", "#da0000"],
  iraq: ["#ce1126", "#ffffff", "#000000"],
  japan: ["#ffffff", "#bc002d", "#ffffff"],
  jordan: ["#000000", "#ffffff", "#007a3d"],
  "korea-republic": ["#ffffff", "#c60c30", "#003478"],
  mexico: ["#006847", "#ffffff", "#ce1126"],
  morocco: ["#c1272d", "#006233", "#c1272d"],
  netherlands: ["#ae1c28", "#ffffff", "#21468b"],
  "new-zealand": ["#00247d", "#ffffff", "#cc142b"],
  norway: ["#ba0c2f", "#ffffff", "#00205b"],
  panama: ["#ffffff", "#005293", "#d21034"],
  paraguay: ["#d52b1e", "#ffffff", "#0038a8"],
  portugal: ["#006600", "#ff0000", "#ffcc00"],
  qatar: ["#8a1538", "#ffffff", "#8a1538"],
  "saudi-arabia": ["#006c35", "#ffffff", "#006c35"],
  scotland: ["#005eb8", "#ffffff", "#005eb8"],
  senegal: ["#00853f", "#fdef42", "#e31b23"],
  "south-africa": ["#007a4d", "#ffb612", "#de3831"],
  spain: ["#aa151b", "#f1bf00", "#aa151b"],
  sweden: ["#006aa7", "#fecc00", "#006aa7"],
  switzerland: ["#d52b1e", "#ffffff", "#d52b1e"],
  tunisia: ["#e70013", "#ffffff", "#e70013"],
  turkiye: ["#e30a17", "#ffffff", "#e30a17"],
  "united-states": ["#b22234", "#ffffff", "#3c3b6e"],
  uruguay: ["#ffffff", "#0038a8", "#fcd116"],
  uzbekistan: ["#1eb53a", "#ffffff", "#0099b5"]
};

const els = {
  setupNotice: document.querySelector("#setupNotice"),
  predictionForm: document.querySelector("#predictionForm"),
  displayName: document.querySelector("#displayName"),
  events: document.querySelector("#events"),
  leaderboard: document.querySelector("#leaderboard"),
  scheduleList: document.querySelector("#scheduleList"),
  standingsList: document.querySelector("#standingsList"),
  historyList: document.querySelector("#historyList"),
  submissionStatus: document.querySelector("#submissionStatus"),
  myPicks: document.querySelector("#myPicks"),
  myPicksList: document.querySelector("#myPicksList"),
  adminPassphrase: document.querySelector("#adminPassphrase"),
  adminEvent: document.querySelector("#adminEvent"),
  adminResult: document.querySelector("#adminResult"),
  adminMessage: document.querySelector("#adminMessage")
};

const tabButtons = [...document.querySelectorAll(".tab-button")];
const tabPanels = {
  predictions: document.querySelector("#predictionsTab"),
  schedule: document.querySelector("#scheduleTab"),
  standings: document.querySelector("#standingsTab"),
  history: document.querySelector("#historyTab")
};
const validTabs = Object.keys(tabPanels);

function normalizeName(name) {
  return String(name || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function byImportance(a, b) {
  return b.importance - a.importance || a.displayOrder - b.displayOrder || a.title.localeCompare(b.title);
}

function byPredictionOrder(a, b) {
  const aIsMatch = a.type === "match_winner";
  const bIsMatch = b.type === "match_winner";
  if (aIsMatch && bIsMatch) return bySchedule(a, b);
  if (aIsMatch !== bIsMatch) return aIsMatch ? 1 : -1;
  return byImportance(a, b);
}

function isInternalEvent(event) {
  return String(event.id || "").startsWith("__");
}

function getEventDeadline(event) {
  if (event.closesAt) return new Date(event.closesAt);
  if (["champion", "finalist", "semi_finalist"].includes(event.type)) {
    return new Date("2026-06-27T21:59:00Z");
  }
  const parsed = parseMatchDate(event);
  if (!parsed) return null;
  return new Date(Date.UTC(2026, parsed.month, parsed.day - 1, 22, 0, 0));
}

function isClosed(event) {
  const deadline = getEventDeadline(event);
  return Boolean(event.locked || event.result || (deadline && Date.now() > deadline.getTime()));
}

function formatDeadline(event) {
  const deadline = getEventDeadline(event);
  if (!deadline) return "";
  return `Closes ${deadline.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}.`;
}

function showNotice(message) {
  els.setupNotice.textContent = message;
  els.setupNotice.classList.remove("hidden");
}

async function api(path, options) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}

async function loadState() {
  try {
    state.data = await api("/api/state");
    state.apiReady = true;
    els.setupNotice.classList.add("hidden");
  } catch (error) {
    state.data = demoState;
    state.apiReady = false;
    showNotice(`${error.message} The page is showing demo data so you can preview the interface.`);
  }
  render();
}

function render() {
  renderEvents();
  renderSchedule();
  renderStandings();
  renderHistory();
  renderLeaderboard();
  renderAdminControls();
  renderSubmittedState();
}

function renderEvents() {
  els.events.innerHTML = "";
  const template = document.querySelector("#eventTemplate");
  const activeSubmission = getActiveSubmission();
  rebuildSavedPicks(activeSubmission);

  for (const event of [...state.data.events].sort(byPredictionOrder)) {
    if (isInternalEvent(event)) continue;
    const savedPrediction = state.savedPicks[event.id] || null;
    if (savedPrediction && !state.picks[event.id]) state.picks[event.id] = savedPrediction.selectedOptionId;
    if (savedPrediction || isClosed(event)) continue;

    const node = template.content.firstElementChild.cloneNode(true);
    node.classList.toggle("featured", event.type === "champion");
    node.classList.toggle("played", Boolean(event.result));
    node.querySelector(".stage").textContent = event.stage || "Tournament";
    node.querySelector("h3").textContent = event.title;
    node.querySelector(".description").textContent = event.description || "";
    node.querySelector(".points").textContent = `${event.points} pts`;
    node.querySelector(".description").textContent = `${event.description || ""} ${formatDeadline(event)}`.trim();

    const options = node.querySelector(".options");
    if (event.type === "match_winner") {
      renderRadioOptions(options, event);
    } else {
      renderDropdownOption(options, event);
    }

    if (event.result) {
      const result = document.createElement("p");
      result.className = "small-message";
      result.textContent = `Result: ${event.result.winningLabel}`;
      node.append(result);
    }

    if (savedPrediction) {
      const saved = document.createElement("p");
      saved.className = "saved-message";
      saved.textContent = `Your saved pick: ${savedPrediction.selectedLabel}. Saved picks cannot be changed.`;
      node.append(saved);
    }

    els.events.append(node);
  }
}

function renderRadioOptions(container, event) {
  const hasSavedPick = Boolean(state.savedPicks[event.id]);
  const closed = isClosed(event);
  for (const option of event.options || []) {
      const label = document.createElement("label");
      label.className = "option";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = event.id;
      input.value = option.optionId;
      input.disabled = closed || hasSavedPick;
      input.checked = state.picks[event.id] === option.optionId;
      input.addEventListener("change", () => {
        state.picks[event.id] = option.optionId;
      });
      const span = document.createElement("span");
      span.textContent = option.label;
      applyFlagStyle(span, option);
      label.append(input, span);
      container.append(label);
    }
}

function renderDropdownOption(container, event) {
  const hasSavedPick = Boolean(state.savedPicks[event.id]);
  const closed = isClosed(event);
  const wrap = document.createElement("label");
  wrap.className = "pick-select";
  const select = document.createElement("select");
  select.name = event.id;
  select.disabled = closed || hasSavedPick;

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Choose a team";
  select.append(placeholder);

  for (const option of event.options || []) {
    const item = document.createElement("option");
    item.value = option.optionId;
    item.textContent = option.label;
    item.selected = state.picks[event.id] === option.optionId;
    select.append(item);
  }

  select.addEventListener("change", () => {
    if (select.value) state.picks[event.id] = select.value;
    else delete state.picks[event.id];
  });

  wrap.append(select);
  container.append(wrap);
}

function applyFlagStyle(element, option) {
  const colors = flagColors[option.optionId];
  if (!colors || option.optionId === "draw") {
    element.classList.add("neutral-option");
    return;
  }

  const [a, b, c] = colors;
  element.style.setProperty("--flag-a", a);
  element.style.setProperty("--flag-b", b);
  element.style.setProperty("--flag-c", c);
  element.style.setProperty("--flag-bg-a", hexToRgba(a, 0.18));
  element.style.setProperty("--flag-bg-b", hexToRgba(b, 0.16));
  element.style.setProperty("--flag-bg-c", hexToRgba(c, 0.16));
}

function hexToRgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const value = clean.length === 3
    ? clean.split("").map((char) => char + char).join("")
    : clean;
  const number = Number.parseInt(value, 16);
  const red = (number >> 16) & 255;
  const green = (number >> 8) & 255;
  const blue = number & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function renderLeaderboard() {
  els.leaderboard.innerHTML = "";
  if (!state.data.leaderboard.length) {
    els.leaderboard.innerHTML = '<p class="small-message">No fame points yet. The first brave picks are waiting.</p>';
    return;
  }

  for (const row of state.data.leaderboard) {
    const item = document.createElement("div");
    item.className = "leader-row";
    item.innerHTML = `
      <span class="rank">${row.rank}</span>
      <div>
        <p class="leader-name">${escapeHtml(row.displayName)}</p>
        <p class="leader-meta">${row.correctPicks} correct picks · ${row.picks} submitted</p>
      </div>
      <span class="leader-points">${row.totalPoints}</span>
    `;
    els.leaderboard.append(item);
  }
}

function renderSchedule() {
  const matches = getMatchEvents();
  els.scheduleList.innerHTML = "";
  if (!matches.length) {
    els.scheduleList.innerHTML = '<p class="small-message">No matches have been scheduled yet.</p>';
    return;
  }

  for (const match of matches) {
    const teams = getMatchTeams(match);
    const row = document.createElement("article");
    row.className = "schedule-row";
    row.classList.toggle("played", Boolean(match.result));
    row.innerHTML = `
      <div>
        <p class="stage">${escapeHtml(match.stage || "Match")}</p>
        <h3>${escapeHtml(match.title)}</h3>
        <p class="description">${escapeHtml(match.description || "")}</p>
      </div>
      <div class="schedule-status">
        <span class="points">${match.points} pts</span>
        <span class="${match.result ? "played-status" : match.locked ? "locked" : "open"}">${match.result ? "Played" : match.locked ? "Locked" : "Open"}</span>
        <span class="schedule-result">${match.result ? `Result: ${escapeHtml(match.result.winningLabel)}` : teams.join(" / ")}</span>
      </div>
    `;
    els.scheduleList.append(row);
  }
}

function renderHistory() {
  if (!els.historyList) return;
  els.historyList.innerHTML = "";
  const activeSubmission = getActiveSubmission();
  rebuildSavedPicks(activeSubmission);
  const savedRows = activeSubmission
    ? state.data.predictions
      .filter((prediction) => prediction.submissionId === activeSubmission.id)
      .map((prediction) => ({
        prediction,
        event: state.data.events.find((event) => event.id === prediction.eventId)
      }))
      .filter((row) => row.event && !isInternalEvent(row.event))
    : [];
  const playedRows = state.data.events
    .filter((event) => event.type === "match_winner" && event.result)
    .map((event) => ({ event, prediction: state.savedPicks[event.id] || null }));

  if (!savedRows.length && !playedRows.length) {
    els.historyList.innerHTML = '<p class="small-message">Load your name to see saved picks here. Played matches will also appear as results are entered.</p>';
    return;
  }

  if (savedRows.length) {
    const section = document.createElement("section");
    section.className = "history-section";
    section.innerHTML = "<h3>Your saved picks</h3>";
    for (const row of savedRows.sort((a, b) => bySchedule(a.event, b.event))) {
      section.append(createHistoryRow(row.event, row.prediction));
    }
    els.historyList.append(section);
  }

  const championEvent = state.data.events.find((event) => event.id === "champion");
  const championPick = state.savedPicks.champion;
  if (activeSubmission && championEvent && championPick && !championEvent.result) {
    els.historyList.append(createChampionChangePanel(championEvent, championPick));
  }

  if (playedRows.length) {
    const section = document.createElement("section");
    section.className = "history-section";
    section.innerHTML = "<h3>Played matches</h3>";
    for (const row of playedRows.sort((a, b) => bySchedule(a.event, b.event))) {
      section.append(createHistoryRow(row.event, row.prediction));
    }
    els.historyList.append(section);
  }
}

function createHistoryRow(event, prediction) {
  const row = document.createElement("div");
  row.className = "history-row";
  const resultText = event.result ? `Result: ${event.result.winningLabel}` : "Awaiting result";
  const points = prediction ? `${prediction.pointsAwarded || 0} pts` : "";
  row.innerHTML = `
    <div>
      <p class="stage">${escapeHtml(event.stage || "Tournament")}</p>
      <strong>${escapeHtml(event.title)}</strong>
      <p class="description">${escapeHtml(resultText)}</p>
    </div>
    <div class="history-pick">
      <span>${prediction ? escapeHtml(prediction.selectedLabel) : "No pick"}</span>
      <strong>${escapeHtml(points)}</strong>
    </div>
  `;
  return row;
}

function createChampionChangePanel(event, prediction) {
  const panel = document.createElement("section");
  panel.className = "champion-change";
  const select = document.createElement("select");
  select.id = "championChangeSelect";
  for (const option of event.options || []) {
    const item = document.createElement("option");
    item.value = option.optionId;
    item.textContent = option.label;
    item.selected = option.optionId === prediction.selectedOptionId;
    select.append(item);
  }
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Change champion (-20 pts)";
  button.addEventListener("click", changeChampionPick);
  panel.innerHTML = `
    <div>
      <p class="eyebrow">One expensive lifeline</p>
      <h3>Change your champion pick</h3>
      <p class="description">Changing the champion pick costs 20 fame points each time. Negative points are possible.</p>
    </div>
  `;
  panel.append(select, button);
  return panel;
}

function renderStandings() {
  const groups = calculateStandings();
  els.standingsList.innerHTML = "";
  if (!Object.keys(groups).length) {
    els.standingsList.innerHTML = '<p class="small-message">Standings appear once scheduled teams are loaded.</p>';
    return;
  }

  for (const [group, rows] of Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))) {
    const table = document.createElement("section");
    table.className = "standing-group";
    table.innerHTML = `
      <h3>Group ${escapeHtml(group)}</h3>
      <div class="standing-row standing-head">
        <span>Team</span><span>P</span><span>W</span><span>D</span><span>L</span><span>GD</span><span>Pts</span>
      </div>
    `;
    for (const row of rows) {
      const item = document.createElement("div");
      item.className = "standing-row";
      item.innerHTML = `
        <span>${escapeHtml(row.team)}</span>
        <span>${row.played}</span>
        <span>${row.wins}</span>
        <span>${row.draws}</span>
        <span>${row.losses}</span>
        <span>${row.goalDifference}</span>
        <strong>${row.points}</strong>
      `;
      table.append(item);
    }
    els.standingsList.append(table);
  }
}

function getMatchEvents() {
  return [...state.data.events]
    .filter((event) => event.type === "match_winner")
    .sort(bySchedule);
}

function bySchedule(a, b) {
  const dateA = parseMatchDate(a);
  const dateB = parseMatchDate(b);
  const timeA = dateA ? Date.UTC(2026, dateA.month, dateA.day) : Number.MAX_SAFE_INTEGER;
  const timeB = dateB ? Date.UTC(2026, dateB.month, dateB.day) : Number.MAX_SAFE_INTEGER;
  return timeA - timeB || a.displayOrder - b.displayOrder || a.title.localeCompare(b.title);
}

function parseMatchDate(event) {
  const match = String(event?.title || "").match(/\b(\d{1,2})\s+(Jun|Jul)\b/i);
  if (!match) return null;
  return {
    day: Number(match[1]),
    month: match[2].toLowerCase() === "jun" ? 5 : 6
  };
}

function getMatchTeams(match) {
  return (match.options || [])
    .filter((option) => option.optionId !== "draw")
    .map((option) => option.label);
}

function getGroupFromMatch(match) {
  const matchGroup = String(match.description || "").match(/Group\s+([A-L])/i);
  return matchGroup ? matchGroup[1].toUpperCase() : "Other";
}

function calculateStandings() {
  const groups = {};
  for (const match of getMatchEvents()) {
    const group = getGroupFromMatch(match);
    groups[group] ||= {};
    for (const team of getMatchTeams(match)) {
      groups[group][team] ||= { team, played: 0, wins: 0, draws: 0, losses: 0, points: 0 };
      groups[group][team].goalsFor ||= 0;
      groups[group][team].goalsAgainst ||= 0;
      groups[group][team].goalDifference ||= 0;
    }

    if (!match.result) continue;
    const teams = getMatchTeams(match);
    const score = parseScoreResult(match.result.winningLabel);
    if (score && teams.length >= 2) {
      const [home, away] = teams;
      groups[group][home].goalsFor += score.home;
      groups[group][home].goalsAgainst += score.away;
      groups[group][away].goalsFor += score.away;
      groups[group][away].goalsAgainst += score.home;
      groups[group][home].goalDifference = groups[group][home].goalsFor - groups[group][home].goalsAgainst;
      groups[group][away].goalDifference = groups[group][away].goalsFor - groups[group][away].goalsAgainst;
    }

    if (match.result.winningOptionId === "draw") {
      for (const team of teams) {
        groups[group][team].played += 1;
        groups[group][team].draws += 1;
        groups[group][team].points += 1;
      }
      continue;
    }

    const winner = match.options.find((option) => option.optionId === match.result.winningOptionId)?.label;
    for (const team of teams) {
      groups[group][team].played += 1;
      if (team === winner) {
        groups[group][team].wins += 1;
        groups[group][team].points += 3;
      } else {
        groups[group][team].losses += 1;
      }
    }
  }

  return Object.fromEntries(Object.entries(groups).map(([group, rows]) => [
    group,
    Object.values(rows).sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.wins - a.wins || a.team.localeCompare(b.team))
  ]));
}

function parseScoreResult(label) {
  const match = String(label || "").match(/\b(\d+)\s*-\s*(\d+)\b/);
  if (!match) return null;
  return { home: Number(match[1]), away: Number(match[2]) };
}

function renderAdminControls() {
  els.adminEvent.innerHTML = "";
  for (const event of state.data.events) {
    if (isInternalEvent(event)) continue;
    const option = document.createElement("option");
    option.value = event.id;
    option.textContent = `${event.title}${event.locked ? " (locked)" : ""}`;
    els.adminEvent.append(option);
  }
  updateAdminResultOptions();
}

function updateAdminResultOptions() {
  const event = state.data.events.find((item) => item.id === els.adminEvent.value) || state.data.events[0];
  els.adminResult.innerHTML = "";
  for (const option of event?.options || []) {
    const node = document.createElement("option");
    node.value = option.optionId;
    node.textContent = option.label;
    els.adminResult.append(node);
  }
}

function renderSubmittedState() {
  const activeName = state.activeName;
  els.displayName.value = activeName || els.displayName.value;
  els.displayName.disabled = false;
  els.predictionForm.querySelector("button[type='submit']").disabled = false;
  els.predictionForm.querySelector("button[type='submit']").textContent = activeName ? "Save picks" : "Start picking";
  els.submissionStatus.textContent = activeName ? "Returning player" : "Open";

  if (!activeName) return;

  const submission = getActiveSubmission();
  if (!submission) return;

  const predictions = state.data.predictions.filter((prediction) => prediction.submissionId === submission.id);
  els.myPicksList.innerHTML = "";
  for (const prediction of predictions) {
    const event = state.data.events.find((item) => item.id === prediction.eventId);
    if (!event || isInternalEvent(event)) continue;
    const row = document.createElement("div");
    row.className = "pick-row";
    row.innerHTML = `<strong>${escapeHtml(event?.title || prediction.eventId)}</strong><span>${escapeHtml(prediction.selectedLabel)}</span>`;
    els.myPicksList.append(row);
  }
  els.myPicks.classList.remove("hidden");
}

function getActiveSubmission() {
  const normalized = normalizeName(state.activeName);
  if (!normalized) return null;
  return state.data.submissions.find((item) => item.normalizedName === normalized) || null;
}

function rebuildSavedPicks(submission) {
  state.savedPicks = {};
  if (!submission) return;
  const saved = state.data.predictions.filter((prediction) => prediction.submissionId === submission.id);
  for (const prediction of saved) {
    state.savedPicks[prediction.eventId] = prediction;
    state.picks[prediction.eventId] = prediction.selectedOptionId;
  }
}

function hydratePicksForName(displayName) {
  const normalized = normalizeName(displayName);
  const submission = state.data.submissions.find((item) => item.normalizedName === normalized);
  if (!submission) return null;

  state.activeName = submission.displayName;
  localStorage.setItem("activeName", submission.displayName);
  const saved = state.data.predictions.filter((prediction) => prediction.submissionId === submission.id);
  for (const prediction of saved) {
    state.savedPicks[prediction.eventId] = prediction;
    state.picks[prediction.eventId] = prediction.selectedOptionId;
  }
  return submission;
}

function getNewPicksOnly() {
  return Object.fromEntries(
    Object.entries(state.picks).filter(([eventId]) => {
      const event = state.data.events.find((item) => item.id === eventId);
      return event && !state.savedPicks[eventId] && !isClosed(event) && !isInternalEvent(event);
    })
  );
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

els.predictionForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const displayName = els.displayName.value.trim().replace(/\s+/g, " ");
  if (!displayName) return;

  hydratePicksForName(displayName);

  if (!state.picks.champion && !state.savedPicks.champion) {
    alert("Please make the World Cup winner pick before submitting.");
    return;
  }

  if (!state.apiReady) {
    showNotice("Connect Supabase and deploy to Vercel before accepting real submissions.");
    return;
  }

  try {
    const picksToSubmit = getNewPicksOnly();
    if (!Object.keys(picksToSubmit).length) {
      alert("No new predictions to save. Existing saved picks cannot be changed.");
      return;
    }

    const result = await api("/api/submit", {
      method: "POST",
      body: JSON.stringify({ displayName, picks: picksToSubmit })
    });
    localStorage.setItem("activeName", result.displayName);
    state.activeName = result.displayName;
    alert(`Saved ${result.savedPredictions} prediction${result.savedPredictions === 1 ? "" : "s"}. You can come back later for new unlocked matches.`);
    await loadState();
  } catch (error) {
    alert(error.message);
  }
});

document.querySelector("#loadName").addEventListener("click", () => {
  const displayName = els.displayName.value.trim().replace(/\s+/g, " ");
  if (!displayName) {
    alert("Enter your display name first.");
    return;
  }
  const submission = hydratePicksForName(displayName);
  if (submission) {
    alert(`Welcome back, ${submission.displayName}. Your saved picks are loaded.`);
  } else {
    state.activeName = displayName;
    localStorage.setItem("activeName", displayName);
    alert("No saved picks found yet. You can start with this name.");
  }
  render();
});

async function changeChampionPick() {
  const displayName = els.displayName.value.trim().replace(/\s+/g, " ");
  const select = document.querySelector("#championChangeSelect");
  if (!displayName || !select?.value) return;
  if (!confirm("Change your champion pick for a 20 point penalty?")) return;
  try {
    const result = await api("/api/changeChampion", {
      method: "POST",
      body: JSON.stringify({ displayName, optionId: select.value })
    });
    alert(`Champion pick changed to ${result.selectedLabel}. A 20 point penalty was applied.`);
    await loadState();
  } catch (error) {
    alert(error.message);
  }
}

function tabFromLocation() {
  const hashTab = location.hash.replace("#", "");
  return hashTab || "predictions";
}

function activateTab(tab, options = {}) {
  const target = validTabs.includes(tab) ? tab : "predictions";
  tabButtons.forEach((item) => {
    const active = item.dataset.tab === target;
    item.classList.toggle("active", active);
    if (active) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
  });
  for (const [key, panel] of Object.entries(tabPanels)) {
    panel.classList.toggle("active", key === target);
  }
  if (options.scroll) {
    tabPanels[target].scrollIntoView({ behavior: "smooth", block: "start" });
    tabPanels[target].focus({ preventScroll: true });
  }
}

tabButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    const target = button.dataset.tab;
    if (location.hash !== `#${target}`) {
      history.pushState({}, "", `#${target}`);
    }
    activateTab(target, { scroll: true });
  });
});

window.addEventListener("hashchange", () => {
  activateTab(tabFromLocation());
});

els.adminEvent.addEventListener("change", updateAdminResultOptions);

async function adminAction(action, extra = {}) {
  if (!state.apiReady) {
    els.adminMessage.textContent = "Admin actions need Supabase/Vercel configuration.";
    return;
  }
  try {
    await api("/api/admin", {
      method: "POST",
      body: JSON.stringify({
        passphrase: els.adminPassphrase.value,
        action,
        ...extra
      })
    });
    els.adminMessage.textContent = "Saved.";
    await loadState();
  } catch (error) {
    els.adminMessage.textContent = error.message;
  }
}

document.querySelector("#saveResult").addEventListener("click", () => {
  adminAction("setResult", {
    eventId: els.adminEvent.value,
    optionId: els.adminResult.value
  });
});

document.querySelector("#saveScore").addEventListener("click", () => {
  adminAction("setScore", {
    eventId: els.adminEvent.value,
    homeScore: Number(document.querySelector("#scoreHome").value),
    awayScore: Number(document.querySelector("#scoreAway").value)
  });
});

document.querySelector("#saveBatchScores").addEventListener("click", () => {
  try {
    const results = JSON.parse(document.querySelector("#batchScores").value || "[]");
    if (!Array.isArray(results) || !results.length) {
      els.adminMessage.textContent = "Paste a JSON array of score results first.";
      return;
    }
    adminAction("batchSetScores", { results });
  } catch {
    els.adminMessage.textContent = "Batch scores must be valid JSON.";
  }
});

document.querySelector("#clearResult").addEventListener("click", () => {
  adminAction("clearResult", { eventId: els.adminEvent.value });
});

document.querySelector("#toggleLock").addEventListener("click", () => {
  const event = state.data.events.find((item) => item.id === els.adminEvent.value);
  adminAction("setLock", { eventId: event.id, locked: !event.locked });
});

document.querySelector("#deleteSubmission").addEventListener("click", () => {
  adminAction("deleteSubmission", { displayName: document.querySelector("#deleteName").value });
});

document.querySelector("#saveFixture").addEventListener("click", () => {
  const fixtureId = document.querySelector("#fixtureId").value.trim();
  const rawOptions = document.querySelector("#fixtureOptions").value.split("|").map((item) => item.trim()).filter(Boolean);
  adminAction("upsertEvent", {
    event: {
      id: fixtureId,
      title: document.querySelector("#fixtureTitle").value.trim(),
      description: "Pick the winner.",
      stage: document.querySelector("#fixtureStage").value.trim() || "Group stage",
      type: document.querySelector("#fixtureType").value,
      points: Number(document.querySelector("#fixturePoints").value || 8),
      importance: 30,
      displayOrder: 500 + state.data.events.length
    },
    options: rawOptions.map((label, index) => ({
      optionId: label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `option-${index + 1}`,
      label,
      sortOrder: (index + 1) * 10
    }))
  });
});

document.querySelector("#exportCsv").addEventListener("click", () => {
  const rows = [["rank", "name", "points", "correct_picks", "picks"]];
  for (const row of state.data.leaderboard) {
    rows.push([row.rank, row.displayName, row.totalPoints, row.correctPicks, row.picks]);
  }
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "world-cup-fame-leaderboard.csv";
  link.click();
  URL.revokeObjectURL(url);
});

activateTab(tabFromLocation());
loadState();

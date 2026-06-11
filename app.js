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
  submissionStatus: document.querySelector("#submissionStatus"),
  myPicks: document.querySelector("#myPicks"),
  myPicksList: document.querySelector("#myPicksList"),
  adminPassphrase: document.querySelector("#adminPassphrase"),
  adminEvent: document.querySelector("#adminEvent"),
  adminResult: document.querySelector("#adminResult"),
  adminMessage: document.querySelector("#adminMessage")
};

function normalizeName(name) {
  return String(name || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function byImportance(a, b) {
  return b.importance - a.importance || a.displayOrder - b.displayOrder || a.title.localeCompare(b.title);
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
  renderLeaderboard();
  renderAdminControls();
  renderSubmittedState();
}

function renderEvents() {
  els.events.innerHTML = "";
  const template = document.querySelector("#eventTemplate");
  const activeSubmission = getActiveSubmission();

  for (const event of [...state.data.events].sort(byImportance)) {
    const savedPrediction = activeSubmission
      ? state.data.predictions.find((prediction) => prediction.submissionId === activeSubmission.id && prediction.eventId === event.id)
      : null;
    if (savedPrediction && !state.picks[event.id]) state.picks[event.id] = savedPrediction.selectedOptionId;

    const node = template.content.firstElementChild.cloneNode(true);
    node.classList.toggle("featured", event.type === "champion");
    node.querySelector(".stage").textContent = event.stage || "Tournament";
    node.querySelector("h3").textContent = event.title;
    node.querySelector(".description").textContent = event.description || "";
    node.querySelector(".points").textContent = `${event.points} pts`;
    if (event.closesAt) {
      node.querySelector(".description").textContent = `${event.description || ""} Closes ${new Date(event.closesAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}.`.trim();
    }

    const options = node.querySelector(".options");
    for (const option of event.options || []) {
      const label = document.createElement("label");
      label.className = "option";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = event.id;
      input.value = option.optionId;
      input.disabled = event.locked;
      input.checked = state.picks[event.id] === option.optionId;
      input.addEventListener("change", () => {
        state.picks[event.id] = option.optionId;
      });
      const span = document.createElement("span");
      span.textContent = option.label;
      applyFlagStyle(span, option);
      label.append(input, span);
      options.append(label);
    }

    if (event.result) {
      const result = document.createElement("p");
      result.className = "small-message";
      result.textContent = `Result: ${event.result.winningLabel}`;
      node.append(result);
    }

    els.events.append(node);
  }
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

function renderAdminControls() {
  els.adminEvent.innerHTML = "";
  for (const event of state.data.events) {
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

  if (!state.picks.champion) {
    alert("Please make the World Cup winner pick before submitting.");
    return;
  }

  if (!state.apiReady) {
    showNotice("Connect Supabase and deploy to Vercel before accepting real submissions.");
    return;
  }

  try {
    const result = await api("/api/submit", {
      method: "POST",
      body: JSON.stringify({ displayName, picks: state.picks })
    });
    localStorage.setItem("activeName", result.displayName);
    state.activeName = result.displayName;
    alert(`Saved ${result.savedPredictions} prediction${result.savedPredictions === 1 ? "" : "s"}. You can come back later for new unlocked matches.`);
    await loadState();
  } catch (error) {
    alert(error.message);
  }
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

loadState();

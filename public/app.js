const state = {
  user: JSON.parse(localStorage.getItem("planswipe:user") || "null"),
  groupCode: localStorage.getItem("planswipe:groupCode") || "",
  group: null,
  areas: [],
  types: [],
  index: 0,
  pollTimer: null
};

const setupPanel = document.querySelector("#setupPanel");
const groupPanel = document.querySelector("#groupPanel");
const statusPanel = document.querySelector("#statusPanel");
const decisionPanel = document.querySelector("#decisionPanel");
const swipeLayout = document.querySelector("#swipeLayout");
const resultsPanel = document.querySelector("#resultsPanel");
const nameInput = document.querySelector("#nameInput");
const groupInput = document.querySelector("#groupInput");
const codeInput = document.querySelector("#codeInput");
const createButton = document.querySelector("#createButton");
const joinButton = document.querySelector("#joinButton");
const resetButton = document.querySelector("#resetButton");
const reviewButton = document.querySelector("#reviewButton");
const groupName = document.querySelector("#groupName");
const groupCode = document.querySelector("#groupCode");
const memberRow = document.querySelector("#memberRow");
const decisionStep = document.querySelector("#decisionStep");
const decisionTitle = document.querySelector("#decisionTitle");
const decisionHint = document.querySelector("#decisionHint");
const optionGrid = document.querySelector("#optionGrid");
const searchSummary = document.querySelector("#searchSummary");
const activityCard = document.querySelector("#activityCard");
const activityPhoto = document.querySelector("#activityPhoto");
const activityCategory = document.querySelector("#activityCategory");
const activityTitle = document.querySelector("#activityTitle");
const activityDescription = document.querySelector("#activityDescription");
const activityArea = document.querySelector("#activityArea");
const activityTime = document.querySelector("#activityTime");
const activityCost = document.querySelector("#activityCost");
const noButton = document.querySelector("#noButton");
const yesButton = document.querySelector("#yesButton");
const resultList = document.querySelector("#resultList");
const loginPanel = document.querySelector("#loginPanel");
const loginUsername = document.querySelector("#loginUsername");
const loginPassword = document.querySelector("#loginPassword");
const loginButton = document.querySelector("#loginButton");
const registerButton = document.querySelector("#registerButton");
const logoutButton = document.querySelector("#logoutButton");
const topbar = document.querySelector("#topbar");


function setVisible(element, visible) {
  element.classList.toggle("is-hidden", !visible);
}

async function login() {
  const data = await api("/api/login", {
    method: "POST",
    body: {
      username: loginUsername.value,
      password: loginPassword.value
    }
  });

  localStorage.setItem(
    "planswipe:login",
    data.username
  );

  loginUsername.value = "";
  loginPassword.value = "";

  renderApp();
}

async function registerUser() {
  await api("/api/register", {
    method: "POST",
    body: {
      username: loginUsername.value,
      password: loginPassword.value
    }
  });

  alert("Account created.");
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Αποτυχία αιτήματος");
  return data;
}

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function selected(kind) {
  return state.group?.choices?.[kind]?.[state.user?.id] || null;
}

function consensus(kind) {
  return state.group?.consensus?.[kind] || null;
}

function memberCount() {
  return state.group?.members?.length || 1;
}

function renderMembers() {
  memberRow.innerHTML = state.group.members
    .map(
      (member) => `
        <span class="member-chip">
          <span class="avatar">${initials(member.name)}</span>
          ${member.name}${member.id === state.user.id ? " (εσύ)" : ""}
        </span>
      `
    )
    .join("");
}

function optionScore(kind, id) {
  return state.group?.counts?.[kind]?.[id] || 0;
}

function renderDecisionStep(kind) {
  const isAreaStep = kind === "area";
  const options = isAreaStep ? state.areas : state.types;
  const chosen = selected(kind);

  decisionStep.textContent = isAreaStep ? "Βήμα 1 από 2" : "Βήμα 2 από 2";

  decisionTitle.textContent = isAreaStep
    ? "Πού θέλετε να πάτε;"
    : "Τι είδους μέρος θέλετε;";

  decisionHint.textContent =
    "Όλοι πρέπει να συμφωνήσουν πριν προχωρήσετε στο επόμενο βήμα.";

  optionGrid.innerHTML = options
    .map((option) => {
      const score = optionScore(kind, option.id);
      const selectedClass = chosen === option.id ? " is-selected" : "";

      return `
        <button class="option-card${selectedClass}" type="button" data-kind="${kind}" data-id="${option.id}">
          <span class="option-score">${score}/${memberCount()} ψήφισαν</span>
          <span>
            <h3>${option.label}</h3>
            <p>${option.description}</p>
          </span>
        </button>
      `;
    })
    .join("");
}

function renderCard() {
  const place = state.group.places[state.index];

  if (!place) {
    setVisible(swipeLayout, false);
    setVisible(resultsPanel, true);
    renderResults();
    return;
  }

  activityCard.classList.remove("swipe-yes", "swipe-no");
  activityPhoto.src = place.photoUrl;
  activityPhoto.alt = place.title;

  activityCategory.textContent = `${place.category} | ${Number(place.rating || 4).toFixed(1)} αξιολόγηση`;
  activityTitle.textContent = place.title;
  activityDescription.textContent = place.description;

  activityArea.textContent = place.areaLabel;
  activityTime.textContent = place.time;
  activityCost.textContent = place.cost;
}

function renderResults() {
  const matches = state.group.matches || [];

  if (!matches.length) {
    resultList.innerHTML = `
      <article class="result-card">
        <div class="result-icon"></div>
        <div>
          <h3>Δεν υπάρχει ακόμα ισχυρή επιλογή</h3>
          <p>Συνεχίστε τις επιλογές ή περιμένετε την ομάδα.</p>
        </div>
        <strong class="result-score">0/${memberCount()}</strong>
      </article>
    `;
    return;
  }

  resultList.innerHTML = matches
    .map(
      (item) => `
        <article class="result-card">
          <img class="result-icon" src="${item.photoUrl}" alt="">
          <div>
            <h3>${item.title}</h3>
            <p>${item.areaLabel} | ${item.category} | ${item.yes}/${item.total} ψήφισαν ναι</p>
          </div>
          <strong class="result-score">${Math.round(item.score * 100)}%</strong>
        </article>
      `
    )
    .join("");
}

function renderStatus() {
  const areaReady = consensus("area");
  const typeReady = consensus("type");

  if (!state.group) {
    setVisible(statusPanel, false);
    return;
  }

  setVisible(statusPanel, true);

  if (!areaReady) {
    statusPanel.textContent = "Αναμονή για συμφωνία στην περιοχή.";
    return;
  }

  if (!typeReady) {
    statusPanel.textContent = "Η περιοχή έχει επιλεγεί. Αναμονή για τύπο.";
    return;
  }

  const source = state.group.search?.source === "google"
    ? "Google Places"
    : "δοκιμαστικά δεδομένα";

  statusPanel.textContent =
    `Αναζήτηση ${source}: "${state.group.search?.query || ""}"`;
}

function renderApp() {

  const loggedIn =
    localStorage.getItem("planswipe:login");

  if (!loggedIn) {

    setVisible(loginPanel, true);
    setVisible(topbar, false);

    setVisible(setupPanel, false);
    setVisible(groupPanel, false);
    setVisible(statusPanel, false);
    setVisible(decisionPanel, false);
    setVisible(swipeLayout, false);
    setVisible(resultsPanel, false);

    return;
  }

  setVisible(loginPanel, false);
  setVisible(topbar, true);

  if (!state.group || !state.user) {

    setVisible(setupPanel, true);
    setVisible(groupPanel, false);
    setVisible(statusPanel, false);
    setVisible(decisionPanel, false);
    setVisible(swipeLayout, false);
    setVisible(resultsPanel, false);

    return;
  }

  groupName.textContent = state.group.name;
  groupCode.textContent = state.group.code;

  renderMembers();
  renderStatus();

  setVisible(setupPanel, false);
  setVisible(groupPanel, true);

  if (!consensus("area")) {
    setVisible(decisionPanel, true);
    setVisible(swipeLayout, false);
    setVisible(resultsPanel, false);
    renderDecisionStep("area");
    return;
  }

  if (!consensus("type")) {
    setVisible(decisionPanel, true);
    setVisible(swipeLayout, false);
    setVisible(resultsPanel, false);
    renderDecisionStep("type");
    return;
  }

  searchSummary.textContent =
    `Αναζήτηση: "${state.group.search?.query || ""}"`;

  setVisible(decisionPanel, false);
  setVisible(resultsPanel, true);

  renderResults();

  if (state.index < (state.group.places?.length || 0)) {
    setVisible(swipeLayout, true);
    renderCard();
  } else {
    setVisible(swipeLayout, false);
  }
}

async function refreshGroup() {
  if (!state.groupCode) return;

  try {
    const data = await api(`/api/groups/${state.groupCode}`);
    state.group = data.group;
    renderApp();
  } catch (error) {
    showError(error.message);
    leaveGroup();
  }
}

function startPolling() {
  clearInterval(state.pollTimer);
  state.pollTimer = setInterval(refreshGroup, 1500);
}

function saveSession(user, group) {
  state.user = user;
  state.group = group;
  state.groupCode = group.code;

  localStorage.setItem("planswipe:user", JSON.stringify(user));
  localStorage.setItem("planswipe:groupCode", group.code);

  startPolling();
  renderApp();
}

async function createGroup() {
  const userName = nameInput.value.trim();
  if (!userName) {
    showError("Εισάγετε το όνομά σας.");
    return;
  }

  const data = await api("/api/groups", {
    method: "POST",
    body: {
      userName,
      groupName: groupInput.value.trim()
    }
  });

  saveSession(data.user, data.group);
}

async function joinGroup() {
  const userName = nameInput.value.trim();
  const code = codeInput.value.trim().toUpperCase();

  if (!userName || !code) {
    showError("Συμπληρώστε όνομα και κωδικό ομάδας.");
    return;
  }

  const data = await api(`/api/groups/${code}/join`, {
    method: "POST",
    body: { userName }
  });

  saveSession(data.user, data.group);
}

async function chooseOption(kind, optionId) {
  const data = await api(`/api/groups/${state.group.code}/choice`, {
    method: "POST",
    body: {
      userId: state.user.id,
      kind,
      optionId
    }
  });

  state.index = 0;
  state.group = data.group;
  renderApp();
}

async function vote(liked) {
  const place = state.group.places[state.index];
  if (!place) return;

  activityCard.classList.add(liked ? "swipe-yes" : "swipe-no");

  const data = await api(`/api/groups/${state.group.code}/vote`, {
    method: "POST",
    body: {
      userId: state.user.id,
      placeId: place.id,
      liked
    }
  });

  state.group = data.group;

  setTimeout(() => {
    state.index += 1;
    renderApp();
  }, 170);
}

function leaveGroup() {
  clearInterval(state.pollTimer);
  state.user = null;
  state.group = null;
  state.groupCode = "";
  state.index = 0;

  localStorage.removeItem("planswipe:user");
  localStorage.removeItem("planswipe:groupCode");

  renderApp();
}

function showError(message) {

  if (!localStorage.getItem("planswipe:login")) {
    alert(message);
    return;
  }

  setVisible(statusPanel, true);
  statusPanel.textContent = message;
}

async function boot() {
  const options = await api("/api/options");
  state.areas = options.areas;
  state.types = options.types;

  if (state.user && state.groupCode) {
    startPolling();
    await refreshGroup();
    return;
  }

  renderApp();
}

createButton.addEventListener("click", () =>
  createGroup().catch((error) => showError(error.message))
);

joinButton.addEventListener("click", () =>
  joinGroup().catch((error) => showError(error.message))
);
loginButton.addEventListener(
  "click",
  () => login().catch(
    err => showError(err.message)
  )
);

registerButton.addEventListener(
  "click",
  () => registerUser().catch(
    err => showError(err.message)
  )
);
resetButton.addEventListener("click", leaveGroup);

noButton.addEventListener("click", () =>
  vote(false).catch((error) => showError(error.message))
);

yesButton.addEventListener("click", () =>
  vote(true).catch((error) => showError(error.message))
);

reviewButton.addEventListener("click", () => {
  state.index = 0;
  renderApp();
});

logoutButton.addEventListener("click", () => {

  localStorage.removeItem("planswipe:login");
  localStorage.removeItem("planswipe:user");
  localStorage.removeItem("planswipe:groupCode");

  state.user = null;
  state.group = null;
  state.groupCode = "";

  clearInterval(state.pollTimer);

  renderApp();
});


optionGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".option-card");
  if (!button) return;

  chooseOption(button.dataset.kind, button.dataset.id)
    .catch((error) => showError(error.message));
});

nameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter")
    createGroup().catch((error) => showError(error.message));
});

codeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter")
    joinGroup().catch((error) => showError(error.message));
});

boot().catch((error) => showError(error.message));

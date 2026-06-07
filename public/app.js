const state = {
  user: JSON.parse(localStorage.getItem("planswipe:user") || "null"),
  groupCode: localStorage.getItem("planswipe:groupCode") || "",
  group: null,
  areas: [],
  types: [],
  index: 0,
  pollTimer: null,
  setupMode: "",
  activePage: ""
};

const setupPanel = document.querySelector("#setupPanel");
const groupPanel = document.querySelector("#groupPanel");
const statusPanel = document.querySelector("#statusPanel");
const decisionPanel = document.querySelector("#decisionPanel");
const swipeLayout = document.querySelector("#swipeLayout");
const resultsPanel = document.querySelector("#resultsPanel");
const pagePanel = document.querySelector("#pagePanel");
const modeButtons = document.querySelector("#modeButtons");
const createForm = document.querySelector("#createForm");
const joinForm = document.querySelector("#joinForm");
const createNameInput = document.querySelector("#createNameInput");
const joinNameInput = document.querySelector("#joinNameInput");
const groupInput = document.querySelector("#groupInput");
const codeInput = document.querySelector("#codeInput");
const showCreateButton = document.querySelector("#showCreateButton");
const showJoinButton = document.querySelector("#showJoinButton");
const backFromCreateButton = document.querySelector("#backFromCreateButton");
const backFromJoinButton = document.querySelector("#backFromJoinButton");
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
const profileButton = document.querySelector("#profileButton");
const profileMenu = document.querySelector("#profileMenu");
const profileInitial = document.querySelector("#profileInitial");
const pageEyebrow = document.querySelector("#pageEyebrow");
const pageTitle = document.querySelector("#pageTitle");
const pageDemo = document.querySelector("#pageDemo");
const closePageButton = document.querySelector("#closePageButton");

const pageContent = {
  inbox: {
    title: "Inbox",
    eyebrow: "Messages",
    cards: [
      ["Group invite", "New invitations and plan updates will appear here."],
      ["Friend requests", "Pending friend activity will be listed in this space."]
    ]
  },
  groups: {
    title: "My Groups",
    eyebrow: "Groups",
    cards: [
      ["Active groups", "A list of groups you created or joined will appear here."],
      ["Saved codes", "Quick access to recent 8-digit group codes will live here."]
    ]
  },
  friends: {
    title: "Friends",
    eyebrow: "People",
    cards: [
      ["Friend list", "Your contacts and frequent planning partners will appear here."],
      ["Add friends", "Search and invite tools can be added in this panel later."]
    ]
  },
  past: {
    title: "Past Activities",
    eyebrow: "History",
    cards: [
      ["Completed plans", "Past matches and finished activities will replace the old page here."],
      ["Highlights", "Photos, dates, and group members can be shown in this section later."]
    ]
  },
  personal: {
    title: "Personal Information",
    eyebrow: "Profile",
    cards: [
      ["Profile details", "Name, profile picture, and account information will be edited here."],
      ["Preferences", "Favorite areas and activity types can live in this page."]
    ]
  },
  settings: {
    title: "Settings",
    eyebrow: "Account",
    cards: [
      ["Notifications", "Notification preferences will appear here."],
      ["Privacy", "Account privacy and session controls can be added here."]
    ]
  }
};

function setVisible(element, visible) {
  element.classList.toggle("is-hidden", !visible);
}

function isLoggedIn() {
  return Boolean(localStorage.getItem("planswipe:login"));
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

function setLoggedIn(username) {
  localStorage.setItem("planswipe:login", username);
  profileInitial.textContent = initials(username) || "P";
}

async function login() {
  const data = await api("/api/login", {
    method: "POST",
    body: {
      username: loginUsername.value,
      password: loginPassword.value
    }
  });

  setLoggedIn(data.username);
  loginUsername.value = "";
  loginPassword.value = "";
  renderApp();
}

async function registerUser() {
  const username = loginUsername.value.trim();
  const password = loginPassword.value;

  await api("/api/register", {
    method: "POST",
    body: { username, password }
  });

  setLoggedIn(username);
  loginUsername.value = "";
  loginPassword.value = "";
  renderApp();
}

function initials(name) {
  return String(name || "")
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

function optionsFor(kind) {
  return state.group?.options?.[kind] || (kind === "area" ? state.areas : state.types);
}

function optionScore(kind, id) {
  return state.group?.counts?.[kind]?.[id] || 0;
}

function renderMembers() {
  memberRow.innerHTML = (state.group.members || [])
    .map(
      (member) => `
        <span class="member-chip">
          <span class="avatar">${initials(member.name)}</span>
          ${member.name}${member.id === state.user.id ? " (you)" : ""}
        </span>
      `
    )
    .join("");
}

function renderSetup() {
  setVisible(modeButtons, !state.setupMode);
  setVisible(createForm, state.setupMode === "create");
  setVisible(joinForm, state.setupMode === "join");
}

function renderDecisionStep(kind) {
  const isAreaStep = kind === "area";
  const options = optionsFor(kind);
  const chosen = selected(kind);

  decisionStep.textContent = isAreaStep ? "Step 1 of 2" : "Step 2 of 2";
  decisionTitle.textContent = isAreaStep
    ? "Where do you want to go?"
    : "What kind of activity do you want?";
  decisionHint.textContent =
    "Everyone needs to agree before the group moves to the next step.";

  const optionCards = options
    .map((option) => {
      const score = optionScore(kind, option.id);
      const selectedClass = chosen === option.id ? " is-selected" : "";

      return `
        <button class="option-card${selectedClass}" type="button" data-kind="${kind}" data-id="${option.id}">
          <span class="option-score">${score}/${memberCount()} voted</span>
          <span>
            <h3>${option.label}</h3>
            <p>${option.description}</p>
          </span>
        </button>
      `;
    })
    .join("");

  optionGrid.innerHTML = `
    ${optionCards}
    <button class="option-card add-option-card" type="button" data-kind="${kind}" data-custom="true">
      <span class="option-score">Add your own</span>
      <span>
        <h3>${isAreaStep ? "Add area" : "Add activity"}</h3>
        <p>${isAreaStep ? "Suggest a different neighborhood or place." : "Suggest a different activity type."}</p>
      </span>
    </button>
  `;
}

function renderCard() {
  const place = state.group.places?.[state.index];

  if (!place) {
    setVisible(swipeLayout, false);
    setVisible(resultsPanel, true);
    renderResults();
    return;
  }

  activityCard.classList.remove("swipe-yes", "swipe-no");
  activityPhoto.src = place.photoUrl;
  activityPhoto.alt = place.title;
  activityCategory.textContent = `${place.category} | ${Number(place.rating || 4).toFixed(1)} rating`;
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
          <h3>No strong choice yet</h3>
          <p>Keep swiping or wait for the rest of the group.</p>
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
            <p>${item.areaLabel} | ${item.category} | ${item.yes}/${item.total} voted yes</p>
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
    statusPanel.textContent = "Waiting for everyone to agree on an area.";
    return;
  }

  if (!typeReady) {
    statusPanel.textContent = "Area selected. Waiting for everyone to agree on an activity.";
    return;
  }

  const source = state.group.search?.source === "google"
    ? "Google Places"
    : state.group.search?.source === "custom"
      ? "custom group idea"
      : "sample data";

  statusPanel.textContent = `Search from ${source}: "${state.group.search?.query || ""}"`;
}

function renderProfilePage() {
  const content = pageContent[state.activePage];
  if (!content) return;

  pageEyebrow.textContent = content.eyebrow;
  pageTitle.textContent = content.title;
  pageDemo.innerHTML = content.cards
    .map(
      ([title, text]) => `
        <article class="demo-card">
          <h3>${title}</h3>
          <p>${text}</p>
        </article>
      `
    )
    .join("");
}

function hideAppPanels() {
  setVisible(setupPanel, false);
  setVisible(groupPanel, false);
  setVisible(statusPanel, false);
  setVisible(decisionPanel, false);
  setVisible(swipeLayout, false);
  setVisible(resultsPanel, false);
}

function renderApp() {
  if (!isLoggedIn()) {
    setVisible(loginPanel, true);
    setVisible(topbar, false);
    setVisible(pagePanel, false);
    hideAppPanels();
    return;
  }

  setVisible(loginPanel, false);
  setVisible(topbar, true);
  profileInitial.textContent = initials(localStorage.getItem("planswipe:login")) || "P";

  if (state.activePage) {
    hideAppPanels();
    setVisible(pagePanel, true);
    renderProfilePage();
    return;
  }

  setVisible(pagePanel, false);

  if (!state.group || !state.user) {
    setVisible(setupPanel, true);
    setVisible(groupPanel, false);
    setVisible(statusPanel, false);
    setVisible(decisionPanel, false);
    setVisible(swipeLayout, false);
    setVisible(resultsPanel, false);
    renderSetup();
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

  searchSummary.textContent = `Search: "${state.group.search?.query || ""}"`;
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
  state.setupMode = "";

  localStorage.setItem("planswipe:user", JSON.stringify(user));
  localStorage.setItem("planswipe:groupCode", group.code);

  startPolling();
  renderApp();
}

async function createGroup() {
  const userName = createNameInput.value.trim();
  if (!userName) {
    showError("Enter your name.");
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
  const userName = joinNameInput.value.trim();
  const code = codeInput.value.trim();

  if (!userName || !/^\d{8}$/.test(code)) {
    showError("Enter your name and an 8-digit group code.");
    return;
  }

  const data = await api(`/api/groups/${code}/join`, {
    method: "POST",
    body: { userName }
  });

  saveSession(data.user, data.group);
}

async function chooseOption(kind, optionId, customLabel = "") {
  const data = await api(`/api/groups/${state.group.code}/choice`, {
    method: "POST",
    body: {
      userId: state.user.id,
      kind,
      optionId,
      customLabel
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
  state.setupMode = "";

  localStorage.removeItem("planswipe:user");
  localStorage.removeItem("planswipe:groupCode");

  renderApp();
}

function logout() {
  leaveGroup();
  state.activePage = "";
  localStorage.removeItem("planswipe:login");
  renderApp();
}

function showError(message) {
  if (!isLoggedIn()) {
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

  if (isLoggedIn() && state.user && state.groupCode) {
    startPolling();
    await refreshGroup();
    return;
  }

  renderApp();
}

showCreateButton.addEventListener("click", () => {
  state.setupMode = "create";
  renderApp();
});

showJoinButton.addEventListener("click", () => {
  state.setupMode = "join";
  renderApp();
});

backFromCreateButton.addEventListener("click", () => {
  state.setupMode = "";
  renderApp();
});

backFromJoinButton.addEventListener("click", () => {
  state.setupMode = "";
  renderApp();
});

createButton.addEventListener("click", () =>
  createGroup().catch((error) => showError(error.message))
);

joinButton.addEventListener("click", () =>
  joinGroup().catch((error) => showError(error.message))
);

loginButton.addEventListener("click", () =>
  login().catch((error) => showError(error.message))
);

registerButton.addEventListener("click", () =>
  registerUser().catch((error) => showError(error.message))
);

loginUsername.addEventListener("keydown", (event) => {
  if (event.key === "Enter") login().catch((error) => showError(error.message));
});

loginPassword.addEventListener("keydown", (event) => {
  if (event.key === "Enter") login().catch((error) => showError(error.message));
});

resetButton.addEventListener("click", leaveGroup);
logoutButton.addEventListener("click", logout);

profileButton.addEventListener("click", () => {
  profileMenu.classList.toggle("is-hidden");
});

profileMenu.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-page]");
  if (!button) return;

  state.activePage = button.dataset.page;
  profileMenu.classList.add("is-hidden");
  renderApp();
});

closePageButton.addEventListener("click", () => {
  state.activePage = "";
  renderApp();
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".profile-wrap")) {
    profileMenu.classList.add("is-hidden");
  }
});

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

optionGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".option-card");
  if (!button) return;

  const kind = button.dataset.kind;

  if (button.dataset.custom === "true") {
    const label = prompt(kind === "area" ? "Add an area" : "Add an activity");
    if (!label?.trim()) return;
    chooseOption(kind, "", label.trim()).catch((error) => showError(error.message));
    return;
  }

  chooseOption(kind, button.dataset.id).catch((error) => showError(error.message));
});

createNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") createGroup().catch((error) => showError(error.message));
});

groupInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") createGroup().catch((error) => showError(error.message));
});

joinNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") joinGroup().catch((error) => showError(error.message));
});

codeInput.addEventListener("input", () => {
  codeInput.value = codeInput.value.replace(/\D/g, "").slice(0, 8);
});

codeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") joinGroup().catch((error) => showError(error.message));
});

boot().catch((error) => showError(error.message));

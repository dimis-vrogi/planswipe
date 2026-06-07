const state = {
  user: JSON.parse(localStorage.getItem("planswipe:user") || "null"),
  groupCode: localStorage.getItem("planswipe:groupCode") || "",
  group: null,
  areas: [],
  types: [],
  index: 0,
  pollTimer: null,
  setupMode: "",
  activePage: "",
  loginOpen: false,
  account: JSON.parse(localStorage.getItem("planswipe:account") || "null"),
  language: localStorage.getItem("planswipe:language") || "en",
  supabaseClient: null,
  supabaseSession: null
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
const backChoiceButton = document.querySelector("#backChoiceButton");
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
const maybeButton = document.querySelector("#maybeButton");
const yesButton = document.querySelector("#yesButton");
const resultList = document.querySelector("#resultList");
const loginPanel = document.querySelector("#loginPanel");
const loginForm = document.querySelector("#loginForm");
const openLoginButton = document.querySelector("#openLoginButton");
const heroLoginButton = document.querySelector("#heroLoginButton");
const loginUsername = document.querySelector("#loginUsername");
const loginEmail = document.querySelector("#loginEmail");
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
const languageButton = document.querySelector("#languageButton");
const appLanguageButton = document.querySelector("#appLanguageButton");
const suggestionButton = document.querySelector("#suggestionButton");
const suggestionPanel = document.querySelector("#suggestionPanel");
const homeButton = document.querySelector("#homeButton");

const pageContent = {
  inbox: {
    title: "Inbox",
    eyebrow: "Messages",
    dynamic: true
  },
  groups: {
    title: "My Groups",
    eyebrow: "Groups",
    dynamic: true
  },
  friends: {
    title: "Friends",
    eyebrow: "People",
    dynamic: true
  },
  past: {
    title: "Past Activities",
    eyebrow: "History",
    dynamic: true
  },
  personal: {
    title: "Personal Information",
    eyebrow: "Profile",
    dynamic: true
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

const copy = {
  en: {
    login: "Login",
    createAccount: "Create Account",
    enterPlanswipe: "Enter PlanSwipe",
    groupPlans: "Group plans",
    leaveGroup: "Leave Group",
    inbox: "Inbox",
    groups: "My Groups",
    friends: "Friends",
    past: "Past Activities",
    personal: "Personal Information",
    settings: "Settings",
    logout: "Logout",
    heroEyebrow: "Group plans made easier",
    heroTitle: "Find the plan your group can actually agree on.",
    heroDescription: "Pick the basics together, swipe through nearby ideas, and let PlanSwipe surface the places your friends are most likely to enjoy.",
    heroNote: "Built for group chats that never decide.",
    startPlanning: "Start planning with your group",
    startPlanningText: "Choose whether you are creating a new group or joining one that already exists.",
    createGroup: "Create Group",
    createGroupText: "Pick a group name and get a new 8-digit code.",
    joinGroup: "Join Group",
    joinGroupText: "Enter the 8-digit code from a friend.",
    groupName: "Group name",
    groupCodeLabel: "8-digit group code",
    back: "Back",
    backToApp: "Back to PlanSwipe",
    currentGroup: "Current group",
    stepArea: "Step 1 of 2",
    stepType: "Step 2 of 2",
    areaTitle: "Where do you want to go?",
    typeTitle: "What kind of activity do you want?",
    decisionHint: "Everyone needs to agree before the group moves to the next step.",
    addArea: "Add area",
    addActivity: "Add activity",
    addAreaText: "Suggest a different neighborhood or place.",
    addActivityText: "Suggest a different activity type.",
    addOwn: "Add your own",
    liveChoices: "Live choices",
    resultsTitle: "What you can do",
    aiSuggestions: "AI Suggestions",
    changeBasics: "Change basics",
    noStrongChoice: "No strong choice yet",
    keepSwiping: "Keep swiping or wait for the rest of the group.",
    noFriends: "No friends yet",
    searchByUsername: "Search by username",
    search: "Search",
    requests: "Requests",
    saveProfile: "Save Profile",
    age: "Age",
    bio: "Bio",
    preferences: "Preferences",
    logPastActivity: "Log Past Activity",
    area: "Area",
    activity: "Activity",
    place: "Place",
    saveActivity: "Save Activity",
    suggestedPlaces: "Suggested places"
  },
  el: {
    login: "Σύνδεση",
    createAccount: "Δημιουργία λογαριασμού",
    enterPlanswipe: "Μπες στο PlanSwipe",
    groupPlans: "Ομαδικά σχέδια",
    leaveGroup: "Έξοδος από ομάδα",
    inbox: "Εισερχόμενα",
    groups: "Οι ομάδες μου",
    friends: "Φίλοι",
    past: "Παλαιότερες δραστηριότητες",
    personal: "Προσωπικά στοιχεία",
    settings: "Ρυθμίσεις",
    logout: "Αποσύνδεση",
    heroEyebrow: "Ομαδικά σχέδια πιο εύκολα",
    heroTitle: "Βρες το σχέδιο με το οποίο μπορεί να συμφωνήσει η παρέα.",
    heroDescription: "Διαλέξτε μαζί τα βασικά, κάντε swipe σε ιδέες κοντά σας και αφήστε το PlanSwipe να αναδείξει τα μέρη που ταιριάζουν στην παρέα.",
    heroNote: "Για ομαδικές συνομιλίες που δεν αποφασίζουν ποτέ.",
    startPlanning: "Ξεκίνα να σχεδιάζεις με την ομάδα σου",
    startPlanningText: "Διάλεξε αν θέλεις να δημιουργήσεις νέα ομάδα ή να μπεις σε υπάρχουσα.",
    createGroup: "Δημιουργία ομάδας",
    createGroupText: "Δώσε όνομα ομάδας και πάρε νέο 8ψήφιο κωδικό.",
    joinGroup: "Συμμετοχή σε ομάδα",
    joinGroupText: "Βάλε τον 8ψήφιο κωδικό από φίλο.",
    groupName: "Όνομα ομάδας",
    groupCodeLabel: "8ψήφιος κωδικός ομάδας",
    back: "Πίσω",
    backToApp: "Πίσω στο PlanSwipe",
    currentGroup: "Τρέχουσα ομάδα",
    stepArea: "Βήμα 1 από 2",
    stepType: "Βήμα 2 από 2",
    areaTitle: "Πού θέλετε να πάτε;",
    typeTitle: "Τι είδους δραστηριότητα θέλετε;",
    decisionHint: "Πρέπει να συμφωνήσουν όλοι πριν προχωρήσει η ομάδα.",
    addArea: "Προσθήκη περιοχής",
    addActivity: "Προσθήκη δραστηριότητας",
    addAreaText: "Πρότεινε άλλη γειτονιά ή μέρος.",
    addActivityText: "Πρότεινε άλλο είδος δραστηριότητας.",
    addOwn: "Πρόσθεσε δικό σου",
    liveChoices: "Ζωντανές επιλογές",
    resultsTitle: "Τι μπορείτε να κάνετε",
    aiSuggestions: "Προτάσεις AI",
    changeBasics: "Αλλαγή βασικών",
    noStrongChoice: "Δεν υπάρχει δυνατή επιλογή ακόμα",
    keepSwiping: "Συνεχίστε το swipe ή περιμένετε την υπόλοιπη ομάδα.",
    noFriends: "Δεν έχεις φίλους ακόμα",
    searchByUsername: "Αναζήτηση με username",
    search: "Αναζήτηση",
    requests: "Αιτήματα",
    saveProfile: "Αποθήκευση προφίλ",
    age: "Ηλικία",
    bio: "Βιογραφικό",
    preferences: "Προτιμήσεις",
    logPastActivity: "Καταχώριση δραστηριότητας",
    area: "Περιοχή",
    activity: "Δραστηριότητα",
    place: "Μέρος",
    saveActivity: "Αποθήκευση δραστηριότητας",
    suggestedPlaces: "Προτεινόμενα μέρη"
  }
};

function t(key) {
  return copy[state.language]?.[key] || copy.en[key] || key;
}

function applyLanguage() {
  document.documentElement.lang = state.language;
  languageButton.textContent = state.language === "en" ? "EL" : "EN";
  appLanguageButton.textContent = state.language === "en" ? "EL" : "EN";
  openLoginButton.textContent = t("login");
  heroLoginButton.textContent = t("login");
  loginButton.textContent = t("login");
  registerButton.textContent = t("createAccount");
  loginForm.querySelector("h2").textContent = t("enterPlanswipe");
  document.querySelector(".hero-copy .eyebrow").textContent = t("heroEyebrow");
  document.querySelector(".hero-copy h1").textContent = t("heroTitle");
  document.querySelector(".hero-description").textContent = t("heroDescription");
  document.querySelector(".hero-actions span").textContent = t("heroNote");
  document.querySelector(".topbar .eyebrow").textContent = t("groupPlans");
  resetButton.textContent = t("leaveGroup");
  closePageButton.textContent = t("backToApp");
  suggestionButton.textContent = t("aiSuggestions");
  reviewButton.textContent = t("changeBasics");
  document.querySelector("#setupPanel h2").textContent = t("startPlanning");
  document.querySelector("#setupPanel .setup-intro p").textContent = t("startPlanningText");
  showCreateButton.querySelector("strong").textContent = t("createGroup");
  showCreateButton.querySelector("span").textContent = t("createGroupText");
  showJoinButton.querySelector("strong").textContent = t("joinGroup");
  showJoinButton.querySelector("span").textContent = t("joinGroupText");
  createForm.querySelector(".field span").textContent = t("groupName");
  joinForm.querySelector(".field span").textContent = t("groupCodeLabel");
  createButton.textContent = t("createGroup");
  joinButton.textContent = t("joinGroup");
  backFromCreateButton.textContent = t("back");
  backFromJoinButton.textContent = t("back");
  const menuLabels = ["inbox", "groups", "friends", "past", "personal", "settings"];
  profileMenu.querySelectorAll("button[data-page]").forEach((button, index) => {
    button.textContent = t(menuLabels[index]);
  });
  logoutButton.textContent = t("logout");
}

function toggleLanguage() {
  state.language = state.language === "en" ? "el" : "en";
  localStorage.setItem("planswipe:language", state.language);
  applyLanguage();
  renderApp();
}

function setVisible(element, visible) {
  element.classList.toggle("is-hidden", !visible);
}

function isLoggedIn() {
  return Boolean(localStorage.getItem("planswipe:login"));
}

function currentUsername() {
  return localStorage.getItem("planswipe:login") || "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (state.supabaseSession?.access_token) {
    headers.Authorization = `Bearer ${state.supabaseSession.access_token}`;
  }

  const response = await fetch(path, {
    headers,
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

function initials(name) {
  return String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function setLoggedIn(username, email) {
  localStorage.setItem("planswipe:login", username);
  localStorage.setItem("planswipe:email", email || "");
  profileInitial.textContent = initials(username) || "P";
}

async function configureSupabaseAuth() {
  try {
    const config = await api("/api/config");
    if (config.supabaseUrl && config.supabaseAnonKey && window.supabase) {
      state.supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
      const { data } = await state.supabaseClient.auth.getSession();
      state.supabaseSession = data.session || null;
      state.supabaseClient.auth.onAuthStateChange((_event, session) => {
        state.supabaseSession = session || null;
      });
    }
  } catch (error) {
    console.warn(error.message);
  }
}

async function syncSupabaseProfile(username, email) {
  const data = await api("/api/auth/profile", {
    method: "POST",
    body: {
      username,
      email
    }
  });
  setLoggedIn(data.user.username, data.user.email || email);
  saveAccount(data.user);
  return data.user;
}

function saveAccount(user) {
  state.account = user;
  localStorage.setItem("planswipe:account", JSON.stringify(user));
  if (user?.profile?.picture) {
    profileInitial.style.backgroundImage = `url("${user.profile.picture}")`;
    profileInitial.textContent = "";
  } else {
    profileInitial.style.backgroundImage = "";
    profileInitial.textContent = initials(user?.username || currentUsername()) || "P";
  }
}

async function loadAccount() {
  if (!isLoggedIn()) return null;
  const data = await api(`/api/account?username=${encodeURIComponent(currentUsername())}&viewer=${encodeURIComponent(currentUsername())}`);
  saveAccount(data.user);
  return data.user;
}

async function login() {
  if (!validEmail(loginEmail.value)) {
    throw new Error("Enter a valid email address.");
  }

  if (state.supabaseClient) {
    const { data, error } = await state.supabaseClient.auth.signInWithPassword({
      email: loginEmail.value.trim(),
      password: loginPassword.value
    });
    if (error) throw new Error(error.message);
    state.supabaseSession = data.session;
    await syncSupabaseProfile(loginUsername.value.trim(), data.user.email || loginEmail.value.trim());
    loginUsername.value = "";
    loginEmail.value = "";
    loginPassword.value = "";
    state.loginOpen = false;
    renderApp();
    return;
  }

  const data = await api("/api/login", {
    method: "POST",
    body: {
      username: loginUsername.value,
      email: loginEmail.value,
      password: loginPassword.value
    }
  });

  setLoggedIn(data.username, data.email || loginEmail.value.trim());
  saveAccount({
    username: data.username,
    email: data.email || loginEmail.value.trim(),
    profile: data.profile
  });
  loginUsername.value = "";
  loginEmail.value = "";
  loginPassword.value = "";
  state.loginOpen = false;
  renderApp();
}

async function registerUser() {
  const username = loginUsername.value.trim();
  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  if (!validEmail(email)) {
    throw new Error("Enter a valid email address.");
  }

  if (state.supabaseClient) {
    const { data, error } = await state.supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });
    if (error) throw new Error(error.message);
    state.supabaseSession = data.session;
    if (!data.session) {
      alert("Check your email to confirm your account, then log in.");
      return;
    }
    await syncSupabaseProfile(username, data.user.email || email);
    loginUsername.value = "";
    loginEmail.value = "";
    loginPassword.value = "";
    state.loginOpen = false;
    renderApp();
    return;
  }

  const data = await api("/api/register", {
    method: "POST",
    body: { username, email, password }
  });

  setLoggedIn(data.username || username, data.email || email);
  saveAccount({
    username: data.username || username,
    email: data.email || email,
    profile: data.profile
  });
  loginUsername.value = "";
  loginEmail.value = "";
  loginPassword.value = "";
  state.loginOpen = false;
  renderApp();
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
    .map((member) => `
      <button class="member-chip" type="button" data-username="${escapeHtml(member.username || member.name)}">
        <span class="avatar">${member.profile?.picture ? `<img src="${escapeHtml(member.profile.picture)}" alt="">` : escapeHtml(initials(member.name))}</span>
        ${escapeHtml(member.name)}${member.id === state.user.id ? " (you)" : ""}
      </button>
    `)
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
  decisionHint.textContent = "Everyone needs to agree before the group moves to the next step.";
  setVisible(backChoiceButton, kind === "type" || Boolean(chosen));

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
        <strong class="result-score">0%</strong>
      </article>
    `;
    return;
  }

  resultList.innerHTML = matches
    .map((item) => `
      <article class="result-card">
        <img class="result-icon" src="${item.photoUrl}" alt="">
        <div>
          <h3>${item.title}</h3>
          <p>${item.areaLabel} | ${item.category} | ${item.yes}/${item.total} yes, ${item.maybe || 0} maybe</p>
        </div>
        <strong class="result-score">${item.percent}%</strong>
      </article>
    `)
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

function preferenceList(title, key, items, placeholder) {
  return `
    <div class="preference-box">
      <h3>${escapeHtml(title)}</h3>
      <div class="pill-row">
        ${(items || []).map((item) => `
          <span class="preference-pill">${escapeHtml(item)}</span>
        `).join("") || `<span class="muted-text">Nothing saved yet.</span>`}
      </div>
      <div class="inline-add">
        <input type="text" data-pref-input="${key}" placeholder="${escapeHtml(placeholder)}">
        <button type="button" data-pref-add="${key}">Add</button>
      </div>
    </div>
  `;
}

function profileImage(user, sizeClass = "profile-preview") {
  const picture = user?.profile?.picture || "";
  if (picture) {
    return `<span class="${sizeClass} image-avatar" style="background-image:url('${escapeHtml(picture)}')"></span>`;
  }
  return `<span class="${sizeClass}">${escapeHtml(initials(user?.username || currentUsername()) || "P")}</span>`;
}

async function renderPersonalInformation() {
  const account = await loadAccount();
  const profile = account.profile || {};
  const preferences = profile.preferences || {};

  pageDemo.innerHTML = `
    <form class="personal-form">
      <section>
        <h3>My Profile</h3>
        <label class="profile-upload">
          ${profileImage(account)}
          <span>Edit profile picture</span>
          <input id="profilePictureInput" type="file" accept="image/*">
        </label>
        <label class="field">
          <span>Username</span>
          <input type="text" value="${escapeHtml(account.username)}" disabled>
        </label>
        <label class="field">
          <span>Email</span>
          <input type="email" value="${escapeHtml(account.email || "")}" disabled>
        </label>
        <label class="field">
          <span>${t("age")}</span>
          <input id="profileAge" type="number" min="13" max="120" value="${escapeHtml(profile.age || "")}">
        </label>
        <label class="field">
          <span>Password</span>
          <input type="password" placeholder="Email authentication required to change password" disabled>
        </label>
        <label class="field">
          <span>${t("bio")}</span>
          <textarea id="profileBio" rows="5" placeholder="Tell friends what kind of plans you like.">${escapeHtml(profile.bio || "")}</textarea>
        </label>
        <button class="primary-button" type="button" id="saveProfileButton">${t("saveProfile")}</button>
      </section>

      <section>
        <h3>${t("preferences")}</h3>
        ${preferenceList("Favourite Areas", "areas", preferences.areas, "Add another area")}
        ${preferenceList("Favourite Activities", "activities", preferences.activities, "Add another activity")}
        ${preferenceList("Favourite Places", "places", preferences.places, "Add another place")}
      </section>
    </form>
  `;
}

function userCard(user, action = "") {
  const preferences = user.profile?.preferences || {};
  const preferenceText = [
    ...(preferences.areas || []),
    ...(preferences.activities || []),
    ...(preferences.places || [])
  ].slice(0, 4).join(", ");

  return `
    <article class="demo-card user-card">
      <div class="user-card-head">
        ${profileImage(user, "small-profile-preview")}
        <div>
          <h3>${escapeHtml(user.username)}</h3>
          <p>${escapeHtml(user.profile?.bio || "No bio yet.")}</p>
        </div>
      </div>
      <p>${escapeHtml(preferenceText || "No preferences saved yet.")}</p>
      ${action}
    </article>
  `;
}

async function renderFriendsPage() {
  pageDemo.innerHTML = `
    <section class="wide-panel">
      <div class="inline-add">
        <input id="friendSearchInput" type="text" placeholder="Search by username">
        <button id="friendSearchButton" type="button">Search</button>
      </div>
      <div id="friendSearchResults" class="demo-grid"></div>
    </section>
    <section class="wide-panel">
      <h3>Friends</h3>
      <div id="friendList" class="demo-grid"></div>
    </section>
    <section class="wide-panel">
      <h3>Requests</h3>
      <div id="requestList" class="demo-grid"></div>
    </section>
  `;

  await refreshFriendsPage();
}

async function refreshFriendsPage() {
  const data = await api(`/api/friends?username=${encodeURIComponent(currentUsername())}`);
  const friendList = document.querySelector("#friendList");
  const requestList = document.querySelector("#requestList");
  if (!friendList || !requestList) return;

  friendList.innerHTML = data.friends.length
    ? data.friends.map((user) => userCard(user, `<button class="secondary-button" type="button" data-view-profile="${escapeHtml(user.username)}">View Profile</button>`)).join("")
    : `<article class="demo-card"><h3>No friends yet</h3><p>Search by username or add someone from your group.</p></article>`;

  const requests = [
    ...data.incoming.map((user) => userCard(user, `<button class="primary-button" type="button" data-accept-friend="${escapeHtml(user.username)}">Accept</button>`)),
    ...data.outgoing.map((user) => userCard(user, `<span class="request-status">Request sent</span>`))
  ];
  requestList.innerHTML = requests.length
    ? requests.join("")
    : `<article class="demo-card"><h3>No pending requests</h3><p>Friend requests will appear here.</p></article>`;
}

async function renderGroupsPage() {
  const data = await api(`/api/groups/mine?username=${encodeURIComponent(currentUsername())}`);
  pageDemo.innerHTML = data.groups.length
    ? data.groups.map((group) => `
      <article class="demo-card">
        <h3>${escapeHtml(group.name)}</h3>
        <p>Code ${escapeHtml(group.code)} | ${group.memberCount} member${group.memberCount === 1 ? "" : "s"}</p>
        <button class="primary-button" type="button" data-open-group="${escapeHtml(group.code)}">Open Group</button>
      </article>
    `).join("")
    : `<article class="demo-card"><h3>No saved groups yet</h3><p>Create or join a group and it will appear here.</p></article>`;
}

async function renderInboxPage() {
  const data = await api(`/api/friends?username=${encodeURIComponent(currentUsername())}`);
  pageDemo.innerHTML = data.incoming.length
    ? data.incoming.map((user) => userCard(user, `<button class="primary-button" type="button" data-accept-friend="${escapeHtml(user.username)}">Accept</button>`)).join("")
    : `<article class="demo-card"><h3>Inbox is clear</h3><p>Friend requests will appear here.</p></article>`;
}

async function renderPastPage() {
  const account = await loadAccount();
  const activities = account.profile?.pastActivities || [];
  pageDemo.innerHTML = `
    <section class="wide-panel">
      <button class="primary-button" type="button" id="showPastActivityForm">${t("logPastActivity")}</button>
      <form class="setup-form is-hidden" id="pastActivityForm">
        <label class="field">
          <span>${t("area")}</span>
          <input id="pastAreaInput" type="text" placeholder="Athens seaside">
        </label>
        <label class="field">
          <span>${t("activity")}</span>
          <input id="pastActivityInput" type="text" placeholder="Dinner">
        </label>
        <label class="field">
          <span>${t("place")}</span>
          <input id="pastPlaceInput" type="text" placeholder="Restaurant name">
        </label>
        <button class="primary-button" type="button" id="savePastActivityButton">${t("saveActivity")}</button>
      </form>
    </section>
    ${activities.length
      ? activities.map((activity) => `
        <article class="demo-card">
          <h3>${escapeHtml(activity.place)}</h3>
          <p>${escapeHtml(activity.area)} | ${escapeHtml(activity.activity)}</p>
        </article>
      `).join("")
      : `<article class="demo-card"><h3>No past activities yet</h3><p>Log places you have already tried so recommendations can learn from them.</p></article>`}
  `;
}

async function savePastActivity() {
  const area = document.querySelector("#pastAreaInput")?.value.trim();
  const activity = document.querySelector("#pastActivityInput")?.value.trim();
  const place = document.querySelector("#pastPlaceInput")?.value.trim();
  if (!area || !activity || !place) {
    showError("Area, activity, and place are required.");
    return;
  }

  const profile = state.account?.profile || {};
  const pastActivities = [
    { area, activity, place, loggedAt: Date.now() },
    ...(profile.pastActivities || [])
  ].slice(0, 50);

  const data = await api("/api/account", {
    method: "PATCH",
    body: {
      username: currentUsername(),
      profile: { ...profile, pastActivities }
    }
  });

  saveAccount(data.user);
  await renderPastPage();
}

async function renderAccountProfile(username) {
  const data = await api(`/api/account?username=${encodeURIComponent(username)}&viewer=${encodeURIComponent(currentUsername())}`);
  const user = data.user;
  const preferences = user.profile?.preferences || {};
  pageEyebrow.textContent = "Profile";
  pageTitle.textContent = user.username;
  const friendAction = user.username === currentUsername()
    ? ""
    : user.friendStatus === "friends"
      ? `<span class="request-status">Friends</span>`
      : user.friendStatus === "incoming"
        ? `<button class="primary-button" type="button" data-accept-friend="${escapeHtml(user.username)}">Accept Request</button>`
        : user.friendStatus === "requested"
          ? `<span class="request-status">Request sent</span>`
          : `<button class="primary-button" type="button" data-add-friend="${escapeHtml(user.username)}">Add Friend</button>`;
  pageDemo.innerHTML = `
    ${userCard(user, friendAction)}
    <section class="wide-panel">
      <h3>Preferences</h3>
      ${preferenceList("Favourite Areas", "readonly-areas", preferences.areas, "")}
      ${preferenceList("Favourite Activities", "readonly-activities", preferences.activities, "")}
      ${preferenceList("Favourite Places", "readonly-places", preferences.places, "")}
    </section>
  `;
}

function renderProfilePage() {
  const content = pageContent[state.activePage];
  if (!content) return;

  pageEyebrow.textContent = content.eyebrow;
  pageTitle.textContent = content.title;

  if (state.activePage === "personal") {
    renderPersonalInformation().catch((error) => showError(error.message));
    return;
  }

  if (state.activePage === "friends") {
    renderFriendsPage().catch((error) => showError(error.message));
    return;
  }

  if (state.activePage === "groups") {
    renderGroupsPage().catch((error) => showError(error.message));
    return;
  }

  if (state.activePage === "inbox") {
    renderInboxPage().catch((error) => showError(error.message));
    return;
  }

  if (state.activePage === "past") {
    renderPastPage().catch((error) => showError(error.message));
    return;
  }

  if (state.activePage.startsWith("profile:")) {
    renderAccountProfile(state.activePage.slice("profile:".length)).catch((error) => showError(error.message));
    return;
  }

  pageDemo.innerHTML = content.cards
    .map(([title, text]) => `
      <article class="demo-card">
        <h3>${title}</h3>
        <p>${text}</p>
      </article>
    `)
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
    setVisible(loginForm, state.loginOpen);
    setVisible(topbar, false);
    setVisible(pagePanel, false);
    hideAppPanels();
    return;
  }

  setVisible(loginPanel, false);
  setVisible(topbar, true);
  if (state.account?.profile?.picture) {
    profileInitial.style.backgroundImage = `url("${state.account.profile.picture}")`;
    profileInitial.textContent = "";
  } else {
    profileInitial.style.backgroundImage = "";
    profileInitial.textContent = initials(currentUsername()) || "P";
  }
  setVisible(resetButton, Boolean(state.group && state.user));

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
  const username = currentUsername() || "Friend";
  const data = await api("/api/groups", {
    method: "POST",
    body: {
      username,
      profile: state.account?.profile,
      groupName: groupInput.value.trim()
    }
  });

  saveSession(data.user, data.group);
}

async function joinGroup() {
  const username = currentUsername() || "Friend";
  const code = codeInput.value.trim();

  if (!/^\d{8}$/.test(code)) {
    showError("Enter an 8-digit group code.");
    return;
  }

  const data = await api(`/api/groups/${code}/join`, {
    method: "POST",
    body: {
      username,
      profile: state.account?.profile
    }
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

async function goBackChoice() {
  if (!state.group || !state.user) return;
  const step = consensus("area") && !consensus("type") ? "area" : "type";
  const data = await api(`/api/groups/${state.group.code}/back`, {
    method: "POST",
    body: {
      userId: state.user.id,
      step
    }
  });

  state.index = 0;
  state.group = data.group;
  renderApp();
}

async function vote(value) {
  const place = state.group.places[state.index];
  if (!place) return;

  activityCard.classList.add(value === "yes" ? "swipe-yes" : "swipe-no");
  const data = await api(`/api/groups/${state.group.code}/vote`, {
    method: "POST",
    body: {
      userId: state.user.id,
      placeId: place.id,
      vote: value
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
  if (state.supabaseClient) {
    state.supabaseClient.auth.signOut().catch((error) => console.warn(error.message));
  }
  state.supabaseSession = null;
  leaveGroup();
  state.activePage = "";
  state.loginOpen = false;
  localStorage.removeItem("planswipe:login");
  localStorage.removeItem("planswipe:email");
  localStorage.removeItem("planswipe:account");
  state.account = null;
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

async function saveProfile() {
  const bio = document.querySelector("#profileBio")?.value || "";
  const ageValue = document.querySelector("#profileAge")?.value || "";
  const age = ageValue ? Number(ageValue) : "";
  const profile = {
    ...(state.account?.profile || {}),
    bio,
    age,
    preferences: state.account?.profile?.preferences || { areas: [], activities: [], places: [] }
  };

  const data = await api("/api/account", {
    method: "PATCH",
    body: {
      username: currentUsername(),
      profile
    }
  });

  saveAccount(data.user);
  await renderPersonalInformation();
}

async function addPreference(key) {
  const input = document.querySelector(`[data-pref-input="${key}"]`);
  const value = input?.value.trim();
  if (!value || !["areas", "activities", "places"].includes(key)) return;

  const profile = state.account?.profile || {};
  const preferences = {
    areas: [...(profile.preferences?.areas || [])],
    activities: [...(profile.preferences?.activities || [])],
    places: [...(profile.preferences?.places || [])]
  };

  if (!preferences[key].some((item) => item.toLowerCase() === value.toLowerCase())) {
    preferences[key].push(value);
  }

  const data = await api("/api/account", {
    method: "PATCH",
    body: {
      username: currentUsername(),
      profile: { ...profile, preferences }
    }
  });

  saveAccount(data.user);
  await renderPersonalInformation();
}

async function updateProfilePicture(file) {
  if (!file) return;
  const reader = new FileReader();
  const picture = await new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const profile = {
    ...(state.account?.profile || {}),
    picture,
    preferences: state.account?.profile?.preferences || { areas: [], activities: [], places: [] }
  };

  const data = await api("/api/account", {
    method: "PATCH",
    body: {
      username: currentUsername(),
      profile
    }
  });

  saveAccount(data.user);
  await renderPersonalInformation();
}

async function requestFriend(username) {
  await api("/api/friends/request", {
    method: "POST",
    body: {
      fromUsername: currentUsername(),
      toUsername: username
    }
  });
  if (state.activePage === "friends") await refreshFriendsPage();
  else await renderAccountProfile(username);
}

async function acceptFriend(username) {
  await api("/api/friends/accept", {
    method: "POST",
    body: {
      username: currentUsername(),
      requester: username
    }
  });
  if (state.activePage === "friends") await refreshFriendsPage();
  else if (state.activePage === "inbox") await renderInboxPage();
}

async function searchFriends() {
  const input = document.querySelector("#friendSearchInput");
  const results = document.querySelector("#friendSearchResults");
  const query = input?.value.trim() || "";
  if (!results || !query) return;

  const data = await api(`/api/users/search?username=${encodeURIComponent(currentUsername())}&q=${encodeURIComponent(query)}`);
  results.innerHTML = data.users.length
    ? data.users.map((user) => {
      if (user.friendStatus === "friends") {
        return userCard(user, `<button class="secondary-button" type="button" data-view-profile="${escapeHtml(user.username)}">View Profile</button>`);
      }
      if (user.friendStatus === "incoming") {
        return userCard(user, `<button class="primary-button" type="button" data-accept-friend="${escapeHtml(user.username)}">Accept Request</button>`);
      }
      if (user.friendStatus === "requested") {
        return userCard(user, `<span class="request-status">Request sent</span>`);
      }
      return userCard(user, `<button class="primary-button" type="button" data-add-friend="${escapeHtml(user.username)}">Add Friend</button>`);
    }).join("")
    : `<article class="demo-card"><h3>No users found</h3><p>Try another username.</p></article>`;
}

function selectedOptionLabel(kind, optionId) {
  return optionsFor(kind).find((option) => option.id === optionId)?.label || optionId || "";
}

async function getAiSuggestions() {
  if (!state.group) return;
  const areaId = consensus("area") || selected("area");
  const typeId = consensus("type") || selected("type");
  if (!areaId || !typeId) {
    showError("Choose an area and activity first.");
    return;
  }

  setVisible(suggestionPanel, true);
  suggestionPanel.innerHTML = `<p>${t("suggestedPlaces")}...</p>`;

  const data = await api("/api/suggestions", {
    method: "POST",
    body: {
      username: currentUsername(),
      area: selectedOptionLabel("area", areaId),
      activity: selectedOptionLabel("type", typeId)
    }
  });

  suggestionPanel.innerHTML = `
    <h3>${t("suggestedPlaces")}</h3>
    <div class="suggestion-list">
      ${(data.suggestions || []).map((item) => `
        <article class="suggestion-card">
          <h4>${escapeHtml(item.place || item.name || "Suggestion")}</h4>
          <p>${escapeHtml(item.reason || item.description || "")}</p>
        </article>
      `).join("")}
    </div>
  `;
}

function goToHome() {
  state.activePage = "";
  leaveGroup();
}

async function boot() {
  applyLanguage();
  await configureSupabaseAuth();

  // Handle email verification redirect from Supabase (URL hash with access_token)
  if (state.supabaseClient && window.location.hash) {
    const hash = window.location.hash;
    if (hash.includes("access_token") || hash.includes("type=signup") || hash.includes("type=recovery")) {
      try {
        const { data, error } = await state.supabaseClient.auth.getSession();
        if (error) throw error;
        state.supabaseSession = data.session;
        if (data.session) {
          const username = data.session.user?.user_metadata?.username || "";
          const email = data.session.user?.email || "";
          if (username && email) {
            const user = await syncSupabaseProfile(username, email);
            setLoggedIn(user.username, user.email || email);
            saveAccount(user);
          }
        }
        // Clean the URL hash
        window.location.hash = "";
        history.replaceState(null, "", window.location.pathname);
      } catch (error) {
        console.warn("Email verification handler:", error.message);
      }
    }
  }

  const options = await api("/api/options");
  state.areas = options.areas;
  state.types = options.types;

  if (isLoggedIn()) {
    await loadAccount().catch(() => null);
  }

  if (isLoggedIn() && state.user && state.groupCode) {
    startPolling();
    await refreshGroup();
    return;
  }

  renderApp();
}

function openLogin() {
  state.loginOpen = true;
  renderApp();
  loginUsername.focus();
}

showCreateButton.addEventListener("click", () => {
  state.setupMode = "create";
  renderApp();
});

showJoinButton.addEventListener("click", () => {
  state.setupMode = "join";
  renderApp();
});

openLoginButton.addEventListener("click", openLogin);
heroLoginButton.addEventListener("click", openLogin);

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

[loginUsername, loginEmail, loginPassword].forEach((input) => {
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") login().catch((error) => showError(error.message));
  });
});

homeButton.addEventListener("click", goToHome);
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

pageDemo.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-friend]");
  if (addButton) {
    requestFriend(addButton.dataset.addFriend).catch((error) => showError(error.message));
    return;
  }

  const acceptButton = event.target.closest("[data-accept-friend]");
  if (acceptButton) {
    acceptFriend(acceptButton.dataset.acceptFriend).catch((error) => showError(error.message));
    return;
  }

  const viewButton = event.target.closest("[data-view-profile]");
  if (viewButton) {
    state.activePage = `profile:${viewButton.dataset.viewProfile}`;
    renderApp();
    return;
  }

  const openGroupButton = event.target.closest("[data-open-group]");
  if (openGroupButton) {
    codeInput.value = openGroupButton.dataset.openGroup;
    state.activePage = "";
    joinGroup().catch((error) => showError(error.message));
    return;
  }

  const saveButton = event.target.closest("#saveProfileButton");
  if (saveButton) {
    saveProfile().catch((error) => showError(error.message));
    return;
  }

  const prefButton = event.target.closest("[data-pref-add]");
  if (prefButton) {
    addPreference(prefButton.dataset.prefAdd).catch((error) => showError(error.message));
    return;
  }

  const searchButton = event.target.closest("#friendSearchButton");
  if (searchButton) {
    searchFriends().catch((error) => showError(error.message));
    return;
  }

  const showPastFormButton = event.target.closest("#showPastActivityForm");
  if (showPastFormButton) {
    document.querySelector("#pastActivityForm")?.classList.toggle("is-hidden");
    return;
  }

  const savePastButton = event.target.closest("#savePastActivityButton");
  if (savePastButton) {
    savePastActivity().catch((error) => showError(error.message));
  }
});

pageDemo.addEventListener("change", (event) => {
  if (event.target.id === "profilePictureInput") {
    updateProfilePicture(event.target.files?.[0]).catch((error) => showError(error.message));
  }
});

pageDemo.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && event.target.id === "friendSearchInput") {
    event.preventDefault();
    searchFriends().catch((error) => showError(error.message));
  }
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".profile-wrap")) {
    profileMenu.classList.add("is-hidden");
  }
});

memberRow.addEventListener("click", (event) => {
  const button = event.target.closest("[data-username]");
  if (!button) return;
  state.activePage = `profile:${button.dataset.username}`;
  renderApp();
});

noButton.addEventListener("click", () =>
  vote("no").catch((error) => showError(error.message))
);

maybeButton.addEventListener("click", () =>
  vote("maybe").catch((error) => showError(error.message))
);

yesButton.addEventListener("click", () =>
  vote("yes").catch((error) => showError(error.message))
);

backChoiceButton.addEventListener("click", () =>
  goBackChoice().catch((error) => showError(error.message))
);

reviewButton.addEventListener("click", () => {
  goBackChoice().catch((error) => showError(error.message));
});

suggestionButton.addEventListener("click", () =>
  getAiSuggestions().catch((error) => showError(error.message))
);

[languageButton, appLanguageButton].forEach((button) => {
  button.addEventListener("click", toggleLanguage);
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

groupInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") createGroup().catch((error) => showError(error.message));
});

codeInput.addEventListener("input", () => {
  codeInput.value = codeInput.value.replace(/\D/g, "").slice(0, 8);
});

codeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") joinGroup().catch((error) => showError(error.message));
});

boot().catch((error) => showError(error.message));

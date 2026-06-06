let currentUser = null;

const state = {
  user: JSON.parse(localStorage.getItem("planswipe:user") || "null"),
  groupCode: localStorage.getItem("planswipe:groupCode") || "",
  group: null,
  areas: [],
  types: [],
  index: 0,
  pollTimer: null
};

// -------------------- ELEMENTS --------------------
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

// -------------------- API --------------------
async function api(path, options = {}) {
  const response = await fetch(path, {
    method: options.method || "GET",
    headers: { "Content-Type": "application/json" },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

// -------------------- LOGIN --------------------
async function login(name) {
  return api("/api/login", {
    method: "POST",
    body: { name }
  });
}

async function loadUser() {
  const res = await api("/api/me");
  currentUser = res.user;
  return currentUser;
}

async function handleLogin() {
  const name = nameInput.value.trim();
  if (!name) return;

  const user = await login(name);
  currentUser = user;

  document.querySelector("#loginBox").style.display = "none";

  console.log("Logged in:", user);
}

async function init() {
  await loadUser();

  if (currentUser) {
    document.querySelector("#loginBox").style.display = "none";
  }
}

// -------------------- HELPERS --------------------
function setVisible(el, v) {
  el.classList.toggle("is-hidden", !v);
}

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() || "")
    .join("");
}

// -------------------- CORE APP LOGIC --------------------
// (KEEP YOUR EXISTING FUNCTIONS BELOW THIS POINT)

// IMPORTANT: everything else in your file stays the same
// BUT REMOVE duplicate login/api/init code inside api()

// -------------------- BOOT --------------------
init();

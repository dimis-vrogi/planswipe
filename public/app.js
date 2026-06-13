const state = {
  user: JSON.parse(localStorage.getItem("planswipe:user") || "null"),
  groupCode: localStorage.getItem("planswipe:groupCode") || "",
  group: null,
  areas: [],
  types: [],
  index: 0,
  pollTimer: null,
  notifTimer: null,
  setupMode: "",
  activePage: "",
  loginOpen: false,
  account: JSON.parse(localStorage.getItem("planswipe:account") || "null"),
  language: localStorage.getItem("planswipe:language") || "en",
  supabaseClient: null,
  supabaseSession: null,
  showHero: false,
  notifications: { total: 0, friendRequests: 0, groupInvites: 0, messages: 0 },
  exitedGroups: JSON.parse(localStorage.getItem("planswipe:exitedGroups") || "[]"),
  aiPlacesBatch: [],
  aiBatchIndex: 0,
  friendsDataLoaded: false,
  friendsData: null
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
const heroLoginButton = document.querySelector("#heroLoginButton");
const heroEnterButton = document.querySelector("#heroEnterButton");
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
const notificationBadge = document.querySelector("#notificationBadge");
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
  likedplaces: { title: "Liked Places", eyebrow: "History", dynamic: true },
  groups: { title: "My Groups", eyebrow: "Groups", dynamic: true },
  friends: { title: "Friends", eyebrow: "People", dynamic: true },
  past: { title: "Past Activities", eyebrow: "History", dynamic: true },
  personal: { title: "Personal Information", eyebrow: "Profile", dynamic: true },
  settings: { title: "Settings", eyebrow: "Account", dynamic: true }
};

const optionTranslations = {
  el: {
    athens_center: { label: "\u039a\u03ad\u03bd\u03c4\u03c1\u03bf \u0391\u03b8\u03b7\u03bd\u03ce\u03bd", description: "\u03a3\u03cd\u03bd\u03c4\u03b1\u03b3\u03bc\u03b1, \u039c\u03bf\u03bd\u03b1\u03c3\u03c4\u03b7\u03c1\u03ac\u03ba\u03b9, \u03a8\u03c5\u03c1\u03c1\u03ae \u03ba\u03b1\u03b9 \u03ba\u03b5\u03bd\u03c4\u03c1\u03b9\u03ba\u03ad\u03c2 \u03c0\u03b5\u03c1\u03b9\u03bf\u03c7\u03ad\u03c2." },
    athens_seaside: { label: "\u03a0\u03b1\u03c1\u03b1\u03bb\u03af\u03b1 \u0391\u03b8\u03b7\u03bd\u03ce\u03bd", description: "\u03a6\u03bb\u03bf\u03af\u03c3\u03b2\u03bf\u03c2, \u0393\u03bb\u03c5\u03c6\u03ac\u03b4\u03b1, \u0386\u03bb\u03b9\u03bc\u03bf\u03c2 \u03ba\u03b1\u03b9 \u03b7 \u03c0\u03b1\u03c1\u03b1\u03bb\u03b9\u03b1\u03ba\u03ae \u03c0\u03bb\u03b5\u03c5\u03c1\u03ac." },
    athens_north: { label: "\u0392\u03cc\u03c1\u03b5\u03b9\u03b1 \u03c0\u03c1\u03bf\u03ac\u03c3\u03c4\u03b9\u03b1", description: "\u03a7\u03b1\u03bb\u03ac\u03bd\u03b4\u03c1\u03b9, \u039c\u03b1\u03c1\u03bf\u03cd\u03c3\u03b9, \u039a\u03b7\u03c6\u03b9\u03c3\u03b9\u03ac \u03ba\u03b1\u03b9 \u03b3\u03b5\u03b9\u03c4\u03bf\u03bd\u03b9\u03ba\u03ad\u03c2 \u03c0\u03b5\u03c1\u03b9\u03bf\u03c7\u03ad\u03c2." },
    restaurant: { label: "\u0395\u03c3\u03c4\u03b9\u03b1\u03c4\u03cc\u03c1\u03b9\u03b1", description: "\u0392\u03b3\u03b1\u03af\u03bd\u03bf\u03c5\u03bc\u03b5 \u03b3\u03b9\u03b1 \u03c6\u03b1\u03b3\u03b7\u03c4\u03cc, \u03c0\u03b9\u03c4\u03c3\u03b1\u03c1\u03af\u03b1 \u03ae \u03b5\u03c0\u03b9\u03bb\u03bf\u03b3\u03ad\u03c2 \u03c0\u03bf\u03c5 \u03be\u03b5\u03ba\u03b9\u03bd\u03bf\u03cd\u03bd \u03bc\u03b5 \u03c6\u03b1\u03b3\u03b7\u03c4\u03cc." },
    game: { label: "\u03a0\u03b1\u03b9\u03c7\u03bd\u03af\u03b4\u03b9\u03b1", description: "\u039c\u03c0\u03bf\u03c9\u03bb\u03b9\u03bd\u03b3\u03ba, escape rooms, arcades \u03ba\u03b1\u03b9 \u03b4\u03b9\u03b1\u03c3\u03ba\u03b5\u03b4\u03b1\u03c3\u03c4\u03b9\u03ba\u03ad\u03c2 \u03b4\u03c1\u03b1\u03c3\u03c4\u03b7\u03c1\u03b9\u03cc\u03c4\u03b7\u03c4\u03b5\u03c2." },
    walking: { label: "\u03a0\u03b5\u03c1\u03af\u03c0\u03b1\u03c4\u03bf\u03c2", description: "\u03a0\u03ac\u03c1\u03ba\u03b1, \u03c0\u03b1\u03c1\u03b1\u03bb\u03b9\u03b1\u03ba\u03ad\u03c2 \u03b4\u03b9\u03b1\u03b4\u03c1\u03bf\u03bc\u03ad\u03c2, \u03b8\u03ad\u03b1 \u03ba\u03b1\u03b9 \u03b5\u03cd\u03ba\u03bf\u03bb\u03b5\u03c2 \u03b5\u03be\u03c9\u03c4\u03b5\u03c1\u03b9\u03ba\u03ad\u03c2 \u03b4\u03b9\u03b1\u03b4\u03c1\u03bf\u03bc\u03ad\u03c2." },
    addArea: "\u03a0\u03c1\u03bf\u03c3\u03b8\u03ae\u03ba\u03b7 \u03c0\u03b5\u03c1\u03b9\u03bf\u03c7\u03ae\u03c2",
    addActivity: "\u03a0\u03c1\u03bf\u03c3\u03b8\u03ae\u03ba\u03b7 \u03b4\u03c1\u03b1\u03c3\u03c4\u03b7\u03c1\u03b9\u03cc\u03c4\u03b7\u03c4\u03b1\u03c2",
    addAreaText: "\u03a0\u03c1\u03cc\u03c4\u03b5\u03b9\u03bd\u03b5 \u03ac\u03bb\u03bb\u03b7 \u03b3\u03b5\u03b9\u03c4\u03bf\u03bd\u03b9\u03ac \u03ae \u03bc\u03ad\u03c1\u03bf\u03c2.",
    addActivityText: "\u03a0\u03c1\u03cc\u03c4\u03b5\u03b9\u03bd\u03b5 \u03ac\u03bb\u03bb\u03bf \u03b5\u03af\u03b4\u03bf\u03c5\u03c2 \u03b4\u03c1\u03b1\u03c3\u03c4\u03b7\u03c1\u03b9\u03cc\u03c4\u03b7\u03c4\u03b1\u03c2.",
    addOwn: "\u03a0\u03c1\u03cc\u03c3\u03b8\u03b5\u03c3\u03b5 \u03b4\u03b9\u03ba\u03cc \u03c3\u03bf\u03c5",
    liveChoices: "\u0396\u03c9\u03bd\u03c4\u03b1\u03bd\u03ad\u03c2 \u03b5\u03c0\u03b9\u03bb\u03bf\u03b3\u03ad\u03c2"
  }
};

function translateOption(kind, optionId) {
  if (state.language !== "el") return null;
  const el = optionTranslations.el;
  if (el[optionId]) return el[optionId];
  return null;
}

function t(key) {
  return copy[state.language]?.[key] || copy.en[key] || key;
}

const copy = {
  en: {
    login: "Login",
    createAccount: "Create Account",
    enterPlanswipe: "Enter PlanSwipe",
    groupPlans: "Group plans",
    leaveGroup: "Exit Group",
    exitGroup: "Exit Group",
    home: "Home",
    likedPlaces: "Liked Places",
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
    whatPlanswipeIs: "What PlanSwipe is",
    sharedDecisionTool: "A shared decision tool for real plans",
    offerText: "Instead of long group chats, everyone chooses the basics, swipes through options, and sees which activities have the strongest support.",
    agreeFaster: "Agree faster",
    agreeFasterText: "Pick an area and activity type together before looking at suggestions.",
    discoverOptions: "Discover options",
    discoverOptionsText: "Use sample ideas or Google Places results when the API key is configured.",
    voteAsGroup: "Vote as a group",
    voteAsGroupText: "Mark activities as No, Maybe, or Yes and compare support instantly.",
    dinnerNearSea: "Dinner near the sea",
    glyfadaTaverna: "Glyfada seafood taverna",
    seeWhatFriendsThink: "See what your friends think about this.",
    findSimilar: "Find similar places",
    startPlanning: "Start planning with your group",
    startPlanningText: "Choose whether you are creating a new group or joining one that already exists.",
    createGroup: "Create Group",
    createGroupText: "Pick a group name and get a new 8-digit code.",
    joinGroup: "Join Group",
    joinGroupText: "Enter the 8-digit code from a friend.",
    groupName: "Group name",
    groupCodeLabel: "8-digit group code",
    back: "Back",
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
    suggestedPlaces: "Suggested places",
    noLikedPlaces: "No liked places yet",
    notifications: "Notifications",
    friendRequestNotif: "Friend request alerts",
    groupInviteNotif: "Group invite alerts",
    privacy: "Privacy",
    showOnlineStatus: "Show online status",
    showProfilePublicly: "Show profile publicly",
    saveSettings: "Save Settings",
    settingsSaved: "Settings saved",
    deleteAccount: "Delete Account",
    deleteAccountConfirm: "Are you sure you want to permanently delete your account? This cannot be undone.",
    deleteAccountSuccess: "Account deleted successfully.",
    removeFriend: "Remove Friend",
    removeFriendConfirm: "Remove this friend?",
    activeGroups: "Active Groups",
    pastGroups: "Past Groups",
    noActiveGroups: "No active groups",
    noPastGroups: "No past groups",
    you: "you",
    friends_: "Friends",
    requestSent: "Request sent",
    noPending: "No pending requests",
    inboxClear: "No notifications",
    noPastActivities: "No past activities yet",
    continueBrowsing: "Would you like to continue browsing places?",
    noMoreSuggestions: "No more suggestions available",
    aiGenerating: "Getting AI suggestions...",
    exitGroupPermanent: "Exit Group Permanently",
    confirmExitGroup: "Are you sure you want to permanently leave this group?",
    accountManagement: "Account Management",
    choiceNo: "No",
    choiceMaybe: "Maybe",
    choiceYes: "Yes",
    searchFrom: "Search from",
    searchGooglePlaces: "Google Places",
    searchSample: "sample data",
    searchCustom: "custom group idea",
    areaSelected: "Area selected. Waiting for everyone to agree on an activity.",
    fridayCrew: "Friday crew"
  },
  el: {
    login: "\u03a3\u03cd\u03bd\u03b4\u03b5\u03c3\u03b7",
    createAccount: "\u0394\u03b7\u03bc\u03b9\u03bf\u03c5\u03c1\u03b3\u03af\u03b1 \u03bb\u03bf\u03b3\u03b1\u03c1\u03b9\u03b1\u03c3\u03bc\u03bf\u03cd",
    enterPlanswipe: "\u0395\u03af\u03c3\u03bf\u03b4\u03bf\u03c2 \u03c3\u03c4\u03bf PlanSwipe",
    groupPlans: "\u039f\u03bc\u03b1\u03b4\u03b9\u03ba\u03ac \u03c3\u03c7\u03ad\u03b4\u03b9\u03b1",
    leaveGroup: "\u0388\u03be\u03bf\u03b4\u03bf\u03c2 \u03b1\u03c0\u03cc \u03bf\u03bc\u03ac\u03b4\u03b1",
    exitGroup: "\u0388\u03be\u03bf\u03b4\u03bf\u03c2",
    home: "\u0391\u03c1\u03c7\u03b9\u03ba\u03ae",
    likedPlaces: "\u0391\u03c1\u03b5\u03c3\u03c4\u03ac \u03bc\u03ad\u03c1\u03b7",
    groups: "\u039f\u03b9 \u03bf\u03bc\u03ac\u03b4\u03b5\u03c2 \u03bc\u03bf\u03c5",
    friends: "\u03a6\u03af\u03bb\u03bf\u03b9",
    past: "\u03a0\u03b1\u03bb\u03b9\u03ad\u03c2 \u03b4\u03c1\u03b1\u03c3\u03c4\u03b7\u03c1\u03b9\u03cc\u03c4\u03b7\u03c4\u03b5\u03c2",
    personal: "\u03a0\u03c1\u03bf\u03c3\u03c9\u03c0\u03b9\u03ba\u03ac \u03c3\u03c4\u03bf\u03b9\u03c7\u03b5\u03af\u03b1",
    settings: "\u03a1\u03c5\u03b8\u03bc\u03af\u03c3\u03b5\u03b9\u03c2",
    logout: "\u0391\u03c0\u03bf\u03c3\u03cd\u03bd\u03b4\u03b5\u03c3\u03b7",
    heroEyebrow: "\u039f\u03bc\u03b1\u03b4\u03b9\u03ba\u03ac \u03c3\u03c7\u03ad\u03b4\u03b9\u03b1 \u03c0\u03b9\u03bf \u03b5\u03cd\u03ba\u03bf\u03bb\u03b1",
    heroTitle: "\u0392\u03c1\u03b5\u03af\u03c4\u03b5 \u03c4\u03bf \u03c3\u03c7\u03ad\u03b4\u03b9\u03bf \u03c0\u03bf\u03c5 \u03b7 \u03c0\u03b1\u03c1\u03ad\u03b1 \u03c3\u03b1\u03c2 \u03bc\u03c0\u03bf\u03c1\u03b5\u03af \u03bd\u03b1 \u03c3\u03c5\u03bc\u03c6\u03c9\u03bd\u03ae\u03c3\u03b5\u03b9.",
    heroDescription: "\u0395\u03c0\u03b9\u03bb\u03ad\u03be\u03c4\u03b5 \u03c4\u03b1 \u03b2\u03b1\u03c3\u03b9\u03ba\u03ac \u03bc\u03b1\u03b6\u03af, \u03ba\u03ac\u03bd\u03c4\u03b5 swipe \u03c3\u03b5 \u03ba\u03bf\u03bd\u03c4\u03b9\u03bd\u03ad\u03c2 \u03b9\u03b4\u03ad\u03b5\u03c2 \u03ba\u03b1\u03b9 \u03b1\u03c6\u03ae\u03c3\u03c4\u03b5 \u03c4\u03bf PlanSwipe \u03bd\u03b1 \u03b1\u03bd\u03b1\u03b4\u03b5\u03af\u03be\u03b5\u03b9 \u03c4\u03b1 \u03bc\u03ad\u03c1\u03b7 \u03c0\u03bf\u03c5 \u03b8\u03b1 \u03b1\u03c0\u03bf\u03bb\u03b1\u03cd\u03c3\u03b5\u03b9 \u03b7 \u03c0\u03b1\u03c1\u03ad\u03b1.",
    heroNote: "\u0393\u03b9\u03b1 \u03bf\u03bc\u03b1\u03b4\u03b9\u03ba\u03ad\u03c2 \u03c3\u03c5\u03bd\u03bf\u03bc\u03b9\u03bb\u03af\u03b5\u03c2 \u03c0\u03bf\u03c5 \u03c0\u03bf\u03c4\u03ad \u03b4\u03b5\u03bd \u03b1\u03c0\u03bf\u03c6\u03b1\u03c3\u03af\u03b6\u03bf\u03c5\u03bd.",
    whatPlanswipeIs: "\u03a4\u03b9 \u03b5\u03af\u03bd\u03b1\u03b9 \u03c4\u03bf PlanSwipe",
    sharedDecisionTool: "\u0388\u03bd\u03b1 \u03b5\u03c1\u03b3\u03b1\u03bb\u03b5\u03af\u03bf \u03ba\u03bf\u03b9\u03bd\u03ce\u03bd \u03b1\u03c0\u03bf\u03c6\u03ac\u03c3\u03b5\u03c9\u03bd",
    offerText: "\u0391\u03bd\u03c4\u03af \u03b3\u03b9\u03b1 \u03b1\u03c4\u03b5\u03bb\u03b5\u03af\u03c9\u03c4\u03b5\u03c2 \u03bf\u03bc\u03b1\u03b4\u03b9\u03ba\u03ad\u03c2 \u03c3\u03c5\u03b6\u03b7\u03c4\u03ae\u03c3\u03b5\u03b9\u03c2, \u03cc\u03bb\u03bf\u03b9 \u03b5\u03c0\u03b9\u03bb\u03ad\u03b3\u03bf\u03c5\u03bd \u03c4\u03b1 \u03b2\u03b1\u03c3\u03b9\u03ba\u03ac, \u03ba\u03ac\u03bd\u03bf\u03c5\u03bd swipe \u03c3\u03b5 \u03b5\u03c0\u03b9\u03bb\u03bf\u03b3\u03ad\u03c2 \u03ba\u03b1\u03b9 \u03b2\u03bb\u03ad\u03c0\u03bf\u03c5\u03bd \u03c0\u03bf\u03b9\u03b5\u03c2 \u03b4\u03c1\u03b1\u03c3\u03c4\u03b7\u03c1\u03b9\u03cc\u03c4\u03b7\u03c4\u03b5\u03c2 \u03ad\u03c7\u03bf\u03c5\u03bd \u03c4\u03b7 \u03bc\u03b5\u03b3\u03b1\u03bb\u03cd\u03c4\u03b5\u03c1\u03b7 \u03c5\u03c0\u03bf\u03c3\u03c4\u03ae\u03c1\u03b9\u03be\u03b7.",
    agreeFaster: "\u03a3\u03c5\u03bc\u03c6\u03c9\u03bd\u03ae\u03c3\u03c4\u03b5 \u03c0\u03b9\u03bf \u03b3\u03c1\u03ae\u03b3\u03bf\u03c1\u03b1",
    agreeFasterText: "\u0395\u03c0\u03b9\u03bb\u03ad\u03be\u03c4\u03b5 \u03c0\u03b5\u03c1\u03b9\u03bf\u03c7\u03ae \u03ba\u03b1\u03b9 \u03b5\u03af\u03b4\u03bf\u03c2 \u03bc\u03b1\u03b6\u03af \u03c0\u03c1\u03b9\u03bd \u03b4\u03b5\u03af\u03c4\u03b5 \u03c0\u03c1\u03bf\u03c4\u03ac\u03c3\u03b5\u03b9\u03c2.",
    discoverOptions: "\u0391\u03bd\u03b1\u03ba\u03b1\u03bb\u03cd\u03c8\u03c4\u03b5 \u03b5\u03c0\u03b9\u03bb\u03bf\u03b3\u03ad\u03c2",
    discoverOptionsText: "\u03a7\u03c1\u03b7\u03c3\u03b9\u03bc\u03bf\u03c0\u03bf\u03b9\u03ae\u03c3\u03c4\u03b5 \u03b4\u03b5\u03af\u03b3\u03bc\u03b1\u03c4\u03b1 \u03ae \u03b1\u03c0\u03bf\u03c4\u03b5\u03bb\u03ad\u03c3\u03bc\u03b1\u03c4\u03b1 Google Places \u03cc\u03c4\u03b1\u03bd \u03c1\u03c5\u03b8\u03bc\u03b9\u03c3\u03c4\u03b5\u03af \u03c4\u03bf API key.",
    voteAsGroup: "\u03a8\u03b7\u03c6\u03af\u03c3\u03c4\u03b5 \u03c9\u03c2 \u03bf\u03bc\u03ac\u03b4\u03b1",
    voteAsGroupText: "\u03a3\u03b7\u03bc\u03b5\u03b9\u03ce\u03c3\u03c4\u03b5 \u03b4\u03c1\u03b1\u03c3\u03c4\u03b7\u03c1\u03b9\u03cc\u03c4\u03b7\u03c4\u03b5\u03c2 \u03c9\u03c2 \u038c\u03c7\u03b9, \u038a\u03c3\u03c9\u03c2 \u03ae \u039d\u03b1\u03b9 \u03ba\u03b1\u03b9 \u03c3\u03c5\u03b3\u03ba\u03c1\u03af\u03bd\u03b5\u03c4\u03b5 \u03ac\u03bc\u03b5\u03c3\u03b1.",
    dinnerNearSea: "\u0392\u03c1\u03b1\u03b4\u03b9\u03bd\u03cc \u03b4\u03af\u03c0\u03bb\u03b1 \u03c3\u03c4\u03b7 \u03b8\u03ac\u03bb\u03b1\u03c3\u03c3\u03b1",
    glyfadaTaverna: "\u03a8\u03b1\u03c1\u03bf\u03c4\u03b1\u03b2\u03ad\u03c1\u03bd\u03b1 \u0393\u03bb\u03c5\u03c6\u03ac\u03b4\u03b1\u03c2",
    seeWhatFriendsThink: "\u0394\u03b5\u03af\u03c4\u03b5 \u03c4\u03b9 \u03c0\u03b9\u03c3\u03c4\u03b5\u03cd\u03bf\u03c5\u03bd \u03bf\u03b9 \u03c6\u03af\u03bb\u03bf\u03b9 \u03c3\u03b1\u03c2.",
    findSimilar: "\u0392\u03c1\u03b5\u03af\u03c4\u03b5 \u03c0\u03b1\u03c1\u03cc\u03bc\u03bf\u03b9\u03b1 \u03bc\u03ad\u03c1\u03b7",
    startPlanning: "\u039e\u03b5\u03ba\u03b9\u03bd\u03ae\u03c3\u03c4\u03b5 \u03c4\u03bf\u03bd \u03c0\u03c1\u03bf\u03b3\u03c1\u03b1\u03bc\u03bc\u03b1\u03c4\u03b9\u03c3\u03bc\u03cc \u03bc\u03b5 \u03c4\u03b7\u03bd \u03bf\u03bc\u03ac\u03b4\u03b1 \u03c3\u03b1\u03c2",
    startPlanningText: "\u0394\u03b9\u03b1\u03bb\u03ad\u03be\u03c4\u03b5 \u03b1\u03bd \u03b8\u03ad\u03bb\u03b5\u03c4\u03b5 \u03bd\u03b1 \u03b4\u03b7\u03bc\u03b9\u03bf\u03c5\u03c1\u03b3\u03ae\u03c3\u03b5\u03c4\u03b5 \u03bc\u03b9\u03b1 \u03bd\u03ad\u03b1 \u03bf\u03bc\u03ac\u03b4\u03b1 \u03ae \u03bd\u03b1 \u03bc\u03c0\u03b5\u03af\u03c4\u03b5 \u03c3\u03b5 \u03bc\u03b9\u03b1 \u03c5\u03c0\u03ac\u03c1\u03c7\u03bf\u03c5\u03c3\u03b1.",
    createGroup: "\u0394\u03b7\u03bc\u03b9\u03bf\u03c5\u03c1\u03b3\u03af\u03b1 \u03bf\u03bc\u03ac\u03b4\u03b1\u03c2",
    createGroupText: "\u0395\u03c0\u03b9\u03bb\u03ad\u03be\u03c4\u03b5 \u03cc\u03bd\u03bf\u03bc\u03b1 \u03bf\u03bc\u03ac\u03b4\u03b1\u03c2 \u03ba\u03b1\u03b9 \u03bb\u03ac\u03b2\u03c4\u03b5 \u03ad\u03bd\u03b1\u03bd \u03bd\u03ad\u03bf 8\u03c8\u03ae\u03c6\u03b9\u03bf \u03ba\u03c9\u03b4\u03b9\u03ba\u03cc.",
    joinGroup: "\u03a3\u03c5\u03bc\u03bc\u03b5\u03c4\u03bf\u03c7\u03ae \u03c3\u03b5 \u03bf\u03bc\u03ac\u03b4\u03b1",
    joinGroupText: "\u0395\u03b9\u03c3\u03ac\u03b3\u03b5\u03c4\u03b5 \u03c4\u03bf\u03bd 8\u03c8\u03ae\u03c6\u03b9\u03bf \u03ba\u03c9\u03b4\u03b9\u03ba\u03cc \u03b1\u03c0\u03cc \u03ad\u03bd\u03b1\u03bd \u03c6\u03af\u03bb\u03bf.",
    groupName: "\u038c\u03bd\u03bf\u03bc\u03b1 \u03bf\u03bc\u03ac\u03b4\u03b1\u03c2",
    groupCodeLabel: "8\u03c8\u03ae\u03c6\u03b9\u03bf\u03c2 \u03ba\u03c9\u03b4\u03b9\u03ba\u03cc\u03c2 \u03bf\u03bc\u03ac\u03b4\u03b1\u03c2",
    back: "\u03a0\u03af\u03c3\u03c9",
    currentGroup: "\u03a4\u03c1\u03ad\u03c7\u03bf\u03c5\u03c3\u03b1 \u03bf\u03bc\u03ac\u03b4\u03b1",
    stepArea: "\u0392\u03ae\u03bc\u03b1 1 \u03b1\u03c0\u03cc 2",
    stepType: "\u0392\u03ae\u03bc\u03b1 2 \u03b1\u03c0\u03cc 2",
    areaTitle: "\u03a0\u03bf\u03cd \u03b8\u03ad\u03bb\u03b5\u03c4\u03b5 \u03bd\u03b1 \u03c0\u03ac\u03c4\u03b5;",
    typeTitle: "\u03a4\u03b9 \u03b5\u03af\u03b4\u03bf\u03c5\u03c2 \u03b4\u03c1\u03b1\u03c3\u03c4\u03b7\u03c1\u03b9\u03cc\u03c4\u03b7\u03c4\u03b1 \u03b8\u03ad\u03bb\u03b5\u03c4\u03b5;",
    decisionHint: "\u038c\u03bb\u03bf\u03b9 \u03c0\u03c1\u03ad\u03c0\u03b5\u03b9 \u03bd\u03b1 \u03c3\u03c5\u03bc\u03c6\u03c9\u03bd\u03ae\u03c3\u03bf\u03c5\u03bd \u03c0\u03c1\u03b9\u03bd \u03c0\u03c1\u03bf\u03c7\u03c9\u03c1\u03ae\u03c3\u03b5\u03b9 \u03b7 \u03bf\u03bc\u03ac\u03b4\u03b1.",
    addArea: "\u03a0\u03c1\u03bf\u03c3\u03b8\u03ae\u03ba\u03b7 \u03c0\u03b5\u03c1\u03b9\u03bf\u03c7\u03ae\u03c2",
    addActivity: "\u03a0\u03c1\u03bf\u03c3\u03b8\u03ae\u03ba\u03b7 \u03b4\u03c1\u03b1\u03c3\u03c4\u03b7\u03c1\u03b9\u03cc\u03c4\u03b7\u03c4\u03b1\u03c2",
    addAreaText: "\u03a0\u03c1\u03bf\u03c4\u03b5\u03af\u03bd\u03b5\u03c4\u03b5 \u03ac\u03bb\u03bb\u03b7 \u03b3\u03b5\u03b9\u03c4\u03bf\u03bd\u03b9\u03ac \u03ae \u03c0\u03b5\u03c1\u03b9\u03bf\u03c7\u03ae.",
    addActivityText: "\u03a0\u03c1\u03bf\u03c4\u03b5\u03af\u03bd\u03b5\u03c4\u03b5 \u03ac\u03bb\u03bb\u03bf \u03b5\u03af\u03b4\u03bf\u03c2 \u03b4\u03c1\u03b1\u03c3\u03c4\u03b7\u03c1\u03b9\u03cc\u03c4\u03b7\u03c4\u03b1\u03c2.",
    addOwn: "\u03a0\u03c1\u03bf\u03c3\u03b8\u03ad\u03c3\u03c4\u03b5 \u03b4\u03b9\u03ba\u03cc \u03c3\u03b1\u03c2",
    liveChoices: "\u0396\u03c9\u03bd\u03c4\u03b1\u03bd\u03ad\u03c2 \u03b5\u03c0\u03b9\u03bb\u03bf\u03b3\u03ad\u03c2",
    resultsTitle: "\u03a4\u03b9 \u03bc\u03c0\u03bf\u03c1\u03b5\u03af\u03c4\u03b5 \u03bd\u03b1 \u03ba\u03ac\u03bd\u03b5\u03c4\u03b5",
    aiSuggestions: "\u03a0\u03c1\u03bf\u03c4\u03ac\u03c3\u03b5\u03b9\u03c2 AI",
    changeBasics: "\u0391\u03bb\u03bb\u03b1\u03b3\u03ae \u03b2\u03b1\u03c3\u03b9\u03ba\u03ce\u03bd",
    noStrongChoice: "\u0394\u03b5\u03bd \u03c5\u03c0\u03ac\u03c1\u03c7\u03b5\u03b9 \u03b1\u03ba\u03cc\u03bc\u03b1 \u03b4\u03c5\u03bd\u03b1\u03c4\u03ae \u03b5\u03c0\u03b9\u03bb\u03bf\u03b3\u03ae",
    keepSwiping: "\u03a3\u03c5\u03bd\u03b5\u03c7\u03af\u03c3\u03c4\u03b5 \u03c4\u03bf swipe \u03ae \u03c0\u03b5\u03c1\u03b9\u03bc\u03ad\u03bd\u03b5\u03c4\u03b5 \u03c4\u03b7\u03bd \u03c5\u03c0\u03cc\u03bb\u03bf\u03b9\u03c0\u03b7 \u03bf\u03bc\u03ac\u03b4\u03b1.",
    noFriends: "\u0394\u03b5\u03bd \u03ad\u03c7\u03b5\u03c4\u03b5 \u03b1\u03ba\u03cc\u03bc\u03b1 \u03c6\u03af\u03bb\u03bf\u03c5\u03c2",
    searchByUsername: "\u0391\u03bd\u03b1\u03b6\u03ae\u03c4\u03b7\u03c3\u03b7 \u03bc\u03b5 \u03cc\u03bd\u03bf\u03bc\u03b1 \u03c7\u03c1\u03ae\u03c3\u03c4\u03b7",
    search: "\u0391\u03bd\u03b1\u03b6\u03ae\u03c4\u03b7\u03c3\u03b7",
    requests: "\u0391\u03b9\u03c4\u03ae\u03bc\u03b1\u03c4\u03b1",
    saveProfile: "\u0391\u03c0\u03bf\u03b8\u03ae\u03ba\u03b5\u03c5\u03c3\u03b7 \u03c0\u03c1\u03bf\u03c6\u03af\u03bb",
    age: "\u0397\u03bb\u03b9\u03ba\u03af\u03b1",
    bio: "\u0392\u03b9\u03bf\u03b3\u03c1\u03b1\u03c6\u03b9\u03ba\u03cc",
    preferences: "\u03a0\u03c1\u03bf\u03c4\u03b9\u03bc\u03ae\u03c3\u03b5\u03b9\u03c2",
    logPastActivity: "\u039a\u03b1\u03c4\u03b1\u03c7\u03ce\u03c1\u03b7\u03c3\u03b7 \u03b4\u03c1\u03b1\u03c3\u03c4\u03b7\u03c1\u03b9\u03cc\u03c4\u03b7\u03c4\u03b1\u03c2",
    area: "\u03a0\u03b5\u03c1\u03b9\u03bf\u03c7\u03ae",
    activity: "\u0394\u03c1\u03b1\u03c3\u03c4\u03b7\u03c1\u03b9\u03cc\u03c4\u03b7\u03c4\u03b1",
    place: "\u039c\u03ad\u03c1\u03bf\u03c2",
    saveActivity: "\u0391\u03c0\u03bf\u03b8\u03ae\u03ba\u03b5\u03c5\u03c3\u03b7 \u03b4\u03c1\u03b1\u03c3\u03c4\u03b7\u03c1\u03b9\u03cc\u03c4\u03b7\u03c4\u03b1\u03c2",
    suggestedPlaces: "\u03a0\u03c1\u03bf\u03c4\u03b5\u03b9\u03bd\u03cc\u03bc\u03b5\u03bd\u03b1 \u03bc\u03ad\u03c1\u03b7",
    noLikedPlaces: "\u0394\u03b5\u03bd \u03c5\u03c0\u03ac\u03c1\u03c7\u03bf\u03c5\u03bd \u03b1\u03ba\u03cc\u03bc\u03b1 \u03b1\u03c1\u03b5\u03c3\u03c4\u03ac \u03bc\u03ad\u03c1\u03b7",
    notifications: "\u0395\u03b9\u03b4\u03bf\u03c0\u03bf\u03b9\u03ae\u03c3\u03b5\u03b9\u03c2",
    friendRequestNotif: "\u0395\u03b9\u03b4\u03bf\u03c0\u03bf\u03b9\u03ae\u03c3\u03b5\u03b9\u03c2 \u03b1\u03b9\u03c4\u03b7\u03bc\u03ac\u03c4\u03c9\u03bd \u03c6\u03b9\u03bb\u03af\u03b1\u03c2",
    groupInviteNotif: "\u0395\u03b9\u03b4\u03bf\u03c0\u03bf\u03b9\u03ae\u03c3\u03b5\u03b9\u03c2 \u03c0\u03c1\u03bf\u03c3\u03ba\u03bb\u03ae\u03c3\u03b5\u03c9\u03bd",
    privacy: "\u0391\u03c0\u03cc\u03c1\u03c1\u03b7\u03c4\u03bf",
    showOnlineStatus: "\u0395\u03bc\u03c6\u03ac\u03bd\u03b9\u03c3\u03b7 online \u03ba\u03b1\u03c4\u03ac\u03c3\u03c4\u03b1\u03c3\u03b7\u03c2",
    showProfilePublicly: "\u0394\u03b7\u03bc\u03cc\u03c3\u03b9\u03bf \u03c0\u03c1\u03bf\u03c6\u03af\u03bb",
    saveSettings: "\u0391\u03c0\u03bf\u03b8\u03ae\u03ba\u03b5\u03c5\u03c3\u03b7 \u03c1\u03c5\u03b8\u03bc\u03af\u03c3\u03b5\u03c9\u03bd",
    settingsSaved: "\u039f\u03b9 \u03c1\u03c5\u03b8\u03bc\u03af\u03c3\u03b5\u03b9\u03c2 \u03b1\u03c0\u03bf\u03b8\u03b7\u03ba\u03b5\u03cd\u03c4\u03b7\u03ba\u03b1\u03bd",
    deleteAccount: "\u0394\u03b9\u03b1\u03b3\u03c1\u03b1\u03c6\u03ae \u039b\u03bf\u03b3\u03b1\u03c1\u03b9\u03b1\u03c3\u03bc\u03bf\u03cd",
    deleteAccountConfirm: "\u0395\u03af\u03c3\u03c4\u03b5 \u03c3\u03af\u03b3\u03bf\u03c5\u03c1\u03bf\u03b9 \u03cc\u03c4\u03b9 \u03b8\u03ad\u03bb\u03b5\u03c4\u03b5 \u03bd\u03b1 \u03b4\u03b9\u03b1\u03b3\u03c1\u03ac\u03c8\u03b5\u03c4\u03b5 \u03c4\u03bf\u03bd \u03bb\u03bf\u03b3\u03b1\u03c1\u03b9\u03b1\u03c3\u03bc\u03cc; \u0391\u03c5\u03c4\u03ae \u03b7 \u03b5\u03bd\u03ad\u03c1\u03b3\u03b5\u03b9\u03b1 \u03b5\u03af\u03bd\u03b1\u03b9 \u03bc\u03b9\u03b1\u03c4\u03ae.",
    deleteAccountSuccess: "\u039f \u03bb\u03bf\u03b3\u03b1\u03c1\u03b9\u03b1\u03c3\u03bc\u03cc\u03c2 \u03b4\u03b9\u03b1\u03b3\u03c1\u03ac\u03c6\u03b7\u03ba\u03b5 \u03b5\u03c0\u03b9\u03c4\u03c5\u03c7\u03ce\u03c2.",
    removeFriend: "\u0391\u03c6\u03b1\u03af\u03c1\u03b5\u03c3\u03b7 \u03c6\u03af\u03bb\u03bf\u03c5",
    removeFriendConfirm: "\u039d\u03b1 \u03b1\u03c6\u03b1\u03b9\u03c1\u03b5\u03b8\u03b5\u03af \u03b1\u03c5\u03c4\u03cc\u03c2 \u03bf \u03c6\u03af\u03bb\u03bf\u03c2;",
    activeGroups: "\u0395\u03bd\u03b5\u03c1\u03b3\u03ad\u03c2 \u03bf\u03bc\u03ac\u03b4\u03b5\u03c2",
    pastGroups: "\u03a0\u03b1\u03bb\u03b9\u03ad\u03c2 \u03bf\u03bc\u03ac\u03b4\u03b5\u03c2",
    noActiveGroups: "\u0394\u03b5\u03bd \u03c5\u03c0\u03ac\u03c1\u03c7\u03bf\u03c5\u03bd \u03b5\u03bd\u03b5\u03c1\u03b3\u03ad\u03c2 \u03bf\u03bc\u03ac\u03b4\u03b5\u03c2",
    noPastGroups: "\u0394\u03b5\u03bd \u03c5\u03c0\u03ac\u03c1\u03c7\u03bf\u03c5\u03bd \u03c0\u03b1\u03bb\u03b9\u03ad\u03c2 \u03bf\u03bc\u03ac\u03b4\u03b5\u03c2",
    you: "\u03b5\u03c3\u03b5\u03af\u03c2",
    friends_: "\u03a6\u03af\u03bb\u03bf\u03b9",
    requestSent: "\u03a4\u03bf \u03b1\u03af\u03c4\u03b7\u03bc\u03b1 \u03c3\u03c4\u03ac\u03bb\u03b8\u03b7\u03ba\u03b5",
    noPending: "\u0394\u03b5\u03bd \u03c5\u03c0\u03ac\u03c1\u03c7\u03bf\u03c5\u03bd \u03b5\u03ba\u03ba\u03c1\u03b5\u03bc\u03ae \u03b1\u03b9\u03c4\u03ae\u03bc\u03b1\u03c4\u03b1",
    inboxClear: "\u0394\u03b5\u03bd \u03c5\u03c0\u03ac\u03c1\u03c7\u03bf\u03c5\u03bd \u03b5\u03b9\u03b4\u03bf\u03c0\u03bf\u03b9\u03ae\u03c3\u03b5\u03b9\u03c2",
    noPastActivities: "\u0394\u03b5\u03bd \u03c5\u03c0\u03ac\u03c1\u03c7\u03bf\u03c5\u03bd \u03b1\u03ba\u03cc\u03bc\u03b1 \u03c0\u03b1\u03bb\u03b9\u03ad\u03c2 \u03b4\u03c1\u03b1\u03c3\u03c4\u03b7\u03c1\u03b9\u03cc\u03c4\u03b7\u03c4\u03b5\u03c2",
    continueBrowsing: "\u0398\u03ad\u03bb\u03b5\u03c4\u03b5 \u03bd\u03b1 \u03c3\u03c5\u03bd\u03b5\u03c7\u03af\u03c3\u03b5\u03c4\u03b5 \u03bd\u03b1 \u03b2\u03bb\u03ad\u03c0\u03b5\u03c4\u03b5 \u03bc\u03ad\u03c1\u03b7;",
    noMoreSuggestions: "\u0394\u03b5\u03bd \u03c5\u03c0\u03ac\u03c1\u03c7\u03bf\u03c5\u03bd \u03ac\u03bb\u03bb\u03b5\u03c2 \u03c0\u03c1\u03bf\u03c4\u03ac\u03c3\u03b5\u03b9\u03c2",
    aiGenerating: "\u039b\u03ae\u03c8\u03b7 \u03c0\u03c1\u03bf\u03c4\u03ac\u03c3\u03b5\u03c9\u03bd AI...",
    exitGroupPermanent: "\u039c\u03cc\u03bd\u03b9\u03bc\u03b7 \u03ad\u03be\u03bf\u03b4\u03bf\u03c2 \u03b1\u03c0\u03cc \u03bf\u03bc\u03ac\u03b4\u03b1",
    confirmExitGroup: "\u0395\u03af\u03c3\u03c4\u03b5 \u03c3\u03af\u03b3\u03bf\u03c5\u03c1\u03bf\u03b9 \u03cc\u03c4\u03b9 \u03b8\u03ad\u03bb\u03b5\u03c4\u03b5 \u03bd\u03b1 \u03c6\u03cd\u03b3\u03b5\u03c4\u03b5 \u03bc\u03cc\u03bd\u03b9\u03bc\u03b1;",
    accountManagement: "\u0394\u03b9\u03b1\u03c7\u03b5\u03af\u03c1\u03b9\u03c3\u03b7 \u039b\u03bf\u03b3\u03b1\u03c1\u03b9\u03b1\u03c3\u03bc\u03bf\u03cd",
    choiceNo: "\u038c\u03c7\u03b9",
    choiceMaybe: "\u038a\u03c3\u03c9\u03c2",
    choiceYes: "\u039d\u03b1\u03b9",
    searchFrom: "\u0391\u03bd\u03b1\u03b6\u03ae\u03c4\u03b7\u03c3\u03b7 \u03b1\u03c0\u03cc",
    searchGooglePlaces: "Google Places",
    searchSample: "\u03b4\u03b5\u03af\u03b3\u03bc\u03b1\u03c4\u03b1 \u03b4\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03c9\u03bd",
    searchCustom: "\u03c0\u03c1\u03bf\u03c3\u03b1\u03c1\u03bc\u03bf\u03c3\u03bc\u03ad\u03bd\u03b7 \u03b9\u03b4\u03ad\u03b1",
    areaSelected: "\u0395\u03c0\u03b9\u03bb\u03ad\u03c7\u03b8\u03b7\u03ba\u03b5 \u03c0\u03b5\u03c1\u03b9\u03bf\u03c7\u03ae. \u0391\u03bd\u03b1\u03bc\u03ad\u03bd\u03bf\u03c5\u03bc\u03b5 \u03cc\u03bb\u03bf\u03c5\u03c2 \u03bd\u03b1 \u03c3\u03c5\u03bc\u03c6\u03c9\u03bd\u03ae\u03c3\u03bf\u03c5\u03bd \u03c3\u03b5 \u03bc\u03b9\u03b1 \u03b4\u03c1\u03b1\u03c3\u03c4\u03b7\u03c1\u03b9\u03cc\u03c4\u03b7\u03c4\u03b1.",
    fridayCrew: "\u03a0\u03b1\u03c1\u03ad\u03b1 \u03a0\u03b1\u03c1\u03b1\u03c3\u03ba\u03b5\u03c5\u03ae\u03c2"
  }
};

function applyLanguage() {
  document.documentElement.lang = state.language;
  languageButton.textContent = state.language === "en" ? "EL" : "EN";
  appLanguageButton.textContent = state.language === "en" ? "EL" : "EN";
  heroLoginButton.textContent = t("login");
  heroEnterButton.textContent = t("enterPlanswipe");
  loginButton.textContent = t("login");
  registerButton.textContent = t("createAccount");
  loginForm.querySelector("h2").textContent = t("enterPlanswipe");
  
  // Hero copy
  const heroCopy = document.querySelector(".hero-copy");
  if (heroCopy) {
    const eyb = heroCopy.querySelector(".eyebrow");
    if (eyb) eyb.textContent = t("heroEyebrow");
    const h1 = heroCopy.querySelector("h1");
    if (h1) h1.textContent = t("heroTitle");
    const desc = heroCopy.querySelector(".hero-description");
    if (desc) desc.textContent = t("heroDescription");
    const span = heroCopy.querySelector(".hero-actions span");
    if (span) span.textContent = t("heroNote");
  }
  
  // Hero preview cards
  const previewDiv = document.querySelector(".preview-card div");
  if (previewDiv) {
    const p = previewDiv.querySelector("p");
    if (p) p.textContent = t("dinnerNearSea");
    const h2 = previewDiv.querySelector("h2");
    if (h2) h2.textContent = t("glyfadaTaverna");
    const span = previewDiv.querySelector("span");
    if (span) span.textContent = t("seeWhatFriendsThink");
  }
  const previewStack = document.querySelector(".preview-stack span");
  if (previewStack) previewStack.textContent = t("findSimilar");
  
  // Offer section
  const offerSection = document.querySelector(".offer-section");
  if (offerSection) {
    const eyb = offerSection.querySelector(".eyebrow");
    if (eyb) eyb.textContent = t("whatPlanswipeIs");
    const h2 = offerSection.querySelector("h2");
    if (h2) h2.textContent = t("sharedDecisionTool");
    const p = offerSection.querySelector("p");
    if (p) p.textContent = t("offerText");
    const articles = offerSection.querySelectorAll(".offer-grid article");
    if (articles[0]) {
      const h3 = articles[0].querySelector("h3");
      if (h3) h3.textContent = t("agreeFaster");
      const p = articles[0].querySelector("p");
      if (p) p.textContent = t("agreeFasterText");
    }
    if (articles[1]) {
      const h3 = articles[1].querySelector("h3");
      if (h3) h3.textContent = t("discoverOptions");
      const p = articles[1].querySelector("p");
      if (p) p.textContent = t("discoverOptionsText");
    }
    if (articles[2]) {
      const h3 = articles[2].querySelector("h3");
      if (h3) h3.textContent = t("voteAsGroup");
      const p = articles[2].querySelector("p");
      if (p) p.textContent = t("voteAsGroupText");
    }
  }
  
  // Topbar
  const topbarEyb = document.querySelector(".topbar .eyebrow");
  if (topbarEyb) topbarEyb.textContent = t("groupPlans");
  resetButton.textContent = t("leaveGroup");
  closePageButton.textContent = t("exitGroup");
  suggestionButton.textContent = t("aiSuggestions");
  reviewButton.textContent = t("changeBasics");
  
  // Setup panel
  const setupH2 = document.querySelector("#setupPanel h2");
  if (setupH2) setupH2.textContent = t("startPlanning");
  const setupP = document.querySelector("#setupPanel .setup-intro p");
  if (setupP) setupP.textContent = t("startPlanningText");
  if (showCreateButton) {
    const strong = showCreateButton.querySelector("strong");
    if (strong) strong.textContent = t("createGroup");
    const span = showCreateButton.querySelector("span");
    if (span) span.textContent = t("createGroupText");
  }
  if (showJoinButton) {
    const strong = showJoinButton.querySelector("strong");
    if (strong) strong.textContent = t("joinGroup");
    const span = showJoinButton.querySelector("span");
    if (span) span.textContent = t("joinGroupText");
  }
  const createFieldSpan = createForm.querySelector(".field span");
  if (createFieldSpan) createFieldSpan.textContent = t("groupName");
  groupInput.placeholder = t("fridayCrew");
  const joinFieldSpan = joinForm.querySelector(".field span");
  if (joinFieldSpan) joinFieldSpan.textContent = t("groupCodeLabel");
  createButton.textContent = t("createGroup");
  joinButton.textContent = t("joinGroup");
  backFromCreateButton.textContent = t("back");
  backFromJoinButton.textContent = t("back");
  homeButton.textContent = t("home");
  
  // Swipe buttons
  noButton.textContent = t("choiceNo");
  maybeButton.textContent = t("choiceMaybe");
  yesButton.textContent = t("choiceYes");
  
  // Profile menu
  const menuButtons = profileMenu.querySelectorAll("button[data-page]");
  menuButtons.forEach((button) => {
    const pageKey = button.dataset.page;
    const labelKey = pageKey === "likedplaces" ? "likedPlaces" : pageKey;
    button.textContent = t(labelKey);
  });
  logoutButton.textContent = t("logout");
  
  // Results
  const resultsEyb = document.querySelector(".results-panel .eyebrow");
  if (resultsEyb) resultsEyb.textContent = t("liveChoices");
  const resultsTitle = document.querySelector(".results-panel h2");
  if (resultsTitle && resultsTitle.id !== "groupName") resultsTitle.textContent = t("resultsTitle");
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
  var m = function(c) { return "&#" + c.charCodeAt(0) + ";"; };
  return String(value ?? "").replace(/[&<>"']/g, m);
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (state.supabaseSession?.access_token) {
    headers.Authorization = `Bearer ${state.supabaseSession.access_token}`;
  }
  const response = await fetch(path, { headers, ...options, body: options.body ? JSON.stringify(options.body) : undefined });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

function initials(name) {
  return String(name || "").trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("");
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
      state.supabaseClient.auth.onAuthStateChange((_event, session) => { state.supabaseSession = session || null; });
    }
  } catch (error) { console.warn(error.message); }
}

async function syncSupabaseProfile(username, email) {
  const data = await api("/api/auth/profile", { method: "POST", body: { username, email } });
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
  if (!validEmail(loginEmail.value)) throw new Error("Enter a valid email address.");
  if (state.supabaseClient) {
    const { data, error } = await state.supabaseClient.auth.signInWithPassword({ email: loginEmail.value.trim(), password: loginPassword.value });
    if (error) throw new Error(error.message);
    state.supabaseSession = data.session;
    await syncSupabaseProfile(loginUsername.value.trim(), data.user.email || loginEmail.value.trim());
    loginUsername.value = ""; loginEmail.value = ""; loginPassword.value = "";
    state.loginOpen = false;
    navigate("/main");
    return;
  }
  const data = await api("/api/login", { method: "POST", body: { username: loginUsername.value, email: loginEmail.value, password: loginPassword.value } });
  setLoggedIn(data.username, data.email || loginEmail.value.trim());
  saveAccount({ username: data.username, email: data.email || loginEmail.value.trim(), profile: data.profile });
  loginUsername.value = ""; loginEmail.value = ""; loginPassword.value = "";
  state.loginOpen = false;
  navigate("/main");
}

async function registerUser() {
  const username = loginUsername.value.trim();
  const email = loginEmail.value.trim();
  const password = loginPassword.value;
  if (!validEmail(email)) throw new Error("Enter a valid email address.");
  if (state.supabaseClient) {
    const { data, error } = await state.supabaseClient.auth.signUp({ email, password, options: { data: { username } } });
    if (error) throw new Error(error.message);
    state.supabaseSession = data.session;
    if (!data.session) { alert("Check your email to confirm your account, then log in."); return; }
    await syncSupabaseProfile(username, data.user.email || email);
    loginUsername.value = ""; loginEmail.value = ""; loginPassword.value = "";
    state.loginOpen = false;
    navigate("/main");
    return;
  }
  const data = await api("/api/register", { method: "POST", body: { username, email, password } });
  setLoggedIn(data.username || username, data.email || email);
  saveAccount({ username: data.username || username, email: data.email || email, profile: data.profile });
  loginUsername.value = ""; loginEmail.value = ""; loginPassword.value = "";
  state.loginOpen = false;
  navigate("/main");
}

function selected(kind) { return state.group?.choices?.[kind]?.[state.user?.id] || null; }
function consensus(kind) { return state.group?.consensus?.[kind] || null; }
function memberCount() { return state.group?.members?.length || 1; }
function optionsFor(kind) { return state.group?.options?.[kind] || (kind === "area" ? state.areas : state.types); }
function optionScore(kind, id) { return state.group?.counts?.[kind]?.[id] || 0; }

function renderMembers() {
  memberRow.innerHTML = (state.group.members || []).map((member) => `
    <button class="member-chip" type="button" data-username="${escapeHtml(member.username || member.name)}">
      <span class="avatar">${member.profile?.picture ? `<img src="${escapeHtml(member.profile.picture)}" alt="">` : escapeHtml(initials(member.name))}</span>
      ${escapeHtml(member.name)}${member.id === state.user.id ? ` (${t("you")})` : ""}
    </button>`).join("");
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
  decisionStep.textContent = isAreaStep ? t("stepArea") : t("stepType");
  decisionTitle.textContent = isAreaStep ? t("areaTitle") : t("typeTitle");
  decisionHint.textContent = t("decisionHint");
  setVisible(backChoiceButton, kind === "type" || Boolean(chosen));
  const optionCards = options.map((option) => {
    const score = optionScore(kind, option.id);
    const selectedClass = chosen === option.id ? " is-selected" : "";
    let label = option.label;
    let description = option.description;
    const translated = translateOption(kind, option.id);
    if (translated) {
      label = translated.label;
      description = translated.description;
    }
    return `<button class="option-card${selectedClass}" type="button" data-kind="${kind}" data-id="${option.id}">
      <span class="option-score">${score}/${memberCount()} ${t("liveChoices")}</span>
      <span><h3>${label}</h3><p>${description}</p></span>
    </button>`;
  }).join("");
  const addLabel = isAreaStep ? t("addArea") : t("addActivity");
  const addText = isAreaStep ? t("addAreaText") : t("addActivityText");
  let addOwnText = t("addOwn");
  let addLabelCustom = addLabel;
  let addTextCustom = addText;
  if (state.language === "el") {
    const el = optionTranslations.el;
    addOwnText = el.addOwn;
    if (isAreaStep) { addLabelCustom = el.addArea; addTextCustom = el.addAreaText; }
    else { addLabelCustom = el.addActivity; addTextCustom = el.addActivityText; }
  }
  optionGrid.innerHTML = `${optionCards}
    <button class="option-card add-option-card" type="button" data-kind="${kind}" data-custom="true">
      <span class="option-score">${addOwnText}</span>
      <span><h3>${addLabelCustom}</h3><p>${addTextCustom}</p></span>
    </button>`;
}

function renderCard() {
  const places = [...(state.group.places || []), ...(state.aiPlacesBatch || [])];
  const place = places[state.index];
  if (!place) { setVisible(swipeLayout, false); setVisible(resultsPanel, true); renderResults(); return; }
  activityCard.classList.remove("swipe-yes", "swipe-no");
  activityPhoto.src = place.photoUrl || "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80";
  activityPhoto.alt = place.title;
  activityCategory.textContent = `${place.category} | ${Number(place.rating || 4).toFixed(1)} rating`;
  activityTitle.textContent = place.title;
  activityDescription.textContent = place.description;
  activityArea.textContent = place.areaLabel;
  activityTime.textContent = place.time;
  activityCost.textContent = place.cost;
  noButton.textContent = t("choiceNo");
  maybeButton.textContent = t("choiceMaybe");
  yesButton.textContent = t("choiceYes");
  const oldBtn = document.querySelector(".card-stage .continue-button");
  if (oldBtn) oldBtn.remove();
}

function renderResults() {
  const allPlaces = [...(state.group.places || []), ...(state.aiPlacesBatch || [])];
  const matches = state.group.matches || [];
  if (!matches.length && !allPlaces.length) {
    resultList.innerHTML = `<article class="result-card"><div class="result-icon"></div><div><h3>${t("noStrongChoice")}</h3><p>${t("keepSwiping")}</p></div><strong class="result-score">0%</strong></article>`;
    return;
  }
  const votesByPlace = {};
  if (state.group.votes) {
    Object.values(state.group.votes).forEach((userVotes) => {
      Object.entries(userVotes).forEach(([placeId, vote]) => {
        const value = vote === true ? "yes" : vote === false ? "no" : vote;
        if (!votesByPlace[placeId]) votesByPlace[placeId] = { yes: 0, maybe: 0, no: 0 };
        if (value === "yes") votesByPlace[placeId].yes += 1;
        else if (value === "maybe") votesByPlace[placeId].maybe += 1;
        else votesByPlace[placeId].no += 1;
      });
    });
  }
  const allMatches = allPlaces.map((place) => {
    const votes = votesByPlace[place.id] || { yes: 0, maybe: 0, no: 0 };
    const total = state.group.members.length || 1;
    const percent = Math.round((votes.yes / total) * 100);
    return { ...place, yes: votes.yes, maybe: votes.maybe, no: votes.no, total, percent, score: percent };
  }).filter((place) => place.yes > 0 || place.maybe > 0).sort((a, b) => b.percent - a.percent || b.yes - a.yes || b.maybe - a.maybe);
  resultList.innerHTML = allMatches.map((item) => `
    <article class="result-card"><img class="result-icon" src="${item.photoUrl}" alt=""><div><h3>${item.title}</h3><p>${item.areaLabel} | ${item.category} | ${item.yes}/${item.total} yes, ${item.maybe || 0} maybe</p></div><strong class="result-score">${item.percent}%</strong></article>`).join("");
  const existingBtn = document.querySelector("#continueBrowseBtn");
  if (state.aiPlacesBatch.length > 0) {
    if (!existingBtn) {
      resultList.insertAdjacentHTML("afterend", `<button class="continue-button" id="continueBrowseBtn">${t("continueBrowsing")}</button>`);
      document.querySelector("#continueBrowseBtn").addEventListener("click", () => loadMoreAiSuggestions());
    }
  } else if (existingBtn) { existingBtn.remove(); }
}

async function loadMoreAiSuggestions() {
  if (!state.group) return;
  const areaId = state.group.consensus?.area || Object.values(state.group.choices?.area || {})[0];
  const typeId = state.group.consensus?.type || Object.values(state.group.choices?.type || {})[0];
  if (!areaId || !typeId) { showError("Choose an area and activity first."); return; }
  const areaLabel = state.group.options?.area?.find((o) => o.id === areaId)?.label || "";
  const typeLabel = state.group.options?.type?.find((o) => o.id === typeId)?.label || "";
  if (!areaLabel || !typeLabel) return;
  try {
    const data = await api("/api/suggestions", { method: "POST", body: { username: currentUsername(), area: areaLabel, activity: typeLabel } });
    if (!data.suggestions || !data.suggestions.length) { showError(t("noMoreSuggestions")); return; }
    const newPlaces = data.suggestions.map((s, i) => ({ id: `ai_${Date.now()}_${i}`, title: s.place || "Suggestion", category: typeLabel, areaLabel: areaLabel, description: s.reason || "AI suggested place", time: "Anytime", cost: "$$", rating: 4, photoUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80" }));
    if (!state.group.places) state.group.places = [];
    state.group.places = [...state.group.places, ...newPlaces];
    state.index = state.group.places.length - newPlaces.length;
    const contBtn = document.querySelector(".continue-button");
    if (contBtn) contBtn.remove();
    renderApp();
  } catch (error) { showError(error.message); }
}

function renderStatus() {
  const areaReady = consensus("area");
  const typeReady = consensus("type");
  if (!state.group) { setVisible(statusPanel, false); return; }
  setVisible(statusPanel, true);
  if (!areaReady) { statusPanel.textContent = t("decisionHint"); return; }
  if (!typeReady) { statusPanel.textContent = t("areaSelected"); return; }
  const source = state.group.search?.source === "google" ? t("searchGooglePlaces") : state.group.search?.source === "custom" ? t("searchCustom") : t("searchSample");
  statusPanel.textContent = `${t("searchFrom")} ${source}: "${state.group.search?.query || ""}"`;
}

function preferenceList(title, key, items, placeholder) {
  return `<div class="preference-box"><h3>${escapeHtml(title)}</h3><div class="pill-row">${(items || []).map((item) => `<span class="preference-pill">${escapeHtml(item)}</span>`).join("") || `<span class="muted-text">Nothing saved yet.</span>`}</div><div class="inline-add"><input type="text" data-pref-input="${key}" placeholder="${escapeHtml(placeholder)}"><button type="button" data-pref-add="${key}">Add</button></div></div>`;
}

function profileImage(user, sizeClass = "profile-preview") {
  const picture = user?.profile?.picture || "";
  if (picture) { return `<span class="${sizeClass} image-avatar" style="background-image:url('${escapeHtml(picture)}')"></span>`; }
  return `<span class="${sizeClass}">${escapeHtml(initials(user?.username || currentUsername()) || "P")}</span>`;
}

async function renderPersonalInformation() {
  const account = await loadAccount();
  const profile = account.profile || {};
  const preferences = profile.preferences || {};
  pageDemo.innerHTML = `<form class="personal-form"><section><h3>My Profile</h3><label class="profile-upload">${profileImage(account)}<span>Edit profile picture</span><input id="profilePictureInput" type="file" accept="image/*"></label><label class="field"><span>Username</span><input type="text" value="${escapeHtml(account.username)}" disabled></label><label class="field"><span>Email</span><input type="email" value="${escapeHtml(account.email || "")}" disabled></label><label class="field"><span>${t("age")}</span><input id="profileAge" type="number" min="13" max="120" value="${escapeHtml(profile.age || "")}"></label><label class="field"><span>Password</span><input type="password" placeholder="Email authentication required to change password" disabled></label><label class="field"><span>${t("bio")}</span><textarea id="profileBio" rows="5" placeholder="Tell friends what kind of plans you like.">${escapeHtml(profile.bio || "")}</textarea></label><button class="btn-primary" type="button" id="saveProfileButton">${t("saveProfile")}</button></section><section><h3>${t("preferences")}</h3>${preferenceList("Favourite Areas", "areas", preferences.areas, "Add another area")}${preferenceList("Favourite Activities", "activities", preferences.activities, "Add another activity")}${preferenceList("Favourite Places", "places", preferences.places, "Add another place")}</section></form>`;
}

function userCard(user, action = "") {
  const preferences = user.profile?.preferences || {};
  const preferenceText = [...(preferences.areas || []), ...(preferences.activities || []), ...(preferences.places || [])].slice(0, 4).join(", ");
  return `<article class="demo-card user-card"><div class="user-card-head">${profileImage(user, "small-profile-preview")}<div><h3>${escapeHtml(user.username)}</h3><p>${escapeHtml(user.profile?.bio || t("noFriends"))}</p></div></div><p>${escapeHtml(preferenceText || t("noFriends"))}</p>${action}</article>`;
}

async function renderFriendsPage() {
  pageDemo.innerHTML = `<section class="wide-panel"><div class="inline-add"><input id="friendSearchInput" type="text" placeholder="${t("searchByUsername")}"><button id="friendSearchButton" type="button">${t("search")}</button></div><div id="friendSearchResults" class="demo-grid"></div></section><section class="wide-panel"><h3>${t("friends")}</h3><div id="friendList" class="demo-grid"></div></section><section class="wide-panel"><h3>${t("requests")}</h3><div id="requestList" class="demo-grid"></div></section>`;
  await refreshFriendsPage();
}

async function refreshFriendsPage() {
  const data = await api(`/api/friends?username=${encodeURIComponent(currentUsername())}`);
  state.friendsData = data;
  state.friendsDataLoaded = true;
  const friendList = document.querySelector("#friendList");
  const requestList = document.querySelector("#requestList");
  if (!friendList || !requestList) return;
  friendList.innerHTML = data.friends.length ? data.friends.map((user) => userCard(user, `<button class="btn-ghost" type="button" data-view-profile="${escapeHtml(user.username)}">${t("personal")}</button>`)).join("") : `<article class="demo-card"><h3>${t("noFriends")}</h3><p>${t("searchByUsername")}</p></article>`;
  const requests = [...data.incoming.map((user) => userCard(user, `<button class="btn-primary" type="button" data-accept-friend="${escapeHtml(user.username)}">Accept</button>`)), ...data.outgoing.map((user) => userCard(user, `<span class="request-status">${t("requestSent")}</span>`))];
  requestList.innerHTML = requests.length ? requests.join("") : `<article class="demo-card"><h3>${t("noPending")}</h3><p>${t("friends_")}</p></article>`;
}

async function renderGroupsPage() {
  const data = await api(`/api/groups/mine?username=${encodeURIComponent(currentUsername())}`);
  const allGroups = data.groups || [];
  const exitedCodes = state.exitedGroups || [];
  const activeGroups = allGroups.filter((g) => !exitedCodes.includes(g.code));
  const pastGroups = allGroups.filter((g) => exitedCodes.includes(g.code));
  let html = `<h3 class="group-section-title">${t("activeGroups")}</h3>`;
  if (activeGroups.length) {
    html += activeGroups.map((group) => `<article class="group-card"><h3>${escapeHtml(group.name)}</h3><p class="group-meta">Code ${escapeHtml(group.code)} | ${group.memberCount} member${group.memberCount === 1 ? "" : "s"}</p><div class="group-actions"><button class="btn-primary" type="button" data-open-group="${escapeHtml(group.code)}">Open</button><button class="danger-button" type="button" data-exit-group="${escapeHtml(group.code)}">${t("exitGroupPermanent")}</button></div></article>`).join("");
  } else { html += `<article class="demo-card"><h3>${t("noActiveGroups")}</h3></article>`; }
  html += `<h3 class="group-section-title">${t("pastGroups")}</h3>`;
  if (pastGroups.length) {
    html += pastGroups.map((group) => `<article class="group-card"><h3>${escapeHtml(group.name)}</h3><p class="group-meta">Code ${escapeHtml(group.code)} | ${t("pastGroups")}</p><div class="group-actions"><button class="btn-ghost" type="button" data-open-group="${escapeHtml(group.code)}">${t("home")}</button></div></article>`).join("");
  } else { html += `<article class="demo-card"><h3>${t("noPastGroups")}</h3></article>`; }
  pageDemo.innerHTML = html;
}

async function renderLikedPlacesPage() {
  pageEyebrow.textContent = t("likedPlaces");
  pageTitle.textContent = t("likedPlaces");
  try {
    const data = await api(`/api/liked-places?username=${encodeURIComponent(currentUsername())}`);
    const places = data.places || [];
    if (!places.length) { pageDemo.innerHTML = `<article class="demo-card"><h3>${t("noLikedPlaces")}</h3></article>`; return; }
    pageDemo.innerHTML = places.map((item) => `<div class="liked-place-card"><h3>${escapeHtml(item.place)}</h3><p>${escapeHtml(item.area)} | ${escapeHtml(item.activity)}</p><span class="vote-tag ${item.vote}">${item.vote}</span><span class="group-meta">${escapeHtml(item.groupName || "")}</span></div>`).join("");
  } catch (error) { pageDemo.innerHTML = `<article class="demo-card"><h3>${t("noLikedPlaces")}</h3></article>`; }
}

async function renderPastPage() {
  const account = await loadAccount();
  const activities = account.profile?.pastActivities || [];
  pageDemo.innerHTML = `<section class="wide-panel"><button class="btn-primary" type="button" id="showPastActivityForm">${t("logPastActivity")}</button><form class="setup-form is-hidden" id="pastActivityForm"><label class="field"><span>${t("area")}</span><input id="pastAreaInput" type="text" placeholder="Athens seaside"></label><label class="field"><span>${t("activity")}</span><input id="pastActivityInput" type="text" placeholder="Dinner"></label><label class="field"><span>${t("place")}</span><input id="pastPlaceInput" type="text" placeholder="Restaurant name"></label><button class="btn-primary" type="button" id="savePastActivityButton">${t("saveActivity")}</button></form></section>${activities.length ? activities.map((activity) => `<article class="demo-card"><h3>${escapeHtml(activity.place)}</h3><p>${escapeHtml(activity.area)} | ${escapeHtml(activity.activity)}</p></article>`).join("") : `<article class="demo-card"><h3>${t("noPastActivities")}</h3></article>`}`;
}

async function savePastActivity() {
  const area = document.querySelector("#pastAreaInput")?.value.trim();
  const activity = document.querySelector("#pastActivityInput")?.value.trim();
  const place = document.querySelector("#pastPlaceInput")?.value.trim();
  if (!area || !activity || !place) { showError("Area, activity, and place are required."); return; }
  const profile = state.account?.profile || {};
  const pastActivities = [{ area, activity, place, loggedAt: Date.now() }, ...(profile.pastActivities || [])].slice(0, 50);
  const data = await api("/api/account", { method: "PATCH", body: { username: currentUsername(), profile: { ...profile, pastActivities } } });
  saveAccount(data.user);
  await renderPastPage();
}

async function renderAccountProfile(username) {
  const data = await api(`/api/account?username=${encodeURIComponent(username)}&viewer=${encodeURIComponent(currentUsername())}`);
  const user = data.user;
  const preferences = user.profile?.preferences || {};
  pageEyebrow.textContent = t("personal");
  pageTitle.textContent = user.username;
  const friendAction = user.username === currentUsername() ? "" : user.friendStatus === "friends" ? `<span class="request-status">${t("friends_")}</span>` : user.friendStatus === "incoming" ? `<button class="btn-primary" type="button" data-accept-friend="${escapeHtml(user.username)}">Accept Request</button>` : user.friendStatus === "requested" ? `<span class="request-status">${t("requestSent")}</span>` : `<button class="btn-primary" type="button" data-add-friend="${escapeHtml(user.username)}">Add Friend</button>`;
  const removeAction = user.friendStatus === "friends" && user.username !== currentUsername() ? `<button class="danger-button" type="button" data-remove-friend="${escapeHtml(user.username)}">${t("removeFriend")}</button>` : "";
  pageDemo.innerHTML = `${userCard(user, friendAction)}${removeAction ? `<section class="wide-panel">${removeAction}</section>` : ""}<section class="wide-panel"><h3>${t("preferences")}</h3>${preferenceList("Favourite Areas", "readonly-areas", preferences.areas, "")}${preferenceList("Favourite Activities", "readonly-activities", preferences.activities, "")}${preferenceList("Favourite Places", "readonly-places", preferences.places, "")}</section>`;
}

async function renderSettingsPage() {
  const profile = state.account?.profile || {};
  const settings = profile.settings || {};
  pageEyebrow.textContent = t("settings");
  pageTitle.textContent = t("settings");
  pageDemo.innerHTML = `<section class="wide-panel personal-form"><h3>${t("notifications")}</h3><div class="settings-toggle"><label for="notifFriendReq">${t("friendRequestNotif")}</label><input type="checkbox" id="notifFriendReq" ${settings.friendRequestNotif !== false ? "checked" : ""}></div><div class="settings-toggle"><label for="notifGroupInvite">${t("groupInviteNotif")}</label><input type="checkbox" id="notifGroupInvite" ${settings.groupInviteNotif !== false ? "checked" : ""}></div></section><section class="wide-panel personal-form"><h3>${t("privacy")}</h3><div class="settings-toggle"><label for="privacyOnline">${t("showOnlineStatus")}</label><input type="checkbox" id="privacyOnline" ${settings.showOnlineStatus !== false ? "checked" : ""}></div><div class="settings-toggle"><label for="privacyPublic">${t("showProfilePublicly")}</label><input type="checkbox" id="privacyPublic" ${settings.showProfilePublicly !== false ? "checked" : ""}></div></section><button class="btn-primary" type="button" id="saveSettingsButton">${t("saveSettings")}</button><section class="wide-panel personal-form" style="margin-top: 18px; border-top: 2px solid var(--red);"><h3 style="color: var(--red);">${t("accountManagement")}</h3><button class="danger-button" type="button" id="deleteAccountButton">${t("deleteAccount")}</button></section>`;
}

async function saveSettings() {
  const notifFriendReq = document.querySelector("#notifFriendReq")?.checked !== false;
  const notifGroupInvite = document.querySelector("#notifGroupInvite")?.checked !== false;
  const showOnlineStatus = document.querySelector("#privacyOnline")?.checked !== false;
  const showProfilePublicly = document.querySelector("#privacyPublic")?.checked !== false;
  const profile = state.account?.profile || {};
  const data = await api("/api/account", { method: "PATCH", body: { username: currentUsername(), profile: { ...profile, settings: { friendRequestNotif: notifFriendReq, groupInviteNotif: notifGroupInvite, showOnlineStatus, showProfilePublicly } } } });
  saveAccount(data.user);
  showError(t("settingsSaved"));
}

async function deleteAccount() {
  if (!confirm(t("deleteAccountConfirm"))) return;
  await api("/api/account/delete", { method: "POST", body: { username: currentUsername() } });
  alert(t("deleteAccountSuccess"));
  logout();
}

function renderProfilePage() {
  const content = pageContent[state.activePage];
  if (!content) return;
  pageEyebrow.textContent = content.eyebrow;
  pageTitle.textContent = content.title;
  if (state.activePage === "personal") { renderPersonalInformation().catch((error) => showError(error.message)); return; }
  if (state.activePage === "friends") { renderFriendsPage().catch((error) => showError(error.message)); return; }
  if (state.activePage === "groups") { renderGroupsPage().catch((error) => showError(error.message)); return; }
  if (state.activePage === "likedplaces") { renderLikedPlacesPage().catch((error) => showError(error.message)); return; }
  if (state.activePage === "past") { renderPastPage().catch((error) => showError(error.message)); return; }
  if (state.activePage === "settings") { renderSettingsPage().catch((error) => showError(error.message)); return; }
  if (state.activePage.startsWith("profile:")) { renderAccountProfile(state.activePage.slice("profile:".length)).catch((error) => showError(error.message)); return; }
}

function hideAppPanels() {
  setVisible(setupPanel, false);
  setVisible(groupPanel, false);
  setVisible(statusPanel, false);
  setVisible(decisionPanel, false);
  setVisible(swipeLayout, false);
  setVisible(resultsPanel, false);
}

async function refreshNotifications() {
  if (!isLoggedIn()) return;
  try {
    const data = await api(`/api/notifications?username=${encodeURIComponent(currentUsername())}`);
    state.notifications = data;
    const badge = notificationBadge;
    if (data.total > 0) { badge.textContent = data.total > 99 ? "99+" : String(data.total); badge.classList.remove("is-hidden"); }
    else { badge.classList.add("is-hidden"); }
    const menuButtons = profileMenu.querySelectorAll("button[data-page]");
    menuButtons.forEach((btn) => {
      btn.classList.remove("has-notif");
      const existingCount = btn.querySelector(".notif-count");
      if (existingCount) existingCount.remove();
      let count = 0;
      if (btn.dataset.page === "friends") count = data.friendRequests || 0;
      if (count > 0) { btn.classList.add("has-notif"); const span = document.createElement("span"); span.className = "notif-count"; span.textContent = `(${count})`; btn.appendChild(span); }
    });
  } catch (_error) {}
}

// ====== HISTORY API ROUTING ======

function currentRoute() {
  const path = window.location.pathname;
  if (path === "/" || path === "") return "/home";
  return path;
}

function navigate(path) {
  history.pushState({}, "", path);
  onUrlChange();
}

function onUrlChange() {
  const route = currentRoute();

  if (!isLoggedIn()) {
    if (route !== "/home") {
      history.replaceState({}, "", "/home");
    }
    state.showHero = true;
    state.activePage = "";
    state.loginOpen = false;
    renderApp();
    return;
  }

  if (route === "/home") {
    state.showHero = true;
    state.activePage = "";
    renderApp();
    return;
  }

  if (route === "/main") {
    state.showHero = false;
    state.activePage = "";
    renderApp();
    return;
  }

  const pageMatch = route.match(/^\/(groups|friends|likedplaces|past|personal|settings)$/);
  if (pageMatch) {
    state.showHero = false;
    state.activePage = pageMatch[1];
    renderApp();
    return;
  }

  const profileMatch = route.match(/^\/profile\/(.+)$/);
  if (profileMatch) {
    state.showHero = false;
    state.activePage = "profile:" + decodeURIComponent(profileMatch[1]);
    renderApp();
    return;
  }

  navigate("/home");
}

function renderApp() {
  if (!isLoggedIn()) {
    setVisible(loginPanel, true);
    setVisible(loginForm, state.loginOpen);
    setVisible(topbar, false);
    setVisible(pagePanel, false);
    hideAppPanels();
    setVisible(heroEnterButton, false);
    setVisible(heroLoginButton, true);
    return;
  }

  if (state.showHero) {
    setVisible(loginPanel, true);
    setVisible(loginForm, false);
    setVisible(topbar, false);
    setVisible(pagePanel, false);
    hideAppPanels();
    setVisible(heroEnterButton, true);
    setVisible(heroLoginButton, false);
    const heroActions = document.querySelector(".hero-actions");
    if (!document.querySelector("#heroBackButton")) {
      heroActions.innerHTML = `<button class="btn-primary" id="heroBackButton" type="button">${t("enterPlanswipe")}</button> <span>${t("heroNote")}</span>`;
      document.querySelector("#heroBackButton").addEventListener("click", () => { navigate("/main"); });
    }
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
  refreshNotifications();

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

  searchSummary.textContent = `${t("searchFrom")}: "${state.group.search?.query || ""}"`;
  setVisible(decisionPanel, false);
  setVisible(resultsPanel, true);
  renderResults();

  const totalPlaces = [...(state.group.places || []), ...(state.aiPlacesBatch || [])];
  if (state.index < totalPlaces.length) {
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
  } catch (error) { showError(error.message); leaveGroup(); }
}

function startPolling() {
  clearInterval(state.pollTimer);
  clearInterval(state.notifTimer);
  state.pollTimer = setInterval(refreshGroup, 1500);
  state.notifTimer = setInterval(refreshNotifications, 5000);
}

function saveSession(user, group) {
  state.user = user;
  state.group = group;
  state.groupCode = group.code;
  state.setupMode = "";
  state.index = 0;
  state.aiPlacesBatch = [];
  localStorage.setItem("planswipe:user", JSON.stringify(user));
  localStorage.setItem("planswipe:groupCode", group.code);
  startPolling();
  renderApp();
}

async function createGroup() {
  const username = currentUsername() || "Friend";
  const data = await api("/api/groups", { method: "POST", body: { username, profile: state.account?.profile, groupName: groupInput.value.trim() } });
  saveSession(data.user, data.group);
}

async function joinGroup() {
  const username = currentUsername() || "Friend";
  const code = codeInput.value.trim();
  if (!/^\d{8}$/.test(code)) { showError("Enter an 8-digit group code."); return; }
  const data = await api(`/api/groups/${code}/join`, { method: "POST", body: { username, profile: state.account?.profile } });
  saveSession(data.user, data.group);
}

async function chooseOption(kind, optionId, customLabel = "") {
  const data = await api(`/api/groups/${state.group.code}/choice`, { method: "POST", body: { userId: state.user.id, kind, optionId, customLabel } });
  state.index = 0;
  state.group = data.group;
  renderApp();
}

async function goBackChoice() {
  if (!state.group || !state.user) return;
  const step = consensus("area") && !consensus("type") ? "area" : "type";
  const data = await api(`/api/groups/${state.group.code}/back`, { method: "POST", body: { userId: state.user.id, step } });
  state.index = 0;
  state.group = data.group;
  renderApp();
}

async function vote(value) {
  const totalPlaces = [...(state.group.places || []), ...(state.aiPlacesBatch || [])];
  const place = totalPlaces[state.index];
  if (!place) return;
  activityCard.classList.add(value === "yes" ? "swipe-yes" : "swipe-no");
  const data = await api(`/api/groups/${state.group.code}/vote`, { method: "POST", body: { userId: state.user.id, placeId: place.id, vote: value } });
  state.group = data.group;
  setTimeout(() => { state.index += 1; renderApp(); }, 170);
}

function leaveGroup() {
  clearInterval(state.pollTimer);
  clearInterval(state.notifTimer);
  state.user = null; state.group = null; state.groupCode = ""; state.index = 0; state.setupMode = ""; state.aiPlacesBatch = [];
  localStorage.removeItem("planswipe:user");
  localStorage.removeItem("planswipe:groupCode");
  renderApp();
}

function logout() {
  if (state.supabaseClient) { state.supabaseClient.auth.signOut().catch((error) => console.warn(error.message)); }
  state.supabaseSession = null;
  leaveGroup();
  state.activePage = ""; state.loginOpen = false; state.showHero = false;
  localStorage.removeItem("planswipe:login");
  localStorage.removeItem("planswipe:email");
  localStorage.removeItem("planswipe:account");
  state.account = null;
  navigate("/home");
}

function showError(message) {
  if (!isLoggedIn()) { alert(message); return; }
  setVisible(statusPanel, true);
  statusPanel.textContent = message;
}

async function saveProfile() {
  const bio = document.querySelector("#profileBio")?.value || "";
  const ageValue = document.querySelector("#profileAge")?.value || "";
  const age = ageValue ? Number(ageValue) : "";
  const profile = { ...(state.account?.profile || {}), bio, age, preferences: state.account?.profile?.preferences || { areas: [], activities: [], places: [] } };
  const data = await api("/api/account", { method: "PATCH", body: { username: currentUsername(), profile } });
  saveAccount(data.user);
  await renderPersonalInformation();
}

async function addPreference(key) {
  const input = document.querySelector(`[data-pref-input="${key}"]`);
  const value = input?.value.trim();
  if (!value || !["areas", "activities", "places"].includes(key)) return;
  const profile = state.account?.profile || {};
  const preferences = { areas: [...(profile.preferences?.areas || [])], activities: [...(profile.preferences?.activities || [])], places: [...(profile.preferences?.places || [])] };
  if (!preferences[key].some((item) => item.toLowerCase() === value.toLowerCase())) { preferences[key].push(value); }
  const data = await api("/api/account", { method: "PATCH", body: { username: currentUsername(), profile: { ...profile, preferences } } });
  saveAccount(data.user);
  await renderPersonalInformation();
}

async function updateProfilePicture(file) {
  if (!file) return;
  const reader = new FileReader();
  const picture = await new Promise((resolve, reject) => { reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
  const profile = { ...(state.account?.profile || {}), picture, preferences: state.account?.profile?.preferences || { areas: [], activities: [], places: [] } };
  const data = await api("/api/account", { method: "PATCH", body: { username: currentUsername(), profile } });
  saveAccount(data.user);
  await renderPersonalInformation();
}

async function requestFriend(username) {
  await api("/api/friends/request", { method: "POST", body: { fromUsername: currentUsername(), toUsername: username } });
  state.friendsDataLoaded = false;
  if (state.activePage === "friends") await refreshFriendsPage();
  else await renderAccountProfile(username);
}

async function acceptFriend(username) {
  await api("/api/friends/accept", { method: "POST", body: { username: currentUsername(), requester: username } });
  state.friendsDataLoaded = false;
  if (state.activePage === "friends") await refreshFriendsPage();
}

async function removeFriend(username) {
  if (!confirm(t("removeFriendConfirm"))) return;
  await api("/api/friends/remove", { method: "POST", body: { username: currentUsername(), friendUsername: username } });
  state.friendsDataLoaded = false;
  await renderFriendsPage();
}

async function searchFriends() {
  const input = document.querySelector("#friendSearchInput");
  const results = document.querySelector("#friendSearchResults");
  const query = input?.value.trim() || "";
  if (!results || !query) return;
  const data = await api(`/api/users/search?username=${encodeURIComponent(currentUsername())}&q=${encodeURIComponent(query)}`);
  results.innerHTML = data.users.length ? data.users.map((user) => {
    if (user.friendStatus === "friends") return userCard(user, `<button class="btn-ghost" type="button" data-view-profile="${escapeHtml(user.username)}">${t("personal")}</button>`);
    if (user.friendStatus === "incoming") return userCard(user, `<button class="btn-primary" type="button" data-accept-friend="${escapeHtml(user.username)}">Accept Request</button>`);
    if (user.friendStatus === "requested") return userCard(user, `<span class="request-status">${t("requestSent")}</span>`);
    return userCard(user, `<button class="btn-primary" type="button" data-add-friend="${escapeHtml(user.username)}">Add Friend</button>`);
  }).join("") : `<article class="demo-card"><h3>No users found</h3><p>Try another username.</p></article>`;
}

function selectedOptionLabel(kind, optionId) { return optionsFor(kind).find((option) => option.id === optionId)?.label || optionId || ""; }

async function getAiSuggestions() {
  if (!state.group) return;
  const areaId = consensus("area") || selected("area");
  const typeId = consensus("type") || selected("type");
  if (!areaId || !typeId) { showError("Choose an area and activity first."); return; }
  setVisible(suggestionPanel, true);
  suggestionPanel.innerHTML = `<p>${t("aiGenerating")}</p>`;
  const data = await api("/api/suggestions", { method: "POST", body: { username: currentUsername(), area: selectedOptionLabel("area", areaId), activity: selectedOptionLabel("type", typeId) } });
  const suggestions = data.suggestions || [];
  if (suggestions.length > 0) {
    const newPlaces = suggestions.map((s, i) => ({ id: `ai_${Date.now()}_${i}`, title: s.place || "Suggestion", category: selectedOptionLabel("type", typeId), areaLabel: selectedOptionLabel("area", areaId), description: s.reason || "AI suggested place", time: "Anytime", cost: "$$", rating: 4, photoUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80" }));
    state.aiPlacesBatch = newPlaces;
    if (!state.group.places) state.group.places = [];
    state.group.places = [...state.group.places, ...newPlaces];
    state.index = state.group.places.length - newPlaces.length;
    renderApp();
  }
  suggestionPanel.innerHTML = `<h3>${t("suggestedPlaces")}</h3><div class="suggestion-list">${suggestions.map((item) => `<article class="suggestion-card"><h4>${escapeHtml(item.place || item.name || "Suggestion")}</h4><p>${escapeHtml(item.reason || item.description || "")}</p></article>`).join("")}</div>`;
}

function goToHome() { navigate("/home"); }

async function exitGroupPermanently(groupCode) {
  if (!confirm(t("confirmExitGroup"))) return;
  await api("/api/groups/exit", { method: "POST", body: { username: currentUsername(), groupCode } });
  const exited = state.exitedGroups || [];
  if (!exited.includes(groupCode)) { exited.push(groupCode); state.exitedGroups = exited; localStorage.setItem("planswipe:exitedGroups", JSON.stringify(exited)); }
  if (state.groupCode === groupCode) { leaveGroup(); }
  await renderGroupsPage();
}

async function boot() {
  applyLanguage();
  await configureSupabaseAuth();

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
            try {
              const existingUser = await api(`/api/account?username=${encodeURIComponent(username)}&viewer=${encodeURIComponent(username)}`);
              if (existingUser?.user) { const user = await syncSupabaseProfile(username, email); setLoggedIn(user.username, user.email || email); saveAccount(user); }
            } catch (_err) { console.warn("Auto-login skipped: user not found in database"); }
          }
        }
        window.location.hash = "";
        history.replaceState(null, "", window.location.pathname);
      } catch (error) { console.warn("Email verification handler:", error.message); }
    }
  }

  const options = await api("/api/options");
  state.areas = options.areas;
  state.types = options.types;

  if (isLoggedIn()) { await loadAccount().catch(() => null); }
  if (isLoggedIn() && state.user && state.groupCode) { startPolling(); await refreshGroup(); return; }

  window.addEventListener("popstate", onUrlChange);

  const path = window.location.pathname;
  if (path === "/" || path === "" || path === "/home") {
    if (isLoggedIn()) { navigate("/main"); }
    else { navigate("/home"); }
  } else {
    onUrlChange();
  }
}

function openLogin() {
  state.loginOpen = true;
  renderApp();
  loginUsername.focus();
}

// ====== EVENT LISTENERS ======

heroEnterButton.addEventListener("click", () => {
  if (isLoggedIn()) { navigate("/main"); }
  else { openLogin(); }
});

showCreateButton.addEventListener("click", () => { state.setupMode = "create"; renderApp(); });
showJoinButton.addEventListener("click", () => { state.setupMode = "join"; renderApp(); });
heroLoginButton.addEventListener("click", openLogin);
backFromCreateButton.addEventListener("click", () => { state.setupMode = ""; renderApp(); });
backFromJoinButton.addEventListener("click", () => { state.setupMode = ""; renderApp(); });
createButton.addEventListener("click", () => createGroup().catch((error) => showError(error.message)));
joinButton.addEventListener("click", () => joinGroup().catch((error) => showError(error.message)));
loginButton.addEventListener("click", () => login().catch((error) => showError(error.message)));
registerButton.addEventListener("click", () => registerUser().catch((error) => showError(error.message)));
[loginUsername, loginEmail, loginPassword].forEach((input) => { input.addEventListener("keydown", (event) => { if (event.key === "Enter") login().catch((error) => showError(error.message)); }); });
homeButton.addEventListener("click", goToHome);
resetButton.addEventListener("click", leaveGroup);
logoutButton.addEventListener("click", logout);

profileButton.addEventListener("click", (event) => {
  event.stopPropagation();
  profileMenu.classList.toggle("is-hidden");
});

profileMenu.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-page]");
  if (button) {
    state.activePage = button.dataset.page;
    profileMenu.classList.add("is-hidden");
    const pageRoutes = { groups: "/groups", friends: "/friends", likedplaces: "/likedplaces", past: "/past", personal: "/personal", settings: "/settings" };
    navigate(pageRoutes[button.dataset.page] || "/main");
    return;
  }
  if (event.target.closest("#logoutButton")) { profileMenu.classList.add("is-hidden"); }
});

closePageButton.addEventListener("click", () => { state.activePage = ""; navigate("/main"); });

pageDemo.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-friend]");
  if (addButton) { requestFriend(addButton.dataset.addFriend).catch((error) => showError(error.message)); return; }
  const acceptButton = event.target.closest("[data-accept-friend]");
  if (acceptButton) { acceptFriend(acceptButton.dataset.acceptFriend).catch((error) => showError(error.message)); return; }
  const removeButton = event.target.closest("[data-remove-friend]");
  if (removeButton) { removeFriend(removeButton.dataset.removeFriend).catch((error) => showError(error.message)); return; }
  const viewButton = event.target.closest("[data-view-profile]");
  if (viewButton) { state.activePage = `profile:${viewButton.dataset.viewProfile}`; navigate("/profile/" + encodeURIComponent(viewButton.dataset.viewProfile)); return; }
  const openGroupButton = event.target.closest("[data-open-group]");
  if (openGroupButton) { codeInput.value = openGroupButton.dataset.openGroup; state.activePage = ""; joinGroup().catch((error) => showError(error.message)); return; }
  const exitGroupBtn = event.target.closest("[data-exit-group]");
  if (exitGroupBtn) { exitGroupPermanently(exitGroupBtn.dataset.exitGroup).catch((error) => showError(error.message)); return; }
  const saveButton = event.target.closest("#saveProfileButton");
  if (saveButton) { saveProfile().catch((error) => showError(error.message)); return; }
  const saveSettingsBtn = event.target.closest("#saveSettingsButton");
  if (saveSettingsBtn) { saveSettings().catch((error) => showError(error.message)); return; }
  const deleteAccountBtn = event.target.closest("#deleteAccountButton");
  if (deleteAccountBtn) { deleteAccount().catch((error) => showError(error.message)); return; }
  const prefButton = event.target.closest("[data-pref-add]");
  if (prefButton) { addPreference(prefButton.dataset.prefAdd).catch((error) => showError(error.message)); return; }
  const searchButton = event.target.closest("#friendSearchButton");
  if (searchButton) { searchFriends().catch((error) => showError(error.message)); return; }
  const showPastFormButton = event.target.closest("#showPastActivityForm");
  if (showPastFormButton) { document.querySelector("#pastActivityForm")?.classList.toggle("is-hidden"); return; }
  const savePastButton = event.target.closest("#savePastActivityButton");
  if (savePastButton) { savePastActivity().catch((error) => showError(error.message)); }
});

pageDemo.addEventListener("change", (event) => { if (event.target.id === "profilePictureInput") { updateProfilePicture(event.target.files?.[0]).catch((error) => showError(error.message)); } });
pageDemo.addEventListener("keydown", (event) => { if (event.key === "Enter" && event.target.id === "friendSearchInput") { event.preventDefault(); searchFriends().catch((error) => showError(error.message)); } });

document.addEventListener("click", (event) => {
  if (!event.target.closest(".profile-wrap")) { profileMenu.classList.add("is-hidden"); }
});

memberRow.addEventListener("click", (event) => {
  const button = event.target.closest("[data-username]");
  if (!button) return;
  state.activePage = `profile:${button.dataset.username}`;
  navigate("/profile/" + encodeURIComponent(button.dataset.username));
});

noButton.addEventListener("click", () => vote("no").catch((error) => showError(error.message)));
maybeButton.addEventListener("click", () => vote("maybe").catch((error) => showError(error.message)));
yesButton.addEventListener("click", () => vote("yes").catch((error) => showError(error.message)));
backChoiceButton.addEventListener("click", () => goBackChoice().catch((error) => showError(error.message)));
reviewButton.addEventListener("click", () => { goBackChoice().catch((error) => showError(error.message)); });
suggestionButton.addEventListener("click", () => getAiSuggestions().catch((error) => showError(error.message)));
[languageButton, appLanguageButton].forEach((button) => { button.addEventListener("click", toggleLanguage); });

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

groupInput.addEventListener("keydown", (event) => { if (event.key === "Enter") createGroup().catch((error) => showError(error.message)); });
codeInput.addEventListener("input", () => { codeInput.value = codeInput.value.replace(/\D/g, "").slice(0, 8); });
codeInput.addEventListener("keydown", (event) => { if (event.key === "Enter") joinGroup().catch((error) => showError(error.message)); });

boot().catch((error) => showError(error.message));

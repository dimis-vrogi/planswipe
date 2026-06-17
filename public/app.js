const state = {
  user: JSON.parse(localStorage.getItem("planswipe:user") || "null"),
  groupCode: localStorage.getItem("planswipe:groupCode") || "",
  group: null,
  areas: [],
  types: [],
  index: 0,
  pollTimer: null,
  notifTimer: null,
  chatTimer: null,
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
  friendsDataLoaded: false,
  friendsData: null,
  aiToggle: false,
  chatOpen: false,
  chatLastTimestamp: null,
  pollErrorCount: 0
};

// ====== DOM REFERENCES ======
const setupPanel           = document.querySelector("#setupPanel");
const groupPanel           = document.querySelector("#groupPanel");
const statusPanel          = document.querySelector("#statusPanel");
const decisionPanel        = document.querySelector("#decisionPanel");
const swipeLayout          = document.querySelector("#swipeLayout");
const resultsPanel         = document.querySelector("#resultsPanel");
const pagePanel            = document.querySelector("#pagePanel");
const modeButtons          = document.querySelector("#modeButtons");
const createForm           = document.querySelector("#createForm");
const joinForm             = document.querySelector("#joinForm");
const groupInput           = document.querySelector("#groupInput");
const codeInput            = document.querySelector("#codeInput");
const showCreateButton     = document.querySelector("#showCreateButton");
const showJoinButton       = document.querySelector("#showJoinButton");
const backFromCreateButton = document.querySelector("#backFromCreateButton");
const backFromJoinButton   = document.querySelector("#backFromJoinButton");
const createButton         = document.querySelector("#createButton");
const joinButton           = document.querySelector("#joinButton");
const resetButton          = document.querySelector("#resetButton");
const reviewButton         = document.querySelector("#reviewButton");
const groupName            = document.querySelector("#groupName");
const groupCode            = document.querySelector("#groupCode");
const memberRow            = document.querySelector("#memberRow");
const decisionStep         = document.querySelector("#decisionStep");
const decisionTitle        = document.querySelector("#decisionTitle");
const decisionHint         = document.querySelector("#decisionHint");
const optionGrid           = document.querySelector("#optionGrid");
const backChoiceButton     = document.querySelector("#backChoiceButton");
const searchSummary        = document.querySelector("#searchSummary");
const activityCard         = document.querySelector("#activityCard");
const activityPhoto        = document.querySelector("#activityPhoto");
const activityCategory     = document.querySelector("#activityCategory");
const activityTitle        = document.querySelector("#activityTitle");
const activityDescription  = document.querySelector("#activityDescription");
const activityArea         = document.querySelector("#activityArea");
const activityTime         = document.querySelector("#activityTime");
const activityCost         = document.querySelector("#activityCost");
const noButton             = document.querySelector("#noButton");
const maybeButton          = document.querySelector("#maybeButton");
const yesButton            = document.querySelector("#yesButton");
const resultList           = document.querySelector("#resultList");
const loginPanel           = document.querySelector("#loginPanel");
const loginForm            = document.querySelector("#loginForm");
const heroLoginButton      = document.querySelector("#heroLoginButton");
const heroEnterButton      = document.querySelector("#heroEnterButton");
const loginUsername        = document.querySelector("#loginUsername");
const loginEmail           = document.querySelector("#loginEmail");
const loginPassword        = document.querySelector("#loginPassword");
const loginButton          = document.querySelector("#loginButton");
const registerButton       = document.querySelector("#registerButton");
const logoutButton         = document.querySelector("#logoutButton");
const topbar               = document.querySelector("#topbar");
const profileButton        = document.querySelector("#profileButton");
const profileMenu          = document.querySelector("#profileMenu");
const profileInitial       = document.querySelector("#profileInitial");
const notificationBadge    = document.querySelector("#notificationBadge");
const pageEyebrow          = document.querySelector("#pageEyebrow");
const pageTitle            = document.querySelector("#pageTitle");
const pageDemo             = document.querySelector("#pageDemo");
const closePageButton      = document.querySelector("#closePageButton");
const languageButton       = document.querySelector("#languageButton");
const appLanguageButton    = document.querySelector("#appLanguageButton");
const suggestionButton     = document.querySelector("#suggestionButton");
const suggestionPanel      = document.querySelector("#suggestionPanel");
const homeButton           = document.querySelector("#homeButton");
const forgotPasswordButton = document.querySelector("#forgotPasswordButton");

// ====== I18N ======
const optionTranslations = {
  el: {
    northsuburbs: { label: "Βόρεια προάστια",  description: "Χαλάνδρι, Μαρούσι, Κηφισιά και γειτονικές περιοχές." },
    athenscenter: { label: "Κέντρο Αθηνών",    description: "Σύνταγμα, Μοναστηράκι, Ψυρρή και κεντρικές περιοχές." },
    southsuburbs: { label: "Νότια προάστια",    description: "Φλοίσβος, Γλυφάδα, Άλιμος και η παραλιακή πλευρά." },
    restaurant:    { label: "Εστιατόρια",        description: "Βγαίνουμε για φαγητό, πιτσαρία ή επιλογές που ξεκινούν με φαγητό." },
    gaming:        { label: "Παιχνίδια",         description: "Μπόουλινγκ, escape rooms, arcades και διασκεδαστικές δραστηριότητες." },
    bars:          { label: "Μπαρ",              description: "Cocktail bars, wine bars, pubs και νυχτερινά μέρη." },
    movies:        { label: "Ταινίες",           description: "Σινεμά, θερινά σινεμά, προβολές ταινιών." },
    addArea:        "Προσθήκη περιοχής",
    addActivity:    "Προσθήκη δραστηριότητας",
    addAreaText:    "Πρότεινε άλλη γειτονιά ή μέρος.",
    addActivityText:"Πρότεινε άλλο είδος δραστηριότητας.",
    addOwn:         "Πρόσθεσε δικό σου",
    liveChoices:    "Ζωντανές επιλογές"
  }
};

function translateOption(kind, optionId) {
  if (state.language !== "el") return null;
  return optionTranslations.el[optionId] || null;
}

function t(key) {
  return copy[state.language]?.[key] ?? copy.en[key] ?? key;
}

const copy = {
  en: {
    login: "Login", createAccount: "Create Account", enterPlanswipe: "Enter PlanSwipe",
    groupPlans: "Group plans", leaveGroup: "Exit Group", exitGroup: "Back",
    home: "Home", likedPlaces: "Liked Places", groups: "My Groups", friends: "Friends",
    past: "Past Activities", personal: "Personal Information", settings: "Settings", logout: "Logout",
    heroEyebrow: "Group plans made easier",
    heroTitle: "Find the plan your group can actually agree on.",
    heroDescription: "Pick the basics together, swipe through nearby ideas, and let PlanSwipe surface the places your friends are most likely to enjoy.",
    heroNote: "Built for group chats that never decide.",
    whatPlanswipeIs: "What PlanSwipe is",
    sharedDecisionTool: "A shared decision tool for real plans",
    offerText: "Instead of long group chats, everyone chooses the basics, swipes through options, and sees which activities have the strongest support.",
    agreeFaster: "Agree faster", agreeFasterText: "Pick an area and activity type together before looking at suggestions.",
    discoverOptions: "Discover options", discoverOptionsText: "Use sample ideas or Google Places results when the API key is configured.",
    voteAsGroup: "Vote as a group", voteAsGroupText: "Mark activities as No, Maybe, or Yes and compare support instantly.",
    dinnerNearSea: "Dinner near the sea", glyfadaTaverna: "Glyfada seafood taverna",
    seeWhatFriendsThink: "See what your friends think about this.", findSimilar: "Find similar places",
    startPlanning: "Start planning with your group",
    startPlanningText: "Choose whether you are creating a new group or joining one that already exists.",
    createGroup: "Create Group", createGroupText: "Pick a group name and get a new 8-digit code.",
    joinGroup: "Join Group", joinGroupText: "Enter the 8-digit code from a friend.",
    groupName: "Group name", groupCodeLabel: "8-digit group code", back: "Back",
    currentGroup: "Current group", stepArea: "Step 1 of 2", stepType: "Step 2 of 2",
    areaTitle: "Where do you want to go?", typeTitle: "What kind of activity do you want?",
    decisionHint: "Everyone needs to vote before the group moves on.",
    addArea: "Add area", addActivity: "Add activity",
    addAreaText: "Suggest a different neighborhood or place.",
    addActivityText: "Suggest a different activity type.",
    addOwn: "Add your own", liveChoices: "Live choices",
    resultsTitle: "What you can do", aiSuggestions: "AI Suggestions",
    changeBasics: "Change basics", noStrongChoice: "No strong choice yet",
    keepSwiping: "Keep swiping or wait for the rest of the group.",
    noFriends: "No friends yet", searchByUsername: "Search by username", search: "Search",
    requests: "Requests", saveProfile: "Save Profile", age: "Age", bio: "Bio",
    preferences: "Preferences", logPastActivity: "Log Past Activity",
    area: "Area", activity: "Activity", place: "Place", saveActivity: "Save Activity",
    suggestedPlaces: "Suggested places", noLikedPlaces: "No liked places yet",
    notifications: "Notifications", friendRequestNotif: "Friend request alerts",
    groupInviteNotif: "Group invite alerts", privacy: "Privacy",
    showOnlineStatus: "Show online status", showProfilePublicly: "Show profile publicly",
    saveSettings: "Save Settings", settingsSaved: "Settings saved",
    deleteAccount: "Delete Account",
    deleteAccountConfirm: "Are you sure you want to permanently delete your account? This cannot be undone.",
    deleteAccountSuccess: "Account deleted successfully.",
    removeFriend: "Remove Friend", removeFriendConfirm: "Remove this friend?",
    activeGroups: "Active Groups", pastGroups: "Past Groups",
    noActiveGroups: "No active groups", noPastGroups: "No past groups",
    you: "you", friends: "Friends", requestSent: "Request sent",
    noPending: "No pending requests", inboxClear: "No notifications",
    noPastActivities: "No past activities yet",
    continueBrowsing: "Would you like to continue browsing places?",
    noMoreSuggestions: "No more suggestions available", aiGenerating: "Getting AI suggestions…",
    exitGroupPermanent: "Exit Group Permanently",
    confirmExitGroup: "Are you sure you want to permanently leave this group?",
    accountManagement: "Account Management",
    choiceNo: "No", choiceMaybe: "Maybe", choiceYes: "Yes",
    searchFrom: "Search from", searchGooglePlaces: "Google Places",
    searchSample: "sample data", searchCustom: "custom group idea",
    areaSelected: "Area agreed! Now vote on an activity type.",
    fridayCrew: "Friday crew",
    forgotPassword: "Forgot Password?", username: "Username", email: "Email", password: "Password",
    oldPassword: "Old password", newPassword: "New password", verifyPassword: "Verify new password",
    changePassword: "Change Password", passwordChanged: "Password changed successfully",
    passwordMismatch: "New passwords do not match",
    editProfilePicture: "Edit profile picture",
    bioPlaceholder: "Tell friends what kind of plans you like.",
    favouriteAreas: "Favourite Areas", favouriteActivities: "Favourite Activities",
    favouritePlaces: "Favourite Places",
    addAnotherArea: "Add another area", addAnotherActivity: "Add another activity",
    addAnotherPlace: "Add another place",
    groupChat: "Group Chat", sendMessage: "Send", messagePlaceholder: "Type a message…",
    closeChat: "Close", waitingForOthers: "Waiting for others to vote…",
    voted: "voted", of: "of", aiToggleOn: "AI suggestions will be used",
    aiToggleOff: "Sample places will be used", aiToggleLabel: "AI Suggestions mode"
  },
  el: {
    login: "Σύνδεση", createAccount: "Δημιουργία λογαριασμού",
    enterPlanswipe: "Είσοδος στο PlanSwipe",
    groupPlans: "Ομαδικά σχέδια", leaveGroup: "Έξοδος από ομάδα", exitGroup: "Πίσω",
    home: "Αρχική", likedPlaces: "Αρεστά μέρη", groups: "Οι ομάδες μου", friends: "Φίλοι",
    past: "Παλιές δραστηριότητες", personal: "Προσωπικά στοιχεία",
    settings: "Ρυθμίσεις", logout: "Αποσύνδεση",
    heroEyebrow: "Ομαδικά σχέδια πιο εύκολα",
    heroTitle: "Βρείτε το σχέδιο που η παρέα σας μπορεί να συμφωνήσει.",
    heroDescription: "Επιλέξτε τα βασικά μαζί, κάντε swipe σε κοντινές ιδέες και αφήστε το PlanSwipe να αναδείξει τα μέρη που θα απολαύσει η παρέα.",
    heroNote: "Για ομαδικές συνομιλίες που ποτέ δεν αποφασίζουν.",
    whatPlanswipeIs: "Τι είναι το PlanSwipe",
    sharedDecisionTool: "Ένα εργαλείο κοινών αποφάσεων",
    offerText: "Αντί για ατελείωτες ομαδικές συζητήσεις, όλοι επιλέγουν τα βασικά, κάνουν swipe σε επιλογές και βλέπουν ποιες δραστηριότητες έχουν τη μεγαλύτερη υποστήριξη.",
    agreeFaster: "Συμφωνήστε πιο γρήγορα",
    agreeFasterText: "Επιλέξτε περιοχή και είδος μαζί πριν δείτε προτάσεις.",
    discoverOptions: "Ανακαλύψτε επιλογές",
    discoverOptionsText: "Χρησιμοποιήστε δείγματα ή αποτελέσματα Google Places όταν ρυθμιστεί το API key.",
    voteAsGroup: "Ψηφίστε ως ομάδα",
    voteAsGroupText: "Σημειώστε δραστηριότητες ως Όχι, Ίσως ή Ναι και συγκρίνετε άμεσα.",
    dinnerNearSea: "Βραδινό δίπλα στη θάλασσα", glyfadaTaverna: "Ψαροταβέρνα Γλυφάδας",
    seeWhatFriendsThink: "Δείτε τι πιστεύουν οι φίλοι σας.", findSimilar: "Βρείτε παρόμοια μέρη",
    startPlanning: "Ξεκινήστε τον προγραμματισμό με την ομάδα σας",
    startPlanningText: "Διαλέξτε αν θέλετε να δημιουργήσετε νέα ομάδα ή να μπείτε σε υπάρχουσα.",
    createGroup: "Δημιουργία ομάδας",
    createGroupText: "Επιλέξτε όνομα ομάδας και λάβετε έναν νέο 8ψήφιο κωδικό.",
    joinGroup: "Συμμετοχή σε ομάδα",
    joinGroupText: "Εισάγετε τον 8ψήφιο κωδικό από έναν φίλο.",
    groupName: "Όνομα ομάδας", groupCodeLabel: "8ψήφιος κωδικός ομάδας", back: "Πίσω",
    currentGroup: "Τρέχουσα ομάδα", stepArea: "Βήμα 1 από 2", stepType: "Βήμα 2 από 2",
    areaTitle: "Πού θέλετε να πάτε;", typeTitle: "Τι είδους δραστηριότητα θέλετε;",
    decisionHint: "Όλοι πρέπει να ψηφίσουν πριν προχωρήσει η ομάδα.",
    addArea: "Προσθήκη περιοχής", addActivity: "Προσθήκη δραστηριότητας",
    addAreaText: "Προτείνετε άλλη γειτονιά ή περιοχή.",
    addActivityText: "Προτείνετε άλλο είδος δραστηριότητας.",
    addOwn: "Πρόσθεσε δικό σου", liveChoices: "Ζωντανές επιλογές",
    resultsTitle: "Τι μπορείτε να κάνετε", aiSuggestions: "Προτάσεις AI",
    changeBasics: "Αλλαγή βασικών", noStrongChoice: "Δεν υπάρχει ακόμα δυνατή επιλογή",
    keepSwiping: "Συνεχίστε το swipe ή περιμένετε την υπόλοιπη ομάδα.",
    noFriends: "Δεν έχετε ακόμα φίλους",
    searchByUsername: "Αναζήτηση με όνομα χρήστη", search: "Αναζήτηση",
    requests: "Αιτήματα", saveProfile: "Αποθήκευση προφίλ",
    age: "Ηλικία", bio: "Βιογραφικό", preferences: "Προτιμήσεις",
    logPastActivity: "Καταχώρηση δραστηριότητας",
    area: "Περιοχή", activity: "Δραστηριότητα", place: "Μέρος",
    saveActivity: "Αποθήκευση δραστηριότητας",
    suggestedPlaces: "Προτεινόμενα μέρη", noLikedPlaces: "Δεν υπάρχουν ακόμα αρεστά μέρη",
    notifications: "Ειδοποιήσεις", friendRequestNotif: "Ειδοποιήσεις αιτημάτων φιλίας",
    groupInviteNotif: "Ειδοποιήσεις προσκλήσεων", privacy: "Απόρρητο",
    showOnlineStatus: "Εμφάνιση online κατάστασης", showProfilePublicly: "Δημόσιο προφίλ",
    saveSettings: "Αποθήκευση ρυθμίσεων", settingsSaved: "Οι ρυθμίσεις αποθηκεύτηκαν",
    deleteAccount: "Διαγραφή Λογαριασμού",
    deleteAccountConfirm: "Είστε σίγουροι ότι θέλετε να διαγράψετε τον λογαριασμό; Αυτή η ενέργεια είναι μιατή.",
    deleteAccountSuccess: "Ο λογαριασμός διαγράφηκε επιτυχώς.",
    removeFriend: "Αφαίρεση φίλου", removeFriendConfirm: "Να αφαιρεθεί αυτός ο φίλος;",
    activeGroups: "Ενεργές ομάδες", pastGroups: "Παλιές ομάδες",
    noActiveGroups: "Δεν υπάρχουν ενεργές ομάδες", noPastGroups: "Δεν υπάρχουν παλιές ομάδες",
    you: "εσείς", friends: "Φίλοι", requestSent: "Το αίτημα στάλθηκε",
    noPending: "Δεν υπάρχουν εκκρεμή αιτήματα", inboxClear: "Δεν υπάρχουν ειδοποιήσεις",
    noPastActivities: "Δεν υπάρχουν ακόμα παλιές δραστηριότητες",
    continueBrowsing: "Θέλετε να συνεχίσετε να βλέπετε μέρη;",
    noMoreSuggestions: "Δεν υπάρχουν άλλες προτάσεις", aiGenerating: "Λήψη προτάσεων AI…",
    exitGroupPermanent: "Μόνιμη έξοδος από ομάδα",
    confirmExitGroup: "Είστε σίγουροι ότι θέλετε να φύγετε μόνιμα;",
    accountManagement: "Διαχείριση Λογαριασμού",
    choiceNo: "Όχι", choiceMaybe: "Ίσως", choiceYes: "Ναι",
    searchFrom: "Αναζήτηση από", searchGooglePlaces: "Google Places",
    searchSample: "δείγματα δεδομένων", searchCustom: "προσαρμοσμένη ιδέα",
    areaSelected: "Συμφωνήθηκε περιοχή! Τώρα ψηφίστε για δραστηριότητα.",
    fridayCrew: "Παρέα Παρασκευής",
    forgotPassword: "Ξεχάσατε τον κωδικό;",
    username: "Όνομα χρήστη", email: "Email", password: "Κωδικός",
    oldPassword: "Παλιός κωδικός", newPassword: "Νέος κωδικός",
    verifyPassword: "Επιβεβαίωση νέου κωδικού",
    changePassword: "Αλλαγή κωδικού", passwordChanged: "Ο κωδικός αλλάχτηκε επιτυχώς",
    passwordMismatch: "Οι νέοι κωδικοί δεν ταιριάζουν",
    editProfilePicture: "Επεξεργασία φωτογραφίας προφίλ",
    bioPlaceholder: "Πείτε στους φίλους τι σχέδια σας αρέσουν.",
    favouriteAreas: "Αγαπημένες περιοχές", favouriteActivities: "Αγαπημένες δραστηριότητες",
    favouritePlaces: "Αγαπημένα μέρη",
    addAnotherArea: "Προσθήκη άλλης περιοχής",
    addAnotherActivity: "Προσθήκη άλλης δραστηριότητας",
    addAnotherPlace: "Προσθήκη άλλου μέρους",
    groupChat: "Ομαδική Συνομιλία", sendMessage: "Αποστολή",
    messagePlaceholder: "Γράψε μήνυμα…", closeChat: "Κλείσιμο",
    waitingForOthers: "Αναμονή για ψήφους…", voted: "ψήφισε", of: "από",
    aiToggleOn: "Θα χρησιμοποιηθούν AI προτάσεις",
    aiToggleOff: "Θα χρησιμοποιηθούν δείγματα", aiToggleLabel: "Λειτουργία AI προτάσεων"
  }
};

// ====== LANGUAGE ======
function applyLanguage() {
  document.documentElement.lang = state.language;
  languageButton.textContent    = state.language === "en" ? "EL" : "EN";
  appLanguageButton.textContent = state.language === "en" ? "EL" : "EN";
  heroLoginButton.textContent   = t("login");
  heroEnterButton.textContent   = t("enterPlanswipe");
  loginButton.textContent       = t("login");
  registerButton.textContent    = t("createAccount");
  loginForm.querySelector("h2").textContent = t("enterPlanswipe");

  const heroCopy = document.querySelector(".hero-copy");
  if (heroCopy) {
    const eyb  = heroCopy.querySelector(".eyebrow");        if (eyb)  eyb.textContent  = t("heroEyebrow");
    const h1   = heroCopy.querySelector("h1");              if (h1)   h1.textContent   = t("heroTitle");
    const desc = heroCopy.querySelector(".hero-description"); if (desc) desc.textContent = t("heroDescription");
    const span = heroCopy.querySelector(".hero-actions span"); if (span) span.textContent = t("heroNote");
  }

  const previewDiv = document.querySelector(".preview-card div");
  if (previewDiv) {
    const p  = previewDiv.querySelector("p");    if (p)  p.textContent  = t("dinnerNearSea");
    const h2 = previewDiv.querySelector("h2");   if (h2) h2.textContent = t("glyfadaTaverna");
    const sp = previewDiv.querySelector("span"); if (sp) sp.textContent = t("seeWhatFriendsThink");
  }
  const previewStack = document.querySelector(".preview-stack span");
  if (previewStack) previewStack.textContent = t("findSimilar");

  const offerSection = document.querySelector(".offer-section");
  if (offerSection) {
    const eyb = offerSection.querySelector(".eyebrow");  if (eyb) eyb.textContent = t("whatPlanswipeIs");
    const h2  = offerSection.querySelector("h2");        if (h2)  h2.textContent  = t("sharedDecisionTool");
    const p   = offerSection.querySelector("p");         if (p)   p.textContent   = t("offerText");
    const arts = offerSection.querySelectorAll(".offer-grid article");
    [["agreeFaster","agreeFasterText"],["discoverOptions","discoverOptionsText"],["voteAsGroup","voteAsGroupText"]]
      .forEach(([hKey, pKey], i) => {
        if (!arts[i]) return;
        const h3 = arts[i].querySelector("h3"); if (h3) h3.textContent = t(hKey);
        const pp = arts[i].querySelector("p");  if (pp) pp.textContent = t(pKey);
      });
  }

  const topbarEyb = document.querySelector(".topbar .eyebrow");
  if (topbarEyb) topbarEyb.textContent = t("groupPlans");
  resetButton.textContent       = t("leaveGroup");
  closePageButton.textContent   = t("exitGroup");
  suggestionButton.textContent  = t("aiSuggestions");
  reviewButton.textContent      = t("changeBasics");

  const setupH2 = document.querySelector("#setupPanel h2");
  if (setupH2) setupH2.textContent = t("startPlanning");
  const setupP  = document.querySelector("#setupPanel .setup-intro p");
  if (setupP)  setupP.textContent  = t("startPlanningText");

  if (showCreateButton) {
    const s = showCreateButton.querySelector("strong"); if (s) s.textContent = t("createGroup");
    const p = showCreateButton.querySelector("span");   if (p) p.textContent = t("createGroupText");
  }
  if (showJoinButton) {
    const s = showJoinButton.querySelector("strong"); if (s) s.textContent = t("joinGroup");
    const p = showJoinButton.querySelector("span");   if (p) p.textContent = t("joinGroupText");
  }

  const cfs = createForm.querySelector(".field span"); if (cfs) cfs.textContent = t("groupName");
  groupInput.placeholder = t("fridayCrew");
  const jfs = joinForm.querySelector(".field span");   if (jfs) jfs.textContent = t("groupCodeLabel");
  createButton.textContent       = t("createGroup");
  joinButton.textContent         = t("joinGroup");
  backFromCreateButton.textContent = t("back");
  backFromJoinButton.textContent   = t("back");
  homeButton.textContent         = t("home");
  noButton.textContent           = t("choiceNo");
  maybeButton.textContent        = t("choiceMaybe");
  yesButton.textContent          = t("choiceYes");

  profileMenu.querySelectorAll("button[data-page]").forEach((btn) => {
    const k = btn.dataset.page;
    btn.textContent = t(k === "likedplaces" ? "likedPlaces" : k);
  });
  logoutButton.textContent = t("logout");

  const rEyb = document.querySelector(".results-panel .eyebrow");
  if (rEyb) rEyb.textContent = t("liveChoices");
  const rH2 = document.querySelector(".results-panel h2");
  if (rH2 && rH2.id !== "groupName") rH2.textContent = t("resultsTitle");

  // Update chat UI strings if open
  const chatTitle = document.querySelector("#chatTitle");
  if (chatTitle) chatTitle.textContent = t("groupChat");
  const chatInput = document.querySelector("#chatMessageInput");
  if (chatInput) chatInput.placeholder = t("messagePlaceholder");
  const chatSend = document.querySelector("#chatSendButton");
  if (chatSend) chatSend.textContent = t("sendMessage");
}

function toggleLanguage() {
  state.language = state.language === "en" ? "el" : "en";
  localStorage.setItem("planswipe:language", state.language);
  applyLanguage();
  renderApp();
}

// ====== UTILITY ======
function setVisible(el, visible) { el.classList.toggle("is-hidden", !visible); }
function isLoggedIn()    { return Boolean(localStorage.getItem("planswipe:login")); }
function currentUsername() { return localStorage.getItem("planswipe:login") || ""; }

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function validEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim()); }
function initials(name) {
  return String(name || "").trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("");
}

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (state.supabaseSession?.access_token) headers.Authorization = `Bearer ${state.supabaseSession.access_token}`;
  const response = await fetch(path, { headers, ...options, body: options.body ? JSON.stringify(options.body) : undefined });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

// ====== AUTH ======
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
      state.supabaseClient.auth.onAuthStateChange((e, session) => { state.supabaseSession = session || null; });
    }
  } catch (e) { console.warn(e.message); }
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
    profileInitial.style.backgroundImage = url("${user.profile.picture}");
    profileInitial.textContent = "";
  } else {
    profileInitial.style.backgroundImage = "";
    profileInitial.textContent = initials(user?.username || currentUsername()) || "P";
  }
}

async function loadAccount() {
  if (!isLoggedIn()) return null;
  const data = await api(/api/account?username=${encodeURIComponent(currentUsername())}&viewer=${encodeURIComponent(currentUsername())});
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
    state.loginOpen = false; navigate("/main"); return;
  }
  const data = await api("/api/login", { method: "POST", body: { username: loginUsername.value, email: loginEmail.value, password: loginPassword.value } });
  setLoggedIn(data.username, data.email || loginEmail.value.trim());
  saveAccount({ username: data.username, email: data.email || loginEmail.value.trim(), profile: data.profile });
  loginUsername.value = ""; loginEmail.value = ""; loginPassword.value = "";
  state.loginOpen = false; navigate("/main");
}

async function registerUser() {
  const username = loginUsername.value.trim();
  const email    = loginEmail.value.trim();
  const password = loginPassword.value;
  if (!validEmail(email)) throw new Error("Enter a valid email address.");
  if (state.supabaseClient) {
    const { data, error } = await state.supabaseClient.auth.signUp({ email, password, options: { data: { username } } });
    if (error) throw new Error(error.message);
    state.supabaseSession = data.session;
    if (!data.session) { alert("Check your email to confirm your account, then log in."); return; }
    await syncSupabaseProfile(username, data.user.email || email);
    loginUsername.value = ""; loginEmail.value = ""; loginPassword.value = "";
    state.loginOpen = false; navigate("/main"); return;
  }
  const data = await api("/api/register", { method: "POST", body: { username, email, password } });
  setLoggedIn(data.username || username, data.email || email);
  saveAccount({ username: data.username || username, email: data.email || email, profile: data.profile });
  loginUsername.value = ""; loginEmail.value = ""; loginPassword.value = "";
  state.loginOpen = false; navigate("/main");
}

// ====== GROUP STATE HELPERS ======
function selected(kind)        { return state.group?.choices?.[kind]?.[state.user?.id] || null; }
function consensus(kind)       { return state.group?.consensus?.[kind] || null; }
function memberCount()         { return state.group?.members?.length || 1; }
function optionsFor(kind)      { return state.group?.options?.[kind] || (kind === "area" ? state.areas : state.types); }
function optionScore(kind, id) { return state.group?.counts?.[kind]?.[id] || 0; }

// ====== RENDER ======
function renderMembers() {
  memberRow.innerHTML = (state.group.members || []).map((m) => 
    <button class="member-chip" type="button" data-username="${escapeHtml(m.username || m.name)}">
      <span class="avatar">${m.profile?.picture
        ? <img src="${escapeHtml(m.profile.picture)}" alt="">
        : escapeHtml(initials(m.name))}</span>
      ${escapeHtml(m.name)}${m.id === state.user.id ?  (${t("you")}) : ""}
    </button>).join("");
}

function renderSetup() {
  setVisible(modeButtons,  !state.setupMode);
  setVisible(createForm,   state.setupMode === "create");
  setVisible(joinForm,     state.setupMode === "join");
}

function renderDecisionStep(kind) {
  const isAreaStep = kind === "area";
  const options    = optionsFor(kind);
  const chosen     = selected(kind);
  const total      = memberCount();
  const votedCount = Object.keys(state.group?.choices?.[kind] || {}).length;

  decisionStep.textContent  = isAreaStep ? t("stepArea") : t("stepType");
  decisionTitle.textContent = isAreaStep ? t("areaTitle") : t("typeTitle");

  if (votedCount > 0 && votedCount < total) {
    decisionHint.textContent = ${votedCount} ${t("of")} ${total} ${t("voted")} — ${t("waitingForOthers")};
  } else {
    decisionHint.textContent = t("decisionHint");
  }

  setVisible(backChoiceButton, kind === "type" || Boolean(chosen));

  // AI toggle — CSS-driven, no setInterval (#11 fix)
  if (isAreaStep) {
    if (!document.querySelector(".ai-toggle-row")) {
      const row = document.createElement("div");
      row.className = "ai-toggle-row";
      row.innerHTML = 
        <span class="ai-toggle-label">${t("aiToggleLabel")}</span>
        <label class="css-toggle">
          <input type="checkbox" id="aiToggleCheckbox" ${state.aiToggle ? "checked" : ""}>
          <span class="css-toggle-track"><span class="css-toggle-knob"></span></span>
        </label>
        <span class="ai-toggle-desc" id="aiToggleDesc">${state.aiToggle ? t("aiToggleOn") : t("aiToggleOff")}</span>;
      const ref = decisionPanel.querySelector(".option-grid") || decisionPanel.querySelector(".decision-header")?.nextSibling;
      if (ref) {
        decisionPanel.insertBefore(row, ref);
      } else {
        decisionPanel.appendChild(row);
      }
      row.querySelector("#aiToggleCheckbox").addEventListener("change", (e) => {
        state.aiToggle = e.target.checked;
        const toggleDesc = document.querySelector("#aiToggleDesc");
        if (toggleDesc) toggleDesc.textContent = state.aiToggle ? t("aiToggleOn") : t("aiToggleOff");
      });
    }
  } else {
    document.querySelector(".ai-toggle-row")?.remove();
  }

  // Build option cards — guard against empty options array
  if (!options || options.length === 0) {
    optionGrid.innerHTML = <p style="color:var(--muted);padding:12px;">${t("decisionHint")}</p>;
    return;
  }

  const optionCards = options.map((option) => {
    const score      = optionScore(kind, option.id);
    const isSelected = chosen === option.id;
    const translated = translateOption(kind, option.id);
    const label       = translated?.label       ?? option.label       ?? option.id;
    const description = translated?.description ?? option.description ?? "";
    return <button class="option-card${isSelected ? " is-selected" : ""}" type="button"
        data-kind="${escapeHtml(kind)}" data-id="${escapeHtml(option.id)}">
      <span class="option-score">${score}/${total} ${t("liveChoices")}</span>
      <span><h3>${escapeHtml(label)}</h3><p>${escapeHtml(description)}</p></span>
    </button>;
  }).join("");

  const addOwn   = state.language === "el" ? optionTranslations.el.addOwn    : t("addOwn");
  const addLabel = state.language === "el"
    ? (isAreaStep ? optionTranslations.el.addArea    : optionTranslations.el.addActivity)
    : (isAreaStep ? t("addArea")    : t("addActivity"));
  const addText  = state.language === "el"
    ? (isAreaStep ? optionTranslations.el.addAreaText : optionTranslations.el.addActivityText)
    : (isAreaStep ? t("addAreaText") : t("addActivityText"));

  optionGrid.innerHTML = ${optionCards}
    <button class="option-card add-option-card" type="button" data-kind="${escapeHtml(kind)}" data-custom="true">
      <span class="option-score">${escapeHtml(addOwn)}</span>
      <span><h3>${escapeHtml(addLabel)}</h3><p>${escapeHtml(addText)}</p></span>
    </button>;
}

function renderCard() {
  const places = [...(state.group.places || []), ...(state.aiPlacesBatch || [])];
  const place  = places[state.index];
  if (!place) { setVisible(swipeLayout, false); setVisible(resultsPanel, true); renderResults(); return; }
  activityCard.classList.remove("swipe-yes", "swipe-no");
  activityPhoto.src               = place.photoUrl || "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80";
  activityPhoto.alt               = place.title;
  activityCategory.textContent    = ${place.category} | ${Number(place.rating || 4).toFixed(1)} ★;
  activityTitle.textContent       = place.title;
  activityDescription.textContent = place.description;
  activityArea.textContent        = place.areaLabel;
  activityTime.textContent        = place.time;
  activityCost.textContent        = place.cost;
  noButton.textContent    = t("choiceNo");
  maybeButton.textContent = t("choiceMaybe");
  yesButton.textContent   = t("choiceYes");
}

function renderResults() {
  const allPlaces = [...(state.group.places || []), ...(state.aiPlacesBatch || [])];
  if (!allPlaces.length) {
    resultList.innerHTML = <article class="result-card"><div class="result-icon"></div><div><h3>${t("noStrongChoice")}</h3><p>${t("keepSwiping")}</p></div><strong class="result-score">0%</strong></article>;
    return;
  }
  const votesByPlace = {};
  Object.values(state.group.votes || {}).forEach((userVotes) => {
    Object.entries(userVotes).forEach(([placeId, vote]) => {
      const v = vote === true ? "yes" : vote === false ? "no" : vote;
      if (!votesByPlace[placeId]) votesByPlace[placeId] = { yes: 0, maybe: 0, no: 0 };
      if (v === "yes") votesByPlace[placeId].yes++;
      else if (v === "maybe") votesByPlace[placeId].maybe++;
      else votesByPlace[placeId].no++;
    });
  });
  const total  = state.group.members.length || 1;
  const ranked = allPlaces
    .map((p) => {
      const v = votesByPlace[p.id] || { yes: 0, maybe: 0, no: 0 };
      const percent = Math.round((v.yes / total)  100);
      return { ...p, ...v, total, percent };
    })
    .filter((p) => p.yes > 0 || p.maybe > 0)
    .sort((a, b) => b.percent - a.percent || b.yes - a.yes || b.maybe - a.maybe);

  if (!ranked.length) {
    resultList.innerHTML = <article class="result-card"><div class="result-icon"></div><div><h3>${t("noStrongChoice")}</h3><p>${t("keepSwiping")}</p></div><strong class="result-score">0%</strong></article>;
    return;
  }

  resultList.innerHTML = ranked.map((item) => 
    <article class="result-card">
      <img class="result-icon" src="${escapeHtml(item.photoUrl)}" alt="">
      <div><h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.areaLabel)} | ${escapeHtml(item.category)} | ${item.yes}/${item.total} yes, ${item.maybe || 0} maybe</p></div>
      <strong class="result-score">${item.percent}%</strong>
    </article>).join("");

  const existingBtn = document.querySelector("#continueBrowseBtn");
  if (state.aiPlacesBatch.length > 0 && !existingBtn) {
    resultList.insertAdjacentHTML("afterend", <button class="continue-button" id="continueBrowseBtn">${t("continueBrowsing")}</button>);
    document.querySelector("#continueBrowseBtn").addEventListener("click", loadMoreAiSuggestions);
  } else if (!state.aiPlacesBatch.length && existingBtn) {
    existingBtn.remove();
  }
}

function renderStatus() {
  if (!state.group) { setVisible(statusPanel, false); return; }
  setVisible(statusPanel, true);
  const areaReady = consensus("area");
  const typeReady = consensus("type");
  if (!areaReady) { statusPanel.textContent = t("decisionHint"); return; }
  if (!typeReady) { statusPanel.textContent = t("areaSelected"); return; }
  const src = state.group.search?.source;
  const sourceLabel = src === "google" ? t("searchGooglePlaces") : src === "custom" ? t("searchCustom") : t("searchSample");
  statusPanel.textContent = ${t("searchFrom")} ${sourceLabel}: "${state.group.search?.query || ""}";
}

// ====== GROUP CHAT ======
function ensureChatButton() {
  if (document.querySelector("#chatFab")) return;
  const fab = document.createElement("button");
  fab.id        = "chatFab";
  fab.className = "chat-fab";
  fab.setAttribute("aria-label", t("groupChat"));
  fab.innerHTML = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span id="chatUnreadBadge" class="chat-unread-badge is-hidden"></span>;
  document.body.appendChild(fab);
  fab.addEventListener("click", toggleChat);
}

function removeChatButton() {
  document.querySelector("#chatFab")?.remove();
  document.querySelector("#chatOverlay")?.remove();
  clearInterval(state.chatTimer);
  state.chatTimer = null;
  state.chatOpen  = false;
}

function toggleChat() {
  state.chatOpen = !state.chatOpen;
  if (state.chatOpen) {
    openChatPanel();
  } else {
    document.querySelector("#chatOverlay")?.remove();
  }
}

function openChatPanel() {
  document.querySelector("#chatOverlay")?.remove();

  const overlay = document.createElement("div");
  overlay.id        = "chatOverlay";
  overlay.className = "chat-overlay";
  overlay.innerHTML = 
    <div class="chat-panel" id="chatPanel">
      <div class="chat-header">
        <span id="chatTitle">${escapeHtml(t("groupChat"))} — ${escapeHtml(state.group?.name || "")}</span>
        <button class="chat-close-btn" id="chatCloseBtn" aria-label="${t("closeChat")}">✕</button>
      </div>
      <div class="chat-messages" id="chatMessages"><div class="chat-loading">…</div></div>
      <div class="chat-input-row">
        <input id="chatMessageInput" type="text" maxlength="500"
               placeholder="${escapeHtml(t("messagePlaceholder"))}" autocomplete="off">
        <button id="chatSendButton" class="btn-primary">${t("sendMessage")}</button>
      </div>
    </div>;
  document.body.appendChild(overlay);

  overlay.querySelector("#chatCloseBtn").addEventListener("click", () => {
    state.chatOpen = false;
    overlay.remove();
    clearInterval(state.chatTimer);
    state.chatTimer = null;
  });

  const input   = overlay.querySelector("#chatMessageInput");
  const sendBtn = overlay.querySelector("#chatSendButton");

  sendBtn.addEventListener("click", () => sendChatMessage(input));
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") sendChatMessage(input); });

  // Dismiss on backdrop click
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      state.chatOpen = false;
      overlay.remove();
      clearInterval(state.chatTimer);
      state.chatTimer = null;
    }
  });

  loadChatMessages(true);
  // Poll for new messages every 3 seconds while chat is open
  clearInterval(state.chatTimer);
  state.chatTimer = setInterval(() => { if (state.chatOpen) loadChatMessages(false); }, 3000);
}

async function loadChatMessages(scrollToBottom) {
  if (!state.groupCode) return;
  const container = document.querySelector("#chatMessages");
  if (!container) return;
  try {
    const params = state.chatLastTimestamp
      ? ?since=${encodeURIComponent(state.chatLastTimestamp)}
      : "";
    const data = await api(/api/groups/${state.groupCode}/messages${params});
    const messages = data.messages || [];

    if (messages.length === 0 && !state.chatLastTimestamp) {
      container.innerHTML = <div class="chat-empty">No messages yet. Say hello!</div>;
      return;
    }

    if (messages.length > 0) {
      state.chatLastTimestamp = messages[messages.length - 1].createdat;
      // Remove placeholder
      const loading = container.querySelector(".chat-loading, .chat-empty");
      if (loading) loading.remove();

      const me = currentUsername();
      messages.forEach((msg) => {
        const isMine = msg.username === me;
        const bubble = document.createElement("div");
        bubble.className = `chat-bubble ${isMine ? "chat-bubble-mine" : "chat-bubble-theirs"}`;
        bubble.innerHTML = ${!isMine ? <span class="chat-sender">${escapeHtml(msg.username)}</span> : ""}
          <span class="chat-text">${escapeHtml(msg.message)}</span>;
        container.appendChild(bubble);
      });

      if (scrollToBottom || true) {
        container.scrollTop = container.scrollHeight;
      }

      // Clear unread badge since user is looking at chat
      const badge = document.querySelector("#chatUnreadBadge");
      if (badge) badge.classList.add("is-hidden");
    }
  } catch (e) {
    console.warn("Chat load error:", e.message);
  }
}

async function sendChatMessage(input) {
  const message = (input?.value || "").trim();
  if (!message || !state.groupCode) return;
  input.value    = "";
  input.disabled = true;
  try {
    await api(/api/groups/${state.groupCode}/messages, {
      method: "POST",
      body:   { username: currentUsername(), message }
    });
    // Reset last timestamp to get the latest message immediately
    // (server returns the inserted row, but we re-fetch for consistency)
    await loadChatMessages(true);
  } catch (e) {
    showError(e.message);
  } finally {
    input.disabled = false;
    input.focus();
  }
}

// ====== NOTIFICATIONS ======
async function refreshNotifications() {
  if (!isLoggedIn()) return;
  try {
    const data = await api(/api/notifications?username=${encodeURIComponent(currentUsername())});
    state.notifications = data;
    const badge = notificationBadge;
    if (data.total > 0) {
      badge.textContent = data.total > 99 ? "99+" : String(data.total);
      badge.classList.remove("is-hidden");
    } else {
      badge.classList.add("is-hidden");
    }
    profileMenu.querySelectorAll("button[data-page]").forEach((btn) => {
      btn.classList.remove("has-notif");
      btn.querySelector(".notif-count")?.remove();
      let count = 0;
      if (btn.dataset.page === "friends") count = data.friendRequests || 0;
      if (count > 0) {
        btn.classList.add("has-notif");
        const sp = document.createElement("span");
        sp.className   = "notif-count";
        sp.textContent = (${count});
        btn.appendChild(sp);
      }
    });
  } catch (e) { console.warn("Notifications refresh error:", e.message); }
}

// ====== ROUTING ======
function currentRoute() {
  const p = window.location.pathname;
  return (p === "/" || p === "") ? "/home" : p;
}

function navigate(path) {
  history.pushState({}, "", path);
  onUrlChange();
}

function onUrlChange() {
  const route = currentRoute();

  if (!isLoggedIn()) {
    if (route !== "/home") history.replaceState({}, "", "/home");
    state.showHero  = true;
    state.activePage = "";
    state.loginOpen  = false;
    renderApp(); return;
  }

  if (route === "/home") {
    state.showHero = true; state.activePage = ""; renderApp(); return;
  }
  if (route === "/main") {
    state.showHero = false; state.activePage = ""; renderApp(); return;
  }

  const pageMatch = route.match(/^\/(groups|friends|likedplaces|past|personal|settings)$/);
  if (pageMatch) {
    state.showHero = false; state.activePage = pageMatch[1]; renderApp(); return;
  }

  const profileMatch = route.match(/^\/profile\/(.+)$/);
  if (profileMatch) {
    state.showHero = false;
    state.activePage = "profile:" + decodeURIComponent(profileMatch[1]);
    renderApp(); return;
  }

  navigate("/home");
}

// ====== MAIN RENDER ======
function hideAppPanels() {
  setVisible(setupPanel,    false);
  setVisible(groupPanel,    false);
  setVisible(statusPanel,   false);
  setVisible(decisionPanel, false);
  setVisible(swipeLayout,   false);
  setVisible(resultsPanel,  false);
}

function renderApp() {
  if (!isLoggedIn()) {
    setVisible(loginPanel, true);
    setVisible(loginForm,  state.loginOpen);
    setVisible(topbar,     false);
    setVisible(pagePanel,  false);
    setVisible(heroEnterButton, false);
    setVisible(heroLoginButton, true);
    hideAppPanels();
    removeChatButton();
    return;
  }

  if (state.showHero) {
    setVisible(loginPanel, true);
    setVisible(loginForm,  false);
    setVisible(topbar,     false);
    setVisible(pagePanel,  false);
    setVisible(heroEnterButton, true);
    setVisible(heroLoginButton, false);
    hideAppPanels();
    removeChatButton();
    // Ensure the hero button navigates to /main
    const heroActions = document.querySelector(".hero-actions");
    if (heroActions && !document.querySelector("#heroBackButton")) {
      heroActions.innerHTML = <button class="btn-primary" id="heroBackButton" type="button">${t("enterPlanswipe")}</button> <span>${t("heroNote")}</span>;
      document.querySelector("#heroBackButton").addEventListener("click", () => navigate("/main"));
    }
    return;
  }

  setVisible(loginPanel, false);
  setVisible(topbar,     true);

  if (state.account?.profile?.picture) {
    profileInitial.style.backgroundImage = url("${state.account.profile.picture}");
    profileInitial.textContent = "";
  } else {
    profileInitial.style.backgroundImage = "";
    profileInitial.textContent = initials(currentUsername()) || "P";
  }

  setVisible(resetButton, Boolean(state.group && state.user));
  await refreshNotifications();

  // Page panel (profile sub-pages)
  if (state.activePage) {
    hideAppPanels();
    setVisible(pagePanel, true);
    renderProfilePage();
    removeChatButton();
    return;
  }

  setVisible(pagePanel, false);

  // No group yet — show setup
  if (!state.group || !state.user) {
    setVisible(setupPanel,    true);
    setVisible(groupPanel,    false);
    setVisible(statusPanel,   false);
    setVisible(decisionPanel, false);
    setVisible(swipeLayout,   false);
    setVisible(resultsPanel,  false);
    renderSetup();
    removeChatButton();
    return;
  }

  // Inside a group
  groupName.textContent = state.group.name;
  groupCode.textContent = state.group.code;
  renderMembers();
  renderStatus();
  setVisible(setupPanel, false);
  setVisible(groupPanel, true);
  ensureChatButton();

  const areaReady = consensus("area");
  const typeReady = consensus("type");

  if (!areaReady) {
    setVisible(decisionPanel, true);
    setVisible(swipeLayout,   false);
    setVisible(resultsPanel,  false);
    renderDecisionStep("area");
    return;
  }

  if (!typeReady) {
    setVisible(decisionPanel, true);
    setVisible(swipeLayout,   false);
    setVisible(resultsPanel,  false);
    renderDecisionStep("type");
    return;
  }

  // Both agreed — show places
  searchSummary.textContent = ${t("searchFrom")}: "${state.group.search?.query || ""}";
  setVisible(decisionPanel, false);
  setVisible(resultsPanel,  true);
  renderResults();

  const totalPlaces = [...(state.group.places || []), ...(state.aiPlacesBatch || [])];
  if (state.index < totalPlaces.length) {
    setVisible(swipeLayout, true);
    renderCard();
  } else {
    setVisible(swipeLayout, false);
  }
}

// ====== GROUP POLLING ======
async function refreshGroup() {
  if (!state.groupCode) return;
  try {
    const data = await api(/api/groups/${state.groupCode});
    state.group          = data.group;
    state.pollErrorCount = 0;
    renderApp();
  } catch (error) {
    state.pollErrorCount = (state.pollErrorCount || 0) + 1;
    // Only leave the group after 5 consecutive failures (not a transient glitch)
    if (state.pollErrorCount >= 5) {
      showError(error.message);
      leaveGroup();
    }
  }
}

function startPolling() {
  clearInterval(state.pollTimer);
  clearInterval(state.notifTimer);
  state.pollTimer  = setInterval(refreshGroup,          1500);
  state.notifTimer = setInterval(refreshNotifications,  5000);
}

function saveSession(user, group) {
  state.user       = user;
  state.group      = group;
  state.groupCode  = group.code;
  state.setupMode  = "";
  state.index      = 0;
  state.aiPlacesBatch = [];
  state.pollErrorCount = 0;
  localStorage.setItem("planswipe:user",      JSON.stringify(user));
  localStorage.setItem("planswipe:groupCode", group.code);
  startPolling();
  renderApp();
}

// ====== GROUP ACTIONS ======
async function createGroup() {
  const username = currentUsername() || "Friend";
  const data = await api("/api/groups", {
    method: "POST",
    body:   { username, profile: state.account?.profile, groupName: groupInput.value.trim() }
  });
  saveSession(data.user, data.group);
}

async function joinGroup() {
  const username = currentUsername() || "Friend";
  const code     = codeInput.value.trim();
  if (!/^\d{8}$/.test(code)) { showError("Enter an 8-digit group code."); return; }
  const data = await api(/api/groups/${code}/join, {
    method: "POST",
    body:   { username, profile: state.account?.profile }
  });
  saveSession(data.user, data.group);
}

async function chooseOption(kind, optionId, customLabel = "") {
  const data = await api(/api/groups/${state.group.code}/choice, {
    method: "POST",
    body:   { userId: state.user.id, kind, optionId, customLabel }
  });
  state.index = 0;
  state.group = data.group;
  renderApp();
}

async function goBackChoice() {
  if (!state.group || !state.user) return;
  // If area is agreed but type is not — go back to type step
  // If neither or going back from area — reset area
  const step = (consensus("area") && !consensus("type")) ? "type" : "area";
  const data = await api(/api/groups/${state.group.code}/back, {
    method: "POST",
    body:   { userId: state.user.id, step }
  });
  state.index = 0;
  state.group = data.group;
  renderApp();
}

async function vote(value) {
  const totalPlaces = [...(state.group.places || []), ...(state.aiPlacesBatch || [])];
  const place       = totalPlaces[state.index];
  if (!place) return;
  activityCard.classList.add(value === "yes" ? "swipe-yes" : "swipe-no");
  const data = await api(/api/groups/${state.group.code}/vote, {
    method: "POST",
    body:   { userId: state.user.id, placeId: place.id, vote: value }
  });
  state.group = data.group;
  setTimeout(() => { state.index += 1; renderApp(); }, 170);
}

function leaveGroup() {
  clearInterval(state.pollTimer);
  clearInterval(state.notifTimer);
  removeChatButton();
  state.user = null; state.group = null; state.groupCode = "";
  state.index = 0; state.setupMode = ""; state.aiPlacesBatch = [];
  state.pollErrorCount = 0;
  localStorage.removeItem("planswipe:user");
  localStorage.removeItem("planswipe:groupCode");
  renderApp();
}

function logout() {
  if (state.supabaseClient) state.supabaseClient.auth.signOut().catch((e) => console.warn(e.message));
  state.supabaseSession = null;
  leaveGroup();
  state.activePage = ""; state.loginOpen = false; state.showHero = false;
  localStorage.removeItem("planswipe:login");
  localStorage.removeItem("planswipe:email");
  localStorage.removeItem("planswipe:account");
  state.account = null;
  navigate("/home");
}

// ====== AI SUGGESTIONS ======
async function loadMoreAiSuggestions() {
  if (!state.group) return;
  const areaId = state.group.consensus?.area || Object.values(state.group.choices?.area || {})[0];
  const typeId = state.group.consensus?.type || Object.values(state.group.choices?.type || {})[0];
  if (!areaId || !typeId) { showError("Choose an area and activity first."); return; }
  const areaLabel = state.group.options?.area?.find((o) => o.id === areaId)?.label || "";
  const typeLabel = state.group.options?.type?.find((o) => o.id === typeId)?.label || "";
  if (!areaLabel || !typeLabel) return;
  try {
    const data = await api("/api/suggestions", {
      method: "POST",
      body:   { username: currentUsername(), area: areaLabel, activity: typeLabel }
    });
    if (!data.suggestions?.length) { showError(t("noMoreSuggestions")); return; }
    const newPlaces = data.suggestions.map((s, i) => ({
      id:          ai${Date.now()}${i},
      title:       s.place || "Suggestion",
      category:    typeLabel,
      areaLabel,
      description: s.reason || "AI suggested place",
      time:        "Anytime",
      cost:        "$$",
      rating:      4,
      photoUrl:    "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80"
    }));
    state.group.places = [...(state.group.places || []), ...newPlaces];
    state.index = state.group.places.length - newPlaces.length;
    document.querySelector(".continue-button")?.remove();
    renderApp();
  } catch (e) { showError(e.message); }
}

function selectedOptionLabel(kind, optionId) {
  return optionsFor(kind).find((o) => o.id === optionId)?.label || optionId || "";
}

async function getAiSuggestions() {
  if (!state.group) return;
  const areaId = consensus("area") || selected("area");
  const typeId = consensus("type") || selected("type");
  if (!areaId || !typeId) { showError("Choose an area and activity first."); return; }
  setVisible(suggestionPanel, true);
  suggestionPanel.innerHTML = <p>${t("aiGenerating")}</p>;
  const data = await api("/api/suggestions", {
    method: "POST",
    body:   { username: currentUsername(), area: selectedOptionLabel("area", areaId), activity: selectedOptionLabel("type", typeId) }
  });
  const suggestions = data.suggestions || [];
  if (suggestions.length > 0) {
    const newPlaces = suggestions.map((s, i) => ({
      id:          ai${Date.now()}${i},
      title:       s.place || "Suggestion",
      category:    selectedOptionLabel("type", typeId),
      areaLabel:   selectedOptionLabel("area", areaId),
      description: s.reason || "AI suggested place",
      time:        "Anytime",
      cost:        "$$",
      rating:      4,
      photoUrl:    "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80"
    }));
    state.aiPlacesBatch  = newPlaces;
    state.group.places   = [...(state.group.places || []), ...newPlaces];
    state.index          = state.group.places.length - newPlaces.length;
    renderApp();
  }
  suggestionPanel.innerHTML = <h3>${t("suggestedPlaces")}</h3>
    <div class="suggestion-list">${suggestions.map((item) =>
      <article class="suggestion-card">
        <h4>${escapeHtml(item.place || item.name || "Suggestion")}</h4>
        <p>${escapeHtml(item.reason || item.description || "")}</p>
      </article>).join("")}</div>;
}

// ====== PAGE PANEL RENDERS ======
const pageContent = {
  likedplaces: { title: "Liked Places",          eyebrow: "History"  },
  groups:      { title: "My Groups",             eyebrow: "Groups"   },
  friends:     { title: "Friends",               eyebrow: "People"   },
  past:        { title: "Past Activities",        eyebrow: "History"  },
  personal:    { title: "Personal Information",   eyebrow: "Profile"  },
  settings:    { title: "Settings",               eyebrow: "Account"  }
};

function preferenceList(title, key, items, placeholder) {
  const readonly = key.startsWith("readonly-");
  return <div class="preference-box">
    <h3>${escapeHtml(title)}</h3>
    <div class="pill-row">${(items || []).map((item) => <span class="preference-pill">${escapeHtml(item)}</span>).join("") || <span class="muted-text">Nothing saved yet.</span>}</div>
    ${!readonly ? <div class="inline-add"><input type="text" data-pref-input="${escapeHtml(key)}" placeholder="${escapeHtml(placeholder)}"><button type="button" data-pref-add="${escapeHtml(key)}">Add</button></div> : ""}
  </div>;
}

function profileImage(user, sizeClass = "profile-preview") {
  const picture = user?.profile?.picture || "";
  if (picture) return <span class="${sizeClass} image-avatar" style="background-image:url('${escapeHtml(picture)}')"></span>;
  return <span class="${sizeClass}">${escapeHtml(initials(user?.username || currentUsername()) || "P")}</span>;
}

async function renderPersonalInformation() {
  const account    = await loadAccount();
  const profile    = account.profile || {};
  const preferences = profile.preferences || {};
  pageDemo.innerHTML = 
    <form class="personal-form">
      <section>
        <h3>${t("personal")}</h3>
        <label class="profile-upload">${profileImage(account)}<span>${t("editProfilePicture")}</span>
          <input id="profilePictureInput" type="file" accept="image/"></label>
        <label class="field"><span>${t("username")}</span>
          <input type="text" value="${escapeHtml(account.username)}" disabled></label>
        <label class="field"><span>${t("email")}</span>
          <input type="email" value="${escapeHtml(account.email || "")}" disabled></label>
        <label class="field"><span>${t("age")}</span>
          <input id="profileAge" type="number" min="13" max="120" value="${escapeHtml(profile.age || "")}"></label>
        <label class="field"><span>${t("password")}</span>
          <input id="profileOldPassword"    type="password" placeholder="${t("oldPassword")}">
          <input id="profileNewPassword"    type="password" placeholder="${t("newPassword")}">
          <input id="profileVerifyPassword" type="password" placeholder="${t("verifyPassword")}">
          <button class="btn-ghost" type="button" id="changePasswordButton">${t("changePassword")}</button>
        </label>
        <label class="field"><span>${t("bio")}</span>
          <textarea id="profileBio" rows="3" placeholder="${t("bioPlaceholder")}">${escapeHtml(profile.bio || "")}</textarea>
        </label>
        <button class="btn-primary" type="button" id="saveProfileButton">${t("saveProfile")}</button>
      </section>
      <section>
        <h3>${t("preferences")}</h3>
        ${preferenceList(t("favouriteAreas"),      "areas",      preferences.areas,      t("addAnotherArea"))}
        ${preferenceList(t("favouriteActivities"), "activities", preferences.activities, t("addAnotherActivity"))}
        ${preferenceList(t("favouritePlaces"),     "places",     preferences.places,     t("addAnotherPlace"))}
      </section>
    </form>;
}

function userCard(user, action = "") {
  const preferences   = user.profile?.preferences || {};
  const preferenceText = [...(preferences.areas || []), ...(preferences.activities || []), ...(preferences.places || [])].slice(0, 4).join(", ");
  return <article class="demo-card user-card">
    <div class="user-card-head">${profileImage(user, "small-profile-preview")}
      <div><h3>${escapeHtml(user.username)}</h3><p>${escapeHtml(user.profile?.bio || "")}</p></div>
    </div>
    <p>${escapeHtml(preferenceText || "")}</p>
    ${action}
  </article>;
}

async function renderFriendsPage() {
  pageDemo.innerHTML = 
    <section class="wide-panel">
      <div class="inline-add">
        <input id="friendSearchInput" type="text" placeholder="${t("searchByUsername")}">
        <button id="friendSearchButton" type="button">${t("search")}</button>
      </div>
      <div id="friendSearchResults" class="demo-grid"></div>
    </section>
    <section class="wide-panel"><h3>${t("friends")}</h3><div id="friendList" class="demo-grid"></div></section>
    <section class="wide-panel"><h3>${t("requests")}</h3><div id="requestList" class="demo-grid"></div></section>;
  await refreshFriendsPage();
}

async function refreshFriendsPage() {
  const data       = await api(/api/friends?username=${encodeURIComponent(currentUsername())});
  state.friendsData = data;
  state.friendsDataLoaded = true;
  const friendList  = document.querySelector("#friendList");
  const requestList = document.querySelector("#requestList");
  if (!friendList || !requestList) return;

  friendList.innerHTML = data.friends.length
    ? data.friends.map((u) => userCard(u, <button class="btn-ghost" type="button" data-view-profile="${escapeHtml(u.username)}">${t("personal")}</button>)).join("")
    : <article class="demo-card"><h3>${t("noFriends")}</h3><p>${t("searchByUsername")}</p></article>;

  const allRequests = [
    ...data.incoming.map((u) => userCard(u, <button class="btn-primary" type="button" data-accept-friend="${escapeHtml(u.username)}">Accept</button>)),
    ...data.outgoing.map((u) => userCard(u, <span class="request-status">${t("requestSent")}</span>))
  ];
  requestList.innerHTML = allRequests.length
    ? allRequests.join("")
    : <article class="demo-card"><h3>${t("noPending")}</h3></article>;
}

async function renderGroupsPage() {
  const data       = await api(/api/groups/mine?username=${encodeURIComponent(currentUsername())});
  const allGroups  = data.groups || [];
  const exitedCodes = state.exitedGroups || [];
  const active = allGroups.filter((g) => !exitedCodes.includes(g.code));
  const past   = allGroups.filter((g) =>  exitedCodes.includes(g.code));

  let html = <h3 class="group-section-title">${t("activeGroups")}</h3>;
  html += active.length
    ? active.map((g) => 
        <article class="group-card">
          <h3>${escapeHtml(g.name)}</h3>
          <p class="group-meta">Code ${escapeHtml(g.code)} | ${g.memberCount} member${g.memberCount === 1 ? "" : "s"}</p>
          <div class="group-actions">
            <button class="btn-primary"   type="button" data-open-group="${escapeHtml(g.code)}">Open</button>
            <button class="danger-button" type="button" data-exit-group="${escapeHtml(g.code)}">${t("exitGroupPermanent")}</button>
          </div>
        </article>).join("")
    : <article class="demo-card"><h3>${t("noActiveGroups")}</h3></article>;

  html += <h3 class="group-section-title">${t("pastGroups")}</h3>;
  html += past.length
    ? past.map((g) => 
        <article class="group-card">
          <h3>${escapeHtml(g.name)}</h3>
          <p class="group-meta">Code ${escapeHtml(g.code)} | ${t("pastGroups")}</p>
        </article>).join("")
    : <article class="demo-card"><h3>${t("noPastGroups")}</h3></article>;

  pageDemo.innerHTML = html;
}

async function renderLikedPlacesPage() {
  pageEyebrow.textContent = t("likedPlaces");
  pageTitle.textContent   = t("likedPlaces");
  try {
    const data   = await api(/api/liked-places?username=${encodeURIComponent(currentUsername())});
    const places = data.places || [];
    pageDemo.innerHTML = places.length
      ? places.map((item) => 
          <div class="liked-place-card">
            <h3>${escapeHtml(item.place)}</h3>
            <p>${escapeHtml(item.area)} | ${escapeHtml(item.activity)}</p>
            <span class="vote-tag ${escapeHtml(item.vote)}">${escapeHtml(item.vote)}</span>
            <span class="group-meta">${escapeHtml(item.groupName || "")}</span>
          </div>).join("")
      : <article class="demo-card"><h3>${t("noLikedPlaces")}</h3></article>;
  } catch (e) {
    console.warn("Liked places load error:", e.message);
    pageDemo.innerHTML = `<article class="demo-card"><h3>${t("noLikedPlaces")}</h3></article>`;
  }
}

async function renderPastPage() {
  const account    = await loadAccount();
  const activities = account.profile?.pastActivities || [];
  pageDemo.innerHTML = 
    <section class="wide-panel">
      <button class="btn-primary" type="button" id="showPastActivityForm">${t("logPastActivity")}</button>
      <form class="setup-form is-hidden" id="pastActivityForm">
        <label class="field"><span>${t("area")}</span>     <input id="pastAreaInput"     type="text" placeholder="Athens seaside"></label>
        <label class="field"><span>${t("activity")}</span> <input id="pastActivityInput" type="text" placeholder="Dinner"></label>
        <label class="field"><span>${t("place")}</span>    <input id="pastPlaceInput"    type="text" placeholder="Restaurant name"></label>
        <button class="btn-primary" type="button" id="savePastActivityButton">${t("saveActivity")}</button>
      </form>
    </section>
    ${activities.length
      ? activities.map((a) => <article class="demo-card"><h3>${escapeHtml(a.place)}</h3><p>${escapeHtml(a.area)} | ${escapeHtml(a.activity)}</p></article>).join("")
      : <article class="demo-card"><h3>${t("noPastActivities")}</h3></article>};
}

async function savePastActivity() {
  const area     = document.querySelector("#pastAreaInput")?.value.trim();
  const activity = document.querySelector("#pastActivityInput")?.value.trim();
  const place    = document.querySelector("#pastPlaceInput")?.value.trim();
  if (!area || !activity || !place) { showError("Area, activity, and place are required."); return; }
  const profile       = state.account?.profile || {};
  const pastActivities = [{ area, activity, place, loggedAt: Date.now() }, ...(profile.pastActivities || [])].slice(0, 50);
  const data = await api("/api/account", { method: "PATCH", body: { username: currentUsername(), profile: { ...profile, pastActivities } } });
  saveAccount(data.user);
  await renderPastPage();
}

async function renderAccountProfile(username) {
  const data = await api(/api/account?username=${encodeURIComponent(username)}&viewer=${encodeURIComponent(currentUsername())});
  const user = data.user;
  const preferences = user.profile?.preferences || {};
  pageEyebrow.textContent = t("personal");
  pageTitle.textContent   = user.username;

  const friendAction = user.username === currentUsername()
    ? ""
    : user.friendStatus === "friends"
      ? <span class="request-status">${t("friends")}</span>
      : user.friendStatus === "incoming"
        ? <button class="btn-primary" type="button" data-accept-friend="${escapeHtml(user.username)}">Accept Request</button>
        : user.friendStatus === "requested"
          ? <span class="request-status">${t("requestSent")}</span>
          : <button class="btn-primary" type="button" data-add-friend="${escapeHtml(user.username)}">Add Friend</button>;

  const removeAction = user.friendStatus === "friends" && user.username !== currentUsername()
    ? <button class="danger-button" type="button" data-remove-friend="${escapeHtml(user.username)}">${t("removeFriend")}</button>
    : "";

  pageDemo.innerHTML = 
    ${userCard(user, friendAction)}
    ${removeAction ? <section class="wide-panel">${removeAction}</section> : ""}
    <section class="wide-panel">
      <h3>${t("preferences")}</h3>
      ${preferenceList(t("favouriteAreas"),      "readonly-areas",       preferences.areas,      "")}
      ${preferenceList(t("favouriteActivities"), "readonly-activities",  preferences.activities, "")}
      ${preferenceList(t("favouritePlaces"),     "readonly-places",      preferences.places,     "")}
    </section>;
}

async function renderSettingsPage() {
  const settings = state.account?.profile?.settings || {};
  pageEyebrow.textContent = t("settings");
  pageTitle.textContent   = t("settings");
  pageDemo.innerHTML = 
    <section class="wide-panel personal-form">
      <h3>${t("notifications")}</h3>
      <div class="settings-toggle"><label for="notifFriendReq">${t("friendRequestNotif")}</label>
        <input type="checkbox" id="notifFriendReq" ${settings.friendRequestNotif !== false ? "checked" : ""}></div>
      <div class="settings-toggle"><label for="notifGroupInvite">${t("groupInviteNotif")}</label>
        <input type="checkbox" id="notifGroupInvite" ${settings.groupInviteNotif !== false ? "checked" : ""}></div>
    </section>
    <section class="wide-panel personal-form">
      <h3>${t("privacy")}</h3>
      <div class="settings-toggle"><label for="privacyOnline">${t("showOnlineStatus")}</label>
        <input type="checkbox" id="privacyOnline" ${settings.showOnlineStatus !== false ? "checked" : ""}></div>
      <div class="settings-toggle"><label for="privacyPublic">${t("showProfilePublicly")}</label>
        <input type="checkbox" id="privacyPublic" ${settings.showProfilePublicly !== false ? "checked" : ""}></div>
    </section>
    <button class="btn-primary" type="button" id="saveSettingsButton">${t("saveSettings")}</button>
    <section class="wide-panel personal-form" style="margin-top:18px;border-top:2px solid var(--red);">
      <h3 style="color:var(--red);">${t("accountManagement")}</h3>
      <button class="danger-button" type="button" id="deleteAccountButton">${t("deleteAccount")}</button>
    </section>`;
}

async function saveSettings() {
  const profile = state.account?.profile || {};
  const data = await api("/api/account", {
    method: "PATCH",
    body:   {
      username: currentUsername(),
      profile: {
        ...profile,
        settings: {
          friendRequestNotif:  document.querySelector("#notifFriendReq")?.checked  !== false,
          groupInviteNotif:    document.querySelector("#notifGroupInvite")?.checked !== false,
          showOnlineStatus:    document.querySelector("#privacyOnline")?.checked    !== false,
          showProfilePublicly: document.querySelector("#privacyPublic")?.checked    !== false
        }
      }
    }
  });
  saveAccount(data.user);
    alert(t("settingsSaved"));
}

async function deleteAccount() {
  if (!confirm(t("deleteAccountConfirm"))) return;
  await api("/api/account/delete", { method: "POST", body: { username: currentUsername() } });
  alert(t("deleteAccountSuccess"));
  logout();
}

function renderProfilePage() {
  const content = pageContent[state.activePage];
  if (!content && !state.activePage.startsWith("profile:")) return;
  if (content) {
    pageEyebrow.textContent = content.eyebrow;
    pageTitle.textContent   = content.title;
  }
  if (state.activePage === "personal")     { renderPersonalInformation().catch((e) => showError(e.message)); return; }
  if (state.activePage === "friends")      { renderFriendsPage().catch((e) => showError(e.message)); return; }
  if (state.activePage === "groups")       { renderGroupsPage().catch((e) => showError(e.message)); return; }
  if (state.activePage === "likedplaces")  { renderLikedPlacesPage().catch((e) => showError(e.message)); return; }
  if (state.activePage === "past")         { renderPastPage().catch((e) => showError(e.message)); return; }
  if (state.activePage === "settings")     { renderSettingsPage().catch((e) => showError(e.message)); return; }
  if (state.activePage.startsWith("profile:")) {
    renderAccountProfile(state.activePage.slice("profile:".length)).catch((e) => showError(e.message));
    return;
  }
}

// ====== PROFILE ACTIONS ======
async function saveProfile() {
  const bio      = document.querySelector("#profileBio")?.value || "";
  const ageValue = document.querySelector("#profileAge")?.value || "";
  const age      = ageValue ? Number(ageValue) : "";
  const profile  = { ...(state.account?.profile || {}), bio, age, preferences: state.account?.profile?.preferences || { areas: [], activities: [], places: [] } };
  const data = await api("/api/account", { method: "PATCH", body: { username: currentUsername(), profile } });
  saveAccount(data.user);
  await renderPersonalInformation();
}

async function addPreference(key) {
  const input = document.querySelector(`[data-pref-input="${key}"]`);
  const value = input?.value.trim();
  if (!value || !["areas", "activities", "places"].includes(key)) return;
  const profile     = state.account?.profile || {};
  const preferences = {
    areas:      [...(profile.preferences?.areas      || [])],
    activities: [...(profile.preferences?.activities || [])],
    places:     [...(profile.preferences?.places     || [])]
  };
  if (!preferences[key].some((item) => item.toLowerCase() === value.toLowerCase())) {
    preferences[key].push(value);
  }
  const data = await api("/api/account", { method: "PATCH", body: { username: currentUsername(), profile: { ...profile, preferences } } });
  saveAccount(data.user);
  await renderPersonalInformation();
}

async function updateProfilePicture(file) {
  if (!file) return;
  const reader  = new FileReader();
  const picture = await new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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
  else await renderAccountProfile(username);
}

async function removeFriend(username) {
  if (!confirm(t("removeFriendConfirm"))) return;
  await api("/api/friends/remove", { method: "POST", body: { username: currentUsername(), friendUsername: username } });
  state.friendsDataLoaded = false;
  await renderFriendsPage();
}

async function searchFriends() {
  const input   = document.querySelector("#friendSearchInput");
  const results = document.querySelector("#friendSearchResults");
  const query   = input?.value.trim() || "";
  if (!results || !query) return;
  const data = await api(`/api/users/search?username=${encodeURIComponent(currentUsername())}&q=${encodeURIComponent(query)}`);
  results.innerHTML = data.users.length
    ? data.users.map((user) => {
        if (user.friendStatus === "friends")   return userCard(user, `<button class="btn-ghost"    type="button" data-view-profile="${escapeHtml(user.username)}">${t("personal")}</button>`);
        if (user.friendStatus === "incoming")  return userCard(user, `<button class="btn-primary"  type="button" data-accept-friend="${escapeHtml(user.username)}">Accept Request</button>`);
        if (user.friendStatus === "requested") return userCard(user, `<span class="request-status">${t("requestSent")}</span>`);
        return userCard(user, `<button class="btn-primary" type="button" data-add-friend="${escapeHtml(user.username)}">Add Friend</button>`);
      }).join("")
    : `<article class="demo-card"><h3>No users found</h3><p>Try another username.</p></article>`;
}

async function exitGroupPermanently(code) {
  if (!confirm(t("confirmExitGroup"))) return;
  await api("/api/groups/exit", { method: "POST", body: { username: currentUsername(), groupCode: code } });
  const exited = state.exitedGroups || [];
  if (!exited.includes(code)) {
    exited.push(code);
    state.exitedGroups = exited;
    localStorage.setItem("planswipe:exitedGroups", JSON.stringify(exited));
  }
  if (state.groupCode === code) leaveGroup();
  await renderGroupsPage();
}

function showError(message) {
  if (!isLoggedIn()) { alert(message); return; }
  setVisible(statusPanel, true);
  statusPanel.textContent = message;
}

function openLogin() {
  state.loginOpen = true;
  renderApp();
  loginUsername.focus();
}

// ====== BOOT ======
async function boot() {
  applyLanguage();
  await configureSupabaseAuth();

  // Handle Supabase email confirmation / OAuth redirect hash
  if (state.supabaseClient && window.location.hash) {
    const hash = window.location.hash;
    if (hash.includes("access_token") || hash.includes("type=signup") || hash.includes("type=recovery")) {
      try {
        const { data, error } = await state.supabaseClient.auth.getSession();
        if (error) throw error;
        state.supabaseSession = data.session;
        if (data.session) {
          const username = data.session.user?.user_metadata?.username || "";
          const email    = data.session.user?.email || "";
          if (username && email) {
            try {
              const user = await syncSupabaseProfile(username, email);
              setLoggedIn(user.username, user.email || email);
              saveAccount(user);
            } catch (_) { console.warn("Auto-login skipped: user not found"); }
          }
        }
        window.location.hash = "";
        history.replaceState(null, "", window.location.pathname);
      } catch (e) { console.warn("Email verification handler:", e.message); }
    }
  }

  // Check stored session is still valid
  if (isLoggedIn() && state.supabaseClient) {
    const { data } = await state.supabaseClient.auth.getSession();
    if (!data.session) {
      // Supabase session expired — clear local storage to force re-login
      localStorage.removeItem("planswipe:login");
      localStorage.removeItem("planswipe:email");
      localStorage.removeItem("planswipe:account");
      state.account = null;
    }
  }

  const options  = await api("/api/options");
  state.areas    = options.areas;
  state.types    = options.types;

  if (isLoggedIn()) await loadAccount().catch(() => null);
  if (isLoggedIn() && state.user && state.groupCode) {
    startPolling();
    await refreshGroup();
    return;
  }

  window.addEventListener("popstate", onUrlChange);

  const path = window.location.pathname;
  if (path === "/" || path === "" || path === "/home") {
    navigate(isLoggedIn() ? "/main" : "/home");
  } else {
    onUrlChange();
  }
}

// ====== EVENT LISTENERS ======
heroEnterButton.addEventListener("click", () => { isLoggedIn() ? navigate("/main") : openLogin(); });
heroLoginButton.addEventListener("click", openLogin);
showCreateButton.addEventListener("click", () => { state.setupMode = "create"; renderApp(); });
showJoinButton.addEventListener("click",   () => { state.setupMode = "join";   renderApp(); });
backFromCreateButton.addEventListener("click", () => { state.setupMode = ""; renderApp(); });
backFromJoinButton.addEventListener("click",   () => { state.setupMode = ""; renderApp(); });
createButton.addEventListener("click", () => createGroup().catch((e) => showError(e.message)));
joinButton.addEventListener("click",   () => joinGroup().catch((e) => showError(e.message)));
loginButton.addEventListener("click",  () => login().catch((e) => showError(e.message)));
registerButton.addEventListener("click", () => registerUser().catch((e) => showError(e.message)));

[loginUsername, loginEmail, loginPassword].forEach((input) => {
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") login().catch((err) => showError(err.message)); });
});

forgotPasswordButton.addEventListener("click", () => {
  const email = loginEmail.value.trim();
  if (!email) { alert("Please enter your email first."); return; }
  if (state.supabaseClient) {
    state.supabaseClient.auth.resetPasswordForEmail(email).catch(console.warn);
    alert(`If "${email}" is registered, a recovery email has been sent.`);
  } else {
    alert("Password reset requires Supabase Auth to be configured.");
  }
});

homeButton.addEventListener("click",   () => navigate("/home"));
resetButton.addEventListener("click",  leaveGroup);
logoutButton.addEventListener("click", logout);

profileButton.addEventListener("click", (e) => {
  e.stopPropagation();
  profileMenu.classList.toggle("is-hidden");
});

profileMenu.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-page]");
  if (btn) {
    state.activePage = btn.dataset.page;
    profileMenu.classList.add("is-hidden");
    const routes = { groups: "/groups", friends: "/friends", likedplaces: "/likedplaces", past: "/past", personal: "/personal", settings: "/settings" };
    navigate(routes[btn.dataset.page] || "/main");
    return;
  }
  if (e.target.closest("#logoutButton")) profileMenu.classList.add("is-hidden");
});

closePageButton.addEventListener("click", () => { state.activePage = ""; navigate("/main"); });

document.addEventListener("click", (e) => {
  if (!e.target.closest(".profile-wrap")) profileMenu.classList.add("is-hidden");
});

memberRow.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-username]");
  if (!btn) return;
  state.activePage = `profile:${btn.dataset.username}`;
  navigate("/profile/" + encodeURIComponent(btn.dataset.username));
});

noButton.addEventListener("click",    () => vote("no").catch((e)    => showError(e.message)));
maybeButton.addEventListener("click", () => vote("maybe").catch((e) => showError(e.message)));
yesButton.addEventListener("click",   () => vote("yes").catch((e)   => showError(e.message)));
backChoiceButton.addEventListener("click", () => goBackChoice().catch((e) => showError(e.message)));
reviewButton.addEventListener("click",     () => goBackChoice().catch((e) => showError(e.message)));
suggestionButton.addEventListener("click", () => getAiSuggestions().catch((e) => showError(e.message)));

[languageButton, appLanguageButton].forEach((btn) => btn.addEventListener("click", toggleLanguage));

optionGrid.addEventListener("click", (e) => {
  const btn = e.target.closest(".option-card");
  if (!btn) return;
  const kind = btn.dataset.kind;
  if (btn.dataset.custom === "true") {
    const label = prompt(kind === "area" ? "Add an area" : "Add an activity");
    if (!label?.trim()) return;
    chooseOption(kind, "", label.trim()).catch((err) => showError(err.message));
    return;
  }
  chooseOption(kind, btn.dataset.id).catch((err) => showError(err.message));
});

groupInput.addEventListener("keydown", (e) => { if (e.key === "Enter") createGroup().catch((err) => showError(err.message)); });
codeInput.addEventListener("input",    () => { codeInput.value = codeInput.value.replace(/\D/g, "").slice(0, 8); });
codeInput.addEventListener("keydown",  (e) => { if (e.key === "Enter") joinGroup().catch((err) => showError(err.message)); });

pageDemo.addEventListener("click", (e) => {
  const addFriendBtn    = e.target.closest("[data-add-friend]");
  if (addFriendBtn)   { requestFriend(addFriendBtn.dataset.addFriend).catch((err) => showError(err.message)); return; }
  const acceptFriendBtn = e.target.closest("[data-accept-friend]");
  if (acceptFriendBtn){ acceptFriend(acceptFriendBtn.dataset.acceptFriend).catch((err) => showError(err.message)); return; }
  const removeFriendBtn = e.target.closest("[data-remove-friend]");
  if (removeFriendBtn){ removeFriend(removeFriendBtn.dataset.removeFriend).catch((err) => showError(err.message)); return; }
  const viewProfileBtn  = e.target.closest("[data-view-profile]");
  if (viewProfileBtn) { state.activePage = `profile:${viewProfileBtn.dataset.viewProfile}`; navigate("/profile/" + encodeURIComponent(viewProfileBtn.dataset.viewProfile)); return; }
  const openGroupBtn    = e.target.closest("[data-open-group]");
  if (openGroupBtn)   { codeInput.value = openGroupBtn.dataset.openGroup; state.activePage = ""; joinGroup().catch((err) => showError(err.message)); return; }
  const exitGroupBtn    = e.target.closest("[data-exit-group]");
  if (exitGroupBtn)   { exitGroupPermanently(exitGroupBtn.dataset.exitGroup).catch((err) => showError(err.message)); return; }
  const saveProfileBtn  = e.target.closest("#saveProfileButton");
  if (saveProfileBtn) { saveProfile().catch((err) => showError(err.message)); return; }
  const saveSettingsBtn = e.target.closest("#saveSettingsButton");
  if (saveSettingsBtn){ saveSettings().catch((err) => showError(err.message)); return; }
  const deleteAccBtn    = e.target.closest("#deleteAccountButton");
  if (deleteAccBtn)   { deleteAccount().catch((err) => showError(err.message)); return; }
  const prefAddBtn      = e.target.closest("[data-pref-add]");
  if (prefAddBtn)     { addPreference(prefAddBtn.dataset.prefAdd).catch((err) => showError(err.message)); return; }
  const friendSearchBtn = e.target.closest("#friendSearchButton");
  if (friendSearchBtn){ searchFriends().catch((err) => showError(err.message)); return; }
  const showPastBtn     = e.target.closest("#showPastActivityForm");
  if (showPastBtn)    { document.querySelector("#pastActivityForm")?.classList.toggle("is-hidden"); return; }
  const savePastBtn     = e.target.closest("#savePastActivityButton");
  if (savePastBtn)    { savePastActivity().catch((err) => showError(err.message)); return; }
  const changePwBtn     = e.target.closest("#changePasswordButton");
  if (changePwBtn) {
    const old    = document.querySelector("#profileOldPassword")?.value;
    const pw     = document.querySelector("#profileNewPassword")?.value;
    const verify = document.querySelector("#profileVerifyPassword")?.value;
    if (!old || !pw || !verify) { showError("Please fill in all password fields."); return; }
    if (pw !== verify)          { showError(t("passwordMismatch")); return; }
    api("/api/change-password", { method: "POST", body: { username: currentUsername(), oldPassword: old, newPassword: pw } })
      .then(() => {
        alert(t("passwordChanged"));
        document.querySelector("#profileOldPassword").value  = "";
        document.querySelector("#profileNewPassword").value  = "";
        document.querySelector("#profileVerifyPassword").value = "";
      })
      .catch((err) => showError(err.message));
    return;
  }
});

pageDemo.addEventListener("change",  (e) => {
  if (e.target.id === "profilePictureInput") updateProfilePicture(e.target.files?.[0]).catch((err) => showError(err.message));
});
pageDemo.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.id === "friendSearchInput") { e.preventDefault(); searchFriends().catch((err) => showError(err.message)); }
});

boot().catch((e) => showError(e.message));

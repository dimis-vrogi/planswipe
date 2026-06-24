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
  notifications: { total: 0, friendRequests: 0, groupInvites: 0, messages: 0, dmMessages: 0 },
  exitedGroups: JSON.parse(localStorage.getItem("planswipe:exitedGroups") || "[]"),
  friendsData: null,
  friendsDataLoaded: false,
  friendsLastRequestCount: -1,
  pageShellRendered: "",
  chatOpen: false,
  chatLastTimestamp: null,
  chatLastReadTimestamp: null,
  chatLoadTimer: null,
  pollErrorCount: 0,
  authMode: "login",
  pendingAreaOption: null,
  useAiSuggestions: localStorage.getItem("planswipe:useAiSuggestions") !== "false",
  selectedBookPlaceId: "",
  returnRoute: "/main",
  votingInProgress: false,
  placesExhausted: false,
  showAgeGroupModal: false,
  showResetPasswordForm: false,
  forgotPasswordMode: false,
  // Personal messaging
  dmChatUsername: "",
  dmChatOtherUsername: "",
  dmMessageTimer: null
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
const favButton            = document.querySelector("#favButton");
const reviewsButton        = document.querySelector("#reviewsButton");
const resultList           = document.querySelector("#resultList");
const resultsSelectedCount = document.querySelector("#resultsSelectedCount");
const inviteToGroupButton  = document.querySelector("#inviteToGroupButton");
const loginPanel           = document.querySelector("#loginPanel");
const loginForm            = document.querySelector("#loginForm");
const heroLoginButton      = document.querySelector("#heroLoginButton");
const heroSignupButton     = document.querySelector("#heroSignupButton");
const heroEnterButton      = document.querySelector("#heroEnterButton");
const loginUsername        = document.querySelector("#loginUsername");
const loginEmail           = document.querySelector("#loginEmail");
const loginPassword        = document.querySelector("#loginPassword");
const passwordStrength     = document.querySelector("#passwordStrength");
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
const continueBrowseButton = document.querySelector("#continueBrowseButton");
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
    addActivityText:"Πρότεινε άλλο είδους δραστηριότητας.",
    addOwn:         "Πρόσθεσε δικό σου",
    liveChoices:    "Ζωντανές επιλογές"
  }
};

optionTranslations.el.north_suburbs = optionTranslations.el.northsuburbs;
optionTranslations.el.athens_center = optionTranslations.el.athenscenter;
optionTranslations.el.south_suburbs = optionTranslations.el.southsuburbs;

function translateOption(kind, optionId) {
  if (state.language !== "el") return null;
  return optionTranslations.el[optionId] || null;
}

function t(key) {
  return copy[state.language]?.[key] ?? copy.en[key] ?? key;
}

const ageGroups = ["<12", "12-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65-74", "75+"];

function passwordScore(password) {
  let score = 0;
  if ((password || "").length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function isStrongPassword(password) {
  return passwordScore(password) >= 3;
}

function renderPasswordStrength() {
  if (!passwordStrength) return;
  const value = loginPassword.value || "";
  const show = state.authMode === "signup" && value.length > 0;
  setVisible(passwordStrength, show);
  if (!show) return;
  const score = passwordScore(value);
  passwordStrength.className = `password-strength ${score >= 4 ? "strong" : score >= 3 ? "ok" : "weak"}`;
  passwordStrength.textContent = score >= 4 ? t("passwordStrong") : score >= 3 ? t("passwordOk") : `${t("passwordWeak")}. ${t("passwordRequirements")}`;
}

function getPreferences() {
  return state.account?.profile?.preferences || { areas: [], activities: [], places: [] };
}

function optionLabel(kind, optionOrId) {
  const option = typeof optionOrId === "string" ? findOption(kind, optionOrId) : optionOrId;
  if (!option) return "";
  const translated = translateOption(kind, option.id);
  return translated?.label ?? option.label ?? option.id ?? "";
}

function findOption(kind, id) {
  return optionsFor(kind).find((o) => o.id === id) || null;
}

const copy = {
  en: {
    login: "Login", createAccount: "Create Account", enterPlanswipe: "Enter PlanSwipe",
    groupPlans: "Group plans", leaveGroup: "Exit Current Group", exitGroup: "Back",
    home: "Home", likedPlaces: "Liked Places", groups: "My Groups", friends: "Friends",
    past: "Past Activities", personal: "Personal Information", settings: "Settings", logout: "Logout",
    messages: "Messages",
    message: "Message",
    heroEyebrow: "Group plans made easier",
    heroTitle: "Find the plan your group can actually agree on.",
    heroDescription: "Pick the basics together, swipe through nearby ideas, and let PlanSwipe surface the places your friends are most likely to enjoy.",
    heroNote: "Built for group chats that never decide.",
    whatPlanswipeIs: "What PlanSwipe is",
    sharedDecisionTool: "A shared decision tool for real plans",
    offerText: "Instead of long group chats, everyone chooses the basics, swipes through options, and sees which activities have the strongest support.",
    agreeFaster: "Agree faster", agreeFasterText: "Everyone picks an area and activity type together. No more endless back-and-forth in the group chat.",
    discoverOptions: "Discover options", discoverOptionsText: "Get real suggestions from Google Maps tailored to your group's area and activity. Browse places you'll actually enjoy.",
    voteAsGroup: "Vote as a group", voteAsGroupText: "Swipe through options and vote No, Maybe, or Yes. See instantly which places have the most support from your friends.",
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
    requests: "Requests", saveProfile: "Save Profile", age: "Age", ageGroup: "Age group", bio: "Bio",
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
    continueBrowsing: "Continue Browsing",
    loadingPlaces: "Loading more places\u2026",
    noMoreSuggestions: "No more places matching your selections. Would you like to change your basics?",
    newGroup: "New Group",
    backToVoting: "Back to Voting",
    exitGroupPermanent: "Exit Group Permanently",
    confirmExitGroup: "Are you sure you want to permanently leave this group?",
    accountManagement: "Account Management",
    choiceNo: "No", choiceMaybe: "Maybe", choiceYes: "Yes",
    searchFrom: "Search from", searchGooglePlaces: "Google Places",
    searchSample: "sample data", searchCustom: "custom group idea",
    areaSelected: "Area agreed! Now vote on an activity type.",
    fridayCrew: "Friday crew",
    forgotPassword: "Recover Password", username: "Username", email: "Email", password: "Password",
    oldPassword: "Old password", newPassword: "New password", verifyPassword: "Verify new password",
    changePassword: "Change Password", passwordChanged: "Password changed successfully",
    passwordMismatch: "New passwords do not match",
    editProfilePicture: "Edit profile picture",
    bioPlaceholder: "Tell friends what kind of plans you like.",
    favouriteAreas: "Favourite Areas", favouriteActivities: "Favourite Activities",
    favouritePlaces: "Favourite Places",
    addAnotherArea: "Add another area", addAnotherActivity: "Add another activity",
    addAnotherPlace: "Add another place", useFavourite: "Use a favourite", selectSpecificArea: "Select a specific area",
    addYourOwnPlace: "Add your Own Place", selectThisPlace: "Select this Place", selectedThisPlace: "Selected",
    bookNow: "Book now", website: "Website", reservations: "Reservations", noBookingDetails: "No website or phone number is available yet.",
    passwordWeak: "Weak password", passwordOk: "Password is OK", passwordStrong: "Strong password",
    passwordRequirements: "Use at least 8 characters with uppercase, lowercase, and a number.",
    ageGroupRequired: "You must first select your age group before entering a group.",
    viewProfile: "View Profile",
    addToFavourites: "Add to Favourites",
    favourited: "Favourited",
    inviteToGroup: "Invite to Group",
    inviteFriends: "Invite friends",
    inviteSelectFriends: "Select in-app friends to invite to this group.",
    inviteSent: "Invites sent!",
    noFriendsToInvite: "Add friends first to invite them to a group.",
    sendInvites: "Send Invites",
    cancel: "Cancel",
    ok: "OK",
    selectedCount: "selected",
    groupChat: "Group Chat", sendMessage: "Send", messagePlaceholder: "Type a message\u2026",
    closeChat: "Close", waitingForOthers: "Waiting for others to vote\u2026",
    voted: "voted", of: "of", aiToggleOn: "AI suggestions will be used",
    aiToggleOff: "Sample places will be used", aiToggleLabel: "AI Suggestions mode",
    subscription: "Subscription", subscribe: "Subscribe",
    free: "Free", pro: "Pro", currentPlan: "Current Plan",
    freePlanDesc: "Basic features for casual groups", proPlanDesc: "Everything you need for serious planning",
    upgradeToPro: "Upgrade to Pro", subscribedThanks: "Thank you for subscribing! You now have access to all Pro features.",
    subscriptionError: "There was an error processing your subscription. Please try again.",
    manageSubscription: "Manage Subscription",
    includedInYourPlan: "Included in your Plan",
    validEmailRequired: "Enter a valid email address.",
    enterGroupCode: "Enter an 8-digit group code.",
    alreadyInFavourites: "Already in your favourites!",
    fieldsRequired: "Area, activity, and place are required.",
    fillPasswordFields: "Please fill in all password fields.",
    noMessagesYet: "No messages yet. Say hello!",
    tryAnotherUsername: "Try another username.",
    confirmEmailCheck: "Check your email to confirm your account, then log in.",
    enterEmailFirst: "Please enter your email first.",
    recoveryEmailSent: 'If "{email}" is registered, a recovery email has been sent.',
    passwordResetRequires: "Password reset requires Supabase Auth to be configured.",
    accept: "Accept",
    decline: "Decline",
    groupInvites: "Group Invites",
    noGroupInvites: "No group invites",
    includedInYourPlanPro: "Included in your Plan",
    nothingSaved: "Nothing saved yet.",
    optional: "optional",
    reviews: "Reviews",
    noReviews: "No reviews available.",
    remove: "Remove",
    confirmRemoveActivity: "Remove this past activity?",
    recoverPassword: "Recover Password",
    newPasswordPlaceholder: "New password",
    confirmPasswordPlaceholder: "Confirm new password",
    resetPassword: "Reset Password",
    passwordResetSuccess: "Password reset successfully! You can now log in.",
    selectedBy: "selected by",
    people: "people",
    person: "person",
    noConversations: "No conversations yet",
    startMessaging: "Add friends and start messaging them.",
    typeMessage: "Type a message..."
  },
  el: {
    login: "Σύνδεση", createAccount: "Δημιουργία λογαριασμού",
    enterPlanswipe: "Είσοδος στο PlanSwipe",
    groupPlans: "Ομαδικά σχέδια", leaveGroup: "Έξοδος από τρέχουσα ομάδα", exitGroup: "Πίσω",
    home: "Αρχική", likedPlaces: "Αρεστά μέρη", groups: "Οι ομάδες μου", friends: "Φίλοι",
    past: "Παλιές δραστηριότητες", personal: "Προσωπικά στοιχεία",
    settings: "Ρυθμίσεις", logout: "Αποσύνδεση",
    messages: "Μηνύματα",
    message: "Μήνυμα",
    heroEyebrow: "Ομαδικά σχέδια πιο εύκολα",
    heroTitle: "Βρείτε το σχέδιο που η παρέα σας μπορεί να συμφωνήσει.",
    heroDescription: "Επιλέξτε τα βασικά μαζί, κάντε swipe σε κοντινές ιδέες και αφήστε το PlanSwipe να αναδείξει τα μέρη που θα απολαύσει η παρέα.",
    heroNote: "Για ομαδικές συνομιλίες που ποτέ δεν αποφασίζουν.",
    whatPlanswipeIs: "Τι είναι το PlanSwipe",
    sharedDecisionTool: "Ένα εργαλείο κοινών αποφάσεων",
    offerText: "Αντί για ατελείωτες ομαδικές συζητήσεις, όλοι επιλέγουν τα βασικά, κάνουν swipe σε επιλογές και βλέπουν ποιες δραστηριότητες έχουν τη μεγαλύτερη υποστήριξη.",
    agreeFaster: "Συμφωνήστε πιο γρήγορα",
    agreeFasterText: "Έπιλέξτε περιοχή και είδος μαζί. Έτσι δεν χάνει η ομαδική συνομιλία.",
    discoverOptions: "Ανακαλύψτε επιλογές",
    discoverOptionsText: "Ανακαλύψτε πραγματικές προτάσεις από το Google Maps για την περιοχή και δραστηριότητα της ομάδας σας.",
    voteAsGroup: "Ψηφίστε ως ομάδα",
    voteAsGroupText: "Κάντε swipe και ψηφίστε Όχι, Ίσως ή Ναι. Δείτε αμέσως ποια μέρη έχουν τη μεγαλύτερη υποστήριξη.",
    dinnerNearSea: "Βραδινό δίπλα στη θάλασσα", glyfadaTaverna: "Ψαροταβέρνα Γλυφάδας",
    seeWhatFriendsThink: "Δείτε τι πιστεύουν οι φίλοι σας.", findSimilar: "Βρείτε παρόμοια μέρη",
    startPlanning: "Ξεκινήστε τον προγραμματισμό με την ομάδα σας",
    startPlanningText: "Διαλέξτε αν θέλετε να δημιουργήσετε μια νέα ομάδα ή να μπείτε σε μια υπάρχουσα.",
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
    addActivityText: "Προτείνετε άλλο είδους δραστηριότητας.",
    addOwn: "Πρόσθεσε δικό σου", liveChoices: "Ζωντανές επιλογές",
    resultsTitle: "Τι μπορείτε να κάνετε", aiSuggestions: "Προτάσεις AI",
    changeBasics: "Αλλαγή βασικών", noStrongChoice: "Δεν υπάρχει ακόμα δυνατή επιλογή",
    keepSwiping: "Συνεχίστε το swipe ή περιμένετε την υπόλοιπη ομάδα.",
    noFriends: "Δεν έχετε ακόμα φίλους",
    searchByUsername: "Αναζήτηση με όνομα χρήστη", search: "Αναζήτηση",
    requests: "Αιτήματα", saveProfile: "Αποθήκευση προφίλ",
    age: "Ηλικία", ageGroup: "Ηλικιακή ομάδα", bio: "Βιογραφικό",
    preferences: "Προτιμήσεις", logPastActivity: "Καταχώρηση δραστηριότητας",
    area: "Περιοχή", activity: "Δραστηριότητα", place: "Μέρος",
    saveActivity: "Αποθήκευση δραστηριότητας",
    suggestedPlaces: "Προτεινόμενα μέρη", noLikedPlaces: "Δεν υπάρχουν ακόμα αρεστά μέρη",
    notifications: "Ειδοποιήσεις", friendRequestNotif: "Ειδοποιήσεις αιτημάτων φιλίας",
    groupInviteNotif: "Ειδοποιήσεις προσκλήσεων", privacy: "Απόρρητο",
    showOnlineStatus: "Εμφάνιση online κατάστασης", showProfilePublicly: "Δημόσιο προφίλ",
    saveSettings: "Αποθήκευση ρυθμίσεων", settingsSaved: "Οι ρυθμίσεις αποθηκεύτηκαν",
    deleteAccount: "Διαγραφή Λογαριασμού",
    deleteAccountConfirm: "Είστε σίγουροι ότι θέλετε να διαγράψετε τον λογαριασμό; Αυτή η ενέργεια είναι μη αναστρέψιμη.",
    deleteAccountSuccess: "Ο λογαριασμός διαγράφηκε επιτυχώς.",
    removeFriend: "Αφαίρεση φίλου", removeFriendConfirm: "Να αφαιρεθεί αυτός ο φίλος;",
    activeGroups: "Ενεργές ομάδες", pastGroups: "Παλιές ομάδες",
    noActiveGroups: "Δεν υπάρχουν ενεργές ομάδες", noPastGroups: "Δεν υπάρχουν παλιές ομάδες",
    you: "εσείς", friends: "Φίλοι", requestSent: "Το αίτημα στάλθηκε",
    noPending: "Δεν υπάρχουν εκκρεμή αιτήματα", inboxClear: "Δεν υπάρχουν ειδοποιήσεις",
    noPastActivities: "Δεν υπάρχουν ακόμα παλιές δραστηριότητες",
    continueBrowsing: "Θέλετε να συνεχίσετε να βλέπετε μέρη;",
    noMoreSuggestions: "Δεν υπάρχουν άλλα μέρη που ταιριάζουν με τις επιλογές σας. Θέλετε να αλλάξετε τα βασικά;",
    newGroup: "Νέα Ομάδα",
    backToVoting: "Επιστροφή στην Ψηφοφορία",
    exitGroupPermanent: "Μόνιμη έξοδος από ομάδα",
    confirmExitGroup: "Είστε σίγουροι ότι θέλετε να φύγετε μόνιμα;",
    accountManagement: "Διαχείριση Λογαριασμού",
    choiceNo: "Όχι", choiceMaybe: "Ίσως", choiceYes: "Ναι",
    searchFrom: "Αναζήτηση από", searchGooglePlaces: "Google Places",
    searchSample: "δείγματα δεδομένων", searchCustom: "προσαρμοσμένη ιδέα",
    areaSelected: "Συμφωνήθηκε περιοχή! Τώρα ψηφίστε για δραστηριότητα.",
    fridayCrew: "Παρέα Παρασκευής",
    forgotPassword: "Ανάκτηση Κωδικού",
    username: "Όνομα χρήστη", email: "Email", password: "Κωδικός",
    oldPassword: "Παλιός κωδικός", newPassword: "Νέος κωδικός",
    verifyPassword: "Επιβεβαίωση νέου κωδικού",
    changePassword: "Αλλαγή κωδικού", passwordChanged: "Ο κωδικός άλλαξε επιτυχώς",
    passwordMismatch: "Οι νέοι κωδικοί δεν ταιριάζουν",
    editProfilePicture: "Επεξεργασία φωτογραφίας προφίλ",
    bioPlaceholder: "Πείτε στους φίλους τι σχέδια σας αρέσουν.",
    favouriteAreas: "Αγαπημένες περιοχές", favouriteActivities: "Αγαπημένες δραστηριότητες",
    favouritePlaces: "Αγαπημένα μέρη",
    addAnotherArea: "Προσθήκη άλλης περιοχής", addAnotherActivity: "Προσθήκη άλλης δραστηριότητας",
    addAnotherPlace: "Προσθήκη άλλου μέρους", useFavourite: "Χρήση αγαπημένου",
    selectSpecificArea: "Επιλέξτε συγκεκριμένη περιοχή",
    addYourOwnPlace: "Προσθέστε δικό σας μέρος", selectThisPlace: "Επιλογή αυτού του μέρους",
    selectedThisPlace: "Επιλέχθηκε",
    bookNow: "Κράτηση τώρα", website: "Website", reservations: "Κρατήσεις",
    noBookingDetails: "Δεν υπάρχει ακόμα website ή τηλέφωνο.",
    passwordWeak: "Αδύναμος κωδικός", passwordOk: "Ο κωδικός είναι OK",
    passwordStrong: "Δυνατός κωδικός",
    passwordRequirements: "Χρησιμοποιήστε 8+ χαρακτήρες με κεφαλαίο, πεζό και αριθμό.",
    ageGroupRequired: "Επιλέξτε πρώτα την ηλικιακή σας ομάδα πριν μπείτε σε ομάδα.",
    viewProfile: "Προβολή προφίλ",
    addToFavourites: "Προσθήκη στα Αγαπημένα",
    favourited: "Αγαπημένο",
    inviteToGroup: "Πρόσκληση στην ομάδα",
    inviteFriends: "Προσκαλέστε φίλους",
    inviteSelectFriends: "Επιλέξτε φίλους για πρόσκληση στην ομάδα.",
    inviteSent: "Οι προσκλήσεις στάλθηκαν!",
    noFriendsToInvite: "Προσθέστε φίλους πρώτα για να τους προσκαλέσετε.",
    sendInvites: "Αποστολή προσκλήσεων",
    cancel: "Ακύρωση",
    ok: "OK",
    selectedCount: "επιλέχθηκαν",
    groupChat: "Ομαδική Συνομιλία", sendMessage: "Αποστολή",
    messagePlaceholder: "Γράψε μήνυμα\u2026",
    closeChat: "Κλείσιμο", waitingForOthers: "Αναμονή για ψήφους\u2026",
    voted: "ψήφισε", of: "από", aiToggleOn: "Θα χρησιμοποιηθούν AI προτάσεις",
    aiToggleOff: "Θα χρησιμοποιηθούν δείγματα", aiToggleLabel: "Λειτουργία AI προτάσεων",
    subscription: "Συνδρομή", subscribe: "Εγγραφή",
    free: "Δωρεάν", pro: "Pro", currentPlan: "Τρέχουσα συνδρομή",
    freePlanDesc: "Βασικές δυνατότητες για απλές ομάδες",
    proPlanDesc: "Όλα όσα χρειάζεστε για σοβαρό προγραμματισμό",
    upgradeToPro: "Αναβάθμιση σε Pro",
    subscribedThanks: "Ευχαριστούμε! Τώρα έχετε πρόσβαση σε όλες τις Pro δυνατότητες.",
    subscriptionError: "Υπήρξε σφάλμα κατά την επεξεργασία. Παρακαλώ δοκιμάστε ξανά.",
    manageSubscription: "Διαχείριση Συνδρομής",
    includedInYourPlan: "Περιλαμβάνεται στο Πρόγραμμά σας",
    includedInYourPlanPro: "Περιλαμβάνεται στο Πρόγραμμά σας",
    validEmailRequired: "Εισάγετε μια έγκυρη διεύθυνση email.",
    enterGroupCode: "Εισάγετε έναν 8ψήφιο κωδικό ομάδας.",
    alreadyInFavourites: "Υπάρχει ήδη στα αγαπημένα σας!",
    fieldsRequired: "Απαιτούνται περιοχή, δραστηριότητα και μέρος.",
    fillPasswordFields: "Παρακαλώ συμπληρώστε όλα τα πεδία κωδικού.",
    noMessagesYet: "Δεν υπάρχουν ακόμη μηνύματα. Πείτε ένα γεια!",
    tryAnotherUsername: "Δοκιμάστε άλλο όνομα χρήστη.",
    confirmEmailCheck: "Ελέγξτε το email σας για επιβεβαίωση του λογαριασμού σας και στη συνέχεια συνδεθείτε.",
    enterEmailFirst: "Παρακαλώ εισάγετε πρώτα το email σας.",
    recoveryEmailSent: 'Αν το "{email}" είναι καταχωρημένο, έχει σταλεί email ανάκτησης.',
    passwordResetRequires: "Η επαναφορά κωδικού απαιτεί τη ρύθμιση του Supabase Auth.",
    accept: "Αποδοχή",
    decline: "Απόρριψη",
    groupInvites: "Προσκλήσεις Ομάδας",
    noGroupInvites: "Καμία πρόσκληση",
    nothingSaved: "Δεν έχει αποθηκευτεί τίποτα ακόμα.",
    optional: "προαιρετικό",
    reviews: "Κριτικές",
    noReviews: "Δεν υπάρχουν κριτικές.",
    remove: "Αφαίρεση",
    confirmRemoveActivity: "Να αφαιρεθεί αυτή η δραστηριότητα;",
    recoverPassword: "Ανάκτηση Κωδικού",
    newPasswordPlaceholder: "Νέος κωδικός",
    confirmPasswordPlaceholder: "Επιβεβαίωση νέου κωδικού",
    resetPassword: "Επαναφορά Κωδικού",
    passwordResetSuccess: "Ο κωδικός επαναφέρθηκε επιτυχώς! Μπορείτε να συνδεθείτε.",
    selectedBy: "επιλέχθηκε από",
    people: "άτομα",
    person: "άτομο",
    noConversations: "Καμία συνομιλία ακόμα",
    startMessaging: "Προσθέστε φίλους και στείλτε μηνύματα.",
    typeMessage: "Γράψε μήνυμα..."
  }
};

Object.assign(copy.el, {
  ageGroup: "Ηλικιακή ομάδα",
  useFavourite: "Χρήση αγαπημένου",
  selectSpecificArea: "Επιλέξτε συγκεκριμένη περιοχή",
  addYourOwnPlace: "Προσθέστε δικό σας μέρος",
  selectThisPlace: "Επιλογή αυτού του μέρους",
  selectedThisPlace: "Επιλέχθηκε",
  bookNow: "Κράτηση τώρα",
  website: "Website",
  reservations: "Κρατήσεις",
  noBookingDetails: "Δεν υπάρχει ακόμα website ή τηλέφωνο.",
  passwordWeak: "Αδύναμος κωδικός",
  passwordOk: "Ο κωδικός είναι OK",
  passwordStrong: "Δυνατός κωδικός",
  passwordRequirements: "Χρησιμοποιήστε 8+ χαρακτήρες με κεφαλαίο, πεζό και αριθμό.",
  ageGroupRequired: "Επιλέξτε πρώτα την ηλικιακή σας ομάδα πριν μπείτε σε ομάδα.",
  viewProfile: "Προβολή προφίλ",
  addToFavourites: "Προσθήκη στα Αγαπημένα",
  favourited: "Αγαπημένο",
  inviteToGroup: "Πρόσκληση στην ομάδα",
  inviteFriends: "Προσκαλέστε φίλους",
  inviteSelectFriends: "Επιλέξτε φίλους για πρόσκληση στην ομάδα.",
  inviteSent: "Οι προσκλήσεις στάλθηκαν!",
  noFriendsToInvite: "Προσθέστε φίλους πρώτα για να τους προσκαλέσετε.",
  sendInvites: "Αποστολή προσκλήσεων",
  cancel: "Ακύρωση",
  ok: "OK",
  selectedCount: "επιλέχθηκαν",
  noMoreSuggestions: "Δεν υπάρχουν άλλα μέρη που ταιριάζουν με τις επιλογές σας. Θέλετε να αλλάξετε τα βασικά;",
  agreeFasterText: "Έπιλέξτε περιοχή και είδος μαζί. Έτσι δεν χάνει η ομαδική συνομιλία.",
  discoverOptionsText: "Ανακαλύψτε πραγματικές προτάσεις από το Google Maps για την περιοχή και δραστηριότητα της ομάδας σας.",
  voteAsGroupText: "Κάντε swipe και ψηφίστε Όχι, Ίσως ή Ναι. Δείτε αμέσως ποια μέρη έχουν τη μεγαλύτερη υποστήριξη."
});

// ====== LANGUAGE ======
function applyLanguage() {
  document.documentElement.lang = state.language;
  languageButton.textContent    = state.language === "en" ? "EL" : "EN";
  appLanguageButton.textContent = state.language === "en" ? "EL" : "EN";
  heroLoginButton.textContent   = t("login");
  if (heroSignupButton) heroSignupButton.textContent = t("createAccount");
  heroEnterButton.textContent   = t("enterPlanswipe");
  loginButton.textContent       = t("login");
  registerButton.textContent    = t("createAccount");
  loginForm.querySelector("h2").textContent = t("enterPlanswipe");
  forgotPasswordButton.textContent = t("forgotPassword");
  loginEmail.placeholder = state.authMode === "signup" ? `${t("email")}` : `${t("email")} (${t("optional")})`;
  renderPasswordStrength();

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
  closePageButton.textContent   = t("back");
  if (inviteToGroupButton) inviteToGroupButton.textContent = t("inviteToGroup");
  if (continueBrowseButton) continueBrowseButton.textContent = t("continueBrowsing");
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
  var s = String(value ?? "");
  var amp = "&" + "amp;";
  var lt = "&" + "lt;";
  var gt = "&" + "gt;";
  var quot = "&" + "quot;";
  var apos = "&#" + "39;";
  s = s.replace(/&/g, amp);
  s = s.replace(/</g, lt);
  s = s.replace(/>/g, gt);
  s = s.replace(/\u0022/g, quot);
  s = s.replace(/'/g, apos);
  return s;
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

async function syncSupabaseProfile(username, email, password = "") {
  const body = { username, email };
  if (password) body.password = password;
  const data = await api("/api/auth/profile", { method: "POST", body });
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
  // Email is no longer required for login
  const email = loginEmail.value.trim();
  if (state.supabaseClient) {
    if (email) {
      const { data, error } = await state.supabaseClient.auth.signInWithPassword({ email, password: loginPassword.value });
      if (error) throw new Error(error.message);
      state.supabaseSession = data.session;
      await syncSupabaseProfile(loginUsername.value.trim(), data.user.email || email, loginPassword.value);
    } else {
      // No email provided — use non-Supabase login path which only requires username + password
      const data = await api("/api/login", { method: "POST", body: { username: loginUsername.value, email: "", password: loginPassword.value } });
      state.supabaseSession = null;
      setLoggedIn(data.username, "");
      saveAccount({ username: data.username, email: "", profile: data.profile });
    }
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
  if (!email) throw new Error("Email is required");
  if (!validEmail(email)) throw new Error(t("validEmailRequired") || "Valid email required");
  if (!isStrongPassword(password)) throw new Error(t("passwordRequirements") || "Password does not meet requirements");
  if (state.supabaseClient) {
    const { data, error } = await state.supabaseClient.auth.signUp({ email, password, options: { data: { username } } });
    if (error) throw new Error(error.message || "Supabase sign up failed");
    state.supabaseSession = data.session;
    if (!data.session) {
      const message = (t("confirmEmailCheck") || "Check your email to confirm your account, then log in.") + (email ? "" : " " + (t("enterEmailFirst") || "Please enter your email first."));
      showError(message);
      return;
    }
    await syncSupabaseProfile(username, data.user.email || email, password);
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
  memberRow.innerHTML = (state.group.members || []).map((m) => `
    <button class="member-chip" type="button" data-username="${escapeHtml(m.username || m.name)}">
      <span class="avatar">${m.profile?.picture
        ? `<img src="${escapeHtml(m.profile.picture)}" alt="">`
        : escapeHtml(initials(m.name))}</span>
      ${escapeHtml(m.name)}${m.id === state.user.id ? ` (${t("you")})` : ""}
    </button>`).join("");
}

function renderSetup() {
  setVisible(modeButtons,  !state.setupMode);
  setVisible(createForm,   state.setupMode === "create");
  setVisible(joinForm,     state.setupMode === "join");
}

function renderDecisionStep(kind) {
  const isAreaStep = kind === "area";
  const broadArea  = isAreaStep && state.pendingAreaOption ? state.pendingAreaOption : null;
  const options    = broadArea
    ? broadArea.subareas.map((label) => ({ id: `subarea_${label.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`, label, description: `${label}, Athens`, queryArea: `${label}, Athens` }))
    : optionsFor(kind);
  const chosen     = selected(kind);
  const total      = memberCount();
  const votedCount = Object.keys(state.group?.choices?.[kind] || {}).length;

  decisionStep.textContent  = isAreaStep ? t("stepArea") : t("stepType");
  decisionTitle.textContent = broadArea ? `${t("selectSpecificArea")}: ${optionLabel("area", broadArea)}` : (isAreaStep ? t("areaTitle") : t("typeTitle"));

  if (votedCount > 0 && votedCount < total) {
    decisionHint.innerHTML = `${votedCount} ${t("of")} ${total} ${t("voted")} \u2014 <strong>${t("waitingForOthers")}</strong>`;
  } else {
    decisionHint.innerHTML = t("decisionHint");
  }

  setVisible(backChoiceButton, kind === "type" || Boolean(chosen) || Boolean(state.pendingAreaOption));
  if (backChoiceButton && !backChoiceButton.classList.contains("is-hidden")) {
    backChoiceButton.textContent = t("backToVoting");
  }

  if (!options || options.length === 0) {
    optionGrid.innerHTML = `<p style="color:var(--muted);padding:12px;">${t("decisionHint")}</p>`;
    return;
  }

  const optionCards = options.map((option) => {
    const score = optionScore(kind, option.id);
    const isSelected = chosen === option.id;
    const translated = translateOption(kind, option.id);
    const label = translated?.label ?? option.label ?? option.id;
    const description = translated?.description ?? option.description ?? "";
    const broadAttr = isAreaStep && !broadArea && option.subareas?.length ? ` data-broad-area="true"` : "";
    const customLabelAttr = broadArea ? ` data-custom-label="${escapeHtml(option.label)}"` : "";
    return `<button class="option-card${isSelected ? " is-selected" : ""}" type="button" data-kind="${escapeHtml(kind)}" data-id="${escapeHtml(option.id)}"${broadAttr}${customLabelAttr}>
      <span class="option-score">${score}/${total} ${t("liveChoices")}</span>
      <span><h3>${escapeHtml(label)}</h3><p>${escapeHtml(description)}</p></span>
    </button>`;
  }).join("");

  const prefKey = isAreaStep ? "areas" : "activities";
  const favourites = (getPreferences()[prefKey] || []).slice(0, 6).map((item) => `
    <button class="option-card favourite-option-card" type="button" data-kind="${escapeHtml(kind)}" data-favourite="${escapeHtml(item)}">
      <span class="option-score">${escapeHtml(t("useFavourite"))}</span>
      <span><h3>${escapeHtml(item)}</h3><p>${escapeHtml(isAreaStep ? t("addAreaText") : t("addActivityText"))}</p></span>
    </button>`).join("");

  const addOwn   = state.language === "el" ? optionTranslations.el.addOwn    : t("addOwn");
  const addLabel = state.language === "el"
    ? (isAreaStep ? optionTranslations.el.addArea    : optionTranslations.el.addActivity)
    : (isAreaStep ? t("addArea")    : t("addActivity"));
  const addText  = state.language === "el"
    ? (isAreaStep ? optionTranslations.el.addAreaText : optionTranslations.el.addActivityText)
    : (isAreaStep ? t("addAreaText") : t("addActivityText"));

  const aiToggle = !isAreaStep ? `<div class="ai-toggle-row">
    <label class="css-toggle" aria-label="${escapeHtml(t("aiToggleLabel"))}">
      <input id="aiSuggestionToggle" type="checkbox" ${state.useAiSuggestions ? "checked" : ""}>
      <span class="css-toggle-track"><span class="css-toggle-knob"></span></span>
    </label>
    <div><div class="ai-toggle-label">${escapeHtml(t("aiSuggestions"))}</div>
    <div class="ai-toggle-desc">${escapeHtml(state.useAiSuggestions ? t("aiToggleOn") : t("aiToggleOff"))}</div></div>
  </div>` : "";

  optionGrid.innerHTML = `${aiToggle}${optionCards}${favourites}
    <button class="option-card add-option-card" type="button" data-kind="${escapeHtml(kind)}" data-custom="true">
      <span class="option-score">${escapeHtml(addOwn)}</span>
      <span><h3>${escapeHtml(addLabel)}</h3><p>${escapeHtml(addText)}</p></span>
    </button>`;
}

function renderCard() {
  const places = state.group.places || [];
  const place  = places[state.index];
  if (!place) {
    setVisible(swipeLayout, false);
    setVisible(resultsPanel, true);
    renderResults();
    return;
  }
  activityCard.classList.remove("swipe-yes", "swipe-no");
  activityPhoto.src               = place.photoUrl || "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80";
  activityPhoto.alt               = place.title;
  const ratingText = place.rating ? `${Number(place.rating).toFixed(1)} \u2605` : "";
  const typeLabel = optionLabel("type", consensus("type")) || place.category;
  activityCategory.textContent    = ratingText ? `${typeLabel} | ${ratingText}` : typeLabel;
  activityTitle.textContent       = place.title;
  activityDescription.textContent = place.description || place.address || "";
  activityArea.textContent        = place.areaLabel || place.address || "";
  activityTime.textContent        = place.time;
  activityCost.textContent        = place.cost;
  noButton.textContent      = t("choiceNo");
  maybeButton.textContent   = t("choiceMaybe");
  yesButton.textContent     = t("choiceYes");
  [noButton, maybeButton, yesButton, favButton].forEach((btn) => {
    if (btn) btn.classList.toggle("is-voting", state.votingInProgress);
  });
  if (favButton) {
    const preferences = getPreferences();
    const alreadyFav = (preferences.places || []).some((p) => p.toLowerCase() === place.title?.toLowerCase());
    favButton.textContent = alreadyFav ? `\u2605 ${t("favourited")}` : `\u2606 ${t("addToFavourites")}`;
    favButton.classList.toggle("is-favourited", alreadyFav);
  }
}

function renderResults() {
  const allPlaces = state.group.places || [];
  const totalMembers = state.group.members?.length || 1;
  const selectedCount = Object.keys(state.group.placeSelections || {}).length;
  if (resultsSelectedCount) {
    resultsSelectedCount.textContent = selectedCount > 0 ? `${selectedCount}/${totalMembers} ${t("selectedCount")}` : "";
  }
  const canAddOwnPlace = state.index >= Math.min(5, allPlaces.length || 5);
  const exhaustedMsg = (state.placesExhausted || state.group.placesExhausted) && state.index >= allPlaces.length
    ? `<div class="places-exhausted-message">${escapeHtml(t("noMoreSuggestions"))}</div>` : "";
  if (!allPlaces.length) {
    resultList.innerHTML = `${exhaustedMsg || `<article class="result-card"><div class="result-icon"></div><div><h3>${t("noStrongChoice")}</h3><p>${t("keepSwiping")}</p></div><strong class="result-score">0%</strong></article>`}`;
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
      const percent = Math.round((v.yes / total) * 100);
      return { ...p, ...v, total, percent };
    })
    .filter((p) => p.yes > 0 || p.maybe > 0)
    .sort((a, b) => b.percent - a.percent || b.yes - a.yes || b.maybe - a.maybe);

  if (!ranked.length) {
    resultList.innerHTML = `<article class="result-card"><div class="result-icon"></div><div><h3>${t("noStrongChoice")}</h3><p>${t("keepSwiping")}</p></div><strong class="result-score">0%</strong></article>
      ${canAddOwnPlace ? `<button class="btn-primary add-own-place-button" type="button" id="addOwnPlaceButton">${t("addYourOwnPlace")}</button>` : ""}`;
    return;
  }

  // Calculate selection counts per place
  const selectionCounts = {};
  Object.values(state.group.placeSelections || {}).forEach((placeId) => {
    selectionCounts[placeId] = (selectionCounts[placeId] || 0) + 1;
  });

  resultList.innerHTML = ranked.map((item) => {
    const ratingPart = item.rating ? ` | ${Number(item.rating).toFixed(1)} \u2605` : "";
    const selectedByMe = state.group.placeSelections?.[state.user?.id] === item.id;
    const canBook = state.group.consensus?.place === item.id;
    const booking = state.selectedBookPlaceId === item.id ? `
      <div class="booking-details">
        ${item.website ? `<a class="btn-ghost" href="${escapeHtml(item.website)}" target="_blank" rel="noopener">${t("website")}</a>` : ""}
        ${item.phone ? `<a class="btn-ghost" href="tel:${escapeHtml(item.phone)}">${t("reservations")}: ${escapeHtml(item.phone)}</a>` : ""}
        ${!item.website && !item.phone ? `<span class="muted-text">${t("noBookingDetails")}</span>` : ""}
      </div>` : "";
    const selCount = selectionCounts[item.id] || 0;
    const selLabel = selCount > 0 ? `<span class="selection-badge">${selCount} ${t(selCount === 1 ? "person" : "people")} ${t("selectedBy")}</span>` : "";
    return `
    <article class="result-card">
      <img class="result-icon" src="${escapeHtml(item.photoUrl)}" alt="">
      <div><h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.areaLabel)} | ${escapeHtml(optionLabel("type", consensus("type")) || item.category)}${ratingPart} | ${item.yes}/${item.total} yes, ${item.maybe || 0} maybe</p>
      ${selLabel}
      <div class="result-buttons">
        <button class="btn-ghost" type="button" data-select-place="${escapeHtml(item.id)}">${selectedByMe ? t("selectedThisPlace") : t("selectThisPlace")}</button>
        ${canBook ? `<button class="btn-primary" type="button" data-book-place="${escapeHtml(item.id)}">${t("bookNow")}</button>` : ""}
      </div>${booking}</div>
      <strong class="result-score">${item.percent}%</strong>
    </article>`;
  }).join("") + (canAddOwnPlace ? `<button class="btn-primary add-own-place-button" type="button" id="addOwnPlaceButton">${t("addYourOwnPlace")}</button>` : "") + exhaustedMsg;
}

function renderStatus() {
  if (!state.group) { setVisible(statusPanel, false); return; }
  setVisible(statusPanel, true);
  const areaReady = consensus("area");
  const typeReady = consensus("type");
  if (!areaReady) { statusPanel.textContent = t("decisionHint"); return; }
  if (!typeReady) { statusPanel.textContent = t("areaSelected"); return; }
  const src = state.group.search?.source;
  const sourceLabel = (src === "google" || src === "google-ai") ? t("searchGooglePlaces") : src === "custom" ? t("searchCustom") : t("searchSample");
  const area = state.group.search?.area || "";
  const activity = state.group.search?.activity || "";
  const context = area && activity ? `${activity} \u00b7 ${area}` : `"${state.group.search?.query || ""}"`;
  statusPanel.textContent = `${t("searchFrom")} ${sourceLabel}: ${context}`;
}

// ====== GROUP CHAT ======
async function refreshChatUnreadCount() {
  if (!state.groupCode || !document.querySelector("#chatFab")) return;
  try {
    const since = state.chatLastReadTimestamp ? `&since=${encodeURIComponent(state.chatLastReadTimestamp)}` : "";
    const data = await api(`/api/groups/${state.groupCode}/messages?limit=50${since}`);
    const messages = data.messages || [];
    const badge = document.querySelector("#chatUnreadBadge");
    if (!badge) return;
    const unread = state.chatOpen ? 0 : messages.length;
    if (unread > 0) {
      badge.textContent = unread > 99 ? "99+" : String(unread);
      badge.classList.remove("is-hidden");
    } else {
      badge.textContent = "";
      badge.classList.add("is-hidden");
    }
  } catch (_) {}
}

function startChatUnreadPolling() {
  if (state.chatTimer) clearInterval(state.chatTimer);
  state.chatTimer = setInterval(refreshChatUnreadCount, 5000);
  refreshChatUnreadCount();
}

function stopChatUnreadPolling() {
  clearInterval(state.chatTimer);
  state.chatTimer = null;
}

function ensureChatButton() {
  if (document.querySelector("#chatFab")) return;
  const fab = document.createElement("button");
  fab.id        = "chatFab";
  fab.className = "chat-fab";
  fab.setAttribute("aria-label", t("groupChat"));
  fab.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span id="chatUnreadBadge" class="chat-unread-badge is-hidden"></span>`;
  document.body.appendChild(fab);
  fab.addEventListener("click", toggleChat);
  startChatUnreadPolling();
}

function removeChatButton() {
  document.querySelector("#chatFab")?.remove();
  document.querySelector("#chatOverlay")?.remove();
  stopChatUnreadPolling();
  clearInterval(state.chatLoadTimer);
  state.chatLoadTimer = null;
  state.chatOpen  = false;
}

function toggleChat() {
  state.chatOpen = !state.chatOpen;
  if (state.chatOpen) { openChatPanel(); }
  else { document.querySelector("#chatOverlay")?.remove(); }
}

function openChatPanel() {
  document.querySelector("#chatOverlay")?.remove();

  const overlay = document.createElement("div");
  overlay.id        = "chatOverlay";
  overlay.className = "chat-overlay";
  overlay.innerHTML = `
    <div class="chat-panel" id="chatPanel">
      <div class="chat-header">
        <span id="chatTitle">${escapeHtml(t("groupChat"))} \u2014 ${escapeHtml(state.group?.name || "")}</span>
        <button class="chat-close-btn" id="chatCloseBtn" aria-label="${t("closeChat")}">\u2715</button>
      </div>
      <div class="chat-messages" id="chatMessages"><div class="chat-loading">\u2026</div></div>
      <div class="chat-input-row">
        <input id="chatMessageInput" type="text" maxlength="500" placeholder="${escapeHtml(t("messagePlaceholder"))}" autocomplete="off">
        <button id="chatSendButton" class="btn-primary">${t("sendMessage")}</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  overlay.querySelector("#chatCloseBtn").addEventListener("click", () => {
    state.chatOpen = false; overlay.remove();
    clearInterval(state.chatLoadTimer); state.chatLoadTimer = null;
    startChatUnreadPolling();
  });

  const input   = overlay.querySelector("#chatMessageInput");
  const sendBtn = overlay.querySelector("#chatSendButton");

  sendBtn.addEventListener("click", () => sendChatMessage(input));
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") sendChatMessage(input); });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      state.chatOpen = false; overlay.remove();
      clearInterval(state.chatLoadTimer); state.chatLoadTimer = null;
      startChatUnreadPolling();
    }
  });

  loadChatMessages(true);
  clearInterval(state.chatLoadTimer);
  state.chatLoadTimer = setInterval(() => { if (state.chatOpen) loadChatMessages(false); }, 3000);
}

async function loadChatMessages(scrollToBottom) {
  if (!state.groupCode) return;
  const container = document.querySelector("#chatMessages");
  if (!container) return;
  try {
    if (scrollToBottom) {
      const data = await api(`/api/groups/${state.groupCode}/messages`);
      const messages = data.messages || [];
      if (messages.length === 0) {
        container.innerHTML = `<div class="chat-empty">${t("noMessagesYet")}</div>`;
        return;
      }
      state.chatLastTimestamp = messages[messages.length - 1].created_at;
      state.chatLastReadTimestamp = state.chatLastTimestamp;
      const me = currentUsername();
      container.innerHTML = messages.map((msg) => {
        const isMine = msg.username === me;
        return `<div class="chat-bubble ${isMine ? "chat-bubble-mine" : "chat-bubble-theirs"}">${!isMine ? `<span class="chat-sender">${escapeHtml(msg.username)}</span>` : ""}<span class="chat-text">${escapeHtml(msg.message)}</span></div>`;
      }).join("");
      container.scrollTop = container.scrollHeight;
      const badge = document.querySelector("#chatUnreadBadge");
      if (badge) badge.classList.add("is-hidden");
      api(`/api/groups/${state.groupCode}/mark-read`, { method: "POST", body: { username: currentUsername() } }).catch(() => {});
      return;
    }

    const params = state.chatLastTimestamp ? `?since=${encodeURIComponent(state.chatLastTimestamp)}` : "";
    const data = await api(`/api/groups/${state.groupCode}/messages${params}`);
    const messages = data.messages || [];
    if (messages.length === 0) return;

    state.chatLastTimestamp = messages[messages.length - 1].created_at;
    if (state.chatOpen) state.chatLastReadTimestamp = state.chatLastTimestamp;

    const me = currentUsername();
    const loading = container.querySelector(".chat-loading, .chat-empty");
    if (loading) loading.remove();

    messages.forEach((msg) => {
      const isMine = msg.username === me;
      const bubble = document.createElement("div");
      bubble.className = `chat-bubble ${isMine ? "chat-bubble-mine" : "chat-bubble-theirs"}`;
      bubble.innerHTML = `${!isMine ? `<span class="chat-sender">${escapeHtml(msg.username)}</span>` : ""}
        <span class="chat-text">${escapeHtml(msg.message)}</span>`;
      container.appendChild(bubble);
    });

    container.scrollTop = container.scrollHeight;
  } catch (e) { console.warn("Chat load error:", e.message); }
}

async function sendChatMessage(input) {
  const message = (input?.value || "").trim();
  if (!message || !state.groupCode) return;
  input.value = ""; input.disabled = true;
  try {
    await api(`/api/groups/${state.groupCode}/messages`, { method: "POST", body: { username: currentUsername(), message } });
    await loadChatMessages(true);
  } catch (e) { showError(e.message); }
  finally { input.disabled = false; input.focus(); }
}

// ====== NOTIFICATIONS ======
let notifRefreshInProgress = false;

async function refreshNotifications() {
  if (notifRefreshInProgress) return;
  if (!isLoggedIn()) return;
  notifRefreshInProgress = true;
  try {
    const data = await api(`/api/notifications?username=${encodeURIComponent(currentUsername())}`);
    const prevFriendRequests = state.friendsLastRequestCount;
    state.notifications = data;
    if (
      state.activePage === "friends"
      && state.pageShellRendered === "friends"
      && prevFriendRequests >= 0
      && data.friendRequests !== prevFriendRequests
    ) {
      refreshFriendsPage().catch((e) => console.warn("Friends refresh error:", e.message));
    }
    if (state.activePage === "friends") {
      state.friendsLastRequestCount = data.friendRequests || 0;
    }
    const badge = notificationBadge;
    if (data.total > 0) {
      badge.textContent = data.total > 99 ? "99+" : String(data.total);
      badge.classList.remove("is-hidden");
    } else { badge.classList.add("is-hidden"); }
    profileMenu.querySelectorAll("button[data-page]").forEach((btn) => {
      btn.classList.remove("has-notif");
      btn.querySelector(".notif-count")?.remove();
      let count = 0;
      if (btn.dataset.page === "friends") count = data.friendRequests || 0;
      if (btn.dataset.page === "messages") count = data.dmMessages || 0;
      if (btn.dataset.page === "groups") {
        const groupsTotal = (data.groupInvites || 0);
        api(`/api/groups/mine?username=${encodeURIComponent(currentUsername())}`).then((gData) => {
          const groupsWithUnread = (gData.groups || []).filter((g) => g.unreadCount > 0).length;
          const totalNotifs = groupsWithUnread + groupsTotal;
          const groupsBtn = [...profileMenu.querySelectorAll("button[data-page]")].find((b) => b.dataset.page === "groups");
          if (groupsBtn && totalNotifs > 0) {
            groupsBtn.classList.add("has-notif");
            let sp = groupsBtn.querySelector(".notif-count");
            if (!sp) { sp = document.createElement("span"); sp.className = "notif-count"; groupsBtn.appendChild(sp); }
            sp.textContent = `(${totalNotifs})`;
          } else if (groupsBtn) {
            groupsBtn.classList.remove("has-notif");
            groupsBtn.querySelector(".notif-count")?.remove();
          }
        }).catch(() => {});
      }
      if (count > 0) {
        btn.classList.add("has-notif");
        const sp = document.createElement("span");
        sp.className = "notif-count";
        sp.textContent = `(${count})`;
        btn.appendChild(sp);
      }
    });
  } catch (e) { console.warn("Notifications refresh error:", e.message); }
  finally { notifRefreshInProgress = false; }
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
    state.showHero = true; state.activePage = ""; state.loginOpen = false;
    renderApp(); return;
  }

  if (route === "/home") { state.showHero = true; state.activePage = ""; renderApp(); return; }
  if (route === "/main") { state.showHero = false; state.activePage = ""; renderApp(); return; }

  if (route === "/recover") {
    state.showHero = false; state.activePage = "recover"; renderApp(); return;
  }

  const pageMatch = route.match(/^\/(groups|friends|messages|likedplaces|past|personal|settings|subscription)$/);
  if (pageMatch) { state.showHero = false; state.activePage = pageMatch[1]; renderApp(); return; }

  const profileMatch = route.match(/^\/profile\/(.+)$/);
  if (profileMatch) { state.showHero = false; state.activePage = "profile:" + decodeURIComponent(profileMatch[1]); renderApp(); return; }

  navigate("/home");
}

// ====== MAIN RENDER ======
function hideAppPanels() {
  setVisible(setupPanel, false); setVisible(groupPanel, false);
  setVisible(statusPanel, false); setVisible(decisionPanel, false);
  setVisible(swipeLayout, false); setVisible(resultsPanel, false);
}

function renderApp() {
  if (!isLoggedIn()) {
    setVisible(loginPanel, true); setVisible(loginForm, state.loginOpen && !state.showResetPasswordForm);
    setVisible(topbar, false); setVisible(pagePanel, false);
    setVisible(heroEnterButton, false); setVisible(heroLoginButton, true); setVisible(heroSignupButton, true);
    loginForm.querySelector("h2").textContent = state.authMode === "signup" ? t("createAccount") : t("enterPlanswipe");
    setVisible(loginButton, state.authMode !== "signup");
    setVisible(registerButton, state.authMode === "signup");
    setVisible(forgotPasswordButton, state.authMode !== "signup" && !state.showResetPasswordForm && !state.forgotPasswordMode);
    renderPasswordStrength();
    hideAppPanels(); removeChatButton();

    // Show reset password form when user arrives from recovery email link
    if (state.showResetPasswordForm) {
      const existingForm = document.querySelector("#resetPasswordForm");
      if (!existingForm) {
        const form = document.createElement("div");
        form.id = "resetPasswordForm";
        form.className = "login-inner";
        form.style.marginTop = "10px";
        form.innerHTML = `
          <h3 style="font-size:1.1rem;color:var(--purple);margin-bottom:4px;">${escapeHtml(t("resetPassword"))}</h3>
          <input id="resetNewPassword" type="password" placeholder="${escapeHtml(t("newPasswordPlaceholder"))}" autocomplete="new-password">
          <input id="resetConfirmPassword" type="password" placeholder="${escapeHtml(t("confirmPasswordPlaceholder"))}" autocomplete="new-password">
          <button id="resetPasswordConfirmBtn" type="button" class="btn-primary">${escapeHtml(t("resetPassword"))}</button>
          <button id="resetPasswordCancelBtn" type="button" class="btn-ghost" style="background:transparent;color:var(--muted);">${escapeHtml(t("cancel"))}</button>
        `;
        loginForm.parentNode.insertBefore(form, loginForm.nextSibling);

        document.querySelector("#resetPasswordConfirmBtn").addEventListener("click", async () => {
          const newPw = document.querySelector("#resetNewPassword")?.value;
          const confirmPw = document.querySelector("#resetConfirmPassword")?.value;
          if (!newPw || !confirmPw) { showError(t("fillPasswordFields")); return; }
          if (newPw !== confirmPw) { showError(t("passwordMismatch")); return; }
          if (!isStrongPassword(newPw)) { showError(t("passwordRequirements")); return; }
          try {
            if (state.supabaseClient) {
              const { error } = await state.supabaseClient.auth.updateUser({ password: newPw });
              if (error) throw new Error(error.message);
            }
            alert(t("passwordResetSuccess"));
            state.showResetPasswordForm = false;
            document.querySelector("#resetPasswordForm")?.remove();
            navigate("/home");
          } catch (e) { showError(e.message); }
        });

        document.querySelector("#resetPasswordCancelBtn").addEventListener("click", () => {
          state.showResetPasswordForm = false;
          document.querySelector("#resetPasswordForm")?.remove();
          renderApp();
        });
      }
    } else {
      document.querySelector("#resetPasswordForm")?.remove();
    }

    // Show forgot password email form
    if (state.forgotPasswordMode) {
      const existingForm = document.querySelector("#forgotPasswordForm");
      if (!existingForm) {
        setVisible(loginUsername, false);
        setVisible(loginPassword, false);
        setVisible(loginButton, false);
        setVisible(registerButton, false);
        const form = document.createElement("div");
        form.id = "forgotPasswordForm";
        form.className = "login-inner";
        form.style.marginTop = "10px";
        form.innerHTML = `
          <h3 style="font-size:1.1rem;color:var(--purple);margin-bottom:4px;">${escapeHtml(t("forgotPassword"))}</h3>
          <input id="forgotPasswordEmail" type="email" placeholder="${escapeHtml(t("email"))}" autocomplete="email">
          <button id="forgotPasswordSendBtn" type="button" class="btn-primary" style="width:100%">${escapeHtml(t("recoverPassword"))}</button>
          <button id="forgotPasswordCancelBtn" type="button" class="btn-ghost" style="background:transparent;color:var(--muted);">${escapeHtml(t("cancel"))}</button>
        `;
        loginForm.parentNode.insertBefore(form, loginForm.nextSibling);

        document.querySelector("#forgotPasswordSendBtn").addEventListener("click", async () => {
          const email = document.querySelector("#forgotPasswordEmail")?.value.trim();
          if (!email || !validEmail(email)) { showError(t("validEmailRequired")); return; }
          try {
            if (state.supabaseClient) {
              const { error } = await state.supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + "/recover"
              });
              if (error) throw new Error(error.message);
            }
            state.forgotPasswordMode = false;
            document.querySelector("#forgotPasswordForm")?.remove();
            showError(t("recoveryEmailSent").replace("{email}", email));
            renderApp();
          } catch (e) { showError(e.message); }
        });

        document.querySelector("#forgotPasswordCancelBtn").addEventListener("click", () => {
          state.forgotPasswordMode = false;
          document.querySelector("#forgotPasswordForm")?.remove();
          renderApp();
        });
      }
    } else {
      document.querySelector("#forgotPasswordForm")?.remove();
      setVisible(loginUsername, true);
      setVisible(loginPassword, true);
    }
    return;
  }

  if (state.showHero) {
    setVisible(loginPanel, true); setVisible(loginForm, false);
    setVisible(topbar, false); setVisible(pagePanel, false);
    setVisible(heroEnterButton, true); setVisible(heroLoginButton, false); setVisible(heroSignupButton, false);
    hideAppPanels(); removeChatButton();
    const heroActions = document.querySelector(".hero-actions");
    if (heroActions && !document.querySelector("#heroBackButton")) {
      heroActions.innerHTML = `<button class="btn-primary" id="heroBackButton" type="button">${t("enterPlanswipe")}</button> <span>${t("heroNote")}</span>`;
      document.querySelector("#heroBackButton").addEventListener("click", () => navigate("/main"));
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

  // When no group active, show "New Group" button instead of "Exit Current Group"
  if (state.group && state.user) {
    setVisible(resetButton, true);
    resetButton.textContent = t("leaveGroup");
  } else {
    setVisible(resetButton, true);
    resetButton.textContent = t("newGroup");
  }
  refreshNotifications();

  if (state.activePage === "recover") {
    // Security: only show the recovery form if user has a valid Supabase session (from recovery email link)
    setVisible(loginPanel, false); setVisible(topbar, false); setVisible(pagePanel, false);
    hideAppPanels(); removeChatButton();
    if (!state.supabaseSession || !state.supabaseClient) {
      navigate("/home");
      return;
    }
    const existingRecover = document.querySelector("#recoverPage");
    if (!existingRecover) {
      const recoverDiv = document.createElement("div");
      recoverDiv.id = "recoverPage";
      recoverDiv.className = "hero-screen";
      recoverDiv.style.minHeight = "100vh";
      recoverDiv.style.display = "grid";
      recoverDiv.style.placeItems = "center";
      recoverDiv.innerHTML = `
        <div class="login-panel" style="animation:none;">
          <div class="login-inner">
            <h2>${escapeHtml(t("recoverPassword"))}</h2>
            <input id="recoverNewPassword" type="password" placeholder="${escapeHtml(t("newPasswordPlaceholder"))}" autocomplete="new-password">
            <input id="recoverConfirmPassword" type="password" placeholder="${escapeHtml(t("confirmPasswordPlaceholder"))}" autocomplete="new-password">
            <button id="recoverConfirmBtn" type="button" class="btn-primary">${escapeHtml(t("resetPassword"))}</button>
            <button id="recoverCancelBtn" type="button" class="btn-ghost" style="background:transparent;color:var(--muted);">${escapeHtml(t("cancel"))}</button>
          </div>
        </div>`;
      document.querySelector(".app-shell").appendChild(recoverDiv);

      document.querySelector("#recoverConfirmBtn").addEventListener("click", async () => {
        const newPw = document.querySelector("#recoverNewPassword")?.value;
        const confirmPw = document.querySelector("#recoverConfirmPassword")?.value;
        if (!newPw || !confirmPw) { showError(t("fillPasswordFields")); return; }
        if (newPw !== confirmPw) { showError(t("passwordMismatch")); return; }
        if (!isStrongPassword(newPw)) { showError(t("passwordRequirements")); return; }
        try {
          if (state.supabaseClient) {
            const { error } = await state.supabaseClient.auth.updateUser({ password: newPw });
            if (error) throw new Error(error.message);
          }
          alert(t("passwordResetSuccess"));
          document.querySelector("#recoverPage")?.remove();
          navigate("/home");
        } catch (e) { showError(e.message); }
      });

      document.querySelector("#recoverCancelBtn").addEventListener("click", () => {
        document.querySelector("#recoverPage")?.remove();
        navigate("/home");
      });
    }
    return;
  }

  if (state.activePage) {
    hideAppPanels(); setVisible(pagePanel, true);
    renderProfilePage();
    if (state.group && state.groupCode) ensureChatButton();
    else removeChatButton();
    if (state.showAgeGroupModal) showAgeGroupPopup();
    return;
  }
  setVisible(pagePanel, false);

  if (!state.group || !state.user) {
    setVisible(setupPanel, true); setVisible(groupPanel, false);
    setVisible(statusPanel, false); setVisible(decisionPanel, false);
    setVisible(swipeLayout, false); setVisible(resultsPanel, false);
    renderSetup(); removeChatButton(); return;
  }

  groupName.textContent = state.group.name;
  groupCode.textContent = state.group.code;
  renderMembers(); renderStatus();
  setVisible(setupPanel, false); setVisible(groupPanel, true);
  if (inviteToGroupButton) setVisible(inviteToGroupButton, true);
  ensureChatButton();
  state.placesExhausted = Boolean(state.group.placesExhausted);

  const areaReady = consensus("area");
  const typeReady = consensus("type");

  if (!areaReady) { setVisible(decisionPanel, true); setVisible(swipeLayout, false); setVisible(resultsPanel, false); renderDecisionStep("area"); return; }
  if (!typeReady) { setVisible(decisionPanel, true); setVisible(swipeLayout, false); setVisible(resultsPanel, false); renderDecisionStep("type"); return; }

  searchSummary.textContent = (() => {
    const area = state.group.search?.area;
    const activity = state.group.search?.activity;
    if (area && activity) return `${activity} in ${area}`;
    return `${t("searchFrom")}: "${state.group.search?.query || ""}"`;
  })();
  setVisible(decisionPanel, false);
  setVisible(resultsPanel, true);
  renderResults();

  const totalPlaces = state.group.places || [];
  if (state.index < totalPlaces.length) { setVisible(swipeLayout, true); renderCard(); }
  else {
    setVisible(swipeLayout, false);
    if (state.placesExhausted || state.group.placesExhausted) renderResults();
  }
  if (continueBrowseButton) {
    const exhausted = state.placesExhausted || state.group.placesExhausted;
    setVisible(continueBrowseButton, Boolean(consensus("area") && consensus("type") && state.index >= totalPlaces.length && !exhausted));
  }
}

// ====== GROUP POLLING ======
async function refreshGroup() {
  if (!state.groupCode) return;
  try {
    const data = await api(`/api/groups/${state.groupCode}`);
    state.group = data.group;
    state.pollErrorCount = 0;
    if (state.activePage) {
      return;
    }
    renderApp();
  } catch (error) {
    state.pollErrorCount = (state.pollErrorCount || 0) + 1;
    if (state.pollErrorCount >= 5) { showError(error.message); leaveGroup(); }
  }
}

function startPolling() {
  clearInterval(state.pollTimer);
  clearInterval(state.notifTimer);
  state.pollTimer  = setInterval(refreshGroup,          1500);
  state.notifTimer = setInterval(refreshNotifications,  5000);
}

function saveSession(user, group) {
  state.user = user; state.group = group; state.groupCode = group.code;
  state.setupMode = ""; state.index = 0; state.pollErrorCount = 0;
  localStorage.setItem("planswipe:user", JSON.stringify(user));
  localStorage.setItem("planswipe:groupCode", group.code);
  startPolling(); renderApp();
}

// ====== GROUP ACTIONS ======
async function createGroup() {
  const username = currentUsername() || "Friend";
  if (!state.account?.profile?.ageGroup) { redirectForAgeGroup(); return; }
  const data = await api("/api/groups", { method: "POST", body: { username, profile: state.account?.profile, groupName: groupInput.value.trim() } });
  saveSession(data.user, data.group);
}

async function joinGroup() {
  const username = currentUsername() || "Friend";
  if (!state.account?.profile?.ageGroup) { redirectForAgeGroup(); return; }
  const code = codeInput.value.trim();
  if (!/^\d{8}$/.test(code)) { showError(t("enterGroupCode")); return; }
  const data = await api(`/api/groups/${code}/join`, { method: "POST", body: { username, profile: state.account?.profile } });
  saveSession(data.user, data.group);
}

function redirectForAgeGroup() {
  state.showAgeGroupModal = true;
  state.returnRoute = state.activePage ? window.location.pathname : "/main";
  state.activePage = "personal";
  navigate("/personal");
}

async function chooseOption(kind, optionId, customLabel = "") {
  const data = await api(`/api/groups/${state.group.code}/choice`, { method: "POST", body: { userId: state.user.id, kind, optionId, customLabel, useAiSuggestions: state.useAiSuggestions } });
  if (kind === "area") state.pendingAreaOption = null;
  state.index = 0; state.group = data.group; renderApp();
}

async function goBackChoice() {
  if (!state.group || !state.user) return;
  if (state.pendingAreaOption) {
    state.pendingAreaOption = null;
    renderDecisionStep("area");
    return;
  }
  const step = (consensus("area") && !consensus("type")) ? "type" : "area";
  const data = await api(`/api/groups/${state.group.code}/back`, { method: "POST", body: { userId: state.user.id, step } });
  state.index = 0; state.pendingAreaOption = null; state.placesExhausted = false;
  state.group = data.group; renderApp();
}

async function vote(value) {
  if (state.votingInProgress) return;
  const places = state.group.places || [];
  const place = places[state.index];
  if (!place) return;
  state.votingInProgress = true;
  [noButton, maybeButton, yesButton].forEach((btn) => { if (btn) btn.classList.add("is-voting"); });
  activityCard.classList.add(value === "yes" ? "swipe-yes" : "swipe-no");
  try {
    const data = await api(`/api/groups/${state.group.code}/vote`, { method: "POST", body: { userId: state.user.id, placeId: place.id, vote: value } });
    state.group = data.group;
    setTimeout(() => { state.index += 1; state.votingInProgress = false; renderApp(); }, 170);
  } catch (e) {
    state.votingInProgress = false;
    activityCard.classList.remove("swipe-yes", "swipe-no");
    [noButton, maybeButton, yesButton].forEach((btn) => { if (btn) btn.classList.remove("is-voting"); });
    throw e;
  }
}

async function selectPlace(placeId) {
  const data = await api(`/api/groups/${state.group.code}/select-place`, { method: "POST", body: { userId: state.user.id, placeId } });
  state.group = data.group;
  renderResults();
}

async function addOwnPlace() {
  const favourites = getPreferences().places || [];
  const favText = favourites.length ? `\n\n${t("useFavourite")}: ${favourites.join(", ")}` : "";
  const title = prompt(`${t("addYourOwnPlace")}${favText}`);
  if (!title?.trim()) return;
  const favourite = favourites.find((item) => item.toLowerCase() === title.trim().toLowerCase());
  const data = await api(`/api/groups/${state.group.code}/custom-place`, {
    method: "POST",
    body: {
      title: title.trim(),
      description: favourite ? `${t("useFavourite")}: ${favourite}` : "",
      area: state.group.search?.area || "",
      category: state.group.search?.activity || ""
    }
  });
  state.group = data.group;
  state.index = Math.max(0, (state.group.places || []).length - 1);
  renderApp();
}

function leaveGroup() {
  clearInterval(state.pollTimer); clearInterval(state.notifTimer);
  removeChatButton();
  state.user = null; state.group = null; state.groupCode = "";
  state.index = 0; state.setupMode = ""; state.pendingAreaOption = null; state.pollErrorCount = 0;
  localStorage.removeItem("planswipe:user"); localStorage.removeItem("planswipe:groupCode");
  renderApp();
}

function logout() {
  if (state.supabaseClient) state.supabaseClient.auth.signOut().catch((e) => console.warn(e.message));
  state.supabaseSession = null; leaveGroup();
  state.activePage = ""; state.loginOpen = false; state.showHero = false;
  localStorage.removeItem("planswipe:login"); localStorage.removeItem("planswipe:email");
  localStorage.removeItem("planswipe:account"); state.account = null;
  navigate("/home");
}

function addToFavourites(place) {
  if (!place || !place.title) return;
  const profile = state.account?.profile || {};
  const preferences = { ...(profile.preferences || {}), places: [...(profile.preferences?.places || [])] };
  const title = place.title.trim();
  if (!preferences.places.some((p) => p.toLowerCase() === title.toLowerCase())) {
    preferences.places.push(title);
    api("/api/account", { method: "PATCH", body: { username: currentUsername(), profile: { ...profile, preferences } } })
      .then((data) => { saveAccount(data.user); renderCard(); })
      .catch((err) => showError(err.message));
  } else {
    showError(t("alreadyInFavourites"));
  }
}

// ====== CONTINUE BROWSING ======
async function continueBrowsing() {
  if (!state.group) return;
  const btn = continueBrowseButton;
  if (btn) { btn.disabled = true; btn.textContent = t("loadingPlaces"); }
  try {
    const prevCount = state.group.places?.length || 0;
    const data = await api(`/api/groups/${state.group.code}/more-places`, {
      method: "POST",
      body: { username: currentUsername(), useAiSuggestions: state.useAiSuggestions }
    });
    state.group = data.group;
    if (data.exhausted || !data.places?.length) {
      state.placesExhausted = true;
      state.group.placesExhausted = true;
    } else {
      state.index = prevCount;
    }
    renderApp();
  } catch (e) {
    if (e.message.includes("No more places")) {
      state.placesExhausted = true;
      if (state.group) state.group.placesExhausted = true;
      renderApp();
    } else {
      showError(e.message);
    }
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = t("continueBrowsing"); }
  }
}

// ====== SUBSCRIPTION PAGE ======
async function renderSubscriptionPage() {
  pageEyebrow.textContent = t("subscription");
  pageTitle.textContent = t("subscription");
  let currentPlan = "free";
  try {
    const subData = await api(`/api/subscription/status?username=${encodeURIComponent(currentUsername())}`);
    currentPlan = subData.plan || "free";
  } catch (_) {}
  const isPro = currentPlan === "pro";
  pageDemo.innerHTML = `
    <div class="subscription-layout">
      <div class="subscription-card${!isPro ? " pro-card" : ""}">
        <h3>${t("free")}</h3>
        <div class="price">\u20ac0 <small>/month</small></div>
        <p>${t("freePlanDesc")}</p>
        <ul class="features">
          <li>Join up to 3 groups</li>
          <li>Basic swiping & voting</li>
          <li>Limited group chat</li>
          <li>Standard support</li>
          <li class="disabled">AI-powered suggestions</li>
          <li class="disabled">Priority support</li>
          <li class="disabled">Unlimited chat history</li>
        </ul>
        ${isPro ? `<span class="current-plan-badge">${t("includedInYourPlan")}</span>` : `<span class="current-plan-badge">${t("currentPlan")}</span>`}
      </div>
      <div class="subscription-card pro-card">
        ${isPro ? `<span class="pro-badge">${t("pro")}</span>` : ""}
        <h3>${t("pro")}</h3>
        <div class="price">\u20ac5.99 <small>/month</small></div>
        <p>${t("proPlanDesc")}</p>
        <ul class="features">
          <li>Unlimited groups</li>
          <li>AI-powered suggestions</li>
          <li>Priority support</li>
          <li>Advanced filters</li>
          <li>Unlimited chat history</li>
          <li>Early access to new features</li>
        </ul>
        ${isPro ? `<span class="current-plan-badge">${t("currentPlan")}</span>` : `<button class="btn-primary" type="button" id="upgradeToProBtn">${t("upgradeToPro")}</button>`}
      </div>
    </div>`;
}

async function handleUpgradeToPro() {
  const btn = document.querySelector("#upgradeToProBtn");
  if (btn) { btn.disabled = true; btn.textContent = t("loadingPlaces"); }
  try {
    const data = await api("/api/subscription/create-checkout", {
      method: "POST",
      body: {
        username: currentUsername(),
        priceId: "pro_monthly",
        successUrl: window.location.origin + "/subscription?success=1",
        cancelUrl: window.location.origin + "/subscription?canceled=1"
      }
    });
    if (data.demo) {
      alert(t("subscribedThanks"));
      await renderSubscriptionPage();
    } else if (data.url) {
      window.location.href = data.url;
    }
  } catch (e) {
    alert(t("subscriptionError"));
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = t("upgradeToPro"); }
  }
}

// ====== PAGE PANEL RENDERS ======
const pageContent = {
  likedplaces: { title: "Liked Places", eyebrow: "History" },
  groups: { title: "My Groups", eyebrow: "Groups" },
  friends: { title: "Friends", eyebrow: "People" },
  messages: { title: "Messages", eyebrow: "Chat" },
  past: { title: "Past Activities", eyebrow: "History" },
  personal: { title: "Personal Information", eyebrow: "Profile" },
  settings: { title: "Settings", eyebrow: "Account" },
  subscription: { title: "Subscription", eyebrow: "Plan" }
};

function preferenceList(title, key, items, placeholder) {
  const readonly = key.startsWith("readonly-");
  return `<div class="preference-box">
    <h3>${escapeHtml(title)}</h3>
    <div class="pill-row">${(items || []).map((item) => `<span class="preference-pill">${escapeHtml(item)}</span>`).join("") || `<span class="muted-text">${t("nothingSaved")}</span>`}</div>
    ${!readonly ? `<div class="inline-add"><input type="text" data-pref-input="${escapeHtml(key)}" placeholder="${escapeHtml(placeholder)}"><button type="button" data-pref-add="${escapeHtml(key)}">Add</button></div>` : ""}
  </div>`;
}

function profileImage(user, sizeClass = "profile-preview") {
  const picture = user?.profile?.picture || "";
  if (picture) return `<span class="${sizeClass} image-avatar" style="background-image:url('${escapeHtml(picture)}')"></span>`;
  return `<span class="${sizeClass}">${escapeHtml(initials(user?.username || currentUsername()) || "P")}</span>`;
}

async function renderPersonalInformation() {
  const account = await loadAccount();
  const profile = account.profile || {};
  const preferences = profile.preferences || {};
  pageDemo.innerHTML = `
    <form class="personal-form"><section><h3>${t("personal")}</h3>
      <label class="profile-upload">${profileImage(account)}<span>${t("editProfilePicture")}</span><input id="profilePictureInput" type="file" accept="image/*"></label>
      <label class="field"><span>${t("username")}</span><input type="text" value="${escapeHtml(account.username)}" disabled></label>
      <label class="field"><span>${t("email")}</span><input type="email" value="${escapeHtml(account.email || "")}" disabled></label>
      <label class="field"><span>${t("ageGroup")}</span><select id="profileAgeGroup">
        <option value="">${escapeHtml(t("ageGroup"))}</option>
        ${ageGroups.map((group) => `<option value="${escapeHtml(group)}" ${profile.ageGroup === group ? "selected" : ""}>${escapeHtml(group)}</option>`).join("")}
      </select></label>
      <label class="field"><span>${t("password")}</span>
        <input id="profileOldPassword" type="password" placeholder="${t("oldPassword")}">
        <input id="profileNewPassword" type="password" placeholder="${t("newPassword")}">
        <input id="profileVerifyPassword" type="password" placeholder="${t("verifyPassword")}">
        <button class="btn-ghost" type="button" id="changePasswordButton">${t("changePassword")}</button>
        <button type="button" id="profileForgotPassword" class="hyperlink-button" style="background:none;border:none;color:var(--green);cursor:pointer;text-decoration:underline;font-size:0.85rem;padding:4px 0;text-align:left;">${escapeHtml(t("forgotPassword"))}</button>
      </label>
      <label class="field"><span>${t("bio")}</span><textarea id="profileBio" rows="3" placeholder="${t("bioPlaceholder")}">${escapeHtml(profile.bio || "")}</textarea></label>
      <button class="btn-primary" type="button" id="saveProfileButton" style="width:100%">${t("saveProfile")}</button>
    </section><section><h3>${t("preferences")}</h3>
      ${preferenceList(t("favouriteAreas"), "areas", preferences.areas, t("addAnotherArea"))}
      ${preferenceList(t("favouriteActivities"), "activities", preferences.activities, t("addAnotherActivity"))}
      ${preferenceList(t("favouritePlaces"), "places", preferences.places, t("addAnotherPlace"))}
    </section></form>`;
}

function userCard(user, action = "") {
  const preferences = user.profile?.preferences || {};
  const preferenceText = [...(preferences.areas || []), ...(preferences.activities || []), ...(preferences.places || [])].slice(0, 4).join(", ");
  return `<article class="demo-card user-card"><div class="user-card-head">${profileImage(user, "small-profile-preview")}<div><h3>${escapeHtml(user.username)}</h3><p>${escapeHtml(user.profile?.bio || "")}</p></div></div><p>${escapeHtml(preferenceText || "")}</p>${action}</article>`;
}

async function renderFriendsPage() {
  pageDemo.innerHTML = `
    <section class="wide-panel"><div class="inline-add">
      <input id="friendSearchInput" type="text" placeholder="${t("searchByUsername")}">
      <button id="friendSearchButton" type="button">${t("search")}</button></div>
      <div id="friendSearchResults" class="demo-grid"></div>
    </section>
    <section class="wide-panel"><h3>${t("friends")}</h3><div id="friendList" class="demo-grid"></div></section>
    <section class="wide-panel"><h3>${t("requests")}</h3><div id="requestList" class="demo-grid"></div></section>`;
  state.friendsLastRequestCount = -1;
  await refreshFriendsPage();
  state.friendsLastRequestCount = state.notifications.friendRequests || 0;
}

async function refreshFriendsPage() {
  const data = await api(`/api/friends?username=${encodeURIComponent(currentUsername())}`);
  state.friendsData = data;
  state.friendsDataLoaded = true;
  const friendList = document.querySelector("#friendList");
  const requestList = document.querySelector("#requestList");
  if (!friendList || !requestList) return;

  friendList.innerHTML = data.friends.length
    ? data.friends.map((u) => userCard(u, `<div class="result-buttons"><button class="btn-ghost" type="button" data-view-profile="${escapeHtml(u.username)}">${t("viewProfile")}</button><button class="btn-primary" type="button" data-message-friend="${escapeHtml(u.username)}">${t("message")}</button></div>`)).join("")
    : `<article class="demo-card"><h3>${t("noFriends")}</h3><p>${t("searchByUsername")}</p></article>`;

  const allRequests = [
    ...data.incoming.map((u) => userCard(u, `<button class="btn-primary" type="button" data-accept-friend="${escapeHtml(u.username)}">${t("accept")}</button>`)),
    ...data.outgoing.map((u) => userCard(u, `<span class="request-status">${t("requestSent")}</span>`))
  ];
  requestList.innerHTML = allRequests.length
    ? allRequests.join("")
    : `<article class="demo-card"><h3>${t("noPending")}</h3></article>`;

  state.friendsLastRequestCount = data.incoming?.length || 0;
  if (state.notifications) state.notifications.friendRequests = state.friendsLastRequestCount;
}

async function renderMessagesPage() {
  pageEyebrow.textContent = t("messages");
  pageTitle.textContent = t("messages");
  try {
    const data = await api(`/api/messages/conversations?username=${encodeURIComponent(currentUsername())}`);
    const conversations = data.conversations || [];
    if (!conversations.length) {
      pageDemo.innerHTML = `<article class="demo-card"><h3>${t("noConversations")}</h3><p>${t("startMessaging")}</p></article>`;
      return;
    }
    pageDemo.innerHTML = `<div class="conversation-list">${conversations.map((conv) => `
      <article class="group-card ${conv.unread > 0 ? 'has-unread' : ''}" data-conversation="${escapeHtml(conv.with)}">
        <h3>${escapeHtml(conv.with)}${conv.unread > 0 ? `<span class="group-unread-badge">${conv.unread > 99 ? '99+' : conv.unread}</span>` : ""}</h3>
        <p class="group-meta">${escapeHtml(conv.lastMessage ? conv.lastMessage.slice(0, 60) : "")}</p>
        <div class="group-actions"><button class="btn-primary" type="button" data-open-dm="${escapeHtml(conv.with)}">${t("message")}</button></div>
      </article>`).join("")}</div>`;
  } catch (e) {
    console.warn("Messages load error:", e.message);
    pageDemo.innerHTML = `<article class="demo-card"><h3>${t("noConversations")}</h3></article>`;
  }
}

async function openDirectMessage(otherUsername) {
  // Remove any existing DM chat overlay
  document.querySelector("#dmChatOverlay")?.remove();
  
  const overlay = document.createElement("div");
  overlay.id = "dmChatOverlay";
  overlay.className = "chat-overlay";
  overlay.innerHTML = `
    <div class="chat-panel" id="dmChatPanel">
      <div class="chat-header">
        <span id="dmChatTitle">${escapeHtml(t("message"))} \u2014 ${escapeHtml(otherUsername)}</span>
        <button class="chat-close-btn" id="dmChatCloseBtn" aria-label="${t("closeChat")}">\u2715</button>
      </div>
      <div class="chat-messages" id="dmChatMessages"><div class="chat-loading">\u2026</div></div>
      <div class="chat-input-row">
        <input id="dmChatMessageInput" type="text" maxlength="500" placeholder="${escapeHtml(t("typeMessage"))}" autocomplete="off">
        <button id="dmChatSendButton" class="btn-primary">${t("sendMessage")}</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  
  state.dmChatOtherUsername = otherUsername;
  
  overlay.querySelector("#dmChatCloseBtn").addEventListener("click", () => {
    overlay.remove();
    clearInterval(state.dmMessageTimer);
    state.dmMessageTimer = null;
    state.dmChatOtherUsername = "";
  });
  
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.remove();
      clearInterval(state.dmMessageTimer);
      state.dmMessageTimer = null;
      state.dmChatOtherUsername = "";
    }
  });
  
  const input = overlay.querySelector("#dmChatMessageInput");
  const sendBtn = overlay.querySelector("#dmChatSendButton");
  
  sendBtn.addEventListener("click", () => sendDmMessage(input));
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") sendDmMessage(input); });
  
  await loadDmMessages(true);
  
  clearInterval(state.dmMessageTimer);
  state.dmMessageTimer = setInterval(async () => {
    if (state.dmChatOtherUsername && document.querySelector("#dmChatOverlay")) {
      await loadDmMessages(false);
    }
  }, 3000);
}

async function loadDmMessages(scrollToBottom) {
  const other = state.dmChatOtherUsername;
  if (!other) return;
  const container = document.querySelector("#dmChatMessages");
  if (!container) return;
  try {
    const params = scrollToBottom ? "" : (state.dmChatLastTimestamp ? `&since=${encodeURIComponent(state.dmChatLastTimestamp)}` : "");
    const data = await api(`/api/messages?username=${encodeURIComponent(currentUsername())}&with=${encodeURIComponent(other)}${params}`);
    const messages = data.messages || [];
    
    if (scrollToBottom) {
      if (messages.length === 0) {
        container.innerHTML = `<div class="chat-empty">${t("noMessagesYet")}</div>`;
        return;
      }
      state.dmChatLastTimestamp = messages[messages.length - 1].created_at;
      const me = currentUsername();
      container.innerHTML = messages.map((msg) => {
        const isMine = msg.sender === me;
        return `<div class="chat-bubble ${isMine ? "chat-bubble-mine" : "chat-bubble-theirs"}"><span class="chat-text">${escapeHtml(msg.message)}</span></div>`;
      }).join("");
      container.scrollTop = container.scrollHeight;
      // Mark as read
      api("/api/messages/mark-read", { method: "POST", body: { username: currentUsername(), from: other } }).catch(() => {});
      return;
    }
    
    if (messages.length === 0) return;
    state.dmChatLastTimestamp = messages[messages.length - 1].created_at;
    const me = currentUsername();
    const loading = container.querySelector(".chat-loading, .chat-empty");
    if (loading) loading.remove();
    messages.forEach((msg) => {
      const isMine = msg.sender === me;
      const bubble = document.createElement("div");
      bubble.className = `chat-bubble ${isMine ? "chat-bubble-mine" : "chat-bubble-theirs"}`;
      bubble.innerHTML = `<span class="chat-text">${escapeHtml(msg.message)}</span>`;
      container.appendChild(bubble);
    });
    container.scrollTop = container.scrollHeight;
  } catch (e) { console.warn("DM chat load error:", e.message); }
}

async function sendDmMessage(input) {
  const message = (input?.value || "").trim();
  const other = state.dmChatOtherUsername;
  if (!message || !other) return;
  input.value = ""; input.disabled = true;
  try {
    await api("/api/messages", { method: "POST", body: { from: currentUsername(), to: other, message } });
    await loadDmMessages(true);
    // Refresh notifications to update the dm badge
    refreshNotifications();
  } catch (e) { showError(e.message); }
  finally { input.disabled = false; input.focus(); }
}

async function renderGroupsPage() {
  const data = await api(`/api/groups/mine?username=${encodeURIComponent(currentUsername())}`);
  const active = data.groups || [];
  const past = data.pastGroups || [];
  
  let groupInvites = [];
  try {
    const accountData = await loadAccount();
    groupInvites = accountData.profile?.groupInvites || [];
  } catch (_) {}

  let html = `<h3 class="group-section-title">${t("activeGroups")}</h3>`;
  html += active.length
    ? active.map((g) => `<article class="group-card"><h3>${escapeHtml(g.name)}${g.unreadCount > 0 ? `<span class="group-unread-badge">${g.unreadCount > 99 ? "99+" : g.unreadCount}</span>` : ""}</h3><p class="group-meta">Code ${escapeHtml(g.code)} | ${g.memberCount} member${g.memberCount === 1 ? "" : "s"}</p><div class="group-actions"><button class="btn-primary" type="button" data-open-group="${escapeHtml(g.code)}">Open</button><button class="danger-button" type="button" data-exit-group="${escapeHtml(g.code)}">${t("exitGroupPermanent")}</button></div></article>`).join("")
    : `<article class="demo-card"><h3>${t("noActiveGroups")}</h3></article>`;

  html += `<h3 class="group-section-title">${t("groupInvites")}</h3>`;
  html += groupInvites.length
    ? groupInvites.map((inv) => `<article class="group-card group-invite-card"><h3>${escapeHtml(inv.groupName)}</h3><p class="group-meta">${t("inviteFriends")}: ${escapeHtml(inv.fromUsername)}</p><div class="group-actions"><button class="btn-primary" type="button" data-accept-invite="${escapeHtml(inv.groupCode)}">${t("accept")}</button><button class="btn-ghost danger-button" type="button" data-decline-invite="${escapeHtml(inv.groupCode)}">${t("decline")}</button></div></article>`).join("")
    : `<article class="demo-card"><h3>${t("noGroupInvites")}</h3></article>`;

  html += `<h3 class="group-section-title">${t("pastGroups")}</h3>`;
  html += past.length
    ? past.map((g) => `<article class="group-card"><h3>${escapeHtml(g.name)}</h3><p class="group-meta">Code ${escapeHtml(g.code)} | ${g.memberCount || 0} member${(g.memberCount || 0) === 1 ? "" : "s"}</p></article>`).join("")
    : `<article class="demo-card"><h3>${t("noPastGroups")}</h3></article>`;

  pageDemo.innerHTML = html;
}

async function renderLikedPlacesPage() {
  pageEyebrow.textContent = t("likedPlaces");
  pageTitle.textContent = t("likedPlaces");
  try {
    const data = await api(`/api/liked-places?username=${encodeURIComponent(currentUsername())}`);
    const places = data.places || [];
    pageDemo.innerHTML = places.length
      ? places.map((item) => `<div class="liked-place-card"><h3>${escapeHtml(item.place)}</h3><p>${escapeHtml(item.area)} | ${escapeHtml(item.activity)}</p><span class="vote-tag ${escapeHtml(item.vote)}">${escapeHtml(item.vote)}</span><span class="group-meta">${escapeHtml(item.groupName || "")}</span></div>`).join("")
      : `<article class="demo-card"><h3>${t("noLikedPlaces")}</h3></article>`;
  } catch (e) {
    console.warn("Liked places load error:", e.message);
    pageDemo.innerHTML = `<article class="demo-card"><h3>${t("noLikedPlaces")}</h3></article>`;
  }
}

async function renderPastPage() {
  const account = await loadAccount();
  const activities = account.profile?.pastActivities || [];
  pageDemo.innerHTML = `
    <section class="wide-panel"><button class="btn-primary" type="button" id="showPastActivityForm">${t("logPastActivity")}</button>
    <form class="setup-form is-hidden" id="pastActivityForm">
      <label class="field"><span>${t("area")}</span><input id="pastAreaInput" type="text" placeholder="Athens seaside"></label>
      <label class="field"><span>${t("activity")}</span><input id="pastActivityInput" type="text" placeholder="Dinner"></label>
      <label class="field"><span>${t("place")}</span><input id="pastPlaceInput" type="text" placeholder="Restaurant name"></label>
      <button class="btn-primary" type="button" id="savePastActivityButton">${t("saveActivity")}</button>
    </form></section>
    ${activities.length ? activities.map((a, idx) => `<article class="demo-card"><h3>${escapeHtml(a.place)}</h3><p>${escapeHtml(a.area)} | ${escapeHtml(a.activity)}</p><div class="result-buttons" style="margin-top:8px;"><button class="btn-primary" type="button" data-past-fav="${idx}" style="font-size:0.85rem;min-height:34px;padding:0 12px;">${t("addToFavourites")}</button><button class="danger-button" type="button" data-past-remove="${idx}" style="font-size:0.85rem;min-height:34px;padding:0 12px;">${t("remove")}</button></div></article>`).join("") : `<article class="demo-card"><h3>${t("noPastActivities")}</h3></article>`}`;
}

async function savePastActivity() {
  const area = document.querySelector("#pastAreaInput")?.value.trim();
  const activity = document.querySelector("#pastActivityInput")?.value.trim();
  const place = document.querySelector("#pastPlaceInput")?.value.trim();
  if (!area || !activity || !place) { showError(t("fieldsRequired")); return; }
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
  pageEyebrow.textContent = t("viewProfile");
  pageTitle.textContent = user.username;

  const friendAction = user.username === currentUsername() ? "" :
    user.friendStatus === "friends" ? `<div class="result-buttons"><span class="request-status">${t("friends")}</span><button class="btn-primary" type="button" data-message-friend="${escapeHtml(user.username)}">${t("message")}</button></div>` :
    user.friendStatus === "incoming" ? `<button class="btn-primary" type="button" data-accept-friend="${escapeHtml(user.username)}">${t("accept")}</button>` :
    user.friendStatus === "requested" ? `<span class="request-status">${t("requestSent")}</span>` :
    `<button class="btn-primary" type="button" data-add-friend="${escapeHtml(user.username)}">Add Friend</button>`;

  const removeAction = user.friendStatus === "friends" && user.username !== currentUsername()
    ? `<button class="danger-button" type="button" data-remove-friend="${escapeHtml(user.username)}">${t("removeFriend")}</button>` : "";

  pageDemo.innerHTML = `${userCard(user, friendAction)}${removeAction ? `<section class="wide-panel">${removeAction}</section>` : ""}<section class="wide-panel"><h3>${t("preferences")}</h3>${preferenceList(t("favouriteAreas"), "readonly-areas", preferences.areas, "")}${preferenceList(t("favouriteActivities"), "readonly-activities", preferences.activities, "")}${preferenceList(t("favouritePlaces"), "readonly-places", preferences.places, "")}</section>`;
}

async function renderSettingsPage() {
  const settings = state.account?.profile?.settings || {};
  pageEyebrow.textContent = t("settings");
  pageTitle.textContent = t("settings");
  pageDemo.innerHTML = `
    <section class="wide-panel personal-form"><h3>${t("notifications")}</h3>
      <div class="settings-toggle"><label for="notifFriendReq">${t("friendRequestNotif")}</label><input type="checkbox" id="notifFriendReq" ${settings.friendRequestNotif !== false ? "checked" : ""}></div>
      <div class="settings-toggle"><label for="notifGroupInvite">${t("groupInviteNotif")}</label><input type="checkbox" id="notifGroupInvite" ${settings.groupInviteNotif !== false ? "checked" : ""}></div>
    </section>
    <section class="wide-panel personal-form"><h3>${t("privacy")}</h3>
      <div class="settings-toggle"><label for="privacyOnline">${t("showOnlineStatus")}</label><input type="checkbox" id="privacyOnline" ${settings.showOnlineStatus !== false ? "checked" : ""}></div>
      <div class="settings-toggle"><label for="privacyPublic">${t("showProfilePublicly")}</label><input type="checkbox" id="privacyPublic" ${settings.showProfilePublicly !== false ? "checked" : ""}></div>
    </section>
    <button class="btn-primary" type="button" id="saveSettingsButton">${t("saveSettings")}</button>
    <section class="wide-panel personal-form" style="margin-top:18px;border-top:2px solid var(--red);"><h3 style="color:var(--red);">${t("accountManagement")}</h3><button class="danger-button" type="button" id="deleteAccountButton">${t("deleteAccount")}</button></section>`;
}

async function saveSettings() {
  const profile = state.account?.profile || {};
  const data = await api("/api/account", { method: "PATCH", body: { username: currentUsername(), profile: { ...profile, settings: { friendRequestNotif: document.querySelector("#notifFriendReq")?.checked !== false, groupInviteNotif: document.querySelector("#notifGroupInvite")?.checked !== false, showOnlineStatus: document.querySelector("#privacyOnline")?.checked !== false, showProfilePublicly: document.querySelector("#privacyPublic")?.checked !== false } } } });
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
  if (content) { pageEyebrow.textContent = content.eyebrow; pageTitle.textContent = content.title; }
  if (state.activePage === "personal") {
    state.pageShellRendered = "personal";
    renderPersonalInformation().then(() => {
      if (state.showAgeGroupModal) showAgeGroupPopup();
    }).catch((e) => showError(e.message));
    return;
  }
  if (state.activePage === "messages") {
    state.pageShellRendered = "messages";
    renderMessagesPage().catch((e) => showError(e.message));
    return;
  }
  if (state.activePage === "friends") {
    if (state.pageShellRendered !== "friends") {
      state.pageShellRendered = "friends";
      renderFriendsPage().catch((e) => showError(e.message));
    }
    return;
  }
  if (state.pageShellRendered === "friends") {
    state.pageShellRendered = "";
    state.friendsLastRequestCount = -1;
  }
  if (state.activePage === "groups") {
    if (state.pageShellRendered !== "groups") {
      state.pageShellRendered = "groups";
      renderGroupsPage().catch((e) => showError(e.message));
    }
    return;
  }
  if (state.activePage === "likedplaces") {
    state.pageShellRendered = "likedplaces";
    renderLikedPlacesPage().catch((e) => showError(e.message));
    return;
  }
  if (state.activePage === "past") {
    state.pageShellRendered = "past";
    renderPastPage().catch((e) => showError(e.message));
    return;
  }
  if (state.activePage === "settings") {
    state.pageShellRendered = "settings";
    renderSettingsPage().catch((e) => showError(e.message));
    return;
  }
  if (state.activePage === "subscription") {
    state.pageShellRendered = "subscription";
    renderSubscriptionPage().catch((e) => showError(e.message));
    return;
  }
  if (state.activePage.startsWith("profile:")) {
    state.pageShellRendered = state.activePage;
    renderAccountProfile(state.activePage.slice("profile:".length)).catch((e) => showError(e.message));
    return;
  }
}

// ====== PROFILE ACTIONS ======
async function saveProfile() {
  const bio = document.querySelector("#profileBio")?.value || "";
  const ageGroup = document.querySelector("#profileAgeGroup")?.value || "";
  const profile = { ...(state.account?.profile || {}), bio, ageGroup, preferences: state.account?.profile?.preferences || { areas: [], activities: [], places: [] } };
  const data = await api("/api/account", { method: "PATCH", body: { username: currentUsername(), profile } });
  saveAccount(data.user);
  if (ageGroup) state.showAgeGroupModal = false;
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
  else { state.activePage = "friends"; navigate("/friends"); }
}

async function removeFriend(username) {
  if (!confirm(t("removeFriendConfirm"))) return;
  await api("/api/friends/remove", { method: "POST", body: { username: currentUsername(), friendUsername: username } });
  state.friendsDataLoaded = false;
  if (state.activePage === "friends" && state.pageShellRendered === "friends") {
    await refreshFriendsPage();
  } else {
    await renderFriendsPage();
  }
}

async function searchFriends() {
  const input = document.querySelector("#friendSearchInput");
  const results = document.querySelector("#friendSearchResults");
  const query = input?.value.trim() || "";
  if (!results || !query) return;
  const data = await api(`/api/users/search?username=${encodeURIComponent(currentUsername())}&q=${encodeURIComponent(query)}`);
  results.innerHTML = data.users.length ? data.users.map((user) => {
    if (user.friendStatus === "friends") return userCard(user, `<div class="result-buttons"><button class="btn-ghost" type="button" data-view-profile="${escapeHtml(user.username)}">${t("viewProfile")}</button><button class="btn-primary" type="button" data-message-friend="${escapeHtml(user.username)}">${t("message")}</button></div>`);
    if (user.friendStatus === "incoming") return userCard(user, `<button class="btn-primary" type="button" data-accept-friend="${escapeHtml(user.username)}">${t("accept")}</button>`);
    if (user.friendStatus === "requested") return userCard(user, `<span class="request-status">${t("requestSent")}</span>`);
    return userCard(user, `<button class="btn-primary" type="button" data-add-friend="${escapeHtml(user.username)}">Add Friend</button>`);
  }).join("") : `<article class="demo-card"><h3>No users found</h3><p>${t("tryAnotherUsername")}</p></article>`;
}

async function exitGroupPermanently(code) {
  if (!confirm(t("confirmExitGroup"))) return;
  await api("/api/groups/exit", { method: "POST", body: { username: currentUsername(), groupCode: code } });
  if (state.groupCode === code) leaveGroup();
  state.pageShellRendered = "";
  state.activePage = "groups";
  navigate("/groups");
}

async function acceptGroupInvite(groupCode) {
  if (!state.account?.profile?.ageGroup) {
    showModal(t("personal"), t("ageGroupRequired"), [{
      label: t("ok"),
      primary: true,
      action: () => {
        state.showAgeGroupModal = true;
        state.returnRoute = "/groups";
        state.activePage = "personal";
        navigate("/personal");
      }
    }]);
    return;
  }
  try {
    const data = await api(`/api/groups/${groupCode}/join`, {
      method: "POST",
      body: { username: currentUsername(), profile: state.account?.profile }
    });
    const profile = state.account?.profile || {};
    const groupInvites = (profile.groupInvites || []).filter((inv) => inv.groupCode !== groupCode);
    await api("/api/account", { method: "PATCH", body: { username: currentUsername(), profile: { ...profile, groupInvites } } });
    saveAccount({ ...state.account, profile: { ...profile, groupInvites } });
    state.pageShellRendered = "";
    await renderGroupsPage();
    codeInput.value = groupCode;
    state.activePage = "";
    navigate("/main");
  } catch (e) { showError(e.message); }
}

async function declineGroupInvite(groupCode) {
  const profile = state.account?.profile || {};
  const groupInvites = (profile.groupInvites || []).filter((inv) => inv.groupCode !== groupCode);
  await api("/api/account", { method: "PATCH", body: { username: currentUsername(), profile: { ...profile, groupInvites } } });
  saveAccount({ ...state.account, profile: { ...profile, groupInvites } });
  state.pageShellRendered = "";
  await renderGroupsPage();
}

function showModal(title, message, buttons = [{ label: t("ok"), primary: true, action: () => {} }]) {
  document.querySelector("#appModal")?.remove();
  const overlay = document.createElement("div");
  overlay.id = "appModal";
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-panel" role="dialog" aria-modal="true">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(message)}</p>
      <div class="modal-actions">${buttons.map((btn, i) =>
        `<button class="${btn.primary ? "btn-primary" : "btn-ghost"}" type="button" data-modal-btn="${i}">${escapeHtml(btn.label)}</button>`
      ).join("")}</div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelectorAll("[data-modal-btn]").forEach((el, i) => {
    el.addEventListener("click", () => { overlay.remove(); buttons[i]?.action?.(); });
  });
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
}

function showAgeGroupPopup() {
  if (!state.showAgeGroupModal) return;
  showModal(t("personal"), t("ageGroupRequired"), [{
    label: t("ok"),
    primary: true,
    action: () => { state.showAgeGroupModal = false; }
  }]);
}

async function openInviteModal() {
  if (!state.group) return;
  const data = await api(`/api/friends?username=${encodeURIComponent(currentUsername())}`);
  const memberNames = new Set((state.group.members || []).map((m) => m.username));
  const friends = (data.friends || []).filter((f) => !memberNames.has(f.username));
  if (!friends.length) {
    showModal(t("inviteToGroup"), t("noFriendsToInvite"), [{ label: t("ok"), primary: true }]);
    return;
  }
  document.querySelector("#appModal")?.remove();
  const overlay = document.createElement("div");
  overlay.id = "appModal";
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-panel" role="dialog" aria-modal="true">
      <h3>${escapeHtml(t("inviteFriends"))}</h3>
      <p>${escapeHtml(t("inviteSelectFriends"))}</p>
      <div class="invite-friend-list" id="inviteFriendList">
        ${friends.map((f) => `<label class="invite-friend-item"><input type="checkbox" value="${escapeHtml(f.username)}"> ${escapeHtml(f.username)}</label>`).join("")}
      </div>
      <div class="modal-actions">
        <button class="btn-ghost" type="button" id="inviteCancelBtn">${escapeHtml(t("cancel"))}</button>
        <button class="btn-primary" type="button" id="inviteSendBtn">${escapeHtml(t("sendInvites"))}</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector("#inviteCancelBtn").addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  overlay.querySelectorAll(".invite-friend-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      if (e.target.tagName === "INPUT") return;
      const cb = item.querySelector("input");
      cb.checked = !cb.checked;
      item.classList.toggle("is-selected", cb.checked);
    });
    item.querySelector("input").addEventListener("change", (e) => {
      item.classList.toggle("is-selected", e.target.checked);
    });
  });
  overlay.querySelector("#inviteSendBtn").addEventListener("click", async () => {
    const selected = [...overlay.querySelectorAll("#inviteFriendList input:checked")].map((el) => el.value);
    if (!selected.length) return;
    try {
      await api(`/api/groups/${state.group.code}/invite`, {
        method: "POST",
        body: { fromUsername: currentUsername(), usernames: selected }
      });
      overlay.remove();
      showModal(t("inviteToGroup"), t("inviteSent"), [{ label: t("ok"), primary: true }]);
    } catch (e) { showError(e.message); }
  });
}

function showError(message) {
  const text = String(message ?? "An error occurred. Please try again.").trim() || "An error occurred. Please try again.";
  if (!isLoggedIn()) { alert(text); return; }
  setVisible(statusPanel, true);
  statusPanel.textContent = text;
}

function openLogin() {
  state.authMode = "login";
  state.loginOpen = true; renderApp(); loginUsername.focus();
}

function openSignup() {
  state.authMode = "signup";
  state.loginOpen = true; renderApp(); loginUsername.focus();
}

// ====== BOOT ======
async function boot() {
  applyLanguage();
  await configureSupabaseAuth();

  // Handle password reset from email link
  if (state.supabaseClient && window.location.hash) {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      try {
        const { data, error } = await state.supabaseClient.auth.getSession();
        if (error) throw error;
        state.supabaseSession = data.session;
        if (data.session) {
          // Navigate to /recover to show the password reset form
          window.location.hash = "";
          history.replaceState(null, "", "/recover");
          navigate("/recover");
          return;
        }
      } catch (e) { console.warn("Recovery handler:", e.message); }
    }
    if (hash.includes("access_token") || hash.includes("type=signup")) {
      try {
        const { data, error } = await state.supabaseClient.auth.getSession();
        if (error) throw error;
        state.supabaseSession = data.session;
        if (data.session) {
          const username = data.session.user?.user_metadata?.username || "";
          const email = data.session.user?.email || "";
          if (username && email) {
            try { const user = await syncSupabaseProfile(username, email); setLoggedIn(user.username, user.email || email); saveAccount(user); }
            catch (_) { console.warn("Auto-login skipped: user not found"); }
          }
        }
        window.location.hash = "";
        history.replaceState(null, "", window.location.pathname);
      } catch (e) { console.warn("Email verification handler:", e.message); }
    }
  }

  if (isLoggedIn() && state.supabaseClient) {
    const { data } = await state.supabaseClient.auth.getSession();
    if (!data.session) {
      localStorage.removeItem("planswipe:login"); localStorage.removeItem("planswipe:email");
      localStorage.removeItem("planswipe:account"); state.account = null;
    }
  }

  const options = await api("/api/options");
  state.areas = options.areas;
  state.types = options.types;

  if (isLoggedIn()) await loadAccount().catch(() => null);
  window.addEventListener("popstate", onUrlChange);

  if (isLoggedIn() && state.user && state.groupCode) {
    startPolling();
    await refreshGroup();
    if (["/groups", "/friends", "/messages", "/likedplaces", "/past", "/personal", "/settings", "/subscription"].includes(window.location.pathname)) {
      onUrlChange();
    }
    return;
  }
  const path = window.location.pathname;
  if (path === "/" || path === "" || path === "/home") { navigate(isLoggedIn() ? "/main" : "/home"); }
  else { onUrlChange(); }
}

// ====== EVENT LISTENERS ======
heroEnterButton.addEventListener("click", () => { isLoggedIn() ? navigate("/main") : openLogin(); });
heroLoginButton.addEventListener("click", openLogin);
if (heroSignupButton) heroSignupButton.addEventListener("click", openSignup);
showCreateButton.addEventListener("click", () => { state.setupMode = "create"; renderApp(); });
showJoinButton.addEventListener("click", () => { state.setupMode = "join"; renderApp(); });
backFromCreateButton.addEventListener("click", () => { state.setupMode = ""; renderApp(); });
backFromJoinButton.addEventListener("click", () => { state.setupMode = ""; renderApp(); });
createButton.addEventListener("click", () => createGroup().catch((e) => showError(e.message)));
joinButton.addEventListener("click", () => joinGroup().catch((e) => showError(e.message)));
loginButton.addEventListener("click", () => login().catch((e) => showError(e.message)));
registerButton.addEventListener("click", () => registerUser().catch((e) => showError(e.message)));
[loginUsername, loginEmail, loginPassword].forEach((input) => { input.addEventListener("keydown", (e) => { if (e.key === "Enter") (state.authMode === "signup" ? registerUser() : login()).catch((err) => showError(err.message)); }); });
loginPassword.addEventListener("input", renderPasswordStrength);

forgotPasswordButton.addEventListener("click", () => {
  state.forgotPasswordMode = true;
  renderApp();
});

homeButton.addEventListener("click", () => navigate("/home"));
resetButton.addEventListener("click", () => {
  if (state.group && state.user) {
    leaveGroup();
  } else {
    // "New Group" button was clicked — show create/join UI
    state.setupMode = "";
    navigate("/main");
  }
});
logoutButton.addEventListener("click", logout);

profileButton.addEventListener("click", (e) => { e.stopPropagation(); profileMenu.classList.toggle("is-hidden"); });
profileMenu.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-page]");
  if (btn) {
    state.activePage = btn.dataset.page;
    state.returnRoute = "/main";
    profileMenu.classList.add("is-hidden");
    navigate({ groups: "/groups", friends: "/friends", messages: "/messages", likedplaces: "/likedplaces", past: "/past", personal: "/personal", settings: "/settings", subscription: "/subscription" }[btn.dataset.page] || "/main");
    return;
  }
  if (e.target.closest("#logoutButton")) profileMenu.classList.add("is-hidden");
});
closePageButton.addEventListener("click", () => {
  const dest = state.activePage.startsWith("profile:") ? "/friends"
    : state.activePage === "personal" && state.returnRoute ? state.returnRoute
    : "/main";
  state.activePage = "";
  state.returnRoute = "/main";
  navigate(dest);
});
document.addEventListener("click", (e) => { if (!e.target.closest(".profile-wrap")) profileMenu.classList.add("is-hidden"); });

memberRow.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-username]");
  if (!btn) return;
  state.returnRoute = "/main";
  state.activePage = `profile:${btn.dataset.username}`;
  navigate("/profile/" + encodeURIComponent(btn.dataset.username));
});

noButton.addEventListener("click", () => vote("no").catch((e) => showError(e.message)));
maybeButton.addEventListener("click", () => vote("maybe").catch((e) => showError(e.message)));
yesButton.addEventListener("click", () => vote("yes").catch((e) => showError(e.message)));
backChoiceButton.addEventListener("click", () => goBackChoice().catch((e) => showError(e.message)));
reviewButton.addEventListener("click", () => goBackChoice().catch((e) => showError(e.message)));
if (continueBrowseButton) {
  continueBrowseButton.addEventListener("click", () => continueBrowsing().catch((e) => showError(e.message)));
}
resultList.addEventListener("click", (e) => {
  const selectBtn = e.target.closest("[data-select-place]");
  if (selectBtn) { selectPlace(selectBtn.dataset.selectPlace).catch((err) => showError(err.message)); return; }
  const bookBtn = e.target.closest("[data-book-place]");
  if (bookBtn) { state.selectedBookPlaceId = state.selectedBookPlaceId === bookBtn.dataset.bookPlace ? "" : bookBtn.dataset.bookPlace; renderResults(); return; }
  if (e.target.closest("#addOwnPlaceButton")) { addOwnPlace().catch((err) => showError(err.message)); }
});
[languageButton, appLanguageButton].forEach((btn) => btn.addEventListener("click", toggleLanguage));

if (inviteToGroupButton) {
  inviteToGroupButton.addEventListener("click", () => openInviteModal().catch((e) => showError(e.message)));
}
if (favButton) {
  favButton.addEventListener("click", () => {
    const places = state.group?.places || [];
    const place = places[state.index];
    if (place) addToFavourites(place);
  });
}
if (reviewsButton) {
  reviewsButton.addEventListener("click", async () => {
    const places = state.group?.places || [];
    const place = places[state.index];
    if (!place) return;
    try {
      const data = await api("/api/reviews", { method: "POST", body: { googlePlaceId: place.googlePlaceId || place.id } });
      const reviews = data.reviews || [];
      if (!reviews.length) { showModal(t("reviews"), t("noReviews"), [{ label: t("ok"), primary: true }]); return; }
      const reviewsHtml = reviews.map((r) => `<div style="margin-bottom:10px;padding:10px;border:1px solid var(--line);border-radius:8px;"><strong>${escapeHtml(r.author)}</strong> ${r.rating ? `(${r.rating}/5)` : ""}<p style="margin-top:4px;color:var(--muted);">${escapeHtml(r.text)}</p></div>`).join("");
      showModal(t("reviews"), reviewsHtml, [{ label: t("ok"), primary: true }]);
    } catch (e) { showError(e.message); }
  });
}

optionGrid.addEventListener("click", (e) => {
  const btn = e.target.closest(".option-card");
  if (!btn) return;
  const kind = btn.dataset.kind;
  if (btn.dataset.broadArea === "true") {
    state.pendingAreaOption = findOption("area", btn.dataset.id);
    renderDecisionStep("area");
    return;
  }
  optionGrid.querySelectorAll(".option-card").forEach((card) => card.classList.remove("is-selected"));
  btn.classList.add("is-selected");
  if (btn.dataset.favourite) {
    chooseOption(kind, "", btn.dataset.favourite).catch((err) => showError(err.message)); return;
  }
  if (btn.dataset.custom === "true") {
    const label = prompt(kind === "area" ? "Add an area" : "Add an activity");
    if (!label?.trim()) { btn.classList.remove("is-selected"); return; }
    chooseOption(kind, "", label.trim()).catch((err) => showError(err.message)); return;
  }
  if (btn.dataset.customLabel) {
    chooseOption(kind, "", btn.dataset.customLabel).catch((err) => showError(err.message)); return;
  }
  chooseOption(kind, btn.dataset.id).catch((err) => showError(err.message));
});
optionGrid.addEventListener("change", (e) => {
  if (e.target.id !== "aiSuggestionToggle") return;
  state.useAiSuggestions = e.target.checked;
  localStorage.setItem("planswipe:useAiSuggestions", String(state.useAiSuggestions));
  renderDecisionStep("type");
});

groupInput.addEventListener("keydown", (e) => { if (e.key === "Enter") createGroup().catch((err) => showError(err.message)); });
codeInput.addEventListener("input", () => { codeInput.value = codeInput.value.replace(/\D/g, "").slice(0, 8); });
codeInput.addEventListener("keydown", (e) => { if (e.key === "Enter") joinGroup().catch((err) => showError(err.message)); });

pageDemo.addEventListener("click", (e) => {
  const addFriendBtn = e.target.closest("[data-add-friend]");
  if (addFriendBtn) { requestFriend(addFriendBtn.dataset.addFriend).catch((err) => showError(err.message)); return; }
  const acceptFriendBtn = e.target.closest("[data-accept-friend]");
  if (acceptFriendBtn) { acceptFriend(acceptFriendBtn.dataset.acceptFriend).catch((err) => showError(err.message)); return; }
  const removeFriendBtn = e.target.closest("[data-remove-friend]");
  if (removeFriendBtn) { removeFriend(removeFriendBtn.dataset.removeFriend).catch((err) => showError(err.message)); return; }
  const viewProfileBtn = e.target.closest("[data-view-profile]");
  if (viewProfileBtn) {
    state.returnRoute = "/friends";
    state.activePage = `profile:${viewProfileBtn.dataset.viewProfile}`;
    navigate("/profile/" + encodeURIComponent(viewProfileBtn.dataset.viewProfile));
    return;
  }
  // Message friend buttons
  const messageFriendBtn = e.target.closest("[data-message-friend]");
  if (messageFriendBtn) {
    openDirectMessage(messageFriendBtn.dataset.messageFriend).catch((err) => showError(err.message));
    return;
  }
  // Open DM conversation
  const openDmBtn = e.target.closest("[data-open-dm]");
  if (openDmBtn) {
    openDirectMessage(openDmBtn.dataset.openDm).catch((err) => showError(err.message));
    return;
  }
  const openGroupBtn = e.target.closest("[data-open-group]");
  if (openGroupBtn) { codeInput.value = openGroupBtn.dataset.openGroup; state.activePage = ""; joinGroup().catch((err) => showError(err.message)); return; }
  const exitGroupBtn = e.target.closest("[data-exit-group]");
  if (exitGroupBtn) { exitGroupPermanently(exitGroupBtn.dataset.exitGroup).catch((err) => showError(err.message)); return; }
  const saveProfileBtn = e.target.closest("#saveProfileButton");
  if (saveProfileBtn) { saveProfile().catch((err) => showError(err.message)); return; }
  const saveSettingsBtn = e.target.closest("#saveSettingsButton");
  if (saveSettingsBtn) { saveSettings().catch((err) => showError(err.message)); return; }
  const deleteAccBtn = e.target.closest("#deleteAccountButton");
  if (deleteAccBtn) { deleteAccount().catch((err) => showError(err.message)); return; }
  const prefAddBtn = e.target.closest("[data-pref-add]");
  if (prefAddBtn) { addPreference(prefAddBtn.dataset.prefAdd).catch((err) => showError(err.message)); return; }
  const friendSearchBtn = e.target.closest("#friendSearchButton");
  if (friendSearchBtn) { searchFriends().catch((err) => showError(err.message)); return; }
  const showPastBtn = e.target.closest("#showPastActivityForm");
  if (showPastBtn) { document.querySelector("#pastActivityForm")?.classList.toggle("is-hidden"); return; }
  const savePastBtn = e.target.closest("#savePastActivityButton");
  if (savePastBtn) { savePastActivity().catch((err) => showError(err.message)); return; }
  const forgotPwBtn = e.target.closest("#profileForgotPassword");
  if (forgotPwBtn) {
    navigate("/recover");
    return;
  }
  const changePwBtn = e.target.closest("#changePasswordButton");
  if (changePwBtn) {
    const old = document.querySelector("#profileOldPassword")?.value;
    const pw = document.querySelector("#profileNewPassword")?.value;
    const verify = document.querySelector("#profileVerifyPassword")?.value;
    if (!old || !pw || !verify) { showError(t("fillPasswordFields")); return; }
    if (pw !== verify) { showError(t("passwordMismatch")); return; }
    if (!isStrongPassword(pw)) { showError(t("passwordRequirements")); return; }
    api("/api/change-password", { method: "POST", body: { username: currentUsername(), oldPassword: old, newPassword: pw } })
      .then(() => { alert(t("passwordChanged")); document.querySelector("#profileOldPassword").value = ""; document.querySelector("#profileNewPassword").value = ""; document.querySelector("#profileVerifyPassword").value = ""; })
      .catch((err) => showError(err.message));
    return;
  }
  const upgradeBtn = e.target.closest("#upgradeToProBtn");
  if (upgradeBtn) { handleUpgradeToPro().catch((err) => showError(err.message)); return; }
  const acceptInviteBtn = e.target.closest("[data-accept-invite]");
  if (acceptInviteBtn) { acceptGroupInvite(acceptInviteBtn.dataset.acceptInvite).catch((err) => showError(err.message)); return; }
  const declineInviteBtn = e.target.closest("[data-decline-invite]");
  if (declineInviteBtn) { declineGroupInvite(declineInviteBtn.dataset.declineInvite).catch((err) => showError(err.message)); return; }
  // Handle past activity add to favourites
  const pastFavBtn = e.target.closest("[data-past-fav]");
  if (pastFavBtn) {
    const account = state.account;
    const activities = account?.profile?.pastActivities || [];
    const idx = parseInt(pastFavBtn.dataset.pastFav);
    const activity = activities[idx];
    if (activity) addToFavourites({ title: activity.place });
    return;
  }
  // Handle past activity remove
  const pastRemoveBtn = e.target.closest("[data-past-remove]");
  if (pastRemoveBtn) {
    if (!confirm(t("confirmRemoveActivity"))) return;
    const account = state.account;
    const activities = account?.profile?.pastActivities || [];
    const idx = parseInt(pastRemoveBtn.dataset.pastRemove);
    const newActivities = activities.filter((_, i) => i !== idx);
    const profile = state.account?.profile || {};
    api("/api/account", { method: "PATCH", body: { username: currentUsername(), profile: { ...profile, pastActivities: newActivities } } })
      .then((data) => { saveAccount(data.user); renderPastPage(); })
      .catch((err) => showError(err.message));
    return;
  }
  // Handle reviews button
  const reviewsBtn = e.target.closest("[data-reviews]");
  if (reviewsBtn) {
    const placeId = reviewsBtn.dataset.reviews;
    api("/api/reviews", { method: "POST", body: { googlePlaceId: placeId } })
      .then((data) => {
        const reviews = data.reviews || [];
        if (!reviews.length) { showModal(t("reviews"), t("noReviews"), [{ label: t("ok"), primary: true }]); return; }
        const reviewsHtml = reviews.map((r) => `<div style="margin-bottom:10px;padding:10px;border:1px solid var(--line);border-radius:8px;"><strong>${escapeHtml(r.author)}</strong> ${r.rating ? `(${r.rating}/5)` : ""}<p style="margin-top:4px;color:var(--muted);">${escapeHtml(r.text)}</p></div>`).join("");
        showModal(t("reviews"), reviewsHtml, [{ label: t("ok"), primary: true }]);
      })
      .catch((err) => showError(err.message));
    return;
  }
});

pageDemo.addEventListener("change", (e) => { if (e.target.id === "profilePictureInput") updateProfilePicture(e.target.files?.[0]).catch((err) => showError(err.message)); });
pageDemo.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.id === "friendSearchInput") { e.preventDefault(); searchFriends().catch((err) => showError(err.message)); } });

boot().catch((e) => showError(e.message));

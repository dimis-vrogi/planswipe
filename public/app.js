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
  friendsTab: "friends",
  lastGroupInviteCount: -1,
  lastDmCount: -1,
  groupSig: "",
  lastSeenResetId: null,
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
const reviewButton         = document.querySelector("#reviewButton");
const exitCurrentGroupButton = document.querySelector("#exitCurrentGroupButton");
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
const yesButton            = document.querySelector("#yesButton");
const favButton            = document.querySelector("#favButton");
const undoButton           = document.querySelector("#undoButton");
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
    groupPlans: "Group plans", leaveGroup: "Exit Group", exitGroup: "Back",
    home: "Home", likedPlaces: "Liked Places", groups: "My Groups", friends: "Friends",
    past: "Past Activities", personal: "Personal Information", settings: "Settings", logout: "Logout",
    messages: "Messages",
    message: "Message",
    heroEyebrow: "Group plans, minus the group-chat chaos",
    heroTitle: "The plan your whole group actually agrees on.",
    heroDescription: "PlanSwipe helps your group decide where to go — together. Pick an area and an activity, browse real nearby venues, and vote as a group. Everyone's preferences are weighed automatically, so you land on a place you're all happy with in minutes, not messages.",
    heroNote: "Made for the group chats that can never pick a place.",
    whatPlanswipeIs: "What PlanSwipe is",
    sharedDecisionTool: "One shared way to decide where to go",
    offerText: "Create a group with your friends, agree on the basics, swipe through real options, and watch the winners rise to the top. No polls, no pressure, no 200-message thread that ends in \"idk, you pick\".",
    agreeFaster: "Agree on the basics first", agreeFasterText: "Everyone chooses an area and the type of night out together. Once the group agrees, PlanSwipe takes it from there — no endless back-and-forth.",
    discoverOptions: "Discover real places", discoverOptionsText: "Get live suggestions from Google Maps matched to your group's area and activity, with photos, ratings, hours and reviews — not generic ideas.",
    swipeTip: "Swipe right to like, left to pass",
    place: "Place",
    navHome: "Home", navGroups: "Groups", navSearch: "Search", navFriends: "Friends", navProfile: "Settings",
    appearance: "Appearance", darkMode: "Dark mode", language: "Language",
    lockInPrompt: "You're all agreed! Set a date and time to lock it in.",
    lockPlan: "Lock in plan",
    date: "Date", time: "Time",
    planLocked: "Plan locked",
    goingCount: "going",
    cantMakeCount: "can't make it",
    imIn: "I'm in",
    cantMakeIt: "Can't make it",
    addToCalendar: "Add to calendar",
    downloadIcs: "Download .ics",
    changeDate: "Change date",
    pickDateTime: "Please pick a date and time",
    tieTitle: "It's a tie!",
    tieBody: "A few places are neck and neck. Start a quick runoff to settle it.",
    startRunoff: "Start runoff",
    runoffTitle: "Runoff — pick one",
    runoffWinner: "Winner",
    cancelRunoff: "Cancel runoff",
    dismiss: "Dismiss",
    vote: "vote", votes: "votes",
    openNow: "Open now",
    closedNow: "Closed",
    tutorialTitle: "How voting works",
    tutRight: "Swipe right to like",
    tutLeft: "Swipe left to pass",
    tutNote: "You can also use the buttons below.",
    gotIt: "Got it",
    itsAMatch: "It's a match!",
    matchBody: "Your group agreed on {place}. Time to make it happen!",
    nice: "Nice!",
    yourPlace: "your place",
    moreButton: "More",
    voteAsGroup: "Vote and match together", voteAsGroupText: "Swipe through each spot — right to like, left to pass — and instantly see which places your group agrees on. When everyone's in, you've got your plan.",
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
    changeBasics: "Change basics", exitCurrentGroup: "Exit current group", confirmExitTemp: "Leave this group for now? You can rejoin anytime from My Groups.", noStrongChoice: "No strong choice yet",
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
    yourPeople: "Your people",
    incomingRequests: "Incoming requests",
    sentRequests: "Sent requests",
    searchResults: "Search results",
    noUsersFound: "No users found",
    noBioYet: "",
    session: "Session",
    logoutHint: "You'll be signed out of this device.",
    logoutConfirm: "Are you sure you want to log out?",
    noPastActivities: "No past activities yet",
    placesHistory: "Places & History", viewMore: "View more", viewLess: "View less",
    yourActivity: "Your activity",
    myPlan: "My plan",
    managePlan: "Manage plan",
    onFreePlan: "You're on the Free plan.",
    onProPlan: "You're on the Pro plan.",
    continueBrowsing: "Continue Browsing",
    loadingPlaces: "Loading more places\u2026",
    noMoreSuggestions: "No more places matching your selections. Would you like to change your basics?",
    newGroup: "New Group",
    backToVoting: "Back to Voting",
    exitGroupPermanent: "Exit Group Permanently", deleteSelected: "Delete selected", selectGroup: "Select group", selected: "selected", confirmDeleteGroups: "Delete the selected groups? This can\u2019t be undone.", someGroupsFailed: "Some groups couldn\u2019t be removed. Please try again.",
    confirmExitGroup: "Are you sure you want to permanently leave this group?",
    accountManagement: "Account Management",
    choiceNo: "No", choiceMaybe: "Maybe", choiceYes: "Yes",
    searchFrom: "Search from", searchGooglePlaces: "Google Places",
    searchSample: "sample data", searchCustom: "custom group idea",
    areaSelected: "Area agreed! Now vote on an activity type.",
    fridayCrew: "Friday crew",
    forgotPassword: "Recover Password", username: "Username", email: "Email", password: "Password",
    forgotPasswordQuestion: "Forgot Password?", saveChanges: "Save Changes",
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
    resetPassword: "Reset Password", showPassword: "Show password", hidePassword: "Hide password",
    account: "Account",
    recoveryEmailSent: "If an account exists for {email}, a password reset link has been sent. Check your inbox.",
    passwordResetSuccess: "Password reset successfully!",
    passwordResetSuccessBody: "Your password has been changed. You can now log in with your new password.",
    enterUsernameOrEmail: "Enter your username or email.",
    enterPassword: "Enter your password.",
    usernameOrEmail: "Username or email",
    confirmEmailFirst: "Please confirm your email first — check your inbox for the confirmation link.",
    wrongCredentials: "Wrong username/email or password.",
    usernameRequired: "Username is required.",
    emailRequired: "Email is required.",
    usernameTakenLogin: "That username is already taken. Try logging in instead.",
    emailTakenLogin: "That email is already registered. Try logging in instead.",
    checkEmailTitle: "Almost there!",
    noEmailOnAccount: "No email is set on this account.",
    fromYourFavourites: "From your favourites",
    orTypeNew: "Or type a new one",
    add: "Add",
    addAnArea: "Add an area",
    addAnActivity: "Add an activity",
    commentsLabel: "Comments (Optional)",
    commentsPlaceholder: "e.g. quiet, vegan options, outdoor seating, under \u20ac20",
    updateSuggestions: "Update suggestions",
    updating: "Updating\u2026",
    suggestionsUpdated: "Suggestions updated",
    suggestionsUpdatedBody: "Your suggestions were refreshed with the group's notes in mind.",
    commentsInfoTitle: "What's this for?",
    commentsInfoBody: "Add anything that helps us find better matches for your group \u2014 the vibe you want, budget, dietary needs, accessibility, or things to include or avoid. For example: \u201csomewhere quiet with vegan options, outdoor seating, under \u20ac20 a head.\u201d Your suggestions are ranked with these notes in mind.",
    aiInfoTitle: "How AI filters places",
    aiInfoBody: "AI uses the chosen area, activity type, group age groups, past activities, liked places, and any submitted comments. Comments are treated as strict requirements, so places that clearly conflict with them are excluded.",
    stepComments: "Step 3 of 3",
    commentsStepTitle: "Any notes before we find places?",
    commentsStepHint: "Add requirements like budget, noise level, dietary needs, seating, or things to avoid. You can also skip.",
    backToActivity: "Back to activity",
    submitComment: "Submit comment",
    skip: "Skip",
    commentSubmitted: "Comment submitted",
    groupInvite: "Group invite",
    profileAndSettings: "Profile & Settings",
    searchPlaces: "Search places",
    byName: "By name",
    browse: "Browse",
    allOfAthens: "All of Athens",
    anyCategory: "Any category",
    anyAge: "Any age",
    category: "Category",
    searchByNamePlaceholder: "Place name (e.g. a bar or restaurant)",
    areaFreeTextPlaceholder: "Type an area, neighborhood, or leave blank",
    categoryFreeTextPlaceholder: "Type anything, e.g. sushi, cocktails, cinema",
    ageFreeTextPlaceholder: "type an age group, e.g. 18-24",
    commentsOptional: "Comments (optional)",
    commentsPlaceholder: "Anything else? e.g. vegan options, quiet, budget-friendly, outdoor seating",
    aiFilteredResults: "AI-filtered by area, activity, then age group.",
    enterPlaceName: "Enter a place name to search.",
    chooseCategory: "Choose a category to browse.",
    noPlacesFound: "No places found. Try a different name, area or category.",
    thePlace: "The place",
    sameNameElsewhere: "Same name in other areas",
    similarNearby: "Similar places in this area",
    results: "Results",
    viewDetails: "View details",
    website: "Website",
    openInMaps: "Open in Maps",
    noReviews: "No reviews available.",
    addFriend: "Add Friend",
    requestSent: "Request sent",
    saveNote: "Save note",
    noteSaved: "Note saved",
    noteSavedBody: "Your note will be used to pick the best places for your group.",
    searchPlacesEntry: "Search",
    inviteNotFound: "That group no longer exists.",
    inviteJoinBody: "You've been invited to join a group{host} with {n} member(s). Do you want to join?",
    inviteJoinBodyPlain: "You've been invited to join a group. Do you want to join?",
    decline: "Decline",
    joinGroup: "Join group",
    shareInviteLink: "Share an invite link",
    copyLink: "Copy",
    copied: "Copied!",
    close: "Close",
    inviteLinkHelp: "Anyone you send this link to will be asked to join the group when they open it.",
    verifyingLink: "Verifying your reset link\u2026",
    recoveryLinkInvalid: "This reset link is invalid or has expired. Please request a new password reset email.",
    noAgreementTitle: "Not everyone agrees",
    noAgreementBody: "Your group didn't all pick the same {thing}, so the choices were reset. Please choose again together.",
    theArea: "area",
    theActivity: "activity",
    friendsOnlyProfile: "Add this person as a friend to see their bio and preferences.",
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
    heroEyebrow: "Ομαδικά σχέδια, χωρίς το χάος της ομαδικής συνομιλίας",
    heroTitle: "Το σχέδιο που όλη η παρέα σας πραγματικά συμφωνεί.",
    heroDescription: "Το PlanSwipe βοηθά την παρέα σου να αποφασίσει πού θα πάτε — μαζί. Διάλεξε περιοχή και δραστηριότητα, δες πραγματικά κοντινά μέρη και ψηφίστε ομαδικά. Οι προτιμήσεις όλων συνυπολογίζονται αυτόματα, ώστε να καταλήξετε σε ένα μέρος που αρέσει σε όλους μέσα σε λεπτά, όχι σε μηνύματα.",
    heroNote: "Φτιαγμένο για τις παρέες που ποτέ δεν καταλήγουν πού να πάνε.",
    whatPlanswipeIs: "Τι είναι το PlanSwipe",
    sharedDecisionTool: "Ένας κοινός τρόπος να αποφασίζετε πού θα πάτε",
    offerText: "Φτιάξτε μια ομάδα με τους φίλους σας, συμφωνήστε στα βασικά, κάντε swipe σε πραγματικές επιλογές και δείτε τους νικητές να ανεβαίνουν στην κορυφή. Χωρίς ψηφοφορίες, χωρίς πίεση, χωρίς ατελείωτη συνομιλία που καταλήγει στο «δεν ξέρω, διάλεξε εσύ».",
    agreeFaster: "Πρώτα συμφωνήστε στα βασικά",
    agreeFasterText: "Όλοι διαλέγουν περιοχή και είδος εξόδου μαζί. Μόλις η ομάδα συμφωνήσει, το PlanSwipe αναλαμβάνει — χωρίς ατελείωτες συζητήσεις.",
    discoverOptions: "Ανακαλύψτε πραγματικά μέρη",
    discoverOptionsText: "Ζωντανές προτάσεις από το Google Maps για την περιοχή και τη δραστηριότητά σας, με φωτογραφίες, βαθμολογίες, ώρες και κριτικές — όχι γενικές ιδέες.",
    swipeTip: "Σύρε δεξιά για “μου αρέσει”, αριστερά για προσπέραση",
    place: "Μέρος",
    navHome: "Αρχική", navGroups: "Ομάδες", navSearch: "Αναζήτηση", navFriends: "Φίλοι", navProfile: "Ρυθμίσεις",
    appearance: "Εμφάνιση", darkMode: "Σκοτεινό θέμα", language: "Γλώσσα",
    lockInPrompt: "Συμφωνήσατε! Ορίστε ημερομηνία και ώρα για να το κλειδώσετε.",
    lockPlan: "Κλείδωμα σχεδίου",
    date: "Ημερομηνία", time: "Ώρα",
    planLocked: "Το σχέδιο κλειδώθηκε",
    goingCount: "έρχονται",
    cantMakeCount: "δεν μπορούν",
    imIn: "Έρχομαι",
    cantMakeIt: "Δεν μπορώ",
    addToCalendar: "Προσθήκη στο ημερολόγιο",
    downloadIcs: "Λήψη .ics",
    changeDate: "Αλλαγή ημερομηνίας",
    pickDateTime: "Επίλεξε ημερομηνία και ώρα",
    tieTitle: "Ισοπαλία!",
    tieBody: "Κάποια μέρη είναι ισόπαλα. Ξεκίνα έναν γρήγορο β’ γύρο για να λυθεί.",
    startRunoff: "Έναρξη β’ γύρου",
    runoffTitle: "Β’ γύρος — διάλεξε ένα",
    runoffWinner: "Νικητής",
    cancelRunoff: "Ακύρωση β’ γύρου",
    dismiss: "Κλείσιμο",
    vote: "ψήφος", votes: "ψήφοι",
    openNow: "Ανοιχτό τώρα",
    closedNow: "Κλειστό",
    tutorialTitle: "Πώς λειτουργεί η ψηφοφορία",
    tutRight: "Σύρε δεξιά για “μου αρέσει”",
    tutLeft: "Σύρε αριστερά για προσπέραση",
    tutNote: "Μπορείς επίσης να χρησιμοποιήσεις τα κουμπιά παρακάτω.",
    gotIt: "Το κατάλαβα",
    itsAMatch: "Ταιριάξατε!",
    matchBody: "Η παρέα σου συμφώνησε στο {place}. Ώρα να το κανονίσετε!",
    nice: "Τέλεια!",
    yourPlace: "το μέρος σας",
    moreButton: "Περισσότερα",
    voteAsGroup: "Ψηφίστε και ταιριάξτε μαζί",
    voteAsGroupText: "Κάντε swipe σε κάθε μέρος — δεξιά για να σας αρέσει, αριστερά για προσπέραση — και δείτε άμεσα ποια μέρη συμφωνεί η παρέα. Όταν συμφωνήσουν όλοι, το σχέδιο είναι έτοιμο.",
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
    changeBasics: "Αλλαγή βασικών", exitCurrentGroup: "Έξοδος από ομάδα", confirmExitTemp: "Έξοδος από την ομάδα προς το παρόν; Μπορείς να επιστρέψεις από τις Ομάδες μου.", noStrongChoice: "Δεν υπάρχει ακόμα δυνατή επιλογή",
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
    yourPeople: "Οι άνθρωποί σου",
    incomingRequests: "Εισερχόμενα αιτήματα",
    sentRequests: "Απεσταλμένα αιτήματα",
    searchResults: "Αποτελέσματα αναζήτησης",
    noUsersFound: "Δεν βρέθηκαν χρήστες",
    noBioYet: "",
    session: "Συνεδρία",
    logoutHint: "Θα αποσυνδεθείς από αυτή τη συσκευή.",
    logoutConfirm: "Σίγουρα θέλεις να αποσυνδεθείς;",
    noPastActivities: "Δεν υπάρχουν ακόμα παλιές δραστηριότητες",
    placesHistory: "Μέρη & Ιστορικό", viewMore: "Δείτε περισσότερα", viewLess: "Δείτε λιγότερα",
    yourActivity: "Η δραστηριότητά σου",
    myPlan: "Το πλάνο μου",
    managePlan: "Διαχείριση πλάνου",
    onFreePlan: "Είσαι στο δωρεάν πλάνο.",
    onProPlan: "Είσαι στο Pro πλάνο.",
    continueBrowsing: "Θέλετε να συνεχίσετε να βλέπετε μέρη;",
    noMoreSuggestions: "Δεν υπάρχουν άλλα μέρη που ταιριάζουν με τις επιλογές σας. Θέλετε να αλλάξετε τα βασικά;",
    newGroup: "Νέα Ομάδα",
    backToVoting: "Επιστροφή στην Ψηφοφορία",
    exitGroupPermanent: "Μόνιμη έξοδος από ομάδα", deleteSelected: "Διαγραφή επιλεγμένων", selectGroup: "Επιλογή ομάδας", selected: "επιλεγμένα", confirmDeleteGroups: "Διαγραφή των επιλεγμένων ομάδων; Δεν αναιρείται.", someGroupsFailed: "Κάποιες ομάδες δεν διαγράφηκαν. Δοκιμάστε ξανά.",
    confirmExitGroup: "Είστε σίγουροι ότι θέλετε να φύγετε μόνιμα;",
    accountManagement: "Διαχείριση Λογαριασμού",
    choiceNo: "Όχι", choiceMaybe: "Ίσως", choiceYes: "Ναι",
    searchFrom: "Αναζήτηση από", searchGooglePlaces: "Google Places",
    searchSample: "δείγματα δεδομένων", searchCustom: "προσαρμοσμένη ιδέα",
    areaSelected: "Συμφωνήθηκε περιοχή! Τώρα ψηφίστε για δραστηριότητα.",
    fridayCrew: "Παρέα Παρασκευής",
    forgotPassword: "Ανάκτηση Κωδικού",
    forgotPasswordQuestion: "Ξεχάσατε τον κωδικό;", saveChanges: "Αποθήκευση αλλαγών",
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
    resetPassword: "Επαναφορά Κωδικού", showPassword: "Εμφάνιση κωδικού", hidePassword: "Απόκρυψη κωδικού",
    account: "Λογαριασμός",
    recoveryEmailSent: "Αν υπάρχει λογαριασμός για {email}, έχει σταλεί σύνδεσμος επαναφοράς κωδικού. Έλεγξε τα εισερχόμενά σου.",
    ageFreeTextPlaceholder: "γράψε ηλικιακή ομάδα, π.χ. 18-24",
    aiFilteredResults: "Φιλτραρισμένα με AI κατά περιοχή, δραστηριότητα και ηλικιακή ομάδα.",
    aiInfoBody: "Η AI χρησιμοποιεί την επιλεγμένη περιοχή, το είδος δραστηριότητας, τις ηλικιακές ομάδες, προηγούμενες δραστηριότητες, αγαπημένα μέρη και τυχόν σχόλια. Τα σχόλια θεωρούνται αυστηρές απαιτήσεις, οπότε μέρη που σαφώς συγκρούονται με αυτά αποκλείονται.",
    aiInfoTitle: "Πώς φιλτράρει η AI τα μέρη",
    areaFreeTextPlaceholder: "Γράψε περιοχή ή γειτονιά, ή άφησέ το κενό",
    backToActivity: "Πίσω στη δραστηριότητα",
    categoryFreeTextPlaceholder: "Γράψε οτιδήποτε, π.χ. sushi, cocktails, σινεμά",
    commentSubmitted: "Το σχόλιο καταχωρήθηκε",
    commentsOptional: "Σχόλια (προαιρετικά)",
    commentsStepHint: "Πρόσθεσε απαιτήσεις όπως budget, ένταση, διατροφικές ανάγκες, καθιστικό, ή τι να αποφύγουμε. Μπορείς και να το παραλείψεις.",
    commentsStepTitle: "Κάποιες σημειώσεις πριν βρούμε μέρη;",
    loadingPlaces: "Φόρτωση περισσότερων μερών\u2026",
    skip: "Παράλειψη",
    stepComments: "Βήμα 3 από 3",
    submitComment: "Υποβολή σχολίου",
    passwordResetSuccess: "Ο κωδικός επαναφέρθηκε επιτυχώς!",
    passwordResetSuccessBody: "Ο κωδικός σας άλλαξε. Μπορείτε τώρα να συνδεθείτε με τον νέο σας κωδικό.",
    enterUsernameOrEmail: "Εισαγάγετε το όνομα χρήστη ή το email σας.",
    enterPassword: "Εισαγάγετε τον κωδικό σας.",
    usernameOrEmail: "Όνομα χρήστη ή email",
    confirmEmailFirst: "Επιβεβαιώστε πρώτα το email σας — ελέγξτε τα εισερχόμενά σας για τον σύνδεσμο επιβεβαίωσης.",
    wrongCredentials: "Λάθος όνομα χρήστη/email ή κωδικός.",
    usernameRequired: "Το όνομα χρήστη είναι υποχρεωτικό.",
    emailRequired: "Το email είναι υποχρεωτικό.",
    usernameTakenLogin: "Αυτό το όνομα χρήστη χρησιμοποιείται ήδη. Δοκιμάστε να συνδεθείτε.",
    emailTakenLogin: "Αυτό το email είναι ήδη εγγεγραμμένο. Δοκιμάστε να συνδεθείτε.",
    checkEmailTitle: "Σχεδόν έτοιμοι!",
    noEmailOnAccount: "Δεν έχει οριστεί email σε αυτόν τον λογαριασμό.",
    fromYourFavourites: "Από τα αγαπημένα σου",
    orTypeNew: "Ή γράψε ένα νέο",
    add: "Προσθήκη",
    addAnArea: "Προσθήκη περιοχής",
    addAnActivity: "Προσθήκη δραστηριότητας",
    commentsLabel: "Σχόλια (Προαιρετικά)",
    commentsPlaceholder: "π.χ. ήσυχο, vegan επιλογές, τραπέζια έξω, κάτω από 20€",
    updateSuggestions: "Ενημέρωση προτάσεων",
    updating: "Ενημέρωση\u2026",
    suggestionsUpdated: "Οι προτάσεις ενημερώθηκαν",
    suggestionsUpdatedBody: "Οι προτάσεις σας ανανεώθηκαν λαμβάνοντας υπόψη τα σχόλια της ομάδας.",
    commentsInfoTitle: "Σε τι χρησιμεύει;",
    commentsInfoBody: "Πρόσθεσε ό,τι βοηθά να βρούμε καλύτερες επιλογές για την ομάδα σου \u2014 τη διάθεση που θέλετε, προϋπολογισμό, διατροφικές ανάγκες, προσβασιμότητα ή πράγματα προς αποφυγή. Για παράδειγμα: \u201cκάπου ήσυχο με vegan επιλογές, τραπέζια έξω, κάτω από 20€ το άτομο.\u201d Οι προτάσεις κατατάσσονται λαμβάνοντας υπόψη αυτά τα σχόλια.",
    groupInvite: "Πρόσκληση σε ομάδα",
    profileAndSettings: "Προφίλ & Ρυθμίσεις",
    searchPlaces: "Αναζήτηση μερών",
    byName: "Με όνομα",
    browse: "Περιήγηση",
    allOfAthens: "Όλη η Αθήνα",
    anyCategory: "Οποιαδήποτε κατηγορία",
    anyAge: "Οποιαδήποτε ηλικία",
    category: "Κατηγορία",
    searchByNamePlaceholder: "Όνομα μέρους (π.χ. ένα μπαρ ή εστιατόριο)",
    enterPlaceName: "Πληκτρολόγησε ένα όνομα μέρους για αναζήτηση.",
    chooseCategory: "Διάλεξε μια κατηγορία για περιήγηση.",
    noPlacesFound: "Δεν βρέθηκαν μέρη. Δοκίμασε άλλο όνομα, περιοχή ή κατηγορία.",
    thePlace: "Το μέρος",
    sameNameElsewhere: "Ίδιο όνομα σε άλλες περιοχές",
    similarNearby: "Παρόμοια μέρη σε αυτή την περιοχή",
    results: "Αποτελέσματα",
    viewDetails: "Λεπτομέρειες",
    website: "Ιστότοπος",
    openInMaps: "Άνοιγμα στους Χάρτες",
    noReviews: "Δεν υπάρχουν διαθέσιμες κριτικές.",
    addFriend: "Προσθήκη φίλου",
    saveNote: "Αποθήκευση σημείωσης",
    noteSaved: "Η σημείωση αποθηκεύτηκε",
    noteSavedBody: "Η σημείωσή σου θα χρησιμοποιηθεί για να βρούμε τα καλύτερα μέρη για την ομάδα σου.",
    searchPlacesEntry: "Αναζήτηση μερών με όνομα ή περιήγηση ανά περιοχή",
    inviteNotFound: "Αυτή η ομάδα δεν υπάρχει πλέον.",
    inviteJoinBody: "Έχεις προσκληθεί σε μια ομάδα{host} με {n} μέλη. Θέλεις να μπεις;",
    inviteJoinBodyPlain: "Έχεις προσκληθεί σε μια ομάδα. Θέλεις να μπεις;",
    decline: "Απόρριψη",
    joinGroup: "Είσοδος στην ομάδα",
    shareInviteLink: "Κοινοποίησε σύνδεσμο πρόσκλησης",
    copyLink: "Αντιγραφή",
    copied: "Αντιγράφηκε!",
    close: "Κλείσιμο",
    inviteLinkHelp: "Όποιος λάβει αυτόν τον σύνδεσμο θα ερωτηθεί αν θέλει να μπει στην ομάδα όταν τον ανοίξει.",
    verifyingLink: "Επαλήθευση του συνδέσμου επαναφοράς\u2026",
    recoveryLinkInvalid: "Αυτός ο σύνδεσμος επαναφοράς δεν είναι έγκυρος ή έχει λήξει. Ζητήστε νέο email επαναφοράς κωδικού.",
    noAgreementTitle: "Δεν συμφωνούν όλοι",
    noAgreementBody: "Η ομάδα σας δεν επέλεξε όλη την ίδια {thing}, οπότε οι επιλογές μηδενίστηκαν. Επιλέξτε ξανά μαζί.",
    theArea: "περιοχή",
    theActivity: "δραστηριότητα",
    friendsOnlyProfile: "Προσθέστε αυτό το άτομο ως φίλο για να δείτε το προφίλ και τις προτιμήσεις του.",
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
  voteAsGroupText: "Κάντε swipe σε κάθε μέρος — δεξιά για να σας αρέσει, αριστερά για προσπέραση — και δείτε άμεσα ποια μέρη συμφωνεί η παρέα. Όταν συμφωνήσουν όλοι, το σχέδιο είναι έτοιμο."
});

Object.assign(copy.el, {
  aiInfoTitle: "Πώς φιλτράρει το AI",
  aiInfoBody: "Το AI χρησιμοποιεί την περιοχή, τη δραστηριότητα, τις ηλικιακές ομάδες, προηγούμενες δραστηριότητες, αγαπημένα μέρη και τα σχόλια της ομάδας. Τα σχόλια θεωρούνται αυστηρές απαιτήσεις, οπότε αποκλείονται μέρη που συγκρούονται με αυτά.",
  stepComments: "Βήμα 3 από 3",
  commentsStepTitle: "Υπάρχουν σημειώσεις πριν βρούμε μέρη;",
  commentsStepHint: "Προσθέστε απαιτήσεις όπως budget, θόρυβο, διατροφικές ανάγκες, καθίσματα ή πράγματα προς αποφυγή. Μπορείτε και να το παραλείψετε.",
  backToActivity: "Πίσω στη δραστηριότητα",
  submitComment: "Υποβολή σχολίου",
  skip: "Παράλειψη",
  commentSubmitted: "Το σχόλιο υποβλήθηκε",
  reviews: "Κριτικές",
  noReviews: "Δεν υπάρχουν διαθέσιμες κριτικές.",
  searchPlacesEntry: "Αναζήτηση",
  searchPlaces: "Αναζήτηση μερών",
  areaFreeTextPlaceholder: "Γράψτε περιοχή ή γειτονιά ή αφήστε κενό",
  categoryFreeTextPlaceholder: "Γράψτε ό,τι θέλετε, π.χ. sushi, cocktails, σινεμά",
  ageFreeTextPlaceholder: "γράψε ηλικιακή ομάδα, π.χ. 18-24",
  commentsOptional: "Σχόλια (προαιρετικά)",
  aiFilteredResults: "Φιλτράρισμα με AI: πρώτα περιοχή, μετά δραστηριότητα, μετά ηλικία."
});

// ====== LANGUAGE ======
function applyLanguage() {
  document.documentElement.lang = state.language;
  if (languageButton) languageButton.textContent = state.language === "en" ? "EL" : "EN";
  if (appLanguageButton) appLanguageButton.textContent = state.language === "en" ? "EL" : "EN";
  heroLoginButton.textContent   = t("login");
  if (heroSignupButton) heroSignupButton.textContent = t("createAccount");
  heroEnterButton.textContent   = t("enterPlanswipe");
  loginButton.textContent       = t("login");
  registerButton.textContent    = t("createAccount");
  loginForm.querySelector("h2").textContent = t("enterPlanswipe");
  forgotPasswordButton.textContent = t("forgotPasswordQuestion");
  loginEmail.placeholder = t("email");
  loginUsername.placeholder = state.authMode === "signup" ? t("username") : (t("usernameOrEmail") || "Username or email");
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
  if (inviteToGroupButton) inviteToGroupButton.textContent = t("inviteToGroup");
  const pseText = document.querySelector("#placesSearchEntryText");
  if (pseText) pseText.textContent = t("searchPlacesEntry");
  if (continueBrowseButton) continueBrowseButton.textContent = t("continueBrowsing");
  reviewButton.textContent      = t("changeBasics");
  if (exitCurrentGroupButton) exitCurrentGroupButton.textContent = t("exitCurrentGroup");

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
  yesButton.textContent          = t("choiceYes");

  profileMenu.querySelectorAll("button[data-page]").forEach((btn) => {
    const k = btn.dataset.page;
    btn.textContent = k === "personal" ? t("profileAndSettings") : t(k === "likedplaces" ? "placesHistory" : k);
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

function localizePlaceDescription(value) {
  let text = String(value || "");
  text = text.replace(/β€”|Ξ²β‚¬β€/g, "\u2014").replace(/Β·|Ξ’Β·/g, "\u00b7");
  if (state.language === "el") {
    text = text
      .replace(/\bHours not listed\b/gi, "Δεν αναφέρονται ώρες")
      .replace(/\bstars\b/gi, "αστέρια")
      .replace(/\breviews\b/gi, "κριτικές")
      .replace(/\bRestaurant in\b/gi, "Εστιατόριο στην περιοχή")
      .replace(/\bRestaurants in\b/gi, "Εστιατόρια στην περιοχή")
      .replace(/\bBar in\b/gi, "Μπαρ στην περιοχή")
      .replace(/\bBars in\b/gi, "Μπαρ στην περιοχή")
      .replace(/\bMovies in\b/gi, "Σινεμά στην περιοχή")
      .replace(/\bGaming in\b/gi, "Παιχνίδια στην περιοχή")
      .replace(/\bActivity in\b/gi, "Δραστηριότητα στην περιοχή")
      .replace(/\bin Athens\b/gi, "στην Αθήνα")
      .replace(/\bin the Athens area\b/gi, "στην περιοχή της Αθήνας");
  } else {
    text = text
      .replace(/\bαστέρια\b/g, "stars")
      .replace(/\bκριτικές\b/g, "reviews")
      .replace(/\bΔεν αναφέρονται ώρες\b/g, "Hours not listed");
  }
  return text;
}

function validEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim()); }
function initials(name) {
  return String(name || "").trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("");
}

const APP_ORIGIN = "https://www.planswipe.gr";
const RECOVER_REDIRECT = `${APP_ORIGIN}/recover`;

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
  // Ensures a profile row exists for the currently authenticated user.
  // Username/email are read from the verified token server-side.
  const data = await api("/api/auth/ensure-profile", { method: "POST", body: {} });
  setLoggedIn(data.user.username, data.user.email || email || "");
  saveAccount(data.user);
  return data.user;
}

function setTopbarAvatar(picture, name) {
  // #2: paint the picture onto the profile-button circle itself (the span that held
  // the initial has no size once its text is cleared, so the image never showed).
  if (picture) {
    profileButton.style.backgroundImage = `url("${picture}")`;
    profileButton.style.backgroundSize = "cover";
    profileButton.style.backgroundPosition = "center";
    profileInitial.textContent = "";
  } else {
    profileButton.style.backgroundImage = "";
    profileInitial.textContent = initials(name) || "P";
  }
}

function saveAccount(user) {
  state.account = user;
  localStorage.setItem("planswipe:account", JSON.stringify(user));
  setTopbarAvatar(user?.profile?.picture, user?.username || currentUsername());
}

async function loadAccount(forceFresh = false) {
  if (!isLoggedIn()) return null;
  const url = `/api/account?username=${encodeURIComponent(currentUsername())}&viewer=${encodeURIComponent(currentUsername())}`;
  // If we already have the account cached, return it instantly so pages render without
  // waiting on the network, and refresh in the background for next time. We don't
  // re-render on the background refresh, to avoid clobbering anything the user is editing.
  if (state.account && !forceFresh) {
    api(url).then((data) => { if (data?.user) saveAccount(data.user); }).catch(() => {});
    return state.account;
  }
  const data = await api(url);
  saveAccount(data.user);
  return data.user;
}

async function login() {
  // Login accepts a username OR an email in the single identifier field.
  const identifier = loginUsername.value.trim();
  const password = loginPassword.value;
  if (!identifier) throw new Error(t("enterUsernameOrEmail") || "Enter your username or email.");
  if (!password) throw new Error(t("enterPassword") || "Enter your password.");
  if (!state.supabaseClient) throw new Error("Authentication is temporarily unavailable. Please try again shortly.");

  // Resolve the identifier to an email address.
  const resolved = await api("/api/auth/resolve", { method: "POST", body: { identifier } });
  const email = resolved.email;

  const { data, error } = await state.supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    const msg = (error.message || "").toLowerCase();
    if (msg.includes("confirm")) throw new Error(t("confirmEmailFirst") || "Please confirm your email first — check your inbox for the confirmation link.");
    throw new Error(t("wrongCredentials") || "Wrong username/email or password.");
  }
  state.supabaseSession = data.session;
  await syncSupabaseProfile(data.user?.user_metadata?.username || "", data.user?.email || email);
  loginUsername.value = ""; loginEmail.value = ""; loginPassword.value = "";
  state.loginOpen = false; navigate("/main");
  maybeHandlePendingInvite();
}

async function registerUser() {
  const username = loginUsername.value.trim();
  const email    = loginEmail.value.trim();
  const password = loginPassword.value;
  if (!username) throw new Error(t("usernameRequired") || "Username is required.");
  if (!email) throw new Error(t("emailRequired") || "Email is required.");
  if (!validEmail(email)) throw new Error(t("validEmailRequired") || "Please enter a valid email.");
  if (!isStrongPassword(password)) throw new Error(t("passwordRequirements") || "Password does not meet requirements.");
  if (!state.supabaseClient) throw new Error("Sign-up is temporarily unavailable. Please try again shortly.");

  // Step 1: check that neither the username nor the email is already registered.
  try {
    await api("/api/register/precheck", { method: "POST", body: { username, email } });
  } catch (e) {
    if (e.message === "username_taken") throw new Error(t("usernameTakenLogin") || "That username is already taken. Try logging in instead.");
    if (e.message === "email_taken") throw new Error(t("emailTakenLogin") || "That email is already registered. Try logging in instead.");
    throw e;
  }

  // Step 2: create the auth user (Supabase sends the confirmation email).
  const { data, error } = await state.supabaseClient.auth.signUp({
    email, password,
    options: { data: { username }, emailRedirectTo: APP_ORIGIN }
  });
  if (error) {
    const msg = (error.message || "").toLowerCase();
    if (msg.includes("registered") || msg.includes("already")) throw new Error(t("emailTakenLogin") || "That email is already registered. Try logging in instead.");
    throw new Error(error.message || "Sign up failed.");
  }

  // Step 3: reserve the profile row (verified against the auth system).
  try { await api("/api/register/finalize", { method: "POST", body: { username, email } }); }
  catch (e) {
    if (e.message === "username_taken") throw new Error(t("usernameTakenLogin") || "That username is already taken. Try logging in instead.");
    /* otherwise continue — first login will ensure the profile exists */
  }

  loginUsername.value = ""; loginEmail.value = ""; loginPassword.value = "";
  state.authMode = "login";
  showModal(
    t("checkEmailTitle") || "Almost there!",
    t("confirmEmailCheck") || "Check your email to confirm your account, then log in.",
    [{ label: t("ok") || "OK", primary: true, action: () => { renderApp(); } }]
  );
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

  setVisible(backChoiceButton, Boolean(state.pendingAreaOption) || kind === "type");
  if (backChoiceButton && !backChoiceButton.classList.contains("is-hidden")) {
    backChoiceButton.textContent = t("back") || "Back";
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
    <button class="comments-info ai-info-button" id="aiInfoBtn" type="button" aria-label="${escapeHtml(t("aiInfoTitle"))}">i</button>
  </div>` : "";

  optionGrid.innerHTML = `${aiToggle}${optionCards}${favourites}
    <button class="option-card add-option-card" type="button" data-kind="${escapeHtml(kind)}" data-custom="true">
      <span class="option-score">${escapeHtml(addOwn)}</span>
      <span><h3>${escapeHtml(addLabel)}</h3><p>${escapeHtml(addText)}</p></span>
    </button>`;

  // Comments are a separate step after activity consensus.
  const commentsBox = document.querySelector("#commentsBox");
  if (commentsBox) setVisible(commentsBox, false);
}

function commentsDoneCount() {
  const status = state.group?.commentStatus || {};
  return (state.group?.members || []).filter((m) => status[m.username]).length;
}

function allCommentsDone() {
  const members = state.group?.members || [];
  return Boolean(members.length) && commentsDoneCount() >= members.length;
}

function renderCommentStep() {
  setVisible(decisionPanel, true);
  setVisible(swipeLayout, false);
  setVisible(resultsPanel, false);
  optionGrid.innerHTML = "";
  decisionStep.textContent = t("stepComments");
  decisionTitle.textContent = t("commentsStepTitle");
  const total = memberCount();
  const done = commentsDoneCount();
  decisionHint.innerHTML = done > 0 && done < total
    ? `${done} ${t("of")} ${total} ${t("voted")} \u2014 <strong>${t("waitingForOthers")}</strong>`
    : t("commentsStepHint");
  setVisible(backChoiceButton, true);
  backChoiceButton.textContent = t("backToActivity");

  const commentsBox = document.querySelector("#commentsBox");
  if (!commentsBox) return;
  setVisible(commentsBox, true);
  const ci = document.querySelector("#commentsInput");
  if (ci) {
    if (document.activeElement !== ci) ci.value = (state.group?.comments || {})[currentUsername()] || "";
    ci.placeholder = t("commentsPlaceholder");
  }
  const cl = document.querySelector("#commentsLabel"); if (cl) cl.textContent = t("commentsLabel");
  const submit = document.querySelector("#commentsApplyBtn");
  const skip = document.querySelector("#commentsSkipBtn");
  const alreadyDone = Boolean(state.group?.commentStatus?.[currentUsername()]);
  if (submit) {
    submit.textContent = alreadyDone ? t("commentSubmitted") : t("submitComment");
    submit.disabled = alreadyDone;
  }
  if (skip) {
    skip.textContent = t("skip");
    skip.disabled = alreadyDone;
  }
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
  resetCardTransform();
  const FALLBACK_PHOTO = "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80";
  const targetSrc = place.photoUrl || FALLBACK_PHOTO;
  activityPhoto.alt = place.title;
  // Hide the outgoing photo immediately so a fast swipe never shows the previous place's image.
  activityPhoto.classList.add("is-loading");
  activityPhoto.onload = () => activityPhoto.classList.remove("is-loading");
  activityPhoto.onerror = () => { activityPhoto.onerror = null; activityPhoto.src = FALLBACK_PHOTO; activityPhoto.classList.remove("is-loading"); };
  activityPhoto.src = targetSrc;
  const ratingText = place.rating ? `${Number(place.rating).toFixed(1)} \u2605` : "";
  const typeLabel = optionLabel("type", consensus("type")) || place.category;
  activityCategory.textContent    = ratingText ? `${typeLabel} | ${ratingText}` : typeLabel;
  activityTitle.textContent       = place.title;
  activityDescription.textContent = localizePlaceDescription(place.description || place.address || "");
  activityArea.textContent        = place.areaLabel || place.address || "";
  activityTime.textContent        = place.time;
  activityCost.textContent        = place.cost;
  const contactEl = document.querySelector("#activityContact");
  if (contactEl) {
    const parts = [];
    if (place.website) parts.push(`<a href="${escapeHtml(place.website)}" target="_blank" rel="noopener">\u{1F517} ${escapeHtml(t("website"))}</a>`);
    if (place.phone) parts.push(`<a href="tel:${escapeHtml(place.phone)}">\u{1F4DE} ${escapeHtml(place.phone)}</a>`);
    if (place.mapsUrl) parts.push(`<a href="${escapeHtml(place.mapsUrl)}" target="_blank" rel="noopener">\u{1F5FA}\uFE0F ${escapeHtml(t("openInMaps"))}</a>`);
    contactEl.innerHTML = parts.join("");
  }
  // Icon buttons (labels live in aria-label / the swipe tip)
  if (noButton) noButton.setAttribute("aria-label", t("choiceNo"));
  if (yesButton) yesButton.setAttribute("aria-label", t("choiceYes"));
  if (undoButton) undoButton.disabled = state.index <= 0;
  const swipeTip = document.querySelector("#swipeTip");
  if (swipeTip) swipeTip.textContent = t("swipeTip");
  [noButton, yesButton, favButton, undoButton].forEach((btn) => {
    if (btn) btn.classList.toggle("is-voting", state.votingInProgress);
  });
  if (favButton) {
    const preferences = getPreferences();
    const alreadyFav = (preferences.places || []).some((p) => p.toLowerCase() === place.title?.toLowerCase());
    favButton.setAttribute("aria-label", alreadyFav ? t("favourited") : t("addToFavourites"));
    favButton.classList.toggle("is-favourited", alreadyFav);
  }
  if (reviewsButton) reviewsButton.textContent = t("moreButton") || "More";

  // Progress indicator ("Place X of Y")
  const progressEl = document.querySelector("#swipeProgress");
  if (progressEl) {
    const total = (state.group.places || []).length;
    progressEl.textContent = total ? `${t("place") || "Place"} ${Math.min(state.index + 1, total)}/${total}` : "";
  }
  // Open-now badge
  const openNowEl = document.querySelector("#activityOpenNow");
  if (openNowEl) {
    if (place.openNow === true) { openNowEl.textContent = t("openNow") || "Open now"; openNowEl.className = "open-now-badge is-open"; }
    else if (place.openNow === false) { openNowEl.textContent = t("closedNow") || "Closed"; openNowEl.className = "open-now-badge is-closed"; }
    else { openNowEl.className = "open-now-badge is-hidden"; }
  }
  // First-run tutorial (once)
  maybeShowSwipeTutorial();
}

function maybeShowSwipeTutorial() {
  const tut = document.querySelector("#swipeTutorial");
  if (!tut) return;
  if (localStorage.getItem("planswipe:swipeTutorialSeen")) { tut.classList.add("is-hidden"); return; }
  // localize
  const set = (id, key) => { const el = document.querySelector(id); if (el) el.textContent = t(key); };
  set("#tutorialTitle", "tutorialTitle");
  set("#tutRight", "tutRight"); set("#tutLeft", "tutLeft");
  set("#tutNote", "tutNote");
  const gotIt = document.querySelector("#tutorialGotIt");
  if (gotIt) gotIt.textContent = t("gotIt");
  tut.classList.remove("is-hidden");
}

// ===== Plan-locking + tie-break helpers =====
function fmtCalDate(dt) {
  const d = new Date(dt);
  if (isNaN(d)) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}00Z`;
}
function googleCalUrl(place, dt) {
  const start = fmtCalDate(dt);
  const end = fmtCalDate(new Date(new Date(dt).getTime() + 2 * 3600 * 1000));
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `PlanSwipe: ${place.title}`,
    dates: `${start}/${end}`,
    details: "Plan with your PlanSwipe group.",
    location: place.address || place.areaLabel || ""
  });
  return `https://www.google.com/calendar/render?${params.toString()}`;
}
function downloadIcs(place, dt) {
  const start = fmtCalDate(dt);
  const end = fmtCalDate(new Date(new Date(dt).getTime() + 2 * 3600 * 1000));
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//PlanSwipe//EN", "BEGIN:VEVENT",
    `UID:${Date.now()}@planswipe.gr`, `DTSTAMP:${fmtCalDate(new Date())}`,
    `DTSTART:${start}`, `DTEND:${end}`, `SUMMARY:PlanSwipe: ${place.title}`,
    `LOCATION:${String(place.address || "").replace(/,/g, "\\,")}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "planswipe.ics"; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function planCardHtml(place) {
  if (!place) return "";
  const plan = state.group.plan;
  const me = currentUsername();
  if (!plan || state.planEditing) {
    const existingDate = plan?.dateTime ? plan.dateTime.slice(0, 10) : "";
    const existingTime = plan?.dateTime ? plan.dateTime.slice(11, 16) : "";
    return `<div class="plan-card plan-setup">
      <div class="plan-badge match">\u{1F389} ${escapeHtml(t("itsAMatch"))}</div>
      <h3>${escapeHtml(place.title)}</h3>
      <p class="muted-note">${escapeHtml(t("lockInPrompt"))}</p>
      <div class="plan-datetime-row">
        <input type="date" id="planDateInput" value="${escapeHtml(existingDate)}" aria-label="${escapeHtml(t("date") || "Date")}">
        <input type="time" id="planTimeInput" value="${escapeHtml(existingTime)}" step="60" aria-label="${escapeHtml(t("time") || "Time")}">
        <button class="btn-primary" type="button" id="lockPlanBtn">${escapeHtml(t("lockPlan"))}</button>
      </div>
    </div>`;
  }
  const attendance = plan.attendance || {};
  const ins = Object.entries(attendance).filter(([, s]) => s === "in").map(([u]) => u);
  const outs = Object.entries(attendance).filter(([, s]) => s === "out").map(([u]) => u);
  const myStatus = attendance[me];
  const when = new Date(plan.dateTime);
  const whenText = isNaN(when) ? plan.dateTime : when.toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  return `<div class="plan-card">
    <div class="plan-badge locked">\u2705 ${escapeHtml(t("planLocked"))}</div>
    <h3>${escapeHtml(place.title)}</h3>
    <p class="plan-when">\u{1F4C5} ${escapeHtml(whenText)}</p>
    ${place.address ? `<p class="muted-note">\u{1F4CD} ${escapeHtml(place.address)}</p>` : ""}
    <div class="plan-attendance">
      <span class="att-in">\u2705 ${ins.length} ${escapeHtml(t("goingCount"))}</span>
      ${outs.length ? `<span class="att-out">${outs.length} ${escapeHtml(t("cantMakeCount"))}</span>` : ""}
    </div>
    ${ins.length ? `<p class="att-names">${escapeHtml(ins.join(", "))}</p>` : ""}
    <div class="plan-actions">
      <button class="btn-primary ${myStatus === "in" ? "rsvp-active" : ""}" type="button" data-rsvp="in">${escapeHtml(t("imIn"))}</button>
      <button class="btn-ghost ${myStatus === "out" ? "rsvp-active" : ""}" type="button" data-rsvp="out">${escapeHtml(t("cantMakeIt"))}</button>
    </div>
    <div class="plan-cal">
      <a class="btn-ghost" href="${googleCalUrl(place, plan.dateTime)}" target="_blank" rel="noopener">\u{1F4C6} ${escapeHtml(t("addToCalendar"))}</a>
      <button class="btn-ghost" type="button" id="downloadIcsBtn">${escapeHtml(t("downloadIcs"))}</button>
      <button class="btn-ghost" type="button" id="changePlanBtn">${escapeHtml(t("changeDate"))}</button>
    </div>
  </div>`;
}

function topTiedCandidates(ranked) {
  if (ranked.length < 2) return [];
  const topPct = ranked[0].percent;
  if (topPct <= 0) return [];
  const tied = ranked.filter((p) => p.percent === topPct);
  return tied.length >= 2 ? tied.slice(0, 4) : [];
}
function tieBreakHtml(tied) {
  return `<div class="tiebreak-card">
    <h3>\u{1F91D} ${escapeHtml(t("tieTitle"))}</h3>
    <p class="muted-note">${escapeHtml(t("tieBody"))}</p>
    <button class="btn-primary" type="button" id="startRunoffBtn" data-runoff-cands="${escapeHtml(tied.map((p) => p.id).join(","))}">${escapeHtml(t("startRunoff"))}</button>
  </div>`;
}
function runoffWinnerBanner(place) {
  if (!place) return "";
  return `<div class="runoff-winner"><span>\u{1F3C6} ${escapeHtml(t("runoffWinner"))}: <strong>${escapeHtml(place.title)}</strong></span><button class="btn-ghost" type="button" id="runoffClearBtn">${escapeHtml(t("dismiss"))}</button></div>`;
}
function renderRunoff() {
  const r = state.group.runoff;
  const places = state.group.places || [];
  const cands = r.candidates.map((id) => places.find((p) => p.id === id)).filter(Boolean);
  const myVote = r.votes?.[currentUsername()];
  const tally = {};
  Object.values(r.votes || {}).forEach((id) => { tally[id] = (tally[id] || 0) + 1; });
  const votedCount = Object.keys(r.votes || {}).length;
  const total = state.group.members?.length || 1;
  resultList.innerHTML = `
    <div class="runoff-panel">
      <div class="runoff-head"><h3>\u{1F5F3}\uFE0F ${escapeHtml(t("runoffTitle"))}</h3><p class="muted-note">${votedCount}/${total} ${escapeHtml(t("voted"))}</p></div>
      <div class="runoff-cands">
        ${cands.map((p) => `
          <button class="runoff-card ${myVote === p.id ? "is-picked" : ""}" type="button" data-runoff-vote="${escapeHtml(p.id)}">
            <img src="${escapeHtml(p.photoUrl)}" alt="">
            <div class="runoff-card-body"><h4>${escapeHtml(p.title)}</h4><span class="runoff-tally">${tally[p.id] || 0} ${escapeHtml(t((tally[p.id] || 0) === 1 ? "vote" : "votes"))}</span></div>
            ${myVote === p.id ? `<span class="runoff-check">\u2713</span>` : ""}
          </button>`).join("")}
      </div>
      <button class="btn-ghost runoff-cancel" type="button" id="runoffCancelBtn">${escapeHtml(t("cancelRunoff"))}</button>
    </div>`;
}

async function lockPlan(dateTime) {
  if (!dateTime) { showError(t("pickDateTime") || "Please pick a date and time"); return; }
  try {
    const data = await api(`/api/groups/${state.group.code}/plan`, { method: "POST", body: { userId: state.user.id, dateTime } });
    state.groupMutationAt = Date.now();
    state.group = data.group; state.planEditing = false; renderApp();
  } catch (e) { showError(e.message); }
}
async function rsvpPlan(status) {
  try {
    const data = await api(`/api/groups/${state.group.code}/rsvp`, { method: "POST", body: { userId: state.user.id, status } });
    state.groupMutationAt = Date.now();
    state.group = data.group; renderApp();
  } catch (e) { showError(e.message); }
}
async function startRunoff(cands) {
  try {
    const data = await api(`/api/groups/${state.group.code}/runoff-start`, { method: "POST", body: { userId: state.user.id, candidates: cands } });
    state.groupMutationAt = Date.now();
    state.group = data.group; renderApp();
  } catch (e) { showError(e.message); }
}
async function runoffVote(placeId) {
  try {
    const data = await api(`/api/groups/${state.group.code}/runoff-vote`, { method: "POST", body: { userId: state.user.id, placeId } });
    state.groupMutationAt = Date.now();
    state.group = data.group; renderApp();
  } catch (e) { showError(e.message); }
}
async function clearRunoff() {
  try {
    const data = await api(`/api/groups/${state.group.code}/runoff-clear`, { method: "POST", body: { userId: state.user.id } });
    state.groupMutationAt = Date.now();
    state.group = data.group; renderApp();
  } catch (e) { showError(e.message); }
}

function renderResults() {
  const allPlaces = state.group.places || [];
  const totalMembers = state.group.members?.length || 1;
  const selectedCount = Object.keys(state.group.placeSelections || {}).length;
  if (resultsSelectedCount) {
    resultsSelectedCount.textContent = selectedCount > 0 ? `${selectedCount}/${totalMembers} ${t("selectedCount")}` : "";
  }
  const canAddOwnPlace = state.index >= Math.min(5, allPlaces.length || 5);
  // Active runoff takes over the results view until a winner is decided.
  if (state.group.runoff && !state.group.runoff.winner) { renderRunoff(); return; }
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
      if (!votesByPlace[placeId]) votesByPlace[placeId] = { yes: 0, no: 0 };
      if (v === "yes") votesByPlace[placeId].yes++;
      else votesByPlace[placeId].no++;
    });
  });
  const total  = state.group.members.length || 1;
  const ranked = allPlaces
    .map((p) => {
      const v = votesByPlace[p.id] || { yes: 0, no: 0 };
      const percent = Math.round((v.yes / total) * 100);
      return { ...p, ...v, total, percent };
    })
    .filter((p) => p.yes > 0)
    .sort((a, b) => b.percent - a.percent || b.yes - a.yes);

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

  // Top banner: plan card (matched), runoff winner, or a tie-break offer.
  const matchId = state.group.consensus?.place;
  let topBanner = "";
  if (state.group.runoff && state.group.runoff.winner) {
    topBanner += runoffWinnerBanner(allPlaces.find((p) => p.id === state.group.runoff.winner));
  }
  if (matchId) {
    topBanner += planCardHtml(allPlaces.find((p) => p.id === matchId));
  } else if (!state.group.runoff) {
    const tied = topTiedCandidates(ranked);
    if (tied.length >= 2) topBanner += tieBreakHtml(tied);
  }

  resultList.innerHTML = topBanner + ranked.map((item) => {
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
    const selLabel = selCount > 0 ? `<span class="selection-badge selection-badge-strong">${t("selectedBy")} ${selCount} ${t(selCount === 1 ? "person" : "people")}</span>` : "";
    return `
    <article class="result-card">
      <img class="result-icon" src="${escapeHtml(item.photoUrl)}" alt="">
      <div><h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.areaLabel)} | ${escapeHtml(optionLabel("type", consensus("type")) || item.category)}${ratingPart} | ${item.yes}/${item.total} yes</p>
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
    const baseline = state.chatLastReadTimestamp || state.group?.myLastRead || "";
    const since = baseline ? `&since=${encodeURIComponent(baseline)}` : "";
    const data = await api(`/api/groups/${state.groupCode}/messages?limit=50${since}`);
    const me = currentUsername();
    const messages = (data.messages || []).filter((m) => m.username !== me);
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
        <button type="button" class="emoji-btn" id="chatEmojiBtn" aria-label="Emoji">\u{1F642}</button>
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
  setupEmojiPicker(overlay, overlay.querySelector("#chatEmojiBtn"), input);

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
        return `<div class="chat-bubble ${isMine ? "chat-bubble-mine" : "chat-bubble-theirs"}" data-msg-id="${escapeHtml(String(msg.id))}">${!isMine ? `<span class="chat-sender">${escapeHtml(msg.username)}</span>` : ""}<span class="chat-text">${escapeHtml(msg.message)}</span></div>`;
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
      if (msg.id && container.querySelector(`[data-msg-id="${CSS.escape(String(msg.id))}"]`)) return;
      const isMine = msg.username === me;
      const bubble = document.createElement("div");
      bubble.className = `chat-bubble ${isMine ? "chat-bubble-mine" : "chat-bubble-theirs"}`;
      if (msg.id) bubble.dataset.msgId = String(msg.id);
      bubble.innerHTML = `${!isMine ? `<span class="chat-sender">${escapeHtml(msg.username)}</span>` : ""}
        <span class="chat-text">${escapeHtml(msg.message)}</span>`;
      container.appendChild(bubble);
    });

    container.scrollTop = container.scrollHeight;
  } catch (e) { console.warn("Chat load error:", e.message); }
}

// ===== #1: emoji picker for chat inputs =====
const CHAT_EMOJIS = ["😀","😁","😂","🤣","😊","😍","😘","😎","🤩","🥳","😅","😉","🙂","😌","😴","😋","😜","🤪","🤗","🤔","🙄","😏","😢","😭","😤","😡","🥺","😱","🤯","😳","🥰","😇","🤠","👀","🙈","👍","👎","👏","🙌","🙏","💪","🤝","👌","✌️","🔥","✨","⭐","🎉","🎊","❤️","🧡","💛","💚","💙","💜","🖤","💯","🍕","🍔","🍟","🌮","🍣","🍜","🍺","🍻","🍷","🍸","🍹","☕","🎂","🍰","🎵","🎸","🎮","⚽","🏀","🏖️","🌴","🌇","📍","🚗","🕺","💃"];

function insertAtCursor(input, text) {
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  const room = (input.maxLength && input.maxLength > 0) ? input.maxLength - (input.value.length - (end - start)) : Infinity;
  if (text.length > room) return;
  input.value = input.value.slice(0, start) + text + input.value.slice(end);
  const pos = start + text.length;
  try { input.setSelectionRange(pos, pos); } catch (_) {}
}

function setupEmojiPicker(overlay, button, input) {
  if (!button || !input) return;
  let pop = null;
  const close = () => { pop?.remove(); pop = null; };
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    if (pop) { close(); return; }
    pop = document.createElement("div");
    pop.className = "emoji-pop";
    pop.innerHTML = CHAT_EMOJIS.map((em) => `<button type="button" class="emoji-item">${em}</button>`).join("");
    button.parentElement.style.position = "relative";
    button.parentElement.appendChild(pop);
    pop.querySelectorAll(".emoji-item").forEach((b) => b.addEventListener("click", (ev) => {
      ev.stopPropagation();
      insertAtCursor(input, b.textContent);
      input.focus();
    }));
  });
  overlay.addEventListener("click", (e) => {
    if (pop && !e.target.closest(".emoji-pop") && !e.target.closest(".emoji-btn")) close();
  });
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

    // #4: keep the currently-open list page live without disrupting the user.
    if (state.activePage === "groups" && state.pageShellRendered === "groups"
        && state.lastGroupInviteCount >= 0 && (data.groupInvites || 0) !== state.lastGroupInviteCount) {
      renderGroupsPage().catch((e) => console.warn("Groups refresh error:", e.message));
    }
    state.lastGroupInviteCount = data.groupInvites || 0;

    if (state.pageShellRendered === "friends" && state.friendsTab === "messages"
        && state.lastDmCount >= 0 && (data.dmMessages || 0) !== state.lastDmCount
        && !document.querySelector("#dmChatOverlay")) {
      refreshFriendsPage().catch((e) => console.warn("Messages refresh error:", e.message));
    }
    state.lastDmCount = data.dmMessages || 0;
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

  // #1: the recovery link is opened while logged OUT and must not be redirected
  // to home (which would also discard the ?token_hash=... in the URL).
  if (route === "/recover") {
    state.showHero = false; state.activePage = "recover"; renderApp(); return;
  }

  // #3: invite links (/join/<code>) work logged in or out.
  const joinMatch = route.match(/^\/join\/([^/]+)$/);
  if (joinMatch) {
    handleJoinLink(decodeURIComponent(joinMatch[1]));
    return;
  }

  if (!isLoggedIn()) {
    if (route !== "/home") history.replaceState({}, "", "/home");
    state.showHero = true; state.activePage = ""; state.loginOpen = false;
    renderApp(); return;
  }

  if (route === "/home") { state.showHero = true; state.activePage = ""; renderApp(); return; }
  if (route === "/main") { state.showHero = false; state.activePage = ""; renderApp(); return; }

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

// Reads recovery parameters from either the query string or the URL hash.
function getRecoveryParams() {
  const url = new URL(window.location.href);
  const hash = new URLSearchParams((window.location.hash || "").replace(/^#/, ""));
  return {
    error: url.searchParams.get("error") || hash.get("error") || url.searchParams.get("error_code") || hash.get("error_code") || "",
    tokenHash: url.searchParams.get("token_hash") || "",
    type: url.searchParams.get("type") || "recovery"
  };
}

// Ensures a recovery session exists at the moment the user submits.
// The token is only consumed here (on user action), so email link scanners
// that pre-fetch the page can't burn it first.
async function ensureRecoverySession(params) {
  if (state.supabaseSession) return true;
  if (!state.supabaseClient) return false;
  try {
    if (params.tokenHash) {
      const { data, error } = await state.supabaseClient.auth.verifyOtp({ type: params.type, token_hash: params.tokenHash });
      if (error) throw error;
      if (data?.session) { state.supabaseSession = data.session; return true; }
    }
  } catch (e) { console.warn("verifyOtp:", e.message); return false; }
  // Implicit/hash flow: the session may already be established by the client.
  try {
    const { data } = await state.supabaseClient.auth.getSession();
    if (data.session) { state.supabaseSession = data.session; return true; }
  } catch (_) {}
  return Boolean(state.supabaseSession);
}

function renderRecoverPage() {
  // #1: reachable WITHOUT being logged in and with no current password required.
  // The token is verified only when the user submits (scanner-proof), and Supabase's
  // own "expired" error in the URL is detected immediately.
  setVisible(loginPanel, false); setVisible(topbar, false); setVisible(pagePanel, false);
  hideAppPanels(); removeChatButton();
  if (!state.supabaseClient) { navigate("/home"); return; }
  if (document.querySelector("#recoverPage")) return;

  const params = getRecoveryParams();

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

  const invalidLink = () => showModal(
    t("recoverPassword") || "Recover Password",
    t("recoveryLinkInvalid") || "This reset link is invalid or has expired. Please request a new password reset email.",
    [{ label: t("ok") || "OK", primary: true, action: () => { document.querySelector("#recoverPage")?.remove(); navigate("/home"); } }],
    { variant: "danger" }
  );

  // Supabase already told us the link is bad (e.g. otp_expired) — say so up front.
  if (params.error) { invalidLink(); return; }
  // No token, no hash session pending, and not already in a recovery session → not allowed here.
  if (!params.tokenHash && !state.supabaseSession && !(window.location.hash || "").includes("access_token")) {
    invalidLink(); return;
  }

  document.querySelector("#recoverConfirmBtn").addEventListener("click", async () => {
    const newPw = document.querySelector("#recoverNewPassword")?.value;
    const confirmPw = document.querySelector("#recoverConfirmPassword")?.value;
    if (!newPw || !confirmPw) { showError(t("fillPasswordFields")); return; }
    if (newPw !== confirmPw) { showError(t("passwordMismatch")); return; }
    if (!isStrongPassword(newPw)) { showError(t("passwordRequirements")); return; }
    try {
      const ok = await ensureRecoverySession(params);
      if (!ok) { invalidLink(); return; }
      const { error } = await state.supabaseClient.auth.updateUser({ password: newPw });
      if (error) throw new Error(error.message);
      try { await state.supabaseClient.auth.signOut(); } catch (_) {}
      state.supabaseSession = null;
      document.querySelector("#recoverPage")?.remove();
      navigate("/home");
      showModal(
        t("passwordResetSuccess") || "Password reset successfully!",
        t("passwordResetSuccessBody") || "Your password has been changed. You can now log in with your new password.",
        [{ label: t("login") || "Log in", primary: true, action: () => openLogin() }]
      );
    } catch (e) { showError(e.message); }
  });

  document.querySelector("#recoverCancelBtn").addEventListener("click", () => {
    document.querySelector("#recoverPage")?.remove();
    navigate("/home");
  });
}

function renderApp() {
  updateBottomNav();
  if (state.activePage === "recover") { renderRecoverPage(); return; }
  if (!isLoggedIn()) {
    setVisible(loginPanel, true); setVisible(loginForm, state.loginOpen && !state.showResetPasswordForm);
    setVisible(topbar, false); setVisible(pagePanel, false);
    setVisible(heroEnterButton, false); setVisible(heroLoginButton, true); setVisible(heroSignupButton, true);
    loginForm.querySelector("h2").textContent = state.authMode === "signup" ? t("createAccount") : t("enterPlanswipe");
    setVisible(loginButton, state.authMode !== "signup");
    setVisible(registerButton, state.authMode === "signup");
    setVisible(forgotPasswordButton, state.authMode !== "signup" && !state.showResetPasswordForm && !state.forgotPasswordMode);
    setVisible(loginEmail, state.authMode === "signup");
    loginUsername.placeholder = state.authMode === "signup" ? t("username") : (t("usernameOrEmail") || "Username or email");
    loginEmail.placeholder = t("email");
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
                redirectTo: RECOVER_REDIRECT
              });
              if (error) throw new Error(error.message);
            }
            state.forgotPasswordMode = false;
            document.querySelector("#forgotPasswordForm")?.remove();
            renderApp();
            showModal(
              t("recoverPassword") || "Recover Password",
              (t("recoveryEmailSent") || "If an account exists for {email}, a password reset link has been sent. Check your inbox.").replace("{email}", email),
              [{ label: t("ok") || "OK", primary: true }]
            );
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

  setTopbarAvatar(state.account?.profile?.picture, currentUsername());

  refreshNotifications();

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

  if (reviewButton) setVisible(reviewButton, areaReady && typeReady);
  if (exitCurrentGroupButton) setVisible(exitCurrentGroupButton, Boolean(state.group));

  if (!areaReady) { setVisible(decisionPanel, true); setVisible(swipeLayout, false); setVisible(resultsPanel, false); renderDecisionStep("area"); return; }
  if (!typeReady) { setVisible(decisionPanel, true); setVisible(swipeLayout, false); setVisible(resultsPanel, false); renderDecisionStep("type"); return; }
  const hasLoadedPlaces = Boolean((state.group.places || []).length || state.group.placesExhausted);
  if (!hasLoadedPlaces && !allCommentsDone()) { renderCommentStep(); return; }

  // Places are being fetched (comments done, none back yet) — show a skeleton.
  if (!hasLoadedPlaces && allCommentsDone()) {
    setVisible(decisionPanel, false);
    setVisible(resultsPanel, false);
    setVisible(swipeLayout, true);
    if (searchSummary) searchSummary.textContent = t("loadingPlaces") || "Finding places\u2026";
    const prog = document.querySelector("#swipeProgress"); if (prog) prog.textContent = "";
    showDeckSkeleton(true);
    return;
  }
  showDeckSkeleton(false);

  searchSummary.textContent = (() => {
    const area = state.group.search?.area;
    const activity = state.group.search?.activity;
    if (area && activity) return `${activity} in ${area}`;
    return `${t("searchFrom")}: "${state.group.search?.query || ""}"`;
  })();
  setVisible(decisionPanel, false);
  setVisible(resultsPanel, true);
  renderResults();
  checkCelebration();

  const totalPlaces = state.group.places || [];
  const runoffActive = Boolean(state.group.runoff && !state.group.runoff.winner);
  if (state.index < totalPlaces.length && !runoffActive) { setVisible(swipeLayout, true); renderCard(); }
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
  const startedAt = Date.now();
  try {
    const data = await api(`/api/groups/${state.groupCode}`);
    // If the user made a choice/vote while this poll was in flight, that response is
    // authoritative — discard this now-stale poll so it can't revert their selection.
    if (state.groupMutationAt && state.groupMutationAt > startedAt) return;
    const newGroup = data.group;
    state.pollErrorCount = 0;

    // #12: seed the group-chat read baseline from the server so it survives a refresh.
    if (!state.chatLastReadTimestamp && newGroup?.myLastRead) {
      state.chatLastReadTimestamp = newGroup.myLastRead;
    }

    // #6: detect the "not everyone agrees" reset and announce it once.
    const resetId = newGroup?.reset?.id || null;
    const resetKind = newGroup?.reset?.kind || "area";
    const isNewReset = resetId && resetId !== state.lastSeenResetId;

    // #7: don't disturb the UI while the user is mid-vote or on another page,
    // and only re-render when something actually changed (prevents lost clicks / lag).
    const sig = JSON.stringify(newGroup);
    const changed = sig !== state.groupSig;
    state.groupSig = sig;
    state.group = newGroup;

    if (isNewReset) {
      state.lastSeenResetId = resetId;
      state.index = 0;
      if (!state.activePage) renderApp();
      const what = resetKind === "type" ? t("theActivity") || "the activity" : t("theArea") || "the area";
      showModal(
        t("noAgreementTitle") || "Not everyone agrees",
        (t("noAgreementBody") || "Your group didn't all pick the same {thing}, so the choices were reset. Please choose again together.").replace("{thing}", what),
        [{ label: t("ok") || "OK", primary: true }],
        { variant: "danger" }
      );
      return;
    }

    if (state.activePage) return;
    if (state.votingInProgress) return;
    if (changed) renderApp();
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
  const data = await api(`/api/groups/${state.group.code}/choice`, { method: "POST", body: { userId: state.user.id, kind, optionId, customLabel, useAiSuggestions: state.useAiSuggestions, language: state.language } });
  if (kind === "area") state.pendingAreaOption = null;
  state.groupMutationAt = Date.now();
  state.index = 0; state.group = data.group; state.groupSig = JSON.stringify(data.group); renderApp();
}

async function goBackChoice() {
  if (!state.group || !state.user) return;
  if (state.pendingAreaOption) {
    state.pendingAreaOption = null;
    renderDecisionStep("area");
    return;
  }
  // Step one question back through the basics.
  let step;
  if (consensus("area") && consensus("type")) step = "type";      // comment step -> back to activity type
  else if (consensus("area") && !consensus("type")) step = "area"; // type step -> back to area
  else return;                                                     // area step: nothing before it
  const data = await api(`/api/groups/${state.group.code}/back`, { method: "POST", body: { userId: state.user.id, step } });
  state.index = 0; state.pendingAreaOption = null; state.placesExhausted = false;
  state.groupMutationAt = Date.now();
  state.group = data.group; renderApp();
}

// #2: "Change basics" always returns the group to the very first step (area).
async function changeBasics() {
  if (!state.group || !state.user) return;
  const data = await api(`/api/groups/${state.group.code}/back`, { method: "POST", body: { userId: state.user.id, step: "area" } });
  state.index = 0; state.pendingAreaOption = null; state.placesExhausted = false;
  state.groupMutationAt = Date.now();
  state.group = data.group; renderApp();
}

function flyOffCard(dir) {
  const x = dir === "right" ? 720 : dir === "left" ? -720 : 0;
  const y = dir === "up" ? -820 : 40;
  const rot = dir === "right" ? 18 : dir === "left" ? -18 : 0;
  activityCard.style.transition = "transform 0.3s ease, opacity 0.3s ease";
  activityCard.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
  activityCard.style.opacity = "0";
}
function resetCardTransform() {
  activityCard.style.transition = "";
  activityCard.style.transform = "";
  activityCard.style.opacity = "";
  const hint = document.querySelector("#swipeHint");
  if (hint) { hint.style.opacity = "0"; hint.className = "swipe-hint"; }
}
function dirForVote(value) {
  return value === "yes" ? "right" : value === "no" ? "left" : "up";
}

async function vote(value) {
  if (state.votingInProgress) return;
  const places = state.group.places || [];
  const place = places[state.index];
  if (!place) return;
  state.votingInProgress = true;
  [noButton, yesButton].forEach((btn) => { if (btn) btn.classList.add("is-voting"); });
  flyOffCard(dirForVote(value));
  try {
    const data = await api(`/api/groups/${state.group.code}/vote`, { method: "POST", body: { userId: state.user.id, placeId: place.id, vote: value } });
    state.groupMutationAt = Date.now();
    state.group = data.group;
    setTimeout(() => { state.index += 1; state.votingInProgress = false; renderApp(); }, 240);
  } catch (e) {
    state.votingInProgress = false;
    resetCardTransform();
    [noButton, yesButton].forEach((btn) => { if (btn) btn.classList.remove("is-voting"); });
    throw e;
  }
}

// ===== Swipe / drag gestures on the card =====
let cardDrag = null;
function setupCardSwipe() {
  activityCard.addEventListener("pointerdown", (e) => {
    if (state.votingInProgress) return;
    if (!state.group?.places?.[state.index]) return;
    if (e.target.closest("a, button")) return; // let links / "More" work
    if (e.pointerType === "mouse" && e.button !== 0) return;
    cardDrag = { x0: e.clientX, y0: e.clientY, dx: 0, dy: 0, id: e.pointerId, active: false, decided: false };
  });
  activityCard.addEventListener("pointermove", (e) => {
    if (!cardDrag || cardDrag.id !== e.pointerId) return;
    cardDrag.dx = e.clientX - cardDrag.x0;
    cardDrag.dy = e.clientY - cardDrag.y0;
    if (!cardDrag.decided) {
      const ax = Math.abs(cardDrag.dx), ay = Math.abs(cardDrag.dy);
      if (ax < 10 && ay < 10) return;      // wait for a clear direction
      if (ay >= ax) { cardDrag = null; return; } // vertical intent -> let the page scroll
      cardDrag.decided = true; cardDrag.active = true;
      activityCard.style.transition = "none";
      try { activityCard.setPointerCapture(e.pointerId); } catch (_) {}
    }
    if (cardDrag.active) {
      if (e.cancelable) e.preventDefault();
      const dx = cardDrag.dx;                       // horizontal movement only
      activityCard.style.transform = `translateX(${dx}px) rotate(${dx / 20}deg)`;
      updateSwipeHint(dx);
      setSwipeTint(dx);
    }
  });
  const finish = () => {
    if (!cardDrag) { clearSwipeTint(); return; }
    const active = cardDrag.active;
    const dx = cardDrag.dx;
    cardDrag = null;
    clearSwipeTint();
    if (!active) return;                            // a tap or a vertical scroll
    const THRESH = 95;
    let value = null;
    if (dx > THRESH) value = "yes";
    else if (dx < -THRESH) value = "no";
    if (value) {
      vote(value).catch((e) => showError(e.message));
    } else {
      activityCard.style.transition = "transform 0.25s ease";
      activityCard.style.transform = "";
      const hint = document.querySelector("#swipeHint");
      if (hint) { hint.style.opacity = "0"; hint.className = "swipe-hint"; }
    }
  };
  activityCard.addEventListener("pointerup", finish);
  activityCard.addEventListener("pointercancel", finish);
}

function setSwipeTint(dx) {
  const tint = document.querySelector("#swipeTint");
  if (!tint) return;
  const strength = Math.min(0.55, Math.abs(dx) / 260);
  if (dx > 12) { tint.className = "swipe-tint tint-yes"; tint.style.opacity = String(strength); }
  else if (dx < -12) { tint.className = "swipe-tint tint-no"; tint.style.opacity = String(strength); }
  else { tint.style.opacity = "0"; }
}
function clearSwipeTint() {
  const tint = document.querySelector("#swipeTint");
  if (tint) { tint.style.opacity = "0"; }
}

function updateSwipeHint(dx) {
  const hint = document.querySelector("#swipeHint");
  if (!hint) return;
  let label = "", cls = "";
  if (dx > 40) { label = t("choiceYes"); cls = "hint-yes"; }
  else if (dx < -40) { label = t("choiceNo"); cls = "hint-no"; }
  hint.className = "swipe-hint" + (cls ? " " + cls : "");
  hint.textContent = label;
  hint.style.opacity = label ? String(Math.min(1, Math.abs(dx) / 120)) : "0";
}

function undoVote() {
  if (state.votingInProgress) return;
  if (state.index > 0) { state.index -= 1; renderApp(); }
}

// ===== Loading skeleton on the swipe deck =====
function showDeckSkeleton(on) {
  const sk = document.querySelector("#deckSkeleton");
  if (sk) sk.hidden = !on;
  if (activityCard) activityCard.style.display = on ? "none" : "";
  const actions = document.querySelector(".swipe-actions");
  if (actions) actions.style.visibility = on ? "hidden" : "";
  const tip = document.querySelector("#swipeTip");
  if (tip) tip.style.visibility = on ? "hidden" : "";
  if (on) { const tut = document.querySelector("#swipeTutorial"); if (tut) tut.classList.add("is-hidden"); }
}

// ===== Match celebration =====
function checkCelebration() {
  const matchId = state.group?.consensus?.place || null;
  if (state.celebratedPlaceId === undefined) { state.celebratedPlaceId = matchId; return; }
  if (matchId && matchId !== state.celebratedPlaceId) {
    state.celebratedPlaceId = matchId;
    const place = (state.group.places || []).find((p) => p.id === matchId);
    celebrateMatch(place);
  } else if (!matchId && state.celebratedPlaceId) {
    state.celebratedPlaceId = null;
  }
}

function celebrateMatch(place) {
  launchConfetti();
  const name = place?.title || t("yourPlace") || "your place";
  showModal(
    `\u{1F389} ${t("itsAMatch") || "It's a match!"}`,
    (t("matchBody") || "Your group agreed on {place}. Time to make it happen!").replace("{place}", name),
    [{ label: t("nice") || "Nice!", primary: true }],
    { html: false }
  );
}

function launchConfetti() {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const layer = document.createElement("div");
  layer.className = "confetti-layer";
  const colors = ["#12805e", "#18a374", "#ff6a42", "#ffd27a", "#3a7bd5", "#e85d9a"];
  for (let i = 0; i < 70; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = Math.random() * 0.6 + "s";
    piece.style.animationDuration = 2.4 + Math.random() * 1.6 + "s";
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    layer.appendChild(piece);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 4200);
}

// ===== Mobile bottom navigation =====
function setupBottomNav() {
  const nav = document.querySelector("#bottomNav");
  if (!nav) return;
  nav.querySelectorAll("[data-nav]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.nav;
      if (target === "search") { openPlacesSearch(); return; }
      const route = target === "main" ? "/main" : "/" + target;
      navigate(route);
    });
  });
}

function updateBottomNav() {
  const nav = document.querySelector("#bottomNav");
  if (!nav) return;
  const loggedIn = isLoggedIn() && !state.showHero;
  nav.classList.toggle("is-hidden", !loggedIn);
  document.body.classList.toggle("has-bottom-nav", loggedIn);
  const page = state.activePage || "";
  const map = { "": "main", "groups": "groups", "friends": "friends", "messages": "friends", "personal": "personal" };
  const active = map[page] || (page.startsWith("profile:") ? "friends" : "main");
  nav.querySelectorAll("[data-nav]").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.nav === active);
  });
  nav.querySelectorAll("[data-navlabel]").forEach((el) => {
    const key = "nav" + el.dataset.navlabel.charAt(0).toUpperCase() + el.dataset.navlabel.slice(1);
    const val = t(key); if (val) el.textContent = val;
  });
  const badge = document.querySelector("#bnFriendsBadge");
  if (badge) {
    const n = state.notifications?.friendRequests || 0;
    badge.textContent = n > 9 ? "9+" : String(n);
    badge.classList.toggle("is-hidden", n <= 0);
  }
}

async function selectPlace(placeId) {
  const data = await api(`/api/groups/${state.group.code}/select-place`, { method: "POST", body: { userId: state.user.id, placeId } });
  state.groupMutationAt = Date.now();
  state.group = data.group;
  renderResults();
}

// #2: a small picker that lets you add a value by typing OR by tapping one of
// your saved favourites in that category (areas / activities / places).
function pickWithFavourites({ title, favourites, placeholder, onPick }) {
  document.querySelector("#pickModal")?.remove();
  const overlay = document.createElement("div");
  overlay.id = "pickModal";
  overlay.className = "modal-overlay";
  const favs = (favourites || []).filter(Boolean);
  const favBlock = favs.length
    ? `<div class="pick-favs-label">${escapeHtml(t("fromYourFavourites") || "From your favourites")}</div>
       <div class="pick-favs">${favs.map((f) => `<button type="button" class="pick-chip" data-fav="${escapeHtml(f)}">${escapeHtml(f)}</button>`).join("")}</div>`
    : "";
  overlay.innerHTML = `
    <div class="modal-panel" role="dialog" aria-modal="true">
      <h3>${escapeHtml(title)}</h3>
      ${favBlock}
      <input type="text" id="pickInput" class="pick-input" placeholder="${escapeHtml(placeholder || t("orTypeNew") || "Or type a new one")}" autocomplete="off">
      <div class="modal-actions">
        <button class="btn-ghost" type="button" id="pickCancel">${escapeHtml(t("cancel"))}</button>
        <button class="btn-primary" type="button" id="pickAdd">${escapeHtml(t("add") || "Add")}</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  const close = () => overlay.remove();
  const choose = (val) => { const v = String(val || "").trim(); if (!v) return; close(); onPick(v); };
  overlay.querySelectorAll(".pick-chip").forEach((c) => c.addEventListener("click", () => choose(c.dataset.fav)));
  overlay.querySelector("#pickAdd").addEventListener("click", () => choose(overlay.querySelector("#pickInput").value));
  overlay.querySelector("#pickInput").addEventListener("keydown", (e) => { if (e.key === "Enter") choose(e.target.value); });
  overlay.querySelector("#pickCancel").addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  setTimeout(() => overlay.querySelector("#pickInput")?.focus(), 30);
}

function addOwnPlace() {
  const favourites = getPreferences().places || [];
  pickWithFavourites({
    title: t("addYourOwnPlace"),
    favourites,
    placeholder: t("addAnotherPlace"),
    onPick: async (title) => {
      const favourite = favourites.find((item) => item.toLowerCase() === title.toLowerCase());
      try {
        const data = await api(`/api/groups/${state.group.code}/custom-place`, {
          method: "POST",
          body: {
            title,
            description: favourite ? `${t("useFavourite")}: ${favourite}` : "",
            area: state.group.search?.area || "",
            category: state.group.search?.activity || ""
          }
        });
        state.groupMutationAt = Date.now();
        state.group = data.group;
        state.index = Math.max(0, (state.group.places || []).length - 1);
        renderApp();
      } catch (e) { showError(e.message); }
    }
  });
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
  const idx = preferences.places.findIndex((p) => p.toLowerCase() === title.toLowerCase());
  if (idx === -1) preferences.places.push(title);   // add
  else preferences.places.splice(idx, 1);           // toggle off (remove)
  api("/api/account", { method: "PATCH", body: { username: currentUsername(), profile: { ...profile, preferences } } })
    .then((data) => { saveAccount(data.user); renderCard(); })
    .catch((err) => showError(err.message));
}

// ====== #3: STANDALONE PLACE SEARCH ======
const searchPlaceMap = {};

function placesAreaOptions(sel) {
  return `<option value="">${escapeHtml(t("allOfAthens"))}</option>` +
    (state.areas || []).map((a) => `<option value="${escapeHtml(a.id)}" ${a.id === sel ? "selected" : ""}>${escapeHtml(a.label)}</option>`).join("");
}
function placesCategoryOptions() {
  return `<option value="">${escapeHtml(t("anyCategory"))}</option>` +
    (state.types || []).map((tp) => `<option value="${escapeHtml(tp.id)}">${escapeHtml(tp.label)}</option>`).join("");
}
function placesAgeOptions() {
  return `<option value="">${escapeHtml(t("anyAge"))}</option>` +
    ageGroups.map((g) => `<option value="${escapeHtml(g)}">${escapeHtml(g)}</option>`).join("");
}

function openPlacesSearch() {
  document.querySelector("#placesSearchOverlay")?.remove();
  const overlay = document.createElement("div");
  overlay.id = "placesSearchOverlay";
  overlay.className = "modal-overlay search-overlay";
  overlay.innerHTML = `
    <div class="search-panel">
      <div class="search-panel-head">
        <h3>${escapeHtml(t("searchPlaces"))}</h3>
        <button class="modal-close-btn search-close-btn" id="placesSearchClose" aria-label="${escapeHtml(t("close"))}">\u2715</button>
      </div>
      <div class="search-mode-toggle">
        <button type="button" class="search-mode-btn is-active" data-mode="name">${escapeHtml(t("byName"))}</button>
        <button type="button" class="search-mode-btn" data-mode="browse">${escapeHtml(t("browse"))}</button>
      </div>
      <div class="search-fields" id="searchFields"></div>
      <div class="search-results" id="searchResults"></div>
    </div>`;
  document.body.appendChild(overlay);
  let mode = "name";
  const fields = overlay.querySelector("#searchFields");
  const renderFields = () => {
    if (mode === "name") {
      fields.innerHTML = `
        <input type="text" id="searchQueryInput" class="search-query" placeholder="${escapeHtml(t("searchByNamePlaceholder"))}" autocomplete="off">
        <div class="search-filter-row">
          <label>${escapeHtml(t("area"))}<input id="searchArea" type="text" placeholder="${escapeHtml(t("areaFreeTextPlaceholder"))}" autocomplete="off"></label>
        </div>
        <label class="search-comments-label">${escapeHtml(t("commentsOptional"))}<textarea id="searchComments" rows="2" placeholder="${escapeHtml(t("commentsPlaceholder"))}"></textarea></label>
        <button class="btn-primary" id="runSearchBtn" type="button">${escapeHtml(t("search"))}</button>`;
    } else {
      fields.innerHTML = `
        <div class="search-filter-row">
          <label>${escapeHtml(t("area"))}<input id="searchArea" type="text" placeholder="${escapeHtml(t("areaFreeTextPlaceholder"))}" autocomplete="off"></label>
          <label>${escapeHtml(t("category"))}<input id="searchCategory" type="text" placeholder="${escapeHtml(t("categoryFreeTextPlaceholder"))}" autocomplete="off"></label>
          <label>${escapeHtml(t("ageGroup"))}<input id="searchAge" type="text" placeholder="${escapeHtml(t("ageFreeTextPlaceholder"))}" autocomplete="off"></label>
        </div>
        <label class="search-comments-label">${escapeHtml(t("commentsOptional"))}<textarea id="searchComments" rows="2" placeholder="${escapeHtml(t("commentsPlaceholder"))}"></textarea></label>
        <button class="btn-primary" id="runSearchBtn" type="button">${escapeHtml(t("search"))}</button>`;
    }
    overlay.querySelector("#runSearchBtn").addEventListener("click", () => runPlacesSearch(overlay, mode));
    overlay.querySelectorAll("input").forEach((input) => {
      input.addEventListener("keydown", (e) => { if (e.key === "Enter") runPlacesSearch(overlay, mode); });
    });
  };
  renderFields();
  overlay.querySelectorAll(".search-mode-btn").forEach((b) => b.addEventListener("click", () => {
    mode = b.dataset.mode;
    overlay.querySelectorAll(".search-mode-btn").forEach((x) => x.classList.toggle("is-active", x === b));
    renderFields();
    overlay.querySelector("#searchResults").innerHTML = "";
  }));
  overlay.querySelector("#placesSearchClose").addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  setTimeout(() => overlay.querySelector("#searchQueryInput")?.focus(), 40);
}

async function runPlacesSearch(overlay, mode) {
  const resultsEl = overlay.querySelector("#searchResults");
  const areaId = overlay.querySelector("#searchArea")?.value || "";
  const query = overlay.querySelector("#searchQueryInput")?.value.trim() || "";
  const category = overlay.querySelector("#searchCategory")?.value || "";
  const ageGroup = overlay.querySelector("#searchAge")?.value || "";
  const comments = overlay.querySelector("#searchComments")?.value.trim() || "";
  if (mode === "name" && !query) { resultsEl.innerHTML = `<p class="muted-note">${escapeHtml(t("enterPlaceName"))}</p>`; return; }
  if (mode === "browse" && !category) { resultsEl.innerHTML = `<p class="muted-note">${escapeHtml(t("chooseCategory"))}</p>`; return; }
  resultsEl.innerHTML = `<div class="chat-loading">\u2026</div>`;
  try {
    const data = await api("/api/places/search", { method: "POST", body: { mode, query, areaId, category, ageGroup, comments, language: state.language } });
    renderPlaceSearchResults(resultsEl, data);
  } catch (e) { resultsEl.innerHTML = `<p class="muted-note">${escapeHtml(e.message)}</p>`; }
}

function placeSearchCard(place) {
  searchPlaceMap[place.id] = place;
  const favs = getPreferences().places || [];
  const isFav = favs.some((p) => p.toLowerCase() === (place.title || "").toLowerCase());
  const rating = place.rating ? `\u2605 ${place.rating}${place.userRatingCount ? ` (${place.userRatingCount})` : ""}` : "";
  return `<article class="search-card" data-place-id="${escapeHtml(place.id)}">
    <div class="search-card-photo" style="background-image:url('${escapeHtml(place.photoUrl || "")}')"></div>
    <div class="search-card-body">
      <h4>${escapeHtml(place.title)}</h4>
      <p class="search-card-meta">${escapeHtml(place.areaLabel || "")}${rating ? ` \u00b7 ${escapeHtml(rating)}` : ""}</p>
      <p class="search-card-addr">${escapeHtml(place.address || "")}</p>
      <div class="search-card-actions">
        <button class="btn-ghost" type="button" data-details>${escapeHtml(t("viewDetails"))}</button>
        <button class="btn-primary search-fav-btn" type="button" data-fav ${isFav ? "disabled" : ""}>${isFav ? `\u2605 ${escapeHtml(t("favourited"))}` : `\u2606 ${escapeHtml(t("addToFavourites"))}`}</button>
      </div>
    </div>
  </article>`;
}

function renderPlaceSearchResults(resultsEl, data) {
  const s = data.sections || {};
  const section = (title, list) => (list && list.length)
    ? `<div class="search-section"><div class="search-section-title">${escapeHtml(title)}</div><div class="search-card-grid">${list.map(placeSearchCard).join("")}</div></div>`
    : "";
  let html = "";
  if (data.mode === "browse") {
    html = section(t("results"), s.results) || `<p class="muted-note">${escapeHtml(t("noPlacesFound"))}</p>`;
    if (data.aiFiltered) html = `<p class="muted-note search-ai-note">${escapeHtml(t("aiFilteredResults"))}</p>${html}`;
  } else {
    html = section(t("thePlace"), s.match)
      + section(t("sameNameElsewhere"), s.elsewhere)
      + section(t("similarNearby"), s.similar);
    if (!html) html = `<p class="muted-note">${escapeHtml(t("noPlacesFound"))}</p>`;
  }
  resultsEl.innerHTML = html;
  resultsEl.querySelectorAll(".search-card").forEach((card) => {
    const place = searchPlaceMap[card.dataset.placeId];
    card.querySelector("[data-details]")?.addEventListener("click", () => place && openPlaceDetails(place));
    const favBtn = card.querySelector("[data-fav]");
    favBtn?.addEventListener("click", () => place && addPlaceTitleToFavourites(place.title, favBtn));
  });
}

function addPlaceTitleToFavourites(title, btnEl) {
  const clean = (title || "").trim();
  if (!clean) return;
  const profile = state.account?.profile || {};
  const places = [...(profile.preferences?.places || [])];
  if (places.some((p) => p.toLowerCase() === clean.toLowerCase())) return;
  places.push(clean);
  const preferences = { ...(profile.preferences || {}), places };
  api("/api/account", { method: "PATCH", body: { username: currentUsername(), profile: { ...profile, preferences } } })
    .then((data) => { saveAccount(data.user); if (btnEl) { btnEl.disabled = true; btnEl.textContent = `\u2605 ${t("favourited")}`; } })
    .catch((err) => showError(err.message));
}

async function openPlaceDetails(place) {
  const rating = place.rating ? `\u2605 ${place.rating}${place.userRatingCount ? ` (${place.userRatingCount})` : ""}` : "";
  const rows = [
    place.address ? `<p class="detail-row">\u{1F4CD} ${escapeHtml(place.address)}</p>` : "",
    place.time ? `<p class="detail-row">\u{1F552} ${escapeHtml(place.time)}</p>` : "",
    place.cost ? `<p class="detail-row">\u{1F4B6} ${escapeHtml(place.cost)}</p>` : "",
    place.phone ? `<p class="detail-row">\u{1F4DE} <a href="tel:${escapeHtml(place.phone)}">${escapeHtml(place.phone)}</a></p>` : "",
    place.website ? `<p class="detail-row">\u{1F517} <a href="${escapeHtml(place.website)}" target="_blank" rel="noopener">${escapeHtml(t("website"))}</a></p>` : "",
    place.mapsUrl ? `<p class="detail-row">\u{1F5FA}\uFE0F <a href="${escapeHtml(place.mapsUrl)}" target="_blank" rel="noopener">${escapeHtml(t("openInMaps"))}</a></p>` : ""
  ].join("");
  const favs = getPreferences().places || [];
  const isFav = favs.some((p) => p.toLowerCase() === (place.title || "").toLowerCase());
  const body = `
    <div class="place-details">
      ${place.photoUrl ? `<div class="detail-photo" style="background-image:url('${escapeHtml(place.photoUrl)}')"></div>` : ""}
      <p class="detail-meta">${escapeHtml(place.areaLabel || "")}${rating ? ` \u00b7 ${escapeHtml(rating)}` : ""}</p>
      ${rows}
      <div class="detail-actions">
        <button class="btn-ghost" type="button" id="detailReviewsBtn">${escapeHtml(t("reviews"))}</button>
        <button class="btn-primary" type="button" id="detailFavBtn" ${isFav ? "disabled" : ""}>${isFav ? `\u2605 ${escapeHtml(t("favourited"))}` : `\u2606 ${escapeHtml(t("addToFavourites"))}`}</button>
      </div>
    </div>`;
  showModal(place.title, body, [{ label: t("close"), primary: true }], { html: true });
  document.querySelector("#detailReviewsBtn")?.addEventListener("click", async () => {
    try {
      const data = await api("/api/reviews", { method: "POST", body: { googlePlaceId: place.googlePlaceId || place.id, language: state.language } });
      const reviews = data.reviews || [];
      if (!reviews.length) { showModal(t("reviews"), t("noReviews"), [{ label: t("ok"), primary: true }]); return; }
      const reviewsHtml = reviews.map((r) => `<div class="review-item"><strong>${escapeHtml(r.author)}</strong> ${r.rating ? `(${r.rating}/5)` : ""}<p>${escapeHtml(r.text)}</p></div>`).join("");
      showModal(t("reviews"), reviewsHtml, [{ label: t("ok"), primary: true }], { html: true });
    } catch (e) { showError(e.message); }
  });
  document.querySelector("#detailFavBtn")?.addEventListener("click", (e) => addPlaceTitleToFavourites(place.title, e.currentTarget));
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
      body: { username: currentUsername(), useAiSuggestions: state.useAiSuggestions, language: state.language }
    });
    state.groupMutationAt = Date.now();
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
        <div class="price">\u20ac1.99 <small>/month</small></div>
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
  likedplaces: { title: "Places & History", eyebrow: "Your activity" },
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
    <div class="pill-row">${(items || []).map((item) => `<span class="preference-pill">${escapeHtml(item)}${!readonly ? `<button type="button" class="pref-remove" data-pref-remove="${escapeHtml(key)}" data-pref-value="${escapeHtml(item)}" aria-label="${escapeHtml(t("remove") || "Remove")}">\u00d7</button>` : ""}</span>`).join("") || `<span class="muted-text">${t("nothingSaved")}</span>`}</div>
    ${!readonly ? `<div class="inline-add"><input type="text" data-pref-input="${escapeHtml(key)}" placeholder="${escapeHtml(placeholder)}"><button type="button" data-pref-add="${escapeHtml(key)}">${escapeHtml(t("add") || "Add")}</button></div>` : ""}
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
  pageEyebrow.textContent = t("account") || t("profileAndSettings");
  pageTitle.textContent = t("profileAndSettings");
  pageDemo.innerHTML = `
    <div class="personal-save-bar"><button class="btn-primary" type="button" id="saveProfileButton" disabled>${t("saveChanges")}</button></div>
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
    </section><section><h3>${t("preferences")}</h3>
      ${preferenceList(t("favouriteAreas"), "areas", preferences.areas, t("addAnotherArea"))}
      ${preferenceList(t("favouriteActivities"), "activities", preferences.activities, t("addAnotherActivity"))}
      ${preferenceList(t("favouritePlaces"), "places", preferences.places, t("addAnotherPlace"))}
    </section></form>${settingsSectionsHtml()}`;

  // #4: Save Changes stays disabled until the profile fields actually change.
  const saveBtn = document.querySelector("#saveProfileButton");
  const bioEl = document.querySelector("#profileBio");
  const ageEl = document.querySelector("#profileAgeGroup");
  const initialBio = profile.bio || "";
  const initialAge = profile.ageGroup || "";
  const checkDirty = () => {
    const dirty = (bioEl?.value || "") !== initialBio || (ageEl?.value || "") !== initialAge;
    if (saveBtn) saveBtn.disabled = !dirty;
  };
  bioEl?.addEventListener("input", checkDirty);
  ageEl?.addEventListener("change", checkDirty);

  // #6: show the current plan in the "My plan" card.
  api(`/api/subscription/status?username=${encodeURIComponent(currentUsername())}`)
    .then((d) => {
      const el = document.querySelector("#myPlanStatus");
      if (el) el.textContent = (d.plan === "pro") ? (t("onProPlan") || "You're on the Pro plan.") : (t("onFreePlan") || "You're on the Free plan.");
    })
    .catch(() => {});
}

function settingsSectionsHtml() {
  const settings = state.account?.profile?.settings || {};
  return `
    <div class="settings-block">
      <section class="wide-panel personal-form my-plan-card">
        <div class="my-plan-head">
          <div>
            <h3>${t("myPlan") || "My plan"}</h3>
            <p class="muted-note" id="myPlanStatus">\u2026</p>
          </div>
          <button class="btn-primary" type="button" id="managePlanButton">${t("managePlan") || "Manage plan"}</button>
        </div>
      </section>
      <section class="wide-panel personal-form"><h3>${t("appearance") || "Appearance"}</h3>
        <div class="settings-toggle theme-toggle-row"><label for="darkModeToggle">${t("darkMode") || "Dark mode"}</label><input type="checkbox" id="darkModeToggle" ${document.documentElement.getAttribute("data-theme") === "dark" ? "checked" : ""}></div>
      </section>
      <section class="wide-panel personal-form"><h3>${t("settings")} \u00b7 ${t("notifications")}</h3>
        <div class="settings-toggle"><label for="notifFriendReq">${t("friendRequestNotif")}</label><input type="checkbox" id="notifFriendReq" ${settings.friendRequestNotif !== false ? "checked" : ""}></div>
        <div class="settings-toggle"><label for="notifGroupInvite">${t("groupInviteNotif")}</label><input type="checkbox" id="notifGroupInvite" ${settings.groupInviteNotif !== false ? "checked" : ""}></div>
      </section>
      <section class="wide-panel personal-form"><h3>${t("privacy")}</h3>
        <div class="settings-toggle"><label for="privacyOnline">${t("showOnlineStatus")}</label><input type="checkbox" id="privacyOnline" ${settings.showOnlineStatus !== false ? "checked" : ""}></div>
        <div class="settings-toggle"><label for="privacyPublic">${t("showProfilePublicly")}</label><input type="checkbox" id="privacyPublic" ${settings.showProfilePublicly !== false ? "checked" : ""}></div>
      </section>
      <button class="btn-primary" type="button" id="saveSettingsButton">${t("saveSettings")}</button>
      <section class="wide-panel personal-form"><h3>${t("session") || "Session"}</h3>
        <p class="muted-note">${t("logoutHint") || "You'll be signed out of this device."}</p>
        <button class="btn-ghost logout-page-btn" type="button" id="logoutPageButton">${t("logout")}</button>
      </section>
      <section class="wide-panel personal-form danger-zone"><h3>${t("accountManagement")}</h3><button class="danger-button" type="button" id="deleteAccountButton">${t("deleteAccount")}</button></section>
    </div>`;
}

function userCard(user, action = "") {
  const preferences = user.profile?.preferences || {};
  const preferenceText = [...(preferences.areas || []), ...(preferences.activities || []), ...(preferences.places || [])].slice(0, 4).join(", ");
  return `<article class="demo-card user-card"><div class="user-card-head">${profileImage(user, "small-profile-preview")}<div><h3>${escapeHtml(user.username)}</h3><p>${escapeHtml(user.profile?.bio || "")}</p></div></div><p>${escapeHtml(preferenceText || "")}</p>${action}</article>`;
}

async function renderFriendsPage() {
  pageEyebrow.textContent = t("yourPeople") || "Your people";
  pageTitle.textContent = t("friends");
  const tab = state.friendsTab || "friends";
  pageDemo.innerHTML = `
    <div class="friends-search">
      <span class="friends-search-icon" aria-hidden="true">\u{1F50D}</span>
      <input id="friendSearchInput" type="text" placeholder="${escapeHtml(t("searchByUsername"))}" autocomplete="off">
      <button class="btn-primary" id="friendSearchButton" type="button">${escapeHtml(t("search"))}</button>
    </div>
    <div id="friendSearchResults" class="people-grid"></div>

    <div class="friends-tabs" role="tablist">
      <button class="friends-tab ${tab === "friends" ? "is-active" : ""}" type="button" data-friends-tab="friends">
        ${escapeHtml(t("friends"))}<span class="tab-count" id="tabCountFriends"></span>
      </button>
      <button class="friends-tab ${tab === "messages" ? "is-active" : ""}" type="button" data-friends-tab="messages">
        ${escapeHtml(t("messages"))}<span class="tab-badge is-hidden" id="tabBadgeMessages"></span>
      </button>
      <button class="friends-tab ${tab === "requests" ? "is-active" : ""}" type="button" data-friends-tab="requests">
        ${escapeHtml(t("requests"))}<span class="tab-badge is-hidden" id="tabBadgeRequests"></span>
      </button>
    </div>
    <div id="friendsTabPanel" class="friends-tab-panel"></div>`;

  pageDemo.querySelectorAll("[data-friends-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.friendsTab = btn.dataset.friendsTab;
      pageDemo.querySelectorAll(".friends-tab").forEach((b) => b.classList.toggle("is-active", b === btn));
      refreshFriendsPage().catch((e) => showError(e.message));
    });
  });

  state.friendsLastRequestCount = -1;
  await refreshFriendsPage();
  state.friendsLastRequestCount = state.notifications.friendRequests || 0;
}

function personRow(user, actionsHtml, subtitle = "") {
  const bio = subtitle || user.profile?.bio || "";
  return `<article class="person-row">
    <div class="person-main">
      ${profileImage(user, "person-avatar")}
      <div class="person-text">
        <h3>${escapeHtml(user.username)}</h3>
        ${bio ? `<p>${escapeHtml(bio)}</p>` : `<p class="person-muted">${escapeHtml(t("noBioYet") || "")}</p>`}
      </div>
    </div>
    <div class="person-actions">${actionsHtml}</div>
  </article>`;
}

function emptyState(icon, title, text) {
  return `<div class="empty-state">
    <div class="empty-icon" aria-hidden="true">${icon}</div>
    <h3>${escapeHtml(title)}</h3>
    ${text ? `<p>${escapeHtml(text)}</p>` : ""}
  </div>`;
}

async function refreshFriendsPage() {
  const data = await api(`/api/friends?username=${encodeURIComponent(currentUsername())}`);
  state.friendsData = data;
  state.friendsDataLoaded = true;
  const panel = document.querySelector("#friendsTabPanel");
  if (!panel) return;
  const tab = state.friendsTab || "friends";

  // Tab counters / badges
  const cf = document.querySelector("#tabCountFriends");
  if (cf) cf.textContent = data.friends.length ? ` (${data.friends.length})` : "";
  const rb = document.querySelector("#tabBadgeRequests");
  if (rb) {
    const n = data.incoming?.length || 0;
    rb.textContent = n > 99 ? "99+" : String(n);
    setVisible(rb, n > 0);
  }

  if (tab === "friends") {
    panel.innerHTML = data.friends.length
      ? `<div class="people-list">${data.friends.map((u) => personRow(u,
          `<button class="btn-ghost" type="button" data-view-profile="${escapeHtml(u.username)}">${escapeHtml(t("viewProfile"))}</button>
           <button class="btn-primary" type="button" data-message-friend="${escapeHtml(u.username)}">${escapeHtml(t("message"))}</button>`
        )).join("")}</div>`
      : emptyState("\u{1F465}", t("noFriends"), t("searchByUsername"));
  } else if (tab === "messages") {
    panel.innerHTML = `<div class="chat-loading">\u2026</div>`;
    try {
      const conv = await api(`/api/messages/conversations?username=${encodeURIComponent(currentUsername())}`);
      const conversations = conv.conversations || [];
      const totalUnread = conversations.reduce((sum, c) => sum + (c.unread || 0), 0);
      const mb = document.querySelector("#tabBadgeMessages");
      if (mb) { mb.textContent = totalUnread > 99 ? "99+" : String(totalUnread); setVisible(mb, totalUnread > 0); }
      panel.innerHTML = conversations.length
        ? `<div class="people-list">${conversations.map((c) => `
            <article class="person-row conversation-row ${c.unread > 0 ? "has-unread" : ""}" data-open-dm="${escapeHtml(c.with)}">
              <div class="person-main">
                ${profileImage({ username: c.with, profile: { picture: c.picture || "" } }, "person-avatar")}
                <div class="person-text">
                  <h3>${escapeHtml(c.with)}${c.unread > 0 ? `<span class="tab-badge">${c.unread > 99 ? "99+" : c.unread}</span>` : ""}</h3>
                  <p class="${c.unread > 0 ? "unread-preview" : ""}">${escapeHtml(c.lastMessage ? c.lastMessage.slice(0, 70) : t("startMessaging"))}</p>
                </div>
              </div>
              <div class="person-actions">
                <button class="btn-primary" type="button" data-open-dm="${escapeHtml(c.with)}">${escapeHtml(t("message"))}</button>
              </div>
            </article>`).join("")}</div>`
        : emptyState("\u{1F4AC}", t("noConversations"), t("startMessaging"));
    } catch (e) {
      panel.innerHTML = emptyState("\u{1F4AC}", t("noConversations"), "");
    }
  } else {
    const incoming = data.incoming.map((u) => personRow(u,
      `<button class="btn-ghost" type="button" data-view-profile="${escapeHtml(u.username)}">${escapeHtml(t("viewProfile"))}</button>
       <button class="btn-primary" type="button" data-accept-friend="${escapeHtml(u.username)}">${escapeHtml(t("accept"))}</button>`));
    const outgoing = data.outgoing.map((u) => personRow(u, `<span class="request-status">${escapeHtml(t("requestSent"))}</span>`));
    const sections = [];
    if (incoming.length) sections.push(`<div class="people-section-title">${escapeHtml(t("incomingRequests") || t("requests"))}</div><div class="people-list">${incoming.join("")}</div>`);
    if (outgoing.length) sections.push(`<div class="people-section-title">${escapeHtml(t("sentRequests") || t("requestSent"))}</div><div class="people-list">${outgoing.join("")}</div>`);
    panel.innerHTML = sections.length ? sections.join("") : emptyState("\u{1F4E8}", t("noPending"), "");
  }

  state.friendsLastRequestCount = data.incoming?.length || 0;
  if (state.notifications) state.notifications.friendRequests = state.friendsLastRequestCount;
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
        <button type="button" class="emoji-btn" id="dmEmojiBtn" aria-label="Emoji">\u{1F642}</button>
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
  setupEmojiPicker(overlay, overlay.querySelector("#dmEmojiBtn"), input);
  
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
        return `<div class="chat-bubble ${isMine ? "chat-bubble-mine" : "chat-bubble-theirs"}" data-msg-id="${escapeHtml(String(msg.id))}"><span class="chat-text">${escapeHtml(msg.message)}</span></div>`;
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
      if (msg.id && container.querySelector(`[data-msg-id="${CSS.escape(String(msg.id))}"]`)) return;
      const isMine = msg.sender === me;
      const bubble = document.createElement("div");
      bubble.className = `chat-bubble ${isMine ? "chat-bubble-mine" : "chat-bubble-theirs"}`;
      if (msg.id) bubble.dataset.msgId = String(msg.id);
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
  state.selectedGroups = new Set();

  let groupInvites = [];
  try {
    const accountData = await loadAccount();
    groupInvites = accountData.profile?.groupInvites || [];
  } catch (_) {}

  let html = `<h3 class="group-section-title">${t("activeGroups")}</h3>`;
  if (active.length) {
    html += `<div class="bulk-bar is-hidden" id="groupBulkBar"><span id="bulkCount"></span><button class="danger-button" type="button" id="bulkDeleteBtn">${t("deleteSelected") || "Delete selected"}</button></div>`;
    html += active.map((g) => `<article class="group-card group-card-selectable"><label class="group-select"><input type="checkbox" class="group-check" data-select-group="${escapeHtml(g.code)}" aria-label="${t("selectGroup") || "Select group"}"></label><div class="group-card-body"><h3>${escapeHtml(g.name)}${g.unreadCount > 0 ? `<span class="group-unread-badge">${g.unreadCount > 99 ? "99+" : g.unreadCount}</span>` : ""}</h3><p class="group-meta">Code ${escapeHtml(g.code)} | ${g.memberCount} member${g.memberCount === 1 ? "" : "s"}</p><div class="group-actions"><button class="btn-primary" type="button" data-open-group="${escapeHtml(g.code)}">Open</button><button class="danger-button" type="button" data-exit-group="${escapeHtml(g.code)}">${t("exitGroupPermanent")}</button></div></div></article>`).join("");
  } else {
    html += `<article class="demo-card"><h3>${t("noActiveGroups")}</h3></article>`;
  }

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

function updateGroupBulkBar() {
  const bar = document.querySelector("#groupBulkBar");
  if (!bar) return;
  const n = state.selectedGroups ? state.selectedGroups.size : 0;
  bar.classList.toggle("is-hidden", n === 0);
  const count = document.querySelector("#bulkCount");
  if (count) count.textContent = `${n} ${t("selected") || "selected"}`;
}

async function deleteSelectedGroups() {
  const codes = Array.from(state.selectedGroups || []);
  if (!codes.length) return;
  if (!confirm((t("confirmDeleteGroups") || "Delete the selected groups? This can't be undone.") + ` (${codes.length})`)) return;
  let failed = 0;
  for (const code of codes) {
    try {
      await api("/api/groups/exit", { method: "POST", body: { username: currentUsername(), groupCode: code } });
      if (state.groupCode === code) leaveGroup();
    } catch (e) { failed++; }
  }
  state.selectedGroups = new Set();
  state.pageShellRendered = "";
  if (failed) showError(t("someGroupsFailed") || "Some groups couldn't be removed. Please try again.");
  navigate("/groups");
}

const LIKED_LIMIT = 8;
const PAST_LIMIT = 5;

function likedCardHtml(item) {
  return `<div class="liked-place-card"><h3>${escapeHtml(item.place)}</h3><p>${escapeHtml(item.area)} | ${escapeHtml(item.activity)}</p><span class="vote-tag ${escapeHtml(item.vote)}">${escapeHtml(item.vote)}</span><span class="group-meta">${escapeHtml(item.groupName || "")}</span></div>`;
}
function pastCardHtml(a, idx) {
  return `<article class="demo-card"><h3>${escapeHtml(a.place)}</h3><p>${escapeHtml(a.area)} | ${escapeHtml(a.activity)}</p><div class="result-buttons" style="margin-top:8px;"><button class="btn-primary" type="button" data-past-fav="${idx}" style="font-size:0.85rem;min-height:34px;padding:0 12px;">${t("addToFavourites")}</button><button class="danger-button" type="button" data-past-remove="${idx}" style="font-size:0.85rem;min-height:34px;padding:0 12px;">${t("remove")}</button></div></article>`;
}
function viewMoreButton(id, remaining, expanded) {
  return `<button class="btn-ghost view-more-btn" type="button" id="${id}">${expanded ? t("viewLess") : `${t("viewMore")} (${remaining})`}</button>`;
}
function paintLikedList() {
  const list = document.querySelector("#likedPlacesList");
  if (!list) return;
  const all = state.likedCache || [];
  if (!all.length) { list.innerHTML = `<article class="demo-card"><h3>${t("noLikedPlaces")}</h3></article>`; return; }
  const shown = state.likedExpanded ? all : all.slice(0, LIKED_LIMIT);
  let html = shown.map(likedCardHtml).join("");
  if (all.length > LIKED_LIMIT) html += viewMoreButton("likedViewMore", all.length - LIKED_LIMIT, state.likedExpanded);
  list.innerHTML = html;
}
function paintPastList() {
  const list = document.querySelector("#pastList");
  if (!list) return;
  const all = state.pastCache || [];
  if (!all.length) { list.innerHTML = `<article class="demo-card"><h3>${t("noPastActivities")}</h3></article>`; return; }
  const shown = state.pastExpanded ? all : all.slice(0, PAST_LIMIT);
  let html = shown.map((a, idx) => pastCardHtml(a, idx)).join("");
  if (all.length > PAST_LIMIT) html += viewMoreButton("pastViewMore", all.length - PAST_LIMIT, state.pastExpanded);
  list.innerHTML = html;
}

async function renderPlacesHistoryPage() {
  pageEyebrow.textContent = t("yourActivity") || "Your activity";
  pageTitle.textContent = t("placesHistory") || "Places & History";
  state.likedExpanded = false;
  state.pastExpanded = false;
  const account = await loadAccount();
  state.pastCache = account.profile?.pastActivities || [];
  pageDemo.innerHTML = `
    <section class="wide-panel"><h3>${t("likedPlaces")}</h3>
      <div id="likedPlacesList" class="places-list"><div class="chat-loading">\u2026</div></div>
    </section>
    <section class="wide-panel">
      <div class="section-head-row"><h3>${t("past")}</h3>
        <button class="btn-primary" type="button" id="showPastActivityForm">${t("logPastActivity")}</button></div>
      <form class="setup-form is-hidden" id="pastActivityForm">
        <label class="field"><span>${t("area")}</span><input id="pastAreaInput" type="text" placeholder="Athens seaside"></label>
        <label class="field"><span>${t("activity")}</span><input id="pastActivityInput" type="text" placeholder="Dinner"></label>
        <label class="field"><span>${t("place")}</span><input id="pastPlaceInput" type="text" placeholder="Restaurant name"></label>
        <button class="btn-primary" type="button" id="savePastActivityButton">${t("saveActivity")}</button>
      </form>
      <div id="pastList" class="places-list"></div>
    </section>`;
  paintPastList();
  try {
    const data = await api(`/api/liked-places?username=${encodeURIComponent(currentUsername())}&userId=${encodeURIComponent(state.user?.id || "")}`);
    state.likedCache = data.places || [];
  } catch (e) {
    state.likedCache = [];
  }
  paintLikedList();
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
  await renderPlacesHistoryPage();
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
    `<button class="btn-primary" type="button" data-add-friend="${escapeHtml(user.username)}">${t("addFriend")}</button>`;

  const removeAction = user.friendStatus === "friends" && user.username !== currentUsername()
    ? `<button class="danger-button" type="button" data-remove-friend="${escapeHtml(user.username)}">${t("removeFriend")}</button>` : "";

  const restricted = user.restricted && user.username !== currentUsername();
  const prefsSection = restricted
    ? `<section class="wide-panel"><p class="muted-note">${t("friendsOnlyProfile") || "Add this person as a friend to see their bio and preferences."}</p></section>`
    : `<section class="wide-panel"><h3>${t("preferences")}</h3>${preferenceList(t("favouriteAreas"), "readonly-areas", preferences.areas, "")}${preferenceList(t("favouriteActivities"), "readonly-activities", preferences.activities, "")}${preferenceList(t("favouritePlaces"), "readonly-places", preferences.places, "")}</section>`;

  pageDemo.innerHTML = `${userCard(user, friendAction)}${removeAction ? `<section class="wide-panel">${removeAction}</section>` : ""}${prefsSection}`;
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
  // Instant loading feedback when switching to a different page (not on same-page polls).
  const targetShell =
    state.activePage === "settings" ? "personal" :
    state.activePage === "messages" ? "friends" :
    state.activePage === "past" ? "likedplaces" :
    state.activePage;
  if (state.pageShellRendered !== targetShell && pageDemo) {
    pageDemo.innerHTML = `<div class="page-loading"><span class="spinner" aria-label="Loading"></span></div>`;
  }
  if (state.activePage === "personal") {
    state.pageShellRendered = "personal";
    renderPersonalInformation().then(() => {
      if (state.showAgeGroupModal) showAgeGroupPopup();
    }).catch((e) => showError(e.message));
    return;
  }
  if (state.activePage === "messages") {
    // Messages now live inside the Friends page as a tab.
    state.friendsTab = "messages";
    if (state.pageShellRendered !== "friends") {
      state.pageShellRendered = "friends";
      renderFriendsPage().catch((e) => showError(e.message));
    }
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
  if (state.activePage === "likedplaces" || state.activePage === "past") {
    state.pageShellRendered = "likedplaces";
    renderPlacesHistoryPage().catch((e) => showError(e.message));
    return;
  }
  if (state.activePage === "settings") {
    state.pageShellRendered = "personal";
    renderPersonalInformation().catch((e) => showError(e.message));
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

async function removePreference(key, value) {
  if (!["areas", "activities", "places"].includes(key)) return;
  const profile = state.account?.profile || {};
  const preferences = { areas: [...(profile.preferences?.areas || [])], activities: [...(profile.preferences?.activities || [])], places: [...(profile.preferences?.places || [])] };
  preferences[key] = preferences[key].filter((item) => item !== value);
  const data = await api("/api/account", { method: "PATCH", body: { username: currentUsername(), profile: { ...profile, preferences } } });
  saveAccount(data.user);
  await renderPersonalInformation();
}

async function updateProfilePicture(file) {
  if (!file) return;
  const reader = new FileReader();
  const picture = await new Promise((resolve, reject) => { reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
  const profile = { ...(state.account?.profile || {}), picture, preferences: state.account?.profile?.preferences || { areas: [], activities: [], places: [] } };
  // #11: update the top-right avatar instantly (before the server round-trip).
  setTopbarAvatar(picture, currentUsername());
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
  state.friendsLastRequestCount = -1;
  if (state.activePage && state.activePage.startsWith("profile:")) {
    await renderAccountProfile(username);
  } else if (state.activePage === "friends") {
    state.pageShellRendered = "friends";
    await renderFriendsPage();
  } else {
    state.activePage = "friends";
    navigate("/friends");
  }
}

async function searchFriends() {
  const input = document.querySelector("#friendSearchInput");
  const results = document.querySelector("#friendSearchResults");
  const query = input?.value.trim() || "";
  if (!results) return;
  if (!query) { results.innerHTML = ""; return; }
  const data = await api(`/api/users/search?username=${encodeURIComponent(currentUsername())}&q=${encodeURIComponent(query)}`);
  const rows = data.users.map((user) => {
    if (user.friendStatus === "friends") return personRow(user, `<button class="btn-ghost" type="button" data-view-profile="${escapeHtml(user.username)}">${escapeHtml(t("viewProfile"))}</button><button class="btn-primary" type="button" data-message-friend="${escapeHtml(user.username)}">${escapeHtml(t("message"))}</button>`);
    if (user.friendStatus === "incoming") return personRow(user, `<button class="btn-primary" type="button" data-accept-friend="${escapeHtml(user.username)}">${escapeHtml(t("accept"))}</button>`);
    if (user.friendStatus === "requested") return personRow(user, `<span class="request-status">${escapeHtml(t("requestSent"))}</span>`);
    return personRow(user, `<button class="btn-primary" type="button" data-add-friend="${escapeHtml(user.username)}">${escapeHtml(t("addFriend"))}</button>`);
  });
  results.innerHTML = rows.length
    ? `<div class="people-section-title">${escapeHtml(t("searchResults") || t("results"))}</div><div class="people-list">${rows.join("")}</div>`
    : emptyState("\u{1F50D}", t("noUsersFound") || "No users found", t("tryAnotherUsername"));
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
    // #5: drop straight into the group instead of just pre-filling the code.
    state.activePage = "";
    state.pageShellRendered = "";
    saveSession(data.user, data.group);
    navigate("/main");
  } catch (e) { showError(e.message); }
}

// ===== #3: invite links =====
function pendingInviteCode() {
  return state.pendingInviteCode || localStorage.getItem("planswipe:pendingInvite") || "";
}
function setPendingInvite(code) {
  state.pendingInviteCode = code || "";
  if (code) localStorage.setItem("planswipe:pendingInvite", code);
  else localStorage.removeItem("planswipe:pendingInvite");
}

// Called when someone opens https://www.planswipe.gr/join/<code>.
function handleJoinLink(code) {
  setPendingInvite(code);
  if (isLoggedIn()) {
    history.replaceState({}, "", "/main");
    state.showHero = false; state.activePage = "";
    renderApp();
    maybeHandlePendingInvite();
  } else {
    // Show the hero normally so they can log in / sign up; the code is remembered
    // and the join prompt appears automatically once they're signed in.
    history.replaceState({}, "", "/home");
    state.showHero = true; state.activePage = ""; state.loginOpen = false;
    renderApp();
  }
}

// Shows the accept/decline prompt if there's a pending invite and the user is in.
function maybeHandlePendingInvite() {
  const code = pendingInviteCode();
  if (!code || !isLoggedIn() || state.invitePromptInFlight) return;
  showJoinInvitePopup(code);
}

async function showJoinInvitePopup(code) {
  state.invitePromptInFlight = true;
  let info = null;
  try { info = await api(`/api/groups/${encodeURIComponent(code)}/preview`); } catch (_) {}
  const done = () => { state.invitePromptInFlight = false; setPendingInvite(""); };
  if (info && info.exists === false) {
    done();
    showModal(t("groupInvite") || "Group invite", t("inviteNotFound") || "That group no longer exists.", [{ label: t("ok"), primary: true }]);
    return;
  }
  const count = info?.memberCount || 0;
  const host = info?.host ? ` (${info.host})` : "";
  const body = count
    ? (t("inviteJoinBody") || "You've been invited to join a group{host} with {n} member(s). Do you want to join?").replace("{host}", host).replace("{n}", count)
    : (t("inviteJoinBodyPlain") || "You've been invited to join a group. Do you want to join?");
  showModal(
    t("groupInvite") || "Group invite",
    body,
    [
      { label: t("decline") || "Decline", primary: false, action: () => done() },
      { label: t("joinGroup") || "Join group", primary: true, action: () => { done(); acceptGroupInvite(code); } }
    ]
  );
}

async function declineGroupInvite(groupCode) {
  const profile = state.account?.profile || {};
  const groupInvites = (profile.groupInvites || []).filter((inv) => inv.groupCode !== groupCode);
  await api("/api/account", { method: "PATCH", body: { username: currentUsername(), profile: { ...profile, groupInvites } } });
  saveAccount({ ...state.account, profile: { ...profile, groupInvites } });
  state.pageShellRendered = "";
  await renderGroupsPage();
}

function showModal(title, message, buttons = [{ label: t("ok"), primary: true, action: () => {} }], opts = {}) {
  document.querySelector("#appModal")?.remove();
  const overlay = document.createElement("div");
  overlay.id = "appModal";
  overlay.className = "modal-overlay";
  const bodyHtml = opts.html ? message : escapeHtml(message);
  const panelClass = opts.variant === "danger" ? "modal-panel modal-danger" : "modal-panel";
  overlay.innerHTML = `
    <div class="${panelClass}" role="dialog" aria-modal="true">
      <button class="modal-close-btn" type="button" id="modalCloseBtn" aria-label="${escapeHtml(t("close") || "Close")}">\u2715</button>
      <h3>${escapeHtml(title)}</h3>
      <div class="modal-body">${bodyHtml}</div>
      <div class="modal-actions">${buttons.map((btn, i) =>
        `<button class="${btn.primary ? "btn-primary" : "btn-ghost"}" type="button" data-modal-btn="${i}">${escapeHtml(btn.label)}</button>`
      ).join("")}</div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector("#modalCloseBtn")?.addEventListener("click", () => overlay.remove());
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
  const link = `${APP_ORIGIN}/join/${state.group.code}`;
  const data = await api(`/api/friends?username=${encodeURIComponent(currentUsername())}`).catch(() => ({ friends: [] }));
  const memberNames = new Set((state.group.members || []).map((m) => m.username));
  const friends = (data.friends || []).filter((f) => !memberNames.has(f.username));

  document.querySelector("#appModal")?.remove();
  const overlay = document.createElement("div");
  overlay.id = "appModal";
  overlay.className = "modal-overlay";
  const friendsBlock = friends.length
    ? `<hr class="modal-sep">
       <p>${escapeHtml(t("inviteSelectFriends"))}</p>
       <div class="invite-friend-list" id="inviteFriendList">
         ${friends.map((f) => `<label class="invite-friend-item"><input type="checkbox" value="${escapeHtml(f.username)}"> ${escapeHtml(f.username)}</label>`).join("")}
       </div>
       <div class="modal-actions">
         <button class="btn-ghost" type="button" id="inviteCancelBtn">${escapeHtml(t("cancel"))}</button>
         <button class="btn-primary" type="button" id="inviteSendBtn">${escapeHtml(t("sendInvites"))}</button>
       </div>`
    : `<p class="muted-note">${escapeHtml(t("noFriendsToInvite"))}</p>
       <div class="modal-actions">
         <button class="btn-ghost" type="button" id="inviteCancelBtn">${escapeHtml(t("close") || t("cancel"))}</button>
       </div>`;
  overlay.innerHTML = `
    <div class="modal-panel" role="dialog" aria-modal="true">
      <h3>${escapeHtml(t("inviteFriends"))}</h3>
      <div class="pick-favs-label">${escapeHtml(t("shareInviteLink") || "Share an invite link")}</div>
      <div class="invite-link-box">
        <input type="text" id="inviteLinkInput" readonly value="${escapeHtml(link)}">
        <button class="btn-primary" type="button" id="copyInviteLink">${escapeHtml(t("copyLink") || "Copy")}</button>
      </div>
      <p class="muted-note">${escapeHtml(t("inviteLinkHelp") || "Anyone you send this link to will be asked to join the group when they open it.")}</p>
      ${friendsBlock}
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  overlay.querySelector("#inviteCancelBtn")?.addEventListener("click", () => overlay.remove());

  overlay.querySelector("#copyInviteLink").addEventListener("click", async () => {
    const btn = overlay.querySelector("#copyInviteLink");
    try { await navigator.clipboard.writeText(link); }
    catch (_) {
      const inp = overlay.querySelector("#inviteLinkInput");
      inp.focus(); inp.select();
      try { document.execCommand("copy"); } catch (e2) {}
    }
    const orig = btn.textContent;
    btn.textContent = t("copied") || "Copied!";
    setTimeout(() => { btn.textContent = orig; }, 1500);
  });

  if (friends.length) {
    overlay.querySelectorAll(".invite-friend-item").forEach((item) => {
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
}

function showError(message) {
  const text = String(message ?? "An error occurred. Please try again.").trim() || "An error occurred. Please try again.";
  if (!isLoggedIn()) { alert(text); return; }
  setVisible(statusPanel, true);
  statusPanel.textContent = text;
}

function openLogin() {
  state.authMode = "login";
  state.loginOpen = true; renderApp();
  requestAnimationFrame(() => {
    (loginForm || loginUsername)?.scrollIntoView({ behavior: "smooth", block: "center" });
    loginUsername.focus({ preventScroll: true });
  });
}

function openSignup() {
  state.authMode = "signup";
  state.loginOpen = true; renderApp();
  requestAnimationFrame(() => {
    (loginForm || loginUsername)?.scrollIntoView({ behavior: "smooth", block: "center" });
    loginUsername.focus({ preventScroll: true });
  });
}

// ====== BOOT ======
async function boot() {
  applyLanguage();
  // Start the options fetch immediately — it needs no auth, so it can overlap
  // the Supabase config/session round-trip instead of waiting behind it.
  const optionsP = api("/api/options");
  await configureSupabaseAuth();
  // Account load only needs the session token, so it can start now and overlap
  // the rest of boot instead of blocking serially later.
  const accountP = isLoggedIn() ? loadAccount().catch(() => null) : Promise.resolve(null);

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

  if (isLoggedIn() && state.supabaseClient && !state.supabaseSession) {
    // Session was already fetched inside configureSupabaseAuth — no session means logged out.
    localStorage.removeItem("planswipe:login"); localStorage.removeItem("planswipe:email");
    localStorage.removeItem("planswipe:account"); state.account = null;
  }

  const options = await optionsP;
  state.areas = options.areas;
  state.types = options.types;

  await accountP;
  window.addEventListener("popstate", onUrlChange);

  // #3: an invite link takes priority over normal boot routing.
  const joinM = window.location.pathname.match(/^\/join\/([^/]+)$/);
  if (joinM) { handleJoinLink(decodeURIComponent(joinM[1])); return; }

  if (isLoggedIn() && state.user && state.groupCode) {
    startPolling();
    await refreshGroup();
    if (["/groups", "/friends", "/messages", "/likedplaces", "/past", "/personal", "/settings", "/subscription"].includes(window.location.pathname)) {
      onUrlChange();
    }
    maybeHandlePendingInvite();
    return;
  }
  const path = window.location.pathname;
  if (path === "/" || path === "" || path === "/home") { navigate(isLoggedIn() ? "/main" : "/home"); }
  else { onUrlChange(); }
  maybeHandlePendingInvite();
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
document.querySelector("#loginPasswordToggle")?.addEventListener("click", () => {
  const input = document.querySelector("#loginPassword");
  const btn = document.querySelector("#loginPasswordToggle");
  if (!input) return;
  const show = input.type === "password";
  input.type = show ? "text" : "password";
  btn.classList.toggle("is-showing", show);
  btn.setAttribute("aria-label", show ? (t("hidePassword") || "Hide password") : (t("showPassword") || "Show password"));
});
registerButton.addEventListener("click", () => registerUser().catch((e) => showError(e.message)));
[loginUsername, loginEmail, loginPassword].forEach((input) => { input.addEventListener("keydown", (e) => { if (e.key === "Enter") (state.authMode === "signup" ? registerUser() : login()).catch((err) => showError(err.message)); }); });
loginPassword.addEventListener("input", renderPasswordStrength);

forgotPasswordButton.addEventListener("click", () => {
  state.forgotPasswordMode = true;
  renderApp();
});

homeButton.addEventListener("click", () => navigate(isLoggedIn() ? "/main" : "/home"));
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
document.addEventListener("click", (e) => { if (!e.target.closest(".profile-wrap")) profileMenu.classList.add("is-hidden"); });

memberRow.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-username]");
  if (!btn) return;
  state.returnRoute = "/main";
  state.activePage = `profile:${btn.dataset.username}`;
  navigate("/profile/" + encodeURIComponent(btn.dataset.username));
});

noButton.addEventListener("click", () => vote("no").catch((e) => showError(e.message)));
yesButton.addEventListener("click", () => vote("yes").catch((e) => showError(e.message)));
if (undoButton) undoButton.addEventListener("click", undoVote);
setupCardSwipe();
setupBottomNav();
function isDarkMode() { return document.documentElement.getAttribute("data-theme") === "dark"; }
function setTheme(dark) {
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  try { localStorage.setItem("planswipe:theme", dark ? "dark" : "light"); } catch (_) {}
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", dark ? "#14161b" : "#12805e");
  const tbtn = document.querySelector("#themeToggleBtn");
  if (tbtn) tbtn.textContent = dark ? "\u2600\uFE0F" : "\u{1F319}";
  const dm = document.querySelector("#darkModeToggle");
  if (dm) dm.checked = dark;
}
document.addEventListener("change", (e) => {
  if (e.target && e.target.id === "darkModeToggle") setTheme(e.target.checked);
});
document.querySelector("#themeToggleBtn")?.addEventListener("click", () => setTheme(!isDarkMode()));
(function () { const tb = document.querySelector("#themeToggleBtn"); if (tb) tb.textContent = isDarkMode() ? "\u2600\uFE0F" : "\u{1F319}"; })();
document.querySelector("#tutorialGotIt")?.addEventListener("click", () => {
  localStorage.setItem("planswipe:swipeTutorialSeen", "1");
  document.querySelector("#swipeTutorial")?.classList.add("is-hidden");
});
backChoiceButton.addEventListener("click", () => goBackChoice().catch((e) => showError(e.message)));
reviewButton.addEventListener("click", () => changeBasics().catch((e) => showError(e.message)));
document.querySelector("#exitCurrentGroupButton")?.addEventListener("click", () => {
  if (!confirm(t("confirmExitTemp") || "Leave this group for now? You can rejoin anytime from My Groups.")) return;
  leaveGroup();
  navigate("/groups");
});
document.querySelector("#openPlacesSearchButton")?.addEventListener("click", openPlacesSearch);
if (continueBrowseButton) {
  continueBrowseButton.addEventListener("click", () => continueBrowsing().catch((e) => showError(e.message)));
}
resultList.addEventListener("click", (e) => {
  const selectBtn = e.target.closest("[data-select-place]");
  if (selectBtn) { selectPlace(selectBtn.dataset.selectPlace).catch((err) => showError(err.message)); return; }
  const bookBtn = e.target.closest("[data-book-place]");
  if (bookBtn) { state.selectedBookPlaceId = state.selectedBookPlaceId === bookBtn.dataset.bookPlace ? "" : bookBtn.dataset.bookPlace; renderResults(); return; }
  // Plan-locking + tie-break
  if (e.target.closest("#lockPlanBtn")) {
    const d = document.querySelector("#planDateInput")?.value;
    const tm = document.querySelector("#planTimeInput")?.value;
    lockPlan(d && tm ? `${d}T${tm}` : "");
    return;
  }
  if (e.target.closest("#changePlanBtn")) { state.planEditing = true; renderResults(); return; }
  if (e.target.closest("#downloadIcsBtn")) {
    const p = (state.group.places || []).find((x) => x.id === state.group.consensus?.place);
    if (p && state.group.plan) downloadIcs(p, state.group.plan.dateTime);
    return;
  }
  const rsvpBtn = e.target.closest("[data-rsvp]");
  if (rsvpBtn) { rsvpPlan(rsvpBtn.dataset.rsvp).catch((err) => showError(err.message)); return; }
  const startRunoffBtn = e.target.closest("#startRunoffBtn");
  if (startRunoffBtn) { startRunoff((startRunoffBtn.dataset.runoffCands || "").split(",").filter(Boolean)); return; }
  const runoffVoteBtn = e.target.closest("[data-runoff-vote]");
  if (runoffVoteBtn) { runoffVote(runoffVoteBtn.dataset.runoffVote); return; }
  if (e.target.closest("#runoffCancelBtn") || e.target.closest("#runoffClearBtn")) { clearRunoff(); return; }
  if (e.target.closest("#addOwnPlaceButton")) { addOwnPlace(); }
});
[languageButton, appLanguageButton].forEach((btn) => btn && btn.addEventListener("click", toggleLanguage));
// #4: Comments box — info popup + apply (re-rank with the note)
document.querySelector("#commentsInfoBtn")?.addEventListener("click", () => {
  showModal(t("commentsInfoTitle"), t("commentsInfoBody"), [{ label: t("ok"), primary: true }]);
});
optionGrid.addEventListener("click", (e) => {
  if (e.target.closest("#aiInfoBtn")) {
    e.preventDefault();
    e.stopPropagation();
    showModal(t("aiInfoTitle"), t("aiInfoBody"), [{ label: t("ok"), primary: true }]);
  }
});
async function finishCommentStep(skip = false) {
  if (!state.group?.code) return;
  const input = document.querySelector("#commentsInput");
  const btn = document.querySelector("#commentsApplyBtn");
  const skipBtn = document.querySelector("#commentsSkipBtn");
  const comment = skip ? "" : (input ? input.value.trim() : "");
  try {
    if (btn) { btn.disabled = true; btn.textContent = t("updating") || "Updating\u2026"; }
    if (skipBtn) skipBtn.disabled = true;
    const data = await api(`/api/groups/${state.group.code}/comment`, {
      method: "POST",
      body: { comment, skip, useAiSuggestions: state.useAiSuggestions, language: state.language }
    });
    state.groupMutationAt = Date.now();
    state.group = data.group;
    renderApp();
  } catch (e) { showError(e.message); }
  finally {
    if (btn) { btn.disabled = false; btn.textContent = t("submitComment"); }
    if (skipBtn) skipBtn.disabled = false;
  }
}

document.querySelector("#commentsApplyBtn")?.addEventListener("click", () => finishCommentStep(false));
document.querySelector("#commentsSkipBtn")?.addEventListener("click", () => finishCommentStep(true));

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
      const data = await api("/api/reviews", { method: "POST", body: { googlePlaceId: place.googlePlaceId || place.id, language: state.language } });
      const reviews = data.reviews || [];
      if (!reviews.length) { showModal(t("reviews"), t("noReviews"), [{ label: t("ok"), primary: true }]); return; }
      const reviewsHtml = reviews.map((r) => `<div style="margin-bottom:10px;padding:10px;border:1px solid var(--line);border-radius:8px;"><strong>${escapeHtml(r.author)}</strong> ${r.rating ? `(${r.rating}/5)` : ""}<p style="margin-top:4px;color:var(--muted);">${escapeHtml(r.text)}</p></div>`).join("");
      showModal(t("reviews"), reviewsHtml, [{ label: t("ok"), primary: true }], { html: true });
    } catch (e) { showError(e.message); }
  });
}

optionGrid.addEventListener("click", (e) => {
  if (e.target.closest("#aiInfoBtn")) return;
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
    btn.classList.remove("is-selected");
    const favs = kind === "area" ? (getPreferences().areas || []) : (getPreferences().activities || []);
    pickWithFavourites({
      title: kind === "area" ? (t("addAnArea") || "Add an area") : (t("addAnActivity") || "Add an activity"),
      favourites: favs,
      placeholder: kind === "area" ? t("addAnotherArea") : t("addAnotherActivity"),
      onPick: (label) => chooseOption(kind, "", label).catch((err) => showError(err.message))
    });
    return;
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
  if (addFriendBtn) {
    const uname = addFriendBtn.dataset.addFriend;
    addFriendBtn.disabled = true;
    addFriendBtn.classList.remove("btn-primary");
    addFriendBtn.classList.add("request-sent-btn");
    addFriendBtn.textContent = t("requestSent");
    requestFriend(uname).catch((err) => showError(err.message));
    return;
  }
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
  if (e.target.closest("#bulkDeleteBtn")) { deleteSelectedGroups().catch((err) => showError(err.message)); return; }
  const saveProfileBtn = e.target.closest("#saveProfileButton");
  if (saveProfileBtn) { saveProfile().catch((err) => showError(err.message)); return; }
  const saveSettingsBtn = e.target.closest("#saveSettingsButton");
  if (saveSettingsBtn) { saveSettings().catch((err) => showError(err.message)); return; }
  const logoutPageBtn = e.target.closest("#logoutPageButton");
  if (logoutPageBtn) {
    showModal(t("logout"), t("logoutConfirm") || "Are you sure you want to log out?", [
      { label: t("cancel"), primary: false },
      { label: t("logout"), primary: true, action: () => logout() }
    ]);
    return;
  }
  const deleteAccBtn = e.target.closest("#deleteAccountButton");
  if (deleteAccBtn) { deleteAccount().catch((err) => showError(err.message)); return; }
  const prefAddBtn = e.target.closest("[data-pref-add]");
  if (prefAddBtn) { addPreference(prefAddBtn.dataset.prefAdd).catch((err) => showError(err.message)); return; }
  const prefRemoveBtn = e.target.closest("[data-pref-remove]");
  if (prefRemoveBtn) { removePreference(prefRemoveBtn.dataset.prefRemove, prefRemoveBtn.dataset.prefValue).catch((err) => showError(err.message)); return; }
  const friendSearchBtn = e.target.closest("#friendSearchButton");
  if (friendSearchBtn) { searchFriends().catch((err) => showError(err.message)); return; }
  const showPastBtn = e.target.closest("#showPastActivityForm");
  if (showPastBtn) { document.querySelector("#pastActivityForm")?.classList.toggle("is-hidden"); return; }
  const savePastBtn = e.target.closest("#savePastActivityButton");
  if (savePastBtn) { savePastActivity().catch((err) => showError(err.message)); return; }
  const forgotPwBtn = e.target.closest("#profileForgotPassword");
  if (forgotPwBtn) {
    const email = state.account?.email || localStorage.getItem("planswipe:email") || "";
    if (!email || !validEmail(email)) { showError(t("noEmailOnAccount") || "No email is set on this account."); return; }
    if (!state.supabaseClient) { showError("Password recovery is temporarily unavailable."); return; }
    state.supabaseClient.auth.resetPasswordForEmail(email, { redirectTo: RECOVER_REDIRECT })
      .then(({ error }) => {
        if (error) throw new Error(error.message);
        showModal(
          t("recoverPassword") || "Recover Password",
          (t("recoveryEmailSent") || "A password reset link has been sent to {email}. Check your inbox.").replace("{email}", email),
          [{ label: t("ok") || "OK", primary: true }]
        );
      })
      .catch((err) => showError(err.message));
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
  const managePlanBtn = e.target.closest("#managePlanButton");
  if (managePlanBtn) { state.activePage = "subscription"; state.returnRoute = "/personal"; navigate("/subscription"); return; }
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
  if (e.target.closest("#likedViewMore")) { state.likedExpanded = !state.likedExpanded; paintLikedList(); return; }
  if (e.target.closest("#pastViewMore")) { state.pastExpanded = !state.pastExpanded; paintPastList(); return; }
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
      .then((data) => { saveAccount(data.user); renderPlacesHistoryPage(); })
      .catch((err) => showError(err.message));
    return;
  }
  // Handle reviews button
  const reviewsBtn = e.target.closest("[data-reviews]");
  if (reviewsBtn) {
    const placeId = reviewsBtn.dataset.reviews;
    api("/api/reviews", { method: "POST", body: { googlePlaceId: placeId, language: state.language } })
      .then((data) => {
        const reviews = data.reviews || [];
        if (!reviews.length) { showModal(t("reviews"), t("noReviews"), [{ label: t("ok"), primary: true }]); return; }
        const reviewsHtml = reviews.map((r) => `<div style="margin-bottom:10px;padding:10px;border:1px solid var(--line);border-radius:8px;"><strong>${escapeHtml(r.author)}</strong> ${r.rating ? `(${r.rating}/5)` : ""}<p style="margin-top:4px;color:var(--muted);">${escapeHtml(r.text)}</p></div>`).join("");
        showModal(t("reviews"), reviewsHtml, [{ label: t("ok"), primary: true }], { html: true });
      })
      .catch((err) => showError(err.message));
    return;
  }
});

pageDemo.addEventListener("change", (e) => { if (e.target.id === "profilePictureInput") updateProfilePicture(e.target.files?.[0]).catch((err) => showError(err.message)); });
pageDemo.addEventListener("change", (e) => {
  const cb = e.target.closest(".group-check");
  if (!cb) return;
  if (!state.selectedGroups) state.selectedGroups = new Set();
  if (cb.checked) state.selectedGroups.add(cb.dataset.selectGroup);
  else state.selectedGroups.delete(cb.dataset.selectGroup);
  updateGroupBulkBar();
});
pageDemo.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.id === "friendSearchInput") { e.preventDefault(); searchFriends().catch((err) => showError(err.message)); } });

function hideAppLoader() {
  const loader = document.querySelector("#appLoader");
  if (loader && !loader.classList.contains("is-hidden")) {
    loader.classList.add("is-hidden");
    setTimeout(() => loader.remove(), 400);
  }
}
boot().catch((e) => showError(e.message)).finally(hideAppLoader);
// Safety net: never let the loader stay up if something stalls during boot.
setTimeout(hideAppLoader, 8000);

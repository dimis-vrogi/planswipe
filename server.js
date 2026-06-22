const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcrypt");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");
const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || "0.0.0.0";
const publicRoot = path.resolve(__dirname, "public");
const googleApiKey = process.env.GOOGLE_MAPS_API_KEY || "";
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openAiApiKey = process.env.OPENAI_API_KEY || "";
const openAiModel = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const BCRYPT_ROUNDS = 10;

if (!process.env.PORT && !process.env.SUPABASE_URL) {
  console.warn("WARNING: .env file not found or empty. Environment variables may be missing.");
}

const supabase = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;
if (!supabase) {
  console.error("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file.");
  process.exit(1);
}

// ====== STRIPE PRICES (static for demo) ======
const STRIPE_PRICE_FREE = "free";
const STRIPE_PRICE_PRO_MONTHLY = 599; // $5.99 in cents
const STRIPE_PRICE_PRO_YEARLY = 4999; // $49.99 in cents

// ====== RATE LIMITER ======
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX) return true;
  return false;
}
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}, 300_000);

// ====== OPTIONS ======
const areaOptions = [
  { id: "north_suburbs", label: "North suburbs", description: "Filothei, Chalandri, Psixiko, Kifisia, Kefalari", queryArea: "north suburbs of Athens", subareas: ["Filothei", "Chalandri", "Psixiko", "Kifisia", "Kefalari"] },
  { id: "athens_center", label: "Center of Athens", description: "Syntagma, Monastiraki, Psyrri, Exarcheia, Kolonaki", queryArea: "center of Athens", subareas: ["Syntagma", "Monastiraki", "Psyrri", "Exarcheia", "Kolonaki"] },
  { id: "south_suburbs", label: "South suburbs", description: "Glyfada, Vouliagmeni, Alimos, Flisvos, Voula", queryArea: "south suburbs of Athens", subareas: ["Glyfada", "Vouliagmeni", "Alimos", "Flisvos", "Voula"] }
];
const typeOptions = [
  { id: "restaurant", label: "Restaurants", description: "Going out to eat, pizza, or food-related choices.", queryType: "restaurant" },
  { id: "gaming",     label: "Gaming",      description: "Bowling, escape rooms, arcades, VR, and other gaming activities.", queryType: "entertainment" },
  { id: "bars",       label: "Bars",        description: "Cocktail bars, wine bars, pubs, and nightlife spots.", queryType: "bar" },
  { id: "movies",     label: "Movies",      description: "Cinemas, open-air theaters, film screenings, and multiplexes.", queryType: "movie_theater" }
];
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif":  "image/gif",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
  ".txt":  "text/plain; charset=utf-8"
};

// ====== HELPERS ======
function sendJson(response, status, data) {
  if (response.headersSent) return;
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(data));
}
function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) { request.destroy(); reject(new Error("Body too large")); }
    });
    request.on("end", () => {
      try { resolve(JSON.parse(body)); }
      catch (error) { reject(new Error("Invalid JSON")); }
    });
    request.on("error", reject);
  });
}
function publicError(error) {
  const message = error.message || "Internal server error";
  if (message.includes("fetch failed") || message.includes("envelope") || message.includes("Failed to fetch")) {
    return { status: 502, message: "External service unavailable." };
  }
  return { status: 400, message };
}
function mimeType(pathname) {
  const ext = path.extname(pathname).toLowerCase();
  return mimeTypes[ext] || "application/octet-stream";
}

// ====== INPUT VALIDATION ======
function isValidUsername(username) {
  return typeof username === "string" && username.length >= 2 && username.length <= 30 && /^[a-zA-Z0-9_\-.]+$/.test(username);
}
function isValidPassword(password) {
  return typeof password === "string" && password.length >= 8 && password.length <= 128
    && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password);
}

// ====== JWT VERIFICATION ======
async function verifyToken(request) {
  const auth = request.headers["authorization"] || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user;
  } catch (_) { return null; }
}
async function requireAuth(request, response, expectedUsername) {
  const supabaseUser = await verifyToken(request);
  if (supabaseUser) {
    const email = supabaseUser.email || "";
    const profile = await getProfileByEmail(email);
    if (profile && profile.username === expectedUsername) return true;
    const metaUsername = supabaseUser.user_metadata?.username || "";
    if (metaUsername === expectedUsername) return true;
    sendJson(response, 403, { error: "Forbidden: token does not match user" });
    return false;
  }
  if (supabaseUrl && supabaseServiceRoleKey) {
    sendJson(response, 401, { error: "Authentication required" });
    return false;
  }
  return true;
}

// ====== PASSWORD HASHING ======
async function hashPassword(password) {
  return bcrypt.hash(String(password), BCRYPT_ROUNDS);
}
async function verifyPassword(password, hash) {
  if (hash && hash.length === 64 && /^[0-9a-f]+$/.test(hash)) {
    const legacy = crypto.createHash("sha256").update(String(password)).digest("hex");
    const match = legacy === hash;
    if (match) {
      const newHash = await bcrypt.hash(String(password), BCRYPT_ROUNDS);
      return { match: true, newHash };
    }
    return { match: false };
  }
  const match = await bcrypt.compare(String(password), String(hash || ""));
  return { match };
}

// ====== STATIC FILES ======
function serveStatic(request, response) {
  let urlPath = request.url.split("?")[0];
  if (urlPath === "/" || !path.extname(urlPath)) urlPath = "/index.html";
  const filePath = path.join(publicRoot, urlPath);
  if (!filePath.startsWith(publicRoot)) { response.writeHead(403); response.end("Forbidden"); return; }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      if (error.code === "ENOENT") {
        const fallback = path.join(publicRoot, "index.html");
        fs.readFile(fallback, (fe, fd) => {
          if (fe) { response.writeHead(404); response.end("Not found"); return; }
          response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          response.end(fd);
        });
        return;
      }
      response.writeHead(500); response.end("Server error"); return;
    }
    response.writeHead(200, { "Content-Type": mimeType(filePath) });
    response.end(data);
  });
}

// ====== SUPABASE DATA LAYER ======
async function getAllGroups() {
  const { data, error } = await supabase.from("groups").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}
async function getGroup(code) {
  const { data, error } = await supabase.from("groups").select("*").eq("code", code).single();
  if (error && error.code === "PGRST116") return null;
  if (error) throw new Error(error.message);
  return data || null;
}
async function saveGroup(group) {
  const { error } = await supabase.from("groups").upsert(
    { code: group.code, data: JSON.parse(JSON.stringify(group)) },
    { onConflict: "code" }
  );
  if (error) throw new Error(error.message);
}
async function loadGroup(code) {
  const data = await getGroup(code);
  return data ? data.data : null;
}
async function getProfileByUsername(username) {
  const { data, error } = await supabase.from("profiles").select("*").eq("username", username).single();
  if (error && error.code === "PGRST116") return null;
  if (error) throw new Error(error.message);
  return data || null;
}
async function getProfileByEmail(email) {
  if (!email) return null;
  const { data, error } = await supabase.from("profiles").select("*").eq("email", email).single();
  if (error && error.code === "PGRST116") return null;
  if (error) throw new Error(error.message);
  return data || null;
}
async function upsertProfile(user) {
  const { error } = await supabase.from("profiles").upsert(
    { username: user.username, email: user.email && user.email.trim() ? user.email : undefined, profile: user.profile || {} },
    { onConflict: "username" }
  );
  if (error) throw new Error(error.message);
}
async function getAllProfiles() {
  const { data, error } = await supabase.from("profiles").select("*");
  if (error) throw new Error(error.message);
  return data || [];
}
async function getUnreadMessageCount(username) {
  if (!username) return 0;
  const profile = await getProfileByUsername(username);
  if (!profile) return 0;
  const profileData = profile.profile || {};
  const lastReadTimestamps = profileData.lastReadTimestamps || {};
  const allGroups = await getAllGroups();
  let totalUnread = 0;
  for (const groupRow of allGroups) {
    const group = groupRow.data;
    if (!group || !group.members?.some((m) => m.username === username)) continue;
    const since = lastReadTimestamps[group.code] || "1970-01-01T00:00:00Z";
    const { data: messages, error } = await supabase
      .from("group_messages")
      .select("id", { count: "exact" })
      .eq("group_code", group.code)
      .neq("username", username)
      .gt("created_at", since);
    if (!error && messages) {
      totalUnread += messages.length;
    }
  }
  return totalUnread;
}
async function getGroupUnreadCounts(username) {
  if (!username) return {};
  const profile = await getProfileByUsername(username);
  if (!profile) return {};
  const profileData = profile.profile || {};
  const lastReadTimestamps = profileData.lastReadTimestamps || {};
  const allGroups = await getAllGroups();
  const counts = {};
  for (const groupRow of allGroups) {
    const group = groupRow.data;
    if (!group || !group.members?.some((m) => m.username === username)) continue;
    const since = lastReadTimestamps[group.code] || "1970-01-01T00:00:00Z";
    const { data: messages, error } = await supabase
      .from("group_messages")
      .select("id", { count: "exact" })
      .eq("group_code", group.code)
      .neq("username", username)
      .gt("created_at", since);
    if (!error && messages) {
      counts[group.code] = messages.length;
    }
  }
  return counts;
}

// ====== GROUP HELPERS ======
function summarizeGroup(group) {
  if (!group) return null;
  const counts = {};
  ["area", "type"].forEach((kind) => {
    const tally = {};
    Object.values(group.choices?.[kind] || {}).forEach((id) => { tally[id] = (tally[id] || 0) + 1; });
    counts[kind] = tally;
  });
  return {
    name: group.name,
    code: group.code,
    members: (group.members || []).map((m) => ({ id: m.id, name: m.name, username: m.username, profile: m.profile || {} })),
    choices:   group.choices  || { area: {}, type: {} },
    consensus: group.consensus || {},
    counts,
    options:   group.options  || {},
    places:    group.places   || [],
    placeSelections: group.placeSelections || {},
    matches:   group.matches  || [],
    votes:     group.votes    || {},
    search:    group.search   || null,
    placesExhausted: Boolean(group.placesExhausted),
    createdAt: group.createdAt
  };
}
function removeUserFromGroup(group, username) {
  const before = group.members?.length || 0;
  group.members = (group.members || []).filter((m) => m.username !== username);
  const remainingIds = new Set((group.members || []).map((m) => m.id));
  ["area", "type"].forEach((kind) => {
    Object.keys(group.choices?.[kind] || {}).forEach((key) => {
      if (!remainingIds.has(key)) delete group.choices[kind][key];
    });
  });
  Object.keys(group.votes || {}).forEach((key) => {
    if (!remainingIds.has(key)) delete group.votes[key];
  });
  Object.keys(group.placeSelections || {}).forEach((key) => {
    if (!remainingIds.has(key)) delete group.placeSelections[key];
  });
  if (group.members.length === 0) {
    group.consensus = {};
    group.search = null;
    group.places = [];
    group.matches = [];
  }
  return group.members.length !== before;
}

function groupAgeGroups(group) {
  return [...new Set((group.members || []).map((m) => m.profile?.ageGroup).filter(Boolean))];
}

function requireAgeGroup(profile) {
  if (!profile?.ageGroup) throw new Error("Select your age group before entering a group.");
}
async function generateUniqueGroupCode() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = String(crypto.randomInt(10000000, 99999999));
    const existing = await getGroup(code);
    if (!existing) return code;
  }
  throw new Error("Unable to generate unique group code after 10 attempts");
}
function generateSamplePlaces(area, activity) {
  const names = [
    `${activity} Spot`, `Best ${activity} in ${area}`, `${area} ${activity} Lounge`,
    `${activity} House`, `Prime ${activity}`, `${activity} Central`
  ];
  const times  = ["11:00\u201323:00", "12:00\u201300:00", "10:00\u201322:00", "09:00\u201302:00", "12:00\u201301:00", "11:00\u201301:00"];
  const costs   = ["\u20ac", "\u20ac\u20ac", "\u20ac\u20ac\u20ac", "\u20ac\u20ac", "\u20ac\u2013\u20ac\u20ac", "\u20ac\u20ac"];
  const ratings = [4.0, 3.5, 4.5, 4.2, 3.8, 4.1];
  const photos  = [
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=1000&q=80"
  ];
  return Array.from({ length: 6 }, (_, i) => ({
    id: `place_${Date.now()}_${i}`,
    title: names[i],
    category: activity,
    areaLabel: area,
    description: `A great ${activity.toLowerCase()} spot in the ${area} area.`,
    time: times[i],
    cost: costs[i],
    rating: ratings[i],
    photoUrl: photos[i],
    website: "",
    phone: "+30 210 000 0000"
  }));
}

// ====== GOOGLE PLACES SEARCH ======
const activitySearchTerms = {
  restaurant: "restaurants",
  gaming: "bowling alleys arcades escape rooms VR",
  bars: "bars pubs cocktail bars wine bars",
  movies: "cinemas movie theaters"
};
const activityIncludedTypes = {
  restaurant: "restaurant",
  bars: "bar",
  movies: "movie_theater"
};

function findGroupOption(group, kind, optionId) {
  const fromGroup = (group?.options?.[kind] || []).find((o) => o.id === optionId);
  if (fromGroup) return fromGroup;
  const defaults = kind === "area" ? areaOptions : typeOptions;
  return defaults.find((o) => o.id === optionId) || { id: optionId, label: optionId };
}

function normalizePlaceOptions(areaInput, typeInput) {
  const areaOption = typeof areaInput === "string" ? { label: areaInput } : (areaInput || {});
  const typeOption = typeof typeInput === "string" ? { label: typeInput } : (typeInput || {});
  return { areaOption, typeOption };
}

function buildPlaceSearchQuery(areaOption, typeOption) {
  const area = areaOption.queryArea || areaOption.label || "Athens";
  const typeId = typeOption.id || "";
  const activity = activitySearchTerms[typeId] || typeOption.queryType || typeOption.label || "places";
  return `${activity} in ${area}, Greece`;
}

function googlePhotoUrl(photo, maxWidth = 1000) {
  if (!photo?.name || !googleApiKey) return "";
  return `https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=${maxWidth}&key=${googleApiKey}`;
}

function formatOpeningHours(regularOpeningHours) {
  const lines = regularOpeningHours?.weekdayDescriptions || [];
  if (!lines.length) return "Hours not listed";
  const dayIndex = (new Date().getDay() + 6) % 7;
  return lines[dayIndex] || lines[0];
}

function buildPlaceDescription(place, typeLabel, areaLabel) {
  const summary = place.editorialSummary?.text?.trim();
  const address = place.formattedAddress?.trim() || "";
  const rating = place.rating ? `${Number(place.rating).toFixed(1)} stars` : "";
  const reviewCount = place.userRatingCount ? `${place.userRatingCount} reviews` : "";
  const ratingLine = [rating, reviewCount].filter(Boolean).join(" · ");
  const parts = [];
  if (summary) parts.push(summary);
  else parts.push(`${typeLabel} in ${areaLabel}`);
  if (address) parts.push(address);
  if (ratingLine) parts.push(ratingLine);
  return parts.join(" — ");
}

function fallbackPhotoForType(typeId) {
  const photos = {
    restaurant: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80",
    gaming: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80",
    bars: "https://images.unsplash.com/photo-1572116469694-31b0c2990c49?auto=format&fit=crop&w=1000&q=80",
    movies: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1000&q=80"
  };
  return photos[typeId] || "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80";
}

function mapGooglePlace(place, areaLabel, typeLabel, typeId) {
  const photo = place.photos?.[0];
  const photoUrl = googlePhotoUrl(photo) || fallbackPhotoForType(typeId);
  return {
    id: `google_${place.id}`,
    googlePlaceId: place.id,
    title: place.displayName?.text || "Unnamed place",
    category: typeLabel,
    areaLabel,
    description: buildPlaceDescription(place, typeLabel, areaLabel),
    time: formatOpeningHours(place.regularOpeningHours),
    cost: priceLabel(place.priceLevel),
    rating: place.rating || null,
    userRatingCount: place.userRatingCount || 0,
    photoUrl,
    mapsUrl: place.googleMapsUri || "",
    website: place.websiteUri || "",
    phone: place.internationalPhoneNumber || place.nationalPhoneNumber || "",
    address: place.formattedAddress || "",
    primaryType: place.primaryType || place.types?.[0] || ""
  };
}

async function googleTextSearch(query, areaLabel, typeLabel, typeId, maxResults = 20, excludeTitles = []) {
  if (!googleApiKey) return null;
  const exclude = new Set(excludeTitles.map((t) => String(t).toLowerCase()));
  const fieldMask = [
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.rating",
    "places.userRatingCount",
    "places.priceLevel",
    "places.photos",
    "places.types",
    "places.primaryType",
    "places.regularOpeningHours",
    "places.googleMapsUri",
    "places.editorialSummary",
    "places.websiteUri",
    "places.nationalPhoneNumber",
    "places.internationalPhoneNumber"
  ].join(",");

  async function runSearch(useIncludedType) {
    const body = { textQuery: query, maxResultCount: 20, languageCode: "en" };
    const includedType = activityIncludedTypes[typeId];
    if (useIncludedType && includedType) body.includedType = includedType;
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": googleApiKey,
        "X-Goog-FieldMask": fieldMask
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.warn("Google Places search failed:", response.status, errText.slice(0, 200));
      return null;
    }
    const data = await response.json();
    return data.places || [];
  }

  try {
    let places = await runSearch(true);
    if (!places?.length && activityIncludedTypes[typeId]) {
      places = await runSearch(false);
    }
    if (!places?.length) return null;
    return places
      .filter((place) => !exclude.has((place.displayName?.text || "").toLowerCase()))
      .slice(0, maxResults)
      .map((place) => mapGooglePlace(place, areaLabel, typeLabel, typeId));
  } catch (e) {
    console.warn("Google Places search error:", e.message);
    return null;
  }
}

async function refinePlacesWithOpenAI(googlePlaces, area, activity, maxCount = 5, ageGroups = []) {
  if (!openAiApiKey || !googlePlaces.length) return googlePlaces.slice(0, maxCount);
  try {
    const ageContext = ageGroups.length ? `Age groups in the group: ${ageGroups.join(", ")}.` : "Age groups are unknown.";
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${openAiApiKey}` },
      body: JSON.stringify({
        model: openAiModel,
        messages: [
          { role: "system", content: "You select places from a provided list only. Return ONLY a JSON array of objects with \"place\" (exact title from the list) and \"reason\" keys. Do not invent places. If unsure, return an empty array." },
          { role: "user", content: `Area: ${area}. Activity: ${activity}. ${ageContext} Consider age suitability, especially minors, when ranking. Places: ${JSON.stringify(googlePlaces.map((p) => ({ title: p.title, address: p.description })))}. Pick up to ${maxCount} best matches from this list only. Return ONLY JSON.` }
        ],
        temperature: 0.4, max_tokens: 500
      })
    });
    if (!aiResponse.ok) return googlePlaces.slice(0, maxCount);
    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    const parsed = JSON.parse(content.replace(/```json/g, "").replace(/```/g, "").trim());
    if (!Array.isArray(parsed) || !parsed.length) return googlePlaces.slice(0, maxCount);
    const byTitle = new Map(googlePlaces.map((p) => [p.title.toLowerCase(), p]));
    const refined = [];
    parsed.forEach((item) => {
      const match = byTitle.get(String(item.place || "").toLowerCase());
      if (match) {
        const reason = String(item.reason || "").trim();
        refined.push({
          ...match,
          description: reason ? `${reason} — ${match.address || match.description}` : match.description
        });
      }
    });
    return refined.length ? refined.slice(0, maxCount) : googlePlaces.slice(0, maxCount);
  } catch (e) {
    console.warn("OpenAI place refinement error:", e.message);
    return googlePlaces.slice(0, maxCount);
  }
}

async function loadPlacesForGroup(areaInput, typeInput, count = 5, excludeTitles = [], options = {}) {
  const { areaOption, typeOption } = normalizePlaceOptions(areaInput, typeInput);
  const areaLabel = areaOption.label || areaOption.id || "Athens";
  const typeLabel = typeOption.label || typeOption.id || "Activity";
  const typeId = typeOption.id || "";
  const query = buildPlaceSearchQuery(areaOption, typeOption);

  if (googleApiKey) {
    const googlePlaces = await googleTextSearch(query, areaLabel, typeLabel, typeId, 20, excludeTitles);
    if (googlePlaces && googlePlaces.length > 0) {
      const refined = options.useAi === false
        ? googlePlaces.slice(0, count)
        : await refinePlacesWithOpenAI(googlePlaces, areaLabel, typeLabel, count, options.ageGroups || []);
      return { places: refined, source: options.useAi === false ? "google" : "google-ai", query, exhausted: false };
    }
    return { places: [], source: "google", query, exhausted: true };
  }
  const samples = generateSamplePlaces(areaLabel, typeLabel)
    .filter((p) => !excludeTitles.map((t) => t.toLowerCase()).includes(p.title.toLowerCase()))
    .slice(0, count);
  return { places: samples, source: "sample", query, exhausted: false };
}

function priceLabel(priceLevel) {
  const prices = {
    PRICE_LEVEL_FREE: "Free",
    PRICE_LEVEL_INEXPENSIVE: "$",
    PRICE_LEVEL_MODERATE: "$$",
    PRICE_LEVEL_EXPENSIVE: "$$$",
    PRICE_LEVEL_VERY_EXPENSIVE: "$$$$"
  };
  return prices[priceLevel] || "$$";
}

// ====== API HANDLER ======
async function handleApi(request, response) {
  const url   = new URL(request.url, `http://${request.headers.host}`);
  const parts = url.pathname.replace(/^\/|\/$/g, "").split("/");
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("X-XSS-Protection", "1; mode=block");
  if (request.method === "OPTIONS") { sendJson(response, 200, {}); return; }
  const ip = request.socket?.remoteAddress || "unknown";
  const isMutating = ["POST", "PATCH", "DELETE"].includes(request.method);
  if (isMutating && isRateLimited(ip)) {
    sendJson(response, 429, { error: "Too many requests. Please wait a minute." });
    return;
  }

  // ── Config / Options ──
  if (request.method === "GET" && parts[1] === "config") {
    sendJson(response, 200, { supabaseUrl, supabaseAnonKey }); return;
  }
  if (request.method === "GET" && parts[1] === "options") {
    sendJson(response, 200, { areas: areaOptions, types: typeOptions }); return;
  }

  // ── Subscriptions ──
  if (request.method === "GET" && parts[1] === "subscription" && parts[2] === "status") {
    const username = url.searchParams.get("username") || "";
    const profile = await getProfileByUsername(username);
    if (!profile) { sendJson(response, 200, { plan: "free" }); return; }
    const sub = profile.profile?.subscription || {};
    sendJson(response, 200, { plan: sub.plan || "free", status: sub.status || "active", expiry: sub.expiry || null });
    return;
  }

  if (request.method === "POST" && parts[1] === "subscription" && parts[2] === "create-checkout") {
    const body = await readBody(request);
    const username = body.username || "";
    const priceId = body.priceId || "pro_monthly";
    const successUrl = body.successUrl || "http://localhost:8080/subscription?success=1";
    const cancelUrl = body.cancelUrl || "http://localhost:8080/subscription?canceled=1";

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === "sk_test_placeholder") {
      // Demo mode - simulate success
      const profile = await getProfileByUsername(username);
      if (profile) {
        const updatedProfile = { ...(profile.profile || {}), subscription: { plan: "pro", status: "active", expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() } };
        await upsertProfile({ username, email: profile.email || "", profile: updatedProfile });
      }
      sendJson(response, 200, { url: successUrl, demo: true });
      return;
    }

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [{
          price: priceId,
          quantity: 1
        }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { username }
      });
      sendJson(response, 200, { url: session.url, sessionId: session.id });
    } catch (e) {
      sendJson(response, 400, { error: e.message });
    }
    return;
  }

  if (request.method === "POST" && parts[1] === "subscription" && parts[2] === "webhook") {
    let rawBody = "";
    request.on("data", (chunk) => { rawBody += chunk; });
    request.on("end", async () => {
      const sig = request.headers["stripe-signature"] || "";
      let event;
      try {
        if (process.env.STRIPE_WEBHOOK_SECRET) {
          event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
        } else {
          event = JSON.parse(rawBody);
        }
      } catch (e) {
        response.writeHead(400); response.end(`Webhook Error: ${e.message}`);
        return;
      }
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const username = session.metadata?.username;
        if (username) {
          const profile = await getProfileByUsername(username);
          if (profile) {
            const updatedProfile = { ...(profile.profile || {}), subscription: { plan: "pro", status: "active", stripeSessionId: session.id, updatedAt: new Date().toISOString() } };
            await upsertProfile({ username, email: profile.email || "", profile: updatedProfile });
          }
        }
      }
      sendJson(response, 200, { received: true });
    });
    return;
  }

  // ── Update last read timestamps (for chat unread tracking) ──
  if (request.method === "POST" && parts[1] === "groups" && parts[3] === "mark-read") {
    const groupCode = parts[2];
    const body = await readBody(request);
    const username = body.username || "";
    if (username && groupCode) {
      const profile = await getProfileByUsername(username);
      if (profile) {
        const profileData = profile.profile || {};
        const lastReadTimestamps = profileData.lastReadTimestamps || {};
        lastReadTimestamps[groupCode] = new Date().toISOString();
        await upsertProfile({ username, email: profile.email || "", profile: { ...profileData, lastReadTimestamps } });
      }
    }
    sendJson(response, 200, { success: true });
    return;
  }

  // ── Account ──
  if (request.method === "GET" && parts[1] === "account") {
    const username = url.searchParams.get("username") || "";
    const viewer   = url.searchParams.get("viewer")   || "";
    const data = await getProfileByUsername(username);
    if (!data) { sendJson(response, 404, { error: "User not found" }); return; }
    let friendStatus = "";
    if (viewer && viewer !== username) {
      const viewerProfile = await getProfileByUsername(viewer);
      const viewerFriends   = viewerProfile?.profile?.friends || [];
      const targetRequests  = data.profile?.friendRequests || [];
      const viewerIncoming  = viewerProfile?.profile?.friendRequests || [];
      if (viewerFriends.includes(username)) {
        friendStatus = "friends";
      } else if (targetRequests.includes(viewer)) {
        friendStatus = "requested";
      } else if (viewerIncoming.includes(username)) {
        friendStatus = "incoming";
      }
    }
    sendJson(response, 200, { user: { ...data, friendStatus } });
    return;
  }

  if (request.method === "PATCH" && parts[1] === "account") {
    const body = await readBody(request);
    const existing = await getProfileByUsername(body.username);
    if (!existing) { sendJson(response, 404, { error: "User not found" }); return; }
    const profile = { ...(existing.profile || {}), ...(body.profile || {}) };
    await upsertProfile({ username: body.username, email: existing.email || "", profile });
    const updated = await getProfileByUsername(body.username);
    sendJson(response, 200, { user: updated });
    return;
  }

  // ── Auth ──
  if (request.method === "POST" && parts[1] === "login") {
    const body = await readBody(request);
    if (!isValidUsername(body.username)) { sendJson(response, 400, { error: "Invalid username format" }); return; }
    const data = await getProfileByUsername(body.username);
    if (!data) { sendJson(response, 404, { error: "User not found" }); return; }
    const result = await verifyPassword(body.password, data.profile?.password);
    if (!result.match) { sendJson(response, 401, { error: "Wrong password" }); return; }
    if (result.newHash) {
      const profile = { ...(data.profile || {}), password: result.newHash };
      await upsertProfile({ username: body.username, email: data.email || "", profile });
    }
    sendJson(response, 200, { username: data.username, email: data.email, profile: data.profile });
    return;
  }

  if (request.method === "POST" && parts[1] === "register") {
    const body = await readBody(request);
    if (!isValidUsername(body.username)) { sendJson(response, 400, { error: "Username must be 2-30 characters and contain only letters, numbers, underscores, hyphens, or dots." }); return; }
    if (!isValidPassword(body.password)) { sendJson(response, 400, { error: "Password must be at least 8 characters and include uppercase, lowercase, and a number." }); return; }
    const existing = await getProfileByUsername(body.username);
    if (existing) { sendJson(response, 409, { error: "Username taken" }); return; }
    const hashed = await hashPassword(body.password);
    const profile = {
      password: hashed, settings: {}, friends: [], friendRequests: [],
      pastActivities: [], preferences: { areas: [], activities: [], places: [] },
      subscription: { plan: "free", status: "active" }
    };
    await upsertProfile({ username: body.username, email: body.email, profile });
    sendJson(response, 200, { username: body.username, email: body.email, profile });
    return;
  }

  if (request.method === "POST" && parts[1] === "auth" && parts[2] === "profile") {
    const body = await readBody(request);
    const existing = await getProfileByUsername(body.username);
    if (existing) {
      const profile = { ...(existing.profile || {}) };
      if (body.password && isValidPassword(body.password)) {
        profile.password = await hashPassword(body.password);
      }
      await upsertProfile({ username: body.username, email: body.email || existing.email, profile });
    } else {
      const profile = {
        settings: {}, friends: [], friendRequests: [], pastActivities: [],
        preferences: { areas: [], activities: [], places: [] },
        subscription: { plan: "free", status: "active" }
      };
      if (body.password && isValidPassword(body.password)) {
        profile.password = await hashPassword(body.password);
      }
      await upsertProfile({ username: body.username, email: body.email, profile });
    }
    const data = await getProfileByUsername(body.username);
    sendJson(response, 200, { user: data });
    return;
  }

  if (request.method === "POST" && parts[1] === "change-password") {
    const body = await readBody(request);
    if (!body.username || !body.oldPassword || !body.newPassword) {
      sendJson(response, 400, { error: "Username, old password, and new password are required." }); return;
    }
    if (!isValidPassword(body.newPassword)) { sendJson(response, 400, { error: "New password must be at least 8 characters and include uppercase, lowercase, and a number." }); return; }
    const existing = await getProfileByUsername(body.username);
    if (!existing) { sendJson(response, 404, { error: "User not found" }); return; }
    if (body.username !== existing.username) {
      sendJson(response, 403, { error: "Forbidden" }); return;
    }

    const tokenUser = await verifyToken(request);
    const hasProfilePassword = Boolean(existing.profile?.password);
    let oldPasswordValid = false;

    if (hasProfilePassword) {
      const result = await verifyPassword(body.oldPassword, existing.profile.password);
      oldPasswordValid = result.match;
    } else if (tokenUser && existing.email && supabaseAnonKey) {
      try {
        const verifyClient = createClient(supabaseUrl, supabaseAnonKey);
        const { error } = await verifyClient.auth.signInWithPassword({
          email: existing.email,
          password: body.oldPassword
        });
        oldPasswordValid = !error;
      } catch (e) {
        console.warn("Supabase old password verification failed:", e.message);
      }
    }

    if (!oldPasswordValid) {
      sendJson(response, 401, { error: "Wrong password" }); return;
    }

    const hashed = await hashPassword(body.newPassword);
    const profile = { ...(existing.profile || {}), password: hashed };
    await upsertProfile({ username: body.username, email: existing.email || "", profile });

    if (existing.email) {
      try {
        const authUserId = tokenUser?.id;
        if (authUserId) {
          await supabase.auth.admin.updateUserById(authUserId, { password: body.newPassword });
        } else {
          const { data: authUsers } = await supabase.auth.admin.listUsers();
          const authUser = authUsers?.users?.find((u) => u.email === existing.email);
          if (authUser) {
            await supabase.auth.admin.updateUserById(authUser.id, { password: body.newPassword });
          }
        }
      } catch (e) { console.warn("Could not update Supabase auth password:", e.message); }
    }

    sendJson(response, 200, { success: true });
    return;
  }

  if (request.method === "POST" && parts[1] === "account" && parts[2] === "delete") {
    const body = await readBody(request);
    const username = body.username;
    if (!username) { sendJson(response, 400, { error: "Username required" }); return; }
    const allProfiles = await getAllProfiles();
    for (const profile of allProfiles) {
      if (profile.username === username) continue;
      const changed = (profile.profile?.friendRequests || []).includes(username) || (profile.profile?.friends || []).includes(username);
      if (changed) {
        profile.profile.friendRequests = (profile.profile.friendRequests || []).filter((f) => f !== username);
        profile.profile.friends = (profile.profile.friends || []).filter((f) => f !== username);
        await upsertProfile(profile);
      }
    }
    const allGroups = await getAllGroups();
    for (const groupRow of allGroups) {
      const group = groupRow.data;
      if (!group) continue;
      if (removeUserFromGroup(group, username)) await saveGroup(group);
    }
    const profileRow = await getProfileByUsername(username);
    const userEmail  = profileRow?.email || "";
    await supabase.from("profiles").delete().eq("username", username);
    if (userEmail) {
      try {
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        const authUser = authUsers?.users?.find((u) => u.email === userEmail);
        if (authUser) await supabase.auth.admin.deleteUser(authUser.id);
      } catch (e) { console.warn("Could not delete auth user:", e.message); }
    }
    sendJson(response, 200, { success: true });
    return;
  }

  // ── Groups ──
  if (request.method === "POST" && parts[1] === "groups" && parts[2] === "exit") {
    const body = await readBody(request);
    const group = await loadGroup(body.groupCode);
    if (!group) { sendJson(response, 200, { success: true }); return; }
    const pastGroup = { code: group.code, name: group.name, memberCount: group.members?.length || 0, exitedAt: Date.now() };
    if (removeUserFromGroup(group, body.username)) await saveGroup(group);

    const profileRow = await getProfileByUsername(body.username);
    if (profileRow) {
      const pastGroups = profileRow.profile?.pastGroups || [];
      if (!pastGroups.some((g) => g.code === pastGroup.code)) {
        pastGroups.unshift(pastGroup);
        await upsertProfile({
          username: body.username,
          email: profileRow.email || "",
          profile: { ...profileRow.profile, pastGroups: pastGroups.slice(0, 50) }
        });
      }
    }
    sendJson(response, 200, { success: true, pastGroup });
    return;
  }

  if (request.method === "POST" && parts[1] === "groups" && !parts[2]) {
    const body    = await readBody(request);
    requireAgeGroup(body.profile || {});
    const code    = await generateUniqueGroupCode();
    const userId  = crypto.randomUUID();
    const profile = body.profile || {};
    const user    = { id: userId, name: body.username, username: body.username, profile };
    const group   = {
      name: body.groupName || `${body.username}'s Group`, code,
      members: [user], choices: { area: {}, type: {} }, consensus: {},
      options: { area: areaOptions, type: typeOptions },
      places: [], matches: [], votes: {}, placeSelections: {}, search: null, createdAt: Date.now()
    };
    await saveGroup(group);
    sendJson(response, 200, { user, group: summarizeGroup(group) });
    return;
  }

  if (request.method === "POST" && parts[1] === "groups" && parts[3] === "join") {
    const groupCode = parts[2];
    const body      = await readBody(request);
    const group     = await loadGroup(groupCode);
    if (!group) { sendJson(response, 404, { error: "Group not found" }); return; }
    const existing = group.members.find((m) => m.username === body.username);
    if (existing) { sendJson(response, 200, { group: summarizeGroup(group), user: existing }); return; }
    requireAgeGroup(body.profile || {});
    const userId  = crypto.randomUUID();
    const profile = body.profile || {};
    const user    = { id: userId, name: body.username, username: body.username, profile };
    group.members.push(user);
    await saveGroup(group);
    sendJson(response, 200, { user, group: summarizeGroup(group) });
    return;
  }

  if (request.method === "GET" && parts[1] === "groups" && parts[2] === "mine") {
    const username  = url.searchParams.get("username") || "";
    const allGroups = await getAllGroups();
    const profile   = await getProfileByUsername(username);
    const userGroups = allGroups
      .filter((g) => g.data?.members?.some((m) => m.username === username))
      .map((g) => ({ name: g.data.name, code: g.data.code, memberCount: g.data.members?.length || 0 }));
    const pastGroups = profile?.profile?.pastGroups || [];

    // Add unread message counts for each active group
    const unreadCounts = await getGroupUnreadCounts(username);
    const userGroupsWithUnread = userGroups.map((g) => ({
      ...g,
      unreadCount: unreadCounts[g.code] || 0
    }));

    sendJson(response, 200, { groups: userGroupsWithUnread, pastGroups });
    return;
  }

  if (request.method === "GET" && parts[1] === "groups" && parts[2] && !parts[3]) {
    const group = await loadGroup(parts[2]);
    if (!group) { sendJson(response, 404, { error: "Group not found" }); return; }
    sendJson(response, 200, { group: summarizeGroup(group) });
    return;
  }

  if (request.method === "POST" && parts[1] === "groups" && parts[3] === "choice") {
    const group = await loadGroup(parts[2]);
    if (!group) { sendJson(response, 404, { error: "Group not found" }); return; }
    const body = await readBody(request);
    const kind = body.kind === "type" ? "type" : "area";
    if (body.customLabel) {
      if (!group.options[kind]) group.options[kind] = [];
      const cleanLabel = String(body.customLabel).trim();
      if (!cleanLabel) { sendJson(response, 400, { error: "Custom option required" }); return; }
      let customOption = group.options[kind].find((option) => String(option.label || "").toLowerCase() === cleanLabel.toLowerCase());
      if (!customOption) {
        customOption = { id: `custom_${crypto.createHash("sha1").update(`${kind}:${cleanLabel.toLowerCase()}`).digest("hex").slice(0, 12)}`, label: cleanLabel, description: "" };
        if (kind === "area") customOption.queryArea = `${cleanLabel}, Athens`;
        else customOption.queryType = cleanLabel;
        group.options[kind].push(customOption);
      }
      if (!group.choices[kind]) group.choices[kind] = {};
      group.choices[kind][body.userId] = customOption.id;
    } else {
      if (!group.choices[kind]) group.choices[kind] = {};
      group.choices[kind][body.userId] = body.optionId;
    }
    const tally = {};
    Object.values(group.choices[kind] || {}).forEach((id) => { tally[id] = (tally[id] || 0) + 1; });
    const totalMembers = group.members.length;
    const topCount     = Math.max(...Object.values(tally), 0);
    const topIds       = Object.keys(tally).filter((id) => tally[id] === topCount);
    const unanimous = Object.keys(tally).length === 1 && topCount === totalMembers;
    if (unanimous) {
      const selectedId = topIds[0];
      if (!group.consensus) group.consensus = {};
      group.consensus[kind] = selectedId;
      if (kind === "area") group.consensus.type = null;
      if (kind === "type" && group.consensus.area) {
        const areaOption = findGroupOption(group, "area", group.consensus.area);
        const typeOption = findGroupOption(group, "type", selectedId);
        const loaded = await loadPlacesForGroup(areaOption, typeOption, 5, [], { useAi: body.useAiSuggestions !== false, ageGroups: groupAgeGroups(group) });
        group.search = { source: loaded.source, query: loaded.query, area: areaOption.label, activity: typeOption.label };
        group.places = loaded.places;
        group.placesExhausted = Boolean(loaded.exhausted);
        group.placeSelections = {};
      }
    } else {
      if (group.consensus?.[kind]) group.consensus[kind] = null;
    }
    await saveGroup(group);
    sendJson(response, 200, { group: summarizeGroup(group) });
    return;
  }

  if (request.method === "POST" && parts[1] === "groups" && parts[3] === "back") {
    const group = await loadGroup(parts[2]);
    if (!group) { sendJson(response, 404, { error: "Group not found" }); return; }
    const body   = await readBody(request);
    const userId = body.userId;
    const step   = body.step === "type" ? "type" : "area";
    if (step === "type") {
      delete group.choices.type[userId];
      group.consensus.type = null;
    } else {
      delete group.choices.area[userId];
      delete group.choices.type[userId];
      if (group.votes) delete group.votes[userId];
      group.consensus.area = null; group.consensus.type = null;
      group.search = null; group.places = []; group.placesExhausted = false;
    }
    await saveGroup(group);
    sendJson(response, 200, { group: summarizeGroup(group) });
    return;
  }

  if (request.method === "POST" && parts[1] === "groups" && parts[3] === "more-places") {
    const group = await loadGroup(parts[2]);
    if (!group) { sendJson(response, 404, { error: "Group not found" }); return; }
    const body = await readBody(request);
    const areaId = group.consensus?.area;
    const typeId = group.consensus?.type;
    if (!areaId || !typeId) { sendJson(response, 400, { error: "Area and activity must be agreed first." }); return; }
    const areaOption = findGroupOption(group, "area", areaId);
    const typeOption = findGroupOption(group, "type", typeId);
    const excludeTitles = (group.places || []).map((p) => p.title);
    const loaded = await loadPlacesForGroup(areaOption, typeOption, 5, excludeTitles, { useAi: body.useAiSuggestions !== false, ageGroups: groupAgeGroups(group) });
    if (!loaded.places.length) {
      group.placesExhausted = true;
      await saveGroup(group);
      sendJson(response, 200, { group: summarizeGroup(group), places: [], exhausted: true });
      return;
    }
    group.places = [...(group.places || []), ...loaded.places];
    group.placesExhausted = false;
    group.search = { source: loaded.source, query: loaded.query, area: areaOption.label, activity: typeOption.label };
    await saveGroup(group);
    sendJson(response, 200, { group: summarizeGroup(group), places: loaded.places, exhausted: false });
    return;
  }

  if (request.method === "POST" && parts[1] === "groups" && parts[3] === "custom-place") {
    const group = await loadGroup(parts[2]);
    if (!group) { sendJson(response, 404, { error: "Group not found" }); return; }
    const body = await readBody(request);
    const title = String(body.title || "").trim().slice(0, 80);
    if (!title) { sendJson(response, 400, { error: "Place name required" }); return; }
    const areaOption = findGroupOption(group, "area", group.consensus?.area);
    const typeOption = findGroupOption(group, "type", group.consensus?.type);
    const place = {
      id: `custom_place_${Date.now()}`,
      title,
      category: body.category || typeOption.label || "Activity",
      areaLabel: body.area || areaOption.label || "Athens",
      description: String(body.description || "Added by the group.").slice(0, 240),
      time: "Hours not listed",
      cost: "$$",
      rating: null,
      photoUrl: fallbackPhotoForType(typeOption.id || ""),
      website: String(body.website || "").trim(),
      phone: String(body.phone || "").trim()
    };
    group.places = [...(group.places || []), place];
    await saveGroup(group);
    sendJson(response, 200, { group: summarizeGroup(group), place });
    return;
  }

  if (request.method === "POST" && parts[1] === "groups" && parts[3] === "select-place") {
    const group = await loadGroup(parts[2]);
    if (!group) { sendJson(response, 404, { error: "Group not found" }); return; }
    const body = await readBody(request);
    if (!group.places.some((p) => p.id === body.placeId)) { sendJson(response, 400, { error: "Invalid place" }); return; }
    if (!group.placeSelections) group.placeSelections = {};
    group.placeSelections[body.userId] = body.placeId;
    const selections = Object.values(group.placeSelections);
    const unanimous = selections.length === (group.members?.length || 0) && selections.every((id) => id === body.placeId);
    if (!group.consensus) group.consensus = {};
    group.consensus.place = unanimous ? body.placeId : null;
    // If unanimous, save the place to each member's past activities
    if (unanimous) {
      const place = group.places.find((p) => p.id === body.placeId);
      if (place) {
        for (const member of group.members || []) {
          const profileRow = await getProfileByUsername(member.username);
          if (profileRow) {
            const pastActivities = profileRow.profile?.pastActivities || [];
            const exists = pastActivities.some((a) => a.place === place.title && a.groupCode === group.code);
            if (!exists) {
              pastActivities.unshift({
                area: place.areaLabel || group.search?.area || "",
                activity: place.category || group.search?.activity || "",
                place: place.title,
                groupCode: group.code,
                groupName: group.name,
                loggedAt: Date.now()
              });
              await upsertProfile({
                username: member.username,
                email: profileRow.email || "",
                profile: { ...profileRow.profile, pastActivities: pastActivities.slice(0, 50) }
              });
            }
          }
        }
      }
    }
    await saveGroup(group);
    sendJson(response, 200, { group: summarizeGroup(group) });
    return;
  }

  if (request.method === "POST" && parts[1] === "groups" && parts[3] === "vote") {
    const group = await loadGroup(parts[2]);
    if (!group) { sendJson(response, 404, { error: "Group not found" }); return; }
    const body = await readBody(request);
    if (!group.places.some((p) => p.id === body.placeId)) { sendJson(response, 400, { error: "Invalid place" }); return; }
    const value = ["yes", "maybe", "no"].includes(body.vote) ? body.vote : (body.liked ? "yes" : "no");
    if (!group.votes[body.userId]) group.votes[body.userId] = {};
    group.votes[body.userId][body.placeId] = value;
    await saveGroup(group);
    sendJson(response, 200, { group: summarizeGroup(group) });
    return;
  }

  if (request.method === "POST" && parts[1] === "groups" && parts[3] === "invite") {
    const group = await loadGroup(parts[2]);
    if (!group) { sendJson(response, 404, { error: "Group not found" }); return; }
    const body = await readBody(request);
    const fromUsername = String(body.fromUsername || "").trim();
    const usernames = Array.isArray(body.usernames) ? body.usernames.map((u) => String(u).trim()).filter(Boolean) : [];
    if (!fromUsername || !usernames.length) { sendJson(response, 400, { error: "fromUsername and usernames required" }); return; }
    const memberNames = new Set((group.members || []).map((m) => m.username));
    let sent = 0;
    for (const username of usernames) {
      if (memberNames.has(username) || username === fromUsername) continue;
      const profileRow = await getProfileByUsername(username);
      if (!profileRow) continue;
      const invites = profileRow.profile?.groupInvites || [];
      if (invites.some((inv) => inv.groupCode === group.code)) continue;
      invites.unshift({ groupCode: group.code, groupName: group.name, fromUsername, invitedAt: Date.now() });
      await upsertProfile({
        username,
        email: profileRow.email || "",
        profile: { ...profileRow.profile, groupInvites: invites.slice(0, 50) }
      });
      sent++;
    }
    sendJson(response, 200, { success: true, sent });
    return;
  }

  // ── Group Chat ──
  if (request.method === "GET" && parts[1] === "groups" && parts[3] === "messages") {
    const groupCode = parts[2];
    const since     = url.searchParams.get("since") || null;
    let query = supabase.from("group_messages").select("id, username, message, created_at").eq("group_code", groupCode).order("created_at", { ascending: true }).limit(100);
    if (since) query = query.gt("created_at", since);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    sendJson(response, 200, { messages: data || [] });
    return;
  }

  if (request.method === "POST" && parts[1] === "groups" && parts[3] === "messages") {
    const groupCode = parts[2];
    const body      = await readBody(request);
    const message   = (body.message || "").trim().slice(0, 500);
    const username  = (body.username || "").trim();
    if (!message || !username) { sendJson(response, 400, { error: "username and message required" }); return; }
    const group = await loadGroup(groupCode);
    if (!group) { sendJson(response, 404, { error: "Group not found" }); return; }
    if (!group.members.some((m) => m.username === username)) { sendJson(response, 403, { error: "Not a member of this group" }); return; }
    const { data, error } = await supabase.from("group_messages").insert({ group_code: groupCode, username, message }).select().single();
    if (error) throw new Error(error.message);
    sendJson(response, 200, { message: data });
    return;
  }

  // ── Friends ──
  if (request.method === "GET" && parts[1] === "friends") {
    const username = url.searchParams.get("username") || "";
    const profile  = await getProfileByUsername(username);
    if (!profile) { sendJson(response, 200, { friends: [], incoming: [], outgoing: [] }); return; }
    const friendsList     = profile.profile?.friends        || [];
    const incomingUsernames = profile.profile?.friendRequests || [];
    const friends  = (await Promise.all(friendsList.map(getProfileByUsername))).filter(Boolean);
    const incoming = (await Promise.all(incomingUsernames.filter((u) => !friendsList.includes(u)).map(getProfileByUsername))).filter(Boolean);
    const allProfiles = await getAllProfiles();
    const outgoing = allProfiles.filter((p) =>
      p.username !== username && !friendsList.includes(p.username) && (p.profile?.friendRequests || []).includes(username)
    );
    sendJson(response, 200, { friends, incoming, outgoing });
    return;
  }

  if (request.method === "POST" && parts[1] === "friends" && parts[2] === "request") {
    const body      = await readBody(request);
    const toProfile = await getProfileByUsername(body.toUsername);
    if (!toProfile) { sendJson(response, 404, { error: "Recipient not found" }); return; }
    const toRequests = toProfile.profile?.friendRequests || [];
    if (!toRequests.includes(body.fromUsername)) {
      toRequests.push(body.fromUsername);
      await upsertProfile({ ...toProfile, profile: { ...toProfile.profile, friendRequests: toRequests } });
    }
    sendJson(response, 200, { success: true });
    return;
  }

  if (request.method === "POST" && parts[1] === "friends" && parts[2] === "accept") {
    const body            = await readBody(request);
    const profile         = await getProfileByUsername(body.username);
    const requesterProfile = await getProfileByUsername(body.requester);
    if (!profile || !requesterProfile) { sendJson(response, 404, { error: "User not found" }); return; }
    const friends  = [...new Set([...(profile.profile?.friends || []), body.requester])];
    const requests = (profile.profile?.friendRequests || []).filter((r) => r !== body.requester);
    await upsertProfile({ ...profile, profile: { ...profile.profile, friends, friendRequests: requests } });
    const rFriends = [...new Set([...(requesterProfile.profile?.friends || []), body.username])];
    await upsertProfile({ ...requesterProfile, profile: { ...requesterProfile.profile, friends: rFriends } });
    sendJson(response, 200, { success: true });
    return;
  }

  if (request.method === "POST" && parts[1] === "friends" && parts[2] === "remove") {
    const body          = await readBody(request);
    const profile       = await getProfileByUsername(body.username);
    const friendProfile = await getProfileByUsername(body.friendUsername);
    if (profile) {
      const friends = (profile.profile?.friends || []).filter((f) => f !== body.friendUsername);
      await upsertProfile({ ...profile, profile: { ...profile.profile, friends } });
    }
    if (friendProfile) {
      const friends = (friendProfile.profile?.friends || []).filter((f) => f !== body.username);
      await upsertProfile({ ...friendProfile, profile: { ...friendProfile.profile, friends } });
    }
    sendJson(response, 200, { success: true });
    return;
  }

  // ── Users search ──
  if (request.method === "GET" && parts[1] === "users" && parts[2] === "search") {
    const q        = (url.searchParams.get("q")        || "").toLowerCase();
    const username = url.searchParams.get("username") || "";
    const { data, error } = await supabase.from("profiles").select("*").ilike("username", `%${q}%`).limit(20);
    if (error) throw new Error(error.message);
    const viewerProfile = await getProfileByUsername(username);
    const viewerFriends  = viewerProfile?.profile?.friends        || [];
    const viewerOutgoing = viewerProfile?.profile?.friendRequests || [];
    const results = (data || []).filter((p) => p.username !== username).map((p) => {
      let friendStatus = "";
      if (viewerFriends.includes(p.username)) {
        friendStatus = "friends";
      } else if ((p.profile?.friendRequests || []).includes(username)) {
        friendStatus = "requested";
      } else if (viewerOutgoing.includes(p.username)) {
        friendStatus = "incoming";
      }
      return { ...p, friendStatus };
    });
    sendJson(response, 200, { users: results });
    return;
  }

  // ── Liked places ──
  if (request.method === "GET" && parts[1] === "liked-places") {
    const username  = url.searchParams.get("username") || "";
    const allGroups = await getAllGroups();
    const places    = [];
    for (const groupRow of allGroups) {
      const group = groupRow.data;
      if (!group?.members?.some((m) => m.username === username)) continue;
      if (!group.votes) continue;
      const member = group.members.find((m) => m.username === username);
      const uVotes = group.votes[member?.id] || group.votes[username] || {};
      for (const [placeId, vote] of Object.entries(uVotes)) {
        if (vote === "yes" || vote === true) {
          const place = group.places?.find((p) => p.id === placeId);
          if (place) places.push({ place: place.title, area: place.areaLabel, activity: place.category, vote, groupName: group.name });
        }
      }
    }
    sendJson(response, 200, { places });
    return;
  }

  // ── Suggestions (Google Maps first, then optional OpenAI refinement) ──
  if (request.method === "POST" && parts[1] === "suggestions") {
    const body = await readBody(request);
    const area = body.area || "";
    const activity = body.activity || "";
    if (!area || !activity) { sendJson(response, 200, { suggestions: [], places: [] }); return; }

    const loaded = await loadPlacesForGroup(area, activity, 5, body.excludeTitles || []);
    sendJson(response, 200, {
      suggestions: loaded.places.map((p) => ({ place: p.title, reason: p.description })),
      places: loaded.places,
      source: loaded.source
    });
    return;
  }

  // ── Notifications ──
  if (request.method === "GET" && parts[1] === "notifications") {
    const username = url.searchParams.get("username") || "";
    const profile  = await getProfileByUsername(username);
    if (!profile) { sendJson(response, 200, { total: 0, friendRequests: 0, groupInvites: 0, messages: 0 }); return; }
    const friendRequests = profile.profile?.friendRequests?.length || 0;
    const groupInvites = profile.profile?.groupInvites?.length || 0;
    const unreadMessages = await getUnreadMessageCount(username);
    sendJson(response, 200, { total: friendRequests + groupInvites + unreadMessages, friendRequests, groupInvites, messages: unreadMessages });
    return;
  }

  sendJson(response, 404, { error: "Not found" });
}

// ====== SERVER ======
const server = http.createServer(async (request, response) => {
  try {
    if (request.url.startsWith("/api/")) { await handleApi(request, response); return; }
    serveStatic(request, response);
  } catch (error) {
    console.error(error);
    if (!response.headersSent) {
      const details = publicError(error);
      sendJson(response, details.status, { error: details.message });
    }
  }
});

server.listen(port, host, () => {
  console.log(`PlanSwipe running at http://127.0.0.1:${port}`);
  console.log("Mode: Supabase + bcrypt");
});

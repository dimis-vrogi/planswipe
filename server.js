const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcrypt");
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
  { id: "north_suburbs", label: "North suburbs", description: "Filothei, Chalandri, Psixiko, Kifisia, Kefalari", queryArea: "north suburbs of Athens" },
  { id: "athens_center", label: "Center of Athens", description: "Syntagma, Monastiraki, Psyrri, Exarcheia, Kolonaki", queryArea: "center of Athens" },
  { id: "south_suburbs", label: "South suburbs", description: "Glyfada, Vouliagmeni, Alimos, Flisvos, Voula", queryArea: "south suburbs of Athens" }
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
  return typeof password === "string" && password.length >= 6 && password.length <= 128;
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
    matches:   group.matches  || [],
    votes:     group.votes    || {},
    search:    group.search   || null,
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
  if (group.members.length === 0) {
    group.consensus = {};
    group.search = null;
    group.places = [];
    group.matches = [];
  }
  return group.members.length !== before;
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
    photoUrl: photos[i]
  }));
}

// ====== GOOGLE PLACES SEARCH ======
async function googleTextSearch(query, areaLabel, typeLabel) {
  if (!googleApiKey) return null;
  try {
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": googleApiKey,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.priceLevel,places.photos,places.types"
      },
      body: JSON.stringify({ textQuery: query, maxResultCount: 5, languageCode: "en" })
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.places || !data.places.length) return null;
    return data.places.map((place) => ({
      id: `google_${place.id}`,
      title: place.displayName?.text || "Unnamed place",
      category: typeLabel,
      areaLabel: areaLabel,
      description: place.formattedAddress || query,
      time: "Check hours",
      cost: priceLabel(place.priceLevel),
      rating: place.rating || 4,
      photoUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80"
    }));
  } catch (e) {
    console.warn("Google Places search error:", e.message);
    return null;
  }
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
    if (!isValidPassword(body.password)) { sendJson(response, 400, { error: "Password must be between 6 and 128 characters." }); return; }
    const existing = await getProfileByUsername(body.username);
    if (existing) { sendJson(response, 409, { error: "Username taken" }); return; }
    const hashed = await hashPassword(body.password);
    const profile = {
      password: hashed, settings: {}, friends: [], friendRequests: [],
      pastActivities: [], preferences: { areas: [], activities: [], places: [] }
    };
    await upsertProfile({ username: body.username, email: body.email, profile });
    sendJson(response, 200, { username: body.username, email: body.email, profile });
    return;
  }

  if (request.method === "POST" && parts[1] === "auth" && parts[2] === "profile") {
    const body = await readBody(request);
    const existing = await getProfileByUsername(body.username);
    if (existing) {
      await upsertProfile({ username: body.username, email: body.email || existing.email, profile: existing.profile || {} });
    } else {
      const profile = { settings: {}, friends: [], friendRequests: [], pastActivities: [], preferences: { areas: [], activities: [], places: [] } };
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
    if (!isValidPassword(body.newPassword)) { sendJson(response, 400, { error: "New password must be between 6 and 128 characters." }); return; }
    const existing = await getProfileByUsername(body.username);
    if (!existing) { sendJson(response, 404, { error: "User not found" }); return; }
    const result = await verifyPassword(body.oldPassword, existing.profile?.password);
    if (!result.match) { sendJson(response, 401, { error: "Wrong password" }); return; }
    const hashed = await hashPassword(body.newPassword);
    const profile = { ...(existing.profile || {}), password: hashed };
    await upsertProfile({ username: body.username, email: existing.email || "", profile });
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
    if (removeUserFromGroup(group, body.username)) await saveGroup(group);
    sendJson(response, 200, { success: true });
    return;
  }

  if (request.method === "POST" && parts[1] === "groups" && !parts[2]) {
    const body    = await readBody(request);
    const code    = await generateUniqueGroupCode();
    const userId  = crypto.randomUUID();
    const profile = body.profile || {};
    const user    = { id: userId, name: body.username, username: body.username, profile };
    const group   = {
      name: body.groupName || `${body.username}'s Group`, code,
      members: [user], choices: { area: {}, type: {} }, consensus: {},
      options: { area: areaOptions, type: typeOptions },
      places: [], matches: [], votes: {}, search: null, createdAt: Date.now()
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
    const userGroups = allGroups
      .filter((g) => g.data?.members?.some((m) => m.username === username))
      .map((g) => ({ name: g.data.name, code: g.data.code, memberCount: g.data.members?.length || 0 }));
    sendJson(response, 200, { groups: userGroups });
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
      const id = `custom_${Date.now()}`;
      if (!group.options[kind]) group.options[kind] = [];
      group.options[kind].push({ id, label: body.customLabel, description: "" });
      if (!group.choices[kind]) group.choices[kind] = {};
      group.choices[kind][body.userId] = id;
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
        const areaLabel = (group.options.area || []).find((o) => o.id === group.consensus.area)?.label || "";
        const typeLabel = (group.options.type || []).find((o) => o.id === selectedId)?.label || "";
        group.search = { source: googleApiKey ? "google" : "sample", query: `${typeLabel} near ${areaLabel}` };
        group.places = generateSamplePlaces(areaLabel, typeLabel);
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
      group.search = null; group.places = [];
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
    if (!area || !activity) { sendJson(response, 200, { suggestions: [] }); return; }

    const query = `${activity} in ${area}`;
    let places = null;

    // Step 1: Try Google Places API first
    if (googleApiKey) {
      places = await googleTextSearch(query, area, activity);
    }

    // Step 2: If we got Google results and have OpenAI, optionally enhance/filter
    if (places && places.length > 0 && openAiApiKey) {
      try {
        const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${openAiApiKey}` },
          body: JSON.stringify({
            model: openAiModel,
            messages: [
              { role: "system", content: "You are a helpful assistant. Given a list of places, select the 5 most relevant ones for the user's area and activity. Return ONLY a JSON array of objects with \"place\" and \"reason\" keys." },
              { role: "user", content: `Area: ${area}. Activity: ${activity}. Places: ${JSON.stringify(places.map((p) => p.title))}. Select the 5 best ones with a brief reason. Return ONLY JSON.` }
            ],
            temperature: 0.7, max_tokens: 500
          })
        });
        const aiData = await aiResponse.json();
        try {
          const content = aiData.choices?.[0]?.message?.content || "";
          const parsed = JSON.parse(content.replace(/```json/g, "").replace(/```/g, "").trim());
          if (Array.isArray(parsed) && parsed.length > 0) {
            const selected = parsed.map((s) => ({
              place: s.place,
              reason: s.reason || "Recommended for you"
            }));
            sendJson(response, 200, { suggestions: selected });
            return;
          }
        } catch (e) { console.warn("AI parse error:", e.message); }
      } catch (error) { console.warn("AI request error:", error.message); }
    }

    // Return Google results as suggestions (with empty reasons), or sample data
    if (places && places.length > 0) {
      sendJson(response, 200, { suggestions: places.map((p) => ({ place: p.title, reason: `${area} | ${activity}` })) });
      return;
    }

    // Fallback: sample places
    const samples = generateSamplePlaces(area, activity).slice(0, 5);
    sendJson(response, 200, { suggestions: samples.map((p) => ({ place: p.title, reason: `${p.description}` })) });
    return;
  }

  // ── Notifications ──
  if (request.method === "GET" && parts[1] === "notifications") {
    const username = url.searchParams.get("username") || "";
    const profile  = await getProfileByUsername(username);
    if (!profile) { sendJson(response, 200, { total: 0, friendRequests: 0, groupInvites: 0, messages: 0 }); return; }
    const friendRequests = profile.profile?.friendRequests?.length || 0;
    sendJson(response, 200, { total: friendRequests, friendRequests, groupInvites: 0, messages: 0 });
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

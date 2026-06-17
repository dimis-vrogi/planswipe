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
const supabase = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;
if (!supabase) {
  console.error("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file.");
  process.exit(1);
}
// ====== RATE LIMITER ======
const rateLimitMap = new Map(); // ip -> { count, resetAt }
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
// Clean up old entries every 5 minutes
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
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(data));
}
function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => { body += chunk; });
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
// ====== JWT VERIFICATION ======
async function verifyToken(request) {
  const auth = request.headers["authorization"] || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user;
  } catch (_) {
    return null;
  }
}
// Require auth for mutating routes; returns true if the request should proceed.
// Falls back to username-based session for users who registered without Supabase Auth.
async function requireAuth(request, response, expectedUsername) {
  const supabaseUser = await verifyToken(request);
  if (supabaseUser) {
    // Token is valid — ensure it belongs to the expected user
    const email = supabaseUser.email || "";
    const profile = await getProfileByEmail(email);
    if (profile && profile.username === expectedUsername) return true;
    // Allow if username matches metadata (OAuth / email signup)
    const metaUsername = supabaseUser.user_metadata?.username || "";
    if (metaUsername === expectedUsername) return true;
  }
  // Fallback: allow if no Supabase Auth is configured (dev mode / custom auth only)
  if (!supabaseUrl || !supabaseServiceRoleKey) return true;
  // If Supabase is configured but token is missing/invalid, still allow for
  // custom-auth users (they have no JWT). In production, tighten this.
  return true;
}
// ====== PASSWORD HASHING (bcrypt) ======
async function hashPassword(password) {
  return bcrypt.hash(String(password), BCRYPT_ROUNDS);
}
async function verifyPassword(password, hash) {
  // Support legacy SHA-256 hashes during migration
  if (hash && hash.length === 64 && /^[0-9a-f]+$/.test(hash)) {
    const legacy = crypto.createHash("sha256").update(String(password)).digest("hex");
    return legacy === hash;
  }
  return bcrypt.compare(String(password), String(hash || ""));
}
// ====== STATIC FILES ======
function serveStatic(request, response) {
  let urlPath = request.url.split("?")[0];
  if (urlPath === "/" || !path.extname(urlPath)) urlPath = "/index.html";
  const filePath = path.join(publicRoot, urlPath);
  if (!filePath.startsWith(publicRoot)) {
    response.writeHead(403); response.end("Forbidden"); return;
  }
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
    { username: user.username, email: user.email || "", profile: user.profile || {} },
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
  return group.members.length !== before;
}
function generateGroupCode() {
  return String(crypto.randomInt(10000000, 99999999));
}
function generateSamplePlaces(area, activity) {
  const names = [
    `${activity} Spot`, `Best ${activity} in ${area}`, `${area} ${activity} Lounge`,
    `${activity} House`, `Prime ${activity}`, `${activity} Central`
  ];
  const times  = ["11:00–23:00", "12:00–00:00", "10:00–22:00", "09:00–02:00", "12:00–01:00", "11:00–01:00"];
  const costs   = ["€", "€€", "€€€", "€€", "€–€€", "€€"];
  const ratings = [4.0, 3.5, 4.5, 4.2, 3.8, 4.1];
  const photos  = [
    "[images.unsplash.com](https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80)",
    "[images.unsplash.com](https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1000&q=80)",
    "[images.unsplash.com](https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80)",
    "[images.unsplash.com](https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1000&q=80)",
    "[images.unsplash.com](https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1000&q=80)",
    "[images.unsplash.com](https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=1000&q=80)"
  ];
  return Array.from({ length: 6 }, (_, i) => ({
    id:          `place_${Date.now()}_${i}`,
    title:       names[i],
    category:    activity,
    areaLabel:   area,
    description: `A great ${activity.toLowerCase()} spot in the ${area} area.`,
    time:        times[i],
    cost:        costs[i],
    rating:      ratings[i],
    photoUrl:    photos[i]
  }));
}
// ====== API HANDLER ======
async function handleApi(request, response) {
  const url   = new URL(request.url, `[${request.headers.host}](http://${request.headers.host})`);
  const parts = url.pathname.replace(/^\/|\/$/g, "").split("/");
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (request.method === "OPTIONS") { sendJson(response, 200, {}); return; }
  // Rate-limit auth endpoints
  const ip = request.socket?.remoteAddress || "unknown";
  const isAuthEndpoint = parts[1] === "login" || parts[1] === "register";
  if (isAuthEndpoint && isRateLimited(ip)) {
    sendJson(response, 429, { error: "Too many requests. Please wait a minute." });
    return;
  }
  // ── Config ──────────────────────────────────────────────────────────────────
  if (request.method === "GET" && parts[1] === "config") {
    sendJson(response, 200, { supabaseUrl, supabaseAnonKey });
    return;
  }
  if (request.method === "GET" && parts[1] === "options") {
    sendJson(response, 200, { areas: areaOptions, types: typeOptions });
    return;
  }
  // ── Account ─────────────────────────────────────────────────────────────────
  if (request.method === "GET" && parts[1] === "account") {
    const username = url.searchParams.get("username") || "";
    const viewer   = url.searchParams.get("viewer")   || "";
    const data = await getProfileByUsername(username);
    if (!data) { sendJson(response, 404, { error: "User not found" }); return; }
    let friendStatus = "";
    if (viewer && viewer !== username) {
      const viewerProfile = await getProfileByUsername(viewer);
      const viewerFriends  = viewerProfile?.profile?.friends || [];
      const viewerOutgoing = data.profile?.friendRequests || []; // requests TO 'data' include viewer?
      const viewerIncoming = viewerProfile?.profile?.friendRequests || [];
      if (viewerFriends.includes(username)) {
        friendStatus = "friends";
      } else if (viewerOutgoing.includes(viewer)) {
        // viewer sent a request that is sitting in target's friendRequests
        friendStatus = "requested";
      } else if (viewerIncoming.includes(username)) {
        // target sent a request sitting in viewer's friendRequests
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
  // ── Auth ────────────────────────────────────────────────────────────────────
  if (request.method === "POST" && parts[1] === "login") {
    const body = await readBody(request);
    const data = await getProfileByUsername(body.username);
    if (!data) { sendJson(response, 404, { error: "User not found" }); return; }
    const ok = await verifyPassword(body.password, data.profile?.password);
    if (!ok) { sendJson(response, 401, { error: "Wrong password" }); return; }
    sendJson(response, 200, { username: data.username, email: data.email, profile: data.profile });
    return;
  }
  if (request.method === "POST" && parts[1] === "register") {
    const body = await readBody(request);
    const existing = await getProfileByUsername(body.username);
    if (existing) { sendJson(response, 409, { error: "Username taken" }); return; }
    const hashed = await hashPassword(body.password);
    const profile = {
      password: hashed,
      settings: {},
      friends: [],
      friendRequests: [],
      pastActivities: [],
      preferences: { areas: [], activities: [], places: [] }
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
    const existing = await getProfileByUsername(body.username);
    if (!existing) { sendJson(response, 404, { error: "User not found" }); return; }
    const ok = await verifyPassword(body.oldPassword, existing.profile?.password);
    if (!ok) { sendJson(response, 401, { error: "Wrong password" }); return; }
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
    // Remove from other users' friend lists
    const allProfiles = await getAllProfiles();
    for (const profile of allProfiles) {
      if (profile.username === username) continue;
      const changed =
        (profile.profile?.friendRequests || []).includes(username) ||
        (profile.profile?.friends        || []).includes(username);
      if (changed) {
        profile.profile.friendRequests = (profile.profile.friendRequests || []).filter((f) => f !== username);
        profile.profile.friends        = (profile.profile.friends        || []).filter((f) => f !== username);
        await upsertProfile(profile);
      }
    }
    // Remove from groups
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
  // ── Groups ───────────────────────────────────────────────────────────────────
  if (request.method === "POST" && parts[1] === "groups" && parts[2] === "exit") {
    const body = await readBody(request);
    const group = await loadGroup(body.groupCode);
    if (!group) { sendJson(response, 404, { error: "Group not found" }); return; }
    if (removeUserFromGroup(group, body.username)) await saveGroup(group);
    sendJson(response, 200, { success: true });
    return;
  }
  if (request.method === "POST" && parts[1] === "groups" && !parts[2]) {
    const body    = await readBody(request);
    const code    = generateGroupCode();
    const userId  = crypto.randomUUID();
    const profile = body.profile || {};
    const user    = { id: userId, name: body.username, username: body.username, profile };
    const group   = {
      name:      body.groupName || `${body.username}'s Group`,
      code,
      members:   [user],
      choices:   { area: {}, type: {} },
      consensus: {},
      options:   { area: areaOptions, type: typeOptions },
      places:    [],
      matches:   [],
      votes:     {},
      search:    null,
      createdAt: Date.now()
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
    if (existing) {
      sendJson(response, 200, { group: summarizeGroup(group), user: existing });
      return;
    }
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
    if (!["area", "type"].includes(kind)) { sendJson(response, 400, { error: "Invalid kind" }); return; }
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
    // Unanimous = everyone voted AND all voted the same option
    const unanimous = Object.keys(tally).length === 1 && topCount === totalMembers;
    if (unanimous) {
      const selectedId = topIds[0];
      if (!group.consensus) group.consensus = {};
      group.consensus[kind] = selectedId;
      if (kind === "area") group.consensus.type = null;
      if (kind === "type" && group.consensus.area) {
        const areaLabel = (group.options.area || []).find((o) => o.id === group.consensus.area)?.label || "";
        const typeLabel = (group.options.type || []).find((o) => o.id === selectedId)?.label || "";
        group.search = {
          source: googleApiKey ? "google" : "sample",
          query:  `${typeLabel} near ${areaLabel}`
        };
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
      group.consensus.area = null;
      group.consensus.type = null;
      group.search  = null;
      group.places  = [];
    }
    await saveGroup(group);
    sendJson(response, 200, { group: summarizeGroup(group) });
    return;
  }
  if (request.method === "POST" && parts[1] === "groups" && parts[3] === "vote") {
    const group = await loadGroup(parts[2]);
    if (!group) { sendJson(response, 404, { error: "Group not found" }); return; }
    const body = await readBody(request);
    if (!group.places.some((p) => p.id === body.placeId)) {
      sendJson(response, 400, { error: "Invalid place" }); return;
    }
    const value = ["yes", "maybe", "no"].includes(body.vote) ? body.vote : (body.liked ? "yes" : "no");
    if (!group.votes[body.userId]) group.votes[body.userId] = {};
    group.votes[body.userId][body.placeId] = value;
    await saveGroup(group);
    sendJson(response, 200, { group: summarizeGroup(group) });
    return;
  }
  // ── Group Chat ───────────────────────────────────────────────────────────────
  if (request.method === "GET" && parts[1] === "groups" && parts[3] === "messages") {
    const groupCode = parts[2];
    const since     = url.searchParams.get("since") || null;
    let query = supabase
      .from("group_messages")
      .select("id, username, message, created_at")
      .eq("group_code", groupCode)
      .order("created_at", { ascending: true })
      .limit(100);
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
    if (!group.members.some((m) => m.username === username)) {
      sendJson(response, 403, { error: "Not a member of this group" }); return;
    }
    const { data, error } = await supabase
      .from("group_messages")
      .insert({ group_code: groupCode, username, message })
      .select()
      .single();
    if (error) throw new Error(error.message);
    sendJson(response, 200, { message: data });
    return;
  }
  // ── Friends ──────────────────────────────────────────────────────────────────
  if (request.method === "GET" && parts[1] === "friends") {
    const username = url.searchParams.get("username") || "";
    const profile  = await getProfileByUsername(username);
    if (!profile) { sendJson(response, 404, { error: "User not found" }); return; }
    const friendsList     = profile.profile?.friends        || [];
    const incomingUsernames = profile.profile?.friendRequests || [];
    const friends  = (await Promise.all(friendsList.map(getProfileByUsername))).filter(Boolean);
    const incoming = (await Promise.all(incomingUsernames.filter((u) => !friendsList.includes(u)).map(getProfileByUsername))).filter(Boolean);
    // Outgoing: profiles where viewer appears in their friendRequests
    const allProfiles = await getAllProfiles();
    const outgoing    = allProfiles.filter((p) =>
      p.username !== username &&
      !friendsList.includes(p.username) &&
      (p.profile?.friendRequests || []).includes(username)
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
  // ── Users search ─────────────────────────────────────────────────────────────
  if (request.method === "GET" && parts[1] === "users" && parts[2] === "search") {
    const q       = (url.searchParams.get("q")        || "").toLowerCase();
    const username = url.searchParams.get("username") || "";
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .ilike("username", `%${q}%`)
      .limit(20);
    if (error) throw new Error(error.message);
    const viewerProfile = await getProfileByUsername(username);
    const viewerFriends  = viewerProfile?.profile?.friends        || [];
    const viewerOutgoing = viewerProfile?.profile?.friendRequests || []; // others who sent to viewer
    const results = (data || [])
      .filter((p) => p.username !== username)
      .map((p) => {
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
  // ── Liked places ─────────────────────────────────────────────────────────────
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
  // ── AI suggestions ───────────────────────────────────────────────────────────
  if (request.method === "POST" && parts[1] === "suggestions") {
    const body = await readBody(request);
    if (!openAiApiKey) { sendJson(response, 200, { suggestions: [] }); return; }
    try {
      const aiResponse = await fetch("[api.openai.com](https://api.openai.com/v1/chat/completions)", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${openAiApiKey}` },
        body:    JSON.stringify({
          model:      openAiModel,
          messages:   [
            { role: "system", content: "You are a helpful assistant that suggests places based on area and activity. Return a JSON array of objects with \"place\" and \"reason\" keys." },
            { role: "user",   content: `Suggest 5 places for ${body.activity} in ${body.area}. Return ONLY JSON.` }
          ],
          temperature: 0.7,
          max_tokens:  500
        })
      });
      const aiData = await aiResponse.json();
      let suggestions = [];
      try {
        const content = aiData.choices?.[0]?.message?.content || "[]";
        suggestions = JSON.parse(content.replace(/```json/g, "").replace(/```/g, "").trim());
      } catch (e) { console.warn("AI parse error:", e.message); }
      sendJson(response, 200, { suggestions });
    } catch (error) {
      console.warn("AI request error:", error.message);
      sendJson(response, 200, { suggestions: [] });
    }
    return;
  }
  // ── Notifications ────────────────────────────────────────────────────────────
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
    const details = publicError(error);
    sendJson(response, details.status, { error: details.message });
  }
});
server.listen(port, host, () => {
  console.log(`PlanSwipe running at http://127.0.0.1:${port}`);
  console.log("Mode: Supabase + bcrypt");
});

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || "0.0.0.0";
const publicRoot = path.resolve(__dirname, "public");
const googleApiKey = process.env.GOOGLE_MAPS_API_KEY || "";
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openAiApiKey = process.env.OPENAI_API_KEY || "";
const openAiModel = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const supabase = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!supabase) {
  console.error("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file.");
  process.exit(1);
}

const areaOptions = [
  {
    id: "athens_center",
    label: "Center of Athens",
    description: "Syntagma, Monastiraki, Psyrri, and nearby central areas.",
    queryArea: "center of Athens"
  },
  {
    id: "athens_seaside",
    label: "Athens seaside",
    description: "Flisvos, Glyfada, Alimos, and the coastal side of the city.",
    queryArea: "Athens seaside"
  },
  {
    id: "athens_north",
    label: "North Athens",
    description: "Chalandri, Marousi, Kifisia, and nearby neighborhoods.",
    queryArea: "north Athens"
  }
];

const typeOptions = [
  {
    id: "restaurant",
    label: "Restaurants",
    description: "Going out to eat, pizza, or food-related choices.",
    queryType: "restaurant"
  },
  {
    id: "game",
    label: "Games",
    description: "Bowling, escape rooms, arcades, and other fun activities.",
    queryType: "entertainment"
  },
  {
    id: "walking",
    label: "Walking",
    description: "Parks, seaside promenades, views, and easy outdoor routes.",
    queryType: "park"
  }
];

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};

const ALPHABET = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";

function randomCode(length) {
  let code = "";
  for (let i = 0; i < length; i++) code += ALPHABET[crypto.randomInt(ALPHABET.length)];
  return code;
}

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

function serveStatic(request, response) {
  let urlPath = request.url.split("?")[0];
  if (urlPath === "/" || !path.extname(urlPath)) {
    urlPath = "/index.html";
  }
  const filePath = path.join(publicRoot, urlPath);
  if (!filePath.startsWith(publicRoot)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      if (error.code === "ENOENT") {
        // SPA fallback - serve index.html for client-side routing
        const fallback = path.join(publicRoot, "index.html");
        fs.readFile(fallback, (fallbackError, fallbackData) => {
          if (fallbackError) {
            response.writeHead(404);
            response.end("Not found");
            return;
          }
          response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          response.end(fallbackData);
        });
        return;
      }
      response.writeHead(500);
      response.end("Server error");
      return;
    }
    response.writeHead(200, { "Content-Type": mimeType(filePath) || "application/octet-stream" });
    response.end(data);
  });
}

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
  const { error } = await supabase.from("groups").upsert({ code: group.code, data: JSON.parse(JSON.stringify(group)) }, { onConflict: "code" });
  if (error) throw new Error(error.message);
}

async function deleteGroup(code) {
  const { error } = await supabase.from("groups").delete().eq("code", code);
  if (error) throw new Error(error.message);
}

async function loadGroup(code) {
  const data = await getGroup(code);
  return data ? data.data : null;
}

function summarizeGroup(group) {
  if (!group) return null;
  const counts = {};
  ["area", "type"].forEach((kind) => {
    const choices = group.choices?.[kind] || {};
    const tally = {};
    Object.values(choices).forEach((id) => { tally[id] = (tally[id] || 0) + 1; });
    counts[kind] = tally;
  });
  const members = group.members || [];
  const resolvedMembers = members.map((member) => ({
    id: member.id,
    name: member.name,
    username: member.username,
    profile: member.profile || {}
  }));
  return {
    name: group.name,
    code: group.code,
    members: resolvedMembers,
    choices: group.choices || { area: {}, type: {} },
    consensus: group.consensus || {},
    counts,
    options: group.options || {},
    places: group.places || [],
    matches: group.matches || [],
    votes: group.votes || {},
    search: group.search || null,
    createdAt: group.createdAt
  };
}

async function getProfileByUsername(username) {
  const { data, error } = await supabase.from("profiles").select("*").eq("username", username).single();
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

function generateCode() {
  return String(crypto.randomInt(10000000, 99999999));
}

async function handleApi(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const parts = url.pathname.replace(/^\/|\/$/g, "").split("/");

  // CORS
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (request.method === "OPTIONS") { sendJson(response, 200, {}); return; }

  // Configuration
  if (request.method === "GET" && parts[0] === "api" && parts[1] === "config") {
    sendJson(response, 200, { supabaseUrl, supabaseAnonKey });
    return;
  }

  // Options
  if (request.method === "GET" && parts[0] === "api" && parts[1] === "options") {
    sendJson(response, 200, { areas: areaOptions, types: typeOptions });
    return;
  }

  // Get user account / profile
  if (request.method === "GET" && parts[0] === "api" && parts[1] === "account") {
    const username = url.searchParams.get("username") || "";
    const viewer = url.searchParams.get("viewer") || "";
    const data = await getProfileByUsername(username);
    if (!data) { sendJson(response, 404, { error: "User not found" }); return; }
    let friendStatus = "";
    if (viewer && viewer !== username) {
      const isFriend = data.profile?.friends?.includes(viewer);
      const outgoing = data.profile?.friendRequests?.includes(viewer);
      const incoming = data.profile?.friendRequests?.includes?.(data.username);
      friendStatus = isFriend ? "friends" : outgoing ? "requested" : "incoming" ? "incoming" : "";
    }
    // Determine incoming requests
    const viewerProfile = await getProfileByUsername(viewer);
    const viewerIncoming = (viewerProfile?.profile?.friendRequests || []).includes(username) ? "incoming" : "";
    const viewerFriends = (viewerProfile?.profile?.friends || []).includes(username);
    if (viewerFriends && viewer !== username) friendStatus = "friends";
    const viewerRequested = (data.profile?.friendRequests || []).includes(viewer);
    if (viewerRequested && !viewerFriends) friendStatus = "requested";
    if (viewerIncoming === "incoming" && !viewerFriends) friendStatus = "incoming";
    sendJson(response, 200, { user: { ...data, friendStatus } });
    return;
  }

  // Update account / profile
  if (request.method === "PATCH" && parts[0] === "api" && parts[1] === "account") {
    const body = await readBody(request);
    const existing = await getProfileByUsername(body.username);
    if (!existing) { sendJson(response, 404, { error: "User not found" }); return; }
    const profile = { ...(existing.profile || {}), ...(body.profile || {}) };
    await upsertProfile({ username: body.username, email: existing.email || "", profile });
    const updated = await getProfileByUsername(body.username);
    sendJson(response, 200, { user: updated });
    return;
  }

  // Login
  if (request.method === "POST" && parts[0] === "api" && parts[1] === "login") {
    const body = await readBody(request);
    const data = await getProfileByUsername(body.username);
    if (!data) { sendJson(response, 404, { error: "User not found" }); return; }
    if (data.profile?.password !== hashPassword(body.password)) {
      sendJson(response, 401, { error: "Wrong password" }); return;
    }
    sendJson(response, 200, { username: data.username, email: data.email, profile: data.profile });
    return;
  }

  // Register
  if (request.method === "POST" && parts[0] === "api" && parts[1] === "register") {
    const body = await readBody(request);
    const existing = await getProfileByUsername(body.username);
    if (existing) { sendJson(response, 409, { error: "Username taken" }); return; }
    const profile = { password: hashPassword(body.password), settings: {}, friends: [], friendRequests: [], pastActivities: [], preferences: { areas: [], activities: [], places: [] } };
    await upsertProfile({ username: body.username, email: body.email, profile });
    sendJson(response, 200, { username: body.username, email: body.email, profile });
    return;
  }

  // Sync Supabase auth profile
  if (request.method === "POST" && parts[0] === "api" && parts[1] === "auth" && parts[2] === "profile") {
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

  // Delete Account
  if (request.method === "POST" && parts[0] === "api" && parts[1] === "account" && parts[2] === "delete") {
    const body = await readBody(request);
    const username = body.username;
    if (!username) { sendJson(response, 400, { error: "Username required" }); return; }
    
    // Delete all friend requests involving this user
    const allProfiles = await getAllProfiles();
    for (const profile of allProfiles) {
      if (profile.profile?.friendRequests) {
        profile.profile.friendRequests = profile.profile.friendRequests.filter((fr) => fr !== username);
      }
      if (profile.profile?.friends) {
        profile.profile.friends = profile.profile.friends.filter((f) => f !== username);
      }
      if (profile.username !== username) {
        await upsertProfile(profile);
      }
    }
    
    // Remove user from all groups
    const allGroups = await getAllGroups();
    for (const groupData of allGroups) {
      const group = groupData.data;
      if (!group) continue;
      const changed = removeUserFromGroup(group, username);
      if (changed) {
        await saveGroup(group);
      }
    }
    
    // Delete the user's profile from supabase
    const { error: deleteError } = await supabase.from("profiles").delete().eq("username", username);
    if (deleteError) throw new Error(deleteError.message);
    
    // Also delete the user from Supabase Auth if we have the service role key
    try {
      // Find the user by email in auth
      const userProfile = await getProfileByUsername(username);
      if (userProfile && userProfile.email) {
        // Try to find and delete the auth user
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        if (authUsers) {
          const authUser = authUsers.users.find((u) => u.email === userProfile.email);
          if (authUser) {
            await supabase.auth.admin.deleteUser(authUser.id);
          }
        }
      }
    } catch (authError) {
      console.warn("Could not delete auth user:", authError.message);
    }
    
    sendJson(response, 200, { success: true });
    return;
  }

  // Exit Group (move to past groups)
  if (request.method === "POST" && parts[0] === "api" && parts[1] === "groups" && parts[2] === "exit") {
    const body = await readBody(request);
    const group = await loadGroup(body.groupCode);
    if (!group) { sendJson(response, 404, { error: "Group not found" }); return; }
    const changed = removeUserFromGroup(group, body.username);
    if (changed) {
      await saveGroup(group);
    }
    sendJson(response, 200, { success: true });
    return;
  }

  // Create group
  if (request.method === "POST" && parts[0] === "api" && parts[1] === "groups" && !parts[2]) {
    const body = await readBody(request);
    const code = generateCode();
    const profile = body.profile || {};
    const userId = crypto.randomUUID();
    const user = { id: userId, name: body.username, username: body.username, profile };
    const groupName = body.groupName || `${body.username}'s Group`;
    const group = {
      name: groupName,
      code,
      members: [user],
      choices: { area: {}, type: {} },
      consensus: {},
      options: { area: areaOptions, type: typeOptions },
      places: [],
      matches: [],
      votes: {},
      search: null,
      createdAt: Date.now()
    };
    await saveGroup(group);
    sendJson(response, 200, { user, group: summarizeGroup(group) });
    return;
  }

  // Join group
  if (request.method === "POST" && parts[0] === "api" && parts[1] === "groups" && parts[3] === "join") {
    const groupCode = parts[2];
    const body = await readBody(request);
    const group = await loadGroup(groupCode);
    if (!group) { sendJson(response, 404, { error: "Group not found" }); return; }
    if (group.members.some((member) => member.username === body.username)) {
      sendJson(response, 200, { group: summarizeGroup(group), user: group.members.find((member) => member.username === body.username) });
      return;
    }
    const userId = crypto.randomUUID();
    const profile = body.profile || {};
    const user = { id: userId, name: body.username, username: body.username, profile };
    group.members.push(user);
    await saveGroup(group);
    sendJson(response, 200, { user, group: summarizeGroup(group) });
    return;
  }

  // Get group details
  if (request.method === "GET" && parts[0] === "api" && parts[1] === "groups" && parts[2] && !parts[3]) {
    const group = await loadGroup(parts[2]);
    if (!group) { sendJson(response, 404, { error: "Group not found" }); return; }
    sendJson(response, 200, { group: summarizeGroup(group) });
    return;
  }

  // User groups
  if (request.method === "GET" && parts[0] === "api" && parts[1] === "groups" && parts[2] === "mine") {
    const username = url.searchParams.get("username") || "";
    const allGroups = await getAllGroups();
    const userGroups = allGroups.filter((g) => g.data?.members?.some((member) => member.username === username)).map((g) => ({
      name: g.data.name,
      code: g.data.code,
      memberCount: g.data.members?.length || 0
    }));
    sendJson(response, 200, { groups: userGroups });
    return;
  }

  // Submit choice
  if (request.method === "POST" && parts[0] === "api" && parts[1] === "groups" && parts[3] === "choice") {
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
    // Recalculate consensus for this kind
    const tally = {};
    Object.values(group.choices[kind] || {}).forEach((id) => { tally[id] = (tally[id] || 0) + 1; });
    const maxVotes = Math.max(...Object.values(tally), 1);
    const unanimous = Object.values(tally).every((count) => count === maxVotes) && Object.keys(tally).length === 1;
    if (unanimous && Object.keys(tally).length > 0) {
      const selectedId = Object.keys(tally)[0];
      if (!group.consensus) group.consensus = {};
      group.consensus[kind] = selectedId;
      if (kind === "area") {
        group.consensus.type = null;
      }
      if (kind === "type" && group.consensus.area) {
        const areaId = group.consensus.area;
        const areaLabel = (group.options.area || []).find((option) => option.id === areaId)?.label || "";
        const typeLabel = (group.options.type || []).find((option) => option.id === selectedId)?.label || "";
        const groupsLabel = areaOptions.find((option) => option.id === areaId)?.queryArea || areaLabel;
        const groupsType = typeOptions.find((option) => option.id === selectedId)?.queryType || typeLabel;
        group.search = { source: "opensource", query: `${typeLabel} near ${areaLabel}` };
        if (googleApiKey) {
          group.search.source = "google";
        } else {
          group.search.source = "sample";
        }
        // Generate sample places
        group.places = generateSamplePlaces(areaLabel, typeLabel);
      }
    } else {
      if (group.consensus?.[kind]) group.consensus[kind] = null;
    }
    await saveGroup(group);
    sendJson(response, 200, { group: summarizeGroup(group) });
    return;
  }

  // Go back choice
  if (request.method === "POST" && parts[0] === "api" && parts[1] === "groups" && parts[3] === "back") {
    const group = await loadGroup(parts[2]);
    if (!group) { sendJson(response, 404, { error: "Group not found" }); return; }
    const body = await readBody(request);
    const userId = body.userId;
    const step = body.step === "type" ? "type" : "area";
    if (step === "type") {
      delete group.choices.type[userId];
      group.consensus.type = null;
    } else {
      delete group.choices.area[userId];
      delete group.choices.type[userId];
      delete group.votes[userId];
      group.consensus.area = null;
      group.consensus.type = null;
      group.search = null;
      group.places = [];
    }
    await saveGroup(group);
    sendJson(response, 200, { group: summarizeGroup(group) });
    return;
  }

  // Vote
  if (request.method === "POST" && parts[0] === "api" && parts[1] === "groups" && parts[3] === "vote") {
    const group = await loadGroup(parts[2]);
    if (!group) { sendJson(response, 404, { error: "Group not found" }); return; }
    const body = await readBody(request);
    if (!group.places.some((place) => place.id === body.placeId)) {
      sendJson(response, 400, { error: "Invalid place" }); return;
    }
    const value = ["yes", "maybe", "no"].includes(body.vote) ? body.vote : (body.liked ? "yes" : "no");
    if (!group.votes[body.userId]) group.votes[body.userId] = {};
    group.votes[body.userId][body.placeId] = value;
    await saveGroup(group);
    sendJson(response, 200, { group: summarizeGroup(group) });
    return;
  }

  // Friends endpoints
  if (request.method === "GET" && parts[0] === "api" && parts[1] === "friends") {
    const username = url.searchParams.get("username") || "";
    const profile = await getProfileByUsername(username);
    if (!profile) { sendJson(response, 404, { error: "User not found" }); return; }
    const friendsList = profile.profile?.friends || [];
    const friends = [];
    for (const friendUsername of friendsList) {
      const friendProfile = await getProfileByUsername(friendUsername);
      if (friendProfile) friends.push(friendProfile);
    }
    const incomingRequests = (profile.profile?.friendRequests || []).filter((req) => !friendsList.includes(req));
    const incoming = [];
    for (const requester of incomingRequests) {
      const requesterProfile = await getProfileByUsername(requester);
      if (requesterProfile) incoming.push(requesterProfile);
    }
    // Outgoing requests (users I requested but haven't accepted me back)
    const allProfiles = await getAllProfiles();
    const outgoing = allProfiles.filter((p) => 
      p.username !== username && 
      !friendsList.includes(p.username) && 
      (p.profile?.friendRequests || []).includes(username)
    );
    sendJson(response, 200, { friends, incoming, outgoing });
    return;
  }

  if (request.method === "POST" && parts[0] === "api" && parts[1] === "friends" && parts[2] === "request") {
    const body = await readBody(request);
    const fromProfile = await getProfileByUsername(body.fromUsername);
    if (!fromProfile) { sendJson(response, 404, { error: "Sender not found" }); return; }
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

  if (request.method === "POST" && parts[0] === "api" && parts[1] === "friends" && parts[2] === "accept") {
    const body = await readBody(request);
    const profile = await getProfileByUsername(body.username);
    if (!profile) { sendJson(response, 404, { error: "User not found" }); return; }
    const requesterProfile = await getProfileByUsername(body.requester);
    if (!requesterProfile) { sendJson(response, 404, { error: "Requester not found" }); return; }
    const friends = profile.profile?.friends || [];
    const requests = profile.profile?.friendRequests || [];
    if (!friends.includes(body.requester)) {
      friends.push(body.requester);
    }
    const filteredRequests = requests.filter((req) => req !== body.requester);
    await upsertProfile({ ...profile, profile: { ...profile.profile, friends, friendRequests: filteredRequests } });
    const requesterFriends = requesterProfile.profile?.friends || [];
    if (!requesterFriends.includes(body.username)) {
      requesterFriends.push(body.username);
      await upsertProfile({ ...requesterProfile, profile: { ...requesterProfile.profile, friends: requesterFriends } });
    }
    sendJson(response, 200, { success: true });
    return;
  }

  if (request.method === "POST" && parts[0] === "api" && parts[1] === "friends" && parts[2] === "remove") {
    const body = await readBody(request);
    const profile = await getProfileByUsername(body.username);
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

  // User search
  if (request.method === "GET" && parts[0] === "api" && parts[1] === "users" && parts[2] === "search") {
    const q = url.searchParams.get("q") || "";
    const username = url.searchParams.get("username") || "";
    const allProfiles = await getAllProfiles();
    const viewerProfile = await getProfileByUsername(username);
    const viewerFriends = viewerProfile?.profile?.friends || [];
    const results = allProfiles.filter((p) =>
      p.username !== username &&
      p.username.toLowerCase().includes(q.toLowerCase())
    ).map((p) => {
      let friendStatus = "";
      if (viewerFriends.includes(p.username)) friendStatus = "friends";
      else if ((p.profile?.friendRequests || []).includes(username)) friendStatus = "requested";
      const viewerRequests = viewerProfile?.profile?.friendRequests || [];
      if (viewerRequests.includes(p.username)) friendStatus = "incoming";
      return { ...p, friendStatus };
    });
    sendJson(response, 200, { users: results });
    return;
  }

  // Liked places
  if (request.method === "GET" && parts[0] === "api" && parts[1] === "liked-places") {
    const username = url.searchParams.get("username") || "";
    const profile = await getProfileByUsername(username);
    if (!profile) { sendJson(response, 200, { places: [] }); return; }
    const allGroups = await getAllGroups();
    const places = [];
    for (const groupData of allGroups) {
      const group = groupData.data;
      if (!group || !group.members?.some((member) => member.username === username)) continue;
      if (!group.votes) continue;
      for (const [userId, userVotes] of Object.entries(group.votes)) {
        if (userId === username || group.members?.find((m) => m.id === userId)?.username === username) {
          for (const [placeId, vote] of Object.entries(userVotes)) {
            if (vote === "yes" || vote === true) {
              const place = group.places?.find((p) => p.id === placeId);
              if (place) {
                places.push({ place: place.title, area: place.areaLabel, activity: place.category, vote, groupName: group.name });
              }
            }
          }
        }
      }
    }
    sendJson(response, 200, { places });
    return;
  }

  // AI Suggestions
  if (request.method === "POST" && parts[0] === "api" && parts[1] === "suggestions") {
    const body = await readBody(request);
    if (!openAiApiKey) {
      sendJson(response, 200, { suggestions: [] });
      return;
    }
    try {
      const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${openAiApiKey}` },
        body: JSON.stringify({
          model: openAiModel,
          messages: [
            { role: "system", content: `You are a helpful assistant that suggests places based on area and activity. Return a JSON array of objects with "place" and "reason" keys.` },
            { role: "user", content: `Suggest 5 places for ${body.activity} in ${body.area}. Return ONLY JSON.` }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });
      const aiData = await aiResponse.json();
      let suggestions = [];
      try {
        const content = aiData.choices?.[0]?.message?.content || "[]";
        suggestions = JSON.parse(content.replace(/```json/g, "").replace(/```/g, "").trim());
      } catch (parseError) {
        console.warn("AI response parse error:", parseError.message);
        suggestions = [];
      }
      sendJson(response, 200, { suggestions });
    } catch (error) {
      console.warn("AI request error:", error.message);
      sendJson(response, 200, { suggestions: [] });
    }
    return;
  }

  // Notifications
  if (request.method === "GET" && parts[0] === "api" && parts[1] === "notifications") {
    const username = url.searchParams.get("username") || "";
    const profile = await getProfileByUsername(username);
    if (!profile) { sendJson(response, 200, { total: 0, friendRequests: 0, groupInvites: 0, messages: 0 }); return; }
    const friendRequests = profile.profile?.friendRequests?.length || 0;
    sendJson(response, 200, { total: friendRequests, friendRequests, groupInvites: 0, messages: 0 });
    return;
  }

  sendJson(response, 404, { error: "Not found" });
}

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function removeUserFromGroup(group, username) {
  const before = group.members?.length || 0;
  group.members = (group.members || []).filter((member) => member.username !== username);
  if (group.choices?.area) delete group.choices.area[group.members.find((m) => m.username === username)?.id || ""];
  if (group.choices?.type) delete group.choices.type[group.members.find((m) => m.username === username)?.id || ""];
  if (group.votes) delete group.votes[group.members.find((m) => m.username === username)?.id || ""];
  // Clean up any references by username directly too
  Object.keys(group.choices?.area || {}).forEach((key) => {
    const member = group.members.find((m) => m.id === key);
    if (!member) delete group.choices.area[key];
  });
  Object.keys(group.choices?.type || {}).forEach((key) => {
    const member = group.members.find((m) => m.id === key);
    if (!member) delete group.choices.type[key];
  });
  Object.keys(group.votes || {}).forEach((key) => {
    const member = group.members.find((m) => m.id === key);
    if (!member) delete group.votes[key];
  });
  return group.members.length !== before;
}

async function getAllProfiles() {
  const { data, error } = await supabase.from("profiles").select("*");
  if (error) throw new Error(error.message);
  return data || [];
}

function generateSamplePlaces(area, activity) {
  const sampleNames = [
    `${activity} Spot`, `Best ${activity} Place`, `${area} ${activity} Lounge`,
    `${activity} House`, `Prime ${activity}`, `${activity} Central`,
    `The ${activity} Corner`, `${activity} & Co.`, `${activity} Garden`,
    `${activity} Square`, `${activity} Terrace`, `${activity} Room`,
    `${activity} Hall`, `${activity} Club`, `${activity} Bar`
  ];
  const times = ["11:00–23:00", "12:00–00:00", "10:00–22:00", "09:00–02:00", "12:00–01:00"];
  const costs = ["€", "€€", "€€€", "€€", "€–€€"];
  const categories = [activity, activity, activity, activity, activity];
  const ratings = [4.0, 3.5, 4.5, 4.2, 3.8];
  const photos = [
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1000&q=80"
  ];
  return Array.from({ length: 6 }, (_, i) => ({
    id: `place_${Date.now()}_${i}`,
    title: sampleNames[i % sampleNames.length],
    category: categories[i % categories.length],
    areaLabel: area,
    description: `A nice ${activity.toLowerCase()} spot in the ${area} area.`,
    time: times[i % times.length],
    cost: costs[i % costs.length],
    rating: ratings[i % ratings.length],
    photoUrl: photos[i % photos.length]
  }));
}

const server = http.createServer(async (request, response) => {
  try {
    if (request.url.startsWith("/api/")) {
      await handleApi(request, response);
      return;
    }
    serveStatic(request, response);
  } catch (error) {
    console.error(error);
    const details = publicError(error);
    sendJson(response, details.status, { error: details.message });
  }
});

server.listen(port, host, () => {
  console.log(`PlanSwipe is running at http://127.0.0.1:${port}`);
  console.log(`On your Wi-Fi, friends can use http://YOUR-COMPUTER-IP:${port}`);
  console.log("Mode: Supabase");
  console.log("Set GOOGLE_MAPS_API_KEY to use real Google Places results.");
  console.log("Set OPENAI_API_KEY for AI suggestions.");
});

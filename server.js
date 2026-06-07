const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");
const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || "0.0.0.0";
const publicRoot = path.resolve(__dirname, "public");
const googleApiKey = process.env.GOOGLE_MAPS_API_KEY || "";
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

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
    description: "Dinner, casual food, or places where the plan starts with eating.",
    googleType: "restaurant",
    searchTerm: "restaurants"
  },
  {
    id: "game",
    label: "Games",
    description: "Bowling, escape rooms, arcades, and playful activities.",
    googleType: "amusement_center",
    searchTerm: "bowling escape rooms arcades"
  },
  {
    id: "walking",
    label: "Walking",
    description: "Parks, promenades, viewpoints, and easy outdoor routes.",
    googleType: "park",
    searchTerm: "parks walking areas"
  }
];

const mockPlaces = [
  {
    id: "sushi-syntagma",
    title: "Sushi place in Syntagma",
    category: "Restaurant",
    type: "restaurant",
    area: "athens_center",
    areaLabel: "Center of Athens",
    description: "A central sushi option with shared plates and easy metro access.",
    time: "Open tonight",
    cost: "$$",
    rating: 4.6,
    photoUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "psyrri-meze",
    title: "Psyrri meze spot",
    category: "Restaurant",
    type: "restaurant",
    area: "athens_center",
    areaLabel: "Center of Athens",
    description: "Greek small plates, casual tables, and good for a mixed group.",
    time: "Open tonight",
    cost: "$$",
    rating: 4.5,
    photoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "monastiraki-burger",
    title: "Monastiraki burger bar",
    category: "Restaurant",
    type: "restaurant",
    area: "athens_center",
    areaLabel: "Center of Athens",
    description: "Simple food, central location, and quick enough for last-minute plans.",
    time: "Open late",
    cost: "$$",
    rating: 4.3,
    photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "glyfada-seafood",
    title: "Glyfada seafood taverna",
    category: "Restaurant",
    type: "restaurant",
    area: "athens_seaside",
    areaLabel: "Athens seaside",
    description: "Seafood and outdoor tables near the coast.",
    time: "Open tonight",
    cost: "$$$",
    rating: 4.4,
    photoUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "chalandri-pizza",
    title: "Chalandri pizza place",
    category: "Restaurant",
    type: "restaurant",
    area: "athens_north",
    areaLabel: "North Athens",
    description: "Easy dinner option for a group that wants something familiar.",
    time: "Open tonight",
    cost: "$$",
    rating: 4.2,
    photoUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "center-bowling",
    title: "Bowling near Syntagma",
    category: "Games",
    type: "game",
    area: "athens_center",
    areaLabel: "Center of Athens",
    description: "Book one lane, order snacks, and keep the competition light.",
    time: "8:30 PM",
    cost: "$$",
    rating: 4.1,
    photoUrl: "https://images.unsplash.com/photo-1538511059256-46e2c43a40c6?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "psyrri-escape",
    title: "Escape room in Psyrri",
    category: "Games",
    type: "game",
    area: "athens_center",
    areaLabel: "Center of Athens",
    description: "A beginner-friendly room for a group that wants a challenge.",
    time: "Weekend",
    cost: "$$$",
    rating: 4.7,
    photoUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "flisvos-walk",
    title: "Flisvos seaside walk",
    category: "Walking",
    type: "walking",
    area: "athens_seaside",
    areaLabel: "Athens seaside",
    description: "A low-effort walk with coffee options nearby.",
    time: "Sunset",
    cost: "Free",
    rating: 4.6,
    photoUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "national-garden",
    title: "National Garden walk",
    category: "Walking",
    type: "walking",
    area: "athens_center",
    areaLabel: "Center of Athens",
    description: "A calm walking option right in the center.",
    time: "Afternoon",
    cost: "Free",
    rating: 4.5,
    photoUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1000&q=80"
  }
];

function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");
}

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }
}

async function findUserByUsername(username) {
  requireSupabase();

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (error) throw error;
  return user;
}

async function createUser(username, password) {
  requireSupabase();
  const passwordHash = hashPassword(password);

  const { error } = await supabase
    .from("users")
    .insert({
      username,
      password_hash: passwordHash
    });

  if (error) throw error;
}

function id(prefix) {
  return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
}

async function groupCode() {
  requireSupabase();

  let code = "";
  do {
    code = String(crypto.randomInt(0, 100000000)).padStart(8, "0");
  } while (await loadGroup(code));
  return code;
}

async function loadGroup(code) {
  requireSupabase();

  const { data, error } = await supabase
    .from("groups")
    .select("data")
    .eq("code", code)
    .maybeSingle();

  if (error) throw error;
  return data?.data || null;
}

async function saveGroup(group) {
  requireSupabase();

  const { error } = await supabase
    .from("groups")
    .upsert(
      {
        code: group.code,
        data: group,
        updated_at: new Date().toISOString()
      },
      { onConflict: "code" }
    );

  if (error) throw error;
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

function publicError(error) {
  if (error?.message?.includes("Supabase is not configured")) {
    return {
      status: 503,
      message: "Supabase is not configured on the server."
    };
  }

  if (
    error?.code === "42P01" ||
    error?.message?.includes('relation "public.groups" does not exist')
  ) {
    return {
      status: 503,
      message: "The Supabase groups table is missing. Run supabase-schema.sql in Supabase."
    };
  }

  if (
    error?.code === "42703" ||
    error?.message?.includes("column")
  ) {
    return {
      status: 503,
      message: "The Supabase groups table has the wrong columns. Run supabase-schema.sql in Supabase."
    };
  }

  return {
    status: 500,
    message: "Server error"
  };
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) request.destroy();
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function addMember(group, name) {
  const user = {
    id: id("user"),
    name: String(name || "Friend").trim().slice(0, 24) || "Friend",
    joinedAt: Date.now()
  };
  group.members.push(user);
  return user;
}

function countChoices(group, kind) {
  const choices = group.choices[kind] || {};
  const counts = {};
  Object.values(choices).forEach((optionId) => {
    counts[optionId] = (counts[optionId] || 0) + 1;
  });
  return counts;
}

function consensusOption(group, kind) {
  const choices = group.choices[kind] || {};
  if (group.members.length === 0) return null;
  if (Object.keys(choices).length < group.members.length) return null;
  const values = Object.values(choices);
  const first = values[0];
  return values.every((value) => value === first) ? first : null;
}

function groupOptions(group, kind) {
  const defaults = kind === "area" ? areaOptions : typeOptions;
  return [...defaults, ...(group?.customOptions?.[kind] || [])];
}

function customOption(kind, label) {
  const cleanLabel = String(label || "").trim().slice(0, 40);
  if (!cleanLabel) return null;

  const option = {
    id: `custom_${kind}_${crypto.randomBytes(5).toString("hex")}`,
    label: cleanLabel,
    description: kind === "area"
      ? "Custom area added by the group."
      : "Custom activity added by the group."
  };

  if (kind === "area") {
    option.queryArea = cleanLabel;
  } else {
    option.searchTerm = cleanLabel;
    option.googleType = "";
  }

  return option;
}

function ensureCustomOptions(group) {
  if (!group.customOptions) group.customOptions = { area: [], type: [] };
  if (!Array.isArray(group.customOptions.area)) group.customOptions.area = [];
  if (!Array.isArray(group.customOptions.type)) group.customOptions.type = [];
}

function buildQuery(areaId, typeId, group) {
  const area = groupOptions(group, "area").find((option) => option.id === areaId);
  const type = groupOptions(group, "type").find((option) => option.id === typeId);
  if (!area || !type) return null;
  return {
    textQuery: `${type.searchTerm} in ${area.queryArea}`,
    includedType: type.googleType || "",
    areaLabel: area.label,
    typeLabel: type.label
  };
}

async function googleTextSearch(query) {
  if (!googleApiKey) return null;

  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": googleApiKey,
      "X-Goog-FieldMask": [
        "places.id",
        "places.displayName",
        "places.formattedAddress",
        "places.rating",
        "places.priceLevel",
        "places.photos",
        "places.types"
      ].join(",")
    },
    body: JSON.stringify({
      textQuery: query.textQuery,
      ...(query.includedType ? { includedType: query.includedType } : {}),
      maxResultCount: 10,
      languageCode: "en"
    })
  });

  if (!response.ok) {
    throw new Error(`Google Places failed with ${response.status}`);
  }

  const data = await response.json();
  return (data.places || []).map((place) => ({
    id: place.id,
    title: place.displayName?.text || "Unnamed place",
    category: query.typeLabel,
    areaLabel: query.areaLabel,
    description: place.formattedAddress || query.textQuery,
    time: "Check hours",
    cost: priceLabel(place.priceLevel),
    rating: place.rating || 4,
    photoUrl: place.photos?.[0]?.name
      ? `/api/photo?name=${encodeURIComponent(place.photos[0].name)}`
      : fallbackPhoto(query.includedType)
  }));
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

function fallbackPhoto(type) {
  if (type === "restaurant") {
    return "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80";
  }
  if (type === "park") {
    return "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80";
  }
  return "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80";
}

async function searchPlaces(areaId, typeId) {
  const query = buildQuery(areaId, typeId);
  if (!query) return { query: "", source: "none", places: [] };

  try {
    const places = await googleTextSearch(query);
    if (places?.length) {
      return { query: query.textQuery, source: "google", places };
    }
  } catch (error) {
    console.warn(error.message);
  }

  const places = mockPlaces
    .filter((place) => place.area === areaId && place.type === typeId)
    .sort((a, b) => b.rating - a.rating);

  return { query: query.textQuery, source: "sample", places };
}

async function searchGroupPlaces(group, areaId, typeId) {
  const query = buildQuery(areaId, typeId, group);
  if (!query) return { query: "", source: "none", places: [] };

  try {
    const places = await googleTextSearch(query);
    if (places?.length) {
      return { query: query.textQuery, source: "google", places };
    }
  } catch (error) {
    console.warn(error.message);
  }

  const places = mockPlaces
    .filter((place) => place.area === areaId && place.type === typeId)
    .sort((a, b) => b.rating - a.rating);

  if (places.length) {
    return { query: query.textQuery, source: "sample", places };
  }

  return {
    query: query.textQuery,
    source: "custom",
    places: [
      {
        id: `custom-place-${areaId}-${typeId}`,
        title: query.typeLabel,
        category: query.typeLabel,
        areaLabel: query.areaLabel,
        description: `A custom group idea for ${query.areaLabel}.`,
        time: "Plan together",
        cost: "TBD",
        rating: 4,
        photoUrl: fallbackPhoto("")
      }
    ]
  };
}

function summarizeGroup(group) {
  const areaConsensus = consensusOption(group, "area");
  const typeConsensus = consensusOption(group, "type");
  const votesByPlace = {};

  Object.values(group.votes).forEach((userVotes) => {
    Object.entries(userVotes).forEach(([placeId, liked]) => {
      if (!votesByPlace[placeId]) votesByPlace[placeId] = { yes: 0, no: 0 };
      if (liked) votesByPlace[placeId].yes += 1;
      else votesByPlace[placeId].no += 1;
    });
  });

  const matches = group.places
    .map((place) => {
      const votes = votesByPlace[place.id] || { yes: 0, no: 0 };
      const total = group.members.length || 1;
      const groupScore = votes.yes / total;
      const ratingScore = (place.rating || 4) / 5;
      return {
        ...place,
        yes: votes.yes,
        no: votes.no,
        total,
        score: groupScore * 0.8 + ratingScore * 0.2
      };
    })
    .filter((place) => place.yes >= Math.ceil(place.total * 0.7))
    .sort((a, b) => b.score - a.score || b.yes - a.yes);

  return {
    code: group.code,
    name: group.name,
    members: group.members,
    choices: {
      area: group.choices.area,
      type: group.choices.type
    },
    options: {
      area: groupOptions(group, "area"),
      type: groupOptions(group, "type")
    },
    counts: {
      area: countChoices(group, "area"),
      type: countChoices(group, "type")
    },
    consensus: {
      area: areaConsensus,
      type: typeConsensus
    },
    search: group.search,
    places: group.places,
    votes: group.votes,
    matches
  };
}

function serveStatic(request, response) {
  const url = new URL(request.url, `http://${host}:${port}`);
  const requestedPath = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const filePath = path.resolve(publicRoot, `.${requestedPath}`);

  if (!filePath.startsWith(publicRoot)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
    ".cmd": "text/plain; charset=utf-8"
  };

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    response.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "application/octet-stream" });
    response.end(data);
  });
}

async function handleApi(request, response) {
  const url = new URL(request.url, `http://${host}:${port}`);
  const parts = url.pathname.split("/").filter(Boolean);

  if (request.method === "POST" && url.pathname === "/api/register") {
  const body = await readBody(request);

  const username = String(body.username || "").trim();
  const password = String(body.password || "");

  if (!username || !password) {
    sendJson(response, 400, {
      error: "Username and password required"
    });
    return;
  }

  const existing = await findUserByUsername(username);

  if (existing) {
    sendJson(response, 400, {
      error: "User already exists"
    });
    return;
  }

  await createUser(username, password);

  sendJson(response, 201, {
    success: true
  });

  return;
}
  if (request.method === "POST" && url.pathname === "/api/login") {
        const body = await readBody(request);

const username = String(body.username || "").trim();
const password = String(body.password || "");

const user = await findUserByUsername(username);

if (
  !user ||
  user.password_hash !== hashPassword(password)
) {
  sendJson(response, 401, {
    error: "Invalid credentials"
  });
  return;
}

sendJson(response, 200, {
  success: true,
  username
});

return;
  }
  
  if (request.method === "GET" && url.pathname === "/api/options") {
    sendJson(response, 200, { areas: areaOptions, types: typeOptions });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/photo") {
    if (!googleApiKey) {
      response.writeHead(404);
      response.end("No Google API key configured");
      return;
    }
    const name = url.searchParams.get("name");
    const photoUrl = `https://places.googleapis.com/v1/${name}/media?maxHeightPx=900&maxWidthPx=1200&key=${googleApiKey}`;
    response.writeHead(302, { Location: photoUrl });
    response.end();
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/groups") {
    const body = await readBody(request);
    const code = await groupCode();
    const group = {
      code,
      name: String(body.groupName || "Friday crew").trim().slice(0, 30) || "Friday crew",
      members: [],
      choices: { area: {}, type: {} },
      customOptions: { area: [], type: [] },
      votes: {},
      search: null,
      places: [],
      createdAt: Date.now()
    };
    const user = addMember(group, body.userName);
    await saveGroup(group);
    sendJson(response, 201, { user, group: summarizeGroup(group) });
    return;
  }

  if (request.method === "POST" && parts[0] === "api" && parts[1] === "groups" && parts[3] === "join") {
    const group = await loadGroup(parts[2]);
    if (!group) {
      sendJson(response, 404, { error: "Group not found" });
      return;
    }
    const body = await readBody(request);
    const user = addMember(group, body.userName);
    await saveGroup(group);
    sendJson(response, 200, { user, group: summarizeGroup(group) });
    return;
  }

  if (request.method === "GET" && parts[0] === "api" && parts[1] === "groups" && parts[2]) {
    const group = await loadGroup(parts[2]);
    if (!group) {
      sendJson(response, 404, { error: "Group not found" });
      return;
    }
    sendJson(response, 200, { group: summarizeGroup(group) });
    return;
  }

  if (request.method === "POST" && parts[0] === "api" && parts[1] === "groups" && parts[3] === "choice") {
    const group = await loadGroup(parts[2]);
    if (!group) {
      sendJson(response, 404, { error: "Group not found" });
      return;
    }
    const body = await readBody(request);
    ensureCustomOptions(group);
    const kind = body.kind === "type" ? "type" : "area";
    let optionId = body.optionId;

    if (body.customLabel) {
      const option = customOption(kind, body.customLabel);
      if (!option) {
        sendJson(response, 400, { error: "Custom option required" });
        return;
      }
      group.customOptions[kind].push(option);
      optionId = option.id;
    }

    const validOptions = groupOptions(group, kind);
    if (!validOptions.some((option) => option.id === optionId)) {
      sendJson(response, 400, { error: "Invalid option" });
      return;
    }
    group.choices[kind][body.userId] = optionId;
    const areaConsensus = consensusOption(group, "area");
    const typeConsensus = consensusOption(group, "type");

    if (areaConsensus && typeConsensus) {
      const result = await searchGroupPlaces(group, areaConsensus, typeConsensus);
      group.search = { query: result.query, source: result.source };
      group.places = result.places;
    }

    await saveGroup(group);
    sendJson(response, 200, { group: summarizeGroup(group) });
    return;
  }

  if (request.method === "POST" && parts[0] === "api" && parts[1] === "groups" && parts[3] === "vote") {
    const group = await loadGroup(parts[2]);
    if (!group) {
      sendJson(response, 404, { error: "Group not found" });
      return;
    }
    const body = await readBody(request);
    if (!group.places.some((place) => place.id === body.placeId)) {
      sendJson(response, 400, { error: "Invalid place" });
      return;
    }
    if (!group.votes[body.userId]) group.votes[body.userId] = {};
    group.votes[body.userId][body.placeId] = Boolean(body.liked);
    await saveGroup(group);
    sendJson(response, 200, { group: summarizeGroup(group) });
    return;
  }

  sendJson(response, 404, { error: "Not found" });
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
  console.log("Set GOOGLE_MAPS_API_KEY to use real Google Places results.");
});

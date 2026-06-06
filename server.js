const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || "0.0.0.0";
const publicRoot = path.resolve(__dirname, "public");
const googleApiKey = process.env.GOOGLE_MAPS_API_KEY || "";

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
    description: "Flisvos, Glyfada, Alimos, and coastal areas.",
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
    googleType: "restaurant",
    searchTerm: "restaurants"
  },
  {
    id: "game",
    label: "Games",
    googleType: "amusement_center",
    searchTerm: "bowling escape rooms arcades"
  },
  {
    id: "walking",
    label: "Walking",
    googleType: "park",
    searchTerm: "parks walking areas"
  }
];

const mockPlaces = [
  {
    id: "sushi-syntagma",
    title: "Sushi place in Syntagma",
    type: "restaurant",
    area: "athens_center",
    rating: 4.6,
    cost: "$$",
    photoUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c"
  },
  {
    id: "psyrri-meze",
    title: "Psyrri meze spot",
    type: "restaurant",
    area: "athens_center",
    rating: 4.5,
    cost: "$$",
    photoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947"
  },
  {
    id: "center-bowling",
    title: "Bowling near Syntagma",
    type: "game",
    area: "athens_center",
    rating: 4.1,
    cost: "$$",
    photoUrl: "https://images.unsplash.com/photo-1538511059256-46e2c43a40c6"
  },
  {
    id: "flisvos-walk",
    title: "Flisvos seaside walk",
    type: "walking",
    area: "athens_seaside",
    rating: 4.6,
    cost: "Free",
    photoUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
  }
];

const groups = new Map();
const userStoreFile = path.resolve(__dirname, "users.json");

function loadUsers() {
  try {
    return JSON.parse(fs.readFileSync(userStoreFile, "utf-8"));
  } catch {
    return {};
  }
}

function saveUsers(users) {
  fs.writeFileSync(userStoreFile, JSON.stringify(users, null, 2));
}

const persistedUsers = loadUsers();

function id(prefix) {
  return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
}

function groupCode() {
  let code;
  do {
    code = crypto.randomBytes(3).toString("hex").toUpperCase();
  } while (groups.has(code));
  return code;
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1_000_000) req.destroy();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function parseCookies(req) {
  const header = req.headers.cookie || "";
  const cookies = {};
  header.split(";").filter(Boolean).forEach(c => {
    const [k, ...v] = c.trim().split("=");
    if (k) cookies[k] = decodeURIComponent(v.join("="));
  });
  return cookies;
}

function setCookie(res, name, value) {
  res.setHeader("Set-Cookie", `${name}=${value}; Path=/; Max-Age=31536000`);
}

function createUser(name) {
  const user = {
    id: id("user"),
    name: String(name || "Friend").trim().slice(0, 24) || "Friend",
    createdAt: Date.now()
  };

  persistedUsers[user.id] = user;
  saveUsers(persistedUsers);

  return user;
}

function addMember(group, user) {
  const member = {
    id: user.id,
    name: user.name,
    joinedAt: Date.now()
  };

  group.members.push(member);
  return member;
}

function buildQuery(areaId, typeId) {
  const area = areaOptions.find(a => a.id === areaId);
  const type = typeOptions.find(t => t.id === typeId);
  if (!area || !type) return null;

  return {
    textQuery: `${type.searchTerm} in ${area.queryArea}`,
    includedType: type.googleType
  };
}

function priceLabel(level) {
  const map = {
    PRICE_LEVEL_FREE: "Free",
    PRICE_LEVEL_INEXPENSIVE: "$",
    PRICE_LEVEL_MODERATE: "$$",
    PRICE_LEVEL_EXPENSIVE: "$$$",
    PRICE_LEVEL_VERY_EXPENSIVE: "$$$$"
  };
  return map[level] || "$$";
}

function fallbackPhoto(type) {
  if (type === "restaurant") return "https://images.unsplash.com/photo-1544025162-d76694265947";
  if (type === "park") return "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee";
  return "https://images.unsplash.com/photo-1511512578047-dfb367046420";
}

async function googleTextSearch(query) {
  if (!googleApiKey) return null;

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": googleApiKey,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.priceLevel,places.photos"
    },
    body: JSON.stringify({
      textQuery: query.textQuery,
      includedType: query.includedType,
      maxResultCount: 10
    })
  });

  if (!res.ok) return null;

  const data = await res.json();

  return (data.places || []).map(p => ({
    id: p.id,
    title: p.displayName?.text || "Unnamed",
    description: p.formattedAddress || "",
    rating: p.rating || 4,
    cost: priceLabel(p.priceLevel),
    photoUrl: p.photos?.[0]?.name
      ? `/api/photo?name=${encodeURIComponent(p.photos[0].name)}`
      : fallbackPhoto(query.includedType)
  }));
}

async function searchPlaces(areaId, typeId) {
  const query = buildQuery(areaId, typeId);
  if (!query) return { query: "", source: "none", places: [] };

  try {
    const google = await googleTextSearch(query);
    if (google?.length) {
      return { query: query.textQuery, source: "google", places: google };
    }
  } catch {}

  const places = mockPlaces.filter(p => p.area === areaId && p.type === typeId);

  return { query: query.textQuery, source: "mock", places };
}

function summarizeGroup(group) {
  return {
    code: group.code,
    name: group.name,
    members: group.members,
    choices: group.choices,
    votes: group.votes,
    places: group.places,
    search: group.search
  };
}

async function handleApi(req, res) {
  const url = new URL(req.url, `http://${host}:${port}`);
  const parts = url.pathname.split("/").filter(Boolean);
  const cookies = parseCookies(req);

  if (req.method === "GET" && url.pathname === "/api/me") {
    const user = persistedUsers[cookies.userId];
    return sendJson(res, 200, { user: user || null });
  }

  if (req.method === "POST" && url.pathname === "/api/login") {
    const body = await readBody(req);
    const user = createUser(body.name);

    setCookie(res, "userId", user.id);
    return sendJson(res, 200, user);
  }

  if (req.method === "POST" && url.pathname === "/api/groups") {
    const body = await readBody(req);

    const user = createUser(body.userName);

    const group = {
      code: groupCode(),
      name: body.groupName || "Crew",
      members: [],
      choices: { area: {}, type: {} },
      votes: {},
      places: [],
      search: null
    };

    addMember(group, user);
    groups.set(group.code, group);

    setCookie(res, "userId", user.id);

    return sendJson(res, 201, { user, group: summarizeGroup(group) });
  }

  if (req.method === "POST" && parts[0] === "api" && parts[1] === "groups" && parts[3] === "join") {
    const group = groups.get(parts[2]);
    if (!group) return sendJson(res, 404, { error: "Not found" });

    const body = await readBody(req);
    const user = createUser(body.userName);

    addMember(group, user);

    return sendJson(res, 200, { user, group: summarizeGroup(group) });
  }

  if (req.method === "POST" && parts[0] === "api" && parts[1] === "groups" && parts[3] === "choice") {
    const group = groups.get(parts[2]);
    if (!group) return sendJson(res, 404, { error: "Not found" });

    const body = await readBody(req);

    group.choices[body.kind][body.userId] = body.optionId;

    const area = Object.values(group.choices.area)[0];
    const type = Object.values(group.choices.type)[0];

    if (area && type) {
      const result = await searchPlaces(area, type);
      group.search = result;
      group.places = result.places;
    }

    return sendJson(res, 200, { group: summarizeGroup(group) });
  }

  sendJson(res, 404, { error: "Not found" });
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${host}:${port}`);
  const filePath = path.resolve(publicRoot, "." + (url.pathname === "/" ? "/index.html" : url.pathname));

  if (!filePath.startsWith(publicRoot)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end("Not found");
    }

    res.writeHead(200);
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url.startsWith("/api/")) return handleApi(req, res);
    serveStatic(req, res);
  } catch (e) {
    console.error(e);
    sendJson(res, 500, { error: "Server error" });
  }
});

server.listen(port, host, () => {
  console.log(`Server running on http://127.0.0.1:${port}`);
});

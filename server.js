const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || "0.0.0.0";
const publicRoot = path.resolve(__dirname, "public");
const googleApiKey = process.env.GOOGLE_MAPS_API_KEY || "";

/* =========================
   USERS (PERSISTENT LOGIN)
========================= */

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

const users = loadUsers();

/* =========================
   COOKIE HELPERS
========================= */

function parseCookies(req) {
  const header = req.headers.cookie || "";
  const cookies = {};
  header.split(";").forEach(c => {
    const [key, ...v] = c.trim().split("=");
    if (key) cookies[key] = decodeURIComponent(v.join("="));
  });
  return cookies;
}

function setCookie(res, name, value) {
  res.setHeader("Set-Cookie", `${name}=${value}; Path=/; Max-Age=31536000`);
}

/* =========================
   APP DATA
========================= */

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

const mockPlaces = [/* unchanged — keep your existing list */];

const groups = new Map();

/* =========================
   HELPERS
========================= */

function id(prefix) {
  return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
}

function groupCode() {
  let code = "";
  do {
    code = crypto.randomBytes(3).toString("hex").toUpperCase();
  } while (groups.has(code));
  return code;
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", chunk => {
      body += chunk;
      if (body.length > 1_000_000) request.destroy();
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    request.on("error", reject);
  });
}

/* =========================
   LOGIN ENDPOINTS
========================= */

async function handleAuth(request, response, url) {
  if (request.method === "POST" && url.pathname === "/api/login") {
    const body = await readBody(request);

    const userId = id("user");
    const name = String(body.name || "Friend").trim().slice(0, 24);

    users[userId] = {
      id: userId,
      name,
      createdAt: Date.now()
    };

    saveUsers(users);
    setCookie(response, "userId", userId);

    sendJson(response, 200, users[userId]);
    return true;
  }

  if (request.method === "GET" && url.pathname === "/api/me") {
    const cookies = parseCookies(request);
    const user = users[cookies.userId];

    sendJson(response, 200, { user: user || null });
    return true;
  }

  return false;
}

/* =========================
   STATIC FILES
========================= */

function serveStatic(request, response) {
  const url = new URL(request.url, `http://${host}:${port}`);
  const requestedPath =
    url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);

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

  fs.readFile(filePath, (err, data) => {
    if (err) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": types[path.extname(filePath)] || "application/octet-stream"
    });

    response.end(data);
  });
}

/* =========================
   SERVER
========================= */

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${host}:${port}`);

    if (request.url.startsWith("/api/")) {
      const handledAuth = await handleAuth(request, response, url);
      if (handledAuth) return;

      
    }

    serveStatic(request, response);
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: "Server error" });
  }
});

server.listen(port, host, () => {
  console.log(`PlanSwipe is running at http://127.0.0.1:${port}`);
});

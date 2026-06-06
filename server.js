const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || "0.0.0.0";
const publicRoot = path.resolve(__dirname, "public");
const googleApiKey = process.env.GOOGLE_MAPS_API_KEY || "";

/* -------------------- AREAS (Greek) -------------------- */
const areaOptions = [
  {
    id: "athens_center",
    label: "Κέντρο Αθήνας",
    description: "Σύνταγμα, Μοναστηράκι, Ψυρρή και γύρω περιοχές.",
    queryArea: "center of Athens"
  },
  {
    id: "athens_seaside",
    label: "Παραλιακή Αθήνα",
    description: "Φλοίσβος, Γλυφάδα, Άλιμος και παραλιακές περιοχές.",
    queryArea: "Athens seaside"
  },
  {
    id: "athens_north",
    label: "Βόρεια Αθήνα",
    description: "Χαλάνδρι, Μαρούσι, Κηφισιά και γύρω περιοχές.",
    queryArea: "north Athens"
  }
];

/* -------------------- TYPES (Greek) -------------------- */
const typeOptions = [
  {
    id: "restaurant",
    label: "Εστιατόρια",
    description: "Δείπνο, φαγητό ή χαλαρό ξεκίνημα της εξόδου.",
    googleType: "restaurant",
    searchTerm: "restaurants"
  },
  {
    id: "game",
    label: "Δραστηριότητες",
    description: "Bowling, escape rooms και arcade παιχνίδια.",
    googleType: "amusement_center",
    searchTerm: "bowling escape rooms arcades"
  },
  {
    id: "walking",
    label: "Βόλτα",
    description: "Πάρκα, παραλίες και χαλαρές διαδρομές.",
    googleType: "park",
    searchTerm: "parks walking areas"
  }
];

/* -------------------- MOCK PLACES (Greek) -------------------- */
const mockPlaces = [
  {
    id: "sushi-syntagma",
    title: "Σουσί στο Σύνταγμα",
    category: "Εστιατόριο",
    type: "restaurant",
    area: "athens_center",
    areaLabel: "Κέντρο Αθήνας",
    description: "Κεντρικό σουσί με εύκολη πρόσβαση με μετρό.",
    time: "Ανοιχτό σήμερα",
    cost: "$$",
    rating: 4.6,
    photoUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "psyrri-meze",
    title: "Μεζεδοπωλείο Ψυρρή",
    category: "Εστιατόριο",
    type: "restaurant",
    area: "athens_center",
    areaLabel: "Κέντρο Αθήνας",
    description: "Ελληνικοί μεζέδες σε χαλαρό περιβάλλον.",
    time: "Ανοιχτό σήμερα",
    cost: "$$",
    rating: 4.5,
    photoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "monastiraki-burger",
    title: "Burger στο Μοναστηράκι",
    category: "Εστιατόριο",
    type: "restaurant",
    area: "athens_center",
    areaLabel: "Κέντρο Αθήνας",
    description: "Γρήγορο φαγητό στο κέντρο της πόλης.",
    time: "Ανοιχτό μέχρι αργά",
    cost: "$$",
    rating: 4.3,
    photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "glyfada-seafood",
    title: "Ψαροταβέρνα Γλυφάδας",
    category: "Εστιατόριο",
    type: "restaurant",
    area: "athens_seaside",
    areaLabel: "Παραλιακή Αθήνα",
    description: "Θαλασσινά δίπλα στη θάλασσα.",
    time: "Ανοιχτό σήμερα",
    cost: "$$$",
    rating: 4.4,
    photoUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "chalandri-pizza",
    title: "Πιτσαρία Χαλανδρίου",
    category: "Εστιατόριο",
    type: "restaurant",
    area: "athens_north",
    areaLabel: "Βόρεια Αθήνα",
    description: "Κλασική επιλογή για παρέα.",
    time: "Ανοιχτό σήμερα",
    cost: "$$",
    rating: 4.2,
    photoUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "center-bowling",
    title: "Bowling Σύνταγμα",
    category: "Δραστηριότητα",
    type: "game",
    area: "athens_center",
    areaLabel: "Κέντρο Αθήνας",
    description: "Διασκεδαστικό bowling για παρέες.",
    time: "20:30",
    cost: "$$",
    rating: 4.1,
    photoUrl: "https://images.unsplash.com/photo-1538511059256-46e2c43a40c6?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "psyrri-escape",
    title: "Escape Room Ψυρρή",
    category: "Δραστηριότητα",
    type: "game",
    area: "athens_center",
    areaLabel: "Κέντρο Αθήνας",
    description: "Αρχάριο-friendly escape room.",
    time: "Σαββατοκύριακο",
    cost: "$$$",
    rating: 4.7,
    photoUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "flisvos-walk",
    title: "Βόλτα Φλοίσβου",
    category: "Βόλτα",
    type: "walking",
    area: "athens_seaside",
    areaLabel: "Παραλιακή Αθήνα",
    description: "Χαλαρή βόλτα δίπλα στη θάλασσα.",
    time: "Ηλιοβασίλεμα",
    cost: "Δωρεάν",
    rating: 4.6,
    photoUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "national-garden",
    title: "Εθνικός Κήπος",
    category: "Βόλτα",
    type: "walking",
    area: "athens_center",
    areaLabel: "Κέντρο Αθήνας",
    description: "Ήσυχη βόλτα στο κέντρο.",
    time: "Απόγευμα",
    cost: "Δωρεάν",
    rating: 4.5,
    photoUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1000&q=80"
  }
];

/* -------------------- API MESSAGES (Greek) -------------------- */

const MESSAGES = {
  groupNotFound: "Η ομάδα δεν βρέθηκε",
  invalidOption: "Μη έγκυρη επιλογή",
  invalidPlace: "Μη έγκυρο μέρος",
  serverError: "Σφάλμα διακομιστή",
  requestFailed: "Αποτυχία αιτήματος"
};

/* -------------------- KEEP REST OF LOGIC SAME -------------------- */
/* (NO CHANGES BELOW EXCEPT STRINGS ABOVE ARE USED INTERNALLY) */

const groups = new Map();

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

function handleError(res, code, key) {
  sendJson(res, code, { error: MESSAGES[key] || "Σφάλμα" });
}

/* ---- IMPORTANT: only showing changed message usage below ---- */

async function handleApi(request, response) {
  const url = new URL(request.url, `http://${host}:${port}`);
  const parts = url.pathname.split("/").filter(Boolean);

  if (request.method === "GET" && url.pathname === "/api/options") {
    sendJson(response, 200, { areas: areaOptions, types: typeOptions });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/groups") {
    const body = await readBody(request);
    const code = groupCode();
    const group = {
      code,
      name: String(body.groupName || "Παρέα Παρασκευής").trim().slice(0, 30),
      members: [],
      choices: { area: {}, type: {} },
      votes: {},
      search: null,
      places: [],
      createdAt: Date.now()
    };

    const user = addMember(group, body.userName);
    groups.set(code, group);
    sendJson(response, 201, { user, group: summarizeGroup(group) });
    return;
  }

  if (request.method === "POST" && parts[0] === "api" && parts[1] === "groups" && parts[3] === "join") {
    const group = groups.get(parts[2]);
    if (!group) return handleError(response, 404, "groupNotFound");

    const body = await readBody(request);
    const user = addMember(group, body.userName);

    sendJson(response, 200, { user, group: summarizeGroup(group) });
    return;
  }

  sendJson(response, 404, { error: MESSAGES.groupNotFound });
}

/* -------------------- REST OF YOUR ORIGINAL FILE UNCHANGED -------------------- */

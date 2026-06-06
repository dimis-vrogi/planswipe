const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || "0.0.0.0";
const publicRoot = path.resolve(__dirname, "public");
const usersPath = path.resolve(__dirname, "users.json");
const googleApiKey = process.env.GOOGLE_MAPS_API_KEY || "";
const hasSupabaseConfig =
  Boolean(process.env.SUPABASE_URL) &&
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
let supabase = null;

if (hasSupabaseConfig) {
  const { createClient } = require("@supabase/supabase-js");
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
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

const groups = new Map();

function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");
}

function readUsers() {
  try {
    const raw = fs.readFileSync(usersPath, "utf8").trim();
    if (!raw) return [];

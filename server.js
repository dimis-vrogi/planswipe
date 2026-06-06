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
    label: "Κέντρο Αθήνας",
    description: "Σύνταγμα, Μοναστηράκι, Ψυρρή και γύρω κεντρικές περιοχές.",
    queryArea: "center of Athens"
  },
  {
    id: "athens_seaside",
    label: "Παραλιακή Αθήνας",
    description: "Φλοίσβος, Γλυφάδα, Άλιμος και η παραλιακή πλευρά της πόλης.",
    queryArea: "Athens seaside"
  },
  {
    id: "athens_north",
    label: "Βόρεια Αθήνα",
    description: "Χαλάνδρι, Μαρούσι, Κηφισιά και γύρω περιοχές.",
    queryArea: "north Athens"
  }
];

const typeOptions = [
  {
    id: "restaurant",
    label: "Εστιατόρια",
    description: "Δείπνο, casual φαγητό ή μέρη όπου η έξοδος ξεκινά με φαγητό.",
    googleType: "restaurant",
    searchTerm: "restaurants"
  },
  {
    id: "game",
    label: "Δραστηριότητες",
    description: "Bowling, escape rooms, arcade και διασκεδαστικές δραστηριότητες.",
    googleType: "amusement_center",
    searchTerm: "bowling escape rooms arcades"
  },
  {
    id: "walking",
    label: "Βόλτα",
    description: "Πάρκα, παραλίες, σημεία θέας και εύκολες εξωτερικές διαδρομές.",
    googleType: "park",
    searchTerm: "parks walking areas"
  }
];

const mockPlaces = [
  {
    id: "sushi-syntagma",
    title: "Σουσάδικο στο Σύνταγμα",
    category: "Εστιατόρια",
    type: "restaurant",
    area: "athens_center",
    areaLabel: "Κέντρο Αθήνας",
    description: "Κεντρικό sushi με shared plates και εύκολη πρόσβαση με μετρό.",
    time: "Ανοιχτό απόψε",
    cost: "$$",
    rating: 4.6,
    photoUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "psyrri-meze",
    title: "Μεζεδοπωλείο στο Ψυρρή",
    category: "Εστιατόρια",
    type: "restaurant",
    area: "athens_center",
    areaLabel: "Κέντρο Αθήνας",
    description: "Ελληνικοί μεζέδες, χαλαρό περιβάλλον για παρέες.",
    time: "Ανοιχτό απόψε",
    cost: "$$",
    rating: 4.5,
    photoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "monastiraki-burger",
    title: "Burger bar στο Μοναστηράκι",
    category: "Εστιατόρια",
    type: "restaurant",
    area: "athens_center",
    areaLabel: "Κέντρο Αθήνας",
    description: "Γρήγορο φαγητό, κεντρική τοποθεσία.",
    time: "Ανοιχτό μέχρι αργά",
    cost: "$$",
    rating: 4.3,
    photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "glyfada-seafood",
    title: "Ψαροταβέρνα Γλυφάδα",
    category: "Εστιατόρια",
    type: "restaurant",
    area: "athens_seaside",
    areaLabel: "Παραλιακή Αθήνας",
    description: "Θάλασσα, φαγητό και εξωτερικά τραπέζια.",
    time: "Ανοιχτό απόψε",
    cost: "$$$",
    rating: 4.4,
    photoUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "chalandri-pizza",
    title: "Πιτσαρία Χαλάνδρι",
    category: "Εστιατόρια",
    type: "restaurant",
    area: "athens_north",
    areaLabel: "Βόρεια Αθήνα",
    description: "Κλασική επιλογή για παρέες.",
    time: "Ανοιχτό απόψε",
    cost: "$$",
    rating: 4.2,
    photoUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "center-bowling",
    title: "Bowling στο Σύνταγμα",
    category: "Δραστηριότητες",
    type: "game",
    area: "athens_center",
    areaLabel: "Κέντρο Αθήνας",
    description: "Bowling και χαλαρός ανταγωνισμός.",
    time: "20:30",
    cost: "$$",
    rating: 4.1,
    photoUrl: "https://images.unsplash.com/photo-1538511059256-46e2c43a40c6?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "psyrri-escape",
    title: "Escape room στο Ψυρρή",
    category: "Δραστηριότητες",
    type: "game",
    area: "athens_center",
    areaLabel: "Κέντρο Αθήνας",
    description: "Δοκιμασία για παρέες.",
    time: "Σαββατοκύριακο",
    cost: "$$$",
    rating: 4.7,
    photoUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: "flisvos-walk",
    title: "Βόλτα Φλοίσβος",
    category: "Βόλτα",
    type: "walking",
    area: "athens_seaside",
    areaLabel: "Παραλιακή Αθήνας",
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

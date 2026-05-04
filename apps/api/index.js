
import 'dotenv/config';
import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import Stripe from 'stripe';
const app = express();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
 const stripe = new Stripe(process.env.VITE_STRIPE_PRIVATE_KEY);

app.use(express.json());
// app.use(cors({ origin: "http://localhost:5173" }));
// Allow your specific Cloudflare URL
const allowedOrigins = ['https://veloura-ck9.pages.dev', 'http://localhost:5174','http://localhost:5175'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200
}));
const port = process.env.PORT || 8080;

// app.listen(port, "0.0.0.0", () => {
//   console.log(`Server is running on port ${port}`);
// });
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Veloura API specialized for Render/AWS running on port ${port}`);
});
app.use(express.json());
const u = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;

const PLACES = [

    { 
    id: "santorini-oia", 
    title: "Cycladic Serenity", 
    country: "Greece", 
    city: "Oia", 
    images: [u("1570077188670-e3a8d69ac5ff"), u("1613395877344-13d4a8e0d49e")] 
  },
  { 
    id: "himachal-spiti", 
    title: "Spiti Valley Spirit", 
    country: "India", 
    city: "Spiti", 
    images: [u("1626621341517-bbf3d9990a23"), u("1614092139025-8b00f2832560")] 
  },
  { 
    id: "nepal-kathmandu", 
    title: "Himalayan Majesty", 
    country: "Nepal", 
    city: "Kathmandu", 
    images: [u("1544735716-392fe2489ffa"), u("1518098268026-4e89f1a2cd8e")] 
  },
  { 
    id: "bali-ubud", 
    title: "Ubud Sanctuary", 
    country: "Indonesia", 
    city: "Bali", 
    images: [u("1537996194471-e657df975ab4"), u("1537953773345-d172ccf13cf1")] 
  },
  { 
    id: "st-moritz", 
    title: "Alpine Elegance", 
    country: "Switzerland", 
    city: "St. Moritz", 
    images: [u("1506905925346-21bda4d32df4"), u("1464822759023-fed622ff2c3b")] 
  },

  { 
    id: "galle-coast", 
    title: "Colonial Coastal Charm", 
    country: "Sri Lanka", 
    city: "Galle", 
    images: [u("1546708973-b339540b5162"), u("1562351758-963a4914f6b4")] 
  },
  { 
    id: "maldives-male", 
    title: "Azure Seclusion", 
    country: "Maldives", 
    city: "Malé", 
    images: [u("1514282401047-d79a71a590e8"), u("1439066615861-d1af74d74000")] 
  },
  { 
    id: "bora-bora", 
    title: "Bora Bora Bliss", 
    country: "French Polynesia", 
    city: "Bora Bora", 
    images: [u("1507525428034-b723cf961d3e"), u("1473410858795-10ce37336482")] 
  },
  { 
    id: "kyoto-japan", 
    title: "Zen Heritage", 
    country: "Japan", 
    city: "Kyoto", 
    images: [u("1493976040374-85c8e12f0c0e"), u("1528360983277-13d401cdc186")] 
  },
  { 
    id: "seychelles", 
    title: "Seychelles Pristine", 
    country: "Seychelles", 
    city: "Mahé", 
    images: [u("1471922694854-ff1b63b20054"), u("1589553416260-f586c8f15147")] 
  }
];
app.get("/places", (req, res) => {
  const cursor = Number(req.query.cursor ?? 0);
  const slice = PLACES.slice(cursor, cursor + 12);
  res.json({ items: slice, nextCursor: cursor + slice.length, hasMore: cursor + slice.length < PLACES.length });
});

app.post("/generate-itinerary", (req, res) => {
  const { city, daysRequested = 5 } = req.body;

  // Destination-specific luxury content
  const contentMap = {
    "Leh": {
      activities: ["Private sunrise meditation at Thiksey", "Stargazing with a professional astronomer", "Pangong Lake luxury camp retreat"],
      stays: ["The Grand Dragon", "Shakti Ladakh Village House"],
      packing: ["Oxygen canisters", "Heavy down jackets", "Sun protection"]
    },
    "Bali": {
      activities: ["Spiritual cleansing at Tirta Empul", "Private jungle swing at sunset", "Gourmet raw-food masterclass"],
      stays: ["Four Seasons Sayan", "Amandari Ubud"],
      packing: ["Light linen clothing", "Insect repellent", "Swimwear"]
    },
    "St. Moritz": {
      activities: ["Private glacier helicopter tour", "Ski-in/Ski-out champagne lunch", "Bernina Express private carriage"],
      stays: ["Badrutt's Palace", "Kulm Hotel"],
      packing: ["Evening formal wear", "High-performance ski gear", "Cold-weather skincare"]
    },
    "default": {
      activities: ["Guided heritage walk", "Michelin-partnered dinner", "Luxury spa session"],
      stays: ["Veloura Signature Collection"],
      packing: ["Comfortable luxury wear", "Camera gear", "Travel essentials"]
    }
  };

  const context = contentMap[city] || contentMap["default"];

  const days = Array.from({ length: daysRequested }, (_, i) => ({
    day: i + 1,
    title: i === 0 ? `Grand Arrival in ${city}` : `Bespoke Experience Day ${i + 1}`,
    morning: `Breakfast: Exclusive local specialties. Experience: ${context.activities[i % context.activities.length]}.`,
    afternoon: `Lunch: High-end local fusion. Feature: Private curated session at ${city}'s premier landmarks.`,
    evening: `Dinner: Signature sunset dining at ${context.stays[0]}. Leisure: Midnight lounge access.`,
    stay: context.stays[i % context.stays.length],
    budgetINR: 35000 + (Math.floor(Math.random() * 20000))
  }));

  res.json({
    itinerary: {
      days,
      essentialPack: context.packing,
      foodPolicy: "Elite Inclusive: Michelin-starred breakfasts and dinners included.",
      totalBudgetINR: days.reduce((sum, d) => sum + d.budgetINR, 0)
    }
  });
});

app.post("/create-checkout-session", async (req, res) => {
  const { amount, cityName } = req.body; 

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ 
        price_data: { 
          currency: 'inr', 
          product_data: { 
            name: `Veloura Elite: ${cityName}`, 
          }, 
          // Multiply by 100 to convert Rupees to Paise
          unit_amount: Math.round(amount * 100) 
        }, 
        quantity: 1 
      }],
      mode: 'payment',
      success_url: 'https://veloura-ck9.pages.dev?success=true',
      cancel_url: 'https://veloura-ck9.pages.dev?canceled=true',
    });
    res.json({ url: session.url });
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
});



// const server = app.listen(8080, () => console.log("API: http://localhost:8080"));
const wss = new WebSocketServer({ server });
const placeCounts = Object.create(null);

wss.on("connection", (ws) => {
  ws.on("message", (raw) => {
    const data = JSON.parse(raw.toString());
    if (data.type === "planning_start") placeCounts[data.placeId] = (placeCounts[data.placeId] || 0) + 1;
    if (data.type === "planning_stop") placeCounts[data.placeId] = Math.max((placeCounts[data.placeId] || 1) - 1, 0);
    const msg = JSON.stringify({ type: "planning_count", placeId: data.placeId, count: placeCounts[data.placeId] });
    wss.clients.forEach(c => c.readyState === 1 && c.send(msg));
  });
});


setInterval(() => {
  const randomPlace = PLACES[Math.floor(Math.random() * PLACES.length)];
  // Randomly add/subtract to simulate people moving between destinations
  const change = Math.random() > 0.4 ? 1 : -1;
  placeCounts[randomPlace.id] = Math.max(1, (placeCounts[randomPlace.id] || 2) + change);

  const msg = JSON.stringify({ 
    type: "planning_count", 
    placeId: randomPlace.id, 
    count: placeCounts[randomPlace.id] 
  });

  wss.clients.forEach(c => c.readyState === 1 && c.send(msg));
}, 4000); 
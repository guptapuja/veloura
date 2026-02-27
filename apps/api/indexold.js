// // const express = require("express");
// // const cors = require("cors");
// import { WebSocketServer } from "ws";
// import Stripe from "stripe";
// import cors from "cors";
// // const app = express();
// app.use(cors({ origin: "http://localhost:5173" }));
// app.use(express.json());
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// // app.use(cors());
// // app.use(express.json());

// // --------- Fake paginated data (cursor-based) ----------
// const PLACES = [
//   {
//     id: "bali-ubud",
//     title: "Ubud Serenity",
//     country: "Indonesia",
//     city: "Bali",
//     images: [
//       "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1400&q=60",
//       "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=60",
//     ],
//   },
//   {
//     id: "swiss-zermatt",
//     title: "Zermatt Peaks",
//     country: "Switzerland",
//     city: "Zermatt",
//     images: [
//       "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=60",
//       "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1400&q=60",
//     ],
//   },
//   {
//     id: "india-ladakh",
//     title: "Ladakh Circuit",
//     country: "India",
//     city: "Leh",
//     images: [
//       "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1400&q=60",
//       "https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=1400&q=60",
//     ],
//   },
//   {
//     id: "ireland-dublin",
//     title: "Dublin Luxe",
//     country: "Ireland",
//     city: "Dublin",
//     images: [
//       "https://images.unsplash.com/photo-1520962922320-2038eebab146?auto=format&fit=crop&w=1400&q=60",
//       "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1400&q=60",
//     ],
//   },
// ];
// app.get("/places", async (req, res) => {
//   const cursor = Number(req.query.cursor ?? 0);
//   const limit = Number(req.query.limit ?? 10);

//   // simulate “infinite” by cycling dataset
//   const items = Array.from({ length: limit }).map((_, i) => {
//     const base = PLACES[(cursor + i) % PLACES.length];
//     return { ...base, id: `${base.id}-${cursor + i}` };
//   });

//   res.json({ items, nextCursor: cursor + limit });
// });

// // --------- AI itinerary (mock for now) ----------
// // app.post("/ai/itinerary", async (req, res) => {
// //   const { prompt } = req.body ?? {};
// //   if (!prompt) return res.status(400).json({ error: "prompt required" });

// //   // Mock “AI” JSON you can replace with real OpenAI later
// //   const itinerary = {
// //     title: "Veloura Itinerary",
// //     summary: prompt,
// //     days: [
// //       { day: 1, title: "Arrival + Luxury Check-in", items: ["Check-in", "Sunset dinner", "Spa"] },
// //       { day: 2, title: "Iconic Experience", items: ["Private tour", "Fine dining", "Night stroll"] },
// //       { day: 3, title: "Slow Morning + Culture", items: ["Brunch", "Museum/Temple", "Cafe hopping"] },
// //     ],
// //   };

// //   res.json({ itinerary });
// // });
// app.post("/itinerary", (req, res) => {
//   const { prompt } = req.body || {};
//   // You can parse city from prompt later; for now return solid 5-day structure

//   res.json({
//     itinerary: {
//       title: "5-Day Luxury Itinerary",
//       days: [
//         {
//           day: 1,
//           title: "Arrival + Resort Indulgence",
//           items: [
//             "Private airport transfer + chilled welcome drinks",
//             "Check-in to a luxury resort (pool villa preferred)",
//             "Sunset at a scenic viewpoint + curated dinner",
//             "Optional: spa recovery session",
//           ],
//         },
//         {
//           day: 2,
//           title: "Iconic Experiences + Culture",
//           items: [
//             "Guided cultural tour with early start (avoid crowds)",
//             "Temple / heritage visit + local artisan market",
//             "Private lunch experience (chef’s tasting)",
//             "Evening: live music lounge or beach club",
//           ],
//         },
//         {
//           day: 3,
//           title: "Nature Day + Slow Luxury",
//           items: [
//             "Sunrise drive + scenic walk / viewpoints",
//             "Waterfall / lake visit with private guide",
//             "Afternoon: café hopping + shopping",
//             "Night: candlelight dining / rooftop dinner",
//           ],
//         },
//         {
//           day: 4,
//           title: "Adventure + Signature Activity",
//           items: [
//             "Signature activity (raft / hike / yacht / helicopter — depending on city)",
//             "Brunch + downtime",
//             "Photography session (optional)",
//             "Evening: fine dining + night stroll",
//           ],
//         },
//         {
//           day: 5,
//           title: "Brunch + Departure",
//           items: [
//             "Late brunch + last-minute shopping",
//             "Relax at property (pool / spa)",
//             "Private transfer to airport",
//           ],
//         },
//       ],
//     },
//   });
// });
// const server = app.listen(8080, () => console.log("API on http://localhost:8080"));

// // --------- WebSocket: real-time planning counts ----------
// const wss = new WebSocketServer({ server });
// const planningCounts = new Map(); // placeId -> count

// function broadcast(msgObj) {
//   const msg = JSON.stringify(msgObj);
//   wss.clients.forEach((client) => {
//     if (client.readyState === 1) client.send(msg);
//   });
// }

// wss.on("connection", (ws) => {
//   ws.send(JSON.stringify({ type: "hello", ts: Date.now() }));

//   ws.on("message", (raw) => {
//     try {
//       const data = JSON.parse(raw.toString());
//       if (data.type === "planning_start") {
//         const key = data.placeId;
//         const next = (planningCounts.get(key) ?? 0) + 1;
//         planningCounts.set(key, next);
//         broadcast({ type: "planning_count", placeId: key, count: next });
//       }
//       if (data.type === "planning_stop") {
//         const key = data.placeId;
//         const next = Math.max(0, (planningCounts.get(key) ?? 0) - 1);
//         planningCounts.set(key, next);
//         broadcast({ type: "planning_count", placeId: key, count: next });
//       }
//     } catch {}
//   });
// });

// app.post("/create-checkout-session", async (req, res) => {
//   try {
//     const session = await stripe.checkout.sessions.create({
//       mode: "payment",
//       line_items: [
//         {
//           price_data: {
//             currency: "inr",
//             product_data: { name: "Veloura Premium Itinerary Pack" },
//             unit_amount: 19900, // ₹199 in paise
//           },
//           quantity: 1,
//         },
//       ],
//       success_url: "http://localhost:5173/?paid=1",
//       cancel_url: "http://localhost:5173/checkout?cancel=1",
//     });

//     res.json({ url: session.url });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ error: "Stripe session failed" });
//   }
// });
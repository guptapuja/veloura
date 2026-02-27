
// 1. Get the base URL from environment variables
// This falls back to localhost only if the environment variable is missing
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export async function fetchPlacesPage(cursor: number, limit = 12) {
  // Use the dynamic API_BASE instead of hardcoded localhost
  const r = await fetch(`${API_BASE}/places?cursor=${cursor}&limit=${limit}`);
  
  if (!r.ok) throw new Error("Failed to fetch places");
  
  return r.json() as Promise<{ 
    items: any[]; 
    nextCursor: number; 
    hasMore: boolean 
  }>;
}

export async function generateItinerary(city: string, daysRequested: number = 5) {
  // Updated endpoint to match your index.js POST route: /generate-itinerary
  const r = await fetch(`${API_BASE}/generate-itinerary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ city, daysRequested }),
  });
  
  if (!r.ok) throw new Error("Itinerary generation failed");
  
  return r.json() as Promise<{ 
    itinerary: {
      days: any[];
      essentialPack: string[];
      foodPolicy: string;
      totalBudgetINR: number;
    } 
  }>;
}

/**
 * NEW: Create Checkout Session
 * Adds the bridge to your Stripe logic in index.js
 */
export async function createCheckoutSession(amount: number, cityName: string) {
  const r = await fetch(`${API_BASE}/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, cityName }),
  });
  
  if (!r.ok) throw new Error("Failed to create checkout session");
  
  return r.json() as Promise<{ url: string }>;
}
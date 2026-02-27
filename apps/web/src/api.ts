// export async function fetchPlacesPage(cursor: number, limit = 12) {
//   const r = await fetch(`http://localhost:8080/places?cursor=${cursor}&limit=${limit}`);
//   if (!r.ok) throw new Error("Failed to fetch places");
//   return r.json() as Promise<{ items: any[]; nextCursor: number }>;
// }
export async function fetchPlacesPage(cursor: number, limit = 12) {
  const r = await fetch(`http://localhost:8080/places?cursor=${cursor}&limit=${limit}`);
  
  if (!r.ok) throw new Error("Failed to fetch places");
  
  // ✅ Added hasMore to the type so React Query knows when to stop scrolling
  return r.json() as Promise<{ 
    items: any[]; 
    nextCursor: number; 
    hasMore: boolean 
  }>;
}
export async function generateItinerary(prompt: string) {
  const r = await fetch(`http://localhost:8080/ai/itinerary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!r.ok) throw new Error("AI failed");
  return r.json() as Promise<{ itinerary: any }>;
}
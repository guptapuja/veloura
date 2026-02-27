import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { motion } from "framer-motion";
import Drawer from "./Drawer";
import { fetchPlacesPage } from "./api";
import { createWS } from "./ws";

type Place = {
  id: string;
  title: string;
  country: string;
  city: string;
  images?: string[];
};

export default function App() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const wsRef = useRef<ReturnType<typeof createWS> | null>(null);

  const [selected, setSelected] = useState<Place | null>(null);
  const drawerOpen = !!selected;

  // 1. Add state for the active tab
const [activeTab, setActiveTab] = useState("COLLECTIONS");

// 2. Filter your list based on the active tab

// Inside App.tsx
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("success")) {
    alert("Welcome to the Elite. Your Concierge will contact you shortly.");
    // Clear the URL so the alert doesn't keep popping up
    window.history.replaceState({}, document.title, "/");
  }
}, []);
  // ✅ WS connection (single shared)
  useEffect(() => {
    const conn = createWS("ws://localhost:8080", (data: any) => {
      if (data?.type === "planning_count") {
        setCounts((prev) => ({ ...prev, [data.placeId]: data.count }));
      }
    });

    wsRef.current = conn;

    return () => {
      conn.close();
      wsRef.current = null;
    };
  }, []);

  // ✅ Infinite query
  // const q = useInfiniteQuery({
  //   queryKey: ["places"],
  //   initialPageParam: 0,
  //   queryFn: ({ pageParam }) => fetchPlacesPage(pageParam as number, 12),
  //   getNextPageParam: (last: any) => last?.nextCursor,
  // });

  const q = useInfiniteQuery({
    queryKey: ["places_v2"], // change key once
    initialPageParam: 0,
    queryFn: ({ pageParam }) => fetchPlacesPage(pageParam as number, 12),
    getNextPageParam: (last: any) => (last?.hasMore ? last?.nextCursor : undefined),
  });
  // ✅ NO mapping — trust backend to send images
  const places: Place[] = useMemo(
    () => (q.data?.pages?.flatMap((p: any) => p.items) ?? []) as Place[],
    [q.data]
  );

  // ✅ Virtualizer
  const parentRef = useRef<HTMLDivElement | null>(null);

const v = useVirtualizer({
  count: places.length + 1,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 320, // ✅ Increased to match the 280px card + 40px padding
  overscan: 10,
});
  const items = v.getVirtualItems();

// const v = useVirtualizer({
//   count: filteredPlaces.length, // ✅ Use the filtered length
//   getScrollElement: () => parentRef.current,
//   estimateSize: () => 320,
// });


  useEffect(() => {
    const last = items[items.length - 1];
    if (!last) return;

    const shouldLoad =
      last.index >= places.length - 2 &&
      q.hasNextPage &&
      !q.isFetchingNextPage &&
      !q.isFetching;

    if (shouldLoad) q.fetchNextPage();
  }, [
    items,
    places.length,
    q.hasNextPage,
    q.isFetchingNextPage,
    q.isFetching,
    q.fetchNextPage,
  ]);
  const filteredPlaces = useMemo(() => {
  if (activeTab === "COLLECTIONS") return places;

  // CONCIERGE mode: Only show places where people are currently planning (liveCount > 0)
  if (activeTab === "CONCIERGE") {
    return places.filter(p => (counts[p.id] || 0) > 0);
  }
  return places;
}, [places, activeTab, counts]);
//   return (

    
//     <div style={{ minHeight: "100vh", background: "#0B0B0D", color: "#F8F8F6" }}>
// <header style={{
//   position: 'sticky', top: 0, zIndex: 100,
//   background: 'rgba(11, 11, 13, 0.75)', backdropFilter: 'blur(15px)',
//   borderBottom: '1px solid rgba(198, 165, 92, 0.2)',
//   padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
// }}>
//   {/* <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//     <h1 style={{ fontSize: '1.5rem', margin: 0, color: '#C6A55C', fontWeight: 900 }}>Veloura</h1>
//     <span style={{ fontSize: '0.6rem', border: '1px solid #C6A55C', padding: '2px 6px', borderRadius: 4, color: '#C6A55C' }}>ELITE</span>
//   </div> */}
//   <motion.div 
//   initial={{ opacity: 0, y: 20 }}
//   animate={{ opacity: 1, y: 0 }}
//   style={{ textAlign: 'center', padding: '60px 0' }}
// >
//   <h2 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-2px', margin: 0 }}>
//     Veloura <span style={{ color: '#C6A55C' }}>Elite</span>
//   </h2>
//   <p style={{ color: '#A1A1AA', fontSize: '1.2rem', maxWidth: 500, margin: '15px auto' }}>
//     The world's most clandestine destinations, curated for the modern pioneer.
//   </p>
// </motion.div>
//   <nav style={{ display: 'flex', gap: 25, fontSize: '0.8rem', fontWeight: 600 }}>
//     <a href="#" style={{ color: '#F8F8F6', textDecoration: 'none' }}>COLLECTIONS</a>
//     <a href="#" style={{ color: '#A1A1AA', textDecoration: 'none' }}>CONCIERGE</a>
//   </nav>
// </header>

//       <div style={{ maxWidth: 980, margin: "0 auto", position: "relative", zIndex: 1 }}>
//         <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
//           Veloura
//         </motion.h1>
//         <div style={{ color: "#A1A1AA", marginBottom: 12 }}>Journeys Beyond Ordinary</div>

//         <div
//           ref={parentRef}
//           style={{
//             height: "78vh",
//             overflow: "auto",
//             border: "1px solid rgba(255,255,255,0.12)",
//             borderRadius: 22,
//             background: "rgba(10,10,12,0.38)",
//             backdropFilter: "blur(14px)",
//             boxShadow: "0 20px 80px rgba(0,0,0,0.55)",
//           }}
//         >
//           <div style={{ height: v.getTotalSize(), position: "relative" }}>
//             {items.map((row) => {
//               const isLoader = row.index >= places.length;
//               const place = places[row.index];

//               return (
//                 <div
//                   key={row.key}
//                   style={{
//                     position: "absolute",
//                     top: 0,
//                     left: 0,
//                     width: "100%",
//                     transform: `translateY(${row.start}px)`,
//                     padding: 12,
//                   }}
//                 >
//                   {isLoader ? (
//                     <div
//                       style={{
//                         padding: 16,
//                         borderRadius: 16,
//                         background: "rgba(255,255,255,0.03)",
//                         border: "1px solid rgba(255,255,255,0.06)",
//                       }}
//                     >
//                       {q.isFetchingNextPage
//                         ? "Loading more…"
//                         : q.hasNextPage
//                           ? "Scroll for more…"
//                           : "End ✨"}
//                     </div>
//                   ) : (
//                     <Card
//                       place={place}
//                       liveCount={counts[place.id] ?? 0}
//                       send={wsRef.current?.safeSend}
//                       onOpen={() => setSelected(place)}
//                     />
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>

//       <Drawer open={drawerOpen} onClose={() => setSelected(null)} place={selected} />
//     </div>
//   );

return (
  <div style={{ minHeight: "100vh", background: "#0B0B0D", color: "#F8F8F6" }}>
    {/* 1. THE NAVIGATION BAR */}
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(11, 11, 13, 0.85)', backdropFilter: 'blur(15px)',
      borderBottom: '1px solid rgba(198, 165, 92, 0.2)',
      padding: '12px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <h1 style={{ fontSize: '1.4rem', margin: 0, color: '#C6A55C', fontWeight: 900, letterSpacing: '-1px' }}>Veloura</h1>
        <span style={{ fontSize: '0.6rem', border: '1px solid #C6A55C', padding: '2px 6px', borderRadius: 4, color: '#C6A55C', fontWeight: 900 }}>ELITE</span>
      </div>
      
      {/* <nav style={{ display: 'flex', gap: 25, fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>
        <a href="#" style={{ color: '#F8F8F6', textDecoration: 'none' }}>COLLECTIONS</a>
        <a href="#" style={{ color: '#A1A1AA', textDecoration: 'none' }}>CONCIERGE</a>
      </nav> */}
      <nav style={{ display: 'flex', gap: 25, fontSize: '0.8rem', fontWeight: 600 }}>
  <button 
    onClick={() => setActiveTab("COLLECTIONS")}
    style={{ 
      background: 'none', border: 'none', cursor: 'pointer',
      color: activeTab === "COLLECTIONS" ? '#C6A55C' : '#A1A1AA',
      borderBottom: activeTab === "COLLECTIONS" ? '2px solid #C6A55C' : 'none',
      paddingBottom: '4px'
    }}
  >COLLECTIONS</button>
  <button 
    onClick={() => setActiveTab("CONCIERGE")}
    style={{ 
      background: 'none', border: 'none', cursor: 'pointer',
      color: activeTab === "CONCIERGE" ? '#C6A55C' : '#A1A1AA',
      borderBottom: activeTab === "CONCIERGE" ? '2px solid #C6A55C' : 'none',
      paddingBottom: '4px'
    }}
  >CONCIERGE</button>
</nav>
      
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#C6A55C', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', color: '#000', fontSize: '0.7rem' }}>PG</div>
    </header>

    {/* 2. THE HERO SECTION (Now outside the header) */}
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ textAlign: 'center', padding: '80px 20px 40px' }}
    >
      <h2 style={{ fontSize: '4.5rem', fontWeight: 900, letterSpacing: '-3px', margin: 0, lineHeight: 1 }}>
        Veloura <span style={{ color: '#C6A55C' }}>Elite</span>
      </h2>
      <p style={{ color: '#A1A1AA', fontSize: '1.1rem', maxWidth: 500, margin: '20px auto', fontWeight: 400, lineHeight: 1.6 }}>
        The world's most clandestine destinations, curated for the modern pioneer.
      </p>
    </motion.div>

    {/* 3. THE MAIN CONTENT GRID */}
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 20px 60px", position: "relative", zIndex: 1 }}>
      <div
        ref={parentRef}
        style={{
          height: "75vh",
          overflow: "auto",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 32,
          background: "rgba(15,15,18,0.5)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.8)",
          scrollbarWidth: 'none'
        }}
      >
        <div style={{ height: v.getTotalSize(), position: "relative" }}>
          {items.map((row) => {
            const isLoader = row.index >= places.length;
            const place = places[row.index];

            return (
              <div
                key={row.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${row.start}px)`,
                  padding: "15px 25px",
                }}
              >
                {isLoader ? (
                  <div style={{ padding: 40, textAlign: 'center', color: '#333', fontSize: '0.8rem', letterSpacing: 2 }}>
                    {q.isFetchingNextPage ? "CURATING MORE..." : "THE END OF THE HORIZON"}
                  </div>
                ) : (
                  <Card
                    place={place}
                    liveCount={counts[place.id] ?? 0}
                    send={wsRef.current?.safeSend}
                    onOpen={() => setSelected(place)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>

    <Drawer open={drawerOpen} onClose={() => setSelected(null)} place={selected} />
  </div>
);
}

function Card({ place, liveCount, send, onOpen }: any) {
  const [imgIdx, setImgIdx] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    send?.({ type: "planning_start", placeId: place.id });
    return () => send?.({ type: "planning_stop", placeId: place.id });
  }, [place.id, send]);

  const src = place.images?.[imgIdx];

  return (
    <motion.div
      onClick={onOpen}
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      style={{
        cursor: "pointer", borderRadius: 24, height: 280, // Taller for luxury look
        border: "1px solid rgba(198,165,92,0.22)",
        position: "relative", overflow: "hidden",
        background: "linear-gradient(90deg, #1c1c1f 25%, #27272a 50%, #1c1c1f 75%)",
        backgroundSize: "200% 100%",
        animation: isLoaded ? "none" : "shimmer 2s infinite",
      }}
    >
      <img
        src={src || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80"}
        alt={place.title}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (place.images && imgIdx < place.images.length - 1) setImgIdx(imgIdx + 1);
          else setImgIdx(-1);
        }}
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", opacity: isLoaded ? 1 : 0, transition: "opacity 0.8s ease"
        }}
      />

      {/* Luxury Gradient Overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
        opacity: isLoaded ? 1 : 0, transition: "opacity 0.6s ease"
      }} />

<div style={{ 
  position: "relative", 
  padding: 24, 
  zIndex: 2, 
  height: '100%', 
  display: 'flex', 
  flexDirection: 'column', 
  justifyContent: 'flex-end',
  // Adds a smooth transition for the text when the card moves
  transition: 'transform 0.3s ease' 
}}>
  <h3 style={{ 
    margin: 0, 
    fontSize: "1.6rem", 
    fontWeight: 800,
    color: "#FFFFFF",
    // ✅ Crucial: Protects text against bright images
    textShadow: "0 2px 10px rgba(0,0,0,0.5)" 
  }}>
    {place.title}
  </h3>
  
  <p style={{ 
    margin: "4px 0 0", 
    color: "#D1D1D6", // Slightly brighter than A1A1AA for better contrast
    fontSize: "0.95rem",
    fontWeight: 500,
    textShadow: "0 1px 5px rgba(0,0,0,0.5)"
  }}>
    {place.city} • {place.country}
  </p>

        {/* ✅ NEXT LEVEL: Pulsing Live Count */}
        {liveCount > 0 && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
               <div className="pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: '#C6A55C' }} />
            </div>
            <span style={{ fontSize: "0.7rem", fontWeight: 900, color: "#C6A55C", letterSpacing: '1px' }}>
              {liveCount > 5 ? 'HIGH DEMAND' : `${liveCount} PLANNING NOW`}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
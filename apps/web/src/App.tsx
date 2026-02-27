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
// const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// ✅ Strip 'http://' before adding 'ws://' for the WebSocket

export default function App() {
    const [counts, setCounts] = useState<Record<string, number>>({});
    const wsRef = useRef<ReturnType<typeof createWS> | null>(null);
    const [activeTab, setActiveTab] = useState("COLLECTIONS");
    const [selected, setSelected] = useState<Place | null>(null);
    const parentRef = useRef<HTMLDivElement | null>(null);

    const drawerOpen = !!selected;

    // 1. Stripe Success Handler
    useEffect(() => {
        
        const params = new URLSearchParams(window.location.search);
        if (params.get("success")) {
            alert("Welcome to the Elite. Your Concierge will contact you shortly.");
            window.history.replaceState({}, document.title, "/");
        }
    }, []);

    // 2. WebSocket Connection
    useEffect(() => {
        const WS_URL = API_BASE.replace("https://", "wss://");
        const conn = createWS(WS_URL, (data: any) => {
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

    // 3. Infinite Query Data
    const q = useInfiniteQuery({
        queryKey: ["places_v2"],
        initialPageParam: 0,
        queryFn: ({ pageParam }) => fetchPlacesPage(pageParam as number, 12),
        getNextPageParam: (last: any) => (last?.hasMore ? last?.nextCursor : undefined),
    });

    const places: Place[] = useMemo(
        () => (q.data?.pages?.flatMap((p: any) => p.items) ?? []) as Place[],
        [q.data]
    );

    // 4. Tab Filter Logic
    const filteredPlaces = useMemo(() => {
        if (activeTab === "COLLECTIONS") return places;
        if (activeTab === "CONCIERGE") {
            return places.filter(p => (counts[p.id] || 0) > 0);
        }
        return places;
    }, [places, activeTab, counts]);

    // 5. Virtualizer Configuration
    const v = useVirtualizer({
        count: filteredPlaces.length + (q.hasNextPage && activeTab === "COLLECTIONS" ? 1 : 0),
        getScrollElement: () => parentRef.current,
        estimateSize: () => 320,
        overscan: 10,
    });

    const items = v.getVirtualItems();

    // 6. Infinite Scroll Trigger
    useEffect(() => {
        const last = items[items.length - 1];
        if (!last || activeTab !== "COLLECTIONS") return;

        const shouldLoad =
            last.index >= filteredPlaces.length - 2 &&
            q.hasNextPage &&
            !q.isFetchingNextPage &&
            !q.isFetching;

        if (shouldLoad) q.fetchNextPage();
    }, [items, filteredPlaces.length, q.hasNextPage, q.isFetchingNextPage, q.isFetching, q.fetchNextPage, activeTab]);

    return (
        <div style={{ minHeight: "100vh", background: "#0B0B0D", color: "#F8F8F6", fontFamily: 'Inter, sans-serif' }}>

            {/* --- FIXED HEADER --- */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 1000,
                background: 'rgba(11, 11, 13, 0.85)', backdropFilter: 'blur(15px)',
                borderBottom: '1px solid rgba(198, 165, 92, 0.2)',
                padding: '12px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h1 style={{ fontSize: '1.4rem', margin: 0, color: '#C6A55C', fontWeight: 900, letterSpacing: '-1px' }}>Veloura</h1>
                    <span style={{ fontSize: '0.6rem', border: '1px solid #C6A55C', padding: '2px 6px', borderRadius: 4, color: '#C6A55C', fontWeight: 900 }}>ELITE</span>
                </div>

                <nav style={{ display: 'flex', gap: 30, fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1.5px' }}>
                    <button
                        onClick={() => setActiveTab("COLLECTIONS")}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: activeTab === "COLLECTIONS" ? '#C6A55C' : '#666',
                            borderBottom: activeTab === "COLLECTIONS" ? '2px solid #C6A55C' : 'none',
                            paddingBottom: 4, transition: '0.3s'
                        }}
                    >COLLECTIONS</button>
                    <button
                        onClick={() => setActiveTab("CONCIERGE")}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: activeTab === "CONCIERGE" ? '#C6A55C' : '#666',
                            borderBottom: activeTab === "CONCIERGE" ? '2px solid #C6A55C' : 'none',
                            paddingBottom: 4, transition: '0.3s'
                        }}
                    >CONCIERGE</button>
                </nav>

                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#C6A55C', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', color: '#000', fontSize: '0.7rem' }}>PG</div>
            </header>

            {/* --- SPLIT LAYOUT WRAPPER --- */}
            <div style={{ display: 'flex', maxWidth: 1400, margin: '0 auto', gap: 60, padding: '0 40px' }}>

                {/* LEFT PANEL: BRAND ANCHOR */}
                <div style={{ flex: 1, padding: '100px 0', position: 'sticky', top: 80, height: 'fit-content' }}>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 style={{ fontSize: '4.5rem', fontWeight: 900, lineHeight: 1, margin: 0, letterSpacing: '-3px' }}>
                            VELOURA <span style={{ color: '#C6A55C' }}>ELITE</span>
                        </h2>
                        <p style={{ color: '#A1A1AA', fontSize: '1.1rem', marginTop: 25, maxWidth: 380, lineHeight: 1.6 }}>
                            Clandestine journeys for the modern pioneer. Curated by AI, reserved for the few.
                        </p>
                        <div style={{ marginTop: 40, height: 2, width: 60, background: '#C6A55C' }} />
                    </motion.div>
                </div>

                {/* RIGHT PANEL: GRID */}
                <div style={{ flex: 1.5, padding: '80px 0 60px' }}>
                    <div
                        ref={parentRef}
                        style={{
                            height: "80vh",
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
                            {/* Empty State */}
                            {filteredPlaces.length === 0 && !q.isLoading && (
                                <div style={{ padding: 60, textAlign: 'center', color: '#666' }}>
                                    <p>No clandestine journeys currently in progress.</p>
                                    <button onClick={() => setActiveTab("COLLECTIONS")} style={{ color: '#C6A55C', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                                        View All Collections
                                    </button>
                                </div>
                            )}

                            {items.map((row) => {
                                const isLoader = row.index >= filteredPlaces.length;
                                const place = filteredPlaces[row.index];

                                return (
                                    <div key={row.key} style={{
                                        position: "absolute", top: 0, left: 0, width: "100%",
                                        transform: `translateY(${row.start}px)`, padding: "15px 25px",
                                    }}>
                                        {isLoader ? (
                                            <div style={{ padding: 40, textAlign: 'center', color: '#444', fontSize: '0.7rem' }}>
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
            </div>

            <Drawer open={drawerOpen} onClose={() => setSelected(null)} place={selected} />
        </div>
    );
}

function Card({ place, liveCount, send, onOpen }: any) {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        send?.({ type: "planning_start", placeId: place.id });
        return () => send?.({ type: "planning_stop", placeId: place.id });
    }, [place.id, send]);
const currentImage = place.images?.[0] || "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800";
    return (
        <motion.div
            onClick={onOpen}
            whileHover={{ y: -8, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            style={{
                cursor: "pointer", borderRadius: 24, height: 280,
                border: "1px solid rgba(198,165,92,0.15)",
                position: "relative", overflow: "hidden", background: "#161618"
            }}
        >

<img
        // ✅ 2. Use the defined variable here
        src={currentImage}
        alt={place.title}
        onLoad={() => setIsLoaded(true)}
        onError={(e) => {
          // ✅ 3. Fallback logic if the Ladakh/Andaman ID 404s
          const target = e.target as HTMLImageElement;
          target.src = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800";
          setIsLoaded(true);
        }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          // ✅ 4. Baseline 0.4 ensures it's never a "Ghost Card"
          opacity: isLoaded ? 1 : 0.4, 
          transition: "opacity 0.5s ease",
          background: "#161618"
        }}
      />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)" }} />

            <div style={{ position: "relative", padding: 24, zIndex: 2, height: '80%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <h3 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800, color: "#FFFFFF", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                    {place.title}
                </h3>
                <p style={{ margin: "4px 0 0", color: "#D1D1D6", fontSize: "0.95rem", fontWeight: 500 }}>
                    {place.city} • {place.country}
                </p>

                {liveCount > 0 && (
                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C6A55C', boxShadow: '0 0 10px #C6A55C' }} />
                        <span style={{ fontSize: "0.7rem", fontWeight: 900, color: "#C6A55C", letterSpacing: '1px' }}>
                            {liveCount > 5 ? 'HIGH DEMAND' : `${liveCount} PLANNING NOW`}
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}


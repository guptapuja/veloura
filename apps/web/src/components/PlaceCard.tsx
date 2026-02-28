import  { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function PlaceCard({ place, liveCount, send, onOpen }: any) {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Signals to Render that a user is looking at this destination
        send?.({ type: "planning_start", placeId: place.id });
        return () => send?.({ type: "planning_stop", placeId: place.id });
    }, [place.id, send]);

    const currentImage = place.images?.[0] || "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800";

    return (
        <motion.div
            onClick={onOpen}
            whileHover={{ y: -8, scale: 1.01 }}
            style={{
                cursor: "pointer", borderRadius: 24, height: 280,
                border: "1px solid rgba(198, 165, 92, 0.15)",
                position: "relative", overflow: "hidden", background: "#161618"
            }}
        >
            <img
                src={currentImage}
                alt={place.title}
                onLoad={() => setIsLoaded(true)}
                style={{
                    position: "absolute", inset: 0, width: "100%", height: "100%",
                    objectFit: "cover", opacity: isLoaded ? 1 : 0.4, transition: "opacity 0.5s ease"
                }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)" }} />

            <div style={{ position: "relative", padding: 24, zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <h3 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800, color: "#FFFFFF" }}>{place.title}</h3>
                <p style={{ margin: "4px 0 0", color: "#D1D1D6", fontSize: "0.95rem" }}>{place.city} • {place.country}</p>

                {liveCount > 0 && (
                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C6A55C', boxShadow: '0 0 10px #C6A55C' }} />
                        <span style={{ fontSize: "0.7rem", fontWeight: 900, color: "#C6A55C" }}>
                            {liveCount > 5 ? 'HIGH DEMAND' : `${liveCount} PLANNING NOW`}
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
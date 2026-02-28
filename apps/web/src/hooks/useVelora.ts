import { useState, useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPlacesPage } from "../api";
import { createWS } from "../ws";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export function useVeloura() {
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [activeTab, setActiveTab] = useState("COLLECTIONS");
    const wsRef = useRef<any>(null);

    // 1. WebSocket Connection Logic (Fixed for Mobile/Prod)
    useEffect(() => {
        // Automatically switches between ws:// and wss:// based on the API URL
        const WS_URL = API_BASE.replace(/^http/, "ws");
        const conn = createWS(WS_URL, (data: any) => {
            if (data?.type === "planning_count") {
                setCounts((prev) => ({ ...prev, [data.placeId]: data.count }));
            }
        });
        wsRef.current = conn;
        return () => conn.close();
    }, []);

    // 2. Infinite Query for Places
    const q = useInfiniteQuery({
        queryKey: ["places_v2"],
        initialPageParam: 0,
        queryFn: ({ pageParam }) => fetchPlacesPage(pageParam as number, 12),
        getNextPageParam: (last: any) => (last?.hasMore ? last?.nextCursor : undefined),
    });

    const allPlaces = useMemo(
        () => q.data?.pages?.flatMap((p: any) => p.items) ?? [],
        [q.data]
    );

    // 3. Tab Filtering (Concierge shows only active places)
    const filteredPlaces = useMemo(() => {
        if (activeTab === "COLLECTIONS") return allPlaces;
        return allPlaces.filter((p: any) => (counts[p.id] || 0) > 0);
    }, [allPlaces, activeTab, counts]);

    return {
        filteredPlaces,
        counts,
        activeTab,
        setActiveTab,
        wsSafeSend: wsRef.current?.safeSend,
        query: q
    };
}
import  { useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import PlaceCard from "../components/PlaceCard";

export default function PlacesGrid({ items, counts, wsSend, query, onSelect, activeTab }: any) {
    const parentRef = useRef<HTMLDivElement | null>(null);

    const v = useVirtualizer({
        count: items.length + (query.hasNextPage && activeTab === "COLLECTIONS" ? 1 : 0),
        getScrollElement: () => parentRef.current,
        estimateSize: () => 310, // Optimized for mobile card height
        overscan: 5,
    });

    // Infinite Scroll Trigger Logic
    useEffect(() => {
        const virtualItems = v.getVirtualItems();
        const lastItem = virtualItems[virtualItems.length - 1];
        if (!lastItem || activeTab !== "COLLECTIONS") return;

        if (lastItem.index >= items.length - 1 && query.hasNextPage && !query.isFetchingNextPage) {
            query.fetchNextPage();
        }
    }, [v.getVirtualItems(), items.length, query, activeTab]);

    return (
        <div ref={parentRef} style={{
            height: "calc(100vh - 180px)", // Dynamic height for mobile
            overflow: "auto",
            borderRadius: 24,
            background: "rgba(15,15,18,0.3)",
            border: "1px solid rgba(255,255,255,0.05)",
            scrollbarWidth: 'none'
        }}>
            <div style={{ height: v.getTotalSize(), position: "relative", width: "100%" }}>
                {v.getVirtualItems().map((row) => {
                    const isLoader = row.index >= items.length;
                    const place = items[row.index];

                    return (
                        <div key={row.key} style={{
                            position: "absolute", top: 0, left: 0, width: "100%",
                            transform: `translateY(${row.start}px)`, padding: "12px 16px"
                        }}>
                            {isLoader ? (
                                <div style={{ padding: 20, textAlign: 'center', color: '#444', fontSize: '0.7rem' }}>
                                    {query.isFetchingNextPage ? "CURATING..." : "END OF HORIZON"}
                                </div>
                            ) : (
                                <PlaceCard
                                    place={place}
                                    liveCount={counts[place.id] ?? 0}
                                    send={wsSend}
                                    onOpen={() => onSelect(place)}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
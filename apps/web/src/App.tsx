import { useVeloura } from "./hooks/useVelora";
import Header from "./components/Header";
import Hero from "./components/Hero"
import PlacesGrid from "./components/PlacesGrid";
import Drawer from "./Drawer"; // Or move to components/
import React from "react";

export default function App() {
    // 1. Pull everything from the "Brain"
    const { filteredPlaces, counts, activeTab, setActiveTab, wsSafeSend, query } = useVeloura();
    const [selected, setSelected] = React.useState(null);

    return (
        <div style={{ minHeight: "100vh", background: "#0B0B0D", color: "#F8F8F6" }}>
            <Header activeTab={activeTab} setActiveTab={setActiveTab} />
            
            <div className="split-layout"> 
                <Hero />
                <PlacesGrid 
                    items={filteredPlaces} 
                    counts={counts} 
                    wsSend={wsSafeSend} 
                    query={query} 
                    onSelect={setSelected}
                    activeTab={activeTab}
                />
            </div>

            <Drawer open={!!selected} onClose={() => setSelected(null)} place={selected} />
        </div>
    );
}
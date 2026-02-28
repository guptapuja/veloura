import { useVeloura } from "./hooks/useVelora";
import Header from "./components/Header";
import Hero from "./components/Hero"
import PlacesGrid from "./components/PlacesGrid";
import Drawer from "./Drawer"; 
import React from "react";

export default function App() {
    const { filteredPlaces, counts, activeTab, setActiveTab, wsSafeSend, query } = useVeloura();
    const [selected, setSelected] = React.useState(null);

return (
    <div style={{ height: "100vh", background: "#0B0B0D", color: "#F8F8F6", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* 🪄 MAGIC CSS: Forces stacking and scrolling on all mobile devices */}
        <style>{`
            .split-layout { 
                display: flex !important; 
                flex-direction: column !important; 
                align-items: center !important; 
                width: 100% !important;
            }
            main { 
                overflow-y: auto !important; 
                -webkit-overflow-scrolling: touch; 
            }
            @media (min-width: 1025px) {
                .split-layout { flex-direction: row !important; align-items: flex-start !important; }
            }
        `}</style>

        <main style={{ flex: 1, paddingTop: "90px" }}>
            <div className="split-layout" style={{ gap: '40px', padding: '0 20px 100px 20px' }}> 
                <Hero />
                <div style={{ width: '100%' }}>
                    <PlacesGrid 
                        items={filteredPlaces} 
                        counts={counts} 
                        wsSend={wsSafeSend} 
                        query={query} 
                        onSelect={setSelected}
                        activeTab={activeTab}
                    />
                </div>
            </div>
        </main>

        <Drawer open={!!selected} onClose={() => setSelected(null)} place={selected} />
    </div>
);
}
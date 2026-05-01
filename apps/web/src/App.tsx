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
        <div style={{ minHeight: "100vh", background: "#0B0B0D", color: "#F8F8F6", display: "flex", flexDirection: "column" }}>
            <Header activeTab={activeTab} setActiveTab={setActiveTab} />
            
            {/* 🪄 MAGIC CSS: Forces everything to stack and scroll correctly */}
            <style>{`
                .split-layout { 
                    display: flex !important; 
                    flex-direction: column !important; 
                    align-items: center !important; 
                    width: 100% !important;
                }
                main { 
                    flex: 1;
                    overflow-y: auto !important; 
                    -webkit-overflow-scrolling: touch; 
                    padding-top: 80px;
                }
            `}</style>

            <main>
                <div className="split-layout" style={{ gap: '20px', padding: '0 20px 100px 20px' }}> 
                    <Hero />
                    <div style={{ width: '100%', minHeight: '500px' }}>
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
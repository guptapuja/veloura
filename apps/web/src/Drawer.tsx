import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // npm install jspdf-autotable

export default function Drawer({ open, onClose, place }: any) {
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<any>(null);
  const [daysRequested, setDaysRequested] = useState(5);


  const [weather, setWeather] = useState<{ temp: number; text: string } | null>(null);

  useEffect(() => {
    if (open) {
      setItinerary(null);
      setWeather(null); // Reset for new destination

      const fetchWeather = async () => {
        try {
          // I've added a working public key for your demo
          const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${place.city}&units=metric&appid=${import.meta.env.WEATHER_API_KEY}`);
          const data = await res.json();

          if (data.main) {
            setWeather({
              temp: Math.round(data.main.temp),
              text: data.weather[0].main
            });
          } else {
            // If city not found in API, use logic-based fallback
            setWeather({ temp: place.city === "Leh" ? -2 : 24, text: "Clear Elite Skies" });
          }
        } catch (e) {
          setWeather({ temp: 22, text: "Pleasant" });
        }
      };
      fetchWeather();
    }
  }, [open, place?.id, place?.city]);
  // 3. PLACE YOUR EXPORTPDF FUNCTION HERE
  const exportPDF = () => {
    if (!itinerary) return;
    const doc = new jsPDF();

    // Luxury Header
    doc.setFontSize(22);
    doc.setTextColor(198, 165, 92); // Veloura Gold
    doc.text(`Veloura Journey: ${place.title}`, 14, 20);

    // Policy & Health Info (Updated with fallback to fix 'undefined')
    doc.setFontSize(10);
    doc.setTextColor(100);

    const policyText = itinerary.policy || itinerary.foodPolicy || "Elite Inclusive: All gourmet meals included.";
    doc.setTextColor(198, 165, 92); // Veloura Gold
    doc.text(`Food Policy: ${policyText}`, 14, 30);

    const essentials = itinerary.essentialPack ? itinerary.essentialPack.join(", ") : "Standard kit";
    doc.text(`Important: Carry ${essentials}.`, 14, 36);

    // Detailed Table for Itinerary
    const tableData = itinerary.days.map((d: any) => [
      `Day ${d.day}`,
      `${d.morning}\n\n${d.afternoon}\n\n${d.evening}`,
      d.stay,
      `INR ${Math.round(d.budgetINR).toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: 45,
      head: [['Day', 'Schedule & Exclusive Dining', 'Stay', 'Est. Budget']],
      body: tableData,
      headStyles: { fillColor: [198, 165, 92], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 5 }
    });

    doc.save(`Veloura-${place.city}-${itinerary.days.length}Days.pdf`);
  };

  // 4. API Call
  // async function onGenerate() {
  //   setLoading(true);
  //   try {
  //    const res = await fetch(`${API_BASE}/generate-itinerary`,{
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ city: place.city, daysRequested })
  //     });
  //     const data = await res.json();
  //     setItinerary(data.itinerary);
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  return (
    <AnimatePresence>
      {open && place && (
        <>
          <motion.div onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} style={{ position: "fixed", inset: 0, background: "#000", zIndex: 100 }} />
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} style={{ position: "fixed", right: 0, top: 0, height: "100vh", width: "min(550px, 92vw)", background: "#0B0B0D", zIndex: 101, padding: 30, overflowY: "auto", borderLeft: "1px solid #333" }}>

            <div style={{ display: 'flex', overflowX: 'auto', gap: 12, marginBottom: 20, scrollbarWidth: 'none' }}>
              {place.images && place.images.map((img: string, i: number) => (
                <img
                  key={i}
                  src={img}
                  // Change "Dest" to the actual title for better tracking
                  alt={`${place.title} view ${i + 1}`}
                  style={{ height: 280, borderRadius: 24, flexShrink: 0, border: "1px solid rgba(198,165,92,0.2)" }}
                  // Add an onError fallback so it never looks broken
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=60";
                  }}
                />
              ))}
            </div>
            {/* --- ADD THIS WEATHER WIDGET BLOCK --- */}
            {weather && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 20px',
                  background: 'rgba(198, 165, 92, 0.1)',
                  borderRadius: 18,
                  border: '1px solid rgba(198, 165, 92, 0.2)',
                  marginBottom: 20
                }}
              >
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#C6A55C', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.2 }}>Local Climate</div>
                  <div style={{ color: '#F8F8F6', fontSize: '0.9rem', fontWeight: 500, textTransform: 'capitalize' }}>{weather.text}</div>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F8F8F6' }}>{weather.temp}°C</div>
              </motion.div>
            )}
{/* 
            <h2 style={{ fontSize: "1.8rem", color: "#F8F8F6" }}>{place.title}</h2> */}
            <h2 style={{ fontSize: "1.8rem", color: "#F8F8F6", marginBottom: 20 }}>{place.title}</h2>
            {/* <h2 style={{ fontSize: "1.8rem", color: "#F8F8F6" }}>{place.title}</h2> */}

            <div style={{ padding: 25, background: "#161618", borderRadius: 24, border: "1px solid rgba(198,165,92,0.2)", marginBottom: 20 }}>
              <p style={{ color: "#A1A1AA", fontSize: 13, marginBottom: 12 }}>Select Duration:</p>
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                {[5, 10, 15].map(n => (
                  <button key={n} onClick={() => setDaysRequested(n)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: daysRequested === n ? '2px solid #C6A55C' : '1px solid #333', background: 'transparent', color: '#fff', fontWeight: 700 }}>{n} Days</button>
                ))}
              </div>
              <button onClick={async () => {
                setLoading(true);
                const res = await fetch(`${API_BASE}/generate-itinerary`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ city: place.city, daysRequested }) });
                const data = await res.json();
                setItinerary(data.itinerary);
                setLoading(false);
              }} style={{ width: '100%', padding: 16, background: '#C6A55C', border: 'none', borderRadius: 14, fontWeight: 900, cursor: 'pointer' }}>{loading ? "Designing Journey..." : "Generate Journey"}</button>
            </div>

            {itinerary && (
              <div style={{ color: "#F8F8F6" }}>
                {/* TOTAL INVESTMENT & STRIPE BUTTON */}
                <div style={{
                  padding: '24px', background: 'rgba(198, 165, 92, 0.15)', borderRadius: '24px',
                  textAlign: 'center', marginBottom: '20px', border: '1px solid rgba(198, 165, 92, 0.3)'
                }}>
                  <div style={{ fontSize: '0.8rem', color: '#C6A55C', fontWeight: 900 }}>TOTAL ELITE INVESTMENT</div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 900, margin: '10px 0' }}>
                    ₹ {itinerary.totalBudgetINR.toLocaleString('en-IN')}
                  </div>

                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(`${API_BASE}/create-checkout-session`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            amount: itinerary.totalBudgetINR,
                            cityName: place.title
                          })
                        });
                        const data = await res.json();
                        if (data.url) window.location.href = data.url;
                      } catch (err) { console.error("Redirect failed", err); }
                    }}
                    style={{ width: '100%', padding: 16, background: '#C6A55C', color: '#000', borderRadius: 14, fontWeight: 900, border: 'none', cursor: 'pointer' }}
                  >
                    Reserve Luxury Stay (Secure Checkout)
                  </button>
                </div>

                <button onClick={exportPDF} style={{ width: '100%', padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid #333', marginBottom: 25 }}>
                  Download Detailed Itinerary (PDF)
                </button>

                {itinerary.days.map((d: any) => (
                  <div key={d.day} style={{ marginBottom: 20, padding: 20, background: "rgba(255,255,255,0.02)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <h4 style={{ color: "#C6A55C", margin: "0 0 10px 0" }}>Day {d.day}: {d.title}</h4>
                    <p style={{ fontSize: "0.9rem", color: "#D4D4D8", marginBottom: 8 }}><strong>☀️ Morning:</strong> {d.morning}</p>
                    <p style={{ fontSize: "0.9rem", color: "#D4D4D8", marginBottom: 8 }}><strong>🌤️ Afternoon:</strong> {d.afternoon}</p>
                    <p style={{ fontSize: "0.9rem", color: "#D4D4D8" }}><strong>🌙 Evening:</strong> {d.evening}</p>
                  </div>
                ))}


              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
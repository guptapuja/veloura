// import { useState } from "react";

// export default function Checkout() {
//   const [loading, setLoading] = useState(false);

//   async function pay() {
//     setLoading(true);
//     const res = await fetch("http://localhost:8080/create-checkout-session", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ product: "premium_itinerary_pack" }),
//     });
//     const data = await res.json();
//     window.location.href = data.url; // Stripe Checkout url
//   }

//   return (
//     <div style={{ minHeight: "100vh", background: "#0B0B0D", color: "#F8F8F6", padding: 24 }}>
//       <div style={{ maxWidth: 720, margin: "0 auto" }}>
//         <h1 style={{ fontSize: 28 }}>Veloura Premium</h1>
//         <p style={{ color: "#A1A1AA" }}>
//           Unlock premium itineraries + downloadable packs + curated experiences.
//         </p>

//         <div style={{ marginTop: 16, padding: 16, borderRadius: 18, border: "1px solid rgba(255,255,255,0.12)" }}>
//           <div style={{ fontWeight: 700 }}>Premium Itinerary Pack</div>
//           <div style={{ color: "#A1A1AA", marginTop: 6 }}>₹199 (test mode)</div>

//           <button
//             onClick={pay}
//             disabled={loading}
//             style={{
//               marginTop: 14,
//               borderRadius: 14,
//               background: "#C6A55C",
//               border: "none",
//               color: "#0B0B0D",
//               padding: "10px 14px",
//               fontWeight: 700,
//               cursor: "pointer",
//             }}
//           >
//             {loading ? "Redirecting…" : "Pay with Stripe"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useRef, useState } from "react";

export default function Checkout() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // prevents double-click / double-call even if component rerenders
  const inFlightRef = useRef(false);

  async function pay() {
    if (inFlightRef.current) return; // ✅ stop double call
    inFlightRef.current = true;

    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: "premium_itinerary_pack" }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Checkout session failed");
      }

      const data = await res.json();
      if (!data?.url) throw new Error("No Stripe URL returned");

      // ✅ hard redirect to Stripe (no flashing inside SPA)
      window.location.assign(data.url);
    } catch (e: any) {
      console.error(e);
      setErr(e?.message || "Something went wrong");
      setLoading(false);
      inFlightRef.current = false; // allow retry if failed
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #1c1c1f, #0b0b0d)",
        color: "#F8F8F6",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginTop: 28 }}>
          <div style={{ fontSize: 34, fontWeight: 800 }}>Veloura Premium</div>
          <div style={{ color: "#A1A1AA", marginTop: 10 }}>
            Unlock premium itineraries + downloadable packs + curated experiences.
          </div>
        </div>

        <div
          style={{
            margin: "28px auto 0",
            padding: 18,
            maxWidth: 720,
            borderRadius: 22,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(10,10,12,0.35)",
            backdropFilter: "blur(14px)",
            boxShadow: "0 20px 70px rgba(0,0,0,0.55)",
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 18 }}>Premium Itinerary Pack</div>
          <div style={{ color: "#A1A1AA", marginTop: 6 }}>₹199 (test mode)</div>

          {err && (
            <div style={{ marginTop: 12, color: "#ffb4b4", fontSize: 13 }}>
              {err}
            </div>
          )}

          <button
            onClick={pay}
            disabled={loading}
            style={{
              marginTop: 14,
              borderRadius: 14,
              background: "linear-gradient(45deg,#C6A55C,#E6C77A)",
              border: "none",
              color: "#0B0B0D",
              padding: "12px 16px",
              fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.75 : 1,
            }}
          >
            {loading ? "Redirecting to Stripe…" : "Pay with Stripe"}
          </button>

          <div style={{ marginTop: 14, color: "#6B7280", fontSize: 12 }}>
            Tip: If it still “flashes”, open DevTools → Network and confirm only ONE
            request is sent to <code>/create-checkout-session</code>.
          </div>
        </div>
      </div>
    </div>
  );
}
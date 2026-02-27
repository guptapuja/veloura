import { useState } from "react";
import { generateItinerary } from "./api";

export default function Planner() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    const res = await generateItinerary(prompt);
    setResult(res.itinerary);
    setLoading(false);
  }

  return (
    <div style={{ marginTop: 24 }}>
      <h2>AI Travel Planner</h2>

      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="5 days luxury Bali under 2 lakh"
        style={{ padding: 8, width: "60%" }}
      />

      <button onClick={handleGenerate} style={{ marginLeft: 12 }}>
        {loading ? "Generating..." : "Generate"}
      </button>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h3>{result.title}</h3>
          {result.days.map((d: any) => (
            <div key={d.day}>
              <strong>Day {d.day}: {d.title}</strong>
              <ul>
                {d.items.map((i: string) => <li key={i}>{i}</li>)}
              </ul>
            </div>
          ))}
        </div>
        )}
      </div>)
}
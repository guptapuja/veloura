
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <div style={{ flex: 1, padding: '100px 0', position: 'sticky', top: 80, height: 'fit-content' }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 900, lineHeight: 1, margin: 0, letterSpacing: '-3px' }}>
                VELOURA <span style={{ color: '#C6A55C' }}>ELITE</span>
            </h2>
            <p style={{ color: '#A1A1AA', fontSize: '1.1rem', marginTop: 25, maxWidth: 380, lineHeight: 1.6 }}>
                Clandestine journeys for the modern pioneer. Curated by AI, reserved for the few.
            </p>
            <div style={{ marginTop: 40, height: 2, width: 60, background: '#C6A55C' }} />
        </motion.div>
    </div>
  );
}

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  return (
<header style={{
    position: 'fixed', // Standard for Elite navigation
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999, // Absolute top layer
    background: 'rgba(11, 11, 13, 0.95)',
    backdropFilter: 'blur(15px)',
    height: '70px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 40px'
}}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: '1.2rem', margin: 0, color: '#C6A55C', fontWeight: 900, letterSpacing: '-1px' }}>VELOURA</h1>
            <span style={{ fontSize: '0.55rem', border: '1px solid #C6A55C', padding: '1px 5px', borderRadius: 4, color: '#C6A55C', fontWeight: 900 }}>ELITE</span>
        </div>

        <nav style={{ display: 'flex', gap: 20, fontSize: '0.7rem', fontWeight: 800, letterSpacing: '1px' }}>
            <button
                onClick={() => setActiveTab("COLLECTIONS")}
                style={{
                    background: 'none', border: 'none', cursor: 'pointer', height: '44px', // Mobile friendly height
                    color: activeTab === "COLLECTIONS" ? '#C6A55C' : '#666',
                    borderBottom: activeTab === "COLLECTIONS" ? '2px solid #C6A55C' : 'none',
                    transition: '0.3s'
                }}
            >COLLECTIONS</button>
            <button
                onClick={() => setActiveTab("CONCIERGE")}
                style={{
                    background: 'none', border: 'none', cursor: 'pointer', height: '44px',
                    color: activeTab === "CONCIERGE" ? '#C6A55C' : '#666',
                    borderBottom: activeTab === "CONCIERGE" ? '2px solid #C6A55C' : 'none',
                    transition: '0.3s'
                }}
            >CONCIERGE</button>
        </nav>

        <div style={{ 
            width: 32, height: 32, borderRadius: '50%', background: '#C6A55C', 
            display: 'flex', justifyContent: 'center', alignItems: 'center', 
            fontWeight: 'bold', color: '#000', fontSize: '0.7rem' 
        }}>PG</div>
    </header>
  );
}
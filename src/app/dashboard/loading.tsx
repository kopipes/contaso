export default function DashboardLoading() {
  const shimmer = {
    background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
    borderRadius: 8,
  } as React.CSSProperties;

  return (
    <div style={{ display: "flex", minHeight: "100svh" }}>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>Contaso</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <a href="/dashboard" className="sidebar-nav-item active">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Dashboard
          </a>
        </nav>
      </aside>

      {/* Main */}
      <div className="main-shell" style={{ flex: 1 }}>
        <header className="page-header">
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ ...shimmer, width: 140, height: 16 }} />
            <div style={{ ...shimmer, width: 100, height: 12 }} />
          </div>
        </header>

        <main className="page-content">
          <div style={{ marginBottom: 12 }}>
            <div style={{ ...shimmer, width: 80, height: 11, marginBottom: 12 }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div style={{ ...shimmer, width: 44, height: 44, borderRadius: 12 }} />
                    <div style={{ ...shimmer, width: 70, height: 20, borderRadius: 999 }} />
                  </div>
                  <div style={{ ...shimmer, width: "70%", height: 14, marginBottom: 10 }} />
                  <div style={{ ...shimmer, width: 60, height: 12 }} />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

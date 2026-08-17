export default function AccountDetailLoading() {
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
          <a href="/dashboard" className="sidebar-nav-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Dashboard
          </a>
        </nav>
      </aside>

      {/* Main */}
      <div className="main-shell" style={{ flex: 1 }}>
        {/* Header skeleton */}
        <header className="page-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ ...shimmer, width: 32, height: 32, borderRadius: 8 }} />
            <div style={{ ...shimmer, width: 36, height: 36, borderRadius: 10 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ ...shimmer, width: 160, height: 14 }} />
              <div style={{ ...shimmer, width: 100, height: 11 }} />
            </div>
          </div>
        </header>

        <main className="page-content">
          {/* Stat cards skeleton */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16, marginBottom: 28 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="stat-card">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ ...shimmer, width: 70, height: 12 }} />
                  <div style={{ ...shimmer, width: 20, height: 20, borderRadius: 4 }} />
                </div>
                <div style={{ ...shimmer, width: 80, height: 28 }} />
              </div>
            ))}
          </div>

          {/* Tab card skeleton */}
          <div className="card" style={{ overflow: "hidden" }}>
            {/* Tab bar */}
            <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", padding: "0 4px" }}>
              {["Komentar", "Chat"].map((t) => (
                <div key={t} style={{ padding: "12px 20px" }}>
                  <div style={{ ...shimmer, width: 60, height: 13 }} />
                </div>
              ))}
            </div>

            {/* Content skeleton */}
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
                  {/* Group header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#f8fafc" }}>
                    <div style={{ ...shimmer, width: 48, height: 48, borderRadius: 8, flexShrink: 0 }} />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <div style={{ ...shimmer, width: 50, height: 20, borderRadius: 999 }} />
                        <div style={{ ...shimmer, width: 70, height: 20, borderRadius: 999 }} />
                      </div>
                      <div style={{ ...shimmer, width: "60%", height: 12 }} />
                    </div>
                  </div>
                  {/* Items */}
                  {i === 0 && (
                    <div style={{ padding: "0 16px" }}>
                      {[...Array(2)].map((_, j) => (
                        <div key={j} style={{ padding: "14px 0", borderBottom: j < 1 ? "1px solid #f1f5f9" : "none", display: "flex", gap: 10 }}>
                          <div style={{ ...shimmer, width: 32, height: 32, borderRadius: "50%", flexShrink: 0 }} />
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                            <div style={{ ...shimmer, width: 120, height: 13 }} />
                            <div style={{ ...shimmer, width: "80%", height: 13 }} />
                            <div style={{ ...shimmer, width: 80, height: 11 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

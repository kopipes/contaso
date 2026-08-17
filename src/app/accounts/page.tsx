import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import AccountGrid from "@/app/dashboard/AccountGrid";
import AutoRefresh from "@/app/components/AutoRefresh";
import Sidebar from "@/app/components/Sidebar";
import SyncButton from "@/app/components/SyncButton";

export default async function AccountsPage() {
  const session = await verifySession();

  const accounts = await db.trackedAccount.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  const visibleCount = accounts.filter((a) => a.isVisible).length;

  return (
    <div style={{ display: "flex", minHeight: "100svh" }}>
      <Sidebar session={session} />

      <div className="main-shell" style={{ flex: 1 }}>
        <header className="page-header">
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", margin: 0 }}>Akun Sosial Media</h1>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, marginTop: 1 }}>
              {visibleCount} dari {accounts.length} akun aktif
            </p>
          </div>
          {session.role === "ADMIN" && (
            <SyncButton />
          )}
        </header>

        <main className="page-content">
          {accounts.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "80px 20px",
              background: "#ffffff", borderRadius: 16,
              border: "1px solid #e2e8f0",
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16, background: "#f1f5f9",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                </svg>
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#334155", margin: "0 0 6px" }}>Belum ada akun</p>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
                Jalankan <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4, fontSize: 12 }}>npm run sync</code> untuk sinkronisasi akun dari Repliz
              </p>
            </div>
          ) : (
            <AccountGrid accounts={accounts} isAdmin={session.role === "ADMIN"} />
          )}
        </main>
      </div>

      <AutoRefresh intervalMs={30_000} />
    </div>
  );
}

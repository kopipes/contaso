import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import Link from "next/link";
import Sidebar from "@/app/components/Sidebar";
import AutoRefresh from "@/app/components/AutoRefresh";
import SyncButton from "@/app/components/SyncButton";

import type { ReplizContent } from "@/lib/repliz";

const PLATFORM_CONFIG: Record<string, { label: string; gradient: string }> = {
  instagram: { label: "Instagram", gradient: "135deg, #ec4899, #8b5cf6" },
  facebook:  { label: "Facebook",  gradient: "135deg, #3b82f6, #1d4ed8" },
  threads:   { label: "Threads",   gradient: "135deg, #475569, #1e293b" },
  tiktok:    { label: "TikTok",    gradient: "135deg, #0f172a, #334155" },
  youtube:   { label: "YouTube",   gradient: "135deg, #ef4444, #b91c1c" },
  linkedin:  { label: "LinkedIn",  gradient: "135deg, #0ea5e9, #0369a1" },
};

export default async function DashboardPage() {
  const session = await verifySession();

  // Single DB query — instant, no external API calls
  const accounts = await db.trackedAccount.findMany({
    where: { isVisible: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { statsCache: true, contentCache: true },
  });

  const totalAccounts = accounts.length;
  const cachedCount = accounts.filter((a) => a.statsCache).length;

  return (
    <div style={{ display: "flex", minHeight: "100svh" }}>
      <Sidebar session={session} />

      <div className="main-shell" style={{ flex: 1 }}>
        <header className="page-header">
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", margin: 0 }}>Dashboard</h1>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, marginTop: 1 }}>
              {totalAccounts} akun aktif · diperbarui saat sync
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {cachedCount < totalAccounts && (
              <span style={{ fontSize: 11, color: "#f59e0b", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, padding: "3px 8px" }}>
                {totalAccounts - cachedCount} akun belum tersync
              </span>
            )}
            {session.role === "ADMIN" && <SyncButton />}
          </div>
        </header>

        <main className="page-content">
          {accounts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px", background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0" }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#334155", margin: "0 0 6px" }}>Belum ada akun aktif</p>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 16px" }}>Tambahkan dan aktifkan akun terlebih dahulu</p>
              <Link href="/accounts" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 16px", background: "#4f46e5", color: "#fff",
                borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: "none",
              }}>
                Kelola Akun →
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              {accounts.map((acc) => {
                const platform = PLATFORM_CONFIG[acc.platform] ?? { label: acc.platform, gradient: "135deg, #64748b, #334155" };
                const stats = acc.statsCache ? JSON.parse(acc.statsCache.data) as Record<string, unknown> : null;
                const cachedAt = acc.statsCache?.cachedAt;

                // Latest post date from content cache
                const contents = acc.contentCache ? JSON.parse(acc.contentCache.data) as ReplizContent[] : [];
                const latestPost = contents.reduce<string | null>((latest, c) => {
                  if (!c.createdAt) return latest;
                  if (!latest) return c.createdAt;
                  return c.createdAt > latest ? c.createdAt : latest;
                }, null);

                const statItems = [
                  { label: "Reach",        value: stats?.reach },
                  { label: "Views",        value: stats?.views },
                  { label: "Likes",        value: stats?.likes },
                  { label: "Interaksi",    value: stats?.totalInteractions },
                ];

                return (
                  <div key={acc.id} className="card" style={{ overflow: "hidden" }}>
                    {/* Account header */}
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "14px 20px",
                      background: `linear-gradient(${platform.gradient})`,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                          background: "rgba(255,255,255,0.15)",
                          border: "1.5px solid rgba(255,255,255,0.2)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 16, fontWeight: 700, color: "#fff",
                        }}>
                          {acc.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#fff" }}>{acc.name}</p>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                            <span style={{
                              fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
                              padding: "1px 6px", borderRadius: 999,
                              background: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.9)",
                            }}>
                              {platform.label.toUpperCase()}
                            </span>
                            {cachedAt && (
                              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>
                                diperbarui {new Date(cachedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Link href={`/accounts/${acc.id}`} style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "6px 12px",
                        background: "rgba(255,255,255,0.15)",
                        border: "1px solid rgba(255,255,255,0.25)",
                        borderRadius: 8, fontSize: 12, fontWeight: 500,
                        color: "#fff", textDecoration: "none",
                        backdropFilter: "blur(4px)",
                      }}>
                        Kelola
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="9,18 15,12 9,6"/>
                        </svg>
                      </Link>
                    </div>

                    {/* Stats from cache */}
                    {!stats ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", background: "#f8fafc" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>
                          Stats belum tersedia — jalankan <code style={{ background: "#e2e8f0", padding: "1px 5px", borderRadius: 4, fontSize: 11 }}>npm run sync</code>
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
                        {statItems.map((stat, i) => (
                          <div key={stat.label} style={{
                            padding: "14px 20px",
                            borderRight: i < 3 ? "1px solid #f1f5f9" : "none",
                          }}>
                            <p style={{ margin: "0 0 4px", fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{stat.label}</p>
                            <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>
                              {stat.value != null
                                ? Number(stat.value).toLocaleString("id-ID")
                                : <span style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 400 }}>—</span>
                              }
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Latest post date */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "8px 20px",
                      borderTop: "1px solid #f1f5f9",
                      background: "#fafafa",
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>Post terakhir:</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: latestPost ? "#475569" : "#cbd5e1" }}>
                        {latestPost
                          ? new Date(latestPost).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                          : "—"
                        }
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <AutoRefresh intervalMs={60_000} />
    </div>
  );
}

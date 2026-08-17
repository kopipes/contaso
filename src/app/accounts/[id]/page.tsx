import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import type { ReplizComment, ReplizChat, ReplizContent } from "@/lib/repliz";
import CommentsTab from "./CommentsTab";
import ChatTab from "./ChatTab";
import ContentTab from "./ContentTab";
import AutoRefresh from "@/app/components/AutoRefresh";
import Sidebar from "@/app/components/Sidebar";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

const PLATFORM_CONFIG: Record<string, { label: string; color: string }> = {
  instagram: { label: "Instagram", color: "#ec4899" },
  facebook:  { label: "Facebook",  color: "#3b82f6" },
  threads:   { label: "Threads",   color: "#64748b" },
  tiktok:    { label: "TikTok",    color: "#0f172a" },
  youtube:   { label: "YouTube",   color: "#ef4444" },
  linkedin:  { label: "LinkedIn",  color: "#0ea5e9" },
};

export default async function AccountDetailPage({ params, searchParams }: Props) {
  const session = await verifySession();
  const { id } = await params;
  const { tab = "comments" } = await searchParams;

  // Single DB query — reads from cache, no external API calls
  const account = await db.trackedAccount.findUnique({
    where: { id },
    include: { statsCache: true, commentsCache: true, chatsCache: true, contentCache: true },
  });
  if (!account) notFound();

  const platform = PLATFORM_CONFIG[account.platform] ?? { label: account.platform, color: "#64748b" };

  const stats = account.statsCache ? JSON.parse(account.statsCache.data) as Record<string, unknown> : null;
  const comments = account.commentsCache ? JSON.parse(account.commentsCache.data) as ReplizComment[] : [];
  const chats = account.chatsCache ? JSON.parse(account.chatsCache.data) as ReplizChat[] : [];
  const contents = account.contentCache ? JSON.parse(account.contentCache.data) as ReplizContent[] : [];

  // Komentar yang sudah dibalas via Contaso
  const repliedLogs = await db.replyLog.findMany({
    where: { trackedAccountId: account.id, type: "comment" },
    select: { externalId: true },
  });
  const repliedCommentIds = new Set(repliedLogs.map(r => r.externalId));
  const cachedAt = account.statsCache?.cachedAt ?? account.commentsCache?.cachedAt;
  const statsError = !stats;

  const statCards = [
    { label: "Reach",      value: stats?.reach,             icon: "📡" },
    { label: "Views",      value: stats?.views,             icon: "👁️" },
    { label: "Likes",      value: stats?.likes,             icon: "❤️" },
    { label: "Interaksi",  value: stats?.totalInteractions, icon: "⚡" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100svh" }}>
      <Sidebar session={session} />

      {/* Main */}
      <div className="main-shell" style={{ flex: 1 }}>
        {/* Page header */}
        <header className="page-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/accounts" style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 32, height: 32, borderRadius: 8,
              background: "#f8fafc", border: "1px solid #e2e8f0",
              color: "#64748b", textDecoration: "none",
              transition: "background 150ms",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15,18 9,12 15,6"/>
              </svg>
            </Link>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: `linear-gradient(135deg, ${platform.color}22, ${platform.color}44)`,
              border: `1.5px solid ${platform.color}33`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 700, color: platform.color,
            }}>
              {account.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h1 style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", margin: 0 }}>{account.name}</h1>
                <span style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
                  padding: "2px 7px", borderRadius: 999,
                  background: `${platform.color}15`, color: platform.color,
                }}>
                  {platform.label.toUpperCase()}
                </span>
              </div>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>@{account.replizId.slice(0, 12)}…</p>
            </div>
          </div>
        </header>

        <main className="page-content">
          {/* Stats */}
          {!statsError && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16, marginBottom: 28 }}>
              {statCards.map((s) => (
                <div key={s.label} className="stat-card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>{s.label}</span>
                    <span style={{ fontSize: 18 }}>{s.icon}</span>
                  </div>
                  <p style={{ fontSize: 26, fontWeight: 700, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
                    {s.value != null ? Number(s.value).toLocaleString("id-ID") : "—"}
                  </p>
                </div>
              ))}
            </div>
          )}

          {statsError && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 16px", borderRadius: 10, marginBottom: 24,
              background: "#fffbeb", border: "1px solid #fde68a",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{ fontSize: 13, color: "#92400e" }}>Tidak dapat memuat statistik. Repliz API mungkin sedang tidak tersedia.</span>
            </div>
          )}

          {/* Tab content card */}
          <div className="card" style={{ overflow: "hidden" }}>
            {/* Tab bar */}
            <div className="tab-bar" style={{ padding: "0 4px" }}>
              <Link href={`/accounts/${id}?tab=comments`} className={`tab-item ${tab === "comments" ? "active" : ""}`}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  Komentar
                  {comments.length > 0 && <span style={{ background: "#4f46e5", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 999 }}>{comments.length}</span>}
                </span>
              </Link>
              <Link href={`/accounts/${id}?tab=chat`} className={`tab-item ${tab === "chat" ? "active" : ""}`}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                  Chat
                  {chats.length > 0 && <span style={{ background: "#4f46e5", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 999 }}>{chats.length}</span>}
                </span>
              </Link>
              <Link href={`/accounts/${id}?tab=content`} className={`tab-item ${tab === "content" ? "active" : ""}`}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                  Konten
                  {contents.length > 0 && <span style={{ background: "#4f46e5", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 999 }}>{contents.length}</span>}
                </span>
              </Link>
            </div>

            {/* Tab content */}
            <div style={{ padding: 20, overflow: "hidden", maxWidth: "100%" }}>
              {tab === "comments" && <CommentsTab accountId={account.id} comments={comments} repliedIds={repliedCommentIds} />}
              {tab === "chat" && <ChatTab accountId={account.id} chats={chats} unavailable={false} />}
              {tab === "content" && <ContentTab contents={contents} />}
            </div>
          </div>
        </main>
      </div>

      <AutoRefresh intervalMs={30_000} />
    </div>
  );
}

'use client'

import type { ReplizContent } from "@/lib/repliz";

type Props = {
  contents: ReplizContent[];
};

const CONTENT_TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  video:    { label: "Video",    color: "#7c3aed", icon: "🎬" },
  image:    { label: "Foto",     color: "#0369a1", icon: "🖼️" },
  album:    { label: "Album",    color: "#0891b2", icon: "📸" },
  reel:     { label: "Reel",     color: "#db2777", icon: "🎵" },
  story:    { label: "Story",    color: "#d97706", icon: "⭐" },
};

function getConfig(type: string) {
  return CONTENT_TYPE_CONFIG[type] ?? { label: type, color: "#64748b", icon: "📄" };
}

function ContentCard({ content }: { content: ReplizContent }) {
  const cfg = getConfig(content.type);
  const thumbnail = content.medias?.[0]?.thumbnail;
  const caption = content.description?.trim();
  const date = content.createdAt
    ? new Date(content.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    : "";

  return (
    <div style={{
      border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden",
      background: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      display: "flex", flexDirection: "column",
    }}>
      {/* Thumbnail */}
      <div style={{ position: "relative", aspectRatio: "1", background: "#f1f5f9", overflow: "hidden" }}>
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt={caption?.slice(0, 50) ?? content.type}
            referrerPolicy="no-referrer"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
            {cfg.icon}
          </div>
        )}
        {/* Type badge overlay */}
        <div style={{
          position: "absolute", top: 8, left: 8,
          fontSize: 10, fontWeight: 600, letterSpacing: "0.04em",
          padding: "2px 7px", borderRadius: 999,
          background: "rgba(0,0,0,0.55)", color: "#ffffff",
          backdropFilter: "blur(4px)",
        }}>
          {cfg.icon} {cfg.label}
        </div>
        {/* External link */}
        {content.url && (
          <a
            href={content.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: "absolute", top: 8, right: 8,
              width: 28, height: 28, borderRadius: 8,
              background: "rgba(0,0,0,0.55)", color: "#ffffff",
              display: "flex", alignItems: "center", justifyContent: "center",
              textDecoration: "none", backdropFilter: "blur(4px)",
              transition: "background 150ms",
            }}
            title="Lihat di Instagram"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15,3 21,3 21,9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "10px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        {caption ? (
          <p style={{
            margin: 0, fontSize: 12, color: "#334155", lineHeight: 1.4,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {caption}
          </p>
        ) : (
          <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>Tanpa caption</p>
        )}
        <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", marginTop: "auto", paddingTop: 4 }}>{date}</p>
      </div>
    </div>
  );
}

export default function ContentTab({ contents }: Props) {
  if (contents.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "48px 20px" }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, background: "#f1f5f9",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 12px", fontSize: 22,
        }}>
          📸
        </div>
        <p style={{ fontSize: 14, fontWeight: 500, color: "#475569", margin: "0 0 4px" }}>Belum ada konten</p>
        <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>Jalankan sync untuk memuat konten terbaru</p>
      </div>
    );
  }

  // Count by type
  const typeCounts = contents.reduce((acc, c) => {
    acc[c.type] = (acc[c.type] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      {/* Type filter summary */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500, alignSelf: "center" }}>
          {contents.length} konten:
        </span>
        {Object.entries(typeCounts).map(([type, count]) => {
          const cfg = getConfig(type);
          return (
            <span key={type} style={{
              fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999,
              background: cfg.color + "15", color: cfg.color,
              border: `1px solid ${cfg.color}22`,
            }}>
              {cfg.icon} {cfg.label} · {count}
            </span>
          );
        })}
      </div>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
        gap: 12,
      }}>
        {contents.map((c) => (
          <ContentCard key={c.id} content={c} />
        ))}
      </div>
    </div>
  );
}

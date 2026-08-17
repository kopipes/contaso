'use client'

import { useActionState, useState } from "react";
import { replyCommentAction, type ReplyState } from "@/app/actions/replies";
import type { ReplizComment } from "@/lib/repliz";

type Props = { accountId: string; comments: ReplizComment[] };

const CONTENT_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  video:    { label: "Video",    color: "#7c3aed" },
  image:    { label: "Foto",     color: "#0369a1" },
  carousel: { label: "Carousel", color: "#0891b2" },
  reel:     { label: "Reel",     color: "#db2777" },
  story:    { label: "Story",    color: "#d97706" },
};

type PostGroup = {
  contentId: string; contentType: string; description: string;
  thumbnail?: string; url?: string; comments: ReplizComment[];
};

function groupByPost(comments: ReplizComment[]): PostGroup[] {
  const map = new Map<string, PostGroup>();
  for (const c of comments) {
    const id = c.content?.id ?? "__unknown__";
    if (!map.has(id)) {
      map.set(id, {
        contentId: id, contentType: c.content?.type ?? "",
        description: c.content?.description?.trim() ?? "",
        thumbnail: c.content?.medias?.[0]?.thumbnail,
        url: c.content?.url, comments: [],
      });
    }
    map.get(id)!.comments.push(c);
  }
  return Array.from(map.values());
}

function CommentItem({ comment, accountId }: { comment: ReplizComment; accountId: string }) {
  const [open, setOpen] = useState(false);
  const boundAction = replyCommentAction.bind(null, accountId, comment._id);
  const [state, formAction, isPending] = useActionState<ReplyState, FormData>(boundAction, {});

  return (
    <div style={{
      padding: "14px 0",
      borderBottom: "1px solid #f1f5f9",
      minWidth: 0, overflow: "hidden",
    }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", minWidth: 0 }}>
        {/* Avatar */}
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700, color: "#fff",
        }}>
          {comment.comment.owner.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{comment.comment.owner.name}</span>
              <span style={{ fontSize: 11, color: "#cbd5e1" }}>
                {new Date(comment.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            {!state.success && (
              <button onClick={() => setOpen(v => !v)} style={{
                fontSize: 12, fontWeight: 500, color: "#4f46e5",
                background: open ? "#eef2ff" : "transparent",
                border: "1px solid " + (open ? "#c7d2fe" : "transparent"),
                borderRadius: 6, padding: "3px 10px", cursor: "pointer",
                transition: "all 150ms", flexShrink: 0,
              }}>
                {open ? "Batal" : "Balas"}
              </button>
            )}
          </div>
          <p style={{ fontSize: 13, color: "#334155", margin: "4px 0 0", lineHeight: 1.5 }}>{comment.comment.text}</p>

          {state.success && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
              <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 500 }}>Balasan terkirim</span>
            </div>
          )}

          {open && !state.success && (
            <form action={formAction} style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input name="message" type="text" required maxLength={2000}
                placeholder="Tulis balasan..."
                style={{
                  flex: 1, padding: "8px 12px", fontSize: 13, color: "#0f172a",
                  background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 8,
                  outline: "none", transition: "border-color 150ms",
                }}
                onFocus={e => e.currentTarget.style.borderColor = "#6366f1"}
                onBlur={e => e.currentTarget.style.borderColor = "#e2e8f0"}
              />
              <button type="submit" disabled={isPending} style={{
                padding: "8px 16px", fontSize: 13, fontWeight: 600, color: "#fff",
                background: "#4f46e5", border: "none", borderRadius: 8,
                cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.6 : 1,
                boxShadow: "0 1px 3px rgba(79,70,229,0.3)", transition: "all 150ms", flexShrink: 0,
              }}>
                {isPending ? "..." : "Kirim"}
              </button>
            </form>
          )}
          {state.error && <p style={{ fontSize: 12, color: "#ef4444", marginTop: 6 }}>{state.error}</p>}
        </div>
      </div>
    </div>
  );
}

function PostGroupCard({ group, accountId, defaultOpen }: { group: PostGroup; accountId: string; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [thumbError, setThumbError] = useState(false);
  const cfg = CONTENT_TYPE_CONFIG[group.contentType] ?? { label: group.contentType, color: "#64748b" };

  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
      {/* Group header */}
      <button onClick={() => setOpen(v => !v)} aria-expanded={open} style={{
        width: "100%", display: "flex", alignItems: "center", gap: 12,
        padding: "12px 16px", background: "#f8fafc",
        borderTop: "none", borderLeft: "none", borderRight: "none",
        borderBottom: open ? "1px solid #e2e8f0" : "none",
        cursor: "pointer", textAlign: "left",
        transition: "background 150ms",
      }}
        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#f1f5f9"}
        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc"}
      >
        {/* Thumbnail */}
        {group.thumbnail && !thumbError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={group.thumbnail} alt="" referrerPolicy="no-referrer" onError={() => setThumbError(true)} style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", flexShrink: 0, border: "1px solid #e2e8f0" }} />
        ) : (
          <div style={{ width: 48, height: 48, borderRadius: 8, background: "#e2e8f0", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9l4-4 4 4 4-4 4 4"/></svg>
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
              background: cfg.color + "15", color: cfg.color,
            }}>{cfg.label}</span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "#f1f5f9", color: "#475569" }}>
              {group.comments.length} komentar
            </span>
            {group.url && (
              <a href={group.url} target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                style={{ fontSize: 11, color: "#4f46e5", textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}>
                Lihat post
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            )}
          </div>
          {group.description && (
            <p style={{ fontSize: 12, color: "#64748b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{group.description}</p>
          )}
        </div>

        <svg style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms", color: "#94a3b8" }}
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      </button>

      {open && (
        <div style={{ padding: "0 16px", background: "#ffffff" }}>
          {group.comments.map((c, i) => (
            <div key={c._id} style={{ borderBottom: i < group.comments.length - 1 ? undefined : "none" }}>
              <CommentItem comment={c} accountId={accountId} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentsTab({ accountId, comments }: Props) {
  if (comments.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "48px 20px" }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        </div>
        <p style={{ fontSize: 14, fontWeight: 500, color: "#475569", margin: "0 0 4px" }}>Tidak ada komentar pending</p>
        <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>Komentar baru akan muncul di sini</p>
      </div>
    );
  }

  const groups = groupByPost(comments);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {groups.map((g, i) => (
        <PostGroupCard key={g.contentId} group={g} accountId={accountId} defaultOpen={i === 0} />
      ))}
    </div>
  );
}

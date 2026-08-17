'use client'

import { useActionState, useState } from "react";
import { sendChatAction, type ReplyState } from "@/app/actions/replies";
import type { ReplizChat } from "@/lib/repliz";
import ChatThread from "./ChatThread";

type Props = { accountId: string; chats: ReplizChat[]; unavailable: boolean; repliedIds: Set<string> };

const MESSAGE_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string; preview: string }> = {
  text:          { label: "DM Langsung",    color: "#2563eb", bg: "#eff6ff",  icon: "💬", preview: "" },
  image:         { label: "Kirim Foto",     color: "#0369a1", bg: "#f0f9ff",  icon: "🖼️", preview: "Mengirim sebuah foto" },
  video:         { label: "Kirim Video",    color: "#7c3aed", bg: "#f5f3ff",  icon: "🎬", preview: "Mengirim sebuah video" },
  ig_post:       { label: "Share Post",     color: "#ec4899", bg: "#fdf2f8",  icon: "📱", preview: "Membagikan sebuah post" },
  story_mention: { label: "Story Mention",  color: "#d97706", bg: "#fffbeb",  icon: "⭐", preview: "Menyebut kamu di story" },
  story_reply:   { label: "Reply Story",    color: "#9333ea", bg: "#faf5ff",  icon: "📖", preview: "Membalas story kamu" },
  reel:          { label: "Kirim Reel",     color: "#db2777", bg: "#fdf2f8",  icon: "🎵", preview: "Mengirim sebuah reel" },
  share:         { label: "Share Konten",   color: "#0891b2", bg: "#f0fdfa",  icon: "↗️", preview: "Berbagi sebuah konten" },
  unsupported_type: { label: "Pesan Lain", color: "#64748b", bg: "#f8fafc",  icon: "📎", preview: "Pesan tidak didukung" },
};

function getOriginConfig(type: string) {
  return MESSAGE_TYPE_CONFIG[type] ?? { label: type, color: "#64748b", bg: "#f8fafc", icon: "💬" };
}

function ChatItem({ chat, accountId, onOpenThread, isReplied }: { chat: ReplizChat; accountId: string; onOpenThread: (chat: ReplizChat) => void; isReplied: boolean }) {
  const [open, setOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const boundAction = sendChatAction.bind(null, accountId, chat._id);
  const [state, formAction, isPending] = useActionState<ReplyState, FormData>(boundAction, {});
  const msgType = chat.lastMessage?.type ?? "text";
  const origin = getOriginConfig(msgType);

  return (
    <div style={{ padding: "14px 0", borderBottom: "1px solid #f1f5f9", minWidth: 0, overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", minWidth: 0 }}>
        {/* Avatar */}
        {chat.senderPicture && !avatarError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={chat.senderPicture} alt={chat.senderName} referrerPolicy="no-referrer"
            onError={() => setAvatarError(true)}
            style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid #e2e8f0" }} />
        ) : (
          <div style={{
            width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "#fff",
          }}>
            {chat.senderName.charAt(0).toUpperCase()}
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
          {/* Row 1: name + unread + time + buttons */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0, overflow: "hidden" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {chat.senderName}
              </span>
              {chat.unreadCount > 0 && (
                <span style={{
                  minWidth: 18, height: 18, borderRadius: 999,
                  background: "#4f46e5", color: "#fff",
                  fontSize: 10, fontWeight: 700,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  padding: "0 5px", flexShrink: 0,
                }}>
                  {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
                </span>
              )}
              {(isReplied || state.success) && (
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 999,
                  background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0",
                  display: "inline-flex", alignItems: "center", gap: 3, flexShrink: 0,
                }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                  Dibalas
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: "#cbd5e1", whiteSpace: "nowrap" }}>
                {chat.lastMessage?.fromSenderAt
                  ? new Date(chat.lastMessage.fromSenderAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                  : ""}
              </span>
              {/* Open thread button */}
              <button onClick={() => onOpenThread(chat)} style={{
                fontSize: 11, fontWeight: 500, color: "#6366f1",
                background: "#eef2ff", border: "1px solid #c7d2fe",
                borderRadius: 6, padding: "3px 8px", cursor: "pointer",
                whiteSpace: "nowrap", transition: "all 150ms",
                display: "flex", alignItems: "center", gap: 4,
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                Buka
              </button>
              {/* Quick reply toggle */}
              {!state.success && (
                <button onClick={() => setOpen(v => !v)} style={{
                  fontSize: 11, fontWeight: 500, color: "#4f46e5",
                  background: open ? "#eef2ff" : "transparent",
                  border: "1px solid " + (open ? "#c7d2fe" : "transparent"),
                  borderRadius: 6, padding: "3px 8px", cursor: "pointer",
                  transition: "all 150ms", whiteSpace: "nowrap",
                }}>
                  {open ? "Batal" : "Balas"}
                </button>
              )}
            </div>
          </div>

          {/* Row 2: origin type badge */}
          <div style={{ marginTop: 4 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 10, fontWeight: 600, letterSpacing: "0.02em",
              padding: "2px 7px", borderRadius: 999,
              background: origin.bg, color: origin.color,
              border: `1px solid ${origin.color}22`,
            }}>
              {origin.icon} {origin.label}
            </span>
          </div>

          {/* Row 3: last message preview */}
          {msgType !== "text" && !chat.lastMessage?.text ? (
            <div style={{
              marginTop: 6, display: "inline-flex", alignItems: "center", gap: 6,
              padding: "5px 10px", borderRadius: 8,
              background: origin.bg, border: `1px solid ${origin.color}22`,
              maxWidth: "100%",
            }}>
              <span style={{ fontSize: 14 }}>{origin.icon}</span>
              <span style={{ fontSize: 12, color: origin.color, fontWeight: 500 }}>{origin.preview}</span>
            </div>
          ) : (
            <div style={{ marginTop: 4, display: "flex", alignItems: "flex-start", gap: 4, minWidth: 0 }}>
              {msgType !== "text" && (
                <span style={{ fontSize: 13, flexShrink: 0 }}>{origin.icon}</span>
              )}
              <p style={{
                fontSize: 13, color: "#64748b", margin: 0,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                flex: 1, minWidth: 0,
              }}>
                {chat.lastMessage?.isFromMe && <span style={{ color: "#94a3b8" }}>Kamu: </span>}
                {chat.lastMessage?.text}
              </p>
            </div>
          )}

          {/* Reply success */}
          {state.success && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
              <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 500 }}>Pesan terkirim</span>
            </div>
          )}

          {/* Quick reply form */}
          {open && !state.success && (
            <form action={formAction} style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input name="message" type="text" required maxLength={2000}
                placeholder="Tulis pesan..."
                style={{
                  flex: 1, minWidth: 0, padding: "8px 12px", fontSize: 13, color: "#0f172a",
                  background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 8,
                  outline: "none", transition: "border-color 150ms",
                }}
                onFocus={e => e.currentTarget.style.borderColor = "#6366f1"}
                onBlur={e => e.currentTarget.style.borderColor = "#e2e8f0"}
              />
              <button type="submit" disabled={isPending} style={{
                padding: "8px 14px", fontSize: 13, fontWeight: 600, color: "#fff",
                background: "#4f46e5", border: "none", borderRadius: 8,
                cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.6 : 1,
                flexShrink: 0,
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

// ── Group by message type ─────────────────────────────────────────────────────

type ChatGroup = { type: string; chats: ReplizChat[] };

function groupByType(chats: ReplizChat[]): ChatGroup[] {
  const map = new Map<string, ChatGroup>();
  for (const c of chats) {
    const type = c.lastMessage?.type ?? "text";
    if (!map.has(type)) map.set(type, { type, chats: [] });
    map.get(type)!.chats.push(c);
  }
  return Array.from(map.values()).sort((a, b) => {
    if (a.type === "text" && b.type !== "text") return 1;
    if (a.type !== "text" && b.type === "text") return -1;
    return 0;
  });
}

function ChatGroupCard({ group, accountId, defaultOpen, onOpenThread, repliedIds }: {
  group: ChatGroup; accountId: string; defaultOpen: boolean;
  onOpenThread: (chat: ReplizChat) => void;
  repliedIds: Set<string>;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const cfg = getOriginConfig(group.type);
  const totalUnread = group.chats.reduce((n, c) => n + (c.unreadCount ?? 0), 0);
  const repliedCount = group.chats.filter(c => repliedIds.has(c._id)).length;

  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
      <button onClick={() => setOpen(v => !v)} aria-expanded={open} style={{
        width: "100%", display: "flex", alignItems: "center", gap: 12,
        padding: "12px 16px", background: "#f8fafc",
        borderTop: "none", borderLeft: "none", borderRight: "none",
        borderBottom: open ? "1px solid #e2e8f0" : "none",
        cursor: "pointer", textAlign: "left", transition: "background 150ms",
        boxSizing: "border-box",
      }}
        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#f1f5f9"}
        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc"}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: cfg.bg, border: `1.5px solid ${cfg.color}22`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16,
        }}>
          {cfg.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", overflow: "hidden" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap" }}>{cfg.label}</span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "#f1f5f9", color: "#475569", whiteSpace: "nowrap" }}>
            {group.chats.length} percakapan
          </span>
          {totalUnread > 0 && (
            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "#4f46e5", color: "#fff", whiteSpace: "nowrap" }}>
              {totalUnread} belum dibaca
            </span>
          )}
          {repliedCount > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
              background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0",
              whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 3,
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
              {repliedCount}/{group.chats.length} dibalas
            </span>
          )}
        </div>

        <svg style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms", color: "#94a3b8" }}
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      </button>

      {open && (
        <div style={{ padding: "0 16px", background: "#ffffff", overflow: "hidden" }}>
          {group.chats.map((c) => (
            <ChatItem key={c._id} chat={c} accountId={accountId} onOpenThread={onOpenThread} isReplied={repliedIds.has(c._id)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function ChatTab({ accountId, chats, unavailable, repliedIds }: Props) {
  const [activeThread, setActiveThread] = useState<ReplizChat | null>(null);

  if (unavailable) {
    return (
      <div style={{ textAlign: "center", padding: "48px 20px" }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#92400e", margin: "0 0 4px" }}>Chat tidak tersedia</p>
        <p style={{ fontSize: 13, color: "#a16207", margin: 0 }}>Fitur Chat membutuhkan Repliz tier Gold+</p>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "48px 20px" }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
        </div>
        <p style={{ fontSize: 14, fontWeight: 500, color: "#475569", margin: "0 0 4px" }}>Tidak ada percakapan aktif</p>
        <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>Pesan masuk akan muncul di sini</p>
      </div>
    );
  }

  const groups = groupByType(chats);
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", overflow: "hidden" }}>
        {groups.map((g, i) => (
          <ChatGroupCard
            key={g.type} group={g} accountId={accountId}
            defaultOpen={i === 0} onOpenThread={setActiveThread}
            repliedIds={repliedIds}
          />
        ))}
      </div>

      {/* Chat thread drawer */}
      {activeThread && (
        <ChatThread
          chat={activeThread}
          accountId={accountId}
          onClose={() => setActiveThread(null)}
        />
      )}
    </>
  );
}

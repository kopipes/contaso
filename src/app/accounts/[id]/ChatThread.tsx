'use client'

import { useState, useTransition, useEffect, useRef } from "react";
import { fetchChatMessages } from "@/app/actions/messages";
import { sendChatAction, type ReplyState } from "@/app/actions/replies";
import type { ReplizMessage, ReplizChat } from "@/lib/repliz";
import { useActionState } from "react";

type Props = {
  chat: ReplizChat;
  accountId: string;
  onClose: () => void;
};

function MessageBubble({ msg }: { msg: ReplizMessage }) {
  const isMe = msg.isFromMe;
  const [imgOpen, setImgOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgFullError, setImgFullError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [igPostError, setIgPostError] = useState(false);

  return (
    <div style={{
      display: "flex",
      flexDirection: isMe ? "row-reverse" : "row",
      gap: 8, marginBottom: 12, alignItems: "flex-end",
    }}>
      {/* Avatar */}
      {!isMe && (
        <div style={{
          width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, color: "#fff",
        }}>
          ?
        </div>
      )}

      <div style={{ maxWidth: "72%", minWidth: 0 }}>
        {/* Image message */}
        {msg.type === "image" && msg.image && (
          <div style={{ marginBottom: msg.text ? 4 : 0 }}>
            {imgError ? (
              <div style={{
                padding: "12px 16px", borderRadius: 10,
                background: "#f8fafc", border: "1px dashed #e2e8f0",
                display: "flex", alignItems: "center", gap: 8,
                maxWidth: 220,
              }}>
                <span style={{ fontSize: 20 }}>🖼️</span>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>
                  Gambar tidak tersedia lagi
                </span>
              </div>
            ) : (
              <button
                onClick={() => setImgOpen(true)}
                style={{ padding: 0, border: "none", background: "none", cursor: "pointer" }}
                title="Lihat gambar"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={msg.image.thumbnail || msg.image.url}
                  alt="Gambar"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  style={{
                    maxWidth: 220, maxHeight: 220, borderRadius: 10,
                    objectFit: "cover", display: "block",
                    border: "1px solid #e2e8f0",
                  }}
                />
              </button>
            )}
            {/* Lightbox */}
            {imgOpen && (
              <div
                onClick={() => setImgOpen(false)}
                style={{
                  position: "fixed", inset: 0, zIndex: 999,
                  background: "rgba(0,0,0,0.85)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "zoom-out",
                }}
              >
                {imgFullError ? (
                  <div style={{
                    padding: "24px 32px", borderRadius: 12,
                    background: "rgba(255,255,255,0.08)",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
                  }}>
                    <span style={{ fontSize: 40 }}>🖼️</span>
                    <span style={{ fontSize: 14, color: "#94a3b8" }}>Gambar tidak tersedia lagi</span>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={msg.image.url}
                    alt="Gambar penuh"
                    referrerPolicy="no-referrer"
                    onError={() => setImgFullError(true)}
                    style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 8, objectFit: "contain" }}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Video message */}
        {msg.type === "video" && msg.video && !videoError && (
          <div style={{ marginBottom: msg.text ? 4 : 0, position: "relative" }}>
            <video
              src={msg.video.url}
              poster={msg.video.thumbnail}
              controls
              onError={() => setVideoError(true)}
              style={{
                maxWidth: 280, maxHeight: 200, borderRadius: 10,
                display: "block", border: "1px solid #e2e8f0",
                background: "#000",
              }}
            />
            {msg.video.duration && (
              <span style={{
                position: "absolute", bottom: 6, right: 6,
                fontSize: 10, fontWeight: 600,
                background: "rgba(0,0,0,0.6)", color: "#fff",
                padding: "1px 5px", borderRadius: 4,
              }}>
                {msg.video.duration}s
              </span>
            )}
          </div>
        )}
        {msg.type === "video" && msg.video && videoError && (
          <div style={{
            marginBottom: msg.text ? 4 : 0,
            padding: "12px 16px", borderRadius: 10,
            background: "#f8fafc", border: "1px dashed #e2e8f0",
            display: "flex", alignItems: "center", gap: 8,
            maxWidth: 280,
          }}>
            <span style={{ fontSize: 20 }}>🎬</span>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>
              Video tidak tersedia lagi
            </span>
          </div>
        )}

        {/* ig_post / share — show thumbnail if available */}
        {(msg.type === "ig_post" || msg.type === "share") && msg.ig_post?.thumbnail && (
          <div style={{ marginBottom: msg.text ? 4 : 0 }}>
            {igPostError ? (
              <div style={{
                padding: "8px 12px", borderRadius: 10,
                background: isMe ? "#eef2ff" : "#f8fafc",
                border: "1px solid #e2e8f0",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ fontSize: 16 }}>{msg.type === "ig_post" ? "📱" : "↗️"}</span>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  {msg.type === "ig_post" ? "Membagikan sebuah post" : "Berbagi konten"}
                </span>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={msg.ig_post.thumbnail}
                alt="Post yang dibagikan"
                referrerPolicy="no-referrer"
                onError={() => setIgPostError(true)}
                style={{
                  maxWidth: 220, maxHeight: 220, borderRadius: 10,
                  objectFit: "cover", display: "block",
                  border: "1px solid #e2e8f0",
                }}
              />
            )}
          </div>
        )}
        {(msg.type === "ig_post" || msg.type === "share") && !msg.ig_post?.thumbnail && (
          <div style={{
            marginBottom: msg.text ? 4 : 0,
            padding: "8px 12px", borderRadius: 10,
            background: isMe ? "#eef2ff" : "#f8fafc",
            border: "1px solid #e2e8f0",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontSize: 16 }}>{msg.type === "ig_post" ? "📱" : "↗️"}</span>
            <span style={{ fontSize: 12, color: "#64748b" }}>
              {msg.type === "ig_post" ? "Membagikan sebuah post" : "Berbagi konten"}
            </span>
          </div>
        )}

        {/* unsupported */}
        {msg.type === "unsupported_type" && (
          <div style={{
            marginBottom: msg.text ? 4 : 0,
            padding: "6px 10px", borderRadius: 10,
            background: "#f8fafc", border: "1px dashed #e2e8f0",
          }}>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>📎 Tipe pesan tidak didukung</span>
          </div>
        )}

        {/* Text bubble */}
        {msg.text ? (
          <div style={{
            padding: "8px 12px", borderRadius: 12,
            borderBottomRightRadius: isMe ? 2 : 12,
            borderBottomLeftRadius: isMe ? 12 : 2,
            background: isMe ? "#4f46e5" : "#f1f5f9",
            color: isMe ? "#fff" : "#0f172a",
            fontSize: 13, lineHeight: 1.5,
            wordBreak: "break-word",
          }}>
            {msg.text}
          </div>
        ) : null}

        {/* Timestamp */}
        <p style={{
          margin: "3px 0 0", fontSize: 10, color: "#94a3b8",
          textAlign: isMe ? "right" : "left",
        }}>
          {msg.createdAt
            ? new Date(msg.createdAt).toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })
            : ""}
        </p>
      </div>
    </div>
  );
}

export default function ChatThread({ chat, accountId, onClose }: Props) {
  const [messages, setMessages] = useState<ReplizMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  const boundAction = sendChatAction.bind(null, accountId, chat._id);
  const [replyState, replyAction, isSending] = useActionState<ReplyState, FormData>(boundAction, {});

  useEffect(() => {
    startTransition(async () => {
      const result = await fetchChatMessages(chat._id);
      setLoading(false);
      if (result.success && result.messages) {
        setMessages(result.messages);
      } else {
        setError(result.error ?? "Gagal memuat pesan");
      }
    });
  }, [chat._id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Refresh after successful reply
  useEffect(() => {
    if (replyState.success) {
      startTransition(async () => {
        const result = await fetchChatMessages(chat._id);
        if (result.success && result.messages) setMessages(result.messages);
      });
    }
  }, [replyState.success, chat._id]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 40,
          background: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)",
        }}
      />

      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 50,
        width: 420, maxWidth: "100vw",
        background: "#ffffff",
        boxShadow: "-8px 0 32px rgba(0,0,0,0.12)",
        display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "14px 16px",
          borderBottom: "1px solid #f1f5f9",
          background: "#ffffff",
          flexShrink: 0,
        }}>
          {chat.senderPicture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={chat.senderPicture} alt={chat.senderName} referrerPolicy="no-referrer"
              style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid #e2e8f0" }} />
          ) : (
            <div style={{
              width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700, color: "#fff",
            }}>
              {chat.senderName.charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {chat.senderName}
            </p>
            {chat.unreadCount > 0 && (
              <p style={{ margin: 0, fontSize: 11, color: "#4f46e5" }}>{chat.unreadCount} pesan belum dibaca</p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: "#f8fafc", border: "1px solid #e2e8f0",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#64748b",
            }}
            aria-label="Tutup"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
          {loading && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                border: "2px solid #e2e8f0", borderTopColor: "#4f46e5",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 8px",
              }} />
              <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>Memuat pesan...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          )}
          {error && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontSize: 13, color: "#ef4444" }}>{error}</p>
            </div>
          )}
          {!loading && !error && messages.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontSize: 13, color: "#94a3b8" }}>Belum ada pesan</p>
            </div>
          )}
          {messages.map((msg) => (
            <MessageBubble key={msg._id} msg={msg} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Reply input */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9", flexShrink: 0 }}>
          {replyState.success && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
              <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 500 }}>Pesan terkirim</span>
            </div>
          )}
          {replyState.error && (
            <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 6 }}>{replyState.error}</p>
          )}
          <form action={replyAction} style={{ display: "flex", gap: 8 }}>
            <input
              name="message"
              type="text"
              required
              maxLength={2000}
              placeholder="Tulis pesan..."
              style={{
                flex: 1, minWidth: 0, padding: "9px 12px",
                fontSize: 13, color: "#0f172a",
                background: "#f8fafc", border: "1.5px solid #e2e8f0",
                borderRadius: 8, outline: "none",
                transition: "border-color 150ms",
              }}
              onFocus={e => e.currentTarget.style.borderColor = "#6366f1"}
              onBlur={e => e.currentTarget.style.borderColor = "#e2e8f0"}
            />
            <button
              type="submit"
              disabled={isSending}
              style={{
                padding: "9px 16px", fontSize: 13, fontWeight: 600, color: "#fff",
                background: "#4f46e5", border: "none", borderRadius: 8,
                cursor: isSending ? "not-allowed" : "pointer",
                opacity: isSending ? 0.6 : 1,
                flexShrink: 0,
              }}
            >
              {isSending ? "..." : "Kirim"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

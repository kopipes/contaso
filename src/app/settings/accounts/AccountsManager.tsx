'use client'

import { useState, useTransition } from "react";
import type { ReplizAccount } from "@/lib/repliz";
import {
  authorizeAccountAction,
  addToContasoAction,
  removeFromContasoAction,
  disconnectAccountAction,
} from "@/app/actions/accounts";

type TrackedInfo = { id: string; name: string; isVisible: boolean };

type Props = {
  replizAccounts: ReplizAccount[];
  trackedMap: Record<string, TrackedInfo>;
};

const PLATFORM_CONFIG: Record<string, { label: string; gradient: string; icon: string }> = {
  instagram: { label: "Instagram", gradient: "135deg, #ec4899, #8b5cf6", icon: "📸" },
  facebook:  { label: "Facebook",  gradient: "135deg, #3b82f6, #1d4ed8", icon: "👥" },
  threads:   { label: "Threads",   gradient: "135deg, #475569, #1e293b", icon: "🧵" },
};

function AccountRow({ account, tracked, onAdd, onRemove, onDisconnect }: {
  account: ReplizAccount;
  tracked?: TrackedInfo;
  onAdd: (replizId: string, name: string, platform: string) => void;
  onRemove: (trackedId: string) => void;
  onDisconnect: (trackedId: string, replizId: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [imgError, setImgError] = useState(false);
  const [showDisconnect, setShowDisconnect] = useState(false);
  const cfg = PLATFORM_CONFIG[account.type] ?? { label: account.type, gradient: "135deg, #64748b, #334155", icon: "🔗" };

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "14px 20px",
      borderBottom: "1px solid #f1f5f9",
    }}>
      {/* Avatar */}
      {account.picture && !imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={account.picture}
          alt={account.name}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid #e2e8f0" }}
        />
      ) : (
        <div style={{
          width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
          background: `linear-gradient(${cfg.gradient})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18,
        }}>
          {cfg.icon}
        </div>
      )}

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{account.name}</span>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 999,
            background: `linear-gradient(${cfg.gradient})`, color: "#fff",
          }}>{cfg.label}</span>
          {tracked ? (
            <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 999, background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0" }}>
              Di Contaso
            </span>
          ) : (
            <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 999, background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" }}>
              Belum di Contaso
            </span>
          )}
        </div>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>
          @{account.username || account.name}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center" }}>
        {!tracked ? (
          <button
            disabled={isPending}
            onClick={() => startTransition(async () => {
              await onAdd(account._id, account.name, account.type);
            })}
            style={{
              fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 8,
              cursor: isPending ? "not-allowed" : "pointer",
              background: "#4f46e5", color: "#fff", border: "none",
              opacity: isPending ? 0.6 : 1,
            }}
          >
            {isPending ? "..." : "+ Tambah ke Contaso"}
          </button>
        ) : (
          <button
            disabled={isPending}
            onClick={() => {
              if (!confirm(`Hapus "${account.name}" dari Contaso? Akun tetap ada di Repliz.`)) return;
              startTransition(async () => { await onRemove(tracked.id); });
            }}
            style={{
              fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 8,
              cursor: isPending ? "not-allowed" : "pointer",
              background: "#f8fafc", color: "#64748b",
              border: "1px solid #e2e8f0",
              opacity: isPending ? 0.6 : 1,
            }}
          >
            {isPending ? "..." : "Hapus dari Contaso"}
          </button>
        )}

        {/* Disconnect from Repliz — behind extra confirmation */}
        {!showDisconnect ? (
          <button
            onClick={() => setShowDisconnect(true)}
            title="Putuskan dari Repliz"
            style={{
              width: 28, height: 28, borderRadius: 6, border: "1px solid #e2e8f0",
              background: "#f8fafc", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
              <polyline points="3,6 5,6 21,6"/>
              <path d="M19,6l-1,14a2,2 0 01-2,2H8a2,2 0 01-2-2L5,6"/>
              <path d="M10,11v6M14,11v6"/>
              <path d="M9,6V4a1,1 0 011-1h4a1,1 0 011,1v2"/>
            </svg>
          </button>
        ) : (
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#ef4444", whiteSpace: "nowrap" }}>Putuskan dari Repliz?</span>
            <button
              disabled={isPending}
              onClick={() => startTransition(async () => {
                await onDisconnect(tracked?.id ?? "", account._id);
              })}
              style={{
                fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6,
                cursor: isPending ? "not-allowed" : "pointer",
                background: "#fef2f2", color: "#ef4444",
                border: "1px solid #fecaca",
                opacity: isPending ? 0.6 : 1,
              }}
            >
              Ya
            </button>
            <button
              onClick={() => setShowDisconnect(false)}
              style={{
                fontSize: 11, padding: "3px 8px", borderRadius: 6,
                cursor: "pointer", background: "#f8fafc", color: "#64748b",
                border: "1px solid #e2e8f0",
              }}
            >
              Batal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AccountsManager({ replizAccounts, trackedMap }: Props) {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accounts] = useState(replizAccounts);
  const [tracked, setTracked] = useState(trackedMap);
  const [isPending, startTransition] = useTransition();

  const handleConnect = (platform: "instagram" | "facebook" | "threads") => {
    setConnecting(platform);
    setError(null);
    startTransition(async () => {
      const result = await authorizeAccountAction(platform);
      if (result?.error) {
        setError(result.error);
        setConnecting(null);
      }
    });
  };

  const handleAdd = async (replizId: string, name: string, platform: string) => {
    const result = await addToContasoAction(replizId, name, platform);
    if (result.error) {
      setError(result.error);
    } else {
      setTracked(prev => ({ ...prev, [replizId]: { id: replizId, name, isVisible: true } }));
    }
  };

  const handleRemove = async (trackedId: string) => {
    const replizId = Object.entries(tracked).find(([, v]) => v.id === trackedId)?.[0];
    const result = await removeFromContasoAction(trackedId);
    if (result.error) {
      setError(result.error);
    } else if (replizId) {
      setTracked(prev => { const next = { ...prev }; delete next[replizId]; return next; });
    }
  };

  const handleDisconnect = async (trackedId: string, replizId: string) => {
    const result = await disconnectAccountAction(trackedId || "none", replizId);
    if (result.error) {
      setError(result.error);
    } else {
      setTracked(prev => { const next = { ...prev }; delete next[replizId]; return next; });
    }
  };

  const inContaso = accounts.filter(a => tracked[a._id]).length;
  const notInContaso = accounts.filter(a => !tracked[a._id]).length;

  return (
    <div>
      {/* Connect new account */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0f172a" }}>Hubungkan Akun Baru</h2>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
            Kamu akan diarahkan ke halaman login Meta untuk otorisasi
          </p>
        </div>
        <div style={{ padding: "16px 20px", display: "flex", gap: 10, flexWrap: "wrap" }}>
          {(["instagram", "facebook", "threads"] as const).map((platform) => {
            const cfg = PLATFORM_CONFIG[platform];
            return (
              <button
                key={platform}
                disabled={isPending}
                onClick={() => handleConnect(platform)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 18px", borderRadius: 10,
                  background: connecting === platform ? "#f1f5f9" : `linear-gradient(${cfg.gradient})`,
                  color: connecting === platform ? "#64748b" : "#fff",
                  border: "none", cursor: isPending ? "not-allowed" : "pointer",
                  fontSize: 13, fontWeight: 600,
                  opacity: isPending && connecting !== platform ? 0.5 : 1,
                  transition: "opacity 150ms",
                }}
              >
                <span>{cfg.icon}</span>
                {connecting === platform ? "Mengarahkan..." : `Hubungkan ${cfg.label}`}
              </button>
            );
          })}
        </div>
        {error && (
          <div style={{ padding: "10px 20px 16px", color: "#ef4444", fontSize: 12 }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Account list */}
      <div className="card">
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0f172a" }}>Akun Sosial Media</h2>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
            {inContaso} di Contaso · {notInContaso} belum ditambahkan
          </p>
        </div>

        {accounts.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
            Belum ada akun yang terhubung ke Repliz
          </div>
        ) : (
          <div>
            {accounts.map((acc) => (
              <AccountRow
                key={acc._id}
                account={acc}
                tracked={tracked[acc._id]}
                onAdd={handleAdd}
                onRemove={handleRemove}
                onDisconnect={handleDisconnect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

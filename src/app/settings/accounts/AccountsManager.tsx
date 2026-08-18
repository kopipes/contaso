'use client'

import { useState, useTransition } from "react";
import type { ReplizAccount } from "@/lib/repliz";
import {
  authorizeAccountAction,
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

function AccountRow({ account, tracked, onDisconnect }: {
  account: ReplizAccount;
  tracked?: TrackedInfo;
  onDisconnect: (trackedId: string, replizId: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [imgError, setImgError] = useState(false);
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{account.name}</span>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 999,
            background: `linear-gradient(${cfg.gradient})`,
            color: "#fff",
          }}>{cfg.label}</span>
          {account.isConnected ? (
            <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 999, background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0" }}>
              Terhubung
            </span>
          ) : (
            <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 999, background: "#fef3c7", color: "#d97706", border: "1px solid #fde68a" }}>
              Tidak aktif
            </span>
          )}
          {!tracked && (
            <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 999, background: "#f1f5f9", color: "#64748b" }}>
              Tidak di Contaso
            </span>
          )}
        </div>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>
          @{account.username || account.name} · ID: {account._id}
        </p>
      </div>

      {/* Actions */}
      {tracked && (
        <button
          disabled={isPending}
          onClick={() => {
            if (!confirm(`Putuskan koneksi akun "${account.name}"? Data cache akan dihapus.`)) return;
            startTransition(async () => {
              await onDisconnect(tracked.id, account._id);
            });
          }}
          style={{
            fontSize: 12, fontWeight: 600, padding: "6px 14px",
            borderRadius: 8, cursor: isPending ? "not-allowed" : "pointer",
            background: "#fef2f2", color: "#ef4444",
            border: "1px solid #fecaca",
            opacity: isPending ? 0.6 : 1,
            flexShrink: 0,
          }}
        >
          {isPending ? "..." : "Putuskan"}
        </button>
      )}
    </div>
  );
}

export default function AccountsManager({ replizAccounts, trackedMap }: Props) {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState(replizAccounts);
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
      // On success, redirect() is called server-side — no need to handle here
    });
  };

  const handleDisconnect = async (trackedId: string, replizId: string) => {
    const result = await disconnectAccountAction(trackedId, replizId);
    if (result.error) {
      setError(result.error);
    } else {
      setAccounts(prev => prev.filter(a => a._id !== replizId));
    }
  };

  return (
    <div>
      {/* Add account buttons */}
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

      {/* Connected accounts */}
      <div className="card">
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0f172a" }}>Akun di Repliz</h2>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
            {accounts.length} akun terdaftar di Repliz
          </p>
        </div>

        {accounts.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
            Belum ada akun yang terhubung
          </div>
        ) : (
          <div>
            {accounts.map((acc) => (
              <AccountRow
                key={acc._id}
                account={acc}
                tracked={trackedMap[acc._id]}
                onDisconnect={handleDisconnect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

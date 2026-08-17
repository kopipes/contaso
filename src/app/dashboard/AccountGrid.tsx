'use client'

import Link from "next/link";
import { useTransition } from "react";
import { toggleAccountVisibility } from "@/app/actions/accounts";
import type { TrackedAccount } from "@/generated/prisma/client";

type Props = {
  accounts: TrackedAccount[];
  isAdmin: boolean;
};

const PLATFORM_CONFIG: Record<string, { label: string; badgeCls: string; icon: React.ReactNode }> = {
  instagram: {
    label: "Instagram",
    badgeCls: "badge-instagram",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
  },
  facebook: {
    label: "Facebook",
    badgeCls: "badge-facebook",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  threads: {
    label: "Threads",
    badgeCls: "badge-threads",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 012.325.135v-.591c0-.886-.316-1.772-.986-2.375-.671-.603-1.548-.886-2.679-.862a4.57 4.57 0 00-1.865.435 3.48 3.48 0 00-1.358 1.166l-1.68-1.174a5.494 5.494 0 012.144-1.851 6.63 6.63 0 012.727-.647c1.684-.036 3.12.446 4.085 1.357 1.002.946 1.497 2.269 1.497 3.634v3.23a12.78 12.78 0 00.296 2.905l-2.037.433a14.842 14.842 0 01-.257-1.843c-.748.844-1.679 1.479-2.769 1.887-1.067.4-2.24.555-3.428.455z"/>
      </svg>
    ),
  },
};

function getPlatformConfig(platform: string) {
  return PLATFORM_CONFIG[platform] ?? {
    label: platform.charAt(0).toUpperCase() + platform.slice(1),
    badgeCls: "badge-facebook",
    icon: null,
  };
}

function AccountCard({ account, isAdmin }: { account: TrackedAccount; isAdmin: boolean }) {
  const [isPending, startTransition] = useTransition();
  const platform = getPlatformConfig(account.platform);

  function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    startTransition(async () => {
      await toggleAccountVisibility(account.id, !account.isVisible);
    });
  }

  return (
    <div className="card card-hover" style={{ opacity: account.isVisible ? 1 : 0.6, display: "flex", flexDirection: "column" }}>
      <Link href={`/accounts/${account.id}`} style={{ textDecoration: "none", padding: 20, flex: 1, display: "block" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          {/* Avatar placeholder */}
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: `linear-gradient(135deg, ${account.platform === "instagram" ? "#ec4899, #8b5cf6" : account.platform === "threads" ? "#334155, #1e293b" : "#3b82f6, #1d4ed8"})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 700, color: "#ffffff", flexShrink: 0,
          }}>
            {account.name.charAt(0).toUpperCase()}
          </div>
          <span className={`badge ${platform.badgeCls}`} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {platform.icon}
            {platform.label}
          </span>
        </div>

        {/* Name */}
        <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {account.name}
        </p>

        {/* Status */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
            background: account.isVisible ? "#22c55e" : "#cbd5e1",
            boxShadow: account.isVisible ? "0 0 0 3px rgba(34,197,94,0.15)" : "none",
          }} />
          <span style={{ fontSize: 12, color: account.isVisible ? "#16a34a" : "#94a3b8" }}>
            {account.isVisible ? "Aktif" : "Nonaktif"}
          </span>
        </div>
      </Link>

      {/* Footer with toggle */}
      {isAdmin && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 20px",
          borderTop: "1px solid #f1f5f9",
        }}>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>Tampilkan</span>
          <button
            onClick={handleToggle}
            disabled={isPending}
            role="switch"
            aria-checked={account.isVisible}
            aria-label={`Toggle ${account.name}`}
            style={{
              position: "relative", width: 36, height: 20,
              borderRadius: 999, border: "none", cursor: isPending ? "wait" : "pointer",
              background: account.isVisible ? "#4f46e5" : "#e2e8f0",
              transition: "background 200ms",
              padding: 0,
              opacity: isPending ? 0.6 : 1,
            }}
          >
            <span style={{
              position: "absolute", top: 3,
              left: account.isVisible ? 18 : 3,
              width: 14, height: 14,
              borderRadius: "50%", background: "#ffffff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              transition: "left 200ms",
            }} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function AccountGrid({ accounts, isAdmin }: Props) {
  const visible = accounts.filter((a) => a.isVisible);
  const hidden = accounts.filter((a) => !a.isVisible);

  const Section = ({ title, items, muted }: { title: string; items: TrackedAccount[]; muted?: boolean }) => (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{
        fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: muted ? "#cbd5e1" : "#94a3b8",
        margin: "0 0 12px",
      }}>
        {title}
      </h2>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 16,
      }}>
        {items.map((a) => <AccountCard key={a.id} account={a} isAdmin={isAdmin} />)}
      </div>
    </section>
  );

  return (
    <div>
      {visible.length > 0 && <Section title={`Aktif · ${visible.length}`} items={visible} />}
      {hidden.length > 0 && isAdmin && <Section title={`Nonaktif · ${hidden.length}`} items={hidden} muted />}
    </div>
  );
}

'use client'

import { useState, useTransition } from "react";
import { syncAction } from "@/app/actions/sync";

export default function SyncButton() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  function handleSync() {
    startTransition(async () => {
      setStatus(null);
      const result = await syncAction();
      setStatus({ ok: result.success, msg: result.message });
      // Clear status after 4s
      setTimeout(() => setStatus(null), 4000);
    });
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {status && (
        <span style={{
          fontSize: 11, fontWeight: 500,
          padding: "3px 8px", borderRadius: 6,
          background: status.ok ? "#f0fdf4" : "#fef2f2",
          color: status.ok ? "#16a34a" : "#dc2626",
          border: `1px solid ${status.ok ? "#bbf7d0" : "#fecaca"}`,
        }}>
          {status.msg}
        </span>
      )}
      <button
        onClick={handleSync}
        disabled={isPending}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "7px 14px",
          fontSize: 13, fontWeight: 500, color: "#ffffff",
          background: isPending ? "rgba(79,70,229,0.6)" : "#4f46e5",
          border: "none", borderRadius: 8, cursor: isPending ? "not-allowed" : "pointer",
          boxShadow: "0 1px 3px rgba(79,70,229,0.3)",
          transition: "all 150ms",
        }}
      >
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ animation: isPending ? "spin 1s linear infinite" : "none" }}
        >
          <polyline points="23,4 23,10 17,10"/>
          <polyline points="1,20 1,14 7,14"/>
          <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
        </svg>
        {isPending ? "Syncing..." : "Sync"}
      </button>
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

'use client'

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/actions/auth";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div style={{
          position: "absolute", top: "-20%", right: "-10%",
          width: 600, height: 600,
          background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          borderRadius: "50%"
        }} />
        <div style={{
          position: "absolute", bottom: "-20%", left: "-10%",
          width: 500, height: 500,
          background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
          borderRadius: "50%"
        }} />
      </div>

      <div style={{ width: "100%", maxWidth: 420, padding: "0 20px", position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 48, height: 48, borderRadius: 12,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            marginBottom: 16,
            boxShadow: "0 8px 24px rgba(99,102,241,0.4)"
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#f8fafc", margin: 0 }}>Contaso</h1>
          <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 6 }}>Kelola semua interaksi sosial media</p>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: "32px 32px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)"
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#f1f5f9", marginBottom: 24 }}>Masuk ke akun</h2>

          <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label htmlFor="email" style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#94a3b8", marginBottom: 6 }}>
                Email
              </label>
              <input
                id="email" name="email" type="email"
                autoComplete="email" required
                placeholder="kamu@perusahaan.com"
                style={{
                  width: "100%", padding: "10px 14px",
                  fontSize: 14, color: "#f1f5f9",
                  background: "rgba(255,255,255,0.06)",
                  border: state.errors?.email ? "1.5px solid #f87171" : "1.5px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  outline: "none",
                  transition: "border-color 150ms",
                }}
                onFocus={e => e.currentTarget.style.borderColor = "#6366f1"}
                onBlur={e => e.currentTarget.style.borderColor = state.errors?.email ? "#f87171" : "rgba(255,255,255,0.1)"}
              />
              {state.errors?.email && (
                <p style={{ marginTop: 4, fontSize: 12, color: "#f87171" }}>{state.errors.email[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#94a3b8", marginBottom: 6 }}>
                Password
              </label>
              <input
                id="password" name="password" type="password"
                autoComplete="current-password" required
                placeholder="••••••••"
                style={{
                  width: "100%", padding: "10px 14px",
                  fontSize: 14, color: "#f1f5f9",
                  background: "rgba(255,255,255,0.06)",
                  border: state.errors?.password ? "1.5px solid #f87171" : "1.5px solid rgba(255,255,255,0.1)",
                  borderRadius: 8, outline: "none",
                }}
                onFocus={e => e.currentTarget.style.borderColor = "#6366f1"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
              />
              {state.errors?.password && (
                <p style={{ marginTop: 4, fontSize: 12, color: "#f87171" }}>{state.errors.password[0]}</p>
              )}
            </div>

            {state.errors?.form && (
              <div style={{
                padding: "10px 14px",
                background: "rgba(248,113,113,0.1)",
                border: "1px solid rgba(248,113,113,0.2)",
                borderRadius: 8,
              }}>
                <p style={{ fontSize: 13, color: "#fca5a5" }}>{state.errors.form[0]}</p>
              </div>
            )}

            <button
              type="submit" disabled={isPending}
              style={{
                marginTop: 4,
                padding: "11px",
                fontSize: 14, fontWeight: 600, color: "#ffffff",
                background: isPending ? "rgba(99,102,241,0.6)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none", borderRadius: 8, cursor: isPending ? "not-allowed" : "pointer",
                boxShadow: isPending ? "none" : "0 4px 16px rgba(99,102,241,0.4)",
                transition: "all 150ms",
              }}
            >
              {isPending ? "Masuk..." : "Masuk"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "#475569" }}>
          Contaso © 2026
        </p>
      </div>
    </div>
  );
}

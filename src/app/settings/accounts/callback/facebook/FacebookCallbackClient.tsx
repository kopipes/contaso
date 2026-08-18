'use client'

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { exchangeFacebookAction, connectFacebookAction } from "@/app/actions/accounts";
import { getFacebookPages } from "@/lib/repliz";

type Page = { id: string; name: string; picture?: string };

export default function FacebookCallbackClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [token, setToken] = useState<string>("");
  const [step, setStep] = useState<"loading" | "select" | "connecting" | "error">("loading");
  const [error, setError] = useState<string>("");
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const err = searchParams.get("error");

    if (err || !code) {
      setError("Otorisasi Facebook gagal atau dibatalkan");
      setStep("error");
      return;
    }

    (async () => {
      const exchangeResult = await exchangeFacebookAction(code);
      if (exchangeResult.error || !exchangeResult.token) {
        setError(exchangeResult.error ?? "Gagal menukar kode Facebook");
        setStep("error");
        return;
      }

      const fbToken = exchangeResult.token;
      setToken(fbToken);

      try {
        const fbPages = await getFacebookPages(fbToken);
        if (!fbPages || fbPages.length === 0) {
          setError("Tidak ada halaman Facebook yang ditemukan. Pastikan kamu adalah admin halaman.");
          setStep("error");
          return;
        }
        setPages(fbPages);
        setStep("select");
      } catch {
        setError("Gagal mengambil daftar halaman Facebook");
        setStep("error");
      }
    })();
  }, [searchParams]);

  const handleConnect = async (pageId: string) => {
    setConnecting(pageId);
    setStep("connecting");
    const result = await connectFacebookAction(pageId, token);
    if (result.error) {
      setError(result.error);
      setStep("error");
      setConnecting(null);
    } else {
      router.push("/settings/accounts?success=facebook_connected");
    }
  };

  if (step === "loading" || step === "connecting") {
    return (
      <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>{step === "connecting" ? "🔗" : "⏳"}</div>
          <p style={{ fontSize: 14, color: "#475569" }}>
            {step === "connecting" ? "Menghubungkan halaman Facebook..." : "Memproses otorisasi Facebook..."}
          </p>
        </div>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 360 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#ef4444", marginBottom: 8 }}>Gagal</p>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>{error}</p>
          <button
            onClick={() => router.push("/settings/accounts")}
            style={{
              padding: "8px 20px", borderRadius: 8, border: "none",
              background: "#4f46e5", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div className="card">
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
            <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#0f172a" }}>Pilih Halaman Facebook</h1>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
              Pilih halaman yang ingin dihubungkan ke Contaso
            </p>
          </div>
          <div style={{ padding: "8px 0" }}>
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => handleConnect(page.id)}
                disabled={!!connecting}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 24px", background: "none", border: "none",
                  borderBottom: "1px solid #f8fafc", cursor: connecting ? "not-allowed" : "pointer",
                  textAlign: "left", transition: "background 150ms",
                  opacity: connecting && connecting !== page.id ? 0.5 : 1,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, color: "#fff", fontWeight: 700,
                }}>
                  {page.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{page.name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>ID: {page.id}</p>
                </div>
                {connecting === page.id && (
                  <span style={{ marginLeft: "auto", fontSize: 12, color: "#4f46e5" }}>Menghubungkan...</span>
                )}
              </button>
            ))}
          </div>
          <div style={{ padding: "12px 24px" }}>
            <button
              onClick={() => router.push("/settings/accounts")}
              style={{
                fontSize: 12, color: "#64748b", background: "none", border: "none",
                cursor: "pointer", padding: 0, textDecoration: "underline",
              }}
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

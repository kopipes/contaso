import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import { listReplizAccounts } from "@/lib/repliz";
import { notFound } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/app/components/Sidebar";
import AccountsManager from "./AccountsManager";

export default async function SettingsAccountsPage() {
  const session = await verifySession();
  if (session.role !== "ADMIN") notFound();

  // Load Repliz accounts and local tracked accounts in parallel
  const [replizAccounts, trackedAccounts] = await Promise.all([
    listReplizAccounts().catch(() => []),
    db.trackedAccount.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ]);

  // Map replizId → trackedAccount for quick lookup
  const trackedMap = new Map(trackedAccounts.map((a) => [a.replizId, a]));

  return (
    <div style={{ display: "flex", minHeight: "100svh" }}>
      <Sidebar session={session} />

      <div className="main-shell" style={{ flex: 1 }}>
        <header className="page-header">
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", margin: 0 }}>Kelola Akun Sosial Media</h1>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, marginTop: 1 }}>
              Hubungkan atau putuskan akun Instagram, Facebook, dan Threads
            </p>
          </div>
          <Link href="/accounts" style={{
            fontSize: 12, color: "#64748b", textDecoration: "none",
            padding: "6px 12px", borderRadius: 8, border: "1px solid #e2e8f0",
            background: "#f8fafc",
          }}>
            ← Kembali
          </Link>
        </header>

        <main className="page-content">
          <AccountsManager
            replizAccounts={replizAccounts}
            trackedMap={Object.fromEntries(
              trackedAccounts.map((a) => [a.replizId, { id: a.id, name: a.name, isVisible: a.isVisible }])
            )}
          />
        </main>
      </div>
    </div>
  );
}

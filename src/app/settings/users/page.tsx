import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import UsersClient from "./UsersClient";

export default async function UsersPage() {
  const session = await verifySession();
  if (session.role !== "ADMIN") redirect("/dashboard");

  const users = await db.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return (
    <div style={{ display: "flex", minHeight: "100svh" }}>
      <Sidebar session={session} />
      <div className="main-shell" style={{ flex: 1 }}>
        <header className="page-header">
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", margin: 0 }}>Manajemen User</h1>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, marginTop: 1 }}>
              {users.length} user terdaftar
            </p>
          </div>
        </header>
        <main className="page-content">
          <UsersClient users={users} currentUserId={session.userId} />
        </main>
      </div>
    </div>
  );
}

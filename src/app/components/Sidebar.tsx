'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import type { SessionPayload } from "@/lib/session";

type Props = { session: SessionPayload };

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Statistik semua akun",
    adminOnly: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    href: "/accounts",
    label: "Akun",
    description: "Kelola akun sosial media",
    adminOnly: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
  {
    href: "/settings/users",
    label: "Users",
    description: "Kelola pengguna sistem",
    adminOnly: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    href: "/settings/accounts",
    label: "Akun Sosial Media",
    description: "Hubungkan akun sosial media",
    adminOnly: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
        <path d="M15.54 8.46a5 5 0 010 7.07M8.46 8.46a5 5 0 000 7.07"/>
      </svg>
    ),
  },
];

export default function Sidebar({ session }: Props) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/accounts") return pathname.startsWith("/accounts") && !pathname.startsWith("/accounts/settings");
    if (href === "/settings/accounts") return pathname.startsWith("/settings/accounts");
    if (href === "/settings/users") return pathname === "/settings/users";
    return pathname === href;
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="white"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", margin: 0, letterSpacing: "-0.01em" }}>Contaso</p>
            <p style={{ fontSize: 10, color: "#475569", margin: 0 }}>Social Media Manager</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: "#334155", textTransform: "uppercase", padding: "0 12px", margin: "0 0 6px" }}>
          Menu
        </p>
        {NAV_ITEMS.filter(item => !item.adminOnly || session.role === "ADMIN").map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-nav-item ${isActive(item.href) ? "active" : ""}`}
          >
            <span style={{
              width: 28, height: 28, borderRadius: 6, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: isActive(item.href) ? "rgba(99,102,241,0.2)" : "transparent",
              color: isActive(item.href) ? "#a5b4fc" : "inherit",
              transition: "background 150ms",
            }}>
              {item.icon}
            </span>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: isActive(item.href) ? "#f1f5f9" : "#94a3b8" }}>
                {item.label}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.description}
              </p>
            </div>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", marginBottom: 4 }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "#fff",
          }}>
            {session.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {session.name}
            </p>
            <p style={{ fontSize: 11, color: "#475569", margin: 0 }}>
              {session.role === "ADMIN" ? "Admin" : "Agent"}
            </p>
          </div>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="sidebar-nav-item" style={{ width: "100%", background: "none", border: "none", cursor: "pointer" }}>
            <span style={{ width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </span>
            <span style={{ fontSize: 13, color: "#94a3b8" }}>Keluar</span>
          </button>
        </form>
      </div>
    </aside>
  );
}

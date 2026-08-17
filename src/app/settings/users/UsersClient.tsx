'use client'

import { useActionState, useState, useTransition } from "react";
import {
  addUserAction,
  deleteUserAction,
  changePasswordAction,
  type UserActionState,
} from "@/app/actions/users";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
};

type Props = {
  users: User[];
  currentUserId: string;
};

// ── Add User Form ─────────────────────────────────────────────────────────────

function AddUserForm() {
  const [state, formAction, isPending] = useActionState<UserActionState, FormData>(addUserAction, {});
  const [show, setShow] = useState(false);

  return (
    <div style={{ marginBottom: 24 }}>
      {!show ? (
        <button onClick={() => setShow(true)} style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "8px 16px", fontSize: 13, fontWeight: 500, color: "#fff",
          background: "#4f46e5", border: "none", borderRadius: 8, cursor: "pointer",
          boxShadow: "0 1px 3px rgba(79,70,229,0.3)",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Tambah User
        </button>
      ) : (
        <div className="card" style={{ padding: 20, maxWidth: 480 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0f172a" }}>Tambah User Baru</h3>
            <button onClick={() => setShow(false)} style={{
              background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 18, lineHeight: 1,
            }}>×</button>
          </div>

          {state.success && (
            <div style={{ marginBottom: 12, padding: "8px 12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8 }}>
              <p style={{ margin: 0, fontSize: 13, color: "#16a34a" }}>User berhasil ditambahkan</p>
            </div>
          )}
          {state.error && (
            <div style={{ marginBottom: 12, padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8 }}>
              <p style={{ margin: 0, fontSize: 13, color: "#dc2626" }}>{state.error}</p>
            </div>
          )}

          <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#64748b", marginBottom: 4 }}>Nama</label>
              <input name="name" type="text" required placeholder="Nama lengkap" className="input" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#64748b", marginBottom: 4 }}>Email</label>
              <input name="email" type="email" required placeholder="email@contoso.com" className="input" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#64748b", marginBottom: 4 }}>Password</label>
              <input name="password" type="password" required placeholder="Min. 8 karakter" className="input" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#64748b", marginBottom: 4 }}>Role</label>
              <select name="role" className="input" defaultValue="AGENT">
                <option value="AGENT">Agent</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button type="submit" disabled={isPending} style={{
                flex: 1, padding: "9px", fontSize: 13, fontWeight: 600, color: "#fff",
                background: isPending ? "rgba(79,70,229,0.6)" : "#4f46e5",
                border: "none", borderRadius: 8, cursor: isPending ? "not-allowed" : "pointer",
              }}>
                {isPending ? "Menyimpan..." : "Simpan"}
              </button>
              <button type="button" onClick={() => setShow(false)} style={{
                padding: "9px 16px", fontSize: 13, fontWeight: 500, color: "#64748b",
                background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer",
              }}>
                Batal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ── Change Password Modal ─────────────────────────────────────────────────────

function ChangePasswordModal({ user, onClose }: { user: User; onClose: () => void }) {
  const [state, formAction, isPending] = useActionState<UserActionState, FormData>(changePasswordAction, {});

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, zIndex: 40,
        background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)",
      }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", zIndex: 50,
        transform: "translate(-50%,-50%)",
        background: "#fff", borderRadius: 16, padding: 24, width: 380,
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#0f172a" }}>Ganti Password</h3>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>{user.name} ({user.email})</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 20, lineHeight: 1 }}>×</button>
        </div>

        {state.success && (
          <div style={{ marginBottom: 12, padding: "8px 12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#16a34a" }}>Password berhasil diubah</p>
          </div>
        )}
        {state.error && (
          <div style={{ marginBottom: 12, padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#dc2626" }}>{state.error}</p>
          </div>
        )}

        <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="hidden" name="userId" value={user.id} />
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#64748b", marginBottom: 4 }}>Password Baru</label>
            <input name="newPassword" type="password" required placeholder="Min. 8 karakter" className="input" />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button type="submit" disabled={isPending} style={{
              flex: 1, padding: "9px", fontSize: 13, fontWeight: 600, color: "#fff",
              background: isPending ? "rgba(79,70,229,0.6)" : "#4f46e5",
              border: "none", borderRadius: 8, cursor: isPending ? "not-allowed" : "pointer",
            }}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </button>
            <button type="button" onClick={onClose} style={{
              padding: "9px 16px", fontSize: 13, fontWeight: 500, color: "#64748b",
              background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer",
            }}>
              Batal
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ── User Row ──────────────────────────────────────────────────────────────────

function UserRow({ user, currentUserId }: { user: User; currentUserId: string }) {
  const [changePwModal, setChangePwModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const isSelf = user.id === currentUserId;

  function handleDelete() {
    if (!confirm(`Hapus user "${user.name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    startTransition(async () => {
      const result = await deleteUserAction(user.id);
      if (result.error) setDeleteError(result.error);
    });
  }

  return (
    <>
      <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
        <td style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: "#fff",
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                {user.name}
                {isSelf && <span style={{ marginLeft: 6, fontSize: 10, color: "#4f46e5", background: "#eef2ff", padding: "1px 6px", borderRadius: 999, fontWeight: 600 }}>Anda</span>}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>{user.email}</p>
            </div>
          </div>
        </td>
        <td style={{ padding: "14px 16px" }}>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
            background: user.role === "ADMIN" ? "#eef2ff" : "#f1f5f9",
            color: user.role === "ADMIN" ? "#4f46e5" : "#475569",
          }}>
            {user.role === "ADMIN" ? "Admin" : "Agent"}
          </span>
        </td>
        <td style={{ padding: "14px 16px", fontSize: 12, color: "#94a3b8" }}>
          {new Date(user.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
        </td>
        <td style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setChangePwModal(true)} style={{
              fontSize: 11, fontWeight: 500, color: "#4f46e5",
              background: "#eef2ff", border: "1px solid #c7d2fe",
              borderRadius: 6, padding: "4px 10px", cursor: "pointer",
            }}>
              Ganti Password
            </button>
            {!isSelf && (
              <button onClick={handleDelete} disabled={isPending} style={{
                fontSize: 11, fontWeight: 500, color: "#dc2626",
                background: "#fef2f2", border: "1px solid #fecaca",
                borderRadius: 6, padding: "4px 10px", cursor: isPending ? "not-allowed" : "pointer",
                opacity: isPending ? 0.6 : 1,
              }}>
                {isPending ? "..." : "Hapus"}
              </button>
            )}
          </div>
          {deleteError && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#dc2626" }}>{deleteError}</p>}
        </td>
      </tr>

      {changePwModal && (
        <ChangePasswordModal user={user} onClose={() => setChangePwModal(false)} />
      )}
    </>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────

export default function UsersClient({ users, currentUserId }: Props) {
  return (
    <div>
      <AddUserForm />

      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
              {["User", "Role", "Bergabung", "Aksi"].map((h) => (
                <th key={h} style={{
                  padding: "10px 16px", textAlign: "left",
                  fontSize: 11, fontWeight: 600, color: "#64748b",
                  letterSpacing: "0.04em", textTransform: "uppercase",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <UserRow key={u.id} user={u} currentUserId={currentUserId} />
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <p style={{ fontSize: 14, color: "#94a3b8", margin: 0 }}>Belum ada user</p>
          </div>
        )}
      </div>
    </div>
  );
}

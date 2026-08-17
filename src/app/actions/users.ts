'use server'

import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { revalidatePath } from "next/cache";

// ── Types ─────────────────────────────────────────────────────────────────────

export type UserActionState = {
  success?: boolean;
  error?: string;
};

// ── Add User ──────────────────────────────────────────────────────────────────

const AddUserSchema = z.object({
  name:     z.string().min(1, "Nama wajib diisi").max(100),
  email:    z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  role:     z.enum(["ADMIN", "AGENT"]),
});

export async function addUserAction(
  _prev: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const session = await verifySession();
  if (session.role !== "ADMIN") return { error: "Hanya admin yang bisa menambah user" };

  const parsed = AddUserSchema.safeParse({
    name:     formData.get("name"),
    email:    formData.get("email"),
    password: formData.get("password"),
    role:     formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, password, role } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "Email sudah digunakan" };

  const passwordHash = await bcrypt.hash(password, 12);
  await db.user.create({ data: { name, email, passwordHash, role } });

  revalidatePath("/settings/users");
  return { success: true };
}

// ── Delete User ───────────────────────────────────────────────────────────────

export async function deleteUserAction(userId: string): Promise<UserActionState> {
  const session = await verifySession();
  if (session.role !== "ADMIN") return { error: "Hanya admin yang bisa menghapus user" };

  // Prevent self-deletion
  if (session.userId === userId) return { error: "Tidak bisa menghapus akun sendiri" };

  // Prevent deleting last admin
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "User tidak ditemukan" };

  if (user.role === "ADMIN") {
    const adminCount = await db.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) return { error: "Tidak bisa menghapus admin terakhir" };
  }

  await db.user.delete({ where: { id: userId } });

  revalidatePath("/settings/users");
  return { success: true };
}

// ── Change Password ───────────────────────────────────────────────────────────

const ChangePasswordSchema = z.object({
  userId:      z.string().min(1),
  newPassword: z.string().min(8, "Password minimal 8 karakter"),
});

export async function changePasswordAction(
  _prev: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const session = await verifySession();
  if (session.role !== "ADMIN") return { error: "Hanya admin yang bisa mengubah password" };

  const parsed = ChangePasswordSchema.safeParse({
    userId:      formData.get("userId"),
    newPassword: formData.get("newPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { userId, newPassword } = parsed.data;
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "User tidak ditemukan" };

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await db.user.update({ where: { id: userId }, data: { passwordHash } });

  revalidatePath("/settings/users");
  return { success: true };
}

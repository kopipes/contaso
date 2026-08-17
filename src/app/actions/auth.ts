'use server'

import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";

const LoginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type LoginState = {
  errors?: { email?: string[]; password?: string[]; form?: string[] };
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { errors: { form: ["Email atau password salah"] } };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { errors: { form: ["Email atau password salah"] } };
  }

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await deleteSession();
  redirect("/login");
}

'use server'

import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  authorizeReplizAccount,
  connectInstagram,
  connectThreads,
  exchangeFacebook,
  connectFacebook,
  removeReplizAccount,
} from "@/lib/repliz";

export async function toggleAccountVisibility(accountId: string, isVisible: boolean) {
  const session = await verifySession();
  if (session.role !== "ADMIN") {
    throw new Error("Hanya admin yang bisa mengubah visibilitas akun");
  }

  await db.trackedAccount.update({
    where: { id: accountId },
    data: { isVisible },
  });

  revalidatePath("/dashboard");
}

// ── OAuth connect actions ─────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://contaso.devop.my.id";

export async function authorizeAccountAction(
  platform: "instagram" | "facebook" | "threads"
): Promise<{ error?: string }> {
  await verifySession();
  try {
    const callbackUrl = `${BASE_URL}/settings/accounts/callback/${platform}`;
    const { url } = await authorizeReplizAccount(platform, callbackUrl);
    redirect(url);
  } catch (e: unknown) {
    // redirect() throws — rethrow it
    if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
    return { error: "Gagal mendapatkan URL otorisasi" };
  }
}

export async function connectInstagramAction(
  code: string
): Promise<{ success?: boolean; error?: string }> {
  const session = await verifySession();
  if (session.role !== "ADMIN") return { error: "Hanya admin" };

  try {
    const account = await connectInstagram(code);
    // Upsert TrackedAccount di DB
    await db.trackedAccount.upsert({
      where: { replizId: account._id },
      update: { name: account.name, platform: "instagram", isVisible: true },
      create: {
        replizId: account._id,
        name: account.name,
        platform: "instagram",
        isVisible: true,
        sortOrder: 0,
      },
    });
    revalidatePath("/settings/accounts");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Gagal menghubungkan akun Instagram" };
  }
}

export async function connectThreadsAction(
  code: string
): Promise<{ success?: boolean; error?: string }> {
  const session = await verifySession();
  if (session.role !== "ADMIN") return { error: "Hanya admin" };

  try {
    const account = await connectThreads(code);
    await db.trackedAccount.upsert({
      where: { replizId: account._id },
      update: { name: account.name, platform: "threads", isVisible: true },
      create: {
        replizId: account._id,
        name: account.name,
        platform: "threads",
        isVisible: true,
        sortOrder: 0,
      },
    });
    revalidatePath("/settings/accounts");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Gagal menghubungkan akun Threads" };
  }
}

export async function exchangeFacebookAction(
  code: string
): Promise<{ token?: string; error?: string }> {
  const session = await verifySession();
  if (session.role !== "ADMIN") return { error: "Hanya admin" };

  try {
    const { token } = await exchangeFacebook(code);
    return { token };
  } catch {
    return { error: "Gagal menukar kode Facebook" };
  }
}

export async function connectFacebookAction(
  pageId: string,
  token: string
): Promise<{ success?: boolean; error?: string }> {
  const session = await verifySession();
  if (session.role !== "ADMIN") return { error: "Hanya admin" };

  try {
    const account = await connectFacebook(pageId, token);
    await db.trackedAccount.upsert({
      where: { replizId: account._id },
      update: { name: account.name, platform: "facebook", isVisible: true },
      create: {
        replizId: account._id,
        name: account.name,
        platform: "facebook",
        isVisible: true,
        sortOrder: 0,
      },
    });
    revalidatePath("/settings/accounts");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Gagal menghubungkan halaman Facebook" };
  }
}

export async function disconnectAccountAction(
  trackedAccountId: string,
  replizAccountId: string
): Promise<{ success?: boolean; error?: string }> {
  const session = await verifySession();
  if (session.role !== "ADMIN") return { error: "Hanya admin" };

  try {
    await removeReplizAccount(replizAccountId);
    await db.trackedAccount.delete({ where: { id: trackedAccountId } });
    revalidatePath("/settings/accounts");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Gagal memutuskan koneksi akun" };
  }
}


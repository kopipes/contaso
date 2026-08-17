'use server'

import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { revalidatePath } from "next/cache";

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

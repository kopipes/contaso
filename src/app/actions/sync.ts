'use server'

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import { listAccounts, getAccountStats, getComments, listChats, getContent, fetchAllPages, ReplizChat, ReplizComment, ReplizContent } from "@/lib/repliz";

export async function syncAction(): Promise<{ success: boolean; message: string }> {
  const session = await verifySession();
  if (session.role !== "ADMIN") {
    return { success: false, message: "Hanya admin yang bisa melakukan sync" };
  }

  try {
    const { docs: accounts } = await listAccounts(1, 100);

    // Remove old demo accounts
    await db.trackedAccount.deleteMany({
      where: { replizId: { in: ["demo-fb-001", "demo-ig-001", "demo-fb-002"] } },
    });

    await Promise.all(
      accounts.map(async (acc, i) => {
        const tracked = await db.trackedAccount.upsert({
          where: { replizId: acc._id },
          update: { name: acc.name, platform: acc.type },
          create: { replizId: acc._id, name: acc.name, platform: acc.type, isVisible: true, sortOrder: i },
        });

        const [statsResult, commentsResult, chatsResult, contentResult] = await Promise.allSettled([
          getAccountStats(acc._id),
          fetchAllPages<ReplizComment>((p, l) => getComments(acc._id, "pending", p, l), 100, 500),
          fetchAllPages<ReplizChat>((p, l) => listChats(acc._id, p, l), 100, 500),
          fetchAllPages<ReplizContent>((p, l) => getContent(acc._id, p, l), 50, 200),
        ]);

        if (statsResult.status === "fulfilled") {
          await db.statsCache.upsert({
            where: { trackedAccountId: tracked.id },
            update: { data: JSON.stringify(statsResult.value), cachedAt: new Date() },
            create: { trackedAccountId: tracked.id, data: JSON.stringify(statsResult.value) },
          });
        }

        if (commentsResult.status === "fulfilled") {
          await db.commentsCache.upsert({
            where: { trackedAccountId: tracked.id },
            update: { data: JSON.stringify(commentsResult.value), cachedAt: new Date() },
            create: { trackedAccountId: tracked.id, data: JSON.stringify(commentsResult.value) },
          });
        }

        if (chatsResult.status === "fulfilled") {
          await db.chatsCache.upsert({
            where: { trackedAccountId: tracked.id },
            update: { data: JSON.stringify(chatsResult.value), cachedAt: new Date() },
            create: { trackedAccountId: tracked.id, data: JSON.stringify(chatsResult.value) },
          });
        }

        if (contentResult.status === "fulfilled") {
          await db.contentCache.upsert({
            where: { trackedAccountId: tracked.id },
            update: { data: JSON.stringify(contentResult.value), cachedAt: new Date() },
            create: { trackedAccountId: tracked.id, data: JSON.stringify(contentResult.value) },
          });
        }
      })
    );

    revalidatePath("/dashboard");
    revalidatePath("/accounts");

    return { success: true, message: `${accounts.length} akun berhasil disync` };
  } catch (e) {
    return { success: false, message: `Sync gagal: ${e instanceof Error ? e.message : "Unknown error"}` };
  }
}

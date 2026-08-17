// prisma/sync-accounts.ts — sync Repliz accounts + cache all data into local DB
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const url = process.env.DATABASE_URL ?? "file:dev.db";
const adapter = new PrismaBetterSqlite3({ url });
const db = new PrismaClient({ adapter });

type PaginatedResponse<T> = { docs: T[]; hasNextPage: boolean; totalDocs: number };

async function replizFetch<T>(path: string, auth: string): Promise<T> {
  const res = await fetch(`https://api.repliz.com/public${path}`, {
    headers: { Authorization: auth, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Repliz API error ${res.status} for ${path}`);
  return res.json() as Promise<T>;
}

/** Fetch all pages up to maxItems */
async function fetchAllPages<T>(
  buildPath: (page: number, limit: number) => string,
  auth: string,
  limit = 100,
  maxItems = 500
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  let hasMore = true;
  while (hasMore && all.length < maxItems) {
    const result = await replizFetch<PaginatedResponse<T>>(buildPath(page, limit), auth);
    all.push(...result.docs);
    hasMore = result.hasNextPage;
    page++;
  }
  return all;
}

async function main() {
  const ACCESS = process.env.REPLIZ_ACCESS_KEY ?? "";
  const SECRET = process.env.REPLIZ_SECRET_KEY ?? "";
  const auth = "Basic " + Buffer.from(`${ACCESS}:${SECRET}`).toString("base64");

  const data = await replizFetch<{ docs: Array<{ _id: string; name: string; type: string }> }>(
    "/account?page=1&limit=100", auth
  );

  console.log(`Syncing ${data.docs.length} accounts...`);

  // Remove old demo accounts
  await db.trackedAccount.deleteMany({
    where: { replizId: { in: ["demo-fb-001", "demo-ig-001", "demo-fb-002"] } },
  });

  await Promise.all(
    data.docs.map(async (acc, i) => {
      const platform = acc.type;

      const tracked = await db.trackedAccount.upsert({
        where: { replizId: acc._id },
        update: { name: acc.name, platform },
        create: { replizId: acc._id, name: acc.name, platform, isVisible: true, sortOrder: i },
      });

      // Fetch stats, comments, chats (all pages), content (all pages) in parallel
      const [statsResult, commentsResult, chatsResult, contentResult] = await Promise.allSettled([
        replizFetch<Record<string, unknown>>(`/account/${acc._id}/statistic`, auth),
        fetchAllPages<unknown>(
          (p, l) => `/comment?accountIds[]=${acc._id}&status=pending&page=${p}&limit=${l}`,
          auth, 100, 500
        ),
        fetchAllPages<unknown>(
          (p, l) => `/chat?accountIds[]=${acc._id}&page=${p}&limit=${l}`,
          auth, 100, 500
        ),
        fetchAllPages<unknown>(
          (p, l) => `/content?accountId=${acc._id}&page=${p}&limit=${l}`,
          auth, 50, 200
        ),
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

      const results = [statsResult, commentsResult, chatsResult, contentResult];
      const ok = results.filter(r => r.status === "fulfilled").length;
      const counts = [
        statsResult.status === "fulfilled" ? "stats" : null,
        commentsResult.status === "fulfilled" ? `${(commentsResult.value as unknown[]).length} komentar` : null,
        chatsResult.status === "fulfilled" ? `${(chatsResult.value as unknown[]).length} chat` : null,
        contentResult.status === "fulfilled" ? `${(contentResult.value as unknown[]).length} konten` : null,
      ].filter(Boolean).join(", ");

      console.log(`  ✓ ${acc.name} (${platform}) — ${ok}/4 cached [${counts}]`);
    })
  );

  console.log("\nSync selesai!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());

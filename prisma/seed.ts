// prisma/seed.ts — creates an initial ADMIN user and sample tracked accounts
import "dotenv/config";
import path from "path";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const url = process.env.DATABASE_URL ?? "file:dev.db";
const adapter = new PrismaBetterSqlite3({ url });
const db = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  await db.user.upsert({
    where: { email: "admin@contaso.local" },
    update: {},
    create: {
      email: "admin@contaso.local",
      name: "Admin",
      passwordHash,
      role: "ADMIN",
    },
  });

  const agentHash = await bcrypt.hash("agent123", 12);
  await db.user.upsert({
    where: { email: "agent@contaso.local" },
    update: {},
    create: {
      email: "agent@contaso.local",
      name: "Agent Demo",
      passwordHash: agentHash,
      role: "AGENT",
    },
  });

  await db.trackedAccount.upsert({
    where: { replizId: "demo-fb-001" },
    update: {},
    create: {
      replizId: "demo-fb-001",
      name: "Contaso Official",
      platform: "facebook",
      isVisible: true,
      sortOrder: 0,
    },
  });

  await db.trackedAccount.upsert({
    where: { replizId: "demo-ig-001" },
    update: {},
    create: {
      replizId: "demo-ig-001",
      name: "Contaso Instagram",
      platform: "instagram",
      isVisible: true,
      sortOrder: 1,
    },
  });

  await db.trackedAccount.upsert({
    where: { replizId: "demo-fb-002" },
    update: {},
    create: {
      replizId: "demo-fb-002",
      name: "Brand Lama (Arsip)",
      platform: "facebook",
      isVisible: false,
      sortOrder: 2,
    },
  });

  console.log("✓ Seed selesai");
  console.log("  Admin  : admin@contaso.local / password123");
  console.log("  Agent  : agent@contaso.local / agent123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

-- CreateTable
CREATE TABLE "ContentCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trackedAccountId" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "cachedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContentCache_trackedAccountId_fkey" FOREIGN KEY ("trackedAccountId") REFERENCES "TrackedAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ContentCache_trackedAccountId_key" ON "ContentCache"("trackedAccountId");

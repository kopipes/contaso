-- CreateTable
CREATE TABLE "CommentsCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trackedAccountId" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "cachedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommentsCache_trackedAccountId_fkey" FOREIGN KEY ("trackedAccountId") REFERENCES "TrackedAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChatsCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trackedAccountId" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "cachedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatsCache_trackedAccountId_fkey" FOREIGN KEY ("trackedAccountId") REFERENCES "TrackedAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CommentsCache_trackedAccountId_key" ON "CommentsCache"("trackedAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatsCache_trackedAccountId_key" ON "ChatsCache"("trackedAccountId");

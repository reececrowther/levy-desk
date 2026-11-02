-- CreateTable
CREATE TABLE "ReminderLog" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "council" TEXT NOT NULL,
    "quarterKey" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReminderLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReminderLog_workspaceId_idx" ON "ReminderLog"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "ReminderLog_workspaceId_council_quarterKey_type_key" ON "ReminderLog"("workspaceId", "council", "quarterKey", "type");

-- AddForeignKey
ALTER TABLE "ReminderLog" ADD CONSTRAINT "ReminderLog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

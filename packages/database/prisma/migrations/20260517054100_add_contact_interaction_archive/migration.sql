-- AlterTable
ALTER TABLE "ContactInteraction" ADD COLUMN "archivedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "ContactInteraction_organizationId_archivedAt_idx" ON "ContactInteraction"("organizationId", "archivedAt");

ALTER TABLE "ApplicationEntry"
ADD COLUMN "archivedAt" TIMESTAMP(3);

CREATE INDEX "ApplicationEntry_archivedAt_idx" ON "ApplicationEntry"("archivedAt");
CREATE UNIQUE INDEX "ApplicationEntry_active_scheduledAt_unique"
ON "ApplicationEntry"("scheduledAt")
WHERE "status" = 'SCHEDULED'
  AND "archivedAt" IS NULL
  AND "scheduledAt" IS NOT NULL;

ALTER TYPE "ApplicationStatus" RENAME VALUE 'DECLINED' TO 'PENDING';
ALTER TYPE "ApplicationStatus" ADD VALUE 'SCHEDULED';

ALTER TABLE "ServicesPage"
ADD COLUMN "applicationAvailableDays" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "applicationVisaTypes" JSONB,
ADD COLUMN "applicationTimeSlots" JSONB;

ALTER TABLE "ApplicationEntry"
ADD COLUMN "scheduledAt" TIMESTAMP(3);

CREATE TABLE "ApplicationStatusHistory" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "fromStatus" "ApplicationStatus",
    "toStatus" "ApplicationStatus" NOT NULL,
    "note" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "actorUserId" INTEGER,
    "actorName" TEXT,
    "actorEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationStatusHistory_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ApplicationStatusHistory"
ADD CONSTRAINT "ApplicationStatusHistory_applicationId_fkey"
FOREIGN KEY ("applicationId") REFERENCES "ApplicationEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "ApplicationEntry_status_idx" ON "ApplicationEntry"("status");
CREATE INDEX "ApplicationEntry_scheduledAt_idx" ON "ApplicationEntry"("scheduledAt");
CREATE INDEX "ApplicationStatusHistory_applicationId_createdAt_idx" ON "ApplicationStatusHistory"("applicationId", "createdAt" DESC);
CREATE INDEX "ApplicationStatusHistory_toStatus_createdAt_idx" ON "ApplicationStatusHistory"("toStatus", "createdAt" DESC);

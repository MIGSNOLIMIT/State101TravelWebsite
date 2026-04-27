CREATE TABLE "DashboardCalendarNote" (
    "id" TEXT NOT NULL,
    "noteDate" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "actorUserId" INTEGER,
    "actorName" TEXT,
    "actorEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardCalendarNote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DashboardCalendarNote_noteDate_key" ON "DashboardCalendarNote"("noteDate");

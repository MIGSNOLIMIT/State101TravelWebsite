DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DashboardCalendarNoteTag') THEN
        CREATE TYPE "DashboardCalendarNoteTag" AS ENUM ('IMPORTANT', 'FOLLOW_UP', 'REMINDER');
    END IF;
END
$$;

ALTER TABLE "DashboardCalendarNote"
ADD COLUMN IF NOT EXISTS "tag" "DashboardCalendarNoteTag" NOT NULL DEFAULT 'REMINDER';

CREATE TABLE IF NOT EXISTS "DashboardCalendarNoteHistory" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "noteDate" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "tag" "DashboardCalendarNoteTag" NOT NULL,
    "actorUserId" INTEGER,
    "actorName" TEXT,
    "actorEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DashboardCalendarNoteHistory_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'DashboardCalendarNoteHistory_noteId_fkey'
          AND table_name = 'DashboardCalendarNoteHistory'
    ) THEN
        ALTER TABLE "DashboardCalendarNoteHistory"
        ADD CONSTRAINT "DashboardCalendarNoteHistory_noteId_fkey"
        FOREIGN KEY ("noteId") REFERENCES "DashboardCalendarNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS "DashboardCalendarNoteHistory_noteId_createdAt_idx"
ON "DashboardCalendarNoteHistory"("noteId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "DashboardCalendarNoteHistory_noteDate_createdAt_idx"
ON "DashboardCalendarNoteHistory"("noteDate", "createdAt" DESC);

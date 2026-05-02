ALTER TABLE "Service"
ADD COLUMN "slotKey" TEXT,
ADD COLUMN "enabled" BOOLEAN NOT NULL DEFAULT true;

UPDATE "Service"
SET "slotKey" = CASE
  WHEN lower(coalesce("country", '')) LIKE '%canada%' OR lower(coalesce("title", '')) LIKE '%canada%' THEN 'canada'
  WHEN lower(coalesce("country", '')) LIKE '%united states%' OR lower(coalesce("title", '')) LIKE '%united states%' OR lower(coalesce("title", '')) LIKE '%america%' THEN 'united-states'
  WHEN lower(coalesce("title", '')) LIKE '%training%' OR lower(coalesce("country", '')) LIKE '%training%' THEN 'short-term-training'
  ELSE NULL
END
WHERE "slotKey" IS NULL;

CREATE UNIQUE INDEX "Service_slotKey_key" ON "Service"("slotKey");

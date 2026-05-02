ALTER TABLE "ServicesPage"
ADD COLUMN "whyChooseEnabled" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "WhyChooseCard"
ADD COLUMN "slotKey" TEXT;

UPDATE "WhyChooseCard"
SET "slotKey" = CASE
  WHEN "id" = 1 THEN 'trusted'
  WHEN "id" = 2 THEN 'experts'
  WHEN "id" = 3 THEN 'guidance'
  WHEN "id" = 4 THEN 'mission'
  ELSE NULL
END
WHERE "slotKey" IS NULL;

CREATE UNIQUE INDEX "WhyChooseCard_slotKey_key" ON "WhyChooseCard"("slotKey");

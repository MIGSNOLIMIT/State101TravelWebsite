CREATE TABLE "WebsiteView" (
  "id" TEXT NOT NULL,
  "visitorId" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "WebsiteView_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WebsiteView_createdAt_idx" ON "WebsiteView"("createdAt");
CREATE INDEX "WebsiteView_path_idx" ON "WebsiteView"("path");
CREATE INDEX "WebsiteView_visitorId_idx" ON "WebsiteView"("visitorId");
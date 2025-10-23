-- CreateTable
CREATE TABLE "Media" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutPage" (
    "id" SERIAL NOT NULL,
    "heroImageUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutPage_pkey" PRIMARY KEY ("id")
);

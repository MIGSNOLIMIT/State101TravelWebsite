-- CreateTable
CREATE TABLE "TermsOfService" (
    "id" SERIAL NOT NULL,
    "heading" TEXT,
    "content" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TermsOfService_pkey" PRIMARY KEY ("id")
);

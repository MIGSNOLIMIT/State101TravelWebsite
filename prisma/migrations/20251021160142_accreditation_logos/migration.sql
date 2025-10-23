-- CreateTable
CREATE TABLE "Accreditation" (
    "id" SERIAL NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "name" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Accreditation_pkey" PRIMARY KEY ("id")
);

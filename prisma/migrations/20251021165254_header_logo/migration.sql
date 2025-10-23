-- CreateTable
CREATE TABLE "Header" (
    "id" SERIAL NOT NULL,
    "logoUrl" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Header_pkey" PRIMARY KEY ("id")
);

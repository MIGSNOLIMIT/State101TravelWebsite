-- CreateTable
CREATE TABLE "Footer" (
    "id" SERIAL NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "socialLinks" TEXT NOT NULL DEFAULT '[]',
    "logoUrl" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Footer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopBar" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "TopBar_pkey" PRIMARY KEY ("id")
);

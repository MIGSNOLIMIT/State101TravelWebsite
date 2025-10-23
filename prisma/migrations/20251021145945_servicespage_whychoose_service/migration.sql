-- CreateTable
CREATE TABLE "Service" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT,
    "country" TEXT NOT NULL,
    "buttonLabel" TEXT,
    "buttonLink" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicesPage" (
    "id" SERIAL NOT NULL,
    "heroImageUrl" TEXT,
    "heroTitle" TEXT,
    "heroDesc" TEXT,
    "sectionTitle" TEXT,
    "sectionDesc" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicesPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhyChooseCard" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT,
    "color" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhyChooseCard_pkey" PRIMARY KEY ("id")
);

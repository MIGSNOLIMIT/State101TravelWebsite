-- CreateTable
CREATE TABLE "Homepage" (
    "id" SERIAL NOT NULL,
    "heroTitle" TEXT NOT NULL,
    "heroDesc" TEXT NOT NULL,
    "heroImages" TEXT[],
    "aboutTitle" TEXT,
    "aboutDesc" TEXT,
    "servicesTitle" TEXT,
    "testimonialsTitle" TEXT,
    "testimonialsImages" TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Homepage_pkey" PRIMARY KEY ("id")
);



export const dynamic = "force-dynamic";
import HomePageClient from "./HomePageClient";

export default async function HomePage() {
  // Fetch homepage data directly from Prisma
  let cmsData = null;
  try {
    const { prisma } = await import('@/lib/prisma');
    let homepage = await prisma.homepage.findFirst();
    if (!homepage) {
      homepage = await prisma.homepage.create({
        data: {
          heroTitle: "Trusted Visa Experts since 2017 - Your Path to the U.S. and Canada",
          heroDesc: "Expert in Visa Assistance Canada and America Immigration Consultancy Specialist",
          heroImages: [],
          aboutTitle: "Who we are?",
          aboutDesc: "Our Mission: To provide reliable and transparent assistance...\nOur Vision: To be the most trusted partner...",
          servicesTitle: "Our Services",
          testimonialsTitle: "Our successful clients",
          testimonialsImages: [],
          testimonialsVideoUrl: "",
        },
      });
    }
    const services = await prisma.service.findMany();
    cmsData = { ...homepage, services };
  } catch (err) {
    console.error('Error fetching homepage data from Prisma:', err);
    cmsData = null;
  }
  return <HomePageClient cmsData={cmsData} />;
}


export const dynamic = "force-dynamic";
import HomePageClient from "./home/HomePageClient.jsx";

import { prisma } from "@/lib/prisma";

export default async function Home() {
  let cmsData = null;
  try {
    // Fetch directly from Prisma instead of calling your own API
  const homepage = await prisma.homepage.findFirst();
    if (homepage) {
      cmsData = {
        heroImages: homepage.heroImages || [],
        testimonialsImages: homepage.testimonialsImages || [],
        testimonialsVideoUrl: homepage.testimonialsVideoUrl || "",
      };
    }
  } catch (error) {
    console.error("❌ Failed to fetch homepage data:", error);
  }
  return <HomePageClient cmsData={cmsData} />;
}


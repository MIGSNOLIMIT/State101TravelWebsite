export const dynamic = "force-dynamic";
import HomePageClient from "./home/HomePageClient.jsx";

import { prisma } from "@/lib/prisma";
import { buildHomepageCmsData, DEFAULT_HOMEPAGE_DATA } from "@/lib/homepage-defaults";

export default async function Home() {
  let cmsData = null;
  try {
    const homepage = await prisma.homepage.findFirst();
    cmsData = buildHomepageCmsData(homepage || DEFAULT_HOMEPAGE_DATA);
  } catch (error) {
    console.error("❌ Failed to fetch homepage data:", error);
  }
  return <HomePageClient cmsData={cmsData} />;
}

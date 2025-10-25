

export const dynamic = "force-dynamic";
import HomePageClient from "./HomePageClient";

export default async function HomePage() {
  let cmsData = null;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const res = await fetch(`${baseUrl}/api/admin/homepage`, { cache: "no-store" });
    if (res.ok) {
      cmsData = await res.json();
    }
  } catch (error) {
    console.error("❌ Failed to fetch CMS data:", error);
  }
  return <HomePageClient cmsData={cmsData} />;
}


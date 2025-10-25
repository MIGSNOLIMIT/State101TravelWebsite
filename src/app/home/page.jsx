

export const dynamic = "force-dynamic";
import HomePageClient from "./HomePageClient";

export default async function HomePage() {
  // Use the provided Vercel URL for production, fallback to local for dev
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  let cmsData = null;
  try {
    const res = await fetch(`${siteUrl}/api/admin/homepage`, { cache: "no-store" });
    if (res.ok) {
      cmsData = await res.json();
    }
  } catch (err) {
    cmsData = null;
  }
  return <HomePageClient cmsData={cmsData} />;
}


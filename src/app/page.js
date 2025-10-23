export const dynamic = "force-dynamic";
import HomePageClient from "./home/HomePageClient.jsx";

export default async function Home() {
  let cmsData = null;
  try {
    const res = await fetch("http://localhost:3000/api/admin/homepage", { cache: 'no-store' });
    cmsData = res.ok ? await res.json() : null;
  } catch {}
  // Only pass cmsData, let HomePageClient handle all fallback rendering
  return <HomePageClient cmsData={cmsData} />;
}




export const dynamic = "force-dynamic";
import HomePageClient from "./HomePageClient";

export default async function HomePage() {
  // Use relative path for server-side fetches
  let cmsData = null;
  try {
    const res = await fetch('/api/admin/homepage', { cache: 'no-store' });
    if (res.ok) {
      cmsData = await res.json();
      console.log('Fetched CMS data:', JSON.stringify(cmsData));
    } else {
      console.log('API response not OK:', res.status);
    }
  } catch (err) {
    console.log('Error fetching CMS data:', err);
    cmsData = null;
  }
  return <HomePageClient cmsData={cmsData} />;
}


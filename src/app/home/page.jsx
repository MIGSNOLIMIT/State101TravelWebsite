

export const dynamic = "force-dynamic";
import HomePageClient from "./HomePageClient";

export default async function HomePage() {
  // Use custom NEXT_PUBLIC_SITE_URL for server-side fetches in production
  let cmsData = null;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const apiUrl = `${baseUrl}/api/admin/homepage`;
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (res.ok) {
      cmsData = await res.json();
      console.log('Fetched CMS data:', JSON.stringify(cmsData));
    } else {
      console.error('API response not OK:', res.status, apiUrl);
    }
  } catch (err) {
    console.error('Error fetching CMS data:', err);
    cmsData = null;
  }
  return <HomePageClient cmsData={cmsData} />;
}


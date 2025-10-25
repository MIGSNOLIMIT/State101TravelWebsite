
import HeroBanner from "./components/HeroBanner";
import OurStory from "./components/OurStory";
import MissionVision from "./components/MissionVision";

export const dynamic = 'force-dynamic';

async function fetchAboutPage() {
  try {
    const url = process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/aboutpage`
      : 'http://localhost:3000/api/aboutpage';
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json;
  } catch {
    return null;
  }
}

export default async function AboutPage() {
  const aboutData = await fetchAboutPage();
  const heroSrc = aboutData?.heroImageUrl || undefined;
  console.log("AboutPage heroSrc:", heroSrc);
  return (
    <main className="bg-white">
      <HeroBanner bannerSrc={heroSrc} />
      <OurStory />
      <MissionVision />
    </main>
  );
}

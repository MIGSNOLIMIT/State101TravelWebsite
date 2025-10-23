import RenderBlocks from "../components/RenderBlocks";
import HeroBanner from "./components/HeroBanner";
import OurStory from "./components/OurStory";
import MissionVision from "./components/MissionVision";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

async function fetchPage(slug, { draft = false, token = '' } = {}) {
  try {
    const base = process.env.NEXT_PUBLIC_CMS_URL || "http://localhost:3001";
    const url = new URL(`${base}/api/pages`);
    url.searchParams.set('where[slug][equals]', slug);
    url.searchParams.set('depth', '3');
    if (draft) url.searchParams.set('draft', 'true');

    const hdrs = {};
    if (token) hdrs.Authorization = `JWT ${token}`;

    const res = await fetch(url.toString(), { cache: "no-store", headers: hdrs });
    if (!res.ok) return null;
    const { docs } = await res.json();
    return docs?.[0] ?? null;
  } catch {
    return null;
  }
}

export default async function AboutPage() {
  // read preview cookie if present (set by /api/preview)
  let token = '';
  try {
    const hdrs = await headers();
    const cookieHeader = hdrs.get('cookie') || '';
    const m = cookieHeader.match(/(?:^|;\s*)payload-token=([^;]+)/);
    if (m) token = decodeURIComponent(m[1]);
  } catch {}

  const isDraft = Boolean(token);
  const pageData = await fetchPage("about", { draft: isDraft, token });
  const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || '';

  const getHeroSrc = (data) => {
    if (!data) return '';
    const mediaArr = Array.isArray(data?.hero?.media) ? data.hero.media : [];
    for (const entry of mediaArr) {
      const img = entry?.image;
      if (img && typeof img === 'object') {
        const raw = img.url || img?.sizes?.large?.url || img?.sizes?.card?.url || '';
        if (raw) return raw.startsWith('http') ? raw : `${CMS_URL}${raw}`;
      }
      if (typeof img === 'string' && img) {
        return img.startsWith('http') ? img : `${CMS_URL}${img}`;
      }
    }
    const rawHero = data?.hero?.image?.url;
    if (rawHero) return rawHero.startsWith('http') ? rawHero : `${CMS_URL}${rawHero}`;
    const metaImg = data?.meta?.image;
    if (metaImg && typeof metaImg === 'object' && metaImg.url) {
      return metaImg.url.startsWith('http') ? metaImg.url : `${CMS_URL}${metaImg.url}`;
    }
    return '';
  };

  const heroSrc = getHeroSrc(pageData);
  // We keep the hero CMS-driven, but make the rest of the page static.

  return (
    <main className="bg-white">
      <HeroBanner bannerSrc={heroSrc || undefined} />
  <OurStory />
  <MissionVision />
    </main>
  );
}

import Hero from "./Hero";
import AboutPreview from "../components/AboutPreview";
import ServicesPreview from "./ServicesPreview";
import Testimonials from "./Testimonials";
import { buildHomepageCmsData, getHomepageServices } from "@/lib/homepage-defaults";

export default function HomePageClient({ cmsData }) {
  const homepageData = buildHomepageCmsData(cmsData);

  const staticHeroData = {
    title: "Trusted Visa Experts since 2017 - Your Path to the U.S. and Canada",
    description: "Expert in Visa Assistance Canada and America Immigration Consultancy Specialist",
    media: [{ url: "/images/default-hero.jpg" }],
  };

  const staticAboutData = {
    heading: "Who we are?",
    image: { url: "/images/logo.png" },
    missionTitle: "Our Mission",
    missionDescription:
      "To provide reliable and transparent assistance for securing U.S. and Canada visas, empowering our clients to achieve their travel and immigration goals.",
    visionTitle: "Our Vision",
    visionDescription:
      "To be the primary and most trusted partner for U.S. and Canada Visa applicants, known for expertise, integrity, and successful results.",
  };

  const heroData = {
    ...staticHeroData,
    media: (homepageData.heroImages.length ? homepageData.heroImages : staticHeroData.media).map((url) => ({ url })),
  };

  const aboutData = {
    ...staticAboutData,
    heading: homepageData.aboutTitle || staticAboutData.heading,
    image: {
      url: homepageData.aboutLogoUrl || staticAboutData.image.url,
    },
    missionTitle: homepageData.aboutMissionTitle || staticAboutData.missionTitle,
    missionDescription: homepageData.aboutMissionDescription || staticAboutData.missionDescription,
    visionTitle: homepageData.aboutVisionTitle || staticAboutData.visionTitle,
    visionDescription: homepageData.aboutVisionDescription || staticAboutData.visionDescription,
  };

  const servicesData = {
    title: homepageData.servicesTitle,
    services: getHomepageServices(homepageData),
  };

  const testimonialsData = {
    title: homepageData.testimonialsTitle || null,
    images: homepageData.testimonialsImages,
    videoUrl: homepageData.testimonialsVideoUrl || "",
  };

  return (
    <main className="bg-white" style={{ backgroundColor: "white" }}>
      <Hero heroData={heroData} />
      <AboutPreview aboutData={aboutData} />
      <ServicesPreview servicesData={servicesData} />
      <Testimonials testimonialsData={testimonialsData} />
    </main>
  );
}

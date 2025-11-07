import Hero from "./Hero";
import AboutPreview from "../components/AboutPreview";
import ServicesPreview from "./ServicesPreview";
import Testimonials from "./Testimonials";

export default function HomePageClient({ cmsData }) {
  // Static baseline (text + default images)
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

  const staticServicesData = {
    title: "Our Services",
    services: [
      {
        title: "Canada",
        description:
          "Expert assistance for Express Entry Permanent Residency. We provide start-to-finish support for a successful application and approval. Clear guidance. Proven success.",
        iconUrl: "/images/Canada_Flag_logo.png",
        link: "/services",
      },
      {
        title: "United States",
        description:
          "Get comprehensive, start-to-finish assistance for your visa application. Benefit from thorough assessments and personalized pre-interview briefings. We maximize your chances for success.",
        iconUrl: "/images/US_Flag_logo.png",
        link: "/services",
      },
    ],
  };

  // No static fallbacks for testimonials

  // Merge CMS overrides
  const heroData = {
    ...staticHeroData,
    media: (cmsData?.heroImages?.length ? cmsData.heroImages : staticHeroData.media).map(url => ({ url })),
  };

  const testimonialsData = {
    title: cmsData?.testimonialsTitle || null,
    images: Array.isArray(cmsData?.testimonialsImages) ? cmsData.testimonialsImages : [],
    videoUrl: cmsData?.testimonialsVideoUrl || "",
  };

  return (
    <main className="bg-white" style={{ backgroundColor: 'white' }}>
      <Hero heroData={heroData} />
      <AboutPreview aboutData={staticAboutData} />
      <ServicesPreview servicesData={staticServicesData} />
      <Testimonials testimonialsData={testimonialsData} />
    </main>
  );
}
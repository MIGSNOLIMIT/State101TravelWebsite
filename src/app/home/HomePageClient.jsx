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
          "Assistance for Canada visa applications, including tourist, student, and work visas. Expert guidance and document review.",
        iconUrl: "/images/Canada_Flag_logo.png",
        link: "/services",
      },
      {
        title: "United States",
        description:
          "Support for U.S. visa applications, including B1/B2, student, and work visas. Professional advice and interview preparation.",
        iconUrl: "/images/US_Flag_logo.png",
        link: "/services",
      },
    ],
  };

  const staticTestimonialsData = {
    title: "Our successful clients",
    images: [
      "/images/testimonial1.jpg",
      "/images/testimonial2.jpg",
      "/images/testimonial3.jpg",
    ],
    videoUrl: "/videos/testimonials.mp4",
  };

  // Merge CMS overrides
  const heroData = {
    ...staticHeroData,
    media: (cmsData?.heroImages?.length ? cmsData.heroImages : staticHeroData.media).map(url => ({ url })),
  };

  const testimonialsData = {
    ...staticTestimonialsData,
    images: cmsData?.testimonialsImages?.length
      ? cmsData.testimonialsImages
      : staticTestimonialsData.images,
    videoUrl: cmsData?.testimonialsVideoUrl || staticTestimonialsData.videoUrl,
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
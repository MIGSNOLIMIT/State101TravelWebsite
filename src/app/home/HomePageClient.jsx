import Hero from "./Hero";
import AboutPreview from "../components/AboutPreview";
import ServicesPreview from "./ServicesPreview";
import Testimonials from "./Testimonials";

const staticHeroData = {
  title: "Trusted Visa Experts since 2017 - Your Path to the U.S. and Canada",
  description: "Expert in Visa Assistance Canada and America Immigration Consultancy Specialist",
  media: [
    { url: "/images/hero.jpg" },
    { url: "/images/hero1.jpg" },
    { url: "/images/hero3.jpg" },
  ],
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
      link: "/services/canada",
    },
    {
      title: "United States",
      description:
        "Support for U.S. visa applications, including B1/B2, student, and work visas. Professional advice and interview preparation.",
      iconUrl: "/images/US_Flag_logo.png",
      link: "/services/us",
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

export default function HomePageClient({ cmsData }) {
  // Merge CMS images/videos with static text
  const heroData = {
    ...staticHeroData,
    media:
      cmsData?.heroImages?.length > 0
        ? cmsData.heroImages.map((url) => ({ url }))
        : staticHeroData.media,
  };

  const aboutData = staticAboutData;
  const servicesData = staticServicesData;
  const testimonialsData = {
    ...staticTestimonialsData,
    images:
      cmsData?.testimonialsImages?.length > 0
        ? cmsData.testimonialsImages
        : staticTestimonialsData.images,
    videoUrl:
      cmsData?.testimonialsVideoUrl || staticTestimonialsData.videoUrl,
  };

  return (
    <main>
      <Hero heroData={heroData} />
      <AboutPreview aboutData={aboutData} />
      <ServicesPreview servicesData={servicesData} />
      <Testimonials testimonialsData={testimonialsData} />
    </main>
  );
}
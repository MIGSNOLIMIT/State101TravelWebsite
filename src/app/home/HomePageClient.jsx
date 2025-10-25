import Hero from "./Hero";
import AboutPreview from "../components/AboutPreview";
import ServicesPreview from "./ServicesPreview";
import Testimonials from "./Testimonials";

const staticHeroData = {
  title: "Trusted Visa Experts since 2017- Your Path to the U.S. and Canada",
  description: "Expert in Visa Assistance Canada and America Immigration Consultancy Specialist",
  
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
  // Parse about section
  const aboutData = cmsData
    ? {
        heading: cmsData.aboutTitle,
        image: cmsData.heroImages?.[0] ? { url: cmsData.heroImages[0] } : null,
        missionTitle: 'Mission',
        missionDescription: cmsData.aboutDesc?.split('Our Mission:')[1]?.split('Our Vision:')[0]?.trim() || '',
        visionTitle: 'Vision',
        visionDescription: cmsData.aboutDesc?.split('Our Vision:')[1]?.trim() || '',
      }
    : null;

  // Parse services section
  const servicesData = cmsData
    ? {
        title: cmsData.servicesTitle,
        services: cmsData.services || [],
      }
    : null;

  // Parse testimonials section
  const testimonialsData = cmsData
    ? {
        title: cmsData.testimonialsTitle,
        images: cmsData.testimonialsImages || [],
        videoUrl: cmsData.testimonialsVideoUrl || '',
      }
    : null;

  // Parse hero section
  const heroData = cmsData
    ? {
        title: cmsData.heroTitle,
        description: cmsData.heroDesc,
        media: (cmsData.heroImages || []).map((url) => ({ url })),
      }
    : null;

  // Only fallback if cmsData is completely missing
  const showStaticFallback = !cmsData;

  return (
    <main>
      {/* DEBUG: Show raw cmsData for troubleshooting */}
      <pre style={{background:'#eef',padding:'1rem',marginBottom:'1rem',overflow:'auto'}}>
        {JSON.stringify(cmsData, null, 2)}
      </pre>
      {!showStaticFallback ? (
        <>
          <Hero heroData={heroData} />
          <AboutPreview aboutData={aboutData} />
          <ServicesPreview servicesData={servicesData} />
          <Testimonials testimonialsData={testimonialsData} />
        </>
      ) : (
        <div>
          <div style={{background:'#ffe',padding:'1rem',textAlign:'center',fontWeight:'bold',color:'#d00'}}>Static homepage fallback: CMS not available or incomplete</div>
          <Hero heroData={staticHeroData} />
          <AboutPreview aboutData={staticAboutData} />
          <ServicesPreview servicesData={staticServicesData} />
          <Testimonials testimonialsData={staticTestimonialsData} />
        </div>
      )}
    </main>
  );
}
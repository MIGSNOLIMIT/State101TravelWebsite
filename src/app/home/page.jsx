
"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import Hero from './Hero';
import AboutPreview from '../components/AboutPreview';
import ServicesPreview from './ServicesPreview';
import Testimonials from './Testimonials';



export default function HomePage() {
  const [cmsData, setCmsData] = useState(null);

  useEffect(() => {
    async function fetchHome() {
      try {
        const res = await fetch('/api/admin/homepage');
        if (!res.ok) throw new Error('Failed to fetch homepage');
        const data = await res.json();
        setCmsData(data);
      } catch (err) {
        setCmsData(null);
      }
    }
    fetchHome();
  }, []);

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

  // Only require hero and testimonials data to show CMS homepage
  const isValidCms = cmsData && heroData && testimonialsData && Array.isArray(heroData.media) && heroData.media.length > 0 && Array.isArray(testimonialsData.images) && testimonialsData.images.length > 0;

  // Show static fallback only if essential CMS data is missing
  const showStaticFallback = !isValidCms;

  return (
    <main>
      {!showStaticFallback ? (
        <>
          <Hero heroData={heroData} />
          <AboutPreview aboutData={aboutData} />
          {/* If servicesData exists, show dynamic; else show static */}
          {servicesData && Array.isArray(servicesData.services) && servicesData.services.length > 0 ? (
            <ServicesPreview servicesData={servicesData} />
          ) : (
            <ServicesPreview
              servicesData={{
                title: "Our Services",
                services: [
                  {
                    title: "Canada",
                    description:
                      "Assistance for Canada visa applications, including tourist, student, and work visas. Expert guidance and document review.",
                    iconUrl: "/icons/Canada_Flag_logo.png",
                    link: "/services/canada",
                  },
                  {
                    title: "United States",
                    description:
                      "Support for U.S. visa applications, including B1/B2, student, and work visas. Professional advice and interview preparation.",
                    iconUrl: "/icons/US_Flag_logo.png",
                    link: "/services/us",
                  },
                ],
              }}
            />
          )}
          <Testimonials testimonialsData={testimonialsData} />
        </>
      ) : (
        <div>
          <div style={{background:'#ffe',padding:'1rem',textAlign:'center',fontWeight:'bold',color:'#d00'}}>Static homepage fallback: CMS not available or incomplete</div>
          <Hero
            heroData={{
              title: "Trusted Visa Experts since 2017- Your Path to the U.S. and Canada",
              description: "Expert in Visa Assistance Canada and America Immigration Consultancy Specialist",
            }}
          />
          <AboutPreview
            aboutData={{
              heading: "Who we are?",
              image: { url: "/images/logo.png" },
              missionTitle: "Our Mission",
              missionDescription:
                "To provide reliable and transparent assistance for securing U.S. and Canada visas, empowering our clients to achieve their travel and immigration goals.",
              visionTitle: "Our Vision",
              visionDescription:
                "To be the primary and most trusted partner for U.S. and Canada Visa applicants, known for expertise, integrity, and successful results.",
            }}
          />
          <ServicesPreview
            servicesData={{
              title: "Our Services",
              services: [
                {
                  title: "Canada",
                  description:
                    "Assistance for Canada visa applications, including tourist, student, and work visas. Expert guidance and document review.",
                  iconUrl: "/icons/Canada_Flag_logo.png",
                  link: "/services/canada",
                },
                {
                  title: "United States",
                  description:
                    "Support for U.S. visa applications, including B1/B2, student, and work visas. Professional advice and interview preparation.",
                  iconUrl: "/icons/US_Flag_logo.png",
                  link: "/services/us",
                },
              ],
            }}
          />
          <Testimonials
            testimonialsData={{
              title: "Our successful clients",
              images: [
                "/images/testimonial1.jpg",
                "/images/testimonial2.jpg",
                "/images/testimonial3.jpg",
              ],
              videoUrl: "/videos/testimonials.mp4",
            }}
          />
        </div>
      )}
    </main>
  );
}


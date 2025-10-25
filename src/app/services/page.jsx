"use client";
export const dynamic = "force-dynamic";

import React from "react";


import AlternatingSection from "./components/AlternatingSection";
import ServicesHero from "./components/ServicesHero";
import WhyChoose from "./components/WhyChoose";

const staticHero = {
  heroImageUrl: "/images/services-hero.jpg",
  heroTitle: "Our Services",
  heroDesc: "At State101 Travel, we make every process simpler, clearer, and stress-free, so you can focus on your journey ahead.",
};
const staticSections = [
  {
    iconUrl: "/images/section1.png",
    title: <span style={{color: '#0F4695'}}>For United States</span>,
    description: "We provide visa consultancy services for those planning to travel, work, or train in the U.S. Many of our clients choose to undergo caregiver training opportunities, where they can gain valuable experience while enjoying free accommodation and meals during their program. We guide you from requirements submission to orientation, making sure you are well-prepared for your journey.",
    country: "United States",
    buttonLabel: "Inquire Now",
    buttonLink: "#",
  },
  {
    iconUrl: "/images/section2.png",
    title: <span style={{color: '#0F4695'}}>For Canada</span>,
    description: "We assist clients in applying for Permanent Residency through the Express Entry system. From checking your eligibility, completing requirements, and creating your profile, to guiding you in preparing the needed documents—we are with you all the way until submission. We ensure you understand every step, increasing your chances of success in achieving your dream of living and working in Canada.",
    country: "Canada",
    buttonLabel: "Inquire Now",
    buttonLink: "#",
  },
  {
    iconUrl: "/images/section3.jpg",
    title: <span style={{color: '#0F4695'}}>Training Opportunities</span>,
    description: "We don't just help you with visas—we also open doors to new opportunities. We specialize in guiding clients who want to pursue short-term caregiver training in the U.S. It's a chance to gain valuable skills and experience that can shape your future career. We know that moving for training can be a big step, which is why we've made this journey as stress-free as possible.",
    country: "Training",
    buttonLabel: "Inquire Now",
    buttonLink: "#",
  },
];



export default function ServicesPage() {
  const [page, setPage] = React.useState(null);
  React.useEffect(() => {
    async function fetchPage() {
      const res = await fetch("/api/admin/services-page");
      if (res.ok) {
        const data = await res.json();
        setPage(data);
      }
    }
    fetchPage();
  }, []);

  // Use CMS data if available, otherwise fallback to static
  const hero = page ? {
    heroImageUrl: page.heroImageUrl || staticHero.heroImageUrl,
    heroTitle: page.heroTitle || staticHero.heroTitle,
    heroDesc: page.heroDesc || staticHero.heroDesc,
  } : staticHero;
  const sections = page?.sections?.length ? page.sections : staticSections;

  return (
    <main>
      <ServicesHero bannerSrc={hero.heroImageUrl} title={hero.heroTitle} description={hero.heroDesc} />
      {sections.map((section, index) => (
        <AlternatingSection
          key={section.id || index}
          imageSrc={section.iconUrl}
          header={section.title}
          description={section.description}
          reverse={index % 2 === 1}
          lineColor={index % 2 === 0 ? "blue" : "red"}
          bgColor={index % 2 === 0 ? "gray" : "white"}
          buttonColor={index % 2 === 0 ? "blue" : "red"}
        />
      ))}
      <WhyChoose />
    </main>
  );
}

"use client";
export const dynamic = "force-dynamic";

import React from "react";


import AlternatingSection from "./components/AlternatingSection";
import ServicesHero from "./components/ServicesHero";
import WhyChoose from "./components/WhyChoose";
import ApplicationFormEmbed from "./components/ApplicationFormEmbed";
const staticSections = [
  {
    iconUrl: "/images/section1.png",
    title: <span style={{color: '#00008b'}}>For United States</span>,
    description: "We offer comprehensive Visa Consultancy and Assistance for individuals planning to have their Visas to the United States. Our expert team provides end to end guidance throughout the entire application process, from the initial consultation to the successful completion of your visa application. We also conduct thorough assessments and pre-interview briefings to ensure you are fully prepared and confident for your visa interview.",
    country: "United States",
    buttonLabel: "Inquire Now",
    buttonLink: "#",
  },
  {
    iconUrl: "/images/section2.png",
    title: <span style={{color: '#00008b'}}>For Canada</span>,
    description: "We offer comprehensive assistance to individuals applying for Permanent Residency through the Express Entry System. Our dedicated team provides end to end support, guiding you through every stage of the process, from the initial eligibility assessment and document preparation to the successful approval of your visa. With our professional expertise and personalized approach, we ensure you have a clear understanding of each step, enhancing your chances of a successful application and a seamless transition to your new life in Canada",
    country: "Canada",
    buttonLabel: "Inquire Now",
    buttonLink: "#",
  },
  {
    iconUrl: "/images/section3.jpg",
    title: <span style={{color: '#00008b'}}>Short term Training</span>,
    description: "We facilitate U.S. visa processing with an opportunity to undergo a short-term caregiver training program in the United States. The program includes free meals and accommodations, and monthly allowance.",
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

  // CMS-only hero: render only when CMS provides an image URL
  const hero = page && page.heroImageUrl ? {
    heroImageUrl: page.heroImageUrl,
    heroTitle: page.heroTitle || null,
    heroDesc: page.heroDesc || null,
  } : null;
  const sections = page?.sections?.length ? page.sections : staticSections;

  return (
    <main>
      {hero && (
        <ServicesHero bannerSrc={hero.heroImageUrl} title={hero.heroTitle} description={hero.heroDesc} />
      )}
      {sections.map((section, index) => (
        <React.Fragment key={section.id || index}>
          <AlternatingSection
            imageSrc={section.iconUrl}
            header={section.title}
            description={section.description}
            reverse={index % 2 === 1}
            lineColor={index % 2 === 0 ? "blue" : "red"}
            bgColor={index % 2 === 0 ? "gray" : "white"}
            buttonColor={index % 2 === 0 ? "blue" : "red"}
          />
          {/* Insert Application Form after the Short Term Training (3rd) section in hardcoded fallback */}
          {!page?.sections?.length && index === 2 ? <ApplicationFormEmbed /> : null}
        </React.Fragment>
      ))}
      <WhyChoose />
    </main>
  );
}

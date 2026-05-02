"use client";
export const dynamic = "force-dynamic";

import React from "react";
import AlternatingSection from "./components/AlternatingSection";
import ServicesHero from "./components/ServicesHero";
import WhyChoose from "./components/WhyChoose";
import ApplicationFormEmbed from "./components/ApplicationFormEmbed";
import { getServicesSectionAnchor } from "@/lib/services-navigation";
import { buildServicesPageData } from "@/lib/services-page-defaults";

export default function ServicesPage() {
  const [page, setPage] = React.useState(() => buildServicesPageData());

  React.useEffect(() => {
    async function fetchPage() {
      const res = await fetch("/api/admin/services-page", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setPage(buildServicesPageData(data, data?.sections, data?.whyChooseCards));
      }
    }
    fetchPage();
  }, []);

  const hero = page?.heroImageUrl
    ? {
        heroImageUrl: page.heroImageUrl,
        heroTitle: page.heroTitle || null,
        heroDesc: page.heroDesc || null,
      }
    : null;

  const sections = React.useMemo(
    () => (Array.isArray(page?.sections) ? page.sections.filter((section) => section.enabled) : []),
    [page?.sections]
  );

  React.useEffect(() => {
    if (typeof window === "undefined" || !sections.length) return;
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;

    const target = document.getElementById(hash);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [sections]);

  return (
    <main>
      {hero && (
        <ServicesHero bannerSrc={hero.heroImageUrl} title={hero.heroTitle} description={hero.heroDesc} />
      )}
      {sections.map((section, index) => (
        <React.Fragment key={section.id || section.slotKey || index}>
          <AlternatingSection
            sectionId={getServicesSectionAnchor(section.country || section.title)}
            imageSrc={section.iconUrl}
            header={section.title}
            description={section.description}
            reverse={index % 2 === 1}
            bgColor={index % 2 === 0 ? "gray" : "white"}
            buttonColor={index % 2 === 0 ? "blue" : "red"}
          />
        </React.Fragment>
      ))}
      <ApplicationFormEmbed />
      <WhyChoose
        enabled={page?.whyChooseEnabled}
        title={page?.sectionTitle}
        description={page?.sectionDesc}
        cards={page?.whyChooseCards}
      />
    </main>
  );
}

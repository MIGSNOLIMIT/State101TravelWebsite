export const DEFAULT_HOMEPAGE_DATA = {
  heroTitle: "Trusted Visa Experts since 2017 - Your Path to the U.S. and Canada",
  heroDesc: "Expert in Visa Assistance Canada and America Immigration Consultancy Specialist",
  heroImages: [],
  aboutTitle: "Who we are?",
  aboutLogoUrl: "/images/logo.png",
  aboutMissionTitle: "Our Mission",
  aboutMissionDescription:
    "To provide reliable and transparent assistance in securing U.S. and Canada visas for travel, work, visiting family, or migration. We aim to make the application process clear, smooth, and stress-free for every client.",
  aboutVisionTitle: "Our Vision",
  aboutVisionDescription:
    "To be the most trusted partner in U.S. and Canada visa assistance, helping people achieve their goals abroad through professional service, integrity, and dedication.",
  aboutDesc: "Our Mission: To provide reliable and transparent assistance...\nOur Vision: To be the most trusted partner...",
  servicesTitle: "Our Services",
  canadaServiceEnabled: true,
  canadaServiceTitle: "Canada",
  canadaServiceDescription:
    "Expert assistance for Express Entry Permanent Residency. We provide start-to-finish support for a successful application and approval. Clear guidance. Proven success.",
  unitedStatesServiceEnabled: true,
  unitedStatesServiceTitle: "United States",
  unitedStatesServiceDescription:
    "Get comprehensive, start-to-finish assistance for your visa application. Benefit from thorough assessments and personalized pre-interview briefings. We maximize your chances for success.",
  testimonialsTitle: "Our successful clients",
  testimonialsImages: [],
  testimonialsVideoUrl: "",
};

function normalizeString(value, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function normalizeStringArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

export function buildHomepageCmsData(homepage = {}) {
  return {
    id: homepage?.id ?? null,
    heroTitle: normalizeString(homepage?.heroTitle, DEFAULT_HOMEPAGE_DATA.heroTitle),
    heroDesc: normalizeString(homepage?.heroDesc, DEFAULT_HOMEPAGE_DATA.heroDesc),
    heroImages: normalizeStringArray(homepage?.heroImages),
    aboutTitle: normalizeString(homepage?.aboutTitle, DEFAULT_HOMEPAGE_DATA.aboutTitle),
    aboutLogoUrl: normalizeString(homepage?.aboutLogoUrl, DEFAULT_HOMEPAGE_DATA.aboutLogoUrl),
    aboutMissionTitle: normalizeString(homepage?.aboutMissionTitle, DEFAULT_HOMEPAGE_DATA.aboutMissionTitle),
    aboutMissionDescription: normalizeString(
      homepage?.aboutMissionDescription,
      DEFAULT_HOMEPAGE_DATA.aboutMissionDescription,
    ),
    aboutVisionTitle: normalizeString(homepage?.aboutVisionTitle, DEFAULT_HOMEPAGE_DATA.aboutVisionTitle),
    aboutVisionDescription: normalizeString(
      homepage?.aboutVisionDescription,
      DEFAULT_HOMEPAGE_DATA.aboutVisionDescription,
    ),
    aboutDesc: normalizeString(homepage?.aboutDesc, DEFAULT_HOMEPAGE_DATA.aboutDesc),
    servicesTitle: normalizeString(homepage?.servicesTitle, DEFAULT_HOMEPAGE_DATA.servicesTitle),
    canadaServiceEnabled: homepage?.canadaServiceEnabled ?? DEFAULT_HOMEPAGE_DATA.canadaServiceEnabled,
    canadaServiceTitle: normalizeString(homepage?.canadaServiceTitle, DEFAULT_HOMEPAGE_DATA.canadaServiceTitle),
    canadaServiceDescription: normalizeString(
      homepage?.canadaServiceDescription,
      DEFAULT_HOMEPAGE_DATA.canadaServiceDescription,
    ),
    unitedStatesServiceEnabled:
      homepage?.unitedStatesServiceEnabled ?? DEFAULT_HOMEPAGE_DATA.unitedStatesServiceEnabled,
    unitedStatesServiceTitle: normalizeString(
      homepage?.unitedStatesServiceTitle,
      DEFAULT_HOMEPAGE_DATA.unitedStatesServiceTitle,
    ),
    unitedStatesServiceDescription: normalizeString(
      homepage?.unitedStatesServiceDescription,
      DEFAULT_HOMEPAGE_DATA.unitedStatesServiceDescription,
    ),
    testimonialsTitle: normalizeString(homepage?.testimonialsTitle, DEFAULT_HOMEPAGE_DATA.testimonialsTitle),
    testimonialsImages: normalizeStringArray(homepage?.testimonialsImages),
    testimonialsVideoUrl: normalizeString(
      homepage?.testimonialsVideoUrl,
      DEFAULT_HOMEPAGE_DATA.testimonialsVideoUrl,
    ),
    updatedAt: homepage?.updatedAt ?? null,
  };
}

export function getHomepageServices(homepage = {}) {
  const data = buildHomepageCmsData(homepage);

  return [
    {
      key: "canada",
      country: "Canada",
      enabled: data.canadaServiceEnabled,
      title: data.canadaServiceTitle,
      description: data.canadaServiceDescription,
      iconUrl: "/images/Canada_Flag_logo.png",
    },
    {
      key: "united-states",
      country: "United States",
      enabled: data.unitedStatesServiceEnabled,
      title: data.unitedStatesServiceTitle,
      description: data.unitedStatesServiceDescription,
      iconUrl: "/images/US_Flag_logo.png",
    },
  ].filter((service) => service.enabled);
}

import { normalizeApplicationFormSettings } from "./application-form-settings.js";

export const SERVICE_SLOT_ORDER = ["united-states", "canada", "short-term-training"];

export const DEFAULT_SERVICE_SECTIONS = [
  {
    slotKey: "united-states",
    enabled: true,
    iconUrl: "/images/section1.png",
    title: "For United States",
    description:
      "We offer comprehensive Visa Consultancy and Assistance for individuals planning to have their Visas to the United States. Our expert team provides end to end guidance throughout the entire application process, from the initial consultation to the successful completion of your visa application. We also conduct thorough assessments and pre-interview briefings to ensure you are fully prepared and confident for your visa interview.",
    country: "United States",
    buttonLabel: "Inquire Now",
    buttonLink: "#",
  },
  {
    slotKey: "canada",
    enabled: true,
    iconUrl: "/images/section2.png",
    title: "For Canada",
    description:
      "We offer comprehensive assistance to individuals applying for Permanent Residency through the Express Entry System. Our dedicated team provides end to end support, guiding you through every stage of the process, from the initial eligibility assessment and document preparation to the successful approval of your visa. With our professional expertise and personalized approach, we ensure you have a clear understanding of each step, enhancing your chances of a successful application and a seamless transition to your new life in Canada",
    country: "Canada",
    buttonLabel: "Inquire Now",
    buttonLink: "#",
  },
  {
    slotKey: "short-term-training",
    enabled: true,
    iconUrl: "/images/section3.jpg",
    title: "Short term Training",
    description:
      "We facilitate U.S. visa processing with an opportunity to undergo a short-term caregiver training program in the United States. The program includes free meals and accommodations, and monthly allowance.",
    country: "Training",
    buttonLabel: "Inquire Now",
    buttonLink: "#",
  },
];

export const DEFAULT_SERVICES_PAGE_DATA = {
  heroImageUrl: "",
  heroTitle: "Edit your Services Hero here!",
  heroDesc: "This is the default hero description.",
  whyChooseEnabled: true,
  sectionTitle: "Why choose State101 Travel?",
  sectionDesc: "Here's why we believe we are your best partner for a successful visa application:",
  requirementsText: "",
};

export const WHY_CHOOSE_SLOT_ORDER = ["trusted", "experts", "guidance", "mission"];

export const DEFAULT_WHY_CHOOSE_CARDS = [
  {
    slotKey: "trusted",
    title: "We've Been Trusted Since 2017",
    description:
      "With over 9 years of experience, we've guided countless clients to success in their travel and migration journeys.",
    iconUrl: "/icons/handshake_Icon.png",
    color: "bg-red-600",
  },
  {
    slotKey: "experts",
    title: "We're experts you can count on",
    description:
      "Specializing in U.S. and Canada visa applications, we understand the process and make it simple, clear, and stress-free.",
    iconUrl: "/icons/visa_Icon.png",
    color: "bg-blue-600",
  },
  {
    slotKey: "guidance",
    title: "We give you personalized guidance",
    description:
      "Every client's case is unique, so our team provides step-by-step support, from completing requirements to preparing for interviews.",
    iconUrl: "/icons/handCare_Icon.png",
    color: "bg-red-600",
  },
  {
    slotKey: "mission",
    title: "We make your dream our mission",
    description:
      "Whether you want to visit, work, or migrate, we're committed to helping you reach your destination with confidence.",
    iconUrl: "/icons/target_Icon.png",
    color: "bg-blue-600",
  },
];

function normalizeString(value, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function normalizeBoolean(value, fallback = true) {
  return typeof value === "boolean" ? value : fallback;
}

export function resolveServiceSlotKey(section = {}) {
  const direct = String(section?.slotKey || "").trim();
  if (SERVICE_SLOT_ORDER.includes(direct)) {
    return direct;
  }

  const haystack = `${section?.country || ""} ${section?.title || ""}`.toLowerCase();
  if (haystack.includes("canada")) {
    return "canada";
  }
  if (haystack.includes("united states") || haystack.includes("america")) {
    return "united-states";
  }
  if (haystack.includes("training")) {
    return "short-term-training";
  }

  return "";
}

export function buildServiceSections(sections = []) {
  const matchedSections = new Map();

  for (const section of Array.isArray(sections) ? sections : []) {
    const slotKey = resolveServiceSlotKey(section);
    if (!slotKey || matchedSections.has(slotKey)) continue;
    matchedSections.set(slotKey, section);
  }

  return DEFAULT_SERVICE_SECTIONS.map((defaultSection) => {
    const section = matchedSections.get(defaultSection.slotKey) || {};
    return {
      id: section?.id ?? null,
      slotKey: defaultSection.slotKey,
      enabled: normalizeBoolean(section?.enabled, defaultSection.enabled),
      iconUrl: normalizeString(section?.iconUrl, defaultSection.iconUrl),
      title: normalizeString(section?.title, defaultSection.title),
      description: normalizeString(section?.description, defaultSection.description),
      country: normalizeString(section?.country, defaultSection.country),
      buttonLabel: defaultSection.buttonLabel,
      buttonLink: defaultSection.buttonLink,
    };
  });
}

export function buildWhyChooseCards(cards = []) {
  const matchedCards = new Map();

  for (const card of Array.isArray(cards) ? cards : []) {
    const slotKey = String(card?.slotKey || "").trim();
    if (!WHY_CHOOSE_SLOT_ORDER.includes(slotKey) || matchedCards.has(slotKey)) continue;
    matchedCards.set(slotKey, card);
  }

  return DEFAULT_WHY_CHOOSE_CARDS.map((defaultCard) => {
    const card = matchedCards.get(defaultCard.slotKey) || {};
    return {
      id: card?.id ?? null,
      slotKey: defaultCard.slotKey,
      title: normalizeString(card?.title, defaultCard.title),
      description: normalizeString(card?.description, defaultCard.description),
      iconUrl: normalizeString(card?.iconUrl, defaultCard.iconUrl),
      color: normalizeString(card?.color, defaultCard.color),
    };
  });
}

export function buildServicesPageData(page = {}, sections = page?.sections, whyChooseCards = page?.whyChooseCards) {
  return {
    id: page?.id ?? null,
    heroImageUrl: normalizeString(page?.heroImageUrl, DEFAULT_SERVICES_PAGE_DATA.heroImageUrl),
    heroTitle: normalizeString(page?.heroTitle, DEFAULT_SERVICES_PAGE_DATA.heroTitle),
    heroDesc: normalizeString(page?.heroDesc, DEFAULT_SERVICES_PAGE_DATA.heroDesc),
    whyChooseEnabled: normalizeBoolean(page?.whyChooseEnabled, DEFAULT_SERVICES_PAGE_DATA.whyChooseEnabled),
    sectionTitle: normalizeString(page?.sectionTitle, DEFAULT_SERVICES_PAGE_DATA.sectionTitle),
    sectionDesc: normalizeString(page?.sectionDesc, DEFAULT_SERVICES_PAGE_DATA.sectionDesc),
    requirementsText: normalizeString(page?.requirementsText, DEFAULT_SERVICES_PAGE_DATA.requirementsText),
    sections: buildServiceSections(sections),
    whyChooseCards: buildWhyChooseCards(whyChooseCards),
    ...normalizeApplicationFormSettings(page),
    updatedAt: page?.updatedAt ?? null,
  };
}

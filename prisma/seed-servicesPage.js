import { prisma } from "../src/lib/prisma.js";
import {
  DEFAULT_APPLICATION_AVAILABLE_DAYS,
  DEFAULT_APPLICATION_TIME_SLOTS,
  DEFAULT_APPLICATION_VISA_TYPES,
} from "../src/lib/application-form-settings.js";
import {
  DEFAULT_SERVICE_SECTIONS,
  DEFAULT_SERVICES_PAGE_DATA,
  DEFAULT_WHY_CHOOSE_CARDS,
} from "../src/lib/services-page-defaults.js";

async function main() {
  await prisma.servicesPage.upsert({
    where: { id: 1 },
    update: {
      heroImageUrl: DEFAULT_SERVICES_PAGE_DATA.heroImageUrl,
      heroTitle: DEFAULT_SERVICES_PAGE_DATA.heroTitle,
      heroDesc: DEFAULT_SERVICES_PAGE_DATA.heroDesc,
      whyChooseEnabled: DEFAULT_SERVICES_PAGE_DATA.whyChooseEnabled,
      sectionTitle: DEFAULT_SERVICES_PAGE_DATA.sectionTitle,
      sectionDesc: DEFAULT_SERVICES_PAGE_DATA.sectionDesc,
      requirementsText: DEFAULT_SERVICES_PAGE_DATA.requirementsText,
      applicationAvailableDays: DEFAULT_APPLICATION_AVAILABLE_DAYS,
      applicationVisaTypes: DEFAULT_APPLICATION_VISA_TYPES,
      applicationTimeSlots: DEFAULT_APPLICATION_TIME_SLOTS,
    },
    create: {
      id: 1,
      heroImageUrl: DEFAULT_SERVICES_PAGE_DATA.heroImageUrl,
      heroTitle: DEFAULT_SERVICES_PAGE_DATA.heroTitle,
      heroDesc: DEFAULT_SERVICES_PAGE_DATA.heroDesc,
      whyChooseEnabled: DEFAULT_SERVICES_PAGE_DATA.whyChooseEnabled,
      sectionTitle: DEFAULT_SERVICES_PAGE_DATA.sectionTitle,
      sectionDesc: DEFAULT_SERVICES_PAGE_DATA.sectionDesc,
      requirementsText: DEFAULT_SERVICES_PAGE_DATA.requirementsText,
      applicationAvailableDays: DEFAULT_APPLICATION_AVAILABLE_DAYS,
      applicationVisaTypes: DEFAULT_APPLICATION_VISA_TYPES,
      applicationTimeSlots: DEFAULT_APPLICATION_TIME_SLOTS,
    },
  });
  for (const section of DEFAULT_SERVICE_SECTIONS) {
    await prisma.service.upsert({
      where: { slotKey: section.slotKey },
      update: {
        enabled: section.enabled,
        title: section.title,
        description: section.description,
        iconUrl: section.iconUrl,
        country: section.country,
        buttonLabel: section.buttonLabel,
        buttonLink: section.buttonLink,
      },
      create: {
        slotKey: section.slotKey,
        enabled: section.enabled,
        title: section.title,
        description: section.description,
        iconUrl: section.iconUrl,
        country: section.country,
        buttonLabel: section.buttonLabel,
        buttonLink: section.buttonLink,
      },
    });
  }
  for (const card of DEFAULT_WHY_CHOOSE_CARDS) {
    await prisma.whyChooseCard.upsert({
      where: { slotKey: card.slotKey },
      update: {
        title: card.title,
        description: card.description,
        iconUrl: card.iconUrl,
        color: card.color,
      },
      create: {
        slotKey: card.slotKey,
        title: card.title,
        description: card.description,
        iconUrl: card.iconUrl,
        color: card.color,
      },
    });
  }
  console.log("Default servicesPage record created.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

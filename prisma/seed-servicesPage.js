import { prisma } from "../src/lib/prisma.js";
import {
  DEFAULT_APPLICATION_AVAILABLE_DAYS,
  DEFAULT_APPLICATION_TIME_SLOTS,
  DEFAULT_APPLICATION_VISA_TYPES,
} from "../src/lib/application-form-settings.js";

async function main() {
  await prisma.servicesPage.create({
    data: {
      heroImageUrl: "",
      heroTitle: "Edit your Services Hero here!",
      heroDesc: "This is the default hero description.",
      sectionTitle: "",
      sectionDesc: "",
      requirementsText: "",
      applicationAvailableDays: DEFAULT_APPLICATION_AVAILABLE_DAYS,
      applicationVisaTypes: DEFAULT_APPLICATION_VISA_TYPES,
      applicationTimeSlots: DEFAULT_APPLICATION_TIME_SLOTS,
    },
  });
  console.log("Default servicesPage record created.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

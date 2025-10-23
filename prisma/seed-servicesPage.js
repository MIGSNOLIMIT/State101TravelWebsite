import { prisma } from "../src/lib/prisma.js";

async function main() {
  await prisma.servicesPage.create({
    data: {
      heroImageUrl: "",
      heroTitle: "Edit your Services Hero here!",
      heroDesc: "This is the default hero description.",
      sectionTitle: "",
      sectionDesc: "",
    },
  });
  console.log("Default servicesPage record created.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

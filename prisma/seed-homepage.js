import { PrismaClient } from '@prisma/client';
import { DEFAULT_HOMEPAGE_DATA } from '../src/lib/homepage-defaults.js';

const prisma = new PrismaClient();

async function main() {
  await prisma.homepage.upsert({
    where: { id: 1 },
    update: {
      heroTitle: DEFAULT_HOMEPAGE_DATA.heroTitle,
      heroDesc: DEFAULT_HOMEPAGE_DATA.heroDesc,
      heroImages: [
        'https://your-supabase-url/storage/v1/object/public/state101cms/hero1.jpg',
        'https://your-supabase-url/storage/v1/object/public/state101cms/hero2.jpg'
      ],
      aboutTitle: DEFAULT_HOMEPAGE_DATA.aboutTitle,
      aboutLogoUrl: DEFAULT_HOMEPAGE_DATA.aboutLogoUrl,
      aboutMissionTitle: DEFAULT_HOMEPAGE_DATA.aboutMissionTitle,
      aboutMissionDescription: DEFAULT_HOMEPAGE_DATA.aboutMissionDescription,
      aboutVisionTitle: DEFAULT_HOMEPAGE_DATA.aboutVisionTitle,
      aboutVisionDescription: DEFAULT_HOMEPAGE_DATA.aboutVisionDescription,
      aboutDesc: DEFAULT_HOMEPAGE_DATA.aboutDesc,
      servicesTitle: DEFAULT_HOMEPAGE_DATA.servicesTitle,
      canadaServiceEnabled: DEFAULT_HOMEPAGE_DATA.canadaServiceEnabled,
      canadaServiceTitle: DEFAULT_HOMEPAGE_DATA.canadaServiceTitle,
      canadaServiceDescription: DEFAULT_HOMEPAGE_DATA.canadaServiceDescription,
      unitedStatesServiceEnabled: DEFAULT_HOMEPAGE_DATA.unitedStatesServiceEnabled,
      unitedStatesServiceTitle: DEFAULT_HOMEPAGE_DATA.unitedStatesServiceTitle,
      unitedStatesServiceDescription: DEFAULT_HOMEPAGE_DATA.unitedStatesServiceDescription,
      testimonialsTitle: DEFAULT_HOMEPAGE_DATA.testimonialsTitle,
      testimonialsImages: [
        'https://your-supabase-url/storage/v1/object/public/state101cms/testimonial1.jpg',
        'https://your-supabase-url/storage/v1/object/public/state101cms/testimonial2.jpg'
      ],
      testimonialsVideoUrl: 'https://your-supabase-url/storage/v1/object/public/state101cms/testimonials.mp4',
    },
    create: {
      heroTitle: DEFAULT_HOMEPAGE_DATA.heroTitle,
      heroDesc: DEFAULT_HOMEPAGE_DATA.heroDesc,
      heroImages: [
        'https://your-supabase-url/storage/v1/object/public/state101cms/hero1.jpg',
        'https://your-supabase-url/storage/v1/object/public/state101cms/hero2.jpg'
      ],
      aboutTitle: DEFAULT_HOMEPAGE_DATA.aboutTitle,
      aboutLogoUrl: DEFAULT_HOMEPAGE_DATA.aboutLogoUrl,
      aboutMissionTitle: DEFAULT_HOMEPAGE_DATA.aboutMissionTitle,
      aboutMissionDescription: DEFAULT_HOMEPAGE_DATA.aboutMissionDescription,
      aboutVisionTitle: DEFAULT_HOMEPAGE_DATA.aboutVisionTitle,
      aboutVisionDescription: DEFAULT_HOMEPAGE_DATA.aboutVisionDescription,
      aboutDesc: DEFAULT_HOMEPAGE_DATA.aboutDesc,
      servicesTitle: DEFAULT_HOMEPAGE_DATA.servicesTitle,
      canadaServiceEnabled: DEFAULT_HOMEPAGE_DATA.canadaServiceEnabled,
      canadaServiceTitle: DEFAULT_HOMEPAGE_DATA.canadaServiceTitle,
      canadaServiceDescription: DEFAULT_HOMEPAGE_DATA.canadaServiceDescription,
      unitedStatesServiceEnabled: DEFAULT_HOMEPAGE_DATA.unitedStatesServiceEnabled,
      unitedStatesServiceTitle: DEFAULT_HOMEPAGE_DATA.unitedStatesServiceTitle,
      unitedStatesServiceDescription: DEFAULT_HOMEPAGE_DATA.unitedStatesServiceDescription,
      testimonialsTitle: DEFAULT_HOMEPAGE_DATA.testimonialsTitle,
      testimonialsImages: [
        'https://your-supabase-url/storage/v1/object/public/state101cms/testimonial1.jpg',
        'https://your-supabase-url/storage/v1/object/public/state101cms/testimonial2.jpg'
      ],
      testimonialsVideoUrl: 'https://your-supabase-url/storage/v1/object/public/state101cms/testimonials.mp4',
    }
  });
  console.log('Homepage seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });

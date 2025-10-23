import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.homepage.upsert({
    where: { id: 1 },
    update: {
      heroTitle: 'Trusted Visa Experts since 2017 - Your Path to the U.S. and Canada',
      heroDesc: 'Expert in Visa Assistance Canada and America Immigration Consultancy Specialist',
      heroImages: [
        'https://your-supabase-url/storage/v1/object/public/state101cms/hero1.jpg',
        'https://your-supabase-url/storage/v1/object/public/state101cms/hero2.jpg'
      ],
      aboutTitle: 'Who we are?',
      aboutDesc: 'Our Mission: To provide reliable and transparent assistance...\nOur Vision: To be the most trusted partner...',
      servicesTitle: 'Our Services',
      testimonialsTitle: 'Our successful clients',
      testimonialsImages: [
        'https://your-supabase-url/storage/v1/object/public/state101cms/testimonial1.jpg',
        'https://your-supabase-url/storage/v1/object/public/state101cms/testimonial2.jpg'
      ],
      testimonialsVideoUrl: 'https://your-supabase-url/storage/v1/object/public/state101cms/testimonials.mp4',
    },
    create: {
      heroTitle: 'Trusted Visa Experts since 2017 - Your Path to the U.S. and Canada',
      heroDesc: 'Expert in Visa Assistance Canada and America Immigration Consultancy Specialist',
      heroImages: [
        'https://your-supabase-url/storage/v1/object/public/state101cms/hero1.jpg',
        'https://your-supabase-url/storage/v1/object/public/state101cms/hero2.jpg'
      ],
      aboutTitle: 'Who we are?',
      aboutDesc: 'Our Mission: To provide reliable and transparent assistance...\nOur Vision: To be the most trusted partner...',
      servicesTitle: 'Our Services',
      testimonialsTitle: 'Our successful clients',
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

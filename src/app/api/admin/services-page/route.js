import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRoles } from '@/lib/admin-access';
import { buildActorSnapshot, safeWriteAuditLog } from '@/lib/audit-log';
import { buildServicesPageData, DEFAULT_SERVICES_PAGE_DATA, resolveServiceSlotKey } from '@/lib/services-page-defaults';

export const dynamic = "force-dynamic";

async function hasColumn(tableName, columnName) {
  const result = await prisma.$queryRawUnsafe(
    `SELECT 1
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = $1
       AND column_name = $2
     LIMIT 1`,
    tableName,
    columnName
  );

  return Array.isArray(result) && result.length > 0;
}

async function ensureServicesPageSchemaCompatibility() {
  if (!(await hasColumn('ServicesPage', 'whyChooseEnabled'))) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "ServicesPage"
       ADD COLUMN "whyChooseEnabled" BOOLEAN NOT NULL DEFAULT true`
    );
  }

  if (!(await hasColumn('Service', 'slotKey'))) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Service"
       ADD COLUMN "slotKey" TEXT`
    );
  }

  if (!(await hasColumn('Service', 'enabled'))) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Service"
       ADD COLUMN "enabled" BOOLEAN NOT NULL DEFAULT true`
    );
  }

  if (!(await hasColumn('WhyChooseCard', 'slotKey'))) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "WhyChooseCard"
       ADD COLUMN "slotKey" TEXT`
    );
  }

  await prisma.$executeRawUnsafe(`
    UPDATE "Service"
    SET "slotKey" = CASE
      WHEN lower(coalesce("country", '')) LIKE '%canada%' OR lower(coalesce("title", '')) LIKE '%canada%' THEN 'canada'
      WHEN lower(coalesce("country", '')) LIKE '%united states%' OR lower(coalesce("title", '')) LIKE '%united states%' OR lower(coalesce("title", '')) LIKE '%america%' THEN 'united-states'
      WHEN lower(coalesce("title", '')) LIKE '%training%' OR lower(coalesce("country", '')) LIKE '%training%' THEN 'short-term-training'
      ELSE "slotKey"
    END
    WHERE "slotKey" IS NULL
  `);

  await prisma.$executeRawUnsafe(`
    WITH ordered AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
      FROM "WhyChooseCard"
      WHERE "slotKey" IS NULL
    )
    UPDATE "WhyChooseCard" AS card
    SET "slotKey" = CASE
      WHEN ordered.rn = 1 THEN 'trusted'
      WHEN ordered.rn = 2 THEN 'experts'
      WHEN ordered.rn = 3 THEN 'guidance'
      WHEN ordered.rn = 4 THEN 'mission'
      ELSE card."slotKey"
    END
    FROM ordered
    WHERE card.id = ordered.id
  `);

  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "Service_slotKey_key" ON "Service"("slotKey")`
  );
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "WhyChooseCard_slotKey_key" ON "WhyChooseCard"("slotKey")`
  );
}

export async function GET() {
  try {
    await ensureServicesPageSchemaCompatibility();
    let page = await prisma.servicesPage.findFirst();

    if (!page) {
      page = await prisma.servicesPage.create({
        data: DEFAULT_SERVICES_PAGE_DATA,
      });
    }

    const [rawSections, rawWhyChooseCards] = await Promise.all([
      prisma.service.findMany(),
      prisma.whyChooseCard.findMany(),
    ]);
    return NextResponse.json(buildServicesPageData(page, rawSections, rawWhyChooseCards));
  } catch (e) {
    console.error('ServicesPage API error:', e);
    return NextResponse.json(null, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await ensureServicesPageSchemaCompatibility();
    const gate = await requireAdminRoles(['admin', 'editor']);
    if (gate.error) return gate.error;
    const { user } = gate;
    const body = await req.json();
    const normalizedPage = buildServicesPageData(body, body.sections, body.whyChooseCards);

    await prisma.servicesPage.upsert({
      where: { id: normalizedPage.id || 1 },
      update: {
        heroImageUrl: normalizedPage.heroImageUrl,
        heroTitle: normalizedPage.heroTitle,
        heroDesc: normalizedPage.heroDesc,
        whyChooseEnabled: normalizedPage.whyChooseEnabled,
        sectionTitle: normalizedPage.sectionTitle,
        sectionDesc: normalizedPage.sectionDesc,
        requirementsText: normalizedPage.requirementsText ?? null,
        applicationAvailableDays: normalizedPage.availableDays,
        applicationVisaTypes: normalizedPage.visaTypes,
        applicationTimeSlots: normalizedPage.timeSlots,
      },
      create: {
        id: normalizedPage.id || 1,
        heroImageUrl: normalizedPage.heroImageUrl,
        heroTitle: normalizedPage.heroTitle,
        heroDesc: normalizedPage.heroDesc,
        whyChooseEnabled: normalizedPage.whyChooseEnabled,
        sectionTitle: normalizedPage.sectionTitle,
        sectionDesc: normalizedPage.sectionDesc,
        requirementsText: normalizedPage.requirementsText ?? null,
        applicationAvailableDays: normalizedPage.availableDays,
        applicationVisaTypes: normalizedPage.visaTypes,
        applicationTimeSlots: normalizedPage.timeSlots,
      },
    });

    const existingSections = await prisma.service.findMany();
    const retainedIds = [];

    for (const section of normalizedPage.sections) {
      const matchedExisting =
        existingSections.find((item) => item.slotKey === section.slotKey) ||
        existingSections.find((item) => resolveServiceSlotKey(item) === section.slotKey);

      if (matchedExisting) {
        const updated = await prisma.service.update({
          where: { id: matchedExisting.id },
          data: {
            slotKey: section.slotKey,
            enabled: section.enabled,
            title: section.title,
            description: section.description,
            iconUrl: section.iconUrl,
            country: section.country,
            buttonLabel: "Inquire Now",
            buttonLink: "#",
          },
        });
        retainedIds.push(updated.id);
      } else {
        const created = await prisma.service.create({
          data: {
            slotKey: section.slotKey,
            enabled: section.enabled,
            title: section.title,
            description: section.description,
            iconUrl: section.iconUrl,
            country: section.country,
            buttonLabel: "Inquire Now",
            buttonLink: "#",
          },
        });
        retainedIds.push(created.id);
      }
    }

    await prisma.service.deleteMany({
      where: {
        id: {
          notIn: retainedIds,
        },
      },
    });

    const existingWhyChooseCards = await prisma.whyChooseCard.findMany();
    const retainedWhyChooseIds = [];

    for (const card of normalizedPage.whyChooseCards) {
      const matchedExisting = existingWhyChooseCards.find((item) => item.slotKey === card.slotKey);

      if (matchedExisting) {
        const updated = await prisma.whyChooseCard.update({
          where: { id: matchedExisting.id },
          data: {
            slotKey: card.slotKey,
            title: card.title,
            description: card.description,
            iconUrl: card.iconUrl,
            color: card.color,
          },
        });
        retainedWhyChooseIds.push(updated.id);
      } else {
        const created = await prisma.whyChooseCard.create({
          data: {
            slotKey: card.slotKey,
            title: card.title,
            description: card.description,
            iconUrl: card.iconUrl,
            color: card.color,
          },
        });
        retainedWhyChooseIds.push(created.id);
      }
    }

    await prisma.whyChooseCard.deleteMany({
      where: {
        id: {
          notIn: retainedWhyChooseIds,
        },
      },
    });

    await safeWriteAuditLog(req, {
      category: 'content',
      action: 'content.services.update',
      status: 'SUCCESS',
      summary: `${user.name || user.email} updated the services page.`,
      actorSnapshot: buildActorSnapshot(user),
      targetType: 'services-page',
      targetId: normalizedPage.id || 1,
      targetLabel: 'Services Page',
      details: {
        heroTitle: normalizedPage.heroTitle || '',
        sectionsCount: normalizedPage.sections.length,
        enabledSectionsCount: normalizedPage.sections.filter((section) => section.enabled).length,
        whyChooseEnabled: normalizedPage.whyChooseEnabled,
        whyChooseCardsCount: normalizedPage.whyChooseCards.length,
        hasRequirementsText: Boolean(normalizedPage.requirementsText),
        applicationDaysCount: normalizedPage.availableDays.length,
        applicationVisaTypesCount: normalizedPage.visaTypes.length,
        applicationTimeSlotsCount: normalizedPage.timeSlots.length,
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('ServicesPage PUT error:', e);
    return NextResponse.json({ error: 'Failed to update services page' }, { status: 500 });
  }
}

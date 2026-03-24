import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { createPublicMediaUrl, getFolderFromStoragePath, inferAltText, inferMediaTypeFromName } from "@/lib/media";
import { getStorageBucketName, getStorageClient } from "@/lib/supabase-storage";

export async function requireAdminEditor() {
  const session = await getAdminSession();
  if (!session) {
    return { error: { message: "Unauthorized", status: 401 } };
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || !["admin", "editor"].includes(user.role)) {
    return { error: { message: "Forbidden", status: 403 } };
  }

  return { user };
}

async function listFolderRecursively(folder = "") {
  const supabase = getStorageClient();
  const bucket = getStorageBucketName();
  const results = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const { data, error } = await supabase.storage.from(bucket).list(folder, {
      limit,
      offset,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data?.length) {
      break;
    }

    for (const item of data) {
      const storagePath = folder ? `${folder}/${item.name}` : item.name;
      const isFolder = !item.id && !item.metadata;

      if (isFolder) {
        const nestedFiles = await listFolderRecursively(storagePath);
        results.push(...nestedFiles);
        continue;
      }

      const type = item.metadata?.mimetype || inferMediaTypeFromName(item.name);

      results.push({
        name: item.name,
        storagePath,
        folder: getFolderFromStoragePath(storagePath),
        url: createPublicMediaUrl(supabase, bucket, storagePath),
        type,
        createdAt: item.created_at || item.updated_at || new Date().toISOString(),
        width: item.metadata?.width || null,
        height: item.metadata?.height || null,
        altText: inferAltText(item.name),
      });
    }

    if (data.length < limit) {
      break;
    }

    offset += limit;
  }

  return results;
}

export async function listAllMediaFiles() {
  return listFolderRecursively("");
}

export async function syncMediaRecords(items) {
  await Promise.all(
    items.map((item) =>
      prisma.media.upsert({
        where: { url: item.url },
        update: {
          name: item.name,
          type: item.type,
          storagePath: item.storagePath,
          folder: item.folder,
          width: item.width,
          height: item.height,
        },
        create: {
          name: item.name,
          description: item.altText,
          altText: item.altText,
          url: item.url,
          storagePath: item.storagePath,
          folder: item.folder,
          type: item.type,
          width: item.width,
          height: item.height,
          createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
        },
      })
    )
  );
}

export async function hydrateMediaRecords(items) {
  if (!items.length) {
    return [];
  }

  const records = await prisma.media.findMany({
    where: { url: { in: items.map((item) => item.url) } },
  });

  const recordMap = new Map(records.map((record) => [record.url, record]));

  return items.map((item) => {
    const record = recordMap.get(item.url);
    return {
      id: record?.id || item.storagePath,
      name: record?.name || item.name,
      description: record?.description || item.altText,
      altText: record?.altText || item.altText,
      url: item.url,
      storagePath: record?.storagePath || item.storagePath,
      folder: record?.folder || item.folder,
      type: record?.type || item.type,
      width: record?.width ?? item.width,
      height: record?.height ?? item.height,
      createdAt: record?.createdAt?.toISOString?.() || item.createdAt,
    };
  });
}

export async function getMediaUsageSummary(url) {
  const [homepage, aboutPage, servicesPage, services, whyChooseCards, accreditations, header, footer] = await Promise.all([
    prisma.homepage.findFirst({
      where: {
        OR: [{ heroImages: { has: url } }, { testimonialsImages: { has: url } }, { testimonialsVideoUrl: url }],
      },
      select: { id: true },
    }),
    prisma.aboutPage.findFirst({ where: { heroImageUrl: url }, select: { id: true } }),
    prisma.servicesPage.findFirst({ where: { heroImageUrl: url }, select: { id: true } }),
    prisma.service.findMany({ where: { iconUrl: url }, select: { id: true, title: true }, take: 5 }),
    prisma.whyChooseCard.findMany({ where: { iconUrl: url }, select: { id: true, title: true }, take: 5 }),
    prisma.accreditation.findMany({ where: { logoUrl: url }, select: { id: true, name: true }, take: 5 }),
    prisma.header.findFirst({ where: { logoUrl: url }, select: { id: true } }),
    prisma.footer.findFirst({ where: { logoUrl: url }, select: { id: true } }),
  ]);

  const usages = [];

  if (homepage) usages.push("Homepage content");
  if (aboutPage) usages.push("About page banner");
  if (servicesPage) usages.push("Services page hero image");
  if (header) usages.push("Header logo");
  if (footer) usages.push("Footer logo");
  usages.push(...services.map((item) => `Service card: ${item.title}`));
  usages.push(...whyChooseCards.map((item) => `Why choose card: ${item.title}`));
  usages.push(...accreditations.map((item) => `Accreditation: ${item.name || `Logo ${item.id}`}`));

  return usages;
}
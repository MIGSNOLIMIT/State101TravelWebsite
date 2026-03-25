export const MEDIA_PAGE_SIZE = 24;
export const MEDIA_MAX_IMAGE_SIZE = 8 * 1024 * 1024;
export const MEDIA_MAX_VIDEO_SIZE = 50 * 1024 * 1024;

export const MEDIA_ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

export const MEDIA_ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
];

export const MEDIA_ACCEPTED_TYPES = [...MEDIA_ACCEPTED_IMAGE_TYPES, ...MEDIA_ACCEPTED_VIDEO_TYPES];

export const MEDIA_EXTENSION_BY_TYPE = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
  "image/gif": ["gif"],
  "image/svg+xml": ["svg"],
  "video/mp4": ["mp4"],
  "video/webm": ["webm"],
  "video/ogg": ["ogg"],
  "video/quicktime": ["mov"],
};

export function inferMediaTypeFromName(name = "") {
  const extension = getFileExtension(name);
  const typeEntry = Object.entries(MEDIA_EXTENSION_BY_TYPE).find(([, extensions]) => extensions.includes(extension));
  return typeEntry?.[0] || "application/octet-stream";
}

export function getFileExtension(name = "") {
  const parts = String(name).split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
}

export function isImageType(type = "") {
  return String(type).startsWith("image/");
}

export function isVideoType(type = "") {
  return String(type).startsWith("video/");
}

export function normalizeFolderInput(folder = "general") {
  const cleaned = String(folder || "general")
    .replace(/\\/g, "/")
    .split("/")
    .map((segment) => segment.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-"))
    .filter(Boolean)
    .join("/");

  return cleaned || "general";
}

export function getFolderFromStoragePath(storagePath = "") {
  const normalized = String(storagePath).replace(/\\/g, "/");
  const lastSlash = normalized.lastIndexOf("/");
  return lastSlash >= 0 ? normalized.slice(0, lastSlash) : "";
}

export function sanitizeFileName(name = "file") {
  const extension = getFileExtension(name);
  const baseName = extension ? String(name).slice(0, -(extension.length + 1)) : String(name);
  const safeBase = baseName
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[-\s]+/g, "-")
    .toLowerCase() || "file";

  return extension ? `${safeBase}.${extension}` : safeBase;
}

export function createStoragePath(folder, fileName, now = new Date()) {
  const normalizedFolder = normalizeFolderInput(folder);
  const safeName = sanitizeFileName(fileName);
  const extension = getFileExtension(safeName);
  const year = `${now.getFullYear()}`;
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const uniqueId = crypto.randomUUID();
  const baseName = extension ? safeName.slice(0, -(extension.length + 1)) : safeName;
  return `${normalizedFolder}/${year}/${month}/${uniqueId}-${baseName}${extension ? `.${extension}` : ""}`;
}

export function inferAltText(name = "") {
  const extension = getFileExtension(name);
  const label = extension ? String(name).slice(0, -(extension.length + 1)) : String(name);
  return label.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim() || "Media asset";
}

export function getMediaKind(type = "") {
  if (isImageType(type)) return "image";
  if (isVideoType(type)) return "video";
  return "other";
}

export function validateFileDescriptor(file) {
  const type = file?.type || inferMediaTypeFromName(file?.name);
  const extension = getFileExtension(file?.name);
  const allowedExtensions = MEDIA_EXTENSION_BY_TYPE[type] || [];

  if (!MEDIA_ACCEPTED_TYPES.includes(type)) {
    return "Unsupported file type.";
  }

  if (!allowedExtensions.includes(extension)) {
    return "File extension does not match the allowed media type.";
  }

  const maxSize = isVideoType(type) ? MEDIA_MAX_VIDEO_SIZE : MEDIA_MAX_IMAGE_SIZE;
  if (Number(file?.size || 0) > maxSize) {
    return isVideoType(type)
      ? `Video files must be ${Math.floor(MEDIA_MAX_VIDEO_SIZE / (1024 * 1024))}MB or smaller.`
      : `Image files must be ${Math.floor(MEDIA_MAX_IMAGE_SIZE / (1024 * 1024))}MB or smaller.`;
  }

  return "";
}

export function createPublicMediaUrl(supabaseClient, bucket, storagePath) {
  return supabaseClient.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl;
}

export function getAcceptDescription(accept = "") {
  if (accept === "image/*") {
    return `Images only. Up to ${Math.floor(MEDIA_MAX_IMAGE_SIZE / (1024 * 1024))}MB each.`;
  }
  if (accept === "video/*") {
    return `Videos only. Up to ${Math.floor(MEDIA_MAX_VIDEO_SIZE / (1024 * 1024))}MB each.`;
  }
  return `Images up to ${Math.floor(MEDIA_MAX_IMAGE_SIZE / (1024 * 1024))}MB and videos up to ${Math.floor(MEDIA_MAX_VIDEO_SIZE / (1024 * 1024))}MB.`;
}

export function validateFileAgainstAccept(file, accept = "") {
  if (!accept) return "";
  const type = file?.type || inferMediaTypeFromName(file?.name);
  if (accept === "image/*" && !isImageType(type)) {
    return "Only image files can be uploaded here.";
  }
  if (accept === "video/*" && !isVideoType(type)) {
    return "Only video files can be uploaded here.";
  }
  return "";
}
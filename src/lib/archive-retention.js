export const ARCHIVE_RETENTION_MONTHS = 6;
export const ARCHIVE_CLEANUP_HOUR_UTC = 16;

export function addArchiveRetentionMonths(value) {
  const date = new Date(value);
  date.setMonth(date.getMonth() + ARCHIVE_RETENTION_MONTHS);
  return date;
}

export function getNextArchiveCleanupRun(now = new Date()) {
  const runAt = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), ARCHIVE_CLEANUP_HOUR_UTC, 0, 0, 0),
  );

  if (now >= runAt) {
    runAt.setUTCDate(runAt.getUTCDate() + 1);
  }

  return runAt;
}

export function getArchiveCleanupCutoff(runAt = new Date()) {
  const cutoff = new Date(runAt);
  cutoff.setMonth(cutoff.getMonth() - ARCHIVE_RETENTION_MONTHS);
  return cutoff;
}

export function getArchiveEligibleRunAt(archivedAt) {
  const eligibleAt = addArchiveRetentionMonths(archivedAt);
  const runAt = new Date(
    Date.UTC(
      eligibleAt.getUTCFullYear(),
      eligibleAt.getUTCMonth(),
      eligibleAt.getUTCDate(),
      ARCHIVE_CLEANUP_HOUR_UTC,
      0,
      0,
      0,
    ),
  );

  if (eligibleAt > runAt) {
    runAt.setUTCDate(runAt.getUTCDate() + 1);
  }

  return runAt;
}

export function getNextPermanentDeleteRunAt(archivedAt, now = new Date()) {
  const eligibleRunAt = getArchiveEligibleRunAt(archivedAt);
  const nextCleanupRunAt = getNextArchiveCleanupRun(now);

  return eligibleRunAt > nextCleanupRunAt ? eligibleRunAt : nextCleanupRunAt;
}
export const ARCHIVE_RETENTION_MONTHS = 6;
export const ARCHIVE_CLEANUP_HOUR_UTC = 16;
export const ARCHIVE_CLEANUP_MONTHS_UTC = [0, 6];

export function addArchiveRetentionMonths(value) {
  const date = new Date(value);
  date.setMonth(date.getMonth() + ARCHIVE_RETENTION_MONTHS);
  return date;
}

function buildCleanupRun(year, monthIndex) {
  return new Date(Date.UTC(year, monthIndex, 1, ARCHIVE_CLEANUP_HOUR_UTC, 0, 0, 0));
}

function getFirstCleanupRunOnOrAfter(referenceDate) {
  const year = referenceDate.getUTCFullYear();

  for (const monthIndex of ARCHIVE_CLEANUP_MONTHS_UTC) {
    const runAt = buildCleanupRun(year, monthIndex);
    if (runAt >= referenceDate) {
      return runAt;
    }
  }

  return buildCleanupRun(year + 1, ARCHIVE_CLEANUP_MONTHS_UTC[0]);
}

export function getNextArchiveCleanupRun(now = new Date()) {
  const nextMoment = new Date(now.getTime() + 1);
  return getFirstCleanupRunOnOrAfter(nextMoment);
}

export function getArchiveCleanupCutoff(runAt = new Date()) {
  const cutoff = new Date(runAt);
  cutoff.setMonth(cutoff.getMonth() - ARCHIVE_RETENTION_MONTHS);
  return cutoff;
}

export function getArchiveEligibleRunAt(archivedAt) {
  const eligibleAt = addArchiveRetentionMonths(archivedAt);
  return getFirstCleanupRunOnOrAfter(eligibleAt);
}

export function getNextPermanentDeleteRunAt(archivedAt, now = new Date()) {
  const eligibleRunAt = getArchiveEligibleRunAt(archivedAt);
  const nextCleanupRunAt = getNextArchiveCleanupRun(now);

  return eligibleRunAt > nextCleanupRunAt ? eligibleRunAt : nextCleanupRunAt;
}
DO $$
BEGIN
  ALTER TYPE "ApplicationStatus" ADD VALUE 'APPROVED';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

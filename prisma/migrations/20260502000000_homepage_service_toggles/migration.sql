ALTER TABLE "Homepage"
ADD COLUMN "aboutLogoUrl" TEXT,
ADD COLUMN "aboutMissionTitle" TEXT,
ADD COLUMN "aboutMissionDescription" TEXT,
ADD COLUMN "aboutVisionTitle" TEXT,
ADD COLUMN "aboutVisionDescription" TEXT,
ADD COLUMN "canadaServiceEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "canadaServiceTitle" TEXT NOT NULL DEFAULT 'Canada',
ADD COLUMN "canadaServiceDescription" TEXT NOT NULL DEFAULT 'Expert assistance for Express Entry Permanent Residency. We provide start-to-finish support for a successful application and approval. Clear guidance. Proven success.',
ADD COLUMN "unitedStatesServiceEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "unitedStatesServiceTitle" TEXT NOT NULL DEFAULT 'United States',
ADD COLUMN "unitedStatesServiceDescription" TEXT NOT NULL DEFAULT 'Get comprehensive, start-to-finish assistance for your visa application. Benefit from thorough assessments and personalized pre-interview briefings. We maximize your chances for success.';

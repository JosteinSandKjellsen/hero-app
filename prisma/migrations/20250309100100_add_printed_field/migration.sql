-- Add printed field to LatestHero table with default value false
ALTER TABLE "LatestHero" ADD COLUMN "printed" BOOLEAN NOT NULL DEFAULT false;

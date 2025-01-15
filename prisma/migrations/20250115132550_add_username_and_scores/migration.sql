-- AlterTable
ALTER TABLE "LatestHero" ADD COLUMN     "colorScores" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "userName" TEXT;

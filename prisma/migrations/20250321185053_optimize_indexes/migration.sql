-- DropIndex
DROP INDEX "HeroStats_color_idx";

-- AlterTable
ALTER TABLE "LatestHero" ADD COLUMN     "carousel" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "HeroStats_color_createdAt_idx" ON "HeroStats"("color", "createdAt");

-- CreateIndex
CREATE INDEX "LatestHero_carousel_createdAt_idx" ON "LatestHero"("carousel", "createdAt");

-- CreateIndex
CREATE INDEX "LatestHero_color_idx" ON "LatestHero"("color");

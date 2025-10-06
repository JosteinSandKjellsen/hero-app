-- AlterTable
ALTER TABLE "public"."HeroStats" ADD COLUMN     "sessionId" TEXT;

-- AlterTable
ALTER TABLE "public"."LatestHero" ADD COLUMN     "sessionId" TEXT;

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Session_active_startDate_idx" ON "public"."Session"("active", "startDate");

-- CreateIndex
CREATE INDEX "Session_active_createdAt_idx" ON "public"."Session"("active", "createdAt");

-- CreateIndex
CREATE INDEX "HeroStats_sessionId_color_createdAt_idx" ON "public"."HeroStats"("sessionId", "color", "createdAt");

-- CreateIndex
CREATE INDEX "LatestHero_sessionId_carousel_createdAt_idx" ON "public"."LatestHero"("sessionId", "carousel", "createdAt");

-- CreateIndex
CREATE INDEX "LatestHero_sessionId_color_idx" ON "public"."LatestHero"("sessionId", "color");

-- CreateIndex
CREATE INDEX "LatestHero_sessionId_createdAt_idx" ON "public"."LatestHero"("sessionId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."HeroStats" ADD CONSTRAINT "HeroStats_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LatestHero" ADD CONSTRAINT "LatestHero_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

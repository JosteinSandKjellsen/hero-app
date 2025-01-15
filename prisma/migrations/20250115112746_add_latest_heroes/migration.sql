-- CreateTable
CREATE TABLE "HeroStats" (
    "id" SERIAL NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HeroStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LatestHero" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "personalityType" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "promptStyle" TEXT NOT NULL,
    "basePrompt" TEXT NOT NULL,
    "negativePrompt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LatestHero_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HeroStats_color_idx" ON "HeroStats"("color");

-- CreateIndex
CREATE INDEX "LatestHero_createdAt_idx" ON "LatestHero"("createdAt");

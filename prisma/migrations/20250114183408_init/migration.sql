-- CreateTable
CREATE TABLE "HeroStats" (
    "id" SERIAL NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HeroStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HeroStats_color_idx" ON "HeroStats"("color");

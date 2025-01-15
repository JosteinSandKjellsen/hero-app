/*
  Warnings:

  - A unique constraint covering the columns `[imageId]` on the table `LatestHero` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LatestHero_imageId_key" ON "LatestHero"("imageId");

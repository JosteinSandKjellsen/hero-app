/*
  Warnings:

  - You are about to drop the column `basePrompt` on the `LatestHero` table. All the data in the column will be lost.
  - You are about to drop the column `negativePrompt` on the `LatestHero` table. All the data in the column will be lost.
  - You are about to drop the column `promptStyle` on the `LatestHero` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LatestHero" DROP COLUMN "basePrompt",
DROP COLUMN "negativePrompt",
DROP COLUMN "promptStyle";

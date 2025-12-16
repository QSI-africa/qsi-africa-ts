/*
  Warnings:

  - You are about to drop the column `generatedSummary` on the `VisionSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `recommendedPilots` on the `VisionSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `visionDescription` on the `VisionSubmission` table. All the data in the column will be lost.
  - Added the required column `initialPrompt` to the `VisionSubmission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VisionSubmission" DROP COLUMN "generatedSummary",
DROP COLUMN "recommendedPilots",
DROP COLUMN "visionDescription",
ADD COLUMN     "conversationHistory" JSONB,
ADD COLUMN     "generatedVisionOutput" TEXT,
ADD COLUMN     "initialPrompt" TEXT NOT NULL;

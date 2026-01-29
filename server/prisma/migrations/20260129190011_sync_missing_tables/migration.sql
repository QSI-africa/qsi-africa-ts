/*
  Warnings:

  - You are about to drop the `FrequencyProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PilotProject` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FrequencyProfile" DROP CONSTRAINT "FrequencyProfile_userId_fkey";

-- DropTable
DROP TABLE "FrequencyProfile";

-- DropTable
DROP TABLE "PilotProject";

-- CreateTable
CREATE TABLE "FrequencyScan" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "location" TEXT,
    "personalBeliefs" TEXT,
    "background" TEXT,
    "lifeVision" TEXT,
    "challenges" TEXT,
    "frequencyScore" INTEGER,
    "frequencyArchetype" TEXT,
    "generatedProfile" TEXT,

    CONSTRAINT "FrequencyScan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QsiConcept" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QsiConcept_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmartCityDemonstrator" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PROPOSED',
    "shortDescription" TEXT NOT NULL,
    "fullDescription" TEXT NOT NULL,
    "imageUrl" TEXT,
    "engagementEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmartCityDemonstrator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_QsiConceptToSmartCityDemonstrator" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_QsiConceptToSmartCityDemonstrator_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_QsiConceptToSmartCityDemonstrator_B_index" ON "_QsiConceptToSmartCityDemonstrator"("B");

-- AddForeignKey
ALTER TABLE "FrequencyScan" ADD CONSTRAINT "FrequencyScan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QsiConceptToSmartCityDemonstrator" ADD CONSTRAINT "_QsiConceptToSmartCityDemonstrator_A_fkey" FOREIGN KEY ("A") REFERENCES "QsiConcept"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QsiConceptToSmartCityDemonstrator" ADD CONSTRAINT "_QsiConceptToSmartCityDemonstrator_B_fkey" FOREIGN KEY ("B") REFERENCES "SmartCityDemonstrator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

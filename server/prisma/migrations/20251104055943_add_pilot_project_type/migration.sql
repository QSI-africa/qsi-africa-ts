-- CreateEnum
CREATE TYPE "PilotType" AS ENUM ('CONCEPT', 'FRAMEWORK');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'GENERAL_USER';

-- AlterTable
ALTER TABLE "PilotProject" ADD COLUMN     "type" "PilotType" NOT NULL DEFAULT 'CONCEPT';

-- CreateTable
CREATE TABLE "FrequencyProfile" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "location" TEXT,
    "personalBeliefs" TEXT,
    "background" TEXT,
    "lifeVision" TEXT,
    "challenges" TEXT,
    "generatedProfile" TEXT,

    CONSTRAINT "FrequencyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FrequencyProfile_userId_key" ON "FrequencyProfile"("userId");

-- AddForeignKey
ALTER TABLE "FrequencyProfile" ADD CONSTRAINT "FrequencyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

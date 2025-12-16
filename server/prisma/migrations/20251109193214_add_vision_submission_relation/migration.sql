-- AlterTable
ALTER TABLE "VisionSubmission" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "VisionSubmission_userId_idx" ON "VisionSubmission"("userId");

-- AddForeignKey
ALTER TABLE "VisionSubmission" ADD CONSTRAINT "VisionSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

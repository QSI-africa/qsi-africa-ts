-- AlterTable
ALTER TABLE "HealingSubmission" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "HealingSubmission_userId_idx" ON "HealingSubmission"("userId");

-- AddForeignKey
ALTER TABLE "HealingSubmission" ADD CONSTRAINT "HealingSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

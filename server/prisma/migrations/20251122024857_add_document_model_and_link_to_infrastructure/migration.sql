/*
  Warnings:

  - You are about to drop the column `description` on the `InfrastructureSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `InfrastructureSubmission` table. All the data in the column will be lost.
  - The `status` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "public"."User_passwordResetToken_key";

-- AlterTable
ALTER TABLE "InfrastructureSubmission" DROP COLUMN "description",
DROP COLUMN "status",
ADD COLUMN     "conversationHistory" JSONB,
ADD COLUMN     "generatedSolution" TEXT,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "description" TEXT NOT NULL DEFAULT 'No description provided.',
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'GENERAL_USER';

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "infrastructureSubmissionId" TEXT,
    "userId" TEXT,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Document_infrastructureSubmissionId_key" ON "Document"("infrastructureSubmissionId");

-- CreateIndex
CREATE INDEX "Document_userId_idx" ON "Document"("userId");

-- CreateIndex
CREATE INDEX "InfrastructureSubmission_userId_idx" ON "InfrastructureSubmission"("userId");

-- AddForeignKey
ALTER TABLE "InfrastructureSubmission" ADD CONSTRAINT "InfrastructureSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_infrastructureSubmissionId_fkey" FOREIGN KEY ("infrastructureSubmissionId") REFERENCES "InfrastructureSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

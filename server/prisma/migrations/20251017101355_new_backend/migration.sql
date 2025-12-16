/*
  Warnings:

  - The values [PENDING,ASSIGNED,IN_PROGRESS,CANCELLED] on the enum `TaskStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TaskStatus_new" AS ENUM ('PENDING_ASSIGNMENT', 'PENDING_DESIGN', 'PENDING_DESIGN_APPROVAL', 'PENDING_QUANTIFYING', 'PENDING_FINAL_APPROVAL', 'COMPLETED', 'REJECTED');
ALTER TABLE "public"."Task" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Task" ALTER COLUMN "status" TYPE "TaskStatus_new" USING ("status"::text::"TaskStatus_new");
ALTER TYPE "TaskStatus" RENAME TO "TaskStatus_old";
ALTER TYPE "TaskStatus_new" RENAME TO "TaskStatus";
DROP TYPE "public"."TaskStatus_old";
ALTER TABLE "Task" ALTER COLUMN "status" SET DEFAULT 'PENDING_ASSIGNMENT';
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'ENGINEER';
ALTER TYPE "UserRole" ADD VALUE 'ARCHITECT';
ALTER TYPE "UserRole" ADD VALUE 'QUANTITY_SURVEYOR';

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "status" SET DEFAULT 'PENDING_ASSIGNMENT';

-- CreateTable
CREATE TABLE "TaskDocument" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "filepath" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedById" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,

    CONSTRAINT "TaskDocument_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TaskDocument" ADD CONSTRAINT "TaskDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDocument" ADD CONSTRAINT "TaskDocument_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

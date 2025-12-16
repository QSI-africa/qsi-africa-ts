/*
  Warnings:

  - The `taskId` column on the `AuditLog` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Invoice` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Invoice` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `InvoiceItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `InvoiceItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Task` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `sentToEmail` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `InvoiceItem` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `invoiceId` on the `InvoiceItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `taskId` on the `TaskDocument` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
ALTER TYPE "InvoiceStatus" ADD VALUE 'QUOTATION';

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_taskId_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceItem" DROP CONSTRAINT "InvoiceItem_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "TaskDocument" DROP CONSTRAINT "TaskDocument_taskId_fkey";

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "taskId",
ADD COLUMN     "taskId" INTEGER;

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "submissionDocumentsId" TEXT,
ADD COLUMN     "taskId" INTEGER,
ADD COLUMN     "uploadedById" TEXT;

-- AlterTable
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_pkey",
ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "pdfPath" TEXT,
ADD COLUMN     "sentToEmail" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "InvoiceItem" DROP CONSTRAINT "InvoiceItem_pkey",
ADD COLUMN     "isHealingPackage" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "price" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
ADD COLUMN     "title" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "invoiceId",
ADD COLUMN     "invoiceId" INTEGER NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ADD CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Task" DROP CONSTRAINT "Task_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Task_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "TaskDocument" DROP COLUMN "taskId",
ADD COLUMN     "taskId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "TaskDocument" ADD CONSTRAINT "TaskDocument_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_submissionDocumentsId_fkey" FOREIGN KEY ("submissionDocumentsId") REFERENCES "InfrastructureSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

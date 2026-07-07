-- AlterTable
ALTER TABLE "PanxPost" ADD COLUMN     "mediaType" TEXT,
ADD COLUMN     "tvContentId" TEXT,
ADD COLUMN     "videoUrl" TEXT;

-- AlterTable
ALTER TABLE "PanxReply" ADD COLUMN     "parentId" TEXT;

-- AlterTable
ALTER TABLE "TvContent" ADD COLUMN     "textContent" TEXT;

-- CreateTable
CREATE TABLE "RidePost" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startLocation" TEXT NOT NULL,
    "endLocation" TEXT NOT NULL,
    "departureTime" TIMESTAMP(3) NOT NULL,
    "seats" INTEGER NOT NULL DEFAULT 1,
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RidePost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabEnrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LabEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PanxReplyLike" (
    "id" TEXT NOT NULL,
    "replyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PanxReplyLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PanxBookmark" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PanxBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PanxShare" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PanxShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LabEnrollment_userId_packageId_key" ON "LabEnrollment"("userId", "packageId");

-- CreateIndex
CREATE UNIQUE INDEX "PanxReplyLike_replyId_userId_key" ON "PanxReplyLike"("replyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PanxBookmark_postId_userId_key" ON "PanxBookmark"("postId", "userId");

-- AddForeignKey
ALTER TABLE "RidePost" ADD CONSTRAINT "RidePost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabEnrollment" ADD CONSTRAINT "LabEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabEnrollment" ADD CONSTRAINT "LabEnrollment_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "LabPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PanxPost" ADD CONSTRAINT "PanxPost_tvContentId_fkey" FOREIGN KEY ("tvContentId") REFERENCES "TvContent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PanxReply" ADD CONSTRAINT "PanxReply_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "PanxReply"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PanxReplyLike" ADD CONSTRAINT "PanxReplyLike_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "PanxReply"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PanxReplyLike" ADD CONSTRAINT "PanxReplyLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PanxBookmark" ADD CONSTRAINT "PanxBookmark_postId_fkey" FOREIGN KEY ("postId") REFERENCES "PanxPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PanxBookmark" ADD CONSTRAINT "PanxBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PanxShare" ADD CONSTRAINT "PanxShare_postId_fkey" FOREIGN KEY ("postId") REFERENCES "PanxPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PanxShare" ADD CONSTRAINT "PanxShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

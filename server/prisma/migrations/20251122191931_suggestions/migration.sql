-- CreateTable
CREATE TABLE "InfrastructureSuggestion" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InfrastructureSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisionSuggestion" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisionSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InfrastructureSuggestion_text_key" ON "InfrastructureSuggestion"("text");

-- CreateIndex
CREATE UNIQUE INDEX "VisionSuggestion_text_key" ON "VisionSuggestion"("text");

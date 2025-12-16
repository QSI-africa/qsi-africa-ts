-- CreateTable
CREATE TABLE "HealingPackage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortPreview" TEXT NOT NULL,
    "fee" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "cta" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealingPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealingSuggestion" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealingSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HealingPackage_title_key" ON "HealingPackage"("title");

-- CreateIndex
CREATE UNIQUE INDEX "HealingSuggestion_text_key" ON "HealingSuggestion"("text");

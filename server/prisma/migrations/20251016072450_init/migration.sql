-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfrastructureSubmission" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "contactInfo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InfrastructureSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealingSubmission" (
    "id" TEXT NOT NULL,
    "struggleDescription" TEXT NOT NULL,
    "contactInfo" TEXT NOT NULL,
    "generatedPlan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealingSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisionSubmission" (
    "id" TEXT NOT NULL,
    "visionDescription" TEXT NOT NULL,
    "contactInfo" TEXT NOT NULL,
    "generatedSummary" TEXT,
    "recommendedPilots" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisionSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

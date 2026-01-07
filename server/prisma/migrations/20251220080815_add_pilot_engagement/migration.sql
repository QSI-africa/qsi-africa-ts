-- CreateTable
CREATE TABLE "PilotEngagement" (
    "id" TEXT NOT NULL,
    "pilotKey" TEXT NOT NULL,
    "pilotTitle" TEXT NOT NULL,
    "engagementType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PilotEngagement_pkey" PRIMARY KEY ("id")
);

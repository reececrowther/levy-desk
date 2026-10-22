-- CreateTable
CREATE TABLE "CalculatorLead" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "council" TEXT NOT NULL,
    "levyPence" INTEGER NOT NULL,
    "consentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalculatorLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CalculatorLead_council_idx" ON "CalculatorLead"("council");

-- CreateIndex
CREATE INDEX "CalculatorLead_createdAt_idx" ON "CalculatorLead"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CalculatorLead_email_council_key" ON "CalculatorLead"("email", "council");

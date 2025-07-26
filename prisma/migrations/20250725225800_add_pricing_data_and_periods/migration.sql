-- CreateEnum
CREATE TYPE "PeriodType" AS ENUM ('BASE', 'OPTION');

-- AlterEnum
ALTER TYPE "QuestionStatus" ADD VALUE 'DRAFT';
ALTER TYPE "QuestionStatus" ADD VALUE 'SUBMITTED';
ALTER TYPE "QuestionStatus" ADD VALUE 'POSTED';

-- AlterTable
ALTER TABLE "solicitations" ADD COLUMN "evaluationPeriods" JSONB;

-- AlterTable
ALTER TABLE "questions" ADD COLUMN "datePosted" TIMESTAMP(3),
ADD COLUMN "dateSubmitted" TIMESTAMP(3),
ADD COLUMN "isAnswerDraft" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "isQuestionDraft" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "periods" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PeriodType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "solicitationId" TEXT NOT NULL,

    CONSTRAINT "periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_data" (
    "id" TEXT NOT NULL,
    "basePrice" DECIMAL(65,30),
    "laborHours" INTEGER,
    "laborRate" DECIMAL(65,30),
    "materialCost" DECIMAL(65,30),
    "indirectRate" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clinId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,

    CONSTRAINT "pricing_data_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "clins" ADD COLUMN "periodId" TEXT NOT NULL DEFAULT 'temp_period';

-- CreateIndex
CREATE UNIQUE INDEX "pricing_data_clinId_vendorId_key" ON "pricing_data"("clinId", "vendorId");

-- AddForeignKey
ALTER TABLE "clins" ADD CONSTRAINT "clins_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periods" ADD CONSTRAINT "periods_solicitationId_fkey" FOREIGN KEY ("solicitationId") REFERENCES "solicitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_data" ADD CONSTRAINT "pricing_data_clinId_fkey" FOREIGN KEY ("clinId") REFERENCES "clins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_data" ADD CONSTRAINT "pricing_data_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
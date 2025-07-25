-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('VENDOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "SolicitationStatus" AS ENUM ('OPEN', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PricingModel" AS ENUM ('FFP', 'TM', 'CR');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'AWARDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "QuestionStatus" AS ENUM ('PENDING', 'ANSWERED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'VENDOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyName" TEXT,
    "ueiNumber" TEXT,
    "socioEconomicStatus" TEXT[],

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitations" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "agency" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "questionCutoffDate" TIMESTAMP(3),
    "proposalCutoffDate" TIMESTAMP(3),
    "status" "SolicitationStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clins" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pricingModel" "PricingModel" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "solicitationId" TEXT NOT NULL,

    CONSTRAINT "clins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" TEXT NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'SUBMITTED',
    "submissionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vendorId" TEXT NOT NULL,
    "solicitationId" TEXT NOT NULL,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "status" "QuestionStatus" NOT NULL DEFAULT 'PENDING',
    "dateAsked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateAnswered" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vendorId" TEXT NOT NULL,
    "solicitationId" TEXT NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "solicitations_number_key" ON "solicitations"("number");

-- AddForeignKey
ALTER TABLE "clins" ADD CONSTRAINT "clins_solicitationId_fkey" FOREIGN KEY ("solicitationId") REFERENCES "solicitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_solicitationId_fkey" FOREIGN KEY ("solicitationId") REFERENCES "solicitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_solicitationId_fkey" FOREIGN KEY ("solicitationId") REFERENCES "solicitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

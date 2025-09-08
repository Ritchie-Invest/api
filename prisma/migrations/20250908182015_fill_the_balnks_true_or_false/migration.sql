-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."GameType" ADD VALUE 'FILL_IN_THE_BLANK';
ALTER TYPE "public"."GameType" ADD VALUE 'TRUE_OR_FALSE';

-- AlterTable
ALTER TABLE "public"."RefreshToken" ALTER COLUMN "expiresAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "public"."FillInTheBlankModule" (
    "id" TEXT NOT NULL,
    "firstText" TEXT NOT NULL,
    "secondText" TEXT NOT NULL,
    "blanks" JSONB NOT NULL,
    "gameModuleId" TEXT NOT NULL,

    CONSTRAINT "FillInTheBlankModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TrueOrFalseModule" (
    "id" TEXT NOT NULL,
    "sentence" TEXT NOT NULL,
    "isTrue" BOOLEAN NOT NULL,
    "gameModuleId" TEXT NOT NULL,

    CONSTRAINT "TrueOrFalseModule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FillInTheBlankModule_gameModuleId_key" ON "public"."FillInTheBlankModule"("gameModuleId");

-- CreateIndex
CREATE UNIQUE INDEX "TrueOrFalseModule_gameModuleId_key" ON "public"."TrueOrFalseModule"("gameModuleId");

-- AddForeignKey
ALTER TABLE "public"."FillInTheBlankModule" ADD CONSTRAINT "FillInTheBlankModule_gameModuleId_fkey" FOREIGN KEY ("gameModuleId") REFERENCES "public"."GameModule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrueOrFalseModule" ADD CONSTRAINT "TrueOrFalseModule_gameModuleId_fkey" FOREIGN KEY ("gameModuleId") REFERENCES "public"."GameModule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

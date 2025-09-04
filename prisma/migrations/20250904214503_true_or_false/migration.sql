-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "GameType" ADD VALUE 'FILL_IN_THE_BLANK';
ALTER TYPE "GameType" ADD VALUE 'TRUE_OR_FALSE';

-- CreateTable
CREATE TABLE "TrueOrFalseModule" (
    "questions" JSONB NOT NULL,
    "gameModuleId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "TrueOrFalseModule_gameModuleId_key" ON "TrueOrFalseModule"("gameModuleId");

-- AddForeignKey
ALTER TABLE "TrueOrFalseModule" ADD CONSTRAINT "TrueOrFalseModule_gameModuleId_fkey" FOREIGN KEY ("gameModuleId") REFERENCES "GameModule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

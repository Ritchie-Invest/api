-- AlterEnum
ALTER TYPE "GameType" ADD VALUE 'FILL_IN_THE_BLANK';

-- AlterTable
ALTER TABLE "RefreshToken" ALTER COLUMN "expiresAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "FillInTheBlankModule" (
    "id" TEXT NOT NULL,
    "firstText" TEXT NOT NULL,
    "secondText" TEXT NOT NULL,
    "blanks" JSONB NOT NULL,
    "gameModuleId" TEXT NOT NULL,

    CONSTRAINT "FillInTheBlankModule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FillInTheBlankModule_gameModuleId_key" ON "FillInTheBlankModule"("gameModuleId");

-- AddForeignKey
ALTER TABLE "FillInTheBlankModule" ADD CONSTRAINT "FillInTheBlankModule_gameModuleId_fkey" FOREIGN KEY ("gameModuleId") REFERENCES "GameModule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

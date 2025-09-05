

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

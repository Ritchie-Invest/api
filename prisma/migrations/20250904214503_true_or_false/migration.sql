

ALTER TYPE "GameType" ADD VALUE 'TRUE_OR_FALSE';

CREATE TABLE "TrueOrFalseModule" (
    "questions" JSONB NOT NULL,
    "gameModuleId" TEXT NOT NULL
);

CREATE UNIQUE INDEX "TrueOrFalseModule_gameModuleId_key" ON "TrueOrFalseModule"("gameModuleId");

ALTER TABLE "TrueOrFalseModule" ADD CONSTRAINT "TrueOrFalseModule_gameModuleId_fkey" FOREIGN KEY ("gameModuleId") REFERENCES "GameModule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterEnum
ALTER TYPE "GameType" ADD VALUE 'MATCH';

-- CreateTable
CREATE TABLE "MatchModule" (
    "id" TEXT NOT NULL,
    "instruction" TEXT NOT NULL,
    "matches" JSONB NOT NULL,
    "gameModuleId" TEXT NOT NULL,

    CONSTRAINT "MatchModule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MatchModule_gameModuleId_key" ON "MatchModule"("gameModuleId");

-- AddForeignKey
ALTER TABLE "MatchModule" ADD CONSTRAINT "MatchModule_gameModuleId_fkey" FOREIGN KEY ("gameModuleId") REFERENCES "GameModule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

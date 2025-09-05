-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "GameType" ADD VALUE 'GAUGE';
ALTER TYPE "GameType" ADD VALUE 'ORDER';

-- CreateTable
CREATE TABLE "GaugeModule" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "gameModuleId" TEXT NOT NULL,

    CONSTRAINT "GaugeModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChooseAnOrderModule" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "sentences" JSONB NOT NULL,
    "gameModuleId" TEXT NOT NULL,

    CONSTRAINT "ChooseAnOrderModule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GaugeModule_gameModuleId_key" ON "GaugeModule"("gameModuleId");

-- CreateIndex
CREATE UNIQUE INDEX "ChooseAnOrderModule_gameModuleId_key" ON "ChooseAnOrderModule"("gameModuleId");

-- AddForeignKey
ALTER TABLE "GaugeModule" ADD CONSTRAINT "GaugeModule_gameModuleId_fkey" FOREIGN KEY ("gameModuleId") REFERENCES "GameModule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChooseAnOrderModule" ADD CONSTRAINT "ChooseAnOrderModule_gameModuleId_fkey" FOREIGN KEY ("gameModuleId") REFERENCES "GameModule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

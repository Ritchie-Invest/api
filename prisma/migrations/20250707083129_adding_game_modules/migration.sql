-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('MCQ');

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "gameType" "GameType" NOT NULL DEFAULT 'MCQ';

-- AlterTable
ALTER TABLE "RefreshToken" ALTER COLUMN "expiresAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "GameModule" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "McqModule" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "choices" JSONB NOT NULL,
    "gameModuleId" TEXT NOT NULL,

    CONSTRAINT "McqModule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "McqModule_gameModuleId_key" ON "McqModule"("gameModuleId");

-- AddForeignKey
ALTER TABLE "GameModule" ADD CONSTRAINT "GameModule_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "McqModule" ADD CONSTRAINT "McqModule_gameModuleId_fkey" FOREIGN KEY ("gameModuleId") REFERENCES "GameModule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

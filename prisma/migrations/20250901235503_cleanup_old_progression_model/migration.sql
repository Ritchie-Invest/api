/*
  Warnings:

  - You are about to drop the `Progression` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Progression" DROP CONSTRAINT "Progression_gameModuleId_fkey";

-- DropForeignKey
ALTER TABLE "Progression" DROP CONSTRAINT "Progression_userId_fkey";

-- DropTable
DROP TABLE "Progression";

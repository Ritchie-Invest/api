-- CreateTable
CREATE TABLE "Progression" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameModuleId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Progression_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Progression_userId_gameModuleId_key" ON "Progression"("userId", "gameModuleId");

-- AddForeignKey
ALTER TABLE "Progression" ADD CONSTRAINT "Progression_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progression" ADD CONSTRAINT "Progression_gameModuleId_fkey" FOREIGN KEY ("gameModuleId") REFERENCES "GameModule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

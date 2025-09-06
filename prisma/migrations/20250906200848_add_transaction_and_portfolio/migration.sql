-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('BUY', 'SELL');

-- CreateTable
CREATE TABLE "UserPortfolio" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currency" "Currency" NOT NULL,

    CONSTRAINT "UserPortfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioPosition" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "cash" INTEGER NOT NULL,
    "investments" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "tickerId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "volume" INTEGER NOT NULL,
    "currentTickerPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserPortfolio" ADD CONSTRAINT "UserPortfolio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioPosition" ADD CONSTRAINT "PortfolioPosition_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "UserPortfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "UserPortfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_tickerId_fkey" FOREIGN KEY ("tickerId") REFERENCES "Ticker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

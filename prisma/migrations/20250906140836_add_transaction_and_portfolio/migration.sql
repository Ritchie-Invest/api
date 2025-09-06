-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('Buy', 'Sell');

-- CreateTable
CREATE TABLE "UserPortfolio" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currency" "Currency" NOT NULL,

    CONSTRAINT "UserPortfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioTicker" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "tickerId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "shares" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioTicker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioValue" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "cash" INTEGER NOT NULL,
    "investments" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "tickerId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserPortfolio" ADD CONSTRAINT "UserPortfolio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioTicker" ADD CONSTRAINT "PortfolioTicker_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "UserPortfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioTicker" ADD CONSTRAINT "PortfolioTicker_tickerId_fkey" FOREIGN KEY ("tickerId") REFERENCES "Ticker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioValue" ADD CONSTRAINT "PortfolioValue_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "UserPortfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "UserPortfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_tickerId_fkey" FOREIGN KEY ("tickerId") REFERENCES "Ticker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

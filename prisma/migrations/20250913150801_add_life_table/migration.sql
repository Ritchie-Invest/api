-- CreateTable
CREATE TABLE "public"."Life" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emissionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Life_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Life" ADD CONSTRAINT "Life_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

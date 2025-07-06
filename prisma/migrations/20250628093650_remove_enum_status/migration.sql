/*
  Warnings:

  - A unique constraint covering the columns `[status]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_status_key" ON "Order"("status");

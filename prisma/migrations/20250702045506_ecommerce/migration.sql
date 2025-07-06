/*
  Warnings:

  - You are about to drop the column `shipments` on the `Order` table. All the data in the column will be lost.
  - Added the required column `stripeId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "shipments",
ADD COLUMN     "shippingnumber" TEXT,
ADD COLUMN     "stripeId" TEXT NOT NULL;

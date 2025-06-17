/*
  Warnings:

  - You are about to drop the column `stock` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[title]` on the table `Service` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "AvailabilityStatus" ADD VALUE 'CONTACT_US';

-- AlterTable
ALTER TABLE "Location" ALTER COLUMN "workingHours" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "stock";

-- CreateIndex
CREATE UNIQUE INDEX "Service_title_key" ON "Service"("title");

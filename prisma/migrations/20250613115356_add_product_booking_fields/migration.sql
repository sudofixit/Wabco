/*
  Warnings:

  - Added the required column `requestSource` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "productId" INTEGER,
ADD COLUMN     "quantity" INTEGER,
ADD COLUMN     "requestSource" TEXT NOT NULL,
ADD COLUMN     "serviceId" INTEGER;

-- CreateIndex
CREATE INDEX "Booking_requestSource_idx" ON "Booking"("requestSource");

-- CreateIndex
CREATE INDEX "Booking_productId_idx" ON "Booking"("productId");

-- CreateIndex
CREATE INDEX "Booking_serviceId_idx" ON "Booking"("serviceId");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

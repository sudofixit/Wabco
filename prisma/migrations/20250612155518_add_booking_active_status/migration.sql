-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Booking_isActive_idx" ON "Booking"("isActive");

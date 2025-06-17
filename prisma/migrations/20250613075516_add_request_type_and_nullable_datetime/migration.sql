/*
  Warnings:

  - Added the required column `requestType` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: First add the column with a default value temporarily
ALTER TABLE "Booking" ADD COLUMN "requestType" TEXT NOT NULL DEFAULT 'booking';

-- Update existing records to be 'booking' type (they are all bookings since quotes don't exist yet)
UPDATE "Booking" SET "requestType" = 'booking';

-- Remove the default value since we don't want it going forward
ALTER TABLE "Booking" ALTER COLUMN "requestType" DROP DEFAULT;

-- AlterTable: Make date and time nullable
ALTER TABLE "Booking" 
ALTER COLUMN "bookingDate" DROP NOT NULL,
ALTER COLUMN "bookingTime" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Booking_requestType_idx" ON "Booking"("requestType");

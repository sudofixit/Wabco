-- DropIndex
DROP INDEX "Location_name_key";

-- DropIndex
DROP INDEX "Service_title_key";

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "workingHours" TEXT DEFAULT '9:00 AM - 6:00 PM';

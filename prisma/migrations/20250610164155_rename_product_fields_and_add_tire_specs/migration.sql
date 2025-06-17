/*
  Warnings:

  - Column `name` on the `Product` table has been renamed to `pattern`.
  - Column `tireSize` on the `Product` table has been renamed to `width`.
  - Added optional columns for tire specifications: `diameter`, `loadIndex`, `profile`, `speedRating`.

*/
-- Rename existing columns to preserve data
ALTER TABLE "Product" RENAME COLUMN "name" TO "pattern";
ALTER TABLE "Product" RENAME COLUMN "tireSize" TO "width";

-- Add new optional columns for tire specifications
ALTER TABLE "Product" ADD COLUMN "diameter" TEXT;
ALTER TABLE "Product" ADD COLUMN "loadIndex" TEXT;
ALTER TABLE "Product" ADD COLUMN "profile" TEXT;
ALTER TABLE "Product" ADD COLUMN "speedRating" TEXT;
